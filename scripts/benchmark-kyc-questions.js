// KYC & Human Settlement Advisory Verification Benchmark
// Tests core newcomer KYC scenarios across banking, housing, right-to-work, OHIP, driving, and anti-fraud.

const BASE_URL = 'http://localhost:3000/v1/answers';

const kycScenarios = [
  {
    id: 'KYC-BANK-01',
    category: 'Banking KYC (Bank Act 627.17)',
    question: 'Can a bank refuse to open an account if I have no job in Mississauga?',
    expectedClaim: 'fintrac-banking-kyc-bank-act',
    intent: 'money'
  },
  {
    id: 'KYC-BANK-02',
    category: 'Banking KYC (Two-Document Rule)',
    question: 'What is the two-document rule for opening a personal retail bank account in Toronto?',
    expectedClaim: 'fintrac-banking-kyc-bank-act',
    intent: 'money'
  },
  {
    id: 'KYC-CREDIT-01',
    category: 'Secured Credit Cards & Credit Building',
    question: 'How do I build Canadian credit from zero with a secured credit card in Toronto?',
    expectedClaim: 'fcac-secured-credit-card-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-FINTRAC-01',
    category: 'FINTRAC AML Reporting',
    question: 'Do I need to report a 10000 dollar wire transfer to Canada in Vancouver?',
    expectedClaim: 'fintrac-large-wire-transfer-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-FINTRAC-02',
    category: 'Source of Funds Proof',
    question: 'What source of funds documents are needed for large cash deposits under FINTRAC in Toronto?',
    expectedClaim: 'fintrac-large-wire-transfer-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-RENT-01',
    category: 'Tenant Screening & SIN Protection',
    question: 'Can a landlord demand my SIN on a rental application in Toronto?',
    expectedClaim: 'ontario-tenant-kyc-screening-rights',
    intent: 'housing'
  },
  {
    id: 'KYC-RENT-02',
    category: 'Tenant Credit History Protection',
    question: 'Can a landlord reject my rental application for having no Canadian credit history in Brampton?',
    expectedClaim: 'ontario-tenant-kyc-screening-rights',
    intent: 'housing'
  },
  {
    id: 'KYC-RENT-03',
    category: 'Key Deposits & Guarantor Rules',
    question: 'Is a landlord allowed to charge a 500 dollar key deposit in Toronto?',
    expectedClaim: 'ontario-tenant-guarantor-and-key-deposit-kyc',
    intent: 'housing'
  },
  {
    id: 'KYC-SIN-01',
    category: 'SIN Disclosure Limits & Privacy',
    question: 'When is it legally mandatory to provide my SIN in Canada?',
    expectedClaim: 'service-canada-sin-disclosure-kyc-rights',
    intent: 'sin'
  },
  {
    id: 'KYC-WORK-01',
    category: 'Right-to-Work (WP-EXT Letter)',
    question: 'Can an employer verify my right to work using a WP-EXT letter in Mississauga?',
    expectedClaim: 'ircc-employer-kyc-right-to-work',
    intent: 'employment'
  },
  {
    id: 'KYC-WORK-02',
    category: 'Temporary Worker 900-Series SIN',
    question: 'What does a 900-series SIN mean for employer right to work checks in Toronto?',
    expectedClaim: 'ircc-employer-kyc-right-to-work',
    intent: 'employment'
  },
  {
    id: 'KYC-WORK-03',
    category: 'Vulnerable Sector Check (VSC)',
    question: 'How do I apply for a police vulnerable sector check for a healthcare job in Toronto?',
    expectedClaim: 'police-vulnerable-sector-check-vsc-kyc',
    intent: 'employment'
  },
  {
    id: 'KYC-OHIP-01',
    category: 'Healthcare KYC (Regulation 552)',
    question: 'What are the 3 list documents required for OHIP under regulation 552 in Toronto?',
    expectedClaim: 'ontario-ohip-kyc-regulation-552',
    intent: 'health'
  },
  {
    id: 'KYC-VITAL-01',
    category: 'Newborn 5-in-1 & 6-Day Address Change',
    question: 'How many days do I have to update my address on my Ontario health card in Mississauga?',
    expectedClaim: 'serviceontario-vital-stats-baby-and-address-kyc',
    intent: 'health'
  },
  {
    id: 'KYC-DRIVE-01',
    category: 'Driver Licensing Authentication',
    question: 'Do DriveTest centres require certified ATIO translations for foreign licences in Brampton?',
    expectedClaim: 'drivetest-kyc-document-authentication',
    intent: 'driving'
  },
  {
    id: 'KYC-FRAUD-01',
    category: 'Newcomer Anti-Fraud Scam Shield',
    question: 'Will CRA or immigration officers call and threaten deportation over the phone in Vancouver?',
    expectedClaim: 'antifraud-newcomer-scam-shield',
    intent: 'community'
  },
  {
    id: 'KYC-POE-01',
    category: 'Border POE Currency Declaration (E677)',
    question: 'Do I need to declare 10000 dollars cash at port of entry with CBSA in Vancouver?',
    expectedClaim: 'cbsa-poe-currency-declaration-e677',
    intent: 'money'
  },
  {
    id: 'KYC-SCHOOL-01',
    category: 'Dependent Child School Registration KYC',
    question: 'What documents are required for dependent school registration in Toronto?',
    expectedClaim: 'tdsb-pdsb-vsb-dependent-school-registration-kyc',
    intent: 'family'
  },
  {
    id: 'KYC-PHOTO-01',
    category: 'Ontario Photo Card for Non-Drivers',
    question: 'How can a non-driver get an Ontario photo card for identity verification in Brampton?',
    expectedClaim: 'serviceontario-provincial-photo-card-non-drivers',
    intent: 'community'
  },
  {
    id: 'KYC-BENEFIT-01',
    category: 'CRA Pre-Tax Filing Benefits (RC151/RC66)',
    question: 'Can newcomers apply for the GST credit using form RC151 before filing taxes in Mississauga?',
    expectedClaim: 'cra-newcomer-benefit-registration-rc151-rc66',
    intent: 'money'
  },
  {
    id: 'KYC-SIN-02',
    category: 'SIN 900-Series Expiry & Maintained Status Renewal',
    question: 'How do I renew my 900-series temporary resident SIN during maintained status in Toronto?',
    expectedClaim: 'service-canada-sin-temporary-expiry-and-renewal-kyc',
    intent: 'employment'
  },
  {
    id: 'KYC-CRA-02',
    category: 'CRA Digital KYC via Interac Sign-In Partner',
    question: 'How can a first-year newcomer register for CRA My Account using Interac Sign-In Partner in Toronto?',
    expectedClaim: 'cra-my-account-interac-sign-in-partner-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-GIFT-01',
    category: 'Tax-Free Overseas Parental Gifts & Gift Deeds',
    question: 'Are cash gifts from parents abroad taxable in Canada when transferred to Toronto?',
    expectedClaim: 'fintrac-cra-tax-free-family-gift-wire-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-FRAUD-02',
    category: 'Equifax & TransUnion Fraud Alerts',
    question: 'How do I place a fraud alert on my credit bureau file with Equifax and TransUnion in Toronto?',
    expectedClaim: 'consumer-protection-equifax-transunion-fraud-alert-kyc',
    intent: 'money'
  },
  {
    id: 'KYC-MSP-01',
    category: 'BC MSP Enrollment & BC Services Card',
    question: 'What are the identity documents and waiting period for BC MSP enrollment in Vancouver?',
    expectedClaim: 'bc-msp-services-card-kyc-enrollment',
    intent: 'health'
  },
  {
    id: 'KYC-LTB-01',
    category: 'LTB Form T2 Tenant Harassment & Entry Rights',
    question: 'Can a landlord enter without 24 hours notice or harass a tenant and how to file Form T2 in Brampton?',
    expectedClaim: 'ontario-tenant-board-ltb-t2-harassment-kyc',
    intent: 'housing'
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('================================================================');
  console.log(`RUNNING EXPANDED KYC & SETTLEMENT ADVISORY BENCHMARK (${kycScenarios.length} SCENARIOS)`);
  console.log('================================================================');

  let passed = 0;
  for (const s of kycScenarios) {
    let retries = 5;
    let res, data;
    while (retries > 0) {
      try {
        res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: s.question, language: 'en' })
        });
        if (res.status === 429) {
          const delay = parseInt(res.headers.get('retry-after') || '1', 10) * 1000 + 50;
          await sleep(delay);
          retries--;
          continue;
        }
        data = await res.json();
        break;
      } catch (err) {
        await sleep(200);
        retries--;
      }
    }

    const claimIds = (data?.claims || []).map(c => c.evidenceId);
    const hasExpected = claimIds.includes(s.expectedClaim);
    const isGuidance = data?.status === 'guidance' || data?.status === 'partial';

    if (hasExpected && isGuidance) {
      console.log(`✔ [${s.id}] ${s.category}: PASSED (Matched: ${s.expectedClaim})`);
      passed++;
    } else {
      console.log(`❌ [${s.id}] ${s.category}: FAILED (Status: ${data?.status}, Claims: ${claimIds.join(', ')})`);
    }
    await sleep(25);
  }

  console.log('================================================================');
  console.log(`KYC BENCHMARK FINISHED: ${passed} / ${kycScenarios.length} PASSED (${((passed / kycScenarios.length) * 100).toFixed(1)}%)`);
  console.log('================================================================');
  if (passed !== kycScenarios.length) process.exit(1);
}

run();
