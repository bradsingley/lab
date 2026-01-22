# Shape, Size, and Spacing

## Corner radius & smoothing
- Use generous radii to keep the UI warm and approachable.
- Corner smoothing produces continuous curves; ensure nested elements stay concentric.
- Formula: `inner radius = outer radius - padding`. Don’t let inner radii exceed outer radii.

## Corner ramp
- Base unit = 4px. All corner tokens are multiples of 4.
- Naming pattern: `[number] base` (e.g., `Static/Corner/Rounded/0-5 base` = 0.5 × 4px = 2px).

## Size ramp
- Same 4px base unit applies to widths/heights.
- Tokens map to `Static/Size/<n> base` (e.g., `Static/Size/10 base` = 40px).

## Spacing principles
- Spacing governs both padding inside components and margins between layout sections.
- Tighter spacing groups related elements; generous spacing separates distinct content.
- Use whitespace to provide visual rest and improve scanability.
- Keep spacing consistent around headings—larger whitespace for core titles, tighter for subordinate headings.

## Spacing ramp
- Base unit = 4px. Tokens follow `[number] base` (e.g., `Static/Spacing/4 base` = 16px).
- Use spacing tokens to reinforce rhythm; avoid arbitrary pixel values.
