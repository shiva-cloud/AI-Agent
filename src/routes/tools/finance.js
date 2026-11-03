// src/routes/tools/finance.js
// Domain route handlers for finance tools.

import { auditBcSvtNoticeOfObjection } from '../../british-columbia-speculation-tax-audit-appeal-navigator.js';
import { calculateCreditTrajectory } from '../../statutory-calculators.js';
import { calculateMovingTaxDeduction } from '../../moving-tax-calculator.js';
import { calculateNewcomerBenefits } from '../../newcomer-benefits-calculator.js';
import { evaluateAutoInsuranceProfile } from '../../auto-insurance-navigator.js';
import { evaluateBankingAndCreditStrategy } from '../../banking-navigator.js';
import { evaluateBcSpeculationTaxDeclaration } from '../../bc-speculation-tax-declaration-navigator.js';
import { evaluateBusinessStructure } from '../../business-navigator.js';
import { evaluateChildCareSubsidy } from '../../childcare-subsidy-navigator.js';
import { evaluateChildDisabilityBenefit } from '../../child-disability-benefit-navigator.js';
import { evaluateChildcareSupport } from '../../childcare-navigator.js';
import { evaluateConsumerCreditAgreement } from '../../high-cost-credit-navigator.js';
import { evaluateCrossBorderTaxObligations } from '../../cross-border-tax-navigator.js';
import { evaluateHomebuyerEligibility } from '../../housing-tax-navigator.js';
import { evaluateHomebuyerTaxIncentives } from '../../homebuyer-tax-incentives.js';
import { evaluateMovingExpensesDeduction } from '../../moving-tax-navigator.js';
import { evaluateNewcomerWealthPlan } from '../../cra-newcomer-wealth-navigator.js';
import { evaluateOasGisEligibility } from '../../oas-gis-navigator.js';
import { evaluateParentalLeave } from '../../parental-leave-navigator.js';
import { evaluateProofOfFunds } from '../../proof-of-funds.js';
import { evaluateRealEstateAssignment } from '../../real-estate-assignment-navigator.js';
import { evaluateSocialAssistance } from '../../social-assistance-navigator.js';
import { evaluateSpeculationTaxAndRebates } from '../../speculation-tax-rebate-navigator.js';
import { evaluateTaxShield } from '../../tax-shield-optimizer.js';
import { evaluateVoluntaryDisclosure } from '../../cra-voluntary-disclosure.js';
import { todayIso } from '../../text-input.js';

