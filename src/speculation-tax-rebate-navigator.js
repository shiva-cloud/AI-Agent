/**
 * BC Speculation & Vacancy Tax (SVT) and Ontario Non-Resident Speculation Tax (NRST) Rebate Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - British Columbia Speculation and Vacancy Tax Act, S.B.C. 2018, c. 46:
 *   - Part 2 (Annual declaration requirement across designated taxable regions: Metro Vancouver, Capital Regional District, Kelowna, Nanaimo, etc.)
 *   - s. 12 (Tax rates: 0.5% for Canadian citizens/PRs; 2.0% for foreign owners & satellite families)
 *   - Part 3, Div 2 (Principal Residence Exemption: >= 6 months physical occupation)
 *   - Part 3, Div 3 (Tenancy Exemption: Arm's-length rental for minimum 6 months / 180 days per year)
 *   - Part 4 (Foreign owner tax credit against BC employment income up to $2,000)
 * - Ontario Land Transfer Tax Act (LTTA), R.S.O. 1990, c. L.6:
 *   - s. 2.1 & O. Reg. 182/17 (Non-Resident Speculation Tax - 25% province-wide)
 *   - O. Reg. 182/17 s. 4 (Permanent Resident Rebate: becoming a PR within 90 days / holding solely with spouse / occupying within 60 days)
 *   - Statutory limitation: Rebate application must be submitted within 90 days of attaining PR status.
 *   - Note: Student and Foreign Worker NRST rebates were repealed on March 29, 2022; ONLY the PR rebate is available.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SPECULATION_TAX_CONSTANTS = Object.freeze({
  BC_SVT_CANADIAN_RATE_PERCENT: 0.5,
  BC_SVT_FOREIGN_RATE_PERCENT: 2.0,
  BC_SVT_MIN_RENTAL_DAYS: 180,
  BC_SVT_MAX_FOREIGN_CREDIT_CAD: 2000.0,
  ON_NRST_RATE_PERCENT: 25.0,
  ON_NRST_OCCUPANCY_DAYS: 60,
  ON_NRST_PR_ACQUISITION_DAYS: 90,
  ON_NRST_CLAIM_LIMITATION_DAYS: 90
});

export const BC_SVT_DESIGNATED_REGIONS = Object.freeze([
  'Metro Vancouver Regional District (MVRD)',
  'Capital Regional District (CRD - Greater Victoria)',
  'Fraser Valley Regional District (Abbotsford, Chilliwack, Mission)',
  'Regional District of Central Okanagan (Kelowna, West Kelowna)',
  'Nanaimo Regional District',
  'Kamloops',
  'Courtenay / Comox',
  'Squamish'
]);

/**
 * Diagnostic evaluation of BC Speculation & Vacancy Tax (SVT) declarations,
 * exemptions, satellite family classification, and Ontario 25% NRST statutory PR rebate recovery.
 */
