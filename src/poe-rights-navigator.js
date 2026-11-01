import { ValidationError } from './api-errors.js';
import { boundedText, safeIsoDate } from './text-input.js';

/**
 * Airport & Port-of-Entry (POE) Legal Rights & Emergency Defense Navigator
 * Covers Port-of-Entry statutory rights across Canada (CBSA), USA (CBP), UK (Border Force), and Australia (ABF).
 * Statutory Grounding:
 * - Canada: Immigration and Refugee Protection Act (IRPA) ss. 15, 20, 22, 42, 44; Customs Act s. 99(1); Charter s. 8, s. 10(b).
 * - USA: Immigration and Nationality Act (INA) § 235 (Inspection), § 212(a)(7) (Documentation), 8 CFR § 235.3.
 * - UK: Immigration Act 1971 Schedule 2; Human Rights Act 1998.
 * - Australia: Migration Act 1958 s. 166 (Border Clearance), s. 198 (Removal).
 */

export const BORDER_AUTHORITIES = Object.freeze({
  CA: {
    agency: 'Canada Border Services Agency (CBSA)',
    statute: 'Customs Act & Immigration and Refugee Protection Act (IRPA)',
    digitalDeviceRule: 'Officers may examine digital devices only with reasonable suspicion of contraband or non-compliance. Devices must be in airplane mode. Searching cloud storage or remote data is strictly prohibited (CBSA Directive / R. v. Canfield 2020 ABCA 115).',
    rightToCounsel: 'Charter s. 10(b) right to retain and instruct counsel without delay attaches once a traveler is formally detained or arrested at secondary inspection.',
    withdrawalOption: 'Allowed to Leave Canada (Form IMM 1282 / IRPR s. 42): A foreign national may request permission to voluntarily withdraw their application for entry rather than facing a Section 44(1) Report or Exclusion Order.',
    emergencyHotline: '+1-800-461-9999 (CBSA Border Info) / Legal Aid Ontario: +1-800-668-8258'
  },
  US: {
    agency: 'U.S. Customs and Border Protection (CBP)',
    statute: 'Immigration and Nationality Act (INA) § 235 & Title 19 CFR',
    digitalDeviceRule: 'CBP Directive 3340-049A: Basic search requires no suspicion; advanced search (connecting external equipment) requires reasonable suspicion of unlawful activity or national security concern. Cloud browsing prohibited.',
    rightToCounsel: 'Non-citizens do not have a constitutional right to an attorney during primary or secondary inspection at POE unless facing criminal custodial interrogation (8 CFR § 292.5).',
    withdrawalOption: 'Withdrawal of Application for Admission (INA § 235(a)(4) / 8 CFR § 235.4): Discretionary relief permitting departure without incurring a 5-year bar from Expedited Removal under INA § 235(b)(1).',
    emergencyHotline: '+1-877-227-5511 (CBP Info Center) / AILA Detention Hotline'
  },
  UK: {
    agency: 'UK Border Force (Home Office)',
    statute: 'Immigration Act 1971 & Police and Criminal Evidence Act 1984',
    digitalDeviceRule: 'Examining officers may inspect electronic equipment under Schedule 7 or Customs powers; however, examination must be proportionate.',
    rightToCounsel: 'Access to legal advice is granted if detained overnight or formally served with notice of refusal of leave to enter.',
    withdrawalOption: 'Voluntary departure prior to formal refusal of leave to enter under Paragraph 320/9 of Immigration Rules.',
    emergencyHotline: '+44 300 790 6268 (UKVI Contact Centre) / Joint Council for the Welfare of Immigrants: +44 20 7447 4770'
  },
  AU: {
    agency: 'Australian Border Force (ABF)',
    statute: 'Migration Act 1958 & Customs Act 1901',
    digitalDeviceRule: 'Customs Act 1901 s. 186 authorizes inspection of goods including mobile phones; passwords may be requested, but non-compliance is governed by strict statutory thresholds.',
    rightToCounsel: 'Section 256 of Migration Act provides access to reasonable legal facilities if immigration detention is invoked.',
    withdrawalOption: 'Voluntary withdrawal of immigration clearance application prior to visa cancellation under Migration Act s. 116.',
    emergencyHotline: '+61 131 881 (Department of Home Affairs) / Legal Aid Border Advice'
  }
});

export function evaluatePortOfEntryRights(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be a valid object');
  }

  const {
    travelerName = 'Traveler',
    country = 'CA',
    statusCategory = 'work_permit', // 'study_permit', 'work_permit', 'visitor', 'permanent_resident', 'refugee_claim'
    isInSecondaryInspection = false,
    hasDigitalDeviceSearchConcern = false,
    facingRefusalRisk = false,
    assessmentDate = '2026-10-31'
  } = input;

  const safeTraveler = boundedText(travelerName, 'Traveler', 100);
  const targetCountry = boundedText(country, 'CA', 10).toUpperCase();
  const safeStatus = boundedText(statusCategory, 'work_permit', 50);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const authority = BORDER_AUTHORITIES[targetCountry] || BORDER_AUTHORITIES.CA;

  const guidanceSteps = [];
  const criticalCautions = [];

  // 1. General POE Entry Protocol
  guidanceSteps.push(`Present valid passport, visa/eTA approval letter, and primary support documents (job offer letter, enrollment letter, proof of funds).`);
  guidanceSteps.push(`Answer all factual questions honestly and concisely. Do not volunteer unsolicited opinions or extraneous personal documents unless requested.`);

  // 2. Secondary Inspection Rights
  if (isInSecondaryInspection) {
    guidanceSteps.push(`SECONDARY INSPECTION PROTOCOL: Remain calm and polite. Officers in secondary conduct thorough verification of financial ability, admissibility, and bona fides.`);
    guidanceSteps.push(`Right to Counsel: ${authority.rightToCounsel}`);
  }

  // 3. Digital Device Search
  if (hasDigitalDeviceSearchConcern) {
    criticalCautions.push(`DIGITAL PRIVACY PROTECTION: ${authority.digitalDeviceRule}`);
    criticalCautions.push(`Cloud Storage Prohibition: Officers are legally restricted from searching emails, Google Drive, WhatsApp, or cloud files not downloaded to the physical device. You may request that the device remain in Airplane Mode.`);
  }

  // 4. Refusal vs Voluntary Withdrawal
  if (facingRefusalRisk) {
    criticalCautions.push(`CRITICAL DISASTER MITIGATION — VOLUNTARY WITHDRAWAL: ${authority.withdrawalOption}`);
    criticalCautions.push(`Never sign a formal Removal Order or Expedited Removal without asking the inspecting officer: 'May I be permitted to voluntarily withdraw my application for admission and return home on the next available flight?' A voluntary withdrawal avoids a 1-year, 5-year, or lifetime re-entry ban.`);
  }

  return {
    travelerName: safeTraveler,
    assessmentDate: safeAssessmentDate,
    country: targetCountry,
    authority: authority.agency,
    governingStatute: authority.statute,
    statusCategory: safeStatus,
    secondaryInspectionActive: Boolean(isInSecondaryInspection),
    guidanceChecklist: guidanceSteps,
    statutoryRights: {
      digitalDeviceSearchPolicy: authority.digitalDeviceRule,
      legalCounselAccess: authority.rightToCounsel,
      voluntaryWithdrawalRemedy: authority.withdrawalOption
    },
    emergencyAssistance: {
      hotline: authority.emergencyHotline
    },
    criticalWarnings: criticalCautions
  };
}
