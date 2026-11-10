import { mountImmigrationWorkspace } from './immigration-workspace-ui.js';
import { mountAppLifecycle } from './app-lifecycle.js';
import { mountEditorial } from './editorial.js';
import {locationChoices, locationFollowUp} from './clarification.js';
import { humanizeError, humanizeGap, humanizeAnswerStatus } from './errors.js';
import {mountGapWork} from './gap-work.js';
import { renderPresentation, reviewLabel } from './answer-view.js';
import {permissions} from './admin-permissions.js';
import './csp-styles.js';
import {mountPlanAccess, autoRun} from './plan-access.js';
import { COMMAND_DIRECTORY } from './app/command-directory.js';
import { $, analyzeDocumentText, answerReport, buildChangesPanel, coverageFilter, coverageTileClass, detectUserLanguage, el, escapeHtml, formatIsoDate, freshnessChip, gapCount, generateICSContent, generateVectorPDF, getBinderStorageKey, getPinnedToolIds, getRecentToolIds, link, loadBinderChecked, normalizeToCanonicalEnglish, readStored, relDate, resetAskButton, retrievalPanel, saveBinderChecked, saveRecentTool, spinner, titleFor, togglePinnedTool, updateBinderProgress, updateCityDropdown, updateFormPreview, viewToolControllers } from './app/core.js';
import { AI_STATUS_META, BINDER_DOCUMENTS, BINDER_DOCUMENTS_BY_COUNTRY, CITIES, COMMAND_CATEGORIES, EXAMPLES, EXAMPLES_PER_ROW, INSIDER_INTEL_ITEMS, PERSONA_DIRECTORY, PHASE_NAMES, SHORTCUTS, SIZE_LABELS, SIZE_ORDER, THEME_LABELS, THEME_ORDER, TOOL_SWITCHER_CONFIG, VIEW_ORDER } from './app/data.js';
import { renderAirportKit, renderBankMatcher, renderCareersSuite, renderCashflow, renderHealthcareSuite, renderMultilingualSynthesisCard, renderPathway, renderPaycheckSimulator, renderPreflightBanner, renderTaxEngine, renderTenancyWizard } from './app/renderers.js';
import { initViewToolSwitchers, setupAlbertaOpportunityStream, setupAlbertaSecurityDeposit, setupAtlanticImmigration, setupAutoInsurance, setupBankingComparator, setupBcSpeculationTaxDeclaration, setupBcStrataBylaw, setupBinderExpiryWatchdog, setupBorderFlagpoling, setupBowpDiagnostic, setupBusinessStructure, setupCareersSuite, setupCashflowPlanner, setupChildCareSubsidy, setupChildDisabilityBenefit, setupChildWelfare, setupChildcareNavigator, setupCitizenshipCalculator, setupCityComparatorSuite, setupCommercialLease, setupConsumerProtection, setupCraBenefitsCalculator, setupCraVdp, setupCredentialLicensure, setupCriminalRehab, setupCrossBorderTax, setupCurrencyExchange, setupCustomsDeclaration, setupCvJdMatcher, setupDebtCollectionDefense, setupDigitalPlatformWorker, setupEiDisqualification, setupEmploymentReference, setupEstatePlanning, setupEvictionDefense, setupExcessiveDemand, setupExpressEntry, setupFamilyLaw, setupFamilyReunificationNavigator, setupForeignWorkerTransition, setupFranchiseDisclosure, setupFrancophoneMobility, setupHealthcarePortability, setupHealthcareSuite, setupHighCostCredit, setupHomebuyerEligibility, setupHomebuyerTaxIncentives, setupHumanRightsDefense, setupIdentityHarmonization, setupInternationallyTrainedNurse, setupLayoffCalculator, setupLeaseAssignment, setupLeaseGuard, setupManitobaPnpSkilledWorker, setupMedicalAdmissibilityNavigator, setupMovingTaxCalculator, setupMultilingualSuite, setupNewcomerBudgetSuite, setupOasGis, setupParentalLeave, setupPathwayComparator, setupPaycheckSimulator, setupPetImportNavigator, setupPgwpNavigator, setupPnpPathway, setupPrCardRenewal, setupPrMatrixSimulator, setupPrResidencyNavigator, setupPreFlightInspector, setupPrtdHumanitarian, setupQuickActionFab, setupRealEstateAssignment, setupRentIncreaseDefense, setupRuralRenewal, setupSchoolsSuite, setupSettlementWizard, setupSeveranceReasonableNotice, setupSmallClaims, setupSocialAssistance, setupSosSuite, setupSowpNavigator, setupSpeculationTax, setupStatutoryPay, setupStudentWorkCompliance, setupSuperVisaNavigator, setupTaxEngine, setupTaxShieldOptimizer, setupTelecomContractDefense, setupTenancyEvidenceVault, setupTenancyRepairs, setupTenancyWizard, setupTfwCompliance, setupTimelineCalendarSync, setupVehicleImportNavigator, setupVulnerableWorkerNavigator, setupWorkerClassificationNavigator, setupWorkplaceSafety } from './app/setup.js';









let currentView = 'ask';

// Session context memory: retains user location, history, and topic across interactions
const sessionState = {
  lastCity: readStored('northstar_last_city', ''),
  lastCountry: '',
  lastTopic: null,
  history: []
};








const statusLive = el('div', '', 'sr-only');
statusLive.setAttribute('aria-live', 'polite');
statusLive.setAttribute('aria-atomic', 'true');
document.body.appendChild(statusLive);

function announce(msg) {
  statusLive.textContent = msg;
  setTimeout(() => { statusLive.textContent = ''; }, 1000);
}



// Neutral placeholders while a request is in flight, so a previous answer
// never lingers next to a newer question. An elapsed-time counter helps when
// the optional AI review path runs long.
let pendingTimer = null;
function clearPendingTimer() {
  if (pendingTimer) { clearInterval(pendingTimer); pendingTimer = null; }
}
function pendingAnswer() {
  clearPendingTimer();
  const box = el('article', undefined, 'result pending');
  const status = el('span', 'Checking sources for your question…', 'status');
  // The elapsed-time updates announce politely without stealing focus.
  status.setAttribute('role', 'status');
  box.append(status);
  const started = Date.now();
  pendingTimer = setInterval(() => {
    status.textContent = `Checking sources for your question… ${Math.round((Date.now() - started) / 1000)}s elapsed`;
  }, 1000);
  box.append(el('div', undefined, 'skeleton skeleton-badge'));
  box.append(el('div', undefined, 'skeleton skeleton-heading'));
  box.append(el('div', undefined, 'skeleton skeleton-para'));
  box.append(el('div', undefined, 'skeleton skeleton-line'));
  box.append(el('div', undefined, 'skeleton skeleton-line short'));
  const card = el('div', undefined, 'skeleton-card');
  card.append(el('div', undefined, 'skeleton skeleton-line short'));
  card.append(el('div', undefined, 'skeleton skeleton-line'));
  box.append(card);
  return box;
}

async function api(path, data, token) {
  const headers = {};
  if (data) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(path, {
    method: data ? 'POST' : 'GET',
    headers,
    body: data ? JSON.stringify(data) : undefined
  });
  let body;
  try {
    body = await r.json();
  } catch {
    if (!r.ok) throw new Error(`Server error ${r.status}`);
    throw new Error('Unexpected server response');
  }
  if (!r.ok) {
    const err = new Error(body?.error || 'Request failed');
    err.status = r.status;
    err.code = body?.code;
    err.requestId = r.headers.get('X-Request-ID');
    // The server supplies a Retry-After hint on 429; keep it for the countdown.
    const retryAfter = Number(r.headers.get('Retry-After'));
    if (r.status === 429 && retryAfter > 0) err.retryAfterSeconds = retryAfter;
    throw err;
  }
  return body;
}

document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', async () => {
  const target = document.getElementById(b.dataset.view);
  if (!target?.classList.contains('view')) return;
  document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== b.dataset.view);
  document.querySelectorAll('[data-view]').forEach(n => {
    const active = n.dataset.view === b.dataset.view;
    n.classList.toggle('active', active);
    if (active) n.setAttribute('aria-current', 'page');
    else n.removeAttribute('aria-current');
  });
  currentView = b.dataset.view;
  document.title = titleFor(currentView);
  // Switching views stops any in-flight read-aloud so audio never drags on.
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  // Announce the new view to screen readers by moving focus to its heading.
  const heading = $(`#${b.dataset.view} h1`);
  if (heading) { heading.tabIndex = -1; heading.focus(); }
  if (typeof syncSidebarActiveView === 'function') syncSidebarActiveView(b.dataset.view);
  if (typeof initViewToolSwitchers === 'function') initViewToolSwitchers(); // re-check dynamic views
  if (b.dataset.view === 'binder') renderBinder();
  if (b.dataset.view === 'airport') renderAirportKit();
  if (b.dataset.view === 'pathway') renderPathway();
  if (b.dataset.view === 'cashflow') renderCashflow();
  if (b.dataset.view === 'tenancy') renderTenancyWizard();
  if (b.dataset.view === 'journey') renderJourneyRoadmap();
  if (b.dataset.view === 'tax') renderTaxEngine();
  if (b.dataset.view === 'forms') renderFormsSuite();
  if (b.dataset.view === 'paycheck') renderPaycheckSimulator();
  if (b.dataset.view === 'banking') renderBanking();
  if (b.dataset.view === 'driving') renderDriving();
  if (b.dataset.view === 'careers') renderCareersSuite();
  if (b.dataset.view === 'healthcare') renderHealthcareSuite();
  if (b.dataset.view === 'coverage') await loadCoverage();
}));

let exampleOffset = 0;

function renderExamples() {
  const holder = $('#examples');
  if (!holder) return;
  const country = $('#country')?.value || '';
  const city = $('#city')?.value || '';
  const valid = EXAMPLES.filter(e => {
    if (country) return e.country === country;
    if (e.country) return false;
    return (!e.city || city) && (!e.cities || e.cities.includes(city));
  });
  holder.replaceChildren(el('span', valid.length ? 'TRY A QUESTION' : 'CHOOSE A LOCATION FOR EXAMPLES'));
  if (!valid.length) return;
  const shown = [];
  const count = Math.min(EXAMPLES_PER_ROW, valid.length);
  for (let i = 0; i < count; i++) shown.push(valid[(exampleOffset + i) % valid.length]);
  for (const entry of shown) {
    const b = el('button', `${entry.label} ↗`);
    b.type = 'button';
    const question = entry.build(city);
    b.dataset.question = question;
    if (entry.city) b.dataset.city = city;
    if (entry.country) b.dataset.country = entry.country;
    b.setAttribute('aria-label', `Use example question: ${question}`);
    b.addEventListener('click', () => {
      const q = $('#question');
      q.value = question;
      if (b.dataset.city && $('#city')) $('#city').value = b.dataset.city;
      if (b.dataset.country && $('#country')) {
        $('#country').value = b.dataset.country;
        updateCityDropdown(b.dataset.country, $('#city'), $('#city-group'));
      }
      q.focus();
      announce(`Question filled in: ${question}`);
    });
    holder.append(b);
  }
  if (valid.length > EXAMPLES_PER_ROW) {
    const more = el('button', 'More examples ↻');
    more.type = 'button';
    more.className = 'more-examples';
    more.addEventListener('click', () => {
      exampleOffset = (exampleOffset + EXAMPLES_PER_ROW) % valid.length;
      renderExamples();
      announce('Showing more example questions.');
    });
    holder.append(more);
  }
}

function isolateDialog(dialog) {
  const state = [];
  for (let node = dialog; node && node !== document.body; node = node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (sibling !== node) { state.push([sibling, sibling.inert]); sibling.inert = true; }
    }
  }
  return () => { for (const [node, inert] of state) node.inert = inert; };
}

const helpOverlay = el('div', undefined, 'overlay');
helpOverlay.hidden = true;
helpOverlay.setAttribute('role', 'dialog');
helpOverlay.setAttribute('aria-modal', 'true');
helpOverlay.setAttribute('aria-label', 'Keyboard shortcuts');
const helpCard = el('div', undefined, 'overlay-card');
helpCard.append(el('h2', 'Keyboard shortcuts'));
const helpList = el('ul');
SHORTCUTS.forEach(([key, what]) => helpList.append(el('li', `${key} — ${what}`)));
const helpClose = el('button', 'Close', 'primary');
helpClose.type = 'button';
helpCard.append(helpList, helpClose);
helpOverlay.append(helpCard);
document.body.append(helpOverlay);
let helpReturnFocus = null;
let restoreHelpBackground = null;
function setHelp(open) {
  if (open === !helpOverlay.hidden) return;
  if (open) { helpReturnFocus = document.activeElement; helpOverlay.hidden = false; restoreHelpBackground = isolateDialog(helpOverlay); helpClose.focus(); }
  else { helpOverlay.hidden = true; restoreHelpBackground?.(); restoreHelpBackground = null; helpReturnFocus?.focus?.(); }
}
helpClose.addEventListener('click', () => setHelp(false));
// Standard dialog behavior: a click on the dimmed backdrop closes it.
helpOverlay.addEventListener('mousedown', e => { if (e.target === helpOverlay) setHelp(false); });
$('#help-toggle').addEventListener('click', () => setHelp(helpOverlay.hidden));

document.addEventListener('keydown', e => {
  if (e.target?.closest?.('.tool-modal-overlay, #cmd-palette-modal, #settlement-wizard-modal')) return;
  const editing = /^(input|textarea|select)$/i.test(e.target?.tagName || '') || e.target?.isContentEditable;
  if (!helpOverlay.hidden) {
    if (e.key === 'Escape') { e.preventDefault(); setHelp(false); }
    // aria-modal trap: the dialog's only focusable control is Close, so Tab
    // must not wander into the page underneath it.
    else if (e.key === 'Tab') { e.preventDefault(); }
    return;
  }
  if (editing || e.ctrlKey || e.metaKey) return;
  if (e.key === '?') {
    e.preventDefault();
    setHelp(true);
  } else if (e.key === '/') {
    e.preventDefault();
    if ($('#ask').hidden) document.querySelector('[data-view="ask"]')?.click();
    $('#question').focus();
  } else if (e.altKey && ['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
    e.preventDefault();
    document.querySelector(`[data-view="${VIEW_ORDER[Number(e.key) - 1]}"]`)?.click();
  }
});
$('#city').addEventListener('change', () => {
  sessionState.lastCity = $('#city').value;
  try { localStorage.setItem('northstar_last_city', $('#city').value); } catch {}
  exampleOffset = 0;
  renderExamples();
});

let themeIndex = 0;
try {
  const savedTheme = localStorage.getItem('northstar_user_theme');
  if (savedTheme && THEME_ORDER.includes(savedTheme)) {
    themeIndex = THEME_ORDER.indexOf(savedTheme);
    if (savedTheme) document.documentElement.dataset.theme = savedTheme;
    if ($('#theme-toggle')) $('#theme-toggle').textContent = `Theme: ${THEME_LABELS[savedTheme]}`;
  }
} catch {}

$('#theme-toggle')?.addEventListener('click', () => {
  themeIndex = (themeIndex + 1) % THEME_ORDER.length;
  const value = THEME_ORDER[themeIndex];
  if (value) {
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem('northstar_user_theme', value); } catch {}
  } else {
    delete document.documentElement.dataset.theme;
    try { localStorage.removeItem('northstar_user_theme'); } catch {}
  }
  $('#theme-toggle').textContent = `Theme: ${THEME_LABELS[value]}`;
  announce(`Theme: ${THEME_LABELS[value]}`);
});

let sizeIndex = 0;
$('#text-size-toggle').addEventListener('click', () => {
  sizeIndex = (sizeIndex + 1) % SIZE_ORDER.length;
  const value = SIZE_ORDER[sizeIndex];
  if (value) document.documentElement.dataset.textSize = value;
  else delete document.documentElement.dataset.textSize;
  $('#text-size-toggle').textContent = `Text size: ${SIZE_LABELS[value]}`;
  announce(`Text size: ${SIZE_LABELS[value]}`);
});

let requestVersion = 0;






async function ask(input, meta = {}) {
  const version = ++requestVersion;
  // A new question stops any in-flight read-aloud.
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const button = $('#ask-button');
  button.disabled = true;
  button.classList.add('disabled');
  button.textContent = '';
  button.prepend(spinner());
  announce('Asking question...');
  document.title = '… Asking Northstar';
  $('#answer').replaceChildren(pendingAnswer());
  try {
    const r = await api('/v1/answers', input);
    if (version !== requestVersion) return;
    if (r.parsed?.city) {
      sessionState.lastCity = r.parsed.city;
      try { localStorage.setItem('northstar_last_city', r.parsed.city); } catch {}
      if ($('#city') && !$('#city').value) $('#city').value = r.parsed.city;
    }
    document.title = titleFor(currentView);
    resetAskButton(button);
    renderAnswer(r, { ...input, ...meta });
  } catch (err) {
    if (version !== requestVersion) return;
    document.title = titleFor(currentView);
    resetAskButton(button);
    clearPendingTimer();
    const { title, body, action } = humanizeError(err);
    const retry = action === 'Retry' || action === 'Edit';
    const box = el('article', undefined, 'result error');
    // Live-region announcement happens through role=alert itself.
    box.setAttribute('role', 'alert');
    box.append(el('span', title, 'error-title'));
    box.append(el('p', body, 'error-body'));
    if (retry) {
      if (err.retryAfterSeconds > 0) {
        // Honor the server's Retry-After hint with a disabled countdown button.
        let remaining = err.retryAfterSeconds;
        const btn = el('button', `Try again in ${remaining}s`, 'primary');
        btn.type = 'button';
        btn.disabled = true;
        btn.classList.add('disabled');
        const timer = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.textContent = 'Retry';
          } else {
            btn.textContent = `Try again in ${remaining}s`;
          }
        }, 1000);
        btn.addEventListener('click', () => {
          if (!btn.disabled) { clearInterval(timer); ask(input); }
        });
        box.append(btn);
      } else {
        const btn = el('button', 'Retry', 'primary');
        btn.type = 'button';
        btn.addEventListener('click', () => ask(input));
        box.append(btn);
      }
    }
    if (action === 'Edit') {
      const edit = el('button', 'Edit your question', 'primary');
      edit.type = 'button';
      edit.addEventListener('click', () => { $('#question').focus(); });
      box.append(edit);
    }
    $('#answer').replaceChildren(box);
  }
}

