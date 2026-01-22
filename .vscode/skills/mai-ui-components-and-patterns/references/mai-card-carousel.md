# Card Carousel

## Overview
The `mai-card-carousel` component presents a horizontally scrollable list of card-based content with start/end flippers for navigation. It is optimized for `mai-content-card` and `mai-video-card` children, applying carousel-specific padding, corner radius, and visibility management through intersection observers.

## Slots
- **(default)** – Required. Accepts a sequence of cards (prefer `mai-content-card` or `mai-video-card`).
- **heading** – Optional heading content rendered above the carousel.
- **actions** – Optional action controls rendered below the carousel (e.g., `mai-button`).

## Properties & Attributes
- `flippers-hidden-from-at` (`boolean`, default `false`) – Removes the flipper buttons from the accessibility tree when set. When true, flippers remain visually present but receive `tabindex="-1"` and `aria-hidden="true"`.

## Events
- `list-near-end` – Fired when the second-to-last card becomes visible (useful for loading additional items).
- `list-near-start` – Fired when the second card becomes visible.

## CSS Custom Properties
- `--list-content-padding` – Padding applied to immersive slotted cards.
- `--list-preview-corner-radius` – Corner radius applied to immersive card previews.

## Layout & Styling Rules
- **Host (`:host`)** – Renders as a vertical flex container with medium content gap, card background, squircle corners (container-aware), border, and elevation. Padding combines card shell and body spacing tokens. Sets `container-type: inline-size` with the container name `card`, enabling responsive container queries. Overflow is hidden to clip slotted content.
- **Content wrapper (`.content`)** – Positions the carousel region, keeping the slotted cards and flippers aligned. The wrapper inherits the host height.
- **Card track (`.card-container`)** – A horizontal flex scroller (`overflow: auto; scroll-snap-type: x mandatory`) that spaces cards by `20px` and fills available height. Each slotted card participates in scroll snapping.
- **Default slotted cards (`::slotted(:not([slot]))`)** – Treated as flex items with `flex: 1 0 calc(25% - 15px)` by default. Visibility is controlled by the component; cards fade in (`opacity: 1`) when the component adds a `visible` attribute.
- **Immersive cards (`::slotted([immersive])`)** – Gain additional padding, use list-card corner tokens, and inherit squircle rounding from the host. Cards may supply `immersive` to opt into the immersive layout; the component propagates supporting CSS custom properties.
- **Content/video cards** – When the child tag matches `mai-content-card` or `mai-video-card`, carousel styles strip default card chrome (background, border, padding) and set nested tokens (`--list-content-padding`, `--list-preview-corner-radius`, etc.) to ensure edge-to-edge imagery.
- **Flipper buttons (`button`, `.start-button`, `.end-button`)** – Absolutely positioned within the content wrapper, centered vertically with a fab-sized footprint (`48px` tall, `sizeCtrlLgDefault` wide). Buttons extend half-width outside the host (`calc(size / -2)`) and adopt squircle rounding. `:hover`, `:active`, and `:disabled` states map to FAB design tokens. When the first/last card is fully visible, respective flippers receive the `hidden` class (opacity 0, pointer-events none).
- **Container query** – When the host’s inline size is ≤ `600px`, cards reflow to `flex: 1 0 calc(33% - 12px)` to improve readability on narrower layouts.
- **RTL** – Flipper SVGs flip horizontally under `:dir(rtl)` to preserve navigation intent.

## Usage Examples

### Default Carousel
Replicates the `Default` story. The host is 696×386px in Storybook; adjust sizing to fit your layout. Child cards rely on `mai-content-card` with badges and metadata slots.

```html
<mai-card-carousel flippers-hidden-from-at>
  <h1 slot="heading">Title</h1>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/168/200/200" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/169/200/200" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/170/200/200" alt="" />
    <mai-badge slot="attribution">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-button slot="actions">Button</mai-button>
</mai-card-carousel>
```

### Reduced Width Carousel
Matches the `ReducedWidth` story; useful for sidebars or denser layouts. The container query adjusts card width automatically as overall width decreases.

```html
<div style="width: 596px">
  <mai-card-carousel flippers-hidden-from-at>
    <h1 slot="heading">Title</h1>
    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/168/200/200" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/169/200/200" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/170/200/200" alt="" />
      <mai-badge slot="attribution">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-button slot="actions">Button</mai-button>
  </mai-card-carousel>
</div>
```

### Immersive Carousel
Demonstrates immersive cards (`immersive` attribute) from the `Immersive` story. Badges switch to the `onimage` appearance and the card previews adopt nested corner radius tokens.

```html
<mai-card-carousel flippers-hidden-from-at>
  <h1 slot="heading">Title</h1>

  <mai-content-card immersive href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/172/200/200" alt="" />
    <mai-badge slot="attribution" appearance="onimage">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card immersive href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/173/200/200" alt="" />
    <mai-badge slot="attribution" appearance="onimage">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>

  <mai-content-card immersive href="https://microsoft.com">
    <img slot="preview" src="https://picsum.photos/id/174/200/200" alt="" />
    <mai-badge slot="attribution" appearance="onimage">
      <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
      Wikipedia
    </mai-badge>
    <span slot="meta" aria-label="One day">· 1d</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-content-card>
</mai-card-carousel>
```

### Immersive, Reduced Width
Combines the immersive layout with a 596px host width (matching the `ImmersiveReducedWidth` story). The internal container query applies the narrower card sizing automatically.

```html
<div style="width: 596px">
  <mai-card-carousel flippers-hidden-from-at>
    <h1 slot="heading">Title</h1>
    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/172/200/200" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/173/200/200" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>

    <mai-content-card immersive href="https://microsoft.com">
      <img slot="preview" src="https://picsum.photos/id/174/200/200" alt="" />
      <mai-badge slot="attribution" appearance="onimage">
        <img slot="start" src="https://via.placeholder.com/16" alt="" style="border-radius: 1rem" />
        Wikipedia
      </mai-badge>
      <span slot="meta" aria-label="One day">· 1d</span>
      <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    </mai-content-card>
  </mai-card-carousel>
</div>
```

## Implementation Notes
- Carousel visibility is controlled by the component via the `visible` attribute. Avoid overriding card opacity manually unless you also manage this attribute.
- To support virtualization or lazy loading, listen for `list-near-end` and append new cards when triggered.
- When supplying custom elements instead of `mai-content-card`/`mai-video-card`, ensure they implement appropriate sizing (`flex-basis`) and scroll snap alignment if the default rules do not apply.
