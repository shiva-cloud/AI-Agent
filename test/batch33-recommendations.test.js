import test from 'node:test';
import assert from 'node:assert/strict';

// Rec 561
import {
  evaluateChildWelfareAndGuardianship,
  CHILD_WELFARE_CONSTANTS,
  PROTECTION_GROUNDS_TAXONOMY
} from '../src/child-welfare-guardianship-navigator.js';

// Rec 562
import {
  extractStatutoryCitations,
  linkifyStatutoryCitations,
  STATUTORY_REPOSITORIES
} from '../src/citation-linker.js';

// Rec 563
import {
  evaluateCitizenshipEligibility,
  CITIZENSHIP_STATUTORY_CONSTANTS
} from '../src/citizenship-navigator.js';

// Rec 564
import {
  compareCities,
  CANADIAN_METROS
} from '../src/city-comparison.js';

// Rec 565
import {
  createClientAddress,
  proxyAddressesFromEnvironment
} from '../src/client-address.js';

// Rec 566
import {
  evaluateCommercialLease,
  COMMERCIAL_LEASE_CONSTANTS,
  COMMERCIAL_LEASE_TYPES
} from '../src/commercial-lease-navigator.js';

// Rec 567
import {
  createTranslationLedger,
  sanitizeZeroPII
} from '../src/community-translation-ledger.js';

// Rec 568
import {
  evaluateConsumerContract,
  CONSUMER_PROTECTION_CONSTANTS
} from '../src/consumer-protection-navigator.js';

// Rec 569
import {
  isFollowUpQuestion,
  resolveConversationTurn,
  CONTEXT_CONTRACT_VERSION
} from '../src/conversation-resolver.js';

// Rec 570
import {
  getCorridor,
  listSupportedCorridorCodes,
  SUPPORTED_CORRIDORS
} from '../src/corridors-registry.js';

// Rec 571
import {
  findCountryPortal,
  countryPortals
} from '../src/country-portals.js';

// Rec 572
import {
  findCountrySettlement,
  countrySettlementRecords
} from '../src/country-settlement.js';

// Rec 573
import {
  evaluateFhsaEligibility,
  evaluateHbpWithdrawal,
  evaluateTfsaNonResidentPenalty,
  evaluateForeignPropertyAndLandingStepUp,
  evaluateOverseasGiftAndAmlProof,
  evaluateNewcomerWealthPlan,
  CRA_WEALTH_CONSTANTS
} from '../src/cra-newcomer-wealth-navigator.js';

// Rec 574
import {
  evaluateVoluntaryDisclosure,
  CRA_VDP_CONSTANTS
} from '../src/cra-voluntary-disclosure.js';

// Rec 575
import {
  publicHttpsUrl,
  permitCrawl,
  isCrawlPermitted
} from '../src/crawl-policy.js';
import { DatabaseSync } from 'node:sqlite';

// --- Test Suite ---

test('Rec 561: evaluateChildWelfareAndGuardianship audits CYFSA ss. 77-84 VYSA youth rights, kinship priority & adoption', () => {
  // Safe null fallback
  const fallback = evaluateChildWelfareAndGuardianship(null);
  assert.equal(fallback.isVysaEligible, true); // Age 16 is default
  assert.ok(fallback.statutoryBasis.includes('CYFSA'));

  // Eligible 16-year-old youth under Ontario VYSA
  const vysa = evaluateChildWelfareAndGuardianship({
    pathway: 'vysa_youth_services',
    youthAgeYears: 16,
    youthName: 'Jordan Lee'
  });
  assert.equal(vysa.isVysaEligible, true);
  assert.ok(vysa.compliancePoints.some(p => p.includes('satisfies statutory criteria')));
  assert.ok(vysa.statutoryProtections.some(p => p.includes('INDEPENDENT YOUTH CONSENT')));
  assert.ok(vysa.statutoryProtections.some(p => p.includes('LEGAL REPRESENTATION')));

  // Ineligible VYSA age (14 years old falls under standard child protection)
  const underage = evaluateChildWelfareAndGuardianship({
    pathway: 'vysa_youth_services',
    youthAgeYears: 14
  });
  assert.equal(underage.isVysaEligible, false);
  assert.ok(underage.riskWarnings.some(w => w.includes('outside the statutory 16-17')));

  // Kinship care priority under CYFSA ss. 75 & 115
  const kinship = evaluateChildWelfareAndGuardianship({
    pathway: 'kinship_guardianship',
    hasSafeExtendedFamily: true,
    kinshipRelationship: 'grandparent'
  });
  assert.equal(kinship.isKinshipPriority, true);
  assert.ok(kinship.statutoryProtections.some(p => p.includes('STATUTORY KINSHIP PRIORITY')));

  // Direct citizenship grant under Citizenship Act s. 5.1 for intercountry adoption
  const adoption = evaluateChildWelfareAndGuardianship({
    pathway: 'intercountry_adoption',
    isCanadianCitizenParentForAdoption: true,
    adoptionLegallyFinalizedAbroad: true,
    preAdoptionTiesSevered: true
  });
  assert.equal(adoption.isDirectCitizenshipGrantEligible, true);
  assert.ok(adoption.statutoryProtections.some(p => p.includes('DIRECT CITIZENSHIP GRANT')));
});