$('#question-form').addEventListener('submit', async e => {
  e.preventDefault();
  let rawQ = $('#question').value.trim();
  if (!rawQ) return;

  // Zero-PII Client-Side Masking (Rec 89)
  const piiPatterns = [
    [/\b\d{3}[- ]\d{2}[- ]\d{4}\b/g, '[REDACTED SSN]'],
    [/\b\d{3}[- ]\d{3}[- ]\d{3}\b/g, '[REDACTED SIN/TFN]'],
    [/\b(?:\d{4}[- ]){3}\d{4}\b/g, '[REDACTED CARD]'],
    [/\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/g, '[REDACTED PASSPORT]']
  ];
  let piiDetected = false;
  for (const [regex, replacement] of piiPatterns) {
    if (regex.test(rawQ)) {
      rawQ = rawQ.replace(regex, replacement);
      piiDetected = true;
    }
  }
  if (piiDetected) {
    $('#question').value = rawQ;
    announce('Personal identification numbers were automatically redacted before sending.');
  }

  const explicitLang = $('#user-lang')?.value;
  const userLang = detectUserLanguage(rawQ, explicitLang);
  const canonicalQ = normalizeToCanonicalEnglish(rawQ, userLang);
  const countryVal = $('#country')?.value || undefined;
  let cityVal = $('#city')?.value;
  const explicitForeignInQuery = /\b(?:united states|usa?|united kingdom|uk|britain|england|scotland|wales|australia|germany|deutschland|uae|united arab emirates|dubai|abu dhabi|new zealand|ireland|singapore|france|netherlands|sweden|spain|berlin|munich|frankfurt|london|sydney|melbourne|brisbane|auckland|dublin|paris|amsterdam|stockholm|madrid|barcelona)\b/i.test(canonicalQ);
  if (explicitForeignInQuery && !countryVal) {
    cityVal = undefined;
  } else if (!countryVal && !cityVal && sessionState.lastCity && !/\b(?:toronto|mississ?auga|brampton|vancouver)\b/i.test(canonicalQ)) {
    cityVal = sessionState.lastCity;
    if ($('#city')) $('#city').value = cityVal;
  }
  ask({ question: canonicalQ, city: cityVal || undefined, country: countryVal, language: 'en' }, { rawQuestion: rawQ, userLang });
});

$('#country')?.addEventListener('change', () => {
  const c = $('#country').value;
  const cityGroup = $('#city-group');
  updateCityDropdown(c, $('#city'), cityGroup);
  // Clear lastCity so Canadian city state never bleeds into foreign queries
  if (c) {
    sessionState.lastCity = '';
  }
  // Dynamically update placeholder according to selected country
  const placeholderMap = {
    'United States': 'e.g. How do I get an SSN, F-1 OPT work permit, H-1B, or apply for EB-2 NIW Green Card?',
    'United Kingdom': 'e.g. How do I get a National Insurance Number (NIN), Graduate Route visa, or Indefinite Leave to Remain (ILR)?',
    'Australia': 'e.g. How do I apply for a TFN, Medicare, Subclass 500 / 485 Graduate visa, or PR via 189/190?',
    'Germany': 'e.g. How do I register address (Anmeldung), get statutory health insurance, or § 16b / Niederlassungserlaubnis PR?',
    'United Arab Emirates': 'e.g. How do I get Emirates ID, UAE Golden Visa (investor/entrepreneur), or mandatory health insurance?',
    'New Zealand': 'e.g. How do I get an IRD number, enrolled in public healthcare, or apply for Skilled Migrant Category / Green List PR?',
    'Ireland': 'e.g. How do I obtain a PPS Number, Stamp 2 study rights, Stamp 1G post-study work, or PR?',
    'Singapore': 'e.g. How do I get an Employment Pass / S-Pass, Student Pass LTVP, CPF, or Singapore PR (PTS scheme)?',
    'France': 'e.g. How do I validate VLS-TS, register with Ameli / Sécurité Sociale, or apply for Passeport Talent / 10-year PR card?',
    'Netherlands': 'e.g. How do I obtain a BSN, mandatory basisverzekering health insurance, or HSM / permanent residency?',
    'Sweden': 'e.g. How do I register with Skatteverket for a Personnummer, access Försäkringskassan, or apply for permanent residency?',
    'Spain': 'e.g. How do I get an NIE/TIE, register Empadronamiento, access Tarjeta Sanitaria, or get Spanish permanent residency?'
  };
  const qField = $('#question');
  if (qField) {
    qField.placeholder = placeholderMap[c] || 'e.g. How do I apply for a health card, SIN, study permit, or Express Entry PR?';
  }
  exampleOffset = 0;
  renderExamples();
});

// Initialize city dropdowns and restore last active city from session context
updateCityDropdown($('#country')?.value || '', $('#city'), $('#city-group'));
updateCityDropdown($('#binder-country')?.value || 'Canada', $('#binder-city'), $('#binder-city-group'));
if (sessionState.lastCity && $('#city') && !$('#city').value) {
  $('#city').value = sessionState.lastCity;
}

// First-visit placeholder; every real result replaces it via replaceChildren.
const emptyState = el('div', undefined, 'empty-state');
emptyState.append(el('p', 'Ask a settlement question above. Every point links to its source, and unverified parts stay clearly labeled.'));
$('#answer').replaceChildren(emptyState);

renderExamples();

// Server-reported version in the about panel; best-effort, silent on failure.
api('/v1/meta').then(m => {
  const s = $('#about-version');
  if (s) s.textContent = `Version ${m.version} · English research preview`;
}).catch(() => {});

// Aggregate pilot footprint next to it. Counts only — no requests go out for
// it in page terms beyond one GET, and nothing user-specific exists there.
api('/v1/stats').then(s => {
  const t = $('#about-stats');
  if (t) t.textContent = `Right now: ${s.cities} cities · ${s.topics} topics · ${s.records} evidence records · ${s.pendingReview} awaiting human review. Next source expiry: ${s.nextExpiry}.`;
}).catch(() => {});

// Storage/request acceptance liveness, straight from /ready — best-effort.
fetch('/ready').then(async r => {
  const s = await r.json().catch(() => ({}));
  const t = $('#about-status');
  if (t) t.textContent = r.ok && s.status === 'ready' ? 'Service ready (storage connected).' : `Not ready: ${s.reason ?? 'unavailable'}.`;
}).catch(() => {});

// Live character counter plus a keyboard submit path.
const questionField = $('#question');
const charLimit = $('#char-limit');
questionField.addEventListener('input', () => {
  charLimit.textContent = `${questionField.value.length}/2000`;
});
questionField.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    $('#question-form').requestSubmit();
  }
});

// Shared-question prefill (P0-5, receiving side): a copied link carrying the
// question in its hash (#q=...&city=...) fills the form on open. The hash is
// immediately stripped from the address bar so the shared value never lingers
// in the URL; nothing is stored anywhere.
function prefillFromHash() {
  const params = new URLSearchParams(location.hash.startsWith('#') ? location.hash.slice(1) : '');
  const q = params.get('q');
  if (!q) return;
  questionField.value = q.slice(0, 2000);
  charLimit.textContent = `${questionField.value.length}/2000`;
  const city = params.get('city');
  if (city && CITIES.includes(city)) $('#city').value = city;
  exampleOffset = 0;
  renderExamples();
  announce('Question filled in from a shared link. Review it, then use Find guidance.');
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}
if (location.hash) prefillFromHash();
// Pasting a fresh link into an already-open tab prefills again; the strip
// above uses replaceState, which fires no hashchange event, so no loop.
window.addEventListener('hashchange', prefillFromHash);

// Human-handoff directory cache (P0-1): one public GET at boot, held here in
// the tab only. If it fails, the panel degrades to an honest pointer and never
// invents contact details.
let agencyData = null;
api('/v1/agencies').then(data => { agencyData = data; }).catch(() => {});

// People-first panel for unavailable or partial answers. A research preview
// must not strand a reader with no next step; the tiered AI-to-human pattern is
// exactly what IRCC-funded projects like SettleSMART build. Links are sourced,
// labeled, and Northstar is never presented as their partner.
function humanPanel(city, fullyUnavailable) {
  const panel = el('details', undefined, 'human-panel');
  panel.append(el('summary', fullyUnavailable
    ? 'Talk to a person about this'
    : 'Talk to a person about what is still unverified'));
  panel.append(el('p', 'Northstar is a research preview without staff. These organizations answer newcomer questions directly; their eligibility rules are their own and have recently shifted for some groups — from April 1, 2026, economic-class permanent residents can access some federally funded services only in a limited time window.'));
  const list = el('ul', undefined, 'agency-list');
  const entries = city && Array.isArray(agencyData?.[city])
    ? [...agencyData[city], ...(agencyData?.national ?? [])]
    : agencyData?.national;
  if (entries?.length) {
    entries.forEach(a => {
      const li = el('li');
      li.append(link(a.name, a.url));
      if (a.channel) li.append(el('span', `Reach: ${a.channel}`, 'agency-channel'));
      li.append(el('small', a.note));
      list.append(li);
    });
  } else {
    // No fabricated contacts when the directory could not load.
    list.append(el('li', 'The handoff directory could not be loaded this session. The official Government of Canada pages on Canada.ca list newcomer service finders and IRCC contact lines.'));
  }
  panel.append(list);
  return panel;
}

// Shown above everything else, whatever the evidence status: reaching help must
// not depend on a reviewed answer existing.
function urgentHelpCard(help) {
  const card = el('section', undefined, 'sos-card emergency-high urgent-help-card');
  card.setAttribute('role', 'alert');
  const header = el('div', undefined, 'sos-card-header');
  header.append(el('h3', help.title), el('span', 'Urgent', 'sos-badge danger'));
  card.append(header, el('p', help.message));
  const contacts = el('ul', undefined, 'urgent-help-contacts');
  help.contacts.forEach(c => {
    const li = el('li');
    const call = el('a', c.phone, 'urgent-help-phone');
    call.href = `tel:${c.phone.replace(/[^0-9+]/g, '')}`;
    li.append(call, el('span', c.label));
    contacts.append(li);
  });
  card.append(contacts);
  if (help.helpView) {
    const open = el('button', 'Open Emergency Help steps', 'urgent-help-open');
    open.type = 'button';
    open.addEventListener('click', () => document.querySelector(`[data-view="${help.helpView}"]`)?.click());
    card.append(open);
  }
  return card;
}

