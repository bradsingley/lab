# Accessibility Guardrails

- **Contrast**: meet WCAG AA—4.5:1 for body text, 3:1 for large text and essential icons.
- **Labels**: add descriptive `aria-label` or `aria-describedby` when wrapping MAI components in custom containers so assistive tech still reports purpose.
- **Target size**: interactive regions should measure at least 44px in the smallest dimension; add padding if components are too compact.
- **Focus order**: test keyboard navigation (Tab/Shift+Tab) after every structural change to prevent focus traps.
- **Announcements**: when using custom patterns, rely on live regions or set appropriate roles to mirror native MAI component behavior.
