import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const commonRoot = resolve(process.env.DCS_COMMON_ROOT ?? join(root, '.dcs-common'));
const { renderSharedHardwarePage } = await import(
  pathToFileURL(join(commonRoot, 'scripts/shared-hardware-consumer.mjs'))
);

const manifest = JSON.parse(readFileSync(join(root, 'config/reserved-inputs.json'), 'utf8'));
const labels = Array(28).fill('');
for (const binding of manifest.bindings) {
  const button = Number(binding.key.replace('JOY_BTN', ''));
  labels[button - 1] = binding.name;
}

const svgDir = join(root, 'kneeboard/source');
const pngDir = join(root, 'kneeboard/global');
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

const { svg } = renderSharedHardwarePage({
  deviceId: 'tm-mfd',
  labels,
  commonRoot,
  title: 'DCS UI LAYER • MFD 3',
  kicker: 'GENERAL + VR • HOLD VKB F-14 BTN7 OR AVA F-16 GRIP S3',
  provenance: { consumer: 'DCS-UI-Layer', page: '1 / 1' },
});

writeFileSync(join(svgDir, '01-MFD3-UI-LAYER.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(pngDir, '01-MFD3-UI-LAYER.png'));
console.log('Generated kneeboard/global/01-MFD3-UI-LAYER.png from DCS-Common shared hardware.');
