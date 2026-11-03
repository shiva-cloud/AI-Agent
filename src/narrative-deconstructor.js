// src/narrative-deconstructor.js
// Deep Narrative Deconstructor for Real-World Reddit & Quora Immigration & Settlement Queries
// Extracts 5 core entity slots: Status, Location, Conflict, Desired Action, and Urgency.
// Synthesizes a high-precision statutory canonical intent search query.

import { cleanEmotionalFluff, normalizeSlangAndTypos } from './slang-normalizer.js';
import { detectLegalMyth } from './myth-buster.js';

export const STATUS_PATTERNS = [
  { id: 'closed_work_permit', label: 'Closed Work Permit (Employer-Specific)', pattern: /\b(?:closed\s+(?:work\s+permit|wp)|employer[- ]specific\s+(?:work\s+permit|wp)|tied\s+to\s+(?:an?\s+)?employer|lmia\s+(?:work\s+permit|wp)|tied\s+work\s+permit)\b/i },
  { id: 'pgwp', label: 'Post-Graduation Work Permit (PGWP)', pattern: /\b(?:pgwp|post[- ]grad(?:uation)?\s+work\s+permit)\b/i },
  { id: 'sowp', label: 'Spousal Open Work Permit (SOWP)', pattern: /\b(?:sowp|spous(?:e|al)\s+(?:open\s+)?work\s+permit)\b/i },
  { id: 'bowp', label: 'Bridging Open Work Permit (BOWP)', pattern: /\b(?:bowp|bridging\s+(?:open\s+)?work\s+permit)\b/i },
  { id: 'vwowp', label: 'Vulnerable Worker Open Work Permit (VWOWP)', pattern: /\b(?:vwowp|vulnerable\s+worker\s+(?:open\s+)?work\s+permit)\b/i },
  { id: 'open_work_permit', label: 'Open Work Permit', pattern: /\b(?:open\s+(?:work\s+permit|wp)|owp)\b/i },
  { id: 'study_permit', label: 'Study Permit / Student Visa', pattern: /\b(?:study\s+permit|student\s+visa|international\s+student|dli\s+student|f[- ]?1\s+visa|cas\s+letter)\b/i },
  { id: 'visitor', label: 'Visitor / Tourist Visa', pattern: /\b(?:visitor\s+visa|tourist\s+visa|trv|visitor\s+record|b[- ]?1\s*\/?[ -]?b[- ]?2|visitor\s+status|tourist\s+status|schengen\s+tourist)\b/i },
  { id: 'permanent_resident', label: 'Permanent Resident (PR / Green Card / ILR)', pattern: /\b(?:permanent\s+resident|pr\s+card|copr|green\s+card\s+holder|ilr|indefinite\s+leave\s+to\s+remain|niederlassungserlaubnis)\b/i },
  { id: 'undocumented_or_expired', label: 'Expired Status / Undocumented', pattern: /\b(?:status\s+expired|out\s+of\s+status|lost\s+status|without\s+status|no\s+status|overstay(?:ed|ing)?|undocumented)\b/i },
  { id: 'maintained_status', label: 'Maintained Status (Implied Status)', pattern: /\b(?:maintained\s+status|implied\s+status|waiting\s+for\s+(?:work|study)\s+permit\s+decision|wp[- ]ext)\b/i },
  { id: 'work_permit_general', label: 'Work Permit (General)', pattern: /\b(?:work\s+permit|working\s+visa|skilled\s+worker\s+visa|h[- ]?1b|aewv)\b/i }
];