function renderAnswer(r, original) {
  clearPendingTimer();
  const box = el('article', undefined, 'result advisory-result');
  box.lang = r.parsed.language;

  // 1. Advisory Hero Header
  const heroHeader = el('div', undefined, 'advisory-hero-header');
  const country = r.parsed?.country || 'CA';
  const flagMap = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'United Arab Emirates': '🇦🇪',
    'New Zealand': '🇳🇿',
    'Ireland': '🇮🇪',
    'Singapore': '🇸🇬',
    'France': '🇫🇷',
    'Netherlands': '🇳🇱',
    'Sweden': '🇸🇪',
    'Spain': '🇪🇸'
  };
  const isGlobal = country !== 'CA';
  const flag = flagMap[country] || (isGlobal ? '🌐' : '🍁');
  const pillText = isGlobal
    ? `${flag} ${r.parsed?.city ? r.parsed.city + ', ' : ''}${country} Settlement Advisory · National Statutory Guidance`
    : `🍁 Canadian Settlement Advisory · ${r.parsed.city ? r.parsed.city + ', ' : ''}${r.parsed.region || 'National Guidance'}`;
  const locationPill = el('span', pillText, 'advisory-location-pill');
  heroHeader.append(locationPill);

  const aiMeta = AI_STATUS_META[r.ai?.status];
  if (aiMeta) {
    const [label, caution] = aiMeta;
    heroHeader.append(el('span', label, `ai-badge${caution ? ' ai-warn' : ''}`));
  }

  const fresh = freshnessChip(r.sources || []);
  if (fresh) heroHeader.append(fresh);
  box.append(heroHeader);
  if (r.urgentHelp) box.append(urgentHelpCard(r.urgentHelp));
  if (r.referenceCoverage) box.append(el('p', r.referenceCoverage.message, 'reference-coverage-note'));

  // The server's presentation (headline, summary, sections) renders every
  // answer that has evidence; answers without claims keep the status headline.
  const view = r.claims.length && r.presentation?.sections?.length ? r.presentation : null;

  // 2. Clear Advisory Headline
  if (!view) {
    const headingText = r.status === 'clarification' ? 'Location Clarification Needed'
      : r.status === 'unavailable' ? 'Information Currently Being Researched'
      : r.status === 'partial' ? 'Settlement Guidance (Partial Coverage)'
      : 'Official Settlement Guidance & Action Plan';
    box.append(el('h2', headingText, 'advisory-title'));
    box.append(el('p', r.notice, 'muted advisory-notice'));
  }

  if (r.clarification) {
    const p = el('p', r.clarification, 'warning');
    box.append(p);
    announce(r.clarification);
  }

  if (r.claims?.length) {
    const multiCard = renderMultilingualSynthesisCard(r, original);
    if (multiCard) box.append(multiCard);
  }

  const choices = locationChoices(r);
  if (choices.length) {
    const followUp = el('div', undefined, 'examples');
    followUp.setAttribute('role', 'group');
    followUp.setAttribute('aria-label', 'Choose a city for your original question');
    followUp.append(el('p', `Continue your question: ${original.question}`));
    for (const city of choices) {
      const choice = el('button', city);
      choice.type = 'button';
      choice.addEventListener('click', async () => {
        if ($('#question').value !== original.question) {
          followUp.replaceChildren(el('p', 'Your question has changed. Submit it using Find guidance.', 'warning'));
          announce('Question changed. Please submit using Find guidance.');
          return;
        }
        const input = locationFollowUp(original, r, city);
        followUp.querySelectorAll('button').forEach(b => b.disabled = true);
        $('#city').value = city;
        ask(input);
      });
      followUp.append(choice);
    }
    box.append(followUp);
    announce(`Choose a city for your question: ${choices.join(', ')}.`);
  } else if (r.parsed.missingSlots?.includes('location')) {
    const edit = el('button', 'Edit the location in my question');
    edit.type = 'button';
    edit.addEventListener('click', () => { $('#question').focus(); });
    box.append(edit);
  }

  if (r.status === 'unavailable' && r.parsed.city && !r.clarification && !/\b(?:toronto|mississ?auga|brampton|vancouver|ontario|bc|british columbia|square one)\b/i.test(original.question)) {
    const holder = el('div', undefined, 'examples');
    holder.setAttribute('role', 'group');
    holder.setAttribute('aria-label', 'Try the same question in another pilot city');
    holder.append(el('p', `Nothing is verified for ${r.parsed.city} here yet. The same question may be covered in:`));
    for (const city of CITIES.filter(c => c !== r.parsed.city)) {
      const b = el('button', `${city} ↗`);
      b.type = 'button';
      b.addEventListener('click', () => {
        if ($('#question').value !== original.question) {
          holder.replaceChildren(el('p', 'Your question has changed. Submit it using Find guidance.', 'warning'));
          announce('Question changed. Please submit using Find guidance.');
          return;
        }
        $('#city').value = city;
        ask({ question: original.question, city, language: 'en' });
      });
      holder.append(b);
    }
    box.append(holder);
  }

  // 3. Primary Structured Advisory Content
  if (view) {
    box.append(renderPresentation(view, { labelFor, link, sourceCount: view.citations.length }));
  }

  // 4. Gaps and Human Support
  if (r.gaps.length) {
    const gapBox = el('section', undefined, 'answer-gaps');
    gapBox.append(el('h3', 'What this answer cannot confirm yet', 'answer-eyebrow'));
    const list = el('ul');
    r.gaps.forEach(g => {
      const li = el('li');
      li.append(el('strong', `${g.topic ? labelFor(g.topic) : 'Your question'}: `), document.createTextNode(humanizeGap(g.reason)));
      list.append(li);
    });
    gapBox.append(list);
    box.append(gapBox);
  }
  if (view) box.append(el('p', r.notice, 'muted answer-notice'));

  if ((r.status === 'unavailable' || r.status === 'partial') && !r.clarification) {
    box.append(humanPanel(r.parsed.city, r.status === 'unavailable'));
  }

  // 5. Collapsible Technical Diagnostics & Audit Verification (collapsed by default)
  const techDetails = el('details', undefined, 'technical-diagnostics');
  techDetails.append(el('summary', `⚙️ Technical details (${r.latencyMs} ms · ${r.status})`));

  const tagLine = el('span', `${r.status} · ${r.parsed.city || r.parsed.region || 'Canada'} · ${r.latencyMs} ms engine · rendered ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'status');
  techDetails.append(tagLine);

  if (r.verification) {
    const v = r.verification;
    const bits = [];
    if (v.claimsTotal) bits.push(`${v.claimsTotal} guidance point${v.claimsTotal === 1 ? '' : 's'} quoted from registered sources — ${v.editorReviewedClaims ?? 0} reviewed by an editor, ${v.sourceVerifiedClaims ?? 0} checked automatically against the official page, ${v.bulkApprovedClaims ?? v.approvedClaims} bulk-approved without individual review, ${v.seedClaims} research seed`);
    if (v.reviewPendingTopics) bits.push(`${v.reviewPendingTopics} related record${v.reviewPendingTopics === 1 ? '' : 's'} still awaiting independent human review`);
    if (v.unverifiedTopics) bits.push(`${v.unverifiedTopics} part${v.unverifiedTopics === 1 ? '' : 's'} of this question ${v.unverifiedTopics === 1 ? 'has' : 'have'} no verified source yet`);
    else if (!v.claimsTotal) bits.push('no evidence matched this question');
    techDetails.append(el('p', `Why this status: ${bits.join(' · ')}.`, 'muted'));
  }

  if (r.answerability) {
    const ans = r.answerability;
    const block = el('div', undefined, 'answerability');
    block.append(el('span', `What your question asked for: ${ans.requestedOutput.replaceAll('_', ' ')} · What this answer provides: ${ans.providedOutput.replaceAll('_', ' ')} · ${humanizeAnswerStatus(ans.status)}`, 'status'));
    if (ans.facets?.length) {
      const facetLabel = f => f.id === 'ordered_checklist'
        ? 'Ordered checklist'
        : f.id.startsWith('eligibility_')
          ? `Personal eligibility — ${labelFor(f.topic)}`
          : f.id.replaceAll('_', ' ');
      const list = el('ul', undefined, 'facet-list');
      for (const f of ans.facets) {
        const li = el('li');
        li.append(el('strong', facetLabel(f)));
        li.append(document.createTextNode(f.status === 'supported'
          ? ' — provided below from sourced evidence'
          : ` — ${humanizeGap(f.reason)}`));
        list.append(li);
      }
      block.append(list);
    }
    techDetails.append(block);
  }

  const retrieval = retrievalPanel(r.retrieval);
  if (retrieval) techDetails.append(retrieval);

  if (r.sources.length) {
    const details = el('details', undefined, 'sources');
    details.append(el('summary', `Inspect ${r.sources.length} evidence source${r.sources.length > 1 ? 's' : ''}`));
    r.sources.forEach(s => {
      const d = el('div', undefined, 'source');
      d.append(link(s.title, s.url));
      d.append(el('small', `${s.jurisdiction} · ${reviewLabel(s)[2]} · Checked ${s.checkedAt} (${relDate(s.checkedAt)}) · Expires ${s.expiresAt} (${relDate(s.expiresAt)})`));
      d.append(el('p', `Source excerpt: "${s.quote}"`));
      details.append(d);
    });
    techDetails.append(details);
  }

  box.append(techDetails);

  // Keep the answer usable beyond the browser: copy as text or print.
  const actions = el('div', undefined, 'answer-actions');
  const copy = el('button', 'Copy as report', 'secondary');
  copy.type = 'button';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(answerReport(r, original));
      copy.disabled = true;
      copy.textContent = 'Report copied';
      announce('The answer and its sources were copied as plain text.');
    } catch {
      copy.textContent = 'Copy unavailable';
      actions.append(el('small', 'Your browser declined clipboard access. Printing works without that permission.', 'copy-note'));
      announce('Copying was not possible in this browser. Print produces the same report.');
    }
  });
  const print = el('button', 'Print', 'secondary');
  print.type = 'button';
  print.addEventListener('click', () => window.print());
  // Question-share link (P0-5): the question text itself rides in the URL hash
  // so someone else can open the form pre-filled and run it themselves.
  // Nothing is uploaded to shorten or store the link, and the wording below
  // states plainly that the question text is in the link.
  const share = el('button', 'Copy question link', 'secondary');
  share.type = 'button';
  share.addEventListener('click', async () => {
    try {
      const hash = `#q=${encodeURIComponent(original.question)}${original.city ? `&city=${encodeURIComponent(original.city)}` : ''}`;
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${hash}`);
      share.textContent = 'Link copied';
      announce('Question link copied. It contains your question text — opening it fills the form in.');
    } catch {
      share.textContent = 'Copy unavailable';
      actions.append(el('small', 'Your browser declined clipboard access. Selecting the address bar text works instead.', 'copy-note'));
      announce('Copying was not possible in this browser.');
    }
  });
  // Read-aloud (P0-2): Web Speech synthesis, browser-local. It reads exactly
  // what is on screen, keeps nothing, and stays cancelable at every step.
  const speak = el('button', 'Read aloud', 'secondary');
  speak.type = 'button';
  if ('speechSynthesis' in window) {
    speak.addEventListener('click', () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        speak.textContent = 'Read aloud';
        return;
      }
      const lines = [
        `Status: ${r.status.replaceAll('_', ' ')}.`,
        `${r.message}.`,
        `${r.notice}.`,
        ...r.claims.map(c => c.text),
        ...r.gaps.map(g => `${g.topic || 'Question'}: ${humanizeGap(g.reason)}`),
        `The answer also lists ${r.sources.length} evidence source${r.sources.length === 1 ? '' : 's'} with their checked and expiry dates; the printable report contains them in full.`
      ];
      const utterance = new SpeechSynthesisUtterance(lines.join(' '));
      utterance.lang = 'en';
      utterance.rate = 0.95;
      utterance.onend = () => { speak.textContent = 'Read aloud'; };
      utterance.onerror = () => { speak.textContent = 'Read aloud'; };
      speechSynthesis.speak(utterance);
      speak.textContent = 'Stop reading';
      announce('Reading the answer aloud. Use Stop reading to end it.');
    });
  } else {
    speak.disabled = true;
    speak.classList.add('disabled');
    speak.setAttribute('aria-label', 'Read aloud unavailable in this browser');
  }
  actions.append(copy, share, print, speak);
  box.append(actions);

  const feedback = el('div', undefined, 'feedback');
  for (const [issue, label] of [
    ['helpful', 'Helpful'],
    ['incorrect', 'Report an error'],
    ['missing', 'Missing information'],
    ['outdated', 'Outdated']
  ]) {
    const b = el('button', label);
    b.type = 'button';
    b.addEventListener('click', async () => {
      b.disabled = true;
      try {
        await api('/v1/feedback', { traceId: r.traceId, issue });
        // Replace the whole group so only one saved rating stands per answer.
        feedback.replaceChildren(el('span', 'Feedback saved. Thank you.'));
        announce(`You rated this answer as ${label.toLowerCase()}.`);
      } catch (e) {
        feedback.replaceChildren(el('span', e.message));
      }
    });
    feedback.append(b);
  }
  box.append(feedback);

  // 4. Contextual Follow-up Suggestions & Conversational Continuity
  const currentCountry = r.parsed?.country || 'CA';
  // The suggestions fall back to Canadian programmes, which do not apply here.
  const followups = r.referenceCoverage ? [] : buildFollowupSuggestions(r, original, currentCountry);
  if (followups) box.append(followups);

  // 5. Session History Memory Drawer
  sessionState.history.unshift({
    question: original.question,
    country: currentCountry,
    city: r.parsed?.city || '',
    headline: r.claims[0]?.text || r.notice || 'Settlement Guidance',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  if (sessionState.history.length > 1) {
    box.append(buildSessionHistoryDrawer());
  }

  announce(r.status === 'guidance' ? 'An answer has been found.' : r.status === 'partial' ? 'An answer was found, but some parts are still unverified.' : 'An answer is not yet available.');
  $('#answer').replaceChildren(box);
  // On a phone the form fills the screen, so an answer rendered below it looks
  // like no answer at all.
  if (box.getBoundingClientRect().top > window.innerHeight * 0.6) box.scrollIntoView({ block: 'start' });
}

let coverageData = null;
let topicMap = null; // id → human label from /v1/topics; falls back to raw ids
let coverageView = 'cards';
let coverageSort = 'alpha';
let coverageGapHighlight = false;

const labelFor = id => (topicMap?.get(id) || id) || id;

function renderCoverage() {
  const grid = $('#coverage-cards');
  if (!grid) return;
  if (coverageView === 'matrix') grid.replaceChildren(buildCoverageMatrix());
  else renderCoverageCards(grid);
}


// Printing opens the evidence sections so sources appear on paper.
window.addEventListener('beforeprint', () => document.querySelectorAll('#answer details').forEach(d => d.open = true));
window.addEventListener('afterprint', () => document.querySelectorAll('#answer details').forEach(d => d.open = false));

// Copy buttons in tool results copy the text of the element right after them.
// Delegated, because the CSP blocks inline onclick handlers in rendered templates.
document.addEventListener('click', e => {
  const button = e.target.closest?.('[data-copy-next]');
  if (!button) return;
  navigator.clipboard.writeText(button.nextElementSibling?.innerText ?? '').then(() => {
    button.textContent = 'Copied!';
    setTimeout(() => { button.textContent = button.dataset.copyLabel || 'Copy'; }, 2000);
  }).catch(() => {});
});







let ocrScannerInitialized = false;

function renderOcrScanner() {
  const container = $('#ocr-scanner');
  if (!container) return;
  if (ocrScannerInitialized && container.children.length > 0) return;
  ocrScannerInitialized = true;
  container.innerHTML = '';

  const header = el('div', undefined, 'ocr-scanner-header');
  header.append(el('h3', '🔍 Client-Side Pre-Flight Document Pre-Check', 'ocr-scanner-title'));
  header.append(el('span', '🔒 100% Client-Side In-Memory (Zero Server Upload)', 'ocr-privacy-pill'));
  container.append(header);

  container.append(el('p', 'Pre-check your Proof of Address 90-day recency, Passport 6-month border validity, or certified translation seals before queuing at government offices or bank branches.', 'ocr-scanner-desc'));

  const inputArea = el('div', undefined, 'ocr-input-area');

  const dropzone = el('div', undefined, 'ocr-dropzone');
  dropzone.append(el('p', 'Choose a plain-text document extract or paste text below'));
  dropzone.append(el('small', 'Image and PDF extraction is not supported; paste text you have checked'));

  const fileInput = el('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,text/plain';
  fileInput.style.display = 'none';
  dropzone.append(fileInput);

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          textArea.value = ev.target.result;
          runScan(ev.target.result);
        };
        reader.readAsText(file);
      } else {
        textArea.value = '';
        textArea.placeholder = 'Unsupported file. Paste verified text or choose a .txt file. No document analysis was performed.';
        const existingResults = container.querySelector('.ocr-results');
        if (existingResults) existingResults.replaceChildren();
      }
    }
  });

  inputArea.append(dropzone);

  const textArea = el('textarea', undefined, 'ocr-text-input');
  textArea.placeholder = 'Paste utility bill, bank statement date, or passport MRZ line text here to analyze compliance...';
  textArea.addEventListener('input', () => runScan(textArea.value));
  inputArea.append(textArea);

  // Quick Samples Bar
  const samplesBar = el('div', undefined, 'ocr-samples-bar');
  samplesBar.append(el('span', 'Quick Test Samples:', 'ocr-samples-label'));

  const samples = [
    { label: '📄 Recent Bill (21 Days)', text: 'Enbridge Gas Statement Date: October 10, 2026. Account Balance: $45.20' },
    { label: '❌ Expired Statement (172 Days)', text: 'Toronto Hydro Bill Date: May 12, 2026. Residential Service.' },
    { label: '🛂 Valid Passport (34 Mos)', text: 'Passport of India. Expiry Date: 2029-08-15. MRZ: P<INDDOE<<JANE<<<<<<<<<<<<<<<<<< 1234567<8IND9001019F2908154<<<<<<<6' },
    { label: '⚠️ Expiring Passport (2 Mos)', text: 'Passport of Canada. Expiry Date: 2026-12-05' },
    { label: '📜 ATIO Certified Seal', text: 'Certified Translation by ATIO Certified Translator #2841. Sworn statement of accuracy.' }
  ];

  samples.forEach(s => {
    const btn = el('button', s.label, 'ocr-sample-btn');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      textArea.value = s.text;
      runScan(s.text);
    });
    samplesBar.append(btn);
  });

  inputArea.append(samplesBar);

  const verdictBox = el('div', undefined, 'ocr-verdict-box verdict-compliant');
  verdictBox.id = 'ocr-verdict-box';
  inputArea.append(verdictBox);

  container.append(inputArea);

  function runScan(text) {
    if (!text || !text.trim()) {
      verdictBox.style.display = 'none';
      return;
    }
    verdictBox.style.display = 'block';
    const analysis = analyzeDocumentText(text);

    verdictBox.className = `ocr-verdict-box verdict-${analysis.verdict}`;
    verdictBox.innerHTML = '';

    const badge = el('span', analysis.statusBadge, `ocr-verdict-badge badge-${analysis.verdict}`);
    verdictBox.append(badge);

    const desc = el('p', analysis.details, 'ocr-verdict-text');
    verdictBox.append(desc);

    const cite = el('div', `Governing Statutory Rule: ${analysis.statutoryRule}`, 'ocr-statutory-cite');
    verdictBox.append(cite);

    // Auto-link verified document to binder checklist
    if (analysis.verdict === 'compliant') {
      let targetSelector = '';
      if (analysis.docType === 'address') targetSelector = 'input[id*="proof"], input[id*="bill"], input[id*="address"]';
      else if (analysis.docType === 'passport') targetSelector = 'input[id*="passport"]';
      else if (analysis.docType === 'translation') targetSelector = 'input[id*="translation"]';

      if (targetSelector) {
        const targetCb = document.querySelector(targetSelector);
        if (targetCb && !targetCb.checked) {
          targetCb.checked = true;
          targetCb.dispatchEvent(new Event('change'));
          const parentLi = targetCb.closest('li');
          if (parentLi && !parentLi.querySelector('.ocr-verified-badge')) {
            const vBadge = el('span', '✓ OCR Verified', 'ocr-verified-badge');
            parentLi.append(vBadge);
          }
        }
      }
    }
  }

  // Run default scan on first sample
  runScan(samples[0].text);
}


function renderBinder() {
  renderOcrScanner();
  const container = $('#binder-checklist');
  if (!container) return;
  const country = $('#binder-country')?.value || 'Canada';
  const status = $('#binder-status')?.value || 'work_permit';
  const city = $('#binder-city')?.value || (country === 'Canada' ? 'Toronto' : '');
  const checkedSet = loadBinderChecked();

  renderPreflightBanner(country, status);
  container.replaceChildren();

  let totalItems = 0;
  let verifiedItems = 0;

  const docList = BINDER_DOCUMENTS_BY_COUNTRY[country] || BINDER_DOCUMENTS;
  docList.forEach(cat => {
    const filteredItems = cat.items.filter(item => {
      const matchStatus = !item.statuses || item.statuses.includes('all') || item.statuses.includes(status);
      const matchCity = country !== 'Canada' || !item.cities || item.cities.includes(city);
      return matchStatus && matchCity;
    });

    if (!filteredItems.length) return;

    const card = el('div', undefined, 'binder-section-card');
    card.append(el('h3', cat.category, 'binder-section-title'));

    const ul = el('ul', undefined, 'binder-doc-list');
    filteredItems.forEach(item => {
      totalItems++;
      const isChecked = checkedSet.has(item.id);
      if (isChecked) verifiedItems++;

      const li = el('li', undefined, `binder-doc-item${isChecked ? ' checked' : ''}`);

      const cb = el('input');
      cb.type = 'checkbox';
      cb.id = `binder-cb-${item.id}`;
      cb.className = 'binder-checkbox';
      cb.checked = isChecked;
      cb.setAttribute('aria-label', `Mark ${item.name} as verified`);

      cb.addEventListener('change', () => {
        if (cb.checked) {
          checkedSet.add(item.id);
          li.classList.add('checked');
        } else {
          checkedSet.delete(item.id);
          li.classList.remove('checked');
        }
        saveBinderChecked(checkedSet);
        updateBinderProgress(totalItems, checkedSet.size);
      });

      const details = el('div', undefined, 'binder-doc-details');
      const header = el('div', undefined, 'doc-header');
      const lbl = el('label', item.name, 'doc-name');
      lbl.setAttribute('for', `binder-cb-${item.id}`);
      header.append(lbl);
      header.append(el('span', item.authority, 'doc-authority'));
      details.append(header);
      details.append(el('p', item.tip, 'doc-tip'));

      // Pre-flight smart rule notes
      const itemName = (item.name + ' ' + (item.tip || '')).toLowerCase();
      if (itemName.includes('lease') || itemName.includes('tenancy') || itemName.includes('utility') || itemName.includes('bank statement') || itemName.includes('anmeldung') || itemName.includes('ejari') || itemName.includes('address')) {
        details.append(el('div', '⚠️ Pre-Flight Rule: Must be dated within 90 days of registration. Government identity registries and banks reject older address proofs.', 'preflight-rule-note'));
      } else if (itemName.includes('passport')) {
        details.append(el('div', '🛂 Pre-Flight Rule: Ensure passport has at least 6 months remaining validity beyond your landing date to prevent airline boarding refusal.', 'preflight-rule-note'));
      } else if (itemName.includes('driver') || itemName.includes('licence') || itemName.includes('license') || itemName.includes('birth certificate') || itemName.includes('marriage')) {
        details.append(el('div', '🌐 Pre-Flight Rule: Foreign language documents require official certified translation (e.g. ATIO in ON, STIBC in BC, NAATI in AU, Sworn translator in Germany).', 'preflight-rule-note'));
      } else if (itemName.includes('work permit') || itemName.includes('i-9') || itemName.includes('share code') || itemName.includes('vevo')) {
        details.append(el('div', '💼 Statutory Right-to-Work: Keep original physical authorization or digital share code ready for day-one employer I-9 / RTW verification.', 'preflight-rule-note'));
      }

      li.append(cb, details);
      ul.append(li);
    });

    card.append(ul);
    container.append(card);
  });

  updateBinderProgress(totalItems, verifiedItems);
}


$('#binder-country')?.addEventListener('change', () => {
  const country = $('#binder-country').value;
  const cityGroup = $('#binder-city-group');
  updateCityDropdown(country, $('#binder-city'), cityGroup);
  renderBinder();
});
$('#binder-status')?.addEventListener('change', () => renderBinder());
$('#binder-city')?.addEventListener('change', () => renderBinder());
$('#binder-print-btn')?.addEventListener('click', () => window.print());
$('#binder-reset-btn')?.addEventListener('click', () => {
  if (confirm('Reset all checkmarks for this profile?')) {
    localStorage.removeItem(getBinderStorageKey());
    renderBinder();
  }
});


// "What we can't answer yet" (P0-2): public failure transparency. Aggregate
// counts of open unanswered-demand items only — owner names, notes, item ids
// and any question content stay behind the admin token, by contract.
function buildGapsPanel(gaps) {
  const panel = el('details', undefined, 'gaps-panel');
  panel.append(el('summary', "What we can't answer yet"));
  const t = gaps.totals;
  panel.append(el('p', `${t.open} open · ${t.inProgress} in progress · ${t.resolved} resolved · ${t.deferred} deferred.`));
  const list = el('ul', undefined, 'gaps-list');
  gaps.items.forEach(item => {
    const li = el('li');
    li.append(el('strong', `${item.occurrences} report${item.occurrences === 1 ? '' : 's'}`));
    const label = `${item.topic ? labelFor(item.topic) : 'Unclassified'}${item.subject ? ` · ${item.subject.replaceAll('_', ' ')}` : ''} — ${humanizeGap(item.reason)}${item.scope ? ` (${item.scope})` : ''}`;
    li.append(document.createTextNode(label));
    list.append(li);
  });
  if (!gaps.items.length) panel.append(el('p', 'No open unanswered-demand items right now.', 'muted'));
  panel.append(list);
  panel.append(el('p', 'Aggregate counts only — no question text, owner or identifier is public. Full details stay in the editorial desk.', 'muted'));
  return panel;
}

async function loadCoverage() {
  const container = $('#coverage-content');
  container.replaceChildren(spinner());
  announce('Loading coverage map...');
  try {
    ({ coverage: coverageData } = await api('/v1/coverage'));
    // Human topic names come from the server's catalog so the UI never
    // hardcodes a topic list the engine would need to re-derive.
    try {
      const catalog = await api('/v1/topics');
      topicMap = new Map(catalog.topics.map(t => [t.id, t.label]));
    } catch { topicMap = null; }
    const legend = el('p', undefined, 'legend');
    legend.append(el('span', 'Topic status'));
    for (const [cls, label] of [
      ['t-ok', 'Source guidance'],
      ['t-review', 'Review or refresh needed'],
      ['t-missing', 'Missing']
    ]) {
      const item = el('span');
      const swatch = el('i');
      swatch.className = cls;
      item.append(swatch, document.createTextNode(label));
      legend.append(item);
    }
    const languages = [...new Set(coverageData.map(c => c.language))];
    legend.append(el('span', languages.length === 1 ? `Language: English only` : 'Language: mixed'));
    // The currency feed is best-effort: its failure never blocks the coverage
    // map, and the panel explains itself instead.
    let changesPanel;
    try {
      changesPanel = buildChangesPanel(await api('/v1/changes'));
    } catch {
      changesPanel = el('details', undefined, 'changes-panel');
      changesPanel.append(el('summary', 'What changed recently'));
      changesPanel.append(el('p', 'The evidence-currency feed could not be loaded this session.', 'muted'));
    }
    // Failure transparency is likewise best-effort and never blocks the map.
    let gapsPanel;
    try {
      gapsPanel = buildGapsPanel(await api('/v1/gaps'));
    } catch {
      gapsPanel = el('details', undefined, 'gaps-panel');
      gapsPanel.append(el('summary', "What we can't answer yet"));
      gapsPanel.append(el('p', 'The unanswered-demand feed could not be loaded this session.', 'muted'));
    }
    const controls = buildCoverageControls();
    const compare = buildCoverageCompare();
    const grid = el('div');
    grid.id = 'coverage-cards';
    const compareResult = el('div');
    compareResult.id = 'coverage-compare';
    compareResult.setAttribute('aria-live', 'polite');
    container.replaceChildren(legend, changesPanel, gapsPanel, controls, compare, grid, compareResult);
    renderCoverage();
    announce(`Coverage map loaded: ${coverageData.length} cities.`);
  } catch (e) {
    container.replaceChildren(el('article', undefined, 'result error'));
    const { title, body } = humanizeError(e);
    const box = container.lastElementChild;
    box.setAttribute('role', 'alert');
    box.append(el('p', title, 'error-title'), el('p', body, 'error-body'));
    announce('Coverage map could not be loaded.');
  }
}

function buildCoverageControls() {
  const controls = el('div', undefined, 'coverage-filters');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Filter coverage by status');
  const all = coverageData.flatMap(c => c.topics);
  const chips = [
    ['all', 'All'],
    ['topic-ok', 'Source guidance'],
    ['topic-review', 'Needs review'],
    ['topic-missing', 'Missing']
  ].map(([cls, label]) => {
    const count = cls === 'all' ? all.length : all.filter(t => coverageTileClass(t) === cls).length;
    const chip = el('button', `${label} (${count})`);
    chip.type = 'button';
    chip.dataset.role = 'filter';
    chip.setAttribute('aria-pressed', String(coverageFilter.status === cls));
    chip.addEventListener('click', () => {
      coverageFilter.status = cls;
      controls.querySelectorAll('[data-role="filter"]').forEach(x => x.setAttribute('aria-pressed', String(x === chip)));
      renderCoverage();
      const shown = $('#coverage-cards').querySelectorAll('.topic, tbody tr').length;
      announce(`Coverage filtered: ${shown} topics shown.`);
    });
    return chip;
  });
  controls.append(...chips);
  // Card vs matrix presentation.
  const modeBtn = el('button', coverageView === 'matrix' ? 'City cards' : 'Compare cities');
  modeBtn.type = 'button';
  modeBtn.dataset.role = 'mode';
  modeBtn.setAttribute('aria-pressed', String(coverageView === 'matrix'));
  modeBtn.addEventListener('click', () => {
    coverageView = coverageView === 'matrix' ? 'cards' : 'matrix';
    modeBtn.setAttribute('aria-pressed', String(coverageView === 'matrix'));
    modeBtn.textContent = coverageView === 'matrix' ? 'City cards' : 'Compare cities';
    highlightBtn.hidden = coverageView !== 'matrix';
    renderCoverage();
    announce(coverageView === 'matrix' ? 'Coverage compared city by city.' : 'Coverage shown as city cards.');
  });
  controls.append(modeBtn);
  // Gaps stand out harder in the matrix on demand — rows/cells with no
  // source guidance get a stronger surface color.
  const highlightBtn = el('button', 'Highlight gaps');
  highlightBtn.type = 'button';
  highlightBtn.dataset.role = 'highlight';
  highlightBtn.hidden = coverageView !== 'matrix';
  highlightBtn.setAttribute('aria-pressed', String(coverageGapHighlight));
  highlightBtn.addEventListener('click', () => {
    coverageGapHighlight = !coverageGapHighlight;
    highlightBtn.setAttribute('aria-pressed', String(coverageGapHighlight));
    renderCoverage();
    announce(coverageGapHighlight ? 'Gaps are highlighted in the comparison.' : 'Gap highlighting is off.');
  });
  controls.append(highlightBtn);
  // Ordering: alphabetical, or gaps first for review triage.
  const sortBtn = el('button', coverageSort === 'alpha' ? 'Sort: Most gaps' : 'Sort: City A–Z');
  sortBtn.type = 'button';
  sortBtn.dataset.role = 'sort';
  sortBtn.addEventListener('click', () => {
    coverageSort = coverageSort === 'alpha' ? 'gaps' : 'alpha';
    sortBtn.textContent = coverageSort === 'alpha' ? 'Sort: Most gaps' : 'Sort: City A–Z';
    renderCoverage();
    announce(coverageSort === 'gaps' ? 'Coverage ordered by gaps first.' : 'Coverage ordered alphabetically.');
  });
  controls.append(sortBtn);
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Filter topics…';
  search.setAttribute('aria-label', 'Filter coverage by topic name');
  search.value = coverageFilter.q;
  search.addEventListener('input', () => {
    coverageFilter.q = search.value.trim().toLowerCase();
    renderCoverage();
  });
  controls.append(search);
  // Client-generated CSV of exactly what is on the map. No storage side roads:
  // the blob is created, downloaded and revoked in-page.
  const exportBtn = el('button', 'Download coverage CSV');
  exportBtn.type = 'button';
  exportBtn.dataset.role = 'export';
  exportBtn.addEventListener('click', () => {
    const rows = [['city', 'region', 'topic', 'label', 'status', 'sources']];
    for (const c of coverageData) for (const t of c.topics) rows.push([c.city, c.region, t.topic, labelFor(t.topic), t.status, t.count]);
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = el('a');
    a.href = url;
    a.download = 'northstar-coverage.csv';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    announce('Coverage data downloaded as CSV. Nothing is stored by the pilot.');
  });
  controls.append(exportBtn);
  return controls;
}

// Side-by-side status deltas between two pilot cities, so "what does
// Vancouver have that Toronto doesn't" is one honest list instead of two maps.
function buildCoverageCompare() {
  const form = el('form', undefined, 'coverage-compare-form');
  form.setAttribute('aria-label', 'Compare coverage between two cities');
  const cityOptions = coverageData.map(c => c.city);
  const mk = (label, value) => {
    const wrap = el('label', label);
    const sel = el('select');
    cityOptions.forEach(city => { const o = el('option', city); if (city === value) o.selected = true; sel.append(o); });
    wrap.append(sel);
    return sel;
  };
  const a = mk('City A', 'Toronto');
  const b = mk('City B', 'Vancouver');
  const btn = el('button', 'Compare');
  btn.type = 'submit';
  btn.className = 'secondary';
  form.append(a, b, btn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const out = $('#coverage-compare');
    if (a.value === b.value) { out.replaceChildren(el('p', 'Choose two different cities to compare.', 'muted')); return; }
    const ca = coverageData.find(c => c.city === a.value), cb = coverageData.find(c => c.city === b.value);
    const lines = [];
    const tiles = [].concat(ca.topics, cb.topics);
    for (const topic of [...new Set(tiles.map(t => t.topic))]) {
      const ta = ca.topics.find(t => t.topic === topic), tb = cb.topics.find(t => t.topic === topic);
      const sa = coverageTileClass(ta || { status: 'missing' }), sb = coverageTileClass(tb || { status: 'missing' });
      if (sa === sb) continue;
      const rank = { 'topic-ok': 0, 'topic-review': 1, 'topic-missing': 2 };
      const ahead = rank[sa] < rank[sb] ? ca : cb;
      const behind = ahead === ca ? cb : ca;
      lines.push(`${labelFor(topic)}: ${ahead.city} ${ahead === ca ? ta : tb.status.replaceAll('_',' ')} — ${behind.city} ${(behind === ca ? ta : tb)?.status.replaceAll('_',' ') ?? 'missing'}`);
    }
    out.replaceChildren(...(lines.length
      ? [el('h2', `${ca.city} vs ${cb.city}`), el('ul', undefined, 'compare-list'), el('p', 'Same status in every other topic.', 'muted')]
      : [el('h2', `${ca.city} vs ${cb.city}`), el('p', 'Every topic has the same status in both cities.', 'muted')]));
    if (lines.length) lines.forEach(l => out.querySelector('ul').append(el('li', l)));
    announce(`${lines.length} topic difference${lines.length === 1 ? '' : 's'} between ${ca.city} and ${cb.city}.`);
  });
  return form;
}

// Search matches the human label as well as the machine topic id, so "SIN"
// and "health coverage" both find their rows.
const topicHaystack = id => `${id} ${labelFor(id)}`.toLowerCase();

// Topic rows against every pilot city, so gaps can be compared side by side.
function buildCoverageMatrix() {
  const wrapper = el('div');
  let topics = [...new Set(coverageData.flatMap(c => c.topics.map(t => t.topic)))]
    .filter(id => !coverageFilter.q || topicHaystack(id).includes(coverageFilter.q));
  const gapTotal = id => coverageData.reduce((n, c) => n + gapCount(c.topics.find(t => t.topic === id)), 0);
  if (coverageSort === 'gaps') topics.sort((a, b) => gapTotal(b) - gapTotal(a) || a.localeCompare(b));
  else topics.sort((a, b) => a.localeCompare(b));
  if (!topics.length) {
    wrapper.append(el('p', 'No topics match this filter.', 'muted'));
    return wrapper;
  }
  const table = el('table', undefined, 'coverage-matrix');
  const thead = el('thead');
  const headRow = el('tr');
  headRow.append(el('th', 'Topic'));
  coverageData.forEach(c => headRow.append(el('th', `${c.city}, ${c.region}`)));
  thead.append(headRow);
  table.append(thead);
  const tbody = el('tbody');
  for (const id of topics) {
    const row = el('tr');
    const name = el('th', labelFor(id));
    name.scope = 'row';
    row.append(name);
    let hasGap = false;
    for (const c of coverageData) {
      const t = c.topics.find(x => x.topic === id);
      const td = t ? el('td', t.status.replaceAll('_', ' '), `matrix-cell ${coverageTileClass(t)}`) : el('td', '—', 'matrix-cell');
      if (t && coverageTileClass(t) !== 'topic-ok') hasGap = true;
      row.append(td);
    }
    if (coverageGapHighlight && hasGap) row.className = 'gap-row';
    tbody.append(row);
  }
  table.append(tbody);
  wrapper.append(table);
  return wrapper;
}

function renderCoverageCards(grid) {
  const cities = [...coverageData];
  const gapSum = c => c.topics.reduce((n, t) =>
    n + ((coverageFilter.status === 'all' || coverageTileClass(t) === coverageFilter.status) &&
      (!coverageFilter.q || topicHaystack(t.topic).includes(coverageFilter.q)) ? gapCount(t) : 0), 0);
  if (coverageSort === 'gaps') cities.sort((a, b) => gapSum(b) - gapSum(a) || (a.city).localeCompare(b.city));
  else cities.sort((a, b) => (a.city).localeCompare(b.city));
  const cards = [];
  for (const c of cities) {
    const topics = c.topics.filter(t =>
      (coverageFilter.status === 'all' || coverageTileClass(t) === coverageFilter.status) &&
      (!coverageFilter.q || topicHaystack(t.topic).includes(coverageFilter.q)));
    if (!topics.length) continue;
    const card = el('article', undefined, 'coverage-card');
    card.setAttribute('aria-label', `Coverage for ${c.city}`);
    // Language comes from the per-city coverage data, not an assumption.
    card.append(el('h2', `${c.city}, ${c.region}`), el('small', `Language: ${c.language === 'en' ? 'English only' : c.language}`));
    const tileGrid = el('div', undefined, 'topic-grid');
    topics.forEach(t => {
      const tile = el('div', labelFor(t.topic), `topic ${coverageTileClass(t)}`);
      tile.setAttribute('role', 'status');
      tile.setAttribute('aria-label', `${labelFor(t.topic)} (${t.topic}): ${t.status.replaceAll('_', ' ')}`);
      // Color is never the only carrier of status; the glyph text is
      // aria-hidden because the aria-label already states the full status.
      const glyph = coverageTileClass(t) === 'topic-ok' ? '✓' : coverageTileClass(t) === 'topic-missing' ? '✕' : '~';
      const g = el('span', glyph, 't-glyph');
      g.setAttribute('aria-hidden', 'true');
      tile.append(g, el('small', t.status.replaceAll('_', ' ') + (t.status === 'source_guidance'
        ? ` · ${t.count} ${t.count === 1 ? 'source' : 'sources'}`
        : '')));
      tileGrid.append(tile);
    });
    card.append(tileGrid);
    // Lazy per-city record sheet: opening it fetches /v1/coverage/:city once.
    const sheet = el('details', undefined, 'city-sheet');
    sheet.append(el('summary', 'Inspect the records behind these statuses'));
    const sheetBody = el('div');
    sheetBody.setAttribute('aria-live', 'polite');
    sheet.append(sheetBody);
    sheet.addEventListener('toggle', async () => {
      if (!sheet.open || sheetBody.children.length) return;
      sheetBody.replaceChildren(spinner());
      try {
        const detail = await api(`/v1/coverage/${encodeURIComponent(c.city)}`);
        sheetBody.replaceChildren(...detail.topics.map(t => {
          const row = el('div', undefined, 'source');
          row.append(el('strong', `${labelFor(t.topic)} — ${t.status.replaceAll('_', ' ')}`));
          if (t.evidence.length) t.evidence.forEach(ev => row.append(el('small',
            `${ev.title} · ${humanizeGap(ev.status)} · checked ${ev.checkedAt} (${relDate(ev.checkedAt)}) · expires ${ev.expiresAt} (${relDate(ev.expiresAt)})`)));
          else row.append(el('small', 'No registered record matches this topic in this city yet.'));
          return row;
        }));
      } catch (e) {
        sheetBody.replaceChildren(el('p', humanizeError(e).body, 'warning'));
      }
    });
    card.append(sheet);
    cards.push(card);
  }
  grid.replaceChildren(...(cards.length ? cards : [el('p', 'No topics match this filter.', 'muted')]));
}

let token = '';

$('#admin-form').addEventListener('submit', async e => {
  e.preventDefault();
  token = $('#token').value;
  $('#token').value = '';
  announce('Opening editorial review...');
  await loadAdmin();
});

async function loadAdmin() {
  const container = el('div');
  $('#admin-content').replaceChildren(container);
  container.replaceChildren(spinner());
  announce('Loading editorial review...');
  try {
    const info = await api('/admin/overview', null, token);
    const session = await api('/admin/session', null, token);
    container.replaceChildren(
      el('h2', `${info.records.filter(r => r.status === 'pending').length} records awaiting review`)
    );
    container.append(el('p',session.mode==='individual'?`Signed in as ${session.id} (${session.role}). Audit identity is assigned by the server.`:'Legacy shared-token mode: reviewer names are self-reported.'));
    const logout=el('button','Sign out');logout.type='button';
    logout.addEventListener('click',()=>{token='';$('#token').value='';$('#admin-content').replaceChildren(el('p','Signed out on this device.'));$('#token').focus();announce('Signed out.');});
    container.append(logout);
    await mountEditorial(container, api, token, info.records, loadAdmin,session);
    info.records.forEach(r => {
      const card = el('article', undefined, 'record');
      card.setAttribute('aria-label', r.title);
      card.append(el('span', `${r.status} · ${r.risk} risk · ${r.jurisdiction}`, 'status'));
      card.append(el('h3', r.title));
      card.append(link('Inspect official source ↗', r.url));
      card.append(el('p', r.summary));
      card.append(el('small', `Evidence excerpt: "${r.quote}" · Checked ${r.checkedAt} · Expires ${r.expiresAt}`));
      const name = el('input');
      name.placeholder = 'Reviewer name';
      name.setAttribute('aria-label', 'Reviewer name');
      if(session.mode==='individual'){name.value=session.id;name.readOnly=true;}
      name.disabled=!permissions(session).review;
      const note = el('input');
      note.placeholder = 'Review rationale in English (at least 10 characters)';
      note.setAttribute('aria-label', 'Review rationale');
      note.disabled=!permissions(session).review;
      card.append(name, note);
      const actions = el('div', undefined, 'review-actions');
      for (const decision of ['approve', 'reject', 'rollback']) {
        const b = el('button', decision === 'rollback' ? 'Withdraw to review' : decision);
        b.type = 'button';
        b.disabled=!permissions(session).review;
        b.addEventListener('click', async () => {
          b.disabled = true;
          b.classList.add('disabled');
          try {
            await api(`/admin/reviews/${r.id}/decision`, { decision, reviewer: name.value, note: note.value }, token);
            await loadAdmin();
          } catch (e) {
            card.append(el('p', e.message, 'warning'));
            b.disabled = false;
            b.classList.remove('disabled');
          }
        });
        actions.append(b);
      }
      card.append(actions);
      container.append(card);
    });
    container.append(el('h2', 'Knowledge gaps'));
    await mountGapWork(container,api,token,session);
    info.gaps.forEach(g => container.append(el('p', `${g.topic || 'Unknown topic'} · ${g.reason} · ${g.count} reports`)));
    container.append(el('h2', 'Recent review audit'));
    info.audits.forEach(a => container.append(el('p', `${a.record_id} · ${a.reviewer} · ${a.note} · ${a.at}`)));
    announce('Editorial review loaded.');
  } catch (e) {
    container.replaceChildren(el('article', undefined, 'result error'));
    const { title, body, action } = humanizeError(e);
    const box = container.lastElementChild;
    // role=alert announces the failure; the separate announcer stays silent here.
    box.setAttribute('role', 'alert');
    box.append(el('p', title, 'error-title'));
    box.append(el('p', body, 'error-body'));
    if (action === 'Retry') {
      const btn = el('button', 'Retry', 'primary');
      btn.type = 'button';
      btn.addEventListener('click', () => { loadAdmin(); });
      box.append(btn);
    }
  }
}


// Contextual Follow-up Prompts & Multi-turn Conversational Continuity
function buildFollowupSuggestions(r, original, country) {
  const q = original.question.toLowerCase();
  const suggestions = [];

  if (/\b(?:work|permit|job|h-1b|skilled worker|subclass|blue card|visa)\b/i.test(q)) {
    suggestions.push({
      label: 'Can my spouse or dependent work full-time?',
      q: country === 'CA' ? 'Can my spouse work on an open work permit in Canada?' : `Can my spouse work on a dependent visa in ${country}?`
    });
    suggestions.push({
      label: 'What documents are required for my national identity number?',
      q: country === 'United States' ? 'What documents do I need for a Social Security Number (SSN)?'
        : country === 'United Kingdom' ? 'What documents do I need for a National Insurance Number (NIN)?'
        : country === 'Australia' ? 'What documents do I need for a Tax File Number (TFN)?'
        : country === 'Germany' ? 'How do I complete 14-day Anmeldung and get a Steuer-ID in Germany?'
        : 'How do I apply for a Social Insurance Number (SIN) with my work permit?'
    });
    suggestions.push({
      label: 'How do I open a bank account without a local credit score?',
      q: `How do I open a bank account without a local credit history in ${country === 'CA' ? 'Canada' : country}?`
    });
  } else if (/\b(?:housing|rent|deposit|lease|tenant|landlord)\b/i.test(q)) {
    suggestions.push({
      label: 'What is the maximum legal security deposit?',
      q: `What are the legal security deposit limits and escrow protections in ${country === 'CA' ? 'Ontario' : country}?`
    });
    suggestions.push({
      label: 'Can a landlord reject me for having no local credit history?',
      q: `Can a landlord refuse to rent or demand months of upfront rent in ${country === 'CA' ? 'Canada' : country}?`
    });
    suggestions.push({
      label: 'How do I set up local electricity and home internet?',
      q: `How do I set up utilities and broadband as a newcomer in ${country === 'CA' ? 'Canada' : country}?`
    });
  } else {
    suggestions.push({
      label: 'What are the customs cash declaration limits at the airport?',
      q: `What are the customs currency and cash declaration rules at the airport in ${country === 'CA' ? 'Canada' : country}?`
    });
    suggestions.push({
      label: 'How does healthcare coverage work for new immigrants?',
      q: `How do I enroll in public healthcare and what is the waiting period in ${country === 'CA' ? 'Ontario' : country}?`
    });
    suggestions.push({
      label: 'How do I register children for public school?',
      q: `How do I enroll dependent children in school in ${country === 'CA' ? 'Canada' : country}?`
    });
  }

  const container = el('div', undefined, 'followup-container');
  container.append(el('div', 'Contextual Follow-up Questions', 'followup-label'));
  const chips = el('div', undefined, 'followup-chips');
  suggestions.forEach(s => {
    const chip = el('button', `${s.label} ↗`, 'followup-chip');
    chip.type = 'button';
    chip.addEventListener('click', () => {
      $('#question').value = s.q;
      if (country !== 'CA' && $('#country')) {
        $('#country').value = country;
        updateCityDropdown(country, $('#city'), $('#city-group'));
      }
      $('#question-form').requestSubmit();
      announce(`Follow-up submitted: ${s.q}`);
    });
    chips.append(chip);
  });
  container.append(chips);
  return container;
}

// Session History Memory Drawer
function buildSessionHistoryDrawer() {
  const details = el('details', undefined, 'session-history-drawer');
  const summary = el('summary', `Conversation Thread (${sessionState.history.length} turns in this session)`, 'session-history-summary');
  details.append(summary);

  sessionState.history.slice(1, 5).forEach((item, idx) => {
    const turn = el('div', undefined, 'session-turn');
    turn.append(el('div', `Turn ${sessionState.history.length - idx - 1}: ${item.question}`, 'session-turn-q'));
    turn.append(el('p', `${item.country || 'Canada'}${item.city ? ' · ' + item.city : ''} — ${item.headline}`, 'session-turn-a'));
    details.append(turn);
  });
  return details;
}



$('#airport-country')?.addEventListener('change', () => renderAirportKit());
$('#airport-print-btn')?.addEventListener('click', () => window.print());



setupPathwayComparator();






setupCashflowPlanner();
setupNewcomerBudgetSuite();







setupTenancyWizard();



const journeyState = {
  completed: readStored('northstar_journey_completed', {}, true),
  custom: (arr => Array.isArray(arr) ? arr : [])(readStored('northstar_journey_custom', [], true))
};



let currentJourneyMilestones=[];
let journeyRenderSequence=0;
async function renderJourneyRoadmap() {
  const sequence=++journeyRenderSequence;
  currentJourneyMilestones=[];
  $('#journey-metrics')?.replaceChildren();
  const country=$('#journey-country')?.value || 'CA';
  if(!['CA','Canada'].includes(country)) {
    const timeline=$('#journey-timeline');
    if(timeline)timeline.textContent='A roadmap for this country is not available yet. Select Canada to view the available guidance.';
    return;
  }
  const dateInput = $('#journey-landing-date');
  if (dateInput && !dateInput.value) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    dateInput.value = formatIsoDate(d);
  }

  const landingDateStr = dateInput?.value || formatIsoDate(new Date());
  const landingDate = new Date(landingDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedCategory = $('#journey-category')?.value || 'pr_express_entry';
  const category=selectedCategory==='visitor'?'visitor_family':selectedCategory;
  const province = $('#journey-province')?.value || 'ON';

  let baseMilestones = [];
  try {
    const res = await fetch(`/v1/tools/settlement-journey?date=${encodeURIComponent(landingDateStr)}&category=${encodeURIComponent(category)}&city=${encodeURIComponent(({ON:'Toronto',BC:'Vancouver',AB:'Calgary',QC:'Montreal',MB:'Winnipeg',SK:'Saskatoon',NS:'Halifax',NB:'Fredericton',NL:'St. John\'s',PE:'Charlottetown'})[province] || province)}`);
    if (res.ok) {
      const data = await res.json();
      if(sequence!==journeyRenderSequence)return;
      if (!Array.isArray(data.phases)) throw new Error('Invalid journey response');
      baseMilestones = data.phases.flatMap((phase, index) => phase.items.map((item,itemIndex) => ({...item, id:`journey-${category}-${phase.id}-${itemIndex}`, phase:index, phaseTitle:phase.title, dayOffset:phase.horizonDays, desc:item.action, cite:item.authority || 'Confirm with the named authority', badge:'guidance'})));
    } else {
      throw new Error('Journey unavailable');
    }
  } catch {
    if(sequence!==journeyRenderSequence)return;
    const timeline=$('#journey-timeline');
    if(timeline)timeline.textContent='The roadmap could not be loaded. Check your selections and retry.';
    return;
  }

  currentJourneyMilestones=baseMilestones;
  const allMilestones = [...baseMilestones, ...(journeyState.custom || [])];
  const totalMilestones = allMilestones.length;
  const completedCount = allMilestones.filter(m=>journeyState.completed[m.id]).length;
  const daysToLanding = Math.round((landingDate.getTime() - today.getTime()) / 86400000);
  const finalSettlementDate = new Date(landingDate.getTime() + 365 * 86400000);

  // Render Metrics
  const metricsContainer = $('#journey-metrics');
  if (metricsContainer) {
    metricsContainer.innerHTML = '';
    
    const m1 = el('div', undefined, 'journey-metric-card');
    m1.append(el('div', `${completedCount} / ${totalMilestones}`, 'journey-metric-num'));
    m1.append(el('div', 'Milestones Completed', 'journey-metric-label'));

    const m2 = el('div', undefined, 'journey-metric-card');
    m2.append(el('div', landingDateStr, 'journey-metric-num'));
    m2.append(el('div', daysToLanding >= 0 ? `Touchdown in ${daysToLanding} days` : `Landed ${-daysToLanding} days ago`, 'journey-metric-label'));

    const m3 = el('div', undefined, 'journey-metric-card');
    m3.append(el('div', formatIsoDate(finalSettlementDate), 'journey-metric-num'));
    m3.append(el('div', 'First-Year Planning Horizon', 'journey-metric-label'));

    const m4 = el('div', undefined, 'journey-metric-card');
    const pct = totalMilestones ? Math.round((completedCount / totalMilestones) * 100) : 0;
    m4.append(el('div', `${pct}%`, 'journey-metric-num'));
    m4.append(el('div', 'Roadmap Readiness', 'journey-metric-label'));

    metricsContainer.append(m1, m2, m3, m4);
  }

  // Render Phases & Milestones
  const timelineContainer = $('#journey-timeline');
  if (timelineContainer) {
    timelineContainer.innerHTML = '';

    for (let phaseIdx = 0; phaseIdx <= 5; phaseIdx++) {
      const phaseMilestones = allMilestones.filter(m => m.phase === phaseIdx);
      if (phaseMilestones.length === 0) continue;

      const phaseCard = el('div', undefined, 'journey-phase-card');
      const phaseHeader = el('div', undefined, 'journey-phase-header');
      phaseHeader.append(el('h3', phaseMilestones.find(m=>m.phaseTitle)?.phaseTitle || PHASE_NAMES[phaseIdx], 'journey-phase-title'));
      phaseCard.append(phaseHeader);

      const list = el('div', undefined, 'journey-milestone-list');
      phaseMilestones.forEach(m => {
        const targetDate = new Date(landingDate.getTime() + m.dayOffset * 86400000);
        const targetStr = formatIsoDate(targetDate);
        const daysFromNow = Math.round((targetDate.getTime() - today.getTime()) / 86400000);
        const isDone = Boolean(journeyState.completed[m.id]);

        const item = el('div', undefined, `journey-milestone-item ${isDone ? 'completed' : ''}`);

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'journey-check';
        check.checked = isDone;
        check.title = 'Mark milestone completed';
        check.addEventListener('change', () => {
          journeyState.completed[m.id] = check.checked;
          try { localStorage.setItem('northstar_journey_completed', JSON.stringify(journeyState.completed)); } catch {}
          renderJourneyRoadmap();
        });

        const main = el('div', undefined, 'journey-milestone-main');
        const titleRow = el('div', undefined, 'journey-milestone-title');
        titleRow.append(document.createTextNode(m.title + ' '));
        const badge = el('span', m.badge, `journey-milestone-badge badge-${m.badge}`);
        titleRow.append(badge);

        const desc = el('div', m.desc, 'journey-milestone-desc');
        const cite = el('div', `Statutory Authority: ${m.cite}`, 'journey-milestone-cite');
        main.append(titleRow, desc, cite);

        const meta = el('div', undefined, 'journey-milestone-meta');
        const dateSpan = el('span', targetStr, 'journey-target-date');
        const daysSpan = el('span', daysFromNow === 0 ? 'Today' : daysFromNow > 0 ? `in ${daysFromNow}d` : `${-daysFromNow}d ago`, 'journey-days-left');
        meta.append(dateSpan, daysSpan);

        item.append(check, main, meta);
        list.append(item);
      });

      phaseCard.append(list);
      timelineContainer.append(phaseCard);
    }
  }
}

function setupJourneyRoadmap() {
  $('#journey-landing-date')?.addEventListener('change', renderJourneyRoadmap);
  $('#journey-country')?.addEventListener('change', renderJourneyRoadmap);
  $('#journey-category')?.addEventListener('change', renderJourneyRoadmap);
  $('#journey-province')?.addEventListener('change', renderJourneyRoadmap);

  $('#journey-add-custom-btn')?.addEventListener('click', () => {
    const titleIn = $('#journey-custom-title');
    const dateIn = $('#journey-custom-date');
    if (!titleIn?.value.trim() || !dateIn?.value) return;

    const landingDateStr = $('#journey-landing-date')?.value || formatIsoDate(new Date());
    const landingDate = new Date(landingDateStr + 'T00:00:00');
    const targetDate = new Date(dateIn.value + 'T00:00:00');
    const dayOffset = Math.round((targetDate.getTime() - landingDate.getTime()) / 86400000);

    const newItem = {
      id: 'custom_' + Date.now(),
      phase: dayOffset < 0 ? 0 : dayOffset <= 3 ? 1 : dayOffset <= 14 ? 2 : dayOffset <= 30 ? 3 : dayOffset <= 90 ? 4 : 5,
      dayOffset,
      title: titleIn.value.trim(),
      badge: 'recommended',
      desc: `Personal newcomer settlement milestone scheduled for ${dateIn.value}.`,
      cite: 'User Personal Milestone'
    };

    if (!journeyState.custom) journeyState.custom = [];
    journeyState.custom.push(newItem);
    try { localStorage.setItem('northstar_journey_custom', JSON.stringify(journeyState.custom)); } catch {}

    titleIn.value = '';
    dateIn.value = '';
    renderJourneyRoadmap();
  });

  $('#journey-ics-btn')?.addEventListener('click', () => {
    const landingDateStr = $('#journey-landing-date')?.value || formatIsoDate(new Date());
    const allMilestones = [...currentJourneyMilestones, ...(journeyState.custom || [])];
    if(!allMilestones.length)return;
    const icsContent = generateICSContent(landingDateStr, allMilestones);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement-roadmap-180days-${landingDateStr}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  $('#journey-print-btn')?.addEventListener('click', () => {
    window.print();
  });
}




// --- MODULE 3: Official Government Forms Auto-Fill & Print Suite ---
const FORM_TEMPLATES = {
  ltb_t1: {
    org: 'Tribunals Ontario · Landlord and Tenant Board',
    num: 'FORM T1',
    title: 'Tenant Application for a Rebate of Money the Landlord Owes',
    statute: 'Residential Tenancies Act, 2006, s. 134, s. 135',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: 'Shiva Sharma' },
      { id: 'tenantPhone', label: 'Tenant Telephone', default: '+1 (416) 555-0192' },
      { id: 'tenantEmail', label: 'Tenant Email Address', default: 'shiva.settlement@example.com' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '100 City Centre Dr, Apt 1402, Mississauga, ON L5B 2C9' },
      { id: 'landlordName', label: 'Landlord Legal Name', default: 'Apex Horizon Properties Inc.' },
      { id: 'landlordAddress', label: 'Landlord Mailing Address', default: '250 Bay St, Suite 800, Toronto, ON M5J 2T6' },
      { id: 'claimReason', label: 'Reason for Application', default: 'Reason 1: Landlord collected an unlawful key deposit / illegal advance rent exceeding statutory cap' },
      { id: 'claimedAmount', label: 'Total Amount Landlord Owes ($ CAD)', default: '11000.00' },
      { id: 'statutoryInterest', label: 'Statutory Post-Judgment Interest Claimed ($ CAD)', default: '55.00' },
      { id: 'filingDate', label: 'Application Date', default: formatIsoDate(new Date()) }
    ]
  },
  ltb_t2: {
    org: 'Tribunals Ontario · Landlord and Tenant Board',
    num: 'FORM T2',
    title: 'Application about Tenant Rights',
    statute: 'Residential Tenancies Act, 2006, s. 22, s. 23, s. 25, s. 27',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: 'Shiva Sharma' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '100 City Centre Dr, Apt 1402, Mississauga, ON L5B 2C9' },
      { id: 'landlordName', label: 'Landlord Legal Name', default: 'Apex Horizon Properties Inc.' },
      { id: 'violationType', label: 'Tenant Right Infringement', default: 'Reason 2: Entered the rental unit without giving 24 hours written notice (s.27)' },
      { id: 'violationDate', label: 'Date of Infringement', default: formatIsoDate(new Date()) },
      { id: 'details', label: 'Description of Events', default: 'Landlord entered premise without 24 hours statutory written notice and harassed tenant demanding illegal deposit.' },
      { id: 'remedy', label: 'Remedy Requested', default: 'Remedy 1: Abatement of rent ($500.00) and order prohibiting landlord from entering without statutory notice.' },
      { id: 'filingDate', label: 'Application Date', default: formatIsoDate(new Date()) }
    ]
  },
  cbsa_e677: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM E677',
    title: 'Cross-Border Currency or Monetary Instruments Report - Individual',
    statute: 'Proceeds of Crime (Money Laundering) and Terrorist Financing Act, s. 12',
    fields: [
      { id: 'fullName', label: 'Full Legal Name (Surname, Given Names)', default: 'Sharma, Shiva' },
      { id: 'citizenship', label: 'Country of Citizenship', default: 'India' },
      { id: 'dob', label: 'Date of Birth (YYYY-MM-DD)', default: '1995-06-15' },
      { id: 'passportNo', label: 'Passport / Travel Document Number', default: 'Z9823412' },
      { id: 'portOfEntry', label: 'CBSA Port of Entry', default: 'Toronto Pearson International (YYZ)' },
      { id: 'departureCountry', label: 'Country of Departure', default: 'India' },
      { id: 'currencyCAD', label: 'Total Value Transported in CAD Equiv.', default: '15000.00' },
      { id: 'breakdown', label: 'Currency / Instrument Breakdown', default: 'Bank Draft: CAD 12,000; Currency Notes: USD 2,200' },
      { id: 'sourceOfFunds', label: 'Source of Funds', default: 'Personal Employment Savings & Lawful Bank Withdrawal' },
      { id: 'purposeOfFunds', label: 'Purpose of Currency Import', default: 'Initial Settlement, Housing Deposit & Living Runway' }
    ]
  },
  fincen_105: {
    org: 'Department of the Treasury · Financial Crimes Enforcement Network',
    num: 'FinCEN FORM 105',
    title: 'Report of International Transportation of Currency or Monetary Instruments (CMIR)',
    statute: '31 U.S.C. 5316 / 31 CFR 1010.340',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: 'Shiva Sharma' },
      { id: 'usAddress', label: 'Address in the United States', default: '350 5th Ave, New York, NY 10118' },
      { id: 'foreignAddress', label: 'Permanent Foreign Address', default: '42 MG Road, Bangalore 560001, India' },
      { id: 'passportNo', label: 'Passport Number', default: 'Z9823412' },
      { id: 'portOfEntry', label: 'U.S. Customs Port of Entry', default: 'JFK International Airport (New York)' },
      { id: 'currencyUSD', label: 'Total U.S. Dollar Value Transported', default: '14500.00' },
      { id: 'carrierType', label: 'Mode of Travel / Carrier', default: 'Commercial Airline Flight AI 101' }
    ]
  },
  cbsa_bsf186: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM BSF186 (B4)',
    title: 'Personal Effects Accounting Document (Settler Effects)',
    statute: 'Customs Tariff Heading 98.05 / 98.07; Customs Act s. 32',
    fields: [
      { id: 'importerName', label: 'Importer Full Legal Name (Surname, Given)', default: 'Sharma, Shiva' },
      { id: 'originCountry', label: 'Former Country of Domicile / Residence', default: 'India' },
      { id: 'arrivalDate', label: 'Date of Arrival in Canada (YYYY-MM-DD)', default: formatIsoDate(new Date()) },
      { id: 'portOfEntry', label: 'Port of Entry / CBSA Office', default: 'Toronto Pearson International (YYZ - Port 497)' },
      { id: 'classification', label: 'Tariff Classification & Status', default: 'Settler (Heading 98.05) — Intends to reside > 12 months' },
      { id: 'docType', label: 'Accounting Form Type', default: 'BSF186 — Goods Accompanying at Landing' },
      { id: 'electronics', label: 'Personal Electronics & Serial Numbers', default: '1x Apple MacBook Pro 16" (SN: C02G45ABCDEF), 1x iPhone 15 (SN: DX3J9KLMNP), CAD 3,800' },
      { id: 'jewelry', label: 'Precious Items & Jewelry Description', default: '2x Gold chains (22K, 38g), 1x Wedding band (18K, 6g). Owned > 12 months, CAD 4,200' },
      { id: 'household', label: 'Used Household Goods & Wearing Apparel', default: '4x Suitcases containing used wearing apparel, textbooks, linens, cookware, CAD 2,500' },
      { id: 'conveyanceVin', label: 'Motor Vehicle / Conveyance (VIN or N/A)', default: 'N/A — No motor vehicle imported' },
      { id: 'goodsToFollow', label: 'CBSA BSF186A Attached for Goods to Follow?', default: 'Yes — 8 air-cargo manifest boxes arriving within 6 months' },
      { id: 'totalDeclaredCAD', label: 'Total Declared Value in CAD', default: '10500.00' }
    ]
  },
  cra_rc151: {
    org: 'Canada Revenue Agency / Agence du revenu du Canada',
    num: 'FORM RC151',
    title: 'GST/HST and Canada Carbon Rebate Application for Individuals Becoming Residents of Canada',
    statute: 'Excise Tax Act s. 122.5 / Greenhouse Gas Pollution Pricing Act',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: 'Shiva Sharma' },
      { id: 'entryDate', label: 'Date You Became a Resident of Canada', default: formatIsoDate(new Date()) },
      { id: 'sin', label: 'Social Insurance Number (SIN)', default: '987-654-321' },
      { id: 'maritalStatus', label: 'Marital Status', default: 'Single' },
      { id: 'currentAddress', label: 'Mailing Address in Canada', default: '100 City Centre Dr, Mississauga, ON L5B 2C9' },
      { id: 'incomeEntryYearCAD', label: 'World Income in Year of Entry (CAD)', default: '12000.00' },
      { id: 'incomePriorYearCAD', label: 'World Income in Prior Year (CAD)', default: '35000.00' },
      { id: 'numberOfDependents', label: 'Number of Dependent Children', default: '0' }
    ]
  }
};

let currentFormData = {};

function renderFormsSuite() {
  const formKey = $('#forms-selector')?.value || 'ltb_t1';
  const tpl = FORM_TEMPLATES[formKey] || FORM_TEMPLATES.ltb_t1;

  // Initialize form data if not set
  if (!currentFormData[formKey]) {
    currentFormData[formKey] = {};
    tpl.fields.forEach(f => {
      currentFormData[formKey][f.id] = f.default;
    });
  }

  // Render Editor
  const editor = $('#forms-editor');
  if (editor) {
    editor.innerHTML = '';
    const grid = el('div', undefined, 'forms-editor-grid');

    tpl.fields.forEach(f => {
      const label = el('label', f.label);
      const input = document.createElement('input');
      input.id = `ff_${f.id}`;
      input.value = currentFormData[formKey][f.id] || '';
      input.addEventListener('input', () => {
        currentFormData[formKey][f.id] = input.value;
        updateFormPreview(tpl, currentFormData[formKey]);
      });
      label.append(input);
      grid.append(label);
    });

    editor.append(grid);
  }

  // Render Preview
  updateFormPreview(tpl, currentFormData[formKey]);
}


function setupFormsSuite() {
  $('#forms-selector')?.addEventListener('change', renderFormsSuite);
  $('#forms-populate-btn')?.addEventListener('click', () => {
    const formKey = $('#forms-selector')?.value || 'ltb_t1';
    const tpl = FORM_TEMPLATES[formKey];
    if (tpl) {
      currentFormData[formKey] = {};
      tpl.fields.forEach(f => {
        currentFormData[formKey][f.id] = f.default;
      });
      renderFormsSuite();
    }
  });
  $('#forms-print-btn')?.addEventListener('click', () => {
    window.print();
  });
  $('#forms-pdf-btn')?.addEventListener('click', () => {
    const formKey = $('#forms-selector')?.value || 'ltb_t1';
    const tpl = FORM_TEMPLATES[formKey] || FORM_TEMPLATES.ltb_t1;
    const data = currentFormData[formKey] || {};
    const pdfFields = tpl.fields.map(f => ({ label: f.label, val: data[f.id] || f.default }));
    const pdfContent = generateVectorPDF(tpl.org, tpl.num, tpl.title, tpl.statute, pdfFields);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formKey}-official-form.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Initialize New Advanced Suites
setupJourneyRoadmap();
setupTaxEngine();
setupFormsSuite();























function renderBanking() {
  renderBankMatcher();
  renderCreditSim();
}


let creditRenderSequence=0;
async function renderCreditSim() {
  const sequence=++creditRenderSequence;
  const limit = Number($('#credit-limit')?.value ?? 2000);
  const spend = Number($('#credit-spend')?.value ?? 450);
  const strategy = $('#credit-payment-strategy')?.value || 'full_on_time';
  const inquiries = Number($('#credit-inquiries')?.value ?? 1);

  const container = $('#credit-sim-results');
  if (!container) return;
  container.innerHTML = '';

  let calculation;
  try {
    const response=await fetch('/v1/tools/credit-simulator?'+new URLSearchParams({limit,spend,strategy,inquiries}));
    calculation=await response.json();
    if(sequence!==creditRenderSequence)return;
    if(!response.ok)throw new Error(calculation.error||'Credit scenario unavailable');
  } catch(error) {
    if(sequence===creditRenderSequence)container.textContent=error.message||'Credit scenario unavailable';
    return;
  }
  const {utilRatio,utilGrade,utilClass,monthlyPointsDelta,inquiryPenalty,m1Score,m3Score,m6Score,m9Score}=calculation;
  container.append(el('p','Illustrative scenario only. These scores are not predictions from a credit bureau.','muted'));

  const getTier = (s) => {
    if (s >= 720) return { label: 'Prime / Excellent (720+)', cls: 'tier-prime' };
    if (s >= 660) return { label: 'Good (660-719)', cls: 'tier-good' };
    if (s >= 600) return { label: 'Fair (600-659)', cls: 'tier-fair' };
    return { label: 'Starter / Building (<600)', cls: 'tier-starter' };
  };

  const metricsBar = el('div', undefined, 'credit-metrics-bar');
  metricsBar.innerHTML = `
    <div class="credit-metric-box">
      <span class="credit-metric-lbl">Credit Utilization Ratio</span>
      <span class="credit-metric-val ${utilClass}">${utilRatio}% (${utilGrade})</span>
    </div>
    <div class="credit-metric-box">
      <span class="credit-metric-lbl">Inquiry Impact (Month 1)</span>
      <span class="credit-metric-val">${inquiryPenalty} pts (${inquiries} card applied)</span>
    </div>
    <div class="credit-metric-box">
      <span class="credit-metric-lbl">Estimated Month 9 Score</span>
      <span class="credit-metric-val ${getTier(m9Score).cls}">${m9Score} (${getTier(m9Score).label})</span>
    </div>
  `;

  const table = el('table', undefined, 'credit-trajectory-table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Timeline</th>
        <th>Estimated Score</th>
        <th>Credit Tier</th>
        <th>Milestone Unlocked</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Month 1 (Arrival)</strong></td>
        <td>${m1Score}</td>
        <td><span class="credit-tier-badge ${getTier(m1Score).cls}">${getTier(m1Score).label}</span></td>
        <td>First secured credit card activated; monthly reporting starts with Equifax/TransUnion.</td>
      </tr>
      <tr>
        <td><strong>Month 3 (Establishment)</strong></td>
        <td>${m3Score}</td>
        <td><span class="credit-tier-badge ${getTier(m3Score).cls}">${getTier(m3Score).label}</span></td>
        <td>Post-paid mobile phone plans approved without cash security deposit.</td>
      </tr>
      <tr>
        <td><strong>Month 6 (Graduation)</strong></td>
        <td>${m6Score}</td>
        <td><span class="credit-tier-badge ${getTier(m6Score).cls}">${getTier(m6Score).label}</span></td>
        <td>Eligible to request security deposit refund and upgrade to unsecured card ($5k+ limit).</td>
      </tr>
      <tr>
        <td><strong>Month 9 (Prime Borrowing)</strong></td>
        <td>${m9Score}</td>
        <td><span class="credit-tier-badge ${getTier(m9Score).cls}">${getTier(m9Score).label}</span></td>
        <td>Eligible for prime auto financing rates (sub-6%) and residential tenancy lease pre-approvals without guarantor.</td>
      </tr>
    </tbody>
  `;

  container.append(metricsBar, table);
}

