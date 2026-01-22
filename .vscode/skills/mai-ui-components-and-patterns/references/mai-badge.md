# Badge Style Guidelines

Use the `mai-badge` component to surface compact status, attribution, or count indicators that harmonize with the MAI design tokens. This guide outlines the configurable attributes, slot behaviors, and styling rules defined in `packages/core/badge/src/badge.styles.ts`, along with Storybook-sourced examples that map to each variant.

## Configuration Surface
**Tag name**
- `mai-badge`

**Attributes & fields**

| Attribute | Allowed values | Default | Notes |
| --- | --- | --- | --- |
| `appearance` | `informative` \| `brand` \| `success` \| `danger` \| `onimage` | `informative` | Updates ElementInternals states for theming. Colors align with status tint tokens for quick semantic cues. |
| `size` | `medium` \| `small` | `medium` | Adjusts host min-dimension, typography ramp, and slot icon sizing. |
| `backplateless` | Boolean | `false` | Removes background fill and tightens inline padding for icon + label treatments.

**Slots**
- `(default)`: Primary text or numeric content. Keep copy concise to preserve compact sizing.
- `start`: Leading visuals (iconography, stacked avatars). Width and height are clamped to the icon tokens defined in `badge.styles.ts`.
- `end`: Optional trailing control or glyph. Negative inline padding keeps the badge width tight around the element.

## Base Layout & Styling Rules
- **Display & alignment:** The host renders as `inline-flex`, centering content both horizontally and vertically for consistent inline placement alongside text. The default gap is `calc(ctrlBadgeGap + paddingCtrlTextSide)`, ensuring adequate space between slot content and text while honoring typography padding tokens.
- **Sizing:** `min-width` and `min-height` derive from `ctrlBadgeSize`. Typographic sizing uses `textRampMetadataFontSize`/`LineHeight`, keeping the badge copy in the metadata tier.
- **Padding & radius:** Inline padding combines `ctrlBadgePadding` with `paddingCtrlTextSide`. Corner radii scale with `ctrlBadgeCorner` and a `--_squircle-modifier` custom property; the value jumps from `1` to `1.8` when native `corner-shape: squircle` is supported, yielding softer curves without breaking older browsers.
- **Containment:** `contain: content` scopes painting and layout calculations. Avoid forcing overflow-visible descendants unless intentionally breaking containment.
- **Slot sizing:**
  - `start`/`end` slots default to `ctrlBadgeIconSize` square, with block margins compensating for text padding so icons vertically center.
  - `:host(:not([backplateless])) ::slotted([slot="start"].nth-child(1))` applies a negative inline start margin to tuck the first icon under the corner radius, keeping the outer edge flush.
  - `::slotted([slot="end"])` mirrors this with a negative inline end margin.
- **Stacked imagery:** `::slotted(img[slot="start"])` applies `cornerFavicon` rounding and a subtle stroke. Consecutive images gain `margin-inline-start: -8px` and descending `z-index` values so they cascade left-to-right while remaining visible.
- **Backplateless mode:** Removes the block background while preserving left inset via `paddingContentXxxSmall`. Use when the badge should feel integrated with surrounding text instead of floated.
- **Small size:** Reduces typography to the small metadata ramp and switches to `ctrlBadgeSm*` tokens for min-size, padding, and icon dimensions.
- **Accessibility:** Appearance and size changes push state into `ElementInternals` via `swapStates`, enabling UA styling for assistive tech. In high-contrast (forced colors) mode, the host exposes a `CanvasText` border for visibility.

## Variant Reference
Each example below is copied from, or derived directly from, `packages/core/badge/src/badge.stories.ts` so you can reproduce Storybook scenarios in product code.

### Informative (default appearance)
- Background: `statusInformativeTintBackground`
- Foreground: `statusInformativeTintForeground`
- Includes thin image stroke (`statusInformativeTintStroke`) for slotted imagery.

```html
<mai-badge>Badge</mai-badge>
```

### Brand Appearance
- Swaps to `statusBrandTintBackground` / `statusBrandTintForeground` for promotional or brand-specific states.

```html
<mai-badge appearance="brand">Badge</mai-badge>
```

### Success Appearance
- Uses `statusSuccessTintBackground` / `statusSuccessTintForeground` for confirmation or completion messaging.

```html
<mai-badge appearance="success">Badge</mai-badge>
```

### Danger Appearance
- Applies `statusDangerTintBackground` / `statusDangerTintForeground` for destructive or error states.

```html
<mai-badge appearance="danger">Badge</mai-badge>
```

### On-image Appearance
- Designed for photo/video overlays. Background moves to `backgroundCtrlOnImageRest` and text to `foregroundCtrlOnImage` to maintain contrast over imagery.

