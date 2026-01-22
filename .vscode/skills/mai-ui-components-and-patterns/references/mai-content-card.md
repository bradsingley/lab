# Content Card Style Guidelines

The `mai-content-card` component presents editorial or promotional content with a preview, title, optional metadata, and call-to-action affordances. This guide focuses on the styling hooks, layout rules, and slot usage patterns.

## Slots and Content Fields

| Slot | Required | Description |
| --- | --- | --- |
| _(default)_ | Yes | Title or primary headline. Rendered inside an anchor that forwards `href` and `target` attributes. |
| `preview` | No | Media preview (typically `<img>`). Rounded via squircle corners and cropped according to the active style set. |
| `badge` | No | Status flag shown in the preview area. Positioned over the preview image. |
| `attribution` | No | Attribution element such as a `mai-badge`. Displayed before meta content. |
| `meta` | No | Supplementary metadata (publish time, category). Single line by default. |
| `description` | No | Supporting body copy. Presence toggles `data-has-description`, switching layout to a copy-first treatment. |
| `action` | No | Inline action controls (icon buttons, tooltips). Hidden until hover/focus. |

## Attributes and States

- `href`: Optional link target for the title. When omitted, the anchor still renders but without navigation.
- `target`: One of `_self`, `_blank`, `_parent`, `_top`. Defaults to `_blank`.
- `immersive`: Boolean attribute enabling immersive styling (see below).
- `data-has-description`: Automatically managed when the description slot contains content; do not set manually.

## CSS Custom Properties

Use the following CSS variables to align cards with layout and density requirements:

| Token | Default | Purpose |
| --- | --- | --- |
| `--card-background` | Surface color | Background for the card shell. |
| `--card-border` | Rest stroke | Border color; animates on hover/press. |
| `--card-box-shadow` | Rest key + ambient | Shadow stack for the shell. |
| `--card-corner-radius` | `cornerCardDefault` | Corner radius for the shell and immersive overlay. |
| `--nested-inside-radius` / `--nested-outside-radius` | Contextual | Radii applied to preview media. |
| `--nested-inside-padding` / `--nested-outside-padding` | Contextual | Interior padding for content grid. |
| `--title-max-lines` | `3` | Maximum headline lines before truncation. |
| `--description-max-lines` | `6` | Maximum description lines before truncation. |

## Style Sets and Layout Rules

### Base Card Styles (`baseCardStyles`)

- Layout: `display: grid` with preview stacked above content, actions absolutely positioned in the top-right.
- Preview: Constrained to `max-height: 176px`, maintains 16:9 aspect ratio, scales to 110% on hover, and clips to squircle corners.
- Content: Vertical grid with attribution/meta followed by the title and optional description.
- Actions: Remain hidden (`opacity: 0`) until the card is hovered, focused, or focus-within.
- Link: Title text and unslotted nodes flow into the anchor, with `-webkit-line-clamp` controlled by `--title-max-lines`.

**Example (Default story):**

```html
<mai-content-card href="https://microsoft.com">
  <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <span slot="meta" aria-label="One day ago">· 1d</span>
  <h2>The Woman Who Sold the World's Most Expensive Dinosaur</h2>
</mai-content-card>
```

> Replace the inline `data:image` source with `badgeIconSrc` or another graphic when integrating into your project.

### Content Styles (`baseContentCardStyles`)

- Description slot: Clamped to `--description-max-lines`; when present the card switches to copy-first layout (`grid-template-rows: auto auto 1fr`).
- Preview: Hidden (`display: none`) when a description is slotted, allowing copy to dominate.
- Meta: Limited to one line for consistency.

**Example (News Text Card story):**

```html
<mai-content-card href="https://microsoft.com">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <h2>The Woman Who Sold the World's Most Expensive Dinosaur for testing purposes to see where the line breaks.</h2>
  <p slot="description">This is a description for the news article... (truncate as needed).</p>
  <span slot="meta" aria-label="One day ago">· 1d</span>
  <mai-button icon-only size="small" slot="action" aria-label="Like" title="Like">...</mai-button>
  <mai-button icon-only size="small" slot="action" aria-label="More options" title="More options">...</mai-button>
</mai-content-card>
```

