/**
 * Small Claims Court Dispute & Statutory Demand Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Courts of Justice Act, R.S.O. 1990, c. C.43, ss. 23, 127-130; O. Reg. 258/98 (Rules of the Small Claims Court)
 * - Ontario Limitations Act, 2002, S.O. 2002, c. 24, Sched. B, s. 4 (2-year basic limitation period)
 * - British Columbia Civil Resolution Tribunal Act, S.B.C. 2012, c. 25 ($5,000 CRT limit)
 * - British Columbia Small Claims Act, R.S.B.C. 1996, c. 430 ($35,000 provincial limit)
 * - Alberta Court of Justice Act ($100,000 limit)
 * - Quebec Code of Civil Procedure, CQLR c. C-25.01 ($15,000 limit)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SMALL_CLAIMS_CONSTANTS = Object.freeze({
  ONTARIO_SMALL_CLAIMS_MAX_CAD: 35000,
  BC_CRT_MAX_CAD: 5000,
  BC_SMALL_CLAIMS_MAX_CAD: 35000,
  ALBERTA_SMALL_CLAIMS_MAX_CAD: 100000,
  QUEBEC_SMALL_CLAIMS_MAX_CAD: 15000,
  DEFAULT_PREJUDGMENT_INTEREST_RATE: 4.0,
  ONTARIO_FILING_FEE_INFREQUENT_CAD: 108,
  STANDARD_DEMAND_DEADLINE_DAYS: 14
});

/**
 * Diagnostic evaluation of small claims court monetary jurisdiction, 2-year limitation deadlines,
 * Courts of Justice Act pre-judgment interest accrual, and formal statutory demand letter drafting.
 */
