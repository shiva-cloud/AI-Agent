// src/global-visa-matrix.js
// Multi-Country Global Relocation & Visa Status Navigator
// Deterministic statutory eligibility assessment across 6 primary destination countries:
// Canada, United States, United Kingdom, Australia, Germany, and United Arab Emirates.

import { factValue } from './kb-facts.js';


export const GLOBAL_DESTINATION_RULES = {
  CA: {
    countryName: 'Canada',
    primaryPathways: [
      {
        id: 'express_entry_fsw',
        title: 'Federal Skilled Worker (Express Entry)',
        statutoryBasis: 'IRPR s. 75, s. 87.1',
        minLanguageClb: 7,
        minExperienceYears: 1,
        minEducationTier: 'bachelors',
        targetTeer: [0, 1, 2, 3],
        notes: 'Points-based selection (CRS). Category-based draws prioritize STEM, Healthcare, Trades, and French fluency.'
      },
      {
        id: 'pnp_provincial',
        title: 'Provincial Nominee Program (PNP)',
        statutoryBasis: 'IRPA s. 87(2)',
        minLanguageClb: 5,
        minExperienceYears: 1,
        minEducationTier: 'diploma',
        notes: '+600 CRS bonus for Express Entry stream, or base paper/portal nomination with provincial tie.'
      }
    ]
  },
  US: {
    countryName: 'United States',
    primaryPathways: [
      {
        id: 'h1b_specialty',
        title: 'H-1B Specialty Occupation',
        statutoryBasis: 'INA § 101(a)(15)(H)(i)(b); 8 CFR § 214.2(h)',
        minEducationTier: 'bachelors',
        requiresJobOffer: true,
        annualCap: '85,000 (65k general + 20k US master’s exemption)',
        notes: 'Requires bachelor’s degree in specific specialty and employer LCA prevailing wage compliance. 60-day grace period upon termination.'
      },
      {
        id: 'eb2_niw',
        title: 'EB-2 National Interest Waiver (NIW)',
        statutoryBasis: 'INA § 203(b)(2)(B); Matter of Dhanasar (2016)',
        minEducationTier: 'masters',
        requiresJobOffer: false,
        notes: 'Self-petitioning green card pathway. Requires advanced degree and proposed endeavor of substantial merit and national importance.'
      },
      {
        id: 'o1_extraordinary',
        title: 'O-1A Extraordinary Ability in Science/Business',
        statutoryBasis: 'INA § 101(a)(15)(O)(i)',
        minEducationTier: 'bachelors',
        requiresJobOffer: true,
        notes: 'Uncapped nonimmigrant visa for sustained national or international acclaim. No lottery.'
      }
    ]
  },
  UK: {
    countryName: 'United Kingdom',
    primaryPathways: [
      {
        id: 'skilled_worker',
        title: 'Skilled Worker Visa',
        statutoryBasis: 'UK Immigration Rules Appendix Skilled Worker',
        minLanguageCefr: 'B2', // New applicants from 8 January 2026; B1 for people already on the route
        get minSalaryGbp() { return factValue('uk.skilledWorker.generalThresholdGbp'); }, // src/kb-facts.js (new entrant and transitional rates are lower)
        requiresJobOffer: true,
        notes: 'Requires Certificate of Sponsorship (CoS) from licensed employer and eligible SOC code. Leads to ILR after 5 years (180-day rolling absence limit).'
      },
      {
        id: 'global_talent',
        title: 'Global Talent Visa',
        statutoryBasis: 'UK Immigration Rules Appendix Global Talent',
        requiresJobOffer: false,
        notes: 'Endorsement from Royal Society, British Academy, Royal Academy of Engineering, or Tech Nation. Leads to ILR in 3 years.'
      }
    ]
  },
  AU: {
    countryName: 'Australia',
    primaryPathways: [
      {
        id: 'subclass_189_190',
        title: 'General Skilled Migration (Subclass 189 / 190)',
        statutoryBasis: 'Migration Regulations 1994 Schedule 2',
        minLanguageIelts: 6.0,
        passMarkPoints: 65,
        notes: 'SkillSelect points test. Subclass 190 offers 5 state nomination points. Permanent resident on arrival.'
      },
      {
        id: 'subclass_482_tss',
        title: 'Skills in Demand / Subclass 482 Temporary Skill Shortage',
        statutoryBasis: 'Migration Regulations 1994 reg 482',
        requiresJobOffer: true,
        minExperienceYears: 1, // reduced from 2 years in late 2024
        notes: 'Condition 8607 gives workers 180 consecutive days to find a new sponsor upon employment cessation.'
      }
    ]
  },
  DE: {
    countryName: 'Germany',
    primaryPathways: [
      {
        id: 'eu_blue_card',
        title: 'EU Blue Card (Blaue Karte EU)',
        statutoryBasis: 'AufenthG § 18g',
        minSalaryEur: 45300, // 2024 standard floor (€41,041 for bottleneck professions)
        minEducationTier: 'bachelors',
        requiresJobOffer: true,
        notes: 'Fast-track permanent residency (Niederlassungserlaubnis) in 21 months with B1 German (or 27 months without).'
      },
      {
        id: 'chancenkarte',
        title: 'Opportunity Card (Chancenkarte)',
        statutoryBasis: 'AufenthG § 20a',
        passMarkPoints: 6,
        requiresJobOffer: false,
        notes: '1-year job search visa. Allows 20 hrs/week secondary work and 2-week trial work (Probearbeit).'
      }
    ]
  },
  UAE: {
    countryName: 'United Arab Emirates',
    primaryPathways: [
      {
        id: 'green_visa',
        title: 'Green Visa for Skilled Employees',
        statutoryBasis: 'Federal Decree-Law No. 29/2021 on Entry and Residence of Foreigners',
        minSalaryAed: 15000,
        minEducationTier: 'bachelors',
        requiresJobOffer: true,
        durationYears: 5,
        notes: '5-year self-sponsored residency without corporate sponsor dependency. 6-month grace period upon permit cancellation.'
      },
      {
        id: 'golden_visa_specialists',
        title: 'Golden Visa for Exceptional Talents & Scientists',
        statutoryBasis: 'Cabinet Resolution No. 65 of 2022',
        durationYears: 10,
        notes: '10-year residency for doctors, scientists, executive directors, and tech innovators. Family sponsorship with no age caps.'
      }
    ]
  }
};

