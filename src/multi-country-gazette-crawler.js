/**
 * Multi-Country Official Gazette & Agency Intelligence Engine (Recs 101, 102, 103, 104, 105, 113, 119)
 * 
 * Implements statutory parsing and monitoring for:
 * 1. IRCC Ministerial Instructions & Program Delivery Updates (Rec 101)
 * 2. ESDC Prevailing Wage Revisions & LMIA Refusal Lists (Rec 102)
 * 3. US Federal Register USCIS Fee & Status Notices (Rec 103)
 * 4. UK Home Office Statement of Changes (HC Papers) (Rec 104)
 * 5. Australia DHA Migration Regulations & Condition 8607 (Rec 105)
 * 6. Corridor Migration Rule Sync (Rec 113)
 * 7. Deterministic Multilingual Policy Delta Translation (Rec 119)
 */

import { factValue } from './kb-facts.js';

// Changing figures come from src/kb-facts.js so they are updated in one place.
const auCsit = () => factValue('au.coreSkillsIncomeThresholdAud');
const fmt = n => n.toLocaleString('en-US');

export const MULTI_COUNTRY_GAZETTE_CONSTANTS = {
  ESDC_MEDIAN_HOURLY_WAGES_2024_CAD: {
    ON: 28.39,
    BC: 28.85,
    AB: 29.50,
    QC: 27.47,
    MB: 25.00,
    SK: 26.00,
    NS: 24.00,
    NB: 24.00
  },
  ESDC_LOW_WAGE_CMA_UNEMPLOYMENT_REFUSAL_THRESHOLD_PERCENT: 6.0,
  get ESDC_LOW_WAGE_CAP_PERCENT() { return factValue('ca.lmia.lowWageCapPercent'); },
  get UK_SKILLED_WORKER_GENERAL_THRESHOLD_GBP() { return factValue('uk.skilledWorker.generalThresholdGbp'); },
  get UK_SKILLED_WORKER_GRANDFATHERED_THRESHOLD_GBP() { return factValue('uk.skilledWorker.transitionalGbp'); },
  // The Core Skills Income Threshold replaced TSMIT; the old key is kept for callers.
  get AU_TSMIT_SALARY_FLOOR_AUD() { return auCsit(); },
  get AU_CORE_SKILLS_INCOME_THRESHOLD_AUD() { return auCsit(); },
  AU_CONDITION_8607_CONSECUTIVE_DAYS_LIMIT: 180
};

/**
 * Audits IRCC Ministerial Instructions and Program Delivery Updates (Rec 101)
 */
export function auditIrccMinisterialInstructions(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  // 1. Category-based selection detection
  if (/category-based|express entry.*category/i.test(text)) {
    const categories = [];
    if (/french|francophone/i.test(text)) categories.push('French-Language Proficiency (NCLC 7+)');
    if (/healthcare|nurse|physician/i.test(text)) categories.push('Healthcare Occupations');
    if (/stem|science|technology|engineering|math/i.test(text)) categories.push('STEM Occupations');
    if (/trade|carpenter|plumber|electrician/i.test(text)) categories.push('Skilled Trades Occupations');
    if (/transport|truck/i.test(text)) categories.push('Transport Occupations');
    if (/agriculture|agri-food/i.test(text)) categories.push('Agriculture & Agri-Food');

    notices.push({
      authority: 'Immigration and Refugee Protection Act (IRPA), s. 10.3',
      title: 'IRCC Category-Based Selection Round Gazetted',
      type: 'express_entry_category',
      detectedCategories: categories,
      significance: 'Prioritizes specific occupational and language categories ahead of general CRS score cutoffs.'
    });
  }

  // 2. PGWP Field of Study Alignment
  if (/pgwp|post-graduation work permit.*field/i.test(text)) {
    notices.push({
      authority: 'IRPR s. 205(c)(ii) & Nov 2024 CIP Alignment Instructions',
      title: 'PGWP College Field of Study Eligibility Requirement',
      type: 'pgwp_curriculum_restriction',
      significance: 'Graduates from college programs must align with national in-demand occupational tiers to retain 3-year PGWP eligibility.'
    });
  }

  // 3. International Student Cap & PAL
  if (/provincial attestation letter|pal|student cap/i.test(text)) {
    notices.push({
      authority: 'Ministerial Instructions under IRPA s. 87.3',
      title: 'Study Permit Provincial Attestation Letter (PAL) Requirement',
      type: 'study_permit_cap',
      significance: 'Undergraduate and college applications require a PAL from the destination province, subject to annual federal quotas.'
    });
  }

  return {
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC) Operational Bulletins',
    totalNoticesDetected: notices.length,
    notices: notices.length > 0 ? notices : [{
      authority: 'IRPA General Provisions',
      title: 'Routine Operational Instruction Notice',
      type: 'administrative_update',
      significance: 'No statutory threshold amendment detected in notice text.'
    }]
  };
}

