// test/credential-licensure-bridge.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessCredentialLicensure,
  REGULATED_PROFESSIONS_DIRECTORY,
  GLOBAL_CREDENTIAL_EVALUATORS
} from '../src/credential-licensure-bridge.js';

test('Statutory Foreign Credential Recognition (FCR) & Licensure Bridge Engine', async (t) => {
  await t.test('profession directory contains statutory authorities and protected titles', () => {
    assert.ok(REGULATED_PROFESSIONS_DIRECTORY.civil_engineer);
    assert.ok(REGULATED_PROFESSIONS_DIRECTORY.civil_engineer.protectedTitle.includes('P.Eng.'));
    assert.ok(REGULATED_PROFESSIONS_DIRECTORY.registered_nurse);
    assert.equal(REGULATED_PROFESSIONS_DIRECTORY.registered_nurse.mandatoryEcaDesignation, 'NNAS');
    assert.equal(REGULATED_PROFESSIONS_DIRECTORY.physician.mandatoryEcaDesignation, 'MCC');
    assert.equal(REGULATED_PROFESSIONS_DIRECTORY.pharmacist.mandatoryEcaDesignation, 'PEBC');
  });

  await t.test('civil engineer in Ontario receives FARPACTA Canadian experience ban protection', () => {
    const result = assessCredentialLicensure({
      profession: 'civil_engineer',
      province: 'ON',
      foreignDegreeLevel: 'bachelors',
      yearsOfForeignExperience: 8,
      hasEca: true,
      ecaOrganization: 'WES',
      officialLanguageClb: 8
    });

    assert.equal(result.province, 'ON');
    assert.equal(result.isRegulatedProfession, true);
    assert.equal(result.regulatoryCollege, 'Professional Engineers Ontario (PEO)');
    assert.ok(result.governingStatute.includes('Professional Engineers Act'));
    assert.equal(result.canadianExperienceBanApplies, true);
    assert.ok(result.canadianExperienceProtectionDetails.includes('FARPACTA'));
    assert.equal(result.hasValidEca, true);
    assert.equal(result.isLanguageReady, true);
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Civil Engineering Technologist')));
  });

  await t.test('physician with general WES is alerted to mandatory MCC requirement', () => {
    const result = assessCredentialLicensure({
      profession: 'physician',
      province: 'BC',
      foreignDegreeLevel: 'doctorate',
      yearsOfForeignExperience: 6,
      hasEca: true,
      ecaOrganization: 'WES', // Invalid for physicians!
      officialLanguageClb: 9
    });

    assert.equal(result.mandatoryEcaDesignation, 'MCC');
    assert.equal(result.hasValidEca, false);
    assert.ok(result.ecaStatusFinding.includes('WARNING'));
    assert.ok(result.ecaStatusFinding.includes('MCC'));
    assert.equal(result.regulatoryCollege, 'College of Physicians and Surgeons of British Columbia (CPSBC)');
    // Health professions exempt from blanket Canadian experience ban
    assert.equal(result.canadianExperienceBanApplies, false);
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Clinical Research Coordinator')));
  });

  await t.test('software engineer receives title restriction warning and alternative unregulated roles', () => {
    const result = assessCredentialLicensure({
      profession: 'software_engineer',
      province: 'ON',
      hasEca: true,
      ecaOrganization: 'WES',
      officialLanguageClb: 8
    });

    assert.equal(result.isRegulatedProfession, true);
    assert.ok(result.titleRestrictionNotice.includes('CRITICAL TITLE CAUTION'));
    assert.ok(result.titleRestrictionNotice.includes('Software Developer'));
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Senior Software Developer')));
  });

  await t.test('registered nurse evaluates NNAS requirement and alternative healthcare aide paths', () => {
    const result = assessCredentialLicensure({
      profession: 'registered_nurse',
      province: 'ON',
      hasEca: true,
      ecaOrganization: 'NNAS',
      officialLanguageClb: 9
    });

    assert.equal(result.regulatoryCollege, 'College of Nurses of Ontario (CNO)');
    assert.equal(result.mandatoryEcaDesignation, 'NNAS');
    assert.equal(result.hasValidEca, true);
    assert.ok(result.licensingMilestones.some(m => m.name.includes('NCLEX-RN')));
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Personal Support Worker')));
  });

  await t.test('evaluates language benchmark readiness below CLB 8', () => {
    const result = assessCredentialLicensure({
      profession: 'accountant',
      province: 'AB',
      hasEca: true,
      ecaOrganization: 'WES',
      officialLanguageClb: 6
    });

    assert.equal(result.officialLanguageClb, 6);
    assert.equal(result.isLanguageReady, false);
    assert.ok(result.languageFinding.includes('may require enhancement'));
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Financial Analyst')));
  });

  await t.test('evaluates elementary/secondary teacher licensure and alternative education careers', () => {
    const result = assessCredentialLicensure({
      profession: 'elementary_secondary_teacher',
      province: 'ON',
      hasEca: true,
      ecaOrganization: 'WES',
      officialLanguageClb: 8
    });

    assert.equal(result.regulatoryCollege, 'Ontario College of Teachers (OCT)');
    assert.ok(result.governingStatute.includes('Ontario College of Teachers Act'));
    assert.equal(result.canadianExperienceBanApplies, true);
    assert.ok(result.alternativeUnlicensedCareers.some(c => c.role.includes('Instructional Designer')));
  });

  await t.test('global credential evaluators cover Germany Anabin, Australia VETASSESS, Quebec OIIQ and UK ECCTIS', () => {
    assert.ok(GLOBAL_CREDENTIAL_EVALUATORS.germany_anabin.tool.includes('Anabin'));
    assert.ok(GLOBAL_CREDENTIAL_EVALUATORS.australia_vetassess.authority.includes('VETASSESS'));
    assert.ok(GLOBAL_CREDENTIAL_EVALUATORS.quebec_oiiq.authority.includes('OIIQ'));
    assert.ok(GLOBAL_CREDENTIAL_EVALUATORS.uk_ecctis.authority.includes('ECCTIS'));
  });
});
