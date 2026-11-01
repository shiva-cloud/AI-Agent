import test from 'node:test';
import assert from 'node:assert/strict';
import {errorResponse} from '../src/api-errors.js';
import {runStorageRecoveryDrill} from '../scripts/storage-recovery-drill.js';

test('only recognized SQLite contention errors receive retryable responses',()=>{
 for(const errcode of [5,6,261,517])assert.equal(errorResponse({code:'ERR_SQLITE_ERROR',errcode}).body.code,'storage_busy');
 for(const error of [{code:'ERR_SQLITE_ERROR',errcode:19},{code:'ERR_SQLITE_ERROR',errcode:'5'},{code:'private',errcode:5},new Error('SQLITE_BUSY secret')])assert.equal(errorResponse(error).status,500);
});
test('concurrent HTTP work recovers after actual SQLite write contention without partial persistence',{timeout:60000},async()=>{
 const report=await runStorageRecoveryDrill({concurrency:4});
 assert.equal(report.status,'passed');assert.equal(report.persistedTraces,8);assert.equal(report.partialWrites,false);
 assert.deepEqual(report.phases.map(p=>p.statuses),[[200],[503],[200]]);
});
