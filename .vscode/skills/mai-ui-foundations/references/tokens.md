# MAI UI Token Hierarchy

| Layer | File | Usage |
|-------|------|-------|
| Static | `@mai-ui/design-tokens/static.default.css` | Raw values; best for explorations or hard-coded experiments only. |
| Alias | `@mai-ui/design-tokens/alias.light.css` | Broad roles like background/foreground/stroke with light & dark coverage. |
| Semantic | `@mai-ui/design-tokens/themes/<theme>.<mode>/<theme>.<mode>.css` | Control- and state-specific tokens. **Always start here for production.** |

## Theme bundles
Use the `token-link` helper or the active theme skill’s switchboard to retrieve exact bundle paths without duplicating this table in multiple places.

```bash
node ./skills/mai-ui-foundations/scripts/token-link.mjs --list
node ./skills/mai-ui-foundations/scripts/token-link.mjs --theme compact --mode dark --format css
```

The helper reads from `skills/mai-ui-foundations/data/token-bundles.json`, which is the single source of truth for theme/mode slugs. When adding a new theme, update that JSON file and re-run `--list` to copy canonical paths into theme documentation if needed.

> High contrast is handled automatically by browser/OS accessibility modes. Ensure components inherit forced-colors styles, but do not create bespoke MAI bundles.

## Implementation guidelines
1. Import semantic tokens before rendering components (pick the correct theme/mode from above).
   ```html
   <link rel="stylesheet" href="./node_modules/@mai-ui/design-tokens/dist/themes/default.light/default.light.css">
   ```
2. In JavaScript projects, load the semantic JSON bundle and set the CSS custom properties on `document.body`:
   ```js
   import tokens from '@mai-ui/design-tokens/themes/default.light/default.light.json' with { type: 'json' };
   for (const [key, value] of Object.entries(tokens)) {
     document.body.style.setProperty(`--${key}`, value);
   }
   ```
3. Only fall back to alias tokens when a semantic token does not exist, and document the rationale inline (comments or PR notes). Theme skills should note any sanctioned exceptions.
4. Drop to static tokens only when neither semantic nor alias tiers provide a usable value.
5. **Never** apply `ai-brand-stop` tokens directly; they are internal gradient stops.

## Debug checklist
- Token names follow the `{control}-{part}-{state}` semantic convention.
- Avoid mixing tokens from different layers in the same component fragment unless you explicitly note why.
- When overriding tokens for dark mode or host integrations, mirror the same keys to keep consumer code stable.
