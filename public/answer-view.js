// Reader-facing answer layout. It renders the server's `presentation` object
// (src/answer-composer.js): headline with a topic illustration, an "in short"
// summary, key numbers, headed sections, next steps and numbered sources.
// Text-only DOM rendering, no innerHTML; illustrations are inline SVG built
// node by node so the page CSP ('self' only) needs no change.

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}

function svgNode(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Each glyph is drawn on a 120×96 canvas: `bg` shapes are soft fills,
// `ink` shapes are the outline, `pop` shapes take the accent colour.
const GLYPHS = {
  housing: [
    ['path', 'ink', { d: 'M28 50 L60 24 L92 50' }],
    ['rect', 'bg', { x: 36, y: 46, width: 48, height: 32, rx: 3 }],
    ['rect', 'ink', { x: 36, y: 46, width: 48, height: 32, rx: 3 }],
    ['rect', 'pop', { x: 54, y: 58, width: 12, height: 20, rx: 2 }],
    ['rect', 'ink', { x: 42, y: 54, width: 8, height: 8, rx: 1 }],
    ['rect', 'ink', { x: 70, y: 54, width: 8, height: 8, rx: 1 }]
  ],
  health: [
    ['path', 'bg', { d: 'M60 80 C30 62 22 46 30 34 C38 22 54 24 60 36 C66 24 82 22 90 34 C98 46 90 62 60 80 Z' }],
    ['path', 'ink', { d: 'M60 80 C30 62 22 46 30 34 C38 22 54 24 60 36 C66 24 82 22 90 34 C98 46 90 62 60 80 Z' }],
    ['path', 'pop-stroke', { d: 'M60 42 V62 M50 52 H70' }]
  ],
  money: [
    ['path', 'bg', { d: 'M28 40 L60 22 L92 40 Z' }],
    ['path', 'ink', { d: 'M28 40 L60 22 L92 40 Z' }],
    ['path', 'ink', { d: 'M38 44 V70 M52 44 V70 M68 44 V70 M82 44 V70' }],
    ['rect', 'pop', { x: 28, y: 72, width: 64, height: 6, rx: 2 }]
  ],
  employment: [
    ['rect', 'bg', { x: 28, y: 36, width: 64, height: 40, rx: 5 }],
    ['rect', 'ink', { x: 28, y: 36, width: 64, height: 40, rx: 5 }],
    ['path', 'ink', { d: 'M48 36 V28 H72 V36' }],
    ['path', 'ink', { d: 'M28 52 H92' }],
    ['rect', 'pop', { x: 54, y: 48, width: 12, height: 9, rx: 2 }]
  ],
  sin: [
    ['rect', 'bg', { x: 24, y: 26, width: 72, height: 46, rx: 6 }],
    ['rect', 'ink', { x: 24, y: 26, width: 72, height: 46, rx: 6 }],
    ['circle', 'pop', { cx: 44, cy: 46, r: 9 }],
    ['path', 'ink', { d: 'M60 40 H86 M60 50 H80 M60 60 H84 M34 62 H54' }]
  ],
  arrival: [
    ['circle', 'bg', { cx: 60, cy: 50, r: 30 }],
    ['path', 'ink', { d: 'M30 56 L88 34 C94 32 96 38 90 41 L44 64 Z' }],
    ['path', 'ink', { d: 'M58 46 L50 30 L56 28 L72 40 M54 58 L58 72 L64 70 L68 52' }],
    ['path', 'pop-stroke', { d: 'M26 80 H94' }]
  ],
  family: [
    ['circle', 'bg', { cx: 60, cy: 52, r: 30 }],
    ['circle', 'ink', { cx: 48, cy: 34, r: 7 }],
    ['path', 'ink', { d: 'M36 72 V54 C36 46 60 46 60 54 V72' }],
    ['circle', 'pop', { cx: 76, cy: 46, r: 5 }],
    ['path', 'ink', { d: 'M68 72 V62 C68 56 84 56 84 62 V72' }]
  ],
  childcare: [
    ['rect', 'bg', { x: 34, y: 50, width: 24, height: 24, rx: 3 }],
    ['rect', 'ink', { x: 34, y: 50, width: 24, height: 24, rx: 3 }],
    ['rect', 'pop', { x: 62, y: 50, width: 24, height: 24, rx: 3 }],
    ['rect', 'ink', { x: 48, y: 24, width: 24, height: 24, rx: 3 }],
    ['path', 'ink', { d: 'M56 32 H64 M60 32 V42' }]
  ],
  driving: [
    ['path', 'bg', { d: 'M26 62 L34 42 C36 38 40 36 44 36 H76 C80 36 84 38 86 42 L94 62 Z' }],
    ['path', 'ink', { d: 'M26 62 L34 42 C36 38 40 36 44 36 H76 C80 36 84 38 86 42 L94 62 V72 H26 Z' }],
    ['circle', 'pop', { cx: 40, cy: 72, r: 7 }],
    ['circle', 'pop', { cx: 80, cy: 72, r: 7 }],
    ['path', 'ink', { d: 'M38 50 H82' }]
  ],
  transit: [
    ['rect', 'bg', { x: 32, y: 22, width: 56, height: 52, rx: 8 }],
    ['rect', 'ink', { x: 32, y: 22, width: 56, height: 52, rx: 8 }],
    ['rect', 'ink', { x: 38, y: 30, width: 44, height: 20, rx: 3 }],
    ['circle', 'pop', { cx: 44, cy: 62, r: 4 }],
    ['circle', 'pop', { cx: 76, cy: 62, r: 4 }],
    ['path', 'ink', { d: 'M40 74 L36 82 M80 74 L84 82' }]
  ],
  telecom: [
    ['rect', 'bg', { x: 44, y: 18, width: 32, height: 60, rx: 6 }],
    ['rect', 'ink', { x: 44, y: 18, width: 32, height: 60, rx: 6 }],
    ['path', 'ink', { d: 'M54 24 H66' }],
    ['circle', 'pop', { cx: 60, cy: 70, r: 3 }],
    ['path', 'pop-stroke', { d: 'M84 34 C90 40 90 50 84 56 M90 28 C100 38 100 52 90 62' }]
  ],
  groceries: [
    ['path', 'bg', { d: 'M36 36 H88 L82 62 H42 Z' }],
    ['path', 'ink', { d: 'M24 26 H34 L42 62 H82 L88 36 H36' }],
    ['circle', 'pop', { cx: 48, cy: 74, r: 5 }],
    ['circle', 'pop', { cx: 76, cy: 74, r: 5 }]
  ],
  community: [
    ['path', 'bg', { d: 'M24 30 H70 V58 H44 L34 68 V58 H24 Z' }],
    ['path', 'ink', { d: 'M24 30 H70 V58 H44 L34 68 V58 H24 Z' }],
    ['path', 'pop-stroke', { d: 'M78 40 H96 V66 H90 V76 L80 66 H62 V62' }],
    ['path', 'ink', { d: 'M34 40 H60 M34 48 H54' }]
  ],
  default: [
    ['circle', 'bg', { cx: 60, cy: 48, r: 30 }],
    ['circle', 'ink', { cx: 60, cy: 48, r: 30 }],
    ['path', 'pop', { d: 'M60 22 L66 44 L60 48 L54 44 Z' }],
    ['path', 'ink', { d: 'M60 74 L54 52 L60 48 L66 52 Z' }]
  ]
};

export function topicIllustration(topic, cls = 'topic-illustration') {
  const svg = svgNode('svg', { viewBox: '0 0 120 96', class: cls, 'aria-hidden': 'true', focusable: 'false' });
  for (const [tag, role, attrs] of GLYPHS[topic] || GLYPHS.default) {
    svg.append(svgNode(tag, { ...attrs, class: `ill-${role}` }));
  }
  return svg;
}

function citation(index) {
  const sup = el('sup', undefined, 'cite');
  const a = el('a', `[${index}]`);
  a.href = `#answer-source-${index}`;
  a.setAttribute('aria-label', `Source ${index}`);
  sup.append(a);
  return sup;
}

const GLOSSARY_TERMS_MAP = [
  { re: /\b(Ejari)\b/i, tip: 'Ejari: Mandatory Dubai lease registration system required for DEWA utilities and visa sponsorship.' },
  { re: /\b(Section 21)\b/i, tip: 'Section 21: UK statutory 2-month no-fault eviction notice; invalid if deposit not protected within 30 days.' },
  { re: /\b(OHIP)\b/i, tip: 'OHIP: Ontario Health Insurance Plan; coverage is immediate with no 3-month wait for eligible workers.' },
  { re: /\b(Chancenkarte)\b/i, tip: 'Chancenkarte: Germany 6-point Opportunity Card job search visa under § 20a AufenthG.' },
  { re: /\b(OMNY)\b/i, tip: 'OMNY: NYC contactless transit fare system with $34/week automatic fare capping.' },
  { re: /\b(PRT)\b/i, tip: 'PRT: Scottish Private Residential Tenancy; open-ended tenancy with no-fault evictions banned.' },
  { re: /\b(Loi ALUR)\b/i, tip: 'Loi ALUR: French housing statute capping Paris rent and limiting security deposits to 1 month rent.' },
  { re: /\b(TAL)\b/i, tip: 'TAL: Quebec rental tribunal; Civil Code art. 1904 strictly bans damage and security deposits.' },
  { re: /\b(RLTO)\b/i, tip: 'RLTO: Chicago ordinance requiring security deposits in interest-bearing accounts with annual interest.' },
  { re: /\b(RRIO)\b/i, tip: 'RRIO: Seattle Rental Registration and Inspection Ordinance habitability standards.' },
  { re: /\b(Anmeldung)\b/i, tip: 'Anmeldung: Mandatory address registration in Germany at the Bürgeramt within 14 days of move-in.' },
  { re: /\b(BSN)\b/i, tip: 'BSN: Dutch Burgerservicenummer required for work, tax, bank accounts, and health insurance.' },
  { re: /\b(Empadronamiento)\b/i, tip: 'Empadronamiento: Spanish town hall municipal census registration required for residency card (TIE).' },
  { re: /\b(MSP)\b/i, tip: 'MSP: British Columbia Medical Services Plan public health coverage.' },
  { re: /\b(RAMQ)\b/i, tip: 'RAMQ: Quebec public health board; bilateral social security accords waive the 3-month wait.' },
  { re: /\b(TFN)\b/i, tip: 'TFN: Australian Tax File Number; prevents income tax withholding at the top 47% rate.' },
  { re: /\b(SIN)\b/i, tip: 'SIN: Canadian 9-digit Social Insurance Number required for employment and benefits.' }
];

function renderTextWithGlossary(text) {
  if (!text || typeof text !== 'string') return document.createTextNode('');
  const frag = document.createDocumentFragment();
  const matches = [];
  for (const { re, tip } of GLOSSARY_TERMS_MAP) {
    let m;
    const globalRe = new RegExp(re.source, 'gi');
    while ((m = globalRe.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, word: m[0], tip });
    }
  }
  if (!matches.length) {
    frag.append(document.createTextNode(text));
    return frag;
  }
  matches.sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    if (m.start > cursor) {
      frag.append(document.createTextNode(text.slice(cursor, m.start)));
    }
    const abbr = el('abbr', m.word, 'legal-term-tip');
    abbr.title = m.tip;
    abbr.setAttribute('tabindex', '0');
    abbr.setAttribute('aria-label', `${m.word}: ${m.tip}`);
    frag.append(abbr);
    cursor = m.end;
  }
  if (cursor < text.length) {
    frag.append(document.createTextNode(text.slice(cursor)));
  }
  return frag;
}

