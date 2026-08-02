import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(repoRoot, 'config/reserved-inputs.json'), 'utf8'));
const svg = readFileSync(join(repoRoot, 'kneeboard/source/01-MFD3-UI-LAYER.svg'), 'utf8');
const pngPath = join(repoRoot, 'kneeboard/UiLayer/01-MFD3-UI-LAYER.png');
const metadata = await sharp(pngPath).metadata();

assert.equal(metadata.width, 1200);
assert.equal(metadata.height, 1600);
assert.equal(manifest.bindings.length, 10);
assert.deepEqual([...new Set(manifest.bindings.map(({ category }) => category))].sort(), ['General', 'VR']);
for (const binding of manifest.bindings) {
  assert.ok(svg.includes(binding.key.replace('JOY_BTN', 'BTN ')), `Missing ${binding.key} callout`);
  assert.ok(svg.includes(binding.name.replaceAll('&', '&amp;')), `Missing ${binding.name} callout`);
}
for (const modifier of ['VKB F-14 BTN7', 'AVA F-16 GRIP S3']) assert.ok(svg.includes(modifier));
assert.ok(svg.includes('OPTION 3'));
assert.equal((svg.match(/<path d=/g) ?? []).length, manifest.bindings.length, 'Every binding must point to its MFD control');
assert.ok(svg.includes('Rocker callouts identify the exact direction'));
console.log('OpenKneeboard validation passed.');
