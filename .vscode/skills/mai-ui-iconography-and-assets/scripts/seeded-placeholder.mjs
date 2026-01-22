#!/usr/bin/env node
import crypto from 'node:crypto';

const args = process.argv.slice(2);
let width = 800;
let height = 450;
let seed = '';
let intent = '';

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  switch (arg) {
    case '--width':
      width = Number(args[i + 1]);
      i += 1;
      break;
    case '--height':
      height = Number(args[i + 1]);
      i += 1;
      break;
    case '--seed':
      seed = args[i + 1] || '';
      i += 1;
      break;
    case '--intent':
      intent = args[i + 1] || '';
      i += 1;
      break;
    case '--help':
    case '-h':
      console.log('Usage: seeded-placeholder.mjs [--width 800] [--height 450] [--seed marketing-hero] [--intent "concept art"]');
      process.exit(0);
    default:
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
  }
}

if (!seed) {
  const hash = crypto.createHash('sha1').update(`${width}x${height}-${Date.now()}`).digest('hex').slice(0, 8);
  seed = `mai-${hash}`;
}

const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
const alt = intent ? `Illustrative placeholder depicting ${intent}` : 'Illustrative placeholder image';

console.log(JSON.stringify({ url, alt, width, height, seed }, null, 2));
