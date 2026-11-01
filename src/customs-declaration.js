// src/customs-declaration.js
// Canada Border Services Agency (CBSA) Settler Effects & Customs Declaration Engine.
// Evaluates Tariff Item 9807.00.00 / 9805.00.00 / 9803.00.00 exemptions, Form BSF186 / BSF186A
// goods-to-follow manifests, PCMLTFA s.12 currency thresholds ($10k), and CFIA agricultural restrictions.
// Pure ES module with zero npm dependencies.

import {boundedText} from './text-input.js';

export const TARIFF_REGIMES = {
  pr: {
    code: '9807.00.00',
    title: 'Settlers’ Effects Exemption',
    statute: 'Customs Tariff (S.C. 1997, c. 36), Tariff Item 9807.00.00',
    memorandum: 'CBSA Memorandum D2-2-1',
    minOwnershipMonths: 6,
    vehicleExemptionCapCad: 10000,
    description: 'Permanent residents landing to establish a residence are entitled to duty-free and tax-free importation of personal and household effects owned and used abroad for at least 6 months.'
  },
  work_permit: {
    code: '9803.00.00',
    title: 'Temporary Residents Personal Effects',
    statute: 'Customs Tariff (S.C. 1997, c. 36), Tariff Item 9803.00.00',
    memorandum: 'CBSA Memorandum D2-1-1',
    minOwnershipMonths: 0,
    vehicleExemptionCapCad: 0,
    description: 'Temporary residents on valid work permits are permitted temporary importation of personal effects for the duration of their employment, subject to export upon departure.'
  },
  study_permit: {
    code: '9803.00.00',
    title: 'International Students Personal Effects',
    statute: 'Customs Tariff (S.C. 1997, c. 36), Tariff Item 9803.00.00',
    memorandum: 'CBSA Memorandum D2-1-1',
    minOwnershipMonths: 0,
    vehicleExemptionCapCad: 0,
    description: 'International students on valid study permits can import personal and educational effects without duties or taxes for the duration of their studies.'
  },
  returning_resident: {
    code: '9805.00.00',
    title: 'Former Residents of Canada (1+ Year Abroad)',
    statute: 'Customs Tariff (S.C. 1997, c. 36), Tariff Item 9805.00.00',
    memorandum: 'CBSA Memorandum D2-3-2',
    minOwnershipMonths: 6,
    vehicleExemptionCapCad: 10000,
    perItemCapCad: 10000,
    description: 'Former Canadian residents returning after at least 1 full year abroad receive duty-free importation up to $10,000 CAD per item for goods owned at least 6 months.'
  },
  visitor: {
    code: '9804.00.00',
    title: 'Visitor Personal Baggage',
    statute: 'Customs Tariff (S.C. 1997, c. 36), Tariff Item 9804.00.00',
    memorandum: 'CBSA Memorandum D2-1-1',
    minOwnershipMonths: 0,
    vehicleExemptionCapCad: 0,
    description: 'Visitors may bring temporary personal effects required for the visit. Standard gifts and retail goods exceeding statutory allowances are subject to applicable duties.'
  }
};

export const RESTRICTED_FOOD_PLANT_KEYWORDS = [
  'meat', 'pork', 'beef', 'chicken', 'poultry', 'salami', 'sausage', 'ham', 'jerky',
  'fruit', 'apple', 'citrus', 'mango', 'plant', 'seeds', 'soil', 'cutting', 'bulb',
  'dairy', 'cheese', 'milk', 'egg', 'live animal', 'bird'
];

