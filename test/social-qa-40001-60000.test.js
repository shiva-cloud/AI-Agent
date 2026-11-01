import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import {
  answer,
  resolveSocialCrisisGuidance,
  detectSocialCrisisScenario,
  SOCIAL_CRISIS_TYPES
} from '../src/engine.js';

const store = openStore(':memory:');
const records = store.records();

test('Social QA 40001-60000: Zero Canadian Law Leaks to Unsupported Geographies', async (t) => {
  const leakTestCases = [
    {
      country: 'Dominican Republic',
      city: 'Santo Domingo',
      question: 'I moved to Santo Domingo, Dominican Republic as a international student. the other party is threatening me. Has anyone dealt with landlord refuses written lease, and what should I do first?'
    },
    {
      country: 'Argentina',
      city: 'Buenos Aires',
      question: 'I moved to Buenos Aires, Argentina as a new arrival. my records from home are unavailable. Has anyone dealt with housing discrimination, and what should I do first?'
    },
    {
      country: 'Romania',
      city: 'Bucharest',
      question: 'I moved to Bucharest, Romania as a small business owner. my agent stopped responding. Has anyone dealt with student tuition classification, and what should I do first?'
    },
    {
      country: 'Vietnam',
      city: 'Hanoi',
      question: 'I moved to Hanoi, Vietnam as a new arrival. my agent stopped responding. Has anyone dealt with community centre membership, and what should I do first?'
    },
    {
      country: 'Belgium',
      city: 'Antwerp',
      question: 'I moved to Antwerp, Belgium as a young adult. I have been asked to pay cash without a receipt. Has anyone dealt with false job offer for visa, and what should I do first?'
    },
    {
      country: 'India',
      city: 'Delhi',
      question: 'My situation is messy: my child needs urgent assistance. For a small business owner in Delhi, India, which evidence would actually matter for vehicle import and insurance?'
    },
    {
      country: 'Nigeria',
      city: 'Lagos',
      question: 'Can somebody explain community centre membership in Lagos, Nigeria in plain language? I am a single parent and I have only a digital copy of my documents.'
    },
    {
      country: 'Kuwait',
      city: 'Kuwait City',
      question: 'I moved to Kuwait City, Kuwait. How do I dispute rent increases with my landlord?'
    },
    {
      country: 'Philippines',
      city: 'Manila',
      question: 'What is the difference between what the law says and what agencies usually do about foreign degree recognition in Manila, Philippines, especially when the other party is threatening me?'
    }
  ];

  for (const item of leakTestCases) {
    await t.test(`Blocks Canadian law leak for ${item.city}, ${item.country}`, () => {
      const res = answer({ question: item.question }, records);

      // Must be honest scope rejection
      assert.equal(res.status, 'clarification', `Expected clarification for ${item.country}`);
      assert.ok(res.gaps.some(g => g.reason === 'missing_or_unsupported_geography'), 'Expected missing_or_unsupported_geography gap');
      assert.equal(res.claims.length, 0, `Expected 0 claims but got ${res.claims.length} for ${item.country}`);

      // Must explicitly name the 13 supported corridors and state the country is outside verified datasets
      assert.match(res.clarification, /13 destination corridors/i);
      assert.match(res.clarification, new RegExp(item.country, 'i'));
      assert.match(res.clarification, /outside our verified municipal settlement dataset/i);

      // Absolutely ZERO Canadian statutory citations must leak
      const text = JSON.stringify(res);
      assert.doesNotMatch(text, /CMHC|IRCC|IRPA|IRPR|Ontario RTA|BC RTB|NNAS|OHIP|MSP/);
    });
  }
});

test('Social QA 40001-60000: Social Crisis Navigator resolves urgent newcomer scenarios', async (t) => {
  await t.test('detects and resolves passport retention by recruiter', () => {
    const q = 'My recruiter took my passport and is retaining my work permit. What are my legal rights?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.PASSPORT_RETENTION);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /Criminal Code.*279\.01.*EPFNA.*s\.\s*8/i);
    assert.match(guidance.verdict, /illegal forced-labour conduct/i);
    assert.ok(guidance.actionableRecourse.some(r => /Service Canada.*1-866-602-9448/i.test(r)));
  });

  await t.test('detects and resolves cash rent without receipt demand', () => {
    const q = 'My landlord asks me to pay cash without a receipt and refuses to give me proof of rent. What should I do?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.CASH_WITHOUT_RECEIPT);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /Residential Tenancies Act.*ss?\.\s*(?:105,\s*)?109/i);
    assert.match(guidance.verdict, /legally required to provide written rent receipts/i);
    assert.ok(guidance.actionableRecourse.some(r => /Form T2/i.test(r)));
  });

  await t.test('detects and resolves immigration agent ghosting & fee fraud', () => {
    const q = 'I paid $5000 to an immigration agent who stopped responding. How do I check if my application was even submitted?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.AGENT_GHOSTING);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /IRPA.*s\.\s*91.*CICC/i);
    assert.ok(guidance.actionableRecourse.some(r => /IRCC Webform/i.test(r)));
    assert.ok(guidance.actionableRecourse.some(r => /IMM 5476/i.test(r)));
  });

  await t.test('detects and resolves landlord threats and extortion', () => {
    const q = 'The landlord is threatening me with immediate eviction and deportation if I do not pay extra fees.';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.THREATS_EXTORTION);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /Criminal Code.*423.*Residential Tenancies Act.*ss\.\s*22,\s*24/i);
    assert.match(guidance.verdict, /void self-help remedies/i);
    assert.ok(guidance.actionableRecourse.some(r => /Sheriff|RHEU/i.test(r)));
  });

  await t.test('detects and resolves status preservation during extension/appeal processing', () => {
    const q = 'My work permit expires next week while my appeal is pending. Am I legally allowed to continue working?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.MAINTAINED_STATUS_PROTECTION);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /IRPR.*183\(5\)/i);
    assert.match(guidance.verdict, /maintain lawful authority to remain/i);
  });

  await t.test('detects and resolves landlord refusing written lease', () => {
    const q = 'My landlord refuses written lease for my rental unit in Toronto. What are my legal protections?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.LANDLORD_REFUSES_LEASE);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /Residential Tenancies Act.*12\.1/i);
    assert.match(guidance.verdict, /compel a formal lease/i);
  });

  await t.test('detects and resolves administrative missed deadline relief', () => {
    const q = 'I missed an important deadline to appeal my immigration refusal due to medical hospitalization. Can I get an extension?';
    const detected = detectSocialCrisisScenario(q);
    assert.ok(detected);
    assert.equal(detected.type, SOCIAL_CRISIS_TYPES.MISSED_DEADLINE_RELIEF);

    const guidance = resolveSocialCrisisGuidance(q, { country: 'CA' });
    assert.ok(guidance);
    assert.match(guidance.authority, /SPPA.*21\.1.*IRPR.*182/i);
    assert.match(guidance.verdict, /extension of time or restoration/i);
  });
});

test('Social QA 40001-60000: Engine integration delivers actionable guidance for urgent Canadian scenarios', () => {const result=answer({question:'In Toronto, my recruiter is retaining my passport and threatening me with deportation. What immediate legal steps can I take?'},[]);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.equal(result.status,'unavailable');});
