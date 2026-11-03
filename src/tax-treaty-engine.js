// src/tax-treaty-engine.js
// Cross-border Double Taxation Avoidance Agreement (DTAA) & Foreign Asset Disclosure Engine
// Pure ES module with zero npm dependencies.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const DTAA_MATRIX = {
  'India': {
    'Canada': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-Canada DTAA Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (ITA s.126) offsets Indian TDS' },
    'United States': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-USA DTAA Art. 11 & 10', withholdingNote: 'IRS Form 1116 Foreign Tax Credit avoids double taxation' },
    'United Kingdom': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-UK DTAA Art. 12 & 11', withholdingNote: 'HMRC Foreign Tax Credit Relief (FTCR)' },
    'Australia': { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'India-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO Foreign Income Tax Offset (FITO)' },
    'Germany': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'India-Germany DTAA Art. 11 & 10', withholdingNote: 'Anrechnung ausländischer Steuern (§ 34c EStG)' }
  },
  'China': {
    'Canada': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Canada DTAA Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (s.126)' },
    'United States': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-USA DTAA Art. 10 & 9', withholdingNote: 'IRS Form 1116 Foreign Tax Credit' },
    'United Kingdom': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-UK DTAA Art. 11 & 10', withholdingNote: 'HMRC Foreign Tax Credit Relief' },
    'Australia': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO Foreign Income Tax Offset' },
    'Germany': { interest: '10%', dividends: '10%', royalties: '10%', treatyArticle: 'China-Germany DTAA Art. 11 & 10', withholdingNote: 'Anrechnungsverfahren nach § 34c EStG' }
  },
  'United States': {
    'Canada': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'Canada-US Tax Treaty Art. XI & X', withholdingNote: 'Interest exempt under 5th Protocol; 15% standard dividend' },
    'United Kingdom': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'US-UK Tax Treaty Art. 11 & 10', withholdingNote: 'Zero withholding on interest/royalties; FTC available' },
    'Australia': { interest: '10%', dividends: '15%', royalties: '5%', treatyArticle: 'US-Australia Tax Treaty Art. 11 & 10', withholdingNote: 'ATO FITO credit' },
    'Germany': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'US-Germany Tax Treaty Art. 11 & 10', withholdingNote: '§ 50d EStG Freistellung' }
  },
  'United Kingdom': {
    'Canada': { interest: '10%', dividends: '15%', royalties: '10%', treatyArticle: 'UK-Canada Tax Convention Art. 11 & 10', withholdingNote: 'CRA Foreign Tax Credit (s.126)' },
    'United States': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'UK-US Tax Treaty Art. 11 & 10', withholdingNote: 'IRS Form 1116' },
    'Australia': { interest: '10%', dividends: '15%', royalties: '5%', treatyArticle: 'UK-Australia DTAA Art. 11 & 10', withholdingNote: 'ATO FITO' },
    'Germany': { interest: '0%', dividends: '15%', royalties: '0%', treatyArticle: 'UK-Germany DTAA Art. 11 & 10', withholdingNote: 'Bilateral exemption' }
  }
};

/**
 * Evaluates foreign asset reporting obligations (CRA T1135, IRS FBAR FinCEN 114, HMRC FIG, ATO FITO)
 */
