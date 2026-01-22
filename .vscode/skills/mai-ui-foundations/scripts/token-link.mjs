#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bundlesPath = path.resolve(scriptDir, '../data/token-bundles.json');
const THEMES = JSON.parse(readFileSync(bundlesPath, 'utf8'));

const args = process.argv.slice(2);
let theme = 'default';
let mode = 'light';
let format = 'both';
let listOnly = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  switch (arg) {
    case '--theme':
      theme = (args[i + 1] || theme).toLowerCase();
      i += 1;
      break;
    case '--mode':
      mode = (args[i + 1] || mode).toLowerCase();
      i += 1;
      break;
    case '--format':
      format = (args[i + 1] || format).toLowerCase();
      i += 1;
      break;
    case '--list':
      listOnly = true;
      break;
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);
    default:
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
  }
}

if (listOnly) {
  printTable();
  process.exit(0);
}

const themeEntry = THEMES[theme];
if (!themeEntry) {
  console.error(`Unknown theme "${theme}". Use --list to see supported values.`);
  process.exit(1);
}

const slug = themeEntry.modes[mode];
if (!slug) {
  console.error(`Theme "${theme}" does not provide a "${mode}" mode. Use --list for options.`);
  process.exit(1);
}

const cssPath = `@mai-ui/design-tokens/dist/themes/${slug}/${slug}.css`;
const jsonPath = `@mai-ui/design-tokens/themes/${slug}/${slug}.json`;

switch (format) {
  case 'css':
    console.log(cssPath);
    break;
  case 'json':
    console.log(jsonPath);
    break;
  case 'both':
    console.log(`CSS:  ${cssPath}`);
    console.log(`JSON: ${jsonPath}`);
    break;
  default:
    console.error('Format must be one of css|json|both');
    process.exit(1);
}

function printHelp() {
  console.log('Usage: token-link.mjs [--theme default] [--mode light] [--format css|json|both] [--list]');
  console.log('Themes:');
  printTable();
}

function printTable() {
  Object.entries(THEMES).forEach(([key, entry]) => {
    Object.entries(entry.modes).forEach(([modeName, slug]) => {
      const cssPath = `@mai-ui/design-tokens/dist/themes/${slug}/${slug}.css`;
      const jsonPath = `@mai-ui/design-tokens/themes/${slug}/${slug}.json`;
      console.log(`${entry.label} (${key}) - ${modeName}`);
      console.log(`  CSS:  ${cssPath}`);
      console.log(`  JSON: ${jsonPath}`);
    });
  });
}
