// src/credential-navigator.js
// Statutory Foreign Credential Recognition (FCR), ECA & Regulated Profession Pathways Engine.
// Enforces Fair Access to Regulated Professions and Compulsory Trades Act (FARPAA),
// Ontario Bill 27 (Working for Workers Act, 2021) "Canadian Experience" Ban,
// and BC International Credentials Recognition Act (2023).
// Pure ES module with zero npm dependencies.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ECA_ORGANIZATIONS = {
  wes: {
    code: 'WES',
    name: 'World Education Services Canada',
    designatedBy: 'IRCC for Express Entry & Provincial Nominee Programs',
    coverage: 'General academic degrees (Bachelors, Masters, PhD, Post-grad diplomas)',
    estimatedFeeCad: 248,
    timelineWeeks: '5 to 7 weeks once all official transcripts are received',
    deliveryMethod: 'Electronic secure transmission from university registrar or postal mail',
    validityYears: 5,
    website: 'https://www.wes.org/ca/'
  },
  icas: {
    code: 'ICAS',
    name: 'International Credential Assessment Service of Canada',
    designatedBy: 'IRCC & Ontario College of Teachers (OCT)',
    coverage: 'Comprehensive elementary, secondary, and post-secondary comparative evaluations',
    estimatedFeeCad: 210,
    timelineWeeks: '20 to 26 weeks',
    deliveryMethod: 'Official transcripts sent directly from issuing institution',
    validityYears: 5,
    website: 'https://www.icascanada.ca/'
  },
  ces: {
    code: 'CES',
    name: 'Comparative Education Service (University of Toronto School of Continuing Studies)',
    designatedBy: 'IRCC & Professional regulatory bodies',
    coverage: 'General academic evaluations for immigration and licensing',
    estimatedFeeCad: 210,
    timelineWeeks: '10 to 12 weeks',
    deliveryMethod: 'Direct electronic verification or official physical transcripts',
    validityYears: 5,
    website: 'https://learn.utoronto.ca/comparative-education-service'
  },
  mcc: {
    code: 'MCC',
    name: 'Medical Council of Canada (physiciansapply.ca)',
    designatedBy: 'IRCC & Provincial Colleges of Physicians and Surgeons (CPSO, CPSBC, CPSA)',
    coverage: 'Mandatory medical diploma source verification (ECA) for all international medical graduates (IMGs)',
    estimatedFeeCad: 340,
    timelineWeeks: '8 to 12 weeks for source verification with foreign medical school',
    deliveryMethod: 'Source verification directly with World Directory of Medical Schools (WDOMS)',
    validityYears: 5,
    website: 'https://physiciansapply.ca/'
  },
  pebc: {
    code: 'PEBC',
    name: 'Pharmacy Examining Board of Canada',
    designatedBy: 'IRCC & Provincial Pharmacy Regulatory Authorities (OCP, CPBC, ACP)',
    coverage: 'Mandatory Document Evaluation & ECA for internationally educated pharmacists',
    estimatedFeeCad: 735,
    timelineWeeks: '8 to 12 weeks for document evaluation',
    deliveryMethod: 'Direct university transcripts + licensing authority good standing certificate',
    validityYears: 5,
    website: 'https://www.pebc.ca/'
  },
  nnas: {
    code: 'NNAS',
    name: 'National Nursing Assessment Service',
    designatedBy: 'Provincial Nursing Regulators (CNO, BCCNM, CRNA)',
    coverage: 'Mandatory harmonized assessment for International Educated Nurses (IENs - RN, RPN, LPN)',
    estimatedFeeCad: 885,
    timelineWeeks: '12 to 16 weeks after receipt of all secondary forms',
    deliveryMethod: 'Official academic syllabus, licensing history, and employment verification directly from source',
    validityYears: 2,
    website: 'https://www.nnas.ca/'
  }
};

