// src/routes/tools/settlement.js
// Domain route handlers for settlement tools.

import { autoPopulateForm } from '../../official-forms.js';
import { calculateNewcomerBudget } from '../../newcomer-budget.js';
import { compareCities } from '../../city-comparison.js';
import { convertLanguageScores } from '../../language-score-clb.js';
import { evaluateCredentialLicensurePathway } from '../../credential-licensure-bridge.js';
import { evaluateCredentialPathway } from '../../credential-navigator.js';
import { evaluateCurrencyExchange } from '../../currency-exchange-navigator.js';
import { evaluateCustomsDeclaration } from '../../customs-declaration.js';
import { evaluateGovernmentEnrollment } from '../../sin-healthcare-navigator.js';
import { evaluateHealthcareEligibility } from '../../healthcare-navigator.js';
import { evaluateHealthcarePortabilityAndIfhp } from '../../healthcare-portability-navigator.js';
import { evaluateIdentityHarmonization } from '../../identity-harmonization.js';
import { evaluateIenSpepEligibility, evaluateImgPracticeReadyAssessment, evaluateFcrMicroLoans } from '../../fcr-healthcare-bridge-navigator.js';
import { evaluateInternationallyTrainedNurse } from '../../internationally-trained-nurse-navigator.js';
import { evaluateLicenceExchange } from '../../statutory-calculators.js';
import { evaluatePetImportation } from '../../pet-importation.js';
import { evaluateStatutoryTimeline } from '../../timeline-calendar-sync.js';
import { evaluateVehicleImportation } from '../../vehicle-importation.js';
import { generateSettlementJourney } from '../../settlement-journey.js';
import { todayIso } from '../../text-input.js';
import { validateNewcomerDocuments } from '../../document-validator.js';

