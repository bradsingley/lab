# Avatar Style Guidelines

## Overview
- `<mai-avatar>` renders a 32px square portrait placeholder with MAI design tokens for typography, color, and elevation.
- Extends the Fluent BaseAvatar; use `@mai-ui/core/avatar` definition registration before instantiating the element.
- Supports auto-generated initials derived from `name` or supplied via `initials`, with optional visual content provided through slots.

## Configuration Surface
**Tag name**
- `mai-avatar`

**Attributes & fields**
- `name` (`string`): Source text for monogram generation; provide whenever user-identifying data is available.
- `initials` (`string`): Overrides generated initials; when empty the component falls back to `name` or the default icon.
- `active` (`string`): Pass-through to Fluent avatar state styling (e.g., `active`, `inactive`); defaults to the upstream base behavior when omitted. No MAI-specific appearance variants are defined yet.
- `slottedContent` / `badgeSlottedContent` (`Storybook only`): Helper controls for Storybook stories representing the default slot and `badge` slot.

**Slots**
- `(default)`: Primary visual content such as an `<img>` or `<svg>`. Empty text nodes are stripped to avoid accidental spacing.
- `badge`: Positioned overlay badge for presence/status indicators; provide compact content sized for the avatar corner.

## Styling & Layout Rules
**Host element**
- `display: inline-grid` via the FAST `display` helper, creating a single-cell grid for stacking monogram, default icon, and slotted media.
- Fixed size `32px x 32px`, centered content (`place-items`, `place-content`), and `border-radius` from `ctrlAvatarCornerItem` token. Background, foreground, font metrics, and key shadow draw from MAI design tokens.
- `contain: layout style` scopes layout and style calculations to the host for performance.

**Monogram (`.monogram`)**
- Shares grid area with icon/media, enabling layered fallback.
- Hidden when empty (`:empty { display: none; }`) to prevent occupying space without content.
- Text content updates when `name` or `initials` changes.

**Default icon (`.default-icon`)**
- Provides the fallback silhouette SVG. Hidden automatically when custom media is present: either when the default slot has slotted content (`.default-slot.has-slotted`), an explicit `name`, or `initials` attribute.
- Sized to `20px` for visual balance within the 32px host.

**Default slot (`.default-slot`)**
- Occupies the same grid area as monogram and icon. When the browser lacks `:has-slotted` support, the component toggles a `has-slotted` class to maintain fallback behavior.

**`::slotted(svg)` content**
- Constrained to `20px` square, matching default icon dimensions for consistent presentation of vector artwork.

**`::slotted(img)` content**
- Stretches to fill the host (`width` and `height` 100%). Rounded corners mirror host radius, ensuring imagery conforms to avatar shape.

**Badge slot (`::slotted([slot="badge"])`)**
- Absolutely positioned to the lower-right corner with an outline stroke sized by `ctrlAvatarPresenceBadgeStrokeWidth`, allowing badges to remain legible atop the avatar edge.

## Usage Examples
The following snippets correspond to Storybook stories in `packages/core/avatar/src/avatar.stories.ts`.

**Default**
```html
<mai-avatar name="Casey Finn"></mai-avatar>
```

**SingleInitial**
```html
<mai-avatar initials="C"></mai-avatar>
```

**Initials**
```html
<mai-avatar initials="CF"></mai-avatar>
```

**SlottedImage**
```html
<mai-avatar>
    <img
        alt="Persona test"
        role="presentation"
        aria-hidden="true"
        src="https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/KatriAthokas.jpg"
    />
</mai-avatar>
```

**SlottedIcon**
```html
<mai-avatar>
    <svg
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fill="currentColor"
            d="M10 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.5 4.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zm8-.5a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0zm-10 0a1 1 0 112 0 1 1 0 01-2 0zm1-2a2 2 0 100 4 2 2 0 000-4zm.6 12H5a2 2 0 01-2-2V9.25c0-.14.11-.25.25-.25h1.76c.04-.37.17-.7.37-1H3.25C2.56 8 2 8.56 2 9.25V13a3 3 0 003.4 2.97 4.96 4.96 0 01-.3-.97zm9.5.97A3 3 0 0018 13V9.25C18 8.56 17.44 8 16.75 8h-2.13c.2.3.33.63.37 1h1.76c.14 0 .25.11.25.25V13a2 2 0 01-2.1 2c-.07.34-.17.66-.3.97zM7.25 8C6.56 8 6 8.56 6 9.25V14a4 4 0 008 0V9.25C14 8.56 13.44 8 12.75 8h-5.5zM7 9.25c0-.14.11-.25.25-.25h5.5c.14 0 .25.11.25.25V14a3 3 0 11-6 0V9.25z"
        ></path>
    </svg>
</mai-avatar>
```

## Implementation Notes
- Register the definition from `packages/core/avatar/src/define.ts` or call `definition.define()` before use in custom apps.
- The component relies on MAI design tokens; ensure the design system is initialized (`ComponentDesignSystem.provide()`) in the host application so token values resolve correctly.
- For presence indicators, slot a status element into the `badge` slot. MAI badge integration is planned; see the TODO in Storybook for future guidance.

## Testing Checklist
- Cover both CSR and SSR render paths when validating avatar usage with the Playwright harness (`fastPage.setTemplate()`).
- When supplying custom media, verify fallback monogram and icon remain hidden across browsers lacking `:has-slotted` support.
- Confirm badge content remains legible against varied backgrounds by using the provided outline stroke tokens.