export const LOCATION_PATTERNS = [
  // Canada Provinces & Major Cities
  { country: 'Canada', region: 'Ontario', city: 'Toronto', pattern: /\b(?:toronto|gta|north york|scarborough|etobicoke|downtown toronto)\b/i },
  { country: 'Canada', region: 'Ontario', city: 'Brampton', pattern: /\bbrampton\b/i },
  { country: 'Canada', region: 'Ontario', city: 'Mississauga', pattern: /\bmississauga\b/i },
  { country: 'Canada', region: 'Ontario', city: 'Ottawa', pattern: /\bottawa\b/i },
  { country: 'Canada', region: 'Ontario', city: 'Hamilton', pattern: /\bhamilton\b/i },
  { country: 'Canada', region: 'Ontario', city: null, pattern: /\b(?:ontario|on)\b/i },

  { country: 'Canada', region: 'British Columbia', city: 'Vancouver', pattern: /\b(?:vancouver|surrey|burnaby|richmond|metro vancouver)\b/i },
  { country: 'Canada', region: 'British Columbia', city: 'Victoria', pattern: /\bvictoria\b/i },
  { country: 'Canada', region: 'British Columbia', city: null, pattern: /\b(?:british columbia|bc)\b/i },

  { country: 'Canada', region: 'Alberta', city: 'Calgary', pattern: /\bcalgary\b/i },
  { country: 'Canada', region: 'Alberta', city: 'Edmonton', pattern: /\bedmonton\b/i },
  { country: 'Canada', region: 'Alberta', city: null, pattern: /\balberta\b/i },

  { country: 'Canada', region: 'Quebec', city: 'Montreal', pattern: /\bmontreal\b/i },
  { country: 'Canada', region: 'Quebec', city: null, pattern: /\bquebec\b/i },

  { country: 'Canada', region: 'Manitoba', city: 'Winnipeg', pattern: /\bwinnipeg\b/i },
  { country: 'Canada', region: 'Manitoba', city: null, pattern: /\bmanitoba\b/i },

  { country: 'Canada', region: 'Nova Scotia', city: 'Halifax', pattern: /\bhalifax\b/i },
  { country: 'Canada', region: 'Nova Scotia', city: null, pattern: /\bnova scotia\b/i },

  { country: 'Canada', region: null, city: null, pattern: /\b(?:canada|canadian|ircc|cbsa|cra|ltb|ohip|msp|ahcip|sin)\b/i },

  // United States
  { country: 'United States', region: 'New York', city: 'New York City', pattern: /\b(?:new york city|nyc|manhattan|brooklyn|queens)\b/i },
  { country: 'United States', region: 'California', city: 'San Francisco', pattern: /\b(?:san francisco|sf bay area|silicon valley)\b/i },
  { country: 'United States', region: 'California', city: 'Los Angeles', pattern: /\blos angeles\b/i },
  { country: 'United States', region: null, city: null, pattern: /\b(?:united states|usa|us|uscis|cbp|ice|ssn|green card|h1b|opt)\b/i },

  // United Kingdom
  { country: 'United Kingdom', region: 'England', city: 'London', pattern: /\blondon\b/i },
  { country: 'United Kingdom', region: 'England', city: 'Manchester', pattern: /\bmanchester\b/i },
  { country: 'United Kingdom', region: 'Scotland', city: 'Edinburgh', pattern: /\bedinburgh\b/i },
  { country: 'United Kingdom', region: null, city: null, pattern: /\b(?:united kingdom|uk|britain|england|scotland|ukvi|ilr|brp|nhs|hmrc)\b/i },

  // Germany
  { country: 'Germany', region: 'Berlin', city: 'Berlin', pattern: /\bberlin\b/i },
  { country: 'Germany', region: 'Bavaria', city: 'Munich', pattern: /\b(?:munich|münchen)\b/i },
  { country: 'Germany', region: 'Hesse', city: 'Frankfurt', pattern: /\bfrankfurt\b/i },
  { country: 'Germany', region: null, city: null, pattern: /\b(?:germany|deutschland|bamf|ausländerbehörde|anmeldung|schufa|aufenthaltsgesetz)\b/i },

  // UAE
  { country: 'UAE', region: 'Dubai', city: 'Dubai', pattern: /\bdubai\b/i },
  { country: 'UAE', region: 'Abu Dhabi', city: 'Abu Dhabi', pattern: /\babu dhabi\b/i },
  { country: 'UAE', region: null, city: null, pattern: /\b(?:uae|emirates|mohre|gdrfa|emirates id|ejari|rera)\b/i },

  // Australia
  { country: 'Australia', region: 'New South Wales', city: 'Sydney', pattern: /\bsydney\b/i },
  { country: 'Australia', region: 'Victoria', city: 'Melbourne', pattern: /\bmelbourne\b/i },
  { country: 'Australia', region: null, city: null, pattern: /\b(?:australia|aussie|vevo|dha|medicare australia|tfn)\b/i },

  // New Zealand
  { country: 'New Zealand', region: 'Auckland', city: 'Auckland', pattern: /\bauckland\b/i },
  { country: 'New Zealand', region: null, city: null, pattern: /\b(?:new zealand|nz|inz|aewv)\b/i },

  // European Union
  { country: 'European Union', region: null, city: null, pattern: /\b(?:european union|schengen|eu blue card)\b/i }
];

