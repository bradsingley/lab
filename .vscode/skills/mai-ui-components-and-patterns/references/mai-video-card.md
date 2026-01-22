# Video Card Style Guidelines

The `mai-video-card` component extends the MAI Base Card pattern with a motion-ready preview, timestamp treatment, and action tray tailored for video content. Use these guidelines to configure slots, attributes, and responsive layouts in development.

## Slots

| Slot | Required | Description | Recommendations |
| --- | --- | --- | --- |
| _(default)_ | Yes | Headline or title content rendered inside an anchor that picks up `href` and `target`. | Keep titles concise; adjust `--title-max-lines` when longer copy is needed. |
| `preview` | Yes | Video thumbnail or media preview that fills the preview frame. | Supply a 16:9 asset by default; add `object-fit: cover` to `<img>` or `<video>`. |
| `timestamp` | No | Time indicator pinned inside the preview frame. | Use `mai-badge size="small" appearance="onimage"`; avoid slotting when the card is immersive with a badge. |
| `badge` | No | Status flag that overlays the preview. | Pair with `appearance="danger"`, `success`, or other semantic treatments based on content. |
| `meta` | No | Supplemental metadata line beneath the title. | Keep to a single line (e.g., views · age). |
| `attribution` | No | Attribution element displayed at the bottom of the content column. | `mai-badge` with an icon + label aligns with the default story treatment. |
| `action` | No | Icon-only buttons or tooltips positioned in the card’s corner tray. | Ensure buttons include `aria-label`; tooltip helpers must also declare `slot="action"`. |

## Attributes

- `href`: Optional link target for the headline anchor. When unset, the anchor renders without navigation.
- `target`: One of `"_self"`, `"_blank"`, `"_parent"`, or `"_top"`; falls back to the MAI anchor default when omitted.
- `immersive`: Boolean. Promotes the preview to a full-bleed background and switches typography to on-image colors.
- `animate-video` (`animateVideo`): Boolean. When true, fades out the play overlay and timestamp so video playback or hover motion can take focus.

## CSS Custom Properties

| Property | Default | Effect |
| --- | --- | --- |
| `--video-transition-duration` | `0.5s` | Shared transition timing for the play overlay and timestamp opacity. |
| `--title-max-lines` | `2` (default layout), `2` (horizontal) | Maximum number of lines before the title clamps; inherited by the anchor. |
| Card and preview radii, padding, border tokens | from `baseCardStyles` | Use MAI design tokens to align the shell and nested radii with surrounding surfaces. |

## Style Sets and Layout Rules

### Default Vertical Layout (`baseCardStyles` + `baseVideoCardStyles`)

- `card-content` stacks the preview, text content, and action tray; the grid rows are `auto auto 1fr` so attribution hugs the bottom.
- The preview slot defaults to a 16:9 ratio and inherits the base card hover scale. Timestamp and play overlay sit above it with `z-index: 1` and `2` respectively.
- The play overlay renders a 36×36 squircle-centered control and remains visible unless `animate-video` is set.
- Timestamp badges live in the bottom-right corner and share the overlay fade timing.
- Typography downshifts to Body 1 sizing for the headline to balance the denser layout.

**Example (Default story):**

```html
<div style="width: 300px; height: 320px; margin-inline: auto; padding: 2rem;">
  <mai-video-card href="https://microsoft.com">
    <mai-badge size="small" appearance="onimage" slot="timestamp">
      30:30
    </mai-badge>
    <mai-badge slot="attribution">
      <img src="https://picsum.photos/id/168/32/32" alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
    <span slot="meta">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>
</div>
```

**Action tray example (WithActions story):**

