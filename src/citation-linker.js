/**
 * Northstar Automated Statutory Citation Linker
 * Automatically detects and converts legislative citations into official,
 * verifiable links to justice repositories (CanLII, Justice Laws Canada, e-Laws, eCFR, Gesetze).
 */

import { boundedText } from './text-input.js';

export const STATUTORY_REPOSITORIES = {
  IRPA: {
    title: 'Immigration and Refugee Protection Act (S.C. 2001, c. 27)',
    baseUrl: 'https://laws-lois.justice.gc.ca/eng/acts/I-2.5/',
    jurisdiction: 'Canada (Federal)'
  },
  IRPR: {
    title: 'Immigration and Refugee Protection Regulations (SOR/2002-227)',
    baseUrl: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/',
    jurisdiction: 'Canada (Federal)'
  },
  ITA: {
    title: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.))',
    baseUrl: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/',
    jurisdiction: 'Canada (Federal)'
  },
  ONTARIO_RTA: {
    title: 'Residential Tenancies Act, 2006, S.O. 2006, c. 17',
    baseUrl: 'https://www.ontario.ca/laws/statute/06r17',
    jurisdiction: 'Ontario'
  },
  ONTARIO_ESA: {
    title: 'Employment Standards Act, 2000, S.O. 2000, c. 41',
    baseUrl: 'https://www.ontario.ca/laws/statute/00e41',
    jurisdiction: 'Ontario'
  },
  BC_RTA: {
    title: 'Residential Tenancy Act [SBC 2002] c. 78',
    baseUrl: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01',
    jurisdiction: 'British Columbia'
  },
  US_CFR_TITLE8: {
    title: 'Code of Federal Regulations Title 8 (Aliens and Nationality)',
    baseUrl: 'https://www.ecfr.gov/current/title-8',
    jurisdiction: 'United States'
  },
  US_INA: {
    title: 'Immigration and Nationality Act (INA)',
    baseUrl: 'https://www.uscis.gov/laws-and-policy/legislation/immigration-and-nationality-act',
    jurisdiction: 'United States'
  },
  GERMANY_AUFENTHG: {
    title: 'Aufenthaltsgesetz (AufenthG - Residence Act)',
    baseUrl: 'https://www.gesetze-im-internet.de/aufenthg_2004/',
    jurisdiction: 'Germany'
  },
  GERMANY_BGB: {
    title: 'Bürgerliches Gesetzbuch (BGB - Civil Code)',
    baseUrl: 'https://www.gesetze-im-internet.de/bgb/',
    jurisdiction: 'Germany'
  }
};

