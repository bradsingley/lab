---
name: mai-ui-components-and-patterns
description: Select MAI UI components, enforce variant rules, and apply pattern-specific constraints.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Use this skill whenever you are ready to translate an approved plan into concrete MAI UI components or when you need to audit component usage.

## Workflow
1. Load `mai-ui-foundations` if you need a refresher on spacing, tokens, or typography.
2. Open the relevant plan file produced via `mai-ui-planning-workflow`.
3. For every component you plan to render, read its guidance file under `./references/` and summarize the essentials in your working doc or PR description.
4. Compose layouts primarily with MAI UI components, supplementing with semantic HTML wrappers only when the component library cannot cover the need.

## Component-specific rules
| Component | Rule |
|-----------|------|
| `mai-text-input` | Has a default max width; override when wider fields are required. |
| `mai-textarea` | Set the `block` attribute to stretch to container width. |
| `mai-avatar` | Do **not** set the `name` attribute; use an `<img>` inside the default slot. |
| `mai-badge` | Force `width: fit-content` so the badge hugs its label. |

## Embedded component reference lookup
This skill now embeds the component library so you can stay in one context while building UI.
1. Identify the MAI component you’re using.
2. Open the matching markdown file under `./references/`.
3. Capture required props, slot rules, sizing constraints, and accessibility notes in your working doc or PR description.
4. Resume implementation without switching skills; only hop to a theme skill if you need design-language overlays (e.g., `mai-theme-copilot`).

Need a quick list of files to review? Run `skills/mai-ui-planning-workflow/scripts/component-reference-check.mjs` with your component names to surface the same references.

## Component reference index
The directory `./references/` maps directly to `@mai-ui/core-components-suite`. Use these files as the single source of truth for props, slots, and cautions:
- Accordion: `./references/mai-accordion.md`
- Accordion Item: `./references/mai-accordion-item.md`
- Anchor Button: `./references/mai-anchor-button.md`
- Avatar: `./references/mai-avatar.md`
- Badge: `./references/mai-badge.md`
- Button: `./references/mai-button.md`
- Card Carousel: `./references/mai-card-carousel.md`
- Card List: `./references/mai-card-list.md`
- Checkbox: `./references/mai-checkbox.md`
- Content Card: `./references/mai-content-card.md`
- Dialog / Dialog Body: `./references/mai-dialog.md`, `./references/mai-dialog-body.md`
- Divider: `./references/mai-divider.md`
- Drawer / Drawer Body: `./references/mai-drawer.md`, `./references/mai-drawer-body.md`
- Dropdown / Option / Listbox: `./references/mai-dropdown.md`, `./references/mai-option.md`, `./references/mai-listbox.md`
- Field: `./references/mai-field.md`
- Filter / Filter Item: `./references/mai-filter.md`, `./references/mai-filter-item.md`
- Gem Card: `./references/mai-gem-card.md`
- Link: `./references/mai-link.md`
- Menu family: `./references/mai-menu.md`, `./references/mai-menu-list.md`, `./references/mai-menu-item.md`, `./references/mai-menu-button.md`
- Message Bar: `./references/mai-message-bar.md`
- Product Card: `./references/mai-product-card.md`
- Progress Bar: `./references/mai-progress-bar.md`
- Radio / Radio Group: `./references/mai-radio.md`, `./references/mai-radio-group.md`
- Rating Display: `./references/mai-rating-display.md`
- Slider: `./references/mai-slider.md`
- Spinner: `./references/mai-spinner.md`
- Switch: `./references/mai-switch.md`
- Tabs: `./references/mai-tab.md`, `./references/mai-tablist.md`
- Text / Text Input / Textarea: `./references/mai-text.md`, `./references/mai-text-input.md`, `./references/mai-textarea.md`
- Tooltip: `./references/mai-tooltip.md`
- Tree / Tree Item: `./references/mai-tree.md`, `./references/mai-tree-item.md`
- Video Card: `./references/mai-video-card.md`

For layout inspiration, review `../mai-theme-copilot/references/grid-patterns.md` (or the active theme’s equivalent).

## Layout + hierarchy tips
- Primary actions should stand out (use `appearance="primary"` or semantic emphasis tokens). Secondary actions stay low-contrast.
- Use MAI layout primitives (`mai-card`, `mai-card-grid`, `mai-carousel`) before rolling custom wrappers.
- Keep related information grouped with consistent gaps; avoid mixing tokens from different tiers in the same cluster.

## Imagery and media
- When no asset is provided, use `https://picsum.photos` with deterministic URLs (include fixed width/height) to keep previews stable.
- Always define `alt` text; describe the intent, not the literal placeholder.

## Fallback pattern strategy
1. Attempt to compose with MAI components.
2. If impossible, build semantic HTML wrappers using MAI tokens for color/spacing/typography.
3. Document the deviation so future updates can migrate back to official components.

## Handoff notes
- Link to every reference file you consulted in your implementation notes.
- When creating PRs, summarize component decisions so reviewers know which parts to scrutinize.

Related skills:
- `mai-ui-iconography-and-assets` for icons and imagery sourcing
- `mai-ui-bootstrap` if dependencies were never installed
