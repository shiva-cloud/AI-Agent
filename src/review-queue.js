// Read-only editorial triage; flags never grant permission or publish evidence.
// Thresholds are caller-configurable so review tolerances are data, not code:
// override {expiresSoonDays} to change the "expiring soon" band. Defaults stay
// stable for every existing caller.
export function reviewQueue(records,sources,candidates,now=new Date(),thresholds={}) {
  const expiresSoonDays=thresholds.expiresSoonDays ?? 7;
  const asOf=now.toISOString().slice(0,10),day=Date.parse(asOf);
  const rows=records.map(record=>{
    const source=record.sourceId?sources.find(s=>s.id===record.sourceId):sources.find(s=>s.url===record.url);
    const daysUntilExpiry=Math.floor((Date.parse(record.expiresAt)-day)/86400000);
    const flags=[];
    if(source?.suspended)flags.push('source_suspended');
    if(daysUntilExpiry<0)flags.push('expired');
    else if(daysUntilExpiry<=expiresSoonDays)flags.push('expires_soon');
    if(record.effectiveFrom && record.effectiveFrom>asOf)flags.push('not_yet_effective');
    if(record.effectiveTo && record.effectiveTo<=asOf)flags.push('no_longer_effective');
    if(record.status==='pending')flags.push('pending_review');
    // Approved by a bulk script or seed file, never by a named editor.
    const unreviewedApproval=record.status==='approved' && record.reviewMethod!=='editorial_review';
    if(unreviewedApproval)flags.push('editor_review_needed');
    if(record.status==='rejected')flags.push('rejected');
    if(!source || source.policy!=='manual_permitted')flags.push('permission_review_needed');
    if(!record.snapshotId)flags.push('snapshot_missing');
    const candidateIds=candidates.filter(c=>c.record_id===record.id && c.status==='pending').map(c=>c.id).sort();
    if(candidateIds.length)flags.push('candidate_pending');
    const priority=flags.includes('source_suspended')?0:flags.includes('expired')||flags.includes('no_longer_effective')?1:flags.includes('expires_soon')?2:record.risk==='high'&&(record.status==='pending'||unreviewedApproval)?3:4;
    // The single strongest reason this row is queued at its priority band.
    const reasonCode=flags.includes('source_suspended')?'source_suspended'
      :flags.includes('expired')||flags.includes('no_longer_effective')?'evidence_expired'
      :flags.includes('expires_soon')?'expiring_soon'
      :priority===3?(unreviewedApproval?'high_risk_editor_review_needed':'high_risk_pending_review')
      :unreviewedApproval?'editor_review_needed':'routine';
    const actions=[];
    if(flags.includes('source_suspended'))actions.push('Resolve the source suspension before considering publication.');
    if(flags.includes('permission_review_needed'))actions.push('Review and document source-access permission before importing an excerpt.');
    if(flags.includes('expired')||flags.includes('expires_soon'))actions.push('Recheck the official source and submit fresh evidence; approval alone does not renew expiry.');
    if(flags.includes('snapshot_missing'))actions.push('After permission review, import an exact English excerpt to establish archived provenance.');
    if(candidateIds.length)actions.push('Inspect the pending candidate comparison and evidence before deciding.');
    if(record.status==='pending')actions.push('Complete independent evidence and English-quality review.');
    if(unreviewedApproval)actions.push('Approved by a bulk script, not an editor. Open the official source, import an exact excerpt, check the summary against it, then approve the candidate or roll the record back to pending.');
    if(flags.includes('not_yet_effective')||flags.includes('no_longer_effective'))actions.push('Check effective dates before relying on this record.');
    if(record.status==='rejected')actions.push('Keep rejected evidence withheld; submit a corrected candidate if appropriate.');
    return {id:record.id,title:record.title,topic:record.topic,jurisdiction:record.jurisdiction,risk:record.risk,status:record.status,expiresAt:record.expiresAt,daysUntilExpiry,sourceId:source?.id??null,candidateIds,flags,priority,reasonCode,actions};
  }).sort((a,b)=>a.priority-b.priority || a.daysUntilExpiry-b.daysUntilExpiry || a.id.localeCompare(b.id));
  const counts={total:rows.length};
  for(const row of rows)for(const flag of row.flags)counts[flag]=(counts[flag]||0)+1;
  return {asOf,counts,rows,thresholds:{expiresSoonDays},newCandidates:candidates.filter(c=>c.status==='pending'&&!records.some(r=>r.id===c.record_id)).map(c=>({id:c.id,recordId:c.record_id})),notice:'Editorial triage only. Flags overlap; source permission, archived provenance and factual approval are separate checks.'};
}
