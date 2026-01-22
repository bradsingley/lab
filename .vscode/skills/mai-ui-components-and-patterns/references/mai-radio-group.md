# Radio Group Style Guidelines

## Overview
`mai-radio-group` wraps multiple `mai-radio` inputs under a single semantic form control. The host renders as a flex container so radios can align horizontally by default or stack vertically when the `orientation` attribute changes. All foreground colors, spacing, and disabled/checked treatments are token-driven (`foregroundContentNeutralPrimary`, `foregroundCtrlNeutralPrimaryHover`, `gapBetweenContentMedium`, etc.), ensuring the component fits the MAI theme without manual overrides.

## Anatomy and Slots
- **Host (`<mai-radio-group>`)** – provides the flex layout, manages orientation, and applies group-level disabled styling. When nested in `mai-field`, assign `slot="input"` so the field controls labeling and helper messaging.
- **Default slot** – accepts `mai-radio` elements directly or wrapped in `mai-field`. Child radios inherit state feedback from the group through the custom state selectors defined in `@mai-ui/component-framework/states`:
  - `::slotted(:hover)` and `::slotted(:active)` tint the option text with interactive foreground tokens.
  - `::slotted(${disabledState})` and `:host([disabled]) ::slotted(*)` mute disabled options with `foregroundCtrlNeutralPrimaryDisabled`.
  - `::slotted(${checkedState})` returns the active option to the neutral primary foreground for clarity.

## Configurable Surface
| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Controls flex direction. Vertical orientation also swaps the gap token to `gapBetweenListItem` for tighter stacking. |
| `disabled` | boolean | `false` | Disables the group and cascades disabled styling to every slotted radio. Child radios with their own `disabled` attribute remain disabled even if the group is active. |
| `name` | string | none | Associates contained radios for form submission and mutual exclusivity. Mirrors to child radios created via templates. |
| `value` | string | none | Sets or reflects the currently checked radio’s value. Useful for initializing a selection. |
| `required` | boolean | `false` | Enforces selection before form submission. Works with native form validation APIs. |
| `slot` | string | none | Use `slot="input"` when placing the group inside `mai-field` to participate in MAI form layouts. |
| `aria-labelledby` | string | generated | Link the group to an external label element. When used with `mai-field`, the storybook template auto-generates an id that pairs with the field label. |

> **Appearance control** – the component inherits Microsoft FAST radio group behavior and does not expose MAI-specific `appearance` variants. Styling should remain token-driven.

## Layout and Spacing Behavior
- **Base layout** – `display("flex")` with a gap of `gapBetweenContentMedium` between child nodes. Ideal for compact horizontal forms.
- **Vertical orientation** – `:host([orientation='vertical'])` switches to `flex-direction: column`, left-aligns content (`justify-content: flex-start`), and reduces spacing to `gapBetweenListItem` for dense lists.
- **Horizontal orientation** – explicit attribute retains `flex-direction: row`; use when you need to ensure horizontal alignment even after toggling orientation elsewhere.
- **Pointer affordance** – `cursor: pointer` on the host communicates clickability while preserving `-webkit-tap-highlight-color: transparent` for smoother touch feedback.

### Default Horizontal Layout
Radio labels stay at the neutral primary color until interacted with. Child `mai-field` wrappers keep each option’s label and radio aligned.

```html
<!-- Storybook: Core/Radio Group › Default -->
<mai-field label-position="above">
  <label slot="label" id="favorite-fruit-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    aria-labelledby="favorite-fruit-label"
    name="favorite-fruit"
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio slot="input" name="favorite-fruit" value="pear"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

### Vertical Stack
When vertical, spacing tightens and options align in a column without additional styling.

```html
<!-- Storybook: Core/Radio Group › VerticalOrientation -->
<mai-field label-position="above">
  <label slot="label" id="radio-group-vertical-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    id="radio-group-vertical"
    aria-labelledby="radio-group-vertical-label"
    name="favorite-fruit"
    orientation="vertical"
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio slot="input" name="favorite-fruit" value="pear"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

## State Styling
### Hover and Active Feedback
`::slotted(:hover)` and `::slotted(:active)` transition text color through `foregroundCtrlNeutralPrimaryHover` and `foregroundCtrlNeutralPrimaryPressed`, while `cursor: pointer` keeps the entire host interactive. No additional layout changes occur, preserving alignment.

### Checked Option
Checked radios (`::slotted(${checkedState})`) revert to `foregroundContentNeutralPrimary` so the selected option matches body text color. The group still relies on each radio’s internal filled thumb for primary emphasis.

