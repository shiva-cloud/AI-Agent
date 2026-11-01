/**
 * Northstar — Canadian Tenant Rent Increase Guideline & Illegal AGI Defense Engine
 *
 * Implements statutory and policy evaluation under:
 * - Ontario Residential Tenancies Act, 2006 (RTA), SO 2006, c. 17:
 *   - s. 6.1 (Exemption for post-Nov 15, 2018 new buildings/additions - Bill 57)
 *   - s. 116 (Notice of rent increase requirement: 90 days, mandatory LTB forms)
 *   - s. 119 (12-month minimum interval between rent increases)
 *   - s. 120 (Annual guideline rent increase: 2.5% for 2024, 2025, 2026)
 *   - s. 126 (Above-guideline increases - capital work max 3%/yr, municipal taxes, security)
 *   - s. 126(13) (Tenant right to pay guideline-only pending LTB order)
 *   - s. 135 & s. 136 (Tenant T1 application for rebate of illegal rent & 12-month deemed lawful rent limitation)
 * - British Columbia Residential Tenancy Act, SBC 2002, c. 78:
 *   - s. 42 (Timing and notice of rent increase: 3 full months)
 *   - s. 43 (Amount of rent increase: annual allowable percentage, e.g. 3.0% in 2025/2026)
 *
 * Pure ES module with zero npm runtime dependencies.
 */

export const RENT_GUIDELINES = {
  ON: {
    year2024: 2.5,
    year2025: 2.5,
    year2026: 2.5,
    currentGuidelinePercent: 2.5,
    exemptionCutoffDate: '2018-11-15',
    noticeDaysRequired: 90,
    validForms: ['N1', 'N2'],
    agiMaxAnnualCapitalPercent: 3.0,
    t1FilingWindowMonths: 12
  },
  BC: {
    year2024: 3.5,
    year2025: 3.0,
    year2026: 3.0,
    currentGuidelinePercent: 3.0,
    exemptionCutoffDate: null, // BC applies rent control to all units regardless of build date!
    noticeDaysRequired: 90, // 3 full calendar months
    validForms: ['RTB-7'],
    agiMaxAnnualCapitalPercent: 3.0,
    t1FilingWindowMonths: 12
  }
};

/**
 * Calculates days between two ISO date strings (YYYY-MM-DD).
 */
