// public/tool-modal.js
// 1-Click Interactive Statutory Navigator Modal Overlay

(function () {
  // Print documents stored in closure, avoiding global window pollution.
  let latestPrintHtml = '';
  let latestFormPrintHtml = '';
  const PRINT_SOURCES = { tool: () => latestPrintHtml, form: () => latestFormPrintHtml };
  // The print HTML comes from the server; generators escape user fields, and this
  // strips scripts, event handlers and javascript: URLs again before rendering,
  // so a generator that forgets to escape cannot inject active content.
  function sanitizePrintHtml(value) {
    if (typeof value !== 'string') return '';
    return value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
      .replace(/<script\b[^>]*\/?\s*>/gi, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\b(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, '$1="#"');
  }
  document.addEventListener('click', e => {
    const button = e.target.closest?.('[data-print-latest]');
    const source = button && PRINT_SOURCES[button.dataset.printLatest];
    if (!source) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(sanitizePrintHtml(source()));
    w.document.close();
    w.print();
  });

  // Names the inputs this result was computed without (the API's assumedInputs).
  function showAssumptionNote(container, data) {
    if (!Array.isArray(data?.assumedInputs) || !data.assumedInputs.length) return;
    const note = document.createElement('div');
    note.className = 'assumption-note';
    note.setAttribute('role', 'note');
    const strong = document.createElement('strong');
    strong.textContent = 'Based partly on default values. ';
    note.append(strong, document.createTextNode(`${data.assumptionNotice || ''} Not provided: ${data.assumedInputs.join(', ')}.`));
    container.prepend(note);
  }

  const TOOL_FORMS = {
    'study-permit-cap-pal': {
      title: 'Study Permit Cap & Provincial Attestation Letter (PAL)',
      fields: [
        { id: 'studyLevel', label: 'Study Level', type: 'select', options: [
          { val: 'masters', text: 'Master’s Degree' },
          { val: 'doctoral', text: 'Doctoral / PhD' },
          { val: 'undergraduate_degree', text: 'Undergraduate University Degree' },
          { val: 'college_diploma', text: 'College Diploma (Subject to Field Alignment)' },
          { val: 'k12_primary_secondary', text: 'K-12 Primary / Secondary (PAL Exempt)' }
        ]},
        { id: 'province', label: 'Province', type: 'select', options: [
          { val: 'ON', text: 'Ontario (ON)' },
          { val: 'BC', text: 'British Columbia (BC)' },
          { val: 'AB', text: 'Alberta (AB)' }
        ]},
        { id: 'applicationDate', label: 'Application Date (blank uses assessment date)', type: 'date', default: '' },
        { id: 'isPublicDli', label: 'Public Designated Learning Institution?', type: 'select', options: [
          { val: '', text: 'Select if applying for a master’s or doctorate' },
          { val: 'true', text: 'Yes' }, { val: 'false', text: 'No' }
        ] },
        { id: 'tuition', label: 'First Year Tuition ($ CAD)', type: 'number', default: '' },
        { id: 'funds', label: 'Liquid Savings Available ($ CAD)', type: 'number', default: '' },
        { id: 'field', label: 'College Field of Study (if applicable)', type: 'select', options: [
          { val: 'stem_science_tech_eng_math', text: 'STEM (Science, Tech, Engineering, Math)' },
          { val: 'healthcare', text: 'Healthcare & Nursing' },
          { val: 'trades_construction', text: 'Skilled Trades & Construction' },
          { val: 'agriculture_agrifood', text: 'Agriculture & Agri-Food' },
          { val: 'business_general', text: 'Business / Arts (Restricted for College PGWP)' }
        ]}
      ]
    },
    'visitor-visa-financial-ties': {
      title: 'Visitor Visa Financial & Domestic Ties Evaluator (IRPA s. 179(b))',
      fields: [
        { id: 'days', label: 'Planned Stay Duration (Days)', type: 'number', default: '' },
        { id: 'funds', label: 'Liquid Savings ($ CAD)', type: 'number', default: '' },
        { id: 'income', label: 'Monthly Income ($ CAD)', type: 'number', default: '' },
        { id: 'tenure', label: 'Years at Current Employment', type: 'number', default: '' },
        { id: 'leaveLetter', label: 'Approved Leave Letter on Letterhead?', type: 'select', options: [
          { val: '', text: 'Select an answer' },
          { val: 'true', text: 'Yes (Confirmed with Return Date)' },
          { val: 'false', text: 'No (Pending or Unemployed)' }
        ]},
        { id: 'property', label: 'Own Immovable Property in Home Country?', type: 'select', options: [
          { val: '', text: 'Select an answer' },
          { val: 'true', text: 'Yes (Registered Title / Deed)' },
          { val: 'false', text: 'No' }
        ]},
        ...[
          ['familyHome', 'Immediate Family Remaining at Home?'],
          ['familyTraveling', 'All Immediate Family Traveling Together?'],
          ['g7Travel', 'Prior Compliant Travel to G7 Countries?'],
          ['refusal', 'Previous Visa Refusal?'],
          ['dualIntent', 'Permanent Residence Application Pending?']
        ].map(([id, label]) => ({ id, label, type: 'select', options: [
          { val: '', text: 'Select an answer' }, { val: 'true', text: 'Yes' }, { val: 'false', text: 'No' }
        ] }))
      ]
    },
    'lmia-readiness': {
      title: 'LMIA Exemption & Prevailing Wage Stream Auditor',
      fields: [
        { id: 'province', label: 'Target Province', type: 'select', options: [
          { val: 'ON', text: 'Ontario' },
          { val: 'BC', text: 'British Columbia' },
          { val: 'AB', text: 'Alberta' }
        ]},
        { id: 'wage', label: 'Offered Hourly Wage ($ CAD)', type: 'number', default: 35.00 },
        { id: 'isExempt', label: 'Claiming LMIA Exemption?', type: 'select', options: [
          { val: 'true', text: 'Yes (Francophone C16 / CUSMA / C10)' },
          { val: 'false', text: 'No (Standard ESDC LMIA)' }
        ]},
        { id: 'nclc', label: 'French Proficiency (NCLC Level)', type: 'number', default: 6 }
      ]
    },
    'sin-healthcare': {
      title: 'First 14-Day Government Enrollment Kit (SIN & Health Card)',
      fields: [
        { id: 'status', label: 'Status in Canada', type: 'select', options: [
          { val: 'work_permit', text: 'Work Permit Holder' },
          { val: 'pr_copr', text: 'Permanent Resident (COPR)' },
          { val: 'study_permit', text: 'International Student' },
          { val: 'visitor', text: 'Visitor / Tourist' }
        ]},
        { id: 'province', label: 'Province of Residence', type: 'select', options: [
          { val: 'ON', text: 'Ontario — check OHIP eligibility' },
          { val: 'BC', text: 'British Columbia (MSP 2-Month Wait)' },
          { val: 'AB', text: 'Alberta (Immediate AHCIP)' }
        ]}
      ]
    },
    'study-to-pr': {
      title: 'Study-to-PR Transition & PGWP Roadmap Optimizer',
      fields: [
        { id: 'studyLevel', label: 'Study Level', type: 'select', options: [
          { val: 'masters', text: 'Master’s Degree (3-Year PGWP + OINP/BC PNP)' },
          { val: 'doctoral', text: 'Doctoral / PhD (3-Year PGWP + Fast-Track)' },
          { val: 'bachelors_4yr', text: '4-Year Bachelor’s Degree' },
          { val: 'diploma_2yr', text: '2-Year College Diploma' },
          { val: 'certificate_1yr', text: '1-Year Certificate' }
        ]},
        { id: 'province', label: 'Target Province', type: 'select', options: [
          { val: 'ON', text: 'Ontario (OINP)' },
          { val: 'BC', text: 'British Columbia (BC PNP)' },
          { val: 'AB', text: 'Alberta (AAIP)' }
        ]},
        { id: 'fieldOfStudy', label: 'Field of Study', type: 'select', options: [
          { val: 'stem_tech', text: 'STEM & Computer Science' },
          { val: 'healthcare', text: 'Healthcare & Nursing' },
          { val: 'business', text: 'Business & Management' },
          { val: 'trades', text: 'Skilled Trades' }
        ]},
        { id: 'clb', label: 'Expected Language Score (CLB)', type: 'number', default: 9 },
        { id: 'teer', label: 'Target Job NOC TEER', type: 'select', options: [
          { val: '0', text: 'TEER 0 (Management)' },
          { val: '1', text: 'TEER 1 (Professional / Degree)' },
          { val: '2', text: 'TEER 2 (Technical / Diploma)' },
          { val: '3', text: 'TEER 3 (Intermediate / Apprenticeship)' }
        ]}
      ]
    },
    'gcms-analyzer': {
      title: 'GCMS Officer Notes & Refusal Remedies Analyzer',
      fields: [
        { id: 'type', label: 'Application Type', type: 'select', options: [
          { val: 'study_permit', text: 'Study Permit' },
          { val: 'visitor_visa', text: 'Visitor Visa / TRV' },
          { val: 'work_permit', text: 'Work Permit / LMIA' }
        ]},
        { id: 'days', label: 'Days Since Refusal Letter', type: 'number', default: 10 },
        { id: 'notes', label: 'Paste Officer Notes / Text Excerpt', type: 'text', default: 'I am not satisfied that applicant has sufficient funds or assets' }
      ]
    },
    'global-visa-matrix': {
      title: 'Multi-Country Global Relocation & Visa Status Navigator',
      fields: [
        { id: 'education', label: 'Highest Education Level', type: 'select', options: [
          { val: 'masters', text: 'Master’s Degree (M.S., M.A., MBA)' },
          { val: 'phd', text: 'Doctoral / PhD' },
          { val: 'bachelors', text: 'Bachelor’s 4-Year Degree' },
          { val: 'diploma', text: '2-Year College Diploma' }
        ]},
        { id: 'experience', label: 'Years of Skilled Experience', type: 'number', default: 4 },
        { id: 'field', label: 'Professional Discipline', type: 'select', options: [
          { val: 'stem', text: 'STEM & Software / Engineering' },
          { val: 'healthcare', text: 'Healthcare & Medicine' },
          { val: 'business', text: 'Finance & Business Management' },
          { val: 'trades', text: 'Skilled Trades' }
        ]},
        { id: 'jobOffer', label: 'Active Sponsoring Job Offer?', type: 'select', options: [
          { val: 'false', text: 'No Job Offer (Direct Skilled PR / Search Visas)' },
          { val: 'true', text: 'Yes, Employer Sponsoring' }
        ]},
        { id: 'age', label: 'Candidate Age', type: 'number', default: 28 }
      ]
    },
    'moving-tax-calc': {
      title: 'CRA Form T1-M Moving Expense Deduction & 40km Relocation Calculator',
      fields: [
        { id: 'oldToNewKm', label: 'Old Home to New Work Location (km)', type: 'number', default: 85 },
        { id: 'newToNewKm', label: 'New Home to New Work Location (km)', type: 'number', default: 15 },
        { id: 'movers', label: 'Moving & Furniture Storage Costs ($ CAD)', type: 'number', default: 3200 },
        { id: 'travelKm', label: 'Driving Distance Traveled (km)', type: 'number', default: 450 },
        { id: 'tempDays', label: 'Temporary Living Days (Max 15 days deductible)', type: 'number', default: 7 },
        { id: 'tempLodging', label: 'Temporary Hotel / Lodging Cost ($ CAD)', type: 'number', default: 1400 },
        { id: 'province', label: 'Relocation Province', type: 'select', options: [
          { val: 'ON', text: 'Ontario (ON)' },
          { val: 'BC', text: 'British Columbia (BC)' },
          { val: 'AB', text: 'Alberta (AB)' },
          { val: 'QC', text: 'Quebec (QC)' }
        ]}
      ]
    },
    'severance-bardal': {
      title: 'Common Law Severance Pay (Bardal Factors) vs ESA Floor Estimator',
      fields: [
        { id: 'age', label: 'Employee Age', type: 'number', default: 48 },
        { id: 'service', label: 'Years of Continuous Service', type: 'number', default: 7 },
        { id: 'salary', label: 'Annual Base Salary ($ CAD)', type: 'number', default: 95000 },
        { id: 'role', label: 'Employment Role Seniority', type: 'select', options: [
          { val: 'executive', text: 'Executive / Director (Highest Notice Multiplier)' },
          { val: 'management_professional', text: 'Management / Senior Professional' },
          { val: 'specialist_technical', text: 'Specialist / Software Engineer' },
          { val: 'clerical_administrative', text: 'Clerical / Administrative' },
          { val: 'general_labour', text: 'General Operations' }
        ]},
        { id: 'largePayroll', label: 'Employer Ontario Payroll >= $2.5 Million?', type: 'select', options: [
          { val: 'true', text: 'Yes (Qualifies for ESA Statutory Severance)' },
          { val: 'false', text: 'No (Notice Only Under ESA)' }
        ]},
        { id: 'jobMarket', label: 'Availability of Similar Jobs in Market', type: 'select', options: [
          { val: 'scarce', text: 'Scarce / Difficult Re-Employment Climate' },
          { val: 'moderate', text: 'Moderate / Normal Job Market' },
          { val: 'abundant', text: 'Abundant / High Hiring Demand' }
        ]}
      ]
    },
    'us-h1b-opt': {
      title: 'US H-1B 60-Day Grace Period & F-1 Cap-Gap Navigator',
      fields: [
        { id: 'status', label: 'Current US Visa Status', type: 'select', options: [
          { val: 'h1b', text: 'H-1B Specialty Occupation Worker' },
          { val: 'f1_opt', text: 'F-1 Post-Completion OPT' },
          { val: 'f1_stem_opt', text: 'F-1 24-Month STEM OPT' }
        ]},
        { id: 'lastWorked', label: 'Last Day of Active Work (YYYY-MM-DD)', type: 'text', default: '2026-10-15' },
        { id: 'i94', label: 'Current I-94 Admit Until Date (YYYY-MM-DD)', type: 'text', default: '2027-05-01' },
        { id: 'hasH1bCos', label: 'Timely Filed H-1B Change of Status Petition?', type: 'select', options: [
          { val: 'true', text: 'Yes, H-1B Filed Before Expiration (Cap-Gap Protected)' },
          { val: 'false', text: 'No / Pending Application' }
        ]}
      ]
    },
    'uk-skilled-worker': {
      title: 'UK Skilled Worker & ILR Absence',
      fields: [
        { id: 'salary', label: 'Annual Offered Salary (£ GBP)', type: 'number', default: 35000 },
        { id: 'soc', label: 'Occupation SOC Code', type: 'text', default: '2136' },
        { id: 'preApril2024', label: 'Held Skilled Worker Visa Prior to April 4, 2024?', type: 'select', options: [
          { val: 'true', text: 'Yes — assess transitional rules' },
          { val: 'false', text: 'No — assess current rules' }
        ]},
        { id: 'newEntrant', label: 'New Entrant (Under 26 or Recent UK Graduate)?', type: 'select', options: [
          { val: 'false', text: 'No' },
          { val: 'true', text: 'Yes (70% Discount / £30,960 Minimum Applies)' }
        ]},
        { id: 'absentDays', label: 'Max Days Absent in Any 12-Month Rolling Period', type: 'number', default: 85 }
      ]
    },
    'super-visa-lico': {
      title: 'Canada Super Visa & Parents/Grandparents Income (LICO + 30%)',
      fields: [
        { id: 'hostMembers', label: 'Host Family Members in Canada (Self, Spouse, Children)', type: 'number', default: 3 },
        { id: 'visitingMembers', label: 'Visiting Parents / Grandparents', type: 'number', default: 2 },
        { id: 'income', label: 'Combined Host Household Annual Income ($ CAD)', type: 'number', default: 82000 },
        { id: 'insurance', label: 'Valid Canadian Medical Insurance Policy?', type: 'select', options: [
          { val: 'true', text: 'Yes, Minimum $100k Emergency Coverage' },
          { val: 'false', text: 'No / Policy Not Yet Purchased' }
        ]},
        { id: 'appType', label: 'Application Track', type: 'select', options: [
          { val: 'super_visa', text: 'Super Visa (Up to 5 Years Stay Per Visit)' },
          { val: 'pgp_permanent', text: 'PGP Permanent Residence (3-Year NOA Review)' }
        ]}
      ]
    },
    'australia-reforms': {
      title: 'Australia Subclass 482 Condition 8607 (180 Days) & MES Exemption',
      fields: [
        { id: 'subclass', label: 'Visa Subclass', type: 'select', options: [
          { val: '482_tss', text: 'Subclass 482 Temporary Skill Shortage (TSS)' },
          { val: '494_regional', text: 'Subclass 494 Skilled Employer Sponsored' }
        ]},
        { id: 'ceasedDays', label: 'Days Elapsed Since Employment Ended', type: 'number', default: 45 },
        { id: 'income', label: 'Annual Taxable Income ($ AUD)', type: 'number', default: 95000 },
        { id: 'hasMes', label: 'Obtained Medicare Entitlement Statement (MES)?', type: 'select', options: [
          { val: 'true', text: 'Yes (Exempt from 2% Medicare Levy)' },
          { val: 'false', text: 'No / Not Yet Applied' }
        ]}
      ]
    },
    'germany-chancenkarte': {
      title: 'Germany Chancenkarte (Opportunity Card) & Nebenkosten 12-Month Rule',
      fields: [
        { id: 'points', label: 'Chancenkarte Points Tally (Pass Mark: 6)', type: 'number', default: 6 },
        { id: 'language', label: 'German Language Proficiency', type: 'select', options: [
          { val: 'A2', text: 'A2 Basic (1 Point)' },
          { val: 'B1', text: 'B1 Intermediate (2 Points)' },
          { val: 'B2', text: 'B2 Advanced (3 Points)' },
          { val: 'None', text: 'None / English Only (0 Points)' }
        ]},
        { id: 'hours', label: 'Proposed Part-Time Work Hours/Week (Max 20h)', type: 'number', default: 20 },
        { id: 'nebenkostenMonths', label: 'Months Landlord Took to Bill Utility Arrears', type: 'number', default: 14 },
        { id: 'arrears', label: 'Utility Arrears Demanded by Landlord (€ EUR)', type: 'number', default: 750 }
      ]
    },
    'cra-newcomer-wealth': {
      title: 'CRA Newcomer Wealth: FHSA $8k, HBP $60k, TFSA & Foreign Property Step-Up',
      fields: [
        { id: 'fhsa', label: 'Planned FHSA Contribution ($ CAD, Max $8k/yr)', type: 'number', default: 8000 },
        { id: 'hbp', label: 'Requested HBP RRSP Withdrawal ($ CAD, Max $60k)', type: 'number', default: 60000 },
        { id: 'foreignFmv', label: 'Foreign Property Fair Market Value on Landing ($ CAD)', type: 'number', default: 350000 },
        { id: 'gift', label: 'Overseas Parental Gift / Wire Amount ($ CAD)', type: 'number', default: 60000 }
      ]
    },
    'ontario-bc-tenancy': {
      title: 'Ontario & BC Tenancy Defense: 2.5% Guideline, N12 Deadline & Bad Faith',
      fields: [
        { id: 'province', label: 'Jurisdiction', type: 'select', options: [
          { val: 'ON', text: 'Ontario (LTB - RTA 2006)' },
          { val: 'BC', text: 'British Columbia (RTB - RTA 2002)' }
        ]},
        { id: 'action', label: 'Audit Type', type: 'select', options: [
          { val: 'rent_increase', text: 'Rent Increase Lawfulness (2.5% vs Post-2018 Exemption)' },
          { val: 'shared_facility', text: 'Shared Kitchen/Bath LTB Jurisdiction Test (s. 5(i))' },
          { val: 'n12_audit', text: 'Form N12 Landlord Use Compensation Deadline (s. 48.1)' },
          { val: 't1_refund', text: 'Form T1 Illegal Rent & Unlawful Fee 1-Year Limitation' },
          { val: 'landlord_use', text: 'BC 12-Month Bad Faith Landlord Use Penalty (s. 51)' }
        ]},
        { id: 'currentRent', label: 'Current Lawful Monthly Rent ($ CAD)', type: 'number', default: 2200 },
        { id: 'proposedRent', label: 'Proposed New Rent ($ CAD)', type: 'number', default: 2400 }
      ]
    },
    'australia-tenancy': {
      title: 'Australia Subnational Tenancy: NSW NCAT, VIC VCAT, QLD QCAT & WA DMIRS',
      fields: [
        { id: 'state', label: 'State / Territory', type: 'select', options: [
          { val: 'NSW', text: 'New South Wales (NCAT - RTA 2010)' },
          { val: 'VIC', text: 'Victoria (VCAT - RTA 1997)' },
          { val: 'QLD', text: 'Queensland (QCAT - RTRAA 2008)' },
          { val: 'WA', text: 'Western Australia (DMIRS - RTA 1987)' }
        ]},
        { id: 'weeklyRent', label: 'Weekly Rent ($ AUD)', type: 'number', default: 650 },
        { id: 'bondPaid', label: 'Bond Paid to Landlord ($ AUD)', type: 'number', default: 2600 },
        { id: 'rentIncreasePercent', label: 'Proposed Rent Increase (%)', type: 'number', default: 0 },
        { id: 'monthsSinceLastIncrease', label: 'Months Since Last Rent Increase (Min: 12)', type: 'number', default: 12 },
        { id: 'noticeGivenDays', label: 'Written Notice Provided (Days, Min: 60)', type: 'number', default: 60 }
      ]
    },
    'us-state-tenancy': {
      title: 'US State Tenancy Defense: CA AB 1482, NY HSTPA, TX Ch 92 & FL Ch 83',
      fields: [
        { id: 'state', label: 'State Jurisdiction', type: 'select', options: [
          { val: 'CA', text: 'California (AB 1482 & AB 12 1-Mo Deposit Cap)' },
          { val: 'NY', text: 'New York (HSTPA 2019 14-Day Deposit Return)' },
          { val: 'TX', text: 'Texas (Property Code Ch 92 7-Day Repair Duty)' },
          { val: 'FL', text: 'Florida (Statutes Ch 83 15/30-Day Claims)' }
        ]},
        { id: 'monthlyRent', label: 'Monthly Rent ($ USD)', type: 'number', default: 2500 },
        { id: 'securityDeposit', label: 'Security Deposit Paid ($ USD)', type: 'number', default: 2500 },
        { id: 'rentIncreasePercent', label: 'Proposed Rent Increase (%)', type: 'number', default: 0 },
        { id: 'tenancyMonths', label: 'Tenancy Tenure (Months)', type: 'number', default: 14 },
        { id: 'daysSinceMoveOut', label: 'Days Elapsed Since Move-Out', type: 'number', default: 0 }
      ]
    },
    'uk-devolved-tenancy': {
      title: 'UK Devolved Nations Tenancy: Scotland PRT, Wales 6-Mo Notice & NI Protection',
      fields: [
        { id: 'nation', label: 'Devolved Nation', type: 'select', options: [
          { val: 'Scotland', text: 'Scotland (PRT - Housing Act 2016, No s.21)' },
          { val: 'Wales', text: 'Wales (Standard Occupation Contract, 6-Mo Notice)' },
          { val: 'Northern Ireland', text: 'Northern Ireland (Private Tenancies Order)' }
        ]},
        { id: 'monthlyRent', label: 'Monthly Rent (£ GBP)', type: 'number', default: 1000 },
        { id: 'depositPaid', label: 'Tenancy Deposit Paid (£ GBP)', type: 'number', default: 1000 },
        { id: 'tenureMonths', label: 'Tenancy Tenure (Months)', type: 'number', default: 12 },
        { id: 'noticeGivenDays', label: 'Notice Provided by Landlord (Days)', type: 'number', default: 28 },
        { id: 'evictionGround', label: 'Eviction Ground Stated by Landlord', type: 'select', options: [
          { val: 'landlord_intends_to_sell', text: 'Landlord Intends to Sell' },
          { val: 'landlord_intends_to_live', text: 'Landlord or Family Member Moving In' },
          { val: 'rent_arrears', text: 'Rent Arrears (3+ consecutive months)' },
          { val: 'no_fault_s21', text: 'No-Fault Eviction Notice (Section 21 equivalent)' }
        ]}
      ]
    },
    'uae-tenancy-dispute': {
      title: 'UAE Tenancy Dispute: Dubai RERA Decree 43 vs Abu Dhabi Tawtheeq 5% Cap',
      fields: [
        { id: 'emirate', label: 'Emirate Jurisdiction', type: 'select', options: [
          { val: 'Dubai', text: 'Dubai (RERA Decree No. 43 of 2013 & Ejari)' },
          { val: 'Abu Dhabi', text: 'Abu Dhabi (Tawtheeq & 5% Rent Cap)' }
        ]},
        { id: 'currentRent', label: 'Current Lawful Annual Rent (AED)', type: 'number', default: 80000 },
        { id: 'marketRent', label: 'Official RERA / Market Average Rent (AED)', type: 'number', default: 100000 },
        { id: 'proposedRent', label: 'Proposed New Annual Rent (AED)', type: 'number', default: 88000 },
        { id: 'noticeDays', label: 'Days Notice Prior to Lease Renewal (Min: 90 / 60)', type: 'number', default: 90 },
        { id: 'evictionNotice', label: 'Eviction Notice Served?', type: 'select', options: [
          { val: 'false', text: 'No Eviction Notice Served' },
          { val: 'true', text: 'Yes, Eviction Notice Served for Personal Use/Sale' }
        ]},
        { id: 'notaryServed', label: 'Eviction Service Method', type: 'select', options: [
          { val: 'true', text: 'Formal Service via Notary Public / Registered Post' },
          { val: 'false', text: 'Informal Service (Email / WhatsApp / Verbal)' }
        ]}
      ]
    },
    'global-expat': {
      title: 'Global Expat: UAE Gratuity, Dubai RERA, NZ Cushion & Singapore COMPASS',
      fields: [
        { id: 'country', label: 'Destination Jurisdiction', type: 'select', options: [
          { val: 'uae', text: 'UAE: Gratuity & Visa Fee Deduction Protection (Art. 6)' },
          { val: 'dubai', text: 'Dubai: RERA 12-Month Notary Eviction Rule' },
          { val: 'nz', text: 'New Zealand: AEWV 90-Day Cushion & Tenancy Bond Lodgement' },
          { val: 'ireland', text: 'Ireland: CSEP Stamp 4 Fast-Track & RPZ 2% Rent Cap' },
          { val: 'singapore', text: 'Singapore: Employment Pass COMPASS (40-Point Pass Mark)' }
        ]},
        { id: 'salary', label: 'Monthly Basic Salary (Local Currency AED/EUR/NZD)', type: 'number', default: 15000 },
        { id: 'years', label: 'Years of Continuous Service / Employment', type: 'number', default: 3.5 },
        { id: 'deductions', label: 'Employer Attempted Deductions (e.g. Visa Fees)', type: 'number', default: 0 }
      ]
    },
    'canada-status-admissibility': {
      title: 'Canada Status & Admissibility: Restoration (90 Days), Flagpoling Ban & Rehab',
      fields: [
        { id: 'category', label: 'Admissibility Matter', type: 'select', options: [
          { val: 'restoration', text: 'IRPR s. 182: Restoration of Status (90-Day Clock)' },
          { val: 'flagpoling', text: 'CBSA Border Flagpoling & June 2024 PGWP Border Ban' },
          { val: 'dli_leave', text: 'IRPR s. 220.1: DLI Authorized Leave Limit (150 Days)' },
          { val: 'criminal_inadmissibility', text: 'IRPA s. 36: Deemed Rehabilitation (10 Yrs) vs TRP' }
        ]},
        { id: 'days', label: 'Days Elapsed (Since Status Expiry or Leave Duration)', type: 'number', default: 45 },
        { id: 'permit', label: 'Permit Type (If Flagpoling)', type: 'select', options: [
          { val: 'pgwp', text: 'Post-Graduation Work Permit (PGWP)' },
          { val: 'work_permit_lmia_exempt', text: 'LMIA-Exempt Work Permit' },
          { val: 'visitor_record', text: 'Visitor Record' }
        ]},
        { id: 'port', label: 'Border Port of Entry', type: 'select', options: [
          { val: 'peace_bridge', text: 'Peace Bridge (Fort Erie, ON)' },
          { val: 'rainbow_bridge', text: 'Rainbow Bridge (Niagara Falls, ON)' },
          { val: 'queenston_lewiston', text: 'Queenston-Lewiston Bridge (ON)' }
        ]}
      ]
    },
    'pr-matrix': {
      title: 'Multi-Country Comparative PR Matrix Simulator',
      endpoint: '/v1/tools/pr-matrix',
      fields: [
        { id: 'education', label: 'Highest Completed Degree', type: 'select', options: [
          { val: 'masters', text: 'Master’s Degree (M.S., M.A., MBA)' },
          { val: 'phd', text: 'Doctoral / PhD' },
          { val: 'bachelors', text: 'Bachelor’s 4-Year Degree' },
          { val: 'diploma', text: '2-Year Post-Secondary Diploma' }
        ]},
        { id: 'age', label: 'Candidate Age', type: 'number', default: 29 },
        { id: 'experience', label: 'Years of Skilled Work Experience', type: 'number', default: 3 },
        { id: 'clb', label: 'English Benchmark (CLB / IELTS Equivalent)', type: 'number', default: 8 },
        { id: 'jobOffer', label: 'Do you have a sponsoring job offer?', type: 'select', options: [
          { val: 'false', text: 'No (Independent Points Assessment)' },
          { val: 'true', text: 'Yes (Employer Sponsored)' }
        ]},
        { id: 'secondaryLang', label: 'Secondary Language (French NCLC 7 / German B1)?', type: 'select', options: [
          { val: 'false', text: 'No (Single Official Language)' },
          { val: 'true', text: 'Yes (Bilingual Bonus Points)' }
        ]}
      ]
    },
    'family-reunification': {
      title: 'Spousal SOWP & Family Reunification Navigator',
      endpoint: '/v1/tools/family-reunification',
      fields: [
        { id: 'category', label: 'Reunification Pathway', type: 'select', options: [
          { val: 'spousal_open_work_permit', text: 'Spousal Open Work Permit (SOWP - Canada)' },
          { val: 'parents_grandparents_super_visa', text: 'Parents Super Visa (5-Year Multi-Entry)' },
          { val: 'dependent_child', text: 'Dependent Child (Age 22 Lock-in Rule)' },
          { val: 'australia_partner_820_801', text: 'Australia Subclass 820/801 Partner Visa' }
        ]},
        { id: 'sponsorStatus', label: 'Sponsor Status in Destination Country', type: 'select', options: [
          { val: 'study_permit', text: 'International Student' },
          { val: 'work_permit_teer_0_1', text: 'Work Permit Holder (TEER 0 or 1)' },
          { val: 'work_permit_teer_2_3', text: 'Work Permit Holder (TEER 2 or 3)' },
          { val: 'pr_citizen', text: 'Permanent Resident / Citizen' }
        ]},
        { id: 'programType', label: 'Student Degree Type (if Sponsor is Student)', type: 'select', options: [
          { val: 'masters', text: 'Master’s Degree (Eligible for SOWP)' },
          { val: 'doctoral', text: 'Doctoral / PhD (Eligible for SOWP)' },
          { val: 'undergraduate', text: 'Undergraduate Bachelor (Restricted SOWP)' },
          { val: 'college_diploma', text: 'College Diploma (Barred from SOWP)' }
        ]}
      ]
    },
    'tax-shield': {
      title: 'Newcomer Tax Shield & Wealth Builder (FHSA, TFSA, CCB)',
      endpoint: '/v1/tools/tax-shield',
      fields: [
        { id: 'income', label: 'Annual Employment Income ($ CAD)', type: 'number', default: 75000 },
        { id: 'province', label: 'Province of Tax Residence', type: 'select', options: [
          { val: 'ON', text: 'Ontario (ON)' },
          { val: 'BC', text: 'British Columbia (BC)' },
          { val: 'AB', text: 'Alberta (AB)' },
          { val: 'QC', text: 'Quebec (QC)' }
        ]}
      ]
    },
    'calendar-sync': {
      title: 'Statutory Timeline & RFC 5545 iCalendar Sync Engine',
      endpoint: '/v1/tools/calendar-sync',
      fields: [
        { id: 'milestone', label: 'Milestone to Track', type: 'select', options: [
          { val: 'work_permit_expiry', text: 'Work Permit Expiry (90-Day Restoration Alert)' },
          { val: 'study_permit_expiry', text: 'Study Permit Expiry & PGWP 180-Day Window' },
          { val: 'arrival_settlement', text: 'Arrival First-90-Days Milestones & Tax Date' },
          { val: 'citizenship_landing', text: 'Citizenship 1,095 Physical Presence Tracking' }
        ]},
        { id: 'date', label: 'Key Expiry or Arrival Date (YYYY-MM-DD)', type: 'text', default: '2026-12-31' },
        { id: 'name', label: 'Applicant / Newcomer Name', type: 'text', default: 'Newcomer' }
      ]
    },
    'legal-notices': {
      title: 'Statutory Legal Notice & Document Generator',
      endpoint: '/v1/tools/legal-notices',
      fields: [
        { id: 'type', label: 'Formal Legal Notice Type', type: 'select', options: [
          { val: 'ontario_ltb_t2', text: 'Ontario LTB Form T2 (Illegal Lockout, Harassment, Vital Services)' },
          { val: 'ontario_ltb_t6', text: 'Ontario LTB Form T6 (Urgent Repair Demand & Maintenance Hazard)' },
          { val: 'workplace_safety_refusal', text: 'Workplace Safety Refusal Notice (OHSA s. 43 Stage 1 Refusal)' },
          { val: 'esa_unpaid_wages', text: 'Employment Standards Formal Wage Demand (ESA s. 13)' },
          { val: 'security_deposit_return', text: 'Security Deposit Return Demand (Alberta RTA / UK TDP)' },
          { val: 'ircc_dual_intent_loe', text: 'IRCC Dual Intent Letter of Explanation (IRPA s. 22(2))' }
        ]},
        { id: 'sender', label: 'Sender Name (Tenant / Worker / Applicant)', type: 'text', default: 'Jane Doe' },
        { id: 'recipient', label: 'Recipient Name (Landlord / Employer)', type: 'text', default: 'Property Manager' },
        { id: 'amount', label: 'Claim Amount ($ CAD if applicable)', type: 'number', default: 0 },
        { id: 'issues', label: 'Key Violations / Details (separated by semicolon)', type: 'text', default: 'Unlawful entry without 24 hours written notice; vital services disruption' }
      ]
    },
    'poe-rights': {
      title: 'Airport & Border Port-of-Entry Rights Navigator',
      endpoint: '/v1/tools/poe-rights',
      fields: [
        { id: 'country', label: 'Destination Border Agency', type: 'select', options: [
          { val: 'CA', text: 'Canada (Canada Border Services Agency - CBSA)' },
          { val: 'US', text: 'United States (U.S. Customs and Border Protection - CBP)' },
          { val: 'UK', text: 'United Kingdom (UK Border Force)' },
          { val: 'AU', text: 'Australia (Australian Border Force - ABF)' }
        ]},
        { id: 'status', label: 'Immigration Status Category', type: 'select', options: [
          { val: 'work_permit', text: 'Work Permit Holder' },
          { val: 'study_permit', text: 'International Student' },
          { val: 'visitor', text: 'Visitor / Family' },
          { val: 'permanent_resident', text: 'Permanent Resident / Immigrant' }
        ]},
        { id: 'secondary', label: 'Currently in Secondary Inspection?', type: 'select', options: [
          { val: 'false', text: 'No (Standard Primary Inspection Prep)' },
          { val: 'true', text: 'Yes (Undergoing Secondary Examination)' }
        ]},
        { id: 'deviceSearch', label: 'Concerned about Mobile Phone / Laptop Search?', type: 'select', options: [
          { val: 'true', text: 'Yes (Digital Privacy & Cloud Search Rules)' },
          { val: 'false', text: 'No' }
        ]},
        { id: 'refusalRisk', label: 'Facing Threat of Entry Refusal or Removal?', type: 'select', options: [
          { val: 'true', text: 'Yes (Evaluate Voluntary Withdrawal vs Exclusion Order)' },
          { val: 'false', text: 'No' }
        ]}
      ]
    },
    'esa-wage-theft': {
      title: 'Ontario ESA Wage Theft, Overtime (44h), Vacation & Misclassification',
      endpoint: '/v1/tools/esa-wage-theft',
      fields: [
        { id: 'action', label: 'Statutory Standard Audit', type: 'select', options: [
          { val: 'overtime', text: 'Overtime Pay Audit (44 Hours / 1.5x Rate)' },
          { val: 'vacation', text: 'Vacation Pay Step-Up (4% to 6% at 5 Years)' },
          { val: 'holiday', text: 'Public Holiday Pay (Prior 4 Weeks / 20)' },
          { val: 'severance', text: 'Statutory Severance Pay ($2.5M Payroll / 5+ Yrs)' },
          { val: 'misclassification', text: 'Contractor Misclassification (Sagaz 5-Factor)' },
          { val: 'equal_pay', text: 'Equal Pay for Equal Work (Agency vs Direct)' }
        ]},
        { id: 'rate', label: 'Hourly Wage Rate ($ CAD)', type: 'number', default: 25.00 },
        { id: 'hours', label: 'Weekly Hours Worked (for Overtime)', type: 'number', default: 52 },
        { id: 'earnings', label: 'Gross Annual Earnings ($ CAD for Vacation)', type: 'number', default: 60000 },
        { id: 'years', label: 'Years of Continuous Service', type: 'number', default: 5.5 },
        { id: 'wages', label: 'Gross Wages in Prior 4 Weeks ($ CAD for Holiday)', type: 'number', default: 3600 },
        { id: 'payroll', label: 'Employer Ontario Payroll ($ CAD for Severance)', type: 'number', default: 3000000 }
      ]
    },
    'workplace-rights': {
      title: 'Workplace Rights: Constructive Dismissal, Canadian Experience Ban & WSIB',
      endpoint: '/v1/tools/workplace-rights',
      fields: [
        { id: 'action', label: 'Rights Violation Matter', type: 'select', options: [
          { val: 'constructive_dismissal', text: 'Constructive Dismissal Audit (Potter v NB Legal Aid)' },
          { val: 'canadian_experience', text: 'Canadian Experience Barrier Ban (OHRC & FARPACTA)' },
          { val: 'work_refusal', text: 'OHSA Unsafe Work Refusal & Anti-Reprisal (s. 43/50)' },
          { val: 'wsib_deadline', text: 'WSIB Injury Claim 6-Month Statutory Window (WSIA s. 22)' }
        ]},
        { id: 'wageCut', label: 'Unilateral Wage Reduction Percentage (%)', type: 'number', default: 15 },
        { id: 'type', label: 'Canadian Experience Context', type: 'select', options: [
          { val: 'employment_hiring', text: 'General Job Hiring / Interview Screening (OHRC)' },
          { val: 'professional_licensure', text: 'Regulated Profession Licensure (FARPACTA s. 10.2)' }
        ]},
        { id: 'profession', label: 'Regulated Profession (e.g. Engineers PEO, CPA)', type: 'text', default: 'Professional Engineers Ontario' },
        { id: 'reported', label: 'Hazard Reported to Supervisor?', type: 'select', options: [
          { val: 'true', text: 'Yes (Formal Notice Given)' },
          { val: 'false', text: 'No' }
        ]},
        { id: 'disciplined', label: 'Employer Threatened or Disciplined Worker?', type: 'select', options: [
          { val: 'false', text: 'No' },
          { val: 'true', text: 'Yes (Unlawful Reprisal Threat)' }
        ]},
        { id: 'accidentDate', label: 'Date of Workplace Injury (YYYY-MM-DD)', type: 'text', default: '2026-06-01' }
      ]
    },
    'ei-benefits': {
      title: 'Employment Insurance (EI): Regular, Sickness, Parental & QPIP',
      endpoint: '/v1/tools/ei-benefits',
      fields: [
        { id: 'action', label: 'EI Benefit Stream', type: 'select', options: [
          { val: 'regular', text: 'EI Regular Benefits (420-700 Hours Grid & $668/wk)' },
          { val: 'just_cause', text: 'Voluntary Quit Just Cause Defense (EI Act s. 29(c))' },
          { val: 'sickness', text: 'EI Sickness Benefits (26-Week Maximum)' },
          { val: 'parental', text: 'Maternity & Parental (Standard 55% vs Extended 33%)' },
          { val: 'qpip', text: 'Quebec QPIP Dedicated 5-Week Paternity Leave' }
        ]},
        { id: 'hours', label: 'Insurable Hours Accrued in Past 52 Weeks', type: 'number', default: 650 },
        { id: 'rate', label: 'Regional Unemployment Rate (%)', type: 'number', default: 7.5 },
        { id: 'earnings', label: 'Average Weekly Insurable Earnings ($ CAD)', type: 'number', default: 1200 },
        { id: 'reason', label: 'Voluntary Separation Reason (if applicable)', type: 'select', options: [
          { val: 'spouse_relocation', text: 'Spouse Relocation for Employment' },
          { val: 'harassment', text: 'Workplace Sexual or Personal Harassment' },
          { val: 'wage_cut', text: 'Major Unilateral Wage Reduction' },
          { val: 'unsafe_conditions', text: 'Dangerous or Unsafe Working Conditions' },
          { val: 'discrimination', text: 'Human Rights Discrimination' }
        ]}
      ]
    },
    'fcr-bridging': {
      title: 'Foreign Credential Recognition (FCR) & Healthcare Bridging Directory',
      endpoint: '/v1/tools/fcr-bridging',
      fields: [
        { id: 'action', label: 'Bridging Pathway', type: 'select', options: [
          { val: 'micro_loans', text: 'FCR Micro-Loans ($15,000 Low-Interest Windmill/Achēv)' },
          { val: 'ien_spep', text: 'IEN Supervised Practice Experience Partnership (SPEP - CNO)' },
          { val: 'img_pra', text: 'IMG Practice Ready Assessment (PRA-BC / AIMG Clinical Pathway)' }
        ]},
        { id: 'status', label: 'Immigration Status in Canada', type: 'select', options: [
          { val: 'permanent_resident', text: 'Permanent Resident (PR)' },
          { val: 'open_work_permit', text: 'Open Work Permit Holder' },
          { val: 'canadian_citizen', text: 'Canadian Citizen' },
          { val: 'study_permit', text: 'International Student' }
        ]},
        { id: 'funding', label: 'Required Credentialing Funding ($ CAD)', type: 'number', default: 12000 },
        { id: 'province', label: 'Target Province (for IMG PRA)', type: 'select', options: [
          { val: 'BC', text: 'British Columbia (PRA-BC)' },
          { val: 'AB', text: 'Alberta (AIMG / PRA-AB)' },
          { val: 'ON', text: 'Ontario (Touchstone Institute)' },
          { val: 'SK', text: 'Saskatchewan (SIPPA)' }
        ]}
      ]
    },
    'city-comparison': {
      title: 'City Comparison Differential Engine: Rent, Taxes & Transit',
      endpoint: '/v1/tools/city-comparison',
      fields: [
        { id: 'cities', label: 'Destination Metros to Compare', type: 'select', options: [
          { val: 'Toronto,Calgary', text: 'Toronto (ON) vs Calgary (AB) — No PST Savings' },
          { val: 'Vancouver,Calgary', text: 'Vancouver (BC) vs Calgary (AB)' },
          { val: 'Toronto,Vancouver', text: 'Toronto (ON) vs Vancouver (BC)' },
          { val: 'Toronto,Montreal', text: 'Toronto (ON) vs Montreal (QC)' },
          { val: 'Calgary,Edmonton', text: 'Calgary (AB) vs Edmonton (AB)' }
        ]},
        { id: 'salary', label: 'Annual Household Gross Income ($ CAD)', type: 'number', default: 80000 },
        { id: 'household', label: 'Household Size (Family Members)', type: 'number', default: 2 }
      ]
    },
    'form-autopopulate': {
      title: 'Form Preparation Worksheet',
      endpoint: '/v1/tools/form-autopopulate',
      fields: [
        { id: 'formType', label: 'Form to prepare for', type: 'select', options: [
          { val: 'cbsa_bsf186', text: 'CBSA Form BSF186 (B4) Personal Effects Accounting (Settler)' },
          { val: 'ltb_t1', text: 'Ontario LTB Form T1 (Illegal Rent & Rent Deposit Rebate)' },
          { val: 'ltb_t2', text: 'Ontario LTB Form T2 (Tenant Rights & Illegal Lockout Damages)' },
          { val: 'cra_rc151', text: 'CRA Form RC151 (GST/HST & Carbon Rebate for Newcomers)' },
          { val: 'cbsa_e677', text: 'CBSA Form E677 (Cross-Border Currency >= $10k CAD)' },
          { val: 'fincen_105', text: 'U.S. FinCEN Form 105 (CMIR Currency >= $10k USD)' }
        ]}
      ]
    }
  };

  let modalOverlay = null;

  function ensureModalDom() {
    if (modalOverlay) return modalOverlay;
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'tool-modal-overlay';
    modalOverlay.hidden = true;

    modalOverlay.innerHTML = `
      <div class="tool-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="tool-modal-title">
        <div class="tool-modal-header">
          <h3 id="tool-modal-title">Interactive Statutory Navigator</h3>
          <button type="button" class="tool-modal-close" id="tool-modal-close-btn" aria-label="Close modal">✕</button>
        </div>
        <div class="tool-modal-body">
          <form id="tool-modal-form" class="tool-modal-form"></form>
          <p id="tool-modal-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
          <div id="tool-modal-results" class="tool-modal-results" role="region" aria-label="Tool results" tabindex="-1" hidden></div>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeBtn = modalOverlay.querySelector('#tool-modal-close-btn');
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
      if(e.key==='Tab'&&!modalOverlay.hidden){
        const controls=[...modalOverlay.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(node=>!node.disabled&&node.getClientRects().length);
        if(!controls.length)return;
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&(document.activeElement===first||!controls.includes(document.activeElement))){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||!controls.includes(document.activeElement))){e.preventDefault();first.focus();}
      }
    });
    return modalOverlay;
  }

  let previousActiveElement = null;
  let modalGeneration = 0;
  let activeRequest = null;
  let backgroundState = [];

  function cancelRequest() {
    modalGeneration += 1;
    activeRequest?.abort();
    activeRequest = null;
  }

  function closeModal() {
    cancelRequest();
    if (modalOverlay) modalOverlay.hidden = true;
    for (const [node, wasInert] of backgroundState) node.inert = wasInert;
    backgroundState = [];
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  window.triggerToolModal = function (tool) {
    cancelRequest();
    const generation = modalGeneration;
    if (!modalOverlay || modalOverlay.hidden) previousActiveElement = document.activeElement;
    const overlay = ensureModalDom();
    const titleEl = overlay.querySelector('#tool-modal-title');
    const formEl = overlay.querySelector('#tool-modal-form');
    const resultsEl = overlay.querySelector('#tool-modal-results');
    const statusEl = overlay.querySelector('#tool-modal-status');
    statusEl.textContent = '';
    formEl.setAttribute('aria-busy', 'false');

    resultsEl.hidden = true;
    resultsEl.innerHTML = '';
    formEl.innerHTML = '';

    const config = TOOL_FORMS[tool.id] || {
      title: tool.title,
      fields: [
        { id: 'province', label: 'Province', type: 'select', options: [{ val: 'ON', text: 'Ontario' }, { val: 'BC', text: 'British Columbia' }] }
      ]
    };

    titleEl.textContent = config.title || tool.title;

    for (const f of config.fields) {
      const row = document.createElement('div');
      row.className = 'tool-modal-row';
      const label = document.createElement('label');
      label.textContent = f.label;
      label.setAttribute('for', `modal-field-${f.id}`);
      row.appendChild(label);

      if (f.type === 'select') {
        const select = document.createElement('select');
        select.id = `modal-field-${f.id}`;
        select.name = f.id;
        for (const opt of f.options) {
          const option = document.createElement('option');
          option.value = opt.val;
          option.textContent = opt.text;
          select.appendChild(option);
        }
        row.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = f.type || 'text';
        input.id = `modal-field-${f.id}`;
        input.name = f.id;
        if (f.default !== undefined) input.value = f.default;
        row.appendChild(input);
      }
      formEl.appendChild(row);
    }

    const actionRow = document.createElement('div');
    actionRow.className = 'tool-modal-actions';
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'tool-modal-btn-primary';
    submitBtn.textContent = 'Run Statutory Evaluation ⚡';
    actionRow.appendChild(submitBtn);
    formEl.appendChild(actionRow);

    formEl.onsubmit = async (e) => {
      e.preventDefault();
      activeRequest?.abort();
      const request = new AbortController();
      activeRequest = request;
      const isCurrent = () => generation === modalGeneration && activeRequest === request;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Auditing Official Rules...';
      formEl.setAttribute('aria-busy', 'true');
      statusEl.textContent = 'Evaluating your inputs. Please wait.';
      resultsEl.hidden = true;

      const formData = new FormData(formEl);
      const queryParams = new URLSearchParams();
      for (const [k, v] of formData.entries()) {
        queryParams.set(k, v);
      }

      try {
        const endpoint = tool.endpoint || `/v1/tools/${tool.id}`;
        const res = await fetch(`${endpoint}?${queryParams.toString()}`, {signal: request.signal});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!isCurrent()) return;

        resultsEl.hidden = false;
        resultsEl.innerHTML = renderResultHtml(tool.id, data);
        showAssumptionNote(resultsEl, data);
        statusEl.textContent = 'Results ready.';
        resultsEl.focus();
      } catch (err) {
        if (!isCurrent()) return;
        resultsEl.hidden = false;
        const message=document.createElement('div');
        message.className='tool-modal-error';
        message.setAttribute('role', 'alert');
        message.textContent=`Error evaluating rules: ${err.message}`;
        resultsEl.replaceChildren(message);
        statusEl.textContent = '';
        resultsEl.focus();
      } finally {
        if (isCurrent()) {
          activeRequest = null;
          formEl.setAttribute('aria-busy', 'false');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Re-Evaluate ↺';
        }
      }
    };

    overlay.hidden = false;
    if (!backgroundState.length) {
      backgroundState = [...document.body.children].filter(node => node !== overlay).map(node => [node, node.inert]);
      for (const [node] of backgroundState) node.inert = true;
    }
    const firstInput = formEl.querySelector('input, select, textarea, button');
    if (firstInput && typeof firstInput.focus === 'function') {
      firstInput.focus();
    } else {
      overlay.querySelector('#tool-modal-close-btn')?.focus();
    }
  };

  // Template markup is trusted; every interpolated value is plain text.
  function html(parts, ...values) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    return parts.reduce((result, part, index) => result + part + (index < values.length ? String(values[index] ?? '').replace(/[&<>"']/g, char => entities[char]) : ''), '');
  }

  function renderResultHtml(toolId, data) {
    let out = '<div class="tool-modal-result-card">';
    out += html`<h4>⚡ Statutory Assessment Result</h4>`;

    if (data.palStatus) {
      const badgeCls = data.isPalRequired === null ? 'badge-neutral' : data.isPalRequired ? 'badge-warn' : 'badge-compliant';
      out += html`<div class="modal-badge ${badgeCls}">PAL STATUS: ${data.palStatus}</div>`;
    }
    if (data.riskTier === 'NOT_DETERMINED') {
      out += '<div class="modal-badge badge-neutral">Not determined — complete the trip, financial and ties fields.</div>';
    } else if (data.assessmentBasis === 'UNVALIDATED_HEURISTIC') {
      out += html`<div class="modal-badge badge-neutral">Planning score: ${data.tieScoreOutOf100}/100 — unvalidated heuristic</div>`;
      out += html`<p>${data.assessmentNotice}</p>`;
    } else if (data.riskTier) {
      const badgeCls = data.riskTier === 'LOW_RISK' ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${badgeCls}">RISK TIER: ${data.riskTier} (Score ${data.tieScoreOutOf100}/100)</div>`;
    }
    if (data.wageAnalysis) {
      out += html`<div class="modal-badge badge-neutral">STREAM: ${data.wageAnalysis.stream}</div>`;
    }
    if (data.sinEvaluation) {
      out += html`<p><strong>SIN Status:</strong> ${data.sinEvaluation.guidance}</p>`;
    }
    if (data.healthcareEvaluation) {
      out += html`<p><strong>Healthcare:</strong> ${data.healthcareEvaluation.notes}</p>`;
    }
    if (data.financialAudit) {
      if (data.financialAudit.status === 'NOT_DETERMINED') {
        out += html`<p><strong>Financial Proof:</strong> Not determined. ${data.financialAudit.policy?.reason || 'Enter tuition and available funds to calculate.'}</p>`;
      } else {
        out += html`<p><strong>Financial Planning Total:</strong> $${data.financialAudit.totalStatutoryProofRequiredCad.toLocaleString()} CAD (Available: $${data.financialAudit.liquidFundsAvailableCad.toLocaleString()} CAD)</p>`;
        out += html`<p>${data.financialAudit.policy?.travelEstimateBasis || ''}</p>`;
      }
    }
    if (data.pgwpEntitlement) {
      out += html`<div class="modal-badge badge-compliant">PGWP DURATION: ${data.pgwpEntitlement.durationMonths} MONTHS</div>`;
      out += html`<p><strong>CEC Requirement:</strong> ${data.prPathways?.federalCecRequirement || '52 weeks / 1,560 hours'}</p>`;
      out += html`<p><strong>Projected CRS Gain:</strong> +${data.prPathways?.projectedCrsGain || 0} Points</p>`;
      if (data.prPathways?.provincialNomineeOptions?.length) {
        out += '<h5>Provincial Nominee Streams:</h5><ul>';
        for (const p of data.prPathways.provincialNomineeOptions) out += html`<li>${p}</li>`;
        out += '</ul>';
      }
    }
    if (data.groundsIdentifiedCount !== undefined) {
      out += html`<div class="modal-badge badge-warn">GROUNDS IDENTIFIED: ${data.groundsIdentifiedCount}</div>`;
      if (data.proceduralRemedy) {
        out += html`<p><strong>Judicial Review Window:</strong> ${data.proceduralRemedy.isWithinFederalCourtWindow ? '✅ Inside Deadline' : '⚠️ Past Standard Deadline'}</p>`;
        out += html`<p><strong>Recommended Action:</strong> ${data.proceduralRemedy.recommendedAction}</p>`;
      }
      if (data.refusalFindings?.length) {
        out += '<h5>Officer Findings & Legal Remedies:</h5><ul>';
        for (const f of data.refusalFindings) out += html`<li><strong>${f.title}:</strong> ${f.remedy}</li>`;
        out += '</ul>';
      }
    }
    if (data.eligiblePathwaysCount !== undefined) {
      out += html`<div class="modal-badge badge-compliant">ELIGIBLE ROUTES: ${data.eligiblePathwaysCount} / ${data.totalOptionsEvaluated}</div>`;
      if (data.eligiblePathways?.length) {
        out += '<h5>Qualifying Global Relocation Pathways:</h5><ul>';
        for (const ep of data.eligiblePathways) {
          out += html`<li><strong>[${ep.countryCode}] ${ep.title}:</strong> ${ep.keyNotes} <small>(${ep.statutoryBasis})</small></li>`;
        }
        out += '</ul>';
      }
      if (data.restrictedPathways?.length) {
        out += '<h5>Restricted Pathways (Missing Requirements):</h5><ul>';
        for (const rp of data.restrictedPathways.slice(0, 4)) {
          out += html`<li><strong>[${rp.countryCode}] ${rp.title}:</strong> ${rp.statutoryConditions[0] || 'Condition not met'}</li>`;
        }
        out += '</ul>';
      }
    }
    if (data.taxOptimization) {
      const eligBadge = data.eligibilityCheck.isEligible ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${eligBadge}">CRA 40-KM TEST: ${data.eligibilityCheck.isEligible ? 'ELIGIBLE' : 'INELIGIBLE'}</div>`;
      out += html`<p>${data.eligibilityCheck.ruleSummary}</p>`;
      out += html`<p><strong>Allowable Deduction:</strong> $${data.taxOptimization.allowableDeductionCurrentYearCad.toLocaleString()} CAD (Est. Tax Savings: $${data.taxOptimization.estimatedTaxRefundSavingsCad.toLocaleString()} CAD)</p>`;
      if (data.taxOptimization.carryforwardToFutureYearsCad > 0) {
        out += html`<p><strong>Carryforward:</strong> $${data.taxOptimization.carryforwardToFutureYearsCad.toLocaleString()} CAD deductible against future years.</p>`;
      }
    }
    if (data.statutoryMinimumEntitlement && data.commonLawEntitlement) {
      out += html`<div class="modal-badge badge-warn">ESA STATUTORY FLOOR: ${data.statutoryMinimumEntitlement.totalStatutoryMinimumPayCad.toLocaleString()} CAD</div>`;
      out += html`<div class="modal-badge badge-compliant">COMMON LAW ESTIMATE: ${data.commonLawEntitlement.estimatedNoticePayCad.toLocaleString()} CAD (${data.commonLawEntitlement.estimatedNoticePeriodMonths} Months)</div>`;
      out += html`<p><strong>Potential Severance Gap:</strong> +$${data.commonLawEntitlement.potentialSeveranceGainDeltaCad.toLocaleString()} CAD higher under common law.</p>`;
      out += '<h5>Severance Signing Traps:</h5><ul>';
      for (const trap of data.severanceReleaseTrapWarnings.slice(0, 3)) {
        out += html`<li>${trap}</li>`;
      }
      out += '</ul>';
    }
    if (data.h1bGracePeriodAudit) {
      const graceCls = data.h1bGracePeriodAudit.isGracePeriodActive ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${graceCls}">H-1B 60-DAY GRACE: ${data.h1bGracePeriodAudit.isGracePeriodActive ? `${data.h1bGracePeriodAudit.daysRemaining} DAYS REMAINING` : 'EXPIRED'}</div>`;
      out += html`<p><strong>Statutory Deadline:</strong> ${data.h1bGracePeriodAudit.statutoryDeadlineDate}</p>`;
      out += html`<p class="modal-warn-text">${data.h1bGracePeriodAudit.severanceWarning}</p>`;
    }
    if (data.capGapAudit) {
      const capCls = data.capGapAudit.isCapGapEligible ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${capCls}">F-1 CAP-GAP: ${data.capGapAudit.isCapGapEligible ? 'ACTIVE THROUGH SEPT 30' : 'INELIGIBLE'}</div>`;
      out += html`<p>${data.capGapAudit.workAuthorizationBridge}</p>`;
    }
    if (data.salaryCompliance) {
      const salCls = data.salaryCompliance.isSalaryCompliant ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${salCls}">UK SALARY COMPLIANCE: ${data.salaryCompliance.isSalaryCompliant ? 'COMPLIANT' : 'DEFICIT'}</div>`;
      out += html`<p><strong>Category:</strong> ${data.salaryCompliance.thresholdCategory}</p>`;
      out += html`<p>${data.salaryCompliance.statutoryNotes}</p>`;
    }
    if (data.housingSection21Defense) {
      const s21Cls = data.housingSection21Defense.isSection21NoticeValid ? 'badge-warn' : 'badge-compliant';
      out += html`<div class="modal-badge ${s21Cls}">SECTION 21 EVICTION: ${data.housingSection21Defense.isSection21NoticeValid ? 'VALID' : 'INVALID / VOID'}</div>`;
      out += html`<p>${data.housingSection21Defense.remedyAdvice}</p>`;
    }
    if (data.superVisaEvaluation) {
      const svCls = data.superVisaEvaluation.isIncomeSufficient ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${svCls}">SUPER VISA INCOME: ${data.superVisaEvaluation.isIncomeSufficient ? 'SUFFICIENT' : 'INSUFFICIENT'}</div>`;
      out += html`<p><strong>Family Unit Size:</strong> ${data.householdAudit.totalFamilyUnitSize} People (LICO + 30%: $${data.householdAudit.requiredLicoPlus30IncomeCad.toLocaleString()} CAD)</p>`;
      out += html`<p><strong>Stay Entitlement:</strong> ${data.superVisaEvaluation.stayEntitlement}</p>`;
    }
    if (data.condition8607Audit) {
      const c8607Cls = data.condition8607Audit.isCompliant ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${c8607Cls}">AU CONDITION 8607: ${data.condition8607Audit.consecutiveDaysRemaining} DAYS REMAINING</div>`;
      if (data.medicareLevyExemption) {
        out += html`<p><strong>Medicare Levy 2% Exemption:</strong> Est. Tax Savings: $${data.medicareLevyExemption.annualPotentialTaxSavingsAud.toLocaleString()} AUD</p>`;
      }
    }
    if (data.chancenkarteAudit) {
      const deCls = data.chancenkarteAudit.isPointsEligible ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${deCls}">CHANCENKARTE: ${data.chancenkarteAudit.isPointsEligible ? 'ELIGIBLE (6+ PTS)' : 'INSUFFICIENT POINTS'}</div>`;
    }
    if (data.nebenkostenTenancyAudit) {
      const nebCls = data.nebenkostenTenancyAudit.isTenantObligatedToPay ? 'badge-warn' : 'badge-compliant';
      out += html`<div class="modal-badge ${nebCls}">NEBENKOSTEN ARREARS: ${data.nebenkostenTenancyAudit.isTenantObligatedToPay ? 'PAYABLE' : 'PRECLUDED (BGB § 556(3))'}</div>`;
      out += html`<p>${data.nebenkostenTenancyAudit.legalRule}</p>`;
    }
    if (data.firstHomeStrategies) {
      out += html`<div class="modal-badge badge-compliant">FIRST HOME STRATEGY: $${(data.firstHomeStrategies.combinedPurchasingPowerCad || 0).toLocaleString()} CAD COMBINED</div>`;
      if (data.firstHomeStrategies.fhsa) {
        out += html`<p><strong>FHSA:</strong> $${(data.firstHomeStrategies.fhsa.actualDeductibleContributionCad || 0).toLocaleString()} CAD deductible (Est. Tax Savings: $${(data.firstHomeStrategies.fhsa.estimatedTaxSavingsCad || 0).toLocaleString()} CAD)</p>`;
      }
      if (data.firstHomeStrategies.hbp) {
        out += html`<p><strong>HBP RRSP Withdrawal:</strong> $${(data.firstHomeStrategies.hbp.maxAllowableWithdrawalCad || 0).toLocaleString()} CAD (${data.firstHomeStrategies.hbp.repaymentTerms?.gracePeriodYears}-year grace period)</p>`;
      }
      if (data.taxCompliance?.foreignProp) {
        out += html`<p><strong>Foreign Property Step-Up:</strong> Accrued gains sheltered: $${(data.taxCompliance.foreignProp.landingCostBaseStepUp?.preLandingAccruedGainsShelteredCad || 0).toLocaleString()} CAD</p>`;
      }
    }
    if (data.isRentControlled !== undefined || data.isBadFaithPenaltyApplicable !== undefined) {
      if (data.isRentControlled !== undefined) {
        const rcBadge = data.isIncreaseLawful ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${rcBadge}">RENT INCREASE: ${data.isIncreaseLawful ? 'LAWFUL' : 'UNLAWFUL / VOID'}</div>`;
        out += html`<p><strong>Status:</strong> ${data.isRentControlled ? 'Rent Controlled (2.5% Cap)' : 'Exempt Post-Nov 15, 2018'}</p>`;
      }
      if (data.isBadFaithPenaltyApplicable !== undefined) {
        const bfBadge = data.isBadFaithPenaltyApplicable ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${bfBadge}">BC BAD FAITH PENALTY: $${(data.statutoryPenaltyAmountCad || 0).toLocaleString()} CAD (12 Months Rent)</div>`;
      }
      if (data.remedy) {
        out += html`<p>${data.remedy}</p>`;
      }
    }
    if (data.accruedGratuityAed !== undefined || data.aewvRedundancyAudit || data.totalScore !== undefined) {
      if (data.accruedGratuityAed !== undefined) {
        out += html`<div class="modal-badge badge-compliant">ACCRUED UAE GRATUITY: ${data.accruedGratuityAed.toLocaleString()} AED</div>`;
        if (data.deductionsAudit?.hasUnlawfulDeductions) {
          out += html`<p class="modal-warn-text">⚠️ ${data.deductionsAudit.statutoryShield}</p>`;
        }
      }
      if (data.aewvRedundancyAudit) {
        const aewvCls = data.aewvRedundancyAudit.isCushionActive ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${aewvCls}">NZ 90-DAY CUSHION: ${data.aewvRedundancyAudit.cushionRemainingDays} DAYS REMAINING</div>`;
        out += html`<p>${data.aewvRedundancyAudit.advice}</p>`;
      }
      if (data.totalScore !== undefined) {
        const passCls = data.isPassingScore ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${passCls}">SINGAPORE COMPASS: ${data.totalScore} / 40 POINTS (${data.isPassingScore ? 'PASS' : 'FAIL'})</div>`;
      }
    }
    if (data.statutoryWorkStudyProhibition || data.isFlagpolingPermitted !== undefined || data.inadmissibilityStatus) {
      if (data.isEligibleToApply !== undefined) {
        const restCls = data.isEligibleToApply ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${restCls}">RESTORATION (IRPR s. 182): ${data.isEligibleToApply ? `${data.daysRemainingToApply} DAYS LEFT` : 'INELIGIBLE (> 90 DAYS)'}</div>`;
        if (data.statutoryWorkStudyProhibition) {
          out += html`<p class="modal-warn-text">⚠️ ${data.statutoryWorkStudyProhibition.legalRule}</p>`;
        }
      }
      if (data.isFlagpolingPermitted !== undefined) {
        const flagCls = data.isFlagpolingPermitted ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${flagCls}">FLAGPOLING: ${data.isFlagpolingPermitted ? 'PERMITTED' : 'PROHIBITED'}</div>`;
        if (data.warning) out += html`<p class="modal-warn-text">⚠️ ${data.warning}</p>`;
      }
      if (data.inadmissibilityStatus) {
        const inadCls = data.deemedRehabilitationEligible ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${inadCls}">STATUS: ${data.inadmissibilityStatus}</div>`;
        out += html`<p>${data.statutoryRule || data.actionRequired || ''}</p>`;
      }
    }
    if (data.topRecommendedCorridor) {
      out += html`<div class="modal-badge badge-compliant">TOP CORRIDOR: ${data.topRecommendedCorridor.countryCode} (Score: ${data.topRecommendedCorridor.score})</div>`;
      if (data.comparativeSummary) out += html`<p>${data.comparativeSummary}</p>`;
      if (data.evaluations?.length) {
        out += '<h5>Corridor Point Standings:</h5><ul>';
        for (const ev of data.evaluations) {
          out += html`<li><strong>${ev.country}:</strong> ${ev.pointsScore} pts (${ev.verdict}) — <small>${ev.statutoryStream}</small></li>`;
        }
        out += '</ul>';
      }
    }
    if (data.spousalAudit || data.superVisaAudit || data.childAudit) {
      const isElig = data.eligible ? 'badge-compliant' : 'badge-warn';
      out += html`<div class="modal-badge ${isElig}">${data.category?.toUpperCase()}: ${data.eligible ? 'QUALIFIED' : 'RESTRICTED'}</div>`;
      if (data.verdict) out += html`<p>${data.verdict}</p>`;
      if (data.statutoryLegalBasis) out += html`<small class="modal-statute-note">📜 Legal Basis: ${data.statutoryLegalBasis}</small>`;
    }
    if (data.totalFirstYearFinancialShieldCad !== undefined) {
      out += html`<div class="modal-badge badge-compliant">FIRST-YEAR TAX SHIELD: $${data.totalFirstYearFinancialShieldCad.toLocaleString()} CAD</div>`;
      if (data.fhsaShield) out += html`<p><strong>FHSA Tax Savings:</strong> $${(data.fhsaShield.taxSavingsCad || 0).toLocaleString()} CAD (Max Contribution: $${(data.fhsaShield.contributionRoomCad || 0).toLocaleString()} CAD)</p>`;
      if (data.tfsaShield) out += html`<p><strong>TFSA Room:</strong> $${(data.tfsaShield.tfsaRoomCad || 0).toLocaleString()} CAD (${data.tfsaShield.isNonResidentWarning ? '⚠️ Non-Resident Warning' : 'Lawful'})</p>`;
      if (data.childAndFamilyBenefits) out += html`<p><strong>Child & Family Benefits:</strong> $${(data.childAndFamilyBenefits.estimatedAnnualCad || 0).toLocaleString()} CAD / yr</p>`;
      if (data.wealthActionPlan?.length) {
        out += '<h5>Financial Action Plan:</h5><ul>';
        for (const act of data.wealthActionPlan) out += html`<li>${act}</li>`;
        out += '</ul>';
      }
    }
    if (data.totalEventsGenerated !== undefined) {
      out += html`<div class="modal-badge badge-compliant">GENERATED ${data.totalEventsGenerated} TIMELINE DEADLINES</div>`;
      if (data.summary) out += html`<p>${data.summary}</p>`;
      if (data.events?.length) {
        out += '<h5>Statutory Deadlines:</h5><ul>';
        for (const evt of data.events) {
          out += html`<li><strong>${evt.date}:</strong> ${evt.summary} — <small>${evt.statuteCitation || ''}</small></li>`;
        }
        out += '</ul>';
      }
      if (data.icsContent) {
        const encodedIcs = encodeURIComponent(data.icsContent);
        out += html`<div data-s="margin-top-10px"><a class="tool-modal-btn-primary" data-s="display-inline-block text-decoration-none padding-8px-14px border-radius-6px" href="data:text/calendar;charset=utf-8,${encodedIcs}" download="settlement-timeline.ics">📅 Download .ics Calendar File</a></div>`;
      }
    }
    if (data.documentType && data.formalNoticeText) {
      out += html`<div class="modal-badge badge-compliant">NOTICE READY: ${data.documentType.toUpperCase()}</div>`;
      out += html`<p><strong>${data.title}</strong></p>`;
      if (data.statutoryWarnings?.length) {
        for (const w of data.statutoryWarnings) out += html`<p class="modal-warn-text">⚠️ ${w}</p>`;
      }
      if (data.remediesDemanded?.length) {
        out += '<h5>Demanded Remedies:</h5><ul>';
        for (const r of data.remediesDemanded) out += html`<li>${r}</li>`;
        out += '</ul>';
      }
      if (data.printReadyHtml) {
        latestPrintHtml = data.printReadyHtml;
        out += html`<div data-s="margin-top-12px"><button type="button" class="tool-modal-btn-primary" data-print-latest="tool">🖨️ View &amp; Print Formal Legal Notice</button></div>`;
      }
    }
    if (data.digitalDeviceSearchPolicy || (data.country && data.authority && data.guidanceChecklist)) {
      out += html`<div class="modal-badge badge-compliant">${data.country} BORDER RIGHTS: ${data.authority}</div>`;
      if (data.criticalWarnings?.length) {
        for (const cw of data.criticalWarnings) out += html`<p class="modal-warn-text">⚠️ ${cw}</p>`;
      }
      if (data.guidanceChecklist?.length) {
        out += '<h5>Border Officer Inspection Protocol:</h5><ul>';
        for (const g of data.guidanceChecklist) out += html`<li>${g}</li>`;
        out += '</ul>';
      }
      if (data.emergencyAssistance?.hotline) {
        out += html`<p><strong>Emergency Assistance Hotline:</strong> ${data.emergencyAssistance.hotline}</p>`;
      }
    }
    if (data.overtimeRateCad !== undefined || data.statutoryVacationPayCad !== undefined || data.publicHolidayPayCad !== undefined || data.totalSeverancePayCad !== undefined || data.classificationVerdict || data.isEqualPayViolation !== undefined) {
      if (data.overtimeRateCad !== undefined) {
        out += html`<div class="modal-badge badge-compliant">OVERTIME RATE: ${data.overtimeRateCad} CAD/hr (Standard: ${data.standardWeeklyThresholdHours}h)</div>`;
        out += html`<p><strong>Weekly Pay:</strong> Regular: ${data.regularPayCad} CAD (${data.regularHours}h) + Overtime: ${data.overtimePayCad} CAD (${data.overtimeHours}h) = <strong>${data.totalWeeklyPayCad} CAD</strong></p>`;
      }
      if (data.statutoryVacationPayCad !== undefined) {
        out += html`<div class="modal-badge badge-compliant">VACATION PAY: $${data.statutoryVacationPayCad.toLocaleString()} CAD (${data.entitlementWeeks} Weeks / ${data.applicableRatePercent})</div>`;
        if (data.stepUpDeltaCad > 0 || data.potentialUnderpaymentCad > 0) {
          const delta = data.stepUpDeltaCad || data.potentialUnderpaymentCad;
          out += html`<p class="modal-warn-text">⚠️ Employer 4% Underpayment Discrepancy: $${delta.toLocaleString()} CAD owed under ESA s. 35.1.</p>`;
        }
      }
      if (data.statutoryHolidayPayCad !== undefined || data.publicHolidayPayCad !== undefined) {
        const holidayAmt = data.statutoryHolidayPayCad !== undefined ? data.statutoryHolidayPayCad : data.publicHolidayPayCad;
        out += html`<div class="modal-badge badge-compliant">PUBLIC HOLIDAY PAY: $${holidayAmt.toLocaleString()} CAD (Divisor: 20)</div>`;
      }
      if (data.totalSeverancePayCad !== undefined || data.severancePayCad !== undefined) {
        const sevAmt = data.totalSeverancePayCad !== undefined ? data.totalSeverancePayCad : data.severancePayCad;
        const sevCls = data.qualifiesForSeverance || data.isEligibleForSeverance ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${sevCls}">STATUTORY SEVERANCE: $${sevAmt.toLocaleString()} CAD (${data.severanceWeeks || data.severanceWeeksEntitled || 0} Weeks)</div>`;
      }
      if (data.classificationVerdict) {
        const classCls = data.isMisclassified ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${classCls}">${data.classificationVerdict}</div>`;
        out += html`<p class="modal-warn-text">${data.reverseBurdenOfProof}</p>`;
      }
      if (data.isEqualPayViolation !== undefined) {
        const epCls = data.isEqualPayViolation ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${epCls}">EQUAL PAY: ${data.isEqualPayViolation ? 'VIOLATION' : 'COMPLIANT'} (${data.hourlyDisparityCad}/hr gap)</div>`;
        out += html`<p>${data.legalRule}</p>`;
      }
    }

    if (data.isConstructiveDismissal !== undefined || data.isPrimaFacieDiscrimination !== undefined || data.reprisalAudit || data.monthsRemainingToClaim !== undefined) {
      if (data.isConstructiveDismissal !== undefined) {
        const cdCls = data.isConstructiveDismissal ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${cdCls}">CONSTRUCTIVE DISMISSAL: ${data.isConstructiveDismissal ? 'SUBSTANTIAL BREACH' : 'NOT ESTABLISHED'}</div>`;
        if (data.condonationAudit?.legalWarning) out += html`<p class="modal-warn-text">${data.condonationAudit.legalWarning}</p>`;
      }
      if (data.isPrimaFacieDiscrimination !== undefined || data.profession) {
        const discCls = (data.isPrimaFacieDiscrimination || data.isViolation) ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${discCls}">CANADIAN EXPERIENCE: ${discCls === 'badge-warn' ? 'PROHIBITED REQUIREMENT' : 'COMPLIANT'}</div>`;
        out += html`<p>${data.legalStandard || data.legalRule}</p>`;
      }
      if (data.reprisalAudit) {
        const repCls = data.reprisalAudit.hasUnlawfulReprisalOccurred ? 'badge-warn' : 'badge-compliant';
        out += html`<div class="modal-badge ${repCls}">OHSA WORK REFUSAL: ${data.currentStage}</div>`;
        if (data.reprisalAudit.hasUnlawfulReprisalOccurred) {
          out += html`<p class="modal-warn-text">⚠️ ${data.reprisalAudit.legalRule} ${data.reprisalAudit.reverseBurdenOfProof}</p>`;
        }
      }
      if (data.monthsRemainingToClaim !== undefined) {
        const wsibCls = data.isWithinClaimDeadline ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${wsibCls}">WSIB 6-MONTH LIMITATION: ${data.isWithinClaimDeadline ? `${data.monthsRemainingToClaim} MONTHS LEFT` : 'EXPIRED'}</div>`;
        out += html`<p>${data.actionRequired}</p>`;
      }
    }

    if (data.requiredHoursThreshold !== undefined || data.isJustCauseEstablished !== undefined || data.benefitType) {
      if (data.requiredHoursThreshold !== undefined) {
        const eiCls = data.isEligible ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${eiCls}">EI REGULAR: ${data.isEligible ? `QUALIFIED (${data.estimatedWeeklyBenefitCad}/wk)` : 'DISQUALIFIED / INSUFFICIENT HOURS'}</div>`;
        out += html`<p><strong>Hours Accrued:</strong> ${data.insurableHoursAccrued} / ${data.requiredHoursThreshold} hrs required (Regional Rate: ${data.regionalUnemploymentRatePercent}%)</p>`;
      }
      if (data.isJustCauseEstablished !== undefined) {
        const jcCls = data.isJustCauseEstablished ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${jcCls}">EI JUST CAUSE (s. 29(c)): ${data.isJustCauseEstablished ? 'ESTABLISHED (NOT DISQUALIFIED)' : 'DISQUALIFICATION RISK'}</div>`;
        out += html`<p>${data.statutoryRule}</p>`;
      }
      if (data.benefitType && !data.requiredHoursThreshold) {
        out += html`<div class="modal-badge badge-compliant">${data.benefitType.toUpperCase()}</div>`;
        if (data.weeklyRateCad || data.weeklyBenefitRateCad) {
          out += html`<p><strong>Weekly Rate:</strong> ${data.weeklyRateCad || data.weeklyBenefitRateCad} CAD/wk</p>`;
        }
        if (data.irrevocabilityWarning) out += html`<p class="modal-warn-text">⚠️ ${data.irrevocabilityWarning}</p>`;
      }
    }

    if (data.availableLoanPrograms || data.isEligibleForSpep !== undefined || data.isEligibleForPra !== undefined) {
      if (data.availableLoanPrograms) {
        const fcrCls = data.isEligibleForFcrLoans ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${fcrCls}">FCR MICRO-LOANS: ${data.isEligibleForFcrLoans ? 'ELIGIBLE (UP TO $15,000 CAD)' : 'INELIGIBLE'}</div>`;
        out += html`<p>${data.guidance}</p>`;
      }
      if (data.isEligibleForSpep !== undefined) {
        const spepCls = data.isEligibleForSpep ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${spepCls}">CNO SPEP NURSING: ${data.isEligibleForSpep ? 'ELIGIBLE FOR PAID PLACEMENT' : 'INELIGIBLE'}</div>`;
        out += html`<p>${data.nextSteps}</p>`;
      }
      if (data.isEligibleForPra !== undefined) {
        const praCls = data.isEligibleForPra ? 'badge-compliant' : 'badge-warn';
        out += html`<div class="modal-badge ${praCls}">IMG PRA (${data.province}): ${data.isEligibleForPra ? 'ELIGIBLE' : 'PENDING REQUIREMENTS'}</div>`;
        out += html`<p><strong>${data.programName}:</strong> ${data.majorAdvantage}</p>`;
      }
    }

    if (data.checklist?.length) {
      out += '<h5>Action Checklist:</h5><ul>';
      for (const item of data.checklist) out += html`<li>${item}</li>`;
      out += '</ul>';
    }
    if (data.comparison && Array.isArray(data.comparison)) {
      out += html`<div class="modal-badge badge-compliant">CITY COMPARISON AUDIT</div>`;
      if (data.differential) {
        out += html`<p><strong>Cheaper Landing Hub:</strong> ${data.differential.cheaperCity} (Estimated annual fixed outflow savings: <strong>${data.differential.annualEstimatedSavings.toLocaleString()} CAD</strong>)</p>`;
        if (data.differential.salesTaxAdvantage) {
          out += html`<p class="modal-compliant-text">💡 ${data.differential.salesTaxAdvantage} has zero provincial sales tax (5% GST only), reducing consumer expenses.</p>`;
        }
      }
      out += '<div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-10px margin-top-10px">';
      for (const c of data.comparison) {
        out += html`<div data-s="background-rgba-0-0-0-0_03 padding-10px border-radius-6px border-1px-solid-ddd">
          <h5 data-s="margin-0-0-6px-0">${c.city} (${c.provinceCode})</h5>
          <div data-s="font-size-12px">Median Rent: <strong>${c.projectedMonthlyRent.toLocaleString()} CAD/mo</strong></div>
          <div data-s="font-size-12px">Transit Pass: <strong>${c.transitMonthlyPass.toFixed(2)} CAD/mo</strong></div>
          <div data-s="font-size-12px">Healthcare: <strong>${c.healthcareWaitPeriod}</strong></div>
          <div data-s="font-size-12px">Sales Tax: <strong>${c.salesTax}</strong></div>
        </div>`;
      }
      out += '</div>';
    }

    if (data.formType && data.populatedFields && data.printReadyHtml) {
      out += html`<div class="modal-badge badge-warn">DRAFT WORKSHEET: ${data.formNumber}</div>`;
      out += '<p>This worksheet is not an official form and is not ready for submission. Complete and review the current official form separately.</p>';
      if (Array.isArray(data.missingFields)) out += html`<p>Blank worksheet fields: ${data.missingFields.length}</p>`;
      if (data.pdfNotice) out += html`<p>${data.pdfNotice}</p>`;
      out += html`<p><strong>${data.title}</strong> (${data.organization})</p>`;
      out += html`<small class="modal-statute-note">📜 Statutory Authority: ${data.statuteBasis}</small>`;
      out += '<h5 data-s="margin-top-12px">Worksheet Fields:</h5><ul data-s="font-size-12px">';
      for (const pf of data.populatedFields.slice(0, 5)) {
        out += html`<li><strong>${pf.label}:</strong> ${pf.val}</li>`;
      }
      out += '</ul>';
      if (data.printReadyHtml) {
        latestFormPrintHtml = data.printReadyHtml;
        out += html`<div data-s="margin-top-14px display-flex gap-10px flex-wrap-wrap">
          <button type="button" class="tool-modal-btn-primary" data-print-latest="form">🖨️ View &amp; Print Worksheet</button>`;
        if (data.pdfBase64) out += html`<a class="tool-modal-btn-primary" href="data:application/pdf;base64,${data.pdfBase64}" download="${data.formType}.pdf">📄 Download PDF</a>`;
        out += '</div>';
      }
    }

    if (data.complianceStatus || data.legalVerdict || data.eligibilityVerdict) {
      const isCompliant = (data.complianceStatus && !data.complianceStatus.includes('BREACH') && !data.complianceStatus.includes('VIOLATION') && !data.complianceStatus.includes('DEFECTIVE')) || data.isEligible;
      const badgeCls = isCompliant ? 'badge-compliant' : 'badge-warn';
      const statusTitle = data.complianceStatus || data.eligibilityVerdict || 'STATUTORY ASSESSMENT';
      out += html`<div class="modal-badge ${badgeCls}">${statusTitle.replace(/_/g, ' ')}</div>`;
      if (data.legalVerdict) out += html`<p>${data.legalVerdict}</p>`;
      if (data.statutoryViolations && data.statutoryViolations.length > 0) {
        out += '<h5>Statutory Issues:</h5><ul>';
        for (const v of data.statutoryViolations) {
          out += html`<li><strong>${v.rule || v.statute || 'Issue'}:</strong> ${v.finding || v.description || ''}</li>`;
        }
        out += '</ul>';
      }
      if (data.actionableRemedies && data.actionableRemedies.length > 0) {
        out += '<h5>Actionable Remedies:</h5><ul>';
        for (const r of data.actionableRemedies) {
          out += html`<li><strong>${r.action || 'Remedy'}:</strong> ${r.remedyDescription || r.description || ''}</li>`;
        }
        out += '</ul>';
      }
    }

    if (data.statuteBasis || data.statutoryBasis) {
      out += html`<small class="modal-statute-note">📜 Legal Basis: ${data.statuteBasis || data.statutoryBasis}</small>`;
    }
    out += '</div>';
    return out;
  }
})();
