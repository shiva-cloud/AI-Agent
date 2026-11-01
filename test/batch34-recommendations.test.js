import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Sweep 41 (Recommendations 576-590) Modules
import { assessCredentialLicensure, evaluateCredentialLicensurePathway } from '../src/credential-licensure-bridge.js';
import { evaluateCredentialPathway } from '../src/credential-navigator.js';
import { evaluateCriminalInadmissibilityAndRehab, generateRehabilitationActionPlan, REHAB_CONSTANTS } from '../src/criminal-rehabilitation-navigator.js';
import { evaluateCrossBorderTaxObligations } from '../src/cross-border-tax-navigator.js';
import { evaluateCurrencyExchange } from '../src/currency-exchange-navigator.js';
import { evaluateCustomsDeclaration } from '../src/customs-declaration.js';
import { deriveEncryptionKey, encryptBuffer, decryptBuffer, encryptDatabaseFile, decryptDatabaseFile } from '../src/db-encryption.js';
import { runDatabaseMaintenance } from '../src/db-maintenance.js';
import { createDatabasePool } from '../src/db-pool.js';
import { evaluateDebtCollectionDefense } from '../src/debt-collection-defense.js';
import { isValidCityForCountry, resolveInputCountry } from '../src/destinations.js';
import { evaluatePlatformWorkerRights } from '../src/digital-platform-worker-navigator.js';
import { validateDocument, validateNewcomerDocuments } from '../src/document-validator.js';
import { evaluateEiRegularBenefits, auditEiVoluntaryQuitJustCause, evaluateEiParentalAndSicknessBenefits } from '../src/ei-benefits-navigator.js';
import { evaluateEiDisqualificationAndAllocation } from '../src/ei-disqualification-navigator.js';

// Rec 576: Credential Licensure Bridge Engine
test('Rec 576: assessCredentialLicensure handles null, FARPACTA Canadian experience ban, and alternative unlicensed roles', () => {
  const nullSafe = assessCredentialLicensure(null);
  assert.equal(nullSafe.candidateName, 'Candidate');
  assert.equal(nullSafe.isRegulatedProfession, true);
  assert.ok(nullSafe.statutoryAdvisories.length > 0);

  // Software Engineer in Ontario (Title protected, but FARPACTA applies and alternative titles exist)
  const sweOn = evaluateCredentialLicensurePathway({
    candidateName: 'Priya Sharma',
    profession: 'software_engineer',
    province: 'ON',
    yearsOfForeignExperience: 6,
    hasEca: true,
    ecaOrganization: 'WES',
    officialLanguageClb: 9
  });
  assert.equal(sweOn.candidateName, 'Priya Sharma');
  assert.equal(sweOn.canadianExperienceBanApplies, true);
  assert.ok(sweOn.canadianExperienceProtectionDetails.includes('FARPACTA'));
  assert.equal(sweOn.hasValidEca, true);
  assert.equal(sweOn.isLanguageReady, true);
  assert.ok(sweOn.alternativeUnlicensedCareers.some(c => c.role.includes('Developer')));

  // Nurse in BC (Health profession exception to Canadian experience ban)
  const nurseBc = assessCredentialLicensure({
    candidateName: 'Carlos Gomez',
    profession: 'registered_nurse',
    province: 'BC',
    yearsOfForeignExperience: 8,
    hasEca: false
  });
  assert.equal(nurseBc.mandatoryEcaDesignation, 'NNAS');
  assert.equal(nurseBc.hasValidEca, false);
  assert.equal(nurseBc.canadianExperienceBanApplies, false);
  assert.ok(nurseBc.canadianExperienceProtectionDetails.includes('public-safety exemptions'));
});

