/**
 * British Columbia Strata Depreciation Report & Contingency Reserve Fund (CRF) Navigator
 *
 * Audits mandatory 5-year depreciation report requirements (incorporating the 2024
 * elimination of the 3/4 vote waiver loophole for 5+ unit stratas), qualified person
 * credentials, 10% operating budget CRF minimum statutory contributions, and Form B
 * disclosure compliance under BC's Strata Property Act, SBC 1998, c. 43, ss. 59, 93, 94, 100,
 * and B.C. Reg. 162/2024.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const BC_STRATA_CRF_CONSTANTS = Object.freeze({
  DEPRECIATION_REPORT_CYCLE_YEARS: 5, // s. 94(2)
  MIN_STRATA_LOTS_FOR_MANDATORY_REPORT: 5, // B.C. Reg. 162/2024
  MIN_ANNUAL_CRF_CONTRIBUTION_PERCENT: 10.0, // Reg s. 6.1 (10% of operating fund)
  ANNUAL_WAIVER_VOTE_PERMITTED: false, // 2024 amendment eliminated 3/4 waiver for 5+ lots
  QUALIFIED_REPORTERS: Object.freeze([
    'PROFESSIONAL_ENGINEER_PENG',
    'REGISTERED_ARCHITECT_AIBC',
    'CERTIFIED_RESERVE_PLANNER_CRP',
    'ACCREDITED_APPRAISER_AACI',
    'QUANTITY_SURVEYOR_CIQS'
  ]),
  STATUTORY_AUTHORITY: 'Strata Property Act, SBC 1998, c. 43, ss. 59, 93, 94, 100; B.C. Reg. 162/2024'
});

/**
 * Audits BC strata corporation compliance with depreciation reports and CRF statutory rules.
 *
 * @param {Object} params
 * @param {number} [params.strataLotsCount=24] - Number of strata lots in the corporation
 * @param {number} [params.yearsSinceLastDepreciationReport=6] - Years elapsed since most recent depreciation report
 * @param {string} [params.reportAuthorCredential='CERTIFIED_RESERVE_PLANNER_CRP'] - Credential category of the author
 * @param {number} [params.annualOperatingBudgetCad=100000] - Total annual operating fund budget
 * @param {number} [params.annualCrfContributionCad=8000] - Budgeted annual contribution to Contingency Reserve Fund
 * @param {boolean} [params.strataAttemptedAnnualWaiverVote=false] - Strata passed or attempted 3/4 waiver resolution
 * @param {boolean} [params.depreciationReportAttachedToFormB=true] - Report attached to purchaser Form B certificates
 * @returns {Object} Comprehensive BC strata depreciation and reserve fund audit
 */
