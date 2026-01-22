# Tablist Style Guidelines

This guide explains how to integrate and configure the `mai-tablist` component when building experiences with the MAI Design System. It covers registration, configurable attributes, slot usage, layout behavior, and example implementations that align with the tokens defined in `packages/core/tablist/src/tablist.styles.ts` and the Storybook stories in `packages/core/tablist/src/tablist.stories.ts`.

## Registration

Import the component definition from `@mai-ui/tablist`. The package registers the element with the MAI design system prefix, exposing the `mai-tablist` tag name.

```ts
import "@mai-ui/tablist";
```

## Tags and Slots

- **Tag name:** `mai-tablist` (defined in `tablist.options.ts`).
- **Default slot (`slot="tab"`):** Accepts one or more `mai-tab` elements. Each tab is rendered as a slotted child with `role="tab"`.
- **Nested slots on `mai-tab`:** Individual `mai-tab` instances can expose additional slots such as `slot="start"` for leading icons or badges. The tablist passes these through without modification.

## Attributes and Properties

| Attribute / Property | Type | Default | Description |
| --- | --- | --- | --- |
| `activeid` | `string` | First enabled tab | Id of the tab that should be active. Updates when the user changes tabs. |
| `disabled` | `boolean` | `false` | Disables keyboard and pointer interaction for the tablist and all descendant tabs. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Controls layout direction and style treatment. Values come from `TablistOrientation`. |

### Events

- `change`: Fired when the active tab changes. The event target is the `mai-tablist` instance. Read `event.target.activetab` to access the selected `mai-tab`.

## Layout, Visibility, and Styling Rules

Styling for the component is defined in `tablist.styles.ts` and leverages MAI design tokens. The following guidance summarizes the behavior for each styling scenario.

### Horizontal Orientation (default)

- `display: flex` with `flex-direction: row` and `gap: gapBetweenContentSmall` keeps tabs evenly spaced.
- The selected tab exposes `anchor-name: --tab`. A host-level `::after` indicator (pill highlight) anchors to the centered position of the selected tab when CSS Anchor Positioning is supported.
- Highlight sizing respects the tab width minus `paddingCtrlHorizontalDefault * 2` and is capped by `ctrlListPillLengthRest`. Height is `ctrlListPillWidth` with rounded corners (`cornerCircular`).
- Without anchor support, the indicator falls back to the per-tab pseudo-element styles provided by the Fluent base class.

### Vertical Orientation (`orientation="vertical"`)

- Host switches to `flex-direction: column` and tabs align to `flex-start`.
- Each tab adds `padding-inline-start: ctrlListIndentLevel1` to align with MAI indentation rules.
- Selected tabs change background using `ctrlListBackgroundSelectedRest` / `Hover` / `Pressed`, with disabled variants pulling from `ctrlListBackgroundSelectedDisabled`.
- Hover/active feedback on unselected tabs uses the subtle background tokens `backgroundCtrlSubtleHover` and `backgroundCtrlSubtlePressed`.
- The vertical indicator is rotated via CSS anchors: height matches the tab height minus `paddingCtrlTextTop` and `paddingCtrlTextBottom`; width becomes `ctrlListPillWidth` to create a leading pill.
- `::slotted([role="tab"])` entries remain full-width to create an accessible list presentation.

### Disabled State (`disabled` attribute)

- The host and slotted tabs adopt `color: foregroundCtrlOnTransparentDisabled` and `cursor: not-allowed`.
- Pointer events are disabled on all slotted tabs, ensuring no accidental interaction.
- The indicator color also shifts to `foregroundCtrlOnTransparentDisabled` for visual consistency.

### Forced Colors Support

- When `forced-colors: active`, the highlight color resolves to the system `Highlight` value, ensuring accessibility in high-contrast environments.

## Usage Examples

The snippets below mirror the Storybook stories in `tablist.stories.ts`. They illustrate typical configurations and should be used as a baseline for development.

### 1. Default Horizontal Tablist

```html
<mai-tablist>
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">Second Tab</mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 2. Horizontal Tabs with Start Slot Content

```html
<mai-tablist>
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">
    <span slot="start">
      <svg
        fill="currentColor"
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.5 3A2.5 2.5 0 0117 5.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 14.5v-9A2.5 2.5 0 015.5 3h9zm0 1h-9C4.67 4 4 4.67 4 5.5v9c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM7 11a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zM7 7a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2z"
        ></path>
      </svg>
    </span>
    Second Tab
  </mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 3. Vertical Orientation

```html
<mai-tablist orientation="vertical">
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">Second Tab</mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 4. Vertical Orientation with Start Slot Content

```html
<mai-tablist orientation="vertical">
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">
    <span slot="start">
      <svg
        fill="currentColor"
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.5 3A2.5 2.5 0 0117 5.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 14.5v-9A2.5 2.5 0 015.5 3h9zm0 1h-9C4.67 4 4 4.67 4 5.5v9c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM7 11a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zM7 7a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2z"
        ></path>
      </svg>
    </span>
    Second Tab
  </mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 5. Disabled Tablist

```html
<mai-tablist disabled>
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">Second Tab</mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 6. Programmatic Active Tab

```html
<mai-tablist activeid="third-tab">
  <mai-tab id="first-tab">First Tab</mai-tab>
  <mai-tab id="second-tab">Second Tab</mai-tab>
  <mai-tab id="third-tab">Third Tab</mai-tab>
  <mai-tab id="fourth-tab">Fourth Tab</mai-tab>
</mai-tablist>
```

### 7. Auto Panel Association

Associate tabs with external panels via `aria-controls`. The tablist automatically wires the relationship.

```html
<mai-tablist>
  <mai-tab aria-controls="panel1">First Tab</mai-tab>
  <mai-tab aria-controls="panel2">Second Tab</mai-tab>
  <mai-tab aria-controls="panel3">Third Tab</mai-tab>
  <mai-tab aria-controls="panel4">Fourth Tab</mai-tab>
</mai-tablist>
<div id="panel1">First panel</div>
<div id="panel2">Second panel</div>
<div id="panel3">Third panel</div>
<div id="panel4">Fourth panel</div>
```

## Implementation Tips

- Always provide unique `id` values for tabs when you need to control `activeid` or establish `aria-controls` relationships.
- Pair `orientation="vertical"` with supporting layout containers to ensure tablists align with surrounding content, especially when using the leading indicator.
- When listening to `change`, read `event.currentTarget.activetab` to keep content panels synchronized with the selected tab.
- For consistent icon sizing in start slots, prefer 20px square SVGs and rely on `currentColor` for theming.

## Testing Guidance

- Use the `@mai-ui/test-harness` Playwright fixture (`tablist.pw.spec.ts`) to validate interactive behavior across CSR and SSR contexts.
- For visual regression coverage, rely on `tablist.pw.visual.ts` to confirm highlight and orientation treatments across themes.
