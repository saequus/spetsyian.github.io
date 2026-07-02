# 3. Navigation Animation Specification

Desktop navigation (`GlassNav`, ≥768px) uses a scroll-driven collapse/unfold system with a pinned-click override. Mobile uses floating FABs and a drawer; this document covers **desktop only**.

## Terminology

| Term | Meaning |
|------|---------|
| **Expanded** | Full-width pill bar (50vw, centered), all items visible |
| **Collapsed circle** | Left-aligned circular button with burger icon. Called “drop” in conversation, but **visually a perfect circle** — not a teardrop/blob shape |
| **Shell** | The glass pill container (background, border-radius, width) independent of link content |
| **Chrome** | Inner flex row containing nav items and the tab indicator |
| **Unfold zone** | Top of page scroll range where scroll-up reverses collapse |

## Layout

- Nav wrap: `50vw`, centered (`left: 50%`, `translateX(-50%)`)
- Collapsed circle: `left: var(--layout-inset)` (40px on desktop)
- Footer uses the same 50vw rail
- Site content uses 40px side insets (`--layout-inset`)

## Nav chrome items (9 total, left → right)

Index drives animation order:

| Index | Element |
|-------|---------|
| 0 | Home (icon) |
| 1 | Favorite Links |
| 2 | Work |
| 3 | Projects |
| 4 | Blog (external) |
| 5 | Divider |
| 6 | GitHub (icon) |
| 7 | Email (popover) |
| 8 | Calendar (icon) |

Burger button (mobile-only in drawer context) is hidden on desktop.

## State machine

```
open ──scroll down──► hiding-items ──timer──► drop
  ▲                        │                    │
  │                        │                    │ scroll up (in unfold zone)
  │                        │                    ▼
  └──── scrollY ≤ 8 ─── unfolding ◄────────────┘
```

| Phase | Description |
|-------|-------------|
| `open` | Fully expanded, interactive |
| `hiding-items` | Shell stays expanded; items hide right → left |
| `drop` | Circle at left inset; burger face visible; chrome hidden |
| `unfolding` | Scroll-up reverse; shell widens, then items appear left → right |

**Pinned expand:** clicking the collapsed circle sets `scrollPinned`, jumps to `open`, and runs a **time-based** item reveal (not scroll-driven).

## Scroll rules

| Constant | Value | Purpose |
|----------|-------|---------|
| `SCROLL_COLLAPSE_THRESHOLD` | 8px | At or above → eligible for collapse (unless pinned) |
| `UNFOLD_ZONE_PX` | 320px | Scroll-up reverse only applies when `scrollY < 320` |

| Scroll mode | Condition |
|-------------|-----------|
| `expanded` | `scrollY ≤ 8` OR pinned |
| `unfolding` | scrolling up AND `scrollY < 320` |
| `drop` | otherwise (scrolled down past threshold) |

Scrolling down clears pin when `scrollY > 8`.

## Timing constants

| Constant | Value |
|----------|-------|
| `--nav-phase-duration` | 0.82s |
| `--nav-item-stagger` | 0.065s |
| `NAV_CHROME_ITEM_COUNT` | 9 |
| `NAV_UNFOLD_ANIM_MULTIPLIER` | 4 |
| `--nav-unfold-phase-duration` | `0.82s × 4` = 3.28s per item pop on scroll-unfold |

Collapse item stagger delay for index `i`: `(8 - i) × 0.065s` (rightmost first).

Click-expand item stagger delay for index `i`: `i × 0.065s` (leftmost first), plus shell gap when expanding from circle click.

## Collapse sequence (scroll down)

1. **`open` → `hiding-items`** — shell remains full width and **full height**
2. Items animate out **right → left** (`nav-item-hide`, staggered)
3. After `(N - 1) × stagger + phase-duration` (~1.4s), **`drop`**
4. Shell morphs to **circle** at left inset; burger icon fades in

## Unfold sequence (scroll up)

Unfold progress: `1 - scrollY / 320` (0 at bottom of zone, 1 at top).

Split into two halves:

### Phase A — Shell widen (progress 0 → 0.5, scroll 320px → 160px)

- Width interpolates: circle diameter → `50vw`
- Position interpolates: left inset → centered
- **Height fixed** at measured expanded height (`--nav-shell-height`)
- **Padding fixed** at `0.5rem 1.1rem` (no thin-line shrink)
- Border-radius: `50%` → pill (`9999px` interpolated)
- Chrome visible but **all items hidden**

### Phase B — Item reveal (progress 0.5 → 1.0, scroll 160px → 0px)

`linkProgress = max(0, unfoldProgress × 2 - 1)`

Item `i` reveals when:

```
linkProgress >= i / 9
```

