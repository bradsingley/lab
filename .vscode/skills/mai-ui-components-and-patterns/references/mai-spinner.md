# Spinner Style Guidelines

This document summarizes the configuration surface, visual states, and implementation details for the `mai-spinner` component.

## Component Definition
- **Tag name:** `mai-spinner` (via `ComponentDesignSystem.prefix`).
- **Appearance:** Single MAI-branded treatment; the component does not expose an `appearance` attribute override.
- **Base class:** Extends `@fluentui/web-components` `BaseSpinner`, inheriting lightweight range-style animation hooks and custom state handling.

## Configurable API

### Attributes and Properties
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `"tiny" \| "extra-small" \| "small" \| "medium" \| "large" \| "extra-large" \| "huge" \| undefined` | `undefined` (medium metrics) | Sets the spinner diameter and stroke width. Enumerated by `SpinnerSize`. Updates internal custom states through `swapStates` for SSR parity. |
| `slot` | string | `undefined` | Use when placing the spinner inside other components (e.g., `slot="indicator"`). This control does not define named slots of its own. |

> Other base-element attributes (`hidden`, `aria-*`, `lang`, etc.) are inherited without MAI overrides.

### Slots
- The template owns its markup; there are **no** component-defined slots.
- When composing inside host components, assign the desired external slot (for example, `slot="loading-indicator"`) on the `mai-spinner` itself.

### Events
- No custom events are emitted. Consumers rely on visibility toggles or host component state changes rather than spinner-specific events.

## Layout and Style Rules
The layout is governed by `packages/core/spinner/src/spinner.styles.ts`. The table below maps key selectors and tokens to their responsibilities.

| Selector / State | Layout & Resizing Rules | Visual Tokens / Notes |
| --- | --- | --- |
| `:host` | `display: inline-flex`. Width/height set by `--_size` (default `32px`). Uses `contain: strict` and `content-visibility: auto` to minimize layout cost when hidden. | Stroke thickness defaults to `--_indicatorSize = ctrlSpinnerStrokeWidth`. Easing (`--_curveEasyEase`) and duration (`--_duration = 1.5s`) ensure smooth rotation. |
| `:host([size="tiny"])` | Shrinks diameter to `20px`. | Stroke uses `ctrlProgressSmHeightFilled` for thin lines. |
| `:host([size="extra-small"])` | Sets size to `24px`. | Shares small stroke token. |
| `:host([size="small"])` | Sets size to `28px`. | Shares small stroke token. |
| `:host([size="large"])` | Expands to `36px`. | Stroke reverts to `ctrlSpinnerStrokeWidth`. |
| `:host([size="extra-large"])` | Expands to `40px`. | Stroke remains `ctrlSpinnerStrokeWidth`. |
| `:host([size="huge"])` | Expands to `44px`. | Stroke grows via `ctrlProgressLgHeightFilled`. |
| `.background` | Full-size circle providing the optional empty track. | Border color `ctrlProgressBackgroundEmpty`; visibility toggled through `ctrlSpinnerShowEmptyTrack`. |
| `.progress` | Absolute container for the continuous rotation. | Runs `spin-linear` animation with constant velocity. |
| `.spinner` | Houses the animated halves. | Uses `spin-swing` to ease between positions. |
| `.start`, `.end` | Clip each half of the indicator circle. | Overflow hidden with 50% split to create trailing/leading arcs. |
| `.indicator` | Defines the visible arc stroke. | `border-block-start-color` and `border-right-color` pull from `ctrlProgressBackgroundFilled`; other borders stay transparent to create the wedge. |
| `.start .indicator` | Positions initial arc to the left segment. | Adds `rotate: 135deg`, inset offset, and `spin-start` animation for acceleration. |
| `.end .indicator` | Positions trailing arc to the right segment. | Mirrors `.start` with `spin-end` animation. |
| `@media (forced-colors: active)` | Removes empty track and swaps colors to system palette. | Uses `Canvas` for base border, `Highlight` for active stroke to ensure contrast. |

## Example Usage
All samples originate from `packages/core/spinner/src/spinner.stories.ts` (commented variants indicate future size stories and match the `SpinnerSize` enum).

### Default Spinner
```html
<mai-spinner></mai-spinner>
```

### Explicit Size Example
```html
<mai-spinner size="large"></mai-spinner>
```

> To switch between available sizes, set the `size` attribute to any value from `SpinnerSize` (e.g., `"tiny"`, `"extra-small"`, `"huge"`). The component updates custom states so SSR and forced-color styles resolve correctly.
