/**
 * Federal Start-Up Visa (SUV) Program & Designated Organization Navigator
 *
 * Implements statutory assessment rules under:
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 14.1)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, ss. 98.01–98.13):
 *   - Section 98.01: Definitions (Commitment Certificate, Designated Entity, Qualifying Business)
 *   - Section 98.03: Commitments by Designated Entities
 *   - Section 98.04: Language Requirements (Minimum CLB 5)
 *   - Section 98.05: Settlement Funds Requirements
 *   - Section 98.06: Qualifying Business Ownership (10% individual, >50% joint control, max 5 owners)
 *   - Section 98.12: Essential Person Refusal Rule
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

import { factTable } from './kb-facts.js';
export const SUV_DESIGNATED_ENTITY_TYPES = Object.freeze({
  VENTURE_CAPITAL_FUND: {
    type: 'VENTURE_CAPITAL_FUND',
    name: 'Designated Venture Capital Fund',
    minimumInvestmentCad: 200000,
    requiresIncubatorAcceptance: false
  },
  ANGEL_INVESTOR_GROUP: {
    type: 'ANGEL_INVESTOR_GROUP',
    name: 'Designated Angel Investor Group',
    minimumInvestmentCad: 75000,
    requiresIncubatorAcceptance: false
  },
  BUSINESS_INCUBATOR: {
    type: 'BUSINESS_INCUBATOR',
    name: 'Designated Business Incubator',
    minimumInvestmentCad: 0,
    requiresIncubatorAcceptance: true
  }
});

// Express Entry settlement funds from src/kb-facts.js (same table as src/proof-of-funds.js).
export const SUV_SETTLEMENT_FUNDS_2026 = factTable('ca.expressEntry.settlementFundsCad');

export function calculateSuvSettlementFunds(familySize = 1) {
  const size = Number.isFinite(Number(familySize)) ? Math.max(1, Math.min(20, Math.floor(Number(familySize)))) : 1;
  if (size <= 7) {
    return SUV_SETTLEMENT_FUNDS_2026[size];
  }
  return SUV_SETTLEMENT_FUNDS_2026[7] + ((size - 7) * SUV_SETTLEMENT_FUNDS_2026.additionalPerPerson);
}

export function evaluateStartUpVisaEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const candidateName = boundedText(safeParams.candidateName, 'Founding Entrepreneur', 100);
  const assessmentDate = safeIsoDate(safeParams.assessmentDate, todayIso());
  const normalizedType = boundedText(safeParams.entityType, 'VENTURE_CAPITAL_FUND', 50).toUpperCase();
  const designatedConfig = SUV_DESIGNATED_ENTITY_TYPES[normalizedType] || null;
  const hasCommitmentCertificate = Boolean(safeParams.hasCommitmentCertificate);
  const hasLetterOfSupport = Boolean(safeParams.hasLetterOfSupport);
  const inv = Number.isFinite(Number(safeParams.investmentAmountCad)) ? Math.max(0, Math.min(1000000000, Number(safeParams.investmentAmountCad))) : 0;
  const acceptedIntoIncubationProgram = Boolean(safeParams.acceptedIntoIncubationProgram);
  const coOwnersCount = Number.isFinite(Number(safeParams.numberOfCoOwnersApplying)) ? Math.max(1, Math.min(20, Math.floor(Number(safeParams.numberOfCoOwnersApplying)))) : 1;
  const applicantPct = Number.isFinite(Number(safeParams.applicantVotingRightsPercentage)) ? Math.max(0, Math.min(100, Number(safeParams.applicantVotingRightsPercentage))) : 20;
  const jointPct = Number.isFinite(Number(safeParams.jointVotingRightsPercentage)) ? Math.max(0, Math.min(100, Number(safeParams.jointVotingRightsPercentage))) : 60;
  const isIdentifiedAsEssentialApplicant = Boolean(safeParams.isIdentifiedAsEssentialApplicant);
  const spk = Number.isFinite(Number(safeParams.clbSpeaking)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.clbSpeaking)))) : 5;
  const lis = Number.isFinite(Number(safeParams.clbListening)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.clbListening)))) : 5;
  const rd = Number.isFinite(Number(safeParams.clbReading)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.clbReading)))) : 5;
  const wr = Number.isFinite(Number(safeParams.clbWriting)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.clbWriting)))) : 5;
  const providedFunds = Number.isFinite(Number(safeParams.availableSettlementFundsCad)) ? Math.max(0, Math.min(1000000000, Number(safeParams.availableSettlementFundsCad))) : 0;
  const famSize = Number.isFinite(Number(safeParams.familySize)) ? Math.max(1, Math.min(20, Math.floor(Number(safeParams.familySize)))) : 1;
  const canadianIncorporationPlannedOrCompleted = safeParams.canadianIncorporationPlannedOrCompleted !== false;
  const activeOngoingManagementInCanada = safeParams.activeOngoingManagementInCanada !== false;

  const criteriaEvaluated = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. Designated Entity & Commitment Certificate (IRPR ss. 98.01, 98.03)
  if (!designatedConfig) {
    disqualifications.push({
      criterion: 'INVALID_ENTITY_TYPE',
      reason: `Entity type '${normalizedType}' is not recognized. Must be VENTURE_CAPITAL_FUND, ANGEL_INVESTOR_GROUP, or BUSINESS_INCUBATOR.`
    });
  } else {
    if (!hasCommitmentCertificate || !hasLetterOfSupport) {
      disqualifications.push({
        criterion: 'MISSING_COMMITMENT_DOCUMENTS',
        reason: 'Applicant must have an official Commitment Certificate submitted directly by the designated entity and a Letter of Support provided to the applicant (IRPR s. 98.03).'
      });
    } else {
      criteriaEvaluated.push({
        criterion: 'COMMITMENT_DOCUMENTATION',
        status: 'MET',
        details: 'Valid Commitment Certificate and Letter of Support confirmed from designated organization.'
      });
    }

    // Capital or Incubation Verification
    if (designatedConfig.type === 'VENTURE_CAPITAL_FUND') {
      if (inv >= designatedConfig.minimumInvestmentCad) {
        criteriaEvaluated.push({
          criterion: 'MINIMUM_INVESTMENT_THRESHOLD',
          status: 'MET',
          details: `Investment of $${inv.toLocaleString()} CAD meets or exceeds the venture capital threshold of $200,000 CAD.`
        });
      } else {
        disqualifications.push({
          criterion: 'CAPITAL_SHORTFALL',
          reason: `Venture Capital funds require a minimum investment of $200,000 CAD; provided amount is $${inv.toLocaleString()} CAD.`
        });
      }
    } else if (designatedConfig.type === 'ANGEL_INVESTOR_GROUP') {
      if (inv >= designatedConfig.minimumInvestmentCad) {
        criteriaEvaluated.push({
          criterion: 'MINIMUM_INVESTMENT_THRESHOLD',
          status: 'MET',
          details: `Investment of $${inv.toLocaleString()} CAD meets or exceeds the angel investor threshold of $75,000 CAD.`
        });
      } else {
        disqualifications.push({
          criterion: 'CAPITAL_SHORTFALL',
          reason: `Angel Investor groups require a minimum investment of $75,000 CAD; provided amount is $${inv.toLocaleString()} CAD.`
        });
      }
    } else if (designatedConfig.type === 'BUSINESS_INCUBATOR') {
      if (acceptedIntoIncubationProgram) {
        criteriaEvaluated.push({
          criterion: 'INCUBATOR_ACCEPTANCE',
          status: 'MET',
          details: 'Acceptance into designated Canadian business incubator program verified.'
        });
      } else {
        disqualifications.push({
          criterion: 'INCUBATOR_ADMISSION_DEFICIENCY',
          reason: 'Applicant must be formally accepted into an approved incubator program of a designated entity.'
        });
      }
    }
  }

  // 2. Ownership & Voting Rights Requirements (IRPR s. 98.06)
  if (coOwnersCount > 5) {
    disqualifications.push({
      criterion: 'MAXIMUM_OWNERS_EXCEEDED',
      reason: `Statutory maximum of 5 owners per business allowed under IRPR s. 98.06(1)(a); currently assessing ${coOwnersCount} owners.`
    });
  } else {
    criteriaEvaluated.push({
      criterion: 'OWNER_COUNT',
      status: 'MET',
      details: `${coOwnersCount} owner(s) is within the statutory limit of 5.`
    });
  }

  if (applicantPct >= 10) {
    criteriaEvaluated.push({
      criterion: 'INDIVIDUAL_VOTING_RIGHTS',
      status: 'MET',
      details: `Individual voting rights of ${applicantPct}% meet the statutory minimum of 10% (IRPR s. 98.06(1)(b)).`
    });
  } else {
    disqualifications.push({
      criterion: 'INSUFFICIENT_INDIVIDUAL_OWNERSHIP',
      reason: `Each applicant owner must hold at least 10% of total voting rights; provided is ${applicantPct}%.`
    });
  }

  if (jointPct > 50) {
    criteriaEvaluated.push({
      criterion: 'JOINT_VOTING_CONTROL',
      status: 'MET',
      details: `Joint voting rights of ${jointPct}% satisfy the requirement of more than 50% combined control (IRPR s. 98.06(1)(c)).`
    });
  } else {
    disqualifications.push({
      criterion: 'INSUFFICIENT_JOINT_CONTROL',
      reason: `Applicants and designated organization together must hold MORE than 50% of the total voting rights; provided is ${jointPct}%.`
    });
  }

  // 3. Essential Person Risk Analysis (IRPR s. 98.12)
  if (isIdentifiedAsEssentialApplicant) {
    riskWarnings.push({
      warning: 'ESSENTIAL_APPLICANT_STATUS',
      details: 'This applicant is designated as ESSENTIAL. Under IRPR s. 98.12, if this application is refused for any reason (inadmissibility, language, funds), ALL OTHER APPLICATIONS linked to this Commitment Certificate are automatically refused.'
    });
  }

  // 4. Official Language Requirements (IRPR s. 98.04: Minimum CLB 5 in all 4 abilities)
  const minClb = Math.min(spk, lis, rd, wr);
  if (minClb >= 5) {
    criteriaEvaluated.push({
      criterion: 'LANGUAGE_BENCHMARK',
      status: 'MET',
      details: `All language bands (Speaking: ${spk}, Listening: ${lis}, Reading: ${rd}, Writing: ${wr}) satisfy minimum CLB 5.`
    });
  } else {
    disqualifications.push({
      criterion: 'LANGUAGE_BENCHMARK_UNSATISFIED',
      reason: `Applicant must obtain at least CLB 5 in all four abilities under IRPR s. 98.04; lowest band is CLB ${minClb}.`
    });
  }

  // 5. Settlement Funds Assessment (IRPR s. 98.05)
  const requiredFunds = calculateSuvSettlementFunds(famSize);

  if (providedFunds >= requiredFunds) {
    criteriaEvaluated.push({
      criterion: 'SETTLEMENT_FUNDS',
      status: 'MET',
      details: `Liquid unencumbered funds of $${providedFunds.toLocaleString()} CAD meet or exceed required $${requiredFunds.toLocaleString()} CAD.`
    });
  } else {
    disqualifications.push({
      criterion: 'SETTLEMENT_FUNDS_DEFICIENCY',
      reason: `Settlement funds of $${providedFunds.toLocaleString()} CAD are below the statutory threshold of $${requiredFunds.toLocaleString()} CAD for a family size of ${famSize} (IRPR s. 98.05).`
    });
  }

  // 6. Canadian Corporate & Operational Requirement (IRPR s. 98.06(2))
  if (!canadianIncorporationPlannedOrCompleted || !activeOngoingManagementInCanada) {
    disqualifications.push({
      criterion: 'QUALIFYING_BUSINESS_OPERATIONAL_FAILURE',
      reason: 'The business must be incorporated in Canada with ongoing management and essential operations directed from within Canada.'
    });
  }

  const isEligible = disqualifications.length === 0;

  // IRCC closed the program to new applications on 31 December 2025; this
  // assessment still helps people with files already submitted.
  riskWarnings.push({
    warning: 'PROGRAM_CLOSED_TO_NEW_APPLICANTS',
    details: 'The Start-up Visa closed to new applications on 31 December 2025 (applicants holding a valid 2025 commitment certificate had until 30 June 2026). Applications already submitted are still processed. IRCC has announced a replacement entrepreneur pilot; check canada.ca for its status.'
  });

  return {
    candidateName,
    assessmentDate,
    stream: 'FEDERAL_START_UP_VISA',
    programStatus: 'closed_to_new_applications_since_2025-12-31',
    designatedEntityType: designatedConfig ? designatedConfig.type : normalizedType,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE'
      : 'INELIGIBLE_FOR_START_UP_VISA',
    criteriaEvaluated,
    disqualifications,
    riskWarnings,
    ownershipAudit: {
      numberOfOwners: coOwnersCount,
      applicantVotingRightsPercentage: applicantPct,
      jointVotingRightsPercentage: jointPct,
      isEssentialPerson: isIdentifiedAsEssentialApplicant
    },
    settlementFundsAudit: {
      familySize: famSize,
      requiredFundsCad: requiredFunds,
      providedFundsCad: providedFunds,
      hasSufficientFunds: providedFunds >= requiredFunds
    },
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 14.1',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, ss. 98.01–98.13',
      'IRCC Operational Instructions: Start-up Business Class'
    ]
  };
}
