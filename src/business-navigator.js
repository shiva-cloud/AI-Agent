// src/business-navigator.js
// Canadian Newcomer Small Business, Incorporation vs Sole Proprietorship & GST/HST Engine.
// Audits immigration authority to operate a business, the CRA $30,000 small supplier threshold,
// the Personal Services Business (PSB) tax trap, and corporate director residency mandates under:
// - Immigration and Refugee Protection Regulations (IRPR ss. 196 & 200: Closed permit work ban)
// - Excise Tax Act (R.S.C., 1985, c. E-15, ss. 240 & 227: GST/HST registration & Quick Method)
// - Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.), ss. 125(1) & 125(7): Small Business Deduction vs PSB trap)
// - Ontario Business Corporations Act (R.S.O. 1990, c. B.16, Bill 213: Repeal of director residency)
// - Canada Business Corporations Act (R.S.C., 1985, c. C-44).
// Pure ES module with zero npm runtime dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const CRA_BUSINESS_STATUTORY_CONSTANTS = {
  GST_HST_SMALL_SUPPLIER_THRESHOLD_CAD: 30000, // Mandatory registration upon exceeding in 4 quarters
  GST_HST_REGISTRATION_WINDOW_DAYS: 29, // 29 days from date of first exceeding supply
  SMALL_BUSINESS_DEDUCTION_LIMIT_CAD: 500000, // 9% federal corporate rate up to $500k active income
  FEDERAL_SMALL_BUSINESS_RATE: 0.09,
  PSB_FEDERAL_PENALTY_RATE: 0.05, // 5% additional tax under ITA s. 123.5 for Personal Services Businesses
  QUICK_METHOD_REVENUE_CAP_CAD: 400000, // Excise Tax Act s. 227
  CPP_SELF_EMPLOYED_MAX_CAD_2025: 7999 // Both employee + employer portions (approx 11.9% on insurable earnings)
};

export const PROVINCIAL_CORPORATE_STANDARDS = {
  ON: {
    province: 'Ontario',
    corporateStatute: 'Ontario Business Corporations Act (OBCA, R.S.O. 1990, c. B.16)',
    provincialSmallBusinessRate: 0.032,
    combinedSmallBusinessRate: 0.122, // 9% fed + 3.2% ON = 12.2%
    combinedPsbRate: 0.445, // 38% general + 5% PSB penalty + 11.5% ON - 10% abatement = ~44.5%
    hstRate: 0.13, // 13% HST
    quickMethodRemittanceRate: 0.088, // 8.8% remittance on GST/HST collected for service businesses
    requiresCanadianResidentDirector: false // Repealed in 2021 by Bill 213
  },
  BC: {
    province: 'British Columbia',
    corporateStatute: 'Business Corporations Act (BCBCA, SBC 2002, c. 57)',
    provincialSmallBusinessRate: 0.020,
    combinedSmallBusinessRate: 0.110, // 9% fed + 2% BC = 11.0%
    combinedPsbRate: 0.450,
    hstRate: 0.05, // 5% GST (PST 7% handled separately)
    quickMethodRemittanceRate: 0.036,
    requiresCanadianResidentDirector: false
  },
  AB: {
    province: 'Alberta',
    corporateStatute: 'Business Corporations Act (ABCA, RSA 2000, c. B-9)',
    provincialSmallBusinessRate: 0.020,
    combinedSmallBusinessRate: 0.110, // 9% fed + 2% AB = 11.0%
    combinedPsbRate: 0.410,
    hstRate: 0.05, // 5% GST only (no provincial sales tax)
    quickMethodRemittanceRate: 0.036,
    requiresCanadianResidentDirector: false
  },
  QC: {
    province: 'Quebec',
    corporateStatute: 'Business Corporations Act (CQLR c. S-31.1)',
    provincialSmallBusinessRate: 0.032,
    combinedSmallBusinessRate: 0.122,
    combinedPsbRate: 0.445,
    hstRate: 0.05, // GST 5% + QST 9.975%
    quickMethodRemittanceRate: 0.036,
    requiresCanadianResidentDirector: false
  },
  OTHER: {
    province: 'Other Province / Federal Jurisdiction',
    corporateStatute: 'Canada Business Corporations Act (CBCA, R.S.C., 1985, c. C-44)',
    provincialSmallBusinessRate: 0.030,
    combinedSmallBusinessRate: 0.120,
    combinedPsbRate: 0.440,
    hstRate: 0.13,
    quickMethodRemittanceRate: 0.088,
    requiresCanadianResidentDirector: false
  }
};

