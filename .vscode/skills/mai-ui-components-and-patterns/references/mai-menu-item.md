# Menu Item Style Guide

## Component Basics
- Tag name: `<mai-menu-item>` (see `packages/core/menu-item/src/menu-item.options.ts`).
- Class: `MenuItem` extends `@fluentui/web-components`' base menu item, so it inherits keyboard navigation, submenu orchestration, and checkable behavior.
- Registration: exported from the MAI Design System packages; no extra registration is required when consuming `@mai-ui/core` bundles.
- Appearance: fixed to the MAI subtle control tokens; there is no `appearance` attribute to switch colorways. Visual states are driven by interaction (hover, active, focus) and role (checked, submenu, disabled).

## Configurable Attributes and States
- `role` (`menuitem | menuitemcheckbox | menuitemradio`): controls ARIA semantics. Use `MenuItemRole` from `menu-item.options.ts` for type-safe values.
- `checked` (boolean): available when `role` is `menuitemcheckbox` or `menuitemradio`. When true, the indicator slot is shown and `checkedState` applies selection tokens.
- `aria-checked`: managed automatically, but you can set it directly when manually wiring checkable behavior.
- `aria-haspopup="menu"` and `aria-expanded` (boolean): used when the item owns a submenu. Expansion state toggles submenu glyph visibility.
- `disabled` (boolean): removes pointer interactivity, applies subdued colors, and keeps slots visible in forced-color mode.
- `data-indent="0 | 1 | 2"`: adjusts the leading grid column to visually indent nested items. Default is `0`.
- `tabindex`: forwarded from the FAST foundation; usually managed automatically as menus rove focus.

## Slots
- Default slot: primary label/content. Rendered inside a `div[part="content"]` with no wrapping by default.
- `indicator`: optional leading selection glyph. A checkmark SVG is provided when you omit custom content.
- `start`: leading visual slot (icons, avatars). Indentation variables shift this column when `data-indent` is set.
- `end`: trailing metadata (shortcuts, descriptions). Styled with secondary foreground tokens and right-aligned.
- `submenu-glyph`: trailing disclosure icon shown when the item hosts a submenu. Defaults to a chevron if not provided.
- `submenu`: container for nested `mai-menu-list` elements. When populated, the host enters the submenu layout state and exposes the disclosure glyph.

## Styling Behavior from `packages/core/menu-item/src/menu-item.styles.ts`

### Base Grid Layout
- Host renders as a four-column CSS grid (`20px 20px auto 20px`) with `height: sizeCtrlDefault`, `padding: 0 10px`, and `grid-gap: gapInsideCtrlDefault`.
- Typography locks to `textRampItemBody` tokens to match other menu surfaces.
- `.content` spans two columns, grows to fill available space, and maintains `white-space: nowrap` to prevent wrapping inside constrained lists.

```html
<mai-menu-list>
  <mai-menu-item>Default item</mai-menu-item>
</mai-menu-list>
```

### Interaction States (Hover, Active, Focus, Disabled)
- Hover swaps background to `backgroundCtrlSubtleHover` and text to `foregroundCtrlOnSubtleHover`.
- Active state uses `backgroundCtrlSubtlePressed` and `foregroundCtrlOnSubtlePressed`, including the `start` slot glyph.
- Focus-visible adds a squircle outline (`ctrlFocusOuterStroke`) while reusing the control-radius token.
- Disabled overrides background/foreground with disabled tokens and propagates to `start`/`end` slots; forced-color mode maps disabled content to `GrayText`.

```html
<mai-menu-item disabled>
  Disabled item
</mai-menu-item>
```

### Selection Indicator (`checkedState`)
- `.indicator` and `slot[name="indicator"]` render only when the host matches `checkedState` (set via `checked` or appropriate ARIA). Otherwise, they are hidden to keep spacing tight.
- Indicator column stays fixed at `20px`; provide custom markup in the slot to override the default checkmark.

