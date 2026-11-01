import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {evaluate} from '../src/evaluation.js';
import {seeds} from '../src/knowledge.js';
mkdirSync('artifacts',{recursive:true});
for(const [name,output] of [['english-pilot','evaluation'],['english-expanded','evaluation-expanded']]) {
 const dataset=JSON.parse(readFileSync(new URL(`../evaluation/${name}.json`,import.meta.url),'utf8'));
 const report=evaluate(dataset,seeds);
 writeFileSync(`artifacts/${output}.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 if(report.failures.length)process.exitCode=1;
}
