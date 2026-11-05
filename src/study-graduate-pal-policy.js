import { ToolInputError } from './api-errors.js';
import { isIsoCalendarDate } from './text-input.js';

export const GRADUATE_PAL_SOURCE = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/graduate-student/how-to-apply.html';
export function graduatePalRequirement(applicationDate, isPublicDli) {
  if (!isIsoCalendarDate(applicationDate)) throw new ToolInputError('Application date must be a valid YYYY-MM-DD date.');
  if (isPublicDli !== undefined && ![true, false, 'true', 'false'].includes(isPublicDli)) throw new ToolInputError('Public DLI must be true or false.');
  if (applicationDate < '2026-01-01' || applicationDate > '2026-11-06') return null;
  if (isPublicDli === undefined) return null;
  return !(isPublicDli === true || isPublicDli === 'true');
}
