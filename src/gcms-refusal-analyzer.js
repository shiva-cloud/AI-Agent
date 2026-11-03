// src/gcms-refusal-analyzer.js
// Statutory GCMS Refusal Notes Analyzer & Federal Court / Reapplication Remedy Engine
// Based on IRPA s. 179(b), s. 220, s. 22(2), and Federal Court jurisprudence (Vavilov standard of review).

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const KNOWN_GCMS_REFUSAL_GROUNDS = {
  R179b_ASSETS_FUNDS: {
    title: 'Financial Insufficiency & Economic Ties (s. 179(b))',
    officerPhrase: 'I am not satisfied that you have sufficient funds or assets to carry out stated purpose.',
    statutoryRemedy: 'Provide 4–6 months of seasoned, unencumbered bank statements with certified audit trail, valuation of registered immovable property, and source-of-funds deeds (avoid recent unexplained lump-sum deposits).'
  },
  R179b_FAMILY_TIES: {
    title: 'Family Ties in Home Country vs Canada (s. 179(b))',
    officerPhrase: 'Based on your family ties in Canada and in your country of residence, not satisfied you will leave.',
    statutoryRemedy: 'Submit certified birth/marriage certificates of non-accompanying immediate family members (spouse, children, dependent elderly parents) and sworn affidavits of caregiving responsibilities in country of residence.'
  },
  R179b_EMPLOYMENT: {
    title: 'Current Employment Establishment (s. 179(b))',
    officerPhrase: 'Current employment situation does not show you are established in country of residence.',
    statutoryRemedy: 'Obtain a verified employer letter on corporate letterhead stating job title, tenure, annual compensation, approved leave duration, and guaranteed return date, supported by official pay stubs and income tax notices.'
  },
  R179b_PURPOSE: {
    title: 'Purpose of Visit & Travel Plan Credibility (s. 179(b))',
    officerPhrase: 'The purpose of your visit does not appear reasonable given the details provided.',
    statutoryRemedy: 'Draft a detailed day-by-day travel itinerary with refundable hotel bookings, conference invitations, or wedding itineraries, matching the requested duration to available funds.'
  },
  R179b_TRAVEL_HISTORY: {
    title: 'Past Travel History (s. 179(b))',
    officerPhrase: 'Your past travel history does not demonstrate compliant international departures.',
    statutoryRemedy: 'Highlight that travel history is an officer consideration, but absence of international travel cannot be the sole basis for refusal under Federal Court precedent (Dhanoa v. Canada, 2009 FC 729). Prioritize domestic anchors.'
  },
  'R22(2)_DUAL_INTENT': {
    title: 'Misapplication of Dual Intent (IRPA s. 22(2))',
    officerPhrase: 'Applicant has pending permanent resident application or Express Entry profile.',
    statutoryRemedy: 'Invoke IRPA s. 22(2) directly: an intention by a foreign national to become a permanent resident does not preclude them from becoming a temporary resident if they establish intent to leave by the end of authorized stay.'
  }
};

