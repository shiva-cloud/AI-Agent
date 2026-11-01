import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';

// Sweep 42 (Recommendations 591-605) Modules
import { auditEmploymentReferenceLetter, REFERENCE_AUDIT_CONSTANTS } from '../src/employment-reference-audit.js';
import { auditWorkerClassificationAndWageTheft, PROVINCIAL_OVERTIME_THRESHOLDS } from '../src/employment-standards.js';
import { retrieve, answer } from '../src/engine.js';
import {
  calculateOntarioOvertimePay,
  calculateVacationPayStepUp,
  calculatePublicHolidayPay,
  evaluateEsaStatutorySeverance,
  auditContractorMisclassification,
  auditEqualPayForEqualWork,
  ESA_CONSTANTS
} from '../src/esa-wage-theft-navigator.js';
import { evaluateEstatePlanProfile, ESTATE_PLANNING_CONSTANTS } from '../src/estate-planning-navigator.js';
import { evaluateEuHealthRights, EU_HEALTH_CONSTANTS } from '../src/eu-health-rights-navigator.js';
import { checkAnswerConstraints, evaluate } from '../src/evaluation.js';
import { auditEvictionNotice, EVICTION_FORM_RULES } from '../src/eviction-defense.js';
import { openEvidenceIndex } from '../src/evidence-index.js';
import { assertEvidencePolicy, lintEvidence, highRiskTopics } from '../src/evidence-policy.js';
import { backupEvidenceEncrypted, restoreEvidenceEncryptedDrill } from '../src/evidence-recovery-encrypted.js';
import { createPublicEvidenceSnapshot } from '../src/evidence-revision.js';
import { evidenceWorkerOptions } from '../src/evidence-worker.js';
import { evaluateExcessiveDemandMitigation, EXCESSIVE_DEMAND_CONSTANTS, MITIGATION_VIABILITY_RULES } from '../src/excessive-demand-mitigation-navigator.js';
import {
  evaluateExpressEntryCrs,
  getAgePoints,
  getEducationPoints,
  getLanguageAbilityPoints,
  getCanadianExperiencePoints,
  CRS_STATUTORY_CONSTANTS,
  BENCHMARK_DRAW_CUTOFFS
} from '../src/express-entry-optimizer.js';

// Rec 591: Employment Reference Audit Engine
test('Rec 591: auditEmploymentReferenceLetter handles null, checks 7 mandatory criteria and NOC duty match', () => {
  const nullSafe = auditEmploymentReferenceLetter(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.complianceVerdict, 'DEFICIENT_REMEDIAL_ACTION_REQUIRED');

  // Deficient letter missing key statutory criteria
  const deficient = auditEmploymentReferenceLetter({
    hasLetterhead: false,
    hasJobTitle: false,
    hasSupervisorSignature: false
  });
  assert.equal(deficient.complianceVerdict, 'DEFICIENT_REMEDIAL_ACTION_REQUIRED');
  assert.ok(deficient.mandatoryElementsAudit.missingElements.length >= 3);

  const fullLetter = auditEmploymentReferenceLetter({
    applicantName: 'Tariq Al-Mansoor',
    nocCode: '21231',
    isFullTime: true,
    hasLetterhead: true,
    hasExactStartEndDates: true,
    hasJobTitle: true,
    hoursPerWeek: 37.5,
    hasAnnualSalaryAndBenefits: true,
    hasDetailedDutiesList: true,
    hasSupervisorSignature: true,
    dutiesCopiedFromNocWordForWord: false,
    dutiesSubstantiallyMatchLeadStatement: true,
    hasPayStubs: true,
    hasTaxDocuments: true,
    hasBankStatements: true
  });

  assert.equal(fullLetter.applicantName, 'Tariq Al-Mansoor');
  assert.equal(fullLetter.complianceVerdict, 'COMPLIANT_READY_FOR_SUBMISSION');
  assert.equal(fullLetter.mandatoryElementsAudit.missingElements.length, 0);
  assert.equal(fullLetter.isFullTime, true);
  assert.ok(fullLetter.overallComplianceScore >= 80);
});