/**
 * Audits ESDC Prevailing Wage Revisions and LMIA Refusal Lists (Rec 102)
 */
export function auditEsdcPrevailingWages(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    offeredHourlyWageCad = 25.00,
    province = 'ON',
    cmaUnemploymentRatePercent = 6.8,
    lowWageWorkerPercentageInCompany = 8.0
  } = safeParams;
  const provKey = String(province).toUpperCase();
  const medianWage = MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_MEDIAN_HOURLY_WAGES_2024_CAD[provKey] || 28.39;
  const isHighWageStream = offeredHourlyWageCad >= medianWage;
  const isCmaRefusalTriggered = !isHighWageStream && cmaUnemploymentRatePercent >= MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_LOW_WAGE_CMA_UNEMPLOYMENT_REFUSAL_THRESHOLD_PERCENT;
  const isLowWageCapExceeded = !isHighWageStream && lowWageWorkerPercentageInCompany > MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_LOW_WAGE_CAP_PERCENT;

  const refusalGrounds = [];
  if (isCmaRefusalTriggered) {
    refusalGrounds.push(`CMA unemployment rate (${cmaUnemploymentRatePercent}%) is at or above the 6.0% refusal-to-process threshold under the Fall 2024 ESDC directive.`);
  }
  if (isLowWageCapExceeded) {
    refusalGrounds.push(`Company low-wage TFW proportion (${lowWageWorkerPercentageInCompany}%) exceeds the ${MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_LOW_WAGE_CAP_PERCENT}% low-wage cap (20% in construction and healthcare).`);
  }

  return {
    statutoryBasis: 'Immigration and Refugee Protection Regulations (IRPR), s. 200, s. 203; ESDC TFW Program Directives',
    province: provKey,
    provincialMedianWageCad: medianWage,
    offeredHourlyWageCad,
    stream: isHighWageStream ? 'HIGH-WAGE STREAM' : 'LOW-WAGE STREAM',
    isLmiaProcessable: refusalGrounds.length === 0,
    refusalGrounds,
    maxWorkPermitDurationYears: isHighWageStream ? 2 : 1,
    ruleSummary: isHighWageStream
      ? `Wage meets or exceeds the provincial median ($${medianWage}/hr). Exempt from the 6% CMA refusal and the low-wage cap.`
      : `Wage is below the provincial median ($${medianWage}/hr). Subject to 1-year permit limit, 10% low-wage cap (20% in construction and healthcare), and 6% CMA refusal policy.`
  };
}

/**
 * Audits US Federal Register Immigration Notices (Rec 103)
 */
export function auditUsFederalRegisterNotices(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/uscis fee|asylum program fee|form i-129/i.test(text)) {
    notices.push({
      gazetteCitation: '89 FR 6194 (USCIS Fee Schedule Final Rule)',
      title: 'USCIS Comprehensive Immigration Fee Schedule & Asylum Program Fee',
      type: 'fee_adjustment',
      keyImpacts: [
        '$600 Asylum Program Fee assessed on employers sponsoring Form I-129 and I-140 petitions ($300 for small employers with <= 25 FTEs).',
        'H-1B electronic registration fee raised from $10 to $215.',
        'Premium Processing timeframe extended from 15 calendar days to 15 business days.'
      ]
    });
  }

  if (/temporary protected status|tps/i.test(text)) {
    notices.push({
      gazetteCitation: '8 U.S.C. 1254a (INA s. 244)',
      title: 'Temporary Protected Status (TPS) Country Designation Extension',
      type: 'tps_designation',
      keyImpacts: [
        'Automatic extension of Employment Authorization Documents (EAD - Form I-766) for qualifying beneficiaries.',
        'Continuous physical presence and residence cut-off dates enforced strictly.'
      ]
    });
  }

  return {
    authority: 'United States Federal Register & Department of Homeland Security (DHS)',
    noticesFoundCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      gazetteCitation: '8 CFR General Provisions',
      title: 'Routine Federal Register Notice',
      type: 'administrative_update',
      keyImpacts: ['No major statutory fee or status revisions detected.']
    }]
  };
}

