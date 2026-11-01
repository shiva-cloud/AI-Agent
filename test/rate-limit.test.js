import test from 'node:test';
import assert from 'node:assert/strict';
import {createRateLimiter} from '../src/rate-limit.js';
test('client capacity rejects new identities without resetting active quotas and recovers after expiry',()=>{
 let now=0;const check=createRateLimiter({limit:1,maxClients:2,windowMs:1000,clock:()=>now});
 assert.equal(check('a').allowed,true);assert.equal(check('b').allowed,true);
 for(let i=0;i<1000;i++)assert.equal(check('new-'+i).allowed,false);
 assert.equal(check('a').allowed,false);now=1000;assert.equal(check('c').allowed,true);
});
test('quota recovers exactly at the window boundary without a real-time wait',()=>{
 let now=0;const check=createRateLimiter({limit:2,windowMs:60000,clock:()=>now});
 assert.equal(check('a').allowed,true);assert.equal(check('a').allowed,true);
 assert.deepEqual(check('a'),{allowed:false,retryAfterSeconds:60});
 now=59999;assert.deepEqual(check('a'),{allowed:false,retryAfterSeconds:1});
 now=60000;assert.equal(check('a').allowed,true);
});
test('client quotas are independent and blocked requests do not extend the window',()=>{
 let now=0;const check=createRateLimiter({limit:1,clock:()=>now});
 check('a');assert.equal(check('b').allowed,true);
 now=30000;assert.equal(check('a').allowed,false);
 now=60000;assert.equal(check('a').allowed,true);
});
test('expired clients can be pruned without resetting active quotas',()=>{
 let now=0;const check=createRateLimiter({limit:1,clock:()=>now});
 for(let i=0;i<1002;i++)check(`old-${i}`);
 now=30000;check('active');now=60000;
 assert.equal(check('active').allowed,false);assert.equal(check('old-0').allowed,true);
});