function setupBankingSuite() {
  $('#tab-btn-bank-matcher')?.addEventListener('click', () => {
    $('#banking-controls button')?.forEach(b => b.classList.remove('active'));
    $('#tab-btn-bank-matcher')?.classList.add('active');
    const mv = $('#banking-matcher-view'), cv = $('#banking-credit-view'), rv = $('#banking-rights-view');
    if (mv) mv.hidden = false;
    if (cv) cv.hidden = true;
    if (rv) rv.hidden = true;
  });
  $('#tab-btn-credit-sim')?.addEventListener('click', () => {
    $('#banking-controls button')?.forEach(b => b.classList.remove('active'));
    $('#tab-btn-credit-sim')?.classList.add('active');
    const mv = $('#banking-matcher-view'), cv = $('#banking-credit-view'), rv = $('#banking-rights-view');
    if (mv) mv.hidden = true;
    if (cv) cv.hidden = false;
    if (rv) rv.hidden = true;
    renderCreditSim();
  });
  $('#tab-btn-bank-rights')?.addEventListener('click', () => {
    $('#banking-controls button')?.forEach(b => b.classList.remove('active'));
    $('#tab-btn-bank-rights')?.classList.add('active');
    const mv = $('#banking-matcher-view'), cv = $('#banking-credit-view'), rv = $('#banking-rights-view');
    if (mv) mv.hidden = true;
    if (cv) cv.hidden = true;
    if (rv) rv.hidden = false;
  });

  $('#bank-country')?.addEventListener('change', renderBankMatcher);
  $('#credit-limit')?.addEventListener('input', renderCreditSim);
  $('#credit-spend')?.addEventListener('input', renderCreditSim);
  $('#credit-payment-strategy')?.addEventListener('change', renderCreditSim);
  $('#credit-inquiries')?.addEventListener('change', renderCreditSim);
}

