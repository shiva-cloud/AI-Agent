// src/eviction-defense.js
// Ontario Residential Tenancy Eviction Defense & Predatory Notice Counter-Strike Engine.
// Audits Form N12, N13, N4, and N11 notices against the Residential Tenancies Act, 2006 (S.O. 2006, c. 17),
// enforces mandatory statutory compensation rules (RTA s. 48.1 - void if not paid on or before termination date),
// corporate landlord prohibitions (s. 48(5)), and calculates bad-faith damages up to $35,000 (s. 57(3)).
// Pure ES module with zero npm dependencies.
import { boundedText } from './text-input.js';

function safeIsoDate(val, fallback = '2026-10-31') {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const d = new Date(val.trim() + 'T00:00:00Z');
    if (!Number.isNaN(d.getTime())) return val.trim();
  }
  return fallback;
}

export const EVICTION_FORM_RULES = {
  N12: {
    formCode: 'Form N12',
    name: 'Notice to End Tenancy for Landlord’s / Purchaser’s Own Use',
    statute: 'Residential Tenancies Act, 2006, s. 48, s. 48.1, s. 49, s. 57',
    minNoticeDays: 60,
    requiresStatutoryCompensation: true,
    compensationMonths: 1,
    mustPayOnOrBeforeTerminationDate: true,
    eligibleOccupants: ['landlord', 'spouse', 'child', 'parent', 'purchaser'],
    corporateLandlordAllowed: false
  },
  N13: {
    formCode: 'Form N13',
    name: 'Notice to End Tenancy for Demolition, Conversion, or Substantial Repairs (Renoviction)',
    statute: 'Residential Tenancies Act, 2006, s. 50, s. 52, s. 53, s. 54',
    minNoticeDays: 120,
    requiresStatutoryCompensation: true,
    compensationMonths: 3, // for 5+ units
    hasRightOfFirstRefusal: true
  },
  N4: {
    formCode: 'Form N4',
    name: 'Notice to End Tenancy Early for Non-payment of Rent',
    statute: 'Residential Tenancies Act, 2006, s. 59',
    minNoticeDays: 14,
    requiresStatutoryCompensation: false,
    voidIfPaidWithin14Days: true
  },
  N11: {
    formCode: 'Form N11',
    name: 'Agreement to End the Tenancy',
    statute: 'Residential Tenancies Act, 2006, s. 37(4), s. 202',
    minNoticeDays: 0,
    requiresStatutoryCompensation: false,
    voidIfCoercedOrConditionOfLease: true
  }
};