test('Rec 562: extractStatutoryCitations and linkifyStatutoryCitations extract and format legislative references', () => {
  const text = 'Under IRPA s. 36(1) and IRPR 182, foreign nationals face inadmissibility. Also see Ontario RTA s. 49 and 8 CFR 214.2.';
  const extracted = extractStatutoryCitations(text);
  assert.ok(extracted.length >= 3);
  assert.ok(extracted.some(c => c.statute === 'IRPA'));
  assert.ok(extracted.some(c => c.statute === 'IRPR'));
  assert.ok(extracted.some(c => c.statute === 'RTA (Ontario)'));

  // Linkify to Markdown
  const md = linkifyStatutoryCitations('Check IRPA s. 36 and ITA 146.6 for rules.', 'markdown');
  assert.ok(md.includes('[IRPA s. 36]('));
  assert.ok(md.includes('[ITA 146.6]('));

  // Linkify to HTML
  const html = linkifyStatutoryCitations('Check IRPA s. 36 for details.', 'html');
  assert.ok(html.includes('<a href="https://laws-lois.justice.gc.ca'));
  assert.ok(html.includes('class="statutory-citation"'));

  // Empty and non-string inputs
  assert.deepEqual(extractStatutoryCitations(null), []);
  assert.equal(linkifyStatutoryCitations(null), null);
});

test('Rec 563: evaluateCitizenshipEligibility audits 1,095 days, pre-PR credit, taxes, and CLB 4 requirements', () => {
  // Safe null fallback
  const fallback = evaluateCitizenshipEligibility(null);
  assert.ok(fallback.physicalPresenceAudit);
  assert.equal(fallback.physicalPresenceAudit.statutoryRequirementDays, 1095);

  // Eligible citizen with pre-PR time and 3 years post-PR
  const eligible = evaluateCitizenshipEligibility({
    applicationDate: '2026-10-31',
    prLandingDate: '2023-10-31', // 3 years = 1,095 days
    prePrDaysPresent: 400, // 200 credited days
    postPrDaysAbsent: 0,
    taxYearsFiledCount: 3,
    applicantAge: 32,
    languageProofType: 'celpip',
    hasCriminalProhibitions: false
  });
  assert.equal(eligible.overallReadiness.isEligibleNow, true);
  assert.equal(eligible.overallReadiness.status, 'eligible_now');
  assert.ok(eligible.physicalPresenceAudit.totalCreditedDays >= 1095);
  assert.equal(eligible.physicalPresenceAudit.prePrCreditedDays, 200);
  assert.equal(eligible.taxCompliance.hasMetTaxRequirement, true);
  assert.equal(eligible.languageAudit.status, 'compliant');

  // Shortfall with forward projection
  const shortfall = evaluateCitizenshipEligibility({
    applicationDate: '2026-10-31',
    prLandingDate: '2025-01-01', // ~669 days
    prePrDaysPresent: 0,
    postPrDaysAbsent: 30,
    taxYearsFiledCount: 1,
    applicantAge: 60 // Senior exempt from language
  });
  assert.equal(shortfall.overallReadiness.isEligibleNow, false);
  assert.equal(shortfall.languageAudit.status, 'exempt_by_age');
  assert.ok(shortfall.physicalPresenceAudit.surplusOrShortfallDays < 0);
  assert.ok(shortfall.physicalPresenceAudit.earliestProjectedEligibleDate > '2026-10-31');

  // Criminal prohibition under s. 22
  const prohibited = evaluateCitizenshipEligibility({
    hasCriminalProhibitions: true
  });
  assert.equal(prohibited.overallReadiness.status, 'prohibited');
});