// Rec 592: Employment Standards & Worker Misclassification
test('Rec 592: auditWorkerClassificationAndWageTheft handles null, evaluates Sagaz criteria and overtime theft', () => {
  const nullSafe = auditWorkerClassificationAndWageTheft(null);
  assert.equal(nullSafe.classificationVerdict, 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION');
  assert.ok(nullSafe.wageTheftAudit.totalDirectWageTheftCad > 0);

  const bcEmployee = auditWorkerClassificationAndWageTheft({
    province: 'BC',
    hourlyRateCad: 30,
    averageWeeklyHoursWorked: 50,
    weeksWorkedTotal: 20,
    employerSetsScheduleAndLocation: true,
    employerProvidesToolsAndLaptop: true,
    workerCannotHireSubcontractors: true,
    workerHasNoRiskOfFinancialLoss: true,
    workerWorksExclusivelyForEmployer: true,
    wasOvertimePayPaid: false,
    wasVacationPayPaid: false
  });

  assert.equal(bcEmployee.province, 'BC');
  assert.equal(bcEmployee.classificationVerdict, 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION');
  assert.ok(bcEmployee.wageTheftAudit.unpaidOvertimeCad > 0);
  assert.ok(bcEmployee.wageTheftAudit.unpaidVacationPayCad > 0);
  assert.ok(bcEmployee.wageTheftAudit.employerCppLiabilityCad > 0);
});

// Rec 593: Engine Retrieval and Answer
test('Rec 593: engine retrieve and answer handle null parameters safely without throwing', () => {
  const safeRetrieve = retrieve({ text: 'driving in Ontario' }, null, null, null, null);
  assert.ok(Array.isArray(safeRetrieve));

  const safeAnswer = answer({ question: 'How do I obtain an OHIP card in Ontario?' }, null, null, null, null);
  assert.ok(safeAnswer && typeof safeAnswer === 'object');
  assert.ok(Array.isArray(safeAnswer.sources));
  assert.ok(Array.isArray(safeAnswer.claims));
  assert.ok(Array.isArray(safeAnswer.gaps));
});

// Rec 594: ESA Wage Theft Navigator
test('Rec 594: calculateOntarioOvertimePay and vacation step-up calculate statutory ESA standards', () => {
  const ot = calculateOntarioOvertimePay(null);
  assert.equal(ot.employeeName, 'Employee');
  assert.equal(ot.standardWeeklyThresholdHours, 44);
  assert.ok(ot.overtimePayCad > 0);

  // Vacation step-up: 4% under 5 years, 6% at 5+ years
  const vacUnder5 = calculateVacationPayStepUp({ yearsOfService: 3, grossEarningsCad: 60000 });
  assert.equal(vacUnder5.applicableRatePercent, '4%');
  assert.equal(vacUnder5.statutoryVacationPayCad, 2400);

  const vacOver5 = calculateVacationPayStepUp({ yearsOfService: 5, grossEarningsCad: 60000 });
  assert.equal(vacOver5.applicableRatePercent, '6%');
  assert.equal(vacOver5.statutoryVacationPayCad, 3600);

  // Public holiday pay: wages in 4 weeks / 20
  const hol = calculatePublicHolidayPay({ wagesEarnedInPrior4WeeksCad: 4000, vacationPayPayableInPrior4WeeksCad: 0 });
  assert.equal(hol.statutoryHolidayPayCad, 200);

  // Severance: $2.5M payroll and 5+ years service
  const sev = evaluateEsaStatutorySeverance({
    employerOntarioPayrollCad: 3000000,
    yearsOfContinuousService: 6,
    regularWeeklyWagesCad: 1200
  });
  assert.equal(sev.qualifiesForSeverance, true);
  assert.equal(sev.severanceWeeks, 6);
  assert.equal(sev.statutorySeverancePayCad, 7200);

  // Contractor misclassification
  const misclass = auditContractorMisclassification(null);
  assert.equal(misclass.isMisclassified, true);
  assert.ok(misclass.classificationVerdict.includes('MISCLASSIFIED EMPLOYEE'));

  // Equal pay for equal work
  const eq = auditEqualPayForEqualWork({ permanentEmployeeHourlyRateCad: 32, temporaryAgencyHourlyRateCad: 22 });
  assert.equal(eq.isEqualPayViolation, true);
  assert.equal(eq.hourlyDisparityCad, 10);
});

// Rec 595: Estate Planning Navigator
test('Rec 595: evaluateEstatePlanProfile assesses probate taxes, dual wills and intestacy risk', () => {
  const nullSafe = evaluateEstatePlanProfile(null);
  assert.equal(nullSafe.clientName, 'Estate Client');
  assert.ok(nullSafe.probateTaxAnalysis.estimatedProbateTaxCad >= 0);

  const complexEstate = evaluateEstatePlanProfile({
    province: 'ON',
    maritalStatus: 'married',
    hasChildren: true,
    childrenCount: 2,
    hasMinorChildren: true,
    canadianRealEstateCad: 1000000,
    realEstateOwnershipStructure: 'tenants_in_common',
    hasForeignRealEstateOrAssets: true,
    foreignAssetsValueCad: 500000,
    foreignCountry: 'United States',
    hasExistingForeignWill: true,
    hasCanadianWill: false,
    hasContinuingPowerOfAttorneyProperty: false,
    hasPowerOfAttorneyPersonalCare: false
  });

  assert.equal(complexEstate.province, 'ON');
  assert.ok(complexEstate.probateTaxAnalysis.estimatedProbateTaxCad > 0);
  assert.ok(complexEstate.actionPlan.length > 0);
  assert.equal(complexEstate.foreignAssetsStrategy.hasForeignRisk, true);
});

// Rec 596: EU Health Rights Navigator
test('Rec 596: evaluateEuHealthRights calculates S1 certificate and EHIC/GHIC rights and handles errors', () => {
  const nullSafe = evaluateEuHealthRights(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.equal(nullSafe.originCountry, 'UK');
  assert.equal(nullSafe.hostCountry, 'SPAIN');
  assert.ok(nullSafe.statutoryBasis.includes('TCA'));

  // Pensioner S1 certificate test
  const pensioner = evaluateEuHealthRights({
    applicantName: 'Jean Dupont',
    userCategory: 'pensioner',
    originCountry: 'FRANCE',
    hostCountry: 'SPAIN',
    isStatePensioner: true
  });
  assert.equal(pensioner.applicableDocument, 'S1');
  assert.ok(pensioner.scopeOfCoverage.includes('exact same terms as registered residents'));

  // Same country throws ValidationError
  assert.throws(() => evaluateEuHealthRights({ originCountry: 'UK', hostCountry: 'UK' }), /cannot be the same/);
});

// Rec 597: Evaluation Constraints and Suite
test('Rec 597: checkAnswerConstraints and evaluate handle null/empty datasets cleanly', () => {
  const issues = checkAnswerConstraints(null, null, null, null);
  assert.ok(Array.isArray(issues));

  const evalResult = evaluate(null, null, null);
  assert.ok(evalResult && typeof evalResult === 'object');
  assert.equal(evalResult.cases, 0);
});

// Rec 598: Eviction Defense Engine
test('Rec 598: auditEvictionNotice handles null, corporate landlord prohibition and mandatory N12 compensation', () => {
  const nullSafe = auditEvictionNotice(null);
  assert.equal(nullSafe.tenantName, 'Tenant');
  assert.equal(nullSafe.noticeFormType, 'N12');
  assert.ok(nullSafe.compensationAudit.isMandatory);

  // Corporate landlord issuing N12 (prohibited under s. 48(5))
  const corpN12 = auditEvictionNotice({
    noticeFormType: 'N12',
    isLandlordACorporation: true,
    monthlyRentCad: 2500,
    wasStatutoryCompensationPaid: false
  });
  assert.equal(corpN12.validityVerdict, 'STATUTORILY_VOID');
  assert.equal(corpN12.isNoticeStatutorilyVoid, true);
  assert.ok(corpN12.statutoryDefects.some(d => d.statute.includes('48(5)')));

  // Untimely compensation after termination date
  const lateComp = auditEvictionNotice({
    noticeFormType: 'N12',
    monthlyRentCad: 2000,
    noticeServedDate: '2026-04-01',
    terminationDate: '2026-06-30',
    wasStatutoryCompensationPaid: true,
    compensationPaidDate: '2026-07-05'
  });
  assert.equal(lateComp.isNoticeStatutorilyVoid, true);
  assert.ok(lateComp.statutoryDefects.some(d => d.defect.includes('Late Statutory Compensation')));
});

// Rec 599: Evidence Index FTS5
test('Rec 599: openEvidenceIndex handles in-memory creation and null search records', () => {
  const index = openEvidenceIndex(':memory:', null);
  try {
    const rebuildResult = index.rebuild([]);
    assert.equal(rebuildResult.indexed, 0);

    const rankResult = index.rank([], null);
    assert.ok(Array.isArray(rankResult));
    assert.equal(rankResult.length, 0);
  } finally {
    index.close();
  }
});

// Rec 600: Evidence Policy & Linting
test('Rec 600: assertEvidencePolicy asserts object format and lintEvidence audits expiry drift', () => {
  assert.throws(() => assertEvidencePolicy(null), /must be an object/);

  // Valid record
  const validRecord = {
    id: 'rec_1',
    topic: 'housing',
    risk: 'high',
    checkedAt: '2026-10-01',
    expiresAt: '2026-12-01'
  };
  assert.doesNotThrow(() => assertEvidencePolicy(validRecord));

  // lintEvidence null safety and expired warning
  const lint = lintEvidence(null, [{ id: 'rec_old', expiresAt: '2026-01-01', status: 'approved' }], new Date('2026-10-31T00:00:00Z'));
  assert.equal(lint.count, 1);
  assert.equal(lint.warnings[0].code, 'evidence_expired');
});

// Rec 601: Evidence Recovery Encrypted Key Check
test('Rec 601: backupEvidenceEncrypted rejects keys that are not 32-byte buffers', async () => {
  await assert.rejects(
    async () => backupEvidenceEncrypted('dummy.sqlite', 'out_dir', 'short_key'),
    /32-byte recovery key is required/
  );
  await assert.rejects(
    async () => restoreEvidenceEncryptedDrill('dummy_dir', 'out_dir', null),
    /32-byte recovery key is required/
  );
});

// Rec 602: Evidence Revision Snapshot
test('Rec 602: createPublicEvidenceSnapshot handles null db and null loader', () => {
  const snapshot = createPublicEvidenceSnapshot(null, null);
  assert.equal(typeof snapshot, 'function');
  const snap1 = snapshot();
  assert.equal(snap1.version, '1');
  assert.deepEqual(snap1.records, []);
});

// Rec 603: Evidence Worker Options
test('Rec 603: evidenceWorkerOptions creates authorizer and handler closures safely', () => {
  const testDbPath = join(tmpdir(), `test-evidence-worker-${Date.now()}.sqlite`);
  const db = new DatabaseSync(testDbPath);
  db.exec('CREATE TABLE dummy(id INT);');
  db.close();

  try {
    const worker = evidenceWorkerOptions(testDbPath, null);
    assert.equal(typeof worker.authorize, 'function');
    assert.equal(worker.authorize(null), false);
    assert.throws(() => worker.handlers.reindex(null), /Job policy denied/);
  } finally {
    try { unlinkSync(testDbPath); } catch {}
  }
});

// Rec 604: Excessive Demand Mitigation Navigator
test('Rec 604: evaluateExcessiveDemandMitigation assesses Hilewitz/Sapru private drug mitigation and Colaco limits', () => {
  const nullSafe = evaluateExcessiveDemandMitigation(null);
  assert.equal(nullSafe.applicantName, 'Medical Applicant');
  assert.equal(nullSafe.admissibilityStatus, 'admissible_unmitigated');

  // Spousal sponsorship exemption under IRPA s. 38(2)
  const spousal = evaluateExcessiveDemandMitigation({
    immigrationStream: 'spousal_sponsorship',
    estimatedAnnualMedicationCostCad: 50000,
    hasPrivateInsuranceDrugCoverage: false
  });
  assert.equal(spousal.admissibilityStatus, 'statutorily_exempt');
  assert.equal(spousal.mitigationViability.statutoryExemptionApplies, true);

  // Mitigation succeeds for outpatient drugs exceeding threshold
  const mitigated = evaluateExcessiveDemandMitigation({
    immigrationStream: 'economic_express_entry',
    estimatedAnnualMedicationCostCad: 25000,
    estimatedAnnualHospitalCostCad: 3000,
    estimatedAnnualSocialServicesCostCad: 2000,
    hasPrivateInsuranceDrugCoverage: true,
    privateInsuranceDrugLimitAnnualCad: 25000
  });
  assert.equal(mitigated.admissibilityStatus, 'admissible_with_mitigation');

  // Inpatient hospital costs exceeding threshold cannot be mitigated privately under Colaco
  const hospitalFailure = evaluateExcessiveDemandMitigation({
    immigrationStream: 'economic_express_entry',
    estimatedAnnualHospitalCostCad: 35000,
    estimatedAnnualMedicationCostCad: 0,
    hasPrivateInsuranceDrugCoverage: false
  });
  assert.equal(hospitalFailure.admissibilityStatus, 'inadmissible_excessive_demand');
  assert.ok(hospitalFailure.riskWarnings.some(w => w.includes('COLACO')));
});

// Rec 605: Express Entry CRS Optimizer
test('Rec 605: evaluateExpressEntryCrs calculates CRS score, LMIA zero-points rule, and French bonus', () => {
  const nullSafe = evaluateExpressEntryCrs(null);
  assert.ok(nullSafe.totalCrsScore > 400);

  // Test age points
  assert.equal(getAgePoints(29, false), 110);
  assert.equal(getAgePoints(29, true), 100);
  assert.equal(getAgePoints(45, false), 0);

  // Test education points
  assert.equal(getEducationPoints('masters', false), 135);
  assert.equal(getEducationPoints('bachelors', false), 120);

  // Test language points
  assert.equal(getLanguageAbilityPoints(10, false), 34);
  assert.equal(getLanguageAbilityPoints(9, false), 31);
  assert.equal(getLanguageAbilityPoints(7, false), 17);

  // Arranged employment LMIA scores 0 since 25 March 2025
  const lmiaProfile = evaluateExpressEntryCrs({
    age: 29,
    educationLevel: 'masters',
    firstLanguageClb: 9,
    canadianWorkExperienceYears: 1,
    foreignWorkExperienceYears: 3,
    hasArrangedEmploymentLmia: true,
    frenchNclcLevel: 7
  });

  assert.equal(lmiaProfile.breakdown.additionalPoints.arrangedEmployment, 0);
  assert.equal(lmiaProfile.breakdown.additionalPoints.frenchBilingualism, 50); // NCLC 7+ French with CLB 9 English
  assert.ok(lmiaProfile.totalCrsScore >= 500);
  assert.equal(lmiaProfile.categoryEligibility.french.isEligible, true);
});
