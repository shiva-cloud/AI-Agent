// Personalized Settlement Journey & Statutory Milestone Generator
// Generates a chronological, statutory-cited roadmap for newcomers to Canada
// based on their immigration category (PR, Work Permit, Student) and landing date.

import { ValidationError } from './api-errors.js';
import { assertCalendarDate } from './evidence-policy.js';
import { boundedText, safeIsoDate } from './text-input.js';

export const IMMIGRATION_CATEGORIES = {
  pr_express_entry: {
    label: 'Permanent Resident (Express Entry / PNP)',
    description: 'Federal Skilled Worker, Canadian Experience Class, or Provincial Nominee landing as PR.'
  },
  work_permit: {
    label: 'Skilled Work Permit (LMIA / LMIA-Exempt)',
    description: 'Temporary foreign worker on an employer-specific or open work permit.'
  },
  study_permit: {
    label: 'International Post-Secondary Student',
    description: 'Enrolled in a designated learning institution (DLI) in Canada.'
  },
  visitor_family: {
    label: 'Family Visitor / Super Visa',
    description: 'Extended stay visitor, parent or grandparent visiting family in Canada.'
  }
};

export const SETTLEMENT_PHASES = [
  { id: 'pre_departure', title: 'Pre-Departure (30–60 Days Out)', horizonDays: -30 },
  { id: 'arrival_day', title: 'Port of Entry & First 48 Hours', horizonDays: 2 },
  { id: 'first_week', title: 'First Week (Days 1–7)', horizonDays: 7 },
  { id: 'first_month', title: 'First Month (Days 8–30)', horizonDays: 30 },
  { id: 'first_90_days', title: 'First Quarter (Days 31–90)', horizonDays: 90 },
  { id: 'first_year', title: 'First Year Milestones (Days 91–365)', horizonDays: 365 }
];

export const MASTER_MILESTONES = [
  // Pre-departure
  {
    phase: 'pre_departure',
    title: 'Itemize Settler Effects for Duty-Free Border Clearance',
    authority: 'CBSA Customs Act s.12 & Form BSF186 (B4)',
    category: 'customs',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Prepare two typed copies of CBSA Form BSF186 (goods accompanying you) and BSF186A (goods to follow) with serial numbers and CAD values.'
  },
  {
    phase: 'pre_departure',
    title: 'Obtain Official Driving History Extract Letter',
    authority: 'Ontario HTA Reg 340/94 / BC ICBC Foreign Experience Rules',
    category: 'driving',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Ask the licensing authority in your destination province which foreign driving records it accepts before requesting an authenticated extract.'
  },
  {
    phase: 'pre_departure',
    title: 'Secure Claims-Free Auto Insurance Experience Letter',
    authority: 'FSRA Ontario / Private Insurer Experience Credit',
    category: 'finance',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Ask your destination insurer whether it accepts foreign claims-history letters and which documents it requires. Any discount depends on the insurer and your circumstances.'
  },

  // First 48 Hours
  {
    phase: 'arrival_day',
    title: 'Declare Cross-Border Currency Exceeding $10,000 CAD',
    authority: 'PCMLTFA s.12 & CBSA Form E677',
    category: 'customs',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit', 'visitor_family'],
    action: 'If carrying cash, bank drafts or travelers checks total $10,000 CAD or more, declare honestly on kiosk and Form E677. Zero tax or duty; failure to declare leads to seizure.'
  },
  {
    phase: 'arrival_day',
    title: 'Confirm Study / Work Permit Conditions at Port of Entry',
    authority: 'IRPA s.20 & IRPR s.185',
    category: 'immigration',
    mandatory: true,
    applicableCategories: ['work_permit', 'study_permit'],
    action: 'Before stepping away from the CBSA officer booth, inspect printed permit for correct off-campus work eligibility remarks and employer/location conditions.'
  },

  // First Week
  {
    phase: 'first_week',
    title: 'Apply for Social Insurance Number (SIN)',
    authority: 'Department of Employment and Social Development Act s.28',
    category: 'identity',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Visit any Service Canada Centre with your passport and COPR/Work Permit/Study Permit to obtain your 9-digit SIN on the spot ($0 fee).'
  },
  {
    phase: 'first_week',
    title: 'Open Personal Retail Bank Account & Request Secured Credit Card',
    authority: 'Bank Act s.627.17 (Right to Open Retail Account)',
    category: 'banking',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Open a personal account with acceptable identity documents. Under the Bank Act, a bank cannot refuse you only because you have no job or cannot make a deposit right away.'
  },
  {
    phase: 'first_week',
    title: 'Acquire Local Mobile Telecom Plan & Transit Card',
    authority: 'CRTC Wireless Code & Municipal Transit Authority',
    category: 'utilities',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit', 'visitor_family'],
    action: 'Get a prepaid or BYOD Canadian mobile SIM (avoid multi-year contracts without local credit) and register your transit card (PRESTO for GTA, Compass for Vancouver).'
  },

  // First Month
  {
    phase: 'first_month',
    title: 'Enroll in Provincial Universal Healthcare (OHIP / MSP / AHCIP)',
    authority: 'Health Insurance Act (ON) / Medicare Protection Act (BC)',
    category: 'health',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Check eligibility, required documents and the coverage start date with your destination provincial health plan before applying. Confirm interim insurance needs; this roadmap does not determine eligibility.'
  },
  {
    phase: 'first_month',
    title: 'Execute Standard Residential Tenancy Lease & Resist Illegal Advance Rent',
    authority: 'Ontario RTA s.108 / BC RTA s.20',
    category: 'housing',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit', 'study_permit'],
    action: 'Check the required lease form and permitted deposits with the tenancy authority in your destination province before signing or paying.'
  },
  {
    phase: 'first_month',
    title: 'Register Dependent Children in Public School',
    authority: 'Education Act s.32 & s.49.2 (Right to Attend Without Fee)',
    category: 'education',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit'],
    action: 'Contact the local school board to confirm enrolment documents, residency requirements and whether any tuition applies to your household.'
  },

  // First 90 Days
  {
    phase: 'first_90_days',
    title: 'Apply for Canada Child Benefit (CCB) & GST/HST Credit',
    authority: 'Income Tax Act s.122.6 & CRA Form RC66 / RC151',
    category: 'tax',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit'],
    action: 'File CRA Form RC151 (Newcomer GST Credit) and Form RC66 (Canada Child Benefit) to receive retroactive non-taxable monthly federal child allowances.'
  },
  {
    phase: 'first_90_days',
    title: 'Exchange Foreign Driving Licence at DriveTest / ICBC',
    authority: 'Highway Traffic Act Reg 340/94 (ON) / Motor Vehicle Act (BC)',
    category: 'driving',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit'],
    action: 'Ask the destination licensing authority whether your licence can be exchanged and which tests or experience documents are required before surrendering any original document.'
  },

  // First Year
  {
    phase: 'first_year',
    title: 'File First Canadian T1 Income Tax Return with CRA',
    authority: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.))',
    category: 'tax',
    mandatory: true,
    applicableCategories: ['pr_express_entry', 'work_permit'],
    action: 'File by April 30. Note CRA Form T1135 foreign property reporting is exempt in your first tax year of Canadian residency.'
  },
  {
    phase: 'first_year',
    title: 'Open Tax-Free First Home Savings Account (FHSA) & TFSA',
    authority: 'Income Tax Act s.146.6 (FHSA Regulations)',
    category: 'wealth',
    mandatory: false,
    applicableCategories: ['pr_express_entry', 'work_permit'],
    action: 'If you are a first-time home buyer, you can contribute up to $8,000 a year to a First Home Savings Account. Contributions are tax-deductible, and qualifying withdrawals to buy a first home are tax-free.'
  }
];