Each item runs `nav-item-show` over `--nav-unfold-phase-duration` (3.28s). **Scroll position provides stagger** — not CSS `animation-delay`. Items pop one-by-one from left.

Reversing scroll within the zone hides items again in reverse order.

## Collapsed circle geometry

- **Shape:** `border-radius: 50%` (perfect circle)
- **Size:** `--nav-shell-height` (measured from expanded nav via `ResizeObserver`)
- **Default fallback:** 54px (`3.375rem`)
- Width = height always in collapsed state
- Burger icon centered in circle (`glass-nav-drop-face`)

The word “drop” refers to the collapsed **state name**, not a water-drop silhouette.

## Shell height preservation

`--nav-shell-height` is captured while nav is expanded (`open`, `hiding-items`, or `unfolding`) and reused for:

- Collapsed circle diameter
- Unfold min-height on wrap and nav
- Width interpolation start value during unfold

The bar must **never** compress vertically into a thin line during unfold.

## Active tab indicator

- Sliding orange pill behind active route (Home, text tabs, Calendar)
- Position measured relative to `.glass-nav-chrome` (not outer nav — avoids padding offset)
- Uses layout coordinates (`offsetLeft` / `offsetTop`), not transform-aware `getBoundingClientRect()`, so unfold keyframes do not skew the pill
- Hidden during `drop`, `hiding-items`, shell-only unfold, and until the **active** item’s scroll-reveal threshold is met
- Shown once the active item is revealed during scroll-unfold

## Click expand from circle

1. User taps burger circle
2. `scrollPinned = true` → mode becomes `expanded`
3. Phase → `open` immediately
4. `is-nav-reveal-items` + `is-nav-reveal-after-shell` classes
5. Items reveal left → right with CSS stagger (time-based, not scroll)

## CSS classes reference

| Class | Applied when |
|-------|----------------|
| `is-nav-drop` | Phase `drop` |
| `is-nav-collapsing` | Phase `hiding-items` |
| `is-nav-unfolding` | Phase `unfolding` or scroll mode `unfolding` |
| `is-nav-expanded` | Fully expanded shell (not during scroll-unfold) |
| `is-nav-item-unfold-hidden` | Scroll-unfold: item not yet reached |
| `is-nav-item-unfold-revealed` | Scroll-unfold: item threshold crossed |
| `is-nav-reveal-items` | Click-expand item animation |
| `is-nav-reveal-after-shell` | Click-expand: wait for shell before items |

## Key files

| File | Role |
|------|------|
| `components/GlassNav.tsx` | State machine, scroll logic, per-item unfold classes, height measurement |
| `styles/globals.css` | Phases, keyframes (`nav-item-hide`, `nav-item-show`), layout variables |

## Keyframes

**`nav-item-hide`** (collapse): opacity 1 → 0, translateX(0) → 14px, scale down, blur.

**`nav-item-show`** (unfold / click-expand): opacity 0 → 1, translateX(-14px) → 0, scale up, blur clear.

## Bugs and problems

### Active tab indicator offset after scroll-unfold (fixed)

**Symptom:** After returning from the collapsed circle to full navigation, the orange pill behind the active tab sat ~10px left and slightly above the item.

**Root cause (two compounding issues):**

1. **Transform-aware measurement** — `getBoundingClientRect()` includes CSS transforms. During scroll-unfold, hidden items use `translateX(-14px) scale(0.94)` (`is-nav-item-unfold-hidden`). The indicator was measured while the active item still carried that transform (or mid-`nav-item-show` animation), so coordinates were shifted left and up.

2. **Premature measurement** — The indicator became visible when `shellProgress >= 1` (shell fully widened), even if the active item’s reveal threshold had not been reached. That forced layout reads on items still in the hidden transform state.

A previous margin-expansion hack (`marginLeft` subtracted from `left`) also pulled icon targets a few pixels further left.

**Fix:**

- Measure with **layout coordinates** (`offsetLeft` / `offsetTop` chain + `offsetWidth` / `offsetHeight`), which ignore transforms on the target.
- Show and measure the indicator only when `isActiveNavItemRevealed` is true for the current route.
- Re-run layout on scroll (`scrollY`, `linkProgress`) and after phase settles to `open` (double `requestAnimationFrame`).

**Regression check:** Slow-scroll unfold with each tab active; indicator should track the settled item, not the in-flight transform.

## Future development notes

- All nav animation changes should be validated against this spec
- Prefer scroll-driven thresholds for unfold; reserve time-based stagger for click-expand only
- Do not reintroduce organic/blob border-radius on collapsed state
- Keep shell height constant across collapse → circle → unfold → expanded
- Test: slow scroll through 320px zone, fast flick scroll, click-expand while scrolled, resize during animation, `prefers-reduced-motion`

## Reduced motion

Under `prefers-reduced-motion: reduce`: disable transitions/animations; show final state immediately.