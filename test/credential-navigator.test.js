// test/credential-navigator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ECA_ORGANIZATIONS,
  REGULATED_PROFESSIONS,
  evaluateCredentialPathway
} from '../src/credential-navigator.js';

describe('Canadian Credential Recognition & Regulated Profession Pathways Engine', () => {
  it('defines IRCC-approved designated ECA bodies and medical/nursing assessment services', () => {
    assert.ok(ECA_ORGANIZATIONS.wes);
    assert.strictEqual(ECA_ORGANIZATIONS.wes.code, 'WES');
    assert.ok(ECA_ORGANIZATIONS.wes.estimatedFeeCad > 200);

    assert.ok(ECA_ORGANIZATIONS.mcc);
    assert.strictEqual(ECA_ORGANIZATIONS.mcc.code, 'MCC');

    assert.ok(ECA_ORGANIZATIONS.nnas);
    assert.strictEqual(ECA_ORGANIZATIONS.nnas.code, 'NNAS');

    assert.ok(ECA_ORGANIZATIONS.pebc);
    assert.strictEqual(ECA_ORGANIZATIONS.pebc.code, 'PEBC');
  });

  it('correctly evaluates Professional Engineering in Ontario with Bill 27 Canadian experience ban', () => {
    const result = evaluateCredentialPathway({
      profession: 'engineering',
      targetProvince: 'ON',
      originCountry: 'India',
      currentDegree: 'B.Tech Electrical'
    });

    assert.strictEqual(result.professionKey, 'engineering');
    assert.strictEqual(result.targetProvince, 'ON');
    assert.strictEqual(result.regulatoryBody, 'Professional Engineers Ontario (PEO)');
    assert.ok(result.statute.includes('Professional Engineers Act'));

    // Statutory Canadian Experience Ban
    assert.strictEqual(result.canadianExperiencePolicy.mandatoryCanadianExperienceRequired, false);
    assert.ok(result.canadianExperiencePolicy.statutoryProtection.includes('Working for Workers Act, 2021'));
    assert.ok(result.canadianExperiencePolicy.advisory.includes('PROTECTED BY LAW'));

    // Check phases
    assert.strictEqual(result.phases.length, 3);
    assert.ok(result.phases[1].title.includes('Competency-Based Assessment'));
    assert.ok(result.phases[2].title.includes('NPPE'));
    assert.ok(result.estimatedTotalCostCad > 1000);
  });

  it('evaluates Registered Nursing with NNAS and NCLEX-RN in British Columbia', () => {
    const result = evaluateCredentialPathway({
      profession: 'nursing',
      targetProvince: 'BC',
      originCountry: 'Philippines',
      currentDegree: 'BS Nursing'
    });

    assert.strictEqual(result.professionKey, 'nursing');
    assert.strictEqual(result.targetProvince, 'BC');
    assert.strictEqual(result.regulatoryBody, 'British Columbia College of Nurses and Midwives (BCCNM)');
    assert.strictEqual(result.designatedEca.code, 'NNAS');
    assert.ok(result.phases.some(p => p.title.includes('NCLEX-RN')));
  });

  it('evaluates International Medical Graduate (IMG) pathway for Alberta with Practice Ready Assessment', () => {
    const result = evaluateCredentialPathway({
      profession: 'medicine',
      targetProvince: 'AB',
      originCountry: 'United Kingdom',
      currentDegree: 'MBBS'
    });

    assert.strictEqual(result.professionKey, 'medicine');
    assert.strictEqual(result.targetProvince, 'AB');
    assert.strictEqual(result.regulatoryBody, 'College of Physicians & Surgeons of Alberta (CPSA)');
    assert.strictEqual(result.designatedEca.code, 'MCC');
    assert.ok(result.phases.some(p => p.title.includes('MCCQE Part 1')));
    assert.ok(result.phases.some(p => p.title.includes('Practice Ready Assessment')));
  });

  it('evaluates Chartered Professional Accountant with MRA/RMA reciprocity in Ontario', () => {
    const result = evaluateCredentialPathway({
      profession: 'accounting',
      targetProvince: 'ON',
      originCountry: 'United States',
      currentDegree: 'BS Accounting'
    });

    assert.strictEqual(result.professionKey, 'accounting');
    assert.strictEqual(result.regulatoryBody, 'Chartered Professional Accountants of Ontario (CPA Ontario)');
    assert.ok(result.phases.some(p => p.title.includes('Common Final Examination')));
  });

  it('falls back safely for unlisted professions and provinces', () => {
    const result = evaluateCredentialPathway({
      profession: 'unknown_specialty',
      targetProvince: 'UNKNOWN'
    });

    assert.strictEqual(result.professionKey, 'engineering');
    assert.strictEqual(result.targetProvince, 'ON');
    assert.ok(result.estimatedTotalCostCad > 0);
  });

  it('includes federal FCR micro-loans and statutory tax deductibility', () => {
    const result = evaluateCredentialPathway({ profession: 'engineering' });
    assert.strictEqual(result.financialAssistance.fcrLoansAvailable, true);
    assert.ok(result.financialAssistance.loanAmountRange.includes('$15,000 to $30,000'));
    assert.ok(result.financialAssistance.taxDeductibility.includes('Income Tax Act s. 118.5(1)(d)'));
    assert.ok(result.statutoryWarnings.length >= 3);
  });
});