/**
 * Generates a tailored settlement roadmap for a newcomer.
 * @param {string} categoryKey - One of IMMIGRATION_CATEGORIES keys
 * @param {string} city - Target Canadian city (e.g. 'Toronto', 'Vancouver', 'Calgary')
 * @param {string} [landingDateStr] - ISO date string (YYYY-MM-DD). Defaults to today.
 * @returns {object} Roadmap payload with timeline calculations
 */
export function generateSettlementJourney(categoryKey = 'pr_express_entry', city = 'Toronto', landingDateStr, newcomerName = 'Newcomer') {
  if (typeof categoryKey !== 'string' || !Object.hasOwn(IMMIGRATION_CATEGORIES, categoryKey)) {
    throw new ValidationError('Unknown immigration category');
  }
  const category = IMMIGRATION_CATEGORIES[categoryKey];
  const safeCity = boundedText(city, 'Toronto', 100);
  const safeNewcomer = boundedText(newcomerName, 'Newcomer', 120);
  const date = landingDateStr === undefined ? new Date().toISOString().slice(0, 10) : landingDateStr;
  assertCalendarDate(date, 'Landing date');
  const validLandingDate = new Date(date + 'T00:00:00Z');

  const relevantMilestones = MASTER_MILESTONES.filter(m => m.applicableCategories.includes(categoryKey));

  const phases = SETTLEMENT_PHASES.map(phase => {
    const phaseDate = new Date(validLandingDate);
    phaseDate.setUTCDate(phaseDate.getUTCDate() + phase.horizonDays);

    const items = relevantMilestones
      .filter(m => m.phase === phase.id)
      .map(m => {
        const itemDate = new Date(validLandingDate);
        itemDate.setUTCDate(itemDate.getUTCDate() + phase.horizonDays);
        return {
          ...m,
          targetDate: itemDate.toISOString().slice(0, 10),
          city: safeCity
        };
      });

    return {
      ...phase,
      targetDate: phaseDate.toISOString().slice(0, 10),
      itemsCount: items.length,
      items
    };
  });

  return {
    asOf: safeIsoDate(new Date().toISOString().slice(0, 10)),
    newcomerName: safeNewcomer,
    categoryKey,
    categoryLabel: category.label,
    city: safeCity,
    landingDate: validLandingDate.toISOString().slice(0, 10),
    totalMilestones: relevantMilestones.length,
    phases
  };
}
