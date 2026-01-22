# Anchor Button Style Guide

The `mai-anchor-button` component extends the MAI button pattern for anchor navigation. It preserves the semantics of `<a>` while adopting MAI control tokens for consistent sizing, spacing, and states.

## Usage Quick Start

```html
<mai-anchor-button href="https://www.microsoft.com/">Anchor Button</mai-anchor-button>
```

## Configurable Attributes

| Attribute | Type | Default | Notes |
|-----------|------|---------|-------|
| `appearance` | `neutral` \| `onimage` \| `outline` \| `primary` \| `subtle` | `neutral` | Maps to style variants described below. Updates host custom state. |
| `size` | `small` \| `medium` \| `large` | `medium` | Adjusts control height, typography, and icon size. |
| `icon-only` | boolean | `false` | Removes interior padding, fixes width to control height, and expects an `aria-label`. |
| `href`, `download`, `hreflang`, `ping`, `referrerpolicy`, `rel`, `target`, `type` | string | — | Standard anchor attributes forwarded to the internal anchor. |
| `aria-label` | string | — | Required when `icon-only` is true. |

## Slots

| Slot | Purpose | Layout Notes |
|------|---------|--------------|
| `(default)` | Primary text or icon content. | Wrapped in `.content` with centered grid layout and padding derived from control tokens. |
| `start` | Leading icon or adornment. | Stays visible, no shrink; respects icon sizing tokens. |
| `end` | Trailing icon or adornment. | Present in template but currently hidden in Storybook; layout matches `start`. |

An `<a>` element slotted anywhere is absolutely positioned to fill the host, ensuring full hit target coverage.

## Style Variants

All variants inherit neutral base rules: inline-flex host, centered alignment, token-driven padding, `cursor: pointer`, and focus outline composed of `ctrlFocusInnerStroke` and `ctrlFocusOuterStroke` tokens. Hover and active states adjust background, color, and squircle radius; reduced motion users see instantaneous transitions.

### Neutral (default)
- Background `backgroundCtrlNeutralRest`, text `foregroundCtrlNeutralPrimaryRest`, 1px border `strokeCtrlOnNeutralRest`.
- Hover and pressed states raise using neutral hover/pressed tokens and progressively tighter corners.

```html
<mai-anchor-button href="https://www.microsoft.com/">Anchor Button</mai-anchor-button>
```

### Primary
- Brand background, white foreground, transparent border by default; hover/pressed use brand tokens.
- Focus-visible sets border color to `foregroundCtrlOnBrandRest` to maintain contrast.

```html
<mai-anchor-button appearance="primary" href="https://www.microsoft.com/">Primary</mai-anchor-button>
```

### On-image
- Transparent box shadow, uses on-image background ramp and on-image foreground for contrast against imagery.
- Hover/active maintain icon/text color while darkening backdrop.

```html
<mai-anchor-button appearance="onimage" href="https://www.microsoft.com/">On Image</mai-anchor-button>
```

### Outline
- Neutral surface with no background fill; faux border rendered via `::after` overlay using outline stroke tokens.
- Hover/active swap overlay stroke weight and neutral background tokens.

```html
<mai-anchor-button appearance="outline" href="https://www.microsoft.com/">Outline</mai-anchor-button>
```

### Subtle
- Low-emphasis background and stroke using subtle tokens. Icon color shifts between rest, hover, and pressed states.
- Disabled state desaturates background, stroke, and icon via subtle disabled tokens.

```html
<mai-anchor-button appearance="subtle" href="https://www.microsoft.com/">Subtle</mai-anchor-button>
```

### Disabled States
Any variant with `disabled` or `disabled-focusable` falls back to neutral disabled background/foreground unless overridden above (primary, outline, subtle, onimage). Cursor is forced to `not-allowed`, and focus outline is suppressed.

### Forced Colors
When high-contrast mode is active, borders and foregrounds map to `LinkText`, `Highlight`, `ButtonFace`, and `ButtonText`. Primary variant locks to `Highlight` fill with `forced-color-adjust: none` to maintain brand contrast.

## Sizing Rules

| Size | Control Height | Horizontal Padding | Typography | Icon Size |
|------|----------------|--------------------|------------|-----------|
| `small` | `sizeCtrlSmDefault` | `paddingCtrlSmHorizontalDefault` (or icon-only token) | `textRampSmItemBody` font/line-height | `sizeCtrlSmIcon` |
| `medium` | `sizeCtrlDefault` | `paddingCtrlHorizontalDefault` | `textRampItemBody` font/line-height | `sizeCtrlIcon` |
| `large` | `sizeCtrlLgDefault` | `paddingCtrlLgHorizontalDefault` | `textRampLgItemBody` font/line-height | `sizeCtrlLgIcon` |

Padding inside `.content` adjusts per size via dedicated top/bottom tokens, ensuring baseline alignment with sibling controls.

#### Examples
```html
<mai-anchor-button size="small" href="https://www.microsoft.com/">Small</mai-anchor-button>

<mai-anchor-button size="medium" href="https://www.microsoft.com/">Medium</mai-anchor-button>

<mai-anchor-button size="large" href="https://www.microsoft.com/">Large</mai-anchor-button>
```

## Icon-only Mode

Setting `icon-only` removes internal padding and sets the host width equal to its height token (`sizeCtrlSmDefault`, etc.). Provide meaningful `aria-label` and optionally pair with a tooltip for discoverability.

```html
<mai-anchor-button
    id="icon-only"
    icon-only
    aria-label="Calendar"
    href="https://www.microsoft.com/"
>
    <svg><!-- calendar icon --></svg>
</mai-anchor-button>
<mai-tooltip anchor="icon-only" positioning="above">Calendar</mai-tooltip>
```

## Icon Slots

`start` and `end` slots maintain fixed icon sizing and never shrink, ensuring icons stay legible alongside text. Default and subtle appearances tint icons using variant-specific tokens; hover/pressed states cascade through the slot.

```html
<mai-anchor-button href="https://www.microsoft.com/">
    <span slot="start"><svg><!-- calendar icon --></svg></span>
    Start Icon
</mai-anchor-button>
```

## Content Handling

- `.content` wraps the default slot and uses `display: grid` with `place-content: center`, ensuring equal top/bottom padding and consistent text alignment.
- `icon-only` stories remove `.content` padding entirely, so supply appropriately sized graphics.
- Long strings wrap naturally; constrain width with a parent container when needed, as shown in Storybook.

```html
<div style="max-width: 280px">
    <mai-anchor-button href="https://www.microsoft.com/">
        This story's canvas has a max-width of 280px, applied with a Story Decorator. Long text wraps after it hits the max width of the component.
    </mai-anchor-button>
</div>
```

## Accessibility Notes

- Always set `href`; if navigation is not possible, use `mai-button` instead.
- Supply `aria-label` for icon-only configurations and when slot content does not express intent.
- Focus styles rely on dual-ring tokens and remain visible across variants.
- Reduced-motion users receive near-instant state transitions due to `prefers-reduced-motion` handling.
