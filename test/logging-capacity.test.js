import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {Writable} from 'node:stream';
import {createObservability} from '../src/observability.js';
import {createStreamLogger} from '../src/stream-logger.js';

function fail(telemetry) {
 const res=new EventEmitter();res.setHeader=()=>{};res.statusCode=500;res.writableFinished=true;
 telemetry.begin({url:'/v1/answers'},res);res.emit('finish');res.emit('close');
}
test('stalled HTTP logger is bounded while all requests still count in metrics',async()=>{
 const pending=[];const telemetry=createObservability({maxPendingLogs:2,logger:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))});
 for(let i=0;i<100;i++)fail(telemetry);
 const snapshot=telemetry.snapshot();assert.equal(snapshot.loggingPending,2);assert.equal(snapshot.loggingDropped,98);assert.equal(snapshot.buckets[0].count,100);
 pending[0].resolve();pending[1].reject(new Error('private sink error'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(telemetry.snapshot().loggingPending,0);assert.equal(telemetry.snapshot().loggingFailures,1);
 fail(telemetry);assert.equal(pending.length,3);pending[2].resolve();
});
test('synchronous and malformed loggers cannot corrupt capacity counters',()=>{
 for(const logger of [()=>{},()=>{throw new Error('secret');},()=>({get then(){throw new Error('secret');}})]) {
  const telemetry=createObservability({logger,maxPendingLogs:1});fail(telemetry);fail(telemetry);
  assert.equal(telemetry.snapshot().loggingPending,0);assert.equal(telemetry.snapshot().loggingDropped,0);
 }
 for(const maxPendingLogs of [0,257,1.5,NaN])assert.throws(()=>createObservability({maxPendingLogs}),/configuration/);
 assert.throws(()=>createObservability({logger:null}),/configuration/);
});
test('stream backpressure retains logger slots until writes finish',async()=>{
 let complete;const stream=new Writable({highWaterMark:1,write(_chunk,_encoding,callback){complete=callback;}});
 const sink=createStreamLogger(stream),telemetry=createObservability({logger:event=>sink.log(event),maxPendingLogs:1});
 try {
  fail(telemetry);fail(telemetry);assert.equal(telemetry.snapshot().loggingPending,1);assert.equal(telemetry.snapshot().loggingDropped,1);
  complete();await new Promise(resolve=>setImmediate(resolve));assert.equal(telemetry.snapshot().loggingPending,0);
 }finally{stream.destroy();sink.dispose();}
});
test('stream write errors are handled without leaking details or crashing later requests',async()=>{
 const stream=new Writable({write(_chunk,_encoding,callback){callback(new Error('private stream path'));}});
 const sink=createStreamLogger(stream);
 try {
  await assert.rejects(sink.log({event:'fixture'}),{message:'Log output unavailable'});
  await new Promise(resolve=>setImmediate(resolve));
  await assert.rejects(sink.log({event:'next'}),{message:'Log output unavailable'});
 }finally{stream.destroy();sink.dispose();}
});
