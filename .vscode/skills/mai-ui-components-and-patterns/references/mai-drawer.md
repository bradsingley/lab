# Drawer Style Guidelines

The `mai-drawer` component provides a contextual surface that temporarily overlays the application frame. Use it to present additional settings or detail without forcing users to leave their current task. This guide summarizes the development-time configuration options and the styling guarantees enforced by `packages/core/drawer/src/drawer.styles.ts`.

## Component API

### Tag

- Custom element: `<mai-drawer>`

### Attributes

- `type="modal | non-modal | inline"` — Controls how the drawer attaches to the viewport. `modal` is the default with an overlay, `non-modal` keeps interaction with the background open, and `inline` embeds the drawer in-flow without overlay or elevation.
- `position="start | end"` — Determines whether the drawer anchors to the leading (`start`) or trailing (`end`) edge. RTL layouts automatically flip the transform animation.
- `size="small | medium | large | full"` — Applies the preset width tokens from Fluent Drawer. Use these when the default tokenized widths are sufficient; override with `--drawer-width` for bespoke sizing.
- `aria-label`, `aria-labelledby`, `aria-describedby` — Standard dialog labeling hooks that forward to the internal `<dialog>` element.

### Methods and Events

- Call `show()` and `hide()` to control the open state programmatically.
- Listen for `beforetoggle` to react before visibility changes, `toggle` after the `<dialog>` finishes opening or closing, and `cancel` when users dismiss with Escape or overlay interaction.

### CSS Custom Properties

- `--drawer-width` — Sets the explicit width of the drawer `dialog`. Defaults to `320px` unless overridden by `size` presets.
- `--drawer-elevation` — Controls the `z-index` of the drawer surface. Defaults to `1000` inside the component styles.

### Slots and Recommended Structure

- Default slot — Renders the entire drawer body. Compose with `mai-drawer-body` to take advantage of pre-defined regions:
  - `slot="title"` for a heading element.
  - `slot="close"` for an icon-only action that triggers `hide()`.
  - `slot="footer"` for action buttons.
- Direct children can contain any markup when the helper body element is not used, but keep focusable controls keyboard reachable.

## Style Rules From `drawer.styles.ts`

Each subsection summarizes the enforced layout rules and includes a sample copied from `drawer.stories.ts` with attributes applied for that state.

### Base Host and Dialog

- `:host` displays as `block` to ensure predictable layout participation.
- The internal `<dialog>` uses layered acrylic backgrounds (`backgroundFlyout*` tokens), a `backdrop-filter` blur, `strokeFlyout` border, and `shadowFlyout*` elevations.
- Height locks to `100%` while `max-width` and `max-height` cap at the viewport. Width resolves from `--drawer-width`.
- `dialog::backdrop` starts transparent with opacity `0`; the overlay tint can be provided externally if desired.

```html
<mai-drawer
  id="drawer-default"
  type="modal"
  position="start"
>
  <mai-drawer-body>
    <h2 slot="title">Drawer Header</h2>
    <mai-button
      slot="close"
      appearance="subtle"
      icon-only
      aria-label="close"
      onclick="document.getElementById('drawer-default').hide()"
    >
      <!-- Dismissed20RegularSvg icon -->
    </mai-button>
    <div>
      <!-- Drawer content -->
    </div>
    <div slot="footer">
      <mai-button appearance="primary" onclick="document.getElementById('drawer-default').hide()">Close</mai-button>
      <mai-button appearance="secondary">Do Something</mai-button>
    </div>
  </mai-drawer-body>
</mai-drawer>
<mai-button appearance="primary" onclick="document.getElementById('drawer-default').show()">
  Toggle Drawer
</mai-button>
```

### Non-modal Type

- `:host([type='non-modal']) dialog[open]::backdrop` hides the overlay entirely.
- Maintains `position: fixed` with `top` and `bottom` pinned so the panel still covers the viewport height.
- Use when background interaction must stay available; ensure primary interactions still live inside the drawer for clarity.

```html
<mai-drawer id="drawer-non-modal" type="non-modal" position="start">
  <mai-drawer-body>
    <h2 slot="title">Non-modal Drawer</h2>
    <!-- Body content -->
  </mai-drawer-body>
</mai-drawer>
```

### Inline Type

- `:host([type='inline'])` collapses the component to its content width and inheriting container height.
- The internal `dialog` switches to `position: relative`, removes shadows, and clears the gradient background to stay transparent, making it suitable for in-flow layouts such as stacked settings panels.
- Border and background tokens currently fall back to transparent placeholders (TODO tokens in styles). Supply container backgrounds as needed.

```html
<mai-drawer id="drawer-inline" type="inline" position="start">
  <mai-drawer-body>
    <h2 slot="title">Inline Drawer</h2>
    <!-- Inline configuration -->
  </mai-drawer-body>
</mai-drawer>
```

### Position "end"

- `:host([position='end']) dialog` aligns the surface to the trailing edge by setting `margin-inline-start: auto` and rounded leading corners only.
- RTL-aware animation rules ensure start/end flips gracefully; avoid overriding `transform` on the dialog while transitions run.

```html
<mai-drawer id="drawer-end" type="modal" position="end">
  <mai-drawer-body>
    <h2 slot="title">End-aligned Drawer</h2>
    <!-- Content -->
  </mai-drawer-body>
</mai-drawer>
```

### Motion and Animations

- Animations only run when `prefers-reduced-motion: no-preference`; they transition `transform`, `opacity`, and the overlay state using cubic-bezier curves defined in the host custom properties.
- Closed drawers translate `-100%` for LTR start alignment and `100%` for end/RTL combinations. Keep custom transitions compatible with those offsets.
- The `@starting-style` rule ensures drawers animate from the correct off-screen position during opening.

## Sizing Guidance

- Choose a `size` preset first. They map to design-token widths from Fluent (`small`, `medium`, `large`, `full`).
- Override `--drawer-width` for bespoke measurements; do so at the element level: `style="--drawer-width: 28rem"`.
- Adjust `--drawer-elevation` when embedding alongside other overlay components to manage stacking order.

## Behavioral Notes

- Call `hide()` on close actions instead of mutating `open` directly so events fire consistently.
- `non-modal` and `inline` modes still rely on `<dialog>` semantics; ensure correct labeling for accessibility.
- Pair drawers with `mai-button` actions that live outside the component, reusing the toggle pattern from the Storybook example.
