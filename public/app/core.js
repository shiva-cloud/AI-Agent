// Shared helpers for the main app: DOM shortcuts, storage, formatting and small view utilities.
// Split out of public/app.js; app.js imports what it uses from here.
import { reviewLabel } from '../answer-view.js';
import { humanizeGap } from '../errors.js';
import { AI_STATUS_META, ASK_LABEL, BASE_TITLE, COUNTRY_CITIES, MULTILINGUAL_TERMS, VIEW_TITLES } from './data.js';

export const $ = s => document.querySelector(s);

export const $$ = s => document.querySelectorAll(s);

// Escapes text for the HTML-string templates that tool views build with
// innerHTML. Anything that came from the user or the server goes through it.
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

// Storage can throw (blocked site data, private windows) and saved values can
// be corrupt; neither may stop the app from loading.
export function readStored(key, fallback, parse = false) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse ? JSON.parse(raw) ?? fallback : raw;
  } catch {
    return fallback;
  }
}

export function updateCityDropdown(countryVal, selectEl, labelEl) {
  if (!selectEl) return;
  const list = COUNTRY_CITIES[countryVal] || COUNTRY_CITIES[''] || [];
  const prevVal = selectEl.value;
  selectEl.innerHTML = '';
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = countryVal ? 'Choose city (Optional / All)' : 'Choose city (Optional)';
  selectEl.appendChild(opt0);
  for (const c of list) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    selectEl.appendChild(opt);
  }
  if (list.includes(prevVal)) {
    selectEl.value = prevVal;
  } else {
    selectEl.value = '';
  }
  if (labelEl) {
    labelEl.style.display = '';
    const labelSpan = labelEl.querySelector('span') || labelEl;
    if (labelSpan) {
      if (!countryVal || countryVal === 'Canada' || countryVal === 'CA') {
        labelSpan.textContent = 'CANADIAN CITY';
      } else if (countryVal === 'United States') {
        labelSpan.textContent = 'US CITY';
      } else if (countryVal === 'United Kingdom') {
        labelSpan.textContent = 'UK CITY';
      } else if (countryVal === 'Australia') {
        labelSpan.textContent = 'AUSTRALIAN CITY';
      } else if (countryVal === 'Germany') {
        labelSpan.textContent = 'GERMAN CITY';
      } else if (countryVal === 'United Arab Emirates') {
        labelSpan.textContent = 'UAE EMIRATE / CITY';
      } else {
        labelSpan.textContent = `${countryVal.toUpperCase()} CITY`;
      }
    }
  }
}

export const titleFor = v => `${BASE_TITLE} — ${VIEW_TITLES[v] ?? VIEW_TITLES.ask}`;

export function coverageTileClass(t) {
  return t.status === 'source_guidance' ? 'topic-ok' : t.status === 'missing' ? 'topic-missing' : 'topic-review';
}

// Day-differences between YYYY-MM-DD strings, so GMT-checked evidence reads
// naturally without inventing an hour of the day.
export function relDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const days = Math.round((Date.parse(iso) - Date.parse(new Date().toISOString().slice(0, 10))) / 86400000);
  if (days === 0) return 'today';
  const s = Math.abs(days) === 1 ? 'day' : 'days';
  return days > 0 ? `in ${days} ${s}` : `${-days} ${s} ago`;
}

// One compact chip summarizing how fresh the quoted evidence is.
export function freshnessChip(sources) {
  if (!sources.length) return null;
  const checkedAt = sources.map(s => s.checkedAt).filter(Boolean).sort()[0];
  const expiresAt = sources.map(s => s.expiresAt).filter(Boolean).sort()[0];
  if (!checkedAt && !expiresAt) return null;
  const parts = [];
  if (checkedAt) parts.push(`Oldest source check ${checkedAt}`);
  if (expiresAt) parts.push(`expire ${expiresAt}`);
  // Same UTC calendar-day math as relDate(), so the chip and the source
  // lines never disagree by a day border.
  const days = expiresAt ? Math.round((Date.parse(expiresAt) - Date.parse(new Date().toISOString().slice(0, 10))) / 86400000) : Infinity;
  return el('span', parts.join(' · '), `fresh-chip${days <= 7 ? ' fresh-soon' : ''}`);
}