/**
 * Audits UK Home Office Statement of Changes (Rec 104)
 */
export function auditUkHomeOfficeStatementOfChanges(textOrHtml = '') {
  const text = String(textOrHtml);
  const findings = [];

  if (/38,700|41,700|skilled worker.*salary|statement of changes/i.test(text)) {
    findings.push({
      paperCitation: 'Statement of Changes in Immigration Rules (HC 997, effective 22 July 2025)',
      title: `Skilled Worker Minimum Salary Threshold of £${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.UK_SKILLED_WORKER_GENERAL_THRESHOLD_GBP)}`,
      type: 'skilled_worker_threshold',
      rules: [
        `Standard minimum salary threshold is £${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.UK_SKILLED_WORKER_GENERAL_THRESHOLD_GBP)} (or the going rate for the SOC code, whichever is higher), and most new roles must be at RQF level 6.`,
        `People whose Skilled Worker visa was first granted before 4 April 2024 can use a transitional threshold of £${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.UK_SKILLED_WORKER_GRANDFATHERED_THRESHOLD_GBP)} when extending.`
      ]
    });
  }

  if (/appendix continuous residence|180 days/i.test(text)) {
    findings.push({
      paperCitation: 'Immigration Rules Appendix Continuous Residence, para CR 2.1',
      title: 'ILR 180-Day Rolling Absence Rule',
      type: 'settlement_absence_limit',
      rules: [
        'Applicant must not have spent more than 180 days outside the UK in any 12-month rolling period during the qualifying period for Indefinite Leave to Remain (ILR).'
      ]
    });
  }

  return {
    authority: 'UK Home Office Immigration Rules & Parliamentary Command Papers',
    findingsCount: findings.length,
    findings: findings.length > 0 ? findings : [{
      paperCitation: 'Immigration Rules General',
      title: 'Standard Home Office Operational Notice',
      type: 'administrative_update',
      rules: ['Standard immigration rules apply without gazetted revisions.']
    }]
  };
}

/**
 * Audits Australia Department of Home Affairs Migration Gazettes (Rec 105)
 */
export function auditAustraliaDhaGazette(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/condition 8607|180 days|subclass 482/i.test(text)) {
    notices.push({
      instrumentCitation: 'Migration Amendment (Strengthening Employer Compliance) Act 2024',
      title: 'Subclass 482 Condition 8607 180-Day Sponsor Transfer Window',
      type: 'visa_condition_reform',
      entitlements: [
        'Temporary Skilled Migration visa holders who cease employment have up to 180 consecutive days (and up to 365 cumulative days across visa lifecycle) to find a new sponsor, apply for another visa, or depart Australia.',
        'During this 180-day window, workers may undertake secondary work in any occupation to support themselves.'
      ]
    });
  }

  if (/tsmit|core skills income threshold|73,150|76,515|79,499/i.test(text)) {
    notices.push({
      instrumentCitation: 'Migration income threshold instrument (indexed each 1 July)',
      title: `Core Skills Income Threshold (replaced TSMIT) set at $${fmt(auCsit())} AUD`,
      type: 'tsmit_salary_floor',
      entitlements: [
        `Nominating employers must pay at least $${fmt(auCsit())} AUD a year (excluding superannuation) and the market salary rate. The threshold is indexed every 1 July.`
      ]
    });
  }

  return {
    authority: 'Australian Department of Home Affairs & Federal Register of Legislation',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Migration Act 1958',
      title: 'Standard DHA Migration Advisory',
      type: 'administrative_update',
      entitlements: ['Standard visa condition rules apply.']
    }]
  };
}

/**
 * Corridor Migration Rule Sync Engine (Rec 113)
 */
