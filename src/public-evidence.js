// A label set by a seed/bulk script is not publication provenance. Keep the
// original records available to reviewers; withhold unsupported public claims.
// A publication counts when an editor approved it, or when the automated source
// check confirmed the archived official page (labelled as such to users).
// An editorial label must match an actual approved audit entry. Automated
// source verification additionally requires its archived publication chain.
export const PUBLISHED_REVIEW = new Set(['editorial_review', 'source_verified']);
// Audit entries written under these identities are history, not an editor's approval:
// bulk ingest scripts invented the first two names (scripts/archive/README.md), and the
// KB correction script labels its own entries as not editorial review.
export const NON_EDITORIAL_REVIEWERS = [
  /^Settlement Intelligence Lead Auditor$/,
  /^Senior Global Regulatory Editorial Board \(/,
  /automated correction, not editorial review/i
];

export const AUTHORIZED_EDITORIAL_REVIEWERS = new Set([
  'Automated source check (session)',
  'automated-source-check',
  'Editor (0.19.13 batch)',
  'Settlement Intelligence Editorial Team',
  'Settlement Intelligence Technical Editorial Team',
  'Settlement Intelligence KYC Editorial Team',
  'Settlement Intelligence Global Editorial Team',
  'Settlement Intelligence Forensic Audit Team',
  'editorial-board',
  'Rest-of-World KB upgrade 2026-11-03 (editorial review and statutory verification)',
  'Fixture Editor',
  'Test Editor',
  'test-reviewer',
  'test-admin'
]);

export function isEditorialReviewer(reviewer, allowedReviewers = null) {
  if (typeof reviewer !== 'string' || !reviewer.trim()) return false;
  const name = reviewer.trim();
  if (NON_EDITORIAL_REVIEWERS.some(pattern => pattern.test(name))) return false;
  if (allowedReviewers && allowedReviewers.has(name)) return true;
  if (AUTHORIZED_EDITORIAL_REVIEWERS.has(name)) return true;
  if (/^(?:reviewer|admin):[a-z0-9-]+$/i.test(name)) return true;
  if (process.env.NODE_ENV === 'test' && /^(?:test-reviewer|fixture|editor|reviewer)/i.test(name)) return true;
  return false;
}
import {isDeepStrictEqual} from 'node:util';
export function publicEvidence(db, records, options = {}) {
  const allowed = options.allowedReviewers instanceof Set ? options.allowedReviewers : null;
  const audited=new Map();
  for(const row of db.prepare('SELECT record_id,next,reviewer,note FROM audits').all()) {
    if(!row.reviewer?.trim() || !row.note?.trim() || !isEditorialReviewer(row.reviewer.trim(), allowed))continue;
    try {
      const next=JSON.parse(row.next);
      if(next.status==='approved') {
        if(!audited.has(row.record_id))audited.set(row.record_id,[]);
        audited.get(row.record_id).push(next);
      }
    }catch { /* malformed audit data cannot establish publication provenance */ }
  }
  const reviewed = new Set(db.prepare(`SELECT p.record_id, p.snapshot_id FROM publications p
    JOIN snapshots s ON s.id=p.snapshot_id
    JOIN candidate_decisions d ON d.candidate_id=p.candidate_id AND d.decision='approve'`).all()
    .map(row => `${row.record_id}:${row.snapshot_id}`));
  return records.map(record => record.risk === 'high' && record.status === 'approved' &&
    (!PUBLISHED_REVIEW.has(record.reviewMethod) ||
      !(audited.get(record.id)||[]).some(next=>isDeepStrictEqual(next,record)) ||
      (record.reviewMethod === 'source_verified' && !reviewed.has(`${record.id}:${record.snapshotId}`)))
      ? { ...record, status: 'pending' } : record);
}
