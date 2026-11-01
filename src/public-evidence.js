// A label set by a seed/bulk script is not publication provenance. Keep the
// original records available to reviewers; withhold unsupported public claims.
// A publication counts when an editor approved it, or when the automated source
// check confirmed the archived official page (labelled as such to users).
// The 'editorial_review' stamp is only obtainable through the audited store.review
// path (the database refuses approved writes without it and records the reviewer,
// note and timestamp in the append-only audits table), so it publishes on its own.
// 'source_verified' additionally requires the publication chain because the archived
// snapshot is the evidence behind the automated check.
export const PUBLISHED_REVIEW = new Set(['editorial_review', 'source_verified']);
export function publicEvidence(db, records) {
  const reviewed = new Set(db.prepare(`SELECT p.record_id, p.snapshot_id FROM publications p
    JOIN snapshots s ON s.id=p.snapshot_id
    JOIN candidate_decisions d ON d.candidate_id=p.candidate_id AND d.decision='approve'`).all()
    .map(row => `${row.record_id}:${row.snapshot_id}`));
  return records.map(record => record.risk === 'high' && record.status === 'approved' &&
    (!PUBLISHED_REVIEW.has(record.reviewMethod) ||
      (record.reviewMethod === 'source_verified' && !reviewed.has(`${record.id}:${record.snapshotId}`)))
      ? { ...record, status: 'pending' } : record);
}
