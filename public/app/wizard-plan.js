import {COUNTRY_CITIES} from './data.js';

export function validateWizardProfile(profile, throughStep = 4) {
  const issue = (field, step, message) => ({field, step, message});
  if (!Object.hasOwn(COUNTRY_CITIES, profile.country) || !profile.country || profile.country === 'CA') return issue('country', 1, 'Choose a supported destination country.');
  if (profile.city && !COUNTRY_CITIES[profile.country].includes(profile.city)) return issue('city', 1, 'Choose a city belonging to your destination country, or leave it unspecified.');
  if (throughStep < 2) return null;
  if (!['student', 'worker', 'pr_applicant', 'family_super_visa', 'visitor'].includes(profile.status)) return issue('status', 2, 'Choose a supported pathway.');
  if (!['stem', 'healthcare', 'trades', 'transport', 'business', 'general'].includes(profile.field)) return issue('study-field', 2, 'Choose a work or study sector.');
  if (throughStep < 3) return null;
  if (!['1', '2', '3', '4', '5'].includes(profile.familySize)) return issue('family-size', 3, 'Choose a household size.');
  if (!['yes', 'no'].includes(profile.children)) return issue('has-children', 3, 'Indicate whether children are accompanying you.');
  if (profile.familySize === '1' && profile.children === 'yes') return issue('family-size', 3, 'A solo traveller cannot also have accompanying children. Review your household size.');
  if (throughStep < 4) return null;
  const date = profile.arrivalDate;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return issue('arrival-date', 4, 'Choose a valid arrival date before generating your plan.');
  return null;
}

// Planning prompts only: this wizard does not verify financial requirements.
export function buildWizardPlan(country, status) {
  const fundsBenchmarkText = 'Not determined by this wizard';
  const statutoryRuleNote = 'Confirm the current requirement for your exact application route, location, household and application date using the relevant official source.';
  const tools = {
    Canada: {
      student: [['study-permit-cap-pal', 'Canadian study permit questions'], ['study-to-pr', 'Canadian study-to-work questions']],
      worker: [['lmia-readiness', 'Canadian employer and work permit questions']],
      pr_applicant: [['pr-matrix', 'Canadian permanent residence pathway questions']],
      family_super_visa: [['family-reunification', 'Canadian family application questions']]
    },
    'United States': {worker: [['us-h1b-opt', 'US H-1B / OPT questions']]},
    'United Kingdom': {worker: [['uk-skilled-worker', 'UK skilled worker questions']]},
    Australia: {worker: [['australia-reforms', 'Australian sponsored worker questions']]}
  };
  const matches = Object.hasOwn(tools, country) && Object.hasOwn(tools[country], status) ? tools[country][status] : [];
  const recTools = matches.map(([id, title]) => ({id, title, desc: 'Explore this topic separately. Your wizard answers are not transferred; enter and verify the tool inputs before relying on its result.'}));
  const toolNotice = recTools.length ? 'Related tools, not eligibility determinations. Confirm that the named route matches your situation.' : 'No route-matched tool recommendation is available for this profile. Use official guidance for your destination and exact route.';
  const milestones = [
    'Before travel: check document validity and the entry conditions for your exact route.',
    'Before arrival: confirm housing arrangements and health insurance requirements.',
    'After arrival: check which local registrations apply and their actual deadlines.',
    'As needed: compare banking, transport and schooling options for your location.',
    'Before filing: confirm tax residency and reporting obligations for each relevant country.'
  ];
  return {fundsBenchmarkText, statutoryRuleNote, recTools, toolNotice, milestones};
}
