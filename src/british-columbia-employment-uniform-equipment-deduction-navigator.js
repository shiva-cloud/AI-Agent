/**
 * British Columbia Employment Uniform & Equipment Deduction Navigator
 *
 * Audits unlawful wage deductions, uniform deposits, special clothing mandates,
 * and cash shortage/breakage liability under British Columbia's Employment Standards
 * Act, RSBC 1996, c. 113, ss. 21, 25, and B.C. Reg. 396/95, s. 21.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_UNIFORM_DEDUCTION_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Act, RSBC 1996, c. 113, ss. 21, 25',
  SPECIAL_CLOTHING_PROVISION_RULE: 'FREE_OF_CHARGE',
  UNLAWFUL_DEDUCTION_RECOVERY_LIMIT_MONTHS: 24 // ESA s. 80 recovery window
});

/**
 * Audits uniform requirements, wage deductions, and business loss shifting under BC ESA.
 *
 * @param {Object} params
 * @param {boolean} [params.requiresSpecialClothingOrUniform=true] - Employer mandates distinctive uniform, branded clothing, or dress code
 * @param {boolean} [params.employerProvidedUniformFreeOfCharge=true] - Employer provided special clothing at zero cost to employee
 * @param {boolean} [params.employerCleansUniformOrPaysAllowance=true] - Employer launders uniform or pays written cleaning allowance (s. 25(2))
 * @param {number} [params.uniformCostOrDepositChargedCad=0] - Dollar amount charged to worker for uniform or deposit
 * @param {boolean} [params.deductedForTillShortage=false] - Employer deducted for cash register/till discrepancy
 * @param {number} [params.tillShortageDeductionCad=0] - Dollar amount deducted for cash shortage
 * @param {boolean} [params.deductedForCustomerDineAndDash=false] - Employer deducted for customer unpaid bill or dine-and-dash
 * @param {number} [params.dineAndDashDeductionCad=0] - Dollar amount deducted for dine-and-dash
 * @param {boolean} [params.deductedForEquipmentBreakage=false] - Employer deducted for broken dishes, glasses, tools, or equipment
 * @param {number} [params.equipmentBreakageDeductionCad=0] - Dollar amount deducted for broken property
 * @returns {Object} Comprehensive uniform and wage deduction audit and recoverable sums
 */
