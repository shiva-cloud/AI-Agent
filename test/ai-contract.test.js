import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T23:59:59Z');
const Q={question:'How do I apply for a SIN?'};

test('disabled, not_applicable, busy and fallback all return the baseline untouched',async()=>{
  // No provider configured: deterministic baseline with an honest status.
  assert.equal((await createVerifiedAnswer({})(Q,seeds,now)).ai.status,'disabled');
  // Clarification/empty-baseline questions need no provider at all; a throwing
  // provider proves it is never called on that path.
  const noNeed=createVerifiedAnswer({complete:()=>{throw new Error('provider must not be called');}})({question:'A carefree day in Toronto'},seeds,now);
  assert.equal((await noNeed).ai.status,'not_applicable');
  // A hung provider occupies the single slot of one instance, so a concurrent
  // ask on THAT instance reports busy; the hung call falls back at its deadline.
  const once=createVerifiedAnswer({maxConcurrent:1,timeoutMs:50,complete:()=>new Promise(()=>{})});
  const hung=once(Q,seeds,now);
  const busy=once(Q,seeds,now);
  assert.equal((await busy).ai.status,'busy');
  const fellBack=await hung;
  assert.equal(fellBack.ai.status,'fallback');
  // Fallback must never look like a successful rewrite: claims stay the
  // deterministic baseline's, byte-for-byte.
  assert.deepEqual(fellBack.claims,answer(Q,seeds,now).claims);
});
