// Converts language test results to Canadian Language Benchmark (CLB / NCLC) levels,
// per skill, using IRCC's published test score equivalency charts. A skill's CLB is the
// highest level whose minimum score it meets; the overall level is the lowest skill.
// Reference copy of the charts; always confirm against the official page before applying.

import {boundedText} from './text-input.js';

export const CLB_SOURCE = {
  title: 'IRCC: Language test equivalency charts',
  url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/language-requirements/test-equivalency-charts.html',
  referenceCopy: '2026-11-01'
};

const SKILLS = ['reading', 'writing', 'listening', 'speaking'];

// Minimum score per skill for each CLB level, highest level first: [clb, reading, writing, listening, speaking].
const TABLES = {
  ielts_general: {name: 'IELTS General Training', language: 'English', rows: [
    [10, 8.0, 7.5, 8.5, 7.5], [9, 7.0, 7.0, 8.0, 7.0], [8, 6.5, 6.5, 7.5, 6.5], [7, 6.0, 6.0, 6.0, 6.0],
    [6, 5.0, 5.5, 5.5, 5.5], [5, 4.0, 5.0, 5.0, 5.0], [4, 3.5, 4.0, 4.5, 4.0]]},
  pte_core: {name: 'PTE Core', language: 'English', rows: [
    [10, 88, 90, 89, 89], [9, 78, 88, 82, 84], [8, 69, 79, 71, 76], [7, 60, 69, 60, 68],
    [6, 51, 60, 50, 59], [5, 42, 51, 39, 51], [4, 33, 41, 28, 42]]},
  tcf_canada: {name: 'TCF Canada', language: 'French', rows: [
    [10, 549, 16, 549, 16], [9, 524, 14, 523, 14], [8, 499, 12, 503, 12], [7, 453, 10, 458, 10],
    [6, 406, 7, 398, 7], [5, 375, 6, 369, 6], [4, 342, 4, 331, 4]]},
  tef_canada: {name: 'TEF Canada (scores issued from 11 December 2023)', language: 'French', rows: [
    [10, 546, 558, 546, 556], [9, 503, 512, 503, 518], [8, 462, 472, 462, 494], [7, 434, 428, 434, 456],
    [6, 393, 379, 393, 422], [5, 352, 330, 352, 387], [4, 306, 268, 306, 328]]}
};

export const SUPPORTED_TESTS = ['ielts_general', 'celpip_general', 'pte_core', 'tef_canada', 'tcf_canada'];

const NOT_ACCEPTED = {
  ielts_academic: 'IELTS Academic is not accepted for economic immigration; take IELTS General Training.',
  pte_academic: 'PTE Academic is not accepted; IRCC accepts PTE Core.',
  celpip_ls: 'CELPIP-General LS covers listening and speaking only and is used for citizenship, not economic immigration.'
};

function levelFor(table, skillIndex, score) {
  for (const row of table.rows) if (score >= row[skillIndex + 1]) return row[0];
  return null; // below CLB 4
}

export function convertLanguageScores(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const test = boundedText(safeInput.test, '', 40).toLowerCase();
  if (NOT_ACCEPTED[test]) return {test, accepted: false, message: NOT_ACCEPTED[test], source: CLB_SOURCE};
  if (!SUPPORTED_TESTS.includes(test)) {
    return {test, accepted: false, message: `Choose one of: ${SUPPORTED_TESTS.join(', ')}.`, source: CLB_SOURCE};
  }
  const scores = {};
  for (const skill of SKILLS) {
    const value = Number(safeInput[skill]);
    if (!Number.isFinite(value) || value < 0 || value > 990) return {test, accepted: false, message: `Enter a valid ${skill} score.`, source: CLB_SOURCE};
    scores[skill] = value;
  }

  const perSkill = {};
  if (test === 'celpip_general') {
    // CELPIP-General levels correspond directly to CLB levels.
    for (const skill of SKILLS) perSkill[skill] = scores[skill] >= 4 ? Math.min(12, Math.floor(scores[skill])) : null;
  } else {
    SKILLS.forEach((skill, i) => { perSkill[skill] = levelFor(TABLES[test], i, scores[skill]); });
  }

  const levels = SKILLS.map(s => perSkill[s]);
  const overall = levels.some(l => l === null) ? null : Math.min(...levels);
  const name = test === 'celpip_general' ? 'CELPIP-General' : TABLES[test].name;
  const language = test === 'celpip_general' ? 'English' : TABLES[test].language;
  const benchmark = language === 'French' ? 'NCLC' : 'CLB';
  const label = level => level === null ? `below ${benchmark} 4` : `${benchmark} ${level}`;

  return {
    test, testName: name, language, benchmark, accepted: true,
    perSkill: Object.fromEntries(SKILLS.map(s => [s, {score: scores[s], level: perSkill[s], label: label(perSkill[s])}])),
    overallLevel: overall,
    overallLabel: label(overall),
    milestones: {
      expressEntryMinimumClb7: overall !== null && overall >= 7,
      bilingualBonusFrenchNclc7: language === 'French' && overall !== null && overall >= 7,
      citizenshipSpeakingListeningClb4: perSkill.speaking !== null && perSkill.listening !== null && perSkill.speaking >= 4 && perSkill.listening >= 4
    },
    notes: [
      'Your overall level is your lowest skill; most programs set a minimum for every skill.',
      'For Express Entry, CRS language points stop increasing above CLB 10.',
      'Test results are valid for two years from the test date.',
      'This uses a reference copy of the IRCC charts. Confirm your levels on the official page before applying.'
    ],
    source: CLB_SOURCE
  };
}
