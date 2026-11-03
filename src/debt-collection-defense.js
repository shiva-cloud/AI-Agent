/**
 * @file debt-collection-defense.js
 * @description Canadian Statutory Debt Collection Defense, Collector Harassment Counter-Strike & Limitation Period Engine.
 * 
 * Statutory & Regulatory Authority:
 * - Ontario Collection and Debt Settlement Services Act (CDSSA, RSO 1990, c. C.14):
 *   - s. 13: Mandatory 6-day waiting period after written notice before verbal/phone collection
 *   - s. 21: Banned from contacting employer except once to verify employment
 *   - s. 22 & O. Reg. 74/07 s. 22: Maximum 3 contacts in a 7-day period; permitted calling hours (Mon-Sat 7am-9pm, Sun 1pm-5pm, no holidays)
 *   - s. 22(1): Banned from threatening legal proceedings or wage garnishment without written creditor authorization
 *   - s. 22(2): Mandatory compliance with written request to communicate in writing only
 * - Ontario Limitations Act, 2002 (SO 2002, c. 24, Sched. B), s. 4:
 *   - Basic 2-year limitation period from default or last payment; debt becomes statute-barred
 * - Ontario Consumer Reporting Act (RSO 1990, c. C.33), s. 9:
 *   - 6-year mandatory purge rule for debt collection items on Equifax and TransUnion credit bureaus
 * - British Columbia Business Practices and Consumer Protection Act (BPCPA, SBC 2004, c. 2), Part 7 & Limitation Act (SBC 2012, c. 13), s. 6 (2-year rule)
 * - Alberta Consumer Protection Act (RSA 2000, c. C-26.3) Collection and Debt Repayment Practices Regulation & Limitations Act (RSA 2000, c. L-12), s. 3 (2-year rule)
 * - Federal Immigration and Refugee Protection Act (IRPA, SC 2001, c. 27):
 *   - Disabuses the immigrant coercion myth: consumer debt is strictly a civil matter and does not cause immigration inadmissibility or visa revocation
 * - Criminal Code of Canada (RSC 1985, c. C-46), s. 346:
 *   - Extortion (threatening deportation or police arrest for civil debt is a criminal offense)
 * 
 * Features:
 * - Audits 2-Year Statute of Limitations (statute-barred debt detection) across ON, BC, and AB
 * - Audits 6-Year Credit Bureau Purge Rule (Equifax & TransUnion mandatory deletion)
 * - Detects statutory collection harassment violations (employer calls, family calls, >3 calls/week, holiday calls)
 * - Dismantles immigration & deportation threats (identifying criminal extortion and zero-immigration-risk guarantees)
 * - Generates statutory Cease-and-Desist & "In Writing Only" dispute letters with provincial regulatory filing guides
 */
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const DEBT_DEFENSE_CONSTANTS = Object.freeze({
  STATUTES: {
    ONTARIO_CDSSA: 'Ontario Collection and Debt Settlement Services Act (CDSSA, RSO 1990, c. C.14)',
    ONTARIO_LIMITATIONS: 'Ontario Limitations Act, 2002 (SO 2002, c. 24, Sched. B), s. 4 (2-Year Rule)',
    ONTARIO_CREDIT_PURGE: 'Ontario Consumer Reporting Act (RSO 1990, c. C.33), s. 9 (6-Year Rule)',
    BC_BPCPA: 'British Columbia Business Practices and Consumer Protection Act (SBC 2004, c. 2), Part 7',
    BC_LIMITATIONS: 'British Columbia Limitation Act (SBC 2012, c. 13), s. 6 (2-Year Rule)',
    ALBERTA_CPA: 'Alberta Consumer Protection Act (RSA 2000, c. C-26.3)',
    ALBERTA_LIMITATIONS: 'Alberta Limitations Act (RSA 2000, c. L-12), s. 3 (2-Year Rule)',
    FEDERAL_EXTORTION: 'Criminal Code of Canada (RSC 1985, c. C-46), s. 346 (Extortion)'
  },
  LIMITATION_PERIOD_YEARS: 2,
  CREDIT_BUREAU_PURGE_YEARS: 6,
  MAX_WEEKLY_CALL_LIMIT: 3
});

/**
 * Calculates years elapsed between a date string (YYYY-MM-DD) and reference date.
 * 
 * @param {string} dateStr
 * @param {Date} [referenceDate=new Date()]
 * @returns {number} Floating-point years elapsed
 */
