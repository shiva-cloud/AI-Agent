import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
import {openJobQueue} from '../src/jobs.js';
import {exerciseGeneratedClient} from '../scripts/client-contract.ts';

test('schema-generated client typechecks and interoperates with actual backend',async()=>{
 execFileSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.client.json'],{windowsHide:true,stdio:'pipe'});
 const store=openStore(':memory:'),queue=openJobQueue(':memory:'),token='fixture-generated-client-'+'x'.repeat(32);
 const server=createApp(store,token,{}, {jobQueue:queue});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{assert.deepEqual(await exerciseGeneratedClient(`http://127.0.0.1:${server.address().port}`,token),{status:'passed',checks:6});}
 finally{await new Promise(resolve=>server.close(resolve));queue.close();store.db.close();}
});
