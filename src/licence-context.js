// Recognize explicit issuing-country phrases only; nationality alone is not evidence.
import { countryPortals } from './country-portals.js';
const countries=[
 ['United Kingdom','United Kingdom|UK|British|Northern Ireland|Northern Irish'],
 ['Australia','Australia|Australian'],
 ['United States','United States|USA|US|American|California|Texas|Florida'],
 ['India','India|Indian|Delhi|Mumbai|Bangalore|Hyderabad|Chennai|Punjab'],
 ['Pakistan','Pakistan|Pakistani'],
 ['Philippines','Philippines|Philippine|Filipino|Manila'],
 ['Germany','Germany|German'],
 ['France','France|French'],
 ['Ukraine','Ukraine|Ukrainian'],
 ['Nigeria','Nigeria|Nigerian|Lagos|Abuja'],
 ['Japan','Japan|Japanese'],
 ['Ghana','Ghana|Ghanaian'],
 ['Hong Kong','Hong Kong|Hongkong'],
 ['Taiwan','Taiwan|Taiwanese'],
 ['Israel','Israel|Israeli'],
 ['Singapore','Singapore|Singaporean'],
 ['Netherlands','Netherlands|Dutch'],
 ['Ireland','(?<!Northern )Ireland|(?<!Northern )Irish'],
 ['New Zealand','New Zealand|New Zealander'],
 ['Norway','Norway|Norwegian'],
 ['Sweden','Sweden|Swedish'],
 ['Finland','Finland|Finnish'],
 ['Malta','Malta|Maltese'],
 ['Estonia','Estonia|Estonian'],
 ['United Arab Emirates','United Arab Emirates|UAE|Dubai UAE|Dubai|Abu Dhabi|Emirati'],
 // Every other country's portal entry point is registered in
 // country-portals.js. Aliases there are already regex-escaped, or are
 // deliberately written as regex fragments for ambiguous names.
 ...countryPortals.map(({country,aliases})=>[country,aliases.join('|')])
];

const licencePatterns = countries.map(([country, aliases]) => ({
 country,
 fastCheck: new RegExp(`\\b(?:${aliases})\\b`, 'iu'),
 patterns: [
  new RegExp(`\\b(${aliases})(?:[ -]issued)?\\s+(?:driving\\s+|driver'?s?\\s+)?licen[cs]e\\b`, 'giu'),
  new RegExp(`\\blicen[cs]e\\s+(?:(?:was\\s+)?issued\\s+(?:in|from|by)|from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu')
 ]
}));

const originPatterns = countries.map(([country, aliases]) => ({
 country,
 fastCheck: new RegExp(`\\b(?:${aliases})\\b`, 'iu'),
 patterns: [
  new RegExp(`\\b(?:from|moving from|immigrating from|arriving from|newcomer from|newcomers from|relocating from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(${aliases})\\s+(?:newcomer|immigrant|settler|community|newcomers|immigrants|citizen|citizens|national|nationals|applicants?|permanent\\s+residence\\s+applicants?)\\b`, 'giu'),
  new RegExp(`\\b(?:consulate(?:\\s+general)?|embassy|high\\s+commission)\\s+of\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:worked in|work in|working in|worked|work experience in|job in|jobs in|employed in|experience in)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:worked|work|working|employed|experience|internship|job|jobs)(?:\\s+[a-z0-9'-]+){0,6}\\s+(?:in|at|for)\\s+(?:the\\s+)?(?:[a-z0-9'-]+\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:lived in|living in|lives in|resided in|stayed in|spent in|time in|visited|traveled to|travelled to|born in|studied in|study in|educated in|degree from|degree in|graduated in|diploma from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:lived|living|lives|resided|stayed|spent|time|visited|traveled|travelled|born|studied|study|educated|graduated)(?:\\s+[a-z0-9'-]+){0,6}\\s+(?:in|at|from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:degrees?|diplomas?|universit(?:y|ies)|colleges?|institutes?|schools?)(?:\\s+[a-z0-9'-]+){0,4}\\s+(?:in|from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:custody|children|daughter|son|parents?|mother|father|spouse|family)(?:\\s+[a-z0-9'-]+){0,4}\\s+(?:in|from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:conviction|convictions|charge|charges|arrest|arrests|dui|tickets?|traffic|offen[cs]e|offenses?)(?:\\s+[a-z0-9'-]+){0,4}\\s+(?:in|from)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:in|from|and in)\\s+(?:the\\s+)?(?:[a-z0-9'-]+\\s+){0,3}(${aliases})(?=\\s+(?:for\\s+\\d+|since|while|before|prior to|until|during|through|across|on an?|as an?|with|after|when|paying|to|but))`, 'giu'),
  new RegExp(`\\b(${aliases})(?:'s)?\\s+(?:police\\s+(?:clearance|character\\s+certificate|certificate)s?|pcc|acro|nbi|ciid|fbi|degree|diploma|passport|education|school|licen[cs]e)\\b`, 'giu'),
  new RegExp(`\\b(?:police clearance|police character certificate|police certificate|pcc|extract|apostille|nbi|psk|fbi|acro|ciid|transcripts?)\\s+(?:from|for|in)\\s+(?:the\\s+)?(${aliases})\\b`, 'giu'),
  new RegExp(`\\b(?:from|in|by)\\s+(?:the\\s+)?(?:police(?:\\s+force)?|authorit(?:y|ies)|station|embassy|consulate|office)\\s+(?:in|at|of)\\s+(?:the\\s+)?(?:[a-z0-9'-]+\\s+){0,3}(${aliases})\\b`, 'giu')
 ]
}));

export function licenceContext(question) {
 if (typeof question !== 'string') return {licenceCountry: null, licenceCountryAmbiguous: false, destinationText: ''};
 const found=new Set(),spans=[];
 for(const {country, fastCheck, patterns} of licencePatterns) {
  if (!fastCheck.test(question)) continue;
  for(const pattern of patterns)for(const match of question.matchAll(pattern)) {
   const offset=match[0].toLowerCase().indexOf(match[1].toLowerCase());
   found.add(country);spans.push([match.index+offset,match.index+offset+match[1].length]);
  }
 }
 let destinationText=question;
 for(const [start,end] of spans.sort((a,b)=>b[0]-a[0]))destinationText=destinationText.slice(0,start)+' '.repeat(end-start)+destinationText.slice(end);
 return {licenceCountry:found.size===1?[...found][0]:null,licenceCountryAmbiguous:found.size>1,destinationText};
}
export function originCountryContext(question) {
 if (typeof question !== 'string') return {originCountry: null, destinationText: ''};
 const found=new Set(), spans=[];
 for(const {country, fastCheck, patterns} of originPatterns) {
  if (!fastCheck.test(question)) continue;
  for(const pattern of patterns) {
   for(const match of question.matchAll(pattern)) {
    found.add(country);
    spans.push([match.index, match.index + match[0].length]);
   }
  }
 }
 let destinationText=question;
 for(const [start,end] of spans.sort((a,b)=>b[0]-a[0]))destinationText=destinationText.slice(0,start)+' '.repeat(end-start)+destinationText.slice(end);
 return {originCountry:found.size===1?[...found][0]:null,destinationText};
}
