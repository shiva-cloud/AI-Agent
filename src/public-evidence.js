// A label set by a seed/bulk script is not publication provenance. Keep the
// original records available to reviewers; withhold unsupported public claims.
// A publication counts when an editor approved it, or when the automated source
// check confirmed the archived official page (labelled as such to users).
// An editorial label must match an actual approved audit entry. Automated
// source verification additionally requires its archived publication chain.
export const PUBLISHED_REVIEW = new Set(['editorial_review', 'source_verified']);
import {isDeepStrictEqual} from 'node:util';
export function publicEvidence(db, records) {
  const audited=new Map();
  for(const row of db.prepare('SELECT record_id,next,reviewer,note FROM audits').all()) {
    if(!row.reviewer?.trim() || !row.note?.trim())continue;
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
