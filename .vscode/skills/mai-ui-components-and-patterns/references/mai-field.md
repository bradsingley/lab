# Field Style Guidelines

Use `<mai-field>` to align form controls, labels, and helper text with the MAI grid and focus treatments. The component wraps any interactive control and exposes layout hooks for labels, validation messaging, and accessibility alignment.

## Component Definition
- **Tag name:** `mai-field` (constructed from `ComponentDesignSystem.prefix` + `-field`).
- **Appearance:** Inherits the MAI neutral control surface. The component does not expose an `appearance` attribute; styling is driven entirely by the scoped design tokens and slotted content.
- **Base class:** Extends Fluent UI's `Field`, retaining FAST form-associated behaviour while layering MAI spacing, outline, and validation flag styling.
- **Label strategy:** Defaults to placing the label before the control in the vertical flow (`label-position="above"`) but can be changed per instance using the `LabelPosition` enum.

## Configurable API

### Attributes and States
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label-position` | `LabelPosition` (`"above" \| "before" \| "after"`) | `"above"` | Chooses the layout relationship between the label, input, and message slots. Imported from `@mai-ui/field/options.js` to avoid hard-coded strings. |
| `state--required` | boolean (state token) | `false` | When present (set via `elementInternals.states` or `required` propagation), an asterisk is appended to the slotted label in `statusDangerTintForeground`. |
| `state--has-message` | boolean (state token) | `false` | Indicates that a message is present; ensures text color stays aligned with `foregroundCtrlNeutralPrimaryRest`. |
| `state--{validationFlag}` | boolean (state token) | `false` | Flags from `ValidationFlags` (`badInput`, `customError`, `patternMismatch`, `rangeOverflow`, `rangeUnderflow`, `stepMismatch`, `tooLong`, `tooShort`, `typeMismatch`, `valueMissing`, `valid`). When a matching `flag="..."` element is slotted, it becomes visible only while the state is active. |
| `disabled` | boolean | Depends on wrapped control | Not styled directly on the host, but when the containing control sets `:state(disabled)` the field suppresses pointer cues and desaturates the label color via `foregroundCtrlNeutralPrimaryDisabled`. |

### Slots
- **`slot="label"`**: Position the label element. Displayed inline-flex and stretches to the control width. Required for most controls except Text Input and Text Area (see README note).
- **`slot="input"`**: Required slot for the interactive control (checkbox, radio group, text input, etc.). The field grid aligns this slot based on `label-position`.
- **`slot="message"`**: Optional hint or validation text. Styled as inline-flex with icon-friendly spacing. Works with validation flag states when paired with `flag="..."`.
- **Default slot with `flag` attribute**: Provide pre-authored validation messages such as `<span flag="valueMissing" slot="message">...</span>`. Each message stays hidden until the corresponding state is set.

### Related Types
Import `LabelPosition` and `ValidationFlags` from `@mai-ui/field/options.js` to keep attribute values in sync with the component definition.

## Layout and Style Behaviour

### Host Grid and Spacing
- Host uses `display: inline-grid` with center alignment and a small column gap (`gapBetweenContentXSmall`).
- Horizontal padding is added via `gapInsideCtrlToLabel`, then counterbalanced with a negative margin so grouped fields remain visually aligned.
- The component inherits text color from `foregroundCtrlNeutralPrimaryRest`; it stays in sync when a message slot is present (`:has([slot="message"])`).

### Label Placement Rules
- **`label-position="above"` (default):** Label occupies row 1, input row 2, message row 3 in a single column grid. Labels here skip additional padding to keep vertical rhythm tight.
- **`label-position="before"`:** Label sits in column 1, input in column 2 (same row). Message renders on the next row under the input (column 2).
- **`label-position="after"`:** Field switches to a two-column grid (`auto 1fr`). Input remains column 1, label column 2. Messages span both columns on the second row.

### Focus and Corner Treatment
- When any slotted control reports focus-visible, the host outlines with `ctrlFocusOuterStroke` using a squircle corner (`corner-shape: squircle`) when supported. A fallback modifier keeps corner radii balanced when squircle is unavailable.

### Message Slot Styling
- Messages render as `display: flex` with center alignment, allowing inline icons. Horizontal spacing combines `gapBetweenContentXSmall` and `paddingCtrlTextSide`.
- Typography follows metadata ramp tokens (`textRampMetadataFontSize` / `LineHeight`).

### Required Indicator
- When `state--required` is set, an asterisk (`*`) is appended to the slotted label. The separator preserves whitespace so screen readers announce it clearly.

### Disabled Treatment
- When the wrapped control sets the shared `disabled` state, the field removes pointer cues (`cursor: default`) and fades the label to `foregroundCtrlNeutralPrimaryDisabled`.

### Validation Flag Messages
- Child nodes with `[flag]` are hidden by default. Once the host exposes the matching `state--{ValidationFlag}` the message becomes visible (`display: block`).
- Supply one message element per flag to avoid manual visibility toggles.

## Example Usage
The snippets below mirror the stories in `packages/core/field/src/field.stories.ts` and demonstrate canonical layouts.

### Default Field (`Default` story)
```html
<mai-field label-position="above">
  <label slot="label">Example field</label>
  <mai-checkbox slot="input"></mai-checkbox>