// Rec 577: Credential Navigator & Licensing Roadmap
test('Rec 577: evaluateCredentialPathway handles null and audits engineering vs healthcare regulatory phases', () => {
  const nullSafe = evaluateCredentialPathway(null);
  assert.equal(nullSafe.candidateName, 'Candidate');
  assert.equal(nullSafe.professionKey, 'engineering');
  assert.ok(nullSafe.estimatedTotalCostCad > 0);

  // Engineering in Alberta (APEGA)
  const apega = evaluateCredentialPathway({
    candidateName: 'Ahmed Al-Mansoor',
    profession: 'engineering',
    targetProvince: 'AB',
    originCountry: 'Egypt',
    currentDegree: 'Bachelor of Science in Civil Engineering'
  });
  assert.equal(apega.targetProvince, 'AB');
  assert.ok(apega.regulatoryBody.includes('APEGA'));
  assert.equal(apega.canadianExperiencePolicy.mandatoryCanadianExperienceRequired, false);
  assert.ok(apega.financialAssistance.loanPartners.length > 0);

  // Nursing in Ontario (CNO - SPEP partnership)
  const cno = evaluateCredentialPathway({
    candidateName: 'Maria Santos',
    profession: 'nursing',
    targetProvince: 'ON'
  });
  assert.equal(cno.designatedEca.code, 'NNAS');
  assert.equal(cno.canadianExperiencePolicy.mandatoryCanadianExperienceRequired, false);
  assert.ok(cno.canadianExperiencePolicy.statutoryProtection.includes('SPEP'));
});

// Rec 578: Criminal Rehabilitation & Inadmissibility Engine
test('Rec 578: evaluateCriminalInadmissibilityAndRehab & generateRehabilitationActionPlan audit IRPA s.36 and Bill C-46', () => {
  const nullSafe = evaluateCriminalInadmissibilityAndRehab(null);
  assert.equal(nullSafe.applicantName, 'Applicant');
  assert.ok(nullSafe.statutoryNotes.length > 0);

  // Bill C-46 DUI is Serious Criminality under IRPA s. 36(1) -> Deemed Rehab permanently barred
  const duiResult = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'impaired_driving_dui',
    sentenceCompletionDate: '2010-01-01', // Even after 16 years
    applicantName: 'John Doe',
    assessmentDate: '2026-10-31'
  });
  assert.equal(duiResult.severityCategory, 'Serious Criminality (IRPA s. 36(1))');
  assert.equal(duiResult.rehabPathways.isDeemedRehabilitated, false);
  assert.equal(duiResult.rehabPathways.isEligibleForIndividualRehabilitation, true);
  assert.equal(duiResult.rehabPathways.governmentRehabFeeCad, REHAB_CONSTANTS.FEE_SERIOUS_REHAB_CAD);
  assert.ok(duiResult.riskWarnings.some(w => w.includes('DEEMED REHABILITATION BARRED')));

  // Non-serious shoplifting under s. 36(2) after 11 years -> Deemed Rehabilitated
  const theftResult = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'theft_under_5000',
    sentenceCompletionDate: '2015-01-01',
    convictionCount: 1,
    assessmentDate: '2026-10-31'
  });
  assert.equal(theftResult.severityCategory, 'Criminality (IRPA s. 36(2))');
  assert.equal(theftResult.rehabPathways.isDeemedRehabilitated, true);
  assert.equal(theftResult.rehabPathways.requiresTrpForEntry, false);

  // Plan generation null safety
  const plan = generateRehabilitationActionPlan(null);
  assert.ok(plan.includes('CRIMINAL INADMISSIBILITY & REHABILITATION SUBMISSION PLAN'));
});

