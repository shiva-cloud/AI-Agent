import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  auditIrccMinisterialInstructions,
  auditEsdcPrevailingWages,
  auditUsFederalRegisterNotices,
  auditUkHomeOfficeStatementOfChanges,
  auditAustraliaDhaGazette,
  syncCorridorMigrationRules,
  translatePolicyDelta,
  auditMultiCountryGazettes,
  MULTI_COUNTRY_GAZETTE_CONSTANTS
} from '../src/multi-country-gazette-crawler.js';
import {
  autoPopulateForm,
  OFFICIAL_FORM_TEMPLATES
} from '../src/official-forms.js';
import { compareCities, CANADIAN_METROS } from '../src/city-comparison.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Multi-Country Gazette Crawlers: parses IRCC, ESDC, US Federal Register, UK Home Office & Australia DHA gazettes', () => {
  // 1. IRCC Ministerial Instructions (Rec 101)
  const irccSample = 'Ministerial Instructions regarding Express Entry category-based selection for French proficiency and STEM occupations with provincial attestation letter quotas.';
  const irccResult = auditIrccMinisterialInstructions(irccSample);
  assert.ok(irccResult.totalNoticesDetected >= 2);
  assert.ok(irccResult.notices.some(n => n.type === 'express_entry_category'));
  assert.ok(irccResult.notices.some(n => n.type === 'study_permit_cap'));

  // 2. ESDC Prevailing Wage & LMIA Refusal Lists (Rec 102)
  const esdcLowWageRefused = auditEsdcPrevailingWages({
    offeredHourlyWageCad: 22.00,
    province: 'ON',
    cmaUnemploymentRatePercent: 6.5,
    lowWageWorkerPercentageInCompany: 25.0
  });
  assert.equal(esdcLowWageRefused.stream, 'LOW-WAGE STREAM');
  assert.equal(esdcLowWageRefused.provincialMedianWageCad, MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_MEDIAN_HOURLY_WAGES_2024_CAD.ON);
  assert.equal(esdcLowWageRefused.isLmiaProcessable, false);
  assert.equal(esdcLowWageRefused.maxWorkPermitDurationYears, 1);
  assert.ok(esdcLowWageRefused.refusalGrounds.length >= 2);

  const esdcHighWageApproved = auditEsdcPrevailingWages({
    offeredHourlyWageCad: 35.00,
    province: 'ON',
    cmaUnemploymentRatePercent: 7.0
  });
  assert.equal(esdcHighWageApproved.stream, 'HIGH-WAGE STREAM');
  assert.equal(esdcHighWageApproved.isLmiaProcessable, true);
  assert.equal(esdcHighWageApproved.maxWorkPermitDurationYears, 2);

  // 3. US Federal Register Immigration Notices (Rec 103)
  const usSample = 'USCIS Fee Schedule Final Rule establishing Asylum Program Fee and Form I-129 adjustments along with Temporary Protected Status extensions.';
  const usResult = auditUsFederalRegisterNotices(usSample);
  assert.equal(usResult.noticesFoundCount, 2);
  assert.ok(usResult.notices.some(n => n.type === 'fee_adjustment'));
  assert.ok(usResult.notices.some(n => n.type === 'tps_designation'));

  // 4. UK Home Office Statement of Changes (Rec 104)
  const ukSample = 'Statement of Changes in Immigration Rules HC 590 establishing £38,700 minimum salary threshold and Appendix Continuous Residence 180 days absence limit.';
  const ukResult = auditUkHomeOfficeStatementOfChanges(ukSample);
  assert.equal(ukResult.findingsCount, 2);
  assert.ok(ukResult.findings.some(f => f.type === 'skilled_worker_threshold'));
  assert.ok(ukResult.findings.some(f => f.type === 'settlement_absence_limit'));

  // 5. Australia Department of Home Affairs Migration Gazettes (Rec 105)
  const auSample = 'Migration Amendment Act strengthening employer compliance under Subclass 482 Condition 8607 180 days transfer window and TSMIT 73,150 salary floor.';
  const auResult = auditAustraliaDhaGazette(auSample);
  assert.equal(auResult.noticesCount, 2);
  assert.ok(auResult.notices.some(n => n.type === 'visa_condition_reform'));
  assert.ok(auResult.notices.some(n => n.type === 'tsmit_salary_floor'));
});