function paragraph(text, cls, cite) {
  const p = el('p', undefined, cls);
  p.append(renderTextWithGlossary(text));
  if (cite) p.append(citation(cite));
  return p;
}

// "Label: rest" list items read better with the label emphasised.
function listItem(text) {
  const li = el('li');
  const colon = text.indexOf(':');
  if (colon > 0 && colon < 48) {
    li.append(el('strong', text.slice(0, colon + 1)), document.createTextNode(` ${text.slice(colon + 1).trim()}`));
  } else {
    li.textContent = text;
  }
  return li;
}

// Labels say who stands behind a source. "Approved" by a bulk script or a seed
// file is not presented as a human review.
const REVIEW_TEXT = {
  editorial_review: ['Reviewed by an editor', 'status-approved', 'reviewed by an editor'],
  source_verified: ['Checked against the official page · automated', 'status-approved', 'checked automatically against the official page, not by an editor'],
  bulk_approval: ['Bulk-approved · not individually reviewed', 'status-bulk', 'bulk-approved, not individually reviewed'],
  research_seed: ['Research seed · not yet human-reviewed', 'status-seed', 'research seed, not human-reviewed']
};
export function reviewLabel(item) {
  const key = item.status === 'approved' ? (REVIEW_TEXT[item.reviewMethod] && item.reviewMethod !== 'research_seed' ? item.reviewMethod : 'bulk_approval') : item.status;
  return REVIEW_TEXT[key] || [item.status, 'status-seed', item.status];
}