export function evaluateBusinessStructure(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Business Owner',
    businessName = 'Business Enterprise',
    province = 'ON',
    immigrationStatus = 'permanent_resident', // 'permanent_resident', 'work_permit_holder', 'study_permit_holder', 'canadian_citizen'
    workPermitType = 'none', // 'open_work_permit', 'closed_employer_specific', 'none'
    projectedAnnualRevenueCad = 120000,
    annualBusinessExpensesCad = 15000,
    personalLivingExpensesCad = 55000,
    clientCount = 2,
    subcontractorHiringPermitted = true,
    providesOwnEquipmentAndTools = true,
    hasRiskOfFinancialLoss = true,
    industryType = 'tech_consulting',
    assessmentDate
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Business Owner', 100);
  const cleanBusinessName = boundedText(businessName, 'Business Enterprise', 120);
  const safeDate = safeIsoDate(assessmentDate);

  const normProv = boundedText(province, 'ON', 10).toUpperCase().trim();
  const provRules = PROVINCIAL_CORPORATE_STANDARDS[normProv] || PROVINCIAL_CORPORATE_STANDARDS.OTHER;
  const normStatus = boundedText(immigrationStatus, 'permanent_resident', 40).toLowerCase().trim();
  const normPermit = boundedText(workPermitType, 'none', 40).toLowerCase().trim();
  const normIndustry = boundedText(industryType, 'tech_consulting', 60);

  const revenue = Math.max(0, Math.min(100000000, Number(projectedAnnualRevenueCad) || 0));
  const expenses = Math.max(0, Math.min(100000000, Number(annualBusinessExpensesCad) || 0));
  const livingCost = Math.max(0, Math.min(100000000, Number(personalLivingExpensesCad) || 0));
  const clients = Math.max(1, Math.min(10000, Number(clientCount) || 1));

  const statutoryViolations = [];
  const statutoryAdvisories = [];
  const actionChecklist = [];

  // 1. Immigration Authority Audit under IRPR ss. 196 & 200
  let isLegallyAuthorizedToOperate = true;
  let immigrationFinding = 'Fully authorized to register sole proprietorships or incorporate in Canada.';

  if (normStatus === 'work_permit_holder') {
    if (normPermit === 'closed_employer_specific') {
      isLegallyAuthorizedToOperate = false;
      immigrationFinding = 'CRITICAL VIOLATION: Closed work permit holders are strictly prohibited from engaging in business, freelancing, or self-employment outside their named employer under IRPR s. 196 & s. 200. Operating an independent business risks work permit cancellation, employer compliance audit, and removal from Canada under IRPA s. 41.';
      statutoryViolations.push({
        rule: 'Closed Work Permit Business Ban',
        statute: 'IRPR ss. 196 & 200 & IRPA s. 41',
        legalFinding: immigrationFinding
      });
    } else {
      immigrationFinding = 'Authorized: Open work permit holders (PGWP, SOWP, VWOWP) have unrestricted rights to incorporate or operate independent businesses in Canada.';
    }
  } else if (normStatus === 'visitor') {
    isLegallyAuthorizedToOperate = false;
    immigrationFinding = 'Not authorized: visitors cannot run a business that sells work or services in the Canadian labour market. You need a work permit or permanent residence first; limited business-visitor activities (such as meetings) are different from operating a business.';
    statutoryViolations.push({
      rule: 'Visitors cannot work or operate a business in Canada',
      statute: 'IRPR ss. 183 & 196',
      legalFinding: immigrationFinding
    });
  } else if (normStatus === 'study_permit_holder') {
    statutoryAdvisories.push(
      `Study Permit Limitation: International students may engage in self-employment/freelancing only within their statutory 24-hour weekly work cap under IRPR s. 186(v). Any business activity exceeding 24 hours per week constitutes unauthorized work and disqualifies you from a Post-Graduation Work Permit (PGWP).`
    );
  }

  // 2. GST/HST Registration & The $30,000 Small Supplier Threshold
  const isGstRegistrationMandatory = revenue >= CRA_BUSINESS_STATUTORY_CONSTANTS.GST_HST_SMALL_SUPPLIER_THRESHOLD_CAD;
  const gstRate = provRules.hstRate;
  const estimatedGstHstCollected = Number((revenue * gstRate).toFixed(2));

  // Quick Method calculation (Excise Tax Act s. 227)
  const isQuickMethodEligible = revenue > 0 && revenue <= CRA_BUSINESS_STATUTORY_CONSTANTS.QUICK_METHOD_REVENUE_CAP_CAD;
  let quickMethodRemittanceCad = 0;
  let quickMethodTaxProfitCad = 0;

  if (isQuickMethodEligible && isGstRegistrationMandatory) {
    // Under Quick Method, business remits a reduced rate and keeps the difference as income
    quickMethodRemittanceCad = Number((revenue * (1 + gstRate) * provRules.quickMethodRemittanceRate).toFixed(2));
    const first30kCredit = Math.min(300, revenue * 0.01); // 1% credit on first $30k
    quickMethodRemittanceCad = Math.max(0, quickMethodRemittanceCad - first30kCredit);
    quickMethodTaxProfitCad = Number((estimatedGstHstCollected - quickMethodRemittanceCad).toFixed(2));
  }

  if (isGstRegistrationMandatory) {
    statutoryAdvisories.push(
      `Mandatory GST/HST Registration: Your projected revenue ($${revenue.toLocaleString()} CAD) exceeds the CRA $30,000 threshold (Excise Tax Act s. 240). You must register for a CRA GST/HST Business Number within 29 days of your first exceeding transaction.`
    );
  } else {
    statutoryAdvisories.push(
      `Voluntary GST/HST Registration: Even under $30,000 CAD, voluntary registration allows claiming full Input Tax Credits (ITCs) on business expenses (equipment, laptop, cell phone, software licenses).`
    );
  }

  // 3. Personal Services Business (PSB) Risk Audit (Income Tax Act s. 125(7))
  // Factors: Single client, no subcontractors, no own tools, no risk of loss
  let psbRiskScore = 0;
  if (clients === 1) psbRiskScore += 3;
  if (!subcontractorHiringPermitted) psbRiskScore += 2;
  if (!providesOwnEquipmentAndTools) psbRiskScore += 2;
  if (!hasRiskOfFinancialLoss) psbRiskScore += 2;

  let psbRiskLevel = 'LOW';
  let psbVerdict = 'Legitimate Active Small Business Corporation (Eligible for 9% Small Business Deduction)';
  const psbConsequences = [];
  const psbMitigationSteps = [];

  if (psbRiskScore >= 5) {
    psbRiskLevel = 'HIGH_RISK_PSB_TRAP';
    psbVerdict = 'CRITICAL RISK: Classified as a Personal Services Business (PSB / "Incorporated Employee") under ITA s. 125(7).';
    psbConsequences.push(
      'Loss of 9% Small Business Deduction (corporate tax rate spikes from 12.2% to 44.5% in Ontario)',
      '5% additional federal penalty tax under ITA s. 123.5',
      'Disallowance of ALL business expense deductions (home office, vehicle, equipment, phone) except salary paid to the owner-operator'
    );
    psbMitigationSteps.push(
      'Contract with at least 2 distinct corporate clients simultaneously',
      'Ensure written master services agreement explicitly includes a Right of Substitution (ability to hire subcontractors)',
      'Invoice based on project milestones or deliverables rather than fixed hourly wages with set employer hours'
    );
    statutoryViolations.push({
      rule: 'Personal Services Business (PSB) Tax Trap',
      statute: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.), s. 125(7))',
      legalFinding: `Working exclusively for 1 client with no subcontractors and client-provided equipment triggers CRA Personal Services Business reclassification under common law precedents (Sagaz Industries & Wiebe Door Services).`
    });
  } else if (psbRiskScore >= 3) {
    psbRiskLevel = 'MODERATE';
    psbVerdict = 'Moderate PSB Risk: Ensure written contracts explicitly recognize independent contractor status.';
    psbMitigationSteps.push('Provide your own hardware, software licenses, and avoid client-mandated core working hours.');
  }

  // 4. Sole Proprietorship vs Incorporation Financial Comparison
  const netBusinessIncome = Math.max(0, revenue - expenses);

  // Sole Proprietorship Taxation (Personal Marginal Rates + Self-Employed CPP)
  // Progressive tax approximation (Fed + Prov ON): 0-15k: 0%, 15-55k: 20%, 55-110k: 30%, 110-170k: 43%, 170k+: 48%
  let solePropPersonalTax = 0;
  if (netBusinessIncome > 170000) solePropPersonalTax += (netBusinessIncome - 170000) * 0.48 + 41500;
  else if (netBusinessIncome > 110000) solePropPersonalTax += (netBusinessIncome - 110000) * 0.43 + 15700;
  else if (netBusinessIncome > 55000) solePropPersonalTax += (netBusinessIncome - 55000) * 0.30 + 8000;
  else if (netBusinessIncome > 15000) solePropPersonalTax += (netBusinessIncome - 15000) * 0.20;

  const solePropCppCad = Math.min(CRA_BUSINESS_STATUTORY_CONSTANTS.CPP_SELF_EMPLOYED_MAX_CAD_2025, Math.max(0, (netBusinessIncome - 3500) * 0.119));
  const solePropTotalTaxAndCpp = solePropPersonalTax + solePropCppCad;
  const solePropAfterTaxCash = Math.max(0, netBusinessIncome - solePropTotalTaxAndCpp);

  // Corporation Taxation (Small Business Deduction Rate)
  const corpTaxRate = (psbRiskLevel === 'HIGH_RISK_PSB_TRAP') ? provRules.combinedPsbRate : provRules.combinedSmallBusinessRate;
  const corporateTaxPaid = netBusinessIncome * corpTaxRate;
  const corporateRetainedEarnings = Math.max(0, netBusinessIncome - corporateTaxPaid);

  // Deferral analysis: If living expenses are less than net business income, corporation shelters difference
  const personalSalaryDrawn = Math.min(netBusinessIncome, livingCost);
  const retainedShelteredInsideCorp = Math.max(0, netBusinessIncome - personalSalaryDrawn);
  const immediateTaxSavingsOrDeferralCad = (netBusinessIncome > 90000 && psbRiskLevel !== 'HIGH_RISK_PSB_TRAP')
    ? Math.max(0, Number((solePropTotalTaxAndCpp - (corporateTaxPaid + (personalSalaryDrawn * 0.20))).toFixed(2)))
    : 0;

  const recommendedStructure = (netBusinessIncome >= 90000 && psbRiskLevel !== 'HIGH_RISK_PSB_TRAP' && isLegallyAuthorizedToOperate)
    ? 'INCORPORATION_RECOMMENDED'
    : 'SOLE_PROPRIETORSHIP_RECOMMENDED';

  // 5. Action Checklist
  actionChecklist.push(
    {
      stepNumber: 1,
      agency: 'Immigration / Employer',
      action: 'Verify work permit stream permits independent business operation (Open Work Permit vs Closed LMIA restrictions under IRPR s. 196).',
      timing: 'Prior to business launch'
    },
    {
      stepNumber: 2,
      agency: 'CRA (Canada Revenue Agency)',
      action: 'Register for a federal 9-digit Business Number (BN) and program accounts (GST/HST RT0001, Payroll RP0001 if drawing salary).',
      timing: 'Immediately upon reaching $30,000 or upon incorporation'
    },
    {
      stepNumber: 3,
      agency: 'Provincial Corporate Registry',
      action: `File Articles of Incorporation under ${provRules.corporateStatute}. Director residency mandates have been abolished in Ontario (Bill 213).`,
      timing: 'Within 1-2 weeks of reaching $90k run rate'
    },
    {
      stepNumber: 4,
      agency: 'Chartered Canadian Bank',
      action: 'Open a dedicated Canadian commercial business checking account. Do not commingle personal and corporate funds under Bank Act KYC standards.',
      timing: 'Upon obtaining Certificate of Incorporation'
    }
  );

  return {
    applicantName: cleanApplicantName,
    businessName: cleanBusinessName,
    assessmentDate: safeDate,
    province: normProv,
    corporateStatute: provRules.corporateStatute,
    immigrationStatus: normStatus,
    workPermitType: normPermit,
    industryType: normIndustry,
    recommendedStructure,
    immigrationCompliance: {
      isLegallyAuthorizedToOperate,
      severity: isLegallyAuthorizedToOperate ? 'AUTHORIZED' : 'STATUTORILY_PROHIBITED',
      finding: immigrationFinding,
      statute: 'IRPR ss. 196 & 200'
    },
    gstHstAudit: {
      isRegistrationMandatory: isGstRegistrationMandatory,
      smallSupplierThresholdCad: CRA_BUSINESS_STATUTORY_CONSTANTS.GST_HST_SMALL_SUPPLIER_THRESHOLD_CAD,
      projectedRevenueCad: revenue,
      estimatedGstHstCollectedCad: estimatedGstHstCollected,
      quickMethodEligible: isQuickMethodEligible,
      quickMethodRemittanceCad,
      quickMethodTaxProfitCad,
      statutoryWindowDays: CRA_BUSINESS_STATUTORY_CONSTANTS.GST_HST_REGISTRATION_WINDOW_DAYS
    },
    psbRiskAudit: {
      psbRiskLevel,
      verdict: psbVerdict,
      effectiveCorporateTaxRate: Number((corpTaxRate * 100).toFixed(1)),
      consequences: psbConsequences,
      mitigationSteps: psbMitigationSteps
    },
    taxComparison: {
      netBusinessIncomeCad: netBusinessIncome,
      soleProprietorship: {
        totalTaxAndCppCad: Number(solePropTotalTaxAndCpp.toFixed(2)),
        afterTaxCashCad: Number(solePropAfterTaxCash.toFixed(2)),
        effectiveTaxRatePct: netBusinessIncome > 0 ? Number(((solePropTotalTaxAndCpp / netBusinessIncome) * 100).toFixed(1)) : 0
      },
      corporation: {
        corporateTaxPaidCad: Number(corporateTaxPaid.toFixed(2)),
        corporateRetainedEarningsCad: Number(corporateRetainedEarnings.toFixed(2)),
        immediateTaxSavingsOrDeferralCad,
        retainedShelteredInsideCorpCad: Number(retainedShelteredInsideCorp.toFixed(2))
      }
    },
    corporateDirectorResidency: {
      requiresCanadianResidentDirector: provRules.requiresCanadianResidentDirector,
      statute: provRules.corporateStatute
    },
    statutoryViolations,
    actionChecklist,
    statutoryAdvisories,
    statutoryAuthority: 'Excise Tax Act s. 240, Income Tax Act s. 125 & IRPR ss. 196/200'
  };
}
