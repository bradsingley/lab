# Menu List

## Overview

The `mai-menu-list` component renders the flyout surface that hosts navigable `mai-menu-item` entries. It extends the Fluent UI `MenuList` foundation and applies MAI design tokens for acrylic surfaces, spacing, corner geometry, and popover behavior.

## Configuration Summary

**Tag name**

- `mai-menu-list`

**Slots**

- default slot: required container for menu content. Populate it with `mai-menu-item`, `mai-divider`, or other compatible flyout primitives. Submenu content is provided by nesting another `mai-menu-list` inside a child item using the `slot="submenu"` slot exposed by `mai-menu-item`.

**Attributes & Properties**

- `popover`: optional. When the element participates in the HTML Popover API (for example when nested inside `mai-menu`), the component hides itself until `:popover-open` is true and updates its transform origin based on CSS anchor positioning.
- `role`: defaults to `menu` (inherited from Fluent). Override only when implementing application-specific patterns such as context menus.

**CSS Custom Properties**

- `--menu-max-height`: constrains the list height while preserving internal scrolling for overflow content.

## Style Behavior and Layout

### Base Flyout Surface

- Host displays as `flex` with column flow, ensuring menu items stack top-to-bottom with `row-gap: gapBetweenListItem`.
- Width adapts to content but is bounded by `min-width: 160px` and `max-width: 300px`; override with inline styles or container rules when a different footprint is required.
- Height is auto-controlled, capped by `--menu-max-height` when provided.
- Acrylic styling layers (`backgroundFlyoutSaturationBlend`, `materialAcrylic*` tokens) and `backdrop-filter: blur(materialAcrylicBlur)` deliver the translucent flyout effect.
- Borders, corner radius, and box shadows rely on MAI flyout tokens. When the user agent supports `corner-shape: squircle`, the host increases the radius multiplier for more pronounced curvature.

**Example (from `Default` story)**

```html
<mai-menu-list>
  <mai-menu-item>Item 1</mai-menu-item>
  <mai-menu-item>Item 2</mai-menu-item>
  <mai-menu-item>Item 3</mai-menu-item>
</mai-menu-list>
```

### Popover Visibility & Transform Origin

- `:host([popover]:not(:popover-open))` forces `display: none` and disables pointer events, keeping the surface hidden until the popover opens. This rule temporarily works around Safari 16.6/17 bugs and can be removed once the browser fixes popover visibility.
- When opened through the popover API, the component listens for `toggle` events and sets `transform-origin` based on the resolved CSS `position-area`. This keeps scale/opacity animations aligned with the originating anchor in both LTR and RTL contexts.
- Pair the list with `mai-menu`, an anchor element, or custom popover trigger that defines `position-area` to leverage this alignment.

### Divider Alignment

- `::slotted(mai-divider)` receives `margin-block: calc(paddingFlyoutDefault - gapBetweenListItem)` to align separators with surrounding spacing. This maintains consistent visual rhythm whether the divider appears near the top, bottom, or between groups.

**Example (from `DividerAlignment` story)**

```html
<mai-menu-list>
  <mai-menu-item>Item 1</mai-menu-item>
  <mai-menu-item>Item 2</mai-menu-item>
  <mai-divider></mai-divider>
  <mai-menu-item>Item 3</mai-menu-item>
  <mai-menu-item>Item 4</mai-menu-item>
</mai-menu-list>
```

### Squircle Support

- On capable browsers, the host enables `corner-shape: squircle` and multiplies `cornerFlyoutRest` by `1.8`, resulting in a softer geometry while retaining the same acrylic layering.
- No additional configuration is needed; fallbacks render standard rounded corners when the feature is unavailable.

## Usage Examples

### Checkbox Menu Items (from `CheckboxItems` story)

