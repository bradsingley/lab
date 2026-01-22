# Dropdown Style Guidelines

Use `<mai-dropdown>` to present a selectable list inside form layouts. The component extends the FAST dropdown and inherits its selection logic while applying MAI design tokens and surface rules.

## Component Anatomy

- **Host (`mai-dropdown`)**: inline-flex container that stretches to fill available inline size (min-width 160px).
- **`.control` container**: internal flex wrapper around the trigger content and indicator.
- **Default slot**: place trigger content such as selected text (provided by the component) and any inline form elements.
- **`<mai-listbox>` child**: required list container for `<mai-option>` items; rendered in a popover.
- **`indicator` slot**: optional slot for a custom end icon.

## Configurable Inputs

| Attribute | Type | Description |
| --- | --- | --- |
| `type` | `DropdownType` enum (`action`, `native`, etc.) | Choose the underlying trigger behaviour from FAST options. |
| `placeholder` | `string` | Placeholder text shown when no option is selected; also used as helper label in examples. |
| `multiple` | `boolean` | Enable multi-selection. The popover remains open while toggling options. |
| `required` | `boolean` | Participate in native form validation. |
| `disabled` | `boolean` | Disables user interaction and applies disabled styling. |
| `slot` | `string` | Use `input` when nesting inside `<mai-field>`; omit for inline usage. |

### Authoring Slots and Children

- Wrap all options in a single `<mai-listbox>` child. Options use the default slot inside the listbox.
- Provide custom indicator content via `<span slot="indicator">...</span>` or by slotted button/input elements.
- Additional interactive children can be slotted (`input`, `button`), but they inherit reset styles and fill available space.

## Style States and Layout Rules

### Default Trigger

- Host is `inline-flex`; inherits text color from `foregroundCtrlNeutralPrimaryRest`.
- `.control` uses squircle corners, `sizeCtrlDefault` minimum block size, horizontal padding from tokens, and `gapInsideCtrlDefault` between text and indicator.
- Bottom border is a thin inner stroke (`ctrlInputBottomLineStrokeRest`).
- Popover trigger is anchored using `anchor-name: --dropdown-trigger` so the listbox aligns to the trigger width.

**Visibility & Layout**
- Indicator slot items are forced to `aspect-ratio: 1`, inline-flex center aligned, width 20px.
- Slotted `<input>` expands (`flex: 1 1 auto`) with text cursor; slotted `<button>` inherits pointer cursor.
- Popover `<mai-listbox>` is hidden until open; with modern browsers it anchors to the trigger, otherwise falls back to absolute positioning and capped height `50vh`.

**Example**

```html
<mai-field>
  <label slot="label">Select a fruit</label>
  <mai-dropdown slot="input" placeholder="Select a fruit">
    <mai-listbox>
      <mai-option value="apple">Apple</mai-option>
      <mai-option value="banana">Banana</mai-option>
      <mai-option value="orange">Orange</mai-option>
    </mai-listbox>
  </mai-dropdown>
</mai-field>
```

### Placeholder Shown

- When no value is selected (`state--placeholder-shown`), host color drops to `foregroundCtrlNeutralSecondaryRest` for subdued text.
- Layout remains identical to default; ensure placeholder strings are short enough to avoid horizontal overflow.

### Focus & Open

- Focus-visible currently uses `:focus-within`; control gains inner stroke (`ctrlFocusInnerStroke`) and outer outline (`ctrlFocusOuterStroke`).
- Opening the dropdown scales the bottom selection line to full width with decelerate/accelerate timing.
- Avoid removing focus outlines to preserve accessibility.

**Example**

```html
<mai-dropdown placeholder="Select fruits" multiple>
  <mai-listbox>
    <mai-option value="apple">Apple</mai-option>
    <mai-option value="banana">Banana</mai-option>
    <mai-option value="mango">Mango</mai-option>
  </mai-listbox>
</mai-dropdown>
```

### Hover

