---
name: mai-ui-orchestrator
description: Route MAI UI work to the right sub-skill so agents load only the guidance they need.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Use this skill first when a user mentions MAI UI. It keeps context lean by delegating detailed workflows to narrower skills.

## How to route requests
| Scenario | Load this skill |
|----------|-----------------|
| Need MAI/Copilot color, motion, or voice guidance (plus token switchboard) | `mai-theme-copilot` |
| Need to install packages, `.npmrc`, or credential helpers | `mai-ui-bootstrap` |
| Align on tokens, spacing, typography, accessibility | `mai-ui-foundations` |
| Author or update MAI UI implementation plans | `mai-ui-planning-workflow` |
| Choose components, enforce variants, or audit layouts (includes component reference files locally) | `mai-ui-components-and-patterns` |
| Source icons, imagery, or other creative assets | `mai-ui-iconography-and-assets` |

## Usage pattern
1. Read the user’s request.
2. Identify which row in the table matches.
3. Load the referenced skill and follow its instructions end-to-end.
4. Return here only if the task scope changes or you need to chain multiple sub-skills.

## Notes
- Always determine the active theme first (load `mai-theme-copilot` today, or the appropriate future theme skill) before applying foundations/components. Use the theme’s token switchboard or `skills/mai-ui-foundations/scripts/token-link.mjs` to import the correct stylesheet before moving on.
- Sub-skills can be combined (e.g., bootstrap ➜ foundations ➜ components) as long as each has a clear completion checkpoint.
- Keep outputs modular too: attach planning docs, asset manifests, and implementation notes separately so they map back to the sub-skill that produced them.
