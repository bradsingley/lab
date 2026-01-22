# Card List

## Overview
The `mai-card-list` component renders a stack or grid of rich media cards with optional heading and action slots. The host applies the MAI shell treatment (background, border, corner shape, elevation) and forwards list-specific padding, corner radius, and chrome suppression tokens to `mai-content-card` and `mai-video-card` children. Use this component whenever you need a self-contained list of cards that can expand from a vertical stack into a horizontal ribbon.

## Slots
- **(default)** - Required. Supply one or more cards (`mai-content-card` or `mai-video-card` are pre-styled).
- **heading** - Optional heading content rendered above the cards. Typography is elevated to Title 2.
- **actions** - Optional footer actions below the cards (e.g., `mai-button`).

## CSS Custom Properties
- `--list-content-padding` - Injects padding into immersive card content. Defaults to `0`; set on immersive cards when needed.
- `--list-preview-corner-radius` - Controls corner radius of card previews; defaults to the nested list token.

## Styling & Layout Rules
- **Host (`:host`)** - Flex column with `gapBetweenContentMedium` spacing. Applies card background, neutral foreground, stroked border, squircle corners (adjustable through `--_squircle-modifier`), key and ambient shadows, and combined shell/body padding. Sets `container-type: inline-size` and `container-name: card` to enable the component's container query. Uses Body 3 typography by default and hides overflow to keep cards clipped.
- **Cards wrapper (`.cards`)** - Behaves as a single-column CSS grid with auto rows sized to `98px` and full-width stretch. The wrapper defines the main card layout logic and spacing.
- **Heading slot (`::slotted([slot="heading"])`)** - Promotes heading typography to Article Title 2 family/metrics and removes block margins so the host gap controls vertical rhythm.
- **Content and video cards (`::slotted(mai-content-card)`, `::slotted(mai-video-card)`)** - Removes default card chrome by zeroing padding, border, background, and shadows. Propagates list tokens: `--card-corner-radius` -> `cornerListCardDefault`, `--list-content-padding` -> `0`, `--list-preview-corner-radius` -> `cornerListCardNestedDefault`, and clears border and box-shadow variables so list cards sit flush.
- **Immersive cards (`::slotted([immersive])`)** - Adds `paddingListCardDefault` around the immersive child to ensure interior spacing once card chrome is stripped.
- **Corner shape support (`@supports (corner-shape: squircle)`)** - Increases `--_squircle-modifier` to `1.8` when the browser supports the CSS `corner-shape` property, yielding a larger squircle radius without reducing fallback compatibility.
- **Container query (`@container card (min-width: 401px)`)** - When the host's inline size is >= `401px`, the `.cards` grid becomes a horizontal flow: `grid-auto-flow: column`, automatic row sizing is removed, and the list height locks to `252px`. This creates a horizontal, scroll-free ribbon ideal for denser layouts.

## Usage Examples

### Default Content Cards
Matches the `Default` story. Four `mai-content-card` children render in a vertical stack by default and adopt horizontal grid flow once the host grows past 401px.

```html
<mai-card-list>
  <h1 slot="heading">Title</h1>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/168/98/98" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/169/98/98" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/170/98/98" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/171/98/98" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-button slot="actions">Button</mai-button>
</mai-card-list>
```

### Vertical Video Cards
Based on the `VerticalVideo` story. Each `mai-video-card` surfaces timestamp, attribution, and metadata slots while the list applies the same chrome suppression.

```html
<mai-card-list>
  <h1 slot="heading">Latest Videos</h1>

  <mai-video-card href="https://microsoft.com">
    <mai-badge slot="timestamp" size="small" appearance="onimage">30:30</mai-badge>
    <img slot="preview" src="https://picsum.photos/id/168/168/94" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="20 thousand views, one day ago">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>

  <mai-video-card href="https://microsoft.com">
    <mai-badge slot="timestamp" size="small" appearance="onimage">30:30</mai-badge>
    <img slot="preview" src="https://picsum.photos/id/169/168/94" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="20 thousand views, one day ago">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>

  <mai-video-card href="https://microsoft.com">
    <mai-badge slot="timestamp" size="small" appearance="onimage">30:30</mai-badge>
    <img slot="preview" src="https://picsum.photos/id/170/168/94" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="20 thousand views, one day ago">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>

  <mai-video-card href="https://microsoft.com">
    <mai-badge slot="timestamp" size="small" appearance="onimage">30:30</mai-badge>
    <img slot="preview" src="https://picsum.photos/id/171/168/94" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="20 thousand views, one day ago">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>
</mai-card-list>
```

### Fixed-Width Horizontal Layout
Reflects the `Horizontal` story. Restrict the host width (~698px) to trigger the container query and create a horizontal ribbon without immersive padding.

```html
<div style="width: 698px; margin-inline: auto">
  <mai-card-list>
    <h1 slot="heading">Title</h1>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/168/98/98" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/169/98/98" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/170/98/98" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/171/98/98" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>
  </mai-card-list>
</div>
```

### Immersive Horizontal Layout
Mirrors the `ImmersiveHorizontal` story. Apply the `immersive` attribute to each card so the list injects immersive padding and nested preview rounding. Badges switch to the `onimage` appearance.

```html
<div style="width: 798px; margin-inline: auto">
  <mai-card-list>
    <h1 slot="heading">Featured stories</h1>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/168/98/98" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/169/98/98" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/170/98/98" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/171/98/98" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>
  </mai-card-list>
</div>
```

## Implementation Notes
- There are no component-level properties or attributes; card behavior is driven by the child elements you slot.
- Use the `immersive` attribute on cards to toggle immersive spacing and the appropriate placeholder tokens.
- Keep slotted headings and actions concise; the host gap maintains vertical rhythm. For more complex toolbars, consider placing a `div` inside the `actions` slot.
- Because the host suppresses card chrome, avoid reintroducing surrounding borders or shadows on child cards unless you intentionally diverge from the list treatment.
