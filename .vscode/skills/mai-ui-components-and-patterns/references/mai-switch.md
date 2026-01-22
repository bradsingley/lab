# Switch Style Guidelines

This document captures the available configuration, styling behaviors, and usage patterns for the `mai-switch` component.

## Component Definition
- **Tag name:** `mai-switch` (derived from `ComponentDesignSystem.prefix`).
- **Appearance:** Single brand treatment; no public `appearance` attribute.
- **Base class:** Extends the Fluent `Switch`, retaining form-associated behavior, custom states, and ARIA wiring.

## Configurable API

### Attributes and Properties
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | boolean | `false` | Toggles the on/off state. Mirrors `aria-checked` and updates `checkedState` for styling. |
| `disabled` | boolean | `false` | Removes interactivity and applies disabled rail/thumb styling. |
| `required` | boolean | `false` | Marks the switch as required for form submission. Validation surfaces through `mai-field` messages. |
| `readonly` | boolean | `false` | Freezes the state visually and functionally while preserving focusability. Shares disabled styling for the thumb. |
| `name` | string | `"switch"` (storybook default) | Submitted name in form contexts. |
| `value` | string | `"on"` (inherited) | Submitted value when checked during form submission. |
| `form` | string | `undefined` | Associates the switch with an external `<form>` element by ID. |
| `slot` | string | `undefined` | Commonly set to `"input"` when placed inside `mai-field`. |

> Standard form control APIs (`checkValidity()`, `reportValidity()`, `setCustomValidity()`, `labels`, etc.) are inherited from the Fluent base without modification.

### Slots
- The component template owns the rail and thumb; there are no internal slots.
- When composing within host components, assign the desired external slot (e.g., `slot="input"` on the switch when used in `mai-field`).

### Events and Forms
- Emits native `input` and `change` events whenever `checked` changes, matching HTML switch semantics.
- Participates in form submission via the internal `input[type="checkbox"]` control.

## Layout and Style Rules
Styles are defined in `packages/core/switch/src/switch.styles.ts`. The table summarizes key selectors, layout rules, and the tokens behind them.

| Selector / State | Layout & Interaction Rules | Visual Tokens / Notes |
| --- | --- | --- |
| `:host` | `display: inline-flex`, horizontal layout, width/height driven by `--_switch-width` (`ctrlChoiceSwitchWidth`) and `--_switch-height` (`ctrlChoiceSwitchHeight`). Padding defaults to `ctrlChoiceSwitchPaddingRest`. | Background `ctrlChoiceSwitchBackgroundDefault`; border simulated through the `::before` pseudo-element using `ctrlChoiceSwitchStrokeRest`. Thumb dimensions start from `ctrlChoiceSwitchThumbWidthRest`. |
| `:host::before` | Absolutely positioned outline that mirrors the rail radius. | Border thickness `--_border-width` (`strokeWidthCtrlOutlineRest`) transitions on interaction. |
| Hover (`:host(:hover)`) | Increases border width and reduces padding to keep thumb centered. | Border color `ctrlChoiceSwitchStrokeHover`; thumb grows via hover tokens. |
| Active (`:host(:active)`) | Further adjusts padding to simulate press-in effect; pointer interaction maintained. | Border width `strokeWidthCtrlOutlinePressed`; thumb width uses `ctrlChoiceSwitchThumbWidthPressed`. |
| Disabled / Readonly (`:host(:disabled)`, `:host([readonly])`) | Pointer cues removed; padding/border reset to rest values. | Border color `ctrlChoiceSwitchStrokeDisabled`; thumb background `ctrlChoiceSwitchThumbBackgroundDisabled`. |
| Checked (`:host(${checkedState})`) | Applies filled rail background and shifts thumb to the end (`margin-inline-start: auto`). | Rail color `ctrlChoiceSwitchBackgroundSelectedRest`; border uses `strokeCtrlOnActiveBrandRest`; thumb background `ctrlChoiceSwitchThumbBackgroundSelectedRest`. |
| Checked hover/active | Maintains filled rail while respecting hover/active border tokens. | Uses `ctrlChoiceSwitchBackgroundSelectedHover/Pressed` and `strokeCtrlOnActiveBrandHover/Pressed`. |
| Checked disabled | Locks the filled rail and thumb to disabled palette. | Rail `ctrlChoiceSwitchBackgroundSelectedDisabled`; thumb `ctrlChoiceSwitchThumbBackgroundSelectedDisabled`. |
| Focus visible (`:host(:not([slot='input']):focus-visible)`) | Applies outer outline only when not delegated to `mai-field`. | Outline color `ctrlFocusOuterStroke`; inner border uses `ctrlFocusInnerStroke`. |
| `.checked-indicator` | Represents the thumb; centered by default with transitions for margin/size. | Background tokens shift for rest/hover/pressed states; shadows from `ctrlChoiceSwitchThumbShadow*`. |
| Forced colors | Converts rails and thumbs to system colors for high contrast. | Uses `Highlight`, `ButtonFace`, `GrayText`, etc., suppressing brand tokens. |

## Example Usage
Examples below are adapted from `packages/core/switch/src/switch.stories.ts`.

### Default Switch
```html
<mai-switch name="switch"></mai-switch>
```

### Checked Switch
```html
<mai-switch checked></mai-switch>
```

### Disabled Variants in a Field
```html
<mai-field label-position="after">
  <label slot="label">Disabled unchecked</label>
  <mai-switch disabled slot="input"></mai-switch>
</mai-field>
<mai-field label-position="after">
  <label slot="label">Disabled checked</label>
  <mai-switch checked disabled slot="input"></mai-switch>
</mai-field>
```

### Required Switch with Form Validation
```html
<form style="display: flex; gap: 1em; align-items: end">
  <div>
    <mai-switch id="required-mai-switch" required></mai-switch>
    <label for="required-mai-switch">Required</label>
  </div>
  <mai-field label-position="after">
    <label slot="label">Required</label>
    <mai-switch required slot="input"></mai-switch>
    <fluent-text slot="message" size="200" flag="valueMissing">
      <span>This field is required</span>
    </fluent-text>
  </mai-field>
  <mai-button type="submit">Submit</mai-button>
</form>
```

### Alternative Label Positioning
```html
<mai-field label-position="before">
  <label slot="label">Label before</label>
  <mai-switch slot="input"></mai-switch>
</mai-field>
```

### Long Label Wrapping
```html
<div style="width: 400px;">
  <mai-field label-position="after">
    <label slot="label">
      Here is an example of a switch with a long label and it starts to wrap to a second line
    </label>
    <mai-switch slot="input"></mai-switch>
  </mai-field>
</div>
```

> When the switch is slotted into `mai-field`, focus outlines originate from the field container. For standalone usage, the component draws its own focus ring based on the focus-visible selectors.
