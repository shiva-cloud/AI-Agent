/**
 * Federal Refugee Cessation & Re-availment Risk Navigator
 *
 * Implements statutory assessment rules under:
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27):
 *   - Section 108(1): Cessation of refugee protection (Re-availment, reacquisition, re-establishment)
 *   - Section 108(2): Application by Minister to Refugee Protection Division (RPD)
 *   - Section 46(1)(c.1): Automatic loss of Permanent Resident status upon cessation finding
 *   - Section 40: Misrepresentation
 * - Leading Federal Court Jurisprudence:
 *   - Canada (MCI) v. Es-Sayyid, 2012 FCA 197 (Three-prong re-availment test)
 *   - Bashir v. Canada (MCI), 2015 FC 51 (Presumption of re-availment via passport)
 *   - Canada (MCI) v. Bermudez, 2016 FCA 131
 *   - Vavilov v. Canada, 2019 SCC 65
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export function evaluateRefugeeCessationRisk(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const applicantName = boundedText(safeParams.applicantName, 'Protected Person', 100);
  const assessmentDate = safeIsoDate(safeParams.assessmentDate, todayIso());
  const currentStatusInCanada = boundedText(safeParams.currentStatusInCanada, 'PERMANENT_RESIDENT', 50).toUpperCase();
  const hasAcquiredCanadianCitizenship = Boolean(safeParams.hasAcquiredCanadianCitizenship);
  const hasAppliedForOrRenewedNationalPassport = Boolean(safeParams.hasAppliedForOrRenewedNationalPassport);
  const usedNationalPassportToTravel = Boolean(safeParams.usedNationalPassportToTravel);
  const usedCanadianRefugeeTravelDocument = safeParams.usedCanadianRefugeeTravelDocument !== false;
  const traveledBackToCountryOfPersecution = Boolean(safeParams.traveledBackToCountryOfPersecution);
  const trips = Number.isFinite(Number(safeParams.numberOfTripsToCountryOfPersecution)) ? Math.max(0, Math.min(1000, Math.floor(Number(safeParams.numberOfTripsToCountryOfPersecution)))) : 0;
  const daysInCountry = Number.isFinite(Number(safeParams.cumulativeDaysInCountryOfPersecution)) ? Math.max(0, Math.min(36500, Math.floor(Number(safeParams.cumulativeDaysInCountryOfPersecution)))) : 0;
  const purposeOfTravel = boundedText(safeParams.purposeOfTravel, 'NONE', 100).toUpperCase();
  const wasUnderStateCoercionOrDuress = Boolean(safeParams.wasUnderStateCoercionOrDuress);
  const ministerHasFiledCessationApplication = Boolean(safeParams.ministerHasFiledCessationApplication);

  const statutoryFindings = [];
  const riskFactors = [];
  const mitigatingFactors = [];
  const proceduralRemedies = [];

  // 1. Citizen Shield: Once Canadian citizenship is granted, IRPA s. 108 cessation does not apply
  if (hasAcquiredCanadianCitizenship || currentStatusInCanada === 'CANADIAN_CITIZEN') {
    return {
      applicantName,
      assessmentDate,
      isExemptFromIrpaCessation: true,
      legalStatusVerdict: 'CITIZEN_SHIELD_IMMUNE_FROM_IRPA_108',
      summary: 'Canadian citizens are statutorily exempt from refugee cessation under IRPA s. 108. The Minister cannot apply to the RPD for cessation against a Canadian citizen.',
      cessationRiskLevel: 'NONE',
      statutoryCitations: [
        'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 108',
        'Citizenship Act, R.S.C. 1985, c. C-29, s. 10'
      ]
    };
  }

  // 2. Three-Prong Re-availment Test (Es-Sayyid / Bashir)
  // Prong 1: Voluntariness
  let isVoluntary = !wasUnderStateCoercionOrDuress;
  if (wasUnderStateCoercionOrDuress) {
    mitigatingFactors.push({
      factor: 'LACK_OF_VOLUNTARINESS',
      details: 'The person acted under duress, state coercion, or severe compelling circumstances, rebutting voluntary re-availment.'
    });
  }

  // Prong 2: Intention
  // Renewing or applying for a home country passport creates a strong legal presumption of intent to re-avail
  if (hasAppliedForOrRenewedNationalPassport) {
    riskFactors.push({
      risk: 'PRESUMPTION_OF_REAVAILMENT_NATIONAL_PASSPORT',
      severity: 'VERY_HIGH',
      legalBasis: 'Bashir v. Canada (MCI), 2015 FC 51',
      details: 'Applying for or renewing a national passport from the country of persecution creates a heavy legal presumption that the protected person intended to re-avail themselves of state diplomatic protection.'
    });
  }

  if (usedNationalPassportToTravel) {
    riskFactors.push({
      risk: 'TRAVEL_ON_NATIONAL_PASSPORT',
      severity: 'VERY_HIGH',
      details: 'Using a national passport to travel internationally constitutes direct reliance upon the protection and identity authority of the country of nationality.'
    });
  } else if (usedCanadianRefugeeTravelDocument) {
    mitigatingFactors.push({
      factor: 'USE_OF_CANADIAN_REFUGEE_TRAVEL_DOCUMENT',
      details: 'Traveling exclusively on a Canadian Refugee Travel Document (RTD) demonstrates continued reliance on Canadian international protection.'
    });
  }

  // Prong 3: Travel back to Country of Persecution
  if (traveledBackToCountryOfPersecution && trips > 0) {
    if (purposeOfTravel === 'HUMANITARIAN_EMERGENCY_FAMILY_ILLNESS') {
      mitigatingFactors.push({
        factor: 'COMPELLING_HUMANITARIAN_PURPOSE',
        details: 'Travel was brief and strictly motivated by compelling emergency (e.g. dying parent or critical family crisis) rather than voluntary re-establishment.'
      });
      riskFactors.push({
        risk: 'PHYSICAL_RETURN_TO_COUNTRY_OF_PERSECUTION',
        severity: 'MODERATE_TO_HIGH',
        details: `Returned to country of persecution for ${daysInCountry} day(s) across ${trips} trip(s). RPD assesses whether precautions were taken and whether state protection was requested.`
      });
    } else {
      riskFactors.push({
        risk: 'NON_URGENT_RETURN_TRAVEL',
        severity: 'CRITICAL',
        details: `Travel for '${purposeOfTravel}' (${trips} trip(s), ${daysInCountry} days) severely compromises refugee status. The RPD routinely treats vacation or business travel as voluntary re-establishment under IRPA s. 108(1)(d).`
      });
    }
  }

  // 3. Catastrophic Impact on PR Status (IRPA s. 46(1)(c.1))
  statutoryFindings.push({
    finding: 'AUTOMATIC_LOSS_OF_PR_STATUS_CONSEQUENCE',
    section: 'IRPA s. 46(1)(c.1)',
    details: 'CRITICAL STATUTORY WARNING: Unlike typical appeals, if the RPD allows a cessation application, the individual AUTOMATICALLY LOSES Permanent Resident status immediately, without a separate inadmissibility hearing.'
  });

  if (ministerHasFiledCessationApplication) {
    proceduralRemedies.push(
      'Retain an experienced refugee litigation counsel immediately for an RPD Cessation Hearing.',
      'Gather affidavits, medical records, and evidence establishing lack of subjective intention to re-avail and compelling emergency nature of travel.',
      'Prepare simultaneous Humanitarian & Compassionate (H&C) application under IRPA s. 25 and file for judicial review at Federal Court if RPD rules adversely.'
    );
  } else {
    proceduralRemedies.push(
      'Immediately cease any contact with the embassy or consular authorities of the country of origin.',
      'Surrender or do not renew the foreign national passport; use ONLY the Canadian Refugee Travel Document.',
      'Refrain from any travel to the country of origin until full Canadian citizenship is formally granted.'
    );
  }

  let cessationRiskLevel = 'LOW';
  if (riskFactors.some(r => r.severity === 'CRITICAL')) {
    cessationRiskLevel = 'CRITICAL';
  } else if (riskFactors.some(r => r.severity === 'VERY_HIGH')) {
    cessationRiskLevel = 'HIGH';
  } else if (riskFactors.length > 0) {
    cessationRiskLevel = 'MODERATE';
  }

  const legalVerdict = ministerHasFiledCessationApplication
    ? 'ACTIVE_MINISTERIAL_CESSATION_HEARING_DEFENSE_REQUIRED'
    : (cessationRiskLevel === 'CRITICAL' || cessationRiskLevel === 'HIGH' ? 'SEVERE_CESSATION_EXPOSURE_RISK' : 'CONTROLLED_OR_LOW_CESSATION_RISK');

  return {
    applicantName,
    assessmentDate,
    isExemptFromIrpaCessation: false,
    legalVerdict,
    cessationRiskLevel,
    reavailmentAudit: {
      hasPresumptionOfReavailment: hasAppliedForOrRenewedNationalPassport || usedNationalPassportToTravel,
      isActionVoluntary: isVoluntary,
      tripsToCountryOfPersecution: trips,
      cumulativeDaysAbroad: daysInCountry,
      travelPurpose: purposeOfTravel
    },
    riskFactors,
    mitigatingFactors,
    statutoryFindings,
    proceduralRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, ss. 46(1)(c.1), 108(1), 108(2)',
      'Canada (Minister of Citizenship and Immigration) v. Es-Sayyid, 2012 FCA 197',
      'Bashir v. Canada (Minister of Citizenship and Immigration), 2015 FC 51',
      'Canada (Minister of Citizenship and Immigration) v. Bermudez, 2016 FCA 131'
    ]
  };
}