export const REGULATED_PROFESSIONS = {
  engineering: {
    id: 'engineering',
    title: 'Professional Engineer (P.Eng)',
    titleProtected: true,
    regulators: {
      ON: {
        body: 'Professional Engineers Ontario (PEO)',
        statute: 'Professional Engineers Act (R.S.O. 1990, c. P.28)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'Working for Workers Act, 2021 (Bill 27) & FARPAA s. 10.2'
      },
      BC: {
        body: 'Engineers and Geoscientists British Columbia (EGBC)',
        statute: 'Professional Governance Act (S.B.C. 2018, c. 47)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'BC International Credentials Recognition Act (2023)'
      },
      AB: {
        body: 'Association of Professional Engineers and Geoscientists of Alberta (APEGA)',
        statute: 'Engineering and Geoscience Professions Act (RSA 2000, c. E-11)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'Alberta Fair Registration Practices Act (2019)'
      }
    },
    defaultEca: 'wes',
    phases: [
      {
        step: 1,
        title: 'Academic Qualification Assessment',
        feeEstimateCad: 360,
        duration: '6 to 12 weeks',
        statutoryRequirement: 'Under CEAB benchmark standards, evaluate degree for Washington Accord equivalency or assign technical exams.',
        actions: [
          'Submit WES course-by-course or direct university syllabus to the provincial engineering regulator.',
          'Graduates of Washington Accord accredited programs generally have academic requirements waived.',
          'Non-accord graduates may be assigned 1 to 4 Confirmatory Engineering Exams or FE Exam.'
        ]
      },
      {
        step: 2,
        title: 'Competency-Based Assessment (CBA)',
        feeEstimateCad: 300,
        duration: '8 to 16 weeks',
        statutoryRequirement: 'Demonstrate 48 months of engineering experience satisfying 34 specific competencies across 7 categories.',
        actions: [
          'IMPORTANT STATUTORY BAN: Under Bill 27 / FARPAA, the regulator CANNOT require any Canadian work experience.',
          'All 48 months of qualifying engineering experience can be foreign experience gained in your home country.',
          'Have your CBA competencies validated by professional engineer validators (can be foreign supervisors).'
        ]
      },
      {
        step: 3,
        title: 'National Professional Practice Exam (NPPE)',
        feeEstimateCad: 220,
        duration: '2 to 3 months (scheduled 5 times annually)',
        statutoryRequirement: '110 multiple-choice exam testing Canadian engineering law, ethics, professional liability, and occupational health & safety.',
        actions: [
          'Study Canadian Professional Engineering and Geoscience: Practice and Ethics by Gordon C. Andrews.',
          'Achieve scaled passing score of 65% on the proctored computerized NPPE.'
        ]
      }
    ]
  },
  nursing: {
    id: 'nursing',
    title: 'Registered Nurse (RN) / Registered Practical Nurse (RPN)',
    titleProtected: true,
    regulators: {
      ON: {
        body: 'College of Nurses of Ontario (CNO)',
        statute: 'Nursing Act, 1991 (S.O. 1991, c. 32)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CNO Supervised Practice Experience Partnership (SPEP) & FARPAA'
      },
      BC: {
        body: 'British Columbia College of Nurses and Midwives (BCCNM)',
        statute: 'Health Professions Act (RSBC 1996, c. 183)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'BC Subsidized NCLEX Pilot & International Credentials Recognition Act'
      },
      AB: {
        body: 'College of Registered Nurses of Alberta (CRNA)',
        statute: 'Health Professions Act (RSA 2000, c. H-7)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CRNA Fast-Track Substantially Equivalent Assessment'
      }
    },
    defaultEca: 'nnas',
    phases: [
      {
        step: 1,
        title: 'National Nursing Assessment Service (NNAS) Advisory Report',
        feeEstimateCad: 885,
        duration: '3 to 6 months',
        statutoryRequirement: 'Standardized national credential evaluation verifying nursing education comparability, syllabus hours, and foreign registration.',
        actions: [
          'Create NNAS account and submit nursing school curriculum breakdown with theory and clinical practicum hours.',
          'Submit primary identity documents and official verification of foreign nursing license in good standing.',
          'Receive NNAS Advisory Report designating your education as "Somewhat Comparable" or "Substantially Equivalent".'
        ]
      },
      {
        step: 2,
        title: 'Provincial Regulatory Registration & Jurisprudence',
        feeEstimateCad: 350,
        duration: '1 to 3 months',
        statutoryRequirement: 'Apply directly to the provincial nursing college (CNO/BCCNM/CRNA) and complete online jurisprudence exam.',
        actions: [
          'Complete Provincial Nursing Jurisprudence Exam testing provincial mental health act, consent, and confidentiality statutes.',
          'Meet language proficiency benchmark (CELBAN or IELTS Academic: Listening 7.5, Reading 6.5, Writing 7.0, Speaking 7.0).'
        ]
      },
      {
        step: 3,
        title: 'NCLEX-RN Licensing Examination & Registration',
        feeEstimateCad: 420,
        duration: 'Immediate upon exam pass',
        statutoryRequirement: 'National Council Licensure Examination for Registered Nurses administered by Pearson VUE.',
        actions: [
          'Take computerized adaptive NCLEX-RN test (85 to 150 questions testing clinical decision-making).',
          'In Ontario, if clinical experience gap exists, qualify for paid Supervised Practice Experience Partnership (SPEP) funded by the Ministry of Health.'
        ]
      }
    ]
  },
  medicine: {
    id: 'medicine',
    title: 'Physician / Medical Doctor (MD)',
    titleProtected: true,
    regulators: {
      ON: {
        body: 'College of Physicians and Surgeons of Ontario (CPSO)',
        statute: 'Medicine Act, 1991 (S.O. 1991, c. 30)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'Ontario Practice Ready Assessment (PRA) & CPSO Alternative Pathways'
      },
      BC: {
        body: 'College of Physicians and Surgeons of British Columbia (CPSBC)',
        statute: 'Health Professions Act (RSBC 1996, c. 183)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'Practice Ready Assessment BC (PRA-BC)'
      },
      AB: {
        body: 'College of Physicians & Surgeons of Alberta (CPSA)',
        statute: 'Health Professions Act (RSA 2000, c. H-7)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CPSA Accelerated Route for Approved Corridors'
      }
    },
    defaultEca: 'mcc',
    phases: [
      {
        step: 1,
        title: 'Source Verification & MCCQE Part 1 Exam',
        feeEstimateCad: 1750,
        duration: '4 to 6 months',
        statutoryRequirement: 'Verify primary medical qualification via World Directory of Medical Schools (WDOMS) on physiciansapply.ca and pass MCCQE1.',
        actions: [
          'Open physiciansapply.ca account and submit medical diploma for Electronic Credential Verification (ECA).',
          'Prepare and sit the Medical Council of Canada Qualifying Examination Part 1 (210 multiple-choice and 38 clinical decision-making cases).'
        ]
      },
      {
        step: 2,
        title: 'National Assessment Collaboration (NAC) OSCE',
        feeEstimateCad: 3200,
        duration: 'Offered twice annually (May and September)',
        statutoryRequirement: '10 to 12 station clinical objective structured clinical examination evaluating clinical skills and doctor-patient interaction in Canada.',
        actions: [
          'Pass NAC OSCE exam to qualify for Canadian Residency Matching Service (CaRMS) or Practice Ready Assessment (PRA).',
          'Benchmark score for residency eligibility across family medicine and specialty disciplines.'
        ]
      },
      {
        step: 3,
        title: 'Practice Ready Assessment (PRA) or CaRMS Residency Match',
        feeEstimateCad: 1000,
        duration: '12 weeks clinical assessment (PRA) or 2 to 5 years (Residency)',
        statutoryRequirement: 'Complete supervised clinical field assessment to grant independent provincial medical license.',
        actions: [
          'For experienced foreign doctors (e.g. 2+ years independent practice), apply for Practice Ready Assessment (PRA-Ontario, PRA-BC, or Alberta Pre-Call).',
          'Commit to return-of-service (ROS) agreement in an underserviced rural or northern community in exchange for provisional licensing.'
        ]
      }
    ]
  },
  accounting: {
    id: 'accounting',
    title: 'Chartered Professional Accountant (CPA)',
    titleProtected: true,
    regulators: {
      ON: {
        body: 'Chartered Professional Accountants of Ontario (CPA Ontario)',
        statute: 'Chartered Professional Accountants of Ontario Act, 2017 (S.O. 2017, c. 8)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CPA International Reciprocal & Competency Recognition'
      },
      BC: {
        body: 'Chartered Professional Accountants of British Columbia (CPABC)',
        statute: 'Chartered Professional Accountants Act (SBC 2015, c. 1)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CPABC International MRA / RMA Pathways'
      },
      AB: {
        body: 'Chartered Professional Accountants of Alberta (CPA Alberta)',
        statute: 'Chartered Professional Accountants Act (SA 2014, c. C-10.2)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'CPA Western School of Business (CPAWSB)'
      }
    },
    defaultEca: 'wes',
    phases: [
      {
        step: 1,
        title: 'Transcript Evaluation & Mutual Recognition (MRA/RMA)',
        feeEstimateCad: 250,
        duration: '4 to 8 weeks',
        statutoryRequirement: 'Evaluation of foreign accounting degree or reciprocal recognition for designated international bodies.',
        actions: [
          'CHECK RECIPROCAL AGREEMENTS: If you hold ICAEW (UK), AICPA (USA), CA ANZ (Australia), or CPA Australia, qualify for fast-track direct reciprocity.',
          'If holding ICAI (India) or ACCA (UK), follow the specialized Memorandum of Understanding (MOU) pathway with advanced standing into Capstone 1/2.',
          'Submit official transcripts to provincial CPA body for prerequisite subject-by-subject mapping.'
        ]
      },
      {
        step: 2,
        title: 'CPA Professional Education Program (PEP) / Capstone',
        feeEstimateCad: 1400,
        duration: '4 to 12 months',
        statutoryRequirement: 'Complete remaining prerequisite core/elective modules and Capstone integrative case study.',
        actions: [
          'Complete Capstone 1 (team case integration) and Capstone 2 (intensive exam preparation).',
          'Reciprocal MRA holders are generally exempt from PEP modules.'
        ]
      },
      {
        step: 3,
        title: 'Common Final Examination (CFE) & Practical Experience',
        feeEstimateCad: 1500,
        duration: '3-day examination + 30 months qualifying experience',
        statutoryRequirement: 'Rigorous 3-day case examination demonstrating technical competence and ethical reasoning.',
        actions: [
          'Sit the 3-day national CFE exam (Day 1: Comprehensive case; Day 2: Role specialty; Day 3: Multi-subject cases).',
          'Document 30 months of practical experience through Experience Verification Route (EVR) or Pre-Approved Program (PPR).'
        ]
      }
    ]
  },
  teaching: {
    id: 'teaching',
    title: 'Certified Elementary / Secondary Teacher (OCT / BC Teacher)',
    titleProtected: true,
    regulators: {
      ON: {
        body: 'Ontario College of Teachers (OCT)',
        statute: 'Ontario College of Teachers Act, 1996 (S.O. 1996, c. 12)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'OCT Regulation 176/10 & FARPAA'
      },
      BC: {
        body: 'BC Ministry of Education and Child Care — Teacher Regulation Branch (TRB)',
        statute: 'Teachers Act (SBC 2011, c. 19)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'BC International Credentials Recognition Act'
      },
      AB: {
        body: 'Alberta Education — Teaching and Leadership Excellence',
        statute: 'Education Act (SA 2012, c. E-0.3)',
        canadianExperienceRequired: false,
        canadianExperienceStatute: 'Alberta Interim Professional Certificate'
      }
    },
    defaultEca: 'icas',
    phases: [
      {
        step: 1,
        title: 'Academic & Teacher Education Evaluation',
        feeEstimateCad: 350,
        duration: '3 to 5 months',
        statutoryRequirement: 'Verification of minimum 3 or 4-year undergraduate degree PLUS a recognized 1 or 2-year teacher education program.',
        actions: [
          'Order ICAS or WES teaching-specific evaluation (in Ontario, OCT evaluates foreign university transcripts directly).',
          'Ensure foreign teacher education includes at least 80 days of supervised student teaching / practicum.',
          'Obtain official statement of professional standing from the Ministry or Board of Education in your home jurisdiction.'
        ]
      },
      {
        step: 2,
        title: 'Language Proficiency & Criminal Record Check',
        feeEstimateCad: 320,
        duration: '1 to 2 months',
        statutoryRequirement: 'Demonstrate French or English fluency (TOEFL iBT / IELTS Academic) and clean Vulnerable Sector Check (VSC).',
        actions: [
          'Provide Canadian Police Information Centre (CPIC) Vulnerable Sector Screening via local police service.',
          'Provide official language proficiency scores if your teacher education was not completed in English or French.'
        ]
      },
      {
        step: 3,
        title: 'Certificate of Qualification and Registration',
        feeEstimateCad: 200,
        duration: 'Issued upon document satisfaction',
        statutoryRequirement: 'Grant of standard provincial teacher certificate with designated subject/division teaching qualifications.',
        actions: [
          'Receive Certificate of Qualification and Registration (CQR) allowing you to be hired by publicly funded school boards (TDSB, PDSB, YRDSB, VSB).',
          'Complete Ontario Math Proficiency Test (MPT) if required by regulation for elementary panel certification.'
        ]
      }
    ]
  }
};