export function evaluateSmallClaimsDispute({
  province = 'ON',
  claimAmountCad = 12000,
  disputeType = 'breach_of_contract',
  dateCauseOfActionArose = '2025-10-01',
  defendantType = 'business',
  defendantName = 'Acme Renovations Inc.',
  plaintiffName = 'Claimant',
  hasSentDemandLetter = false,
  prejudgmentInterestRatePercent = 4.0,
  assessmentDate = '2026-10-31'
} = {}) {
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const rawPrincipal = Math.max(0, Math.min(10000000, Number.isFinite(Number(claimAmountCad)) ? Number(claimAmountCad) : 0));
  const type = boundedText(disputeType, 'breach_of_contract', 50).toLowerCase();

  // Bound echoed text safely
  const pName = boundedText(plaintiffName, 'Claimant', 120);
  const dName = boundedText(defendantName, 'Respondent', 120);
  const defType = boundedText(defendantType, 'business', 50).toLowerCase();

  const pjiRate = Math.max(0, Math.min(25, Number.isFinite(Number(prejudgmentInterestRatePercent)) ? Number(prejudgmentInterestRatePercent) : SMALL_CLAIMS_CONSTANTS.DEFAULT_PREJUDGMENT_INTEREST_RATE));
  const assessStr = safeIsoDate(assessmentDate, '2026-10-31');
  const incidentStr = safeIsoDate(dateCauseOfActionArose, '2025-10-01');

  // 1. Jurisdictional Threshold Audit
  let courtName = '';
  let monetaryLimitCad = 0;
  let exclusiveTribunalConflict = null;

  if (prov === 'ON') {
    courtName = 'Ontario Superior Court of Justice — Small Claims Court';
    monetaryLimitCad = SMALL_CLAIMS_CONSTANTS.ONTARIO_SMALL_CLAIMS_MAX_CAD;
    if (type === 'residential_tenancy') {
      exclusiveTribunalConflict = 'The Ontario Landlord and Tenant Board (LTB) has exclusive jurisdiction over ongoing residential tenancy disputes, rent abatements, and deposit returns under RTA 2006 s. 168(2). Small Claims Court will dismiss tenancy matters unless the tenant has vacated and the claim falls outside LTB statutory remedies.';
    }
  } else if (prov === 'BC') {
    if (rawPrincipal <= SMALL_CLAIMS_CONSTANTS.BC_CRT_MAX_CAD) {
      courtName = 'British Columbia Civil Resolution Tribunal (CRT — Online Dispute Resolution)';
      monetaryLimitCad = SMALL_CLAIMS_CONSTANTS.BC_CRT_MAX_CAD;
    } else {
      courtName = 'Provincial Court of British Columbia (Small Claims Division)';
      monetaryLimitCad = SMALL_CLAIMS_CONSTANTS.BC_SMALL_CLAIMS_MAX_CAD;
    }
    if (type === 'residential_tenancy') {
      exclusiveTribunalConflict = 'The BC Residential Tenancy Branch (RTB) has exclusive jurisdiction over active tenancy disputes under the BC Residential Tenancy Act.';
    }
  } else if (prov === 'AB') {
    courtName = 'Alberta Court of Justice (Civil Division)';
    monetaryLimitCad = SMALL_CLAIMS_CONSTANTS.ALBERTA_SMALL_CLAIMS_MAX_CAD;
  } else if (prov === 'QC') {
    courtName = 'Court of Québec — Small Claims Division';
    monetaryLimitCad = SMALL_CLAIMS_CONSTANTS.QUEBEC_SMALL_CLAIMS_MAX_CAD;
  } else {
    courtName = `${prov} Small Claims Court`;
    monetaryLimitCad = 35000;
  }

  const isWithinSmallClaimsLimit = rawPrincipal <= monetaryLimitCad;
  const excessAmountCad = isWithinSmallClaimsLimit ? 0 : Math.round(rawPrincipal - monetaryLimitCad);
  const abandonExcessRecommendation = isWithinSmallClaimsLimit
    ? 'Claim is within the monetary jurisdiction of the court.'
    : `Your claim of $${rawPrincipal.toLocaleString()} exceeds the $${monetaryLimitCad.toLocaleString()} Small Claims ceiling by $${excessAmountCad.toLocaleString()} CAD. You can either abandon the excess $${excessAmountCad.toLocaleString()} to proceed quickly in Small Claims Court without a lawyer, or retain legal counsel for Superior Court (Rule 76 Simplified Procedure).`;

  // 2. Statute of Limitations Audit (2-Year Basic Period)
  const incidentDate = new Date(incidentStr);
  const curDate = new Date(assessStr);
  const elapsedMs = curDate.getTime() - incidentDate.getTime();
  const daysElapsed = isNaN(elapsedMs) ? 0 : Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const totalLimitationDays = 2 * 365; // 730 days
  const daysRemainingToSue = totalLimitationDays - daysElapsed;
  const isStatuteBarred = daysRemainingToSue <= 0;

  const discoveryRuleAdvisory = isStatuteBarred
    ? 'CRITICAL DEFENSE WARNING: Under the Limitations Act, 2002 s. 4, the 2-year basic limitation period has expired. The defendant can bring a motion to strike your claim as statute-barred unless you prove postponed discovery (s. 5).'
    : `You have approximately ${daysRemainingToSue} days remaining before the mandatory 2-year limitation period expires under provincial law.`;

  // 3. Pre-Judgment Interest & Costs Calculation
  // Principal claim: if over max, user could claim up to court limit
  const effectivePrincipal = isWithinSmallClaimsLimit ? rawPrincipal : monetaryLimitCad;
  const yearsElapsed = daysElapsed / 365;
  const accruedPjiCad = Math.round(effectivePrincipal * (pjiRate / 100) * yearsElapsed * 100) / 100;
  const totalClaimableWithInterestCad = Math.round((effectivePrincipal + accruedPjiCad) * 100) / 100;

  // 4. Formal Statutory Demand Letter Generation
  const paymentDeadlineDate = new Date(curDate.getTime() + (SMALL_CLAIMS_CONSTANTS.STANDARD_DEMAND_DEADLINE_DAYS * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const letterSubject = `FORMAL DEMAND FOR PAYMENT — OUTSTANDING SUM OF $${effectivePrincipal.toLocaleString()} CAD`;

  const letterBodyText = `
FORMAL DEMAND LETTER BEFORE LEGAL ACTION
SENT VIA REGISTERED MAIL AND/OR CERTIFIED EMAIL

DATE: ${assessStr}
TO: ${dName} (${defType === 'business' ? 'Attention: Legal / Management' : 'Individual Respondent'})
FROM: ${pName}

RE: ${letterSubject}
CAUSE OF ACTION: ${type.replace(/_/g, ' ').toUpperCase()} (INCIDENT DATE: ${incidentStr})

Dear ${dName},

Please be advised that this letter constitutes a formal statutory demand for immediate payment of the principal amount of $${effectivePrincipal.toLocaleString()} CAD currently owed to me regarding: ${type.replace(/_/g, ' ')}.

Despite previous requests and contractual obligations, you have failed or refused to rectify this outstanding liability.

TAKE NOTICE THAT:
1. You are formally demanded to pay the total liquidated sum of $${effectivePrincipal.toLocaleString()} CAD on or before ${paymentDeadlineDate} (14 days from the date of this notice).
2. Pursuant to the Ontario Courts of Justice Act, R.S.O. 1990, c. C.43, section 128 (or equivalent provincial civil procedure statute), pre-judgment interest continues to accrue on the outstanding principal balance at the statutory rate of ${pjiRate}% per annum until fully satisfied (current accrued interest: $${accruedPjiCad.toLocaleString()} CAD).
3. If complete payment or a formal settlement agreement is not received by 5:00 PM on ${paymentDeadlineDate}, I will immediately proceed to file a Plaintiff's Claim (Form 7A) in the ${courtName} without further notice.
4. In the event legal proceedings are initiated, I will seek full recovery of the principal claim, accrued pre-judgment and post-judgment interest, court filing fees ($${SMALL_CLAIMS_CONSTANTS.ONTARIO_FILING_FEE_INFREQUENT_CAD} CAD), process server disbursements, and representation costs to the maximum extent permitted under the Rules of Court (including Rule 19 cost penalties for unreasonable refusal to settle).

Govern yourself accordingly.

Sincerely,

${pName}
Telephone / Email / Contact Information
`.trim();

  // 5. Statutory Citations & Procedural Roadmap
  const statutoryCitations = [
    'Ontario Courts of Justice Act, R.S.O. 1990, c. C.43, ss. 23, 128 (Small Claims Jurisdiction & Pre-Judgment Interest)',
    'Ontario Limitations Act, 2002, S.O. 2002, c. 24, Sched. B, s. 4 (2-Year Basic Limitation Period)',
    'Rules of the Small Claims Court, O. Reg. 258/98 (Form 7A Plaintiff\'s Claim & Rule 19 Costs)',
    'British Columbia Civil Resolution Tribunal Act, S.B.C. 2012, c. 25 & Small Claims Act, R.S.B.C. 1996, c. 430'
  ];

  const proceduralSteps = [
    `Serve Formal Demand Letter: Deliver the demand letter via tracked registered mail or courier giving 14 calendar days until ${paymentDeadlineDate}.`,
    `Gather Contemporaneous Evidence: Compile contracts, invoices, text messages, emails, bank transfers, and photos. Under court rules, attachments must accompany the claim.`,
    isWithinSmallClaimsLimit
      ? `File Plaintiff's Claim: If unpaid by deadline, file Form 7A online via ServiceOntario portal ($108 fee).`
      : `Decide on Excess Amount: File Form 7A with explicit waiver of excess over $${monetaryLimitCad.toLocaleString()}, or retain counsel for Superior Court Rule 76.`,
    `Serve Defendant Within 6 Months: In Ontario, Form 7A must be served on defendant within 6 months of filing (Rule 8.01).`,
    `Default Judgment or Settlement Conference: If no Defense (Form 9A) filed within 20 days, note defendant in default and obtain Default Judgment (Form 11B).`
  ];

  return {
    asOf: assessStr,
    assessmentDate: assessStr,
    province: prov,
    plaintiffName: pName,
    defendantName: dName,
    jurisdictionAudit: {
      courtName,
      monetaryLimitCad,
      isWithinSmallClaimsLimit,
      excessAmountCad,
      abandonExcessRecommendation,
      exclusiveTribunalConflict
    },
    limitationAudit: {
      statutoryLimitationYears: 2,
      daysElapsedSinceIncident: daysElapsed,
      daysRemainingToSue,
      isStatuteBarred,
      discoveryRuleAdvisory
    },
    interestAndCostsCalculation: {
      principalClaimCad: rawPrincipal,
      effectivePrincipalCad: effectivePrincipal,
      accruedPrejudgmentInterestCad: accruedPjiCad,
      annualInterestRatePercent: pjiRate,
      estimatedCourtFilingFeeCad: SMALL_CLAIMS_CONSTANTS.ONTARIO_FILING_FEE_INFREQUENT_CAD,
      totalClaimableWithInterestCad
    },
    formalDemandLetter: {
      isRecommended: !hasSentDemandLetter,
      deadlineDays: SMALL_CLAIMS_CONSTANTS.STANDARD_DEMAND_DEADLINE_DAYS,
      paymentDeadlineDate,
      letterSubject,
      letterBodyText
    },
    statutoryCitations,
    proceduralSteps
  };
}
