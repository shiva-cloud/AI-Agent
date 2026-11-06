import { applyFormAliases } from '../../tool-input.js';
// src/routes/tools/housing.js
// Domain route handlers for housing tools.

import { auditAlbertaCommercialDistress } from '../../alberta-commercial-tenant-distress-navigator.js';
import { auditBcStrataShortTermRental } from '../../british-columbia-strata-short-term-rental-bylaw-navigator.js';
import { auditBcTenancyNotice, evaluateOntarioSharedKitchenBathroomJurisdiction, auditOntarioFormN12Notice, evaluateOntarioT1RefundClaim, auditOntarioRentIncrease } from '../../ontario-bc-tenancy-navigator.js';
import { auditCalgarySecondarySuite } from '../../calgary-secondary-suite-amnesty-navigator.js';
import { auditEvictionNotice } from '../../eviction-defense.js';
import { auditLeaseAgreement } from '../../lease-guard.js';
import { evaluateAlbertaAbandonedGoods } from '../../alberta-residential-tenancy-abandoned-goods-distress-navigator.js';
import { evaluateAlbertaLandlordEntry } from '../../alberta-residential-tenancy-landlord-entry-notice-navigator.js';
import { evaluateAlbertaPeriodicTenancyNotice } from '../../alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';
import { evaluateAlbertaSecurityDeposit } from '../../alberta-tenancy-security-deposit-navigator.js';
import { evaluateAlbertaTenancySubleaseAssignment } from '../../alberta-residential-tenancy-sublease-assignment-navigator.js';
import { evaluateBcLandlordUseEviction } from '../../british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';
import { evaluateBcRoommateAndSharedKitchen } from '../../british-columbia-tenancy-roommate-shared-kitchen-navigator.js';
import { evaluateBcRtbDisputeTrack } from '../../british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';
import { evaluateBcSecurityDepositDoublePenalty } from '../../british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';
import { evaluateBcStrataBylawDefense } from '../../bc-strata-bylaw-navigator.js';
import { evaluateBcStrataDepreciationReport } from '../../british-columbia-strata-depreciation-report-reserve-fund-navigator.js';
import { evaluateBcStrataEvCharging } from '../../british-columbia-strata-ev-charging-navigator.js';
import { evaluateCommercialLease } from '../../commercial-lease-navigator.js';
import { evaluateLeaseAssignmentExit } from '../../lease-assignment-navigator.js';
import { evaluateManitobaRentIncrease } from '../../manitoba-residential-tenancy-rent-increase-guideline-navigator.js';
import { evaluateOntarioHousingCreedAccommodation } from '../../ontario-human-rights-housing-creed-navigator.js';
import { evaluateOntarioIllegalEntryT2 } from '../../ontario-residential-tenancy-illegal-entry-t2-navigator.js';
import { evaluateOntarioRentDepositInterest } from '../../ontario-residential-tenancy-rent-deposit-interest-navigator.js';
import { evaluateOntarioRoommateAndOccupantRights } from '../../ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js';
import { evaluateOntarioTenancyAssignmentSublet } from '../../ontario-residential-tenancy-sublet-assignment-refusal-navigator.js';
import { evaluateOntarioUrgentRepairsT6 } from '../../ontario-residential-tenancy-urgent-repairs-t6-navigator.js';
import { evaluateRentIncreaseNotice } from '../../rent-increase-defense.js';
import { evaluateSaskatchewanSecurityDepositReturn } from '../../saskatchewan-residential-tenancy-security-deposit-return-navigator.js';
import { evaluateTenancyRepairs } from '../../tenancy-repairs-navigator.js';
import { todayIso } from '../../text-input.js';