test('Rec 564: compareCities computes CMHC rents, transit passes, provincial taxes, and differentials', () => {
  // Safe handling of null/empty options
  const single = compareCities(['Toronto'], null);
  assert.equal(single.comparison.length, 1);
  assert.equal(single.comparison[0].city, 'Toronto');
  assert.ok(single.comparison[0].annualRentOutflow > 0);

  // Comparison between Toronto and Calgary
  const pair = compareCities(['Toronto', 'Calgary'], {
    annualSalary: 90000,
    householdSize: 2
  });
  assert.equal(pair.comparison.length, 2);
  assert.ok(pair.differential);
  assert.equal(pair.differential.cheaperCity, 'Calgary'); // Calgary lower rent and 0% PST
  assert.ok(pair.differential.annualEstimatedSavings > 0);
  assert.equal(pair.differential.salesTaxAdvantage, 'Calgary');

  // Invalid city handling
  const invalid = compareCities(['Atlantis', 'Gotham']);
  assert.ok(invalid.error);
  assert.ok(invalid.availableCities.length >= 5);
});

test('Rec 565: createClientAddress and proxyAddressesFromEnvironment extract peer and forwarded IPs securely', () => {
  // Proxy address parser
  const env = { TRUSTED_PROXY_IPS: JSON.stringify(['10.0.0.1', '127.0.0.1']) };
  const trusted = proxyAddressesFromEnvironment(env);
  assert.deepEqual(trusted, ['10.0.0.1', '127.0.0.1']);

  // Client address resolver
  const getClientIp = createClientAddress(['10.0.0.1']);

  // Direct connection from untrusted IP
  const reqUntrusted = { socket: { remoteAddress: '203.0.113.195' }, headers: {} };
  assert.equal(getClientIp(reqUntrusted), '203.0.113.195');

  // Connection through trusted proxy with X-Forwarded-For
  const reqProxied = {
    socket: { remoteAddress: '10.0.0.1' },
    headers: { 'x-forwarded-for': '198.51.100.42, 10.0.0.1' }
  };
  assert.equal(getClientIp(reqProxied), '198.51.100.42');

  // Null request safety
  assert.equal(getClientIp(null), 'unknown');
});

test('Rec 566: evaluateCommercialLease audits Ontario CTA s. 18 15-day lockout, distress, and personal guarantees', () => {
  // Safe null fallback
  const fallback = evaluateCommercialLease(null);
  assert.equal(fallback.province, 'ON');
  assert.ok(fallback.financialOverview);

  // Arrears >= 15 days triggers statutory right of re-entry without court order under CTA s. 18(1)
  const lockout = evaluateCommercialLease({
    province: 'ON',
    baseRentMonthlyCad: 4000,
    additionalRentMonthlyCad: 1500,
    squareFootage: 1500,
    isRentOverdue: true,
    daysRentOverdue: 16,
    hasPersonalGuarantee: true,
    yearsRemaining: 2
  });
  assert.equal(lockout.lockoutRiskLevel, 'imminent');
  assert.ok(lockout.statutoryRisks.some(r => r.code === 'IMMINENT_CTA_SECTION_18_LOCKOUT'));
  assert.ok(lockout.distraintDoctrine.isAvailableToLandlord);
  assert.equal(lockout.personalGuaranteeLiability.personalGuaranteeExposureCad, 5500 * 24);
  assert.ok(lockout.commercialDemandLetter.includes('FORMAL NOTICE OF COMMERCIAL DISPUTE'));

  // Minor delay (< 15 days)
  const grace = evaluateCommercialLease({
    isRentOverdue: true,
    daysRentOverdue: 5
  });
  assert.equal(grace.lockoutRiskLevel, 'high');
  assert.ok(grace.statutoryRisks.some(r => r.code === 'COUNTDOWN_TO_REENTRY'));
});

