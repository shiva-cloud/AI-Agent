// test/pet-importation.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePetImportation,
  CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD,
  MIN_RABIES_VACCINATION_AGE_MONTHS,
  MIN_PRIMARY_RABIES_WAITING_DAYS,
  MIN_RABIES_TITER_IU_PER_ML,
  BANNED_ONTARIO_BSL_BREEDS
} from '../src/pet-importation.js';

describe('Canadian Newcomer Pet & Animal Importation Engine', () => {
  it('statutory constants match CFIA and provincial standards', () => {
    assert.equal(CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD, 30);
    assert.equal(MIN_RABIES_VACCINATION_AGE_MONTHS, 3);
    assert.equal(MIN_PRIMARY_RABIES_WAITING_DAYS, 30);
    assert.equal(MIN_RABIES_TITER_IU_PER_ML, 0.5);
    assert.ok(BANNED_ONTARIO_BSL_BREEDS.includes('pit_bull_terrier'));
    assert.ok(BANNED_ONTARIO_BSL_BREEDS.includes('american_staffordshire_terrier'));
  });

  it('audits a compliant dog from the US entering Ontario with tariff exemption', () => {
    const res = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 24,
      countryOfOrigin: 'US',
      destinationProvince: 'ON',
      dogBreed: 'golden_retriever',
      microchipStatus: 'iso_15_digit_implanted_before_rabies',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 180,
      hasOfficialRabiesCertificate: true,
      isPersonalPetOwnedByImmigrant: true
    });

    assert.equal(res.isImportAdmissible, true);
    assert.equal(res.admissibilityVerdict, 'STATUTORILY_ADMISSIBLE');
    assert.equal(res.borderFinancials.isSettlerTariffExempt, true);
    assert.equal(res.borderFinancials.customsDutyCad, 0);
    assert.equal(res.borderFinancials.cfiaInspectionFeeCad, 30);
    assert.equal(res.complianceChecklist.isOntarioBslCompliant, true);
    assert.equal(res.statutoryViolations.length, 0);
  });

  it('strictly bars Pit Bull breeds from entering Ontario under DOLA s. 6', () => {
    const res = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 36,
      countryOfOrigin: 'US',
      destinationProvince: 'ON',
      dogBreed: 'pit_bull_terrier',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 180,
      hasOfficialRabiesCertificate: true
    });

    assert.equal(res.isImportAdmissible, false);
    assert.equal(res.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Pit Bull Ban') && v.statute.includes('Dog Owners\' Liability Act')));
    assert.equal(res.complianceChecklist.isOntarioBslCompliant, false);
  });

  it('permits Pit Bull breeds entering provinces without provincial BSL bans (e.g. BC)', () => {
    const res = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 36,
      countryOfOrigin: 'US',
      destinationProvince: 'BC',
      dogBreed: 'pit_bull_terrier',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 180,
      hasOfficialRabiesCertificate: true
    });

    assert.equal(res.isImportAdmissible, true);
    assert.equal(res.complianceChecklist.isOntarioBslCompliant, true);
  });

  it('enforces CFIA FAVN rabies blood titer test for dogs from high-risk rabies origins', () => {
    // Failing without titer test
    const failingRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 20,
      countryOfOrigin: 'IN', // High-risk rabies
      destinationProvince: 'ON',
      dogBreed: 'labrador',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 90,
      hasOfficialRabiesCertificate: true,
      hasFavnSerologyTiterTest: false
    });
    assert.equal(failingRes.isImportAdmissible, false);
    assert.ok(failingRes.statutoryViolations.some(v => v.rule.includes('Rabies Serology Titer Test (FAVN)')));

    // Passing with titer test >= 0.5 IU/mL
    const passingRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 20,
      countryOfOrigin: 'IN',
      destinationProvince: 'ON',
      dogBreed: 'labrador',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 90,
      hasOfficialRabiesCertificate: true,
      hasFavnSerologyTiterTest: true,
      titerResultIuPerMl: 0.85
    });
    assert.equal(passingRes.isImportAdmissible, true);
    assert.equal(passingRes.complianceChecklist.isFavnTiterCompliant, true);
  });

  it('catches animals under 3 months or with primary vaccine less than 30 days old', () => {
    // Under 3 months
    const youngRes = evaluatePetImportation({
      animalType: 'cat',
      animalAgeMonths: 2,
      countryOfOrigin: 'US',
      isVaccinatedForRabies: false
    });
    assert.equal(youngRes.isImportAdmissible, false);
    assert.ok(youngRes.statutoryViolations.some(v => v.rule.includes('Under Minimum Statutory Age')));

    // Primary vaccine only 10 days ago (< 30 days)
    const recentVacRes = evaluatePetImportation({
      animalType: 'dog',
      animalAgeMonths: 12,
      countryOfOrigin: 'US',
      destinationProvince: 'BC',
      dogBreed: 'poodle',
      isVaccinatedForRabies: true,
      vaccinationDateDaysAgo: 10,
      hasOfficialRabiesCertificate: true
    });
    assert.equal(recentVacRes.isImportAdmissible, false);
    assert.ok(recentVacRes.statutoryViolations.some(v => v.rule.includes('Primary Rabies Vaccine Waiting Period')));
  });

  it('rejects prohibited exotic species under Health of Animals Act', () => {
    const exoticRes = evaluatePetImportation({
      animalType: 'unsupported_exotic'
    });
    assert.equal(exoticRes.isImportAdmissible, false);
    assert.ok(exoticRes.statutoryViolations.some(v => v.rule.includes('Prohibited Exotic Species')));
  });
});
