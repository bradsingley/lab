# Product Card Style Guidelines

The `mai-product-card` component presents product imagery, pricing, and supporting merchandising metadata inside the shared card shell. It inherits the base card behaviors from `mai-content-card` while layering product-specific typography, slot expectations, and container query driven layout swaps.

## Slots and Content Fields

| Slot | Required | Description |
| --- | --- | --- |
| _(default)_ | Yes | Product title or primary merchandising copy. Renders inside the anchor that reflects `href`/`target`. |
| `preview` | No | Product imagery or video thumbnail. Enforced to a 1:1 aspect ratio with rounded corners that adapt to layout state. |
| `badge` | No | Merchandising callout that overlays the preview (e.g., "New release"). Positioned absolute with fixed inset tokens. |
| `rating` | No | Rating display below the title. Hidden automatically in the compact horizontal style. |
| `attribution` | No | Brand or seller attribution, aligned to the bottom of the content column. |
| `price` | No | Pricing emphasis; bolded typography supplied via design tokens. |
| `meta` | No | Supplemental copy such as shipping speed. Hidden automatically in the compact horizontal style. |
| `action` | No | Right-aligned control tray for icon buttons and tooltips. |

## Attributes, States, and Events

- `href`: Optional navigation target for the title anchor.
- `target`: Anchor target; accepts `_self`, `_blank`, `_parent`, `_top` (defaults to `_blank`).
- `backplateless`: Removes the base card padding/backplate so media and content sit flush with the surrounding surface.
- `link-invoked`: Fired when the anchor inside the card is activated.

## CSS Custom Properties

The component exposes dedicated hooks in addition to the shared card tokens:

| Token | Purpose |
| --- | --- |
| `--title-max-lines` | Caps the number of lines for the default slot before truncation (default `2`). |
| `--video-transition-duration` | Governs preview media transition timing (default `0.5s`). |
| Shared card tokens | Inherits `--nested-*-radius`, `--nested-*-padding`, `--card-*` variables from `mai-content-card`. |

## Style Sets and Layout Rules

The stylesheet defines layered style sets: `baseCardStyles` (from the shared card shell), `baseProductCardStyles`, and a container-query-driven `horizontalProductCardStyles`. The rules below describe slot visibility, sizing, and responsive behaviors for each set.

### Default Vertical Layout (`baseProductCardStyles`)

- Layout: `.content` uses a three-row grid (`title`, `attribution`, `meta/price`) with the action tray trailing the grid.
- Preview: Fixed `max-height: 276px` with slotted media constrained to a `1 / 1` aspect ratio. Backplateless mode expands the radius tokens.
- Typography: Title and unslotted text inherit `Body 2` size/line-height; price slot escalates to header weight.
- Metadata: `.meta-container` stacks price and meta with `gapBetweenContentXxxSmall`; meta text line-clamped to a single line. Attribution aligns to the bottom of the column.
- Interactions: Action slot remains visible in vertical layout and follows base card hover/focus affordances.

**Story example (`Default` from `product-card.stories.ts`):**

```html
<mai-product-card href="https://microsoft.com">
  <mai-badge slot="badge">
    New release
  </mai-badge>
  <mai-rating-display slot="rating" count="2895" value="4.8" compact></mai-rating-display>
  <span slot="price">$59.99</span>
  <span slot="meta">Get it by May 28</span>
  <img alt="" src="https://picsum.photos/id/96/800/400" slot="preview">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <h2>
    Wireless Bluetooth Noise-Cancelling Headphones with 30-Hour Battery Life and Premium Audio Quality
  </h2>
</mai-product-card>
```

Wrap the card in a container sized around `300px × 490px` (see story decorator) to showcase the full vertical layout.

### Compact Horizontal Layout (`horizontalProductCardStyles`)

Triggered by the container query `@container card (max-height: 160px)`.

- Grid swap: `.card-content` becomes two columns—media on the left with fixed width (`min-width: 136px`, `max-width: 234px`), content on the right. Preview fills the container height.
- Padding: Content inset shifts to `var(--nested-outside-padding)` / `var(--nested-inside-padding)` pair to keep density tight.
- Hidden slots: `rating` and `meta` slots are forced to `display: none` to reduce clutter in the compact footprint. Ensure critical info appears in price or title when targeting this size.
- Preview: Maintains `1 / 1` ratio and rounded corners that adapt to `backplateless` state.

**Story example (`Small` from `product-card.stories.ts`):**

```html
<div style="padding: 2rem; height: 160px; width: 300px;">
  <mai-product-card href="https://microsoft.com">
    <mai-badge slot="badge">
      New release
    </mai-badge>
    <span slot="price">$59.99</span>
    <img alt="" src="https://picsum.photos/id/96/98/98" slot="preview">
    <mai-badge slot="attribution">
      <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <h2>
      Wireless Bluetooth Noise-Cancelling Headphones with 30-Hour Battery Life and Premium Audio Quality
    </h2>
  </mai-product-card>
</div>
```