export function evaluateForeignAssetReporting({
  origin = 'India',
  dest = 'Canada',
  assetsUSD = 125000,
  firstYear = true,
  bankBalanceUSD = 25000,
  taxpayerName = 'Taxpayer',
  assessmentDate = todayIso()
} = {}) {
  const safeOrigin = boundedText(origin, 'India', 50);
  const safeDest = boundedText(dest, 'Canada', 50);
  const safeTaxpayerName = boundedText(taxpayerName, 'Taxpayer', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const cleanAssetsUSD = Number.isFinite(Number(assetsUSD)) ? Math.max(0, Math.min(1000000000, Number(assetsUSD))) : 125000;
  const cleanBankUSD = Number.isFinite(Number(bankBalanceUSD)) ? Math.max(0, Math.min(1000000000, Number(bankBalanceUSD))) : 25000;
  const assetsCAD = Math.round(cleanAssetsUSD * 1.36);
  const treaty = (DTAA_MATRIX[safeOrigin] && DTAA_MATRIX[safeOrigin][safeDest]) || {
    interest: '15%',
    dividends: '15%',
    royalties: '15%',
    treatyArticle: 'OECD Model Bilateral Double Taxation Convention',
    withholdingNote: 'Standard statutory foreign tax credit mechanism applies'
  };

  let statusBadge = 'FIRST-YEAR EXEMPT';
  let badgeCls = 'badge-compliant';
  let triggerTitle = 'CRA Form T1135: First-Year Statutory Exemption';
  let triggerDesc = '';
  let mandatoryFiling = false;

  if (safeDest === 'Canada') {
    if (firstYear) {
      statusBadge = 'FIRST-YEAR EXEMPT';
      badgeCls = 'badge-compliant';
      triggerTitle = 'CRA Form T1135: First-Year Statutory Exemption';
      triggerDesc = 'Under Income Tax Act subsection 233.3(1), an individual who was a non-resident in the previous taxation year is statutorily EXEMPT from filing Form T1135 for the calendar year in which they established Canadian tax residency. Form T1135 filing will only apply starting in year 2 if specified foreign property cost base exceeds CAD $100,000.';
      mandatoryFiling = false;
    } else if (assetsCAD > 100000) {
      statusBadge = 'MANDATORY DISCLOSURE';
      badgeCls = 'badge-danger';
      triggerTitle = 'CRA Form T1135: Mandatory Foreign Income Verification';
      triggerDesc = `Your foreign cost base is approx. CAD $${assetsCAD.toLocaleString()}, exceeding the CAD $100,000 threshold. You must submit Form T1135 by your tax return due date (April 30 / June 15). Non-filing penalty: CAD $25/day up to CAD $2,500 per tax year (ITA s.162(7)).`;
      mandatoryFiling = true;
    } else {
      statusBadge = 'BELOW THRESHOLD';
      badgeCls = 'badge-warn';
      triggerTitle = 'Below CRA CAD $100,000 T1135 Threshold';
      triggerDesc = `Foreign cost base of CAD $${assetsCAD.toLocaleString()} is below the statutory CAD $100,000 reporting threshold. Regular reporting of foreign investment income on T1 line 12100 still applies.`;
      mandatoryFiling = false;
    }
  } else if (safeDest === 'United States') {
    if (cleanBankUSD > 10000) {
      statusBadge = 'MANDATORY FBAR';
      badgeCls = 'badge-danger';
      triggerTitle = 'FinCEN Form 114 (FBAR) Mandatory Filing';
      triggerDesc = `Foreign account peak balance ($${cleanBankUSD.toLocaleString()} USD) exceeds the USD $10,000 aggregate threshold. Mandatory electronic filing via BSA E-Filing System by April 15 (auto-extension to October 15). Non-willful failure penalty: up to $15,611 per violation under 31 U.S.C. 5321.`;
      mandatoryFiling = true;
    } else {
      statusBadge = 'BELOW FBAR THRESHOLD';
      badgeCls = 'badge-compliant';
      triggerTitle = 'Below USD $10,000 FBAR Threshold';
      triggerDesc = 'Aggregate foreign account balances did not exceed $10,000 USD at any point during the calendar year.';
      mandatoryFiling = false;
    }
  } else if (safeDest === 'United Kingdom') {
    statusBadge = 'HMRC REGIME';
    badgeCls = 'badge-warn';
    triggerTitle = 'HMRC Worldwide Income & Foreign Income and Gains (FIG)';
    triggerDesc = 'Newcomers qualifying for the 4-year Foreign Income and Gains (FIG) regime enjoy statutory UK tax relief on qualifying foreign income and gains for their first 4 tax years of UK tax residence.';
    mandatoryFiling = false;
  } else if (safeDest === 'Australia') {
    statusBadge = 'ATO TAX RESIDENT';
    badgeCls = 'badge-warn';
    triggerTitle = 'ATO Worldwide Income Taxation';
    triggerDesc = 'From the date you become an Australian resident for tax purposes, you must declare all foreign income. Foreign Income Tax Offset (FITO) prevents double taxation by crediting foreign taxes paid.';
    mandatoryFiling = false;
  } else if (safeDest === 'Germany') {
    statusBadge = 'PROGRESSIONSVORBEHALT';
    badgeCls = 'badge-warn';
    triggerTitle = 'German EStG § 32b Progressionsvorbehalt';
    triggerDesc = 'Under § 32b of the German Income Tax Act (EStG), foreign income earned prior to establishing German tax residency is tax-exempt in Germany but is included to determine the progressive tax rate applicable to domestic German income.';
    mandatoryFiling = false;
  }

  return {
    taxpayerName: safeTaxpayerName,
    assessmentDate: safeAssessmentDate,
    origin: safeOrigin,
    dest: safeDest,
    assetsUSD: cleanAssetsUSD,
    assetsCAD,
    bankBalanceUSD: cleanBankUSD,
    treaty,
    statusBadge,
    badgeCls,
    triggerTitle,
    triggerDesc,
    mandatoryFiling
  };
}

/**
 * Calculates prorated Basic Personal Amount (BPA) for newcomers in year of arrival
 */
export function calculateProratedBpa({ entryDateStr = '2026-07-01', annualBpa = 15705, country = 'Canada' } = {}) {
  const safeDateStr = safeIsoDate(entryDateStr, '2026-07-01');
  const safeCountry = boundedText(country, 'Canada', 50);
  const cleanBpa = Number.isFinite(Number(annualBpa)) ? Math.max(0, Math.min(1000000, Number(annualBpa))) : 15705;
  const entryDate = new Date(safeDateStr);
  const year = entryDate.getFullYear();
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const totalDays = Math.round((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysResident = Math.max(0, Math.round((endOfYear.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const ratio = Math.min(1, Math.max(0, daysResident / totalDays));
  const proratedBpa = Math.round(cleanBpa * ratio);

  return {
    country: safeCountry,
    year,
    daysResident,
    totalDays,
    ratio: Number(ratio.toFixed(4)),
    annualBpa: cleanBpa,
    proratedBpa,
    statutoryRule: 'Under CRA Income Tax Act s.118(1), newcomers must prorate the federal Basic Personal Amount based on the number of days they were resident in Canada during the taxation year.'
  };
}

/**
 * Evaluates cross-border pension portability and rollover treatment
 */
export function evaluatePensionPortability({ origin = 'United States', dest = 'Canada', planType = '401k' } = {}) {
  const safeOrigin = boundedText(origin, 'United States', 50);
  const safeDest = boundedText(dest, 'Canada', 50);
  const safePlan = boundedText(planType, '401k', 50);

  if (safeOrigin === 'United States' && safeDest === 'Canada') {
    return {
      origin: safeOrigin,
      dest: safeDest,
      planType: safePlan,
      eligible: true,
      protocol: 'Canada-US Tax Treaty Article XVIII(7)',
      mechanism: 'Lump-sum distribution from US 401(k) / Traditional IRA can be contributed to Canadian RRSP as a qualifying transfer under ITA s.60(j), offsetting Canadian income tax.',
      usTaxNote: 'Subject to standard 30% US non-resident withholding tax (or 15% for periodic pensions), creditable on Canadian T1 return as Foreign Tax Credit (ITA s.126).'
    };
  }
  if (safeOrigin === 'United Kingdom' && safeDest === 'Canada') {
    return {
      origin: safeOrigin,
      dest: safeDest,
      planType: safePlan,
      eligible: true,
      protocol: 'HMRC Qualifying Recognised Overseas Pension Scheme (QROPS)',
      mechanism: 'Transfers to a non-UK pension scheme are subject to HMRC Overseas Transfer Charge (25%) unless meeting residency exemptions.',
      usTaxNote: 'Must be transferred to an approved QROPS provider registered with HMRC.'
    };
  }
  return {
    origin: safeOrigin,
    dest: safeDest,
    planType: safePlan,
    eligible: false,
    protocol: 'General Bilateral Tax Treaty',
    mechanism: 'Foreign pension distributions are taxable as foreign income in the destination country with foreign tax credits available under bilateral DTAA provisions.',
    usTaxNote: 'Consult a cross-border tax specialist regarding lump-sum withdrawal penalties in the origin jurisdiction.'
  };
}
