import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(repoRoot, 'config/reserved-inputs.json'), 'utf8'));
const asset = readFileSync(join(repoRoot, 'kneeboard/assets/source/cougar-mfd-clean.png')).toString('base64');
const svgDir = join(repoRoot, 'kneeboard/source');
const pngDir = join(repoRoot, 'kneeboard/UiLayer');
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

const escapeXml = (value) => String(value)
  .replaceAll('&', '&').replaceAll('<', '<').replaceAll('>', '>')
  .replaceAll('"', '"').replaceAll("'", ''');

const mfdImage = { x: 360, y: 500, width: 480, height: 590, sourceSize: 900 };
const renderedSize = Math.min(mfdImage.width, mfdImage.height);
const renderedOrigin = [
  mfdImage.x + (mfdImage.width - renderedSize) / 2,
  mfdImage.y + (mfdImage.height - renderedSize) / 2,
];
const mfdPoint = ([sourceX, sourceY]) => [
  renderedOrigin[0] + sourceX * renderedSize / mfdImage.sourceSize,
  renderedOrigin[1] + sourceY * renderedSize / mfdImage.sourceSize,
];

// Control centers measured in the 900×900 source photograph. Using the same
// preserveAspectRatio transform as the SVG image keeps every leader attached
// directly to its OSB or to the selected half of a rocker.
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
  JOY_BTN27: [179, 172],
}).map(([key, point]) => [key, mfdPoint(point)]));

const leftKeys = new Set(['JOY_BTN1', 'JOY_BTN18', 'JOY_BTN25', 'JOY_BTN26', 'JOY_BTN27']);

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

// Pair rocker halves that belong together so they render as one combined callout.
const rockerPairs = [
  {
    keys: ['JOY_BTN25', 'JOY_BTN26'],
    label: 'BTN 25 / 26',
    title: 'Time accelerate / Time decelerate',
    lines: ['Time Accel / Decel', '\u2191 BTN25  \u2193 BTN26'],
    category: 'General',
  },
];

const pairedKeys = new Set(rockerPairs.flatMap((pair) => pair.keys));

const singleCallouts = manifest.bindings
  .filter((binding) => !pairedKeys.has(binding.key))
  .map((binding) => ({
    type: 'single',
    keys: [binding.key],
    name: binding.name,
    label: binding.key.replace('JOY_', '').replace('BTN', 'BTN '),
    lines: wrap(binding.name),
    anchor: anchors.get(binding.key),
    side: leftKeys.has(binding.key) ? 'left' : 'right',
    accent: binding.category === 'VR' ? '#46d8ff' : '#ffc95c',
  }));

const rockerCallouts = rockerPairs.map((pair) => {
  const points = pair.keys.map((key) => anchors.get(key));
  if (points.some((point) => !point)) throw new Error(`Missing rocker anchor for ${pair.keys.join(',')}`);
  const midY = (points[0][1] + points[1][1]) / 2;
  const midX = (points[0][0] + points[1][0]) / 2;
  return {
    type: 'rocker',
    keys: pair.keys,
    name: pair.title,
    label: pair.label,
    lines: pair.lines,
    anchors: points,
    anchor: [midX, midY],
    side: leftKeys.has(pair.keys[0]) ? 'left' : 'right',
    accent: pair.category === 'VR' ? '#46d8ff' : '#ffc95c',
  };
});

const callouts = [...singleCallouts, ...rockerCallouts];
if (callouts.some(({ anchor }) => !anchor)) throw new Error('A UI Layer binding is missing its MFD anchor.');

function drawCallout(entry, x, y) {
  const cardWidth = 286;
  const cardHeight = entry.type === 'rocker' ? 96 : 78;
  const lineX = entry.side === 'left' ? x + cardWidth : x;
  const textY = y + (cardHeight - (entry.lines.length - 1) * 18) / 2 + 5;
  let result = `<g><title>${escapeXml(entry.name)}</title>`;

  if (entry.type === 'rocker') {
    for (const [index, key] of entry.keys.entries()) {
      const [ax, ay] = entry.anchors[index];
      result += `<path d="M ${lineX} ${y + cardHeight / 2} L ${ax} ${ay}" fill="none" stroke="${entry.accent}" stroke-width="2.5" opacity="0.9"/>`;
      result += `<circle data-control="${key}" cx="${ax}" cy="${ay}" r="5" fill="none" stroke="${entry.accent}" stroke-width="2.5"/>`;
    }
  } else {
    const [anchorX, anchorY] = entry.anchor;
    result += `<path d="M ${lineX} ${y + cardHeight / 2} L ${anchorX} ${anchorY}" fill="none" stroke="${entry.accent}" stroke-width="2.5" opacity="0.9"/>`;
    result += `<circle data-control="${entry.keys[0]}" cx="${anchorX}" cy="${anchorY}" r="5" fill="none" stroke="${entry.accent}" stroke-width="2.5"/>`;
  }

  result += `<rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="12" fill="#0d1b2b" stroke="${entry.accent}" stroke-width="2"/>`;
  result += `<rect x="${x + 9}" y="${y + 10}" width="90" height="${cardHeight - 20}" rx="8" fill="#06101d" stroke="${entry.accent}" stroke-width="1.5"/>`;
  result += `<text x="${x + 54}" y="${y + cardHeight / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-size="${entry.type === 'rocker' ? 13 : 15}" font-weight="800" fill="${entry.accent}">${escapeXml(entry.label)}</text>`;
  entry.lines.forEach((line, index) => {
    result += `<text x="${x + 110}" y="${textY + index * 18}" font-size="15" font-weight="600" fill="#f2f7ff">${escapeXml(line)}</text>`;
  });
  return `${result}</g>`;
}

// Place each callout vertically near its physical control instead of a fixed grid,
// then nudge overlapping cards apart so leaders stay short and readable.
function layoutSide(side) {
  const entries = callouts
    .filter((entry) => entry.side === side)
    .sort((a, b) => a.anchor[1] - b.anchor[1]);
  const x = side === 'left' ? 40 : 874;
  const minY = 320;
  const maxY = 1180;
  const gap = 10;

  const placed = entries.map((entry) => {
    const height = entry.type === 'rocker' ? 96 : 78;
    let y = entry.anchor[1] - height / 2;
    y = Math.max(minY, Math.min(maxY - height, y));
    return { entry, x, y, height };
  });

  for (let i = 1; i < placed.length; i += 1) {
    const prev = placed[i - 1];
    const curr = placed[i];
    const floor = prev.y + prev.height + gap;
    if (curr.y < floor) curr.y = floor;
  }

  for (let i = placed.length - 2; i >= 0; i -= 1) {
    const curr = placed[i];
    const next = placed[i + 1];
    const ceiling = next.y - curr.height - gap;
    if (curr.y > ceiling) curr.y = Math.max(minY, ceiling);
  }

  return placed.map(({ entry, x: px, y }) => drawCallout(entry, px, y)).join('\n');
}

const sideMarkup = `${layoutSide('left')}\n${layoutSide('right')}`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="#07111d"/>
  <rect x="34" y="34" width="1132" height="1532" rx="28" fill="none" stroke="#1d4b70" stroke-width="4"/>
  <text x="600" y="92" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="42" font-weight="800" fill="#f2f7ff">DCS UI LAYER \u2022 MFD 3</text>
  <text x="600" y="137" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" fill="#8fdfff">GENERAL + VR \u2022 GLOBAL FOR EVERY AIRFRAME</text>
  <rect x="70" y="165" width="1060" height="112" rx="18" fill="#102238" stroke="#2a6b94" stroke-width="2"/>
  <text x="600" y="207" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" font-weight="700" fill="#ffc95c">HOLD EITHER MODIFIER</text>
  <text x="600" y="245" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="23" fill="#f2f7ff">VKB F-14 BTN7  \u2022  AVA F-16 GRIP S3</text>
  <rect x="348" y="310" width="504" height="910" rx="26" fill="#08121f" stroke="#1b334a" stroke-width="3"/>
  <image x="${mfdImage.x}" y="${mfdImage.y}" width="${mfdImage.width}" height="${mfdImage.height}" preserveAspectRatio="xMidYMid meet" opacity="0.88" href="data:image/png;base64,${asset}"/>
  <g font-family="DejaVu Sans,Arial,sans-serif">${sideMarkup}</g>
  <rect x="70" y="1260" width="1060" height="126" rx="16" fill="#101f33" stroke="#ff6677" stroke-width="2"/>
  <text x="600" y="1300" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="22" font-weight="800" fill="#ff8f98">OPTION 3 \u2022 MODIFIER BUTTON RETAINS ITS AIRFRAME FUNCTION</text>
  <text x="600" y="1338" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="19" fill="#f2f7ff">Cyan = VR  \u2022  Gold = General  \u2022  Combined rockers show both directions</text>
  <text x="600" y="1425" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="19" fill="#91a8bd">F/A-18 AVA modifier pending verified device export</text>
  <line x1="54" y1="1505" x2="1146" y2="1505" stroke="#263a52" stroke-width="2"/>
  <text x="54" y="1543" font-family="DejaVu Sans,Arial,sans-serif" font-size="18" fill="#8ea5bd">DCS UI Layer \u2022 Scott's cockpit \u2022 Generated from reserved-inputs.json</text>
  <text x="1146" y="1543" text-anchor="end" font-family="DejaVu Sans,Arial,sans-serif" font-size="18" fill="#8ea5bd">1 / 1</text>
</svg>`;

const svgPath = join(svgDir, '01-MFD3-UI-LAYER.svg');
const pngPath = join(pngDir, '01-MFD3-UI-LAYER.png');
writeFileSync(svgPath, svg, 'utf8');
await sharp(Buffer.from(svg)).png().toFile(pngPath);
console.log(`Generated ${pngPath}`);