export function analyzeGcmsRefusalNotes(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    refusalCodes = ['R179b_ASSETS_FUNDS', 'R179b_FAMILY_TIES'],
    rawOfficerNotesText = '',
    applicationType = 'visitor_visa', // 'visitor_visa', 'study_permit', 'work_permit'
    daysSinceRefusal = 14,
    applicantName = 'Applicant',
    assessmentDate = todayIso()
  } = safeParams;
  const safeApplicantName = boundedText(applicantName, 120) || 'Applicant';
  const safeApplicationType = boundedText(applicationType, 60) || 'visitor_visa';
  const safeDaysSinceRefusal = Number.isFinite(Number(daysSinceRefusal)) ? Math.max(0, Math.min(3650, Math.floor(Number(daysSinceRefusal)))) : 14;
  const safeAssessmentDate = safeIsoDate(assessmentDate);
  const safeOfficerNotes = boundedText(rawOfficerNotesText, 10000);

  // 1. Detect codes from text if codes not provided or text contains keywords
  const sanitizedInputCodes = Array.isArray(refusalCodes) ? refusalCodes.map(c => boundedText(c, 50)).filter(Boolean) : [];
  const matchedCodes = new Set(sanitizedInputCodes);
  const text = safeOfficerNotes.toLowerCase();

  if (text.includes('sufficient funds') || text.includes('financial') || text.includes('assets') || text.includes('bank')) {
    matchedCodes.add('R179b_ASSETS_FUNDS');
  }
  if (text.includes('family ties') || text.includes('ties in canada') || text.includes('ties in your country')) {
    matchedCodes.add('R179b_FAMILY_TIES');
  }
  if (text.includes('employment') || text.includes('job') || text.includes('established')) {
    matchedCodes.add('R179b_EMPLOYMENT');
  }
  if (text.includes('purpose') || text.includes('itinerary') || text.includes('reasonable')) {
    matchedCodes.add('R179b_PURPOSE');
  }
  if (text.includes('travel history') || text.includes('passport')) {
    matchedCodes.add('R179b_TRAVEL_HISTORY');
  }
  if (text.includes('dual intent') || text.includes('permanent residence') || text.includes('pr pending')) {
    matchedCodes.add('R22(2)_DUAL_INTENT');
  }

  // 2. Build Root Cause Analysis and Tailored Remediation
  const findings = [];
  const requiredEvidenceChecklist = [];
  const jurisprudencePrecedents = [];

  for (const code of matchedCodes) {
    const detail = KNOWN_GCMS_REFUSAL_GROUNDS[code];
    if (!detail) continue;

    findings.push({
      refusalGround: code,
      title: detail.title,
      officerConcern: detail.officerPhrase,
      remedy: detail.statutoryRemedy
    });
    requiredEvidenceChecklist.push(detail.statutoryRemedy);
  }

  // Add Federal Court Precedents
  if (matchedCodes.has('R179b_TRAVEL_HISTORY')) {
    jurisprudencePrecedents.push('Dhanoa v. Canada (MCI), 2009 FC 729: Lack of prior international travel history is neutral, not negative evidence, and cannot independently justify a refusal.');
  }
  if (matchedCodes.has('R22(2)_DUAL_INTENT')) {
    jurisprudencePrecedents.push('Castillo v. Canada (MCI), 2013 FC 1083: Officers commit a reviewable error of law when rejecting a TRV solely because the applicant has an active permanent resident or spousal sponsorship application.');
  }
  if (matchedCodes.has('R179b_FAMILY_TIES')) {
    jurisprudencePrecedents.push('Vavilov v. Canada, 2019 SCC 65: Administrative decisions must exhibit internal reasoning and consider substantial countervailing evidence submitted by the applicant.');
  }

  // 3. Procedural Next Steps (Reapplication vs Judicial Review)
  const isJudicialReviewTimely = safeDaysSinceRefusal <= 60; // 60 days for abroad, 15 days inside Canada
  const recommendedChannel = isJudicialReviewTimely && matchedCodes.has('R22(2)_DUAL_INTENT')
    ? 'Reapplication with statutory legal memorandum (or Federal Court Leave application if legal error is clear).'
    : 'Fresh application with new corroborating evidence package addressing every officer note.';

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    applicationType: safeApplicationType,
    daysSinceRefusal: safeDaysSinceRefusal,
    groundsIdentifiedCount: findings.length,
    refusalFindings: findings,
    statutoryRemedies: requiredEvidenceChecklist,
    federalCourtPrecedents: jurisprudencePrecedents,
    proceduralRemedy: {
      recommendedAction: recommendedChannel,
      isWithinFederalCourtWindow: isJudicialReviewTimely,
      deadlineNotice: 'Applications made outside Canada carry a 60-day deadline from refusal notice for Federal Court judicial review leave.'
    },
    statutoryBasis: 'IRPA s. 179(b), s. 22(2); Federal Court Act s. 18.1.'
  };
}
