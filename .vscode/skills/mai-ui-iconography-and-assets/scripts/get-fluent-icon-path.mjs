#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let icon = '';
let size = '20';
let variant = 'regular';
let iconsDir = path.resolve('node_modules/@fluentui/svg-icons/icons');

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  switch (arg) {
    case '--icon':
      icon = args[i + 1] || '';
      i += 1;
      break;
    case '--size':
      size = args[i + 1] || size;
      i += 1;
      break;
    case '--variant':
      variant = args[i + 1] || variant;
      i += 1;
      break;
    case '--icons-dir':
      iconsDir = path.resolve(args[i + 1] || iconsDir);
      i += 1;
      break;
    case '--help':
    case '-h':
      console.log('Usage: get-fluent-icon-path.mjs --icon heart --size 20 --variant regular');
      process.exit(0);
    default:
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
  }
}

if (!icon) {
  console.error('Missing --icon <name>');
  process.exit(1);
}

const fileName = `${icon}_${size}_${variant}.svg`;
const targetPath = path.join(iconsDir, fileName);
const svg = readFileSync(targetPath, 'utf8');
const match = svg.match(/d="([^"]+)"/);
if (!match) {
  console.error('Could not find path data in SVG');
  process.exit(1);
}

console.log(match[1]);