export function handleSettlementGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/compare-cities') {
      const citiesParam = url.searchParams.get('cities')?.split(',').map(s=>s.trim()).filter(Boolean) || ['Toronto', 'Calgary'];
      const annualSalary = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 80000;
      const householdSize = url.searchParams.get('household') ? Number(url.searchParams.get('household')) : 1;
      return send(200, compareCities(citiesParam, { annualSalary, householdSize }));
    }

    if(path==='/v1/tools/settlement-journey') {
      const category = url.searchParams.get('category') || 'pr_express_entry';
      const city = url.searchParams.get('city') || 'Toronto';
      const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      return send(200, generateSettlementJourney(category, city, date));
    }

    if(path==='/v1/tools/newcomer-budget') {
      const city = url.searchParams.get('city') || 'Toronto';
      const household = url.searchParams.get('household') || 'single';
      const accommodation = url.searchParams.get('accommodation') || '1bed';
      const savingsCad = url.searchParams.get('savings') ? Number(url.searchParams.get('savings')) : 25000;
      const monthlyIncomeNet = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 0;
      return send(200, calculateNewcomerBudget({ city, household, accommodation, savingsCad, monthlyIncomeNet }));
    }

    if(path==='/v1/tools/healthcare-eligibility') {
      const province = url.searchParams.get('province') || 'ON';
      const immigrationStatus = url.searchParams.get('status') || 'pr';
      const workPermitDurationMonths = Number(url.searchParams.get('permitMonths') || 12);
      const hasEmploymentOffer = url.searchParams.get('hasJob') !== 'false';
      const landingDateStr = url.searchParams.get('date');
      const originCountry = url.searchParams.get('origin') || 'India';
      const householdSize = Number(url.searchParams.get('household') || 1);
      return send(200, evaluateHealthcareEligibility({ province, immigrationStatus, workPermitDurationMonths, hasEmploymentOffer, landingDateStr, originCountry, householdSize }));
    }

    if(path==='/v1/tools/licence-exchange') {
      const origin = url.searchParams.get('origin') || 'India';
      const destination = url.searchParams.get('destination') || 'ON';
      const years = url.searchParams.get('years') || '2plus';
      const docs = url.searchParams.get('docs') || 'extract';
      return send(200, evaluateLicenceExchange({ origin, destination, years, docs }));
    }

    if(path==='/v1/tools/validate-documents') {
      const landingDateStr = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      const immigrationStream = url.searchParams.get('stream') || 'pr_express_entry';
      const documents = [];
      if(url.searchParams.get('passportExpiry')) documents.push({ docType: 'passport', expiryDate: url.searchParams.get('passportExpiry') });
      if(url.searchParams.get('coprExpiry')) documents.push({ docType: 'copr', expiryDate: url.searchParams.get('coprExpiry') });
      if(url.searchParams.get('medicalDate')) documents.push({ docType: 'medical_exam', issueDate: url.searchParams.get('medicalDate') });
      if(url.searchParams.get('languageDate')) documents.push({ docType: 'language_test', issueDate: url.searchParams.get('languageDate') });
      if(url.searchParams.get('ecaDate')) documents.push({ docType: 'eca_report', issueDate: url.searchParams.get('ecaDate') });
      return send(200, validateNewcomerDocuments({ documents, landingDateStr, immigrationStream }));
    }

    if(path==='/v1/tools/credential-pathway') {
      const profession = url.searchParams.get('profession') || 'engineering';
      const targetProvince = url.searchParams.get('province') || 'ON';
      const originCountry = url.searchParams.get('origin') || 'India';
      const currentDegree = url.searchParams.get('degree') || 'Bachelors';
      return send(200, evaluateCredentialPathway({ profession, targetProvince, originCountry, currentDegree }));
    }

    if(path==='/v1/tools/customs-declaration') {
      const settlerStatus = url.searchParams.get('status') || 'pr';
      const currencyCad = url.searchParams.get('currency') ? Number(url.searchParams.get('currency')) : 0;
      return send(200, evaluateCustomsDeclaration({
        settlerStatus,
        currencyCad,
        items: [
          { category: 'electronics', description: 'Personal Laptop & Smartphone', valueCad: 2500, ownedMonths: 12, isAccompanying: true }
        ]
      }));
    }

    if(path==='/v1/tools/vehicle-import') {
      const countryOfOrigin = url.searchParams.get('origin') || 'US';
      const vehicleModelYear = url.searchParams.get('year') ? Number(url.searchParams.get('year')) : 2021;
      const vehicleType = url.searchParams.get('type') || 'passenger_car';
      const isOwnedAbroadAtLeastSixMonths = url.searchParams.get('owned6Months') !== 'false';
      const isTitledInImmigrantName = url.searchParams.get('inName') !== 'false';
      const hasOpenRecall = url.searchParams.get('openRecall') === 'true';
      const hasAirConditioning = url.searchParams.get('ac') !== 'false';
      const fuelEfficiencyLitersPer100Km = url.searchParams.get('fuelEfficiency') ? Number(url.searchParams.get('fuelEfficiency')) : 8.5;
      const destinationProvince = url.searchParams.get('province') || 'ON';
      const estimatedVehicleValueCad = url.searchParams.get('value') ? Number(url.searchParams.get('value')) : 25000;
      const settlerStatus = url.searchParams.get('status') || 'permanent_resident';
      return send(200, evaluateVehicleImportation({
        countryOfOrigin,
        vehicleModelYear,
        vehicleType,
        isOwnedAbroadAtLeastSixMonths,
        isTitledInImmigrantName,
        hasOpenRecall,
        hasAirConditioning,
        fuelEfficiencyLitersPer100Km,
        destinationProvince,
        estimatedVehicleValueCad,
        settlerStatus
      }));
    }

    if(path==='/v1/tools/pet-import') {
      const animalType = url.searchParams.get('type') || 'dog';
      const animalAgeMonths = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 18;
      const countryOfOrigin = url.searchParams.get('origin') || 'US';
      const isDesignatedHighRiskRabiesCountry = url.searchParams.get('highRisk') === 'true';
      const destinationProvince = url.searchParams.get('province') || 'ON';
      const dogBreed = url.searchParams.get('breed') || 'golden_retriever';
      const microchipStatus = url.searchParams.get('microchip') || 'iso_15_digit_implanted_before_rabies';
      const isVaccinatedForRabies = url.searchParams.get('vaccinated') !== 'false';
      const vaccinationDateDaysAgo = url.searchParams.get('vacDays') ? Number(url.searchParams.get('vacDays')) : 180;
      const hasOfficialRabiesCertificate = url.searchParams.get('hasCert') !== 'false';
      const hasFavnSerologyTiterTest = url.searchParams.get('hasFavn') === 'true';
      const titerResultIuPerMl = url.searchParams.get('titer') ? Number(url.searchParams.get('titer')) : 0.0;
      const isPersonalPetOwnedByImmigrant = url.searchParams.get('isPersonal') !== 'false';
      return send(200, evaluatePetImportation({
        animalType,
        animalAgeMonths,
        countryOfOrigin,
        isDesignatedHighRiskRabiesCountry,
        destinationProvince,
        dogBreed,
        microchipStatus,
        isVaccinatedForRabies,
        vaccinationDateDaysAgo,
        hasOfficialRabiesCertificate,
        hasFavnSerologyTiterTest,
        titerResultIuPerMl,
        isPersonalPetOwnedByImmigrant
      }));
    }

    if(path==='/v1/tools/identity-harmonization') {
      const discrepancyType = url.searchParams.get('discrepancy') || 'single_name_blank_surname';
      const currentStatusInCanada = url.searchParams.get('status') || 'permanent_resident';
      const residenceProvince = url.searchParams.get('province') || 'ON';
      const monthsLivedInProvince = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 14;
      const hasForeignPassportSingleName = url.searchParams.get('hasSingleName') !== 'false';
      const foreignCountryOfOrigin = url.searchParams.get('origin') || 'IN';
      const docsParam = url.searchParams.get('docs');
      const documentsShowingDiscrepancy = docsParam ? docsParam.split(',').map(s => s.trim()).filter(Boolean) : ['copr_pr_card', 'bank_accounts'];
      return send(200, evaluateIdentityHarmonization({
        discrepancyType,
        currentStatusInCanada,
        residenceProvince,
        monthsLivedInProvince,
        hasForeignPassportSingleName,
        foreignCountryOfOrigin,
        documentsShowingDiscrepancy
      }));
    }

    if(path==='/v1/tools/currency-exchange') {
      const amount = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 10000;
      const fromCurrency = url.searchParams.get('from') || 'USD';
      const toCurrency = url.searchParams.get('to') || 'CAD';
      const sourceOfFunds = url.searchParams.get('source') || 'savings_income';
      const isSplitIntoMultipleTranches = url.searchParams.get('split') === 'true';
      const trancheCount = url.searchParams.get('tranches') ? Number(url.searchParams.get('tranches')) : 1;
      const brokeragePlatform = url.searchParams.get('broker') || 'questrade';
      const hasCrossBorderAccount = url.searchParams.get('crossBorder') === 'true';
      return send(200, evaluateCurrencyExchange({
        amount,
        fromCurrency,
        toCurrency,
        sourceOfFunds,
        isSplitIntoMultipleTranches,
        trancheCount,
        brokeragePlatform,
        hasCrossBorderAccount
      }));
    }

    if(path==='/v1/tools/credential-licensure') {
      const profession = url.searchParams.get('profession') || 'software_engineer';
      const province = url.searchParams.get('province') || 'ON';
      const foreignDegreeLevel = url.searchParams.get('degree') || 'bachelors';
      const yearsOfForeignExperience = url.searchParams.get('exp') ? Number(url.searchParams.get('exp')) : 5;
      const hasEca = url.searchParams.get('hasEca') === 'true';
      const ecaOrganization = url.searchParams.get('eca') || 'WES';
      const officialLanguageClb = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 8;
      const hasInitiatedCollegeRegistration = url.searchParams.get('registered') === 'true';

      return send(200, evaluateCredentialLicensurePathway({
        profession,
        province,
        foreignDegreeLevel,
        yearsOfForeignExperience,
        hasEca,
        ecaOrganization,
        officialLanguageClb,
        hasInitiatedCollegeRegistration
      }));
    }

    if(path==='/v1/tools/healthcare-portability') {
      const targetProvince = url.searchParams.get('targetProvince') || 'ON';
      const originType = url.searchParams.get('originType') || 'outside_canada';
      const originProvince = url.searchParams.get('originProvince') || null;
      const immigrationStatus = url.searchParams.get('status') || 'closed_work_permit';
      const arrivalDate = url.searchParams.get('arrivalDate') || '2026-09-15';
      const workPermitDurationMonths = url.searchParams.get('permitMonths') ? Number(url.searchParams.get('permitMonths')) : 12;
      const hasFullTimeEmployerJobLetter6Months = url.searchParams.get('hasJobLetter') !== 'false';
      const isRefugeeClaimantWithIfhpCertificate = url.searchParams.get('isRefugee') === 'true';
      const applicantName = url.searchParams.get('applicant') || 'Newcomer';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateHealthcarePortabilityAndIfhp({
        targetProvince,
        originType,
        originProvince,
        immigrationStatus,
        arrivalDate,
        workPermitDurationMonths,
        hasFullTimeEmployerJobLetter6Months,
        isRefugeeClaimantWithIfhpCertificate,
        applicantName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/internationally-trained-nurse') {
      const countryOfEducation = url.searchParams.get('country') || 'Philippines';
      const nursingDesignation = url.searchParams.get('designation') || 'rn';
      const yearsOfClinicalExperience = url.searchParams.get('experienceYears') ? Number(url.searchParams.get('experienceYears')) : 5;
      const yearsSinceLastClinicalPractice = url.searchParams.get('yearsSincePractice') ? Number(url.searchParams.get('yearsSincePractice')) : 1;
      const languageProficiencyRoute = url.searchParams.get('langRoute') || 'ielts_academic';
      const ieltsOverallScore = url.searchParams.get('ieltsScore') ? Number(url.searchParams.get('ieltsScore')) : 7.5;
      const targetProvince = url.searchParams.get('province') || 'ON';
      const hasPassedNclex = url.searchParams.get('passedNclex') === 'true';
      const interestedInSpepSupervisedPractice = url.searchParams.get('spep') !== 'false';
      const nurseName = url.searchParams.get('name') || 'IEN Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateInternationallyTrainedNurse({
        countryOfEducation,
        nursingDesignation,
        yearsOfClinicalExperience,
        yearsSinceLastClinicalPractice,
        languageProficiencyRoute,
        ieltsOverallScore,
        targetProvince,
        hasPassedNclex,
        interestedInSpepSupervisedPractice,
        nurseName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/sin-healthcare') {
      const statusInCanada = url.searchParams.get('status') || 'work_permit';
      const province = url.searchParams.get('province') || 'ON';
      const studyPermitHasWorkCondition = url.searchParams.get('studyWork') !== 'false';
      const workPermitMinDurationMonths = url.searchParams.get('permitMonths') ? Number(url.searchParams.get('permitMonths')) : 12;
      const residencyDocumentsReady = url.searchParams.get('leaseReady') !== 'false';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateGovernmentEnrollment({
        statusInCanada,
        province,
        studyPermitHasWorkCondition,
        workPermitMinDurationMonths,
        residencyDocumentsReady,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/calendar-sync') {
      const milestoneType = url.searchParams.get('milestone') || 'work_permit_expiry';
      const anchorDate = url.searchParams.get('date') || '2026-12-31';
      const applicantName = url.searchParams.get('name') || 'Newcomer';
      return send(200, evaluateStatutoryTimeline({ milestoneType, anchorDate, applicantName }));
    }

    if(path==='/v1/tools/fcr-bridging') {
      const action = url.searchParams.get('action') || 'micro_loans';
      if (action === 'ien_spep') {
        const nnas = url.searchParams.get('nnas') !== 'false';
        return send(200, evaluateIenSpepEligibility({ hasNnasAdvisoryReport: nnas }));
      }
      if (action === 'img_pra') {
        const province = url.searchParams.get('province') || 'BC';
        return send(200, evaluateImgPracticeReadyAssessment({ targetProvince: province }));
      }
      const status = url.searchParams.get('status') || 'permanent_resident';
      const funding = url.searchParams.get('funding') ? Number(url.searchParams.get('funding')) : 12000;
      return send(200, evaluateFcrMicroLoans({ immigrationStatus: status, fundingRequiredCad: funding }));
    }

    if(path==='/v1/tools/city-comparison') {
      const citiesParam = url.searchParams.get('cities') || 'Toronto,Calgary';
      const cities = citiesParam.split(',').map(c => c.trim()).filter(Boolean);
      const salary = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 80000;
      const household = url.searchParams.get('household') ? Number(url.searchParams.get('household')) : 1;
      return send(200, compareCities(cities, { annualSalary: salary, householdSize: household }));
    }

    if(path==='/v1/tools/form-autopopulate') {
      const formType = url.searchParams.get('formType') ?? url.searchParams.get('type') ?? 'cbsa_bsf186';
      const overrides = Object.create(null);
      for (const [k, v] of url.searchParams.entries()) {
        if (!['formType', 'type', 'declarantDate'].includes(k)) overrides[k] = v;
      }
      return send(200, autoPopulateForm({ formType, fieldOverrides: overrides, declarantDate: url.searchParams.get('declarantDate') ?? undefined }));
    }

    if (path === '/v1/tools/language-score-clb') {
      return send(200,convertLanguageScores(Object.fromEntries(url.searchParams)));
    }

  return false;
}

export function handleSettlementPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/compare-cities') {
      const citiesParam = Array.isArray(input.cities) ? input.cities : ['Toronto', 'Calgary'];
      return send(200, compareCities(citiesParam, input));
    }

    if(path==='/v1/tools/settlement-journey') {
      return send(200, generateSettlementJourney(input.category, input.city, input.date));
    }

    if(path==='/v1/tools/newcomer-budget') {
      return send(200, calculateNewcomerBudget(input));
    }

    if(path==='/v1/tools/healthcare-eligibility') {
      return send(200, evaluateHealthcareEligibility(input));
    }

    if(path==='/v1/tools/licence-exchange') {
      return send(200, evaluateLicenceExchange(input));
    }

    if(path==='/v1/tools/validate-documents') {
      return send(200, validateNewcomerDocuments(input));
    }

    if(path==='/v1/tools/credential-pathway') {
      return send(200, evaluateCredentialPathway(input));
    }

    if(path==='/v1/tools/customs-declaration') {
      return send(200, evaluateCustomsDeclaration(input));
    }

    if(path==='/v1/tools/vehicle-import') {
      return send(200, evaluateVehicleImportation(input));
    }

    if(path==='/v1/tools/pet-import') {
      return send(200, evaluatePetImportation(input));
    }

    if(path==='/v1/tools/identity-harmonization') {
      return send(200, evaluateIdentityHarmonization(input));
    }

    if(path==='/v1/tools/currency-exchange') {
      return send(200, evaluateCurrencyExchange(input));
    }

    if (path === '/v1/tools/language-score-clb') {
      return send(200,convertLanguageScores(input));
    }

    if(path==='/v1/tools/credential-licensure') {
      return send(200, evaluateCredentialLicensurePathway(input));
    }

    if(path==='/v1/tools/healthcare-portability') {
      return send(200, evaluateHealthcarePortabilityAndIfhp(input));
    }

    if(path==='/v1/tools/internationally-trained-nurse') {
      return send(200, evaluateInternationallyTrainedNurse(input));
    }

    if(path==='/v1/tools/sin-healthcare') {
      return send(200, evaluateGovernmentEnrollment(input));
    }

    if(path==='/v1/tools/calendar-sync') {
      return send(200, evaluateStatutoryTimeline(input));
    }

    if(path==='/v1/tools/fcr-bridging') {
      const action = input.action || 'micro_loans';
      if (action === 'ien_spep') return send(200, evaluateIenSpepEligibility(input));
      if (action === 'img_pra') return send(200, evaluateImgPracticeReadyAssessment(input));
      return send(200, evaluateFcrMicroLoans(input));
    }

    if(path==='/v1/tools/city-comparison') {
      const cities = Array.isArray(input.cities) ? input.cities : (input.cities ? String(input.cities).split(',').map(c => c.trim()) : ['Toronto', 'Calgary']);
      const salary = input.annualSalary !== undefined ? Number(input.annualSalary) : (input.salary !== undefined ? Number(input.salary) : 80000);
      const household = input.householdSize !== undefined ? Number(input.householdSize) : (input.household !== undefined ? Number(input.household) : 1);
      return send(200, compareCities(cities, { annualSalary: salary, householdSize: household }));
    }

    if(path==='/v1/tools/form-autopopulate') {
      const formType = input.formType !== undefined ? input.formType : input.type !== undefined ? input.type : 'cbsa_bsf186';
      const fieldOverrides = input.fieldOverrides !== undefined ? input.fieldOverrides : input.fields !== undefined ? input.fields : Object.fromEntries(Object.entries(input).filter(([key]) => !['formType', 'type', 'declarantDate'].includes(key)));
      return send(200, autoPopulateForm({ formType, fieldOverrides, declarantDate: input.declarantDate }));
    }

  return false;
}
