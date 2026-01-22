---
name: mai-theme-copilot
description: Load MAI/Copilot design-language guidance—colors, motion, voice, shapes, grids, and fonts—to theme MAI UI components.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Use this skill whenever the user specifies the MAI / Copilot theme (or any experience derived from it). It provides the design-language layer that sits atop the shared MAI UI component library.

## When to load
- User explicitly requests MAI or Copilot styling.
- You need color, motion, typography, or voice guidance unique to this theme.
- Before writing plans that depend on MAI/Copilot-specific grid or material specs.

## Reference map
- [Design guidance index](references/design-guidance.md)
  - [Design language](references/design-language.md)
  - [Shape, size, and spacing](references/shape-spacing.md)
  - [Motion system](references/motion.md)
  - [Voice and tone](references/voice-and-tone.md)
  - [Grid patterns](references/grid-patterns.md)
- Typography assets live in `fonts/` (Segoe Sans, Ginto Copilot, Cascadia Code). Reference [mai-ui-foundations/references/typography.md](../mai-ui-foundations/references/typography.md) for usage.

## Workflow
1. Confirm MAI/Copilot is the active theme (if not, load the appropriate theme skill).
2. Use the token switchboard below (or `mai-ui-foundations/references/tokens.md`) to pick the correct semantic stylesheet before composing UI.
3. Open only the additional reference you need (colors, motion, etc.) to preserve LLM context.
4. Apply tokens and copy tone from this theme while composing with the shared MAI UI components.
5. Document which theme references you consulted in your plan/PR so others know which theme was applied.

## Token switchboard
Run the shared helper to print the exact CSS/JSON paths for the current theme:

```bash
node ./skills/mai-ui-foundations/scripts/token-link.mjs --list
node ./skills/mai-ui-foundations/scripts/token-link.mjs --theme default --mode dark --format both
```

Scenarios:
- **Default surfaces** (Copilot baseline) → `--theme default --mode light|dark`
- **Compact themed** (Copilot look, tighter density) → `--theme compact-themed --mode light|dark`
- **Compact neutral** (reserved palette for utilitarian surfaces) → `--theme compact-neutral --mode light|dark`

Copy the resulting paths into your plan or build steps. High contrast relies on browser/OS forced-colors, so no dedicated MAI bundle is provided.

> Tip: run `node ./skills/mai-ui-foundations/scripts/token-link.mjs --theme default --mode dark` to print the matching paths without scanning the table.

## Related skills
- `mai-ui-foundations` for token application and accessibility
- `mai-ui-components-and-patterns` for component selection (theme-agnostic)
- Additional theme skills can follow this structure (Fluent, Windows, Spotify, etc.)