export function evaluateCustomsDeclaration(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    settlerStatus = 'pr',
    currencyCad = 0,
    items = [],
    vehicle = null
  } = safeParams;
  const normStatus = (settlerStatus || 'pr').toLowerCase();
  const regime = TARIFF_REGIMES[normStatus] || TARIFF_REGIMES.pr;

  const cashAmount = Number.isFinite(Number(currencyCad)) ? Math.max(0, Number(currencyCad)) : 0;
  const itemList = Array.isArray(items) ? items.slice(0, 100) : [];

  let accompanyingValueTotal = 0;
  let goodsToFollowValueTotal = 0;
  let totalDeclaredValue = 0;
  let dutyExemptValue = 0;
  let taxableExcessValue = 0;

  const accompanyingManifest = [];
  const goodsToFollowManifest = [];
  const jewelryItems = [];
  const flaggedProhibitedItems = [];

  itemList.forEach((item, idx) => {
    const val = Number.isFinite(Number(item.valueCad)) ? Math.max(0, Number(item.valueCad)) : 0;
    const ownedMonths = Number.isFinite(Number(item.ownedMonths)) ? Math.max(0, Math.floor(Number(item.ownedMonths))) : 0;
    const isAccompanying = item.isAccompanying !== false;
    const desc = String(item.description || `Item #${idx + 1}`).trim();
    const category = (item.category || 'general').toLowerCase();
    const serial = item.serialNumber ? String(item.serialNumber).trim() : null;

    totalDeclaredValue += val;

    if (isAccompanying) {
      accompanyingValueTotal += val;
      accompanyingManifest.push({
        itemNo: accompanyingManifest.length + 1,
        category,
        description: desc,
        serialNumber: serial,
        valueCad: val,
        ownedMonths
      });
    } else {
      goodsToFollowValueTotal += val;
      goodsToFollowManifest.push({
        itemNo: goodsToFollowManifest.length + 1,
        category,
        description: desc,
        serialNumber: serial,
        valueCad: val,
        ownedMonths
      });
    }

    // Check 6-month ownership requirement for settlers / returning residents
    const meetsOwnershipRequirement = regime.minOwnershipMonths === 0 || ownedMonths >= regime.minOwnershipMonths;

    if (meetsOwnershipRequirement) {
      if (normStatus === 'returning_resident' && val > 10000) {
        dutyExemptValue += 10000;
        taxableExcessValue += (val - 10000);
      } else {
        dutyExemptValue += val;
      }
    } else {
      // Owned under 6 months -> taxable under standard import rules
      taxableExcessValue += val;
    }

    // Check for jewelry
    if (category === 'jewelry' || desc.toLowerCase().includes('gold') || desc.toLowerCase().includes('diamond') || desc.toLowerCase().includes('watch') || desc.toLowerCase().includes('necklace')) {
      jewelryItems.push({
        description: desc,
        valueCad: val,
        hasAppraisalReceipt: Boolean(item.hasAppraisalReceipt)
      });
    }

    // Check for prohibited food/biological/agricultural items
    const lowerDesc = desc.toLowerCase();
    const isProhibited = RESTRICTED_FOOD_PLANT_KEYWORDS.some(k => lowerDesc.includes(k));
    if (isProhibited || category === 'food' || category === 'plant') {
      flaggedProhibitedItems.push({
        description: desc,
        reason: 'Restricted agricultural or biological product under Health of Animals Act or Plant Protection Act'
      });
    }
  });

  // Evaluate Vehicle if provided
  let vehicleAudit = null;
  if (vehicle && typeof vehicle === 'object') {
    const vValue = Number.isFinite(Number(vehicle.valueCad)) ? Math.max(0, Number(vehicle.valueCad)) : 0;
    const vYear = Number.isFinite(Number(vehicle.year)) ? Math.floor(Number(vehicle.year)) : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const ageYears = currentYear - vYear;
    const is15YearsOrOlder = ageYears >= 15;
    const hasAc = vehicle.hasAirConditioning !== false;

    totalDeclaredValue += vValue;

    let vehicleExemptAmount = 0;
    let vehicleTaxableExcess = vValue;

    if (normStatus === 'pr' || normStatus === 'returning_resident') {
      vehicleExemptAmount = Math.min(vValue, regime.vehicleExemptionCapCad || 10000);
      vehicleTaxableExcess = Math.max(0, vValue - vehicleExemptAmount);
    } else if (normStatus === 'work_permit' || normStatus === 'study_permit') {
      // Temporary entry allows temporary use without duty subject to export
      vehicleExemptAmount = vValue;
      vehicleTaxableExcess = 0;
    }

    dutyExemptValue += vehicleExemptAmount;
    taxableExcessValue += vehicleTaxableExcess;

    vehicleAudit = {
      makeModel: boundedText(vehicle.makeModel, 'Passenger Vehicle'),
      year: vYear,
      valueCad: vValue,
      ageYears,
      is15YearsOrOlder,
      rivExemption: is15YearsOrOlder
        ? 'Exempt from Registrar of Imported Vehicles (RIV) inspection (15+ years old rule).'
        : 'Must be registered with Registrar of Imported Vehicles (RIV fee ~$325 CAD) and meet Canadian Motor Vehicle Safety Standards (CMVSS).',
      airConditioningExciseTaxCad: hasAc ? 100 : 0,
      exemptPortionCad: vehicleExemptAmount,
      taxableExcessCad: vehicleTaxableExcess,
      statuteNote: 'Customs Tariff Tariff Item 9807.00.00 caps duty-free vehicle allowance at $10,000 CAD per settler. Any value exceeding $10,000 is assessed regular import duty (6.1% for non-NAFTA) plus 5% GST.'
    };
  }

  // Currency Compliance (PCMLTFA s.12)
  const isCurrencyDeclarationMandatory = cashAmount >= 10000;
  const currencyAudit = {
    amountCad: cashAmount,
    thresholdCad: 10000,
    isDeclarationMandatory: isCurrencyDeclarationMandatory,
    statute: 'Proceeds of Crime (Money Laundering) and Terrorist Financing Act (S.C. 2000, c. 17), s. 12',
    mandatoryForm: isCurrencyDeclarationMandatory ? 'CBSA Form E677 (Cross-Border Currency or Monetary Instruments Report - Individual)' : 'None (Under $10,000 CAD statutory reporting threshold)',
    complianceNote: isCurrencyDeclarationMandatory
      ? 'CRITICAL STATUTORY REQUIREMENT: You are legally required to declare this currency to the CBSA officer on Form E677 upon arrival. There is no tax or fee on carrying funds of any amount into Canada, but failure to declare results in immediate statutory seizure and civil forfeiture penalties ($250 to $5,000).'
      : 'Funds are below the $10,000 CAD reporting threshold. No Form E677 declaration is required.'
  };

  // Estimated Duty & Tax Savings:
  // Typical Canadian import duty ~5% + federal GST 5% + provincial sales tax (avg 13% blended) = ~18% saved
  const estimatedDutyAndTaxSavingsCad = Math.round(dutyExemptValue * 0.18);

  const statutoryAdvisories = [
    'Endorsement at Landing Day (CBSA D2-2-1 para 11): You MUST present two copies of Form BSF186 (goods with you) and BSF186A (goods to follow) to the CBSA officer at the initial Port of Entry. Once you clear customs on landing day, you CANNOT add more items to your goods to follow list.',
    'Proof of 6 Months Ownership (CBSA D2-2-1 para 8): Goods owned and used abroad for less than 6 months do not qualify for the 9807.00.00 settler exemption and are subject to standard import duties and GST.',
    'Jewelry Photographic Record (CBSA D2-2-1 para 14): Valuable jewelry items must be individually photographed and supported with foreign appraisal receipts or purchase invoices. Keep a copy endorsed by CBSA to avoid duties when traveling abroad in future years.',
    'Currency Is Legal, Undeclared Currency Is Seized: Under PCMLTFA s.12, there is zero limit on the amount of legal funds you can bring to Canada. Only failing to report amounts of $10,000 CAD or more is an offence.'
  ];

  return {
    asOf: new Date().toISOString().slice(0, 10),
    settlerStatus: normStatus,
    tariffClassification: {
      code: regime.code,
      title: regime.title,
      statute: regime.statute,
      memorandum: regime.memorandum,
      description: regime.description
    },
    financialAudit: {
      totalDeclaredValueCad: totalDeclaredValue,
      accompanyingGoodsValueCad: accompanyingValueTotal,
      goodsToFollowValueCad: goodsToFollowValueTotal,
      dutyExemptValueCad: dutyExemptValue,
      taxableExcessValueCad: taxableExcessValue,
      estimatedDutyAndTaxSavingsCad
    },
    currencyCompliance: currencyAudit,
    jewelryAudit: {
      itemsDetected: jewelryItems.length,
      items: jewelryItems,
      requiresAppraisalPhoto: jewelryItems.length > 0,
      statutoryInstructions: jewelryItems.length > 0
        ? 'Under CBSA Memorandum D2-2-1 para 14, provide close-up color photographs and pre-landing appraisal certificates for all jewelry. Have the CBSA officer endorse the photos alongside Form BSF186.'
        : 'No high-value jewelry detected.'
    },
    prohibitedItemsAlert: {
      flaggedCount: flaggedProhibitedItems.length,
      flaggedItems: flaggedProhibitedItems,
      statutoryPenalty: flaggedProhibitedItems.length > 0
        ? 'Undeclared food, plant, or animal products incur mandatory $1,300 fines under Agriculture and Agri-Food Administrative Monetary Penalties Act and lead to high-risk secondary inspection flags.'
        : 'No restricted food or agricultural products detected.'
    },
    vehicleAudit,
    bsf186Manifest: {
      accompanyingCount: accompanyingManifest.length,
      accompanyingGoods: accompanyingManifest,
      goodsToFollowCount: goodsToFollowManifest.length,
      goodsToFollow: goodsToFollowManifest,
      portOfEntryChecklist: [
        'Print two copies of Form BSF186 (goods accompanying) and Form BSF186A (goods to follow).',
        'Have all serial numbers for electronics (laptops, phones, cameras) itemized on the form.',
        'Present the forms to the CBSA Border Services Officer during your initial Port of Entry interview.',
        'Ensure the officer signs and stamps Box 8 ("Customs Office Endorsement") on both copies.',
        'Retain the original stamped copy permanently to clear your cargo shipments with Canadian customs and bonded freight warehouses.'
      ]
    },
    statutoryAdvisories,
    statutoryAuthority: 'Customs Act (R.S.C. 1985, c. 1 (2nd Supp.)) & Customs Tariff (S.C. 1997, c. 36)'
  };
}
