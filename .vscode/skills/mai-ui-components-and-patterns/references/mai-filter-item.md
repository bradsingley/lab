# Filter Item Style Guidelines

`mai-filter-item` presents a single selectable chip that is typically composed within `mai-filter`. Use this guide to understand the component surface, the slots you can target, and the layout rules imposed by the shared stylesheet.

## Configuration Surface

- **Tag name**: `mai-filter-item`
- **Registration**: `import "@mai-ui/core/filter-item";`
- **Attributes**:
  - `checked` (boolean) toggles the selected state and fires a bubbled `change` event when modified by user interaction.
  - `disabled` (boolean) suppresses pointer and keyboard interaction, sets `aria-disabled`, and removes the item from roving focus flows.
- **Appearance**: no alternative appearance enum is exposed. All visual changes rely on the state attributes listed above and CSS custom properties surfaced through design tokens.
- **Slots**:
  - Default slot renders the visible label or any inline content.
  - `slot="start"` exposes a leading icon or thumbnail region ahead of the label.
- **Events**: `change` bubbles when the internal `select()` logic flips the `checked` value. Listen on a surrounding filter group to stay in sync.
- **ARIA and keyboard**: the template assigns `role="menuitemradio"`. `Space` and `Enter` toggle the item, while pointer activation is handled through the `click` listener.

## Layout and Styling Rules

All rules below originate from `packages/core/filter-item/src/filter-item.styles.ts`.

### Base host box (`:host`)
- `display: inline-flex` via the shared `display()` utility keeps the item aligned with text and allows wrapping when the parent flex container wraps.
- The control enforces `height: sizeCtrlDefault`, inline gap `calc(gapInsideCtrlDefault + paddingCtrlTextSide)`, and symmetric block padding derived from the `paddingCtrlText*` tokens. Content naturally resizes to fit the configured height.
- Typography is locked to `textStyleDefaultHeaderFontFamily`, regular weight, and the `textRampItemBody*` tokens for size and line height.
- Visuals: rest background color, outline stroke, and text color pull from the `backgroundCtrlOutlineRest`, `strokeCtrlOnOutlineRest`, and `foregroundCtrlOnOutlineRest` tokens. Border radius is calculated from `cornerCtrlRest` and is multiplied by `--_squircle-modifier` (defaults to `1`).
- `contain: content` isolates layout and paint, guarding against inadvertent overflow calculations in larger layouts.

### Hover state (`:host(:hover)`)
- Background, foreground, outline color, and corner radius shift to the matching `Hover` tokens. The hover state preserves sizing; no visibility toggles are applied.

### Active state (`:host(:active)`)
- Press interactions reuse the `Pressed` token set for colors and corner radius, providing tactile feedback without modifying the control footprint.

### Checked state (`:host([checked])`)
- Overrides font weight with `textCtrlWeightSelected` and swaps background, outline, and text colors for the selected set (`ctrlLiteFilter*Selected` tokens). The outline width is also upgraded. Layout metrics remain constant so checked items do not jump.

### Disabled state (`:host([disabled])`)
- Text and outline colors move to the disabled palette, and `pointer-events: none` prevents pointer input. Keyboard handlers respect the `disabled` flag so the item cannot toggle.

### Focus ring (`:host(:focus-visible)`)
- Applies a dual ring: an inner box shadow (`ctrlFocusInnerStrokeWidth`/`ctrlFocusInnerStroke`) and an outer outline (`ctrlFocusOuterStrokeWidth`/`ctrlFocusOuterStroke`) with a positive offset. This preserves the component size while ensuring high-contrast focus indication.

### Start slot sizing (`::slotted([slot="start"])`)
- Constrains projected content to `sizeCtrlIcon` for width and height. A negative left margin cancels the label side padding so icons align flush with the outline.

### Slotted images (`::slotted(img)`)
- Any direct slotted `<img>` receives a rounded treatment that inherits the squircle modifier, keeping thumbnails visually aligned with the overall control shape.

### Corner shape support (`@supports (corner-shape: squircle)`)
- When the browser supports `corner-shape: squircle`, the host increases `--_squircle-modifier` to `1.8`. This preserves the perceived curvature of the selected state without affecting layout dimensions.

### Forced colors (`@media (forced-colors: active)`)
- Checked items map text color to `Highlight`, and disabled items map to `GrayText`, ensuring accessibility in high-contrast mode. No additional forced-color overrides are required.

## Usage Patterns

Storybook does not yet publish dedicated `filter-item` stories, so the snippets below illustrate recommended patterns manually.

### Default filter item

```html
<mai-filter-item>Trending</mai-filter-item>
```

### Checked item within a filter group

```html
<mai-filter>
  <mai-filter-item checked>All</mai-filter-item>
  <mai-filter-item>Shows</mai-filter-item>
  <mai-filter-item>Movies</mai-filter-item>
</mai-filter>
```

### Thumbnail start slot

```html
<mai-filter-item checked>
  <img
    slot="start"
    src="https://dummyimage.com/20x20/b0b0b0/ffffff.png"
    alt="Placeholder image"
    width="20"
    height="20"
  />
  With thumbnail
</mai-filter-item>
```

### Icon start slot

```html
<mai-filter-item>
  <span slot="start" aria-hidden="true">★</span>
  Favorites
</mai-filter-item>
```

## Implementation Notes

- Ensure `@mai-ui/core/filter-item` is defined before reference; `define.ts` performs side-effect registration when imported.
- For SSR contexts, use the async definition module (`filter-item.definition-async.ts`) so the component renders consistently on the server and client.
- Override design token values (for example, `--mai-size-ctrl-default`) on a wrapping element when you need bespoke sizing. The component does not expose additional CSS parts, so token overrides are the supported customization path.
- Pairing multiple items inside `mai-filter` centralizes keyboard roving focus and enforces single selection. Outside that container, `mai-filter-item` still functions as a standalone toggle.
