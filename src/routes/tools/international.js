// src/routes/tools/international.js
// Domain route handlers for international tools.

import { auditAustralianTenancy } from '../../australia-tenancy-tribunal-navigator.js';
import { auditFlagpolingEligibility, auditDliAuthorizedLeave, evaluateCriminalInadmissibility, evaluateRestorationOfStatus } from '../../canada-status-admissibility-guard.js';
import { auditUaeTenancy } from '../../uae-tenancy-dispute-navigator.js';
import { auditUkDevolvedTenancy } from '../../uk-tenancy-devolved-navigator.js';
import { auditUsStateTenancy } from '../../us-state-tenancy-navigator.js';
import { evaluateAustraliaReforms, evaluateGermanyChancenkarteAndTenancy } from '../../australia-germany-global-navigator.js';
import { evaluateGlobalVisaPathways } from '../../global-visa-matrix.js';
import { evaluateUaeGratuityAndWps, auditDubaiReraEvictionNotice, evaluateNewZealandAewvAndTenancy, evaluateIrelandCsepAndRpz, evaluateSingaporeCompassPass } from '../../global-expat-navigator.js';
import { evaluateUkSkilledWorkerAndIlr } from '../../uk-skilled-worker-ilr-navigator.js';
import { evaluateUsH1bOptStatus } from '../../us-h1b-opt-navigator.js';

export function handleInternationalGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/global-visa-matrix') {
      const preferredCountries = url.searchParams.get('countries')?.split(',').map(s=>s.trim()).filter(Boolean) || ['CA', 'US', 'UK', 'AU', 'DE', 'UAE'];
      const educationLevel = url.searchParams.get('education') || 'bachelors';
      const yearsExperience = url.searchParams.get('experience') ? Number(url.searchParams.get('experience')) : 3;
      const fieldOfStudy = url.searchParams.get('field') || 'stem';
      const hasJobOffer = url.searchParams.get('jobOffer') === 'true';
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 29;
      return send(200, evaluateGlobalVisaPathways({ preferredCountries, educationLevel, yearsExperience, fieldOfStudy, hasJobOffer, applicantAge }));
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

export function handleInternationalPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/global-visa-matrix') {
      return send(200, evaluateGlobalVisaPathways(input));
    }

    if(path==='/v1/tools/us-h1b-opt') {
      return send(200, evaluateUsH1bOptStatus(input));
    }

    if(path==='/v1/tools/uk-skilled-worker') {
      return send(200, evaluateUkSkilledWorkerAndIlr(input));
    }

    if(path==='/v1/tools/australia-reforms') {
      return send(200, evaluateAustraliaReforms(input));
    }

    if(path==='/v1/tools/germany-chancenkarte') {
      return send(200, evaluateGermanyChancenkarteAndTenancy(input));
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

    if(path==='/v1/tools/australia-tenancy') {
      const numOr=(v,d)=>{const n=Number(v);return v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      return send(200, auditAustralianTenancy({
        state: input.state || 'NSW',
        weeklyRentAud: numOr(input.weeklyRentAud ?? input.weeklyRent, 650),
        bondPaidAud: numOr(input.bondPaidAud ?? input.bondPaid, 2600),
        rentIncreasePercent: numOr(input.rentIncreasePercent, 0),
        monthsSinceLastRentIncrease: numOr(input.monthsSinceLastRentIncrease ?? input.monthsSinceLastIncrease, 12),
        noticeGivenDays: numOr(input.noticeGivenDays ?? input.noticeDays, 60),
        tenantName: input.tenantName || 'Tenant',
        assessmentDate: input.assessmentDate
      }));
    }

    if(path==='/v1/tools/us-state-tenancy') {
      const numOr=(v,d)=>{const n=Number(v);return v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      return send(200, auditUsStateTenancy({
        state: input.state || 'CA',
        monthlyRentUsd: numOr(input.monthlyRentUsd ?? input.monthlyRent, 2500),
        securityDepositPaidUsd: numOr(input.securityDepositPaidUsd ?? input.securityDeposit, 2500),
        rentIncreasePercent: numOr(input.rentIncreasePercent, 0),
        tenancyDurationMonths: numOr(input.tenancyDurationMonths ?? input.tenancyMonths, 14),
        daysSinceMoveOut: numOr(input.daysSinceMoveOut, 0),
        tenantName: input.tenantName || 'Tenant',
        assessmentDate: input.assessmentDate
      }));
    }

    if(path==='/v1/tools/uk-devolved-tenancy') {
      const numOr=(v,d)=>{const n=Number(v);return v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      return send(200, auditUkDevolvedTenancy({
        nation: input.nation || 'Scotland',
        monthlyRentGbp: numOr(input.monthlyRentGbp ?? input.monthlyRent, 1000),
        depositPaidGbp: numOr(input.depositPaidGbp ?? input.depositPaid, 1000),
        tenureDurationMonths: numOr(input.tenureDurationMonths ?? input.tenureMonths, 12),
        noticeGivenDays: numOr(input.noticeGivenDays ?? input.noticeDays, 28),
        evictionGround: input.evictionGround || 'landlord_intends_to_sell',
        tenantName: input.tenantName || 'Tenant',
        assessmentDate: input.assessmentDate
      }));
    }

    if(path==='/v1/tools/uae-tenancy-dispute') {
      const isTrue=v=>v===true||v==='true';
      const numOr=(v,d)=>{const n=Number(v);return v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      return send(200, auditUaeTenancy({
        emirate: input.emirate || 'Dubai',
        currentAnnualRentAed: numOr(input.currentAnnualRentAed ?? input.currentRent, 80000),
        averageMarketRentAed: numOr(input.averageMarketRentAed ?? input.marketRent, 100000),
        proposedAnnualRentAed: numOr(input.proposedAnnualRentAed ?? input.proposedRent, 88000),
        noticeDaysPriorToRenewal: numOr(input.noticeDaysPriorToRenewal ?? input.noticeDays, 90),
        evictionNoticeGiven: isTrue(input.evictionNoticeGiven ?? input.evictionNotice),
        evictionServedViaNotary: input.notaryServed === undefined && input.evictionServedViaNotary === undefined ? true : isTrue(input.evictionServedViaNotary ?? input.notaryServed),
        tenantName: input.tenantName || 'Tenant',
        assessmentDate: input.assessmentDate
      }));
    }

  return false;
}
