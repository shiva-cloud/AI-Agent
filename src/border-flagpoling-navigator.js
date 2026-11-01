/**
 * Northstar — CBSA Port-of-Entry Flagpoling & Land Border Diagnostic Engine
 *
 * Implements statutory and policy evaluation for border flagpoling under:
 * - Immigration and Refugee Protection Act (IRPA), SC 2001, c. 27, ss. 11, 18, 20, 22(2), 40, 41
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, ss. 183(5), 186, 198, 214
 * - IRCC & CBSA Ministerial Policy on Flagpoling Restrictions (effective June 21, 2024 PGWP Border Ban)
 * - US Customs and Border Protection (CBP) Form I-160A Administrative Refusal Impact & IRPA s. 40 Duty of Candour
 *
 * Pure ES module with zero npm runtime dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CBSA_PORTS = {
  rainbow_bridge: {
    name: 'Rainbow Bridge (Niagara Falls, ON)',
    province: 'ON',
    flagpolingDays: ['Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '08:00 - 24:00',
    dailyQuotaEnforced: true,
    estimatedQuota: '24-36 applicants/day'
  },
  peace_bridge: {
    name: 'Peace Bridge (Fort Erie, ON)',
    province: 'ON',
    flagpolingDays: ['Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '08:00 - 24:00',
    dailyQuotaEnforced: true,
    estimatedQuota: '20-30 applicants/day'
  },
  queenston_lewiston: {
    name: 'Queenston-Lewiston Bridge (Niagara-on-the-Lake, ON)',
    province: 'ON',
    flagpolingDays: ['Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '08:00 - 24:00',
    dailyQuotaEnforced: true,
    estimatedQuota: '20-30 applicants/day'
  },
  pacific_highway_surrey: {
    name: 'Pacific Highway / Route 15 (Surrey, BC)',
    province: 'BC',
    flagpolingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '08:30 - 16:30',
    dailyQuotaEnforced: true,
    estimatedQuota: '15-25 applicants/day'
  },
  peace_arch_douglas: {
    name: 'Peace Arch / Douglas (Surrey, BC)',
    province: 'BC',
    flagpolingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '08:30 - 16:30',
    dailyQuotaEnforced: true,
    estimatedQuota: '15-25 applicants/day'
  },
  lacolle_quebec: {
    name: 'Saint-Bernard-de-Lacolle / Route 15 (QC)',
    province: 'QC',
    flagpolingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: '09:00 - 17:00',
    dailyQuotaEnforced: true,
    estimatedQuota: '10-20 applicants/day'
  },
  other: {
    name: 'Other Land Border Port of Entry',
    province: 'CA',
    flagpolingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    flagpolingHours: 'Operating hours vary; non-peak weekdays recommended',
    dailyQuotaEnforced: true,
    estimatedQuota: 'Varies by port discretion'
  }
};

export const TRV_EXEMPT_COUNTRIES = new Set([
  'US', 'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'IE', 'CH',
  'AU', 'NZ', 'JP', 'KR', 'SG', 'NO', 'SE', 'DK', 'FI', 'AT',
  'PT', 'GR', 'PL', 'CZ', 'HU', 'IL', 'TW'
]);

/**
 * Diagnostic evaluation of border flagpoling feasibility, statutory bans, and immigration risks.
 */