export function calculateYearsElapsed(dateStr, referenceDate = new Date()) {
  if (!dateStr) return 0;
  const safeDate = safeIsoDate(dateStr, null);
  if (!safeDate) return 0;
  const past = new Date(safeDate + 'T00:00:00Z');
  const validRef = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime()) ? referenceDate : new Date();
  const today = new Date(Date.UTC(validRef.getFullYear(), validRef.getMonth(), validRef.getDate()));
  const diffMs = today.getTime() - past.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365));
}

/**
 * Diagnoses Debt Collection Legitimacy, Harassment Violations, and Statutory Defenses.
 * 
 * @param {Object} input
 * @param {string} input.province - 'ON'|'BC'|'AB'
 * @param {string} input.debtType - 'telecom'|'credit_card'|'utility'|'payday_loan'|'gym_membership'|'unknown_identity_theft'
 * @param {string} input.lastPaymentOrDefaultDate - 'YYYY-MM-DD' date of last payment or original default
 * @param {number} input.allegedDebtAmountCad - Amount demanded in CAD
 * @param {string} [input.collectionAgencyName='Unknown Collection Agency'] - Name of debt collector
 * @param {boolean} [input.receivedWrittenNoticeOfCollection=true] - Whether 6-day advance written notice was received
 * @param {number} [input.callsInPastWeek=1] - Number of calls received in past 7 days
 * @param {boolean} [input.calledEmployer=false] - Whether collector called debtor's workplace or boss
 * @param {boolean} [input.calledFamilyOrFriends=false] - Whether collector called relatives or friends
 * @param {boolean} [input.threatenedImmigrationOrDeportation=false] - Whether collector threatened visa/PR status
 * @param {boolean} [input.threatenedImmediateArrestOrLawsuit=false] - Whether collector threatened police or immediate court
 * @param {boolean} [input.calledOutsidePermittedHours=false] - Calling on holidays, before 7am/1pm, or after 9pm
 * @param {Date} [referenceDate=new Date()]
 * @returns {Object} Comprehensive legal defense diagnostic result
 */
