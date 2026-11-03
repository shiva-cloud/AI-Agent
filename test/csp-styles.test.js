import test from 'node:test';
import assert from 'node:assert/strict';
import { appSource } from './app-source.js';

// csp-styles.js touches the DOM at import time; give it the minimum it needs.
globalThis.document={documentElement:{nodeType:1,hasAttribute:()=>false,querySelectorAll:()=>[]}};
globalThis.MutationObserver=class{observe(){}};
const {declarations}=await import('../public/csp-styles.js');

test('plain declarations are kept, including values with brackets and semicolons in functions',()=>{
 assert.deepEqual(declarations('margin-top:1.5rem; display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));color:var(--ink,#123)'),[
  ['margin-top','1.5rem',''],['display','grid',''],['grid-template-columns','repeat(auto-fit,minmax(200px,1fr))',''],['color','var(--ink,#123)','']]);
 assert.deepEqual(declarations('width:40% !important'),[['width','40%','important']]);
});

test('values that can load or run something are dropped',()=>{
 for(const bad of ['background:url(https://evil.example/x)','background-image:image-set("a.png" 1x)','width:expression(alert(1))','color:\\72 ed','content:"<b>"'])
  assert.deepEqual(declarations(bad),[],bad);
 assert.deepEqual(declarations('color:red;background:url(x);font-size:12px').map(d=>d[0]),['color','font-size']);
});

test('app.js defines escapeHtml for its HTML templates and guards storage reads',()=>{
 const source=appSource();
 assert.match(source,/function escapeHtml\(/);
 assert.match(source,/function readStored\(/);
 assert.doesNotMatch(source,/JSON\.parse\(localStorage\.getItem/);
 assert.doesNotMatch(source,/Found for "\$\{query\}"/);
});
