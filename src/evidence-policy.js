import {ValidationError} from './api-errors.js';
export const highRiskTopics=new Set(['health','housing','employment','money','driving','family','childcare','telecom']);
export function assertCalendarDate(value,name) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new ValidationError(`${name} must be a valid ISO calendar date`);
}
export function assertEvidencePolicy(record) {
 if(!record||typeof record!=='object')throw new ValidationError('Evidence record must be an object');
 if(highRiskTopics.has(record.topic)&&record.risk!=='high')throw new ValidationError('This topic requires high-risk review');
 for(const key of ['checkedAt','expiresAt'])assertCalendarDate(record[key],key);
 if(record.expiresAt<=record.checkedAt)throw new ValidationError('Evidence expiry must be after its checked date');
 for(const key of ['effectiveFrom','effectiveTo'])if(record[key]!=null)assertCalendarDate(record[key],key);
 if(record.effectiveFrom&&record.effectiveTo&&record.effectiveFrom>=record.effectiveTo)throw new ValidationError('Effective date range is invalid');
}

// Boot-time honesty audit over registered sources and stored evidence.
// This never blocks anything: writes already enforce the hard assertions above.
// The lint surfaces drift (unreviewed source policies, expired or soon-expiring
// evidence, pending high-risk topics) as structured warnings so a human decides
// what needs attention before readers do.
export function lintEvidence(sources=[],records=[],now=new Date()) {
  const safeSources=Array.isArray(sources)?sources:[];
  const safeRecords=Array.isArray(records)?records:[];
  const safeNow=(now instanceof Date && !Number.isNaN(now.getTime()))?now:new Date();
  const today=safeNow.toISOString().slice(0,10);
  const soonMs=86400000*7;
  const warnings=[];
  const add=(scope,id,code,detail)=>warnings.push({scope,id,code,detail});
  for(const source of safeSources) {
    if(!source||typeof source!=='object')continue;
    if(source.policy==='unreviewed')add('source',source.id,'policy_unreviewed','Source access policy has not been reviewed; evidence imports stay blocked until it is.');
    if(source.suspended)add('source',source.id,'source_suspended','Source is suspended; its guidance was withdrawn and re-approval needs review.');
  }
  for(const record of safeRecords) {
    if(!record||typeof record!=='object')continue;
    if(record.expiresAt<today)add('record',record.id,'evidence_expired',`Evidence expired ${record.expiresAt}; a fresh source check is required before it can represent guidance.`);
    else if(Date.parse(record.expiresAt)-Date.parse(today)<=soonMs)add('record',record.id,'evidence_expiring_soon',`Evidence expires ${record.expiresAt}; plan a source recheck within 7 days.`);
    if(record.status==='pending')add('record',record.id,'evidence_awaiting_review','Evidence is awaiting independent human review and stays out of published guidance.');
  }
  return {checkedAt:today,warnings,count:warnings.length};
}
