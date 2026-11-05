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
  'Editor (0.19.13 batch)',
  'Settlement Intelligence Editorial Team',
  'Settlement Intelligence Technical Editorial Team',
  'Settlement Intelligence KYC Editorial Team',
  'Settlement Intelligence Global Editorial Team',
  'Settlement Intelligence Forensic Audit Team',
  'editorial-board',
  'Rest-of-World KB upgrade 2026-11-03 (editorial review and statutory verification)'
]);
const AUTOMATED_SOURCE_REVIEWERS = new Set(['Automated source check (session)', 'automated-source-check']);

export function isEditorialReviewer(reviewer, allowedReviewers = null) {
  if (typeof reviewer !== 'string' || !reviewer.trim()) return false;
  const name = reviewer.trim();
  if (NON_EDITORIAL_REVIEWERS.some(pattern => pattern.test(name))) return false;
  if (AUTOMATED_SOURCE_REVIEWERS.has(name)) return false;
  if (allowedReviewers && allowedReviewers.has(name)) return true;
  if (AUTHORIZED_EDITORIAL_REVIEWERS.has(name)) return true;
  return false;
}
function isPublicationReviewer(reviewer, method, allowed) {
  return isEditorialReviewer(reviewer, allowed) ||
    (method === 'source_verified' && typeof reviewer === 'string' && AUTOMATED_SOURCE_REVIEWERS.has(reviewer.trim()));
}
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {highRiskTopics} from './evidence-policy.js';
import {authorizationDigest} from './audit-chain.js';
import {verifyAgainstPage} from './source-verifier.js';

function authorizedAudits(db) {
  const result = new Map();
  // Read-only tools may inspect a database from before this additive migration.
  if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='audit_authorizations'").get()) return result;
  for (const row of db.prepare(`SELECT a.*,e.actor_id,e.role,e.mode,e.payload_hash,e.at AS authorized_at
    FROM audit_authorizations e JOIN audits a ON a.id=e.audit_id`).all()) {
    result.set(row.id, row.mode === 'individual' && ['admin', 'reviewer'].includes(row.role) &&
      row.actor_id === row.reviewer && row.authorized_at === row.at && row.payload_hash === authorizationDigest(row));
  }
  return result;
}

// Re-check stored provenance when serving it: database restores/imports may
// bypass the normal ingestion guards. An existing foreign key is not evidence
// that the archived text and the published claim still agree.
function verifiedPublications(db, allowed, authorized) {
  const verified = new Map();
  const replayFailures = new Set();
  const rows = db.prepare(`SELECT p.id,p.record_id,p.snapshot_id,p.body,p.at,
    c.record_id AS candidate_record_id,c.snapshot_id AS candidate_snapshot_id,
    c.body AS candidate_body,c.status AS candidate_status,
    s.source_id,s.content,s.content_hash,src.url,src.policy,
    d.decision,d.reviewer,d.note,d.at AS decision_at,
    a.id AS audit_id,a.reviewer AS audit_reviewer,a.note AS audit_note,a.at AS audit_at
    FROM publications p JOIN candidates c ON c.id=p.candidate_id
    JOIN snapshots s ON s.id=p.snapshot_id JOIN sources src ON src.id=s.source_id
    JOIN candidate_decisions d ON d.id=(SELECT MAX(last.id) FROM candidate_decisions last WHERE last.candidate_id=c.id)
    JOIN audits a ON a.record_id=p.record_id AND a.next=p.body`).all();
  const hashes = new Map();
  for (const row of rows) {
    try {
      if (row.candidate_record_id !== row.record_id || row.candidate_snapshot_id !== row.snapshot_id ||
          row.candidate_status !== 'approved' || row.decision !== 'approve' ||
          row.policy !== 'manual_permitted' || !row.note?.trim() ||
          row.reviewer !== row.audit_reviewer || row.note !== row.audit_note ||
          row.at !== row.decision_at || row.at !== row.audit_at) continue;
      if (!hashes.has(row.snapshot_id)) hashes.set(row.snapshot_id, createHash('sha256').update(row.content).digest('hex'));
      if (hashes.get(row.snapshot_id) !== row.content_hash) continue;
      const published = JSON.parse(row.body), candidate = JSON.parse(row.candidate_body);
      if (!(authorized.has(row.audit_id) ? authorized.get(row.audit_id) : isPublicationReviewer(row.reviewer, published.reviewMethod, allowed))) continue;
      const expected = { ...candidate, status: 'approved', reviewedAt: row.at,
        reviewMethod: published.reviewMethod, sourceId: row.source_id, snapshotId: row.snapshot_id };
      if (published.id !== row.record_id || published.url !== row.url ||
          !PUBLISHED_REVIEW.has(published.reviewMethod) || !isDeepStrictEqual(published, expected) ||
          typeof published.quote !== 'string' || !published.quote.trim() || !row.content.includes(published.quote)) continue;
      if (published.reviewMethod === 'source_verified' && !verifyAgainstPage(published, row.content).ok) {
        replayFailures.add(row.record_id);
        continue;
      }
      verified.set(row.id, published);
    } catch { /* corrupted evidence cannot establish a valid publication */ }
  }
  const records = [...verified.values()];
  // Restoring a historical version legitimately changes reviewedAt. Only allow
  // that difference when the restoration event and its target are consistent.
  for (const row of db.prepare(`SELECT r.*,a.id AS audit_id FROM restorations r JOIN audits a
    ON a.record_id=r.record_id AND a.next=r.next AND a.reviewer=r.reviewer AND a.at=r.at`).all()) {
    try {
      const published = verified.get(row.target_publication_id), next = JSON.parse(row.next);
      if (published && published.id === row.record_id && row.note?.trim() &&
          (authorized.has(row.audit_id) ? authorized.get(row.audit_id) : isEditorialReviewer(row.reviewer, allowed)) &&
          isDeepStrictEqual(next, { ...published, reviewedAt: row.at })) records.push(next);
    } catch { /* ignore corrupt restoration data */ }
  }
  const byRecord = new Map();
  for (const record of records) {
    if (!byRecord.has(record.id)) byRecord.set(record.id, []);
    byRecord.get(record.id).push(record);
  }
  return { byRecord, replayFailures };
}

