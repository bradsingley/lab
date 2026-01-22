# Text Input Style Guidelines

The `mai-text-input` component wraps the Fluent Text Input foundation with MAI design tokens and slot semantics. Use this guide to understand the configurable surface area, the styling rules defined in `packages/core/text-input/src/text-input.styles.ts`, and the code patterns available in Storybook.

## Configuration Surface

- **Tag name**: `mai-text-input`
- **Appearances**: `outline` (default), `underline`, `filled-lighter`, `filled-darker`
- **Control size**: `control-size="small|medium|large"` adjusts the overall height and padding tokens
- **Input type**: `type="text|email|password|tel|url"`; all other native input attributes (`name`, `value`, `pattern`, `placeholder`, `maxlength`, `minlength`, `autocomplete`, `dirname`, `spellcheck`, `list`, `form`, `size`) pass through to the underlying input element
- **Boolean toggles**: `autofocus`, `disabled`, `multiple`, `readonly`, `required`
- **Slots**:
  - Default slot — renders the associated `<label>`; whitespace-only content collapses and the label is hidden automatically
  - `slot="start"` — injects leading adornments (icons, buttons, plain text)
  - `slot="end"` — injects trailing adornments (icons, units, buttons)
- **Events**: native `input` and `change` events originate from the internal control; listen on the host element for form integration
- **Form participation**: supports constraint validation and implicit form submission when `type` permits it

## Layout and Styling Rules

- **Host & root container**
  - Host renders as `display: block` with Fluent body typography tokens and a `max-width` of 400px; **AlWAYS** override width inline or via CSS to expand.
  - `.root` is an `inline-flex` container that spans the host width, aligns items to the center, and applies `padding-inline` from `paddingCtrlHorizontalDefault`.
  - Corner radii use `corner-shape: squircle`; a private `--_squircle-modifier` scales the radius to 1.8 when `@supports (corner-shape: squircle)` succeeds.

- **Label visibility & spacing**
  - `.label` is flex-aligned and uses `padding-block-end: paddingCtrlTextBottom` to separate the control.
  - `defaultSlottedNodesChanged` hides the label when the default slot contains only text nodes with whitespace, ensuring no accidental blank label.
  - `.label[hidden]` and `:host(:empty) .label` remove the label from layout entirely.

- **Control field**
  - `.control` stretches to 100% width and height, inherits the host typography, and exposes the Fluent placeholder color.
  - Padding tokens (`paddingCtrlTextTop`, `paddingCtrlTextSide`, `paddingCtrlTextBottom`) maintain vertical rhythm; there is no resize affordance because the control is a single-line input.
  - Placeholder text and read-only states use the neutral secondary color token; readonly does not change layout, only color.

- **Slot adornments**
  - Slotted `start`/`end` content is forced into a flex box that centers items and applies the icon foreground color.
  - Icons default to `sizeCtrlIcon`; text inherits the host font.
  - Disabled state updates slotted content color to `foregroundCtrlNeutralSecondaryDisabled`.

- **Interactive borders**
  - Default border: `ctrlInputStrokeWidthRest` × `ctrlInputStrokeRest` with background `ctrlInputBackgroundRest`.
  - Hover: border width becomes `ctrlInputStrokeWidthHover`; color transitions to `ctrlInputStrokeHover`.
  - Active (pressed): border width uses `ctrlInputStrokeWidthPressed`; color changes to `ctrlInputStrokePressed`.
  - Focus within: the `.root::after` outline thickens to `ctrlInputStrokeWidthSelected` while the base border reverts to `strokeWidthDefault` and `ctrlInputStrokeRest`.

- **Validation state**
  - When the host or control is `:invalid`, the border and background shift to the error tokens, and text color changes to `statusDangerTintForeground`.
  - The focus outline also adopts the error stroke color.

- **Disabled state**
  - Background switches to `ctrlInputBackgroundDisabled`; border becomes `strokeWidthDefault` by `ctrlInputStrokeDisabled`.
  - Placeholder and slotted adornments dim to the disabled neutral token.

- **Selection styling**
  - Text selection uses `ctrlInputTextSelectionForeground` on `ctrlInputTextSelectionBackground` for consistent highlight contrast.

