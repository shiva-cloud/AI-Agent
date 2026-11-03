import test from 'node:test';
import assert from 'node:assert/strict';
import {buildWizardPlan} from '../public/app/wizard-plan.js';
import {COUNTRY_CITIES} from '../public/app/data.js';

test('wizard does not infer monetary requirements or legal deadlines for any destination/status', () => {
  for (const country of [...Object.keys(COUNTRY_CITIES), 'Unknown', 'constructor']) {
    for (const status of ['student', 'worker', 'pr_applicant', 'family_super_visa', 'visitor', 'constructor']) {
      const plan = buildWizardPlan(country, status);
      assert.equal(plan.fundsBenchmarkText, 'Not determined by this wizard');
      assert.doesNotMatch(JSON.stringify(plan), /20,635|38,700|AED|Series-9|T1135|Day 180|immediate health/i);
      if (!['Canada', 'United States', 'United Kingdom', 'Australia'].includes(country)) assert.deepEqual(plan.recTools, []);
      if (status === 'visitor' || status === 'constructor') assert.deepEqual(plan.recTools, []);
    }
  }
});
test('wizard recommendations match explicit country and pathway rather than fallback jurisdiction', () => {
  assert.deepEqual(buildWizardPlan('Canada', 'worker').recTools.map(tool => tool.id), ['lmia-readiness']);
  assert.deepEqual(buildWizardPlan('United Kingdom', 'worker').recTools.map(tool => tool.id), ['uk-skilled-worker']);
  assert.deepEqual(buildWizardPlan('United Kingdom', 'student').recTools, []);
  assert.match(buildWizardPlan('Japan', 'worker').toolNotice, /No route-matched/);
});