Set `--title-max-lines` and `--description-max-lines` on the host to fine-tune truncation per layout.

### Immersive Styles (`immersiveContentCardStyles`)

Triggered when the `immersive` attribute is present.

- Typography: Title, attribution, and meta text switch to the on-image foreground color token.
- Preview: Becomes a full-card background (`position: absolute; inset: 0`) with squircle-corner masking.
- Content: Anchored to the bottom with gradient overlays (`::before` and `::after`) providing contrast and optional blur.
- Slots: Preview retains full coverage; attribution, meta, and title remain interactable with elevated `z-index`.

**Example (Immersive story):**

```html
<mai-content-card immersive href="https://microsoft.com">
  <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
  <mai-badge appearance="onimage" slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <span slot="meta" aria-label="One day ago">· 1d</span>
  <h2>The Woman Who Sold the World's Most Expensive Dinosaur</h2>
</mai-content-card>
```

### Horizontal Container Styles (`horizontalContentCardStyles`)

Applied when the card’s container height is `<= 160px` via the `@container card (max-height: 160px)` query.

- Grid: Switches to two-column layout—content on the left, square preview on the right.
- Preview: Aspect ratio forced to `1 / 1`; uses smaller nested corner radii tokens.
- Typography: Title size aligns with body 2 scale for compact presentation.
- Content padding adjusts to keep density consistent in tight spaces.

**Example (Small story):**

```html
<div style="height: 160px; width: 300px; padding: 2rem;">
  <mai-content-card href="https://microsoft.com">
    <img alt="" src="https://picsum.photos/id/168/98/98" slot="preview">
    <mai-badge slot="attribution">
      <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day ago">· 1d</span>
    <h2>The Woman Who Sold the World's Most Expensive Dinosaur</h2>
  </mai-content-card>
</div>
```

To force horizontal treatment in development, place the card inside a sized container or set `height` on the host to 160px or less.

## Actions and Interactive Elements

- Use the `action` slot for icon-only buttons such as like or overflow controls. Hover/focus states reveal the action tray.
- Tooltips must also declare `slot="action"` so they inherit tray positioning and styling.
- Listen for the `link-invoked` event if you need to track navigation analytics.

**Example (WithActions story):**

```html
<mai-content-card href="https://microsoft.com">
  <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
  <mai-badge slot="attribution">
    <img src="data:image/svg+xml;base64,..." alt="" slot="start" style="border-radius: 1rem">
    Wikipedia
  </mai-badge>
  <span slot="meta" aria-label="One day ago">· 1d</span>
  <h2>The Woman Who Sold the World's Most Expensive Dinosaur</h2>
  <mai-button icon-only size="small" slot="action" aria-label="Like" id="like-button">...</mai-button>
  <mai-button icon-only size="small" slot="action" aria-label="More options" id="more-options-button">...</mai-button>
  <mai-tooltip slot="action" anchor="like-button">Like</mai-tooltip>
  <mai-tooltip slot="action" anchor="more-options-button">More options</mai-tooltip>
</mai-content-card>
```

## Responsive and Resize Guidance

- The host uses `container-type: size` with the container name `card`. Place the card inside layout primitives that participate in container queries (e.g., CSS grid or flex wrappers).
- When embedding in resizable panels (see `Resize` story), ensure minimum dimensions (`min-width: 300px`, `min-height: 160px`) to avoid truncating actions or attribution.
- Preview media should use `object-fit: cover` to avoid distortion. Provide high-resolution imagery for immersive layouts.

## Accessibility Notes

- Title content renders inside an anchor. Supply descriptive copy to support screen readers.
- Provide `alt` text for preview imagery unless it is purely decorative, in which case set `alt=""`.
- Ensure action buttons include `aria-label` text and optional tooltips for clarity.

## Implementation Checklist

- Choose the correct style state: default, immersive, or horizontal (triggered via container height).
- Slot the required content and confirm hover/focus states meet design expectations.
- Adjust CSS custom properties only when diverging from tokens; prefer design tokens for consistency.
- Exercise the component in Storybook stories (`Content-Card → Default`, `Resize`, `WithActions`, `Small`, `Immersive`, `News`, `News Text Card`) to validate responsive behavior.
