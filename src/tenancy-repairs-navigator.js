/**
 * Residential Tenancy Repairs, Vital Services & Rent Withholding Defense Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Residential Tenancies Act, 2006, S.O. 2006, c. 17:
 *   - s. 20 (Landlord's statutory obligation to repair and maintain)
 *   - s. 21 (Landlord not to withhold or interfere with vital services)
 *   - s. 29(2) (1-year limitation period from date of breach for tenant applications)
 *   - s. 30 (LTB Form T6 tenant remedies: abatement, repairs, out-of-pocket, rent reduction)
 *   - s. 30(1) (Payment of rent into LTB Trust Account pending determination)
 *   - s. 234 (Provincial offences for withholding vital services)
 * - Ontario Regulation 517/06 (Maintenance Standards):
 *   - Minimum room temperature: 20°C (or 21°C under local bylaws, e.g. Toronto Municipal Code Ch. 497)
 *   - Continuous hot water: 43°C (110°F) minimum
 * - British Columbia Residential Tenancy Act, [SBC 2002] c. 78:
 *   - s. 32 (Landlord repair obligations)
 *   - s. 33 (Emergency repairs protocol and statutory deduction rights)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const TENANCY_REPAIR_CONSTANTS = Object.freeze({
  ONTARIO_MIN_TEMP_CELSIUS: 20,
  TORONTO_MIN_TEMP_CELSIUS: 21,
  ONTARIO_MIN_HOT_WATER_CELSIUS: 43,
  ONTARIO_LTB_T6_FILING_FEE_CAD: 53,
  ONTARIO_LIMITATION_YEARS: 1,
  BC_RTB_DISPUTE_FEE_CAD: 100,
  RHEU_HOTLINE: '1-888-772-9277',
  TORONTO_BYLAW_PHONE: '311'
});

export const REPAIR_ISSUE_TAXONOMY = Object.freeze({
  no_heat_winter: {
    category: 'vital_service',
    label: 'Lack of Adequate Heat in Winter (<20°C)',
    statutoryRef: 'Ontario RTA s. 21; O. Reg. 517/06 s. 15',
    severity: 'critical',
    minAbatementPercent: 50,
    maxAbatementPercent: 100
  },
  no_hot_water: {
    category: 'vital_service',
    label: 'No Hot Water Supply (<43°C)',
    statutoryRef: 'Ontario RTA s. 21; O. Reg. 517/06 s. 9',
    severity: 'high',
    minAbatementPercent: 20,
    maxAbatementPercent: 35
  },
  vital_service_shutoff: {
    category: 'vital_service',
    label: 'Landlord Deliberately Cut Electricity / Gas / Water',
    statutoryRef: 'Ontario RTA s. 21, 234 (Provincial Offence)',
    severity: 'critical',
    minAbatementPercent: 75,
    maxAbatementPercent: 100
  },
  severe_pest_infestation: {
    category: 'health_and_safety',
    label: 'Severe Pest Infestation (Bedbugs / Cockroaches / Rodents)',
    statutoryRef: 'Ontario RTA s. 20; O. Reg. 517/06 s. 13',
    severity: 'high',
    minAbatementPercent: 15,
    maxAbatementPercent: 35
  },
  water_leak_mold: {
    category: 'health_and_safety',
    label: 'Active Water Leak / Toxic Black Mold',
    statutoryRef: 'Ontario RTA s. 20; O. Reg. 517/06 s. 8',
    severity: 'high',
    minAbatementPercent: 20,
    maxAbatementPercent: 40
  },
  broken_appliance_essential: {
    category: 'maintenance',
    label: 'Broken Refrigerator / Cooking Stove',
    statutoryRef: 'Ontario RTA s. 20 (Fit for habitation)',
    severity: 'moderate',
    minAbatementPercent: 10,
    maxAbatementPercent: 25
  },
  broken_plumbing_fixtures: {
    category: 'maintenance',
    label: 'Unusable Toilet / Shower / Sink',
    statutoryRef: 'Ontario RTA s. 20; O. Reg. 517/06 s. 9',
    severity: 'high',
    minAbatementPercent: 25,
    maxAbatementPercent: 50
  },
  broken_locks_security: {
    category: 'health_and_safety',
    label: 'Broken Entry Doors / Unsecured Windows / Broken Locks',
    statutoryRef: 'Ontario RTA s. 24 (Altering locks & building security)',
    severity: 'high',
    minAbatementPercent: 15,
    maxAbatementPercent: 30
  }
});

/**
 * Diagnostic evaluation of residential tenancy repair breaches, vital services cutoff,
 * rent abatement calculations, Form T6 litigation remedies, and rent withholding defense.
 */
