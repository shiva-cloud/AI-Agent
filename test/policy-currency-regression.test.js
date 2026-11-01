import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {factValue} from '../src/kb-facts.js';
import {PolicyReviewRequiredError} from '../src/api-errors.js';
import {requiredSettlementFunds} from '../src/proof-of-funds.js';
import {UK_SALARY_THRESHOLDS} from '../src/uk-skilled-worker-ilr-navigator.js';
import {SUV_SETTLEMENT_FUNDS_2026} from '../src/federal-start-up-visa-designated-organization-navigator.js';
import {MULTI_COUNTRY_GAZETTE_CONSTANTS} from '../src/multi-country-gazette-crawler.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

test('fact reads reject impossible dates and inherited keys; expiry is exclusive',()=>{
  assert.throws(()=>factValue('ca.expressEntry.settlementFundsCad','2026-02-30'));
  assert.throws(()=>factValue('toString'),/Unknown KB fact/);
  assert.equal(factValue('ca.expressEntry.settlementFundsCad','2027-07-30')[1],15263);
  assert.throws(()=>factValue('ca.expressEntry.settlementFundsCad','2027-07-31'),PolicyReviewRequiredError);
});

test('already-imported calculators and exported tables stop serving values after review expiry',t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-01T12:00:00Z')});
  assert.equal(requiredSettlementFunds(1),15263);
  assert.equal(UK_SALARY_THRESHOLDS.STANDARD_GENERAL_FLOOR_GBP,41700);
  t.mock.timers.setTime(new Date('2028-01-01T00:00:00Z').getTime());
  for(const read of [()=>requiredSettlementFunds(1),()=>UK_SALARY_THRESHOLDS.STANDARD_GENERAL_FLOOR_GBP,()=>SUV_SETTLEMENT_FUNDS_2026[1],()=>JSON.stringify(SUV_SETTLEMENT_FUNDS_2026),()=>MULTI_COUNTRY_GAZETTE_CONSTANTS.AU_CORE_SKILLS_INCOME_THRESHOLD_AUD])assert.throws(read,PolicyReviewRequiredError);
});

test('expired policy returns actionable HTTP 503 while health remains available',async t=>{
  const store=openStore(':memory:');
  const app=createApp(store);
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  t.mock.timers.enable({apis:['Date'],now:new Date('2028-01-01T00:00:00Z')});
  try {
    const base=`http://127.0.0.1:${app.address().port}`;
    const response=await fetch(`${base}/v1/tools/proof-of-funds?familySize=1`);
    assert.equal(response.status,503);
    assert.equal((await response.json()).code,'policy_review_required');
    assert.equal((await fetch(`${base}/health`)).status,200);
  } finally {await new Promise(resolve=>app.close(resolve));store.db.close();}
});

test('expired registry does not prevent a cold server import',()=>{
  const url=new URL('../src/server.js',import.meta.url).href;
  execFileSync(process.execPath,['--input-type=module','-e',`const ActualDate=Date;globalThis.Date=class extends ActualDate{constructor(...args){super(...(args.length?args:['2028-01-01T00:00:00Z']));}static now(){return new ActualDate('2028-01-01T00:00:00Z').getTime();}};await import(${JSON.stringify(url)});`],{timeout:15000,stdio:'pipe'});
});
