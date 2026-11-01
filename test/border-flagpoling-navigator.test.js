import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateFlagpolingFeasibility,
  CBSA_PORTS,
  TRV_EXEMPT_COUNTRIES
} from '../src/border-flagpoling-navigator.js';

test('Flagpoling Navigator — Port registry and TRV exempt list', () => {
  assert.ok(CBSA_PORTS.rainbow_bridge);
  assert.ok(CBSA_PORTS.pacific_highway_surrey);
  assert.ok(TRV_EXEMPT_COUNTRIES.has('US'));
  assert.ok(TRV_EXEMPT_COUNTRIES.has('FR'));
  assert.ok(!TRV_EXEMPT_COUNTRIES.has('IN'));
});

test('Flagpoling Navigator — Strictly bars PGWP applications under June 2024 Ministerial Policy', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'pgwp',
    countryOfCitizenship: 'IN',
    currentStatusInCanada: 'valid_study_permit',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Wednesday'
  });

  assert.equal(result.determination, 'STRICTLY_BARRED');
  assert.equal(result.pgwpBorderBanApplied, true);
  assert.ok(result.legalBarriers.some(b => b.rule.includes('June 21, 2024')));
  assert.ok(result.summary.includes('strictly barred'));
});

test('Flagpoling Navigator — Detects Maintained Status revocation hazard under IRPR s. 183(5)', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'lmia_exempt_work_permit',
    countryOfCitizenship: 'US',
    currentStatusInCanada: 'maintained_status',
    portOfEntry: 'peace_bridge',
    dayOfWeek: 'Thursday',
    isLmiaExempt: true
  });

  assert.equal(result.maintainedStatusAtRisk, true);
  assert.equal(result.determination, 'HIGH_RISK_NOT_RECOMMENDED');
  assert.ok(result.warnings.some(w => w.statute.includes('IRPR s. 183(5)')));
});

test('Flagpoling Navigator — Strictly bars out of status foreign nationals from POE processing', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'lmia_backed_work_permit',
    countryOfCitizenship: 'US',
    currentStatusInCanada: 'out_of_status',
    portOfEntry: 'peace_arch_douglas',
    dayOfWeek: 'Tuesday'
  });

  assert.equal(result.determination, 'STRICTLY_BARRED');
  assert.ok(result.legalBarriers.some(b => b.rule.includes('IRPR s. 182')));
});

test('Flagpoling Navigator — Identifies non-operating flagpoling days for designated ports', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'lmia_exempt_work_permit',
    countryOfCitizenship: 'US',
    currentStatusInCanada: 'valid_visitor_record',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Monday', // Rainbow Bridge only processes Tue, Wed, Thu
    isLmiaExempt: true
  });

  assert.equal(result.isOperatingDay, false);
  assert.equal(result.determination, 'TEMPORARILY_BLOCKED');
  assert.ok(result.warnings.some(w => w.level === 'OPERATIONAL_BLOCK'));
});

test('Flagpoling Navigator — Enforces IRPR s. 198 TRV-exempt requirements for border work permits', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'lmia_backed_work_permit',
    countryOfCitizenship: 'IN', // Not TRV exempt
    currentStatusInCanada: 'valid_work_permit',
    portOfEntry: 'queenston_lewiston',
    dayOfWeek: 'Wednesday',
    hasApprovedLmia: true
  });

  assert.equal(result.determination, 'INELIGIBLE_AT_BORDER');
  assert.equal(result.isTrvExempt, false);
  assert.ok(result.warnings.some(w => w.statute.includes('IRPR s. 198(1)')));
});

test('Flagpoling Navigator — Confirms eligibility for US citizen LMIA-exempt work permit', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'lmia_exempt_work_permit',
    countryOfCitizenship: 'US',
    currentStatusInCanada: 'valid_visitor_record',
    portOfEntry: 'rainbow_bridge',
    dayOfWeek: 'Wednesday',
    isLmiaExempt: true,
    hasValidUsVisa: true
  });

  assert.equal(result.determination, 'ELIGIBLE_FOR_POE_PROCESSING');
  assert.equal(result.isOperatingDay, true);
  assert.ok(result.requiredDocuments.some(d => d.includes('A-number')));
  assert.ok(result.statutoryReferences.some(s => s.includes('IRPA s. 40')));
});

test('Flagpoling Navigator — Highlights US CBP Administrative Refusal & IRPA s. 40 Duty of Candour', () => {
  const result = evaluateFlagpolingFeasibility({
    permitCategory: 'pr_landing',
    countryOfCitizenship: 'US',
    currentStatusInCanada: 'valid_work_permit',
    portOfEntry: 'pacific_highway_surrey',
    dayOfWeek: 'Tuesday',
    hasValidUsVisa: false
  });

  assert.equal(result.determination, 'ELIGIBLE_FOR_POE_PROCESSING');
  assert.ok(result.usAdministrativeRefusalImpact.formName.includes('CBP Form I-160A'));
  assert.ok(result.usAdministrativeRefusalImpact.misrepresentationConsequence.includes('5-year inadmissibility ban'));
  assert.ok(result.requiredDocuments.some(d => d.includes('IMM 5688')));
});