export function evaluateDebtCollectionDefense(input = {}, referenceDate = new Date()) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const safeDebtorName = boundedText(safeInput.debtorName || safeInput.consumerName, 'Debtor', 120);
  const refDate = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime()) ? referenceDate : new Date();
  const safeAssessmentDate = safeIsoDate(safeInput.assessmentDate, refDate.toISOString().slice(0, 10));
  const province = boundedText(safeInput.province, 'ON', 10).toUpperCase();
  const debtType = boundedText(safeInput.debtType, 'telecom', 50);
  const defaultDate = safeIsoDate(safeInput.lastPaymentOrDefaultDate, '2022-01-01');
  const allegedAmount = Math.max(0, Math.min(100000000, Number(safeInput.allegedDebtAmountCad) || 1200));
  const agencyName = boundedText(safeInput.collectionAgencyName, 'Collection Agency', 120);
  const hadWrittenNotice = Boolean(safeInput.receivedWrittenNoticeOfCollection);
  const weeklyCalls = Math.max(0, Math.min(1000, Math.floor(Number(safeInput.callsInPastWeek) || 1)));
  const calledEmployer = Boolean(safeInput.calledEmployer);
  const calledFamily = Boolean(safeInput.calledFamilyOrFriends);
  const threatenedImmigration = Boolean(safeInput.threatenedImmigrationOrDeportation);
  const threatenedArrest = Boolean(safeInput.threatenedImmediateArrestOrLawsuit);
  const calledOutsideHours = Boolean(safeInput.calledOutsidePermittedHours);
  const todayStr = safeAssessmentDate;

  const yearsElapsed = calculateYearsElapsed(defaultDate, refDate);
  const isStatuteBarred = yearsElapsed >= DEBT_DEFENSE_CONSTANTS.LIMITATION_PERIOD_YEARS;
  const isCreditBureauPurgeEligible = yearsElapsed >= DEBT_DEFENSE_CONSTANTS.CREDIT_BUREAU_PURGE_YEARS;

  const statutoryViolations = [];
  const legalProtections = [];

  // 1. Limitation Period Audit (The 2-Year Shield)
  const limitationStatute = province === 'BC'
    ? DEBT_DEFENSE_CONSTANTS.STATUTES.BC_LIMITATIONS
    : province === 'AB'
      ? DEBT_DEFENSE_CONSTANTS.STATUTES.ALBERTA_LIMITATIONS
      : DEBT_DEFENSE_CONSTANTS.STATUTES.ONTARIO_LIMITATIONS;

  if (isStatuteBarred) {
    legalProtections.push({
      shield: 'STATUTE_BARRED_DEBT',
      statute: limitationStatute,
      details: `It has been ${yearsElapsed.toFixed(1)} years since your last payment or default. Under the 2-year limitation period, this debt is statute-barred. The collector CANNOT legally sue you in Small Claims Court, cannot obtain a judgment, and cannot garnish your wages.`
    });
  }

  // 2. Credit Bureau 6-Year Purge Audit
  if (isCreditBureauPurgeEligible) {
    legalProtections.push({
      shield: 'CREDIT_BUREAU_PURGE_MANDATE',
      statute: DEBT_DEFENSE_CONSTANTS.STATUTES.ONTARIO_CREDIT_PURGE,
      details: `Because ${yearsElapsed.toFixed(1)} years have passed since the original default date, Equifax and TransUnion are legally required to permanently purge this debt from your credit history.`
    });
  }

  // 3. Immigration / Deportation Threat Audit (Criminal Extortion & Consumer Violation)
  if (threatenedImmigration) {
    statutoryViolations.push({
      violationCode: 'IMMIGRATION_COERCION_EXTORTION',
      statute: `${DEBT_DEFENSE_CONSTANTS.STATUTES.FEDERAL_EXTORTION} & Provincial Consumer Protection`,
      severity: 'CRITICAL_CRIMINAL_VIOLATION',
      finding: 'The collector threatened your immigration status, PR application, work permit, or deportation. In Canada, civil consumer debt has ZERO impact on immigration status under the Immigration and Refugee Protection Act (IRPA). Threatening immigration consequences for debt collection constitutes criminal extortion under Criminal Code s. 346 and grounds for immediate agency license revocation.'
    });
  }

  // 4. Police Arrest / Instant Lawsuit Threat Audit
  if (threatenedArrest) {
    statutoryViolations.push({
      violationCode: 'FALSE_THREAT_OF_ARREST_OR_LEGAL_PROCEEDINGS',
      statute: province === 'ON' ? 'Ontario CDSSA s. 22' : 'Provincial Consumer Protection Act',
      severity: 'STATUTORY_DECEPTIVE_PRACTICE',
      finding: 'Debtors cannot be arrested or jailed for civil consumer debt in Canada. Claiming police involvement or threatening immediate lawsuit without written creditor authorization is an unlawful deceptive practice.'
    });
  }

  // 5. Workplace Contact Audit
  if (calledEmployer) {
    statutoryViolations.push({
      violationCode: 'UNLAWFUL_EMPLOYER_CONTACT',
      statute: province === 'ON' ? 'Ontario CDSSA s. 21' : 'Provincial Consumer Protection Act',
      severity: 'PRIVACY_VIOLATION',
      finding: 'Collectors are strictly prohibited from contacting your employer, boss, or colleagues, except for a single call to verify your employment. Disclosing debt to an employer is illegal.'
    });
  }

  // 6. Calling Family / Friends Audit
  if (calledFamily) {
    statutoryViolations.push({
      violationCode: 'UNLAWFUL_THIRD_PARTY_HARASSMENT',
      statute: province === 'ON' ? 'Ontario CDSSA s. 22' : 'Provincial Consumer Protection Act',
      severity: 'PRIVACY_VIOLATION',
      finding: 'Collectors cannot contact relatives, friends, or neighbors to discuss your debt or demand payment on your behalf.'
    });
  }

  // 7. Excessive Call Frequency Audit (>3 calls in 7 days)
  if (weeklyCalls > DEBT_DEFENSE_CONSTANTS.MAX_WEEKLY_CALL_LIMIT) {
    statutoryViolations.push({
      violationCode: 'EXCESSIVE_CALL_FREQUENCY',
      statute: province === 'ON' ? 'Ontario CDSSA O. Reg. 74/07 s. 22' : 'Provincial Consumer Protection Act',
      severity: 'STATUTORY_HARASSMENT',
      finding: `Collector called ${weeklyCalls} times in a 7-day period. Statutory limit is maximum 3 contacts per 7-day window. Each additional call is an actionable offense.`
    });
  }

  // 8. 6-Day Written Notice Requirement Audit
  if (!hadWrittenNotice) {
    statutoryViolations.push({
      violationCode: 'PREMATURE_CONTACT_NO_WRITTEN_NOTICE',
      statute: province === 'ON' ? 'Ontario CDSSA s. 13' : 'Provincial Consumer Protection Act',
      severity: 'PROCEDURAL_VIOLATION',
      finding: 'The collector cannot contact you by phone until 6 full business days have elapsed after mailing you an official written Notice of Collection.'
    });
  }

  // 9. Outside Permitted Hours Audit
  if (calledOutsideHours) {
    statutoryViolations.push({
      violationCode: 'OUTSIDE_PERMITTED_HOURS',
      statute: province === 'ON' ? 'Ontario CDSSA s. 22' : 'Provincial Consumer Protection Act',
      severity: 'REGULATORY_OFFENSE',
      finding: 'Collection calls are legally prohibited on statutory holidays, before 7:00 AM or after 9:00 PM Monday–Saturday, and before 1:00 PM on Sundays.'
    });
  }

  // 10. Resolution Verdict
  let resolutionVerdict = 'VALID_DEBT_NEGOTIATION';
  if (statutoryViolations.some(v => v.severity === 'CRITICAL_CRIMINAL_VIOLATION')) {
    resolutionVerdict = 'CRIMINAL_EXTORTION_REPORT_MANDATED';
  } else if (isStatuteBarred) {
    resolutionVerdict = 'STATUTE_BARRED_TIME_EXPIRED';
  } else if (statutoryViolations.length > 0) {
    resolutionVerdict = 'COLLECTOR_HARASSMENT_DISPUTE';
  }

  // 11. Cease-and-Desist & "In Writing Only" Statutory Notice Template
  const ceaseAndDesistNotice = `To: ${agencyName}\nDate: ${todayStr}\nAccount Reference: [Collector Account #]\nAlleged Original Creditor: [Original Creditor / Telecom]\nAlleged Amount: $${allegedAmount.toFixed(2)} CAD\n\nFORMAL NOTICE PURSUANT TO THE ${province === 'ON' ? 'ONTARIO COLLECTION AND DEBT SETTLEMENT SERVICES ACT, RSO 1990, c. C.14' : province === 'BC' ? 'BC BUSINESS PRACTICES AND CONSUMER PROTECTION ACT' : 'ALBERTA CONSUMER PROTECTION ACT'}\n\n1. DISPUTE OF DEBT: I formally dispute the validity and amount of this alleged debt. I demand complete written verification, including the original contract, detailed accounting statement, and proof of assignment from the original creditor.\n\n2. WRITING ONLY DIRECTIVE: In accordance with provincial collection legislation, you are hereby formally directed to cease all telephone and verbal communications immediately. All future communications concerning this matter must be conducted SOLELY IN WRITING via registered mail or email at [Your Email / Address].\n\n${isStatuteBarred ? `3. STATUTE-BARRED NOTICE: More than two (2) years have elapsed since the date of the alleged default without written acknowledgment or payment. Under the applicable Limitations Act, this debt is statute-barred. Any threat of legal action or wage garnishment is an unlawful deceptive practice.\n\n` : ''}${threatenedImmigration ? `4. EXTORTION & MISCONDUCT WARNING: Your representatives threatened immigration consequences and deportation. Be advised that civil consumer debt has no bearing on Canadian immigration status under the Immigration and Refugee Protection Act (IRPA). Threatening immigration consequences constitutes criminal extortion under Criminal Code s. 346. A formal regulatory complaint is being filed with the provincial regulator.\n\n` : ''}Govern yourselves accordingly.\n\n[Your Name]`;

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    debtorName: safeDebtorName,
    province,
    debtType,
    allegedDebtAmountCad: allegedAmount,
    collectionAgencyName: agencyName,
    yearsSinceDefault: Number(yearsElapsed.toFixed(2)),
    isStatuteBarred,
    isCreditBureauPurgeEligible,
    resolutionVerdict,
    hasViolations: statutoryViolations.length > 0,
    violationCount: statutoryViolations.length,
    statutoryViolations,
    legalProtections,
    ceaseAndDesistNotice,
    regulatoryFilingGuide: {
      agency: province === 'ON'
        ? 'Ontario Ministry of Public and Business Service Delivery (Consumer Protection Ontario)'
        : province === 'BC'
          ? 'Consumer Protection BC'
          : 'Service Alberta Consumer Investigations',
      action: 'File a formal regulatory complaint against the collection agency for deceptive practices and statutory harassment.'
    },
    statutoryAdvisories: [
      'In Canada, civil consumer debt has ZERO impact on permanent residency, study permits, work permits, or citizenship applications under the Immigration and Refugee Protection Act (IRPA).',
      'Never make a small payment or sign a written letter acknowledging an old debt without legal advice; doing so resets the 2-year limitation period clock back to zero!',
      'Under provincial law, once you instruct a collection agency in writing to communicate only in writing, they must cease all phone calls.'
    ]
  };
}
