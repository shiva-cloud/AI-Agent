import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateCitizenshipRevocationDefense } from '../src/federal-citizenship-revocation-defense-navigator.js';
import { evaluateFrancophoneCommunityPilot } from '../src/federal-francophone-community-pilot-navigator.js';
import { evaluateFederalFrancophoneMobilityC16, FEDERAL_C16_CONSTANTS } from '../src/federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalSuperVisaInsuranceLico, FEDERAL_SUPER_VISA_CONSTANTS } from '../src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js';
import { evaluateRefugeeCessationRisk } from '../src/federal-refugee-cessation-citizenship-audit-navigator.js';
import { evaluateSelfEmployedProgram, SELF_EMPLOYED_PASS_MARK_POINTS } from '../src/federal-self-employed-persons-program-navigator.js';
import { evaluateFederalSkilledTradesProgram } from '../src/federal-skilled-trades-navigator.js';
import { evaluateStartUpVisaEligibility } from '../src/federal-start-up-visa-designated-organization-navigator.js';
import { evaluateFederalSuvPeerReview } from '../src/federal-start-up-visa-peer-review-navigator.js';
import { evaluateNbpnpSkilledWorker, NBPNP_PASS_MARK_POINTS } from '../src/new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { evaluateNovaScotiaExperienceStream } from '../src/nova-scotia-experience-stream-navigator.js';
import { evaluateEsaReprisal } from '../src/ontario-employment-standards-reprisal-navigator.js';
import { evaluateOntarioRoommateAndOccupantRights } from '../src/ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js';
import { evaluateOntarioUrgentRepairsT6 } from '../src/ontario-residential-tenancy-urgent-repairs-t6-navigator.js';
import { evaluatePeiOccupationsInDemand } from '../src/pei-provincial-nominee-occupations-in-demand-navigator.js';

test('Rec 456: evaluateCitizenshipRevocationDefense sanitizes inputs, bounds text/dates, and audits 30-day notice response window under Citizenship Act s. 10(4)', () => {
  const res = evaluateCitizenshipRevocationDefense({
    applicantName: 'Tariq\u0000 Mansour',
    assessmentDate: '2026-10-31',
    noticeOfIntentDate: '2026-10-10',
    currentDate: '2026-10-25',
    allegationType: 'FALSE_REPRESENTATION',
    allegationContext: 'RESIDENCE_CALCULATION',
    yearsAsCanadianCitizen: 8,
    yearsResidingInCanada: 12,
    hasSubstantialTiesToCanada: true,
    hasMinorChildrenAffected: true,
    minorChildrenAreCanadianCitizens: true,
    wouldBeRenderedStateless: false
  });

  assert.equal(res.applicantName, 'Tariq Mansour');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.procedure, 'CITIZENSHIP_REVOCATION_DEFENSE');
  assert.equal(res.proceduralAudit.isWithinStatutoryThirtyDayWindow, true);
  assert.equal(res.defensibilityStatus, 'STRONG_DEFENSE_CASE');

  // Expired window (> 30 days) triggers default warning
  const resExpired = evaluateCitizenshipRevocationDefense({
    noticeOfIntentDate: '2026-09-01',
    currentDate: '2026-10-25'
  });
  assert.equal(resExpired.proceduralAudit.isWithinStatutoryThirtyDayWindow, false);
  assert.ok(resExpired.riskWarnings.some(w => w.warning === 'DEFAULT_REVOCATION_ORDER_EXPOSURE'));
});

test('Rec 457: evaluateFrancophoneCommunityPilot sanitizes candidate name and date, bounds communities, and audits FCIP 2024–2029 criteria', () => {
  const res = evaluateFrancophoneCommunityPilot({
    candidateName: 'Amelie\u0000 Tremblay',
    assessmentDate: '2026-10-31',
    communityName: 'Sudbury',
    hasCommunityRecommendationLetter: true,
    targetNocTeer: 2,
    hasPermanentFullTimeJobOffer: true,
    jobOfferWithinCommunity: true,
    jobOfferMeetsMedianWage: true,
    frenchNclcSpeaking: 6,
    frenchNclcListening: 6,
    frenchNclcReading: 6,
    frenchNclcWriting: 6,
    monthsOfWorkExperiencePastThreeYears: 18,
    hasHighSchoolDiplomaOrEca: true,
    liquidSettlementFundsCad: 15000,
    familySize: 1,
    intendsToResideInCommunity: true
  });

  assert.equal(res.candidateName, 'Amelie Tremblay');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_FRANCOPHONE_COMMUNITY_PILOT_PR');
  assert.equal(res.communityDetails.province, 'ON');

  // Non-participating community is disqualified
  const resInvalidComm = evaluateFrancophoneCommunityPilot({
    communityName: 'Toronto',
    hasCommunityRecommendationLetter: false
  });
  assert.equal(resInvalidComm.isEligible, false);
  assert.ok(resInvalidComm.disqualifications.some(d => d.criterion === 'NON_PARTICIPATING_COMMUNITY'));
});

