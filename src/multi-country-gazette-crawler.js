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
  AU_CONDITION_8607_CONSECUTIVE_DAYS_LIMIT: 180,

  // Germany (DE) - Mindestlohngesetz, AufenthG, BGB
  DE_MINIMUM_WAGE_HOURLY_EUR: 12.82,
  DE_EU_BLUE_CARD_GENERAL_ANNUAL_EUR: 45300,
  DE_EU_BLUE_CARD_SHORTAGE_ANNUAL_EUR: 41041,
  DE_MIETPREISBREMSE_MAX_MARKET_SURCHARGE_PERCENT: 10.0,
  DE_MAX_RENTAL_DEPOSIT_MONTHS: 3,

  // United Arab Emirates (UAE) - MOHRE, ICP, RERA Decree 43
  UAE_GOLDEN_VISA_MONTHLY_SALARY_AED: 30000,
  UAE_GOLDEN_VISA_PROPERTY_INVESTMENT_AED: 2000000,
  UAE_RERA_RENT_INCREASE_TIERS: Object.freeze([
    { minBelowMarketPercent: 11, maxBelowMarketPercent: 20, maxIncreasePercent: 5 },
    { minBelowMarketPercent: 21, maxBelowMarketPercent: 30, maxIncreasePercent: 10 },
    { minBelowMarketPercent: 31, maxBelowMarketPercent: 40, maxIncreasePercent: 15 },
    { minBelowMarketPercent: 41, maxBelowMarketPercent: Infinity, maxIncreasePercent: 20 }
  ]),

  // New Zealand (NZ) - Minimum Wage Act, AEWV, Residential Tenancies Act
  NZ_ADULT_MINIMUM_WAGE_HOURLY_NZD: 23.15,
  NZ_AEWV_MEDIAN_WAGE_HOURLY_NZD: 31.61,
  NZ_MAX_TENANCY_BOND_WEEKS: 4,

  // France (FR) - Code du travail, Loi ALUR, Passeport Talent
  FR_SMIC_HOURLY_EUR: 11.65,
  FR_SMIC_MONTHLY_GROSS_EUR: 1766.92,
  FR_PASSEPORT_TALENT_SALARY_FLOOR_EUR: 42406.08,
  FR_MAX_SECURITY_DEPOSIT_UNFURNISHED_MONTHS: 1,
  FR_MAX_SECURITY_DEPOSIT_FURNISHED_MONTHS: 2,

  // Ireland (IE) - National Minimum Wage Act, DETE CSEP, RTB RPZ
  IE_NATIONAL_MINIMUM_WAGE_HOURLY_EUR: 12.70,
  IE_CSEP_MINIMUM_SALARY_EUR: 38000,
  IE_RPZ_MAX_ANNUAL_RENT_INCREASE_PERCENT: 2.0,

  // Netherlands (NL) - Wet minimumloon, WWS, IND Kennismigrant
  NL_STATUTORY_MINIMUM_WAGE_HOURLY_EUR: 13.27,
  NL_30_PERCENT_RULING_ANNUAL_TAXABLE_EUR: 46107,
  NL_RENT_LIBERALIZATION_THRESHOLD_EUR: 879.66,

  // Singapore (SG) - MOM Employment of Foreign Manpower Act, IMDA
  SG_EP_QUALIFYING_SALARY_MONTHLY_SGD: 5000,
  SG_SPASS_QUALIFYING_SALARY_MONTHLY_SGD: 3150,
  SG_MAX_PREPAID_SIM_PER_SUBSCRIBER: 3,

  // Spain (ES) - Real Decreto 145/2024 (SMI), LAU, IRPF Beckham Law
  ES_SMI_MONTHLY_EUR_14_PAYMENTS: 1134,
  ES_SMI_MONTHLY_EUR_12_PAYMENTS: 1323,
  ES_BECKHAM_LAW_FLAT_TAX_RATE_PERCENT: 24.0,
  ES_LAU_MAX_RESIDENTIAL_DEPOSIT_MONTHS: 1,

  // Sweden (SE) - Utlänningslagen, Migrationsverket, Hyreslagen
  SE_WORK_PERMIT_MINIMUM_MONTHLY_SEK: 28480,
  SE_EU_BLUE_CARD_MINIMUM_MONTHLY_SEK: 59850,
  SE_MAX_SUBLET_SURCHARGE_FURNISHED_PERCENT: 15.0,

  // United States (US) - FLSA, California AB 1482, New York HSTPA
  US_FEDERAL_MINIMUM_WAGE_HOURLY_USD: 7.25,
  US_CALIFORNIA_AB1482_MAX_RENT_INCREASE_PERCENT: 10.0,
  US_NEW_YORK_HSTPA_MAX_SECURITY_DEPOSIT_MONTHS: 1
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
 * Audits Germany Federal Gazettes & AufenthG Revisions
 */
