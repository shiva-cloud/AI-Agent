/**
 * Ontario Residential Tenancy Urgent Repairs & LTB Form T6 Navigator
 *
 * Audits landlord maintenance duties, vital services compliance (heat, water, electricity),
 * municipal standards (O. Reg. 516/06 s. 4 minimum 20°C heating rule), and evaluates
 * remedies under Ontario's Residential Tenancies Act, 2006 (RTA), ss. 20, 21, 30, 31,
 * and Landlord and Tenant Board (LTB) Form T6 applications.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ONTARIO_T6_MAINTENANCE_CONSTANTS = Object.freeze({
  MIN_STATUTORY_HEATING_TEMP_CELSIUS: 20, // O. Reg. 516/06 s. 4(1)
  HEATING_SEASON_START_MONTH: 9, // September 1
  HEATING_SEASON_END_MONTH: 6, // June 15
  LTB_FILING_LIMITATION_YEARS: 1, // RTA s. 29(2)
  MAX_INDIVIDUAL_PROVINCIAL_FINE_CAD: 50000, // RTA s. 238(1)
  MAX_CORPORATE_PROVINCIAL_FINE_CAD: 250000, // RTA s. 238(2)
  T6_APPLICATION_FEE_ONLINE_CAD: 48,
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 20, 21, 30, 31'
});

/**
 * Audits disrepair, vital service breaches, out-of-pocket costs, and estimated rent abatements for Form T6.
 *
 * @param {Object} params
 * @param {boolean} [params.vitalServiceInterrupted=false] - Whether fuel, water, gas, electricity, or heat is cut off
 * @param {number|null} [params.indoorTemperatureCelsius=null] - Measured temperature inside rental unit in Celsius
 * @param {number} [params.calendarMonth=1] - Current or occurrence calendar month (1=Jan, 12=Dec)
 * @param {boolean} [params.landlordNotifiedInWriting=true] - Whether tenant sent written notice of disrepair
 * @param {number} [params.daysSinceWrittenNotice=14] - Calendar days elapsed since notice given
 * @param {number} [params.emergencyRepairIncurredByTenantCad=0] - Emergency repair expenses paid directly by tenant
 * @param {number} [params.monthlyRentCad=2000] - Lawful monthly rent
 * @param {number} [params.monthsOfDisrepair=1] - Number of months disrepair condition endured
 * @param {number} [params.estimatedAbatementPercentage=25] - Percentage rent abatement claimed (0-100)
 * @param {boolean} [params.landlordRetaliationThreatened=false] - Landlord threatened eviction or rent hike for complaining
 * @returns {Object} Comprehensive Ontario maintenance audit and Form T6 evaluation
 */
