---
name: mai-ui-foundations
description: Apply MAI UI design foundations—tokens, spacing, typography, accessibility, and reset policies.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Use this skill whenever you need to align layouts with the MAI Design System before diving into component details.

## When to load
- Establishing a design language for a fresh feature or page
- Auditing an implementation for token or typography drift
- Sharing guidance with other MAI-flavored skills (Copilot, Universal, etc.)

## Core principles
- Design on the MAI 4px spacing ramp to maintain rhythm across breakpoints.
- Default to semantic tokens; drop to alias/static layers only when documented.
- Keep MAI UI components visually unmodified unless the design brief demands overrides.
- Bake accessibility into day-one decisions (contrast, focus order, aria annotations).

## Reference map
- [Design language](../mai-theme-copilot/references/design-language.md) – color ramps, elevation, layering, iconography, and material treatments.
- [Shape, size, and spacing](../mai-theme-copilot/references/shape-spacing.md) – corner smoothing rules plus spacing ramps.
- [Token hierarchy](references/tokens.md) – explains static/alias/semantic layers plus import snippets.
- [Spacing and layout](references/spacing-layout.md) – grid discipline and gap/padding guidance.
- [Typography and fonts](references/typography.md) – available font files, semantic typography tokens, and best practices.
- [Motion system](../mai-theme-copilot/references/motion.md) – easing curves, duration ramps, and when to use each.
- [Voice and tone](../mai-theme-copilot/references/voice-and-tone.md) – content style and accessibility reminders.
- [Accessibility guardrails](references/accessibility.md) – contrast, tap targets, labeling, and focus rules.
- [CSS reset policy](references/css-reset.md) – safe reset patterns and component override techniques.
- [Fallback structures](references/fallback-structures.md) – procedure for mixing semantic HTML with MAI tokens when components fall short.

## How to use this skill
1. Skim the core principles above to confirm the request fits this skill.
2. Open the reference file that matches your current task; load only what you need to preserve context.
3. Document any deviations (e.g., alias token fallback, custom wrappers) in your plan or PR so future contributors know why foundations were adjusted.

Next up:
- `mai-ui-planning-workflow` for plan templates
- `mai-ui-components-and-patterns` for component-level decisions
