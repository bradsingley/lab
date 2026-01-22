# Link Component Style Guidelines

Use `mai-link` for navigational text that needs MAI-design-system styling. This guide summarizes the configurable attributes, slot behaviour, and layout rules derived from the component's stylesheet (`packages/core/link/src/link.styles.ts`) and offers Storybook-backed examples.

## Component Reference
- **Tag:** `mai-link`
- **Base behavior:** Extends Fluent UI `BaseAnchor`; all standard anchor attributes remain available.
- **Display:** `inline-grid`, aligning content on the text baseline with a small horizontal gap between slotted regions.

## Attributes & Properties
| Attribute | Type | Default | Notes |
|-----------|------|---------|-------|
| `href` | string | `undefined` | When omitted, the link renders text-only (`color: inherit; text-decoration: none`).
| `embedded` | boolean | `false` | Enables the embedded badge treatment. Toggles internal state for styling.
| `size` | `"small" \| "medium" \| "large"` | `medium` | Adjusts typography ramp. Maps to `LinkSize` options.
| `target` | `LinkTarget` | `undefined` | For opening links in new browsing contexts.
| `rel` | string | `undefined` | Relationship to the linked resource.
| `hreflang` | string | `undefined` | Language hint for the target document.
| `referrerpolicy` | string | `undefined` | Overrides the referrer policy.
| `type` | string | `undefined` | MIME hint; no built-in handling.

## Slots
| Slot | Purpose | Layout rules |
|------|---------|--------------|
| _(default)_ | Primary link label or rich text. | Inherits `inline-grid` cell alignment; respects typography ramp.
| `start` | Optional leading icon (commonly for embedded appearance). | Rendered as `inline-flex` and vertically centered. Provide elements with `slot="start"`.

## Style Sets & Usage

### Base link
- **Rules:** `color: ctrlLinkForegroundBrandRest`; no underline by default, but `:hover`/`:focus-visible` applies `text-decoration-line: underline`. Typography uses medium ramp (`textRampItemBody*`).
- **Layout:** Aligns baseline, inherits overflow/text-overflow settings from parent, cursor changes to pointer.
- **Example (from `Default` story):**

```html
<mai-link href="#" size="medium">Link</mai-link>
```

### Size variants
- **Large (`size="large"`):** Switches to `textRampLgItemBodyFontSize/LineHeight`.
- **Small (`size="small"`):** Uses `textRampSmItemBodyFontSize/LineHeight`.
- **Layout:** All other layout rules remain identical; baseline alignment maintained.
- **Example availability:** No dedicated size stories are published in `link.stories.ts`; use the base template and adjust `size`.

### Embedded appearance (`embedded`)
- **Rules:** Applies neutral foreground tokens, padded badge background, and squircle corner radius (`ctrlBadgeCorner` or `ctrlBadgeSmCorner` for small size). Hover/active states update both text and background tokens.
- **Layout:** Adds horizontal padding; maintains inline-grid alignment. In forced-color mode, renders with `LinkText` foreground and 1px outline.
- **Example availability:** The embedded story is currently commented out in `link.stories.ts`; re-enable or create a story using the snippet below.

```html
<mai-link href="#" embedded>
  <span slot="start"><!-- icon content --></span>
  Embedded link
</mai-link>
```

### Within flowing text
- **Rules:** When placed inside headings, paragraphs, or `fluent-text`, the host inherits font sizing (`:host-context`).
- **Example (from `WithinText` story):**

```html
<p>
  A <mai-link href="#" size="medium">standard text link</mai-link> can be
  used standalone or as part of a text block.
</p>
```

## Interaction & Accessibility Notes
- `:hover`/`:focus-visible` visibly underline the link; `outline` is suppressed in favor of underline for consistency.
- When `embedded`, hover and active states require pointer-capable devices (`@media (hover: hover)`). Ensure equivalent focus handling for keyboard users via underline.
- `::slotted(a)` is absolutely positioned and fills the host, preventing nested anchors—avoid slotting full anchor elements.
- Forced-color mode (`@media (forced-colors: active)`) ensures visibility with system link colors and outlines.

## Implementation Tips
- Prefer the default slot for text; reserve the `start` slot for concise iconography. Avoid wrapping entire paragraphs inside `mai-link`.
- Set `target="_blank"` together with `rel="noopener noreferrer"` when linking to external sites.
- Combine `embedded` appearance with icons to surface supplementary context (brand, file type), but ensure the icon exported SVG respects the inline sizing.
- When the link is non-interactive (no `href`), consider styling alternatives to avoid misleading users; the component intentionally drops color/underline to read as plain text.
