// Moves static style="…" attributes in the main web app into public/inline-styles.css.
//
// The page CSP (style-src 'self') blocks inline style attributes; csp-styles.js
// re-applies them at runtime, but every one still logs a CSP violation. This script
// replaces each static attribute with data-s="<keys>" and writes one rule per
// declaration. Rules use [data-s~="key"]:not(#\#):not(#\#), specificity (2,1,0): above
// every normal rule in styles.css (at most one id per selector) and, being normal
// declarations, below any author !important rule — the same place inline styles had.
//
// Everything else becomes data-style="…", which csp-styles.js applies through the
// CSSOM exactly as it applied the blocked style attribute, without a CSP violation:
//  - values with template expressions (computed colours, widths);
//  - display:none, which scripts clear with element.style.display='' to show an element;
//  - elements where a longhand precedes its shorthand (rule order could not express it).
//
// Usage: node scripts/convert-inline-styles.js [--check]
//   --check  exit 1 if any style attribute remains (no files are written).
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';

const CHECK = process.argv.includes('--check');
const FILES = ['public/index.html', 'public/app.js', 'public/tool-modal.js', ...readdirSync('public/app').filter(n => n.endsWith('.js')).sort().map(n => `public/app/${n}`)];
const CSS_FILE = 'public/inline-styles.css';
const NOT_ID = ':not(#\\#):not(#\\#)';

function splitDeclarations(text) {
  const parts = [];
  let depth = 0, quote = null, cur = '';
  for (const ch of text) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
}

function parseStyle(value) {
  const decls = [];
  for (const part of splitDeclarations(value)) {
    const i = part.indexOf(':');
    if (i < 1) return null;
    const prop = part.slice(0, i).trim().toLowerCase();
    const val = part.slice(i + 1).trim();
    if (!/^(?:--[a-z0-9-]+|-?[a-z][a-z-]*)$/.test(prop) || !val || /[{}<>]/.test(val)) return null;
    decls.push({prop, val});
  }
  // Last declaration of a property wins, as in a style attribute.
  const last = new Map();
  decls.forEach((d, i) => last.set(d.prop, i));
  return decls.filter((d, i) => last.get(d.prop) === i);
}

// Prefix matches that are not shorthand/longhand pairs (the shorthand does not reset them).
const NOT_RESET = {border: /^border-(?:radius|.*-radius|collapse|spacing)$/, flex: /^flex-(?:direction|wrap|flow)$/, grid: /^grid-(?:column|row|area)/};
const isShorthandOf = (short, long) => long !== short && long.startsWith(short + '-') && !NOT_RESET[short]?.test(long);
const depth = prop => (prop.startsWith('--') ? 0 : prop.split('-').length);

const keyOf = new Map(); // "prop:val" -> key
const usedKeys = new Set();
function key(prop, val) {
  const id = `${prop}:${val}`;
  if (keyOf.has(id)) return keyOf.get(id);
  let slug = `${prop}-${val}`.toLowerCase().replace(/var\(--/g, '').replace(/[^a-z0-9.%-]+/g, '-').replace(/\./g, '_').replace(/%/g, 'pc').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  let k = slug, n = 2;
  while (usedKeys.has(k)) k = `${slug}-${n++}`;
  usedKeys.add(k);
  keyOf.set(id, k);
  return k;
}

// End of an attribute value that starts at `from` and is closed by `q`, skipping
// ${…} template expressions (which may contain quotes of their own).
function valueEnd(text, from, q) {
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text.startsWith('${', i)) { depth++; i++; continue; }
    if (depth) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      continue;
    }
    if (text.startsWith(q, i)) return i;
    if (text[i] === '\n' || text[i] === '<' || text[i] === '>') return -1;
  }
  return -1;
}

function convertAttribute(value, q) {
  const decls = !value.includes('${') && !value.includes('\\') ? parseStyle(value) : null;
  if (!decls) return null;
  for (let i = 0; i < decls.length; i++) for (let j = i + 1; j < decls.length; j++) {
    if (isShorthandOf(decls[j].prop, decls[i].prop)) return null;
  }
  const keep = decls.filter(d => d.prop === 'display' && d.val === 'none');
  const move = decls.filter(d => !keep.includes(d));
  if (!move.length) return null;
  const keys = move.map(d => { const k = key(d.prop, d.val); rules.set(k, d); return k; });
  const rest = keep.length ? ` data-style=${q}${keep.map(d => `${d.prop}:${d.val}`).join(';')}${q}` : '';
  return `data-s=${q}${keys.join(' ')}${q}${rest}`;
}

const rules = new Map(); // key -> {prop, val}
let converted = 0, runtime = 0;
const changed = [];
for (const file of FILES) {
  const text = readFileSync(file, 'utf8');
  let out = '', pos = 0;
  for (const m of text.matchAll(/(?<=\s)style=(\\?["'])/g)) {
    if (m.index < pos) continue;
    const q = m[1];
    const start = m.index + m[0].length;
    const end = valueEnd(text, start, q);
    if (end < 0) continue;
    const value = text.slice(start, end);
    if (!value.trim()) continue;
    const replacement = convertAttribute(value, q);
    if (replacement) converted++; else runtime++;
    out += text.slice(pos, m.index) + (replacement ?? `data-style=${q}${value}${q}`);
    pos = end + q.length;
  }
  out += text.slice(pos);
  if (out !== text) changed.push([file, out]);
}

const sorted = [...rules].sort(([ka, a], [kb, b]) => depth(a.prop) - depth(b.prop) || ka.localeCompare(kb));
const css = `/* Generated by scripts/convert-inline-styles.js from the style="" attributes that
   used to sit in index.html and the app templates (the CSP blocks inline styles).
   Specificity (2,1,0) keeps these above normal rules in styles.css, as inline styles were.
   Shorthands come first so a longhand on the same element still overrides them.
   Prefer a named class in styles.css for new markup; edit values here only with care. */
${sorted.map(([k, d]) => `[data-s~="${k}"]${NOT_ID}{${d.prop}:${d.val}}`).join('\n')}
`;

if (CHECK) {
  console.log(JSON.stringify({styleAttributes: converted + runtime, toRules: converted, toDataStyle: runtime}));
  process.exit(converted + runtime ? 1 : 0);
}
// Merge with rules already generated by an earlier run.
let existing = '';
try { existing = readFileSync(CSS_FILE, 'utf8'); } catch {}
if (existing) {
  for (const m of existing.matchAll(/^\[data-s~="([^"]+)"\]\S*?\{([^:]+):(.*)\}$/gm)) if (!rules.has(m[1])) rules.set(m[1], {prop: m[2], val: m[3]});
}
const merged = [...rules].sort(([ka, a], [kb, b]) => depth(a.prop) - depth(b.prop) || ka.localeCompare(kb));
writeFileSync(CSS_FILE, css.slice(0, css.indexOf('*/') + 3) + merged.map(([k, d]) => `[data-s~="${k}"]${NOT_ID}{${d.prop}:${d.val}}`).join('\n') + '\n');
for (const [file, out] of changed) writeFileSync(file, out);
console.log(JSON.stringify({converted, runtime, rules: rules.size, files: changed.map(([f]) => f)}));
