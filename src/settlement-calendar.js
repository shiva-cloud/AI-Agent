// src/settlement-calendar.js
// 180-Day Chronological Settlement Roadmap & RFC 5545 iCalendar Generator
// Pure ES module with zero npm dependencies.

import { ValidationError } from './api-errors.js';
import { assertCalendarDate } from './evidence-policy.js';

function validateCalendar(landingDateStr, milestones) {
  assertCalendarDate(landingDateStr, 'Landing date');
  if (!Array.isArray(milestones)) throw new ValidationError('Milestones must be an array');
  const ids = new Set();
  const landing = new Date(landingDateStr + 'T00:00:00Z');
  for (const [index, item] of milestones.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !Number.isSafeInteger(item.dayOffset)) {
      throw new ValidationError('Each milestone must have an integer day offset');
    }
    for (const key of ['title', 'description']) if (typeof item[key] !== 'string') throw new ValidationError(`Milestone ${key} must be text`);
    for (const key of ['category', 'statute', 'id']) if (item[key] !== undefined && typeof item[key] !== 'string') throw new ValidationError(`Milestone ${key} must be text`);
    const id = item.id || String(index);
    if (ids.has(id)) throw new ValidationError('Milestone IDs must be unique');
    ids.add(id);
    // Both an event's start and its exclusive end must fit a four-digit year.
    for (const offset of [item.dayOffset, item.dayOffset + 1]) {
      const target = new Date(landing.getTime() + offset * 86400000);
      if (!Number.isFinite(target.getTime())) throw new ValidationError('Milestone date is outside the supported range');
      assertCalendarDate(target.toISOString().split('T')[0], 'Milestone date');
    }
  }
  return landing;
}

function escapeIcsText(value) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function foldIcsLine(line) {
  const encoder = new TextEncoder();
  let result = '', bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { result += '\r\n '; bytes = 1; }
    result += character;
    bytes += size;
  }
  return result;
}

export const DEFAULT_SETTLEMENT_MILESTONES = [
  {
    id: 'm-30',
    dayOffset: -30,
    title: 'Pre-Arrival Packing & Goods Manifest Preparation',
    category: 'customs',
    statute: 'Customs Tariff Heading 98.05 / Customs Act s. 32',
    description: 'Itemize personal electronics with serial numbers and used household effects on CBSA Form BSF186 / BSF186A or US CBP Form 3299 for duty-free settler importation.'
  },
  {
    id: 'm-7',
    dayOffset: -7,
    title: 'Currency Declaration & Proof of Funds Assembly',
    category: 'finance',
    statute: 'PCMLTFA s. 12(1) / 31 U.S.C. 5316',
    description: 'Ensure total physical cash and negotiable instruments are counted. Prepare official Form E677 (Canada) or FinCEN 105 (USA) if carrying $10,000 or more.'
  },
  {
    id: 'm-0',
    dayOffset: 0,
    title: 'Port of Entry Landing & Goods Endorsement',
    category: 'immigration',
    statute: 'IRPA s. 19 / INA s. 235',
    description: 'Present passport, Confirmation of Permanent Residence (COPR) or work visa approval, and have the border officer endorse your BSF186 Goods to Follow manifest.'
  },
  {
    id: 'm-3',
    dayOffset: 3,
    title: 'National Identity / SIN / SSN Issuance',
    category: 'identity',
    statute: 'Department of Employment and Social Development Act s. 28.1',
    description: 'Visit a Service Canada Centre or Social Security Administration office with your passport and work permit/COPR to obtain your Social Insurance / Security Number.'
  },
  {
    id: 'm-7-bank',
    dayOffset: 7,
    title: 'Statutory Retail Bank Account Opening',
    category: 'banking',
    statute: 'Bank Act s. 627.17 / US Dodd-Frank Act',
    description: 'Open a local retail bank account. Under Canadian Bank Act s.627.17, banks cannot refuse you an account due to unemployment or lack of initial deposit.'
  },
  {
    id: 'm-14',
    dayOffset: 14,
    title: 'Provincial / Public Health Insurance Registration',
    category: 'health',
    statute: 'Health Insurance Act (Ontario Reg. 552) / Canada Health Act',
    description: 'Apply for provincial health card (OHIP, MSP, AHCIP). Ontario permanently removed the 3-month OHIP wait (Regulation 552), so coverage starts once the application is approved.'
  },
  {
    id: 'm-30-drive',
    dayOffset: 30,
    title: 'Driving Licence Exchange & Experience Letter Credit',
    category: 'driving',
    statute: 'Highway Traffic Act Reg. 340/94',
    description: 'Visit DriveTest / DMV. Submit consular-authenticated foreign driving history extract to skip the 12-month G1 waiting period and book a full G road test.'
  },
  {
    id: 'm-60',
    dayOffset: 60,
    title: 'Child School Enrollment & ISPA Immunization Verification',
    category: 'education',
    statute: 'Education Act s. 49.2 / Immunization of School Pupils Act',
    description: 'Enroll school-age children in local public school catchment. Submit translated foreign immunization records or statutory exemption affidavits before ISPA suspension.'
  },
  {
    id: 'm-90',
    dayOffset: 90,
    title: 'Credit Score Trajectory Review (Keep Utilization < 30%)',
    category: 'finance',
    statute: 'Bank Act / Consumer Protection Framework',
    description: 'Pull first credit score report via Equifax or TransUnion. Confirm credit utilization is under 30% and ensure all utility bills report properly.'
  },
  {
    id: 'm-180',
    dayOffset: 180,
    title: '6-Month Milestone: Tax Residency & Foreign Asset Audit',
    category: 'tax',
    statute: 'Income Tax Act s. 233.3(1) / IRC s. 7701(b)',
    description: 'Review foreign financial accounts and worldwide income. Prepare for annual tax return filing, Form T1135 first-year exemption rules, or IRS FBAR filing.'
  }
];

