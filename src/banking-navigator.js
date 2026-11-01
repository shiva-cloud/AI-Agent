// src/banking-navigator.js
// Pan-Canadian Newcomer Banking & 720+ Credit Architecture Engine.
// Evaluates Big 5 newcomer banking packages, enforces statutory account opening rights under
// Bank Act s. 627.17, analyzes Equifax/TransUnion dual-bureau mechanics, and computes 12-month credit trajectory.
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const NEWCOMER_BANK_PACKAGES = {
  scotiabank: {
    bankName: 'Scotiabank',
    programName: 'StartRight Program',
    monthlyFeeWaivedMonths: 12,
    savingsValueCad: 204, // $16.95/mo * 12
    unsecuredCreditLimitCad: 10000,
    creditCardName: 'Scotiabank Scene+ Visa or Momentum Mastercard',
    requiresCanadianCreditHistory: false,
    welcomeBonusCad: 350,
    internationalTransfers: 'Unlimited $0 transfer fee international money transfers for 1 year.',
    specialFeatures: [
      'Unsecured credit card with limits up to $10,000 without Canadian credit history.',
      '1 free small safety deposit box for 1 year.',
      'StartRight auto loan program with zero Canadian credit history required.'
    ]
  },
  rbc: {
    bankName: 'RBC Royal Bank',
    programName: 'RBC Newcomer Advantage',
    monthlyFeeWaivedMonths: 12,
    savingsValueCad: 143, // $11.95/mo * 12
    unsecuredCreditLimitCad: 15000,
    creditCardName: 'RBC ION+ Visa or RBC Cash Back Mastercard',
    requiresCanadianCreditHistory: false,
    welcomeBonusCad: 300,
    internationalTransfers: '2 free international money transfers per month for 12 months.',
    specialFeatures: [
      'Largest branch network in Canada with dedicated multicultural newcomer advisors.',
      'No credit history required for car financing or credit cards.',
      'Arrive settlement app integration and credit building tracking.'
    ]
  },
  td: {
    bankName: 'TD Canada Trust',
    programName: 'TD New to Canada Banking Package',
    monthlyFeeWaivedMonths: 12,
    savingsValueCad: 203, // $16.95/mo * 12
    unsecuredCreditLimitCad: 5000,
    creditCardName: 'TD Cash Back Visa or TD Rewards Visa',
    requiresCanadianCreditHistory: false,
    welcomeBonusCad: 400,
    internationalTransfers: 'Up to $100 transfer fee rebate on TD Global Transfer for 12 months.',
    specialFeatures: [
      'Longest branch opening hours including evenings and Sundays across major metropolitan areas.',
      'High welcome cash incentive upon setting up direct deposit.',
      'No fee on TD Unlimited Chequing Account for 12 months.'
    ]
  },
  bmo: {
    bankName: 'BMO Bank of Montreal',
    programName: 'BMO NewStart Program',
    monthlyFeeWaivedMonths: 12,
    savingsValueCad: 203,
    unsecuredCreditLimitCad: 5000,
    creditCardName: 'BMO CashBack Mastercard or AIR MILES Mastercard',
    requiresCanadianCreditHistory: false,
    welcomeBonusCad: 350,
    internationalTransfers: 'Unlimited fee-free global money transfers for 12 months.',
    specialFeatures: [
      'Free BMO Performance Chequing Plan with unlimited transactions.',
      '1 free safety deposit box for 1 year (worth ~$65 CAD).',
      'Special BMO Western Union transfer discounts.'
    ]
  },
  cibc: {
    bankName: 'CIBC',
    programName: 'CIBC Smart for Newcomers',
    monthlyFeeWaivedMonths: 24, // CIBC offers 2 full years
    savingsValueCad: 406, // $16.95/mo * 24
    unsecuredCreditLimitCad: 10000,
    creditCardName: 'CIBC Dividend Visa or Aventura Visa',
    requiresCanadianCreditHistory: false,
    welcomeBonusCad: 400,
    internationalTransfers: '$0 transfer fees with CIBC Global Money Transfer.',
    specialFeatures: [
      '24 months (2 full years) of waived monthly banking fees (longest among Big 5).',
      'Free global money wire transfers to over 120 countries.',
      'Up to $2,000 to $10,000 credit limit without prior credit score.'
    ]
  }
};

