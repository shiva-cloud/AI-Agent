// src/timeline-calendar-sync.js
// Statutory Timeline & Calendar Sync Engine.
// Computes statutory milestones and generates RFC 5545 iCalendar (.ics) files for Google Calendar, Apple Calendar, and Outlook.

import { boundedText, safeIsoDate } from './text-input.js';

export function generateIcsCalendar(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northstar Settlement Intelligence//Immigration Timeline//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Newcomer Statutory Timeline',
    'X-WR-TIMEZONE:UTC'
  ];

  const pad = n => String(n).padStart(2, '0');
  const formatIcsDate = d => {
    const rawDt = new Date(d);
    const dt = !Number.isNaN(rawDt.getTime()) ? rawDt : new Date('2026-10-31T00:00:00Z');
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
  };

  const now = formatIcsDate(new Date());

  for (const ev of events) {
    const startStr = formatIcsDate(ev.startDate);
    const endStr = formatIcsDate(new Date(new Date(ev.startDate).getTime() + (ev.durationHours || 1) * 3600000));
    const uid = `northstar-${Math.random().toString(36).substring(2, 10)}-${Date.now()}@northstar.settlement`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${ev.title.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, ' ')}`,
      `CATEGORIES:IMMIGRATION,STATUTORY,SETTLEMENT`,
      `STATUS:CONFIRMED`,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${ev.title.replace(/[,;]/g, ' ')}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function evaluateStatutoryTimeline(input = {}) {
  const milestoneType = boundedText(input.milestoneType, 'work_permit_expiry', 50); // 'work_permit_expiry', 'arrival_date', 'lease_notice', 'pr_landing'
  const anchorDateStr = safeIsoDate(input.anchorDate, '2026-10-31');
  const anchorDate = new Date(anchorDateStr);
  const applicantName = boundedText(input.applicantName, 'Newcomer', 100);
  const assessmentDate = safeIsoDate(input.assessmentDate, '2026-10-31');

  const events = [];

  if (milestoneType === 'work_permit_expiry') {
    // 180 Days Before: Begin LMIA / PNP Preparation
    const d180 = new Date(anchorDate.getTime() - 180 * 86400000);
    events.push({
      title: '⚠️ Work Permit: 180 Days to Expiry - Start LMIA/PNP Action',
      startDate: d180,
      description: 'Under ESDC and IRCC guidelines, LMIA processing averages 3-5 months. Request employer support or lodge Provincial Nominee application immediately.',
      priority: 'normal'
    });

    // 90 Days Before: Passport Validity & Document Audit
    const d90 = new Date(anchorDate.getTime() - 90 * 86400000);
    events.push({
      title: '🚨 Work Permit: 90 Days to Expiry - Passport Check & Documents',
      startDate: d90,
      description: 'Verify your passport has at least 1-2 years validity remaining (permits cannot be issued beyond passport expiry). Prepare bank statements and pay stubs.',
      priority: 'high'
    });

    // 30 Days Before: Final Extension Deadline for Maintained Status
    const d30 = new Date(anchorDate.getTime() - 30 * 86400000);
    events.push({
      title: '🔥 Work Permit: 30 Days to Expiry - MUST LODGE EXTENSION',
      startDate: d30,
      description: 'Lodge your online extension on IRCC portal before midnight of your expiry date to secure legal Maintained Status (IRPR s. 186(u)) with uninterrupted work authorization.',
      priority: 'urgent'
    });

    // Expiry Date
    events.push({
      title: '🛑 Work Permit Expiry Date',
      startDate: anchorDate,
      description: 'Permit expires today. If an in-time application was lodged, you have Maintained Status. If NO application was submitted, status is lost today.',
      priority: 'critical'
    });

    // 90 Days After Expiry: Final Restoration of Status Deadline (IRPR s. 182)
    const dRestoration = new Date(anchorDate.getTime() + 90 * 86400000);
    events.push({
      title: '⛔ STATUTORY HARD DEADLINE: 90-Day Restoration Window Closes',
      startDate: dRestoration,
      description: 'Under IRPR s. 182, foreign nationals who lost status have exactly 90 days to apply for restoration. After this date, you MUST leave Canada immediately or face a CBSA departure order.',
      priority: 'critical'
    });
  } else if (milestoneType === 'arrival_date') {
    // Day 3: SIN
    events.push({
      title: '🏛️ Day 3: Apply for Social Insurance Number (SIN)',
      startDate: new Date(anchorDate.getTime() + 3 * 86400000),
      description: 'Visit a Service Canada Centre with your work/study permit and passport to receive your 9-digit SIN immediately.',
      priority: 'high'
    });

    // Day 7: Healthcare & Doctor
    events.push({
      title: '🏥 Day 7: Apply for Provincial Universal Healthcare (OHIP/MSP)',
      startDate: new Date(anchorDate.getTime() + 7 * 86400000),
      description: 'Apply online or at ServiceOntario/Service BC with proof of address and permit. Register with Healthcare Connect for a family doctor.',
      priority: 'high'
    });

    // Day 30: Banking, TFSA & FHSA
    events.push({
      title: '💳 Day 30: Open Bank Accounts, TFSA & First Home Savings (FHSA)',
      startDate: new Date(anchorDate.getTime() + 30 * 86400000),
      description: 'Open newcomer banking packages with fee waivers. Set up FHSA to claim $8,000 annual tax deduction on your first Canadian tax return.',
      priority: 'normal'
    });

    // Day 90: Driving Licence Exchange
    events.push({
      title: '🚗 Day 90: Exchange Foreign Driving Licence (90-Day Grace Period)',
      startDate: new Date(anchorDate.getTime() + 90 * 86400000),
      description: 'Ontario and BC allow driving on a foreign licence for up to 90 days. Visit DriveTest or ICBC with an official driving record abstract before the grace period expires.',
      priority: 'high'
    });

    // Next April 30: Tax Return & Benefit Credits
    const arrivalYear = anchorDate.getFullYear();
    const taxDeadline = new Date(Date.UTC(arrivalYear + 1, 3, 30, 23, 59, 59));
    events.push({
      title: '📋 April 30: CRA Personal Income Tax Return Deadline (RC151 Credit)',
      startDate: taxDeadline,
      description: 'File your first T1 General Canadian tax return to claim GST/HST credit, Canada Child Benefit (CCB), and Ontario Trillium / BC Climate Action tax refunds.',
      priority: 'critical'
    });
  } else if (milestoneType === 'lease_notice') {
    // 90 Days Before: Rent Increase Notice Review
    events.push({
      title: '📜 90 Days Before: Review Landlord Form N1 Rent Increase Notice',
      startDate: new Date(anchorDate.getTime() - 90 * 86400000),
      description: 'Under Ontario RTA s. 116, landlords must give at least 90 days written notice on Form N1. Verify rent increase does not exceed 2.5% statutory provincial guideline.',
      priority: 'high'
    });

    // 60 Days Before: Tenant Form N9 Notice to Terminate
    events.push({
      title: '🚪 60 Days Before: Form N9 Tenant Termination Notice Deadline',
      startDate: new Date(anchorDate.getTime() - 60 * 86400000),
      description: 'Under Ontario RTA s. 44, tenants must provide at least 60 days written notice to vacate at the end of the fixed term. If no notice is given, tenancy automatically converts to month-to-month.',
      priority: 'high'
    });

    // Lease End Date
    events.push({
      title: '🏡 Fixed-Term Lease End Date (Auto-Converts to Month-to-Month)',
      startDate: anchorDate,
      description: 'End of fixed-term lease. In Ontario and BC, leases automatically convert to month-to-month statutory tenancies with identical terms and rent protections.',
      priority: 'normal'
    });
  } else if (milestoneType === 'pr_landing') {
    // 3 Years (1095 days): Citizenship Eligibility
    events.push({
      title: '🇨🇦 3 Years: Canadian Citizenship Physical Presence Eligibility',
      startDate: new Date(anchorDate.getTime() + 1095 * 86400000),
      description: 'Under Citizenship Act s. 5(1)(c), you are eligible for Canadian citizenship after accumulating 1,095 days (3 years) of physical presence within the past 5 years. Temporary resident days count as half-days (up to 365 days max).',
      priority: 'high'
    });

    // 5 Years: PR Card Renewal (IRPA s. 28)
    events.push({
      title: '🪪 5 Years: PR Card Renewal Residency Obligation Check',
      startDate: new Date(anchorDate.getTime() + 1825 * 86400000),
      description: 'Under IRPA s. 28, you must demonstrate at least 730 days of physical presence in Canada during every 5-year period to renew your PR card.',
      priority: 'critical'
    });
  }

  const icsContent = generateIcsCalendar(events);

  return {
    applicantName,
    assessmentDate,
    milestoneType,
    anchorDate: anchorDateStr,
    totalEventsGenerated: events.length,
    events,
    icsContent,
    summary: `Generated ${events.length} statutory milestones and calendar alerts for ${milestoneType.replace(/_/g, ' ')} starting from ${anchorDateStr}. Export or download as .ics to sync with Google Calendar, Apple Calendar, or Outlook.`
  };
}
