import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAlbertaRuralEntrepreneur, AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD, AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD } from '../src/alberta-alep-rural-entrepreneur-stream-navigator.js';
import { evaluateAustraliaReforms, evaluateGermanyChancenkarteAndTenancy } from '../src/australia-germany-global-navigator.js';
import { evaluateBusinessStructure, CRA_BUSINESS_STATUTORY_CONSTANTS } from '../src/business-navigator.js';
import { evaluateRestorationOfStatus, auditFlagpolingEligibility, auditDliAuthorizedLeave, evaluateCriminalInadmissibility } from '../src/canada-status-admissibility-guard.js';
import { evaluateChildcareSupport, calculateOntarioSubsidyContribution } from '../src/childcare-navigator.js';
import { compareCities } from '../src/city-comparison.js';
import { assessCredentialLicensure } from '../src/credential-licensure-bridge.js';
import {
  calculateOntarioOvertimePay,
  calculateVacationPayStepUp,
  calculatePublicHolidayPay,
  evaluateEsaStatutorySeverance,
  auditContractorMisclassification,
  auditEqualPayForEqualWork,
  ESA_CONSTANTS
} from '../src/esa-wage-theft-navigator.js';
import { evaluateEuHealthRights, EU_HEALTH_CONSTANTS } from '../src/eu-health-rights-navigator.js';
import { evaluateLeaseAssignmentExit, calculateDaysBetween, addDaysToDate } from '../src/lease-assignment-navigator.js';
import { assessMovingExpenses, MOVING_TAX_CONSTANTS } from '../src/moving-tax-navigator.js';
import { calculateNewcomerBenefits } from '../src/newcomer-benefits-calculator.js';
import { calculateNewcomerBudget } from '../src/newcomer-budget.js';
import { evaluateOntarioRemoteWorkJurisdiction } from '../src/ontario-employment-remote-telework-jurisdiction-navigator.js';
import { evaluateOntarioEmploymentReprisal, ONTARIO_REPRISAL_CONSTANTS } from '../src/ontario-employment-reprisal-complaint-navigator.js';

