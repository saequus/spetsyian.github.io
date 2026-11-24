---
title: Running a RAG pipeline on Nebius Token Factory: embeddings, Qdrant and an honest eval loop
description: How I build RAG on Nebius Token Factory: Qwen3 embeddings, Qdrant, chunking, grounded answers with citations, a small eval set, and cost/latency knobs.
seoTitle: RAG on Nebius Token Factory: A Practical Guide
date: 2025-12-09
tags: [RAG, Nebius, Qdrant, Embeddings, LLMOps, Python]
---

Most RAG tutorials stop at "it answered my question". That is the easy 20%. The other 80% is making retrieval predictable: knowing which chunks came back and why, keeping latency and cost boring, and having a number that tells you whether yesterday's change made things better or worse.

In this post I walk through the RAG setup I would build today on **Nebius Token Factory** — the inference platform Nebius launched in November 2025 as the successor to Nebius AI Studio. It serves open-weight models (Qwen, Llama, DeepSeek, gpt-oss and others) behind an OpenAI-compatible API, which means the standard `openai` Python SDK works unchanged and switching providers later is a config change, not a rewrite.

The stack:

- **Nebius Token Factory** for embeddings and generation
- **Qdrant** as the vector store (with a note on pgvector)
- **Python + FastAPI** for the service
- A **small, hand-labelled eval set** so changes are measured, not vibed

## Why Token Factory for RAG

Three practical reasons:

1. **OpenAI-compatible endpoints.** Point the SDK at `https://api.tokenfactory.nebius.com/v1/` and use `client.embeddings.create` and `client.chat.completions.create` as usual.
2. **Open-weight models with EU hosting.** The models I use below are served from the `eu-north1` region (Finland), which makes data-residency conversations with European clients easier.
3. **Cheap embeddings.** At the time of writing, `Qwen/Qwen3-Embedding-8B` is listed at about $0.01 per million input tokens. Re-embedding a whole corpus after changing your chunking strategy stops being a budget discussion.

One housekeeping note if you used AI Studio before: the endpoint moved to `api.tokenfactory.nebius.com`, and Nebius asks everyone to switch to **project-based API keys** — old keys stop working after 31 January 2026. Create a key per project so usage is tracked per project from day one.

## Setup

```bash
pip install openai qdrant-client tiktoken fastapi uvicorn
export NEBIUS_API_KEY="..."   # project-scoped key from the Token Factory console
docker run -p 6333:6333 qdrant/qdrant
```

A single client covers both embeddings and chat:

```python
import os
from openai import OpenAI

nebius = OpenAI(
    base_url="https://api.tokenfactory.nebius.com/v1/",
    api_key=os.environ["NEBIUS_API_KEY"],
)

EMBED_MODEL = "Qwen/Qwen3-Embedding-8B"           # 4096-dim, multilingual
CHAT_MODEL = "Qwen/Qwen3-30B-A3B-Instruct-2507"   # fast MoE, 262K context
```

I pick a small, fast mixture-of-experts model for generation on purpose. In RAG the model's job is mostly to read the context carefully and quote it; a giant model mostly adds latency. If the eval set later shows reasoning failures, I move up to something like `Qwen/Qwen3-235B-A22B-Instruct-2507` for that route only.

## Chunking: boring, deterministic, measurable

Chunking is where most retrieval quality is won or lost, and it is the step people tune last. My defaults:

- Split on **document structure first** (headings, sections), then on token count.
- **~400–600 tokens per chunk with ~15% overlap.** Small enough to be specific, big enough to carry context.
- Keep **metadata** with every chunk: source, title, section path, updated date. You need it for filters and citations.
- Give every chunk a **stable ID** derived from its content, so re-ingesting the same document is idempotent.

