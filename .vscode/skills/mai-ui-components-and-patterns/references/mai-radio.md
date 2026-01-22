# Radio Style Guidelines

## Overview
The `mai-radio` component renders a single-choice control that aligns with the MAI selection tokens. It defaults to `display: inline-flex` with a square affordance (`aspect-ratio: 1`) sized by `ctrlChoiceBaseSize`. The host owns the entire visual surface while an internal `.checked-indicator` part renders the filled dot. Background, stroke, and focus treatments are fully token-driven so the control adapts to light, dark, and forced-colors schemes without custom overrides.

## Anatomy and Slots
- **Host (`<mai-radio>`)** – draws the outer circle, manages border radius, and responds to hover/active/checked/disabled states.
- **Checked indicator (`span.checked-indicator`, `part="checked-indicator"`)** – absolute element used for the selection dot. Size and color transition with interaction tokens.
- **Slots** – the component has no internal content slot. When used with `mai-field`, apply `slot="input"` so the field supplies labeling and layout; this slot suppresses the standalone focus halo and lets the field own focus visuals.

## Configurable Surface
| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | boolean | `false` | Puts the radio in the selected/filled state. Mirrors to the `.checked-indicator` visibility and brand background. |
| `disabled` | boolean | `false` | Applies disabled colors via `ctrlChoiceBaseBackgroundDisabled` and locks hover/active feedback. |
| `required` | boolean | `false` | Standard form attribute forwarded to the underlying FAST radio control. |
| `name` | string | none | Group radios by name to enable mutual exclusivity in forms. |
| `value` | string | none | Form submission value associated with the radio choice. |
| `size` | `"large"` \| unset | unset | Optional override that increases the host diameter to 20px while keeping token-driven proportions. Any other value falls back to the base sizing tokens. |
| `slot` | string | unset | Use `slot="input"` when nesting inside `mai-field` so the field orchestrates layout and labeling. |

## Style Behavior
The styles in `packages/core/radio/src/radio.styles.ts` define the visual states below. Each section includes a Storybook-backed example when available.

### Base Control
- Host width defaults to `ctrlChoiceBaseSize` (token fallback 16px) with `border-radius: ctrlChoiceRadioCorner` and `border: ctrlChoiceBaseStrokeWidthRest solid ctrlChoiceBaseStrokeRest`.
- A custom focus ring (`::after`) draws 8px outside the host when the radio is standalone; it relies on `ctrlFocusOuterStrokeWidth` and `ctrlFocusOuterStroke`.
- Hover and active interactions transition border width (`ctrlChoiceBaseStrokeWidthHover`, `ctrlChoiceBaseStrokeWidthPressed`) and color (`ctrlChoiceBaseStrokeHover`, `ctrlChoiceBaseStrokePressed`).
- The `.checked-indicator` stays hidden until `checked` is true; during hover/active without selection it can surface as a hint based on the `ctrlBooleanSelectionHint` token.

```html
<!-- Storybook: Core/Radio › Default -->
<mai-radio id="fruit-apple" name="fruit" value="Apple"></mai-radio>
```

### Large Size Variant
- Setting `size="large"` swaps the base size token for a fixed 20px diameter while preserving the aspect ratio and centering logic for the indicator.
- Indicator fallbacks scale proportionally (`calc(var(--_size) * 0.625)`) so the dot remains centered and balanced.

```html
<mai-radio id="fruit-pear" name="fruit" value="Pear" size="large"></mai-radio>
```

### Checked State
- `:host(${checkedState})` switches the host background to `backgroundCtrlActiveBrandRest` and the border to `strokeCtrlOnActiveBrandRest`.
- The checked indicator becomes visible with `foregroundCtrlOnActiveBrandRest`, shifting to hover (`foregroundCtrlOnActiveBrandHover`) and active (`foregroundCtrlOnActiveBrandPressed`) colors as interaction continues.

```html
<!-- Storybook: Core/Radio › Checked -->
<mai-radio id="fruit-orange" name="fruit" value="Orange" checked></mai-radio>
```

### Hover & Active Hint
- When not checked, hover and active states reveal the indicator as a hint using `foregroundCtrlHintDefault` and animate its diameter between `ctrlChoiceRadioDotSizeHover` and `ctrlChoiceRadioDotSizePressed`.
- Use this behavior to communicate impending selection; it automatically disables when the control is inactive.

```html
<!-- Same markup as Default; hover/active behavior is token-driven. -->
<mai-radio id="fruit-apple" name="fruit" value="Apple"></mai-radio>
```

### Disabled States
- Disabled radios lock the border to `ctrlChoiceBaseStrokeDisabled` and background to `ctrlChoiceBaseBackgroundDisabled` while preventing hover/active transitions.
- When both disabled and checked, the indicator stays visible and uses `foregroundCtrlOnActiveBrandDisabled` to maintain contrast.

```html
<!-- Storybook: Core/Radio › Disabled -->
<mai-radio id="fruit-grape" name="fruit" value="Grape" disabled></mai-radio>

<!-- Storybook: Core/Radio › DisabledChecked -->
<mai-radio id="fruit-banana" name="fruit" value="Banana" disabled checked></mai-radio>
```

### Field Integration
- When slotted into `mai-field`, host focus handling defers to the field and the radio inherits the field’s layout spacing. The component still respects all interaction tokens for checked/disabled states.

```html
<!-- Storybook: Core/Radio › Field -->
<mai-field label-position="after">
  <label slot="label">Apple</label>
  <mai-radio slot="input" name="fruit" value="Apple"></mai-radio>
</mai-field>
```

### Forced-Colors Support
- Within `(forced-colors: active)` the host swaps to system colors (`FieldText`, `Canvas`, `Highlight`, `GrayText`) for border and indicator, ensuring legibility in high-contrast themes.
- Disabled styling maps to `GrayText`, while checked hover uses `Highlight` to keep differentiation clear.

```html
<!-- Forced-colors mode is applied by the OS; no additional markup is required. -->
<mai-radio id="fruit-forced" name="fruit" value="Plum"></mai-radio>
```

## Token Reference
Key design tokens consumed by the radio styles:
- `ctrlChoiceBaseBackgroundRest`
- `ctrlChoiceBaseBackgroundDisabled`
- `ctrlChoiceBaseStrokeRest`
- `ctrlChoiceBaseStrokeHover`
- `ctrlChoiceBaseStrokePressed`
- `ctrlChoiceBaseStrokeDisabled`
- `ctrlChoiceBaseStrokeWidthRest`
- `ctrlChoiceBaseStrokeWidthHover`
- `ctrlChoiceBaseStrokeWidthPressed`
- `ctrlChoiceRadioCorner`
- `ctrlChoiceRadioDotSizeRest`
- `ctrlChoiceRadioDotSizeHover`
- `ctrlChoiceRadioDotSizePressed`
- `backgroundCtrlActiveBrandRest`
- `backgroundCtrlActiveBrandHover`
- `backgroundCtrlActiveBrandPressed`
- `strokeCtrlOnActiveBrandRest`
- `strokeCtrlOnActiveBrandHover`
- `strokeCtrlOnActiveBrandPressed`
- `foregroundCtrlOnActiveBrandRest`
- `foregroundCtrlOnActiveBrandHover`
- `foregroundCtrlOnActiveBrandPressed`
- `foregroundCtrlOnActiveBrandDisabled`
- `foregroundCtrlHintDefault`
- `ctrlBooleanSelectionHint`
- `ctrlFocusOuterStroke`
- `ctrlFocusOuterStrokeWidth`

Update these tokens through the design token system rather than per-instance overrides to keep the component visually consistent across experiences.