test('Batch 20 Recommendations (Sweep 27: Recs 366–380)', async (t) => {
  await t.test('Rec 366: evaluateAlbertaRuralEntrepreneur validates endorsement, net worth, investment, and bounded inputs', () => {
    const res = evaluateAlbertaRuralEntrepreneur({
      candidateName: '  Amara Vance\u0000  ',
      communityName: 'Brooks\u0007',
      isDesignatedRuralCommunity: true,
      hasCommunityEndorsementLetter: true,
      hasCompletedExploratoryVisit: true,
      netWorthCad: 400000,
      plannedInvestmentCad: 150000,
      plannedOwnershipPercentage: 60,
      fullTimeJobsCreatedForCanadians: 2,
      yearsOfBusinessOwnershipOrSeniorManagement: 4,
      clbScore: 6,
      assessmentDate: '2026-10-31'
    });

    assert.equal(res.candidateName, 'Amara Vance');
    assert.equal(res.communityName, 'Brooks');
    assert.equal(res.isEligible, true);
    assert.equal(res.eligibilityVerdict, 'ELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR_STREAM');
    assert.equal(res.financialAudit.netWorthCad, 400000);
    assert.equal(res.financialAudit.minimumNetWorthRequiredCad, AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD);
    assert.equal(res.financialAudit.plannedInvestmentCad, 150000);
    assert.equal(res.financialAudit.minimumInvestmentRequiredCad, AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD);
    assert.equal(res.assessmentDate, '2026-10-31');

    // Ineligible case: insufficient investment and no exploratory visit
    const inelig = evaluateAlbertaRuralEntrepreneur({
      communityName: 'Brooks',
      hasCompletedExploratoryVisit: false,
      plannedInvestmentCad: 50000
    });
    assert.equal(inelig.isEligible, false);
    assert.ok(inelig.disqualifications.some(d => d.criterion === 'MISSING_EXPLORATORY_VISIT'));
    assert.ok(inelig.disqualifications.some(d => d.criterion === 'INVESTMENT_DEFICIENCY'));
  });

  await t.test('Rec 367: evaluateAustraliaReforms and evaluateGermanyChancenkarteAndTenancy audit reforms with bounded names', () => {
    const au = evaluateAustraliaReforms({
      applicantName: '  Liam Chen\u001f ',
      visaSubclass: '482_tss',
      daysSinceCeasedEmployment: 45,
      annualTaxableIncomeAud: 110000,
      hasMedicareEntitlementStatement: true,
      assessmentDate: '2026-10-31'
    });
    assert.equal(au.applicantName, 'Liam Chen');
    assert.equal(au.condition8607Audit.isCompliant, true);
    assert.equal(au.condition8607Audit.consecutiveDaysRemaining, 135);
    assert.equal(au.medicareLevyExemption.annualPotentialTaxSavingsAud, 2200);
    assert.equal(au.assessmentDate, '2026-10-31');

    const de = evaluateGermanyChancenkarteAndTenancy({
      applicantName: 'Elena Rostova',
      chancenkartePoints: 7,
      germanLanguageLevel: 'B1',
      nebenkostenInvoiceMonthsAfterPeriod: 15,
      nebenkostenArrearsDemandedEur: 950,
      assessmentDate: '2026-10-31'
    });
    assert.equal(de.applicantName, 'Elena Rostova');
    assert.equal(de.chancenkarteAudit.isPointsEligible, true);
    assert.equal(de.nebenkostenTenancyAudit.isBilledWithinDeadline, false);
    assert.equal(de.nebenkostenTenancyAudit.isTenantObligatedToPay, false);
    assert.ok(de.nebenkostenTenancyAudit.legalRule.includes('Ausschlussfrist'));
    assert.equal(de.assessmentDate, '2026-10-31');
  });

  await t.test('Rec 368: evaluateBusinessStructure audits closed vs open work permit, GST/HST, and eliminates 100% wording', () => {
    // Open work permit holder with incorporation recommendation
    const biz = evaluateBusinessStructure({
      applicantName: 'Priya Sharma',
      businessName: 'Apex Data Consulting Inc.',
      province: 'ON',
      immigrationStatus: 'work_permit_holder',
      workPermitType: 'open_work_permit',
      projectedAnnualRevenueCad: 130000,
      annualBusinessExpensesCad: 15000,
      personalLivingExpensesCad: 60000,
      clientCount: 3,
      subcontractorHiringPermitted: true,
      providesOwnEquipmentAndTools: true,
      hasRiskOfFinancialLoss: true,
      assessmentDate: '2026-10-31'
    });

    assert.equal(biz.applicantName, 'Priya Sharma');
    assert.equal(biz.businessName, 'Apex Data Consulting Inc.');
    assert.equal(biz.immigrationCompliance.isLegallyAuthorizedToOperate, true);
    assert.equal(biz.gstHstAudit.isRegistrationMandatory, true);
    assert.equal(biz.psbRiskAudit.psbRiskLevel, 'LOW');
    assert.equal(biz.recommendedStructure, 'INCORPORATION_RECOMMENDED');
    assert.equal(biz.corporateDirectorResidency.requiresCanadianResidentDirector, false);

    // Verify wording guard: no "100%" in statutory advisories or action checklist
    const advisoriesText = biz.statutoryAdvisories.join(' ');
    const actionsText = biz.actionChecklist.map(a => a.action).join(' ');
    assert.equal(advisoriesText.includes('100%'), false);
    assert.equal(actionsText.includes('100%'), false);
    assert.ok(actionsText.includes('Director residency mandates have been abolished'));

    // Test voluntary registration under $30k
    const smallBiz = evaluateBusinessStructure({
      projectedAnnualRevenueCad: 20000
    });
    const smallAdvisoriesText = smallBiz.statutoryAdvisories.join(' ');
    assert.equal(smallAdvisoriesText.includes('100%'), false);
    assert.ok(smallAdvisoriesText.includes('claiming full Input Tax Credits'));

    // Closed work permit holder is statutorily prohibited
    const closedBiz = evaluateBusinessStructure({
      immigrationStatus: 'work_permit_holder',
      workPermitType: 'closed_employer_specific'
    });
    assert.equal(closedBiz.immigrationCompliance.isLegallyAuthorizedToOperate, false);
    assert.equal(closedBiz.immigrationCompliance.severity, 'STATUTORILY_PROHIBITED');
  });

  await t.test('Rec 369: evaluateRestorationOfStatus, CBSA flagpoling, DLI leave, and criminal rehab audit admissibility', () => {
    // 1. Restoration of status within 90 days
    const rest = evaluateRestorationOfStatus({
      applicantName: 'Mateo Morales',
      statusExpiredDate: '2026-03-01',
      assessmentDate: '2026-04-15',
      visaType: 'worker',
      remainedInCanada: true
    });
    assert.equal(rest.applicantName, 'Mateo Morales');
    assert.equal(rest.isEligibleToApply, true);
    assert.equal(rest.statutoryWorkStudyProhibition.canWorkWhilePending, false);

    // 2. CBSA Flagpoling PGWP ban
    const flag = auditFlagpolingEligibility({
      applicantName: 'Tariq Al-Mansoor',
      requestedPermitType: 'pgwp',
      borderPort: 'peace_bridge',
      dayOfWeek: 'wednesday',
      timeOfArrivalHour: 10
    });
    assert.equal(flag.applicantName, 'Tariq Al-Mansoor');
    assert.equal(flag.isFlagpolingPermitted, false);
    assert.ok(flag.defects[0].includes('PGWP BORDER BAN'));

    // 3. DLI Authorized Leave within 150 days
    const dli = auditDliAuthorizedLeave({
      studentName: 'Ji-hoon Park',
      leaveDurationDays: 120,
      hasOfficialSchoolLeaveApproval: true,
      workedDuringLeave: false
    });
    assert.equal(dli.studentName, 'Ji-hoon Park');
    assert.equal(dli.isCompliant, true);

    // 4. Criminal inadmissibility: serious criminality never deemed rehabilitated
    const crim = evaluateCriminalInadmissibility({
      applicantName: 'John Doe',
      offenseClassification: 'serious_criminality',
      yearsSinceSentenceCompleted: 15
    });
    assert.equal(crim.applicantName, 'John Doe');
    assert.equal(crim.deemedRehabilitationEligible, false);
    assert.equal(crim.individualRehabilitationEligible, true);
  });

  await t.test('Rec 370: evaluateChildcareSupport calculates CWELCC caps and municipal subsidy eligibility', () => {
    const cc = evaluateChildcareSupport({
      applicantName: 'Fatima Zahra',
      city: 'Toronto',
      annualFamilyIncomeCad: 35000,
      immigrationStatus: 'work_permit',
      children: [{ ageGroup: 'infant' }, { ageGroup: 'toddler' }],
      assessmentDate: '2026-10-31'
    });

    assert.equal(cc.applicantName, 'Fatima Zahra');
    assert.equal(cc.city, 'Toronto');
    assert.equal(cc.childrenCount, 2);
    assert.equal(cc.subsidyAssessment.isStatutorilyEligible, true);
    assert.equal(cc.subsidyAssessment.status, 'partial_subsidy');
    assert.ok(cc.monthlyCostSummary.totalMonthlySavingsCad > 0);

    // Low income full subsidy
    const fullSub = calculateOntarioSubsidyContribution(18000);
    assert.equal(fullSub, 0);
  });

  await t.test('Rec 371: compareCities provides side-by-side analysis with bounded inputs and safe dates', () => {
    const comp = compareCities(['Toronto', 'Calgary'], {
      annualSalary: 90000,
      householdSize: 2,
      assessmentDate: '2026-10-31'
    });

    assert.equal(comp.asOf, '2026-10-31');
    assert.equal(comp.assessmentDate, '2026-10-31');
    assert.equal(comp.comparison.length, 2);
    assert.ok(comp.differential !== null);
    assert.equal(comp.differential.cheaperCity, 'Calgary');
    assert.equal(comp.differential.salesTaxAdvantage, 'Calgary');
  });

  await t.test('Rec 372: assessCredentialLicensure audits FARPACTA Canadian experience ban and alternative careers', () => {
    const cred = assessCredentialLicensure({
      candidateName: 'Dr. Kwame Mensah',
      profession: 'civil_engineer',
      province: 'ON',
      yearsOfForeignExperience: 8,
      hasEca: true,
      ecaOrganization: 'WES',
      officialLanguageClb: 9,
      assessmentDate: '2026-10-31'
    });

    assert.equal(cred.candidateName, 'Dr. Kwame Mensah');
    assert.equal(cred.isRegulatedProfession, true);
    assert.equal(cred.canadianExperienceBanApplies, true);
    assert.ok(cred.canadianExperienceProtectionDetails.includes('FARPACTA'));
    assert.equal(cred.isLanguageReady, true);
    assert.ok(cred.alternativeUnlicensedCareers.length >= 2);
    assert.equal(cred.assessmentDate, '2026-10-31');
  });

  await t.test('Rec 373: calculateOntarioOvertimePay, vacation step-up, holiday pay, and severance audit ESA standards', () => {
    // 1. Overtime pay
    const ot = calculateOntarioOvertimePay({
      employeeName: 'Carlos Rivera',
      hourlyRateCad: 30,
      weeklyHoursWorked: 50,
      assessmentDate: '2026-10-31'
    });
    assert.equal(ot.employeeName, 'Carlos Rivera');
    assert.equal(ot.regularHours, 44);
    assert.equal(ot.overtimeHours, 6);
    assert.equal(ot.totalWeeklyPayCad, 44 * 30 + 6 * 45); // 1320 + 270 = 1590

    // 2. Vacation pay step-up (6% for 5+ years)
    const vac = calculateVacationPayStepUp({
      employeeName: 'Carlos Rivera',
      grossEarningsCad: 80000,
      yearsOfService: 6
    });
    assert.equal(vac.employeeName, 'Carlos Rivera');
    assert.equal(vac.applicableRatePercent, '6%');
    assert.equal(vac.statutoryVacationPayCad, 4800);
    assert.equal(vac.stepUpDeltaCad, 1600); // 80,000 * 2%

    // 3. Public holiday pay
    const hol = calculatePublicHolidayPay({
      employeeName: 'Carlos Rivera',
      wagesEarnedInPrior4WeeksCad: 4000,
      vacationPayPayableInPrior4WeeksCad: 160
    });
    assert.equal(hol.employeeName, 'Carlos Rivera');
    assert.equal(hol.statutoryHolidayPayCad, 208); // 4160 / 20 = 208

    // 4. Statutory severance pay under ESA s. 64
    const sev = evaluateEsaStatutorySeverance({
      employeeName: 'Carlos Rivera',
      employerName: 'Global Tech Logistics Inc.',
      yearsOfContinuousService: 7,
      regularWeeklyWagesCad: 1500,
      employerOntarioPayrollCad: 4000000
    });
    assert.equal(sev.employeeName, 'Carlos Rivera');
    assert.equal(sev.employerName, 'Global Tech Logistics Inc.');
    assert.equal(sev.qualifiesForSeverance, true);
    assert.equal(sev.statutorySeverancePayCad, 10500); // 7 * 1500 = 10500

    // 5. Misclassification audit
    const misc = auditContractorMisclassification({
      workerName: 'Carlos Rivera',
      hasControlOverSchedule: false,
      ownsToolsAndEquipment: false,
      hasSubcontractingRights: false
    });
    assert.equal(misc.workerName, 'Carlos Rivera');
    assert.equal(misc.isMisclassified, true);

    // 6. Equal pay for equal work
    const eq = auditEqualPayForEqualWork({
      workerName: 'Carlos Rivera',
      temporaryAgencyHourlyRateCad: 18.00,
      permanentEmployeeHourlyRateCad: 25.00
    });
    assert.equal(eq.workerName, 'Carlos Rivera');
    assert.equal(eq.isEqualPayViolation, true);
    assert.equal(eq.hourlyDisparityCad, 7.00);
  });

  await t.test('Rec 374: evaluateEuHealthRights verifies S1, EHIC, and UK GHIC with bounded countries', () => {
    // S1 for posted worker relocation
    const s1 = evaluateEuHealthRights({
      applicantName: 'Oliver Smith',
      userCategory: 'posted_worker',
      originCountry: 'UK',
      hostCountry: 'France',
      assessmentDate: '2026-10-31'
    });
    assert.equal(s1.applicantName, 'Oliver Smith');
    assert.equal(s1.applicableDocument, 'S1');
    assert.ok(s1.documentName.includes('Portable Document S1'));
    assert.equal(s1.originCountry, 'UK');
    assert.equal(s1.hostCountry, 'FRANCE');
    assert.equal(s1.isUkInvolved, true);

    // EHIC for EU citizen tourist in Spain
    const ehic = evaluateEuHealthRights({
      applicantName: 'Jean Dupont',
      userCategory: 'tourist_student',
      originCountry: 'France',
      hostCountry: 'Spain'
    });
    assert.equal(ehic.applicableDocument, 'EHIC');
    assert.equal(ehic.isUkInvolved, false);
  });

  await t.test('Rec 375: evaluateLeaseAssignmentExit audits 7-day rule, Form N9 notice, and builds formal notice', () => {
    const exit = evaluateLeaseAssignmentExit({
      tenantName: 'Sophie Lefebvre',
      landlordName: 'Metropolitan Properties Ltd.',
      rentalAddress: '120 Bay Street, Suite 804, Toronto, ON',
      province: 'ON',
      leaseType: 'fixed_term',
      requestType: 'assignment',
      requestStage: 'refused_in_principle',
      monthlyRentCad: 2600,
      landlordDemandedPenaltyCad: 3000,
      landlordDemandedAssignmentFeeCad: 500,
      assessmentDate: '2026-10-31'
    }, new Date('2026-10-31T00:00:00Z'));

    assert.equal(exit.tenantName, 'Sophie Lefebvre');
    assert.equal(exit.landlordName, 'Metropolitan Properties Ltd.');
    assert.equal(exit.rentalAddress, '120 Bay Street, Suite 804, Toronto, ON');
    assert.equal(exit.isEarlyExitPermittedWithoutPenalty, true);
    assert.equal(exit.resolutionVerdict, 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9');
    assert.equal(exit.isIllegalPenaltyDemanded, true);
    assert.equal(exit.isExcessiveAssignmentFee, true);
    assert.ok(exit.noticeTemplates.assignmentRequestLetter.includes('Sophie Lefebvre'));
    assert.ok(exit.noticeTemplates.assignmentRequestLetter.includes('Metropolitan Properties Ltd.'));
    assert.ok(exit.noticeTemplates.formN9TerminationNotice.includes('Form N9'));

    // Date math helpers
    assert.equal(calculateDaysBetween('2026-10-01', '2026-10-08'), 7);
    assert.equal(addDaysToDate('2026-10-01', 30), '2026-10-31');
  });

  await t.test('Rec 376: assessMovingExpenses audits 40-km test, 15-day temporary living cap, and Form T1-M mapping', () => {
    const move = assessMovingExpenses({
      applicantName: 'Dmitri Ivanov',
      province: 'ON',
      relocationPurpose: 'employment',
      oldCountry: 'United States',
      oldCity: 'New York',
      newCity: 'Toronto',
      distanceKm: 750,
      householdSize: 2,
      canadianIncomeEarnedInYearCad: 85000,
      travelExpensesCad: 1200,
      moversAndShippingCad: 4500,
      temporaryLivingDays: 20, // 5 days over 15-day cap
      temporaryLivingDailyCostCad: 200,
      leaseCancellationPenaltyCad: 2000,
      utilityAndAddressChangeFeesCad: 150,
      otherIncidentalCostsCad: 300,
      employerReimbursementCad: 2000,
      assessmentDate: '2026-10-31'
    });

    assert.equal(move.applicantName, 'Dmitri Ivanov');
    assert.equal(move.isEligible, true);
    assert.equal(move.meetsDistanceRule, true);
    assert.equal(move.eligibilityVerdict, 'ELIGIBLE_FOR_T1M_DEDUCTION');
    assert.equal(move.disallowedTemporaryLivingCad, 1000); // 5 excess days * $200 = $1,000
    assert.ok(move.auditWarnings.some(w => w.rule.includes('15-Day Temporary Living Cap Exceeded')));
    assert.equal(move.formT1MMapping.line12DeductionClaimedCurrentYearCad > 0, true);
    assert.equal(move.assessmentDate, '2026-10-31');
  });

  await t.test('Rec 377: calculateNewcomerBenefits evaluates CCB, GST/HST credit, and Form RC151 packet', () => {
    const ben = calculateNewcomerBenefits({
      applicantName: 'Aisha Al-Hassan',
      province: 'ON',
      adjustedFamilyNetIncomeCad: 32000,
      maritalStatus: 'married',
      childrenUnder6Count: 1,
      children6to17Count: 1,
      landingDateStr: '2026-08-15',
      assessmentDate: '2026-10-31'
    });

    assert.equal(ben.applicantName, 'Aisha Al-Hassan');
    assert.equal(ben.province, 'ON');
    assert.equal(ben.landingDate, '2026-08-15');
    assert.equal(ben.familyProfile.totalChildrenCount, 2);
    assert.ok(ben.annualTotals.ccbAnnual > 10000);
    assert.ok(ben.annualTotals.gstHstAnnual > 0);
    assert.ok(ben.cashflowSchedule.totalMonthlyLiquidityCad > 0);
    assert.ok(ben.requiredForms.some(f => f.formCode === 'Form RC151'));
    assert.ok(ben.requiredForms.some(f => f.formCode === 'Form RC66'));
  });

  await t.test('Rec 378: calculateNewcomerBudget simulates 12-month runway, upfront deposits, and waiting period warnings', () => {
    const bgt = calculateNewcomerBudget({
      applicantName: 'Rohan Mehra',
      city: 'Vancouver',
      household: 'couple',
      accommodation: '1bed',
      savingsCad: 35000,
      monthlyIncomeNet: 4000,
      assessmentDate: '2026-10-31'
    });

    assert.equal(bgt.applicantName, 'Rohan Mehra');
    assert.equal(bgt.city, 'Vancouver');
    assert.equal(bgt.province, 'British Columbia');
    assert.ok(bgt.initialUpfrontCosts.statutoryRentDeposit > 0);
    assert.ok(bgt.initialUpfrontCosts.totalOneTimeUpfront > 0);
    assert.ok(bgt.runwayMonths > 0);
    assert.ok(bgt.bridgeHealthNotice.includes('statutory waiting period'));
    assert.equal(bgt.asOf, '2026-10-31');
  });

  await t.test('Rec 379: evaluateOntarioRemoteWorkJurisdiction audits ESA jurisdiction, Bill 79, and void non-competes', () => {
    const remote = evaluateOntarioRemoteWorkJurisdiction({
      employeeName: 'Devin Taylor',
      employerName: 'Pacific Rim Cloud Services Ltd.',
      employeePhysicalWorkLocation: 'ONTARIO',
      employerHeadquartersLocation: 'BRITISH_COLUMBIA',
      worksExclusivelyFromHome: true,
      employerTotalOntarioHeadcount: 35,
      hasWrittenDisconnectingFromWorkPolicy: false,
      hasNonCompeteClauseInContract: true,
      contractSignedDate: '2023-04-01',
      employeeTenureMonths: 24,
      weeklySalaryCad: 1800,
      assessmentDate: '2026-10-31'
    });

    assert.equal(remote.employeeName, 'Devin Taylor');
    assert.equal(remote.employerName, 'Pacific Rim Cloud Services Ltd.');
    assert.equal(remote.hasOntarioEsaJurisdiction, true);
    assert.equal(remote.legalVerdict, 'ONTARIO_ESA_STATUTORY_VIOLATION_DETECTED');
    assert.ok(remote.complianceViolations.some(v => v.violation === 'MISSING_DISCONNECTING_FROM_WORK_POLICY'));
    assert.ok(remote.complianceViolations.some(v => v.violation === 'VOID_NON_COMPETE_AGREEMENT'));
    assert.equal(remote.remoteWorkerAudit.individualNoticeWeeksEntitlement, 2);
  });

  await t.test('Rec 380: evaluateOntarioEmploymentReprisal audits ESA s. 74 statutory reverse onus and wage loss remedies', () => {
    const reprisal = evaluateOntarioEmploymentReprisal({
      employeeName: 'Maya Lin',
      employerName: 'Precision Manufacturing Corp.',
      jobTitle: 'Quality Inspector',
      protectedActionTaken: 'REFUSED_UNLAWFUL_UNPAID_OVERTIME',
      employerAdverseAction: 'TERMINATED_EMPLOYMENT',
      daysBetweenActionAndReprisal: 5,
      regularWeeklyWageCad: 1100,
      weeksOfLostIncome: 6,
      seeksJobReinstatement: true,
      employerProvidedDocumentedPerformanceIssuesPrior: false,
      assessmentDate: '2026-10-31'
    });

    assert.equal(reprisal.employeeName, 'Maya Lin');
    assert.equal(reprisal.employerName, 'Precision Manufacturing Corp.');
    assert.equal(reprisal.isCloseTemporalProximity, true);
    assert.equal(reprisal.remedySummary.employerReverseOnusApplies, true);
    assert.equal(reprisal.remedySummary.employerBurdenStatus, 'FAILED_TO_REBUT_REVERSE_ONUS');
    assert.equal(reprisal.remedySummary.lostWagesCad, 6600); // 1100 * 6 = 6600
    assert.equal(reprisal.remedySummary.totalMonetaryRemedyCad, 8600); // 6600 + 2000 distress = 8600
    assert.equal(reprisal.remedySummary.reinstatementAvailable, true);
    assert.ok(reprisal.statutoryViolations.some(v => v.rule === 'STATUTORY_UNLAWFUL_REPRISAL'));
  });
});
