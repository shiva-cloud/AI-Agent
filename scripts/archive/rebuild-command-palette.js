import fs from 'node:fs';

const appPath = 'public/app.js';
let app = fs.readFileSync(appPath, 'utf8');

const startIdx = app.indexOf('const COMMAND_DIRECTORY = [');
const endIdx = app.indexOf('\nfunction setupSosSuite()');

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not locate COMMAND_DIRECTORY or setupSosSuite in app.js');
}

// 1. Build the list of tools
const rawOriginalSnippet = app.substring(startIdx, app.indexOf('function setupCommandPalette')).replace('const COMMAND_DIRECTORY = [', 'return [') + ';';
const originalList = new Function(rawOriginalSnippet)();

function getCategory(item) {
  const id = item.id.toLowerCase();
  
  if (id === 'ask' || id === 'binder' || id === 'watchdog' || id === 'identity-harmonization') return 'immigration';
  if (id === 'express-entry-crs' || id === 'pnp-pathway' || id === 'bowp-diagnostic' || id === 'pathway' || 
      id === 'citizenship' || id === 'pr-residency' || id === 'cmd-study-permit-cap-pal' || 
      id === 'cmd-visitor-visa-financial-ties' || id === 'cmd-study-to-pr' || id === 'cmd-gcms-analyzer' || 
      id === 'cmd-canada-status-admissibility' || id === 'insider-maintained-status' || 
      id === 'insider-expired-pr-card' || id === 'insider-ca-pnp-intent' || id === 'insider-ircc-cec-52weeks' ||
      id === 'insider-cec-exclusion' || id === 'insider-dual-intent' || id === 'cmd-pr-matrix') return 'immigration';

  if (id === 'cmd-family-reunification' || id === 'cmd-sin-healthcare' || id === 'cmd-super-visa-lico' ||
      id === 'super-visa-sponsor' || id === 'healthcare' || id === 'health-elig' || id === 'medical-admissibility' ||
      id === 'schools' || id === 'childcare' || id === 'student-compliance' || id === 'parental-leave' ||
      id === 'family-law' || id === 'social-assistance' || id === 'insider-family-bar' || 
      id === 'insider-on-ohip-wait') return 'health';

  if (id === 'cmd-ontario-bc-tenancy' || id === 'tenancy' || id === 'vault' || id === 'lease-guard' || 
      id === 'eviction-defense' || id === 'lease-assignment' || id === 'rent-increase' || id === 'homebuyer' ||
      id === 'insider-shared-kitchen' || id === 'insider-post-2018-rent' || id === 'insider-lease-exit' ||
      id === 'insider-n12-timing' || id === 'insider-on-ohrc-no-credit' || id === 'insider-calgary-suite') return 'housing';

  if (id === 'cmd-legal-notices' || id === 'debt-defense' || id === 'telecom-defense' || 
      id === 'consumer-protection' || id === 'small-claims' || id === 'human-rights-defense') return 'notices';

  if (id === 'cmd-lmia-readiness' || id === 'cmd-severance-bardal' || id === 'business-structure' || 
      id === 'paycheck' || id === 'severance' || id === 'worker-classification' || id === 'vulnerable-worker' ||
      id === 'statutory-pay' || id === 'careers' || id === 'jd-matcher' || id === 'credential-licensure' ||
      id === 'insider-remote-work' || id === 'insider-on-esa-severance') return 'labor';

  if (id === 'cmd-tax-shield' || id === 'cmd-cra-newcomer-wealth' || id === 'cmd-moving-tax-calc' ||
      id === 'moving-tax' || id === 'tax' || id === 'cra-benefits' || id === 'estate-planning' || 
      id === 'cra-vdp' || id === 'cashflow' || id === 'budget' || id === 'homebuyer-tax' || 
      id === 'currency-exchange' || id === 'banking' || id === 'banking-comparator' || 
      id === 'insider-tfsa-penalty' || id === 'insider-cost-base-stepup' || id === 'insider-parental-gifts' ||
      id === 'insider-t1135-exemption' || id === 'insider-ca-fhsa' || id === 'insider-cra-moving-expenses') return 'tax';

  if (id === 'cmd-calendar-sync' || id === 'cmd-poe-rights' || id === 'preflight-inspector' ||
      id === 'airport' || id === 'bsf186-engine' || id === 'pet-import' || id === 'border-flagpoling' ||
      id === 'journey' || id === 'forms' || id === 'bsf186' || id === 'driving' || id === 'vehicle-import' ||
      id === 'auto-insurance' || id === 'sos' || id === 'compare' || id === 'languages' || id === 'coverage' || 
      id === 'review' || id === 'insider-flagpoling' || id === 'insider-auto-insurance' || 
      id === 'insider-device-search' || id === 'insider-driving-extract') return 'arrival';

  return 'global';
}