test('Rec 458: evaluateFederalFrancophoneMobilityC16 sanitizes candidate name and date, bounds oral NCLC, and audits 2023 TEER expansion outside Quebec under IRPR s. 205(a)', () => {
  const res = evaluateFederalFrancophoneMobilityC16({
    candidateName: 'Lucien\u0000 Beaulieu',
    assessmentDate: '2026-10-31',
    frenchOralNclcLevel: 6,
    destinationProvince: 'ON',
    teerCategory: 3,
    isPrimaryAgricultureNoc: false,
    hasValidJobOffer: true,
    hasApprovedFrenchTest: true,
    employerComplianceFeePaid: true
  });

  assert.equal(res.candidateName, 'Lucien Beaulieu');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.exemptionCode, FEDERAL_C16_CONSTANTS.EXEMPTION_CODE);
  assert.equal(res.destinationProvince, 'ON');

  // Destination Quebec is statutorily excluded
  const resQc = evaluateFederalFrancophoneMobilityC16({
    destinationProvince: 'QC'
  });
  assert.equal(resQc.isEligible, false);
  assert.ok(resQc.statutoryViolations.some(v => v.rule === 'INELIGIBLE_DESTINATION_QUEBEC'));
});

test('Rec 459: evaluateFederalSuperVisaInsuranceLico sanitizes applicant/sponsor names and date, bounds coverage, and audits $100k insurance & LICO benchmarks', () => {
  const res = evaluateFederalSuperVisaInsuranceLico({
    applicantName: 'Devi\u0000 Sharma',
    sponsorName: 'Raj\u0000 Sharma',
    assessmentDate: '2026-10-31',
    medicalInsuranceCoverageCad: 100000,
    insurancePolicyValidityDays: 365,
    insuranceFromApprovedProvider: true,
    proofOfInsurancePaymentProvided: true,
    completedUpfrontImeMedicalExam: true,
    sponsorAnnualIncomeCad: 70000,
    householdSizeIncludingApplicants: 4
  });

  assert.equal(res.applicantName, 'Devi Sharma');
  assert.equal(res.sponsorName, 'Raj Sharma');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.maxStayPerEntryYears, FEDERAL_SUPER_VISA_CONSTANTS.MAX_INITIAL_STAY_YEARS);

  // Substandard insurance coverage (< $100k)
  const resLowInsurance = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: 50000
  });
  assert.equal(resLowInsurance.isEligible, false);
  assert.ok(resLowInsurance.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_MEDICAL_INSURANCE_COVERAGE'));
});

test('Rec 460: evaluateRefugeeCessationRisk sanitizes applicant name and date, bounds trips/days, and audits Citizen Shield & three-prong re-availment under IRPA s. 108', () => {
  const resCitizen = evaluateRefugeeCessationRisk({
    applicantName: 'Fatima\u0000 Al-Hassan',
    assessmentDate: '2026-10-31',
    currentStatusInCanada: 'CANADIAN_CITIZEN',
    hasAcquiredCanadianCitizenship: true
  });

  assert.equal(resCitizen.applicantName, 'Fatima Al-Hassan');
  assert.equal(resCitizen.assessmentDate, '2026-10-31');
  assert.equal(resCitizen.isExemptFromIrpaCessation, true);
  assert.equal(resCitizen.legalStatusVerdict, 'CITIZEN_SHIELD_IMMUNE_FROM_IRPA_108');

  // PR who renewed passport and traveled for vacation faces critical cessation exposure
  const resPrAtRisk = evaluateRefugeeCessationRisk({
    applicantName: 'Refugee\u0000 PR',
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAppliedForOrRenewedNationalPassport: true,
    traveledBackToCountryOfPersecution: true,
    numberOfTripsToCountryOfPersecution: 2,
    cumulativeDaysInCountryOfPersecution: 45,
    purposeOfTravel: 'VACATION'
  });
  assert.equal(resPrAtRisk.isExemptFromIrpaCessation, false);
  assert.equal(resPrAtRisk.cessationRiskLevel, 'CRITICAL');
});

