import {ValidationError} from './api-errors.js';
import {housingSubjects} from './housing.js';
import {assertEvidencePolicy} from './evidence-policy.js';
import {telecomSubjects} from './telecom.js';
// A script guard is not a language classifier. Latin-script prose still needs
// editorial review to establish that it is English (rather than transliteration).
export function assertEnglishText(value, field='Text') {
  if (typeof value !== 'string') throw new ValidationError(`${field} must be English text`);
  for (const char of value.normalize('NFKC')) {
    if (/\p{L}/u.test(char) && !/\p{Script=Latin}/u.test(char)) {
      throw new ValidationError(`${field} must be in English; other writing systems are not supported in this release`);
    }
  }
  if (/[\u200b-\u200f\u202a-\u202e\u2060-\u206f]/u.test(value)) {
    throw new ValidationError(`${field} contains unsupported invisible formatting characters`);
  }
  return value;
}

export function assertEnglishData(value) {
  if (typeof value === 'string') assertEnglishText(value);
  else if (Array.isArray(value)) value.forEach(assertEnglishData);
  else if (value && typeof value === 'object') {
    for (const [key,item] of Object.entries(value)) {
      assertEnglishText(key,'Field name');
      assertEnglishData(item);
    }
  }
}

const recordFields=new Set(['id','topic','jurisdiction','title','url','summary','quote','risk','language','checkedAt','expiresAt','effectiveFrom','effectiveTo','status','reviewBasis','crawlPolicy','reviewedAt','reviewMethod','claimKey','sourceId','snapshotId','housingSubject','telecomSubject','steps']);
export function assertEnglishRecord(record) {
  if (!record || typeof record!=='object' || Array.isArray(record)) throw new ValidationError('Evidence record must be an object');
  for (const key of Object.keys(record)) if (!recordFields.has(key)) throw new ValidationError(`Unsupported evidence field: ${key}`);
  if (record.language!=='en') throw new ValidationError('Evidence language must be en');
  for (const key of ['id','topic','jurisdiction','title','url','summary','quote','checkedAt','expiresAt','risk','status']) {
    if (typeof record[key]!=='string' || !record[key].trim()) throw new ValidationError(`Evidence requires ${key}`);
  }
  assertEnglishData(record);
  if(record.telecomSubject!==undefined && (record.topic!=='telecom'||!telecomSubjects.includes(record.telecomSubject)))throw new ValidationError('Invalid telecom subject');
  if(record.housingSubject!==undefined && (record.topic!=='housing' || !housingSubjects.includes(record.housingSubject))) throw new ValidationError('Invalid housing subject');
  // Ordered-checklist support must be declared by the evidence itself, never
  // inferred. A steps-bearing record claims an ordered checklist for its topic;
  // the steps are validated as bounded English imperatives.
  if(record.steps!==undefined){
    if(!Array.isArray(record.steps)||record.steps.length<2||record.steps.length>12)throw new ValidationError('Checklist steps must be an ordered list of 2-12 items');
    if(!record.steps.every(step=>typeof step==='string'&&step.trim().length>=12&&step.trim().length<=320))throw new ValidationError('Each checklist step must be 12-320 characters of English text');
  }
  if (!['low','high'].includes(record.risk)) throw new ValidationError('Invalid evidence risk');
  if (!['pending','research_seed','approved','rejected'].includes(record.status)) throw new ValidationError('Invalid evidence status');
  if (record.risk==='high' && record.status==='research_seed') throw new ValidationError('High-risk evidence needs human review');
  assertEvidencePolicy(record);
  let url;try{url=new URL(record.url);}catch{throw new ValidationError('Evidence URL must be a valid HTTPS URL');}
  if (url.protocol!=='https:') throw new ValidationError('Evidence URLs must use HTTPS');
  if(url.username || url.password)throw new ValidationError('Evidence URLs must not contain credentials');
  return record;
}
