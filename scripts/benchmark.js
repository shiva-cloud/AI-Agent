import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const queries=['SIN application','Toronto OHIP waiting period','Brampton library and SIM','Vancouver health','London rent'];
const times=[];for(let i=0;i<1000;i++){const start=performance.now();answer({question:queries[i%queries.length]},seeds);times.push(performance.now()-start);}times.sort((a,b)=>a-b);
console.log(JSON.stringify({scope:`In-process rules engine, ${seeds.length} seed records, no HTTP or database cost. Not a production load test.`,queries:times.length,p50_ms:times[500],p95_ms:times[950],p99_ms:times[990]},null,2));