test('Rec 461: evaluateSelfEmployedProgram sanitizes applicant name and date, bounds points, and audits IRPR ss. 88, 100 35-point pass mark & intake pause', () => {
  const res = evaluateSelfEmployedProgram({
    applicantName: 'Yuki\u0000 Tanaka',
    assessmentDate: '2026-10-31',
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 4,
    educationLevel: 'BACHELORS',
    applicantAge: 32,
    firstOfficialLanguageClb: 8,
    intendsAndAbleToBeSelfEmployed: true,
    willMakeSignificantContributionToCanada: true
  });

  assert.equal(res.applicantName, 'Yuki Tanaka');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.pointsSummary.isPassMarkSatisfied, true);
  assert.ok(res.pointsSummary.totalPoints >= SELF_EMPLOYED_PASS_MARK_POINTS);
  assert.ok(res.riskWarnings.some(w => w.warning === 'MINISTERIAL_INSTRUCTIONS_INTAKE_PAUSE'));

  // Ineligible with under 2 years experience
  const resNoExp = evaluateSelfEmployedProgram({
    yearsOfSelfEmployedExperience: 1,
    yearsOfWorldClassParticipation: 0
  });
  assert.equal(resNoExp.isEligible, false);
  assert.ok(resNoExp.disqualifications.some(d => d.criterion === 'RELEVANT_EXPERIENCE_SHORTFALL'));
});

test('Rec 462: evaluateFederalSkilledTradesProgram sanitizes candidate name and date, bounds hours, and audits Red Seal cert / job offer under IRPR s. 87.2', () => {
  const res = evaluateFederalSkilledTradesProgram({
    candidateName: 'Marco\u0000 Rossi',
    assessmentDate: '2026-10-31',
    nocCode: '72410',
    yearsOfTradesExperience: 3,
    hoursOfTradesExperience: 4500,
    hasCanadianCertificateOfQualification: true,
    certifyingProvince: 'ON',
    hasActiveExpressEntryProfile: true,
    clbSpeaking: 5,
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4
  });

  assert.equal(res.candidateName, 'Marco Rossi');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityStatus, 'ELIGIBLE_FOR_FSTP');
  assert.equal(res.hasTradePrerequisite, true);

  // Ineligible without certificate of qualification or job offer
  const resNoPrereq = evaluateFederalSkilledTradesProgram({
    hasCanadianCertificateOfQualification: false,
    hasQualifyingCanadianJobOffer: false
  });
  assert.equal(resNoPrereq.isEligible, false);
  assert.ok(resNoPrereq.deficiencies.length > 0);
});

test('Rec 463: evaluateStartUpVisaEligibility sanitizes candidate name and date, bounds equity/capital, and audits IRPR ss. 98.01–98.13 SUV requirements', () => {
  const res = evaluateStartUpVisaEligibility({
    candidateName: 'Vikram\u0000 Singhania',
    assessmentDate: '2026-10-31',
    entityType: 'VENTURE_CAPITAL_FUND',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 250000,
    numberOfCoOwnersApplying: 2,
    applicantVotingRightsPercentage: 25,
    jointVotingRightsPercentage: 65,
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 6,
    clbWriting: 6,
    availableSettlementFundsCad: 30000,
    familySize: 1
  });

  assert.equal(res.candidateName, 'Vikram Singhania');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE');
  assert.equal(res.stream, 'FEDERAL_START_UP_VISA');

  // Ineligible with capital shortfall
  const resLowCap = evaluateStartUpVisaEligibility({
    entityType: 'VENTURE_CAPITAL_FUND',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 100000
  });
  assert.equal(resLowCap.isEligible, false);
  assert.ok(resLowCap.disqualifications.some(d => d.criterion === 'CAPITAL_SHORTFALL'));
});

