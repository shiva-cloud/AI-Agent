import test from 'node:test';
import assert from 'node:assert/strict';
import {ValidationError,errorResponse,responseBody} from '../src/api-errors.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {humanizeError} from '../public/errors.js';

test('only intentional validation errors are exposed',()=>{
 assert.deepEqual(errorResponse(new ValidationError('Choose a supported city')),{status:400,body:{error:'Choose a supported city',code:'invalid_request'}});
 for(const error of [new Error('secret filesystem details'),new TypeError('private value'),{statusCode:400,message:'forged public error'}]) {
  assert.deepEqual(errorResponse(error),{status:500,body:{error:'Internal server error',code:'internal_error'}});
 }
 assert.equal(humanizeError({status:409}).action,'Reload');assert.equal(humanizeError({status:500}).title,'Server error');
 assert.equal(responseBody(429,{error:'Wait'}).code,'rate_limited');
 assert.equal(responseBody(503,{error:'Draining',code:'service_draining'}).code,'service_draining');
 assert.deepEqual(responseBody(200,{status:'ready'}),{status:'ready'});
});

test('API distinguishes invalid input, missing resources, conflicts and unexpected failures',async()=>{
 const s=openStore(':memory:'),token='test-error-contract-token-long',server=createApp(s,token,{});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body)=>fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
 try {
  for(const [path,body,status,code] of [
   ['/v1/questions/parse',{question:''},400,'invalid_request'],
   ['/v1/feedback',{traceId:{},issue:'helpful'},400,'invalid_request'],
   ['/v1/feedback',{traceId:'nonexistent',issue:'helpful'},404,'not_found'],
   ['/admin/sources',{id:'fixture',url:'invalid',owner:'Test owner',language:'en',tier:'A',reviewer:'Test reviewer',note:'Test fixture only.'},400,'invalid_request'],
   ['/admin/reviews/absent/decision',{decision:'reject',reviewer:'Test reviewer',note:'Test fixture only.'},404,'not_found']
  ]) {const response=await post(path,body);assert.equal(response.status,status,path);assert.equal((await response.json()).code,code);}
  const source={id:'fixture',url:'https://example.com/test',owner:'Test owner',language:'en',tier:'A',reviewer:'Test reviewer',note:'Test fixture only.'};
  assert.equal((await post('/admin/sources',source)).status,201);
  const duplicate=await post('/admin/sources',source);assert.equal(duplicate.status,409);assert.equal((await duplicate.json()).code,'conflict');
  s.records=()=>{throw new Error('Sensitive unexpected backend detail');};
  const failure=await fetch(root+'/v1/stats');assert.equal(failure.status,500);assert.equal((await failure.json()).error,'Internal server error');
 }finally{await new Promise(r=>server.close(r));s.db.close();}
});