export function evaluateOntarioUrgentRepairsT6(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    assessmentDate = '2026-10-31',
    vitalServiceInterrupted = false,
    indoorTemperatureCelsius = null,
    calendarMonth = 1,
    landlordNotifiedInWriting = true,
    daysSinceWrittenNotice = 14,
    emergencyRepairIncurredByTenantCad = 0,
    monthlyRentCad = 2000,
    monthsOfDisrepair = 1,
    estimatedAbatementPercentage = 25,
    landlordRetaliationThreatened = false,
    landlordName = 'Landlord',
    rentalAddress = 'Rental Property'
  } = safeParams;
  const cleanTenant = boundedText(tenantName, 'Tenant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanAddress = boundedText(rentalAddress, 'Rental Property');
  const rent = Math.max(0, Number(monthlyRentCad) || 0);
  const outOfPocket = Math.max(0, Number(emergencyRepairIncurredByTenantCad) || 0);
  const months = Math.max(1, Number(monthsOfDisrepair) || 1);
  const abatementPct = Math.min(100, Math.max(0, Number(estimatedAbatementPercentage) || 0));
  const daysNotice = Math.max(0, Number(daysSinceWrittenNotice) || 0);
  const month = Number(calendarMonth) || 1;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Vital Service Withholding / Interruption (RTA s. 21)
  if (vitalServiceInterrupted) {
    statutoryViolations.push({
      rule: 'ILLEGAL_VITAL_SERVICE_INTERRUPTION',
      statute: 'Residential Tenancies Act s. 21',
      finding: 'Landlord is prohibited from withholding, shutting off, or deliberately failing to restore vital services (heat, water, electricity, fuel).'
    });
    actionableRemedies.push({
      action: 'CONTACT_RHEU_IMMEDIATE_INTERVENTION',
      remedyDescription: 'Contact the Rental Housing Enforcement Unit (RHEU) at 1-888-772-9277 for emergency provincial inspection and compliance order.'
    });
  }

  // 2. Heating Standards (O. Reg. 516/06 s. 4)
  const isHeatingSeason = month >= ONTARIO_T6_MAINTENANCE_CONSTANTS.HEATING_SEASON_START_MONTH ||
                          month <= ONTARIO_T6_MAINTENANCE_CONSTANTS.HEATING_SEASON_END_MONTH;
  const temp = indoorTemperatureCelsius !== null ? Number(indoorTemperatureCelsius) : null;

  if (isHeatingSeason && temp !== null && temp < ONTARIO_T6_MAINTENANCE_CONSTANTS.MIN_STATUTORY_HEATING_TEMP_CELSIUS) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_INDOOR_HEATING_TEMPERATURE',
      statute: 'O. Reg. 516/06 s. 4 & RTA s. 20',
      finding: `Indoor temperature of ${temp}°C is below the provincial statutory minimum of 20°C mandated between Sept 1 and June 15.`
    });
    actionableRemedies.push({
      action: 'REQUEST_MUNICIPAL_PROPERTY_STANDARDS_INSPECTION',
      remedyDescription: 'Call municipal bylaw / 311 to dispatch a property standards inspector to issue an official Notice of Violation.'
    });
  }

  // 3. Notice and Landlord Delay
  if (!landlordNotifiedInWriting) {
    riskWarnings.push({
      warningType: 'LACK_OF_WRITTEN_EVIDENCE_OF_NOTICE',
      description: 'LTB requires evidence that the landlord knew or ought reasonably to have known about the maintenance defect. Provide formal written notice immediately.'
    });
    actionableRemedies.push({
      action: 'SERVE_WRITTEN_WORK_ORDER_REQUEST',
      remedyDescription: 'Send dated written notice (email, text, letter) detailing the specific defects and requested repair timeline.'
    });
  } else if (daysNotice >= 7) {
    riskWarnings.push({
      warningType: 'UNREASONABLE_LANDLORD_REPAIR_DELAY',
      description: `Landlord has taken ${daysNotice} days without remediating the reported maintenance condition.`
    });
  }

  // 4. Financial Calculations (Abatement & Expenses)
  const calculatedAbatementCad = Math.round((rent * (abatementPct / 100)) * months * 100) / 100;
  const totalMonetaryClaimCad = Math.round((calculatedAbatementCad + outOfPocket) * 100) / 100;

  if (outOfPocket > 0) {
    actionableRemedies.push({
      action: 'CLAIM_REIMBURSEMENT_FOR_OUT_OF_POCKET_REPAIRS',
      remedyDescription: `Include $${outOfPocket.toFixed(2)} in Form T6 Remedy 3 with all contractor receipts and invoices attached.`
    });
  }

  // 5. Landlord Reprisal (RTA s. 83(3)(c))
  if (landlordRetaliationThreatened) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_RETALIATORY_CONDUCT',
      statute: 'Residential Tenancies Act s. 83(3)(c)',
      finding: 'Landlord cannot penalize, threaten, or issue notice of termination because tenant asserted statutory maintenance rights.'
    });
    actionableRemedies.push({
      action: 'SEEK_REPRISAL_PROTECTION_AND_FINE',
      remedyDescription: 'Request the LTB dismiss any retaliatory eviction and impose an administrative fine under s. 31(1) para 5.'
    });
  }

  // Final Assessment
  let hasBreach = statutoryViolations.length > 0 || daysNotice >= 7;
  let complianceStatus = 'NO_UNRESOLVED_MAINTENANCE_BREACH_DETECTED';
  let legalVerdict = 'Rental unit maintenance appears compliant with RTA standards based on submitted data.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'URGENT_STATUTORY_MAINTENANCE_BREACH';
    legalVerdict = `Landlord breached statutory maintenance duties under RTA ss. 20/21. Tenant has grounds to file LTB Form T6 seeking $${totalMonetaryClaimCad.toFixed(2)} total remedies and repair orders.`;
  } else if (daysNotice >= 7) {
    complianceStatus = 'ACTIONABLE_REPAIR_DELAY_FORM_T6_ELIGIBLE';
    legalVerdict = `Substantial repair delay (${daysNotice} days) after written notice. Tenant may file LTB Form T6 for repair order and rent abatement.`;
  }

  return {
    tenantName: cleanTenant,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    landlordName: cleanLandlord,
    rentalAddress: cleanAddress,
    landlordNotifiedInWriting,
    daysSinceWrittenNotice: daysNotice,
    vitalServiceInterrupted,
    isHeatingSeason,
    indoorTemperatureCelsius: temp,
    hasBreach,
    complianceStatus,
    legalVerdict,
    financialSummary: {
      monthlyRentCad: rent,
      monthsOfDisrepair: months,
      claimedAbatementPercentage: abatementPct,
      calculatedAbatementCad,
      outOfPocketExpensesCad: outOfPocket,
      totalMonetaryClaimCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 20, 21, 29(2), 30, 31, 83(3)(c)',
      'Ontario Regulation 516/06, s. 4 (Minimum heating temperature requirements)'
    ]
  };
}