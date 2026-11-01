import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runHttpQuestionSuite} from '../scripts/benchmark-live-http.js';
import {questionSuite} from '../scripts/question-suite-180.js';

test('benchmark imports neither execute work nor touch the working directory',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-benchmark-import-'));
 try {
  const modules=['benchmark-180-questions.js','benchmark-live-http.js'].map(name=>new URL('../scripts/'+name,import.meta.url).href);
  const child=spawnSync(process.execPath,['--input-type=module','-e',modules.map(url=>`await import(${JSON.stringify(url)});`).join('\n')],{cwd:root,encoding:'utf8',windowsHide:true,timeout:10000});
  assert.equal(child.status,0,child.stderr);assert.equal(child.stdout,'');assert.deepEqual(readdirSync(root),[]);
 }finally{const actual=realpathSync(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('northstar-benchmark-import-'));rmSync(actual,{recursive:true,force:true});}
});

test('Norway settlement HTTP regression persists independent traces without runtime errors',async()=>{
 const item=questionSuite.find(q=>q.id==='S16');assert.ok(item);
 const report=await runHttpQuestionSuite(Array.from({length:5},()=>item));
 assert.equal(report.total,5);assert.equal(report.httpFailures,0);assert.equal(report.persistedTraces,5);
});

test('benchmark distinguishes HTTP success from failed answer expectations',async()=>{
 const report=await runHttpQuestionSuite([{id:'fixture',q:'How do I bake bread in Toronto?',exp:'guidance'}]);
 assert.equal(report.httpFailures,0);assert.equal(report.expectationMismatches,1);assert.equal(report.failed,1);assert.equal(report.persistedTraces,1);
 assert.equal(report.failures[0].type,'expectation_mismatch');
});