```html
<div style="width: 300px; height: 320px; margin-inline: auto; padding: 2rem;">
  <mai-video-card href="https://microsoft.com">
    <mai-badge size="small" appearance="onimage" slot="timestamp">
      30:30
    </mai-badge>
    <mai-badge slot="attribution">
      <img src="https://picsum.photos/id/168/32/32" alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
    <span slot="meta">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    <mai-button icon-only size="small" slot="action" aria-label="Like" id="like-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.4996 5.20259C16.4996 2.76065 15.3595 1.00391 13.4932 1.00391C12.467 1.00391 12.1149 1.60527 11.747 3.00348C11.6719 3.29233 11.635 3.43297 11.596 3.57157C11.495 3.93031 11.3192 4.54106 11.069 5.40258C11.0623 5.42566 11.0524 5.44741 11.0396 5.46749L8.17281 9.95315C7.49476 11.0141 6.49429 11.8296 5.31841 12.2798L4.84513 12.461C3.5984 12.9384 2.87457 14.2421 3.1287 15.5527L3.53319 17.6388C3.77462 18.8839 4.71828 19.8748 5.9501 20.1767L13.5778 22.0462C16.109 22.6666 18.6674 21.1317 19.3113 18.6064L20.7262 13.0572C21.1697 11.3179 20.1192 9.54845 18.3799 9.10498C18.1175 9.03807 17.8478 9.00422 17.5769 9.00422H15.7536C16.2497 7.37133 16.4996 6.11155 16.4996 5.20259ZM4.60127 15.2672C4.48576 14.6715 4.81477 14.0788 5.38147 13.8619L5.85475 13.6806C7.33036 13.1157 8.58585 12.0923 9.43674 10.7609L12.3035 6.27526C12.3935 6.13437 12.4629 5.98131 12.5095 5.82074C12.7608 4.95574 12.9375 4.34175 13.0399 3.97786C13.083 3.82461 13.1239 3.66916 13.1976 3.38519C13.3875 2.66348 13.4809 2.50391 13.4932 2.50391C14.3609 2.50391 14.9996 3.48797 14.9996 5.20259C14.9996 6.08708 14.6738 7.53803 14.0158 9.51766C13.8544 10.0032 14.2158 10.5042 14.7275 10.5042H17.5769C17.7228 10.5042 17.868 10.5224 18.0093 10.5585C18.9459 10.7973 19.5115 11.7501 19.2727 12.6866L17.8578 18.2357C17.4172 19.9636 15.6668 21.0138 13.9349 20.5893L6.30718 18.7198C5.64389 18.5572 5.13577 18.0237 5.00577 17.3532L4.60127 15.2672Z" fill="#242424"/>
      </svg>
    </mai-button>
    <mai-button icon-only size="small" slot="action" aria-label="More options" id="more-options-button">
      <svg width="21" height="20" viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 10C7 10.6904 6.44036 11.25 5.75 11.25C5.05964 11.25 4.5 10.6904 4.5 10C4.5 9.30964 5.05964 8.75 5.75 8.75C6.44036 8.75 7 9.30964 7 10ZM12 10C12 10.6904 11.4404 11.25 10.75 11.25C10.0596 11.25 9.5 10.6904 9.5 10C9.5 9.30964 10.0596 8.75 10.75 8.75C11.4404 8.75 12 9.30964 12 10ZM15.75 11.25C16.4404 11.25 17 10.6904 17 10C17 9.30964 16.4404 8.75 15.75 8.75C15.0596 8.75 14.5 9.30964 14.5 10C14.5 10.6904 15.0596 11.25 15.75 11.25Z"/>
      </svg>
    </mai-button>
    <mai-tooltip slot="action" anchor="like-button">
      Like
    </mai-tooltip>
    <mai-tooltip slot="action" anchor="more-options-button">
      More options
    </mai-tooltip>
  </mai-video-card>
</div>
```

**Badge overlay example (News story):**

```html
<div style="width: 300px; height: 320px; margin-inline: auto; padding: 2rem;">
  <mai-video-card href="https://microsoft.com">
    <mai-badge slot="badge" appearance="danger">
      Breaking News
    </mai-badge>
    <mai-badge slot="attribution">
      <img src="https://picsum.photos/id/168/32/32" alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
    <span slot="meta">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
    <mai-button icon-only size="small" slot="action" aria-label="Like">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.4996 5.20259C16.4996 2.76065 15.3595 1.00391 13.4932 1.00391C12.467 1.00391 12.1149 1.60527 11.747 3.00348C11.6719 3.29233 11.635 3.43297 11.596 3.57157C11.495 3.93031 11.3192 4.54106 11.069 5.40258C11.0623 5.42566 11.0524 5.44741 11.0396 5.46749L8.17281 9.95315C7.49476 11.0141 6.49429 11.8296 5.31841 12.2798L4.84513 12.461C3.5984 12.9384 2.87457 14.2421 3.1287 15.5527L3.53319 17.6388C3.77462 18.8839 4.71828 19.8748 5.9501 20.1767L13.5778 22.0462C16.109 22.6666 18.6674 21.1317 19.3113 18.6064L20.7262 13.0572C21.1697 11.3179 20.1192 9.54845 18.3799 9.10498C18.1175 9.03807 17.8478 9.00422 17.5769 9.00422H15.7536C16.2497 7.37133 16.4996 6.11155 16.4996 5.20259ZM4.60127 15.2672C4.48576 14.6715 4.81477 14.0788 5.38147 13.8619L5.85475 13.6806C7.33036 13.1157 8.58585 12.0923 9.43674 10.7609L12.3035 6.27526C12.3935 6.13437 12.4629 5.98131 12.5095 5.82074C12.7608 4.95574 12.9375 4.34175 13.0399 3.97786C13.083 3.82461 13.1239 3.66916 13.1976 3.38519C13.3875 2.66348 13.4809 2.50391 13.4932 2.50391C14.3609 2.50391 14.9996 3.48797 14.9996 5.20259C14.9996 6.08708 14.6738 7.53803 14.0158 9.51766C13.8544 10.0032 14.2158 10.5042 14.7275 10.5042H17.5769C17.7228 10.5042 17.868 10.5224 18.0093 10.5585C18.9459 10.7973 19.5115 11.7501 19.2727 12.6866L17.8578 18.2357C17.4172 19.9636 15.6668 21.0138 13.9349 20.5893L6.30718 18.7198C5.64389 18.5572 5.13577 18.0237 5.00577 17.3532L4.60127 15.2672Z" fill="#242424"/>
      </svg>
    </mai-button>
    <mai-button icon-only size="small" slot="action" aria-label="More options">
      <svg width="21" height="20" viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 10C7 10.6904 6.44036 11.25 5.75 11.25C5.05964 11.25 4.5 10.6904 4.5 10C4.5 9.30964 5.05964 8.75 5.75 8.75C6.44036 8.75 7 9.30964 7 10ZM12 10C12 10.6904 11.4404 11.25 10.75 11.25C10.0596 11.25 9.5 10.6904 9.5 10C9.5 9.30964 10.0596 8.75 10.75 8.75C11.4404 8.75 12 9.30964 12 10ZM15.75 11.25C16.4404 11.25 17 10.6904 17 10C17 9.30964 16.4404 8.75 15.75 8.75C15.0596 8.75 14.5 9.30964 14.5 10C14.5 10.6904 15.0596 11.25 15.75 11.25Z"/>
      </svg>
    </mai-button>
  </mai-video-card>
</div>
```

