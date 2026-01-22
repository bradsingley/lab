# Slider Style Guidelines

This document summarizes the configurable surface, visual states, and usage patterns for the `mai-slider` component.

## Component Definition
- **Tag name:** `mai-slider` (derived from `ComponentDesignSystem.prefix`).
- **Appearance:** Single MAI-branded treatment driven by design tokens; no `appearance` attribute.
- **Base class:** Extends `@fluentui/web-components` `FluentSlider`, inheriting form-associated range behavior and RTL awareness.

## Configurable API

### Attributes and Properties
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | boolean | `false` | Disables pointer, keyboard, and form interaction while applying the disabled rail/thumb treatment. |
| `min` | number | `0` (Fluent default) | Lower bound for the slider value. Must be less than `max`. |
| `max` | number | `100` (Fluent default) | Upper bound for the slider value. Must exceed `min`. |
| `value` | number | midpoint between `min`/`max` | Current slider value. Emits change/input events when mutated. |
| `step` | number | `1` | Increment enforced when adjusting the value. Adds tick marks when provided. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Lays out the control horizontally or vertically. Exported as `SliderOrientation`. |
| `size` | `"small"` \| undefined | `undefined` | Applies the compact thumb/track metrics when set to `small`. Values available via `SliderSize`. |
| `slot` | string | `undefined` | Most often `"input"` when consumed inside `mai-field`. |

> Additional range-related members such as `name`, `required`, `readOnly`, and form validation helpers are inherited from the Fluent slider without MAI overrides.

### Slots
- **default slot:** Not supported. The template owns the rail and thumb.
- **`slot="input"`:** Use when embedding inside `mai-field` so the field can manage labels, messages, and validation outline.

### Events and Form Behavior
- Dispatches native `input` and `change` events whenever `value` changes. These events bubble and are cancelable according to the HTML range control contract.
- Participates in form submission via an internal `<input type="range">`; the submitted value reflects the slider `value`.
- Respects `form`, `name`, and constraint validation APIs from the base class (`checkValidity()`, `reportValidity()`, etc.).

## Layout and State Rules
The component’s layout is driven by `packages/core/slider/src/slider.styles.ts`. Key selector groups and their effect are summarized below.

| Selector / State | Layout & Resizing Rules | Visual Tokens / Notes |
| --- | --- | --- |
| `:host` | Uses `display: inline-grid` with three rows/columns to center the thumb along the rail. Minimum footprint `120px × 32px`. Thumb size defaults to `ctrlSliderThumbSizeRest`; track height `ctrlSliderBarHeight`. Internal CSS vars (`--_thumb-size`, `--_track-size`, `--_track-margin-inline`) drive thumb/rail alignment. | Rail color `ctrlSliderBarForegroundFilledRest`; track color `ctrlSliderBarForegroundEmptyRest`. Rounded corners based on `ctrlSliderBarCorner`, modulated by squircle support. |
| `:host(:dir(rtl))` | Flips the gradient direction so progress grows right-to-left. | Updates `--_slider-direction` to `-90deg` for gradient math. |
| `:host([size="small"])` | Reduces thumb to `ctrlSliderSmThumbSizeRest`, track thickness to `2px`, and tightens overhang to keep the rail flush. | Border radius falls back to `--borderRadiusSmall` (when defined) or `ctrlSliderBarCorner`. |
| `:host([orientation="vertical"])` | Swaps grid layout to a vertical stack, sets minimum height to `120px`, and recenters thumb/rail. Rail width becomes `--_track-size`. | Direction for gradients set to `0deg`. Step marker inset adjusts so ticks render horizontally. |
| Hover / Active (`:host(:hover)`, `:host(:active)`) | Expands thumb via `--_thumb-size` transitions for a 0.2s ease when not pressed. | Rail color transitions through `ctrlSliderBarForegroundFilledHover` / `Pressed`. Thumb background and inner stroke swap to their hover/pressed tokens. |
| Disabled (`:host(:disabled)`) | Pointer cursor removed; rail and thumb revert to rest sizing. Track progress inset compensates so filled area remains aligned. | Rail/track colors dim via `ctrlSliderBarForegroundFilledDisabled` and `ctrlSliderBarForegroundEmptyDisabled`. Thumb uses disabled background and inner stroke tokens. |
| Focus visible (`:host(:not([slot="input"]):focus-visible)`) | Applies rounded focus outline sized by `cornerCtrlRest`. Only active when slider is not slotted into a field to avoid duplicated focus rings. | Inner outline `ctrlFocusInnerStroke`; outer outline `ctrlFocusOuterStroke`. |
| Step markers (`:host([step]) .track::after`) | Adds repeating tick marks spaced by `var(--step-rate)` with a 1px border inset defined by `--_step-marker-inset`. Vertical orientation moves the markers to the bottom edge. | Tick color `ctrlSliderThumbOuterStrokeRest`. |
| `.track::before` | Represents the filled rail length by stretching to `var(--slider-progress)`. Transitions disabled when active to follow pointer precisely. RTL reverses width calculation. | Filled portion uses `var(--_rail-color)` to match state transitions. |
| `.thumb` / `.thumb-container` | Absolutely positioned over the track. Container translates `-50%` (or `+50%` vertical) to center the thumb over the rail. | Thumb background, border, and inner stroke sourced from the various `ctrlSliderThumb*` tokens. |
| Forced colors (`@media (forced-colors: active)`) | Replaces rail/thumb colors with system `WindowText`, `ButtonText`, `Highlight` to ensure contrast compliance. | Keeps hover/active semantics while relying on system palette. |
| `@supports (corner-shape: squircle)` | In browsers supporting `corner-shape`, bumps a squircle modifier to 1.8 for softer corners. | No layout change; pure style enhancement. |

## Example Usage
All examples below are derived from `packages/core/slider/src/slider.stories.ts`.

### Default Slider
```html
<mai-slider></mai-slider>
```

### Slider Inside a Field
```html
<mai-field label-position="before">
  <label slot="label" for="slider-in-field">Slider</label>
  <mai-slider slot="input" id="slider-in-field"></mai-slider>
</mai-field>
```

### Vertical Orientation
```html
<mai-slider orientation="vertical"></mai-slider>
```

### Custom Min/Max Range
```html
<mai-slider min="0" max="100"></mai-slider>
```

### Slider with Step Markers
```html
<mai-slider step="10"></mai-slider>
```

### Disabled Slider
```html
<mai-slider disabled></mai-slider>
```

> To apply the compact style, set `size="small"` on any of the snippets above; this shrinks the thumb and track while preserving the interaction model.
