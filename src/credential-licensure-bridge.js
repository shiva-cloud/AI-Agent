// src/credential-licensure-bridge.js
// Statutory Foreign Credential Recognition (FCR) & Regulated Profession Licensure Bridge Engine.
// Governed under Ontario Fair Access to Regulated Professions and Compulsory Trades Act (FARPACTA),
// Ontario Bill 27 (Working for Workers Act Canadian Experience Ban),
// BC International Credentials Recognition Act (2023), and Provincial Regulated Profession Acts.
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const REGULATED_PROFESSIONS_DIRECTORY = {
  civil_engineer: {
    title: 'Civil Engineer',
    isRegulated: true,
    protectedTitle: 'Professional Engineer (P.Eng.)',
    statutes: {
      ON: 'Professional Engineers Act, R.S.O. 1990, c. P.28 (PEO)',
      BC: 'Professional Governance Act, S.B.C. 2018, c. 47 (Engineers and Geoscientists BC)',
      AB: 'Engineering and Geoscience Professions Act, RSA 2000, c. E-11 (APEGA)'
    },
    regulatoryColleges: {
      ON: 'Professional Engineers Ontario (PEO)',
      BC: 'Engineers and Geoscientists British Columbia (EGBC)',
      AB: 'Association of Professional Engineers and Geoscientists of Alberta (APEGA)'
    },
    mandatoryEcaDesignation: 'WES',
    canadianExperienceBanProtected: true,
    estimatedLicensingDurationMonths: 18,
    estimatedTotalCostCad: 2400,
    titleRestrictionNotice: 'In Ontario and BC, the title "Engineer" is strictly protected by law. Practicing without a license or using "P.Eng." or "Civil Engineer" on LinkedIn/resumes before licensure carries statutory fines up to $25,000. You may use titles such as "Engineering Designer", "Project Coordinator", or "Civil Technologist".',
    milestones: [
      { step: 1, name: 'Academic Credential Assessment', details: 'Submit official transcripts via WES or directly to provincial engineering regulator to verify Washington Accord or non-accord syllabus equivalence.' },
      { step: 2, name: 'Competency-Based Assessment (CBA)', details: 'Complete 34 engineering competency indicators across 7 categories. Under Ontario FARPACTA Bill 27, Canadian work experience is no longer mandatory; foreign experience can satisfy competencies.' },
      { step: 3, name: 'National Professional Practice Exam (NPPE)', details: 'Pass the 2.5-hour NPPE testing Canadian engineering law, tort liability, contracts, ethics, and professional misconduct.' },
      { step: 4, name: 'Good Character & Final Licensure', details: 'Complete the declaration of good character, pay P.Eng. licensing fees, and receive your seal and certificate.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Civil Engineering Technologist', typicalSalaryCad: 68000, noc: '22300', regulatoryBarrier: 'Unregulated / Optional OACETT/ASTTBC certification' },
      { role: 'Construction Project Coordinator', typicalSalaryCad: 72000, noc: '70010', regulatoryBarrier: 'Unregulated' },
      { role: 'BIM / CAD Drafter and Designer', typicalSalaryCad: 62000, noc: '22212', regulatoryBarrier: 'Unregulated' },
      { role: 'Construction Estimator', typicalSalaryCad: 75000, noc: '22303', regulatoryBarrier: 'Unregulated' }
    ]
  },
  software_engineer: {
    title: 'Software Engineer',
    isRegulated: true,
    protectedTitle: 'Professional Engineer (P.Eng.) in Software Engineering',
    statutes: {
      ON: 'Professional Engineers Act, R.S.O. 1990, c. P.28, s. 40',
      BC: 'Professional Governance Act, S.B.C. 2018, c. 47',
      AB: 'Engineering and Geoscience Professions Act (APEGA)'
    },
    regulatoryColleges: {
      ON: 'Professional Engineers Ontario (PEO)',
      BC: 'Engineers and Geoscientists BC (EGBC)',
      AB: 'APEGA'
    },
    mandatoryEcaDesignation: 'WES',
    canadianExperienceBanProtected: true,
    estimatedLicensingDurationMonths: 18,
    estimatedTotalCostCad: 2200,
    titleRestrictionNotice: 'CRITICAL TITLE CAUTION: In Canada (especially Alberta and Ontario), provincial regulators enforce title protection for "Software Engineer". Over 90% of tech workers practice legally in Canada without a P.Eng. license by using unregulated market titles: "Software Developer", "Full Stack Developer", "Backend Engineer (internal)", "Programmer Analyst", or "Technical Lead".',
    milestones: [
      { step: 1, name: 'Academic Evaluation (ECA)', details: 'General academic ECA through WES or ICAS for Canadian bachelor degree equivalence.' },
      { step: 2, name: 'Regulator Competency Audit', details: 'If pursuing formal P.Eng., submit 34 competency indicators demonstrating software engineering principles applied to safety-critical systems.' },
      { step: 3, name: 'National Professional Practice Exam (NPPE)', details: 'Pass Canadian engineering ethics and intellectual property law examination.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Senior Software Developer / Programmer', typicalSalaryCad: 115000, noc: '21232', regulatoryBarrier: 'Unregulated (Market Standard)' },
      { role: 'Full Stack Web Developer', typicalSalaryCad: 92000, noc: '21234', regulatoryBarrier: 'Unregulated' },
      { role: 'DevOps & Cloud Infrastructure Specialist', typicalSalaryCad: 110000, noc: '21223', regulatoryBarrier: 'Unregulated' },
      { role: 'Data Scientist / ML Engineer', typicalSalaryCad: 105000, noc: '21211', regulatoryBarrier: 'Unregulated' }
    ]
  },
  registered_nurse: {
    title: 'Registered Nurse (RN)',
    isRegulated: true,
    protectedTitle: 'Registered Nurse (RN) / Registered Practical Nurse (RPN)',
    statutes: {
      ON: 'Nursing Act, 1991, S.O. 1991, c. 32 (CNO)',
      BC: 'Health Professions Act, RSBC 1996, c. 183 (BCCNM)',
      AB: 'Health Professions Act, RSA 2000, c. H-7 (CRNA)'
    },
    regulatoryColleges: {
      ON: 'College of Nurses of Ontario (CNO)',
      BC: 'British Columbia College of Nurses and Midwives (BCCNM)',
      AB: 'College of Registered Nurses of Alberta (CRNA)'
    },
    mandatoryEcaDesignation: 'NNAS',
    canadianExperienceBanProtected: false, // Health regulators have statutory public safety exemptions
    estimatedLicensingDurationMonths: 24,
    estimatedTotalCostCad: 3800,
    titleRestrictionNotice: 'The titles "Nurse", "Registered Nurse", and "RPN/LPN" are legally restricted. Practicing nursing without an active provincial license is an offense under the Nursing Act. Unlicensed international nurses frequently practice as Personal Support Workers (PSWs) or Clinical Assistants while completing NNAS and NCLEX.',
    milestones: [
      { step: 1, name: 'National Nursing Assessment Service (NNAS)', details: 'Mandatory centralized national document screening. Verifies nursing education, registration history, and employment verification directly from issuing institutions.' },
      { step: 2, name: 'NNAS Advisory Report & Provincial College Application', details: 'NNAS issues Advisory Report determining whether foreign education is "Comparable", "Somewhat Comparable", or "Not Comparable" to Canadian standards.' },
      { step: 3, name: 'Language Proficiency (CELBAN or IELTS Academic)', details: 'Meet Canadian Nursing English benchmark (e.g. CELBAN Speaking 8, Listening 10, Reading 8, Writing 7 or IELTS Academic Speaking 7.0, Listening 7.5).' },
      { step: 4, name: 'NCLEX-RN Examination', details: 'Pass the national computerized adaptive nursing examination testing clinical decision-making.' },
      { step: 5, name: 'Jurisprudence Examination', details: 'Online examination on provincial nursing standards, patient consent laws, and drug administration regulations.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Personal Support Worker (PSW) / Health Care Aide', typicalSalaryCad: 48000, noc: '33102', regulatoryBarrier: 'Unregulated / Rapid 6-week bridge' },
      { role: 'Clinical Research Coordinator', typicalSalaryCad: 65000, noc: '41400', regulatoryBarrier: 'Unregulated' },
      { role: 'Medical Office Administrative Assistant', typicalSalaryCad: 46000, noc: '13112', regulatoryBarrier: 'Unregulated' },
      { role: 'Community Health Worker', typicalSalaryCad: 52000, noc: '42201', regulatoryBarrier: 'Unregulated' }
    ]
  },
  physician: {
    title: 'Physician / Medical Doctor',
    isRegulated: true,
    protectedTitle: 'Medical Doctor (MD) / Physician and Surgeon',
    statutes: {
      ON: 'Medicine Act, 1991, S.O. 1991, c. 30 (CPSO)',
      BC: 'Health Professions Act (CPSBC)',
      AB: 'Health Professions Act (CPSA)'
    },
    regulatoryColleges: {
      ON: 'College of Physicians and Surgeons of Ontario (CPSO)',
      BC: 'College of Physicians and Surgeons of British Columbia (CPSBC)',
      AB: 'College of Physicians and Surgeons of Alberta (CPSA)'
    },
    mandatoryEcaDesignation: 'MCC',
    canadianExperienceBanProtected: false,
    estimatedLicensingDurationMonths: 36,
    estimatedTotalCostCad: 7500,
    titleRestrictionNotice: 'Practicing medicine or prescribing medications without registration with the provincial College of Physicians and Surgeons is a serious criminal offense. International Medical Graduates (IMGs) must navigate the Medical Council of Canada (MCC) exams and provincial residency matching (CaRMS) or Practice Ready Assessment (PRA) programs.',
    milestones: [
      { step: 1, name: 'Medical Council of Canada (MCC) Source Verification', details: 'Submit medical diploma and transcripts to physiciansapply.ca for primary source verification through the World Directory of Medical Schools (WDOMS).' },
      { step: 2, name: 'MCCQE Part I Examination', details: 'Pass the Medical Council of Canada Qualifying Examination Part I testing medical knowledge and clinical decision-making.' },
      { step: 3, name: 'National Assessment Collaboration (NAC) OSCE', details: 'Complete the standardized clinical skills examination required for Canadian residency program applications (CaRMS).' },
      { step: 4, name: 'Postgraduate Residency Match (CaRMS) or Practice Ready Assessment (PRA)', details: 'Secure an accredited 2 to 5-year Canadian medical residency through CaRMS R-1 match, or participate in provincial PRA (e.g. CEPD in Ontario, PRA-BC in BC) for experienced family physicians.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Clinical Research Coordinator (CRC)', typicalSalaryCad: 70000, noc: '41400', regulatoryBarrier: 'Unregulated / Preferred for foreign doctors' },
      { role: 'Medical Science Liaison (MSL) in Pharma', typicalSalaryCad: 110000, noc: '21110', regulatoryBarrier: 'Unregulated / High-demand corporate role' },
      { role: 'Physician Assistant (PA)', typicalSalaryCad: 95000, noc: '31303', regulatoryBarrier: '2-year Canadian bridge program' },
      { role: 'Health Data Analyst', typicalSalaryCad: 78000, noc: '21223', regulatoryBarrier: 'Unregulated' }
    ]
  },
  pharmacist: {
    title: 'Pharmacist',
    isRegulated: true,
    protectedTitle: 'Licensed Pharmacist (R.Ph.)',
    statutes: {
      ON: 'Pharmacy Act, 1991, S.O. 1991, c. 36 (OCP)',
      BC: 'Health Professions Act (College of Pharmacists of BC)',
      AB: 'Health Professions Act (Alberta College of Pharmacy)'
    },
    regulatoryColleges: {
      ON: 'Ontario College of Pharmacists (OCP)',
      BC: 'College of Pharmacists of British Columbia (CPBC)',
      AB: 'Alberta College of Pharmacy (ACP)'
    },
    mandatoryEcaDesignation: 'PEBC',
    canadianExperienceBanProtected: false,
    estimatedLicensingDurationMonths: 24,
    estimatedTotalCostCad: 5800,
    titleRestrictionNotice: 'The Pharmacy Examining Board of Canada (PEBC) evaluates foreign pharmacy degrees. WES cannot be used for pharmacist licensure. Unlicensed pharmacists can work as Pharmacy Assistants or in pharmaceutical regulatory affairs while completing PEBC board exams.',
    milestones: [
      { step: 1, name: 'PEBC Document Evaluation', details: 'Submit foreign pharmacy transcripts, syllabus, and licensing credentials to the Pharmacy Examining Board of Canada.' },
      { step: 2, name: 'PEBC Evaluating Examination (PEBC-EE)', details: 'Pass the evaluating exam covering biomedical, pharmaceutical, and behavioral sciences.' },
      { step: 3, name: 'PEBC Qualifying Examination (Part I MCQ & Part II OSCE)', details: 'Pass the two-part national board qualification exam certifying competence to practice.' },
      { step: 4, name: 'Jurisprudence & Structured Practical Training (SPT)', details: 'Complete 500 to 1,000 hours of supervised internship under a Canadian preceptor and pass provincial pharmacy law exam.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Pharmacy Technician / Assistant', typicalSalaryCad: 52000, noc: '32124', regulatoryBarrier: 'Unregulated or shorter college diploma' },
      { role: 'Pharmaceutical Regulatory Affairs Associate', typicalSalaryCad: 78000, noc: '21110', regulatoryBarrier: 'Unregulated / High corporate demand' },
      { role: 'Clinical Data Coordinator', typicalSalaryCad: 64000, noc: '12111', regulatoryBarrier: 'Unregulated' },
      { role: 'Medical Sales Representative', typicalSalaryCad: 75000, noc: '62100', regulatoryBarrier: 'Unregulated' }
    ]
  },
  accountant: {
    title: 'Professional Accountant',
    isRegulated: true,
    protectedTitle: 'Chartered Professional Accountant (CPA)',
    statutes: {
      ON: 'Chartered Professional Accountants of Ontario Act, 2017, S.O. 2017, c. 8',
      BC: 'Chartered Professional Accountants Act, S.B.C. 2015, c. 1',
      AB: 'Chartered Professional Accountants Act, SA 2014, c. C-10.2'
    },
    regulatoryColleges: {
      ON: 'CPA Ontario',
      BC: 'CPA British Columbia',
      AB: 'CPA Alberta'
    },
    mandatoryEcaDesignation: 'WES',
    canadianExperienceBanProtected: true,
    estimatedLicensingDurationMonths: 12,
    estimatedTotalCostCad: 1900,
    titleRestrictionNotice: 'General bookkeeping, accounting, and financial reporting are UNREGULATED in Canada. Anyone can lawfully work as an Accountant, Bookkeeper, or Financial Analyst. Only audit opinions, public accounting, and the "CPA" designation are restricted by law.',
    milestones: [
      { step: 1, name: 'Transcript Evaluation & Reciprocity Audit', details: 'Check if your foreign body has a Mutual Recognition Agreement (MRA) with CPA Canada (e.g. AICPA in US, ICAEW/ICAS in UK, CA ANZ in Australia, ACCA pathway, ICAI in India via MoU).' },
      { step: 2, name: 'CPA Professional Education Program (PEP) / Bridge Modules', details: 'Complete required Canadian tax and business law modules (Taxation & Performance Management).' },
      { step: 3, name: 'Common Final Examination (CFE)', details: '3-day national comprehensive business simulation case examination (if not exempt via MRA).' },
      { step: 4, name: 'Practical Experience Requirements (PER)', details: 'Report 30 months of qualifying experience; under Ontario FARPACTA, relevant foreign accounting experience counts toward duration.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Senior Financial Analyst / Accountant', typicalSalaryCad: 88000, noc: '11100', regulatoryBarrier: 'Unregulated / Immediate hiring' },
      { role: 'Full-Charge Bookkeeper', typicalSalaryCad: 58000, noc: '12200', regulatoryBarrier: 'Unregulated' },
      { role: 'Payroll Compliance Practitioner (PCP)', typicalSalaryCad: 62000, noc: '13102', regulatoryBarrier: 'Optional NPI certification' },
      { role: 'Tax Preparation Specialist', typicalSalaryCad: 55000, noc: '14200', regulatoryBarrier: 'Unregulated / CRA EFILE registration' }
    ]
  },
  elementary_secondary_teacher: {
    title: 'Elementary / Secondary School Teacher',
    isRegulated: true,
    protectedTitle: 'Ontario Certified Teacher (OCT) / Certified Teacher',
    statutes: {
      ON: 'Ontario College of Teachers Act, 1996, S.O. 1996, c. 12',
      BC: 'Teachers Act, [SBC 2011] c. 19 (BC Teacher Regulation Branch)',
      AB: 'Education Act, SA 2012, c. E-0.3 (Alberta Teaching Authority)'
    },
    regulatoryColleges: {
      ON: 'Ontario College of Teachers (OCT)',
      BC: 'Teacher Regulation Branch (TRB)',
      AB: 'Alberta Education Professional Standards'
    },
    mandatoryEcaDesignation: 'WES',
    canadianExperienceBanProtected: true,
    estimatedLicensingDurationMonths: 12,
    estimatedTotalCostCad: 1400,
    titleRestrictionNotice: 'Teaching in publicly funded elementary and secondary schools requires provincial certification (e.g. OCT in Ontario). Teaching in private schools or tutoring centres is generally unregulated.',
    milestones: [
      { step: 1, name: 'Academic Credential Evaluation', details: 'Submit official degree and teacher education program transcripts evaluated by WES or directly by OCT/TRB.' },
      { step: 2, name: 'Statement of Professional Standing', details: 'Submit official proof of good character and teaching certification from foreign licensing authority or Ministry of Education.' },
      { step: 3, name: 'Language Benchmark & Sexual Abuse Prevention Program (SAPP)', details: 'Complete provincial language requirements (e.g. IELTS 7.0+) and mandatory online child protection module.' }
    ],
    alternativeUnlicensedCareers: [
      { role: 'Private School / Academy Instructor', typicalSalaryCad: 58000, noc: '41220', regulatoryBarrier: 'Unregulated in private sector' },
      { role: 'Instructional Designer / E-Learning Specialist', typicalSalaryCad: 75000, noc: '41402', regulatoryBarrier: 'Unregulated' },
      { role: 'Corporate Trainer & Development Facilitator', typicalSalaryCad: 70000, noc: '11200', regulatoryBarrier: 'Unregulated' },
      { role: 'ESL / LINC Adult Language Instructor', typicalSalaryCad: 52000, noc: '41221', regulatoryBarrier: 'TESL Ontario / Canada certification' }
    ]
  }
};

