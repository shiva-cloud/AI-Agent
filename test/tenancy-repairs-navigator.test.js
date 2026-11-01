import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TENANCY_REPAIR_CONSTANTS,
  REPAIR_ISSUE_TAXONOMY,
  evaluateTenancyRepairs
} from '../src/tenancy-repairs-navigator.js';

test('Tenancy Repairs Navigator — Statutory constants match Ontario & BC regulations', () => {
  assert.equal(TENANCY_REPAIR_CONSTANTS.ONTARIO_MIN_TEMP_CELSIUS, 20);
  assert.equal(TENANCY_REPAIR_CONSTANTS.TORONTO_MIN_TEMP_CELSIUS, 21);
  assert.equal(TENANCY_REPAIR_CONSTANTS.ONTARIO_MIN_HOT_WATER_CELSIUS, 43);
  assert.equal(TENANCY_REPAIR_CONSTANTS.ONTARIO_LTB_T6_FILING_FEE_CAD, 53);
  assert.equal(TENANCY_REPAIR_CONSTANTS.ONTARIO_LIMITATION_YEARS, 1);
  assert.ok(REPAIR_ISSUE_TAXONOMY.no_heat_winter);
  assert.ok(REPAIR_ISSUE_TAXONOMY.vital_service_shutoff);
});

test('Tenancy Repairs Navigator — Evaluates winter heat deprivation vital services breach', () => {
  const result = evaluateTenancyRepairs({
    province: 'ON',
    monthlyRentCad: 2400,
    issues: ['no_heat_winter'],
    daysUnresolved: 15,
    outOfPocketExpensesCad: 150,
    hasWithheldRent: false,
    hasNotifiedLandlordInWriting: true,
    hasCalledCityInspector: false,
    tenantName: 'Elena Rostova',
    landlordName: 'Apex Properties Ltd.',
    rentalAddress: '120 Bloor St E, Toronto, ON'
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.governingTribunal, 'Ontario Landlord and Tenant Board (LTB)');
  assert.equal(result.applicationForm, 'Form T6 (Tenant Application about Maintenance)');
  assert.equal(result.hasVitalServiceBreach, true);
  assert.equal(result.hasCriticalUrgency, true);
  assert.equal(result.rentWithholdingRisk, 'none');

  // Daily rent is 2400 / 30 = 80. For 15 days, base rent is 1200.
  // min abatement is 50% = 600, max is 100% = 1200.
  assert.equal(result.abatementEstimate.minPercentage, 50);
  assert.equal(result.abatementEstimate.maxPercentage, 100);
  assert.equal(result.abatementEstimate.estimatedMinAbatementCad, 600);
  assert.equal(result.abatementEstimate.estimatedMaxAbatementCad, 1200);
  assert.equal(result.abatementEstimate.totalPotentialRemedyMinCad, 750);
  assert.equal(result.abatementEstimate.totalPotentialRemedyMaxCad, 1350);

  // Check RHEU notification and 311 advice
  assert.ok(result.proceduralRemedies.some(r => r.title.includes('RHEU')));
  assert.ok(result.proceduralRemedies.some(r => r.title.includes('311')));
  assert.ok(result.noticeOfDisrepairDocument.includes('Elena Rostova'));
  assert.ok(result.noticeOfDisrepairDocument.includes('Apex Properties Ltd.'));
});

test('Tenancy Repairs Navigator — Flags critical eviction hazard if tenant unilaterally withheld rent', () => {
  const result = evaluateTenancyRepairs({
    province: 'ON',
    monthlyRentCad: 2000,
    issues: ['water_leak_mold'],
    daysUnresolved: 20,
    hasWithheldRent: true,
    withheldAmountCad: 2000
  });

  assert.equal(result.hasWithheldRent, true);
  assert.equal(result.rentWithholdingRisk, 'severe');
  const withholdingWarning = result.legalWarnings.find(w => w.code === 'ILLEGAL_RENT_WITHHOLDING');
  assert.ok(withholdingWarning);
  assert.ok(withholdingWarning.message.includes('Form N4'));
  assert.ok(withholdingWarning.message.includes('unilaterally withhold rent'));
});

test('Tenancy Repairs Navigator — Warns of missing written notice and 1-year LTB limitation', () => {
  const result = evaluateTenancyRepairs({
    province: 'ON',
    monthlyRentCad: 1800,
    issues: ['severe_pest_infestation'],
    daysUnresolved: 400,
    hasNotifiedLandlordInWriting: false
  });

  const writtenNoticeWarning = result.legalWarnings.find(w => w.code === 'NO_WRITTEN_NOTICE');
  assert.ok(writtenNoticeWarning);
  const limitationWarning = result.legalWarnings.find(w => w.code === 'LIMITATION_PERIOD_EXCEEDED');
  assert.ok(limitationWarning);
  assert.ok(limitationWarning.message.includes('1 year'));
});

test('Tenancy Repairs Navigator — Calculates compound abatement for multiple concurrent issues', () => {
  const result = evaluateTenancyRepairs({
    province: 'ON',
    monthlyRentCad: 3000,
    issues: ['severe_pest_infestation', 'water_leak_mold', 'broken_appliance_essential'],
    daysUnresolved: 30
  });

  assert.equal(result.recognizedIssues.length, 3);
  // Highest base is water_leak_mold (20-40) or pest (15-35).
  // With 2 extra issues, bonus is added.
  assert.ok(result.abatementEstimate.minPercentage >= 25);
  assert.ok(result.abatementEstimate.maxPercentage >= 50);
});

test('Tenancy Repairs Navigator — Applies British Columbia RTB s. 33 emergency repair rights', () => {
  const result = evaluateTenancyRepairs({
    province: 'BC',
    monthlyRentCad: 2200,
    issues: ['no_heat_winter'],
    daysUnresolved: 5
  });

  assert.equal(result.province, 'BC');
  assert.equal(result.governingTribunal, 'British Columbia Residential Tenancy Branch (RTB)');
  assert.ok(result.proceduralRemedies.some(r => r.title.includes('BC RTA s. 33')));
});
