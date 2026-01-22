# Menu

## Overview

The `mai-menu` component provides the surface that anchors and displays `mai-menu-list` content. It wraps the FAST `menu` foundation and adds MAI-specific layout, animation, and split-trigger behaviors.

## Configuration Summary

**Host attributes**

- `split`: enables the split-trigger layout; expected to be paired with `trigger` and `primary-action` slots.
- `open-on-hover`: opens the menu when the trigger is hovered.
- `open-on-context`: replaces standard activation with a context-menu (right click) gesture.
- `close-on-scroll`: closes the menu when the user scrolls outside the menu overlay.
- `persist-on-item-click`: keeps the menu open after a menu item is activated.

**Slots**

- `trigger`: required control that toggles the menu (often a `mai-menu-button`). When present, styles assign `anchor-name: --menu-trigger` so the default slot can position against it.
- `primary-action`: optional button displayed when `split` is set. Styles merge the primary action and trigger into a continuous control.
- default slot: the menu content. Typically filled with a single `mai-menu-list`; any element placed here is treated as the overlay surface and receives the transition and positioning styles defined in `menu.styles.ts`.

**CSS custom properties**

- `--opacity-collapsed`: starting opacity of the menu overlay.
- `--opacity-expanded`: target opacity when the overlay is open.
- `--scale-collapsed`: starting scale of the overlay.
- `--scale-expanded`: target scale when the overlay is open.

These variables control the entry animation defined for the default slot content.

## Style Behavior and Layout

### Base Overlay Menu

- The host renders as `inline-block`, allowing the trigger and overlay to size relative to inline content.
- The trigger slot sets `anchor-name: --menu-trigger`. The default slot content is absolutely positioned using CSS Anchor positioning with `position-area: block-end span-inline-end`, placing the overlay below and end-aligned with the trigger.
- Transitions use the custom properties above, scaling from `0.8` to `1` and fading between opacity states. When the slotted element exposes the `popover` API and enters the `:popover-open` state, the expanded values apply.
- `gapBetweenContentXSmall` is applied as block margin to space the overlay from the trigger. Motion respects `prefers-reduced-motion`, only enabling transitions when allowed.

**Example (from `Default` story)**

```html
<mai-menu>
  <mai-menu-button slot="trigger" appearance="neutral" aria-label="Toggle Menu">
    Toggle Menu
  </mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>Menu item 1</mai-menu-item>
    <mai-menu-item>Menu item 2</mai-menu-item>
    <mai-menu-item>Menu item 3</mai-menu-item>
    <mai-menu-item>Menu item 4</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

### Split Trigger Menu

- Adding `split` switches the host to `inline-flex` so the `primary-action` and `trigger` slots sit side by side.
- The primary action loses its end radii and inline-end border to seam with the trigger button; the trigger loses its start radii and inline-start border, and its internal content padding is zeroed (`--smtc-padding-ctrl-text-side: 0`).
- When the trigger uses `appearance="primary"`, a tokenized inline border (`strokeWidthDefault`) separates it from the primary action to maintain contrast.
- The overlay repositions to `block-end span-inline-start`, aligning beneath the trigger button. Hovering the combined control applies `backgroundCtrlSubtleHoverSplit` to any subtle-appearance part that is not currently hovered, keeping both halves visually unified.

**Example (from `SplitButton` story)**

```html
<mai-menu split>
  <mai-button slot="primary-action" appearance="primary">
    Primary Action
  </mai-button>
  <mai-menu-button
    slot="trigger"
    aria-label="Toggle Menu"
    appearance="primary"
    icon-only
  ></mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>Menu item 1</mai-menu-item>
    <mai-menu-item>Menu item 2</mai-menu-item>
    <mai-menu-item>Menu item 3</mai-menu-item>
    <mai-menu-item>Menu item 4</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

### Popover Entrance State

- Any slotted element that exposes the `popover` attribute receives the `:popover-open` rule. When opened, the overlay transitions over `0.1s` for opacity and overlay state, and `0.3s` for scale, with an explicit `@starting-style` block ensuring the animation starts from the collapsed scale and opacity.
- This rule applies to both standard and split layouts. It keeps focus handling above the trigger by elevating focus-visible triggers with `z-index: 1`.

**Example (from `MenuWithInteractiveItems` story)**

```html
<mai-menu>
  <mai-menu-button slot="trigger" appearance="neutral" aria-label="Toggle Menu">
    Toggle Menu
  </mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>
      Item 1
      <mai-menu-list slot="submenu">
        <mai-menu-item>Subitem 1</mai-menu-item>
        <mai-menu-item>Subitem 2</mai-menu-item>
      </mai-menu-list>
    </mai-menu-item>
    <mai-menu-item role="menuitemcheckbox" checked>Item 2</mai-menu-item>
    <mai-menu-item role="menuitemcheckbox">Item 3</mai-menu-item>
    <mai-divider role="separator" aria-orientation="horizontal" orientation="horizontal"></mai-divider>
    <mai-menu-item>Menu item 4</mai-menu-item>
    <mai-menu-item>Menu item 5</mai-menu-item>
    <mai-menu-item>Menu item 6</mai-menu-item>
    <mai-menu-item>Menu item 7</mai-menu-item>
    <mai-menu-item>Menu item 8</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

## Behavioral Examples

### Hover-activated menu

`open-on-hover` allows pointer hover to toggle the popover while preserving the base layout rules.

```html
<mai-menu open-on-hover>
  <mai-menu-button slot="trigger" appearance="neutral" aria-label="Toggle Menu">
    Toggle Menu
  </mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>Menu item 1</mai-menu-item>
    <mai-menu-item>Menu item 2</mai-menu-item>
    <mai-menu-item>Menu item 3</mai-menu-item>
    <mai-menu-item>Menu item 4</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

### Context menu activation

`open-on-context` transforms the trigger into a context menu, disabling other open affordances while retaining overlay positioning.

```html
<mai-menu open-on-context>
  <mai-menu-button slot="trigger" appearance="neutral" aria-label="Open Context Menu">
    Open Menu
  </mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>Menu item 1</mai-menu-item>
    <mai-menu-item>Menu item 2</mai-menu-item>
    <mai-menu-item>Menu item 3</mai-menu-item>
    <mai-menu-item>Menu item 4</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

### Constraining menu height

Apply `--menu-max-height` to limit the overlay size; overflowing items gain scrollbars inside the list while the anchor layout remains unchanged.

```html
<mai-menu style="--menu-max-height: 200px;">
  <mai-menu-button slot="trigger" appearance="neutral" aria-label="Toggle Menu">
    Toggle Menu
  </mai-menu-button>
  <mai-menu-list>
    <mai-menu-item>Menu item 1</mai-menu-item>
    <mai-menu-item>Menu item 2</mai-menu-item>
    <mai-menu-item>Menu item 3</mai-menu-item>
    <mai-menu-item>Menu item 4</mai-menu-item>
    <mai-menu-item>Menu item 5</mai-menu-item>
    <mai-menu-item>Menu item 6</mai-menu-item>
    <mai-menu-item>Menu item 7</mai-menu-item>
    <mai-menu-item>Menu item 8</mai-menu-item>
  </mai-menu-list>
</mai-menu>
```

## Development Notes

- Pair `mai-menu` with `mai-menu-list` and `mai-menu-item` to ensure the overlay correctly participates in the popover lifecycle.
- When using `split`, remember to provide an actionable control in the `primary-action` slot; the menu trigger remains responsible for opening the popover.
- Honor `prefers-reduced-motion` when introducing additional animations—existing styles already reduce transitions when the user requests less motion.
