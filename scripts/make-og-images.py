"""Generate 1200x630 Open Graph images (default + one per blog post).

One-off helper, not part of the Next.js build. Requires Pillow and the
Syne / Manrope variable fonts. Run from the repo root:

    python3 scripts/make-og-images.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
AVATAR = ROOT / "public/assets/img/session-ava-2025.jpg"
OUT = ROOT / "public/assets/img/og"
SYNE = "/usr/share/fonts/truetype/sand-box/google/Syne/Syne-VariableFont_wght.ttf"
MANROPE = "/usr/share/fonts/truetype/sand-box/google/Manrope/Manrope-VariableFont_wght.ttf"

W, H = 1200, 630

CARDS = {
    "default": ("Viachaslau Spetsyian", "AI Engineer · LLM apps, RAG, agents & LLMOps", "saequus.com"),
    "rag-pipeline-nebius-token-factory": (
        "Running a RAG pipeline on Nebius Token Factory",
        "Embeddings, Qdrant, retrieval and evals — a practical guide",
        "saequus.com/blog",
    ),
    "evaluating-rag-llm-apps-in-production": (
        "Evaluating RAG and LLM apps in production",
        "Eval sets, LLM-as-judge, CI regression gates and tracing",
        "saequus.com/blog",
    ),
    "tool-calling-agent-structured-outputs-guardrails": (
        "A tool-calling agent with structured outputs and guardrails",
        "Function calling on the xAI API, retries, budgets and tracing",
        "saequus.com/blog",
    ),
}


def font(path, size, weight):
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = f"{cur} {w}".strip()
        if draw.textlength(test, font=fnt) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def background():
    img = Image.new("RGB", (W, H), "#0a0a0c")
    glow = Image.new("RGB", (W, H), "#0a0a0c")
    g = ImageDraw.Draw(glow)
    g.ellipse((-200, -260, 700, 520), fill="#3a2316")
    g.ellipse((700, 300, 1500, 1000), fill="#24170f")
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    return Image.blend(img, glow, 0.9)


def make(slug, title, subtitle, foot):
    img = background()
    d = ImageDraw.Draw(img)
    avatar = ImageOps.fit(Image.open(AVATAR).convert("RGB"), (300, 360), centering=(0.5, 0.35))
    mask = Image.new("L", avatar.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *avatar.size), radius=36, fill=255)
    img.paste(avatar, (W - 300 - 80, (H - 360) // 2), mask)

    text_w = W - 300 - 80 - 80 - 80
    tsize = 64 if slug == "default" else 52
    tfont = font(SYNE, tsize, 700)
    sfont = font(MANROPE, 30, 500)
    ffont = font(MANROPE, 26, 600)
    y = 120
    for line in wrap(d, title, tfont, text_w):
        d.text((80, y), line, font=tfont, fill="#f4f4f6")
        y += int(tsize * 1.18)
    y += 18
    for line in wrap(d, subtitle, sfont, text_w):
        d.text((80, y), line, font=sfont, fill="#b9bccb")
        y += 42
    d.text((80, H - 90), foot, font=ffont, fill="#ff8a55")
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"{slug}.jpg", quality=86, optimize=True, progressive=True)


def hero():
    """Downscaled avatar for the home hero (shown at ~260px wide)."""
    im = Image.open(AVATAR).convert("RGB")
    im.thumbnail((560, 680))
    im.save(ROOT / "public/assets/img/session-ava-2025-560.webp", quality=82, method=6)
    im.save(ROOT / "public/assets/img/session-ava-2025-560.jpg", quality=84, optimize=True, progressive=True)


if __name__ == "__main__":
    for slug, (t, s, f) in CARDS.items():
        make(slug, t, s, f)
    hero()
    print("ok")
