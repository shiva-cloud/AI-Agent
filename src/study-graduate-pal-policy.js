import { ToolInputError } from './api-errors.js';
import { isIsoCalendarDate } from './text-input.js';

export const GRADUATE_PAL_SOURCE = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/graduate-student/how-to-apply.html';
// The page gives a start date and no end date. Coverage follows a review that stays good for
// a set time; when it lapses the tools abstain until the page is checked and this date moved.
export const GRADUATE_PAL_REVIEWED_ON = '2026-11-07';
export const GRADUATE_PAL_REVIEW_VALID_THROUGH = new Date(Date.parse(`${GRADUATE_PAL_REVIEWED_ON}T00:00:00Z`) + 90 * 86400000).toISOString().slice(0, 10);
export function graduatePalRequirement(applicationDate, isPublicDli) {
  if (!isIsoCalendarDate(applicationDate)) throw new ToolInputError('Application date must be a valid YYYY-MM-DD date.');
  if (isPublicDli !== undefined && ![true, false, 'true', 'false'].includes(isPublicDli)) throw new ToolInputError('Public DLI must be true or false.');
  if (applicationDate < '2026-01-01' || applicationDate > GRADUATE_PAL_REVIEW_VALID_THROUGH) return null;
  if (isPublicDli === undefined) return null;
  return !(isPublicDli === true || isPublicDli === 'true');
}
