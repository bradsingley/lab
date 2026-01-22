# Tooltip Style Guidelines

The `mai-tooltip` component extends the Fluent tooltip foundation while applying MAI design tokens for color, typography, and spacing. Use this guide when configuring tooltips in product surfaces to keep interaction timing, placement, and sizing consistent.

## Configuration Surface

- **Tag name**: `mai-tooltip`
- **Attributes**:
  - `anchor="<element-id>"` — ID of the element the tooltip tracks. Required for visibility.
  - `delay="<number>"` — Milliseconds to wait before showing and hiding after pointer or focus changes (defaults to `250`).
  - `positioning="above-start|above|above-end|below-start|below|below-end|before-top|before|before-bottom|after-top|after|after-bottom"` — Controls placement relative to the anchor, mapping to the FAST `TooltipPositioningOption` tokens.
- **Slots**: default slot only; inline text or markup appears inside the tooltip body and inherits host typography.
- **CSS custom properties**: component-scoped internal variables (`--_squircle-modifier`, `--_position-area`, etc.) tune offsets and are not intended for external overrides.

## Layout and Visibility Rules

### Popover lifecycle
- The host renders as `inline-flex`, but when `:popover-open` is absent the component collapses to `display: none`; tooltips only occupy layout when open.
- Tooltips are absolutely positioned with logical properties (`position-area`, `position-try-options`) to align around the anchor element while supporting fallback behavior.

### Base styling
- Background (`ctrlTooltipBackground`), foreground (`ctrlTooltipForeground`), border (`ctrlTooltipStroke`), and shadow tokens establish a floating surface that meets MAI contrast targets.
- Minimum height (`ctrlTooltipMinHeight`) and max width (`240px`) keep content concise; overflow remains visible to allow squircle corners.
- Padding combines vertical tokens (`paddingCtrlTextTop`, `paddingCtrlTextBottom`) with horizontal gutters (`paddingCtrlHorizontalDefault`).
- Typography uses the metadata ramp (`textRampMetadata*`) and default regular weight/family tokens for consistency across tooltips.

### Corner and shape behavior
- `corner-shape: squircle` with the MAI corner token creates the signature tooltip contour. In environments that support `corner-shape`, the modifier increases (`--_squircle-modifier: 1.8`) for smoother curvature.

### Positioning adjustments
- Logical margins (`margin-block`, `margin-inline`) add a `4px` gap between the tooltip and anchor based on orientation, keeping the surface from touching the target element.
- The component switches between `flip-block` and `flip-inline` fallback strategies automatically when the chosen side lacks space.
- Each `positioning` value updates `--_position-area`, steering `position-area`/`inset-area` so the tooltip aligns to the corresponding corner or edge of the anchor.

## Usage Examples

### Default tooltip
- Demonstrates the necessary anchor relationship and default delay/placement. The decorator in Storybook supplies matching IDs; replicate that pairing in application code by ensuring the anchor ID matches the tooltip’s `anchor` attribute.

```html
<mai-link id="help-link" href="#">Hover me</mai-link>
<mai-tooltip anchor="help-link">
  Really long tooltip content goes here. Lorem ipsum dolor sit amet.
</mai-tooltip>
```

### Positioning matrix
- Showcases every `positioning` option arranged in a grid. Each tooltip anchors to its companion button and uses the same ID for clarity.

```html
<div class="tooltip-grid">
  <mai-button icon-only id="above-start" size="large">
    <svg><use href="#arrow-step-back-20-regular"></use></svg>
  </mai-button>
  <mai-tooltip anchor="above-start" positioning="above-start">
    above-start
  </mai-tooltip>
  <mai-button icon-only id="above" size="large">
    <svg><use href="#arrow-step-out-20-regular"></use></svg>
  </mai-button>
  <mai-tooltip anchor="above" positioning="above">
    above
  </mai-tooltip>
  <!-- Repeat for above-end, before-top, before, before-bottom, after-top, after, after-bottom, below-start, below, below-end -->
</div>

<style>
  .tooltip-grid {
    display: grid;
    gap: 4px;
    margin: auto;
    width: min-content;
    grid-template-areas:
      '. above-start above above-end .'
      'before-top . . . after-top'
      'before . . . after'
      'before-bottom . . . after-bottom'
      '. below-start below below-end .';
  }
</style>
```

## Development Notes

- Tooltips require a focusable or hoverable anchor. Set `anchor` dynamically if you generate IDs at runtime.
- Because the component relies on the native `popover` API, ensure feature detection or polyfills for legacy browsers if necessary.
- Provide alternate affordances (e.g., visible helper text) for persistent instructions that must be available on touch-only devices.
- Avoid nesting complex interactive elements inside the tooltip slot; keep content concise, readable, and accessible.