export function handleFinanceGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/credit-simulator') {
      const limit = url.searchParams.get('limit') ?? 2000;
      const spend = url.searchParams.get('spend') ?? 450;
      const strategy = url.searchParams.get('strategy') ?? 'full_on_time';
      const inquiries = url.searchParams.get('inquiries') ?? 1;
      return send(200, calculateCreditTrajectory({ limit, spend, strategy, inquiries }));
    }

    if(path==='/v1/tools/cra-benefits') {
      const province = url.searchParams.get('province') || 'ON';
      const adjustedFamilyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 30000;
      const maritalStatus = url.searchParams.get('marital') || 'single';
      const childrenUnder6Count = Number(url.searchParams.get('under6') || 0);
      const children6to17Count = Number(url.searchParams.get('over6') || 0);
      const landingDateStr = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      return send(200, calculateNewcomerBenefits({ province, adjustedFamilyNetIncomeCad, maritalStatus, childrenUnder6Count, children6to17Count, landingDateStr }));
    }

    if(path==='/v1/tools/childcare-support') {
      const city = url.searchParams.get('city') || 'Toronto';
      const annualFamilyIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 0;
      const immigrationStatus = url.searchParams.get('status') || 'pr';
      const ageGroup = url.searchParams.get('ageGroup') || 'toddler';
      return send(200, evaluateChildcareSupport({
        city,
        annualFamilyIncomeCad,
        immigrationStatus,
        children: [{ ageGroup }]
      }));
    }

    if(path==='/v1/tools/homebuyer-eligibility') {
      const purchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 750000;
      const province = url.searchParams.get('province') || 'ON';
      const city = url.searchParams.get('city') || 'Toronto';
      const immigrationStatus = url.searchParams.get('status') || 'pr';
      const workPermitDaysRemaining = url.searchParams.get('wpDays') ? Number(url.searchParams.get('wpDays')) : 365;
      const isFirstTimeHomeBuyer = url.searchParams.get('isFthb') !== 'false';
      const isSpouseCanadianOrPr = url.searchParams.get('spouseExempt') === 'true';
      return send(200, evaluateHomebuyerEligibility({
        purchasePriceCad,
        province,
        city,
        immigrationStatus,
        workPermitDaysRemaining,
        isFirstTimeHomeBuyer,
        isSpouseCanadianOrPr
      }));
    }

    if(path==='/v1/tools/banking-comparator') {
      const selectedBank = url.searchParams.get('bank') || 'all';
      const monthlySpendingCad = url.searchParams.get('spend') ? Number(url.searchParams.get('spend')) : 600;
      const targetCreditScore = url.searchParams.get('target') ? Number(url.searchParams.get('target')) : 720;
      const hasPostpaidPhonePlan = url.searchParams.get('phone') !== 'false';
      const immigrationCategory = url.searchParams.get('status') || 'pr';
      return send(200, evaluateBankingAndCreditStrategy({
        selectedBank,
        monthlySpendingCad,
        targetCreditScore,
        hasPostpaidPhonePlan,
        immigrationCategory
      }));
    }

    if(path==='/v1/tools/parental-leave') {
      const province = url.searchParams.get('province') || 'ON';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const insurableHoursWorkedPast52Weeks = url.searchParams.get('hours') ? Number(url.searchParams.get('hours')) : 700;
      const annualGrossSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 60000;
      const leaveType = url.searchParams.get('leaveType') || 'maternity_and_parental';
      const parentalOption = url.searchParams.get('option') || 'standard';
      const isSharingWithPartner = url.searchParams.get('sharing') !== 'false';
      const employerServiceWeeks = url.searchParams.get('serviceWeeks') ? Number(url.searchParams.get('serviceWeeks')) : 16;
      const workPermitExpiryDate = url.searchParams.get('expiryDate') || null;
      return send(200, evaluateParentalLeave({
        province,
        immigrationStatus,
        insurableHoursWorkedPast52Weeks,
        annualGrossSalaryCad,
        leaveType,
        parentalOption,
        isSharingWithPartner,
        employerServiceWeeks,
        workPermitExpiryDate
      }));
    }

    if(path==='/v1/tools/business-structure') {
      const province = url.searchParams.get('province') || 'ON';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const workPermitType = url.searchParams.get('permitType') || 'none';
      const projectedAnnualRevenueCad = url.searchParams.get('revenue') ? Number(url.searchParams.get('revenue')) : 120000;
      const annualBusinessExpensesCad = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 15000;
      const personalLivingExpensesCad = url.searchParams.get('living') ? Number(url.searchParams.get('living')) : 55000;
      const clientCount = url.searchParams.get('clients') ? Number(url.searchParams.get('clients')) : 2;
      const subcontractorHiringPermitted = url.searchParams.get('subcontractors') !== 'false';
      const providesOwnEquipmentAndTools = url.searchParams.get('ownTools') !== 'false';
      const hasRiskOfFinancialLoss = url.searchParams.get('riskOfLoss') !== 'false';
      const industryType = url.searchParams.get('industry') || 'tech_consulting';
      return send(200, evaluateBusinessStructure({
        province,
        immigrationStatus,
        workPermitType,
        projectedAnnualRevenueCad,
        annualBusinessExpensesCad,
        personalLivingExpensesCad,
        clientCount,
        subcontractorHiringPermitted,
        providesOwnEquipmentAndTools,
        hasRiskOfFinancialLoss,
        industryType
      }));
    }

    if(path==='/v1/tools/moving-tax-deduction') {
      const province = url.searchParams.get('province') || 'ON';
      const relocationPurpose = url.searchParams.get('purpose') || 'employment';
      const oldCountry = url.searchParams.get('oldCountry') || 'United States';
      const oldCity = url.searchParams.get('oldCity') || 'Seattle';
      const newCity = url.searchParams.get('newCity') || 'Vancouver';
      const distanceKm = url.searchParams.get('distance') ? Number(url.searchParams.get('distance')) : 230;
      const householdSize = url.searchParams.get('householdSize') ? Number(url.searchParams.get('householdSize')) : 1;
      const arrivalDateStr = url.searchParams.get('arrivalDate') || '2026-08-01';
      const canadianIncomeEarnedInYearCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 35000;
      const travelExpensesCad = url.searchParams.get('travel') ? Number(url.searchParams.get('travel')) : 1800;
      const moversAndShippingCad = url.searchParams.get('shipping') ? Number(url.searchParams.get('shipping')) : 4500;
      const temporaryLivingDays = url.searchParams.get('livingDays') ? Number(url.searchParams.get('livingDays')) : 12;
      const temporaryLivingDailyCostCad = url.searchParams.get('livingDaily') ? Number(url.searchParams.get('livingDaily')) : 180;
      const leaseCancellationPenaltyCad = url.searchParams.get('leasePenalty') ? Number(url.searchParams.get('leasePenalty')) : 1200;
      const utilityAndAddressChangeFeesCad = url.searchParams.get('utilityFees') ? Number(url.searchParams.get('utilityFees')) : 350;
      const otherIncidentalCostsCad = url.searchParams.get('incidentals') ? Number(url.searchParams.get('incidentals')) : 200;
      const employerReimbursementCad = url.searchParams.get('reimbursement') ? Number(url.searchParams.get('reimbursement')) : 0;
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : null;

      return send(200, evaluateMovingExpensesDeduction({
        province,
        relocationPurpose,
        oldCountry,
        oldCity,
        newCity,
        distanceKm,
        householdSize,
        arrivalDateStr,
        canadianIncomeEarnedInYearCad,
        travelExpensesCad,
        moversAndShippingCad,
        temporaryLivingDays,
        temporaryLivingDailyCostCad,
        leaseCancellationPenaltyCad,
        utilityAndAddressChangeFeesCad,
        otherIncidentalCostsCad,
        employerReimbursementCad,
        marginalTaxRatePercent
      }));
    }

    if(path==='/v1/tools/homebuyer-tax-incentives') {
      const province = url.searchParams.get('province') || 'ON';
      const city = url.searchParams.get('city') || 'Toronto';
      const homePurchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 750000;
      const isFirstTimeHomeBuyer = url.searchParams.get('fthb') !== 'false';
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : 35.0;
      const a1Income = url.searchParams.get('a1Income') ? Number(url.searchParams.get('a1Income')) : 85000;
      const a1Rrsp = url.searchParams.get('a1Rrsp') ? Number(url.searchParams.get('a1Rrsp')) : 45000;
      const a1Fhsa = url.searchParams.get('a1Fhsa') ? Number(url.searchParams.get('a1Fhsa')) : 16000;
      const hasSpouse = url.searchParams.get('spouse') === 'true';
      const a2Income = url.searchParams.get('a2Income') ? Number(url.searchParams.get('a2Income')) : 65000;
      const a2Rrsp = url.searchParams.get('a2Rrsp') ? Number(url.searchParams.get('a2Rrsp')) : 25000;
      const a2Fhsa = url.searchParams.get('a2Fhsa') ? Number(url.searchParams.get('a2Fhsa')) : 8000;
      const plannedPurchaseYear = url.searchParams.get('year') ? Number(url.searchParams.get('year')) : 2026;

      return send(200, evaluateHomebuyerTaxIncentives({
        province,
        city,
        homePurchasePriceCad,
        isFirstTimeHomeBuyer,
        marginalTaxRatePercent,
        applicant1: {
          annualIncomeCad: a1Income,
          rrspBalanceCad: a1Rrsp,
          fhsaBalanceCad: a1Fhsa,
          fhsaYearsActive: 2
        },
        hasSpouseOrPartner: hasSpouse,
        applicant2: {
          annualIncomeCad: a2Income,
          rrspBalanceCad: a2Rrsp,
          fhsaBalanceCad: a2Fhsa,
          fhsaYearsActive: 1
        },
        plannedPurchaseYear
      }));
    }

    if(path==='/v1/tools/auto-insurance') {
      const province = url.searchParams.get('province') || 'ON';
      const postalCode = url.searchParams.get('postalCode') || 'L6Y 1A1';
      const annualGrossIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 75000;
      const employmentStatus = url.searchParams.get('employment') || 'employed';
      const weeksEmployedPast52 = url.searchParams.get('weeks') ? Number(url.searchParams.get('weeks')) : 52;
      const foreignDrivingYears = url.searchParams.get('foreignYears') ? Number(url.searchParams.get('foreignYears')) : 5;
      const hasForeignExperienceLetter = url.searchParams.get('experienceLetter') === 'true';
      const canadianLicenceClass = url.searchParams.get('licenceClass') || 'G';
      const optionalIrbEndorsementWeeklyCad = url.searchParams.get('irbWeekly') ? Number(url.searchParams.get('irbWeekly')) : 400;
      const experiencedRefusalOrUnreasonableDelay = url.searchParams.get('refusal') === 'true';

      return send(200, evaluateAutoInsuranceProfile({
        province,
        postalCode,
        annualGrossIncomeCad,
        employmentStatus,
        weeksEmployedPast52,
        foreignDrivingYears,
        hasForeignExperienceLetter,
        canadianLicenceClass,
        optionalIrbEndorsementWeeklyCad,
        experiencedRefusalOrUnreasonableDelay
      }));
    }

    if(path==='/v1/tools/cra-voluntary-disclosure') {
      const landingYear = url.searchParams.get('landingYear') ? Number(url.searchParams.get('landingYear')) : 2022;
      const taxYearsOmitted = url.searchParams.get('years') ? url.searchParams.get('years').split(',').map(Number) : [2023, 2024];
      const maxForeignCostAmountCad = url.searchParams.get('foreignCost') ? Number(url.searchParams.get('foreignCost')) : 175000;
      const foreignIncomeAnnualCad = url.searchParams.get('foreignIncome') ? Number(url.searchParams.get('foreignIncome')) : 8000;
      const hasCraContactedOrAudited = url.searchParams.get('craContacted') === 'true';
      const hasActiveOffshoreEntitiesOrShellCompanies = url.searchParams.get('offshoreShell') === 'true';
      const hasT1135BeenFiled = url.searchParams.get('t1135Filed') === 'true';
      const unreportedDomesticIncomeCad = url.searchParams.get('domesticIncome') ? Number(url.searchParams.get('domesticIncome')) : 0;
      const assessmentYear = url.searchParams.get('assessmentYear') ? Number(url.searchParams.get('assessmentYear')) : 2026;
      return send(200, evaluateVoluntaryDisclosure({
        landingYear,
        taxYearsOmitted,
        maxForeignCostAmountCad,
        foreignIncomeAnnualCad,
        hasCraContactedOrAudited,
        hasActiveOffshoreEntitiesOrShellCompanies,
        hasT1135BeenFiled,
        unreportedDomesticIncomeCad,
        assessmentYear
      }));
    }

    if(path==='/v1/tools/social-assistance') {
      const program = url.searchParams.get('program') || 'ontario_works';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const familyComposition = url.searchParams.get('family') || 'single';
      const dependentChildrenCount = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 0;
      const liquidAssetsCad = url.searchParams.get('assets') ? Number(url.searchParams.get('assets')) : 4500;
      const primaryVehicleValueCad = url.searchParams.get('vehicleValue') ? Number(url.searchParams.get('vehicleValue')) : 8000;
      const ownsPrimaryResidence = url.searchParams.get('ownsHome') === 'true';
      const grossMonthlyEmploymentIncomeCad = url.searchParams.get('earnedIncome') ? Number(url.searchParams.get('earnedIncome')) : 0;
      const monthlyShelterCostCad = url.searchParams.get('shelter') ? Number(url.searchParams.get('shelter')) : 650;
      const isSponsoredImmigrant = url.searchParams.get('sponsored') === 'true';
      const sponsorshipYearsRemaining = url.searchParams.get('sponsorYears') ? Number(url.searchParams.get('sponsorYears')) : 0;

      return send(200, evaluateSocialAssistance({
        program,
        immigrationStatus,
        familyComposition,
        dependentChildrenCount,
        liquidAssetsCad,
        primaryVehicleValueCad,
        ownsPrimaryResidence,
        grossMonthlyEmploymentIncomeCad,
        monthlyShelterCostCad,
        isSponsoredImmigrant,
        sponsorshipYearsRemaining
      }));
    }

    if(path==='/v1/tools/high-cost-credit') {
      const province = url.searchParams.get('province') || 'ON';
      const loanType = url.searchParams.get('type') || 'payday_loan';
      const principalBorrowedCad = url.searchParams.get('principal') ? Number(url.searchParams.get('principal')) : 1000;
      const termDays = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 14;
      const statedAprPercent = url.searchParams.get('apr') ? Number(url.searchParams.get('apr')) : 46.5;
      const totalFeesChargedCad = url.searchParams.get('fees') ? Number(url.searchParams.get('fees')) : 180;
      const netMonthlyIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 2400;
      const isRolloverLoan = url.searchParams.get('rollover') === 'true';
      const lenderAttemptedWageAssignment = url.searchParams.get('wageAssignment') === 'true';
      const daysSinceAgreement = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 1;
      const borrowerName = url.searchParams.get('borrower') || 'Consumer';
      const lenderName = url.searchParams.get('lender') || 'Quick Cash Financial Ltd.';
      return send(200, evaluateConsumerCreditAgreement({
        province,
        loanType,
        principalBorrowedCad,
        termDays,
        statedAprPercent,
        totalFeesChargedCad,
        netMonthlyIncomeCad,
        isRolloverLoan,
        lenderAttemptedWageAssignment,
        daysSinceAgreement,
        borrowerName,
        lenderName
      }));
    }

    if(path==='/v1/tools/cross-border-tax') {
      const isCanadianTaxResident = url.searchParams.get('isResident') !== 'false';
      const taxYear = url.searchParams.get('taxYear') ? Number(url.searchParams.get('taxYear')) : 2026;
      const isFirstYearCanadianResident = url.searchParams.get('firstYear') === 'true';
      const foreignPropertyCostAmountCad = url.searchParams.get('foreignCost') ? Number(url.searchParams.get('foreignCost')) : 125000;
      const hasForeignRentalProperty = url.searchParams.get('hasRental') === 'true';
      const foreignRentalIncomeCad = url.searchParams.get('rentalIncome') ? Number(url.searchParams.get('rentalIncome')) : 0;
      const isUsPerson = url.searchParams.get('isUsPerson') === 'true';
      const usFilingStatus = url.searchParams.get('usStatus') || 'single';
      const peakForeignAccountsUsd = url.searchParams.get('peakUsd') ? Number(url.searchParams.get('peakUsd')) : 15000;
      const yearEndForeignAccountsUsd = url.searchParams.get('yearEndUsd') ? Number(url.searchParams.get('yearEndUsd')) : 12000;
      const hasCanadianTfsa = url.searchParams.get('hasTfsa') === 'true';
      const hasCanadianRrsp = url.searchParams.get('hasRrsp') === 'true';
      const hasCanadianResp = url.searchParams.get('hasResp') === 'true';
      const hasCanadianFhsa = url.searchParams.get('hasFhsa') === 'true';
      const holdsCanadianMutualFundsOrEtfs = url.searchParams.get('hasPfic') === 'true';
      const daysLateT1135 = url.searchParams.get('daysLate') ? Number(url.searchParams.get('daysLate')) : 0;
      const clientName = url.searchParams.get('client') || 'Cross-Border Client';
      return send(200, evaluateCrossBorderTaxObligations({
        isCanadianTaxResident,
        taxYear,
        isFirstYearCanadianResident,
        foreignPropertyCostAmountCad,
        hasForeignRentalProperty,
        foreignRentalIncomeCad,
        isUsPerson,
        usFilingStatus,
        peakForeignAccountsUsd,
        yearEndForeignAccountsUsd,
        hasCanadianTfsa,
        hasCanadianRrsp,
        hasCanadianResp,
        hasCanadianFhsa,
        holdsCanadianMutualFundsOrEtfs,
        daysLateT1135,
        clientName
      }));
    }

    if(path==='/v1/tools/real-estate-assignment') {
      const province = url.searchParams.get('province') || 'ON';
      const originalPurchasePriceCad = url.searchParams.get('originalPrice') ? Number(url.searchParams.get('originalPrice')) : 600000;
      const assignmentSalePriceCad = url.searchParams.get('assignmentPrice') ? Number(url.searchParams.get('assignmentPrice')) : 720000;
      const depositPaidToBuilderCad = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 120000;
      const agreementDate = url.searchParams.get('agreementDate') || '2025-11-01';
      const assignmentDate = url.searchParams.get('assignmentDate') || '2026-06-01';
      const hasPrescribedLifeEvent = url.searchParams.get('hasLifeEvent') === 'true';
      const lifeEventCategory = url.searchParams.get('lifeEvent') || null;
      const relocationDistanceKm = url.searchParams.get('distance') ? Number(url.searchParams.get('distance')) : 0;
      const builderConsentFeeCad = url.searchParams.get('builderFee') ? Number(url.searchParams.get('builderFee')) : 5000;
      const legalFeesCad = url.searchParams.get('legalFees') ? Number(url.searchParams.get('legalFees')) : 2500;
      const realtorCommissionCad = url.searchParams.get('commission') ? Number(url.searchParams.get('commission')) : 15000;
      const marginalTaxRatePercent = url.searchParams.get('taxRate') ? Number(url.searchParams.get('taxRate')) : 43.0;
      const closingDelayedDays = url.searchParams.get('delayDays') ? Number(url.searchParams.get('delayDays')) : 0;
      const isTarionEnrolled = url.searchParams.get('tarion') !== 'false';
      const assignorName = url.searchParams.get('assignor') || 'Assignor';
      const assigneeName = url.searchParams.get('assignee') || 'Assignee';
      const propertyAddress = url.searchParams.get('address') || 'Residential Unit';
      return send(200, evaluateRealEstateAssignment({
        province,
        originalPurchasePriceCad,
        assignmentSalePriceCad,
        depositPaidToBuilderCad,
        agreementDate,
        assignmentDate,
        hasPrescribedLifeEvent,
        lifeEventCategory,
        relocationDistanceKm,
        builderConsentFeeCad,
        legalFeesCad,
        realtorCommissionCad,
        marginalTaxRatePercent,
        closingDelayedDays,
        isTarionEnrolled,
        assignorName,
        assigneeName,
        propertyAddress
      }));
    }

    if(path==='/v1/tools/oas-gis') {
      const ageYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 67;
      const yearsResidedInCanadaAfter18 = url.searchParams.get('yearsCanada') ? Number(url.searchParams.get('yearsCanada')) : 12;
      const countryOfOrigin = url.searchParams.get('origin') || 'OTHER';
      const yearsContributedToOriginSocialSecurity = url.searchParams.get('foreignYears') ? Number(url.searchParams.get('foreignYears')) : 0;
      const isCanadianCitizenOrLegalResident = url.searchParams.get('legalStatus') !== 'false';
      const livesInCanada = url.searchParams.get('inland') !== 'false';
      const isUnderFamilyClassSponsorship = url.searchParams.get('sponsored') === 'true';
      const sponsorshipYearsRemaining = url.searchParams.get('sponsorRemaining') ? Number(url.searchParams.get('sponsorRemaining')) : 0;
      const annualNetWorldIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 18000;
      const applicantName = url.searchParams.get('applicant') || 'Senior Newcomer';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateOasGisEligibility({
        ageYears,
        yearsResidedInCanadaAfter18,
        countryOfOrigin,
        yearsContributedToOriginSocialSecurity,
        isCanadianCitizenOrLegalResident,
        livesInCanada,
        isUnderFamilyClassSponsorship,
        sponsorshipYearsRemaining,
        annualNetWorldIncomeCad,
        applicantName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/speculation-tax-rebate') {
      const province = url.searchParams.get('province') || 'BC';
      const propertyAssessedValueCad = url.searchParams.get('assessedValue') ? Number(url.searchParams.get('assessedValue')) : 1200000;
      const purchasePriceCad = url.searchParams.get('price') ? Number(url.searchParams.get('price')) : 1200000;
      const isCanadianCitizenOrPr = url.searchParams.get('isCdn') === 'true';
      const isSatelliteFamily = url.searchParams.get('satellite') === 'true';
      const isPrincipalResidenceOccupied6Months = url.searchParams.get('primaryHome') === 'true';
      const rentalDaysInYear = url.searchParams.get('rentalDays') ? Number(url.searchParams.get('rentalDays')) : 0;
      const isYearOfPurchase = url.searchParams.get('yearPurchased') === 'true';
      const bcEmploymentIncomeCad = url.searchParams.get('bcIncome') ? Number(url.searchParams.get('bcIncome')) : 0;
      const purchaseClosingDate = url.searchParams.get('closingDate') || '2026-02-01';
      const prStatusAcquiredDate = url.searchParams.get('prDate') || null;
      const rebateApplicationDate = url.searchParams.get('claimDate') || '2026-10-31';
      const occupiedAsPrincipalResidenceWithin60Days = url.searchParams.get('occupied60') !== 'false';
      const heldSolelyWithSpouse = url.searchParams.get('soleSpouse') !== 'false';
      const isOinpNomineeAtClosing = url.searchParams.get('oinp') === 'true';
      const isConventionRefugee = url.searchParams.get('refugee') === 'true';
      const ownerName = url.searchParams.get('owner') || 'Property Owner';
      const propertyAddress = url.searchParams.get('address') || 'Residential Property';
      return send(200, evaluateSpeculationTaxAndRebates({
        province,
        propertyAssessedValueCad,
        purchasePriceCad,
        isCanadianCitizenOrPr,
        isSatelliteFamily,
        isPrincipalResidenceOccupied6Months,
        rentalDaysInYear,
        isYearOfPurchase,
        bcEmploymentIncomeCad,
        purchaseClosingDate,
        prStatusAcquiredDate,
        rebateApplicationDate,
        occupiedAsPrincipalResidenceWithin60Days,
        heldSolelyWithSpouse,
        isOinpNomineeAtClosing,
        isConventionRefugee,
        ownerName,
        propertyAddress
      }));
    }

    if(path==='/v1/tools/childcare-subsidy') {
      const province = url.searchParams.get('province') || 'ON';
      const municipality = url.searchParams.get('municipality') || 'Toronto';
      const adjustedFamilyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 35000;
      const baselineMonthlyFeePerChildCad = url.searchParams.get('baseFee') ? Number(url.searchParams.get('baseFee')) : 1200;
      const isEnrolledInCwelccLicensedCentre = url.searchParams.get('cwelcc') !== 'false';
      const parentActivityType = url.searchParams.get('activity') || 'both_working';
      const immigrationStatus = url.searchParams.get('status') || 'permanent_resident';
      const applicantName = url.searchParams.get('applicant') || 'Parent';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildCareSubsidy({
        province,
        municipality,
        adjustedFamilyNetIncomeCad,
        baselineMonthlyFeePerChildCad,
        isEnrolledInCwelccLicensedCentre,
        parentActivityType,
        immigrationStatus,
        applicantName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/child-disability-benefit') {
      const childAgeYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 8;
      const hasApprovedDtcT2201 = url.searchParams.get('hasDtc') !== 'false';
      const dtcConditionIsProlonged = url.searchParams.get('isProlonged') !== 'false';
      const familyNetIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 55000;
      const annualRdspContributionCad = url.searchParams.get('contribution') ? Number(url.searchParams.get('contribution')) : 1500;
      const unclaimedPastYears = url.searchParams.get('pastYears') ? Number(url.searchParams.get('pastYears')) : 0;
      const childName = url.searchParams.get('childName') || 'Eligible Child';
      const parentName = url.searchParams.get('parentName') || 'Parent / Legal Guardian';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildDisabilityBenefit({
        childAgeYears,
        hasApprovedDtcT2201,
        dtcConditionIsProlonged,
        familyNetIncomeCad,
        annualRdspContributionCad,
        unclaimedPastYears,
        childName,
        parentName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/bc-speculation-tax-declaration') {
      const propertyRegion = url.searchParams.get('region') || 'Metro Vancouver';
      const assessedPropertyValueCad = url.searchParams.get('assessedValue') ? Number(url.searchParams.get('assessedValue')) : 1250000;
      const ownerCitizenshipStatus = url.searchParams.get('status') || 'canadian_citizen_or_pr';
      const isSatelliteFamily = url.searchParams.get('satellite') === 'true';
      const propertyUseCategory = url.searchParams.get('propertyUse') || 'principal_residence';
      const monthsOccupiedInYear = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 12;
      const hasArmsLengthTenancyAgreement = url.searchParams.get('armsLength') !== 'false';
      const hasActiveBuildingPermits = url.searchParams.get('permits') === 'true';
      const ownerName = url.searchParams.get('owner') || 'Property Owner';
      const calendarTaxYear = url.searchParams.get('taxYear') || '2025';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateBcSpeculationTaxDeclaration({
        propertyRegion,
        assessedPropertyValueCad,
        ownerCitizenshipStatus,
        isSatelliteFamily,
        propertyUseCategory,
        monthsOccupiedInYear,
        hasArmsLengthTenancyAgreement,
        hasActiveBuildingPermits,
        ownerName,
        calendarTaxYear,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/bc-svt-appeal') {
      const assessmentNoticeDate = url.searchParams.get('noticeDate') || '2026-10-01';
      const assessedAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 24000;
      const objectionGround = url.searchParams.get('ground') || 'arm_length_tenancy_occupied';
      const hasTenancyAgreementOrProof = url.searchParams.get('leaseProof') !== 'false';
      const hasTaxFilingsOrT4ShowingResidence = url.searchParams.get('residenceProof') === 'true';
      const isStayOfCollectionRequested = url.searchParams.get('stayRequested') !== 'false';
      const propertyRollNumber = url.searchParams.get('rollNumber') || 'ROLL-0000-0000';
      const ownerName = url.searchParams.get('name') || 'Property Owner';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      return send(200, auditBcSvtNoticeOfObjection({
        assessmentNoticeDate,
        assessedAmountCad,
        objectionGround,
        hasTenancyAgreementOrProof,
        hasTaxFilingsOrT4ShowingResidence,
        isStayOfCollectionRequested,
        propertyRollNumber,
        ownerName,
        currentDate
      }));
    }

    if(path==='/v1/tools/tax-shield') {
      const annualEmploymentIncomeCad = url.searchParams.get('income') ? Number(url.searchParams.get('income')) : 75000;
      const province = url.searchParams.get('province') || 'ON';
      return send(200, evaluateTaxShield({ annualEmploymentIncomeCad, province }));
    }

    if(path==='/v1/tools/moving-tax-calc') {
      const distanceOldHomeToNewWorkKm = url.searchParams.get('oldToNewKm') ? Number(url.searchParams.get('oldToNewKm')) : 85;
      const distanceNewHomeToNewWorkKm = url.searchParams.get('newToNewKm') ? Number(url.searchParams.get('newToNewKm')) : 15;
      const transportAndStorageCostsCad = url.searchParams.get('movers') ? Number(url.searchParams.get('movers')) : 2800;
      const travelDistanceKm = url.searchParams.get('travelKm') ? Number(url.searchParams.get('travelKm')) : 450;
      const temporaryLivingDays = url.searchParams.get('tempDays') ? Number(url.searchParams.get('tempDays')) : 7;
      const temporaryLivingLodgingCad = url.searchParams.get('tempLodging') ? Number(url.searchParams.get('tempLodging')) : 1200;
      const province = url.searchParams.get('province') || 'ON';
      return send(200, calculateMovingTaxDeduction({
        distanceOldHomeToNewWorkKm,
        distanceNewHomeToNewWorkKm,
        transportAndStorageCostsCad,
        travelDistanceKm,
        temporaryLivingDays,
        temporaryLivingLodgingCad,
        province
      }));
    }

    if(path==='/v1/tools/cra-newcomer-wealth') {
      const plannedFhsa = url.searchParams.get('fhsa') ? Number(url.searchParams.get('fhsa')) : 8000;
      const plannedHbp = url.searchParams.get('hbp') ? Number(url.searchParams.get('hbp')) : 60000;
      const foreignFmv = url.searchParams.get('foreignFmv') ? Number(url.searchParams.get('foreignFmv')) : 250000;
      const giftAmount = url.searchParams.get('gift') ? Number(url.searchParams.get('gift')) : 50000;
      return send(200, evaluateNewcomerWealthPlan({
        fhsa: { plannedContributionCad: plannedFhsa },
        hbp: { requestedWithdrawalCad: plannedHbp, rrspBalanceCad: plannedHbp },
        foreignProperty: { foreignPropertyFmvAtLandingCad: foreignFmv },
        gift: { giftAmountCad: giftAmount }
      }));
    }

    if (path === '/v1/tools/proof-of-funds') {
      return send(200,evaluateProofOfFunds(Object.fromEntries(url.searchParams)));
    }

  return false;
}

export function handleFinancePost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/credit-simulator') {
      return send(200, calculateCreditTrajectory(input));
    }

    if(path==='/v1/tools/cra-benefits') {
      return send(200, calculateNewcomerBenefits(input));
    }

    if(path==='/v1/tools/childcare-support') {
      return send(200, evaluateChildcareSupport(input));
    }

    if(path==='/v1/tools/homebuyer-eligibility') {
      return send(200, evaluateHomebuyerEligibility(input));
    }

    if(path==='/v1/tools/banking-comparator') {
      return send(200, evaluateBankingAndCreditStrategy(input));
    }

    if(path==='/v1/tools/parental-leave') {
      return send(200, evaluateParentalLeave(input));
    }

    if(path==='/v1/tools/business-structure') {
      return send(200, evaluateBusinessStructure(input));
    }

    if (path === '/v1/tools/proof-of-funds') {
      return send(200,evaluateProofOfFunds(input));
    }

    if(path==='/v1/tools/moving-tax-deduction') {
      return send(200, evaluateMovingExpensesDeduction(input));
    }

    if(path==='/v1/tools/homebuyer-tax-incentives') {
      return send(200, evaluateHomebuyerTaxIncentives(input));
    }

    if(path==='/v1/tools/auto-insurance') {
      return send(200, evaluateAutoInsuranceProfile(input));
    }

    if(path==='/v1/tools/cra-voluntary-disclosure') {
      return send(200, evaluateVoluntaryDisclosure(input));
    }

    if(path==='/v1/tools/social-assistance') {
      return send(200, evaluateSocialAssistance(input));
    }

    if(path==='/v1/tools/high-cost-credit') {
      return send(200, evaluateConsumerCreditAgreement(input));
    }

    if(path==='/v1/tools/cross-border-tax') {
      return send(200, evaluateCrossBorderTaxObligations(input));
    }

    if(path==='/v1/tools/real-estate-assignment') {
      return send(200, evaluateRealEstateAssignment(input));
    }

    if(path==='/v1/tools/oas-gis') {
      return send(200, evaluateOasGisEligibility(input));
    }

    if(path==='/v1/tools/speculation-tax-rebate') {
      return send(200, evaluateSpeculationTaxAndRebates(input));
    }

    if(path==='/v1/tools/childcare-subsidy') {
      return send(200, evaluateChildCareSubsidy(input));
    }

    if(path==='/v1/tools/child-disability-benefit') {
      return send(200, evaluateChildDisabilityBenefit(input));
    }

    if(path==='/v1/tools/bc-speculation-tax-declaration') {
      return send(200, evaluateBcSpeculationTaxDeclaration(input));
    }

    if(path==='/v1/tools/bc-svt-appeal') {
      return send(200, auditBcSvtNoticeOfObjection(input));
    }

    if(path==='/v1/tools/tax-shield') {
      return send(200, evaluateTaxShield(input));
    }

    if(path==='/v1/tools/moving-tax-calc') {
      return send(200, calculateMovingTaxDeduction(input));
    }

    if(path==='/v1/tools/cra-newcomer-wealth') {
      // Mirror the GET endpoint for form/flat bodies; canonical nested plan objects pass through as-is.
      const num=(v,d)=>{const n=Number(v);return n!==''&&v!=null&&v!==''&&Number.isFinite(n)?n:d;};
      const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
      const hbp=num(input.hbp??input.plannedHbp,60000);
      return send(200, evaluateNewcomerWealthPlan({
        fhsa: isObj(input.fhsa)?input.fhsa:{ plannedContributionCad: num(input.fhsa??input.plannedFhsa,8000) },
        hbp: isObj(input.hbp)?input.hbp:{ requestedWithdrawalCad: hbp, rrspBalanceCad: hbp },
        foreignProperty: isObj(input.foreignProperty)?input.foreignProperty:{ foreignPropertyFmvAtLandingCad: num(input.foreignFmv,250000) },
        gift: isObj(input.gift)?input.gift:{ giftAmountCad: num(input.gift??input.giftAmount,50000) }
      }));
    }

  return false;
}
