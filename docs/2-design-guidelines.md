# 2. Design Guidelines

This document defines the visual and interaction language for the personal site, grounded in the **glass-style design** references provided in `tempfolder/`.

## 1. Design Philosophy

The aesthetic should feel **premium, contemplative, and tactile** — like beautifully crafted physical objects (thick glass, warm lighting, soft shadows) translated into interface.

Key principles:
- **Depth through layering** rather than flat surfaces or heavy shadows.
- **Light as material**: Glass catches, bends, and emits light.
- **Warmth in darkness**: Deep, gentle blacks paired with mild, luminous orange to create an inviting yet sophisticated mood.
- **Restraint and craft**: Every glow, radius, and gradient is intentional. Avoid clutter.
- **Performance-aware**: Effects must feel high-end but remain performant (use `backdrop-filter` judiciously, respect `prefers-reduced-motion`).

## 2. Color Palette

Dominant palette must stay true to **mild orange + gentle black**.

### Core Colors

| Role                  | Value          | Usage                                      | Notes |
|-----------------------|----------------|--------------------------------------------|-------|
| Gentle Black (bg)     | `#010103` or `#161316` | Main page backgrounds, glass containers | Deep, soft, almost velvet black. Avoid pure #000. |
| Deep Warm Brown       | `#2C211C` / `#453027` | Secondary surfaces, subtle gradients | From reference palettes. |
| Mild Orange (primary accent) | `#FF6D29`     | Highlights, bottom glows, links, active states | Warm, energetic but not harsh. Primary "light source". |
| Soft Orange Glow      | `#FF8F5A` or similar | Inner gradients, hover states | Lighter, more luminous. |
| Warm Cream / Light    | `#F5E8C8` / `#E8D6A0` | Text on dark glass, subtle highlights | High contrast but warm. |
| Neutral Light         | `#BABABA`     | Secondary text, borders | Muted support. |
| Pure White            | `#FFFFFF`     | Highest contrast text or icons | Use sparingly. |

### Gradient Philosophy (from references)

Glass surfaces rarely use solid fills. Prefer:
- **Vertical light gradients** (dark at top → luminous warm orange/cream at bottom)
- **Diagonal or radial "lit from within"** gradients
- **Rim lighting**: subtle top-edge bright line, fading to dark

Example from `aurō` reference and `SF` icon:
- Top: deep brown-black with cool edge highlight
- Bottom third: strong emission of mild orange light

## 3. Liquid Glass / Glassmorphism System

This is the signature treatment. All major surfaces and interactive elements should use variations of the glass language demonstrated in the reference images.

### Core Characteristics (observed in tempfolder images)

1. **Form**
   - Large, soft border-radius (typically 20–36px, or fully pill-shaped for nav/buttons)
   - Slightly "thick" appearance — not paper-thin

2. **Material**
   - Very low opacity dark or tinted fill
   - `backdrop-filter: blur(8px–20px)` (stronger than current implementation in some cases)
   - Subtle surface texture or micro-grain where appropriate (as seen on the aurō card)

3. **Lighting Model**
   - **Top rim light**: soft white or cool highlight along upper edge (see `::before` gradient in current CSS)
   - **Bottom emission**: primary "light source" in mild orange. This is the most distinctive element — the glass appears to glow from its lower half.
   - **Inner bevel / thickness**: gradient that suggests the glass has volume
   - **Outer soft glow**: box-shadow or filter in the orange accent color for emphasis (especially on icons/cards)

4. **Borders & Edges**
   - Often borderless or extremely subtle
   - When borders exist: soft, low-contrast or gradient (1px)
   - Use masking techniques (as in current `.liquid-glass::before`) to create clean inner highlights without extra elements

5. **Depth & Elevation**
   - Cards and controls "float" above the dark void
   - Subtle drop shadows combined with self-illumination

### Reference Examples

- **aurō card** (`5fd660f1e5db99b2a05d1a481f77be5f.jpg`): Perfect demonstration of warm gradient glass with top highlight + strong bottom light.
- **SF icon** (`e68b276a8ec4ac20106d6c7a748d2dc7.jpg`): Extreme dark background + intense orange bottom glow. High polish, minimal.
- **arounda palette cards** (`603a68f1e8239854e3b09c1df6813f9c.jpg`): Frosted pills on warm dark gradient. Excellent color and type pairing.
- **Stock cards** (`dcbe45c0e1ae80c24e20cf0d5abba272.jpg`): Multiple glass surfaces in a grid — shows how the effect scales.

### Current Implementation Notes

The existing `.liquid-glass` and `.liquid-glass--tint` classes in `styles/globals.css` provide a solid foundation (subtle blur, gradient border mask, gold-tinted wash).

**Recommended evolution** toward reference images:
- Strengthen the bottom orange emission in gradients
- Increase blur values selectively
- Introduce more pronounced warm orange glow variables
- Add dedicated "glowing" variants for key interactive or hero elements
- Consider a `--glass-orange` CSS custom property

## 4. Typography

Reference shows clean, modern geometric sans-serif (Neue Montreal).

**Recommended approach**:
- Primary: System/UI font stack or a geometric variable font (Inter, SF Pro, Satoshi, or Neue Montreal)
- Hierarchy: Generous but controlled sizing
- Weight: Regular for body, Medium/Semibold for headings and labels
- Color: Warm cream on black glass; orange for emphasis/links

Avoid overly decorative or condensed faces.

## 5. Components & Patterns

- **Navigation**: Floating glass pill or cluster (as implemented). On mobile: minimal floating FABs.
- **Content blocks**: `.glass-block` style — generous padding, soft internal contrast.
- **Buttons / Pills**: Rounded, glass-filled or glass-bordered with orange accent on interaction.
- **Cards**: Use the full liquid glass treatment. Vary opacity/tint for hierarchy.
- **Icons**: Light cream or white with subtle drop shadow. Can receive orange glow on emphasis.
- **Background**: Near-black with optional very subtle video or radial warm glow vignette.

## 6. Motion & Accessibility

- Use subtle transitions (150–300ms) on hover, focus, open states.
- Glass blur and complex gradients should gracefully degrade when `prefers-reduced-motion: reduce`.
- Maintain excellent contrast (warm cream on deep black passes WCAG comfortably).
- Interactive states must be obvious (orange glow + slight scale or brightness shift).

## 7. Implementation Priorities

When refining the design system:

1. Define a small set of reusable glass tokens (blur amount, border-radius scale, orange emission intensity, rim light strength).
2. Update `.liquid-glass` base + variants (base, tinted, glowing, pressed).
3. Audit all existing glass usage against the reference images.
4. Document color and effect tokens in this file or a companion design tokens file.
5. Test on real devices — glass effects are sensitive to rendering and battery.

## 8. Out of Scope / Anti-Patterns

- Do not introduce cold blues or unrelated accent colors.
- Avoid flat design or heavy skeuomorphism.
- Do not overuse blur (performance + readability cost).
- Never place critical text on heavily blurred or low-contrast glass without sufficient inner fill.

---

These guidelines should be the single source of truth when evolving the visual language. All new UI should be evaluated against the glass-style references in `tempfolder/`.