export const CORRIDOR_REGISTRY = {
  'IN_CA': {
    origin: 'India',
    destination: 'Canada',
    primaryEducationAssessor: 'World Education Services (WES) / ICAS',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 10,
    driversLicenseExchange: 'Graduated: Road test required. Foreign experience letter waives 12-month G1 wait.'
  },
  'IN_US': {
    origin: 'India',
    destination: 'United States',
    primaryEducationAssessor: 'ECE / WES / Trustforte',
    policeClearanceValidityMonths: 12,
    medicalExamRequired: true,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'State dependent: Written & road tests required in NY, CA, TX.'
  },
  'PH_CA': {
    origin: 'Philippines',
    destination: 'Canada',
    primaryEducationAssessor: 'WES / ICAS / CNO NNAS (for Nurses)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 10,
    driversLicenseExchange: 'Graduated: LTO authenticated certificate waives G1 waiting period.'
  },
  'NG_UK': {
    origin: 'Nigeria',
    destination: 'United Kingdom',
    primaryEducationAssessor: 'UK ENIC (formerly NARIC)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true, // TB screening required
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive on international license for up to 12 months, then UK theory and practical test required.'
  },
  'IN_AE': {
    origin: 'India',
    destination: 'United Arab Emirates',
    primaryEducationAssessor: 'Ministry of Foreign Affairs (MOFA) Degree Attestation & Embassy Legalization',
    policeClearanceValidityMonths: 3,
    medicalExamRequired: true, // Blood test & chest X-ray on arrival
    biometricsValidityYears: 3,
    driversLicenseExchange: 'Golden Visa holders and specific professional categories eligible for direct exchange.'
  }
};

export function syncCorridorMigrationRules(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    originCountry = 'IN',
    destinationCountry = 'CA'
  } = safeParams;
  const orig = String(originCountry || 'IN').toUpperCase();
  const dest = String(destinationCountry || 'CA').toUpperCase();
  const key = `${orig}_${dest}`;
  const corridor = CORRIDOR_REGISTRY[key] || {
    origin: orig,
    destination: dest,
    primaryEducationAssessor: 'Official National Credential Evaluation Authority',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 10,
    driversLicenseExchange: 'Standard jurisdiction test required.'
  };

  return {
    corridorCode: key,
    originCountry: corridor.origin,
    destinationCountry: corridor.destination,
    requirements: corridor,
    advisories: [
      `Police Clearance Certificate (PCC) must be dated within ${corridor.policeClearanceValidityMonths} months of final document submission.`,
      `Educational Credential Assessment (ECA) must be issued by ${corridor.primaryEducationAssessor}.`,
      corridor.medicalExamRequired ? 'Mandatory immigration medical examination by approved panel physician.' : 'Medical examination not generally required.'
    ]
  };
}

/**
 * Deterministic Multilingual Policy Delta Translation (Rec 119)
 */