```html
<mai-menu-list>
  <mai-menu-item role="menuitemcheckbox" checked>Check One</mai-menu-item>
  <mai-menu-item role="menuitemcheckbox" checked>Check Two</mai-menu-item>
  <mai-menu-item role="menuitemcheckbox" checked>Triple Check</mai-menu-item>
</mai-menu-list>
```

### Radio Menu Items (from `RadioItems` story)

```html
<mai-menu-list>
  <mai-menu-item role="menuitemradio">Yesterday</mai-menu-item>
  <mai-menu-item role="menuitemradio" checked>Today</mai-menu-item>
  <mai-menu-item role="menuitemradio">Tomorrow</mai-menu-item>
</mai-menu-list>
```

### Disabled Items (from `DisabledItems` story)

```html
<mai-menu-list>
  <mai-menu-item>Item 1</mai-menu-item>
  <mai-menu-item disabled>Item 2</mai-menu-item>
  <mai-menu-item>Item 3</mai-menu-item>
</mai-menu-list>
```

### Submenus (from `Submenus` story)

```html
<mai-menu-list>
  <mai-menu-item>
    Item 1
    <span slot="start"><!-- Edit20 icon --></span>
    <mai-menu-list slot="submenu">
      <mai-menu-item>
        Subitem 1
        <span slot="start"><!-- Folder20 icon --></span>
      </mai-menu-item>
      <mai-menu-item>
        Subitem 2
        <span slot="start"><!-- Code20 icon --></span>
      </mai-menu-item>
    </mai-menu-list>
  </mai-menu-item>
  <mai-menu-item>
    Item 2
    <mai-menu-list slot="submenu">
      <mai-menu-item>
        Subitem 1
        <span slot="start"><!-- Folder20 icon --></span>
      </mai-menu-item>
      <mai-menu-item>
        Subitem 2
        <span slot="start"><!-- Code20 icon --></span>
      </mai-menu-item>
    </mai-menu-list>
  </mai-menu-item>
  <mai-menu-item>Item 3</mai-menu-item>
</mai-menu-list>
```

### Custom Indicators & Glyphs (from `CustomIcons` story)

```html
<mai-menu-list>
  <mai-menu-item>
    Submenu 1
    <span slot="start"><!-- Cut20 icon --></span>
    <span slot="submenu-glyph">→</span>
    <span slot="end">Ctrl+S</span>
    <mai-menu-list slot="submenu">
      <mai-menu-item>Subitem 1</mai-menu-item>
      <mai-menu-item>Subitem 2</mai-menu-item>
    </mai-menu-list>
  </mai-menu-item>

  <mai-divider></mai-divider>

  <mai-menu-item role="menuitemcheckbox">
    <span slot="indicator">✅</span>
    <span slot="start"><!-- Edit20 icon --></span>
    Checkbox 1
  </mai-menu-item>
  <mai-menu-item role="menuitemcheckbox">
    <span slot="indicator">👍</span>
    <span slot="start"><!-- Edit20 icon --></span>
    Checkbox 2
  </mai-menu-item>
</mai-menu-list>
```

### Container Alignment (from `ContainerAlignment` story)

```html
<div style="display: flex; justify-content: end;">
  <mai-menu-list>
    <mai-menu-item>Item 1</mai-menu-item>
    <mai-menu-item>Item 2</mai-menu-item>
    <mai-menu-item>Item 3</mai-menu-item>
  </mai-menu-list>
</div>
```

## Development Notes

- Prefer populating the default slot with `mai-menu-item` instances so keyboard navigation, typeahead, and selection states behave as expected.
- Nesting submenu lists inside `mai-menu-item[slot="submenu"]` automatically wires focus management and directional navigation.
- The component cooperates with the HTML Popover API; pair it with `mai-menu` or manually manage `popover` state to integrate within custom surfaces.
- Avoid overriding the acrylic background tokens inside the component unless you reapply sufficient contrast for focus rings and glyphs. Instead, adjust container-level variables like `--menu-max-height` or wrap the list with utility surfaces when creating themed experiences.