export function assessPublicEvidence(db, records, options = {}) {
  const allowed = options.allowedReviewers instanceof Set ? options.allowedReviewers : null;
  const authorized = authorizedAudits(db);
  const audited=new Map();
  const auditFailures=new Map();
  for(const row of db.prepare('SELECT id,record_id,next,reviewer,note FROM audits ORDER BY id').all()) {
    // A later withdrawal or malformed/unsupported review supersedes old approval.
    audited.delete(row.record_id);
    auditFailures.set(row.record_id, 'audit_metadata_missing');
    if(!row.reviewer?.trim() || !row.note?.trim())continue;
    try {
      const next=JSON.parse(row.next);
      if(!(authorized.has(row.id) ? authorized.get(row.id) : isPublicationReviewer(row.reviewer.trim(), next.reviewMethod, allowed))) {
        auditFailures.set(row.record_id, authorized.has(row.id) ? 'authorization_invalid' : 'reviewer_untrusted');
        continue;
      }
      auditFailures.set(row.record_id, 'latest_audit_not_approved');
      if(next.status==='approved') {
        auditFailures.set(row.record_id, 'audit_record_mismatch');
        if(!audited.has(row.record_id))audited.set(row.record_id,[]);
        audited.get(row.record_id).push(next);
      }
    }catch { auditFailures.set(row.record_id, 'audit_payload_invalid'); }
  }
  const reviewed = verifiedPublications(db, allowed, authorized);
  const suspended = db.prepare('SELECT s.id,s.url FROM sources s JOIN suspended_sources b ON b.source_id=s.id').all();
  const suspendedIds = new Set(suspended.map(source => source.id));
  const suspendedUrls = new Set(suspended.map(source => source.url));
  return records.map(record => {
    const reasons=[];
    if (['approved','research_seed'].includes(record.status) && (suspendedIds.has(record.sourceId) || suspendedUrls.has(record.url))) reasons.push('source_suspended');
    if (record.status === 'approved' && highRiskTopics.has(record.topic) && record.risk !== 'high') reasons.push('protected_topic_risk_mismatch');
    if ((record.risk === 'high' || record.reviewMethod === 'source_verified') && record.status === 'approved') {
      if (!PUBLISHED_REVIEW.has(record.reviewMethod)) reasons.push('review_method_missing_or_unsupported');
      if (!(audited.get(record.id)||[]).some(next=>isDeepStrictEqual(next,record))) reasons.push(auditFailures.get(record.id)||'approval_audit_missing');
      if (record.reviewMethod === 'source_verified' && !(reviewed.byRecord.get(record.id)||[]).some(next=>isDeepStrictEqual(next,record))) {
        reasons.push(reviewed.replayFailures.has(record.id) ? 'archived_evidence_replay_failed' : 'source_chain_invalid');
      }
    }
    return { record, served: reasons.length ? { ...record, status: 'pending' } : record, reasons };
  });
}

export function publicEvidence(db, records, options = {}) {
  return assessPublicEvidence(db, records, options).map(result=>result.served);
}
