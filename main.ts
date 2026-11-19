// Leonida Legend — the entry program (Node 22, standard library only).
//
// It hands the guide in: the static app under app/ and the screenshots under
// screenshots/ are copied into the output directory, and dossier.json is
// written there with make.fun's vendored library (vendor/makefun-frontend.ts,
// untouched). The grader runs this twice in a fresh container with no
// network, /output writable and the repository read-only; outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The dossier caps below are the scorer's own (reference/gate.json): only
// text_max_bytes shapes the bytes, the others refuse an entry the scorer
// would refuse. The output is deterministic: two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  const appOut = join(outputDir, 'app');
  const shotsOut = join(outputDir, 'screenshots');
  rmSync(appOut, { recursive: true, force: true });
  rmSync(shotsOut, { recursive: true, force: true });
  cpSync(join(repoRoot, 'app'), appOut, { recursive: true });
  const shotsIn = join(repoRoot, 'screenshots');
  if (existsSync(shotsIn)) cpSync(shotsIn, shotsOut, { recursive: true });
  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
