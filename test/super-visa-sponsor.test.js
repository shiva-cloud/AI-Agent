// test/super-visa-sponsor.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSuperVisaAndFamilySponsorship,
  getStatutoryLicoThreshold,
  SUPER_VISA_MIN_INSURANCE_CAD,
  SUPER_VISA_MIN_INSURANCE_DAYS,
  PGP_UNDERTAKING_YEARS
} from '../src/super-visa-sponsor.js';

describe('Super Visa & Family Sponsorship (LICO / MNI) Diagnostic Engine', () => {
  it('statutory constants match federal immigration legislation', () => {
    assert.equal(SUPER_VISA_MIN_INSURANCE_CAD, 100000);
    assert.equal(SUPER_VISA_MIN_INSURANCE_DAYS, 365);
    assert.equal(PGP_UNDERTAKING_YEARS, 20);
    assert.equal(getStatutoryLicoThreshold(4, false), 54594);
    assert.equal(getStatutoryLicoThreshold(4, true), 70972);
  });

  it('audits an eligible Super Visa application meeting 100% LICO and insurance mandates', () => {
    const res = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'super_visa',
      sponsorStatus: 'permanent_resident',
      sponsorFamilySize: 2, // sponsor + spouse
      invitedParentsCount: 2, // 2 parents -> total 4 persons
      sponsorLine15000IncomeYear1: 65000, // required $54,594
      medicalInsurance: {
        hasMedicalInsuranceQuote: true,
        coverageAmountCad: 100000,
        durationDays: 365,
        isCanadianOrApprovedForeignProvider: true,
        hasPreExistingCoverage: true,
        isRefundableIfDenied: true
      }
    });

    assert.equal(res.isStatutorilyEligible, true);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_ELIGIBLE');
    assert.equal(res.totalFamilyUnitSize, 4);
    assert.equal(res.incomeAudit.year1.requiredCad, 54594);
    assert.equal(res.incomeAudit.year1.surplusOrDeficitCad, 10406);
    assert.equal(res.insuranceAudit.isInsuranceCompliant, true);
    assert.equal(res.statutoryViolations.length, 0);
  });

  it('strictly bars temporary residents (work/study permit holders) from inviting via Super Visa', () => {
    const res = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'super_visa',
      sponsorStatus: 'work_permit_holder',
      sponsorFamilySize: 1,
      invitedParentsCount: 1,
      sponsorLine15000IncomeYear1: 90000
    });

    assert.equal(res.isStatutorilyEligible, false);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_INELIGIBLE');
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Ineligible Inviter') && v.statute.includes('IRPR s. 130(1)')));
  });

  it('combines income with spouse co-signer but rejects invalid co-signers (IRPR s. 132(1))', () => {
    // Valid spouse co-signer
    const validSpouse = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'super_visa',
      sponsorStatus: 'canadian_citizen',
      sponsorFamilySize: 2,
      invitedParentsCount: 1, // total 3 (LICO $44,966)
      sponsorLine15000IncomeYear1: 30000, // deficit alone
      hasCoSigner: true,
      coSignerRelationship: 'spouse_or_common_law',
      coSignerLine15000IncomeYear1: 25000 // total $55,000 -> meets LICO
    });
    assert.equal(validSpouse.isStatutorilyEligible, true);
    assert.equal(validSpouse.incomeAudit.year1.actualIncomeCad, 55000);

    // Invalid sibling co-signer
    const invalidSibling = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'super_visa',
      sponsorStatus: 'canadian_citizen',
      sponsorFamilySize: 2,
      invitedParentsCount: 1,
      sponsorLine15000IncomeYear1: 30000,
      hasCoSigner: true,
      coSignerRelationship: 'sibling_or_parent',
      coSignerLine15000IncomeYear1: 50000
    });
    assert.equal(invalidSibling.isStatutorilyEligible, false);
    assert.ok(invalidSibling.statutoryViolations.some(v => v.rule.includes('Statutoriily Inadmissible Co-Signer')));
  });

  it('enforces 3 consecutive years of LICO+30% for PGP permanent sponsorship (IRPR s. 133(1)(j))', () => {
    // Failing year 3
    const res = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'parents_grandparents_pgp',
      sponsorStatus: 'permanent_resident',
      sponsorFamilySize: 2,
      invitedParentsCount: 2, // total 4 (LICO+30% is $70,972)
      sponsorLine15000IncomeYear1: 75000, // meets
      sponsorLine15000IncomeYear2: 72000, // meets
      sponsorLine15000IncomeYear3: 65000  // fails (<70,972)
    });

    assert.equal(res.isStatutorilyEligible, false);
    assert.equal(res.eligibilityVerdict, 'STATUTORILY_INELIGIBLE');
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Year 3')));
    assert.ok(res.statutoryAdvisories.some(a => a.includes('20-Year Statutory Undertaking Obligation')));
  });

  it('detects Super Visa insurance non-compliance (<$100k or unapproved foreign underwriter)', () => {
    const res = evaluateSuperVisaAndFamilySponsorship({
      pathway: 'super_visa',
      sponsorStatus: 'canadian_citizen',
      sponsorFamilySize: 1,
      invitedParentsCount: 1,
      sponsorLine15000IncomeYear1: 60000,
      medicalInsurance: {
        hasMedicalInsuranceQuote: true,
        coverageAmountCad: 50000, // Below $100k
        durationDays: 180, // Less than 365 days
        isCanadianOrApprovedForeignProvider: false
      }
    });

    assert.equal(res.isStatutorilyEligible, false);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Below Statutory Minimum')));
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Less Than 1 Year')));
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Unapproved Foreign Insurance')));
  });
});
