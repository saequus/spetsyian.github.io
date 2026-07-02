# 3. Navigation Animation Specification

Desktop navigation (`GlassNav`, ≥768px) uses a scroll-driven collapse/unfold system with a pinned-click override. Mobile uses floating FABs and a drawer; this document covers **desktop only**.

## Terminology

| Term | Meaning |
|------|---------|
| **Expanded** | Full-width pill bar (50vw, centered), all items visible |
| **Collapsed circle** | Left-aligned circular button with burger icon. Called “drop” in conversation, but **visually a perfect circle** — not a teardrop/blob shape |
| **Shell** | The glass pill container (background, border-radius, width) independent of link content |
| **Chrome** | Inner flex row containing nav items and the tab indicator |
| **Transition zone** | Scroll range between expanded and collapsed circle; drives both collapse and unfold |

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
open ◄──────────────────────────────────────────► drop
  ▲          transition (scroll-anchored)            ▲
  │ scrollY ≤ 8          8 … 328           scrollY ≥ 328 │
  └────────────────────────────────────────────────────┘
```

| Phase | Description |
|-------|-------------|
| `open` | Fully expanded, interactive (`scrollY ≤ 8` or pinned) |
| `transition` | In the 320px zone; progress driven purely by scroll position |
| `drop` | Circle at left inset; burger face visible; chrome hidden (`scrollY ≥ 328`) |

**Pinned expand:** clicking the collapsed circle sets `scrollPinned`, jumps to `open`, and runs a **time-based** item reveal (not scroll-driven).

## Per-page enable / disable

Scroll collapse/unfold can be turned off per page. When disabled, desktop nav stays **fully expanded** at all scroll positions (no transition zone, no circle).

| API | Default | Purpose |
|-----|---------|---------|
| `SiteShell` prop `scrollNavCollapse` | `true` | Page-level toggle |
| `GlassNav` prop `scrollNavCollapse` | `true` | Passed from shell |

**Disabled pages (current):**

- `/calendar/` — `scrollNavCollapse={false}` on `SiteShell`

To disable on another page, pass `scrollNavCollapse={false}` to that page’s `SiteShell`.

## Scroll rules

| Constant | Value | Purpose |
|----------|-------|---------|
| `SCROLL_COLLAPSE_THRESHOLD` | 8px | Top of transition zone |
| `TRANSITION_ZONE_PX` | 320px | Length of scroll-anchored transition |
| `TRANSITION_END` | 328px | `8 + 320`; fully collapsed below this |

| Scroll mode | Condition |
|-------------|-----------|
| `expanded` | `scrollY ≤ 8` OR pinned |
| `transition` | `8 < scrollY < 328` |
| `drop` | `scrollY ≥ 328` |

Scrolling down clears pin when `scrollY > 8`.

### Transition progress

```
transitionProgress = clamp((scrollY - 8) / 320, 0, 1)
```

| `transitionProgress` | Meaning |
|----------------------|---------|
| `0` | Fully expanded |
| `0 → 0.5` | Items hide (collapse) or reappear (unfold) |
| `0.5 → 1` | Shell morphs to/from circle |
| `1` | Fully collapsed circle |

## Timing constants

| Constant | Value |
|----------|-------|
| `--nav-phase-duration` | 0.82s |
| `--nav-item-stagger` | 0.065s |
| `NAV_CHROME_ITEM_COUNT` | 9 |
| `NAV_UNFOLD_ANIM_MULTIPLIER` | 4 |
| `--nav-unfold-phase-duration` | `0.82s × 4` = 3.28s per item pop on scroll-unfold |

Click-expand item stagger delay for index `i`: `i × 0.065s` (leftmost first), plus shell gap when expanding from circle click.

## Milestone: scroll-anchored collapse (scroll down)

**Requirement:** No timer gap between “all items gone” and circle morph. Items hide at scroll anchors; circle conversion starts only after the **last** item anchor (Home, index `0`).

### Phase A — Item hide (`transitionProgress` 0 → 0.5, scroll 8px → 168px)

- Shell stays full width and **full height**
- `itemHideProgress = min(1, transitionProgress × 2)`
- Item `i` hidden when:

```
itemHideProgress >= (9 - i) / 9
```

| Index | Hides at progress | Scroll Y (approx.) |
|-------|-------------------|--------------------|
| 8 Calendar | ≥ 1/9 | 43px |
| 7 Email | ≥ 2/9 | 79px |
| … | … | … |
| 0 Home | ≥ 9/9 = 1.0 | 168px (last anchor) |

Order: **right → left**. Scroll provides stagger — not CSS `animation-delay`, not a post-hide timer.

### Phase B — Shell to circle (`transitionProgress` 0.5 → 1, scroll 168px → 328px)

- Starts only after last item anchor (`transitionProgress ≥ 0.5`)
- `shellCollapseProgress = max(0, transitionProgress × 2 - 1)`
- Width: `50vw` → circle diameter; position: centered → left inset
- Height fixed at `--nav-shell-height`; border-radius: pill → `50%`
- Chrome hidden; burger appears at `transitionProgress = 1`

## Unfold sequence (scroll up)

Same `transitionProgress` formula — scrolling up **decreases** progress (symmetric reverse).

### Phase A — Shell widen (`transitionProgress` 1 → 0.5)

- Circle morphs back to full-width pill (`shellExpandProgress = 1 - shellCollapseProgress`)
- Items remain hidden until progress drops below `0.5`

### Phase B — Item reveal (`transitionProgress` 0.5 → 0)

- `linkRevealProgress = max(0, 1 - transitionProgress × 2)`
- Item `i` reveals when `linkRevealProgress >= i / 9`
- Each pop uses `--nav-unfold-phase-duration` (3.28s); scroll provides stagger left → right

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
- Hidden during `drop`, shell morph (`transitionProgress ≥ 0.5`), and until the **active** item’s scroll anchor is visible
- Shown once the active item is past its hide/reveal threshold

## Click expand from circle

1. User taps burger circle
2. `scrollPinned = true` → mode becomes `expanded`
3. Phase → `open` immediately
4. `is-nav-reveal-items` + `is-nav-reveal-after-shell` classes
5. Items reveal left → right with CSS stagger (time-based, not scroll)

## CSS classes reference

| Class | Applied when |
|-------|----------------|
| `is-nav-drop` | `transitionProgress ≥ 1` |
| `is-nav-transitioning` | `0 < transitionProgress < 0.5` (item hide/reveal half) |
| `is-nav-unfolding` | `0.5 < transitionProgress < 1` (shell morph half) |
| `is-nav-expanded` | Full-width shell (`progress ≤ 0.5` or pinned) |
| `is-nav-item-unfold-hidden` | Item past hide threshold or not yet revealed |
| `is-nav-item-unfold-revealed` | Item reveal pop (unfold second half) |
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

### All items hiding at once during scroll collapse (fixed)

**Symptom:** Every nav item vanished together instead of one-by-one at scroll anchors.

**Root cause:** During `is-nav-transitioning`, the nav also had `is-nav-expanded`. This rule forced **all** `.nav-chrome-item` elements to `opacity: 1`, overriding per-item `is-nav-item-unfold-hidden`.

**Fix:** Exclude `is-nav-transitioning` from the expanded “all items visible” rule; style visible/hidden items separately during the item phase.

### Timer gap before circle morph on collapse (fixed)

**Symptom:** Noticeable delay between all nav items disappearing and the bar becoming a circle when scrolling down.

**Root cause:** Collapse used a time-based `hiding-items` phase (`nav-item-hide` animation + `setTimeout` ~1.4s) before entering `drop`. Scroll position was ignored during item hide.

**Fix:** Unified scroll-anchored `transitionProgress` over 320px. Items hide at per-index anchors in the first half; shell morphs only after `transitionProgress ≥ 0.5` (last anchor = Home). Removed collapse timer.

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
- Prefer scroll-driven thresholds for collapse and unfold; reserve time-based stagger for click-expand only
- Do not reintroduce organic/blob border-radius on collapsed state
- Keep shell height constant across collapse → circle → unfold → expanded
- Test: slow scroll through 320px zone, fast flick scroll, click-expand while scrolled, resize during animation, `prefers-reduced-motion`

## Reduced motion

Under `prefers-reduced-motion: reduce`: disable transitions/animations; show final state immediately.