// src/routes/tools/immigration.js
// Domain route handlers for immigration tools.

import { ToolInputError } from '../../api-errors.js';
import { applyFormAliases, ASSUMPTION_NOTICE } from '../../tool-input.js';
import { analyzeGcmsRefusalNotes } from '../../gcms-refusal-analyzer.js';
import { auditCitizenshipPhysicalPresence } from '../../federal-citizenship-residence-calculator-audit-navigator.js';
import { evaluateAlbertaOpportunityStream } from '../../alberta-opportunity-stream-navigator.js';
import { evaluateAlbertaRuralEntrepreneur } from '../../alberta-alep-rural-entrepreneur-stream-navigator.js';
import { evaluateAtlanticImmigrationEligibility } from '../../atlantic-immigration-navigator.js';
import { evaluateBcTechPilotEligibility } from '../../british-columbia-pnp-skills-immigration-tech-navigator.js';
import { evaluateBowpPathway } from '../../bowp-navigator.js';
import { evaluateCaregiverDirectToPr } from '../../federal-caregiver-direct-to-pr-pilot-navigator.js';
import { evaluateCitizenshipEligibility } from '../../citizenship-navigator.js';
import { evaluateCitizenshipRevocationDefense } from '../../federal-citizenship-revocation-defense-navigator.js';
import { evaluateCriminalInadmissibilityAndRehab } from '../../criminal-rehabilitation-navigator.js';
import { evaluateDualIntentCompliance } from '../../federal-work-permit-dual-intent-assessment-navigator.js';
import { evaluateExcessiveDemandMitigation } from '../../excessive-demand-mitigation-navigator.js';
import { evaluateExpressEntryCrs } from '../../express-entry-optimizer.js';
import { evaluateExpressEntryTieBreak } from '../../express-entry-tie-breaking-navigator.js';
import { evaluateFamilyReunification } from '../../family-reunification-navigator.js';
import { evaluateFederalBridgingOpenWorkPermit } from '../../federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';
import { evaluateFederalC10SignificantBenefit } from '../../federal-c10-significant-benefit-work-permit-navigator.js';
import { evaluateFederalC11EntrepreneurWorkPermit } from '../../federal-c11-entrepreneur-self-employed-work-permit-navigator.js';
import { evaluateFederalCaregiverPrPathway } from '../../federal-caregiver-pr-pathway-experience-navigator.js';
import { evaluateFederalFrancophoneMobilityC16 } from '../../federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalFtaProfessionalWorkPermit } from '../../federal-c12-gats-professional-fta-navigator.js';
import { evaluateFederalIntraCompanyTransferee } from '../../federal-c14-intra-company-transferee-navigator.js';
import { evaluateFederalReciprocalEmployment } from '../../federal-c20-reciprocal-employment-work-permit-navigator.js';
import { evaluateFederalSkilledTradesProgram } from '../../federal-skilled-trades-navigator.js';
import { evaluateFederalStudentOffCampusWork } from '../../federal-study-permit-off-campus-work-hours-navigator.js';
import { evaluateFederalSuperVisaInsuranceLico } from '../../federal-parent-grandparent-super-visa-medical-insurance-navigator.js';
import { evaluateFederalSuvPeerReview } from '../../federal-start-up-visa-peer-review-navigator.js';
import { evaluateFederalVisitorExtensionAndRestoration } from '../../federal-visitor-record-extension-status-restoration-navigator.js';
import { evaluateFlagpolingFeasibility } from '../../border-flagpoling-navigator.js';
import { evaluateForeignWorkerPermitTransition } from '../../foreign-worker-closed-permit-transition-navigator.js';
import { evaluateForeignWorkerTransition } from '../../foreign-worker-transition-navigator.js';
import { evaluateFrancophoneCommunityPilot } from '../../federal-francophone-community-pilot-navigator.js';
import { evaluateFrancophoneMobility } from '../../francophone-mobility-navigator.js';
import { evaluateLmiaReadiness } from '../../lmia-readiness-navigator.js';
import { evaluateManitobaPnpSkilledWorker } from '../../manitoba-pnp-skilled-worker-navigator.js';
import { evaluateMedicalAdmissibility } from '../../medical-admissibility.js';
import { evaluateNbpnpSkilledWorker } from '../../new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { evaluateNovaScotiaExperienceStream } from '../../nova-scotia-experience-stream-navigator.js';
import { evaluatePeiOccupationsInDemand } from '../../pei-provincial-nominee-occupations-in-demand-navigator.js';
import { evaluatePgwpEligibility } from '../../pgwp-eligibility-navigator.js';
import { evaluatePortOfEntryRights } from '../../poe-rights-navigator.js';
import { evaluatePrCardRenewalUrgent } from '../../pr-card-renewal-urgent-navigator.js';
import { evaluatePrMatrix } from '../../pr-matrix-simulator.js';
import { evaluatePrResidencyObligation } from '../../pr-residency-navigator.js';
import { evaluateProvincialNomineePathway } from '../../pnp-navigator.js';
import { evaluatePrtdHumanitarian } from '../../pr-travel-document-humanitarian-navigator.js';
import { evaluateQuebecCsqSkilledWorker } from '../../quebec-csq-skilled-worker-arrima-navigator.js';
import { evaluateQuebecPeqTemporaryWorker } from '../../quebec-peq-temporary-worker-navigator.js';
import { evaluateRefugeeCessationRisk } from '../../federal-refugee-cessation-citizenship-audit-navigator.js';
import { evaluateRuralRenewalEligibility } from '../../rural-renewal-navigator.js';
import { evaluateSelfEmployedProgram } from '../../federal-self-employed-persons-program-navigator.js';
import { evaluateSinpHardToFillSkills } from '../../saskatchewan-sinp-hard-to-fill-navigator.js';
import { evaluateSinpTechTalent } from '../../saskatchewan-immigrant-nominee-tech-talent-navigator.js';
import { evaluateSowpEligibility } from '../../sowp-eligibility-navigator.js';
import { evaluateStartUpVisaEligibility } from '../../federal-start-up-visa-designated-organization-navigator.js';
import { evaluateStudentWorkCompliance } from '../../student-compliance.js';
import { evaluateStudyPermitCapAndPal } from '../../study-permit-cap-pal-navigator.js';
import { evaluateStudyToPrPathway } from '../../study-to-pr-navigator.js';
import { evaluateSuperVisaAndFamilySponsorship } from '../../super-visa-sponsor.js';
import { evaluateSuperVisaAndPgp } from '../../super-visa-lico-navigator.js';
import { evaluateTfwEmployerCompliance } from '../../tfw-compliance-navigator.js';
import { evaluateTrpCompellingBalance } from '../../temporary-resident-permit-inadmissibility-navigator.js';
import { evaluateVisitorVisaTies } from '../../visitor-visa-financial-ties-navigator.js';
import { evaluateVulnerableWorkerProtection } from '../../vulnerable-worker-defense.js';
import { evaluateYukonCriticalImpactWorker } from '../../yukon-nominee-critical-impact-worker-navigator.js';
import { todayIso } from '../../text-input.js';