// --- MODULE: FOREIGN DRIVING LICENCE & G-TEST NAVIGATOR (#driving) ---
const RECIPROCAL_COUNTRIES = new Set([
  'United States', 'Australia', 'Austria', 'Belgium', 'France', 'Germany',
  'United Kingdom', 'Ireland', 'Japan', 'South Korea', 'New Zealand',
  'Switzerland', 'Taiwan'
]);

const RECIPROCAL_BY_JURISDICTION = {
  ON: RECIPROCAL_COUNTRIES,
  BC: new Set(['United States', 'Australia', 'Austria', 'France', 'Germany', 'Guernsey', 'Ireland', 'Isle of Man', 'Jersey', 'Japan', 'Netherlands', 'New Zealand', 'South Korea', 'Switzerland', 'Taiwan', 'United Kingdom']),
  AB: new Set(['United States', 'Australia', 'Austria', 'Belgium', 'France', 'Germany', 'Isle of Man', 'Japan', 'South Korea', 'Switzerland', 'Taiwan', 'United Kingdom']),
  UK: new Set(['Australia', 'Austria', 'Belgium', 'Canada', 'France', 'Germany', 'Ireland', 'Japan', 'New Zealand', 'South Korea', 'Switzerland', 'United Arab Emirates', 'Singapore', 'Spain', 'Netherlands', 'Sweden', 'Hong Kong', 'South Africa']),
  AU: new Set(['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Ireland', 'Japan', 'New Zealand', 'Singapore', 'Austria', 'Belgium', 'Netherlands', 'Sweden', 'Spain', 'Switzerland', 'South Korea']),
  US: new Set([]),
  DE: new Set(['Canada', 'Australia', 'Japan', 'New Zealand', 'Switzerland', 'United Kingdom', 'United States', 'France', 'Spain', 'Netherlands', 'Sweden', 'Ireland', 'Austria', 'Belgium']),
  AE: new Set(['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Ireland', 'Italy', 'Spain', 'Switzerland', 'New Zealand', 'Singapore', 'Netherlands', 'Sweden', 'Austria', 'Belgium', 'Saudi Arabia'])
};

