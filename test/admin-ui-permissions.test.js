import test from 'node:test';
import assert from 'node:assert/strict';
import {permissions,lockForm,bindIdentity} from '../public/admin-permissions.js';
import {canAccess} from '../src/admin-auth.js';
test('UI capabilities match backend mutation roles',()=>{
 const paths={policy:'/admin/sources/example/policy',import:'/admin/ingestion/run',review:'/admin/reviews/example/decision',gaps:'/admin/gap-work/'+'a'.repeat(64)};
 for(const role of ['reader','editor','reviewer','admin'])for(const [capability,path] of Object.entries(paths))assert.equal(permissions({role})[capability],canAccess({role},'POST',path));
 assert.ok(Object.values(permissions()).every(value=>value===false));
});
test('readonly forms disable controls and individual identity fields cannot be edited',()=>{
 const fields=[{disabled:false},{disabled:false}];let label;
 lockForm({querySelectorAll:()=>fields,setAttribute:(_,value)=>label=value},false);
 assert.ok(fields.every(field=>field.disabled));assert.match(label,/Read-only/);
 const identity={value:'spoofed'},owner={value:'Engineering'};
 bindIdentity({querySelectorAll:()=>[{textContent:'Reviewer name',querySelector:()=>identity},{textContent:'Owner',querySelector:()=>owner}]},{mode:'individual',id:'editor-one'});
 assert.equal(identity.value,'editor-one');assert.equal(identity.readOnly,true);assert.equal(owner.value,'Engineering');
});
