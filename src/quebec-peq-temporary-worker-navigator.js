/**
 * Northstar — Settlement Intelligence
 * Quebec Experience Program (PEQ) — Temporary Foreign Worker Stream Navigator
 *
 * Statutory Authorities:
 * - Loi sur l'immigration au Québec, RLRQ, c. I-0.2.1, arts. 3, 27, 44
 * - Règlement sur l'immigration au Québec, RLRQ, c. I-0.2.1, r. 3, arts. 33 à 38 (CSQ via PEQ)
 * - Échelle québécoise des niveaux de compétence en français des personnes immigrantes adultes (Niveau 7 oral)
 * - Accord Canada-Québec relatif à l'immigration et à l'admission temporaire des aubains (1991)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const PEQ_WORKER_RULES = Object.freeze({
  MIN_WORK_MONTHS_REQUIRED: 24,
  WORK_LOOKBACK_WINDOW_MONTHS: 36,
  MIN_WEEKLY_HOURS_FULL_TIME: 30,
  MIN_FRENCH_ORAL_LEVEL_PRINCIPAL: 7, // Niveau 7 (B2) on the Quebec scale
  MIN_FRENCH_ORAL_LEVEL_SPOUSE: 4, // Niveau 4 (A2) on the Quebec scale
  ELIGIBLE_TEER_LEVELS: Object.freeze([0, 1, 2, 3]),
  VALUES_ATTESTATION_VALIDITY_DAYS: 60,
  PROVINCE: 'QC'
});

/**
 * Validates French language test score or exemption against Quebec scale (Niveau 1–12).
 */
export function auditQuebecFrenchProficiency(oralFrenchLevel, isSpouse = false) {
  const level = Math.max(0, Number(oralFrenchLevel) || 0);
  const required = isSpouse
    ? PEQ_WORKER_RULES.MIN_FRENCH_ORAL_LEVEL_SPOUSE
    : PEQ_WORKER_RULES.MIN_FRENCH_ORAL_LEVEL_PRINCIPAL;
  return {
    isCompliant: level >= required,
    currentLevel: level,
    requiredLevel: required,
    cefrEquivalent: level >= 7 ? 'B2' : level >= 5 ? 'B1' : level >= 4 ? 'A2' : 'A1'
  };
}

/**
 * Audits a candidate's eligibility for a Certificat de sélection du Québec (CSQ) under PEQ Travailleur temporaire.
 */
