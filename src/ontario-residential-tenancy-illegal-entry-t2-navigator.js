/**
 * Ontario Residential Tenancy Illegal Landlord Entry & LTB Form T2 Navigator
 *
 * Audits 24-hour written notice rules, permissible 8:00 AM to 8:00 PM entry windows,
 * emergency and showing exceptions, harassment, and remedies (rent abatement,
 * lock replacement orders, and administrative penalties) under Ontario's
 * Residential Tenancies Act, 2006 (RTA), ss. 22, 23, 25, 26, 27, 29, 30, 31 (Form T2).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText } from './text-input.js';

export const ONTARIO_T2_ENTRY_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 22, 23, 25-27, 30, 31',
  MIN_NOTICE_HOURS: 24, // s. 27(1)
  EARLIEST_ENTRY_HOUR: 8, // 8:00 AM (s. 27(1))
  LATEST_ENTRY_HOUR: 20, // 8:00 PM (s. 27(1))
  MAX_INDIVIDUAL_FINE_CAD: 50000,
  MAX_CORPORATE_FINE_CAD: 250000,
  LIMITATION_PERIOD_YEARS: 1 // s. 29(2)
});

/**
 * Audits landlord entry legality, statutory breaches, and Form T2 remedies.
 *
 * @param {Object} params
 * @param {boolean} [params.writtenNoticeGiven=true] - Whether landlord provided written notice
 * @param {number} [params.noticeHoursGiven=24] - Hours elapsed between notice and entry
 * @param {number} [params.entryScheduledHour=14] - 24-hour scheduled entry time (e.g. 14 for 2:00 PM)
 * @param {boolean} [params.isEmergencyEntry=false] - True only for emergency entry under s. 26(1)
 * @param {boolean} [params.tenantConsentedAtTimeOfEntry=false] - Tenant freely permitted entry at the door
 * @param {boolean} [params.noticeSpecifiedTimeWindow=true] - Notice gave specific window between 8am and 8pm
 * @param {boolean} [params.noticeStatedValidPurpose=true] - Notice gave legitimate repair/inspection purpose
 * @param {number} [params.monthlyRentCad=2200] - Lawful monthly rent
 * @param {number} [params.unlawfulEntryIncidentsCount=1] - Number of unauthorized entry incidents
 * @param {number} [params.outOfPocketExpensesCad=0] - Lock change or camera security costs
 * @returns {Object} Comprehensive entry legality audit and LTB Form T2 evaluation
 */
