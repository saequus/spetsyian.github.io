---
title: Evaluating RAG and LLM apps in production: eval sets, LLM-as-judge and CI regression gates
description: A practical playbook for LLM evals: offline eval sets, retrieval and Ragas-style metrics, calibrated LLM-as-judge, CI regression gates and tracing.
seoTitle: Evaluating RAG & LLM Apps in Production
date: 2026-02-17
tags: [LLM Evaluation, RAG, LLMOps, Ragas, Langfuse, CI/CD]
---

Every LLM feature I have seen go wrong in production went wrong the same way: a prompt tweak, a new model version or a chunking change shipped because "it looked better on a few examples", and nobody noticed the cases it broke until users did.

Traditional software has unit tests. LLM systems need the same discipline, adapted to outputs that are non-deterministic and rarely exactly right or wrong. This post is the evaluation setup I use and recommend: what to measure, how to build the dataset, how far to trust an LLM judge, and how to wire it into CI and production tracing.

## Three layers of evaluation

I think about evals in three layers, from cheapest to most realistic:

1. **Deterministic checks** — fast, free, run on every commit. Does the output parse? Does it cite a source? Did the agent call the expected tool? Is the answer under the length limit?
2. **Offline eval set with model-graded metrics** — a curated dataset scored with retrieval metrics and LLM-as-judge metrics. Runs in CI on changes to prompts, models or retrieval.
3. **Online evaluation** — traces from real traffic, user feedback, sampled judge scoring, and humans reviewing the worst cases. This is where new failure modes come from.

Most teams start at layer 3 (looking at logs) and jump to layer 2 (a fancy framework). The highest return is usually layer 1 plus a small, honest layer 2.

## Building the eval set

The dataset matters more than the metric. Mine is a JSONL file in the repo, versioned like code:

```json
{"id": "q-0017", "question": "What is the refund window for annual plans?", "expected_doc_ids": ["billing-policy"], "reference_answer": "30 days from purchase for annual plans.", "tags": ["billing", "lookup"]}
{"id": "q-0042", "question": "Can I export data to a competitor's format?", "expected_doc_ids": [], "reference_answer": null, "tags": ["out-of-scope"]}
```

How I fill it:

- **Start with 30–50 real questions** — from support tickets, sales calls or internal users, not invented by the engineer who wrote the prompt.
- **Cover the distribution, then the edges.** Mostly common questions, plus multi-hop questions, ambiguous ones, and questions the corpus *cannot* answer (the model should say so).
- **Tag everything.** Aggregate scores hide regressions; per-tag scores reveal them ("lookup is fine, out-of-scope dropped from 90% to 60%").
- **Grow it from production.** Every bad answer a user flags becomes a new row. After a few months the eval set is the most valuable artifact in the project.

Synthetic generation (asking an LLM to write questions from your documents) is useful for bootstrapping coverage, but I always review generated rows and keep them tagged as synthetic so I can see whether they behave differently from real ones.

## Retrieval metrics: measure the R before the G

If retrieval brings back the wrong context, no prompt will save the answer. Retrieval metrics are cheap and deterministic, so compute them first:

```python
def retrieval_metrics(rows: list[dict], retrieve, k: int = 5) -> dict:
    hits, rr_sum, scored = 0, 0.0, 0
    for row in rows:
        expected = set(row["expected_doc_ids"])
        if not expected:
            continue  # out-of-scope questions are judged elsewhere
        scored += 1
        ranked = [r["doc_id"] for r in retrieve(row["question"], k=k)]
        if expected & set(ranked):
            hits += 1
        for rank, doc_id in enumerate(ranked, start=1):
            if doc_id in expected:
                rr_sum += 1 / rank
                break
    return {"hit_rate@k": hits / scored, "mrr@k": rr_sum / scored, "n": scored}
```

Hit rate tells you whether the right document shows up at all; MRR tells you whether it shows up near the top, which matters once you start trimming context to save tokens.

## Answer metrics: Ragas-style, LLM-graded

For the generated answer I care about four questions. These map closely to the metrics popularised by the Ragas paper and library:

| Question | Metric name (Ragas-style) | Needs reference answer? |
| --- | --- | --- |
| Is every claim supported by the retrieved context? | Faithfulness | No |
| Does the answer address the question? | Answer / response relevancy | No |
| Is the retrieved context relevant and well-ranked? | Context precision | Sometimes |
| Does the context contain what the reference answer needs? | Context recall | Yes |

You can use Ragas or DeepEval directly — both are solid and save time. I still like to understand the mechanics, so here is a minimal faithfulness judge with structured output. It extracts claims from the answer and checks each against the context, which is far more stable than asking for a single 1–10 score:

```python
import json
from pydantic import BaseModel

class ClaimVerdict(BaseModel):
    claim: str
    supported: bool
    evidence: str | None

class FaithfulnessResult(BaseModel):
    verdicts: list[ClaimVerdict]

JUDGE_PROMPT = """You are grading an answer for faithfulness to the provided context.
1. Split the ANSWER into atomic factual claims.
2. For each claim, decide if the CONTEXT explicitly supports it.
3. Quote the supporting evidence, or null if unsupported.
Ignore style. Do not use outside knowledge."""

def faithfulness(client, model: str, context: str, answer: str) -> float:
    resp = client.chat.completions.create(
        model=model,
        temperature=0,
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "faithfulness", "schema": FaithfulnessResult.model_json_schema()},
        },
        messages=[
            {"role": "system", "content": JUDGE_PROMPT},
            {"role": "user", "content": f"CONTEXT:\n{context}\n\nANSWER:\n{answer}"},
        ],
    )
    result = FaithfulnessResult.model_validate_json(resp.choices[0].message.content)
    if not result.verdicts:
        return 1.0
    return sum(v.supported for v in result.verdicts) / len(result.verdicts)
```

