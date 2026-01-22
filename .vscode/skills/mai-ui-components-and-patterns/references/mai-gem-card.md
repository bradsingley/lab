# Gem Card Style Guidelines

## Overview
The `mai-gem-card` component extends the shared `BaseCard`, providing a headline-first layout with optional media, secondary metadata, and action affordances. The host element advertises `role="article"`, supports link invocation through its internal anchor, and applies responsive container queries for small viewports.

## Configurable Attributes
- `href`: Sets the anchor destination rendered around the default slot content.
- `target`: Controls where the link opens. Supported values are the `AnchorTarget` enum (`_blank`, `_self`, `_parent`, `_top`). Defaults to `_blank`.

**Events**
- `link-invoked`: Fired when the internal anchor is activated.

## Slots
- _default_: Card title or primary textual content. Clamped by `--title-max-lines`.
- `preview`: Media shown in the preview pane. Inherits a 16:9 aspect ratio and scales on hover in the base layout.
- `badge`: Positioned inside the preview pane for contextual labelling.
- `attribution`: Appears above the title for source metadata.
- `description`: Additional body copy or a rich list. When a `<ul>` is provided, list styling is applied automatically via `listCss`.
- `action`: Primary icon or button actions, surfaced when the card is hovered or focused.
- `sub-actions`: Supplementary controls shown alongside `action` content. (Used in stories for grouped icon buttons.)

## CSS Custom Properties
- `--title-max-lines`: Defaults to `2`; limits the number of visible lines in the title slot.
- `--li-description-max-lines`: Defaults to `2`; limits `<li>` lines when the description slot provides a list.
- Card-level tokens inherited from `BaseCard` such as `--card-background`, `--card-border`, `--nested-*` paddings and radii remain available for brand customization.

## Style Sets and Layout Rules
### Base layout (`baseGemCardStyles`)
- Host sets `container-type: inline-size` and enforces `--title-max-lines`/`--li-description-max-lines` defaults.
- `.card-content` becomes a two-column grid (`1fr minmax(320px, 1fr)`), keeping textual content and media side-by-side on wide containers.
- `.content` arranges attribution → title link → description with generous spacing driven by `gapBetweenContentSmall` tokens.
- `.preview` sits in column two with a rounded squircle outline that mirrors the content container.
- Description lists (`ul[slot="description"]`) convert to a vertical flex stack with bullet indicators and ellipsis clamping.

```html
<mai-gem-card href="https://microsoft.com">
  <mai-badge slot="badge">
    <svg slot="start" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7.49902 6.49998C7.49902 6.22384 7.27517 5.99998 6.99902 5.99998C6.72288 5.99998 6.49902 6.22384 6.49902 6.49998V9.49998C6.49902 9.77612 6.72288 9.99998 6.99902 9.99998C7.27517 9.99998 7.49902 9.77612 7.49902 9.49998V6.49998ZM7.74807 4.50001C7.74807 4.91369 7.41271 5.24905 6.99903 5.24905C6.58535 5.24905 6.25 4.91369 6.25 4.50001C6.25 4.08633 6.58535 3.75098 6.99903 3.75098C7.41271 3.75098 7.74807 4.08633 7.74807 4.50001ZM7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7Z"></path>
    </svg>
    Copilot Story
  </mai-badge>

  <h2 slot="">Recent Breakthroughs in Scientific Research Making Headlines</h2>

  <mai-badge slot="attribution" backplateless>
    <img slot="start" src="https://picsum.photos/16" alt="" />
    <img slot="start" src="https://picsum.photos/16" alt="" />
    <img slot="start" src="https://picsum.photos/16" alt="" />
    Wikipedia
  </mai-badge>

  <ul slot="description">
    <li>New quantum computing breakthrough achieves 99% error correction rate.</li>
    <li>CRISPR gene therapy shows promising clinical results.</li>
    <li>Fusion reactor maintains plasma for record-breaking 17 minutes.</li>
    <li>AI model predicts protein structures with unprecedented accuracy.</li>
  </ul>

  <img slot="preview" alt="" src="https://picsum.photos/id/509/800/400" />
</mai-gem-card>
```

### Responsive horizontal layout (`horizontalGemCardStyles`)
- Activated by the `@container card (max-width: 575px)` query; ensure the card or an ancestor constrains inline size below `575px` to opt-in.
- Grid collapses to a single column with stacked rows: preview first, content second.
- `.preview` flips its rounded corners and receives `--preview-min-height`/`--preview-max-height` clamps (`155px`–`324px` by default).
- `.content` padding shifts to `paddingCardBodyDefaultInside` for consistent density.
- Actions remain pinned to the card corner and continue to reveal on hover/focus.

