// City Comparison & Newcomer Cost-of-Living Engine
// Provides statutory benchmarks, CMHC median rent, provincial tax rates, 
// healthcare waiting periods, and transit metrics across major Canadian landing hubs.

import { calculatorNumber } from './calculator-input.js';
import { boundedText, safeIsoDate } from './text-input.js';

export const CANADIAN_METROS = {
  Toronto: {
    city: 'Toronto',
    province: 'Ontario',
    provinceCode: 'ON',
    rent1BedMedian: 2450,
    rent2BedMedian: 3150,
    transitSystem: 'TTC (Toronto Transit Commission)',
    transitMonthlyPass: 156.00,
    healthcarePlan: 'OHIP (Ontario Health Insurance Plan)',
    healthcareWaitPeriod: 'None (3-month waiting period permanently abolished)',
    salesTax: '13% HST',
    pstRate: 0.08,
    gstRate: 0.05,
    winterSeverity: 'Moderate Cold (-5°C to -1°C avg, moderate snow)',
    primaryJobMarkets: ['Technology & AI', 'Financial Services & Banking', 'Healthcare', 'Consulting & Legal'],
    settlementAgencies: [
      { name: 'Settlement.Org (OCASI)', url: 'https://settlement.org' },
      { name: 'YMCA Newcomer Information Centre', url: 'https://newcomersincanada.ca' },
      { name: 'COSTI Immigrant Services', url: 'https://www.costi.org' }
    ]
  },
  Vancouver: {
    city: 'Vancouver',
    province: 'British Columbia',
    provinceCode: 'BC',
    rent1BedMedian: 2600,
    rent2BedMedian: 3400,
    transitSystem: 'TransLink (SkyTrain & Bus)',
    transitMonthlyPass: 140.00, // Weighted average across zones
    healthcarePlan: 'MSP (Medical Services Plan)',
    healthcareWaitPeriod: '2 months plus the remainder of the month of arrival',
    salesTax: '12% (5% GST + 7% PST)',
    pstRate: 0.07,
    gstRate: 0.05,
    winterSeverity: 'Mild & Rainy (2°C to 7°C avg, minimal snow)',
    primaryJobMarkets: ['Software Engineering', 'Clean Tech & Forestry', 'Film & Digital Media', 'International Trade'],
    settlementAgencies: [
      { name: 'ISSofBC (Immigrant Services Society of BC)', url: 'https://issbc.org' },
      { name: 'MOSAIC Newcomer Family Services', url: 'https://mosaicbc.org' },
      { name: '211 British Columbia Helpline', url: 'https://bc.211.ca' }
    ]
  },
  Calgary: {
    city: 'Calgary',
    province: 'Alberta',
    provinceCode: 'AB',
    rent1BedMedian: 1750,
    rent2BedMedian: 2150,
    transitSystem: 'Calgary Transit (CTrain & Bus)',
    transitMonthlyPass: 115.00,
    healthcarePlan: 'AHCIP (Alberta Health Care Insurance Plan)',
    healthcareWaitPeriod: 'Coverage begins upon date of arrival with valid status',
    salesTax: '5% GST (0% PST - Alberta has NO provincial sales tax)',
    pstRate: 0.0,
    gstRate: 0.05,
    winterSeverity: 'Cold & Sunny (-12°C to 0°C, tempered by warm Chinook winds)',
    primaryJobMarkets: ['Energy & Renewables', 'Aviation & Logistics', 'Agriculture & Food Processing', 'Emerging Tech'],
    settlementAgencies: [
      { name: 'Centre for Newcomers Calgary', url: 'https://www.centrefornewcomers.ca' },
      { name: 'Calgary Catholic Immigration Society (CCIS)', url: 'https://www.ccisab.ca' },
      { name: 'Immigrant Services Calgary', url: 'https://immigrantservicescalgary.ca' }
    ]
  },
  Ottawa: {
    city: 'Ottawa',
    province: 'Ontario',
    provinceCode: 'ON',
    rent1BedMedian: 1850,
    rent2BedMedian: 2300,
    transitSystem: 'OC Transpo (O-Train & Bus)',
    transitMonthlyPass: 128.75,
    healthcarePlan: 'OHIP (Ontario Health Insurance Plan)',
    healthcareWaitPeriod: 'None (3-month waiting period permanently abolished)',
    salesTax: '13% HST',
    pstRate: 0.08,
    gstRate: 0.05,
    winterSeverity: 'Very Cold & Snowy (-11°C to -3°C avg, significant snowfall)',
    primaryJobMarkets: ['Federal Public Service', 'Defence & Aerospace', 'Telecommunications & SaaS', 'Healthcare & Research'],
    settlementAgencies: [
      { name: 'OCISO (Ottawa Community Immigrant Services Org)', url: 'https://ociso.org' },
      { name: 'YMCA-YWCA Newcomer Centre Ottawa', url: 'https://www.ymcaottawa.ca' }
    ]
  },
  Montreal: {
    city: 'Montreal',
    province: 'Quebec',
    provinceCode: 'QC',
    rent1BedMedian: 1600,
    rent2BedMedian: 2050,
    transitSystem: 'STM (Société de transport de Montréal)',
    transitMonthlyPass: 100.00,
    healthcarePlan: 'RAMQ (Régie de l\'assurance maladie du Québec)',
    healthcareWaitPeriod: 'Up to 3 months waiting period (private insurance recommended)',
    salesTax: '14.975% (5% GST + 9.975% QST)',
    pstRate: 0.09975,
    gstRate: 0.05,
    winterSeverity: 'Very Cold (-10°C to -3°C avg, heavy winter snow)',
    primaryJobMarkets: ['AI & Gaming', 'Aerospace (Bombardier/CAE)', 'Biotech & Pharmaceuticals', 'Creative Arts'],
    settlementAgencies: [
      { name: 'CACI (Centre d\'appui aux communautés immigrantes)', url: 'https://caci-qc.org' },
      { name: 'PROMIS Immigrant Services', url: 'https://promis.qc.ca' }
    ]
  }
};

