# 1. Page Decisions

Product and design decisions captured per route. This document summarizes choices made during the liquid-glass redesign session (navigation, footer, layout, and page-specific content).

For implementation detail on nav/footer animation, see [3-chrome-animation.md](./3-chrome-animation.md). For visual language, see [2-design-guidelines.md](./2-design-guidelines.md).

---

## Site-wide

Decisions that apply to every page unless a route overrides them.

### Layout

| Decision | Detail |
|----------|--------|
| Desktop side insets | **220px minimum** left and right (`--layout-inset` / `--layout-inset-right`). Mobile keeps safe-area–aware padding (~1.25rem). |
| Content width | Pages use the full width inside those insets — no additional narrow max-width column. `content-narrow` and `content-wide` both span 100% of the padded area. |
| Pre-footer breathing room | **320px** spacer (`.page-footer-spacer`) appended in `SiteShell` after page content on every route. Gives room for the floating footer chrome to unfold without overlapping content. |
| Page shell | `SiteShell` wraps all routes: video background, `GlassNav`, `PageEnter` content, footer spacer, `GlassFooter`. |

### Chrome (navigation + footer)

| Decision | Detail |
|----------|--------|
| Desktop nav width | Expanded nav and footer are **50vw**, centered. |
| Nav collapse (desktop) | Scroll-driven “water drop” animation: items hide right→left, shell morphs to a **perfect circle** at the **left** inset with a **burger** (`Menu`) icon. Unfold is the reverse (circle→pill, items left→right). |
| Footer collapse (desktop) | Mirror of nav, bottom-anchored: default **circle** at the **right** inset with a **footer** icon (`PanelBottom`); unwraps to full footer near the page bottom. |
| Scroll-anchored timing | No timer gap between “last item hidden” and “shell becomes circle.” Progress is tied to scroll position in an **8–328px** transition zone (see chrome spec). |
| Per-page toggle | `SiteShell` prop `scrollNavCollapse` controls **both** nav and footer. `true` (default) = scroll animation on. `false` = chrome stays fully expanded at all scroll positions. |
| Mobile nav | Floating home + menu FABs and drawer — no desktop collapse animation. Footer stays expanded. |
| Active tab indicator | Sliding pill behind the active route; animates from the previously active item to the newly clicked one (water-drop flow). |
| Page entrance | `PageEnter` staggers fade-up on route change (headers, sections, cards, timeline entries). Spacer and `aria-hidden` elements are excluded. |
| Reduced motion | Under `prefers-reduced-motion: reduce`, chrome and entrance animations are disabled. |

### Shared animation constants

- Phase duration: **0.82s**
- Item stagger: **0.065s** (nav); footer uses the same helpers
- Unfold speed multiplier: **4×** (slower item reveal during scroll-unfold)
- Transition zone: **320px** after an **8px** threshold

---

## /

Homepage — personal introduction, not a card-based layout.

### Content & layout

| Decision | Detail |
|----------|--------|
| Hero image | `/assets/img/session-ava-2025.jpg` in `.hero-glass` plaque (inspired by aurō / SF references). Final size **260px** wide (reduced from an initial 520px request). |
| Tagline block | `.glass-statement` copy is **left-aligned** (not centered). |
| Structure | Text-only sections inside `.home-page` — no content cards. Typography ~10% larger than other content pages. |
| Sections | Hero → glass statement → Now → Identity → Friendcatcher (links to `/work/`, `/projects/`, `/links/`, social). |
| Content class | Default `content-narrow` (full width within 220px insets). |

### Chrome & motion

| Decision | Detail |
|----------|--------|
| Scroll chrome | **Enabled** — nav collapses on scroll down, unfolds near top; footer collapses away from bottom, expands at bottom. |
| Footer spacer | Provided globally by `SiteShell` (320px); homepage no longer declares its own spacer. |
| Entrance animation | All major sections animate in on load / navigation. |

### Bugs fixed (session)

- Email dropdown styling brought in line with liquid-glass treatment.
- `useLayoutEffect` SSR warning resolved via `useIsomorphicLayoutEffect` in `PageEnter` and `GlassNav`.

---

## /work

Professional history and skills.

### Content & layout

| Decision | Detail |
|----------|--------|
| Header | Reuses `.links-page-intro` pattern: title, “Last updated” meta, lead paragraph from `PROFILE`. |
| Timeline | `WORK_HISTORY` entries as **glass blocks** (`.liquid-glass.liquid-glass--tint.glass-block.work-entry`) in `.work-timeline`. |
| Education & skills | Separate glass blocks below the timeline. |
| Content class | Default `content-narrow`. |

### Chrome & motion

| Decision | Detail |
|----------|--------|
| Scroll chrome | **Enabled**. |
| Entrance animation | Header + each timeline article + trailing glass blocks stagger in via `PageEnter`. |
| Tab indicator | Active when on `/work/`; pill slides from previous tab on navigation. |

---

## /projects

Portfolio grid of companies and products.

