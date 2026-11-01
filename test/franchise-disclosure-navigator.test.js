import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FRANCHISE_ACT_CONSTANTS,
  PROVINCIAL_FRANCHISE_ACTS,
  evaluateFranchiseDisclosure,
  generateFranchiseRescissionNotice
} from '../src/franchise-disclosure-navigator.js';

test('Franchise Disclosure Navigator — Constants reflect Arthur Wishart Act statutory benchmarks', () => {
  assert.equal(FRANCHISE_ACT_CONSTANTS.MANDATORY_FDD_DAYS, 14);
  assert.equal(FRANCHISE_ACT_CONSTANTS.SHORT_RESCISSION_DAYS, 60);
  assert.equal(FRANCHISE_ACT_CONSTANTS.ABSOLUTE_RESCISSION_YEARS, 2);
  assert.equal(FRANCHISE_ACT_CONSTANTS.REFUND_COMPLIANCE_DAYS, 30);

  assert.ok(PROVINCIAL_FRANCHISE_ACTS.ON);
  assert.ok(PROVINCIAL_FRANCHISE_ACTS.BC);
});

test('Franchise Disclosure Navigator — Triggers 2-year absolute rescission and calculates full statutory restitution under s. 6(6)', () => {
  const result = evaluateFranchiseDisclosure({
    province: 'ON',
    agreementSignedDate: '2025-11-01',
    fddDeliveredDate: '2025-10-15',
    hasAuditedFinancialStatements: false, // Fatal defect!
    hasSignedFranchisorCertificate: false, // Fatal defect!
    initialFranchiseFeePaidCad: 50000,
    equipmentAndBuildoutCostCad: 200000,
    inventoryPurchasedAtCostCad: 30000,
    cumulativeOperatingLossesCad: 70000,
    assessmentDate: '2026-10-31' // ~1 year later, within 2 years
  });

  assert.equal(result.disclosureAudit.isFatallyDefective, true);
  assert.equal(result.rescissionAnalysis.canRescindNow, true);
  assert.equal(result.rescissionAnalysis.rescissionVerdict, 'TWO_YEAR_ABSOLUTE_RESCISSION_ACTIVE');
  // 50k + 200k + 30k + 70k = 350k
  assert.equal(result.statutoryDamagesEstimate.totalRestitutionOwedCad, 350000);
  assert.ok(result.statutoryProtections.some(p => p.includes('ABSOLUTE RESCISSION RIGHT ACTIVE')));
});

test('Franchise Disclosure Navigator — Identifies compliant disclosure with zero rescission rights', () => {
  const result = evaluateFranchiseDisclosure({
    province: 'ON',
    agreementSignedDate: '2025-10-01',
    fddDeliveredDate: '2025-09-10', // 21 days before (>= 14)
    wasFddDeliveredAsSingleDocument: true,
    hasAuditedFinancialStatements: true,
    hasSignedFranchisorCertificate: true
  });

  assert.equal(result.disclosureAudit.isFatallyDefective, false);
  assert.equal(result.rescissionAnalysis.canRescindNow, false);
  assert.equal(result.rescissionAnalysis.rescissionVerdict, 'COMPLIANT_DISCLOSURE');
  assert.equal(result.statutoryDamagesEstimate.totalRestitutionOwedCad, 0);
  assert.equal(result.deficiencies.length, 0);
});

test('Franchise Disclosure Navigator — Generates formal statutory Notice of Rescission', () => {
  const notice = generateFranchiseRescissionNotice({
    franchiseeName: 'Sunrise QSR Inc.',
    franchisorName: 'Burger Brands Canada Inc.',
    totalRestitutionCad: 420000,
    province: 'ON'
  });

  assert.ok(notice.includes('FORMAL STATUTORY NOTICE OF RESCISSION'));
  assert.ok(notice.includes('ARTHUR WISHART ACT s. 6'));
  assert.ok(notice.includes('Sunrise QSR Inc.'));
  assert.ok(notice.includes('$420000 CAD'));
  assert.ok(notice.includes('thirty (30) calendar days'));
});
