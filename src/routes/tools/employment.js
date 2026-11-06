import { applyFormAliases } from '../../tool-input.js';
// src/routes/tools/employment.js
// Domain route handlers for employment tools.

import { ValidationError } from '../../api-errors.js';
import { auditAlbertaEmploymentRestPeriods } from '../../alberta-employment-rest-periods-shift-limits-navigator.js';
import { auditAlbertaTerminationJustCause } from '../../alberta-employment-termination-just-cause-audit-navigator.js';
import { auditBcEmploymentUniformAndDeductions } from '../../british-columbia-employment-uniform-equipment-deduction-navigator.js';
import { auditCanadianExperienceBarriers, auditOhsaWorkRefusalAndReprisal, auditWsibInjuryClaimDeadline, auditConstructiveDismissal } from '../../workplace-rights-defense-navigator.js';
import { auditEiVoluntaryQuitJustCause, evaluateEiParentalAndSicknessBenefits, evaluateEiRegularBenefits } from '../../ei-benefits-navigator.js';
import { auditEmploymentReferenceLetter } from '../../employment-reference-audit.js';
import { auditOntarioPayTransparencyAndPosting } from '../../ontario-employment-pay-equity-transparency-navigator.js';
import { auditOntarioTemporaryLayoff } from '../../ontario-employment-temp-layoff-constructive-dismissal-navigator.js';
import { auditOntarioThaLicensing } from '../../ontario-employment-temp-help-agency-licensing-navigator.js';
import { auditStatutoryPayAndWages } from '../../statutory-pay-calculator.js';
import { auditWorkerClassificationAndWageTheft } from '../../employment-standards.js';
import { calculateOntarioStatutorySeverance } from '../../ontario-employment-severance-payroll-calculation-navigator.js';
import { calculateSeveranceAndNotice } from '../../severance-bardal-calculator.js';
import { calculateVacationPayStepUp, calculatePublicHolidayPay, evaluateEsaStatutorySeverance, auditContractorMisclassification, auditEqualPayForEqualWork, calculateOntarioOvertimePay } from '../../esa-wage-theft-navigator.js';
import { evaluateAlbertaConstructiveDismissal } from '../../alberta-employment-constructive-dismissal-salary-reduction-navigator.js';
import { evaluateAlbertaGeneralHolidayPay } from '../../alberta-employment-general-holiday-pay-navigator.js';
import { evaluateAlbertaMaternityParentalLeave } from '../../alberta-employment-maternity-parental-leave-navigator.js';
import { evaluateAlbertaOvertimeBanking } from '../../alberta-employment-overtime-banking-navigator.js';
import { evaluateAlbertaYouthEmploymentRules } from '../../alberta-employment-youth-employment-rules-navigator.js';
import { evaluateBcChildYouthEmployment } from '../../british-columbia-employment-child-youth-employment-navigator.js';
import { evaluateBcGroupTerminationNotice } from '../../british-columbia-employment-severance-group-termination-navigator.js';
import { evaluateBcIllnessInjuryLeave } from '../../british-columbia-employment-illness-injury-leave-navigator.js';
import { evaluateBcOvertimeBanking } from '../../british-columbia-employment-overtime-banking-navigator.js';
import { evaluateEiDisqualificationAndAllocation } from '../../ei-disqualification-navigator.js';
import { evaluateEsaConstructiveDismissalLayoff } from '../../ontario-employment-constructive-dismissal-layoff-navigator.js';
import { evaluateEsaReprisal } from '../../ontario-employment-standards-reprisal-navigator.js';
import { evaluateManitobaEmploymentLeave } from '../../manitoba-employment-leave-job-protection-navigator.js';
import { evaluateManitobaGeneralHolidayPay } from '../../manitoba-employment-statutory-holiday-pay-navigator.js';
import { evaluateOntarioEmploymentReprisal } from '../../ontario-employment-reprisal-complaint-navigator.js';
import { evaluateOntarioPublicHolidayPay } from '../../ontario-employment-public-holiday-pay-calculation-navigator.js';
import { evaluateOntarioRemoteWorkJurisdiction } from '../../ontario-employment-remote-telework-jurisdiction-navigator.js';
import { evaluatePlatformWorkerRights } from '../../digital-platform-worker-navigator.js';
import { evaluateSaskatchewanLayoffNotice } from '../../saskatchewan-employment-layoff-notice-severance-navigator.js';
import { evaluateStatutorySeveranceNotice } from '../../statutory-severance-notice-navigator.js';
import { evaluateWorkplaceSafetyAndRefusal } from '../../workplace-safety-navigator.js';
import { todayIso } from '../../text-input.js';