test('Rec 464: evaluateFederalSuvPeerReview sanitizes founder name and date, bounds cap table voting rights, and audits IRPR s. 98.10 peer review triggers', () => {
  const res = evaluateFederalSuvPeerReview({
    founderName: 'Amina\u0000 Diallo',
    assessmentDate: '2026-10-31',
    designatedEntityType: 'BUSINESS_INCUBATOR',
    hasOfficialLetterOfSupport: true,
    applicantVotingRightsPercentage: 25,
    totalFoundersAndEntityVotingPercentage: 65,
    totalFoundersCount: 3,
    hasActiveOngoingManagementRole: true,
    businessIncorporatedInCanada: true,
    peerReviewRequestedByOfficer: false
  });

  assert.equal(res.founderName, 'Amina Diallo');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA');

  // Ineligible if applicant equity is under statutory 10% threshold
  const resLowEquity = evaluateFederalSuvPeerReview({
    applicantVotingRightsPercentage: 5
  });
  assert.equal(resLowEquity.isEligible, false);
  assert.ok(resLowEquity.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_FOUNDER_EQUITY_UNDER_10_PERCENT'));
});

test('Rec 465: evaluateNbpnpSkilledWorker sanitizes candidate name and date, bounds points breakdown, and audits NBPNP 60-point pass mark & 2-year employer tenure', () => {
  const res = evaluateNbpnpSkilledWorker({
    candidateName: 'Gabriel\u0000 Martin',
    assessmentDate: '2026-10-31',
    applicantAge: 30,
    targetNocTeer: 2,
    firstLanguageClb: 7,
    educationLevel: 'BACHELORS',
    yearsOfRelatedExperience: 3,
    hasPermanentFullTimeJobOfferInNb: true,
    employerOperatedTwoYearsInNb: true,
    jobOfferWageMeetsMedian: true,
    liquidFundsCad: 20000,
    familySize: 1,
    intendsToResideInNb: true
  });

  assert.equal(res.candidateName, 'Gabriel Martin');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_NBPNP_SKILLED_WORKER_NOMINATION');
  assert.ok(res.pointsSummary.totalPoints >= NBPNP_PASS_MARK_POINTS);

  // Ineligible with age > 55
  const resOldAge = evaluateNbpnpSkilledWorker({
    applicantAge: 60
  });
  assert.equal(resOldAge.isEligible, false);
  assert.ok(resOldAge.disqualifications.some(d => d.criterion === 'AGE_INELIGIBILITY'));
});

test('Rec 466: evaluateNovaScotiaExperienceStream sanitizes candidate name and date, bounds hours, and audits NSNP Express Entry & Physician Stream criteria', () => {
  const res = evaluateNovaScotiaExperienceStream({
    candidateName: 'Clara\u0000 Bennett',
    assessmentDate: '2026-10-31',
    stream: 'nova_scotia_experience_express_entry',
    candidateAge: 29,
    nocCode: '21231',
    teerLevel: 1,
    monthsWorkedInNovaScotia: 14,
    hoursWorkedInNovaScotia: 1800,
    languageClbScore: 8,
    hasActiveExpressEntryProfile: true,
    hasValidWorkPermitDuringExperience: true,
    hasSecondarySchoolOrEca: true,
    hasIntentToResideInNovaScotia: true
  });

  assert.equal(res.candidateName, 'Clara Bennett');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityStatus, 'ELIGIBLE_FOR_NSNP_EXPERIENCE_EXPRESS_ENTRY');
  assert.equal(res.jurisdiction, 'NS');

  // Inadequate work hours (< 1560 hours)
  const resLowHours = evaluateNovaScotiaExperienceStream({
    hoursWorkedInNovaScotia: 1000
  });
  assert.equal(resLowHours.isEligible, false);
  assert.ok(resLowHours.deficiencies.length > 0);
});

test('Rec 467: evaluateEsaReprisal sanitizes employee name and date, bounds temporal proximity days, and audits reverse onus under ESA s. 74(2)', () => {
  const res = evaluateEsaReprisal({
    employeeName: 'Dmitri\u0000 Ivanov',
    assessmentDate: '2026-10-31',
    protectedActivity: 'requested_overtime_pay',
    adverseAction: 'termination',
    daysBetweenActivityAndAction: 5,
    employerProvidedWrittenReason: false,
    allegedEmployerReason: 'none',
    hasDocumentaryEvidence: true,
    monthlyLostWageCad: 4500,
    monthsElapsedSinceAction: 2
  });

  assert.equal(res.employeeName, 'Dmitri Ivanov');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isReverseBurdenTriggered, true);
  assert.equal(res.isWithinLimitationPeriod, true);
  assert.equal(res.reprisalRiskScore, 'CRITICAL_HIGH_MERIT');

  // Limitation period expired (> 24 months)
  const resExpired = evaluateEsaReprisal({
    monthsElapsedSinceAction: 26
  });
  assert.equal(resExpired.isWithinLimitationPeriod, false);
  assert.equal(resExpired.reprisalRiskScore, 'BARRED_BY_LIMITATION');
});