test('Rec 567: createTranslationLedger and sanitizeZeroPII redact identifiers and manage translation moderation', () => {
  // PII Redaction
  const dirty = 'Contact me at john.doe@example.com or (416) 555-0199, postal code M5V 2T6, SIN 123-456-789';
  const clean = sanitizeZeroPII(dirty);
  assert.ok(clean.includes('[REDACTED_EMAIL]'));
  assert.ok(clean.includes('[REDACTED_PHONE]'));
  assert.ok(clean.includes('[REDACTED_POSTAL_CODE]'));
  assert.ok(clean.includes('[REDACTED_IDENTIFIER]'));

  // Translation Ledger Workflow
  const ledger = createTranslationLedger();
  const suggestion = ledger.submitTranslationSuggestion({
    termOrRecordId: 'ontario-ohip-card',
    targetLocale: 'hi',
    originalText: 'Health insurance card',
    suggestedTranslation: 'स्वास्थ्य बीमा कार्ड',
    counselorName: 'Anita Sharma',
    organizationCredential: 'Settlement Worker'
  });
  assert.equal(suggestion.status, 'pending');
  assert.equal(suggestion.target_locale, 'hi');

  // Endorsements
  const endorsed = ledger.endorseTranslation({ id: suggestion.id, actor: 'counselor_1' });
  assert.equal(endorsed.endorse_count, 1);

  // Verification
  const verified = ledger.verifyTranslation({ id: suggestion.id, actor: 'lead_editor', status: 'verified' });
  assert.equal(verified.status, 'verified');

  // Listing with filter
  const list = ledger.listTranslations({ locale: 'hi' });
  assert.equal(list.total, 1);
  assert.equal(list.items[0].id, suggestion.id);
});

test('Rec 568: evaluateConsumerContract audits door-to-door appliance ban, 10-day cooling-off, and NOSI liens', () => {
  // Safe null fallback
  const fallback = evaluateConsumerContract(null);
  assert.equal(fallback.province, 'ON');
  assert.equal(fallback.cancellationRights.canCancelWithoutPenalty, true); // Void ab initio by default

  // Void ab initio: Unsolicited door-to-door water heater rental in Ontario (O. Reg. 17/18)
  const voidContract = evaluateConsumerContract({
    province: 'ON',
    contractType: 'water_heater_rental',
    wasUnsolicitedInHomeVisit: true,
    prescribedBannedProduct: true,
    contractValueCad: 5000
  });
  assert.equal(voidContract.doorToDoorBanAudit.isContractVoidAbInitio, true);
  assert.equal(voidContract.cancellationRights.canCancelWithoutPenalty, true);
  assert.ok(voidContract.doorToDoorBanAudit.violationDetail.includes('strictly ban unsolicited direct sales'));
  assert.ok(voidContract.statutoryNoticeLetter.includes('STATUTORY DOOR-TO-DOOR BAN'));

  // 10-day cooling-off period under CPA s. 42
  const coolingOff = evaluateConsumerContract({
    province: 'ON',
    wasUnsolicitedInHomeVisit: false,
    prescribedBannedProduct: false,
    contractDate: '2026-10-28',
    assessmentDate: '2026-10-31' // 3 days elapsed
  });
  assert.equal(coolingOff.timingAudit.isWithinStandard10DayCoolingOff, true);
  assert.equal(coolingOff.cancellationRights.cancellationWindowRemainingDays, 7);

  // Unfair practices (misleading safety threat) -> 1-year rescission under s. 18
  const unfair = evaluateConsumerContract({
    province: 'ON',
    wasUnsolicitedInHomeVisit: false,
    prescribedBannedProduct: false,
    contractDate: '2026-05-01',
    assessmentDate: '2026-10-31', // 6 months elapsed
    hasUnfairPractices: true,
    unfairPracticeType: 'misleading_safety_claim'
  });
  assert.equal(unfair.cancellationRights.canCancelWithoutPenalty, true);
  assert.ok(unfair.unfairPracticesAudit.statutoryFinding.includes('False/Deceptive Representation'));
});

test('Rec 569: isFollowUpQuestion and resolveConversationTurn maintain context-1 conversational follow-ups', () => {
  // Follow-up question patterns
  assert.equal(isFollowUpQuestion('Is it free?'), true);
  assert.equal(isFollowUpQuestion('How much does it cost?'), true);
  assert.equal(isFollowUpQuestion('What documents are required?'), true);
  assert.equal(isFollowUpQuestion('What about Vancouver?'), true);
  assert.equal(isFollowUpQuestion('How do I apply for an Ontario Health Card OHIP?'), false);

  // Turn resolution: Inherit topic and place
  const now = new Date('2026-10-31T12:00:00Z');
  const resolved = resolveConversationTurn({
    question: 'Is it free?',
    previousContext: {
      topic: 'sin',
      city: 'Toronto',
      country: 'CA',
      at: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    }
  }, now);

  assert.equal(resolved.context.status, 'applied');
  assert.equal(resolved.context.version, CONTEXT_CONTRACT_VERSION);
  assert.equal(resolved.input.city, 'Toronto');
  assert.equal(resolved.input.country, 'CA');
  assert.ok(resolved.input.question.includes('Social Insurance Number'));
  assert.ok(resolved.context.assumptions.some(a => a.field === 'topic'));
});