function employmentFieldReader(input) {
  return function field(name, alias = name) {
    if (input instanceof URLSearchParams) {
      return input.get(input.has(alias) && !input.has(name) ? alias : name) ?? undefined;
    }
    return input[Object.hasOwn(input, alias) && !Object.hasOwn(input, name) ? alias : name];
  };
}

function albertaOvertimeInputs(input) {
  const field = employmentFieldReader(input);
  const hours = field('dailyHoursWorked', 'hoursWorked');
  let credits = field('bankedCredits');
  if (input instanceof URLSearchParams && typeof credits === 'string') {
    try { credits = JSON.parse(credits); }
    catch { throw new ValidationError('bankedCredits must be a JSON array'); }
  }
  return {
    regularHourlyWageCad: field('regularHourlyWageCad', 'wage'),
    dailyHoursWorked: typeof hours === 'string' ? hours.split(',') : hours,
    hasWrittenOvertimeAgreement: field('hasWrittenOvertimeAgreement', 'agreement'),
    collectiveAgreementBankingMonths: field('collectiveAgreementBankingMonths'),
    bankedCredits: credits,
    existingBankedHours: field('existingBankedHours', 'banked'),
    monthsElapsedSinceBanked: field('monthsElapsedSinceBanked', 'months'),
    isEmploymentTerminating: field('isEmploymentTerminating', 'terminating'),
    hoursTakenAsTimeOff: field('hoursTakenAsTimeOff', 'timeOffTaken'),
    hasManagerialOrProfessionalExemption: field('hasManagerialOrProfessionalExemption', 'exempt'),
    assessmentDate: field('assessmentDate'),
    employeeName: field('employeeName')
  };
}

function bcOvertimeInputs(input) {
  const field = employmentFieldReader(input);
  return {
    regularHourlyWageCad: field('regularHourlyWageCad', 'wage'),
    dailyHoursWorkedOver8: field('dailyHoursWorkedOver8', 'ot15'),
    dailyHoursWorkedOver12: field('dailyHoursWorkedOver12', 'ot20'),
    weeklyHoursWorkedOver40: field('weeklyHoursWorkedOver40', 'weeklyOt'),
    employeeRequestedTimeBankInWriting: field('employeeRequestedTimeBankInWriting', 'requestWritten'),
    wantsPaidTimeOffInsteadOfPay: field('wantsPaidTimeOffInsteadOfPay', 'timeOff'),
    existingBankedValueCad: field('existingBankedValueCad'),
    bankedHoursAlreadyAccumulated: field('bankedHoursAlreadyAccumulated', 'banked'),
    employeeRequestedPayout: field('employeeRequestedPayout', 'payoutReq'),
    employmentTerminated: field('employmentTerminated', 'terminated'),
    overtimePaidActuallyCad: field('overtimePaidActuallyCad', 'paidActual'),
    assessmentDate: field('assessmentDate'),
    employeeName: field('employeeName'),
    employerName: field('employerName')
  };
}

function manitobaHolidayInputs(input) {
  const field = employmentFieldReader(input);
  return {
    holidayName: field('holidayName', 'holiday'),
    grossWagesInPast4WeeksCad: field('grossWagesInPast4WeeksCad', 'wages4w'),
    workedOnHoliday: field('workedOnHoliday', 'worked'),
    hoursWorkedOnHoliday: field('hoursWorkedOnHoliday', 'hours'),
    regularHourlyWageCad: field('regularHourlyWageCad', 'wage'),
    absentWithoutConsentBeforeOrAfter: field('absentWithoutConsentBeforeOrAfter', 'absent'),
    substituteDayOffWithPayAgreed: field('substituteDayOffWithPayAgreed', 'substitute'),
    holidayPayActuallyPaidCad: field('holidayPayActuallyPaidCad', 'paidActual'),
    employeeName: field('employeeName'),
    assessmentDate: field('assessmentDate')
  };
}

function ontarioHolidayInputs(input) {
  const field = employmentFieldReader(input);
  return {
    holidayName: field('holidayName', 'holiday'),
    regularWagesInPast4WeeksCad: field('regularWagesInPast4WeeksCad', 'wages4w'),
    vacationPayPayableInPast4WeeksCad: field('vacationPayPayableInPast4WeeksCad', 'vacPay'),
    workedShiftBeforeAndAfterHoliday: field('workedShiftBeforeAndAfterHoliday', 'qualified'),
    hadReasonableCauseForAbsence: field('hadReasonableCauseForAbsence', 'reasonableCause'),
    workedOnPublicHoliday: field('workedOnPublicHoliday', 'worked'),
    hoursWorkedOnHoliday: field('hoursWorkedOnHoliday', 'hours'),
    regularHourlyWageCad: field('regularHourlyWageCad', 'wage'),
    substituteDayOffAgreed: field('substituteDayOffAgreed', 'substitute'),
    holidayPayActuallyPaidCad: field('holidayPayActuallyPaidCad', 'paidActual'),
    assessmentDate: field('assessmentDate')
  };
}