export function handleHousingGet(ctx) {
  const { path, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/lease-guard') {
      const province = url.searchParams.get('province') || 'ON';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const standardFormUsed = url.searchParams.get('standardForm') !== 'false';
      const rentDepositMonths = Number(url.searchParams.get('rentDepositMonths') || 1);
      const damageDepositCad = Number(url.searchParams.get('damageDeposit') || 0);
      const keyDepositCad = Number(url.searchParams.get('keyDeposit') || 50);
      const clausesParam = url.searchParams.get('clauses');
      const clausesPresent = clausesParam ? clausesParam.split(',') : [];
      const customClauseText = url.searchParams.get('customText') || '';
      return send(200, auditLeaseAgreement({
        province,
        monthlyRentCad,
        standardFormUsed,
        depositDemands: { rentDepositMonths, damageDepositCad, keyDepositCad },
        clausesPresent,
        customClauseText
      }));
    }

    if(path==='/v1/tools/eviction-defense') {
      const noticeFormType = url.searchParams.get('formType') || 'N12';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const noticeServedDate = url.searchParams.get('servedDate') || '2026-05-01';
      const terminationDate = url.searchParams.get('termDate') || '2026-06-30';
      const wasStatutoryCompensationPaid = url.searchParams.get('paid') === 'true';
      const compensationPaidDate = url.searchParams.get('paidDate') || null;
      const isLandlordACorporation = url.searchParams.get('corp') === 'true';
      const intendedOccupant = url.searchParams.get('occupant') || 'landlord';
      const buildingUnitCount = url.searchParams.get('units') ? Number(url.searchParams.get('units')) : 1;
      const allegedRentArrearsCad = url.searchParams.get('arrears') ? Number(url.searchParams.get('arrears')) : 0;
      const includesIllegalCharges = url.searchParams.get('illegalCharges') === 'true';
      const coercedOrMisrepresented = url.searchParams.get('coerced') === 'true';
      return send(200, auditEvictionNotice({
        noticeFormType,
        monthlyRentCad,
        noticeServedDate,
        terminationDate,
        wasStatutoryCompensationPaid,
        compensationPaidDate,
        isLandlordACorporation,
        intendedOccupant,
        buildingUnitCount,
        allegedRentArrearsCad,
        includesIllegalCharges,
        coercedOrMisrepresented
      }));
    }

    if(path==='/v1/tools/lease-assignment') {
      const province = url.searchParams.get('province') || 'ON';
      const leaseType = url.searchParams.get('leaseType') || 'fixed_term';
      const requestType = url.searchParams.get('requestType') || 'assignment';
      const requestStage = url.searchParams.get('stage') || 'not_yet_requested';
      const requestDate = url.searchParams.get('requestDate') || new Date().toISOString().slice(0, 10);
      const daysSinceRequest = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 0;
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2400;
      const landlordDemandedPenaltyCad = url.searchParams.get('penalty') ? Number(url.searchParams.get('penalty')) : 0;
      const landlordDemandedAssignmentFeeCad = url.searchParams.get('fee') ? Number(url.searchParams.get('fee')) : 0;
      const leaseEndDate = url.searchParams.get('leaseEnd') || null;

      return send(200, evaluateLeaseAssignmentExit({
        province,
        leaseType,
        requestType,
        requestStage,
        requestDate,
        daysSinceRequest,
        monthlyRentCad,
        landlordDemandedPenaltyCad,
        landlordDemandedAssignmentFeeCad,
        leaseEndDate
      }));
    }

    if(path==='/v1/tools/rent-increase-defense') {
      const province = url.searchParams.get('province') || 'ON';
      const firstOccupiedDate = url.searchParams.get('firstOccupied') || '2017-06-01';
      const currentMonthlyRentCad = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 2200;
      const proposedMonthlyRentCad = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 2400;
      const noticeServedDate = url.searchParams.get('noticeServed') || '2026-05-01';
      const effectiveDate = url.searchParams.get('effectiveDate') || '2026-08-01';
      const lastIncreaseDate = url.searchParams.get('lastIncrease') || '2025-08-01';
      const officialFormUsed = url.searchParams.get('form') || 'N1';
      const isAgiClaimed = url.searchParams.get('agi') === 'true';
      const agiReason = url.searchParams.get('agiReason') || 'capital_expenditures';
      const hasLtbOrderBeenIssued = url.searchParams.get('ltbOrder') === 'true';
      const unresolvedMaintenanceDefects = url.searchParams.get('maintenanceDefects') === 'true';

      return send(200, evaluateRentIncreaseNotice({
        province,
        firstOccupiedDate,
        currentMonthlyRentCad,
        proposedMonthlyRentCad,
        noticeServedDate,
        effectiveDate,
        lastIncreaseDate,
        officialFormUsed,
        isAgiClaimed,
        agiReason,
        hasLtbOrderBeenIssued,
        unresolvedMaintenanceDefects
      }));
    }

    if(path==='/v1/tools/tenancy-repairs') {
      const province = url.searchParams.get('province') || 'ON';
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2400;
      const issues = url.searchParams.get('issues') ? url.searchParams.get('issues').split(',') : ['water_leak_mold'];
      const daysUnresolved = url.searchParams.get('days') ? Number(url.searchParams.get('days')) : 30;
      const outOfPocketExpensesCad = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 0;
      const hasWithheldRent = url.searchParams.get('withheld') === 'true';
      const withheldAmountCad = url.searchParams.get('withheldAmount') ? Number(url.searchParams.get('withheldAmount')) : 0;
      const hasNotifiedLandlordInWriting = url.searchParams.get('writtenNotice') !== 'false';
      const hasCalledCityInspector = url.searchParams.get('cityInspector') === 'true';
      const tenantName = url.searchParams.get('tenant') || 'Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Landlord';
      const rentalAddress = url.searchParams.get('address') || '100 King St W, Toronto, ON';
      return send(200, evaluateTenancyRepairs({
        province,
        monthlyRentCad,
        issues,
        daysUnresolved,
        outOfPocketExpensesCad,
        hasWithheldRent,
        withheldAmountCad,
        hasNotifiedLandlordInWriting,
        hasCalledCityInspector,
        tenantName,
        landlordName,
        rentalAddress
      }));
    }

    if(path==='/v1/tools/commercial-lease') {
      const province = url.searchParams.get('province') || 'ON';
      const baseRentMonthlyCad = url.searchParams.get('baseRent') ? Number(url.searchParams.get('baseRent')) : 3500;
      const additionalRentMonthlyCad = url.searchParams.get('tmi') ? Number(url.searchParams.get('tmi')) : 1500;
      const squareFootage = url.searchParams.get('sqft') ? Number(url.searchParams.get('sqft')) : 1200;
      const leaseType = url.searchParams.get('type') || 'triple_net_nnn';
      const leaseTermYears = url.searchParams.get('term') ? Number(url.searchParams.get('term')) : 5;
      const yearsRemaining = url.searchParams.get('remaining') ? Number(url.searchParams.get('remaining')) : 3.5;
      const hasPersonalGuarantee = url.searchParams.get('guarantee') !== 'false';
      const isRentOverdue = url.searchParams.get('overdue') === 'true';
      const daysRentOverdue = url.searchParams.get('daysOverdue') ? Number(url.searchParams.get('daysOverdue')) : 0;
      const landlordLockoutThreat = url.searchParams.get('lockoutThreat') === 'true';
      const disputedTmiChargesCad = url.searchParams.get('disputedTmi') ? Number(url.searchParams.get('disputedTmi')) : 0;
      const landlordRefusedAssignment = url.searchParams.get('refusedAssignment') === 'true';
      const tenantBusinessName = url.searchParams.get('business') || 'Commercial Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Commercial Landlord';
      const premisesAddress = url.searchParams.get('address') || 'Commercial Premises';
      return send(200, evaluateCommercialLease({
        province,
        baseRentMonthlyCad,
        additionalRentMonthlyCad,
        squareFootage,
        leaseType,
        leaseTermYears,
        yearsRemaining,
        hasPersonalGuarantee,
        isRentOverdue,
        daysRentOverdue,
        landlordLockoutThreat,
        disputedTmiChargesCad,
        landlordRefusedAssignment,
        tenantBusinessName,
        landlordName,
        premisesAddress
      }));
    }

    if(path==='/v1/tools/bc-strata-bylaw') {
      const disputeType = url.searchParams.get('dispute') || 'rental_restriction';
      const isLongTermRental = url.searchParams.get('longTerm') !== 'false';
      const rentalTermMonths = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 12;
      const strataAgeMinimum = url.searchParams.get('ageMin') ? Number(url.searchParams.get('ageMin')) : 19;
      const isCertifiedServiceDog = url.searchParams.get('serviceDog') === 'true';
      const fineAmountLeviedCad = url.searchParams.get('fine') ? Number(url.searchParams.get('fine')) : 0;
      const strataDemandedTenantScreening = url.searchParams.get('screening') === 'true';
      const strataRefusedEvRequest = url.searchParams.get('refusedEv') === 'true';
      const strataPlanNumber = url.searchParams.get('strataPlan') || 'EPS 1234';
      const unitNumber = url.searchParams.get('unit') || '304';
      const ownerOrTenantName = url.searchParams.get('name') || 'Strata Resident';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateBcStrataBylawDefense({
        disputeType,
        isLongTermRental,
        rentalTermMonths,
        strataAgeMinimum,
        isCertifiedServiceDog,
        fineAmountLeviedCad,
        strataDemandedTenantScreening,
        strataRefusedEvRequest,
        strataPlanNumber,
        unitNumber,
        ownerOrTenantName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/alberta-security-deposit') {
      const monthlyRentCad = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 1800;
      const securityDepositPaidCad = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 1800;
      const additionalNonRefundableFeesCad = url.searchParams.get('fees') ? Number(url.searchParams.get('fees')) : 0;
      const landlordConductedMoveInInspection = url.searchParams.get('moveIn') !== 'false';
      const tenantReceivedSignedMoveInReport = url.searchParams.get('signedReport') !== 'false';
      const landlordConductedMoveOutInspection = url.searchParams.get('moveOut') !== 'false';
      const daysSinceTenancyEnded = url.searchParams.get('daysVacated') ? Number(url.searchParams.get('daysVacated')) : 12;
      const deductionsClaimedCad = url.searchParams.get('deductions') ? Number(url.searchParams.get('deductions')) : 500;
      const deductionsReason = url.searchParams.get('reason') || 'normal wear and tear painting and carpet cleaning';
      const tenantProvidedForwardingAddress = url.searchParams.get('forwardingAddress') !== 'false';
      const tenantName = url.searchParams.get('tenant') || 'Alberta Tenant';
      const landlordName = url.searchParams.get('landlord') || 'Landlord / Property Manager';
      const rentalUnitAddress = url.searchParams.get('unit') || '102-10405 Jasper Ave, Edmonton, AB';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, evaluateAlbertaSecurityDeposit({
        monthlyRentCad,
        securityDepositPaidCad,
        additionalNonRefundableFeesCad,
        landlordConductedMoveInInspection,
        tenantReceivedSignedMoveInReport,
        landlordConductedMoveOutInspection,
        daysSinceTenancyEnded,
        deductionsClaimedCad,
        deductionsReason,
        tenantProvidedForwardingAddress,
        tenantName,
        landlordName,
        rentalUnitAddress,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/calgary-suite-amnesty') {
      const suiteType = url.searchParams.get('type') || 'basement_suite';
      const hasInterconnectedSmokeAlarms = url.searchParams.get('smokeAlarms') !== 'false';
      const hasCarbonMonoxideAlarm = url.searchParams.get('coAlarm') !== 'false';
      const bedroomWindowOpeningAreaSqM = url.searchParams.get('windowArea') ? Number(url.searchParams.get('windowArea')) : 0.38;
      const bedroomWindowMinDimensionMm = url.searchParams.get('windowDim') ? Number(url.searchParams.get('windowDim')) : 400;
      const windowWellClearanceMm = url.searchParams.get('wellClearance') ? Number(url.searchParams.get('wellClearance')) : 800;
      const ceilingHeightMetres = url.searchParams.get('ceilingHeight') ? Number(url.searchParams.get('ceilingHeight')) : 2.05;
      const hasDrywallFireSeparation = url.searchParams.get('fireSeparation') !== 'false';
      const hasCompliantHvacSystem = url.searchParams.get('hvac') !== 'false';
      const hasDirectExteriorExit = url.searchParams.get('exit') !== 'false';
      const isRegisteredOnCalgaryRegistry = url.searchParams.get('registered') === 'true';
      const propertyAddress = url.searchParams.get('address') || '123 Centre St, Calgary, AB';
      const ownerName = url.searchParams.get('name') || 'Property Owner';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, auditCalgarySecondarySuite({
        suiteType,
        hasInterconnectedSmokeAlarms,
        hasCarbonMonoxideAlarm,
        bedroomWindowOpeningAreaSqM,
        bedroomWindowMinDimensionMm,
        windowWellClearanceMm,
        ceilingHeightMetres,
        hasDrywallFireSeparation,
        hasCompliantHvacSystem,
        hasDirectExteriorExit,
        isRegisteredOnCalgaryRegistry,
        propertyAddress,
        ownerName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/alberta-commercial-distress') {
      const rentArrearsClaimedCad = url.searchParams.get('arrears') ? Number(url.searchParams.get('arrears')) : 15000;
      const goodsEstimatedValueCad = url.searchParams.get('goodsValue') ? Number(url.searchParams.get('goodsValue')) : 45000;
      const isSeizureExecutedByLicensedAgency = url.searchParams.get('licensedBailiff') !== 'false';
      const hasLandlordChangedLocksOrTerminatedLease = url.searchParams.get('changedLocks') === 'true';
      const wasDistressWarrantAndNoticeOfSeizureServed = url.searchParams.get('noticeServed') !== 'false';
      const wasNoticeOfObjectionFormProvided = url.searchParams.get('formProvided') !== 'false';
      const daysElapsedSinceSeizure = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 4;
      const tenantFiledNoticeOfObjection = url.searchParams.get('objected') === 'true';
      const thirdPartyLeasedEquipmentIncluded = url.searchParams.get('thirdParty') === 'true';
      const landlordThreatensImmediateSaleWithin5Days = url.searchParams.get('prematureSale') === 'true';
      const tenantBusinessName = url.searchParams.get('businessName') || 'Commercial Tenant Ltd.';
      const assessmentDate = url.searchParams.get('assessmentDate') || todayIso();
      return send(200, auditAlbertaCommercialDistress({
        rentArrearsClaimedCad,
        goodsEstimatedValueCad,
        isSeizureExecutedByLicensedAgency,
        hasLandlordChangedLocksOrTerminatedLease,
        wasDistressWarrantAndNoticeOfSeizureServed,
        wasNoticeOfObjectionFormProvided,
        daysElapsedSinceSeizure,
        tenantFiledNoticeOfObjection,
        thirdPartyLeasedEquipmentIncluded,
        landlordThreatensImmediateSaleWithin5Days,
        tenantBusinessName,
        assessmentDate
      }));
    }

    if(path==='/v1/tools/bc-strata-ev-charging') {
      const requestDate = url.searchParams.get('requestDate') || '2026-08-01';
      const currentDate = url.searchParams.get('currentDate') || todayIso();
      const stallType = url.searchParams.get('stallType') || 'limited_common_property';
      const applicantStatus = url.searchParams.get('status') || 'owner';
      const strataLotCount = url.searchParams.get('lots') ? Number(url.searchParams.get('lots')) : 48;
      const strataRegion = url.searchParams.get('region') || 'metro_vancouver';
      const hasStrataCouncilResponded = url.searchParams.get('responded') === 'true';
      const councilDecision = url.searchParams.get('decision') || 'pending';
      const refusalReasonCategory = url.searchParams.get('refusalReason') || 'none';
      const hasElectricalPlanningReportCompleted = url.searchParams.get('epr') === 'true';
      const hasOwnerAgreedToPayAllCostsAndInsurance = url.searchParams.get('payCosts') !== 'false';
      const strataPlanNumber = url.searchParams.get('plan') || 'LMS-1234';
      const ownerName = url.searchParams.get('name') || 'Strata Owner';
      return send(200, evaluateBcStrataEvCharging({
        requestDate,
        currentDate,
        stallType,
        applicantStatus,
        strataLotCount,
        strataRegion,
        hasStrataCouncilResponded,
        councilDecision,
        refusalReasonCategory,
        hasElectricalPlanningReportCompleted,
        hasOwnerAgreedToPayAllCostsAndInsurance,
        strataPlanNumber,
        ownerName
      }));
    }

    if(path==='/v1/tools/ontario-tenancy-assignment') {
      const requestType = url.searchParams.get('requestType') || 'ASSIGNMENT';
      const isGeneralRequest = url.searchParams.get('isGeneral') !== 'false';
      const daysSinceRequestMade = url.searchParams.get('daysPassed') ? Number(url.searchParams.get('daysPassed')) : 8;
      const landlordResponse = url.searchParams.get('landlordResponse') || 'NO_RESPONSE';
      const refusalReason = url.searchParams.get('refusalReason') || '';
      const outOfPocketFeeChargedCad = url.searchParams.get('feeCharged') ? Number(url.searchParams.get('feeCharged')) : 0;
      const actualDirectExpenseIncurredCad = url.searchParams.get('actualExpense') ? Number(url.searchParams.get('actualExpense')) : 0;
      const tenantWishesToTerminate = url.searchParams.get('wishesToTerminate') !== 'false';
      return send(200, evaluateOntarioTenancyAssignmentSublet({
        requestType,
        isGeneralRequest,
        daysSinceRequestMade,
        landlordResponse,
        refusalReason,
        outOfPocketFeeChargedCad,
        actualDirectExpenseIncurredCad,
        tenantWishesToTerminate
      }));
    }

    if(path==='/v1/tools/ontario-roommate-rights') {
      const sharesKitchenOrBathWithOwnerOrFamily = url.searchParams.get('sharedFacilities') === 'true';
      const occupantName = url.searchParams.get('occupant') || 'Occupant';
      const isNamedOnTenancyAgreement = url.searchParams.get('namedOnLease') === 'true';
      const tenantHasVacatedPermanently = url.searchParams.get('vacatedPermanently') === 'true';
      const daysSinceLandlordDiscoveredOccupancy = url.searchParams.get('daysDiscovered') ? Number(url.searchParams.get('daysDiscovered')) : 0;
      const landlordChargesGuestOrRoommateFee = url.searchParams.get('guestFeeCharged') === 'true';
      const guestFeeAmountMonthlyCad = url.searchParams.get('guestFeeCad') ? Number(url.searchParams.get('guestFeeCad')) : 0;
      const leaseContainsNoGuestOrRoommateClause = url.searchParams.get('noGuestClause') === 'true';
      const disputeNature = url.searchParams.get('disputeNature') || 'ROOMMATE_EVICTION_BY_TENANT';
      const daysNoticeGivenToRoommate = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 14;
      return send(200, evaluateOntarioRoommateAndOccupantRights({
        sharesKitchenOrBathWithOwnerOrFamily,
        occupantName,
        isNamedOnTenancyAgreement,
        tenantHasVacatedPermanently,
        daysSinceLandlordDiscoveredOccupancy,
        landlordChargesGuestOrRoommateFee,
        guestFeeAmountMonthlyCad,
        leaseContainsNoGuestOrRoommateClause,
        disputeNature,
        daysNoticeGivenToRoommate
      }));
    }

    if(path==='/v1/tools/bc-roommate-rights') {
      const sharesKitchenOrBathroomWithOwner = url.searchParams.get('sharedFacilities') === 'true';
      const isNamedOnTenancyAgreement = url.searchParams.get('namedOnLease') === 'true';
      const disputeType = url.searchParams.get('disputeType') || 'TENANT_ROOMMATE_DISPUTE';
      const landlordChargesGuestOrOccupantFee = url.searchParams.get('guestFeeCharged') === 'true';
      const monthlyGuestFeeCad = url.searchParams.get('guestFeeCad') ? Number(url.searchParams.get('guestFeeCad')) : 0;
      const tenancyAgreementLimitsOccupants = url.searchParams.get('limitsOccupants') === 'true';
      const statedOccupancyLimit = url.searchParams.get('limitCount') ? Number(url.searchParams.get('limitCount')) : 2;
      const currentOccupantsCount = url.searchParams.get('currentOccupants') ? Number(url.searchParams.get('currentOccupants')) : 2;
      const daysNoticeGivenToRoommate = url.searchParams.get('noticeDays') ? Number(url.searchParams.get('noticeDays')) : 14;
      return send(200, evaluateBcRoommateAndSharedKitchen({
        sharesKitchenOrBathroomWithOwner,
        isNamedOnTenancyAgreement,
        disputeType,
        landlordChargesGuestOrOccupantFee,
        monthlyGuestFeeCad,
        tenancyAgreementLimitsOccupants,
        statedOccupancyLimit,
        currentOccupantsCount,
        daysNoticeGivenToRoommate
      }));
    }

    if(path==='/v1/tools/alberta-tenancy-sublease') {
      return send(200, evaluateAlbertaTenancySubleaseAssignment(applyFormAliases(path, Object.fromEntries(url.searchParams))));
    }

    if(path==='/v1/tools/on-creed-accommodation') {
      const creedPracticeCategory = url.searchParams.get('practiceCategory') || 'SUKKAH_STRUCTURE_ON_BALCONY';
      const creedPracticeDescription = url.searchParams.get('description') || 'Erection of temporary Sukkah booth';
      const isSincerelyHeldBelief = url.searchParams.get('sincere') !== 'false';
      const landlordRefusedAccommodation = url.searchParams.get('refused') !== 'false';
      const landlordRefusalGround = url.searchParams.get('refusalGround') || 'BUILDING_AESTHETICS';
      const landlordOfferedAlternativeReasonableAccommodation = url.searchParams.get('alternativeOffered') === 'true';
      const alternativeAccommodationDescription = url.searchParams.get('alternativeDesc') || '';
      const harassmentOrHostileCommentFromLandlord = url.searchParams.get('harassment') === 'true';
      return send(200, evaluateOntarioHousingCreedAccommodation({
        creedPracticeCategory,
        creedPracticeDescription,
        isSincerelyHeldBelief,
        landlordRefusedAccommodation,
        landlordRefusalGround,
        landlordOfferedAlternativeReasonableAccommodation,
        alternativeAccommodationDescription,
        harassmentOrHostileCommentFromLandlord
      }));
    }

    if(path==='/v1/tools/bc-strata-str') {
      const strataBylaw = url.searchParams.get('strataBylaw') !== 'false';
      const isPrincipal = url.searchParams.get('isPrincipal') !== 'false';
      const stayDays = url.searchParams.get('stayDays') ? Number(url.searchParams.get('stayDays')) : 5;
      const population = url.searchParams.get('population') ? Number(url.searchParams.get('population')) : 25000;
      const dailyFine = url.searchParams.get('dailyFine') ? Number(url.searchParams.get('dailyFine')) : 1000;
      const daysFined = url.searchParams.get('daysFined') ? Number(url.searchParams.get('daysFined')) : 3;
      const noticeProvided = url.searchParams.get('noticeProvided') !== 'false';
      const hearingProvided = url.searchParams.get('hearingProvided') !== 'false';
      const suiteOrLaneway = url.searchParams.get('suiteOrLaneway') === 'true';
      return send(200, auditBcStrataShortTermRental({
        hasRegisteredStrBylawProhibition: strataBylaw,
        isPrincipalResidence: isPrincipal,
        rentalStayDays: stayDays,
        communityPopulation: population,
        fineAmountPerDayCad: dailyFine,
        totalDaysFined: daysFined,
        receivedWrittenNoticeOfComplaint: noticeProvided,
        providedOpportunityToBeHeard: hearingProvided,
        isOperatingSecondarySuiteOrLaneway: suiteOrLaneway
      }));
    }

    if(path==='/v1/tools/alberta-abandoned-goods') {
      return send(200, evaluateAlbertaAbandonedGoods(applyFormAliases(path, Object.fromEntries(url.searchParams))));
    }

    if(path==='/v1/tools/manitoba-rent-increase') {
      const currentRent = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 1200;
      const proposedRent = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 1250;
      const noticeMonths = url.searchParams.get('noticeMonths') ? Number(url.searchParams.get('noticeMonths')) : 3;
      const monthsSinceLast = url.searchParams.get('monthsSinceLast') ? Number(url.searchParams.get('monthsSinceLast')) : 12;
      const form2 = url.searchParams.get('form2') !== 'false';
      const agiApproved = url.searchParams.get('agiApproved') === 'true';
      const buildingYear = url.searchParams.get('buildingYear') ? Number(url.searchParams.get('buildingYear')) : 1995;
      return send(200, evaluateManitobaRentIncrease({
        currentMonthlyRentCad: currentRent,
        proposedMonthlyRentCad: proposedRent,
        noticeMonthsGiven: noticeMonths,
        monthsSinceLastRentIncrease: monthsSinceLast,
        usedPrescribedForm2: form2,
        hasApprovedAgiOrderFromRtb: agiApproved,
        buildingFirstOccupiedYear: buildingYear
      }));
    }

    if(path==='/v1/tools/bc-landlord-use-eviction') {
      const role = url.searchParams.get('role') || 'TENANT';
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const noticeMonths = url.searchParams.get('noticeMonths') ? Number(url.searchParams.get('noticeMonths')) : 4;
      const daysElapsed = url.searchParams.get('daysElapsed') ? Number(url.searchParams.get('daysElapsed')) : 10;
      const portal = url.searchParams.get('portal') !== 'false';
      const occupant = url.searchParams.get('occupant') || 'LANDLORD_OR_SPOUSE';
      const failed12Mos = url.searchParams.get('failed12Mos') === 'true';
      const extenuating = url.searchParams.get('extenuating') === 'true';
      const freeRent = url.searchParams.get('freeRent') !== 'false';
      return send(200, evaluateBcLandlordUseEviction({
        actorRole: role,
        monthlyRentCad: rent,
        noticeMonthsGiven: noticeMonths,
        daysElapsedSinceNoticeServed: daysElapsed,
        generatedThroughOfficialWebPortal: portal,
        intendedOccupantRelationship: occupant,
        landlordFailedToOccupyFor12Months: failed12Mos,
        extenuatingCircumstancesExist: extenuating,
        oneMonthFreeRentProvided: freeRent
      }));
    }

    if(path==='/v1/tools/alberta-landlord-entry') {
      return send(200, evaluateAlbertaLandlordEntry(applyFormAliases(path, Object.fromEntries(url.searchParams))));
    }

    if(path==='/v1/tools/ontario-residential-tenancy-urgent-repairs-t6') {
      const vitalCut = url.searchParams.get('vitalCut') === 'true';
      const tempParam = url.searchParams.get('temp');
      const temp = tempParam !== null && tempParam !== '' ? Number(tempParam) : null;
      const month = url.searchParams.get('month') ? Number(url.searchParams.get('month')) : 1;
      const noticeGiven = url.searchParams.get('noticeGiven') !== 'false';
      const daysSinceNotice = url.searchParams.get('daysSinceNotice') ? Number(url.searchParams.get('daysSinceNotice')) : 0;
      const outOfPocket = url.searchParams.get('outOfPocket') ? Number(url.searchParams.get('outOfPocket')) : 0;
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2000;
      const months = url.searchParams.get('months') ? Number(url.searchParams.get('months')) : 1;
      const abatement = url.searchParams.get('abatement') ? Number(url.searchParams.get('abatement')) : 25;
      const retaliation = url.searchParams.get('retaliation') === 'true';
      return send(200, evaluateOntarioUrgentRepairsT6({
        vitalServiceInterrupted: vitalCut,
        indoorTemperatureCelsius: temp,
        calendarMonth: month,
        landlordNotifiedInWriting: noticeGiven,
        daysSinceWrittenNotice: daysSinceNotice,
        emergencyRepairIncurredByTenantCad: outOfPocket,
        monthlyRentCad: rent,
        monthsOfDisrepair: months,
        estimatedAbatementPercentage: abatement,
        landlordRetaliationThreatened: retaliation
      }));
    }

    if(path==='/v1/tools/ontario-rent-deposit-interest') {
      const deposit = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 2000;
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2100;
      const years = url.searchParams.get('years') ? Number(url.searchParams.get('years')) : 2;
      const rate = url.searchParams.get('rate') ? Number(url.searchParams.get('rate')) : 2.5;
      const paidAnnual = url.searchParams.get('paidAnnual') === 'true';
      const offsetIncrease = url.searchParams.get('offsetIncrease') !== 'false';
      const damageDeposit = url.searchParams.get('damageDeposit') === 'true';
      const extraPaid = url.searchParams.get('extraPaid') ? Number(url.searchParams.get('extraPaid')) : 0;
      return send(200, evaluateOntarioRentDepositInterest({
        initialDepositAmountCad: deposit,
        currentMonthlyRentCad: rent,
        tenancyDurationYears: years,
        guidelineInterestRatePercent: rate,
        landlordPaidAnnualInterest: paidAnnual,
        depositAppliedToLastMonthRentIncrease: offsetIncrease,
        landlordDemandedDamageDeposit: damageDeposit,
        extraDepositPaidCad: extraPaid
      }));
    }

    if(path==='/v1/tools/bc-strata-depreciation-crf') {
      const lots = url.searchParams.get('lots') ? Number(url.searchParams.get('lots')) : 24;
      const yearsSinceReport = url.searchParams.get('yearsSinceReport') ? Number(url.searchParams.get('yearsSinceReport')) : 6;
      const cred = url.searchParams.get('cred') || 'CERTIFIED_RESERVE_PLANNER_CRP';
      const budget = url.searchParams.get('budget') ? Number(url.searchParams.get('budget')) : 100000;
      const contrib = url.searchParams.get('contrib') ? Number(url.searchParams.get('contrib')) : 8000;
      const waiver = url.searchParams.get('waiver') === 'true';
      const formB = url.searchParams.get('formB') !== 'false';
      return send(200, evaluateBcStrataDepreciationReport({
        strataLotsCount: lots,
        yearsSinceLastDepreciationReport: yearsSinceReport,
        reportAuthorCredential: cred,
        annualOperatingBudgetCad: budget,
        annualCrfContributionCad: contrib,
        strataAttemptedAnnualWaiverVote: waiver,
        depreciationReportAttachedToFormB: formB
      }));
    }

    if(path==='/v1/tools/bc-security-deposit-double-penalty') {
      const secDeposit = url.searchParams.get('secDeposit') ? Number(url.searchParams.get('secDeposit')) : 1000;
      const petDeposit = url.searchParams.get('petDeposit') ? Number(url.searchParams.get('petDeposit')) : 0;
      const ended = url.searchParams.get('ended') !== 'false';
      const forwarding = url.searchParams.get('forwarding') !== 'false';
      const daysSince = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 25;
      const consent = url.searchParams.get('consent') === 'true';
      const deduction = url.searchParams.get('deduction') ? Number(url.searchParams.get('deduction')) : 0;
      const filedDispute = url.searchParams.get('filedDispute') === 'true';
      const refunded = url.searchParams.get('refunded') ? Number(url.searchParams.get('refunded')) : 0;
      return send(200, evaluateBcSecurityDepositDoublePenalty({
        securityDepositPaidCad: secDeposit,
        petDepositPaidCad: petDeposit,
        tenancyHasEnded: ended,
        forwardingAddressProvidedInWriting: forwarding,
        daysSinceForwardingAddressReceived: daysSince,
        tenantSignedWrittenDeductionConsent: consent,
        tenantAgreedDeductionAmountCad: deduction,
        landlordFiledRtbClaimWithin15Days: filedDispute,
        landlordRefundedAmountCad: refunded
      }));
    }

    if(path==='/v1/tools/saskatchewan-security-deposit-return') {
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 1500;
      const deposit = url.searchParams.get('deposit') ? Number(url.searchParams.get('deposit')) : 1500;
      const ended = url.searchParams.get('ended') !== 'false';
      const daysSince = url.searchParams.get('daysSince') ? Number(url.searchParams.get('daysSince')) : 10;
      const fullRefund = url.searchParams.get('fullRefund') === 'true';
      const refunded = url.searchParams.get('refunded') ? Number(url.searchParams.get('refunded')) : 0;
      const form13 = url.searchParams.get('form13') === 'true';
      const consent = url.searchParams.get('consent') === 'true';
      const agreed = url.searchParams.get('agreed') ? Number(url.searchParams.get('agreed')) : 0;
      return send(200, evaluateSaskatchewanSecurityDepositReturn({
        monthlyRentCad: rent,
        securityDepositPaidCad: deposit,
        tenancyEnded: ended,
        businessDaysSinceTenancyEnded: daysSince,
        landlordRefundedFullDeposit: fullRefund,
        amountActuallyRefundedCad: refunded,
        landlordServedPrescribedForm13: form13,
        tenantSignedWrittenDeductionConsent: consent,
        tenantAgreedDeductionAmountCad: agreed
      }));
    }

    if(path==='/v1/tools/ontario-illegal-entry-t2') {
      const written = url.searchParams.get('written') !== 'false';
      const hoursNotice = url.searchParams.get('hoursNotice') ? Number(url.searchParams.get('hoursNotice')) : 24;
      const hour = url.searchParams.get('hour') ? Number(url.searchParams.get('hour')) : 14;
      const emergency = url.searchParams.get('emergency') === 'true';
      const consent = url.searchParams.get('consent') === 'true';
      const window = url.searchParams.get('window') !== 'false';
      const purpose = url.searchParams.get('purpose') !== 'false';
      const rent = url.searchParams.get('rent') ? Number(url.searchParams.get('rent')) : 2200;
      const incidents = url.searchParams.get('incidents') ? Number(url.searchParams.get('incidents')) : 1;
      const expenses = url.searchParams.get('expenses') ? Number(url.searchParams.get('expenses')) : 0;
      return send(200, evaluateOntarioIllegalEntryT2({
        writtenNoticeGiven: written,
        noticeHoursGiven: hoursNotice,
        entryScheduledHour: hour,
        isEmergencyEntry: emergency,
        tenantConsentedAtTimeOfEntry: consent,
        noticeSpecifiedTimeWindow: window,
        noticeStatedValidPurpose: purpose,
        monthlyRentCad: rent,
        unlawfulEntryIncidentsCount: incidents,
        outOfPocketExpensesCad: expenses
      }));
    }

    if(path==='/v1/tools/alberta-periodic-tenancy-notice') {
      return send(200, evaluateAlbertaPeriodicTenancyNotice(applyFormAliases(path, Object.fromEntries(url.searchParams))));
    }

    if(path==='/v1/tools/bc-rtb-dispute-track') {
      const category = url.searchParams.get('category') || 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION';
      const vital = url.searchParams.get('vital') === 'true';
      const lockout = url.searchParams.get('lockout') === 'true';
      const danger = url.searchParams.get('danger') === 'true';
      const monetaryOnly = url.searchParams.get('monetaryOnly') === 'true';
      const readyService = url.searchParams.get('readyService') !== 'false';
      return send(200, evaluateBcRtbDisputeTrack({
        disputeCategory: category,
        vitalServiceOrStructuralDanger: vital,
        locksChangedWithoutOrder: lockout,
        violenceOrImminentThreatDemonstrated: danger,
        isMonetaryClaimOnly: monetaryOnly,
        readyToServeEvidenceWithinOneDay: readyService
      }));
    }

    if(path==='/v1/tools/ontario-bc-tenancy') {
      const province = (url.searchParams.get('province') || 'ON').toUpperCase();
      const currentRent = url.searchParams.get('currentRent') ? Number(url.searchParams.get('currentRent')) : 2000;
      const proposedRent = url.searchParams.get('proposedRent') ? Number(url.searchParams.get('proposedRent')) : 2100;
      const action = url.searchParams.get('action') || 'rent_increase';
      if (province === 'BC') {
        const failedToOccupy = url.searchParams.get('badFaith') === 'true';
        return send(200, auditBcTenancyNotice({
          type: action === 'landlord_use' ? 'landlord_use' : 'rent_increase',
          currentRentCad: currentRent,
          proposedRentCad: proposedRent,
          landlordFailedToOccupyFor6Months: failedToOccupy
        }));
      }
      if (action === 'shared_facility') {
        const shares = url.searchParams.get('shares') === 'true';
        const livesIn = url.searchParams.get('landlordLivesIn') === 'true';
        const relation = url.searchParams.get('relation') || 'self';
        return send(200, evaluateOntarioSharedKitchenBathroomJurisdiction({
          sharesKitchenOrBathroomWithLandlord: shares,
          landlordOrFamilyLivesInUnit: livesIn,
          relativeRelationshipToLandlord: relation
        }));
      }
      if (action === 'n12_audit') {
        return send(200, auditOntarioFormN12Notice({
          monthlyRentCad: currentRent,
          compensationPaidDate: url.searchParams.get('paidDate') || null
        }));
      }
      if (action === 't1_refund') {
        const amount = url.searchParams.get('amount') ? Number(url.searchParams.get('amount')) : 1500;
        const paidDate = url.searchParams.get('paidDate') || '2025-06-01';
        return send(200, evaluateOntarioT1RefundClaim({ amountPaidCad: amount, paymentDate: paidDate }));
      }
      return send(200, auditOntarioRentIncrease({ currentMonthlyRentCad: currentRent, proposedMonthlyRentCad: proposedRent }));
    }

  return false;
}

export function handleHousingPost(ctx) {
  const { input, path } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };

    if(path==='/v1/tools/lease-guard') {
      return send(200, auditLeaseAgreement(input));
    }

    if(path==='/v1/tools/eviction-defense') {
      return send(200, auditEvictionNotice(input));
    }

    if(path==='/v1/tools/lease-assignment') {
      return send(200, evaluateLeaseAssignmentExit(input));
    }

    if(path==='/v1/tools/rent-increase-defense') {
      return send(200, evaluateRentIncreaseNotice(input));
    }

    if(path==='/v1/tools/tenancy-repairs') {
      return send(200, evaluateTenancyRepairs(input));
    }

    if(path==='/v1/tools/commercial-lease') {
      return send(200, evaluateCommercialLease(input));
    }

    if(path==='/v1/tools/bc-strata-bylaw') {
      return send(200, evaluateBcStrataBylawDefense(input));
    }

    if(path==='/v1/tools/alberta-security-deposit') {
      return send(200, evaluateAlbertaSecurityDeposit(input));
    }

    if(path==='/v1/tools/calgary-suite-amnesty') {
      return send(200, auditCalgarySecondarySuite(input));
    }

    if(path==='/v1/tools/alberta-commercial-distress') {
      return send(200, auditAlbertaCommercialDistress(input));
    }

    if(path==='/v1/tools/bc-strata-ev-charging') {
      return send(200, evaluateBcStrataEvCharging(input));
    }

    if(path==='/v1/tools/ontario-tenancy-assignment') {
      return send(200, evaluateOntarioTenancyAssignmentSublet(input));
    }

    if(path==='/v1/tools/ontario-roommate-rights') {
      return send(200, evaluateOntarioRoommateAndOccupantRights(input));
    }

    if(path==='/v1/tools/bc-roommate-rights') {
      return send(200, evaluateBcRoommateAndSharedKitchen(input));
    }

    if(path==='/v1/tools/alberta-tenancy-sublease') {
      return send(200, evaluateAlbertaTenancySubleaseAssignment(input));
    }

    if(path==='/v1/tools/on-creed-accommodation') {
      return send(200, evaluateOntarioHousingCreedAccommodation(input));
    }

    if(path==='/v1/tools/bc-strata-str') {
      return send(200, auditBcStrataShortTermRental(input));
    }

    if(path==='/v1/tools/alberta-abandoned-goods') {
      return send(200, evaluateAlbertaAbandonedGoods(input));
    }

    if(path==='/v1/tools/manitoba-rent-increase') {
      return send(200, evaluateManitobaRentIncrease(input));
    }

    if(path==='/v1/tools/bc-landlord-use-eviction') {
      return send(200, evaluateBcLandlordUseEviction(input));
    }

    if(path==='/v1/tools/alberta-landlord-entry') {
      return send(200, evaluateAlbertaLandlordEntry(input));
    }

    if(path==='/v1/tools/ontario-residential-tenancy-urgent-repairs-t6') {
      return send(200, evaluateOntarioUrgentRepairsT6(input));
    }

    if(path==='/v1/tools/ontario-rent-deposit-interest') {
      return send(200, evaluateOntarioRentDepositInterest(input));
    }

    if(path==='/v1/tools/bc-strata-depreciation-crf') {
      return send(200, evaluateBcStrataDepreciationReport(input));
    }

    if(path==='/v1/tools/bc-security-deposit-double-penalty') {
      return send(200, evaluateBcSecurityDepositDoublePenalty(input));
    }

    if(path==='/v1/tools/saskatchewan-security-deposit-return') {
      return send(200, evaluateSaskatchewanSecurityDepositReturn(input));
    }

    if(path==='/v1/tools/ontario-illegal-entry-t2') {
      return send(200, evaluateOntarioIllegalEntryT2(input));
    }

    if(path==='/v1/tools/alberta-periodic-tenancy-notice') {
      return send(200, evaluateAlbertaPeriodicTenancyNotice(input));
    }

    if(path==='/v1/tools/bc-rtb-dispute-track') {
      return send(200, evaluateBcRtbDisputeTrack(input));
    }

    if(path==='/v1/tools/ontario-bc-tenancy') {
      // Mirror the GET endpoint for form bodies; canonical API keys win when present.
      const isTrue=v=>v===true||v==='true';
      const notEmpty=v=>v!=null&&v!=='';
      const numOr=(v,d)=>{const n=Number(v);return notEmpty(v)&&Number.isFinite(n)?n:d;};
      const province=String(input.province||'ON').toUpperCase();
      const currentRent=numOr(input.currentRent,2000);
      const proposedRent=numOr(input.proposedRent,2100);
      const action=input.action||'rent_increase';
      if (province === 'BC' || input.type === 'bc_tenancy') {
        return send(200, auditBcTenancyNotice({
          type: input.type || (action === 'landlord_use' ? 'landlord_use' : 'rent_increase'),
          currentRentCad: numOr(input.currentRentCad,currentRent),
          proposedRentCad: numOr(input.proposedRentCad,proposedRent),
          landlordFailedToOccupyFor6Months: isTrue(input.landlordFailedToOccupyFor6Months??input.badFaith)
        }));
      }
      if (action === 'shared_facility') {
        return send(200, evaluateOntarioSharedKitchenBathroomJurisdiction({
          sharesKitchenOrBathroomWithLandlord: isTrue(input.sharesKitchenOrBathroomWithLandlord??input.shares),
          landlordOrFamilyLivesInUnit: isTrue(input.landlordOrFamilyLivesInUnit??input.landlordLivesIn),
          relativeRelationshipToLandlord: input.relativeRelationshipToLandlord ?? (input.relation || 'self')
        }));
      }
      if (action === 'n12_audit') {
        return send(200, auditOntarioFormN12Notice({
          monthlyRentCad: numOr(input.monthlyRentCad,currentRent),
          compensationPaidDate: input.compensationPaidDate ?? (input.paidDate||null)
        }));
      }
      if (action === 't1_refund') {
        return send(200, evaluateOntarioT1RefundClaim({
          amountPaidCad: numOr(input.amountPaidCad, numOr(input.amount, 1500)),
          paymentDate: input.paymentDate ?? (input.paidDate||'2025-06-01')
        }));
      }
      return send(200, auditOntarioRentIncrease({
        currentMonthlyRentCad: numOr(input.currentMonthlyRentCad,currentRent),
        proposedMonthlyRentCad: numOr(input.proposedMonthlyRentCad,proposedRent)
      }));
    }

  return false;
}
