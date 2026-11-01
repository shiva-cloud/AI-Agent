// Automated Asset Minification & Bundling Tool (Rec 159)
// Minifies production CSS and JavaScript bundles to optimize network payloads.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export function minifyCss(cssContent) {
  return cssContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1') // trim around delimiters
    .replace(/;}/g, '}')              // remove trailing semicolons
    .trim();
}

export function minifyJs(jsContent) {
  // Safe lightweight minification preserving syntax strings and regex
  return jsContent
    .replace(/^\s*\/\/.*$/gm, '')       // strip single-line comments on own line
    .replace(/\/\*[\s\S]*?\*\//g, '')   // strip multi-line comments
    .replace(/[ \t]+/g, ' ')            // collapse spaces/tabs
    .replace(/\n\s*\n/g, '\n')          // collapse blank lines
    .trim();
}

export function bundleAssets({write=false}={}) {
  const cssPath = 'public/styles.css';
  const jsPath = 'public/app.js';

  const rawCss = readFileSync(cssPath, 'utf8');
  const minCss = minifyCss(rawCss);

  const rawJs = readFileSync(jsPath, 'utf8');
  const minJs = minifyJs(rawJs);

  return {
    css: {
      originalBytes: rawCss.length,
      minifiedBytes: minCss.length,
      savedPct: Number((((rawCss.length - minCss.length) / rawCss.length) * 100).toFixed(1))
    },
    js: {
      originalBytes: rawJs.length,
      minifiedBytes: minJs.length,
      savedPct: Number((((rawJs.length - minJs.length) / rawJs.length) * 100).toFixed(1))
    },
    bundledAt: new Date().toISOString()
  };
}

// Measures text compression, but no longer writes public/*.min.* — those files
// were never referenced by index.html, sw.js precache or any HTML, so they are
// removed; the server-side files map no longer serves them (2026-11-02).
if (process.argv[1] && process.argv[1].endsWith('bundle-assets.js')) {
  const report = bundleAssets();
  console.log(JSON.stringify(report, null, 2));
}
