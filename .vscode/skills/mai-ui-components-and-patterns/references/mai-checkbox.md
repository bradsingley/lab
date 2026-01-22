# Checkbox Style Guidelines

This document summarizes the supported configuration surface and visual behavior for the `mai-checkbox` component.

## Component Definition
- **Tag name:** `mai-checkbox` (from `ComponentDesignSystem.prefix` + `-checkbox`).
- **Appearance:** Ships with a single brand appearance driven by design tokens. The component does not expose an `appearance` attribute override.
- **Base class:** Extends Fluent UI's `BaseCheckbox`, adding MAI-specific styling, indeterminate handling, and design token wiring.

## Configurable API

### Attributes and Properties
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `autofocus` | boolean | `false` | Moves focus to the control when it is added to the DOM. |
| `checked` | boolean | `false` | Toggles the checked state. Synchronizes with `aria-checked="true"`. |
| `disabled` | boolean | `false` | Disables pointer interaction and applies the disabled visual treatment. |
| `form` | string | `undefined` | Associates the checkbox with an external `<form>` element by ID. |
| `indeterminate` | boolean | `false` | Enables the mixed state. Also sets `aria-checked="mixed"` via `elementInternals`. Automatically clears when `toggleChecked()` is invoked. |
| `name` | string | `undefined` | Submitted with the wrapped form when checked. |
| `required` | boolean | `false` | Marks the checkbox as required for form submission. |
| `value` | string | `"on"` (from base control) | Submitted value when the checkbox is checked. |

> `toggleChecked(force?: boolean)` is exposed as an imperative helper to programmatically set the selection state while clearing `indeterminate`.

### Slots
- **default slot:** Not supported; the template renders its own indicators.
- **`slot="input"`:** When embedding inside `mai-field`, place the checkbox in the `input` slot to receive label and message layout.

### Form Integration
- Supports native form submission and constraint validation (`required`, `checkValidity()`, `reportValidity()`).
- Works with `<form>` reset and submit events; resetting clears the checked state and any derived messages in collaborator components.

## Layout, Size, and Indicator Rules

### Host Layout
- `display: inline-flex` with `position: relative` ensures the control can align with text baselines.
- Fixed width of `ctrlChoiceBaseSize`; height is locked via `aspect-ratio: 1` so the control remains square.
- `border-radius: ctrlChoiceCheckboxCorner` keeps corners consistent across states.

### Focus Ring
- For non-slotted usage, an `::after` pseudo-element expands the focus outline (`inset: -8px`) using `ctrlFocusOuterStrokeWidth` and `ctrlFocusOuterStroke`.
- `outline: none` on the host prevents duplicate outlines.

### Indicator Elements
- `.checked-indicator` renders an SVG checkmark (`width: 12px`) centered absolutely. Hidden by default and revealed when `checked` or when the component reports a checked state through SSR (`checkedState`).
- `.indeterminate-indicator` is a span sized by `ctrlChoiceCheckboxIndeterminateWidth`/`ctrlChoiceCheckboxIndeterminateHeight`. Visibility is toggled when the `indeterminate` state is active.
- Both indicators inherit color from `foregroundCtrlOnActiveBrand*` tokens; hint visibility for hover/active pre-selection uses `ctrlBooleanSelectionHint` and `foregroundCtrlHintDefault`.

## State Styling Reference