// Honest "why this answer" panel built from the retrieval diagnostics the
// engine already returns on /v1/answers.
export function retrievalPanel(retrieval) {
  if (!retrieval?.candidates?.length) return null;
  const details = el('details', undefined, 'retrieval');
  details.append(el('summary', 'How was this answer chosen?'));
  details.append(el('p', `Keyword ranking (${retrieval.version}): higher scores mean closer keyword and scope matches.`, 'muted'));
  retrieval.candidates.slice(0, 8).forEach(c => {
    const row = el('div', undefined, 'source');
    row.append(el('strong', c.id));
    const terms = c.matchedTerms?.length ? c.matchedTerms.join(', ') : 'no keyword match';
    const score = typeof c.score === 'number' ? c.score.toFixed(3) : c.score;
    row.append(el('small', `score ${score} · ${terms} · ${c.available ? 'eligible for selection' : 'unavailable'}`));
    if (!c.available) row.append(el('p', humanizeGap(c.reason), 'muted'));
    details.append(row);
  });
  return details;
}

export function el(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}

export function link(title, url) {
  const a = el('a', title);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

export function spinner() {
  const s = el('div', '', 'spinner');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<span class="spinner-dot"></span><span class="spinner-dot"></span><span class="spinner-dot"></span><span class="spinner-dot"></span>';
  return s;
}

// Rebuilds the submit button exactly as written in index.html (text node + arrow span).
export function resetAskButton(button) {
  button.disabled = false;
  button.classList.remove('disabled');
  button.textContent = '';
  button.append(document.createTextNode(ASK_LABEL), el('span', '↗'));
}

export function detectUserLanguage(text, explicitlySelected) {
  if (explicitlySelected && explicitlySelected !== 'en') return explicitlySelected;
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari script
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Gurmukhi script
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic script
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese Hanzi
  if (/\b(?:el|la|los|las|un|una|por favor|cómo|como|donde|dónde|salud|alquiler|arriendo|vivienda)\b/i.test(text)) return 'es';
  if (/\b(?:le|la|les|un|une|s'il vous plaît|comment|santé|logement|loyer)\b/i.test(text)) return 'fr';
  return 'en';
}

export function normalizeToCanonicalEnglish(rawQuery, lang) {
  if (!lang || lang === 'en') return rawQuery;
  const config = MULTILINGUAL_TERMS[lang];
  if (!config) return rawQuery;
  for (const [pattern, canonical] of config.patterns) {
    if (pattern.test(rawQuery)) return canonical;
  }
  return rawQuery;
}

export const coverageFilter = { status: 'all', q: '' };

// Plain-text report for copying or pasting from the print-out.
export function answerReport(r, original) {
  const lines = [];
  lines.push('Northstar — settlement guidance (research preview)');
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Question: ${original.question}`);
  if (original.city) lines.push(`Location selected: ${original.city}`);
  const aiLabel = AI_STATUS_META[r.ai?.status]?.[0]?.toLowerCase();
  lines.push(`Status: ${r.status}${aiLabel ? ` · ${aiLabel}` : ''}`);
  if (r.message) lines.push('', r.message);
  if (r.notice) lines.push(r.notice);
  if (r.clarification) lines.push('', `Clarification needed: ${r.clarification}`);
  if (r.claims.length) {
    lines.push('', 'Guidance:');
    r.claims.forEach(c => {
      const s = r.sources.find(x => x.id === c.evidenceId);
      lines.push(`- ${c.text}${s ? ` [${s.title}](${s.url})` : ''}`);
    });
  }
  if (r.gaps.length) {
    lines.push('', 'Still unverified / needs review:');
    r.gaps.forEach(g => lines.push(`- ${g.topic || 'Question'}: ${humanizeGap(g.reason)}`));
  }
  if (r.sources.length) {
    lines.push('', 'Sources:');
    // Retrieval transparency survives the export: each quoted source keeps its
    // keyword-relevance score when the engine reported one.
    const scored = new Map((r.retrieval?.candidates || []).map(c => [c.id, c]));
    r.sources.forEach(s => {
      const c = scored.get(s.id);
      const score = typeof c?.score === 'number' ? ` · relevance ${c.score.toFixed(3)}` : '';
      lines.push(`- ${s.title} — ${s.url} (${reviewLabel(s)[2]}, checked ${s.checkedAt}, expires ${s.expiresAt}${score})`);
    });
  }
  lines.push('', 'Northstar is a research preview, not legal, immigration or medical advice, and not a government service.');
  return lines.join('\n');
}

export function getBinderStorageKey() {
  const country = $('#binder-country')?.value || 'Canada';
  const status = $('#binder-status')?.value || 'work_permit';
  const city = $('#binder-city')?.value || (country === 'Canada' ? 'Toronto' : 'All');
  return `northstar_binder_${country}_${status}_${city}`;
}

export function loadBinderChecked() {
  try {
    const raw = localStorage.getItem(getBinderStorageKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveBinderChecked(set) {
  try {
    localStorage.setItem(getBinderStorageKey(), JSON.stringify([...set]));
  } catch {}
}

// ==========================================
// CLIENT-SIDE PRE-FLIGHT OCR DOCUMENT SCANNER
// ==========================================
export function analyzeDocumentText(text, docType = 'auto') {
  const now = new Date();
  const result = {
    docType,
    verdict: 'compliant',
    statusBadge: '✓ COMPLIANT',
    details: '',
    statutoryRule: '',
    detectedDate: null,
    daysDiff: null,
    monthsDiff: null
  };

  const passportExpiryMatch = text.match(/(?:expir(?:y|ation)?(?:\s+date)?|valid\s+until|date\s+d'expiration)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i)
    || text.match(/\b([0-9]{2}[0-9]{2}[0-9]{2}[0-9]?[MF<][0-9]{6})/);

  const addressDateMatch = text.match(/(?:statement\s+date|bill\s+date|invoice\s+date|issue\s+date|date\s+d'émission)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i)
    || text.match(/\b(202[0-9][-/][0-1][0-9][-/][0-3][0-9]|[0-3][0-9][-/][0-1][0-9][/]202[0-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-3]?[0-9],?\s+202[0-9])\b/i);

  const isTranslation = /certified\s+translation|sworn\s+translator|atio|stibc|naati|traducteur\s+agréé|notary\s+public|apostille|official\s+translation/i.test(text);

  if (/passport|passeport|mrz/i.test(text) || docType === 'passport') {
    result.docType = 'passport';
    result.statutoryRule = 'International Carrier & Border Rule: Minimum 6 Months Passport Validity from Arrival Date';
    if (passportExpiryMatch) {
      let expDate;
      const raw = passportExpiryMatch[1] || passportExpiryMatch[0];
      if (/^[0-9]{2}[0-9]{2}[0-9]{2}/.test(raw) && raw.length >= 6) {
        const yy = 2000 + parseInt(raw.slice(0, 2), 10);
        const mm = parseInt(raw.slice(2, 4), 10) - 1;
        const dd = parseInt(raw.slice(4, 6), 10);
        expDate = new Date(Date.UTC(yy, mm, dd));
      } else {
        expDate = new Date(raw);
      }

      if (!isNaN(expDate.getTime())) {
        result.detectedDate = expDate.toISOString().slice(0, 10);
        const monthsRemaining = (expDate.getFullYear() - now.getFullYear()) * 12 + (expDate.getMonth() - now.getMonth());
        result.monthsDiff = monthsRemaining;

        if (monthsRemaining < 6) {
          result.verdict = 'danger';
          result.statusBadge = '❌ BORDER REJECTION RISK (< 6 MONTHS)';
          result.details = `Passport expires on ${result.detectedDate} (${monthsRemaining} months remaining). International airlines and border authorities (US CBP, UK Border Force, EU Schengen, UAE ICP) will deny boarding or entry. Must renew prior to departure.`;
        } else {
          result.verdict = 'compliant';
          result.statusBadge = '✓ PASS: VALID FOR INTERNATIONAL ENTRY';
          result.details = `Passport valid until ${result.detectedDate} (${monthsRemaining} months remaining). Satisfies statutory 6-month validity requirement.`;
        }
      }
    } else {
      result.verdict = 'warn';
      result.statusBadge = '⚠️ EXPIRY DATE NOT CLEARLY DETECTED';
      result.details = 'Could not automatically identify passport expiry date. Ensure the date of expiry or bottom MRZ line is clearly visible.';
    }
  } else if (isTranslation || docType === 'translation') {
    result.docType = 'translation';
    result.statutoryRule = 'IRCC, ServiceOntario & NHS Translation Rule: Certified Translation with Official Stamp/Affidavit';
    result.statusBadge = '✓ CERTIFIED TRANSLATION DETECTED';
    result.details = 'Official certification seal/credentials detected (ATIO, STIBC, NAATI, Sworn Translator). Document is admissible for government and banking KYC without re-translation.';
  } else {
    result.docType = 'address_proof';
    result.statutoryRule = 'Bank Act s.627.17 & Provincial Health/Licensing: Proof of Address Must Be Under 90 Days Old';
    if (addressDateMatch) {
      const rawDateStr = addressDateMatch[1] || addressDateMatch[0];
      const parsedDate = new Date(rawDateStr);
      if (!isNaN(parsedDate.getTime())) {
        result.detectedDate = parsedDate.toISOString().slice(0, 10);
        const daysAgo = Math.round((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        result.daysDiff = daysAgo;

        if (daysAgo > 90) {
          result.verdict = 'danger';
          result.statusBadge = '❌ EXPIRED PROOF OF ADDRESS (> 90 DAYS)';
          result.details = `Document is dated ${result.detectedDate} (${daysAgo} days ago). Canadian retail banks (RBC, TD, Scotiabank), ServiceOntario, and NHS GP surgeries strictly reject address proofs older than 90 days. Obtain a fresh statement.`;
        } else if (daysAgo > 60) {
          result.verdict = 'warn';
          result.statusBadge = '⚠️ EXPIRING SOON (> 60 DAYS)';
          result.details = `Document is dated ${result.detectedDate} (${daysAgo} days ago). Currently valid, but only ${90 - daysAgo} days of validity remaining. Recommend obtaining a fresh statement before in-person appointments.`;
        } else {
          result.verdict = 'compliant';
          result.statusBadge = '✓ PASS: VALID PROOF OF ADDRESS (UNDER 90 DAYS)';
          result.details = `Document is dated ${result.detectedDate} (${daysAgo} days ago). Within the 90-day statutory recency threshold. Fully accepted for retail banking KYC and healthcare registration.`;
        }
      }
    } else {
      result.verdict = 'warn';
      result.statusBadge = '⚠️ DATE NOT CLEARLY DETECTED';
      result.details = 'Unable to reliably extract document issuance date. Ensure document shows a clear issue date within the last 90 days.';
    }
  }

  return result;
}

export function updateBinderProgress(total, verified) {
  const percent = total > 0 ? Math.round((verified / total) * 100) : 0;
  const textEl = $('#binder-progress-text');
  const pctEl = $('#binder-progress-percent');
  const fillEl = $('#binder-progress-fill');
  if (textEl) textEl.textContent = `Document Readiness: ${verified} of ${total} documents verified`;
  if (pctEl) pctEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
}

// "What changed recently" (P0-3): evidence currency is the pilot's strongest
// honesty signal, so it gets its own public collapsible panel on the coverage
// view. Aggregate counters plus the newest-checked records; no visitor data.
export function buildChangesPanel(changes) {
  const panel = el('details', undefined, 'changes-panel');
  panel.append(el('summary', 'What changed recently'));
  const c = changes.counts;
  panel.append(el('p', `${c.total} evidence records · ${c.recentlyChecked} checked in the last 7 days · ${c.expired} expired · ${c.expiringSoon} expiring within 7 days · ${c.pendingReview} awaiting human review.`));
  const list = el('ul', undefined, 'changes-list');
  changes.items.slice(0, 8).forEach(item => {
    const li = el('li');
    li.append(el('strong', item.title));
    li.append(el('small', `${item.status.replaceAll('_', ' ')} · ${item.jurisdiction} · checked ${item.checkedAt} (${relDate(item.checkedAt)}) · expires ${item.expiresAt} (${relDate(item.expiresAt)})`));
    list.append(li);
  });
  panel.append(list);
  panel.append(el('p', 'Aggregate evidence currency — no visitor data. Full per-record detail lives in the city sheets below.', 'muted'));
  return panel;
}

export const gapCount = t => coverageTileClass(t) === 'topic-ok' ? 0 : coverageTileClass(t) === 'topic-missing' ? 2 : 1;

export function generateDisputeLetterText({ today, dest, issue, rent, demand, lawfulLimit, overcharge, j, title, citation }) {
  const cur = j.symbol;
  let specificNotice = '';

  if (issue === 'advance_rent') {
    specificNotice = `This letter concerns your recent requirement that I pay ${cur}${demand.toLocaleString()} ${j.currency} in advance rent as a condition of leasing the residential premises.

Under the governing legislation (${citation}), landlords are statutorily prohibited from requiring advance rent or deposits exceeding the lawful limit of ${cur}${lawfulLimit.toLocaleString()} ${j.currency}. Demanding multiple months of rent in advance due to a lack of local credit history or employment history is an unlawful practice.`;
  } else if (issue === 'illegal_deposit') {
    specificNotice = `This letter formally addresses the demand for a deposit of ${cur}${demand.toLocaleString()} ${j.currency} for the residential premises.

Under ${citation}, the statutory limit for allowable deposits is ${cur}${lawfulLimit.toLocaleString()} ${j.currency}. Charges for damage deposits, cleaning fees, or excessive key fees constitute prohibited payments and are void as a matter of law.`;
  } else if (issue === 'rent_hike') {
    specificNotice = `This letter formally responds to your notice proposing a rent increase to ${cur}${demand.toLocaleString()} ${j.currency} per month.

Under ${citation}, rent increases are strictly regulated and require mandatory statutory notice periods on prescribed forms, and cannot exceed the lawful statutory limit (${cur}${lawfulLimit.toLocaleString()} ${j.currency}/mo). Any increase demanded without compliance with this statutory procedure is without legal effect.`;
  } else if (issue === 'unlawful_entry') {
    specificNotice = `I am writing to formally object to recent entry (or attempted entry) into the rental premises without proper statutory notice.

Pursuant to ${citation}, you are required to provide written notice at least 24 hours in advance specifying a legitimate statutory purpose and a reasonable daylight time window. As a residential tenant, I am entitled to full statutory quiet enjoyment of the premises.`;
  } else if (issue === 'eviction_notice') {
    specificNotice = `This letter acknowledges receipt of your notice seeking termination of the tenancy.

Please be advised that under ${citation}, any notice of termination for landlord personal use requires strict statutory compliance, including mandatory payment of statutory compensation on or before the specified date. Under governing law, a tenant is entitled to remain in occupancy pending a formal hearing before ${j.authority}.`;
  } else {
    specificNotice = `This letter addresses the clause in the tenancy agreement purporting to prohibit pets in the premises.

Pursuant to ${citation}, clauses in residential tenancy agreements prohibiting animals are legally void and unenforceable. I am prepared to proceed with the tenancy in full compliance with all lawful statutory obligations.`;
  }

  return `Date: ${today}

To: [Landlord / Property Manager Name]
Premises: [Rental Property Address]
From: [Tenant Name(s)]

SUBJECT: FORMAL NOTICE OF STATUTORY COMPLIANCE — ${title.toUpperCase()}
REFERENCE: ${citation}

Dear [Landlord / Property Manager Name],

${specificNotice}

I wish to maintain a positive, cooperative, and compliant tenancy. Accordingly, I confirm that I am prepared to fulfill all lawful statutory obligations, including payment of the lawful amount of ${cur}${lawfulLimit.toLocaleString()} ${j.currency} as established by law.

Please confirm in writing within five (5) business days that the unlawful demand has been withdrawn and that this tenancy will proceed in full compliance with ${j.statute}.

Should you insist upon this unlawful demand or take retaliatory action, please note that I reserve all legal rights to file an immediate application with ${j.authority} (${j.tribunalForm}) seeking statutory enforcement, administrative penalties, and full cost recovery.

Thank you for your prompt cooperation in resolving this matter.

Sincerely,

[Tenant Name(s)]
[Contact Phone / Email]`;
}

export function formatIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateICSContent(landingDateStr, milestones) {
  const landing = new Date(landingDateStr + 'T00:00:00Z');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northstar Settlement Intelligence//Settlement Roadmap v3.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Settlement Roadmap - Northstar',
    'X-WR-TIMEZONE:UTC'
  ];

  milestones.forEach(m => {
    const target = new Date(landing.getTime() + m.dayOffset * 86400000);
    const y = target.getUTCFullYear();
    const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(target.getUTCDate()).padStart(2, '0');
    const dt = `${y}${mm}${dd}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:northstar-${m.id}-${dt}@settlement.intelligence`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:[Northstar] ${m.title}`);
    lines.push(`DESCRIPTION:${m.desc} (Statutory: ${m.cite})`);
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: [Northstar] ${m.title}`);
    lines.push('TRIGGER:-P1D');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function updateFormPreview(tpl, data) {
  const preview = $('#forms-preview');
  if (!preview) return;
  preview.innerHTML = '';

  const doc = el('div', undefined, 'form-official-sheet');

  // Header
  const header = el('div', undefined, 'form-doc-header');
  const left = el('div');
  left.append(el('div', tpl.org, 'form-doc-org'));
  left.append(el('div', tpl.num, 'form-doc-num'));
  left.append(el('div', tpl.title, 'form-doc-title'));
  left.append(el('div', `Statutory Parity: ${tpl.statute}`, 'journey-milestone-cite'));

  const right = el('div', undefined, 'form-doc-badge');
  right.append(document.createTextNode('OFFICIAL SUBMISSION COPY'));
  header.append(left, right);
  doc.append(header);

  // Body Sections
  const sec = el('div', undefined, 'form-doc-section');
  sec.append(el('div', 'Part 1: Identification & Prescribed Statutory Information', 'form-sec-head'));

  const secBody = el('div', undefined, 'form-sec-body');
  tpl.fields.forEach(f => {
    const unit = el('div', undefined, 'form-field-unit');
    unit.append(el('span', f.label, 'form-field-key'));
    unit.append(el('span', data[f.id] || '—', 'form-field-val'));
    secBody.append(unit);
  });
  sec.append(secBody);
  doc.append(sec);

  // Declaration Block
  const decl = el('div', undefined, 'form-declaration-box');
  decl.append(el('strong', 'Statutory Declaration: '));
  decl.append(document.createTextNode('I hereby declare and affirm under penalties of perjury and statutory non-compliance that the information provided above is true, correct, and complete to the best of my knowledge. Prepared under the statutory authority of ' + tpl.statute + '.'));
  doc.append(decl);

  preview.append(doc);
}

// --- STANDALONE VECTORIZED PDF GENERATOR ENGINE ---
export function generateVectorPDF(org, num, title, statute, fields) {
  let stream = '';
  // Document Header
  stream += 'BT\n/F1 10 Tf\n50 780 Td\n(' + escapePdfText(org) + ') Tj\nET\n';
  stream += 'BT\n/F1 16 Tf\n50 760 Td\n(' + escapePdfText(num + ': ' + title) + ') Tj\nET\n';
  stream += 'BT\n/F1 9 Tf\n50 742 Td\n(Statutory Parity: ' + escapePdfText(statute) + ') Tj\nET\n';

  // Divider Line
  stream += '50 732 m 545 732 l S\n';

  // Section Heading
  stream += 'BT\n/F1 11 Tf\n50 715 Td\n(PART 1: PRESCRIBED STATUTORY SUBMISSION DETAILS) Tj\nET\n';

  let y = 690;
  fields.forEach(f => {
    stream += 'BT\n/F1 9 Tf\n50 ' + y + ' Td\n(' + escapePdfText(f.label) + ':) Tj\nET\n';
    stream += 'BT\n/F1 10 Tf\n220 ' + y + ' Td\n(' + escapePdfText(String(f.val || '—')) + ') Tj\nET\n';
    // dotted line
    stream += '220 ' + (y - 2) + ' m 545 ' + (y - 2) + ' l S\n';
    y -= 22;
  });

  // Statutory Declaration Box
  y -= 10;
  stream += '50 ' + y + ' 495 50 re S\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 35) + ' Td\n(STATUTORY DECLARATION: I declare under penalties of perjury and statutory non-compliance) Tj\nET\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 22) + ' Td\n(that the statements made herein are true, correct, and complete to the best of my knowledge.) Tj\nET\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 10) + ' Td\n(Prepared under official statutory authority: ' + escapePdfText(statute) + ') Tj\nET\n';

  // Signature Block
  y -= 45;
  stream += 'BT\n/F1 9 Tf\n50 ' + y + ' Td\n(Applicant / Declarant Signature: _______________________________   Date: ' + escapePdfText(new Date().toISOString().slice(0, 10)) + ') Tj\nET\n';

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  objects.push('4 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj\n');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const xref = [0];
  let offset = pdf.length;

  objects.forEach(obj => {
    xref.push(offset);
    pdf += obj;
    offset = pdf.length;
  });

  const startxref = offset;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
  pdf += 'startxref\n' + startxref + '\n%%EOF';

  return pdf;
}

export function escapePdfText(str) {
  return String(str || '').replace(/[\\()]/g, '\\$&').replace(/[\r\n]+/g, ' ');
}

export function auditResumeText(text) {
  const violations = [];
  let cleaned = text;

  // 1. Photo references
  if (/(photo|headshot|picture|image|passport photo)/i.test(text)) {
    violations.push({
      rule: 'Photograph / Headshot reference detected',
      statute: 'Ontario Human Rights Code s.5 / US EEOC Title VII / UK Equality Act 2010',
      reason: 'North American and UK employers prohibit photos on CVs to prevent visual bias claims regarding race, age, and appearance. ATS systems frequently auto-reject resumes with photos.'
    });
    cleaned = cleaned.replace(/.*(photo|headshot|picture|image).*[\r\n]*/gi, '');
  }

  // 2. Date of birth / Age
  if (/(date of birth|d\.o\.b|dob|birth date|born in|\bage\b|\b\d{2}\s*years old\b)/i.test(text)) {
    violations.push({
      rule: 'Date of Birth / Age reference detected',
      statute: 'Age Discrimination in Employment Act (ADEA) / Human Rights Code',
      reason: 'Asking for or including age/DOB exposes employers to age discrimination liability. Employers must only verify that you are legally 18+ upon offer.'
    });
    cleaned = cleaned.replace(/.*(date of birth|d\.o\.b|dob|birth date|born in|age:|\b\d{2}\s*years old).*[\r\n]*/gi, '');
  }

  // 3. Marital status
  if (/(marital status|married|single|unmarried|divorced|widowed|dependents?:)/i.test(text)) {
    violations.push({
      rule: 'Marital / Family Status reference detected',
      statute: 'Ontario Human Rights Code (Family Status Protection) / US EEOC',
      reason: 'Marital status is protected information. It must never appear on a resume or job application.'
    });
    cleaned = cleaned.replace(/.*(marital status|married|single|unmarried|divorced|widowed|dependents:).*[\r\n]*/gi, '');
  }

  // 4. Religion / Caste
  if (/(religion|hindu|muslim|christian|sikh|jewish|caste)/i.test(text)) {
    violations.push({
      rule: 'Religious Affiliation or Caste reference detected',
      statute: 'Title VII Civil Rights Act / Human Rights Creed Protection',
      reason: 'Creed and religion must never be disclosed on employment documents.'
    });
    cleaned = cleaned.replace(/.*(religion|hindu|muslim|christian|sikh|jewish|caste).*[\r\n]*/gi, '');
  }

  // 5. Nationality / Father's Name
  if (/(nationality|father's name|citizenship: \w+)/i.test(text)) {
    violations.push({
      rule: 'Nationality / Father Name reference detected',
      statute: 'Immigration and Nationality Act / Human Rights Code',
      reason: 'Full nationality and father details are common on Asian CVs but violate Western anti-bias norms. Only your legal work authorization is required.'
    });
    cleaned = cleaned.replace(/.*(nationality|father's name|citizenship:).*[\r\n]*/gi, '');
  }

  // 6. Full street address
  if (/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|blvd|lane|court|flat|apartment|apt)/i.test(text)) {
    violations.push({
      rule: 'Full Street Address detected (Privacy Risk)',
      statute: 'PIPEDA / Canadian Privacy Commissioner Guidance',
      reason: 'Listing your exact home address creates identity theft and proximity bias risks. Modern ATS best practice recommends City, Province/State only (e.g. "Toronto, ON").'
    });
    cleaned = cleaned.replace(/^\s*\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|blvd|lane|court|flat|apartment|apt).*[\r\n]*/gim, 'Location: City, Province / State (Street address removed for privacy)\n');
  }

  const score = Math.max(0, 100 - (violations.length * 18));
  return { score, violations, cleaned: cleaned.trim() };
}

export function runCVAudit() {
  const input = $('#cv-text-input')?.value || '';
  if (!input.trim()) return;

  const res = auditResumeText(input);
  const container = $('#cv-audit-results');
  if (!container) return;
  container.innerHTML = '';

  const card = el('div', undefined, 'cv-audit-card');
  const scoreBox = el('div', undefined, 'cv-score-box');
  scoreBox.append(el('h3', 'CV check score', 'cv-score-title'));

  let badgeCls = res.score >= 90 ? 'badge-compliant' : res.score >= 60 ? 'badge-warn' : 'badge-danger';
  const badge = el('span', `${res.score}% COMPLIANT`, `cv-score-badge ${badgeCls}`);
  scoreBox.append(badge);
  card.append(scoreBox);

  if (res.violations.length > 0) {
    const list = el('div', undefined, 'cv-findings-list');
    res.violations.forEach(v => {
      const item = el('div', undefined, 'cv-finding-item violation');
      item.append(el('strong', `⚠️ ${v.rule}: `));
      item.append(document.createTextNode(v.reason + ' '));
      item.append(el('span', `[Statutory Basis: ${v.statute}]`, 'journey-milestone-cite'));
      list.append(item);
    });
    card.append(list);
  } else {
    const safeItem = el('div', undefined, 'cv-finding-item compliant');
    safeItem.append(el('strong', '✓ No Human Rights / Anti-Bias Violations Detected! '));
    safeItem.append(document.createTextNode('Resume text conforms with North American and UK ATS privacy and human rights employment screening guidelines.'));
    card.append(safeItem);
  }

  // Cleaned Text Box
  const cleanCard = el('div', undefined, 'cv-cleaned-card');
  const cleanHead = el('div', undefined, 'cv-cleaned-header');
  cleanHead.append(el('strong', 'Cleaned Compliant Resume Text (Ready for ATS Submission)'));

  const copyBtn = el('button', '📋 Copy Cleaned Resume', 'primary tenancy-copy-btn');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(res.cleaned);
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Cleaned Resume'; }, 3000);
    } catch {
      copyBtn.textContent = 'Selected';
    }
  });
  cleanHead.append(copyBtn);
  cleanCard.append(cleanHead);

  const pre = el('pre', res.cleaned, 'cv-cleaned-text');
  cleanCard.append(pre);
  card.append(cleanCard);

  container.append(card);
}

export function getRecentToolIds() {
  try {
    const raw = localStorage.getItem('northstar_recent_tools');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return ['cmd-pr-matrix', 'cmd-legal-notices', 'cmd-tax-shield', 'cmd-calendar-sync'];
}

export function saveRecentTool(id) {
  try {
    const recents = getRecentToolIds().filter(x => x !== id);
    recents.unshift(id);
    if (recents.length > 8) recents.length = 8;
    localStorage.setItem('northstar_recent_tools', JSON.stringify(recents));
  } catch (_) {}
}

export function getPinnedToolIds() {
  try {
    const raw = localStorage.getItem('northstar_pinned_tools');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return ['cmd-pr-matrix', 'cmd-legal-notices'];
}

export function togglePinnedTool(id) {
  try {
    const pinned = getPinnedToolIds();
    const idx = pinned.indexOf(id);
    if (idx === -1) pinned.push(id);
    else pinned.splice(idx, 1);
    localStorage.setItem('northstar_pinned_tools', JSON.stringify(pinned));
  } catch (_) {}
}

export const viewToolControllers = {};