const HINDI_KEYWORD_MAP = {
  immigration: ['वीजा', 'पीआर', 'नागरिकता', 'वर्क परमिट', 'इमिग्रेशन', 'स्टडी वीजा'],
  housing: ['किराया', 'मकान', 'मकान मालिक', 'रेंट', 'किराएदार', 'नोटिस'],
  labor: ['काम', 'नौकरी', 'वेतन', 'अधिकार', 'जॉब', 'सैलरी', 'लेबर'],
  tax: ['टैक्स', 'बैंक', 'खाता', 'पैसा', 'संपत्ति', 'बचत', 'टीएफएसए'],
  health: ['स्वास्थ्य', 'अस्पताल', 'दवा', 'डॉक्टर', 'ओहिप', 'स्कूल', 'बच्चा', 'परिवार'],
  notices: ['कानूनी नोटिस', 'हक', 'मांग पत्र', 'मुआवजा', 'अदालत'],
  arrival: ['हवाई अड्डा', 'बॉर्डर', 'कस्टम्स', 'कैलेंडर', 'ड्राइविंग', 'आगमन'],
  global: ['विदेश', 'ग्लोबल', 'अमेरिका', 'ब्रिटेन', 'ऑस्ट्रेलिया', 'जर्मनी', 'दुबई']
};

// Enrich existing items with category and extra keywords
const processedList = originalList.map(item => {
  const cat = getCategory(item);
  const extraKw = HINDI_KEYWORD_MAP[cat] || [];
  const existingKw = Array.isArray(item.keywords) ? item.keywords : [];
  const mergedKw = Array.from(new Set([...existingKw, ...extraKw]));
  return {
    ...item,
    category: cat,
    keywords: mergedKw
  };
});

