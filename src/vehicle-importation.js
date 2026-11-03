// src/vehicle-importation.js
// Canadian Newcomer Vehicle Importation & Transport Canada RIV Compliance Engine.
// Audits vehicle admissibility under the Motor Vehicle Safety Act (S.C. 1993, c. 16, s. 7),
// CBSA Memorandum D19-12-1, and Customs Tariff 9807.00.00 (Settler's Vehicle Exemption).
// Enforces the 15-year statutory barrier for non-US vehicles, audits Registrar of Imported Vehicles (RIV)
// compliance for US vehicles, calculates federal A/C excise tax ($100) and Green Levy,
// enforces the US CBP 72-hour ITN / title export filing (19 CFR 192.2), and generates a provincial licensing roadmap.
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const STATUTORY_RIV_FEE_CAD = 335; // base RIV registration fee
export const FEDERAL_AC_EXCISE_TAX_CAD = 100; // Excise Act 2001
export const NON_US_EXEMPTION_AGE_YEARS = 15; // Motor Vehicle Safety Act s. 7(1)(b)

export function evaluateVehicleImportation({
  countryOfOrigin = 'US', // 'US', 'OTHER' (e.g. EU, Japan, UAE, UK, India)
  vehicleModelYear = 2021,
  vehicleType = 'passenger_car', // 'passenger_car', 'suv', 'truck', 'motorcycle'
  isOwnedAbroadAtLeastSixMonths = true,
  isTitledInImmigrantName = true,
  hasOpenRecall = false,
  hasAirConditioning = true,
  fuelEfficiencyLitersPer100Km = 8.5,
  destinationProvince = 'ON',
  estimatedVehicleValueCad = 25000,
  settlerStatus = 'permanent_resident', // 'permanent_resident', 'work_permit', 'study_permit', 'visitor'
  importerName = 'Immigrant Settler',
  assessmentDate = todayIso()
} = {}) {
  const safeImporter = boundedText(importerName, 'Immigrant Settler', 120);
  const safeDate = safeIsoDate(assessmentDate, todayIso());
  const normOrigin = boundedText(countryOfOrigin, 'US', 20).toUpperCase();
  const safeVehicleType = boundedText(vehicleType, 'passenger_car', 30);
  const safeSettlerStatus = boundedText(settlerStatus, 'permanent_resident', 40);
  const currentYear = new Date().getFullYear();
  const modelYear = Number.isFinite(Number(vehicleModelYear)) ? Math.min(currentYear + 2, Math.max(1900, Math.floor(Number(vehicleModelYear)))) : 2021;
  const vehicleAgeYears = currentYear - modelYear;
  const is15YearsOrOlder = vehicleAgeYears >= NON_US_EXEMPTION_AGE_YEARS;
  const normProv = boundedText(destinationProvince, 'ON', 10).toUpperCase();
  const vehicleValue = Number.isFinite(Number(estimatedVehicleValueCad)) ? Math.min(10000000, Math.max(0, Number(estimatedVehicleValueCad))) : 25000;

  const defects = [];
  const requiredModifications = [];
  let isStatutorilyAdmissible = true;
  let summaryHeadline = '';
  let admissibilityVerdict = 'ADMISSIBLE_RIV_REQUIRED';

  // 1. Motor Vehicle Safety Act Admissibility Audit (MVSA s. 7)
  if (normOrigin !== 'US') {
    if (!is15YearsOrOlder) {
      isStatutorilyAdmissible = false;
      admissibilityVerdict = 'STATUTORILY_INADMISSIBLE';
      defects.push({
        defect: `Non-US Vehicle Under 15 Years Old (${vehicleAgeYears} yrs old).`,
        statute: 'Motor Vehicle Safety Act (S.C. 1993, c. 16, s. 7(1)(b)) & CBSA D19-12-1',
        legalRemedy: 'STRICT IMPORT BAN: Vehicles manufactured for markets other than the US and Canada that are less than 15 years old cannot be imported or modified to meet CMVSS. The vehicle will be turned away or seized by CBSA at the Port of Entry.'
      });
      summaryHeadline = `Inadmissible: Non-US vehicle is only ${vehicleAgeYears} years old (Transport Canada requires minimum 15 years). Cannot be legally imported into Canada.`;
    } else {
      admissibilityVerdict = 'ADMISSIBLE_15_YEAR_EXEMPT';
      summaryHeadline = `Admissible under 15-Year Rule (MVSA s. 7(1)(b)). As a ${vehicleAgeYears}-year-old vehicle, it is exempt from RIV registration and CMVSS compliance.`;
    }
  } else {
    // US Manufactured / Market Vehicle
    if (hasOpenRecall) {
      defects.push({
        defect: 'Unresolved Safety Recall Notice: Vehicle has outstanding manufacturer safety recalls.',
        statute: 'Transport Canada RIV Requirements',
        legalRemedy: 'Must obtain official Recall Clearance Letter from authorized US manufacturer dealer confirming zero outstanding safety recalls before RIV Form 2 inspection can be passed.'
      });
    }

    // Standard RIV modifications for US vehicles
    requiredModifications.push(
      'Daytime Running Lights (DRL): Canadian Motor Vehicle Safety Standard (CMVSS) 108 mandates automatic DRL whenever headlights are off.',
      'Child Tether Anchorages: CMVSS 210.1 mandates factory-approved tether anchors for child restraint seats.',
      'Metric Speedometer / Odometer: Speedometer must display km/h (digital switch or analog dual-scale).',
      'French/English Airbag Warning Label: CMVSS 208 bilingual sun visor labels if missing.'
    );

    admissibilityVerdict = is15YearsOrOlder ? 'ADMISSIBLE_15_YEAR_EXEMPT' : 'ADMISSIBLE_RIV_REQUIRED';
    summaryHeadline = is15YearsOrOlder
      ? `Admissible: 15+ years old (${vehicleAgeYears} yrs). Exempt from RIV fees and federal compliance modifications.`
      : 'Admissible under Transport Canada RIV Program. Eligible for import with Form 1, RIV inspection, and required DRL modifications.';
  }

  // 2. Customs Duties & Taxes (Tariff 9807.00.00 Settler Exemption)
  let customsDutyRatePercent = 6.1; // Standard MFN vehicle duty
  let customsDutyCad = Math.round(vehicleValue * (customsDutyRatePercent / 100));
  let gstCad = Math.round((vehicleValue + customsDutyCad) * 0.05);

  let isSettlerExempt = false;
  if (settlerStatus === 'permanent_resident' && isOwnedAbroadAtLeastSixMonths && isTitledInImmigrantName) {
    isSettlerExempt = true;
    customsDutyCad = 0;
    gstCad = 0;
    customsDutyRatePercent = 0;
  }

  // Air Conditioning Excise Tax (Excise Act 2001)
  const acExciseTaxCad = hasAirConditioning ? FEDERAL_AC_EXCISE_TAX_CAD : 0;

  // Federal Green Levy (Fuel-Inefficient Vehicle Tax)
  let greenLevyCad = 0;
  const lPer100Km = Number.isFinite(Number(fuelEfficiencyLitersPer100Km)) ? Math.max(0, Number(fuelEfficiencyLitersPer100Km)) : 8.5;
  if (lPer100Km >= 13.0 && lPer100Km < 14.0) greenLevyCad = 1000;
  else if (lPer100Km >= 14.0 && lPer100Km < 15.0) greenLevyCad = 2000;
  else if (lPer100Km >= 15.0 && lPer100Km < 16.0) greenLevyCad = 3000;
  else if (lPer100Km >= 16.0) greenLevyCad = 4000;

  // RIV Registration Fee
  const rivFeeCad = (normOrigin === 'US' && !is15YearsOrOlder) ? STATUTORY_RIV_FEE_CAD : 0;
  const totalFederalBorderPayableCad = customsDutyCad + gstCad + acExciseTaxCad + greenLevyCad + rivFeeCad;

  // 3. Mandatory US CBP 72-Hour Title Export Filing (19 CFR 192.2)
  const usCbpExportRequirements = normOrigin === 'US' ? {
    isMandatory: true,
    statute: '19 CFR 192.2 (US Code of Federal Regulations)',
    noticeWindow: 'Minimum 72 business hours prior to crossing border into Canada',
    mandatoryDocuments: [
      'Original Certificate of Title (unencumbered; no US bank liens)',
      'Automated Export System (AES) Internal Transaction Number (ITN) filed via ACE portal',
      'Bill of Sale / Transfer documentation showing date of ownership'
    ],
    borderWarning: 'CBP enforces strict impoundment and up to $10,000 USD fine if a US vehicle attempts to cross into Canada without stamped title clearance.'
  } : {
    isMandatory: false,
    statute: 'N/A',
    noticeWindow: 'N/A',
    mandatoryDocuments: ['Foreign registration / deregistration certificate and original Bill of Lading'],
    borderWarning: 'Verify vessel shipping manifest and soil inspection by CFIA prior to port clearance.'
  };

  // 4. Post-Import Provincial Licensing Roadmap
  const provincialRegistrationRoadmap = [
    'Step 1: Obtain stamped CBSA Form 1 (Vehicle Import Form) and receipt at the border.',
    'Step 2: Pay RIV fee online at riv.ca ($335 CAD) and submit Recall Clearance Letter.',
    'Step 3: Receive RIV Form 2 Inspection sheet and pass federal inspection at Canadian Tire within 45 days.',
    'Step 4: Obtain Canadian auto insurance pink slip using vehicle VIN.',
    'Step 5: Pass Provincial Safety Standards Certificate (SSC) mechanical inspection at licensed garage.',
    `Step 6: Visit provincial licensing office (${normProv === 'ON' ? 'ServiceOntario' : 'ICBC / Registry'}) with stamped Form 1, Safety Certificate, Title, and Insurance to receive Canadian licence plates.`
  ];

  const statutoryAdvisories = [
    'The 15-Year Statutory Rule: Vehicles from outside the US (Europe, Asia, Gulf) under 15 years old cannot be certified or imported into Canada, even with expensive modifications. Do not ship non-US modern cars to Canada.',
    '72-Hour US CBP Title Export Rule: If driving a US car across the border, you MUST submit your original Title and AES/ITN export number to US Customs at the specific border port at least 72 hours in advance.',
    'Settler Duty-Free Exemption (Tariff 9807.00.00): Permanent residents can usually import a motor vehicle without paying customs duty or GST, if they owned and used it abroad for at least 6 months before arriving and list it on their settler goods declaration.',
    'No Liens Allowed on Title: US Customs will NOT clear a vehicle for export if there is an active US financing bank lien on the Title. The car loan must be paid off or refinanced with written lender authorization.'
  ];

  return {
    asOf: safeDate,
    assessmentDate: safeDate,
    importerName: safeImporter,
    countryOfOrigin: normOrigin,
    vehicleType: safeVehicleType,
    settlerStatus: safeSettlerStatus,
    vehicleModelYear: modelYear,
    vehicleAgeYears,
    is15YearsOrOlder,
    isStatutorilyAdmissible,
    admissibilityVerdict,
    summaryHeadline,
    statutoryDefects: defects,
    costAndTaxAudit: {
      estimatedVehicleValueCad: vehicleValue,
      customsDutyCad,
      customsDutyRatePercent,
      gstCad,
      acExciseTaxCad,
      greenLevyCad,
      rivFeeCad,
      totalFederalBorderPayableCad,
      isSettlerTariffExempt: isSettlerExempt,
      statutoryExemptionBasis: isSettlerExempt ? 'Customs Tariff 9807.00.00 (Owned 6+ Mo Abroad)' : 'Standard MFN Tariff'
    },
    usCbpExportRequirements,
    requiredModifications,
    provincialRegistrationRoadmap,
    statutoryAdvisories,
    statutoryAuthority: 'Motor Vehicle Safety Act (S.C. 1993, c. 16, s. 7) & Customs Tariff 9807.00.00'
  };
}