export function auditBcEmploymentUniformAndDeductions(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    assessmentDate = '2026-10-31',
    requiresSpecialClothingOrUniform = true,
    employerProvidedUniformFreeOfCharge = true,
    employerCleansUniformOrPaysAllowance = true,
    uniformCostOrDepositChargedCad = 0,
    deductedForTillShortage = false,
    tillShortageDeductionCad = 0,
    deductedForCustomerDineAndDash = false,
    dineAndDashDeductionCad = 0,
    deductedForEquipmentBreakage = false,
    equipmentBreakageDeductionCad = 0
  } = safeParams;

  const cleanEmployeeName = boundedText(employeeName, 'Employee', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const uniformFee = Number.isFinite(Number(uniformCostOrDepositChargedCad)) ? Math.max(0, Math.min(50000, Number(uniformCostOrDepositChargedCad))) : 0;
  const shortageFee = Number.isFinite(Number(tillShortageDeductionCad)) ? Math.max(0, Math.min(50000, Number(tillShortageDeductionCad))) : 0;
  const dineAndDashFee = Number.isFinite(Number(dineAndDashDeductionCad)) ? Math.max(0, Math.min(50000, Number(dineAndDashDeductionCad))) : 0;
  const breakageFee = Number.isFinite(Number(equipmentBreakageDeductionCad)) ? Math.max(0, Math.min(50000, Number(equipmentBreakageDeductionCad))) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Uniform / Special Clothing Audit (s. 25)
  if (requiresSpecialClothingOrUniform) {
    if (!employerProvidedUniformFreeOfCharge || uniformFee > 0) {
      statutoryViolations.push({
        rule: 'ILLEGAL_UNIFORM_CHARGE_OR_DEPOSIT',
        statute: 'Employment Standards Act s. 25(1)',
        finding: `Employer required employee to pay $${uniformFee} for special clothing/uniform. Section 25 strictly mandates that special clothing must be provided free of charge.`
      });
      actionableRemedies.push({
        action: 'RECOVER_UNIFORM_COST_OR_DEPOSIT',
        remedyDescription: `Demand full refund of $${uniformFee} charged for uniforms or uniform deposits.`
      });
    }

    if (!employerCleansUniformOrPaysAllowance) {
      statutoryViolations.push({
        rule: 'FAILURE_TO_CLEAN_OR_PAY_UNIFORM_ALLOWANCE',
        statute: 'Employment Standards Act s. 25(2)',
        finding: 'Employer requires special clothing but fails to clean and maintain it or pay a reasonable maintenance allowance.'
      });
      actionableRemedies.push({
        action: 'INSTITUTE_UNIFORM_CLEANING_ALLOWANCE',
        remedyDescription: 'Employer must provide commercial laundering on-site or agree in writing to pay an hourly or weekly cleaning stipend.'
      });
    }
  }

  // 2. Prohibited Business Loss Deductions (s. 21(2))
  if (deductedForTillShortage || shortageFee > 0) {
    statutoryViolations.push({
      rule: 'PROHIBITED_CASH_SHORTAGE_DEDUCTION',
      statute: 'Employment Standards Act s. 21(2)(a)',
      finding: `Employer unlawfully deducted $${shortageFee} for cash register/till shortages. Shifting cash shortages to employees is strictly illegal.`
    });
    actionableRemedies.push({
      action: 'RECOVER_UNLAWFUL_TILL_DEDUCTIONS',
      remedyDescription: `File Employment Standards complaint to recover $${shortageFee} in illegal till deductions with statutory interest.`
    });
  }

  if (deductedForCustomerDineAndDash || dineAndDashFee > 0) {
    statutoryViolations.push({
      rule: 'PROHIBITED_DINE_AND_DASH_DEDUCTION',
      statute: 'Employment Standards Act s. 21(2)(b)',
      finding: `Employer unlawfully deducted $${dineAndDashFee} for unpaid customer tabs or dine-and-dash incidents. Customer theft cannot be deducted from wages.`
    });
    actionableRemedies.push({
      action: 'RECOVER_DINE_AND_DASH_DEDUCTIONS',
      remedyDescription: `Demand repayment of $${dineAndDashFee} unlawfully withheld for unpaid customer bills.`
    });
  }

  if (deductedForEquipmentBreakage || breakageFee > 0) {
    statutoryViolations.push({
      rule: 'PROHIBITED_BREAKAGE_PROPERTY_DAMAGE_DEDUCTION',
      statute: 'Employment Standards Act s. 21(2)(c)',
      finding: `Employer unlawfully deducted $${breakageFee} for damaged or broken equipment/dishes.`
    });
    actionableRemedies.push({
      action: 'RECOVER_PROPERTY_DAMAGE_DEDUCTIONS',
      remedyDescription: `Demand immediate reimbursement of $${breakageFee} deducted for broken company property.`
    });
  }

  const totalUnlawfulDeductionsCad = uniformFee + shortageFee + dineAndDashFee + breakageFee;

  let complianceStatus = 'COMPLIANT_NO_UNLAWFUL_DEDUCTIONS';
  let legalVerdict = 'Uniform provision, cleaning standards, and wage payments comply with British Columbia Employment Standards Act.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH';
    legalVerdict = `Employer committed ${statutoryViolations.length} statutory violation${statutoryViolations.length === 1 ? '' : 's'} under BC ESA ss. 21 and 25. Total unlawfully withheld: $${totalUnlawfulDeductionsCad}. Full recovery enforceable via Director of Employment Standards.`;
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    employeeName: cleanEmployeeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    requiresSpecialClothingOrUniform,
    totalUnlawfulDeductionsCad,
    complianceStatus,
    legalVerdict,
    deductionBreakdown: {
      uniformCostOrDepositCad: uniformFee,
      tillShortageCad: shortageFee,
      dineAndDashCad: dineAndDashFee,
      equipmentBreakageCad: breakageFee
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, RSBC 1996, c. 113, ss. 21, 25, 80, 88',
      'Employment Standards Regulation, B.C. Reg. 396/95, s. 21',
      'BC Employment Standards Branch Interpretation Guidelines Manual'
    ]
  };
}