```html
<mai-badge appearance="onimage">Badge</mai-badge>
```

### Backplateless
- Removes the fill while retaining baseline padding and typography. Host padding collapses except for a subtle leading inset seeded by `paddingContentXxxSmall`.

```html
<mai-badge backplateless>Badge</mai-badge>
```

### Backplateless with Start Icon
- Demonstrates how the first start-slot element still hugs the left edge even without the background backplate.

```html
<mai-badge backplateless>
    <span slot="start">
        <!-- Bot20RegularSVG rendered by Storybook helper -->
        <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M6.5 4.5a3.5 3.5 0 017 0v1a1 1 0 001 1h1a1 1 0 110 2h-1v1.07c1.14.46 2 1.4 2 2.43 0 1.46-1.33 2.65-3.07 2.92A3 3 0 0110 18a3 3 0 01-4.43-1.08C3.83 16.65 2.5 15.46 2.5 14c0-1.04.86-1.97 2-2.43V10.5h-1a1 1 0 110-2h1a1 1 0 001-1v-1z" fill="currentColor"></path>
        </svg>
    </span>
    Start Icon
</mai-badge>
```

### Small Size
- Drops to the small typography ramp and activates the `ctrlBadgeSm*` tokens so the badge shrinks proportionally. Start/end slots clamp to `ctrlBadgeSmIconSize`.

```html
<mai-badge size="small">Badge</mai-badge>
```

### Start Slot Icon
- Illustrates default backplate with an inline 20px SVG icon. The icon's block margins align vertically with the text because `badge.styles.ts` subtracts the text padding from the icon margins.

```html
<mai-badge>
    <span slot="start">
        <!-- Bot20RegularSVG rendered by Storybook helper -->
        <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M6.5 4.5a3.5 3.5 0 017 0v1a1 1 0 001 1h1a1 1 0 110 2h-1v1.07c1.14.46 2 1.4 2 2.43 0 1.46-1.33 2.65-3.07 2.92A3 3 0 0110 18a3 3 0 01-4.43-1.08C3.83 16.65 2.5 15.46 2.5 14c0-1.04.86-1.97 2-2.43V10.5h-1a1 1 0 110-2h1a1 1 0 001-1v-1z" fill="currentColor"></path>
        </svg>
    </span>
    Start Icon
</mai-badge>
```

### Stacked Start Images
- Successive `slot="start"` images receive descending `z-index` values (`3`, `2`, `1`) and a `-8px` inline-start offset so avatars overlap while staying legible. A subtle stroke separates the thumbnails.

```html
<mai-badge>
    <img slot="start" src="https://dummyimage.com/16x16/555/ffffff" alt="placeholder image" />
    <img slot="start" src="https://dummyimage.com/16x16/777/ffffff" alt="placeholder image" />
    <img slot="start" src="https://dummyimage.com/16x16/999/ffffff" alt="placeholder image" />
    Attribution
</mai-badge>
```

### Backplateless Stacked Start Images
- Combines the overlap logic with the lean typography spacing of the backplateless style. Ensure surrounding backgrounds provide sufficient contrast when the fill is removed.

```html
<mai-badge backplateless>
    <img slot="start" src="https://dummyimage.com/16x16/555/ffffff" alt="placeholder image" />
    <img slot="start" src="https://dummyimage.com/16x16/777/ffffff" alt="placeholder image" />
    <img slot="start" src="https://dummyimage.com/16x16/999/ffffff" alt="placeholder image" />
    Attribution
</mai-badge>
```

### Start Slot Image (Single Thumbnail)
- When a single image is provided, the stroke and corner rounding keep the thumbnail visually distinct from the backplate.

```html
<mai-badge>
    <img slot="start" src="https://dummyimage.com/16x16/0f62fe/ffffff" alt="placeholder image" />
    Attribution
</mai-badge>
```

## Implementation Checklist
- Register the badge definition from `packages/core/badge/src/define.ts` or `define-async.ts` before instantiating `<mai-badge>` in production apps.
- Pair the component with `ComponentDesignSystem.provide()` to ensure design tokens resolve to the intended CSS custom properties.
- Keep label text succinct; wrapping increases the badge height beyond the tokenized min-height, which may break alignment in dense UI regions.
- When mixing icons and text, avoid overriding token-driven sizing on the slotted nodes. Instead, adjust icon artwork within the provided 20px/16px canvas.
- For overlay usage (`appearance="onimage"`), evaluate contrast with actual background photography, especially when toggling `backplateless`.
- Validate both CSR and SSR render paths using the Playwright harness (`fastPage.setTemplate()`), covering combinations of appearance, size, and slot content.
