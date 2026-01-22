# Text Style Guidelines

The `mai-text` component exposes Fluent-inspired typography tokens for body copy, captions, and display styles. Use this guide to understand which attributes, slots, and CSS properties can be configured and how each style variant affects layout and visibility.

## Configuration Surface

- **Tag name**: `mai-text`
- **Attributes**:
  - `size="100|200|300|400|500|600|700|800|900|1000"`
  - `weight="regular|medium|semibold|bold"`
  - `font="base|numeric|monospace"`
  - `align="start|center|end|justify"`
  - Booleans: `block`, `nowrap`, `truncate`, `italic`, `underline`, `strikethrough`
- **Slots**: default slot only; any slotted element inherits the host font, line height, and text decorations. Semantic tags (`h1`–`h6`, `p`, `pre`, `span`) may be supplied depending on document structure needs.
- **CSS custom properties** (scoped to the host): `--font-weight-bold`, `--font-weight-medium`, `--font-weight-regular`, `--font-weight-semibold`, `--font-family-monospace`, `--font-family-numeric`
- **Display defaults**: renders inline by default (`display: inline`), uses `contain: content` for layout isolation, and aligns text to `start` unless overridden.

## Layout and Style Rules

### Default inline text
- Uses `textGlobalBody3` tokens for font size and line height when no `size` is set (equivalent to `size="300"`).
- Slotted content inherits typography styles; margins on child elements are reset to avoid double spacing.
- Inline layout allows the component to flow with surrounding text. Use `block` when you need it to span its own line.
- Example (derived from the `Text` story’s default args):

```html
<mai-text>The quick brown fox jumped over the lazy dog.</mai-text>
```

### Block layout (`block` attribute)
- Forces `display: block`, letting the text occupy the full available width and enabling vertical stacking.
- Example (`Block` story):

```html
<span>
  <mai-text><span>Fluent text is inline by default. Setting</span></mai-text>
  <mai-text block><span>block</span></mai-text>
  <mai-text><span>will make it behave as a block element.</span></mai-text>
</span>
```

### Wrapping control (`nowrap`, `truncate`)
- `nowrap` sets `white-space: nowrap` on the host and slotted content; overflowing text will extend horizontally.
- Combine `truncate` with `nowrap` to apply an ellipsis when content exceeds the container width.
- Both modes rely on an explicit width constraint from the parent container.
- Examples (`Nowrap`, `Truncate` stories):

```html
<mai-text nowrap>
  <div style="display: block; width: 320px; border: 1px solid black;">
    This text will not wrap lines when it overflows the container.
  </div>
</mai-text>
```

```html
<mai-text truncate nowrap>
  <div style="display: block; width: 320px; border: 1px solid black;">
    Setting <code>truncate</code> and <code>nowrap</code> will truncate when it overflows the container.
  </div>
</mai-text>
```

### Emphasis treatments (`italic`, `underline`, `strikethrough`)
- `italic` toggles `font-style: italic`.
- `underline` applies `text-decoration-line: underline`; `strikethrough` applies `line-through`. When combined, both decorations are rendered.
- Example stories:

```html
<mai-text italic>
  <span>Italics are emphasized text.</span>
</mai-text>
```

```html
<mai-text underline>
  <span>Underlined text draws the reader's attention to the words.</span>
</mai-text>
```

```html
<mai-text strikethrough>
  <span>Strikethrough text is used to indicate something that is no longer relevant.</span>
</mai-text>
```

### Size ramp (`size` attribute)
- Typography scales through design token ramps, from caption (`100`) up to display (`1000`).
- Sizes without explicit overrides (e.g., `300`) inherit the default Body3 metrics.
- Example (`Size` story):

```html
<div>
  <mai-text block size="100"><span>100</span></mai-text>
  <mai-text block size="200"><span>200</span></mai-text>
  <mai-text block size="300"><span>300</span></mai-text>
  <mai-text block size="400"><span>400</span></mai-text>
  <mai-text block size="500"><span>500</span></mai-text>
  <mai-text block size="600"><span>600</span></mai-text>
  <mai-text block size="700"><span>700</span></mai-text>
  <mai-text block size="800"><span>800</span></mai-text>
  <mai-text block size="900"><span>900</span></mai-text>
  <mai-text block size="1000"><span>1000</span></mai-text>
</div>
```

### Weight ramp (`weight` attribute)
- Applies the corresponding token-derived font weight. Defaults to `regular` when unset.
- `semibold` and `bold` both map to higher weights; `bold` intentionally mirrors the semibold token (`font-weight-semibold`) for Fluent 2 parity.
- Example (`Weight` story):

```html
<div>
  <mai-text block weight="regular"><span>This text is regular.</span></mai-text>
  <mai-text block weight="medium"><span>This text is medium.</span></mai-text>
  <mai-text block weight="semibold"><span>This text is semibold.</span></mai-text>
  <mai-text block weight="bold"><span>This text is bold.</span></mai-text>
</div>
```

### Alignment (`align` attribute)
- Sets `text-align` on the host and all slotted children. `justify` distributes wrapped lines to span the container width.
- Example (`Align` story):

```html
<div
  style="display: flex; flex-direction: column; gap: 20px; width: 320px; border-left: 1px solid #000; border-right: 1px solid #000;"
>
  <mai-text block align="start">
    <span>Start aligned block.</span>
  </mai-text>
  <mai-text block align="end">
    <span>End aligned block.</span>
  </mai-text>
  <mai-text block align="center">
    <span>Center aligned block.</span>
  </mai-text>
  <mai-text block align="justify">
    <span>Justify aligned block text stretches wrapped lines to meet container edges.</span>
  </mai-text>
</div>
```

### Font families (`font` attribute)
- `base` uses the default semantic font family token.
- `numeric` switches to a numerals-focused font stack with a fallback set for Windows legacy parity.
- `monospace` uses the monospace design token, useful for code snippets.
- Example (`Font` story):

```html
<div>
  <mai-text block font="base"><span>Font base.</span></mai-text>
  <mai-text block font="numeric"><span>Font numeric 0123456789.</span></mai-text>
  <mai-text block font="monospace"><span>Font monospace.</span></mai-text>
</div>
```

## Development Notes

- The component respects container width. Apply parent constraints (e.g., `max-width`) to manage wrapping or truncation.
- All typography ramps align with global design tokens (`textGlobal*`), so updating tokens will cascade through every size.
- Avoid mixing semantic tags inside the slot unless they match document outline needs; the host does not alter heading levels.
- When using `truncate`, supply an accessible tooltip or `title` attribute so full content remains discoverable.
