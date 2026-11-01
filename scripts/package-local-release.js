import {mkdirSync,readdirSync,lstatSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve('.'),name=`northstar-local-${new Date().toISOString().replace(/[:.]/g,'-')}`;
const output=join(root,'artifacts',name);mkdirSync(output,{recursive:true});
const entries=['package.json','package-lock.json','Dockerfile','.dockerignore','compose.local.yaml','README.md','tsconfig.client.json','src','public','scripts','docs','generated','test','evaluation','.github'];
const manifest={createdAt:new Date().toISOString(),scope:'Local review package; no working database or credentials',node:process.version,files:[]};
function copy(source,target){
 const info=lstatSync(source);if(info.isSymbolicLink())throw new Error('Release does not accept symlinks');
 if(info.isDirectory()){mkdirSync(target,{recursive:true});for(const file of readdirSync(source).sort())copy(join(source,file),join(target,file));return;}
 if(!info.isFile()||/\.(?:sqlite(?:-wal|-shm)?|db|log|zip)$/i.test(source)||/(?:^|[\\/])\.env(?:\.|$)/.test(source))return;
 if(['update-remediation-tests.mjs','retire-bulk-approval.mjs'].includes(source.split(/[\\/]/).at(-1)))return;
 copyFileSync(source,target);
 const data=readFileSync(target);manifest.files.push({path:relative(output,target).replaceAll('\\','/'),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
for(const entry of entries)copy(join(root,entry),join(output,entry));
writeFileSync(join(output,'RELEASE-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({directory:output,files:manifest.files.length}));
