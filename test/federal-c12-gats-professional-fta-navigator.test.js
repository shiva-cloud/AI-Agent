import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_FTA_CONSTANTS,
  evaluateFederalFtaProfessionalWorkPermit
} from '../src/federal-c12-gats-professional-fta-navigator.js';

test('Federal FTA Professionals - Constants reflect IRPR s. 204(a)', () => {
  assert.equal(FEDERAL_FTA_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
  assert.equal(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CUSMA.code, 'T23');
  assert.equal(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CETA.code, 'T43');
  assert.equal(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES.CPTPP.code, 'T51');
});

test('Federal FTA Professionals - Fully eligible CUSMA professional from USA', () => {
  const result = evaluateFederalFtaProfessionalWorkPermit({
    treaty: 'CUSMA',
    applicantCitizenshipCountry: 'USA',
    hasSignedServiceContractOrJobOffer: true,
    hasRequiredDegreeOrLicence: true,
    yearsOfProfessionalExperience: 5,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_FTA_WORK_PERMIT');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.exemptionCode, 'T23');
  assert.equal(result.permitDetails.lmiaRequired, false);
});

test('Federal FTA Professionals - Ineligible missing signed contract', () => {
  const result = evaluateFederalFtaProfessionalWorkPermit({
    treaty: 'CETA',
    applicantCitizenshipCountry: 'FRA',
    hasSignedServiceContractOrJobOffer: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_FTA_EXEMPTION');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'MISSING_PREARRANGED_CONTRACT_OR_OFFER'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'SECURE_EXECUTED_SERVICE_CONTRACT'));
});

test('Federal FTA Professionals - Ineligible missing required academic degree', () => {
  const result = evaluateFederalFtaProfessionalWorkPermit({
    treaty: 'CPTPP',
    applicantCitizenshipCountry: 'JPN',
    hasRequiredDegreeOrLicence: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_PROFESSIONAL_CREDENTIALS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'OBTAIN_EDUCATIONAL_CREDENTIAL_ASSESSMENT'));
});

test('Federal FTA Professionals - Ineligible regulated profession without provincial license', () => {
  const result = evaluateFederalFtaProfessionalWorkPermit({
    treaty: 'UK_TCA',
    applicantCitizenshipCountry: 'GBR',
    isRegulatedProfessionInProvince: true,
    provincialLicenceAcquiredOrInProcess: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLICENSED_IN_REGULATED_PROVINCIAL_PROFESSION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'INITIATE_PROVINCIAL_PROFESSIONAL_REGISTRATION'));
});
