# Divider Style Guidelines

The `mai-divider` component provides visual separation between content regions. This guide enumerates the configurable attributes, slot behavior, and the layout rules so you can apply the correct variant during development.

## Configuration Surface

- **Tag name**: `mai-divider`
- **Attributes**:
  - `appearance="strong|subtle"` &ndash; selects the tokenized stroke palette. Omitting the attribute uses the default stroke.
  - `orientation="horizontal|vertical"` &ndash; switches between a horizontal rule (default) and a vertical rule.
  - `inset` (boolean) &ndash; adds internal padding so the rule stops short of the container edge; vertical inset adds 12&nbsp;px offsets above/below the rule segments.
  - `align-content="center|start|end"` &ndash; adjusts how slotted content sits between the rule segments when content is present.
  - `role="separator|presentation"` &ndash; choose `presentation` when the divider is decorative only.
- **Slots**: one default slot. Any element you slot is wrapped with flex alignment and typography tokens in the component stylesheet.
- **States**: `appearance` and `inset` toggle FAST element internals for author-styles; forced-colors mode converges all strokes to `WindowText` for contrast.

## Slot Layout Defaults

Content placed in the default slot is rendered as a flex container with center alignment, neutral secondary text color, metadata typography ramp, and horizontal padding defined by `paddingCtrlHorizontalDefault`. The slot inherits a `gap` of `gapBetweenCtrlDefault` to space inline elements. In vertical orientation the slot swaps to column layout and adds vertical padding so stacked content remains legible.

## Style Sets and Layout Rules

### Baseline horizontal rule (default appearance)
- The host is `display: flex` with `contain: content`; pseudo-elements (`::before`, `::after`) expand with `flex-grow: 1` to draw the horizontal strokes using `strokeDividerDefault` at `strokeWidthDividerDefault` thickness.
- When no content is slotted, the rule spans the full width. With content, the pseudo-elements compress equally around the slot while keeping the rule centered vertically.
- Example (`Default` story):

```html
<mai-divider></mai-divider>
```

### Subtle appearance
- Uses `strokeDividerSubtle` while preserving the default stroke width. Slotted content continues to use the neutral secondary text color.
- Example (`Subtle` story):

```html
<mai-divider appearance="subtle"></mai-divider>
```

### Strong appearance
- Upgrades the stroke to `strokeDividerStrong` and increases thickness via `strokeWidthDividerStrong`. Slotted content color elevates to `foregroundContentNeutralPrimary` for stronger emphasis.
- Example (`Strong` story):

```html
<mai-divider appearance="strong"></mai-divider>
```

### Inset spacing
- Applying the `inset` attribute adds `12px` padding on the inline axis so the rule no longer touches the container edge. In vertical orientation it adds matching top/bottom margins to the pseudo-elements.
- Use when the divider should align with inset card or list layouts. (No dedicated Storybook example yet; author markup as `<mai-divider inset></mai-divider>` when needed.)

### Vertical orientation
- `orientation="vertical"` swaps the host to column flex layout, centers the pseudo-elements, and constrains their width to the stroke width tokens. The host expands to the parent height (`height: 100%`, `min-height: 84px`), while empty dividers collapse to 20&nbsp;px minimum.
- Slot content stacks vertically with column flex, applies vertical padding, and uses a fixed `line-height: 20px` for readability. When no slot content is provided, pseudo-elements shrink to 10&nbsp;px segments for compact decoration.
- Example (`VerticalOrientation` story):

```html
<mai-divider orientation="vertical"></mai-divider>
```

### Presentation role
- `role="presentation"` removes semantic meaning while keeping visuals intact. Combine with `aria-hidden="true"` if the divider must be fully ignored by assistive tech.
- Example (`PresentationRole` story):

```html
<mai-divider role="presentation"></mai-divider>
```

### Forced colors and high contrast
- In `forced-colors: active` contexts all stroke variants (default, strong, subtle) unify to `WindowText`, ensuring the rule remains visible regardless of appearance choice. Author-provided slot content keeps system-derived text color.

## Development Notes

- The host exposes `align-content` from FAST; when set to `start` or `end`, the slotted region shifts toward the chosen side while maintaining equal stroke lengths thanks to flex alignment rules.
- Slotted SVGs or icons automatically inherit the typography color tokens because styles apply to the wrapper element; wrap standalone SVGs in a `<span>` when you need margin or custom sizing.
- When composing layouts, prefer wrapping `mai-divider` in a flex container so the automatic `flex-grow` behavior cooperates with neighboring elements. Vertical dividers inside constrained containers should receive an explicit height to avoid stretching beyond design intent.
