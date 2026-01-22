# Accordion Item Styling Guide

This guide documents the configurable surface area and styling behavior of the `mai-accordion-item` component so that implementers can apply it consistently across experiences.

## Component Overview

- **Tag**: `mai-accordion-item`
- **Inheritance**: Extends the Fluent UI `BaseAccordionItem` while layering MAI-specific styling tokens and behaviors.
- **Primary use**: Collapsible disclosure item inside `mai-accordion` or similar containers.

## Configurable API Surface

### Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `heading-level` | `1`-`6` | `2` | Sets the semantic level used for the internal heading element (`role="heading"`). |
| `expanded` | boolean | `false` | When present, forces the item open and reveals the content region. |
| `disabled` | boolean | `false` | When present, prevents user interaction and applies disabled styling. |

### Slots

| Slot | Purpose | Layout Guidance |
| --- | --- | --- |
| (default) | Collapsible panel body content. | Hidden (`display: none`) until `expanded` is applied, then becomes block-level and spans full width. |
| `heading` | Text or inline elements presented in the clickable header. | Inherits heading typography, trimmed `text-box`. Pointer events are disabled on the slotted node to ensure the button handles focus. |
| `start` | Optional leading visual such as an icon. | Clamped to `24px × 24px` (matches `sizeCtrlLgIcon`). Pointer events are disabled to preserve button focus behavior. |

### Parts

The component exposes `heading`, `button`, and `content` parts for style overrides when shadow parts are targeted.

## Styling Behaviors

The styles are defined in `packages/core/accordion-item/src/accordion-item.styles.ts`. Each rule group below explains the visibility, sizing, and interaction model for that state.

### Base Layout

- Host renders as a grid (`display: grid`) with medium spacing (`gapBetweenContentMedium`) between the heading and content.
- Internal heading row is a flex container that:
  - Aligns items center, stretches to 100% width, and applies `padding-inline: ctrlListLgIndentLevel1` to align with surrounding accordion layout.
  - Uses MAI large body typography tokens and trims text overflow via `text-box-trim`.
  - Responds to hover with `ctrlListBackgroundSelectedHover` background.
- The action button consumes available width (`flex: 1`) and sets min height to `44px` to maintain hit target requirements.
- The chevron container reserves a square footprint (`ctrlChoiceLgBaseSize`) and animates rotation for expansion.
- Base transitions use `durationFaster` (100 ms) with `curveEasyEase` easing.

**Story example (Base + Expanded default):**
```html
<mai-accordion-item expanded heading-level="2">
    <span slot="heading">Description</span>
    <p>
        Chalk is a soft, white, porous, sedimentary carbonate rock, a form of
        limestone composed of the mineral calcite. Calcite is an ionic salt
        called calcium carbonate or CaCO3. It forms under reasonably deep
        marine conditions from the gradual accumulation of minute calcite
        shells shed from micro-organisms called coccolithophores. Flint is
        very common as bands parallel to the bedding or as nodules embedded in
        chalk.
    </p>
</mai-accordion-item>
```

### Expanded State (`:host([expanded])`)

- Reveals the content region by switching it from `display: none` to `display: block`.
- Rotates the chevron `-180deg` to indicate the open state.
- Ensure the `id` assigned to the component is unique so the generated `aria-controls` and `aria-labelledby` attributes remain valid.

### Collapsed State (default)

- The content slot stays hidden (`display: none`).
- The chevron remains unrotated. The layout still reserves chevron space to avoid shift on toggle.

### Disabled State (`:host([disabled])`)

- Suppresses hover feedback to maintain a stable background and switches cursor to `not-allowed`.
- Heading button typography uses the disabled neutral token and the chevron icon desaturates via a filter so the visual weight drops.
- The start slot keeps its size clamp; avoid inserting focusable elements because pointer events are disabled and the host is non-interactive.

### Focus Treatment

- When any descendant receives `:focus-visible`, the heading gets a dual outline:
  - Inner stroke (`ctrlFocusInnerStroke`) rendered via inset box-shadow.
  - Outer stroke (`ctrlFocusOuterStroke`) rendered via outline to meet accessibility contrast.

### Corner Shape Support

- For environments that support `corner-shape: squircle`, the host increases its squircle modifier to `1.8` to smooth the header corners.

### Motion Preferences

- When the OS requests reduced motion, transition duration drops to `0.01ms` so chevron rotations and hover transitions effectively snap without animation.

## Implementation Notes

- Always call `accordionItem.expand()`/`collapse()` programmatically or toggle the `expanded` attribute to update the view; avoid directly manipulating the internal slot visibility.
- When providing rich heading content, wrap it with semantic inline elements (`<span>`) so typography trims behave correctly.
- Limit `start` slot content to square icons; larger assets will be clipped due to the max dimensions.
- Provide sufficient textual context in the default slot to convey meaning when the accordion is expanded, especially when used inside disclosure groups.

## Testing Checklist

- Verify keyboard interaction: `Enter` and `Space` toggle expansion, and focus outlines remain visible against background colors.
- Confirm that adding `PLAYWRIGHT_TEST_SSR=true` still renders heading and content correctly in SSR since layout relies on standard CSS.
- Ensure that content height changes do not require manual animation; only visibility toggles are provided by default.