const pnpRequiredFields = [
  'targetProvince', 'nocCode', 'hourlyWage', 'hasFullTimeJobOffer', 'hasActiveExpressEntryProfile',
  'expressEntryCrsScore', 'yearsOfDirectExperience', 'hasOneYearCanadianExperience',
  'currentlyWorkingForBcEmployer', 'educationLevel', 'completedBcEducation',
  'clbLevel', 'isBilingualEnglishAndFrench', 'jobLocationArea', 'familySize', 'liquidSavingsCad'
];
const pnpOptionalBonuses = [
  'completedCanadianEducationOutsideBc', 'hasProfessionalDesignationBc', 'hasRegionalEducationOrExperience'
];
const pnpNumbers = {
  hourlyWage: [0, 250], expressEntryCrsScore: [0, 1200, true], yearsOfDirectExperience: [0, 30],
  clbLevel: [0, 10, true], familySize: [1, 10, true], liquidSavingsCad: [0, 1_000_000]
};
const pnpOptions = {
  targetProvince: /^(BC|ON|AB)$/i,
  nocCode: /^(?:[0-9]{5}|other)$/,
  educationLevel: /^(?:doctoral|masters|post_grad_cert|bachelors|diploma_2yr|secondary)$/,
  jobLocationArea: /^(?:area_1_metro_van|area_2_regional|area_3_rural)$/
};