function daysBetween(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return 0;
  const a = new Date(dateStrA);
  const b = new Date(dateStrB);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Diagnostic evaluation of tenant rent increase notices, guideline compliance, and AGI defense.
 */
export function evaluateRentIncreaseNotice({
  province = 'ON',
  firstOccupiedDate = '2017-06-01',
  currentMonthlyRentCad = 2200,
  proposedMonthlyRentCad = 2400,
  noticeServedDate = '2026-05-01',
  effectiveDate = '2026-08-01',
  lastIncreaseDate = '2025-08-01',
  officialFormUsed = 'N1',
  isAgiClaimed = false,
  agiReason = 'capital_expenditures',
  hasLtbOrderBeenIssued = false,
  unresolvedMaintenanceDefects = false
} = {}) {
  const prov = String(province || 'ON').toUpperCase() === 'BC' ? 'BC' : 'ON';
  const rules = RENT_GUIDELINES[prov];
  const currentRent = Math.max(1, Number.isFinite(Number(currentMonthlyRentCad)) ? Number(currentMonthlyRentCad) : 2000);
  const proposedRent = Math.max(1, Number.isFinite(Number(proposedMonthlyRentCad)) ? Number(proposedMonthlyRentCad) : currentRent);

  // 1. Rent Control Status Determination
  let isRentControlled = true;
  let rentControlFinding = '';

  if (prov === 'ON') {
    if (firstOccupiedDate && firstOccupiedDate > rules.exemptionCutoffDate) {
      isRentControlled = false;
      rentControlFinding = 'EXEMPT FROM RENT CONTROL (Ontario Bill 57 / RTA s. 6.1): Unit was first occupied for residential purposes after November 15, 2018. Landlord can legally increase rent by any amount, provided proper 90-day Form N2 notice is served.';
    } else {
      isRentControlled = true;
      rentControlFinding = 'RENT CONTROLLED (Ontario RTA s. 120): Unit was occupied for residential purposes on or before November 15, 2018. Landlord is strictly limited to the annual guideline (2.5%) unless an AGI is approved by the LTB.';
    }
  } else {
    // BC applies rent control to all residential units
    isRentControlled = true;
    rentControlFinding = 'RENT CONTROLLED (BC RTA s. 43): All residential rental units in British Columbia are protected by annual rent increase caps regardless of building age.';
  }

  // 2. Guideline & Calculations
  const guidelinePercent = rules.currentGuidelinePercent;
  const allowableGuidelineIncreaseCad = Math.round((currentRent * (guidelinePercent / 100)) * 100) / 100;
  const maxLawfulGuidelineRentCad = Math.round((currentRent + allowableGuidelineIncreaseCad) * 100) / 100;
  const actualIncreaseCad = Math.round((proposedRent - currentRent) * 100) / 100;
  const proposedIncreasePercent = Math.round((actualIncreaseCad / currentRent) * 1000) / 10;

  // 3. Notice Period Compliance (Must be at least 90 full days)
  const daysNoticeGiven = daysBetween(noticeServedDate, effectiveDate);
  const isNoticePeriodCompliant = daysNoticeGiven >= rules.noticeDaysRequired;

  // 4. 12-Month Rule Compliance (Must be at least 365 days since last increase or move-in)
  const daysSinceLastIncrease = daysBetween(lastIncreaseDate, effectiveDate);
  const is12MonthRuleCompliant = daysSinceLastIncrease >= 365;

  // 5. Form Compliance Check
  const normalizedForm = String(officialFormUsed || '').trim().toUpperCase();
  const isFormCompliant = rules.validForms.includes(normalizedForm) || (prov === 'ON' && !isRentControlled && normalizedForm === 'N2');

  // 6. Statutory Defects Compilation
  const statutoryDefects = [];

  if (!isFormCompliant) {
    statutoryDefects.push({
      defectCode: 'INVALID_NOTICE_FORM',
      statute: prov === 'ON' ? 'RTA s. 116(1)' : 'BC RTA s. 42(3)',
      severity: 'VOIDS_NOTICE',
      remedy: 'The rent increase is legally VOID. Under statutory law, rent increases served via text message, email, informal letter, or incorrect form have zero legal effect. You do not need to pay the increase.'
    });
  }

  if (!isNoticePeriodCompliant) {
    statutoryDefects.push({
      defectCode: 'DEFICIENT_NOTICE_PERIOD',
      statute: prov === 'ON' ? 'RTA s. 116(2)' : 'BC RTA s. 42(2)',
      severity: 'VOIDS_NOTICE',
      remedy: `Notice gave only ${daysNoticeGiven} days, failing the mandatory ${rules.noticeDaysRequired}-day statutory requirement. The notice is completely void ab initio.`
    });
  }

  if (!is12MonthRuleCompliant) {
    statutoryDefects.push({
      defectCode: 'PREMATURE_12_MONTH_INCREASE',
      statute: prov === 'ON' ? 'RTA s. 119(1)' : 'BC RTA s. 42(1)',
      severity: 'VOIDS_NOTICE',
      remedy: `Only ${daysSinceLastIncrease} days have passed since the last rent change. Landlords are statutorily barred from increasing rent more frequently than once every 12 months (365 days).`
    });
  }

  if (isRentControlled && !isAgiClaimed && proposedIncreasePercent > guidelinePercent) {
    statutoryDefects.push({
      defectCode: 'EXCEEDS_STATUTORY_GUIDELINE',
      statute: prov === 'ON' ? 'RTA s. 120(1)' : 'BC RTA s. 43(1)',
      severity: 'UNLAWFUL_AMOUNT',
      remedy: `The proposed increase of ${proposedIncreasePercent}% exceeds the statutory guideline cap of ${guidelinePercent}%. Without an approved AGI order from the LTB/RTB, demanding more than the guideline is illegal.`
    });
  }

  // 7. Above-Guideline Increase (AGI) Analysis
  let agiAnalysis = null;
  if (isAgiClaimed && isRentControlled) {
    const unapprovedPortionCad = Math.max(0, proposedRent - maxLawfulGuidelineRentCad);
    agiAnalysis = {
      isAgiApplicable: true,
      agiReason,
      unapprovedPortionCad,
      hasLtbOrderBeenIssued,
      tenantStatutoryRight: hasLtbOrderBeenIssued
        ? 'LTB Order has been granted. The landlord is legally permitted to collect the approved AGI amount.'
        : `Under Ontario RTA s. 126(13), you have the absolute legal right to pay ONLY the guideline amount ($${maxLawfulGuidelineRentCad.toFixed(2)}) pending the final LTB hearing. You cannot be evicted for arrears for withholding the unapproved above-guideline portion ($${unapprovedPortionCad.toFixed(2)}/mo).`,
      maintenanceDefenseFinding: unresolvedMaintenanceDefects
        ? 'CRITICAL DEFENSE: You have unresolved maintenance defects. Under RTA s. 126(12), the LTB is statutorily prohibited from granting an AGI if serious maintenance or repair orders remain outstanding against the landlord.'
        : 'Ensure you document all outstanding repairs in the building prior to the LTB AGI hearing.'
    };
  }

  // 8. Overpayment & T1 Recovery Analysis
  const monthlyIllegalPortionCad = Math.max(0, proposedRent - maxLawfulGuidelineRentCad);
  const annualIllegalPortionCad = Math.round(monthlyIllegalPortionCad * 12 * 100) / 100;
  const t1StatuteOfLimitationsWarning = prov === 'ON'
    ? 'CRITICAL LIMITATION: Under Ontario RTA s. 136, if an illegal rent increase is paid for 12 consecutive months without filing a Form T1 application at the LTB, the illegal rent automatically converts into the lawful rent by operation of law. File Form T1 within 1 year to reclaim illegal payments.'
    : 'In BC, dispute unlawful rent increases with the Residential Tenancy Branch within 12 months to reclaim deductions.';

  // 9. Overall Validity Verdict Determination
  let validityVerdict = 'COMPLIANT';
  let summary = 'The proposed rent increase complies with statutory guidelines, notice periods, and 12-month interval rules.';

  if (!isFormCompliant || !isNoticePeriodCompliant || !is12MonthRuleCompliant) {
    validityVerdict = 'STATUTORILY_VOID';
    summary = 'The rent increase notice is legally void due to statutory notice defects. The tenant is under no legal obligation to pay the proposed increase.';
  } else if (isAgiClaimed && !hasLtbOrderBeenIssued) {
    validityVerdict = 'AGI_UNAPPROVED_PAY_GUIDELINE_ONLY';
    summary = `The landlord has applied for an Above-Guideline Increase, but no LTB order has been granted. Under RTA s. 126(13), pay ONLY the guideline rent of $${maxLawfulGuidelineRentCad.toFixed(2)}.`;
  } else if (isRentControlled && proposedIncreasePercent > guidelinePercent) {
    validityVerdict = 'ILLEGAL_AMOUNT';
    summary = `The proposed increase (${proposedIncreasePercent}%) unlawfully exceeds the statutory guideline cap (${guidelinePercent}%). Pay only the lawful guideline rent of $${maxLawfulGuidelineRentCad.toFixed(2)}.`;
  } else if (!isRentControlled) {
    validityVerdict = 'UNRESTRICTED_MARKET_INCREASE';
    summary = 'The unit is exempt from rent control (first occupied post-Nov 15, 2018). While the amount is legally unrestricted, the 90-day notice period and 12-month interval remain mandatory.';
  }

  // 10. Official Tenant Dispute Notice Letter Draft
  const officialTenantDisputeNotice = `FORMAL TENANT NOTICE OF STATUTORY RENT INCREASE DEFECTS
Date: ${noticeServedDate || '2026-10-31'}
To: Landlord / Property Management
Re: Purported Rent Increase Notice for Rental Unit

Please be advised that your notice of rent increase proposing an increase from $${currentRent.toFixed(2)} CAD to $${proposedRent.toFixed(2)} CAD effective ${effectiveDate} has been audited under the ${prov === 'ON' ? 'Ontario Residential Tenancies Act, 2006 (RTA)' : 'BC Residential Tenancy Act'}.

The notice contains the following statutory defects:
${statutoryDefects.map((d, i) => `${i + 1}. [${d.statute}] ${d.defectCode}: ${d.remedy}`).join('\n')}

${isAgiClaimed && !hasLtbOrderBeenIssued
  ? `Pursuant to Ontario RTA s. 126(13), I am exercising my statutory right to pay ONLY the annual guideline amount of $${maxLawfulGuidelineRentCad.toFixed(2)} CAD pending the Landlord and Tenant Board's formal order on your AGI application (Form L5).`
  : !isFormCompliant || !isNoticePeriodCompliant || !is12MonthRuleCompliant
    ? `As this notice fails mandatory statutory requirements, it is void ab initio. My lawful monthly rent remains $${currentRent.toFixed(2)} CAD until a valid notice conforming to statutory requirements is served.`
    : `I will pay the lawful guideline rent of $${maxLawfulGuidelineRentCad.toFixed(2)} CAD.`
}

Sincerely,
Tenant in Full Compliance with Provincial Tenancy Law`;

  return {
    asOf: '2026-10-31',
    province: prov,
    validityVerdict,
    summary,
    rentControlStatus: {
      isRentControlled,
      firstOccupiedDate,
      finding: rentControlFinding
    },
    rentCalculations: {
      currentMonthlyRentCad: currentRent,
      proposedMonthlyRentCad: proposedRent,
      statutoryGuidelinePercent: guidelinePercent,
      proposedIncreasePercent,
      allowableGuidelineIncreaseCad,
      maxLawfulGuidelineRentCad
    },
    noticeCompliance: {
      noticeServedDate,
      effectiveDate,
      daysNoticeGiven,
      statutoryDaysRequired: rules.noticeDaysRequired,
      isNoticePeriodCompliant,
      daysSinceLastIncrease,
      is12MonthRuleCompliant,
      officialFormUsed: normalizedForm,
      isFormCompliant
    },
    statutoryDefects,
    agiAnalysis,
    overpaymentAnalysis: {
      monthlyIllegalPortionCad,
      annualIllegalPortionCad,
      t1StatuteOfLimitationsWarning
    },
    officialTenantDisputeNotice,
    statutoryReferences: [
      prov === 'ON' ? 'Ontario RTA s. 6.1 (Post-Nov 15, 2018 Exemption)' : 'BC RTA s. 43 (Rent increase limits)',
      prov === 'ON' ? 'Ontario RTA s. 116 (Notice of rent increase requirements)' : 'BC RTA s. 42 (Timing and notice)',
      prov === 'ON' ? 'Ontario RTA s. 119 (12-month rule)' : 'BC RTA s. 42(1) (12-month frequency)',
      prov === 'ON' ? 'Ontario RTA s. 120 (Statutory rent guideline: 2.5%)' : 'BC RTA s. 43(1) (Annual percentage)',
      prov === 'ON' ? 'Ontario RTA s. 126(13) (Tenant right to pay guideline pending AGI order)' : 'BC RTA s. 43(3) (Additional rent increase)',
      prov === 'ON' ? 'Ontario RTA s. 135 & s. 136 (T1 application & 12-month deemed lawful rent limitation)' : 'BC RTA s. 43(5) (Recovery of unlawful increase)'
    ]
  };
}