- Hovering the host swaps background to `ctrlInputBackgroundHover` and raises text color to `foregroundCtrlNeutralPrimaryHover`.
- Bottom rule switches to `ctrlInputBottomLineStrokePressed`.
- Indicator slot inherits the same text color automatically.

### Active / Pressed

- Active state uses `ctrlInputBackgroundPressed` and `foregroundCtrlNeutralPrimaryPressed` for text.
- Maintain adequate contrast by avoiding custom inline colors that conflict with these tokens.

### Disabled

- Host disables pointer events, removes decorative bottom lines, and applies `ctrlInputBackgroundDisabled` with `foregroundCtrlNeutralPrimaryDisabled` text.
- Indicator slot also desaturates; slotted inputs/buttons inherit the disabled cursor.

**Example**

```html
<mai-field disabled>
  <label slot="label">Select a fruit</label>
  <mai-dropdown slot="input" placeholder="Select a fruit" disabled>
    <mai-listbox>
      <mai-option value="apple">Apple</mai-option>
      <mai-option value="banana">Banana</mai-option>
    </mai-listbox>
  </mai-dropdown>
</mai-field>
```

### Inline Usage

- Removing the `slot` attribute lets the trigger flow inline with text while keeping `inline-flex` display.
- Surrounding copy should handle baseline alignment; maintain short placeholder text for smooth inline flow.

**Example**

```html
<p>
  Some text inline with the
  <mai-dropdown placeholder="Select a fruit">
    <mai-listbox>
      <mai-option value="apple">Apple</mai-option>
      <mai-option value="banana">Banana</mai-option>
    </mai-listbox>
  </mai-dropdown>
  and more text.
</p>
```

### Popover Density

- Popover inherits trigger width via anchor positioning; override with `--listbox-max-height` when large data sets are present.
- For non-`anchor-name` browsers the component sets `--margin-offset` (trigger height + border) and caps height at `50vh`.

**Example**

```html
<mai-dropdown slot="input" placeholder="Select a Country">
  <mai-listbox>
    <mai-option>Afghanistan</mai-option>
    <mai-option>Albania</mai-option>
    <mai-option>Algeria</mai-option>
    <!-- additional options omitted for brevity -->
  </mai-listbox>
</mai-dropdown>
```

### Form Validation

- When `required`, native validity checks run against selection state. Use within a `<form>` and call `checkValidity()` on submit.
- Include reset buttons to clear selection; placeholder text guides re-selection.

**Example**

```html
<form>
  <mai-field>
    <label slot="label">Select fruits</label>
    <mai-dropdown slot="input" placeholder="Select fruits" required multiple>
      <mai-listbox>
        <mai-option value="apple">Apple</mai-option>
        <mai-option value="banana">Banana</mai-option>
      </mai-listbox>
    </mai-dropdown>
  </mai-field>
  <div>
    <mai-button type="submit" appearance="primary">Submit</mai-button>
    <mai-button type="reset">Reset</mai-button>
  </div>
  <span hidden id="success-message">Form submitted successfully!</span>
</form>
```

### Disabled Options

- Individual `<mai-option>` children accept `disabled`; they render but cannot be selected.
- Combine enabled and disabled options to guide choice without removing context.

**Example**

```html
<mai-dropdown slot="input" placeholder="Select a fruit">
  <mai-listbox>
    <mai-option value="apple" disabled>Apple</mai-option>
    <mai-option value="banana">Banana</mai-option>
    <mai-option value="mango" disabled>Mango</mai-option>
  </mai-listbox>
</mai-dropdown>
```

## Forced-Colors Support

- In high contrast modes (`forced-colors: active`), outlines switch to system `Highlight` and disabled indicators use `GrayText`. Avoid overriding these values.

## Development Checklist

- Import `DropdownType` from `@mai-ui/dropdown` or `./dropdown.options.js` to avoid hard-coded strings.
- Always wrap long option lists in `mai-listbox` and prefer async loading for over 100 items.
- Verify focus management, keyboard navigation, and popover alignment in both modern and fallback browsers.
- Pair dropdowns with `<mai-field>` to inherit label and helper text patterns where form context is required.
