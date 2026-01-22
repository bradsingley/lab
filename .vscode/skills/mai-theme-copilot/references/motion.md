# Motion System

Motion should feel simple, direct, and calm. Use it to reinforce hierarchy and provide feedback without clutter.

## Easing curves
- `Entrance_01 (0.00, 0.00, 0.00, 1.00)`: default entrance translation/scaling.
- `Exit_01 (0.60, 0.00, 0.75, 0.40)`: exit scaling/translation.
- `Persistent_01 (0.33, 0.00, 0.00, 1.00)`: on-screen translation/scaling.
- `Elastic_01 (0.20, 1.50, 0.40, 1.00)`: dropdown/pop-up menus, Copilot composer entrance.
- `Linear (0.00, 0.00, 1.00, 1.00)`: opacity and tonal shifts.

## Duration ramp
- `50ms (duration-micro-01)`: Instant feedback such as click states.
- `100ms (duration-short-01)`: Underline animations, lightweight accents.
- `200ms (duration-short-02)`: Default fades, tooltip/popover transitions.
- `300ms (duration-medium-01)`: Card scale, zoom, transforms.
- `400ms (duration-medium-02)`: Standard entrances with easing.
- `1000ms (duration-mega-01)`: Passive loops (loading indicators, carousels) and ambient animations.

Align duration to behavioral intent—not platform—so rhythms stay consistent yet purposeful.

| Behavior | Example Motion | Recommended Token | Rationale |
|----------|----------------|-------------------|-----------|
| Interaction Feedback | Tap, hover, button press | duration-micro-01 | Feels instant and responsive. |
| Visual Accents | Hover color, underline grow | duration-short-01 | Noticeable but not disruptive. |
| Accessibility Adjustments | Reduced-motion fallbacks | duration-short-01 | Keeps transitions gentle for sensitive users. |
| UI Element Transitions | Tooltip, toast, dropdown | duration-short-02 | Fast yet readable entrance/exit. |
| Scaling & Transform | Card scale, rotate icon | duration-short-02 | Gives time to perceive shape change. |
| Success / Error States | Checkmark draw, error shake | duration-medium-02 | Allows delightful emphasis without lag. |
| Navigation / Page Swap | Tab switch, page change | duration-medium-02 | Provides context between destinations. |
| Modal / Drawer | Slide-in panels, modals | duration-medium-02 | Users need more time to orient. |
| Position Shift | Drag/drop, grid change | duration-medium-02 | Helps track movement across space. |
| Loading Indicators | Progress bar, spinner | duration-mega-01 | Slow, subtle loops avoid fatigue. |
| Auto-Play / Carousels | Background slideshows | duration-mega-01 | Maintains calm, ambient pacing. |
