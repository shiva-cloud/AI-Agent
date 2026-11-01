import fs from 'node:fs';

const modalPath = 'public/tool-modal.js';
let content = fs.readFileSync(modalPath, 'utf8');

const formsTarget = `    'poe-rights': {
      title: 'Airport & Border Port-of-Entry Rights Navigator',
      endpoint: '/v1/tools/poe-rights',
      fields: [
        { id: 'country', label: 'Destination Border Agency', type: 'select', options: [
          { val: 'CA', text: 'Canada (Canada Border Services Agency - CBSA)' },
          { val: 'US', text: 'United States (U.S. Customs and Border Protection - CBP)' },
          { val: 'UK', text: 'United Kingdom (UK Border Force)' },
          { val: 'AU', text: 'Australia (Australian Border Force - ABF)' }
        ]},
        { id: 'status', label: 'Immigration Status Category', type: 'select', options: [
          { val: 'work_permit', text: 'Work Permit Holder' },
          { val: 'study_permit', text: 'International Student' },
          { val: 'visitor', text: 'Visitor / Family' },
          { val: 'permanent_resident', text: 'Permanent Resident / Immigrant' }
        ]},
        { id: 'secondary', label: 'Currently in Secondary Inspection?', type: 'select', options: [
          { val: 'false', text: 'No (Standard Primary Inspection Prep)' },
          { val: 'true', text: 'Yes (Undergoing Secondary Examination)' }
        ]},
        { id: 'deviceSearch', label: 'Concerned about Mobile Phone / Laptop Search?', type: 'select', options: [
          { val: 'true', text: 'Yes (Digital Privacy & Cloud Search Rules)' },
          { val: 'false', text: 'No' }
        ]},
        { id: 'refusalRisk', label: 'Facing Threat of Entry Refusal or Removal?', type: 'select', options: [
          { val: 'true', text: 'Yes (Evaluate Voluntary Withdrawal vs Exclusion Order)' },
          { val: 'false', text: 'No' }
        ]}
      ]
    }`;

