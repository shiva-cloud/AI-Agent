/**
 * Ontario Human Rights Code (OHRC) Housing & Creed Accommodation Navigator
 *
 * Implements statutory assessment rules under:
 * - Human Rights Code, R.S.O. 1990, c. H.19:
 *   - Section 2(1): Equal treatment with respect to residential accommodation without discrimination because of creed
 *   - Section 2(2): Freedom from harassment in accommodation
 *   - Section 11: Constructive discrimination (neutral rules with adverse impact on creed)
 *   - Section 17: Duty to accommodate to the point of undue hardship (cost, funding, health and safety)
 * - Ontario Human Rights Commission (OHRC) Policy on Preventing Discrimination Based on Creed (2015)
 * - Leading Supreme Court & Tribunal Jurisprudence:
 *   - Syndicat Northcrest v. Amselem, 2004 SCC 47 (Sincerity of belief test; Sukkah structures on balconies)
 *   - Multani v. Commission scolaire Marguerite-Bourgeoys, 2006 SCC 6
 *   - Huang v. 1433725 Ontario Inc., 2011 HRTO 1445
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const OHRC_UNDUE_HARDSHIP_STATUTORY_FACTORS = Object.freeze([
  'FINANCIAL_COST_SO_EXTREME_AS_TO_ALTER_BUSINESS_ESSENCE',
  'OUTSIDE_SOURCES_OF_FUNDING_EXHAUSTED',
  'SUBSTANTIAL_HEALTH_AND_SAFETY_RISK_THAT_CANNOT_BE_MITIGATED'
]);

export function evaluateOntarioHousingCreedAccommodation(params = {}) {
  const {
    tenantName = 'Tenant',
    landlordName = 'Landlord',
    creedPracticeCategory = 'SUKKAH_STRUCTURE_ON_BALCONY',
    isSincerelyHeldBelief = true,
    landlordRefusedAccommodation = true,
    landlordRefusalGround = 'BUILDING_AESTHETICS', // 'BUILDING_AESTHETICS', 'BLANKET_RULE_NO_BALCONY_OBJECTS', 'TENANT_COMPLAINTS', 'UNMITIGATED_FIRE_SAFETY_RISK', 'EXTREME_EXCESSIVE_FINANCIAL_COST'
    landlordOfferedAlternativeReasonableAccommodation = false,
    alternativeAccommodationDescription = '',
    harassmentOrHostileCommentFromLandlord = false,
    assessmentDate = todayIso()
  } = params;

  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanTenant = boundedText(tenantName, 'Tenant', 100);
  const cleanLandlord = boundedText(landlordName, 'Landlord', 120);
  const category = boundedText(creedPracticeCategory, 'SUKKAH_STRUCTURE_ON_BALCONY', 60).toUpperCase();
  
  const refusalGround = boundedText(landlordRefusalGround, 'BUILDING_AESTHETICS', 60).toUpperCase();
  const altDescription = boundedText(alternativeAccommodationDescription, '', 200);

  const sincereBelief = Boolean(isSincerelyHeldBelief);
  
  const landlordRefused = Boolean(landlordRefusedAccommodation);
  const altOffered = Boolean(landlordOfferedAlternativeReasonableAccommodation);
  const harassmentReported = Boolean(harassmentOrHostileCommentFromLandlord);

  const statutoryViolations = [];
  const legalProtections = [];
  const actionableRemedies = [];
  const riskWarnings = [];

  // 1. Sincerity of Belief Assessment (Amselem, 2004 SCC 47)
  if (sincereBelief) {
    legalProtections.push({
      principle: 'SINCERITY_OF_BELIEF_PROTECTED',
      precedent: 'Syndicat Northcrest v. Amselem, 2004 SCC 47',
      details: 'Under the Supreme Court Amselem doctrine, freedom of creed protects sincerely held personal beliefs with a religious nexus, regardless of whether mandated by religious orthodoxy.'
    });
  } else {
    statutoryViolations.push({
      violation: 'LACK_OF_SINCERE_CREED_NEXUS',
      section: 'Human Rights Code s. 2(1)',
      details: 'Protection under creed requires a sincere personal belief having a nexus with religion or creed.'
    });
  }

  // 2. Assess Landlord Refusal and Undue Hardship Standard (s. 11 & s. 17)
  if (landlordRefused) {
    

    if (refusalGround === 'BUILDING_AESTHETICS' || refusalGround === 'BLANKET_RULE_NO_BALCONY_OBJECTS') {
      statutoryViolations.push({
        violation: 'CONSTRUCTIVE_DISCRIMINATION_BASED_ON_CREED',
        section: 'Ontario Human Rights Code s. 11 & s. 17',
        details: `Landlord\'s reliance on '${refusalGround}' constitutes unlawful constructive discrimination. Rules banning objects on doors/balconies cannot override human rights accommodation (Amselem; OHRC Creed Policy).`
      });
      actionableRemedies.push(
        'Deliver a formal Human Rights Accommodation Notice to the landlord referencing Section 2(1) and Syndicat Northcrest v. Amselem.',
        'File an application (Form 1) with the Human Rights Tribunal of Ontario (HRTO) seeking monetary damages for injury to dignity, feelings, and self-respect, plus an order mandating accommodation.'
      );
    } else if (refusalGround === 'TENANT_COMPLAINTS') {
      statutoryViolations.push({
        violation: 'DISCRIMINATORY_THIRD_PARTY_OBJECTIONS',
        section: 'Ontario Human Rights Code s. 2(1)',
        details: 'Landlord cannot rely on co-tenant objections, prejudice, or complaints as a defense to refuse creed accommodation.'
      });
      actionableRemedies.push('File an application with the HRTO for creed discrimination under Section 2(1).');
    } else if (refusalGround === 'UNMITIGATED_FIRE_SAFETY_RISK') {
      if (altOffered) {
        legalProtections.push({
          principle: 'REASONABLE_HEALTH_AND_SAFETY_ACCOMMODATION',
          details: `Landlord identified a genuine fire code or structural concern and proposed an alternative reasonable accommodation ('${altDescription}').`
        });
      } else {
        statutoryViolations.push({
          violation: 'FAILURE_TO_CONSIDER_SAFETY_MITIGATION',
          section: 'Ontario Human Rights Code s. 17(2)',
          details: 'Landlord must actively explore whether safety risks can be mitigated (e.g. fire-retardant materials, portable extinguishers, clear egress path) before refusing accommodation.'
        });
        actionableRemedies.push('Propose specific health and safety mitigations in writing and request reconsideration.');
      }
    }
  }

  // 3. Harassment in Accommodation (s. 2(2))
  if (harassmentReported) {
    statutoryViolations.push({
      violation: 'STATUTORY_HARASSMENT_IN_HOUSING',
      section: 'Ontario Human Rights Code s. 2(2)',
      details: 'Engaging in vexatious comments or conduct that is known or ought reasonably to be known to be unwelcome based on creed constitutes housing harassment.'
    });
    actionableRemedies.push('Claim general damages for harassment under Section 2(2) at the Human Rights Tribunal of Ontario.');
  }

  const isDiscriminatoryBreach = statutoryViolations.length > 0;

  return {
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    creedPracticeCategory: category,
    isHumanRightsBreachDetected: isDiscriminatoryBreach,
    legalVerdict: isDiscriminatoryBreach
      ? 'ACTIONABLE_CREED_DISCRIMINATION_HRTO'
      : 'REASONABLY_ACCOMMODATED_OR_NO_BREACH',
    legalProtections,
    statutoryViolations,
    actionableRemedies,
    riskWarnings,
    statutoryCitations: [
      'Human Rights Code, R.S.O. 1990, c. H.19, ss. 2(1), 2(2), 11, 17',
      'Syndicat Northcrest v. Amselem, 2004 SCC 47',
      'OHRC Policy on Preventing Discrimination Based on Creed (2015)'
    ]
  };
}
