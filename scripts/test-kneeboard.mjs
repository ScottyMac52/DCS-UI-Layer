import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(repoRoot, 'config/reserved-inputs.json'), 'utf8'));
const svg = readFileSync(join(repoRoot, 'kneeboard/source/01-MFD3-UI-LAYER.svg'), 'utf8');
const pngPath = join(repoRoot, 'kneeboard/global/01-MFD3-UI-LAYER.png');
const metadata = await sharp(pngPath).metadata();

assert.equal(metadata.width, 1200);
assert.equal(metadata.height, 1600);
assert.equal(manifest.bindings.length, 10);
assert.deepEqual([...new Set(manifest.bindings.map(({ category }) => category))].sort(), ['General', 'VR']);

assert.ok(svg.includes('Shared DCS-Common device: tm-mfd'));
assert.ok(svg.includes('VKB F-14 BTN7 OR AVA F-16 GRIP S3'));
assert.equal(new Set(manifest.bindings.map(({ key }) => key)).size, manifest.bindings.length);

console.log('OpenKneeboard validation passed.');