export const CONFLICT_PATTERNS = [
  {
    id: 'illegal_lockout',
    label: 'Illegal Landlord Lockout / Changed Locks',
    pattern: /\b(?:locked\s+out|lock\s*out|changed\s+(?:the\s+)?locks?|padlock|threw\s+(?:my\s+)?(?:stuff|belongings|clothes)\s+out|kicked\s+me\s+out\s+without\s+notice|break\s+(?:the\s+)?(?:window|door))\b/i,
    statutoryDomain: 'housing_tenancy',
    primaryRemedy: 'RHEU Emergency Order & LTB Form T2'
  },
  {
    id: 'lmia_extortion',
    label: 'Employer LMIA / Sponsorship Extortion or Fee Demands',
    pattern: /\b(?:pay(?:ing)?|demand(?:ed|ing)?|ask(?:ing)?\s+for\s+money|deduct(?:ed|ing)?|charges?|sell(?:ing)?|bought)\b.*\b(?:lmia|sponsorship|job\s+offer|permit\s+fee)\b|\b(?:lmia|sponsorship)\b.*\b(?:\$?\d{1,3}(?:,\d{3})+|\$?\d+k|money|cash)\b/i,
    statutoryDomain: 'employment_protection',
    primaryRemedy: 'IRPR s. 200(1)(c) Prohibition & Vulnerable Worker Open Work Permit (VWOWP)'
  },
  {
    id: 'wage_theft_hours_cut',
    label: 'Closed Work Permit Hours Cut, Wage Theft, or Pay Deduction',
    pattern: /\b(?:cut\s+(?:my\s+)?hours|reduced\s+(?:my\s+)?hours|10\s+hours|part[- ]time\s+hours|withh(?:eld|olding)\s+pay|not\s+paying\s+(?:me|minimum\s+wage)|wage\s+theft|unpaid\s+overtime|pay\s+back\s+cash)\b/i,
    statutoryDomain: 'employment_protection',
    primaryRemedy: 'Employment Standards Act Claim & Vulnerable Worker Open Work Permit'
  },
  {
    id: 'passport_withheld',
    label: 'Employer or Landlord Confiscated / Withholding Passport or ID',
    pattern: /\b(?:confiscat(?:ed?|ing)|took|withh(?:eld|olding)|keep(?:ing)?|hold(?:ing|s)?|refus(?:es?|ing)\s+to\s+return)\b.*\b(?:passport|work\s+permit|visa\s+document|id\s+card|identity\s+documents)\b/i,
    statutoryDomain: 'criminal_trafficking_defense',
    primaryRemedy: 'Criminal Code s. 279.011 Police Intervention & VWOWP'
  },
  {
    id: 'status_expired_or_expiring',
    label: 'Status Expired or Expiring Imminently',
    pattern: /\b(?:status\s+expired|permit\s+expired|visa\s+expired|expir(?:ed|ing)\s+(?:in|within)\s+\d+\s+days|restoration|out\s+of\s+status|90\s+days\s+to\s+restore)\b/i,
    statutoryDomain: 'immigration_restoration',
    primaryRemedy: 'IRPA s. 182 Restoration of Status Application within 90 days'
  },
  {
    id: 'lost_pr_card_abroad',
    label: 'Lost PR Card While Outside Country of Residence',
    pattern: /\b(?:lost|stolen|misplaced)\b.*\b(?:pr\s+card|permanent\s+residence\s+card|brp|aufenthaltskarte)\b.*\b(?:outside|abroad|overseas|traveling|flight|airport|return)\b/i,
    statutoryDomain: 'border_travel_entry',
    primaryRemedy: 'Permanent Resident Travel Document (PRTD) via IRCC Portal'
  },
  {
    id: 'unlawful_rent_increase_or_deposit',
    label: 'Unlawful Rent Increase or Illegal Advance Deposit / Pet Ban',
    pattern: /\b(?:rent\s+increase|rent\s+hike|above\s+guideline|demand(?:ed|ing)?\s+(?:6|12|\d+)\s+months?|advance\s+rent|illegal\s+deposit|no\s+pets?\s+clause|pet\s+ban)\b/i,
    statutoryDomain: 'housing_tenancy',
    primaryRemedy: 'Ontario RTA s. 14 / s. 106 & Form T1 Rebate Application'
  },
  {
    id: 'domestic_violence_abuse',
    label: 'Family Violence / Partner Threatening Immigration Status',
    pattern: /\b(?:domestic\s+violence|abusive\s+partner|husband\s+threaten(?:s|ing)?|wife\s+threaten(?:s|ing)?|threatens?\s+to\s+(?:have\s+)?(?:police\s+)?deport|threatens?\s+to\s+cancel\s+(?:my\s+)?sponsorship|threaten(?:s|ed|ing)?\b.*\b(?:sponsorship|deport))\b/i,
    statutoryDomain: 'crisis_family_safety',
    primaryRemedy: 'Emergency Shelter 911 & Fee-Exempt TRP / Open Work Permit under IRPR s. 207.1'
  },
  {
    id: 'travel_on_maintained_status',
    label: 'Attempting Travel Abroad While on Maintained / Implied Status',
    pattern: /\b(?:travel(?:ling)?|fly(?:ing)?|vacation|leave|leaving\s+canada)\b.*\b(?:maintained\s+status|implied\s+status|waiting\s+for\s+permit)\b/i,
    statutoryDomain: 'immigration_status_risk',
    primaryRemedy: 'IRPR s. 183(5) Departure Warning: travel extinguishes work authorization'
  },
  {
    id: 'cash_work_tax_misconception',
    label: 'Unauthorized Cash Work Tax Amnesty Misconception',
    pattern: /\b(?:work\s+cash|under\s+the\s+table|cash\s+in\s+hand)\b.*\b(?:visitor|tourist|pay\s+taxes?\s+later|amnesty|cra\s+forgive)\b/i,
    statutoryDomain: 'immigration_enforcement_risk',
    primaryRemedy: 'IRPA s. 30 Cease Work Notice: paying taxes does not legalize unauthorized work'
  }
];

