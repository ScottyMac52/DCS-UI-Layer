import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import luaparse from 'luaparse';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(repoRoot, 'config/reserved-inputs.json'), 'utf8'));
const profilePath = join(repoRoot, 'src/Config/Input/UiLayer/joystick/F16 MFD 3 {C5BE49A0-2342-11ee-8001-444553540000}.diff.lua');
const modifierPath = join(repoRoot, 'src/Config/Input/UiLayer/modifiers.lua');
const profile = readFileSync(profilePath, 'utf8');
const modifiers = readFileSync(modifierPath, 'utf8');

for (const [path, source] of [[profilePath, profile], [modifierPath, modifiers]]) {
  assert.doesNotThrow(() => luaparse.parse(source, { luaVersion: '5.1' }), `Invalid Lua: ${path}`);
}
assert.equal(manifest.bindings.length, 10);
assert.equal(manifest.schemaVersion, 2);
assert.equal(manifest.acceptedModifierReuse.enabled, true);
assert.equal(manifest.acceptedModifierReuse.decision, 'Option 3');
assert.deepEqual([...new Set(manifest.bindings.map(({ category }) => category))].sort(), ['General', 'VR']);
const supported = manifest.modifiers.filter(({ status }) => status === 'supported');
assert.deepEqual(supported.map(({ name }) => name).sort(), ['MOZA_F16_F18_BTN3', 'VKB_F14_BTN7']);
const semantic = manifest.semanticModifiers.find(({ id }) => id === 'grip-shift');
assert.ok(semantic, 'Missing grip-shift semantic modifier.');
assert.deepEqual([...semantic.activators].sort(), supported.map(({ name }) => name).sort());

const physicalTuples = new Set();
for (const modifier of supported) {
  assert.equal(modifier.semanticModifier, semantic.id);
  const tuple = `${modifier.device}|${modifier.key}`;
  assert.ok(!physicalTuples.has(tuple), `Duplicate physical modifier tuple ${tuple}`);
  physicalTuples.add(tuple);
}
assert.equal(supported.find(({ name }) => name === 'MOZA_F16_F18_BTN3').gripFamily, 'F-16C/F/A-18C');

const tuples = new Set();
for (const binding of manifest.bindings) {
  const escaped = binding.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = profile.match(new RegExp(`^\\s*\\["${escaped}"\\]\\s*=\\s*\\{(?<body>.*?)(?=^\\t\\t\\["d|^\\t\\},\\s*$)`, 'ms'))?.groups?.body;
  assert.ok(block, `Missing ${binding.command}`);
  assert.ok(block.includes(`["name"] = "${binding.name}"`), `Wrong name for ${binding.command}`);
  assert.equal((block.match(new RegExp(`\\["key"\\] = "${binding.key}"`, 'g')) ?? []).length, 2);
  for (const modifier of supported) {
    assert.equal((block.match(new RegExp(`"${modifier.name}"`, 'g')) ?? []).length, 1);
    const tuple = `${binding.key}|${modifier.name}`;
    assert.ok(!tuples.has(tuple), `Duplicate tuple ${tuple}`);
    tuples.add(tuple);
  }
}
for (const modifier of supported) {
  for (const expected of [modifier.name, modifier.device, modifier.key]) assert.ok(modifiers.includes(expected));
}

// Regression contract: an unpaired physical path is a coverage gap, while an
// unrelated device using BTN3 must never be folded into grip-shift.
const vkbOnly = ['VKB_F14_BTN7'];
assert.deepEqual(semantic.activators.filter((name) => !vkbOnly.includes(name)), ['MOZA_F16_F18_BTN3']);
assert.equal(supported.some(({ device, key }) => device === 'Unrelated device' && key === 'JOY_BTN3'), false);

function filesUnder(root) {
  const output = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) output.push(...filesUnder(path));
    else if (path.endsWith('.diff.lua')) output.push(path);
  }
  return output;
}

function collisions(root) {
  const found = [];
  for (const path of filesUnder(root)) {
    if (!path.includes(manifest.device.guid) || path.replaceAll('\\', '/').includes('/UiLayer/joystick/')) continue;
    const text = readFileSync(path, 'utf8');
    for (const binding of manifest.bindings) for (const modifier of supported) {
      const pattern = new RegExp(`\\["key"\\]\\s*=\\s*"${binding.key}".{0,500}?\\["reformers"\\].{0,500}?"${modifier.name}"`, 's');
      if (pattern.test(text)) found.push(`${path}: ${binding.key} + ${modifier.name}`);
    }
  }
  return found;
}

assert.deepEqual(collisions(join(repoRoot, 'tests/fixtures/clean')), []);
assert.equal(collisions(join(repoRoot, 'tests/fixtures/collision')).length, 1);
console.log('Lua profile and collision validation passed.');