/**
 * Calculates exact calendar deadlines for settlement milestones
 */
export function calculateMilestoneDeadlines(landingDateStr = '2026-11-01', milestones = DEFAULT_SETTLEMENT_MILESTONES) {
  const landing = validateCalendar(landingDateStr, milestones);
  const now = new Date();

  return milestones.map(m => {
    const target = new Date(landing.getTime() + m.dayOffset * 86400000);
    const dateStr = target.toISOString().slice(0, 10);
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / 86400000);

    let status = 'upcoming';
    if (diffDays < 0) status = 'completed_or_past';
    else if (diffDays <= 7) status = 'imminent';

    return {
      ...m,
      targetDate: dateStr,
      daysFromLanding: m.dayOffset,
      daysRemaining: diffDays,
      status
    };
  });
}

/**
 * Formats a JavaScript Date into iCalendar UTC timestamp format (YYYYMMDDTHHMMSSZ)
 */
export function formatIcsTimestamp(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Formats a Date into iCalendar DATE format (YYYYMMDD)
 */
export function formatIcsDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Generates an RFC 5545 compliant .ics calendar file content
 */
export function generateIcsContent(landingDateStr = '2026-11-01', milestones = DEFAULT_SETTLEMENT_MILESTONES) {
  const landing = validateCalendar(landingDateStr, milestones);
  const nowStamp = formatIcsTimestamp(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northstar Settlement Intelligence//Settlement Roadmap v5.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Northstar 180-Day Settlement Roadmap',
    'X-WR-TIMEZONE:UTC'
  ];

  milestones.forEach((m, idx) => {
    const target = new Date(landing.getTime() + m.dayOffset * 86400000);
    const dateStamp = formatIcsDate(target);
    const nextDay = new Date(target.getTime() + 86400000);
    const nextDayStamp = formatIcsDate(nextDay);
    const uid = `northstar-milestone-${encodeURIComponent(m.id || idx)}-${landingDateStr}@settlement.local`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${dateStamp}`,
      `DTEND;VALUE=DATE:${nextDayStamp}`,
      `SUMMARY:${escapeIcsText(m.title)}`,
      `DESCRIPTION:${escapeIcsText(`${m.description} (Statute: ${m.statute || 'Statutory Requirement'})`)}`,
      `CATEGORIES:${escapeIcsText((m.category || 'SETTLEMENT').toUpperCase())}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(`Reminder: ${m.title}`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