test('Corridor Migration Rules & Multilingual Policy Delta: verifies bilateral corridors and canonical translations', () => {
  // 1. Corridor Migration Rule Sync (Rec 113)
  const corridorInCa = syncCorridorMigrationRules({ originCountry: 'IN', destinationCountry: 'CA' });
  assert.equal(corridorInCa.corridorCode, 'IN_CA');
  assert.equal(corridorInCa.requirements.policeClearanceValidityMonths, 6);
  assert.equal(corridorInCa.requirements.biometricsValidityYears, 10);
  assert.ok(corridorInCa.requirements.primaryEducationAssessor.includes('WES'));

  const corridorNgUk = syncCorridorMigrationRules({ originCountry: 'NG', destinationCountry: 'UK' });
  assert.equal(corridorNgUk.corridorCode, 'NG_UK');
  assert.ok(corridorNgUk.requirements.primaryEducationAssessor.includes('UK ENIC'));

  // 2. Deterministic Multilingual Policy Delta Translation (Rec 119)
  const transHindi = translatePolicyDelta({ termKey: 'OVERTIME_PAY', targetLanguage: 'hi' });
  assert.equal(transHindi.targetLanguage, 'hi');
  assert.ok(transHindi.canonicalTranslation.includes('ओवरटाइम'));
  assert.equal(transHindi.isOfficialSynsetMatched, true);

  const transFrench = translatePolicyDelta({ termKey: 'CONSTRUCTIVE_DISMISSAL', targetLanguage: 'fr' });
  assert.equal(transFrench.canonicalTranslation, 'Congédiement déguisé');

  const transPunjabi = translatePolicyDelta({ termKey: 'RENT_INCREASE', targetLanguage: 'pa' });
  assert.ok(transPunjabi.canonicalTranslation.includes('ਕਿਰਾਏ'));

  const transSpanish = translatePolicyDelta({ termKey: 'SEVERANCE_PAY', targetLanguage: 'es' });
  assert.equal(transSpanish.canonicalTranslation, 'Indemnización por despido');

  const transChinese = translatePolicyDelta({ termKey: 'WORK_REFUSAL', targetLanguage: 'zh' });
  assert.ok(transChinese.canonicalTranslation.includes('拒绝不安全工作'));
});

test('Official Forms Auto-Population Engine: auto-populates statutory forms and generates vector PDF 1.4', () => {
  // 1. CBSA BSF186 (Settler Goods B4)
  const formBsf186 = autoPopulateForm({
    formType: 'cbsa_bsf186',
    fieldOverrides: {
      importerName: 'Patel, Aarav',
      totalDeclaredCAD: '15500.00'
    },
    declarantDate: '2026-10-31'
  });
  assert.equal(formBsf186.formType, 'cbsa_bsf186');
  assert.equal(formBsf186.formNumber, 'FORM BSF186 (B4)');
  assert.ok(formBsf186.pdfByteSize > 500);
  assert.ok(formBsf186.pdfBase64.length > 500);
  assert.ok(formBsf186.printReadyHtml.includes('Patel, Aarav'));
  assert.ok(formBsf186.printReadyHtml.includes('15500.00'));

  // 2. Ontario LTB Form T1 (Illegal Rent Refund)
  const formT1 = autoPopulateForm({
    formType: 'ltb_t1',
    fieldOverrides: {
      tenantName: 'John Doe',
      rebateClaimed: '5000.00'
    }
  });
  assert.equal(formT1.formNumber, 'FORM T1');
  assert.ok(formT1.statuteBasis.includes('Residential Tenancies Act'));
  assert.ok(formT1.populatedFields.some(f => f.val === 'John Doe'));

  // 3. CRA Form RC151 (Newcomer GST/HST & Carbon Rebate)
  const formRc151 = autoPopulateForm({
    formType: 'cra_rc151'
  });
  assert.equal(formRc151.formNumber, 'FORM RC151');
  assert.ok(formRc151.organization.includes('Canada Revenue Agency'));
});

test('City Comparison Differential Engine: compares Canadian landing hubs across rent, taxes, healthcare, and transit', () => {
  const comparison = compareCities(['Toronto', 'Calgary'], { annualSalary: 90000, householdSize: 2 });
  assert.equal(comparison.asOf, '2026-10-31');
  assert.equal(comparison.comparison.length, 2);

  const toronto = comparison.comparison.find(c => c.city === 'Toronto');
  const calgary = comparison.comparison.find(c => c.city === 'Calgary');

  assert.equal(toronto.provinceCode, 'ON');
  assert.equal(calgary.provinceCode, 'AB');
  assert.ok(toronto.projectedMonthlyRent > calgary.projectedMonthlyRent);
  assert.ok(comparison.differential.annualEstimatedSavings > 0);
  assert.equal(comparison.differential.cheaperCity, 'Calgary');
  assert.equal(comparison.differential.salesTaxAdvantage, 'Calgary');
});

