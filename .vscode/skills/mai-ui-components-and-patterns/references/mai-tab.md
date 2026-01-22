# Tab Style Guidelines

The `mai-tab` component presents a selectable control inside `mai-tablist`. It extends the Fluent UI web component `Tab`, while applying MAI design tokens for typography, indicators, and focus treatments. Use this guide when composing tabbed navigation so the selection affordance, spacing, and accessibility stay consistent.

## Configuration Surface

- **Tag name**: `mai-tab`
- **Module**: `import "@mai-ui/tab";`
- **Appearance**: inherits Fluent `Tab` foundation; the MAI theme currently exposes a single appearance profile driven by tokenized colors and the pill indicator.
- **Attributes**:
  - `disabled` — removes pointer interactions and maps colors to the disabled token set.
  - `aria-selected` — managed by `mai-tablist`; toggles the active pill indicator and typography weight.
  - `aria-controls` / `aria-labelledby` — connect the tab to a corresponding tab panel in your application (consumer-managed).
  - `data-hasIndent` — opt-in layout hook for hierarchically indented tabs (see **Indented layout**).
- **Slots**:
  - Default slot — tab text or custom inline content; mirrored to a hidden pseudo element so width stays stable when the tab becomes selected.
  - `slot="start"` — leading icon or adornment; displayed as flex and participates in the host gap spacing.
  - `slot="end"` — trailing metadata (badge, icon, etc.); also displayed as flex.
- **Events**: inherits Fluent `Tab` change events surfaced by `mai-tablist` (selection changes originate from the parent component).

## Style States and Layout Rules (from `packages/core/tab/src/tab.styles.ts`)

### Base tab
- Host renders as `inline-flex` with centered alignment, `box-sizing: border-box`, and columnar `.tab-content` padding (`gapInsideCtrlDefault`, `gapBetweenContentXxSmall`).
- Typography uses `textStyleDefaultHeaderFontFamily`, `textRampItemBodyFontSize`, and `textRampItemBodyLineHeight`; base weight `textCtrlWeightDefault` keeps unselected tabs visually lighter.
- Minimum height aligns with `sizeCtrlDefault`; horizontal padding uses `paddingCtrlHorizontalDefault` paired with top/bottom text padding tokens.
- The host sets `corner-shape: squircle` and stores the multiplier in `--_squircle-modifier` so browsers with `corner-shape` support get smoother curves.
- `::after` pseudo element draws the pill indicator: absolute positioned, capped by `ctrlListPillLengthRest`, and inset so it never exceeds the control width minus horizontal padding.

### Selected (`aria-selected="true"`)
- Font weight escalates to `textCtrlWeightSelected` for emphasis.
- Indicator background switches to `backgroundCtrlActiveBrandRest` and stacks above content (`z-index: 2`).
- In forced-colors, the indicator maps to `Highlight` for contrast (see **Forced colors** below).

### Hover, unselected (`aria-selected="false":hover`)
- `::after` transitions to `foregroundCtrlHintDefault` with left-origin scaling, providing a preview of the indicator without matching the selected z-index.
- Transition duration (`100ms`) and timing (`linear`) keep hover feedback responsive.

### Disabled state (`disabled`)
- Host cursor changes to `not-allowed`; both text and fill use `foregroundCtrlOnTransparentDisabled`.
- Hover indicator suppression (`background-color: unset`) prevents unexpected pill flashes.
- When the tab is selected and disabled the indicator color also resolves to the disabled token, aligning with accompanying `mai-tablist` styling.

### Focus-visible
- Outline wraps the squircle corner radius (`cornerCtrlSmRest`) and renders the dual-ring token treatment: inner stroke `ctrlFocusInnerStroke` + `ctrlFocusInnerStrokeWidth`, outer outline `ctrlFocusOuterStroke` + `ctrlFocusOuterStrokeWidth`.
- `outline-offset` equals the inner stroke width so the focus ring hugs the host without overlapping neighboring tabs.

### Indented layout (`data-hasIndent`)
- Host switches to CSS Grid: `grid-template-columns: 20px 1fr auto`.
- `.tab-content` occupies the second column (`grid-column: 2`) and left aligns to match vertical tablist hierarchy; optional start/end slots can live in column 1 or 3 depending on their slot.
- Use this attribute when pairing tabs with navigational trees or when visual indent precedes the label.

### Squircle support feature query
- `@supports (corner-shape: squircle)` increases the multiplier (`--_squircle-modifier: 1.8`), rounding the control more aggressively on capable browsers while maintaining compatibility elsewhere.

### Forced colors mode
- `@media (forced-colors: active)` pins the selected indicator to `Highlight`, guaranteeing sufficient contrast in high-contrast themes.
- Disabled tabs inherit `Highlight` for the indicator through the shared rule, matching Windows system expectations.

### Anchor positioning fallback (Safari workaround)
- When both `anchor-name` and `text-size-adjust: auto` are supported, the component defers indicator rendering to `mai-tablist`. In this mode the tab keeps hover feedback (`backgroundCtrlHintDefault`) but relinquishes the primary indicator color to the parent.

## Slot Content Behavior

- `.tab-content` wraps slotted text in a column layout and adds symmetrical inline padding. The hidden `::after` text node (`content: var(--textContent)`) preserves width when font weight changes on selection, preventing layout jank.
- Slotted `start` / `end` elements inherit `display: flex`, allowing icons or badges to remain vertically centered and to respect the host gap spacing.
- Because the host uses `inline-flex`, tabs align naturally inside `mai-tablist` while still responding to surrounding inline layout.

## Usage Pattern

Storybook examples for `mai-tab` are not yet published (`packages/core/tab/src/tab.stories.ts` is absent). The snippet below mirrors the recommended setup using `mai-tablist` and manually managed tab panels:

```html
<mai-tablist id="profile-tabs" activeid="overview">
  <mai-tab slot="tab" id="overview" aria-controls="overview-panel">Overview</mai-tab>
  <mai-tab slot="tab" id="activity" aria-controls="activity-panel">
    <span slot="start" aria-hidden="true">🗓</span>
    Activity
  </mai-tab>
  <mai-tab slot="tab" id="settings" aria-controls="settings-panel" disabled>
    Settings
    <span slot="end">Soon</span>
  </mai-tab>
</mai-tablist>

<section id="overview-panel" role="tabpanel" aria-labelledby="overview">
  <!-- Overview content -->
</section>
<section id="activity-panel" role="tabpanel" aria-labelledby="activity" hidden>
  <!-- Activity content -->
</section>
<section id="settings-panel" role="tabpanel" aria-labelledby="settings" hidden>
  <!-- Settings content -->
</section>
```

- `mai-tablist` manages selection state (`aria-selected`) and the active indicator; connect tabs to panels with matching IDs via `aria-controls` / `aria-labelledby`.
- Use `hidden` or conditional rendering on panels to match the active tab, or subscribe to `mai-tablist` selection change events for dynamic content swaps.
- When indenting secondary navigation, add `data-hasIndent` to the relevant `mai-tab` instances to opt into the grid-based layout.

## Accessibility Notes

- Always ensure every tab has an accessible name (text content or `aria-label`). When slots contain icon-only content, provide an accessible label to avoid empty `aria` names.
- Maintain id/`aria-controls` or `aria-labelledby` wiring so assistive technologies announce the relationship between tabs and their associated panels.
- High-contrast support is built into the style sheet; no additional overrides are required, but test vertical and disabled scenarios to confirm contrast within your layout.
