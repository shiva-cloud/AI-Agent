// src/routes/tools/legal.js
// Domain route handlers for legal tools.

import { NOTICE_TYPES, STATUTORY_METADATA, generateLegalNotice } from '../../legal-notice-generator.js';
import { evaluateChildWelfareAndGuardianship } from '../../child-welfare-guardianship-navigator.js';
import { evaluateConsumerContract } from '../../consumer-protection-navigator.js';
import { evaluateDebtCollectionDefense } from '../../debt-collection-defense.js';
import { evaluateEstatePlanProfile } from '../../estate-planning-navigator.js';
import { evaluateFamilyLawAndSupport } from '../../family-law-navigator.js';
import { evaluateFranchiseDisclosure } from '../../franchise-disclosure-navigator.js';
import { evaluateSmallClaimsDispute } from '../../small-claims-navigator.js';
import { evaluateTelecomDispute } from '../../telecom-contract-defense.js';
import { evaluateWorkplaceDiscriminationAndConstructiveDismissal } from '../../human-rights-defense.js';
import { todayIso } from '../../text-input.js';

export function handleLegalGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/debt-collection-defense') {
      const province = url.searchParams.get('province') || 'ON';
      const debtType = url.searchParams.get('debtType') || 'telecom';
      const lastPaymentOrDefaultDate = url.searchParams.get('defaultDate') || '2022-01-01';
      const allegedDebtAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 1200;
      const collectionAgencyName = url.searchParams.get('agency') || 'Collection Agency';
      const receivedWrittenNoticeOfCollection = url.searchParams.get('writtenNotice') !== 'false';
      const callsInPastWeek = url.searchParams.get('calls') ? Number(url.searchParams.get('calls')) : 1;
      const calledEmployer = url.searchParams.get('calledEmployer') === 'true';
      const calledFamilyOrFriends = url.searchParams.get('calledFamily') === 'true';
      const threatenedImmigrationOrDeportation = url.searchParams.get('threatenedImmigration') === 'true';
      const threatenedImmediateArrestOrLawsuit = url.searchParams.get('threatenedLawsuit') === 'true';
      const calledOutsidePermittedHours = url.searchParams.get('outsideHours') === 'true';

      return send(200, evaluateDebtCollectionDefense({
        province,
        debtType,
        lastPaymentOrDefaultDate,
        allegedDebtAmountCad,
        collectionAgencyName,
        receivedWrittenNoticeOfCollection,
        callsInPastWeek,
        calledEmployer,
        calledFamilyOrFriends,
        threatenedImmigrationOrDeportation,
        threatenedImmediateArrestOrLawsuit,
        calledOutsidePermittedHours
      }));
    }

    if(path === '/v1/tools/telecom-contract-defense') {
      const providerName = url.searchParams.get('provider') || 'Rogers';
      const serviceType = url.searchParams.get('service') || 'mobile';
      const contractType = url.searchParams.get('contractType') || 'postpaid_device_financing';
      const daysSinceContractStart = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 10;
      const hasDisability = url.searchParams.get('disability') === 'true';
      const monthlyPlanCostCad = url.searchParams.get('planCost') ? Number(url.searchParams.get('planCost')) : 65;
      const deviceSubsidyTotalCad = url.searchParams.get('subsidy') ? Number(url.searchParams.get('subsidy')) : 800;
      const monthsIntoContract = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 1;
      const dataOverageChargedCad = url.searchParams.get('dataOverage') ? Number(url.searchParams.get('dataOverage')) : 0;
      const roamingChargedCad = url.searchParams.get('roaming') ? Number(url.searchParams.get('roaming')) : 0;
      const unlockedDeviceFeeChargedCad = url.searchParams.get('unlockFee') ? Number(url.searchParams.get('unlockFee')) : 0;
      const disputedChargesTotalCad = url.searchParams.get('disputed') ? Number(url.searchParams.get('disputed')) : 120;
      const providerUnilateralPriceIncrease = url.searchParams.get('priceIncrease') === 'true';
      const refusedTrialCancellation = url.searchParams.get('refusedTrial') === 'true';
      const deviceInOriginalCondition = url.searchParams.get('deviceCondition') !== 'damaged';

      return send(200, evaluateTelecomDispute({
        providerName,
        serviceType,
        contractType,
        daysSinceContractStart,
        hasDisability,
        monthlyPlanCostCad,
        deviceSubsidyTotalCad,
        monthsIntoContract,
        dataOverageChargedCad,
        roamingChargedCad,
        unlockedDeviceFeeChargedCad,
        disputedChargesTotalCad,
        providerUnilateralPriceIncrease,
        refusedTrialCancellation,
        deviceInOriginalCondition
      }));
    }

    if(path==='/v1/tools/human-rights-defense') {
      const jurisdiction = url.searchParams.get('jurisdiction') || 'ON';
      const groundsParam = url.searchParams.get('grounds');
      const protectedGrounds = groundsParam ? groundsParam.split(',') : ['place_of_origin', 'citizenship'];
      const conductParam = url.searchParams.get('conduct');
      const conductTypes = conductParam ? conductParam.split(',') : ['canadian_experience_requirement'];
      const daysSinceLastIncident = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 30;
      const hasReportedInternally = url.searchParams.get('reported') === 'true';
      const employerResponse = url.searchParams.get('response') || 'none';
      const annualSalaryCad = url.searchParams.get('salary') ? Number(url.searchParams.get('salary')) : 80000;
      const yearsOfService = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 3;
      const applicantAge = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 35;

      return send(200, evaluateWorkplaceDiscriminationAndConstructiveDismissal({
        jurisdiction,
        protectedGrounds,
        conductTypes,
        daysSinceLastIncident,
        hasReportedInternally,
        employerResponse,
        annualSalaryCad,
        yearsOfService,
        applicantAge
      }));
    }

    if(path==='/v1/tools/estate-planning') {
      const province = url.searchParams.get('province') || 'ON';
      const maritalStatus = url.searchParams.get('maritalStatus') || 'married';
      const hasChildren = url.searchParams.get('hasChildren') !== 'false';
      const childrenCount = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 1;
      const hasMinorChildren = url.searchParams.get('hasMinors') !== 'false';
      const canadianRealEstateCad = url.searchParams.get('realEstate') ? Number(url.searchParams.get('realEstate')) : 800000;
      const realEstateOwnershipStructure = url.searchParams.get('ownership') || 'joint_tenancy';
      const canadianRegisteredAccountsCad = url.searchParams.get('registered') ? Number(url.searchParams.get('registered')) : 100000;
      const hasDesignatedBeneficiariesOnRegisteredAccounts = url.searchParams.get('beneficiaries') !== 'false';
      const canadianBankAccountsAndLiquidCad = url.searchParams.get('liquid') ? Number(url.searchParams.get('liquid')) : 50000;
      const hasForeignRealEstateOrAssets = url.searchParams.get('foreignAssets') === 'true';
      const foreignAssetsValueCad = url.searchParams.get('foreignVal') ? Number(url.searchParams.get('foreignVal')) : 0;
      const foreignCountry = url.searchParams.get('foreignCountry') || 'United States';
      const hasExistingForeignWill = url.searchParams.get('foreignWill') === 'true';
      const hasCanadianWill = url.searchParams.get('canadianWill') === 'true';
      const hasContinuingPowerOfAttorneyProperty = url.searchParams.get('cpoa') === 'true';
      const hasPowerOfAttorneyPersonalCare = url.searchParams.get('poapc') === 'true';
      const namedExecutorLocation = url.searchParams.get('executorLoc') || 'canadian_resident';

      return send(200, evaluateEstatePlanProfile({
        province,
        maritalStatus,
        hasChildren,
        childrenCount,
        hasMinorChildren,
        canadianRealEstateCad,
        realEstateOwnershipStructure,
        canadianRegisteredAccountsCad,
        hasDesignatedBeneficiariesOnRegisteredAccounts,
        canadianBankAccountsAndLiquidCad,
        hasForeignRealEstateOrAssets,
        foreignAssetsValueCad,
        foreignCountry,
        hasExistingForeignWill,
        hasCanadianWill,
        hasContinuingPowerOfAttorneyProperty,
        hasPowerOfAttorneyPersonalCare,
        namedExecutorLocation
      }));
    }

    if(path==='/v1/tools/small-claims') {
      const province = url.searchParams.get('province') || 'ON';
      const claimAmountCad = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 12000;
      const disputeType = url.searchParams.get('disputeType') || 'breach_of_contract';
      const dateCauseOfActionArose = url.searchParams.get('incidentDate') || '2025-10-01';
      const defendantType = url.searchParams.get('defendantType') || 'business';
      const defendantName = url.searchParams.get('defendantName') || 'Acme Renovations Inc.';
      const plaintiffName = url.searchParams.get('plaintiffName') || 'Claimant';
      const hasSentDemandLetter = url.searchParams.get('sentDemand') === 'true';
      const prejudgmentInterestRatePercent = url.searchParams.get('pjiRate') ? Number(url.searchParams.get('pjiRate')) : 4.0;
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();

      return send(200, evaluateSmallClaimsDispute({
        province,
        claimAmountCad,
        disputeType,
        dateCauseOfActionArose,
        defendantType,
        defendantName,
        plaintiffName,
        hasSentDemandLetter,
        prejudgmentInterestRatePercent,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/consumer-protection') {
      const province = url.searchParams.get('province') || 'ON';
      const contractType = url.searchParams.get('type') || 'water_heater_rental';
      const contractDate = url.searchParams.get('contractDate') || '2026-10-25';
      const contractValueCad = url.searchParams.get('value') ? Number(url.searchParams.get('value')) : 4800;
      const wasUnsolicitedInHomeVisit = url.searchParams.get('unsolicited') !== 'false';
      const prescribedBannedProduct = url.searchParams.get('bannedProduct') !== 'false';
      const hasUnfairPractices = url.searchParams.get('unfair') === 'true';
      const unfairPracticeType = url.searchParams.get('unfairType') || 'none';
      const missingMandatoryDisclosures = url.searchParams.get('missingDisclosures') === 'true';
      const consumerName = url.searchParams.get('consumerName') || 'Consumer';
      const supplierName = url.searchParams.get('supplierName') || 'Eco-Comfort Home Services Inc.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();

      return send(200, evaluateConsumerContract({
        province,
        contractType,
        contractDate,
        contractValueCad,
        wasUnsolicitedInHomeVisit,
        prescribedBannedProduct,
        hasUnfairPractices,
        unfairPracticeType,
        missingMandatoryDisclosures,
        consumerName,
        supplierName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/family-law') {
      const province = url.searchParams.get('province') || 'ON';
      const maritalStatus = url.searchParams.get('status') || 'married';
      const cohabitationYears = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 8.0;
      const numberOfChildren = url.searchParams.get('children') ? Number(url.searchParams.get('children')) : 2;
      const payerGrossAnnualIncomeCad = url.searchParams.get('payerIncome') ? Number(url.searchParams.get('payerIncome')) : 95000;
      const recipientGrossAnnualIncomeCad = url.searchParams.get('recipientIncome') ? Number(url.searchParams.get('recipientIncome')) : 45000;
      const parentingArrangement = url.searchParams.get('parenting') || 'primary_custody';
      const payerValuationDateAssetsCad = url.searchParams.get('payerAssets') ? Number(url.searchParams.get('payerAssets')) : 350000;
      const payerDateOfMarriageDeductionsCad = url.searchParams.get('payerDomDed') ? Number(url.searchParams.get('payerDomDed')) : 50000;
      const payerDebtsValuationDateCad = url.searchParams.get('payerDebts') ? Number(url.searchParams.get('payerDebts')) : 40000;
      const recipientValuationDateAssetsCad = url.searchParams.get('recipientAssets') ? Number(url.searchParams.get('recipientAssets')) : 120000;
      const recipientDateOfMarriageDeductionsCad = url.searchParams.get('recipientDomDed') ? Number(url.searchParams.get('recipientDomDed')) : 20000;
      const recipientDebtsValuationDateCad = url.searchParams.get('recipientDebts') ? Number(url.searchParams.get('recipientDebts')) : 15000;
      const hasForeignWorldwideAssets = url.searchParams.get('foreignAssets') === 'true';
      const hasActiveSponsorshipUndertaking = url.searchParams.get('sponsorship') === 'true';

      return send(200, evaluateFamilyLawAndSupport({
        province,
        maritalStatus,
        cohabitationYears,
        numberOfChildren,
        payerGrossAnnualIncomeCad,
        recipientGrossAnnualIncomeCad,
        parentingArrangement,
        payerValuationDateAssetsCad,
        payerDateOfMarriageDeductionsCad,
        payerDebtsValuationDateCad,
        recipientValuationDateAssetsCad,
        recipientDateOfMarriageDeductionsCad,
        recipientDebtsValuationDateCad,
        hasForeignWorldwideAssets,
        hasActiveSponsorshipUndertaking
      }));
    }

    if(path==='/v1/tools/franchise-disclosure') {
      const province = url.searchParams.get('province') || 'ON';
      const agreementSignedDate = url.searchParams.get('signDate') || '2025-10-01';
      const fddDeliveredDate = url.searchParams.get('fddDate') || null;
      const wasFddDeliveredAsSingleDocument = url.searchParams.get('singleDoc') !== 'false';
      const hasAuditedFinancialStatements = url.searchParams.get('auditedFin') !== 'false';
      const hasSignedFranchisorCertificate = url.searchParams.get('signedCert') !== 'false';
      const initialFranchiseFeePaidCad = url.searchParams.get('initialFee') ? Number(url.searchParams.get('initialFee')) : 45000;
      const equipmentAndBuildoutCostCad = url.searchParams.get('equipment') ? Number(url.searchParams.get('equipment')) : 180000;
      const inventoryPurchasedAtCostCad = url.searchParams.get('inventory') ? Number(url.searchParams.get('inventory')) : 25000;
      const cumulativeOperatingLossesCad = url.searchParams.get('losses') ? Number(url.searchParams.get('losses')) : 55000;
      const franchiseeName = url.searchParams.get('franchisee') || 'Franchisee';
      const franchisorName = url.searchParams.get('franchisor') || 'Franchisor';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateFranchiseDisclosure({
        province,
        agreementSignedDate,
        fddDeliveredDate,
        wasFddDeliveredAsSingleDocument,
        hasAuditedFinancialStatements,
        hasSignedFranchisorCertificate,
        initialFranchiseFeePaidCad,
        equipmentAndBuildoutCostCad,
        inventoryPurchasedAtCostCad,
        cumulativeOperatingLossesCad,
        franchiseeName,
        franchisorName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/child-welfare-guardianship') {
      const pathway = url.searchParams.get('pathway') || 'vysa_youth_services';
      const youthAgeYears = url.searchParams.get('age') ? Number(url.searchParams.get('age')) : 16;
      const hasSafeExtendedFamily = url.searchParams.get('kinship') !== 'false';
      const kinshipRelationship = url.searchParams.get('kinshipRelation') || 'aunt_uncle';
      const isCanadianCitizenParentForAdoption = url.searchParams.get('citizenParent') !== 'false';
      const adoptionCountry = url.searchParams.get('country') || 'India';
      const isHagueConventionCountry = url.searchParams.get('hague') !== 'false';
      const adoptionLegallyFinalizedAbroad = url.searchParams.get('finalized') !== 'false';
      const preAdoptionTiesSevered = url.searchParams.get('severed') !== 'false';
      const youthName = url.searchParams.get('youth') || 'Youth';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateChildWelfareAndGuardianship({
        pathway,
        youthAgeYears,
        hasSafeExtendedFamily,
        kinshipRelationship,
        isCanadianCitizenParentForAdoption,
        adoptionCountry,
        isHagueConventionCountry,
        adoptionLegallyFinalizedAbroad,
        preAdoptionTiesSevered,
        youthName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/legal-notices') {
      const type = url.searchParams.get('type');
      if (!type) return send(200, { supportedTypes: NOTICE_TYPES, metadata: STATUTORY_METADATA });
      const senderName = url.searchParams.get('sender') || 'Applicant';
      const recipientName = url.searchParams.get('recipient') || 'Respondent';
      const totalClaimAmount = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 0;
      const issuesParam = url.searchParams.get('issues');
      const issues = issuesParam ? issuesParam.split(';').map(s=>s.trim()).filter(Boolean) : [];
      return send(200, generateLegalNotice({ type, senderName, recipientName, totalClaimAmount, issues }));
    }

  return false;
}

export function handleLegalPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/debt-collection-defense') {
      return send(200, evaluateDebtCollectionDefense(input));
    }

    if(path==='/v1/tools/telecom-contract-defense') {
      return send(200, evaluateTelecomDispute(input));
    }

    if(path==='/v1/tools/human-rights-defense') {
      return send(200, evaluateWorkplaceDiscriminationAndConstructiveDismissal(input));
    }

    if(path==='/v1/tools/estate-planning') {
      return send(200, evaluateEstatePlanProfile(input));
    }

    if(path==='/v1/tools/small-claims') {
      return send(200, evaluateSmallClaimsDispute(input));
    }

    if(path==='/v1/tools/consumer-protection') {
      return send(200, evaluateConsumerContract(input));
    }

    if(path==='/v1/tools/family-law') {
      return send(200, evaluateFamilyLawAndSupport(input));
    }

    if(path==='/v1/tools/franchise-disclosure') {
      return send(200, evaluateFranchiseDisclosure(input));
    }

    if(path==='/v1/tools/child-welfare-guardianship') {
      return send(200, evaluateChildWelfareAndGuardianship(input));
    }

    if(path==='/v1/tools/legal-notices') {
      // Accept the website form's field names (sender, recipient, amount, issues as
      // a semicolon list) and the canonical API names alike; empty strings and
      // non-numeric amounts fall back to the same defaults the GET endpoint uses.
      const num=v=>{const n=Number(v);return Number.isFinite(n)&&String(v).trim()!==''?n:0;};
      const issues=Array.isArray(input.issues)?input.issues
        :typeof input.issues==='string'?input.issues.split(';').map(s=>s.trim()).filter(Boolean):[];
      return send(200, generateLegalNotice({
        ...input,
        senderName:input.senderName||input.sender||'Applicant',
        recipientName:input.recipientName||input.recipient||'Respondent',
        totalClaimAmount:input.totalClaimAmount??num(input.amount),
        issues
      }));
    }

  return false;
}
