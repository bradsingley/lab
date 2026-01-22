# Design Language

## Static colors
Static colors do not change between light and dark modes. Use theme colors when you need automatic mode-aware values.

- `Neutral`: grayscale including pure black/white/transparent.
- `Stone`: soft desaturated minerals for warm backgrounds and separators.
- `Cocoa`: rich browns for elevated surfaces, inert states, branded neutrals.
- `Caramel`: warm amber for emphasis when Neutral feels too cool.
- `Slate`: cool blue-gray framing/divider tones.
- `Midnight`: deep blues for high-contrast dark UI foundations.
- `Pink`: expressive friendly emphasis for onboarding or playful accents.
- `Red`: error/destructive alerts with balanced tint progression.

Indices (100–900) are identifiers, not usage hierarchies. Slots 100–450 skew light mode, 550–900 skew dark, but cross-mode use is acceptable.

## Theme colors
Theme collections adapt between light and dark modes while keeping token names stable.

- `Accent`: reinforce brand, highlight focus states and key actions.
- `Background`: base layers for surfaces, containers, cards.
- `Foreground`: text/icon colors that stay legible across modes.
- `Stroke`: borders, dividers, separators.
- `Overlay`: semi-transparent layers (white in light mode, black in dark mode) for scrims and translucency.

## Elevation ramp
Use elevation to communicate hierarchy through light and shadow:

- `XS`: cards, thumbnails, icon wrappers
- `Sm`: low-elevation buttons, panels
- `Md`: raised cards and panels
- `Lg`: toasts, dropdowns, flyouts, popovers
- `XL`: composers, modals, toolbars

## Layering
Layering overlaps surfaces to clarify structure. Combine consistent layering with elevation to signal ordering between page surfaces, cards, and transient UI.

## Iconography
Icons should stay recognizable, functional, and aligned to MAI’s personality. Favor monochrome semantics, use Fluent assets, and maintain consistent sizing multiples (4px increments).

## Material treatments
- **Inner shine**: white inner stroke/shadow to define rounded edges, enhance legibility, and add friendly materiality.
- **Blur**: 60px background filter for acrylic surfaces/overlays to create hierarchy and soften busy backdrops.
- **Acrylic**: semi-transparent, frosted treatment for side panels, dialogs, and immersive surfaces.
