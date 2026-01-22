# Tree Style Guidelines

The `mai-tree` component wraps Fluent UI's tree foundation and pairs it with MAI tokens through the tree-item suite. Use these notes when placing hierarchical navigation or disclosure lists so interaction, focus, and icon alignment remain consistent with the MAI system.

## Configuration Surface

- **Tag name**: `mai-tree`
- **Role**: `tree`; established automatically on the host and wired to keyboard and focus handlers via the FAST template.
- **Slots**: default slot only; populate it with `mai-tree-item` instances. Those child items expose their own `start`, `end`, and `aside` slots for icons or badges.
- **Public field**: `currentSelected` (read-only at runtime) reflects the last `mai-tree-item` whose `selected` flag was set, enabling host applications to query selection state without DOM traversal.
- **Related attributes**: all stateful flags (`expanded`, `selected`, `disabled`) and nesting semantics are configured on `mai-tree-item` children. `mai-tree` itself adds no additional appearance variants.

## Styles and Layout

### Base host (from `packages/core/tree/src/tree.styles.ts`)

- Renders as `display: block`, so the tree stretches to the width of its container and participates as a block-level element in layout calculations.
- Removes the native focus ring with `outline: none`; rely on focused tree items to render the visible focus indicator. When embedding inside focus-managed regions, ensure background contrast makes the tree-item focus treatment visible.
- No additional visibility, sizing, or spacing rules are applied at the host level. Height grows intrinsically with the number and expansion state of slotted `mai-tree-item` nodes.

## Content Structure Guidelines

- Place only `mai-tree-item` children in the default slot; mixed interactive content can break keyboard navigation sequencing inherited from FAST.
- Use the tree-item `start` and `end` slots for 16×16 icons or status badges. The `aside` slot is intended for compact metadata aligned to the right edge of the item row.
- Leverage the child `expanded` attribute to control branch visibility. Because collapsed nodes are removed from the active descendant sequence, ensure default-expanded paths include the currently selected item when presenting contextual detail panes.
- Nest tree items up to your product’s depth limits; keyboard interactions (arrow keys, Home/End, Enter, Space) are wired by the base implementation and do not require manual handlers.

## Usage Example

Copied from `packages/core/tree/src/tree.stories.ts` `Default` story for reference:

```ts
html`<mai-tree>
  <mai-tree-item expanded>
    Item 1
    <mai-tree-item><span slot="start">${CalendarIcon}</span>Item 1-1<span slot="end">${FilterIcon}</span></mai-tree-item>
    <mai-tree-item>Item 1-2</mai-tree-item>
    <mai-tree-item>Item 1-3<span slot="end">${FilterIcon}</span></mai-tree-item>
  </mai-tree-item>
  <mai-tree-item expanded>
    <span slot="start">${CalendarIcon}</span>
    Item 2
    <svg
      slot="aside"
      fill="red"
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.2 8.83a.2.2 0 0 1-.4 0l-.86-4.56a1.07 1.07 0 1 1 2.12 0L8.2 8.83ZM8 2a2.07 2.07 0 0 0-2.04 2.46l.86 4.56a1.2 1.2 0 0 0 2.36 0l.86-4.56A2.07 2.07 0 0 0 8 2Zm0 11a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Zm0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill="red"
      ></path>
    </svg>
    <mai-tree-item>
      Item 2-1
      <mai-tree-item>
        Item 2-1-1
        <mai-tree-item selected>Item 2-1-1-1</mai-tree-item>
        <mai-tree-item>Item 2-1-1-1</mai-tree-item>
      </mai-tree-item>
      <mai-tree-item>Item 2-1-2</mai-tree-item>
    </mai-tree-item>
    <mai-tree-item>Item 2-2</mai-tree-item>
    <mai-tree-item> Item 2-3<span slot="end">${FilterIcon}</span></mai-tree-item>
  </mai-tree-item>
</mai-tree>`
```

> Replace `${CalendarIcon}` and `${FilterIcon}` with inline SVGs or icon components used in your application layer. The snippet demonstrates how the `start`, `end`, and `aside` slots align supplementary visuals.

## Development Notes

- Query `tree.currentSelected` to synchronize external panels (e.g., detail views) whenever the user navigates with keyboard shortcuts. Listen for the bubbling `change` events emitted by `mai-tree-item` to detect selection updates.
- Because the host removes its outline, ensure the focused tree-item styling in your theme passes accessibility contrast checks against the surrounding surface.
- Compose tree density by adjusting padding on `mai-tree-item`; the tree host does not enforce row height, allowing suite-level tokens to tune compact versus roomy presentations. Integrate those adjustments across the entire tree instance for consistent hit targets.
- When rendering large data sets, consider lazy-loading expanded branches. The FAST foundation only instantiates slotted markup, so it is safe to progressively add `mai-tree-item` children as users explore the hierarchy.
