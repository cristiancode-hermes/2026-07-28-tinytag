#!/usr/bin/env node
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const fs = require('fs');
const path = require('path');

async function build(cssPath) {
  const absPath = path.resolve(cssPath);
  const source = fs.readFileSync(absPath, 'utf8');
  console.log('Processing:', path.basename(cssPath), '-', (source.length/1024).toFixed(1)+'KB');
  const result = await postcss([tailwindcss()]).process(source, { from: absPath });
  fs.writeFileSync(absPath, result.css, 'utf8');
  const sizeKB = (result.css.length / 1024).toFixed(1);
  console.log('Done:', sizeKB+'KB written');
  console.log('  @theme:', result.css.includes('@theme') ? '❌ REMAINS' : '✅ cleaned');
  console.log('  .flex:', result.css.includes('.flex') ? '✅ generated' : '⚠️ missing');
  return result.css;
}

const cssFile = process.argv[2];
if (!cssFile) { console.error('Usage: node build-css.js <path/to/styles.css>'); process.exit(1); }
build(cssFile).catch(e => { console.error('Failed:', e.message); process.exit(1); });
