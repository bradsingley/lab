# CSS Reset Policy

- Avoid blanket resets like `* { margin: 0; padding: 0; }`—they strip key styling from MAI UI web components.
- Apply scoped resets to specific tags that need normalization:
  ```css
  body, h1, h2, h3, p, ul { margin: 0; }
  ```
- When deeper overrides are required, use the `::part()` hooks that MAI components expose instead of forcing global selectors.
- Test components after applying resets to ensure focus indicators, padding, and slot layouts still conform to the design system.
