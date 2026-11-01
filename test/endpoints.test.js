import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {cities,agencies,seeds} from '../src/knowledge.js';
import {assertEnglishData} from '../src/language.js';
const base=async server=>`http://127.0.0.1:${server.address().port}`;

test('topic catalog and meta are public, honest and English-only',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const topics=await (await fetch(await base(server)+'/v1/topics')).json();
    assert.equal(topics.language,'en');assert.deepEqual(topics.languages,['en']);
    assert.ok(topics.topics.every(t=>t.id && typeof t.label==='string' && t.label.length>2));
    const meta=await (await fetch(await base(server)+'/v1/meta')).json();
    assert.equal(meta.language,'en');assert.equal(meta.mode,'research-preview');
    assert.match(meta.version,/^\d+\.\d+\.\d+$/);
    const coverage=await (await fetch(await base(server)+'/v1/coverage')).json();
    assert.ok(coverage.coverage.every(c=>c.language==='en'));
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('route families keep separate rate buckets so static reloads never block answers',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  try{
    // /health shares the v1 bucket (limit 120): exhaust it.
    const strikes=[];
    for(let i=0;i<121;i++){const r=await fetch(root+'/health');strikes.push(r.status);}
    assert.ok(strikes.includes(429));
    // The static family still serves pages on the same IP.
    assert.equal((await fetch(root+'/')).status,200);
    assert.equal((await fetch(root+'/app.js')).status,200);
    // And a fresh IP key is not a loophole inside the same family, but admin
    // traffic has its own bucket untouched by this exhaustion.
    const unauthorized=await fetch(root+'/admin/review-queue',{headers:{Authorization:'Bearer endpoint-test-token-24-chars'}});
    assert.equal(unauthorized.status,200);
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('ETag revalidation returns 304 for unchanged static files',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  try{
    const first=await fetch(root+'/app.js');
    assert.equal(first.status,200);
    const etag=first.headers.get('etag');
    assert.ok(/^"static-[0-9a-f]{20}"$/.test(etag));
    assert.match(first.headers.get('cache-control'),/no-cache/);
    const again=await fetch(root+'/app.js',{headers:{'If-None-Match':etag}});
    assert.equal(again.status,304);
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('unrecognized-question demand is aggregated anonymously for editors only',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server),auth={Authorization:'Bearer endpoint-test-token-24-chars'};
  try{
    assert.equal((await fetch(root+'/admin/metrics')).status,401);
    await fetch(root+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'A carefree day in Toronto'})});
    await fetch(root+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Another uneventful afternoon walk in Toronto'})});
    const metrics=(await (await fetch(root+'/admin/metrics',{headers:auth})).json());
    assert.equal(metrics.processLocal,true);
    assert.equal(metrics.unrecognizedIntent.total,2);
    assert.ok(metrics.unrecognizedIntent.days.every(d=>/^\d{4}-\d{2}-\d{2}$/.test(d.day)&&d.count>=1));
    // The trace log must not contain the question text: never persisted.
    const stored=store.db.prepare('SELECT body FROM traces').all().map(r=>JSON.parse(r.body));
    assert.ok(stored.every(t=>!('question' in t)));
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('per-city coverage detail, pilot stats and a 404 that points the way',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  try{
    // Per-city sheet: carries the evidence behind each topic status.
    const toronto=await (await fetch(root+'/v1/coverage/Toronto')).json();
    assert.equal(toronto.city,'Toronto');assert.equal(toronto.region,'ON');
    assert.ok(toronto.topics.every(t=>t.topic&&Array.isArray(t.evidence)));
    // Case-normalized lookup, mirroring how coverage() keys cities.
    const lowercase=await (await fetch(root+'/v1/coverage/vancouver')).json();
    assert.equal(lowercase.city,'Vancouver');
    // Unknown city: 404 plus the list a human would actually want.
    const unknown=await fetch(root+'/v1/coverage/Calgary');
    assert.equal(unknown.status,404);
    const cityMiss=await unknown.json();
    assert.equal(cityMiss.error,'Unknown pilot city');
    assert.deepEqual(cityMiss.knownCities,Object.keys(cities));
    // Public pilot footprint: aggregates only, no pendingReview deception.
    const stats=await (await fetch(root+'/v1/stats')).json();
    assert.equal(stats.cities,4);assert.equal(stats.englishOnly,true);
    assert.equal(stats.records,store.records().length);
    assert.ok(stats.pendingReview>=0&&stats.nextExpiry&&stats.asOf.length===10);
    // Unknown route: the 404 names the routes that exist.
    const missing=await fetch(root+'/nope');
    assert.equal(missing.status,404);
    const hint=await missing.json();
    assert.ok(hint.known.includes('/v1/coverage/:city'));
    assert.ok(hint.known.every(r=>r.startsWith('/')));
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('evidence-currency feed and human handoff directory are public and honest',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  try{
    // /v1/changes: aggregate currency counter set matches the actual records.
    const changes=await (await fetch(root+'/v1/changes')).json();
    assert.equal(changes.language,'en');
    const records=store.records();
    assert.equal(changes.counts.total,records.length);
    assert.equal(changes.counts.pendingReview,records.filter(r=>r.status==='pending').length);
    assert.ok(changes.counts.expired>=0&&changes.counts.expiringSoon>=0&&changes.counts.recentlyChecked>=0);
    // Items are the newest-checked twelve, sorted by checkedAt then id.
    const expected=[...records]
      .sort((a,b)=>b.checkedAt.localeCompare(a.checkedAt)||b.id.localeCompare(a.id))
      .slice(0,12).map(r=>r.id);
    assert.deepEqual(changes.items.map(i=>i.id),expected);
    assert.ok(changes.items.length<=12);
    assert.ok(changes.items.every(i=>i.title&&i.topic&&i.jurisdiction&&i.status&&i.checkedAt&&i.expiresAt));
    // The feed serves evidence currency, not content or visitor residue:
    // no per-record quotes/urls and certainly no question text.
    assert.ok(changes.items.every(i=>!("quote" in i)&&!("url" in i)&&!("question" in i)));
    // /v1/agencies: every pilot city hands off to a person, national fallback
    // has options, URLs are https and every entry explains itself.
    const directory=await (await fetch(root+'/v1/agencies')).json();
    assert.equal(directory.language,'en');
    assert.match(directory.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Set(Object.keys(directory)).size,new Set([...Object.keys(cities),'national','language','checkedAt']).size);
    assert.ok(Object.keys(cities).every(c=>Array.isArray(directory[c])&&directory[c].length>=1));
    assert.ok(Array.isArray(directory.national)&&directory.national.length>=2);
    for(const list of [...Object.keys(cities).map(c=>directory[c]),directory.national]){
      assert.ok(list.every(a=>a.name&&a.url.startsWith('https://')&&typeof a.note==='string'&&a.note.length>20));
      // Every entry states how a person is actually reached — source-checked.
      assert.ok(list.every(a=>typeof a.channel==='string'&&a.channel.length>=4));
    }
    // The route mirrors the knowledge source of truth exactly.
    assert.deepEqual(directory.national,agencies.national);
    assertEnglishData(directory);
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('public gap transparency is aggregate-only and lifecycle-aware',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  const auth={Authorization:'Bearer endpoint-test-token-24-chars'};
  try{
    // Two real answers create aggregate gap work items (in-memory fixture).
    await fetch(root+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Am I eligible for OHIP and childcare in Toronto?',city:'Toronto',language:'en'})});
    await fetch(root+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'First week in Vancouver',city:'Vancouver',language:'en'})});
    const gaps=await (await fetch(root+'/v1/gaps')).json();
    assert.equal(gaps.language,'en');
    assert.match(gaps.asOf,/^\d{4}-\d{2}-\d{2}$/);
    // Cross-check the totals against the admin queue, then the public items.
    const admin=await (await fetch(root+'/admin/gap-work',{headers:auth})).json();
    const openAdmin=admin.items.filter(i=>i.status==='open');
    assert.equal(gaps.totals.open,openAdmin.length);
    assert.equal(gaps.totals.open+gaps.totals.inProgress+gaps.totals.resolved+gaps.totals.deferred,admin.items.length);
    assert.ok(gaps.items.length<=12&&gaps.items.length>=1);
    assert.ok(gaps.items.every((item,i)=>i===0||gaps.items[i-1].occurrences>=item.occurrences));
    // Only the five aggregate fields cross the public boundary.
    assert.ok(gaps.items.every(i=>Object.keys(i).every(k=>['scope','topic','subject','reason','occurrences'].includes(k))));
    for(const pub of gaps.items){
      const twin=openAdmin.find(i=>i.topic===pub.topic&&i.reason===pub.reason&&i.scope===pub.scope&&i.subject===pub.subject);
      assert.ok(twin,'public item corresponds to an admin item');
      assert.equal(pub.occurrences,twin.occurrences);
    }
    // Resolving an item removes it from the public view and moves its total.
    const target=admin.items.find(i=>i.status==='open');
    const resolved=await fetch(`${root}/admin/gap-work/${target.id}`,{method:'POST',headers:{'Content-Type':'application/json',...auth},
      body:JSON.stringify({revision:target.revision,status:'resolved',priority:'normal',owner:'Test editor',actor:'Test editor',note:'Regression test fixture resolution on a disposable store.',regressionRef:'test/endpoints.test.js#gap-transparency'})});
    assert.equal(resolved.status,200);
    const after=await (await fetch(root+'/v1/gaps')).json();
    assert.equal(after.totals.open,gaps.totals.open-1);
    assert.equal(after.totals.resolved,gaps.totals.resolved+1);
    assert.ok(!after.items.some(i=>i.topic===target.topic&&i.reason===target.reason&&i.scope===target.scope));
    assertEnglishData(after);
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});

test('atom mirror of evidence currency is bounded and escapes hostile titles',async()=>{
  const store=openStore(':memory:'),server=createApp(store,'endpoint-test-token-24-chars',{});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await base(server);
  try{
    // Fixture-only write on the memory store: a record whose title carries
    // every character that must be XML-escaped.
    const review={reviewer:'Test editor',note:'Test fixture access and evidence reviewed.',tier:'A'};
    store.ingestion.permitSource('seed-sin-route',review);
    const today=new Date().toISOString().slice(0,10);
    const expiresAt=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
    const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'escape-fixture',content:'Social Insurance Number: Apply. Allow 10 days.',record:{...seeds[0],id:'zz-escape-test',title:'A&B <C> "D"',status:'pending',checkedAt:today,expiresAt}});
    store.ingestion.decide(candidate.id,{...review,decision:'approve'});
    const r=await fetch(root+'/v1/changes.xml');
    assert.equal(r.status,200);
    assert.match(r.headers.get('Content-Type')??'',/^application\/atom\+xml/);
    const xml=await r.text();
    assert.ok(xml.startsWith('<?xml'));
    assert.match(xml,/<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
    // The hostile title arrives fully escaped, so no reader parses injected markup.
    assert.ok(xml.includes('<title>A&amp;B &lt;C&gt; &quot;D&quot;</title>'));
    const entries=(xml.match(/<entry>/g)??[]).length;
    assert.ok(entries<=12&&entries>=1);
    // Every entry carries title, id and an updated date.
    assert.ok((xml.match(/<updated>/g)??[]).length===entries+1);
    assert.ok((xml.match(/<id>/g)??[]).length===entries+1);
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});
