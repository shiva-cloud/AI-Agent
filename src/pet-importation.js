// src/pet-importation.js
// Canadian Newcomer Pet & Animal Importation Diagnostic Engine.
// Audits pet import admissibility under the Health of Animals Act (S.C. 1990, c. 21),
// Health of Animals Regulations (C.R.C., c. 296), CFIA Automated Import Reference System (AIRS),
// Ontario Dog Owners' Liability Act (R.S.O. 1990, c. D.16 - Breed Specific Legislation / Pit Bull Ban),
// and CBSA Customs Tariff Item 9807.00.00 (duty-free personal pet settler exemption).
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD = 30; // CBSA border inspection fee
export const CFIA_ADDITIONAL_ANIMAL_INSPECTION_FEE_CAD = 5;
export const MIN_RABIES_VACCINATION_AGE_MONTHS = 3; // 12 weeks
export const MIN_PRIMARY_RABIES_WAITING_DAYS = 30;
export const MIN_RABIES_TITER_IU_PER_ML = 0.5;

export const BANNED_ONTARIO_BSL_BREEDS = [
  'pit_bull_terrier',
  'american_pit_bull_terrier',
  'american_staffordshire_terrier',
  'staffordshire_bull_terrier'
];

export const CFIA_HIGH_RISK_RABIES_COUNTRIES = [
  'AF', 'DZ', 'AO', 'BD', 'BY', 'BR', 'KH', 'CN', 'CO', 'CU', 'DO', 'EG',
  'ET', 'GE', 'GH', 'GT', 'HT', 'IN', 'ID', 'IR', 'IQ', 'JM', 'JO', 'KZ',
  'KE', 'LB', 'LY', 'MG', 'MY', 'MX', 'MA', 'MM', 'NP', 'NG', 'PK', 'PE',
  'PH', 'RU', 'SA', 'ZA', 'LK', 'SD', 'SY', 'TH', 'TN', 'TR', 'UA', 'UZ',
  'VE', 'VN', 'ZW'
];

