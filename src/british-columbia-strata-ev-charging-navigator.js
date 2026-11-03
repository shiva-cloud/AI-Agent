/**
 * Northstar — Settlement Intelligence
 * British Columbia Strata Property Act (SPA) EV Charging Navigator
 *
 * Statutory Authorities:
 * - Strata Property Act, SBC 1998, c. 43, Part 5 Division 6 (EV Charging) ss. 90.1–90.3
 * - Electrical Planning Report Regulation, B.C. Reg. 261/2023
 * - Civil Resolution Tribunal Act, SBC 2012, c. 25 (CRT Strata Division)
 * - British Columbia Hydro and Power Authority (BC Hydro) EV Readiness Guidelines
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const BC_STRATA_EV_RULES = Object.freeze({
  STATUTORY_DECISION_DEADLINE_MONTHS: 3,
  METRO_VANCOUVER_EPR_DEADLINE: '2026-12-31',
  OTHER_REGIONS_EPR_DEADLINE: '2028-12-31',
  MIN_LOTS_FOR_MANDATORY_EPR: 5,
  MAX_RESPONSE_WINDOW_DAYS: 92,
  PROVINCE: 'BC'
});

/**
 * Evaluates a strata owner or tenant's EV charging installation request under SPA ss. 90.1–90.3.
 */
