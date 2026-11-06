// Command palette directory: every searchable command and the view or tool it opens.
// Split out of public/app.js; app.js imports what it uses from here.

export const COMMAND_DIRECTORY = [
  {
    "id": "ask",
    "title": "Ask Northstar",
    "desc": "Ask a question and get an answer with official sources",
    "icon": "◈",
    "shortcut": "Ctrl+1",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "binder",
    "title": "Document Binder",
    "desc": "Checklist of documents for ID numbers, health cards, renting and banking",
    "icon": "📋",
    "shortcut": "Ctrl+2",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "watchdog",
    "view": "binder",
    "title": "Permit expiry check",
    "desc": "See when your permit expires and whether you keep your status",
    "icon": "⏱",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "preflight-inspector",
    "view": "binder",
    "title": "Pre-departure document check",
    "desc": "Check passport, COPR, medical and language-test dates before you fly",
    "icon": "✈️",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "cmd-poe-rights",
    "toolModal": "poe-rights",
    "category": "arrival",
    "title": "Airport & Border Port-of-Entry Rights Navigator",
    "desc": "Audit statutory rights at Canadian, US, UK, and Australian ports: secondary inspection, phone privacy, and voluntary withdrawal",
    "icon": "🛂",
    "keywords": [
      "border",
      "poe",
      "cbsa",
      "cbp",
      "inspection",
      "phone",
      "search",
      "rights",
      "airport",
      "secondary",
      "withdrawal",
      "बॉर्डर",
      "अधिकार",
      "हवाई अड्डा",
      "आगमन"
    ]
  },
  {
    "id": "cmd-legal-notices",
    "toolModal": "legal-notices",
    "category": "notices",
    "title": "Legal Notice & Statutory Rights Generator",
    "desc": "Generate formal legal notices: LTB Form T2/T6, OHSA s.43 unsafe work refusal, ESA s.13 wage demand, and Alberta RTA s.19",
    "icon": "📜",
    "keywords": [
      "notice",
      "legal",
      "ltb",
      "t2",
      "t6",
      "ohsa",
      "esa",
      "wages",
      "lockout",
      "repair",
      "deposit",
      "rta",
      "statutory",
      "कानूनी",
      "नोटिस",
      "हक",
      "मांग पत्र",
      "अदालत"
    ]
  },
  {
    "id": "cmd-calendar-sync",
    "toolModal": "calendar-sync",
    "category": "arrival",
    "title": "Settlement Roadmap Calendar & ICS Event Sync",
    "desc": "Generate 180-day milestone timeline, OHIP/SIN dates, and export .ics iCalendar sync files",
    "icon": "🗓️",
    "keywords": [
      "calendar",
      "sync",
      "ics",
      "milestones",
      "timeline",
      "roadmap",
      "schedule",
      "ical",
      "export",
      "कैलेंडर",
      "इवेंट",
      "तारीख",
      "आगमन"
    ]
  },
  {
    "id": "cmd-tax-shield",
    "toolModal": "tax-shield",
    "category": "tax",
    "title": "Cross-Border Tax Shield & Foreign Asset Reporting (T1135)",
    "desc": "Evaluate CRA Form T1135 $100k threshold, foreign property reporting, and Section 116 withholding",
    "icon": "🛡️",
    "keywords": [
      "tax",
      "shield",
      "t1135",
      "foreign",
      "property",
      "cra",
      "withholding",
      "section 116",
      "offshore",
      "declaration",
      "टैक्स",
      "विदेशी संपत्ति",
      "बचत",
      "पैसा"
    ]
  },
  {
    "id": "cmd-family-reunification",
    "toolModal": "family-reunification",
    "category": "health",
    "title": "Family Reunification & Super Visa Income Navigator",
    "desc": "Audit LICO + 30% household thresholds, 20-year undertaking, and Super Visa $100k insurance",
    "icon": "👨‍👩‍👧‍👦",
    "keywords": [
      "family",
      "reunification",
      "super visa",
      "lico",
      "parents",
      "grandparents",
      "sponsorship",
      "undertaking",
      "insurance",
      "परिवार",
      "सुपर वीजा",
      "माता-पिता",
      "स्वास्थ्य"
    ]
  },
  {
    "id": "cmd-pr-matrix",
    "toolModal": "pr-matrix",
    "category": "immigration",
    "title": "PR Pathway Eligibility & Points Matrix",
    "desc": "Calculate Express Entry CRS points, PNP categories, draw cutoffs and invitation likelihood",
    "icon": "🍁",
    "keywords": [
      "pr",
      "matrix",
      "points",
      "crs",
      "express",
      "entry",
      "ita",
      "draw",
      "cec",
      "fsw",
      "pnp",
      "score",
      "पीआर",
      "मेरिट",
      "पॉइंट्स",
      "अंक",
      "वीजा"
    ]
  },
  {
    "id": "cmd-study-permit-cap-pal",
    "toolModal": "study-permit-cap-pal",
    "title": "Study Permit Cap & PAL Exemption Checker",
    "desc": "Study permit planning, public-DLI graduate PAL rules, and date-aware living funds",
    "icon": "🎓",
    "keywords": [
      "pal",
      "study",
      "permit",
      "cap",
      "ircc",
      "attestation",
      "funds",
      "tuition",
      "living",
      "financial support",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "cmd-visitor-visa-financial-ties",
    "toolModal": "visitor-visa-financial-ties",
    "title": "Visitor Visa Financial & Domestic Ties (s.179(b))",
    "desc": "Dual intent score, economic ties and departure intent risk tier",
    "icon": "✈️",
    "keywords": [
      "visitor",
      "visa",
      "ties",
      "179b",
      "trv",
      "dual",
      "intent",
      "departure",
      "refusal",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "cmd-lmia-readiness",
    "toolModal": "lmia-readiness",
    "title": "LMIA Readiness & Wage Stream Auditor",
    "desc": "C16 Francophone exemption, CUSMA, provincial median wages, and 20% low-wage cap",
    "icon": "💼",
    "keywords": [
      "lmia",
      "esdc",
      "tfw",
      "c16",
      "francophone",
      "median",
      "wage",
      "high",
      "low",
      "stream",
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ],
    "category": "labor"
  },
  {
    "id": "cmd-sin-healthcare",
    "toolModal": "sin-healthcare",
    "title": "SIN & Healthcare 14-Day Enrollment Kit",
    "desc": "Series-9 SIN issuance, Ontario immediate OHIP vs BC MSP 2-month wait",
    "icon": "🏥",
    "keywords": [
      "sin",
      "healthcare",
      "ohip",
      "msp",
      "ahcip",
      "enrollment",
      "card",
      "id",
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ],
    "category": "health"
  },
  {
    "id": "cmd-study-to-pr",
    "toolModal": "study-to-pr",
    "title": "Study-to-PR Transition & PGWP Roadmap",
    "desc": "Calculate PGWP entitlement, CEC 52-week work milestone and provincial nominee streams",
    "icon": "🍁",
    "keywords": [
      "study",
      "pr",
      "pgwp",
      "cec",
      "experience",
      "oinp",
      "bc pnp",
      "roadmap",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "cmd-gcms-analyzer",
    "toolModal": "gcms-analyzer",
    "title": "GCMS Refusal Notes & Federal Court Remedies",
    "desc": "Decode ATIA officer refusal notes with Federal Court precedents (Vavilov, Dhanoa)",
    "icon": "⚖️",
    "keywords": [
      "gcms",
      "refusal",
      "officer",
      "notes",
      "atia",
      "rejection",
      "vavilov",
      "dhanoa",
      "court",
      "appeal",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "cmd-global-visa-matrix",
    "toolModal": "global-visa-matrix",
    "title": "Multi-Country Visa & Global Relocation Navigator",
    "desc": "Compare skilled visa options across Canada, US, UK, Australia, Germany and UAE",
    "icon": "🌐",
    "keywords": [
      "global",
      "visa",
      "matrix",
      "us",
      "uk",
      "australia",
      "germany",
      "uae",
      "blue card",
      "h1b",
      "chancenkarte",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-moving-tax-calc",
    "toolModal": "moving-tax-calc",
    "title": "CRA Form T1-M Moving Expense (40km Relocation)",
    "desc": "Calculate allowable moving deductions, mileage, simplified meals and carryforward",
    "icon": "📦",
    "keywords": [
      "moving",
      "t1m",
      "relocation",
      "cra",
      "deduction",
      "tax",
      "40km",
      "movers",
      "meals",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "cmd-severance-bardal",
    "toolModal": "severance-bardal",
    "title": "Common Law Severance (Bardal Factors) vs ESA Floor",
    "desc": "Calculate reasonable notice period, age/role factors, and avoid severance release traps",
    "icon": "⚖️",
    "keywords": [
      "severance",
      "bardal",
      "notice",
      "layoff",
      "esa",
      "termination",
      "pay",
      "package",
      "firing",
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ],
    "category": "labor"
  },
  {
    "id": "cmd-us-h1b-opt",
    "toolModal": "us-h1b-opt",
    "title": "US: H-1B 60-Day Grace Period & F-1 Cap-Gap",
    "desc": "Calculate H-1B layoff grace period, severance impact, Cap-Gap extension, and 245(k) forgiveness",
    "icon": "🇺🇸",
    "keywords": [
      "us",
      "h1b",
      "opt",
      "cap-gap",
      "grace",
      "layoff",
      "severance",
      "245k",
      "uscis",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-uk-skilled-worker",
    "toolModal": "uk-skilled-worker",
    "title": "UK: Skilled Worker Salary Rules & ILR Absence",
    "desc": "Statement of Changes HC 590 salary audit, 180-day rolling ILR absence, and Section 21 eviction defense",
    "icon": "🇬🇧",
    "keywords": [
      "uk",
      "skilled",
      "worker",
      "salary",
      "ilr",
      "absence",
      "180",
      "eviction",
      "section 21",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-super-visa-lico",
    "toolModal": "super-visa-lico",
    "title": "Canada: Super Visa & Parents/Grandparents Income (LICO + 30%)",
    "desc": "Household LICO + 30% financial threshold, $100k Canadian medical insurance, and 20-year undertaking",
    "icon": "🍁",
    "keywords": [
      "super visa",
      "parents",
      "grandparents",
      "lico",
      "insurance",
      "sponsorship",
      "pgp",
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ],
    "category": "health"
  },
  {
    "id": "cmd-australia-reforms",
    "toolModal": "australia-reforms",
    "title": "Australia: Subclass 482 Condition 8607 (180 Days) & MES",
    "desc": "July 2024 180-day transfer rule, interim work rights, and 2% Medicare levy exemption",
    "icon": "🇦🇺",
    "keywords": [
      "australia",
      "482",
      "tss",
      "8607",
      "medicare",
      "mes",
      "levy",
      "transfer",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-germany-chancenkarte",
    "toolModal": "germany-chancenkarte",
    "title": "Germany: Chancenkarte (Opportunity Card) & Nebenkosten",
    "desc": "6-point qualification test, 20h secondary work, and BGB 556(3) 12-month utility preclusion rule",
    "icon": "🇩🇪",
    "keywords": [
      "germany",
      "chancenkarte",
      "points",
      "nebenkosten",
      "utility",
      "bgb",
      "556",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-cra-newcomer-wealth",
    "toolModal": "cra-newcomer-wealth",
    "title": "CRA: Newcomer Wealth, FHSA $8k & HBP $60k",
    "desc": "First Home Savings Account, Budget 2024 $60k HBP, 1% TFSA penalty, FMV step-up & Deed of Gift",
    "icon": "💰",
    "keywords": [
      "cra",
      "fhsa",
      "hbp",
      "rrsp",
      "tfsa",
      "tax",
      "gift",
      "wire",
      "fintrac",
      "wealth",
      "step-up",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "cmd-ontario-bc-tenancy",
    "toolModal": "ontario-bc-tenancy",
    "title": "Ontario & BC: Tenancy Defense, 2.5% Cap & N12 Deadline",
    "desc": "Form N1 vs N2 post-2018 exemption, s. 5(i) shared bath, N12 compensation deadline & BC 12-month penalty",
    "icon": "🏠",
    "keywords": [
      "ontario",
      "bc",
      "tenancy",
      "rent",
      "rta",
      "ltb",
      "rtb",
      "n1",
      "n2",
      "n12",
      "t1",
      "bad faith",
      "compensation",
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-australia-tenancy",
    "toolModal": "australia-tenancy",
    "title": "Australia: State Tenancy Tribunals (NCAT, VCAT, QCAT, DMIRS)",
    "desc": "Audit 4-week bond caps, 12-month rent increase intervals, 60-day notice, and urgent repair limits across NSW, VIC, QLD, WA",
    "icon": "🇦🇺",
    "keywords": [
      "australia",
      "tenancy",
      "rent",
      "bond",
      "ncat",
      "vcat",
      "qcat",
      "dmirs",
      "nsw",
      "vic",
      "qld",
      "wa",
      "किराया",
      "बॉन्ड",
      "ऑस्ट्रेलिया",
      "मकान"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-us-state-tenancy",
    "toolModal": "us-state-tenancy",
    "title": "US: State Tenancy Protections (CA AB 1482, NY HSTPA, TX Ch 92, FL Ch 83)",
    "desc": "California 10% rent cap & just cause, New York 1-month deposit cap & 14-day return, Texas 7-day repair notice, Florida 15/30-day claims",
    "icon": "🇺🇸",
    "keywords": [
      "us",
      "usa",
      "united states",
      "tenancy",
      "rent control",
      "ab 1482",
      "hstpa",
      "california",
      "new york",
      "texas",
      "florida",
      "security deposit",
      "किराया",
      "अमेरिका",
      "डिपॉजिट"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-uk-devolved-tenancy",
    "toolModal": "uk-devolved-tenancy",
    "title": "UK: Devolved Nations Tenancy (Scotland PRT, Wales 6-Mo Notice, NI)",
    "desc": "Scotland Private Residential Tenancy (no Section 21, 18 grounds), Wales Standard Occupation Contract (6 months notice), NI deposit scheme",
    "icon": "🇬🇧",
    "keywords": [
      "uk",
      "scotland",
      "wales",
      "northern ireland",
      "prt",
      "tenancy",
      "eviction",
      "section 21",
      "rent",
      "deposit",
      "किराया",
      "यूके",
      "स्कॉटलैंड",
      "वेल्स"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-uae-tenancy-dispute",
    "toolModal": "uae-tenancy-dispute",
    "title": "UAE: Tenancy Dispute (Dubai RERA Decree 43 vs Abu Dhabi Tawtheeq 5% Cap)",
    "desc": "Calculate lawful RERA rent increase tiers, 90-day renewal notice, 12-month notary eviction notice, and Abu Dhabi 5% statutory cap",
    "icon": "🇦🇪",
    "keywords": [
      "uae",
      "dubai",
      "abu dhabi",
      "rera",
      "ejari",
      "tawtheeq",
      "rent index",
      "decree 43",
      "notary",
      "eviction",
      "किराया",
      "दुबई",
      "यूएई",
      "अबू धाबी"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-global-expat",
    "toolModal": "global-expat",
    "title": "Global Expat: UAE Gratuity, Dubai RERA, NZ & Singapore COMPASS",
    "desc": "UAE gratuity & visa deduction shield, Dubai 12-month notary eviction, NZ 90-day cushion & Singapore COMPASS",
    "icon": "🌐",
    "keywords": [
      "uae",
      "gratuity",
      "dubai",
      "rera",
      "nz",
      "aewv",
      "bond",
      "ireland",
      "csep",
      "stamp 4",
      "singapore",
      "compass",
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ],
    "category": "global"
  },
  {
    "id": "cmd-canada-status-admissibility",
    "toolModal": "canada-status-admissibility",
    "title": "Canada: Status Restoration (90 Days), PGWP Border Ban & Admissibility",
    "desc": "IRPR s. 182 90-day restoration, June 2024 flagpoling ban, 150-day DLI leave & 10-year deemed rehabilitation",
    "icon": "🛡️",
    "keywords": [
      "restoration",
      "irpr 182",
      "flagpoling",
      "pgwp ban",
      "dli",
      "leave",
      "criminal",
      "inadmissibility",
      "rehabilitation",
      "trp",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "cmd-esa-wage-theft",
    "toolModal": "esa-wage-theft",
    "title": "Ontario ESA: Overtime (44h), Vacation Step-Up (6%) & Severance",
    "desc": "44-hr overtime threshold, 6% vacation pay step-up, public holiday pay formula, $2.5M severance & contractor misclassification",
    "icon": "⚖️",
    "keywords": [
      "esa",
      "overtime",
      "44 hours",
      "vacation pay",
      "step up",
      "public holiday",
      "severance",
      "misclassification",
      "contractor",
      "equal pay",
      "काम",
      "नौकरी",
      "वेतन",
      "ओवरटाइम"
    ],
    "category": "work"
  },
  {
    "id": "cmd-workplace-rights",
    "toolModal": "workplace-rights",
    "title": "Workplace Rights: Constructive Dismissal, Canadian Experience Ban & WSIB",
    "desc": "Potter substantial breach standard, OHRC & FARPACTA Canadian experience ban, OHSA work refusal & 6-month WSIB deadline",
    "icon": "🛡️",
    "keywords": [
      "constructive dismissal",
      "potter",
      "canadian experience",
      "ohrc",
      "farpacta",
      "ohsa",
      "work refusal",
      "wsib",
      "injury",
      "हक",
      "अधिकार",
      "सुरक्षा",
      "नियम"
    ],
    "category": "work"
  },
  {
    "id": "cmd-ei-benefits",
    "toolModal": "ei-benefits",
    "title": "Employment Insurance: 420-700 Hours, Voluntary Quit Just Cause & Sickness",
    "desc": "Regional unemployment rate hours grid, s. 29(c) just cause quit defense, 26-week sickness & parental leave options",
    "icon": "💼",
    "keywords": [
      "ei",
      "employment insurance",
      "hours",
      "voluntary quit",
      "just cause",
      "sickness",
      "maternity",
      "parental",
      "qpip",
      "बेरोजगारी",
      "भत्ता",
      "बीमा"
    ],
    "category": "work"
  },
  {
    "id": "cmd-fcr-bridging",
    "toolModal": "fcr-bridging",
    "title": "Foreign Credentials: $15k FCR Micro-Loans, IEN SPEP & IMG PRA",
    "desc": "Low-interest licensing loans, CNO supervised practice nursing partnership, and IMG Practice Ready Assessment (PRA)",
    "icon": "🩺",
    "keywords": [
      "fcr",
      "micro-loan",
      "credential",
      "licensing",
      "nurse",
      "ien",
      "spep",
      "cno",
      "doctor",
      "img",
      "pra",
      "डिग्री",
      "लाइसेंस",
      "नर्स",
      "डॉक्टर"
    ],
    "category": "health"
  },
  {
    "id": "cmd-city-comparison",
    "toolModal": "city-comparison",
    "title": "City Comparison: Toronto vs Calgary vs Vancouver Cost & Taxes",
    "desc": "CMHC median rent, provincial income and sales tax differentials (0% AB PST), healthcare waiting periods & transit costs",
    "icon": "🏙️",
    "keywords": [
      "city comparison",
      "toronto",
      "calgary",
      "vancouver",
      "montreal",
      "cost of living",
      "rent",
      "taxes",
      "pst",
      "transit",
      "शहर",
      "खर्च",
      "किराया"
    ],
    "category": "housing"
  },
  {
    "id": "cmd-form-autopopulate",
    "toolModal": "form-autopopulate",
    "title": "Form Preparation Worksheets: CBSA, LTB, CRA & PDF",
    "desc": "Prepare a draft worksheet. Complete the current official form separately before submission.",
    "icon": "📑",
    "keywords": [
      "forms",
      "pdf",
      "bsf186",
      "b4",
      "ltb t1",
      "ltb t2",
      "cra rc151",
      "customs declaration",
      "फॉर्म",
      "आवेदन",
      "दस्तावेज़"
    ],
    "category": "immigration"
  },
  {
    "id": "express-entry-crs",
    "title": "Express Entry CRS score",
    "section": "pathway",
    "desc": "Estimate your CRS points, compare category draws and see what adds points",
    "keywords": [
      "crs",
      "express",
      "entry",
      "ita",
      "draw",
      "points",
      "stem",
      "french",
      "cec",
      "pnp",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "pnp-pathway",
    "title": "Provincial Nominee Program (PNP) & Tech Draws",
    "section": "pathway",
    "desc": "BC PNP 200-pt matrix, weekly BC Tech draws, OINP Tech, AAIP, +600 CRS bonus & settlement funds",
    "keywords": [
      "pnp",
      "bc",
      "oinp",
      "alberta",
      "aaip",
      "nominee",
      "provincial",
      "tech",
      "draw",
      "points",
      "matrix",
      "stream",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "bowp-diagnostic",
    "title": "Bridging Open Work Permit (BOWP)",
    "section": "pathway",
    "desc": "Check Exemption Code A75 eligibility, maintained status, AOR timing and spousal SOWP",
    "keywords": [
      "bowp",
      "bridging",
      "work",
      "permit",
      "pgwp",
      "aor",
      "maintained",
      "implied",
      "status",
      "sowp",
      "c41",
      "a75",
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ],
    "category": "immigration"
  },
  {
    "id": "business-structure",
    "title": "Newcomer small business & incorporation",
    "section": "careers",
    "desc": "Check closed-permit restrictions, sole proprietorship vs incorporation, PSB trap and GST/HST rules",
    "keywords": [
      "business",
      "incorporation",
      "sole",
      "proprietorship",
      "cra",
      "gst",
      "hst",
      "corporation",
      "contractor",
      "psb",
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ],
    "category": "labor"
  },
  {
    "id": "parental-leave",
    "title": "Parental and maternity leave (EI)",
    "section": "careers",
    "desc": "Check EI eligibility, job protection and standard vs extended benefits",
    "keywords": [
      "parental",
      "maternity",
      "leave",
      "ei",
      "paternity",
      "baby",
      "birth",
      "child",
      "qpip",
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ],
    "category": "health"
  },
  {
    "id": "currency-exchange",
    "title": "Moving money to Canada",
    "section": "banking",
    "desc": "Compare exchange costs and see the $10,000 reporting rule",
    "keywords": [
      "exchange",
      "norbert",
      "gambit",
      "fintrac",
      "currency",
      "wire",
      "usd",
      "dlr",
      "transfer",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "debt-defense",
    "title": "Debt collection defense",
    "section": "banking",
    "desc": "Check statute-barred debts, stop collector harassment and get an in-writing notice",
    "keywords": [
      "debt",
      "collector",
      "collection",
      "limitation",
      "statute",
      "barred",
      "credit",
      "harassment",
      "extortion",
      "metcredit",
      "cbv",
      "कानूनी नोटिस",
      "हक",
      "मांग पत्र",
      "मुआवजा",
      "अदालत"
    ],
    "category": "notices"
  },
  {
    "id": "telecom-defense",
    "view": "banking",
    "title": "Cell phone & internet contract defense",
    "desc": "CRTC Wireless Code 15-day cancellation, $50 data overage cap, and CCTS complaint",
    "icon": "📱",
    "keywords": [
      "phone",
      "mobile",
      "crtc",
      "wireless",
      "overage",
      "roaming",
      "ccts",
      "rogers",
      "bell",
      "telus",
      "contract",
      "trial",
      "unlock",
      "कानूनी नोटिस",
      "हक",
      "मांग पत्र",
      "मुआवजा",
      "अदालत"
    ],
    "category": "notices"
  },
  {
    "id": "identity-harmonization",
    "view": "binder",
    "title": "Name mismatch helper",
    "desc": "Fix differences in your name across documents, step by step",
    "icon": "🪪",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "airport",
    "title": "Airport Arrival Kit",
    "desc": "What to declare at the border and what to do in your first 48 hours",
    "icon": "✈",
    "shortcut": "Ctrl+3",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "bsf186-engine",
    "view": "airport",
    "title": "Customs declaration (BSF186)",
    "desc": "Declare your belongings and cash when you settle in Canada",
    "icon": "📦",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "pet-import",
    "view": "airport",
    "title": "Bringing a pet into Canada",
    "desc": "Rabies and microchip rules, and Ontario breed restrictions",
    "icon": "🐾",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "pathway",
    "title": "Pathway Comparator",
    "desc": "Compare points estimates for Canada, the UK, Australia and Germany",
    "icon": "⚖",
    "shortcut": "Ctrl+4",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "citizenship",
    "view": "pathway",
    "title": "Citizenship eligibility",
    "desc": "Count your days in Canada and find your earliest application date",
    "icon": "🇨🇦",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "border-flagpoling",
    "view": "pathway",
    "title": "Border flagpoling & POE diagnostic",
    "desc": "Check June 2024 PGWP border ban, maintained status risk and port schedules",
    "icon": "🛂",
    "keywords": [
      "flagpoling",
      "flagpole",
      "cbsa",
      "rainbow",
      "peace",
      "border",
      "cbp",
      "poe",
      "maintained",
      "pgwp",
      "i-160a",
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ],
    "category": "arrival"
  },
  {
    "id": "pr-residency",
    "view": "pathway",
    "title": "PR card renewal check",
    "desc": "Check the 730-day residency requirement",
    "icon": "🍁",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "super-visa-sponsor",
    "view": "pathway",
    "title": "Sponsoring parents: income check",
    "desc": "Super Visa and Parents and Grandparents Program income rules",
    "icon": "👨‍👩‍👧‍👦",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "cashflow",
    "title": "Relocation Budget",
    "desc": "Estimate your first 90 days of costs and how long savings last",
    "icon": "💰",
    "shortcut": "Ctrl+5",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "budget",
    "view": "cashflow",
    "title": "Monthly budget for a Canadian city",
    "desc": "Rent, food and expected benefits for your household",
    "icon": "🍁",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "homebuyer",
    "view": "cashflow",
    "title": "Buying a home as a newcomer",
    "desc": "Foreign-buyer rules and closing costs",
    "icon": "🏡",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "homebuyer-tax",
    "view": "cashflow",
    "title": "First-time homebuyer tax incentives (FHSA & HBP)",
    "desc": "Calculate FHSA, $60k RRSP HBP down payment, grace period & LTT rebates",
    "icon": "🏡",
    "keywords": [
      "homebuyer",
      "fhsa",
      "hbp",
      "rrsp",
      "tax",
      "rebate",
      "first-time",
      "downpayment",
      "property",
      "house",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "tenancy",
    "title": "Tenant Rights",
    "desc": "Check a landlord’s demand and draft a reply",
    "icon": "🛡",
    "shortcut": "Ctrl+6",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "vault",
    "view": "tenancy",
    "title": "Landlord and Tenant Board claim estimate",
    "desc": "Estimate what you could claim and what evidence to keep",
    "icon": "🎙",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "lease-guard",
    "view": "tenancy",
    "title": "Lease checker",
    "desc": "Spot lease clauses that may not be allowed",
    "icon": "🛡️",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "eviction-defense",
    "view": "tenancy",
    "title": "Eviction notice check",
    "desc": "Check an Ontario N12, N13, N4 or N11 notice for common problems",
    "icon": "🛡️",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "lease-assignment",
    "view": "tenancy",
    "title": "Lease assignment & early exit",
    "desc": "Leave a fixed-term lease early: assignment, notice forms and lease-break fees",
    "icon": "📝",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "rent-increase",
    "view": "tenancy",
    "title": "Rent increase & illegal AGI checker",
    "desc": "Audit 2.5% statutory cap, post-2018 exemptions, and right to pay guideline only",
    "icon": "📈",
    "keywords": [
      "rent",
      "increase",
      "agi",
      "n1",
      "n2",
      "guideline",
      "landlord",
      "ltb",
      "overpayment",
      "t1",
      "2.5%",
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ],
    "category": "housing"
  },
  {
    "id": "journey",
    "title": "180-Day Settlement Roadmap",
    "desc": "Dated task list you can export to your calendar",
    "icon": "🗓",
    "shortcut": "Ctrl+7",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "tax",
    "title": "Cross-Border Tax",
    "desc": "Foreign-asset reporting and treaty withholding rates",
    "icon": "🌐",
    "shortcut": "Ctrl+8",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "cra-benefits",
    "view": "tax",
    "title": "Canadian benefits for newcomers",
    "desc": "Estimate the Canada Child Benefit and GST/HST credit",
    "icon": "🍁",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "moving-tax",
    "view": "tax",
    "title": "Newcomer moving expense deduction (T1-M)",
    "desc": "Deduct moving expenses against Canadian income under ITA s.62",
    "icon": "📦",
    "keywords": [
      "moving",
      "expenses",
      "t1m",
      "t1-m",
      "relocation",
      "cra",
      "deduction",
      "tax",
      "refund",
      "carryforward",
      "travel",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "estate-planning",
    "view": "tax",
    "title": "Wills, estates & power of attorney",
    "desc": "Probate tax, foreign assets, common-law intestacy risk and power of attorney",
    "icon": "📜",
    "keywords": [
      "will",
      "estate",
      "probate",
      "attorney",
      "poa",
      "cpoa",
      "intestacy",
      "inheritance",
      "foreign",
      "trustee",
      "executor",
      "slra",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "cra-vdp",
    "view": "tax",
    "title": "CRA voluntary disclosures & T1135 foreign property",
    "desc": "Penalty waiver (IC00-1R6), first-year newcomer exemption, General vs Limited track",
    "icon": "🛡️",
    "keywords": [
      "cra",
      "vdp",
      "voluntary",
      "disclosure",
      "t1135",
      "foreign",
      "property",
      "penalty",
      "rc199",
      "offshore",
      "amnesty",
      "tax",
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ],
    "category": "tax"
  },
  {
    "id": "small-claims",
    "view": "paycheck",
    "title": "Small claims court dispute & statutory demand",
    "desc": "Monetary limits, 2-year limitation deadlines, pre-judgment interest & demand letters",
    "icon": "🏛️",
    "keywords": [
      "small",
      "claims",
      "court",
      "demand",
      "letter",
      "dispute",
      "limitation",
      "interest",
      "contract",
      "invoice",
      "ontario",
      "bc",
      "crt",
      "alberta",
      "कानूनी नोटिस",
      "हक",
      "मांग पत्र",
      "मुआवजा",
      "अदालत"
    ],
    "category": "notices"
  },
  {
    "id": "statutory-pay",
    "view": "paycheck",
    "title": "Pay stub, vacation pay & statutory holiday auditor",
    "desc": "Ontario ESA overtime, 4%/6% vacation step-up, public holiday pay & wage theft",
    "icon": "💵",
    "keywords": [
      "pay",
      "stub",
      "wage",
      "vacation",
      "holiday",
      "overtime",
      "theft",
      "deduction",
      "esa",
      "ontario",
      "labour",
      "mlitsd",
      "payroll",
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ],
    "category": "labor"
  },
  {
    "id": "consumer-protection",
    "view": "banking",
    "title": "Consumer protection & cooling-off periods",
    "desc": "Ontario CPA 10-day cooling-off, door-to-door HVAC ban & unfair practices rescission",
    "icon": "🛡️",
    "keywords": [
      "consumer",
      "protection",
      "cpa",
      "cooling",
      "off",
      "cancellation",
      "door",
      "hvac",
      "water",
      "heater",
      "resi",
      "resi-notice",
      "rescission",
      "unfair",
      "banned",
      "कानूनी नोटिस",
      "हक",
      "मांग पत्र",
      "मुआवजा",
      "अदालत"
    ],
    "category": "notices"
  },
  {
    "id": "family-law",
    "view": "schools",
    "title": "Child & spousal support guidelines & family property",
    "desc": "CSG child support tables, SSAG spousal support & Ontario NFP property equalization",
    "icon": "👨‍👩‍👧‍👦",
    "keywords": [
      "family",
      "law",
      "child",
      "support",
      "spousal",
      "equalization",
      "nfp",
      "divorce",
      "separation",
      "custody",
      "undertaking",
      "sponsorship",
      "csg",
      "ssag",
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ],
    "category": "health"
  },
  {
    "id": "social-assistance",
    "view": "cashflow",
    "title": "Ontario Works & ODSP eligibility & clawback",
    "desc": "Asset limits ($10k OW / $40k ODSP), 50%/75% earnings clawback & sponsorship debt",
    "icon": "🤝",
    "keywords": [
      "ontario",
      "works",
      "ow",
      "odsp",
      "social",
      "assistance",
      "welfare",
      "disability",
      "clawback",
      "asset",
      "limit",
      "undertaking",
      "sponsorship",
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ],
    "category": "health"
  },
  {
    "id": "forms",
    "title": "Government Forms",
    "desc": "Pre-fill LTB T1/T2, CBSA E677 and CRA RC151, then review and print",
    "icon": "📑",
    "shortcut": "Ctrl+9",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "bsf186",
    "view": "forms",
    "title": "CBSA Form BSF186 (personal effects)",
    "desc": "List the belongings you bring now and the goods to follow",
    "icon": "📦",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "paycheck",
    "title": "Take-Home Pay",
    "desc": "Salary after tax and deductions, compared with rent",
    "icon": "💵",
    "shortcut": "Ctrl+10",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "severance",
    "view": "paycheck",
    "title": "Severance and EI estimate",
    "desc": "Notice, severance pay and Employment Insurance after a layoff",
    "icon": "🛡",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "worker-classification",
    "view": "paycheck",
    "title": "Contractor or employee?",
    "desc": "Check whether you may be owed overtime, vacation or holiday pay",
    "icon": "⚖️",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "vulnerable-worker",
    "view": "paycheck",
    "title": "Facing abuse at work?",
    "desc": "Check the Vulnerable Worker Open Work Permit and next steps",
    "icon": "🛡️",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "human-rights-defense",
    "view": "paycheck",
    "title": "Human rights & constructive dismissal",
    "desc": "Audit workplace harassment, Canadian experience bans, and Potter v. New Brunswick notice",
    "icon": "⚖️",
    "keywords": [
      "human",
      "rights",
      "harassment",
      "discrimination",
      "constructive",
      "dismissal",
      "potter",
      "reprisal",
      "ohrc",
      "hrto",
      "chra",
      "toxic",
      "कानूनी नोटिस",
      "हक",
      "मांग पत्र",
      "मुआवजा",
      "अदालत"
    ],
    "category": "notices"
  },
  {
    "id": "banking",
    "title": "Banking & Credit",
    "desc": "Your right to a bank account and how credit scores grow",
    "icon": "🏦",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "banking-comparator",
    "view": "banking",
    "title": "Compare newcomer bank packages",
    "desc": "Big five banks side by side, with a credit plan",
    "icon": "🏦",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "driving",
    "title": "Foreign Licence Exchange",
    "desc": "Licence exchange and driving-experience credit",
    "icon": "🚗",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "vehicle-import",
    "view": "driving",
    "title": "Importing a vehicle",
    "desc": "Whether your vehicle can enter Canada and the likely costs",
    "icon": "🚙",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "auto-insurance",
    "view": "driving",
    "title": "Auto insurance & foreign experience credit",
    "desc": "Postal code rating, Claims-Free Letter savings ($2,500-$4,500/yr), and SABS benefits",
    "icon": "🛡️",
    "keywords": [
      "insurance",
      "auto",
      "car",
      "vehicle",
      "fsra",
      "sabs",
      "postal",
      "brampton",
      "mississauga",
      "experience",
      "letter",
      "take-all-comers",
      "icbc",
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ],
    "category": "arrival"
  },
  {
    "id": "careers",
    "title": "CV Check & Professional Licensing",
    "desc": "Resume tips and credential recognition for regulated jobs",
    "icon": "💼",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "jd-matcher",
    "view": "careers",
    "title": "Compare your CV with a job posting",
    "desc": "Find skills the posting asks for that your CV does not mention",
    "icon": "🎯",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "credential-licensure",
    "view": "careers",
    "title": "Regulated profession licensing & FCR bridge",
    "desc": "Check licensing steps, Ontario Canadian experience ban (FARPACTA), and alternative careers",
    "icon": "🎓",
    "keywords": [
      "licensing",
      "fcr",
      "farpacta",
      "engineer",
      "peo",
      "nurse",
      "cno",
      "nnas",
      "doctor",
      "mcc",
      "pharmacist",
      "pebc",
      "cpa",
      "experience",
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ],
    "category": "labor"
  },
  {
    "id": "healthcare",
    "title": "Healthcare & Prescriptions",
    "desc": "Where to go for care and how to refill medicine",
    "icon": "🏥",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "health-elig",
    "view": "healthcare",
    "title": "When does health coverage start?",
    "desc": "Provincial waiting periods and private insurance until then",
    "icon": "🍁",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "medical-admissibility",
    "view": "healthcare",
    "title": "Immigration medical exam",
    "desc": "Whether a health condition could affect your application",
    "icon": "🩺",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "schools",
    "title": "Schools & Child Care",
    "desc": "Your child’s grade, school vaccines and child-care costs",
    "icon": "🎒",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "childcare",
    "view": "schools",
    "title": "Child-care costs and subsidies",
    "desc": "Estimate fees after the national fee reduction and local subsidies",
    "icon": "👶",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "student-compliance",
    "view": "schools",
    "title": "Student work-hour rules",
    "desc": "How many hours international students can work",
    "icon": "🎓",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "sos",
    "title": "Emergency Help",
    "desc": "Steps for a lockout, a stolen SIN or urgent care without insurance",
    "icon": "🚨",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "compare",
    "title": "City Comparison",
    "desc": "Rent, tax, health-coverage waits and transit in two cities",
    "icon": "🏙",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "languages",
    "title": "Guides in Your Language",
    "desc": "Key rights in French, Hindi, Punjabi, Chinese and Spanish",
    "icon": "🌐",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "coverage",
    "title": "Knowledge Coverage",
    "desc": "Which topics and cities have official sources",
    "icon": "▦",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "review",
    "title": "Editorial Review",
    "desc": "Where reviewers check sources before publishing",
    "icon": "◎",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "insider-maintained-status",
    "view": "ask",
    "query": "Can I travel outside Canada while on maintained status PGWP in Toronto?",
    "title": "Maintained Status Travel Trap (IRPR 186(u))",
    "desc": "Leaving Canada terminates implied work authorization",
    "icon": "🚨",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-remote-work",
    "view": "ask",
    "query": "Can I work remotely for a foreign employer on a visitor visa in Toronto?",
    "title": "Remote Work on Visitor Status (IRPA s.2)",
    "desc": "Foreign employer remote work rights without a work permit",
    "icon": "💻",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "insider-expired-pr-card",
    "view": "ask",
    "query": "Can I enter Canada at land border with expired PR card in private vehicle in Toronto?",
    "title": "Expired PR Card Land Border Entry (IRPA 19(2))",
    "desc": "Statutory right of entry via private vehicle",
    "icon": "🚗",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-flagpoling",
    "view": "ask",
    "query": "Can I flagpole at Rainbow Bridge for PGWP work permit at border in Toronto?",
    "title": "Border Flagpoling Restrictions & PGWP Ban",
    "desc": "June 2024 PGWP border ban & port quotas",
    "icon": "🚫",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "insider-family-bar",
    "view": "ask",
    "query": "What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in Toronto?",
    "title": "Unexamined Dependent Lifetime Bar (IRPR 117(9)(d))",
    "desc": "Permanent family class sponsorship exclusion",
    "icon": "⚠️",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "insider-shared-kitchen",
    "view": "ask",
    "query": "Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario in Toronto?",
    "title": "Shared Kitchen RTA Exemption (s.5(i))",
    "desc": "Boarder status with zero LTB jurisdiction",
    "icon": "🏠",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "insider-post-2018-rent",
    "view": "ask",
    "query": "How to verify rent control exemption for building first occupied after November 15 2018 in Toronto?",
    "title": "Post-2018 Rent Increase Exemption (RTA s.6.1)",
    "desc": "Burden of proof & MPAC verification",
    "icon": "📈",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "insider-tfsa-penalty",
    "view": "ask",
    "query": "What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in Toronto?",
    "title": "TFSA Non-Resident 1% Penalty Tax (ITA 207.02)",
    "desc": "CRA My Account portal bug & taxpayer relief",
    "icon": "💸",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-cost-base-stepup",
    "view": "ask",
    "query": "Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in Toronto?",
    "title": "Cost Base Step-Up at FMV on Landing (ITA 128.1)",
    "desc": "Eliminate pre-landing foreign capital gains tax",
    "icon": "📊",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-parental-gifts",
    "view": "ask",
    "query": "Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?",
    "title": "Overseas Parental Gift Wire & Deed of Gift",
    "desc": "PCMLTFA s.12 AML documentation & tax-free wire rules",
    "icon": "🎁",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-auto-insurance",
    "view": "ask",
    "query": "How to get auto insurance discount with foreign Claims-Free Letter of Experience in Ontario FSRA in Toronto?",
    "title": "FSRA Auto Insurance Claims-Free Experience Letter",
    "desc": "Save $2,500-$4,000/yr on Ontario auto insurance",
    "icon": "🚙",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "insider-cec-exclusion",
    "view": "ask",
    "query": "Does self-employed contract work count for Canadian Experience Class CEC section 87.1(3)(b) in Toronto?",
    "title": "Self-Employed CEC Express Entry Disqualification",
    "desc": "IRPR 87.1(3)(b) contractor hours exclusion",
    "icon": "💼",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-dual-intent",
    "view": "ask",
    "query": "Can I enter Canada on visitor visa if I have pending Express Entry PR dual intent in Toronto?",
    "title": "Dual Intent Statutory Protections (IRPA 22(2))",
    "desc": "Temporary entry while PR application is pending",
    "icon": "⚖️",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-device-search",
    "view": "ask",
    "query": "Can CBSA border officers search my digital device phone search passcode at airport in Toronto?",
    "title": "CBSA Digital Device & Phone Search Limits",
    "desc": "Customs Act 99(1)(a) inspection powers & cloud data limits",
    "icon": "📱",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "insider-lease-exit",
    "view": "ask",
    "query": "Can I terminate early with 30 days notice if landlord refuses lease assignment in Toronto?",
    "title": "Tenant 30-Day Early Lease Exit (Ontario RTA s.95)",
    "desc": "Break fixed-term lease legally upon assignment refusal",
    "icon": "🚪",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "insider-n12-timing",
    "view": "ask",
    "query": "Is N12 eviction notice void if landlord fails to pay one month compensation before termination date in Toronto?",
    "title": "N12 Landlord Compensation Deadline (RTA s.48.1)",
    "desc": "Eviction notice void if 1-month rent unpaid by deadline",
    "icon": "⏰",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "insider-t1135-exemption",
    "view": "ask",
    "query": "Do I need to report family home abroad on CRA form T1135 personal-use property in Toronto?",
    "title": "CRA Form T1135 Personal-Use Property Exemption",
    "desc": "Overseas family residence exempt under ITA 233.3",
    "icon": "🏡",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-driving-extract",
    "view": "ask",
    "query": "How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?",
    "title": "DriveTest Foreign Licence Experience Extract",
    "desc": "HTA Reg 340/94 credit to bypass G1 12-month wait",
    "icon": "🏎️",
    "category": "arrival",
    "keywords": [
      "हवाई अड्डा",
      "बॉर्डर",
      "कस्टम्स",
      "कैलेंडर",
      "ड्राइविंग",
      "आगमन"
    ]
  },
  {
    "id": "insider-us-h1b-severance",
    "view": "ask",
    "country": "United States",
    "query": "When does the 60-day grace period start after layoff severance for H-1B in the United States?",
    "title": "US: H-1B 60-Day Grace Period Severance Trap",
    "desc": "8 CFR 214.1(l)(2) clock starts day after employment ends",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-us-opt-capgap",
    "view": "ask",
    "country": "United States",
    "query": "How does F-1 OPT Cap-Gap work authorization extension work in the United States?",
    "title": "US: F-1 OPT to H-1B Cap-Gap Extension",
    "desc": "8 CFR 214.2(f)(5)(vi) automatic EAD bridge to Oct 1",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uk-ilr-absence",
    "view": "ask",
    "country": "United Kingdom",
    "query": "What is the 180-day continuous residence rolling absence limit for ILR in the UK?",
    "title": "UK: ILR 180-Day Rolling Absence Rule",
    "desc": "Appendix Continuous Residence rolling 12-month limit",
    "icon": "🇬🇧",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uk-section21-gas",
    "view": "ask",
    "country": "United Kingdom",
    "query": "Is Section 21 eviction notice void if landlord failed to provide Gas Safety Certificate in the UK?",
    "title": "UK: Section 21 Eviction Invalidation",
    "desc": "Deregulation Act 2015 s.33 Gas Safety & How to Rent rules",
    "icon": "🇬🇧",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-au-482-cessation",
    "view": "ask",
    "country": "Australia",
    "query": "How many days do subclass 482 visa holders have to find a new sponsor under condition 8607 in Australia?",
    "title": "AU: Subclass 482 180-Day Sponsor Transfer Window",
    "desc": "Condition 8607 July 2024 reform granting 180 days",
    "icon": "🇦🇺",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-au-medicare-levy",
    "view": "ask",
    "country": "Australia",
    "query": "How to claim Medicare Levy exemption with Medicare Entitlement Statement MES in Australia?",
    "title": "AU: Medicare Levy 2% Exemption & MES Statement",
    "desc": "Services Australia & ATO non-entitlement exemption",
    "icon": "🇦🇺",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-de-nebenkosten",
    "view": "ask",
    "country": "Germany",
    "query": "What is the landlord 12-month preclusion rule on annual utility bills Nebenkosten in Germany?",
    "title": "DE: Nebenkosten 12-Month Preclusion Rule",
    "desc": "BGB 556(3) strict cutoff precluding utility arrears",
    "icon": "🇩🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-de-rundfunkbeitrag",
    "view": "ask",
    "country": "Germany",
    "query": "Does each flatmate have to pay Rundfunkbeitrag TV tax or is it one fee per apartment in Germany?",
    "title": "DE: Rundfunkbeitrag Shared Flat Single Fee",
    "desc": "RBStV 2 fee charged per residence not per person",
    "icon": "🇩🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uae-gratuity-wps",
    "view": "ask",
    "country": "United Arab Emirates",
    "query": "Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?",
    "title": "UAE: Gratuity & Visa Fee Recovery Ban",
    "desc": "Federal Decree-Law 33/2021 Article 6 WPS deduction prohibition",
    "icon": "🇦🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uae-rera-eviction",
    "view": "ask",
    "country": "United Arab Emirates",
    "query": "Can my landlord evict me in Dubai with WhatsApp notice or do they need 12 months notary public notice under RERA?",
    "title": "UAE: RERA 12-Month Notary Eviction Notice",
    "desc": "Dubai Law 33/2008 formal notary requirement and Smart Rental Index",
    "icon": "🇦🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-ie-rpz-rent-cap",
    "view": "ask",
    "country": "Ireland",
    "query": "What is the maximum rent increase in a Rent Pressure Zone RPZ in Ireland?",
    "title": "IE: Rent Pressure Zone 2% Statutory Cap",
    "desc": "Residential Tenancies Act 2004 2% cap adheres to property",
    "icon": "🇮🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-ie-csep-stamp4",
    "view": "ask",
    "country": "Ireland",
    "query": "When can a Critical Skills Employment Permit CSEP holder transition to Stamp 4 in Ireland?",
    "title": "IE: CSEP 21-Month Stamp 4 Fast-Track",
    "desc": "ISD fast-track to unrestricted employment without sponsorship",
    "icon": "🇮🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-nz-aewv-redundancy",
    "view": "ask",
    "country": "New Zealand",
    "query": "How many days do I have after redundancy to find an accredited employer and apply for variation of conditions AEWV in New Zealand?",
    "title": "NZ: AEWV 90-Day Redundancy Protection",
    "desc": "INZ Instructions WK3 90-day variation of conditions cushion",
    "icon": "🇳🇿",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-nz-bond-lodgement",
    "view": "ask",
    "country": "New Zealand",
    "query": "Can a landlord hold bond in private account or must they lodge with Tenancy Services within 23 days in New Zealand?",
    "title": "NZ: 23-Day Tenancy Bond Lodgement Rule",
    "desc": "RTA 1986 s.23 mandatory MBIE lodgement and $1,500 damages",
    "icon": "🇳🇿",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-us-90day-rule",
    "view": "ask",
    "country": "United States",
    "query": "What is the 90-day rule for willful misrepresentation when filing adjustment of status or green card in the United States?",
    "title": "US: 90-Day Visa Misrepresentation Presumption",
    "desc": "9 FAM 302.9 and INA 212(a)(6)(C)(i) lifetime bar trap",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uk-tenant-fees",
    "view": "ask",
    "country": "United Kingdom",
    "query": "Can letting agents charge admin fees or holding deposit beyond limits under Tenant Fees Act in the UK?",
    "title": "UK: Tenant Fees Act Letting Fee Ban",
    "desc": "Tenant Fees Act 2019 prohibited payments and 1-week holding deposit",
    "icon": "🇬🇧",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-on-ohip-wait",
    "view": "ask",
    "query": "Is there still a three-month waiting period for OHIP health insurance coverage in Ontario?",
    "title": "Ontario: OHIP 3-Month Waiting Period Elimination",
    "desc": "Ontario removed the 3-month wait (Regulation 552); coverage starts once approved",
    "icon": "🏥",
    "category": "health",
    "keywords": [
      "स्वास्थ्य",
      "अस्पताल",
      "दवा",
      "डॉक्टर",
      "ओहिप",
      "स्कूल",
      "बच्चा",
      "परिवार"
    ]
  },
  {
    "id": "insider-ircc-cec-52weeks",
    "view": "ask",
    "query": "Can I qualify for Canadian Experience Class CEC in 6 months with 1560 hours or does it require 52 continuous weeks?",
    "title": "IRCC: Express Entry CEC 52-Week Work Cap Rule",
    "desc": "IRPR s.87.1(2)(a) 1,560 hours must span at least 52 continuous weeks",
    "icon": "💼",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-us-fica-opt",
    "view": "ask",
    "country": "United States",
    "query": "Are F-1 students on OPT exempt from Social Security and Medicare FICA taxes in the United States?",
    "title": "US: F-1 OPT FICA Tax Exemption (7.65%)",
    "desc": "IRC 3121(b)(19) 5-year non-resident FICA tax exemption",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-us-ead-540days",
    "view": "ask",
    "country": "United States",
    "query": "Does a timely filed I-765 renewal qualify for a 540-day automatic extension of EAD work authorization in the United States?",
    "title": "US: 540-Day Automatic EAD Renewal Extension",
    "desc": "8 CFR 274a.13(d) temporary final rule bridging work authorization",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-au-fairwork-88days",
    "view": "ask",
    "country": "Australia",
    "query": "What are the award wage and piece rate protections for Working Holiday 88 days regional work under Fair Work in Australia?",
    "title": "AU: Working Holiday 88-Day Farm Work Award Floor",
    "desc": "Fair Work Act 2009 & Horticulture Award piecework safety net",
    "icon": "🇦🇺",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-de-bgb-notice",
    "view": "ask",
    "country": "Germany",
    "query": "What is the statutory notice period for resignation or dismissal under BGB 622 during probation in Germany?",
    "title": "DE: Statutory Notice Periods & 2-Week Probation",
    "desc": "BGB 622 notice periods for resignation and employer dismissal",
    "icon": "🇩🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-ca-pnp-intent",
    "view": "ask",
    "query": "Can a provincial nominee PNP move to another province before landing or does IRPA require intent to reside in Toronto?",
    "title": "Canada: PNP Intent to Reside & Mobility Limits",
    "desc": "IRPA s.87(2) Charter s.6 mobility attaches only after landing",
    "icon": "🍁",
    "category": "immigration",
    "keywords": [
      "वीजा",
      "पीआर",
      "नागरिकता",
      "वर्क परमिट",
      "इमिग्रेशन",
      "स्टडी वीजा"
    ]
  },
  {
    "id": "insider-ca-fhsa",
    "view": "ask",
    "query": "Can a newcomer open a First Home Savings Account FHSA in their first year of arrival in Canada in Toronto?",
    "title": "Canada: CRA FHSA Newcomer Eligibility ($8,000)",
    "desc": "ITA s.146.6 immediate tax-deductible contribution in year 1",
    "icon": "🏡",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-on-esa-severance",
    "view": "ask",
    "query": "What is the difference between notice of termination and severance pay under Ontario ESA 2.5 million payroll in Toronto?",
    "title": "Ontario: ESA Notice vs Severance Pay ($2.5M)",
    "desc": "ESA ss. 54, 57, 64 notice up to 8 wks vs severance up to 26 wks",
    "icon": "⚖️",
    "category": "labor",
    "keywords": [
      "काम",
      "नौकरी",
      "वेतन",
      "अधिकार",
      "जॉब",
      "सैलरी",
      "लेबर"
    ]
  },
  {
    "id": "insider-us-i94-supremacy",
    "view": "ask",
    "country": "United States",
    "query": "Does electronic Form I-94 determine authorized stay and override passport visa foil expiration in the United States?",
    "title": "US: Electronic I-94 Governs Lawful Stay",
    "desc": "8 CFR 214.1(a)(3) electronic I-94 overrides visa foil expiration",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-us-dual-status",
    "view": "ask",
    "country": "United States",
    "query": "Can a married dual-status alien make a 6013(g) election to file married filing jointly in the United States?",
    "title": "US: Dual-Status Alien s.6013(g) Joint Election",
    "desc": "IRC 7701(b)(4) & 6013(g) married filing jointly full deduction",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uk-skilled-worker-salary",
    "view": "ask",
    "country": "United Kingdom",
    "query": "What is the grandfathered salary threshold for pre-April 2024 Skilled Worker visa holders in the United Kingdom?",
    "title": "UK: Skilled Worker £29k Grandfathered Salary",
    "desc": "Statement of Changes HC 590 transitional threshold protection",
    "icon": "🇬🇧",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-au-temporary-resident-cgt",
    "view": "ask",
    "country": "Australia",
    "query": "Are temporary residents exempt from capital gains tax CGT on foreign assets under Subdivision 768-R in Australia?",
    "title": "AU: Temporary Resident Foreign CGT Exemption",
    "desc": "ITAA 1997 Subdivision 768-R: temporary residents are generally exempt on foreign assets",
    "icon": "🇦🇺",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-de-chancenkarte-work",
    "view": "ask",
    "country": "Germany",
    "query": "Can Opportunity Card Chancenkarte holders work 20 hours per week or do trial work Probearbeit in Germany?",
    "title": "DE: Chancenkarte 20-Hour & Trial Work Rights",
    "desc": "AufenthG 20a secondary employment & Probearbeit rights",
    "icon": "🇩🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-cra-moving-expenses",
    "view": "ask",
    "query": "Can I deduct moving expenses on form T1-M if I moved 40 kilometres for work in Canada in Toronto?",
    "title": "Canada: CRA Moving Expense Relocation Deduction (40 km)",
    "desc": "ITA s.62 & Form T1-M moving expense deduction for employment/study",
    "icon": "📦",
    "category": "tax",
    "keywords": [
      "टैक्स",
      "बैंक",
      "खाता",
      "पैसा",
      "संपत्ति",
      "बचत",
      "टीएफएसए"
    ]
  },
  {
    "id": "insider-on-ohrc-no-credit",
    "view": "ask",
    "query": "Can a landlord refuse to rent to a newcomer because they have no Canadian credit history under the Human Rights Code in Toronto?",
    "title": "Ontario: OHRC Rental Ban on No-Credit Discrimination",
    "desc": "Code s.2(1) prohibition of rental refusal for lacking domestic credit",
    "icon": "🛡️",
    "category": "housing",
    "keywords": [
      "किराया",
      "मकान",
      "मकान मालिक",
      "रेंट",
      "किराएदार",
      "नोटिस"
    ]
  },
  {
    "id": "insider-us-245k-exemption",
    "view": "ask",
    "country": "United States",
    "query": "Can employment-based green card applicants forgive up to 180 days of unauthorized work under 245(k) in the United States?",
    "title": "US: USCIS 245(k) 180-Day Work Violation Exemption",
    "desc": "INA 245(k) statutory status violation forgiveness for EB green cards",
    "icon": "🇺🇸",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-uk-right-to-rent-lcs",
    "view": "ask",
    "country": "United Kingdom",
    "query": "Does a landlord have a 28-day statutory excuse via Landlord Checking Service during in-time visa extension Right to Rent in the United Kingdom?",
    "title": "UK: Right to Rent 28-Day Statutory Excuse & LCS",
    "desc": "Immigration Act 2014 Landlord Checking Service positive notice",
    "icon": "🇬🇧",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-au-rhca-medicare",
    "view": "ask",
    "country": "Australia",
    "query": "Can visitors from Reciprocal Health Care Agreement RHCA countries enroll in Medicare in Australia?",
    "title": "AU: Services Australia Reciprocal Medicare Enrolment",
    "desc": "Health Insurance Act 1973 reciprocal coverage & student exceptions",
    "icon": "🇦🇺",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-de-mietpreisbremse-vormiete",
    "view": "ask",
    "country": "Germany",
    "query": "Must a landlord disclose the previous rent Vormiete in writing under the Mietpreisbremse rent brake in Germany?",
    "title": "DE: Mietpreisbremse Mandatory Written Prior Rent Disclosure",
    "desc": "BGB 556g mandatory disclosure of Vormiete before lease signing",
    "icon": "🇩🇪",
    "category": "global",
    "keywords": [
      "विदेश",
      "ग्लोबल",
      "अमेरिका",
      "ब्रिटेन",
      "ऑस्ट्रेलिया",
      "जर्मनी",
      "दुबई"
    ]
  },
  {
    "id": "insider-calgary-suite",
    "view": "ask",
    "country": "Canada",
    "category": "housing",
    "query": "What are Calgary secondary suite amnesty egress window and NBC-AE fire separation requirements in Calgary?",
    "title": "Calgary: Secondary Suite Amnesty & Egress Window Rules",
    "desc": "NBC-AE 0.35 sq.m egress window & amnesty registry verification",
    "icon": "🏠",
    "keywords": [
      "calgary",
      "secondary suite",
      "basement",
      "amnesty",
      "egress",
      "window",
      "nbc-ae",
      "कैलगरी",
      "बेसमेंट",
      "किराया"
    ]
  }
,
  {
    "id": "cmd-c11-entrepreneur",
    "toolModal": "c11-entrepreneur",
    "category": "immigration",
    "title": "Federal C11 Entrepreneur & Self-Employed Work Permit Navigator",
    "desc": "Evaluate LMIA-exempt work permit eligibility for business owners under IRPR s. 205(a) Exemption Code C11",
    "icon": "💼",
    "keywords": [
      "c11",
      "entrepreneur",
      "self-employed",
      "work permit",
      "business owner",
      "significant benefit",
      "lmia exempt"
    ]
  },
  {
    "id": "cmd-alberta-maternity-parental",
    "toolModal": "alberta-maternity-parental",
    "category": "labor",
    "title": "Alberta Maternity & Parental Leave Navigator",
    "desc": "Evaluate 90-day qualification, 16 weeks maternity, 62 weeks parental, and job protection under Alberta ESC ss. 45-53.1",
    "icon": "👶",
    "keywords": [
      "maternity",
      "parental leave",
      "alberta",
      "job protection",
      "reinstatement",
      "esc",
      "employment standards"
    ]
  },
  {
    "id": "cmd-ontario-urgent-repairs-t6",
    "toolModal": "ontario-urgent-repairs-t6",
    "category": "housing",
    "title": "Ontario Urgent Repairs & Vital Services T6 Tenancy Navigator",
    "desc": "Audit heating standards (min 20°C O. Reg. 516/06), vital service shutoffs, and LTB Form T6 rent abatements under RTA ss. 20-31",
    "icon": "🔧",
    "keywords": [
      "urgent repairs",
      "heating",
      "vital services",
      "t6",
      "ltb",
      "maintenance",
      "ontario",
      "rent abatement"
    ]
  },
  {
    "id": "cmd-bc-illness-injury-leave",
    "toolModal": "bc-illness-injury-leave",
    "category": "labor",
    "title": "British Columbia Paid Illness & Injury Leave Navigator",
    "desc": "Audit 5 paid plus 3 unpaid statutory sick days, average day's pay formula, and anti-reprisal rights under BC ESA s. 49.1",
    "icon": "🏥",
    "keywords": [
      "sick leave",
      "illness",
      "injury",
      "paid sick days",
      "bc esa",
      "british columbia",
      "anti-reprisal"
    ]
  },
  {
    "id": "cmd-francophone-mobility-c16",
    "toolModal": "francophone-mobility-c16",
    "category": "immigration",
    "title": "Francophone Mobility Work Permit (C16) Expansion Navigator",
    "desc": "Evaluate LMIA exemption for French-speaking candidates (NCLC 5+ oral) across all TEER 0-5 occupations outside Quebec",
    "icon": "⚜️",
    "keywords": [
      "francophone mobility",
      "c16",
      "french",
      "lmia exempt",
      "teer",
      "nclc 5",
      "irpr 205"
    ]
  },
  {
    "id": "cmd-bowp-pr-aor",
    "toolModal": "bowp-pr-aor",
    "category": "immigration",
    "title": "Bridging Open Work Permit (BOWP) PR Acknowledgement of Receipt Navigator",
    "desc": "Audit BOWP eligibility, in-Canada status, work permit expiry within 120 days, and IRPR s. 10 completeness AOR under Exemption A75",
    "icon": "📄",
    "keywords": [
      "bowp",
      "bridging open work permit",
      "aor",
      "acknowledgement of receipt",
      "express entry",
      "pr application"
    ]
  },
  {
    "id": "cmd-ontario-rent-deposit-interest",
    "toolModal": "ontario-rent-deposit-interest",
    "category": "housing",
    "title": "Ontario Rent Deposit & Statutory Annual Interest Navigator",
    "desc": "Calculate annual statutory interest on last month rent deposits at guideline rate (2.5%) and offsets under Ontario RTA ss. 105-106",
    "icon": "💰",
    "keywords": [
      "rent deposit",
      "deposit interest",
      "last month rent",
      "ontario rta",
      "guideline interest",
      "top up offset"
    ]
  },
  {
    "id": "cmd-alberta-general-holiday-pay",
    "toolModal": "alberta-general-holiday-pay",
    "category": "labor",
    "title": "Alberta General Holiday Pay Navigator",
    "desc": "Calculate statutory holiday pay, regular vs non-regular workday rules, 30-day thresholds, and 1.5x premium pay under Alberta ESC ss. 25-33",
    "icon": "📅",
    "keywords": [
      "holiday pay",
      "statutory holiday",
      "alberta esc",
      "average daily wage",
      "general holiday",
      "overtime"
    ]
  },
  {
    "id": "cmd-bc-strata-depreciation-crf",
    "toolModal": "bc-strata-depreciation-crf",
    "category": "housing",
    "title": "British Columbia Strata Depreciation Report & CRF Reserve Navigator",
    "desc": "Audit mandatory 5-year depreciation reports (2024 loophole elimination for 5+ lots) and 10% operating budget CRF contributions",
    "icon": "🏢",
    "keywords": [
      "strata",
      "depreciation report",
      "crf",
      "contingency reserve fund",
      "bc strata property act",
      "form b"
    ]
  },
  {
    "id": "cmd-c12-professional-fta",
    "toolModal": "c12-professional-fta",
    "category": "immigration",
    "title": "Federal Free Trade Agreement (CUSMA / CETA / GATS) Professional Navigator",
    "desc": "Audit LMIA-exempt professional work permits under IRPR s. 204(a) for international trade agreements",
    "icon": "🌐",
    "keywords": [
      "fta",
      "cusma",
      "ceta",
      "gats",
      "professional",
      "lmia exempt",
      "service contract",
      "t23"
    ]
  },
  {
    "id": "cmd-ontario-employment-reprisal",
    "toolModal": "ontario-employment-reprisal",
    "category": "labor",
    "title": "Ontario Employment Standards Reprisal Complaint Navigator",
    "desc": "Audit unlawful penalties or terminations for asserting ESA rights, enforcing statutory reverse onus under Ontario ESA s. 74",
    "icon": "⚖️",
    "keywords": [
      "reprisal",
      "retaliation",
      "ontario esa",
      "reverse onus",
      "fired for asking",
      "ministry of labour"
    ]
  },
  {
    "id": "cmd-bc-security-deposit-double",
    "toolModal": "bc-security-deposit-double",
    "category": "housing",
    "title": "British Columbia Security Deposit Return & Double Penalty Navigator",
    "desc": "Audit mandatory 15-day return timeline from written forwarding address and automatic 2x doubling penalty under BC RTA s. 38(6)",
    "icon": "💵",
    "keywords": [
      "security deposit",
      "double penalty",
      "bc rta",
      "15 days",
      "forwarding address",
      "rtb"
    ]
  },
  {
    "id": "cmd-alberta-constructive-dismissal",
    "toolModal": "alberta-constructive-dismissal",
    "category": "labor",
    "title": "Alberta Constructive Dismissal Salary Cut Navigator",
    "desc": "Audit unilateral compensation reductions (10%+ cut), constructive dismissal repudiation, and statutory notice pay under Alberta ESC ss. 55-58",
    "icon": "📉",
    "keywords": [
      "constructive dismissal",
      "salary cut",
      "pay cut",
      "alberta esc",
      "unilateral reduction",
      "termination pay"
    ]
  },
  {
    "id": "cmd-start-up-visa-peer-review",
    "toolModal": "start-up-visa-peer-review",
    "category": "immigration",
    "title": "Federal Start-Up Visa (SUV) Peer Review & Due Diligence Navigator",
    "desc": "Audit 10% founder equity, 50% combined voting control, designated entity commitments, and IRPR s. 98.10 Peer Review triggers",
    "icon": "🚀",
    "keywords": [
      "start-up visa",
      "suv",
      "peer review",
      "angel",
      "venture capital",
      "incubator",
      "irpr 98"
    ]
  },
  {
    "id": "cmd-saskatchewan-security-deposit",
    "toolModal": "saskatchewan-security-deposit",
    "category": "housing",
    "title": "Saskatchewan Security Deposit Return & Forfeiture Navigator",
    "desc": "Audit 1-month deposit cap, mandatory 7-business-day refund/Form 13 deadline, and statutory claim forfeiture under Saskatchewan RTA ss. 13-15",
    "icon": "🌾",
    "keywords": [
      "saskatchewan",
      "security deposit",
      "7 days",
      "form 13",
      "forfeiture",
      "ort",
      "tenancy"
    ]
  },
  {
    "id": "cmd-ontario-illegal-entry-t2",
    "toolModal": "ontario-illegal-entry-t2",
    "category": "housing",
    "title": "Ontario Residential Tenancy Illegal Landlord Entry T2 Navigator",
    "desc": "Audit 24-hour written notice rules, 8am-8pm permissible entry window, and Form T2 rent abatement remedies under Ontario RTA ss. 25-27",
    "icon": "🚪",
    "keywords": [
      "illegal entry",
      "landlord entry",
      "24 hours notice",
      "t2",
      "ltb",
      "privacy",
      "quiet enjoyment"
    ]
  },
  {
    "id": "cmd-bc-overtime-banking",
    "toolModal": "bc-overtime-banking",
    "category": "labor",
    "title": "British Columbia Overtime Time Banking Navigator",
    "desc": "Audit overtime banking agreements (written employee request required), 1.5x/2x credit rates, and payout rights under BC ESA ss. 40, 42",
    "icon": "⏳",
    "keywords": [
      "overtime banking",
      "time off in lieu",
      "bc esa",
      "time bank",
      "overtime pay",
      "british columbia"
    ]
  },
  {
    "id": "cmd-alberta-periodic-tenancy-termination",
    "toolModal": "alberta-periodic-tenancy-termination",
    "category": "housing",
    "title": "Alberta Periodic Tenancy Termination Notice Navigator",
    "desc": "Audit notice periods (1 month tenant vs 3 months landlord), prescribed statutory grounds, and purchaser occupancy under Alberta RTA ss. 5-12",
    "icon": "📜",
    "keywords": [
      "periodic tenancy",
      "month to month",
      "notice to vacate",
      "alberta rta",
      "landlord occupancy",
      "rtdrs"
    ]
  },
  {
    "id": "cmd-super-visa-medical-insurance",
    "toolModal": "super-visa-medical-insurance",
    "category": "health",
    "title": "Federal Super Visa $100k Emergency Medical Insurance Navigator",
    "desc": "Audit 5-year stay per entry rules, mandatory $100,000 emergency medical insurance, and sponsor LICO income under IRPA s. 15(1)",
    "icon": "🏥",
    "keywords": [
      "super visa",
      "medical insurance",
      "100k insurance",
      "lico",
      "parents",
      "grandparents",
      "5 year stay"
    ]
  },
  {
    "id": "cmd-manitoba-holiday-pay",
    "toolModal": "manitoba-general-holiday-pay",
    "category": "labor",
    "title": "Manitoba General Statutory Holiday Pay Navigator",
    "desc": "Calculate statutory holiday pay (5% of gross wages in 4 weeks prior) and 1.5x holiday pay under Manitoba Employment Standards Code ss. 21-28",
    "icon": "🎉",
    "keywords": [
      "manitoba",
      "holiday pay",
      "statutory holiday",
      "louis riel day",
      "general holiday",
      "overtime"
    ]
  },
  {
    "id": "cmd-caregiver-pr-experience",
    "toolModal": "caregiver-pr-experience",
    "category": "immigration",
    "title": "Federal Caregiver PR Pathway 12-Month Experience Navigator",
    "desc": "Audit qualifying Canadian work experience (12-month revised standard for NOC 44100/44101), private household rules, and CLB 5 benchmarks",
    "icon": "🏡",
    "keywords": [
      "caregiver",
      "nanny",
      "home child care",
      "home support worker",
      "noc 44100",
      "noc 44101",
      "caregiver pr"
    ]
  },
  {
    "id": "cmd-ontario-public-holiday-pay",
    "toolModal": "ontario-public-holiday-pay",
    "category": "labor",
    "title": "Ontario Public Holiday Pay & Qualifying Shift Navigator",
    "desc": "Calculate public holiday pay ((wages + vacation) / 20), First and Last Qualifying Shift Rule, and 1.5x premium pay under Ontario ESA ss. 24-32",
    "icon": "🍁",
    "keywords": [
      "public holiday pay",
      "statutory holiday",
      "qualifying shift",
      "ontario esa",
      "stat holiday",
      "first and last"
    ]
  },
  {
    "id": "cmd-bc-dispute-resolution-urgency",
    "toolModal": "bc-dispute-resolution-urgency",
    "category": "housing",
    "title": "British Columbia Expedited Tenancy Dispute Resolution Navigator",
    "desc": "Audit qualifying grounds for RTB 12-to-14-day Expedited Hearings (lockouts, emergency repairs, imminent danger) vs standard 4-month queues",
    "icon": "⚡",
    "keywords": [
      "expedited hearing",
      "rtb",
      "emergency dispute",
      "lockout",
      "emergency repair",
      "bc rta",
      "urgent hearing"
    ]
  },
  {
    "id": "cmd-alberta-youth-employment",
    "toolModal": "alberta-youth-employment-rules",
    "category": "labor",
    "title": "Alberta Youth Employment Standards Navigator",
    "desc": "Audit age restrictions, light work rules for adolescents 13-14 (max 2h school day), adult supervision for 15-17 past 9pm under Alberta ESC ss. 65-67",
    "icon": "🎒",
    "keywords": [
      "youth employment",
      "adolescent work",
      "under 15",
      "alberta esc",
      "parental consent",
      "work permit youth"
    ]
  },
  {
    "id": "cmd-study-permit-off-campus-work",
    "toolModal": "study-permit-off-campus-work",
    "category": "immigration",
    "title": "Federal Study Permit 24h Off-Campus Work Limit Navigator",
    "desc": "Audit Fall 2024 permanent 24-hour weekly off-campus work limit during academic terms, scheduled break exemptions, and PGWP impact under IRPR s. 186(v)",
    "icon": "📚",
    "keywords": [
      "study permit",
      "24 hours",
      "off-campus work",
      "international student",
      "pgwp bar",
      "irpr 186v",
      "student work hours"
    ]
  }
];
