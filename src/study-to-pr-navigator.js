// src/study-to-pr-navigator.js
// Comprehensive Study-to-PR Pathway & Timeline Optimizer
// Computes PGWP rights, Canadian Experience Class (CEC) milestones under IRPR s. 87.1,
// and Provincial Nominee Program (PNP) graduate stream eligibility.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export function evaluateStudyToPrPathway({
  studyLevel = 'masters', // 'masters', 'doctoral', 'bachelors_4yr', 'diploma_2yr', 'certificate_1yr'
  province = 'ON',
  fieldOfStudy = 'stem_tech', // 'stem_tech', 'healthcare', 'business', 'trades', 'arts'
  expectedClbLanguage = 9,
  targetNocTeer = 1, // 0, 1, 2, 3
  hasPriorForeignExperience = true,
  yearsForeignExperience = 2,
  applicantName = 'International Student',
  assessmentDate = todayIso()
} = {}) {
  const safeStudyLevel = boundedText(studyLevel, 'masters', 50).toLowerCase();
  const safeProvince = boundedText(province, 'ON', 10).toUpperCase();
  const safeFieldOfStudy = boundedText(fieldOfStudy, 'stem_tech', 50).toLowerCase();
  const safeApplicantName = boundedText(applicantName, 'International Student', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const clb = Number.isFinite(Number(expectedClbLanguage)) ? Math.min(12, Math.max(0, Math.floor(Number(expectedClbLanguage)))) : 9;
  const teer = Number.isFinite(Number(targetNocTeer)) ? Math.min(5, Math.max(0, Math.floor(Number(targetNocTeer)))) : 1;
  const foreignYears = Number.isFinite(Number(yearsForeignExperience)) ? Math.min(50, Math.max(0, Math.floor(Number(yearsForeignExperience)))) : 2;

  // 1. Calculate PGWP Duration
  let pgwpMonths = 0;
  let pgwpConditionNotes = '';

  if (safeStudyLevel === 'masters' || safeStudyLevel === 'doctoral') {
    pgwpMonths = 36;
    pgwpConditionNotes = 'Master’s degree graduates qualify for the full 3-year PGWP, regardless of whether the program duration was 1 or 2 years (IRCC Nov 2024 policy).';
  } else if (safeStudyLevel === 'bachelors_4yr') {
    pgwpMonths = 36;
    pgwpConditionNotes = '4-year university degree qualifies for a 3-year PGWP across all academic disciplines.';
  } else if (safeStudyLevel === 'diploma_2yr') {
    pgwpMonths = 36;
    pgwpConditionNotes = '2-year post-secondary diploma qualifies for up to 3 years PGWP (subject to priority field of study for college credentials).';
  } else {
    pgwpMonths = 12;
    pgwpConditionNotes = '1-year certificate qualifies for a 1-year PGWP matching program duration.';
  }

  // 2. Canadian Experience Class (CEC) Milestone (IRPR s. 87.1)
  const cecHoursRequired = 1560;
  const cecWeeksRequired = 52;
  const cecMonthsRequired = 12;

  // 3. Projected CRS Human Capital Points Gain
  let canadianStudyCrsBonus = 0;
  if (['masters', 'doctoral', 'bachelors_4yr'].includes(safeStudyLevel)) {
    canadianStudyCrsBonus = 30; // 3+ years or master's
  } else if (safeStudyLevel === 'diploma_2yr') {
    canadianStudyCrsBonus = 15;
  }

  const oneYearCanadianWorkCrsBonus = 40; // Single candidate baseline
  const skillTransferabilityCrsBonus = 50; // Foreign experience + Canadian experience + CLB 9

  const totalProjectedCrsGain = canadianStudyCrsBonus + oneYearCanadianWorkCrsBonus + skillTransferabilityCrsBonus;

  // 4. Provincial Nominee Streams
  const eligiblePnpStreams = [];
  if (safeProvince === 'ON') {
    if (safeStudyLevel === 'masters') {
      eligiblePnpStreams.push('OINP Masters Graduate Stream (No job offer required; points-based EOI invite).');
    } else if (safeStudyLevel === 'doctoral') {
      eligiblePnpStreams.push('OINP PhD Graduate Stream (Direct application; highest approval priority).');
    }
    eligiblePnpStreams.push('OINP Employer Job Offer: International Student Stream (requires permanent full-time job offer in TEER 0, 1, 2, 3).');
    eligiblePnpStreams.push('OINP Human Capital Priorities (Express Entry-aligned French or Tech draws).');
  } else if (safeProvince === 'BC') {
    if (['masters', 'doctoral'].includes(safeStudyLevel) && ['stem_tech', 'healthcare'].includes(safeFieldOfStudy)) {
      eligiblePnpStreams.push('BC PNP International Post-Graduate Stream (Direct PR nomination with no job offer required for qualifying STEM/Health degrees).');
    }
    eligiblePnpStreams.push('BC PNP Skills Immigration: International Graduate Stream (Requires indeterminate job offer from BC employer).');
  } else if (safeProvince === 'AB') {
    eligiblePnpStreams.push('Alberta Opportunity Stream (AOS) for Alberta DLI graduates with qualifying post-graduation work.');
    eligiblePnpStreams.push('AAIP Accelerated Tech Pathway (Express Entry-aligned for tech NOC codes).');
  }

  // 5. Sequential Step-by-Step Roadmap
  const milestones = [
    {
      phase: 'Phase 1: Academic Study & Work Authorization',
      duration: safeStudyLevel === 'masters' ? '12-24 Months' : safeStudyLevel === 'diploma_2yr' ? '24 Months' : '48 Months',
      keyActions: [
        'Maintain continuous full-time student status at Designated Learning Institution (DLI).',
        'Work up to 20/24 hours per week off-campus during academic terms under IRPR s. 186(v).',
        'Maintain minimum 3.0+ GPA and secure relevant co-op/internship experience.'
      ]
    },
    {
      phase: 'Phase 2: PGWP & Career Transition',
      duration: 'Months 1-4 Post-Graduation',
      keyActions: [
        'Obtain official final completion letter and transcripts from Registrar.',
        'Apply for PGWP within 180-day statutory window (IRPR s. 205(c)(ii)).',
        'Begin full-time work immediately under maintained status (IRPR s. 186(w)) while awaiting PGWP decision.',
        `Target job offer in NOC TEER ${teer} with minimum 30 hours/week.`
      ]
    },
    {
      phase: 'Phase 3: Canadian Work Experience & CEC Qualification',
      duration: 'Months 5-16 of PGWP',
      keyActions: [
        `Accumulate exactly 52 weeks (1,560 hours) of continuous skilled Canadian work experience under TEER ${teer}.`,
        'Ensure all pay is received via direct deposit with pay stubs and T4 statements (zero cash-in-hand).',
        'Achieve minimum official language benchmark (CLB 9 recommended for maximum CRS points).'
      ]
    },
    {
      phase: 'Phase 4: Permanent Residence Application',
      duration: 'Month 17+ of PGWP',
      keyActions: [
        `Submit Express Entry profile under Canadian Experience Class with projected +${totalProjectedCrsGain} CRS point gain.`,
        eligiblePnpStreams.length > 0 ? `Simultaneously submit Expression of Interest for ${eligiblePnpStreams[0].split('(')[0].trim()}.` : 'Monitor category-based Express Entry selection draws.',
        'Upon receiving ITA / Nomination, submit electronic PR application (e-APR) within 60 days.'
      ]
    }
  ];

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    studyLevel: safeStudyLevel,
    province: safeProvince,
    fieldOfStudy: safeFieldOfStudy,
    expectedClbLanguage: clb,
    targetNocTeer: teer,
    yearsForeignExperience: foreignYears,
    pgwpEntitlement: {
      durationMonths: pgwpMonths,
      notes: pgwpConditionNotes,
      maintainsWorkRightsWhileWaiting: true
    },
    prPathways: {
      federalCecRequirement: `${cecMonthsRequired} months (${cecWeeksRequired} weeks / ${cecHoursRequired} hours) skilled Canadian work.`,
      projectedCrsGain: totalProjectedCrsGain,
      breakdown: {
        canadianStudyBonus: canadianStudyCrsBonus,
        canadianWorkExperienceBonus: oneYearCanadianWorkCrsBonus,
        skillTransferabilityBonus: skillTransferabilityCrsBonus
      },
      provincialNomineeOptions: eligiblePnpStreams
    },
    milestoneRoadmap: milestones,
    statutoryBasis: 'IRPR s. 87.1 (Canadian Experience Class), s. 205(c)(ii) (PGWP), s. 186(w) (Interim Work Rights).'
  };
}
