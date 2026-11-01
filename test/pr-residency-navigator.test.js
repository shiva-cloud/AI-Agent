// test/pr-residency-navigator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePrResidencyObligation,
  STATUTORY_RESIDENCY_REQUIREMENT_DAYS,
  OVERSEAS_EXEMPTION_TYPES
} from '../src/pr-residency-navigator.js';

describe('Canadian PR Card Renewal & IRPA Section 28 Residency Obligation Diagnostic', () => {
  it('constants and statutory definitions are correct', () => {
    assert.equal(STATUTORY_RESIDENCY_REQUIREMENT_DAYS, 730);
    assert.equal(OVERSEAS_EXEMPTION_TYPES.ACCOMPANYING_CITIZEN_SPOUSE, 'accompanying_citizen_spouse');
  });

  it('evaluates fully compliant residency with purely physical presence', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-06-01',
      prLandingDate: '2021-01-01',
      prCardExpiryDate: '2026-07-01',
      physicalDaysInsideCanada: 850
    });

    assert.equal(res.complianceStatus, 'FULLY_COMPLIANT');
    assert.equal(res.residencyDayAudit.hasMet730DaysObligation, true);
    assert.equal(res.residencyDayAudit.totalCreditedResidencyDays, 850);
    assert.equal(res.residencyDayAudit.surplusOrDeficitDays, 120);
    assert.equal(res.renewalEligibility.isEligibleToApplyForRenewal, true);
    assert.equal(res.renewalEligibility.irccProcessingFeeCad, 50);
  });

  it('credits overseas days accompanying Canadian citizen spouse (IRPA s. 28(2)(a)(ii))', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-06-01',
      prLandingDate: '2021-01-01',
      prCardExpiryDate: '2026-07-01',
      physicalDaysInsideCanada: 400,
      overseasDaysWithCitizenSpouse: 350 // 400 + 350 = 750 days
    });

    assert.equal(res.complianceStatus, 'FULLY_COMPLIANT');
    assert.equal(res.residencyDayAudit.totalCreditedResidencyDays, 750);
    assert.equal(res.residencyDayAudit.hasMet730DaysObligation, true);
    assert.equal(res.residencyDayAudit.surplusOrDeficitDays, 20);
  });

  it('credits Canadian business overseas assignment days (IRPA s. 28(2)(a)(iii))', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-06-01',
      prLandingDate: '2021-01-01',
      prCardExpiryDate: '2026-07-01',
      physicalDaysInsideCanada: 300,
      overseasDaysCanadianBusinessEmployment: 500 // 300 + 500 = 800 days
    });

    assert.equal(res.complianceStatus, 'FULLY_COMPLIANT');
    assert.equal(res.residencyDayAudit.totalCreditedResidencyDays, 800);
    assert.equal(res.residencyDayAudit.hasMet730DaysObligation, true);
  });

  it('marks PR as on-track when landed < 5 years ago with sufficient time remaining', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2024-01-01',
      prLandingDate: '2023-01-01', // 1 year since landing (~365 days)
      prCardExpiryDate: '2028-01-01',
      physicalDaysInsideCanada: 200 // 200 < 730, but 1460 days remain in 5-yr window
    });

    assert.equal(res.complianceStatus, 'IN_PROGRESS_ON_TRACK');
    assert.equal(res.isWithinFirstFiveYearsOfPr, true);
    assert.ok(res.summaryHeadline.includes('PR status safe under 5-year rule'));
  });

  it('detects statutory residency breach and risk of Section 44(1) report', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-06-01',
      prLandingDate: '2020-01-01', // >5 years ago
      prCardExpiryDate: '2025-01-01',
      physicalDaysInsideCanada: 300 // 300 < 730 -> breach of 430 days
    });

    assert.equal(res.complianceStatus, 'IN_BREACH_AT_RISK');
    assert.equal(res.residencyDayAudit.hasMet730DaysObligation, false);
    assert.equal(res.residencyDayAudit.surplusOrDeficitDays, -430);
    assert.ok(res.summaryHeadline.includes('Section 44(1) inadmissibility report'));
  });

  it('evaluates urgent processing eligibility for urgent employment travel within 90 days', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-05-01',
      prLandingDate: '2021-01-01',
      prCardExpiryDate: '2026-06-01',
      physicalDaysInsideCanada: 800,
      hasUrgentTravelBooked: true,
      urgentTravelDate: '2026-05-20', // in 19 days (< 90 days)
      urgentTravelReason: 'employment'
    });

    assert.equal(res.urgentProcessingAssessment.isEligibleForUrgentProcessing, true);
    assert.ok(res.urgentProcessingAssessment.qualifyingCriteria.some(c => c.includes('employment or business')));
  });

  it('recommends PRTD (Permanent Resident Travel Document) when abroad with expired card', () => {
    const res = evaluatePrResidencyObligation({
      assessmentDate: '2026-05-01',
      prLandingDate: '2021-01-01',
      prCardExpiryDate: '2026-04-01', // expired 1 month ago
      physicalDaysInsideCanada: 800,
      isCurrentlyInsideCanada: false // abroad
    });

    assert.equal(res.isCardExpired, true);
    assert.equal(res.prTravelDocumentAssessment.isNeeded, true);
    assert.equal(res.prTravelDocumentAssessment.eligibleForPrtd, true);
    assert.equal(res.prTravelDocumentAssessment.feeCad, 50);
  });
});