export const DESIRED_ACTIONS = [
  { id: 'vulnerable_worker_open_work_permit', label: 'Obtain Fee-Exempt Vulnerable Worker Open Work Permit (VWOWP)', pattern: /\b(?:vwowp|vulnerable\s+worker|escape\s+employer|leave\s+employer|open\s+work\s+permit\s+for\s+abused)\b/i },
  { id: 'restoration_of_status', label: 'Apply for Restoration of Status under IRPA s. 182', pattern: /\b(?:restore\s+status|restoration\s+of\s+status|restore\s+my\s+permit|fix\s+expired\s+status)\b/i },
  { id: 'reenter_country_prtd', label: 'Obtain Emergency Permanent Resident Travel Document (PRTD)', pattern: /\b(?:prtd|travel\s+document|how\s+to\s+(?:re[- ]?enter|return|board\s+flight))\b/i },
  { id: 'emergency_reentry_rheu', label: 'Regain Immediate Tenancy Entry via RHEU & Police Assistance', pattern: /\b(?:how\s+to\s+get\s+back\s+in|open\s+the\s+door|get\s+my\s+things|police\s+help|rheu)\b/i },
  { id: 'report_wage_theft_labour_board', label: 'File Employment Standards Claim for Unpaid Wages / Retaliation', pattern: /\b(?:get\s+my\s+wages|report\s+employer|ministry\s+of\s+labour|employment\s+standards|file\s+complaint)\b/i },
  { id: 'extend_stay_visitor_record', label: 'Apply for Visitor Record Extension Before Current Stay Expires', pattern: /\b(?:extend\s+stay|visitor\s+record|stay\s+longer|extend\s+visitor)\b/i },
  { id: 'police_intervention_passport', label: 'Police Intervention for Confiscated Official Documents', pattern: /\b(?:get\s+(?:my\s+)?passport\s+back|call\s+police\s+for\s+passport|recover\s+documents)\b/i }
];

export function extractUrgency(text, conflictId) {
  if (
    /\b(?:emergency|urgent|asap|crying|freezing|homeless|locked\s*out|threatened|assault|violence|danger|suicid|immediate(?:ly)?|police)\b/i.test(text) ||
    ['illegal_lockout', 'domestic_violence_abuse', 'passport_withheld'].includes(conflictId)
  ) {
    return 'emergency';
  }

  if (
    /\b(?:expir(?:ed|ing)|within\s+\d+\s+days|deadline|eviction\s+notice|cut\s+hours|hours\s+cut|no\s+money|deduct)\b/i.test(text) ||
    ['status_expired_or_expiring', 'lmia_extortion', 'wage_theft_hours_cut'].includes(conflictId)
  ) {
    return 'high';
  }

  return 'routine';
}