// Add the 6 newly implemented statutory engines if missing
const newEngines = [
  {
    id: 'cmd-pr-matrix',
    toolModal: 'pr-matrix',
    category: 'immigration',
    title: 'PR Pathway Eligibility & Points Matrix',
    desc: 'Calculate Express Entry CRS points, PNP categories, draw cutoffs and invitation likelihood',
    icon: '🍁',
    keywords: ['pr', 'matrix', 'points', 'crs', 'express', 'entry', 'ita', 'draw', 'cec', 'fsw', 'pnp', 'score', 'पीआर', 'मेरिट', 'पॉइंट्स', 'अंक', 'वीजा']
  },
  {
    id: 'cmd-family-reunification',
    toolModal: 'family-reunification',
    category: 'health',
    title: 'Family Reunification & Super Visa Income Navigator',
    desc: 'Audit LICO + 30% household thresholds, 20-year undertaking, and Super Visa $100k insurance',
    icon: '👨‍👩‍👧‍👦',
    keywords: ['family', 'reunification', 'super visa', 'lico', 'parents', 'grandparents', 'sponsorship', 'undertaking', 'insurance', 'परिवार', 'सुपर वीजा', 'माता-पिता', 'स्वास्थ्य']
  },
  {
    id: 'cmd-tax-shield',
    toolModal: 'tax-shield',
    category: 'tax',
    title: 'Cross-Border Tax Shield & Foreign Asset Reporting (T1135)',
    desc: 'Evaluate CRA Form T1135 $100k threshold, foreign property reporting, and Section 116 withholding',
    icon: '🛡️',
    keywords: ['tax', 'shield', 't1135', 'foreign', 'property', 'cra', 'withholding', 'section 116', 'offshore', 'declaration', 'टैक्स', 'विदेशी संपत्ति', 'बचत', 'पैसा']
  },
  {
    id: 'cmd-calendar-sync',
    toolModal: 'calendar-sync',
    category: 'arrival',
    title: 'Settlement Roadmap Calendar & ICS Event Sync',
    desc: 'Generate 180-day milestone timeline, OHIP/SIN dates, and export .ics iCalendar sync files',
    icon: '🗓️',
    keywords: ['calendar', 'sync', 'ics', 'milestones', 'timeline', 'roadmap', 'schedule', 'ical', 'export', 'कैलेंडर', 'इवेंट', 'तारीख', 'आगमन']
  },
  {
    id: 'cmd-legal-notices',
    toolModal: 'legal-notices',
    category: 'notices',
    title: 'Legal Notice & Statutory Rights Generator',
    desc: 'Generate formal legal notices: LTB Form T2/T6, OHSA s.43 unsafe work refusal, ESA s.13 wage demand, and Alberta RTA s.19',
    icon: '📜',
    keywords: ['notice', 'legal', 'ltb', 't2', 't6', 'ohsa', 'esa', 'wages', 'lockout', 'repair', 'deposit', 'rta', 'statutory', 'कानूनी', 'नोटिस', 'हक', 'मांग पत्र', 'अदालत']
  },
  {
    id: 'cmd-poe-rights',
    toolModal: 'poe-rights',
    category: 'arrival',
    title: 'Airport & Border Port-of-Entry Rights Navigator',
    desc: 'Audit statutory rights at Canadian, US, UK, and Australian ports: secondary inspection, phone privacy, and voluntary withdrawal',
    icon: '🛂',
    keywords: ['border', 'poe', 'cbsa', 'cbp', 'inspection', 'phone', 'search', 'rights', 'airport', 'secondary', 'withdrawal', 'बॉर्डर', 'अधिकार', 'हवाई अड्डा', 'आगमन']
  },
  {
    id: 'insider-calgary-suite',
    view: 'ask',
    country: 'Canada',
    category: 'housing',
    query: 'What are Calgary secondary suite amnesty egress window and NBC-AE fire separation requirements in Calgary?',
    title: 'Calgary: Secondary Suite Amnesty & Egress Window Rules',
    desc: 'NBC-AE 0.35 sq.m egress window & amnesty registry verification',
    icon: '🏠',
    keywords: ['calgary', 'secondary suite', 'basement', 'amnesty', 'egress', 'window', 'nbc-ae', 'कैलगरी', 'बेसमेंट', 'किराया']
  }
];

// Prepend tool modals if not present
for (const engine of newEngines) {
  if (!processedList.some(x => x.id === engine.id)) {
    if (engine.toolModal) {
      processedList.splice(4, 0, engine);
    } else {
      processedList.push(engine);
    }
  }
}

const COMMAND_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: '⚡' },
  { id: 'immigration', label: 'Immigration & PR', icon: '⚖️' },
  { id: 'housing', label: 'Housing & Tenancy', icon: '🏠' },
  { id: 'labor', label: 'Work & Labor', icon: '💼' },
  { id: 'tax', label: 'Tax & Banking', icon: '💰' },
  { id: 'health', label: 'Health & Family', icon: '🏥' },
  { id: 'notices', label: 'Legal Notices', icon: '📜' },
  { id: 'arrival', label: 'Arrival & Border', icon: '✈️' },
  { id: 'global', label: 'Global Corridors', icon: '🌐' }
];

