import {readFileSync,writeFileSync} from 'node:fs';
let p='test/realtime-cron.test.js',s=readFileSync(p,'utf8');
s="import { permitCrawl } from '../src/crawl-policy.js';\n"+s;
s=s.replace('  return {\n    db,', "  for (const source of REALTIME_SOURCES) permitCrawl(db,source,{reviewer:'Test fixture',note:'Synthetic fetch fixture; no external network access.'});\n  return {\n    db,");
s=s.replace('assert.equal(body.autonomousCronActive, true);','assert.equal(body.autonomousCronActive, false);');
writeFileSync(p,s);
p='test/realtime-city-pipeline.test.js';s=readFileSync(p,'utf8');
s=s.replace("kb.findActiveAlerts({ city: 'Vancouver', topic: 'transit' })", "kb.findActiveAlerts({ city: 'Vancouver', topic: 'transit', now: new Date('2027-01-01') })");
// Future policy is correctly withheld before its effective date; also ensure its
// evidence is fresh at the future query time rather than extending expiry.
s=s.replace("const vancouverAlerts = kb.findActiveAlerts", "const futureRecord = JSON.parse(db.prepare('SELECT body FROM records WHERE id=?').get(extracted.candidateRecord.id).body);\n  futureRecord.checkedAt='2027-01-01';futureRecord.expiresAt='2027-01-15';\n  db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(futureRecord),futureRecord.id);\n  const vancouverAlerts = kb.findActiveAlerts");
s=s.replace("assert.equal(active.length, 1);\n  assert.equal(active[0].headline, 'Express Entry Round 310 Results');", "assert.equal(active.length, 0, 'High risk announcements require editorial provenance');");
s=s.replace("assert.equal(active.length, 1, 'Only one active alert remains for the same source');\n  assert.equal(active[0].headline, 'Express Entry Round 311 Results', 'Superseded by newest round');", "assert.equal(active.length, 0, 'New high risk announcements remain withheld');");
s=s.replace("test('Chat Engine Integration: injects live alerts directly into answers'", "test('Chat Engine Integration: withholds alerts without approved evidence'");
const a=s.indexOf("  assert.ok(ans.liveAlerts, 'liveAlerts is populated");const b=s.indexOf('\n});',a);
s=s.slice(0,a)+"  assert.equal(ans.liveAlerts?.length || 0, 0);\n  assert.ok(!composePresentation(ans).breakingAlert);"+s.slice(b);
s=s.replace("createApp(store, 'test-legacy-admin-token-24ch', {})", "createApp(store, 'test-legacy-admin-token-24ch', {allowRealtimeSimulation:true})");
s=s.replace("headers: { 'Content-Type': 'application/json' },", "headers: { 'Content-Type': 'application/json', Authorization:'Bearer test-legacy-admin-token-24ch' },");
writeFileSync(p,s);
