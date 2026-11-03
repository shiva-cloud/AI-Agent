// src/family-reunification-navigator.js
// Spousal & Family Reunification Navigator.
// Audits Spousal Open Work Permits (SOWP), Super Visa income tests, Dependent Child cutoffs, and Partner Visas.

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const LICO_2025_TABLE = {
  1: 29380,
  2: 36576,
  3: 44966,
  4: 54594,
  5: 61920,
  6: 69828,
  7: 77738
};

export function evaluateFamilyReunification(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const applicantName = boundedText(safeInput.applicantName, 'Applicant', 100);
  const assessmentDate = safeIsoDate(safeInput.assessmentDate, todayIso());
  const category = boundedText(safeInput.category, 'spousal_open_work_permit', 50).toLowerCase();
  

  // 1. CANADA: SPOUSAL OPEN WORK PERMIT (SOWP) 2024/2025 ELIGIBILITY
  if (category === 'spousal_open_work_permit' || category === 'sowp') {
    const sponsorStatus = boundedText(safeInput.sponsorStatus, 'study_permit', 50).toLowerCase(); // 'study_permit' or 'work_permit'
    const studentProgramType = boundedText(safeInput.studentProgramType, '', 50).toLowerCase(); // 'masters', 'phd', 'undergraduate', 'diploma'
    const workerTeer = Number.isFinite(Number(safeInput.workerTeer)) ? Math.max(0, Math.min(5, Math.round(Number(safeInput.workerTeer)))) : 1; // 0, 1, 2, 3, 4, 5
    const workerPermitRemainingMonths = Number.isFinite(Number(safeInput.workerPermitRemainingMonths)) ? Math.max(0, Math.min(120, Number(safeInput.workerPermitRemainingMonths))) : 12;

    let eligible = false;
    let refusalHazard = false;
    let reason = '';
    let statutoryBasis = '';

    if (sponsorStatus === 'study_permit') {
      const isEligibleDegree = studentProgramType.includes('master') || studentProgramType.includes('phd') || studentProgramType.includes('doctorate') || studentProgramType.includes('professional');
      if (isEligibleDegree) {
        eligible = true;
        reason = 'Eligible for SOWP under the 2024/2025 IRCC Ministerial Instructions: Principal applicant is enrolled in a Master\'s or Doctoral degree program at a Designated Learning Institution (DLI).';
      } else {
        eligible = false;
        refusalHazard = true;
        reason = 'INELIGIBLE: Under the March 19, 2024 IRCC policy update, spouses of international students in undergraduate, college diploma, or certificate programs are strictly prohibited from receiving Spousal Open Work Permits.';
      }
      statutoryBasis = 'Immigration and Refugee Protection Regulations (IRPR) s. 205(c)(ii) & IRCC Program Delivery Instructions (PDI) for Spousal Work Permits';
    } else {
      // Work permit holder spouse
      const isEligibleTeer = workerTeer >= 0 && workerTeer <= 3;
      const hasSufficientValidity = workerPermitRemainingMonths >= 6;

      if (isEligibleTeer && hasSufficientValidity) {
        eligible = true;
        reason = `Eligible for SOWP: Principal worker is employed in a high-skilled occupation (TEER ${workerTeer}) with ${workerPermitRemainingMonths} months permit validity (minimum 6 months required).`;
      } else if (!isEligibleTeer) {
        eligible = false;
        refusalHazard = true;
        reason = `INELIGIBLE: Principal foreign worker is in TEER ${workerTeer} (low-wage / low-skilled stream). SOWP requires TEER 0, 1, 2, or 3 under general public policy.`;
      } else {
        eligible = false;
        refusalHazard = true;
        reason = `INELIGIBLE / EXTENSION REQUIRED: Principal foreign worker has only ${workerPermitRemainingMonths} months remaining on their work permit. IRCC mandates at least 6 months validity at the time of application.`;
      }
      statutoryBasis = 'IRPR s. 205(a) Public Policy C41/C42 & Ministerial Instructions';
    }

    return {
      applicantName,
      assessmentDate,
      category: 'SPOUSAL_OPEN_WORK_PERMIT',
      eligible,
      refusalHazard,
      verdict: eligible ? 'ELIGIBLE_FOR_SOWP' : 'INELIGIBLE_UNDER_CURRENT_RULES',
      statutoryLegalBasis: statutoryBasis,
      explanation: reason,
      documentationChecklist: [
        'Proof of genuine marriage or common-law partnership (Marriage Certificate, Joint Lease, Co-mingled Bank Accounts)',
        sponsorStatus === 'study_permit' ? 'Official DLI Enrollment Letter confirming Master\'s/PhD degree designation' : 'Job Offer / Reference Letter verifying NOC/TEER and 3 consecutive pay stubs',
        'Copy of principal applicant\'s valid Study Permit or Work Permit (minimum 6 months validity)',
        'IMM 5710 Application to Change Conditions or Extend Stay in Canada',
        'Valid passport with at least 1-year validity'
      ]
    };
  }

  // 2. CANADA: SUPER VISA FOR PARENTS AND GRANDPARENTS
  if (category === 'super_visa') {
    const householdSize = Number.isFinite(Number(safeInput.householdSize)) ? Math.max(1, Math.min(20, Math.round(Number(safeInput.householdSize)))) : 3;
    const sponsorAnnualIncomeCad = Number.isFinite(Number(safeInput.sponsorAnnualIncomeCad)) ? Math.max(0, Math.min(1000000000, Number(safeInput.sponsorAnnualIncomeCad))) : 45000;
    const hasPrivateInsurance = Boolean(safeInput.hasApprovedPrivateMedicalInsurance);

    const baseLico = LICO_2025_TABLE[Math.min(householdSize, 7)] || 77738;
    const mniRequiredCad = Math.round(baseLico * 1.30); // Super Visa requires LICO + 30% for Parents sponsorship
    const meetsIncome = sponsorAnnualIncomeCad >= mniRequiredCad;
    const eligible = meetsIncome && hasPrivateInsurance;

    return {
      applicantName,
      assessmentDate,
      category: 'SUPER_VISA_PARENTS_GRANDPARENTS',
      eligible,
      verdict: eligible ? 'SUPER_VISA_COMPLIANT' : 'FINANCIAL_OR_INSURANCE_SHORTFALL',
      statutoryLegalBasis: 'IRPA s. 15(1) & Ministerial Instructions for Super Visa Multi-Entry Stay (up to 5 years)',
      financialAudit: {
        householdSize,
        baseLicoCad: baseLico,
        minimumNecessaryIncomeCad: mniRequiredCad,
        actualSponsorIncomeCad: sponsorAnnualIncomeCad,
        incomeSurplusOrDeficitCad: sponsorAnnualIncomeCad - mniRequiredCad,
        meetsIncomeThreshold: meetsIncome
      },
      insuranceAudit: {
        hasPrivateInsurance,
        minimumCoverageMandateCad: 100000,
        validityMandateYears: 1,
        requiresPrepaymentOrInstallment: true
      },
      stayEntitlements: [
        'Initial stay of up to 5 consecutive years in Canada without status renewal',
        'Option to apply for a 2-year extension while remaining in Canada (up to 7 years total stay)',
        'Multiple-entry visa valid for up to 10 years or passport expiry'
      ],
      bottlenecksAndRisks: !meetsIncome 
        ? `Sponsor income ($${sponsorAnnualIncomeCad.toLocaleString()}) falls below the statutory Super Visa MNI threshold ($${mniRequiredCad.toLocaleString()} CAD). Sponsor must provide CRA Notice of Assessment (NOA) line 15000 meeting the threshold or add a co-signer spouse.`
        : !hasPrivateInsurance 
        ? 'Super Visa strictly requires proof of prepaid or monthly instalment medical insurance of at least $100,000 emergency coverage from an approved Canadian or international provider.'
        : 'All parents/grandparents must pass Immigration Medical Examination (IME) with no inadmissible chronic care burden.'
    };
  }

  // 3. CANADA: DEPENDENT CHILD SPONSORSHIP (AGE 22 RULE)
  if (category === 'dependent_child') {
    const childAge = Number.isFinite(Number(safeInput.childAge)) ? Math.max(0, Math.min(120, Math.round(Number(safeInput.childAge)))) : 20;
    const isMarriedOrCommonLaw = Boolean(safeInput.isMarriedOrCommonLaw);
    const hasPhysicalOrMentalDisability = Boolean(safeInput.hasPhysicalOrMentalDisability);
    const continuouslyEnrolledInStudies = Boolean(safeInput.continuouslyEnrolledInStudies);

    let eligible = false;
    let reason = '';

    if (isMarriedOrCommonLaw) {
      eligible = false;
      reason = 'INELIGIBLE: Under IRPR s. 2, a dependent child must not be a spouse or common-law partner. Marriage permanently terminates dependent child status.';
    } else if (childAge < 22) {
      eligible = true;
      reason = `Eligible as Dependent Child: Age ${childAge} is strictly under the age 22 cutoff at the lock-in date.`;
    } else {
      // Age 22 or older
      if (hasPhysicalOrMentalDisability && continuouslyEnrolledInStudies) {
        eligible = true;
        reason = `Eligible under s. 2(b) Over-Age Exemption: Child is age ${childAge} but has depended substantially on financial support of parents since before age 22 and is unable to be self-supporting due to a physical or mental condition.`;
      } else {
        eligible = false;
        reason = `INELIGIBLE: Child is age ${childAge} (22 years of age or older). In Canada, age 22 is the strict statutory cutoff unless the child qualifies under the continuous physical or mental disability dependency exception.`;
      }
    }

    return {
      applicantName,
      assessmentDate,
      category: 'DEPENDENT_CHILD_SPONSORSHIP',
      eligible,
      verdict: eligible ? 'QUALIFIES_AS_DEPENDENT_CHILD' : 'AGED_OUT_OR_INELIGIBLE',
      statutoryLegalBasis: 'Immigration and Refugee Protection Regulations (IRPR) s. 2 ("dependent child")',
      childAge,
      lockInAgeRule: 'Age is locked in on the exact date IRCC receives the completed PR or sponsorship application.',
      explanation: reason
    };
  }

  // 4. AUSTRALIA: PARTNER VISA (SUBCLASS 820/801)
  const relType = boundedText(safeInput.relationshipType, 'married', 50).toLowerCase();
  const isDeFacto = relType === 'de_facto';
  const cohabitationMonths = Number.isFinite(Number(safeInput.cohabitationMonths)) ? Math.max(0, Math.min(600, Number(safeInput.cohabitationMonths))) : 12;
  const isRegisteredRelationship = Boolean(safeInput.isRegisteredRelationship);

  const meetsDeFactoRule = !isDeFacto || cohabitationMonths >= 12 || isRegisteredRelationship;

  return {
    applicantName,
    assessmentDate,
    category: 'AUSTRALIA_PARTNER_VISA_820_801',
    eligible: meetsDeFactoRule,
    verdict: meetsDeFactoRule ? 'RELATIONSHIP_THRESHOLD_SATISFIED' : 'COHABITATION_SHORTFALL',
    statutoryLegalBasis: 'Migration Act 1958 s. 5F (Spouse) & s. 5CB (De Facto) and Migration Regulations 1994',
    relationshipAssessment: {
      isDeFacto,
      cohabitationMonths,
      isRegisteredRelationship,
      fourPillarsEvidentiaryCriteria: [
        'Financial Aspects: Joint bank accounts, joint lease/mortgage, shared household liabilities',
        'Nature of Household: Shared living address, division of housework, joint utility bills',
        'Social Context: Joint travel, statutory declarations (Form 888) from Australian citizen friends/family',
        'Mutual Commitment: Wills, superannuation beneficiary nominations, long-term plans'
      ]
    },
    bottlenecksAndRisks: !meetsDeFactoRule 
      ? 'De facto couples without 12 months cohabitation must register their relationship under an Australian State/Territory Relationship Register (e.g. NSW BDM or Births Deaths Marriages Victoria) to waive the strict 12-month requirement.'
      : 'Applicant receives Subclass 820 Temporary Partner Visa with full work and Medicare rights, transitioning to Subclass 801 Permanent Visa after 2 years.'
  };
}
