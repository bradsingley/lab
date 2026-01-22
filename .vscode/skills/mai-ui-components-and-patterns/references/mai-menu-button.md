# Menu Button Style Guide

## Component Basics
- Tag name: `<mai-menu-button>` (see `packages/core/menu-button/src/menu-button.options.ts`).
- Class: `MenuButton` extends the base `mai-button`, so it inherits the standard button fielding (appearance, size, icon-only, disabled states, start/end slots).
- Registration: included in the default MAI Design System definition; no manual registration needed when you consume the component via the package entry point.

## Configurable Attributes and States
- `appearance` (`neutral | onimage | outline | primary | subtle`): forwarded to the inherited button styles for color treatments.
- `size` (`small | medium | large`): drives control height and spacing tokens.
- `icon-only` (boolean): switches the host into icon presentation; triggers dedicated sizing rules (see Styles section).
- `disabled` (boolean): removes interactivity, inherits base button disabled styling.
- `disabled-focusable` (boolean): keeps the control focusable while visually disabled.
- `aria-expanded` (boolean): managed by the consuming menu-controller to reflect open/closed state; drives the chevron rotation animation for the end slot icon.
- `data-interacted` (present via internal logic): set while the control is being interacted with; used to run collapse animation on the end slot icon.

## Slots
- Default slot (`<slot></slot>`): primary label or body content. Accepts text, inline elements, or custom markup.
- `start` slot (`<slot name="start"></slot>`): optional leading visuals; sized by inherited button styles.
- `end` slot (`<slot name="end"></slot>`): trailing visuals, typically disclosure icons; receives additional sizing and animation in `menu-button.styles.ts`.

## Styling Behavior from `menu-button.styles.ts`

### Base Button Frame
- Imports and composes `@mai-ui/button` base styles, keeping consistency with the button suite.
- Use for standard label + chevron disclosure buttons.

```html
<mai-menu-button appearance="neutral" size="medium">
  Menu Button
  <svg slot="end" fill="currentColor" aria-hidden="true" width="1em" height="1em" viewBox="0 0 12 12">
    <path d="M2.21967 4.46967C2.51256 4.17678 2.98744 4.17678 3.28033 4.46967L6 7.18934L8.71967 4.46967C9.01256 4.17678 9.48744 4.17678 9.78033 4.46967C10.0732 4.76256 10.0732 5.23744 9.78033 5.53033L6.53033 8.78033C6.23744 9.07322 5.76256 9.07322 5.46967 8.78033L2.21967 5.53033C1.92678 5.23744 1.92678 4.76256 2.21967 4.46967Z" />
  </svg>
</mai-menu-button>
```

### Icon-Only Host State (`:host([icon-only])`)
- Removes the inherited fixed width so the control hugs the icon.
- Applies `min-width: sizeCtrlDefault` to keep the interactive hit target.

```html
<mai-menu-button appearance="neutral" size="medium" icon-only>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4" />
  </svg>
</mai-menu-button>
```

### Slotted Icon Sizing (`::slotted(:is(svg, [slot="end"]))`)
- Applies `sizeCtrlIconSecondary` to height, width, and font-size for any slotted SVG or `slot="end"` content, ensuring consistent disclosure icon scale.
- Works for both start and end visuals by targeting SVGs and explicit end-slot elements.

```html
<mai-menu-button appearance="neutral" size="medium">
  <span slot="start">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4" />
    </svg>
  </span>
  Start Icon
</mai-menu-button>
```

```html
<mai-menu-button appearance="neutral" size="medium">
  Filter
  <span slot="end">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7.5 13h5a.5.5 0 0 1 .09.992L12.5 14h-5a.5.5 0 0 1-.09-.992zh5zm-2-4h9a.5.5 0 0 1 .09.992L14.5 10h-9a.5.5 0 0 1-.09-.992zh9zm-2-4h13a.5.5 0 0 1 .09.992L16.5 6h-13a.5.5 0 0 1-.09-.992zh13z" />
    </svg>
  </span>
</mai-menu-button>
```

### Interaction Animations (`:host([data-interacted])` & `:host([aria-expanded="true"])`)
- When `data-interacted` is present, the end-slot SVG receives `animation-name: collapse` with linear timing and a `100ms` duration (when motion is allowed). Use this while closing menus to spin the chevron back through 360°.
- When `aria-expanded="true"`, the animation switches to `expand`, rotating the end icon from `0deg` to `180deg`, signaling an open menu.
- `@media (prefers-reduced-motion: no-preference)` gate keeps the duration so that reduced-motion users avoid rotation.
- Keyframes are defined locally (`expand`, `collapse`); no additional markup is needed beyond correctly managing `aria-expanded` via your menu logic.
- Current Storybook examples do not toggle these attributes automatically; reuse the `CustomIcon` markup above and set `aria-expanded` or `data-interacted` in your integration tests to verify the animation.

## Appearance and Size Usage
- `Neutral` (default): `appearance="neutral"` — use for standard surfaces.
- `On Image`: pairs with photographic backgrounds (`appearance="onimage"`).
- `Outline`: bordered style for low-emphasis cases.
- `Primary`: high-emphasis call to action.
- `Subtle`: minimal chrome variant for dense layouts.
- `Small | Medium | Large`: choose control size to match the vertical rhythm of surrounding components.

```html
<mai-menu-button appearance="primary" size="large">
  Primary Action
</mai-menu-button>

<mai-menu-button appearance="subtle" size="small" disabled>
  Disabled
</mai-menu-button>

<mai-menu-button appearance="neutral" size="medium" disabled-focusable>
  Disabled (Focusable)
</mai-menu-button>
```

## Layout Guidance
- The default width grows with content; apply container constraints when you need text wrapping. The `LongText` story demonstrates using a wrapper to cap width:

```html
<div style="max-width: 280px">
  <mai-menu-button appearance="neutral" size="medium">
    This story's canvas has a max-width of 280px, applied with a Story Decorator. Long text wraps after it hits the max width of the component.
  </mai-menu-button>
</div>
```

- When using the icon-only presentation, ensure you still supply accessible text via `aria-label` if the visual lacks a textual label.
- Align start and end slot content with the overarching spacing system; the component auto-sizes icons, so additional width constraints are rarely necessary.

## Implementation Notes
- Manage `aria-expanded` in sync with the associated `mai-menu` or popover element so the disclosure animation reflects actual menu state.
- Toggle `disabled` vs `disabled-focusable` based on whether the button should still be reachable by assistive technology.
- The styling references `sizeCtrlDefault` and `sizeCtrlIconSecondary` tokens; updates to these global tokens will cascade to every menu button without local overrides.
