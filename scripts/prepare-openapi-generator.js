// Temporary compatibility patch for Redocly 1.34.22's callable minimatch import.
// The fixed minimatch 11 exposes that same function as a named export.
// Hash and version checks prevent silently patching an unknown upstream build.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function prepareOpenapiGenerator() {
 const require=createRequire(import.meta.url);
 const corePackage=require.resolve('@redocly/openapi-core/package.json');
 const core=JSON.parse(readFileSync(corePackage,'utf8'));
 const coreRequire=createRequire(corePackage);
 const matcher=coreRequire('minimatch');
 const matcherPackage=coreRequire('minimatch/package.json');
 if(core.version!=='1.34.22'||matcherPackage.version!=='11.0.3'||typeof matcher.minimatch!=='function')throw new Error('OpenAPI generator dependency changed: review compatibility patch before generation');
 const path=join(dirname(corePackage),'lib','utils.js');
 const source=readFileSync(path,'utf8');
 const before='const minimatch = require("minimatch");';
 const after='const { minimatch } = require("minimatch");';
 const original=source.includes(after)?source.replace(after,before):source;
 if(createHash('sha256').update(original).digest('hex')!=='896a9acce92e3e5905aa267e895985d57888a87f500d58c29da9c8f9d488ff1c')throw new Error('Unexpected Redocly source: refusing compatibility patch');
 if(source===original)writeFileSync(path,source.replace(before,after));
 return {core:core.version,minimatch:matcherPackage.version,patched:true};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(prepareOpenapiGenerator()));