// Rec 579: Cross-Border Tax & Form T1135 / FBAR Engine
test('Rec 579: evaluateCrossBorderTaxObligations audits T1135 first-year newcomer exemption and US FBAR / PFIC traps', () => {
  const nullSafe = evaluateCrossBorderTaxObligations(null);
  assert.equal(nullSafe.clientName, 'Cross-Border Client');
  assert.ok(nullSafe.actionChecklist !== undefined);

  // Newcomer in first tax year: Form T1135 statutory exemption (ITA s. 233.3(1))
  const newcomer = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isFirstYearCanadianResident: true,
    taxYear: 2026,
    foreignPropertyCostAmountCad: 350000
  });
  assert.equal(newcomer.craAudit.t1135Required, false);
  assert.equal(newcomer.craAudit.firstYearExemptionApplied, true);
  assert.ok(newcomer.craAudit.notes.some(n => n.includes('FIRST-YEAR IMMIGRANT EXEMPTION')));

  // US Person in Canada with TFSA and Canadian Mutual Funds (PFIC & Foreign Trust risk)
  const usExpat = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isFirstYearCanadianResident: false,
    foreignPropertyCostAmountCad: 150000,
    isUsPerson: true,
    peakForeignAccountsUsd: 25000,
    hasCanadianTfsa: true,
    holdsCanadianMutualFundsOrEtfs: true
  });
  assert.equal(usExpat.irsAudit.fbarFinCen114Required, true);
  assert.equal(usExpat.irsAudit.pficExposureWarning, true);
  assert.equal(usExpat.irsAudit.foreignTrustWarning, true);
  assert.ok(usExpat.riskFlags.some(f => f.includes('PFIC EXPOSURE')));
});

// Rec 580: Currency Exchange & Norbert's Gambit Navigator
test('Rec 580: evaluateCurrencyExchange audits Norbert\'s Gambit savings and PCMLTFA anti-structuring compliance', () => {
  const nullSafe = evaluateCurrencyExchange(null);
  assert.equal(nullSafe.clientName, 'Client');
  assert.ok(nullSafe.fintracCompliance.cadEquivalentAmount > 0);

  // Large USD to CAD transfer ($50,000 USD via Norbert's Gambit on Questrade)
  const exchange = evaluateCurrencyExchange({
    amount: 50000,
    fromCurrency: 'USD',
    toCurrency: 'CAD',
    brokeragePlatform: 'questrade',
    hasCrossBorderAccount: true
  });
  assert.equal(exchange.bestOption.providerId, 'norberts_gambit');
  assert.ok(exchange.savingsVersusBig5Cad > 1000); // Massive savings over Big 5 retail spread
  assert.equal(exchange.fintracCompliance.isReportableFintrac, true);
  assert.equal(exchange.fintracCompliance.structuringRisk.hasStructuringRisk, false);
  assert.ok(exchange.norbertsGambitGuide.protocolSteps.length >= 4);

  // Suspicious structuring split (Multiple small tranches between $6k and $10k CAD threshold)
  const structuring = evaluateCurrencyExchange({
    amount: 18000,
    fromCurrency: 'CAD',
    toCurrency: 'USD',
    isSplitIntoMultipleTranches: true,
    trancheCount: 2
  });
  assert.equal(structuring.fintracCompliance.structuringRisk.hasStructuringRisk, true);
  assert.ok(structuring.fintracCompliance.structuringRisk.warningMessage.includes('PCMLTFA s. 75'));
});

// Rec 581: Customs Declaration & BSF186 Settler Effects Engine
test('Rec 581: evaluateCustomsDeclaration audits Tariff 9807, 6-month rule, and Form E677 currency limits', () => {
  const nullSafe = evaluateCustomsDeclaration(null);
  assert.equal(nullSafe.settlerStatus, 'pr');
  assert.equal(nullSafe.tariffClassification.code, '9807.00.00');

  // Settler landing with goods, jewelry, and $15,000 cash
  const landing = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    currencyCad: 15000,
    items: [
      { description: 'MacBook Pro', category: 'electronics', valueCad: 3000, ownedMonths: 12, serialNumber: 'C02XG1' },
      { description: 'Gold Wedding Jewelry', category: 'jewelry', valueCad: 8000, ownedMonths: 24 },
      { description: 'Brand New TV in Box', category: 'electronics', valueCad: 1500, ownedMonths: 2 } // Under 6 months!
    ]
  });
  assert.equal(landing.currencyCompliance.isDeclarationMandatory, true);
  assert.ok(landing.currencyCompliance.mandatoryForm.includes('E677'));
  assert.equal(landing.jewelryAudit.itemsDetected, 1);
  assert.equal(landing.jewelryAudit.requiresAppraisalPhoto, true);
  assert.ok(landing.financialAudit.dutyExemptValueCad > 0);
  assert.equal(landing.financialAudit.taxableExcessValueCad, 1500); // 2-month TV is taxable
});