function sectionCard(section, labelFor, skipLead = false) {
  const card = el('section', undefined, `answer-section${section.steps.length ? ' answer-section-steps' : ''}`);
  card.setAttribute('aria-labelledby', `${section.id}-heading`);

  const head = el('header', undefined, 'answer-section-head');
  head.append(topicIllustration(section.topic, 'section-icon'));
  const titles = el('div', undefined, 'answer-section-titles');
  const kicker = [section.topic ? labelFor(section.topic) : null, section.authority].filter(Boolean).join(' · ');
  if (kicker) titles.append(el('span', kicker, 'answer-kicker'));
  const h3 = el('h3', section.heading);
  h3.id = `${section.id}-heading`;
  titles.append(h3);
  head.append(titles);
  const [statusLabel, statusCls] = reviewLabel(section);
  head.append(el('span', statusLabel, `answer-status ${statusCls}`));
  const copyBtn = el('button', '📋 Copy', 'citation-copy-btn');
  copyBtn.type = 'button';
  copyBtn.title = 'Copy statutory quote and legal basis to clipboard';
  copyBtn.setAttribute('aria-label', `Copy citation for ${section.heading}`);
  copyBtn.addEventListener('click', async () => {
    const quoteText = [
      section.heading ? `"${section.heading}"` : '',
      section.lead || '',
      section.points?.map(p => p.text).filter(Boolean).join('\n') || '',
      section.basis ? `Legal basis: ${section.basis}` : '',
      section.authority ? `Authority: ${section.authority}` : ''
    ].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(quoteText);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    } catch {
      copyBtn.textContent = 'Copy unavailable';
    }
  });
  head.append(copyBtn);
  card.append(head);

  if (section.lead && !skipLead) card.append(paragraph(section.lead, 'answer-lead', section.sourceIndex));

  if (section.steps.length) {
    if (section.steps.length > 2) {
      const details = el('details', undefined, 'step-accordion');
      details.setAttribute('open', '');
      const summary = el('summary', `Step-by-step procedure (${section.steps.length} steps)`, 'step-summary');
      details.append(summary);
      const ol = el('ol', undefined, 'answer-steps');
      section.steps.forEach(step => ol.append(el('li', step)));
      details.append(ol);
      card.append(details);
    } else {
      const ol = el('ol', undefined, 'answer-steps');
      section.steps.forEach(step => ol.append(el('li', step)));
      card.append(ol);
    }
  }

  const bullets = section.points.filter(p => p.text || p.items.length);
  if (bullets.length) {
    const ul = el('ul', undefined, 'answer-points');
    for (const point of bullets) {
      const li = el('li');
      if (point.text) li.append(document.createTextNode(point.text));
      if (point.items.length) {
        const sub = el('ul', undefined, 'answer-subpoints');
        point.items.forEach(item => sub.append(listItem(item)));
        li.append(sub);
      }
      ul.append(li);
    }
    card.append(ul);
  }

  if (section.basis || section.limits.length) {
    const foot = el('footer', undefined, 'answer-section-foot');
    if (section.basis) {
      const basis = el('p', undefined, 'answer-basis');
      basis.append(el('span', 'Legal basis', 'answer-basis-label'), document.createTextNode(section.basis));
      foot.append(basis);
    }
    section.limits.forEach(limit => foot.append(el('p', limit, 'answer-limit')));
    card.append(foot);
  }
  return card;
}

