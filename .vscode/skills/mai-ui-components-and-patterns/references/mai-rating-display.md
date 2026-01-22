# Rating Display Style Guidelines

## Overview
`mai-rating-display` renders a static visualization of an aggregate rating. The host uses `display("inline-flex")` so the numeric value, icon strip, and optional count align on a single baseline while remaining token-driven for typography and color. By default the component draws five 12px icons with a left-to-right gradient that reflects the `value` relative to `max`. All layout, spacing, and color decisions come directly from MAI design tokens, keeping the widget consistent across dark/light modes and forced-color contexts.

## Anatomy and Slots
- **Host (`<mai-rating-display>`)** – inline-flex container that aligns content center and removes text selection. Accepts the `compact` attribute to collapse the icon strip.
- **Masked icon strip (`<div class="display">`)** – internal grid element that uses masked gradients to visualize the rating. Its width is calculated from the current `max` and `--icon-size`.
- **`slot="value"`** – optional slot before the icon strip. When not supplied, a `<span class="value-label">` renders `value` as static text with block display and top/bottom padding tokens.
- **`slot="icon"`** – accepts a single SVG template that defines the mask for the stars. The slotted icon is hidden visually (`display: none`) once processed, so reserve the slot for pure icon definitions.
- **`slot="count"`** – optional trailing slot for a total-review count. The default `<span class="count-label">` displays the formatted count in parentheses; it disappears entirely when `count` is unset.

## Configurable Surface
| Attribute / CSS Var | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Rating displayed. Rounded to the nearest 0.5 when painted. Accepts numbers between `0` and `max`.
| `max` | `number` | `5` | Number of icons shown. Also controls gradient width. Values below `1` clamp to `1`.
| `count` | `number` | unset | Total ratings shown in the trailing count slot. Formatted with `Intl.NumberFormat` using the closest ancestor `lang`.
| `compact` | boolean | `false` | Forces the component to show a single icon while still honoring `value` and `count` slots.
| `slot` | string | none | Place the host in other layouts (for example, inside `mai-field`) using standard slot semantics.
| `--icon-size` | CSS length | `12px` | Controls icon height and width for both default and custom masks. The `.display` width scales with this value.

> **Appearance control** – the component does not expose custom `appearance` variants. Visual adjustments should flow through design tokens or the `--icon-size` custom property.

## Styles Reference
- **`:host`** – sets inline-flex layout, centers children vertically, and applies MAI typography tokens. Color defaults to `foregroundCtrlNeutralPrimaryRest`; disabled states use `foregroundCtrlNeutralPrimaryDisabled`. It also defines gradient mask variables and disables user selection.
- **`:host(:dir(rtl))`** – flips the gradient direction (`--_icon-gradient-degree: -90deg`) and mask alignment so ratings fill correctly in right-to-left contexts.
- **`@supports (width: attr(value type(<number>)))`** – stores `value` and `max` as custom properties when the browser supports typed `attr()` so the gradient math can run without script measurement.
- **`:host([compact]) .display`** – overrides the computed max (`--_max: 1`) to render a single icon. The icon strip width shrinks accordingly while value and count keep their layout padding.
- **`.display`** – grid element sized to `--icon-size` in block dimension and `(--_max * (--icon-size + gapBetweenCtrlNested) − gapBetweenCtrlNested / 2)` inline. It sets up the icon gradient, mask size, and repeat behavior, creating smooth half-step fills.
- **`.value-label`, `::slotted([slot="value"])`** – enforce block layout with right margin (`gapInsideCtrlToLabel`) and symmetric top/bottom padding (`paddingCtrlSmTextTop`, `paddingCtrlSmTextBottom`). Keeps numeric text baseline-aligned with the icon strip.
- **`.count-label`** – places a left margin equal to `gapInsideCtrlToLabel` so the trailing count breathes away from the icon strip.
- **`:host(:not([count])) .count-label`** – hides the default count span entirely when `count` is undefined, preventing stray punctuation.
- **`::slotted([slot="icon"])`** – hides the slotted SVG after it is consumed for the mask. Provide a viewBox that matches or scales with `--icon-size` to avoid unexpected clipping.
- **`@media (forced-colors: active)`** – swaps gradient colors to `CanvasText`/`Canvas` and overlays an outline mask so icons remain legible in high-contrast. Gradient stop adjustments remove color fringing.

## Layout Behavior
- The component maintains intrinsic width based on `max` and `--icon-size`; it will not wrap icons unless constrained by `max-width` on an ancestor.
- When `compact` is set, the strip never exceeds `--icon-size`, making it suitable for constrained cards or list items.
- Value and count slots reserve horizontal padding even when replaced with custom content, so author-provided nodes should remain block-level to align with token spacing.
- Users can resize the icon strip globally by overriding `--icon-size` inline or via CSS. The gradient and mask calculations automatically respect the new size.

## Example Compositions
```html
<!-- Storybook: Core/Rating Display › Default -->
<mai-rating-display value="3.5"></mai-rating-display>
```

```html
<!-- Storybook: Core/Rating Display › Count -->
<mai-rating-display value="4" count="3391"></mai-rating-display>
```

```html
<!-- Storybook: Core/Rating Display › Zero -->
<mai-rating-display value="0"></mai-rating-display>
```

```html
<!-- Storybook: Core/Rating Display › Max -->
<mai-rating-display value="8.6" max="10"></mai-rating-display>
```

```html
<!-- Storybook: Core/Rating Display › Compact -->
<mai-rating-display value="4.8" count="2895" compact></mai-rating-display>
```

```html
<!-- Storybook: Core/Rating Display › customIcon -->
<mai-rating-display value="3.5" max="5">
  <svg viewBox="0 0 16 16" slot="icon">
    <circle cx="8" cy="8" r="8"></circle>
  </svg>
</mai-rating-display>
```

## Design Token Reference
Key tokens referenced in `packages/core/rating-display/src/rating-display.styles.ts`:
- `foregroundCtrlNeutralPrimaryRest`
- `foregroundCtrlNeutralPrimaryDisabled`
- `gapBetweenCtrlNested`
- `gapInsideCtrlToLabel`
- `paddingCtrlSmTextTop`
- `paddingCtrlSmTextBottom`
- `textRampSmItemBodyFontSize`
- `textRampSmItemBodyLineHeight`
- `textStyleDefaultRegularFontFamily`
- `textStyleDefaultRegularWeight`

## Implementation Tips
- Slot a localized value node when you need to show precise decimal formatting the default span does not cover.
- When providing a custom icon, match the default `viewBox` (0 0 12 12) or update `--icon-size` to keep gradients crisp.
- Pair the component with `mai-field` or `mai-text` to describe rating context; the inline-flex layout prevents wrapping between the value prefix and icon strip.
- For analytics surfaces that require large icons, increase `--icon-size` and set an explicit `max` to avoid unexpected wrapping in responsive grids.