```html
<div style="width: 360px; resize: both; overflow: hidden; padding: 20px;">
  <mai-gem-card href="https://microsoft.com">
    <h2>Research headlines for this week</h2>
    <ul slot="description">
      <li>CRISPR trial expands to multi-site cohort.</li>
      <li>Fusion reactor holds plasma for 17 minutes.</li>
    </ul>
    <img slot="preview" alt="" src="https://picsum.photos/id/509/800/400" />
  </mai-gem-card>
</div>
```

### Actions layout example
- Multiple actions can be slotted while retaining hover-trigger visibility. Tooltips should also declare `slot="action"` so that they adopt the proper positioning.

```html
<mai-gem-card href="https://microsoft.com">
  <mai-button slot="sub-actions" icon-only aria-label="Open menu">
    <svg width="21" height="20" viewBox="0 0 21 20" aria-hidden="true">
      <path d="M7 10C7 10.6904 6.44036 11.25 5.75 11.25C5.05964 11.25 4.5 10.6904 4.5 10C4.5 9.30964 5.05964 8.75 5.75 8.75C6.44036 8.75 7 9.30964 7 10ZM12 10C12 10.6904 11.4404 11.25 10.75 11.25C10.0596 11.25 9.5 10.6904 9.5 10C9.5 9.30964 10.0596 8.75 10.75 8.75C11.4404 8.75 12 9.30964 12 10ZM15.75 11.25C16.4404 11.25 17 10.6904 17 10C17 9.30964 16.4404 8.75 15.75 8.75C15.0596 8.75 14.5 9.30964 14.5 10C14.5 10.6904 15.0596 11.25 15.75 11.25Z"></path>
    </svg>
  </mai-button>

  <mai-button slot="action" icon-only size="small" aria-label="Like" id="like-button">
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.4996 5.20259C16.4996 2.76065 15.3595 1.00391 13.4932 1.00391C12.467 1.00391 12.1149 1.60527 11.747 3.00348C11.6719 3.29233 11.635 3.43297 11.596 3.57157C11.495 3.93031 11.3192 4.54106 11.069 5.40258C11.0623 5.42566 11.0524 5.44741 11.0396 5.46749L8.17281 9.95315C7.49476 11.0141 6.49429 11.8296 5.31841 12.2798L4.84513 12.461C3.5984 12.9384 2.87457 14.2421 3.1287 15.5527L3.53319 17.6388C3.77462 18.8839 4.71828 19.8748 5.9501 20.1767L13.5778 22.0462C16.109 22.6666 18.6674 21.1317 19.3113 18.6064L20.7262 13.0572C21.1697 11.3179 20.1192 9.54845 18.3799 9.10498C18.1175 9.03807 17.8478 9.00422 17.5769 9.00422H15.7536C16.2497 7.37133 16.4996 6.11155 16.4996 5.20259Z"></path>
    </svg>
  </mai-button>

  <mai-button slot="action" icon-only size="small" aria-label="More options" id="more-options-button">
    <svg width="21" height="20" viewBox="0 0 21 20" aria-hidden="true">
      <path d="M7 10C7 10.6904 6.44036 11.25 5.75 11.25C5.05964 11.25 4.5 10.6904 4.5 10C4.5 9.30964 5.05964 8.75 5.75 8.75C6.44036 8.75 7 9.30964 7 10ZM12 10C12 10.6904 11.4404 11.25 10.75 11.25C10.0596 11.25 9.5 10.6904 9.5 10C9.5 9.30964 10.0596 8.75 10.75 8.75C11.4404 8.75 12 9.30964 12 10ZM15.75 11.25C16.4404 11.25 17 10.6904 17 10C17 9.30964 16.4404 8.75 15.75 8.75C15.0596 8.75 14.5 9.30964 14.5 10C14.5 10.6904 15.0596 11.25 15.75 11.25Z"></path>
    </svg>
  </mai-button>

  <mai-tooltip slot="action" anchor="like-button">Like</mai-tooltip>
  <mai-tooltip slot="action" anchor="more-options-button">More options</mai-tooltip>

  <img slot="preview" alt="" src="https://picsum.photos/id/509/800/400" />
</mai-gem-card>
```

## Implementation Notes
- When providing a `<ul>` in the description slot, the component injects the `listCss` stylesheet into `document.adoptedStyleSheets` once per page to enable bullet truncation; no additional consumer styling is required.
- Manage responsive behavior by constraining the card width or wrapping it in a resizable container. The host already defines `container-name: card`, so container queries respond to the card’s own inline size.
- Actions remain visually hidden until hover/focus to reduce clutter; ensure keyboard focus can reach action buttons by keeping them interactive elements.
- The component currently exposes link navigation only through the default slot anchor. Surface secondary navigation in the `action` or `sub-actions` slots instead of duplicating anchor markup inside the default slot.