test('Rec 570: getCorridor and listSupportedCorridorCodes map 13 supported global immigration corridors', () => {
  const codes = listSupportedCorridorCodes();
  assert.equal(codes.length, 13);
  assert.ok(codes.includes('CA'));
  assert.ok(codes.includes('US'));
  assert.ok(codes.includes('UK'));
  assert.ok(codes.includes('DE'));
  assert.ok(codes.includes('UAE'));
  assert.ok(codes.includes('AU'));

  const canada = getCorridor('CA');
  assert.equal(canada.name, 'Canada');
  assert.equal(canada.currency, 'CAD');
  assert.ok(canada.officialLanguages.includes('English'));

  const germany = getCorridor('Germany');
  assert.equal(germany.code, 'DE');
  assert.equal(germany.currency, 'EUR');
  assert.ok(germany.tierADomains.includes('bamf.de'));

  // Null input
  assert.equal(getCorridor(null), null);
});

test('Rec 571: findCountryPortal finds national government entry points by country name or alias', () => {
  assert.ok(countryPortals.length > 150);

  const argentina = findCountryPortal('Argentina');
  assert.ok(argentina);
  assert.equal(argentina.country, 'Argentina');

  const brazil = findCountryPortal('Brazil');
  assert.ok(brazil);
  assert.equal(brazil.country, 'Brazil');

  const afghan = findCountryPortal('Afghan');
  assert.ok(afghan);
  assert.equal(afghan.country, 'Afghanistan');

  // Null input
  assert.equal(findCountryPortal(null), null);
});

test('Rec 572: findCountrySettlement provides IRCC-funded settlement and pre-arrival directories', () => {
  assert.ok(countrySettlementRecords.length >= 35);

  const india = findCountrySettlement('India');
  assert.ok(india);
  assert.equal(india.jurisdiction, 'India');
  assert.ok(india.summary.includes('Planning for Canada'));

  const uk = findCountrySettlement('United Kingdom');
  assert.ok(uk);
  assert.equal(uk.jurisdiction, 'United Kingdom');

  const philippines = findCountrySettlement('Philippines');
  assert.ok(philippines);
  assert.ok(philippines.summary.includes('CIIP'));

  // Null input
  assert.equal(findCountrySettlement(null), null);
});

test('Rec 573: cra-newcomer-wealth-navigator audits FHSA, HBP, non-resident TFSA, FMV step-up & AML gift proof', () => {
  // FHSA
  const fhsa = evaluateFhsaEligibility({
    isCanadianResidentForTax: true,
    age: 30,
    hasOwnedHomeInPreceding4Years: false,
    plannedContributionCad: 8000
  });
  assert.equal(fhsa.isEligible, true);
  assert.equal(fhsa.actualDeductibleContributionCad, 8000);
  assert.equal(fhsa.annualLimitCad, CRA_WEALTH_CONSTANTS.FHSA_ANNUAL_LIMIT_CAD);

  // HBP with Budget 2024 $60k limit & 5-year grace period
  const hbp = evaluateHbpWithdrawal({
    rrspBalanceCad: 70000,
    requestedWithdrawalCad: 60000,
    withdrawalDate: '2024-06-01'
  });
  assert.equal(hbp.isEligible, true);
  assert.equal(hbp.maxAllowableWithdrawalCad, 60000);
  assert.equal(hbp.repaymentTerms.gracePeriodYears, 5);

  // Non-resident TFSA 1%/mo penalty
  const tfsa = evaluateTfsaNonResidentPenalty({
    isCanadianTaxResident: false,
    contributionAmountCad: 6000,
    monthsMaintainedWhileNonResident: 4
  });
  assert.equal(tfsa.isPenaltyApplicable, true);
  assert.equal(tfsa.penaltyTaxOwedCad, 240); // 1% of 6000 * 4 = 240

  // Landing step-up under ITA s. 128.1(1)(b) & T1135 first-year exemption
  const stepUp = evaluateForeignPropertyAndLandingStepUp({
    landingDate: '2025-05-15',
    foreignPropertyOriginalCostCad: 200000,
    foreignPropertyFmvAtLandingCad: 350000,
    taxYearToAssess: 2025 // Landing year
  });
  assert.equal(stepUp.landingCostBaseStepUp.deemedCostBaseOnLandingCad, 350000);
  assert.equal(stepUp.landingCostBaseStepUp.preLandingAccruedGainsShelteredCad, 150000);
  assert.equal(stepUp.t1135ReportingAudit.isFirstYearExemptionApplicable, true);
  assert.equal(stepUp.t1135ReportingAudit.isT1135FilingMandatoryThisYear, false);

  // Overseas parental gift AML proof under PCMLTFA
  const gift = evaluateOverseasGiftAndAmlProof({
    giftAmountCad: 100000,
    relationshipToDonor: 'parent',
    hasSignedDeedOfGift: true,
    hasBankConfirmationWireSlip: true
  });
  assert.equal(gift.isTaxableInCanada, false);
  assert.equal(gift.fintracAmlAudit.isAuditReady, true);

  // Master evaluator
  const master = evaluateNewcomerWealthPlan(null);
  assert.ok(master.firstHomeStrategies);
  assert.ok(master.taxCompliance);
});

