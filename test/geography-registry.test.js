import test from 'node:test';
import assert from 'node:assert/strict';
import { places, placePath, ancestorOfType, findPlaces, supportedCitiesIn, supportedRegionsIn, GEOGRAPHY_VERSION } from '../src/geography.js';
import { cities } from '../src/knowledge.js';
import { parse, answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('registry is a well-formed typed hierarchy', () => {
  const ids = new Set();
  const rank = { country: 0, region: 1, city: 2, neighbourhood: 3 };
  for (const place of places) {
    assert.ok(!ids.has(place.id), `duplicate id ${place.id}`);
    ids.add(place.id);
    assert.ok(place.type in rank, place.id);
    assert.ok(['supported', 'known_unsupported', 'outside_canada'].includes(place.status), place.id);
    if (place.type === 'country') assert.equal(place.parent, null, place.id);
    else {
      const parent = places.find(p => p.id === place.parent);
      assert.ok(parent, `${place.id} has unknown parent ${place.parent}`);
      assert.ok(rank[parent.type] < rank[place.type], `${place.id} must sit below ${parent.id}`);
    }
    assert.ok(Object.isFrozen(place) && Object.isFrozen(place.aliases));
  }
  assert.equal(GEOGRAPHY_VERSION, 'geo-1');
});

test('supported pilot cities match the knowledge base and resolve to their province', () => {
  const supportedCities = places.filter(p => p.type === 'city' && p.status === 'supported');
  assert.deepEqual(Object.fromEntries(supportedCities.map(p => [p.id, p.parent])), cities);
  assert.deepEqual(placePath('Toronto'), ['CA', 'ON', 'Toronto']);
  assert.deepEqual(placePath('Mississauga/Square One'), ['CA', 'ON', 'Mississauga', 'Mississauga/Square One']);
  assert.equal(ancestorOfType('Mississauga/Square One', 'region'), 'ON');
  assert.deepEqual(placePath('nowhere'), []);
});

test('aliases resolve cities, neighbourhoods and regions on word boundaries', () => {
  assert.deepEqual(supportedCitiesIn('library near square one'), ['Mississauga']);
  assert.deepEqual(supportedCitiesIn('rent in Missisauga and Brampton'), ['Mississauga', 'Brampton']);
  assert.deepEqual(supportedCitiesIn('torontonian food'), []);
  assert.deepEqual(supportedRegionsIn('transit in BC and Ontario'), ['ON', 'BC']);
  assert.deepEqual(supportedRegionsIn('abcde'), []);
  assert.deepEqual(findPlaces('moving from Paris to Toronto').map(p => p.id), ['Toronto', 'Paris']);
});

test('known-unsupported and outside-Canada places need clarification; unknown places are never read as Canada', () => {
  for (const question of ['Can I get a SIN in Ottawa?', 'Rent rules in Calgary', 'Health card in Quebec', 'Rent in Halifax', 'Moving to London, what about rent?', 'Rent in Dubai for Canadians in Toronto']) {
    const parsed = parse({ question });
    assert.equal(parsed.ambiguous, true, question);
    assert.ok(parsed.missingSlots.includes('location'), question);
  }
  const unknown = parse({ question: 'How do I rent an apartment in Springfield?' });
  assert.equal(unknown.ambiguous, true);
  assert.equal(unknown.city, null);

  const supported = parse({ question: 'Library near Square One' });
  assert.equal(supported.city, 'Mississauga');
  assert.equal(supported.region, 'ON');
  assert.equal(supported.ambiguous, false);
  assert.equal(supported.geographyVersion, 'geo-1');
});

test('location clarifications explain the problem and list the places mentioned', () => {
  const clarify = question => {
    const result = answer({ question }, []);
    assert.equal(result.status, 'clarification', question);
    assert.equal(result.clarification, result.placeClarification.message);
    return result.placeClarification;
  };

  const london = clarify('Moving to London, what about rent?');
  assert.equal(london.reason, 'unsupported_place');
  assert.deepEqual(london.mentioned.map(p => p.label), ['London, Ontario', 'London, United Kingdom']);
  assert.match(london.message, /London could mean London, Ontario or London, United Kingdom/);
  assert.match(london.message, /choose it as the destination country/);
  assert.deepEqual(london.selectableCities, []);

  const ottawa = clarify('Can I get a SIN in Ottawa?');
  assert.equal(ottawa.reason, 'unsupported_place');
  assert.deepEqual(ottawa.mentioned[0], { id: 'Ottawa', label: 'Ottawa, Ontario', type: 'city', status: 'known_unsupported', path: ['CA', 'ON', 'Ottawa'] });

  assert.equal(clarify('Rent in Mississauga and Brampton').reason, 'multiple_cities');
  assert.equal(clarify('Toronto BC health').reason, 'conflicting_regions');
  assert.equal(clarify('How do I rent an apartment in Springfield?').reason, 'unknown_place');

  // Cities are selectable only when the question names no place at all.
  const missing = clarify('Can my landlord evict me?');
  assert.equal(missing.reason, 'missing_location');
  assert.deepEqual(missing.selectableCities, ['Toronto', 'Mississauga', 'Brampton', 'Vancouver']);
  for (const question of ['Rent in Mississauga and Brampton', 'Can I get a SIN in Ottawa?', 'Toronto BC health']) {
    assert.deepEqual(clarify(question).selectableCities, [], question);
  }

  // Answers that need no location carry no placeClarification.
  assert.equal('placeClarification' in answer({ question: 'How do I get a SIN in Toronto?' }, []), false);
});

test('neighbourhoods resolve to their pilot city; nearby municipalities need clarification', () => {
  for (const [question, city] of [['Doctor in Scarborough', 'Toronto'], ['Rent in North York', 'Toronto'], ['Library in Etobicoke', 'Toronto'], ['Daycare in Malton', 'Mississauga'], ['Rent in Bramalea', 'Brampton'], ['Rent in Kitsilano', 'Vancouver']]) {
    const parsed = parse({ question });
    assert.equal(parsed.city, city, question);
    assert.equal(parsed.ambiguous, false, question);
  }
  for (const [question, label] of [['Rent in North Vancouver', 'North Vancouver, British Columbia'], ['North Vancouver rent', 'North Vancouver, British Columbia'], ['Rent in Markham', 'Markham, Ontario'], ['Rent in Richmond Hill', 'Richmond Hill, Ontario'], ['Rent in Richmond', 'Richmond, British Columbia'], ['Rent in Surrey', 'Surrey, British Columbia']]) {
    const result = answer({ question }, []);
    assert.equal(result.parsed.city, null, question);
    assert.deepEqual(result.placeClarification.mentioned.map(p => p.label), [label], question);
  }
  assert.equal(parse({ question: 'Transit in Vancouver' }).city, 'Vancouver');
});

test('unknown places are named back in the clarification without being stored', () => {
  assert.match(answer({ question: 'Rent in Prince George for my family' }, []).clarification, /^We could not recognise “Prince George” as a place\./);
  assert.match(answer({ question: 'Doctor near Kelowna please' }, []).clarification, /“Kelowna”/);
});

test('a city named with its destination country is not an unknown place', () => {
  for (const [question, country] of [['How do I get health coverage in London UK?', 'United Kingdom'], ['Can I exchange my driver licence in Sydney Australia?', 'Australia'], ['Rent in Manchester UK', 'United Kingdom']]) {
    const parsed = parse({ question });
    assert.equal(parsed.country, country, question);
    assert.equal(parsed.ambiguous, false, question);
  }
  // Mixing a Canadian place with another country, or a bare foreign city, still needs clarification.
  assert.equal(parse({ question: 'Health card in Toronto and the UK' }).ambiguous, true);
  assert.equal(parse({ question: 'Moving to London, what about rent?' }).ambiguous, true);
});

test('an origin country mentioned as history does not conflict with a Canadian destination', () => {
  const parsed = parse({ question: 'I lived in California for 2 years on an H-1B visa. How do I get an FBI police clearance Identity History Summary IdHS from Toronto Ontario?' });
  assert.equal(parsed.country, 'CA');
  assert.equal(parsed.city, 'Toronto');
  assert.equal(parsed.ambiguous, false);
  assert.equal(parsed.licenceCountry, 'United States');
});

test('questions naming two countries ask which one instead of silently picking one', () => {
  for (const [question, named] of [['Rent in the UK and Australia', /the United Kingdom and Australia/], ['Health card in Germany and Ireland', /Germany and Ireland/], ['Rent in the UK and Toronto', /Canada and the United Kingdom/]]) {
    const result = answer({ question }, []);
    assert.equal(result.status, 'clarification', question);
    assert.equal(result.placeClarification.reason, 'conflicting_countries', question);
    assert.match(result.clarification, named, question);
  }
  // A country named as where the person comes from is still not a second destination.
  const origin = parse({ question: 'I worked in the US and want rent in Toronto' });
  assert.equal(origin.ambiguous, false);
  assert.equal(origin.city, 'Toronto');
});

test('directional relocation disambiguates origin from destination (Pillar 1)', () => {
  const parsed = parse({ question: 'Moving from London to Toronto, can I drive?' });
  assert.equal(parsed.ambiguous, false);
  assert.equal(parsed.city, 'Toronto');
  assert.equal(parsed.region, 'ON');
  assert.equal(parsed.country, 'CA');
  assert.equal(parsed.licenceCountry, 'United Kingdom');
  assert.ok(parsed.relocation);
  assert.equal(parsed.relocation.origin, 'London');
  assert.equal(parsed.relocation.destination, 'Toronto');

  const parsedUS = parse({ question: 'Relocating from California to Vancouver, what about health insurance?' });
  assert.equal(parsedUS.ambiguous, false);
  assert.equal(parsedUS.city, 'Vancouver');
  assert.equal(parsedUS.region, 'BC');
  assert.equal(parsedUS.country, 'CA');
  assert.ok(parsedUS.relocation);
  assert.equal(parsedUS.relocation.destination, 'Vancouver');
});

test('GET /v1/geography publishes the registry with paths', async () => {
  const server = createApp(openStore(':memory:'), 'test-token-at-least-24-chars-long', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/v1/geography`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.version, 'geo-1');
    assert.equal(body.places.length, places.length);
    const vancouver = body.places.find(p => p.id === 'Vancouver');
    assert.deepEqual(vancouver, { id: 'Vancouver', type: 'city', name: 'Vancouver', parent: 'BC', status: 'supported', path: ['CA', 'BC', 'Vancouver'] });
    assert.equal(JSON.stringify(body).includes('aliases'), false);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
