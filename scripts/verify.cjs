#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE = '/opt/data/repositorios/2026-07-28-tinytag';
let ok = 0, fail = 0;
function check(label, fn) {
  try { fn(); console.log(`  PASS  ${label}`); ok++; }
  catch (e) { console.log(`  FAIL  ${label}  ${e.message}`); fail++; }
}
console.log('=== TinyTag Ad-Hoc Verification ===\n');
check('API dist exists', () => {
  if (!fs.existsSync(path.join(BASE, 'apps/api/dist/main.js'))) throw 'dist/main.js missing';
});
check('Web dist exists', () => {
  const d = path.join(BASE, 'apps/web/dist/web/browser');
  if (!fs.readdirSync(d).some(f => f.startsWith('main-') && f.endsWith('.js'))) throw 'no main-*.js';
});
check('API rebuild (tsc)', () => {
  execSync('../../node_modules/.bin/tsc', { cwd: path.join(BASE, 'apps/api'), stdio: 'pipe', timeout: 60000 });
});
check('Web rebuild (ng build)', () => {
  execSync('../../node_modules/.bin/ng build', { cwd: path.join(BASE, 'apps/web'), stdio: 'pipe', timeout: 120000 });
});
check('API has auth+links module', () => {
  const auth = fs.readFileSync(path.join(BASE, 'apps/api/dist/auth/auth.module.js'), 'utf8');
  const links = fs.readFileSync(path.join(BASE, 'apps/api/dist/links/links.module.js'), 'utf8');
  const clicks = fs.readFileSync(path.join(BASE, 'apps/api/dist/clicks/clicks.module.js'), 'utf8');
  if (!auth.includes('AuthModule') || !links.includes('LinksModule') || !clicks.includes('ClicksModule')) throw 'modules missing';
});
check('All routes defined', () => {
  const r = fs.readFileSync(path.join(BASE, 'apps/web/src/app/app.routes.ts'), 'utf8');
  for (const p of ['login','register','dashboard','campaigns','settings','expired','404',':alias'])
    if (!r.includes(`path: '${p}'`)) throw `/${p} missing`;
});
check('Docs exist', () => {
  for (const d of ['ARCHITECTURE.md','API.md','FRONTEND.md'])
    if (!fs.existsSync(path.join(BASE, 'docs', d))) throw `${d} missing`;
});
console.log(`\nResult: ${ok} passed, ${fail} failed out of ${ok+fail}`);
process.exit(fail > 0 ? 1 : 0);