export const GLOBAL_CREDENTIAL_EVALUATORS = Object.freeze({
  germany_anabin: {
    authority: 'Zentralstelle für ausländisches Bildungswesen (ZAB)',
    tool: 'Anabin Database',
    criteria: 'Institution must be classified as H+ and degree recognized as equivalent to German Hochschulabschluss (essential for EU Blue Card and Chancenkarte points).',
    statutoryRef: 'AufenthG § 18b; KMK Guidelines'
  },
  australia_vetassess: {
    authority: 'VETASSESS / ACS / Engineers Australia',
    tool: 'Skills Assessment for Migration',
    criteria: 'Evaluates post-secondary qualifications and highly relevant employment against Australian and New Zealand Standard Classification of Occupations (ANZSCO).',
    statutoryRef: 'Migration Regulations 1994, Schedule 6D'
  },
  quebec_oiiq: {
    authority: 'Ordre des infirmières et infirmiers du Québec (OIIQ)',
    tool: 'Évaluation comparative & Stage d\'intégration',
    criteria: 'Requires Level 7 French proficiency under Charter of the French Language and ARM mutual recognition for French-trained nurses.',
    statutoryRef: 'Code des professions, RLRQ c. C-26; Loi sur les infirmières'
  },
  uk_ecctis: {
    authority: 'ECCTIS (formerly UK NARIC)',
    tool: 'Visas and Nationality Statement of Comparability',
    criteria: 'Certifies qualification equivalence against the UK Regulated Qualifications Framework (RQF) and Common European Framework (CEFR) English level.',
    statutoryRef: 'UK Immigration Rules Appendix Skilled Worker'
  }
});