const formsReplacement = `${formsTarget},
    'esa-wage-theft': {
      title: 'Ontario ESA Wage Theft, Overtime (44h), Vacation & Misclassification',
      endpoint: '/v1/tools/esa-wage-theft',
      fields: [
        { id: 'action', label: 'Statutory Standard Audit', type: 'select', options: [
          { val: 'overtime', text: 'Overtime Pay Audit (44 Hours / 1.5x Rate)' },
          { val: 'vacation', text: 'Vacation Pay Step-Up (4% to 6% at 5 Years)' },
          { val: 'holiday', text: 'Public Holiday Pay (Prior 4 Weeks / 20)' },
          { val: 'severance', text: 'Statutory Severance Pay ($2.5M Payroll / 5+ Yrs)' },
          { val: 'misclassification', text: 'Contractor Misclassification (Sagaz 5-Factor)' },
          { val: 'equal_pay', text: 'Equal Pay for Equal Work (Agency vs Direct)' }
        ]},
        { id: 'rate', label: 'Hourly Wage Rate ($ CAD)', type: 'number', default: 25.00 },
        { id: 'hours', label: 'Weekly Hours Worked (for Overtime)', type: 'number', default: 52 },
        { id: 'earnings', label: 'Gross Annual Earnings ($ CAD for Vacation)', type: 'number', default: 60000 },
        { id: 'years', label: 'Years of Continuous Service', type: 'number', default: 5.5 },
        { id: 'wages', label: 'Gross Wages in Prior 4 Weeks ($ CAD for Holiday)', type: 'number', default: 3600 },
        { id: 'payroll', label: 'Employer Ontario Payroll ($ CAD for Severance)', type: 'number', default: 3000000 }
      ]
    },
    'workplace-rights': {
      title: 'Workplace Rights: Constructive Dismissal, Canadian Experience Ban & WSIB',
      endpoint: '/v1/tools/workplace-rights',
      fields: [
        { id: 'action', label: 'Rights Violation Matter', type: 'select', options: [
          { val: 'constructive_dismissal', text: 'Constructive Dismissal Audit (Potter v NB Legal Aid)' },
          { val: 'canadian_experience', text: 'Canadian Experience Barrier Ban (OHRC & FARPACTA)' },
          { val: 'work_refusal', text: 'OHSA Unsafe Work Refusal & Anti-Reprisal (s. 43/50)' },
          { val: 'wsib_deadline', text: 'WSIB Injury Claim 6-Month Statutory Window (WSIA s. 22)' }
        ]},
        { id: 'wageCut', label: 'Unilateral Wage Reduction Percentage (%)', type: 'number', default: 15 },
        { id: 'type', label: 'Canadian Experience Context', type: 'select', options: [
          { val: 'employment_hiring', text: 'General Job Hiring / Interview Screening (OHRC)' },
          { val: 'professional_licensure', text: 'Regulated Profession Licensure (FARPACTA s. 10.2)' }
        ]},
        { id: 'profession', label: 'Regulated Profession (e.g. Engineers PEO, CPA)', type: 'text', default: 'Professional Engineers Ontario' },
        { id: 'reported', label: 'Hazard Reported to Supervisor?', type: 'select', options: [
          { val: 'true', text: 'Yes (Formal Notice Given)' },
          { val: 'false', text: 'No' }
        ]},
        { id: 'disciplined', label: 'Employer Threatened or Disciplined Worker?', type: 'select', options: [
          { val: 'false', text: 'No' },
          { val: 'true', text: 'Yes (Unlawful Reprisal Threat)' }
        ]},
        { id: 'accidentDate', label: 'Date of Workplace Injury (YYYY-MM-DD)', type: 'text', default: '2026-06-01' }
      ]
    },
    'ei-benefits': {
      title: 'Employment Insurance (EI): Regular, Sickness, Parental & QPIP',
      endpoint: '/v1/tools/ei-benefits',
      fields: [
        { id: 'action', label: 'EI Benefit Stream', type: 'select', options: [
          { val: 'regular', text: 'EI Regular Benefits (420-700 Hours Grid & $668/wk)' },
          { val: 'just_cause', text: 'Voluntary Quit Just Cause Defense (EI Act s. 29(c))' },
          { val: 'sickness', text: 'EI Sickness Benefits (26-Week Maximum)' },
          { val: 'parental', text: 'Maternity & Parental (Standard 55% vs Extended 33%)' },
          { val: 'qpip', text: 'Quebec QPIP Dedicated 5-Week Paternity Leave' }
        ]},
        { id: 'hours', label: 'Insurable Hours Accrued in Past 52 Weeks', type: 'number', default: 650 },
        { id: 'rate', label: 'Regional Unemployment Rate (%)', type: 'number', default: 7.5 },
        { id: 'earnings', label: 'Average Weekly Insurable Earnings ($ CAD)', type: 'number', default: 1200 },
        { id: 'reason', label: 'Voluntary Separation Reason (if applicable)', type: 'select', options: [
          { val: 'spouse_relocation', text: 'Spouse Relocation for Employment' },
          { val: 'harassment', text: 'Workplace Sexual or Personal Harassment' },
          { val: 'wage_cut', text: 'Major Unilateral Wage Reduction' },
          { val: 'unsafe_conditions', text: 'Dangerous or Unsafe Working Conditions' },
          { val: 'discrimination', text: 'Human Rights Discrimination' }
        ]}
      ]
    },
    'fcr-bridging': {
      title: 'Foreign Credential Recognition (FCR) & Healthcare Bridging Directory',
      endpoint: '/v1/tools/fcr-bridging',
      fields: [
        { id: 'action', label: 'Bridging Pathway', type: 'select', options: [
          { val: 'micro_loans', text: 'FCR Micro-Loans ($15,000 Low-Interest Windmill/Achēv)' },
          { val: 'ien_spep', text: 'IEN Supervised Practice Experience Partnership (SPEP - CNO)' },
          { val: 'img_pra', text: 'IMG Practice Ready Assessment (PRA-BC / AIMG Clinical Pathway)' }
        ]},
        { id: 'status', label: 'Immigration Status in Canada', type: 'select', options: [
          { val: 'permanent_resident', text: 'Permanent Resident (PR)' },
          { val: 'open_work_permit', text: 'Open Work Permit Holder' },
          { val: 'canadian_citizen', text: 'Canadian Citizen' },
          { val: 'study_permit', text: 'International Student' }
        ]},
        { id: 'funding', label: 'Required Credentialing Funding ($ CAD)', type: 'number', default: 12000 },
        { id: 'province', label: 'Target Province (for IMG PRA)', type: 'select', options: [
          { val: 'BC', text: 'British Columbia (PRA-BC)' },
          { val: 'AB', text: 'Alberta (AIMG / PRA-AB)' },
          { val: 'ON', text: 'Ontario (Touchstone Institute)' },
          { val: 'SK', text: 'Saskatchewan (SIPPA)' }
        ]}
      ]
    }`;

