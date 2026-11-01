// src/moving-tax-calculator.js
// CRA Form T1-M Moving Expense Deduction & 40-Kilometer Relocation Engine
// Based on Canada Income Tax Act (ITA) s. 62, s. 63, and CRA Form T1-M guidelines.

export const CRA_PROVINCIAL_VEHICLE_RATES_2024 = {
  ON: 0.70, // $0.70 per km for Ontario
  BC: 0.68,
  AB: 0.65,
  QC: 0.68,
  MB: 0.67,
  SK: 0.66,
  NS: 0.71,
  NB: 0.70,
  NL: 0.74,
  PE: 0.70
};

export const CRA_SIMPLIFIED_DAILY_MEAL_RATE_CAD = 69.00; // $23 per meal, max 3 meals ($69/day per person)
export const CRA_MAX_TEMPORARY_LIVING_DAYS = 15; // ITA s. 62(3)(b) strict 15-day limit

export function calculateMovingTaxDeduction(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    distanceOldHomeToNewWorkKm = 85,
    distanceNewHomeToNewWorkKm = 15,
    householdMembersTraveling = 1,
    transportAndStorageCostsCad = 2800,
    travelDays = 2,
    travelDistanceKm = 450,
    province = 'ON',
    useSimplifiedMethod = true,
    detailedTravelMealsCad = 0,
    detailedTravelVehicleCad = 0,
    temporaryLivingDays = 7,
    temporaryLivingLodgingCad = 1200,
    temporaryLivingMealsCad = 450,
    leaseCancellationCostCad = 1500,
    incidentalAddressChangeCostsCad = 250,
    employmentIncomeEarnedAtNewLocationCad = 45000,
    employerReimbursementCad = 1000,
    applicantName = 'Relocating Newcomer',
    taxYear = 2024
  } = safeParams;
  const toNonNegative = (val, defaultVal = 0) => Number.isFinite(Number(val)) && Number(val) >= 0 ? Number(val) : defaultVal;
  const distOld = toNonNegative(distanceOldHomeToNewWorkKm, 85);
  const distNew = toNonNegative(distanceNewHomeToNewWorkKm, 15);
  const members = Math.max(1, Math.round(toNonNegative(householdMembersTraveling, 1)));
  const transportCosts = toNonNegative(transportAndStorageCostsCad, 0);
  const days = toNonNegative(travelDays, 1);
  const distKm = toNonNegative(travelDistanceKm, 0);
  const rawTempDays = toNonNegative(temporaryLivingDays, 0);
  const allowableTempDays = Math.min(rawTempDays, CRA_MAX_TEMPORARY_LIVING_DAYS);
  const isTempDaysCapped = rawTempDays > CRA_MAX_TEMPORARY_LIVING_DAYS;
  const tempLodging = toNonNegative(temporaryLivingLodgingCad, 0);
  const tempMeals = toNonNegative(temporaryLivingMealsCad, 0);
  const leaseCancel = toNonNegative(leaseCancellationCostCad, 0);
  const incidentals = toNonNegative(incidentalAddressChangeCostsCad, 0);
  const newIncome = toNonNegative(employmentIncomeEarnedAtNewLocationCad, 0);
  const reimbursement = toNonNegative(employerReimbursementCad, 0);
  const cleanApplicant = typeof applicantName === 'string' && applicantName.trim() ? applicantName.trim().slice(0, 120) : 'Relocating Newcomer';

  // 1. CRA 40-Kilometer Relocation Test (ITA s. 62(1))
  const distanceCloserKm = Math.max(0, distOld - distNew);
  const isEligible40Km = distanceCloserKm >= 40;

  // 2. Travel Expenses Calculation
  let travelMealsTotalCad = 0;
  let travelVehicleTotalCad = 0;

  if (useSimplifiedMethod) {
    travelMealsTotalCad = days * CRA_SIMPLIFIED_DAILY_MEAL_RATE_CAD * members;
    const perKmRate = CRA_PROVINCIAL_VEHICLE_RATES_2024[province.toUpperCase()] || 0.70;
    travelVehicleTotalCad = Math.round(distKm * perKmRate * 100) / 100;
  } else {
    travelMealsTotalCad = toNonNegative(detailedTravelMealsCad, 0);
    travelVehicleTotalCad = toNonNegative(detailedTravelVehicleCad, 0);
  }
  const totalTransitTravelExpensesCad = travelMealsTotalCad + travelVehicleTotalCad;

  // 3. Temporary Living Expenses (Max 15 days under ITA s. 62(3)(b))
  const tempDailyRatio = rawTempDays > 0 ? allowableTempDays / rawTempDays : 1;
  const allowableTempLivingCad = Math.round((tempLodging + tempMeals) * tempDailyRatio * 100) / 100;

  // 4. Aggregate Eligible Moving Expenses
  const grossEligibleExpensesCad =
    transportCosts +
    totalTransitTravelExpensesCad +
    allowableTempLivingCad +
    leaseCancel +
    incidentals;

  // 5. Net Claimable Expenses After Employer Reimbursement
  const netClaimableExpensesCad = Math.max(0, grossEligibleExpensesCad - reimbursement);

  // 6. Deduction Ceiling against New Income & Carryforward (ITA s. 62(1)(b))
  const allowableDeductionCurrentYearCad = isEligible40Km
    ? Math.min(netClaimableExpensesCad, newIncome)
    : 0;

  const carryforwardToFutureYearsCad = isEligible40Km
    ? Math.max(0, netClaimableExpensesCad - allowableDeductionCurrentYearCad)
    : 0;

  // Estimated Tax Savings (using approx 30% average marginal bracket)
  const estimatedTaxSavingsCad = Math.round(allowableDeductionCurrentYearCad * 0.305 * 100) / 100;

  return {
    taxYear,
    applicantName: cleanApplicant,
    province,
    eligibilityCheck: {
      isEligible: isEligible40Km,
      distanceCloserKm,
      requiredMinimumCloserKm: 40,
      ruleSummary: isEligible40Km
        ? `Eligible: Your new home brings you ${distanceCloserKm} km closer to your new work location (exceeds the 40-km CRA statutory requirement).`
        : `Ineligible: Your move only brings you ${distanceCloserKm} km closer (CRA requires at least 40 km closer under ITA s. 62(1)).`
    },
    expenseBreakdown: {
      transportAndStorageCostsCad,
      travelExpenses: {
        methodUsed: useSimplifiedMethod ? 'CRA Simplified Flat Rate' : 'Detailed Receipts',
        travelMealsCad: travelMealsTotalCad,
        travelVehicleCad: travelVehicleTotalCad,
        totalTravelCad: totalTransitTravelExpensesCad
      },
      temporaryLiving: {
        claimedDays: rawTempDays,
        statutoryCappedDays: allowableTempDays,
        isCapped: isTempDaysCapped,
        allowableCostCad: allowableTempLivingCad,
        statutoryLimitNote: 'ITA s. 62(3)(b) caps temporary living expenses to a maximum of 15 days near the new or old residence.'
      },
      leaseCancellationCostCad,
      incidentalAddressChangeCostsCad,
      grossTotalExpensesCad: grossEligibleExpensesCad,
      employerReimbursementDeductionCad: employerReimbursementCad,
      netClaimableExpensesCad
    },
    taxOptimization: {
      employmentIncomeAtNewLocationCad: employmentIncomeEarnedAtNewLocationCad,
      allowableDeductionCurrentYearCad,
      carryforwardToFutureYearsCad,
      estimatedTaxRefundSavingsCad: estimatedTaxSavingsCad,
      carryforwardRuleNote: carryforwardToFutureYearsCad > 0
        ? `You have $${carryforwardToFutureYearsCad.toLocaleString()} CAD in excess moving expenses that can be carried forward and deducted against future years' employment income at this location.`
        : 'All eligible moving expenses fully absorbed against current year qualifying employment income.'
    },
    requiredDocumentation: [
      'CRA Form T1-M (Moving Expenses Deduction) filled and retained with tax records.',
      'Moving company contract and paid receipt for furniture/goods transit.',
      'Travel log showing departure date, arrival date, vehicle odometer readings, and destination.',
      'Lease cancellation receipt or formal landlord penalty notice for breaking old tenancy.',
      'Letter or pay stub from new employer confirming employment start date and location.'
    ],
    statutoryBasis: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.)) ss. 62(1), 62(3); CRA Form T1-M.'
  };
}