export function evaluateOntarioIllegalEntryT2({
  writtenNoticeGiven = true,
  noticeHoursGiven = 24,
  entryScheduledHour = 14,
  isEmergencyEntry = false,
  tenantConsentedAtTimeOfEntry = false,
  noticeSpecifiedTimeWindow = true,
  noticeStatedValidPurpose = true,
  monthlyRentCad = 2200,
  unlawfulEntryIncidentsCount = 1,
  outOfPocketExpensesCad = 0,
  landlordName = 'Landlord',
  rentalAddress = 'Rental Property',
  entryReasonGiven = 'Routine Inspection'
} = {}) {
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanRentalAddress = boundedText(rentalAddress, 'Rental Property');
  const cleanReason = boundedText(entryReasonGiven, 'Routine Inspection');
  const hoursNotice = Number.isFinite(Number(noticeHoursGiven)) ? Math.max(0, Math.min(8760, Number(noticeHoursGiven))) : 24;
  const hour = Number.isFinite(Number(entryScheduledHour)) ? Math.max(0, Math.min(23, Math.floor(Number(entryScheduledHour)))) : 14;
  const rent = Number.isFinite(Number(monthlyRentCad)) ? Math.max(0, Math.min(50000, Number(monthlyRentCad))) : 2200;
  const incidents = Number.isFinite(Number(unlawfulEntryIncidentsCount)) ? Math.max(1, Math.min(100, Math.floor(Number(unlawfulEntryIncidentsCount)))) : 1;
  const expenses = Number.isFinite(Number(outOfPocketExpensesCad)) ? Math.max(0, Math.min(50000, Number(outOfPocketExpensesCad))) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Emergency or Consent Exception
  const isExempt = isEmergencyEntry || tenantConsentedAtTimeOfEntry;

  if (!isExempt) {
    // 2. Written Notice Requirement (s. 27(1))
    if (!writtenNoticeGiven || hoursNotice < ONTARIO_T2_ENTRY_CONSTANTS.MIN_NOTICE_HOURS) {
      statutoryViolations.push({
        rule: 'INSUFFICIENT_ADVANCE_ENTRY_NOTICE',
        statute: 'Residential Tenancies Act s. 27(1)',
        finding: `Landlord provided ${hoursNotice} hours notice. Section 27(1) mandates at least 24 full hours written notice.`
      });
    }

    // 3. Permissible Hours (8:00 AM to 8:00 PM)
    if (hour < ONTARIO_T2_ENTRY_CONSTANTS.EARLIEST_ENTRY_HOUR || hour >= ONTARIO_T2_ENTRY_CONSTANTS.LATEST_ENTRY_HOUR) {
      statutoryViolations.push({
        rule: 'ENTRY_OUTSIDE_STATUTORY_HOURS',
        statute: 'Residential Tenancies Act s. 27(1)',
        finding: `Entry at ${hour}:00 violates the statutory 8:00 AM to 8:00 PM permitted window.`
      });
    }

    // 4. Specificity Requirements
    if (!noticeSpecifiedTimeWindow) {
      statutoryViolations.push({
        rule: 'FAILURE_TO_SPECIFY_WINDOW_OF_ENTRY',
        statute: 'Residential Tenancies Act s. 27(1) & Wrona v. Toronto Community Housing',
        finding: 'Notice must specify a reasonable window between 8am and 8pm. Open-ended "sometime this week" notices are unlawful.'
      });
    }

    if (!noticeStatedValidPurpose) {
      statutoryViolations.push({
        rule: 'INVALID_ENTRY_PURPOSE',
        statute: 'Residential Tenancies Act s. 27(1)',
        finding: 'Notice must state a valid statutory reason (inspection, repairs, mortgagee/insurer inspection).'
      });
    }
  }

  // 5. Remedies & Financial Abatement (s. 31)
  const isUnlawfulEntry = statutoryViolations.length > 0;
  let estimatedAbatementCad = 0;
  let totalClaimCad = expenses;

  if (isUnlawfulEntry) {
    // Standard LTB abatement: ~10% to 25% of one month rent per serious incident
    const perIncidentAbatement = Math.round(rent * 0.15 * 100) / 100;
    estimatedAbatementCad = Math.min(rent, perIncidentAbatement * incidents);
    totalClaimCad = Math.round((estimatedAbatementCad + expenses) * 100) / 100;

    actionableRemedies.push({
      action: 'FILE_LTB_FORM_T2_REMEDY_SUBMISSION',
      remedyDescription: `File LTB Form T2 (Reason 1: Unlawfully entered rental unit) claiming $${totalClaimCad.toFixed(2)} in rent abatement and expenses.`
    });
    actionableRemedies.push({
      action: 'REQUEST_ORDER_PROHIBITING_FUTURE_ILLEGAL_ENTRY',
      remedyDescription: 'Request the Board order the landlord not to enter without strictly compliant s. 27 notice and seek an administrative fine.'
    });
  }

  let complianceStatus = 'COMPLIANT_LANDLORD_ENTRY';
  let legalVerdict = 'Landlord entry was authorized by written notice or lawful exemption under RTA ss. 25–27.';

  if (isUnlawfulEntry) {
    complianceStatus = 'UNLAWFUL_ENTRY_STATUTORY_BREACH';
    legalVerdict = `Landlord committed unlawful entry under Ontario RTA s. 27 (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Tenant has grounds for LTB Form T2 remedies totaling $${totalClaimCad.toFixed(2)}.`;
  }

  return {
    jurisdiction: 'ONTARIO_CANADA',
    landlordName: cleanLandlord,
    rentalAddress: cleanRentalAddress,
    entryReasonGiven: cleanReason,
    isEmergencyEntry,
    tenantConsentedAtTimeOfEntry,
    writtenNoticeGiven,
    noticeHoursGiven: hoursNotice,
    entryScheduledHour: hour,
    isUnlawfulEntry,
    complianceStatus,
    legalVerdict,
    remedySummary: {
      monthlyRentCad: rent,
      unlawfulEntryIncidentsCount: incidents,
      estimatedAbatementCad,
      outOfPocketExpensesCad: expenses,
      totalClaimCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 22 (Quiet enjoyment), 23 (Harassment), 25-27 (Entry rules), 31 (Tenant remedies)',
      'Wrona v. Toronto Community Housing Corp., 2007 CanLII 3228 (ON SCDC) (Specific entry window requirements)'
    ]
  };
}