test('Rec 468: evaluateOntarioRoommateAndOccupantRights sanitizes tenant/occupant names and date, bounds limitation days, and audits RTA s. 5(i) & s. 100 deeming', () => {
  const resSharedFacility = evaluateOntarioRoommateAndOccupantRights({
    tenantName: 'Liam\u0000 Murphy',
    occupantName: 'Sean\u0000 Murphy',
    assessmentDate: '2026-10-31',
    sharesKitchenOrBathWithOwnerOrFamily: true
  });

  assert.equal(resSharedFacility.tenantName, 'Liam Murphy');
  assert.equal(resSharedFacility.occupantName, 'Sean Murphy');
  assert.equal(resSharedFacility.assessmentDate, '2026-10-31');
  assert.equal(resSharedFacility.isRtaCovered, false);
  assert.equal(resSharedFacility.legalStatusVerdict, 'EXEMPT_FROM_RTA_UNDER_SECTION_5_I');

  // Section 100 deeming when landlord knew > 60 days
  const resDeemed = evaluateOntarioRoommateAndOccupantRights({
    tenantHasVacatedPermanently: true,
    isNamedOnTenancyAgreement: false,
    daysSinceLandlordDiscoveredOccupancy: 75
  });
  assert.equal(resDeemed.isRtaCovered, true);
  assert.equal(resDeemed.legalVerdict, 'DEEMED_STATUTORY_TENANT_UNDER_SECTION_100');
  assert.equal(resDeemed.proceduralTimelines.isSixtyDayWindowExpired, true);
});

test('Rec 469: evaluateOntarioUrgentRepairsT6 sanitizes tenant/landlord names and date, bounds temperature, and audits O. Reg. 516/06 20°C heat rule & RTA s. 21 vital services', () => {
  const res = evaluateOntarioUrgentRepairsT6({
    tenantName: 'Chloe\u0000 Dubois',
    landlordName: 'Apex Properties\nCorp',
    assessmentDate: '2026-10-31',
    vitalServiceInterrupted: true,
    indoorTemperatureCelsius: 16,
    calendarMonth: 1,
    landlordNotifiedInWriting: true,
    daysSinceWrittenNotice: 10,
    monthlyRentCad: 2200,
    monthsOfDisrepair: 1,
    estimatedAbatementPercentage: 30
  });

  assert.equal(res.tenantName, 'Chloe Dubois');
  assert.equal(res.landlordName, 'Apex Properties Corp');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.jurisdiction, 'ONTARIO_CANADA');
  assert.equal(res.vitalServiceInterrupted, true);
  assert.equal(res.complianceStatus, 'URGENT_STATUTORY_MAINTENANCE_BREACH');
  assert.ok(res.statutoryViolations.some(v => v.rule === 'ILLEGAL_VITAL_SERVICE_INTERRUPTION'));
  assert.ok(res.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_INDOOR_HEATING_TEMPERATURE'));
});

test('Rec 470: evaluatePeiOccupationsInDemand sanitizes candidate name and date, bounds NOC/funds, and audits PEI PNP in-demand target occupations & 2-year employer tenure', () => {
  const res = evaluatePeiOccupationsInDemand({
    candidateName: 'Kavita\u0000 Nair',
    assessmentDate: '2026-10-31',
    nocCode: '33102', // Nurse aides, orderlies
    jobOfferFullTime: true,
    jobOfferPermanentOrTwoYears: true,
    employerOperatedTwoYearsInPei: true,
    hasValidWorkPermitOrAuthorization: true,
    monthsOfDirectExperienceInLastFiveYears: 18,
    applicantAge: 28,
    clbScore: 5,
    hasHighSchoolDiplomaOrEca: true,
    liquidFundsCad: 12000,
    familySize: 1,
    intendsToResideInPei: true
  });

  assert.equal(res.candidateName, 'Kavita Nair');
  assert.equal(res.assessmentDate, '2026-10-31');
  assert.equal(res.isEligible, true);
  assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION');
  assert.equal(res.targetNoc.sector, 'Healthcare');

  // Ineligible with employer operating under 2 years
  const resNewEmployer = evaluatePeiOccupationsInDemand({
    nocCode: '33102',
    employerOperatedTwoYearsInPei: false
  });
  assert.equal(resNewEmployer.isEligible, false);
  assert.ok(resNewEmployer.disqualifications.some(d => d.criterion === 'EMPLOYER_TENURE_DEFICIENCY'));
});