Structured outputs matter here: a judge that returns free text needs fragile parsing, and parse failures quietly turn into missing scores.

## How far to trust an LLM judge

LLM-as-judge is a measurement instrument, and instruments need calibration. The research (the MT-Bench / "Judging LLM-as-a-Judge" paper is the standard reference) shows strong judges agree with humans reasonably well, but with known biases: position bias, verbosity bias and self-preference.

What I do in practice:

- **Label 50–100 examples by hand** and measure judge agreement with those labels before trusting the metric. If agreement is poor, fix the rubric, not the threshold.
- **Prefer binary or claim-level decisions** over 1–10 scales. "Is this claim supported: yes/no" is much more consistent than "rate faithfulness".
- **Use a different, strong model as judge** than the one generating answers, and pin its version. A judge that silently changes is a moving ruler.
- **Set temperature to 0 and keep the rubric in version control** next to the prompts it grades.
- **Read the failures.** Aggregate scores are for gating; the individual low-scoring examples are where you learn something.

## Regression tests in CI

Once metrics exist, wire them into CI so a prompt change gets the same treatment as a code change. I keep two tiers: deterministic checks on every pull request, and the model-graded suite when files under `prompts/`, `retrieval/` or the model config change (or nightly).

```python
# tests/test_rag_eval.py
import json
import pytest
from app.rag import answer, retrieve
from evals.metrics import faithfulness, retrieval_metrics
from evals.clients import judge_client, JUDGE_MODEL

# answer() returns {"answer": str, "sources": list, "context": str}
ROWS = [json.loads(l) for l in open("evals/dataset.jsonl")]
BASELINE = json.load(open("evals/baseline.json"))

def test_retrieval_does_not_regress():
    m = retrieval_metrics(ROWS, retrieve, k=5)
    assert m["hit_rate@k"] >= BASELINE["hit_rate@k"] - 0.02

@pytest.mark.parametrize("row", [r for r in ROWS if r["expected_doc_ids"]], ids=lambda r: r["id"])
def test_answers_cite_sources(row):
    out = answer(row["question"])
    assert "[" in out["answer"], "answer has no citations"

@pytest.mark.llm_eval
def test_faithfulness_above_threshold():
    scores = []
    for row in ROWS:
        out = answer(row["question"])
        if out["sources"]:
            scores.append(faithfulness(judge_client, JUDGE_MODEL, out["context"], out["answer"]))
    mean = sum(scores) / len(scores)
    assert mean >= BASELINE["faithfulness"] - 0.03, f"faithfulness {mean:.2f}"
```

A few rules make this workable:

- **Compare against a stored baseline with a tolerance**, not an absolute target. LLM outputs are noisy; a 1-point drop is noise, a 10-point drop is a regression.
- **Update the baseline deliberately** in the same pull request that improves the system, so the history shows why the bar moved.
- **Cache generations by (input, prompt version, model)** so re-running the suite on unrelated changes does not cost money.
- **Post a per-tag summary as a PR comment.** Reviewers should see "out-of-scope: 0.92 → 0.71" next to the prompt diff.

## Tracing: the bridge between offline and online

Offline evals only cover the questions you thought of. Tracing is how you find the rest. Every request should produce a trace with:

- input, retrieved chunk IDs and scores, final prompt (or prompt version), output
- model name and version, token usage, latency per step, cost
- user feedback when available (thumbs, edits, escalations)

Tools like **Langfuse** and **LangSmith** give you this out of the box, and both support attaching scores to traces — so the same faithfulness function can run on a sample of production traffic. OpenTelemetry's GenAI semantic conventions are worth following if you already have an observability stack and want LLM spans next to your service spans.

```python
from langfuse import observe

@observe()
def answer_with_trace(question: str) -> dict:
    sources = retrieve(question)
    result = generate(question, sources)  # nested @observe() spans show up as children
    return result
```

The loop I aim for: production traces → flag low scores and negative feedback → review → add the interesting ones to the eval set → fix → CI proves the fix and guards against regressions.

## A minimal checklist

If you take one thing from this post, take this list:

1. A versioned eval set of real questions, tagged, including ones that should be refused.
2. Retrieval hit rate and MRR computed on every retrieval change.
3. A claim-level faithfulness judge with structured output, calibrated against human labels.
4. CI that compares against a baseline with tolerances and reports per-tag deltas.
5. Tracing on every request, with a path from bad traces back into the eval set.

None of this is glamorous, but it is what lets you change models, prompts and retrieval with confidence — and in a field where a better model ships every few months, the ability to switch safely is the competitive advantage.

## Further reading

- [Ragas — available metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/)
- [Ragas: Automated Evaluation of Retrieval Augmented Generation (paper)](https://arxiv.org/abs/2309.15217)
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (paper)](https://arxiv.org/abs/2306.05685)
- [DeepEval — getting started](https://deepeval.com/docs/getting-started)
- [Langfuse — observability overview](https://langfuse.com/docs/observability/overview)
- [OpenTelemetry semantic conventions for generative AI](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [Hamel Husain — Your AI product needs evals](https://hamel.dev/blog/posts/evals/)
