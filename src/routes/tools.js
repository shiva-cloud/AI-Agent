// Calculator and navigator tool routes (/v1/tools/*). Results are preliminary and
// unreviewed: server.js adds X-Assessment-Type and X-Source-Review headers, meters
// plan usage and maps TypeError/RangeError from a tool to a 400 input error.
// Each handler returns true when it answered the request, false otherwise.
import { compareCities } from '../city-comparison.js';
import { generateSettlementJourney } from '../settlement-journey.js';
import { calculateNewcomerBudget } from '../newcomer-budget.js';
import { evaluateHealthcareEligibility } from '../healthcare-navigator.js';
import { evaluateLicenceExchange, calculateCreditTrajectory } from '../statutory-calculators.js';
import { validateNewcomerDocuments } from '../document-validator.js';
import { calculateNewcomerBenefits } from '../newcomer-benefits-calculator.js';
import { evaluateCredentialPathway } from '../credential-navigator.js';
import { auditLeaseAgreement } from '../lease-guard.js';
import { evaluateChildcareSupport } from '../childcare-navigator.js';
import { evaluateCustomsDeclaration } from '../customs-declaration.js';
import { evaluateHomebuyerEligibility } from '../housing-tax-navigator.js';
import { evaluateBankingAndCreditStrategy } from '../banking-navigator.js';
import { evaluateCitizenshipEligibility } from '../citizenship-navigator.js';
import { auditEvictionNotice } from '../eviction-defense.js';
import { evaluatePrResidencyObligation } from '../pr-residency-navigator.js';
import { evaluateMedicalAdmissibility } from '../medical-admissibility.js';
import { ValidationError } from '../api-errors.js';
import { auditWorkerClassificationAndWageTheft } from '../employment-standards.js';
import { evaluateVehicleImportation } from '../vehicle-importation.js';
import { evaluateStudentWorkCompliance } from '../student-compliance.js';
import { evaluateVulnerableWorkerProtection } from '../vulnerable-worker-defense.js';
import { evaluateSuperVisaAndFamilySponsorship } from '../super-visa-sponsor.js';
import { evaluatePetImportation } from '../pet-importation.js';
import { evaluateIdentityHarmonization } from '../identity-harmonization.js';
import { evaluateCurrencyExchange } from '../currency-exchange-navigator.js';
import { evaluateParentalLeave } from '../parental-leave-navigator.js';
import { evaluateExpressEntryCrs } from '../express-entry-optimizer.js';
import { evaluateBusinessStructure } from '../business-navigator.js';
import { evaluateProvincialNomineePathway } from '../pnp-navigator.js';
import { evaluateBowpPathway } from '../bowp-navigator.js';
import { evaluateLeaseAssignmentExit } from '../lease-assignment-navigator.js';
import { evaluateDebtCollectionDefense } from '../debt-collection-defense.js';
import { evaluateMovingExpensesDeduction } from '../moving-tax-navigator.js';
import { evaluateCredentialLicensurePathway } from '../credential-licensure-bridge.js';
import { evaluateTelecomDispute } from '../telecom-contract-defense.js';
import { evaluateFlagpolingFeasibility } from '../border-flagpoling-navigator.js';
import { evaluateRentIncreaseNotice } from '../rent-increase-defense.js';
import { evaluateWorkplaceDiscriminationAndConstructiveDismissal } from '../human-rights-defense.js';
import { evaluateHomebuyerTaxIncentives } from '../homebuyer-tax-incentives.js';
import { evaluateAutoInsuranceProfile } from '../auto-insurance-navigator.js';
import { evaluateEstatePlanProfile } from '../estate-planning-navigator.js';
import { evaluateSmallClaimsDispute } from '../small-claims-navigator.js';
import { evaluateVoluntaryDisclosure } from '../cra-voluntary-disclosure.js';
import { auditStatutoryPayAndWages } from '../statutory-pay-calculator.js';
import { evaluateConsumerContract } from '../consumer-protection-navigator.js';
import { evaluateFamilyLawAndSupport } from '../family-law-navigator.js';
import { evaluateSocialAssistance } from '../social-assistance-navigator.js';
import { evaluateTenancyRepairs } from '../tenancy-repairs-navigator.js';
import { evaluateCommercialLease } from '../commercial-lease-navigator.js';
import { auditEmploymentReferenceLetter } from '../employment-reference-audit.js';
import { evaluateConsumerCreditAgreement } from '../high-cost-credit-navigator.js';
import { evaluatePgwpEligibility } from '../pgwp-eligibility-navigator.js';
import { evaluateCrossBorderTaxObligations } from '../cross-border-tax-navigator.js';
import { evaluateWorkplaceSafetyAndRefusal } from '../workplace-safety-navigator.js';
import { evaluateTfwEmployerCompliance } from '../tfw-compliance-navigator.js';
import { evaluateHealthcarePortabilityAndIfhp } from '../healthcare-portability-navigator.js';
import { evaluateRealEstateAssignment } from '../real-estate-assignment-navigator.js';
import { evaluateOasGisEligibility } from '../oas-gis-navigator.js';
import { evaluateCriminalInadmissibilityAndRehab } from '../criminal-rehabilitation-navigator.js';
import { evaluateFranchiseDisclosure } from '../franchise-disclosure-navigator.js';
import { evaluateSowpEligibility } from '../sowp-eligibility-navigator.js';
import { evaluateEiDisqualificationAndAllocation } from '../ei-disqualification-navigator.js';
import { evaluateRuralRenewalEligibility } from '../rural-renewal-navigator.js';
import { evaluateSpeculationTaxAndRebates } from '../speculation-tax-rebate-navigator.js';
import { evaluateChildWelfareAndGuardianship } from '../child-welfare-guardianship-navigator.js';
import { evaluateExcessiveDemandMitigation } from '../excessive-demand-mitigation-navigator.js';
import { evaluateFrancophoneMobility } from '../francophone-mobility-navigator.js';
import { evaluatePlatformWorkerRights } from '../digital-platform-worker-navigator.js';
import { evaluateAtlanticImmigrationEligibility } from '../atlantic-immigration-navigator.js';
import { evaluateChildCareSubsidy } from '../childcare-subsidy-navigator.js';
import { evaluateBcStrataBylawDefense } from '../bc-strata-bylaw-navigator.js';
import { evaluatePrCardRenewalUrgent } from '../pr-card-renewal-urgent-navigator.js';
import { evaluateForeignWorkerTransition } from '../foreign-worker-transition-navigator.js';
import { evaluateChildDisabilityBenefit } from '../child-disability-benefit-navigator.js';
import { evaluateAlbertaSecurityDeposit } from '../alberta-tenancy-security-deposit-navigator.js';
import { evaluateInternationallyTrainedNurse } from '../internationally-trained-nurse-navigator.js';
import { evaluateAlbertaOpportunityStream } from '../alberta-opportunity-stream-navigator.js';
import { evaluateBcSpeculationTaxDeclaration } from '../bc-speculation-tax-declaration-navigator.js';
import { evaluatePrtdHumanitarian } from '../pr-travel-document-humanitarian-navigator.js';
import { evaluateStatutorySeveranceNotice } from '../statutory-severance-notice-navigator.js';
import { evaluateManitobaPnpSkilledWorker } from '../manitoba-pnp-skilled-worker-navigator.js';
import { evaluateSinpHardToFillSkills } from '../saskatchewan-sinp-hard-to-fill-navigator.js';
import { evaluateEsaReprisal } from '../ontario-employment-standards-reprisal-navigator.js';
import { auditBcSvtNoticeOfObjection } from '../british-columbia-speculation-tax-audit-appeal-navigator.js';
import { evaluateExpressEntryTieBreak } from '../express-entry-tie-breaking-navigator.js';
import { auditCalgarySecondarySuite } from '../calgary-secondary-suite-amnesty-navigator.js';
import { evaluateEsaConstructiveDismissalLayoff } from '../ontario-employment-constructive-dismissal-layoff-navigator.js';
import { evaluateNovaScotiaExperienceStream } from '../nova-scotia-experience-stream-navigator.js';
import { evaluateQuebecPeqTemporaryWorker } from '../quebec-peq-temporary-worker-navigator.js';
import { auditAlbertaCommercialDistress } from '../alberta-commercial-tenant-distress-navigator.js';
import { evaluateTrpCompellingBalance } from '../temporary-resident-permit-inadmissibility-navigator.js';
import { evaluateFederalSkilledTradesProgram } from '../federal-skilled-trades-navigator.js';
import { evaluateBcStrataEvCharging } from '../british-columbia-strata-ev-charging-navigator.js';
import { auditOntarioPayTransparencyAndPosting } from '../ontario-employment-pay-equity-transparency-navigator.js';
import { evaluateYukonCriticalImpactWorker } from '../yukon-nominee-critical-impact-worker-navigator.js';
import { evaluateForeignWorkerPermitTransition } from '../foreign-worker-closed-permit-transition-navigator.js';
import { evaluatePeiOccupationsInDemand } from '../pei-provincial-nominee-occupations-in-demand-navigator.js';
import { evaluateBcGroupTerminationNotice } from '../british-columbia-employment-severance-group-termination-navigator.js';
import { evaluateStartUpVisaEligibility } from '../federal-start-up-visa-designated-organization-navigator.js';
import { evaluateOntarioTenancyAssignmentSublet } from '../ontario-residential-tenancy-sublet-assignment-refusal-navigator.js';
import { evaluateNbpnpSkilledWorker } from '../new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { evaluateSelfEmployedProgram } from '../federal-self-employed-persons-program-navigator.js';
import { evaluateAlbertaOvertimeBanking } from '../alberta-employment-overtime-banking-navigator.js';
import { evaluateOntarioRoommateAndOccupantRights } from '../ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js';
import { evaluateSinpTechTalent } from '../saskatchewan-immigrant-nominee-tech-talent-navigator.js';
import { evaluateCaregiverDirectToPr } from '../federal-caregiver-direct-to-pr-pilot-navigator.js';
import { evaluateCitizenshipRevocationDefense } from '../federal-citizenship-revocation-defense-navigator.js';
import { evaluateBcRoommateAndSharedKitchen } from '../british-columbia-tenancy-roommate-shared-kitchen-navigator.js';
import { evaluateAlbertaRuralEntrepreneur } from '../alberta-alep-rural-entrepreneur-stream-navigator.js';
import { evaluateRefugeeCessationRisk } from '../federal-refugee-cessation-citizenship-audit-navigator.js';
import { evaluateOntarioRemoteWorkJurisdiction } from '../ontario-employment-remote-telework-jurisdiction-navigator.js';
import { evaluateManitobaEmploymentLeave } from '../manitoba-employment-leave-job-protection-navigator.js';
import { evaluateAlbertaTenancySubleaseAssignment } from '../alberta-residential-tenancy-sublease-assignment-navigator.js';
import { evaluateFrancophoneCommunityPilot } from '../federal-francophone-community-pilot-navigator.js';
import { evaluateBcChildYouthEmployment } from '../british-columbia-employment-child-youth-employment-navigator.js';
import { evaluateOntarioHousingCreedAccommodation } from '../ontario-human-rights-housing-creed-navigator.js';
import { auditCitizenshipPhysicalPresence } from '../federal-citizenship-residence-calculator-audit-navigator.js';
import { evaluateQuebecCsqSkilledWorker } from '../quebec-csq-skilled-worker-arrima-navigator.js';
import { auditAlbertaEmploymentRestPeriods } from '../alberta-employment-rest-periods-shift-limits-navigator.js';
import { auditBcStrataShortTermRental } from '../british-columbia-strata-short-term-rental-bylaw-navigator.js';
import { auditOntarioThaLicensing } from '../ontario-employment-temp-help-agency-licensing-navigator.js';
import { evaluateFederalIntraCompanyTransferee } from '../federal-c14-intra-company-transferee-navigator.js';
import { evaluateSaskatchewanLayoffNotice } from '../saskatchewan-employment-layoff-notice-severance-navigator.js';
import { evaluateAlbertaAbandonedGoods } from '../alberta-residential-tenancy-abandoned-goods-distress-navigator.js';
import { auditBcEmploymentUniformAndDeductions } from '../british-columbia-employment-uniform-equipment-deduction-navigator.js';
import { evaluateFederalVisitorExtensionAndRestoration } from '../federal-visitor-record-extension-status-restoration-navigator.js';
import { evaluateBcTechPilotEligibility } from '../british-columbia-pnp-skills-immigration-tech-navigator.js';
import { auditOntarioTemporaryLayoff } from '../ontario-employment-temp-layoff-constructive-dismissal-navigator.js';
import { evaluateFederalC10SignificantBenefit } from '../federal-c10-significant-benefit-work-permit-navigator.js';
import { auditAlbertaTerminationJustCause } from '../alberta-employment-termination-just-cause-audit-navigator.js';
import { evaluateManitobaRentIncrease } from '../manitoba-residential-tenancy-rent-increase-guideline-navigator.js';
import { evaluateFederalReciprocalEmployment } from '../federal-c20-reciprocal-employment-work-permit-navigator.js';
import { evaluateBcLandlordUseEviction } from '../british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';
import { calculateOntarioStatutorySeverance } from '../ontario-employment-severance-payroll-calculation-navigator.js';
import { evaluateAlbertaLandlordEntry } from '../alberta-residential-tenancy-landlord-entry-notice-navigator.js';
import { evaluateDualIntentCompliance } from '../federal-work-permit-dual-intent-assessment-navigator.js';
import { evaluateFederalC11EntrepreneurWorkPermit } from '../federal-c11-entrepreneur-self-employed-work-permit-navigator.js';
import { evaluateAlbertaMaternityParentalLeave } from '../alberta-employment-maternity-parental-leave-navigator.js';
import { evaluateOntarioUrgentRepairsT6 } from '../ontario-residential-tenancy-urgent-repairs-t6-navigator.js';
import { evaluateBcIllnessInjuryLeave } from '../british-columbia-employment-illness-injury-leave-navigator.js';
import { evaluateFederalFrancophoneMobilityC16 } from '../federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalBridgingOpenWorkPermit } from '../federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';
import { evaluateOntarioRentDepositInterest } from '../ontario-residential-tenancy-rent-deposit-interest-navigator.js';
import { evaluateAlbertaGeneralHolidayPay } from '../alberta-employment-general-holiday-pay-navigator.js';
import { evaluateBcStrataDepreciationReport } from '../british-columbia-strata-depreciation-report-reserve-fund-navigator.js';
import { evaluateFederalFtaProfessionalWorkPermit } from '../federal-c12-gats-professional-fta-navigator.js';
import { evaluateOntarioEmploymentReprisal } from '../ontario-employment-reprisal-complaint-navigator.js';
import { evaluateBcSecurityDepositDoublePenalty } from '../british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';
import { evaluateAlbertaConstructiveDismissal } from '../alberta-employment-constructive-dismissal-salary-reduction-navigator.js';
import { evaluateFederalSuvPeerReview } from '../federal-start-up-visa-peer-review-navigator.js';
import { evaluateSaskatchewanSecurityDepositReturn } from '../saskatchewan-residential-tenancy-security-deposit-return-navigator.js';
import { evaluateOntarioIllegalEntryT2 } from '../ontario-residential-tenancy-illegal-entry-t2-navigator.js';
import { evaluateBcOvertimeBanking } from '../british-columbia-employment-overtime-banking-navigator.js';
import { evaluateAlbertaPeriodicTenancyNotice } from '../alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';
import { evaluateFederalSuperVisaInsuranceLico } from '../federal-parent-grandparent-super-visa-medical-insurance-navigator.js';
import { evaluateManitobaGeneralHolidayPay } from '../manitoba-employment-statutory-holiday-pay-navigator.js';
import { evaluateFederalCaregiverPrPathway } from '../federal-caregiver-pr-pathway-experience-navigator.js';
import { evaluateOntarioPublicHolidayPay } from '../ontario-employment-public-holiday-pay-calculation-navigator.js';
import { evaluateBcRtbDisputeTrack } from '../british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';
import { evaluateAlbertaYouthEmploymentRules } from '../alberta-employment-youth-employment-rules-navigator.js';
import { evaluateFederalStudentOffCampusWork } from '../federal-study-permit-off-campus-work-hours-navigator.js';
import { evaluateStudyPermitCapAndPal } from '../study-permit-cap-pal-navigator.js';
import { evaluateVisitorVisaTies } from '../visitor-visa-financial-ties-navigator.js';
import { evaluateLmiaReadiness } from '../lmia-readiness-navigator.js';
import { evaluateGovernmentEnrollment } from '../sin-healthcare-navigator.js';
import { evaluatePrMatrix } from '../pr-matrix-simulator.js';
import { evaluateFamilyReunification } from '../family-reunification-navigator.js';
import { evaluateTaxShield } from '../tax-shield-optimizer.js';
import { evaluateStatutoryTimeline } from '../timeline-calendar-sync.js';
import { NOTICE_TYPES, STATUTORY_METADATA, generateLegalNotice } from '../legal-notice-generator.js';
import { evaluatePortOfEntryRights } from '../poe-rights-navigator.js';
import { evaluateStudyToPrPathway } from '../study-to-pr-navigator.js';
import { analyzeGcmsRefusalNotes } from '../gcms-refusal-analyzer.js';
import { evaluateGlobalVisaPathways } from '../global-visa-matrix.js';
import { calculateMovingTaxDeduction } from '../moving-tax-calculator.js';
import { calculateSeveranceAndNotice } from '../severance-bardal-calculator.js';
import { evaluateUsH1bOptStatus } from '../us-h1b-opt-navigator.js';
import { evaluateUkSkilledWorkerAndIlr } from '../uk-skilled-worker-ilr-navigator.js';
import { evaluateSuperVisaAndPgp } from '../super-visa-lico-navigator.js';
import { evaluateAustraliaReforms, evaluateGermanyChancenkarteAndTenancy } from '../australia-germany-global-navigator.js';
import { auditAustralianTenancy } from '../australia-tenancy-tribunal-navigator.js';
import { auditUsStateTenancy } from '../us-state-tenancy-navigator.js';
import { auditUkDevolvedTenancy } from '../uk-tenancy-devolved-navigator.js';
import { auditUaeTenancy } from '../uae-tenancy-dispute-navigator.js';
import { evaluateNewcomerWealthPlan } from '../cra-newcomer-wealth-navigator.js';
import { auditBcTenancyNotice, evaluateOntarioSharedKitchenBathroomJurisdiction, auditOntarioFormN12Notice, evaluateOntarioT1RefundClaim, auditOntarioRentIncrease } from '../ontario-bc-tenancy-navigator.js';
import { evaluateUaeGratuityAndWps, auditDubaiReraEvictionNotice, evaluateNewZealandAewvAndTenancy, evaluateIrelandCsepAndRpz, evaluateSingaporeCompassPass } from '../global-expat-navigator.js';
import { auditFlagpolingEligibility, auditDliAuthorizedLeave, evaluateCriminalInadmissibility, evaluateRestorationOfStatus } from '../canada-status-admissibility-guard.js';
import { calculateVacationPayStepUp, calculatePublicHolidayPay, evaluateEsaStatutorySeverance, auditContractorMisclassification, auditEqualPayForEqualWork, calculateOntarioOvertimePay } from '../esa-wage-theft-navigator.js';
import { auditCanadianExperienceBarriers, auditOhsaWorkRefusalAndReprisal, auditWsibInjuryClaimDeadline, auditConstructiveDismissal } from '../workplace-rights-defense-navigator.js';
import { auditEiVoluntaryQuitJustCause, evaluateEiParentalAndSicknessBenefits, evaluateEiRegularBenefits } from '../ei-benefits-navigator.js';
import { evaluateIenSpepEligibility, evaluateImgPracticeReadyAssessment, evaluateFcrMicroLoans } from '../fcr-healthcare-bridge-navigator.js';
import { autoPopulateForm } from '../official-forms.js';
import { convertLanguageScores } from '../language-score-clb.js';
import { evaluateProofOfFunds } from '../proof-of-funds.js';