function assessPnp(input) {
  const missing = pnpRequiredFields.filter(name => input[name] === undefined || input[name] === '');
  if (missing.length) throw new ToolInputError('Provide PNP profile fields: ' + missing.join(', ') + '.');
  for (const [name, [min, max, integer]] of Object.entries(pnpNumbers)) {
    const value = input[name];
    if (value < min || value > max || (integer && !Number.isInteger(value))) {
      throw new ToolInputError('Invalid ' + name + ': expected ' + (integer ? 'a whole number' : 'a number') + ' from ' + min + ' to ' + max + '.');
    }
  }
  for (const [name, pattern] of Object.entries(pnpOptions)) {
    const value = input[name];
    if (typeof value !== 'string' || !pattern.test(value.trim())) throw new ToolInputError('Invalid ' + name + ' for PNP assessment.');
    input[name] = value.trim();
  }
  const assumedInputs = pnpOptionalBonuses.filter(name => input[name] === undefined).sort();
  const result = evaluateProvincialNomineePathway(input);
  if (assumedInputs.length) Object.assign(result, {assumedInputs, assumptionNotice: ASSUMPTION_NOTICE});
  return result;
}

export function handleImmigrationGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

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

    if(path==='/v1/tools/pnp-pathway') {
      return send(200, assessPnp(applyFormAliases(path, Object.fromEntries(url.searchParams))));
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
      const studyLevel = url.searchParams.get('studyLevel') ?? undefined;
      const province = url.searchParams.get('province') ?? undefined;
      const tuitionFeeFirstYearCad = url.searchParams.get('tuition');
      const liquidFundsAvailableCad = url.searchParams.get('funds');
      const familyMembersAccompanying = url.searchParams.get('dependents') ?? undefined;
      const isInCanadaApplication = url.searchParams.get('inland') ?? undefined;
      const isExtensionOfStudyPermit = url.searchParams.get('extension') ?? undefined;
      const isFamilyOfWorkOrStudyHolder = url.searchParams.get('familyExempt') ?? undefined;
      const fieldOfStudyCategory = url.searchParams.get('field') ?? undefined;
      const cipCode = url.searchParams.get('cip') ?? undefined;
      const applicantName = url.searchParams.get('applicant') || 'Student Applicant';
      const assessmentDate = url.searchParams.get('assessmentDate') ?? undefined;
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
        assessmentDate,
        isPublicDli: url.searchParams.get('isPublicDli') || undefined,
        applicationDate: url.searchParams.get('applicationDate') || undefined
      }));
    }

    if(path==='/v1/tools/visitor-visa-financial-ties') {
      const applicantName = url.searchParams.get('applicant') || 'Visitor Applicant';
      const countryOfResidence = url.searchParams.get('country') || 'IN';
      const plannedStayDays = url.searchParams.get('days') || undefined;
      const liquidFundsCad = url.searchParams.get('funds') || undefined;
      const hasApprovedJobLeaveLetter = url.searchParams.get('leaveLetter') || undefined;
      const yearsAtCurrentJob = url.searchParams.get('tenure') || undefined;
      const monthlyIncomeCad = url.searchParams.get('income') || undefined;
      const ownsRealEstateProperty = url.searchParams.get('property') || undefined;
      const hasImmediateFamilyRemainingHome = url.searchParams.get('familyHome') || undefined;
      const allImmediateFamilyTravelingTogether = url.searchParams.get('familyTraveling') || undefined;
      const hasPriorCompliantTravelG7 = url.searchParams.get('g7Travel') || undefined;
      const hasPreviousVisaRefusal = url.searchParams.get('refusal') || undefined;
      const isDualIntentPrPending = url.searchParams.get('dualIntent') || undefined;
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

  return false;
}

