---
name: mai-ui-iconography-and-assets
description: Source Fluent icons, manage imagery placeholders, and keep MAI UI asset usage compliant.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Load this skill whenever a design requires icons, logos, or imagery decisions.

## Icon rules
- Only use `@fluentui/svg-icons` assets.
- Icons must remain monochrome and inherit semantic color tokens.
- Size icons using 4px increments (16, 20, 24, 28, 32, 48px max).

### Extraction steps
1. Install the icons package if it is not already present: `npm install @fluentui/svg-icons`.
2. Run the helper script to print the `d` attribute (no manual copy/paste required):
  ```bash
  node ./skills/mai-ui-iconography-and-assets/scripts/get-fluent-icon-path.mjs --icon heart --size 20 --variant regular
  ```
3. Inline the returned path data inside MAI components that accept SVG slots or use the icon component if one exists.

```bash
cat node_modules/@fluentui/svg-icons/icons/heart_20_regular.svg
```

### Do / Don’t
- ✅ Reference icons via semantic tokens (e.g., `color: var(--colorIconPrimary)`)
- ✅ Keep stroke widths untouched
- ❌ Use emojis or hand-drawn paths
- ❌ Alter geometry to fake new icons

### Exceptions
- Official brand logos are allowed when brand recognition is essential; store them in your repo’s `assets/` directory and document licensing constraints.

## Imagery guidance
- When the brief requires imagery but none is provided, use `https://picsum.photos/<width>/<height>` with a stable seed query to keep previews deterministic.
- Maintain consistent aspect ratios across responsive breakpoints.
- Supply descriptive `alt` text communicating intent.
 - Use the placeholder generator to keep size/seed metadata consistent across docs and PRs:
   ```bash
   node ./skills/mai-ui-iconography-and-assets/scripts/seeded-placeholder.mjs --width 960 --height 540 --seed marketing-hero --intent "marketing dashboard"
   ```
   The script returns a JSON blob containing the Picsum URL and recommended alt text.

## Asset organization
- Check assets into version control under `assets/` or `public/` (depending on framework conventions).
- Keep an index file (e.g., `assets/README.md`) listing sources, usage rights, and last refresh date.
- Reference fonts from `skills/mai-theme-copilot/fonts/` (or the active theme’s font bundle) when typography assets are requested; reuse rather than duplicating binaries.

## Script reference
- `scripts/get-fluent-icon-path.mjs`: extracts the official FluentUI SVG path for a given icon/size/variant.
- `scripts/seeded-placeholder.mjs`: produces deterministic Picsum URLs plus descriptive `alt` text, ensuring placeholder imagery remains consistent across iterations.

## Related skills
- `mai-ui-foundations` to align typography + tokens before assigning icon colors
- `mai-ui-components-and-patterns` for selecting the component slots that host these icons or images
