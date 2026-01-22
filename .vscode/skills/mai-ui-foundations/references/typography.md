# Typography and Fonts

| Asset | Location | Purpose |
|-------|----------|---------|
| Segoe Sans (`fonts/segoe-sans.woff2`) | `skills/mai-theme-copilot/fonts/` | Default UI + body text |
| Cascadia Code (`fonts/CascadiaCode.woff2`) | `skills/mai-theme-copilot/fonts/` | Code snippets, log streams |
| Ginto Copilot (`fonts/Ginto Copilot*.woff2`) | `skills/mai-theme-copilot/fonts/` | AI/Copilot-specific branding moments |

## Usage notes
- Declare `@font-face` rules within the experience you are building; do not rely on system fonts if MAI typography is required.
- Use semantic typography tokens such as `--font-body-1` or `--font-title-2` to set `font-family`, size, line-height, and weight cohesively.
- Maintain readable line lengths (~45–75 characters) for body copy and align headings with the grid.
- Match font rendering to the platform: enable font-smoothing rules where appropriate but avoid forcing heavy anti-aliasing that conflicts with host apps.

### Typeface guidance
- **Segoe Sans**: Microsoft’s core UI typeface. Use `smtc-text-style-default-regular-font-family` and rely on Segoe for legibility at small or display sizes.
- **Ginto Copilot Variable**: Expressive moments in Copilot experiences. Use `smtc-text-style-ai-regular-font-family` and `smtc-text-style-ai-header-font-family` tokens.
- **Cascadia Code**: For code snippets/logs, paired with `smtc-text-style-code-regular-font-family` tokens.

### Styling text
- Reserve centered text for short copy or supporting elements; keep most copy left-aligned for readability.
- Use baseline alignment when combining multiple font sizes to maintain rhythm.
- Stick to sentence case in UI text; avoid all caps for emphasis.
- Keep line lengths between 50–60 characters where possible.
- Ensure standard text contrast ≥ 4.5:1 and large text ≥ 3:1.