export function auditEvictionNotice(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    noticeFormType = 'N12',
    monthlyRentCad = 2200,
    noticeServedDate = '2026-05-01',
    terminationDate = '2026-06-30',
    wasStatutoryCompensationPaid = false,
    compensationPaidDate = null,
    isLandlordACorporation = false,
    intendedOccupant = 'landlord',
    buildingUnitCount = 1,
    includesIllegalCharges = false,
    coercedOrMisrepresented = false,
    tenantName = 'Tenant',
    landlordName = 'Landlord',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeTenantName = boundedText(tenantName, 'Tenant', 120);
  const safeLandlordName = boundedText(landlordName, 'Landlord', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const normForm = boundedText(noticeFormType, 'N12', 20).toUpperCase();
  const formRule = EVICTION_FORM_RULES[normForm] || EVICTION_FORM_RULES.N12;
  const rent = Math.max(0, Math.min(100000, Number(monthlyRentCad) || 2200));

  const safeServedDate = safeIsoDate(noticeServedDate, '2026-05-01');
  const safeTermDate = safeIsoDate(terminationDate, '2026-06-30');
  const servedDate = new Date(safeServedDate + 'T00:00:00Z');
  const termDate = new Date(safeTermDate + 'T00:00:00Z');
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysNoticeGiven = Math.max(0, Math.round((termDate.getTime() - servedDate.getTime()) / msPerDay));

  const defects = [];
  const badFaithIndicators = [];
  let isNoticeStatutorilyVoid = false;

  // 1. Notice Period Audit
  const minDays = formRule.minNoticeDays;
  const isNoticePeriodCompliant = daysNoticeGiven >= minDays;
  if (!isNoticePeriodCompliant) {
    defects.push({
      defect: `Insufficient Notice Period: Only ${daysNoticeGiven} days notice provided (Statutory minimum is ${minDays} days).`,
      statute: `Ontario RTA ${formRule.statute}`,
      legalRemedy: 'Notice is defective. The LTB will dismiss the landlord’s eviction application without hearing the merits.',
      dismissMandatory: true
    });
    isNoticeStatutorilyVoid = true;
  }

  // 2. Specific Form Audits
  let compensationDueCad = 0;
  let compensationPaidOnTime = false;

  if (normForm === 'N12') {
    compensationDueCad = rent; // 1 month rent

    // Check Corporate Landlord Rule (RTA s. 48(5))
    if (isLandlordACorporation) {
      defects.push({
        defect: 'Corporate Landlord Prohibition: A corporation cannot legally issue Form N12 for personal use under s. 48(5).',
        statute: 'Ontario RTA s. 48(5)',
        legalRemedy: 'Notice is void ab initio. The LTB lacks jurisdiction to grant an eviction to a corporate landlord under s. 48.',
        dismissMandatory: true
      });
      badFaithIndicators.push('Landlord is an incorporated company (RTA s. 48(5) violation).');
      isNoticeStatutorilyVoid = true;
    }

    // Check Intended Occupant Eligibility
    const validOccupants = ['landlord', 'spouse', 'child', 'parent', 'purchaser'];
    if (!validOccupants.includes(String(intendedOccupant).toLowerCase())) {
      defects.push({
        defect: `Ineligible Occupant: "${intendedOccupant}" is not an eligible family member under s. 48(1) (siblings, cousins, aunts, uncles, friends are statutorily prohibited).`,
        statute: 'Ontario RTA s. 48(1)',
        legalRemedy: 'Fatal defect. The landlord cannot evict for anyone other than themselves, their spouse, child, or parent.',
        dismissMandatory: true
      });
      badFaithIndicators.push(`Occupant "${intendedOccupant}" does not meet s. 48(1) family definition.`);
      isNoticeStatutorilyVoid = true;
    }

    // Check Mandatory 1 Month Compensation Rule (RTA s. 48.1)
    // Landlord MUST pay 1 month rent ON OR BEFORE the termination date
    if (!wasStatutoryCompensationPaid) {
      defects.push({
        defect: 'Unpaid Statutory Compensation: Landlord failed to pay 1 month’s rent compensation on or before the termination date.',
        statute: 'Ontario RTA s. 48.1 & Kandiyoti v. 2387192 Ontario Inc. (2020 ONSC 4380)',
        legalRemedy: 'Ask the Board to dismiss the application: it cannot issue an eviction order unless the landlord paid this compensation (RTA s. 83(4)), and the Divisional Court has held it must be paid by the termination date (Kandiyoti, 2020).',
        dismissMandatory: true
      });
      badFaithIndicators.push('Failure to pay mandatory s. 48.1 compensation prior to termination date.');
      isNoticeStatutorilyVoid = true;
    } else if (compensationPaidDate) {
      const compDate = new Date(compensationPaidDate);
      if (compDate.getTime() > termDate.getTime()) {
        defects.push({
          defect: `Late Statutory Compensation: Compensation paid on ${compensationPaidDate}, which is AFTER the termination date (${terminationDate}).`,
          statute: 'Ontario RTA s. 48.1',
          legalRemedy: 'Under RTA s. 48.1, late payment does not cure the defect. The application must be dismissed.',
          dismissMandatory: true
        });
        isNoticeStatutorilyVoid = true;
      } else {
        compensationPaidOnTime = true;
      }
    } else {
      compensationPaidOnTime = true;
    }
  } else if (normForm === 'N13') {
    const units = Math.max(1, Number(buildingUnitCount) || 1);
    compensationDueCad = units >= 5 ? rent * 3 : rent;

    if (!wasStatutoryCompensationPaid) {
      defects.push({
        defect: `Unpaid Renoviction Compensation: Landlord failed to pay statutory compensation of $${compensationDueCad} CAD under s. 52/54.`,
        statute: 'Ontario RTA s. 52, s. 54',
        legalRemedy: 'Application must be dismissed.',
        dismissMandatory: true
      });
      isNoticeStatutorilyVoid = true;
    }
  } else if (normForm === 'N4') {
    if (includesIllegalCharges) {
      defects.push({
        defect: 'Arrears Include Unlawful Charges: Claimed rent balance includes illegal rent increases above statutory guideline (2.5%), unlawful late fees, or unapproved utility charges.',
        statute: 'Ontario RTA s. 116 & s. 134',
        legalRemedy: 'Defective Notice: Form N4 cannot demand unlawful charges. An N4 with inflated or unlawful arrears will be dismissed at the LTB L1 hearing.',
        dismissMandatory: true
      });
      isNoticeStatutorilyVoid = true;
    }
  } else if (normForm === 'N11') {
    if (coercedOrMisrepresented) {
      defects.push({
        defect: 'Agreement Signed Under Duress or Misrepresentation: Form N11 signed without understanding, under false threats, or as a condition of the lease.',
        statute: 'Ontario RTA s. 37(4) & s. 202',
        legalRemedy: 'The LTB will refuse an ex-parte eviction order (L3) and set aside the agreement under s. 202 if tenant demonstrates coercion.',
        dismissMandatory: true
      });
      isNoticeStatutorilyVoid = true;
    }
  }

  // 3. Potential Bad-Faith Tenant Damages (RTA s. 57(3))
  const generalDamagesMax = Math.min(35000, rent * 12); // 1 full year rent up to LTB $35k cap
  const estimatedMovingCosts = 2500;
  const estimatedRentDifferential1Year = 3600; // $300/mo diff * 12
  const totalPotentialDamages = Math.min(35000, generalDamagesMax + estimatedMovingCosts + estimatedRentDifferential1Year);

  // 4. Overall Verdict
  let validityVerdict = 'VALID';
  if (isNoticeStatutorilyVoid) {
    validityVerdict = 'STATUTORILY_VOID';
  } else if (defects.length > 0) {
    validityVerdict = 'DEFECTIVE_NOTICE';
  } else {
    validityVerdict = 'FACIALLY_VALID_CHALLENGEABLE';
  }

  // 5. Official Dispute Letter to Landlord / LTB Defense Pleading
  const officialDisputeNotice = `FORMAL NOTICE OF STATUTORY DEFECT & NOTICE OF OPPOSITION
To: Landlord of ${normForm} Notice
From: Tenant
Date: ${new Date().toISOString().slice(0, 10)}
Re: Defective ${normForm} Notice dated ${noticeServedDate} with Termination Date ${terminationDate}

PLEASE TAKE FORMAL NOTICE that the ${normForm} Notice served upon me is legally defective and, in my view, invalid under the Ontario Residential Tenancies Act, 2006 (S.O. 2006, c. 17) for the following reasons:

${defects.map((d, i) => `${i + 1}. ${d.defect} (${d.statute})\n   Remedy: ${d.legalRemedy}`).join('\n\n')}

PURSUANT TO SECTION 43 AND SECTION 48.1 OF THE RESIDENTIAL TENANCIES ACT:
1. I will NOT be vacating the rental unit on ${terminationDate}.
2. Only an official Order issued by the Landlord and Tenant Board (LTB) after a full evidentiary hearing can terminate a tenancy in Ontario.
3. If you proceed to file an L2/L1 application with the LTB, I will introduce this defect notice as a preliminary motion for dismissal with costs under Section 48.1 / Section 59.
4. Furthermore, please be advised that under Section 57(3) of the Act, if bad faith is established, the LTB is statutorily empowered to order general damages of up to one full year of rent ($${generalDamagesMax.toLocaleString()} CAD), moving expenses, and administrative penalties up to $50,000 CAD.

This notice is delivered without prejudice to all statutory rights and defenses under the Residential Tenancies Act, 2006.`;

  const statutoryAdvisories = [
    'Only the Board can evict: you do not have to move out just because a landlord gives you an N-form notice. A notice starts the process; only the Landlord and Tenant Board can order an eviction, after a hearing.',
    'N12 Mandatory Compensation Rule: If your landlord did not pay you 1 full month’s rent compensation on or before the termination date on your N12, the notice is dead. The LTB member must dismiss the case under Divisional Court precedent.',
    'Never Sign Form N11: Form N11 is an "Agreement to End the Tenancy" that waives your right to a hearing and compensation. Landlords cannot force you to sign it.',
    'Bad Faith 1-Year Rule: If a landlord evicts you for own use and sells or re-rents the unit within 1 year, you can file Form T5 within 1 year of vacating to claim up to $35,000 in damages.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    tenantName: safeTenantName,
    landlordName: safeLandlordName,
    noticeFormType: normForm,
    validityVerdict,
    isNoticeStatutorilyVoid,
    monthlyRentCad: rent,
    noticePeriodAudit: {
      noticeServedDate,
      terminationDate,
      daysNoticeGiven,
      statutoryDaysRequired: minDays,
      isNoticePeriodCompliant
    },
    statutoryDefects: defects,
    compensationAudit: {
      isMandatory: formRule.requiresStatutoryCompensation,
      amountDueCad: compensationDueCad,
      wasPaid: Boolean(wasStatutoryCompensationPaid),
      paidOnTime: compensationPaidOnTime,
      statutoryCitation: normForm === 'N12' ? 'Ontario RTA s. 48.1' : (normForm === 'N13' ? 'Ontario RTA s. 52/54' : 'N/A')
    },
    badFaithIndicators,
    potentialTenantDamages: {
      statutoryGeneralDamages12MonthsRentCad: generalDamagesMax,
      movingExpensesEstimateCad: estimatedMovingCosts,
      rentDifferential1YearCad: estimatedRentDifferential1Year,
      totalClaimableDamagesCad: totalPotentialDamages,
      statutoryAuthority: 'Residential Tenancies Act, 2006, s. 57(3)'
    },
    officialDisputeNotice,
    statutoryAdvisories,
    statutoryAuthority: 'Residential Tenancies Act, 2006 (S.O. 2006, c. 17)'
  };
}
