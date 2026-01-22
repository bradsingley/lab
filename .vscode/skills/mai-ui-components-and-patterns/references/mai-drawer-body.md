# Drawer Body Style Guidelines

`mai-drawer-body` structures the interior regions of a `mai-drawer`. It standardizes spacing for the header, scrolling content, and footer action row so teams can compose drawers without recreating layout logic. This guide captures the configurable surface area and the enforced styling contract from `packages/core/drawer-body/src/drawer-body.styles.ts`.

## Component Summary

- **Tag name:** `mai-drawer-body` (exported by `@mai-ui/drawer-body`).
- **Inheritance:** Extends the Fluent UI drawer body element; lifecycle and accessibility semantics follow the Fluent implementation.
- **Appearance variants:** None. Visual styling is entirely driven by the single `styles` block and the design tokens it consumes.

## Slots, Parts, and Expected Content

| Slot | Purpose | Notes |
| --- | --- | --- |
| *(default)* | Main scrollable content region. | Stretches to fill the middle grid row and scrolls independently of the header/footer. |
| `title` | Heading element rendered in the header row. | Inherits the header typography tokens. Provide a semantic heading element (e.g., `<h2>`). |
| `close` | Action rendered to the right of the title. | Routed through the built-in `clickHandler` so invoking it dismisses the owning drawer. Use an icon-only `mai-button` or comparable control. |
| `footer` | Persistent action area at the bottom. | Intended for primary and secondary buttons. |

Named [shadow parts](https://developer.mozilla.org/docs/Web/CSS/::part) exposed by the template:

| Part | DOM element | Styling impact |
| --- | --- | --- |
| `header` | `<div class="header">` | Aligns header content horizontally and applies the header padding block. |
| `content` | `<div class="content">` | Manages scrollable middle region and inherits default slot content. |
| `footer` | `<div class="footer">` | Hosts footer slot content with left-aligned flex layout. |

## Layout Rules from `drawer-body.styles.ts`

### Host grid container

- The host uses `${display("grid")}` to establish a three-row layout: `min-content 1fr min-content`.
- `box-sizing: border-box`, `height: 100%`, and `max-height: 100svh` ensure the body fills its parent drawer while respecting viewport height.
- Text color inherits the neutral body token `foregroundContentNeutralPrimary` so content matches drawer copy.

### Header row

- `.header` renders as `flex` with a horizontal gap of `gapBetweenCtrlDefault` between the title and close action.
- Typography is locked with `textStyleDefaultHeaderWeight`, `textRampSectionHeaderFontSize`, `textRampSectionHeaderLineHeight`, and `textStyleDefaultHeaderFontFamily` to keep drawer titles consistent across the suite.
- Padding uses `paddingContentLarge` on the block-start edge and `paddingContentAlignDefault` on the block-end edge to align with other surfaces.
- `::slotted([slot="title"])` clears default margins so typography aligns precisely with the padding box.

### Content row

- `.content` occupies the flexible `1fr` grid row and enables `overflow: auto` to scroll independently of the header and footer.
- Inline padding is `paddingContentLarge` to keep the body copy aligned with header/footer columns.
- Keep focusable controls keyboard reachable; the scrollable container maintains standard focus outlines.

### Footer row

- `.footer` is a `flex` container with the same inline padding as the other rows and a block padding of `paddingContentAlignDefault` (top) and `paddingContentLarge` (bottom).
- Content is left-aligned (`justify-content: flex-start`); add utility wrappers if you need right-aligned or evenly spaced buttons.
- Use `gapBetweenCtrlDefault` for spacing between actions automatically.

### Slot visibility expectations

- All named slots occupy space only when populated. If you omit `title`, the header still reserves its padding but no heading is rendered.
- The `close` slot remains visually aligned even when the title wraps to multiple lines because the parent header flex container keeps them on the same baseline.
- The footer container collapses when no footer slot content is provided, keeping the body compact.

## Interaction Notes

- The `close` slot wires into the internal `clickHandler` from Fluent’s base class. Triggering the slot’s primary click will call `Drawer.hide()` on the owning drawer instance. Use native button elements or `mai-button` to guarantee accessible activation semantics.
- The component does not emit custom events. Listen to events on the parent `mai-drawer` (`beforetoggle`, `toggle`, `cancel`) for lifecycle changes.

## Example Markup

The snippet below is adapted from `packages/core/drawer/src/drawer.stories.ts` and shows the canonical composition of `mai-drawer` with `mai-drawer-body`.

```html
<mai-drawer
  id="drawer-default"
  position="start"
  type="modal"
>
  <mai-drawer-body>
    <h2 slot="title">Drawer Header</h2>
    <mai-button
      slot="close"
      appearance="subtle"
      icon-only
      aria-label="close"
      @click="() => document.getElementById('drawer-default').hide()"
    >
      <!-- Dismissed20RegularSvg icon -->
    </mai-button>
    <div>
      The drawer gives users a quick entry point to configuration and information. It should be used when retaining
      context is beneficial to users. An overlay is optional depending on whether or not interacting with the
      background content is beneficial to the user's context/scenario. An overlay makes the drawer blocking and signifies
      that the users full attention is required when making configurations.
    </div>
    <div slot="footer">
      <mai-button appearance="primary" @click="() => document.getElementById('drawer-default').hide()">Close</mai-button>
      <mai-button appearance="secondary">Do Something</mai-button>
    </div>
  </mai-drawer-body>
</mai-drawer>
<mai-button appearance="primary" @click="() => document.getElementById('drawer-default').show()">
  Toggle Drawer
</mai-button>
```

## Implementation Checklist

- Use semantic heading elements (`<h2>`, `<h3>`, etc.) in the `title` slot so assistive tech announces the drawer context.
- If you omit the `close` slot, provide a different closure affordance (for example, a footer button) to maintain parity with Fluent behavior.
- Keep sticky toolbars or large forms inside the default slot; the component already manages scrollable overflow, so additional nested scroll containers are rarely necessary.
- Pair `mai-drawer-body` with `mai-drawer` only. The component expects to live inside a drawer for correct sizing and dismissal wiring.