test('PWA Service Worker & Offline SOS Kit: verifies offline fallback page and service worker caching', () => {
  // 1. Verify public/offline.html
  assert.ok(existsSync('public/offline.html'), 'public/offline.html must exist on disk');
  const offlineHtml = readFileSync('public/offline.html', 'utf8');
  assert.ok(offlineHtml.includes('Offline Emergency Settlement & SOS Guide'));
  assert.ok(offlineHtml.includes('RTA 2006, s. 24'));
  assert.ok(offlineHtml.includes('Canadian Anti-Fraud Centre'));
  assert.ok(offlineHtml.includes('OHSA s. 43'));
  assert.ok(offlineHtml.includes('Community Health Centres'));
  assert.ok(offlineHtml.includes('911'));

  // 2. Verify public/sw.js
  const swJs = readFileSync('public/sw.js', 'utf8');
  assert.ok(swJs.includes('/offline.html'), 'Service worker must precache /offline.html');
  assert.ok(swJs.includes("event.request.mode === 'navigate'"), 'Service worker must intercept navigation requests');
});

test('Batch 6 HTTP Endpoints: GET and POST integration for city-comparison, form-autopopulate, and gazettes', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. City Comparison (GET & POST)
    const resGetCity = await fetch(`${baseUrl}/v1/tools/city-comparison?cities=Toronto,Calgary&salary=85000&household=2`);
    assert.equal(resGetCity.status, 200);
    const bodyGetCity = await resGetCity.json();
    assert.equal(bodyGetCity.comparison.length, 2);
    assert.equal(bodyGetCity.differential.cheaperCity, 'Calgary');

    const resPostCity = await fetch(`${baseUrl}/v1/tools/city-comparison`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cities: ['Vancouver', 'Calgary'],
        annualSalary: 100000,
        householdSize: 1
      })
    });
    assert.equal(resPostCity.status, 200);
    const bodyPostCity = await resPostCity.json();
    assert.equal(bodyPostCity.comparison.length, 2);

    // 2. Form Auto-Population (GET & POST)
    const resGetForm = await fetch(`${baseUrl}/v1/tools/form-autopopulate?formType=cbsa_bsf186`);
    assert.equal(resGetForm.status, 200);
    const bodyGetForm = await resGetForm.json();
    assert.equal(bodyGetForm.formType, 'cbsa_bsf186');
    assert.ok(bodyGetForm.pdfByteSize > 0);

    const resPostForm = await fetch(`${baseUrl}/v1/tools/form-autopopulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: 'ltb_t2',
        fieldOverrides: {
          tenantName: 'Sarah Jenkins',
          abatementClaimed: '3000.00'
        }
      })
    });
    assert.equal(resPostForm.status, 200);
    const bodyPostForm = await resPostForm.json();
    assert.equal(bodyPostForm.formType, 'ltb_t2');
    assert.ok(bodyPostForm.printReadyHtml.includes('Sarah Jenkins'));

    // 3. Multi-Country Gazettes (GET & POST)
    const resGetGazette = await fetch(`${baseUrl}/v1/realtime/gazettes?country=CA`);
    assert.equal(resGetGazette.status, 200);
    const bodyGetGazette = await resGetGazette.json();
    assert.equal(bodyGetGazette.country, 'CA');

    const resPostGazetteCorridor = await fetch(`${baseUrl}/v1/realtime/gazettes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: 'CA',
        action: 'corridor',
        originCountry: 'IN',
        destinationCountry: 'CA'
      })
    });
    assert.equal(resPostGazetteCorridor.status, 200);
    const bodyPostGazette = await resPostGazetteCorridor.json();
    assert.equal(bodyPostGazette.corridorCode, 'IN_CA');

    const resPostGazetteTranslate = await fetch(`${baseUrl}/v1/realtime/gazettes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: 'CA',
        action: 'translate',
        termKey: 'VACATION_PAY',
        targetLanguage: 'hi'
      })
    });
    assert.equal(resPostGazetteTranslate.status, 200);
    const bodyPostTranslate = await resPostGazetteTranslate.json();
    assert.ok(bodyPostTranslate.canonicalTranslation.includes('अवकाश'));

  } finally {
    await new Promise(res => server.close(res));
  }
});