export function evaluateGlobalVisaPathways(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    preferredCountries = ['CA', 'US', 'UK', 'AU', 'DE', 'UAE'],
    educationLevel = 'bachelors', // 'phd', 'masters', 'bachelors', 'diploma'
    yearsExperience = 3,
    fieldOfStudy = 'stem',
    hasJobOffer = false,
    languageProficiency = 'fluent', // 'native', 'fluent', 'intermediate', 'basic'
    applicantAge = 29
  } = safeOptions;
  const assessmentDate = new Date().toISOString().slice(0, 10);
  const eligiblePathways = [];
  const restrictedPathways = [];

  const targetCountries = preferredCountries.length ? preferredCountries : Object.keys(GLOBAL_DESTINATION_RULES);

  for (const countryCode of targetCountries) {
    const country = GLOBAL_DESTINATION_RULES[countryCode.toUpperCase()];
    if (!country) continue;

    for (const pathway of country.primaryPathways) {
      const reasons = [];
      let isEligible = true;

      // 1. Job Offer Requirement
      if (pathway.requiresJobOffer && !hasJobOffer) {
        isEligible = false;
        reasons.push('Requires an active qualifying job offer / Certificate of Sponsorship from a licensed employer.');
      }

      // 2. Education Tier
      if (pathway.minEducationTier === 'masters' && !['masters', 'phd'].includes(educationLevel)) {
        isEligible = false;
        reasons.push(`Requires at least a Master’s degree or PhD (current: ${educationLevel}).`);
      } else if (pathway.minEducationTier === 'bachelors' && ['diploma', 'high_school'].includes(educationLevel)) {
        isEligible = false;
        reasons.push(`Requires a recognized Bachelor’s university degree (current: ${educationLevel}).`);
      }

      // 3. Experience check
      if (pathway.minExperienceYears && yearsExperience < pathway.minExperienceYears) {
        isEligible = false;
        reasons.push(`Requires minimum ${pathway.minExperienceYears} years skilled experience (current: ${yearsExperience}).`);
      }

      // 4. Age suitability
      let agePointsNotice = null;
      if (countryCode === 'CA' && applicantAge > 35) {
        agePointsNotice = `Age ${applicantAge}: CRS points taper by 5–10 points each year past age 29.`;
      } else if (countryCode === 'AU' && applicantAge >= 45) {
        isEligible = false;
        reasons.push(`Age ${applicantAge} exceeds Australia GSM Subclass 189/190 maximum age cutoff of 45.`);
      }

      const pathwayResult = {
        countryCode,
        countryName: country.countryName,
        pathwayId: pathway.id,
        title: pathway.title,
        statutoryBasis: pathway.statutoryBasis,
        isEligible,
        keyNotes: pathway.notes,
        statutoryConditions: reasons
      };

      if (agePointsNotice) {
        pathwayResult.ageNotice = agePointsNotice;
      }

      if (isEligible) {
        eligiblePathways.push(pathwayResult);
      } else {
        restrictedPathways.push(pathwayResult);
      }
    }
  }

  return {
    assessmentDate,
    candidateProfile: {
      educationLevel,
      yearsExperience,
      fieldOfStudy,
      hasJobOffer,
      applicantAge,
      languageProficiency
    },
    totalOptionsEvaluated: eligiblePathways.length + restrictedPathways.length,
    eligiblePathwaysCount: eligiblePathways.length,
    eligiblePathways,
    restrictedPathways,
    statutorySummary: 'Evaluated under IRPA (Canada), INA (USA), UK Immigration Rules, Migration Regs (Australia), AufenthG (Germany), and Federal Decree-Law No. 29/2021 (UAE).'
  };
}
