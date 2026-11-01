import fs from 'node:fs';

let app = fs.readFileSync('public/app.js', 'utf8');

const block = `  {
    "id": "cmd-esa-wage-theft",
    "toolModal": "esa-wage-theft",
    "title": "Ontario ESA: Overtime (44h), Vacation Step-Up (6%) & Severance",
    "desc": "44-hr overtime threshold, 6% vacation pay step-up, public holiday pay formula, $2.5M severance & contractor misclassification",
    "icon": "⚖️",
    "keywords": ["esa", "overtime", "44 hours", "vacation pay", "step up", "public holiday", "severance", "misclassification", "contractor", "equal pay", "काम", "नौकरी", "वेतन", "ओवरटाइम"],
    "category": "work"
  },
  {
    "id": "cmd-workplace-rights",
    "toolModal": "workplace-rights",
    "title": "Workplace Rights: Constructive Dismissal, Canadian Experience Ban & WSIB",
    "desc": "Potter substantial breach standard, OHRC & FARPACTA Canadian experience ban, OHSA work refusal & 6-month WSIB deadline",
    "icon": "🛡️",
    "keywords": ["constructive dismissal", "potter", "canadian experience", "ohrc", "farpacta", "ohsa", "work refusal", "wsib", "injury", "हक", "अधिकार", "सुरक्षा", "नियम"],
    "category": "work"
  },
  {
    "id": "cmd-ei-benefits",
    "toolModal": "ei-benefits",
    "title": "Employment Insurance: 420-700 Hours, Voluntary Quit Just Cause & Sickness",
    "desc": "Regional unemployment rate hours grid, s. 29(c) just cause quit defense, 26-week sickness & parental leave options",
    "icon": "💼",
    "keywords": ["ei", "employment insurance", "hours", "voluntary quit", "just cause", "sickness", "maternity", "parental", "qpip", "बेरोजगारी", "भत्ता", "बीमा"],
    "category": "work"
  },
  {
    "id": "cmd-fcr-bridging",
    "toolModal": "fcr-bridging",
    "title": "Foreign Credentials: $15k FCR Micro-Loans, IEN SPEP & IMG PRA",
    "desc": "Low-interest licensing loans, CNO supervised practice nursing partnership, and IMG Practice Ready Assessment (PRA)",
    "icon": "🩺",
    "keywords": ["fcr", "micro-loan", "credential", "licensing", "nurse", "ien", "spep", "cno", "doctor", "img", "pra", "डिग्री", "लाइसेंस", "नर्स", "डॉक्टर"],
    "category": "health"
  },\n`;

// Remove all occurrences
app = app.replaceAll(block, '');

// Now insert exactly once before id: 'express-entry-crs'
const target = `  {
    "id": "express-entry-crs",`;

if (app.includes(target)) {
  app = app.replace(target, block + target);
} else {
  console.log('Target not found!');
}

fs.writeFileSync('public/app.js', app, 'utf8');
console.log('New count of cmd-esa-wage-theft:', (app.match(/cmd-esa-wage-theft/g) || []).length);