import { todayIso } from '../text-input.js';
export function handleToolGet(ctx) {
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
    if(path==='/v1/tools/credit-simulator') {
      const limit = url.searchParams.get('limit') ?? 2000;
      const spend = url.searchParams.get('spend') ?? 450;
      const strategy = url.searchParams.get('strategy') ?? 'full_on_time';
      const inquiries = url.searchParams.get('inquiries') ?? 1;
      return send(200, calculateCreditTrajectory({ limit, spend, strategy, inquiries }));
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
    if(path==='/v1/tools/cra-benefits') {
      const province = url.searchParams.get('province') || 'ON';
      const adjustedFamilyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 30000;
      const maritalStatus = url.searchParams.get('marital') || 'single';
      const childrenUnder6Count = Number(url.searchParams.get('under6') || 0);
      const children6to17Count = Number(url.searchParams.get('over6') || 0);
      const landingDateStr = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      return send(200, calculateNewcomerBenefits({ province, adjustedFamilyNetIncomeCad, maritalStatus, childrenUnder6Count, children6to17Count, landingDateStr }));
    }
    if(path==='/v1/tools/credential-pathway') {
      const profession = url.searchParams.get('profession') || 'engineering';
      const targetProvince = url.searchParams.get('province') || 'ON';
      const originCountry = url.searchParams.get('origin') || 'India';
      const currentDegree = url.searchParams.get('degree') || 'Bachelors';
      return send(200, evaluateCredentialPathway({ profession, targetProvince, originCountry, currentDegree }));
    }
    if(path==='/v1/tools/lease-guard') {
      const province = url.searchParams.get('province') || 'ON';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const standardFormUsed = url.searchParams.get('standardForm') !== 'false';
      const rentDepositMonths = Number(url.searchParams.get('rentDepositMonths') || 1);
      const damageDepositCad = Number(url.searchParams.get('damageDeposit') || 0);
      const keyDepositCad = Number(url.searchParams.get('keyDeposit') || 50);
      const clausesParam = url.searchParams.get('clauses');
      const clausesPresent = clausesParam ? clausesParam.split(',') : [];
      const customClauseText = url.searchParams.get('customText') || '';
      return send(200, auditLeaseAgreement({
        province,
        monthlyRentCad,
        standardFormUsed,
        depositDemands: { rentDepositMonths, damageDepositCad, keyDepositCad },
        clausesPresent,
        customClauseText
      }));
    }
    if(path==='/v1/tools/childcare-support') {
      const city = url.searchParams.get('city') || 'Toronto';
      const annualFamilyIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 0;
      const immigrationStatus = url.searchParams.get('status') || 'pr';
      const ageGroup = url.searchParams.get('ageGroup') || 'toddler';
      return send(200, evaluateChildcareSupport({
        city,
        annualFamilyIncomeCad,
        immigrationStatus,
        children: [{ ageGroup }]
      }));
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
    if(path==='/v1/tools/homebuyer-eligibility') {
      const purchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 750000;
      const province = url.searchParams.get('province') || 'ON';
      const city = url.searchParams.get('city') || 'Toronto';
      const immigrationStatus = url.searchParams.get('status') || 'pr';
      const workPermitDaysRemaining = url.searchParams.get('wpDays') ? Number(url.searchParams.get('wpDays')) : 365;
      const isFirstTimeHomeBuyer = url.searchParams.get('isFthb') !== 'false';
      const isSpouseCanadianOrPr = url.searchParams.get('spouseExempt') === 'true';
      return send(200, evaluateHomebuyerEligibility({
        purchasePriceCad,
        province,
        city,
        immigrationStatus,
        workPermitDaysRemaining,
        isFirstTimeHomeBuyer,
        isSpouseCanadianOrPr
      }));
    }
    if(path==='/v1/tools/banking-comparator') {
      const selectedBank = url.searchParams.get('bank') || 'all';
      const monthlySpendingCad = url.searchParams.get('spend') ? Number(url.searchParams.get('spend')) : 600;
      const targetCreditScore = url.searchParams.get('target') ? Number(url.searchParams.get('target')) : 720;
      const hasPostpaidPhonePlan = url.searchParams.get('phone') !== 'false';
      const immigrationCategory = url.searchParams.get('status') || 'pr';
      return send(200, evaluateBankingAndCreditStrategy({
        selectedBank,
        monthlySpendingCad,
        targetCreditScore,
        hasPostpaidPhonePlan,
        immigrationCategory
      }));
    }
    if(path==='/v1/tools/citizenship-calculator') {
      const applicationDate = url.searchParams.get('appDate') || null;
      const prLandingDate = url.searchParams.get('landingDate') || '2024-01-01';
      const prePrDaysPresent = url.searchParams.get('prePrDays') ? Number(url.searchParams.get('prePrDays')) : 0;
      const postPrDaysAbsent = url.searchParams.get('absences') ? Number(url.searchParams.get('absences')) : 0;
      const taxYearsFiledCount = url.searchParams.get('taxes') ? Number(url.searchParams.get('taxes')) : 3;
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 32;
      const languageProofType = url.searchParams.get('langProof') || 'celpip';
      const hasCriminalProhibitions = url.searchParams.get('prohibitions') === 'true';
      return send(200, evaluateCitizenshipEligibility({
        applicationDate,
        prLandingDate,
        prePrDaysPresent,
        postPrDaysAbsent,
        taxYearsFiledCount,
        applicantAge,
        languageProofType,
        hasCriminalProhibitions
      }));
    }
    if(path==='/v1/tools/eviction-defense') {
      const noticeFormType = url.searchParams.get('formType') || 'N12';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const noticeServedDate = url.searchParams.get('servedDate') || '2026-05-01';
      const terminationDate = url.searchParams.get('termDate') || '2026-06-30';
      const wasStatutoryCompensationPaid = url.searchParams.get('paid') === 'true';
      const compensationPaidDate = url.searchParams.get('paidDate') || null;
      const isLandlordACorporation = url.searchParams.get('corp') === 'true';
      const intendedOccupant = url.searchParams.get('occupant') || 'landlord';
      const buildingUnitCount = url.searchParams.get('units') ? Number(url.searchParams.get('units')) : 1;
      const allegedRentArrearsCad = url.searchParams.get('arrears') ? Number(url.searchParams.get('arrears')) : 0;
      const includesIllegalCharges = url.searchParams.get('illegalCharges') === 'true';
      const coercedOrMisrepresented = url.searchParams.get('coerced') === 'true';
      return send(200, auditEvictionNotice({
        noticeFormType,
        monthlyRentCad,
        noticeServedDate,
        terminationDate,
        wasStatutoryCompensationPaid,
        compensationPaidDate,
        isLandlordACorporation,
        intendedOccupant,
        buildingUnitCount,
        allegedRentArrearsCad,
        includesIllegalCharges,
        coercedOrMisrepresented
      }));
    }
    if(path==='/v1/tools/pr-residency') {
      const assessmentDate = url.searchParams.get('assessmentDate') || null;
      const prLandingDate = url.searchParams.get('landingDate') || '2022-01-01';
      const prCardExpiryDate = url.searchParams.get('expiryDate') || '2027-01-01';
      const physicalDaysInsideCanada = url.searchParams.get('daysInside') ? Number(url.searchParams.get('daysInside')) : 600;
      const overseasDaysWithCitizenSpouse = url.searchParams.get('spouseDays') ? Number(url.searchParams.get('spouseDays')) : 0;
      const overseasDaysCanadianBusinessEmployment = url.searchParams.get('businessDays') ? Number(url.searchParams.get('businessDays')) : 0;
      const overseasDaysAccompanyingPrEmployedAbroad = url.searchParams.get('prOverseasDays') ? Number(url.searchParams.get('prOverseasDays')) : 0;
      const isCurrentlyInsideCanada = url.searchParams.get('inCanada') !== 'false';
      const hasUrgentTravelBooked = url.searchParams.get('urgent') === 'true';
      const urgentTravelDate = url.searchParams.get('travelDate') || null;
      const urgentTravelReason = url.searchParams.get('urgentReason') || 'none';
      return send(200, evaluatePrResidencyObligation({
        assessmentDate,
        prLandingDate,
        prCardExpiryDate,
        physicalDaysInsideCanada,
        overseasDaysWithCitizenSpouse,
        overseasDaysCanadianBusinessEmployment,
        overseasDaysAccompanyingPrEmployedAbroad,
        isCurrentlyInsideCanada,
        hasUrgentTravelBooked,
        urgentTravelDate,
        urgentTravelReason
      }));
    }
    if(path==='/v1/tools/medical-admissibility') {
      const immigrationStream = url.searchParams.get('stream') || 'express_entry';
      const hasDangerToPublicHealth = url.searchParams.get('dangerHealth') === 'true';
      const hasDangerToPublicSafety = url.searchParams.get('dangerSafety') === 'true';
      const conditionName = url.searchParams.get('condition') || 'Chronic Condition';
      const estimatedAnnualMedicationCostCad = url.searchParams.get('medCost') ? Number(url.searchParams.get('medCost')) : 4500;
      const estimatedAnnualHospitalizationCostCad = url.searchParams.get('hospitalCost') ? Number(url.searchParams.get('hospitalCost')) : 0;
      const estimatedAnnualSocialServicesCostCad = url.searchParams.get('socialCost') ? Number(url.searchParams.get('socialCost')) : 0;
      const hasPrivateInsuranceCoverage = url.searchParams.get('hasInsurance') !== 'false';
      const privateInsuranceAnnualCoverageCad = url.searchParams.get('insuranceCoverage') ? Number(url.searchParams.get('insuranceCoverage')) : 5000;
      const availableLiquidFundsCad = url.searchParams.get('liquidFunds') ? Number(url.searchParams.get('liquidFunds')) : 35000;
      const receivedProceduralFairnessLetter = url.searchParams.get('receivedPfl') === 'true';
      const pflDateReceived = url.searchParams.get('pflDate') || null;
      return send(200, evaluateMedicalAdmissibility({
        immigrationStream,
        hasDangerToPublicHealth,
        hasDangerToPublicSafety,
        conditionName,
        estimatedAnnualMedicationCostCad,
        estimatedAnnualHospitalizationCostCad,
        estimatedAnnualSocialServicesCostCad,
        hasPrivateInsuranceCoverage,
        privateInsuranceAnnualCoverageCad,
        availableLiquidFundsCad,
        receivedProceduralFairnessLetter,
        pflDateReceived
      }));
    }
    if(path==='/v1/tools/worker-classification') {
      for(const key of ['province','hourlyRate','weeklyHours','weeks','holidaysWorked','setSchedule','provideTools','noSubcontract','noRisk','exclusive','paidVacation','paidOvertime'])if(!url.searchParams.has(key)||!url.searchParams.get(key).trim())throw new ValidationError('Missing worker fact: '+key);
      for(const key of ['setSchedule','provideTools','noSubcontract','noRisk','exclusive','paidVacation','paidOvertime'])if(!['true','false'].includes(url.searchParams.get(key)))throw new ValidationError(key+' must be true or false');
      const province = url.searchParams.get('province') || 'ON';
      const jobTitle = url.searchParams.get('jobTitle') || 'Contract Specialist';
      const hourlyRateCad = url.searchParams.get('hourlyRate') ? Number(url.searchParams.get('hourlyRate')) : 25;
      const averageWeeklyHoursWorked = url.searchParams.get('weeklyHours') ? Number(url.searchParams.get('weeklyHours')) : 50;
      const weeksWorkedTotal = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 52;
      const contractLabelsWorkerAs = url.searchParams.get('contractLabel') || 'independent_contractor';
      const employerSetsScheduleAndLocation = url.searchParams.get('setSchedule') !== 'false';
      const employerProvidesToolsAndLaptop = url.searchParams.get('provideTools') !== 'false';
      const workerCannotHireSubcontractors = url.searchParams.get('noSubcontract') !== 'false';
      const workerHasNoRiskOfFinancialLoss = url.searchParams.get('noRisk') !== 'false';
      const workerWorksExclusivelyForEmployer = url.searchParams.get('exclusive') !== 'false';
      const wasVacationPayPaid = url.searchParams.get('paidVacation') === 'true';
      const wasOvertimePayPaid = url.searchParams.get('paidOvertime') === 'true';
      const publicHolidaysWorkedCount = url.searchParams.get('holidaysWorked') ? Number(url.searchParams.get('holidaysWorked')) : 5;
      return send(200, auditWorkerClassificationAndWageTheft({
        province,
        jobTitle,
        hourlyRateCad,
        averageWeeklyHoursWorked,
        weeksWorkedTotal,
        contractLabelsWorkerAs,
        employerSetsScheduleAndLocation,
        employerProvidesToolsAndLaptop,
        workerCannotHireSubcontractors,
        workerHasNoRiskOfFinancialLoss,
        workerWorksExclusivelyForEmployer,
        wasVacationPayPaid,
        wasOvertimePayPaid,
        publicHolidaysWorkedCount
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
    if(path==='/v1/tools/student-compliance') {
      const enrollmentStatus = url.searchParams.get('status') || 'full_time';
      const weeklyHoursWorked = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 20;
      const isDliDesignated = url.searchParams.get('dli') !== 'false';
      const hasSocialInsuranceNumber = url.searchParams.get('sin') !== 'false';
      const studyPermitConditionAllowsWork = url.searchParams.get('permitWork') !== 'false';
      const hasAuthorizedLeaveApprovalLetter = url.searchParams.get('leaveLetter') === 'true';
      const leaveDurationDays = url.searchParams.get('leaveDays') ? Number(url.searchParams.get('leaveDays')) : 0;
      const hasMaintainedContinuousFullTimeEnrollment = url.searchParams.get('continuous') !== 'false';
      const programType = url.searchParams.get('program') || 'university_degree';
      const isFieldOfStudyInPriorityShortage = url.searchParams.get('priorityField') !== 'false';
      const officialLanguageClbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 7;
      return send(200, evaluateStudentWorkCompliance({
        enrollmentStatus,
        weeklyHoursWorked,
        isDliDesignated,
        hasSocialInsuranceNumber,
        studyPermitConditionAllowsWork,
        hasAuthorizedLeaveApprovalLetter,
        leaveDurationDays,
        hasMaintainedContinuousFullTimeEnrollment,
        programType,
        isFieldOfStudyInPriorityShortage,
        officialLanguageClbScore
      }));
    }
    if(path==='/v1/tools/vulnerable-worker') {
      const currentPermitType = url.searchParams.get('permit') || 'closed_employer_specific_work_permit';
      const groundsParam = url.searchParams.get('grounds');
      const abuseGrounds = groundsParam ? groundsParam.split(',').map(s => s.trim()).filter(Boolean) : ['illegal_recruitment_fees'];
      const recruitmentFeesPaidCad = url.searchParams.get('fees') ? Number(url.searchParams.get('fees')) : 0;
      const unpaidWagesOrKickbacksCad = url.searchParams.get('wages') ? Number(url.searchParams.get('wages')) : 0;
      const hasEvidenceDocs = url.searchParams.get('hasDocs') !== 'false';
      const evidenceParam = url.searchParams.get('evidence');
      const evidenceTypesHeld = evidenceParam ? evidenceParam.split(',').map(s => s.trim()).filter(Boolean) : ['text_messages_whatsapp'];
      const workProvince = url.searchParams.get('province') || 'ON';
      return send(200, evaluateVulnerableWorkerProtection({
        currentPermitType,
        abuseGrounds,
        recruitmentFeesPaidCad,
        unpaidWagesOrKickbacksCad,
        hasEvidenceDocs,
        evidenceTypesHeld,
        workProvince
      }));
    }
    if(path==='/v1/tools/super-visa-sponsor') {
      const pathway = url.searchParams.get('pathway') || 'super_visa';
      const sponsorStatus = url.searchParams.get('status') || 'permanent_resident';
      const sponsorFamilySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 2;
      const invitedParentsCount = url.searchParams.get('parents') ? Number(url.searchParams.get('parents')) : 2;
      const sponsorLine15000IncomeYear1 = url.searchParams.get('y1') ? Number(url.searchParams.get('y1')) : 65000;
      const sponsorLine15000IncomeYear2 = url.searchParams.get('y2') ? Number(url.searchParams.get('y2')) : 0;
      const sponsorLine15000IncomeYear3 = url.searchParams.get('y3') ? Number(url.searchParams.get('y3')) : 0;
      const hasCoSigner = url.searchParams.get('hasCoSigner') === 'true';
      const coSignerRelationship = url.searchParams.get('coSignerRel') || 'spouse_or_common_law';
      const coSignerLine15000IncomeYear1 = url.searchParams.get('coY1') ? Number(url.searchParams.get('coY1')) : 0;
      const coSignerLine15000IncomeYear2 = url.searchParams.get('coY2') ? Number(url.searchParams.get('coY2')) : 0;
      const coSignerLine15000IncomeYear3 = url.searchParams.get('coY3') ? Number(url.searchParams.get('coY3')) : 0;
      const coverageAmountCad = url.searchParams.get('insAmount') ? Number(url.searchParams.get('insAmount')) : 100000;
      const durationDays = url.searchParams.get('insDays') ? Number(url.searchParams.get('insDays')) : 365;
      const isCanadianOrApprovedForeignProvider = url.searchParams.get('insApproved') !== 'false';
      const hasPreExistingCoverage = url.searchParams.get('insPreExisting') !== 'false';
      const isRefundableIfDenied = url.searchParams.get('insRefundable') !== 'false';
      return send(200, evaluateSuperVisaAndFamilySponsorship({
        pathway,
        sponsorStatus,
        sponsorFamilySize,
        invitedParentsCount,
        sponsorLine15000IncomeYear1,
        sponsorLine15000IncomeYear2,
        sponsorLine15000IncomeYear3,
        hasCoSigner,
        coSignerRelationship,
        coSignerLine15000IncomeYear1,
        coSignerLine15000IncomeYear2,
        coSignerLine15000IncomeYear3,
        medicalInsurance: {
          hasMedicalInsuranceQuote: true,
          coverageAmountCad,
          durationDays,
          isCanadianOrApprovedForeignProvider,
          hasPreExistingCoverage,
          isRefundableIfDenied
        }
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
    if(path==='/v1/tools/parental-leave') {
      const province = url.searchParams.get('province') || 'ON';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const insurableHoursWorkedPast52Weeks = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 700;
      const annualGrossSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 60000;
      const leaveType = url.searchParams.get('leaveType') || 'maternity_and_parental';
      const parentalOption = url.searchParams.get('option') || 'standard';
      const isSharingWithPartner = url.searchParams.get('sharing') !== 'false';
      const employerServiceWeeks = url.searchParams.get('serviceWeeks') ? Number(url.searchParams.get('serviceWeeks')) : 16;
      const workPermitExpiryDate = url.searchParams.get('expiryDate') || null;
      return send(200, evaluateParentalLeave({
        province,
        immigrationStatus,
        insurableHoursWorkedPast52Weeks,
        annualGrossSalaryCad,
        leaveType,
        parentalOption,
        isSharingWithPartner,
        employerServiceWeeks,
        workPermitExpiryDate
      }));
    }
    if(path==='/v1/tools/express-entry-crs') {
      const age = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 29;
      const educationLevel = url.searchParams.get('education') || 'masters';
      const clb = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 9;
      const canadianWorkExperienceYears = url.searchParams.get('cdnExp') ? Number(url.searchParams.get('cdnExp')) : 1;
      const foreignWorkExperienceYears = url.searchParams.get('foreignExp') ? Number(url.searchParams.get('foreignExp')) : 3;
      const isMarried = url.searchParams.get('married') === 'true';
      const hasProvincialNomination = url.searchParams.get('pnp') === 'true';
      const hasArrangedEmploymentLmia = url.searchParams.get('lmia') === 'true';
      const canadianEducationLevel = url.searchParams.get('cdnStudy') || 'post_secondary_3_plus_years';
      const hasSiblingInCanada = url.searchParams.get('sibling') === 'true';
      const frenchNclcLevel = url.searchParams.get('french') ? Number(url.searchParams.get('french')) : 0;
      const occupationCategory = url.searchParams.get('category') || 'stem';
      return send(200, evaluateExpressEntryCrs({
        age,
        educationLevel,
        firstLanguageClb: clb,
        canadianWorkExperienceYears,
        foreignWorkExperienceYears,
        isMarried,
        hasProvincialNomination,
        hasArrangedEmploymentLmia,
        canadianEducationLevel,
        hasSiblingInCanada,
        frenchNclcLevel,
        occupationCategory
      }));
    }
    if(path==='/v1/tools/business-structure') {
      const province = url.searchParams.get('province') || 'ON';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const workPermitType = url.searchParams.get('permitType') || 'none';
      const projectedAnnualRevenueCad = url.searchParams.get('revenue') ? Number(url.searchParams.get('revenue')) : 120000;
      const annualBusinessExpensesCad = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 15000;
      const personalLivingExpensesCad = url.searchParams.get('living') ? Number(url.searchParams.get('living')) : 55000;
      const clientCount = url.searchParams.get('clients') ? Number(url.searchParams.get('clients')) : 2;
      const subcontractorHiringPermitted = url.searchParams.get('subcontractors') !== 'false';
      const providesOwnEquipmentAndTools = url.searchParams.get('ownTools') !== 'false';
      const hasRiskOfFinancialLoss = url.searchParams.get('riskOfLoss') !== 'false';
      const industryType = url.searchParams.get('industry') || 'tech_consulting';
      return send(200, evaluateBusinessStructure({
        province,
        immigrationStatus,
        workPermitType,
        projectedAnnualRevenueCad,
        annualBusinessExpensesCad,
        personalLivingExpensesCad,
        clientCount,
        subcontractorHiringPermitted,
        providesOwnEquipmentAndTools,
        hasRiskOfFinancialLoss,
        industryType
      }));
    }
    if(path==='/v1/tools/pnp-pathway') {
      const targetProvince = url.searchParams.get('province') || 'BC';
      const nocCode = url.searchParams.get('noc') || '21231';
      const hourlyWage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 35;
      const hasFullTimeJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const hasActiveExpressEntryProfile = url.searchParams.get('ee') === 'true';
      const expressEntryCrsScore = url.searchParams.get('crs') ? Number(url.searchParams.get('crs')) : 450;
      const yearsOfDirectExperience = url.searchParams.get('exp') ? Number(url.searchParams.get('exp')) : 3;
      const hasOneYearCanadianExperience = url.searchParams.get('cdnExp') !== 'false';
      const currentlyWorkingForBcEmployer = url.searchParams.get('worksInBc') !== 'false';
      const educationLevel = url.searchParams.get('education') || 'bachelors';
      const completedBcEducation = url.searchParams.get('bcEdu') === 'true';
      const completedCanadianEducationOutsideBc = url.searchParams.get('cdnEduOutside') === 'true';
      const hasProfessionalDesignationBc = url.searchParams.get('designation') === 'true';
      const clbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 8;
      const isBilingualEnglishAndFrench = url.searchParams.get('bilingual') === 'true';
      const jobLocationArea = url.searchParams.get('area') || 'area_1_metro_van';
      const hasRegionalEducationOrExperience = url.searchParams.get('regionalExp') === 'true';
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const liquidSavingsCad = url.searchParams.get('savings') ? Number(url.searchParams.get('savings')) : 25000;

      return send(200, evaluateProvincialNomineePathway({
        targetProvince,
        nocCode,
        hourlyWage,
        hasFullTimeJobOffer,
        hasActiveExpressEntryProfile,
        expressEntryCrsScore,
        yearsOfDirectExperience,
        hasOneYearCanadianExperience,
        currentlyWorkingForBcEmployer,
        educationLevel,
        completedBcEducation,
        completedCanadianEducationOutsideBc,
        hasProfessionalDesignationBc,
        clbLevel,
        isBilingualEnglishAndFrench,
        jobLocationArea,
        hasRegionalEducationOrExperience,
        familySize,
        liquidSavingsCad
      }));
    }
    if(path==='/v1/tools/bowp-diagnostic') {
      const currentPermitType = url.searchParams.get('permitType') || 'pgwp';
      const permitExpiryDate = url.searchParams.get('expiryDate') || '2026-12-31';
      const isPhysicallyInCanada = url.searchParams.get('insideCanada') !== 'false';
      const prProgramApplied = url.searchParams.get('prProgram') || 'express_entry_cec';
      const hasOfficialAor = url.searchParams.get('aor') === 'true';
      const pnpNominationHasEmployerRestrictions = url.searchParams.get('pnpRestrictions') === 'true';
      const pnpProvince = url.searchParams.get('province') || 'BC';
      const hasSpouse = url.searchParams.get('hasSpouse') === 'true';
      const principalTeerLevel = url.searchParams.get('teer') || 'teer_1';
      const principalHasPayStubs = url.searchParams.get('payStubs') !== 'false';

      return send(200, evaluateBowpPathway({
        currentPermitType,
        permitExpiryDate,
        isPhysicallyInCanada,
        prProgramApplied,
        hasOfficialAor,
        pnpNominationHasEmployerRestrictions,
        pnpProvince,
        hasSpouse,
        principalTeerLevel,
        principalHasPayStubs
      }));
    }
    if(path==='/v1/tools/lease-assignment') {
      const province = url.searchParams.get('province') || 'ON';
      const leaseType = url.searchParams.get('leaseType') || 'fixed_term';
      const requestType = url.searchParams.get('requestType') || 'assignment';
      const requestStage = url.searchParams.get('stage') || 'not_yet_requested';
      const requestDate = url.searchParams.get('requestDate') || new Date().toISOString().slice(0, 10);
      const daysSinceRequest = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 0;
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2400;
      const landlordDemandedPenaltyCad = url.searchParams.get('penalty') ? Number(url.searchParams.get('penalty')) : 0;
      const landlordDemandedAssignmentFeeCad = url.searchParams.get('fee') ? Number(url.searchParams.get('fee')) : 0;
      const leaseEndDate = url.searchParams.get('leaseEnd') || null;

      return send(200, evaluateLeaseAssignmentExit({
        province,
        leaseType,
        requestType,
        requestStage,
        requestDate,
        daysSinceRequest,
        monthlyRentCad,
        landlordDemandedPenaltyCad,
        landlordDemandedAssignmentFeeCad,
        leaseEndDate
      }));
    }
    if(path==='/v1/tools/debt-collection-defense') {
      const province = url.searchParams.get('province') || 'ON';
      const debtType = url.searchParams.get('debtType') || 'telecom';
      const lastPaymentOrDefaultDate = url.searchParams.get('defaultDate') || '2022-01-01';
      const allegedDebtAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 1200;
      const collectionAgencyName = url.searchParams.get('agency') || 'Collection Agency';
      const receivedWrittenNoticeOfCollection = url.searchParams.get('writtenNotice') !== 'false';
      const callsInPastWeek = url.searchParams.get('calls') ? Number(url.searchParams.get('calls')) : 1;
      const calledEmployer = url.searchParams.get('calledEmployer') === 'true';
      const calledFamilyOrFriends = url.searchParams.get('calledFamily') === 'true';
      const threatenedImmigrationOrDeportation = url.searchParams.get('threatenedImmigration') === 'true';
      const threatenedImmediateArrestOrLawsuit = url.searchParams.get('threatenedLawsuit') === 'true';
      const calledOutsidePermittedHours = url.searchParams.get('outsideHours') === 'true';

      return send(200, evaluateDebtCollectionDefense({
        province,
        debtType,
        lastPaymentOrDefaultDate,
        allegedDebtAmountCad,
        collectionAgencyName,
        receivedWrittenNoticeOfCollection,
        callsInPastWeek,
        calledEmployer,
        calledFamilyOrFriends,
        threatenedImmigrationOrDeportation,
        threatenedImmediateArrestOrLawsuit,
        calledOutsidePermittedHours
      }));
    }
    if(path==='/v1/tools/moving-tax-deduction') {
      const province = url.searchParams.get('province') || 'ON';
      const relocationPurpose = url.searchParams.get('purpose') || 'employment';
      const oldCountry = url.searchParams.get('oldCountry') || 'United States';
      const oldCity = url.searchParams.get('oldCity') || 'Seattle';
      const newCity = url.searchParams.get('newCity') || 'Vancouver';
      const distanceKm = url.searchParams.get('distance') ? Number(url.searchParams.get('distance')) : 230;
      const householdSize = url.searchParams.get('householdSize') ? Number(url.searchParams.get('householdSize')) : 1;
      const arrivalDateStr = url.searchParams.get('arrivalDate') || '2026-08-01';
      const canadianIncomeEarnedInYearCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 35000;
      const travelExpensesCad = url.searchParams.get('travel') ? Number(url.searchParams.get('travel')) : 1800;
      const moversAndShippingCad = url.searchParams.get('shipping') ? Number(url.searchParams.get('shipping')) : 4500;
      const temporaryLivingDays = url.searchParams.get('livingDays') ? Number(url.searchParams.get('livingDays')) : 12;
      const temporaryLivingDailyCostCad = url.searchParams.get('livingDaily') ? Number(url.searchParams.get('livingDaily')) : 180;
      const leaseCancellationPenaltyCad = url.searchParams.get('leasePenalty') ? Number(url.searchParams.get('leasePenalty')) : 1200;
      const utilityAndAddressChangeFeesCad = url.searchParams.get('utilityFees') ? Number(url.searchParams.get('utilityFees')) : 350;
      const otherIncidentalCostsCad = url.searchParams.get('incidentals') ? Number(url.searchParams.get('incidentals')) : 200;
      const employerReimbursementCad = url.searchParams.get('reimbursement') ? Number(url.searchParams.get('reimbursement')) : 0;
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : null;

      return send(200, evaluateMovingExpensesDeduction({
        province,
        relocationPurpose,
        oldCountry,
        oldCity,
        newCity,
        distanceKm,
        householdSize,
        arrivalDateStr,
        canadianIncomeEarnedInYearCad,
        travelExpensesCad,
        moversAndShippingCad,
        temporaryLivingDays,
        temporaryLivingDailyCostCad,
        leaseCancellationPenaltyCad,
        utilityAndAddressChangeFeesCad,
        otherIncidentalCostsCad,
        employerReimbursementCad,
        marginalTaxRatePercent
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
    if(path === '/v1/tools/telecom-contract-defense') {
      const providerName = url.searchParams.get('provider') || 'Rogers';
      const serviceType = url.searchParams.get('service') || 'mobile';
      const contractType = url.searchParams.get('contractType') || 'postpaid_device_financing';
      const daysSinceContractStart = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 10;
      const hasDisability = url.searchParams.get('disability') === 'true';
      const monthlyPlanCostCad = url.searchParams.get('planCost') ? Number(url.searchParams.get('planCost')) : 65;
      const deviceSubsidyTotalCad = url.searchParams.get('subsidy') ? Number(url.searchParams.get('subsidy')) : 800;
      const monthsIntoContract = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 1;
      const dataOverageChargedCad = url.searchParams.get('dataOverage') ? Number(url.searchParams.get('dataOverage')) : 0;
      const roamingChargedCad = url.searchParams.get('roaming') ? Number(url.searchParams.get('roaming')) : 0;
      const unlockedDeviceFeeChargedCad = url.searchParams.get('unlockFee') ? Number(url.searchParams.get('unlockFee')) : 0;
      const disputedChargesTotalCad = url.searchParams.get('disputed') ? Number(url.searchParams.get('disputed')) : 120;
      const providerUnilateralPriceIncrease = url.searchParams.get('priceIncrease') === 'true';
      const refusedTrialCancellation = url.searchParams.get('refusedTrial') === 'true';
      const deviceInOriginalCondition = url.searchParams.get('deviceCondition') !== 'damaged';

      return send(200, evaluateTelecomDispute({
        providerName,
        serviceType,
        contractType,
        daysSinceContractStart,
        hasDisability,
        monthlyPlanCostCad,
        deviceSubsidyTotalCad,
        monthsIntoContract,
        dataOverageChargedCad,
        roamingChargedCad,
        unlockedDeviceFeeChargedCad,
        disputedChargesTotalCad,
        providerUnilateralPriceIncrease,
        refusedTrialCancellation,
        deviceInOriginalCondition
      }));
    }
    if(path==='/v1/tools/border-flagpoling') {
      const permitCategory = url.searchParams.get('permit') || 'pgwp';
      const countryOfCitizenship = url.searchParams.get('citizenship') || 'IN';
      const currentStatusInCanada = url.searchParams.get('status') || 'maintained_status';
      const portOfEntry = url.searchParams.get('port') || 'rainbow_bridge';
      const dayOfWeek = url.searchParams.get('day') || 'Wednesday';
      const hasJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const hasApprovedLmia = url.searchParams.get('approvedLmia') === 'true';
      const isLmiaExempt = url.searchParams.get('lmiaExempt') === 'true';
      const hasMedicalExamIfRequired = url.searchParams.get('medical') !== 'false';
      const hasValidUsVisa = url.searchParams.get('usVisa') === 'true';
      const hasPriorRefusals = url.searchParams.get('priorRefusals') === 'true';

      return send(200, evaluateFlagpolingFeasibility({
        permitCategory,
        countryOfCitizenship,
        currentStatusInCanada,
        portOfEntry,
        dayOfWeek,
        hasJobOffer,
        hasApprovedLmia,
        isLmiaExempt,
        hasMedicalExamIfRequired,
        hasValidUsVisa,
        hasPriorRefusals
      }));
    }
    if(path==='/v1/tools/rent-increase-defense') {
      const province = url.searchParams.get('province') || 'ON';
      const firstOccupiedDate = url.searchParams.get('firstOccupied') || '2017-06-01';
      const currentMonthlyRentCad = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 2200;
      const proposedMonthlyRentCad = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 2400;
      const noticeServedDate = url.searchParams.get('noticeServed') || '2026-05-01';
      const effectiveDate = url.searchParams.get('effectiveDate') || '2026-08-01';
      const lastIncreaseDate = url.searchParams.get('lastIncrease') || '2025-08-01';
      const officialFormUsed = url.searchParams.get('form') || 'N1';
      const isAgiClaimed = url.searchParams.get('agi') === 'true';
      const agiReason = url.searchParams.get('agiReason') || 'capital_expenditures';
      const hasLtbOrderBeenIssued = url.searchParams.get('ltbOrder') === 'true';
      const unresolvedMaintenanceDefects = url.searchParams.get('maintenanceDefects') === 'true';

      return send(200, evaluateRentIncreaseNotice({
        province,
        firstOccupiedDate,
        currentMonthlyRentCad,
        proposedMonthlyRentCad,
        noticeServedDate,
        effectiveDate,
        lastIncreaseDate,
        officialFormUsed,
        isAgiClaimed,
        agiReason,
        hasLtbOrderBeenIssued,
        unresolvedMaintenanceDefects
      }));
    }
    if(path==='/v1/tools/human-rights-defense') {
      const jurisdiction = url.searchParams.get('jurisdiction') || 'ON';
      const groundsParam = url.searchParams.get('grounds');
      const protectedGrounds = groundsParam ? groundsParam.split(',') : ['place_of_origin', 'citizenship'];
      const conductParam = url.searchParams.get('conduct');
      const conductTypes = conductParam ? conductParam.split(',') : ['canadian_experience_requirement'];
      const daysSinceLastIncident = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 30;
      const hasReportedInternally = url.searchParams.get('reported') === 'true';
      const employerResponse = url.searchParams.get('response') || 'none';
      const annualSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 80000;
      const yearsOfService = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 3;
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 35;

      return send(200, evaluateWorkplaceDiscriminationAndConstructiveDismissal({
        jurisdiction,
        protectedGrounds,
        conductTypes,
        daysSinceLastIncident,
        hasReportedInternally,
        employerResponse,
        annualSalaryCad,
        yearsOfService,
        applicantAge
      }));
    }
    if(path==='/v1/tools/homebuyer-tax-incentives') {
      const province = url.searchParams.get('province') || 'ON';
      const city = url.searchParams.get('city') || 'Toronto';
      const homePurchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 750000;
      const isFirstTimeHomeBuyer = url.searchParams.get('fthb') !== 'false';
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : 35.0;
      const a1Income = url.searchParams.get('a1Income') ? Number(url.searchParams.get('a1Income')) : 85000;
      const a1Rrsp = url.searchParams.get('a1Rrsp') ? Number(url.searchParams.get('a1Rrsp')) : 45000;
      const a1Fhsa = url.searchParams.get('a1Fhsa') ? Number(url.searchParams.get('a1Fhsa')) : 16000;
      const hasSpouse = url.searchParams.get('spouse') === 'true';
      const a2Income = url.searchParams.get('a2Income') ? Number(url.searchParams.get('a2Income')) : 65000;
      const a2Rrsp = url.searchParams.get('a2Rrsp') ? Number(url.searchParams.get('a2Rrsp')) : 25000;
      const a2Fhsa = url.searchParams.get('a2Fhsa') ? Number(url.searchParams.get('a2Fhsa')) : 8000;
      const plannedPurchaseYear = url.searchParams.get('year') ? Number(url.searchParams.get('year')) : 2026;

      return send(200, evaluateHomebuyerTaxIncentives({
        province,
        city,
        homePurchasePriceCad,
        isFirstTimeHomeBuyer,
        marginalTaxRatePercent,
        applicant1: {
          annualIncomeCad: a1Income,
          rrspBalanceCad: a1Rrsp,
          fhsaBalanceCad: a1Fhsa,
          fhsaYearsActive: 2
        },
        hasSpouseOrPartner: hasSpouse,
        applicant2: {
          annualIncomeCad: a2Income,
          rrspBalanceCad: a2Rrsp,
          fhsaBalanceCad: a2Fhsa,
          fhsaYearsActive: 1
        },
        plannedPurchaseYear
      }));
    }
    if(path==='/v1/tools/auto-insurance') {
      const province = url.searchParams.get('province') || 'ON';
      const postalCode = url.searchParams.get('postalCode') || 'L6Y 1A1';
      const annualGrossIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 75000;
      const employmentStatus = url.searchParams.get('employment') || 'employed';
      const weeksEmployedPast52 = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 52;
      const foreignDrivingYears = url.searchParams.get('foreignYears') ? Number(url.searchParams.get('foreignYears')) : 5;
      const hasForeignExperienceLetter = url.searchParams.get('experienceLetter') === 'true';
      const canadianLicenceClass = url.searchParams.get('licenceClass') || 'G';
      const optionalIrbEndorsementWeeklyCad = url.searchParams.get('irbWeekly') ? Number(url.searchParams.get('irbWeekly')) : 400;
      const experiencedRefusalOrUnreasonableDelay = url.searchParams.get('refusal') === 'true';

      return send(200, evaluateAutoInsuranceProfile({
        province,
        postalCode,
        annualGrossIncomeCad,
        employmentStatus,
        weeksEmployedPast52,
        foreignDrivingYears,
        hasForeignExperienceLetter,
        canadianLicenceClass,
        optionalIrbEndorsementWeeklyCad,
        experiencedRefusalOrUnreasonableDelay
      }));
    }
    if(path==='/v1/tools/estate-planning') {
      const province = url.searchParams.get('province') || 'ON';
      const maritalStatus = url.searchParams.get('maritalStatus') || 'married';
      const hasChildren = url.searchParams.get('hasChildren') !== 'false';
      const childrenCount = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 1;
      const hasMinorChildren = url.searchParams.get('hasMinors') !== 'false';
      const canadianRealEstateCad = url.searchParams.get('realEstate') ? Number(url.searchParams.get('realEstate')) : 800000;
      const realEstateOwnershipStructure = url.searchParams.get('ownership') || 'joint_tenancy';
      const canadianRegisteredAccountsCad = url.searchParams.get('registered') ? Number(url.searchParams.get('registered')) : 100000;
      const hasDesignatedBeneficiariesOnRegisteredAccounts = url.searchParams.get('beneficiaries') !== 'false';
      const canadianBankAccountsAndLiquidCad = url.searchParams.get('liquid') ? Number(url.searchParams.get('liquid')) : 50000;
      const hasForeignRealEstateOrAssets = url.searchParams.get('foreignAssets') === 'true';
      const foreignAssetsValueCad = url.searchParams.get('foreignVal') ? Number(url.searchParams.get('foreignVal')) : 0;
      const foreignCountry = url.searchParams.get('foreignCountry') || 'United States';
      const hasExistingForeignWill = url.searchParams.get('foreignWill') === 'true';
      const hasCanadianWill = url.searchParams.get('canadianWill') === 'true';
      const hasContinuingPowerOfAttorneyProperty = url.searchParams.get('cpoa') === 'true';
      const hasPowerOfAttorneyPersonalCare = url.searchParams.get('poapc') === 'true';
      const namedExecutorLocation = url.searchParams.get('executorLoc') || 'canadian_resident';

      return send(200, evaluateEstatePlanProfile({
        province,
        maritalStatus,
        hasChildren,
        childrenCount,
        hasMinorChildren,
        canadianRealEstateCad,
        realEstateOwnershipStructure,
        canadianRegisteredAccountsCad,
        hasDesignatedBeneficiariesOnRegisteredAccounts,
        canadianBankAccountsAndLiquidCad,
        hasForeignRealEstateOrAssets,
        foreignAssetsValueCad,
        foreignCountry,
        hasExistingForeignWill,
        hasCanadianWill,
        hasContinuingPowerOfAttorneyProperty,
        hasPowerOfAttorneyPersonalCare,
        namedExecutorLocation
      }));
    }
    if(path==='/v1/tools/small-claims') {
      const province = url.searchParams.get('province') || 'ON';
      const claimAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 12000;
      const disputeType = url.searchParams.get('disputeType') || 'breach_of_contract';
      const dateCauseOfActionArose = url.searchParams.get('incidentDate') || '2025-10-01';
      const defendantType = url.searchParams.get('defendantType') || 'business';
      const defendantName = url.searchParams.get('defendantName') || 'Acme Renovations Inc.';
      const plaintiffName = url.searchParams.get('plaintiffName') || 'Claimant';
      const hasSentDemandLetter = url.searchParams.get('sentDemand') === 'true';
      const prejudgmentInterestRatePercent = url.searchParams.get('pjiRate') ? Number(url.searchParams.get('pjiRate')) : 4.0;
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();

      return send(200, evaluateSmallClaimsDispute({
        province,
        claimAmountCad,
        disputeType,
        dateCauseOfActionArose,
        defendantType,
        defendantName,
        plaintiffName,
        hasSentDemandLetter,
        prejudgmentInterestRatePercent,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/cra-voluntary-disclosure') {
      const landingYear = url.searchParams.get('landingYear') ? Number(url.searchParams.get('landingYear')) : 2022;
      const taxYearsOmitted = url.searchParams.get('years') ? url.searchParams.get('years').split(',').map(Number) : [2023, 2024];
      const maxForeignCostAmountCad = url.searchParams.get('foreignCost') ? Number(url.searchParams.get('foreignCost')) : 175000;
      const foreignIncomeAnnualCad = url.searchParams.get('foreignIncome') ? Number(url.searchParams.get('foreignIncome')) : 8000;
      const hasCraContactedOrAudited = url.searchParams.get('craContacted') === 'true';
      const hasActiveOffshoreEntitiesOrShellCompanies = url.searchParams.get('offshoreShell') === 'true';
      const hasT1135BeenFiled = url.searchParams.get('t1135Filed') === 'true';
      const unreportedDomesticIncomeCad = url.searchParams.get('domesticIncome') ? Number(url.searchParams.get('domesticIncome')) : 0;
      const assessmentYear = url.searchParams.get('assessmentYear') ? Number(url.searchParams.get('assessmentYear')) : 2026;
      return send(200, evaluateVoluntaryDisclosure({
        landingYear,
        taxYearsOmitted,
        maxForeignCostAmountCad,
        foreignIncomeAnnualCad,
        hasCraContactedOrAudited,
        hasActiveOffshoreEntitiesOrShellCompanies,
        hasT1135BeenFiled,
        unreportedDomesticIncomeCad,
        assessmentYear
      }));
    }
    if(path==='/v1/tools/statutory-pay') {
      const province = url.searchParams.get('province') || 'ON';
      const grossHourlyWageCad = url.searchParams.get('hourlyWage') ? Number(url.searchParams.get('hourlyWage')) : 22.0;
      const hoursWorkedInPayPeriod = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 88;
      const tenureYears = url.searchParams.get('tenure') ? Number(url.searchParams.get('tenure')) : 2.0;
      const payPeriodWeeks = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 2;
      const statutoryHolidaysInPeriod = url.searchParams.get('holidays') ? Number(url.searchParams.get('holidays')) : 1;
      const workedOnStatHoliday = url.searchParams.get('workedHoliday') === 'true';
      const hoursWorkedOnStatHoliday = url.searchParams.get('holidayHours') ? Number(url.searchParams.get('holidayHours')) : 0;
      const unauthorizedDeductionsCad = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 0;
      const deductionReason = url.searchParams.get('deductionReason') || 'none';
      const vacationPayPaidCad = url.searchParams.get('vacationPaid') ? Number(url.searchParams.get('vacationPaid')) : 0;

      return send(200, auditStatutoryPayAndWages({
        province,
        grossHourlyWageCad,
        hoursWorkedInPayPeriod,
        tenureYears,
        payPeriodWeeks,
        statutoryHolidaysInPeriod,
        workedOnStatHoliday,
        hoursWorkedOnStatHoliday,
        unauthorizedDeductionsCad,
        deductionReason,
        vacationPayPaidCad
      }));
    }
    if(path==='/v1/tools/consumer-protection') {
      const province = url.searchParams.get('province') || 'ON';
      const contractType = url.searchParams.get('type') || 'water_heater_rental';
      const contractDate = url.searchParams.get('contractDate') || '2026-10-25';
      const contractValueCad = url.searchParams.get('value') ? Number(url.searchParams.get('value')) : 4800;
      const wasUnsolicitedInHomeVisit = url.searchParams.get('unsolicited') !== 'false';
      const prescribedBannedProduct = url.searchParams.get('bannedProduct') !== 'false';
      const hasUnfairPractices = url.searchParams.get('unfair') === 'true';
      const unfairPracticeType = url.searchParams.get('unfairType') || 'none';
      const missingMandatoryDisclosures = url.searchParams.get('missingDisclosures') === 'true';
      const consumerName = url.searchParams.get('consumerName') || 'Consumer';
      const supplierName = url.searchParams.get('supplierName') || 'Eco-Comfort Home Services Inc.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();

      return send(200, evaluateConsumerContract({
        province,
        contractType,
        contractDate,
        contractValueCad,
        wasUnsolicitedInHomeVisit,
        prescribedBannedProduct,
        hasUnfairPractices,
        unfairPracticeType,
        missingMandatoryDisclosures,
        consumerName,
        supplierName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/family-law') {
      const province = url.searchParams.get('province') || 'ON';
      const maritalStatus = url.searchParams.get('status') || 'married';
      const cohabitationYears = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 8.0;
      const numberOfChildren = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 2;
      const payerGrossAnnualIncomeCad = url.searchParams.get('payerIncome') ? Number(url.searchParams.get('payerIncome')) : 95000;
      const recipientGrossAnnualIncomeCad = url.searchParams.get('recipientIncome') ? Number(url.searchParams.get('recipientIncome')) : 45000;
      const parentingArrangement = url.searchParams.get('parenting') || 'primary_custody';
      const payerValuationDateAssetsCad = url.searchParams.get('payerAssets') ? Number(url.searchParams.get('payerAssets')) : 350000;
      const payerDateOfMarriageDeductionsCad = url.searchParams.get('payerDomDed') ? Number(url.searchParams.get('payerDomDed')) : 50000;
      const payerDebtsValuationDateCad = url.searchParams.get('payerDebts') ? Number(url.searchParams.get('payerDebts')) : 40000;
      const recipientValuationDateAssetsCad = url.searchParams.get('recipientAssets') ? Number(url.searchParams.get('recipientAssets')) : 120000;
      const recipientDateOfMarriageDeductionsCad = url.searchParams.get('recipientDomDed') ? Number(url.searchParams.get('recipientDomDed')) : 20000;
      const recipientDebtsValuationDateCad = url.searchParams.get('recipientDebts') ? Number(url.searchParams.get('recipientDebts')) : 15000;
      const hasForeignWorldwideAssets = url.searchParams.get('foreignAssets') === 'true';
      const hasActiveSponsorshipUndertaking = url.searchParams.get('sponsorship') === 'true';

      return send(200, evaluateFamilyLawAndSupport({
        province,
        maritalStatus,
        cohabitationYears,
        numberOfChildren,
        payerGrossAnnualIncomeCad,
        recipientGrossAnnualIncomeCad,
        parentingArrangement,
        payerValuationDateAssetsCad,
        payerDateOfMarriageDeductionsCad,
        payerDebtsValuationDateCad,
        recipientValuationDateAssetsCad,
        recipientDateOfMarriageDeductionsCad,
        recipientDebtsValuationDateCad,
        hasForeignWorldwideAssets,
        hasActiveSponsorshipUndertaking
      }));
    }
    if(path==='/v1/tools/social-assistance') {
      const program = url.searchParams.get('program') || 'ontario_works';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const familyComposition = url.searchParams.get('family') || 'single';
      const dependentChildrenCount = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 0;
      const liquidAssetsCad = url.searchParams.get('assets') ? Number(url.searchParams.get('assets')) : 4500;
      const primaryVehicleValueCad = url.searchParams.get('vehicleValue') ? Number(url.searchParams.get('vehicleValue')) : 8000;
      const ownsPrimaryResidence = url.searchParams.get('ownsHome') === 'true';
      const grossMonthlyEmploymentIncomeCad = url.searchParams.get('earnedIncome') ? Number(url.searchParams.get('earnedIncome')) : 0;
      const monthlyShelterCostCad = url.searchParams.get('shelter') ? Number(url.searchParams.get('shelter')) : 650;
      const isSponsoredImmigrant = url.searchParams.get('sponsored') === 'true';
      const sponsorshipYearsRemaining = url.searchParams.get('sponsorYears') ? Number(url.searchParams.get('sponsorYears')) : 0;

      return send(200, evaluateSocialAssistance({
        program,
        immigrationStatus,
        familyComposition,
        dependentChildrenCount,
        liquidAssetsCad,
        primaryVehicleValueCad,
        ownsPrimaryResidence,
        grossMonthlyEmploymentIncomeCad,
        monthlyShelterCostCad,
        isSponsoredImmigrant,
        sponsorshipYearsRemaining
      }));
    }
    if(path==='/v1/tools/tenancy-repairs') {
      const province = url.searchParams.get('province') || 'ON';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2400;
      const issues = url.searchParams.get('issues') ? url.searchParams.get('issues').split(',') : ['water_leak_mold'];
      const daysUnresolved = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 30;
      const outOfPocketExpensesCad = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 0;
      const hasWithheldRent = url.searchParams.get('withheld') === 'true';
      const withheldAmountCad = url.searchParams.get('withheldAmount') ? Number(url.searchParams.get('withheldAmount')) : 0;
      const hasNotifiedLandlordInWriting = url.searchParams.get('writtenNotice') !== 'false';
      const hasCalledCityInspector = url.searchParams.get('cityInspector') === 'true';
      const tenantName = url.searchParams.get('tenant') || 'Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Landlord';
      const rentalAddress = url.searchParams.get('address') || '100 King St W, Toronto, ON';
      return send(200, evaluateTenancyRepairs({
        province,
        monthlyRentCad,
        issues,
        daysUnresolved,
        outOfPocketExpensesCad,
        hasWithheldRent,
        withheldAmountCad,
        hasNotifiedLandlordInWriting,
        hasCalledCityInspector,
        tenantName,
        landlordName,
        rentalAddress
      }));
    }
    if(path==='/v1/tools/commercial-lease') {
      const province = url.searchParams.get('province') || 'ON';
      const baseRentMonthlyCad = url.searchParams.get('baseRent') ? Number(url.searchParams.get('baseRent')) : 3500;
      const additionalRentMonthlyCad = url.searchParams.get('tmi') ? Number(url.searchParams.get('tmi')) : 1500;
      const squareFootage = url.searchParams.get('sqft') ? Number(url.searchParams.get('sqft')) : 1200;
      const leaseType = url.searchParams.get('type') || 'triple_net_nnn';
      const leaseTermYears = url.searchParams.get('term') ? Number(url.searchParams.get('term')) : 5;
      const yearsRemaining = url.searchParams.get('remaining') ? Number(url.searchParams.get('remaining')) : 3.5;
      const hasPersonalGuarantee = url.searchParams.get('guarantee') !== 'false';
      const isRentOverdue = url.searchParams.get('overdue') === 'true';
      const daysRentOverdue = url.searchParams.get('daysOverdue') ? Number(url.searchParams.get('daysOverdue')) : 0;
      const landlordLockoutThreat = url.searchParams.get('lockoutThreat') === 'true';
      const disputedTmiChargesCad = url.searchParams.get('disputedTmi') ? Number(url.searchParams.get('disputedTmi')) : 0;
      const landlordRefusedAssignment = url.searchParams.get('refusedAssignment') === 'true';
      const tenantBusinessName = url.searchParams.get('business') || 'Commercial Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Commercial Landlord';
      const premisesAddress = url.searchParams.get('address') || 'Commercial Premises';
      return send(200, evaluateCommercialLease({
        province,
        baseRentMonthlyCad,
        additionalRentMonthlyCad,
        squareFootage,
        leaseType,
        leaseTermYears,
        yearsRemaining,
        hasPersonalGuarantee,
        isRentOverdue,
        daysRentOverdue,
        landlordLockoutThreat,
        disputedTmiChargesCad,
        landlordRefusedAssignment,
        tenantBusinessName,
        landlordName,
        premisesAddress
      }));
    }
    if(path==='/v1/tools/employment-reference') {
      for(const key of ['fullTime','letterhead','exactDates','hasTitle','hasSalary','hasDuties','copiedNoc','matchesLead','signed','payStubs','taxDocs','bankStatements','familyBusiness']) {
        if(url.searchParams.has(key)&&!['true','false'].includes(url.searchParams.get(key)))throw new ValidationError(key+' must be true or false');
      }
      const program = url.searchParams.get('program') || 'express_entry_fsw';
      const nocCode = url.searchParams.get('noc') || '21231';
      const nocTitle = url.searchParams.get('title') || 'Software Engineer';
      const isFullTime = url.searchParams.get('fullTime') === 'true';
      const hoursPerWeek = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 0;
      const hasLetterhead = url.searchParams.get('letterhead') === 'true';
      const hasExactStartEndDates = url.searchParams.get('exactDates') === 'true';
      const hasJobTitle = url.searchParams.get('hasTitle') === 'true';
      const hasAnnualSalaryAndBenefits = url.searchParams.get('hasSalary') === 'true';
      const hasDetailedDutiesList = url.searchParams.get('hasDuties') === 'true';
      const dutiesCopiedFromNocWordForWord = url.searchParams.get('copiedNoc') === 'true';
      const dutiesSubstantiallyMatchLeadStatement = url.searchParams.has('matchesLead') ? url.searchParams.get('matchesLead') === 'true' : undefined;
      const hasSupervisorSignature = url.searchParams.get('signed') === 'true';
      const supervisorContactInfoType = url.searchParams.get('emailType') || 'corporate_domain_email';
      const paymentMethod = url.searchParams.get('payMethod') || 'bank_direct_deposit';
      const hasPayStubs = url.searchParams.get('payStubs') === 'true';
      const hasTaxDocuments = url.searchParams.get('taxDocs') === 'true';
      const hasBankStatements = url.searchParams.get('bankStatements') === 'true';
      const isFamilyOwnedBusiness = url.searchParams.get('familyBusiness') === 'true';
      const applicantName = url.searchParams.get('applicant') || 'Applicant';
      const employerName = url.searchParams.get('employer') || 'Employer';
      const roleTitle = url.searchParams.get('role') || 'Software Developer';
      const employmentPeriod = url.searchParams.get('period') || '2023 to Present';
      return send(200, auditEmploymentReferenceLetter({
        program,
        nocCode,
        nocTitle,
        isFullTime,
        hoursPerWeek,
        hasLetterhead,
        hasExactStartEndDates,
        hasJobTitle,
        hasAnnualSalaryAndBenefits,
        hasDetailedDutiesList,
        dutiesCopiedFromNocWordForWord,
        dutiesSubstantiallyMatchLeadStatement,
        hasSupervisorSignature,
        supervisorContactInfoType,
        paymentMethod,
        hasPayStubs,
        hasTaxDocuments,
        hasBankStatements,
        isFamilyOwnedBusiness,
        applicantName,
        employerName,
        roleTitle,
        employmentPeriod
      }));
    }
    if(path==='/v1/tools/high-cost-credit') {
      const province = url.searchParams.get('province') || 'ON';
      const loanType = url.searchParams.get('type') || 'payday_loan';
      const principalBorrowedCad = url.searchParams.get('principal') ? Number(url.searchParams.get('principal')) : 1000;
      const termDays = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 14;
      const statedAprPercent = url.searchParams.get('apr') ? Number(url.searchParams.get('apr')) : 46.5;
      const totalFeesChargedCad = url.searchParams.get('fees') ? Number(url.searchParams.get('fees')) : 180;
      const netMonthlyIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 2400;
      const isRolloverLoan = url.searchParams.get('rollover') === 'true';
      const lenderAttemptedWageAssignment = url.searchParams.get('wageAssignment') === 'true';
      const daysSinceAgreement = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 1;
      const borrowerName = url.searchParams.get('borrower') || 'Consumer';
      const lenderName = url.searchParams.get('lender') || 'Quick Cash Financial Ltd.';
      return send(200, evaluateConsumerCreditAgreement({
        province,
        loanType,
        principalBorrowedCad,
        termDays,
        statedAprPercent,
        totalFeesChargedCad,
        netMonthlyIncomeCad,
        isRolloverLoan,
        lenderAttemptedWageAssignment,
        daysSinceAgreement,
        borrowerName,
        lenderName
      }));
    }
    if(path==='/v1/tools/pgwp-eligibility') {
      const credentialLevel = url.searchParams.get('credential') || 'college_diploma';
      const programLengthMonths = url.searchParams.get('length') ? Number(url.searchParams.get('length')) : 24;
      const studyPermitApplicationDate = url.searchParams.get('permitDate') || '2024-11-15';
      const fieldOfStudyCategory = url.searchParams.get('field') || 'stem';
      const languageTestType = url.searchParams.get('testType') || 'celpip_general';
      const clbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 6;
      const testDate = url.searchParams.get('testDate') || '2025-06-01';
      const completionDate = url.searchParams.get('completionDate') || '2026-08-01';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      const isDliEligible = url.searchParams.get('dliEligible') !== 'false';
      const isPublicOrLicensingCurriculum = url.searchParams.get('publicOrLicensing') !== 'false';
      const heldPreviousPgwp = url.searchParams.get('prevPgwp') === 'true';
      const distanceLearningPercent = url.searchParams.get('distance') ? Number(url.searchParams.get('distance')) : 10;
      const hadValidStudyPermitAtCompletion = url.searchParams.get('validPermit') !== 'false';
      const maintainedFullTimeStatus = url.searchParams.get('fullTime') !== 'false';
      const applicantName = url.searchParams.get('applicant') || 'International Graduate';
      const institutionName = url.searchParams.get('institution') || 'Ontario Public College';
      return send(200, evaluatePgwpEligibility({
        credentialLevel,
        programLengthMonths,
        studyPermitApplicationDate,
        fieldOfStudyCategory,
        languageTestType,
        clbLevel,
        testDate,
        completionDate,
        assessmentDate,
        isDliEligible,
        isPublicOrLicensingCurriculum,
        heldPreviousPgwp,
        distanceLearningPercent,
        hadValidStudyPermitAtCompletion,
        maintainedFullTimeStatus,
        applicantName,
        institutionName
      }));
    }
    if(path==='/v1/tools/cross-border-tax') {
      const isCanadianTaxResident = url.searchParams.get('isResident') !== 'false';
      const taxYear = url.searchParams.get('taxYear') ? Number(url.searchParams.get('taxYear')) : 2026;
      const isFirstYearCanadianResident = url.searchParams.get('firstYear') === 'true';
      const foreignPropertyCostAmountCad = url.searchParams.get('foreignCost') ? Number(url.searchParams.get('foreignCost')) : 125000;
      const hasForeignRentalProperty = url.searchParams.get('hasRental') === 'true';
      const foreignRentalIncomeCad = url.searchParams.get('rentalIncome') ? Number(url.searchParams.get('rentalIncome')) : 0;
      const isUsPerson = url.searchParams.get('isUsPerson') === 'true';
      const usFilingStatus = url.searchParams.get('usStatus') || 'single';
      const peakForeignAccountsUsd = url.searchParams.get('peakUsd') ? Number(url.searchParams.get('peakUsd')) : 15000;
      const yearEndForeignAccountsUsd = url.searchParams.get('yearEndUsd') ? Number(url.searchParams.get('yearEndUsd')) : 12000;
      const hasCanadianTfsa = url.searchParams.get('hasTfsa') === 'true';
      const hasCanadianRrsp = url.searchParams.get('hasRrsp') === 'true';
      const hasCanadianResp = url.searchParams.get('hasResp') === 'true';
      const hasCanadianFhsa = url.searchParams.get('hasFhsa') === 'true';
      const holdsCanadianMutualFundsOrEtfs = url.searchParams.get('hasPfic') === 'true';
      const daysLateT1135 = url.searchParams.get('daysLate') ? Number(url.searchParams.get('daysLate')) : 0;
      const clientName = url.searchParams.get('client') || 'Cross-Border Client';
      return send(200, evaluateCrossBorderTaxObligations({
        isCanadianTaxResident,
        taxYear,
        isFirstYearCanadianResident,
        foreignPropertyCostAmountCad,
        hasForeignRentalProperty,
        foreignRentalIncomeCad,
        isUsPerson,
        usFilingStatus,
        peakForeignAccountsUsd,
        yearEndForeignAccountsUsd,
        hasCanadianTfsa,
        hasCanadianRrsp,
        hasCanadianResp,
        hasCanadianFhsa,
        holdsCanadianMutualFundsOrEtfs,
        daysLateT1135,
        clientName
      }));
    }
    if(path==='/v1/tools/workplace-safety') {
      const province = url.searchParams.get('province') || 'ON';
      const isWorkplaceInjury = url.searchParams.get('isInjury') === 'true';
      const injuryDate = url.searchParams.get('injuryDate') || '2026-08-01';
      const accidentReportedToEmployer = url.searchParams.get('reported') !== 'false';
      const employerFiledInjuryReport = url.searchParams.get('employerFiled') !== 'false';
      const workerFiledClaimForm = url.searchParams.get('workerFiled') === 'true';
      const netAverageMonthlyEarningsCad = url.searchParams.get('netEarnings') ? Number(url.searchParams.get('netEarnings')) : 3200;
      const hasUnsafeWorkConditions = url.searchParams.get('unsafe') !== 'false';
      const hazardType = url.searchParams.get('hazard') || 'physical_fall_collapse';
      const refusalStage = url.searchParams.get('stage') || 'stage_1_internal';
      const employerDisciplinedOrThreatened = url.searchParams.get('reprisal') === 'true';
      const immigrationStatusThreatened = url.searchParams.get('statusThreat') === 'true';
      const workerName = url.searchParams.get('worker') || 'Worker';
      const employerName = url.searchParams.get('employer') || 'Employer Inc.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateWorkplaceSafetyAndRefusal({
        province,
        isWorkplaceInjury,
        injuryDate,
        accidentReportedToEmployer,
        employerFiledInjuryReport,
        workerFiledClaimForm,
        netAverageMonthlyEarningsCad,
        hasUnsafeWorkConditions,
        hazardType,
        refusalStage,
        employerDisciplinedOrThreatened,
        immigrationStatusThreatened,
        workerName,
        employerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/tfw-compliance') {
      const stream = url.searchParams.get('stream') || 'low_wage';
      const lmiaStipulatedHourlyWageCad = url.searchParams.get('lmiaWage') ? Number(url.searchParams.get('lmiaWage')) : 24.50;
      const actualPaidHourlyWageCad = url.searchParams.get('actualWage') ? Number(url.searchParams.get('actualWage')) : 18.00;
      const weeklyHoursContracted = url.searchParams.get('contractedHours') ? Number(url.searchParams.get('contractedHours')) : 40;
      const actualWeeklyHoursOffered = url.searchParams.get('actualHours') ? Number(url.searchParams.get('actualHours')) : 30;
      const prohibitedDeductionsChargedCad = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 2500;
      const recruiterFeeChargedCad = url.searchParams.get('recruiterFee') ? Number(url.searchParams.get('recruiterFee')) : 5000;
      const employerRetainedPassportOrPermit = url.searchParams.get('retainedDocs') === 'true';
      const assignedDifferentOccupation = url.searchParams.get('diffOccupation') === 'true';
      const unsafeHousingOrOvercharge = url.searchParams.get('badHousing') === 'true';
      const weeksWorked = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 16;
      const workerName = url.searchParams.get('worker') || 'Temporary Foreign Worker';
      const employerName = url.searchParams.get('employer') || 'Farm & Logistics Ltd.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateTfwEmployerCompliance({
        stream,
        lmiaStipulatedHourlyWageCad,
        actualPaidHourlyWageCad,
        weeklyHoursContracted,
        actualWeeklyHoursOffered,
        prohibitedDeductionsChargedCad,
        recruiterFeeChargedCad,
        employerRetainedPassportOrPermit,
        assignedDifferentOccupation,
        unsafeHousingOrOvercharge,
        weeksWorked,
        workerName,
        employerName,
        assessmentDate
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
    if(path==='/v1/tools/real-estate-assignment') {
      const province = url.searchParams.get('province') || 'ON';
      const originalPurchasePriceCad = url.searchParams.get('originalPrice') ? Number(url.searchParams.get('originalPrice')) : 600000;
      const assignmentSalePriceCad = url.searchParams.get('assignmentPrice') ? Number(url.searchParams.get('assignmentPrice')) : 720000;
      const depositPaidToBuilderCad = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 120000;
      const agreementDate = url.searchParams.get('agreementDate') || '2025-11-01';
      const assignmentDate = url.searchParams.get('assignmentDate') || '2026-06-01';
      const hasPrescribedLifeEvent = url.searchParams.get('hasLifeEvent') === 'true';
      const lifeEventCategory = url.searchParams.get('lifeEvent') || null;
      const relocationDistanceKm = url.searchParams.get('distance') ? Number(url.searchParams.get('distance')) : 0;
      const builderConsentFeeCad = url.searchParams.get('builderFee') ? Number(url.searchParams.get('builderFee')) : 5000;
      const legalFeesCad = url.searchParams.get('legalFees') ? Number(url.searchParams.get('legalFees')) : 2500;
      const realtorCommissionCad = url.searchParams.get('commission') ? Number(url.searchParams.get('commission')) : 15000;
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : 43.0;
      const closingDelayedDays = url.searchParams.get('delayDays') ? Number(url.searchParams.get('delayDays')) : 0;
      const isTarionEnrolled = url.searchParams.get('tarion') !== 'false';
      const assignorName = url.searchParams.get('assignor') || 'Assignor';
      const assigneeName = url.searchParams.get('assignee') || 'Assignee';
      const propertyAddress = url.searchParams.get('address') || 'Residential Unit';
      return send(200, evaluateRealEstateAssignment({
        province,
        originalPurchasePriceCad,
        assignmentSalePriceCad,
        depositPaidToBuilderCad,
        agreementDate,
        assignmentDate,
        hasPrescribedLifeEvent,
        lifeEventCategory,
        relocationDistanceKm,
        builderConsentFeeCad,
        legalFeesCad,
        realtorCommissionCad,
        marginalTaxRatePercent,
        closingDelayedDays,
        isTarionEnrolled,
        assignorName,
        assigneeName,
        propertyAddress
      }));
    }
    if(path==='/v1/tools/oas-gis') {
      const ageYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 67;
      const yearsResidedInCanadaAfter18 = url.searchParams.get('yearsCanada') ? Number(url.searchParams.get('yearsCanada')) : 12;
      const countryOfOrigin = url.searchParams.get('origin') || 'OTHER';
      const yearsContributedToOriginSocialSecurity = url.searchParams.get('foreignYears') ? Number(url.searchParams.get('foreignYears')) : 0;
      const isCanadianCitizenOrLegalResident = url.searchParams.get('legalStatus') !== 'false';
      const livesInCanada = url.searchParams.get('inland') !== 'false';
      const isUnderFamilyClassSponsorship = url.searchParams.get('sponsored') === 'true';
      const sponsorshipYearsRemaining = url.searchParams.get('sponsorRemaining') ? Number(url.searchParams.get('sponsorRemaining')) : 0;
      const annualNetWorldIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 18000;
      const applicantName = url.searchParams.get('applicant') || 'Senior Newcomer';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateOasGisEligibility({
        ageYears,
        yearsResidedInCanadaAfter18,
        countryOfOrigin,
        yearsContributedToOriginSocialSecurity,
        isCanadianCitizenOrLegalResident,
        livesInCanada,
        isUnderFamilyClassSponsorship,
        sponsorshipYearsRemaining,
        annualNetWorldIncomeCad,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/criminal-rehab') {
      const offenseType = url.searchParams.get('offense') || 'impaired_driving_dui';
      const sentenceCompletionDate = url.searchParams.get('completionDate') || '2017-06-01';
      const foreignCountry = url.searchParams.get('country') || 'US';
      const convictionCount = url.searchParams.get('count') ? Number(url.searchParams.get('count')) : 1;
      const urgentTravelRequired = url.searchParams.get('urgent') === 'true';
      const applicantName = url.searchParams.get('applicant') || 'Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateCriminalInadmissibilityAndRehab({
        offenseType,
        sentenceCompletionDate,
        foreignCountry,
        convictionCount,
        urgentTravelRequired,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/franchise-disclosure') {
      const province = url.searchParams.get('province') || 'ON';
      const agreementSignedDate = url.searchParams.get('signDate') || '2025-10-01';
      const fddDeliveredDate = url.searchParams.get('fddDate') || null;
      const wasFddDeliveredAsSingleDocument = url.searchParams.get('singleDoc') !== 'false';
      const hasAuditedFinancialStatements = url.searchParams.get('auditedFin') !== 'false';
      const hasSignedFranchisorCertificate = url.searchParams.get('signedCert') !== 'false';
      const initialFranchiseFeePaidCad = url.searchParams.get('initialFee') ? Number(url.searchParams.get('initialFee')) : 45000;
      const equipmentAndBuildoutCostCad = url.searchParams.get('equipment') ? Number(url.searchParams.get('equipment')) : 180000;
      const inventoryPurchasedAtCostCad = url.searchParams.get('inventory') ? Number(url.searchParams.get('inventory')) : 25000;
      const cumulativeOperatingLossesCad = url.searchParams.get('losses') ? Number(url.searchParams.get('losses')) : 55000;
      const franchiseeName = url.searchParams.get('franchisee') || 'Franchisee';
      const franchisorName = url.searchParams.get('franchisor') || 'Franchisor';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateFranchiseDisclosure({
        province,
        agreementSignedDate,
        fddDeliveredDate,
        wasFddDeliveredAsSingleDocument,
        hasAuditedFinancialStatements,
        hasSignedFranchisorCertificate,
        initialFranchiseFeePaidCad,
        equipmentAndBuildoutCostCad,
        inventoryPurchasedAtCostCad,
        cumulativeOperatingLossesCad,
        franchiseeName,
        franchisorName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/sowp-eligibility') {
      const sponsorType = url.searchParams.get('sponsorType') || 'international_student';
      const studentProgramLevel = url.searchParams.get('programLevel') || 'masters';
      const professionalDegreeSpecialty = url.searchParams.get('specialty') || null;
      const workerNocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 1;
      const workerPermitDurationMonths = url.searchParams.get('permitMonths') ? Number(url.searchParams.get('permitMonths')) : 12;
      const workerHasQualifyingJobOfferOrPaystubs = url.searchParams.get('workerEmployed') !== 'false';
      const relationshipType = url.searchParams.get('relationship') || 'married';
      const monthsCohabiting = url.searchParams.get('cohabiting') ? Number(url.searchParams.get('cohabiting')) : 18;
      const hasJointFinancialEvidence = url.searchParams.get('jointEvidence') !== 'false';
      const applicantName = url.searchParams.get('applicant') || 'Spouse Applicant';
      const principalName = url.searchParams.get('principal') || 'Principal Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateSowpEligibility({
        sponsorType,
        studentProgramLevel,
        professionalDegreeSpecialty,
        workerNocTeer,
        workerPermitDurationMonths,
        workerHasQualifyingJobOfferOrPaystubs,
        relationshipType,
        monthsCohabiting,
        hasJointFinancialEvidence,
        applicantName,
        principalName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/ei-disqualification') {
      const separationType = url.searchParams.get('type') || 'voluntary_quit';
      const justCauseReason = url.searchParams.get('justCause') || null;
      const triedReasonableAlternatives = url.searchParams.get('triedAlternatives') !== 'false';
      const employerAllegedMisconduct = url.searchParams.get('allegedMisconduct') === 'true';
      const allegedMisconductType = url.searchParams.get('misconductType') || 'none';
      const normalWeeklyGrossEarningsCad = url.searchParams.get('weeklyEarnings') ? Number(url.searchParams.get('weeklyEarnings')) : 1200;
      const severancePayReceivedCad = url.searchParams.get('severance') ? Number(url.searchParams.get('severance')) : 0;
      const vacationPayPaidOutCad = url.searchParams.get('vacation') ? Number(url.searchParams.get('vacation')) : 0;
      const payInLieuOfNoticeCad = url.searchParams.get('noticePay') ? Number(url.searchParams.get('noticePay')) : 0;
      const isClaimingSpecialBenefits = url.searchParams.get('specialBenefits') === 'true';
      const insurableHoursAccumulated = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 720;
      const applicantName = url.searchParams.get('applicant') || 'EI Claimant';
      const employerName = url.searchParams.get('employer') || 'Employer Inc.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateEiDisqualificationAndAllocation({
        separationType,
        justCauseReason,
        triedReasonableAlternatives,
        employerAllegedMisconduct,
        allegedMisconductType,
        normalWeeklyGrossEarningsCad,
        severancePayReceivedCad,
        vacationPayPaidOutCad,
        payInLieuOfNoticeCad,
        isClaimingSpecialBenefits,
        insurableHoursAccumulated,
        applicantName,
        employerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/rural-renewal') {
      const streamType = url.searchParams.get('stream') || 'rural_renewal';
      const selectedCommunity = url.searchParams.get('community') || 'brooks';
      const hasCommunityEndorsementLetter = url.searchParams.get('endorsed') !== 'false';
      const hasGenuineJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const jobOfferIsFullTimeNonSeasonal = url.searchParams.get('fullTime') !== 'false';
      const jobNocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 2;
      const clbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 5;
      const hasHighSchoolOrEca = url.searchParams.get('education') !== 'false';
      const monthsWorkExperiencePast18Months = url.searchParams.get('expMonths') ? Number(url.searchParams.get('expMonths')) : 14;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 2;
      const liquidSettlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 20000;
      const isCurrentlyLivingAndWorkingInAlberta = url.searchParams.get('workingInAb') === 'true';
      const netWorthCad = url.searchParams.get('netWorth') ? Number(url.searchParams.get('netWorth')) : 350000;
      const plannedInvestmentCad = url.searchParams.get('investment') ? Number(url.searchParams.get('investment')) : 120000;
      const plannedOwnershipPercent = url.searchParams.get('ownership') ? Number(url.searchParams.get('ownership')) : 51.0;
      const jobsCreatedCount = url.searchParams.get('jobs') ? Number(url.searchParams.get('jobs')) : 1;
      const hasCompletedCommunityExploratoryVisit = url.searchParams.get('visit') !== 'false';
      const applicantName = url.searchParams.get('applicant') || 'AAIP Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateRuralRenewalEligibility({
        streamType,
        selectedCommunity,
        hasCommunityEndorsementLetter,
        hasGenuineJobOffer,
        jobOfferIsFullTimeNonSeasonal,
        jobNocTeer,
        clbLevel,
        hasHighSchoolOrEca,
        monthsWorkExperiencePast18Months,
        familySize,
        liquidSettlementFundsCad,
        isCurrentlyLivingAndWorkingInAlberta,
        netWorthCad,
        plannedInvestmentCad,
        plannedOwnershipPercent,
        jobsCreatedCount,
        hasCompletedCommunityExploratoryVisit,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/speculation-tax-rebate') {
      const province = url.searchParams.get('province') || 'BC';
      const propertyAssessedValueCad = url.searchParams.get('assessedValue') ? Number(url.searchParams.get('assessedValue')) : 1200000;
      const purchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 1200000;
      const isCanadianCitizenOrPr = url.searchParams.get('isCdn') === 'true';
      const isSatelliteFamily = url.searchParams.get('satellite') === 'true';
      const isPrincipalResidenceOccupied6Months = url.searchParams.get('primaryHome') === 'true';
      const rentalDaysInYear = url.searchParams.get('rentalDays') ? Number(url.searchParams.get('rentalDays')) : 0;
      const isYearOfPurchase = url.searchParams.get('yearPurchased') === 'true';
      const bcEmploymentIncomeCad = url.searchParams.get('bcIncome') ? Number(url.searchParams.get('bcIncome')) : 0;
      const purchaseClosingDate = url.searchParams.get('closingDate') || '2026-02-01';
      const prStatusAcquiredDate = url.searchParams.get('prDate') || null;
      const rebateApplicationDate = url.searchParams.get('claimDate') || '2026-10-31';
      const occupiedAsPrincipalResidenceWithin60Days = url.searchParams.get('occupied60') !== 'false';
      const heldSolelyWithSpouse = url.searchParams.get('soleSpouse') !== 'false';
      const isOinpNomineeAtClosing = url.searchParams.get('oinp') === 'true';
      const isConventionRefugee = url.searchParams.get('refugee') === 'true';
      const ownerName = url.searchParams.get('owner') || 'Property Owner';
      const propertyAddress = url.searchParams.get('address') || 'Residential Property';
      return send(200, evaluateSpeculationTaxAndRebates({
        province,
        propertyAssessedValueCad,
        purchasePriceCad,
        isCanadianCitizenOrPr,
        isSatelliteFamily,
        isPrincipalResidenceOccupied6Months,
        rentalDaysInYear,
        isYearOfPurchase,
        bcEmploymentIncomeCad,
        purchaseClosingDate,
        prStatusAcquiredDate,
        rebateApplicationDate,
        occupiedAsPrincipalResidenceWithin60Days,
        heldSolelyWithSpouse,
        isOinpNomineeAtClosing,
        isConventionRefugee,
        ownerName,
        propertyAddress
      }));
    }
    if(path==='/v1/tools/child-welfare-guardianship') {
      const pathway = url.searchParams.get('pathway') || 'vysa_youth_services';
      const youthAgeYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 16;
      const hasSafeExtendedFamily = url.searchParams.get('kinship') !== 'false';
      const kinshipRelationship = url.searchParams.get('kinshipRelation') || 'aunt_uncle';
      const isCanadianCitizenParentForAdoption = url.searchParams.get('citizenParent') !== 'false';
      const adoptionCountry = url.searchParams.get('country') || 'India';
      const isHagueConventionCountry = url.searchParams.get('hague') !== 'false';
      const adoptionLegallyFinalizedAbroad = url.searchParams.get('finalized') !== 'false';
      const preAdoptionTiesSevered = url.searchParams.get('severed') !== 'false';
      const youthName = url.searchParams.get('youth') || 'Youth';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildWelfareAndGuardianship({
        pathway,
        youthAgeYears,
        hasSafeExtendedFamily,
        kinshipRelationship,
        isCanadianCitizenParentForAdoption,
        adoptionCountry,
        isHagueConventionCountry,
        adoptionLegallyFinalizedAbroad,
        preAdoptionTiesSevered,
        youthName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/excessive-demand-mitigation') {
      const immigrationStream = url.searchParams.get('stream') || 'economic_express_entry';
      const diagnosedCondition = url.searchParams.get('condition') || 'Chronic Condition';
      const estimatedAnnualMedicationCostCad = url.searchParams.get('meds') ? Number(url.searchParams.get('meds')) : 18000;
      const estimatedAnnualHospitalCostCad = url.searchParams.get('hospital') ? Number(url.searchParams.get('hospital')) : 4000;
      const estimatedAnnualSocialServicesCostCad = url.searchParams.get('social') ? Number(url.searchParams.get('social')) : 2000;
      const hasPrivateInsuranceDrugCoverage = url.searchParams.get('insurance') !== 'false';
      const privateInsuranceDrugLimitAnnualCad = url.searchParams.get('drugLimit') ? Number(url.searchParams.get('drugLimit')) : 25000;
      const liquidFundsAvailableForCareCad = url.searchParams.get('liquid') ? Number(url.searchParams.get('liquid')) : 60000;
      const receivedProceduralFairnessLetter = url.searchParams.get('pfl') === 'true';
      const pflReceivedDate = url.searchParams.get('pflDate') || null;
      const applicantName = url.searchParams.get('applicant') || 'Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateExcessiveDemandMitigation({
        immigrationStream,
        diagnosedCondition,
        estimatedAnnualMedicationCostCad,
        estimatedAnnualHospitalCostCad,
        estimatedAnnualSocialServicesCostCad,
        hasPrivateInsuranceDrugCoverage,
        privateInsuranceDrugLimitAnnualCad,
        liquidFundsAvailableForCareCad,
        receivedProceduralFairnessLetter,
        pflReceivedDate,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/francophone-mobility') {
      const province = url.searchParams.get('province') || 'ON';
      const frenchTestType = url.searchParams.get('testType') || 'tef_canada';
      const nclcSpeaking = url.searchParams.get('speaking') ? Number(url.searchParams.get('speaking')) : 5;
      const nclcListening = url.searchParams.get('listening') ? Number(url.searchParams.get('listening')) : 5;
      const testDate = url.searchParams.get('testDate') || '2025-06-01';
      const nocCode = url.searchParams.get('noc') || '21232';
      const nocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 1;
      const isPrimaryAgriculture = url.searchParams.get('agri') === 'true';
      const hasGenuineJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const employerPaidComplianceFee = url.searchParams.get('feePaid') !== 'false';
      const applicantName = url.searchParams.get('applicant') || 'Applicant';
      const employerName = url.searchParams.get('employer') || 'Canadian Employer Inc.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateFrancophoneMobility({
        province,
        frenchTestType,
        nclcSpeaking,
        nclcListening,
        testDate,
        nocCode,
        nocTeer,
        isPrimaryAgriculture,
        hasGenuineJobOffer,
        employerPaidComplianceFee,
        applicantName,
        employerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/digital-platform-worker') {
      const province = url.searchParams.get('province') || 'ON';
      const platformName = url.searchParams.get('platform') || 'Platform Operator';
      const workerType = url.searchParams.get('type') || 'rideshare_driver';
      const engagedHoursInPeriod = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 40;
      const actualBasePayReceivedCad = url.searchParams.get('basePay') ? Number(url.searchParams.get('basePay')) : 550;
      const tipsReceivedCad = url.searchParams.get('tips') ? Number(url.searchParams.get('tips')) : 120;
      const unauthorizedDeductionsCad = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 0;
      const tipsWithheldOrSubsidized = url.searchParams.get('tipsWithheld') === 'true';
      const hasDeplatformingAction = url.searchParams.get('deplatformed') === 'true';
      const noticeDaysGivenBeforeDeplatform = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 0;
      const providedWrittenReason = url.searchParams.get('writtenReason') === 'true';
      const foreignArbitrationClauseInvoked = url.searchParams.get('foreignArbitration') === 'true';
      const workerName = url.searchParams.get('worker') || 'Worker';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluatePlatformWorkerRights({
        province,
        platformName,
        workerType,
        engagedHoursInPeriod,
        actualBasePayReceivedCad,
        tipsReceivedCad,
        unauthorizedDeductionsCad,
        tipsWithheldOrSubsidized,
        hasDeplatformingAction,
        noticeDaysGivenBeforeDeplatform,
        providedWrittenReason,
        foreignArbitrationClauseInvoked,
        workerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/atlantic-immigration') {
      const province = url.searchParams.get('province') || 'NS';
      const stream = url.searchParams.get('stream') || 'international_graduate';
      const nocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 1;
      const clbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 5;
      const hasDesignatedEmployerJobOffer = url.searchParams.get('designated') !== 'false';
      const isJobOfferFullTimeNonSeasonal = url.searchParams.get('fullTime') !== 'false';
      const jobOfferDurationMonths = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 24;
      const isPermanentJobOffer = url.searchParams.get('permanent') === 'true';
      const hasAtlanticTwoYearCredential = url.searchParams.get('credential') !== 'false';
      const monthsResidedInAtlanticDuringStudy = url.searchParams.get('residenceMonths') ? Number(url.searchParams.get('residenceMonths')) : 16;
      const hoursWorkExperiencePast5Years = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 1560;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const settlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 5000;
      const isCurrentlyWorkingInCanadaOnValidPermit = url.searchParams.get('workingInCanada') === 'true';
      const candidateName = url.searchParams.get('candidate') || 'Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateAtlanticImmigrationEligibility({
        province,
        stream,
        nocTeer,
        clbLevel,
        hasDesignatedEmployerJobOffer,
        isJobOfferFullTimeNonSeasonal,
        jobOfferDurationMonths,
        isPermanentJobOffer,
        hasAtlanticTwoYearCredential,
        monthsResidedInAtlanticDuringStudy,
        hoursWorkExperiencePast5Years,
        familySize,
        settlementFundsCad,
        isCurrentlyWorkingInCanadaOnValidPermit,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/childcare-subsidy') {
      const province = url.searchParams.get('province') || 'ON';
      const municipality = url.searchParams.get('municipality') || 'Toronto';
      const adjustedFamilyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 35000;
      const baselineMonthlyFeePerChildCad = url.searchParams.get('baseFee') ? Number(url.searchParams.get('baseFee')) : 1200;
      const isEnrolledInCwelccLicensedCentre = url.searchParams.get('cwelcc') !== 'false';
      const parentActivityType = url.searchParams.get('activity') || 'both_working';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const applicantName = url.searchParams.get('applicant') || 'Parent';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildCareSubsidy({
        province,
        municipality,
        adjustedFamilyNetIncomeCad,
        baselineMonthlyFeePerChildCad,
        isEnrolledInCwelccLicensedCentre,
        parentActivityType,
        immigrationStatus,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/bc-strata-bylaw') {
      const disputeType = url.searchParams.get('dispute') || 'rental_restriction';
      const isLongTermRental = url.searchParams.get('longTerm') !== 'false';
      const rentalTermMonths = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 12;
      const strataAgeMinimum = url.searchParams.get('ageMin') ? Number(url.searchParams.get('ageMin')) : 19;
      const isCertifiedServiceDog = url.searchParams.get('serviceDog') === 'true';
      const fineAmountLeviedCad = url.searchParams.get('fine') ? Number(url.searchParams.get('fine')) : 0;
      const strataDemandedTenantScreening = url.searchParams.get('screening') === 'true';
      const strataRefusedEvRequest = url.searchParams.get('refusedEv') === 'true';
      const strataPlanNumber = url.searchParams.get('strataPlan') || 'EPS 1234';
      const unitNumber = url.searchParams.get('unit') || '304';
      const ownerOrTenantName = url.searchParams.get('name') || 'Strata Resident';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateBcStrataBylawDefense({
        disputeType,
        isLongTermRental,
        rentalTermMonths,
        strataAgeMinimum,
        isCertifiedServiceDog,
        fineAmountLeviedCad,
        strataDemandedTenantScreening,
        strataRefusedEvRequest,
        strataPlanNumber,
        unitNumber,
        ownerOrTenantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/pr-card-renewal') {
      const daysInCanadaLast5Years = url.searchParams.get('daysInCanada') ? Number(url.searchParams.get('daysInCanada')) : 730;
      const daysAbroadAccompanyingCitizenSpouse = url.searchParams.get('daysSpouse') ? Number(url.searchParams.get('daysSpouse')) : 0;
      const daysAbroadEmployedByCanadianBusiness = url.searchParams.get('daysJob') ? Number(url.searchParams.get('daysJob')) : 0;
      const daysAbroadAccompanyingPrEmployed = url.searchParams.get('daysPrSpouse') ? Number(url.searchParams.get('daysPrSpouse')) : 0;
      const hasUrgentTravelNeed = url.searchParams.get('urgent') === 'true';
      const travelDepartureDaysFromNow = url.searchParams.get('travelDays') ? Number(url.searchParams.get('travelDays')) : 120;
      const urgentReasonCategory = url.searchParams.get('urgentCategory') || 'none';
      const hasProofOfTravel = url.searchParams.get('proofTravel') === 'true';
      const hasSupportingUrgentProof = url.searchParams.get('supportingProof') === 'true';
      const isCurrentlyInsideCanada = url.searchParams.get('insideCanada') !== 'false';
      const applicantName = url.searchParams.get('name') || 'PR Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluatePrCardRenewalUrgent({
        daysInCanadaLast5Years,
        daysAbroadAccompanyingCitizenSpouse,
        daysAbroadEmployedByCanadianBusiness,
        daysAbroadAccompanyingPrEmployed,
        hasUrgentTravelNeed,
        travelDepartureDaysFromNow,
        urgentReasonCategory,
        hasProofOfTravel,
        hasSupportingUrgentProof,
        isCurrentlyInsideCanada,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/foreign-worker-transition') {
      const wagePerHour = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 20.0;
      const provincialMedianWage = url.searchParams.get('medianWage') ? Number(url.searchParams.get('medianWage')) : 28.39;
      const employerLocationCma = url.searchParams.get('cma') || 'Toronto';
      const cmaUnemploymentRate = url.searchParams.get('unemploymentRate') ? Number(url.searchParams.get('unemploymentRate')) : 6.8;
      const sector = url.searchParams.get('sector') || 'general';
      const currentWorkPermitExpiryDays = url.searchParams.get('expiryDays') ? Number(url.searchParams.get('expiryDays')) : 120;
      const cumulativeCanadianExperienceMonths = url.searchParams.get('cdnExpMonths') ? Number(url.searchParams.get('cdnExpMonths')) : 12;
      const hasFrenchProficiencyNclc5 = url.searchParams.get('frenchNclc5') === 'true';
      const hasProvincialNominationStreamFit = url.searchParams.get('pnpFit') === 'true';
      const isApplyingDualIntent = url.searchParams.get('dualIntent') !== 'false';
      const workerName = url.searchParams.get('name') || 'Temporary Foreign Worker';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateForeignWorkerTransition({
        wagePerHour,
        provincialMedianWage,
        employerLocationCma,
        cmaUnemploymentRate,
        sector,
        currentWorkPermitExpiryDays,
        cumulativeCanadianExperienceMonths,
        hasFrenchProficiencyNclc5,
        hasProvincialNominationStreamFit,
        isApplyingDualIntent,
        workerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/child-disability-benefit') {
      const childAgeYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 8;
      const hasApprovedDtcT2201 = url.searchParams.get('hasDtc') !== 'false';
      const dtcConditionIsProlonged = url.searchParams.get('isProlonged') !== 'false';
      const familyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 55000;
      const annualRdspContributionCad = url.searchParams.get('contribution') ? Number(url.searchParams.get('contribution')) : 1500;
      const unclaimedPastYears = url.searchParams.get('pastYears') ? Number(url.searchParams.get('pastYears')) : 0;
      const childName = url.searchParams.get('childName') || 'Eligible Child';
      const parentName = url.searchParams.get('parentName') || 'Parent / Legal Guardian';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildDisabilityBenefit({
        childAgeYears,
        hasApprovedDtcT2201,
        dtcConditionIsProlonged,
        familyNetIncomeCad,
        annualRdspContributionCad,
        unclaimedPastYears,
        childName,
        parentName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/alberta-security-deposit') {
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 1800;
      const securityDepositPaidCad = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 1800;
      const additionalNonRefundableFeesCad = url.searchParams.get('fees') ? Number(url.searchParams.get('fees')) : 0;
      const landlordConductedMoveInInspection = url.searchParams.get('moveIn') !== 'false';
      const tenantReceivedSignedMoveInReport = url.searchParams.get('signedReport') !== 'false';
      const landlordConductedMoveOutInspection = url.searchParams.get('moveOut') !== 'false';
      const daysSinceTenancyEnded = url.searchParams.get('daysVacated') ? Number(url.searchParams.get('daysVacated')) : 12;
      const deductionsClaimedCad = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 500;
      const deductionsReason = url.searchParams.get('reason') || 'normal wear and tear painting and carpet cleaning';
      const tenantProvidedForwardingAddress = url.searchParams.get('forwardingAddress') !== 'false';
      const tenantName = url.searchParams.get('tenant') || 'Alberta Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Landlord / Property Manager';
      const rentalUnitAddress = url.searchParams.get('unit') || '102-10405 Jasper Ave, Edmonton, AB';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateAlbertaSecurityDeposit({
        monthlyRentCad,
        securityDepositPaidCad,
        additionalNonRefundableFeesCad,
        landlordConductedMoveInInspection,
        tenantReceivedSignedMoveInReport,
        landlordConductedMoveOutInspection,
        daysSinceTenancyEnded,
        deductionsClaimedCad,
        deductionsReason,
        tenantProvidedForwardingAddress,
        tenantName,
        landlordName,
        rentalUnitAddress,
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
    if(path==='/v1/tools/alberta-opportunity-stream') {
      const workPermitType = url.searchParams.get('permitType') || 'lmia_based';
      const albertaWorkExperienceMonths = url.searchParams.get('abMonths') ? Number(url.searchParams.get('abMonths')) : 14;
      const nonAlbertaWorkExperienceMonths = url.searchParams.get('otherMonths') ? Number(url.searchParams.get('otherMonths')) : 0;
      const teerCategory = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 2;
      const nocCode = url.searchParams.get('noc') || '21231';
      const languageClbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 6;
      const hasCanadianHighSchoolOrEca = url.searchParams.get('hasEca') !== 'false';
      const hasPermanentJobOfferInAlberta = url.searchParams.get('hasJobOffer') !== 'false';
      const sector = url.searchParams.get('sector') || 'general';
      const isGraduatedFromAlbertaDli = url.searchParams.get('abGrad') !== 'false';
      const candidateName = url.searchParams.get('name') || 'AAIP Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateAlbertaOpportunityStream({
        workPermitType,
        albertaWorkExperienceMonths,
        nonAlbertaWorkExperienceMonths,
        teerCategory,
        nocCode,
        languageClbLevel,
        hasCanadianHighSchoolOrEca,
        hasPermanentJobOfferInAlberta,
        sector,
        isGraduatedFromAlbertaDli,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/bc-speculation-tax-declaration') {
      const propertyRegion = url.searchParams.get('region') || 'Metro Vancouver';
      const assessedPropertyValueCad = url.searchParams.get('assessedValue') ? Number(url.searchParams.get('assessedValue')) : 1250000;
      const ownerCitizenshipStatus = url.searchParams.get('status') || 'canadian_citizen_or_pr';
      const isSatelliteFamily = url.searchParams.get('satellite') === 'true';
      const propertyUseCategory = url.searchParams.get('propertyUse') || 'principal_residence';
      const monthsOccupiedInYear = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 12;
      const hasArmsLengthTenancyAgreement = url.searchParams.get('armsLength') !== 'false';
      const hasActiveBuildingPermits = url.searchParams.get('permits') === 'true';
      const ownerName = url.searchParams.get('owner') || 'Property Owner';
      const calendarTaxYear = url.searchParams.get('taxYear') || '2025';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateBcSpeculationTaxDeclaration({
        propertyRegion,
        assessedPropertyValueCad,
        ownerCitizenshipStatus,
        isSatelliteFamily,
        propertyUseCategory,
        monthsOccupiedInYear,
        hasArmsLengthTenancyAgreement,
        hasActiveBuildingPermits,
        ownerName,
        calendarTaxYear,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/prtd-humanitarian') {
      const daysPhysicallyInCanadaLast5Years = url.searchParams.get('daysInCanada') ? Number(url.searchParams.get('daysInCanada')) : 420;
      const reasonForAbsenceCategory = url.searchParams.get('reasonCategory') || 'care_for_critically_ill_family';
      const hasDocumentaryProofOfCompellingCircumstance = url.searchParams.get('hasProof') !== 'false';
      const yearsResidedInCanadaPriorToAbsence = url.searchParams.get('yearsInCanada') ? Number(url.searchParams.get('yearsInCanada')) : 4;
      const filedCanadianTaxesConsecutively = url.searchParams.get('filedTaxes') !== 'false';
      const ownsResidentialHomeOrAssetsInCanada = url.searchParams.get('hasAssets') !== 'false';
      const hasMinorCanadianChildrenAffected = url.searchParams.get('hasBioc') === 'true';
      const hasCanadianCitizenSpouseInCanada = url.searchParams.get('spouseInCanada') === 'true';
      const applicantName = url.searchParams.get('name') || 'PR Applicant Abroad';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluatePrtdHumanitarian({
        daysPhysicallyInCanadaLast5Years,
        reasonForAbsenceCategory,
        hasDocumentaryProofOfCompellingCircumstance,
        yearsResidedInCanadaPriorToAbsence,
        filedCanadianTaxesConsecutively,
        ownsResidentialHomeOrAssetsInCanada,
        hasMinorCanadianChildrenAffected,
        hasCanadianCitizenSpouseInCanada,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/severance-reasonable-notice') {
      const yearsOfService = url.searchParams.get('service') ? Number(url.searchParams.get('service')) : 6.5;
      const employeeAgeYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 48;
      const annualSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 85000;
      const roleSeniority = url.searchParams.get('role') || 'managerial_professional';
      const province = url.searchParams.get('province') || 'ON';
      const employerPayrollExceeds2_5Million = url.searchParams.get('largePayroll') !== 'false';
      const hasSignedTerminationClause = url.searchParams.get('hasClause') !== 'false';
      const terminationClauseViolatesEsa = url.searchParams.get('clauseViolatesEsa') !== 'false';
      const employeeName = url.searchParams.get('name') || 'Employee';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateStatutorySeveranceNotice({
        yearsOfService,
        employeeAgeYears,
        annualSalaryCad,
        roleSeniority,
        province,
        employerPayrollExceeds2_5Million,
        hasSignedTerminationClause,
        terminationClauseViolatesEsa,
        employeeName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/manitoba-pnp-skilled-worker') {
      const monthsWorkedInManitoba = url.searchParams.get('mbMonths') ? Number(url.searchParams.get('mbMonths')) : 8;
      const isOutOfProvinceGraduate = url.searchParams.get('oopGrad') === 'true';
      const hasPermanentManitobaJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const firstLanguageClb = url.searchParams.get('clb1') ? Number(url.searchParams.get('clb1')) : 7;
      const secondLanguageClb = url.searchParams.get('clb2') ? Number(url.searchParams.get('clb2')) : 0;
      const candidateAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 30;
      const totalYearsOfWorkExperience = url.searchParams.get('exp') ? Number(url.searchParams.get('exp')) : 4;
      const highestEducationLevel = url.searchParams.get('edu') || 'bachelors_degree';
      const hasCloseFamilySupporterInManitoba = url.searchParams.get('supporter') === 'true';
      const isJobLocatedOutsideWinnipeg = url.searchParams.get('regional') === 'true';
      const hasPastStudyInAnotherProvince = url.searchParams.get('pastStudy') === 'true';
      const hasPastWorkInAnotherProvince = url.searchParams.get('pastWork') === 'true';
      const candidateName = url.searchParams.get('name') || 'MPNP Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateManitobaPnpSkilledWorker({
        monthsWorkedInManitoba,
        isOutOfProvinceGraduate,
        hasPermanentManitobaJobOffer,
        firstLanguageClb,
        secondLanguageClb,
        candidateAge,
        totalYearsOfWorkExperience,
        highestEducationLevel,
        hasCloseFamilySupporterInManitoba,
        isJobLocatedOutsideWinnipeg,
        hasPastStudyInAnotherProvince,
        hasPastWorkInAnotherProvince,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/sinp-hard-to-fill') {
      const nocCode = url.searchParams.get('noc') || '65201';
      const workExperienceMonthsInSaskatchewan = url.searchParams.get('skMonths') ? Number(url.searchParams.get('skMonths')) : 8;
      const languageClbLevel = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 5;
      const hasSaskatchewanJobApprovalLetter = url.searchParams.get('jal') !== 'false';
      const hasPermanentFullTimeOffer = url.searchParams.get('fullTime') !== 'false';
      const highestEducation = url.searchParams.get('edu') || 'secondary_school';
      const hasEducationalCredentialAssessment = url.searchParams.get('eca') !== 'false';
      const teerLevel = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 5;
      const isValidWorkPermitHeld = url.searchParams.get('validPermit') !== 'false';
      const applicantName = url.searchParams.get('name') || 'Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateSinpHardToFillSkills({
        nocCode,
        workExperienceMonthsInSaskatchewan,
        languageClbLevel,
        hasSaskatchewanJobApprovalLetter,
        hasPermanentFullTimeOffer,
        highestEducation,
        hasEducationalCredentialAssessment,
        teerLevel,
        isValidWorkPermitHeld,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/esa-reprisal-defense') {
      const protectedActivity = url.searchParams.get('activity') || 'asked_about_rights';
      const adverseAction = url.searchParams.get('action') || 'termination';
      const daysBetweenActivityAndAction = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 14;
      const employerProvidedWrittenReason = url.searchParams.get('writtenReason') === 'true';
      const allegedEmployerReason = url.searchParams.get('statedReason') || 'none';
      const hasDocumentaryEvidence = url.searchParams.get('evidence') !== 'false';
      const monthlyLostWageCad = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 4000;
      const monthsElapsedSinceAction = url.searchParams.get('monthsElapsed') ? Number(url.searchParams.get('monthsElapsed')) : 1;
      const employeeName = url.searchParams.get('name') || 'Worker';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateEsaReprisal({
        protectedActivity,
        adverseAction,
        daysBetweenActivityAndAction,
        employerProvidedWrittenReason,
        allegedEmployerReason,
        hasDocumentaryEvidence,
        monthlyLostWageCad,
        monthsElapsedSinceAction,
        employeeName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/bc-svt-appeal') {
      const assessmentNoticeDate = url.searchParams.get('noticeDate') || '2026-10-01';
      const assessedAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 24000;
      const objectionGround = url.searchParams.get('ground') || 'arm_length_tenancy_occupied';
      const hasTenancyAgreementOrProof = url.searchParams.get('leaseProof') !== 'false';
      const hasTaxFilingsOrT4ShowingResidence = url.searchParams.get('residenceProof') === 'true';
      const isStayOfCollectionRequested = url.searchParams.get('stayRequested') !== 'false';
      const propertyRollNumber = url.searchParams.get('rollNumber') || 'ROLL-0000-0000';
      const ownerName = url.searchParams.get('name') || 'Property Owner';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      return send(200, auditBcSvtNoticeOfObjection({
        assessmentNoticeDate,
        assessedAmountCad,
        objectionGround,
        hasTenancyAgreementOrProof,
        hasTaxFilingsOrT4ShowingResidence,
        isStayOfCollectionRequested,
        propertyRollNumber,
        ownerName,
        currentDate
      }));
    }
    if(path==='/v1/tools/express-entry-tie-break') {
      const candidateCrs = url.searchParams.get('crs') ? Number(url.searchParams.get('crs')) : 485;
      const profileSubmissionUtc = url.searchParams.get('submissionUtc') || '2026-04-01T10:00:00Z';
      const targetCategory = url.searchParams.get('category') || 'stem';
      const candidateAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 29;
      const simulatedRoundCutoff = url.searchParams.get('cutoff') ? Number(url.searchParams.get('cutoff')) : 485;
      const simulatedTieBreakUtc = url.searchParams.get('tieBreakUtc') || '2026-04-10T00:00:00Z';
      const isFrenchNclc7 = url.searchParams.get('french') === 'true';
      const hasCanadianMasterOrPhd = url.searchParams.get('masters') === 'true';
      const hasProvincialNomination = url.searchParams.get('pnp') === 'true';
      const candidateName = url.searchParams.get('name') || 'Candidate';
      return send(200, evaluateExpressEntryTieBreak({
        candidateCrs,
        profileSubmissionUtc,
        targetCategory,
        candidateAge,
        simulatedRoundCutoff,
        simulatedTieBreakUtc,
        isFrenchNclc7,
        hasCanadianMasterOrPhd,
        hasProvincialNomination,
        candidateName
      }));
    }
    if(path==='/v1/tools/calgary-suite-amnesty') {
      const suiteType = url.searchParams.get('type') || 'basement_suite';
      const hasInterconnectedSmokeAlarms = url.searchParams.get('smokeAlarms') !== 'false';
      const hasCarbonMonoxideAlarm = url.searchParams.get('coAlarm') !== 'false';
      const bedroomWindowOpeningAreaSqM = url.searchParams.get('windowArea') ? Number(url.searchParams.get('windowArea')) : 0.38;
      const bedroomWindowMinDimensionMm = url.searchParams.get('windowDim') ? Number(url.searchParams.get('windowDim')) : 400;
      const windowWellClearanceMm = url.searchParams.get('wellClearance') ? Number(url.searchParams.get('wellClearance')) : 800;
      const ceilingHeightMetres = url.searchParams.get('ceilingHeight') ? Number(url.searchParams.get('ceilingHeight')) : 2.05;
      const hasDrywallFireSeparation = url.searchParams.get('fireSeparation') !== 'false';
      const hasCompliantHvacSystem = url.searchParams.get('hvac') !== 'false';
      const hasDirectExteriorExit = url.searchParams.get('exit') !== 'false';
      const isRegisteredOnCalgaryRegistry = url.searchParams.get('registered') === 'true';
      const propertyAddress = url.searchParams.get('address') || '123 Centre St, Calgary, AB';
      const ownerName = url.searchParams.get('name') || 'Property Owner';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, auditCalgarySecondarySuite({
        suiteType,
        hasInterconnectedSmokeAlarms,
        hasCarbonMonoxideAlarm,
        bedroomWindowOpeningAreaSqM,
        bedroomWindowMinDimensionMm,
        windowWellClearanceMm,
        ceilingHeightMetres,
        hasDrywallFireSeparation,
        hasCompliantHvacSystem,
        hasDirectExteriorExit,
        isRegisteredOnCalgaryRegistry,
        propertyAddress,
        ownerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/esa-constructive-layoff') {
      const yearsOfService = url.searchParams.get('service') ? Number(url.searchParams.get('service')) : 3;
      const employeeAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 38;
      const annualSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 65000;
      const weeksOnLayoff = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 10;
      const employerMaintainedBenefitsOrSub = url.searchParams.get('benefits') === 'true';
      const hasContractualLayoffClause = url.searchParams.get('contractClause') === 'true';
      const employerPayrollExceeds2_5M = url.searchParams.get('payroll25m') !== 'false';
      const isManagementOrSpecialist = url.searchParams.get('management') === 'true';
      const salaryReductionPct = url.searchParams.get('cutPct') ? Number(url.searchParams.get('cutPct')) : 0;
      const hasSubstantialUnilateralDutyChange = url.searchParams.get('dutyChange') === 'true';
      const employeeImmigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const employeeName = url.searchParams.get('name') || 'Employee';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateEsaConstructiveDismissalLayoff({
        yearsOfService,
        employeeAge,
        annualSalaryCad,
        weeksOnLayoff,
        employerMaintainedBenefitsOrSub,
        hasContractualLayoffClause,
        employerPayrollExceeds2_5M,
        isManagementOrSpecialist,
        salaryReductionPct,
        hasSubstantialUnilateralDutyChange,
        employeeImmigrationStatus,
        employeeName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/nsnp-experience') {
      const stream = url.searchParams.get('stream') || 'nova_scotia_experience_express_entry';
      const candidateAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 29;
      const nocCode = url.searchParams.get('noc') || '21231';
      const teerLevel = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 1;
      const monthsWorkedInNovaScotia = url.searchParams.get('nsMonths') ? Number(url.searchParams.get('nsMonths')) : 14;
      const hoursWorkedInNovaScotia = url.searchParams.get('nsHours') ? Number(url.searchParams.get('nsHours')) : 1800;
      const languageClbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 8;
      const hasActiveExpressEntryProfile = url.searchParams.get('ee') !== 'false';
      const hasValidWorkPermitDuringExperience = url.searchParams.get('validPermit') !== 'false';
      const hasSecondarySchoolOrEca = url.searchParams.get('eca') !== 'false';
      const hasIntentToResideInNovaScotia = url.searchParams.get('intent') !== 'false';
      const hasSignedReturnOfServiceWithNshOrIwk = url.searchParams.get('ros') === 'true';
      const hasCpsnsLicensureOrAssessment = url.searchParams.get('cpsns') === 'true';
      const isSelfEmployed = url.searchParams.get('selfEmployed') === 'true';
      const candidateName = url.searchParams.get('name') || 'Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateNovaScotiaExperienceStream({
        stream,
        candidateAge,
        nocCode,
        teerLevel,
        monthsWorkedInNovaScotia,
        hoursWorkedInNovaScotia,
        languageClbScore,
        hasActiveExpressEntryProfile,
        hasValidWorkPermitDuringExperience,
        hasSecondarySchoolOrEca,
        hasIntentToResideInNovaScotia,
        hasSignedReturnOfServiceWithNshOrIwk,
        hasCpsnsLicensureOrAssessment,
        isSelfEmployed,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/quebec-peq-worker') {
      const monthsWorkedInQuebec = url.searchParams.get('qcMonths') ? Number(url.searchParams.get('qcMonths')) : 26;
      const weeklyHoursWorked = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 37.5;
      const jobTeerLevel = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 2;
      const isCurrentlyEmployedInQuebec = url.searchParams.get('employed') !== 'false';
      const hasValidWorkPermitStatus = url.searchParams.get('validPermit') !== 'false';
      const principalOralFrenchLevel = url.searchParams.get('frenchLevel') ? Number(url.searchParams.get('frenchLevel')) : 7;
      const hasCompletedValuesAttestation = url.searchParams.get('values') !== 'false';
      const hasAccompanyingSpouse = url.searchParams.get('hasSpouse') === 'true';
      const spouseOralFrenchLevel = url.searchParams.get('spouseFrench') ? Number(url.searchParams.get('spouseFrench')) : 4;
      const isSelfEmployed = url.searchParams.get('selfEmployed') === 'true';
      const isSeasonalAgriculturalWorker = url.searchParams.get('seasonal') === 'true';
      const applicantName = url.searchParams.get('name') || 'Demandeur';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateQuebecPeqTemporaryWorker({
        monthsWorkedInQuebec,
        weeklyHoursWorked,
        jobTeerLevel,
        isCurrentlyEmployedInQuebec,
        hasValidWorkPermitStatus,
        principalOralFrenchLevel,
        hasCompletedValuesAttestation,
        hasAccompanyingSpouse,
        spouseOralFrenchLevel,
        isSelfEmployed,
        isSeasonalAgriculturalWorker,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/alberta-commercial-distress') {
      const rentArrearsClaimedCad = url.searchParams.get('arrears') ? Number(url.searchParams.get('arrears')) : 15000;
      const goodsEstimatedValueCad = url.searchParams.get('goodsValue') ? Number(url.searchParams.get('goodsValue')) : 45000;
      const isSeizureExecutedByLicensedAgency = url.searchParams.get('licensedBailiff') !== 'false';
      const hasLandlordChangedLocksOrTerminatedLease = url.searchParams.get('changedLocks') === 'true';
      const wasDistressWarrantAndNoticeOfSeizureServed = url.searchParams.get('noticeServed') !== 'false';
      const wasNoticeOfObjectionFormProvided = url.searchParams.get('formProvided') !== 'false';
      const daysElapsedSinceSeizure = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 4;
      const tenantFiledNoticeOfObjection = url.searchParams.get('objected') === 'true';
      const thirdPartyLeasedEquipmentIncluded = url.searchParams.get('thirdParty') === 'true';
      const landlordThreatensImmediateSaleWithin5Days = url.searchParams.get('prematureSale') === 'true';
      const tenantBusinessName = url.searchParams.get('businessName') || 'Commercial Tenant Ltd.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, auditAlbertaCommercialDistress({
        rentArrearsClaimedCad,
        goodsEstimatedValueCad,
        isSeizureExecutedByLicensedAgency,
        hasLandlordChangedLocksOrTerminatedLease,
        wasDistressWarrantAndNoticeOfSeizureServed,
        wasNoticeOfObjectionFormProvided,
        daysElapsedSinceSeizure,
        tenantFiledNoticeOfObjection,
        thirdPartyLeasedEquipmentIncluded,
        landlordThreatensImmediateSaleWithin5Days,
        tenantBusinessName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/trp-inadmissibility') {
      const inadmissibilityType = url.searchParams.get('type') || 'criminality_s36_2';
      const yearsElapsedSinceSentenceOrTrigger = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 4;
      const compellingReasonCategory = url.searchParams.get('reason') || 'urgent_family_need';
      const hasDocumentaryProofOfCompellingNeed = url.searchParams.get('proof') !== 'false';
      const hasCleanSubsequentRecord = url.searchParams.get('cleanRecord') !== 'false';
      const hasCompletedAllSentencesAndFines = url.searchParams.get('finesPaid') !== 'false';
      const hasSevereViolenceOrWeapons = url.searchParams.get('violence') === 'true';
      const applicantLocation = url.searchParams.get('location') || 'outside_canada';
      const hasCanadianCitizenFamilyAffected = url.searchParams.get('citizenFamily') !== 'false';
      const applicantName = url.searchParams.get('name') || 'Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateTrpCompellingBalance({
        inadmissibilityType,
        yearsElapsedSinceSentenceOrTrigger,
        compellingReasonCategory,
        hasDocumentaryProofOfCompellingNeed,
        hasCleanSubsequentRecord,
        hasCompletedAllSentencesAndFines,
        hasSevereViolenceOrWeapons,
        applicantLocation,
        hasCanadianCitizenFamilyAffected,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/federal-skilled-trades') {
      const nocCode = url.searchParams.get('noc') || '72410';
      const yearsOfTradesExperience = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 3;
      const hoursOfTradesExperience = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 4500;
      const hasCanadianCertificateOfQualification = url.searchParams.get('cert') === 'true';
      const certifyingProvince = url.searchParams.get('province') || 'ON';
      const hasQualifyingCanadianJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const jobOfferDurationYears = url.searchParams.get('jobDuration') ? Number(url.searchParams.get('jobDuration')) : 1;
      const numberOfEmployersOnJobOffer = url.searchParams.get('employers') ? Number(url.searchParams.get('employers')) : 1;
      const clbSpeaking = url.searchParams.get('speaking') ? Number(url.searchParams.get('speaking')) : 5;
      const clbListening = url.searchParams.get('listening') ? Number(url.searchParams.get('listening')) : 5;
      const clbReading = url.searchParams.get('reading') ? Number(url.searchParams.get('reading')) : 4;
      const clbWriting = url.searchParams.get('writing') ? Number(url.searchParams.get('writing')) : 4;
      const hasActiveExpressEntryProfile = url.searchParams.get('ee') !== 'false';
      const currentlyAuthorizedToWorkInCanada = url.searchParams.get('workAuth') !== 'false';
      const settlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 18000;
      const candidateName = url.searchParams.get('name') || 'Tradesperson';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateFederalSkilledTradesProgram({
        nocCode,
        yearsOfTradesExperience,
        hoursOfTradesExperience,
        hasCanadianCertificateOfQualification,
        certifyingProvince,
        hasQualifyingCanadianJobOffer,
        jobOfferDurationYears,
        numberOfEmployersOnJobOffer,
        clbSpeaking,
        clbListening,
        clbReading,
        clbWriting,
        hasActiveExpressEntryProfile,
        currentlyAuthorizedToWorkInCanada,
        settlementFundsCad,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/bc-strata-ev-charging') {
      const requestDate = url.searchParams.get('requestDate') || '2026-08-01';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      const stallType = url.searchParams.get('stallType') || 'limited_common_property';
      const applicantStatus = url.searchParams.get('status') || 'owner';
      const strataLotCount = url.searchParams.get('lots') ? Number(url.searchParams.get('lots')) : 48;
      const strataRegion = url.searchParams.get('region') || 'metro_vancouver';
      const hasStrataCouncilResponded = url.searchParams.get('responded') === 'true';
      const councilDecision = url.searchParams.get('decision') || 'pending';
      const refusalReasonCategory = url.searchParams.get('refusalReason') || 'none';
      const hasElectricalPlanningReportCompleted = url.searchParams.get('epr') === 'true';
      const hasOwnerAgreedToPayAllCostsAndInsurance = url.searchParams.get('payCosts') !== 'false';
      const strataPlanNumber = url.searchParams.get('plan') || 'LMS-1234';
      const ownerName = url.searchParams.get('name') || 'Strata Owner';
      return send(200, evaluateBcStrataEvCharging({
        requestDate,
        currentDate,
        stallType,
        applicantStatus,
        strataLotCount,
        strataRegion,
        hasStrataCouncilResponded,
        councilDecision,
        refusalReasonCategory,
        hasElectricalPlanningReportCompleted,
        hasOwnerAgreedToPayAllCostsAndInsurance,
        strataPlanNumber,
        ownerName
      }));
    }
    if(path==='/v1/tools/on-pay-transparency') {
      const isPubliclyAdvertisedJobPosting = url.searchParams.get('publicAd') !== 'false';
      const includesExpectedCompensationOrRange = url.searchParams.get('hasRange') !== 'false';
      const salaryRangeMinCad = url.searchParams.get('minSalary') ? Number(url.searchParams.get('minSalary')) : 65000;
      const salaryRangeMaxCad = url.searchParams.get('maxSalary') ? Number(url.searchParams.get('maxSalary')) : 85000;
      const usesAiToScreenApplicants = url.searchParams.get('usesAi') === 'true';
      const disclosesAiUsageInPosting = url.searchParams.get('disclosesAi') !== 'false';
      const requiresCanadianWorkExperience = url.searchParams.get('canadianExp') === 'true';
      const employerTotalHeadcount = url.searchParams.get('headcount') ? Number(url.searchParams.get('headcount')) : 25;
      const hasCompletedPayEquityAudit = url.searchParams.get('payEquity') !== 'false';
      const employerName = url.searchParams.get('employer') || 'Ontario Employer Corp.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, auditOntarioPayTransparencyAndPosting({
        isPubliclyAdvertisedJobPosting,
        includesExpectedCompensationOrRange,
        salaryRangeMinCad,
        salaryRangeMaxCad,
        usesAiToScreenApplicants,
        disclosesAiUsageInPosting,
        requiresCanadianWorkExperience,
        employerTotalHeadcount,
        hasCompletedPayEquityAudit,
        employerName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/yukon-critical-impact') {
      const targetNocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 4;
      const nocCode = url.searchParams.get('noc') || '65201';
      const monthsOfRelatedExperience = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 8;
      const hasPermanentFullTimeOffer = url.searchParams.get('fullTime') !== 'false';
      const weeklyOfferedHours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 35;
      const hourlyWageCad = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 18.5;
      const employerOperatingYearsInYukon = url.searchParams.get('employerYears') ? Number(url.searchParams.get('employerYears')) : 2;
      const employerRecruitmentAdvertisedWeeks = url.searchParams.get('adWeeks') ? Number(url.searchParams.get('adWeeks')) : 4;
      const languageClbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 4;
      const hasHighSchoolOrEca = url.searchParams.get('eca') !== 'false';
      const currentStatusInCanada = url.searchParams.get('status') || 'work_permit';
      const targetCommunity = url.searchParams.get('community') || 'whitehorse';
      const isApplyingForCommunityPilot = url.searchParams.get('communityPilot') === 'true';
      const candidateName = url.searchParams.get('name') || 'Nominee Candidate';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateYukonCriticalImpactWorker({
        targetNocTeer,
        nocCode,
        monthsOfRelatedExperience,
        hasPermanentFullTimeOffer,
        weeklyOfferedHours,
        hourlyWageCad,
        employerOperatingYearsInYukon,
        employerRecruitmentAdvertisedWeeks,
        languageClbScore,
        hasHighSchoolOrEca,
        currentStatusInCanada,
        targetCommunity,
        isApplyingForCommunityPilot,
        candidateName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/tfw-employer-transition') {
      const currentWorkPermitExpiryDate = url.searchParams.get('expiry') || '2026-11-30';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      const hasSubmittedNewWorkPermitApplication = url.searchParams.get('submitted') !== 'false';
      const applicationSubmissionDate = url.searchParams.get('submissionDate') || '2026-10-15';
      const hasPositiveLmiaOrExemption = url.searchParams.get('lmia') !== 'false';
      const hasRequestedPublicPolicyInterimAuthorization = url.searchParams.get('interimRequested') !== 'false';
      const hasReceivedIrccInterimAuthorizationEmail = url.searchParams.get('interimReceived') === 'true';
      const hasStartedWorkingForNewEmployer = url.searchParams.get('startedNew') === 'true';
      const statusAlreadyExpired = url.searchParams.get('expired') === 'true';
      const daysElapsedSinceExpiry = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 0;
      const workerName = url.searchParams.get('name') || 'Worker';
      const currentEmployerName = url.searchParams.get('oldEmployer') || 'Old Employer Inc.';
      const newEmployerName = url.searchParams.get('newEmployer') || 'New Employer Ltd.';
      return send(200, evaluateForeignWorkerPermitTransition({
        currentWorkPermitExpiryDate,
        currentDate,
        hasSubmittedNewWorkPermitApplication,
        applicationSubmissionDate,
        hasPositiveLmiaOrExemption,
        hasRequestedPublicPolicyInterimAuthorization,
        hasReceivedIrccInterimAuthorizationEmail,
        hasStartedWorkingForNewEmployer,
        statusAlreadyExpired,
        daysElapsedSinceExpiry,
        workerName,
        currentEmployerName,
        newEmployerName
      }));
    }
    if(path==='/v1/tools/pei-occupations-demand') {
      const nocCode = url.searchParams.get('noc') || '33102';
      const jobOfferFullTime = url.searchParams.get('fullTime') !== 'false';
      const jobOfferPermanentOrTwoYears = url.searchParams.get('permanent') !== 'false';
      const employerOperatedTwoYearsInPei = url.searchParams.get('employerYears') !== 'false';
      const hasValidWorkPermitOrAuthorization = url.searchParams.get('workPermit') !== 'false';
      const monthsOfDirectExperienceInLastFiveYears = url.searchParams.get('monthsExp') ? Number(url.searchParams.get('monthsExp')) : 18;
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 30;
      const clbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 5;
      const hasHighSchoolDiplomaOrEca = url.searchParams.get('highSchool') !== 'false';
      const liquidFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 12000;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const intendsToResideInPei = url.searchParams.get('intentPei') !== 'false';
      return send(200, evaluatePeiOccupationsInDemand({
        nocCode,
        jobOfferFullTime,
        jobOfferPermanentOrTwoYears,
        employerOperatedTwoYearsInPei,
        hasValidWorkPermitOrAuthorization,
        monthsOfDirectExperienceInLastFiveYears,
        applicantAge,
        clbScore,
        hasHighSchoolDiplomaOrEca,
        liquidFundsCad,
        familySize,
        intendsToResideInPei
      }));
    }
    if(path==='/v1/tools/bc-esa-group-termination') {
      const affectedEmployeesCount = url.searchParams.get('affectedCount') ? Number(url.searchParams.get('affectedCount')) : 75;
      const twoMonthWindow = url.searchParams.get('twoMonthWindow') !== 'false';
      const singleLocation = url.searchParams.get('singleLocation') !== 'false';
      const groupNoticeWeeksGiven = url.searchParams.get('noticeGivenWeeks') ? Number(url.searchParams.get('noticeGivenWeeks')) : 0;
      const individualTenureMonths = url.searchParams.get('tenureMonths') ? Number(url.searchParams.get('tenureMonths')) : 36;
      const regularWeeklyWageCad = url.searchParams.get('weeklyWage') ? Number(url.searchParams.get('weeklyWage')) : 1200;
      const isUnionized = url.searchParams.get('unionized') === 'true';
      const ministerNotified = url.searchParams.get('ministerNotified') === 'true';
      const unionNotified = url.searchParams.get('unionNotified') === 'true';
      const isConstructionIndustry = url.searchParams.get('construction') === 'true';
      const isCasualOrSeasonalLayoff = url.searchParams.get('seasonal') === 'true';
      const isDefiniteTermContract = url.searchParams.get('definiteTerm') === 'true';
      const isJustCauseTermination = url.searchParams.get('justCause') === 'true';
      return send(200, evaluateBcGroupTerminationNotice({
        affectedEmployeesCount,
        twoMonthWindow,
        singleLocation,
        groupNoticeWeeksGiven,
        individualTenureMonths,
        regularWeeklyWageCad,
        isUnionized,
        ministerNotified,
        unionNotified,
        isConstructionIndustry,
        isCasualOrSeasonalLayoff,
        isDefiniteTermContract,
        isJustCauseTermination
      }));
    }
    if(path==='/v1/tools/start-up-visa') {
      const entityType = url.searchParams.get('entityType') || 'VENTURE_CAPITAL_FUND';
      const hasCommitmentCertificate = url.searchParams.get('commitmentCert') !== 'false';
      const hasLetterOfSupport = url.searchParams.get('letterSupport') !== 'false';
      const investmentAmountCad = url.searchParams.get('investmentCad') ? Number(url.searchParams.get('investmentCad')) : 200000;
      const acceptedIntoIncubationProgram = url.searchParams.get('incubatorAccepted') === 'true';
      const numberOfCoOwnersApplying = url.searchParams.get('coOwners') ? Number(url.searchParams.get('coOwners')) : 1;
      const applicantVotingRightsPercentage = url.searchParams.get('applicantPct') ? Number(url.searchParams.get('applicantPct')) : 20;
      const jointVotingRightsPercentage = url.searchParams.get('jointPct') ? Number(url.searchParams.get('jointPct')) : 60;
      const isIdentifiedAsEssentialApplicant = url.searchParams.get('essential') === 'true';
      const clbSpeaking = url.searchParams.get('speaking') ? Number(url.searchParams.get('speaking')) : 5;
      const clbListening = url.searchParams.get('listening') ? Number(url.searchParams.get('listening')) : 5;
      const clbReading = url.searchParams.get('reading') ? Number(url.searchParams.get('reading')) : 5;
      const clbWriting = url.searchParams.get('writing') ? Number(url.searchParams.get('writing')) : 5;
      const availableSettlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 20000;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const canadianIncorporationPlannedOrCompleted = url.searchParams.get('incorporated') !== 'false';
      const activeOngoingManagementInCanada = url.searchParams.get('managementInCanada') !== 'false';
      return send(200, evaluateStartUpVisaEligibility({
        entityType,
        hasCommitmentCertificate,
        hasLetterOfSupport,
        investmentAmountCad,
        acceptedIntoIncubationProgram,
        numberOfCoOwnersApplying,
        applicantVotingRightsPercentage,
        jointVotingRightsPercentage,
        isIdentifiedAsEssentialApplicant,
        clbSpeaking,
        clbListening,
        clbReading,
        clbWriting,
        availableSettlementFundsCad,
        familySize,
        canadianIncorporationPlannedOrCompleted,
        activeOngoingManagementInCanada
      }));
    }
    if(path==='/v1/tools/ontario-tenancy-assignment') {
      const requestType = url.searchParams.get('requestType') || 'ASSIGNMENT';
      const isGeneralRequest = url.searchParams.get('isGeneral') !== 'false';
      const daysSinceRequestMade = url.searchParams.get('daysPassed') ? Number(url.searchParams.get('daysPassed')) : 8;
      const landlordResponse = url.searchParams.get('landlordResponse') || 'NO_RESPONSE';
      const refusalReason = url.searchParams.get('refusalReason') || '';
      const outOfPocketFeeChargedCad = url.searchParams.get('feeCharged') ? Number(url.searchParams.get('feeCharged')) : 0;
      const actualDirectExpenseIncurredCad = url.searchParams.get('actualExpense') ? Number(url.searchParams.get('actualExpense')) : 0;
      const tenantWishesToTerminate = url.searchParams.get('wishesToTerminate') !== 'false';
      return send(200, evaluateOntarioTenancyAssignmentSublet({
        requestType,
        isGeneralRequest,
        daysSinceRequestMade,
        landlordResponse,
        refusalReason,
        outOfPocketFeeChargedCad,
        actualDirectExpenseIncurredCad,
        tenantWishesToTerminate
      }));
    }
    if(path==='/v1/tools/nbpnp-skilled-worker') {
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 30;
      const targetNocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 2;
      const firstLanguageClb = url.searchParams.get('firstLangClb') ? Number(url.searchParams.get('firstLangClb')) : 7;
      const hasSecondOfficialLanguageClb5Plus = url.searchParams.get('secondLangClb5') === 'true';
      const educationLevel = url.searchParams.get('education') || 'BACHELORS';
      const yearsOfRelatedExperience = url.searchParams.get('expYears') ? Number(url.searchParams.get('expYears')) : 3;
      const hasPermanentFullTimeJobOfferInNb = url.searchParams.get('jobOffer') !== 'false';
      const employerOperatedTwoYearsInNb = url.searchParams.get('employerYears') !== 'false';
      const jobOfferWageMeetsMedian = url.searchParams.get('medianWage') !== 'false';
      const currentlyWorkingInNb = url.searchParams.get('workingInNb') === 'true';
      const liquidFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 15000;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const spouseClb5Plus = url.searchParams.get('spouseClb5') === 'true';
      const previousNbStudyYears = url.searchParams.get('nbStudyYears') ? Number(url.searchParams.get('nbStudyYears')) : 0;
      const previousNbWorkYears = url.searchParams.get('nbWorkYears') ? Number(url.searchParams.get('nbWorkYears')) : 0;
      const hasCloseFamilyInNb = url.searchParams.get('closeFamily') === 'true';
      const intendsToResideInNb = url.searchParams.get('intentNb') !== 'false';
      return send(200, evaluateNbpnpSkilledWorker({
        applicantAge,
        targetNocTeer,
        firstLanguageClb,
        hasSecondOfficialLanguageClb5Plus,
        educationLevel,
        yearsOfRelatedExperience,
        hasPermanentFullTimeJobOfferInNb,
        employerOperatedTwoYearsInNb,
        jobOfferWageMeetsMedian,
        currentlyWorkingInNb,
        liquidFundsCad,
        familySize,
        adaptabilityFactors: {
          spouseClb5Plus,
          previousNbStudyYears,
          previousNbWorkYears,
          hasCloseFamilyInNb
        },
        intendsToResideInNb
      }));
    }
    if(path==='/v1/tools/self-employed-persons') {
      const activityType = url.searchParams.get('activityType') || 'CULTURAL_ACTIVITIES';
      const yearsOfSelfEmployedExperience = url.searchParams.get('selfExp') ? Number(url.searchParams.get('selfExp')) : 3;
      const yearsOfWorldClassParticipation = url.searchParams.get('worldExp') ? Number(url.searchParams.get('worldExp')) : 0;
      const educationLevel = url.searchParams.get('education') || 'BACHELORS';
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 32;
      const firstOfficialLanguageClb = url.searchParams.get('clb1') ? Number(url.searchParams.get('clb1')) : 7;
      const secondOfficialLanguageClb = url.searchParams.get('clb2') ? Number(url.searchParams.get('clb2')) : 0;
      const spouseEducationLevel = url.searchParams.get('spouseEdu') || 'BACHELORS';
      const previousCanadianStudyYears = url.searchParams.get('canStudy') ? Number(url.searchParams.get('canStudy')) : 0;
      const previousCanadianWorkYears = url.searchParams.get('canWork') ? Number(url.searchParams.get('canWork')) : 0;
      const hasCloseRelativeInCanada = url.searchParams.get('closeRelative') === 'true';
      const intendsAndAbleToBeSelfEmployed = url.searchParams.get('intendsSelfEmployed') !== 'false';
      const willMakeSignificantContributionToCanada = url.searchParams.get('significantContribution') !== 'false';
      const settlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 30000;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      return send(200, evaluateSelfEmployedProgram({
        activityType,
        yearsOfSelfEmployedExperience,
        yearsOfWorldClassParticipation,
        educationLevel,
        applicantAge,
        firstOfficialLanguageClb,
        secondOfficialLanguageClb,
        adaptabilityFactors: {
          spouseEducationLevel,
          previousCanadianStudyYears,
          previousCanadianWorkYears,
          hasCloseRelativeInCanada
        },
        intendsAndAbleToBeSelfEmployed,
        willMakeSignificantContributionToCanada,
        settlementFundsCad,
        familySize
      }));
    }
    if(path==='/v1/tools/alberta-overtime-banking') {
      const regularHourlyWageCad = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 25;
      const dailyHoursWorked = url.searchParams.get('hoursWorked') ? url.searchParams.get('hoursWorked').split(',').map(Number) : [8, 8, 8, 8, 8];
      const hasWrittenOvertimeAgreement = url.searchParams.get('agreement') === 'true';
      const existingBankedHours = url.searchParams.get('banked') ? Number(url.searchParams.get('banked')) : 0;
      const monthsElapsedSinceBanked = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 0;
      const isEmploymentTerminating = url.searchParams.get('terminating') === 'true';
      const hoursTakenAsTimeOff = url.searchParams.get('timeOffTaken') ? Number(url.searchParams.get('timeOffTaken')) : 0;
      const hasManagerialOrProfessionalExemption = url.searchParams.get('exempt') === 'true';
      return send(200, evaluateAlbertaOvertimeBanking({
        regularHourlyWageCad,
        dailyHoursWorked,
        hasWrittenOvertimeAgreement,
        existingBankedHours,
        monthsElapsedSinceBanked,
        isEmploymentTerminating,
        hoursTakenAsTimeOff,
        hasManagerialOrProfessionalExemption
      }));
    }
    if(path==='/v1/tools/ontario-roommate-rights') {
      const sharesKitchenOrBathWithOwnerOrFamily = url.searchParams.get('sharedFacilities') === 'true';
      const occupantName = url.searchParams.get('occupant') || 'Occupant';
      const isNamedOnTenancyAgreement = url.searchParams.get('namedOnLease') === 'true';
      const tenantHasVacatedPermanently = url.searchParams.get('vacatedPermanently') === 'true';
      const daysSinceLandlordDiscoveredOccupancy = url.searchParams.get('daysDiscovered') ? Number(url.searchParams.get('daysDiscovered')) : 0;
      const landlordChargesGuestOrRoommateFee = url.searchParams.get('guestFeeCharged') === 'true';
      const guestFeeAmountMonthlyCad = url.searchParams.get('guestFeeCad') ? Number(url.searchParams.get('guestFeeCad')) : 0;
      const leaseContainsNoGuestOrRoommateClause = url.searchParams.get('noGuestClause') === 'true';
      const disputeNature = url.searchParams.get('disputeNature') || 'ROOMMATE_EVICTION_BY_TENANT';
      const daysNoticeGivenToRoommate = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 14;
      return send(200, evaluateOntarioRoommateAndOccupantRights({
        sharesKitchenOrBathWithOwnerOrFamily,
        occupantName,
        isNamedOnTenancyAgreement,
        tenantHasVacatedPermanently,
        daysSinceLandlordDiscoveredOccupancy,
        landlordChargesGuestOrRoommateFee,
        guestFeeAmountMonthlyCad,
        leaseContainsNoGuestOrRoommateClause,
        disputeNature,
        daysNoticeGivenToRoommate
      }));
    }
    if(path==='/v1/tools/sinp-tech-talent') {
      const nocCode = url.searchParams.get('noc') || '21232';
      const hasSinpJobApprovalLetter = url.searchParams.get('jal') !== 'false';
      const isPermanentFullTimeOffer = url.searchParams.get('permanent') !== 'false';
      const isCurrentlyWorkingInSaskatchewan = url.searchParams.get('workingInSk') === 'true';
      const monthsWorkedInSaskWithEmployer = url.searchParams.get('monthsInSk') ? Number(url.searchParams.get('monthsInSk')) : 0;
      const monthsOfRelatedExperiencePastFiveYears = url.searchParams.get('pastMonthsExp') ? Number(url.searchParams.get('pastMonthsExp')) : 24;
      const isSaskatchewanPostSecGraduate = url.searchParams.get('skGrad') === 'true';
      const clbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 7;
      const isExpressEntryStream = url.searchParams.get('expressEntry') === 'true';
      const hasActiveExpressEntryProfile = url.searchParams.get('eeProfile') === 'true';
      const hasPostSecondaryTechEducation = url.searchParams.get('techEdu') !== 'false';
      const hasApegsLicensureOrEligibilityLetter = url.searchParams.get('apegs') === 'true';
      const intendsToResideInSaskatchewan = url.searchParams.get('intentSk') !== 'false';
      return send(200, evaluateSinpTechTalent({
        nocCode,
        hasSinpJobApprovalLetter,
        isPermanentFullTimeOffer,
        isCurrentlyWorkingInSaskatchewan,
        monthsWorkedInSaskWithEmployer,
        monthsOfRelatedExperiencePastFiveYears,
        isSaskatchewanPostSecGraduate,
        clbScore,
        isExpressEntryStream,
        hasActiveExpressEntryProfile,
        hasPostSecondaryTechEducation,
        hasApegsLicensureOrEligibilityLetter,
        intendsToResideInSaskatchewan
      }));
    }
    if(path==='/v1/tools/caregiver-direct-pr') {
      const nocCode = url.searchParams.get('noc') || '44100';
      const jobOfferFullTime = url.searchParams.get('fullTime') !== 'false';
      const jobOfferNonSeasonal = url.searchParams.get('nonSeasonal') !== 'false';
      const jobOfferOutsideQuebec = url.searchParams.get('outsideQuebec') !== 'false';
      const employerType = url.searchParams.get('employerType') || 'PRIVATE_HOUSEHOLD';
      const careRecipientType = url.searchParams.get('careRecipient') || 'CHILDREN_UNDER_18';
      const employerMeetsLicoIncomeTest = url.searchParams.get('licoMeets') !== 'false';
      const jobRequiresMandatoryLiveIn = url.searchParams.get('mandatoryLiveIn') === 'true';
      const clbSpeaking = url.searchParams.get('speaking') ? Number(url.searchParams.get('speaking')) : 4;
      const clbListening = url.searchParams.get('listening') ? Number(url.searchParams.get('listening')) : 4;
      const clbReading = url.searchParams.get('reading') ? Number(url.searchParams.get('reading')) : 4;
      const clbWriting = url.searchParams.get('writing') ? Number(url.searchParams.get('writing')) : 4;
      const hasHighSchoolDiplomaOrEca = url.searchParams.get('highSchool') !== 'false';
      const canadianCaregiverExperienceMonths = url.searchParams.get('canExpMonths') ? Number(url.searchParams.get('canExpMonths')) : 0;
      const hasValidLegalStatusInCanada = url.searchParams.get('legalStatus') !== 'false';
      const applicantLocation = url.searchParams.get('location') || 'IN_CANADA';
      return send(200, evaluateCaregiverDirectToPr({
        nocCode,
        jobOfferFullTime,
        jobOfferNonSeasonal,
        jobOfferOutsideQuebec,
        employerType,
        careRecipientType,
        employerMeetsLicoIncomeTest,
        jobRequiresMandatoryLiveIn,
        clbSpeaking,
        clbListening,
        clbReading,
        clbWriting,
        hasHighSchoolDiplomaOrEca,
        canadianCaregiverExperienceMonths,
        hasValidLegalStatusInCanada,
        applicantLocation
      }));
    }
    if(path==='/v1/tools/citizenship-revocation') {
      const noticeOfIntentDate = url.searchParams.get('noticeDate') || '2026-10-01';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      const allegationType = url.searchParams.get('allegationType') || 'FALSE_REPRESENTATION';
      const allegationContext = url.searchParams.get('context') || 'RESIDENCE_CALCULATION';
      const yearsAsCanadianCitizen = url.searchParams.get('citizenYears') ? Number(url.searchParams.get('citizenYears')) : 8;
      const yearsResidingInCanada = url.searchParams.get('residenceYears') ? Number(url.searchParams.get('residenceYears')) : 12;
      const hasSubstantialTiesToCanada = url.searchParams.get('ties') !== 'false';
      const hasMinorChildrenAffected = url.searchParams.get('children') !== 'false';
      const minorChildrenAreCanadianCitizens = url.searchParams.get('citizenChildren') !== 'false';
      const wouldBeRenderedStateless = url.searchParams.get('stateless') === 'true';
      const requestedFederalCourtReference = url.searchParams.get('courtRef') !== 'false';
      const hasCompellingHAndCGrounds = url.searchParams.get('hAndC') !== 'false';
      return send(200, evaluateCitizenshipRevocationDefense({
        noticeOfIntentDate,
        currentDate,
        allegationType,
        allegationContext,
        yearsAsCanadianCitizen,
        yearsResidingInCanada,
        hasSubstantialTiesToCanada,
        hasMinorChildrenAffected,
        minorChildrenAreCanadianCitizens,
        wouldBeRenderedStateless,
        requestedFederalCourtReference,
        hasCompellingHAndCGrounds
      }));
    }
    if(path==='/v1/tools/bc-roommate-rights') {
      const sharesKitchenOrBathroomWithOwner = url.searchParams.get('sharedFacilities') === 'true';
      const isNamedOnTenancyAgreement = url.searchParams.get('namedOnLease') === 'true';
      const disputeType = url.searchParams.get('disputeType') || 'TENANT_ROOMMATE_DISPUTE';
      const landlordChargesGuestOrOccupantFee = url.searchParams.get('guestFeeCharged') === 'true';
      const monthlyGuestFeeCad = url.searchParams.get('guestFeeCad') ? Number(url.searchParams.get('guestFeeCad')) : 0;
      const tenancyAgreementLimitsOccupants = url.searchParams.get('limitsOccupants') === 'true';
      const statedOccupancyLimit = url.searchParams.get('limitCount') ? Number(url.searchParams.get('limitCount')) : 2;
      const currentOccupantsCount = url.searchParams.get('currentOccupants') ? Number(url.searchParams.get('currentOccupants')) : 2;
      const daysNoticeGivenToRoommate = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 14;
      return send(200, evaluateBcRoommateAndSharedKitchen({
        sharesKitchenOrBathroomWithOwner,
        isNamedOnTenancyAgreement,
        disputeType,
        landlordChargesGuestOrOccupantFee,
        monthlyGuestFeeCad,
        tenancyAgreementLimitsOccupants,
        statedOccupancyLimit,
        currentOccupantsCount,
        daysNoticeGivenToRoommate
      }));
    }
    if(path==='/v1/tools/alberta-rural-entrepreneur') {
      const communityName = url.searchParams.get('community') || 'Brooks';
      const isDesignatedRuralCommunity = url.searchParams.get('designated') !== 'false';
      const hasCommunityEndorsementLetter = url.searchParams.get('endorsement') !== 'false';
      const hasCompletedExploratoryVisit = url.searchParams.get('exploratory') !== 'false';
      const netWorthCad = url.searchParams.get('netWorth') ? Number(url.searchParams.get('netWorth')) : 350000;
      const plannedInvestmentCad = url.searchParams.get('investment') ? Number(url.searchParams.get('investment')) : 150000;
      const isBusinessSuccessionOrPurchase = url.searchParams.get('succession') === 'true';
      const plannedOwnershipPercentage = url.searchParams.get('ownership') ? Number(url.searchParams.get('ownership')) : 60;
      const fullTimeJobsCreatedForCanadians = url.searchParams.get('jobs') ? Number(url.searchParams.get('jobs')) : 1;
      const yearsOfBusinessOwnershipOrSeniorManagement = url.searchParams.get('expYears') ? Number(url.searchParams.get('expYears')) : 3;
      const clbScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 5;
      const hasHighSchoolDiplomaOrEca = url.searchParams.get('highSchool') !== 'false';
      const intendsToResideInCommunity = url.searchParams.get('intentCommunity') !== 'false';
      return send(200, evaluateAlbertaRuralEntrepreneur({
        communityName,
        isDesignatedRuralCommunity,
        hasCommunityEndorsementLetter,
        hasCompletedExploratoryVisit,
        netWorthCad,
        plannedInvestmentCad,
        isBusinessSuccessionOrPurchase,
        plannedOwnershipPercentage,
        fullTimeJobsCreatedForCanadians,
        yearsOfBusinessOwnershipOrSeniorManagement,
        clbScore,
        hasHighSchoolDiplomaOrEca,
        intendsToResideInCommunity
      }));
    }
    if(path==='/v1/tools/refugee-cessation') {
      const currentStatusInCanada = url.searchParams.get('status') || 'PERMANENT_RESIDENT';
      const hasAcquiredCanadianCitizenship = url.searchParams.get('citizen') === 'true';
      const hasAppliedForOrRenewedNationalPassport = url.searchParams.get('renewedPassport') === 'true';
      const usedNationalPassportToTravel = url.searchParams.get('usedPassport') === 'true';
      const usedCanadianRefugeeTravelDocument = url.searchParams.get('usedRtd') !== 'false';
      const traveledBackToCountryOfPersecution = url.searchParams.get('traveledOrigin') === 'true';
      const numberOfTripsToCountryOfPersecution = url.searchParams.get('trips') ? Number(url.searchParams.get('trips')) : 0;
      const cumulativeDaysInCountryOfPersecution = url.searchParams.get('daysAbroad') ? Number(url.searchParams.get('daysAbroad')) : 0;
      const purposeOfTravel = url.searchParams.get('purpose') || 'NONE';
      const wasUnderStateCoercionOrDuress = url.searchParams.get('duress') === 'true';
      const ministerHasFiledCessationApplication = url.searchParams.get('ministerFiled') === 'true';
      return send(200, evaluateRefugeeCessationRisk({
        currentStatusInCanada,
        hasAcquiredCanadianCitizenship,
        hasAppliedForOrRenewedNationalPassport,
        usedNationalPassportToTravel,
        usedCanadianRefugeeTravelDocument,
        traveledBackToCountryOfPersecution,
        numberOfTripsToCountryOfPersecution,
        cumulativeDaysInCountryOfPersecution,
        purposeOfTravel,
        wasUnderStateCoercionOrDuress,
        ministerHasFiledCessationApplication
      }));
    }
    if(path==='/v1/tools/on-remote-work-jurisdiction') {
      const employeePhysicalWorkLocation = url.searchParams.get('physicalLocation') || 'ONTARIO';
      const employerHeadquartersLocation = url.searchParams.get('employerHq') || 'BRITISH_COLUMBIA';
      const worksExclusivelyFromHome = url.searchParams.get('workFromHome') !== 'false';
      const employerTotalOntarioHeadcount = url.searchParams.get('headcount') ? Number(url.searchParams.get('headcount')) : 30;
      const hasWrittenDisconnectingFromWorkPolicy = url.searchParams.get('disconnectingPolicy') === 'true';
      const hasNonCompeteClauseInContract = url.searchParams.get('nonCompete') === 'true';
      const contractSignedDate = url.searchParams.get('contractDate') || '2023-01-15';
      const isExecutiveOrCSuite = url.searchParams.get('executive') === 'true';
      const isGroupTerminationEvent = url.searchParams.get('groupTermination') === 'true';
      const totalRemoteEmployeesTerminated = url.searchParams.get('remoteTerminated') ? Number(url.searchParams.get('remoteTerminated')) : 0;
      const totalInOfficeEmployeesTerminated = url.searchParams.get('officeTerminated') ? Number(url.searchParams.get('officeTerminated')) : 0;
      const employeeTenureMonths = url.searchParams.get('tenureMonths') ? Number(url.searchParams.get('tenureMonths')) : 36;
      const weeklySalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 1500;
      return send(200, evaluateOntarioRemoteWorkJurisdiction({
        employeePhysicalWorkLocation,
        employerHeadquartersLocation,
        worksExclusivelyFromHome,
        employerTotalOntarioHeadcount,
        hasWrittenDisconnectingFromWorkPolicy,
        hasNonCompeteClauseInContract,
        contractSignedDate,
        isExecutiveOrCSuite,
        isGroupTerminationEvent,
        totalRemoteEmployeesTerminated,
        totalInOfficeEmployeesTerminated,
        employeeTenureMonths,
        weeklySalaryCad
      }));
    }
    if(path==='/v1/tools/manitoba-leave') {
      const leaveType = url.searchParams.get('leaveType') || 'MATERNITY';
      const monthsOfContinuousService = url.searchParams.get('monthsService') ? Number(url.searchParams.get('monthsService')) : 8;
      const daysOfContinuousService = url.searchParams.get('daysService') ? Number(url.searchParams.get('daysService')) : 240;
      const weeksRequested = url.searchParams.get('weeksRequested') ? Number(url.searchParams.get('weeksRequested')) : 17;
      const interpersonalViolenceDaysRequested = url.searchParams.get('violenceDays') ? Number(url.searchParams.get('violenceDays')) : 5;
      const hasMedicalCertificateProvided = url.searchParams.get('medicalNote') !== 'false';
      const employerRefusedLeave = url.searchParams.get('refused') === 'true';
      const employerDismissedOrDisciplinedEmployee = url.searchParams.get('disciplined') === 'true';
      const employerRefusesReinstatementToSameOrComparableRole = url.searchParams.get('reinstatementRefused') === 'true';
      const regularHourlyWageCad = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 24;
      const regularWeeklyHours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 40;
      return send(200, evaluateManitobaEmploymentLeave({
        leaveType,
        monthsOfContinuousService,
        daysOfContinuousService,
        weeksRequested,
        interpersonalViolenceDaysRequested,
        hasMedicalCertificateProvided,
        employerRefusedLeave,
        employerDismissedOrDisciplinedEmployee,
        employerRefusesReinstatementToSameOrComparableRole,
        regularHourlyWageCad,
        regularWeeklyHours
      }));
    }
    if(path==='/v1/tools/alberta-tenancy-sublease') {
      const transactionType = url.searchParams.get('type') || 'ASSIGNMENT';
      const requestDeliveredDate = url.searchParams.get('requestDate') || '2026-10-01';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      const landlordResponseStatus = url.searchParams.get('responseStatus') || 'NO_RESPONSE';
      const refusalReasonCategory = url.searchParams.get('refusalCategory') || '';
      const refusalReasonExplanation = url.searchParams.get('explanation') || '';
      const feeChargedForConsentCad = url.searchParams.get('feeCharged') ? Number(url.searchParams.get('feeCharged')) : 0;
      return send(200, evaluateAlbertaTenancySubleaseAssignment({
        transactionType,
        requestDeliveredDate,
        currentDate,
        landlordResponseStatus,
        refusalReasonCategory,
        refusalReasonExplanation,
        feeChargedForConsentCad
      }));
    }
    if(path==='/v1/tools/francophone-community-pilot') {
      const communityName = url.searchParams.get('community') || 'Sudbury';
      const hasCommunityRecommendationLetter = url.searchParams.get('recommendation') !== 'false';
      const targetNocTeer = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 2;
      const hasPermanentFullTimeJobOffer = url.searchParams.get('jobOffer') !== 'false';
      const jobOfferWithinCommunity = url.searchParams.get('withinCommunity') !== 'false';
      const jobOfferMeetsMedianWage = url.searchParams.get('medianWage') !== 'false';
      const frenchNclcSpeaking = url.searchParams.get('speaking') ? Number(url.searchParams.get('speaking')) : 5;
      const frenchNclcListening = url.searchParams.get('listening') ? Number(url.searchParams.get('listening')) : 5;
      const frenchNclcReading = url.searchParams.get('reading') ? Number(url.searchParams.get('reading')) : 5;
      const frenchNclcWriting = url.searchParams.get('writing') ? Number(url.searchParams.get('writing')) : 5;
      const monthsOfWorkExperiencePastThreeYears = url.searchParams.get('expMonths') ? Number(url.searchParams.get('expMonths')) : 12;
      const hasHighSchoolDiplomaOrEca = url.searchParams.get('highSchool') !== 'false';
      const currentlyWorkingInCanada = url.searchParams.get('workingInCanada') === 'true';
      const liquidSettlementFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 10000;
      const familySize = url.searchParams.get('familySize') ? Number(url.searchParams.get('familySize')) : 1;
      const intendsToResideInCommunity = url.searchParams.get('intentCommunity') !== 'false';
      return send(200, evaluateFrancophoneCommunityPilot({
        communityName,
        hasCommunityRecommendationLetter,
        targetNocTeer,
        hasPermanentFullTimeJobOffer,
        jobOfferWithinCommunity,
        jobOfferMeetsMedianWage,
        frenchNclcSpeaking,
        frenchNclcListening,
        frenchNclcReading,
        frenchNclcWriting,
        monthsOfWorkExperiencePastThreeYears,
        hasHighSchoolDiplomaOrEca,
        currentlyWorkingInCanada,
        liquidSettlementFundsCad,
        familySize,
        intendsToResideInCommunity
      }));
    }
    if(path==='/v1/tools/bc-child-youth-employment') {
      const childAge = url.searchParams.get('childAge') ? Number(url.searchParams.get('childAge')) : 13;
      const proposedOccupationActivity = url.searchParams.get('activity') || 'RETAIL_CASHIER_OR_STOCKING';
      const hasParentalConsentInWriting = url.searchParams.get('parentConsent') !== 'false';
      const hasDirectorChildEmploymentPermit = url.searchParams.get('directorPermit') === 'true';
      const dailyHoursOnSchoolDay = url.searchParams.get('schoolDayHours') ? Number(url.searchParams.get('schoolDayHours')) : 3;
      const dailyHoursOnNonSchoolDay = url.searchParams.get('nonSchoolDayHours') ? Number(url.searchParams.get('nonSchoolDayHours')) : 6;
      const weeklyHoursDuringSchoolWeek = url.searchParams.get('schoolWeekHours') ? Number(url.searchParams.get('schoolWeekHours')) : 15;
      const hasAdultSupervisionOnSite = url.searchParams.get('supervision') !== 'false';
      return send(200, evaluateBcChildYouthEmployment({
        childAge,
        proposedOccupationActivity,
        hasParentalConsentInWriting,
        hasDirectorChildEmploymentPermit,
        dailyHoursOnSchoolDay,
        dailyHoursOnNonSchoolDay,
        weeklyHoursDuringSchoolWeek,
        hasAdultSupervisionOnSite
      }));
    }
    if(path==='/v1/tools/on-creed-accommodation') {
      const creedPracticeCategory = url.searchParams.get('practiceCategory') || 'SUKKAH_STRUCTURE_ON_BALCONY';
      const creedPracticeDescription = url.searchParams.get('description') || 'Erection of temporary Sukkah booth';
      const isSincerelyHeldBelief = url.searchParams.get('sincere') !== 'false';
      const landlordRefusedAccommodation = url.searchParams.get('refused') !== 'false';
      const landlordRefusalGround = url.searchParams.get('refusalGround') || 'BUILDING_AESTHETICS';
      const landlordOfferedAlternativeReasonableAccommodation = url.searchParams.get('alternativeOffered') === 'true';
      const alternativeAccommodationDescription = url.searchParams.get('alternativeDesc') || '';
      const harassmentOrHostileCommentFromLandlord = url.searchParams.get('harassment') === 'true';
      return send(200, evaluateOntarioHousingCreedAccommodation({
        creedPracticeCategory,
        creedPracticeDescription,
        isSincerelyHeldBelief,
        landlordRefusedAccommodation,
        landlordRefusalGround,
        landlordOfferedAlternativeReasonableAccommodation,
        alternativeAccommodationDescription,
        harassmentOrHostileCommentFromLandlord
      }));
    }
    if(path==='/v1/tools/citizenship-residence-audit') {
      const targetDate = url.searchParams.get('targetDate') || new Date().toISOString().slice(0, 10);
      const daysPr = url.searchParams.get('daysPr') ? Number(url.searchParams.get('daysPr')) : 1095;
      const daysTr = url.searchParams.get('daysTr') ? Number(url.searchParams.get('daysTr')) : 0;
      const daysPenal = url.searchParams.get('daysPenal') ? Number(url.searchParams.get('daysPenal')) : 0;
      const isAdult = url.searchParams.get('isAdult') !== 'false';
      const taxCompliant = url.searchParams.get('taxCompliant') !== 'false';
      const languageKnowledge = url.searchParams.get('languageKnowledge') !== 'false';
      const age = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 30;
      return send(200, auditCitizenshipPhysicalPresence({
        applicationTargetDate: targetDate,
        daysPresentAsPermanentResident: daysPr,
        daysPresentAsTemporaryResident: daysTr,
        daysSpentIncarceratedOrProbation: daysPenal,
        isAdultApplicant: isAdult,
        hasIncomeTaxFilingCompliance: taxCompliant,
        meetsLanguageAndKnowledgeCriteria: languageKnowledge,
        applicantAge: age
      }));
    }
    if(path==='/v1/tools/quebec-csq-arrima') {
      const hasSpouse = url.searchParams.get('hasSpouse') === 'true';
      const age = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 30;
      const education = url.searchParams.get('education') || 'bachelor_3_years';
      const areaOfTraining = url.searchParams.get('areaOfTraining') || 'SECTION_B';
      const experienceMonths = url.searchParams.get('experienceMonths') ? Number(url.searchParams.get('experienceMonths')) : 36;
      const frenchListening = url.searchParams.get('frenchListening') ? Number(url.searchParams.get('frenchListening')) : 7;
      const frenchSpeaking = url.searchParams.get('frenchSpeaking') ? Number(url.searchParams.get('frenchSpeaking')) : 7;
      const englishListening = url.searchParams.get('englishListening') ? Number(url.searchParams.get('englishListening')) : 5;
      const englishSpeaking = url.searchParams.get('englishSpeaking') ? Number(url.searchParams.get('englishSpeaking')) : 5;
      const quebecStay = url.searchParams.get('quebecStay') !== 'false';
      const hasVom = url.searchParams.get('hasVom') === 'true';
      const vomOutsideMontreal = url.searchParams.get('vomOutsideMontreal') === 'true';
      const kidsUnder12 = url.searchParams.get('kidsUnder12') ? Number(url.searchParams.get('kidsUnder12')) : 0;
      const kids13to21 = url.searchParams.get('kids13to21') ? Number(url.searchParams.get('kids13to21')) : 0;
      const financialAutonomy = url.searchParams.get('financialAutonomy') !== 'false';
      return send(200, evaluateQuebecCsqSkilledWorker({
        hasAccompanyingSpouse: hasSpouse,
        applicantAge: age,
        educationLevel: education,
        areaOfTrainingSection: areaOfTraining,
        monthsOfQualifiedExperience: experienceMonths,
        frenchOralListeningNiveau: frenchListening,
        frenchOralSpeakingNiveau: frenchSpeaking,
        englishListeningClb: englishListening,
        englishSpeakingClb: englishSpeaking,
        hasQuebecStudyOrWorkStay: quebecStay,
        hasValidatedJobOffer: hasVom,
        isJobOfferOutsideMontrealCmm: vomOutsideMontreal,
        numberOfChildrenUnder12: kidsUnder12,
        numberOfChildren13to21: kids13to21,
        signedFinancialAutonomyContract: financialAutonomy
      }));
    }
    if(path==='/v1/tools/alberta-rest-periods') {
      const shiftHours = url.searchParams.get('shiftHours') ? Number(url.searchParams.get('shiftHours')) : 8;
      const breakMinutes = url.searchParams.get('breakMinutes') ? Number(url.searchParams.get('breakMinutes')) : 30;
      const splitBreak = url.searchParams.get('splitBreak') === 'true';
      const interShiftHours = url.searchParams.get('interShiftHours') ? Number(url.searchParams.get('interShiftHours')) : 12;
      const consecutiveDays = url.searchParams.get('consecutiveDays') ? Number(url.searchParams.get('consecutiveDays')) : 5;
      const restDaysAfter = url.searchParams.get('restDaysAfter') ? Number(url.searchParams.get('restDaysAfter')) : 2;
      const isManager = url.searchParams.get('isManager') === 'true';
      const emergency = url.searchParams.get('emergency') === 'true';
      return send(200, auditAlbertaEmploymentRestPeriods({
        shiftDurationHours: shiftHours,
        restBreakMinutesProvided: breakMinutes,
        isBreakSplitIntoTwoPeriods: splitBreak,
        hoursBetweenConsecutiveShifts: interShiftHours,
        consecutiveWorkDaysWorked: consecutiveDays,
        consecutiveRestDaysProvidedAfterBlock: restDaysAfter,
        isManagerOrSupervisor: isManager,
        isUrgentAccidentOrEmergency: emergency
      }));
    }
    if(path==='/v1/tools/bc-strata-str') {
      const strataBylaw = url.searchParams.get('strataBylaw') !== 'false';
      const isPrincipal = url.searchParams.get('isPrincipal') !== 'false';
      const stayDays = url.searchParams.get('stayDays') ? Number(url.searchParams.get('stayDays')) : 5;
      const population = url.searchParams.get('population') ? Number(url.searchParams.get('population')) : 25000;
      const dailyFine = url.searchParams.get('dailyFine') ? Number(url.searchParams.get('dailyFine')) : 1000;
      const daysFined = url.searchParams.get('daysFined') ? Number(url.searchParams.get('daysFined')) : 3;
      const noticeProvided = url.searchParams.get('noticeProvided') !== 'false';
      const hearingProvided = url.searchParams.get('hearingProvided') !== 'false';
      const suiteOrLaneway = url.searchParams.get('suiteOrLaneway') === 'true';
      return send(200, auditBcStrataShortTermRental({
        hasRegisteredStrBylawProhibition: strataBylaw,
        isPrincipalResidence: isPrincipal,
        rentalStayDays: stayDays,
        communityPopulation: population,
        fineAmountPerDayCad: dailyFine,
        totalDaysFined: daysFined,
        receivedWrittenNoticeOfComplaint: noticeProvided,
        providedOpportunityToBeHeard: hearingProvided,
        isOperatingSecondarySuiteOrLaneway: suiteOrLaneway
      }));
    }
    if(path==='/v1/tools/on-tha-licensing') {
      const role = url.searchParams.get('role') || 'CLIENT_EMPLOYER';
      const isLicensed = url.searchParams.get('isLicensed') === 'true';
      const transitionStatus = url.searchParams.get('transitionStatus') === 'true';
      const feesCharged = url.searchParams.get('feesCharged') === 'true';
      const feeAmount = url.searchParams.get('feeAmount') ? Number(url.searchParams.get('feeAmount')) : 0;
      const unpaidWages = url.searchParams.get('unpaidWages') === 'true';
      const wageAmount = url.searchParams.get('wageAmount') ? Number(url.searchParams.get('wageAmount')) : 0;
      const priorInfractions = url.searchParams.get('priorInfractions') ? Number(url.searchParams.get('priorInfractions')) : 0;
      return send(200, auditOntarioThaLicensing({
        entityRole: role,
        isAgencyLicensedByMlitst: isLicensed,
        hasApplicationInProcessWithTransitionStatus: transitionStatus,
        didAgencyChargeFeesToWorker: feesCharged,
        feeAmountChargedToWorkerCad: feeAmount,
        hasUnpaidWagesOrOvertime: unpaidWages,
        unpaidWagesAmountCad: wageAmount,
        priorContraventionsInPast3Years: priorInfractions
      }));
    }
    if(path==='/v1/tools/federal-ict-work-permit') {
      const relationship = url.searchParams.get('relationship') || 'SUBSIDIARY';
      const role = url.searchParams.get('role') || 'EXECUTIVE_OR_SENIOR_MANAGER';
      const foreignExpMonths = url.searchParams.get('foreignExpMonths') ? Number(url.searchParams.get('foreignExpMonths')) : 24;
      const isStartUp = url.searchParams.get('isStartUp') === 'true';
      const physicalPremises = url.searchParams.get('physicalPremises') !== 'false';
      const yearsSpent = url.searchParams.get('yearsSpent') ? Number(url.searchParams.get('yearsSpent')) : 0;
      const feePaid = url.searchParams.get('feePaid') !== 'false';
      const specialized = url.searchParams.get('specialized') !== 'false';
      return send(200, evaluateFederalIntraCompanyTransferee({
        qualifyingCorporateRelationship: relationship,
        transfereeRole: role,
        continuousForeignEmploymentMonths: foreignExpMonths,
        isNewOfficeStartUp: isStartUp,
        hasSecuredPhysicalPremises: physicalPremises,
        accumulatedYearsOnIctPermitInCanada: yearsSpent,
        employerComplianceFeePaid: feePaid,
        meetsProprietarySpecializedKnowledgeStandard: specialized
      }));
    }
    if(path==='/v1/tools/saskatchewan-layoff-notice') {
      const serviceYears = url.searchParams.get('serviceYears') ? Number(url.searchParams.get('serviceYears')) : 4;
      const weeklyWage = url.searchParams.get('weeklyWage') ? Number(url.searchParams.get('weeklyWage')) : 1200;
      const groupCount = url.searchParams.get('groupCount') ? Number(url.searchParams.get('groupCount')) : 1;
      const justCause = url.searchParams.get('justCause') === 'true';
      const ministerNotified = url.searchParams.get('ministerNotified') !== 'false';
      const actualNotice = url.searchParams.get('actualNotice') ? Number(url.searchParams.get('actualNotice')) : 0;
      return send(200, evaluateSaskatchewanLayoffNotice({
        yearsOfContinuousService: serviceYears,
        regularWeeklyWageCad: weeklyWage,
        employeesTerminatedIn4WeekWindow: groupCount,
        isTerminatedForJustCause: justCause,
        ministerNotifiedInWriting: ministerNotified,
        actualNoticeWeeksGiven: actualNotice
      }));
    }
    if(path==='/v1/tools/alberta-abandoned-goods') {
      const role = url.searchParams.get('role') || 'TENANT';
      const value = url.searchParams.get('value') ? Number(url.searchParams.get('value')) : 2500;
      const daysElapsed = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 15;
      const inventory = url.searchParams.get('inventory') !== 'false';
      const disposedEarly = url.searchParams.get('disposedEarly') === 'true';
      const withheldForRent = url.searchParams.get('withheldForRent') === 'true';
      const storageCosts = url.searchParams.get('storageCosts') ? Number(url.searchParams.get('storageCosts')) : 200;
      const rentArrears = url.searchParams.get('rentArrears') ? Number(url.searchParams.get('rentArrears')) : 1500;
      const auctionProceeds = url.searchParams.get('auctionProceeds') ? Number(url.searchParams.get('auctionProceeds')) : 0;
      return send(200, evaluateAlbertaAbandonedGoods({
        actorRole: role,
        estimatedMarketValueCad: value,
        daysSinceLandlordTookPossession: daysElapsed,
        hasPreparedItemizedInventory: inventory,
        landlordDisposedBefore30Days: disposedEarly,
        landlordRefusedReleaseWithoutRentArrears: withheldForRent,
        accruedStorageAndMovingCostsCad: storageCosts,
        unpaidRentArrearsCad: rentArrears,
        auctionProceedsRealizedCad: auctionProceeds
      }));
    }
    if(path==='/v1/tools/bc-uniform-deductions') {
      const specialClothing = url.searchParams.get('specialClothing') !== 'false';
      const providedFree = url.searchParams.get('providedFree') !== 'false';
      const cleanedOrAllowance = url.searchParams.get('cleanedOrAllowance') !== 'false';
      const uniformFee = url.searchParams.get('uniformFee') ? Number(url.searchParams.get('uniformFee')) : 0;
      const tillShortage = url.searchParams.get('tillShortage') === 'true';
      const tillAmount = url.searchParams.get('tillAmount') ? Number(url.searchParams.get('tillAmount')) : 0;
      const dineAndDash = url.searchParams.get('dineAndDash') === 'true';
      const dineAndDashAmount = url.searchParams.get('dineAndDashAmount') ? Number(url.searchParams.get('dineAndDashAmount')) : 0;
      const breakage = url.searchParams.get('breakage') === 'true';
      const breakageAmount = url.searchParams.get('breakageAmount') ? Number(url.searchParams.get('breakageAmount')) : 0;
      return send(200, auditBcEmploymentUniformAndDeductions({
        requiresSpecialClothingOrUniform: specialClothing,
        employerProvidedUniformFreeOfCharge: providedFree,
        employerCleansUniformOrPaysAllowance: cleanedOrAllowance,
        uniformCostOrDepositChargedCad: uniformFee,
        deductedForTillShortage: tillShortage,
        tillShortageDeductionCad: tillAmount,
        deductedForCustomerDineAndDash: dineAndDash,
        dineAndDashDeductionCad: dineAndDashAmount,
        deductedForEquipmentBreakage: breakage,
        equipmentBreakageDeductionCad: breakageAmount
      }));
    }
    if(path==='/v1/tools/visitor-extension-restoration') {
      const statusExpiry = url.searchParams.get('statusExpiry');
      const submissionDate = url.searchParams.get('submissionDate') || new Date().toISOString().slice(0, 10);
      const metConditions = url.searchParams.get('metConditions') !== 'false';
      const financialSupport = url.searchParams.get('financialSupport') !== 'false';
      const validPassport = url.searchParams.get('validPassport') !== 'false';
      const removalOrder = url.searchParams.get('removalOrder') === 'true';
      return send(200, evaluateFederalVisitorExtensionAndRestoration({
        statusExpiryDate: statusExpiry,
        applicationSubmissionDate: submissionDate,
        hasMetInitialStayConditions: metConditions,
        hasSufficientFinancialSupport: financialSupport,
        holdsValidPassport: validPassport,
        isSubjectToRemovalOrderOrReport: removalOrder
      }));
    }
    if(path==='/v1/tools/bc-pnp-tech') {
      const noc = url.searchParams.get('noc') || '21231';
      const duration = url.searchParams.get('duration') ? Number(url.searchParams.get('duration')) : 365;
      const fullTime = url.searchParams.get('fullTime') !== 'false';
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 45.0;
      const medianWage = url.searchParams.get('medianWage') ? Number(url.searchParams.get('medianWage')) : 38.5;
      const region = url.searchParams.get('region') || 'METRO_VANCOUVER';
      const staff = url.searchParams.get('staff') ? Number(url.searchParams.get('staff')) : 8;
      const expYears = url.searchParams.get('expYears') ? Number(url.searchParams.get('expYears')) : 3;
      const clb = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 7;
      const edu = url.searchParams.get('edu') || 'bachelors_degree';
      return send(200, evaluateBcTechPilotEligibility({
        nocCode: noc,
        jobOfferDurationDays: duration,
        isJobOfferFullTime: fullTime,
        hourlyWageCad: wage,
        regionalMedianHourlyWageCad: medianWage,
        jobLocationRegion: region,
        employerFullTimeEmployeesCount: staff,
        yearsOfDirectTechExperience: expYears,
        languageClbLevel: clb,
        highestEducationLevel: edu
      }));
    }
    if(path==='/v1/tools/ontario-temp-layoff') {
      const weeks = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 14;
      const benefits = url.searchParams.get('benefits') === 'true';
      const payments = url.searchParams.get('payments') === 'true';
      const contractClause = url.searchParams.get('contractClause') === 'true';
      const serviceYears = url.searchParams.get('serviceYears') ? Number(url.searchParams.get('serviceYears')) : 6;
      const weeklyWage = url.searchParams.get('weeklyWage') ? Number(url.searchParams.get('weeklyWage')) : 1250;
      const largePayroll = url.searchParams.get('largePayroll') !== 'false';
      return send(200, auditOntarioTemporaryLayoff({
        layoffDurationWeeks: weeks,
        employerContinuedHealthBenefits: benefits,
        employeeReceivedSubstantialPayments: payments,
        hasValidWrittenLayoffClauseInContract: contractClause,
        yearsOfService: serviceYears,
        regularWeeklyWageCad: weeklyWage,
        employerOntarioPayrollOver2_5Million: largePayroll
      }));
    }
    if(path==='/v1/tools/federal-c10-significant-benefit') {
      const category = url.searchParams.get('category') || 'ECONOMIC';
      const createsJobs = url.searchParams.get('createsJobs') !== 'false';
      const jobsCount = url.searchParams.get('jobsCount') ? Number(url.searchParams.get('jobsCount')) : 3;
      const support = url.searchParams.get('support') !== 'false';
      const letters = url.searchParams.get('letters') ? Number(url.searchParams.get('letters')) : 3;
      const achievements = url.searchParams.get('achievements') !== 'false';
      const businessPlan = url.searchParams.get('businessPlan') !== 'false';
      const selfEmployed = url.searchParams.get('selfEmployed') === 'true';
      const feePaid = url.searchParams.get('feePaid') !== 'false';
      return send(200, evaluateFederalC10SignificantBenefit({
        benefitCategory: category,
        createsDirectJobsForCanadiansOrPrs: createsJobs,
        projectedCanadianJobsCreatedCount: jobsCount,
        hasOfficialSupportFromCanadianGovernmentOrBody: support,
        independentExpertTestimonialLettersCount: letters,
        hasDocumentedRecordOfDistinguishedAchievement: achievements,
        hasDetailedCanadianBusinessOrWorkPlan: businessPlan,
        isSelfEmployedApplicant: selfEmployed,
        employerComplianceFeePaid: feePaid
      }));
    }
    if(path==='/v1/tools/alberta-just-cause') {
      const misconduct = url.searchParams.get('misconduct') || 'PERFORMANCE_ISSUES';
      const warnings = url.searchParams.get('warnings') === 'true';
      const pip = url.searchParams.get('pip') === 'true';
      const serviceYears = url.searchParams.get('serviceYears') ? Number(url.searchParams.get('serviceYears')) : 5;
      const weeklyWage = url.searchParams.get('weeklyWage') ? Number(url.searchParams.get('weeklyWage')) : 1100;
      const noticeGiven = url.searchParams.get('noticeGiven') ? Number(url.searchParams.get('noticeGiven')) : 0;
      return send(200, auditAlbertaTerminationJustCause({
        allegedMisconductCategory: misconduct,
        employerIssuedPriorWrittenWarnings: warnings,
        employeeGivenOpportunityToImprove: pip,
        yearsOfContinuousService: serviceYears,
        regularWeeklyWageCad: weeklyWage,
        actualTerminationNoticeWeeksGiven: noticeGiven
      }));
    }
    if(path==='/v1/tools/manitoba-rent-increase') {
      const currentRent = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 1200;
      const proposedRent = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 1250;
      const noticeMonths = url.searchParams.get('noticeMonths') ? Number(url.searchParams.get('noticeMonths')) : 3;
      const monthsSinceLast = url.searchParams.get('monthsSinceLast') ? Number(url.searchParams.get('monthsSinceLast')) : 12;
      const form2 = url.searchParams.get('form2') !== 'false';
      const agiApproved = url.searchParams.get('agiApproved') === 'true';
      const buildingYear = url.searchParams.get('buildingYear') ? Number(url.searchParams.get('buildingYear')) : 1995;
      return send(200, evaluateManitobaRentIncrease({
        currentMonthlyRentCad: currentRent,
        proposedMonthlyRentCad: proposedRent,
        noticeMonthsGiven: noticeMonths,
        monthsSinceLastRentIncrease: monthsSinceLast,
        usedPrescribedForm2: form2,
        hasApprovedAgiOrderFromRtb: agiApproved,
        buildingFirstOccupiedYear: buildingYear
      }));
    }
    if(path==='/v1/tools/federal-c20-reciprocal-work') {
      const category = url.searchParams.get('category') || 'ACADEMIC_EXCHANGE';
      const agreement = url.searchParams.get('agreement') !== 'false';
      const opportunitiesAbroad = url.searchParams.get('opportunitiesAbroad') !== 'false';
      const outCount = url.searchParams.get('outCount') ? Number(url.searchParams.get('outCount')) : 2;
      const inCount = url.searchParams.get('inCount') ? Number(url.searchParams.get('inCount')) : 2;
      const parity = url.searchParams.get('parity') !== 'false';
      const fullTime = url.searchParams.get('fullTime') !== 'false';
      const feePaid = url.searchParams.get('feePaid') !== 'false';
      return send(200, evaluateFederalReciprocalEmployment({
        exchangeCategory: category,
        hasFormalWrittenReciprocalAgreement: agreement,
        canadiansEnjoySimilarOpportunitiesAbroad: opportunitiesAbroad,
        canadiansExchangedOutCount: outCount,
        foreignWorkersIncomingCount: inCount,
        isExchangeGeneralParityMaintained: parity,
        isJobOfferFullTime: fullTime,
        employerComplianceFeePaid: feePaid
      }));
    }
    if(path==='/v1/tools/bc-landlord-use-eviction') {
      const role = url.searchParams.get('role') || 'TENANT';
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const noticeMonths = url.searchParams.get('noticeMonths') ? Number(url.searchParams.get('noticeMonths')) : 4;
      const daysElapsed = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 10;
      const portal = url.searchParams.get('portal') !== 'false';
      const occupant = url.searchParams.get('occupant') || 'LANDLORD_OR_SPOUSE';
      const failed12Mos = url.searchParams.get('failed12Mos') === 'true';
      const extenuating = url.searchParams.get('extenuating') === 'true';
      const freeRent = url.searchParams.get('freeRent') !== 'false';
      return send(200, evaluateBcLandlordUseEviction({
        actorRole: role,
        monthlyRentCad: rent,
        noticeMonthsGiven: noticeMonths,
        daysElapsedSinceNoticeServed: daysElapsed,
        generatedThroughOfficialWebPortal: portal,
        intendedOccupantRelationship: occupant,
        landlordFailedToOccupyFor12Months: failed12Mos,
        extenuatingCircumstancesExist: extenuating,
        oneMonthFreeRentProvided: freeRent
      }));
    }
    if(path==='/v1/tools/ontario-severance-payroll') {
      const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 6;
      const months = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 6;
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 1200;
      const payroll = url.searchParams.get('payroll') ? Number(url.searchParams.get('payroll')) : 3000000;
      const discontinuance = url.searchParams.get('discontinuance') === 'true';
      const misconduct = url.searchParams.get('misconduct') === 'true';
      const alreadyPaid = url.searchParams.get('alreadyPaid') ? Number(url.searchParams.get('alreadyPaid')) : 0;
      return send(200, calculateOntarioStatutorySeverance({
        completedYearsOfService: years,
        additionalCompletedMonthsOfService: months,
        regularWeeklyWageCad: wage,
        employerOntarioAnnualPayrollCad: payroll,
        isPermanentDiscontinuanceOfBusiness: discontinuance,
        isTerminatedForWilfulMisconduct: misconduct,
        statutorySeveranceAlreadyPaidCad: alreadyPaid
      }));
    }
    if(path==='/v1/tools/alberta-landlord-entry') {
      const noticeHours = url.searchParams.get('noticeHours') ? Number(url.searchParams.get('noticeHours')) : 24;
      const purpose = url.searchParams.get('purpose') || 'REPAIRS_OR_MAINTENANCE';
      const day = url.searchParams.get('day') || 'Tuesday';
      const hour = url.searchParams.get('hour') ? Number(url.searchParams.get('hour')) : 14;
      const religiousDay = url.searchParams.get('religiousDay') === 'true';
      const specifiedTime = url.searchParams.get('specifiedTime') !== 'false';
      const signed = url.searchParams.get('signed') !== 'false';
      const consent = url.searchParams.get('consent') === 'true';
      return send(200, evaluateAlbertaLandlordEntry({
        noticeHoursGiven: noticeHours,
        entryPurpose: purpose,
        entryDayOfWeek: day,
        entryScheduledHour: hour,
        isTenantDayOfReligiousWorship: religiousDay,
        noticeSpecifiedDateAndTime: specifiedTime,
        noticeSignedByLandlord: signed,
        tenantConsentedToEntry: consent
      }));
    }
    if(path==='/v1/tools/federal-dual-intent') {
      const appType = url.searchParams.get('appType') || 'WORK_PERMIT';
      const hasPrApp = url.searchParams.get('hasPrApp') !== 'false';
      const prStream = url.searchParams.get('prStream') || 'EXPRESS_ENTRY_CEC';
      const departIntent = url.searchParams.get('departIntent') !== 'false';
      const homeTies = url.searchParams.get('homeTies') !== 'false';
      const cleanHistory = url.searchParams.get('cleanHistory') !== 'false';
      const funds = url.searchParams.get('funds') !== 'false';
      const refusalFettered = url.searchParams.get('refusalFettered') === 'true';
      return send(200, evaluateDualIntentCompliance({
        temporaryApplicationType: appType,
        hasActivePrApplicationOrProfile: hasPrApp,
        prApplicationStream: prStream,
        demonstratedIntentToRespectStayExpiry: departIntent,
        hasTiesToCountryOfCitizenshipOrResidence: homeTies,
        hasPreviousImmigrationComplianceRecord: cleanHistory,
        hasSufficientSettlementFunds: funds,
        officerRefusalBasedSolelyOnPrIntent: refusalFettered
      }));
    }
    if(path==='/v1/tools/federal-c11-entrepreneur-work-permit') {
      const ownership = url.searchParams.get('ownership') ? Number(url.searchParams.get('ownership')) : 51;
      const control = url.searchParams.get('control') !== 'false';
      const capital = url.searchParams.get('capital') ? Number(url.searchParams.get('capital')) : 150000;
      const plan = url.searchParams.get('plan') !== 'false';
      const jobs = url.searchParams.get('jobs') !== 'false';
      const staff = url.searchParams.get('staff') ? Number(url.searchParams.get('staff')) : 3;
      const bg = url.searchParams.get('bg') !== 'false';
      const lease = url.searchParams.get('lease') !== 'false';
      const fee = url.searchParams.get('fee') !== 'false';
      return send(200, evaluateFederalC11EntrepreneurWorkPermit({
        businessOwnershipPercentage: ownership,
        hasControllingInterest: control,
        capitalInvestedCad: capital,
        hasComprehensiveBusinessPlan: plan,
        createsJobsForCanadiansOrPrs: jobs,
        projectedCanadianStaffHired: staff,
        hasRelevantEntrepreneurialBackground: bg,
        hasSecuredPhysicalPremisesOrLease: lease,
        employerComplianceFeePaid: fee
      }));
    }
    if(path==='/v1/tools/alberta-employment-maternity-parental-leave') {
      const leaveType = url.searchParams.get('leaveType') || 'COMBINED_MATERNITY_PARENTAL';
      const daysEmployed = url.searchParams.get('daysEmployed') ? Number(url.searchParams.get('daysEmployed')) : 180;
      const matWeeks = url.searchParams.get('matWeeks') ? Number(url.searchParams.get('matWeeks')) : 16;
      const parWeeks = url.searchParams.get('parWeeks') ? Number(url.searchParams.get('parWeeks')) : 62;
      const noticeBefore = url.searchParams.get('noticeBefore') ? Number(url.searchParams.get('noticeBefore')) : 6;
      const medCert = url.searchParams.get('medCert') !== 'false';
      const noticeReturn = url.searchParams.get('noticeReturn') ? Number(url.searchParams.get('noticeReturn')) : 4;
      const reinstatementRefused = url.searchParams.get('reinstatementRefused') === 'true';
      const reprisal = url.searchParams.get('reprisal') === 'true';
      return send(200, evaluateAlbertaMaternityParentalLeave({
        leaveType,
        consecutiveDaysOfEmployment: daysEmployed,
        maternityWeeksRequested: matWeeks,
        parentalWeeksRequested: parWeeks,
        noticeWeeksProvidedBeforeLeave: noticeBefore,
        medicalCertificateProvided: medCert,
        noticeWeeksProvidedBeforeReturn: noticeReturn,
        employerRefusesReinstatement: reinstatementRefused,
        employerDisciplinedOrDismissedDueToLeave: reprisal
      }));
    }
    if(path==='/v1/tools/ontario-residential-tenancy-urgent-repairs-t6') {
      const vitalCut = url.searchParams.get('vitalCut') === 'true';
      const tempParam = url.searchParams.get('temp');
      const temp = tempParam !== null && tempParam !== '' ? Number(tempParam) : null;
      const month = url.searchParams.get('month') ? Number(url.searchParams.get('month')) : 1;
      const noticeGiven = url.searchParams.get('noticeGiven') !== 'false';
      const daysSinceNotice = url.searchParams.get('daysSinceNotice') ? Number(url.searchParams.get('daysSinceNotice')) : 0;
      const outOfPocket = url.searchParams.get('outOfPocket') ? Number(url.searchParams.get('outOfPocket')) : 0;
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2000;
      const months = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 1;
      const abatement = url.searchParams.get('abatement') ? Number(url.searchParams.get('abatement')) : 25;
      const retaliation = url.searchParams.get('retaliation') === 'true';
      return send(200, evaluateOntarioUrgentRepairsT6({
        vitalServiceInterrupted: vitalCut,
        indoorTemperatureCelsius: temp,
        calendarMonth: month,
        landlordNotifiedInWriting: noticeGiven,
        daysSinceWrittenNotice: daysSinceNotice,
        emergencyRepairIncurredByTenantCad: outOfPocket,
        monthlyRentCad: rent,
        monthsOfDisrepair: months,
        estimatedAbatementPercentage: abatement,
        landlordRetaliationThreatened: retaliation
      }));
    }
    if(path==='/v1/tools/british-columbia-employment-illness-injury-leave') {
      const daysEmployed = url.searchParams.get('daysEmployed') ? Number(url.searchParams.get('daysEmployed')) : 120;
      const paidTaken = url.searchParams.get('paidTaken') ? Number(url.searchParams.get('paidTaken')) : 0;
      const paidReq = url.searchParams.get('paidReq') ? Number(url.searchParams.get('paidReq')) : 1;
      const unpaidTaken = url.searchParams.get('unpaidTaken') ? Number(url.searchParams.get('unpaidTaken')) : 0;
      const unpaidReq = url.searchParams.get('unpaidReq') ? Number(url.searchParams.get('unpaidReq')) : 0;
      const wages30d = url.searchParams.get('wages30d') ? Number(url.searchParams.get('wages30d')) : 3200;
      const daysWorked30d = url.searchParams.get('daysWorked30d') ? Number(url.searchParams.get('daysWorked30d')) : 20;
      const refused = url.searchParams.get('refused') === 'true';
      const reprisal = url.searchParams.get('reprisal') === 'true';
      const proof = url.searchParams.get('proof') !== 'false';
      return send(200, evaluateBcIllnessInjuryLeave({
        consecutiveDaysEmployed: daysEmployed,
        paidSickDaysTakenThisYear: paidTaken,
        paidSickDaysRequested: paidReq,
        unpaidSickDaysTakenThisYear: unpaidTaken,
        unpaidSickDaysRequested: unpaidReq,
        wagesEarnedInPast30DaysCad: wages30d,
        daysWorkedInPast30Days: daysWorked30d,
        employerRefusedPaidSickDays: refused,
        employerDisciplinedOrDismissedForLeave: reprisal,
        medicalProofProvided: proof
      }));
    }
    if(path==='/v1/tools/federal-francophone-mobility-c16') {
      const nclc = url.searchParams.get('nclc') ? Number(url.searchParams.get('nclc')) : 5;
      const prov = url.searchParams.get('prov') || 'ON';
      const teer = url.searchParams.get('teer') !== null ? Number(url.searchParams.get('teer')) : 1;
      const agri = url.searchParams.get('agri') === 'true';
      const offer = url.searchParams.get('offer') !== 'false';
      const testScore = url.searchParams.get('test') !== 'false';
      const fee = url.searchParams.get('fee') !== 'false';
      return send(200, evaluateFederalFrancophoneMobilityC16({
        frenchOralNclcLevel: nclc,
        destinationProvince: prov,
        teerCategory: teer,
        isPrimaryAgricultureNoc: agri,
        hasValidJobOffer: offer,
        hasApprovedFrenchTest: testScore,
        employerComplianceFeePaid: fee
      }));
    }
    if(path==='/v1/tools/federal-bowp-pr-acknowledgement') {
      const inCanada = url.searchParams.get('inCanada') !== 'false';
      const validAuth = url.searchParams.get('validAuth') !== 'false';
      const daysExpiry = url.searchParams.get('daysExpiry') ? Number(url.searchParams.get('daysExpiry')) : 60;
      const stream = url.searchParams.get('stream') || 'EXPRESS_ENTRY_CEC';
      const hasAor = url.searchParams.get('hasAor') !== 'false';
      const pnpRestrict = url.searchParams.get('pnpRestrict') === 'true';
      const pendingInadmiss = url.searchParams.get('pendingInadmiss') === 'true';
      return send(200, evaluateFederalBridgingOpenWorkPermit({
        isCurrentlyInCanada: inCanada,
        hasValidWorkAuthorization: validAuth,
        daysUntilCurrentPermitExpires: daysExpiry,
        prApplicationStream: stream,
        hasReceivedOfficialAor: hasAor,
        pnpHasEmploymentRestrictions: pnpRestrict,
        hasPendingInadmissibilityProceedings: pendingInadmiss
      }));
    }
    if(path==='/v1/tools/ontario-rent-deposit-interest') {
      const deposit = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 2000;
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2100;
      const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 2;
      const rate = url.searchParams.get('rate') ? Number(url.searchParams.get('rate')) : 2.5;
      const paidAnnual = url.searchParams.get('paidAnnual') === 'true';
      const offsetIncrease = url.searchParams.get('offsetIncrease') !== 'false';
      const damageDeposit = url.searchParams.get('damageDeposit') === 'true';
      const extraPaid = url.searchParams.get('extraPaid') ? Number(url.searchParams.get('extraPaid')) : 0;
      return send(200, evaluateOntarioRentDepositInterest({
        initialDepositAmountCad: deposit,
        currentMonthlyRentCad: rent,
        tenancyDurationYears: years,
        guidelineInterestRatePercent: rate,
        landlordPaidAnnualInterest: paidAnnual,
        depositAppliedToLastMonthRentIncrease: offsetIncrease,
        landlordDemandedDamageDeposit: damageDeposit,
        extraDepositPaidCad: extraPaid
      }));
    }
    if(path==='/v1/tools/alberta-general-holiday-pay') {
      const holiday = url.searchParams.get('holiday') || 'CANADA_DAY';
      const daysWorked = url.searchParams.get('daysWorked') ? Number(url.searchParams.get('daysWorked')) : 60;
      const regularDay = url.searchParams.get('regularDay') !== 'false';
      const worked = url.searchParams.get('worked') === 'true';
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 0;
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 25;
      const wages4w = url.searchParams.get('wages4w') ? Number(url.searchParams.get('wages4w')) : 4000;
      const absent = url.searchParams.get('absent') === 'true';
      const dayOff = url.searchParams.get('dayOff') === 'true';
      const paidActual = url.searchParams.get('paidActual') ? Number(url.searchParams.get('paidActual')) : 0;
      return send(200, evaluateAlbertaGeneralHolidayPay({
        holidayName: holiday,
        workDaysInPast12Months: daysWorked,
        isRegularDayOfWork: regularDay,
        workedOnHoliday: worked,
        hoursWorkedOnHoliday: hours,
        regularHourlyWageCad: wage,
        wagesEarnedInPast4WeeksCad: wages4w,
        absentWithoutConsentBeforeOrAfter: absent,
        futureDayOffWithPayProvided: dayOff,
        holidayPayActuallyPaidCad: paidActual
      }));
    }
    if(path==='/v1/tools/bc-strata-depreciation-crf') {
      const lots = url.searchParams.get('lots') ? Number(url.searchParams.get('lots')) : 24;
      const yearsSinceReport = url.searchParams.get('yearsSinceReport') ? Number(url.searchParams.get('yearsSinceReport')) : 6;
      const cred = url.searchParams.get('cred') || 'CERTIFIED_RESERVE_PLANNER_CRP';
      const budget = url.searchParams.get('budget') ? Number(url.searchParams.get('budget')) : 100000;
      const contrib = url.searchParams.get('contrib') ? Number(url.searchParams.get('contrib')) : 8000;
      const waiver = url.searchParams.get('waiver') === 'true';
      const formB = url.searchParams.get('formB') !== 'false';
      return send(200, evaluateBcStrataDepreciationReport({
        strataLotsCount: lots,
        yearsSinceLastDepreciationReport: yearsSinceReport,
        reportAuthorCredential: cred,
        annualOperatingBudgetCad: budget,
        annualCrfContributionCad: contrib,
        strataAttemptedAnnualWaiverVote: waiver,
        depreciationReportAttachedToFormB: formB
      }));
    }
    if(path==='/v1/tools/federal-fta-professional-work-permit') {
      const treaty = url.searchParams.get('treaty') || 'CUSMA';
      const country = url.searchParams.get('country') || 'USA';
      const contract = url.searchParams.get('contract') !== 'false';
      const degree = url.searchParams.get('degree') !== 'false';
      const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 4;
      const fee = url.searchParams.get('fee') !== 'false';
      const regulated = url.searchParams.get('regulated') === 'true';
      const licensed = url.searchParams.get('licensed') !== 'false';
      return send(200, evaluateFederalFtaProfessionalWorkPermit({
        treaty,
        applicantCitizenshipCountry: country,
        hasSignedServiceContractOrJobOffer: contract,
        hasRequiredDegreeOrLicence: degree,
        yearsOfProfessionalExperience: years,
        employerComplianceFeePaid: fee,
        isRegulatedProfessionInProvince: regulated,
        provincialLicenceAcquiredOrInProcess: licensed
      }));
    }
    if(path==='/v1/tools/ontario-employment-reprisal') {
      const action = url.searchParams.get('action') || 'ASKED_EMPLOYER_TO_COMPLY_WITH_ESA';
      const adverse = url.searchParams.get('adverse') || 'TERMINATED_EMPLOYMENT';
      const days = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 7;
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 1000;
      const weeksLost = url.searchParams.get('weeksLost') ? Number(url.searchParams.get('weeksLost')) : 8;
      const reinstatement = url.searchParams.get('reinstatement') !== 'false';
      const priorDiscipline = url.searchParams.get('priorDiscipline') === 'true';
      return send(200, evaluateOntarioEmploymentReprisal({
        protectedActionTaken: action,
        employerAdverseAction: adverse,
        daysBetweenActionAndReprisal: days,
        regularWeeklyWageCad: wage,
        weeksOfLostIncome: weeksLost,
        seeksJobReinstatement: reinstatement,
        employerProvidedDocumentedPerformanceIssuesPrior: priorDiscipline
      }));
    }
    if(path==='/v1/tools/bc-security-deposit-double-penalty') {
      const secDeposit = url.searchParams.get('secDeposit') ? Number(url.searchParams.get('secDeposit')) : 1000;
      const petDeposit = url.searchParams.get('petDeposit') ? Number(url.searchParams.get('petDeposit')) : 0;
      const ended = url.searchParams.get('ended') !== 'false';
      const forwarding = url.searchParams.get('forwarding') !== 'false';
      const daysSince = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 25;
      const consent = url.searchParams.get('consent') === 'true';
      const deduction = url.searchParams.get('deduction') ? Number(url.searchParams.get('deduction')) : 0;
      const filedDispute = url.searchParams.get('filedDispute') === 'true';
      const refunded = url.searchParams.get('refunded') ? Number(url.searchParams.get('refunded')) : 0;
      return send(200, evaluateBcSecurityDepositDoublePenalty({
        securityDepositPaidCad: secDeposit,
        petDepositPaidCad: petDeposit,
        tenancyHasEnded: ended,
        forwardingAddressProvidedInWriting: forwarding,
        daysSinceForwardingAddressReceived: daysSince,
        tenantSignedWrittenDeductionConsent: consent,
        tenantAgreedDeductionAmountCad: deduction,
        landlordFiledRtbClaimWithin15Days: filedDispute,
        landlordRefundedAmountCad: refunded
      }));
    }
    if(path==='/v1/tools/alberta-constructive-dismissal') {
      const prevSalary = url.searchParams.get('prevSalary') ? Number(url.searchParams.get('prevSalary')) : 80000;
      const newSalary = url.searchParams.get('newSalary') ? Number(url.searchParams.get('newSalary')) : 64000;
      const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 5;
      const agreed = url.searchParams.get('agreed') === 'true';
      const hoursCut = url.searchParams.get('hoursCut') === 'true';
      const daysSince = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 14;
      return send(200, evaluateAlbertaConstructiveDismissal({
        previousAnnualSalaryCad: prevSalary,
        newAnnualSalaryCad: newSalary,
        yearsOfContinuousService: years,
        employeeAgreedToReduction: agreed,
        unilateralReductionInHoursOrStatus: hoursCut,
        daysSinceReductionImposed: daysSince
      }));
    }
    if(path==='/v1/tools/federal-suv-peer-review') {
      const entity = url.searchParams.get('entity') || 'BUSINESS_INCUBATOR';
      const invest = url.searchParams.get('invest') ? Number(url.searchParams.get('invest')) : 0;
      const letter = url.searchParams.get('letter') !== 'false';
      const equity = url.searchParams.get('equity') ? Number(url.searchParams.get('equity')) : 20;
      const combined = url.searchParams.get('combined') ? Number(url.searchParams.get('combined')) : 60;
      const founders = url.searchParams.get('founders') ? Number(url.searchParams.get('founders')) : 3;
      const mgmt = url.searchParams.get('mgmt') !== 'false';
      const corp = url.searchParams.get('corp') !== 'false';
      const peerReview = url.searchParams.get('peerReview') === 'true';
      return send(200, evaluateFederalSuvPeerReview({
        designatedEntityType: entity,
        securedInvestmentAmountCad: invest,
        hasOfficialLetterOfSupport: letter,
        applicantVotingRightsPercentage: equity,
        totalFoundersAndEntityVotingPercentage: combined,
        totalFoundersCount: founders,
        hasActiveOngoingManagementRole: mgmt,
        businessIncorporatedInCanada: corp,
        peerReviewRequestedByOfficer: peerReview
      }));
    }
    if(path==='/v1/tools/saskatchewan-security-deposit-return') {
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 1500;
      const deposit = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 1500;
      const ended = url.searchParams.get('ended') !== 'false';
      const daysSince = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 10;
      const fullRefund = url.searchParams.get('fullRefund') === 'true';
      const refunded = url.searchParams.get('refunded') ? Number(url.searchParams.get('refunded')) : 0;
      const form13 = url.searchParams.get('form13') === 'true';
      const consent = url.searchParams.get('consent') === 'true';
      const agreed = url.searchParams.get('agreed') ? Number(url.searchParams.get('agreed')) : 0;
      return send(200, evaluateSaskatchewanSecurityDepositReturn({
        monthlyRentCad: rent,
        securityDepositPaidCad: deposit,
        tenancyEnded: ended,
        businessDaysSinceTenancyEnded: daysSince,
        landlordRefundedFullDeposit: fullRefund,
        amountActuallyRefundedCad: refunded,
        landlordServedPrescribedForm13: form13,
        tenantSignedWrittenDeductionConsent: consent,
        tenantAgreedDeductionAmountCad: agreed
      }));
    }
    if(path==='/v1/tools/ontario-illegal-entry-t2') {
      const written = url.searchParams.get('written') !== 'false';
      const hoursNotice = url.searchParams.get('hoursNotice') ? Number(url.searchParams.get('hoursNotice')) : 24;
      const hour = url.searchParams.get('hour') ? Number(url.searchParams.get('hour')) : 14;
      const emergency = url.searchParams.get('emergency') === 'true';
      const consent = url.searchParams.get('consent') === 'true';
      const window = url.searchParams.get('window') !== 'false';
      const purpose = url.searchParams.get('purpose') !== 'false';
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const incidents = url.searchParams.get('incidents') ? Number(url.searchParams.get('incidents')) : 1;
      const expenses = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 0;
      return send(200, evaluateOntarioIllegalEntryT2({
        writtenNoticeGiven: written,
        noticeHoursGiven: hoursNotice,
        entryScheduledHour: hour,
        isEmergencyEntry: emergency,
        tenantConsentedAtTimeOfEntry: consent,
        noticeSpecifiedTimeWindow: window,
        noticeStatedValidPurpose: purpose,
        monthlyRentCad: rent,
        unlawfulEntryIncidentsCount: incidents,
        outOfPocketExpensesCad: expenses
      }));
    }
    if(path==='/v1/tools/bc-overtime-banking') {
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 30;
      const ot15 = url.searchParams.get('ot15') ? Number(url.searchParams.get('ot15')) : 2;
      const ot20 = url.searchParams.get('ot20') ? Number(url.searchParams.get('ot20')) : 0;
      const weeklyOt = url.searchParams.get('weeklyOt') ? Number(url.searchParams.get('weeklyOt')) : 0;
      const requestWritten = url.searchParams.get('requestWritten') !== 'false';
      const timeOff = url.searchParams.get('timeOff') === 'true';
      const banked = url.searchParams.get('banked') ? Number(url.searchParams.get('banked')) : 10;
      const payoutReq = url.searchParams.get('payoutReq') === 'true';
      const terminated = url.searchParams.get('terminated') === 'true';
      const paidActual = url.searchParams.get('paidActual') ? Number(url.searchParams.get('paidActual')) : 0;
      return send(200, evaluateBcOvertimeBanking({
        regularHourlyWageCad: wage,
        dailyHoursWorkedOver8: ot15,
        dailyHoursWorkedOver12: ot20,
        weeklyHoursWorkedOver40: weeklyOt,
        employeeRequestedTimeBankInWriting: requestWritten,
        wantsPaidTimeOffInsteadOfPay: timeOff,
        bankedHoursAlreadyAccumulated: banked,
        employeeRequestedPayout: payoutReq,
        employmentTerminated: terminated,
        overtimePaidActuallyCad: paidActual
      }));
    }
    if(path==='/v1/tools/alberta-periodic-tenancy-notice') {
      const party = url.searchParams.get('party') || 'LANDLORD';
      const tenancyType = url.searchParams.get('tenancyType') || 'MONTH_TO_MONTH';
      const monthsNotice = url.searchParams.get('monthsNotice') ? Number(url.searchParams.get('monthsNotice')) : 3;
      const reason = url.searchParams.get('reason') || 'LANDLORD_OR_RELATIVE_OCCUPANCY';
      const writtenSigned = url.searchParams.get('writtenSigned') !== 'false';
      const purchaserReq = url.searchParams.get('purchaserReq') !== 'false';
      const permits = url.searchParams.get('permits') !== 'false';
      return send(200, evaluateAlbertaPeriodicTenancyNotice({
        partyGivingNotice: party,
        tenancyType,
        fullTenancyMonthsNoticeGiven: monthsNotice,
        landlordStatedReason: reason,
        noticeInWritingAndSigned: writtenSigned,
        purchaserSignedWrittenOccupancyRequest: purchaserReq,
        majorRenovationPermitsObtained: permits
      }));
    }
    if(path==='/v1/tools/federal-super-visa-insurance-lico') {
      const coverage = url.searchParams.get('coverage') ? Number(url.searchParams.get('coverage')) : 100000;
      const validityDays = url.searchParams.get('validityDays') ? Number(url.searchParams.get('validityDays')) : 365;
      const approved = url.searchParams.get('approved') !== 'false';
      const paid = url.searchParams.get('paid') !== 'false';
      const ime = url.searchParams.get('ime') !== 'false';
      const income = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 65000;
      const household = url.searchParams.get('household') ? Number(url.searchParams.get('household')) : 4;
      return send(200, evaluateFederalSuperVisaInsuranceLico({
        medicalInsuranceCoverageCad: coverage,
        insurancePolicyValidityDays: validityDays,
        insuranceFromApprovedProvider: approved,
        proofOfInsurancePaymentProvided: paid,
        completedUpfrontImeMedicalExam: ime,
        sponsorAnnualIncomeCad: income,
        householdSizeIncludingApplicants: household
      }));
    }
    if(path==='/v1/tools/manitoba-general-holiday-pay') {
      const holiday = url.searchParams.get('holiday') || 'LOUIS_RIEL_DAY';
      const wages4w = url.searchParams.get('wages4w') ? Number(url.searchParams.get('wages4w')) : 3600;
      const worked = url.searchParams.get('worked') === 'true';
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 0;
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 22;
      const absent = url.searchParams.get('absent') === 'true';
      const substitute = url.searchParams.get('substitute') === 'true';
      const paidActual = url.searchParams.get('paidActual') ? Number(url.searchParams.get('paidActual')) : 0;
      return send(200, evaluateManitobaGeneralHolidayPay({
        holidayName: holiday,
        grossWagesInPast4WeeksCad: wages4w,
        workedOnHoliday: worked,
        hoursWorkedOnHoliday: hours,
        regularHourlyWageCad: wage,
        absentWithoutConsentBeforeOrAfter: absent,
        substituteDayOffWithPayAgreed: substitute,
        holidayPayActuallyPaidCad: paidActual
      }));
    }
    if(path==='/v1/tools/federal-caregiver-pr-pathway') {
      const noc = url.searchParams.get('noc') || '44100';
      const monthsExp = url.searchParams.get('monthsExp') ? Number(url.searchParams.get('monthsExp')) : 12;
      const weeklyHours = url.searchParams.get('weeklyHours') ? Number(url.searchParams.get('weeklyHours')) : 35;
      const privateHome = url.searchParams.get('privateHome') !== 'false';
      const clbR = url.searchParams.get('clbR') ? Number(url.searchParams.get('clbR')) : 5;
      const clbW = url.searchParams.get('clbW') ? Number(url.searchParams.get('clbW')) : 5;
      const clbL = url.searchParams.get('clbL') ? Number(url.searchParams.get('clbL')) : 5;
      const clbS = url.searchParams.get('clbS') ? Number(url.searchParams.get('clbS')) : 5;
      const edu = url.searchParams.get('edu') !== 'false';
      const status = url.searchParams.get('status') !== 'false';
      return send(200, evaluateFederalCaregiverPrPathway({
        nocCode: noc,
        completedCanadianExperienceMonths: monthsExp,
        averageWeeklyHours: weeklyHours,
        experienceInPrivateHousehold: privateHome,
        clbReading: clbR,
        clbWriting: clbW,
        clbListening: clbL,
        clbSpeaking: clbS,
        hasOneYearPostSecondaryOrEca: edu,
        hasValidCanadianWorkPermitOrStatus: status
      }));
    }
    if(path==='/v1/tools/ontario-public-holiday-pay') {
      const holiday = url.searchParams.get('holiday') || 'FAMILY_DAY';
      const wages4w = url.searchParams.get('wages4w') ? Number(url.searchParams.get('wages4w')) : 3200;
      const vacPay = url.searchParams.get('vacPay') ? Number(url.searchParams.get('vacPay')) : 128;
      const qualified = url.searchParams.get('qualified') !== 'false';
      const reasonableCause = url.searchParams.get('reasonableCause') === 'true';
      const worked = url.searchParams.get('worked') === 'true';
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 0;
      const wage = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 20;
      const substitute = url.searchParams.get('substitute') === 'true';
      const paidActual = url.searchParams.get('paidActual') ? Number(url.searchParams.get('paidActual')) : 0;
      return send(200, evaluateOntarioPublicHolidayPay({
        holidayName: holiday,
        regularWagesInPast4WeeksCad: wages4w,
        vacationPayPayableInPast4WeeksCad: vacPay,
        workedShiftBeforeAndAfterHoliday: qualified,
        hadReasonableCauseForAbsence: reasonableCause,
        workedOnPublicHoliday: worked,
        hoursWorkedOnHoliday: hours,
        regularHourlyWageCad: wage,
        substituteDayOffAgreed: substitute,
        holidayPayActuallyPaidCad: paidActual
      }));
    }
    if(path==='/v1/tools/bc-rtb-dispute-track') {
      const category = url.searchParams.get('category') || 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION';
      const vital = url.searchParams.get('vital') === 'true';
      const lockout = url.searchParams.get('lockout') === 'true';
      const danger = url.searchParams.get('danger') === 'true';
      const monetaryOnly = url.searchParams.get('monetaryOnly') === 'true';
      const readyService = url.searchParams.get('readyService') !== 'false';
      return send(200, evaluateBcRtbDisputeTrack({
        disputeCategory: category,
        vitalServiceOrStructuralDanger: vital,
        locksChangedWithoutOrder: lockout,
        violenceOrImminentThreatDemonstrated: danger,
        isMonetaryClaimOnly: monetaryOnly,
        readyToServeEvidenceWithinOneDay: readyService
      }));
    }
    if(path==='/v1/tools/alberta-youth-employment-rules') {
      const age = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 14;
      const job = url.searchParams.get('job') || 'RETAIL_CLERK';
      const consent = url.searchParams.get('consent') !== 'false';
      const schoolDay = url.searchParams.get('schoolDay') !== 'false';
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 2;
      const start = url.searchParams.get('start') ? Number(url.searchParams.get('start')) : 16;
      const end = url.searchParams.get('end') ? Number(url.searchParams.get('end')) : 18;
      const duringSchool = url.searchParams.get('duringSchool') === 'true';
      const supervision = url.searchParams.get('supervision') !== 'false';
      return send(200, evaluateAlbertaYouthEmploymentRules({
        employeeAge: age,
        jobCategory: job,
        hasWrittenParentalConsent: consent,
        isSchoolDay: schoolDay,
        scheduledShiftHours: hours,
        shiftStartHour: start,
        shiftEndHour: end,
        duringSchoolHours: duringSchool,
        adultSupervisionPresent: supervision
      }));
    }
    if(path==='/v1/tools/federal-student-off-campus-work') {
      const permit = url.searchParams.get('permit') !== 'false';
      const dliFullTime = url.searchParams.get('dliFullTime') !== 'false';
      const inSession = url.searchParams.get('inSession') !== 'false';
      const onBreak = url.searchParams.get('onBreak') === 'true';
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 24;
      const sin = url.searchParams.get('sin') !== 'false';
      const progLength = url.searchParams.get('progLength') ? Number(url.searchParams.get('progLength')) : 24;
      return send(200, evaluateFederalStudentOffCampusWork({
        hasValidStudyPermit: permit,
        enrolledFullTimeAtDli: dliFullTime,
        isInRegularAcademicSession: inSession,
        isOnRegularlyScheduledBreak: onBreak,
        weeklyHoursWorkedOffCampus: hours,
        hasValidSocialInsuranceNumber: sin,
        programLengthMonths: progLength
      }));
    }
    if(path==='/v1/tools/study-permit-cap-pal') {
      const studyLevel = url.searchParams.get('studyLevel') || 'undergraduate_degree';
      const province = url.searchParams.get('province') || 'ON';
      const tuitionFeeFirstYearCad = url.searchParams.get('tuition') ? Number(url.searchParams.get('tuition')) : 22000;
      const liquidFundsAvailableCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 45000;
      const familyMembersAccompanying = url.searchParams.get('dependents') ? Number(url.searchParams.get('dependents')) : 0;
      const isInCanadaApplication = url.searchParams.get('inland') === 'true';
      const isExtensionOfStudyPermit = url.searchParams.get('extension') === 'true';
      const isFamilyOfWorkOrStudyHolder = url.searchParams.get('familyExempt') === 'true';
      const fieldOfStudyCategory = url.searchParams.get('field') || 'stem_science_tech_eng_math';
      const cipCode = url.searchParams.get('cip') || '11.0701';
      const applicantName = url.searchParams.get('applicant') || 'Student Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateStudyPermitCapAndPal({
        studyLevel,
        province,
        tuitionFeeFirstYearCad,
        liquidFundsAvailableCad,
        familyMembersAccompanying,
        isInCanadaApplication,
        isExtensionOfStudyPermit,
        isFamilyOfWorkOrStudyHolder,
        fieldOfStudyCategory,
        cipCode,
        applicantName,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/visitor-visa-financial-ties') {
      const applicantName = url.searchParams.get('applicant') || 'Visitor Applicant';
      const countryOfResidence = url.searchParams.get('country') || 'IN';
      const plannedStayDays = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 21;
      const liquidFundsCad = url.searchParams.get('funds') ? Number(url.searchParams.get('funds')) : 12000;
      const hasApprovedJobLeaveLetter = url.searchParams.get('leaveLetter') !== 'false';
      const yearsAtCurrentJob = url.searchParams.get('tenure') ? Number(url.searchParams.get('tenure')) : 3.5;
      const monthlyIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 2500;
      const ownsRealEstateProperty = url.searchParams.get('property') !== 'false';
      const hasImmediateFamilyRemainingHome = url.searchParams.get('familyHome') !== 'false';
      const allImmediateFamilyTravelingTogether = url.searchParams.get('familyTraveling') === 'true';
      const hasPriorCompliantTravelG7 = url.searchParams.get('g7Travel') !== 'false';
      const hasPreviousVisaRefusal = url.searchParams.get('refusal') === 'true';
      const isDualIntentPrPending = url.searchParams.get('dualIntent') === 'true';
      const hostInCanadaRelationship = url.searchParams.get('host') || 'family_sibling';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateVisitorVisaTies({
        applicantName,
        countryOfResidence,
        plannedStayDays,
        liquidFundsCad,
        hasApprovedJobLeaveLetter,
        yearsAtCurrentJob,
        monthlyIncomeCad,
        ownsRealEstateProperty,
        hasImmediateFamilyRemainingHome,
        allImmediateFamilyTravelingTogether,
        hasPriorCompliantTravelG7,
        hasPreviousVisaRefusal,
        isDualIntentPrPending,
        hostInCanadaRelationship,
        assessmentDate
      }));
    }
    if(path==='/v1/tools/lmia-readiness') {
      const employerName = url.searchParams.get('employer') || 'Canadian Tech Corp';
      const province = url.searchParams.get('province') || 'ON';
      const offeredHourlyWageCad = url.searchParams.get('wage') ? Number(url.searchParams.get('wage')) : 35.00;
      const nocCode = url.searchParams.get('noc') || '21231';
      const teerCategory = url.searchParams.get('teer') ? Number(url.searchParams.get('teer')) : 1;
      const isExemptionClaimed = url.searchParams.get('isExempt') === 'true';
      const exemptionCode = url.searchParams.get('exemptionCode') || 'C16';
      const frenchProficiencyNclc = url.searchParams.get('nclc') ? Number(url.searchParams.get('nclc')) : 6;
      const applicantCitizenship = url.searchParams.get('citizenship') || 'FR';
      const cmaUnemploymentOver6Percent = url.searchParams.get('unemploymentHigh') === 'true';
      const currentTfwProportionPercent = url.searchParams.get('tfwProportion') ? Number(url.searchParams.get('tfwProportion')) : 12;
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateLmiaReadiness({
        employerName,
        province,
        offeredHourlyWageCad,
        nocCode,
        teerCategory,
        isExemptionClaimed,
        exemptionCode,
        frenchProficiencyNclc,
        applicantCitizenship,
        cmaUnemploymentOver6Percent,
        currentTfwProportionPercent,
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
    if(path==='/v1/tools/pr-matrix') {
      const age = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 28;
      const educationLevel = url.searchParams.get('education') || 'masters';
      const yearsExperience = url.searchParams.get('experience') ? Number(url.searchParams.get('experience')) : 3;
      const englishLanguageScore = url.searchParams.get('clb') ? Number(url.searchParams.get('clb')) : 8;
      const hasJobOffer = url.searchParams.get('jobOffer') === 'true';
      const hasSecondaryLanguage = url.searchParams.get('secondaryLang') === 'true';
      return send(200, evaluatePrMatrix({ age, educationLevel, yearsExperience, englishLanguageScore, hasJobOffer, hasSecondaryLanguage }));
    }
    if(path==='/v1/tools/family-reunification') {
      const category = url.searchParams.get('category') || 'spousal_open_work_permit';
      const sponsorStatus = url.searchParams.get('sponsorStatus') || 'study_permit';
      const studentProgramType = url.searchParams.get('programType') || 'masters';
      return send(200, evaluateFamilyReunification({ category, sponsorStatus, studentProgramType }));
    }
    if(path==='/v1/tools/tax-shield') {
      const annualEmploymentIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 75000;
      const province = url.searchParams.get('province') || 'ON';
      return send(200, evaluateTaxShield({ annualEmploymentIncomeCad, province }));
    }
    if(path==='/v1/tools/calendar-sync') {
      const milestoneType = url.searchParams.get('milestone') || 'work_permit_expiry';
      const anchorDate = url.searchParams.get('date') || '2026-12-31';
      const applicantName = url.searchParams.get('name') || 'Newcomer';
      return send(200, evaluateStatutoryTimeline({ milestoneType, anchorDate, applicantName }));
    }
    if(path==='/v1/tools/legal-notices') {
      const type = url.searchParams.get('type');
      if (!type) return send(200, { supportedTypes: NOTICE_TYPES, metadata: STATUTORY_METADATA });
      const senderName = url.searchParams.get('sender') || 'Applicant';
      const recipientName = url.searchParams.get('recipient') || 'Respondent';
      const totalClaimAmount = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 0;
      const issuesParam = url.searchParams.get('issues');
      const issues = issuesParam ? issuesParam.split(';').map(s=>s.trim()).filter(Boolean) : [];
      return send(200, generateLegalNotice({ type, senderName, recipientName, totalClaimAmount, issues }));
    }
    if(path==='/v1/tools/poe-rights') {
      const country = url.searchParams.get('country') || 'CA';
      const statusCategory = url.searchParams.get('status') || 'work_permit';
      const isInSecondaryInspection = url.searchParams.get('secondary') === 'true';
      const hasDigitalDeviceSearchConcern = url.searchParams.get('deviceSearch') === 'true';
      const facingRefusalRisk = url.searchParams.get('refusalRisk') === 'true';
      return send(200, evaluatePortOfEntryRights({ country, statusCategory, isInSecondaryInspection, hasDigitalDeviceSearchConcern, facingRefusalRisk }));
    }
    if(path==='/v1/tools/study-to-pr') {
      // Names match evaluateStudyToPrPathway and the website form; older names are accepted too.
      const q = name => url.searchParams.get(name);
      return send(200, evaluateStudyToPrPathway({
        studyLevel: q('studyLevel') || q('degree') || 'masters',
        province: q('province') || 'ON',
        fieldOfStudy: q('fieldOfStudy') || 'stem_tech',
        expectedClbLanguage: q('clb') ? Number(q('clb')) : 9,
        targetNocTeer: q('teer') ? Number(q('teer')) : 1,
        hasPriorForeignExperience: q('foreignExperience') !== 'false',
        yearsForeignExperience: q('foreignYears') ? Number(q('foreignYears')) : 2
      }));
    }
    if(path==='/v1/tools/gcms-analyzer') {
      const applicationType = url.searchParams.get('type') || 'study_permit';
      const rawOfficerNotesText = url.searchParams.get('notes') || '';
      const refusalCodesParam = url.searchParams.get('codes');
      const refusalCodes = refusalCodesParam ? refusalCodesParam.split(',').map(s=>s.trim()).filter(Boolean) : undefined;
      const daysSinceRefusal = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 10;
      return send(200, analyzeGcmsRefusalNotes({ applicationType, rawOfficerNotesText, refusalCodes, daysSinceRefusal }));
    }
    if(path==='/v1/tools/global-visa-matrix') {
      const preferredCountries = url.searchParams.get('countries')?.split(',').map(s=>s.trim()).filter(Boolean) || ['CA', 'US', 'UK', 'AU', 'DE', 'UAE'];
      const educationLevel = url.searchParams.get('education') || 'bachelors';
      const yearsExperience = url.searchParams.get('experience') ? Number(url.searchParams.get('experience')) : 3;
      const fieldOfStudy = url.searchParams.get('field') || 'stem';
      const hasJobOffer = url.searchParams.get('jobOffer') === 'true';
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 29;
      return send(200, evaluateGlobalVisaPathways({ preferredCountries, educationLevel, yearsExperience, fieldOfStudy, hasJobOffer, applicantAge }));
    }
    if(path==='/v1/tools/moving-tax-calc') {
      const distanceOldHomeToNewWorkKm = url.searchParams.get('oldToNewKm') ? Number(url.searchParams.get('oldToNewKm')) : 85;
      const distanceNewHomeToNewWorkKm = url.searchParams.get('newToNewKm') ? Number(url.searchParams.get('newToNewKm')) : 15;
      const transportAndStorageCostsCad = url.searchParams.get('movers') ? Number(url.searchParams.get('movers')) : 2800;
      const travelDistanceKm = url.searchParams.get('travelKm') ? Number(url.searchParams.get('travelKm')) : 450;
      const temporaryLivingDays = url.searchParams.get('tempDays') ? Number(url.searchParams.get('tempDays')) : 7;
      const temporaryLivingLodgingCad = url.searchParams.get('tempLodging') ? Number(url.searchParams.get('tempLodging')) : 1200;
      const province = url.searchParams.get('province') || 'ON';
      return send(200, calculateMovingTaxDeduction({
        distanceOldHomeToNewWorkKm,
        distanceNewHomeToNewWorkKm,
        transportAndStorageCostsCad,
        travelDistanceKm,
        temporaryLivingDays,
        temporaryLivingLodgingCad,
        province
      }));
    }
    if(path==='/v1/tools/severance-bardal') {
      const employeeAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 46;
      const yearsOfService = url.searchParams.get('service') ? Number(url.searchParams.get('service')) : 7.5;
      const annualSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 90000;
      const employmentRole = url.searchParams.get('role') || 'management_professional';
      const employerPayrollOver2Point5Million = url.searchParams.get('largePayroll') !== 'false';
      const hasSignedEnforceableEsaOnlyClause = url.searchParams.get('hasClause') === 'true';
      const availabilityOfSimilarJobs = url.searchParams.get('jobMarket') || 'scarce';
      const province = url.searchParams.get('province') || 'ON';
      return send(200, calculateSeveranceAndNotice({
        employeeAge,
        yearsOfService,
        annualSalaryCad,
        employmentRole,
        employerPayrollOver2Point5Million,
        hasSignedEnforceableEsaOnlyClause,
        availabilityOfSimilarJobs,
        province
      }));
    }
    if(path==='/v1/tools/us-h1b-opt') {
      const visaStatus = url.searchParams.get('status') || 'h1b';
      const lastDayWorkedDate = url.searchParams.get('lastWorked') || null;
      const i94ExpirationDate = url.searchParams.get('i94') || null;
      const hasTimelyFiledH1bCos = url.searchParams.get('hasH1bCos') === 'true';
      const unauthorizedWorkDaysAccrued = url.searchParams.get('unauthorizedDays') ? Number(url.searchParams.get('unauthorizedDays')) : 0;
      const hasPendingGreenCardI485 = url.searchParams.get('hasI485') === 'true';
      return send(200, evaluateUsH1bOptStatus({
        visaStatus,
        lastDayWorkedDate,
        i94ExpirationDate,
        hasTimelyFiledH1bCos,
        unauthorizedWorkDaysAccrued,
        hasPendingGreenCardI485
      }));
    }
    if(path==='/v1/tools/uk-skilled-worker') {
      const annualOfferedSalaryGbp = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 35000;
      const socCode = url.searchParams.get('soc') || '2136';
      const isPreApril2024VisaHolder = url.searchParams.get('preApril2024') === 'true';
      const isNewEntrantRecentGraduate = url.searchParams.get('newEntrant') === 'true';
      const isHealthAndCareOccupation = url.searchParams.get('healthCare') === 'true';
      const maxAbsenceDaysInAny12Months = url.searchParams.get('absentDays') ? Number(url.searchParams.get('absentDays')) : 95;
      const landlordGasSafetyProvided = url.searchParams.get('gasSafety') !== 'false';
      return send(200, evaluateUkSkilledWorkerAndIlr({
        annualOfferedSalaryGbp,
        socCode,
        isPreApril2024VisaHolder,
        isNewEntrantRecentGraduate,
        isHealthAndCareOccupation,
        maxAbsenceDaysInAny12Months,
        landlordGasSafetyProvided,
        applicantAge: url.searchParams.get('age') ? Number(url.searchParams.get('age')) : null
      }));
    }
    if(path==='/v1/tools/super-visa-lico') {
      const hostFamilyMembersInCanada = url.searchParams.get('hostMembers') ? Number(url.searchParams.get('hostMembers')) : 3;
      const parentsGrandparentsToSponsor = url.searchParams.get('visitingMembers') ? Number(url.searchParams.get('visitingMembers')) : 2;
      const hostAnnualIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 78000;
      const coSignerIncomeCad = url.searchParams.get('coSignerIncome') ? Number(url.searchParams.get('coSignerIncome')) : 0;
      const hasCanadianHealthInsurance = url.searchParams.get('insurance') !== 'false';
      const insuranceCoverageAmountCad = url.searchParams.get('coverage') ? Number(url.searchParams.get('coverage')) : 100000;
      const applicationType = url.searchParams.get('appType') || 'super_visa';
      return send(200, evaluateSuperVisaAndPgp({
        hostFamilyMembersInCanada,
        parentsGrandparentsToSponsor,
        hostAnnualIncomeCad,
        coSignerIncomeCad,
        hasCanadianHealthInsurance,
        insuranceCoverageAmountCad,
        applicationType
      }));
    }
    if(path==='/v1/tools/australia-reforms') {
      const visaSubclass = url.searchParams.get('subclass') || '482_tss';
      const daysSinceCeasedEmployment = url.searchParams.get('ceasedDays') ? Number(url.searchParams.get('ceasedDays')) : 35;
      const totalCumulativeCessationDays = url.searchParams.get('cumulativeDays') ? Number(url.searchParams.get('cumulativeDays')) : 35;
      const annualTaxableIncomeAud = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 95000;
      const hasMedicareEntitlementStatement = url.searchParams.get('hasMes') === 'true';
      return send(200, evaluateAustraliaReforms({
        visaSubclass,
        daysSinceCeasedEmployment,
        totalCumulativeCessationDays,
        annualTaxableIncomeAud,
        hasMedicareEntitlementStatement
      }));
    }
    if(path==='/v1/tools/germany-chancenkarte') {
      const chancenkartePoints = url.searchParams.get('points') ? Number(url.searchParams.get('points')) : 6;
      const germanLanguageLevel = url.searchParams.get('language') || 'A2';
      const secondaryWorkHoursPerWeek = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 20;
      const nebenkostenInvoiceMonthsAfterPeriod = url.searchParams.get('nebenkostenMonths') ? Number(url.searchParams.get('nebenkostenMonths')) : 14;
      const nebenkostenArrearsDemandedEur = url.searchParams.get('arrears') ? Number(url.searchParams.get('arrears')) : 850;
      return send(200, evaluateGermanyChancenkarteAndTenancy({
        chancenkartePoints,
        germanLanguageLevel,
        secondaryWorkHoursPerWeek,
        nebenkostenInvoiceMonthsAfterPeriod,
        nebenkostenArrearsDemandedEur
      }));
    }
    if(path==='/v1/tools/cra-newcomer-wealth') {
      const plannedFhsa = url.searchParams.get('fhsa') ? Number(url.searchParams.get('fhsa')) : 8000;
      const plannedHbp = url.searchParams.get('hbp') ? Number(url.searchParams.get('hbp')) : 60000;
      const foreignFmv = url.searchParams.get('foreignFmv') ? Number(url.searchParams.get('foreignFmv')) : 250000;
      const giftAmount = url.searchParams.get('gift') ? Number(url.searchParams.get('gift')) : 50000;
      return send(200, evaluateNewcomerWealthPlan({
        fhsa: { plannedContributionCad: plannedFhsa },
        hbp: { requestedWithdrawalCad: plannedHbp, rrspBalanceCad: plannedHbp },
        foreignProperty: { foreignPropertyFmvAtLandingCad: foreignFmv },
        gift: { giftAmountCad: giftAmount }
      }));
    }
    if(path==='/v1/tools/ontario-bc-tenancy') {
      const province = (url.searchParams.get('province') || 'ON').toUpperCase();
      const currentRent = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 2000;
      const proposedRent = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 2100;
      const action = url.searchParams.get('action') || 'rent_increase';
      if (province === 'BC') {
        const failedToOccupy = url.searchParams.get('badFaith') === 'true';
        return send(200, auditBcTenancyNotice({
          type: action === 'landlord_use' ? 'landlord_use' : 'rent_increase',
          currentRentCad: currentRent,
          proposedRentCad: proposedRent,
          landlordFailedToOccupyFor6Months: failedToOccupy
        }));
      }
      if (action === 'shared_facility') {
        const shares = url.searchParams.get('shares') === 'true';
        const livesIn = url.searchParams.get('landlordLivesIn') === 'true';
        const relation = url.searchParams.get('relation') || 'self';
        return send(200, evaluateOntarioSharedKitchenBathroomJurisdiction({
          sharesKitchenOrBathroomWithLandlord: shares,
          landlordOrFamilyLivesInUnit: livesIn,
          relativeRelationshipToLandlord: relation
        }));
      }
      if (action === 'n12_audit') {
        return send(200, auditOntarioFormN12Notice({
          monthlyRentCad: currentRent,
          compensationPaidDate: url.searchParams.get('paidDate') || null
        }));
      }
      if (action === 't1_refund') {
        const amount = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 1500;
        const paidDate = url.searchParams.get('paidDate') || '2025-06-01';
        return send(200, evaluateOntarioT1RefundClaim({ amountPaidCad: amount, paymentDate: paidDate }));
      }
      return send(200, auditOntarioRentIncrease({ currentMonthlyRentCad: currentRent, proposedMonthlyRentCad: proposedRent }));
    }
    if(path==='/v1/tools/global-expat') {
      const country = (url.searchParams.get('country') || 'uae').toLowerCase();
      if (country === 'uae' || country === 'uae_gratuity') {
        const salary = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 15000;
        const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 3;
        const deductions = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 0;
        return send(200, evaluateUaeGratuityAndWps({ monthlyBasicSalaryAed: salary, yearsOfService: years, unlawfulDeductionsClaimedByEmployerAed: deductions }));
      }
      if (country === 'dubai' || country === 'dubai_rera') {
        const method = url.searchParams.get('method') || 'email';
        const months = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 12;
        return send(200, auditDubaiReraEvictionNotice({ noticeMethod: method, noticeMonthsGiven: months }));
      }
      if (country === 'nz') {
        const jobLossDays = url.searchParams.get('jobLossDays') ? Number(url.searchParams.get('jobLossDays')) : 25;
        const bondDays = url.searchParams.get('bondDays') ? Number(url.searchParams.get('bondDays')) : 15;
        return send(200, evaluateNewZealandAewvAndTenancy({ daysSinceJobLoss: jobLossDays, bondWorkingDaysSincePayment: bondDays }));
      }
      if (country === 'ireland') {
        const months = url.searchParams.get('csepMonths') ? Number(url.searchParams.get('csepMonths')) : 22;
        return send(200, evaluateIrelandCsepAndRpz({ monthsWorkedOnCsep: months }));
      }
      const score = url.searchParams.get('score') ? Number(url.searchParams.get('score')) : 40;
      return send(200, evaluateSingaporeCompassPass({ salaryPoints: score >= 20 ? 20 : score, qualificationPoints: score >= 40 ? 20 : 10 }));
    }
    if(path==='/v1/tools/canada-status-admissibility') {
      const category = (url.searchParams.get('category') || 'restoration').toLowerCase();
      if (category === 'flagpoling') {
        const permit = url.searchParams.get('permit') || 'pgwp';
        const port = url.searchParams.get('port') || 'peace_bridge';
        const day = url.searchParams.get('day') || 'wednesday';
        return send(200, auditFlagpolingEligibility({ requestedPermitType: permit, borderPort: port, dayOfWeek: day }));
      }
      if (category === 'dli_leave') {
        const days = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 120;
        const worked = url.searchParams.get('worked') === 'true';
        return send(200, auditDliAuthorizedLeave({ leaveDurationDays: days, workedDuringLeave: worked }));
      }
      if (category === 'criminal_inadmissibility') {
        const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 11;
        const serious = url.searchParams.get('serious') === 'true';
        return send(200, evaluateCriminalInadmissibility({ offenseClassification: serious ? 'serious_criminality' : 'non_serious_summary', yearsSinceSentenceCompleted: years }));
      }
      const expiredDate = url.searchParams.get('expiredDate') || '2026-03-01';
      return send(200, evaluateRestorationOfStatus({ statusExpiredDate: expiredDate, assessmentDate: url.searchParams.get('assessmentDate') || undefined }));
    }
    if(path==='/v1/tools/esa-wage-theft') {
      const action = url.searchParams.get('action') || 'overtime';
      if (action === 'vacation') {
        const earnings = url.searchParams.get('earnings') ? Number(url.searchParams.get('earnings')) : 60000;
        const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 5.5;
        return send(200, calculateVacationPayStepUp({ grossEarningsCad: earnings, yearsOfService: years }));
      }
      if (action === 'holiday') {
        const wages = url.searchParams.get('wages') ? Number(url.searchParams.get('wages')) : 3600;
        return send(200, calculatePublicHolidayPay({ wagesEarnedInPrior4WeeksCad: wages }));
      }
      if (action === 'severance') {
        const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 6;
        const weekly = url.searchParams.get('weekly') ? Number(url.searchParams.get('weekly')) : 1200;
        const payroll = url.searchParams.get('payroll') ? Number(url.searchParams.get('payroll')) : 3000000;
        return send(200, evaluateEsaStatutorySeverance({ yearsOfContinuousService: years, regularWeeklyWagesCad: weekly, employerOntarioPayrollCad: payroll }));
      }
      if (action === 'misclassification') {
        const control = url.searchParams.get('control') === 'true';
        return send(200, auditContractorMisclassification({ hasControlOverSchedule: control }));
      }
      if (action === 'equal_pay') {
        const tempRate = url.searchParams.get('tempRate') ? Number(url.searchParams.get('tempRate')) : 18.5;
        const permRate = url.searchParams.get('permRate') ? Number(url.searchParams.get('permRate')) : 24.0;
        return send(200, auditEqualPayForEqualWork({ temporaryAgencyHourlyRateCad: tempRate, permanentEmployeeHourlyRateCad: permRate }));
      }
      const rate = url.searchParams.get('rate') ? Number(url.searchParams.get('rate')) : 25;
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 50;
      return send(200, calculateOntarioOvertimePay({ hourlyRateCad: rate, weeklyHoursWorked: hours }));
    }
    if(path==='/v1/tools/workplace-rights') {
      const action = url.searchParams.get('action') || 'constructive_dismissal';
      if (action === 'canadian_experience') {
        const type = url.searchParams.get('type') || 'employment_hiring';
        const profession = url.searchParams.get('profession') || 'Professional Engineers Ontario';
        return send(200, auditCanadianExperienceBarriers({ type, regulatedProfessionName: profession }));
      }
      if (action === 'work_refusal') {
        const reported = url.searchParams.get('reported') !== 'false';
        const disciplined = url.searchParams.get('disciplined') === 'true';
        return send(200, auditOhsaWorkRefusalAndReprisal({ reportedToSupervisor: reported, employerDisciplinedOrFiredWorker: disciplined }));
      }
      if (action === 'wsib_deadline') {
        const date = url.searchParams.get('accidentDate') || '2026-06-01';
        return send(200, auditWsibInjuryClaimDeadline({ dateOfAccident: date }));
      }
      const wageCut = url.searchParams.get('wageCut') ? Number(url.searchParams.get('wageCut')) : 15;
      return send(200, auditConstructiveDismissal({ unilateralWageReductionPercent: wageCut }));
    }
    if(path==='/v1/tools/ei-benefits') {
      const action = url.searchParams.get('action') || 'regular';
      if (action === 'just_cause') {
        const reason = url.searchParams.get('reason') || 'spouse_relocation';
        return send(200, auditEiVoluntaryQuitJustCause({ quitReasonCategory: reason }));
      }
      if (action === 'parental' || action === 'sickness' || action === 'qpip') {
        const type = action === 'parental' ? 'parental_standard' : (action === 'qpip' ? 'qpip_paternity' : 'sickness');
        const earnings = url.searchParams.get('earnings') ? Number(url.searchParams.get('earnings')) : 1200;
        return send(200, evaluateEiParentalAndSicknessBenefits({ benefitType: type, averageWeeklyEarningsCad: earnings }));
      }
      const hours = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 650;
      const rate = url.searchParams.get('rate') ? Number(url.searchParams.get('rate')) : 7.5;
      return send(200, evaluateEiRegularBenefits({ insurableHoursAccrued: hours, regionalUnemploymentRatePercent: rate }));
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
    if(path==='/v1/tools/language-score-clb')return send(200,convertLanguageScores(Object.fromEntries(url.searchParams)));
    if(path==='/v1/tools/proof-of-funds')return send(200,evaluateProofOfFunds(Object.fromEntries(url.searchParams)));
    if(path==='/v1/tools/australia-tenancy') {
      const state = url.searchParams.get('state') || 'NSW';
      const weeklyRentAud = url.searchParams.get('weeklyRent') ? Number(url.searchParams.get('weeklyRent')) : 650;
      const bondPaidAud = url.searchParams.get('bondPaid') ? Number(url.searchParams.get('bondPaid')) : 2600;
      const rentIncreasePercent = url.searchParams.get('rentIncreasePercent') ? Number(url.searchParams.get('rentIncreasePercent')) : 0;
      const monthsSinceLastRentIncrease = url.searchParams.get('monthsSinceLastIncrease') ? Number(url.searchParams.get('monthsSinceLastIncrease')) : 12;
      const noticeGivenDays = url.searchParams.get('noticeGivenDays') ? Number(url.searchParams.get('noticeGivenDays')) : 60;
      return send(200, auditAustralianTenancy({
        state,
        weeklyRentAud,
        bondPaidAud,
        rentIncreasePercent,
        monthsSinceLastRentIncrease,
        noticeGivenDays
      }));
    }
    if(path==='/v1/tools/us-state-tenancy') {
      const state = url.searchParams.get('state') || 'CA';
      const monthlyRentUsd = url.searchParams.get('monthlyRent') ? Number(url.searchParams.get('monthlyRent')) : 2500;
      const securityDepositPaidUsd = url.searchParams.get('securityDeposit') ? Number(url.searchParams.get('securityDeposit')) : 2500;
      const rentIncreasePercent = url.searchParams.get('rentIncreasePercent') ? Number(url.searchParams.get('rentIncreasePercent')) : 0;
      const tenancyDurationMonths = url.searchParams.get('tenancyMonths') ? Number(url.searchParams.get('tenancyMonths')) : 14;
      const daysSinceMoveOut = url.searchParams.get('daysSinceMoveOut') ? Number(url.searchParams.get('daysSinceMoveOut')) : 0;
      return send(200, auditUsStateTenancy({
        state,
        monthlyRentUsd,
        securityDepositPaidUsd,
        rentIncreasePercent,
        tenancyDurationMonths,
        daysSinceMoveOut
      }));
    }
    if(path==='/v1/tools/uk-devolved-tenancy') {
      const nation = url.searchParams.get('nation') || 'Scotland';
      const monthlyRentGbp = url.searchParams.get('monthlyRent') ? Number(url.searchParams.get('monthlyRent')) : 1000;
      const depositPaidGbp = url.searchParams.get('depositPaid') ? Number(url.searchParams.get('depositPaid')) : 1000;
      const tenureDurationMonths = url.searchParams.get('tenureMonths') ? Number(url.searchParams.get('tenureMonths')) : 12;
      const noticeGivenDays = url.searchParams.get('noticeGivenDays') ? Number(url.searchParams.get('noticeGivenDays')) : 28;
      const evictionGround = url.searchParams.get('evictionGround') || 'landlord_intends_to_sell';
      return send(200, auditUkDevolvedTenancy({
        nation,
        monthlyRentGbp,
        depositPaidGbp,
        tenureDurationMonths,
        noticeGivenDays,
        evictionGround
      }));
    }
    if(path==='/v1/tools/uae-tenancy-dispute') {
      const emirate = url.searchParams.get('emirate') || 'Dubai';
      const currentAnnualRentAed = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 80000;
      const averageMarketRentAed = url.searchParams.get('marketRent') ? Number(url.searchParams.get('marketRent')) : 100000;
      const proposedAnnualRentAed = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 88000;
      const noticeDaysPriorToRenewal = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 90;
      const evictionNoticeGiven = url.searchParams.get('evictionNotice') === 'true';
      const evictionServedViaNotary = url.searchParams.get('notaryServed') !== 'false';
      return send(200, auditUaeTenancy({
        emirate,
        currentAnnualRentAed,
        averageMarketRentAed,
        proposedAnnualRentAed,
        noticeDaysPriorToRenewal,
        evictionNoticeGiven,
        evictionServedViaNotary
      }));
    }
  return false;
}

export function handleToolPost(ctx) {
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
    if(path==='/v1/tools/credit-simulator') {
      return send(200, calculateCreditTrajectory(input));
    }
    if(path==='/v1/tools/validate-documents') {
      return send(200, validateNewcomerDocuments(input));
    }
    if(path==='/v1/tools/cra-benefits') {
      return send(200, calculateNewcomerBenefits(input));
    }
    if(path==='/v1/tools/credential-pathway') {
      return send(200, evaluateCredentialPathway(input));
    }
    if(path==='/v1/tools/lease-guard') {
      return send(200, auditLeaseAgreement(input));
    }
    if(path==='/v1/tools/childcare-support') {
      return send(200, evaluateChildcareSupport(input));
    }
    if(path==='/v1/tools/customs-declaration') {
      return send(200, evaluateCustomsDeclaration(input));
    }
    if(path==='/v1/tools/homebuyer-eligibility') {
      return send(200, evaluateHomebuyerEligibility(input));
    }
    if(path==='/v1/tools/banking-comparator') {
      return send(200, evaluateBankingAndCreditStrategy(input));
    }
    if(path==='/v1/tools/citizenship-calculator') {
      return send(200, evaluateCitizenshipEligibility(input));
    }
    if(path==='/v1/tools/eviction-defense') {
      return send(200, auditEvictionNotice(input));
    }
    if(path==='/v1/tools/pr-residency') {
      return send(200, evaluatePrResidencyObligation(input));
    }
    if(path==='/v1/tools/medical-admissibility') {
      return send(200, evaluateMedicalAdmissibility(input));
    }
    if(path==='/v1/tools/worker-classification') {
      return send(200, auditWorkerClassificationAndWageTheft(input));
    }
    if(path==='/v1/tools/vehicle-import') {
      return send(200, evaluateVehicleImportation(input));
    }
    if(path==='/v1/tools/student-compliance') {
      return send(200, evaluateStudentWorkCompliance(input));
    }
    if(path==='/v1/tools/vulnerable-worker') {
      return send(200, evaluateVulnerableWorkerProtection(input));
    }
    if(path==='/v1/tools/super-visa-sponsor') {
      return send(200, evaluateSuperVisaAndFamilySponsorship(input));
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
    if(path==='/v1/tools/parental-leave') {
      return send(200, evaluateParentalLeave(input));
    }
    if(path==='/v1/tools/express-entry-crs') {
      return send(200, evaluateExpressEntryCrs(input));
    }
    if(path==='/v1/tools/business-structure') {
      return send(200, evaluateBusinessStructure(input));
    }
    if(path==='/v1/tools/language-score-clb')return send(200,convertLanguageScores(input));
    if(path==='/v1/tools/proof-of-funds')return send(200,evaluateProofOfFunds(input));
    if(path==='/v1/tools/pnp-pathway') {
      return send(200, evaluateProvincialNomineePathway(input));
    }
    if(path==='/v1/tools/bowp-diagnostic') {
      return send(200, evaluateBowpPathway(input));
    }
    if(path==='/v1/tools/lease-assignment') {
      return send(200, evaluateLeaseAssignmentExit(input));
    }
    if(path==='/v1/tools/debt-collection-defense') {
      return send(200, evaluateDebtCollectionDefense(input));
    }
    if(path==='/v1/tools/moving-tax-deduction') {
      return send(200, evaluateMovingExpensesDeduction(input));
    }
    if(path==='/v1/tools/credential-licensure') {
      return send(200, evaluateCredentialLicensurePathway(input));
    }
    if(path==='/v1/tools/telecom-contract-defense') {
      return send(200, evaluateTelecomDispute(input));
    }
    if(path==='/v1/tools/border-flagpoling') {
      return send(200, evaluateFlagpolingFeasibility(input));
    }
    if(path==='/v1/tools/rent-increase-defense') {
      return send(200, evaluateRentIncreaseNotice(input));
    }
    if(path==='/v1/tools/human-rights-defense') {
      return send(200, evaluateWorkplaceDiscriminationAndConstructiveDismissal(input));
    }
    if(path==='/v1/tools/homebuyer-tax-incentives') {
      return send(200, evaluateHomebuyerTaxIncentives(input));
    }
    if(path==='/v1/tools/auto-insurance') {
      return send(200, evaluateAutoInsuranceProfile(input));
    }
    if(path==='/v1/tools/estate-planning') {
      return send(200, evaluateEstatePlanProfile(input));
    }
    if(path==='/v1/tools/small-claims') {
      return send(200, evaluateSmallClaimsDispute(input));
    }
    if(path==='/v1/tools/cra-voluntary-disclosure') {
      return send(200, evaluateVoluntaryDisclosure(input));
    }
    if(path==='/v1/tools/statutory-pay') {
      return send(200, auditStatutoryPayAndWages(input));
    }
    if(path==='/v1/tools/consumer-protection') {
      return send(200, evaluateConsumerContract(input));
    }
    if(path==='/v1/tools/family-law') {
      return send(200, evaluateFamilyLawAndSupport(input));
    }
    if(path==='/v1/tools/social-assistance') {
      return send(200, evaluateSocialAssistance(input));
    }
    if(path==='/v1/tools/tenancy-repairs') {
      return send(200, evaluateTenancyRepairs(input));
    }
    if(path==='/v1/tools/commercial-lease') {
      return send(200, evaluateCommercialLease(input));
    }
    if(path==='/v1/tools/employment-reference') {
      return send(200, auditEmploymentReferenceLetter(input));
    }
    if(path==='/v1/tools/high-cost-credit') {
      return send(200, evaluateConsumerCreditAgreement(input));
    }
    if(path==='/v1/tools/pgwp-eligibility') {
      return send(200, evaluatePgwpEligibility(input));
    }
    if(path==='/v1/tools/cross-border-tax') {
      return send(200, evaluateCrossBorderTaxObligations(input));
    }
    if(path==='/v1/tools/workplace-safety') {
      return send(200, evaluateWorkplaceSafetyAndRefusal(input));
    }
    if(path==='/v1/tools/tfw-compliance') {
      return send(200, evaluateTfwEmployerCompliance(input));
    }
    if(path==='/v1/tools/healthcare-portability') {
      return send(200, evaluateHealthcarePortabilityAndIfhp(input));
    }
    if(path==='/v1/tools/real-estate-assignment') {
      return send(200, evaluateRealEstateAssignment(input));
    }
    if(path==='/v1/tools/oas-gis') {
      return send(200, evaluateOasGisEligibility(input));
    }
    if(path==='/v1/tools/criminal-rehab') {
      return send(200, evaluateCriminalInadmissibilityAndRehab(input));
    }
    if(path==='/v1/tools/franchise-disclosure') {
      return send(200, evaluateFranchiseDisclosure(input));
    }
    if(path==='/v1/tools/sowp-eligibility') {
      return send(200, evaluateSowpEligibility(input));
    }
    if(path==='/v1/tools/ei-disqualification') {
      return send(200, evaluateEiDisqualificationAndAllocation(input));
    }
    if(path==='/v1/tools/rural-renewal') {
      return send(200, evaluateRuralRenewalEligibility(input));
    }
    if(path==='/v1/tools/speculation-tax-rebate') {
      return send(200, evaluateSpeculationTaxAndRebates(input));
    }
    if(path==='/v1/tools/child-welfare-guardianship') {
      return send(200, evaluateChildWelfareAndGuardianship(input));
    }
    if(path==='/v1/tools/excessive-demand-mitigation') {
      return send(200, evaluateExcessiveDemandMitigation(input));
    }
    if(path==='/v1/tools/francophone-mobility') {
      return send(200, evaluateFrancophoneMobility(input));
    }
    if(path==='/v1/tools/digital-platform-worker') {
      return send(200, evaluatePlatformWorkerRights(input));
    }
    if(path==='/v1/tools/atlantic-immigration') {
      return send(200, evaluateAtlanticImmigrationEligibility(input));
    }
    if(path==='/v1/tools/childcare-subsidy') {
      return send(200, evaluateChildCareSubsidy(input));
    }
    if(path==='/v1/tools/bc-strata-bylaw') {
      return send(200, evaluateBcStrataBylawDefense(input));
    }
    if(path==='/v1/tools/pr-card-renewal') {
      return send(200, evaluatePrCardRenewalUrgent(input));
    }
    if(path==='/v1/tools/foreign-worker-transition') {
      return send(200, evaluateForeignWorkerTransition(input));
    }
    if(path==='/v1/tools/child-disability-benefit') {
      return send(200, evaluateChildDisabilityBenefit(input));
    }
    if(path==='/v1/tools/alberta-security-deposit') {
      return send(200, evaluateAlbertaSecurityDeposit(input));
    }
    if(path==='/v1/tools/internationally-trained-nurse') {
      return send(200, evaluateInternationallyTrainedNurse(input));
    }
    if(path==='/v1/tools/alberta-opportunity-stream') {
      return send(200, evaluateAlbertaOpportunityStream(input));
    }
    if(path==='/v1/tools/bc-speculation-tax-declaration') {
      return send(200, evaluateBcSpeculationTaxDeclaration(input));
    }
    if(path==='/v1/tools/prtd-humanitarian') {
      return send(200, evaluatePrtdHumanitarian(input));
    }
    if(path==='/v1/tools/severance-reasonable-notice') {
      return send(200, evaluateStatutorySeveranceNotice(input));
    }
    if(path==='/v1/tools/manitoba-pnp-skilled-worker') {
      return send(200, evaluateManitobaPnpSkilledWorker(input));
    }
    if(path==='/v1/tools/sinp-hard-to-fill') {
      return send(200, evaluateSinpHardToFillSkills(input));
    }
    if(path==='/v1/tools/esa-reprisal-defense') {
      return send(200, evaluateEsaReprisal(input));
    }
    if(path==='/v1/tools/bc-svt-appeal') {
      return send(200, auditBcSvtNoticeOfObjection(input));
    }
    if(path==='/v1/tools/express-entry-tie-break') {
      return send(200, evaluateExpressEntryTieBreak(input));
    }
    if(path==='/v1/tools/calgary-suite-amnesty') {
      return send(200, auditCalgarySecondarySuite(input));
    }
    if(path==='/v1/tools/esa-constructive-layoff') {
      return send(200, evaluateEsaConstructiveDismissalLayoff(input));
    }
    if(path==='/v1/tools/nsnp-experience') {
      return send(200, evaluateNovaScotiaExperienceStream(input));
    }
    if(path==='/v1/tools/quebec-peq-worker') {
      return send(200, evaluateQuebecPeqTemporaryWorker(input));
    }
    if(path==='/v1/tools/alberta-commercial-distress') {
      return send(200, auditAlbertaCommercialDistress(input));
    }
    if(path==='/v1/tools/trp-inadmissibility') {
      return send(200, evaluateTrpCompellingBalance(input));
    }
    if(path==='/v1/tools/federal-skilled-trades') {
      return send(200, evaluateFederalSkilledTradesProgram(input));
    }
    if(path==='/v1/tools/bc-strata-ev-charging') {
      return send(200, evaluateBcStrataEvCharging(input));
    }
    if(path==='/v1/tools/on-pay-transparency') {
      return send(200, auditOntarioPayTransparencyAndPosting(input));
    }
    if(path==='/v1/tools/yukon-critical-impact') {
      return send(200, evaluateYukonCriticalImpactWorker(input));
    }
    if(path==='/v1/tools/tfw-employer-transition') {
      return send(200, evaluateForeignWorkerPermitTransition(input));
    }
    if(path==='/v1/tools/pei-occupations-demand') {
      return send(200, evaluatePeiOccupationsInDemand(input));
    }
    if(path==='/v1/tools/bc-esa-group-termination') {
      return send(200, evaluateBcGroupTerminationNotice(input));
    }
    if(path==='/v1/tools/start-up-visa') {
      return send(200, evaluateStartUpVisaEligibility(input));
    }
    if(path==='/v1/tools/ontario-tenancy-assignment') {
      return send(200, evaluateOntarioTenancyAssignmentSublet(input));
    }
    if(path==='/v1/tools/nbpnp-skilled-worker') {
      return send(200, evaluateNbpnpSkilledWorker(input));
    }
    if(path==='/v1/tools/self-employed-persons') {
      return send(200, evaluateSelfEmployedProgram(input));
    }
    if(path==='/v1/tools/alberta-overtime-banking') {
      return send(200, evaluateAlbertaOvertimeBanking(input));
    }
    if(path==='/v1/tools/ontario-roommate-rights') {
      return send(200, evaluateOntarioRoommateAndOccupantRights(input));
    }
    if(path==='/v1/tools/sinp-tech-talent') {
      return send(200, evaluateSinpTechTalent(input));
    }
    if(path==='/v1/tools/caregiver-direct-pr') {
      return send(200, evaluateCaregiverDirectToPr(input));
    }
    if(path==='/v1/tools/citizenship-revocation') {
      return send(200, evaluateCitizenshipRevocationDefense(input));
    }
    if(path==='/v1/tools/bc-roommate-rights') {
      return send(200, evaluateBcRoommateAndSharedKitchen(input));
    }
    if(path==='/v1/tools/alberta-rural-entrepreneur') {
      return send(200, evaluateAlbertaRuralEntrepreneur(input));
    }
    if(path==='/v1/tools/refugee-cessation') {
      return send(200, evaluateRefugeeCessationRisk(input));
    }
    if(path==='/v1/tools/on-remote-work-jurisdiction') {
      return send(200, evaluateOntarioRemoteWorkJurisdiction(input));
    }
    if(path==='/v1/tools/manitoba-leave') {
      return send(200, evaluateManitobaEmploymentLeave(input));
    }
    if(path==='/v1/tools/alberta-tenancy-sublease') {
      return send(200, evaluateAlbertaTenancySubleaseAssignment(input));
    }
    if(path==='/v1/tools/francophone-community-pilot') {
      return send(200, evaluateFrancophoneCommunityPilot(input));
    }
    if(path==='/v1/tools/bc-child-youth-employment') {
      return send(200, evaluateBcChildYouthEmployment(input));
    }
    if(path==='/v1/tools/on-creed-accommodation') {
      return send(200, evaluateOntarioHousingCreedAccommodation(input));
    }
    if(path==='/v1/tools/citizenship-residence-audit') {
      return send(200, auditCitizenshipPhysicalPresence(input));
    }
    if(path==='/v1/tools/quebec-csq-arrima') {
      return send(200, evaluateQuebecCsqSkilledWorker(input));
    }
    if(path==='/v1/tools/alberta-rest-periods') {
      return send(200, auditAlbertaEmploymentRestPeriods(input));
    }
    if(path==='/v1/tools/bc-strata-str') {
      return send(200, auditBcStrataShortTermRental(input));
    }
    if(path==='/v1/tools/on-tha-licensing') {
      return send(200, auditOntarioThaLicensing(input));
    }
    if(path==='/v1/tools/federal-ict-work-permit') {
      return send(200, evaluateFederalIntraCompanyTransferee(input));
    }
    if(path==='/v1/tools/saskatchewan-layoff-notice') {
      return send(200, evaluateSaskatchewanLayoffNotice(input));
    }
    if(path==='/v1/tools/alberta-abandoned-goods') {
      return send(200, evaluateAlbertaAbandonedGoods(input));
    }
    if(path==='/v1/tools/bc-uniform-deductions') {
      return send(200, auditBcEmploymentUniformAndDeductions(input));
    }
    if(path==='/v1/tools/visitor-extension-restoration') {
      return send(200, evaluateFederalVisitorExtensionAndRestoration(input));
    }
    if(path==='/v1/tools/bc-pnp-tech') {
      return send(200, evaluateBcTechPilotEligibility(input));
    }
    if(path==='/v1/tools/ontario-temp-layoff') {
      return send(200, auditOntarioTemporaryLayoff(input));
    }
    if(path==='/v1/tools/federal-c10-significant-benefit') {
      return send(200, evaluateFederalC10SignificantBenefit(input));
    }
    if(path==='/v1/tools/alberta-just-cause') {
      return send(200, auditAlbertaTerminationJustCause(input));
    }
    if(path==='/v1/tools/manitoba-rent-increase') {
      return send(200, evaluateManitobaRentIncrease(input));
    }
    if(path==='/v1/tools/federal-c20-reciprocal-work') {
      return send(200, evaluateFederalReciprocalEmployment(input));
    }
    if(path==='/v1/tools/bc-landlord-use-eviction') {
      return send(200, evaluateBcLandlordUseEviction(input));
    }
    if(path==='/v1/tools/ontario-severance-payroll') {
      return send(200, calculateOntarioStatutorySeverance(input));
    }
    if(path==='/v1/tools/alberta-landlord-entry') {
      return send(200, evaluateAlbertaLandlordEntry(input));
    }
    if(path==='/v1/tools/federal-dual-intent') {
      return send(200, evaluateDualIntentCompliance(input));
    }
    if(path==='/v1/tools/federal-c11-entrepreneur-work-permit') {
      return send(200, evaluateFederalC11EntrepreneurWorkPermit(input));
    }
    if(path==='/v1/tools/alberta-employment-maternity-parental-leave') {
      return send(200, evaluateAlbertaMaternityParentalLeave(input));
    }
    if(path==='/v1/tools/ontario-residential-tenancy-urgent-repairs-t6') {
      return send(200, evaluateOntarioUrgentRepairsT6(input));
    }
    if(path==='/v1/tools/british-columbia-employment-illness-injury-leave') {
      return send(200, evaluateBcIllnessInjuryLeave(input));
    }
    if(path==='/v1/tools/federal-francophone-mobility-c16') {
      return send(200, evaluateFederalFrancophoneMobilityC16(input));
    }
    if(path==='/v1/tools/federal-bowp-pr-acknowledgement') {
      return send(200, evaluateFederalBridgingOpenWorkPermit(input));
    }
    if(path==='/v1/tools/ontario-rent-deposit-interest') {
      return send(200, evaluateOntarioRentDepositInterest(input));
    }
    if(path==='/v1/tools/alberta-general-holiday-pay') {
      return send(200, evaluateAlbertaGeneralHolidayPay(input));
    }
    if(path==='/v1/tools/bc-strata-depreciation-crf') {
      return send(200, evaluateBcStrataDepreciationReport(input));
    }
    if(path==='/v1/tools/federal-fta-professional-work-permit') {
      return send(200, evaluateFederalFtaProfessionalWorkPermit(input));
    }
    if(path==='/v1/tools/ontario-employment-reprisal') {
      return send(200, evaluateOntarioEmploymentReprisal(input));
    }
    if(path==='/v1/tools/bc-security-deposit-double-penalty') {
      return send(200, evaluateBcSecurityDepositDoublePenalty(input));
    }
    if(path==='/v1/tools/alberta-constructive-dismissal') {
      return send(200, evaluateAlbertaConstructiveDismissal(input));
    }
    if(path==='/v1/tools/federal-suv-peer-review') {
      return send(200, evaluateFederalSuvPeerReview(input));
    }
    if(path==='/v1/tools/saskatchewan-security-deposit-return') {
      return send(200, evaluateSaskatchewanSecurityDepositReturn(input));
    }
    if(path==='/v1/tools/ontario-illegal-entry-t2') {
      return send(200, evaluateOntarioIllegalEntryT2(input));
    }
    if(path==='/v1/tools/bc-overtime-banking') {
      return send(200, evaluateBcOvertimeBanking(input));
    }
    if(path==='/v1/tools/alberta-periodic-tenancy-notice') {
      return send(200, evaluateAlbertaPeriodicTenancyNotice(input));
    }
    if(path==='/v1/tools/federal-super-visa-insurance-lico') {
      return send(200, evaluateFederalSuperVisaInsuranceLico(input));
    }
    if(path==='/v1/tools/manitoba-general-holiday-pay') {
      return send(200, evaluateManitobaGeneralHolidayPay(input));
    }
    if(path==='/v1/tools/federal-caregiver-pr-pathway') {
      return send(200, evaluateFederalCaregiverPrPathway(input));
    }
    if(path==='/v1/tools/ontario-public-holiday-pay') {
      return send(200, evaluateOntarioPublicHolidayPay(input));
    }
    if(path==='/v1/tools/bc-rtb-dispute-track') {
      return send(200, evaluateBcRtbDisputeTrack(input));
    }
    if(path==='/v1/tools/alberta-youth-employment-rules') {
      return send(200, evaluateAlbertaYouthEmploymentRules(input));
    }
    if(path==='/v1/tools/federal-student-off-campus-work') {
      return send(200, evaluateFederalStudentOffCampusWork(input));
    }
    if(path==='/v1/tools/study-permit-cap-pal') {
      return send(200, evaluateStudyPermitCapAndPal(input));
    }
    if(path==='/v1/tools/visitor-visa-financial-ties') {
      return send(200, evaluateVisitorVisaTies(input));
    }
    if(path==='/v1/tools/lmia-readiness') {
      return send(200, evaluateLmiaReadiness(input));
    }
    if(path==='/v1/tools/sin-healthcare') {
      return send(200, evaluateGovernmentEnrollment(input));
    }
    if(path==='/v1/tools/pr-matrix') {
      return send(200, evaluatePrMatrix(input));
    }
    if(path==='/v1/tools/family-reunification') {
      return send(200, evaluateFamilyReunification(input));
    }
    if(path==='/v1/tools/tax-shield') {
      return send(200, evaluateTaxShield(input));
    }
    if(path==='/v1/tools/calendar-sync') {
      return send(200, evaluateStatutoryTimeline(input));
    }
    if(path==='/v1/tools/study-to-pr') {
      return send(200, evaluateStudyToPrPathway(input));
    }
    if(path==='/v1/tools/gcms-analyzer') {
      return send(200, analyzeGcmsRefusalNotes(input));
    }
    if(path==='/v1/tools/global-visa-matrix') {
      return send(200, evaluateGlobalVisaPathways(input));
    }
    if(path==='/v1/tools/moving-tax-calc') {
      return send(200, calculateMovingTaxDeduction(input));
    }
    if(path==='/v1/tools/severance-bardal') {
      return send(200, calculateSeveranceAndNotice(input));
    }
    if(path==='/v1/tools/us-h1b-opt') {
      return send(200, evaluateUsH1bOptStatus(input));
    }
    if(path==='/v1/tools/uk-skilled-worker') {
      return send(200, evaluateUkSkilledWorkerAndIlr(input));
    }
    if(path==='/v1/tools/super-visa-lico') {
      return send(200, evaluateSuperVisaAndPgp(input));
    }
    if(path==='/v1/tools/australia-reforms') {
      return send(200, evaluateAustraliaReforms(input));
    }
    if(path==='/v1/tools/germany-chancenkarte') {
      return send(200, evaluateGermanyChancenkarteAndTenancy(input));
    }
    if(path==='/v1/tools/legal-notices') {
      // Accept the website form's field names (sender, recipient, amount, issues as
      // a semicolon list) and the canonical API names alike; empty strings and
      // non-numeric amounts fall back to the same defaults the GET endpoint uses.
      const num=v=>{const n=Number(v);return Number.isFinite(n)&&String(v).trim()!==''?n:0;};
      const issues=Array.isArray(input.issues)?input.issues
        :typeof input.issues==='string'?input.issues.split(';').map(s=>s.trim()).filter(Boolean):[];
      return send(200, generateLegalNotice({
        ...input,
        senderName:input.senderName||input.sender||'Applicant',
        recipientName:input.recipientName||input.recipient||'Respondent',
        totalClaimAmount:input.totalClaimAmount??num(input.amount),
        issues
      }));
    }
    if(path==='/v1/tools/poe-rights') {
      return send(200, evaluatePortOfEntryRights(input));
    }
    if(path==='/v1/tools/cra-newcomer-wealth') {
      // Mirror the GET endpoint for form/flat bodies; canonical nested plan objects pass through as-is.
      const num=(v,d)=>{const n=Number(v);return n!==''&&v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
      const hbp=num(input.hbp??input.plannedHbp,60000);
      return send(200, evaluateNewcomerWealthPlan({
        fhsa: isObj(input.fhsa)?input.fhsa:{ plannedContributionCad: num(input.fhsa??input.plannedFhsa,8000) },
        hbp: isObj(input.hbp)?input.hbp:{ requestedWithdrawalCad: hbp, rrspBalanceCad: hbp },
        foreignProperty: isObj(input.foreignProperty)?input.foreignProperty:{ foreignPropertyFmvAtLandingCad: num(input.foreignFmv,250000) },
        gift: isObj(input.gift)?input.gift:{ giftAmountCad: num(input.gift??input.giftAmount,50000) }
      }));
    }
    if(path==='/v1/tools/ontario-bc-tenancy') {
      // Mirror the GET endpoint for form bodies; canonical API keys win when present.
      const isTrue=v=>v===true||v==='true';
      const notEmpty=v=>v!=null&&v!=='';
      const numOr=(v,d)=>{const n=Number(v);return notEmpty(v)&&Number.isFinite(n)?n:d;};
      const province=String(input.province||'ON').toUpperCase();
      const currentRent=numOr(input.currentRent,2000);
      const proposedRent=numOr(input.proposedRent,2100);
      const action=input.action||'rent_increase';
      if (province === 'BC' || input.type === 'bc_tenancy') {
        return send(200, auditBcTenancyNotice({
          type: input.type || (action === 'landlord_use' ? 'landlord_use' : 'rent_increase'),
          currentRentCad: numOr(input.currentRentCad,currentRent),
          proposedRentCad: numOr(input.proposedRentCad,proposedRent),
          landlordFailedToOccupyFor6Months: isTrue(input.landlordFailedToOccupyFor6Months??input.badFaith)
        }));
      }
      if (action === 'shared_facility') {
        return send(200, evaluateOntarioSharedKitchenBathroomJurisdiction({
          sharesKitchenOrBathroomWithLandlord: isTrue(input.sharesKitchenOrBathroomWithLandlord??input.shares),
          landlordOrFamilyLivesInUnit: isTrue(input.landlordOrFamilyLivesInUnit??input.landlordLivesIn),
          relativeRelationshipToLandlord: input.relativeRelationshipToLandlord ?? (input.relation || 'self')
        }));
      }
      if (action === 'n12_audit') {
        return send(200, auditOntarioFormN12Notice({
          monthlyRentCad: numOr(input.monthlyRentCad,currentRent),
          compensationPaidDate: input.compensationPaidDate ?? (input.paidDate||null)
        }));
      }
      if (action === 't1_refund') {
        return send(200, evaluateOntarioT1RefundClaim({
          amountPaidCad: numOr(input.amountPaidCad, numOr(input.amount, 1500)),
          paymentDate: input.paymentDate ?? (input.paidDate||'2025-06-01')
        }));
      }
      return send(200, auditOntarioRentIncrease({
        currentMonthlyRentCad: numOr(input.currentMonthlyRentCad,currentRent),
        proposedMonthlyRentCad: numOr(input.proposedMonthlyRentCad,proposedRent)
      }));
    }
    if(path==='/v1/tools/global-expat') {
      // Mirror the GET endpoint for form bodies; canonical API keys win when present.
      const notEmpty=v=>v!=null&&v!=='';
      const numOr=(v,d)=>{const n=Number(v);return notEmpty(v)&&Number.isFinite(n)?n:d;};
      const country=String(input.country||'uae').toLowerCase();
      if (country === 'uae' || country === 'uae_gratuity' || input.action === 'gratuity' || notEmpty(input.monthlyBasicSalaryAed)) {
        return send(200, evaluateUaeGratuityAndWps({
          monthlyBasicSalaryAed: numOr(input.monthlyBasicSalaryAed, numOr(input.salary,15000)),
          yearsOfService: numOr(input.yearsOfService, numOr(input.years,3)),
          unlawfulDeductionsClaimedByEmployerAed: numOr(input.unlawfulDeductionsClaimedByEmployerAed, numOr(input.deductions,0))
        }));
      }
      if (country === 'dubai' || country === 'dubai_eviction' || country === 'dubai_rera' || input.action === 'dubai_rera' || notEmpty(input.noticeMethod) || notEmpty(input.noticeMonthsGiven)) {
        return send(200, auditDubaiReraEvictionNotice({
          noticeMethod: input.noticeMethod ?? (input.method || 'email'),
          noticeMonthsGiven: numOr(input.noticeMonthsGiven, numOr(input.months,12))
        }));
      }
      if (country === 'nz' || input.action === 'new_zealand') {
        return send(200, evaluateNewZealandAewvAndTenancy({
          daysSinceJobLoss: numOr(input.daysSinceJobLoss, numOr(input.jobLossDays,25)),
          bondWorkingDaysSincePayment: numOr(input.bondWorkingDaysSincePayment, numOr(input.bondDays,15))
        }));
      }
      if (country === 'ireland' || input.action === 'ireland') {
        return send(200, evaluateIrelandCsepAndRpz({
          monthsWorkedOnCsep: numOr(input.monthsWorkedOnCsep, numOr(input.csepMonths,22))
        }));
      }
      if (notEmpty(input.salaryPoints) || notEmpty(input.qualificationPoints)) {
        return send(200, evaluateSingaporeCompassPass(input));
      }
      const score=numOr(input.score,40);
      return send(200, evaluateSingaporeCompassPass({ salaryPoints: score >= 20 ? 20 : score, qualificationPoints: score >= 40 ? 20 : 10 }));
    }
    if(path==='/v1/tools/canada-status-admissibility') {
      // Mirror the GET endpoint for form bodies; canonical API keys win when present.
      const isTrue=v=>v===true||v==='true';
      const notEmpty=v=>v!=null&&v!=='';
      const numOr=(v,d)=>{const n=Number(v);return notEmpty(v)&&Number.isFinite(n)?n:d;};
      const category=String(input.category||'restoration').toLowerCase();
      if (category === 'flagpoling' || notEmpty(input.borderPort) || notEmpty(input.requestedPermitType)) {
        return send(200, auditFlagpolingEligibility({
          requestedPermitType: input.requestedPermitType ?? (input.permit || 'pgwp'),
          borderPort: input.borderPort ?? (input.port || 'peace_bridge'),
          dayOfWeek: input.dayOfWeek ?? (input.day || 'wednesday')
        }));
      }
      if (category === 'dli_leave' || input.leaveDurationDays !== undefined) {
        return send(200, auditDliAuthorizedLeave({
          leaveDurationDays: numOr(input.leaveDurationDays, numOr(input.days,120)),
          workedDuringLeave: isTrue(input.workedDuringLeave ?? input.worked)
        }));
      }
      if (category === 'criminal_inadmissibility' || notEmpty(input.offenseClassification) || input.yearsSinceSentenceCompleted !== undefined) {
        return send(200, evaluateCriminalInadmissibility({
          offenseClassification: input.offenseClassification ?? (isTrue(input.serious) ? 'serious_criminality' : 'non_serious_summary'),
          yearsSinceSentenceCompleted: numOr(input.yearsSinceSentenceCompleted, numOr(input.years,11))
        }));
      }
      return send(200, evaluateRestorationOfStatus({
        statusExpiredDate: input.statusExpiredDate ?? (input.expiredDate || '2026-03-01'),
        assessmentDate: input.assessmentDate
      }));
    }
    if(path==='/v1/tools/esa-wage-theft') {
      const action = input.action || 'overtime';
      if (action === 'vacation') return send(200, calculateVacationPayStepUp(input));
      if (action === 'holiday') return send(200, calculatePublicHolidayPay(input));
      if (action === 'severance') return send(200, evaluateEsaStatutorySeverance(input));
      if (action === 'misclassification') return send(200, auditContractorMisclassification(input));
      if (action === 'equal_pay') return send(200, auditEqualPayForEqualWork(input));
      return send(200, calculateOntarioOvertimePay(input));
    }
    if(path==='/v1/tools/workplace-rights') {
      const action = input.action || 'constructive_dismissal';
      if (action === 'canadian_experience') return send(200, auditCanadianExperienceBarriers(input));
      if (action === 'work_refusal') return send(200, auditOhsaWorkRefusalAndReprisal(input));
      if (action === 'wsib_deadline') return send(200, auditWsibInjuryClaimDeadline(input));
      return send(200, auditConstructiveDismissal(input));
    }
    if(path==='/v1/tools/ei-benefits') {
      const action = input.action || 'regular';
      if (action === 'just_cause') return send(200, auditEiVoluntaryQuitJustCause(input));
      if (action === 'parental' || action === 'sickness' || action === 'qpip') {
        return send(200, evaluateEiParentalAndSicknessBenefits(input));
      }
      return send(200, evaluateEiRegularBenefits(input));
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