function albertaYouthInputs(input) {
  const field = employmentFieldReader(input);
  return {
    employeeAge: field('employeeAge', 'age'),
    jobCategory: field('jobCategory', 'job'),
    hasWrittenParentalConsent: field('hasWrittenParentalConsent', 'consent'),
    isSchoolDay: field('isSchoolDay', 'schoolDay'),
    scheduledShiftHours: field('scheduledShiftHours', 'hours'),
    shiftStartHour: field('shiftStartHour', 'start'),
    shiftEndHour: field('shiftEndHour', 'end'),
    duringSchoolHours: field('duringSchoolHours', 'duringSchool'),
    adultSupervisionPresent: field('adultSupervisionPresent', 'supervision'),
    employeeName: field('employeeName'),
    assessmentDate: field('assessmentDate')
  };
}

function bcGroupTerminationInputs(input) {
  const field = employmentFieldReader(input);
  return {
    affectedEmployeesCount: field('affectedEmployeesCount', 'affectedCount'),
    twoMonthWindow: field('twoMonthWindow'),
    singleLocation: field('singleLocation'),
    groupNoticeWeeksGiven: field('groupNoticeWeeksGiven', 'noticeGivenWeeks'),
    individualTenureMonths: field('individualTenureMonths', 'tenureMonths'),
    regularWeeklyWageCad: field('regularWeeklyWageCad', 'weeklyWage'),
    isUnionized: field('isUnionized', 'unionized'),
    ministerNotified: field('ministerNotified'),
    unionNotified: field('unionNotified'),
    isConstructionIndustry: field('isConstructionIndustry', 'construction'),
    isCasualOrSeasonalLayoff: field('isCasualOrSeasonalLayoff', 'seasonal'),
    isDefiniteTermContract: field('isDefiniteTermContract', 'definiteTerm'),
    isJustCauseTermination: field('isJustCauseTermination', 'justCause'),
    employeeName: field('employeeName'),
    employerName: field('employerName'),
    assessmentDate: field('assessmentDate')
  };
}

function bcYouthInputs(input) {
  const field = employmentFieldReader(input);
  return {
    childAge: field('childAge'),
    proposedOccupationActivity: field('proposedOccupationActivity', 'activity'),
    hasParentalConsentInWriting: field('hasParentalConsentInWriting', 'parentConsent'),
    hasDirectorChildEmploymentPermit: field('hasDirectorChildEmploymentPermit', 'directorPermit'),
    dailyHoursOnSchoolDay: field('dailyHoursOnSchoolDay', 'schoolDayHours'),
    dailyHoursOnNonSchoolDay: field('dailyHoursOnNonSchoolDay', 'nonSchoolDayHours'),
    weeklyHoursDuringSchoolWeek: field('weeklyHoursDuringSchoolWeek', 'schoolWeekHours'),
    hasAdultSupervisionOnSite: field('hasAdultSupervisionOnSite', 'supervision'),
    childName: field('childName'),
    employerName: field('employerName'),
    assessmentDate: field('assessmentDate')
  };
}

function albertaRestInputs(input) {
  const field = employmentFieldReader(input);
  return {
    shiftDurationHours: field('shiftDurationHours', 'shiftHours'),
    restBreakMinutesProvided: field('restBreakMinutesProvided', 'breakMinutes'),
    isBreakSplitIntoTwoPeriods: field('isBreakSplitIntoTwoPeriods', 'splitBreak'),
    hoursBetweenConsecutiveShifts: field('hoursBetweenConsecutiveShifts', 'interShiftHours'),
    consecutiveWorkDaysWorked: field('consecutiveWorkDaysWorked', 'consecutiveDays'),
    consecutiveRestDaysProvidedAfterBlock: field('consecutiveRestDaysProvidedAfterBlock', 'restDaysAfter'),
    isManagerOrSupervisor: field('isManagerOrSupervisor', 'isManager'),
    isUrgentAccidentOrEmergency: field('isUrgentAccidentOrEmergency', 'emergency'),
    employeeName: field('employeeName'),
    assessmentDate: field('assessmentDate')
  };
}