export function evaluateSpeculationTaxAndRebates({
  province = 'BC', // 'BC' | 'ON'
  propertyAssessedValueCad = 1200000,
  purchasePriceCad = 1200000,
  isCanadianCitizenOrPr = false,
  isSatelliteFamily = false, // >50% of worldwide income untaxed in Canada
  isPrincipalResidenceOccupied6Months = false,
  rentalDaysInYear = 0, // >= 180 days for rental exemption
  isYearOfPurchase = false,
  bcEmploymentIncomeCad = 0,
  // Ontario NRST fields
  purchaseClosingDate = '2026-02-01',
  prStatusAcquiredDate = null, // Date applicant obtained Canadian PR
  rebateApplicationDate = '2026-10-31',
  occupiedAsPrincipalResidenceWithin60Days = true,
  heldSolelyWithSpouse = true,
  isOinpNomineeAtClosing = false,
  isConventionRefugee = false,
  ownerName = 'Property Owner',
  propertyAddress = '100 Marine Dr, Vancouver, BC',
  assessmentDate = '2026-10-31'
} = {}) {
  const prov = boundedText(province, 'BC', 10).toUpperCase();
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const assessedValue = Math.max(1, Math.min(1000000000, Number(propertyAssessedValueCad) || 1));
  const purchasePrice = Math.max(1, Math.min(1000000000, Number(purchasePriceCad) || assessedValue));
  const isCdn = Boolean(isCanadianCitizenOrPr);
  const satellite = Boolean(isSatelliteFamily);
  const primaryHome = Boolean(isPrincipalResidenceOccupied6Months);
  const rentalDays = Math.max(0, Math.min(365, Number(rentalDaysInYear) || 0));
  const yearPurchased = Boolean(isYearOfPurchase);
  const bcIncome = Math.max(0, Math.min(100000000, Number(bcEmploymentIncomeCad) || 0));

  const safeOwner = boundedText(ownerName, 'Property Owner', 100);
  const safeAddress = boundedText(propertyAddress, 'Residential Property', 150);

  const statutoryNotes = [];
  const riskWarnings = [];
  const actionPlan = [];

  let isTaxExempt = false;
  let taxRatePercent = 0;
  let grossTaxPayableCad = 0;
  let netTaxPayableCad = 0;
  let applicableExemption = null;

  // ON NRST Rebate variables
  let nrstPaidCad = 0;
  let isNrstRebateEligible = false;
  let nrstRebateAmountCad = 0;
  let nrstRebateReason = '';

  if (prov === 'BC') {
    // BC SVT Diagnostic
    if (primaryHome) {
      isTaxExempt = true;
      applicableExemption = 'Principal Residence Exemption (Occupied >= 6 months in calendar year)';
      statutoryNotes.push('SBC 2018 c. 46 Part 3: Property occupied as primary home for at least 6 months qualifies for statutory exemption from BC SVT.');
    } else if (rentalDays >= SPECULATION_TAX_CONSTANTS.BC_SVT_MIN_RENTAL_DAYS) {
      isTaxExempt = true;
      applicableExemption = `Arm's-Length Tenancy Exemption (Rented for ${rentalDays} days >= 180 days statutory minimum)`;
      statutoryNotes.push('SBC 2018 c. 46 Part 3 Div 3: Residential unit rented to an arm\'s-length tenant for >= 180 days is fully exempt.');
    } else if (yearPurchased) {
      isTaxExempt = true;
      applicableExemption = 'Year of Acquisition Exemption (Purchased within current taxation year)';
      statutoryNotes.push('SBC 2018 c. 46 s. 38: Property purchased during the calendar year is statutorily exempt from SVT for that acquisition year.');
    } else {
      isTaxExempt = false;
      if (!isCdn || satellite) {
        taxRatePercent = SPECULATION_TAX_CONSTANTS.BC_SVT_FOREIGN_RATE_PERCENT;
        applicableExemption = satellite
          ? 'Satellite Family / Untaxed Worldwide Earners (2.0% Tax Rate)'
          : 'Foreign Owner / Non-PR (2.0% Tax Rate)';
        if (satellite) {
          riskWarnings.push('SATELLITE FAMILY TRAP: Even Canadian citizens or PRs are charged the full 2.0% foreign owner tax rate if more than 50% of the household\'s worldwide income is earned abroad and not reported on a Canadian tax return.');
        }
      } else {
        taxRatePercent = SPECULATION_TAX_CONSTANTS.BC_SVT_CANADIAN_RATE_PERCENT;
        applicableExemption = 'Secondary Residence / Canadian Citizen or PR (0.5% Tax Rate)';
      }

      grossTaxPayableCad = Math.round((assessedValue * (taxRatePercent / 100)) * 100) / 100;

      // BC Employment Tax Credit for foreign owners (up to $2,000 or 20% of BC income)
      let foreignTaxCredit = 0;
      if (!isCdn || satellite) {
        foreignTaxCredit = Math.min(SPECULATION_TAX_CONSTANTS.BC_SVT_MAX_FOREIGN_CREDIT_CAD, Math.round(bcIncome * 0.20 * 100) / 100);
      }
      netTaxPayableCad = Math.max(0, grossTaxPayableCad - foreignTaxCredit);

      actionPlan.push('File annual BC SVT declaration online by March 31 with letter ID and declaration code.');
      if (netTaxPayableCad > 0) {
        actionPlan.push(`Remit net SVT of $${netTaxPayableCad.toLocaleString()} CAD to the BC Ministry of Finance by July 2.`);
      }
    }
  } else {
    // Ontario NRST & Rebate Diagnostic
    nrstPaidCad = Math.round((purchasePrice * (SPECULATION_TAX_CONSTANTS.ON_NRST_RATE_PERCENT / 100)) * 100) / 100;

    const oinp = Boolean(isOinpNomineeAtClosing);
    const refugee = Boolean(isConventionRefugee);
    const occupied60 = Boolean(occupiedAsPrincipalResidenceWithin60Days);
    const soleSpouse = Boolean(heldSolelyWithSpouse);

    if (oinp || refugee || isCdn) {
      isTaxExempt = true;
      applicableExemption = oinp
        ? 'OINP Provincial Nominee Exemption (O. Reg. 182/17 s. 3)'
        : (refugee ? 'Protected Person / Convention Refugee Exemption' : 'Canadian Citizen / PR Exemption');
      netTaxPayableCad = 0;
      statutoryNotes.push('Exempt from Ontario 25% NRST at closing.');
    } else {
      // Must check NRST PR Rebate Eligibility
      taxRatePercent = SPECULATION_TAX_CONSTANTS.ON_NRST_RATE_PERCENT;
      netTaxPayableCad = nrstPaidCad;

      if (prStatusAcquiredDate && purchaseClosingDate) {
        const safeClosingStr = safeIsoDate(purchaseClosingDate, '2026-02-01');
        const safePrStr = safeIsoDate(prStatusAcquiredDate, safeClosingStr);
        const safeAppStr = safeIsoDate(rebateApplicationDate, '2026-10-31');

        const cTime = new Date(safeClosingStr).getTime();
        const prTime = new Date(safePrStr).getTime();
        const appTime = new Date(safeAppStr).getTime();

        const daysToPr = Math.floor((prTime - cTime) / (1000 * 60 * 60 * 24));
        const daysSincePr = Math.floor((appTime - prTime) / (1000 * 60 * 60 * 24));

        if (daysToPr >= 0 && daysToPr <= SPECULATION_TAX_CONSTANTS.ON_NRST_PR_ACQUISITION_DAYS) {
          if (occupied60 && soleSpouse) {
            if (daysSincePr <= SPECULATION_TAX_CONSTANTS.ON_NRST_CLAIM_LIMITATION_DAYS) {
              isNrstRebateEligible = true;
              nrstRebateAmountCad = nrstPaidCad;
              nrstRebateReason = `Full statutory 25% NRST rebate approved ($${nrstRebateAmountCad.toLocaleString()} CAD). PR acquired in ${daysToPr} days (<= 90-day statutory window) and claim filed in ${daysSincePr} days (<= 90-day deadline).`;
              actionPlan.push('Submit Form FT-001 (Ontario Non-Resident Speculation Tax Rebate Application) to Ministry of Finance.');
              actionPlan.push('Attach Land Transfer Tax affidavit, copy of registered deed, COPR / PR Card, and proof of principal residence occupancy within 60 days (utility bills, driver\'s licence).');
            } else {
              isNrstRebateEligible = false;
              nrstRebateReason = `Statutory limitation missed: Rebate application filed ${daysSincePr} days after PR acquisition (strict 90-day statutory deadline under O. Reg. 182/17 s. 4(3)).`;
              riskWarnings.push('DEADLINE MISSED: The Ministry of Finance strictly enforces the 90-day application deadline following PR status acquisition. Late filings are statutorily barred.');
            }
          } else {
            isNrstRebateEligible = false;
            nrstRebateReason = 'Failed occupancy or holding criteria: Must occupy home within 60 days of closing and hold title solely or exclusively with legal spouse.';
          }
        } else {
          isNrstRebateEligible = false;
          nrstRebateReason = `PR acquired in ${daysToPr} days after closing (exceeds statutory 90-day acquisition window).`;
          riskWarnings.push('STUDENT/WORKER REBATES REPEALED: Effective March 29, 2022, Ontario eliminated the 1-year work permit and 2-year international student NRST rebates. Only the 90-day PR rebate remains.');
        }
      } else {
        isNrstRebateEligible = false;
        nrstRebateReason = 'No PR acquisition date provided; 25% NRST remains payable without active rebate.';
      }
    }
  }

  return {
    assessmentDate: safeAssessmentDate,
    ownerName: safeOwner,
    propertyAddress: safeAddress,
    province: prov,
    propertyValuationCad: prov === 'BC' ? assessedValue : purchasePrice,
    isTaxExempt,
    applicableExemption,
    taxRatePercent,
    grossTaxPayableCad,
    netTaxPayableCad,
    ontarioNrstRebate: {
      nrstPaidCad,
      isNrstRebateEligible,
      nrstRebateAmountCad,
      nrstRebateReason,
      prAcquisitionWindowDays: SPECULATION_TAX_CONSTANTS.ON_NRST_PR_ACQUISITION_DAYS,
      claimLimitationDays: SPECULATION_TAX_CONSTANTS.ON_NRST_CLAIM_LIMITATION_DAYS
    },
    statutoryNotes,
    riskWarnings,
    actionPlan
  };
}