export function handleImmigrationPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/citizenship-calculator') {
      return send(200, evaluateCitizenshipEligibility(input));
    }

    if(path==='/v1/tools/pr-residency') {
      return send(200, evaluatePrResidencyObligation(input));
    }

    if(path==='/v1/tools/medical-admissibility') {
      return send(200, evaluateMedicalAdmissibility(input));
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

    if(path==='/v1/tools/express-entry-crs') {
      return send(200, evaluateExpressEntryCrs(input));
    }

    if(path==='/v1/tools/pnp-pathway') {
      return send(200, assessPnp({...input}));
    }

    if(path==='/v1/tools/bowp-diagnostic') {
      return send(200, evaluateBowpPathway(input));
    }

    if(path==='/v1/tools/border-flagpoling') {
      return send(200, evaluateFlagpolingFeasibility(input));
    }

    if(path==='/v1/tools/pgwp-eligibility') {
      return send(200, evaluatePgwpEligibility(input));
    }

    if(path==='/v1/tools/tfw-compliance') {
      return send(200, evaluateTfwEmployerCompliance(input));
    }

    if(path==='/v1/tools/criminal-rehab') {
      return send(200, evaluateCriminalInadmissibilityAndRehab(input));
    }

    if(path==='/v1/tools/sowp-eligibility') {
      return send(200, evaluateSowpEligibility(input));
    }

    if(path==='/v1/tools/rural-renewal') {
      return send(200, evaluateRuralRenewalEligibility(input));
    }

    if(path==='/v1/tools/excessive-demand-mitigation') {
      return send(200, evaluateExcessiveDemandMitigation(input));
    }

    if(path==='/v1/tools/francophone-mobility') {
      return send(200, evaluateFrancophoneMobility(input));
    }

    if(path==='/v1/tools/atlantic-immigration') {
      return send(200, evaluateAtlanticImmigrationEligibility(input));
    }

    if(path==='/v1/tools/pr-card-renewal') {
      return send(200, evaluatePrCardRenewalUrgent(input));
    }

    if(path==='/v1/tools/foreign-worker-transition') {
      return send(200, evaluateForeignWorkerTransition(input));
    }

    if(path==='/v1/tools/alberta-opportunity-stream') {
      return send(200, evaluateAlbertaOpportunityStream(input));
    }

    if(path==='/v1/tools/prtd-humanitarian') {
      return send(200, evaluatePrtdHumanitarian(input));
    }

    if(path==='/v1/tools/manitoba-pnp-skilled-worker') {
      return send(200, evaluateManitobaPnpSkilledWorker(input));
    }

    if(path==='/v1/tools/sinp-hard-to-fill') {
      return send(200, evaluateSinpHardToFillSkills(input));
    }

    if(path==='/v1/tools/express-entry-tie-break') {
      return send(200, evaluateExpressEntryTieBreak(input));
    }

    if(path==='/v1/tools/nsnp-experience') {
      return send(200, evaluateNovaScotiaExperienceStream(input));
    }

    if(path==='/v1/tools/quebec-peq-worker') {
      return send(200, evaluateQuebecPeqTemporaryWorker(input));
    }

    if(path==='/v1/tools/trp-inadmissibility') {
      return send(200, evaluateTrpCompellingBalance(input));
    }

    if(path==='/v1/tools/federal-skilled-trades') {
      return send(200, evaluateFederalSkilledTradesProgram(input));
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

    if(path==='/v1/tools/start-up-visa') {
      return send(200, evaluateStartUpVisaEligibility(input));
    }

    if(path==='/v1/tools/nbpnp-skilled-worker') {
      return send(200, evaluateNbpnpSkilledWorker(input));
    }

    if(path==='/v1/tools/self-employed-persons') {
      return send(200, evaluateSelfEmployedProgram(input));
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

    if(path==='/v1/tools/alberta-rural-entrepreneur') {
      return send(200, evaluateAlbertaRuralEntrepreneur(input));
    }

    if(path==='/v1/tools/refugee-cessation') {
      return send(200, evaluateRefugeeCessationRisk(input));
    }

    if(path==='/v1/tools/francophone-community-pilot') {
      return send(200, evaluateFrancophoneCommunityPilot(input));
    }

    if(path==='/v1/tools/citizenship-residence-audit') {
      return send(200, auditCitizenshipPhysicalPresence(input));
    }

    if(path==='/v1/tools/quebec-csq-arrima') {
      return send(200, evaluateQuebecCsqSkilledWorker(input));
    }

    if(path==='/v1/tools/federal-ict-work-permit') {
      return send(200, evaluateFederalIntraCompanyTransferee(input));
    }

    if(path==='/v1/tools/visitor-extension-restoration') {
      return send(200, evaluateFederalVisitorExtensionAndRestoration(input));
    }

    if(path==='/v1/tools/bc-pnp-tech') {
      return send(200, evaluateBcTechPilotEligibility(input));
    }

    if(path==='/v1/tools/federal-c10-significant-benefit') {
      return send(200, evaluateFederalC10SignificantBenefit(input));
    }

    if(path==='/v1/tools/federal-c20-reciprocal-work') {
      return send(200, evaluateFederalReciprocalEmployment(input));
    }

    if(path==='/v1/tools/federal-dual-intent') {
      return send(200, evaluateDualIntentCompliance(input));
    }

    if(path==='/v1/tools/federal-c11-entrepreneur-work-permit') {
      return send(200, evaluateFederalC11EntrepreneurWorkPermit(input));
    }

    if(path==='/v1/tools/federal-francophone-mobility-c16') {
      return send(200, evaluateFederalFrancophoneMobilityC16(input));
    }

    if(path==='/v1/tools/federal-bowp-pr-acknowledgement') {
      return send(200, evaluateFederalBridgingOpenWorkPermit(input));
    }

    if(path==='/v1/tools/federal-fta-professional-work-permit') {
      return send(200, evaluateFederalFtaProfessionalWorkPermit(input));
    }

    if(path==='/v1/tools/federal-suv-peer-review') {
      return send(200, evaluateFederalSuvPeerReview(input));
    }

    if(path==='/v1/tools/federal-super-visa-insurance-lico') {
      return send(200, evaluateFederalSuperVisaInsuranceLico(input));
    }

    if(path==='/v1/tools/federal-caregiver-pr-pathway') {
      return send(200, evaluateFederalCaregiverPrPathway(input));
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

    if(path==='/v1/tools/pr-matrix') {
      return send(200, evaluatePrMatrix(input));
    }

    if(path==='/v1/tools/family-reunification') {
      return send(200, evaluateFamilyReunification(input));
    }

    if(path==='/v1/tools/study-to-pr') {
      return send(200, evaluateStudyToPrPathway(input));
    }

    if(path==='/v1/tools/gcms-analyzer') {
      return send(200, analyzeGcmsRefusalNotes(input));
    }

    if(path==='/v1/tools/super-visa-lico') {
      return send(200, evaluateSuperVisaAndPgp(input));
    }

    if(path==='/v1/tools/poe-rights') {
      return send(200, evaluatePortOfEntryRights(input));
    }

  return false;
}
