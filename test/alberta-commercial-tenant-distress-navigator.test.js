import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_DISTRESS_RULES,
  auditAlbertaCommercialDistress
} from '../src/alberta-commercial-tenant-distress-navigator.js';

test('Alberta Distress Rules Constants', () => {
  assert.equal(ALBERTA_DISTRESS_RULES.OBJECTION_PERIOD_DAYS, 14);
  assert.equal(ALBERTA_DISTRESS_RULES.MINIMUM_HOLDING_BEFORE_SALE_DAYS, 5);
  assert.equal(ALBERTA_DISTRESS_RULES.REQUIRES_LICENSED_BAILIFF, true);
  assert.equal(ALBERTA_DISTRESS_RULES.MUTUALLY_EXCLUSIVE_TERMINATION, true);
  assert.equal(ALBERTA_DISTRESS_RULES.JURISDICTION, 'AB');
});

test('auditAlbertaCommercialDistress confirms lawful distress within 14-day objection window', () => {
  const result = auditAlbertaCommercialDistress({
    rentArrearsClaimedCad: 12000,
    goodsEstimatedValueCad: 35000,
    isSeizureExecutedByLicensedAgency: true,
    hasLandlordChangedLocksOrTerminatedLease: false,
    wasDistressWarrantAndNoticeOfSeizureServed: true,
    wasNoticeOfObjectionFormProvided: true,
    daysElapsedSinceSeizure: 3,
    tenantFiledNoticeOfObjection: false
  });

  assert.equal(result.legalVerdict, 'LAWFUL_PENDING_DISTRESS');
  assert.equal(result.civilViolations.length, 0);
  assert.equal(result.daysRemainingToServeObjection, 11);
  assert.equal(result.isWithinObjectionWindow, true);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Serve Form 4 Notice of Objection')));
});

test('auditAlbertaCommercialDistress detects mutual exclusivity violation (changing locks waives distress)', () => {
  const result = auditAlbertaCommercialDistress({
    rentArrearsClaimedCad: 20000,
    goodsEstimatedValueCad: 50000,
    isSeizureExecutedByLicensedAgency: true,
    hasLandlordChangedLocksOrTerminatedLease: true, // Fatal breach
    wasDistressWarrantAndNoticeOfSeizureServed: true,
    wasNoticeOfObjectionFormProvided: true,
    daysElapsedSinceSeizure: 2
  });

  assert.equal(result.legalVerdict, 'UNLAWFUL_DISTRESS_OR_CONVERSION');
  assert.ok(result.civilViolations.includes('MUTUAL_EXCLUSIVITY_BREACH_FORFEITURE'));
  assert.ok(result.deficiencies.some(d => d.includes('Mutual Exclusivity Doctrine')));
});

test('auditAlbertaCommercialDistress catches unlicensed self-help seizure by landlord', () => {
  const result = auditAlbertaCommercialDistress({
    rentArrearsClaimedCad: 8000,
    goodsEstimatedValueCad: 15000,
    isSeizureExecutedByLicensedAgency: false, // Unlicensed self-help
    hasLandlordChangedLocksOrTerminatedLease: false,
    wasDistressWarrantAndNoticeOfSeizureServed: false,
    wasNoticeOfObjectionFormProvided: false,
    daysElapsedSinceSeizure: 1
  });

  assert.equal(result.legalVerdict, 'UNLAWFUL_DISTRESS_OR_CONVERSION');
  assert.ok(result.civilViolations.includes('UNLICENSED_SELF_HELP_SEIZURE'));
  assert.ok(result.deficiencies.some(d => d.includes('Civil Enforcement Act')));
});

test('auditAlbertaCommercialDistress handles filed Notice of Objection freezing sale under s. 38', () => {
  const result = auditAlbertaCommercialDistress({
    rentArrearsClaimedCad: 15000,
    goodsEstimatedValueCad: 40000,
    isSeizureExecutedByLicensedAgency: true,
    hasLandlordChangedLocksOrTerminatedLease: false,
    wasDistressWarrantAndNoticeOfSeizureServed: true,
    wasNoticeOfObjectionFormProvided: true,
    daysElapsedSinceSeizure: 6,
    tenantFiledNoticeOfObjection: true, // Stay triggered
    thirdPartyLeasedEquipmentIncluded: true // Third-party asset
  });

  assert.equal(result.legalVerdict, 'UNLAWFUL_DISTRESS_OR_CONVERSION'); // Due to third party property included
  assert.ok(result.civilViolations.includes('SEIZURE_OF_THIRD_PARTY_PROPERTY'));
  assert.ok(result.compliancePoints.some(c => c.includes('STATUTORILY BARRED from selling')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Demand Statutory Stay of Sale')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Third-Party Ownership')));
});
