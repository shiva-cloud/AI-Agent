// src/pr-matrix-simulator.js
// Cross-Corridor Comparative Permanent Residency & Talent Matrix Simulator.
// Evaluates applicant profile side-by-side across major destinations: Canada, Australia, Germany, UK, New Zealand.

import { factValue } from './kb-facts.js';
import { boundedText, safeIsoDate } from './text-input.js';

// Figures from src/kb-facts.js, formatted for messages.
const gbp = key => `£${factValue(key).toLocaleString('en-US')}`;
const cad = n => `CAD $${n.toLocaleString('en-US')}`;


export function evaluatePrMatrix(rawInput = {}) {
  const input = rawInput || {};
  const applicantName = boundedText(input.applicantName, 'Candidate', 120);
  const assessmentDate = safeIsoDate(input.assessmentDate);
  const age = Math.max(18, Math.min(100, Number(input.age) || 28));
  const education = boundedText(input.educationLevel, 'bachelors', 60).toLowerCase();
  const experienceYears = Math.max(0, Math.min(50, Number(input.yearsExperience) || 3));
  const clb = Math.max(0, Math.min(12, Number(input.clbScore || input.englishLanguageScore) || 8));
  const hasJobOffer = Boolean(input.hasJobOffer);
  const frenchOrGermanSkill = Boolean(input.hasSecondaryLanguage);
  const targetCorridors = Array.isArray(input.targetCorridors) && input.targetCorridors.length > 0 
    ? input.targetCorridors.map(c => boundedText(c, '', 10).toUpperCase()).filter(Boolean) 
    : ['CA', 'AU', 'DE', 'UK', 'NZ'];

  const evaluations = [];

  // 1. CANADA EVALUATION (Express Entry FSW / Category Draws)
  if (targetCorridors.includes('CA')) {
    let crsEstimate = 0;
    // Age points (Max 110 at age 20-29)
    if (age >= 20 && age <= 29) crsEstimate += 110;
    else if (age <= 35) crsEstimate += Math.max(70, 110 - (age - 29) * 5);
    else crsEstimate += Math.max(0, 70 - (age - 35) * 6);

    // Education
    if (education.includes('phd')) crsEstimate += 150;
    else if (education.includes('master')) crsEstimate += 135;
    else if (education.includes('bachelor') || education.includes('degree')) crsEstimate += 120;
    else crsEstimate += 90;

    // Language
    if (clb >= 9) crsEstimate += 136;
    else if (clb >= 8) crsEstimate += 110;
    else if (clb >= 7) crsEstimate += 80;
    else crsEstimate += 40;

    // Skill Transferability Factors (Official IRCC CRS Grid)
    // Education + Official Language (Max 50)
    if (education.includes('master') || education.includes('phd')) {
      if (clb >= 9) crsEstimate += 50;
      else if (clb >= 7) crsEstimate += 25;
    } else if (education.includes('bachelor')) {
      if (clb >= 9) crsEstimate += 25;
      else if (clb >= 7) crsEstimate += 13;
    }

    // Foreign Work Experience + Official Language (Max 50)
    if (experienceYears >= 3) {
      if (clb >= 9) crsEstimate += 50;
      else if (clb >= 7) crsEstimate += 25;
    } else if (experienceYears >= 1) {
      if (clb >= 9) crsEstimate += 25;
      else if (clb >= 7) crsEstimate += 13;
    }

    // French language bonus
    if (frenchOrGermanSkill) crsEstimate += 50;
    if (hasJobOffer) crsEstimate += 50;

    const isCompetitive = crsEstimate >= 490 || (frenchOrGermanSkill && crsEstimate >= 430);
    evaluations.push({
      corridor: 'CA',
      corridorName: 'Canada',
      primaryPathway: frenchOrGermanSkill ? 'Express Entry French Category / STEM Category' : 'Express Entry FSW / Canadian Experience Class',
      estimatedScore: crsEstimate,
      scoreMetric: 'CRS (out of 1200)',
      competitivenessTier: isCompetitive ? 'HIGH_COMPETITIVENESS' : crsEstimate >= 450 ? 'MODERATE_VIABLE' : 'NEEDS_PNP_OR_FRENCH',
      estimatedMonthsToPr: 6,
      estimatedGovernmentFeesUsd: 1475,
      proofOfFundsRequiredUsd: 10400,
      statutoryLegalBasis: 'Immigration and Refugee Protection Act (IRPA) s. 10.2 & IRPR s. 87.1/87.2',
      keyMilestones: [
        'ECA credential equivalency from WES/ICAS (4 weeks)',
        'IELTS General / CELPIP exam (CLB 9 target)',
        'Express Entry Pool Profile submission',
        'ITA (Invitation to Apply) issuance',
        'e-APR submission with PCC and Medicals',
        'COPR (Confirmation of Permanent Residence) issued within 6 months'
      ],
      bottlenecksAndRisks: crsEstimate < 490 
        ? 'General all-program CRS cutoff exceeds 500. Recommend targeting French Category-based selection or Provincial Nominee Program (OINP/BCPNP) for +600 points.'
        : `Ensure proof of settlement funds (${cad(factValue('ca.expressEntry.settlementFundsCad')[1])} for 1 person) meets strict liquid unencumbered cash requirements.`
    });
  }

  // 2. AUSTRALIA EVALUATION (Points-tested Subclass 189 / 190)
  if (targetCorridors.includes('AU')) {
    let auPoints = 0;
    // Age (25-32 = 30 pts)
    if (age >= 25 && age <= 32) auPoints += 30;
    else if (age >= 18 && age <= 24) auPoints += 25;
    else if (age >= 33 && age <= 39) auPoints += 25;
    else if (age >= 40 && age <= 44) auPoints += 15;

    // English (Superior IELTS 8+ = 20 pts, Proficient IELTS 7+ = 10 pts)
    if (clb >= 9) auPoints += 20;
    else if (clb >= 7) auPoints += 10;

    // Experience (Outside Australia: 3-4 yrs = 5, 5-7 yrs = 10, 8+ yrs = 15)
    if (experienceYears >= 8) auPoints += 15;
    else if (experienceYears >= 5) auPoints += 10;
    else if (experienceYears >= 3) auPoints += 5;

    // Qualification
    if (education.includes('phd')) auPoints += 20;
    else if (education.includes('bachelor') || education.includes('master')) auPoints += 15;
    else auPoints += 10;

    // Single applicant bonus
    auPoints += 10;

    const isCompetitive = auPoints >= 85;
    evaluations.push({
      corridor: 'AU',
      corridorName: 'Australia',
      primaryPathway: isCompetitive ? 'Subclass 189 Skilled Independent Visa' : 'Subclass 190 Skilled Nominated Visa (+5 pts state sponsorship)',
      estimatedScore: auPoints,
      scoreMetric: 'Points Test (Pass Mark 65, Competitive 85+)',
      competitivenessTier: isCompetitive ? 'HIGH_COMPETITIVENESS' : auPoints >= 75 ? 'MODERATE_VIABLE' : 'NEEDS_STATE_NOMINATION',
      estimatedMonthsToPr: 12,
      estimatedGovernmentFeesUsd: 3100,
      proofOfFundsRequiredUsd: 3500,
      statutoryLegalBasis: 'Migration Act 1958 & Migration Regulations 1994 Schedule 6D',
      keyMilestones: [
        'Skills Assessment via ACS / VETASSESS / Engineers Australia (8-12 weeks)',
        'IELTS / PTE Academic Superior English test',
        'SkillSelect Expression of Interest (EOI) submission',
        'State Nomination or Home Affairs Invitation round',
        'Subclass 189/190 Visa lodgement with police checks & health exams',
        'Direct Permanent Resident Visa Grant'
      ],
      bottlenecksAndRisks: auPoints < 85
        ? 'Subclass 189 invitation rounds in IT and Finance currently require 85-90+ points. State Nomination (Subclass 190 in NSW/VIC) is recommended.'
        : 'VETASSESS or ACS Skills Assessment requires strict verification of employment reference letters and statutory declarations.'
    });
  }

  // 3. GERMANY EVALUATION (Chancenkarte & EU Blue Card)
  if (targetCorridors.includes('DE')) {
    let dePoints = 0;
    // Chancenkarte points
    if (education.includes('bachelor') || education.includes('master') || education.includes('phd')) dePoints += 4; // Recognized degree
    if (experienceYears >= 5) dePoints += 3;
    else if (experienceYears >= 2) dePoints += 2;
    if (clb >= 8) dePoints += 1; // English B2/C1
    if (frenchOrGermanSkill) dePoints += 2; // German A2/B1
    if (age <= 35) dePoints += 2;
    else if (age <= 40) dePoints += 1;

    const qualifiesChancenkarte = dePoints >= 6;
    const qualifiesBlueCard = (education.includes('bachelor') || education.includes('master')) && hasJobOffer;

    evaluations.push({
      corridor: 'DE',
      corridorName: 'Germany',
      primaryPathway: qualifiesBlueCard 
        ? 'EU Blue Card (§ 18g AufenthG) -> Fast-Track PR (Niederlassungserlaubnis in 21-27 months)' 
        : 'Chancenkarte Opportunity Card (§ 20a AufenthG) 1-Year Jobseeker with 20h secondary work rights',
      estimatedScore: dePoints,
      scoreMetric: 'Chancenkarte Points (Pass Mark 6 points)',
      competitivenessTier: qualifiesBlueCard ? 'HIGH_COMPETITIVENESS' : qualifiesChancenkarte ? 'MODERATE_VIABLE' : 'NEEDS_GERMAN_OR_DEGREE_EQUIV',
      estimatedMonthsToPr: qualifiesBlueCard ? 21 : 36,
      estimatedGovernmentFeesUsd: 110,
      proofOfFundsRequiredUsd: 12900, // Sperrkonto Blocked Account €11,904
      statutoryLegalBasis: 'Aufenthaltsgesetz (AufenthG) §§ 18g, 20a, and 18c (Niederlassungserlaubnis)',
      keyMilestones: [
        'ZAB Degree Statement of Comparability / Anabin database match',
        'Blocked Account (Sperrkonto €11,904) or compliant employment contract',
        'Consular Visa or Chancenkarte application at German Embassy',
        'Anmeldung city registration upon arrival in Germany',
        'Transition to EU Blue Card with salary threshold (€45,300 shortage / €50,700 standard)',
        'Niederlassungserlaubnis Permanent Residency after 21 months (with B1 German) or 27 months (with A1)'
      ],
      bottlenecksAndRisks: !qualifiesBlueCard && !hasJobOffer
        ? 'Chancenkarte requires Sperrkonto (€11,904 locked funds) and proof of health insurance. Fast PR requires landing an employment contract meeting statutory salary limits.'
        : 'Basic German language (B1 CEFR) accelerates permanent residency from 27 months down to 21 months.'
    });
  }

  // 4. UNITED KINGDOM EVALUATION (Skilled Worker & Global Talent)
  if (targetCorridors.includes('UK')) {
    const isTechOrAcademic = education.includes('phd') || (education.includes('master') && experienceYears >= 4);
    evaluations.push({
      corridor: 'UK',
      corridorName: 'United Kingdom',
      primaryPathway: isTechOrAcademic 
        ? 'Global Talent Visa (endorsed by an approved body such as the Royal Society) - Unsponsored PR in 3 years'
        : `Skilled Worker Visa (${gbp('uk.skilledWorker.generalThresholdGbp')} minimum salary / Certificate of Sponsorship) -> ILR in 5 years`,
      estimatedScore: hasJobOffer ? 70 : isTechOrAcademic ? 65 : 40,
      scoreMetric: 'Points-based Immigration System (Mandatory 70 points)',
      competitivenessTier: isTechOrAcademic ? 'HIGH_COMPETITIVENESS' : hasJobOffer ? 'HIGH_COMPETITIVENESS' : 'REQUIRES_SPONSORED_JOB_OFFER',
      estimatedMonthsToPr: isTechOrAcademic ? 36 : 60,
      estimatedGovernmentFeesUsd: 4200, // Includes IHS £1,035/yr surcharge
      proofOfFundsRequiredUsd: 1650, // £1,270 maintenance
      statutoryLegalBasis: 'Immigration Rules Appendix Skilled Worker & Appendix Global Talent, Immigration Act 1971',
      keyMilestones: [
        'Secure Certificate of Sponsorship (CoS) from licensed UK Home Office sponsor',
        `Verify minimum salary (${gbp('uk.skilledWorker.generalThresholdGbp')}, or ${gbp('uk.skilledWorker.newEntrantGbp')} for new entrants under age 26) and an RQF level 6 role`,
        'TB screening and SELT English at B2 (required for new applicants from 8 January 2026)',
        'Visa application with Immigration Health Surcharge (IHS £1,035/year)',
        'Arrival in UK and eVisa set-up (BRPs are no longer issued)',
        'Indefinite Leave to Remain (ILR) application after 5 years continuous residence'
      ],
      bottlenecksAndRisks: !hasJobOffer && !isTechOrAcademic
        ? `UK Skilled Worker visa requires an employer holding a Home Office Sponsor Licence willing to meet the ${gbp('uk.skilledWorker.generalThresholdGbp')} salary threshold. Cannot apply independently without a sponsor unless eligible for Global Talent.`
        : 'Immigration Health Surcharge (£1,035/year) substantially increases upfront legal costs for families.'
    });
  }

  // 5. NEW ZEALAND EVALUATION (6-Point SMC & Green List)
  if (targetCorridors.includes('NZ')) {
    let nzPoints = 0;
    if (education.includes('phd')) nzPoints = 6;
    else if (education.includes('master')) nzPoints = 5;
    else if (education.includes('bachelor')) nzPoints = 3;
    
    // NZ Skilled work experience adds 1 point/year up to 3 points
    if (experienceYears >= 3 && nzPoints < 6) nzPoints = Math.min(6, nzPoints + 2);

    const qualifiesSmc = nzPoints >= 6 && hasJobOffer;
    evaluations.push({
      corridor: 'NZ',
      corridorName: 'New Zealand',
      primaryPathway: qualifiesSmc 
        ? 'Skilled Migrant Category (SMC) 6-Point Resident Visa' 
        : 'Accredited Employer Work Visa (AEWV) -> Green List Straight to Residence',
      estimatedScore: nzPoints,
      scoreMetric: 'SMC Points System (Requires exactly 6 points + NZ job offer)',
      competitivenessTier: qualifiesSmc ? 'HIGH_COMPETITIVENESS' : hasJobOffer ? 'MODERATE_VIABLE' : 'REQUIRES_NZ_JOB_OFFER',
      estimatedMonthsToPr: qualifiesSmc ? 6 : 24,
      estimatedGovernmentFeesUsd: 2600,
      proofOfFundsRequiredUsd: 3000,
      statutoryLegalBasis: 'Immigration Act 2009 & INZ Operational Manual SR (Skilled Migrant Category)',
      keyMilestones: [
        'NZQA International Qualifications Assessment (IQA) for foreign degree',
        'Job offer from INZ-Accredited Employer paying at least median wage ($31.61 NZD/hr)',
        'SMC 6-point Expression of Interest or Green List Straight to Residence application',
        'Direct Resident Visa grant with permanent travel conditions'
      ],
      bottlenecksAndRisks: !hasJobOffer
        ? 'New Zealand SMC strictly requires a job offer paying at or above the median wage ($31.61/hr) from an accredited employer. Independent points alone cannot trigger an invitation without an NZ job offer.'
        : 'Ensure ANZSCO occupation matches skill level 1-3 requirements on the employer Job Check.'
    });
  }

  // Rank evaluations
  const tierOrder = { HIGH_COMPETITIVENESS: 3, MODERATE_VIABLE: 2, NEEDS_STATE_NOMINATION: 1, NEEDS_PNP_OR_FRENCH: 1, NEEDS_GERMAN_OR_DEGREE_EQUIV: 1, REQUIRES_SPONSORED_JOB_OFFER: 0, REQUIRES_NZ_JOB_OFFER: 0 };
  evaluations.sort((a, b) => (tierOrder[b.competitivenessTier] || 0) - (tierOrder[a.competitivenessTier] || 0) || a.estimatedMonthsToPr - b.estimatedMonthsToPr);

  const top = evaluations[0] || null;
  const summary = top 
    ? `Based on your profile (Age ${age}, ${education.toUpperCase()}, ${experienceYears} years experience, CLB ${clb}), your strongest pathway is ${top.corridorName} via ${top.primaryPathway} with an estimated ${top.estimatedMonthsToPr} months to PR and ${top.competitivenessTier.replace(/_/g, ' ')} competitiveness.`
    : 'No matching immigration corridors found for evaluation.';

  return {
    applicantName,
    assessmentDate,
    applicantProfile: {
      applicantName,
      assessmentDate,
      age,
      educationLevel: education,
      yearsExperience: experienceYears,
      languageBenchmarkClb: clb,
      hasJobOffer,
      hasSecondaryLanguage: frenchOrGermanSkill,
      targetCorridors
    },
    topRecommendedCorridor: top,
    evaluations,
    comparativeSummary: summary,
    generatedAt: assessmentDate
  };
}
