// src/housing-tax-navigator.js
// Canadian Newcomer Homebuyer Eligibility & Foreign Buyer Ban / Speculation Tax Diagnostic.
// Evaluates federal Prohibition on the Purchase of Residential Property by Non-Canadians Act (SOR/2022-250 & SOR/2023-66),
// Ontario Non-Resident Speculation Tax (NRST 25% & O. Reg. 182/17 4-Year PR Rebate), BC Additional Property Transfer Tax (20%),
// and First-Time Home Buyer Land Transfer Tax refunds (Ontario & Toronto MLTT).
// Pure ES module with zero npm dependencies.

export const PROVINCIAL_FOREIGN_TAX_RULES = {
  ON: {
    taxName: 'Ontario Non-Resident Speculation Tax (NRST)',
    ratePercent: 25.0,
    statute: 'Land Transfer Tax Act (R.S.O. 1990, c. L.6) & O. Reg. 182/17',
    appliesProvinceWide: true,
    prRebateYears: 4,
    rebateApplicationDeadlineDays: 90,
    occupancyDeadlineDays: 60,
    hasStudentOrWorkerRebate: false // Eliminated March 29, 2022; ONLY PR rebate remains active law
  },
  BC: {
    taxName: 'British Columbia Additional Property Transfer Tax',
    ratePercent: 20.0,
    statute: 'Property Transfer Tax Act (R.S.B.C. 1996, c. 378)',
    appliesProvinceWide: false,
    designatedAreas: ['Greater Vancouver', 'Fraser Valley', 'Capital Regional District', 'Central Okanagan', 'Nanaimo'],
    bcPnpExemption: true
  },
  AB: {
    taxName: 'None (Alberta has 0% Foreign Buyer / Speculation Tax)',
    ratePercent: 0.0,
    statute: 'Land Titles Act (RSA 2000, c. L-4)',
    appliesProvinceWide: false
  },
  QC: {
    taxName: 'None (Quebec Municipal Welcome Tax Only)',
    ratePercent: 0.0,
    statute: 'Act respecting duties on transfers of immovables (CQLR c. D-15.1)',
    appliesProvinceWide: false
  }
};

export function calculateOntarioLandTransferTax(price) {
  const p = Math.max(0, Number(price) || 0);
  let tax = 0;
  if (p <= 55000) {
    tax = p * 0.005;
  } else if (p <= 250000) {
    tax = 55000 * 0.005 + (p - 55000) * 0.01;
  } else if (p <= 400000) {
    tax = 55000 * 0.005 + (250000 - 55000) * 0.01 + (p - 250000) * 0.015;
  } else if (p <= 2000000) {
    tax = 55000 * 0.005 + (250000 - 55000) * 0.01 + (400000 - 250000) * 0.015 + (p - 400000) * 0.02;
  } else {
    tax = 55000 * 0.005 + (250000 - 55000) * 0.01 + (400000 - 250000) * 0.015 + (2000000 - 400000) * 0.02 + (p - 2000000) * 0.025;
  }
  return Math.round(tax);
}

export function calculateTorontoMunicipalLtt(price) {
  // Toronto mirrors Ontario provincial brackets
  return calculateOntarioLandTransferTax(price);
}

export function calculateMinimumDownPaymentCad(price) {
  const p = Math.max(0, Number(price) || 0);
  if (p <= 500000) {
    return Math.round(p * 0.05);
  }
  if (p < 1000000) {
    return Math.round(500000 * 0.05 + (p - 500000) * 0.10);
  }
  return Math.round(p * 0.20);
}