const newCodeBlock = `const COMMAND_CATEGORIES = ${JSON.stringify(COMMAND_CATEGORIES, null, 2)};

const COMMAND_DIRECTORY = ${JSON.stringify(processedList, null, 2)};

function setupCommandPalette() {
  const modal = $('#cmd-palette-modal');
  const input = $('#cmd-palette-input');
  const list = $('#cmd-palette-list');
  const categoriesBar = $('#cmd-palette-categories');
  const closeBtn = $('#cmd-palette-close');
  const triggerBtn = $('#cmd-palette-trigger');
  const navCatalogBtn = $('#nav-tools-directory-btn');

  if (!modal || !input || !list) return;

  let activeIndex = 0;
  let currentCategory = 'all';
  let filteredCommands = [...COMMAND_DIRECTORY];

  function openPalette(initialCategory = 'all') {
    modal.hidden = false;
    input.value = '';
    currentCategory = initialCategory;
    renderCategories();
    applyFilter();
    input.focus();
  }

  function closePalette() {
    modal.hidden = true;
  }

  function renderCategories() {
    if (!categoriesBar) return;
    categoriesBar.innerHTML = '';
    COMMAND_CATEGORIES.forEach(cat => {
      const count = cat.id === 'all'
        ? COMMAND_DIRECTORY.length
        : COMMAND_DIRECTORY.filter(c => c.category === cat.id).length;
      
      const btn = el('button', undefined, 'cmd-cat-btn' + (cat.id === currentCategory ? ' active' : ''));
      btn.type = 'button';
      btn.dataset.cat = cat.id;
      btn.setAttribute('aria-label', \`Filter by \${cat.label}\`);
      btn.innerHTML = \`
        <span>\${cat.icon}</span>
        <span>\${cat.label}</span>
        <span class="cmd-cat-pill-count">\${count}</span>
      \`;
      btn.addEventListener('click', () => {
        currentCategory = cat.id;
        categoriesBar.querySelectorAll('.cmd-cat-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cat === currentCategory);
        });
        applyFilter();
        input.focus();
      });
      categoriesBar.appendChild(btn);
    });
  }

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    let items = COMMAND_DIRECTORY;

    if (currentCategory !== 'all') {
      items = items.filter(c => c.category === currentCategory);
    }

    if (q) {
      items = items.filter(c => {
        const title = (c.title || '').toLowerCase();
        const desc = (c.desc || '').toLowerCase();
        const id = (c.id || '').toLowerCase();
        const cat = (c.category || '').toLowerCase();
        const keywords = Array.isArray(c.keywords) ? c.keywords.join(' ').toLowerCase() : '';
        return title.includes(q) || desc.includes(q) || id.includes(q) || cat.includes(q) || keywords.includes(q);
      });
    }

    renderList(items, q, currentCategory);
  }

  function createRowElement(cmd, idx) {
    const row = el('div', undefined, 'cmd-row' + (idx === 0 ? ' selected' : ''));
    row.dataset.index = String(idx);

    const catBadge = cmd.category ? \`<span class="cmd-cat-badge">\${cmd.category.toUpperCase()}</span>\` : '';
    const toolBadge = cmd.toolModal ? '<span class="cmd-tool-tag">1-CLICK TOOL</span>' : '';

    row.innerHTML = \`
      <span class="cmd-icon">\${cmd.icon || '◈'}</span>
      <div class="cmd-info">
        <div class="cmd-row-head">
          <span class="cmd-title">\${cmd.title}</span>
          \${catBadge}
          \${toolBadge}
        </div>
        <div class="cmd-desc">\${cmd.desc || ''}</div>
      </div>
      \${cmd.shortcut ? \`<span class="cmd-shortcut"><kbd>\${cmd.shortcut}</kbd></span>\` : ''}
    \`;
    row.addEventListener('click', () => executeCommand(cmd));
    return row;
  }

  function renderList(items, query, catFilter) {
    filteredCommands = items;
    activeIndex = 0;
    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = \`
        <div class="cmd-empty">
          <div class="cmd-empty-icon">🔍</div>
          <div class="cmd-empty-text">No matching tools or commands found.</div>
          <small class="cmd-empty-sub">Try searching by keyword like "PR", "rent", "tax", "LMIA", "notice", or select "All Tools".</small>
        </div>
      \`;
      return;
    }

    if (!query && catFilter === 'all') {
      const grouped = {};
      COMMAND_CATEGORIES.filter(c => c.id !== 'all').forEach(c => { grouped[c.id] = []; });
      items.forEach(cmd => {
        const catId = cmd.category || 'immigration';
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(cmd);
      });

      let overallIdx = 0;
      COMMAND_CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
        const catItems = grouped[cat.id];
        if (!catItems || catItems.length === 0) return;

        const header = el('div', undefined, 'cmd-category-header');
        header.innerHTML = \`
          <span class="cmd-cat-title">\${cat.icon} \${cat.label.toUpperCase()}</span>
          <span class="cmd-cat-count">\${catItems.length} tools</span>
        \`;
        list.appendChild(header);

        catItems.forEach(cmd => {
          const row = createRowElement(cmd, overallIdx);
          overallIdx++;
          list.appendChild(row);
        });
      });
    } else {
      items.forEach((cmd, idx) => {
        const row = createRowElement(cmd, idx);
        list.appendChild(row);
      });
    }

    updateSelectedRow();
  }

  function executeCommand(cmd) {
    closePalette();
    if (cmd.toolModal && typeof window.triggerToolModal === 'function') {
      window.triggerToolModal({ id: cmd.toolModal, title: cmd.title });
      return;
    }
    const targetView = cmd.view || cmd.id;
    const navBtn = document.querySelector(\`[data-view="\${targetView}"]\`);
    if (navBtn) {
      navBtn.click();
    }
    if (cmd.id === 'watchdog') $('#binder-watchdog')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'debt-defense') $('#debt-defense-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'telecom-defense') $('#telecom-defense-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'border-flagpoling') $('#border-flagpoling-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'rent-increase') $('#rent-increase-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'human-rights-defense') $('#human-rights-defense-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'homebuyer-tax') $('#homebuyer-tax-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'auto-insurance') $('#auto-insurance-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'estate-planning') $('#estate-planning-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'moving-tax') $('#moving-tax-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'vault') $('#tenancy-vault')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'severance') $('#paycheck-severance-card')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'credential-licensure') {
      $('#tab-btn-licensing')?.click();
      $('#credential-licensure-card')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (cmd.id === 'jd-matcher') $('#jd-text-input')?.scrollIntoView({ behavior: 'smooth' });
    if (cmd.id === 'bsf186') {
      const sel = $('#forms-selector');
      if (sel) {
        sel.value = 'cbsa_bsf186';
        sel.dispatchEvent(new Event('change'));
      }
    }
    if (cmd.query) {
      const qInput = $('#question');
      if (qInput) {
        qInput.value = cmd.query;
        if (cmd.country && $('#country')) {
          $('#country').value = cmd.country;
          updateCityDropdown(cmd.country, $('#city'), $('#city-group'));
        } else {
          if ($('#country')) $('#country').value = '';
          updateCityDropdown('', $('#city'), $('#city-group'));
          if ($('#city')) $('#city').value = 'Toronto';
        }
        $('#question-form')?.requestSubmit();
        announce(\`Insider query submitted: \${cmd.query}\`);
      }
    }
  }

  input.addEventListener('input', () => {
    applyFilter();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        activeIndex = (activeIndex + 1) % filteredCommands.length;
        updateSelectedRow();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
        updateSelectedRow();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        executeCommand(filteredCommands[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  });

  function updateSelectedRow() {
    list.querySelectorAll('.cmd-row').forEach((r, idx) => {
      r.classList.toggle('selected', idx === activeIndex);
      if (idx === activeIndex) r.scrollIntoView({ block: 'nearest' });
    });
  }

  triggerBtn?.addEventListener('click', () => openPalette('all'));
  navCatalogBtn?.addEventListener('click', () => openPalette('all'));
  closeBtn?.addEventListener('click', closePalette);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePalette();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.hidden) openPalette('all');
      else closePalette();
    }
  });
}
`;

// Replace in app.js
const updatedApp = app.substring(0, startIdx) + newCodeBlock + app.substring(endIdx);
fs.writeFileSync(appPath, updatedApp, 'utf8');
console.log('Successfully rebuilt command palette and directory in app.js. Total tools:', processedList.length);
