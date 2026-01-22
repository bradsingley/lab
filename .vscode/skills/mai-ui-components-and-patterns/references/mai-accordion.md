# Accordion Style Guidelines

Use the `mai-accordion` component to organize related regions of content inside collapsible panels. This document describes the supported configuration levers, slot usage, and layout rules required for consistent styling in MAI UI development.

## Component Summary

- **Tag name:** `mai-accordion` (exports from `@mai-ui/accordion`).
- **Child elements:** Compose with `mai-accordion-item` elements. Each item manages its own heading and panel content.
- **Inheritance:** Extends Fluent UI's accordion behaviors, so state management (expanded/collapsed) follows Fluent defaults.

## Expand Mode Appearance

`mai-accordion` supports one attribute for controlling expansion behavior. No additional visual variants are defined beyond this attribute.

| Attribute | Allowed values | Default | Notes |
| --- | --- | --- | --- |
| `expand-mode` | `single` \| `multi` | `multi` | `single` restricts the accordion to one expanded item at a time. `multi` allows multiple panels to remain open simultaneously.

### Default (multi) example

```html
<mai-accordion expand-mode="multi">
    <mai-accordion-item heading-level="2">
        <span slot="heading">Accordion Header 1</span>
        Accordion Panel 1
    </mai-accordion-item>
    <mai-accordion-item heading-level="2">
        <span slot="heading">Accordion Header 2</span>
        Accordion Panel 2
    </mai-accordion-item>
    <mai-accordion-item heading-level="2">
        <span slot="heading">Accordion Header 3</span>
        Accordion Panel 3
    </mai-accordion-item>
</mai-accordion>
```

### Single expand example

```html
<mai-accordion expand-mode="single">
    <mai-accordion-item heading-level="2">
        <span slot="heading">Accordion Header 1</span>
        Accordion Panel 1
    </mai-accordion-item>
    <mai-accordion-item heading-level="2">
        <span slot="heading">Accordion Header 2</span>
        Accordion Panel 2
    </mai-accordion-item>
</mai-accordion>
```

## Slot and Content Rules

`mai-accordion` exposes only the default slot, which is reserved for `mai-accordion-item` children. Slots that affect the visual layout live on each item:

- **Default slot (no name):** Panel body content. Accepts text or markup.
- **`heading` slot:** Visible heading text. Required for accessible labeling.
- **`start` slot:** Optional leading visual such as an icon. Aligns to the left edge of the header.

### Iconized header example

```html
<mai-accordion expand-mode="multi">
    <mai-accordion-item heading-level="2">
        <div slot="start">
            <!-- Imported SVG from @mai-ui/storybook/svg/circle-24-regular.svg -->
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
        </div>
        <span slot="heading">Accordion Header 1</span>
        Accordion Panel 1
    </mai-accordion-item>
    <mai-accordion-item heading-level="2">
        <div slot="start">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
        </div>
        <span slot="heading">Accordion Header 2</span>
        Accordion Panel 2
    </mai-accordion-item>
</mai-accordion>
```

### Disabled state example

Apply the `disabled` boolean attribute to individual items to suppress interactivity. Disabled items remain visible but are not focusable or expandable.

```html
<mai-accordion expand-mode="multi">
    <mai-accordion-item heading-level="2" disabled>
        <span slot="heading">Accordion Header 1</span>
        Accordion Panel 1
    </mai-accordion-item>
    <mai-accordion-item heading-level="2" disabled>
        <span slot="heading">Accordion Header 2</span>
        Accordion Panel 2
    </mai-accordion-item>
    <mai-divider></mai-divider>
    <mai-accordion-item heading-level="2" disabled>
        <span slot="heading">Accordion Header 3</span>
        Accordion Panel 3
    </mai-accordion-item>
</mai-accordion>
```

## Layout and Spacing Rules

The component applies a single shared style block from `accordion.styles.ts`:

- The host uses `display: grid`, which ensures accordion items stack vertically without additional wrappers. Do not override to `flex` unless re-defining the full layout.
- A uniform gap of `gapBetweenContentSmall` separates each child element (`mai-accordion-item`, optional `mai-divider`). Maintain this spacing token to align with the MAI rhythm system.
- Because the host is grid-based, child widths naturally stretch to fill the container. Use container constraints (e.g., max-width) on a wrapping element when a narrower column is needed.
- There are no responsive breakpoints baked into the component styles; responsiveness is inherited from the surrounding layout. Ensure accordion containers are allowed to shrink or grow as required by the parent grid or flex context.

## Implementation Checklist

- Always supply at least one `mai-accordion-item`; empty accordions are not rendered.
- Set `heading-level` on items to keep heading hierarchy consistent within the page.
- Use `mai-divider` between items only when separation is needed; the built-in gap already maintains rhythm.
- Prefer icons or decorative elements through the `start` slot rather than inline before the heading text, to preserve spacing and alignment.
- Combine accordions with MAI spacing tokens around the component boundary to align with other content blocks.