function renderDriving(e) {
  if (e) e.preventDefault();
  const origin = $('#driving-origin')?.value || 'India';
  const dest = $('#driving-dest')?.value || 'ON';
  const years = $('#driving-years')?.value || '2plus';
  const docs = $('#driving-docs')?.value || 'extract';

  const container = $('#driving-results');
  if (!container) return;
  container.innerHTML = '';

  const jurisdictionReciprocal = RECIPROCAL_BY_JURISDICTION[dest] || RECIPROCAL_COUNTRIES;
  const isReciprocal = jurisdictionReciprocal.has(origin);
  const card = el('div', undefined, 'driving-verdict-card');
  const header = el('div', undefined, 'driving-verdict-header');

  let title = '';
  let badgeClass = '';
  let badgeText = '';
  let steps = [];
  let feeData = [];
  let statutoryRule = '';

  if (dest === 'BC') {
    if (isReciprocal) {
      title = 'Direct Reciprocal 1:1 Exchange: ' + origin + ' to British Columbia (ICBC)';
      badgeClass = 'badge-direct';
      badgeText = 'Direct Class 5 Exchange (No Test)';
      statutoryRule = 'Under the BC Motor Vehicle Act and ICBC reciprocal agreements, valid full licences from recognized jurisdictions are exchanged directly for a BC Class 5 licence without taking knowledge or road tests.';
      steps = [
        'Book an appointment at any ICBC Driver Licensing Office.',
        'Surrender your original foreign driving licence.',
        'Pass vision screening and show primary/secondary ID (Passport + Study/Work Permit or PR Card).',
        'Pay statutory licensing fee ($31.00 CAD); temporary paper licence issued immediately, plastic card mailed in 2-3 weeks.'
      ];
      feeData = [
        { item: 'ICBC 5-Year Class 5 Licence Fee', amount: '$31.00 CAD' },
        { item: 'Road Test Fee', amount: '$0.00 (Waived)' },
        { item: 'Knowledge Test Fee', amount: '$0.00 (Waived)' },
        { item: 'Total Government Cost', amount: '$31.00 CAD' }
      ];
    } else if (years === '2plus') {
      title = 'Full Experience Credit: ' + origin + ' to BC Class 5 Road Test';
      badgeClass = 'badge-fasttrack';
      badgeText = 'Skip GLP Wait (Take Class 5 Road Test)';
      statutoryRule = 'With 2+ years of verified driving experience, ICBC exempts you from the Graduated Licensing Program (GLP). You pass the computer knowledge test, then immediately book the Class 5 road test without waiting.';
      steps = [
        'Bring foreign licence, authenticated driving record letter, and ID to ICBC Driver Licensing.',
        'Take and pass the computer knowledge test ($15.00 CAD) and vision test.',
        'Receive a Class 5 learner permit and immediately book your Class 5 road test ($50.00 CAD).',
        'Upon passing, pay the licence fee ($31.00 CAD) to receive your Full Class 5 driver licence.'
      ];
      feeData = [
        { item: 'Knowledge Test Fee', amount: '$15.00 CAD' },
        { item: 'Class 5 Road Test Attempt Fee', amount: '$50.00 CAD' },
        { item: '5-Year Driver Licence Fee', amount: '$31.00 CAD' },
        { item: 'Total Package Cost', amount: '$96.00 CAD' }
      ];
    } else {
      title = 'Graduated Licensing: ' + origin + ' (BC Class 7 Novice)';
      badgeClass = 'badge-learner';
      badgeText = 'GLP Class 7 Novice Stage';
      statutoryRule = 'With under 2 years of driving experience, ICBC places you in the Graduated Licensing Program at the Class 7 Novice level.';
      steps = [
        'Present foreign licence and take ICBC computer knowledge test ($15.00 CAD).',
        'Receive Class 7 learner permit with L-sign requirements.',
        'Complete the required novice period before scheduling your road test.'
      ];
      feeData = [
        { item: 'Knowledge Test Fee', amount: '$15.00 CAD' },
        { item: 'Class 7 Road Test Fee', amount: '$35.00 CAD' },
        { item: 'Licence Issue Fee', amount: '$31.00 CAD' }
      ];
    }
  } else if (dest === 'AB') {
    if (isReciprocal) {
      title = 'Direct Reciprocal 1:1 Exchange: ' + origin + ' to Alberta (Class 5)';
      badgeClass = 'badge-direct';
      badgeText = 'Direct Class 5 Exchange (No Test)';
      statutoryRule = 'Alberta Transportation exchanges valid full licences from reciprocal countries directly for an Alberta Class 5 licence without testing.';
      steps = [
        'Visit an authorized Alberta Registry Agent office.',
        'Surrender foreign licence and provide proof of Alberta residency and legal presence.',
        'Pass vision screening and pay the registry licensing fee ($93.00 CAD).'
      ];
      feeData = [
        { item: 'Alberta Class 5 Licence Fee', amount: '$93.00 CAD' },
        { item: 'Road Test Fee', amount: '$0.00 (Waived)' }
      ];
    } else if (years === '2plus') {
      title = 'GDL Exemption Program: ' + origin + ' to Alberta Class 5 Test';
      badgeClass = 'badge-fasttrack';
      badgeText = 'Skip GDL Wait (Direct Class 5 Road Test)';
      statutoryRule = 'Under the Alberta Graduated Driver Licensing Exemption (GDLE) program, applicants with 2+ years verified foreign experience can skip the Class 7 learner wait and challenge the Class 5 road test directly.';
      steps = [
        'Submit official foreign driving history letter for GDLE approval.',
        'Pass Class 7 knowledge test ($17.00 CAD).',
        'Book and pass Class 5 Basic Road Test directly without waiting.'
      ];
      feeData = [
        { item: 'Knowledge Test Fee', amount: '$17.00 CAD' },
        { item: 'Class 5 Road Test Fee', amount: '$90.00 CAD' },
        { item: '5-Year Licence Card', amount: '$93.00 CAD' }
      ];
    } else {
      title = 'Standard GDL Pathway: ' + origin + ' (Alberta Class 7)';
      badgeClass = 'badge-learner';
      badgeText = 'GDL Class 7 Learner Stage';
      statutoryRule = 'Applicants with under 2 years experience enter the Alberta GDL program at the Class 7 learner stage.';
      steps = ['Take Class 7 knowledge test and hold learner status for 12 months.'];
      feeData = [{ item: 'Class 7 Knowledge Test', amount: '$17.00 CAD' }];
    }
  } else if (dest === 'UK') {
    if (isReciprocal) {
      title = 'Direct Designated Country Exchange: ' + origin + ' to Great Britain (DVLA)';
      badgeClass = 'badge-direct';
      badgeText = 'Direct DVLA Exchange (No Test)';
      statutoryRule = 'Under the Road Traffic Act 1988, licences from designated countries can be exchanged for a Full Great Britain licence within 5 years of becoming resident without taking a driving test.';
      steps = [
        'Order form D1 from the DVLA or pick one up from a Post Office.',
        'Send form D1 with original foreign driving licence, biometric residence permit, and £43 fee to DVLA Swansea.',
        'Receive your Full GB driving licence by post within 3 weeks.'
      ];
      feeData = [
        { item: 'DVLA Postal Licence Exchange Fee', amount: '£43.00' },
        { item: 'Theory Test Fee', amount: '£0.00 (Waived)' },
        { item: 'Practical Driving Test Fee', amount: '£0.00 (Waived)' }
      ];
    } else {
      title = '12-Month Grace Period to DVLA Theory & Practical Tests: ' + origin;
      badgeClass = 'badge-fasttrack';
      badgeText = 'Drive 12 Months, Then DVLA Practical Test';
      statutoryRule = 'Under UK DVLA rules, you can drive in Great Britain on your valid foreign licence for up to 12 months from becoming resident. To continue driving thereafter, you must pass the DVLA theory test and practical driving test.';
      steps = [
        'Drive legally for up to 12 months from your UK arrival date using your valid foreign licence.',
        'Apply for a provisional Great Britain licence (£34 online).',
        'Book and pass the DVLA theory test (£23).',
        'Book and pass the DVLA practical driving test (£62 weekday / £75 weekend).'
      ];
      feeData = [
        { item: 'Provisional Licence Application', amount: '£34.00' },
        { item: 'DVLA Theory Test Fee', amount: '£23.00' },
        { item: 'DVLA Practical Driving Test Fee', amount: '£62.00' },
        { item: 'Total Government Cost', amount: '£119.00' }
      ];
    }
  } else if (dest === 'AU') {
    if (isReciprocal) {
      title = 'Direct Recognised Country Exchange: ' + origin + ' to Australia (Class C)';
      badgeClass = 'badge-direct';
      badgeText = 'Direct Licence Conversion (No Test)';
      statutoryRule = 'Holders of a full licence from recognised countries can convert directly to an Australian Car (Class C) driver licence without taking knowledge or practical driving tests.';
      steps = [
        'Visit a Service NSW or VicRoads centre within 3 months of becoming an Australian resident.',
        'Provide proof of Australian identity, residency, and your foreign licence.',
        'Pass eye test and pay licence fee; photo taken on the spot.'
      ];
      feeData = [
        { item: 'Australian Driver Licence Fee (3 Years)', amount: '$144.00 AUD' },
        { item: 'Practical Driving Test Fee', amount: '$0.00 (Waived)' }
      ];
    } else {
      title = 'Licence Conversion Testing Path: ' + origin + ' to Australia';
      badgeClass = 'badge-fasttrack';
      badgeText = 'Knowledge Test + Driving Test Required';
      statutoryRule = 'Licence holders from non-recognised countries must pass the Driver Knowledge Test (DKT), Hazard Perception Test (HPT), and the practical driving test to receive an Australian driver licence.';
      steps = [
        'Drive for up to 3 months on foreign licence while transitioning to residency.',
        'Pass the Driver Knowledge Test (DKT) at a service centre ($52 AUD).',
        'Pass the Hazard Perception Test (HPT) and book practical driving test ($64 AUD).',
        'Upon passing, pay the licence fee to obtain your Full C or provisional licence.'
      ];
      feeData = [
        { item: 'Driver Knowledge Test (DKT)', amount: '$52.00 AUD' },
        { item: 'Practical Driving Test', amount: '$64.00 AUD' },
        { item: 'Licence Issue Fee', amount: '$66.00 AUD' },
        { item: 'Total Testing Cost', amount: '$182.00 AUD' }
      ];
    }
  } else if (dest === 'US') {
    title = 'California DMV Licensing: ' + origin + ' to California Driver License';
    badgeClass = 'badge-fasttrack';
    badgeText = 'Written Exam & Behind-The-Wheel Drive Test';
    statutoryRule = 'Under California Vehicle Code § 12505, California does not have reciprocal driver licence exchange agreements with foreign countries. All adult newcomers establishing residency must pass the vision exam, knowledge test, and behind-the-wheel driving test.';
    steps = [
      'Complete online California DMV application and pay $45 fee.',
      'Visit local DMV office with proof of identity and California residency.',
      'Pass vision exam and knowledge test on touchscreen terminal.',
      'Receive instruction permit and schedule Behind-The-Wheel driving test.',
      'Upon passing driving test, temporary interim license issued; card arrives in 2 weeks.'
    ];
    feeData = [
      { item: 'California DMV Application Fee (Includes 3 test attempts)', amount: '$45.00 USD' },
      { item: 'Total State Cost', amount: '$45.00 USD' }
    ];
  } else if (dest === 'DE') {
    if (isReciprocal) {
      title = 'Annex 11 Reciprocal Conversion: ' + origin + ' to German Führerschein';
      badgeClass = 'badge-direct';
      badgeText = 'Direct German Exchange (FeV Anlage 11)';
      statutoryRule = 'Under § 31 FeV (Fahrerlaubnis-Verordnung), full licences from Annex 11 countries/states are converted directly to a German Class B driving licence without practical driving tests.';
      steps = [
        'Book appointment at local Bürgeramt / Führerscheinstelle.',
        'Present foreign licence, biometric photo, eye test certificate (Sehtest), and proof of address registration (Anmeldung).',
        'Surrender foreign licence and pay processing fee (~€45).'
      ];
      feeData = [
        { item: 'Führerscheinstelle Processing Fee', amount: '€45.00' },
        { item: 'Optometrist Eye Test (Sehtest DIN 58220)', amount: '€7.00' }
      ];
    } else {
      title = '6-Month Validity to German Theory & Practical Exam: ' + origin;
      badgeClass = 'badge-fasttrack';
      badgeText = 'Foreign Theory + Practical (Mandatory Lessons Waived)';
      statutoryRule = 'Under § 29 FeV, a foreign driving licence is valid for 6 months after registering your German address (Anmeldung). To convert thereafter, you must pass the theory exam and practical driving test at a Fahrschule; statutory minimum special driving hours (Sonderfahrten) are waived.';
      steps = [
        'Drive legally for up to 6 months from your Anmeldung date.',
        'Register with an approved driving school (Fahrschule) for exam preparation.',
        'Take official First Aid course (Erste Hilfe) and eye test.',
        'Pass the TÜV/DEKRA computer theory exam and practical driving exam.'
      ];
      feeData = [
        { item: 'Application & Authority Fee', amount: '€45.00' },
        { item: 'TÜV Theory & Practical Exam Fees', amount: '€140.00' },
        { item: 'Fahrschule Registration & Presentation Fee', amount: '€150.00' },
        { item: 'Estimated Total Conversion Cost', amount: '€335.00' }
      ];
    }
  } else if (dest === 'AE') {
    if (isReciprocal) {
      title = 'Direct RTA Recognition: ' + origin + ' to UAE / Dubai Driving Licence';
      badgeClass = 'badge-direct';
      badgeText = 'Direct Exchange (No Classes or Test)';
      statutoryRule = 'Citizens and residents holding a valid full licence from 32 recognized countries can exchange directly for a UAE driving licence at RTA Dubai without mandatory lessons or tests.';
      steps = [
        'Complete eye test at any RTA-approved optical center in Dubai.',
        'Submit Emirates ID, original foreign licence, and eye test report via RTA portal or Customer Happiness Centre.',
        'Pay RTA fees (AED 870); licence printed immediately on the spot.'
      ];
      feeData = [
        { item: 'RTA Eye Test Fee', amount: 'AED 150' },
        { item: 'RTA Licence Exchange Fee', amount: 'AED 870' },
        { item: 'Total Statutory Cost', amount: 'AED 1,020' }
      ];
    } else {
      title = 'RTA "Golden Chance" One-Time Road Test: ' + origin;
      badgeClass = 'badge-fasttrack';
      badgeText = 'Golden Chance Direct Test (Skip 20 Classes)';
      statutoryRule = 'Under Dubai RTA regulations, non-exempt foreign licence holders can apply for the "Golden Chance" initiative: taking the knowledge test and a one-time direct road test without enrolling in mandatory driving school classes.';
      steps = [
        'Open traffic file at an authorized Dubai driving institute under "Golden Chance".',
        'Pass RTA eye test and attend mandatory theory lectures.',
        'Pass RTA computer knowledge theory test.',
        'Attempt one-time direct RTA practical road test (if passed, licence issued immediately; if failed, must take standard 20 classes).'
      ];
      feeData = [
        { item: 'Golden Chance Traffic File & Theory Test', amount: 'AED 1,200' },
        { item: 'RTA Road Test Fee', amount: 'AED 320' },
        { item: 'Licence Issuance Fee', amount: 'AED 420' },
        { item: 'Estimated Golden Chance Cost', amount: 'AED 1,940' }
      ];
    }
  } else {
    // Default Ontario
    if (isReciprocal) {
      title = 'Direct Reciprocal 1:1 Exchange: ' + origin + ' to Ontario / Canada';
      badgeClass = 'badge-direct';
      badgeText = 'Direct Exchange (No Test)';
      statutoryRule = 'Under the Ontario Highway Traffic Act reciprocal exchange agreements, valid licences from recognized countries are exchanged 1-for-1 without taking any knowledge or road test.';
      steps = [
        'Book an appointment at any full-service DriveTest Centre.',
        'Surrender your original foreign driving licence.',
        'Pass mandatory vision screening and show 2 pieces of ID (Passport + Study/Work Permit or COPR).',
        'Pay statutory licensing fee ($90.00 CAD) and receive temporary paper licence immediately; plastic photo card arrives in mail in 2-3 weeks.'
      ];
      feeData = [
        { item: 'Statutory 5-Year Licence & Vision Test Fee', amount: '$90.00 CAD' },
        { item: 'Road Test Fee', amount: '$0.00 (Waived)' },
        { item: 'Knowledge Test Fee', amount: '$0.00 (Waived)' },
        { item: 'Total Government Cost', amount: '$90.00 CAD' }
      ];
    } else if (years === '2plus' && docs === 'extract') {
      title = 'Fast-Track Full G Road Test: ' + origin + ' (2+ Years with Driving Extract)';
      badgeClass = 'badge-fasttrack';
      badgeText = 'Skip 12-Month G1 Wait & Skip G2';
      statutoryRule = 'Under Ontario Regulation 340/94 s.14, applicants with 2+ years of verified foreign driving experience supported by an official authenticated licensing extract are exempt from the 12-month G1 wait period and are immediately eligible to challenge the Full G highway exit road test directly.';
      steps = [
        'Obtain an official Driving Record / Extract (DL Ext) from your home country licensing authority (e.g. RTO, DVL, Police) issued within 6 months.',
        'If not in English or French, obtain a certified translation by an approved ATIO translator.',
        'Visit DriveTest Centre, present foreign licence + extract, and pass G1 written knowledge test.',
        'Upon passing G1, you are immediately eligible to book the Full G Highway Road Test directly (skipping the entire 12-month G1 wait and skipping the intermediate G2 test!).'
      ];
      feeData = [
        { item: 'G1 Written Knowledge Test Fee', amount: '$16.00 CAD' },
        { item: 'Full G Road Test Attempt Fee', amount: '$91.25 CAD' },
        { item: '5-Year Driver Licence Fee', amount: '$53.75 CAD' },
        { item: 'Total Standard Package Cost', amount: '$161.00 CAD' }
      ];
    } else if (years === '2plus' && docs !== 'extract') {
      title = 'Intermediate Fast-Track G2 Road Test: ' + origin + ' (Licence Card Only)';
      badgeClass = 'badge-fasttrack';
      badgeText = 'Skip 12-Month G1 Wait (G2 Required)';
      statutoryRule = 'Without an official authenticated licensing extract, DriveTest grants a maximum of 12 months self-declared foreign credit. You can skip the 12-month G1 wait time, but you MUST take the G2 road test first before taking the full G test.';
      steps = [
        'Take foreign plastic licence card to DriveTest Centre with valid passport and permit.',
        'Declare foreign driving experience at the counter (granted 12 months maximum credit).',
        'Pass G1 written knowledge test ($16.00).',
        'Immediately book your G2 city road test ($53.75). Once passed, you receive a G2 licence and can book your Full G test thereafter.'
      ];
      feeData = [
        { item: 'G1 Written Knowledge Test Fee', amount: '$16.00 CAD' },
        { item: 'G2 City Road Test Attempt Fee', amount: '$53.75 CAD' },
        { item: '5-Year Driver Licence Fee', amount: '$53.75 CAD' },
        { item: 'Total Government Cost', amount: '$123.50 CAD' }
      ];
    } else {
      title = 'Learner Experience Credit: ' + origin + ' (Under 2 Years)';
      badgeClass = 'badge-learner';
      badgeText = 'Partial Wait-Time Reduction';
      statutoryRule = 'Foreign experience under 12 months is credited month-for-month against the mandatory Ontario G1 waiting period (12 months reduced to 12 minus foreign months).';
      steps = [
        'Present foreign licence and declare months of active driving.',
        'Take G1 written knowledge test ($16.00).',
        'Wait the remaining statutory months before booking your G2 road test.',
        'Tip: Completing a Ministry-approved Beginner Driver Education (BDE) course reduces the required wait time by an additional 4 months and saves 15–20% on auto insurance.'
      ];
      feeData = [
        { item: 'G1 Written Knowledge Test Fee', amount: '$16.00 CAD' },
        { item: 'G2 City Road Test Fee', amount: '$53.75 CAD' },
        { item: 'Total Government Cost', amount: '$69.75 CAD' }
      ];
    }
  }

  header.append(
    el('h3', title, 'driving-pathway-title'),
    el('span', badgeText, 'driving-reciprocal-badge ' + badgeClass)
  );

  const ruleBox = el('div', statutoryRule, 'callout');
  ruleBox.style.margin = '12px 0';

  const stepList = el('div', undefined, 'driving-steps-list');
  steps.forEach((st, idx) => {
    const row = el('div', undefined, 'driving-step-row');
    row.append(el('div', String(idx + 1), 'driving-step-circle'), el('div', st));
    stepList.appendChild(row);
  });

  const feeTable = el('table', undefined, 'driving-fees-table');
  feeTable.innerHTML = `
    <thead>
      <tr>
        <th>Fee Category</th>
        <th>Official Amount</th>
      </tr>
    </thead>
    <tbody>
      ${feeData.map(f => `<tr><td>${f.item}</td><td><strong>${f.amount}</strong></td></tr>`).join('')}
    </tbody>
  `;

  const extractGuide = el('div', undefined, 'driving-extract-guide');
  extractGuide.innerHTML = `
    <strong>Consular Extract Requirement:</strong> To qualify for the Full G skip, your Driving Extract (DL Ext) must be on official letterhead from the licensing authority, dated within the last 6 months, and explicitly state:
    <ul>
      <li>Your full legal name and date of birth matching your passport;</li>
      <li>First date of licence issuance and expiration date;</li>
      <li>Licence class (e.g. Non-commercial Light Motor Vehicle / Class G equivalent);</li>
      <li>Clear statement that the licence is in good standing and has never been suspended or revoked.</li>
    </ul>
  `;

  card.append(header, ruleBox, el('h4', 'Step-by-Step Licensing Execution:'), stepList, el('h4', 'Statutory Fees Breakdown:'), feeTable, extractGuide);
  container.appendChild(card);
}