```html
<!-- Storybook: Core/Radio Group › InitialValue -->
<mai-field label-position="above">
  <label slot="label" id="radio-group-default-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    id="radio-group-default"
    aria-labelledby="radio-group-default-label"
    name="favorite-fruit"
    value="banana"
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio slot="input" name="favorite-fruit" value="pear"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

```html
<!-- Storybook: Core/Radio Group › InitialCheckedRadio -->
<mai-field label-position="above">
  <label slot="label" id="radio-group-checked-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    id="radio-group-checked"
    aria-labelledby="radio-group-checked-label"
    name="favorite-fruit"
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio
        slot="input"
        name="favorite-fruit"
        value="pear"
        checked
      ></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

### Disabled Group
Apply `disabled` to the group to gray out every option through `:host([disabled]) ::slotted(*)`. Interaction cues and pointer cursor are suppressed.

```html
<!-- Storybook: Core/Radio Group › Disabled -->
<mai-field label-position="above">
  <label slot="label" id="radio-group-disabled-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    id="radio-group-disabled"
    aria-labelledby="radio-group-disabled-label"
    name="favorite-fruit"
    disabled
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio slot="input" name="favorite-fruit" value="pear"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

### Mixed Disabled Items
Radios marked `disabled` individually adopt the muted color token while the rest remain interactive. This is ideal for conditionally unavailable choices inside an active group.

```html
<!-- Storybook: Core/Radio Group › DisabledItems -->
<mai-field label-position="above">
  <label slot="label" id="radio-group-disabled-items-label">Favorite Fruit</label>
  <mai-radio-group
    slot="input"
    id="radio-group-disabled-items"
    aria-labelledby="radio-group-disabled-items-label"
    name="favorite-fruit"
    orientation="vertical"
  >
    <mai-field label-position="after">
      <label slot="label">Apple</label>
      <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Pear</label>
      <mai-radio
        slot="input"
        name="favorite-fruit"
        value="pear"
        disabled
      ></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Banana</label>
      <mai-radio
        slot="input"
        name="favorite-fruit"
        value="banana"
        disabled
      ></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Orange</label>
      <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Grape</label>
      <mai-radio slot="input" name="favorite-fruit" value="grape"></mai-radio>
    </mai-field>
    <mai-field label-position="after">
      <label slot="label">Kiwi</label>
      <mai-radio
        slot="input"
        name="favorite-fruit"
        value="kiwi"
        disabled
      ></mai-radio>
    </mai-field>
  </mai-radio-group>
</mai-field>
```

### Required Forms
In a form context, use `required` and rely on native validation. This pattern also demonstrates how helper messages can be toggled with `mai-field` and plain markup.

The Storybook example wires submit/reset handlers in the template to toggle the success message; the markup below reflects the rendered structure.

```html
<!-- Storybook: Core/Radio Group › Required -->
<form style="display: inline-flex; flex-direction: column; gap: 1rem; max-width: 400px;">
  <mai-field label-position="above">
    <label slot="label" id="radio-group-required-label">Favorite Fruit</label>
    <mai-radio-group
      slot="input"
      aria-labelledby="radio-group-required-label"
      name="favorite-fruit"
      orientation="vertical"
      required
    >
      <mai-field label-position="after">
        <label slot="label">Apple</label>
        <mai-radio slot="input" name="favorite-fruit" value="apple"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Pear</label>
        <mai-radio slot="input" name="favorite-fruit" value="pear"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Banana</label>
        <mai-radio slot="input" name="favorite-fruit" value="banana"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Orange</label>
        <mai-radio slot="input" name="favorite-fruit" value="orange"></mai-radio>
      </mai-field>
    </mai-radio-group>
  </mai-field>
  <div style="display: inline-flex; gap: 1rem;">
    <mai-button type="submit" appearance="primary">Submit</mai-button>
    <mai-button id="reset-button" type="reset">Reset</mai-button>
  </div>
  <span id="success-message" hidden>Form submitted successfully!</span>
</form>
```

## Design Token Reference
Key tokens sourced by `packages/core/radio-group/src/radio-group.styles.ts`:
- `gapBetweenContentMedium`
- `gapBetweenListItem`
- `foregroundContentNeutralPrimary`
- `foregroundCtrlNeutralPrimaryHover`
- `foregroundCtrlNeutralPrimaryPressed`
- `foregroundCtrlNeutralPrimaryDisabled`

These values should be updated through the design-token pipeline rather than overridden per instance, keeping radio groups visually consistent across products.

## Integration Tips
- Combine with `mai-field` for consistent labeling, helper text, and validation messaging. Slot the field’s `label` and optional `message` elements accordingly.
- Group-level `disabled` is ideal for multi-step forms where entire sections deactivate based on earlier responses.
- When mixing horizontal and vertical layouts within the same view, explicitly set `orientation` to avoid inheriting unexpected defaults from templates.
- All interaction colors respond to pointer, keyboard, and forced-color scenarios via FAST underpinnings. Avoid re-styling slotted radios directly; customize tokens if alternative palettes are needed.
