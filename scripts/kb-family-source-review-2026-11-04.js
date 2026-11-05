// Targeted correction, not editorial approval. Back up before applying and keep
// both records pending until supporting excerpts and independent review exist.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { databasePath } from '../src/runtime-config.js';
import { configureEnglishDatabase } from '../src/migrations.js';
import { appendAudit } from '../src/audit-chain.js';
import { assertEnglishRecord } from '../src/language.js';

export const corrections = [
  { id: 'bc-childcare-fees', expected: '97% of eligible licensed centres participate in the program, which has saved families more than $3 billion',
    summary: 'The BC announcement describes the Child Care Fee Reduction Initiative, which lowers monthly fees at participating licensed centres. It reports 97% participation among eligible licensed centres and attributes savings exceeding $3 billion to this initiative together with the Affordable Child Care Benefit. From April 1, 2026, participating providers must offer at least 9.5 hours of daily care before charging extended-hour fees. This record explains the announced base-fee rule; it does not confirm an individual provider\'s participation or calculate a family\'s bill.',
    note: 'Correct savings attribution to the combined programs and remove claims requiring separate family-information sources. Archive the duration rule before publication.' },
  { id: 'ccb-eligibility', expected: 'and holding an eligible status',
    summary: 'CRA requires the applicant to live with a child under 18 years old, have primary responsibility for their care, and be a Canadian tax resident. The applicant or their spouse or common-law partner must have a qualifying status: citizenship, permanent residence, protected-person status, qualifying temporary residence, or registration or entitlement to registration under the Indian Act. The temporary-resident route requires residence during the previous 18 months and a valid permit in the 19th month without either status-disclaimer wording listed by CRA. A refugee claimant document alone does not qualify. Special restrictions apply when foster-child allowances are payable. Custody arrangements affect who applies: CRA distinguishes approximately equal care, predominantly one household, and temporary changes. Consult the linked criteria for each child; this record does not decide eligibility or calculate a payment.',
    note: 'Include spouse/partner qualifying status, Indian Act registration category and foster allowance restriction; route custody determinations to CRA instead of an incomplete numerical shortcut. Fresh supporting excerpts and independent review remain required.' }
];

export function correctedSeedText(text) {
  const newline=text.includes('\r\n')?'\r\n':'\n';
  const lines=text.split(/\r?\n/);
  for(const correction of corrections) {
    const matches=lines.map((line,index)=>line.includes(`record('${correction.id}',`)?index:-1).filter(index=>index>=0);
    if(matches.length!==1)throw new Error(`Ambiguous seed definition: ${correction.id}`);
    const index=matches[0]+1;
    const replacement=`    ${JSON.stringify(correction.summary)},`;
    if(lines[index]===replacement)continue;
    if(!lines[index]?.includes(correction.expected))throw new Error(`Seed changed; review again: ${correction.id}`);
    lines[index]=replacement;
  }
  return lines.join(newline);
}

function syncSeeds() {
  const path=fileURLToPath(new URL('../src/knowledge.js',import.meta.url));
  const before=readFileSync(path,'utf8'),next=correctedSeedText(before);
  if(before!==next)writeFileSync(path,next);
  return {file:'src/knowledge.js',changed:before!==next};
}

export function planFamilyCorrections(records) {
  return corrections.map(c => {
    const old=records.find(r=>r.id===c.id);
    if(!old) throw new Error(`Missing record: ${c.id}`);
    if(old.summary===c.summary) return null;
    if(!old.summary.includes(c.expected)) throw new Error(`Record changed; review again: ${c.id}`);
    const next={...old,summary:c.summary,status:'pending',checkedAt:'2026-11-04',
      reviewBasis:'Official source reviewed 2026-11-04; automated correction, not editorial approval. Fresh archived evidence and independent review required.'};
    delete next.snapshotId; delete next.reviewMethod; delete next.reviewedAt;
    assertEnglishRecord(next);
    return {id:c.id,old,next,note:c.note,edits:[[old.summary,c.summary]]};
  }).filter(Boolean);
}

export function runFamilyCorrections({path=databasePath(),apply=false,seedFiles=false}={}) {
  const db=new DatabaseSync(path,{readOnly:!apply,timeout:5000});
  try {
    const records=db.prepare('SELECT body FROM records').all().map(row=>JSON.parse(row.body));
    const plan=planFamilyCorrections(records);
    if(seedFiles)correctedSeedText(readFileSync(new URL('../src/knowledge.js',import.meta.url),'utf8'));
    if(!apply) return {applied:false,count:plan.length,plan};
    if(!plan.length) return {applied:true,count:0,backup:null,seed:seedFiles?syncSeeds():null};
    const backupDirectory=join(dirname(path),'backups');mkdirSync(backupDirectory,{recursive:true});
    const backup=join(backupDirectory,`before-family-source-review-${Date.now()}.sqlite`);
    db.exec(`VACUUM INTO '${backup.replaceAll("'","''")}'`);
    configureEnglishDatabase(db);
    db.exec('BEGIN IMMEDIATE');
    try {
      for(const entry of plan) {
        const current=db.prepare('SELECT body FROM records WHERE id=?').get(entry.id)?.body;
        if(current!==JSON.stringify(entry.old)) throw new Error(`Concurrent record change: ${entry.id}`);
        const next=JSON.stringify(entry.next);
        db.prepare('UPDATE records SET body=? WHERE id=?').run(next,entry.id);
        db.prepare('DELETE FROM records_fts WHERE id=?').run(entry.id);
        db.prepare('INSERT INTO records_fts(id,title,summary,quote,topic) VALUES (?,?,?,?,?)')
          .run(entry.id,entry.next.title,entry.next.summary,entry.next.quote,entry.next.topic);
        appendAudit(db,{recordId:entry.id,previous:current,next,reviewer:'Family source review 2026-11-04 (automated correction, not editorial review)',note:entry.note,action:'correction'});
      }
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error;}
    return {applied:true,count:plan.length,ids:plan.map(p=>p.id),backup,seed:seedFiles?syncSeeds():null};
  }finally{db.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args=process.argv.slice(2);
    if(args.some(a=>!['--apply','--sync-seeds'].includes(a))) throw new Error('Usage: node scripts/kb-family-source-review-2026-11-04.js [--apply] [--sync-seeds]');
    console.log(JSON.stringify(runFamilyCorrections({apply:args.includes('--apply'),seedFiles:args.includes('--sync-seeds')}),null,2));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
