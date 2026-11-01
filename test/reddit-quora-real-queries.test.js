import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answer,
  deconstructNarrative,
  detectLegalMyth,
  resolveNarrativeCrisis,
  cleanEmotionalFluff,
  normalizeSlangAndTypos
} from '../src/engine.js';
import { composePresentation } from '../src/answer-composer.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('1. Reddit Story Dump: Closed work permit hours cut and LMIA cash demand', () => {
  const query = 'Hey guys, so I’m currently on a closed work permit with a restaurant in Toronto, Ontario. Yesterday my boss told me business is slow and cut my hours to 10 hours a week, and is demanding I pay back $500 cash every week or he will cancel my LMIA and deport me. I’m so stressed out and terrified. Can he actually do this? What should I do right now? Please help!!';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.status.id, 'closed_work_permit');
  assert.equal(analysis.slots.location.country, 'Canada');
  assert.equal(analysis.slots.location.city, 'Toronto');
  assert.equal(analysis.slots.conflict.id, 'lmia_extortion');
  assert.equal(analysis.slots.urgency, 'high');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('2. Emergency Tenancy Crisis: Brampton illegal lockout in cold with passport inside', () => {
  const query = 'Landlord locked me out of my apartment in Brampton yesterday without any warning! My passport, laptop and winter jacket are all inside. It’s freezing outside. Can I break the window to get my documents? Can he evict me like this? Help asap!!';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.location.city, 'Brampton');
  assert.equal(analysis.slots.conflict.id, 'illegal_lockout');
  assert.equal(analysis.slots.urgency, 'emergency');
  assert.ok(analysis.mythWarning);
  assert.equal(analysis.mythWarning.id, 'myth_landlord_self_help_lockout');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('3. Dangerous Legal Myth: Cash work on visitor visa forgiven by paying taxes to CRA', () => {
  const query = 'can i work cash job on visitor visa until pr comes and pay tax later to cra so no problem?';

  const myth = detectLegalMyth(query);
  assert.ok(myth);
  assert.equal(myth.id, 'myth_cash_job_tax_amnesty');
  assert.equal(myth.severity, 'critical_danger');
  assert.ok(myth.citation.includes('IRPA'));

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('4. Heavy Newcomer Phonetic Typos & Abbreviations Normalization', () => {
  const raw = 'i aply expres entry crs score 475 my pgwp expring in 20 days';
  const normalized = normalizeSlangAndTypos(raw);

  assert.ok(normalized.includes('apply'));
  assert.ok(normalized.includes('Express Entry'));
  assert.ok(normalized.includes('Comprehensive Ranking System'));
  assert.ok(normalized.includes('Post-Graduation Work Permit'));
  assert.ok(normalized.includes('expiring'));
});

test('5. Cross-Border Terminology Confusion: Green Card in UK and OHIP in Calgary', () => {
  const qUK = 'How to get a green card in the UK?';
  const normUK = normalizeSlangAndTypos(qUK);
  assert.ok(normUK.includes('Indefinite Leave to Remain ILR'));

  const qAlberta = 'Can I use OHIP in Calgary for doctor visit?';
  const normAlberta = normalizeSlangAndTypos(qAlberta);
  assert.ok(normAlberta.includes('AHCIP'));
  assert.ok(normAlberta.includes('Alberta Health Care Insurance Plan'));
});

test('6. International Worker Rights: Employer withholding passport in Dubai / UAE', () => {
  const query = 'Can my employer in Dubai hold my passport until end of contract? They took it when I landed.';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.conflict.id, 'passport_withheld');
  assert.ok(analysis.slots.location.country === 'UAE' || analysis.slots.location.city === 'Dubai');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('7. Unlawful Advance Rent & Pet Bans in Ontario leases', () => {
  const query = 'Landlord in Toronto demanded 12 months deposit upfront and lease says strictly no pets allowed. Is this legal?';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.conflict.id, 'unlawful_rent_increase_or_deposit');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('8. Status Expired in Vancouver: 90-day restoration window under IRPA s. 182', () => {
  const query = 'My study permit expired 45 days ago in Vancouver. Can I restore my status or am I deported?';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.status.id, 'study_permit');
  assert.equal(analysis.slots.location.city, 'Vancouver');
  assert.equal(analysis.slots.conflict.id, 'status_expired_or_expiring');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('9. Travel on Maintained Status warning: leaving Canada terminates work authorization', () => {
  const query = 'I applied for my work permit extension and I am on maintained status. Can I travel to Mexico for a wedding and come back to work?';

  const myth = detectLegalMyth(query);
  assert.ok(myth);
  assert.equal(myth.id, 'myth_travel_on_maintained_status');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('10. Lost PR Card Abroad: IRPA s. 31(3) PRTD requirement', () => {
  const query = 'Urgent help pls!! I lost my PR card while outside Canada in Paris. Flight is in 4 days. How can I board?';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.conflict.id, 'lost_pr_card_abroad');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('11. Domestic Violence Protection: Sponsor threatening deportation', () => {
  const query = 'My husband who is sponsoring me threatens to cancel my sponsorship and have police deport me. I am terrified.';

  const analysis = deconstructNarrative(query);
  assert.equal(analysis.slots.conflict.id, 'domestic_violence_abuse');

  const res = answer({ question: query }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('12. Hinglish Tenancy Crisis Query Handling', () => {
  const hinglishQuery = 'makan malik ne tala badal diya aur mera passport aur saman andar hai brampton me urgent help';
  const cleaned = cleanEmotionalFluff(hinglishQuery);
  const normalized = normalizeSlangAndTypos(cleaned);

  assert.ok(normalized.includes('landlord illegal'));
  assert.ok(normalized.includes('lockout'));
  assert.ok(normalized.includes('RTA'));

  const res = answer({ question: hinglishQuery }, []);
  assert.ok(['unavailable','clarification'].includes(res.status));
  assert.deepEqual(res.claims, []);
  assert.equal(res.verification.editorReviewedClaims, 0);
  assert.ok(res.gaps.length > 0);
  const presentation = composePresentation(res);
  assert.equal(presentation.sections.length, 0);
});

test('13. HTTP REST Diagnostic Endpoints (/v1/query/deconstruct & /v1/query/normalize)', async () => {
  const store = openStore(':memory:');
  const app = createApp(store);
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // A. Deconstruct Endpoint
    const deconRes = await fetch(`${baseUrl}/v1/query/deconstruct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Hey guys, closed work permit restaurant in Toronto, boss cut hours to 10 and demands $500 cash weekly. What to do?'
      })
    });
    assert.equal(deconRes.status, 200);
    const deconData = await deconRes.json();
    assert.equal(deconData.success, true);
    assert.equal(deconData.slots.status.id, 'closed_work_permit');
    assert.equal(deconData.slots.location.city, 'Toronto');
    assert.equal(deconData.slots.conflict.id, 'wage_theft_hours_cut');

    // B. Normalize Endpoint
    const normRes = await fetch(`${baseUrl}/v1/query/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'urgent help pls!! can i work cash on visitor visa and pay tax later to cra?'
      })
    });
    assert.equal(normRes.status, 200);
    const normData = await normRes.json();
    assert.equal(normData.success, true);
    assert.ok(normData.normalized.includes('Canada Revenue Agency'));
    assert.ok(normData.myth);
    assert.equal(normData.myth.id, 'myth_cash_job_tax_amnesty');

    // C. Live /v1/answers Endpoint with messy Reddit narrative
    const ansRes = await fetch(`${baseUrl}/v1/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Landlord locked me out of my apartment in Brampton yesterday without any warning! My passport, laptop and winter jacket are all inside. Help asap!!'
      })
    });
    assert.equal(ansRes.status, 200);
    const ansData = await ansRes.json();
    assert.equal(ansData.status, 'unavailable');
    assert.deepEqual(ansData.claims, []);
    assert.equal(ansData.verification.editorReviewedClaims, 0);
    assert.equal(ansData.presentation.sections.length, 0);
  } finally {
    await new Promise(resolve=>server.close(resolve));
    store.db.close();
  }
});
