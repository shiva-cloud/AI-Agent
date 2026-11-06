// Fast path to people who can help when a question describes an emergency. It
// states no law and draws on no evidence record, so it is shown even when the
// reviewed answer is withheld or still needs a location. Numbers match the
// emergency directory in public/app/data.js and src/narrative-crisis-resolver.js.
import {deconstructNarrative} from './narrative-deconstructor.js';
import {detectSocialCrisisScenario, SOCIAL_CRISIS_TYPES} from './social-qa-crisis-navigator.js';

export const URGENT_HELP_VERSION = 'urgent-1';

const EMERGENCY_NUMBERS = Object.freeze({
  CA: '911', 'United States': '911', 'United Kingdom': '999', Australia: '000', Germany: '112',
  'United Arab Emirates': '999', 'New Zealand': '111', Ireland: '112', Singapore: '999',
  France: '112', Netherlands: '112', Sweden: '112', Spain: '112'
});

const SELF_HARM = /\b(?:kill(?:ing)? myself|suicid\w*|end(?:ing)? my life|want to die|self[- ]harm)\b/i;
const VIOLENCE = /\b(?:(?:hits?|beats?|hurts?|assault(?:s|ed)?|attack(?:s|ed)?|abus(?:es|ed|ing))\s+(?:me|us|my)\b|in danger|unsafe at home|afraid (?:for my life|he will|she will|they will))/i;
const NO_SHELTER = /\b(?:nowhere to (?:sleep|stay|go)|sleeping (?:outside|on the street)|homeless (?:tonight|now)|on the street tonight)\b/i;

const KINDS = Object.freeze({
  self_harm: {title: 'You deserve support right now', message: 'If you might act on these thoughts, call your local emergency number now. Talking to someone today can help.'},
  immediate_danger: {title: 'Your safety comes first', message: 'If you or someone with you is in danger, call the emergency number now. You can ask for an interpreter. Immigration paperwork can wait until you are safe.'},
  document_withholding: {title: 'Your passport or permit is being held', message: 'If you are being threatened, watched or not allowed to leave, call the emergency number. A hotline can also help you confidentially.'},
  housing_emergency: {title: 'You may be without a safe place to stay', message: 'If you are in danger or out in the cold tonight, call the emergency number. Community helplines can find emergency shelter.'},
  threats: {title: 'You are being threatened', message: 'If you feel unsafe, call the emergency number. Save the messages and dates, and do not pay or sign anything under pressure.'},
  representative_fraud: {title: 'Your agent has stopped responding', message: 'If a deadline is close, speak to a legal clinic or licensed representative today. Keep every receipt and message, and do not pay anyone else to rush it.'}
});

function detectKind(question) {
  if (SELF_HARM.test(question)) return 'self_harm';
  if (VIOLENCE.test(question)) return 'immediate_danger';
  const narrative = deconstructNarrative(question);
  const conflict = narrative.slots.conflict?.id, myth = narrative.mythWarning?.id;
  const social = detectSocialCrisisScenario(question)?.type;
  if (conflict === 'domestic_violence_abuse') return 'immediate_danger';
  if (conflict === 'passport_withheld' || myth === 'myth_employer_passport_retention' || social === SOCIAL_CRISIS_TYPES.PASSPORT_RETENTION) return 'document_withholding';
  if (conflict === 'illegal_lockout' || myth === 'myth_landlord_self_help_lockout' || NO_SHELTER.test(question)) return 'housing_emergency';
  if (social === SOCIAL_CRISIS_TYPES.AGENT_GHOSTING) return 'representative_fraud';
  if (social === SOCIAL_CRISIS_TYPES.THREATS_EXTORTION) return 'threats';
  return null;
}

function contactsFor(kind, country) {
  const number = EMERGENCY_NUMBERS[country];
  const contacts = number ? [{label: 'Emergency services', phone: number}] : [];
  if (kind === 'self_harm' && (country === 'CA' || country === 'United States')) contacts.unshift({label: 'Suicide Crisis Helpline', phone: '988'});
  if (country !== 'CA') return contacts;
  if (kind === 'document_withholding') contacts.push({label: 'Canadian Human Trafficking Hotline', phone: '1-833-900-1010'});
  if (kind !== 'self_harm') contacts.push({label: 'Community and social services', phone: '211'});
  return contacts;
}

export function detectUrgentHelp(question, country = 'CA') {
  if (typeof question !== 'string' || !question.trim()) return null;
  const kind = detectKind(question);
  if (!kind) return null;
  const {title, message} = KINDS[kind];
  return {
    version: URGENT_HELP_VERSION, kind, title,
    // Generic wording when the country is unknown: never a number from elsewhere.
    message: EMERGENCY_NUMBERS[country] ? message : `${message} Use the local emergency number where you are.`,
    contacts: contactsFor(kind, country),
    // The Emergency Help view's steps are written for Canada.
    helpView: country === 'CA' ? 'sos' : null
  };
}
