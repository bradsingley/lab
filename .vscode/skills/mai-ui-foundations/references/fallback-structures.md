# Fallback Structures

1. Attempt the layout with MAI UI components first; variants often cover common edge cases.
2. If components cannot express the requirement, build semantic HTML wrappers (`section`, `div`, `ul`) while applying the same semantic or alias tokens for color, typography, and spacing.
3. Document every deviation—note which tokens were chosen and why the fallback exists so future refactors can migrate back to native MAI components.
4. Keep wrappers minimal and composable, ensuring accessibility attributes mirror the behavior users expect from the nearest MAI component.
