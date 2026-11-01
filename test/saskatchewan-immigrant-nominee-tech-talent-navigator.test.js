import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSinpTechTalent,
  SINP_ELIGIBLE_TECH_NOCS
} from '../src/saskatchewan-immigrant-nominee-tech-talent-navigator.js';

test('SINP Tech Talent - Eligible Express Entry Software Developer', () => {
  const result = evaluateSinpTechTalent({
    nocCode: '21232', // Software developers and programmers
    hasSinpJobApprovalLetter: true,
    isPermanentFullTimeOffer: true,
    isCurrentlyWorkingInSaskatchewan: true,
    monthsWorkedInSaskWithEmployer: 8, // > 6 months
    clbScore: 7, // Meets EE requirement
    isExpressEntryStream: true,
    hasActiveExpressEntryProfile: true,
    hasPostSecondaryTechEducation: true,
    intendsToResideInSaskatchewan: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_SINP_TECH_TALENT_NOMINATION');
  assert.equal(result.expressEntryBonusPoints, 600);
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.targetNoc.title, 'Software developers and programmers');
});

test('SINP Tech Talent - Disqualified due to Ineligible NOC and Missing JAL', () => {
  const result = evaluateSinpTechTalent({
    nocCode: '11100', // Financial auditors
    hasSinpJobApprovalLetter: false,
    isPermanentFullTimeOffer: true,
    clbScore: 7,
    isExpressEntryStream: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_SINP_TECH_TALENT');
  assert.ok(result.disqualifications.some(d => d.criterion === 'INELIGIBLE_TECH_NOC'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'MISSING_SINP_JAL'));
});

test('SINP Tech Talent - Electrical Engineer missing mandatory APEGS licensure letter', () => {
  const result = evaluateSinpTechTalent({
    nocCode: '21310', // Electrical engineer requires APEGS
    hasSinpJobApprovalLetter: true,
    isPermanentFullTimeOffer: true,
    isCurrentlyWorkingInSaskatchewan: false,
    monthsOfRelatedExperiencePastFiveYears: 36,
    clbScore: 6,
    isExpressEntryStream: false,
    hasPostSecondaryTechEducation: true,
    hasApegsLicensureOrEligibilityLetter: false // Missing
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'APEGS_LICENSURE_MISSING'));
});

test('SINP Tech Talent - Express Entry language deficit (CLB 6 instead of CLB 7)', () => {
  const result = evaluateSinpTechTalent({
    nocCode: '21220', // Cybersecurity
    hasSinpJobApprovalLetter: true,
    isPermanentFullTimeOffer: true,
    isCurrentlyWorkingInSaskatchewan: false,
    monthsOfRelatedExperiencePastFiveYears: 24,
    clbScore: 6, // Under CLB 7 for EE
    isExpressEntryStream: true,
    hasActiveExpressEntryProfile: true,
    hasPostSecondaryTechEducation: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_BENCHMARK_UNSATISFIED'));
});

test('SINP Tech Talent - Verify Roster of Eligible NOCs', () => {
  assert.ok(SINP_ELIGIBLE_TECH_NOCS.length >= 10);
  const dataScientist = SINP_ELIGIBLE_TECH_NOCS.find(n => n.noc === '21211');
  assert.equal(dataScientist.title, 'Data scientists');
  assert.equal(dataScientist.teer, 1);
});