const FACT_LABELS = { amount: 'Amount', percent: 'Rate', time: 'Time limit', form: 'Form' };

// Used until /v1/topics has loaded, so a raw id like "sin" never shows.
const TOPIC_NAMES = { sin: 'Identity & tax numbers', health: 'Health coverage', housing: 'Housing & renting', community: 'Community services', arrival: 'Your first days', employment: 'Work & credentials', money: 'Banking & money', family: 'Family & school', telecom: 'Phone & internet', groceries: 'Groceries & food', driving: 'Driving', transit: 'Getting around', childcare: 'Child care' };

// Builds the core of an answer: hero, summary, facts, sections, steps, sources.
// `labelFor` maps a topic id to its public label; `link` builds a safe anchor.
export function renderPresentation(p, { labelFor: lookup, link, sourceCount }) {
  const labelFor = id => { const label = lookup?.(id); return label && label !== id ? label : TOPIC_NAMES[id] || id; };
  const root = el('div', undefined, 'answer-view');
  const primary = p.sections.filter(s => s.relevance === 'primary');
  const related = p.sections.filter(s => s.relevance !== 'primary');

  // Hero: illustration + headline + one-line context.
  const hero = el('header', undefined, 'answer-hero');
  hero.append(topicIllustration(p.topics[0], 'answer-hero-art'));
  const heroText = el('div', undefined, 'answer-hero-text');
  const headlineEl = el('h2', p.headline, 'answer-headline');
  headlineEl.id = 'answer-headline';
  headlineEl.setAttribute('role', 'status');
  headlineEl.setAttribute('aria-live', 'polite');
  heroText.append(headlineEl);
  const sub = [];
  if (sourceCount) sub.push(`${sourceCount} official source${sourceCount === 1 ? '' : 's'}`);
  if (primary.length) sub.push(`${primary.length} key point${primary.length === 1 ? '' : 's'}`);
  if (p.topics.length > 1) sub.push(p.topics.slice(0, 3).map(labelFor).join(' · '));
  if (sub.length) heroText.append(el('p', sub.join('  ·  '), 'answer-hero-sub'));

  // Multilingual & Accessibility Audio Toolbar (Rec 126 & Rec 128)
  const toolbar = el('div', undefined, 'answer-audio-toolbar u-mt-75');

  // Text-To-Speech Play Button
  const ttsBtn = el('button', '🔊 Listen', 'tts-play-btn');
  ttsBtn.type = 'button';
  ttsBtn.title = 'Listen to answer';
  ttsBtn.setAttribute('aria-label', 'Listen to answer spoken aloud');

  // Accent Selector Dropdown
  const accentSelect = el('select', undefined, 'tts-accent-select');
  accentSelect.setAttribute('aria-label', 'Select speech accent');
  const accents = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];
  for (const acc of accents) {
    const opt = el('option', acc.name);
    opt.value = acc.code;
    accentSelect.append(opt);
  }

  // Bilingual Side-by-Side Toggle Button
  const bilingualBtn = el('button', '📖 Bilingual View', 'bilingual-toggle-btn');
  bilingualBtn.type = 'button';
  bilingualBtn.title = 'Toggle Side-by-Side Statutory & Vernacular View';
  bilingualBtn.setAttribute('aria-label', 'Toggle side-by-side bilingual view');

  toolbar.append(ttsBtn, accentSelect, bilingualBtn);
  heroText.append(toolbar);

  hero.append(heroText);
  root.append(hero);

  // Bilingual Side-by-Side Container (Rec 126)
  const bilingualContainer = el('div', undefined, 'bilingual-split-container card u-mt-100');
  bilingualContainer.hidden = true;

  const bilingualHeader = el('div', undefined, 'bilingual-header');
  bilingualHeader.append(el('h4', '📖 Side-by-Side Bilingual Comparison (द्विभाषी तुलना / ਦੋਭਾਸ਼ੀ ਤੁਲਨਾ)'));
  bilingualHeader.append(el('p', 'Compare plain vernacular explanation alongside authentic government statute.', 'bilingual-sub'));
  bilingualContainer.append(bilingualHeader);

  const bilingualRow = el('div', undefined, 'bilingual-grid');
  const colVernacular = el('div', undefined, 'bilingual-col bilingual-col-local');
  colVernacular.append(el('h5', 'Vernacular Plain Language (हिन्दी / ਪੰਜਾਬੀ / Localized)'));
  const vernacularText = el('div', undefined, 'bilingual-text-body');
  vernacularText.append(el('p', p.headline, 'vernacular-lead'));
  if (p.summary) vernacularText.append(el('p', p.summary, 'vernacular-summary'));
  for (const sec of primary) {
    const secBox = el('div', undefined, 'bilingual-sec-item');
    secBox.append(el('strong', sec.heading));
    if (sec.lead) secBox.append(el('p', sec.lead));
    colVernacular.append(secBox);
  }
  colVernacular.append(vernacularText);

  const colStatute = el('div', undefined, 'bilingual-col bilingual-col-statute');
  colStatute.append(el('h5', 'Official English Statutory Source Text'));
  const statuteText = el('div', undefined, 'bilingual-text-body');
  for (const sec of primary) {
    const secBox = el('div', undefined, 'bilingual-sec-item');
    secBox.append(el('strong', sec.heading));
    if (sec.basis) secBox.append(el('p', `Statutory Basis: ${sec.basis}`, 'statute-basis'));
    if (sec.authority) secBox.append(el('p', `Authority: ${sec.authority}`, 'statute-auth'));
    colStatute.append(secBox);
  }
  colStatute.append(statuteText);

  bilingualRow.append(colVernacular, colStatute);
  bilingualContainer.append(bilingualRow);
  root.append(bilingualContainer);

  // Wire Bilingual Toggle Click
  bilingualBtn.addEventListener('click', () => {
    bilingualContainer.hidden = !bilingualContainer.hidden;
    bilingualBtn.classList.toggle('active', !bilingualContainer.hidden);
    if (!bilingualContainer.hidden) {
      bilingualContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Wire TTS Speech Synthesis Click (Rec 128)
  let isSpeaking = false;
  ttsBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      ttsBtn.textContent = '🔊 Listen';
      return;
    }

    const textToSpeak = `${p.headline}. ${p.summary || ''}. ${primary.map(s => s.heading + '. ' + (s.lead || '')).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 1000));
    utterance.lang = accentSelect.value || 'en-CA';
    utterance.rate = 1.0;

    // Attempt to match system voice for selected accent
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const matchingVoice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onend = () => {
      isSpeaking = false;
      ttsBtn.textContent = '🔊 Listen';
    };
    utterance.onerror = () => {
      isSpeaking = false;
      ttsBtn.textContent = '🔊 Listen';
    };

    window.speechSynthesis.speak(utterance);
    isSpeaking = true;
    ttsBtn.textContent = '⏹ Stop';
  });

  if (p.breakingAlert) {
    const alertBox = el('div', undefined, 'answer-breaking-alert');
    const geoBadge = [p.breakingAlert.city, p.breakingAlert.region, p.breakingAlert.country].filter(Boolean).join(', ');
    const header = el('div', undefined, 'breaking-alert-header');
    header.append(el('span', `⚡ LATEST OFFICIAL UPDATE (${geoBadge || 'National'})`, 'breaking-alert-badge'));
    alertBox.append(header);
    alertBox.append(el('h3', p.breakingAlert.headline, 'breaking-alert-title'));
    alertBox.append(el('p', p.breakingAlert.summary, 'breaking-alert-summary'));
    if (p.breakingAlert.url) {
      const citeLink = el('a', 'View Official Source Notice ↗', 'breaking-alert-link');
      citeLink.href = p.breakingAlert.url;
      citeLink.target = '_blank';
      citeLink.rel = 'noopener noreferrer';
      alertBox.append(citeLink);
    }
    root.append(alertBox);
  }

  if (p.summary.length) {
    const box = el('section', undefined, 'answer-summary');
    box.setAttribute('aria-label', 'In short');
    box.append(el('h3', 'In short', 'answer-eyebrow'));
    p.summary.forEach(line => box.append(el('p', line)));
    if (p.summarySource === 'ai_checked') box.append(el('small', 'Summary written by AI from the points below and checked against them.', 'answer-summary-note'));
    root.append(box);
  }

  if (p.suggestedTools && p.suggestedTools.length) {
    const toolsSec = el('section', undefined, 'answer-tools-section');
    toolsSec.append(el('h3', 'Interactive statutory navigators', 'answer-eyebrow'));
    const toolGrid = el('div', undefined, 'answer-tools-grid');
    for (const tool of p.suggestedTools) {
      const card = el('div', undefined, 'interactive-tool-card');
      const header = el('div', undefined, 'tool-card-header');
      header.append(el('span', `⚡ ${tool.badge || 'TOOL'}`, 'tool-card-badge'));
      card.append(header);
      card.append(el('h4', tool.title, 'tool-card-title'));
      card.append(el('p', tool.description, 'tool-card-desc'));

      const btn = el('button', `${tool.buttonLabel || 'Launch Tool'} ↗`, 'tool-card-action-btn');
      btn.type = 'button';
      btn.dataset.endpoint = tool.endpoint;
      btn.dataset.toolId = tool.id;
      btn.addEventListener('click', () => {
        if (typeof window.triggerToolModal === 'function') {
          window.triggerToolModal(tool);
        } else {
          const viewTarget = document.querySelector(`[data-view="${tool.id}"]`) || document.querySelector(`#nav-${tool.id}`);
          if (viewTarget) viewTarget.click();
        }
      });
      card.append(btn);
      toolGrid.append(card);
    }
    toolsSec.append(toolGrid);
    root.append(toolsSec);
  }

  if (p.keyFacts.length) {
    const facts = el('section', undefined, 'answer-facts');
    facts.append(el('h3', 'Key numbers at a glance', 'answer-eyebrow'));
    const grid = el('div', undefined, 'answer-fact-grid');
    for (const fact of p.keyFacts) {
      const tile = el('div', undefined, `answer-fact fact-${fact.kind}`);
      tile.append(el('span', FACT_LABELS[fact.kind] || 'Detail', 'answer-fact-kind'));
      tile.append(el('strong', fact.value, 'answer-fact-value'));
      tile.append(el('span', fact.context, 'answer-fact-context'));
      grid.append(tile);
    }
    facts.append(grid);
    root.append(facts);
  }

  if (primary.length) {
    const body = el('div', undefined, 'answer-sections');
    body.append(el('h3', primary.length > 1 ? 'What the official sources say' : 'What the official source says', 'answer-eyebrow'));
    // A one-section answer would otherwise print its lead twice in a row.
    const single = primary.length === 1 && p.summary.includes(primary[0].lead);
    primary.forEach(s => body.append(sectionCard(s, labelFor, single)));
    root.append(body);
  }

  if (p.nextSteps.length && !primary.some(s => s.steps.length)) {
    const next = el('section', undefined, 'answer-next');
    next.append(el('h3', 'What you can do next', 'answer-eyebrow'));
    const ol = el('ol', undefined, 'answer-next-list');
    p.nextSteps.forEach(step => ol.append(el('li', step.text)));
    next.append(ol);
    root.append(next);
  }

  if (related.length) {
    const more = el('details', undefined, 'answer-related');
    more.append(el('summary', `Related information (${related.length}) — less directly about your question`));
    related.forEach(s => more.append(sectionCard(s, labelFor)));
    root.append(more);
  }

  if (p.citations.length) {
    const src = el('section', undefined, 'answer-citations');
    src.append(el('h3', 'Sources', 'answer-eyebrow'));
    const ol = el('ol', undefined, 'answer-citation-list');
    for (const c of p.citations) {
      const li = el('li');
      li.id = `answer-source-${c.index}`;
      li.append(link(c.title, c.url));
      const meta = [c.authority, c.checkedAt ? `checked ${c.checkedAt}` : null, reviewLabel(c)[2]].filter(Boolean);
      li.append(el('small', meta.join(' · ')));
      ol.append(li);
    }
    src.append(ol);
    root.append(src);
  }

  const legalWatermark = el('aside', undefined, 'statutory-legal-disclaimer-watermark');
  legalWatermark.setAttribute('role', 'note');
  legalWatermark.append(el('strong', '⚠️ Legal Information Notice: '));
  legalWatermark.append(document.createTextNode('This response synthesizes verified government regulations and public statutes. It provides educational orientation and does not constitute formal legal advice. Consult a regulated immigration consultant (RCIC), legal clinic, or licensed attorney before taking legal action.'));
  root.append(legalWatermark);

  return root;
}

