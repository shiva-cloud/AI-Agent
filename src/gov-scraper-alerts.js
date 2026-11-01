// Automated Government Scraper Alerts & SHA-256 Policy Drift Monitor (Rec 50)
// Monitors authoritative IRCC, USCIS, and UK.GOV regulatory webpages,
// computes SHA-256 payload digests, and detects silent regulatory changes.

import { createHash } from 'node:crypto';

export const MONITORED_GOV_PAGES = [
  {
    id: 'ircc-pgwp-rules',
    jurisdiction: 'CA',
    agency: 'IRCC',
    topic: 'employment',
    title: 'Post-Graduation Work Permit Program Delivery Instructions',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/study-permits/post-growth-work-permit-program.html'
  },
  {
    id: 'ircc-super-visa-lico',
    jurisdiction: 'CA',
    agency: 'IRCC',
    topic: 'family',
    title: 'Low Income Cut-Off (LICO) Table for Super Visa Sponsors',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa/eligibility.html'
  },
  {
    id: 'uscis-h1b-rules',
    jurisdiction: 'US',
    agency: 'USCIS',
    topic: 'employment',
    title: 'H-1B Specialty Occupations and Modernization Rule',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations'
  },
  {
    id: 'uk-skilled-worker-salary',
    jurisdiction: 'UK',
    agency: 'UK Home Office',
    topic: 'employment',
    title: 'Skilled Worker Visa Minimum Salary Going Rates',
    url: 'https://www.gov.uk/skilled-worker-visa/your-job'
  }
];

export function computePayloadHash(content) {
  if (!content) return null;
  const normalized = typeof content === 'string'
    ? content.replace(/\r\n/g, '\n').trim()
    : content;
  return createHash('sha256').update(normalized).digest('hex');
}

export function detectPolicyDrift(pageDef, previousHash, currentContent, timestamp = new Date().toISOString()) {
  const currentHash = computePayloadHash(currentContent);
  if (!currentHash) {
    return { hasChanged: false, error: 'Empty content payload' };
  }

  const safePageDef = (pageDef && typeof pageDef === 'object') ? pageDef : {};
  const hasChanged = previousHash && previousHash !== currentHash;

  return {
    pageId: safePageDef.id || 'unknown',
    url: safePageDef.url || '',
    agency: safePageDef.agency || 'unknown',
    jurisdiction: safePageDef.jurisdiction || 'unknown',
    previousHash,
    currentHash,
    hasChanged,
    checkedAt: timestamp,
    alertLevel: hasChanged ? 'critical_policy_revision' : 'unchanged'
  };
}
