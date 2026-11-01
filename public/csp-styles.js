// Applies `style="…"` attributes that the page CSP (style-src 'self') blocks.
//
// index.html and the tool views' HTML templates carry hundreds of inline
// style attributes. Browsers keep the attribute text but ignore it under this
// CSP, which flattened those layouts. Styles set through the CSSOM are not
// subject to that rule, so this module copies each blocked declaration onto
// element.style, once per element, as it appears in the document.
//
// Only plain values are copied. Anything that can load or execute something
// (url(), image-set(), expression(), @import, CSS escapes) is dropped, so an
// injected attribute cannot use this path to fetch resources or leak data.
// The long-term fix is moving these declarations into styles.css classes.

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
  const text = el.getAttribute('style');
  // A non-empty CSSOM means the browser already honoured the attribute.
  if (!text || el.style.length) return;
  for (const [name, value, priority] of declarations(text)) el.style.setProperty(name, value, priority);
}

function scan(root) {
  if (root.nodeType !== 1) return;
  if (root.hasAttribute('style')) apply(root);
  root.querySelectorAll('[style]').forEach(apply);
}

scan(document.documentElement);
new MutationObserver(records => {
  for (const record of records) record.addedNodes.forEach(scan);
}).observe(document.documentElement, { childList: true, subtree: true });

export { declarations };
