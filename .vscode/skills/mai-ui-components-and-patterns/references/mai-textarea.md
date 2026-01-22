# TextArea Style Guidelines

## Overview
The `mai-textarea` component provides a multiline text control that inherits Fluent UI functionality while applying MAI design tokens. It renders as an inline-block element by default, with a squircle-outline container, neutral background, and dynamic focus underline. Use this guideline to configure attributes, slots, and styling states consistently across experiences.

## Registration & Tag
- Tag name: `<mai-textarea>` (see `packages/core/textarea/src/textarea.options.ts`)
- Automatically registered when `@mai-ui/core/textarea` bundle is imported.

## Configurable API

### Attributes & Properties
| Attribute / Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `autocomplete` | `TextAreaAutocomplete \| string` | – | Pass values from `TextAreaAutocomplete` export for canonical hints.
| `autofocus` | `boolean` | `false` | Moves focus to the control after load.
| `auto-resize` | `boolean` | `false` | Allows height to grow with content; see Auto-resize styles.
| `block` | `boolean` | `false` | Switches host display to block and allows width to fill container.
| `dirname` | `string` | – | Submits text direction metadata with form data.
| `disabled` | `boolean` | `false` | Applies disabled styling and suppresses interaction.
| `form` | `string` | – | Associates the control with an external `<form>` by id.
| `maxlength` | `number` | – | Limits characters; enforcement handled by native textarea.
| `minlength` | `number` | – | Requires minimum characters.
| `name` | `string` | – | Field name when posting form data.
| `placeholder` | `string` | – | Placeholder text styled with secondary neutral color.
| `readonly` | `boolean` | `false` | Locks editing while keeping value selectable.
| `required` | `boolean` | `false` | Works with form validation; label slot can mirror requirement state.
| `resize` | `TextAreaResize` | `TextAreaResize.none` | Controls user resize handles (`none`, `horizontal`, `vertical`, `both`).
| `spellcheck` | `boolean` | `false` | Opts into native spellchecking.
| `value` | `string` | – | Sets current textarea value; children text nodes become initial value.

**Appearance**: No alternate `appearance` variants are defined in MAI tokens. The component ships with a single neutral style set.

### Slots
- `label`: Optional content placed before the control. Hidden automatically when empty.
- _(default slot)_: Hidden container used to provide initial text value. Text nodes become the control value; markup is flattened to plain text.

### Parts
Style the shadow DOM via:
- `label`
- `root`
- `control`

## Style Reference
Token assignments live in `packages/core/textarea/src/textarea.styles.ts`. Key layout values: inline width `18rem`, minimum block size `52px`, horizontal padding `paddingCtrlHorizontalDefault`, and squircle corner radius `cornerCtrlRest`.

### Base
- `:host` is `inline-block`; color tokens map to neutral foreground/background.
- `.root` is a grid container with hidden overflow and padding; `::after` focus underline is collapsed initially.
- The textarea inherits typography (`textRampItemBody` tokens) and zeroes default border.

```html
<mai-textarea>
  <span slot="label">Sample textarea</span>
</mai-textarea>
```

### Placeholder
- Placeholder text uses `foregroundCtrlNeutralSecondaryRest`.
- Works alongside base padding and inline width.

```html
<mai-textarea placeholder="This is a placeholder">
  <span slot="label">Sample textarea with placeholder</span>
</mai-textarea>
```

### Hover & Active
- `:host(:hover)` updates border and underline tokens to hover strokes.
- `:host(:active)` switches to pressed strokes for border and underline.
- No Storybook sample; interactions occur automatically on pointer states.

### Focus Within
- `:host(:focus-within)` removes outlines and animates `.root::after` to full width with `ctrlInputBottomLineStrokeSelected` color.
- Transition easing uses custom cubic-bezier tokens.

### Block Layout
- **IMPORTANT** `block` attribute sets host `display: block` and makes `.root` stretch to container width.
- Retains min height and padding.

```html
<!-- Inline (default) -->
<mai-textarea>
  <span slot="label">Inline (default)</span>
</mai-textarea>

<!-- Block layout -->
<mai-textarea block>
  <span slot="label">Block</span>
</mai-textarea>
```

### Auto-resize
- `auto-resize` switches container sizing to `block-size: auto` and `contain: inline-size`.
- `.auto-sizer` ghost element mirrors content to drive height; becomes `display: block`.
- User resize handles remain disabled unless `resize` is set.

```html
<mai-textarea auto-resize>
  <span slot="label">Sample textarea with autoResize</span>
</mai-textarea>
```

### Resize Handles
- `resize` attribute adjusts `--_resize`, controlling CSS `resize` on `.root`.
- Options map directly to `TextAreaResize` enum.

```html
<!-- None (default) -->
<mai-textarea resize="none">
  <span slot="label">None (default)</span>
</mai-textarea>

<!-- Horizontal -->
<mai-textarea resize="horizontal">
  <span slot="label">Horizontal</span>
</mai-textarea>

<!-- Vertical -->
<mai-textarea resize="vertical">
  <span slot="label">Vertical</span>
</mai-textarea>

<!-- Both -->
<mai-textarea resize="both">
  <span slot="label">Both</span>
</mai-textarea>
```

### Invalid State
- Applying `user-invalid` state (set via constraint validation) swaps border and underline to `ctrlInputStrokeError`.
- Focus indicator stays aligned with error color.

### Disabled
- Disabled overrides color, background, border, and placeholder tokens to disabled variants; pointer interactions blocked, text is non-selectable.
- Focus underline is removed.

```html
<mai-textarea disabled resize="both">
  <span slot="label">Sample disabled textarea</span>
  This textarea is disabled
</mai-textarea>
```

### Read-only
- `readonly` removes animated focus underline and keeps interactions limited to selection.

```html
<mai-textarea readonly resize="both">
  <span slot="label">Sample read-only textarea</span>
  Some content
</mai-textarea>
```

### Required
- Works with native form validation; keeps focus animation available.
- Labels can reflect requirement via `?required` binding in Storybook.

```html
<form id="required-form" action="#">
  <mai-textarea required>
    <span slot="label">Required Input</span>
  </mai-textarea>
  <div><button type="submit">Submit</button></div>
</form>
```

### Forced Colors Mode
- In `@media (forced-colors: active)` the component maps borders and placeholder to high-contrast system colors; hover/active/focus reuse `Highlight`.

### Selection Styling
- Text selection colors use `ctrlInputTextSelectionForeground` and `ctrlInputTextSelectionBackground` tokens.

### Auto-filled Value via Slot Content
- Default slot content is hidden but still parsed as textarea value. HTML is rendered as literal text, ensuring no markup executes.

```html
<mai-textarea auto-resize resize="both">
  <span slot="label">Sample textarea with html code</span>
  <p>This text should show up as plain text.</p>
  <img src="logo.svg" alt="" />
  <script>alert(1);</script>
  <custom-text>hello</custom-text>
</mai-textarea>
```

## Implementation Notes
- `.control` uses `field-sizing: content` and inherits font metrics, keeping scrollbars off until required.
- `.auto-sizer` adds a 2px padding-bottom offset to avoid Firefox scrollbars.
- `corner-shape: squircle` progressively enhances radius when supported; `--_squircle-modifier` increases in supporting environments.
- The host sets `contain: size` by default to isolate layout calculations; auto-resize switches to inline-size containment.
