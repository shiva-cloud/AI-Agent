// test/vulnerable-worker-defense.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateVulnerableWorkerProtection,
  VWOWP_REGULATION,
  VWOWP_FEE_EXEMPTION_CODE,
  TARGET_EXPEDITED_PROCESSING_DAYS,
  ABUSE_GROUNDS
} from '../src/vulnerable-worker-defense.js';

describe('Vulnerable Worker Open Work Permit (VWOWP) & Migrant Worker Defense Engine', () => {
  it('statutory constants match IRCC operational standards', () => {
    assert.ok(VWOWP_REGULATION.includes('IRPR s. 207.1'));
    assert.equal(VWOWP_FEE_EXEMPTION_CODE, 'A50');
    assert.equal(TARGET_EXPEDITED_PROCESSING_DAYS, 14);
    assert.equal(ABUSE_GROUNDS.ILLEGAL_RECRUITMENT_FEES, 'illegal_recruitment_fees');
    assert.equal(ABUSE_GROUNDS.DOCUMENT_CONFISCATION, 'document_confiscation');
  });

  it('audits a closed permit worker experiencing illegal recruitment fees and deportation threats', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'closed_employer_specific_work_permit',
      abuseGrounds: [
        ABUSE_GROUNDS.ILLEGAL_RECRUITMENT_FEES,
        ABUSE_GROUNDS.DEPORTATION_THREATS
      ],
      recruitmentFeesPaidCad: 6000,
      unpaidWagesOrKickbacksCad: 2500,
      hasEvidenceDocs: true,
      evidenceTypesHeld: ['text_messages_whatsapp', 'audio_recordings'],
      workProvince: 'ON'
    });

    assert.equal(res.isVwowpEligible, true);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_ELIGIBLE_FOR_VWOWP');
    assert.equal(res.totalFinancialLossCad, 8500);
    assert.equal(res.statutoryViolations.length, 3);
    assert.ok(res.statutoryViolations.some(v => v.ground.includes('Recruitment Fee') && v.statute.includes('EPFNA')));
    assert.ok(res.statutoryViolations.some(v => v.ground.includes('Deportation') && v.statute.includes('IRPA s. 44')));
    assert.ok(res.statutoryViolations.some(v => v.ground.includes('Wage Theft')));
    assert.equal(res.evidenceAudit.evidenceConfidence, 'STRONG');
    assert.ok(res.vwowpRoadmap.some(r => r.action.includes('A50')));
    assert.ok(res.statutoryAdvisories.some(a => a.includes('Criminal Code s. 184')));
  });

  it('audits document confiscation as labour trafficking under Criminal Code s. 279.01 and EPFNA s. 8', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'closed_employer_specific_work_permit',
      abuseGrounds: [ABUSE_GROUNDS.DOCUMENT_CONFISCATION],
      workProvince: 'ON'
    });

    assert.equal(res.isVwowpEligible, true);
    assert.ok(res.statutoryViolations.some(v => v.statute.includes('EPFNA 2009 s. 8') && v.statute.includes('Criminal Code s. 279.01')));
    assert.ok(res.immediateRemedies.some(r => r.includes('Canadian Human Trafficking Hotline')));
  });

  it('strictly rejects open work permit holders from VWOWP (already free to switch employers)', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'open_work_permit',
      abuseGrounds: [ABUSE_GROUNDS.WAGE_THEFT_KICKBACKS]
    });

    assert.equal(res.isVwowpEligible, false);
    assert.equal(res.eligibilityVerdict, 'INELIGIBLE_PERMIT_TYPE');
    assert.ok(res.summaryHeadline.includes('Ineligible for VWOWP'));
  });

  it('identifies closed permit with no abuse grounds as needing reasonable grounds of abuse', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'closed_employer_specific_work_permit',
      abuseGrounds: []
    });

    assert.equal(res.isVwowpEligible, false);
    assert.equal(res.eligibilityVerdict, 'CLOSED_PERMIT_NO_ABUSE_IDENTIFIED');
  });

  it('recognizes maintained status for closed work permit holders under IRPR s. 207.1', () => {
    const res = evaluateVulnerableWorkerProtection({
      currentPermitType: 'maintained_status_closed_permit',
      abuseGrounds: [ABUSE_GROUNDS.EXCESSIVE_COERCION_HOURS, ABUSE_GROUNDS.UNSAFE_CONDITIONS]
    });

    assert.equal(res.isVwowpEligible, true);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_ELIGIBLE_FOR_VWOWP');
  });
});
