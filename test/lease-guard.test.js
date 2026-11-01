// test/lease-guard.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROVINCIAL_LEASE_RULES,
  COMMON_ILLEGAL_CLAUSES,
  auditLeaseAgreement
} from '../src/lease-guard.js';

describe('Residential Lease Guardian & Tenancy Agreement Verifier', () => {
  it('defines provincial tenancy standards for Ontario, BC, and Alberta', () => {
    assert.ok(PROVINCIAL_LEASE_RULES.ON);
    assert.strictEqual(PROVINCIAL_LEASE_RULES.ON.standardFormMandatory, true);
    assert.strictEqual(PROVINCIAL_LEASE_RULES.ON.damageDepositAllowed, false);
    assert.strictEqual(PROVINCIAL_LEASE_RULES.ON.petBanAllowed, false);

    assert.ok(PROVINCIAL_LEASE_RULES.BC);
    assert.strictEqual(PROVINCIAL_LEASE_RULES.BC.damageDepositAllowed, true);

    assert.ok(PROVINCIAL_LEASE_RULES.AB);
  });

  it('audits Ontario lease with missing Standard Lease (Form 2229E) and asserts statutory withholding rights', () => {
    const result = auditLeaseAgreement({
      province: 'ON',
      monthlyRentCad: 2400,
      standardFormUsed: false,
      depositDemands: { rentDepositMonths: 1, damageDepositCad: 0, keyDepositCad: 30 }
    });

    assert.strictEqual(result.province, 'ON');
    assert.strictEqual(result.standardFormStatus.isCompliant, false);
    assert.ok(result.standardFormStatus.statutoryRemedy);
    assert.ok(result.standardFormStatus.statutoryRemedy.rentWithholding.includes('RTA s. 12.1(5)'));
    assert.ok(result.standardFormStatus.statutoryRemedy.permanentRetention.includes('RTA s. 12.1(7)'));
    assert.ok(result.standardFormStatus.statutoryRemedy.leaseTermination.includes('Form N9'));
  });

  it('detects unlawful damage deposits and excessive advance rent in Ontario', () => {
    const result = auditLeaseAgreement({
      province: 'ON',
      monthlyRentCad: 2000,
      standardFormUsed: true,
      depositDemands: {
        rentDepositMonths: 6, // 5 months illegal excess = $10,000
        damageDepositCad: 2000, // strictly illegal in Ontario
        keyDepositCad: 250 // $200 excess over $50 replacement benchmark
      }
    });

    assert.strictEqual(result.depositAudit.totalUnlawfulExcessCad, 10000 + 2000 + 200); // $12,200
    assert.strictEqual(result.depositAudit.unlawfulCharges.length, 3);
    assert.ok(result.depositAudit.rebateForm.includes('LTB Form T1'));
    assert.strictEqual(result.overallSafetyRating, 'high_risk');
  });

  it('identifies void clauses under Ontario RTA s. 14, 20, 22, and 108', () => {
    const result = auditLeaseAgreement({
      province: 'ON',
      monthlyRentCad: 2200,
      clausesPresent: ['no_pets', 'no_guests', 'post_dated_cheques', 'tenant_repairs']
    });

    assert.strictEqual(result.clauseAudits.length, 4);
    assert.strictEqual(result.voidClauseCount, 4);

    const petClause = result.clauseAudits.find(c => c.key === 'no_pets');
    assert.strictEqual(petClause.isLegal, false);
    assert.strictEqual(petClause.statutoryStatus, 'void');
    assert.ok(petClause.statute.includes('RTA s. 14'));

    const repairClause = result.clauseAudits.find(c => c.key === 'tenant_repairs');
    assert.strictEqual(repairClause.isLegal, false);
    assert.ok(repairClause.statute.includes('RTA s. 20'));
  });

  it('audits British Columbia lease and enforces 50% damage deposit cap under BC RTA s. 19', () => {
    const rent = 3000;
    const result = auditLeaseAgreement({
      province: 'BC',
      monthlyRentCad: rent,
      standardFormUsed: true,
      depositDemands: {
        rentDepositMonths: 0,
        damageDepositCad: 2500, // $1,500 is legal max (50%), so $1,000 excess
        keyDepositCad: 50
      }
    });

    assert.strictEqual(result.province, 'BC');
    assert.strictEqual(result.depositAudit.statutoryCaps.legalMaxDamageDepositCad, 1500);
    assert.strictEqual(result.depositAudit.totalUnlawfulExcessCad, 1000);
    assert.strictEqual(result.depositAudit.unlawfulCharges.length, 1);
  });

  it('parses custom clause text heuristics and detects unlawful restrictions', () => {
    const customText = 'Tenant agrees to no pets or dogs in the apartment. Overnight visitors and guests strictly prohibited. Tenant must supply post-dated cheques.';
    const result = auditLeaseAgreement({
      province: 'ON',
      monthlyRentCad: 2100,
      customClauseText: customText
    });

    const clauseKeys = result.clauseAudits.map(c => c.key);
    assert.ok(clauseKeys.includes('no_pets'));
    assert.ok(clauseKeys.includes('no_guests'));
    assert.ok(clauseKeys.includes('post_dated_cheques'));
    assert.ok(result.officialDisputeNotice.includes('Ontario Residential Tenancies Act'));
  });
});