export function evaluateBcStrataEvCharging(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    requestDate = '2026-08-01',
    currentDate = todayIso(), // or 'tenant'
    strataLotCount = 48,
    strataRegion = 'metro_vancouver', // or 'fraser_valley', 'capital_regional_district', 'other_bc'
    hasStrataCouncilResponded = false,
    councilDecision = 'pending', // or 'approved', 'refused'
    refusalReasonCategory = 'none', // or 'electrical_capacity_shortfall', 'imminent_building_wide_plan', 'unwilling_no_reason', 'aesthetic_dislike'
    hasElectricalPlanningReportCompleted = false,
    hasOwnerAgreedToPayAllCostsAndInsurance = true,
    strataPlanNumber = 'LMS-1234',
    ownerName = 'Strata Owner'
  } = safeParams;
  const cleanStrataPlan = boundedText(strataPlanNumber, 'LMS-1234');
  const cleanOwnerName = boundedText(ownerName, 'Strata Owner');
  const cleanRequestDate = safeIsoDate(requestDate, '2026-08-01');
  const cleanCurrentDate = safeIsoDate(currentDate, todayIso());
  const sanitizedLotCount = Number.isFinite(Number(strataLotCount)) ? Math.max(1, Math.min(10000, Math.floor(Number(strataLotCount)))) : 48;
  const reqTime = Date.parse(cleanRequestDate);
  const curTime = Date.parse(cleanCurrentDate);
  const validReq = Number.isFinite(reqTime) ? reqTime : Date.now() - 90 * 86400000;
  const validCur = Number.isFinite(curTime) ? curTime : Date.now();
  const diffMs = Math.max(0, validCur - validReq);
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const monthsElapsed = Math.round((daysElapsed / 30.4375) * 10) / 10;

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. Mandatory 3-Month Council Decision Deadline (SPA s. 90.2(1))
  const isPastThreeMonthDeadline = daysElapsed > BC_STRATA_EV_RULES.MAX_RESPONSE_WINDOW_DAYS;
  const daysRemainingForCouncil = Math.max(
    0,
    BC_STRATA_EV_RULES.MAX_RESPONSE_WINDOW_DAYS - daysElapsed
  );

  if (!hasStrataCouncilResponded) {
    if (isPastThreeMonthDeadline) {
      deficiencies.push(
        `Statutory Deadline Breached: Strata Property Act s. 90.2(1) mandates council render a decision within 3 months of receiving an EV request. ${daysElapsed} days have elapsed without a formal decision.`
      );
      statutoryRemedies.push({
        action: 'File Civil Resolution Tribunal (CRT) Claim for Deemed Failure / Order of Approval',
        timeline: 'Immediate (via online CRT portal)',
        statutoryAuthority: 'Strata Property Act, SBC 1998, c. 43, s. 90.2 & Civil Resolution Tribunal Act'
      });
    } else {
      compliancePoints.push(
        `Strata council is within its statutory 3-month review period (${daysRemainingForCouncil} days remaining).`
      );
    }
  }

  // 2. Unreasonable Refusal Audit (SPA s. 90.2(2))
  let isUnreasonableRefusal = false;
  if (hasStrataCouncilResponded && councilDecision === 'refused') {
    const validRefusalGrounds = [
      'electrical_capacity_shortfall',
      'imminent_building_wide_plan',
      'serious_structural_safety_hazard'
    ];
    if (!validRefusalGrounds.includes(refusalReasonCategory)) {
      isUnreasonableRefusal = true;
      deficiencies.push(
        `Unlawful Refusal: Under SPA s. 90.2(2), a strata corporation must NOT unreasonably refuse an owner's EV request. Refusal based on "${refusalReasonCategory}" (e.g. general unwillingness or aesthetic preference) violates provincial law.`
      );
      statutoryRemedies.push({
        action: 'Issue Statutory Notice of Dispute under SPA s. 90.2',
        timeline: 'Within 14 days of refusal letter',
        statutoryAuthority: 'Strata Property Act s. 90.2(2)'
      });
      statutoryRemedies.push({
        action: 'Initiate CRT Dispute to Overturn Unreasonable Refusal',
        timeline: 'Within 30 calendar days of formal refusal',
        statutoryAuthority: 'Civil Resolution Tribunal Act, SBC 2012, c. 25, s. 3.6'
      });
    } else {
      compliancePoints.push(
        `Council cited recognized technical or capacity ground (${refusalReasonCategory}). Strata must substantiate with engineer report or scheduled retrofit contract.`
      );
    }
  }

  // 3. Electrical Planning Report (EPR) Compliance (B.C. Reg. 261/2023)
  const isUrbanRegion = [
    'metro_vancouver',
    'fraser_valley',
    'capital_regional_district'
  ].includes(strataRegion);
  const statutoryEprDeadline = isUrbanRegion
    ? BC_STRATA_EV_RULES.METRO_VANCOUVER_EPR_DEADLINE
    : BC_STRATA_EV_RULES.OTHER_REGIONS_EPR_DEADLINE;

  const isEprMandatory = sanitizedLotCount >= BC_STRATA_EV_RULES.MIN_LOTS_FOR_MANDATORY_EPR;

  if (isEprMandatory) {
    if (hasElectricalPlanningReportCompleted) {
      compliancePoints.push(
        'Strata corporation has completed its mandatory Electrical Planning Report (EPR).'
      );
    } else {
      compliancePoints.push(
        `Strata corporation has until ${statutoryEprDeadline} to complete its mandatory Electrical Planning Report under B.C. Reg. 261/2023.`
      );
    }
  }

  // 4. Alteration Agreement & Cost Liability (SPA s. 90.3)
  if (!hasOwnerAgreedToPayAllCostsAndInsurance) {
    deficiencies.push(
      'Under SPA s. 90.3, the owner requesting EV infrastructure is responsible for all installation costs, electricity metering, and maintenance insurance unless the strata corporation assumes these costs by a 3/4 vote.'
    );
  } else {
    compliancePoints.push(
      'Owner has agreed to assume all installation, electricity metering, and maintenance liabilities under s. 90.3.'
    );
  }

  // Overall Legal Verdict
  let legalVerdict = 'REQUEST_PENDING_WITHIN_DEADLINE';
  if (hasStrataCouncilResponded && councilDecision === 'approved') {
    legalVerdict = 'APPROVED_READY_FOR_ALTERATION_AGREEMENT';
    statutoryRemedies.push({
      action: 'Execute Section 90.3 EV Infrastructure Agreement',
      timeline: 'Prior to contractor commencing electrical installation',
      statutoryAuthority: 'Strata Property Act s. 90.3'
    });
  } else if (hasStrataCouncilResponded && isUnreasonableRefusal) {
    legalVerdict = 'UNREASONABLE_REFUSAL_CRT_ACTIONABLE';
  } else if (!hasStrataCouncilResponded && isPastThreeMonthDeadline) {
    legalVerdict = 'STATUTORY_DEADLINE_BREACHED_CRT_ACTIONABLE';
  } else if (hasStrataCouncilResponded && councilDecision === 'refused') {
    legalVerdict = 'SUBSTANTIATED_TECHNICAL_REFUSAL';
  }

  const summary =
    legalVerdict === 'APPROVED_READY_FOR_ALTERATION_AGREEMENT'
      ? 'The strata council has approved the EV installation request. The parties can now execute a standard Section 90.3 alteration agreement.'
      : legalVerdict === 'REQUEST_PENDING_WITHIN_DEADLINE'
      ? `The EV request is pending council decision. Strata council has ${daysRemainingForCouncil} day(s) remaining to decide under SPA s. 90.2(1).`
      : `The current strata response or lack thereof constitutes ${legalVerdict}. The applicant has statutory grounds to escalate to the BC Civil Resolution Tribunal (CRT).`;

  return {
    assessmentDate: cleanCurrentDate,
    requestDate: cleanRequestDate,
    ownerName: cleanOwnerName,
    strataPlanNumber: cleanStrataPlan,
    statutoryAuthority: 'Strata Property Act, SBC 1998, c. 43, ss. 90.1-90.3 & B.C. Reg. 261/2023',
    legalVerdict,
    daysElapsedSinceRequest: daysElapsed,
    monthsElapsedSinceRequest: monthsElapsed,
    isPastThreeMonthDeadline,
    daysRemainingForCouncil,
    isUnreasonableRefusal,
    eprRequirements: {
      isEprMandatory,
      statutoryEprDeadline,
      hasElectricalPlanningReportCompleted
    },
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'BC'
  };
}