test('Rec 574: evaluateVoluntaryDisclosure audits CRA VDP 5 conditions, T1135 relief, and General vs Limited track', () => {
  // Safe null fallback
  const fallback = evaluateVoluntaryDisclosure(null);
  assert.ok(fallback.eligibility);
  assert.equal(fallback.eligibility.isEligible, true);

  // Eligible General Track disclosure (voluntary, prior to CRA audit, 2 overdue years)
  const vdpOk = evaluateVoluntaryDisclosure({
    landingYear: 2022,
    taxYearsOmitted: [2023, 2024],
    maxForeignCostAmountCad: 250000,
    foreignIncomeAnnualCad: 12000,
    hasCraContactedOrAudited: false,
    hasActiveOffshoreEntitiesOrShellCompanies: false
  });
  assert.equal(vdpOk.eligibility.isEligible, true);
  assert.equal(vdpOk.eligibility.programTrack, 'General Program');
  assert.equal(vdpOk.t1135Audit.totalT1135PenaltyExposureCad, 5000); // 2 years * $2,500
  assert.ok(vdpOk.reliefScope.penaltyReliefScope.includes('Full waiver'));

  // Limited Track (offshore shell company involved)
  const vdpLimited = evaluateVoluntaryDisclosure({
    hasCraContactedOrAudited: false,
    hasActiveOffshoreEntitiesOrShellCompanies: true
  });
  assert.equal(vdpLimited.eligibility.programTrack, 'Limited Program');

  // Ineligible: CRA audit already active
  const vdpIneligible = evaluateVoluntaryDisclosure({
    hasCraContactedOrAudited: true
  });
  assert.equal(vdpIneligible.eligibility.isEligible, false);
});

test('Rec 575: publicHttpsUrl, permitCrawl, and isCrawlPermitted enforce public HTTPS crawl governance and audits', () => {
  // Public HTTPS URL validator
  assert.ok(publicHttpsUrl('https://www.canada.ca/en/services.html'));
  assert.throws(() => publicHttpsUrl('http://insecure.example.com'), /approved public HTTPS/);
  assert.throws(() => publicHttpsUrl('https://127.0.0.1/admin'), /approved public HTTPS/);
  assert.throws(() => publicHttpsUrl('https://admin:pass@example.com'), /approved public HTTPS/);

  // Database Crawl Permissions
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE sources (id TEXT PRIMARY KEY, url TEXT NOT NULL);`);
    db.exec(`CREATE TABLE suspended_sources (source_id TEXT PRIMARY KEY);`);
    db.prepare('INSERT INTO sources VALUES (?, ?)').run('src-canada', 'https://www.canada.ca/en/services.html');

    const source = { id: 'src-canada', url: 'https://www.canada.ca/en/services.html' };

    // Initially not permitted
    assert.equal(isCrawlPermitted(db, source), false);

    // Permit crawl with audit rationale
    permitCrawl(db, source, {
      reviewer: 'Lead Auditor',
      note: 'Verified official federal government portal with public robots.txt approval',
      allowed: true
    });

    assert.equal(isCrawlPermitted(db, source), true);

    // Verify audit log
    const audit = db.prepare('SELECT * FROM crawl_permission_audit WHERE source_id=?').get('src-canada');
    assert.ok(audit);
    assert.equal(audit.reviewer, 'Lead Auditor');
    assert.equal(audit.allowed, 1);
  } finally {
    db.close();
  }
});