export function auditGermanyFederalGazette(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/chancenkarte|opportunity card|§\s*20a/i.test(text)) {
    notices.push({
      instrumentCitation: 'Fachkräfteeinwanderungsgesetz (FEG) & AufenthG § 20a',
      title: 'Opportunity Card (Chancenkarte) Points-Based Search Matrix',
      type: 'residence_search_reform',
      entitlements: [
        'Points awarded for foreign qualifications, German/English language skills, work experience, and age under 35.',
        'Grants 1-year job search with 20 hours/week secondary employment and 2-week trial work with employers.'
      ]
    });
  }

  if (/blue card|blaue karte|§\s*18g|45,300|41,041/i.test(text)) {
    notices.push({
      instrumentCitation: 'EU Blue Card Directive Implementation & AufenthG § 18g',
      title: `German EU Blue Card Salary Threshold (€${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.DE_EU_BLUE_CARD_GENERAL_ANNUAL_EUR)})`,
      type: 'blue_card_threshold',
      entitlements: [
        `General salary floor is €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.DE_EU_BLUE_CARD_GENERAL_ANNUAL_EUR)}/year; shortage/MINT occupations reduced to €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.DE_EU_BLUE_CARD_SHORTAGE_ANNUAL_EUR)}/year.`,
        'PR pathway shortened to 27 months (21 months with B1 German proficiency).'
      ]
    });
  }

  return {
    authority: 'Bundesgesetzblatt (BGBl) & Bundesministerium des Innern und für Heimat (BMI)',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Aufenthaltsgesetz (AufenthG)',
      title: 'Standard German Federal Gazette Notice',
      type: 'administrative_update',
      entitlements: ['Standard Aufenthaltsgesetz provisions apply without gazetted revisions.']
    }]
  };
}

/**
 * Audits UAE Official Gazette & Ministerial Resolutions
 */
export function auditUaeOfficialGazette(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/golden visa|30,000|2,000,000|cabinet resolution/i.test(text)) {
    notices.push({
      instrumentCitation: 'Cabinet Resolution No. 65 of 2022 on Executive Regulations of Foreigners Entry',
      title: 'UAE Golden Visa 10-Year Residency Benchmark',
      type: 'long_term_residence',
      entitlements: [
        `Skilled Professionals (Category 1/2) require valid UAE employment contract with salary of at least AED ${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.UAE_GOLDEN_VISA_MONTHLY_SALARY_AED)}/month.`,
        `Real Estate Investors require property investment of at least AED ${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.UAE_GOLDEN_VISA_PROPERTY_INVESTMENT_AED)}.`,
        '10-year self-sponsored visa with 100% foreign ownership and zero limit on stay outside the UAE.'
      ]
    });
  }

  if (/decree 43|rent increase|rera calculator/i.test(text)) {
    notices.push({
      instrumentCitation: 'Decree No. 43 of 2013 Determining Rent Increases in Dubai',
      title: 'RERA Statutory Rent Increase Cap Matrix',
      type: 'rent_cap_regulation',
      entitlements: [
        'Landlords cannot increase rent if current rent is within 10% of market average for the specific area and unit type.',
        'Increases capped at 5% (11-20% below), 10% (21-30% below), 15% (31-40% below), and max 20% (>40% below).'
      ]
    });
  }

  return {
    authority: 'UAE Federal Official Gazette & MOHRE / ICP',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Federal Decree-Law No. 29 of 2021 on Entry and Residence of Foreigners',
      title: 'Standard UAE Ministerial Bulletin',
      type: 'administrative_update',
      entitlements: ['Standard residency and labour regulations apply.']
    }]
  };
}

/**
 * Audits New Zealand Gazette & Immigration Instructions
 */
