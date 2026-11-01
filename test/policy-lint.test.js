import test from 'node:test';
import assert from 'node:assert/strict';
import {lintEvidence} from '../src/evidence-policy.js';
const now=new Date('2026-10-28T23:59:59Z');

test('lint surfaces policy drift as structured warnings without mutating anything',()=>{
  const sources=[{id:'a',policy:'unreviewed'},{id:'b',policy:'manual_permitted',suspended:1}];
  const records=[
    {id:'old',expiresAt:'2026-10-01',status:'approved'},
    {id:'soon',expiresAt:'2026-11-04',status:'research_seed'},
    {id:'wait',expiresAt:'2027-01-01',status:'pending'}
  ];
  const r=lintEvidence(sources,records,now);
  const codes=r.warnings.map(w=>w.code);
  for(const code of ['policy_unreviewed','source_suspended','evidence_expired','evidence_expiring_soon','evidence_awaiting_review']) assert.ok(codes.includes(code),code);
  assert.equal(r.count,r.warnings.length);
  assert.equal(r.checkedAt,'2026-10-28');
  assert.equal(sources[0].policy,'unreviewed'); // read-only audit
});

test('a clean registry and fresh evidence lint empty',()=>{
  const r=lintEvidence([{id:'ok',policy:'manual_permitted'}],[{id:'fresh',expiresAt:'2027-01-01',status:'approved'}],now);
  assert.equal(r.count,0);assert.deepEqual(r.warnings,[]);
});