/**
 * Assesses foreign credential recognition, regulatory body requirements,
 * FARPACTA "Canadian Experience" ban protections, and immediate alternative career bridges.
 * 
 * @param {object} input
 * @returns {object} Detailed credential pathway and licensure bridge assessment
 */
export function assessCredentialLicensure(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    candidateName = 'Candidate',
    profession = 'software_engineer',
    province = 'ON',
    yearsOfForeignExperience = 5,
    hasEca = false,
    ecaOrganization = 'WES',
    officialLanguageClb = 8,
    assessmentDate
  } = safeInput;
  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanProf = boundedText(profession, 'software_engineer', 60);
  const cleanProv = boundedText(province, 'ON', 10).toUpperCase();
  
  
  const safeDate = safeIsoDate(assessmentDate);

  const prov = cleanProv;
  const profKey = cleanProf.toLowerCase();
  const profData = REGULATED_PROFESSIONS_DIRECTORY[profKey] || REGULATED_PROFESSIONS_DIRECTORY.software_engineer;

  const safeYears = Math.max(0, Math.min(60, Number(yearsOfForeignExperience) || 0));
  const safeClb = Math.max(0, Math.min(12, Math.floor(Number(officialLanguageClb) || 0)));

  // 1. Regulatory College & Statutory Authority
  const collegeName = profData.regulatoryColleges[prov] || profData.regulatoryColleges.ON || 'Provincial Regulatory Authority';
  const statuteName = profData.statutes[prov] || profData.statutes.ON || 'Provincial Regulated Professions Act';

  // 2. Canadian Experience Ban Audit (Ontario FARPACTA s. 10.2 / BC ICRA)
  let canadianExperienceBanApplies = false;
  let canadianExperienceProtectionDetails = '';

  if (prov === 'ON' && profData.canadianExperienceBanProtected) {
    canadianExperienceBanApplies = true;
    canadianExperienceProtectionDetails = `Under the Ontario Fair Access to Regulated Professions and Compulsory Trades Act (FARPACTA), regulatory colleges like ${collegeName} are strictly prohibited from demanding "Canadian experience" as a qualification for licensure. Your ${safeYears} years of foreign experience must be evaluated without discrimination.`;
  } else if (prov === 'BC' && profData.canadianExperienceBanProtected) {
    canadianExperienceBanApplies = true;
    canadianExperienceProtectionDetails = `Under the British Columbia International Credentials Recognition Act (2023), regulatory authorities are prohibited from requiring Canadian work experience and must process foreign credential applications under statutory transparency timelines.`;
  } else if (!profData.canadianExperienceBanProtected) {
    canadianExperienceProtectionDetails = `Health-regulated professions (nursing, medicine, pharmacy) hold statutory public-safety exemptions from the blanket Canadian experience ban; supervised clinical hours or Canadian bridging programs remain standard prerequisites.`;
  } else {
    canadianExperienceProtectionDetails = `In ${prov}, standard regulatory evaluation applies. Regulators must assess substantial equivalence under provincial professional legislation.`;
  }

  // 3. ECA Compatibility Check
  const isEcaValidForProfession = hasEca && (
    profData.mandatoryEcaDesignation === 'WES'
      ? ['WES', 'ICAS', 'CES', 'IQAS'].includes(ecaOrganization.toUpperCase())
      : ecaOrganization.toUpperCase() === profData.mandatoryEcaDesignation
  );

  let ecaStatusFinding = '';
  if (!hasEca) {
    ecaStatusFinding = `You have not yet completed an Academic Credential Assessment. For ${profData.title}, the designated authority is ${profData.mandatoryEcaDesignation}.`;
  } else if (isEcaValidForProfession) {
    ecaStatusFinding = `Your ${ecaOrganization} ECA is accepted for immigration and initial credential evaluation for ${profData.title}.`;
  } else {
    ecaStatusFinding = `WARNING: Your ${ecaOrganization} ECA cannot be used for professional licensure for ${profData.title}. By law, you must use ${profData.mandatoryEcaDesignation} (e.g. general WES is not accepted for doctors or pharmacists).`;
  }

  // 4. Language Readiness Audit
  const isLanguageReady = safeClb >= 8;
  const languageFinding = isLanguageReady
    ? `Your CLB ${safeClb} meets or exceeds standard regulatory requirements for professional examination and jurisprudence comprehension.`
    : `Your CLB ${safeClb} may require enhancement. Regulated professions typically require CLB 8+ (or IELTS Academic 7.0-7.5 / CELBAN for healthcare) to sit for jurisprudence and technical board exams.`;

  // 5. Federal & Provincial Bridging Support Programs
  const fundingAndBridgingResources = [
    {
      program: 'Government of Canada Foreign Credential Recognition (FCR) Loans Program',
      coverage: 'Micro-loans from $1,500 up to $15,000 CAD at low interest rates to cover exam fees, books, credential assessments, and living costs during licensing.',
      deliveryPartner: 'Windmill Microlending / Access Employment'
    },
    {
      program: 'Provincial Bridge Training Programs (e.g. Ontario Bridge Training / BC Skills Connect)',
      coverage: 'Subsidized targeted courses connecting international professionals directly with Canadian regulatory mentors and clinical/practical placements.',
      deliveryPartner: 'Funded by IRCC & Provincial Ministries of Labour'
    }
  ];

  const statutoryAdvisories = [
    'TITLE PROTECTION IS STRICTLY ENFORCED: In Canada, using a protected professional title (like P.Eng., RN, MD, CPA) on public profiles, resumes, or client contracts without a valid provincial license constitutes statutory misrepresentation and carries fines up to $25,000.',
    'IMMEDIATE MARKET TITLES: Over 85% of foreign-trained engineers, accountants, and IT professionals work legally in Canada without a provincial license by using market titles such as "Developer", "Designer", "Analyst", or "Estimator".',
    'FARPACTA CANADIAN EXPERIENCE BAN: In Ontario (and BC), non-health regulatory bodies cannot reject your license application or demand that you work in Canada before issuing a license (FARPACTA s. 10.2). Foreign experience must be credited.',
    'KEEP OFFICIAL SEALED TRANSCRIPTS: Most regulators require university registrars to send transcripts directly or through authenticated digital platforms (e.g. Digitary, Parchment). Never open sealed envelopes yourself.'
  ];

  return {
    candidateName: cleanCandidateName,
    assessmentDate: safeDate,
    province: prov,
    professionKey: profKey,
    professionTitle: profData.title,
    isRegulatedProfession: profData.isRegulated,
    protectedTitle: profData.protectedTitle,
    regulatoryCollege: collegeName,
    governingStatute: statuteName,
    mandatoryEcaDesignation: profData.mandatoryEcaDesignation,
    hasValidEca: isEcaValidForProfession,
    ecaStatusFinding,
    canadianExperienceBanApplies,
    canadianExperienceProtectionDetails,
    titleRestrictionNotice: profData.titleRestrictionNotice,
    estimatedLicensingDurationMonths: profData.estimatedLicensingDurationMonths,
    estimatedTotalCostCad: profData.estimatedTotalCostCad,
    officialLanguageClb: safeClb,
    isLanguageReady,
    languageFinding,
    licensingMilestones: profData.milestones,
    alternativeUnlicensedCareers: profData.alternativeUnlicensedCareers,
    fundingAndBridgingResources,
    statutoryAdvisories
  };
}

export const evaluateCredentialLicensurePathway = assessCredentialLicensure;
