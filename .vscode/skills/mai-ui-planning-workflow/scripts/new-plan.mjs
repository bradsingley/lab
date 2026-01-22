#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let featureName = '';
let docsDir = 'docs';
let force = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  switch (arg) {
    case '--feature':
      featureName = args[i + 1] || '';
      i += 1;
      break;
    case '--docs-dir':
      docsDir = args[i + 1] || docsDir;
      i += 1;
      break;
    case '--force':
      force = true;
      break;
    case '--help':
    case '-h':
      console.log('Usage: new-plan.mjs --feature "Feature Name" [--docs-dir docs] [--force]');
      process.exit(0);
    default:
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
  }
}

if (!featureName) {
  console.error('Missing required --feature "Feature Name" argument');
  process.exit(1);
}

const slug = featureName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const filename = `${slug || 'feature'}_IMPLEMENTATION.md`;
const targetDir = path.resolve(docsDir);
const targetPath = path.join(targetDir, filename);

if (existsSync(targetPath) && !force) {
  console.error(`${targetPath} already exists. Re-run with --force to overwrite.`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
const today = new Date().toISOString().split('T')[0];

const template = `# ${featureName} Implementation Plan\n\n_Last updated: ${today}_\n\n## Goals\n- \n\n## Inputs\n- User brief / assets\n\n## Layout Strategy\n- Section-by-section description\n- Grid/flex decisions, spacing ramps, breakpoints\n\n## Components & Variants\n| Section | Component | Variant / Props | Reference |\n|---------|-----------|-----------------|-----------|\n| Example | mai-button | primary, icon=start | references/mai-button.md |\n\n## Token + Theming Notes\n- Semantic tokens for background/foreground\n- Alias/static fallbacks if required\n\n## Iconography\n- Fluent icon name + size\n- Source path from @fluentui/svg-icons\n\n## Accessibility Considerations\n- Focus order, aria attributes, keyboard support\n\n## Open Questions\n- Items to clarify with the user/PM\n`;

writeFileSync(targetPath, template, 'utf8');
console.log(`Created ${targetPath}`);