| State | Selector(s) | Background | Border | Indicator visibility | Notes |
| --- | --- | --- | --- | --- | --- |
| Rest | `:host` | `ctrlChoiceBaseBackgroundRest` | `ctrlChoiceBaseStrokeWidthRest solid ctrlChoiceBaseStrokeRest` | Hidden | Square box sized by tokens. |
| Hover | `:host(:hover)` | Rest (unchecked), `backgroundCtrlActiveBrandHover` when checked | Stroke width bumps to `ctrlChoiceBaseStrokeWidthHover`; color shifts to `ctrlChoiceBaseStrokeHover` or `strokeCtrlOnActiveBrandHover` when checked | Hint visibility enabled with `ctrlBooleanSelectionHint` until checked | Maintains cursor pointer for interactive feedback. |
| Active/Pressed | `:host(:active)` | Rest (unchecked) or `backgroundCtrlActiveBrandPressed` when checked | Stroke width `ctrlChoiceBaseStrokeWidthPressed`; color `ctrlChoiceBaseStrokePressed` or `strokeCtrlOnActiveBrandPressed` | Hint visibility maintained; checked uses `foregroundCtrlOnActiveBrandPressed` | Keeps aspect ratio; press feedback handled via tokens. |
| Checked | `:host([checked])`, `:state(checked)` | `backgroundCtrlActiveBrandRest` | `strokeCtrlOnActiveBrandRest` | `.checked-indicator` visible; color `foregroundCtrlOnActiveBrandRest` | Applies to explicit attribute or SSR-driven checked state. |
| Indeterminate | `:host([state--indeterminate])`, `:state(indeterminate)` | `backgroundCtrlActiveBrandRest` | `strokeCtrlOnActiveBrandRest` | `.indeterminate-indicator` visible; background `foregroundCtrlOnActiveBrandRest` with rounded corners `ctrlChoiceCheckboxIndeterminateCorner` | Toggle handled through `elementInternals` state. |
| Focus-visible | `:host(:focus-visible)` | Inherits | Border unchanged; focus outline drawn by `::after` pseudo-element | Indicators follow checked/indeterminate logic | The pseudo-element is suppressed for `slot="input"` usage, relying on parent field focus outlines. |
| Disabled | `:host([disabled])` | `ctrlChoiceBaseBackgroundDisabled` (unchecked) or `backgroundCtrlActiveBrandDisabled` when checked/indeterminate | `ctrlChoiceBaseStrokeDisabled` or `strokeCtrlOnActiveBrandDisabled` | Indicators stay visible for checked/indeterminate but use `foregroundCtrlOnActiveBrandDisabled` | Interaction removed (`cursor: default`, `pointer-events: none`). |
| Forced Colors | `@media (forced-colors: active)` | `FieldText` for filled states, `Highlight` on hover | `FieldText`/`GrayText` tokens replaced with system colors | Indicators adapt to `HighlightText` / `GrayText` | Ensures accessibility in Windows High Contrast mode. |

## Example Usage
The following snippets are derived from `checkbox.stories.ts` and illustrate canonical patterns.

### Default Checkbox
```html
<mai-checkbox></mai-checkbox>
```

### Checked Checkbox in a Field
```html
<mai-field label-position="after">
  <label slot="label">Checked</label>
  <mai-checkbox checked slot="input"></mai-checkbox>
</mai-field>
```

### Indeterminate State
```html
<mai-field label-position="after">
  <label slot="label">Indeterminate</label>
  <mai-checkbox indeterminate slot="input"></mai-checkbox>
</mai-field>
```

### Disabled Variations
```html
<div style="display: flex; flex-direction: column; gap: 20px;">
  <mai-field label-position="after">
    <label slot="label">Disabled</label>
    <mai-checkbox disabled slot="input"></mai-checkbox>
  </mai-field>
  <mai-field label-position="after">
    <label slot="label">Disabled (checked)</label>
    <mai-checkbox checked disabled slot="input"></mai-checkbox>
  </mai-field>
  <mai-field label-position="after">
    <label slot="label">Disabled (indeterminate)</label>
    <mai-checkbox indeterminate disabled slot="input"></mai-checkbox>
  </mai-field>
</div>
```

### Required Checkbox with Form Submission
```html
<form style="display: inline-flex; flex-direction: column; gap: 1rem; max-width: 400px;">
  <mai-field label-position="after">
    <label slot="label">Check this to submit the form</label>
    <mai-checkbox required slot="input" id="checkbox-required"></mai-checkbox>
    <mai-field-message slot="message">This checkbox must be selected.</mai-field-message>
  </mai-field>
  <div>
    <mai-button type="submit" appearance="primary">Submit</mai-button>
    <mai-button type="reset">Reset</mai-button>
  </div>
  <span hidden id="checkbox-success">Form submitted successfully!</span>
</form>
```

> In interactive contexts, toggle the success message’s `hidden` attribute based on `form` submit/reset events, mirroring the Storybook `Required` example.