</mai-field>
```

### Label Position Variants (`LabelPositions` story)
```html
<div style="display: grid; gap: 16px;">
  <mai-field label-position="before">
    <label slot="label">Label position: before</label>
    <mai-checkbox slot="input"></mai-checkbox>
  </mai-field>

  <mai-field label-position="after">
    <label slot="label">Label position: after</label>
    <mai-checkbox slot="input"></mai-checkbox>
  </mai-field>

  <mai-field label-position="above">
    <label slot="label">Label position: above</label>
    <mai-checkbox slot="input"></mai-checkbox>
  </mai-field>
</div>
```

### Text Input Integration (`TextInput` story)
```html
<!-- Text inputs keep the label inside the control per package README guidance -->
<mai-field>
  <mai-text-input slot="input">Text Input</mai-text-input>
</mai-field>
```

### Form Submission Pattern (`TextInputFormSubmission` story)
```html
<form id="sample-form" style="display: inline-flex; flex-direction: column; align-items: flex-start; gap: 20px;">
  <mai-field>
    <mai-text-input slot="input" id="form-input" required>Form</mai-text-input>
  </mai-field>
  <mai-button type="submit">Submit</mai-button>
  <span id="success-message" hidden>Form submitted successfully!</span>
</form>
<script type="module">
  const form = document.querySelector('#sample-form');
  const input = form.querySelector('#form-input');
  const status = form.querySelector('#success-message');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.checkValidity()) {
      status.hidden = false;
    }
  });
  form.addEventListener('reset', () => {
    status.hidden = true;
  });
</script>
```

### Required Field Indicator (`Required` story)
```html
<mai-field label-position="after">
  <label slot="label">Required field</label>
  <mai-checkbox required slot="input"></mai-checkbox>
</mai-field>
```

### Disabled Control (`DisabledControl` story)
```html
<mai-field label-position="after">
  <label slot="label">Disabled field</label>
  <mai-checkbox disabled slot="input"></mai-checkbox>
</mai-field>
```

### Hint Messaging (`Hint` story)
```html
<mai-field label-position="above">
  <fluent-text-input slot="input">Field label</fluent-text-input>
  <span slot="message" size="200">
    <span style="display: flex; color: var(--status-success-tint-foreground);">
      <!-- CheckmarkCircle12FilledSVG inline -->
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <!-- SVG path omitted for brevity -->
      </svg>
    </span>
    Sample hint text.
  </span>
</mai-field>
```

### Component Mix (`ComponentExamples` story)
```html
<div style="display: flex; flex-direction: column; row-gap: 16px;">
  <mai-field>
    <mai-text-input slot="input" id="field-text">Text Input</mai-text-input>
  </mai-field>

  <mai-field label-position="above" style="max-width: 400px;">
    <label slot="label" for="field-slider">Slider</label>
    <mai-slider slot="input" id="field-slider" size="medium"></mai-slider>
  </mai-field>

  <mai-field label-position="after">
    <label slot="label" for="field-checkbox">Checkbox</label>
    <mai-checkbox slot="input" id="field-checkbox"></mai-checkbox>
  </mai-field>

  <mai-field label-position="above">
    <label slot="label" for="field-radio">Radio Group</label>
    <mai-radio-group slot="input" name="field-radio" orientation="vertical">
      <mai-field label-position="after">
        <label slot="label">Apple</label>
        <mai-radio slot="input" value="apple"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Pear</label>
        <mai-radio slot="input" value="pear"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Banana</label>
        <mai-radio slot="input" value="banana"></mai-radio>
      </mai-field>
      <mai-field label-position="after">
        <label slot="label">Orange</label>
        <mai-radio slot="input" value="orange"></mai-radio>
      </mai-field>
    </mai-radio-group>
  </mai-field>

  <mai-field>
    <mai-textarea slot="input" id="field-textarea" placeholder="Placeholder text" resize="both">
      <label slot="label">Text Area</label>
    </mai-textarea>
  </mai-field>
</div>
```

### Native Control Support (`ThirdPartyControls` story)
```html
<form style="display: flex; flex-flow: column; align-items: flex-start; gap: 10px;">
  <mai-field label-position="above" style="max-width: 400px;">
    <label slot="label" for="native-color">Color picker</label>
    <input slot="input" type="color" id="native-color" required />
  </mai-field>

  <mai-field label-position="after">
    <label slot="label" for="native-checkbox">Checkbox</label>
    <input slot="input" type="checkbox" id="native-checkbox" />
  </mai-field>
</form>
```

### Validation Flag Messaging (derived from `ValidationFlags` support)
```html
<mai-field label-position="above" id="email-field">
  <label slot="label" for="email-input">Email</label>
  <mai-text-input slot="input" id="email-input" type="email" required></mai-text-input>
  <span slot="message" flag="valueMissing">Email is required.</span>
  <span slot="message" flag="typeMismatch">Enter a valid email address.</span>
  <span slot="message" flag="valid">Looks good!</span>
</mai-field>
<script type="module">
  const input = document.querySelector('#email-input');
  input.addEventListener('input', () => input.reportValidity());
</script>
```

## Implementation Notes
- Prefer importing `definition` from `@mai-ui/field` rather than calling `Field.compose` directly; the MAI bundle sets `delegatesFocus` so keyboard navigation lands on the slotted control automatically.
- When building new controls, slot them into `<mai-field>` inside stories and tests to keep spacing consistent and so the Playwright harness can reuse the `fastPage` defaults.
- Verify focus outlines in browsers without `corner-shape` support to ensure the fallback radius (`--_squircle-modifier`) meets accessibility contrast requirements.
