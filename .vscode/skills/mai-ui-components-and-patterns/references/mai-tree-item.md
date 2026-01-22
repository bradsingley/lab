# Tree-Item Style Guidelines

`mai-tree-item` exposes the MAI-flavored wrapper around Fluent UI's tree item foundation. Use this guide when authoring navigation and disclosure trees so spacing, focus, and iconography stay aligned with MAI design tokens.

## Configuration Surface

- **Tag name**: `mai-tree-item`
- **Class**: `TreeItem` extends Fluent's `BaseTreeItem`, attaching a `treeitem` role through `ElementInternals`.
- **Public attributes / properties**: `expanded`, `selected`, `empty`, `dataIndent`; `toggleExpansion()` toggles `expanded` when child items exist.
- **Events**: `toggle` (fires when `expanded` changes) and `change` (fires when `selected` changes) bubble for upstream state management.
- **Appearance**: no alternate `appearance` variants. All styling derives from MAI tokens in `tree-item.styles.ts`.

## Slots and Parts

- **Default slot**: primary label content; text, inline icons, or other inline elements.
- **start / end slots**: inline adornments before and after the label. Icons are sized automatically.
- **aside slot**: far-aligned metadata or badges that sit at the row edge.
- **item slot**: houses nested `mai-tree-item` descendants; populated automatically when child items render.
- **chevron slot**: overrides the default expand chevron icon (optional).
- **Parts**: `positioning-region`, `content`, `chevron`, `aside`, `items` allow targeted theming when shadow parts are supported.

## Style Reference (`tree-item.styles.ts`)

### Host & Positioning Region

- Renders as `display: block`; typography locks to `textRampReadingBodyFontSize` / `textRampReadingBodyLineHeight` and regular weight.
- `.positioning-region` is a `flex` row with a minimum height of `sizeCtrlDefault`, inline gaps of `gapInsideCtrlDefault`, and rounded corners (`corner-shape: squircle`) driven by MAI list tokens.
- Indentation comes from `padding-inline-start` = `ctrlListIndentLevel1` + `--indent` * `(sizeCtrlIcon + gapInsideCtrlDefault)`; `dataIndent` updates `--indent`.
- Hover / active surfaces swap to `backgroundCtrlSubtleHover` / `backgroundCtrlSubtlePressed` and matching `foregroundCtrlOnSubtle*` tokens; cursor is always pointer.
- Focus-visible draws an inset ring using `ctrlFocusOuterStrokeWidth` / `ctrlFocusOuterStroke`. High-contrast mode falls back to a 1px outline.

Example (`Default` story):

```html
<mai-tree-item>Item 1</mai-tree-item>
```

### Content Row (`.content`)

- Aligns center with `flex`, keeps `min-width: 0` to allow text wrapping or ellipsis provided by consumer styles.
- Leverages the global row gap so text and icons share consistent spacing.

Example (`LongText` story):

```html
<mai-tree-item>
  Really long tree-item content goes here. Lorem ipsum dolor sit amet.
</mai-tree-item>
```

### Chevron Region (`.chevron` and `slot="chevron"`)

- Fixed square footprint (`ctrlChoiceBaseSize`) and rotates from 0° to 90° on `[expanded]`; RTL flips the baseline to 180°.
- Transition uses `--_durationFaster` and `--_curveEasyEaseMax` easing. Supplying a `chevron` slot replaces the SVG while inheriting the same layout rules.
- When `[empty]` becomes true the chevron remains in-flow but hidden to preserve alignment.

_(No dedicated Storybook example overrides the chevron slot; use project-specific SVGs if you need a custom indicator.)_

### Aside Region (`.aside`)

- Flex container aligned center with `min-width: 0`; ideal for compact status badges or counts.
- Spacing is shared with the primary row gap so aside content stays visually balanced.

Example (`AsideSlot` story):

```html
<mai-tree-item>
  Item 1
  <span slot="aside">${FilterIcon}</span>
</mai-tree-item>
```

### Slotted Adornments (`start`, `end`, default slot selectors)

- `::slotted(:is(:not([slot]), [slot='start'], [slot='end']))` enforces flex alignment and zero minimum width so inline content stays centered.
- `::slotted(:is(svg, [slot='start'], [slot='end']))` clamps icon size to `sizeCtrlIcon` and colors them with `foregroundCtrlIconOnSubtle*` tokens.
- Hover / active states recolor icons to `foregroundCtrlIconOnSubtleHover` / `foregroundCtrlIconOnSubtlePressed`. When the host is `[selected]`, colors switch to `foregroundCtrlActiveBrand*` for visual emphasis.

Examples (`StartSlot`, `EndSlot`, `StartAndEndSlot` stories):

```html
<mai-tree-item>
  <span slot="start">${CalendarIcon}</span>
  Item 1
</mai-tree-item>

<mai-tree-item>
  Item 1
  <span slot="end">${FilterIcon}</span>
</mai-tree-item>

<mai-tree-item>
  <span slot="start">${CalendarIcon}</span>
  Item 1
  <span slot="end">${FilterIcon}</span>
</mai-tree-item>
```

### Nested Items Container (`.items` and `[expanded]` / `[empty]`)

- `.items` defaults to `display: none`; it switches to `block` when the host has `[expanded]`.
- `[empty]` hides both `.chevron` and `.items` via `visibility: hidden`, preserving the row measurements without showing expand affordances.
- Indentation cascades through `data-indent` on each nested child.

Example (`NestedTreeItem` story):

```html
<mai-tree-item>
  Item 1
  <mai-tree-item slot="item">
    Item 1-1
    <mai-tree-item slot="item">
      <span slot="start">${CalendarIcon}</span>
      Item 1-1-1
      <span slot="end">${FilterIcon}</span>
    </mai-tree-item>
    <mai-tree-item slot="item">Item 1-1-2</mai-tree-item>
    <mai-tree-item slot="item">Item 1-1-3<span slot="end">${FilterIcon}</span></mai-tree-item>
  </mai-tree-item>
</mai-tree-item>
```

### Interactive & Selection States

- `:host(:focus-visible)` applies the MAI focus treatment to `.positioning-region`; ensure surrounding surfaces provide adequate contrast.
- `:host([selected])` updates background to `ctrlListBackgroundSelected*`, increases weight to `textCtrlWeightSelected`, and recolors icons to the brand-active palette.
- `:host([expanded])` rotates the chevron and reveals `.items` while keeping layout intact.
- Pointer states (`:hover`, `:active`) change both surface and icon colors for responsive feedback.
- High-contrast users receive a fallback outline via the `@media (prefers-contrast: more)` block.

The Storybook stories rely on a click handler that calls `toggleExpansion()` and sets `selected`; you can preselect an item by adding the `selected` attribute yourself:

```html
<mai-tree-item selected>
  <span slot="start">${CalendarIcon}</span>
  Pre-selected item
</mai-tree-item>
```

## Development Guidelines

- `empty` is managed automatically: avoid toggling it manually; instead, add or remove nested `mai-tree-item` children.
- Use `toggleExpansion()` or set `expanded` when syncing with external state stores; it only has an effect when child items exist.
- The component expects to live inside `mai-tree`, which orchestrates keyboard navigation and selection scopes. When used standalone, ensure parent containers handle focus delegation appropriately.
- Customize density by adjusting MAI spacing tokens globally; the component reads all measurements from design tokens, so stay within the token system rather than hard-coding new values.
- When supplying SVGs in slots, inherit `currentColor` so state-driven color changes apply without extra styling.
