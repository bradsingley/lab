# Progress Bar Style Guidelines

## Overview
The `mai-progress-bar` component renders a single horizontal indicator that communicates task completion or system status. It defaults to inline sizing (`display: inline-flex`) with a full-width track (`width: 100%`) so it can stretch to the container while preserving a consistent height defined by design tokens. The base component exposes no visual slots; it consists of the host element (the track) and an internal `.indicator` part that FAST renders.

## Anatomy and Slots
- **Host (`<mai-progress-bar>`)** – wraps the entire control, owns sizing, border radius, and background track drawing.
- **Indicator part (`.indicator`)** – internal FAST part that fills the track to represent progress. This part is not currently exposed as a named slot or part override.
- **Slots** – none available; content projection is not supported.

## Configurable Surface
Use HTML attributes to configure the control during template authoring. FAST automatically mirrors the attributes to reactive properties.

| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `min` | number | `0` | Lower bound for determinate progress calculations. Values must remain below `max`.
| `max` | number | `100` | Upper bound for determinate progress calculations.
| `value` | number \| undefined | undefined | When provided, renders a determinate indicator width. When omitted, the indicator switches to the indeterminate animation.
| `thickness` | `small` \| `medium` \| `large` | `medium` | Toggles height tokens for the track and indicator (`ctrlProgress*Height*`).
| `validation-state` | `success` \| `warning` \| `error` | none | Optional; applies semantic color overrides via `status*Background` tokens.

## Style Behavior
The styles in `packages/core/progress-bar/src/progress-bar.styles.ts` define several visual sets. Each set below explains layout, visibility, and responsive behavior.

### Base Track (Medium Thickness)
- Host uses `contain: content`, `overflow-x: hidden`, and `align-items: center` to maintain a trimmed track with rounded ends (`border-radius: ctrlProgressCorner`).
- The pseudo-element `:host::before` draws the empty track background using `ctrlProgressBackgroundEmpty` and the default height tokens.
- Corner radius subtly increases when the browser supports `corner-shape: squircle` by adjusting `--_squircle-modifier`.
- The indicator inherits the host radius and is layered above the pseudo-element (`z-index: 1`).

```html
<mai-progress-bar thickness="medium"></mai-progress-bar>
```

### Determinate Progress (`value` present)
- When `value` is set, the indicator animates width changes with a 0.2s easing transition.
- In browsers that support `attr()` for numeric values, CSS custom properties compute `--indicator-width` directly from the element’s attributes, keeping layout purely declarative.
- Indicator height stays aligned with `ctrlProgressHeightFilled` (or the size-specific variant).

```html
<mai-progress-bar thickness="medium" value="15"></mai-progress-bar>
```

### Custom Range (`min`/`max`)
- Determinate width calculations honor both `min` and `max`; percentages clamp between 0–100 to preserve visibility.
- Ensure `value` remains within the inclusive `[min, max]` range to avoid jumps when the computed percentage is clamped.

```html
<mai-progress-bar thickness="medium" min="3" max="9" value="5"></mai-progress-bar>
```

### Indeterminate Progress (`value` omitted)
- Without `value`, the indicator switches to a striped gradient sized to 33% of the track and animates across the host.
- The `indeterminate` keyframe cycles across the track every 3 seconds; browsers honoring `prefers-reduced-motion` reduce the animation to a single frame to avoid motion sensitivity issues.
- Keep the component visible by ensuring container overflow is not hidden in the inline axis, otherwise parts of the animation may be clipped.

```html
<mai-progress-bar thickness="medium"></mai-progress-bar>
```

### Thickness Variants
All thickness variants maintain the same visual proportions by pairing empty-track and filled-indicator tokens.

**Small (`thickness="small"`)**
- Track height drops to `ctrlProgressSmHeightEmpty`; indicator to `ctrlProgressSmHeightFilled`.
- Use for compact layouts or table rows where vertical space is limited.

```html
<mai-progress-bar thickness="small"></mai-progress-bar>
```

**Large (`thickness="large"`)**
- Track height increases via `ctrlProgressLgHeightEmpty`; indicator uses `ctrlProgressLgHeightFilled`.
- Works best in hero layouts or when accompanying typography with larger line heights.

```html
<mai-progress-bar thickness="large"></mai-progress-bar>
```

### Validation States
- Setting `validation-state="error"`, `warning`, or `success` switches the indicator color to the appropriate semantic background token (`statusDangerBackground`, `statusWarningBackground`, `statusSuccessBackground`).
- The empty track color remains unchanged to preserve contrast.
- No Storybook examples ship today; add visual regression coverage before exposing new stories.

### Forced-Colors and Accessibility
- In forced-colors mode, both the track and indicator switch to system colors (`CanvasText` and `Highlight`) to respect high-contrast requirements.
- `prefers-reduced-motion` is honored by disabling the indeterminate animation and host transitions.
- The component exposes native progress semantics, so include `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` only when dynamically reflecting progress via scripting.

## Token Reference
Key design tokens used by the control:
- `ctrlProgressBackgroundEmpty` / `ctrlProgressBackgroundFilled`
- `ctrlProgressHeightEmpty`, `ctrlProgressHeightFilled`
- `ctrlProgressSmHeightEmpty`, `ctrlProgressSmHeightFilled`
- `ctrlProgressLgHeightEmpty`, `ctrlProgressLgHeightFilled`
- `ctrlProgressCorner`
- `statusDangerBackground`, `statusWarningBackground`, `statusSuccessBackground`

These tokens should not be overridden per instance; prefer updating the design token values at the theme level to keep the component aligned with the MAI Design System.