### Immersive Layout (`immersiveContentCardStyles` + video overrides)

- Triggered by the `immersive` attribute. The preview expands to cover the card shell, with gradients and blur layers providing contrast for text.
- Title, meta, and attribution slots switch to on-image foreground tokens. Keep contrast in check by supplying imagery with darker lower thirds.
- Timestamp shifts to the top-left corner and shares the immersive padding offsets. Avoid combining immersive cards with the `badge` slot; per design guidance they compete for the same overlay space.
- The play overlay is offset upward to sit between the timestamp and headline; continue to use `animate-video` for playback interactions.

**Example (Immersive story):**

```html
<div style="width: 300px; height: 320px; margin-inline: auto; padding: 2rem;">
  <mai-video-card immersive href="https://microsoft.com">
    <mai-badge size="small" appearance="onimage" slot="timestamp">
      30:30
    </mai-badge>
    <mai-badge appearance="onimage" slot="attribution">
      <img src="https://picsum.photos/id/168/32/32" alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <img alt="" src="https://picsum.photos/id/168/800/400" slot="preview">
    <span slot="meta">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>
</div>
```

### Horizontal Compact Layout (`horizontalVideoCardStyles`)

- A container query `@container card (max-height: 160px)` flips the layout to horizontal. The preview locks to the right column and inherits smaller nested corner radii.
- Title typography shifts to Body 2 scale; padding tightens via the nested padding tokens.
- When the container is at most 160px tall **and** at least 400px wide, the preview reverts to 16:9 while remaining right-aligned.
- Use this style in rail and carousel treatments where vertical space is constrained.

**Example (Small story):**

```html
<div style="resize: none; padding: 2rem; width: 300px; height: 160px; margin-inline: auto;">
  <mai-video-card href="https://microsoft.com">
    <mai-badge size="small" appearance="onimage" slot="timestamp">
      30:30
    </mai-badge>
    <mai-badge slot="attribution">
      <img src="https://picsum.photos/id/168/32/32" alt="" slot="start" style="border-radius: 1rem">
      Wikipedia
    </mai-badge>
    <img alt="" src="https://picsum.photos/id/168/98/98" slot="preview">
    <span slot="meta">20k · 1d ago</span>
    <h2>The Woman Who Sold the World’s Most Expensive Dinosaur</h2>
  </mai-video-card>
</div>
```

## Behavior and Interaction

- Tie hover or focus events to `animate-video` when you need the overlay to clear before playback. The Storybook decorator demonstrates this pattern:

```ts
const card = document.querySelector('mai-video-card')!;
card.addEventListener('mouseover', () => {
  card.animateVideo = true;
});
card.addEventListener('mouseout', () => {
  card.animateVideo = false;
});
```

- Action buttons remain hidden until the card is hovered, focused, or receives focus within. Always pair icon-only controls with tooltips or `aria-label`s.
- Timestamp and play overlay share a transition; keep `--video-transition-duration` in sync if you customize timing.

## Responsiveness and Resize Guidance

- The host exposes `container-name: card`, so wrap the card in containers that participate in CSS container queries. The `Resize` story sets `resize: both` on the Storybook canvas to preview how the card transitions between vertical and horizontal treatments.
- Enforce minimum dimensions of roughly `300px × 160px` to preserve slot spacing and overlay legibility.

## Accessibility

- Provide descriptive `alt` text for preview imagery unless decorative (`alt=""`).
- Ensure action buttons and tooltips expose accessible names through `aria-label` and `slot="action"` placement.
- Maintain sufficient contrast when using the immersive variant; prefer imagery that allows text to remain readable within the gradient window.

## Implementation Checklist

- Choose the appropriate style set (default, immersive, horizontal) based on available space and content priority.
- Populate required slots and confirm overlay/timestamp placement with your target media.
- Hook `animate-video` into pointer or playback events as needed, and keep overlay transitions smooth by respecting `--video-transition-duration`.
- Validate responsive behavior in Storybook using the `Default`, `Resize`, `WithActions`, `Small`, `Immersive`, and `News` stories before shipping.