### Content & layout

| Decision | Detail |
|----------|--------|
| Cards | **Plain cards** (`.project-card`) — dark fill, border, shadow. **No** liquid-glass effect (explicitly removed). |
| Grid | `.card-grid` — 1 column mobile, **2 columns** from 640px+. Same positioning model as Favorite Links. |
| Images | `ProjectCard` uses responsive WebP `picture` sources where available. |
| Content class | Default `content-narrow`. |

### Chrome & motion

| Decision | Detail |
|----------|--------|
| Scroll chrome | **Enabled**. |
| Entrance animation | Header + each project card in the grid. |

---

## /links

Curated “favorite links” — thinkers, meta-knowledge, professional links.

### Content & layout

| Decision | Detail |
|----------|--------|
| Cards | `.content-card` — **no glass tint**. Opaque dark cards with border and shadow (not `liquid-glass--tint`). Hold text only; no extra orange wash. |
| Grid | `.card-grid` with **2 cards per row** on desktop (same grid as Projects). |
| Content class | **`content-wide`** — uses full padded width (same inset rules as other pages; “wide” means no extra narrowing). |
| Categories | Thinkers (Naval), LessWrong, Professional links — emoji section headings kept as visual anchors. |

### Chrome & motion

| Decision | Detail |
|----------|--------|
| Scroll chrome | **Disabled** (`scrollNavCollapse={false}`). Nav and footer remain fully expanded while scrolling. Temporary decision “for now,” same policy as Calendar. |
| Entrance animation | Header + card-grid articles still use `PageEnter` stagger. |

### Rationale

Favorite Links is a reading-heavy reference page. Keeping chrome permanently expanded avoids distraction while browsing long card content. Animation may be re-enabled once the page layout is stable.

---

## /calendar

Book-a-call booking surface.

### Content & layout

| Decision | Detail |
|----------|--------|
| Booking UI | `BookCallBooking` loaded with `dynamic(..., { ssr: false })` — client-only calendar widget. |
| Content class | **`content-booking`** — full width inside content-layer padding for the booking panel. |
| Header | `.calendar-page-intro` with short lead copy; booking panel excluded from entrance stagger (`book-call-panel`). |

### Chrome & motion

| Decision | Detail |
|----------|--------|
| Scroll chrome | **Disabled** (`scrollNavCollapse={false}`). First page to get the per-route toggle; motivated by embedded calendar interaction and short-page behavior. |
| Entrance animation | Page intro animates; booking panel loads without entrance stagger. |

### Rationale

An interactive date/time picker needs predictable, always-visible chrome. Collapsing nav/footer would compete with the booking UI near the bottom of the viewport.

---

## Navigation animation — session evolution (cross-page)

Chronological decisions that shaped the current chrome system (applies to all pages except Calendar and Links today).

1. **Initial ask** — Nav squeezes into a left “drop” on scroll; burger in drop (not droplet icon); links hide before shell folds; reverse on scroll-up in the last ~80px zone.
2. **Timing** — Settled on **0.82s** phases; items disappear **one by one from the right**; unfold reveals **one by one from the left**.
3. **Scroll-up jump** — Fixed by adding an `'unfolding'` phase and preventing `is-nav-expanded` from overriding scroll-driven unfold styles.
4. **Items visible too early** — Items stay hidden during shell morph until scroll progress allows per-item reveal.
5. **Unfold too fast** — **4× multiplier** on unfold item timing; shell keeps **measured height** during morph (no thin-line collapse).
6. **Drop shape** — Perfect **circle** (`border-radius: 50%`), not an organic droplet blob.
7. **Timer gap on collapse** — Replaced timer-based “wait then circle” with **scroll-anchored** progress across a 320px zone.
8. **All items hiding at once** — CSS specificity fix: `is-nav-expanded` no longer forces all items visible during `is-nav-transitioning`.
9. **Active tab indicator offset** — After unfold, pill was ~10px left and slightly high; fixed with layout-coordinate measurement gated on item reveal.
10. **Per-page disable** — `scrollNavCollapse` on `SiteShell`; Calendar first, then Links.
11. **Footer parity** — Same fold/unfold system bottom-anchored; shared `lib/glassChromeTransition.ts`; docs renamed to `3-chrome-animation.md`.
12. **Layout pass** — Side insets **40px → 220px**; footer drop icon **Mail → PanelBottom**; global 320px pre-footer spacer.

---

## Open questions / future decisions

| Topic | Notes |
|-------|-------|
| Re-enable chrome on `/links/` | When card layout and content are final. |
| Footer drop icon | Currently `PanelBottom` (lucide). Replace if a custom brand icon is added. |
| Work page cards | Still use tinted glass; Projects/Links use plain cards — intentional hierarchy or future alignment TBD. |
| `content-wide` vs `content-narrow` | Both are full-width inside insets today; naming may be simplified later. |

---

*Last updated: July 2026 — reflects decisions through the chrome animation and layout session.*