#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
let referenceDir = path.resolve(scriptDir, '../../mai-ui-components-and-patterns/references');
let componentsArg = '';

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  switch (arg) {
    case '--references-dir':
      referenceDir = path.resolve(args[i + 1] || referenceDir);
      i += 1;
      break;
    case '--components':
      componentsArg = args[i + 1] || '';
      i += 1;
      break;
    case '--help':
    case '-h':
      console.log('Usage: component-reference-check.mjs --components "mai-button,mai-textarea" [--references-dir path]');
      process.exit(0);
    default:
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
  }
}

if (!componentsArg) {
  console.error('Provide a comma-separated list via --components');
  process.exit(1);
}

const components = componentsArg.split(',').map((c) => c.trim()).filter(Boolean);
const files = readdirSync(referenceDir);

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

for (const component of components) {
  const needle = normalize(component);
  const match = files.find((file) => normalize(file).includes(needle));
  if (!match) {
    console.warn(`⚠️  No reference file found for ${component}`);
    continue;
  }
  const filePath = path.join(referenceDir, match);
  const preview = readFileSync(filePath, 'utf8').split('\n').slice(0, 20).join('\n');
  console.log(`\n=== ${component} → ${match} ===`);
  console.log(preview);
  console.log('---');
}
