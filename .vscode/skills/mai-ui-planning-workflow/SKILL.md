---
name: mai-ui-planning-workflow
description: Produce MAI UI implementation plans before coding, with component audits and reference lookups.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Use this skill whenever a user asks for a MAI UI feature but has not provided an approved implementation plan.

## Required workflow
1. Read the intake request carefully; extract intents, constraints, and success criteria.
2. Draft `docs/<feature-name>_IMPLEMENTATION.md` inside the active repo (or update the file if it already exists).
  - Run `node ./skills/mai-ui-planning-workflow/scripts/new-plan.mjs --feature "Feature Name"` to scaffold the Markdown shell automatically.
3. Follow the structure defined in [../mai-theme-copilot/references/design-guidance.md](../mai-theme-copilot/references/design-guidance.md) (or the active theme's equivalent).
4. List every MAI component, icon, and token you expect to use. If a traditional HTML wrapper is needed, justify the fallback.
5. Before executing, open the reference file for **each** component you listed (e.g., `../mai-ui-components-and-patterns/references/mai-button.md`). Summarize any critical constraints (props, sizing, accessibility).
  - Use `node ./skills/mai-ui-planning-workflow/scripts/component-reference-check.mjs --components "mai-button,mai-textarea"` to print previews and confirm nothing is missed.
6. Present the plan to the user for approval—or explicitly note that you’re proceeding if prior authorization was given.

## Plan template
```markdown
# <Feature> Implementation Plan

## Goals
- 

## Inputs
- User brief / assets

## Layout Strategy
- Section-by-section description
- Grid/flex decisions, spacing ramps, breakpoints

## Components & Variants
| Section | Component | Variant / Props | Reference |
|---------|-----------|-----------------|-----------|
| Hero | mai-card-carousel | default + custom nav spacing | skills/mai-ui-components-and-patterns/references/mai-card-carousel.md |

## Token + Theming Notes
- Semantic tokens for background/foreground
- Alias/static fallbacks if required

## Iconography
- Fluent icon name + size
- Source path from `@fluentui/svg-icons`

## Accessibility Considerations
- Focus order, aria attributes, keyboard support

## Open Questions
- Items to clarify with the user/PM
```

## Component reference lookup checklist
- `mai-button` family: confirm size (`medium` default), appearance, and icon slots.
- Form controls: verify width behavior (`mai-textarea` requires the `block` attribute, etc.).
- Navigation components: inspect keyboard interaction expectations.

Document the highlights from each reference directly in the plan so implementers do not need to re-open every file.

## Automation helpers
- `scripts/new-plan.mjs`: creates a dated implementation-plan stub in the target docs directory. Supports `--docs-dir` and `--force` when collaborating.
- `scripts/component-reference-check.mjs`: given a comma-separated list of components, surfaces the matching reference files (default path: `../mai-ui-components-and-patterns/references`). Use this before sign-off to ensure every component rule has been reviewed.

## Collaboration tips
- If multiple teammates contribute, store the plan in source control and link it in the PR description.
- Keep the file updated as scope evolves; this skill can be reloaded to amend the plan.

After approval, switch to:
- `mai-ui-components-and-patterns` to implement the plan
- `mai-ui-iconography-and-assets` when sourcing icons or imagery
