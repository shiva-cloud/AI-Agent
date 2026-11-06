/**
 * Alberta Residential Tenancy Landlord Right of Entry Navigator
 *
 * Audits landlord 24-hour entry notices, permissible entry hours (8:00 AM to 8:00 PM),
 * Sunday/religious worship day prohibitions, and quiet enjoyment breaches under
 * Alberta's Residential Tenancies Act, SA 2004, c. R-17.1, ss. 23, 24.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { calculatorBoolean, calculatorChoice, calculatorDate, calculatorNumber } from './calculator-input.js';
import { boundedText, todayIso } from './text-input.js';

export const ALBERTA_ENTRY_NOTICE_CONSTANTS = Object.freeze({
  MINIMUM_NOTICE_HOURS: 24, // s. 23(1)(c)
  EARLIEST_PERMITTED_ENTRY_HOUR: 8, // 8:00 AM (s. 24(3)(a))
  LATEST_PERMITTED_ENTRY_HOUR: 20, // 8:00 PM (s. 24(3)(a))
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 23, 24'
});

/**
 * Audits landlord entry notice validity, quiet enjoyment covenants, and RTDRS remedies.
 *
 * @param {Object} params
 * @param {number} [params.noticeHoursGiven=24] - Hours of written notice provided before entry
 * @param {string} [params.entryPurpose='REPAIRS_OR_MAINTENANCE'] - 'EMERGENCY', 'ABANDONMENT', 'REPAIRS_OR_MAINTENANCE', 'INSPECTION', 'SHOW_PROSPECTIVE_TENANTS', 'SHOW_PURCHASERS', 'GENERAL_DROP_IN'
 * @param {string} [params.entryDayOfWeek='Tuesday'] - Day of the week for proposed entry ('Sunday', 'Monday', etc.)
 * @param {number} [params.entryScheduledHour=14] - Hour of entry in 24-hr format (e.g. 14 = 2:00 PM)
 * @param {boolean} [params.isTenantDayOfReligiousWorship=false] - Scheduled day is tenant's notified day of religious worship
 * @param {boolean} [params.noticeSpecifiedDateAndTime=true] - Notice stated specific date and reasonable time window
 * @param {boolean} [params.noticeSignedByLandlord=true] - Written notice was signed by landlord or authorized agent
 * @param {boolean} [params.tenantConsentedToEntry=false] - Tenant explicitly gave informed consent to entry
 * @returns {Object} Comprehensive landlord entry notice audit and tenant legal remedies
 */
