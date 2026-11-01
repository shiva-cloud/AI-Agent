// src/ats-matcher.js
// Production ATS resume matcher, buzzword stripper, and privacy auditor
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const BUZZWORDS = [
  'rockstar', 'ninja', 'guru', 'wizard', 'hard-working', 'go-getter',
  'synergy', 'team player', 'results-driven', 'dynamic', 'self-starter',
  'thought leader', 'out-of-the-box', 'detail-oriented', 'strategic thinker'
];

export const PRIVACY_FLAGS = [
  { id: 'sin_ssn', pattern: /\b(?:\d{3}-\d{3}-\d{3}|\d{3}-\d{2}-\d{4})\b/, label: 'Social Insurance / Security Number detected (Never include on CV)' },
  { id: 'dob', pattern: /\b(?:date of birth|d\.o\.b|born on|birthdate)\b/i, label: 'Date of birth / Age detected (Violates equal opportunity hiring)' },
  { id: 'marital_status', pattern: /\b(?:marital status|single|married|divorced|widowed)\b/i, label: 'Marital status detected (Statutorily prohibited in Canada/US/UK)' },
  { id: 'photo', pattern: /\b(?:photo|headshot|picture attached)\b/i, label: 'Photo / Headshot reference (Causes automatic ATS rejection)' },
  { id: 'religion_caste', pattern: /\b(?:religion|caste|creed|denomination)\b/i, label: 'Religion / Caste reference (Prohibited under Human Rights Codes)' }
];

export const STANDARD_TECH_KEYWORDS = [
  'typescript', 'javascript', 'python', 'node.js', 'sql', 'postgresql',
  'sqlite', 'mysql', 'mongodb', 'restful', 'apis', 'graphql', 'aws', 'gcp',
  'azure', 'docker', 'kubernetes', 'ci/cd', 'pipelines', 'automated testing',
  'jest', 'microservices', 'distributed systems', 'agile', 'scrum',
  'code review', 'mentoring', 'architecture', 'scalability', 'security',
  'react', 'next.js', 'linux', 'git', 'system design', 'data modeling',
  'performance optimization', 'terraform', 'redis', 'kafka'
];

/**
 * Normalizes text for ATS token matching
 */
export function normalizeAtsText(text = '') {
  const bounded = boundedText(text, '', 50000);
  return bounded
    .toLowerCase()
    .replace(/(?<=\w)\.(?=\w)/g, '___DOT___') // preserve inner dots like node.js
    .replace(/[^\w\s+-]/g, ' ')
    .replace(/___DOT___/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts target keywords present in a Job Description
 */
export function extractJdKeywords(jdText = '', customKeywords = STANDARD_TECH_KEYWORDS) {
  const norm = normalizeAtsText(jdText);
  const keywordsList = Array.isArray(customKeywords) ? customKeywords : STANDARD_TECH_KEYWORDS;
  return keywordsList.filter(k => {
    const kNorm = normalizeAtsText(k);
    if (!kNorm) return false;
    if (norm.includes(kNorm)) return true;
    // Check common stem (e.g. mentor -> mentoring)
    if (kNorm.endsWith('ing') && norm.includes(kNorm.slice(0, -3))) return true;
    if (kNorm.endsWith('s') && norm.includes(kNorm.slice(0, -1))) return true;
    return false;
  });
}

/**
 * Audits a CV for privacy red flags and buzzwords
 */
export function auditCvPrivacyAndStyle(cvText = '') {
  const cleanCv = boundedText(cvText, '', 50000);
  const flags = [];
  for (const p of PRIVACY_FLAGS) {
    if (p.pattern.test(cleanCv)) {
      flags.push({ id: p.id, label: p.label });
    }
  }

  const norm = normalizeAtsText(cleanCv);
  const detectedBuzzwords = BUZZWORDS.filter(b => norm.includes(b.toLowerCase()));

  return {
    privacyClean: flags.length === 0,
    privacyFlags: flags,
    buzzwordsClean: detectedBuzzwords.length === 0,
    detectedBuzzwords
  };
}

/**
 * Evaluates semantic ATS alignment between CV and target Job Description
 */
export function scoreCvAgainstJd({ cvText = '', jdText = '', customKeywords = STANDARD_TECH_KEYWORDS, assessmentDate = '2026-10-31' } = {}) {
  const cleanCv = boundedText(cvText, '', 50000);
  const cleanJd = boundedText(jdText, '', 50000);
  const cleanDate = safeIsoDate(assessmentDate, '2026-10-31');
  const targetKeywords = extractJdKeywords(cleanJd, customKeywords);
  const normCv = normalizeAtsText(cleanCv);

  const matched = [];
  const missing = [];

  for (const k of targetKeywords) {
    if (normCv.includes(k.toLowerCase())) {
      matched.push(k);
    } else {
      missing.push(k);
    }
  }

  const matchScore = targetKeywords.length > 0
    ? Math.round((matched.length / targetKeywords.length) * 100)
    : 100;

  const audit = auditCvPrivacyAndStyle(cleanCv);

  let recommendationTier = 'excellent';
  let guidance = 'Strong ATS alignment! Your CV directly reflects the core requirements of this role.';

  if (audit.privacyFlags.length > 0) {
    recommendationTier = 'critical_fix';
    guidance = 'CRITICAL: Remove personal privacy identifiers (SIN/DOB/Photo/Marital status) immediately to comply with anti-discrimination laws.';
  } else if (matchScore < 50) {
    recommendationTier = 'low';
    guidance = 'Low ATS alignment. Essential technical competencies from the job description are missing from your resume.';
  } else if (matchScore < 75) {
    recommendationTier = 'moderate';
    guidance = 'Moderate alignment. Incorporate missing target keywords into your measurable project achievement bullets.';
  }

  return {
    assessmentDate: cleanDate,
    matchScore,
    recommendationTier,
    guidance,
    targetKeywordsCount: targetKeywords.length,
    matched,
    missing,
    audit
  };
}
