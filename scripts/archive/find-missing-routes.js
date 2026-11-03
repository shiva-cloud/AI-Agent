import fs from 'node:fs';

const spec = JSON.parse(fs.readFileSync('docs/openapi.json', 'utf8'));
const server = fs.readFileSync('src/server.js', 'utf8');

const matches = [...server.matchAll(/path==='(\/(?:admin|v1)\/[^']+|\/health|\/ready)'/g)].map(m => m[1]);
const missing = matches.filter(p => !spec.paths[p]);
console.log('Total literal routes checked:', matches.length);
console.log('Missing from spec.paths:', missing.length);
if (missing.length > 0) {
  console.log('Missing routes:', missing);
}