export function evaluateTenancyRepairs({
  province = 'ON',
  monthlyRentCad = 2400,
  issues = ['water_leak_mold'],
  daysUnresolved = 30,
  outOfPocketExpensesCad = 250,
  hasWithheldRent = false,
  withheldAmountCad = 0,
  hasNotifiedLandlordInWriting = true,
  hasCalledCityInspector = false,
  tenantName = 'Tenant',
  landlordName = 'Landlord',
  rentalAddress = '100 King St W, Toronto, ON',
  assessmentDate = todayIso()
} = {}) {
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const rent = Math.max(0, Math.min(100000, Number(monthlyRentCad) || 0));
  const days = Math.max(1, Math.min(3650, Math.floor(Number(daysUnresolved) || 1)));
  const outOfPocket = Math.max(0, Math.min(1000000, Number(outOfPocketExpensesCad) || 0));
  const rentWithheld = Boolean(hasWithheldRent);
  const withheldAmt = Math.max(0, Math.min(1000000, Number(withheldAmountCad) || 0));
  const writtenNotice = Boolean(hasNotifiedLandlordInWriting);
  const cityInspector = Boolean(hasCalledCityInspector);

  // Safe bounded echo strings
  const tName = boundedText(tenantName, 'Tenant', 120);
  const lName = boundedText(landlordName, 'Landlord', 120);
  const address = boundedText(rentalAddress, 'Rental Property', 200);
  const assessDate = safeIsoDate(assessmentDate, todayIso());

  // Audit issues
  const selectedIssues = Array.isArray(issues) && issues.length > 0 ? issues : ['water_leak_mold'];
  const recognizedIssues = [];
  let maxAbatementRateMin = 0;
  let maxAbatementRateMax = 0;
  let hasVitalServiceBreach = false;
  let hasCriticalUrgency = false;

  for (const item of selectedIssues) {
    const key = String(item).trim().toLowerCase();
    const config = REPAIR_ISSUE_TAXONOMY[key];
    if (config) {
      recognizedIssues.push({
        key,
        label: config.label,
        category: config.category,
        statutoryRef: config.statutoryRef,
        severity: config.severity,
        minAbatementPercent: config.minAbatementPercent,
        maxAbatementPercent: config.maxAbatementPercent
      });
      if (config.category === 'vital_service') {
        hasVitalServiceBreach = true;
      }
      if (config.severity === 'critical') {
        hasCriticalUrgency = true;
      }
      maxAbatementRateMin = Math.max(maxAbatementRateMin, config.minAbatementPercent);
      maxAbatementRateMax = Math.max(maxAbatementRateMax, config.maxAbatementPercent);
    }
  }

  // Compound abatement cap: cannot exceed 100% of rent
  // If multiple issues, add 5% for each secondary issue up to 100%
  const bonusMultiplier = Math.min(25, (recognizedIssues.length - 1) * 5);
  const finalAbatementMinPercent = Math.min(100, maxAbatementRateMin + (bonusMultiplier > 0 ? 5 : 0));
  const finalAbatementMaxPercent = Math.min(100, maxAbatementRateMax + bonusMultiplier);

  // Monetary calculations
  const dailyRent = rent / 30;
  const estimatedMinAbatementCad = Math.round(dailyRent * days * (finalAbatementMinPercent / 100));
  const estimatedMaxAbatementCad = Math.round(dailyRent * days * (finalAbatementMaxPercent / 100));
  const totalPotentialRemedyMinCad = estimatedMinAbatementCad + outOfPocket;
  const totalPotentialRemedyMaxCad = estimatedMaxAbatementCad + outOfPocket;

  // Withholding Rent Legal Warning
  const legalWarnings = [];
  let rentWithholdingRisk = 'none';

  if (rentWithheld || withheldAmt > 0) {
    rentWithholdingRisk = 'severe';
    legalWarnings.push({
      code: 'ILLEGAL_RENT_WITHHOLDING',
      severity: 'CRITICAL',
      title: 'High Eviction Risk: Rent Withholding is Prohibited',
      message: 'Under Ontario RTA s. 20 and established Landlord and Tenant Board jurisprudence, tenants have NO legal right to unilaterally withhold rent due to disrepair. Doing so allows the landlord to immediately issue Form N4 and file for eviction for non-payment. You must pay rent in full or seek permission from the LTB to pay rent into trust.'
    });
  }

  if (!writtenNotice) {
    legalWarnings.push({
      code: 'NO_WRITTEN_NOTICE',
      severity: 'HIGH',
      title: 'Lack of Verifiable Written Notice',
      message: 'The LTB will not award rent abatement for periods prior to the date the landlord was formally notified in writing (email, text, or written letter). Verbal complaints are routinely disputed.'
    });
  }

  if (days > 365) {
    legalWarnings.push({
      code: 'LIMITATION_PERIOD_EXCEEDED',
      severity: 'HIGH',
      title: '1-Year Statutory Limitation Period Notice',
      message: 'Under Ontario RTA s. 29(2), an application under s. 30 (Form T6) must be filed within 1 year of the date the repair issue occurred or was ongoing. Remedies for older disrepair will be barred.'
    });
  }

  // Procedural Strategy & Forms
  const proceduralRemedies = [];
  let governingTribunal = '';
  let applicationForm = '';
  let filingFeeCad = 0;

  if (prov === 'ON') {
    governingTribunal = 'Ontario Landlord and Tenant Board (LTB)';
    applicationForm = 'Form T6 (Tenant Application about Maintenance)';
    filingFeeCad = TENANCY_REPAIR_CONSTANTS.ONTARIO_LTB_T6_FILING_FEE_CAD;

    proceduralRemedies.push({
      step: 1,
      title: 'Send Formal 14-Day Notice to Landlord',
      description: 'Serve a formal written demand letter specifying each defect, photographs taken, and a reasonable completion deadline (typically 7-14 days; 24-48 hours for vital services).'
    });

    if (!cityInspector) {
      proceduralRemedies.push({
        step: 2,
        title: 'Request Municipal Bylaw Property Standards Inspection (311)',
        description: 'Call 311 or municipal property standards. An official City Inspection Report or Notice of Violation provides unassailable third-party evidence at the LTB.'
      });
    }

    if (hasVitalServiceBreach) {
      proceduralRemedies.push({
        step: 3,
        title: 'Report Vital Services Cutoff to RHEU Immediately',
        description: `Contact the Rental Housing Enforcement Unit (RHEU) at ${TENANCY_REPAIR_CONSTANTS.RHEU_HOTLINE}. RHEU officers can contact the landlord directly and impose provincial prosecution.`
      });
    }

    proceduralRemedies.push({
      step: 4,
      title: 'File Form T6 & Request Payment of Rent into Board',
      description: 'Submit Form T6 via Tribunals Ontario Portal. File a motion under RTA s. 30(1) to pay your rent into the LTB trust account rather than directly to the defaulting landlord.'
    });
  } else if (prov === 'BC') {
    governingTribunal = 'British Columbia Residential Tenancy Branch (RTB)';
    applicationForm = 'RTB Application for Dispute Resolution (Tenant)';
    filingFeeCad = TENANCY_REPAIR_CONSTANTS.BC_RTB_DISPUTE_FEE_CAD;

    proceduralRemedies.push({
      step: 1,
      title: 'Audit Emergency Repairs Protocol (BC RTA s. 33)',
      description: 'In BC, if an emergency repair (heating in winter, major plumbing leak, broken lock) is ignored after two documented attempts, you may pay for repairs directly and deduct the cost from rent.'
    });
    proceduralRemedies.push({
      step: 2,
      title: 'File RTB Dispute Resolution Application',
      description: 'Apply for dispute resolution seeking an order for repairs and statutory monetary compensation.'
    });
  } else {
    governingTribunal = 'Provincial Residential Tenancy Tribunal / Board';
    applicationForm = 'Tenant Application for Maintenance and Rent Abatement';
    filingFeeCad = 50;
    proceduralRemedies.push({
      step: 1,
      title: 'Issue Written Demand to Landlord',
      description: 'Provide written notice with photos and request repairs within a reasonable statutory timeframe.'
    });
  }

  // Pre-Litigation Formal Notice Document
  const noticeOfDisrepairDocument = `FORMAL NOTICE OF DISREPAIR & BREACH OF STATUTORY MAINTENANCE OBLIGATIONS
Date: ${assessDate}
To: ${lName} (Landlord)
Rental Address: ${address}
From: ${tName} (Tenant)

Re: Formal Notice under ${prov === 'ON' ? 'Ontario Residential Tenancies Act, 2006 (RTA), ss. 20, 21' : 'Residential Tenancy Act'} — Demand for Immediate Repair

Please be advised that the above-referenced rental unit is currently experiencing serious conditions of disrepair in violation of statutory landlord covenants:

${recognizedIssues.map((iss, i) => `${i + 1}. ${iss.label} (${iss.statutoryRef})`).join('\n')}

Duration of Unresolved Disrepair: ${days} days.
Out-of-pocket expenses incurred to date: $${outOfPocket.toFixed(2)} CAD.

DEMAND FOR REMEDIAL ACTION:
You are hereby required to inspect and commence necessary certified repairs within ${hasVitalServiceBreach ? '24 to 48 hours' : '7 calendar days'} of receipt of this notice.

RESERVATION OF STATUTORY REMEDIES:
Take notice that if you fail to remedy these deficiencies promptly, I reserve all statutory rights to:
1. File an application with the ${governingTribunal} (${applicationForm}) requesting:
   - A statutory rent abatement of between $${estimatedMinAbatementCad.toLocaleString()} and $${estimatedMaxAbatementCad.toLocaleString()} CAD.
   - Reimbursement of $${outOfPocket.toLocaleString()} CAD in out-of-pocket damages.
   - An administrative fine against the landlord.
${prov === 'ON' ? '2. Contact Municipal Property Standards (311) to issue a formal Work Order.\n3. Request intervention from the Rental Housing Enforcement Unit (RHEU) regarding vital services.' : '2. Pursue emergency remedies under provincial tenancy legislation.'}

Sincerely,

${tName}
Tenant`;

  return {
    tenantName: tName,
    landlordName: lName,
    rentalAddress: address,
    assessmentDate: assessDate,
    province: prov,
    governingTribunal,
    applicationForm,
    filingFeeCad,
    monthlyRentCad: rent,
    daysUnresolved: days,
    outOfPocketExpensesCad: outOfPocket,
    recognizedIssues,
    hasVitalServiceBreach,
    hasCriticalUrgency,
    hasWithheldRent: rentWithheld,
    rentWithholdingRisk,
    abatementEstimate: {
      minPercentage: finalAbatementMinPercent,
      maxPercentage: finalAbatementMaxPercent,
      estimatedMinAbatementCad,
      estimatedMaxAbatementCad,
      totalPotentialRemedyMinCad,
      totalPotentialRemedyMaxCad
    },
    legalWarnings,
    proceduralRemedies,
    noticeOfDisrepairDocument
  };
}
