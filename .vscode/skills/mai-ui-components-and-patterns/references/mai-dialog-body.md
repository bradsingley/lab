# Dialog Body

Use the `mai-dialog-body` element to wrap the textual content and action controls inside a dialog. It provides a three-row layout for the title, scrolling content, and footer actions while aligning with MAI design tokens.

## Quick Reference

- **Tag:** `mai-dialog-body`
- **Parent component:** Typically slotted into `mai-dialog`
- **Attributes:** Inherits Fluent dialog-body API; no additional MAI-specific attributes.
- **Default layout:** Grid with rows for title, content, actions. Actions stack vertically by default and switch to a horizontal row at wider container widths (≥ 480px).

## Slots

- **`title`** – Heading or descriptive element for the dialog section. Typography inherits header ramp tokens.
- **`title-action`** – Supplementary controls that appear in the title bar (e.g., help icon). Automatically aligns next to the title and respects title typography.
- **`close`** – Control that dismisses the dialog. A default subtle MAI button renders via Storybook examples, but you may replace or omit it.
- **Default slot (`<slot></slot>`)** – Main body content. Scrollable when content overflows; ensure inline elements handle `overflow: auto`.
- **`action`** – Footer buttons or controls. Rendered in a flex container with tokenized spacing.

## Parts

- **`title`** – Wraps the title bar region.
- **`content`** – Scrollable body container.
- **`actions`** – Footer action region.

## Layout & Styling Rules

`dialog-body.styles.ts` applies the following structure:

- **Host (`:host`)** – `display: grid; grid-template-rows: auto 1fr auto;` with `container: dialog-body / inline-size`. Uses `ctrlDialogLayerBackground` and `ctrlDialogPadding` for padding and background.
- **Title bar (`.title`)** – Flex container with `column-gap: gapBetweenContentSmall` and dual alignment blocks. If no `title` or `title-action` content is provided, the bar right-aligns remaining controls (`:not(:has([slot='title'], [slot='title-action']))`).
- **Content region (`.content`)** – Scrollable with `overflow: auto`, `min-height: 32px`, and body font ramp tokens.
- **Actions region (`.actions`)** – Flex column with `gap: gapBetweenCtrlDefault`. Uses padding top to visually separate from content. Responsive container query switches layout to horizontal row (`flex-direction: row`) with right-aligned controls when the dialog body’s container width ≥ 480px.
- **Slotted adjustments** – Title slot elements reset margins and inherit typography; `title-action` slot items push to the far edge via `margin-inline-start: auto`.

### Responsive Behavior

- **< 480px container width** – Action buttons stack vertically and stretch the width of the container.
- **≥ 480px container width** – Action buttons align horizontally to the end of the actions row, centered vertically.

## Content Guidelines

- Keep title concise; default typography matches section headers.
- Main content should be structured paragraphs or lists. Avoid overly long inline content—`overflow: auto` provides scrolling but large blocks can impact readability.
- Limit footer actions to two primary buttons when possible; more can be included but the layout emphasizes concise choices.

## Examples

### Default Dialog Body

```html
<mai-dialog-body>
  <h2 slot="title">Dialog Body</h2>
  <p>
    The dialog component is a window overlaid on either the primary window or
    another dialog window. Windows under a modal dialog are inert. That is,
    users cannot <a href="#">interact</a> with content outside an active dialog window.
  </p>
  <mai-button slot="action" id="dialog-default-close">Close Dialog</mai-button>
  <mai-button slot="close" appearance="subtle" icon-only aria-label="close">
    <!-- Dismiss icon SVG -->
  </mai-button>
</mai-dialog-body>
```

### Basic With Primary Action

```html
<mai-dialog-body>
  <h2 slot="title">Basic</h2>
  <p>
    A dialog should have no more than <strong>two</strong> actions. However, if required,
    you can populate the action slot with any number of buttons as needed.
  </p>
  <mai-button slot="action">Close Dialog</mai-button>
  <mai-button appearance="primary" slot="action">Call to Action</mai-button>
</mai-dialog-body>
```

### Dense Actions and Title Action

```html
<mai-dialog-body>
  <h2 slot="title">Actions</h2>
  <mai-button appearance="subtle" icon-only slot="title-action">
    <!-- Info icon SVG -->
  </mai-button>
  <p>
    A dialog body should have no more than <strong>two</strong> footer actions. However,
    if required, you can populate the action slot with any number of buttons as needed.
  </p>
  <mai-button slot="action" size="small">Something</mai-button>
  <mai-button slot="action" size="small">Something Else</mai-button>
  <mai-button slot="action" size="small" appearance="primary">Close Dialog</mai-button>
  <mai-button slot="action" size="small">Something Else Entirely</mai-button>
</mai-dialog-body>
```

### No Close Button

```html
<mai-dialog-body>
  <h2 slot="title">No Close</h2>
  <p>Example where no close button is present.</p>
</mai-dialog-body>
```

### Custom Close Action

```html
<mai-dialog-body>
  <h2 slot="title">Custom Title Action</h2>
  <p>
    This dialog has a custom title action that is rendered in place of the default close button.
  </p>
  <mai-button
    slot="close"
    appearance="subtle"
    icon-only
    onclick="alert('This is a custom action')"
  >
    <!-- Custom dismiss icon SVG -->
  </mai-button>
</mai-dialog-body>
```

### No Title, Title Action Only

```html
<mai-dialog-body>
  <mai-button appearance="subtle" icon-only slot="title-action">
    <!-- Info icon SVG -->
  </mai-button>
  <p>Example where no title is present but has title actions.</p>
</mai-dialog-body>
```

## Accessibility Notes

- Provide an accessible name for the dialog via the `title` slot or `aria-labelledby` on the host dialog element.
- Ensure close and action buttons expose clear `aria-label` values when icon-only.
- Maintain focus order: the close action should remain reachable even when replaced.