if (!content.includes(formsTarget)) {
  console.error('formsTarget not found!');
  process.exit(1);
}

content = content.replace(formsTarget, formsReplacement);

const renderTarget = `    if (data.checklist?.length) {
      out += '<h5>Action Checklist:</h5><ul>';
      for (const item of data.checklist) out += \`<li>\${item}</li>\`;
      out += '</ul>';
    }`;

const renderAdditions = `    if (data.overtimeRateCad !== undefined || data.statutoryVacationPayCad !== undefined || data.publicHolidayPayCad !== undefined || data.totalSeverancePayCad !== undefined || data.classificationVerdict || data.isEqualPayViolation !== undefined) {
      if (data.overtimeRateCad !== undefined) {
        out += \`<div class="modal-badge badge-compliant">OVERTIME RATE: $\${data.overtimeRateCad} CAD/hr (Standard: \${data.standardWeeklyThresholdHours}h)</div>\`;
        out += \`<p><strong>Weekly Pay:</strong> Regular: $\${data.regularPayCad} CAD (\${data.regularHours}h) + Overtime: $\${data.overtimePayCad} CAD (\${data.overtimeHours}h) = <strong>$\${data.totalWeeklyPayCad} CAD</strong></p>\`;
      }
      if (data.statutoryVacationPayCad !== undefined) {
        out += \`<div class="modal-badge badge-compliant">VACATION PAY: $\${data.statutoryVacationPayCad.toLocaleString()} CAD (\${data.entitlementWeeks} Weeks / \${data.applicableRatePercent * 100}%)</div>\`;
        if (data.potentialUnderpaymentCad > 0) {
          out += \`<p class="modal-warn-text">⚠️ Employer 4% Underpayment Discrepancy: $\${data.potentialUnderpaymentCad.toLocaleString()} CAD owed under ESA s. 35.1.</p>\`;
        }
      }
      if (data.publicHolidayPayCad !== undefined) {
        out += \`<div class="modal-badge badge-compliant">PUBLIC HOLIDAY PAY: $\${data.publicHolidayPayCad.toLocaleString()} CAD (Divisor: 20)</div>\`;
      }
      if (data.totalSeverancePayCad !== undefined) {
        const sevCls = data.isEligibleForSeverance ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${sevCls}">STATUTORY SEVERANCE: $\${data.totalSeverancePayCad.toLocaleString()} CAD (\${data.severanceWeeksEntitled} Weeks)</div>\`;
      }
      if (data.classificationVerdict) {
        const classCls = data.isMisclassified ? 'badge-warn' : 'badge-compliant';
        out += \`<div class="modal-badge \${classCls}">\${data.classificationVerdict}</div>\`;
        out += \`<p class="modal-warn-text">\${data.reverseBurdenOfProof}</p>\`;
      }
      if (data.isEqualPayViolation !== undefined) {
        const epCls = data.isEqualPayViolation ? 'badge-warn' : 'badge-compliant';
        out += \`<div class="modal-badge \${epCls}">EQUAL PAY: \${data.isEqualPayViolation ? 'VIOLATION' : 'COMPLIANT'} ($\${data.hourlyDisparityCad}/hr gap)</div>\`;
        out += \`<p>\${data.legalRule}</p>\`;
      }
    }

    if (data.isConstructiveDismissal !== undefined || data.isPrimaFacieDiscrimination !== undefined || data.reprisalAudit || data.monthsRemainingToClaim !== undefined) {
      if (data.isConstructiveDismissal !== undefined) {
        const cdCls = data.isConstructiveDismissal ? 'badge-warn' : 'badge-compliant';
        out += \`<div class="modal-badge \${cdCls}">CONSTRUCTIVE DISMISSAL: \${data.isConstructiveDismissal ? 'SUBSTANTIAL BREACH' : 'NOT ESTABLISHED'}</div>\`;
        if (data.condonationAudit?.legalWarning) out += \`<p class="modal-warn-text">\${data.condonationAudit.legalWarning}</p>\`;
      }
      if (data.isPrimaFacieDiscrimination !== undefined || data.profession) {
        const discCls = (data.isPrimaFacieDiscrimination || data.isViolation) ? 'badge-warn' : 'badge-compliant';
        out += \`<div class="modal-badge \${discCls}">CANADIAN EXPERIENCE: \${discCls === 'badge-warn' ? 'PROHIBITED REQUIREMENT' : 'COMPLIANT'}</div>\`;
        out += \`<p>\${data.legalStandard || data.legalRule}</p>\`;
      }
      if (data.reprisalAudit) {
        const repCls = data.reprisalAudit.hasUnlawfulReprisalOccurred ? 'badge-warn' : 'badge-compliant';
        out += \`<div class="modal-badge \${repCls}">OHSA WORK REFUSAL: \${data.currentStage}</div>\`;
        if (data.reprisalAudit.hasUnlawfulReprisalOccurred) {
          out += \`<p class="modal-warn-text">⚠️ \${data.reprisalAudit.legalRule} \${data.reprisalAudit.reverseBurdenOfProof}</p>\`;
        }
      }
      if (data.monthsRemainingToClaim !== undefined) {
        const wsibCls = data.isWithinClaimDeadline ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${wsibCls}">WSIB 6-MONTH LIMITATION: \${data.isWithinClaimDeadline ? \`\${data.monthsRemainingToClaim} MONTHS LEFT\` : 'EXPIRED'}</div>\`;
        out += \`<p>\${data.actionRequired}</p>\`;
      }
    }

    if (data.requiredHoursThreshold !== undefined || data.isJustCauseEstablished !== undefined || data.benefitType) {
      if (data.requiredHoursThreshold !== undefined) {
        const eiCls = data.isEligible ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${eiCls}">EI REGULAR: \${data.isEligible ? \`QUALIFIED ($\${data.estimatedWeeklyBenefitCad}/wk)\` : 'DISQUALIFIED / INSUFFICIENT HOURS'}</div>\`;
        out += \`<p><strong>Hours Accrued:</strong> \${data.insurableHoursAccrued} / \${data.requiredHoursThreshold} hrs required (Regional Rate: \${data.regionalUnemploymentRatePercent}%)</p>\`;
      }
      if (data.isJustCauseEstablished !== undefined) {
        const jcCls = data.isJustCauseEstablished ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${jcCls}">EI JUST CAUSE (s. 29(c)): \${data.isJustCauseEstablished ? 'ESTABLISHED (NOT DISQUALIFIED)' : 'DISQUALIFICATION RISK'}</div>\`;
        out += \`<p>\${data.statutoryRule}</p>\`;
      }
      if (data.benefitType && !data.requiredHoursThreshold) {
        out += \`<div class="modal-badge badge-compliant">\${data.benefitType.toUpperCase()}</div>\`;
        if (data.weeklyRateCad || data.weeklyBenefitRateCad) {
          out += \`<p><strong>Weekly Rate:</strong> $\${data.weeklyRateCad || data.weeklyBenefitRateCad} CAD/wk</p>\`;
        }
        if (data.irrevocabilityWarning) out += \`<p class="modal-warn-text">⚠️ \${data.irrevocabilityWarning}</p>\`;
      }
    }

    if (data.availableLoanPrograms || data.isEligibleForSpep !== undefined || data.isEligibleForPra !== undefined) {
      if (data.availableLoanPrograms) {
        const fcrCls = data.isEligibleForFcrLoans ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${fcrCls}">FCR MICRO-LOANS: \${data.isEligibleForFcrLoans ? 'ELIGIBLE (UP TO $15,000 CAD)' : 'INELIGIBLE'}</div>\`;
        out += \`<p>\${data.guidance}</p>\`;
      }
      if (data.isEligibleForSpep !== undefined) {
        const spepCls = data.isEligibleForSpep ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${spepCls}">CNO SPEP NURSING: \${data.isEligibleForSpep ? 'ELIGIBLE FOR PAID PLACEMENT' : 'INELIGIBLE'}</div>\`;
        out += \`<p>\${data.nextSteps}</p>\`;
      }
      if (data.isEligibleForPra !== undefined) {
        const praCls = data.isEligibleForPra ? 'badge-compliant' : 'badge-warn';
        out += \`<div class="modal-badge \${praCls}">IMG PRA (\${data.province}): \${data.isEligibleForPra ? 'ELIGIBLE' : 'PENDING REQUIREMENTS'}</div>\`;
        out += \`<p><strong>\${data.programName}:</strong> \${data.majorAdvantage}</p>\`;
      }
    }
\n` + renderTarget;

if (!content.includes(renderTarget)) {
  console.error('renderTarget not found!');
  process.exit(1);
}

content = content.replace(renderTarget, renderAdditions);
fs.writeFileSync(modalPath, content, 'utf8');
console.log('Successfully updated public/tool-modal.js with Batch 5 tools!');
