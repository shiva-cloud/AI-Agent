// src/medical-admissibility.js
// Canadian Immigration Medical Inadmissibility & Excessive Demand Diagnostic Engine.
// Evaluates medical admissibility under the Immigration and Refugee Protection Act (S.C. 2001, c. 27),
// sections 38(1)(a) (danger to public health), 38(1)(b) (danger to public safety),
// and 38(1)(c) (excessive demand on health or social services),
// enforces statutory family class exemptions under IRPA s. 38(2),
// applies the statutory 3x per-capita cost threshold ($26,304/yr or $131,520 over 5 years),
// and generates an Individualized Mitigation Plan (IMP) under Hilewitz v. Canada (2005 SCC 57)
// for Procedural Fairness Letter (PFL) response within the mandatory 90-day window.
// Pure ES module with zero npm dependencies.
import {boundedText} from './text-input.js';

function safeIsoDate(val, fallback = '2026-10-31') {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const d = new Date(val.trim() + 'T00:00:00Z');
    if (!Number.isNaN(d.getTime())) return val.trim();
  }
  return fallback;
}

export const ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD = 26304; // 3x Canadian per-capita average
export const FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD = 131520; // 26,304 * 5

export const EXEMPT_IMMIGRATION_CATEGORIES = [
  'spousal_sponsorship',
  'dependent_child',
  'protected_person_refugee',
  'convention_refugee'
];

export function evaluateMedicalAdmissibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    immigrationStream = 'express_entry', // 'express_entry', 'pnp', 'spousal_sponsorship', 'dependent_child', 'protected_person_refugee', 'temporary_resident'
    hasDangerToPublicHealth = false, // Active untreated infectious TB, untreated syphilis (IRPA s. 38(1)(a))
    hasDangerToPublicSafety = false, // Impulsive antisocial behavior, violent psychosis, substance-induced violence (IRPA s. 38(1)(b))
    conditionName = 'Chronic Condition',
    estimatedAnnualMedicationCostCad = 4500,
    estimatedAnnualHospitalizationCostCad = 0,
    estimatedAnnualSocialServicesCostCad = 0,
    hasPrivateInsuranceCoverage = true,
    privateInsuranceAnnualCoverageCad = 5000,
    availableLiquidFundsCad = 35000,
    receivedProceduralFairnessLetter = false,
    pflDateReceived = null,
    applicantName = 'Applicant',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeApplicantName = boundedText(applicantName, 'Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const condName = boundedText(conditionName, 'Chronic Condition', 120);
  const normStream = boundedText(immigrationStream, 'express_entry', 50).toLowerCase();
  const isFamilyOrRefugeeExempt = EXEMPT_IMMIGRATION_CATEGORIES.includes(normStream);
  const isTemporaryResident = normStream === 'temporary_resident';

  // Total gross estimated annual cost to Canadian public healthcare
  const grossMedication = Math.max(0, Math.min(10000000, Number(estimatedAnnualMedicationCostCad) || 0));
  const grossHospital = Math.max(0, Math.min(10000000, Number(estimatedAnnualHospitalizationCostCad) || 0));
  const grossSocial = Math.max(0, Math.min(10000000, Number(estimatedAnnualSocialServicesCostCad) || 0));
  const totalGrossAnnualCostCad = grossMedication + grossHospital + grossSocial;
  const totalGrossFiveYearCostCad = totalGrossAnnualCostCad * 5;

  // 1. Danger to Public Health & Safety Audit (IRPA s. 38(1)(a) & (b))
  // These are NOT exempt under s. 38(2) and cannot be cured by money
  const publicDangerIssues = [];
  if (hasDangerToPublicHealth) {
    publicDangerIssues.push({
      ground: 'Danger to Public Health (IRPA s. 38(1)(a))',
      description: 'Active infectious conditions (e.g. infectious tuberculosis). Standard remedy: mandatory medical hold & DOTS treatment until non-infectious sputum cultures obtained.'
    });
  }
  if (hasDangerToPublicSafety) {
    publicDangerIssues.push({
      ground: 'Danger to Public Safety (IRPA s. 38(1)(b))',
      description: 'Documented behavioral conditions associated with sudden incapacity or violence. Requires comprehensive psychiatric forensic evaluation.'
    });
  }

  // 2. Excessive Demand Audit (IRPA s. 38(1)(c))
  const exceedsStatutoryThreshold = totalGrossAnnualCostCad > ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD;
  const costExceededCad = Math.max(0, totalGrossAnnualCostCad - ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD);

  // 3. Mitigation Feasibility under Hilewitz v. Canada (SCC 2005)
  // Applicants can mitigate outpatient medication costs, but generally cannot mitigate publicly funded physician/hospital services or waitlist demands.
  const annualInsuranceCredit = hasPrivateInsuranceCoverage ? Math.min(grossMedication, Math.max(0, Math.min(10000000, Number(privateInsuranceAnnualCoverageCad) || 0))) : 0;
  const netAnnualPublicCostAfterInsuranceCad = Math.max(0, totalGrossAnnualCostCad - annualInsuranceCredit);
  const netFiveYearPublicCostCad = netAnnualPublicCostAfterInsuranceCad * 5;
  const liquidFunds = Math.max(0, Math.min(100000000, Number(availableLiquidFundsCad) || 0));

  const canMitigateExcessDemand = netAnnualPublicCostAfterInsuranceCad <= ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD ||
    (liquidFunds >= (netFiveYearPublicCostCad - FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD));

  // 4. Procedural Fairness Letter (PFL) 90-Day Deadline Clock
  let daysRemainingToRespond = 90;
  let deadlineDate = null;
  if (receivedProceduralFairnessLetter && pflDateReceived) {
    const safePflDate = safeIsoDate(pflDateReceived, null);
    if (safePflDate) {
      const receivedDate = new Date(safePflDate + 'T00:00:00Z');
      const msPerDay = 1000 * 60 * 60 * 24;
      const now = new Date(safeAssessmentDate + 'T00:00:00Z');
      const daysSincePfl = Math.floor((now.getTime() - receivedDate.getTime()) / msPerDay);
      daysRemainingToRespond = Math.max(0, 90 - daysSincePfl);
      const deadlineObj = new Date(receivedDate.getTime() + (90 * msPerDay));
      deadlineDate = deadlineObj.toISOString().slice(0, 10);
    }
  }

  // 5. Final Admissibility Determination
  let determination = 'ADMISSIBLE';
  let summaryHeadline = '';

  if (publicDangerIssues.length > 0) {
    determination = 'INADMISSIBLE_PUBLIC_DANGER';
    summaryHeadline = 'Inadmissible under IRPA s. 38(1)(a)/(b) for danger to public health or safety. Requires clinical cure or psychiatric stabilization; monetary mitigation is unavailable.';
  } else if (isFamilyOrRefugeeExempt) {
    determination = 'STATUTORILY_EXEMPT';
    summaryHeadline = `Exempt from the excessive-demand rule under IRPA s. 38(2). As a ${normStream.replace(/_/g, ' ')}, the expected cost of your care cannot be used to refuse your application. Danger to public health or safety is assessed separately.`;
  } else if (isTemporaryResident) {
    determination = 'TEMPORARY_RESIDENT_EXEMPT';
    summaryHeadline = 'Temporary residents are generally exempt from excessive demand under IRPA s. 38(1)(c), provided they do not require immediate provincial hospitalization upon arrival.';
  } else if (!exceedsStatutoryThreshold) {
    determination = 'ADMISSIBLE_BELOW_THRESHOLD';
    summaryHeadline = `Admissible. Estimated annual medical cost ($${totalGrossAnnualCostCad.toLocaleString()} CAD) is well below the statutory excessive demand threshold ($${ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD.toLocaleString()} CAD/yr).`;
  } else if (canMitigateExcessDemand) {
    determination = 'PFL_RESPONSE_MITIGATION_REQUIRED';
    summaryHeadline = `Gross cost ($${totalGrossAnnualCostCad.toLocaleString()} CAD/yr) exceeds statutory threshold, but is fully mitigable under Hilewitz v. Canada via an Individualized Mitigation Plan (IMP) and private insurance.`;
  } else {
    determination = 'HIGH_RISK_EXCESSIVE_DEMAND';
    summaryHeadline = `High Risk: Estimated costs exceed statutory threshold ($${ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD.toLocaleString()} CAD/yr) without sufficient demonstrated private insurance or liquid capital to fund outpatient treatment over 5 years.`;
  }

  // 6. Draft Individualized Mitigation Plan (IMP) Pleading
  const individualizedMitigationPlanDraft = `SUBMISSION IN RESPONSE TO PROCEDURAL FAIRNESS LETTER
REGARDING MEDICAL ADMISSIBILITY (IRPA SECTION 38(1)(c))
Date: ${new Date().toISOString().slice(0, 10)}
To: Medical Officer / Immigration Officer, Migration Health Branch, IRCC
Applicant: Economic Class Principal Applicant / Dependent
Subject: Individualized Mitigation Plan (IMP) for ${condName}

1. JURISDICTION & GOVERNING PRINCIPLES:
Pursuant to the Supreme Court of Canada's landmark decisions in Hilewitz v. Canada (MCI) and De Guan v. Canada (MCI) [2005 SCC 57], an assessment of excessive demand under Section 38(1)(c) of the Immigration and Refugee Protection Act MUST take into account an applicant's ability and intention to pay for their own outpatient health and social services. A purely generic or statistical assessment of the medical condition without considering individualized mitigation constitutes an error of law.

2. STATUTORY COST ANALYSIS:
- Annual Cost Threshold (3x Canadian average per capita): $${ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD.toLocaleString()} CAD / year
- Estimated Gross Annual Cost of Condition: $${totalGrossAnnualCostCad.toLocaleString()} CAD / year
- Demonstrable Private Employer Insurance Coverage: $${annualInsuranceCredit.toLocaleString()} CAD / year
- Net Annual Cost to Public Health System: $${netAnnualPublicCostAfterInsuranceCad.toLocaleString()} CAD / year

3. MITIGATION COMMITMENT & PROOF OF FINANCIAL CAPACITY:
The applicant hereby tenders a legally binding Declaration of Ability and Intent to privately absorb all outpatient prescription medication and non-hospital costs for ${condName}:
a) The applicant has secured comprehensive private supplementary medical insurance providing up to $${privateInsuranceAnnualCoverageCad.toLocaleString()} CAD annually.
b) The applicant possesses liquid unencumbered personal financial reserves of $${availableLiquidFundsCad.toLocaleString()} CAD in Canadian/convertible funds to bridge any copayments or unexpected therapeutic changes.
c) The medication required is available for private retail purchase and does not displace any Canadian citizen or permanent resident from a statutory hospital waitlist.

4. CONCLUSION:
In light of the binding Individualized Mitigation Plan and verified financial capacity, the applicant's condition does not constitute an excessive demand on Canadian health or social services. We respectfully request that the Medical Officer update the applicant's medical assessment to M2 (Admissible).`;

  const statutoryAdvisories = [
    'Family Class Exemption (IRPA s. 38(2)): Spouses, common-law partners, dependent children, and Convention refugees can NEVER be refused for excessive demand on health or social services, regardless of medical costs.',
    '2018/2021 Policy Modernization: IRCC policy explicitly removed special education services, personal support services, and social/vocational rehabilitation from the definition of social services to protect families with children with disabilities.',
    'Strict 90-Day PFL Deadline: If IRCC issues a Procedural Fairness Letter regarding medical inadmissibility, you must deliver your complete Individualized Mitigation Plan within 90 days. Failure to respond results in automatic refusal.',
    'Hilewitz v. Canada (2005 SCC 57): The Supreme Court of Canada ruled that IRCC cannot assess medical inadmissibility using generic formulas—they are legally required to evaluate an applicant’s actual financial capacity and willingness to pay for their own prescription drugs.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    immigrationStream: normStream,
    conditionName: condName,
    determination,
    summaryHeadline,
    isStatutorilyExempt: isFamilyOrRefugeeExempt,
    statutoryExemptionBasis: isFamilyOrRefugeeExempt ? 'IRPA s. 38(2)' : 'N/A',
    publicDangerAssessment: {
      hasIssues: publicDangerIssues.length > 0,
      issues: publicDangerIssues
    },
    statutoryCostAudit: {
      annualThresholdCad: ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD,
      fiveYearThresholdCad: FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD,
      estimatedGrossAnnualCostCad: totalGrossAnnualCostCad,
      estimatedGrossFiveYearCostCad: totalGrossFiveYearCostCad,
      exceedsStatutoryThreshold,
      costExceededAnnualCad: costExceededCad
    },
    mitigationFeasibility: {
      canMitigateExcessDemand,
      annualPrivateInsuranceOffsetCad: annualInsuranceCredit,
      netAnnualPublicCostCad: netAnnualPublicCostAfterInsuranceCad,
      availableLiquidFundsCad: Number(availableLiquidFundsCad) || 0,
      mitigationAuthority: 'Hilewitz v. Canada (MCI), 2005 SCC 57'
    },
    proceduralFairnessClock: {
      receivedPfl: Boolean(receivedProceduralFairnessLetter),
      daysRemainingToRespond,
      statutoryDeadlineDate: deadlineDate,
      actionRequired: receivedProceduralFairnessLetter ? 'Submit Individualized Mitigation Plan (IMP) within 90 days' : 'None'
    },
    individualizedMitigationPlanDraft,
    statutoryAdvisories,
    statutoryAuthority: 'Immigration and Refugee Protection Act (S.C. 2001, c. 27, s. 38)'
  };
}
