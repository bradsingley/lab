## Goals

Main agent responsibilities:

- Understand the desired tournament workflow and priorities.
- Break work into tasks and decide which sub-agents to consult.
- Implement the final code based on sub-agent research.

## Sub-agents

- [requirements-analyst]: Collect user stories, scope MVP features, and
  highlight open questions.
- [tournament-scheduler]: Design scheduling logic, match data, and scoring
  rules.
- [ui-ux-designer]: Define layout, visual hierarchy, and accessibility checks.
- [frontend-engineer]: Provide implementation guidance for HTML, CSS, and JS.
- [qa-tester]: List edge cases and test scenarios for tournament flow.

Sub-agents should write findings in `.claude/tasks/` and the main agent should
review before implementing.