function bcDeductionInputs(input) {
  const field = employmentFieldReader(input);
  return {
    requiresSpecialClothingOrUniform: field('requiresSpecialClothingOrUniform', 'specialClothing'),
    employerProvidedUniformFreeOfCharge: field('employerProvidedUniformFreeOfCharge', 'providedFree'),
    employerCleansUniformOrPaysAllowance: field('employerCleansUniformOrPaysAllowance', 'cleanedOrAllowance'),
    uniformCostOrDepositChargedCad: field('uniformCostOrDepositChargedCad', 'uniformFee'),
    deductedForTillShortage: field('deductedForTillShortage', 'tillShortage'),
    tillShortageDeductionCad: field('tillShortageDeductionCad', 'tillAmount'),
    deductedForCustomerDineAndDash: field('deductedForCustomerDineAndDash', 'dineAndDash'),
    dineAndDashDeductionCad: field('dineAndDashDeductionCad', 'dineAndDashAmount'),
    deductedForEquipmentBreakage: field('deductedForEquipmentBreakage', 'breakage'),
    equipmentBreakageDeductionCad: field('equipmentBreakageDeductionCad', 'breakageAmount'),
    assessmentDate: field('assessmentDate'),
    employeeName: field('employeeName'),
    employerName: field('employerName')
  };
}

function ontarioReprisalInputs(input) {
  const field = employmentFieldReader(input);
  return {
    protectedActionTaken: field('protectedActionTaken', 'action'),
    employerAdverseAction: field('employerAdverseAction', 'adverse'),
    daysBetweenActionAndReprisal: field('daysBetweenActionAndReprisal', 'days'),
    regularWeeklyWageCad: field('regularWeeklyWageCad', 'wage'),
    weeksOfLostIncome: field('weeksOfLostIncome', 'weeksLost'),
    seeksJobReinstatement: field('seeksJobReinstatement', 'reinstatement'),
    employerProvidedDocumentedPerformanceIssuesPrior: field('employerProvidedDocumentedPerformanceIssuesPrior', 'priorDiscipline'),
    assessmentDate: field('assessmentDate'),
    employeeName: field('employeeName'),
    employerName: field('employerName'),
    jobTitle: field('jobTitle'),
    adverseActionDescription: field('adverseActionDescription')
  };
}

