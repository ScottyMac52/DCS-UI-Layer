import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(repoRoot, 'config/reserved-inputs.json'), 'utf8'));
const image = { x: 360, y: 500, width: 480, height: 590, sourceSize: 900 };
const renderedSize = Math.min(image.width, image.height);
const renderedOrigin = [
  image.x + (image.width - renderedSize) / 2,
  image.y + (image.height - renderedSize) / 2,
];
const mfdPoint = ([sourceX, sourceY]) => [
  renderedOrigin[0] + sourceX * renderedSize / image.sourceSize,
  renderedOrigin[1] + sourceY * renderedSize / image.sourceSize,
];

const anchors = new Map(Object.entries({
  JOY_BTN1: [312, 99],
  JOY_BTN2: [386, 99],
  JOY_BTN3: [459, 99],
  JOY_BTN13: [459, 667],
  JOY_BTN18: [178, 377],
  JOY_BTN21: [728, 143],
  JOY_BTN24: [728, 604],
  JOY_BTN25: [179, 604],
  JOY_BTN26: [179, 570],
  JOY_BTN27: [172, 150],
}).map(([key, point]) => [key, mfdPoint(point)]));

const leftKeys = new Set(['JOY_BTN1', 'JOY_BTN18', 'JOY_BTN25', 'JOY_BTN26', 'JOY_BTN27']);
const pairedKeys = new Set(['JOY_BTN25', 'JOY_BTN26']);

function wrap(value, maxLength = 18) {
  const words = String(value).split(/\s+/);
  const lines = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > maxLength) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines.slice(0, 2);
}

const callouts = manifest.bindings
  .filter(({ key }) => !pairedKeys.has(key))
  .map((binding) => ({
    key: binding.key.replace('JOY_BTN', 'BTN '),
    label: binding.key.replace('JOY_BTN', 'BTN '),
    text: binding.name,
    lines: wrap(binding.name),
    title: binding.name,
    control: binding.key,
    anchor: anchors.get(binding.key),
    side: leftKeys.has(binding.key) ? 'left' : 'right',
    accent: binding.category === 'VR' ? 'cyan' : 'gold',
    width: 286,
    height: 78,
  }));

const rockerAnchors = ['JOY_BTN25', 'JOY_BTN26'].map((key) => anchors.get(key));
callouts.push({
  key: 'BTN 25 / 26',
  label: 'BTN 25 / 26',
  text: 'Time accelerate / Time decelerate',
  lines: ['Time Accel / Decel', '↑ BTN25  ↓ BTN26'],
  title: 'Time accelerate / Time decelerate',
  controls: ['JOY_BTN25', 'JOY_BTN26'],
  anchors: rockerAnchors,
  side: 'left',
  accent: 'gold',
  width: 286,
  height: 96,
  labelFontSize: 13,
});

function layoutSide(side) {
  const entries = callouts
    .filter((entry) => entry.side === side)
    .sort((a, b) => (a.anchor?.[1] ?? a.anchors[0][1]) - (b.anchor?.[1] ?? b.anchors[0][1]));
  const x = side === 'left' ? 40 : 874;
  const minY = 320;
  const maxY = 1180;
  const gap = 10;
  const placed = entries.map((entry) => {
    const anchorY = entry.anchor?.[1] ?? entry.anchors[0][1];
    const y = Math.max(minY, Math.min(maxY - entry.height, anchorY - entry.height / 2));
    return { ...entry, x, y };
  });
  for (let index = 1; index < placed.length; index += 1) {
    const previous = placed[index - 1];
    const floor = previous.y + previous.height + gap;
    if (placed[index].y < floor) placed[index].y = floor;
  }
  for (let index = placed.length - 2; index >= 0; index -= 1) {
    const ceiling = placed[index + 1].y - placed[index].height - gap;
    if (placed[index].y > ceiling) placed[index].y = Math.max(minY, ceiling);
  }
  return placed;
}

export const config = {
  assets: {
    mfd: { path: 'assets/shared/hardware/source/mfd-clean.png' },
  },
  pages: [{
    type: 'hardware',
    file: '01-MFD3-UI-LAYER',
    title: 'DCS UI LAYER • MFD 3',
    kicker: 'GENERAL + VR • GLOBAL FOR EVERY AIRFRAME',
    images: [{ href: { asset: 'mfd' }, ...image, opacity: 0.88 }],
    callouts: [...layoutSide('left'), ...layoutSide('right')],
    notes: [
      { key: 'HOLD', text: 'VKB F-14 BTN7 • AVA F-16 GRIP S3', accent: 'gold' },
      { key: 'OPTION 3', text: 'Modifier button retains its airframe function', accent: 'red' },
      { key: 'LEGEND', text: 'Cyan = VR • Gold = General • Combined rockers show both directions', accent: 'cyan' },
    ],
  }],
};