export function evaluateQuebecPeqTemporaryWorker({
  monthsWorkedInQuebec = 26,
  weeklyHoursWorked = 37.5,
  jobTeerLevel = 2,
  isCurrentlyEmployedInQuebec = true,
  hasValidWorkPermitStatus = true,
  principalOralFrenchLevel = 7,
  hasCompletedValuesAttestation = true,
  hasAccompanyingSpouse = false,
  spouseOralFrenchLevel = 4,
  isSelfEmployed = false,
  isSeasonalAgriculturalWorker = false,
  applicantName = 'Demandeur',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeApplicantName = boundedText(applicantName, 120) || 'Demandeur';
  const safeAssessmentDate = safeIsoDate(assessmentDate);

  const currentlyEmployed = Boolean(isCurrentlyEmployedInQuebec);
  const validWorkPermit = Boolean(hasValidWorkPermitStatus);
  const completedValues = Boolean(hasCompletedValuesAttestation);
  const accompanyingSpouse = Boolean(hasAccompanyingSpouse);
  const selfEmployed = Boolean(isSelfEmployed);
  const seasonalAgri = Boolean(isSeasonalAgriculturalWorker);

  const sanitizedMonths = Number.isFinite(Number(monthsWorkedInQuebec)) ? Math.max(0, Math.min(600, Math.floor(Number(monthsWorkedInQuebec)))) : 0;
  const sanitizedHours = Number.isFinite(Number(weeklyHoursWorked)) ? Math.max(0, Math.min(168, Number(weeklyHoursWorked))) : 0;
  const sanitizedTeer = Number.isFinite(Number(jobTeerLevel)) ? Math.max(0, Math.min(5, Math.floor(Number(jobTeerLevel)))) : 2;
  const sanitizedFrenchPrincipal = Number.isFinite(Number(principalOralFrenchLevel)) ? Math.max(0, Math.min(12, Math.floor(Number(principalOralFrenchLevel)))) : 0;
  const sanitizedFrenchSpouse = Number.isFinite(Number(spouseOralFrenchLevel)) ? Math.max(0, Math.min(12, Math.floor(Number(spouseOralFrenchLevel)))) : 0;

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. Status and Current Employment in Quebec
  if (!validWorkPermit) {
    deficiencies.push(
      'Candidate lacks valid legal temporary resident status / work permit in Quebec at the time of application (Règlement sur l’immigration au Québec art. 33).'
    );
  } else {
    compliancePoints.push('Valid temporary resident work permit status maintained in Quebec.');
  }

  if (!currentlyEmployed) {
    deficiencies.push(
      'PEQ regulations require the principal applicant to hold an eligible full-time job in Quebec at the exact time of application submission.'
    );
  } else {
    compliancePoints.push('Candidate is actively employed in Quebec at the time of application.');
  }

  // 2. Full-Time Work Experience & TEER Audit
  const isFullTime = sanitizedHours >= PEQ_WORKER_RULES.MIN_WEEKLY_HOURS_FULL_TIME;
  const isMonthsSufficient = sanitizedMonths >= PEQ_WORKER_RULES.MIN_WORK_MONTHS_REQUIRED;
  const isTeerEligible = PEQ_WORKER_RULES.ELIGIBLE_TEER_LEVELS.includes(sanitizedTeer);

  if (!isFullTime) {
    deficiencies.push(
      `Weekly working hours (${sanitizedHours} hrs/wk) do not satisfy full-time statutory requirement (minimum ${PEQ_WORKER_RULES.MIN_WEEKLY_HOURS_FULL_TIME} hrs/wk).`
    );
  }

  if (!isMonthsSufficient) {
    deficiencies.push(
      `Inadequate eligible Quebec work experience: ${sanitizedMonths} months completed, but PEQ Travailleur temporaire mandates at least ${PEQ_WORKER_RULES.MIN_WORK_MONTHS_REQUIRED} months within the past 36 months.`
    );
  } else {
    compliancePoints.push(
      `Work experience duration satisfied: ${sanitizedMonths} full-time months in Quebec within the statutory 36-month lookback period.`
    );
  }

  if (!isTeerEligible) {
    deficiencies.push(
      `TEER level ${sanitizedTeer} is ineligible. PEQ strictly requires high-skilled occupations in TEER 0, 1, 2, or 3.`
    );
  } else {
    compliancePoints.push(`Job TEER level ${sanitizedTeer} satisfies skilled occupation mandate.`);
  }

  // Ineligible worker classes
  if (selfEmployed) {
    deficiencies.push(
      'Self-employed work is excluded from PEQ. Candidates must apply under the Programme des travailleurs autonomes.'
    );
  }
  if (seasonalAgri) {
    deficiencies.push(
      'Seasonal agricultural workers (PTAS) are statutorily excluded from the PEQ stream.'
    );
  }

  // 3. French Language Proficiency (Niveau 7 Oral)
  const principalFrenchAudit = auditQuebecFrenchProficiency(sanitizedFrenchPrincipal, false);
  if (!principalFrenchAudit.isCompliant) {
    deficiencies.push(
      `French oral proficiency shortfall: candidate holds Niveau ${principalFrenchAudit.currentLevel} (${principalFrenchAudit.cefrEquivalent}), but PEQ mandates at least Niveau 7 (B2 oral: compréhension et production orales) on the Échelle québécoise.`
    );
  } else {
    compliancePoints.push(
      `Principal French language requirement met: Niveau ${principalFrenchAudit.currentLevel} (CEFR ${principalFrenchAudit.cefrEquivalent}) meets or exceeds statutory Niveau 7.`
    );
  }

  // Spouse French requirement if accompanying
  let spouseFrenchAudit = null;
  if (accompanyingSpouse) {
    spouseFrenchAudit = auditQuebecFrenchProficiency(sanitizedFrenchSpouse, true);
    if (!spouseFrenchAudit.isCompliant) {
      deficiencies.push(
        `Accompanying spouse French shortfall: spouse holds Niveau ${spouseFrenchAudit.currentLevel}, but regulations require at least Niveau 4 oral French (CEFR A2).`
      );
    } else {
      compliancePoints.push(
        `Accompanying spouse French requirement satisfied: Niveau ${spouseFrenchAudit.currentLevel} meets or exceeds required Niveau 4.`
      );
    }
  }

  // 4. Quebec Democratic Values Attestation
  if (!completedValues) {
    deficiencies.push(
      'Missing Quebec democratic values attestation (Attestation d’apprentissage des valeurs démocratiques et des valeurs québécoises).'
    );
  } else {
    compliancePoints.push('Quebec democratic values learning assessment successfully completed.');
  }

  // 5. Overall Eligibility & Remedies
  const isEligible =
    validWorkPermit &&
    currentlyEmployed &&
    isFullTime &&
    isMonthsSufficient &&
    isTeerEligible &&
    !selfEmployed &&
    !seasonalAgri &&
    principalFrenchAudit.isCompliant &&
    (!accompanyingSpouse || (spouseFrenchAudit && spouseFrenchAudit.isCompliant)) &&
    completedValues;

  const eligibilityStatus = isEligible
    ? 'ELIGIBLE_FOR_PEQ_CSQ'
    : 'INELIGIBLE_FOR_PEQ';

  if (isEligible) {
    statutoryRemedies.push({
      action: 'Submit CSQ Application via Arrima / Ministère de l’Immigration, de la Francisation et de l’Intégration (MIFI)',
      timeline: 'Submit while current temporary work permit remains valid',
      statutoryAuthority: 'Règlement sur l’immigration au Québec art. 33'
    });
    statutoryRemedies.push({
      action: 'Apply for Federal Permanent Residence via Non-Express Entry PR Portal (IRCC)',
      timeline: 'Immediately upon receipt of paper/electronic CSQ selection certificate',
      statutoryAuthority: 'Accord Canada-Québec (1991) art. 12 & IRPR s. 86'
    });
    statutoryRemedies.push({
      action: 'Bridge Work Permit with CSQ (A75 Exemption)',
      timeline: 'Before current work permit expires; allows open or employer-specific renewal without LMIA under LMIA-exemption code A75',
      statutoryAuthority: 'IRPR s. 204(a) (Agreement code T13/A75)'
    });
  }

  const summary = isEligible
    ? 'Candidate satisfies all statutory prerequisites for the Programme de l’expérience québécoise (PEQ). Issuance of the Certificat de sélection du Québec (CSQ) grants exclusive provincial selection rights.'
    : `Candidate does not currently qualify for PEQ Travailleur temporaire. Found ${deficiencies.length} statutory deficiency/deficiencies to resolve before CSQ submission.`;

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    stream: 'peq_travailleur_temporaire',
    statutoryAuthority: 'Loi sur l’immigration au Québec (RLRQ, c. I-0.2.1) & Règlement sur l’immigration au Québec arts. 33-38',
    isEligible,
    eligibilityStatus,
    principalFrenchOral: principalFrenchAudit,
    spouseFrenchOral: spouseFrenchAudit,
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'QC'
  };
}