function setupDrivingSuite() {
  $('#driving-form')?.addEventListener('submit', renderDriving);
  $('#driving-origin')?.addEventListener('change', renderDriving);
  $('#driving-dest')?.addEventListener('change', renderDriving);
  $('#driving-years')?.addEventListener('change', renderDriving);
  $('#driving-docs')?.addEventListener('change', renderDriving);
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
  let returnFocus = null;
  let restoreBackground = null;
  const selectionStatus = el('div', '', 'sr-only');
  selectionStatus.setAttribute('role', 'status');
  selectionStatus.setAttribute('aria-live', 'polite');
  modal.querySelector('[role=dialog]').append(selectionStatus);
  categoriesBar?.setAttribute('role', 'group');

  function openPalette(initialCategory = 'all') {
    if (!modal.hidden || !helpOverlay.hidden) return;
    returnFocus = document.activeElement;
    modal.hidden = false;
    restoreBackground = isolateDialog(modal);
    input.value = '';
    currentCategory = initialCategory;
    currentPersona = 'all_personas';
    renderCategories();
    applyFilter();
    input.focus();
  }

  function closePalette() {
    if (modal.hidden) return;
    modal.hidden = true;
    restoreBackground?.(); restoreBackground = null;
    returnFocus?.focus?.();
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
      btn.setAttribute('aria-label', `Filter by ${cat.label}`);
      btn.innerHTML = `
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
        <span class="cmd-cat-pill-count">${count}</span>
      `;
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
      btn.setAttribute('aria-label', `Filter for ${persona.label}`);
      btn.innerHTML = `
        <span>${persona.icon}</span>
        <span>${persona.label}</span>
        <span class="cmd-cat-pill-count">${persona.tools.length}</span>
      `;
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
    categoriesBar?.querySelectorAll('button').forEach(button => {
      const active = button.dataset.persona ? button.dataset.persona === currentPersona : currentPersona === 'all_personas' && button.dataset.cat === currentCategory;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    });
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
    filteredCommands.push(cmd);
    const row = el('div', undefined, 'cmd-row' + (idx === 0 ? ' selected' : ''));
    row.dataset.index = String(idx);
    row.dataset.commandId = cmd.id;

    const catBadge = cmd.category ? `<span class="cmd-cat-badge">${cmd.category.toUpperCase()}</span>` : '';
    const toolBadge = cmd.toolModal ? '<span class="cmd-tool-tag">1-CLICK TOOL</span>' : '';
    const isPinned = getPinnedToolIds().includes(cmd.id) || getPinnedToolIds().includes(cmd.toolModal);

    row.innerHTML = `
      <button type="button" class="cmd-pin-btn ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Unpin tool' : 'Pin tool to top'}" aria-label="${isPinned ? 'Unpin tool' : 'Pin tool'}">${isPinned ? '★' : '☆'}</button>
      <span class="cmd-icon">${cmd.icon || '◈'}</span>
      <div class="cmd-info">
        <div class="cmd-row-head">
          <span class="cmd-title">${cmd.title}</span>
          ${catBadge}
          ${toolBadge}
        </div>
        <div class="cmd-desc">${cmd.desc || ''}</div>
      </div>
      ${cmd.shortcut ? `<span class="cmd-shortcut"><kbd>${cmd.shortcut}</kbd></span>` : ''}
    `;

    row.querySelector('.cmd-pin-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePinnedTool(cmd.id);
      renderCategories();
      applyFilter();
      const replacement = [...list.querySelectorAll('.cmd-row')].find(node => node.dataset.commandId === cmd.id);
      (replacement?.querySelector('.cmd-pin-btn') || input).focus();
    });

    const action = row.querySelector('.cmd-info');
    action.setAttribute('role', 'button');
    action.tabIndex = 0;
    action.setAttribute('aria-label', cmd.title);
    action.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); executeCommand(cmd); }
    });
    row.addEventListener('click', () => executeCommand(cmd));
    return row;
  }

  function renderList(items, query, catFilter, personaFilter) {
    filteredCommands = [];
    activeIndex = 0;
    list.innerHTML = '';

    if (items.length === 0) {
      selectionStatus.textContent = 'No matching tools or commands found.';
      list.innerHTML = `
        <div class="cmd-empty">
          <div class="cmd-empty-icon">🔍</div>
          <div class="cmd-empty-text">No matching tools or commands found.</div>
          <small class="cmd-empty-sub">Try searching by keyword like "PR", "rent", "tax", "LMIA", "notice", or select "All Tools".</small>
        </div>
      `;
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
        header.innerHTML = `
          <span class="cmd-cat-title">${cat.icon} ${cat.label.toUpperCase()}</span>
          <span class="cmd-cat-count">${catItems.length} tools</span>
        `;
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
    const navBtn = document.querySelector(`[data-view="${targetView}"]`);
    if (navBtn) {
      navBtn.click();
    }
    const cardIdMap = {
      'watchdog': 'binder-watchdog',
      'debt-defense': 'debt-defense-card',
      'telecom-defense': 'telecom-defense-card',
      'border-flagpoling': 'border-flagpoling-card',
      'rent-increase': 'rent-increase-card',
      'human-rights-defense': 'human-rights-defense-card',
      'homebuyer-tax': 'homebuyer-tax-card',
      'auto-insurance': 'auto-insurance-card',
      'estate-planning': 'estate-planning-card',
      'moving-tax': 'moving-tax-card',
      'vault': 'tenancy-vault',
      'severance': 'paycheck-severance-card'
    };
    const mappedCardId = cardIdMap[cmd.id] || (document.getElementById(cmd.id + '-card') ? cmd.id + '-card' : (document.getElementById(cmd.id) ? cmd.id : null));
    if (mappedCardId && typeof window.showToolCard === 'function') {
      window.showToolCard(mappedCardId);
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
        announce(`Insider query submitted: ${cmd.query}`);
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
    selectionStatus.textContent = `${filteredCommands.length} results. Selected: ${filteredCommands[activeIndex]?.title || 'None'}`;
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
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closePalette(); }
    if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button,input,[tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target?.closest?.('.tool-modal-overlay, #settlement-wizard-modal') || !helpOverlay.hidden) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.hidden) openPalette('all');
      else closePalette();
    }
  });
}











function setupInsiderIntelSuite() {
  const grid = $('#insider-cards-grid');
  const filterBtns = document.querySelectorAll('.insider-filter-btn');
  if (!grid) return;

  function renderGrid(cat = 'all') {
    const items = cat === 'all' ? INSIDER_INTEL_ITEMS : INSIDER_INTEL_ITEMS.filter(item => item.category === cat);
    grid.innerHTML = items.map(item => `
      <div class="insider-card" data-category="${item.category}">
        <div>
          <div class="insider-card-header">
            <h4>${item.title}</h4>
            <span class="insider-badge ${item.category}">${item.badge}</span>
          </div>
          <div class="insider-myth">${item.myth}</div>
          <div class="insider-statute">${item.statute}</div>
        </div>
        <button type="button" class="insider-ask-btn" data-q="${item.q}" ${item.country ? `data-country="${item.country}"` : ''}>See the official rule ↗</button>
      </div>
    `).join('');

    grid.querySelectorAll('.insider-ask-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        const country = btn.dataset.country;
        const qInput = $('#question');
        if (qInput) {
          qInput.value = q;
          if (country && $('#country')) {
            $('#country').value = country;
            updateCityDropdown(country, $('#city'), $('#city-group'));
          } else {
            if ($('#country')) $('#country').value = '';
            updateCityDropdown('', $('#city'), $('#city-group'));
            if ($('#city')) $('#city').value = 'Toronto';
          }
          $('#question-form')?.requestSubmit();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          announce(`Insider query submitted: ${q}`);
        }
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.category);
    });
  });

  renderGrid('all');
}










































































































































