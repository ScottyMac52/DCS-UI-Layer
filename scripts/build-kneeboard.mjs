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
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

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
const callouts = manifest.bindings.map((binding) => ({
  ...binding,
  anchor: anchors.get(binding.key),
  side: leftKeys.has(binding.key) ? 'left' : 'right',
  accent: binding.category === 'VR' ? '#46d8ff' : '#ffc95c',
}));

if (callouts.some(({ anchor }) => !anchor)) throw new Error('A UI Layer binding is missing its MFD anchor.');

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

function drawCallout(entry, x, y) {
  const [anchorX, anchorY] = entry.anchor;
  const cardWidth = 286;
  const cardHeight = 82;
  const lineX = entry.side === 'left' ? x + cardWidth : x;
  const label = entry.key.replace('JOY_', '').replace('BTN', 'BTN ');
  const lines = wrap(entry.name);
  const textY = y + (cardHeight - (lines.length - 1) * 19) / 2 + 6;
  let result = `<g><title>${escapeXml(entry.name)}</title><path d="M ${lineX} ${y + cardHeight / 2} L ${anchorX} ${anchorY}" fill="none" stroke="${entry.accent}" stroke-width="2.5" opacity="0.9"/>`;
  result += `<circle data-control="${entry.key}" cx="${anchorX}" cy="${anchorY}" r="5" fill="none" stroke="${entry.accent}" stroke-width="2.5"/>`;
  result += `<rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="12" fill="#0d1b2b" stroke="${entry.accent}" stroke-width="2"/>`;
  result += `<rect x="${x + 9}" y="${y + 10}" width="82" height="${cardHeight - 20}" rx="8" fill="#06101d" stroke="${entry.accent}" stroke-width="1.5"/>`;
  result += `<text x="${x + 50}" y="${y + cardHeight / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="800" fill="${entry.accent}">${label}</text>`;
  lines.forEach((line, index) => {
    result += `<text x="${x + 102}" y="${textY + index * 19}" font-size="16" font-weight="600" fill="#f2f7ff">${escapeXml(line)}</text>`;
  });
  return `${result}</g>`;
}

const sideMarkup = ['left', 'right'].map((side) => {
  const entries = callouts.filter((entry) => entry.side === side).sort((a, b) => a.anchor[1] - b.anchor[1]);
  const x = side === 'left' ? 54 : 860;
  return entries.map((entry, index) => drawCallout(entry, x, 350 + index * 174)).join('\n');
}).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="#07111d"/>
  <rect x="34" y="34" width="1132" height="1532" rx="28" fill="none" stroke="#1d4b70" stroke-width="4"/>
  <text x="600" y="92" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="42" font-weight="800" fill="#f2f7ff">DCS UI LAYER • MFD 3</text>
  <text x="600" y="137" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" fill="#8fdfff">GENERAL + VR • GLOBAL FOR EVERY AIRFRAME</text>
  <rect x="70" y="165" width="1060" height="112" rx="18" fill="#102238" stroke="#2a6b94" stroke-width="2"/>
  <text x="600" y="207" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" font-weight="700" fill="#ffc95c">HOLD EITHER MODIFIER</text>
  <text x="600" y="245" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="23" fill="#f2f7ff">VKB F-14 BTN7  •  AVA F-16 GRIP S3</text>
  <rect x="348" y="310" width="504" height="910" rx="26" fill="#08121f" stroke="#1b334a" stroke-width="3"/>
  <image x="${mfdImage.x}" y="${mfdImage.y}" width="${mfdImage.width}" height="${mfdImage.height}" preserveAspectRatio="xMidYMid meet" opacity="0.88" href="data:image/png;base64,${asset}"/>
  <g font-family="DejaVu Sans,Arial,sans-serif">${sideMarkup}</g>
  <rect x="70" y="1260" width="1060" height="126" rx="16" fill="#101f33" stroke="#ff6677" stroke-width="2"/>
  <text x="600" y="1300" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="22" font-weight="800" fill="#ff8f98">OPTION 3 • MODIFIER BUTTON RETAINS ITS AIRFRAME FUNCTION</text>
  <text x="600" y="1338" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="19" fill="#f2f7ff">Cyan = VR  •  Gold = General  •  Rocker callouts identify the exact direction</text>
  <text x="600" y="1425" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="19" fill="#91a8bd">F/A-18 AVA modifier pending verified device export</text>
  <line x1="54" y1="1505" x2="1146" y2="1505" stroke="#263a52" stroke-width="2"/>
  <text x="54" y="1543" font-family="DejaVu Sans,Arial,sans-serif" font-size="18" fill="#8ea5bd">DCS UI Layer • Scott&apos;s cockpit • Generated from reserved-inputs.json</text>
  <text x="1146" y="1543" text-anchor="end" font-family="DejaVu Sans,Arial,sans-serif" font-size="18" fill="#8ea5bd">1 / 1</text>
</svg>`;

const svgPath = join(svgDir, '01-MFD3-UI-LAYER.svg');
const pngPath = join(pngDir, '01-MFD3-UI-LAYER.png');
writeFileSync(svgPath, svg, 'utf8');
await sharp(Buffer.from(svg)).png().toFile(pngPath);
console.log(`Generated ${pngPath}`);