export function evaluateAlbertaLandlordEntry({
  noticeHoursGiven = 24,
  entryPurpose = 'REPAIRS_OR_MAINTENANCE',
  entryDayOfWeek = 'Tuesday',
  entryScheduledHour = 14,
  isTenantDayOfReligiousWorship = false,
  noticeSpecifiedDateAndTime = true,
  noticeSignedByLandlord = true,
  tenantConsentedToEntry = false,
  tenantName = 'Tenant',
  landlordName = 'Landlord',
  assessmentDate = todayIso()
} = {}) {
  const cleanTenant = boundedText(tenantName, 'Tenant', 120);
  const cleanLandlord = boundedText(landlordName, 'Landlord', 120);
  const cleanDate = calculatorDate(assessmentDate, 'assessmentDate');
  const hoursNotice = calculatorNumber(noticeHoursGiven, 'noticeHoursGiven', {max: 8760});
  const hour = calculatorNumber(entryScheduledHour, 'entryScheduledHour', {max: 23, integer: true});
  const day = calculatorChoice(typeof entryDayOfWeek === 'string' ? entryDayOfWeek.toLowerCase() : entryDayOfWeek, 'entryDayOfWeek',
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const cleanPurpose = calculatorChoice(entryPurpose, 'entryPurpose', ['EMERGENCY', 'ABANDONMENT', 'REPAIRS_OR_MAINTENANCE',
    'INSPECTION', 'SHOW_PROSPECTIVE_TENANTS', 'SHOW_PURCHASERS', 'GENERAL_DROP_IN']);
  tenantConsentedToEntry = calculatorBoolean(tenantConsentedToEntry, 'tenantConsentedToEntry');
  isTenantDayOfReligiousWorship = calculatorBoolean(isTenantDayOfReligiousWorship, 'isTenantDayOfReligiousWorship');
  noticeSpecifiedDateAndTime = calculatorBoolean(noticeSpecifiedDateAndTime, 'noticeSpecifiedDateAndTime');
  noticeSignedByLandlord = calculatorBoolean(noticeSignedByLandlord, 'noticeSignedByLandlord');

  const isEmergency = cleanPurpose === 'EMERGENCY';
  const isAbandonment = cleanPurpose === 'ABANDONMENT';

  // If tenant gave consent or emergency/abandonment, entry is permitted
  if (tenantConsentedToEntry || isEmergency || isAbandonment) {
    return {
      assessmentDate: cleanDate,
      jurisdiction: 'ALBERTA_CANADA',
      tenantName: cleanTenant,
      landlordName: cleanLandlord,
      isEntryPermitted: true,
      complianceStatus: 'ENTRY_STATUTORILY_PERMITTED',
      legalVerdict: isEmergency
        ? 'Landlord may enter immediately without notice due to an emergency threatening life or property under s. 23(1)(a).'
        : isAbandonment
          ? 'Landlord may enter without notice based on reasonable grounds that premises are abandoned under s. 23(1)(b).'
          : 'Tenant gave explicit consent to entry under s. 23(1)(d).',
      statutoryViolations: [],
      actionableRemedies: [],
      statutoryCitations: ['Residential Tenancies Act, SA 2004, c. R-17.1, s. 23']
    };
  }

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Minimum 24 Hours Notice (s. 23(1)(c))
  if (hoursNotice < ALBERTA_ENTRY_NOTICE_CONSTANTS.MINIMUM_NOTICE_HOURS) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_NOTICE_UNDER_24_HOURS',
      statute: 'Residential Tenancies Act s. 23(1)(c)',
      finding: `Provided only ${hoursNotice} hour${hoursNotice === 1 ? '' : 's'} notice. Statute mandates at least 24 full hours written notice prior to entry.`
    });
    actionableRemedies.push({
      action: 'REFUSE_ENTRY_AND_DEMAND_24H_NOTICE',
      remedyDescription: 'Tenant may lawfully refuse entry at the door; landlord cannot force entry without a compliant 24-hour notice.'
    });
  }

  // 2. Permitted Hours Audit (8:00 AM to 8:00 PM) (s. 24(3)(a))
  const isWithinPermittedHours =
    hour >= ALBERTA_ENTRY_NOTICE_CONSTANTS.EARLIEST_PERMITTED_ENTRY_HOUR &&
    hour <= ALBERTA_ENTRY_NOTICE_CONSTANTS.LATEST_PERMITTED_ENTRY_HOUR;

  if (!isWithinPermittedHours) {
    statutoryViolations.push({
      rule: 'ENTRY_SCHEDULED_OUTSIDE_STATUTORY_HOURS',
      statute: 'Residential Tenancies Act s. 24(3)(a)',
      finding: `Entry scheduled for ${hour}:00. Statute strictly restricts entry to between 8:00 AM and 8:00 PM.`
    });
    actionableRemedies.push({
      action: 'RESCHEDULE_ENTRY_BETWEEN_8AM_AND_8PM',
      remedyDescription: 'Require landlord to schedule entry within the legal 8:00 AM to 8:00 PM window.'
    });
  }

  // 3. Sunday & Religious Day Prohibition (s. 24(3)(b), (c))
  if (day === 'sunday') {
    statutoryViolations.push({
      rule: 'ENTRY_SCHEDULED_ON_SUNDAY',
      statute: 'Residential Tenancies Act s. 24(3)(b)',
      finding: 'Landlord scheduled entry on a Sunday without tenant consent, in direct contravention of s. 24(3)(b).'
    });
  }

  if (isTenantDayOfReligiousWorship) {
    statutoryViolations.push({
      rule: 'ENTRY_SCHEDULED_ON_RELIGIOUS_WORSHIP_DAY',
      statute: 'Residential Tenancies Act s. 24(3)(c)',
      finding: 'Entry scheduled on tenant’s declared day of religious worship without consent.'
    });
  }

  // 4. Form & Content of Notice (s. 24(2))
  if (!noticeSpecifiedDateAndTime) {
    statutoryViolations.push({
      rule: 'DEFECTIVE_NOTICE_MISSING_TIME_WINDOW',
      statute: 'Residential Tenancies Act s. 24(2)(b)',
      finding: 'Notice failed to specify the date or reasonable time of entry (all-day open-ended notices are legally invalid).'
    });
  }

  if (!noticeSignedByLandlord) {
    statutoryViolations.push({
      rule: 'NOTICE_UNSIGNED',
      statute: 'Residential Tenancies Act s. 24(2)(c)',
      finding: 'Notice was not signed by the landlord or landlord’s authorized agent.'
    });
  }

  // 5. Purpose of Entry Audit
  if (cleanPurpose === 'GENERAL_DROP_IN') {
    statutoryViolations.push({
      rule: 'IMPERMISSIBLE_ENTRY_PURPOSE',
      statute: 'Residential Tenancies Act s. 24(1)',
      finding: 'General drop-ins or non-statutory visits are not recognized as lawful entry purposes under s. 24(1).'
    });
  }

  const isEntryPermitted = statutoryViolations.length === 0;

  let complianceStatus = isEntryPermitted
    ? 'COMPLIANT_24H_ENTRY_NOTICE'
    : 'UNLAWFUL_ENTRY_BREACH_OF_QUIET_ENJOYMENT';

  let legalVerdict = isEntryPermitted
    ? 'Landlord notice complies with Alberta RTA ss. 23 and 24. Landlord is authorized to enter during the specified window.'
    : `Landlord entry notice is legally defective (${statutoryViolations.length} violation${statutoryViolations.length === 1 ? '' : 's'}). Unauthorized entry constitutes breach of quiet enjoyment under s. 16(c).`;

  if (!isEntryPermitted) {
    actionableRemedies.push({
      action: 'FILE_RTDRS_QUIET_ENJOYMENT_CLAIM',
      remedyDescription: 'If landlord trespasses or enters without a compliant notice, file RTDRS application for rent abatement or lease termination.'
    });
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    isEntryPermitted,
    entryPurpose: cleanPurpose,
    noticeHoursGiven: hoursNotice,
    entryDayOfWeek: day,
    entryScheduledHour: hour,
    complianceStatus,
    legalVerdict,
    noticeDefectsAudit: {
      hasCompliantNoticePeriod: hoursNotice >= 24,
      isWithinLegalHours: isWithinPermittedHours,
      isScheduledOnSunday: day === 'sunday',
      isScheduledOnReligiousDay: isTenantDayOfReligiousWorship,
      hasSpecifiedTime: noticeSpecifiedDateAndTime,
      isSigned: noticeSignedByLandlord
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 16(c), 23, 24, 37',
      'Residential Tenancy Dispute Resolution Service (RTDRS) Practice Directives on Landlord Entry'
    ]
  };
}