mountPlanAccess(document.querySelector('aside.sidebar'));
mountImmigrationWorkspace(document.querySelector('#immigration-tools'));
setupInsiderIntelSuite();
setupBankingSuite();
setupSchoolsSuite();
setupSosSuite();
setupCommandPalette();
setupQuickActionFab();
setupSettlementWizard();
setupCvJdMatcher();
setupBinderExpiryWatchdog();
setupPreFlightInspector();
setupLayoffCalculator();
setupTenancyEvidenceVault();
setupDrivingSuite();
setupPaycheckSimulator();
setupCareersSuite();
setupHealthcareSuite();
setupCityComparatorSuite();
setupMultilingualSuite();
setupCraBenefitsCalculator();
setupLeaseGuard();
setupChildcareNavigator();
setupCustomsDeclaration();
setupHomebuyerEligibility();
setupBankingComparator();
setupCitizenshipCalculator();
setupEvictionDefense();
setupLeaseAssignment();
setupPrResidencyNavigator();
setupMedicalAdmissibilityNavigator();
setupWorkerClassificationNavigator();
setupVehicleImportNavigator();
setupStudentWorkCompliance();
setupVulnerableWorkerNavigator();
setupSuperVisaNavigator();
setupPetImportNavigator();
setupIdentityHarmonization();
setupCurrencyExchange();
setupParentalLeave();
setupBusinessStructure();
setupExpressEntry();
setupPnpPathway();
setupBowpDiagnostic();
setupDebtCollectionDefense();
setupMovingTaxCalculator();
setupCredentialLicensure();
setupTelecomContractDefense();
setupBorderFlagpoling();
setupRentIncreaseDefense();
setupHumanRightsDefense();
setupHomebuyerTaxIncentives();
setupAutoInsurance();
setupEstatePlanning();
setupSmallClaims();
setupCraVdp();
setupStatutoryPay();
setupConsumerProtection();
setupFamilyLaw();
setupSocialAssistance();
setupTenancyRepairs();
setupCommercialLease();
setupEmploymentReference();
setupHighCostCredit();

setupPgwpNavigator();
setupTfwCompliance();
setupCrossBorderTax();
setupWorkplaceSafety();
setupHealthcarePortability();
setupRealEstateAssignment();
setupOasGis();
setupFranchiseDisclosure();
setupSowpNavigator();
setupCriminalRehab();
setupEiDisqualification();
setupRuralRenewal();
setupSpeculationTax();
setupChildWelfare();
setupExcessiveDemand();
setupFrancophoneMobility();
setupDigitalPlatformWorker();
setupAtlanticImmigration();
setupChildCareSubsidy();
setupBcStrataBylaw();

setupPrCardRenewal();
setupForeignWorkerTransition();
setupChildDisabilityBenefit();
setupAlbertaSecurityDeposit();
setupInternationallyTrainedNurse();
setupPrMatrixSimulator();
setupFamilyReunificationNavigator();
setupTimelineCalendarSync();
setupTaxShieldOptimizer();

setupAlbertaOpportunityStream();
setupBcSpeculationTaxDeclaration();
setupPrtdHumanitarian();
setupSeveranceReasonableNotice();
setupManitobaPnpSkilledWorker();


































// Register Port-of-Entry Offline Service Worker
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  mountAppLifecycle();
}

// Session Storage & Ephemeral State Auto-Purge on Tab Close / Page Unload (Rec 141)
window.addEventListener('pagehide', () => {
  try {
    sessionStorage.clear();
  } catch {
    // Graceful no-op in private browsing
  }
});

// PWA Add-to-Home-Screen Prompt (Rec 150)
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const pwaBanner = document.getElementById('pwa-install-banner');
  if (pwaBanner) pwaBanner.removeAttribute('hidden');
});

const pwaInstallBtn = document.getElementById('pwa-install-btn');
if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      const pwaBanner = document.getElementById('pwa-install-banner');
      if (pwaBanner) pwaBanner.setAttribute('hidden', '');
    }
  });
}

const pwaDismissBtn = document.getElementById('pwa-dismiss-btn');
if (pwaDismissBtn) {
  pwaDismissBtn.addEventListener('click', () => {
    const pwaBanner = document.getElementById('pwa-install-banner');
    if (pwaBanner) pwaBanner.setAttribute('hidden', '');
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const pwaBanner = document.getElementById('pwa-install-banner');
  if (pwaBanner) pwaBanner.setAttribute('hidden', '');
});

// Desktop and mobile share the view handler above; avoid duplicate rendering.
document.querySelectorAll('[data-view="ask"]').forEach(btn => btn.setAttribute('aria-current', 'page'));

const mobileToolsTrigger = document.getElementById('mobile-tools-trigger');
if (mobileToolsTrigger) {
  mobileToolsTrigger.addEventListener('click', () => {
    const toolsCta = document.getElementById('nav-tools-directory-btn');
    if (toolsCta) toolsCta.click();
  });
}


// ==========================================================================
// Multilingual Engine, Port-of-Entry Phrasebook & Glossary (Rec 124-128, 131, 133)
// ==========================================================================

let currentAppLocale = localStorage.getItem('northstar_user_locale') || 'en';

export async function setAppLocale(locale) {
  currentAppLocale = locale;
  localStorage.setItem('northstar_user_locale', locale);

  // Update active pill in sidebar
  document.querySelectorAll('.locale-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.locale === locale);
  });

  try {
    const res = await fetch(`/v1/locales/${locale}`);
    if (!res.ok) return;
    const { dictionary } = await res.json();
    if (!dictionary) return;

    // Apply translations to UI elements
    const brandSub = document.querySelector('.brand small');
    if (brandSub && dictionary.brand_sub) brandSub.textContent = dictionary.brand_sub;

    const wsLabel = document.querySelector('.workspace-label');
    if (wsLabel && dictionary.workspace_label) wsLabel.textContent = dictionary.workspace_label;

    const askInput = document.getElementById('ask-input');
    if (askInput && dictionary.placeholder_ask_input) askInput.placeholder = dictionary.placeholder_ask_input;

    const askBtn = document.getElementById('ask-submit-btn');
    if (askBtn && dictionary.btn_ask) askBtn.textContent = dictionary.btn_ask;

    // Translate navigation buttons
    const navMapping = {
      'ask': dictionary.nav_ask,
      'casework': dictionary.nav_casework,
      'pathway': dictionary.nav_pathway,
      'binder': dictionary.nav_binder,
      'forms': dictionary.nav_forms,
      'airport': dictionary.nav_airport,
      'journey': dictionary.nav_journey,
      'sos': dictionary.nav_sos,
      'housing': dictionary.nav_housing,
      'calculator': dictionary.nav_calculator,
      'browse': dictionary.nav_browse
    };

    for (const [view, label] of Object.entries(navMapping)) {
      if (!label) continue;
      const btn = document.querySelector(`.sidebar nav button[data-view="${view}"]`);
      if (btn) {
        const iconMatch = btn.textContent.match(/^[^\w\s]+\s*&nbsp;\s*/);
        const iconPrefix = iconMatch ? iconMatch[0] : '';
        btn.textContent = '';
        btn.append(iconPrefix, label);
      }
    }
  } catch (err) {
    console.warn('Locale update error:', err);
  }

  // Refresh airport phrasebook if visible
  renderAirportPhrasebook();
}

// Wire Locale Buttons
document.querySelectorAll('.locale-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const loc = btn.dataset.locale;
    if (loc) setAppLocale(loc);
  });
});

// Port-of-Entry Airport Phrasebook Logic (Rec 133)
async function renderAirportPhrasebook() {
  const container = document.getElementById('airport-phrasebook-list');
  if (!container) return;

  const catSelect = document.getElementById('phrasebook-cat-filter');
  const searchInput = document.getElementById('phrasebook-search-input');

  const cat = catSelect ? catSelect.value : '';
  const q = searchInput ? searchInput.value.trim() : '';

  try {
    const res = await fetch(`/v1/phrasebook/airport?lang=${currentAppLocale}&category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`);
    if (!res.ok) return;
    const { phrases } = await res.json();

    container.innerHTML = '';
    if (!phrases || !phrases.length) {
      container.innerHTML = '<p class="u-mt-75" data-s="color-text-muted">No matching airport dialogue phrases found.</p>';
      return;
    }

    for (const p of phrases) {
      const card = document.createElement('div');
      card.className = 'airport-phrase-card';

      const qBox = document.createElement('div');
      qBox.className = 'phrase-officer-q';
      qBox.innerHTML = `<span class="phrase-officer-badge">Border Officer Asks:</span> ${escapeHtml(p.officer_question_en)}`;

      const replyBox = document.createElement('div');
      replyBox.className = 'phrase-reply-box';

      const replyEn = document.createElement('div');
      replyEn.className = 'phrase-reply-en';
      replyEn.textContent = `🗣️ Your Answer: ${p.newcomer_response_en}`;

      const replyVern = document.createElement('div');
      replyVern.className = 'phrase-reply-vernacular';
      replyVern.textContent = `🌐 Localized (${currentAppLocale.toUpperCase()}): ${p.translation}`;

      replyBox.append(replyEn, replyVern);

      if (p.phonetic) {
        const phon = document.createElement('div');
        phon.className = 'phrase-phonetic';
        phon.textContent = `🔊 Phonetic pronunciation: ${p.phonetic}`;
        replyBox.append(phon);
      }

      const dosBox = document.createElement('div');
      dosBox.className = 'phrase-dos-donts';
      dosBox.innerHTML = `<strong>⚠️ Officer Advice:</strong> ${escapeHtml(p.critical_dos_and_donts)}`;

      // Quick speech listen button for phrase
      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'tts-play-btn u-mt-50';
      speakBtn.textContent = '🔊 Listen to English Answer';
      speakBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(p.newcomer_response_en);
          utt.lang = 'en-CA';
          window.speechSynthesis.speak(utt);
        }
      });

      card.append(qBox, replyBox, dosBox, speakBtn);
      container.append(card);
    }
  } catch (err) {
    console.warn('Error loading airport phrasebook:', err);
  }
}

const phrasebookCat = document.getElementById('phrasebook-cat-filter');
const phrasebookSearch = document.getElementById('phrasebook-search-input');
if (phrasebookCat) phrasebookCat.addEventListener('change', renderAirportPhrasebook);
if (phrasebookSearch) phrasebookSearch.addEventListener('input', () => {
  clearTimeout(phrasebookSearch._timer);
  phrasebookSearch._timer = setTimeout(renderAirportPhrasebook, 250);
});

// Multilingual Glossary Modal & Search Logic (Rec 127)
async function renderGlossaryModal() {
  const container = document.getElementById('glossary-results-list');
  if (!container) return;

  const searchInput = document.getElementById('glossary-search-input');
  const catSelect = document.getElementById('glossary-category-select');

  const q = searchInput ? searchInput.value.trim() : '';
  const cat = catSelect ? catSelect.value : '';

  try {
    const res = await fetch(`/v1/glossary/multilingual?lang=${currentAppLocale}&category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}&limit=40`);
    if (!res.ok) return;
    const { terms, total } = await res.json();

    container.innerHTML = '';
    if (!terms || !terms.length) {
      container.innerHTML = '<p class="u-mt-75" data-s="color-text-muted">No matching terms found in 500-term glossary.</p>';
      return;
    }

    for (const t of terms) {
      const card = document.createElement('div');
      card.className = 'glossary-card';

      const head = document.createElement('div');
      head.className = 'glossary-card-header';

      const title = document.createElement('div');
      title.className = 'glossary-card-title';
      title.textContent = t.term;

      const catBadge = document.createElement('span');
      catBadge.className = 'glossary-card-cat';
      catBadge.textContent = t.category;

      head.append(title, catBadge);

      const def = document.createElement('div');
      def.className = 'glossary-card-def';
      def.textContent = t.definition;

      card.append(head, def);
      container.append(card);
    }
  } catch (err) {
    console.warn('Error fetching glossary:', err);
  }
}

const glossaryModal = document.getElementById('glossary-modal');
const openGlossaryBtn = document.getElementById('nav-open-glossary');
const closeGlossaryBtn = document.getElementById('glossary-modal-close');
const glossarySearch = document.getElementById('glossary-search-input');
const glossaryCat = document.getElementById('glossary-category-select');

if (openGlossaryBtn && glossaryModal) {
  openGlossaryBtn.addEventListener('click', () => {
    if (typeof glossaryModal.showModal === 'function') {
      glossaryModal.showModal();
    } else {
      glossaryModal.setAttribute('open', '');
    }
    renderGlossaryModal();
  });
}
if (closeGlossaryBtn && glossaryModal) {
  closeGlossaryBtn.addEventListener('click', () => {
    if (typeof glossaryModal.close === 'function') {
      glossaryModal.close();
    } else {
      glossaryModal.removeAttribute('open');
    }
  });
}
if (glossarySearch) glossarySearch.addEventListener('input', () => {
  clearTimeout(glossarySearch._timer);
  glossarySearch._timer = setTimeout(renderGlossaryModal, 250);
});
if (glossaryCat) glossaryCat.addEventListener('change', renderGlossaryModal);

// ==========================================================================
// Sidebar Category Accordion & In-Page Tool Switcher (UI/UX Overhaul)
// ==========================================================================

let sidebarAccordionSync = null;

export function syncSidebarActiveView(activeViewId) {
  if (typeof sidebarAccordionSync === 'function') {
    sidebarAccordionSync(activeViewId);
  }
}

export function initSidebarAccordion() {
  let isAccordionFocus = true; // Auto-collapse other categories by default
  const modeBtn = document.getElementById('sidebar-accordion-mode-btn');
  const toggleAllBtn = document.getElementById('sidebar-toggle-all-btn');
  const groups = Array.from(document.querySelectorAll('.sidebar .nav-group'));

  function updateGroupState(targetGroup, expand) {
    if (expand) {
      targetGroup.classList.remove('collapsed');
      const toggle = targetGroup.querySelector('.nav-group-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      const badge = targetGroup.querySelector('.nav-group-state');
      if (badge) {
        badge.classList.add('active');
        badge.textContent = '− Hide Menu';
      }
    } else {
      targetGroup.classList.add('collapsed');
      const toggle = targetGroup.querySelector('.nav-group-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      const badge = targetGroup.querySelector('.nav-group-state');
      if (badge) {
        badge.classList.remove('active');
        badge.textContent = '+ Show Menu';
      }
    }
  }

  function openOnlyGroup(activeGroup) {
    groups.forEach(g => {
      if (g === activeGroup) {
        updateGroupState(g, true);
      } else {
        updateGroupState(g, false);
      }
    });
  }

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      isAccordionFocus = !isAccordionFocus;
      const modeText = document.getElementById('accordion-mode-text');
      if (isAccordionFocus) {
        if (modeText) modeText.textContent = 'Single Focus: ON';
        modeBtn.classList.remove('all-expanded');
        modeBtn.classList.add('active');
        const activeGroup = groups.find(g => g.querySelector('.nav.active')) || groups[0];
        if (activeGroup) openOnlyGroup(activeGroup);
      } else {
        if (modeText) modeText.textContent = 'Single Focus: OFF';
        modeBtn.classList.remove('active');
        modeBtn.classList.add('all-expanded');
      }
    });
  }

  if (toggleAllBtn) {
    let allExpanded = false;
    toggleAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      const toggleText = document.getElementById('accordion-toggle-all-text');
      if (allExpanded) {
        isAccordionFocus = false;
        if (modeBtn) {
          const modeText = document.getElementById('accordion-mode-text');
          if (modeText) modeText.textContent = 'Single Focus: OFF';
          modeBtn.classList.remove('active');
        }
        groups.forEach(g => updateGroupState(g, true));
        if (toggleText) toggleText.textContent = 'Hide All';
      } else {
        groups.forEach(g => updateGroupState(g, false));
        if (toggleText) toggleText.textContent = 'Show All';
      }
    });
  }

  groups.forEach(g => {
    const toggle = g.querySelector('.nav-group-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isCurrentlyCollapsed = g.classList.contains('collapsed');
      if (isCurrentlyCollapsed) {
        if (isAccordionFocus) {
          openOnlyGroup(g);
        } else {
          updateGroupState(g, true);
        }
      } else {
        updateGroupState(g, false);
      }
    });
  });

  sidebarAccordionSync = function(activeViewId) {
    groups.forEach(g => {
      const hasActiveBtn = g.querySelector(`[data-view="${activeViewId}"]`);
      if (hasActiveBtn) {
        g.classList.add('has-active');
        if (isAccordionFocus) {
          openOnlyGroup(g);
        } else {
          updateGroupState(g, true);
        }
      } else {
        g.classList.remove('has-active');
      }
    });
  };

  // Sidebar controls for both Desktop and Mobile
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const backdrop = document.getElementById('sidebar-backdrop');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('active');
    }
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.hidden = true;
    }
  }

  function updateToggleBtnState() {
    if (!toggleBtn) return;
    const labelSpan = toggleBtn.querySelector('.toggle-label');
    const iconSpan = toggleBtn.querySelector('.toggle-icon');
    if (window.innerWidth > 820) {
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      if (labelSpan) labelSpan.textContent = isCollapsed ? 'Show Menu' : 'Hide Menu';
      if (iconSpan) iconSpan.textContent = isCollapsed ? '☰' : '◀';
      toggleBtn.setAttribute('title', isCollapsed ? 'Show navigation menu' : 'Hide navigation menu');
    } else {
      if (labelSpan) labelSpan.textContent = 'Menu';
      if (iconSpan) iconSpan.textContent = '☰';
      toggleBtn.setAttribute('title', 'Toggle navigation menu');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth > 820) {
        // Desktop collapse toggle
        document.body.classList.toggle('sidebar-collapsed');
        updateToggleBtnState();
      } else {
        // Mobile drawer toggle
        if (sidebar && sidebar.classList.contains('open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      }
    });
  }

  window.addEventListener('resize', () => {
    updateToggleBtnState();
    if (window.innerWidth > 820) {
      closeMobileSidebar();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  // Close sidebar drawer on mobile when any navigation item is tapped
  document.querySelectorAll('.sidebar nav button[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        closeMobileSidebar();
      }
    });
  });

  updateToggleBtnState();

  const initialActive = document.querySelector('.sidebar nav .nav.active')?.dataset.view || 'casework';
  sidebarAccordionSync(initialActive);
}



export function showToolCard(cardId) {
  for (const [viewId, tools] of Object.entries(TOOL_SWITCHER_CONFIG)) {
    if (tools.some(t => t.id === cardId)) {
      if (typeof currentView !== 'undefined' && currentView !== viewId) {
        const navBtn = document.querySelector(`[data-view="${viewId}"]`);
        if (navBtn) navBtn.click();
      }
      const ctrl = viewToolControllers[viewId];
      if (ctrl) {
        ctrl.selectToolById(cardId, true);
      }
      return true;
    }
  }
  return false;
}
if (typeof window !== 'undefined') {
  window.showToolCard = showToolCard;
}


function handleInitialOrHashNavigation() {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash ? window.location.hash.substring(1) : '';
  if (hash) {
    showToolCard(hash);
  }
  window.addEventListener('hashchange', () => {
    const curHash = window.location.hash ? window.location.hash.substring(1) : '';
    if (curHash) showToolCard(curHash);
  });
}

function bootstrapUiNavigation() {
  initSidebarAccordion();
  initViewToolSwitchers();
  handleInitialOrHashNavigation();
}

// Initial bootstrap on DOMContentLoaded or load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrapUiNavigation();
    if (currentAppLocale !== 'en') setAppLocale(currentAppLocale);
    renderAirportPhrasebook();
  });
} else {
  bootstrapUiNavigation();
  if (currentAppLocale !== 'en') setAppLocale(currentAppLocale);
  renderAirportPhrasebook();
}