const CITATION_RULES = [
  {
    regex: /\bIRPA\s+(?:s\.|section|article)?\s*(\d+(?:\(\d+\))?(?:\([a-z]\))?)/gi,
    repo: 'IRPA',
    format: (match, section) => ({
      text: match,
      statute: 'IRPA',
      section,
      url: `https://laws-lois.justice.gc.ca/eng/acts/I-2.5/section-${section.replace(/\(.*\)/, '')}.html`,
      authority: 'Immigration and Refugee Protection Act (Canada)'
    })
  },
  {
    regex: /\bIRPR\s+(?:s\.|section|article)?\s*(\d+(?:\.\d+)?(?:\(\d+\))?)/gi,
    repo: 'IRPR',
    format: (match, section) => ({
      text: match,
      statute: 'IRPR',
      section,
      url: `https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-${section.replace(/\(.*\)/, '')}.html`,
      authority: 'Immigration and Refugee Protection Regulations (Canada)'
    })
  },
  {
    regex: /\bITA\s+(?:s\.|section|article)?\s*(\d+(?:\.\d+)?(?:\(\d+\))?(?:\([a-z]\))?)/gi,
    repo: 'ITA',
    format: (match, section) => ({
      text: match,
      statute: 'ITA',
      section,
      url: `https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-${section.replace(/\(.*\)/, '')}.html`,
      authority: 'Income Tax Act (Canada)'
    })
  },
  {
    regex: /\b(?:Ontario\s+)?RTA\s+(?:s\.|section)?\s*(\d+(?:\.\d+)?(?:\(\d+\))?(?:\([a-z]\))?)/gi,
    repo: 'ONTARIO_RTA',
    format: (match, section) => ({
      text: match,
      statute: 'RTA (Ontario)',
      section,
      url: 'https://www.ontario.ca/laws/statute/06r17',
      authority: 'Ontario Residential Tenancies Act, 2006'
    })
  },
  {
    regex: /\b(?:Ontario\s+)?ESA\s+(?:s\.|section)?\s*(\d+(?:\.\d+)?(?:\(\d+\))?)/gi,
    repo: 'ONTARIO_ESA',
    format: (match, section) => ({
      text: match,
      statute: 'ESA (Ontario)',
      section,
      url: 'https://www.ontario.ca/laws/statute/00e41',
      authority: 'Ontario Employment Standards Act, 2000'
    })
  },
  {
    regex: /\b8\s+CFR\s+(?:§|section)?\s*(\d+\.\d+(?:\([a-z0-9]+\))*)/gi,
    repo: 'US_CFR_TITLE8',
    format: (match, section) => ({
      text: match,
      statute: '8 CFR',
      section,
      url: `https://www.ecfr.gov/current/title-8/section-${section.split('(')[0]}`,
      authority: 'US Code of Federal Regulations Title 8'
    })
  },
  {
    regex: /\bINA\s+(?:§|section)?\s*(\d+(?:\([a-z0-9]+\))*)/gi,
    repo: 'US_INA',
    format: (match, section) => ({
      text: match,
      statute: 'INA',
      section,
      url: 'https://www.uscis.gov/laws-and-policy/legislation/immigration-and-nationality-act',
      authority: 'US Immigration and Nationality Act'
    })
  },
  {
    regex: /\bAufenthG\s+(?:§|section)?\s*(\d+[a-z]?)/gi,
    repo: 'GERMANY_AUFENTHG',
    format: (match, section) => ({
      text: match,
      statute: 'AufenthG',
      section,
      url: `https://www.gesetze-im-internet.de/aufenthg_2004/__${section.toLowerCase()}.html`,
      authority: 'Aufenthaltsgesetz (Germany)'
    })
  },
  {
    regex: /\bBGB\s+(?:§|section)?\s*(\d+[a-z]?)/gi,
    repo: 'GERMANY_BGB',
    format: (match, section) => ({
      text: match,
      statute: 'BGB',
      section,
      url: `https://www.gesetze-im-internet.de/bgb/__${section.toLowerCase()}.html`,
      authority: 'Bürgerliches Gesetzbuch (Germany)'
    })
  }
];

/**
 * Extracts all statutory citations from raw text
 */
export function extractStatutoryCitations(text = '') {
  if (typeof text !== 'string' || !text.trim()) return [];
  const safeText = boundedText(text, '', 50000);

  const citations = [];
  for (const rule of CITATION_RULES) {
    const matches = safeText.matchAll(rule.regex);
    for (const match of matches) {
      citations.push(rule.format(match[0], match[1]));
    }
  }
  return citations;
}

/**
 * Auto-links citations in text to Markdown links or HTML links
 */
export function linkifyStatutoryCitations(text = '', format = 'markdown') {
  if (typeof text !== 'string' || !text.trim()) return text;
  const safeText = boundedText(text, '', 50000);
  const safeFormat = boundedText(format, 'markdown', 20).toLowerCase();

  let result = safeText;
  for (const rule of CITATION_RULES) {
    result = result.replace(rule.regex, (match, section) => {
      const info = rule.format(match, section);
      if (safeFormat === 'html') {
        return `<a href="${info.url}" target="_blank" rel="noopener noreferrer" class="statutory-citation" title="${info.authority}">${info.text}</a>`;
      }
      return `[${info.text}](${info.url})`;
    });
  }
  return result;
}
