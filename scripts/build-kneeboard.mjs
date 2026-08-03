import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderKneeboard } from 'dcs-common/scripts/kneeboard-renderer.mjs';
import { config } from '../config/ui-layer-kneeboard.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const commonRoot = dirname(fileURLToPath(import.meta.resolve('dcs-common/package.json')));
const hardwareManifest = JSON.parse(readFileSync(join(commonRoot, 'assets/shared/hardware/manifest.json'), 'utf8'));

if (!hardwareManifest.devices.some(({ id }) => id === 'tm-mfd')) {
  throw new Error('The pinned DCS-Common hardware catalog does not contain tm-mfd.');
}

const temporaryDir = join(repoRoot, 'dist/.kneeboard-build');
const svgDir = join(repoRoot, 'kneeboard/source');
const pngDir = join(repoRoot, 'kneeboard/UiLayer');
rmSync(temporaryDir, { recursive: true, force: true });
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

const result = await renderKneeboard({ config, outputDir: temporaryDir, rootDir: commonRoot });
const svg = result.svgFiles.find((path) => path.endsWith('01-MFD3-UI-LAYER.svg'));
const png = result.pngFiles.find((path) => path.endsWith('01-MFD3-UI-LAYER.png'));
if (!svg || !png) throw new Error('DCS-Common did not generate both UI Layer kneeboard formats.');

const svgPath = join(svgDir, '01-MFD3-UI-LAYER.svg');
const pngPath = join(pngDir, '01-MFD3-UI-LAYER.png');
copyFileSync(svg, svgPath);
copyFileSync(png, pngPath);
rmSync(temporaryDir, { recursive: true, force: true });
console.log(`Generated ${pngPath} with DCS-Common.`);
