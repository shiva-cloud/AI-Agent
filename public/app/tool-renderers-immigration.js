import { $, escapeHtml } from './core.js';

export function renderCitizenshipAssessment(data, container) {
  if (!container) return;
  const {
    applicationDate,
    prLandingDate,
    eligibilityWindow,
    physicalPresenceAudit,
    taxCompliance,
    languageAudit,
    prohibitionsAudit,
    overallReadiness,
    governmentFeeSchedule,
    statutoryChecklist,
    statutoryAdvisories,
    statutoryAuthority
  } = data;

  const isEligible = overallReadiness.isEligibleNow;
  const badgeBg = isEligible ? '#d1fae5' : (overallReadiness.status === 'prohibited' ? '#fee2e2' : '#fef3c7');
  const badgeColor = isEligible ? '#065f46' : (overallReadiness.status === 'prohibited' ? '#991b1b' : '#92400e');
  const badgeLabel = isEligible ? 'ELIGIBLE TO APPLY NOW' : (overallReadiness.status === 'prohibited' ? 'PROHIBITED (S.22 BAR)' : 'IN PROGRESS');

  const progressPercent = Math.min(100, Math.round((physicalPresenceAudit.totalCreditedDays / physicalPresenceAudit.statutoryRequirementDays) * 100));

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span class="badge" data-style="background:${badgeBg};color:${badgeColor};font-weight:700;padding:0.25rem 0.6rem;border-radius:4px;font-size:0.82rem;">${badgeLabel}</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">Citizenship: days in Canada</h3>
          <span data-s="font-size-0_83rem color-text-muted">5-Year Lookback: ${eligibilityWindow.startDate} to ${eligibilityWindow.endDate}</span>
        </div>
        <div data-s="text-align-right">
          <div data-style="font-size:1.3rem;font-weight:700;color:${isEligible ? '#10b981' : 'var(--primary,#0284c7)'};">${physicalPresenceAudit.totalCreditedDays} / ${physicalPresenceAudit.statutoryRequirementDays} Days</div>
          <span data-s="font-size-0_8rem color-text-muted">${physicalPresenceAudit.surplusOrShortfallDays >= 0 ? `+${physicalPresenceAudit.surplusOrShortfallDays} Surplus Days` : `${Math.abs(physicalPresenceAudit.surplusOrShortfallDays)} Days Short`}</span>
        </div>
      </div>

      <div data-s="margin-bottom-1_25rem">
        <div data-s="display-flex justify-content-space-between font-size-0_8rem margin-bottom-0_25rem">
          <span class="muted">Physical Presence Progress</span>
          <strong>${progressPercent}% Complete</strong>
        </div>
        <div data-s="height-8px background-bg-elevated-e2e8f0 border-radius-4px overflow-hidden">
          <div data-style="width:${progressPercent}%;height:100%;background:${isEligible ? '#10b981' : '#0284c7'};transition:width 0.3s ease;"></div>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Pre-PR Credit (s.5(1.001))</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">${physicalPresenceAudit.prePrCreditedDays} Days</div>
          <div class="muted" data-s="font-size-0_75rem">From ${physicalPresenceAudit.prePrActualDaysPresent} work/study days (Max 365)</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Post-PR Net Presence</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">${physicalPresenceAudit.postPrCreditedDays} Days</div>
          <div class="muted" data-s="font-size-0_75rem">${physicalPresenceAudit.postPrDaysSinceLanding} since PR - ${physicalPresenceAudit.postPrDaysAbsent} absent</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Earliest Eligible Date</div>
          <div data-style="font-size:1.2rem;font-weight:700;color:${isEligible ? '#10b981' : '#0284c7'};">${physicalPresenceAudit.earliestProjectedEligibleDate}</div>
          <div class="muted" data-s="font-size-0_75rem">${isEligible ? 'Eligible today!' : 'Assuming zero future travel'}</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Government Fee</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">$${governmentFeeSchedule.adultFeeCad} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">$100 refundable if refused</div>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-240 gap-0_75rem margin-bottom-1_25rem">
        <div data-style="padding:0.75rem;background:var(--bg-elevated,#f8fafc);border:1px solid var(--border);border-left:4px solid ${taxCompliance.hasMetTaxRequirement ? '#10b981' : '#ef4444'};border-radius:4px;font-size:0.83rem;">
          <strong>${taxCompliance.hasMetTaxRequirement ? '✓' : '✗'} CRA 3-Year Tax Filing (s.5(1)(c.1))</strong>
          <p data-s="margin-0_25rem-0-0-0 color-text-muted">${taxCompliance.taxYearsFiled} of ${taxCompliance.requiredTaxYears} taxation years filed within the 5-year eligibility window.</p>
        </div>

        <div data-style="padding:0.75rem;background:var(--bg-elevated,#f8fafc);border:1px solid var(--border);border-left:4px solid ${languageAudit.status !== 'proof_required' ? '#10b981' : '#f59e0b'};border-radius:4px;font-size:0.83rem;">
          <strong>${languageAudit.status !== 'proof_required' ? '✓' : '⚠️'} CLB 4 Language Proof (s.5(1)(d))</strong>
          <p data-s="margin-0_25rem-0-0-0 color-text-muted">${languageAudit.note}</p>
        </div>
      </div>

      <div data-s="margin-bottom-1_25rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">📋 IRCC Citizenship Application Filing Checklist:</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_83rem color-text-muted">
          ${statutoryChecklist.map(step => `<li data-s="margin-bottom-0_25rem">${step}</li>`).join('')}
        </ul>
      </div>

      <div data-s="background-fffbeb border-1px-solid-fde68a border-left-4px-solid-f59e0b border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_85rem line-height-1_45">
        <strong data-s="color-b45309">⚠️ IRCC Travel Buffer Golden Rule:</strong><br>
        Never submit your application with exactly 1,095 days. Any unforeseen date calculation discrepancy of even a single day results in statutory refusal and forfeiture of your $530 processing fee. Wait until you have accumulated at least <strong>1,110 to 1,125 days</strong> before submitting Form CIT 0002.
      </div>

      <div class="muted" data-s="font-size-0_75rem border-top-1px-solid-border padding-top-0_5rem">
        Statutory Authority: ${statutoryAuthority}
      </div>
    </div>
  `;
}

export function renderPrResidencyAssessment(data, container) {
  const status = data.complianceStatus;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (status === 'FULLY_COMPLIANT') {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ 730 DAYS RESIDENCY MET</span>';
    statusColor = '#10b981';
  } else if (status === 'IN_PROGRESS_ON_TRACK') {
    statusBadge = '<span data-s="background-rgba-2-132-199-0_15 color-0284c7 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">ℹ 5-YEAR WINDOW IN PROGRESS (SAFE)</span>';
    statusColor = '#0284c7';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ At risk of breaking the rules</span>';
    statusColor = '#dc2626';
  }

  const dayAudit = data.residencyDayAudit;
  const renewal = data.renewalEligibility;
  const urgent = data.urgentProcessingAssessment;
  const prtd = data.prTravelDocumentAssessment;

  let urgentHtml = '';
  if (urgent.isEligibleForUrgentProcessing) {
    urgentHtml = `
      <div data-s="margin-top-1rem background-rgba-16-185-129-0_08 border-1px-solid-rgba-16-185-129-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-10b981 font-size-0_92rem">⚡ ELIGIBLE FOR IMM 5444 URGENT PROCESSING</h4>
        <p data-s="margin-0-0-0_5rem-0 font-size-0_82rem">${urgent.qualifyingCriteria.map(c => escapeHtml(c)).join(' ')}</p>
        <div data-s="font-weight-600 font-size-0_8rem margin-bottom-0_25rem">What to submit:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_25rem">
          ${urgent.requiredProof.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let prtdHtml = '';
  if (prtd.isNeeded) {
    prtdHtml = `
      <div data-s="margin-top-1rem background-rgba-245-158-11-0_08 border-1px-solid-rgba-245-158-11-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-f59e0b font-size-0_92rem">✈️ PRTD (PERMANENT RESIDENT TRAVEL DOCUMENT) REQUIRED</h4>
        <p data-s="margin-0 font-size-0_82rem color-text-muted">
          Because you are currently outside Canada with an expired or expiring PR card, commercial carriers (airlines, trains, buses) will deny boarding without a valid PR card or PRTD. Apply online via the <strong>${escapeHtml(prtd.processingPlatform)}</strong> (${escapeHtml(prtd.statutoryBasis)}). Government fee: $${prtd.feeCad} CAD.
        </p>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">RESIDENCY REQUIREMENT (IRPA S.28)</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PHYSICAL PRESENCE IN CANADA</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${dayAudit.actualDaysInsideCanada} Days
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Statutory floor: ${dayAudit.statutoryMinimumDaysRequired} days
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">OVERSEAS EXEMPTION CREDITS</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem color-0284c7">
            +${dayAudit.overseasExemptedDays.totalOverseasCreditedDays} Days
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Spouse s.28(2)(a)(ii): ${dayAudit.overseasExemptedDays.accompanyingCitizenSpouseDays}d | Biz: ${dayAudit.overseasExemptedDays.canadianBusinessEmploymentDays}d
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">TOTAL CREDITED RESIDENCY</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${statusColor};">
            ${dayAudit.totalCreditedResidencyDays} Days
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${dayAudit.surplusOrDeficitDays >= 0 ? '#10b981' : '#dc2626'};">
            ${dayAudit.surplusOrDeficitDays >= 0 ? `+${dayAudit.surplusOrDeficitDays} Surplus Days` : `${dayAudit.surplusOrDeficitDays} Shortfall Days`}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PR CARD EXPIRY STATUS</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${data.isCardExpired ? '<span data-s="color-dc2626">Expired</span>' : `${data.daysUntilExpiry} Days Left`}
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${renewal.isEligibleToApplyForRenewal ? '#10b981' : 'var(--text-muted)'};">
            ${renewal.isEligibleToApplyForRenewal ? '✓ Eligible for Renewal ($50 fee)' : 'Renewal window not yet open'}
          </div>
        </div>
      </div>

      ${urgentHtml}
      ${prtdHtml}

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">IRCC RESIDENCY &amp; BORDER RE-ENTRY ADVISORY MEMO:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderMedicalAdmissibilityAssessment(data, container) {
  const det = data.determination;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (det === 'STATUTORILY_EXEMPT') {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ EXEMPT FROM EXCESSIVE DEMAND (IRPA s. 38(2))</span>';
    statusColor = '#10b981';
  } else if (det === 'ADMISSIBLE_BELOW_THRESHOLD' || det === 'TEMPORARY_RESIDENT_EXEMPT') {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ ADMISSIBLE (BELOW THRESHOLD)</span>';
    statusColor = '#10b981';
  } else if (det === 'PFL_RESPONSE_MITIGATION_REQUIRED') {
    statusBadge = '<span data-s="background-rgba-245-158-11-0_15 color-f59e0b padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ PFL MITIGATION REQUIRED (HILEWITZ IMP)</span>';
    statusColor = '#f59e0b';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">🚨 INADMISSIBLE / HIGH RISK</span>';
    statusColor = '#dc2626';
  }

  const cost = data.statutoryCostAudit;
  const mit = data.mitigationFeasibility;
  const pfl = data.proceduralFairnessClock;

  let dangerHtml = '';
  if (data.publicDangerAssessment.hasIssues) {
    dangerHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-dc2626 font-size-0_92rem">🚨 INADMISSIBILITY GROUND: DANGER TO PUBLIC HEALTH / SAFETY</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.publicDangerAssessment.issues.map(i => `<li><strong>${escapeHtml(i.ground)}:</strong> ${escapeHtml(i.description)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let pflClockHtml = '';
  if (pfl.receivedPfl) {
    pflClockHtml = `
      <div data-s="margin-top-1rem background-rgba-245-158-11-0_08 border-1px-solid-rgba-245-158-11-0_3 border-radius-8px padding-0_85rem">
        <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
          <div>
            <h4 data-s="margin-0 color-f59e0b font-size-0_92rem">⏱️ PROCEDURAL FAIRNESS LETTER (PFL) 90-DAY RESPONSE WINDOW</h4>
            <div data-s="font-size-0_82rem color-text-muted margin-top-0_2rem">
              Deadline: <strong>${escapeHtml(pfl.statutoryDeadlineDate || '90 days from receipt')}</strong>
            </div>
          </div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${pfl.daysRemainingToRespond < 20 ? '#dc2626' : '#f59e0b'};">
            ${pfl.daysRemainingToRespond} Days Remaining
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">IRPA SECTION 38 MEDICAL ADMISSIBILITY VERDICT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">ESTIMATED ANNUAL MEDICAL COST</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            $${cost.estimatedGrossAnnualCostCad.toLocaleString()} CAD/yr
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${cost.exceedsStatutoryThreshold ? '#dc2626' : '#10b981'};">
            Threshold: $${cost.annualThresholdCad.toLocaleString()} CAD/yr ${cost.exceedsStatutoryThreshold ? `(+$${cost.costExceededAnnualCad.toLocaleString()} excess)` : '(Compliant)'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">5-YEAR CUMULATIVE COST</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            $${cost.estimatedGrossFiveYearCostCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            5-Year Ceiling: $${cost.fiveYearThresholdCad.toLocaleString()} CAD
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PRIVATE INSURANCE DRUG OFFSET</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem color-0284c7">
            -$${mit.annualPrivateInsuranceOffsetCad.toLocaleString()} CAD/yr
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Net Public Cost: $${mit.netAnnualPublicCostCad.toLocaleString()} CAD/yr
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">MITIGATION FEASIBILITY (SCC 2005)</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${mit.canMitigateExcessDemand ? '#10b981' : '#dc2626'};">
            ${mit.canMitigateExcessDemand ? '✓ Fully Mitigable' : '✗ Unmitigated Deficit'}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Liquid Buffer: $${mit.availableLiquidFundsCad.toLocaleString()} CAD
          </div>
        </div>
      </div>

      ${dangerHtml}
      ${pflClockHtml}

      <div data-s="margin-top-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_5rem">
          <label data-s="font-weight-600 font-size-0_88rem">DRAFT MITIGATION PLAN (REVIEW AND EDIT BEFORE SENDING):</label>
          <button type="button" class="btn-subtle" id="med-copy-imp-btn" data-s="padding-0_25rem-0_6rem font-size-0_8rem">📋 Copy Mitigation Plan (IMP)</button>
        </div>
        <textarea id="med-imp-text" readonly rows="8" data-s="width-100pc font-family-monospace font-size-0_82rem padding-0_6rem border-radius-6px border-1px-solid-border background-bg-card">${escapeHtml(data.individualizedMitigationPlanDraft)}</textarea>
      </div>

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">YOUR OPTIONS IF A MEDICAL ISSUE IS RAISED:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const copyBtn = $('#med-copy-imp-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const impText = $('#med-imp-text')?.value;
      if (impText && navigator.clipboard) {
        navigator.clipboard.writeText(impText).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Mitigation Plan (IMP)'; }, 2000);
        }).catch(() => {});
      }
    });
  }
}

export function renderStudentWorkComplianceAssessment(data, container) {
  const verdict = data.complianceVerdict;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (verdict === 'FULLY_COMPLIANT') {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ FULLY COMPLIANT</span>';
    statusColor = '#10b981';
  } else if (verdict === 'CURRENTLY_LEGAL_PGWP_AT_RISK') {
    statusBadge = '<span data-s="background-rgba-245-158-11-0_15 color-f59e0b padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ PGWP ELIGIBILITY AT RISK</span>';
    statusColor = '#f59e0b';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">🚨 UNAUTHORIZED WORK DETECTED</span>';
    statusColor = '#dc2626';
  }

  let violationsHtml = '';
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    violationsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 STATUTORY WORK &amp; STUDY PERMIT VIOLATIONS (${data.statutoryViolations.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryViolations.map(v => `
            <li>
              <strong data-s="color-dc2626">${escapeHtml(v.rule)}</strong><br>
              <span class="muted" data-s="font-size-0_78rem">Statute: ${escapeHtml(v.statute)}</span><br>
              <span data-s="font-size-0_8rem color-text">${escapeHtml(v.description)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let pgwpRisksHtml = '';
  if (data.pgwpEligibilityRisks && data.pgwpEligibilityRisks.length > 0) {
    pgwpRisksHtml = `
      <div data-s="margin-top-1rem background-rgba-245-158-11-0_08 border-1px-solid-rgba-245-158-11-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-f59e0b font-size-0_92rem">⚠️ POST-GRADUATION WORK PERMIT (PGWP) RISKS (${data.pgwpEligibilityRisks.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text display-flex flex-direction-column gap-0_35rem">
          ${data.pgwpEligibilityRisks.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">WORK-HOUR CHECK (IRPR S.186(v))</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">HOURS WORKED THIS WEEK</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${data.weeklyHoursWorked} hrs / ${data.maxPermittedHoursThisWeek} hrs max
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Statutory Cap: ${data.maxPermittedHoursThisWeek} hrs/week
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">OFF-CAMPUS WORK AUTHORIZATION</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${data.isWorkAuthorized ? '#10b981' : '#dc2626'};">
            ${data.isWorkAuthorized ? '✓ Authorized' : '✗ Prohibited / Illegal'}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Enrollment: ${escapeHtml(data.enrollmentStatus)}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">LEGAL BASIS</div>
          <div data-s="font-size-0_95rem font-weight-600 margin-top-0_25rem">
            IRPR s. 186(v)
          </div>
          <div data-s="font-size-0_78rem margin-top-0_2rem color-text-muted">
            Fall 2024 Federal 24h Reform
          </div>
        </div>
      </div>

      ${violationsHtml}
      ${pgwpRisksHtml}

      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS INTERNATIONAL STUDENTS SHOULD KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderSuperVisaAssessment(data, container) {
  const isEligible = data.isStatutorilyEligible;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (isEligible) {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ Likely eligible</span>';
    statusColor = '#10b981';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ Likely not eligible</span>';
    statusColor = '#dc2626';
  }

  const inc = data.incomeAudit;
  const ins = data.insuranceAudit;

  let violationsHtml = '';
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    violationsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 Possible problems found (${data.statutoryViolations.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryViolations.map(v => `
            <li>
              <strong data-s="color-dc2626">${escapeHtml(v.rule)}</strong><br>
              <span class="muted" data-s="font-size-0_78rem">Statute: ${escapeHtml(v.statute)}</span><br>
              <span data-s="font-size-0_8rem color-text">${escapeHtml(v.legalFinding)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let pgpYearsHtml = '';
  if (inc.isPgpStream && inc.year2 && inc.year3) {
    pgpYearsHtml = `
      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">INCOME IN EACH OF THE LAST 3 YEARS (MINIMUM + 30%, IRPR s. 133(1)(j)):</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem">
          <div data-s="border-1px-solid-border border-radius-6px padding-0_5rem background-surface-sunken">
            <div data-s="font-size-0_75rem color-text-muted">YEAR 1 (MOST RECENT)</div>
            <div data-style="font-weight:700;font-size:0.95rem;color:${inc.year1.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year1.actualIncomeCad.toLocaleString()} / ${inc.year1.requiredCad.toLocaleString()}
            </div>
            <div data-style="font-size:0.75rem;color:${inc.year1.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year1.isMet ? '✓ Met (+' + inc.year1.surplusOrDeficitCad.toLocaleString() + ')' : '✗ Deficit (' + inc.year1.surplusOrDeficitCad.toLocaleString() + ')'}
            </div>
          </div>
          <div data-s="border-1px-solid-border border-radius-6px padding-0_5rem background-surface-sunken">
            <div data-s="font-size-0_75rem color-text-muted">YEAR 2</div>
            <div data-style="font-weight:700;font-size:0.95rem;color:${inc.year2.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year2.actualIncomeCad.toLocaleString()} / ${inc.year2.requiredCad.toLocaleString()}
            </div>
            <div data-style="font-size:0.75rem;color:${inc.year2.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year2.isMet ? '✓ Met (+' + inc.year2.surplusOrDeficitCad.toLocaleString() + ')' : '✗ Deficit (' + inc.year2.surplusOrDeficitCad.toLocaleString() + ')'}
            </div>
          </div>
          <div data-s="border-1px-solid-border border-radius-6px padding-0_5rem background-surface-sunken">
            <div data-s="font-size-0_75rem color-text-muted">YEAR 3</div>
            <div data-style="font-weight:700;font-size:0.95rem;color:${inc.year3.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year3.actualIncomeCad.toLocaleString()} / ${inc.year3.requiredCad.toLocaleString()}
            </div>
            <div data-style="font-size:0.75rem;color:${inc.year3.isMet ? '#10b981' : '#dc2626'};">
              ${inc.year3.isMet ? '✓ Met (+' + inc.year3.surplusOrDeficitCad.toLocaleString() + ')' : '✗ Deficit (' + inc.year3.surplusOrDeficitCad.toLocaleString() + ')'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">${data.pathway === 'super_visa' ? 'SUPER VISA ELIGIBILITY' : 'PGP FAMILY SPONSORSHIP ELIGIBILITY'}</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">TOTAL FAMILY UNIT SIZE</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${data.totalFamilyUnitSize} Persons
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Inviter Status: ${escapeHtml(data.sponsorStatus)}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">YEAR 1 INCOME (CRA LINE 15000)</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${inc.year1.isMet ? '#10b981' : '#dc2626'};">
            ${inc.year1.actualIncomeCad.toLocaleString()} / ${inc.year1.requiredCad.toLocaleString()}
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${inc.year1.isMet ? '#10b981' : '#dc2626'};">
            ${inc.year1.isMet ? '✓ Surplus: +' + inc.year1.surplusOrDeficitCad.toLocaleString() + ' CAD' : '✗ Deficit: ' + inc.year1.surplusOrDeficitCad.toLocaleString() + ' CAD'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">${ins.isApplicable ? 'EMERGENCY MEDICAL INSURANCE' : 'UNDERTAKING DURATION'}</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${ins.isApplicable ? (ins.isInsuranceCompliant ? '#10b981' : '#dc2626') : '#0284c7'};">
            ${ins.isApplicable ? (ins.isInsuranceCompliant ? '✓ ' + ins.coverageAmountCad.toLocaleString() + ' CAD' : '✗ Non-Compliant') : '20-Year Liability'}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            ${ins.isApplicable ? ins.durationDays + ' Days (1 Year Required)' : 'Sponsor stays liable for repayment (Mavi, SCC 2011)'}
          </div>
        </div>
      </div>

      ${pgpYearsHtml}
      ${violationsHtml}

      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS SPONSORS SHOULD KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderExpressEntryAssessment(data, container) {
  if (!container) return;

  const b = data.breakdown;
  const cats = data.categoryEligibility;

  // Category Draw Status Cards
  const categoriesHtml = Object.entries(cats).map(([key, c]) => {
    const isInvited = c.likelyInvited;
    const isEligible = c.isEligible;
    const borderStyle = isInvited
      ? 'border:2px solid #16a34a;background:var(--surface-sunken);'
      : isEligible
        ? 'border:1px solid #f59e0b;background:var(--bg-card);'
        : 'border:1px solid var(--border);background:var(--bg-card);opacity:0.75;';

    const badge = isInvited
      ? `<span data-s="background-16a34a color-fff font-size-0_75rem font-weight-700 padding-0_15rem-0_45rem border-radius-4px">ABOVE REFERENCE CUT-OFF (+${c.scoreSurplus} PTS)</span>`
      : isEligible
        ? `<span data-s="background-f59e0b color-fff font-size-0_75rem font-weight-700 padding-0_15rem-0_45rem border-radius-4px">BELOW REFERENCE CUT-OFF (−${Math.abs(c.scoreSurplus)} PTS)</span>`
        : `<span data-s="background-border color-text font-size-0_75rem padding-0_15rem-0_45rem border-radius-4px">NOT IN THIS CATEGORY</span>`;

    return `
      <div data-style="border-radius:8px;padding:0.85rem;${borderStyle};display:flex;flex-direction:column;gap:0.4rem;">
        <div data-s="display-flex justify-content-space-between align-items-flex-start gap-0_5rem">
          <div data-s="font-weight-700 font-size-0_9rem">${escapeHtml(c.name)}</div>
          ${badge}
        </div>
        <div data-s="font-size-0_82rem color-text-muted display-flex justify-content-space-between align-items-center margin-top-0_25rem">
          <span>Benchmark Cut-off: <strong>${c.benchmarkCutoff} pts</strong></span>
          <span>Your Score: <strong>${data.totalCrsScore} pts</strong></span>
        </div>
      </div>
    `;
  }).join('');

  // Optimization Levers Cards
  const leversHtml = data.optimizationLevers.map(l => `
    <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem display-flex flex-direction-column gap-0_35rem">
      <div data-s="display-flex justify-content-space-between align-items-flex-start flex-wrap-wrap gap-0_5rem">
        <div data-s="font-weight-700 font-size-0_9rem color-color-primary-2563eb">${escapeHtml(l.lever)}</div>
        <div data-s="display-flex align-items-center gap-0_4rem">
          <span data-s="background-16a34a color-fff font-size-0_75rem font-weight-800 padding-0_15rem-0_45rem border-radius-4px">
            +${l.potentialPointsGain} PTS
          </span>
          <span data-s="font-size-0_78rem font-weight-700 color-text-muted">
            -> ${l.projectedNewCrs} CRS
          </span>
        </div>
      </div>
      <div data-s="font-size-0_82rem color-text-muted line-height-1_4">
        ${escapeHtml(l.impactSummary)}
      </div>
      <div data-s="font-size-0_75rem color-color-primary-2563eb font-weight-600 margin-top-0_2rem">
        Feasibility: ${escapeHtml(l.feasibility)}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div data-s="display-flex flex-direction-column gap-1_25rem">
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-10px padding-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-flex-start flex-wrap-wrap gap-0_75rem">
          <div>
            <div data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">
              Comprehensive Ranking System (CRS) estimate
            </div>
            <div data-s="font-size-1_8rem font-weight-800 color-color-primary-2563eb margin-top-0_25rem">
              ${data.totalCrsScore} <span data-s="font-size-1rem color-text-muted font-weight-400">/ 1,200 Points</span>
            </div>
          </div>
          <div data-s="font-size-0_82rem color-text-muted text-align-right">
            <div>Human Capital: <strong>${b.humanCapital.subtotal}</strong></div>
            <div>Spouse Factors: <strong>${b.spouseFactors.total}</strong></div>
            <div>Skill Transferability: <strong>${b.skillTransferability.total}</strong></div>
            <div>Additional Points: <strong>${b.additionalPoints.total}</strong></div>
          </div>
        </div>

        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-140 gap-0_5rem margin-top-1rem background-surface-sunken padding-0_75rem border-radius-8px border-1px-solid-border font-size-0_78rem">
          <div>Age: <strong>${b.humanCapital.agePoints} pts</strong></div>
          <div>Education: <strong>${b.humanCapital.educationPoints} pts</strong></div>
          <div>First Lang: <strong>${b.humanCapital.firstLanguagePoints} pts</strong></div>
          <div>Cdn Exp: <strong>${b.humanCapital.canadianExperiencePoints} pts</strong></div>
          <div>Transferability: <strong>${b.skillTransferability.total} pts</strong></div>
          <div>PNP / Study / French: <strong>${b.additionalPoints.total} pts</strong></div>
        </div>
      </div>

      <div>
        <div data-s="font-weight-700 font-size-0_95rem margin-bottom-0_75rem">Category-Based Selection Draw Forecast (Bill C-19 Priority Streams):</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-260 gap-0_75rem">
          ${categoriesHtml}
        </div>
      </div>

      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_6rem">Strategic Score Optimization Levers (Ranked by Return on Effort):</div>
        <div data-s="display-flex flex-direction-column gap-0_6rem">
          ${leversHtml}
        </div>
      </div>

      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderPnpAssessment(data, container) {
  if (!container) return;

  const isEnhanced = data.streamType === 'ENHANCED_EXPRESS_ENTRY';
  const badgeColor = isEnhanced ? '#16a34a' : '#2563eb';
  const badgeText = isEnhanced
    ? 'ENHANCED STREAM: +600 CRS BONUS APPLIED'
    : 'BASE PROVINCIAL STREAM (DIRECT PR PORTAL)';

  const bcBreakdown = data.bcScoreBreakdown;
  const funds = data.settlementFunds;

  const leversHtml = data.strategicLevers.map(lever => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem display-flex flex-direction-column gap-0_25rem">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <span data-s="font-weight-700 font-size-0_85rem color-text">${escapeHtml(lever.action)}</span>
        <span data-s="display-inline-block padding-0_15rem-0_5rem background-16a34a20 color-16a34a border-1px-solid-16a34a border-radius-4px font-size-0_75rem font-weight-700">
          ${escapeHtml(lever.pointsGain)}
        </span>
      </div>
      <div data-s="font-size-0_78rem color-text-muted">${escapeHtml(lever.impact)}</div>
    </div>
  `).join('');

  const blockersHtml = data.statutoryBlockers.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">Statutory Eligibility Blockers:</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.statutoryBlockers.map(b => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(b.statute)}</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(b.message)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <!-- Header -->
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_75rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(badgeText)}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Provincial Nominee Assessment (${escapeHtml(data.province)})</h4>
        </div>
        ${data.projectedPostNominationCrs ? `
          <div data-s="text-align-right">
            <div data-s="font-size-0_75rem color-text-muted font-weight-600">PROJECTED EXPRESS ENTRY CRS</div>
            <div data-s="font-size-1_35rem font-weight-800 color-16a34a">${data.projectedPostNominationCrs} <span data-s="font-size-0_85rem color-text-muted font-weight-400">(+600 Pts)</span></div>
          </div>
        ` : ''}
      </div>

      <!-- BC PNP Score Grid -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem margin-bottom-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem margin-bottom-0_75rem">
          <div data-s="font-weight-700 font-size-0_95rem">BC PNP Skills Immigration Score:</div>
          <div data-s="font-size-1_4rem font-weight-800 color-color-primary-2563eb">
            ${data.bcPnpScore} <span data-s="font-size-0_85rem color-text-muted font-weight-400">/ 200 Points</span>
          </div>
        </div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem font-size-0_8rem">
          <div data-s="background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
            <div data-s="font-weight-600 color-text-muted margin-bottom-0_25rem">HUMAN CAPITAL (${bcBreakdown.humanCapitalFactors.total} / 120 pts)</div>
            <div>Direct Experience: <strong>${bcBreakdown.humanCapitalFactors.directExperiencePoints} pts</strong></div>
            <div>Education: <strong>${bcBreakdown.humanCapitalFactors.highestEducationPoints} pts</strong></div>
            <div>Language: <strong>${bcBreakdown.humanCapitalFactors.languageProficiencyPoints} pts</strong></div>
          </div>
          <div data-s="background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
            <div data-s="font-weight-600 color-text-muted margin-bottom-0_25rem">ECONOMIC FACTORS (${bcBreakdown.economicFactors.total} / 80 pts)</div>
            <div>Hourly Wage: <strong>${bcBreakdown.economicFactors.hourlyWagePoints} pts</strong></div>
            <div>Area of Employment: <strong>${bcBreakdown.economicFactors.areaOfEmploymentPoints} pts</strong></div>
          </div>
        </div>
      </div>

      <!-- Targeted Tech Streams Comparison -->
      <div data-s="margin-bottom-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_6rem">Targeted Provincial Tech Pathway Diagnostic:</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-260 gap-0_75rem">
          <!-- BC Tech -->
          <div data-style="background:var(--bg-elevated);border:1px solid ${data.bcTechEligibility.qualifiesForBcTech ? '#16a34a' : 'var(--border)'};border-radius:8px;padding:0.85rem;">
            <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
              <span data-s="font-weight-700 font-size-0_85rem">BC TECH STREAM</span>
              <span data-style="font-size:0.75rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:4px;background:${data.bcTechEligibility.qualifiesForBcTech ? '#16a34a20' : '#ef444420'};color:${data.bcTechEligibility.qualifiesForBcTech ? '#16a34a' : '#ef4444'};">
                ${data.bcTechEligibility.qualifiesForBcTech ? 'PROFILE MATCH' : 'NO PROFILE MATCH'}
              </span>
            </div>
            <div data-s="font-size-0_78rem color-text-muted">${escapeHtml(data.bcTechEligibility.statutoryAdvisory)}</div>
            <div data-s="font-size-0_75rem margin-top-0_4rem color-text">Cut-off: <strong>~${data.bcTechEligibility.currentCutoff} pts</strong> (Your score: <strong>${data.bcPnpScore} pts</strong>)</div>
          </div>
          <!-- OINP Tech -->
          <div data-style="background:var(--bg-elevated);border:1px solid ${data.oinpTechEligibility.qualifiesForOinpTech ? '#16a34a' : 'var(--border)'};border-radius:8px;padding:0.85rem;">
            <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
              <span data-s="font-weight-700 font-size-0_85rem">OINP TECH DRAWS (ON)</span>
              <span data-style="font-size:0.75rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:4px;background:${data.oinpTechEligibility.qualifiesForOinpTech ? '#16a34a20' : '#ef444420'};color:${data.oinpTechEligibility.qualifiesForOinpTech ? '#16a34a' : '#ef4444'};">
                ${data.oinpTechEligibility.qualifiesForOinpTech ? 'TARGET MATCH' : 'NO FILTER MATCH'}
              </span>
            </div>
            <div data-s="font-size-0_78rem color-text-muted">${escapeHtml(data.oinpTechEligibility.statutoryAdvisory)}</div>
          </div>
          <!-- AAIP Tech -->
          <div data-style="background:var(--bg-elevated);border:1px solid ${data.aaipTechEligibility.qualifiesForAaipTech ? '#16a34a' : 'var(--border)'};border-radius:8px;padding:0.85rem;">
            <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
              <span data-s="font-weight-700 font-size-0_85rem">AAIP TECH PATHWAY (AB)</span>
              <span data-style="font-size:0.75rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:4px;background:${data.aaipTechEligibility.qualifiesForAaipTech ? '#16a34a20' : '#ef444420'};color:${data.aaipTechEligibility.qualifiesForAaipTech ? '#16a34a' : '#ef4444'};">
                ${data.aaipTechEligibility.qualifiesForAaipTech ? 'PROFILE MATCH' : 'NO PROFILE MATCH'}
              </span>
            </div>
            <div data-s="font-size-0_78rem color-text-muted">${escapeHtml(data.aaipTechEligibility.statutoryAdvisory)}</div>
          </div>
        </div>
      </div>

      <!-- Settlement Funds Audit -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
          <div data-s="font-weight-600 font-size-0_85rem">SETTLEMENT FUNDS CHECK (IRPR s. 87(2)):</div>
          <span data-style="font-size:0.75rem;font-weight:700;color:${funds.meetsRequirement ? '#16a34a' : '#ef4444'};">
            ${funds.isExempt ? 'EXEMPT (JOB OFFER AUTHORIZED)' : funds.meetsRequirement ? 'FUNDS SUFFICIENT' : 'SHORTFALL: $' + funds.shortfallCad.toLocaleString() + ' CAD'}
          </span>
        </div>
        <div data-s="font-size-0_8rem color-text-muted">${escapeHtml(funds.statutoryBasis)}</div>
        <div data-s="font-size-0_75rem margin-top-0_35rem color-text">Required: $${funds.requiredFundsCad.toLocaleString()} CAD | Declared Liquid Savings: $${funds.providedFundsCad.toLocaleString()} CAD</div>
      </div>

      <!-- Strategic Levers -->
      <div data-s="margin-bottom-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_6rem">Strategic Score Optimization Levers:</div>
        <div data-s="display-flex flex-direction-column gap-0_5rem">
          ${leversHtml}
        </div>
      </div>

      ${blockersHtml}

      <!-- Statutory Advisories -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderBowpAssessment(data, container) {
  if (!container) return;

  const isEligible = data.isEligibleForBowp;
  const isRestrictedPnp = data.resolutionVerdict === 'RESTRICTED_PNP_REQUIRES_CODE_T13';
  const isNoAor = data.resolutionVerdict === 'AWAITING_OFFICIAL_AOR';
  const isExpired = data.isExpired;

  const badgeColor = isEligible ? '#16a34a' : isRestrictedPnp || isNoAor ? '#f59e0b' : '#ef4444';
  const badgeText = isEligible
    ? 'ELIGIBLE FOR BRIDGING OPEN WORK PERMIT (CODE A75)'
    : isRestrictedPnp
      ? 'RESTRICTED PNP NOMINATION: REQUIRES EMPLOYER-SPECIFIC PERMIT (CODE T13)'
      : isNoAor
        ? 'PREMATURE SUBMISSION: MUST WAIT FOR OFFICIAL IRCC AOR'
        : isExpired
          ? 'PERMIT EXPIRED: RESTORATION OF STATUS MANDATORY'
          : 'INELIGIBLE FOR BOWP';

  const sowp = data.spousalOpenWorkPermit;
  const maintained = data.maintainedStatus;

  const checklistHtml = data.applicationChecklist.map(step => `
    <li data-s="margin-bottom-0_35rem">${escapeHtml(step)}</li>
  `).join('');

  const blockersHtml = data.statutoryBlockers.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">Statutory Eligibility Blockers:</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.statutoryBlockers.map(b => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(b.statute)}</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(b.message)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const warningsHtml = data.statutoryWarnings.length ? `
    <div data-s="margin-top-0_75rem background-rgba-245-158-11-0_1 border-1px-solid-f59e0b border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-f59e0b font-size-0_85rem margin-bottom-0_4rem">Filing Window Advisories:</div>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text display-flex flex-direction-column gap-0_25rem">
        ${data.statutoryWarnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <!-- Header -->
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_75rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(badgeText)}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">BOWP &amp; Maintained Status Assessment</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">PERMIT RUNWAY</div>
          <div data-style="font-size:1.35rem;font-weight:800;color:${data.daysUntilExpiry <= 30 ? '#ef4444' : '#16a34a'};">
            ${data.daysUntilExpiry >= 0 ? data.daysUntilExpiry + ' Days Left' : Math.abs(data.daysUntilExpiry) + ' Days Expired'}
          </div>
        </div>
      </div>

      <!-- Maintained Status & Flight Warning -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem margin-bottom-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
          <div data-s="font-weight-700 font-size-0_9rem">MAINTAINED STATUS WORK RIGHTS (${escapeHtml(maintained.statutoryAuthority)}):</div>
          <span data-style="font-size:0.75rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:4px;background:${maintained.hasMaintainedStatusRight ? '#16a34a20' : '#ef444420'};color:${maintained.hasMaintainedStatusRight ? '#16a34a' : '#ef4444'};">
            ${maintained.hasMaintainedStatusRight ? 'WORK AUTHORIZED' : 'WORK PROHIBITED'}
          </span>
        </div>
        <div data-s="font-size-0_82rem color-text-muted margin-bottom-0_5rem">${escapeHtml(maintained.conditionsPreserved)}</div>
        <div data-s="font-size-0_8rem background-rgba-239-68-68-0_08 border-1px-solid-ef4444 border-radius-6px padding-0_6rem color-ef4444 font-weight-600">
          ${escapeHtml(maintained.travelAdvisory)}
        </div>
      </div>

      <!-- Spousal Open Work Permit (SOWP) -->
      ${sowp.isApplicable ? `
        <div data-style="background:var(--bg-elevated);border:1px solid ${sowp.eligible ? '#16a34a' : 'var(--border)'};border-radius:8px;padding:1rem;margin-bottom:1rem;">
          <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_35rem">
            <div data-s="font-weight-700 font-size-0_9rem">SPOUSAL OPEN WORK PERMIT (SOWP ${sowp.exemptionCode ? 'CODE ' + sowp.exemptionCode : ''}):</div>
            <span data-style="font-size:0.75rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:4px;background:${sowp.eligible ? '#16a34a20' : '#ef444420'};color:${sowp.eligible ? '#16a34a' : '#ef4444'};">
              ${sowp.eligible ? 'SPOUSE QUALIFIES' : 'SPOUSE INELIGIBLE'}
            </span>
          </div>
          <div data-s="font-size-0_82rem color-text-muted">${escapeHtml(sowp.advisory)}</div>
          <div data-s="display-flex gap-1rem flex-wrap-wrap font-size-0_75rem margin-top-0_5rem color-text">
            <span>High-Skilled TEER: <strong>${sowp.meetsHighSkilledCriteria ? 'Yes (TEER 0-3)' : 'No'}</strong></span>
            <span>3+ Canadian Pay Stubs: <strong>${sowp.meetsPayStubsRequirement ? 'Yes' : 'No'}</strong></span>
            <span>6+ Months Validity: <strong>${sowp.meetsDurationRequirement ? 'Yes' : 'No'}</strong></span>
          </div>
        </div>
      ` : ''}

      <!-- Alternative Permit Recommendation (e.g. Code T13 for Restricted PNP) -->
      ${data.alternativePermitRecommendation ? `
        <div data-s="background-rgba-245-158-11-0_08 border-1px-solid-f59e0b border-radius-8px padding-1rem margin-bottom-1rem">
          <div data-s="font-weight-700 color-f59e0b font-size-0_9rem margin-bottom-0_35rem">
            ALTERNATIVE LMIA-EXEMPT WORK PERMIT: CODE ${escapeHtml(data.alternativePermitRecommendation.exemptionCode)} (${escapeHtml(data.alternativePermitRecommendation.statutoryAuthority)})
          </div>
          <div data-s="font-size-0_82rem color-text">${escapeHtml(data.alternativePermitRecommendation.advisory)}</div>
        </div>
      ` : ''}

      ${blockersHtml}
      ${warningsHtml}

      <!-- Filing Roadmap & Required IMM Forms -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem margin-top-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_5rem">
          <div data-s="font-weight-700 font-size-0_9rem">APPLICATION ROADMAP &amp; FORMS (IMM 5710):</div>
          <span data-s="font-size-0_8rem font-weight-700 color-text">Total Fee: $${data.totalFeeCad} CAD ($${data.feeBreakdown.WORK_PERMIT_PROCESSING_FEE} + $${data.feeBreakdown.OPEN_WORK_PERMIT_HOLDER_FEE})</span>
        </div>
        <ol data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${checklistHtml}
        </ol>
      </div>

      <!-- Statutory Advisories -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderPgwpAssessment(data, container) {
  if (!data || !container) return;
  const { eligibleForPgwp, estimatedPgwpDurationMonths, fieldOfStudyAudit, languageAudit, timingAudit, interimWorkRights, checklist, rejectionRisks, recommendations } = data;

  const isEligible = Boolean(eligibleForPgwp);
  const badgeClass = isEligible ? 'success' : 'danger';
  const badgeText = isEligible ? 'ELIGIBLE UNDER MODERNIZED RULES' : 'DISQUALIFIER OR ACTION REQUIRED';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <span class="muted">180-Day Window: ${timingAudit?.daysRemainingToApply ?? 180} days remaining</span>
      </div>
      <h4 class="u-mt-50">${isEligible ? `Eligible for Estimated ${estimatedPgwpDurationMonths}-Month PGWP` : 'PGWP Compliance Deficiencies Detected'}</h4>
      <p class="u-text-sm">${fieldOfStudyAudit?.exemptionReason ?? (fieldOfStudyAudit?.fieldOfStudyMet ? 'Field of study qualifies under national shortage list.' : 'Field of study does not meet shortage requirements.')}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Estimated PGWP</span>
        <span class="metric-value">${estimatedPgwpDurationMonths} Mo</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Language Benchmark</span>
        <span class="metric-value">CLB ${languageAudit?.attainedClb ?? 0} / Req ${languageAudit?.requiredClb ?? 5}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">180-Day Deadline</span>
        <span class="metric-value">${timingAudit?.deadlineStatus === 'within_window' ? 'Active Window' : timingAudit?.deadlineStatus}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Interim Work Rights</span>
        <span class="metric-value">${interimWorkRights?.authorizedToWorkFullTimeImmediately ? 'Authorized s.186(w)' : 'No Interim Work'}</span>
      </div>
    </div>
  `;

  if (rejectionRisks && rejectionRisks.length > 0) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>⚠️ Critical Risks & Disqualifiers</h5>
        <ul>${rejectionRisks.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (checklist && checklist.length > 0) {
    html += `
      <div class="checklist-card u-mt-100">
        <h5>📋 8-Point Compliance Audit</h5>
        <div class="u-grid-200 u-mt-50">
          ${checklist.map(c => `
            <div class="check-item ${c.status}">
              <strong>${c.status === 'pass' ? '✓' : c.status === 'warning' ? '⚠️' : '✗'} ${c.item}</strong>
              <p class="muted u-text-xs">${c.detail}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (recommendations && recommendations.length > 0) {
    html += `
      <div class="alert-box info u-mt-100">
        <h5>💡 Recommended Action Steps</h5>
        <ul>${recommendations.map(rc => `<li>${rc}</li>`).join('')}</ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderSowpAssessment(data, container) {
  if (!data || !container) return;
  const { overallEligible, summaryStatus, reasons, statutoryBasis, documentChecklist, strategicAdvice } = data;

  const badgeClass = overallEligible ? 'success' : 'danger';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${overallEligible ? 'ELIGIBLE FOR SOWP' : 'INELIGIBLE UNDER CURRENT RULES'}</span>
        <span class="muted">${statutoryBasis ?? ''}</span>
      </div>
      <h4 class="u-mt-50">${summaryStatus}</h4>
      <p class="u-text-sm">${overallEligible ? 'Applicant meets modernized IRCC criteria for an Open Work Permit.' : 'Applicant does not satisfy current eligibility policy requirements.'}</p>
    </div>
  `;

  if (reasons?.length) {
    html += `
      <div class="alert-box ${overallEligible ? 'success' : 'danger'} u-mt-100">
        <h5>Key Eligibility Determinations</h5>
        <ul>
          ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (documentChecklist?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Required Application Documentation</h5>
        <div class="u-grid-200 u-mt-50">
          ${documentChecklist.map(d => `
            <div class="check-item pass">
              <strong>✓ ${d}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (strategicAdvice?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Strategic Pathways &amp; Alternatives</h5>
        <ul>
          ${strategicAdvice.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderCriminalRehabAssessment(data, container) {
  if (!data || !container) return;
  const { offenseAudit, deemedRehabilitation, individualRehabilitation, temporaryResidentPermit, statutoryNotes, riskWarnings, documentChecklist } = data;

  const isDeemed = deemedRehabilitation?.isDeemedRehabilitated;
  const isIndividualEligible = individualRehabilitation?.isEligibleToApply;
  const badgeClass = isDeemed ? 'success' : (isIndividualEligible ? 'warning' : 'danger');

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${isDeemed ? 'DEEMED REHABILITATED' : (isIndividualEligible ? 'ELIGIBLE FOR INDIVIDUAL REHAB (IMM 1444)' : 'REHABILITATION INELIGIBLE / TRP REQUIRED')}</span>
        <span class="muted">${offenseAudit?.canadianStatuteRef ?? ''}</span>
      </div>
      <h4 class="u-mt-50">Canadian Equivalency: ${offenseAudit?.offenseName ?? ''}</h4>
      <p class="u-text-sm">Severity: <strong>${offenseAudit?.severityClass === 'serious_criminality_s36_1' ? 'Serious Criminality (IRPA s. 36(1))' : 'Criminality (IRPA s. 36(2))'}</strong> | Max Canadian Penalty: ${offenseAudit?.maxPenaltyYears} Years</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Deemed Rehab</span>
        <span class="metric-value">${isDeemed ? 'Eligible' : 'Not Eligible'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Individual Rehab</span>
        <span class="metric-value">${isIndividualEligible ? 'Eligible to Apply' : 'Time Barred'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">IMM 1444 Fee</span>
        <span class="metric-value">$${individualRehabilitation?.governmentProcessingFeeCad ?? 0} CAD</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">TRP Remedy</span>
        <span class="metric-value">${temporaryResidentPermit?.recommended ? 'Recommended' : 'Optional'}</span>
      </div>
    </div>
  `;

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>Statutory Warnings &amp; Bill C-46 Disqualifications</h5>
        <ul>
          ${riskWarnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (documentChecklist?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Rehabilitation Application Checklist (IMM 1444)</h5>
        <div class="u-grid-200 u-mt-50">
          ${documentChecklist.map(d => `
            <div class="check-item pass">
              <strong>✓ ${d}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (statutoryNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Authorities</h5>
        <ul>
          ${statutoryNotes.map(n => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 53. EI DISQUALIFICATION & ALLOCATION ENGINE
// ==========================================

export function renderRuralRenewalAssessment(data, container) {
  const {
    applicantName,
    streamType,
    designatedCommunity,
    overallEligible,
    summaryTitle,
    compliancePoints,
    deficiencies,
    roadmapSteps,
    statutoryBasis
  } = data;

  const statusClass = overallEligible ? 'success' : 'warning';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Candidate:</strong> ${escapeHtml(applicantName)} | <strong>Stream:</strong> ${streamType === 'rural_renewal' ? 'Rural Renewal' : 'Rural Entrepreneur'} | <strong>Community:</strong> ${escapeHtml(designatedCommunity?.name || 'Designated Community')}</p>
      <p class="u-text-sm muted">${statutoryBasis}</p>
    </div>

    <div class="info-card u-mt-100">
      <h5>Designated Community Profile</h5>
      <p><strong>${designatedCommunity?.name}</strong> (${designatedCommunity?.region || 'Alberta'})</p>
      <p class="u-text-sm">Economic Development Focus: ${designatedCommunity?.economicFocus || 'Regional workforce and settlement'}</p>
    </div>
  `;

  if (compliancePoints?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Satisfied Criteria</h5>
        <div class="u-grid-200 u-mt-50">
          ${compliancePoints.map(c => `
            <div class="check-item pass">
              <strong>✓ ${c}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (deficiencies?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Shortfalls &amp; Action Required</h5>
        <ul>${deficiencies.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (roadmapSteps?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Permanent Residency Roadmap</h5>
        <ol>${roadmapSteps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 55. SPECULATION TAX & NRST REBATE ENGINE
// ==========================================

export function renderExcessiveDemandAssessment(data, container) {
  const {
    applicantName,
    diagnosedCondition,
    immigrationStream,
    admissibilityStatus,
    summaryTitle,
    costAssessment,
    pflAudit,
    mitigationViability,
    statutoryNotes,
    riskWarnings,
    requiredDocuments
  } = data;

  const statusClass = (admissibilityStatus === 'statutorily_exempt' || admissibilityStatus === 'admissible_with_mitigation' || admissibilityStatus === 'admissible_unmitigated') ? 'success' : 'error';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Applicant:</strong> ${escapeHtml(applicantName)} | <strong>Condition:</strong> ${escapeHtml(diagnosedCondition)} | <strong>Stream:</strong> ${escapeHtml(immigrationStream)}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${costAssessment?.netAnnualPublicCostCad?.toLocaleString()} CAD/yr</span>
        <span class="stat-lbl">Net Public Health Liability</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${costAssessment?.annualStatutoryThresholdCad?.toLocaleString()} CAD/yr</span>
        <span class="stat-lbl">2026 Excessive Demand Threshold</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${pflAudit?.hasReceivedPfl ? `${pflAudit.daysRemainingToRespond} Days` : 'No PFL'}</span>
        <span class="stat-lbl">PFL Response Runway</span>
      </div>
    </div>

    <div class="info-card u-mt-100">
      <h5>Mitigation Viability Analysis (Sapru / Hilewitz)</h5>
      <p><strong>Outpatient Drug Mitigation:</strong> ${mitigationViability?.outpatientMedicationViable ? 'Viable with Private Drug Plan' : 'Unmitigated'}</p>
      <p><strong>Inpatient Hospital Costs:</strong> ${mitigationViability?.hospitalCareMitigable ? 'Mitigable' : 'Precluded from private offset under Colaco 2007 FCA 282'}</p>
    </div>
  `;

  if (requiredDocuments?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Required Mitigation Dossier &amp; Evidence</h5>
        <div class="u-grid-200 u-mt-50">
          ${requiredDocuments.map(d => `
            <div class="check-item pass">
              <strong>✓ ${d}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Statutory Warnings</h5>
        <ul>${riskWarnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (statutoryNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Governing Authorities</h5>
        <ul>${statutoryNotes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 58. FRANCOPHONE MOBILITY PROGRAM (C16)
// ==========================================

export function renderFrancophoneMobilityAssessment(data, container) {
  const {
    applicantName,
    employerName,
    province,
    lmiaExemptionCode,
    overallEligible,
    summaryTitle,
    languageAudit,
    jobAudit,
    compliancePoints,
    deficiencies,
    riskWarnings,
    requiredSteps,
    statutoryNotes
  } = data;

  const statusClass = overallEligible ? 'success' : 'error';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Worker:</strong> ${escapeHtml(applicantName)} | <strong>Employer:</strong> ${escapeHtml(employerName)} | <strong>Destination:</strong> ${escapeHtml(province)} | <strong>Exemption Code:</strong> ${escapeHtml(lmiaExemptionCode)}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">NCLC ${languageAudit?.speakingScoreNclc || 0} / ${languageAudit?.listeningScoreNclc || 0}</span>
        <span class="stat-lbl">French Speaking / Listening (${languageAudit?.meetsOralThreshold ? 'Meets NCLC 5+' : 'Shortfall'})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">TEER ${jobAudit?.nocTeer ?? 1}</span>
        <span class="stat-lbl">NOC ${jobAudit?.nocCode || '21232'} (${jobAudit?.isPrimaryAgriculture ? 'Agriculture Excluded' : 'Eligible TEER'})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${jobAudit?.employerComplianceFeeCad || 230} CAD</span>
        <span class="stat-lbl">Employer Portal Compliance Fee</span>
      </div>
    </div>
  `;

  if (compliancePoints?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Satisfied Criteria</h5>
        <div class="u-grid-200 u-mt-50">
          ${compliancePoints.map(c => `
            <div class="check-item pass">
              <strong>✓ ${c}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (deficiencies?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Ineligibility Grounds &amp; Actions Required</h5>
        <ul>${deficiencies.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Program Warnings</h5>
        <ul>${riskWarnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (requiredSteps?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Application Roadmap</h5>
        <ol>${requiredSteps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    `;
  }

  if (statutoryNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Governing Authorities</h5>
        <ul>${statutoryNotes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 59. DIGITAL PLATFORM WORKER RIGHTS (DPWRA)
// ==========================================

export function renderAtlanticImmigrationAssessment(data, container) {
  const {
    candidateName,
    province,
    stream,
    nocTeer,
    overallEligible,
    summaryTitle,
    jobOfferAudit,
    languageAudit,
    settlementFundsAudit,
    compliancePoints,
    deficiencies,
    requiredSteps,
    statutoryNotes
  } = data;

  const statusClass = overallEligible ? 'success' : 'error';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Candidate:</strong> ${escapeHtml(candidateName)} | <strong>Province:</strong> ${escapeHtml(province)} | <strong>Stream:</strong> ${escapeHtml(stream.replace('_', ' '))} | <strong>TEER:</strong> ${escapeHtml(nocTeer)}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">CLB ${languageAudit?.candidateClb || 0}</span>
        <span class="stat-lbl">Language Score (Min: CLB ${languageAudit?.requiredClb})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${settlementFundsAudit?.isStatutorilyExempt ? 'Exempt' : `${settlementFundsAudit?.fundsAvailableCad?.toLocaleString()} CAD`}</span>
        <span class="stat-lbl">Settlement Funds (${settlementFundsAudit?.isStatutorilyExempt ? 'Working in Canada' : `Req: ${settlementFundsAudit?.requiredLicoCad?.toLocaleString()} CAD`})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${jobOfferAudit?.isDesignatedEmployer ? 'Designated' : 'Not Designated'}</span>
        <span class="stat-lbl">Atlantic Employer Status</span>
      </div>
    </div>
  `;

  if (compliancePoints?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Satisfied Criteria</h5>
        <div class="u-grid-200 u-mt-50">
          ${compliancePoints.map(c => `
            <div class="check-item pass">
              <strong>✓ ${c}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (deficiencies?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Ineligibility Grounds</h5>
        <ul>${deficiencies.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (requiredSteps?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Permanent Residency &amp; C18 Work Permit Roadmap</h5>
        <ol>${requiredSteps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    `;
  }

  if (statutoryNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Governing Authorities</h5>
        <ul>${statutoryNotes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 61. CHILD CARE SUBSIDY & CWELCC NAVIGATOR
// ==========================================