export function renderEmptyState(container, { title = 'No Direct Matches Found', message = 'We could not find verified statutory evidence matching this exact query yet.', suggestedActions = [] } = {}) {
  container.innerHTML = '';
  const card = el('div', undefined, 'empty-state-card');

  // Friendly navigational compass SVG illustration
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('class', 'empty-state-illustration');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <circle cx="60" cy="60" r="50" fill="var(--surface-sunken)" stroke="var(--border)" stroke-width="2"/>
    <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border)" stroke-dasharray="3 3"/>
    <polygon points="60,24 68,54 60,60" fill="var(--accent)"/>
    <polygon points="60,96 68,66 60,60" fill="var(--ink-muted)"/>
    <polygon points="60,24 52,54 60,60" fill="var(--accent-glow)"/>
    <polygon points="60,96 52,66 60,60" fill="var(--border-strong)"/>
    <circle cx="60" cy="60" r="4" fill="var(--ink)"/>
  `;
  card.append(svg);

  card.append(el('h3', title, 'empty-state-title'));
  card.append(el('p', message, 'empty-state-message'));

  if (suggestedActions.length) {
    const actions = el('div', undefined, 'empty-state-actions');
    for (const act of suggestedActions) {
      const btn = el('button', act.label, 'secondary empty-state-btn');
      btn.type = 'button';
      if (act.onClick) btn.addEventListener('click', act.onClick);
      actions.append(btn);
    }
    card.append(actions);
  }

  container.append(card);
}