export function evaluateBcStrataDepreciationReport(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    strataLotsCount = 24,
    yearsSinceLastDepreciationReport = 6,
    reportAuthorCredential = 'CERTIFIED_RESERVE_PLANNER_CRP',
    annualOperatingBudgetCad = 100000,
    annualCrfContributionCad = 8000,
    strataAttemptedAnnualWaiverVote = false,
    depreciationReportAttachedToFormB = true,
    strataPlanNumber = 'VR1234',
    strataCorporationName = 'The Owners, Strata Plan VR1234',
    assessmentDate = todayIso()
  } = safeParams;
  const cleanPlanNumber = boundedText(strataPlanNumber, 'VR1234', 30);
  const cleanCorpName = boundedText(strataCorporationName, 'The Owners, Strata Plan VR1234', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const lots = Math.max(1, Math.min(100000, Number.isFinite(Number(strataLotsCount)) ? Math.floor(Number(strataLotsCount)) : 24));
  const yearsSinceReport = Math.max(0, Math.min(100, Number.isFinite(Number(yearsSinceLastDepreciationReport)) ? Number(yearsSinceLastDepreciationReport) : 6));
  const opBudget = Math.max(0, Math.min(100000000, Number.isFinite(Number(annualOperatingBudgetCad)) ? Number(annualOperatingBudgetCad) : 100000));
  const crfContrib = Math.max(0, Math.min(100000000, Number.isFinite(Number(annualCrfContributionCad)) ? Number(annualCrfContributionCad) : 8000));
  const cred = boundedText(String(reportAuthorCredential || '').trim().toUpperCase(), 'CERTIFIED_RESERVE_PLANNER_CRP', 60);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  const isMandatoryReportStrata = lots >= BC_STRATA_CRF_CONSTANTS.MIN_STRATA_LOTS_FOR_MANDATORY_REPORT;

  // 1. Mandatory 5-Year Cycle & Waiver Prohibition (2024 Amendment)
  if (isMandatoryReportStrata) {
    if (yearsSinceReport > BC_STRATA_CRF_CONSTANTS.DEPRECIATION_REPORT_CYCLE_YEARS) {
      statutoryViolations.push({
        rule: 'OVERDUE_DEPRECIATION_REPORT',
        statute: 'Strata Property Act s. 94 & B.C. Reg. 162/2024',
        finding: `Last report was completed ${yearsSinceReport} years ago. Stratas with 5+ units must commission a new depreciation report every 5 years.`
      });
      actionableRemedies.push({
        action: 'COMMISSION_NEW_DEPRECIATION_REPORT',
        remedyDescription: 'Strata council must immediately retain a qualified professional to prepare a statutory depreciation report.'
      });
    }

    if (strataAttemptedAnnualWaiverVote) {
      statutoryViolations.push({
        rule: 'ILLEGAL_DEPRECIATION_REPORT_WAIVER_ATTEMPT',
        statute: 'B.C. Reg. 162/2024 (Repeal of waiver exception)',
        finding: 'Effective 2024, strata corporations with 5 or more lots can no longer legally waive obtaining a depreciation report by a 3/4 vote.'
      });
      actionableRemedies.push({
        action: 'STRIKE_INVALID_WAIVER_RESOLUTION',
        remedyDescription: 'Inform council that annual waiver votes are null and void under current BC strata regulations.'
      });
    }
  }

  // 2. Author Qualifications (s. 94)
  const isQualifiedAuthor = BC_STRATA_CRF_CONSTANTS.QUALIFIED_REPORTERS.includes(cred);
  if (!isQualifiedAuthor && isMandatoryReportStrata) {
    statutoryViolations.push({
      rule: 'UNQUALIFIED_DEPRECIATION_REPORT_AUTHOR',
      statute: 'Strata Property Act Reg s. 6.2',
      finding: `Report author credential '${cred}' does not meet prescribed professional designations (P.Eng., AIBC, CRP, AACI, CIQS).`
    });
  }

  // 3. Minimum 10% CRF Contribution Audit (Reg s. 6.1)
  const statutoryMinCrfCad = Math.round(opBudget * (BC_STRATA_CRF_CONSTANTS.MIN_ANNUAL_CRF_CONTRIBUTION_PERCENT / 100) * 100) / 100;
  const crfContributionDeficitCad = Math.max(0, Math.round((statutoryMinCrfCad - crfContrib) * 100) / 100);

  if (crfContributionDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_ANNUAL_CRF_CONTRIBUTION',
      statute: 'Strata Property Act s. 93 & Reg s. 6.1',
      finding: `Annual CRF contribution of $${crfContrib.toFixed(2)} is less than mandatory 10% of operating budget ($${statutoryMinCrfCad.toFixed(2)}), creating a $${crfContributionDeficitCad.toFixed(2)} deficit.`
    });
    actionableRemedies.push({
      action: 'AMEND_ANNUAL_BUDGET_FOR_MANDATORY_CRF',
      remedyDescription: `Adjust strata fees at the next AGM to meet the statutory $${statutoryMinCrfCad.toFixed(2)} minimum annual CRF contribution.`
    });
  }

  // 4. Form B Disclosure (s. 59)
  if (!depreciationReportAttachedToFormB) {
    riskWarnings.push({
      warningType: 'MISSING_FORM_B_DEPRECIATION_REPORT_ATTACHMENT',
      description: 'Strata Property Act s. 59 requires the most recent depreciation report to be attached to Form B certificates for prospective buyers.'
    });
  }

  let complianceStatus = 'COMPLIANT_STRATA_CRF_AND_REPORT';
  let legalVerdict = 'Strata corporation meets BC statutory depreciation report and reserve fund minimum contribution rules.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'STATUTORY_STRATA_GOVERNANCE_BREACH';
    legalVerdict = `Strata corporation breached BC Strata Property Act requirements (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Civil Resolution Tribunal (CRT) orders may be sought by owners.`;
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    assessmentDate: safeAssessmentDate,
    strataPlanNumber: cleanPlanNumber,
    strataCorporationName: cleanCorpName,
    strataLotsCount: lots,
    isMandatoryReportStrata,
    yearsSinceLastDepreciationReport: yearsSinceReport,
    complianceStatus,
    legalVerdict,
    crfContributionAudit: {
      annualOperatingBudgetCad: opBudget,
      actualAnnualCrfContributionCad: crfContrib,
      statutoryMinimumCrfContributionCad: statutoryMinCrfCad,
      crfContributionDeficitCad,
      statutoryMinimumCrfPercentage: BC_STRATA_CRF_CONSTANTS.MIN_ANNUAL_CRF_CONTRIBUTION_PERCENT
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Strata Property Act, SBC 1998, c. 43, ss. 59 (Form B), 93 (CRF minimum), 94 (Depreciation report)',
      'Strata Property Amendment Regulation, B.C. Reg. 162/2024 (Elimination of 3/4 waiver & credential rules)'
    ]
  };
}