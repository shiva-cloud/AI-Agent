// src/super-visa-lico-navigator.js
// Super Visa & Parents/Grandparents Sponsorship (PGP) Statutory Income & Insurance Navigator
// Grounded in IRPR s. 133, IRPA s. 12(1), and official IRCC Low Income Cut-Off (LICO) + 30% benchmarks.
import { boundedText, safeIsoDate } from './text-input.js';

export const LICO_PLUS_30_TABLE_2024 = {
  1: 35768,
  2: 44530,
  3: 54744,
  4: 66466,
  5: 75384,
  6: 85021,
  7: 94658,
  additionalPerson: 9637
};

export function getRequiredLicoIncome(householdSize) {
  if (householdSize <= 7) {
    return LICO_PLUS_30_TABLE_2024[householdSize] || LICO_PLUS_30_TABLE_2024[1];
  }
  const extra = householdSize - 7;
  return LICO_PLUS_30_TABLE_2024[7] + extra * LICO_PLUS_30_TABLE_2024.additionalPerson;
}

export function evaluateSuperVisaAndPgp({
  hostFamilyMembersInCanada = 3, // e.g. host + spouse + 1 child
  parentsGrandparentsToSponsor = 2, // e.g. mother + father
  hostAnnualIncomeCad = 78000,
  coSignerIncomeCad = 0,
  noaIncomeYear1Cad = 78000,
  noaIncomeYear2Cad = 72000,
  noaIncomeYear3Cad = 68000,
  hasCanadianHealthInsurance = true,
  insuranceCoverageAmountCad = 100000,
  insuranceCoversRepatriation = true,
  applicationType = 'super_visa', // 'super_visa' or 'pgp_permanent'
  hostName = 'Canadian Host Child',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeHostName = boundedText(hostName, 'Canadian Host Child', 120);
  const safeAppType = boundedText(applicationType, 'super_visa', 40).toLowerCase();

  const toNonNegative = (val, defaultVal = 0, maxVal = 100000000) =>
    Number.isFinite(Number(val)) && Number(val) >= 0 ? Math.min(maxVal, Number(val)) : defaultVal;

  const hostMembers = Math.max(1, Math.min(20, Math.round(toNonNegative(hostFamilyMembersInCanada, 3))));
  const sponsorMembers = Math.max(1, Math.min(20, Math.round(toNonNegative(parentsGrandparentsToSponsor, 2))));
  const hostIncome = toNonNegative(hostAnnualIncomeCad, 0);
  const coIncome = toNonNegative(coSignerIncomeCad, 0);
  const cleanCoverage = toNonNegative(insuranceCoverageAmountCad, 0);
  const totalFamilyUnitSize = hostMembers + sponsorMembers;
  const requiredIncomeCad = getRequiredLicoIncome(totalFamilyUnitSize);

  const combinedCurrentIncomeCad = hostIncome + coIncome;
  const isSuperVisaIncomeSufficient = combinedCurrentIncomeCad >= requiredIncomeCad;
  const incomeSurplusOrDeficitCad = combinedCurrentIncomeCad - requiredIncomeCad;

  // 1. Insurance Compliance Audit for Super Visa
  const insuranceIssues = [];
  if (!hasCanadianHealthInsurance) {
    insuranceIssues.push('Valid private medical insurance from a Canadian insurance company (or IRCC-approved foreign provider) is mandatory.');
  }
  if (cleanCoverage < 100000) {
    insuranceIssues.push(`Coverage of $${cleanCoverage.toLocaleString()} CAD is insufficient. IRCC requires minimum $100,000 CAD emergency coverage.`);
  }
  if (!insuranceCoversRepatriation) {
    insuranceIssues.push('Insurance policy must explicitly include emergency medical care, hospitalization, and repatriation coverage.');
  }
  const isInsuranceCompliant = insuranceIssues.length === 0;

  // 2. PGP 3-Year Consecutive Income Check
  let pgp3YearAudit = null;
  if (safeAppType === 'pgp_permanent') {
    const year1Pass = noaIncomeYear1Cad >= requiredIncomeCad;
    const year2Pass = noaIncomeYear2Cad >= requiredIncomeCad;
    const year3Pass = noaIncomeYear3Cad >= requiredIncomeCad;
    const all3YearsPass = year1Pass && year2Pass && year3Pass;

    pgp3YearAudit = {
      isEligible3Years: all3YearsPass,
      requiredAnnualThresholdCad: requiredIncomeCad,
      year1Result: { income: noaIncomeYear1Cad, met: year1Pass },
      year2Result: { income: noaIncomeYear2Cad, met: year2Pass },
      year3Result: { income: noaIncomeYear3Cad, met: year3Pass },
      undertakingPeriodYears: 20,
      undertakingNote: 'Sponsors must sign a 20-year legal undertaking (10 years in Quebec). You remain financially responsible for social assistance repayments even in cases of divorce, separation, or financial bankruptcy.'
    };
  }

  return {
    assessmentDate: safeAssessmentDate,
    hostName: safeHostName,
    householdAudit: {
      hostFamilyMembersInCanada: hostMembers,
      parentsGrandparentsToSponsor: sponsorMembers,
      totalFamilyUnitSize,
      requiredLicoPlus30IncomeCad: requiredIncomeCad
    },
    superVisaEvaluation: {
      combinedHostIncomeCad: combinedCurrentIncomeCad,
      isIncomeSufficient: isSuperVisaIncomeSufficient,
      incomeDeltaCad: incomeSurplusOrDeficitCad,
      stayEntitlement: 'Up to 5 consecutive years per entry (with multi-entry visa valid up to 10 years). Can apply for an in-Canada extension of up to 2 years.',
      insuranceAudit: {
        isCompliant: isInsuranceCompliant,
        issues: insuranceIssues,
        monthlyPaymentOptionAllowed: true
      }
    },
    pgpEvaluation: pgp3YearAudit,
    statutoryBasis: 'IRPA s. 12(1); IRPR s. 133(1)(j)(i)(B); Ministerial Instructions for Super Visa (2024 LICO + 30%).'
  };
}