/**
 * Assesses foreign credentials and generates step-by-step statutory licensing roadmap.
 * 
 * @param {object} params
 * @param {string} [params.profession='engineering'] - 'engineering', 'nursing', 'medicine', 'accounting', 'teaching'
 * @param {string} [params.targetProvince='ON'] - 'ON', 'BC', 'AB'
 * @param {string} [params.originCountry='India']
 * @param {string} [params.currentDegree='Bachelors']
 * @returns {object} Comprehensive statutory credential recognition roadmap
 */
export function evaluateCredentialPathway(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    profession = 'engineering',
    targetProvince = 'ON',
    originCountry = 'India',
    currentDegree = 'Bachelors',
    candidateName = 'Candidate',
    assessmentDate = todayIso()
  } = safeParams;
  const safeCandidateName = boundedText(candidateName, 'Candidate', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const profKey = boundedText(profession, 'engineering', 50).toLowerCase();
  const provCode = boundedText(targetProvince, 'ON', 10).toUpperCase();
  const validProv = ['ON', 'BC', 'AB'].includes(provCode) ? provCode : 'ON';
  const origin = boundedText(originCountry, 'India', 60);
  const degree = boundedText(currentDegree, 'Bachelors', 60);

  const profConfig = REGULATED_PROFESSIONS[profKey] || REGULATED_PROFESSIONS.engineering;
  const regulator = profConfig.regulators[validProv] || profConfig.regulators.ON;
  const ecaKey = profConfig.defaultEca || 'wes';
  const designatedEca = ECA_ORGANIZATIONS[ecaKey] || ECA_ORGANIZATIONS.wes;

  const totalEstimatedGovExamFeesCad = profConfig.phases.reduce((sum, p) => sum + p.feeEstimateCad, 0) + designatedEca.estimatedFeeCad;

  // Canadian experience ban evaluation
  const canadianExperiencePolicy = {
    mandatoryCanadianExperienceRequired: regulator.canadianExperienceRequired,
    statutoryProtection: regulator.canadianExperienceStatute,
    legalCitation: regulator.statute,
    advisory: regulator.canadianExperienceRequired
      ? 'A domestic supervised clinical or internship period is mandated by statute.'
      : `PROTECTED BY LAW: Under ${regulator.canadianExperienceStatute}, ${regulator.body} is legally prohibited from requiring Canadian work experience. Your foreign skilled experience is fully credited toward licensing competencies.`
  };

  const financialAssistance = {
    fcrLoansAvailable: true,
    loanAmountRange: '$15,000 to $30,000 CAD',
    loanPartners: [
      'Windmill Microlending (Low-interest immigrant micro-loans for exam fees, licensing & living expenses)',
      'SEED Winnipeg / Access Community Capital Fund'
    ],
    taxDeductibility: 'Examination and licensing fees for professional titles qualify as eligible tuition tax credits under Income Tax Act s. 118.5(1)(d).'
  };

  const statutoryWarnings = [
    'Title Protection: In Canada, practicing or using a protected professional title (e.g. "P.Eng", "Registered Nurse", "MD", "CPA") without a valid license from the provincial regulator constitutes a provincial regulatory offence punishable by statutory fines up to $25,000.',
    'Official Transcripts: Never open official sealed university transcripts or notarize personal copies. Canadian regulatory colleges and ECA bodies strictly require direct institutional dispatch (electronic registrar-to-registrar or sealed institutional envelope).',
    'Language Test Expiration: IELTS Academic / CELBAN results are valid for 2 years. Coordinate your test timing with your regulator application so results do not expire before file review.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    candidateName: safeCandidateName,
    profession: profConfig.title,
    professionKey: profConfig.id,
    targetProvince: validProv,
    originCountry: origin,
    currentDegree: degree,
    regulatoryBody: regulator.body,
    statute: regulator.statute,
    canadianExperiencePolicy,
    designatedEca,
    phases: profConfig.phases,
    financialAssistance,
    estimatedTotalCostCad: totalEstimatedGovExamFeesCad,
    statutoryWarnings,
    authority: 'Fair Access to Regulated Professions and Compulsory Trades Act, 2006 (FARPAA) & Provincial Professional Acts'
  };
}
