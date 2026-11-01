import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateOntarioHousingCreedAccommodation,
  OHRC_UNDUE_HARDSHIP_STATUTORY_FACTORS
} from '../src/ontario-human-rights-housing-creed-navigator.js';

test('Ontario Creed Accommodation - Unlawful refusal of Sukkah on balcony for aesthetics', () => {
  const result = evaluateOntarioHousingCreedAccommodation({
    creedPracticeCategory: 'SUKKAH_STRUCTURE_ON_BALCONY',
    creedPracticeDescription: 'Temporary Sukkah booth for Sukkot',
    isSincerelyHeldBelief: true,
    hasTenantRequestedAccommodationInWriting: true,
    landlordRefusedAccommodation: true,
    landlordRefusalGround: 'BUILDING_AESTHETICS'
  });

  assert.equal(result.isHumanRightsBreachDetected, true);
  assert.equal(result.legalVerdict, 'ACTIONABLE_CREED_DISCRIMINATION_HRTO');
  assert.ok(result.statutoryViolations.some(v => v.violation === 'CONSTRUCTIVE_DISCRIMINATION_BASED_ON_CREED'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Amselem')));
  assert.ok(result.actionableRemedies.some(r => r.includes('HRTO')));
});

test('Ontario Creed Accommodation - Doorway Mezuza with landlord harassment', () => {
  const result = evaluateOntarioHousingCreedAccommodation({
    creedPracticeCategory: 'MEZUZA_OR_DOORWAY_SYMBOL',
    isSincerelyHeldBelief: true,
    landlordRefusedAccommodation: true,
    landlordRefusalGround: 'BLANKET_RULE_NO_BALCONY_OBJECTS',
    harassmentOrHostileCommentFromLandlord: true
  });

  assert.equal(result.isHumanRightsBreachDetected, true);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'STATUTORY_HARASSMENT_IN_HOUSING'));
});

test('Ontario Creed Accommodation - Safety risk reasonably mitigated with alternative space', () => {
  const result = evaluateOntarioHousingCreedAccommodation({
    creedPracticeCategory: 'SUKKAH_STRUCTURE_ON_BALCONY',
    isSincerelyHeldBelief: true,
    landlordRefusedAccommodation: true,
    landlordRefusalGround: 'UNMITIGATED_FIRE_SAFETY_RISK',
    landlordOfferedAlternativeReasonableAccommodation: true,
    alternativeAccommodationDescription: 'Dedicated ground courtyard space with fire-retardant anchors'
  });

  assert.equal(result.isHumanRightsBreachDetected, false);
  assert.equal(result.legalVerdict, 'REASONABLY_ACCOMMODATED_OR_NO_BREACH');
  assert.ok(result.legalProtections.some(p => p.principle === 'REASONABLE_HEALTH_AND_SAFETY_ACCOMMODATION'));
});

test('Ontario Creed Accommodation - Verify Undue Hardship Statutory Factors', () => {
  assert.ok(OHRC_UNDUE_HARDSHIP_STATUTORY_FACTORS.length >= 3);
});