```python
import hashlib
import re
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")  # approximate token counts are fine here

def split_sections(markdown: str) -> list[tuple[str, str]]:
    """Split on H1-H3 headings and keep the heading as section context."""
    parts = re.split(r"(?m)^(#{1,3} .+)$", markdown)
    sections, heading = [], ""
    for part in parts:
        if re.match(r"^#{1,3} ", part):
            heading = part.lstrip("# ").strip()
        elif part.strip():
            sections.append((heading, part.strip()))
    return sections

def chunk_document(doc_id: str, title: str, markdown: str,
                   max_tokens: int = 500, overlap: int = 75) -> list[dict]:
    chunks = []
    for heading, text in split_sections(markdown):
        tokens = enc.encode(text)
        start = 0
        while start < len(tokens):
            window = tokens[start:start + max_tokens]
            body = enc.decode(window)
            chunk_id = hashlib.sha1(f"{doc_id}:{heading}:{body}".encode()).hexdigest()
            chunks.append({
                "id": chunk_id,
                "text": f"{title} — {heading}\n\n{body}",  # prepend context
                "doc_id": doc_id,
                "title": title,
                "section": heading,
            })
            if start + max_tokens >= len(tokens):
                break
            start += max_tokens - overlap
    return chunks
```

Prepending the document title and section heading to the chunk text is a cheap trick that noticeably helps retrieval for short, ambiguous chunks ("Limits", "Pricing"). Anthropic's write-up on contextual retrieval (linked below) takes the same idea further by generating a short context sentence per chunk with an LLM.

## Embedding and indexing in Qdrant

`Qwen3-Embedding-8B` returns 4096-dimensional vectors. That matters for your vector store choice:

- **Qdrant** handles 4096 dimensions without any special setup.
- **pgvector** can store them, but its HNSW and IVFFlat indexes support up to 2,000 dimensions for `vector` and 4,000 for `halfvec`. You would need binary quantization, subvector indexing or reduced dimensions. The Token Factory embeddings endpoint accepts a `dimensions` parameter; Qwen3 embeddings are trained to support shorter outputs, but verify the returned length before you rely on it.

Here I use Qdrant with cosine distance and batch the embedding calls:

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
import uuid

qdrant = QdrantClient(url="http://localhost:6333")
COLLECTION = "docs"

def ensure_collection(dim: int = 4096) -> None:
    if not qdrant.collection_exists(COLLECTION):
        qdrant.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )

def embed(texts: list[str]) -> list[list[float]]:
    resp = nebius.embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in sorted(resp.data, key=lambda d: d.index)]

def index_chunks(chunks: list[dict], batch_size: int = 64) -> None:
    ensure_collection()
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        vectors = embed([c["text"] for c in batch])
        qdrant.upsert(
            collection_name=COLLECTION,
            points=[
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_URL, c["id"])),
                    vector=v,
                    payload={k: c[k] for k in ("text", "doc_id", "title", "section")},
                )
                for c, v in zip(batch, vectors)
            ],
        )
```

Deterministic point IDs (`uuid5` of the chunk hash) mean a re-run updates points instead of duplicating them — the single most useful property when you re-ingest often.

## Retrieval and grounded generation

Retrieval is a top-k vector search plus a relevance floor. Generation gets a strict prompt: answer only from the numbered sources, cite them, and say so when the answer is not there.

```python
SYSTEM_PROMPT = """You answer questions using only the numbered sources provided.
Rules:
- Cite sources inline like [1] or [2][3].
- If the sources do not contain the answer, say "I don't know based on the provided documents."
- Do not use outside knowledge. Be concise."""

def retrieve(question: str, k: int = 6, min_score: float = 0.35) -> list[dict]:
    query_vector = embed([question])[0]
    hits = qdrant.query_points(
        collection_name=COLLECTION, query=query_vector, limit=k, with_payload=True
    ).points
    return [
        {**hit.payload, "score": hit.score}
        for hit in hits
        if hit.score >= min_score
    ]

def answer(question: str) -> dict:
    sources = retrieve(question)
    if not sources:
        return {"answer": "I don't know based on the provided documents.", "sources": []}
    context = "\n\n".join(f"[{i + 1}] {s['text']}" for i, s in enumerate(sources))
    completion = nebius.chat.completions.create(
        model=CHAT_MODEL,
        temperature=0.1,
        max_tokens=600,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Sources:\n{context}\n\nQuestion: {question}"},
        ],
    )
    return {
        "answer": completion.choices[0].message.content,
        "sources": [{"title": s["title"], "section": s["section"], "score": s["score"]} for s in sources],
        "usage": completion.usage.model_dump() if completion.usage else None,
    }