```html
<mai-menu-item role="menuitemcheckbox" checked>
  Enable notifications
</mai-menu-item>

<mai-menu-item role="menuitemcheckbox" checked>
  <span slot="indicator">★</span>
  Starred
</mai-menu-item>
```

### Submenu Layout (`submenuState`)
- When a child is assigned to the `submenu` slot, the host matches `submenuState`, revealing the `submenu-glyph` column and adjusting grid tracks to `20px auto auto 20px`.
- The disclosure glyph defaults to a MAI arrow; override via the `submenu-glyph` slot if needed.
- CSS anchor positioning ties any slotted submenu that uses the `popover` API back to the host (`anchor-name: --menu-trigger`).

```html
<mai-menu-item aria-haspopup="menu" aria-expanded="false">
  More options
  <mai-menu-list slot="submenu" popover>
    <mai-menu-item>Nested item</mai-menu-item>
  </mai-menu-list>
</mai-menu-item>
```

### Indentation Controls (`data-indent`)
- `data-indent="1"` shifts the `start` slot into the second column, creating one level of visual indentation.
- `data-indent="2"` adds an extra grid column (`20px 20px auto auto`) so deeply nested items align text correctly. Combined with `submenuState`, the grid becomes `20px 20px auto auto 20px`.
- Use indentation for custom grouping scenarios inside a single menu list when submenu nesting is not desired.

```html
<mai-menu-item data-indent="1">
  Grouped action
</mai-menu-item>

<mai-menu-item data-indent="2" aria-haspopup="menu">
  Deeply nested
  <mai-menu-list slot="submenu" popover>
    <mai-menu-item>Option A</mai-menu-item>
  </mai-menu-list>
</mai-menu-item>
```

### Start and End Slots
- `slot="start"` displays as `inline-flex` and aligns with the calculated indentation column. Icons inherit the body text font sizing for consistent alignment.
- `slot="end"` aligns to the far edge of the content region (`justify-self: end`) and uses secondary foreground tokens for shortcut hints or annotations.

```html
<mai-menu-item>
  <mai-icon slot="start" name="document"></mai-icon>
  Open File
  <span slot="end">⌘O</span>
</mai-menu-item>
```

### Popover Anchoring (`@layer popover`)
- The host declares `anchor-name: --menu-trigger`; any slotted submenu with `popover` gains absolute positioning relative to that anchor.
- Popovers respect `--menu-max-height` for overflow control and expose `position-try-fallbacks` to flip inline/block placement when space is limited.
- Without anchor-positioning support, the fallback aligns submenus to the start edge using flex alignment.

```html
<mai-menu-item aria-haspopup="menu" aria-expanded="true">
  <span>Reports</span>
  <mai-menu-list slot="submenu" popover style="--menu-max-height: 240px;">
    <mai-menu-item>Weekly</mai-menu-item>
    <mai-menu-item>Monthly</mai-menu-item>
  </mai-menu-list>
</mai-menu-item>
```

### Forced Colors
- In high-contrast environments, disabled hosts and their slot content render with `GrayText`, ensuring readability while signaling the disabled state.

## Implementation Notes
- Use `checked`/`aria-checked` only on checkbox or radio roles to keep assistive technologies synchronized with visual indicators.
- Prefer nested `mai-menu-list` inside the `submenu` slot instead of manually managing popovers; the FAST foundation handles keyboarding (`ArrowRight`, `ArrowLeft`) and focus transfer.
- When overriding slot content, retain accessible labels (e.g., `aria-hidden="true"` on purely decorative icons) so the item remains screen-reader friendly.
- Manage `aria-expanded` via your menu controller so disclosure glyphs and popover visibility stay in sync.
- Consider `prefers-reduced-motion` users when adding custom animations; existing styles already gate transitions through tokenized state changes.

## Example Coverage Notes
- A dedicated `menu-item.stories.ts` file is not yet present in the repository, so Storybook examples are unavailable to reference directly. The snippets above demonstrate the recommended patterns aligned with the current MAI styles.
