# 3. Chrome Animation Specification (Navigation & Footer)

Desktop navigation (`GlassNav`) and footer (`GlassFooter`, ≥768px) share a scroll-driven collapse/unfold system. Mobile uses floating FABs + drawer for nav; footer stays expanded on small screens.

## Terminology

| Term | Meaning |
|------|---------|
| **Expanded** | Full-width pill (50vw, centered), all chrome items visible |
| **Collapsed circle** | Compact circle (“drop”). Nav: **left** inset + burger. Footer: **right** inset + footer icon |
| **Shell** | Glass container (background, border-radius, width) independent of inner content |
| **Chrome** | Inner row of links/icons |
| **Transition zone** | Scroll range where progress moves between expanded and circle |

## Layout

| Chrome | Expanded | Collapsed circle |
|--------|------------|------------------|
| Nav | `50vw` centered | `50%` circle at `left: var(--layout-inset)` |
| Footer | `50vw` centered | `50%` circle at `right: var(--layout-inset-right)` |

Site content uses 220px side insets (`--layout-inset` / `--layout-inset-right`).

## Shared constants

| Constant | Value |
|----------|-------|
| `CHROME_EXPAND_THRESHOLD` | 8px |
| `CHROME_TRANSITION_ZONE_PX` | 320px |
| `CHROME_TRANSITION_END` | 328px (`8 + 320`) |
| `CHROME_UNFOLD_ANIM_MULTIPLIER` | 4 |
| `--nav-unfold-phase-duration` | `0.82s × 4` = 3.28s per item pop |

Shared helpers: `lib/glassChromeTransition.ts`

## Navigation (top-anchored)

### Progress

Distance = `scrollY` from **top**.

```
transitionProgress = clamp((scrollY - 8) / 320, 0, 1)
```

| `transitionProgress` | State |
|----------------------|-------|
| `0` | Fully expanded (also when `scrollY ≤ 8` or pinned) |
| `0 → 0.5` | Items hide (down) / reveal (up), right → left on collapse |
| `0.5 → 1` | Shell morphs to/from circle |
| `1` | Collapsed circle (`scrollY ≥ 328`) |

### Nav chrome items (9, left → right)

0 Home · 1–4 text tabs · 5 divider · 6 GitHub · 7 Email · 8 Calendar

Item `i` hides when `itemHideProgress >= (9 - i) / 9`.  
Item `i` reveals when `linkRevealProgress >= i / 9`.

### Nav-only features

- Sliding active-tab indicator
- Click circle → pinned expand (`scrollPinned`) with time-based item reveal
- Burger icon in collapsed circle

## Footer (bottom-anchored)

### Progress

Distance = pixels from **bottom** of page:

```
distanceFromBottom = max(0, scrollHeight - viewportHeight - scrollY)
transitionProgress = clamp((distanceFromBottom - 8) / 320, 0, 1)
```

| `transitionProgress` | State |
|----------------------|-------|
| `0` | Fully expanded (within 8px of bottom) |
| `0 → 0.5` | Shell morphs circle → full width (scrolling toward bottom) |
| `0.5 → 0` | Items reveal left → right |
| `1` | Collapsed circle (≥328px from bottom) |

**Default:** away from bottom → footer is a **circle** (drop).  
**At bottom:** circle unwraps into full footer.

### Footer chrome items (4, left → right)

| Index | Element |
|-------|---------|
| 0 | LinkedIn |
| 1 | Instagram |
| 2 | GitHub |
| 3 | Email |

Collapse (scrolling away from bottom): items hide **right → left** (Email first).  
Expand (scrolling to bottom): shell widens first, then items pop **left → right**.

### Footer geometry

- Circle: `border-radius: 50%`, diameter `--footer-shell-height`
- Shell height fixed during morph (measured via `ResizeObserver`)
- Mail icon shown in collapsed circle (decorative; links live in expanded chrome)

### Short pages

If `scrollHeight ≤ viewport` (no scroll), footer stays **expanded**.

## Per-page enable / disable

| API | Default | Effect |
|-----|---------|--------|
| `SiteShell` `scrollNavCollapse` | `true` | Toggles **both** nav and footer scroll chrome |

When `false`: nav and footer stay fully expanded at all scroll positions.

**Disabled:** `/calendar/` and `/links/` (`scrollNavCollapse={false}`).

## State machines

### Nav phases

`open` · `transition` · `drop` — driven by `scrollY`.

### Footer

No named phase state; classes derived from `transitionProgress` and `distanceFromBottom`.

## CSS classes

### Navigation

| Class | When |
|-------|------|
| `is-nav-drop` | `transitionProgress ≥ 1` |
| `is-nav-transitioning` | Item half (`0 < p < 0.5`) |
| `is-nav-unfolding` | Shell half (`0.5 < p < 1`) |
| `is-nav-expanded` | Full-width shell |
| `is-nav-item-unfold-hidden` / `is-nav-item-unfold-revealed` | Per-item scroll anchors |

### Footer

| Class | When |
|-------|------|
| `is-footer-drop` | `transitionProgress ≥ 1` |
| `is-footer-transitioning` | Item half |
| `is-footer-unfolding` | Shell half |
| `is-footer-expanded` | Full-width shell |
| `is-chrome-item-unfold-hidden` / `is-chrome-item-unfold-revealed` | Per-item (footer) |

## Key files

| File | Role |
|------|------|
| `lib/glassChromeTransition.ts` | Shared progress + item class helpers |
| `components/GlassNav.tsx` | Top chrome |
| `components/GlassFooter.tsx` | Bottom chrome |
| `components/SiteShell.tsx` | `scrollNavCollapse` prop |
| `styles/globals.css` | Phases, keyframes |

## Keyframes

**`nav-item-hide`** / **`nav-item-show`** — used by both nav and footer item transitions.

## Bugs and problems (nav)

### All items hiding at once during scroll collapse (fixed)

`is-nav-expanded` forced all items visible during `is-nav-transitioning`. Fixed by excluding transitioning state.

### Timer gap before circle morph (fixed)

Replaced timer-based collapse with scroll-anchored progress.

### Active tab indicator offset after scroll-unfold (fixed)

Use layout coordinates; measure only when active item is revealed.

## Future development

- Validate nav and footer changes against this spec
- Scroll-driven thresholds for both; time-based stagger only for nav click-expand
- Perfect circles only (`border-radius: 50%`), fixed shell height during morph
- Test: slow scroll through zones, short pages, calendar disabled, `prefers-reduced-motion`

## Reduced motion

Under `prefers-reduced-motion: reduce`: disable transitions/animations; show final state immediately.