- **Inline usage**
  - Set `style="display: inline-flex"` on the host to inline the control and remove the block-level `max-width`. The `.root` layout remains inline-flex, maintaining label alignment.

## Storybook Examples

### Default

```html
<mai-text-input>
  Input Label
</mai-text-input>
```

### Without a visible label

```html
<mai-text-input aria-label="Input without a visible label"></mai-text-input>
```

### Disabled

```html
<mai-text-input disabled>
  Disabled Input
</mai-text-input>
```

### Placeholder

```html
<mai-text-input placeholder="Placeholder text">
  Input with a placeholder
</mai-text-input>
```

### Read-only

```html
<mai-text-input readonly value="Read-only value">
  Read-only input
</mai-text-input>
```

### Required field with trailing icon

```html
<form id="required-form" action="#">
  <mai-text-input id="required-input" required>
    Required Input
    <span slot="end">
      <svg
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-2 5a2 2 0 0 0-2 2c0 1.7.83 2.97 2.13 3.8A9.14 9.14 0 0 0 10 18c1.85 0 3.58-.39 4.87-1.2A4.35 4.35 0 0 0 17 13a2 2 0 0 0-2-2H5Zm-1 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1c0 1.3-.62 2.28-1.67 2.95A8.16 8.16 0 0 1 10 17a8.16 8.16 0 0 1-4.33-1.05A3.36 3.36 0 0 1 4 13Z"
        ></path>
      </svg>
    </span>
  </mai-text-input>
  <mai-button type="submit" appearance="primary">Submit</mai-button>
  <mai-button type="reset">Reset</mai-button>
  <span id="success-message" hidden>Form submitted successfully!</span>
</form>
```

### Start slot icon

```html
<mai-text-input>
  Input with a start slot
  <span slot="start">
    <svg
      fill="currentColor"
      aria-hidden="true"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-2 5a2 2 0 0 0-2 2c0 1.7.83 2.97 2.13 3.8A9.14 9.14 0 0 0 10 18c1.85 0 3.58-.39 4.87-1.2A4.35 4.35 0 0 0 17 13a2 2 0 0 0-2-2H5Zm-1 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1c0 1.3-.62 2.28-1.67 2.95A8.16 8.16 0 0 1 10 17a8.16 8.16 0 0 1-4.33-1.05A3.36 3.36 0 0 1 4 13Z"
      ></path>
    </svg>
  </span>
</mai-text-input>
```

### End slot icon

```html
<mai-text-input>
  Input with an end slot
  <span slot="end">
    <svg
      fill="currentColor"
      aria-hidden="true"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-2 5a2 2 0 0 0-2 2c0 1.7.83 2.97 2.13 3.8A9.14 9.14 0 0 0 10 18c1.85 0 3.58-.39 4.87-1.2A4.35 4.35 0 0 0 17 13a2 2 0 0 0-2-2H5Zm-1 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1c0 1.3-.62 2.28-1.67 2.95A8.16 8.16 0 0 1 10 17a8.16 8.16 0 0 1-4.33-1.05A3.36 3.36 0 0 1 4 13Z"
      ></path>
    </svg>
  </span>
</mai-text-input>
```

### Start and end adornments

```html
<mai-text-input>
  Input with Start and End Slots
  <span slot="start">$</span>
  <span slot="end">.00</span>
</mai-text-input>
```

### Slotted buttons

```html
<mai-text-input>
  Input with slotted end buttons
  <button slot="start">Button</button>
  <button slot="end">Button</button>
</mai-text-input>
```

### Inline usage

```html
<p>
  The quick brown
  <mai-text-input aria-label="Noun" style="display: inline-flex" placeholder="noun"></mai-text-input>
  jumped over the
  <mai-text-input aria-label="Adjective" style="display: inline-flex" placeholder="adjective"></mai-text-input>
  dog.
</p>
```

## Development Notes

- **IMPORTANT** The component enforces a maximum width only through CSS; override or remove via custom styles when a wider layout is required.
- Validation, focus, and disabled visuals are entirely token-driven, so theme packages can alter appearance without modifying component code.
- Always provide visible label content in the default slot or an `aria-label` for accessibility; the built-in label visibility guard only hides empty content.
- Start/end slots accept any inline content. Constrain interactive elements (like buttons) with CSS if they should not inherit the input height.