export function evaluateFlagpolingFeasibility({
  permitCategory = 'pgwp',
  countryOfCitizenship = 'IN',
  currentStatusInCanada = 'maintained_status',
  portOfEntry = 'rainbow_bridge',
  dayOfWeek = 'Wednesday',
  hasJobOffer = true,
  hasApprovedLmia = false,
  isLmiaExempt = false,
  hasMedicalExamIfRequired = true,
  hasValidUsVisa = false,
  hasPriorRefusals = false,
  applicantName = 'Applicant',
  assessmentDate = '2026-10-31'
} = {}) {
  const cleanApplicant = boundedText(applicantName, 'Applicant', 120);
  const cleanDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safePermit = boundedText(permitCategory, 'pgwp', 50).toLowerCase();
  const rawCountry = boundedText(countryOfCitizenship, 'IN', 10).toUpperCase();
  const safeStatus = boundedText(currentStatusInCanada, 'maintained_status', 50).toLowerCase();
  const safePort = boundedText(portOfEntry, 'rainbow_bridge', 50).toLowerCase();
  const safeDay = boundedText(dayOfWeek, 'Wednesday', 20);

  const normalizedPoE = CBSA_PORTS[safePort] ? safePort : 'other';
  const portInfo = CBSA_PORTS[normalizedPoE];
  const citizenCode = rawCountry || 'IN';
  const isTrvExempt = citizenCode === 'US' || TRV_EXEMPT_COUNTRIES.has(citizenCode);
  const normalizedDay = safeDay ? safeDay.charAt(0).toUpperCase() + safeDay.slice(1).toLowerCase() : 'Wednesday';

  const jobOffer = Boolean(hasJobOffer);
  const approvedLmia = Boolean(hasApprovedLmia);
  const lmiaExempt = Boolean(isLmiaExempt);
  const medicalExam = Boolean(hasMedicalExamIfRequired);
  const validUsVisa = Boolean(hasValidUsVisa);
  const priorRefusals = Boolean(hasPriorRefusals);

  const warnings = [];
  const legalBarriers = [];
  const borderPrepPoints = [];
  const requiredDocuments = [];

  // 1. Mandatory PGWP Ban Evaluation (June 21, 2024 Ministerial Directive)
  let isPgwpBarred = false;
  if (safePermit === 'pgwp') {
    isPgwpBarred = true;
    legalBarriers.push({
      rule: 'IRCC & CBSA Ministerial Policy (Effective June 21, 2024)',
      severity: 'STRICT_BAR',
      description: 'Post-Graduation Work Permit (PGWP) applications are strictly prohibited at all land border ports of entry. Border service officers cannot process PGWP applications for temporary residents flagpoling. You MUST apply online from within Canada via the IRCC Secure Account.'
    });
  }

  // 2. Maintained Status / Loss of Legal Authorization Risk (IRPR s. 183(5))
  let maintainedStatusRisk = false;
  if (safeStatus === 'maintained_status') {
    maintainedStatusRisk = true;
    warnings.push({
      statute: 'IRPR s. 183(5) & s. 186(u)',
      level: 'CRITICAL',
      message: 'Departing Canada to flagpole immediately extinguishes Maintained Status. If the CBSA officer refuses to issue your permit at the border, you will NOT have maintained status to re-enter or work in Canada, and may be issued an Allowed to Leave Canada or an Exclusion Order under IRPA s. 228.'
    });
  } else if (safeStatus === 'status_expired_90_days' || safeStatus === 'out_of_status') {
    legalBarriers.push({
      rule: 'IRPR s. 182 — Restoration of Status Requirement',
      severity: 'STRICT_BAR',
      description: 'Individuals without valid temporary resident status in Canada cannot apply for permits at a land border POE. You must apply for Restoration of Temporary Resident Status from within Canada within 90 days of status expiration.'
    });
  }

  // 3. Port of Entry Work Permit Eligibility (IRPR s. 198)
  let isEligibleAtPoe = false;
  if (!isPgwpBarred && safeStatus !== 'status_expired_90_days' && safeStatus !== 'out_of_status') {
    if (citizenCode === 'US') {
      isEligibleAtPoe = true;
    } else if (isTrvExempt && (approvedLmia || lmiaExempt)) {
      isEligibleAtPoe = true;
    } else if (safePermit === 'pr_landing') {
      isEligibleAtPoe = true;
    } else if (!isTrvExempt) {
      warnings.push({
        statute: 'IRPR s. 198(1)',
        level: 'HIGH',
        message: 'Under IRPR s. 198(1), only foreign nationals who are TRV-exempt (or US lawful permanent residents / US citizens) can apply for a work permit upon arrival at a port of entry. Citizens of visa-requiring countries who do not hold a valid visa or pre-approval generally cannot apply at the border.'
      });
      isEligibleAtPoe = false;
    }
  }

  // 4. US CBP Administrative Refusal & Duty of Candour (IRPA s. 40)
  const usAdministrativeRefusalImpact = {
    formName: 'CBP Form I-160A (Notice of Refusal of Admission / Administrative Refusal)',
    mandatoryDeclaration: 'YES — Must be reported on all future Canadian (IMM 5257 / 5707 / 5669) and global visa applications.',
    misrepresentationConsequence: 'Failure to declare a US administrative refusal constitutes Misrepresentation under IRPA s. 40(1)(a), carrying a mandatory 5-year inadmissibility ban from entering Canada.',
    hasUsVisa: validUsVisa,
    advisory: validUsVisa
      ? 'Having a valid US B1/B2 visa allows formal entry into the US and turnaround without an administrative refusal notice.'
      : 'Without a US visa, US CBP will execute an Administrative Refusal to turn you around to Canadian Customs. You must preserve the CBP Form I-160A slip.'
  };

  // 5. Operating Days & Quota Schedule
  const isOperatingDay = portInfo.flagpolingDays.includes(normalizedDay);
  if (!isOperatingDay) {
    warnings.push({
      statute: 'CBSA Operational Flagpoling Directive',
      level: 'OPERATIONAL_BLOCK',
      message: `${portInfo.name} only processes flagpoling applications on ${portInfo.flagpolingDays.join(', ')}. Flagpoling on ${normalizedDay} will result in immediate refusal and being turned away.`
    });
  }

  // 6. Required Documents Checklist
  if (safePermit === 'pr_landing') {
    requiredDocuments.push(
      'Valid Passport(s) for all family members',
      'Confirmation of Permanent Residence (COPR) document (IMM 5688)',
      'Proof of Settlement Funds (bank statements within 30 days) unless exempt',
      'Proof of Canadian residential address or lease',
      'CBSA Goods to Follow list (Form BSF186A / B4A) if importing personal effects'
    );
  } else if (lmiaExempt) {
    requiredDocuments.push(
      'Valid Passport (valid for intended duration)',
      'LMIA-Exempt Offer of Employment Number (A-number from IRCC Employer Portal)',
      'Proof of $230 Employer Compliance Fee payment receipt',
      'Job Offer Letter specifying NOC/TEER code and wage',
      'Proof of qualifications (Degree, Educational Credential Assessment, CV)',
      'Proof of Upfront Medical Examination (eMedical tracking sheet) if applicable'
    );
  } else if (approvedLmia) {
    requiredDocuments.push(
      'Valid Passport',
      'Copy of ESDC Positive LMIA Decision Letter',
      'Formal Employment Contract signed by both parties',
      'Proof of experience satisfying LMIA requirements (reference letters, pay stubs)',
      'Biometrics collection fee receipt ($85 CAD)'
    );
  }

  // 7. CBSA Border Services Officer (BSO) Examination Questions (IRPA ss. 18, 20)
  borderPrepPoints.push(
    'Dual Intent (IRPA s. 22(2)): Affirm you understand your stay is temporary and you will leave Canada at the end of authorized stay if your status is not renewed.',
    'Financial Self-Sufficiency: Be prepared to show live Canadian bank balances covering living expenses.',
    'Digital Device Examination (CBSA Enforcement Manual): BSOs have statutory authority under Customs Act s. 99(1)(a) to inspect unlocked phones and laptops for undisclosed employment or immigration misrepresentation.',
    'Status Maintenance: Never work in Canada without explicit written authorization or maintained status confirmation.'
  );

  // Overall recommendation determination
  let determination = 'ELIGIBLE_FOR_POE_PROCESSING';
  let summary = 'You meet the baseline requirements to process your application at a designated land border port of entry.';

  if (isPgwpBarred) {
    determination = 'STRICTLY_BARRED';
    summary = 'Flagpoling for PGWP is strictly barred under the June 2024 Ministerial Policy. You must submit your PGWP application online from within Canada.';
  } else if (legalBarriers.length > 0) {
    determination = 'STRICTLY_BARRED';
    summary = 'You have statutory barriers preventing port-of-entry processing. You must resolve these through inland applications.';
  } else if (maintainedStatusRisk) {
    determination = 'HIGH_RISK_NOT_RECOMMENDED';
    summary = 'Flagpoling is strongly discouraged because leaving Canada will extinguish your Maintained Status under IRPR s. 183(5).';
  } else if (!isOperatingDay) {
    determination = 'TEMPORARILY_BLOCKED';
    summary = `Selected day (${normalizedDay}) is outside the designated flagpoling hours for ${portInfo.name}. Choose a designated operational day.`;
  } else if (!isEligibleAtPoe) {
    determination = 'INELIGIBLE_AT_BORDER';
    summary = 'Your citizenship, visa status, or permit type does not qualify for port-of-entry permit issuance under IRPR s. 198.';
  }

  return {
    asOf: cleanDate,
    assessmentDate: cleanDate,
    applicantName: cleanApplicant,
    determination,
    summary,
    permitCategory: safePermit,
    countryOfCitizenship: citizenCode,
    isTrvExempt,
    portOfEntry: portInfo,
    dayScheduled: normalizedDay,
    isOperatingDay,
    maintainedStatusAtRisk: maintainedStatusRisk,
    pgwpBorderBanApplied: isPgwpBarred,
    usAdministrativeRefusalImpact,
    legalBarriers,
    warnings,
    requiredDocuments,
    borderInterviewPrep: borderPrepPoints,
    statutoryReferences: [
      'IRPA s. 11 (Application before entry)',
      'IRPA s. 18 & s. 20 (Examination by officer & obligation to answer truthfullly)',
      'IRPA s. 22(2) (Dual Intent)',
      'IRPA s. 40 (Misrepresentation & 5-year inadmissibility ban)',
      'IRPR s. 183(5) & s. 186(u) (Maintained status condition & termination on departure)',
      'IRPR s. 198 (Application for work permit at port of entry)',
      'IRCC & CBSA Joint Ministerial Directive on Border Flagpoling Restrictions (2024)'
    ]
  };
}
