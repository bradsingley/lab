# Button Style Guidelines

The `mai-button` component is the primary action control in the MAI Design System. This guide explains the configurable attributes, slots, and the expected layout behavior for each supported style variant so you can apply the correct presentation during development.

## Configuration Surface

- **Tag name**: `mai-button`
- **Attributes** (in addition to standard button attributes inherited from FAST `BaseButton`):
  - `appearance="neutral|onimage|outline|primary|subtle"`
  - `size="small|medium|large"`
  - `icon-only` (boolean)
  - `disabled`, `disabled-focusable`
  - Form-associated attributes: `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`
  - Standard button attributes: `type`, `value`, `name`, `autofocus`
- **Slots**:
  - Default slot for the button label or custom content.
  - `slot="start"` for leading iconography or content.
  - `slot="end"` for trailing content (currently hidden in Storybook, but supported by the component).
- **Parts**: `content` wraps the slotted label and applies internal padding.

The component renders as `inline-flex` with centered alignment. All variants share the base metrics: border-box sizing, `gap` between slot content, and token-driven padding that adapts to the size setting.

## Style Sets and Layout Rules

### Neutral appearance (default)
- **Layout**: minimum height uses `sizeCtrlDefault`; horizontal padding uses `paddingCtrlHorizontalDefault` (or the icon-only token when applicable). The `.content` region applies top/bottom padding tokens minus the outline width so text stays vertically centered.
- **States**:
  - Hover increases corner radius (`cornerCtrlHover`) and switches to `backgroundCtrlNeutralHover` / `foregroundCtrlNeutralPrimaryHover`.
  - Active applies pressed tokens and removes outlines.
  - Focus-visible draws a dual-ring focus treatment using `ctrlFocusInnerStroke` and `ctrlFocusOuterStroke`.
- **Icons**: default icon size equals `sizeCtrlIcon`; dimensions adjust automatically when `size` changes.
- **Example** (from `Default` story):

```html
<mai-button>Button</mai-button>
```

### Size variants (`small`, `medium`, `large`)
- **Layout**: each size overrides min-height, horizontal padding, font ramp, gap, and corner radius with size-specific tokens. Icons shrink or grow to the matching token (`sizeCtrlSmIcon`, `sizeCtrlLgIcon`).
- **Icon-only widths**: for each size, `icon-only` forces the host width to the matching control size token so the component remains square.
- **Examples** (Storybook `SmallSize`, `MediumSize`, `LargeSize`):

```html
<mai-button size="small">Small</mai-button>
<mai-button size="medium">Medium</mai-button>
<mai-button size="large">Large</mai-button>
```

### Icon-only presentation
- **Layout**: removes internal padding and sets the outer width to the control size token for the current `size`. `.content` padding drops to zero, keeping the icon centered.
- **Accessibility**: provide an accessible label (e.g. `aria-label`).
- **Example** (`IconOnly` story, rendered with a tooltip for labeling):

```html
<mai-button id="icon-only-button" icon-only aria-label="Calendar">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="fluent--calendar-20-regular"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4"
    />
  </svg>
</mai-button>
<mai-tooltip anchor="icon-only-button" positioning="above">Calendar</mai-tooltip>
```

### Primary appearance
- **Layout**: removes the neutral outline and applies brand background tokens (`backgroundCtrlBrandRest`) and `shadowCtrlBrandKey`. Border remains transparent across all states.
- **State colors**: hover and pressed backgrounds use the matching brand tokens; focus-visible re-adds a visible border using `foregroundCtrlOnBrandRest` for contrast.
- **Example** (`PrimaryAppearance` story):

```html
<mai-button appearance="primary">Primary</mai-button>
```

### On-image appearance
- **Layout**: intended for overlaying imagery; removes box-shadow and border, using `backgroundCtrlOnImage*` tokens for contrast on photographs. Focus-visible reveals a brand-colored border for discoverability.
- **Example** (`OnImageAppearance` story):

```html
<mai-button appearance="onimage">On Image</mai-button>
```

### Outline appearance
- **Layout**: clears the base border and shadow, replacing them with an absolutely positioned outline pseudo-element. Background stays semi-transparent, enabling the surrounding canvas to show through.
- **State behavior**: hover and pressed states adjust both the fill color and the pseudo-element border width/color; tokens `strokeWidthCtrlOutline*` ensure the outline thickness tracks the interaction state.
- **Example** (`OutlineAppearance` story):

```html
<mai-button appearance="outline">Outline</mai-button>
```

### Subtle appearance
- **Layout**: uses low-contrast background and border tokens; shadow is removed. Icon color bindings target `foregroundCtrlIconOnSubtle*` so slotted icons adopt the correct emphasis per state.
- **Example** (`SubtleAppearance` story):

```html
<mai-button appearance="subtle">Subtle</mai-button>
```

### Disabled and disabled-focusable states
- **Behavior**: both neutral and appearance-specific variants fall back to disabled tokens. The button forces `cursor: not-allowed` and blocks hover/active overrides.
- **Appearance-specific details**:
  - Primary/onimage maintain transparent borders and reduce contrast via `foregroundCtrlOnBrandDisabled` tokens.
  - Outline/subtle apply disabled border and icon colors (`strokeCtrlOnOutlineDisabled`, `foregroundCtrlIconOnSubtleDisabled`).
- **Examples** (`Disabled`, `DisabledFocusable` stories):

```html
<mai-button disabled>Disabled</mai-button>
<mai-button disabled-focusable>Disabled (Focusable)</mai-button>
```

### Slot-driven icon layouts
- **Start slot**: leading content receives the shared icon sizing rules and participates in the host gap spacing. Trailing content (`slot="end"`) is available but currently not exposed in Storybook.
- **Example** (`SlottedStartIcon` story):

```html
<mai-button>
  <span slot="start">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="fluent--calendar-20-regular"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4"
      />
    </svg>
  </span>
  Start Icon
</mai-button>
```

### Long text wrapping
- **Layout rule**: the host allows wrapping (`text-align: center; white-space: normal`). When constrained, content wraps within the host width while retaining padding. Use a parent container to control max-width.
- **Example** (`LongText` story):

```html
<div style="max-width: 280px">
  <mai-button>
    This story's canvas has a max-width of 280px, applied with a Story Decorator. Long text wraps after it hits the max width of the component.
  </mai-button>
</div>
```

### Forced-colors support
- **Behavior**: forced color mode swaps backgrounds to `ButtonFace` and text to `ButtonText`, ensuring high contrast. Primary appearance opts into `forced-color-adjust: none` so the brand fill remains highlighted. Focus and disabled states map to system colors like `Highlight` and `GrayText`.

## Development Notes

- The host sets `corner-shape: squircle`; browsers that support this feature increase the corner radius via `--_squircle-modifier`.
- Motion tokens collapse to near-zero duration under `prefers-reduced-motion: reduce`.
- Always pair `icon-only` usage with an external tooltip or `aria-label` to preserve accessible names.
- Use `disabled-focusable` when the button should be keyboard focusable but non-interactive (e.g., in menus where layout must remain stable).
