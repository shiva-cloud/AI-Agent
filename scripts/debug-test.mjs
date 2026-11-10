import { subjectEvidenceMatcher, requestedSubject } from '../src/requested-subject.js';

const q = 'How do I start the process for employer specific permit in Toronto?';
const matcher = subjectEvidenceMatcher(q);
const r1 = {title:'What is work?',summary:'Wages are paid by an employer. Some visitors do not need a work permit. This does not decide whether a specific activity is work.'};
const r2 = {title:'What is work? Remote work for an employer outside Canada',summary:'Wages are paid by an employer. This record does not issue work permits or decide whether a specific activity is work.'};
const r3 = {title:'Employer-specific work permits',summary:'Requirements for an employer-specific permit.'};

console.log('r1:', matcher(r1));
console.log('r2:', matcher(r2));
console.log('r3:', matcher(r3));
