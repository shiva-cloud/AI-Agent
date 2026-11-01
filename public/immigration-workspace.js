// Local planning checks only. No eligibility decisions, uploads or persistence.
const DAY = 86400000;
export const OFFICIAL_LINKS = {
  checklist: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/common-supporting-documents.html',
  changes: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/update-your-application.html'
};
function date(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label}: enter a date.`);
  const number = Date.parse(value);
  if (!Number.isFinite(number) || new Date(number).toISOString().slice(0, 10) !== value) throw new Error(`${label}: enter a valid calendar date.`);
  return number;
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 200) throw new Error(`${label}: enter 1–200 characters.`);
  return value.trim();
}
function rows(value) {
  if (!Array.isArray(value) || !value.length || value.length > 100 || value.some(row => !row || typeof row !== 'object')) throw new Error('Add between 1 and 100 entries.');
  return value;
}
const iso = value => new Date(value).toISOString().slice(0, 10);

export function auditChecklist({ submissionDate, documents }) {
  const target = date(submissionDate, 'Planned submission');
  const items = rows(documents).map(doc => {
    const name = text(doc.name, 'Document');
    if (!['missing', 'ready', 'translation', 'review'].includes(doc.status)) throw new Error('Choose a document status.');
    const issues = [];
    if (doc.status !== 'ready') issues.push({ missing: 'Not collected', translation: 'Translation needs completion', review: 'Needs review' }[doc.status]);
    if (doc.expiry && date(doc.expiry, `${name} expiry`) < target) issues.push('Expires before planned submission');
    return { name, issues, ready: issues.length === 0 };
  });
  return { title: 'Checklist review', summary: `${items.filter(i => i.ready).length} of ${items.length} entered documents have no flagged issue. This does not confirm application completeness.`, items: items.map(i => `${i.name}: ${i.issues.join('; ') || 'No issue flagged in the entered fields'}`), source: OFFICIAL_LINKS.checklist };
}

export function auditHistory({ startDate, endDate, periods }) {
  const start = date(startDate, 'History start'), end = date(endDate, 'History end');
  if (end < start) throw new Error('History end must not be before its start.');
  const sorted = rows(periods).map(p => {
    const label = text(p.label, 'Activity'), from = date(p.start, 'Activity start'), to = date(p.end, 'Activity end');
    if (to < from) throw new Error(`${label}: end must not be before start.`);
    if (from < start || to > end) throw new Error(`${label}: dates must fall inside the selected history window.`);
    return { label, from, to };
  }).sort((a, b) => a.from - b.from || a.to - b.to);
  const findings = [];
  let coveredTo = start - DAY;
  for (const p of sorted) {
    if (p.from > coveredTo + DAY) findings.push(`Uncovered dates: ${iso(coveredTo + DAY)} to ${iso(p.from - DAY)}`);
    if (p.from <= coveredTo) findings.push(`Overlapping activity: ${p.label}, ${iso(p.from)} to ${iso(Math.min(p.to, coveredTo))}. Concurrent work/study may be valid; review the dates.`);
    coveredTo = Math.max(coveredTo, p.to);
  }
  if (coveredTo < end) findings.push(`Uncovered dates: ${iso(coveredTo + DAY)} to ${iso(end)}`);
  return { title: 'History consistency review', summary: 'Dates are inclusive. This checks only the window and activities you entered; it does not decide what a particular immigration form requires.', items: findings.length ? findings : ['No gaps or overlaps found in this history window.'], source: OFFICIAL_LINKS.checklist };
}

export function planFamilyDeadlines({ asOf, tasks }) {
  const today = date(asOf, 'Planning date');
  const planned = rows(tasks).map(t => {
    const person = text(t.person, 'Person'), task = text(t.task, 'Task'), deadline = date(t.deadline, 'Deadline');
    const days = Number(t.preparationDays);
    if ((typeof t.preparationDays !== 'number' && typeof t.preparationDays !== 'string') || String(t.preparationDays).trim() === '' || !Number.isInteger(days) || days < 0 || days > 3650) throw new Error('Preparation time must be a whole number from 0 to 3650 days.');
    const startBy = deadline - days * DAY;
    if (new Date(startBy).getUTCFullYear() < 1) throw new Error('Preparation start falls outside the supported date range.');
    return { person, task, deadline, startBy };
  }).sort((a, b) => a.startBy - b.startBy);
  const items = planned.map(t => `${t.person} — ${t.task}: start by ${iso(t.startBy)}; deadline ${iso(t.deadline)}${t.deadline < today ? ' — deadline passed' : t.startBy < today ? ' — preparation should already have started' : ''}.`);
  const byDate = new Map();
  for (const t of planned) byDate.set(t.deadline, (byDate.get(t.deadline) || 0) + 1);
  for (const [day, count] of byDate) if (count > 1) items.push(`Deadline collision: ${count} tasks due ${iso(day)}. Check appointment and document capacity.`);
  return { title: 'Family deadline plan', summary: 'Uses your entered deadlines and preparation estimates. These are calendar days, not official processing times. No reminders have been scheduled.', items, source: OFFICIAL_LINKS.checklist };
}

const CHANGE_ACTIONS = {
  address: 'Check the official address/contact update instructions for your application.',
  passport: 'Review passport details in your application and the official instructions for supplying the replacement document.',
  family: 'Review how to report the family change and which supporting records your program requests.',
  employment: 'Review the affected employment history, offer and supporting documents before updating your application.',
  travel: 'Review travel-history entries and any affected dates or supporting documents.',
  status: 'Review your current status documents and seek qualified advice if this changes an application or work/study condition.'
};
export function reviewChanges({ changes }) {
  const items = [];
  for (const c of rows(changes)) {
    if (!Object.hasOwn(CHANGE_ACTIONS, c.field)) throw new Error('Choose a supported change category.');
    const previous = text(c.previous, 'Previous detail'), current = text(c.current, 'Current detail');
    if (previous !== current) items.push(`${c.field}: ${previous} → ${current}. ${CHANGE_ACTIONS[c.field]}`);
  }
  return { title: 'Application change review', summary: 'A preparation checklist, not a submission or determination that a change is legally reportable. Nothing has been sent to IRCC.', items: items.length ? items : ['No differences found in the details you entered.'], source: OFFICIAL_LINKS.changes };
}
