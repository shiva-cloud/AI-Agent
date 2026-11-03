import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLegalMyth,
  resolveNarrativeCrisis,
  normalizeSlangAndTypos,
  deconstructNarrative,
  cleanEmotionalFluff
} from '../src/engine.js';

test('Archetype 1: Panicked story-dump deconstructs into legal slots and crisis guidance', () => {
  const query = 'urgent help pls!! landed in toronto on closed wp under lmia yesterday my employer said business is slow and told me he is cutting my hours from 40 to 18 and paying me in cash for the rest. can he cancel my visa or will cbsa deport me??';
  
  const deconstructed = deconstructNarrative(query);
  assert.equal(deconstructed.slots.status?.id, 'closed_work_permit');
  assert.equal(deconstructed.slots.location?.city, 'Toronto');
  assert.equal(deconstructed.slots.location?.region, 'Ontario');
  assert.equal(deconstructed.slots.urgency, 'emergency');
  assert.equal(deconstructed.slots.conflict?.id, 'lmia_extortion');

  const resolved = resolveNarrativeCrisis(query);
  assert.ok(resolved);
  assert.equal(resolved.city, 'Toronto');
  assert.match(resolved.verdict, /EXTORTION|COMPLIANCE/i);
  assert.ok(resolved.checklist.some(item => item.includes('Vulnerable Worker Open Work Permit') || item.includes('Service Canada')));
});

test('Archetype 2: Heavy typos, slang & acronym expansion normalizes cleanly', () => {
  const messy = 'how to aply for expres entry if my pgwp is expring?';
  const normalized = normalizeSlangAndTypos(messy);

  assert.match(normalized, /apply/i);
  assert.match(normalized, /Express Entry/i);
  assert.match(normalized, /Post-Graduation Work Permit/i);
  assert.match(normalized, /expiring/i);
});

test('Archetype 3: Dangerous legal myths are intercepted with statutory warnings', () => {
  // Myth: Cash job tax amnesty
  const cashJobQuery = 'I am in Vancouver on a visitor visa. Can I work cash in a restaurant and pay taxes next year to get PR?';
  const myth1 = detectLegalMyth(cashJobQuery);
  assert.ok(myth1);
  assert.equal(myth1.id, 'myth_cash_job_tax_amnesty');
  assert.equal(myth1.severity, 'critical_danger');
  assert.match(myth1.verdict, /FALSE & DANGEROUS/i);
  assert.match(myth1.citation, /IRPA.*s\.\s*30/i);

  // Myth: LMIA recruitment fee extortion
  const lmiaFeeQuery = 'My boss is demanding $20,000 for my LMIA sponsorship. Can an employer legally charge me?';
  const myth2 = detectLegalMyth(lmiaFeeQuery);
  assert.ok(myth2);
  assert.equal(myth2.id, 'myth_lmia_recruitment_fees');
  assert.equal(myth2.severity, 'critical_exploitation');
  assert.match(myth2.verdict, /FALSE & CRIMINAL/i);
});

test('Archetype 4: Cross-border terminology confusion is resolved', () => {
  const ukQuery = 'How many years of working in London on a skilled worker visa before I get my green card?';
  const normUk = normalizeSlangAndTypos(ukQuery);
  assert.match(normUk, /Indefinite Leave to Remain/i);

  const calgaryQuery = 'Can I apply for OHIP in Calgary?';
  const normCalgary = normalizeSlangAndTypos(calgaryQuery);
  assert.match(normCalgary, /AHCIP|Alberta Health Care/i);
});

test('Archetype 5: Slang & jargon shorthand expansions', () => {
  const slangQuery = 'Can I flagpole at peace bridge for my bowp with AOR?';
  const normalized = normalizeSlangAndTypos(slangQuery);

  assert.match(normalized, /flagpol(?:e|ing)/i);
  assert.match(normalized, /Bridging Open Work Permit/i);
  assert.match(normalized, /Acknowledgment of Receipt/i);
});

test('Archetype 6: Emergency tenancy lockout triggers immediate RHEU enforcement checklist', () => {
  const lockoutQuery = 'My landlord in Mississauga changed the door locks today while I was at my shift because I told him I will not accept his 20% rent hike. Can I break the window?';
  
  const crisis = resolveNarrativeCrisis(lockoutQuery);
  assert.ok(crisis);
  assert.equal(crisis.type, 'illegal_lockout');
  assert.equal(crisis.city, 'Mississauga');
  assert.match(crisis.verdict, /ILLEGAL LOCKOUT/i);
  assert.ok(crisis.checklist.some(step => step.includes('1-888-772-9277')));
  assert.ok(crisis.checklist.some(step => step.includes('Do NOT attempt to break windows')));
  assert.ok(crisis.mythWarning);
  assert.equal(crisis.mythWarning.id, 'myth_landlord_self_help_lockout');
});

test('cleanEmotionalFluff strips non-legal noise while preserving facts', () => {
  const raw = 'pls help me sir im crying so much my pgwp expires in 10 days in toronto';
  const cleaned = cleanEmotionalFluff(raw);
  assert.ok(!cleaned.includes('im crying so much'));
  assert.ok(cleaned.includes('pgwp'));
  assert.ok(cleaned.includes('toronto'));
});