export function handleEmploymentGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

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

    if(path==='/v1/tools/bc-esa-group-termination') {
      return send(200, evaluateBcGroupTerminationNotice(bcGroupTerminationInputs(url.searchParams)));
    }

    if(path==='/v1/tools/alberta-overtime-banking') {
      return send(200, evaluateAlbertaOvertimeBanking(albertaOvertimeInputs(url.searchParams)));
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

    if(path==='/v1/tools/bc-child-youth-employment') {
      return send(200, evaluateBcChildYouthEmployment(bcYouthInputs(url.searchParams)));
    }

    if(path==='/v1/tools/alberta-rest-periods') {
      return send(200, auditAlbertaEmploymentRestPeriods(albertaRestInputs(url.searchParams)));
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

    if(path==='/v1/tools/bc-uniform-deductions') {
      return send(200, auditBcEmploymentUniformAndDeductions(bcDeductionInputs(url.searchParams)));
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

    if(path==='/v1/tools/alberta-just-cause') {
      return send(200, auditAlbertaTerminationJustCause(applyFormAliases(path, Object.fromEntries(url.searchParams))));
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

    if(path==='/v1/tools/alberta-employment-maternity-parental-leave') {
      return send(200, evaluateAlbertaMaternityParentalLeave(applyFormAliases(path, Object.fromEntries(url.searchParams))));
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

    if(path==='/v1/tools/ontario-employment-reprisal') {
      return send(200, evaluateOntarioEmploymentReprisal(ontarioReprisalInputs(url.searchParams)));
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

    if(path==='/v1/tools/bc-overtime-banking') {
      return send(200, evaluateBcOvertimeBanking(bcOvertimeInputs(url.searchParams)));
    }

    if(path==='/v1/tools/manitoba-general-holiday-pay') {
      return send(200, evaluateManitobaGeneralHolidayPay(manitobaHolidayInputs(url.searchParams)));
    }

    if(path==='/v1/tools/ontario-public-holiday-pay') {
      return send(200, evaluateOntarioPublicHolidayPay(ontarioHolidayInputs(url.searchParams)));
    }

    if(path==='/v1/tools/alberta-youth-employment-rules') {
      return send(200, evaluateAlbertaYouthEmploymentRules(albertaYouthInputs(url.searchParams)));
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

  return false;
}

export function handleEmploymentPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/worker-classification') {
      return send(200, auditWorkerClassificationAndWageTheft(input));
    }

    if(path==='/v1/tools/statutory-pay') {
      return send(200, auditStatutoryPayAndWages(input));
    }

    if(path==='/v1/tools/employment-reference') {
      return send(200, auditEmploymentReferenceLetter(input));
    }

    if(path==='/v1/tools/workplace-safety') {
      return send(200, evaluateWorkplaceSafetyAndRefusal(input));
    }

    if(path==='/v1/tools/ei-disqualification') {
      return send(200, evaluateEiDisqualificationAndAllocation(input));
    }

    if(path==='/v1/tools/digital-platform-worker') {
      return send(200, evaluatePlatformWorkerRights(input));
    }

    if(path==='/v1/tools/severance-reasonable-notice') {
      return send(200, evaluateStatutorySeveranceNotice(input));
    }

    if(path==='/v1/tools/esa-reprisal-defense') {
      return send(200, evaluateEsaReprisal(input));
    }

    if(path==='/v1/tools/esa-constructive-layoff') {
      return send(200, evaluateEsaConstructiveDismissalLayoff(input));
    }

    if(path==='/v1/tools/on-pay-transparency') {
      return send(200, auditOntarioPayTransparencyAndPosting(input));
    }

    if(path==='/v1/tools/bc-esa-group-termination') {
      return send(200, evaluateBcGroupTerminationNotice(bcGroupTerminationInputs(input)));
    }

    if(path==='/v1/tools/alberta-overtime-banking') {
      return send(200, evaluateAlbertaOvertimeBanking(albertaOvertimeInputs(input)));
    }

    if(path==='/v1/tools/on-remote-work-jurisdiction') {
      return send(200, evaluateOntarioRemoteWorkJurisdiction(input));
    }

    if(path==='/v1/tools/manitoba-leave') {
      return send(200, evaluateManitobaEmploymentLeave(input));
    }

    if(path==='/v1/tools/bc-child-youth-employment') {
      return send(200, evaluateBcChildYouthEmployment(bcYouthInputs(input)));
    }

    if(path==='/v1/tools/alberta-rest-periods') {
      return send(200, auditAlbertaEmploymentRestPeriods(albertaRestInputs(input)));
    }

    if(path==='/v1/tools/on-tha-licensing') {
      return send(200, auditOntarioThaLicensing(input));
    }

    if(path==='/v1/tools/saskatchewan-layoff-notice') {
      return send(200, evaluateSaskatchewanLayoffNotice(input));
    }

    if(path==='/v1/tools/bc-uniform-deductions') {
      return send(200, auditBcEmploymentUniformAndDeductions(bcDeductionInputs(input)));
    }

    if(path==='/v1/tools/ontario-temp-layoff') {
      return send(200, auditOntarioTemporaryLayoff(input));
    }

    if(path==='/v1/tools/alberta-just-cause') {
      return send(200, auditAlbertaTerminationJustCause(input));
    }

    if(path==='/v1/tools/ontario-severance-payroll') {
      return send(200, calculateOntarioStatutorySeverance(input));
    }

    if(path==='/v1/tools/alberta-employment-maternity-parental-leave') {
      return send(200, evaluateAlbertaMaternityParentalLeave(input));
    }

    if(path==='/v1/tools/british-columbia-employment-illness-injury-leave') {
      return send(200, evaluateBcIllnessInjuryLeave(input));
    }

    if(path==='/v1/tools/alberta-general-holiday-pay') {
      return send(200, evaluateAlbertaGeneralHolidayPay(input));
    }

    if(path==='/v1/tools/ontario-employment-reprisal') {
      return send(200, evaluateOntarioEmploymentReprisal(ontarioReprisalInputs(input)));
    }

    if(path==='/v1/tools/alberta-constructive-dismissal') {
      return send(200, evaluateAlbertaConstructiveDismissal(input));
    }

    if(path==='/v1/tools/bc-overtime-banking') {
      return send(200, evaluateBcOvertimeBanking(bcOvertimeInputs(input)));
    }

    if(path==='/v1/tools/manitoba-general-holiday-pay') {
      return send(200, evaluateManitobaGeneralHolidayPay(manitobaHolidayInputs(input)));
    }

    if(path==='/v1/tools/ontario-public-holiday-pay') {
      return send(200, evaluateOntarioPublicHolidayPay(ontarioHolidayInputs(input)));
    }

    if(path==='/v1/tools/alberta-youth-employment-rules') {
      return send(200, evaluateAlbertaYouthEmploymentRules(albertaYouthInputs(input)));
    }

    if(path==='/v1/tools/severance-bardal') {
      return send(200, calculateSeveranceAndNotice(input));
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

  return false;
}
