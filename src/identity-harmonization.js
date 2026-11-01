// src/identity-harmonization.js
// Canadian Legal Name Change & Dual-Identity Harmonization Engine.
// Audits identity discrepancies, single-name/blank-surname traps, and legal name changes under:
// - Ontario Change of Name Act (R.S.O. 1990, c. C.7, s. 4 12-month rule)
// - British Columbia Name Act (RSBC 1996, c. 328, s. 3 3-month rule & RCMP fingerprinting)
// - Alberta Vital Statistics Act (RSA 2000, c. V-4)
// - IRPR s. 65 / Form IMM 1436 / IMM 5218 (Amendment of Record of Landing / COPR)
// - Bank Act s. 627.17 (Customer Identification) & CRA/Service Canada Cascade
// - Foreign Passport Surrender Acts (e.g. Indian Citizenship Act 1955 s. 9 dual-citizenship bar).
// Pure ES module with zero npm dependencies.

export const PROVINCIAL_NAME_CHANGE_RULES = {
  ON: {
    province: 'Ontario',
    statute: 'Change of Name Act (R.S.O. 1990, c. C.7)',
    minResidencyMonths: 12,
    statutoryFeeCad: 137,
    requiresFingerprinting: false,
    vitalStatisticsOffice: 'ServiceOntario Office of the Registrar General (Thunder Bay)'
  },
  BC: {
    province: 'British Columbia',
    statute: 'Name Act (RSBC 1996, c. 328)',
    minResidencyMonths: 3,
    statutoryFeeCad: 137,
    requiresFingerprinting: true, // Mandatory RCMP criminal record check
    vitalStatisticsOffice: 'Vital Statistics Agency (Victoria, BC)'
  },
  AB: {
    province: 'Alberta',
    statute: 'Vital Statistics Act (RSA 2000, c. V-4)',
    minResidencyMonths: 3,
    statutoryFeeCad: 120,
    requiresFingerprinting: true,
    vitalStatisticsOffice: 'Alberta Vital Statistics / Authorized Alberta Registry Agent'
  }
};

export const PROHIBITED_DUAL_CITIZENSHIP_COUNTRIES = ['IN', 'CN', 'SG', 'MY', 'ID', 'SA', 'JP'];

