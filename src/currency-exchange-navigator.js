// src/currency-exchange-navigator.js
// Cross-Border Banking & USD/CAD Currency Exchange Optimization Engine.
// Audits foreign exchange spreads, Norbert's Gambit mechanics, cross-border ACH channels,
// and FINTRAC statutory anti-structuring compliance under:
// - Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA, S.C. 2000, c. 17, ss. 7, 9, 12, 75)
// - PCMLTFA Regulations (SOR/2007-292, ss. 53, 95: LCTR $10k & EFTR $10k 24-hour rule)
// - Criminal Code (R.S.C., 1985, c. C-46, s. 462.31: Laundering proceeds of crime / structuring offence)
// - CIRO / IIROC Rule 3200 & Rule 3800 (Inter-listed securities & T+1 Settlement Cycle standard)
// - Bank Act (S.C. 1991, c. 46: KYC & Cross-Border Retail Banking).
// Pure ES module with zero npm runtime dependencies.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FINTRAC_STATUTORY_CONSTANTS = {
  LCTR_THRESHOLD_CAD: 10000, // Large Cash Transaction Report threshold (physical currency)
  EFTR_THRESHOLD_CAD: 10000, // Electronic Funds Transfer Report threshold (international wire/EFT)
  AGGREGATION_WINDOW_HOURS: 24, // 24-hour rule aggregates multiple transactions conducted by same person
  LCTR_REPORTING_TIMEFRAME: 'Within 24 hours of transaction',
  EFTR_REPORTING_TIMEFRAME: 'Within 5 business days of transaction',
  STRUCTURING_OFFENCE_STATUTE: 'PCMLTFA s. 75 & Criminal Code s. 462.31',
  STR_STATUTE: 'PCMLTFA s. 7 (Suspicious Transaction Report)'
};

// Benchmark mid-market interbank exchange rates (approximate operational reference)
export const MID_MARKET_BENCHMARK_RATES = {
  USD_TO_CAD: 1.3650,
  CAD_TO_USD: 0.7326,
  EUR_TO_CAD: 1.4720,
  CAD_TO_EUR: 0.6793,
  GBP_TO_CAD: 1.7350,
  CAD_TO_GBP: 0.5764,
  INR_TO_CAD: 0.0163,
  CAD_TO_INR: 61.3497,
  CNY_TO_CAD: 0.1885,
  CAD_TO_CNY: 5.3050,
  AED_TO_CAD: 0.3716,
  CAD_TO_AED: 2.6910
};

export const BROKERAGE_COMMISSIONS = {
  nbdb: { name: 'National Bank Direct Brokerage (NBDB)', buyCommissionCad: 0, sellCommissionCad: 0, journalFeeCad: 0 },
  disnat: { name: 'Desjardins Online Brokerage (Disnat)', buyCommissionCad: 0, sellCommissionCad: 0, journalFeeCad: 0 },
  questrade: { name: 'Questrade', buyCommissionCad: 0, sellCommissionCad: 4.95, journalFeeCad: 0 },
  td_direct: { name: 'TD Direct Investing (WebBroker)', buyCommissionCad: 9.99, sellCommissionCad: 9.99, journalFeeCad: 0 },
  rbc_direct: { name: 'RBC Direct Investing', buyCommissionCad: 9.95, sellCommissionCad: 9.95, journalFeeCad: 0 },
  bmo_investorline: { name: 'BMO InvestorLine', buyCommissionCad: 9.95, sellCommissionCad: 9.95, journalFeeCad: 0 },
  cibc_investors_edge: { name: "CIBC Investor's Edge", buyCommissionCad: 6.95, sellCommissionCad: 6.95, journalFeeCad: 0 }
};