export function synthesizeCanonicalIntent(slots) {
  const parts = [];

  if (slots.conflict?.label) {
    parts.push(slots.conflict.label);
  }
  if (slots.status?.label) {
    parts.push(slots.status.label);
  }
  if (slots.location?.city) {
    parts.push(slots.location.city);
  } else if (slots.location?.region) {
    parts.push(slots.location.region);
  } else if (slots.location?.country) {
    parts.push(slots.location.country);
  }
  if (slots.desiredAction?.label) {
    parts.push(slots.desiredAction.label);
  }

  // Fallback if no specific conflict matched: use core terms
  if (parts.length === 0) {
    return slots.cleanedQuery || '';
  }

  return parts.join(' - ');
}

export function deconstructNarrative(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      raw: '',
      cleaned: '',
      slots: {
        status: null,
        location: { country: null, region: null, city: null },
        conflict: null,
        desiredAction: null,
        urgency: 'routine'
      },
      canonicalIntent: '',
      mythWarning: null,
      summary: ''
    };
  }

  // 1. Detect any dangerous legal myth
  const mythWarning = detectLegalMyth(rawText);

  // 2. Clean emotional fluff & normalize typos/slang
  const fluffCleaned = cleanEmotionalFluff(rawText);
  const normalized = normalizeSlangAndTypos(fluffCleaned);

  // 3. Extract Status
  let detectedStatus = null;
  for (const s of STATUS_PATTERNS) {
    if (s.pattern.test(rawText) || s.pattern.test(normalized)) {
      detectedStatus = { id: s.id, label: s.label };
      break;
    }
  }

  // 4. Extract Location
  const detectedLocation = { country: null, region: null, city: null };
  for (const loc of LOCATION_PATTERNS) {
    if (loc.pattern.test(rawText) || loc.pattern.test(normalized)) {
      if (!detectedLocation.country && loc.country) detectedLocation.country = loc.country;
      if (!detectedLocation.region && loc.region) detectedLocation.region = loc.region;
      if (!detectedLocation.city && loc.city) detectedLocation.city = loc.city;
      if (detectedLocation.country && (detectedLocation.city || detectedLocation.region)) break;
    }
  }

  // 5. Extract Conflict
  let detectedConflict = null;
  for (const c of CONFLICT_PATTERNS) {
    if (c.pattern.test(rawText) || c.pattern.test(normalized)) {
      detectedConflict = {
        id: c.id,
        label: c.label,
        domain: c.statutoryDomain,
        primaryRemedy: c.primaryRemedy
      };
      break;
    }
  }

  // 6. Extract Desired Action
  let detectedAction = null;
  for (const a of DESIRED_ACTIONS) {
    if (a.pattern.test(rawText) || a.pattern.test(normalized)) {
      detectedAction = { id: a.id, label: a.label };
      break;
    }
  }

  // 7. Urgency assessment
  const urgency = extractUrgency(rawText, detectedConflict?.id);

  const slots = {
    status: detectedStatus,
    location: detectedLocation,
    conflict: detectedConflict,
    desiredAction: detectedAction,
    urgency,
    cleanedQuery: normalized
  };

  const canonicalIntent = synthesizeCanonicalIntent(slots);

  // Concise natural summary for logs & UI
  let summary = `User`;
  if (detectedStatus) summary += ` with ${detectedStatus.label}`;
  if (detectedLocation.city || detectedLocation.region || detectedLocation.country) {
    summary += ` in ${detectedLocation.city || detectedLocation.region || detectedLocation.country}`;
  }
  if (detectedConflict) {
    summary += ` experiencing ${detectedConflict.label}`;
  }
  if (detectedAction) {
    summary += ` seeking ${detectedAction.label}`;
  }
  summary += ` [Urgency: ${urgency.toUpperCase()}].`;

  return {
    raw: rawText,
    cleaned: normalized,
    slots,
    canonicalIntent,
    mythWarning,
    summary
  };
}
