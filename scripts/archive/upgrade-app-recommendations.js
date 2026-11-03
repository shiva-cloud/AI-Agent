import fs from 'node:fs';

const appPath = 'public/app.js';
let app = fs.readFileSync(appPath, 'utf8');

// Locate start of command categories and setupCommandPalette
const cmdCatStart = app.indexOf('const COMMAND_CATEGORIES =');
const setupSosStart = app.indexOf('\nfunction setupSosSuite()');

if (cmdCatStart === -1 || setupSosStart === -1) {
  throw new Error('Could not locate COMMAND_CATEGORIES or setupSosSuite');
}

// Extract COMMAND_DIRECTORY items from app.js
const cmdDirIdx = app.indexOf('const COMMAND_DIRECTORY =', cmdCatStart);
const setupCmdIdx = app.indexOf('\nfunction setupCommandPalette()', cmdDirIdx);

const rawCmdDir = app.substring(cmdDirIdx, setupCmdIdx).replace('const COMMAND_DIRECTORY =', 'return') + ';';
const commandList = new Function(rawCmdDir)();

const newAppSection = `const PERSONA_DIRECTORY = [
  { id: 'all_personas', label: 'All Personas', icon: '👥' },
  { id: 'student', label: 'Student (PAL/PGWP)', icon: '🎓', tools: ['cmd-study-permit-cap-pal', 'cmd-study-to-pr', 'student-compliance', 'sin-healthcare', 'childcare', 'driving', 'auto-insurance', 'cra-benefits', 'insider-remote-work'] },
  { id: 'worker', label: 'Worker / TFW', icon: '💼', tools: ['cmd-lmia-readiness', 'cmd-severance-bardal', 'cmd-legal-notices', 'statutory-pay', 'worker-classification', 'vulnerable-worker', 'human-rights-defense', 'bowp-diagnostic', 'insider-maintained-status', 'insider-on-esa-severance'] },
  { id: 'pr_newcomer', label: 'PR / Newcomer', icon: '🍁', tools: ['cmd-pr-matrix', 'express-entry-crs', 'pnp-pathway', 'cmd-tax-shield', 'cmd-cra-newcomer-wealth', 'cmd-moving-tax-calc', 'cmd-calendar-sync', 'bsf186-engine', 'citizenship', 'pr-residency', 'insider-expired-pr-card'] },
  { id: 'family', label: 'Family & Parents', icon: '👨‍👩‍👧‍👦', tools: ['cmd-family-reunification', 'cmd-super-visa-lico', 'super-visa-sponsor', 'family-law', 'parental-leave', 'schools', 'childcare', 'social-assistance', 'insider-family-bar'] },
  { id: 'renter', label: 'Renter / Tenant', icon: '🏠', tools: ['cmd-ontario-bc-tenancy', 'cmd-legal-notices', 'lease-guard', 'eviction-defense', 'rent-increase', 'lease-assignment', 'homebuyer-tax', 'insider-shared-kitchen', 'insider-post-2018-rent', 'insider-n12-timing', 'insider-calgary-suite'] },
  { id: 'global_expat', label: 'Global Expat', icon: '🌐', tools: ['cmd-global-visa-matrix', 'cmd-us-h1b-opt', 'cmd-uk-skilled-worker', 'cmd-australia-reforms', 'cmd-germany-chancenkarte', 'cmd-global-expat', 'insider-us-h1b-severance', 'insider-de-nebenkosten', 'insider-uae-gratuity-wps'] }
];

const COMMAND_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: '⚡' },
  { id: 'recent', label: 'Recent & Pinned', icon: '⭐' },
  { id: 'immigration', label: 'Immigration & PR', icon: '⚖️' },
  { id: 'housing', label: 'Housing & Tenancy', icon: '🏠' },
  { id: 'labor', label: 'Work & Labor', icon: '💼' },
  { id: 'tax', label: 'Tax & Banking', icon: '💰' },
  { id: 'health', label: 'Health & Family', icon: '🏥' },
  { id: 'notices', label: 'Legal Notices', icon: '📜' },
  { id: 'arrival', label: 'Arrival & Border', icon: '✈️' },
  { id: 'global', label: 'Global Corridors', icon: '🌐' }
];

const COMMAND_DIRECTORY = ${JSON.stringify(commandList, null, 2)};

function getRecentToolIds() {
  try {
    const raw = localStorage.getItem('northstar_recent_tools');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return ['cmd-pr-matrix', 'cmd-legal-notices', 'cmd-tax-shield', 'cmd-calendar-sync'];
}

function saveRecentTool(id) {
  try {
    const recents = getRecentToolIds().filter(x => x !== id);
    recents.unshift(id);
    if (recents.length > 8) recents.length = 8;
    localStorage.setItem('northstar_recent_tools', JSON.stringify(recents));
  } catch (_) {}
}

function getPinnedToolIds() {
  try {
    const raw = localStorage.getItem('northstar_pinned_tools');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return ['cmd-pr-matrix', 'cmd-legal-notices'];
}

function togglePinnedTool(id) {
  try {
    const pinned = getPinnedToolIds();
    const idx = pinned.indexOf(id);
    if (idx === -1) pinned.push(id);
    else pinned.splice(idx, 1);
    localStorage.setItem('northstar_pinned_tools', JSON.stringify(pinned));
  } catch (_) {}
}

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
  let currentPersona = 'all_personas';
  let filteredCommands = [...COMMAND_DIRECTORY];

  function openPalette(initialCategory = 'all') {
    modal.hidden = false;
    input.value = '';
    currentCategory = initialCategory;
    currentPersona = 'all_personas';
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

    // 1. Categories
    COMMAND_CATEGORIES.forEach(cat => {
      let count = 0;
      if (cat.id === 'all') count = COMMAND_DIRECTORY.length;
      else if (cat.id === 'recent') {
        const combined = new Set([...getPinnedToolIds(), ...getRecentToolIds()]);
        count = combined.size;
      } else {
        count = COMMAND_DIRECTORY.filter(c => c.category === cat.id).length;
      }
      
      const isRecent = cat.id === 'recent';
      const btn = el('button', undefined, 'cmd-cat-btn' + (isRecent ? ' recent-pill' : '') + (cat.id === currentCategory ? ' active' : ''));
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
        currentPersona = 'all_personas';
        categoriesBar.querySelectorAll('.cmd-cat-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cat === currentCategory);
        });
        applyFilter();
        input.focus();
      });
      categoriesBar.appendChild(btn);
    });

    // 2. Persona Quick-Filters
    PERSONA_DIRECTORY.filter(p => p.id !== 'all_personas').forEach(persona => {
      const btn = el('button', undefined, 'cmd-cat-btn persona-pill' + (persona.id === currentPersona ? ' active' : ''));
      btn.type = 'button';
      btn.dataset.persona = persona.id;
      btn.setAttribute('aria-label', \`Filter for \${persona.label}\`);
      btn.innerHTML = \`
        <span>\${persona.icon}</span>
        <span>\${persona.label}</span>
        <span class="cmd-cat-pill-count">\${persona.tools.length}</span>
      \`;
      btn.addEventListener('click', () => {
        currentPersona = persona.id;
        currentCategory = 'all';
        categoriesBar.querySelectorAll('.cmd-cat-btn').forEach(b => {
          b.classList.remove('active');
          if (b.dataset.persona === currentPersona) b.classList.add('active');
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

    if (currentPersona !== 'all_personas') {
      const pObj = PERSONA_DIRECTORY.find(p => p.id === currentPersona);
      if (pObj) {
        items = items.filter(c => pObj.tools.includes(c.id) || pObj.tools.includes(c.toolModal));
      }
    } else if (currentCategory === 'recent') {
      const pinned = getPinnedToolIds();
      const recents = getRecentToolIds();
      const combined = Array.from(new Set([...pinned, ...recents]));
      items = items.filter(c => combined.includes(c.id) || combined.includes(c.toolModal));
      // Sort pinned first
      items.sort((a, b) => {
        const aPinned = pinned.includes(a.id) || pinned.includes(a.toolModal);
        const bPinned = pinned.includes(b.id) || pinned.includes(b.toolModal);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
    } else if (currentCategory !== 'all') {
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

    renderList(items, q, currentCategory, currentPersona);
  }

  function createRowElement(cmd, idx) {
    const row = el('div', undefined, 'cmd-row' + (idx === 0 ? ' selected' : ''));
    row.dataset.index = String(idx);

    const catBadge = cmd.category ? \`<span class="cmd-cat-badge">\${cmd.category.toUpperCase()}</span>\` : '';
    const toolBadge = cmd.toolModal ? '<span class="cmd-tool-tag">1-CLICK TOOL</span>' : '';
    const isPinned = getPinnedToolIds().includes(cmd.id) || getPinnedToolIds().includes(cmd.toolModal);

    row.innerHTML = \`
      <button type="button" class="cmd-pin-btn \${isPinned ? 'pinned' : ''}" title="\${isPinned ? 'Unpin tool' : 'Pin tool to top'}" aria-label="\${isPinned ? 'Unpin tool' : 'Pin tool'}">\${isPinned ? '★' : '☆'}</button>
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

    row.querySelector('.cmd-pin-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePinnedTool(cmd.id);
      renderCategories();
      applyFilter();
    });

    row.addEventListener('click', () => executeCommand(cmd));
    return row;
  }

  function renderList(items, query, catFilter, personaFilter) {
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

    if (!query && catFilter === 'all' && personaFilter === 'all_personas') {
      const grouped = {};
      COMMAND_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'recent').forEach(c => { grouped[c.id] = []; });
      items.forEach(cmd => {
        const catId = cmd.category || 'immigration';
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(cmd);
      });

      let overallIdx = 0;
      COMMAND_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'recent').forEach(cat => {
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
    saveRecentTool(cmd.id);
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

function setupQuickActionFab() {
  const fab = $('#quick-action-fab');
  const menu = $('#quick-action-menu');
  const sosBtn = $('#fab-sos-btn');
  const noticeBtn = $('#fab-notice-btn');
  const wizardBtn = $('#fab-wizard-btn');
  const paletteBtn = $('#fab-palette-btn');

  if (!fab || !menu) return;

  function toggleMenu(forceOpen) {
    const isOpen = forceOpen !== undefined ? forceOpen : menu.hidden;
    menu.hidden = !isOpen;
    fab.setAttribute('aria-expanded', String(isOpen));
  }

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#quick-action-fab-container')) {
      toggleMenu(false);
    }
  });

  sosBtn?.addEventListener('click', () => {
    toggleMenu(false);
    const navBtn = document.querySelector('[data-view="sos"]');
    if (navBtn) navBtn.click();
  });

  noticeBtn?.addEventListener('click', () => {
    toggleMenu(false);
    if (typeof window.triggerToolModal === 'function') {
      window.triggerToolModal({ id: 'legal-notices', title: 'Legal Notice & Statutory Rights Generator' });
    }
  });

  wizardBtn?.addEventListener('click', () => {
    toggleMenu(false);
    window.openSettlementWizard?.();
  });

  paletteBtn?.addEventListener('click', () => {
    toggleMenu(false);
    $('#cmd-palette-trigger')?.click();
  });
}

function setupSettlementWizard() {
  const modal = $('#settlement-wizard-modal');
  const form = $('#settlement-wizard-form');
  const closeBtn = $('#wizard-close-btn');
  const progressIndicators = modal?.querySelectorAll('.wizard-step-indicator');
  const panes = modal?.querySelectorAll('.wizard-step-pane');
  const resultsContainer = $('#wizard-results');

  if (!modal || !form) return;

  let currentStep = 1;

  function setStep(step) {
    currentStep = step;
    panes.forEach(p => {
      const pStep = Number(p.dataset.step);
      p.hidden = pStep !== currentStep;
    });
    progressIndicators.forEach(ind => {
      const iStep = Number(ind.dataset.step);
      ind.classList.toggle('active', iStep === currentStep);
      ind.classList.toggle('completed', iStep < currentStep);
    });
  }

  modal.querySelectorAll('.btn-wizard-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = Number(btn.dataset.next);
      setStep(next);
    });
  });

  modal.querySelectorAll('.btn-wizard-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = Number(btn.dataset.prev);
      setStep(prev);
    });
  });

  window.openSettlementWizard = function () {
    modal.hidden = false;
    form.hidden = false;
    resultsContainer.hidden = true;
    setStep(1);
  };

  closeBtn?.addEventListener('click', () => {
    modal.hidden = true;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const country = $('#wizard-country')?.value || 'Canada';
    const city = $('#wizard-city')?.value || 'Toronto';
    const status = $('#wizard-status')?.value || 'student';
    const field = $('#wizard-study-field')?.value || 'stem';
    const familySize = Number($('#wizard-family-size')?.value || 1);
    const hasChildren = $('#wizard-has-children')?.value === 'yes';
    const arrivalDate = $('#wizard-arrival-date')?.value || '2025-09-01';

    let fundsBenchmarkText = '';
    let statutoryRuleNote = '';
    if (country === 'Canada') {
      if (status === 'student') {
        const baseFunds = familySize === 1 ? 20635 : (20635 + (familySize - 1) * 5500);
        fundsBenchmarkText = '$' + baseFunds.toLocaleString('en-CA') + ' CAD';
        statutoryRuleNote = 'IRCC 2024 living expense proof requirement (excluding first-year tuition fees)';
      } else if (status === 'family_super_visa') {
        const lico30Base = [35768, 44530, 54746, 66468, 75388][Math.min(familySize - 1, 4)];
        fundsBenchmarkText = '$' + lico30Base.toLocaleString('en-CA') + ' CAD';
        statutoryRuleNote = 'IRCC 2024 Super Visa minimum annual income requirement (LICO + 30%)';
      } else {
        const licoBase = [27514, 34254, 42112, 51128, 57989][Math.min(familySize - 1, 4)];
        fundsBenchmarkText = '$' + licoBase.toLocaleString('en-CA') + ' CAD';
        statutoryRuleNote = 'Statutory low-income cut-off (LICO) settlement benchmark';
      }
    } else if (country === 'United States') {
      const usPoverty = [18825, 25550, 32275, 39000, 45725][Math.min(familySize - 1, 4)];
      fundsBenchmarkText = '$' + usPoverty.toLocaleString('en-US') + ' USD';
      statutoryRuleNote = 'USCIS Form I-864 125% Federal Poverty Guidelines sponsorship floor';
    } else if (country === 'United Kingdom') {
      fundsBenchmarkText = status === 'worker' ? '£38,700 GBP / yr' : '£12,006 GBP';
      statutoryRuleNote = status === 'worker' ? 'Home Office HC 590 Skilled Worker standard salary threshold' : 'UKVI 9-month living funds maintenance requirement';
    } else if (country === 'Australia') {
      fundsBenchmarkText = status === 'worker' ? '$73,150 AUD / yr' : '$29,710 AUD';
      statutoryRuleNote = status === 'worker' ? 'DoHA Temporary Skilled Migration Income Threshold (TSMIT)' : 'Subclass 500 financial capacity requirement (July 2024 reform)';
    } else if (country === 'Germany') {
      fundsBenchmarkText = '€11,904 EUR';
      statutoryRuleNote = 'BAMF Sperrkonto (Blocked Account) annual statutory minimum (€992/month)';
    } else {
      fundsBenchmarkText = 'AED 15,000 / mo';
      statutoryRuleNote = 'UAE MOHRE skilled employment and family visa statutory minimum';
    }

    const recTools = [];
    if (country === 'Canada') {
      if (status === 'student') {
        recTools.push(
          { id: 'study-permit-cap-pal', title: 'Study Permit Cap & PAL Exemption', desc: 'IRCC 2024-2026 caps & $20,635 funds proof' },
          { id: 'study-to-pr', title: 'Study-to-PR & PGWP Roadmap', desc: 'PGWP field alignment & CEC work milestone' },
          { id: 'sin-healthcare', title: 'SIN & Healthcare 14-Day Kit', desc: 'Immediate OHIP / MSP 2-month enrollment rules' },
          { id: 'ontario-bc-tenancy', title: 'Tenancy Defense & Rent Cap', desc: '2.5% statutory cap & shared kitchen checks' }
        );
      } else if (status === 'family_super_visa') {
        recTools.push(
          { id: 'family-reunification', title: 'Family Reunification & Super Visa', desc: 'LICO + 30% audit & $100k medical insurance' },
          { id: 'super-visa-lico', title: 'Super Visa Income Calculator', desc: '20-year undertaking & household LICO threshold' },
          { id: 'calendar-sync', title: 'Settlement Roadmap & ICS Sync', desc: '180-day milestone schedule & calendar export' },
          { id: 'legal-notices', title: 'Legal Notice Generator', desc: 'Draft statutory letters and notices' }
        );
      } else {
        recTools.push(
          { id: 'pr-matrix', title: 'PR Pathway Eligibility Matrix', desc: 'Express Entry CRS, PNP & category draws' },
          { id: 'tax-shield', title: 'Foreign Asset Tax Shield (T1135)', desc: 'Form T1135 $100k threshold & clean cost base step-up' },
          { id: 'ontario-bc-tenancy', title: 'Tenancy Defense & Rent Cap', desc: 'Tenant rights, N12 compensation & lease rules' },
          { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'OHIP, SIN, tax filing & milestone timeline' }
        );
      }
    } else if (country === 'United States') {
      recTools.push(
        { id: 'us-h1b-opt', title: 'US: H-1B 60-Day Grace & OPT Cap-Gap', desc: 'Layoff timeline, 245(k) forgiveness & EAD extension' },
        { id: 'global-visa-matrix', title: 'Multi-Country Visa Matrix', desc: 'Compare skilled visa options and salary baselines' },
        { id: 'poe-rights', title: 'Airport Port-of-Entry Rights', desc: 'CBP secondary inspection & device privacy policies' },
        { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'Timeline milestones & I-94 tracking' }
      );
    } else if (country === 'United Kingdom') {
      recTools.push(
        { id: 'uk-skilled-worker', title: 'UK: Skilled Worker £38,700 vs Grandfathered', desc: 'HC 590 audit & 180-day rolling ILR absence' },
        { id: 'global-visa-matrix', title: 'Multi-Country Visa Matrix', desc: 'Skilled migration comparisons across corridors' },
        { id: 'poe-rights', title: 'Airport Port-of-Entry Rights', desc: 'UK Border Force inspection & voluntary return rules' },
        { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'ILR 180-day countdown & NHS surcharge tracking' }
      );
    } else if (country === 'Australia') {
      recTools.push(
        { id: 'australia-reforms', title: 'Australia: Subclass 482 Condition 8607', desc: '180-day sponsor transfer & 2% Medicare levy exemption' },
        { id: 'global-visa-matrix', title: 'Multi-Country Visa Matrix', desc: 'Compare Points Test & state nomination streams' },
        { id: 'poe-rights', title: 'Airport Port-of-Entry Rights', desc: 'ABF border search powers and device protocols' },
        { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'Tax file number & Medicare timeline' }
      );
    } else if (country === 'Germany') {
      recTools.push(
        { id: 'germany-chancenkarte', title: 'Germany: Chancenkarte & Nebenkosten', desc: '6-point test, 20h work & BGB 556 utility rules' },
        { id: 'global-visa-matrix', title: 'Multi-Country Visa Matrix', desc: 'EU Blue Card vs Opportunity Card requirements' },
        { id: 'poe-rights', title: 'Airport Port-of-Entry Rights', desc: 'Schengen border code & entry clearance rules' },
        { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'Anmeldung registration & health insurance timeline' }
      );
    } else {
      recTools.push(
        { id: 'global-expat', title: 'Global Expat: UAE Gratuity & RERA', desc: 'WPS fee deduction ban & 12-month notary eviction' },
        { id: 'global-visa-matrix', title: 'Multi-Country Visa Matrix', desc: 'UAE Green Visa & Golden Visa eligibility' },
        { id: 'poe-rights', title: 'Airport Port-of-Entry Rights', desc: 'Immigration clearance & device security' },
        { id: 'calendar-sync', title: 'Settlement Calendar & ICS Sync', desc: 'Emirates ID & residency visa timeline' }
      );
    }

    form.hidden = true;
    resultsContainer.hidden = false;

    const exportText = [
      '=======================================================',
      'NORTHSTAR SETTLEMENT BLUEPRINT',
      'Generated for: ' + country + ' (' + city + ')',
      'Pathway: ' + status.toUpperCase() + ' | Field: ' + field.toUpperCase(),
      'Household Size: ' + familySize + ' | Children: ' + (hasChildren ? 'Yes' : 'No'),
      'Target Arrival Date: ' + arrivalDate,
      '=======================================================',
      '',
      '1. STATUTORY LIVING & FINANCIAL BENCHMARK',
      '   Required Threshold: ' + fundsBenchmarkText,
      '   Statutory Authority: ' + statutoryRuleNote,
      '',
      '2. TOP RECOMMENDED TOOLS FOR YOUR JOURNEY',
      ...recTools.map((t, idx) => '   ' + (idx + 1) + '. ' + t.title + ' - ' + t.desc),
      '',
      '3. CRITICAL 180-DAY SETTLEMENT TIMELINE',
      '   * Day -30: Customs declaration preparation & pre-flight validity check',
      '   * Day 1-3: National identity / Series-9 SIN & immediate health coverage setup',
      '   * Day 7: Newcomer banking package & credit card activation',
      '   * Day 30: Foreign driver licence exchange credit & auto insurance discount letter',
      '   * Day 90: Tenancy rights verification & statutory rent cap audit',
      '   * Day 180: Cross-border tax reporting (T1135) assessment & foreign asset review',
      '======================================================='
    ].join('\\n');

    resultsContainer.innerHTML = \`
      <div class="blueprint-card">
        <h4><span>🗺️</span> Destination Profile</h4>
        <div style="font-size: 13.5px; color: var(--ink);">
          <strong>\${country} (\${city})</strong> · Status: <strong>\${status.replace(/_/g, ' ').toUpperCase()}</strong> · Household: <strong>\${familySize} person(s)</strong>
        </div>
      </div>

      <div class="blueprint-card">
        <h4><span>💰</span> Statutory Living / Financial Benchmark</h4>
        <div class="blueprint-funds-value">\${fundsBenchmarkText}</div>
        <div style="font-size: 11.5px; color: var(--muted);">\${statutoryRuleNote}</div>
      </div>

      <div class="blueprint-card">
        <h4><span>🛠️</span> Tailored Statutory Suite (Click to Launch)</h4>
        <div class="blueprint-grid">
          \${recTools.map(t => \`
            <div class="blueprint-rec-item" data-tool-id="\${t.id}">
              <div class="blueprint-rec-title">⚡ \${t.title}</div>
              <div class="blueprint-rec-desc">\${t.desc}</div>
            </div>
          \`).join('')}
        </div>
      </div>

      <div class="blueprint-card">
        <h4><span>🗓️</span> 180-Day Key Settlement Milestones</h4>
        <ul class="blueprint-milestones">
          <li><strong>Day -30 (Pre-Departure):</strong> Customs declaration preparation &amp; passport validity check.</li>
          <li><strong>Day 1-3:</strong> National identity registration (Series-9 SIN) &amp; health insurance activation.</li>
          <li><strong>Day 7:</strong> Newcomer banking account &amp; credit card setup.</li>
          <li><strong>Day 30:</strong> Foreign licence exchange credit &amp; insurance discount letter.</li>
          <li><strong>Day 90:</strong> Tenancy verification &amp; statutory rent increase cap review.</li>
          <li><strong>Day 180:</strong> Tax status determination &amp; foreign property reporting evaluation.</li>
        </ul>
      </div>

      <button type="button" id="btn-export-blueprint" class="blueprint-export-btn">
        <span>📥</span> Download Settlement Blueprint (.txt)
      </button>

      <button type="button" id="btn-wizard-restart" class="btn-wizard-prev" style="margin-top: 6px; width: 100%;">
        ← Plan for Another Profile
      </button>
    \`;

    resultsContainer.querySelectorAll('.blueprint-rec-item').forEach(item => {
      item.addEventListener('click', () => {
        const toolId = item.dataset.toolId;
        modal.hidden = true;
        if (typeof window.triggerToolModal === 'function') {
          window.triggerToolModal({ id: toolId, title: item.querySelector('.blueprint-rec-title')?.textContent || 'Tool' });
        }
      });
    });

    resultsContainer.querySelector('#btn-export-blueprint')?.addEventListener('click', () => {
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = 'Settlement-Blueprint-' + country + '-' + status + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
    });

    resultsContainer.querySelector('#btn-wizard-restart')?.addEventListener('click', () => {
      form.hidden = false;
      resultsContainer.hidden = true;
      setStep(1);
    });
  });
}
`;

// Replace in app.js
let updatedApp = app.substring(0, cmdCatStart) + newAppSection + app.substring(setupSosStart);

// Now ensure setupQuickActionFab and setupSettlementWizard are invoked in initialization
if (!updatedApp.includes('setupQuickActionFab();')) {
  updatedApp = updatedApp.replace('setupCommandPalette();', 'setupCommandPalette();\nsetupQuickActionFab();\nsetupSettlementWizard();');
}

fs.writeFileSync(appPath, updatedApp, 'utf8');
console.log('Successfully upgraded app.js with Persona filtering, Recent/Pinned tools, FAB, and Settlement Wizard.');
