import { ToolInputError } from './api-errors.js';
import { isIsoCalendarDate } from './text-input.js';

export const STUDY_FINANCE_SOURCE = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html';
export const STUDY_FINANCE_REVIEWED_ON = '2026-11-06';
// Amounts exclude tuition and transportation; household size includes applicant.
// The source page dated 2026-08-28 was checked on REVIEWED_ON.
const VERSIONS = [
  { from: '2025-01-01', through: '2026-08-31', amounts: [22895, 28502, 35040, 42543, 48252, 54420, 60589], extra: 6170 },
  { from: '2026-09-01', through: STUDY_FINANCE_REVIEWED_ON, amounts: [23448, 29192, 35888, 43572, 49419, 55736, 62054], extra: 6318 }
];
export const STUDY_TRAVEL_PLANNING_ESTIMATE_PER_PERSON = 1500;

export function studyFinancialPolicy({ applicationDate, province, dependents }) {
  if (!isIsoCalendarDate(applicationDate)) throw new ToolInputError('Application date must be a valid YYYY-MM-DD date.');
  if (!Number.isInteger(dependents) || dependents < 0 || dependents > 20) throw new ToolInputError('Dependents must be a whole number between 0 and 20.');
  if (!['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].includes(province)) throw new ToolInputError('Choose a Canadian province or territory.');
  const version = VERSIONS.find(v => applicationDate >= v.from && applicationDate <= v.through);
  const common = { sourceUrl: STUDY_FINANCE_SOURCE, checkedAt: STUDY_FINANCE_REVIEWED_ON, applicationDate, householdSize: dependents + 1,
    travelEstimateBasis: 'Planning allowance only; replace with actual transportation costs. Not an official minimum.' };
  if (province === 'QC' || !version) return { ...common, status: 'POLICY_REVIEW_REQUIRED', livingCostsCad: null, travelEstimateCad: null,
    reason: province === 'QC' ? 'Quebec uses a separate financial-capacity policy.' : 'No reviewed financial policy covers this application date.' };
  const size = dependents + 1;
  return { ...common, status: 'AVAILABLE', version: version.from, livingCostsCad: version.amounts[Math.min(size, 7) - 1] + Math.max(0, size - 7) * version.extra,
    travelEstimateCad: size * STUDY_TRAVEL_PLANNING_ESTIMATE_PER_PERSON };
}