/**
 * Compares two or more Canadian destination metros side-by-side.
 * @param {string[]} cityNames - Array of city names (e.g. ['Toronto', 'Calgary'])
 * @param {object} [options] - Options such as estimated annual salary, family composition
 * @returns {object} Detailed comparison payload with differential analysis
 */
export function compareCities(cityNames, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const safeDate = safeIsoDate(safeOptions.assessmentDate, '2026-10-31');
  const validCities = [...new Set((Array.isArray(cityNames) ? cityNames : [cityNames])
    .map(c => c && typeof c === 'string' ? boundedText(c, '', 60) : '')
    .filter(c => Object.hasOwn(CANADIAN_METROS, c)))];

  if (!validCities.length) {
    return {
      asOf: safeDate,
      assessmentDate: safeDate,
      error: 'Please choose at least one valid destination city from: ' + Object.keys(CANADIAN_METROS).join(', '),
      availableCities: Object.keys(CANADIAN_METROS)
    };
  }

  const rawSalary = calculatorNumber(safeOptions.annualSalary === undefined ? 80000 : safeOptions.annualSalary, 'Annual salary');
  const rawHousehold = calculatorNumber(safeOptions.householdSize === undefined ? 1 : safeOptions.householdSize, 'Household size', { min: 1, integer: true });
  const annualSalary = Math.min(100000000, Math.max(0, rawSalary));
  const householdSize = Math.min(20, Math.max(1, rawHousehold));

  const comparison = validCities.map(name => {
    const data = CANADIAN_METROS[name];
    const rentTarget = householdSize > 2 ? data.rent2BedMedian : data.rent1BedMedian;
    const annualRent = rentTarget * 12;
    const annualTransit = data.transitMonthlyPass * 12 * Math.min(householdSize, 2);
    const estimatedSalesTaxPaid = (annualSalary * 0.25) * (data.pstRate + data.gstRate);
    const estimatedFixedAnnualOutflow = annualRent + annualTransit + estimatedSalesTaxPaid;

    return {
      ...data,
      projectedMonthlyRent: rentTarget,
      annualRentOutflow: annualRent,
      annualTransitOutflow: annualTransit,
      estimatedFixedAnnualOutflow: Math.round(estimatedFixedAnnualOutflow)
    };
  });

  // Calculate differentials if comparing 2 cities
  let differential = null;
  if (comparison.length === 2) {
    const [c1, c2] = comparison;
    const rentDiffMonthly = c1.projectedMonthlyRent - c2.projectedMonthlyRent;
    const annualSavings = c1.estimatedFixedAnnualOutflow - c2.estimatedFixedAnnualOutflow;

    differential = {
      cheaperCity: annualSavings > 0 ? c2.city : c1.city,
      annualEstimatedSavings: Math.abs(annualSavings),
      monthlyRentDifference: Math.abs(rentDiffMonthly),
      salesTaxAdvantage: c1.provinceCode === 'AB' ? c1.city : (c2.provinceCode === 'AB' ? c2.city : null)
    };
  }

  return {
    asOf: safeDate,
    assessmentDate: safeDate,
    comparison,
    differential,
    benchmarkNote: 'Based on CMHC rental market surveys, provincial health ministry rules, and transit authority tariffs.'
  };
}
