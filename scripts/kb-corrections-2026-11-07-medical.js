// Narrow three withheld records to live official evidence. No editorial label
// is assigned: successful publications use the automated source-check workflow.
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {openStore} from '../src/store.js';
import {fetchPageText, verifyAgainstPage} from '../src/source-verifier.js';
import {publicEvidence} from '../src/public-evidence.js';

const publicUrl='https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/inadmissibility/medical.html';
const policyUrl='https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/refusals-inadmissibility/excessive-demand-on-health-social-services.html';
let corrections=[
  {id:'ca-ircc-pdi-excessive-demand-formula',url:publicUrl,
    title:'IRCC: Medical inadmissibility, 2026 cost threshold and procedural fairness response',
    quote:"If we believe you may be medically inadmissible, we'll send you a letter",
    summary:"IRCC's public medical inadmissibility page lists the 2026 excessive-demand cost threshold as $144,390 over 5 years, or $28,878 per year. Additional information responding to a procedural fairness letter must be sent within 90 days of the letter, or an extension requested. This record reports the published figures; it does not decide medical admissibility."},
  {id:'global-medical-inadmissibility-excessive-demand',url:policyUrl,
    title:'IRCC: Excessive demand provisions and medical assessment',
    quote:'a demand on health services or social services',
    summary:'IRCC describes excessive demand as anticipated health or social service costs exceeding triple the Canadian per-capita average over a period of 5 consecutive years following the required medical examination, or demand that adds to waiting lists and increases morbidity and mortality because timely services cannot be provided. An excessive-demand medical assessment is part of application processing, not an automatic final refusal.'},
  {id:'ircc-medical-excessive-demand',url:policyUrl,
    title:'IRCC: Medical assessment date and excessive-demand thresholds',
    quote:'The excessive demand threshold applied is determined by the date',
    summary:'The excessive-demand threshold depends on when the medical officer performs the assessment. IRCC describes both anticipated costs and effects on waiting lists. The operational page contains date-specific historical thresholds; use the threshold applicable to the assessment date. This record does not diagnose conditions, guarantee clearance or provide a current-year dollar amount.'}
];

// Later batches can reuse the same verified, audited workflow.
const planIndex=process.argv.indexOf('--plan');
const plan=planIndex<0?null:JSON.parse(readFileSync(process.argv[planIndex+1],'utf8'));
const reportId=plan?.id || 'medical-source-corrections-2026-11-07';
if(!/^[a-z0-9-]{1,80}$/.test(reportId))throw new Error('Invalid correction plan id');
if(plan){
  if(!Array.isArray(plan.corrections)||!plan.corrections.length)throw new Error('Correction plan must contain records');
  const fields=new Set(['id','url','title','quote','summary','sourceOwner']);
  for(const correction of plan.corrections)if(!correction||Object.keys(correction).some(key=>!fields.has(key)))throw new Error('Unsupported correction field');
  corrections=plan.corrections;
}

const apply=process.argv.includes('--apply');
const dbPath=resolve('data/settlement.sqlite');
const db=new DatabaseSync(dbPath,{readOnly:!apply});
const today=new Date().toISOString().slice(0,10);
const report={date:today,applied:false,results:[],backup:null};
let store;
try {
  const pages=new Map();
  for(const url of new Set(corrections.map(c=>c.url))) pages.set(url,await fetchPageText(url));
  const prepared=corrections.map(c=>{
    const {sourceOwner,...patch}=c;
    const old=JSON.parse(db.prepare('SELECT body FROM records WHERE id=?').get(c.id).body);
    const draft={...old,...patch,status:'pending',checkedAt:today,expiresAt:'2027-01-31',
      reviewBasis:'Corrected against a live official page on '+today+'. Broken URL and unsupported or stale claims replaced. Automated source verification, not independent editorial review.'};
    for(const key of ['reviewedAt','reviewMethod','sourceId','snapshotId'])delete draft[key];
    const page=pages.get(c.url);
    const check=page.text?verifyAgainstPage(draft,page.text):{ok:false,reason:page.error,detail:page.detail};
    report.results.push({id:c.id,url:c.url,ok:check.ok,reason:check.reason??null,detail:check.detail??null,published:false});
    return {draft,check,sourceOwner};
  });
  if(prepared.some(p=>!p.check.ok))process.exitCode=1;
  else if(apply){
    mkdirSync('data/backups',{recursive:true});
    report.backup=resolve(`data/backups/settlement-before-${reportId}-${Date.now()}.sqlite`);
    db.exec(`VACUUM INTO '${report.backup.replaceAll("'","''")}'`);
    store=openStore(dbPath);
    // Each ingestion operation uses its own audited transaction.
      for(const [index,{draft,check,sourceOwner}] of prepared.entries()){
        let source=store.ingestion.sources().find(s=>s.url===draft.url);
        if(!source&&plan&&!sourceOwner&&!plan.sourceOwner)throw new Error('A new source requires an explicit sourceOwner');
        if(!source)source=store.ingestion.registerSource({id:'medical-source-'+createHash('sha256').update(draft.url).digest('hex').slice(0,16),url:draft.url,
          owner:sourceOwner || plan?.sourceOwner || 'Immigration, Refugees and Citizenship Canada',language:'en',tier:'A',reviewer:'automated-source-check',
          note:'Official public authority page accessed for this specific evidence correction. Manual excerpt only; no authentication, paywall or access control bypass.'});
        const requestKey='medical-fix-'+createHash('sha256').update(JSON.stringify(draft)+check.excerpt).digest('hex').slice(0,32);
        const candidate=store.ingestion.ingest({sourceId:source.id,requestKey,content:check.excerpt,record:{...draft,quote:check.quote}});
        if(candidate.status==='pending')store.ingestion.decide(candidate.id,{decision:'approve',reviewer:'automated-source-check',reviewMethod:'source_verified',
          note:'Live official page fetched; exact quote and summary figures verified in the archived excerpt. Summary narrowed to the cited page. Automated source check, not independent editorial review.'});
        const served=publicEvidence(store.db,store.records()).find(r=>r.id===draft.id);
        if(served?.status!=='approved'||served.reviewMethod!=='source_verified')throw new Error('Public-evidence replay failed for '+draft.id);
        report.results[index].published=true;
        report.results[index].candidateId=candidate.id;
      }
    report.applied=true;
  }
}finally{
  store?.db.close();db.close();
  mkdirSync('artifacts',{recursive:true});writeFileSync(`artifacts/${reportId}.json`,JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report,null,2));
