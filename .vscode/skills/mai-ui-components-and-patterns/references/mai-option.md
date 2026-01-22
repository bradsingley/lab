# Option Component Style Guidelines

## Component Tag and Registration
- Tag name: `mai-option` with the MAI design system prefix.
- Automatically registered when you import `@mai-ui/option`; no additional setup required when using the bundled registration entry (`define.js`).

## Configurable Attributes
- `selected`: marks the option as selected. Triggers selected styling and indicator visibility.
- `disabled`: disables pointer interaction, switches to disabled colors, and prevents selection.
- `name`: optional form participation name passed to the parent `mai-dropdown` or form element.
- `required`: marks the option as required within a form context.
- `text`: label used for pill/button rendering in the parent dropdown when the option is chosen.
- `value`: submitted form value. Defaults to the text content when omitted.
- `slot`: use the `slot="start"` or `slot="description"` positions when projecting the option into composite components.

## Slots
- _(default slot)_: primary label/content. Treated as pointer-events none to ensure clicks land on the host.
- `start`: leading region (icons, avatars). Automatically aligned in the first column of the internal grid.
- `description`: secondary text rendered on its own row when present.
- `checked-indicator`: overrides the default indicator shown when the option is selected. Hidden until the option is in the selected state.

## Style States and Layout Rules

### Base option layout
- Host displays as an inline grid with three columns (indicator, start, content) and centers items vertically.
- Minimum control height comes from the `sizeCtrlDefault` token; inline padding matches `ctrlListIndentLevel1`.
- `::slotted([slot='start'])` and the `.content` wrapper ignore pointer events to keep the click target on the host.
- Indicator slot (`slot="checked-indicator"`) is hidden (`visibility: hidden`) until the selection state is active.

```html
<mai-option>Option</mai-option>
```

### Hover and active interactions
- `:host(:hover)` switches to the hover background/foreground tokens.
- `:host(:active)` applies pressed colors to background and foreground.
- `:host([state--active])` (set by the dropdown focus management) applies the focus stroke using `ctrlFocusOuterStroke` and width tokens.

### Selected state (single selection)
- `:host([state--selected])` increases the font weight to `textCtrlWeightSelected`.
- The default radio indicator (`.radio-indicator`) becomes visible, using current color, and expands to the `ctrlChoiceBaseSize` square.

```html
<mai-option selected id="selected-single">Selected</mai-option>
```

### Multiple-selection mode
- `:host([state--multiple])` hides the radio dot and switches to the checkmark indicator (`.checkmark-16-filled`).
- Parent dropdowns toggle this state when `selection-mode="multiple"` is active. When applying manually, call `toggleState(option.elementInternals, "multiple", true)`.

```html
<mai-option id="multiple">Multiple selection mode</mai-option>
<script type="module">
  import { toggleState } from "@mai-ui/component-framework/toggle-state.js";
  const option = document.querySelector("#multiple");
  toggleState(option.elementInternals, "multiple", true);
</script>
```

### Selected in multiple-selection mode
- Selected multiple options fill the checkmark with `ctrlListChoiceBackgroundSelectedRest`.
- Disabled + selected multiple options switch to `ctrlListChoiceForegroundSelectedDisabled` for accessibility contrast.

```html
<mai-option id="selected-multiple" selected>Selected (multiple selection mode)</mai-option>
<script type="module">
  import { toggleState } from "@mai-ui/component-framework/toggle-state.js";
  const option = document.querySelector("#selected-multiple");
  toggleState(option.elementInternals, "multiple", true);
</script>
```

### Disabled states
- `:host(:disabled)` swaps to subtle disabled background/foreground tokens and disables pointer cursor.
- Selected disabled options recolor the indicator using `ctrlListChoiceForegroundSelectedDisabled`.

```html
<mai-option disabled id="disabled-unselected-single">Disabled unselected</mai-option>
<mai-option disabled selected id="disabled-selected-single">Disabled selected</mai-option>
```

```html
<mai-option disabled id="disabled-unselected-multiple">Disabled unselected</mai-option>
<mai-option disabled selected id="disabled-selected-multiple">Disabled selected</mai-option>
<script type="module">
  import { toggleState } from "@mai-ui/component-framework/toggle-state.js";
  const multipleIds = ["disabled-unselected-multiple", "disabled-selected-multiple"];
  multipleIds.forEach(id => {
    const option = document.querySelector(`#${id}`);
    toggleState(option.elementInternals, "multiple", true);
  });
</script>
```

### Description layout
- When the description slot is populated the component toggles `[state--description]` internally.
- Grid template expands to two rows: `content` and `description` share the third column, aligning with indicator and start columns.
- Description text uses the small body typography ramp and neutral secondary foreground token.

```html
<mai-option selected>
  Option with 32px avatar
  <span slot="description">Additional information is slotted in the description slot</span>
  <mai-avatar slot="start" size="32" color="blue">32</mai-avatar>
</mai-option>
```

### Start-slot sizing rules
- Supports avatars or icons of varying sizes; the grid auto column adapts to the slotted element dimensions.
- When the start slot contains elements larger than 16px, the component increases column gap via the `:has([slot='start']:not([size='16']))` rule (browser capability permitting).

```html
<mai-option selected>
  Option with 24px avatar
  <mai-avatar slot="start" size="24" color="blue">24</mai-avatar>
</mai-option>
```

### Custom checked indicator
- Provide any element in `slot="checked-indicator"` to override the default radio/checkmark visuals.
- The slotted indicator keeps `visibility: hidden` until the host enters the selected state, matching the built-in behavior.

```html
<mai-option selected>
  Custom indicator
  <svg slot="checked-indicator" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" fill="currentColor"></circle>
  </svg>
</mai-option>
```

### Forced-colors support
- In high-contrast environments, borders switch to the system `Field` color and indicators use `Highlight`.
- Focus and hover states suppress the border to let the platform highlight show through.

## Accessibility Notes
- Ensure the parent `mai-dropdown` manages selection mode (`single` vs `multiple`) so the correct indicator shows without manual state toggles.
- Provide text content in the default slot; when using only icons, include accessible text via `aria-label` or visually hidden content.
- Rely on the `text` attribute to set the collapsed dropdown label when the projected content is more complex than plain text.
