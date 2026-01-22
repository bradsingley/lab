# Filter Style Guidelines

The `mai-filter` component arranges a horizontal group of `mai-filter-item` options and enforces single selection behavior. Use this guide to understand the configurable surface, slot expectations, and the layout rules applied by the shared style sheet.

## Configuration Surface

- **Tag name**: `mai-filter`
- **Dependencies**: requires one or more `mai-filter-item` children in the default slot.
- **Slots**:
  - Default slot &mdash; place `mai-filter-item` instances here; no named slots are exposed on `mai-filter` itself.
  - Each `mai-filter-item` supports an optional `slot="start"` region for icons or thumbnails that align with the filter text.
- **Events**: bubbles the standard `change` event whenever a child filter item toggles; the component keeps only one item checked at a time.
- **Keyboard support**: arrow keys cycle focus between enabled items; focus management is handled automatically via host-level `keydown` and `focusout` listeners.
- **ARIA**: the host sets `role="menubar"` and maintains roving `tabindex` across its children.

## Base Layout and Styling

`filter.styles.ts` defines a single style set that applies to all usages:

```css
:host {
    display: flex;
    gap: var(--mai-gap-between-ctrl-default);
}
```

- The host renders as `display: flex` so items line up horizontally by default. Apply `flex-wrap` or additional layout rules on the host if you need wrapping.
- Spacing between items is controlled by the `gapBetweenCtrlDefault` design token. Override the token on the host to change spacing consistently across a page.
- No additional visibility toggles or resize rules are imposed; items size to their content.
- Because the host only manages layout and focus, visual styles live primarily on `mai-filter-item`.

### Default filter stack

Use the default Storybook configuration when presenting a selectable list of filters. Checked state indicates the active filter.

```html
<mai-filter>
  <mai-filter-item checked>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
</mai-filter>
```

### Disabled filter items

Individual filter items respect their own `disabled` attribute while the group stays interactive. Disabled items are skipped by keyboard roving focus.

```html
<mai-filter>
  <mai-filter-item disabled>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
  <mai-filter-item disabled>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
  <mai-filter-item>Text</mai-filter-item>
</mai-filter>
```

### Thumbnail start slot

Leverage the `slot="start"` region on each `mai-filter-item` to surface imagery alongside the label. This mirrors the `SlottedStartImage` story.

```html
<mai-filter>
  <mai-filter-item checked>
    <img
      slot="start"
      src="https://dummyimage.com/20x20/b3b3b3/ffffff.png"
      alt="Placeholder image"
      width="20"
      height="20"
    />
    Text
  </mai-filter-item>
  <mai-filter-item>
    <img
      slot="start"
      src="https://dummyimage.com/20x20/b3b3b3/ffffff.png"
      alt="Placeholder image"
      width="20"
      height="20"
    />
    Text
  </mai-filter-item>
  <mai-filter-item>
    <img slot="start" src="https://dummyimage.com/20x20/b3b3b3/ffffff.png" alt="Placeholder image" width="20" height="20" />
    Text
  </mai-filter-item>
  <mai-filter-item>
    <img slot="start" src="https://dummyimage.com/20x20/b3b3b3/ffffff.png" alt="Placeholder image" width="20" height="20" />
    Text
  </mai-filter-item>
  <mai-filter-item>
    <img slot="start" src="https://dummyimage.com/20x20/b3b3b3/ffffff.png" alt="Placeholder image" width="20" height="20" />
    Text
  </mai-filter-item>
</mai-filter>
```

### Icon start slot

Icons slotted into the `start` region inherit spacing from the host gap token and align with the filter text. This reflects the `SlottedStartIcon` story.

```html
<mai-filter>
  <mai-filter-item checked>
    <span slot="start">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        role="img"
        aria-label="Info icon"
      >
        <path d="M10 1.75a8.25 8.25 0 1 1 0 16.5a8.25 8.25 0 0 1 0-16.5zm0 1.5a6.75 6.75 0 1 0 0 13.5a6.75 6.75 0 0 0 0-13.5zm.75 8.5v3h-1.5v-3zm0-5v3h-1.5v-3z" />
      </svg>
    </span>
    Text
  </mai-filter-item>
  <mai-filter-item>
    <span slot="start">•</span>
    Text
  </mai-filter-item>
  <mai-filter-item>
    <span slot="start">•</span>
    Text
  </mai-filter-item>
  <mai-filter-item>
    <span slot="start">•</span>
    Text
  </mai-filter-item>
  <mai-filter-item>
    <span slot="start">•</span>
    Text
  </mai-filter-item>
</mai-filter>
```

## Development Notes

- Because the component relies on `slotchange`-driven item discovery, dynamically adding or removing `mai-filter-item` children is supported; the layout updates on the next tick via `Updates.enqueue`.
- The group intentionally keeps only one item checked at a time. If you need multi-select behavior, use `mai-filter-item` directly or build a custom controller.
- Wrap the filter in a container and apply responsive layout rules (e.g., `flex-wrap: wrap`) when the items must reflow on smaller screens; the base stylesheet does not constrain width.
- Provide meaningful text inside each `mai-filter-item` (or `aria-label`) so screen readers announce the purpose of the filter option.
