# Listbox Component Style Guidelines

Use `mai-listbox` to present a selectable list of options styled for MAI flyouts and dropdown menus. This guide summarizes the configurable attributes, slot behaviour, and layout rules defined in `packages/core/listbox/src/listbox.styles.ts`. Storybook snippets are called out when available.

## Component Reference
- **Tag:** `mai-listbox`
- **Base behavior:** Extends Fluent UI `Listbox`; inherits keyboard navigation, selection logic, and ARIA roles.
- **Display:** `inline-flex` container with a column flow so options stack vertically and inherit the design-system spacing tokens.

## Attributes & Properties
| Attribute/Property | Type | Default | Notes |
|--------------------|------|---------|-------|
| `id` | string | auto-generated | Stable identifier; generated when omitted to support `aria-controls`/`popover` relationships. |
| `multiple` | boolean | `false` | Enables multi-select behaviour. When toggled the component recomputes option selection state. |
| `options` (`readonly`) | `DropdownOption[]` | `[]` | Populated from the default slot content. Updated on `slotchange`. |
| `selectedOptions` (`readonly`) | `DropdownOption[]` | `[]` | Mirror of currently selected child options. |
| `role` | string | `"listbox"` | Override only for custom accessibility cases; defaults to the ARIA listbox role. |
| `popover` (attribute) | boolean | `false` | Opts into popover/anchoring layout rules for flyout positioning. |

## Slots
| Slot | Purpose | Layout rules |
|------|---------|--------------|
| _(default)_ | Accepts `mai-option`, `mai-listbox-option`, or other option-compatible children. | Children flow in a single column; the host applies `row-gap` from design tokens and manages option sizing. No named slots are defined. |

## Style Sets & Layout Rules
Derived from `packages/core/listbox/src/listbox.styles.ts`.

### Base host (`:host`)
- **Layout:** `inline-flex` container, column direction, `row-gap` set to `gapBetweenListItem`. Minimum width is 160px with automatic width growth based on slotted content. Box sizing is `border-box` so padding contributes to total width.
- **Visuals:** Acrylic flyout background via layered gradients, blur (`backdrop-filter: blur(materialAcrylicBlur)`), and flyout key/ambient shadows. Rounded squircle corners scale with `--_squircle-modifier` (default `1`).
- **Sizing:** Padding comes from `paddingFlyoutDefault`; background blends use MAI flyout tokens.
- **Customization hooks:** `--listbox-max-height` and `--_squircle-modifier` alter sizing/corner curvature. The host is marginless by default so surrounding layouts control placement.

### Popover state (`:host([popover])`)
- **Layout:** Removes inset constraints (`inset: unset`) allowing the popover API to place the element relative to its anchor. Enables scroll behavior with `overflow: auto` so long option lists remain accessible.
- **Visibility:** When used with the built-in popover API the element respects `showPopover()`/`hidePopover()` commands; no additional visibility toggles are introduced in styles.

### Anchored popover (`@supports (anchor-name: --anchor)`)
- **Layout:** Activates advanced CSS anchor positioning. Sets `position: absolute`, anchors to `--dropdown-trigger`, and tries inline/block fallbacks (`position-try-fallbacks: flip-inline, flip-block, --flip-block, block-start`). Width derives from the trigger (`min-width: anchor-size(width)`).
- **Sizing:** `max-height` becomes `calc(50vh - anchor-size(self-block))` unless overridden by `--listbox-max-height`.
- **Fallback path:** The custom `@position-try --flip-block` ensures the listbox flips above when there is insufficient space below.

### Squircle support (`@supports (corner-shape: squircle)`)
- **Layout/Visuals:** Increases `--_squircle-modifier` to `1.8`, sharpening the squircle curvature on capable browsers while leaving legacy browsers at a rounded rectangle.

### Non-anchor fallback (`@supports not (anchor-name: --anchor)`)
- **Layout:** Defaults to `position: fixed` when the `popover` attribute is present. Uses `margin-block-start: var(--margin-offset, 0)` to offset from the trigger. Honors `--listbox-max-height` but falls back to `50vh` if unset.
- **Flip behaviour:** Applying the `flipBlockState` class (via MAI dropdown controller) reverses the vertical translation to render above the trigger (`translate: 0 -100%`).

### Forced-color mode (`@media (forced-colors: active)`)
- **Visuals:** Disables blur and layered gradients for accessibility, reverting the background to system `Field` color to satisfy high-contrast requirements.

## Usage Notes
- Populate the default slot with interactive option elements (`mai-option`, Fluent `fluent-option`, etc.) so the inherited `Listbox` logic can register them.
- When pairing with `mai-dropdown`, register the listbox as a popover element; the MAI dropdown controller supplies the `flipBlockState` class automatically during collision handling.
- Use `--listbox-max-height` to fine-tune the scrollable viewport for contexts like context menus or searchable dropdowns.
- The component inherits pointer and keyboard selection from Fluent UI. When `multiple` is true, modifier keys and space/enter toggles are available by default.

## Storybook Examples
`packages/core/listbox/src/listbox.stories.ts` is not present in the repository, so no Storybook-backed snippets are currently available. Use the component within `mai-dropdown` or manual markup as needed, and consider authoring stories to document key scenarios.
