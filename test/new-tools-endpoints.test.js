import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('new endpoints: compare-cities and i18n respond correctly over HTTP', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-token-at-least-24-chars-long', {}, {
    rateLimits: { v1: { limit: 500, windowMs: 60000 }, tools: { limit: 500, windowMs: 60000 }, admin: { limit: 60, windowMs: 60000 }, static: { limit: 240, windowMs: 60000 } }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. GET /v1/tools/compare-cities
    const getRes = await fetch(`${baseUrl}/v1/tools/compare-cities?cities=Toronto,Vancouver&salary=90000`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(getData.comparison);
    assert.equal(getData.comparison.length, 2);
    assert.ok(getData.differential);

    // 2. POST /v1/tools/compare-cities
    const postRes = await fetch(`${baseUrl}/v1/tools/compare-cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cities: ['Toronto', 'Calgary'], annualSalary: 85000, householdSize: 2 })
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.differential.cheaperCity, 'Calgary');

    // 3. GET /v1/i18n/languages
    const langRes = await fetch(`${baseUrl}/v1/i18n/languages`);
    assert.equal(langRes.status, 200);
    const langData = await langRes.json();
    assert.ok(Array.isArray(langData.languages));
    assert.ok(langData.languages.some(l => l.code === 'fr'));
    assert.ok(langData.languages.some(l => l.code === 'hi'));

    // 4. GET /v1/i18n/fr
    const frRes = await fetch(`${baseUrl}/v1/i18n/fr`);
    assert.equal(frRes.status, 200);
    const frData = await frRes.json();
    assert.equal(frData.language, 'fr');
    assert.ok(frData.labels.emergencySOS);

    // 5. POST /v1/answers with conversational previousContext
    const convRes = await fetch(`${baseUrl}/v1/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What documents do I need to bring?',
        previousContext: {
          topic: 'sin',
          city: 'Toronto',
          at: new Date().toISOString()
        }
      })
    });
    assert.equal(convRes.status, 200);
    const convData = await convRes.json();
    assert.ok(convData.traceId);
    assert.ok(convData.parsed.intents.includes('sin'));
    assert.equal(convData.parsed.city, 'Toronto');
    assert.equal(convData.context.status, 'applied');
    assert.equal(convData.context.requiresConfirmation, true);

    // Stale context is reported as ignored and nothing is assumed.
    const staleRes = await fetch(`${baseUrl}/v1/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Is it free?', previousContext: { topic: 'sin', city: 'Toronto', at: '2020-01-01T00:00:00Z' } })
    });
    assert.equal(staleRes.status, 200);
    const staleData = await staleRes.json();
    assert.equal(staleData.context.reason, 'expired');
    assert.equal(staleData.parsed.city, null);

    // Without previousContext the response carries no context field.
    const plainRes = await fetch(`${baseUrl}/v1/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How do I get a SIN in Toronto?' })
    });
    assert.equal('context' in (await plainRes.json()), false);

    // 6. GET & POST /v1/tools/settlement-journey
    const journeyGetRes = await fetch(`${baseUrl}/v1/tools/settlement-journey?category=pr_express_entry&city=Toronto&date=2026-11-01`);
    assert.equal(journeyGetRes.status, 200);
    const journeyGetData = await journeyGetRes.json();
    assert.equal(journeyGetData.categoryKey, 'pr_express_entry');
    assert.ok(journeyGetData.totalMilestones > 5);

    const journeyPostRes = await fetch(`${baseUrl}/v1/tools/settlement-journey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'work_permit', city: 'Vancouver', date: '2026-12-01' })
    });
    assert.equal(journeyPostRes.status, 200);
    const journeyPostData = await journeyPostRes.json();
    assert.equal(journeyPostData.categoryKey, 'work_permit');
    assert.equal(journeyPostData.city, 'Vancouver');

    // 7. GET & POST /v1/tools/newcomer-budget
    const budgetGetRes = await fetch(`${baseUrl}/v1/tools/newcomer-budget?city=Toronto&household=single&savings=20000`);
    assert.equal(budgetGetRes.status, 200);
    const budgetGetData = await budgetGetRes.json();
    assert.equal(budgetGetData.city, 'Toronto');
    assert.ok(budgetGetData.runwayMonths > 0);

    const budgetPostRes = await fetch(`${baseUrl}/v1/tools/newcomer-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: 'Calgary', household: 'family_2_children', accommodation: '2bed', savingsCad: 40000, monthlyIncomeNet: 4000 })
    });
    assert.equal(budgetPostRes.status, 200);
    const budgetPostData = await budgetPostRes.json();
    assert.equal(budgetPostData.city, 'Calgary');
    assert.equal(budgetPostData.monthlyGovernmentOffsets.canadaChildBenefit,0);

    // 8. GET & POST /v1/tools/healthcare-eligibility
    const healthGetRes = await fetch(`${baseUrl}/v1/tools/healthcare-eligibility?province=BC&status=pr&date=2026-10-15`);
    assert.equal(healthGetRes.status, 200);
    const healthGetData = await healthGetRes.json();
    assert.equal(healthGetData.provinceCode, 'BC');
    assert.equal(healthGetData.bridgeInsuranceRequired, true);

    const healthPostRes = await fetch(`${baseUrl}/v1/tools/healthcare-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ province: 'ON', immigrationStatus: 'pr', landingDateStr: '2026-11-01' })
    });
    assert.equal(healthPostRes.status, 200);
    const healthPostData = await healthPostRes.json();
    assert.equal(healthPostData.provinceCode, 'ON');
    assert.equal(healthPostData.waitingPeriodDays, 0);

    // 9. GET & POST /v1/tools/licence-exchange
    const licenceGetRes = await fetch(`${baseUrl}/v1/tools/licence-exchange?origin=India&years=2plus&docs=extract`);
    assert.equal(licenceGetRes.status, 200);
    const licenceGetData = await licenceGetRes.json();
    assert.equal(licenceGetData.waitPeriodSkipped, true);

    const licencePostRes = await fetch(`${baseUrl}/v1/tools/licence-exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Germany', destination: 'ON' })
    });
    assert.equal(licencePostRes.status, 200);
    const licencePostData = await licencePostRes.json();
    assert.equal(licencePostData.isReciprocal, true);

    // 10. GET & POST /v1/tools/credit-simulator
    const creditGetRes = await fetch(`${baseUrl}/v1/tools/credit-simulator?limit=3000&spend=400`);
    assert.equal(creditGetRes.status, 200);
    const creditGetData = await creditGetRes.json();
    assert.ok(creditGetData.m9Score >= 650);

    const creditPostRes = await fetch(`${baseUrl}/v1/tools/credit-simulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 5000, spend: 300, strategy: 'multiple_payments', inquiries: 1 })
    });
    assert.equal(creditPostRes.status, 200);
    const creditPostData = await creditPostRes.json();
    assert.ok(creditPostData.m9Score >= 700);

    // 11. GET & POST /v1/tools/validate-documents
    const docGetRes = await fetch(`${baseUrl}/v1/tools/validate-documents?date=2026-11-01&passportExpiry=2029-01-01&coprExpiry=2027-02-01`);
    assert.equal(docGetRes.status, 200);
    const docGetData = await docGetRes.json();
    assert.equal(docGetData.overallReadiness, 'verified_ready');
    assert.equal(docGetData.counts.total, 2);

    const docPostRes = await fetch(`${baseUrl}/v1/tools/validate-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landingDateStr: '2026-11-01',
        documents: [
          { docType: 'passport', expiryDate: '2026-12-01' } // High risk: < 6 months
        ]
      })
    });
    assert.equal(docPostRes.status, 200);
    const docPostData = await docPostRes.json();
    assert.equal(docPostData.overallReadiness, 'action_required');
    assert.equal(docPostData.counts.highRisk, 1);

    // 12. GET & POST /v1/tools/cra-benefits
    const craGetRes = await fetch(`${baseUrl}/v1/tools/cra-benefits?province=ON&income=30000&under6=1&over6=1`);
    assert.equal(craGetRes.status, 200);
    const craGetData = await craGetRes.json();
    assert.equal(craGetData.province, 'ON');
    assert.equal(craGetData.familyProfile.totalChildrenCount, 2);
    assert.ok(craGetData.annualTotals.ccbAnnual > 14000);
    assert.ok(craGetData.cashflowSchedule.totalMonthlyLiquidityCad > 1000);

    const craPostRes = await fetch(`${baseUrl}/v1/tools/cra-benefits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        adjustedFamilyNetIncomeCad: 40000,
        maritalStatus: 'married',
        childrenUnder6Count: 1,
        children6to17Count: 0
      })
    });
    assert.equal(craPostRes.status, 200);
    const craPostData = await craPostRes.json();
    assert.equal(craPostData.province, 'BC');
    assert.ok(craPostData.annualTotals.ccbAnnual > 7000);
    assert.ok(craPostData.requiredForms.some(f => f.formCode === 'Form RC66'));

    // 13. GET & POST /v1/tools/credential-pathway
    const credGetRes = await fetch(`${baseUrl}/v1/tools/credential-pathway?profession=engineering&province=ON`);
    assert.equal(credGetRes.status, 200);
    const credGetData = await credGetRes.json();
    assert.equal(credGetData.professionKey, 'engineering');
    assert.equal(credGetData.targetProvince, 'ON');
    assert.equal(credGetData.canadianExperiencePolicy.mandatoryCanadianExperienceRequired, false);

    const credPostRes = await fetch(`${baseUrl}/v1/tools/credential-pathway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession: 'nursing',
        targetProvince: 'BC',
        originCountry: 'Philippines',
        currentDegree: 'BS Nursing'
      })
    });
    assert.equal(credPostRes.status, 200);
    const credPostData = await credPostRes.json();
    assert.equal(credPostData.professionKey, 'nursing');
    assert.equal(credPostData.targetProvince, 'BC');
    assert.equal(credPostData.designatedEca.code, 'NNAS');

    // 14. GET & POST /v1/tools/lease-guard
    const leaseGetRes = await fetch(`${baseUrl}/v1/tools/lease-guard?province=ON&rent=2200&standardForm=false`);
    assert.equal(leaseGetRes.status, 200);
    const leaseGetData = await leaseGetRes.json();
    assert.equal(leaseGetData.province, 'ON');
    assert.equal(leaseGetData.standardFormStatus.isCompliant, false);
    assert.ok(leaseGetData.standardFormStatus.statutoryRemedy.rentWithholding.includes('RTA s. 12.1(5)'));

    const leasePostRes = await fetch(`${baseUrl}/v1/tools/lease-guard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        monthlyRentCad: 2000,
        standardFormUsed: true,
        depositDemands: { rentDepositMonths: 2, damageDepositCad: 1000, keyDepositCad: 150 },
        clausesPresent: ['no_pets', 'no_guests']
      })
    });
    assert.equal(leasePostRes.status, 200);
    const leasePostData = await leasePostRes.json();
    assert.equal(leasePostData.province, 'ON');
    assert.equal(leasePostData.depositAudit.totalUnlawfulExcessCad, 2000 + 1000 + 100);
    assert.equal(leasePostData.voidClauseCount, 2);
    assert.ok(leasePostData.officialDisputeNotice.includes('UNLAWFUL DEPOSIT REBATE DEMAND'));

    // 15. GET & POST /v1/tools/childcare-support
    const childcareGetRes = await fetch(`${baseUrl}/v1/tools/childcare-support?city=Toronto&income=18000&status=work_permit&ageGroup=toddler`);
    assert.equal(childcareGetRes.status, 200);
    const childcareGetData = await childcareGetRes.json();
    assert.equal(childcareGetData.city, 'Toronto');
    assert.equal(childcareGetData.subsidyAssessment.status, 'full_subsidy');
    assert.equal(childcareGetData.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad, 0);
    assert.ok(childcareGetData.waitlistPortal.url.includes('toronto.ca'));

    const childcarePostRes = await fetch(`${baseUrl}/v1/tools/childcare-support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'Vancouver',
        annualFamilyIncomeCad: 40000,
        immigrationStatus: 'pr',
        children: [{ ageGroup: 'infant' }]
      })
    });
    assert.equal(childcarePostRes.status, 200);
    const childcarePostData = await childcarePostRes.json();
    assert.equal(childcarePostData.city, 'Vancouver');
    assert.equal(childcarePostData.subsidyAssessment.status, 'full_subsidy');
    assert.equal(childcarePostData.monthlyCostSummary.cwelccUniversalCapMonthlyTotalCad, 462);
    assert.equal(childcarePostData.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad, 0);

    // 16. GET & POST /v1/tools/customs-declaration
    const customsGetRes = await fetch(`${baseUrl}/v1/tools/customs-declaration?status=pr&currency=12000`);
    assert.equal(customsGetRes.status, 200);
    const customsGetData = await customsGetRes.json();
    assert.equal(customsGetData.settlerStatus, 'pr');
    assert.equal(customsGetData.tariffClassification.code, '9807.00.00');
    assert.equal(customsGetData.currencyCompliance.isDeclarationMandatory, true);
    assert.ok(customsGetData.currencyCompliance.mandatoryForm.includes('Form E677'));

    const customsPostRes = await fetch(`${baseUrl}/v1/tools/customs-declaration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settlerStatus: 'pr',
        currencyCad: 5000,
        items: [
          { category: 'electronics', description: 'MacBook Pro', valueCad: 3000, ownedMonths: 12, isAccompanying: true },
          { category: 'furniture', description: 'Bed frame', valueCad: 1000, ownedMonths: 8, isAccompanying: false }
        ]
      })
    });
    assert.equal(customsPostRes.status, 200);
    const customsPostData = await customsPostRes.json();
    assert.equal(customsPostData.financialAudit.totalDeclaredValueCad, 4000);
    assert.equal(customsPostData.bsf186Manifest.accompanyingCount, 1);
    assert.equal(customsPostData.bsf186Manifest.goodsToFollowCount, 1);

    // 17. GET & POST /v1/tools/homebuyer-eligibility
    const homeGetRes = await fetch(`${baseUrl}/v1/tools/homebuyer-eligibility?price=800000&province=ON&city=Toronto&status=pr&isFthb=true`);
    assert.equal(homeGetRes.status, 200);
    const homeGetData = await homeGetRes.json();
    assert.equal(homeGetData.province, 'ON');
    assert.equal(homeGetData.federalBanAssessment.isLegallyPermittedToBuy, true);
    assert.equal(homeGetData.federalBanAssessment.statutoryStatus, 'exempt_pr');
    assert.equal(homeGetData.provincialTaxAssessment.upfrontNonResidentTaxCad, 0);

    const homePostRes = await fetch(`${baseUrl}/v1/tools/homebuyer-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchasePriceCad: 800000,
        province: 'ON',
        city: 'Mississauga',
        immigrationStatus: 'work_permit',
        workPermitDaysRemaining: 300,
        hasPurchasedPreviousResidentialPropertyInCanada: false,
        willOccupyAsPrincipalResidenceWithin60Days: true
      })
    });
    assert.equal(homePostRes.status, 200);
    const homePostData = await homePostRes.json();
    assert.equal(homePostData.federalBanAssessment.isLegallyPermittedToBuy, true);
    assert.equal(homePostData.provincialTaxAssessment.ratePercent, 25);
    assert.equal(homePostData.provincialTaxAssessment.upfrontNonResidentTaxCad, 200000);
    assert.equal(homePostData.provincialTaxAssessment.isEligibleForStatutoryRebate, true);

    // 18. GET & POST /v1/tools/banking-comparator
    const bankGetRes = await fetch(`${baseUrl}/v1/tools/banking-comparator?bank=all&spend=800&target=740&phone=true&status=pr`);
    assert.equal(bankGetRes.status, 200);
    const bankGetData = await bankGetRes.json();
    assert.equal(bankGetData.packagesComparison.length, 5);
    assert.ok(bankGetData.bankActStatutoryRights.coreRight.includes('without a credit check'));
    assert.equal(bankGetData.utilizationOptimization.optimalReportedStatementBalanceCad, 80);

    const bankPostRes = await fetch(`${baseUrl}/v1/tools/banking-comparator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedBank: 'scotiabank',
        monthlySpendingCad: 1000,
        targetCreditScore: 750,
        hasPostpaidPhonePlan: true,
        immigrationCategory: 'work_permit'
      })
    });
    assert.equal(bankPostRes.status, 200);
    const bankPostData = await bankPostRes.json();
    assert.equal(bankPostData.packagesComparison.length, 5);
    assert.equal(bankPostData.twelveMonthRoadmap.length, 5);
    assert.ok(bankPostData.authority.includes('Bank Act'));

    // 19. GET & POST /v1/tools/citizenship-calculator
    const citGetRes = await fetch(`${baseUrl}/v1/tools/citizenship-calculator?landingDate=2024-01-01&prePrDays=730&absences=30&taxes=3&age=30&langProof=celpip`);
    assert.equal(citGetRes.status, 200);
    const citGetData = await citGetRes.json();
    assert.equal(citGetData.physicalPresenceAudit.prePrCreditedDays, 365);
    assert.equal(citGetData.physicalPresenceAudit.hasMetPhysicalPresence, true);
    assert.equal(citGetData.overallReadiness.status, 'eligible_now');

    const citPostRes = await fetch(`${baseUrl}/v1/tools/citizenship-calculator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationDate: '2026-01-01',
        prLandingDate: '2025-01-01',
        prePrDaysPresent: 0,
        postPrDaysAbsent: 0
      })
    });
    assert.equal(citPostRes.status, 200);
    const citPostData = await citPostRes.json();
    assert.equal(citPostData.physicalPresenceAudit.totalCreditedDays, 365);
    assert.equal(citPostData.overallReadiness.status, 'not_yet_eligible');
    assert.ok(citPostData.physicalPresenceAudit.earliestProjectedEligibleDate.startsWith('2028-01-01'));

    // 20. GET & POST /v1/tools/eviction-defense
    const evictGetRes = await fetch(`${baseUrl}/v1/tools/eviction-defense?formType=N12&rent=2200&servedDate=2026-05-01&termDate=2026-06-30&paid=false`);
    assert.equal(evictGetRes.status, 200);
    const evictGetData = await evictGetRes.json();
    assert.equal(evictGetData.noticeFormType, 'N12');
    assert.equal(evictGetData.isNoticeStatutorilyVoid, true);
    assert.equal(evictGetData.validityVerdict, 'STATUTORILY_VOID');
    assert.ok(evictGetData.statutoryDefects.some(d => d.defect.includes('Unpaid Statutory Compensation')));

    const evictPostRes = await fetch(`${baseUrl}/v1/tools/eviction-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noticeFormType: 'N12',
        monthlyRentCad: 2400,
        noticeServedDate: '2026-04-01',
        terminationDate: '2026-06-30',
        wasStatutoryCompensationPaid: true,
        compensationPaidDate: '2026-06-01',
        isLandlordACorporation: true
      })
    });
    assert.equal(evictPostRes.status, 200);
    const evictPostData = await evictPostRes.json();
    assert.equal(evictPostData.noticeFormType, 'N12');
    assert.equal(evictPostData.isNoticeStatutorilyVoid, true);
    assert.ok(evictPostData.statutoryDefects.some(d => d.defect.includes('Corporate Landlord Prohibition')));
    assert.equal(evictPostData.potentialTenantDamages.statutoryGeneralDamages12MonthsRentCad, 28800);

    // 21. GET & POST /v1/tools/pr-residency
    const prGetRes = await fetch(`${baseUrl}/v1/tools/pr-residency?landingDate=2021-01-01&daysInside=800&expiryDate=2026-06-01`);
    assert.equal(prGetRes.status, 200);
    const prGetData = await prGetRes.json();
    assert.equal(prGetData.complianceStatus, 'FULLY_COMPLIANT');
    assert.equal(prGetData.residencyDayAudit.hasMet730DaysObligation, true);
    assert.equal(prGetData.residencyDayAudit.totalCreditedResidencyDays, 800);

    const prPostRes = await fetch(`${baseUrl}/v1/tools/pr-residency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentDate: '2026-06-01',
        prLandingDate: '2021-01-01',
        prCardExpiryDate: '2026-07-01',
        physicalDaysInsideCanada: 450,
        overseasDaysWithCitizenSpouse: 300,
        isCurrentlyInsideCanada: true
      })
    });
    assert.equal(prPostRes.status, 200);
    const prPostData = await prPostRes.json();
    assert.equal(prPostData.complianceStatus, 'FULLY_COMPLIANT');
    assert.equal(prPostData.residencyDayAudit.totalCreditedResidencyDays, 750);
    assert.equal(prPostData.residencyDayAudit.surplusOrDeficitDays, 20);
    assert.equal(prPostData.renewalEligibility.isEligibleToApplyForRenewal, true);

    // 22. GET & POST /v1/tools/medical-admissibility
    const medGetRes = await fetch(`${baseUrl}/v1/tools/medical-admissibility?stream=spousal_sponsorship&condition=Kidney+Disease&medCost=40000`);
    assert.equal(medGetRes.status, 200);
    const medGetData = await medGetRes.json();
    assert.equal(medGetData.isStatutorilyExempt, true);
    assert.equal(medGetData.determination, 'STATUTORILY_EXEMPT');
    assert.equal(medGetData.statutoryExemptionBasis, 'IRPA s. 38(2)');

    const medPostRes = await fetch(`${baseUrl}/v1/tools/medical-admissibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        immigrationStream: 'express_entry',
        conditionName: 'Crohn’s Disease',
        estimatedAnnualMedicationCostCad: 30000,
        hasPrivateInsuranceCoverage: true,
        privateInsuranceAnnualCoverageCad: 26000,
        availableLiquidFundsCad: 40000,
        receivedProceduralFairnessLetter: true,
        pflDateReceived: '2026-05-01'
      })
    });
    assert.equal(medPostRes.status, 200);
    const medPostData = await medPostRes.json();
    assert.equal(medPostData.determination, 'PFL_RESPONSE_MITIGATION_REQUIRED');
    assert.equal(medPostData.mitigationFeasibility.canMitigateExcessDemand, true);
    assert.ok(medPostData.individualizedMitigationPlanDraft.includes('Hilewitz v. Canada'));

    // 23. GET & POST /v1/tools/worker-classification
    const workGetRes = await fetch(`${baseUrl}/v1/tools/worker-classification?holidaysWorked=5&setSchedule=true&provideTools=true&noSubcontract=true&noRisk=true&exclusive=true&paidVacation=false&paidOvertime=false&province=ON&hourlyRate=30&weeklyHours=50&weeks=52&contractLabel=independent_contractor`);
    assert.equal(workGetRes.status, 200);
    const workGetData = await workGetRes.json();
    assert.equal(workGetData.classificationVerdict, 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION');
    assert.equal(workGetData.isMisclassifiedEmployee, true);
    assert.equal(workGetData.hoursSummary.overtimeHoursPerWeek, 6);
    assert.equal(workGetData.wageTheftAudit.unpaidOvertimeCad, 4680);

    const workPostRes = await fetch(`${baseUrl}/v1/tools/worker-classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...{"province":"ON","hourlyRateCad":25,"averageWeeklyHoursWorked":50,"weeksWorkedTotal":52,"publicHolidaysWorkedCount":5,"employerSetsScheduleAndLocation":true,"employerProvidesToolsAndLaptop":true,"workerCannotHireSubcontractors":true,"workerHasNoRiskOfFinancialLoss":true,"workerWorksExclusivelyForEmployer":true,"wasVacationPayPaid":false,"wasOvertimePayPaid":false},
        province: 'BC',
        jobTitle: 'Logistics Specialist',
        hourlyRateCad: 25,
        averageWeeklyHoursWorked: 45,
        weeksWorkedTotal: 20,
        contractLabelsWorkerAs: 'independent_contractor',
        employerSetsScheduleAndLocation: true,
        employerProvidesToolsAndLaptop: true,
        workerCannotHireSubcontractors: true,
        workerHasNoRiskOfFinancialLoss: true,
        workerWorksExclusivelyForEmployer: true
      })
    });
    assert.equal(workPostRes.status, 200);
    const workPostData = await workPostRes.json();
    assert.equal(workPostData.province, 'BC');
    assert.equal(workPostData.classificationVerdict, 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION');
    assert.equal(workPostData.hoursSummary.overtimeHoursPerWeek, 5); // 45 - 40
    assert.ok(workPostData.officialDemandLetter.includes('Sagaz Industries'));

    // 24. GET & POST /v1/tools/vehicle-import
    const vehGetRes = await fetch(`${baseUrl}/v1/tools/vehicle-import?origin=US&year=2022&value=30000&status=permanent_resident&owned6Months=true`);
    assert.equal(vehGetRes.status, 200);
    const vehGetData = await vehGetRes.json();
    assert.equal(vehGetData.isStatutorilyAdmissible, true);
    assert.equal(vehGetData.admissibilityVerdict, 'ADMISSIBLE_RIV_REQUIRED');
    assert.equal(vehGetData.costAndTaxAudit.isSettlerTariffExempt, true);
    assert.equal(vehGetData.costAndTaxAudit.customsDutyCad, 0);

    const vehPostRes = await fetch(`${baseUrl}/v1/tools/vehicle-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryOfOrigin: 'OTHER',
        vehicleModelYear: 2021,
        settlerStatus: 'permanent_resident'
      })
    });
    assert.equal(vehPostRes.status, 200);
    const vehPostData = await vehPostRes.json();
    assert.equal(vehPostData.isStatutorilyAdmissible, false);
    assert.equal(vehPostData.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.ok(vehPostData.statutoryDefects.some(d => d.defect.includes('Under 15 Years Old')));

    // 25. GET & POST /v1/tools/student-compliance
    const stuGetRes = await fetch(`${baseUrl}/v1/tools/student-compliance?status=full_time&hours=20&program=university_degree&clb=8`);
    assert.equal(stuGetRes.status, 200);
    const stuGetData = await stuGetRes.json();
    assert.equal(stuGetData.complianceVerdict, 'FULLY_COMPLIANT');
    assert.equal(stuGetData.isWorkAuthorized, true);
    assert.equal(stuGetData.maxPermittedHoursThisWeek, 24);

    const stuPostRes = await fetch(`${baseUrl}/v1/tools/student-compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollmentStatus: 'full_time',
        weeklyHoursWorked: 26,
        isDliDesignated: true,
        hasSocialInsuranceNumber: true,
        studyPermitConditionAllowsWork: true
      })
    });
    assert.equal(stuPostRes.status, 200);
    const stuPostData = await stuPostRes.json();
    assert.equal(stuPostData.complianceVerdict, 'NON_COMPLIANT_UNAUTHORIZED_WORK');
    assert.equal(stuPostData.isWorkAuthorized, false);
    assert.ok(stuPostData.statutoryViolations.some(v => v.rule.includes('Statutory 24-Hour Off-Campus Cap Exceeded')));

    // 26. GET & POST /v1/tools/vulnerable-worker
    const vwoGetRes = await fetch(`${baseUrl}/v1/tools/vulnerable-worker?permit=closed_employer_specific_work_permit&grounds=illegal_recruitment_fees,deportation_threats&fees=5000&wages=1500&province=ON`);
    assert.equal(vwoGetRes.status, 200);
    const vwoGetData = await vwoGetRes.json();
    assert.equal(vwoGetData.isVwowpEligible, true);
    assert.equal(vwoGetData.eligibilityVerdict, 'STATUTORILY_ELIGIBLE_FOR_VWOWP');
    assert.equal(vwoGetData.totalFinancialLossCad, 6500);

    const vwoPostRes = await fetch(`${baseUrl}/v1/tools/vulnerable-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPermitType: 'open_work_permit',
        abuseGrounds: ['wage_theft_kickbacks']
      })
    });
    assert.equal(vwoPostRes.status, 200);
    const vwoPostData = await vwoPostRes.json();
    assert.equal(vwoPostData.isVwowpEligible, false);
    assert.equal(vwoPostData.eligibilityVerdict, 'INELIGIBLE_PERMIT_TYPE');

    // 27. GET & POST /v1/tools/super-visa-sponsor
    const spGetRes = await fetch(`${baseUrl}/v1/tools/super-visa-sponsor?pathway=super_visa&status=permanent_resident&familySize=2&parents=2&y1=65000&insAmount=100000&insDays=365`);
    assert.equal(spGetRes.status, 200);
    const spGetData = await spGetRes.json();
    assert.equal(spGetData.isStatutorilyEligible, true);
    assert.equal(spGetData.eligibilityVerdict, 'STATUTORILY_ELIGIBLE');
    assert.equal(spGetData.totalFamilyUnitSize, 4);

    const spPostRes = await fetch(`${baseUrl}/v1/tools/super-visa-sponsor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathway: 'super_visa',
        sponsorStatus: 'work_permit_holder',
        sponsorFamilySize: 1,
        invitedParentsCount: 1,
        sponsorLine15000IncomeYear1: 80000
      })
    });
    assert.equal(spPostRes.status, 200);
    const spPostData = await spPostRes.json();
    assert.equal(spPostData.isStatutorilyEligible, false);
    assert.equal(spPostData.eligibilityVerdict, 'STATUTORILY_INELIGIBLE');
    assert.ok(spPostData.statutoryViolations.some(v => v.rule.includes('Ineligible Inviter')));

    // 28. GET & POST /v1/tools/pet-import
    const petGetRes = await fetch(`${baseUrl}/v1/tools/pet-import?type=dog&age=24&origin=US&province=ON&breed=golden_retriever&vacDays=180&isPersonal=true`);
    assert.equal(petGetRes.status, 200);
    const petGetData = await petGetRes.json();
    assert.equal(petGetData.isImportAdmissible, true);
    assert.equal(petGetData.admissibilityVerdict, 'STATUTORILY_ADMISSIBLE');
    assert.equal(petGetData.borderFinancials.isSettlerTariffExempt, true);

    const petPostRes = await fetch(`${baseUrl}/v1/tools/pet-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animalType: 'dog',
        animalAgeMonths: 36,
        countryOfOrigin: 'US',
        destinationProvince: 'ON',
        dogBreed: 'pit_bull_terrier'
      })
    });
    assert.equal(petPostRes.status, 200);
    const petPostData = await petPostRes.json();
    assert.equal(petPostData.isImportAdmissible, false);
    assert.equal(petPostData.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.ok(petPostData.statutoryViolations.some(v => v.rule.includes('Pit Bull Ban')));

    // 29. GET & POST /v1/tools/identity-harmonization
    const idGetRes = await fetch(`${baseUrl}/v1/tools/identity-harmonization?discrepancy=single_name_blank_surname&status=permanent_resident&province=ON&months=14&origin=IN`);
    assert.equal(idGetRes.status, 200);
    const idGetData = await idGetRes.json();
    assert.equal(idGetData.isProvincialNameChangeEligible, true);
    assert.equal(idGetData.minResidencyMonthsRequired, 12);
    assert.equal(idGetData.resolutionVerdict, 'STATUTORY_REMEDY_AVAILABLE');

    const idPostRes = await fetch(`${baseUrl}/v1/tools/identity-harmonization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discrepancyType: 'single_name_blank_surname',
        currentStatusInCanada: 'work_permit_holder',
        residenceProvince: 'ON',
        monthsLivedInProvince: 6
      })
    });
    assert.equal(idPostRes.status, 200);
    const idPostData = await idPostRes.json();
    assert.equal(idPostData.isProvincialNameChangeEligible, false);
    assert.equal(idPostData.resolutionVerdict, 'CONDITIONAL_ACTION_REQUIRED');
    assert.ok(idPostData.statutoryViolations.some(v => v.rule.includes('Temporary Residents Ineligible')));

    // 30. GET & POST /v1/tools/currency-exchange
    const fxGetRes = await fetch(`${baseUrl}/v1/tools/currency-exchange?amount=25000&from=USD&to=CAD&broker=questrade`);
    assert.equal(fxGetRes.status, 200);
    const fxGetData = await fxGetRes.json();
    assert.equal(fxGetData.corridor, 'USD to CAD');
    assert.equal(fxGetData.amount, 25000);
    assert.equal(fxGetData.bestOption.providerId, 'norberts_gambit');
    assert.equal(fxGetData.fintracCompliance.isReportableFintrac, true);

    const fxPostRes = await fetch(`${baseUrl}/v1/tools/currency-exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 18000,
        fromCurrency: 'CAD',
        toCurrency: 'CAD',
        isSplitIntoMultipleTranches: true,
        trancheCount: 2
      })
    });
    assert.equal(fxPostRes.status, 200);
    const fxPostData = await fxPostRes.json();
    assert.equal(fxPostData.fintracCompliance.structuringRisk.hasStructuringRisk, true);
    assert.equal(fxPostData.fintracCompliance.structuringRisk.severity, 'CRITICAL_LEGAL_RISK');

    // 31. GET & POST /v1/tools/parental-leave
    const plGetRes = await fetch(`${baseUrl}/v1/tools/parental-leave?province=ON&status=permanent_resident&hours=800&salary=70000&serviceWeeks=20`);
    assert.equal(plGetRes.status, 200);
    const plGetData = await plGetRes.json();
    assert.equal(plGetData.province, 'ON');
    assert.equal(plGetData.resolutionVerdict, 'FULLY_PROTECTED_AND_FUNDED');
    assert.equal(plGetData.isEligibleForCashBenefits, true);
    assert.equal(plGetData.isEligibleForProvincialJobProtection, true);

    const plPostRes = await fetch(`${baseUrl}/v1/tools/parental-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        immigrationStatus: 'permanent_resident',
        insurableHoursWorkedPast52Weeks: 450,
        employerServiceWeeks: 18
      })
    });
    assert.equal(plPostRes.status, 200);
    const plPostData = await plPostRes.json();
    assert.equal(plPostData.resolutionVerdict, 'JOB_PROTECTED_UNFUNDED_LEAVE');
    assert.equal(plPostData.isEligibleForCashBenefits, false);
    assert.equal(plPostData.hoursShortfall, 150);

    // 32. GET & POST /v1/tools/express-entry-crs
    const crsGetRes = await fetch(`${baseUrl}/v1/tools/express-entry-crs?age=29&education=masters&clb=9&cdnExp=1&foreignExp=3&category=stem`);
    assert.equal(crsGetRes.status, 200);
    const crsGetData = await crsGetRes.json();
    assert.equal(crsGetData.totalCrsScore, 539);
    assert.equal(crsGetData.categoryEligibility.stem.isEligible, true);
    assert.equal(crsGetData.categoryEligibility.stem.likelyInvited, true);

    const crsPostRes = await fetch(`${baseUrl}/v1/tools/express-entry-crs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: 32,
        educationLevel: 'bachelors',
        firstLanguageClb: 8,
        frenchNclcLevel: 7
      })
    });
    assert.equal(crsPostRes.status, 200);
    const crsPostData = await crsPostRes.json();
    assert.equal(crsPostData.breakdown.additionalPoints.frenchBilingualism, 50);
    assert.equal(crsPostData.categoryEligibility.french.isEligible, true);

    // 33. GET & POST /v1/tools/business-structure
    const bizGetRes = await fetch(`${baseUrl}/v1/tools/business-structure?province=ON&status=work_permit_holder&permitType=closed_employer_specific&revenue=80000`);
    assert.equal(bizGetRes.status, 200);
    const bizGetData = await bizGetRes.json();
    assert.equal(bizGetData.immigrationCompliance.isLegallyAuthorizedToOperate, false);
    assert.equal(bizGetData.immigrationCompliance.severity, 'STATUTORILY_PROHIBITED');

    const bizPostRes = await fetch(`${baseUrl}/v1/tools/business-structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        immigrationStatus: 'work_permit_holder',
        workPermitType: 'open_work_permit',
        projectedAnnualRevenueCad: 130000,
        clientCount: 3
      })
    });
    assert.equal(bizPostRes.status, 200);
    const bizPostData = await bizPostRes.json();
    assert.equal(bizPostData.immigrationCompliance.isLegallyAuthorizedToOperate, true);
    assert.equal(bizPostData.recommendedStructure, 'INCORPORATION_RECOMMENDED');
    assert.equal(bizPostData.gstHstAudit.isRegistrationMandatory, true);

    // 34. GET & POST /v1/tools/pnp-pathway
    const pnpFields = 'province=BC&noc=21231&wage=45&jobOffer=true&ee=true&crs=460&exp=0&cdnExp=false&worksInBc=false&education=bachelors&bcEdu=false&clb=8&bilingual=false&area=area_1_metro_van&familySize=1&savings=0';
    const pnpEndpoint = baseUrl + '/v1/tools/pnp-pathway';
    const pnpGetRes = await fetch(pnpEndpoint + '?' + pnpFields);
    assert.equal(pnpGetRes.status, 200);
    const pnpGetData = await pnpGetRes.json();
    assert.equal(pnpGetData.province, 'BC');
    assert.equal(pnpGetData.projectedPostNominationCrs, 1060);
    assert.equal(pnpGetData.bcTechEligibility.qualifiesForBcTech, true);
    assert.equal(pnpGetData.settlementFunds.providedFundsCad, 0);

    const pnpPost = body => fetch(pnpEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
    const pnpProfile = Object.fromEntries(new URLSearchParams(pnpFields));
    const pnpPostRes = await pnpPost(pnpProfile);
    assert.equal(pnpPostRes.status, 200);
    assert.deepEqual(await pnpPostRes.json(), pnpGetData);
    const pnpOntarioRes = await pnpPost({...pnpProfile, targetProvince: 'ON', nocCode: '21211'});
    assert.equal(pnpOntarioRes.status, 200);
    const pnpOntario = await pnpOntarioRes.json();
    assert.equal(pnpOntario.province, 'ON');
    assert.equal(pnpOntario.oinpTechEligibility.qualifiesForOinpTech, true);
    assert.doesNotMatch(pnpOntario.oinpTechEligibility.statutoryAdvisory, /high probability/i);

    const emptyPnpGet = await fetch(pnpEndpoint);
    const emptyPnpPost = await pnpPost({});
    assert.equal(emptyPnpGet.status, 400);
    assert.equal(emptyPnpPost.status, 400);
    assert.deepEqual(await emptyPnpGet.json(), await emptyPnpPost.json());
    assert.equal((await pnpPost({...pnpProfile, jobOffer: 'unknown'})).status, 400);
    assert.equal((await pnpPost({...pnpProfile, crs: -1})).status, 400);

    // 35. GET & POST /v1/tools/bowp-diagnostic
    const bowpGetRes = await fetch(`${baseUrl}/v1/tools/bowp-diagnostic?permitType=pgwp&expiryDate=2026-12-31&insideCanada=true&prProgram=express_entry_cec&aor=true&hasSpouse=true&teer=teer_1&payStubs=true`);
    assert.equal(bowpGetRes.status, 200);
    const bowpGetData = await bowpGetRes.json();
    assert.equal(bowpGetData.resolutionVerdict, 'ELIGIBLE_FOR_BOWP');
    assert.equal(bowpGetData.isEligibleForBowp, true);
    assert.equal(bowpGetData.exemptionCode, 'A75');
    assert.equal(bowpGetData.spousalOpenWorkPermit.eligible, true);
    assert.equal(bowpGetData.totalFeeCad, 255);

    const bowpPostRes = await fetch(`${baseUrl}/v1/tools/bowp-diagnostic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPermitType: 'closed_work_permit',
        permitExpiryDate: '2026-12-15',
        isPhysicallyInCanada: true,
        prProgramApplied: 'non_express_entry_pnp',
        hasOfficialAor: true,
        pnpNominationHasEmployerRestrictions: true,
        pnpProvince: 'BC'
      })
    });
    assert.equal(bowpPostRes.status, 200);
    const bowpPostData = await bowpPostRes.json();
    assert.equal(bowpPostData.isEligibleForBowp, false);
    assert.equal(bowpPostData.resolutionVerdict, 'RESTRICTED_PNP_REQUIRES_CODE_T13');
    assert.equal(bowpPostData.alternativePermitRecommendation.exemptionCode, 'T13');

    // 36. GET & POST /v1/tools/lease-assignment
    const assignmentGetRes = await fetch(`${baseUrl}/v1/tools/lease-assignment?province=ON&leaseType=fixed_term&stage=refused_in_principle&penalty=3000`);
    assert.equal(assignmentGetRes.status, 200);
    const assignmentGetData = await assignmentGetRes.json();
    assert.equal(assignmentGetData.province, 'ON');
    assert.equal(assignmentGetData.isEarlyExitPermittedWithoutPenalty, true);
    assert.equal(assignmentGetData.resolutionVerdict, 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9');
    assert.equal(assignmentGetData.isIllegalPenaltyDemanded, true);

    const assignmentPostRes = await fetch(`${baseUrl}/v1/tools/lease-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'AB',
        leaseType: 'fixed_term',
        requestStage: 'landlord_failed_to_reply',
        daysSinceRequest: 16
      })
    });
    assert.equal(assignmentPostRes.status, 200);
    const assignmentPostData = await assignmentPostRes.json();
    assert.equal(assignmentPostData.province, 'AB');
    assert.equal(assignmentPostData.resolutionVerdict, 'ALBERTA_DEEMED_CONSENT_ACQUIRED');

    // 37. GET & POST /v1/tools/debt-collection-defense
    const debtGetRes = await fetch(`${baseUrl}/v1/tools/debt-collection-defense?province=ON&debtType=telecom&defaultDate=2023-01-01&amount=950&threatenedImmigration=true`);
    assert.equal(debtGetRes.status, 200);
    const debtGetData = await debtGetRes.json();
    assert.equal(debtGetData.province, 'ON');
    assert.equal(debtGetData.isStatuteBarred, true);
    assert.equal(debtGetData.resolutionVerdict, 'CRIMINAL_EXTORTION_REPORT_MANDATED');
    assert.ok(debtGetData.statutoryViolations.some(v => v.violationCode === 'IMMIGRATION_COERCION_EXTORTION'));

    const debtPostRes = await fetch(`${baseUrl}/v1/tools/debt-collection-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        debtType: 'utility',
        lastPaymentOrDefaultDate: '2020-01-01',
        allegedDebtAmountCad: 1500
      })
    });
    assert.equal(debtPostRes.status, 200);
    const debtPostData = await debtPostRes.json();
    assert.equal(debtPostData.province, 'BC');
    assert.equal(debtPostData.isStatuteBarred, true);
    assert.equal(debtPostData.isCreditBureauPurgeEligible, true);

    // 38. GET & POST /v1/tools/moving-tax-deduction
    const movingGetRes = await fetch(`${baseUrl}/v1/tools/moving-tax-deduction?province=ON&purpose=employment&distance=500&income=60000&travel=2000&shipping=5000&livingDays=10&livingDaily=150`);
    assert.equal(movingGetRes.status, 200);
    const movingGetData = await movingGetRes.json();
    assert.equal(movingGetData.province, 'ON');
    assert.equal(movingGetData.isEligible, true);
    assert.equal(movingGetData.eligibilityVerdict, 'ELIGIBLE_FOR_T1M_DEDUCTION');
    assert.equal(movingGetData.meetsDistanceRule, true);
    assert.ok(movingGetData.totalTaxBenefitCad > 0);

    const movingPostRes = await fetch(`${baseUrl}/v1/tools/moving-tax-deduction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        relocationPurpose: 'employment',
        distanceKm: 20, // Under 40 km!
        canadianIncomeEarnedInYearCad: 50000,
        travelExpensesCad: 500
      })
    });
    assert.equal(movingPostRes.status, 200);
    const movingPostData = await movingPostRes.json();
    assert.equal(movingPostData.province, 'BC');
    assert.equal(movingPostData.isEligible, false);
    assert.equal(movingPostData.eligibilityVerdict, 'FAILED_40KM_DISTANCE_TEST');

    // 39. GET & POST /v1/tools/credential-licensure
    const licensureGetRes = await fetch(`${baseUrl}/v1/tools/credential-licensure?profession=civil_engineer&province=ON&exp=6&hasEca=true&eca=WES&clb=8`);
    assert.equal(licensureGetRes.status, 200);
    const licensureGetData = await licensureGetRes.json();
    assert.equal(licensureGetData.province, 'ON');
    assert.equal(licensureGetData.isRegulatedProfession, true);
    assert.equal(licensureGetData.canadianExperienceBanApplies, true);
    assert.equal(licensureGetData.hasValidEca, true);
    assert.ok(licensureGetData.alternativeUnlicensedCareers.length > 0);

    const licensurePostRes = await fetch(`${baseUrl}/v1/tools/credential-licensure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession: 'physician',
        province: 'BC',
        hasEca: true,
        ecaOrganization: 'WES', // Invalid for physicians
        officialLanguageClb: 9
      })
    });
    assert.equal(licensurePostRes.status, 200);
    const licensurePostData = await licensurePostRes.json();
    assert.equal(licensurePostData.province, 'BC');
    assert.equal(licensurePostData.mandatoryEcaDesignation, 'MCC');
    assert.equal(licensurePostData.hasValidEca, false);
    assert.ok(licensurePostData.ecaStatusFinding.includes('WARNING'));

    // 40. GET & POST /v1/tools/telecom-contract-defense
    const telecomGetRes = await fetch(`${baseUrl}/v1/tools/telecom-contract-defense?provider=Bell&days=8&deviceCondition=good&refusedTrial=true`);
    assert.equal(telecomGetRes.status, 200);
    const telecomGetData = await telecomGetRes.json();
    assert.equal(telecomGetData.providerName, 'Bell');
    assert.equal(telecomGetData.isWithinTrialPeriod, true);
    assert.equal(telecomGetData.trialCancellationStatus, 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY');
    assert.equal(telecomGetData.hasStatutoryViolations, true);

    const telecomPostRes = await fetch(`${baseUrl}/v1/tools/telecom-contract-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerName: 'Rogers',
        dataOverageChargedCad: 120.00,
        roamingChargedCad: 180.00
      })
    });
    assert.equal(telecomPostRes.status, 200);
    const telecomPostData = await telecomPostRes.json();
    assert.equal(telecomPostData.providerName, 'Rogers');
    assert.equal(telecomPostData.hasStatutoryViolations, true);
    assert.ok(telecomPostData.statutoryViolations.some(v => v.violationCode === 'DATA_OVERAGE_CAP_BREACH'));
    assert.ok(telecomPostData.statutoryViolations.some(v => v.violationCode === 'ROAMING_CAP_BREACH'));

    // 41. GET & POST /v1/tools/border-flagpoling
    const flagpoleGetRes = await fetch(`${baseUrl}/v1/tools/border-flagpoling?permit=pgwp&citizenship=IN&status=maintained_status`);
    assert.equal(flagpoleGetRes.status, 200);
    const flagpoleGetData = await flagpoleGetRes.json();
    assert.equal(flagpoleGetData.permitCategory, 'pgwp');
    assert.equal(flagpoleGetData.determination, 'STRICTLY_BARRED');
    assert.equal(flagpoleGetData.pgwpBorderBanApplied, true);
    assert.equal(flagpoleGetData.maintainedStatusAtRisk, true);

    const flagpolePostRes = await fetch(`${baseUrl}/v1/tools/border-flagpoling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitCategory: 'lmia_exempt_work_permit',
        countryOfCitizenship: 'US',
        currentStatusInCanada: 'valid_visitor_record',
        portOfEntry: 'rainbow_bridge',
        dayOfWeek: 'Wednesday',
        isLmiaExempt: true,
        hasValidUsVisa: true
      })
    });
    assert.equal(flagpolePostRes.status, 200);
    const flagpolePostData = await flagpolePostRes.json();
    assert.equal(flagpolePostData.determination, 'ELIGIBLE_FOR_POE_PROCESSING');
    assert.equal(flagpolePostData.countryOfCitizenship, 'US');
    assert.equal(flagpolePostData.isOperatingDay, true);
    assert.ok(flagpolePostData.requiredDocuments.length > 0);

    // 42. GET & POST /v1/tools/rent-increase-defense
    const rentGetRes = await fetch(`${baseUrl}/v1/tools/rent-increase-defense?province=ON&currentRent=2000&proposedRent=2300&firstOccupied=2021-01-01&form=N2`);
    assert.equal(rentGetRes.status, 200);
    const rentGetData = await rentGetRes.json();
    assert.equal(rentGetData.province, 'ON');
    assert.equal(rentGetData.rentControlStatus.isRentControlled, false);
    assert.equal(rentGetData.validityVerdict, 'UNRESTRICTED_MARKET_INCREASE');

    const rentPostRes = await fetch(`${baseUrl}/v1/tools/rent-increase-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        firstOccupiedDate: '2016-01-01',
        currentMonthlyRentCad: 2000,
        proposedMonthlyRentCad: 2200,
        noticeServedDate: '2026-05-01',
        effectiveDate: '2026-08-01',
        lastIncreaseDate: '2025-05-01',
        officialFormUsed: 'N1',
        isAgiClaimed: false
      })
    });
    assert.equal(rentPostRes.status, 200);
    const rentPostData = await rentPostRes.json();
    assert.equal(rentPostData.validityVerdict, 'ILLEGAL_AMOUNT');
    assert.equal(rentPostData.rentCalculations.maxLawfulGuidelineRentCad, 2050);
    assert.equal(rentPostData.overpaymentAnalysis.monthlyIllegalPortionCad, 150);
    assert.ok(rentPostData.statutoryDefects.some(d => d.defectCode === 'EXCEEDS_STATUTORY_GUIDELINE'));

    // 43. GET & POST /v1/tools/human-rights-defense
    const hrGetRes = await fetch(`${baseUrl}/v1/tools/human-rights-defense?jurisdiction=ON&conduct=canadian_experience_requirement&days=45`);
    assert.equal(hrGetRes.status, 200);
    const hrGetData = await hrGetRes.json();
    assert.equal(hrGetData.jurisdiction, 'ON');
    assert.equal(hrGetData.humanRightsViolationVerdict, 'PROBABLE_PRIMA_FACIE_DISCRIMINATION');
    assert.equal(hrGetData.statuteOfLimitationsStatus.isWithin1YearLimitation, true);

    const hrPostRes = await fetch(`${baseUrl}/v1/tools/human-rights-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jurisdiction: 'ON',
        conductTypes: ['indefinite_unpaid_suspension', 'toxic_workplace_environment'],
        annualSalaryCad: 96000,
        yearsOfService: 3
      })
    });
    assert.equal(hrPostRes.status, 200);
    const hrPostData = await hrPostRes.json();
    assert.equal(hrPostData.constructiveDismissalVerdict, 'ESTABLISHED_CONSTRUCTIVE_DISMISSAL');
    assert.equal(hrPostData.constructiveDismissalAudit.isConstructiveDismissal, true);
    assert.ok(hrPostData.damagesAssessment.estimatedCommonLawNoticeValueCad > 20000);

    // 44. GET & POST /v1/tools/homebuyer-tax-incentives
    const hbtGetRes = await fetch(`${baseUrl}/v1/tools/homebuyer-tax-incentives?province=ON&city=Toronto&price=800000&fthb=true&spouse=true`);
    assert.equal(hbtGetRes.status, 200);
    const hbtGetData = await hbtGetRes.json();
    assert.equal(hbtGetData.isFirstTimeHomeBuyer, true);
    assert.equal(hbtGetData.hbpEvaluation.maxPerPersonLimitCad, 60000);
    assert.equal(hbtGetData.taxCreditsAndRebates.hbtcTaxSavingsCad, 1500);
    assert.equal(hbtGetData.taxCreditsAndRebates.lttRebateCad, 8475);

    const hbtPostRes = await fetch(`${baseUrl}/v1/tools/homebuyer-tax-incentives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        city: 'Vancouver',
        homePurchasePriceCad: 750000,
        isFirstTimeHomeBuyer: true,
        applicant1: {
          annualIncomeCad: 95000,
          rrspBalanceCad: 60000,
          fhsaBalanceCad: 16000
        }
      })
    });
    assert.equal(hbtPostRes.status, 200);
    const hbtPostData = await hbtPostRes.json();
    assert.equal(hbtPostData.province, 'BC');
    assert.equal(hbtPostData.downPaymentUnlocked.totalTaxFreeDownPaymentCad, 76000); // 16k + 60k
    assert.ok(hbtPostData.taxCreditsAndRebates.lttRebateCad > 10000);

    // 45. Auto Insurance Discrimination, Foreign Driving History Credit & SABS Accident Benefits
    const autoGetRes = await fetch(`${baseUrl}/v1/tools/auto-insurance?province=ON&postalCode=L6Y2T3&income=80000&foreignYears=5&experienceLetter=true`);
    assert.equal(autoGetRes.status, 200);
    const autoGetData = await autoGetRes.json();
    assert.equal(autoGetData.province, 'ON');
    assert.equal(autoGetData.ratingTerritoryAnalysis.territoryTier, 'HIGH_RISK_PREMIUM_ZONE');
    assert.ok(autoGetData.ratingTerritoryAnalysis.estimatedAnnualSavingsCad >= 2000);
    assert.equal(autoGetData.sabsAccidentBenefits.weeklyIncomeReplacementCad, 400); // Standard $400/wk cap

    const autoPostRes = await fetch(`${baseUrl}/v1/tools/auto-insurance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        postalCode: 'L5B1H8',
        annualGrossIncomeCad: 90000,
        employmentStatus: 'employed',
        foreignDrivingYears: 6,
        hasForeignExperienceLetter: true,
        optionalIrbEndorsementWeeklyCad: 800,
        experiencedRefusalOrUnreasonableDelay: true
      })
    });
    assert.equal(autoPostRes.status, 200);
    const autoPostData = await autoPostRes.json();
    assert.equal(autoPostData.sabsAccidentBenefits.weeklyIncomeReplacementCad, 800);
    assert.equal(autoPostData.takeAllComersAudit.isViolationSuspected, true);
    assert.ok(autoPostData.takeAllComersAudit.stepsToEnforce.length >= 3);

    // 46. Canadian Wills, Estates & Power of Attorney for Newcomers
    const epGetRes = await fetch(`${baseUrl}/v1/tools/estate-planning?province=ON&maritalStatus=married&realEstate=800000&ownership=joint_tenancy&registered=120000&beneficiaries=true&liquid=60000&canadianWill=true`);
    assert.equal(epGetRes.status, 200);
    const epGetData = await epGetRes.json();
    assert.equal(epGetData.province, 'ON');
    assert.equal(epGetData.probateTaxAnalysis.bypassedEstateValueCad, 920000); // 800k + 120k
    assert.equal(epGetData.probateTaxAnalysis.probateSubjectEstateValueCad, 60000); // 60k liquid
    assert.equal(epGetData.probateTaxAnalysis.estimatedProbateTaxCad, 150); // (60k - 50k) * 0.015 = $150

    const epPostRes = await fetch(`${baseUrl}/v1/tools/estate-planning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        maritalStatus: 'common_law',
        hasChildren: true,
        childrenCount: 2,
        hasForeignRealEstateOrAssets: true,
        foreignAssetsValueCad: 400000,
        foreignCountry: 'India',
        hasExistingForeignWill: true,
        hasCanadianWill: false,
        namedExecutorLocation: 'abroad'
      })
    });
    assert.equal(epPostRes.status, 200);
    const epPostData = await epPostRes.json();
    assert.equal(epPostData.intestacyRiskAudit.commonLawSpouseDisinheritanceRisk, true);
    assert.equal(epPostData.foreignAssetsStrategy.recommendedWillStructure, 'MULTIPLE_CONCURRENT_WILLS');
    assert.equal(epPostData.powerOfAttorneyAudit.nonResidentExecutorRisk.isHighRisk, true);
    assert.ok(epPostData.actionPlan.length >= 4);

    // 47. Small Claims Court Dispute & Statutory Demand Engine
    const scGetRes = await fetch(`${baseUrl}/v1/tools/small-claims?province=ON&amount=10000&incidentDate=2025-10-31&pjiRate=4.0&assessmentDate=2026-10-31`);
    assert.equal(scGetRes.status, 200);
    const scGetData = await scGetRes.json();
    assert.equal(scGetData.province, 'ON');
    assert.equal(scGetData.jurisdictionAudit.isWithinSmallClaimsLimit, true);
    assert.equal(scGetData.interestAndCostsCalculation.accruedPrejudgmentInterestCad, 400);

    const scPostRes = await fetch(`${baseUrl}/v1/tools/small-claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        claimAmountCad: 4500,
        disputeType: 'consumer_service',
        dateCauseOfActionArose: '2026-01-15',
        defendantType: 'business',
        defendantName: 'Pacific Tech Repairs',
        plaintiffName: 'Sam Taylor',
        hasSentDemandLetter: false
      })
    });
    assert.equal(scPostRes.status, 200);
    const scPostData = await scPostRes.json();
    assert.ok(scPostData.jurisdictionAudit.courtName.includes('Civil Resolution Tribunal'));
    assert.equal(scPostData.formalDemandLetter.isRecommended, true);
    assert.ok(scPostData.formalDemandLetter.letterBodyText.includes('Pacific Tech Repairs'));

    // 48. CRA Voluntary Disclosures Program (VDP) & Foreign Income/T1135 Penalty Relief Navigator
    const vdpGetRes = await fetch(`${baseUrl}/v1/tools/cra-voluntary-disclosure?landingYear=2023&years=2023,2024&foreignCost=200000&foreignIncome=8000&craContacted=false`);
    assert.equal(vdpGetRes.status, 200);
    const vdpGetData = await vdpGetRes.json();
    assert.equal(vdpGetData.eligibility.isEligible, true);
    assert.equal(vdpGetData.eligibility.programTrack, 'General Program');
    assert.equal(vdpGetData.t1135Audit.totalT1135PenaltyExposureCad, 2500);

    const vdpPostRes = await fetch(`${baseUrl}/v1/tools/cra-voluntary-disclosure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landingYear: 2022,
        taxYearsOmitted: [2023, 2024],
        maxForeignCostAmountCad: 350000,
        foreignIncomeAnnualCad: 15000,
        hasCraContactedOrAudited: true
      })
    });
    assert.equal(vdpPostRes.status, 200);
    const vdpPostData = await vdpPostRes.json();
    assert.equal(vdpPostData.eligibility.isEligible, false);
    assert.ok(vdpPostData.eligibility.summary.includes('Ineligible'));

    // 49. Statutory Pay Stub, Vacation Pay, Public Holiday Pay & Wage Theft Defense Engine
    const payGetRes = await fetch(`${baseUrl}/v1/tools/statutory-pay?province=ON&hourlyWage=20&hours=80&tenure=2&weeks=2&holidays=1`);
    assert.equal(payGetRes.status, 200);
    const payGetData = await payGetRes.json();
    assert.equal(payGetData.province, 'ON');
    assert.equal(payGetData.hoursAudit.regularWagesCad, 1600);
    assert.equal(payGetData.vacationPayAudit.statutoryVacationRatePercent, 4);

    const payPostRes = await fetch(`${baseUrl}/v1/tools/statutory-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        grossHourlyWageCad: 22.0,
        hoursWorkedInPayPeriod: 80,
        tenureYears: 5.5,
        statutoryHolidaysInPeriod: 1,
        unauthorizedDeductionsCad: 150,
        deductionReason: 'cash_shortage'
      })
    });
    assert.equal(payPostRes.status, 200);
    const payPostData = await payPostRes.json();
    assert.equal(payPostData.vacationPayAudit.statutoryVacationRatePercent, 6);
    assert.equal(payPostData.deductionsAudit.isDeductionUnlawful, true);
    assert.equal(payPostData.deductionsAudit.recoverableDeductionCad, 150);
    assert.ok(payPostData.wageClaimSummary.hasViableWageClaim);

    // 50. Consumer Protection Rights, Cooling-Off Periods & Unsolicited Sales Defense Engine
    const cpaGetRes = await fetch(`${baseUrl}/v1/tools/consumer-protection?province=ON&type=water_heater_rental&contractDate=2026-10-25&value=4500&unsolicited=true&bannedProduct=true`);
    assert.equal(cpaGetRes.status, 200);
    const cpaGetData = await cpaGetRes.json();
    assert.equal(cpaGetData.province, 'ON');
    assert.equal(cpaGetData.doorToDoorBanAudit.isContractVoidAbInitio, true);
    assert.equal(cpaGetData.cancellationRights.canCancelWithoutPenalty, true);

    const cpaPostRes = await fetch(`${baseUrl}/v1/tools/consumer-protection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        contractType: 'gym_membership',
        contractDate: '2026-10-27',
        contractValueCad: 600,
        wasUnsolicitedInHomeVisit: false,
        prescribedBannedProduct: false,
        assessmentDate: '2026-10-31'
      })
    });
    assert.equal(cpaPostRes.status, 200);
    const cpaPostData = await cpaPostRes.json();
    assert.equal(cpaPostData.timingAudit.isWithinStandard10DayCoolingOff, true);
    assert.equal(cpaPostData.cancellationRights.canCancelWithoutPenalty, true);

    // 51. Newcomer Child and Spousal Support Guidelines & Family Law Asset Equalization Engine
    const famGetRes = await fetch(`${baseUrl}/v1/tools/family-law?province=ON&status=married&years=8&children=2&payerIncome=95000&recipientIncome=45000`);
    assert.equal(famGetRes.status, 200);
    const famGetData = await famGetRes.json();
    assert.equal(famGetData.province, 'ON');
    assert.ok(famGetData.childSupport.monthlyTableAmountCad > 0);
    assert.ok(famGetData.spousalSupport.monthlySupportRangeCad.high > famGetData.spousalSupport.monthlySupportRangeCad.low);

    const famPostRes = await fetch(`${baseUrl}/v1/tools/family-law`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        maritalStatus: 'common_law',
        cohabitationYears: 6,
        payerValuationDateAssetsCad: 450000,
        recipientValuationDateAssetsCad: 50000,
        hasForeignWorldwideAssets: true,
        hasActiveSponsorshipUndertaking: true
      })
    });
    assert.equal(famPostRes.status, 200);
    const famPostData = await famPostRes.json();
    assert.equal(famPostData.propertyEqualization.equalizationPaymentCad, 0);
    assert.equal(famPostData.newcomerSpecificAudits.hasActiveSponsorshipUndertaking, true);

    // 52. Ontario Works (OW) & ODSP Social Assistance Asset Limits & Sponsorship Engine
    const saGetRes = await fetch(`${baseUrl}/v1/tools/social-assistance?program=ontario_works&status=permanent_resident&family=single&assets=4500`);
    assert.equal(saGetRes.status, 200);
    const saGetData = await saGetRes.json();
    assert.equal(saGetData.eligibility.isOverallEligible, true);
    assert.equal(saGetData.assetAudit.statutoryAssetLimitCad, 10000);
    assert.equal(saGetData.benefitCalculation.baseMaximumMonthlyBenefitCad, 733);

    const saPostRes = await fetch(`${baseUrl}/v1/tools/social-assistance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        program: 'odsp',
        immigrationStatus: 'permanent_resident',
        familyComposition: 'single',
        liquidAssetsCad: 12000,
        grossMonthlyEmploymentIncomeCad: 1400,
        isSponsoredImmigrant: true,
        sponsorshipYearsRemaining: 2
      })
    });
    assert.equal(saPostRes.status, 200);
    const saPostData = await saPostRes.json();
    assert.equal(saPostData.eligibility.isOverallEligible, true);
    assert.equal(saPostData.benefitCalculation.netMonthlyDeductionCad, 300);
    assert.equal(saPostData.sponsorshipUndertakingImpact.isDefaultTriggered, true);

    // 53. Residential Tenancy Repairs, Vital Services & Rent Withholding Defense Engine
    const repGetRes = await fetch(`${baseUrl}/v1/tools/tenancy-repairs?province=ON&rent=2400&issues=no_heat_winter&days=10&expenses=100`);
    assert.equal(repGetRes.status, 200);
    const repGetData = await repGetRes.json();
    assert.equal(repGetData.province, 'ON');
    assert.equal(repGetData.hasVitalServiceBreach, true);
    assert.ok(repGetData.abatementEstimate.estimatedMinAbatementCad > 0);

    const repPostRes = await fetch(`${baseUrl}/v1/tools/tenancy-repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        monthlyRentCad: 2200,
        issues: ['water_leak_mold'],
        daysUnresolved: 20,
        hasWithheldRent: true,
        withheldAmountCad: 2200
      })
    });
    assert.equal(repPostRes.status, 200);
    const repPostData = await repPostRes.json();
    assert.equal(repPostData.hasWithheldRent, true);
    assert.equal(repPostData.rentWithholdingRisk, 'severe');
    assert.ok(repPostData.legalWarnings.some(w => w.code === 'ILLEGAL_RENT_WITHHOLDING'));

    // 54. Commercial Lease Review & Newcomer Small Business Tenancy Defense Engine
    const comGetRes = await fetch(`${baseUrl}/v1/tools/commercial-lease?province=ON&baseRent=3500&tmi=1500&sqft=1200&overdue=true&daysOverdue=18&guarantee=true`);
    assert.equal(comGetRes.status, 200);
    const comGetData = await comGetRes.json();
    assert.equal(comGetData.province, 'ON');
    assert.equal(comGetData.lockoutRiskLevel, 'imminent');
    assert.equal(comGetData.financialOverview.grossMonthlyRentCad, 5000);

    const comPostRes = await fetch(`${baseUrl}/v1/tools/commercial-lease`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        baseRentMonthlyCad: 4000,
        additionalRentMonthlyCad: 1000,
        squareFootage: 1000,
        isRentOverdue: false,
        landlordRefusedAssignment: true,
        disputedTmiChargesCad: 2500
      })
    });
    assert.equal(comPostRes.status, 200);
    const comPostData = await comPostRes.json();
    assert.equal(comPostData.lockoutRiskLevel, 'none');
    assert.equal(comPostData.assignmentRights.landlordRefused, true);
    assert.ok(comPostData.statutoryRisks.some(r => r.code === 'NO_COMMERCIAL_RENT_CONTROL'));

    // 55. Employment Reference Letter & Foreign Experience Verification Audit Engine
    // Compliant baseline: all 7 mandatory elements present plus corroborating
    // tax/pay documents (the engine requires corroboration score >= 60).
    const refGetRes = await fetch(`${baseUrl}/v1/tools/employment-reference?program=express_entry_fsw&noc=21231&hours=40&letterhead=true&exactDates=true&hasTitle=true&hasSalary=true&hasDuties=true&signed=true&payStubs=true&taxDocs=true`);
    assert.equal(refGetRes.status, 200);
    const refGetData = await refGetRes.json();
    assert.equal(refGetData.complianceVerdict, 'COMPLIANT_READY_FOR_SUBMISSION');
    assert.equal(refGetData.mandatoryElementsAudit.satisfiedCount, 7);

    const refPostRes = await fetch(`${baseUrl}/v1/tools/employment-reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        program: 'express_entry_fsw',
        nocCode: '21231',
        dutiesCopiedFromNocWordForWord: true,
        paymentMethod: 'cash_in_hand'
      })
    });
    assert.equal(refPostRes.status, 200);
    const refPostData = await refPostRes.json();
    assert.equal(refPostData.complianceVerdict, 'FATAL_DEFECT_HIGH_REFUSAL_OR_PFL_RISK');
    assert.ok(refPostData.auditDeficiencies.some(d => d.code === 'VERBATIM_NOC_COPY_PASTE'));
    assert.ok(refPostData.auditDeficiencies.some(d => d.code === 'CASH_WAGE_PAYMENT'));

    // 56. Newcomer Consumer Credit Agreement, High-Cost Credit & Payday Loan Defense Engine
    const hccGetRes = await fetch(`${baseUrl}/v1/tools/high-cost-credit?province=ON&type=payday_loan&principal=1000&days=14&fees=180&income=2400`);
    assert.equal(hccGetRes.status, 200);
    const hccGetData = await hccGetRes.json();
    assert.equal(hccGetData.province, 'ON');
    assert.equal(hccGetData.statutoryMaxFeesCad, 140);
    assert.equal(hccGetData.illegalOverchargeCad, 40);

    const hccPostRes = await fetch(`${baseUrl}/v1/tools/high-cost-credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        loanType: 'high_cost_installment',
        principalBorrowedCad: 4000,
        statedAprPercent: 42.0,
        totalFeesChargedCad: 500
      })
    });
    assert.equal(hccPostRes.status, 200);
    const hccPostData = await hccPostRes.json();
    assert.equal(hccPostData.defenseVerdict, 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE');
    assert.ok(hccPostData.statutoryViolations.some(v => v.code === 'CRIMINAL_INTEREST_RATE_EXCEEDED'));

    // 57. International Student Post-Graduation Work Permit (PGWP) Field of Study & Language Engine
    const pgwpGetRes = await fetch(`${baseUrl}/v1/tools/pgwp-eligibility?credential=bachelor_degree&length=48&clb=8&testType=ielts_general`);
    assert.equal(pgwpGetRes.status, 200);
    const pgwpGetData = await pgwpGetRes.json();
    assert.equal(pgwpGetData.eligibleForPgwp, true);
    assert.equal(pgwpGetData.estimatedPgwpDurationMonths, 36);
    assert.equal(pgwpGetData.fieldOfStudyAudit.fieldOfStudyMet, true);

    const pgwpPostRes = await fetch(`${baseUrl}/v1/tools/pgwp-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentialLevel: 'college_diploma',
        programLengthMonths: 24,
        studyPermitApplicationDate: '2024-11-15',
        fieldOfStudyCategory: 'business_administration',
        clbLevel: 6
      })
    });
    assert.equal(pgwpPostRes.status, 200);
    const pgwpPostData = await pgwpPostRes.json();
    assert.equal(pgwpPostData.eligibleForPgwp, false);
    assert.equal(pgwpPostData.fieldOfStudyAudit.fieldOfStudyMet, false);

    // 58. Cross-Border Asset Transfer & FBAR / T1135 Multi-Jurisdiction Foreign Tax Filing Engine
    const cbGetRes = await fetch(`${baseUrl}/v1/tools/cross-border-tax?isResident=true&firstYear=true&foreignCost=200000`);
    assert.equal(cbGetRes.status, 200);
    const cbGetData = await cbGetRes.json();
    assert.equal(cbGetData.craAudit.t1135Required, false);
    assert.equal(cbGetData.craAudit.firstYearExemptionApplied, true);

    const cbPostRes = await fetch(`${baseUrl}/v1/tools/cross-border-tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCanadianTaxResident: true,
        isFirstYearCanadianResident: false,
        foreignPropertyCostAmountCad: 300000,
        isUsPerson: true,
        peakForeignAccountsUsd: 25000,
        hasCanadianTfsa: true,
        holdsCanadianMutualFundsOrEtfs: true
      })
    });
    assert.equal(cbPostRes.status, 200);
    const cbPostData = await cbPostRes.json();
    assert.equal(cbPostData.craAudit.t1135Required, true);
    assert.equal(cbPostData.craAudit.t1135Tier, 'detailed_part_b');
    assert.equal(cbPostData.irsAudit.fbarFinCen114Required, true);
    assert.equal(cbPostData.irsAudit.pficExposureWarning, true);

    // 59. Workplace Safety, Right to Refuse Unsafe Work & WSIB Compensation Engine
    const wsGetRes = await fetch(`${baseUrl}/v1/tools/workplace-safety?province=ON&unsafe=true&stage=stage_1_internal`);
    assert.equal(wsGetRes.status, 200);
    const wsGetData = await wsGetRes.json();
    assert.equal(wsGetData.safetyRefusalAudit.refusalLegitimate, true);
    assert.equal(wsGetData.safetyRefusalAudit.refusalStage, 'stage_1_internal');

    const wsPostRes = await fetch(`${baseUrl}/v1/tools/workplace-safety`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        isWorkplaceInjury: true,
        injuryDate: '2026-08-01',
        netAverageMonthlyEarningsCad: 4000,
        employerDisciplinedOrThreatened: true
      })
    });
    assert.equal(wsPostRes.status, 200);
    const wsPostData = await wsPostRes.json();
    assert.equal(wsPostData.reprisalAudit.reprisalViolationDetected, true);
    assert.equal(wsPostData.compensationAudit.estimatedMonthlyLoeCad, 3400);

    // 60. Temporary Foreign Worker (TFW) Closed Work Permit Employer Compliance Engine
    const tfwGetRes = await fetch(`${baseUrl}/v1/tools/tfw-compliance?stream=low_wage&lmiaWage=25&actualWage=20&weeks=10&contractedHours=40&actualHours=35`);
    assert.equal(tfwGetRes.status, 200);
    const tfwGetData = await tfwGetRes.json();
    assert.equal(tfwGetData.complianceStatus, 'Significant Violations Detected');
    assert.equal(tfwGetData.wageAudit.totalWageShortfallCad, 3000);

    const tfwPostRes = await fetch(`${baseUrl}/v1/tools/tfw-compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: 'agriculture_sawp',
        prohibitedDeductionsChargedCad: 1000,
        recruiterFeeChargedCad: 3500,
        employerRetainedPassportOrPermit: true
      })
    });
    assert.equal(tfwPostRes.status, 200);
    const tfwPostData = await tfwPostRes.json();
    assert.equal(tfwPostData.unlawfulDeductionsAudit.totalIllegalDeductionsCad, 4500);
    assert.equal(tfwPostData.vwowpAssessment.eligibleForVwowp, true);

    // 61. Provincial Healthcare Waiting Periods, Interprovincial Portability & IFHP Engine
    const hcGetRes = await fetch(`${baseUrl}/v1/tools/healthcare-portability?targetProvince=ON&status=permanent_resident`);
    assert.equal(hcGetRes.status, 200);
    const hcGetData = await hcGetRes.json();
    assert.equal(hcGetData.targetProvince, 'ON');
    assert.equal(hcGetData.waitingPeriodDays, 0);
    assert.equal(hcGetData.eligibleForProvincialHealthcare, true);

    const hcPostRes = await fetch(`${baseUrl}/v1/tools/healthcare-portability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetProvince: 'BC',
        originType: 'outside_canada',
        immigrationStatus: 'permanent_resident',
        arrivalDate: '2026-09-15'
      })
    });
    assert.equal(hcPostRes.status, 200);
    const hcPostData = await hcPostRes.json();
    assert.equal(hcPostData.targetProvince, 'BC');
    assert.equal(hcPostData.needsPrivateBridgingInsurance, true);
    assert.equal(hcPostData.coverageStartDate, '2026-12-01');

    // 62. Canadian Residential Real Estate Assignment Sales & Anti-Flipping Engine
    const reaGetRes = await fetch(`${baseUrl}/v1/tools/real-estate-assignment?province=ON&originalPrice=500000&assignmentPrice=620000&deposit=100000`);
    assert.equal(reaGetRes.status, 200);
    const reaGetData = await reaGetRes.json();
    assert.equal(reaGetData.province, 'ON');
    assert.equal(reaGetData.financialSummary.grossAssignmentLiftCad, 120000);

    const reaPostRes = await fetch(`${baseUrl}/v1/tools/real-estate-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        originalPurchasePriceCad: 600000,
        assignmentSalePriceCad: 720000,
        agreementDate: '2025-11-01',
        assignmentDate: '2026-05-01',
        builderConsentFeeCad: 5000,
        legalFeesCad: 2500,
        realtorCommissionCad: 12500,
        marginalTaxRatePercent: 40.0
      })
    });
    assert.equal(reaPostRes.status, 200);
    const reaPostData = await reaPostRes.json();
    assert.equal(reaPostData.antiFlippingAudit.antiFlippingApplies, true);
    assert.equal(reaPostData.taxLiabilityEstimate.estimatedIncomeTaxCad, 40000);

    // 63. Senior Newcomer Old Age Security (OAS) & GIS Engine
    const oasGetRes = await fetch(`${baseUrl}/v1/tools/oas-gis?age=67&yearsCanada=12&income=15000`);
    assert.equal(oasGetRes.status, 200);
    const oasGetData = await oasGetRes.json();
    assert.equal(oasGetData.oasAudit.eligibleForOas, true);
    assert.equal(oasGetData.oasAudit.fractionOfFullPension, '12/40');

    const oasPostRes = await fetch(`${baseUrl}/v1/tools/oas-gis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ageYears: 68,
        yearsResidedInCanadaAfter18: 10,
        isUnderFamilyClassSponsorship: true,
        sponsorshipYearsRemaining: 15
      })
    });
    assert.equal(oasPostRes.status, 200);
    const oasPostData = await oasPostRes.json();
    assert.equal(oasPostData.gisAudit.gisBarredBySponsorship, true);
    assert.equal(oasPostData.gisAudit.eligibleForGis, false);

    // 64. Criminal Inadmissibility & Rehabilitation Engine
    const crGetRes = await fetch(`${baseUrl}/v1/tools/criminal-rehab?offense=theft_under_5000&completionDate=2014-01-01&count=1`);
    assert.equal(crGetRes.status, 200);
    const crGetData = await crGetRes.json();
    assert.equal(crGetData.rehabPathways.isDeemedRehabilitated, true);

    const crPostRes = await fetch(`${baseUrl}/v1/tools/criminal-rehab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offenseType: 'impaired_driving_dui',
        sentenceCompletionDate: '2012-01-01'
      })
    });
    assert.equal(crPostRes.status, 200);
    const crPostData = await crPostRes.json();
    assert.equal(crPostData.rehabPathways.isDeemedRehabilitated, false);
    assert.equal(crPostData.rehabPathways.governmentRehabFeeCad, 1000);

    // 65. Canadian Franchise Disclosure & Arthur Wishart Act Engine
    const fdGetRes = await fetch(`${baseUrl}/v1/tools/franchise-disclosure?province=ON&signDate=2025-10-01&auditedFin=true&signedCert=true`);
    assert.equal(fdGetRes.status, 200);
    const fdGetData = await fdGetRes.json();
    assert.equal(fdGetData.province, 'ON');
    assert.equal(fdGetData.governingAct.includes('Arthur Wishart Act'), true);

    const fdPostRes = await fetch(`${baseUrl}/v1/tools/franchise-disclosure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        agreementSignedDate: '2025-11-01',
        hasAuditedFinancialStatements: false,
        hasSignedFranchisorCertificate: false,
        initialFranchiseFeePaidCad: 50000,
        equipmentAndBuildoutCostCad: 200000,
        inventoryPurchasedAtCostCad: 30000,
        cumulativeOperatingLossesCad: 70000
      })
    });
    assert.equal(fdPostRes.status, 200);
    const fdPostData = await fdPostRes.json();
    assert.equal(fdPostData.rescissionAnalysis.canRescindNow, true);
    assert.equal(fdPostData.statutoryDamagesEstimate.totalRestitutionOwedCad, 350000);

    // 66. Spousal Open Work Permit (SOWP) Eligibility Engine
    const sowpGetRes = await fetch(`${baseUrl}/v1/tools/sowp-eligibility?sponsorType=international_student&programLevel=masters&relationship=married`);
    assert.equal(sowpGetRes.status, 200);
    const sowpGetData = await sowpGetRes.json();
    assert.equal(sowpGetData.overallEligible, true);
    assert.equal(sowpGetData.lmiaExemptionCode, 'C42');

    const sowpPostRes = await fetch(`${baseUrl}/v1/tools/sowp-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sponsorType: 'international_student',
        studentProgramLevel: 'college_diploma',
        relationshipType: 'married'
      })
    });
    assert.equal(sowpPostRes.status, 200);
    const sowpPostData = await sowpPostRes.json();
    assert.equal(sowpPostData.overallEligible, false);
    assert.equal(sowpPostData.pathwayAudit.isPathwayEligible, false);

    // 67. Employment Insurance (EI) Disqualification & Allocation Engine
    const eiGetRes = await fetch(`${baseUrl}/v1/tools/ei-disqualification?type=voluntary_quit&justCause=harassment&triedAlternatives=true`);
    assert.equal(eiGetRes.status, 200);
    const eiGetData = await eiGetRes.json();
    assert.equal(eiGetData.regularBenefits.isDisqualifiedFromRegularBenefits, false);
    assert.equal(eiGetData.justCauseAudit.justCauseEstablished, true);

    const eiPostRes = await fetch(`${baseUrl}/v1/tools/ei-disqualification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        separationType: 'voluntary_quit',
        justCauseReason: null,
        triedReasonableAlternatives: false
      })
    });
    assert.equal(eiPostRes.status, 200);
    const eiPostData = await eiPostRes.json();
    assert.equal(eiPostData.regularBenefits.isDisqualifiedFromRegularBenefits, true);
    assert.ok(eiPostData.riskWarnings.some(w => w.includes('INDEFINITE DISQUALIFICATION')));

    // 68. Rural Renewal & Rural Entrepreneur Diagnostic Engine
    const ruralGetRes = await fetch(`${baseUrl}/v1/tools/rural-renewal?stream=rural_renewal&community=brooks&endorsed=true&jobOffer=true&teer=2&clb=5&education=true&expMonths=14&familySize=2&funds=20000`);
    assert.equal(ruralGetRes.status, 200);
    const ruralGetData = await ruralGetRes.json();
    assert.equal(ruralGetData.overallEligible, true);
    assert.match(ruralGetData.summaryTitle, /Brooks/);

    const ruralPostRes = await fetch(`${baseUrl}/v1/tools/rural-renewal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamType: 'rural_entrepreneur',
        netWorthCad: 400000,
        plannedInvestmentCad: 150000,
        plannedOwnershipPercent: 60,
        jobsCreatedCount: 2,
        hasCompletedCommunityExploratoryVisit: true,
        hasCommunityEndorsementLetter: true,
        clbLevel: 5,
        hasHighSchoolOrEca: true
      })
    });
    assert.equal(ruralPostRes.status, 200);
    const ruralPostData = await ruralPostRes.json();
    assert.equal(ruralPostData.overallEligible, true);

    // 69. Speculation & Vacancy Tax and Ontario NRST Rebate Engine
    const specGetRes = await fetch(`${baseUrl}/v1/tools/speculation-tax-rebate?province=BC&primaryHome=true`);
    assert.equal(specGetRes.status, 200);
    const specGetData = await specGetRes.json();
    assert.equal(specGetData.isTaxExempt, true);
    assert.equal(specGetData.province, 'BC');

    const specPostRes = await fetch(`${baseUrl}/v1/tools/speculation-tax-rebate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        purchasePriceCad: 800000,
        isCanadianCitizenOrPr: false,
        purchaseClosingDate: '2026-01-15',
        prStatusAcquiredDate: '2026-03-01',
        rebateApplicationDate: '2026-04-01',
        occupiedAsPrincipalResidenceWithin60Days: true,
        heldSolelyWithSpouse: true
      })
    });
    assert.equal(specPostRes.status, 200);
    const specPostData = await specPostRes.json();
    assert.equal(specPostData.ontarioNrstRebate.isNrstRebateEligible, true);
    assert.equal(specPostData.ontarioNrstRebate.nrstRebateAmountCad, 200000);

    // 70. Child Welfare, Kinship Care & Intercountry Adoption Engine
    const cwGetRes = await fetch(`${baseUrl}/v1/tools/child-welfare-guardianship?pathway=vysa_youth_services&age=16`);
    assert.equal(cwGetRes.status, 200);
    const cwGetData = await cwGetRes.json();
    assert.equal(cwGetData.isVysaEligible, true);
    assert.ok(cwGetData.statutoryProtections.some(p => p.includes('INDEPENDENT YOUTH CONSENT')));

    const cwPostRes = await fetch(`${baseUrl}/v1/tools/child-welfare-guardianship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathway: 'intercountry_adoption',
        isCanadianCitizenParentForAdoption: true,
        adoptionCountry: 'India',
        isHagueConventionCountry: true,
        adoptionLegallyFinalizedAbroad: true,
        preAdoptionTiesSevered: true
      })
    });
    assert.equal(cwPostRes.status, 200);
    const cwPostData = await cwPostRes.json();
    assert.equal(cwPostData.isDirectCitizenshipGrantEligible, true);
    assert.ok(cwPostData.statutoryProtections.some(n => n.includes('Citizenship Act s. 5.1')));

    // 71. Excessive Demand Mitigation Engine
    const edGetRes = await fetch(`${baseUrl}/v1/tools/excessive-demand-mitigation?stream=spousal_sponsorship&condition=Kidney+Disease&meds=45000`);
    assert.equal(edGetRes.status, 200);
    const edGetData = await edGetRes.json();
    assert.equal(edGetData.admissibilityStatus, 'statutorily_exempt');
    assert.match(edGetData.summaryTitle, /Statutorily Exempt/);

    const edPostRes = await fetch(`${baseUrl}/v1/tools/excessive-demand-mitigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        immigrationStream: 'economic_express_entry',
        diagnosedCondition: 'Multiple Sclerosis',
        estimatedAnnualMedicationCostCad: 30000,
        estimatedAnnualHospitalCostCad: 2000,
        estimatedAnnualSocialServicesCostCad: 1000,
        hasPrivateInsuranceDrugCoverage: true,
        privateInsuranceDrugLimitAnnualCad: 25000,
        liquidFundsAvailableForCareCad: 0
      })
    });
    assert.equal(edPostRes.status, 200);
    const edPostData = await edPostRes.json();
    assert.equal(edPostData.admissibilityStatus, 'admissible_with_mitigation');
    assert.equal(edPostData.costAssessment.netAnnualPublicCostCad, 8000);

    // 72. Francophone Mobility Program (C16) Engine
    const fmGetRes = await fetch(`${baseUrl}/v1/tools/francophone-mobility?province=ON&testType=tef_canada&speaking=6&listening=5&teer=1`);
    assert.equal(fmGetRes.status, 200);
    const fmGetData = await fmGetRes.json();
    assert.equal(fmGetData.overallEligible, true);
    assert.equal(fmGetData.lmiaExemptionCode, 'C16');

    const fmPostRes = await fetch(`${baseUrl}/v1/tools/francophone-mobility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'QC',
        nclcSpeaking: 7,
        nclcListening: 7
      })
    });
    assert.equal(fmPostRes.status, 200);
    const fmPostData = await fmPostRes.json();
    assert.equal(fmPostData.overallEligible, false);

    // 73. Digital Platform Workers' Rights & Gig Wage Engine
    const dpGetRes = await fetch(`${baseUrl}/v1/tools/digital-platform-worker?province=ON&hours=40&basePay=550&tips=100`);
    assert.equal(dpGetRes.status, 200);
    const dpGetData = await dpGetRes.json();
    assert.equal(dpGetData.wageAudit.hasWageTheft, true);
    assert.equal(dpGetData.wageAudit.wageShortfallCad, 138);

    const dpPostRes = await fetch(`${baseUrl}/v1/tools/digital-platform-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'BC',
        engagedHoursInPeriod: 30,
        actualBasePayReceivedCad: 500
      })
    });
    assert.equal(dpPostRes.status, 200);
    const dpPostData = await dpPostRes.json();
    assert.equal(dpPostData.wageAudit.statutoryEngagedHourlyRateCad, 20.88);
    assert.equal(dpPostData.wageAudit.wageShortfallCad, 126.40);

    // 74. Atlantic Immigration Program (AIP) Diagnostic Engine
    const aipGetRes = await fetch(`${baseUrl}/v1/tools/atlantic-immigration?province=NS&stream=international_graduate&teer=1&clb=6&designated=true&credential=true&residenceMonths=18`);
    assert.equal(aipGetRes.status, 200);
    const aipGetData = await aipGetRes.json();
    assert.equal(aipGetData.overallEligible, true);
    assert.equal(aipGetData.stream, 'international_graduate');

    const aipPostRes = await fetch(`${baseUrl}/v1/tools/atlantic-immigration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'PE',
        stream: 'intermediate_skilled',
        nocTeer: 4,
        clbLevel: 4,
        hasDesignatedEmployerJobOffer: true,
        isPermanentJobOffer: false
      })
    });
    assert.equal(aipPostRes.status, 200);
    const aipPostData = await aipPostRes.json();
    assert.equal(aipPostData.overallEligible, false);

    // 75. Child Care Subsidy & CWELCC Navigator
    const ccsGetRes = await fetch(`${baseUrl}/v1/tools/childcare-subsidy?province=ON&municipality=Toronto&income=18000&baseFee=1400`);
    assert.equal(ccsGetRes.status, 200);
    const ccsGetData = await ccsGetRes.json();
    assert.equal(ccsGetData.subsidyCalculation.annualParentalContributionCad, 0);

    const ccsPostRes = await fetch(`${baseUrl}/v1/tools/childcare-subsidy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        province: 'ON',
        municipality: 'Peel Region',
        adjustedFamilyNetIncomeCad: 30000,
        baselineMonthlyFeePerChildCad: 1200,
        children: [{ ageYears: 4, hasDisability: false }]
      })
    });
    assert.equal(ccsPostRes.status, 200);
    const ccsPostData = await ccsPostRes.json();
    assert.equal(ccsPostData.subsidyCalculation.annualParentalContributionCad, 1000);

    // 76. BC Strata Property Bylaw Defense Engine
    const strataGetRes = await fetch(`${baseUrl}/v1/tools/bc-strata-bylaw?dispute=rental_restriction&longTerm=true&months=12&fine=500&screening=true`);
    assert.equal(strataGetRes.status, 200);
    const strataGetData = await strataGetRes.json();
    assert.equal(strataGetData.isBylawEnforceable, false);
    assert.equal(strataGetData.unlawfulFineRefundCad, 500);

    const strataPostRes = await fetch(`${baseUrl}/v1/tools/bc-strata-bylaw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disputeType: 'age_restriction',
        strataAgeMinimum: 19
      })
    });
    assert.equal(strataPostRes.status, 200);
    const strataPostData = await strataPostRes.json();
    assert.equal(strataPostData.isBylawEnforceable, false);

    // 77. Permanent Resident Card Renewal & Urgent Processing Navigator
    const prCardGetRes = await fetch(`${baseUrl}/v1/tools/pr-card-renewal?daysInCanada=800&urgent=false&insideCanada=true`);
    assert.equal(prCardGetRes.status, 200);
    const prCardGetData = await prCardGetRes.json();
    assert.equal(prCardGetData.residencyAssessment.residencyObligationMet, true);
    assert.equal(prCardGetData.applicationPathway.recommendedForm, 'IMM 5444');

    const prCardPostRes = await fetch(`${baseUrl}/v1/tools/pr-card-renewal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daysInCanadaLast5Years: 750,
        hasUrgentTravelNeed: true,
        travelDepartureDaysFromNow: 20,
        urgentReasonCategory: 'urgent_employment',
        hasProofOfTravel: true,
        hasSupportingUrgentProof: true,
        isCurrentlyInsideCanada: true
      })
    });
    assert.equal(prCardPostRes.status, 200);
    const prCardPostData = await prCardPostRes.json();
    assert.equal(prCardPostData.urgentProcessing.qualifiesForUrgentProcessing, true);

    // 78. Temporary Foreign Worker Transition & Public Policy Engine
    const fwtGetRes = await fetch(`${baseUrl}/v1/tools/foreign-worker-transition?wage=18.50&medianWage=28.39&cma=Calgary&unemploymentRate=7.2&sector=hospitality`);
    assert.equal(fwtGetRes.status, 200);
    const fwtGetData = await fwtGetRes.json();
    assert.equal(fwtGetData.streamClassification.isHighWage, false);
    assert.equal(fwtGetData.lmiaAudit.isSubjectToCmaFreeze, true);

    const fwtPostRes = await fetch(`${baseUrl}/v1/tools/foreign-worker-transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wagePerHour: 35.0,
        provincialMedianWage: 28.39,
        hasFrenchProficiencyNclc5: true
      })
    });
    assert.equal(fwtPostRes.status, 200);
    const fwtPostData = await fwtPostRes.json();
    assert.equal(fwtPostData.streamClassification.isHighWage, true);
    assert.ok(fwtPostData.viablePathways.length > 0);

    // 79. Child Disability Benefit & RDSP Navigator
    const cdbGetRes = await fetch(`${baseUrl}/v1/tools/child-disability-benefit?age=6&hasDtc=true&income=35000&contribution=1500`);
    assert.equal(cdbGetRes.status, 200);
    const cdbGetData = await cdbGetRes.json();
    assert.equal(cdbGetData.childDisabilityBenefit.isEligible, true);
    assert.equal(cdbGetData.childDisabilityBenefit.annualBenefitCad, 3173);

    const cdbPostRes = await fetch(`${baseUrl}/v1/tools/child-disability-benefit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childAgeYears: 10,
        hasApprovedDtcT2201: true,
        familyNetIncomeCad: 90000
      })
    });
    assert.equal(cdbPostRes.status, 200);
    const cdbPostData = await cdbPostRes.json();
    assert.equal(cdbPostData.childDisabilityBenefit.annualBenefitCad, 2821);

    // 80. Alberta Tenancy Security Deposit & RTDRS Defense Engine
    const abDepGetRes = await fetch(`${baseUrl}/v1/tools/alberta-security-deposit?rent=1600&deposit=1600&moveIn=false&signedReport=false&deductions=500`);
    assert.equal(abDepGetRes.status, 200);
    const abDepGetData = await abDepGetRes.json();
    assert.equal(abDepGetData.inspectionCompliance.landlordForfeitedDeductionRights, true);
    assert.equal(abDepGetData.refundAssessment.illegalDeductionsCad, 500);

    const abDepPostRes = await fetch(`${baseUrl}/v1/tools/alberta-security-deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyRentCad: 1500,
        securityDepositPaidCad: 1500,
        additionalNonRefundableFeesCad: 300
      })
    });
    assert.equal(abDepPostRes.status, 200);
    const abDepPostData = await abDepPostRes.json();
    assert.equal(abDepPostData.depositAudit.isDepositOvercharged, true);
    assert.equal(abDepPostData.depositAudit.overchargedDepositCad, 300);

    // 81. Internationally Educated Nurses Licensure & Fast-Track Engine
    const ienGetRes = await fetch(`${baseUrl}/v1/tools/internationally-trained-nurse?country=Philippines&designation=rn&experienceYears=5&yearsSincePractice=1&langRoute=ielts_academic&ieltsScore=7.5&province=ON`);
    assert.equal(ienGetRes.status, 200);
    const ienGetData = await ienGetRes.json();
    assert.equal(ienGetData.nnasEvaluation.isExpeditedCountry, true);
    assert.equal(ienGetData.regulatoryRequirements.qualifiesForTemporaryClass, true);

    const ienPostRes = await fetch(`${baseUrl}/v1/tools/internationally-trained-nurse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryOfEducation: 'United Kingdom',
        languageProficiencyRoute: 'nursing_taught_in_english'
      })
    });
    assert.equal(ienPostRes.status, 200);
    const ienPostData = await ienPostRes.json();
    assert.equal(ienPostData.regulatoryRequirements.isLanguageProficiencyMet, true);

    // 82. Alberta Opportunity Stream (AOS) & Tourism Stream Navigator
    const aosGetRes = await fetch(`${baseUrl}/v1/tools/alberta-opportunity-stream?permitType=lmia_based&abMonths=14&teer=2&noc=21231&clb=6`);
    assert.equal(aosGetRes.status, 200);
    const aosGetData = await aosGetRes.json();
    assert.equal(aosGetData.isAosEligible, true);
    assert.equal(aosGetData.overallVerdict, 'ELIGIBLE_FOR_AAIP_NOMINATION');

    const aosPostRes = await fetch(`${baseUrl}/v1/tools/alberta-opportunity-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workPermitType: 'pgwp_non_alberta_grad',
        albertaWorkExperienceMonths: 12,
        languageClbLevel: 7
      })
    });
    assert.equal(aosPostRes.status, 200);
    const aosPostData = await aosPostRes.json();
    assert.equal(aosPostData.isAosEligible, false);
    assert.equal(aosPostData.workPermitAudit.isWorkPermitEligible, false);

    // 83. BC Speculation and Vacancy Tax (SVT) Annual Declaration Engine
    const svtGetRes = await fetch(`${baseUrl}/v1/tools/bc-speculation-tax-declaration?region=Metro%20Vancouver&assessedValue=1500000&status=canadian_citizen_or_pr&satellite=false&propertyUse=principal_residence&months=12`);
    assert.equal(svtGetRes.status, 200);
    const svtGetData = await svtGetRes.json();
    assert.equal(svtGetData.isExemptFromSvt, true);
    assert.equal(svtGetData.estimatedTaxLiabilityCad, 0);

    const svtPostRes = await fetch(`${baseUrl}/v1/tools/bc-speculation-tax-declaration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyRegion: 'Kelowna',
        assessedPropertyValueCad: 1000000,
        isSatelliteFamily: true,
        propertyUseCategory: 'principal_residence',
        monthsOccupiedInYear: 10
      })
    });
    assert.equal(svtPostRes.status, 200);
    const svtPostData = await svtPostRes.json();
    assert.equal(svtPostData.isExemptFromSvt, false);
    assert.equal(svtPostData.applicableTaxRatePercent, 2.0);
    assert.equal(svtPostData.estimatedTaxLiabilityCad, 20000);

    // 84. Permanent Resident Travel Document (PRTD) & Humanitarian Grounds Navigator
    const prtdGetRes = await fetch(`${baseUrl}/v1/tools/prtd-humanitarian?daysInCanada=450&reasonCategory=care_for_critically_ill_family&hasProof=true&hasBioc=true`);
    assert.equal(prtdGetRes.status, 200);
    const prtdGetData = await prtdGetRes.json();
    assert.equal(prtdGetData.humanitarianAssessment.overallHcStrength, 'STRONG');
    assert.equal(prtdGetData.appealRights.qualifiesForMandatoryInPersonTravelDocument, true);

    const prtdPostRes = await fetch(`${baseUrl}/v1/tools/prtd-humanitarian`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daysPhysicallyInCanadaLast5Years: 100,
        reasonForAbsenceCategory: 'employment_abroad_non_canadian',
        hasDocumentaryProofOfCompellingCircumstance: false
      })
    });
    assert.equal(prtdPostRes.status, 200);
    const prtdPostData = await prtdPostRes.json();
    assert.equal(prtdPostData.humanitarianAssessment.overallHcStrength, 'VULNERABLE');

    // 85. Common Law Reasonable Notice & Severance Calculator (Bardal Factors)
    const sevGetRes = await fetch(`${baseUrl}/v1/tools/severance-reasonable-notice?service=7.0&age=42&salary=104000&province=ON&largePayroll=true&hasClause=false`);
    assert.equal(sevGetRes.status, 200);
    const sevGetData = await sevGetRes.json();
    assert.equal(sevGetData.statutoryEsaAudit.statutoryNoticeWeeks, 7);
    assert.equal(sevGetData.statutoryEsaAudit.statutorySeveranceWeeks, 7.0);
    assert.equal(sevGetData.statutoryEsaAudit.totalStatutoryMinimumCad, 28000.0);

    const sevPostRes = await fetch(`${baseUrl}/v1/tools/severance-reasonable-notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yearsOfService: 5.0,
        employeeAgeYears: 50,
        annualSalaryCad: 78000,
        roleSeniority: 'managerial_professional',
        hasSignedTerminationClause: true,
        terminationClauseViolatesEsa: true
      })
    });
    assert.equal(sevPostRes.status, 200);
    const sevPostData = await sevPostRes.json();
    assert.equal(sevPostData.enforceabilityAudit.isClauseEnforceable, false);

    // 86. Manitoba Provincial Nominee Program (MPNP) Skilled Worker Navigator
    const mpnpGetRes = await fetch(`${baseUrl}/v1/tools/manitoba-pnp-skilled-worker?mbMonths=8&oopGrad=false&jobOffer=true&clb1=7&age=29&exp=4&edu=bachelors_degree&regional=true`);
    assert.equal(mpnpGetRes.status, 200);
    const mpnpGetData = await mpnpGetRes.json();
    assert.equal(mpnpGetData.isStreamEligible, true);
    assert.equal(mpnpGetData.eoiScoreSummary.totalEoiPoints, 1020);

    const mpnpPostRes = await fetch(`${baseUrl}/v1/tools/manitoba-pnp-skilled-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthsWorkedInManitoba: 8,
        isOutOfProvinceGraduate: true,
        hasPermanentManitobaJobOffer: true
      })
    });
    assert.equal(mpnpPostRes.status, 200);
    const mpnpPostData = await mpnpPostRes.json();
    assert.equal(mpnpPostData.isStreamEligible, false);
    assert.equal(mpnpPostData.employmentAudit.requiredMonths, 12);

    // 87. Saskatchewan Immigrant Nominee Program (SINP) Hard-to-Fill Skills Stream
    const sinpGetRes = await fetch(`${baseUrl}/v1/tools/sinp-hard-to-fill?noc=65201&skMonths=8&clb=5&jal=true&fullTime=true&edu=secondary_school&eca=true&teer=5&validPermit=true`);
    assert.equal(sinpGetRes.status, 200);
    const sinpGetData = await sinpGetRes.json();
    assert.equal(sinpGetData.isEligible, true);
    assert.equal(sinpGetData.eligibilityStatus, 'QUALIFIED_FOR_SINP_NOMINATION');

    const sinpPostRes = await fetch(`${baseUrl}/v1/tools/sinp-hard-to-fill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '95106',
        workExperienceMonthsInSaskatchewan: 9,
        languageClbLevel: 4,
        hasSaskatchewanJobApprovalLetter: false,
        hasPermanentFullTimeOffer: true
      })
    });
    assert.equal(sinpPostRes.status, 200);
    const sinpPostData = await sinpPostRes.json();
    assert.equal(sinpPostData.isEligible, false);
    assert.ok(sinpPostData.deficiencies.some(d => d.rule.includes('JAL')));

    // 88. Ontario ESA Section 74 Reprisal Defense Navigator
    const esaGetRes = await fetch(`${baseUrl}/v1/tools/esa-reprisal-defense?activity=requested_overtime_pay&action=termination&days=4&writtenReason=false&statedReason=none&evidence=true&wage=4500&monthsElapsed=2`);
    assert.equal(esaGetRes.status, 200);
    const esaGetData = await esaGetRes.json();
    assert.equal(esaGetData.isReverseBurdenTriggered, true);
    assert.equal(esaGetData.reprisalRiskScore, 'CRITICAL_HIGH_MERIT');

    const esaPostRes = await fetch(`${baseUrl}/v1/tools/esa-reprisal-defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protectedActivity: 'asked_about_rights',
        adverseAction: 'termination',
        monthsElapsedSinceAction: 26
      })
    });
    assert.equal(esaPostRes.status, 200);
    const esaPostData = await esaPostRes.json();
    assert.equal(esaPostData.isWithinLimitationPeriod, false);
    assert.equal(esaPostData.reprisalRiskScore, 'BARRED_BY_LIMITATION');

    // 89. British Columbia SVT Notice of Objection & Appeal Navigator
    const svtAppealGetRes = await fetch(`${baseUrl}/v1/tools/bc-svt-appeal?noticeDate=2026-10-01&amount=20000&ground=arm_length_tenancy_occupied&leaseProof=true&stayRequested=true&currentDate=2026-10-25`);
    assert.equal(svtAppealGetRes.status, 200);
    const svtAppealGetData = await svtAppealGetRes.json();
    assert.equal(svtAppealGetData.isWithin90Days, true);
    assert.equal(svtAppealGetData.objectionStatus, 'TIMELY');

    const svtAppealPostRes = await fetch(`${baseUrl}/v1/tools/bc-svt-appeal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentNoticeDate: '2026-05-01',
        currentDate: '2026-10-31',
        assessedAmountCad: 35000,
        objectionGround: 'principal_residence_exemption'
      })
    });
    assert.equal(svtAppealPostRes.status, 200);
    const svtAppealPostData = await svtAppealPostRes.json();
    assert.equal(svtAppealPostData.isWithin90Days, false);
    assert.equal(svtAppealPostData.objectionStatus, 'BARRED_BY_LIMITATION');

    // 90. Express Entry Tie-Breaking & Selection Runway Engine
    const eeGetRes = await fetch(`${baseUrl}/v1/tools/express-entry-tie-break?crs=485&submissionUtc=2026-03-01T12:00:00Z&cutoff=485&tieBreakUtc=2026-03-15T00:00:00Z`);
    assert.equal(eeGetRes.status, 200);
    const eeGetData = await eeGetRes.json();
    assert.equal(eeGetData.simulatedRound.receivesIta, true);
    assert.equal(eeGetData.simulatedRound.tieBreakStatus, 'WON_TIE_BREAKER');

    const eePostRes = await fetch(`${baseUrl}/v1/tools/express-entry-tie-break`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateCrs: 485,
        profileSubmissionUtc: '2026-03-20T12:00:00Z',
        simulatedRoundCutoff: 485,
        simulatedTieBreakUtc: '2026-03-15T00:00:00Z'
      })
    });
    assert.equal(eePostRes.status, 200);
    const eePostData = await eePostRes.json();
    assert.equal(eePostData.simulatedRound.receivesIta, false);
    assert.equal(eePostData.simulatedRound.tieBreakStatus, 'LOST_TIE_BREAKER');

    // 91. City of Calgary Secondary Suite Registration & Safety Amnesty Engine
    const cgyGetRes = await fetch(`${baseUrl}/v1/tools/calgary-suite-amnesty?type=basement_suite&smokeAlarms=true&coAlarm=true&windowArea=0.45&windowDim=450&wellClearance=900&ceilingHeight=2.15&fireSeparation=true&hvac=true&exit=true`);
    assert.equal(cgyGetRes.status, 200);
    const cgyGetData = await cgyGetRes.json();
    assert.equal(cgyGetData.isCodeCompliant, true);
    assert.equal(cgyGetData.registryReadinessStatus, 'READY_FOR_REGISTRY_STICKER');

    const cgyPostRes = await fetch(`${baseUrl}/v1/tools/calgary-suite-amnesty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suiteType: 'basement_suite',
        hasInterconnectedSmokeAlarms: false,
        bedroomWindowOpeningAreaSqM: 0.25
      })
    });
    assert.equal(cgyPostRes.status, 200);
    const cgyPostData = await cgyPostRes.json();
    assert.equal(cgyPostData.isCodeCompliant, false);
    assert.equal(cgyPostData.registryReadinessStatus, 'REMEDIATION_REQUIRED');

    // 92. Ontario ESA Constructive Dismissal & Temporary Layoff Navigator
    const esaLayoffGetRes = await fetch(`${baseUrl}/v1/tools/esa-constructive-layoff?service=4&age=35&salary=60000&weeks=8&contractClause=true&payroll25m=true`);
    assert.equal(esaLayoffGetRes.status, 200);
    const esaLayoffGetData = await esaLayoffGetRes.json();
    assert.equal(esaLayoffGetData.legalVerdict, 'COMPLIANT_TEMPORARY_LAYOFF');
    assert.equal(esaLayoffGetData.isEsaLayoffPermissible, true);

    const esaLayoffPostRes = await fetch(`${baseUrl}/v1/tools/esa-constructive-layoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yearsOfService: 5,
        employeeAge: 42,
        annualSalaryCad: 70000,
        weeksOnLayoff: 15,
        employerMaintainedBenefitsOrSub: false,
        hasContractualLayoffClause: false
      })
    });
    assert.equal(esaLayoffPostRes.status, 200);
    const esaLayoffPostData = await esaLayoffPostRes.json();
    assert.equal(esaLayoffPostData.hasExceededEsaThreshold, true);
    assert.equal(esaLayoffPostData.isCommonLawConstructiveDismissal, true);

    // 93. Nova Scotia Nominee Program (NSNP) Experience: Express Entry & Physician Streams
    const nsnpGetRes = await fetch(`${baseUrl}/v1/tools/nsnp-experience?stream=nova_scotia_experience_express_entry&age=29&teer=1&nsMonths=14&nsHours=1800&clb=8&ee=true&validPermit=true&eca=true&intent=true`);
    assert.equal(nsnpGetRes.status, 200);
    const nsnpGetData = await nsnpGetRes.json();
    assert.equal(nsnpGetData.isEligible, true);
    assert.equal(nsnpGetData.eligibilityStatus, 'ELIGIBLE_FOR_NSNP_EXPERIENCE_EXPRESS_ENTRY');

    const nsnpPostRes = await fetch(`${baseUrl}/v1/tools/nsnp-experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: 'physician_stream',
        candidateAge: 38,
        nocCode: '31102',
        hasSignedReturnOfServiceWithNshOrIwk: true,
        hasCpsnsLicensureOrAssessment: true,
        hasIntentToResideInNovaScotia: true
      })
    });
    assert.equal(nsnpPostRes.status, 200);
    const nsnpPostData = await nsnpPostRes.json();
    assert.equal(nsnpPostData.isEligible, true);
    assert.equal(nsnpPostData.eligibilityStatus, 'ELIGIBLE_FOR_NSNP_PHYSICIAN_STREAM');

    // 94. Quebec Experience Program (PEQ) — Temporary Foreign Worker Stream
    const peqGetRes = await fetch(`${baseUrl}/v1/tools/quebec-peq-worker?qcMonths=26&hours=37.5&teer=1&employed=true&validPermit=true&frenchLevel=8&values=true`);
    assert.equal(peqGetRes.status, 200);
    const peqGetData = await peqGetRes.json();
    assert.equal(peqGetData.isEligible, true);
    assert.equal(peqGetData.eligibilityStatus, 'ELIGIBLE_FOR_PEQ_CSQ');

    const peqPostRes = await fetch(`${baseUrl}/v1/tools/quebec-peq-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthsWorkedInQuebec: 18,
        weeklyHoursWorked: 35,
        principalOralFrenchLevel: 5
      })
    });
    assert.equal(peqPostRes.status, 200);
    const peqPostData = await peqPostRes.json();
    assert.equal(peqPostData.isEligible, false);
    assert.equal(peqPostData.eligibilityStatus, 'INELIGIBLE_FOR_PEQ');

    // 95. Alberta Commercial Tenancies Distress & Lockout Defense Engine
    const abDistressGetRes = await fetch(`${baseUrl}/v1/tools/alberta-commercial-distress?arrears=15000&goodsValue=45000&licensedBailiff=true&changedLocks=false&noticeServed=true&formProvided=true&daysElapsed=4`);
    assert.equal(abDistressGetRes.status, 200);
    const abDistressGetData = await abDistressGetRes.json();
    assert.equal(abDistressGetData.legalVerdict, 'LAWFUL_PENDING_DISTRESS');
    assert.equal(abDistressGetData.isWithinObjectionWindow, true);

    const abDistressPostRes = await fetch(`${baseUrl}/v1/tools/alberta-commercial-distress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rentArrearsClaimedCad: 25000,
        isSeizureExecutedByLicensedAgency: false,
        hasLandlordChangedLocksOrTerminatedLease: true
      })
    });
    assert.equal(abDistressPostRes.status, 200);
    const abDistressPostData = await abDistressPostRes.json();
    assert.equal(abDistressPostData.legalVerdict, 'UNLAWFUL_DISTRESS_OR_CONVERSION');
    assert.ok(abDistressPostData.civilViolations.length >= 2);

    // 96. Temporary Resident Permit (TRP) & Inadmissibility Overcoming Engine
    const trpGetRes = await fetch(`${baseUrl}/v1/tools/trp-inadmissibility?type=criminality_s36_2&years=5&reason=urgent_family_need&proof=true&cleanRecord=true&finesPaid=true&violence=false&location=inside_canada&citizenFamily=true`);
    assert.equal(trpGetRes.status, 200);
    const trpGetData = await trpGetRes.json();
    assert.equal(trpGetData.isBalanceFavourable, true);
    assert.equal(trpGetData.recommendationVerdict, 'RECOMMEND_TRP_SUBMISSION');

    const trpPostRes = await fetch(`${baseUrl}/v1/tools/trp-inadmissibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inadmissibilityType: 'security_or_human_rights',
        hasDocumentaryProofOfCompellingNeed: true
      })
    });
    assert.equal(trpPostRes.status, 200);
    const trpPostData = await trpPostRes.json();
    assert.equal(trpPostData.isBalanceFavourable, false);
    assert.equal(trpPostData.recommendationVerdict, 'UNFAVOURABLE_DISCRETION_RISK');

    // 97. Express Entry Federal Skilled Trades Program (FSTP) Engine
    const fstpGetRes = await fetch(`${baseUrl}/v1/tools/federal-skilled-trades?noc=72410&years=4&hours=6000&cert=true&province=ON&speaking=6&listening=6&reading=5&writing=5&ee=true`);
    assert.equal(fstpGetRes.status, 200);
    const fstpGetData = await fstpGetRes.json();
    assert.equal(fstpGetData.isEligible, true);
    assert.equal(fstpGetData.eligibilityStatus, 'ELIGIBLE_FOR_FSTP');

    const fstpPostRes = await fetch(`${baseUrl}/v1/tools/federal-skilled-trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '21231',
        yearsOfTradesExperience: 1
      })
    });
    assert.equal(fstpPostRes.status, 200);
    const fstpPostData = await fstpPostRes.json();
    assert.equal(fstpPostData.isEligible, false);
    assert.equal(fstpPostData.isTradeNoc, false);

    // 98. British Columbia Strata Property Act (SPA) EV Charging Mandate
    const bcEvGetRes = await fetch(`${baseUrl}/v1/tools/bc-strata-ev-charging?requestDate=2026-10-01&currentDate=2026-10-31&responded=false&payCosts=true`);
    assert.equal(bcEvGetRes.status, 200);
    const bcEvGetData = await bcEvGetRes.json();
    assert.equal(bcEvGetData.legalVerdict, 'REQUEST_PENDING_WITHIN_DEADLINE');

    const bcEvPostRes = await fetch(`${baseUrl}/v1/tools/bc-strata-ev-charging`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hasStrataCouncilResponded: true,
        councilDecision: 'refused',
        refusalReasonCategory: 'aesthetic_dislike'
      })
    });
    assert.equal(bcEvPostRes.status, 200);
    const bcEvPostData = await bcEvPostRes.json();
    assert.equal(bcEvPostData.isUnreasonableRefusal, true);
    assert.equal(bcEvPostData.legalVerdict, 'UNREASONABLE_REFUSAL_CRT_ACTIONABLE');

    // 99. Ontario Pay Transparency & Working for Workers Four Act Engine
    const onPayGetRes = await fetch(`${baseUrl}/v1/tools/on-pay-transparency?publicAd=true&hasRange=true&minSalary=70000&maxSalary=90000&usesAi=true&disclosesAi=true&canadianExp=false&headcount=20&payEquity=true`);
    assert.equal(onPayGetRes.status, 200);
    const onPayGetData = await onPayGetRes.json();
    assert.equal(onPayGetData.legalVerdict, 'FULLY_COMPLIANT');

    const onPayPostRes = await fetch(`${baseUrl}/v1/tools/on-pay-transparency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPubliclyAdvertisedJobPosting: true,
        requiresCanadianWorkExperience: true
      })
    });
    assert.equal(onPayPostRes.status, 200);
    const onPayPostData = await onPayPostRes.json();
    assert.equal(onPayPostData.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
    assert.ok(onPayPostData.statutoryViolations.includes('PROHIBITED_CANADIAN_EXPERIENCE_REQUIREMENT'));

    // 100. Yukon Nominee Program (YNP) Critical Impact Worker & Community Pilot Engine
    const ykGetRes = await fetch(`${baseUrl}/v1/tools/yukon-critical-impact?teer=4&noc=65201&months=8&fullTime=true&hours=35&wage=19&employerYears=2&adWeeks=4&clb=5&eca=true&status=work_permit`);
    assert.equal(ykGetRes.status, 200);
    const ykGetData = await ykGetRes.json();
    assert.equal(ykGetData.isEligible, true);
    assert.equal(ykGetData.eligibilityStatus, 'ELIGIBLE_FOR_YUKON_CRITICAL_IMPACT_NOMINATION');

    const ykPostRes = await fetch(`${baseUrl}/v1/tools/yukon-critical-impact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetNocTeer: 1,
        monthsOfRelatedExperience: 2
      })
    });
    assert.equal(ykPostRes.status, 200);
    const ykPostData = await ykPostRes.json();
    assert.equal(ykPostData.isEligible, false);
    assert.equal(ykPostData.eligibilityStatus, 'INELIGIBLE_FOR_YUKON_CRITICAL_IMPACT');

    // 101. Temporary Foreign Worker Closed Permit Transition & Interim Authorization Engine
    const tfwTransGetRes = await fetch(`${baseUrl}/v1/tools/tfw-employer-transition?expiry=2026-11-30&currentDate=2026-10-31&submitted=true&lmia=true&interimRequested=true&interimReceived=true&startedNew=true`);
    assert.equal(tfwTransGetRes.status, 200);
    const tfwTransGetData = await tfwTransGetRes.json();
    assert.equal(tfwTransGetData.legalVerdict, 'FULLY_AUTHORIZED_FOR_NEW_EMPLOYER');
    assert.equal(tfwTransGetData.canLegallyWorkForNewEmployer, true);

    const tfwTransPostRes = await fetch(`${baseUrl}/v1/tools/tfw-employer-transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentWorkPermitExpiryDate: '2026-11-30',
        currentDate: '2026-10-31',
        hasSubmittedNewWorkPermitApplication: true,
        hasPositiveLmiaOrExemption: true,
        hasReceivedIrccInterimAuthorizationEmail: false,
        hasStartedWorkingForNewEmployer: true
      })
    });
    assert.equal(tfwTransPostRes.status, 200);
    const tfwTransPostData = await tfwTransPostRes.json();
    assert.equal(tfwTransPostData.legalVerdict, 'UNAUTHORIZED_WORK_VIOLATION_ACTION_REQUIRED');
    assert.ok(tfwTransPostData.complianceViolations.includes('UNAUTHORIZED_WORK_UNDER_IRPA_30'));

    // 102. PEI PNP Occupations in Demand Navigator
    const peiGetRes = await fetch(`${baseUrl}/v1/tools/pei-occupations-demand?noc=33102&fullTime=true&permanent=true&employerYears=true&workPermit=true&monthsExp=18&age=30&clb=5&highSchool=true&funds=15000&familySize=1&intentPei=true`);
    assert.equal(peiGetRes.status, 200);
    const peiGetData = await peiGetRes.json();
    assert.equal(peiGetData.isEligible, true);
    assert.equal(peiGetData.eligibilityVerdict, 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION');

    const peiPostRes = await fetch(`${baseUrl}/v1/tools/pei-occupations-demand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '99999',
        applicantAge: 62
      })
    });
    assert.equal(peiPostRes.status, 200);
    const peiPostData = await peiPostRes.json();
    assert.equal(peiPostData.isEligible, false);
    assert.equal(peiPostData.eligibilityVerdict, 'INELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND');

    // 103. BC ESA Group Termination Navigator
    const bcGroupGetRes = await fetch(`${baseUrl}/v1/tools/bc-esa-group-termination?affectedCount=80&twoMonthWindow=true&singleLocation=true&noticeGivenWeeks=2&tenureMonths=36&weeklyWage=1000&ministerNotified=true`);
    assert.equal(bcGroupGetRes.status, 200);
    const bcGroupGetData = await bcGroupGetRes.json();
    assert.equal(bcGroupGetData.isSection64GroupTermination, true);
    assert.equal(bcGroupGetData.groupTerminationDetails.requiredNoticeWeeks, 8);

    const bcGroupPostRes = await fetch(`${baseUrl}/v1/tools/bc-esa-group-termination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isJustCauseTermination: true
      })
    });
    assert.equal(bcGroupPostRes.status, 200);
    const bcGroupPostData = await bcGroupPostRes.json();
    assert.equal(bcGroupPostData.isExemptUnderSection65, true);
    assert.equal(bcGroupPostData.complianceStatus, 'EXEMPT_JUST_CAUSE');

    const groupUrl = baseUrl + '/v1/tools/bc-esa-group-termination';
    const groupGet = await fetch(groupUrl + '?affectedEmployeesCount=50&groupNoticeWeeksGiven=1.5&isJustCauseTermination=false');
    const groupPost = await fetch(groupUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affectedCount: 50, noticeGivenWeeks: 1.5, justCause: 'false' })
    });
    for (const response of [groupGet, groupPost]) {
      assert.equal(response.status, 200);
      assert.equal((await response.json()).groupTerminationDetails.statutoryGroupPayInLieuCad, 7800);
    }
    assert.equal((await fetch(groupUrl + '?affectedCount=49.5')).status, 400);
    assert.equal((await fetch(groupUrl + '?justCause=unknown')).status, 400);

    // 104. Federal Start-Up Visa Navigator
    const suvGetRes = await fetch(`${baseUrl}/v1/tools/start-up-visa?entityType=VENTURE_CAPITAL_FUND&commitmentCert=true&letterSupport=true&investmentCad=250000&coOwners=2&applicantPct=25&jointPct=65&essential=true&speaking=6&listening=6&reading=6&writing=6&funds=25000&familySize=2&incorporated=true&managementInCanada=true`);
    assert.equal(suvGetRes.status, 200);
    const suvGetData = await suvGetRes.json();
    assert.equal(suvGetData.isEligible, true);
    assert.equal(suvGetData.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE');

    const suvPostRes = await fetch(`${baseUrl}/v1/tools/start-up-visa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'ANGEL_INVESTOR_GROUP',
        investmentAmountCad: 20000
      })
    });
    assert.equal(suvPostRes.status, 200);
    const suvPostData = await suvPostRes.json();
    assert.equal(suvPostData.isEligible, false);

    // 105. Ontario Tenancy Assignment/Sublet Navigator
    const onAssignGetRes = await fetch(`${baseUrl}/v1/tools/ontario-tenancy-assignment?requestType=ASSIGNMENT&isGeneral=true&daysPassed=9&landlordResponse=NO_RESPONSE`);
    assert.equal(onAssignGetRes.status, 200);
    const onAssignGetData = await onAssignGetRes.json();
    assert.equal(onAssignGetData.rightsAssessment.canTenantGive30DayN9, true);
    assert.equal(onAssignGetData.legalVerdict, 'ELIGIBLE_FOR_IMMEDIATE_30_DAY_N9_TERMINATION');

    const onAssignPostRes = await fetch(`${baseUrl}/v1/tools/ontario-tenancy-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'ASSIGNMENT',
        isGeneralRequest: false,
        daysSinceRequestMade: 4,
        landlordResponse: 'REFUSED_SPECIFICALLY',
        refusalReason: 'No pets allowed'
      })
    });
    assert.equal(onAssignPostRes.status, 200);
    const onAssignPostData = await onAssignPostRes.json();
    assert.equal(onAssignPostData.rightsAssessment.isArbitraryOrUnreasonableRefusal, true);

    // 106. NBPNP Skilled Worker Navigator
    const nbGetRes = await fetch(`${baseUrl}/v1/tools/nbpnp-skilled-worker?age=28&teer=2&firstLangClb=8&education=BACHELORS&expYears=4&jobOffer=true&employerYears=true&medianWage=true&workingInNb=true&funds=5000&familySize=1&intentNb=true`);
    assert.equal(nbGetRes.status, 200);
    const nbGetData = await nbGetRes.json();
    assert.equal(nbGetData.isEligible, true);
    assert.equal(nbGetData.pointsSummary.isPassMarkSatisfied, true);

    const nbPostRes = await fetch(`${baseUrl}/v1/tools/nbpnp-skilled-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantAge: 59,
        yearsOfRelatedExperience: 0
      })
    });
    assert.equal(nbPostRes.status, 200);
    const nbPostData = await nbPostRes.json();
    assert.equal(nbPostData.isEligible, false);

    // 107. Federal Self-Employed Persons Navigator
    const seGetRes = await fetch(`${baseUrl}/v1/tools/self-employed-persons?activityType=CULTURAL_ACTIVITIES&selfExp=3&worldExp=0&education=BACHELORS&age=32&clb1=7&funds=35000&familySize=1`);
    assert.equal(seGetRes.status, 200);
    const seGetData = await seGetRes.json();
    assert.equal(seGetData.isEligible, true);
    assert.equal(seGetData.pointsSummary.isPassMarkSatisfied, true);

    const sePostRes = await fetch(`${baseUrl}/v1/tools/self-employed-persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'ATHLETICS',
        yearsOfSelfEmployedExperience: 1
      })
    });
    assert.equal(sePostRes.status, 200);
    const sePostData = await sePostRes.json();
    assert.equal(sePostData.isEligible, false);

    // 108. Alberta Employment Overtime Banking Navigator
    const abOtGetRes = await fetch(`${baseUrl}/v1/tools/alberta-overtime-banking?wage=30&hoursWorked=10,10,8,8,8&agreement=true&banked=10&months=2`);
    assert.equal(abOtGetRes.status, 200);
    const abOtGetData = await abOtGetRes.json();
    assert.equal(abOtGetData.complianceStatus, 'STATUTORILY_COMPLIANT');
    assert.equal(abOtGetData.hoursAudit.governingStatutoryOvertimeHours, 4);

    const abOtPostRes = await fetch(`${baseUrl}/v1/tools/alberta-overtime-banking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        regularHourlyWageCad: 20,
        dailyHoursWorked: [8, 8, 8, 8, 8],
        existingBankedHours: 15,
        monthsElapsedSinceBanked: 7
      })
    });
    assert.equal(abOtPostRes.status, 200);
    const abOtPostData = await abOtPostRes.json();
    assert.equal(abOtPostData.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
    assert.equal(abOtPostData.financialLiability.totalStatutoryPayoutOwedCad, 450);

    const overtimeUrl = baseUrl + '/v1/tools/alberta-overtime-banking';
    const query = 'regularHourlyWageCad=20&dailyHoursWorked=12&isEmploymentTerminating=true&hasWrittenOvertimeAgreement=true';
    const aliasPost = await fetch(overtimeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wage: 20, hoursWorked: [12], terminating: true, agreement: true })
    });
    const canonicalGet = await fetch(overtimeUrl + '?' + query);
    for (const response of [canonicalGet, aliasPost]) {
      assert.equal(response.status, 200);
      assert.equal((await response.json()).financialLiability.totalStatutoryPayoutOwedCad, 120);
    }
    assert.equal((await fetch(overtimeUrl + '?hoursWorked=8,,10')).status, 400);

    // 109. Ontario Roommate & Occupant Rights Navigator
    const onRoomGetRes = await fetch(`${baseUrl}/v1/tools/ontario-roommate-rights?sharedFacilities=true`);
    assert.equal(onRoomGetRes.status, 200);
    const onRoomGetData = await onRoomGetRes.json();
    assert.equal(onRoomGetData.isRtaCovered, false);
    assert.equal(onRoomGetData.legalStatusVerdict, 'EXEMPT_FROM_RTA_UNDER_SECTION_5_I');

    const onRoomPostRes = await fetch(`${baseUrl}/v1/tools/ontario-roommate-rights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sharesKitchenOrBathWithOwnerOrFamily: false,
        isNamedOnTenancyAgreement: false,
        disputeNature: 'ROOMMATE_EVICTION_BY_TENANT'
      })
    });
    assert.equal(onRoomPostRes.status, 200);
    const onRoomPostData = await onRoomPostRes.json();
    assert.equal(onRoomPostData.isRtaCovered, true);
    assert.equal(onRoomPostData.jurisdictionalAssessment.isStatutoryTenant, false);

    // 110. SINP Tech Talent Pathway Navigator
    const sinpTechGetRes = await fetch(`${baseUrl}/v1/tools/sinp-tech-talent?noc=21232&jal=true&permanent=true&workingInSk=true&monthsInSk=8&clb=7&expressEntry=true&eeProfile=true&techEdu=true&intentSk=true`);
    assert.equal(sinpTechGetRes.status, 200);
    const sinpTechGetData = await sinpTechGetRes.json();
    assert.equal(sinpTechGetData.isEligible, true);
    assert.equal(sinpTechGetData.expressEntryBonusPoints, 600);

    const sinpTechPostRes = await fetch(`${baseUrl}/v1/tools/sinp-tech-talent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '11100',
        hasSinpJobApprovalLetter: false
      })
    });
    assert.equal(sinpTechPostRes.status, 200);
    const sinpTechPostData = await sinpTechPostRes.json();
    assert.equal(sinpTechPostData.isEligible, false);

    // 111. Federal Caregiver Direct-to-PR Pilot Navigator
    const cgGetRes = await fetch(`${baseUrl}/v1/tools/caregiver-direct-pr?noc=44100&fullTime=true&nonSeasonal=true&outsideQuebec=true&employerType=PRIVATE_HOUSEHOLD&careRecipient=CHILDREN_UNDER_18&licoMeets=true&mandatoryLiveIn=false&speaking=5&listening=5&reading=4&writing=4&highSchool=true`);
    assert.equal(cgGetRes.status, 200);
    const cgGetData = await cgGetRes.json();
    assert.equal(cgGetData.isEligible, true);
    assert.equal(cgGetData.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_TO_PR');

    const cgPostRes = await fetch(`${baseUrl}/v1/tools/caregiver-direct-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '44100',
        careRecipientType: 'SENIORS_65_PLUS',
        employerType: 'COMMERCIAL_FACILITY'
      })
    });
    assert.equal(cgPostRes.status, 200);
    const cgPostData = await cgPostRes.json();
    assert.equal(cgPostData.isEligible, false);

    // 112. Federal Citizenship Revocation Defense Navigator
    const citRevGetRes = await fetch(`${baseUrl}/v1/tools/citizenship-revocation?noticeDate=2026-10-10&currentDate=2026-10-25&allegationType=FALSE_REPRESENTATION&citizenYears=9&residenceYears=15&stateless=true&children=true`);
    assert.equal(citRevGetRes.status, 200);
    const citRevGetData = await citRevGetRes.json();
    assert.equal(citRevGetData.proceduralAudit.isWithinStatutoryThirtyDayWindow, true);
    assert.equal(citRevGetData.defensibilityStatus, 'STRONG_DEFENSE_CASE');

    const citRevPostRes = await fetch(`${baseUrl}/v1/tools/citizenship-revocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noticeOfIntentDate: '2026-09-01',
        currentDate: '2026-10-25',
        wouldBeRenderedStateless: false
      })
    });
    assert.equal(citRevPostRes.status, 200);
    const citRevPostData = await citRevPostRes.json();
    assert.equal(citRevPostData.proceduralAudit.isWithinStatutoryThirtyDayWindow, false);

    // 113. BC Roommate & Shared Kitchen Navigator
    const bcRoomGetRes = await fetch(`${baseUrl}/v1/tools/bc-roommate-rights?sharedFacilities=true`);
    assert.equal(bcRoomGetRes.status, 200);
    const bcRoomGetData = await bcRoomGetRes.json();
    assert.equal(bcRoomGetData.isRtaCovered, false);
    assert.equal(bcRoomGetData.legalStatusVerdict, 'EXEMPT_FROM_BC_RTA_UNDER_SECTION_4_C');

    const bcRoomPostRes = await fetch(`${baseUrl}/v1/tools/bc-roommate-rights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sharesKitchenOrBathroomWithOwner: false,
        isNamedOnTenancyAgreement: false,
        disputeType: 'TENANT_ROOMMATE_DISPUTE'
      })
    });
    assert.equal(bcRoomPostRes.status, 200);
    const bcRoomPostData = await bcRoomPostRes.json();
    assert.equal(bcRoomPostData.isRtaCovered, true);
    assert.equal(bcRoomPostData.statusAssessment.isCoTenant, false);

    // 114. Alberta Rural Entrepreneur Stream Navigator
    const abRuralGetRes = await fetch(`${baseUrl}/v1/tools/alberta-rural-entrepreneur?community=Brooks&designated=true&endorsement=true&exploratory=true&netWorth=400000&investment=150000&ownership=60&jobs=2&expYears=4&clb=5&highSchool=true`);
    assert.equal(abRuralGetRes.status, 200);
    const abRuralGetData = await abRuralGetRes.json();
    assert.equal(abRuralGetData.isEligible, true);
    assert.equal(abRuralGetData.eligibilityVerdict, 'ELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR_STREAM');

    const abRuralPostRes = await fetch(`${baseUrl}/v1/tools/alberta-rural-entrepreneur`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netWorthCad: 200000,
        plannedInvestmentCad: 50000
      })
    });
    assert.equal(abRuralPostRes.status, 200);
    const abRuralPostData = await abRuralPostRes.json();
    assert.equal(abRuralPostData.isEligible, false);

    // 115. Federal Refugee Cessation & Re-availment Navigator
    const refCesGetRes = await fetch(`${baseUrl}/v1/tools/refugee-cessation?status=CANADIAN_CITIZEN&citizen=true`);
    assert.equal(refCesGetRes.status, 200);
    const refCesGetData = await refCesGetRes.json();
    assert.equal(refCesGetData.isExemptFromIrpaCessation, true);
    assert.equal(refCesGetData.cessationRiskLevel, 'NONE');

    const refCesPostRes = await fetch(`${baseUrl}/v1/tools/refugee-cessation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStatusInCanada: 'PERMANENT_RESIDENT',
        hasAppliedForOrRenewedNationalPassport: true,
        traveledBackToCountryOfPersecution: true,
        numberOfTripsToCountryOfPersecution: 1,
        purposeOfTravel: 'LEISURE_VACATION',
        ministerHasFiledCessationApplication: true
      })
    });
    assert.equal(refCesPostRes.status, 200);
    const refCesPostData = await refCesPostRes.json();
    assert.equal(refCesPostData.isExemptFromIrpaCessation, false);
    assert.equal(refCesPostData.cessationRiskLevel, 'CRITICAL');

    // 116. Ontario Employment Remote Telework Jurisdiction Navigator
    const onRemoteGetRes = await fetch(`${baseUrl}/v1/tools/on-remote-work-jurisdiction?physicalLocation=ONTARIO&employerHq=BRITISH_COLUMBIA&workFromHome=true&headcount=50&groupTermination=true&remoteTerminated=30&officeTerminated=30&tenureMonths=36&salary=1500`);
    assert.equal(onRemoteGetRes.status, 200);
    const onRemoteGetData = await onRemoteGetRes.json();
    assert.equal(onRemoteGetData.hasOntarioEsaJurisdiction, true);
    assert.equal(onRemoteGetData.remoteWorkerAudit.isCoveredByBill79GroupTermination, true);

    const onRemotePostRes = await fetch(`${baseUrl}/v1/tools/on-remote-work-jurisdiction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeePhysicalWorkLocation: 'ALBERTA',
        employerHeadquartersLocation: 'ONTARIO'
      })
    });
    assert.equal(onRemotePostRes.status, 200);
    const onRemotePostData = await onRemotePostRes.json();
    assert.equal(onRemotePostData.hasOntarioEsaJurisdiction, false);

    // 117. Manitoba Employment Leave & Job Protection Navigator
    const mbLeaveGetRes = await fetch(`${baseUrl}/v1/tools/manitoba-leave?leaveType=MATERNITY&monthsService=8&weeksRequested=17&medicalNote=true`);
    assert.equal(mbLeaveGetRes.status, 200);
    const mbLeaveGetData = await mbLeaveGetRes.json();
    assert.equal(mbLeaveGetData.isEligibleForLeave, true);
    assert.equal(mbLeaveGetData.complianceStatus, 'STATUTORILY_COMPLIANT');

    const mbLeavePostRes = await fetch(`${baseUrl}/v1/tools/manitoba-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaveType: 'INTERPERSONAL_VIOLENCE',
        daysOfContinuousService: 120,
        interpersonalViolenceDaysRequested: 5,
        regularHourlyWageCad: 25,
        regularWeeklyHours: 40
      })
    });
    assert.equal(mbLeavePostRes.status, 200);
    const mbLeavePostData = await mbLeavePostRes.json();
    assert.equal(mbLeavePostData.leaveAudit.paidDaysEntitlement, 5);
    assert.equal(mbLeavePostData.leaveAudit.statutoryPaidLeaveCompensationCad, 1000);

    // 118. Alberta Residential Tenancy Sublease & Assignment Navigator
    const abSubGetRes = await fetch(`${baseUrl}/v1/tools/alberta-tenancy-sublease?type=SUBLEASE&requestDate=2026-10-01&currentDate=2026-10-20&responseStatus=NO_RESPONSE`);
    assert.equal(abSubGetRes.status, 200);
    const abSubGetData = await abSubGetRes.json();
    assert.equal(abSubGetData.legalVerdict, 'DEEMED_STATUTORY_CONSENT_ESTABLISHED');
    assert.equal(abSubGetData.rightsAssessment.isStatutorilyDeemedConsented, true);

    const abSubPostRes = await fetch(`${baseUrl}/v1/tools/alberta-tenancy-sublease`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionType: 'ASSIGNMENT',
        requestDeliveredDate: '2026-10-01',
        currentDate: '2026-10-08',
        landlordResponseStatus: 'REFUSED_WITH_REASONS',
        refusalReasonCategory: 'ARBITRARY_PREFERENCE',
        feeChargedForConsentCad: 250
      })
    });
    assert.equal(abSubPostRes.status, 200);
    const abSubPostData = await abSubPostRes.json();
    assert.equal(abSubPostData.rightsAssessment.isUnreasonableRefusal, true);
    assert.equal(abSubPostData.rightsAssessment.hasIllegalConsentFee, true);

    // 119. Federal Francophone Community Pilot Navigator
    const fcipGetRes = await fetch(`${baseUrl}/v1/tools/francophone-community-pilot?community=Sudbury&recommendation=true&teer=2&jobOffer=true&withinCommunity=true&medianWage=true&speaking=6&listening=6&reading=5&writing=5&expMonths=18&highSchool=true&workingInCanada=false&funds=10000&familySize=1&intentCommunity=true`);
    assert.equal(fcipGetRes.status, 200);
    const fcipGetData = await fcipGetRes.json();
    assert.equal(fcipGetData.isEligible, true);
    assert.equal(fcipGetData.communityDetails.province, 'ON');

    const fcipPostRes = await fetch(`${baseUrl}/v1/tools/francophone-community-pilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communityName: 'Toronto',
        hasCommunityRecommendationLetter: false
      })
    });
    assert.equal(fcipPostRes.status, 200);
    const fcipPostData = await fcipPostRes.json();
    assert.equal(fcipPostData.isEligible, false);

    // 120. British Columbia Child & Youth Employment Navigator
    const bcYouthGetRes = await fetch(`${baseUrl}/v1/tools/bc-child-youth-employment?childAge=13&activity=RETAIL_CASHIER_OR_STOCKING&parentConsent=true&schoolDayHours=3&nonSchoolDayHours=6&schoolWeekHours=15&supervision=true`);
    assert.equal(bcYouthGetRes.status, 200);
    const bcYouthGetData = await bcYouthGetRes.json();
    assert.equal(bcYouthGetData.isCompliant, true);
    assert.equal(bcYouthGetData.legalVerdict, 'STATUTORILY_AUTHORIZED_CHILD_EMPLOYMENT');

    const bcYouthPostRes = await fetch(`${baseUrl}/v1/tools/bc-child-youth-employment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childAge: 10,
        hasDirectorChildEmploymentPermit: false
      })
    });
    assert.equal(bcYouthPostRes.status, 200);
    const bcYouthPostData = await bcYouthPostRes.json();
    assert.equal(bcYouthPostData.isCompliant, false);

    const bcYouthUrl = baseUrl + '/v1/tools/bc-child-youth-employment';
    const youthCanonicalGet = await fetch(bcYouthUrl + '?childAge=13&hasParentalConsentInWriting=false&dailyHoursOnSchoolDay=4.25');
    const youthAliasPost = await fetch(bcYouthUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childAge: 13, parentConsent: 'false', schoolDayHours: 4.25 })
    });
    for (const response of [youthCanonicalGet, youthAliasPost]) {
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).statutoryViolations.map(v => v.violation),
        ['MISSING_PARENTAL_CONSENT', 'EXCEEDED_SCHOOL_DAY_MAX_HOURS']);
    }
    assert.equal((await fetch(bcYouthUrl + '?directorPermit=maybe')).status, 400);

    // 121. Ontario Human Rights Housing Creed Accommodation Navigator
    const onCreedGetRes = await fetch(`${baseUrl}/v1/tools/on-creed-accommodation?practiceCategory=SUKKAH_STRUCTURE_ON_BALCONY&sincere=true&refused=true&refusalGround=BUILDING_AESTHETICS`);
    assert.equal(onCreedGetRes.status, 200);
    const onCreedGetData = await onCreedGetRes.json();
    assert.equal(onCreedGetData.isHumanRightsBreachDetected, true);
    assert.equal(onCreedGetData.legalVerdict, 'ACTIONABLE_CREED_DISCRIMINATION_HRTO');

    const onCreedPostRes = await fetch(`${baseUrl}/v1/tools/on-creed-accommodation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creedPracticeCategory: 'SUKKAH_STRUCTURE_ON_BALCONY',
        isSincerelyHeldBelief: true,
        landlordRefusedAccommodation: true,
        landlordRefusalGround: 'UNMITIGATED_FIRE_SAFETY_RISK',
        landlordOfferedAlternativeReasonableAccommodation: true,
        alternativeAccommodationDescription: 'Dedicated courtyard space'
      })
    });
    assert.equal(onCreedPostRes.status, 200);
    const onCreedPostData = await onCreedPostRes.json();
    assert.equal(onCreedPostData.isHumanRightsBreachDetected, false);

    // 122. Federal Citizenship Physical Presence & Residence Audit Navigator
    const citPresenceGetRes = await fetch(`${baseUrl}/v1/tools/citizenship-residence-audit?daysPr=1100&daysTr=0&age=30`);
    assert.equal(citPresenceGetRes.status, 200);
    const citPresenceGetData = await citPresenceGetRes.json();
    assert.equal(citPresenceGetData.isEligible, true);
    assert.equal(citPresenceGetData.eligibilityVerdict, 'ELIGIBLE_FOR_CITIZENSHIP');

    const citPresencePostRes = await fetch(`${baseUrl}/v1/tools/citizenship-residence-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daysPresentAsPermanentResident: 600,
        daysPresentAsTemporaryResident: 200,
        applicantAge: 30
      })
    });
    assert.equal(citPresencePostRes.status, 200);
    const citPresencePostData = await citPresencePostRes.json();
    assert.equal(citPresencePostData.isEligible, false);
    assert.equal(citPresencePostData.eligibilityVerdict, 'INELIGIBLE_INSUFFICIENT_PRESENCE');

    // 123. Quebec CSQ Skilled Worker & Arrima Selection Navigator
    const qcArrimaGetRes = await fetch(`${baseUrl}/v1/tools/quebec-csq-arrima?education=bachelor_3_years&areaOfTraining=SECTION_B&experienceMonths=36&frenchListening=8&frenchSpeaking=7&age=28`);
    assert.equal(qcArrimaGetRes.status, 200);
    const qcArrimaGetData = await qcArrimaGetRes.json();
    assert.equal(qcArrimaGetData.isEligible, true);
    assert.equal(qcArrimaGetData.eligibilityVerdict, 'ELIGIBLE_FOR_CSQ_INVITATION');

    const qcArrimaPostRes = await fetch(`${baseUrl}/v1/tools/quebec-csq-arrima`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantAge: 30,
        frenchOralListeningNiveau: 5,
        frenchOralSpeakingNiveau: 5
      })
    });
    assert.equal(qcArrimaPostRes.status, 200);
    const qcArrimaPostData = await qcArrimaPostRes.json();
    assert.equal(qcArrimaPostData.isEligible, false);
    assert.equal(qcArrimaPostData.meetsMandatoryFrenchOralThreshold, false);

    // 124. Alberta Employment Rest Periods & Shift Limits Navigator
    const abRestGetRes = await fetch(`${baseUrl}/v1/tools/alberta-rest-periods?shiftHours=8&breakMinutes=30&interShiftHours=12&consecutiveDays=5`);
    assert.equal(abRestGetRes.status, 200);
    const abRestGetData = await abRestGetRes.json();
    assert.equal(abRestGetData.complianceStatus, 'BREAK_SCHEDULE_REVIEW_REQUIRED');

    const abRestPostRes = await fetch(`${baseUrl}/v1/tools/alberta-rest-periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftDurationHours: 10,
        restBreakMinutesProvided: 15,
        hoursBetweenConsecutiveShifts: 6
      })
    });
    assert.equal(abRestPostRes.status, 200);
    const abRestPostData = await abRestPostRes.json();
    assert.equal(abRestPostData.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');

    const restUrl = baseUrl + '/v1/tools/alberta-rest-periods';
    const restGet = await fetch(restUrl + '?shiftDurationHours=10&restBreakMinutesProvided=30&isManagerOrSupervisor=false');
    const restPost = await fetch(restUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftHours: 10, breakMinutes: 30, isManager: 'false' })
    });
    for (const response of [restGet, restPost]) {
      assert.equal(response.status, 200);
      assert.equal((await response.json()).shiftAudit.hasCompliantIntraShiftBreak, false);
    }
    for (const query of ['consecutiveDays=2.5', 'isManager=maybe', 'assessmentDate=2026-02-30']) {
      assert.equal((await fetch(restUrl + '?' + query)).status, 400);
    }

    // 125. British Columbia Strata Short-Term Rental Bylaw Navigator
    const bcStrGetRes = await fetch(`${baseUrl}/v1/tools/bc-strata-str?strataBylaw=true&stayDays=4&dailyFine=1000&daysFined=2&noticeProvided=true&hearingProvided=true`);
    assert.equal(bcStrGetRes.status, 200);
    const bcStrGetData = await bcStrGetRes.json();
    assert.equal(bcStrGetData.areFinesLegallyEnforceable, true);
    assert.equal(bcStrGetData.complianceStatus, 'UNLAWFUL_SHORT_TERM_RENTAL_ACTIVE');

    const bcStrPostRes = await fetch(`${baseUrl}/v1/tools/bc-strata-str`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hasRegisteredStrBylawProhibition: true,
        rentalStayDays: 4,
        dailyFineAmountCad: 500,
        receivedWrittenNoticeOfComplaint: false
      })
    });
    assert.equal(bcStrPostRes.status, 200);
    const bcStrPostData = await bcStrPostRes.json();
    assert.equal(bcStrPostData.areFinesLegallyEnforceable, false);
    assert.equal(bcStrPostData.complianceStatus, 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH');

    // 126. Ontario Temporary Help Agency & Recruiter Licensing Navigator
    const onThaGetRes = await fetch(`${baseUrl}/v1/tools/on-tha-licensing?role=CLIENT_EMPLOYER&isLicensed=true`);
    assert.equal(onThaGetRes.status, 200);
    const onThaGetData = await onThaGetRes.json();
    assert.equal(onThaGetData.isLicensingLawful, true);
    assert.equal(onThaGetData.complianceStatus, 'COMPLIANT_LICENSED_OPERATION');

    const onThaPostRes = await fetch(`${baseUrl}/v1/tools/on-tha-licensing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityRole: 'CLIENT_EMPLOYER',
        isAgencyLicensedByMlitst: false,
        hasApplicationInProcessWithTransitionStatus: false
      })
    });
    assert.equal(onThaPostRes.status, 200);
    const onThaPostData = await onThaPostRes.json();
    assert.equal(onThaPostData.isLicensingLawful, false);
    assert.equal(onThaPostData.penaltyAudit.estimatedAdminPenaltyCad, 15000);

    // 127. Federal Intra-Company Transferee (ICT) C12/C14 Exemption Navigator
    const ictGetRes = await fetch(`${baseUrl}/v1/tools/federal-ict-work-permit?relationship=SUBSIDIARY&role=EXECUTIVE_OR_SENIOR_MANAGER&foreignExpMonths=24&feePaid=true`);
    assert.equal(ictGetRes.status, 200);
    const ictGetData = await ictGetRes.json();
    assert.equal(ictGetData.isEligible, true);
    assert.equal(ictGetData.eligibilityVerdict, 'ELIGIBLE_FOR_ICT_WORK_PERMIT');

    const ictPostRes = await fetch(`${baseUrl}/v1/tools/federal-ict-work-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualifyingCorporateRelationship: 'UNRELATED',
        transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER'
      })
    });
    assert.equal(ictPostRes.status, 200);
    const ictPostData = await ictPostRes.json();
    assert.equal(ictPostData.isEligible, false);
    assert.equal(ictPostData.eligibilityVerdict, 'INELIGIBLE_NO_CORPORATE_LINK');

    // 128. Saskatchewan Employment Layoff Notice & Group Termination Navigator
    const skNoticeGetRes = await fetch(`${baseUrl}/v1/tools/saskatchewan-layoff-notice?serviceYears=4&weeklyWage=1000&actualNotice=4`);
    assert.equal(skNoticeGetRes.status, 200);
    const skNoticeGetData = await skNoticeGetRes.json();
    assert.equal(skNoticeGetData.complianceStatus, 'COMPLIANT_NOTICE_PROVIDED');
    assert.equal(skNoticeGetData.noticeCalculation.statutoryNoticeWeeksEntitled, 4);

    const skNoticePostRes = await fetch(`${baseUrl}/v1/tools/saskatchewan-layoff-notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yearsOfContinuousService: 10,
        regularWeeklyWageCad: 1000,
        actualNoticeWeeksGiven: 0
      })
    });
    assert.equal(skNoticePostRes.status, 200);
    const skNoticePostData = await skNoticePostRes.json();
    assert.equal(skNoticePostData.complianceStatus, 'NON_COMPLIANT_NOTICE_SHORTFALL');
    assert.equal(skNoticePostData.noticeCalculation.statutoryPayInLieuEntitledCad, 8000);

    // 129. Alberta Residential Tenancy Abandoned Goods & Disposal Navigator
    const abGoodsGetRes = await fetch(`${baseUrl}/v1/tools/alberta-abandoned-goods?value=800&daysElapsed=2&inventory=true`);
    assert.equal(abGoodsGetRes.status, 200);
    const abGoodsGetData = await abGoodsGetRes.json();
    assert.equal(abGoodsGetData.isAbove2000Threshold, false);
    assert.equal(abGoodsGetData.complianceStatus, 'COMPLIANT_STATUTORY_STORAGE_ACTIVE');

    const abGoodsPostRes = await fetch(`${baseUrl}/v1/tools/alberta-abandoned-goods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estimatedMarketValueCad: 4000,
        daysSinceLandlordTookPossession: 10,
        landlordDisposedBefore30Days: true
      })
    });
    assert.equal(abGoodsPostRes.status, 200);
    const abGoodsPostData = await abGoodsPostRes.json();
    assert.equal(abGoodsPostData.complianceStatus, 'UNLAWFUL_ABANDONED_GOODS_PRACTICE');

    // 130. British Columbia Employment Uniform & Equipment Deduction Navigator
    const bcUniformGetRes = await fetch(`${baseUrl}/v1/tools/bc-uniform-deductions?specialClothing=true&providedFree=true&cleanedOrAllowance=true`);
    assert.equal(bcUniformGetRes.status, 200);
    const bcUniformGetData = await bcUniformGetRes.json();
    assert.equal(bcUniformGetData.complianceStatus, 'COMPLIANT_NO_UNLAWFUL_DEDUCTIONS');

    const bcUniformPostRes = await fetch(`${baseUrl}/v1/tools/bc-uniform-deductions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requiresSpecialClothingOrUniform: true,
        employerProvidedUniformFreeOfCharge: false,
        uniformCostOrDepositChargedCad: 100,
        deductedForTillShortage: true,
        tillShortageDeductionCad: 50
      })
    });
    assert.equal(bcUniformPostRes.status, 200);
    const bcUniformPostData = await bcUniformPostRes.json();
    assert.equal(bcUniformPostData.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
    assert.equal(bcUniformPostData.totalUnlawfulDeductionsCad, 150);

    // 131. Federal Visitor Record Extension & Status Restoration Navigator
    const visExtGetRes = await fetch(`${baseUrl}/v1/tools/visitor-extension-restoration?statusExpiry=2026-12-31&submissionDate=2026-11-01`);
    assert.equal(visExtGetRes.status, 200);
    const visExtGetData = await visExtGetRes.json();
    assert.equal(visExtGetData.isInTimeExtension, true);
    assert.equal(visExtGetData.statusClassification, 'IN_TIME_EXTENSION_MAINTAINED_STATUS');

    const visExtPostRes = await fetch(`${baseUrl}/v1/tools/visitor-extension-restoration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statusExpiryDate: '2026-09-01',
        applicationSubmissionDate: '2026-10-01'
      })
    });
    assert.equal(visExtPostRes.status, 200);
    const visExtPostData = await visExtPostRes.json();
    assert.equal(visExtPostData.isWithin90DayRestorationWindow, true);
    assert.equal(visExtPostData.feeSchedule.restorationFeeCad, 229);

    // 132. British Columbia PNP Skills Immigration Tech Navigator
    const bcTechGetRes = await fetch(`${baseUrl}/v1/tools/bc-pnp-tech?noc=21231&duration=365&wage=50&medianWage=40&staff=10`);
    assert.equal(bcTechGetRes.status, 200);
    const bcTechGetData = await bcTechGetRes.json();
    assert.equal(bcTechGetData.isEligible, true);
    assert.equal(bcTechGetData.eligibilityVerdict, 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW');

    const bcTechPostRes = await fetch(`${baseUrl}/v1/tools/bc-pnp-tech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '65100',
        jobOfferDurationDays: 365
      })
    });
    assert.equal(bcTechPostRes.status, 200);
    const bcTechPostData = await bcTechPostRes.json();
    assert.equal(bcTechPostData.isEligible, false);
    assert.equal(bcTechPostData.eligibilityVerdict, 'INELIGIBLE_NON_TECH_NOC');

    // 133. Ontario Temporary Layoff & Deemed Termination Navigator
    const onLayoffGetRes = await fetch(`${baseUrl}/v1/tools/ontario-temp-layoff?weeks=10&benefits=true&contractClause=true&serviceYears=3`);
    assert.equal(onLayoffGetRes.status, 200);
    const onLayoffGetData = await onLayoffGetRes.json();
    assert.equal(onLayoffGetData.isDeemedTerminatedUnderEsa, false);
    assert.equal(onLayoffGetData.complianceStatus, 'COMPLIANT_TEMPORARY_LAYOFF_WITHIN_LIMITS');

    const onLayoffPostRes = await fetch(`${baseUrl}/v1/tools/ontario-temp-layoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layoffDurationWeeks: 14,
        employerContinuedHealthBenefits: false,
        yearsOfService: 5,
        regularWeeklyWageCad: 1000,
        employerOntarioPayrollOver2_5Million: true
      })
    });
    assert.equal(onLayoffPostRes.status, 200);
    const onLayoffPostData = await onLayoffPostRes.json();
    assert.equal(onLayoffPostData.isDeemedTerminatedUnderEsa, true);
    assert.equal(onLayoffPostData.complianceStatus, 'DEEMED_TERMINATION_STATUTORY_SEVERANCE_OWED');

    // 134. Federal C10 Significant Benefit LMIA-Exempt Work Permit Navigator
    const c10GetRes = await fetch(`${baseUrl}/v1/tools/federal-c10-significant-benefit?category=ECONOMIC&createsJobs=true&jobsCount=4&support=true&letters=4&achievements=true&businessPlan=true`);
    assert.equal(c10GetRes.status, 200);
    const c10GetData = await c10GetRes.json();
    assert.equal(c10GetData.isEligible, true);
    assert.equal(c10GetData.eligibilityVerdict, 'HIGH_EVIDENTIARY_BENEFIT_ESTABLISHED');

    const c10PostRes = await fetch(`${baseUrl}/v1/tools/federal-c10-significant-benefit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        benefitCategory: 'ECONOMIC',
        hasOfficialSupportFromCanadianGovernmentOrBody: false,
        hasDocumentedRecordOfDistinguishedAchievement: false,
        independentExpertTestimonialLettersCount: 1
      })
    });
    assert.equal(c10PostRes.status, 200);
    const c10PostData = await c10PostRes.json();
    assert.equal(c10PostData.isEligible, false);
    assert.equal(c10PostData.eligibilityVerdict, 'INSUFFICIENT_EVIDENCE_OF_SIGNIFICANT_BENEFIT');

    // 135. Alberta Employment Termination Just-Cause Audit Navigator
    const abCauseGetRes = await fetch(`${baseUrl}/v1/tools/alberta-just-cause?misconduct=CRIMINAL_THEFT_FRAUD&serviceYears=5&weeklyWage=1000`);
    assert.equal(abCauseGetRes.status, 200);
    const abCauseGetData = await abCauseGetRes.json();
    assert.equal(abCauseGetData.isJustCauseEstablished, true);
    assert.equal(abCauseGetData.complianceStatus, 'JUST_CAUSE_SUPPORTABLE_UNDER_MCKINLEY');

    const abCausePostRes = await fetch(`${baseUrl}/v1/tools/alberta-just-cause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        allegedMisconductCategory: 'PERFORMANCE_ISSUES',
        employerIssuedPriorWrittenWarnings: false,
        employeeGivenOpportunityToImprove: false,
        yearsOfContinuousService: 4,
        regularWeeklyWageCad: 1000
      })
    });
    assert.equal(abCausePostRes.status, 200);
    const abCausePostData = await abCausePostRes.json();
    assert.equal(abCausePostData.isJustCauseEstablished, false);
    assert.equal(abCausePostData.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 4000);

    // 136. Manitoba Residential Tenancy Rent Increase Guideline Navigator
    const mbRentGetRes = await fetch(`${baseUrl}/v1/tools/manitoba-rent-increase?currentRent=1000&proposedRent=1030&noticeMonths=3&monthsSinceLast=12&form2=true`);
    assert.equal(mbRentGetRes.status, 200);
    const mbRentGetData = await mbRentGetRes.json();
    assert.equal(mbRentGetData.complianceStatus, 'COMPLIANT_RENT_INCREASE');
    assert.equal(mbRentGetData.percentageIncrease, 3.0);

    const mbRentPostRes = await fetch(`${baseUrl}/v1/tools/manitoba-rent-increase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentMonthlyRentCad: 1000,
        proposedMonthlyRentCad: 1080,
        noticeMonthsGiven: 3,
        monthsSinceLastRentIncrease: 12,
        usedPrescribedForm2: true,
        hasApprovedAgiOrderFromRtb: false,
        buildingFirstOccupiedYear: 1995
      })
    });
    assert.equal(mbRentPostRes.status, 200);
    const mbRentPostData = await mbRentPostRes.json();
    assert.equal(mbRentPostData.complianceStatus, 'UNLAWFUL_RENT_INCREASE');
    assert.ok(mbRentPostData.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_ABOVE_GUIDELINE_INCREASE'));

    // 137. Federal Reciprocal Employment (C20) Work Permit Exemption Navigator
    const c20GetRes = await fetch(`${baseUrl}/v1/tools/federal-c20-reciprocal-work?category=ACADEMIC_EXCHANGE&agreement=true&opportunitiesAbroad=true&outCount=2&inCount=2`);
    assert.equal(c20GetRes.status, 200);
    const c20GetData = await c20GetRes.json();
    assert.equal(c20GetData.isEligible, true);
    assert.equal(c20GetData.eligibilityVerdict, 'ELIGIBLE_FOR_C20_RECIPROCAL_WORK_PERMIT');

    const c20PostRes = await fetch(`${baseUrl}/v1/tools/federal-c20-reciprocal-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hasFormalWrittenReciprocalAgreement: false
      })
    });
    assert.equal(c20PostRes.status, 200);
    const c20PostData = await c20PostRes.json();
    assert.equal(c20PostData.isEligible, false);
    assert.equal(c20PostData.eligibilityVerdict, 'INELIGIBLE_NO_RECIPROCAL_AGREEMENT');

    // 138. British Columbia Landlord-Use Eviction & 12-Month Penalty Navigator
    const bcEvictGetRes = await fetch(`${baseUrl}/v1/tools/bc-landlord-use-eviction?rent=2000&noticeMonths=4&daysElapsed=10&portal=true&occupant=CHILD_OR_PARENT`);
    assert.equal(bcEvictGetRes.status, 200);
    const bcEvictGetData = await bcEvictGetRes.json();
    assert.equal(bcEvictGetData.complianceStatus, 'COMPLIANT_NOTICE_AND_COMPENSATION');
    assert.equal(bcEvictGetData.isWithin30DayDisputeWindow, true);

    const bcEvictPostRes = await fetch(`${baseUrl}/v1/tools/bc-landlord-use-eviction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyRentCad: 2000,
        landlordFailedToOccupyFor12Months: true,
        extenuatingCircumstancesExist: false
      })
    });
    assert.equal(bcEvictPostRes.status, 200);
    const bcEvictPostData = await bcEvictPostRes.json();
    assert.equal(bcEvictPostData.isBadFaithPenaltyPayable, true);
    assert.equal(bcEvictPostData.compensationSummary.badFaith12MonthPenaltyCad, 24000);

    // 139. Ontario Employment Severance Pay & $2.5M Payroll Navigator
    const onSevGetRes = await fetch(`${baseUrl}/v1/tools/ontario-severance-payroll?years=6&months=6&wage=1000&payroll=3000000`);
    assert.equal(onSevGetRes.status, 200);
    const onSevGetData = await onSevGetRes.json();
    assert.equal(onSevGetData.isEligibleForSeverance, true);
    assert.equal(onSevGetData.severanceCalculation.cappedSeveranceWeeks, 6.5);
    assert.equal(onSevGetData.severanceCalculation.totalSeverancePayEntitledCad, 6500);

    const onSevPostRes = await fetch(`${baseUrl}/v1/tools/ontario-severance-payroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedYearsOfService: 30,
        additionalCompletedMonthsOfService: 0,
        regularWeeklyWageCad: 1000,
        employerOntarioAnnualPayrollCad: 5000000
      })
    });
    assert.equal(onSevPostRes.status, 200);
    const onSevPostData = await onSevPostRes.json();
    assert.equal(onSevPostData.isEligibleForSeverance, true);
    assert.equal(onSevPostData.severanceCalculation.cappedSeveranceWeeks, 26);

    // 140. Alberta Residential Tenancy Landlord Right of Entry Navigator
    const abEntryGetRes = await fetch(`${baseUrl}/v1/tools/alberta-landlord-entry?noticeHours=24&purpose=REPAIRS_OR_MAINTENANCE&day=Tuesday&hour=14`);
    assert.equal(abEntryGetRes.status, 200);
    const abEntryGetData = await abEntryGetRes.json();
    assert.equal(abEntryGetData.isEntryPermitted, true);
    assert.equal(abEntryGetData.complianceStatus, 'COMPLIANT_24H_ENTRY_NOTICE');

    const abEntryPostRes = await fetch(`${baseUrl}/v1/tools/alberta-landlord-entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noticeHoursGiven: 24,
        entryDayOfWeek: 'Sunday'
      })
    });
    assert.equal(abEntryPostRes.status, 200);
    const abEntryPostData = await abEntryPostRes.json();
    assert.equal(abEntryPostData.isEntryPermitted, false);
    assert.ok(abEntryPostData.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_ON_SUNDAY'));

    // 141. Federal Temporary Residence Dual Intent (IRPA s. 22(2)) Navigator
    const dualIntentGetRes = await fetch(`${baseUrl}/v1/tools/federal-dual-intent?appType=WORK_PERMIT&hasPrApp=true&prStream=EXPRESS_ENTRY_CEC`);
    assert.equal(dualIntentGetRes.status, 200);
    const dualIntentGetData = await dualIntentGetRes.json();
    assert.equal(dualIntentGetData.isDualIntentStatutorilyProtected, true);
    assert.equal(dualIntentGetData.riskTier, 'LOW_REFUSAL_RISK');

    const dualIntentPostRes = await fetch(`${baseUrl}/v1/tools/federal-dual-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officerRefusalBasedSolelyOnPrIntent: true
      })
    });
    assert.equal(dualIntentPostRes.status, 200);
    const dualIntentPostData = await dualIntentPostRes.json();
    assert.equal(dualIntentPostData.complianceStatus, 'UNLAWFUL_REFUSAL_CONTRARY_TO_SECTION_22');
    assert.ok(dualIntentPostData.statutoryViolations.some(v => v.rule === 'UNLAWFUL_OFFICER_FETTERING_ON_DUAL_INTENT'));

    // 142. Federal C11 Entrepreneur Work Permit Navigator
    const c11GetRes = await fetch(`${baseUrl}/v1/tools/federal-c11-entrepreneur-work-permit?ownership=51&control=true&capital=150000&staff=3`);
    assert.equal(c11GetRes.status, 200);
    const c11GetData = await c11GetRes.json();
    assert.equal(c11GetData.isEligible, true);
    assert.equal(c11GetData.eligibilityVerdict, 'ELIGIBLE_FOR_C11_WORK_PERMIT');

    const c11PostRes = await fetch(`${baseUrl}/v1/tools/federal-c11-entrepreneur-work-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessOwnershipPercentage: 20,
        hasControllingInterest: false
      })
    });
    assert.equal(c11PostRes.status, 200);
    const c11PostData = await c11PostRes.json();
    assert.equal(c11PostData.isEligible, false);
    assert.equal(c11PostData.eligibilityVerdict, 'INELIGIBLE_INSUFFICIENT_OWNERSHIP');

    // 143. Alberta Employment Maternity & Parental Leave Navigator
    const abLeaveGetRes = await fetch(`${baseUrl}/v1/tools/alberta-employment-maternity-parental-leave?leaveType=COMBINED_MATERNITY_PARENTAL&daysEmployed=180`);
    assert.equal(abLeaveGetRes.status, 200);
    const abLeaveGetData = await abLeaveGetRes.json();
    assert.equal(abLeaveGetData.isEligible, true);
    assert.equal(abLeaveGetData.complianceStatus, 'COMPLIANT_LEAVE_AND_JOB_PROTECTION');

    const abLeavePostRes = await fetch(`${baseUrl}/v1/tools/alberta-employment-maternity-parental-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consecutiveDaysOfEmployment: 200,
        employerRefusesReinstatement: true
      })
    });
    assert.equal(abLeavePostRes.status, 200);
    const abLeavePostData = await abLeavePostRes.json();
    assert.equal(abLeavePostData.complianceStatus, 'UNLAWFUL_EMPLOYER_LEAVE_OR_REINSTATEMENT_BREACH');
    assert.ok(abLeavePostData.statutoryViolations.some(v => v.rule === 'UNLAWFUL_DENIAL_OF_JOB_REINSTATEMENT'));

    // 144. Ontario Residential Tenancy Urgent Repairs & Form T6 Navigator
    const onT6GetRes = await fetch(`${baseUrl}/v1/tools/ontario-residential-tenancy-urgent-repairs-t6?vitalCut=false&temp=22&month=1`);
    assert.equal(onT6GetRes.status, 200);
    const onT6GetData = await onT6GetRes.json();
    assert.equal(onT6GetData.hasBreach, false);
    assert.equal(onT6GetData.complianceStatus, 'NO_UNRESOLVED_MAINTENANCE_BREACH_DETECTED');

    const onT6PostRes = await fetch(`${baseUrl}/v1/tools/ontario-residential-tenancy-urgent-repairs-t6`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vitalServiceInterrupted: true,
        monthlyRentCad: 2000,
        monthsOfDisrepair: 1,
        estimatedAbatementPercentage: 50
      })
    });
    assert.equal(onT6PostRes.status, 200);
    const onT6PostData = await onT6PostRes.json();
    assert.equal(onT6PostData.complianceStatus, 'URGENT_STATUTORY_MAINTENANCE_BREACH');
    assert.ok(onT6PostData.statutoryViolations.some(v => v.rule === 'ILLEGAL_VITAL_SERVICE_INTERRUPTION'));

    // 145. BC Employment Illness or Injury Leave Navigator
    const bcSickGetRes = await fetch(`${baseUrl}/v1/tools/british-columbia-employment-illness-injury-leave?daysEmployed=120&paidReq=1&wages30d=3200&daysWorked30d=20`);
    assert.equal(bcSickGetRes.status, 200);
    const bcSickGetData = await bcSickGetRes.json();
    assert.equal(bcSickGetData.meets90DayThreshold, true);
    assert.equal(bcSickGetData.complianceStatus, 'COMPLIANT_STATUTORY_SICK_LEAVE');
    assert.equal(bcSickGetData.leaveSummary.averageDailyWageCad, 160);

    const bcSickPostRes = await fetch(`${baseUrl}/v1/tools/british-columbia-employment-illness-injury-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consecutiveDaysEmployed: 150,
        paidSickDaysRequested: 1,
        employerRefusedPaidSickDays: true
      })
    });
    assert.equal(bcSickPostRes.status, 200);
    const bcSickPostData = await bcSickPostRes.json();
    assert.equal(bcSickPostData.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
    assert.ok(bcSickPostData.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE'));

    // 146. Federal Francophone Mobility C16 Expansion Navigator
    const c16GetRes = await fetch(`${baseUrl}/v1/tools/federal-francophone-mobility-c16?nclc=6&prov=ON&teer=4`);
    assert.equal(c16GetRes.status, 200);
    const c16GetData = await c16GetRes.json();
    assert.equal(c16GetData.isEligible, true);
    assert.equal(c16GetData.eligibilityVerdict, 'ELIGIBLE_FOR_C16_FRANCOPHONE_MOBILITY');

    const c16PostRes = await fetch(`${baseUrl}/v1/tools/federal-francophone-mobility-c16`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frenchOralNclcLevel: 3,
        destinationProvince: 'QC'
      })
    });
    assert.equal(c16PostRes.status, 200);
    const c16PostData = await c16PostRes.json();
    assert.equal(c16PostData.isEligible, false);
    assert.equal(c16PostData.eligibilityVerdict, 'INELIGIBLE_FOR_C16_LMIA_EXEMPTION');
    assert.ok(c16PostData.statutoryViolations.some(v => v.rule === 'BELOW_MINIMUM_FRENCH_ORAL_BENCHMARK'));
    assert.ok(c16PostData.statutoryViolations.some(v => v.rule === 'INELIGIBLE_DESTINATION_QUEBEC'));

    // 147. Federal BOWP PR Acknowledgement Navigator
    const bowpAorGetRes = await fetch(`${baseUrl}/v1/tools/federal-bowp-pr-acknowledgement?inCanada=true&daysExpiry=60&stream=EXPRESS_ENTRY_CEC`);
    assert.equal(bowpAorGetRes.status, 200);
    const bowpAorGetData = await bowpAorGetRes.json();
    assert.equal(bowpAorGetData.isEligible, true);
    assert.equal(bowpAorGetData.eligibilityVerdict, 'ELIGIBLE_FOR_BRIDGING_OPEN_WORK_PERMIT');

    const bowpAorPostRes = await fetch(`${baseUrl}/v1/tools/federal-bowp-pr-acknowledgement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daysUntilCurrentPermitExpires: 180,
        hasReceivedOfficialAor: false
      })
    });
    assert.equal(bowpAorPostRes.status, 200);
    const bowpAorPostData = await bowpAorPostRes.json();
    assert.equal(bowpAorPostData.isEligible, false);
    assert.ok(bowpAorPostData.statutoryViolations.some(v => v.rule === 'PREMATURE_BOWP_APPLICATION'));

    // 148. Ontario Rent Deposit Interest & Offset Navigator
    const onDepositGetRes = await fetch(`${baseUrl}/v1/tools/ontario-rent-deposit-interest?deposit=2000&rent=2050&years=1&rate=2.5&offsetIncrease=true`);
    assert.equal(onDepositGetRes.status, 200);
    const onDepositGetData = await onDepositGetRes.json();
    assert.equal(onDepositGetData.complianceStatus, 'COMPLIANT_RENT_DEPOSIT_MANAGEMENT');
    assert.equal(onDepositGetData.interestAudit.totalInterestAccruedCad, 50);

    const onDepositPostRes = await fetch(`${baseUrl}/v1/tools/ontario-rent-deposit-interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initialDepositAmountCad: 2000,
        currentMonthlyRentCad: 2000,
        tenancyDurationYears: 2,
        landlordPaidAnnualInterest: false,
        depositAppliedToLastMonthRentIncrease: false
      })
    });
    assert.equal(onDepositPostRes.status, 200);
    const onDepositPostData = await onDepositPostRes.json();
    assert.equal(onDepositPostData.complianceStatus, 'STATUTORY_RENT_DEPOSIT_VIOLATION');
    assert.ok(onDepositPostData.statutoryViolations.some(v => v.rule === 'UNPAID_ANNUAL_RENT_DEPOSIT_INTEREST'));

    // 149. Alberta General Holiday Pay Navigator
    const abHolidayGetRes = await fetch(`${baseUrl}/v1/tools/alberta-general-holiday-pay?holiday=CANADA_DAY&daysWorked=60&regularDay=true&wages4w=4000&paidActual=200`);
    assert.equal(abHolidayGetRes.status, 200);
    const abHolidayGetData = await abHolidayGetRes.json();
    assert.equal(abHolidayGetData.isEligibleForHolidayPay, true);
    assert.equal(abHolidayGetData.complianceStatus, 'COMPLIANT_HOLIDAY_PAY');

    const abHolidayPostRes = await fetch(`${baseUrl}/v1/tools/alberta-general-holiday-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workDaysInPast12Months: 15,
        isRegularDayOfWork: true
      })
    });
    assert.equal(abHolidayPostRes.status, 200);
    const abHolidayPostData = await abHolidayPostRes.json();
    assert.equal(abHolidayPostData.complianceStatus, 'INELIGIBLE_UNDER_30_DAYS_TENURE');

    // 150. BC Strata Depreciation & CRF Navigator
    const bcStrataGetRes = await fetch(`${baseUrl}/v1/tools/bc-strata-depreciation-crf?lots=30&yearsSinceReport=3&budget=100000&contrib=12000`);
    assert.equal(bcStrataGetRes.status, 200);
    const bcStrataGetData = await bcStrataGetRes.json();
    assert.equal(bcStrataGetData.complianceStatus, 'COMPLIANT_STRATA_CRF_AND_REPORT');

    const bcStrataPostRes = await fetch(`${baseUrl}/v1/tools/bc-strata-depreciation-crf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strataLotsCount: 20,
        yearsSinceLastDepreciationReport: 7
      })
    });
    assert.equal(bcStrataPostRes.status, 200);
    const bcStrataPostData = await bcStrataPostRes.json();
    assert.equal(bcStrataPostData.complianceStatus, 'STATUTORY_STRATA_GOVERNANCE_BREACH');
    assert.ok(bcStrataPostData.statutoryViolations.some(v => v.rule === 'OVERDUE_DEPRECIATION_REPORT'));

    // 151. Federal FTA Professional Work Permit Navigator
    const ftaGetRes = await fetch(`${baseUrl}/v1/tools/federal-fta-professional-work-permit?treaty=CUSMA&country=USA&contract=true&degree=true&years=5`);
    assert.equal(ftaGetRes.status, 200);
    const ftaGetData = await ftaGetRes.json();
    assert.equal(ftaGetData.isEligible, true);
    assert.equal(ftaGetData.exemptionCode, 'T23');

    const ftaPostRes = await fetch(`${baseUrl}/v1/tools/federal-fta-professional-work-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        treaty: 'CETA',
        applicantCitizenshipCountry: 'FRA',
        hasSignedServiceContractOrJobOffer: false
      })
    });
    assert.equal(ftaPostRes.status, 200);
    const ftaPostData = await ftaPostRes.json();
    assert.equal(ftaPostData.isEligible, false);
    assert.ok(ftaPostData.statutoryViolations.some(v => v.rule === 'MISSING_PREARRANGED_CONTRACT_OR_OFFER'));

    // 152. Ontario Employment Reprisal Navigator
    const onReprisalGetRes = await fetch(`${baseUrl}/v1/tools/ontario-employment-reprisal?action=ASKED_EMPLOYER_TO_COMPLY_WITH_ESA&adverse=TERMINATED_EMPLOYMENT&days=3&wage=1000&weeksLost=8&reinstatement=true&priorDiscipline=false`);
    assert.equal(onReprisalGetRes.status, 200);
    const onReprisalGetData = await onReprisalGetRes.json();
    assert.equal(onReprisalGetData.complianceStatus, 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED');
    assert.equal(onReprisalGetData.remedySummary.totalMonetaryRemedyCad, 10000);

    const onReprisalPostRes = await fetch(`${baseUrl}/v1/tools/ontario-employment-reprisal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protectedActionTaken: 'TOOK_OR_REQUESTED_STATUTORY_LEAVE',
        daysBetweenActionAndReprisal: 5,
        seeksJobReinstatement: false,
        employerProvidedDocumentedPerformanceIssuesPrior: false,
        employerAdverseAction: 'DEMOTED_OR_CUT_HOURS',
        regularWeeklyWageCad: 800,
        weeksOfLostIncome: 4
      })
    });
    assert.equal(onReprisalPostRes.status, 200);
    const onReprisalPostData = await onReprisalPostRes.json();
    assert.equal(onReprisalPostData.complianceStatus, 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED');
    assert.equal(onReprisalPostData.remedySummary.lostWagesCad, 3200);

    // 153. BC Security Deposit Double Penalty Navigator
    const bcDepositGetRes = await fetch(`${baseUrl}/v1/tools/bc-security-deposit-double-penalty?secDeposit=1000&daysSince=25&ended=true&forwarding=true`);
    assert.equal(bcDepositGetRes.status, 200);
    const bcDepositGetData = await bcDepositGetRes.json();
    assert.equal(bcDepositGetData.isDoublePenaltyMandatory, true);
    assert.equal(bcDepositGetData.financialSummary.grossPenaltyOwedCad, 2000);

    const bcDepositPostRes = await fetch(`${baseUrl}/v1/tools/bc-security-deposit-double-penalty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        securityDepositPaidCad: 1000,
        daysSinceForwardingAddressReceived: 10,
        landlordRefundedAmountCad: 1000
      })
    });
    assert.equal(bcDepositPostRes.status, 200);
    const bcDepositPostData = await bcDepositPostRes.json();
    assert.equal(bcDepositPostData.isDoublePenaltyMandatory, false);
    assert.equal(bcDepositPostData.complianceStatus, 'COMPLIANT_DEPOSIT_RETURN');

    // 154. Alberta Constructive Dismissal Navigator
    const abConstructiveGetRes = await fetch(`${baseUrl}/v1/tools/alberta-constructive-dismissal?prevSalary=80000&newSalary=64000&years=5`);
    assert.equal(abConstructiveGetRes.status, 200);
    const abConstructiveGetData = await abConstructiveGetRes.json();
    assert.equal(abConstructiveGetData.isConstructiveDismissal, true);
    assert.equal(abConstructiveGetData.complianceStatus, 'CONSTRUCTIVE_DISMISSAL_CONFIRMED');

    const abConstructivePostRes = await fetch(`${baseUrl}/v1/tools/alberta-constructive-dismissal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        previousAnnualSalaryCad: 80000,
        newAnnualSalaryCad: 64000,
        employeeAgreedToReduction: true
      })
    });
    assert.equal(abConstructivePostRes.status, 200);
    const abConstructivePostData = await abConstructivePostRes.json();
    assert.equal(abConstructivePostData.isConstructiveDismissal, false);
    assert.equal(abConstructivePostData.complianceStatus, 'MUTUAL_AGREEMENT_NO_DISMISSAL');

    // 155. Federal Start-Up Visa Peer Review Navigator
    const suvPeerGetRes = await fetch(`${baseUrl}/v1/tools/federal-suv-peer-review?entity=BUSINESS_INCUBATOR&equity=30&combined=70&founders=3`);
    assert.equal(suvPeerGetRes.status, 200);
    const suvPeerGetData = await suvPeerGetRes.json();
    assert.equal(suvPeerGetData.isEligible, true);
    assert.equal(suvPeerGetData.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA');

    const suvPeerPostRes = await fetch(`${baseUrl}/v1/tools/federal-suv-peer-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantVotingRightsPercentage: 8,
        totalFoundersAndEntityVotingPercentage: 55
      })
    });
    assert.equal(suvPeerPostRes.status, 200);
    const suvPeerPostData = await suvPeerPostRes.json();
    assert.equal(suvPeerPostData.isEligible, false);
    assert.ok(suvPeerPostData.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_FOUNDER_EQUITY_UNDER_10_PERCENT'));

    // 156. Saskatchewan Security Deposit Return Navigator
    const skDepositGetRes = await fetch(`${baseUrl}/v1/tools/saskatchewan-security-deposit-return?rent=1500&deposit=1500&daysSince=10&ended=true`);
    assert.equal(skDepositGetRes.status, 200);
    const skDepositGetData = await skDepositGetRes.json();
    assert.equal(skDepositGetData.landlordForfeitedRightToClaim, true);
    assert.equal(skDepositGetData.complianceStatus, 'LANDLORD_STATUTORY_FORFEITURE_CONFIRMED');

    const skDepositPostRes = await fetch(`${baseUrl}/v1/tools/saskatchewan-security-deposit-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyRentCad: 1400,
        securityDepositPaidCad: 1400,
        businessDaysSinceTenancyEnded: 4,
        landlordRefundedFullDeposit: true,
        amountActuallyRefundedCad: 1400
      })
    });
    assert.equal(skDepositPostRes.status, 200);
    const skDepositPostData = await skDepositPostRes.json();
    assert.equal(skDepositPostData.complianceStatus, 'COMPLIANT_DEPOSIT_ADMINISTRATION');
    assert.equal(skDepositPostData.financialSummary.balanceOwedToTenantCad, 0);

    // 157. Ontario Illegal Entry T2 Navigator
    const onEntryGetRes = await fetch(`${baseUrl}/v1/tools/ontario-illegal-entry-t2?written=true&hoursNotice=24&hour=14`);
    assert.equal(onEntryGetRes.status, 200);
    const onEntryGetData = await onEntryGetRes.json();
    assert.equal(onEntryGetData.isUnlawfulEntry, false);
    assert.equal(onEntryGetData.complianceStatus, 'COMPLIANT_LANDLORD_ENTRY');

    const onEntryPostRes = await fetch(`${baseUrl}/v1/tools/ontario-illegal-entry-t2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writtenNoticeGiven: true,
        noticeHoursGiven: 4,
        entryScheduledHour: 21,
        monthlyRentCad: 2000,
        outOfPocketExpensesCad: 150
      })
    });
    assert.equal(onEntryPostRes.status, 200);
    const onEntryPostData = await onEntryPostRes.json();
    assert.equal(onEntryPostData.isUnlawfulEntry, true);
    assert.equal(onEntryPostData.complianceStatus, 'UNLAWFUL_ENTRY_STATUTORY_BREACH');

    // 158. BC Overtime Banking Navigator
    const bcOtGetRes = await fetch(`${baseUrl}/v1/tools/bc-overtime-banking?wage=30&ot15=2&ot20=0&paidActual=90`);
    assert.equal(bcOtGetRes.status, 200);
    const bcOtGetData = await bcOtGetRes.json();
    assert.equal(bcOtGetData.complianceStatus, 'COMPLIANT_OVERTIME_ADMINISTRATION');
    assert.equal(bcOtGetData.overtimeCalculation.newOvertimeEarnedCad, 90);

    const bcOtPostRes = await fetch(`${baseUrl}/v1/tools/bc-overtime-banking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        regularHourlyWageCad: 30,
        dailyHoursWorkedOver8: 0,
        bankedHoursAlreadyAccumulated: 10,
        employmentTerminated: true
      })
    });
    assert.equal(bcOtPostRes.status, 200);
    const bcOtPostData = await bcOtPostRes.json();
    assert.equal(bcOtPostData.complianceStatus, 'OVERTIME_WAGE_STANDARDS_BREACH');
    assert.equal(bcOtPostData.overtimeCalculation.unpaidOvertimeDeficitCad, 300);

    const bcOtUrl = baseUrl + '/v1/tools/bc-overtime-banking';
    const bcCanonicalGet = await fetch(bcOtUrl + '?regularHourlyWageCad=20&dailyHoursWorkedOver8=3&wantsPaidTimeOffInsteadOfPay=true&employeeRequestedTimeBankInWriting=false');
    const bcAliasPost = await fetch(bcOtUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wage: 20, ot15: 3, timeOff: 'true', requestWritten: 'false' })
    });
    for (const response of [bcCanonicalGet, bcAliasPost]) {
      assert.equal(response.status, 200);
      const audit = await response.json();
      assert.equal(audit.overtimeCalculation.totalCashOwedImmediatelyCad, 90);
      assert.equal(audit.overtimeCalculation.totalBankedHours, 10);
    }
    assert.equal((await fetch(bcOtUrl + '?terminated=maybe')).status, 400);
    assert.equal((await fetch(bcOtUrl + '?wage=abc')).status, 400);

    // 159. Alberta Periodic Tenancy Notice Navigator
    const abPeriodicGetRes = await fetch(`${baseUrl}/v1/tools/alberta-periodic-tenancy-notice?party=LANDLORD&monthsNotice=3&reason=LANDLORD_OR_RELATIVE_OCCUPANCY`);
    assert.equal(abPeriodicGetRes.status, 200);
    const abPeriodicGetData = await abPeriodicGetRes.json();
    assert.equal(abPeriodicGetData.isValidNotice, true);
    assert.equal(abPeriodicGetData.complianceStatus, 'COMPLIANT_PERIODIC_NOTICE');

    const abPeriodicPostRes = await fetch(`${baseUrl}/v1/tools/alberta-periodic-tenancy-notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partyGivingNotice: 'LANDLORD',
        fullTenancyMonthsNoticeGiven: 1,
        landlordStatedReason: 'LANDLORD_OR_RELATIVE_OCCUPANCY'
      })
    });
    assert.equal(abPeriodicPostRes.status, 200);
    const abPeriodicPostData = await abPeriodicPostRes.json();
    assert.equal(abPeriodicPostData.isValidNotice, false);
    assert.equal(abPeriodicPostData.complianceStatus, 'DEFECTIVE_STATUTORY_TERMINATION_NOTICE');

    // 160. Federal Super Visa Insurance & LICO Navigator
    const svGetRes = await fetch(`${baseUrl}/v1/tools/federal-super-visa-insurance-lico?coverage=100000&income=65000&household=4`);
    assert.equal(svGetRes.status, 200);
    const svGetData = await svGetRes.json();
    assert.equal(svGetData.isEligible, true);
    assert.equal(svGetData.eligibilityVerdict, 'ELIGIBLE_FOR_SUPER_VISA');

    const svPostRes = await fetch(`${baseUrl}/v1/tools/federal-super-visa-insurance-lico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicalInsuranceCoverageCad: 50000,
        sponsorAnnualIncomeCad: 65000
      })
    });
    assert.equal(svPostRes.status, 200);
    const svPostData = await svPostRes.json();
    assert.equal(svPostData.isEligible, false);
    assert.ok(svPostData.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_MEDICAL_INSURANCE_COVERAGE'));

    // 161. Manitoba General Holiday Pay Navigator
    const mbHolidayGetRes = await fetch(`${baseUrl}/v1/tools/manitoba-general-holiday-pay?holiday=LOUIS_RIEL_DAY&wages4w=3600&paidActual=180`);
    assert.equal(mbHolidayGetRes.status, 200);
    const mbHolidayGetData = await mbHolidayGetRes.json();
    assert.equal(mbHolidayGetData.complianceStatus, 'COMPLIANT_GENERAL_HOLIDAY_PAY');
    assert.equal(mbHolidayGetData.holidayPayDetails.statutoryGeneralHolidayPayCad, 180);

    const mbHolidayPostRes = await fetch(`${baseUrl}/v1/tools/manitoba-general-holiday-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        holidayName: 'CANADA_DAY',
        grossWagesInPast4WeeksCad: 4000,
        workedOnHoliday: true,
        hoursWorkedOnHoliday: 8,
        regularHourlyWageCad: 25,
        holidayPayActuallyPaidCad: 200
      })
    });
    assert.equal(mbHolidayPostRes.status, 200);
    const mbHolidayPostData = await mbHolidayPostRes.json();
    assert.equal(mbHolidayPostData.complianceStatus, 'MANITOBA_HOLIDAY_WAGE_STANDARDS_BREACH');
    assert.equal(mbHolidayPostData.holidayPayDetails.wageDeficitCad, 300);

    const mbHolidayUrl = baseUrl + '/v1/tools/manitoba-general-holiday-pay';
    const mbCanonicalGet = await fetch(mbHolidayUrl + '?grossWagesInPast4WeeksCad=2000&absentWithoutConsentBeforeOrAfter=false');
    const mbAliasPost = await fetch(mbHolidayUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wages4w: 2000, absent: 'false' })
    });
    for (const response of [mbCanonicalGet, mbAliasPost]) {
      assert.equal(response.status, 200);
      assert.equal((await response.json()).holidayPayDetails.totalStatutoryEntitlementCad, 100);
    }
    for (const query of ['hours=25', 'worked=maybe', 'assessmentDate=2026-02-30']) {
      assert.equal((await fetch(mbHolidayUrl + '?' + query)).status, 400);
    }

    // 162. Federal Caregiver PR Pathway Navigator
    const caregiverGetRes = await fetch(`${baseUrl}/v1/tools/federal-caregiver-pr-pathway?noc=44100&monthsExp=12&weeklyHours=35&clbR=5&clbW=5&clbL=5&clbS=5`);
    assert.equal(caregiverGetRes.status, 200);
    const caregiverGetData = await caregiverGetRes.json();
    assert.equal(caregiverGetData.isEligible, true);
    assert.equal(caregiverGetData.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_PR');

    const caregiverPostRes = await fetch(`${baseUrl}/v1/tools/federal-caregiver-pr-pathway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nocCode: '44101',
        completedCanadianExperienceMonths: 8
      })
    });
    assert.equal(caregiverPostRes.status, 200);
    const caregiverPostData = await caregiverPostRes.json();
    assert.equal(caregiverPostData.isEligible, false);
    assert.ok(caregiverPostData.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_QUALIFYING_CANADIAN_WORK_EXPERIENCE'));

    // 163. Ontario Public Holiday Pay Navigator
    const onHolidayGetRes = await fetch(`${baseUrl}/v1/tools/ontario-public-holiday-pay?holiday=FAMILY_DAY&wages4w=3200&vacPay=128&paidActual=166.4`);
    assert.equal(onHolidayGetRes.status, 200);
    const onHolidayGetData = await onHolidayGetRes.json();
    assert.equal(onHolidayGetData.isQualified, true);
    assert.equal(onHolidayGetData.complianceStatus, 'COMPLIANT_PUBLIC_HOLIDAY_PAY');

    const onHolidayPostRes = await fetch(`${baseUrl}/v1/tools/ontario-public-holiday-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        holidayName: 'CHRISTMAS_DAY',
        regularWagesInPast4WeeksCad: 3200,
        vacationPayPayableInPast4WeeksCad: 0,
        workedShiftBeforeAndAfterHoliday: true,
        workedOnPublicHoliday: true,
        hoursWorkedOnHoliday: 8,
        regularHourlyWageCad: 20,
        holidayPayActuallyPaidCad: 160
      })
    });
    assert.equal(onHolidayPostRes.status, 200);
    const onHolidayPostData = await onHolidayPostRes.json();
    assert.equal(onHolidayPostData.complianceStatus, 'ONTARIO_PUBLIC_HOLIDAY_WAGE_BREACH');
    assert.equal(onHolidayPostData.calculationSummary.wageDeficitCad, 240);

    // 164. BC RTB Dispute Track Navigator
    const bcTrackGetRes = await fetch(`${baseUrl}/v1/tools/bc-rtb-dispute-track?category=TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION&lockout=true`);
    assert.equal(bcTrackGetRes.status, 200);
    const bcTrackGetData = await bcTrackGetRes.json();
    assert.equal(bcTrackGetData.qualifiesForExpeditedTrack, true);
    assert.equal(bcTrackGetData.hearingTrack, 'EXPEDITED_HEARING_TRACK');

    const bcTrackPostRes = await fetch(`${baseUrl}/v1/tools/bc-rtb-dispute-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isMonetaryClaimOnly: true
      })
    });
    assert.equal(bcTrackPostRes.status, 200);
    const bcTrackPostData = await bcTrackPostRes.json();
    assert.equal(bcTrackPostData.qualifiesForExpeditedTrack, false);
    assert.equal(bcTrackPostData.hearingTrack, 'STANDARD_DISPUTE_TRACK');

    // 165. Alberta Youth Employment Rules Navigator
    const abYouthGetRes = await fetch(`${baseUrl}/v1/tools/alberta-youth-employment-rules?age=14&job=RETAIL_CLERK&consent=true&schoolDay=true&hours=2`);
    assert.equal(abYouthGetRes.status, 200);
    const abYouthGetData = await abYouthGetRes.json();
    assert.equal(abYouthGetData.isCompliant, true);
    assert.equal(abYouthGetData.complianceStatus, 'COMPLIANT_YOUTH_EMPLOYMENT');

    const abYouthPostRes = await fetch(`${baseUrl}/v1/tools/alberta-youth-employment-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeAge: 12
      })
    });
    assert.equal(abYouthPostRes.status, 200);
    const abYouthPostData = await abYouthPostRes.json();
    assert.equal(abYouthPostData.isCompliant, false);
    assert.ok(abYouthPostData.statutoryViolations.some(v => v.rule === 'CHILD_UNDER_13_EMPLOYMENT_PROHIBITED'));

    // 166. Federal Student Off-Campus Work Navigator
    const studentWorkGetRes = await fetch(`${baseUrl}/v1/tools/federal-student-off-campus-work?permit=true&dliFullTime=true&inSession=true&hours=24`);
    assert.equal(studentWorkGetRes.status, 200);
    const studentWorkGetData = await studentWorkGetRes.json();
    assert.equal(studentWorkGetData.isCompliant, true);
    assert.equal(studentWorkGetData.complianceStatus, 'COMPLIANT_STUDENT_OFF_CAMPUS_WORK');

    const studentWorkPostRes = await fetch(`${baseUrl}/v1/tools/federal-student-off-campus-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isInRegularAcademicSession: true,
        isOnRegularlyScheduledBreak: false,
        weeklyHoursWorkedOffCampus: 30
      })
    });
    assert.equal(studentWorkPostRes.status, 200);
    const studentWorkPostData = await studentWorkPostRes.json();
    assert.equal(studentWorkPostData.isCompliant, false);
    assert.equal(studentWorkPostData.pgwpImpact.pgwpAtRisk, true);
    assert.ok(studentWorkPostData.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_HOUR_WEEKLY_OFF_CAMPUS_CAP'));
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