export function evaluateHomebuyerEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    purchasePriceCad = 750000,
    province = 'ON',
    city = 'Toronto',
    immigrationStatus = 'pr',
    workPermitDaysRemaining = 365,
    hasPurchasedPreviousResidentialPropertyInCanada = false,
    studyPermitYearsTaxFiled = 0,
    studyPermitDaysPresentPerYear = 0,
    isFirstTimeHomeBuyer = true,
    willOccupyAsPrincipalResidenceWithin60Days = true,
    isSpouseCanadianOrPr = false
  } = safeParams;
  const price = Math.max(0, Number(purchasePriceCad) || 0);
  const normProvince = (province || 'ON').toUpperCase();
  const normCity = String(city || 'Toronto').trim();
  const status = (immigrationStatus || 'pr').toLowerCase();
  const wpDays = Math.max(0, Number(workPermitDaysRemaining) || 0);
  const taxesFiledYears = Math.max(0, Number(studyPermitYearsTaxFiled) || 0);
  const daysPresent = Math.max(0, Number(studyPermitDaysPresentPerYear) || 0);
  const prevProperty = Boolean(hasPurchasedPreviousResidentialPropertyInCanada);
  const spouseExempt = Boolean(isSpouseCanadianOrPr);
  const occupiesAsPrincipal = willOccupyAsPrincipalResidenceWithin60Days !== false;
  const isFthb = Boolean(isFirstTimeHomeBuyer);

  // 1. Federal Prohibition on Purchase by Non-Canadians Assessment
  let isLegallyPermittedToBuy = false;
  let statutoryStatus = 'prohibited';
  const criteriaAudit = [];

  if (status === 'pr' || status === 'citizen') {
    isLegallyPermittedToBuy = true;
    statutoryStatus = 'exempt_pr';
    criteriaAudit.push({
      criterion: 'Permanent Resident / Canadian Citizen Status',
      met: true,
      statute: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act s. 2 & s. 4(1)',
      note: 'Permanent Residents and Citizens are statutorily exempt from the foreign homebuyer prohibition.'
    });
  } else if (spouseExempt) {
    isLegallyPermittedToBuy = true;
    statutoryStatus = 'exempt_spousal';
    criteriaAudit.push({
      criterion: 'Spousal Exemption with Canadian Citizen or PR',
      met: true,
      statute: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act s. 4(2)(a)',
      note: 'Purchasing jointly with a spouse or common-law partner who is a Canadian Citizen, PR, or exempt person confers full statutory exemption.'
    });
  } else if (status === 'refugee') {
    isLegallyPermittedToBuy = true;
    statutoryStatus = 'exempt_refugee';
    criteriaAudit.push({
      criterion: 'Protected Person / Refugee Status under IRPA s. 95',
      met: true,
      statute: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act s. 4(2)(c)',
      note: 'Recognized protected persons and Convention refugees are legally exempt from the purchase prohibition.'
    });
  } else if (status === 'work_permit') {
    // SOR/2023-66 amendment to s. 3(1)(a):
    // Must have at least 183 days validity remaining on work permit on closing date,
    // and must not have purchased more than 1 residential property in Canada.
    const hasSufficientDays = wpDays >= 183;
    const noPriorPurchase = !prevProperty;

    criteriaAudit.push({
      criterion: 'Work Permit Validity of 183+ Days Remaining',
      met: hasSufficientDays,
      statute: 'SOR/2023-66 s. 3(1)(a)(i)',
      note: hasSufficientDays
        ? `Work permit has ${wpDays} days remaining (statutory minimum is 183 days).`
        : `Work permit only has ${wpDays} days remaining. Must have at least 183 days of valid status remaining on purchase date.`
    });

    criteriaAudit.push({
      criterion: 'Maximum 1 Residential Property in Canada',
      met: noPriorPurchase,
      statute: 'SOR/2023-66 s. 3(1)(a)(ii)',
      note: noPriorPurchase
        ? 'No prior residential property owned in Canada.'
        : 'Disqualified: Temporary residents cannot purchase more than one residential property.'
    });

    if (hasSufficientDays && noPriorPurchase) {
      isLegallyPermittedToBuy = true;
      statutoryStatus = 'exempt_work_permit';
    } else {
      isLegallyPermittedToBuy = false;
      statutoryStatus = 'prohibited';
    }
  } else if (status === 'study_permit') {
    // SOR/2022-250 s. 3(1)(b):
    // 5 years tax returns filed, 244 days present in each of 5 years, price <= $500,000, no prior property
    const taxesMet = taxesFiledYears >= 5;
    const daysMet = daysPresent >= 244;
    const priceMet = price <= 500000;
    const noPrior = !prevProperty;

    criteriaAudit.push({
      criterion: 'Canadian Income Tax Returns Filed for 5 Prior Taxation Years',
      met: taxesMet,
      statute: 'SOR/2022-250 s. 3(1)(b)(i)',
      note: taxesMet ? `${taxesFiledYears} years filed.` : `Only ${taxesFiledYears}/5 years filed.`
    });

    criteriaAudit.push({
      criterion: 'Physically Present in Canada for 244+ Days in Each of 5 Years',
      met: daysMet,
      statute: 'SOR/2022-250 s. 3(1)(b)(ii)',
      note: daysMet ? `${daysPresent} days present/yr.` : `Only ${daysPresent}/244 required days/yr.`
    });

    criteriaAudit.push({
      criterion: 'Purchase Price Cap of $500,000 CAD',
      met: priceMet,
      statute: 'SOR/2022-250 s. 3(1)(b)(iii)',
      note: priceMet ? `$${price.toLocaleString()} is within $500,000 statutory cap.` : `$${price.toLocaleString()} exceeds $500,000 cap for international students.`
    });

    if (taxesMet && daysMet && priceMet && noPrior) {
      isLegallyPermittedToBuy = true;
      statutoryStatus = 'exempt_study_permit';
    } else {
      isLegallyPermittedToBuy = false;
      statutoryStatus = 'prohibited';
    }
  } else {
    // Visitor or other unauthorized category
    isLegallyPermittedToBuy = false;
    statutoryStatus = 'prohibited';
    criteriaAudit.push({
      criterion: 'Eligible Immigration Category',
      met: false,
      statute: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act s. 4',
      note: 'Visitors, tourists, and non-resident foreign nationals are strictly prohibited from purchasing residential real estate in Canada.'
    });
  }

  // 2. Provincial Speculation / Non-Resident Tax Assessment
  const provRules = PROVINCIAL_FOREIGN_TAX_RULES[normProvince] || PROVINCIAL_FOREIGN_TAX_RULES.ON;
  let nonResidentTaxRate = 0;
  let upfrontNonResidentTax = 0;
  let isEligibleForRebate = false;
  let rebateProgram = 'None';
  let potentialRebateAmountCad = 0;
  const rebateConditions = [];

  const isExemptFromProvincialForeignTax = (status === 'pr' || status === 'citizen' || status === 'refugee' || spouseExempt);

  if (!isExemptFromProvincialForeignTax && provRules.ratePercent > 0) {
    nonResidentTaxRate = provRules.ratePercent;
    upfrontNonResidentTax = Math.round(price * (nonResidentTaxRate / 100));

    if (normProvince === 'ON') {
      // Under O. Reg. 182/17 s. 4.1: Permanent Resident 4-Year Rebate
      rebateProgram = 'Ontario O. Reg. 182/17 Permanent Resident 4-Year Full Rebate';
      isEligibleForRebate = occupiesAsPrincipal;
      potentialRebateAmountCad = upfrontNonResidentTax;

      rebateConditions.push('Attain Permanent Resident (PR) status within 4 calendar years of the closing date.');
      rebateConditions.push('Move in and occupy the home as your principal residence within 60 days of closing.');
      rebateConditions.push('Hold legal ownership exclusively (or only jointly with your lawful spouse).');
      rebateConditions.push('Submit the formal NRST Rebate application to the Ministry of Finance within 90 days of becoming a Permanent Resident.');
      rebateConditions.push('Statutory Interest Benefit: Ontario pays compounded interest on the refunded 25% tax upon successful rebate approval.');
    } else if (normProvince === 'BC') {
      rebateProgram = 'BC Additional Property Transfer Tax Exemption (BC PNP Pathway)';
      rebateConditions.push('Must hold a valid BC Provincial Nominee Program (BC PNP) certificate at closing or achieve PR status within 1 year.');
    }
  }

  // 3. Land Transfer Tax (LTT) & First-Time Homebuyer Rebates
  let provincialLtt = 0;
  let municipalLtt = 0;
  let fthbProvincialRebate = 0;
  let fthbMunicipalRebate = 0;

  if (normProvince === 'ON') {
    provincialLtt = calculateOntarioLandTransferTax(price);

    // First-time homebuyer provincial rebate (max $4,000)
    if (isFthb) {
      fthbProvincialRebate = Math.min(provincialLtt, 4000);
    }

    // Toronto Municipal LTT
    if (normCity.toLowerCase() === 'toronto') {
      municipalLtt = calculateTorontoMunicipalLtt(price);
      if (isFthb) {
        fthbMunicipalRebate = Math.min(municipalLtt, 4475);
      }
    }
  }

  const totalFirstTimeHomebuyerRebate = fthbProvincialRebate + fthbMunicipalRebate;
  const netLandTransferTax = (provincialLtt - fthbProvincialRebate) + (municipalLtt - fthbMunicipalRebate);

  // 4. Financial Closing Summary
  const minDownPayment = calculateMinimumDownPaymentCad(price);
  const legalDisbursementsEstimateCad = 2500;
  const totalUpfrontClosingCashRequired = minDownPayment + upfrontNonResidentTax + netLandTransferTax + legalDisbursementsEstimateCad;

  const statutoryAdvisories = [
    'Federal $10,000 Fine & Forced Sale Risk: Under section 6 & 7 of the Prohibition Act, non-Canadians who purchase property unlawfully—and every professional (realtor, lawyer, lender) who counsels them—are liable to a $10,000 fine and the court can order the property sold with zero profit returned.',
    'Work Permit 183-Day Rule (SOR/2023-66): Temporary workers must ensure their work permit has at least 183 days of validity remaining on the exact closing date of title transfer, not merely the offer acceptance date.',
    'Ontario 25% NRST Elimination of Student/Worker Rebates: Be aware that Ontario permanently repealed the international student and foreign worker NRST rebates on March 29, 2022. Only the Permanent Resident rebate (becoming PR within 4 years) remains valid law under O. Reg. 182/17.',
    'First-Time Homebuyer 18-Month Rule: In Ontario, if you are not a PR at closing, you cannot get the $4,000 / $4,475 FTHB rebate at closing, but you can claim it as a refund if you obtain PR status within 18 months of purchase.'
  ];

  return {
    asOf: new Date().toISOString().slice(0, 10),
    purchasePriceCad: price,
    province: normProvince,
    city: normCity,
    immigrationStatus: status,
    federalBanAssessment: {
      isLegallyPermittedToBuy,
      statutoryStatus,
      statute: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act (S.C. 2022, c. 10, s. 235)',
      regulation: 'SOR/2022-250 (as amended by SOR/2023-66)',
      criteriaAudit,
      legalRiskNotice: isLegallyPermittedToBuy
        ? 'Lawfully eligible to purchase residential real estate under federal statutory exemptions.'
        : 'STRICTLY PROHIBITED: Purchasing residential property without meeting statutory criteria is a federal offence liable to a $10,000 fine and court-ordered forced sale under section 7.'
    },
    provincialTaxAssessment: {
      taxName: provRules.taxName,
      statute: provRules.statute,
      ratePercent: nonResidentTaxRate,
      upfrontNonResidentTaxCad: upfrontNonResidentTax,
      isEligibleForStatutoryRebate: isEligibleForRebate,
      rebateProgram,
      potentialRebateAmountCad,
      rebateConditions
    },
    closingTaxesAndRebates: {
      provincialLandTransferTaxCad: provincialLtt,
      torontoMunicipalLandTransferTaxCad: municipalLtt,
      firstTimeHomeBuyerRebateCad: totalFirstTimeHomebuyerRebate,
      netLandTransferTaxCad: netLandTransferTax,
      upfrontNonResidentTaxCad: upfrontNonResidentTax,
      totalClosingTaxesCad: netLandTransferTax + upfrontNonResidentTax
    },
    financialClosingSummary: {
      minimumDownPaymentCad: minDownPayment,
      minimumDownPaymentPercent: Number(((minDownPayment / (price || 1)) * 100).toFixed(1)),
      estimatedLegalAndDisbursementsCad: legalDisbursementsEstimateCad,
      totalUpfrontCashRequiredAtClosingCad: totalUpfrontClosingCashRequired,
      futureRecoverableRebatesCad: potentialRebateAmountCad + (isFthb && !isExemptFromProvincialForeignTax ? totalFirstTimeHomebuyerRebate : 0)
    },
    statutoryAdvisories,
    statutoryAuthority: 'Prohibition on the Purchase of Residential Property by Non-Canadians Act (S.C. 2022, c. 10, s. 235) & Ontario Land Transfer Tax Act (R.S.O. 1990, c. L.6)'
  };
}