export function evaluateIdentityHarmonization(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    discrepancyType = 'single_name_blank_surname', // 'single_name_blank_surname', 'maiden_vs_married_name', 'spelling_typo_on_permit', 'dual_citizenship_passport_surrender', 'middle_name_omission'
    currentStatusInCanada = 'permanent_resident', // 'canadian_citizen', 'permanent_resident', 'work_permit_holder', 'study_permit_holder'
    residenceProvince = 'ON', // 'ON', 'BC', 'AB', 'OTHER'
    monthsLivedInProvince = 14,
    foreignCountryOfOrigin = 'IN'
  } = safeParams;
  const normDiscrepancy = String(discrepancyType || 'single_name_blank_surname').toLowerCase().trim();
  const normStatus = String(currentStatusInCanada || 'permanent_resident').toLowerCase().trim();
  const normProvince = String(residenceProvince || 'ON').toUpperCase().trim();
  const normOrigin = String(foreignCountryOfOrigin || 'IN').toUpperCase().trim();
  const monthsInProv = Number.isFinite(Number(monthsLivedInProvince)) ? Math.max(0, Math.floor(Number(monthsLivedInProvince))) : 0;
  

  const violations = [];
  const statutoryAdvisories = [];
  const actionChecklist = [];
  let isProvincialNameChangeEligible = false;
  
  let summaryHeadline = '';

  const provRules = PROVINCIAL_NAME_CHANGE_RULES[normProvince] || {
    province: normProvince,
    statute: 'Provincial Vital Statistics / Change of Name Legislation',
    minResidencyMonths: 12,
    statutoryFeeCad: 140,
    requiresFingerprinting: true,
    vitalStatisticsOffice: 'Provincial Vital Statistics Agency'
  };

  // 1. Audit Provincial Legal Name Change Eligibility
  const isPrOrCitizen = ['permanent_resident', 'canadian_citizen'].includes(normStatus);
  if (isPrOrCitizen) {
    if (monthsInProv >= provRules.minResidencyMonths) {
      isProvincialNameChangeEligible = true;
    } else {
      isProvincialNameChangeEligible = false;
      violations.push({
        rule: `Provincial Residency Period Not Met (${monthsInProv} months < ${provRules.minResidencyMonths} months)`,
        statute: provRules.statute,
        legalFinding: `Under ${provRules.province} law, you must reside continuously in the province for at least ${provRules.minResidencyMonths} months before applying for a statutory legal change of name.`
      });
    }
  } else {
    isProvincialNameChangeEligible = false;
    violations.push({
      rule: 'Temporary Residents Ineligible for Provincial Change of Name',
      statute: provRules.statute,
      legalFinding: `Holders of temporary status (${normStatus.replace(/_/g, ' ')}) cannot legally change their name through provincial vital statistics. You must update your foreign passport through your home country\'s embassy/consulate first, then file Form IMM 1436 with IRCC.`
    });
  }

  // 2. Specific Discrepancy Diagnostics & Remediation Paths
  if (normDiscrepancy === 'single_name_blank_surname') {
    summaryHeadline = 'Single Name / Blank Surname Resolution: IRCC naming convention conflict identified.';
    actionChecklist.push({
      stepNumber: 1,
      targetAgency: isProvincialNameChangeEligible ? provRules.vitalStatisticsOffice : 'Foreign Consulate / IRCC',
      action: isProvincialNameChangeEligible
        ? `Submit Form to ${provRules.vitalStatisticsOffice} for a Legal Change of Name Certificate ($${provRules.statutoryFeeCad} CAD fee). Specify split into legal Given Name and Surname.`
        : `Apply to foreign consulate for an updated foreign passport splitting your name into Given Name and Surname, followed by IRCC Form IMM 1436 amendment.`
    });
    actionChecklist.push({
      stepNumber: 2,
      targetAgency: 'Service Canada & CRA',
      action: 'Present Change of Name Certificate or amended IRCC document to Service Canada to update SIN record (NAS2120), then update CRA account.'
    });
    actionChecklist.push({
      stepNumber: 3,
      targetAgency: 'Credit Bureaus (Equifax / TransUnion) & Banks',
      action: 'Provide amended SIN and Driver\'s Licence to Canadian retail banks under Bank Act s.627.17 to eliminate "No First Name" credit report fragmentation.'
    });
  } else if (normDiscrepancy === 'maiden_vs_married_name') {
    summaryHeadline = 'Married vs. Maiden Name Harmonization: Common law assumption vs legal change of name.';
    actionChecklist.push({
      stepNumber: 1,
      targetAgency: 'Provincial Registrar / Driver\'s Licence Bureau',
      action: 'In Canada, you may use your spouse\'s surname socially and on provincial ID (OHIP/Driver\'s Licence) by presenting a valid marriage certificate without a formal court name change.'
    });
    actionChecklist.push({
      stepNumber: 2,
      targetAgency: 'IRCC (PR Card / Citizenship)',
      action: 'For PR card reissue in married name, submit copy of marriage certificate and provincial ID under IMM 5444. Note: Foreign passport must also match if international air travel is planned.'
    });
  } else if (normDiscrepancy === 'spelling_typo_on_permit') {
    summaryHeadline = 'Clerical Typo Correction: IRCC Form IMM 1436 / IMM 5218 administrative amendment.';
    actionChecklist.push({
      stepNumber: 1,
      targetAgency: 'IRCC Operations (Ottawa)',
      action: 'If the spelling on your Work Permit, Study Permit, or COPR does not match the foreign passport presented at landing, file Form IMM 1436 (Request to Amend Record of Landing / Temporary Resident Document). There is no statutory government processing fee for IRCC clerical errors.'
    });
  } else if (normDiscrepancy === 'dual_citizenship_passport_surrender') {
    const isProhibitedDual = PROHIBITED_DUAL_CITIZENSHIP_COUNTRIES.includes(normOrigin);
    if (normStatus === 'canadian_citizen' && isProhibitedDual) {
      summaryHeadline = `Mandatory Foreign Passport Surrender: ${normOrigin} strictly bars dual citizenship.`;
      violations.push({
        rule: `Prohibited Dual Citizenship with Country of Origin (${normOrigin})`,
        statute: 'Foreign Nationality Legislation & Consular Passports Act',
        legalFinding: `${normOrigin} does not recognize dual nationality. Upon taking the Canadian Oath of Citizenship, you have a mandatory statutory grace period (typically 90 days) to surrender your foreign passport at the consulate. Travelling on your foreign passport after Canadian naturalization triggers consular penalties of $250 to $1,000+ CAD.`
      });
      actionChecklist.push({
        stepNumber: 1,
        targetAgency: 'Consulate General of Origin Country',
        action: `Submit Foreign Passport Surrender / Renunciation Certificate application with Canadian naturalization certificate.`
      });
      actionChecklist.push({
        stepNumber: 2,
        targetAgency: 'Overseas Citizen Registry (e.g. OCI / Dual Visa)',
        action: 'Apply for Overseas Citizenship of India (OCI) card or lifelong multi-entry visa to retain visa-free entry, property ownership, and bank account rights.'
      });
    } else {
      summaryHeadline = 'Dual Nationality Verified: Both Canada and origin country permit holding dual citizenship.';
    }
  }

  // 3. Sequential Government Cascade Update Roadmap
  const governmentCascadeRoadmap = [
    {
      stage: 1,
      agency: `${provRules.vitalStatisticsOffice}`,
      docIssued: 'Certificate of Change of Name',
      timeframe: '6 to 8 weeks',
      notes: provRules.requiresFingerprinting ? 'Includes mandatory RCMP fingerprint criminal screening.' : 'No fingerprinting required in Ontario.'
    },
    {
      stage: 2,
      agency: 'IRCC (Immigration, Refugees and Citizenship Canada)',
      docIssued: 'Amended PR Card (IMM 5444) or Citizenship Certificate',
      timeframe: '3 to 6 weeks (urgent processing available with travel proof)',
      notes: 'Must provide certified copy of provincial Change of Name Certificate.'
    },
    {
      stage: 3,
      agency: 'Service Canada',
      docIssued: 'Updated Social Insurance Number (SIN) Confirmation',
      timeframe: 'Same-day in person',
      notes: 'SIN number remains identical; legal name record in federal registry is harmonized.'
    },
    {
      stage: 4,
      agency: 'Canada Revenue Agency (CRA)',
      docIssued: 'CRA Profile Synchronization',
      timeframe: 'Automatic via Service Canada or 24-48 hours via My Account',
      notes: 'CRITICAL: Tax refund and CCB benefits freeze if CRA name does not match Service Canada.'
    },
    {
      stage: 5,
      agency: 'Provincial Health Card & Driver\'s Licence (e.g. ServiceOntario / ICBC)',
      docIssued: 'New Photo Health Card & Driver\'s Licence',
      timeframe: '2 to 3 weeks by mail',
      notes: 'Requires primary identification (amended PR card + Change of Name certificate).'
    },
    {
      stage: 6,
      agency: 'Retail Banks & Credit Reporting Agencies (Equifax / TransUnion)',
      docIssued: 'Harmonized Credit Profile & Bank Records',
      timeframe: '30 days',
      notes: 'Submit formal dual-bureau dispute with new ID to merge fragmented credit history.'
    }
  ];

  statutoryAdvisories.push(
    'The "Blank Surname" Bureaucratic Glitch: Under IRCC operational bulletin, when a single name is provided, IRCC assigns the name to the Last Name field. This causes retail banks and credit bureaus to flag files as incomplete. A provincial name change or consular split resolves this permanently.',
    'Bank Act Section 627.17 Identification Rights: Banks cannot arbitrarily refuse to open a personal retail deposit account simply because of an unhyphenated name or single name, provided you present two acceptable pieces of government identification.',
    'Do Not Travel Overseas Mid-Process: If you apply for a legal name change, DO NOT book international flights under your old name once your Canadian PR card or passport is reissued in your new name; airline passenger manifests must match passport machine-readable zones exactly.',
    'RCMP Fingerprinting Mandate in BC/AB: Unlike Ontario, both British Columbia and Alberta statutorily mandate electronic fingerprinting through an accredited agency to prevent individuals with criminal records from evading justice through name changes.'
  );

  return {
    asOf: new Date().toISOString().slice(0, 10),
    discrepancyType: normDiscrepancy,
    currentStatusInCanada: normStatus,
    residenceProvince: normProvince,
    monthsLivedInProvince: monthsInProv,
    isProvincialNameChangeEligible,
    resolutionVerdict: violations.length > 0 ? 'CONDITIONAL_ACTION_REQUIRED' : 'STATUTORY_REMEDY_AVAILABLE',
    summaryHeadline,
    provincialStatute: provRules.statute,
    provincialFeeCad: provRules.statutoryFeeCad,
    minResidencyMonthsRequired: provRules.minResidencyMonths,
    requiresRcmpFingerprinting: provRules.requiresFingerprinting,
    statutoryViolations: violations,
    actionChecklist,
    governmentCascadeRoadmap,
    statutoryAdvisories,
    statutoryAuthority: `${provRules.statute} & IRPR s. 65`
  };
}