```

The `min_score` threshold is not universal — it depends on the embedding model and your data. Calibrate it on the eval set below: plot scores for relevant vs irrelevant chunks and pick the value that removes most junk without dropping true hits.

A few things I add once the basics work:

- **Hybrid search.** Dense vectors miss exact identifiers (error codes, SKUs, function names). Qdrant supports combining a sparse/BM25-style vector with the dense one and fusing results; it is the first upgrade I reach for.
- **Reranking.** Retrieve 20–30 candidates, rerank, keep the top 5. Token Factory exposes a rerank endpoint in its API reference, or you can run a cross-encoder yourself.
- **Metadata filters.** If users belong to tenants or permissions differ per document, filter in the vector query — never in the prompt.

## Serving it with FastAPI

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Ask(BaseModel):
    question: str

@app.post("/ask")
def ask(body: Ask) -> dict:
    return answer(body.question)
```

In production I would also stream tokens to the client, set explicit timeouts and retries on the OpenAI client (`OpenAI(timeout=30, max_retries=3)`), and log every request with its retrieved chunk IDs, scores, model, token usage and latency. Those logs become your next eval set.

## Evaluate before you tune

Before touching chunk sizes or prompts, I write **30–50 real questions** with the document (or section) that should answer them. It takes an afternoon and pays for itself the first time someone suggests "let's just increase k".

```python
import json, statistics, time

def hit_rate_at_k(eval_path: str, k: int = 6) -> dict:
    rows = [json.loads(line) for line in open(eval_path)]
    hits, latencies = 0, []
    for row in rows:
        t0 = time.perf_counter()
        results = retrieve(row["question"], k=k, min_score=0.0)
        latencies.append(time.perf_counter() - t0)
        if any(r["doc_id"] == row["expected_doc_id"] for r in results):
            hits += 1
    return {
        "hit_rate@k": hits / len(rows),
        "p50_retrieval_s": statistics.median(latencies),
        "n": len(rows),
    }
```

Retrieval hit rate tells you whether the right context arrives at all. For the generation side — is the answer faithful to the sources, does it address the question — I use LLM-as-judge metrics in the style of Ragas. That deserves its own post, so I'll cover production evaluation separately.

## Cost and latency: where the knobs are

Rough rules I use when estimating:

| Knob | Effect on cost | Effect on latency | Effect on quality |
| --- | --- | --- | --- |
| Smaller chat model | Lower | Lower | Usually fine for grounded QA; check on evals |
| Fewer, better chunks (rerank) | Lower prompt tokens | Rerank adds a call | Usually higher |
| Larger k without rerank | Higher | Higher | Often lower (distractors) |
| Shorter max_tokens | Lower | Lower | Fine with a "be concise" prompt |
| Caching embeddings for repeated queries | Lower | Lower | Neutral |

Embedding cost is almost a rounding error at these prices; the prompt tokens you send to the chat model dominate. Six 500-token chunks is a ~3,000-token prompt per question, so trimming context with reranking is the main cost lever. Check the Token Factory model catalog for current per-token prices before you quote numbers to anyone — they change.

## What I'd watch in production

- **Retrieval drift.** New documents change the score distribution. Re-run the eval set on every re-index.
- **Empty-retrieval rate.** How often the threshold returns nothing is a useful signal for content gaps.
- **Citation coverage.** Answers with no `[n]` citations are a red flag for hallucination.
- **Per-project usage.** Project-scoped keys on Token Factory make it easy to attribute spend per environment or feature.

## Wrapping up

The pattern is simple: an OpenAI-compatible endpoint for embeddings and generation, a vector store that fits your dimensionality, deterministic chunking with metadata, a strict grounded prompt — and an eval set from day one. Nebius Token Factory makes the model side easy to swap and cheap to iterate on; the real work is in the retrieval and the measurement around it.

## Further reading

- [Nebius Token Factory — API introduction](https://docs.tokenfactory.nebius.com/api-reference/introduction)
- [Token Factory embeddings API reference](https://docs.tokenfactory.nebius.com/api-reference/inference/create-embeddings)
- [Token Factory cookbook (GitHub)](https://github.com/nebius/token-factory-cookbook)
- [Qwen3-Embedding-8B model card](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Qdrant — hybrid and multi-stage queries](https://qdrant.tech/documentation/concepts/hybrid-queries/)
- [pgvector — dimension limits and indexing options](https://github.com/pgvector/pgvector)
- [Anthropic — Introducing contextual retrieval](https://www.anthropic.com/news/contextual-retrieval)
