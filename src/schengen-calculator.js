// src/schengen-calculator.js
// Deterministic Schengen 90/180-Day Short-Stay Rolling Window Calculator
// Statutory Authority: Regulation (EU) 2016/399 (Schengen Borders Code), Article 6(1)

import { ValidationError } from './api-errors.js';
import { assertCalendarDate } from './evidence-policy.js';
import { boundedText, safeIsoDate } from './text-input.js';

export const SCHENGEN_CONSTANTS = Object.freeze({
  MAX_STAY_DAYS: 90,
  WINDOW_DAYS: 180,
  REGULATION: 'Regulation (EU) 2016/399 (Schengen Borders Code), Article 6(1)'
});

function parseDateUtc(dateStr) {
  assertCalendarDate(dateStr, 'Date');
  const d = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(d.getTime())) throw new ValidationError(`Invalid date string: ${dateStr}`);
  return d;
}

function formatDateUtc(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysUtc(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}



/**
 * Calculates Schengen 90/180-day compliance for a traveler based on past and planned stays.
 *
 * @param {Object} input
 * @param {Array<{ entryDate: string, exitDate: string, isResidencePermitOrVisaD?: boolean }>} input.stays
 * @param {string} [input.checkDate] - Date of border control or assessment (YYYY-MM-DD)
 * @param {number} [input.plannedStayDays] - Optional number of days user intends to spend starting on checkDate
 */
export function calculateSchengenStay({
  stays = [],
  checkDate = formatDateUtc(new Date()),
  plannedStayDays = 0,
  travelerName = 'Traveler',
  assessmentDate = null
} = {}) {
  const safeTraveler = boundedText(travelerName, 'Traveler', 120);
  const effectiveCheckDate = assessmentDate ? safeIsoDate(assessmentDate, checkDate) : checkDate;
  const refDate = parseDateUtc(effectiveCheckDate);
  // The 180-day window looks back exactly 179 days from checkDate (total 180 days inclusive)
  const windowStartDate = addDaysUtc(refDate, -(SCHENGEN_CONSTANTS.WINDOW_DAYS - 1));
  const windowStartStr = formatDateUtc(windowStartDate);
  const checkDateStr = formatDateUtc(refDate);

  // Validate stays
  const sanitizedStays = [];
  for (const s of stays) {
    if (!s || !s.entryDate || !s.exitDate) continue;
    const entry = parseDateUtc(s.entryDate);
    const exit = parseDateUtc(s.exitDate);
    if (exit.getTime() < entry.getTime()) {
      throw new ValidationError(`Exit date ${s.exitDate} cannot be before entry date ${s.entryDate}`);
    }
    // Days covered by a long-stay visa D or residence permit do not count toward 90/180 short-stay limit
    if (!s.isResidencePermitOrVisaD) {
      sanitizedStays.push({ entry, exit, entryStr: s.entryDate, exitStr: s.exitDate });
    }
  }

  // Count each day spent inside Schengen within the 180-day window [windowStartDate, refDate]
  // Both arrival and departure days count as full days under Schengen rules.
  let daysSpentInWindow = 0;
  const daysMap = new Set();

  for (const stay of sanitizedStays) {
    let curr = new Date(stay.entry.getTime());
    while (curr.getTime() <= stay.exit.getTime()) {
      if (curr.getTime() >= windowStartDate.getTime() && curr.getTime() <= refDate.getTime()) {
        const key = formatDateUtc(curr);
        if (!daysMap.has(key)) {
          daysMap.add(key);
          daysSpentInWindow++;
        }
      }
      curr = addDaysUtc(curr, 1);
    }
  }

  const daysRemaining = Math.max(0, SCHENGEN_CONSTANTS.MAX_STAY_DAYS - daysSpentInWindow);
  const isOverstay = daysSpentInWindow > SCHENGEN_CONSTANTS.MAX_STAY_DAYS;
  const overstayDays = isOverstay ? (daysSpentInWindow - SCHENGEN_CONSTANTS.MAX_STAY_DAYS) : 0;

  const safePlannedDays = Math.max(0, Number(plannedStayDays) || 0);
  const canStayForPlannedDays = safePlannedDays > 0 ? (daysSpentInWindow + safePlannedDays <= SCHENGEN_CONSTANTS.MAX_STAY_DAYS) : (daysRemaining > 0);

  let status = 'compliant';
  let guidance = '';

  if (isOverstay) {
    status = 'overstay';
    guidance = `Overstay detected! You have spent ${daysSpentInWindow} days in the Schengen Area in the 180-day window ending ${checkDateStr}, exceeding the 90-day limit by ${overstayDays} day(s). Under Regulation (EU) 2016/399 Art. 6, you face entry bans, detention, and administrative fines upon exit.`;
  } else if (daysSpentInWindow === SCHENGEN_CONSTANTS.MAX_STAY_DAYS) {
    status = 'at_limit';
    guidance = `You have reached the maximum 90-day limit for the 180-day window ending ${checkDateStr}. You must leave the Schengen Area immediately to avoid an unlawful overstay.`;
  } else if (safePlannedDays > 0 && !canStayForPlannedDays) {
    status = 'planned_stay_exceeds';
    guidance = `Your planned trip of ${safePlannedDays} days exceeds your remaining allowance of ${daysRemaining} day(s). You can only legally stay for up to ${daysRemaining} day(s) before exiting.`;
  } else {
    status = 'compliant';
    guidance = `Compliant with Schengen Borders Code. You have used ${daysSpentInWindow} of 90 permitted days. You have ${daysRemaining} day(s) remaining for short stays within the 180-day window ending ${checkDateStr}.`;
  }

  return {
    travelerName: safeTraveler,
    assessmentDate: checkDateStr,
    statutoryBasis: SCHENGEN_CONSTANTS.REGULATION,
    checkDate: checkDateStr,
    windowStartDate: windowStartStr,
    windowEndDate: checkDateStr,
    daysSpentInWindow,
    daysRemaining,
    maxPermittedDays: SCHENGEN_CONSTANTS.MAX_STAY_DAYS,
    isOverstay,
    overstayDays,
    plannedStayDays: safePlannedDays,
    canStayForPlannedDays,
    status,
    guidance
  };
}
