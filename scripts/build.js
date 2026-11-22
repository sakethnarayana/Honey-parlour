#!/usr/bin/env node
/**
 * Production build: Excel → JSON, then copy the static site into dist/.
 * Netlify runs this via "npm run build" and publishes dist/.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// 1. Generate JSON from the workbook (exits non-zero on validation errors → build fails).
try {
  execFileSync(process.execPath, [path.join(__dirname, 'generate-data.js'), ...process.argv.slice(2)], { stdio: 'inherit' });
} catch {
  console.error('❌ Build stopped: fix the workbook errors listed above.');
  process.exit(1);
}

// 2. Fresh dist/ with the static files.
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const copy = (rel) => {
  const from = path.join(ROOT, rel);
  if (!fs.existsSync(from)) throw new Error(`Missing ${rel}`);
  fs.cpSync(from, path.join(DIST, rel), { recursive: true });
};
['index.html', 'src', 'assets'].forEach(copy);

// 3. Sanity check: every local reference in index.html must exist in dist/.
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(?!https?:|#|mailto:|tel:|data:)([^"]+)"/g)].map((m) => m[1].split(/[?#]/)[0]);
const missing = refs.filter((r) => r && !fs.existsSync(path.join(DIST, r)));
for (const f of ['services.json', 'settings.json']) {
  if (!fs.existsSync(path.join(DIST, 'src/data/generated', f))) missing.push(`src/data/generated/${f}`);
}
if (missing.length) {
  console.error(`❌ dist/ is missing referenced files:\n   ${missing.join('\n   ')}`);
  process.exit(1);
}

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`📦 Build complete → dist/ (${count(DIST)} files)\n`);