Set the hosting container's height to `≤160px` (or apply an explicit `container-type: size` + `container-name: card`) to force the horizontal treatment during development.

### Backplateless Variation (`:host([backplateless])`)

- Spacing: Host padding collapses to `0` and the pseudo backplate (`.card-content::before`) is removed.
- Media corners: Preview radius becomes uniform (`var(--nested-outside-radius)`), matching the outer shell.
- Recommended for laying cards over media-rich backdrops or when the surrounding surface provides its own card treatment.

**Story example (`Backplateless` from `product-card.stories.ts`):**

```html
<mai-product-card backplateless href="https://microsoft.com">
  <mai-badge slot="badge">
    New release
  </mai-badge>
  <mai-rating-display slot="rating" count="2895" value="4.8" compact></mai-rating-display>
  <span slot="price">$59.99</span>
  <span slot="meta">Get it by May 28</span>
  <img alt="" src="https://picsum.photos/id/96/800/400" slot="preview">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <h2>
    Wireless Bluetooth Noise-Cancelling Headphones with 30-Hour Battery Life and Premium Audio Quality
  </h2>
</mai-product-card>
```

The same attribute applies in compact contexts (see `BackplatelessSmall` story) to retain horizontal layout without the backplate.

## Action Tray and Interactivity

Leverage the action slot for icon buttons, chips, or tooltips that supplement the card without distracting from primary content.

**Story example (`WithActions`):**

```html
<mai-product-card href="https://microsoft.com">
  <mai-badge slot="badge">New release</mai-badge>
  <mai-rating-display slot="rating" count="2895" value="4.8" compact></mai-rating-display>
  <span slot="price">$59.99</span>
  <span slot="meta">Get it by May 28</span>
  <img alt="" src="https://picsum.photos/id/96/800/400" slot="preview">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <h2>Wireless Bluetooth Noise-Cancelling Headphones with 30-Hour Battery Life and Premium Audio Quality</h2>
  <mai-button icon-only size="small" slot="action" aria-label="Like" id="like-button">...</mai-button>
  <mai-button icon-only size="small" slot="action" aria-label="More options" id="more-options-button">...</mai-button>
  <mai-tooltip slot="action" anchor="like-button">
    Like
  </mai-tooltip>
  <mai-tooltip slot="action" anchor="more-options-button">
    More options
  </mai-tooltip>
</mai-product-card>
```

Tooltips must also declare `slot="action"` so they inherit the action tray positioning.

## Resizing and Responsive Guidance

- Add `container-type: size; container-name: card;` to parent wrappers so container queries can evaluate both axes. The Resize story models this with a resizable canvas (`min-width: 300px`, `min-height: 160px`).
- Maintain at least `300px` width to preserve spacing around price and actions. When height drops below `160px`, rely on the compact layout rules rather than custom overrides.
- Preview media should specify `object-fit: cover` (or rely on the default) to avoid stretching when height expands in resizable contexts.

**Story example (`Resize`):**

```html
<div style="resize: both; padding: 20px; margin: auto; min-width: 300px; min-height: 160px; width: 300px; height: 490px; overflow: hidden;">
  <mai-product-card href="https://microsoft.com">
    <!-- Same slot content as the Default example -->
  </mai-product-card>
</div>
```

## Catalog Layout Patterns

Use flex or grid wrappers to compose multiple cards. The provided stories demonstrate a responsive catalog with optional backplateless styling.

**Story example (`ProductLayout`):**

```html
<div style="display: flex; gap: 16px; flex-wrap: wrap; padding: 2rem; height: 490px;">
  <mai-product-card style="flex-basis: 280px;" href="https://microsoft.com">
    <!-- Card 1 slot content -->
  </mai-product-card>
  <mai-product-card style="flex-basis: 280px;" href="https://microsoft.com">
    <!-- Card 2 slot content -->
  </mai-product-card>
  <mai-product-card style="flex-basis: 280px;" href="https://microsoft.com">
    <!-- Card 3 slot content -->
  </mai-product-card>
</div>
```

Switch to `backplateless` on each card to reproduce `BackplatelessProductLayout` when the surrounding surface provides visual separation.

## Accessibility Notes

- Supply meaningful `alt` text for preview imagery; leave empty (`alt=""`) only when decorative.
- Ensure title copy communicates the product clearly since it becomes the anchor text.
- Provide `aria-label` values for action buttons and ensure tooltips mirror those labels for keyboard parity.
- Listen to the `link-invoked` event if analytics or custom handling is required; do not prevent default unless necessary.

## Implementation Checklist

- [ ] Decide between the default vertical and compact horizontal states based on container height; avoid manual overrides that conflict with the container query.
- [ ] Provide slot content for at least the default title and optional preview/image; ensure rating/meta slots aren't the sole carriers of critical info if the card might collapse.
- [ ] Set or inherit `container-type: size` on parent wrappers to allow the component's responsive rules to engage.
- [ ] Adjust CSS custom properties sparingly—prefer updating design tokens or per-page container sizing when possible.
- [ ] Validate backplateless usage against the surrounding surface to maintain sufficient contrast and spacing.