export const CREDIT_BUREAU_FACTORS = [
  { factor: 'Payment History', weightPercent: 35, rule: 'Paying at least the minimum by the due date every single month. A single 30-day late payment drops score by 60-110 points and stays on file for 6 years.' },
  { factor: 'Credit Utilization Ratio', weightPercent: 30, rule: 'Keep statement balance below 30% of total credit limit (ideally under 10%). Utilization is recalculated every month with no historical memory.' },
  { factor: 'Length of Credit History', weightPercent: 15, rule: 'Age of oldest credit account. Never cancel your very first Canadian credit card, as closing it shortens your average credit history.' },
  { factor: 'Credit Mix', weightPercent: 10, rule: 'Healthy combination of revolving credit (credit card) and installment credit (postpaid mobile phone plan, car loan).' },
  { factor: 'New Credit / Hard Inquiries', weightPercent: 10, rule: 'Limit hard inquiries. Applying for multiple credit cards within weeks triggers multiple 5-10 point penalties.' }
];

export function evaluateBankingAndCreditStrategy({
  selectedBank = 'all',
  monthlySpendingCad = 600,
  targetCreditScore = 720,
  hasPostpaidPhonePlan = true,
  immigrationCategory = 'pr',
  clientName = 'Newcomer',
  assessmentDate = '2026-10-31'
} = {}) {
  const cleanClient = boundedText(clientName, 'Newcomer', 120);
  const cleanDate = safeIsoDate(assessmentDate, '2026-10-31');
  const normBank = boundedText(selectedBank, 'all', 50).toLowerCase();
  const spend = Number.isFinite(Number(monthlySpendingCad)) ? Math.min(50000, Math.max(50, Number(monthlySpendingCad))) : 600;
  const target = Number.isFinite(Number(targetCreditScore)) ? Math.min(850, Math.max(300, Math.floor(Number(targetCreditScore)))) : 720;
  const hasPhone = Boolean(hasPostpaidPhonePlan);
  const status = boundedText(immigrationCategory, 'pr', 50).toLowerCase();

  // Evaluate Packages
  const packagesList = Object.values(NEWCOMER_BANK_PACKAGES).map(pkg => {
    const totalBenefitValueCad = pkg.savingsValueCad + pkg.welcomeBonusCad;
    return {
      bankName: pkg.bankName,
      programName: pkg.programName,
      monthlyFeeWaivedMonths: pkg.monthlyFeeWaivedMonths,
      savingsValueCad: pkg.savingsValueCad,
      welcomeBonusCad: pkg.welcomeBonusCad,
      totalBenefitValueCad,
      unsecuredCreditLimitCad: pkg.unsecuredCreditLimitCad,
      creditCardName: pkg.creditCardName,
      internationalTransfers: pkg.internationalTransfers,
      specialFeatures: pkg.specialFeatures
    };
  });

  // Bank Act s.627.17 Legal Right to Retail Account
  const bankActRights = {
    statute: 'Bank Act (S.C. 1991, c. 46), Section 627.17 & Access to Basic Banking Services Regulations (SOR/2003-184)',
    coreRight: 'Every individual in Canada is statutorily entitled to open a personal retail bank account at any federal bank without being employed, without making an initial cash deposit, and without a credit check.',
    mandatoryIdRequirements: [
      'Two documents from Part A or Part B: Valid Foreign Passport + Canadian Immigration Document (COPR, Work Permit, or Study Permit).',
      'No Canadian credit check is legally required or permitted as a precondition for opening a basic chequing account.'
    ],
    tellerDisputeNotice: 'BANK ACT SECTION 627.17 STATUTORY COMPLIANCE NOTICE:\n"Under Section 627.17 of the federal Bank Act and FCAC guidelines, a bank cannot refuse to open a personal retail deposit account solely on the grounds that the applicant is unemployed, does not have a credit history, or has a temporary address, provided two official identification documents are presented. If service is refused, please provide a written refusal notice citing the statutory grounds under Section 627.18."'
  };

  // Utilization Optimization
  const recommendedCreditLimit = Math.max(2000, spend * 3.5);
  const optimalStatementBalance = Math.round(spend * 0.10); // 10% optimal utilization

  // 12-Month Score Booster Roadmap
  const twelveMonthRoadmap = [
    {
      month: 1,
      milestone: 'Account Opening & Credit File Genesis',
      targetScore: 0,
      phase: 'Thin File',
      actions: [
        'Open newcomer bank package under Bank Act s.627.17 at chosen institution (fee waived for 12-24 mos).',
        'Obtain initial unsecured newcomer credit card ($1,000 - $2,000 limit) with zero credit history.',
        hasPhone ? 'Set up postpaid mobile phone plan; carrier begins monthly reporting to Equifax/TransUnion.' : 'Set up a postpaid mobile phone plan to register an active trade-line on your credit file.'
      ]
    },
    {
      month: 3,
      milestone: 'Initial Credit Score Generation',
      targetScore: 650,
      phase: 'Score Established',
      actions: [
        'First official Equifax/TransUnion score generated after 90 days of consecutive on-time reporting.',
        'Keep reported statement balance below 20% by paying partial balance 2 days BEFORE statement closing date.',
        'Never miss the statutory minimum payment due date.'
      ]
    },
    {
      month: 6,
      milestone: 'Credit Limit Doubling & Utilization Compression',
      targetScore: 690,
      phase: 'Good Standing',
      actions: [
        'Request credit limit increase from $2,000 to $5,000 through online banking without hard inquiry.',
        'Higher credit limit automatically compresses monthly utilization ratio to < 10% for the exact same spending.',
        'Check free consumer credit file via Borrowell (Equifax) or Credit Karma (TransUnion) without point deduction.'
      ]
    },
    {
      month: 9,
      milestone: 'Credit Mix Diversification',
      targetScore: 720,
      phase: 'Prime Tier',
      actions: [
        'Score reaches prime threshold (720+).',
        'Eligible for premium credit cards (points/cashback) or Tier-1 auto financing rates.',
        'Ensure zero hard inquiries in the preceding 90 days before major rental or loan applications.'
      ]
    },
    {
      month: 12,
      milestone: 'A-Lender Prime Mortgage & Tier-1 Status',
      targetScore: 750,
      phase: 'Excellent / Super Prime',
      actions: [
        'Established 12-month flawless payment record across multiple trade-lines.',
        'Eligible to be considered for prime CMHC / A-lender residential mortgage rates without private lender surcharges.',
        'Switch or renegotiate banking package as initial promotional waiver approaches end of year 1.'
      ]
    }
  ];

  const statutoryAdvisories = [
    'Foreign Credit History Does Not Transfer: Neither Equifax Canada nor TransUnion Canada import credit scores from the US, UK, India, or other countries. All newcomers start with a blank file ("thin file").',
    'Bank Act s.627.17 Protection: Tellers cannot demand a Canadian credit check or proof of Canadian employment to open a chequing account. Present your passport and COPR / Work Permit.',
    'Statement Date vs Due Date Secret: Credit bureaus receive your balance on your statement date, NOT your due date. To keep reported utilization low, pay off most of your purchases 2-3 days before the statement cycle closes.',
    'Hard Inquiries Deduction: Each hard credit check (e.g., applying for a credit card or auto loan) drops your score by 5 to 10 points for up to 12 months. Pre-approvals and soft checks do not impact your score.',
    'CDIC Deposit Insurance: Deposits at member institutions (including chequing, savings, and GICs) are automatically insured by the Canada Deposit Insurance Corporation (CDIC) up to $100,000 CAD per depositor per category.'
  ];

  return {
    asOf: cleanDate,
    assessmentDate: cleanDate,
    clientName: cleanClient,
    selectedBank: normBank,
    monthlySpendingCad: spend,
    targetCreditScore: target,
    hasPostpaidPhonePlan: hasPhone,
    immigrationCategory: status,
    packagesComparison: packagesList,
    bankActStatutoryRights: bankActRights,
    creditBureauFactors: CREDIT_BUREAU_FACTORS,
    utilizationOptimization: {
      monthlySpendCad: spend,
      recommendedCreditLimitCad: Math.round(recommendedCreditLimit),
      optimalReportedStatementBalanceCad: optimalStatementBalance,
      targetUtilizationPercent: 10,
      goldenRule: 'Pay 80-90% of your current balance 3 business days before your statement closes so only 10% is transmitted to Equifax and TransUnion.'
    },
    twelveMonthRoadmap,
    statutoryAdvisories,
    authority: 'Bank Act (S.C. 1991, c. 46), Section 627.17 & Financial Consumer Agency of Canada (FCAC)'
  };
}