export function auditNewZealandGazette(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/aewv|accredited employer|median wage|31\.61/i.test(text)) {
    notices.push({
      instrumentCitation: 'Immigration New Zealand Operational Manual (Amendment Circular 2024)',
      title: 'AEWV Wage Benchmarks and Maximum Continuous Stay Rules',
      type: 'work_visa_amendment',
      entitlements: [
        `AEWV benchmark median wage is $${MULTI_COUNTRY_GAZETTE_CONSTANTS.NZ_AEWV_MEDIAN_WAGE_HOURLY_NZD} NZD/hour for skilled occupational pathways.`,
        'Maximum continuous stay limits enforced: 5 years for roles at or above median wage, 3 years for specific lower-wage roles.'
      ]
    });
  }

  return {
    authority: 'New Zealand Gazette & Immigration New Zealand (INZ)',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Immigration Act 2009',
      title: 'Standard New Zealand Immigration Notice',
      type: 'administrative_update',
      entitlements: ['Standard INZ operational instructions apply.']
    }]
  };
}

/**
 * Audits France Journal Officiel & Immigration Directives
 */
export function auditFranceJournalOfficiel(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/smic|passeport talent|loi immigration/i.test(text)) {
    notices.push({
      instrumentCitation: 'Loi n° 2024-42 du 26 janvier 2024 pour contrôler l immigration',
      title: 'French Statutory Wage & Talent Passport Criteria',
      type: 'immigration_reform',
      entitlements: [
        `Gross hourly SMIC set at €${MULTI_COUNTRY_GAZETTE_CONSTANTS.FR_SMIC_HOURLY_EUR}/hour (€${MULTI_COUNTRY_GAZETTE_CONSTANTS.FR_SMIC_MONTHLY_GROSS_EUR}/month).`,
        `Passeport Talent Salarié Qualifié requires gross annual salary of at least €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.FR_PASSEPORT_TALENT_SALARY_FLOOR_EUR)}.`,
        'Multi-year residence card requires republican integration commitment (CIR) and demonstrable language progress.'
      ]
    });
  }

  return {
    authority: 'Journal Officiel de la République Française (JORF) & Ministère de l Intérieur',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Code de l entrée et du séjour des étrangers et du droit d asile (CESEDA)',
      title: 'Avis officiel du Ministère de l Intérieur',
      type: 'administrative_update',
      entitlements: ['Standard CESEDA regulations apply.']
    }]
  };
}

/**
 * Audits Ireland Iris Oifigiúil & DETE Employment Permit Regulations
 */
export function auditIrelandIrisOifigiuil(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/csep|critical skills|38,000|64,000/i.test(text)) {
    notices.push({
      instrumentCitation: 'Employment Permits Act 2024 & DETE Regulations',
      title: 'Critical Skills Employment Permit (CSEP) Salary Thresholds',
      type: 'csep_salary_threshold',
      entitlements: [
        `Eligible degree holders in Critical Skills occupations require minimum annual remuneration of €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.IE_CSEP_MINIMUM_SALARY_EUR)}.`,
        'Fast-track Stamp 4 permanent residence pathway after 21 months of compliant employment.'
      ]
    });
  }

  return {
    authority: 'Iris Oifigiúil & Department of Enterprise, Trade and Employment (DETE)',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Employment Permits Acts',
      title: 'Standard Irish Statutory Notice',
      type: 'administrative_update',
      entitlements: ['Standard DETE regulations apply.']
    }]
  };
}

/**
 * Audits Netherlands Staatscourant & IND Kennismigrant Regulations
 */
export function auditNetherlandsStaatscourant(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/kennismigrant|highly skilled migrant|30%|wws/i.test(text)) {
    notices.push({
      instrumentCitation: 'Vreemdelingenbesluit 2000 & IND Kennismigrantenregeling',
      title: 'Dutch Highly Skilled Migrant & 30% Ruling Thresholds',
      type: 'highly_skilled_migrant',
      entitlements: [
        `30% tax ruling taxable salary benchmark is €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.NL_30_PERCENT_RULING_ANNUAL_TAXABLE_EUR)}/year.`,
        `WWS rent liberalization boundary fixed at €${MULTI_COUNTRY_GAZETTE_CONSTANTS.NL_RENT_LIBERALIZATION_THRESHOLD_EUR}/month.`
      ]
    });
  }

  return {
    authority: 'Staatscourant & Immigratie- en Naturalisatiedienst (IND)',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Vreemdelingenwet 2000',
      title: 'Staatscourant Publicatie',
      type: 'administrative_update',
      entitlements: ['Standard IND operational directives apply.']
    }]
  };
}