export function evaluateCurrencyExchange(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    amount = 10000,
    fromCurrency = 'USD',
    toCurrency = 'CAD',
    sourceOfFunds = 'savings_income', // 'savings_income', 'property_sale', 'inheritance', 'family_gift', 'business_dividends', 'unspecified'
    isSplitIntoMultipleTranches = false,
    trancheCount = 1,
    brokeragePlatform = 'questrade', // 'nbdb', 'disnat', 'questrade', 'td_direct', 'rbc_direct', 'bmo_investorline', 'cibc_investors_edge', 'none'
    hasCrossBorderAccount = false,
    clientName = 'Client',
    assessmentDate = todayIso()
  } = safeParams;
  const safeClientName = boundedText(clientName, 'Client', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const normAmount = Math.max(1, Math.min(1000000000, Number(amount) || 10000));
  const normFrom = boundedText(fromCurrency, 'USD', 10).toUpperCase();
  const normTo = boundedText(toCurrency, 'CAD', 10).toUpperCase();
  const normSource = boundedText(sourceOfFunds, 'savings_income', 50).toLowerCase();
  const normBroker = boundedText(brokeragePlatform, 'questrade', 50).toLowerCase();
  const tranches = Math.max(1, Math.min(100, Math.floor(Number(trancheCount) || 1)));
  const isSplit = Boolean(isSplitIntoMultipleTranches) || tranches > 1;

  // Determine benchmark mid-market rate
  const pairKey = `${normFrom}_TO_${normTo}`;
  let benchmarkRate = MID_MARKET_BENCHMARK_RATES[pairKey];
  if (!benchmarkRate) {
    if (normFrom === normTo) {
      benchmarkRate = 1.0;
    } else if (normTo === 'CAD' && MID_MARKET_BENCHMARK_RATES[`${normFrom}_TO_CAD`]) {
      benchmarkRate = MID_MARKET_BENCHMARK_RATES[`${normFrom}_TO_CAD`];
    } else if (normFrom === 'CAD' && MID_MARKET_BENCHMARK_RATES[`CAD_TO_${normTo}`]) {
      benchmarkRate = MID_MARKET_BENCHMARK_RATES[`CAD_TO_${normTo}`];
    } else {
      benchmarkRate = 1.35; // Default safe estimate
    }
  }

  // Calculate gross converted benchmark amount
  const grossBenchmarkReceived = normAmount * benchmarkRate;

  // Convert gross amount to CAD equivalent to evaluate FINTRAC thresholds
  let cadEquivalentTotal = normAmount;
  if (normFrom !== 'CAD') {
    const toCadRate = MID_MARKET_BENCHMARK_RATES[`${normFrom}_TO_CAD`] || (benchmarkRate && normTo === 'CAD' ? benchmarkRate : 1.35);
    cadEquivalentTotal = normAmount * toCadRate;
  }

  // Provider fee simulations
  // 1. Big 5 Bank Retail FX & Wire
  const big5SpreadPct = 0.0275; // 2.75% retail spread
  const big5SpreadCost = grossBenchmarkReceived * big5SpreadPct;
  const big5InboundWireFeeCad = 15;
  
  const big5TotalFeeDragCad = big5SpreadCost + big5InboundWireFeeCad + (hasCrossBorderAccount ? 0 : 25); // Intermediary SWIFT fees
  const big5EstimatedReceived = Math.max(0, grossBenchmarkReceived - big5TotalFeeDragCad);
  const big5EffectiveRate = big5EstimatedReceived / normAmount;

  // 2. Specialized FX Broker (e.g. Knightsbridge, OFX)
  const brokerSpreadPct = 0.0065; // 0.65% spread
  const brokerSpreadCost = grossBenchmarkReceived * brokerSpreadPct;
  const brokerWireFeeCad = normAmount >= 5000 ? 0 : 15;
  const brokerTotalFeeDragCad = brokerSpreadCost + brokerWireFeeCad;
  const brokerEstimatedReceived = Math.max(0, grossBenchmarkReceived - brokerTotalFeeDragCad);
  const brokerEffectiveRate = brokerEstimatedReceived / normAmount;

  // 3. Fintech / Wise
  const fintechSpreadPct = 0.0045; // 0.45% average transparent fee
  const fintechFeeCost = grossBenchmarkReceived * fintechSpreadPct;
  const fintechFixedFeeCad = 2.50;
  const fintechTotalFeeDragCad = fintechFeeCost + fintechFixedFeeCad;
  const fintechEstimatedReceived = Math.max(0, grossBenchmarkReceived - fintechTotalFeeDragCad);
  const fintechEffectiveRate = fintechEstimatedReceived / normAmount;

  // 4. Norbert's Gambit (Available for USD <-> CAD only)
  const isUsdCadCorridor = (normFrom === 'USD' && normTo === 'CAD') || (normFrom === 'CAD' && normTo === 'USD');
  let norbertsGambitOption = null;

  if (isUsdCadCorridor) {
    const brokerCfg = BROKERAGE_COMMISSIONS[normBroker] || BROKERAGE_COMMISSIONS.questrade;
    const bidAskSpreadPct = 0.0010; // 0.10% TSX ETF bid-ask spread
    const bidAskCost = grossBenchmarkReceived * bidAskSpreadPct;
    const totalCommissionsCad = brokerCfg.buyCommissionCad + brokerCfg.sellCommissionCad + brokerCfg.journalFeeCad;
    const ngTotalFeeDragCad = bidAskCost + totalCommissionsCad;
    const ngEstimatedReceived = Math.max(0, grossBenchmarkReceived - ngTotalFeeDragCad);
    const ngEffectiveRate = ngEstimatedReceived / normAmount;

    norbertsGambitOption = {
      providerId: 'norberts_gambit',
      providerName: `Norbert's Gambit (${brokerCfg.name})`,
      effectiveRate: Number(ngEffectiveRate.toFixed(4)),
      estimatedReceivedAmount: Number(ngEstimatedReceived.toFixed(2)),
      totalFeeDragCad: Number(ngTotalFeeDragCad.toFixed(2)),
      feeDragPercentage: Number(((ngTotalFeeDragCad / grossBenchmarkReceived) * 100).toFixed(2)),
      breakdown: {
        spreadCostCad: Number(bidAskCost.toFixed(2)),
        fixedFeesCad: Number(totalCommissionsCad.toFixed(2)),
        intermediaryFeesCad: 0
      },
      transferTime: '2 business days (T+1 ETF settlement + same-day journal)',
      recommendationRank: normAmount >= 3000 ? 1 : 2,
      pros: [
        'Zero retail FX markup (executes at true TSX stock exchange spot rate)',
        'Free journaling at Canadian brokers under CIRO rules',
        'T+1 accelerated settlement cycle (effective May 2024)'
      ],
      cons: [
        'Requires self-directed Canadian brokerage account with both CAD and USD sub-accounts',
        'Takes 1 to 2 business days to journal shares across currencies'
      ]
    };
  }

  const providers = [
    {
      providerId: 'fintech_wise',
      providerName: 'Digital FX / Fintech (Wise, OFX)',
      effectiveRate: Number(fintechEffectiveRate.toFixed(4)),
      estimatedReceivedAmount: Number(fintechEstimatedReceived.toFixed(2)),
      totalFeeDragCad: Number(fintechTotalFeeDragCad.toFixed(2)),
      feeDragPercentage: Number(((fintechTotalFeeDragCad / grossBenchmarkReceived) * 100).toFixed(2)),
      breakdown: {
        spreadCostCad: Number(fintechFeeCost.toFixed(2)),
        fixedFeesCad: Number(fintechFixedFeeCad.toFixed(2)),
        intermediaryFeesCad: 0
      },
      transferTime: 'Instant to 24 hours',
      recommendationRank: isUsdCadCorridor && normAmount >= 3000 ? 2 : 1,
      pros: [
        'Mid-market rate with low transparent fee (~0.45%)',
        'Direct local bank deposit without international wire fees',
        'Simple mobile interface'
      ],
      cons: [
        'May have single-transaction funding limits (e.g. $25k-$50k per day)',
        'Not as cost-effective as Norbert\'s Gambit for large sums ($10,000+)'
      ]
    },
    {
      providerId: 'specialized_fx_broker',
      providerName: 'Specialized Currency Broker (Knightsbridge FX / Currencies Direct)',
      effectiveRate: Number(brokerEffectiveRate.toFixed(4)),
      estimatedReceivedAmount: Number(brokerEstimatedReceived.toFixed(2)),
      totalFeeDragCad: Number(brokerTotalFeeDragCad.toFixed(2)),
      feeDragPercentage: Number(((brokerTotalFeeDragCad / grossBenchmarkReceived) * 100).toFixed(2)),
      breakdown: {
        spreadCostCad: Number(brokerSpreadCost.toFixed(2)),
        fixedFeesCad: Number(brokerWireFeeCad.toFixed(2)),
        intermediaryFeesCad: 0
      },
      transferTime: '1 to 2 business days',
      recommendationRank: 3,
      pros: [
        'Competitive fixed spread (0.5% - 0.7%) for large lump sums',
        'Dedicated currency dealer phone support',
        'Zero wire fees on transactions over $5,000'
      ],
      cons: [
        'Requires phone/email booking for best rates',
        'Slower setup for first-time account registration'
      ]
    },
    {
      providerId: 'big5_bank',
      providerName: 'Big 5 Canadian Bank (Standard Wire & Counter Exchange)',
      effectiveRate: Number(big5EffectiveRate.toFixed(4)),
      estimatedReceivedAmount: Number(big5EstimatedReceived.toFixed(2)),
      totalFeeDragCad: Number(big5TotalFeeDragCad.toFixed(2)),
      feeDragPercentage: Number(((big5TotalFeeDragCad / grossBenchmarkReceived) * 100).toFixed(2)),
      breakdown: {
        spreadCostCad: Number(big5SpreadCost.toFixed(2)),
        fixedFeesCad: Number(big5InboundWireFeeCad.toFixed(2)),
        intermediaryFeesCad: Number((hasCrossBorderAccount ? 0 : 25).toFixed(2))
      },
      transferTime: '2 to 4 business days',
      recommendationRank: 4,
      pros: [
        'Convenient if you already hold checking accounts with the bank',
        'Direct branch in-person support'
      ],
      cons: [
        'Expensive hidden FX markup (2.5% to 3.5% above interbank mid-market)',
        'Inbound wire fee ($15 CAD) plus correspondent intermediary SWIFT deductions ($20-$50)',
        'Costs hundreds or thousands more on newcomer settlement funds'
      ]
    }
  ];

  if (norbertsGambitOption) {
    providers.unshift(norbertsGambitOption);
    providers.sort((a, b) => a.recommendationRank - b.recommendationRank);
  }

  const bestOption = providers[0];
  const savingsVersusBig5Cad = Math.max(0, Number((big5TotalFeeDragCad - bestOption.totalFeeDragCad).toFixed(2)));

  // FINTRAC Statutory Compliance & Anti-Structuring Audit
  const isReportableFintrac = cadEquivalentTotal >= FINTRAC_STATUTORY_CONSTANTS.EFTR_THRESHOLD_CAD;
  const reportingRequirements = [];

  if (isReportableFintrac) {
    reportingRequirements.push({
      statute: 'PCMLTFA s. 12(1) & Regulation SOR/2007-292 s. 95',
      form: 'Electronic Funds Transfer Report (EFTR)',
      deadline: FINTRAC_STATUTORY_CONSTANTS.EFTR_REPORTING_TIMEFRAME,
      description: `Transactions equal to or exceeding $10,000 CAD (or foreign equivalent) sent or received internationally must be reported to FINTRAC by the financial entity within 5 working days.`
    });
    reportingRequirements.push({
      statute: 'PCMLTFA Regulation SOR/2007-292 s. 95(1)(b) (24-Hour Rule)',
      form: '24-Hour Aggregation Audit',
      deadline: 'Consecutive 24-hour window',
      description: `Multiple transfers conducted within 24 consecutive hours by or on behalf of the same client totaling $10,000 CAD or more are statutorily aggregated and reported as a single reportable transfer.`
    });
  }

  // Structuring / Smurfing Risk Evaluation
  let structuringRisk = {
    hasStructuringRisk: false,
    severity: 'COMPLIANT',
    warningMessage: null
  };

  const trancheAmount = cadEquivalentTotal / tranches;
  // If user splits funds into tranches each between $7,000 and $9,999 CAD, flag severe structuring risk
  if (isSplit && tranches > 1 && trancheAmount >= 6000 && trancheAmount < FINTRAC_STATUTORY_CONSTANTS.EFTR_THRESHOLD_CAD) {
    structuringRisk = {
      hasStructuringRisk: true,
      severity: 'CRITICAL_LEGAL_RISK',
      warningMessage: `CRITICAL STATUTORY WARNING: Intentionally splitting transfers into sub-$10,000 tranches (e.g. sending $${Math.round(trancheAmount).toLocaleString()} CAD x ${tranches}) constitutes 'structuring' or 'smurfing' under ${FINTRAC_STATUTORY_CONSTANTS.STRUCTURING_OFFENCE_STATUTE}. Banks monitor for this pattern and can file a Suspicious Transaction Report (STR) under PCMLTFA s. 7, which can lead to frozen funds or a closed account. Sending legitimate funds in one transfer is legal, and a large-transaction report on its own does not mean you owe tax or face an immigration problem.`
    };
  }

  // Source-of-funds documentary checklist
  const sourceOfFundsChecklist = [];
  if (normSource === 'property_sale') {
    sourceOfFundsChecklist.push(
      { document: 'Registered Deed of Sale / Conveyance Contract', purpose: 'Proves legal sale of overseas real estate', mandatory: true },
      { document: 'Foreign Capital Gains Tax Clearance Certificate / Assessment', purpose: 'Validates tax compliance in country of origin', mandatory: true },
      { document: 'Escrow / Solicitor Settlement Statement', purpose: 'Accounts for net disbursement into seller bank account', mandatory: true },
      { document: 'Consecutive Foreign Bank Statements', purpose: 'Shows wire transfer originating directly from settlement credit', mandatory: true }
    );
  } else if (normSource === 'family_gift') {
    sourceOfFundsChecklist.push(
      { document: 'Notarized Deed of Gift / Gift Affidavit', purpose: 'Explicitly confirms unconditional transfer with zero repayment obligation or interest', mandatory: true },
      { document: 'Donor Official Government Photo ID', purpose: 'Identifies immediate family member giving the funds', mandatory: true },
      { document: 'Donor Bank Statements (3 to 6 months)', purpose: 'Demonstrates legitimate origin of donor accumulated wealth', mandatory: true },
      { document: 'Proof of Familial Relationship (Birth / Marriage Certificate)', purpose: 'Evidences legitimate relationship to donor', mandatory: false }
    );
  } else if (normSource === 'inheritance') {
    sourceOfFundsChecklist.push(
      { document: 'Probate Court Grant / Letters of Administration', purpose: 'Official court authorization confirming testamentary bequest', mandatory: true },
      { document: 'Certified Copy of Deceased Last Will and Testament', purpose: 'Validates beneficiary entitlement', mandatory: true },
      { document: 'Executor Estate Account Distribution Ledger', purpose: 'Reconciles exact wire sum with final estate settlement', mandatory: true }
    );
  } else if (normSource === 'business_dividends') {
    sourceOfFundsChecklist.push(
      { document: 'Audited Corporate Financial Statements', purpose: 'Confirms corporate retained earnings', mandatory: true },
      { document: 'Board Resolution for Dividend Declaration', purpose: 'Authorizes shareholder dividend disbursement', mandatory: true },
      { document: 'Foreign Dividend Withholding Tax Deducted Certificate', purpose: 'Validates cross-border withholding tax remittance', mandatory: true }
    );
  } else {
    // savings_income or unspecified
    sourceOfFundsChecklist.push(
      { document: 'Foreign Personal Income Tax Notices (Past 2-3 Years)', purpose: 'Proves declared employment earnings supporting savings', mandatory: true },
      { document: 'Recent Pay Stubs / Employer Annual Earnings Statement', purpose: 'Confirms continuous legitimate employment', mandatory: true },
      { document: 'Foreign Bank Statements (6 to 12 Months)', purpose: 'Demonstrates gradual historical accumulation without sudden unverified credits', mandatory: true }
    );
  }

  // Norbert's Gambit Execution Blueprint (if applicable)
  let norbertsGambitGuide = null;
  if (isUsdCadCorridor) {
    const isCadToUsd = normFrom === 'CAD';
    const tickerPair = isCadToUsd ? 'DLR.TO -> DLR.U.TO' : 'DLR.U.TO -> DLR.TO';
    const buyTicker = isCadToUsd ? 'DLR.TO' : 'DLR.U.TO';
    const sellTicker = isCadToUsd ? 'DLR.U.TO' : 'DLR.TO';
    const buyCurrency = normFrom;
    const sellCurrency = normTo;

    norbertsGambitGuide = {
      isApplicable: true,
      tickerPair,
      estimatedSavingsCad: savingsVersusBig5Cad,
      settlementCycle: 'T+1 (1 Business Day Settlement)',
      protocolSteps: [
        `Step 1 (Account Setup): Confirm your Canadian self-directed brokerage account holds both ${buyCurrency} and ${sellCurrency} side-by-side sub-accounts.`,
        `Step 2 (Purchase): During TSX market hours (9:30 AM - 4:00 PM ET), buy shares of '${buyTicker}' in your ${buyCurrency} trading account using a limit order.`,
        `Step 3 (Settlement): Under CIRO rules (effective May 27, 2024), Canadian equities settle on T+1 (the following business day).`,
        `Step 4 (Journal Request): Contact your broker via live chat or secure message and request: "Please journal my [X] shares of ${buyTicker} from my ${buyCurrency} account to ${sellTicker} in my ${sellCurrency} account."`,
        `Step 5 (Sale & Cash Available): Once journaled (typically same-day or overnight), sell the shares of '${sellTicker}' in your ${sellCurrency} account. Your converted ${sellCurrency} cash settles in 1 business day with zero FX markup!`
      ],
      brokerChatTemplate: `Hello, could you please journal my shares of ${buyTicker} in my ${buyCurrency} account to ${sellTicker} in my ${sellCurrency} account? Thank you.`
    };
  }

  // Cross-Border Banking Guidance (US <-> Canada Corridor)
  const crossBorderBankingGuidance = [];
  if (normFrom === 'USD' || normTo === 'USD') {
    crossBorderBankingGuidance.push({
      title: 'North American Cross-Border Account Linking',
      description: 'Major Canadian banks maintain US retail subsidiary charters (TD Bank N.A., RBC Bank USA, BMO Harris, CIBC Bank USA). Opening a linked US-domiciled account enables free instantaneous ACH transfers between US and Canadian accounts, bypassing SWIFT wire fees ($40-$80 total).'
    });
    crossBorderBankingGuidance.push({
      title: 'Avoid Dual Conversion Traps',
      description: 'Never wire USD into a Canadian CAD checking account directly without a USD sub-account. Canadian banks will automatically apply their predatory 2.75%-3.5% retail exchange rate at the incoming wire counter.'
    });
  }

  // Statutory Advisories
  const statutoryAdvisories = [
    `FINTRAC Reporting Exemption: Transfers of legitimate settlement funds over $10,000 CAD are standard and lawful under PCMLTFA. Canadian banks handle EFTR submissions electronically with no negative impact on credit score or immigration standing.`,
    `Do Not Structure Transfers: Intentionally wiring multiple sums under $10,000 CAD is a red flag that violates PCMLTFA s. 75. Always transfer funds in full accompanied by clean documentary proof of origin.`,
    `T+1 Settlement Standard: Since May 27, 2024, Canadian and US securities depositories operate on a T+1 settlement cycle, accelerating Norbert's Gambit execution from 3-4 days down to 1-2 business days.`
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    clientName: safeClientName,
    corridor: `${normFrom} to ${normTo}`,
    amount: normAmount,
    benchmarkRate: Number(benchmarkRate.toFixed(4)),
    grossBenchmarkReceived: Number(grossBenchmarkReceived.toFixed(2)),
    cadEquivalentTotal: Number(cadEquivalentTotal.toFixed(2)),
    bestOption,
    savingsVersusBig5Cad,
    providerComparisons: providers,
    fintracCompliance: {
      isReportableFintrac,
      cadEquivalentAmount: Number(cadEquivalentTotal.toFixed(2)),
      reportingRequirements,
      structuringRisk,
      sourceOfFundsChecklist
    },
    norbertsGambitGuide,
    crossBorderBankingGuidance,
    statutoryAdvisories
  };
}
