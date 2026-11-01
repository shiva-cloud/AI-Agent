// test/eviction-defense.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditEvictionNotice, EVICTION_FORM_RULES } from '../src/eviction-defense.js';

describe('Ontario Residential Tenancy Eviction Defense & Predatory Notice Engine', () => {
  it('EVICTION_FORM_RULES contains definitions for N12, N13, N4, and N11', () => {
    assert.ok(EVICTION_FORM_RULES.N12);
    assert.equal(EVICTION_FORM_RULES.N12.minNoticeDays, 60);
    assert.equal(EVICTION_FORM_RULES.N12.requiresStatutoryCompensation, true);
    assert.equal(EVICTION_FORM_RULES.N12.corporateLandlordAllowed, false);

    assert.ok(EVICTION_FORM_RULES.N13);
    assert.equal(EVICTION_FORM_RULES.N13.minNoticeDays, 120);

    assert.ok(EVICTION_FORM_RULES.N4);
    assert.equal(EVICTION_FORM_RULES.N4.minNoticeDays, 14);

    assert.ok(EVICTION_FORM_RULES.N11);
    assert.equal(EVICTION_FORM_RULES.N11.minNoticeDays, 0);
  });

  it('audits a fully compliant Form N12 with timely compensation', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2400,
      noticeServedDate: '2026-04-01',
      terminationDate: '2026-06-30', // ~90 days
      wasStatutoryCompensationPaid: true,
      compensationPaidDate: '2026-06-15',
      isLandlordACorporation: false,
      intendedOccupant: 'landlord'
    });

    assert.equal(res.isNoticeStatutorilyVoid, false);
    assert.equal(res.validityVerdict, 'FACIALLY_VALID_CHALLENGEABLE');
    assert.equal(res.statutoryDefects.length, 0);
    assert.equal(res.compensationAudit.amountDueCad, 2400);
    assert.equal(res.compensationAudit.paidOnTime, true);
    assert.ok(res.officialDisputeNotice.includes('PURSUANT TO SECTION 43'));
  });

  it('voids Form N12 if statutory compensation is unpaid (Kandiyoti v. 2387192 Ontario Inc.)', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2500,
      noticeServedDate: '2026-04-01',
      terminationDate: '2026-06-30',
      wasStatutoryCompensationPaid: false
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    assert.equal(res.validityVerdict, 'STATUTORILY_VOID');
    const compDefect = res.statutoryDefects.find(d => d.defect.includes('Unpaid Statutory Compensation'));
    assert.ok(compDefect);
    assert.ok(compDefect.legalRemedy.includes('dismiss the application'));
    assert.ok(res.badFaithIndicators.some(b => b.includes('s. 48.1')));
  });

  it('voids Form N12 if compensation was paid late (after termination date)', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2000,
      noticeServedDate: '2026-04-01',
      terminationDate: '2026-06-30',
      wasStatutoryCompensationPaid: true,
      compensationPaidDate: '2026-07-02' // 2 days late
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    const lateDefect = res.statutoryDefects.find(d => d.defect.includes('Late Statutory Compensation'));
    assert.ok(lateDefect);
  });

  it('voids Form N12 if landlord is an incorporated company (s. 48(5))', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2200,
      noticeServedDate: '2026-04-01',
      terminationDate: '2026-06-30',
      wasStatutoryCompensationPaid: true,
      compensationPaidDate: '2026-06-01',
      isLandlordACorporation: true
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    const corpDefect = res.statutoryDefects.find(d => d.defect.includes('Corporate Landlord Prohibition'));
    assert.ok(corpDefect);
    assert.ok(res.badFaithIndicators.some(b => b.includes('incorporated company')));
  });

  it('voids Form N12 if intended occupant is an ineligible relative (e.g. cousin/sibling)', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2000,
      noticeServedDate: '2026-04-01',
      terminationDate: '2026-06-30',
      wasStatutoryCompensationPaid: true,
      intendedOccupant: 'cousin'
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    const relativeDefect = res.statutoryDefects.find(d => d.defect.includes('Ineligible Occupant'));
    assert.ok(relativeDefect);
  });

  it('flags Form N12 with insufficient notice period (<60 days)', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 2000,
      noticeServedDate: '2026-05-01',
      terminationDate: '2026-05-31', // 30 days
      wasStatutoryCompensationPaid: true
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    assert.equal(res.noticePeriodAudit.isNoticePeriodCompliant, false);
    const noticeDefect = res.statutoryDefects.find(d => d.defect.includes('Insufficient Notice Period'));
    assert.ok(noticeDefect);
  });

  it('audits Form N13 with 5+ units requiring 3 months rent compensation', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N13',
      monthlyRentCad: 1800,
      noticeServedDate: '2026-01-01',
      terminationDate: '2026-05-30',
      buildingUnitCount: 6,
      wasStatutoryCompensationPaid: false
    });

    assert.equal(res.compensationAudit.amountDueCad, 5400); // 1800 * 3
    assert.equal(res.isNoticeStatutorilyVoid, true);
    const compDefect = res.statutoryDefects.find(d => d.defect.includes('Unpaid Renoviction Compensation'));
    assert.ok(compDefect);
  });

  it('audits Form N4 with unlawful charges', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N4',
      monthlyRentCad: 2000,
      noticeServedDate: '2026-05-01',
      terminationDate: '2026-05-20',
      allegedRentArrearsCad: 3000,
      includesIllegalCharges: true
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    const n4Defect = res.statutoryDefects.find(d => d.defect.includes('Arrears Include Unlawful Charges'));
    assert.ok(n4Defect);
  });

  it('audits Form N11 signed under coercion or misrepresentation', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N11',
      monthlyRentCad: 2200,
      coercedOrMisrepresented: true
    });

    assert.equal(res.isNoticeStatutorilyVoid, true);
    const n11Defect = res.statutoryDefects.find(d => d.defect.includes('Agreement Signed Under Duress'));
    assert.ok(n11Defect);
  });

  it('computes bad-faith tenant damages capped at $35,000 (RTA s. 57(3))', () => {
    const res = auditEvictionNotice({
      noticeFormType: 'N12',
      monthlyRentCad: 3200
    });

    // 3200 * 12 = 38400, capped at 35000
    assert.equal(res.potentialTenantDamages.statutoryGeneralDamages12MonthsRentCad, 35000);
    assert.equal(res.potentialTenantDamages.totalClaimableDamagesCad, 35000);
  });
});
