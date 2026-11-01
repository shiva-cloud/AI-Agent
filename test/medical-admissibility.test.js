// test/medical-admissibility.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMedicalAdmissibility,
  ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD,
  FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD,
  EXEMPT_IMMIGRATION_CATEGORIES
} from '../src/medical-admissibility.js';

describe('Canadian Immigration Medical Inadmissibility & Excessive Demand Diagnostic', () => {
  it('statutory thresholds and exempt categories match IRCC standards', () => {
    assert.equal(ANNUAL_EXCESSIVE_DEMAND_THRESHOLD_CAD, 26304);
    assert.equal(FIVE_YEAR_EXCESSIVE_DEMAND_THRESHOLD_CAD, 131520);
    assert.ok(EXEMPT_IMMIGRATION_CATEGORIES.includes('spousal_sponsorship'));
    assert.ok(EXEMPT_IMMIGRATION_CATEGORIES.includes('dependent_child'));
    assert.ok(EXEMPT_IMMIGRATION_CATEGORIES.includes('protected_person_refugee'));
  });

  it('enforces 100% statutory exemption for spousal sponsorship under IRPA s. 38(2)', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'spousal_sponsorship',
      conditionName: 'Chronic Kidney Disease',
      estimatedAnnualMedicationCostCad: 45000 // Exceeds threshold, but exempt!
    });

    assert.equal(res.isStatutorilyExempt, true);
    assert.equal(res.determination, 'STATUTORILY_EXEMPT');
    assert.equal(res.statutoryExemptionBasis, 'IRPA s. 38(2)');
    assert.ok(res.summaryHeadline.includes('Exempt from the excessive-demand rule'));
  });

  it('enforces 100% statutory exemption for dependent children under IRPA s. 38(2)', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'dependent_child',
      conditionName: 'Type 1 Diabetes',
      estimatedAnnualMedicationCostCad: 12000
    });

    assert.equal(res.isStatutorilyExempt, true);
    assert.equal(res.determination, 'STATUTORILY_EXEMPT');
  });

  it('evaluates economic applicant with costs below statutory threshold as admissible', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'express_entry',
      conditionName: 'Well-Controlled Hypertension',
      estimatedAnnualMedicationCostCad: 1500
    });

    assert.equal(res.determination, 'ADMISSIBLE_BELOW_THRESHOLD');
    assert.equal(res.statutoryCostAudit.exceedsStatutoryThreshold, false);
    assert.equal(res.statutoryCostAudit.costExceededAnnualCad, 0);
  });

  it('evaluates mitigable excessive demand via private insurance under Hilewitz v. Canada', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'express_entry',
      conditionName: 'Crohn’s Disease (Biologics)',
      estimatedAnnualMedicationCostCad: 32000, // Exceeds $26,304
      hasPrivateInsuranceCoverage: true,
      privateInsuranceAnnualCoverageCad: 28000, // Brings public cost to $4,000
      availableLiquidFundsCad: 50000,
      receivedProceduralFairnessLetter: true,
      pflDateReceived: new Date().toISOString().slice(0, 10)
    });

    assert.equal(res.determination, 'PFL_RESPONSE_MITIGATION_REQUIRED');
    assert.equal(res.mitigationFeasibility.canMitigateExcessDemand, true);
    assert.equal(res.mitigationFeasibility.netAnnualPublicCostCad, 4000);
    assert.equal(res.proceduralFairnessClock.receivedPfl, true);
    assert.ok(res.proceduralFairnessClock.daysRemainingToRespond > 80);
    assert.ok(res.individualizedMitigationPlanDraft.includes('Hilewitz v. Canada'));
  });

  it('identifies unmitigated high-risk excessive demand for economic applicant', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'pnp',
      conditionName: 'Severe Refractory Condition',
      estimatedAnnualMedicationCostCad: 35000,
      hasPrivateInsuranceCoverage: false,
      availableLiquidFundsCad: 5000 // Inadequate to bridge 5 years ($43,480 deficit)
    });

    assert.equal(res.determination, 'HIGH_RISK_EXCESSIVE_DEMAND');
    assert.equal(res.statutoryCostAudit.exceedsStatutoryThreshold, true);
    assert.equal(res.mitigationFeasibility.canMitigateExcessDemand, false);
  });

  it('identifies danger to public health under IRPA s. 38(1)(a) regardless of stream', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'spousal_sponsorship',
      hasDangerToPublicHealth: true,
      conditionName: 'Active Pulmonary Tuberculosis'
    });

    assert.equal(res.determination, 'INADMISSIBLE_PUBLIC_DANGER');
    assert.ok(res.publicDangerAssessment.hasIssues);
    assert.ok(res.publicDangerAssessment.issues.some(i => i.ground.includes('Public Health')));
  });

  it('identifies danger to public safety under IRPA s. 38(1)(b)', () => {
    const res = evaluateMedicalAdmissibility({
      immigrationStream: 'express_entry',
      hasDangerToPublicSafety: true,
      conditionName: 'Severe Behavioral Impairment with History of Violence'
    });

    assert.equal(res.determination, 'INADMISSIBLE_PUBLIC_DANGER');
    assert.ok(res.publicDangerAssessment.issues.some(i => i.ground.includes('Public Safety')));
  });
});
