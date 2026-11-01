/**
 * Federal Citizenship Revocation Defense Navigator
 *
 * Implements statutory assessment rules under:
 * - Citizenship Act, R.S.C. 1985, c. C-29:
 *   - Section 10(1): Minister's revocation power (false representation, fraud, or knowingly concealing material circumstances)
 *   - Section 10(3): Humanitarian and compassionate (H&C) considerations
 *   - Section 10(4): Written notice of intent to revoke citizenship (30-day response window)
 *   - Section 10.1: Reference to Federal Court of Canada
 *   - Section 10.4: Statelessness risk mitigation & international treaty obligations
 * - Immigration and Refugee Protection Act (IRPA, s. 40 misrepresentation cross-reference)
 * - Leading Jurisprudence:
 *   - Canada (Minister of Citizenship and Immigration) v. Hassouna, 2017 FC 473
 *   - Vavilov v. Canada (Citizenship and Immigration), 2019 SCC 65
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS = 30;

export function evaluateCitizenshipRevocationDefense(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Citizen',
    assessmentDate = '2026-10-31',
    noticeOfIntentDate = '2026-10-01',
    currentDate = '2026-10-25',
    allegationType = 'FALSE_REPRESENTATION', // 'FALSE_REPRESENTATION', 'FRAUD', 'CONCEALING_MATERIAL_CIRCUMSTANCES', 'UNSUBSTANTIATED'
    allegationContext = 'RESIDENCE_CALCULATION', // 'RESIDENCE_CALCULATION', 'CRIMINAL_RECORD_FAILURE_TO_DISCLOSE', 'IDENTITY_FRAUD'
    yearsAsCanadianCitizen = 8,
    yearsResidingInCanada = 12,
    hasSubstantialTiesToCanada = true,
    hasMinorChildrenAffected = true,
    minorChildrenAreCanadianCitizens = true,
    wouldBeRenderedStateless = false,
    requestedFederalCourtReference = true,
    hasCompellingHAndCGrounds = true
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Citizen', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanNoticeDate = safeIsoDate(noticeOfIntentDate, '2026-10-01');
  const cleanCurrentDate = safeIsoDate(currentDate, cleanAssessmentDate);
  const cleanAllegation = boundedText(allegationType, 'FALSE_REPRESENTATION', 60);
  const cleanContext = boundedText(allegationContext, 'RESIDENCE_CALCULATION', 60);

  const dateNoticeMs = Date.parse(cleanNoticeDate);
  const dateCurrMs = Date.parse(cleanCurrentDate);
  const validDates = Number.isFinite(dateNoticeMs) && Number.isFinite(dateCurrMs);
  const daysElapsed = validDates ? Math.max(0, Math.floor((dateCurrMs - dateNoticeMs) / (1000 * 60 * 60 * 24))) : 0;

  const isWithin30DayWindow = validDates && daysElapsed <= CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS;
  const daysRemainingInWindow = validDates ? Math.max(0, CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS - daysElapsed) : 0;

  const statutoryFindings = [];
  const legalDefenses = [];
  const proceduralRemedies = [];
  const riskWarnings = [];

  // 1. Procedural 30-Day Response Window (Citizenship Act s. 10(4))
  if (isWithin30DayWindow) {
    statutoryFindings.push({
      finding: 'WITHIN_STATUTORY_RESPONSE_WINDOW',
      section: 'Citizenship Act s. 10(4)',
      details: `${daysElapsed} days have elapsed since Notice of Intent. ${daysRemainingInWindow} calendar day(s) remain to file written response or request Federal Court trial.`
    });
    proceduralRemedies.push(
      'Submit written submissions to IRCC Minister under s. 10(3) requesting consideration of personal hardship and humanitarian & compassionate (H&C) factors.',
      'Elect to have the matter referred to the Federal Court under s. 10.1 for a full judicial determination by an independent judge.'
    );
  } else {
    statutoryFindings.push({
      finding: 'STATUTORY_WINDOW_EXPIRED',
      section: 'Citizenship Act s. 10(4)',
      details: `The 30-day response deadline has passed (${daysElapsed} days elapsed). Minister may issue an administrative revocation order without further notice.`
    });
    riskWarnings.push({
      warning: 'DEFAULT_REVOCATION_ORDER_EXPOSURE',
      details: 'Failure to respond within 30 days permits the Minister to revoke citizenship ex parte. Urgent emergency stay application in Federal Court required.'
    });
    proceduralRemedies.push('Retain legal counsel immediately to file an urgent Notice of Application for Judicial Review and motion for stay of execution.');
  }

  // 2. Statelessness Risk Assessment (Citizenship Act s. 10.4 & 1961 Convention on Reduction of Statelessness)
  if (wouldBeRenderedStateless) {
    legalDefenses.push({
      defense: 'STATELESSNESS_INTERNATIONAL_PROHIBITION',
      statute: 'Citizenship Act s. 10.4 & 1961 UN Convention on the Reduction of Statelessness',
      strength: 'HIGH',
      details: 'Under international law and Canadian policy, Canada strives to avoid rendering individuals stateless unless fraud is exceptionally egregious.'
    });
  }

  // 3. Best Interests of the Child (BIOC) & Family Ties
  if (hasMinorChildrenAffected) {
    legalDefenses.push({
      defense: 'BEST_INTERESTS_OF_AFFECTED_CHILDREN',
      statute: 'Citizenship Act s. 10(3) & Baker v. Canada, [1999] 2 SCR 817',
      strength: 'HIGH',
      details: `Minor children (${minorChildrenAreCanadianCitizens ? 'Canadian Citizens' : 'Dependents'}) will suffer severe emotional, educational, and developmental harm if parent is stripped of status and removed.`
    });
  }

  // 4. Longevity of Canadian Establishment & Inadvertent Misrepresentation
  const citizenYears = Math.max(0, Math.min(100, Number.isFinite(Number(yearsAsCanadianCitizen)) ? Number(yearsAsCanadianCitizen) : 8));
  const totalYears = Math.max(0, Math.min(120, Number.isFinite(Number(yearsResidingInCanada)) ? Number(yearsResidingInCanada) : 12));

  if (citizenYears >= 5 && totalYears >= 10 && hasSubstantialTiesToCanada) {
    legalDefenses.push({
      defense: 'DEEP_ECONOMIC_AND_SOCIAL_ESTABLISHMENT',
      statute: 'Citizenship Act s. 10(3)',
      strength: 'MODERATE_TO_HIGH',
      details: `Applicant has ${citizenYears} years as a citizen and ${totalYears} years in Canada. Severing citizenship after extensive established community life invokes compelling H&C discretion.`
    });
  }

  if (cleanAllegation === 'CONCEALING_MATERIAL_CIRCUMSTANCES' || cleanAllegation === 'FALSE_REPRESENTATION') {
    legalDefenses.push({
      defense: 'LACK_OF_MATERIALITY_OR_INNOCENT_MISTAKE',
      statute: 'Medel v. Canada (MEI), [1990] 2 F.C. 345 (FCA)',
      strength: 'MODERATE',
      details: 'Misrepresentation must be MATERIAL—if true facts were disclosed, would the citizenship or PR decision have been different? Innocent clerical error does not equal fraud.'
    });
  }

  const overallDefensibilityScore = legalDefenses.length >= 3 ? 'STRONG_DEFENSE_CASE' : (legalDefenses.length >= 1 ? 'VIABLE_DEFENSE_CASE' : 'VULNERABLE_POSITION');

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    procedure: 'CITIZENSHIP_REVOCATION_DEFENSE',
    proceduralAudit: {
      noticeOfIntentDate: cleanNoticeDate,
      currentDate: cleanCurrentDate,
      daysElapsedSinceNotice: daysElapsed,
      daysRemainingInResponseWindow: daysRemainingInWindow,
      isWithinStatutoryThirtyDayWindow: isWithin30DayWindow
    },
    defensibilityStatus: overallDefensibilityScore,
    legalDefenses,
    statutoryFindings,
    proceduralRemedies,
    riskWarnings,
    statutoryCitations: [
      'Citizenship Act, R.S.C. 1985, c. C-29, ss. 10(1), 10(3), 10(4), 10.1, 10.4',
      'Canada (Minister of Citizenship and Immigration) v. Hassouna, 2017 FC 473',
      'Vavilov v. Canada (Citizenship and Immigration), 2019 SCC 65',
      'Convention on the Reduction of Statelessness (1961)'
    ]
  };
}