export function evaluatePetImportation({
  animalType = 'dog', // 'dog', 'cat', 'service_dog', 'ferret', 'unsupported_exotic'
  animalAgeMonths = 18,
  countryOfOrigin = 'US',
  isDesignatedHighRiskRabiesCountry = false,
  destinationProvince = 'ON',
  dogBreed = 'golden_retriever', // 'golden_retriever', 'labrador', 'pit_bull_terrier', 'american_staffordshire_terrier', 'german_shepherd', 'other_non_banned'
  microchipStatus = 'iso_15_digit_implanted_before_rabies', // 'iso_15_digit_implanted_before_rabies', 'microchip_implanted_after_rabies', 'non_iso_microchip', 'no_microchip'
  isVaccinatedForRabies = true,
  vaccinationDateDaysAgo = 180,
  hasOfficialRabiesCertificate = true,
  hasFavnSerologyTiterTest = false,
  titerResultIuPerMl = 0.0,
  isPersonalPetOwnedByImmigrant = true,
  petName = 'Pet',
  assessmentDate = todayIso()
} = {}) {
  const safePetName = boundedText(petName, 'Pet', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const normType = boundedText(animalType, 'dog', 50).toLowerCase().trim();
  const normOrigin = boundedText(countryOfOrigin, 'US', 10).toUpperCase().trim();
  const normProvince = boundedText(destinationProvince, 'ON', 10).toUpperCase().trim();
  const normBreed = boundedText(dogBreed, 'other_non_banned', 80).toLowerCase().trim();
  const normMicrochip = boundedText(microchipStatus, 'iso_15_digit_implanted_before_rabies', 60).toLowerCase().trim();
  const ageMonths = Math.max(1, Math.min(600, Math.floor(Number(animalAgeMonths) || 1)));
  const vacDaysAgo = Math.max(0, Math.min(36500, Math.floor(Number(vaccinationDateDaysAgo) || 0)));
  const titerScore = Math.max(0, Math.min(1000, Number(titerResultIuPerMl) || 0));

  const designatedHighRisk = Boolean(isDesignatedHighRiskRabiesCountry);
  const vaccinatedForRabies = Boolean(isVaccinatedForRabies);
  const officialRabiesCert = Boolean(hasOfficialRabiesCertificate);
  const favnTiterTest = Boolean(hasFavnSerologyTiterTest);
  const personalPetSettler = Boolean(isPersonalPetOwnedByImmigrant);

  const violations = [];
  const statutoryAdvisories = [];
  let isImportAdmissible = true;
  let admissibilityVerdict = 'STATUTORILY_ADMISSIBLE';
  let summaryHeadline = '';

  const isHighRiskOrigin = designatedHighRisk || CFIA_HIGH_RISK_RABIES_COUNTRIES.includes(normOrigin);

  // 1. Unsupported Animals / Exotic Species Audit
  if (normType === 'unsupported_exotic') {
    isImportAdmissible = false;
    violations.push({
      rule: 'Prohibited Exotic Species Importation',
      statute: 'Health of Animals Act s. 14 & CITES Convention',
      legalFinding: 'Exotic wild animals, venomous reptiles, and non-human primates cannot be imported as personal pets into Canada.'
    });
  }

  // 2. Ontario Breed Specific Legislation (BSL) Audit (Dog Owners' Liability Act)
  const isBslBreed = BANNED_ONTARIO_BSL_BREEDS.includes(normBreed);
  if (normType === 'dog' && normProvince === 'ON' && isBslBreed) {
    isImportAdmissible = false;
    violations.push({
      rule: 'Ontario Statutory Pit Bull Ban (Breed Specific Legislation)',
      statute: 'Ontario Dog Owners\' Liability Act (R.S.O. 1990, c. D.16, s. 6)',
      legalFinding: `The declared breed (${normBreed.replace(/_/g, ' ')}) is legally banned under Ontario DOLA s. 6. Bringing a banned pit bull breed into Ontario results in statutory border seizure and mandatory euthanasia or permanent removal at owner expense. Destination MUST be changed to a province without BSL (e.g. Alberta or British Columbia).`
    });
  }

  // 3. Minimum Age and Rabies Vaccination Audit (Health of Animals Regulations s. 51)
  if (normType === 'dog' || normType === 'cat') {
    if (ageMonths < MIN_RABIES_VACCINATION_AGE_MONTHS) {
      isImportAdmissible = false;
      violations.push({
        rule: `Animal Under Minimum Statutory Age (${ageMonths} months < 3 months)`,
        statute: 'Health of Animals Regulations s. 51 & CFIA AIRS',
        legalFinding: 'Animals under 3 months of age cannot receive a valid rabies vaccination and are generally inadmissible from non-rabies-free countries.'
      });
    }

    if (!vaccinatedForRabies) {
      isImportAdmissible = false;
      violations.push({
        rule: 'Missing Mandatory Rabies Vaccination',
        statute: 'Health of Animals Regulations s. 51(1)',
        legalFinding: 'All dogs and cats entering Canada must have a valid rabies vaccination certified by a licensed veterinarian.'
      });
    } else {
      if (vacDaysAgo < MIN_PRIMARY_RABIES_WAITING_DAYS) {
        isImportAdmissible = false;
        violations.push({
          rule: `Primary Rabies Vaccine Waiting Period Not Met (${vacDaysAgo} days < 30 days)`,
          statute: 'CFIA AIRS Rabies Protocols',
          legalFinding: `Primary rabies vaccination requires a mandatory minimum 30-day waiting period prior to arrival in Canada (current: ${vacDaysAgo} days).`
        });
      }

      if (!officialRabiesCert) {
        isImportAdmissible = false;
        violations.push({
          rule: 'Invalid or Incomplete Rabies Certificate',
          statute: 'Health of Animals Regulations s. 51',
          legalFinding: 'Rabies certificate must be in English or French and explicitly state: animal breed/weight/color, microchip number, vaccine trade name and serial number, vaccination date, expiry date, and veterinarian license number.'
        });
      }
    }

    // 4. CFIA High-Risk Rabies Serology Titer Test Audit (FAVN)
    if (isHighRiskOrigin && normType === 'dog') {
      if (!favnTiterTest || titerScore < MIN_RABIES_TITER_IU_PER_ML) {
        isImportAdmissible = false;
        violations.push({
          rule: 'Missing or Sub-Threshold Rabies Serology Titer Test (FAVN)',
          statute: 'CFIA Commercial & Personal Dog Importation Policy from High-Risk Countries',
          legalFinding: `Dogs originating from designated high-risk rabies countries (${normOrigin}) must have an official FAVN rabies blood titer test result showing at least ${MIN_RABIES_TITER_IU_PER_ML} IU/mL (current: ${titerScore} IU/mL) processed by a CFIA-approved laboratory.`
        });
      }
    }

    // 5. Microchip Compliance Audit
    if (normMicrochip === 'no_microchip') {
      violations.push({
        rule: 'No Microchip Identified',
        statute: 'CFIA Animal Identification Standards',
        legalFinding: 'A 15-digit ISO 11784/11785 compliant microchip is required to verify animal identity against rabies certificates and serology tests.'
      });
    } else if (normMicrochip === 'microchip_implanted_after_rabies') {
      statutoryAdvisories.push('Microchip Sequence Warning: Microchip was implanted AFTER the rabies vaccine. CFIA border officers may require the animal to receive an authorized booster vaccination tied to the microchip number.');
    }
  }

  // 6. Border Fees & Settler Tariff 9807 Exemption Audit
  const borderInspectionFeeCad = CFIA_FIRST_ANIMAL_INSPECTION_FEE_CAD;
  const isSettlerTariffExempt = personalPetSettler;

  // 7. Final Verdict
  if (violations.length > 0) {
    admissibilityVerdict = 'STATUTORILY_INADMISSIBLE';
    summaryHeadline = `Inadmissible: ${violations.length} critical statutory import violation(s) detected under CFIA / DOLA regulations. Immediate border refusal or quarantine risk.`;
  } else {
    admissibilityVerdict = 'STATUTORILY_ADMISSIBLE';
    summaryHeadline = `Likely to meet entry requirements: based on your answers, your pet meets the CFIA rabies, microchip and provincial rules checked here and should qualify for duty-free entry as a personal pet (Tariff 9807.00.00). The border officer makes the final decision.`;
  }

  statutoryAdvisories.push(
    'CBSA Settler Effects Duty-Free Exemption (Tariff 9807.00.00): Personal companion animals owned abroad by arriving immigrants are completely exempt from customs duty and GST at the port of entry.',
    'CFIA Border Inspection Fee: CBSA border officers collect a mandatory $30.00 CAD (+ provincial tax) inspection fee for the first animal ($5.00 CAD per additional pet). Have a credit card ready at secondary inspection.',
    'IATA Live Animals Regulations (Airline Temperature Embargo): Most airlines refuse in-cabin or cargo transport of live animals if tarmac temperatures at origin, layover, or destination exceed 29°C or drop below 7°C.',
    'Service Animal Exemption: Certified guide and service dogs accompanying individuals with disabilities are exempt from CFIA inspection fees and quarantine requirements upon presenting accredited training documentation.',
    'Post-Arrival Municipal Pet Licencing: Most Canadian cities (Toronto, Vancouver, Mississauga, Calgary) statutorily mandate pet registration and licensing with the municipal animal services department within 30 days of arrival.'
  );

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    petName: safePetName,
    animalType: normType,
    dogBreed: normBreed,
    countryOfOrigin: normOrigin,
    destinationProvince: normProvince,
    isHighRiskRabiesCountry: isHighRiskOrigin,
    isImportAdmissible,
    admissibilityVerdict,
    summaryHeadline,
    borderFinancials: {
      isSettlerTariffExempt,
      customsDutyCad: 0,
      gstCad: 0,
      cfiaInspectionFeeCad: borderInspectionFeeCad,
      totalBorderPayableCad: borderInspectionFeeCad
    },
    complianceChecklist: {
      hasIsoMicrochip: normMicrochip.includes('iso'),
      isAgeCompliant: ageMonths >= MIN_RABIES_VACCINATION_AGE_MONTHS,
      isRabiesCompliant: vaccinatedForRabies && vacDaysAgo >= MIN_PRIMARY_RABIES_WAITING_DAYS && officialRabiesCert,
      isFavnTiterCompliant: !isHighRiskOrigin || (favnTiterTest && titerScore >= MIN_RABIES_TITER_IU_PER_ML),
      isOntarioBslCompliant: !(normType === 'dog' && normProvince === 'ON' && isBslBreed)
    },
    statutoryViolations: violations,
    statutoryAdvisories,
    statutoryAuthority: 'Health of Animals Act (S.C. 1990, c. 21) & Ontario Dog Owners\' Liability Act (R.S.O. 1990, c. D.16)'
  };
}
