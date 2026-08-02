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

const rows = manifest.bindings.map((binding, index) => {
  const y = 860 + index * 50;
  const fill = index % 2 === 0 ? '#102238' : '#0c1b2d';
  return `<rect x="55" y="${y - 31}" width="1090" height="45" rx="7" fill="${fill}"/>`
    + `<text x="82" y="${y}" font-size="23" font-weight="700" fill="#ffc95c">${escapeXml(binding.key.replace('JOY_', ''))}</text>`
    + `<text x="250" y="${y}" font-size="23" fill="#f2f7ff">${escapeXml(binding.name)}</text>`
    + `<text x="1070" y="${y}" text-anchor="end" font-size="20" fill="#8fdfff">${escapeXml(binding.category)}</text>`;
}).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="#07111d"/>
  <rect x="34" y="34" width="1132" height="1532" rx="28" fill="none" stroke="#1d4b70" stroke-width="4"/>
  <text x="600" y="92" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="42" font-weight="800" fill="#f2f7ff">DCS UI LAYER • MFD 3</text>
  <text x="600" y="137" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" fill="#8fdfff">GENERAL + VR • GLOBAL FOR EVERY AIRFRAME</text>
  <rect x="70" y="170" width="1060" height="105" rx="18" fill="#102238" stroke="#2a6b94" stroke-width="2"/>
  <text x="600" y="210" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="24" font-weight="700" fill="#ffc95c">HOLD EITHER MODIFIER</text>
  <text x="600" y="245" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="23" fill="#f2f7ff">VKB F-14 BTN7  •  AVA F-16 GRIP S3</text>
  <image x="350" y="300" width="500" height="500" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${asset}"/>
  <text x="600" y="815" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="22" fill="#ff8f98">OPTION 3: MODIFIER MAY ALSO FIRE ITS AIRCRAFT FUNCTION</text>
  <g font-family="DejaVu Sans,Arial,sans-serif">${rows}</g>
  <text x="600" y="1518" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="19" fill="#91a8bd">F/A-18 AVA modifier pending verified device export • Generated from reserved-inputs.json</text>
</svg>`;

const svgPath = join(svgDir, '01-MFD3-UI-LAYER.svg');
const pngPath = join(pngDir, '01-MFD3-UI-LAYER.png');
writeFileSync(svgPath, svg, 'utf8');
await sharp(Buffer.from(svg)).png().toFile(pngPath);
console.log(`Generated ${pngPath}`);