// Rec 582: SQLite Database Encryption & Authentication Tags
test('Rec 582: db-encryption derives keys, encrypts/decrypts buffers, and enforces authenticated integrity', () => {
  assert.throws(() => deriveEncryptionKey(null, 'salt'), /passphrase is required/);
  assert.throws(() => deriveEncryptionKey('pass', null), /salt is required/);

  const passphrase = 'UltraSecureNorthstarKey2026!';
  const sampleData = Buffer.from('Confidential Newcomer Settlement Data');

  const encrypted = encryptBuffer(sampleData, passphrase);
  assert.ok(Buffer.isBuffer(encrypted));
  assert.ok(encrypted.length > sampleData.length);

  const decrypted = decryptBuffer(encrypted, passphrase);
  assert.equal(decrypted.toString('utf8'), 'Confidential Newcomer Settlement Data');

  // Tampered ciphertext or wrong passphrase fails authentication
  assert.throws(() => decryptBuffer(encrypted, 'WrongPassword123!'));
  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 1] ^= 0xff; // Flip bit in tag or ciphertext
  assert.throws(() => decryptBuffer(tampered, passphrase));

  // File encryption / decryption roundtrip
  const tmpSrc = join(tmpdir(), `test-src-${Date.now()}.db`);
  const tmpEnc = join(tmpdir(), `test-enc-${Date.now()}.enc`);
  const tmpDec = join(tmpdir(), `test-dec-${Date.now()}.db`);

  try {
    writeFileSync(tmpSrc, 'SQLITE DATABASE CONTENT DUMMY');
    const encInfo = encryptDatabaseFile(tmpSrc, tmpEnc, passphrase);
    assert.equal(encInfo.cipher, 'aes-256-gcm');
    const decInfo = decryptDatabaseFile(tmpEnc, tmpDec, passphrase);
    assert.equal(decInfo.restoredBytes, encInfo.rawBytes);
  } finally {
    if (existsSync(tmpSrc)) unlinkSync(tmpSrc);
    if (existsSync(tmpEnc)) unlinkSync(tmpEnc);
    if (existsSync(tmpDec)) unlinkSync(tmpDec);
  }
});

