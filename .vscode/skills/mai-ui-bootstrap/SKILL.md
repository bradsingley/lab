---
name: mai-ui-bootstrap
description: Install and configure MAI UI packages, auth, and tooling before writing any MAI UI code.
metadata:
  author: yu.he@microsoft.com
  version: "1.0"
---

Stand up the MAI UI toolchain so downstream skills can focus on design and implementation.

## When to use this skill
- New repo or project needs MAI UI components or tokens
- Existing project lost credentials or `.npmrc` config
- CI runners must refresh auth before installing MAI packages

## Quick checklist
1. Confirm Node.js 18+ and npm are available (`node --version`, `npm --version`).
2. Decide whether to run the automated installer or follow manual steps.
3. Ensure you have the Azure Artifacts credential provider configured for the current environment.
4. Install `@mai-ui/core-components-suite` and `@mai-ui/design-tokens` into the target project.

## Automated installation (preferred)
Run the curated script shipped with the original MAI UI skill:

```bash
./skills/mai-ui-bootstrap/scripts/bootstrap-mai-ui.sh --project-dir /absolute/path/to/project
```

Flags:
- `--skip-auth` when the credential helper is already logged in
- `--skip-npmrc` if the repo already contains a valid MAI UI `.npmrc`
- `--help` to view every option before running

The script handles:
- Installing `@microsoft/artifacts-npm-credprovider` globally (if missing)
- Creating/updating `.npmrc` entries for the `@mai-ui` scope
- Refreshing the credential provider session
- Installing the MAI UI component + token packages in batch

## Manual install flow
Follow these steps only if you cannot run the script:

1. **Credential helper**
   ```bash
   npm install --global @microsoft/artifacts-npm-credprovider --registry https://pkgs.dev.azure.com/artifacts-public/23934c1b-a3b5-4b70-9dd3-d1bef4cc72a0/_packaging/AzureArtifacts/npm/registry/
   ```
2. **Project `.npmrc`** (place in repo root):
   ```
   @mai-ui:registry=https://pkgs.dev.azure.com/microsoftaidesign/mai-ui/_packaging/mai-ui/npm/registry/
   always-auth=true
   ```
3. **Authenticate** by running `artifacts-npm-credprovider` and completing the device login.
4. **Install packages**: `npm install @mai-ui/core-components-suite @mai-ui/design-tokens`
5. **Add refresh script** (optional but recommended):
   ```json
   {
     "scripts": {
       "refresh-auth": "artifacts-npm-credprovider && npm install"
     }
   }
   ```

## Post-install verification
- Import `@mai-ui/core-components-suite` inside a scratch file and confirm components render without 401 errors.
- Reference one token JSON/stylesheet from `@mai-ui/design-tokens`; ensure values resolve and no `ERR_MODULE_NOT_FOUND` occurs.
- Commit the `.npmrc` changes if the repo policy allows storing scoped registry credentials (they only hold registry URLs, not secrets).

### Scripted verification
Use the Node helper after installation to ensure dependencies, registry config, and token bundles are present:

```bash
node ./skills/mai-ui-bootstrap/scripts/verify-mai-ui-install.mjs --project-dir /absolute/path/to/project
```

## Hand-off
After bootstrapping succeeds, jump to:
- `mai-ui-foundations` for token + spacing rules
- `mai-ui-components-and-patterns` for component selection
- `mai-ui-planning-workflow` when you must author an implementation plan first