/**
 * Audits Singapore Government Gazette & MOM Directives
 */
export function auditSingaporeGovernmentGazette(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/compass|employment pass|5,000|s pass|3,150/i.test(text)) {
    notices.push({
      instrumentCitation: 'Employment of Foreign Manpower Act (EFMA) & COMPASS Framework',
      title: 'MOM Employment Pass & COMPASS Evaluation Standards',
      type: 'work_pass_framework',
      entitlements: [
        `EP minimum qualifying salary set at S$${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.SG_EP_QUALIFYING_SALARY_MONTHLY_SGD)}/month (S$5,500 for financial services).`,
        `S Pass minimum qualifying salary set at S$${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.SG_SPASS_QUALIFYING_SALARY_MONTHLY_SGD)}/month.`,
        'COMPASS points framework evaluates salary, qualifications, diversity, and local employment support.'
      ]
    });
  }

  return {
    authority: 'Singapore Government Gazette & Ministry of Manpower (MOM)',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Employment of Foreign Manpower Act',
      title: 'Standard MOM Gazette Notice',
      type: 'administrative_update',
      entitlements: ['Standard MOM employment pass directives apply.']
    }]
  };
}

/**
 * Audits Spain Boletín Oficial del Estado (BOE)
 */
export function auditSpainBoletinOficial(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/smi|salario m[ií]nimo|beckham|lau|fianza/i.test(text)) {
    notices.push({
      instrumentCitation: 'Real Decreto 145/2024 & Ley de Arrendamientos Urbanos (LAU)',
      title: 'Spanish Statutory Wage, Tenancy, and Tax Directives',
      type: 'statutory_benchmark',
      entitlements: [
        `National minimum wage (SMI) set at €${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.ES_SMI_MONTHLY_EUR_14_PAYMENTS)}/month in 14 payments (€${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.ES_SMI_MONTHLY_EUR_12_PAYMENTS)} in 12 payments).`,
        'Residential tenancy legal deposit (fianza) strictly capped at 1 month rent (plus max 2 months additional contractual guarantee).',
        `Beckham Law special tax regime provides 24% flat rate up to €600,000 for qualifying arriving expatriates.`
      ]
    });
  }

  return {
    authority: 'Boletín Oficial del Estado (BOE) & Ministerio de Trabajo',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Ley de Extranjería (LO 4/2000)',
      title: 'Disposición General del BOE',
      type: 'administrative_update',
      entitlements: ['Standard Spanish statutory standards apply.']
    }]
  };
}

/**
 * Audits Sweden Svensk författningssamling (SFS) & Migrationsverket
 */
