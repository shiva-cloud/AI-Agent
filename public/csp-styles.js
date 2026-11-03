// Applies `data-style="…"` (and any leftover `style="…"`) declarations, which the
// page CSP (style-src 'self') does not allow as inline style attributes.
//
// Static declarations from index.html and the app templates now live in
// inline-styles.css (scripts/convert-inline-styles.js). What remains are values
// computed in templates and display:none that scripts later clear; templates
// write them as data-style so the browser never parses (and reports) a blocked
// style attribute. Styles set through the CSSOM are not subject to the CSP, so
// this module copies each declaration onto element.style, once per element, as
// it appears in the document.
//
// Only plain values are copied. Anything that can load or execute something
// (url(), image-set(), expression(), @import, CSS escapes) is dropped, so an
// injected attribute cannot use this path to fetch resources or leak data.

const UNSAFE_VALUE = /url\s*\(|image-set\s*\(|image\s*\(|expression\s*\(|javascript:|@import|\\|[<>]/i;
const PROPERTY = /^-?[a-z][a-z-]*$/;

function declarations(text) {
  const out = [];
  let depth = 0, start = 0;
  // Split on semicolons outside brackets, so minmax(…;…) style values survive.
  for (let i = 0; i <= text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if ((ch === ';' && depth === 0) || i === text.length) {
      const part = text.slice(start, i).trim();
      start = i + 1;
      const colon = part.indexOf(':');
      if (colon < 1) continue;
      const name = part.slice(0, colon).trim().toLowerCase();
      let value = part.slice(colon + 1).trim();
      let priority = '';
      if (/!important$/i.test(value)) { priority = 'important'; value = value.replace(/\s*!important$/i, ''); }
      if ((PROPERTY.test(name) || /^--[\w-]+$/.test(name)) && value && !UNSAFE_VALUE.test(value)) out.push([name, value, priority]);
    }
  }
  return out;
}

const applied = new WeakSet();

function apply(el) {
  if (applied.has(el)) return;
  applied.add(el);
  const text = el.getAttribute('data-style') ?? el.getAttribute('style');
  // A non-empty CSSOM means the browser already honoured the attribute, or a
  // script styled the element first; either way the attribute is not applied.
  if (!text || el.style.length) return;
  for (const [name, value, priority] of declarations(text)) el.style.setProperty(name, value, priority);
}

const SELECTOR = '[data-style],[style]';

function scan(root) {
  if (root.nodeType !== 1) return;
  if (root.matches(SELECTOR)) apply(root);
  root.querySelectorAll(SELECTOR).forEach(apply);
}

scan(document.documentElement);
new MutationObserver(records => {
  for (const record of records) record.addedNodes.forEach(scan);
}).observe(document.documentElement, { childList: true, subtree: true });

export { declarations };
