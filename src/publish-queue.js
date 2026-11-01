// Publish queue: approved high-risk records that public answers withhold
// because no editor has reviewed them against an archived excerpt (see
// public-evidence.js). Read-only; it ranks the work and prepares a draft, but
// only an editor's import plus a reviewer's candidate approval publishes.
import { publicEvidence } from './public-evidence.js';
import { recordHousingSubject } from './housing.js';

// Topics people ask about first after landing come first.
export const PUBLISH_TOPIC_ORDER = ['health', 'housing', 'employment', 'money', 'family', 'childcare', 'sin', 'arrival', 'telecom', 'community', 'transit', 'groceries', 'driving'];
const CANADA = new Set(['CA', 'ON', 'BC', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver']);
const PROVENANCE = ['sourceId', 'snapshotId', 'reviewedAt', 'reviewMethod'];

const topicRank = topic => { const i = PUBLISH_TOPIC_ORDER.indexOf(topic); return i === -1 ? PUBLISH_TOPIC_ORDER.length : i; };

/** The record as an editor would import it: pending, checked today, no server-assigned provenance. */
export function publishDraft(record, today) {
  const draft = { ...record, status: 'pending', checkedAt: today };
  for (const key of PROVENANCE) delete draft[key];
  return draft;
}

export function publishQueue(db, records, sources, candidates, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const served = publicEvidence(db, records);
  const rows = [];
  records.forEach((record, i) => {
    if (record.status !== 'approved' || served[i].status !== 'pending') return;
    const source = record.sourceId ? sources.find(s => s.id === record.sourceId) : sources.find(s => s.url === record.url);
    const blockers = [];
    if (!source) blockers.push('No registered source for this URL. Register the source first.');
    else {
      if (source.suspended) blockers.push('The source is suspended.');
      if (source.policy !== 'manual_permitted') blockers.push('The source access policy has not been reviewed.');
      if (!['A', 'B'].includes(source.tier)) blockers.push('High-risk evidence needs a tier A or B source.');
    }
    if (record.topic === 'housing' && !recordHousingSubject(record)) blockers.push('Housing evidence needs a housingSubject.');
    if (record.topic === 'telecom' && !record.telecomSubject) blockers.push('Telecom evidence needs a telecomSubject.');
    if (!(record.expiresAt > today)) blockers.push('The expiry date has passed. Set a new expiresAt in the draft after checking the source.');
    const pendingCandidates = candidates.filter(c => c.record_id === record.id && c.status === 'pending').map(c => c.id).sort();
    rows.push({
      id: record.id, title: record.title, topic: record.topic, jurisdiction: record.jurisdiction,
      canada: CANADA.has(record.jurisdiction), url: record.url, quote: record.quote, summary: record.summary,
      expiresAt: record.expiresAt, sourceId: source?.id ?? null, sourceTier: source?.tier ?? null,
      blockers, pendingCandidates,
      state: pendingCandidates.length ? 'awaiting_approval' : blockers.length ? 'blocked' : 'ready',
      draft: publishDraft(record, today)
    });
  });
  rows.sort((a, b) => topicRank(a.topic) - topicRank(b.topic) || Number(b.canada) - Number(a.canada) || a.jurisdiction.localeCompare(b.jurisdiction) || a.id.localeCompare(b.id));
  const topics = {};
  for (const row of rows) {
    const t = topics[row.topic] ??= { withheld: 0, ready: 0, awaiting_approval: 0, blocked: 0 };
    t.withheld++; t[row.state]++;
  }
  return {
    asOf: today, total: rows.length, topicOrder: PUBLISH_TOPIC_ORDER, topics, rows,
    steps: [
      'Open the official page and confirm the summary is still correct.',
      'Copy the part of the page that contains the quote and paste it as the excerpt.',
      'Submit it as a candidate. A reviewer then approves the candidate, which publishes the record.'
    ]
  };
}
