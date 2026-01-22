#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const args = process.argv.slice(2);
let projectDir = process.cwd();
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--project-dir' && args[i + 1]) {
    projectDir = path.resolve(args[i + 1]);
    i += 1;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: verify-mai-ui-install.mjs [--project-dir PATH]');
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${args[i]}`);
    process.exit(1);
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const pkgPath = path.join(projectDir, 'package.json');
assert(existsSync(pkgPath), `package.json not found in ${projectDir}`);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const hasDep = (name) => (pkg.dependencies && pkg.dependencies[name]) || (pkg.devDependencies && pkg.devDependencies[name]);
assert(hasDep('@mai-ui/core-components-suite'), 'Missing dependency @mai-ui/core-components-suite');
assert(hasDep('@mai-ui/design-tokens'), 'Missing dependency @mai-ui/design-tokens');

const resolveFromProject = (specifier) => {
  const { createRequire } = await import('node:module');
  const req = createRequire(path.join(projectDir, 'noop.mjs'));
  return req.resolve(specifier);
};

await resolveFromProject('@mai-ui/core-components-suite/package.json');
await resolveFromProject('@mai-ui/design-tokens/package.json');

const npmrcPath = path.join(projectDir, '.npmrc');
assert(existsSync(npmrcPath), '.npmrc missing from project root');
const npmrc = readFileSync(npmrcPath, 'utf8');
assert(/@mai-ui:registry=/m.test(npmrc), '.npmrc missing @mai-ui registry entry');
assert(/always-auth=true/m.test(npmrc), '.npmrc missing always-auth=true');

const tokenCss = await resolveFromProject('@mai-ui/design-tokens/dist/themes/default.light/default.light.css');
const tokenJson = await resolveFromProject('@mai-ui/design-tokens/themes/default.light/default.light.json');
assert(existsSync(tokenCss), 'Semantic token CSS file not found');
assert(existsSync(tokenJson), 'Semantic token JSON file not found');

console.log('MAI UI installation verified successfully.');