export function auditSwedenStatensOffentliga(textOrHtml = '') {
  const text = String(textOrHtml);
  const notices = [];

  if (/migrationsverket|work permit|maintenance|28,480|blue card/i.test(text)) {
    notices.push({
      instrumentCitation: 'Utlänningsförordningen (2006:97) & Migrationsverket Föreskrifter',
      title: 'Swedish Work Permit Maintenance & Blue Card Standards',
      type: 'maintenance_requirement',
      entitlements: [
        `Work permit wage must meet at least 80% of Swedish median salary (SEK ${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.SE_WORK_PERMIT_MINIMUM_MONTHLY_SEK)}/month).`,
        `Swedish EU Blue Card gross salary floor set at SEK ${fmt(MULTI_COUNTRY_GAZETTE_CONSTANTS.SE_EU_BLUE_CARD_MINIMUM_MONTHLY_SEK)}/month.`,
        'Mandatory occupational insurance (health, life, occupational pension, industrial injury) required from employer.'
      ]
    });
  }

  return {
    authority: 'Svensk författningssamling (SFS) & Migrationsverket',
    noticesCount: notices.length,
    notices: notices.length > 0 ? notices : [{
      instrumentCitation: 'Utlänningslagen (2005:716)',
      title: 'Standard Swedish Migration Directive',
      type: 'administrative_update',
      entitlements: ['Standard Swedish statutory regulations apply.']
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
  },
  'IN_AU': {
    origin: 'India',
    destination: 'Australia',
    primaryEducationAssessor: 'VETASSESS / Australian Computer Society (ACS) / Engineers Australia',
    policeClearanceValidityMonths: 12,
    medicalExamRequired: true,
    biometricsValidityYears: 10,
    driversLicenseExchange: 'State-based: Conversion with Service NSW / VicRoads / QLD TMR; recognized experience waives waiting periods.'
  },
  'IN_DE': {
    origin: 'India',
    destination: 'Germany',
    primaryEducationAssessor: 'Central Office for Foreign Education (ZAB) / Anabin Database',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: false,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Direct driving permitted for 6 months from Anmeldung; theoretical and practical test required thereafter.'
  },
  'IN_NZ': {
    origin: 'India',
    destination: 'New Zealand',
    primaryEducationAssessor: 'New Zealand Qualifications Authority (NZQA)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive for up to 12 months on valid Indian licence with English translation; conversion via NZTA thereafter.'
  },
  'IN_IE': {
    origin: 'India',
    destination: 'Ireland',
    primaryEducationAssessor: 'Quality and Qualifications Ireland (QQI / NARIC Ireland)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: false,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive up to 12 months as visitor; permanent residents must complete NDLS theory and reduced Essential Driver Training.'
  },
  'IN_SG': {
    origin: 'India',
    destination: 'Singapore',
    primaryEducationAssessor: 'MOM-approved verification agencies (DataFlow / Cisive / Sterling RISQ)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Convert to Singapore licence at Traffic Police headquarters within 12 months by passing Basic Theory Test (BTT).'
  },
  'IN_FR': {
    origin: 'India',
    destination: 'France',
    primaryEducationAssessor: 'ENIC-NARIC France (Centre international d études pédagogiques)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true, // OFII medical screening
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive on translated licence for 1 year with student/VLS-TS status; conversion via ANTS for eligible long-stay permits.'
  },
  'IN_NL': {
    origin: 'India',
    destination: 'Netherlands',
    primaryEducationAssessor: 'Nuffic (Dutch organisation for internationalisation in education)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true, // TB test within 3 months for specific origin countries
    biometricsValidityYears: 5,
    driversLicenseExchange: 'RDW licence exchange available if qualified for the 30% tax ruling; otherwise CBR theory and driving test required.'
  },
  'IN_ES': {
    origin: 'India',
    destination: 'Spain',
    primaryEducationAssessor: 'Ministerio de Universidades (Homologación y Convalidación)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: true,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive for 6 months after obtaining residence (TIE); theoretical and practical driving test via DGT required.'
  },
  'IN_SE': {
    origin: 'India',
    destination: 'Sweden',
    primaryEducationAssessor: 'Swedish Council for Higher Education (UHR)',
    policeClearanceValidityMonths: 6,
    medicalExamRequired: false,
    biometricsValidityYears: 5,
    driversLicenseExchange: 'Drive on valid foreign licence for up to 1 year; Swedish driving licence requires Trafikverket risk training and tests.'
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
  if (c === 'DE') {
    return {
      country: 'DE',
      federalGazetteAudit: auditGermanyFederalGazette(htmlContent)
    };
  }
  if (c === 'AE') {
    return {
      country: 'AE',
      officialGazetteAudit: auditUaeOfficialGazette(htmlContent)
    };
  }
  if (c === 'NZ') {
    return {
      country: 'NZ',
      gazetteAudit: auditNewZealandGazette(htmlContent)
    };
  }
  if (c === 'FR') {
    return {
      country: 'FR',
      journalOfficielAudit: auditFranceJournalOfficiel(htmlContent)
    };
  }
  if (c === 'IE') {
    return {
      country: 'IE',
      irisOifigiuilAudit: auditIrelandIrisOifigiuil(htmlContent)
    };
  }
  if (c === 'NL') {
    return {
      country: 'NL',
      staatscourantAudit: auditNetherlandsStaatscourant(htmlContent)
    };
  }
  if (c === 'SG') {
    return {
      country: 'SG',
      governmentGazetteAudit: auditSingaporeGovernmentGazette(htmlContent)
    };
  }
  if (c === 'ES') {
    return {
      country: 'ES',
      boletinOficialAudit: auditSpainBoletinOficial(htmlContent)
    };
  }
  if (c === 'SE') {
    return {
      country: 'SE',
      statensOffentligaAudit: auditSwedenStatensOffentliga(htmlContent)
    };
  }
  return {
    country: c,
    message: `Gazette audit completed for ${c}. No critical statutory revisions detected.`
  };
}