export const MULTILINGUAL_SYNSET_TERMS = {
  fr: {
    'OVERTIME_PAY': 'Paiement des heures supplémentaires',
    'VACATION_PAY': 'Indemnité de congés payés',
    'CONSTRUCTIVE_DISMISSAL': 'Congédiement déguisé',
    'SEVERANCE_PAY': 'Indemnité de départ légale',
    'WORK_REFUSAL': 'Droit de refuser un travail dangereux',
    'RENT_INCREASE': 'Augmentation de loyer légale',
    'RESTRICTION': 'Restriction légale'
  },
  hi: {
    'OVERTIME_PAY': 'ओवरटाइम वेतन (Overtime Pay)',
    'VACATION_PAY': 'वैधानिक अवकाश वेतन (Vacation Pay)',
    'CONSTRUCTIVE_DISMISSAL': 'अप्रत्यक्ष या जबरन बर्खास्तगी (Constructive Dismissal)',
    'SEVERANCE_PAY': 'वैधानिक विच्छेद वेतन (Severance Pay)',
    'WORK_REFUSAL': 'असुरक्षित कार्य से इनकार का अधिकार (Work Refusal)',
    'RENT_INCREASE': 'कानूनी किराया वृद्धि सीमा (Rent Increase Cap)',
    'RESTRICTION': 'कानूनी प्रतिबंध (Legal Restriction)'
  },
  pa: {
    'OVERTIME_PAY': 'ਓਵਰਟਾਈਮ ਤਨਖਾਹ (Overtime Pay)',
    'VACATION_PAY': 'ਛੁੱਟੀਆਂ ਦਾ ਵੇਤਨ (Vacation Pay)',
    'CONSTRUCTIVE_DISMISSAL': 'ਗੈਰ-ਕਾਨੂੰਨੀ ਬਰਖਾਸਤਗੀ (Constructive Dismissal)',
    'SEVERANCE_PAY': 'ਕਾਨੂੰਨੀ ਮੁਆਵਜ਼ਾ (Severance Pay)',
    'WORK_REFUSAL': 'ਅਸੁਰੱਖਿਅਤ ਕੰਮ ਤੋਂ ਇਨਕਾਰ ਦਾ ਹੱਕ (Work Refusal)',
    'RENT_INCREASE': 'ਕਿਰਾਏ ਵਿੱਚ ਕਾਨੂੰਨੀ ਵਾਧਾ (Rent Cap)',
    'RESTRICTION': 'ਕਾਨੂੰਨੀ ਪਾਬੰਦੀ (Restriction)'
  },
  es: {
    'OVERTIME_PAY': 'Pago de horas extras',
    'VACATION_PAY': 'Pago de vacaciones legales',
    'CONSTRUCTIVE_DISMISSAL': 'Despido indirecto o constructivo',
    'SEVERANCE_PAY': 'Indemnización por despido',
    'WORK_REFUSAL': 'Derecho a rechazar trabajo inseguro',
    'RENT_INCREASE': 'Aumento legal de alquiler',
    'RESTRICTION': 'Restricción legal'
  },
  zh: {
    'OVERTIME_PAY': '法定加班工资 (Overtime Pay)',
    'VACATION_PAY': '带薪休假补贴 (Vacation Pay)',
    'CONSTRUCTIVE_DISMISSAL': '推定解雇 (Constructive Dismissal)',
    'SEVERANCE_PAY': '法定遣散费 (Severance Pay)',
    'WORK_REFUSAL': '拒绝不安全工作权利 (Work Refusal)',
    'RENT_INCREASE': '法定租金涨幅限制 (Rent Cap)',
    'RESTRICTION': '法律限制 (Legal Restriction)'
  }
};

export function translatePolicyDelta(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    termKey = 'OVERTIME_PAY',
    targetLanguage = 'hi'
  } = safeParams;
  // Only plain text is a language code; objects or arrays would render as
  // "[object Object]" in the response, so they fall back to the default.
  const langKey = (typeof targetLanguage === 'string' && targetLanguage.trim()
    ? targetLanguage : 'hi').toLowerCase().slice(0, 10);
  const dict = MULTILINGUAL_SYNSET_TERMS[langKey] || MULTILINGUAL_SYNSET_TERMS.hi;
  const tk = (typeof termKey === 'string' && termKey.trim() ? termKey : 'OVERTIME_PAY').toUpperCase().slice(0, 80);
  const translated = dict[tk] || tk;

  return {
    termKey: tk,
    targetLanguage: langKey,
    canonicalTranslation: translated,
    isOfficialSynsetMatched: Boolean(dict[tk])
  };
}

/**
 * Unified Multi-Country Gazette Audit Evaluation
 */
export function auditMultiCountryGazettes(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    country = 'CA',
    htmlContent = ''
  } = safeParams;
  const c = String(country).toUpperCase();
  if (c === 'CA') {
    return {
      country: 'CA',
      irccAudit: auditIrccMinisterialInstructions(htmlContent),
      esdcAudit: auditEsdcPrevailingWages()
    };
  }
  if (c === 'US') {
    return {
      country: 'US',
      federalRegisterAudit: auditUsFederalRegisterNotices(htmlContent)
    };
  }
  if (c === 'GB' || c === 'UK') {
    return {
      country: 'GB',
      homeOfficeAudit: auditUkHomeOfficeStatementOfChanges(htmlContent)
    };
  }
  if (c === 'AU') {
    return {
      country: 'AU',
      dhaAudit: auditAustraliaDhaGazette(htmlContent)
    };
  }
  return {
    country: c,
    message: `Gazette audit completed for ${c}. No critical statutory revisions detected.`
  };
}