// Rec 583: Database Maintenance & Integrity Verification
test('Rec 583: runDatabaseMaintenance executes integrity checks, trace pruning, and WAL checkpoints safely', () => {
  assert.throws(() => runDatabaseMaintenance(null), /Valid database instance required/);

  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE traces (
      id INTEGER PRIMARY KEY,
      question TEXT,
      created_at TEXT
    );
  `);

  const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
  const freshDate = new Date().toISOString();

  db.prepare('INSERT INTO traces (question, created_at) VALUES (?, ?)').run('Old question', oldDate);
  db.prepare('INSERT INTO traces (question, created_at) VALUES (?, ?)').run('Fresh question', freshDate);

  // Dry run
  const dryRunReport = runDatabaseMaintenance(db, { retentionDays: 90, dryRun: true });
  assert.equal(dryRunReport.status, 'completed');
  assert.equal(dryRunReport.dryRun, true);
  assert.equal(dryRunReport.eligibleTracesIdentified, 1);
  assert.equal(dryRunReport.tracesPruned, 0);

  // Actual run
  const liveReport = runDatabaseMaintenance(db, { retentionDays: 90, dryRun: false });
  assert.equal(liveReport.dryRun, false);
  assert.equal(liveReport.tracesPruned, 1);
  assert.equal(liveReport.integrityCheck, 'ok');

  const remaining = db.prepare('SELECT count(*) as count FROM traces').get().count;
  assert.equal(remaining, 1);
  db.close();
});

// Rec 584: Database Connection Pool & Replica Balancing
test('Rec 584: createDatabasePool manages read-only worker connections, round-robin dispatch, and replica isolation', () => {
  assert.throws(() => createDatabasePool(null), /Valid database path string required/);

  const tmpDbPath = join(tmpdir(), `test-pool-${Date.now()}.db`);
  const initDb = new DatabaseSync(tmpDbPath);
  initDb.exec("CREATE TABLE test (val TEXT); INSERT INTO test VALUES ('hello');");
  initDb.close();

  try {
    const pool = createDatabasePool(tmpDbPath, { readPoolSize: 2 });
    assert.equal(pool.poolSize, 2);
    assert.equal(pool.isReplicaMode, false);

    // Read connections round-robin
    const r1 = pool.getReadConnection();
    const r2 = pool.getReadConnection();
    const r3 = pool.getReadConnection();
    assert.notEqual(r1, r2);
    assert.equal(r1, r3); // Round robin returns r1 again

    const row = r1.prepare('SELECT val FROM test').get();
    assert.equal(row.val, 'hello');

    // Writer connection
    const writer = pool.getWriterConnection();
    writer.prepare('INSERT INTO test VALUES (?)').run('world');

    pool.close();

    // Read-only replica pool forbids writer
    const replicaPool = createDatabasePool(tmpDbPath, { readOnlyReplica: true });
    assert.equal(replicaPool.isReplicaMode, true);
    assert.throws(() => replicaPool.getWriterConnection(), /read-only replica mode/);
    replicaPool.close();
  } finally {
    if (existsSync(tmpDbPath)) unlinkSync(tmpDbPath);
  }
});

// Rec 585: Debt Collection Defense & Limitation Period Engine
test('Rec 585: evaluateDebtCollectionDefense audits 2-year statute-barred debt, harassment, and immigration extortion', () => {
  const nullSafe = evaluateDebtCollectionDefense(null);
  assert.equal(nullSafe.debtorName, 'Debtor');
  assert.equal(nullSafe.province, 'ON');

  // Statute-barred telecom debt (3 years old) with unlawful threats of deportation
  const defense = evaluateDebtCollectionDefense({
    debtorName: 'Dev Patel',
    province: 'ON',
    debtType: 'telecom',
    allegedDebtAmountCad: 2500,
    collectionAgencyName: 'Aggressive Debt Recovery Inc.',
    lastPaymentOrDefaultDate: '2022-01-01',
    callsInPastWeek: 5, // > 3 calls/week is illegal
    calledEmployer: true, // Calling employer is illegal
    threatenedImmigrationOrDeportation: true, // Criminal extortion
    assessmentDate: '2026-10-31'
  });

  assert.equal(defense.isStatuteBarred, true);
  assert.equal(defense.resolutionVerdict, 'CRIMINAL_EXTORTION_REPORT_MANDATED');
  assert.ok(defense.statutoryViolations.some(v => v.violationCode === 'IMMIGRATION_COERCION_EXTORTION'));
  assert.ok(defense.statutoryViolations.some(v => v.violationCode === 'EXCESSIVE_CALL_FREQUENCY'));
  assert.ok(defense.statutoryViolations.some(v => v.violationCode === 'UNLAWFUL_EMPLOYER_CONTACT'));
  assert.ok(defense.ceaseAndDesistNotice.includes('STATUTE-BARRED NOTICE'));
  assert.ok(defense.ceaseAndDesistNotice.includes('Criminal Code s. 346'));
});

// Rec 586: Destinations & City Validation
test('Rec 586: isValidCityForCountry & resolveInputCountry validate supported destinations and reject malformed inputs', () => {
  assert.equal(isValidCityForCountry(null), true);
  assert.equal(isValidCityForCountry('Toronto', 'CA'), true);
  assert.equal(isValidCityForCountry('Berlin', 'Germany'), true);
  assert.equal(isValidCityForCountry('Tokyo', 'CA'), false);

  assert.equal(resolveInputCountry('CA'), 'CA');
  assert.equal(resolveInputCountry('canada'), 'CA');
  assert.equal(resolveInputCountry('United States'), 'United States');
  assert.equal(resolveInputCountry('germany'), 'Germany');

  assert.throws(() => resolveInputCountry('Mars'), /supported destination/);
  assert.throws(() => resolveInputCountry(''), /supported destination/);
});

// Rec 587: Digital Platform Worker Rights Engine
test('Rec 587: evaluatePlatformWorkerRights audits engaged minimum wage, tips protection, and Heller v. Uber arbitration', () => {
  const nullSafe = evaluatePlatformWorkerRights(null);
  assert.equal(nullSafe.workerName, 'Worker');
  assert.ok(nullSafe.wageAudit.minimumEngagedEarningsCad > 0);

  // Ontario rideshare driver with wage shortfall, tip withholding, and forced foreign arbitration
  const workerOn = evaluatePlatformWorkerRights({
    province: 'ON',
    platformName: 'FastRide Canada',
    workerType: 'rideshare_driver',
    engagedHoursInPeriod: 50,
    actualBasePayReceivedCad: 700.0, // Minimum for 50 hrs at $17.20 is $860
    tipsReceivedCad: 150.0,
    tipsWithheldOrSubsidized: true,
    hasDeplatformingAction: true,
    noticeDaysGivenBeforeDeplatform: 0,
    providedWrittenReason: false,
    foreignArbitrationClauseInvoked: true,
    workerName: 'Tariq Khan'
  });

  assert.equal(workerOn.wageAudit.hasWageTheft, true);
  assert.equal(workerOn.wageAudit.wageShortfallCad, 160.0); // 860 - 700
  assert.equal(workerOn.restitutionSummary.withheldTipsCad, 150.0);
  assert.equal(workerOn.deplatformingAudit.isUnlawfulDeplatforming, true);
  assert.ok(workerOn.violations.some(v => v.includes('Invalid foreign arbitration clause')));
  assert.ok(workerOn.statutoryProtections.some(p => p.includes('Heller v. Uber')));
  assert.ok(workerOn.actionPlan.length >= 3);
});

// Rec 588: Document Validator & Pre-Flight Readiness Inspector
test('Rec 588: validateDocument & validateNewcomerDocuments inspect passport runway, IME medical, and ECA validity', () => {
  assert.throws(() => validateNewcomerDocuments({ documents: 'not an array' }), /Documents must be an array/);
  assert.throws(() => validateDocument(null), /Each document must have a document type/);

  // Passport with under 6 months runway from landing date
  const docCheck = validateNewcomerDocuments({
    landingDateStr: '2026-11-01',
    documents: [
      { docType: 'passport', expiryDate: '2027-01-01' }, // Only 2 months runway (< 180 days)
      { docType: 'medical_exam', issueDate: '2025-01-01' }, // > 12 months old -> Expired!
      { docType: 'copr', expiryDate: '2026-12-01' } // Valid
    ]
  });

  assert.equal(docCheck.overallReadiness, 'critical_rejection_risk');
  assert.equal(docCheck.counts.criticalRisk, 1); // Expired IME
  assert.equal(docCheck.counts.highRisk, 2); // Tight passport runway + COPR expiring in 30 days
  assert.ok(docCheck.documents.some(d => d.docType === 'medical_exam' && d.status === 'expired'));
  assert.ok(docCheck.documents.some(d => d.docType === 'passport' && d.status === 'expiring_soon'));
});

// Rec 589: Employment Insurance (EI) Benefits Navigator
test('Rec 589: evaluateEiRegularBenefits, auditEiVoluntaryQuitJustCause & evaluateEiParentalAndSicknessBenefits', () => {
  const regNull = evaluateEiRegularBenefits(null);
  assert.equal(regNull.applicantName, 'Applicant');
  assert.ok(regNull.requiredHoursThreshold > 0);

  // Layoff with sufficient hours (650 hrs vs 630 required at 7.5% unemployment)
  const regular = evaluateEiRegularBenefits({
    insurableHoursAccrued: 650,
    regionalUnemploymentRatePercent: 7.5,
    averageWeeklyInsurableEarningsCad: 1200,
    reasonForSeparation: 'layoff_shortage_of_work'
  });
  assert.equal(regular.isEligible, true);
  assert.equal(regular.estimatedWeeklyBenefitCad, 660); // 55% of 1200

  // Just cause voluntary quit: Spousal relocation
  const quit = auditEiVoluntaryQuitJustCause({
    quitReasonCategory: 'spouse_relocation',
    hasProofDocumentation: true
  });
  assert.equal(quit.isJustCauseEstablished, true);
  assert.ok(quit.statutoryRule.includes('JUST CAUSE ESTABLISHED'));

  // Parental & Sickness: 26 weeks sickness, QPIP paternity in QC
  const sickness = evaluateEiParentalAndSicknessBenefits({
    benefitType: 'sickness',
    insurableHoursAccrued: 600,
    hasMedicalCertificate: true
  });
  assert.equal(sickness.isEligible, true);
  assert.equal(sickness.maxDurationWeeks, 26);

  const qpip = evaluateEiParentalAndSicknessBenefits({
    provinceOfResidence: 'QC'
  });
  assert.equal(qpip.jurisdiction, 'Quebec (QPIP / RGAP)');
  assert.equal(qpip.maxDurationWeeks, 5);
});

// Rec 590: EI Disqualification, Misconduct & Separation Monies Allocation Engine
test('Rec 590: evaluateEiDisqualificationAndAllocation audits Brissette misconduct, severance allocation delay, and special benefits', () => {
  const nullSafe = evaluateEiDisqualificationAndAllocation(null);
  assert.equal(nullSafe.applicantName, 'EI Claimant');
  assert.ok(nullSafe.regularBenefits !== undefined);

  // Dismissal for performance incompetence (Under Brissette, ordinary incompetence is NOT misconduct)
  const incompetenceDismissal = evaluateEiDisqualificationAndAllocation({
    separationType: 'employer_dismissal',
    employerAllegedMisconduct: true,
    allegedMisconductType: 'incompetence_performance',
    normalWeeklyGrossEarningsCad: 1000,
    severancePayReceivedCad: 5000, // 5 weeks allocation delay
    vacationPayPaidOutCad: 1000,   // 1 week delay
    payInLieuOfNoticeCad: 0
  });

  assert.equal(incompetenceDismissal.misconductAudit.misconductAuditResult, 'incompetence_not_misconduct');
  assert.equal(incompetenceDismissal.regularBenefits.isDisqualifiedFromRegularBenefits, false);
  assert.ok(incompetenceDismissal.defenseArguments.some(d => d.includes('Brissette')));
  assert.equal(incompetenceDismissal.separationMoniesAllocation.totalSeparationMoniesCad, 6000);
  assert.equal(incompetenceDismissal.separationMoniesAllocation.estimatedAllocationDelayWeeks, 6);

  // Willful misconduct dismissal but claiming Special Maternity Benefits (EIA s. 33 override)
  const specialOverride = evaluateEiDisqualificationAndAllocation({
    separationType: 'employer_dismissal',
    employerAllegedMisconduct: true,
    allegedMisconductType: 'willful_insubordination',
    isClaimingSpecialBenefits: true
  });
  assert.equal(specialOverride.regularBenefits.isDisqualifiedFromRegularBenefits, true);
  assert.equal(specialOverride.specialBenefitsOverride.specialBenefitsAvailable, true);
  assert.ok(specialOverride.statutoryNotes.some(n => n.includes('EIA s. 33')));
});
