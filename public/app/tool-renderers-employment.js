import { $, el, escapeHtml } from './core.js';
import { VERDICT_TEXT } from './data.js';

export function renderWorkerClassificationAssessment(data, container) {
  const isMisclassified = data.isMisclassifiedEmployee;
  const isContractor = data.classificationVerdict === 'LEGITIMATE_INDEPENDENT_CONTRACTOR';
  let statusBadge = '';
  let statusColor = '#dc2626';

  if (isMisclassified) {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ UNLAWFUL EMPLOYEE MISCLASSIFICATION</span>';
    statusColor = '#dc2626';
  } else if (isContractor) {
    statusBadge = '<span data-s="background-rgba-2-132-199-0_15 color-0284c7 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">ℹ️ LEGITIMATE CONTRACTOR</span>';
    statusColor = '#0284c7';
  } else {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ PROPERLY CLASSIFIED EMPLOYEE</span>';
    statusColor = '#10b981';
  }

  const wage = data.wageTheftAudit;
  const hours = data.hoursSummary;
  const factors = data.commonLawFactors;

  let factorsListHtml = '';
  if (factors.employeeIndicators.length > 0) {
    factorsListHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_06 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">⚖️ COMMON LAW EMPLOYEE STATUS PROOFS (${factors.employeeIndicators.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem display-flex flex-direction-column gap-0_3rem">
          ${factors.employeeIndicators.map(ind => `<li>${escapeHtml(ind)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">${escapeHtml(data.province)} EMPLOYMENT STANDARDS CHECK</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(VERDICT_TEXT[data.classificationVerdict] || data.classificationVerdict.replace(/_/g, ' '))}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">UNPAID OVERTIME ARREARS</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${wage.unpaidOvertimeCad > 0 ? '#dc2626' : 'var(--text)'};">
            $${wage.unpaidOvertimeCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            ${hours.overtimeHoursPerWeek} hrs/wk over ${hours.statutoryOvertimeThreshold}h threshold (1.5x)
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">UNPAID 4% VACATION PAY</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${wage.unpaidVacationPayCad > 0 ? '#dc2626' : 'var(--text)'};">
            $${wage.unpaidVacationPayCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Mandatory 4% on gross earnings ($${wage.grossPayActuallyReceivedCad.toLocaleString()})
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">TOTAL DIRECT WAGE THEFT</div>
          <div data-style="font-size:1.15rem;font-weight:700;margin-top:0.25rem;color:${wage.totalDirectWageTheftCad > 0 ? '#dc2626' : '#10b981'};">
            $${wage.totalDirectWageTheftCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Overtime + Vacation + Public Holiday Pay
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">EMPLOYER TAX LIABILITY (CPP/EI)</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem color-f59e0b">
            $${(wage.employerCppLiabilityCad + wage.employerEiLiabilityCad).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            CPP ($${wage.employerCppLiabilityCad.toLocaleString()}) + EI ($${wage.employerEiLiabilityCad.toLocaleString()}) owed to CRA
          </div>
        </div>
      </div>

      ${factorsListHtml}

      <div data-s="margin-top-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_5rem">
          <label data-s="font-weight-600 font-size-0_88rem">FORMAL WAGE ARREARS DEMAND LETTER (TO EMPLOYER / MOL CLAIM):</label>
          <button type="button" class="btn-subtle" id="wc-copy-letter-btn" data-s="padding-0_25rem-0_6rem font-size-0_8rem">📋 Copy Demand Letter</button>
        </div>
        <textarea id="wc-demand-letter-text" readonly rows="8" data-s="width-100pc font-family-monospace font-size-0_82rem padding-0_6rem border-radius-6px border-1px-solid-border background-bg-card">${escapeHtml(data.officialDemandLetter)}</textarea>
      </div>

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">YOUR RIGHTS, AND PROTECTION FROM RETALIATION:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const copyBtn = $('#wc-copy-letter-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const letterText = $('#wc-demand-letter-text')?.value;
      if (letterText && navigator.clipboard) {
        navigator.clipboard.writeText(letterText).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Demand Letter'; }, 2000);
        }).catch(() => {});
      }
    });
  }
}

export function renderVulnerableWorkerAssessment(data, container) {
  const isEligible = data.isVwowpEligible;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (isEligible) {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ Likely eligible for a VWOWP</span>';
    statusColor = '#10b981';
  } else if (data.eligibilityVerdict === 'CLOSED_PERMIT_NO_ABUSE_IDENTIFIED') {
    statusBadge = '<span data-s="background-rgba-245-158-11-0_15 color-f59e0b padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ CLOSED PERMIT — EVIDENCE REQUIRED</span>';
    statusColor = '#f59e0b';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✗ INELIGIBLE PERMIT TYPE</span>';
    statusColor = '#dc2626';
  }

  let violationsHtml = '';
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    violationsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 STATUTORY EMPLOYER VIOLATIONS IDENTIFIED (${data.statutoryViolations.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryViolations.map(v => `
            <li>
              <strong data-s="color-dc2626">[${escapeHtml(v.severity)}] ${escapeHtml(v.ground)}</strong><br>
              <span class="muted" data-s="font-size-0_78rem">Statute: ${escapeHtml(v.statute)}</span><br>
              <span data-s="font-size-0_8rem color-text">${escapeHtml(v.legalFinding)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let remediesHtml = '';
  if (data.immediateRemedies && data.immediateRemedies.length > 0) {
    remediesHtml = `
      <div data-s="margin-top-1rem background-rgba-2-132-199-0_08 border-1px-solid-rgba-2-132-199-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-0284c7 font-size-0_92rem">⚖️ Steps to recover what you are owed</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text display-flex flex-direction-column gap-0_25rem">
          ${data.immediateRemedies.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let roadmapHtml = '';
  if (data.vwowpRoadmap && data.vwowpRoadmap.length > 0) {
    roadmapHtml = `
      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">14-DAY EXPEDITED VWOWP APPLICATION ROADMAP (IRPR s. 207.1):</div>
        <ol data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text display-flex flex-direction-column gap-0_4rem">
          ${data.vwowpRoadmap.map(s => `
            <li>
              <strong>${escapeHtml(s.title)}</strong><br>
              <span class="muted" data-s="font-size-0_8rem">${escapeHtml(s.action)}</span>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">IRPR SECTION 207.1 VULNERABLE WORKER VERDICT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">RECRUITMENT FEES &amp; WAGE THEFT</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${data.totalFinancialLossCad > 0 ? '#dc2626' : 'var(--text)'};">
            $${data.totalFinancialLossCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Fees: $${data.recruitmentFeesPaidCad.toLocaleString()} | Wages: $${data.unpaidWagesOrKickbacksCad.toLocaleString()}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">EVIDENCE STRENGTH FOR IRCC</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem color-0284c7">
            ${data.evidenceAudit.evidenceConfidence} (${data.evidenceAudit.evidenceScore} pts)
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Criminal Code s. 184 Audio Valid
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">TARGET PROCESSING RUNWAY</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            14 Business Days
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Fee: $0 (Code A50 Exempt)
          </div>
        </div>
      </div>

      ${violationsHtml}
      ${remediesHtml}
      ${roadmapHtml}

      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">PROTECTIONS IF YOU REPORT YOUR EMPLOYER:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderParentalLeaveAssessment(data, container) {
  if (!container) return;

  const isFull = data.resolutionVerdict === 'FULLY_PROTECTED_AND_FUNDED';
  const isJobOnly = data.resolutionVerdict === 'JOB_PROTECTED_UNFUNDED_LEAVE';
  const isEiOnly = data.resolutionVerdict === 'EI_FUNDED_UNPROTECTED_JOB_RISK';

  const badgeColor = isFull ? '#16a34a' : isJobOnly ? '#f59e0b' : '#ef4444';
  const badgeText = isFull
    ? 'FULLY PROTECTED & EI FUNDED'
    : isJobOnly
      ? 'JOB PROTECTED (UNFUNDED - HOURS SHORTFALL)'
      : isEiOnly
        ? 'EI CASH APPROVED (UNPROTECTED JOB TENURE RISK)'
        : 'INELIGIBLE FOR EI & JOB PROTECTION';

  // Option comparison side-by-side
  const std = data.comparisonBetweenOptions.standard;
  const ext = data.comparisonBetweenOptions.extended;

  const violationsHtml = data.statutoryViolations.length ? `
    <div data-s="margin-top-1_25rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-1rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_9rem margin-bottom-0_5rem">Possible problems found:</div>
      <div data-s="display-flex flex-direction-column gap-0_5rem">
        ${data.statutoryViolations.map(v => `
          <div data-s="font-size-0_83rem background-bg-card padding-0_6rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-700 color-ef4444">${escapeHtml(v.rule)} (${escapeHtml(v.statute)})</div>
            <div data-s="color-text-muted margin-top-0_2rem">${escapeHtml(v.legalFinding)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const permitRiskHtml = data.workPermitVulnerabilities.length ? `
    <div data-s="margin-top-1_25rem background-rgba-245-158-11-0_12 border-1px-solid-f59e0b border-radius-8px padding-1rem">
      <div data-s="font-weight-700 color-d97706 font-size-0_9rem margin-bottom-0_35rem">⚠️ Temporary Resident Permit Expiry Warning:</div>
      ${data.workPermitVulnerabilities.map(p => `
        <div data-s="font-size-0_83rem color-text-muted">
          <strong>${escapeHtml(p.risk)}:</strong> ${escapeHtml(p.actionRequired)}
        </div>
      `).join('')}
    </div>
  ` : '';

  const actionsHtml = data.actionChecklist.map(a => `
    <div data-s="display-flex align-items-flex-start gap-0_75rem background-bg-card border-1px-solid-border border-radius-6px padding-0_6rem-0_8rem">
      <div data-s="font-weight-800 color-color-primary-2563eb font-size-0_9rem">${a.stepNumber}.</div>
      <div data-s="flex-1">
        <div data-s="font-weight-600 font-size-0_85rem">${escapeHtml(a.action)}</div>
        <div data-s="font-size-0_75rem color-text-muted margin-top-0_15rem">
          Agency: <strong>${escapeHtml(a.agency)}</strong> | Timing: ${escapeHtml(a.timing)}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div data-s="display-flex flex-direction-column gap-1_25rem">
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-10px padding-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-flex-start flex-wrap-wrap gap-0_75rem">
          <div>
            <div data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">
              Jurisdiction: ${escapeHtml(data.province)} · ${escapeHtml(data.immigrationStatus.replace(/_/g, ' '))}
            </div>
            <div data-style="font-size:1.2rem;font-weight:800;color:${badgeColor};margin-top:0.25rem;">
              ${badgeText}
            </div>
            <div data-s="font-size-0_85rem color-text-muted margin-top-0_25rem">
              Governing Statute: ${escapeHtml(data.provincialStatute)}
            </div>
          </div>
          <div data-s="text-align-right">
            <div data-s="font-size-1_4rem font-weight-800 color-text">
              ${data.totalProjectedCashPayoutCad.toLocaleString()} CAD
            </div>
            <div data-s="font-size-0_8rem color-text-muted">
              Estimated Total Cash Payout
            </div>
          </div>
        </div>

        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-8px border-1px-solid-border">
          <div>
            <div data-s="font-size-0_75rem color-text-muted">Weekly EI Rate</div>
            <div data-s="font-size-1_1rem font-weight-700">${data.weeklyBenefitCad.toLocaleString()} / wk</div>
          </div>
          <div>
            <div data-s="font-size-0_75rem color-text-muted">Leave Duration</div>
            <div data-s="font-size-1_1rem font-weight-700">${data.totalBenefitDurationWeeks} Weeks Total</div>
          </div>
          <div>
            <div data-s="font-size-0_75rem color-text-muted">Insurable Hours (52 Wks)</div>
            <div data-style="font-size:1.1rem;font-weight:700;${data.hoursShortfall > 0 ? 'color:#ef4444;' : ''}">
              ${data.hoursWorkedPast52Weeks} / 600 hrs
            </div>
          </div>
          <div>
            <div data-s="font-size-0_75rem color-text-muted">Tenure with Employer</div>
            <div data-style="font-size:1.1rem;font-weight:700;${data.serviceWeeksShortfall > 0 ? 'color:#ef4444;' : ''}">
              ${data.serviceWeeksWithEmployer} Weeks
            </div>
          </div>
        </div>
      </div>

      ${violationsHtml}
      ${permitRiskHtml}

      <div>
        <div data-s="font-weight-700 font-size-0_95rem margin-bottom-0_75rem">Standard vs Extended Parental Election (Irrevocable):</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-270 gap-1rem">
          <div data-style="border:2px solid ${data.selectedOption === 'standard' ? 'var(--color-primary, #2563eb)' : 'var(--border)'};border-radius:8px;padding:1rem;background:var(--bg-card);">
            <div data-s="font-weight-700 font-size-0_95rem display-flex justify-content-space-between">
              <span>${escapeHtml(std.option)}</span>
              <span data-s="font-size-0_75rem background-rgba-37-99-235-0_15 color-2563eb padding-0_15rem-0_4rem border-radius-4px">55% RATE</span>
            </div>
            <div data-s="font-size-1_25rem font-weight-800 margin-0_4rem-0">${std.weeklyCad.toLocaleString()} / wk</div>
            <div data-s="font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_25rem">
              <div>Duration: <strong>${std.totalLeaveDurationWeeks} weeks</strong> (up to ${std.parentalWeeks}w parental)</div>
              <div>Total Cash Payout: <strong>${std.totalCombinedPayoutCad.toLocaleString()} CAD</strong></div>
              <div data-s="margin-top-0_35rem font-size-0_78rem">${escapeHtml(std.notes)}</div>
            </div>
          </div>

          <div data-style="border:2px solid ${data.selectedOption === 'extended' ? 'var(--color-primary, #2563eb)' : 'var(--border)'};border-radius:8px;padding:1rem;background:var(--bg-card);">
            <div data-s="font-weight-700 font-size-0_95rem display-flex justify-content-space-between">
              <span>${escapeHtml(ext.option)}</span>
              <span data-s="font-size-0_75rem background-rgba-147-51-234-0_15 color-9333ea padding-0_15rem-0_4rem border-radius-4px">33% RATE</span>
            </div>
            <div data-s="font-size-1_25rem font-weight-800 margin-0_4rem-0">${ext.weeklyCad.toLocaleString()} / wk</div>
            <div data-s="font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_25rem">
              <div>Duration: <strong>${ext.totalLeaveDurationWeeks} weeks</strong> (up to ${ext.parentalWeeks}w parental)</div>
              <div>Total Cash Payout: <strong>${ext.totalCombinedPayoutCad.toLocaleString()} CAD</strong></div>
              <div data-s="margin-top-0_35rem font-size-0_78rem">${escapeHtml(ext.notes)}</div>
            </div>
          </div>
        </div>
      </div>

      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_6rem">Checklist and timeline:</div>
        <div data-s="display-flex flex-direction-column gap-0_5rem">
          ${actionsHtml}
        </div>
      </div>

      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW ABOUT PARENTAL LEAVE:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderStatutoryPayAssessment(data, container) {
  if (!data || !container) return;

  const hours = data.hoursAudit || {};
  const vac = data.vacationPayAudit || {};
  const hol = data.publicHolidayAudit || {};
  const ded = data.deductionsAudit || {};
  const claim = data.wageClaimSummary || {};
  const steps = data.actionPlan || [];
  const warnings = data.warnings || [];

  const claimBadge = claim.hasViableWageClaim ?
    `<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">POTENTIAL WAGE UNDERPAYMENT: $${(claim.totalRecoverableWageClaimCad || 0).toLocaleString('en-CA')} CAD</span>` :
    '<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">COMPLIANT STATUTORY WAGES</span>';

  const vacBadge = vac.isFiveYearTenure ?
    '<span class="badge" data-s="background-2563eb color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">6% VACATION PAY (5+ YRS SERVICE)</span>' :
    '<span class="badge" data-s="background-0284c7 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">4% VACATION PAY (&lt;5 YRS SERVICE)</span>';

  const otBadge = hours.overtimeHours > 0 ?
    `<span class="badge" data-s="background-7c3aed color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">OVERTIME: ${hours.overtimeHours}H @ 1.5×</span>` :
    '<span class="badge" data-s="background-64748b color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">REGULAR HOURS</span>';

  const unlawfulDeductionHtml = ded.isDeductionUnlawful ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 UNLAWFUL PAYROLL DEDUCTION DETECTED (ESA s. 13)
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0-0-0_35rem-0">
        ${ded.statutoryViolationDetail || ''}
      </p>
      <p data-s="font-size-0_82rem color-991b1b margin-0 font-weight-600">
        Recoverable Unlawful Deduction: $${(ded.recoverableDeductionCad || 0).toLocaleString('en-CA')} CAD
      </p>
    </div>
  ` : '';

  const holidayCalcHtml = hol.statutoryHolidaysInPeriod > 0 ? `
    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 font-size-0_88rem margin-bottom-0_35rem">Public Holiday Pay Statutory Calculation</div>
      <p data-s="font-size-0_82rem margin-0-0-0_25rem-0 color-text-muted">${hol.calculationBasis || ''}</p>
      <div data-s="display-flex gap-1_5rem margin-top-0_5rem flex-wrap-wrap font-size-0_82rem">
        <div><strong>Public Holiday Base Pay:</strong> $${(hol.publicHolidayPayCad || 0).toLocaleString('en-CA')} CAD</div>
        ${hol.workedOnStatHoliday ? `<div><strong>Holiday Premium Pay (1.5× for ${hol.hoursWorkedOnStatHoliday}h):</strong> $${(hol.holidayPremiumPayCad || 0).toLocaleString('en-CA')} CAD</div>` : ''}
        <div><strong>Total Holiday Entitlement:</strong> $${(hol.totalHolidayEntitlementCad || 0).toLocaleString('en-CA')} CAD</div>
      </div>
    </div>
  ` : '';

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Statutory Wage Claim Roadmap</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_35rem"><strong>${s.title}:</strong> ${s.action}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Employment Standards Protections</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${claimBadge}
        ${vacBadge}
        ${otBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">Employment Standards Statutory Pay Audit (${data.province || 'ON'})</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">Hourly rate: $${(data.hourlyRateCad || 0).toFixed(2)} CAD | Employment tenure: ${data.tenureYears || 0} years</p>
    </div>

    ${unlawfulDeductionHtml}

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Regular Earnings (${hours.regularHours || 0}h)</span>
        <strong data-s="font-size-1_1rem color-text">$${(hours.regularWagesCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Overtime Earnings (${hours.overtimeHours || 0}h @ 1.5×)</span>
        <strong data-style="font-size:1.1rem;color:${hours.overtimeHours > 0 ? '#7c3aed' : 'var(--text)'};">+$${(hours.overtimeWagesCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Vacation Pay (${vac.statutoryVacationRatePercent || 4}%)</span>
        <strong data-s="font-size-1_1rem color-0284c7">+$${(vac.statutoryVacationPayAccruedCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Public Holiday Pay (${hol.statutoryHolidaysInPeriod || 0} Holiday)</span>
        <strong data-s="font-size-1_1rem color-16a34a">+$${(hol.totalHolidayEntitlementCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Statutory Gross Pay Entitlement</span>
        <strong data-s="font-size-1_25rem color-primary">$${(claim.correctGrossStatutoryPayCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
    </div>

    ${holidayCalcHtml}
    ${stepsHtml}
    ${warningsHtml}
  `;
}

export function renderEmploymentReferenceAssessment(data, container) {
  if (!container) return;
  container.replaceChildren();

  const card = el('div', undefined, 'pathway-card');

  // Status banner
  const bannerClass = data.complianceVerdict === 'COMPLIANT_READY_FOR_SUBMISSION' ? 'alert-box success' : data.complianceVerdict === 'FATAL_DEFECT_HIGH_REFUSAL_OR_PFL_RISK' ? 'alert-box error' : 'alert-box warning';
  const banner = el('div', undefined, bannerClass);
  const title = el('strong', data.complianceVerdict === 'COMPLIANT_READY_FOR_SUBMISSION' ? 'REFERENCE LETTER VERIFIED: IRCC COMPLIANT ✓' : data.complianceVerdict === 'FATAL_DEFECT_HIGH_REFUSAL_OR_PFL_RISK' ? 'CRITICAL REFUSAL / PFL MISREPRESENTATION RISK' : 'DEFICIENCIES DETECTED: Action Required Prior to Submission');
  const desc = el('p', `Target: NOC ${data.targetNoc.nocCode} (${data.targetNoc.nocTitle}) · Corroboration: ${data.corroborationAudit.corroborationTier}`);
  banner.append(title, desc);
  card.append(banner);

  // Key metrics
  const grid = el('div', undefined, 'u-stat-grid u-mt-100');
  const s1 = el('div', undefined, 'stat-card');
  s1.append(el('span', 'Compliance Score', 'stat-label'));
  s1.append(el('strong', `${data.overallComplianceScore} / 100`, 'stat-value font-bold'));
  s1.append(el('span', `${data.mandatoryElementsAudit.satisfiedCount} of ${data.mandatoryElementsAudit.totalRequired} mandatory elements satisfied`, 'stat-sub'));

  const s2 = el('div', undefined, 'stat-card');
  s2.append(el('span', 'Corroboration Proof', 'stat-label'));
  s2.append(el('strong', `${data.corroborationAudit.corroborationScore}%`, 'stat-value font-bold'));
  s2.append(el('span', `Pay stubs: ${data.corroborationAudit.hasPayStubs ? 'Yes' : 'No'} · Tax: ${data.corroborationAudit.hasTaxDocuments ? 'Yes' : 'No'}`, 'stat-sub'));

  const s3 = el('div', undefined, 'stat-card');
  s3.append(el('span', 'Full-Time Threshold', 'stat-label'));
  s3.append(el('strong', `${data.hoursPerWeek} hrs/week`, 'stat-value font-bold'));
  s3.append(el('span', data.hoursPerWeek >= 30 ? 'Meets IRPR s. 75/87.1 full-time' : 'Part-Time (pro-rated hours)', 'stat-sub'));

  grid.append(s1, s2, s3);
  card.append(grid);

  // Missing elements
  if (data.mandatoryElementsAudit.missingElements && data.mandatoryElementsAudit.missingElements.length > 0) {
    const missingBox = el('div', undefined, 'u-sunken-box u-mt-100');
    missingBox.append(el('strong', 'Missing Mandatory IRCC Reference Elements:', 'u-section-label'));
    data.mandatoryElementsAudit.missingElements.forEach(m => {
      const mEl = el('div', undefined, 'u-mt-050');
      mEl.append(el('strong', '❌ Missing: '));
      mEl.append(el('span', m));
      missingBox.append(mEl);
    });
    card.append(missingBox);
  }

  // Deficiencies and PFL Risks
  if (data.auditDeficiencies && data.auditDeficiencies.length > 0) {
    const defBox = el('div', undefined, 'u-sunken-box u-mt-100');
    defBox.append(el('strong', 'Procedural Fairness Letter (PFL) & Misrepresentation Risks:', 'u-section-label'));
    data.auditDeficiencies.forEach(d => {
      const dEl = el('div', undefined, 'u-mt-050');
      dEl.append(el('strong', `⚠️ ${d.title}: `));
      dEl.append(el('span', d.message));
      defBox.append(dEl);
    });
    card.append(defBox);
  }

  // Template Generator
  const docContainer = el('div', undefined, 'u-mt-100');
  docContainer.append(el('strong', 'Official IRCC-Compliant Employment Reference Letter Template (Share with Employer):', 'u-section-label'));
  const pre = el('pre', data.standardCompliantLetterTemplate, 'u-sunken-box u-mt-050');
  docContainer.append(pre);

  const copyBtn = el('button', 'Copy Reference Letter Template to Clipboard 📋', 'secondary u-mt-050');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(data.standardCompliantLetterTemplate).then(() => {
      copyBtn.textContent = 'Copied to Clipboard! ✓';
      setTimeout(() => { copyBtn.textContent = 'Copy Reference Letter Template to Clipboard 📋'; }, 2500);
    }).catch(() => {});
  });
  docContainer.append(copyBtn);
  card.append(docContainer);

  container.append(card);
}

// Newcomer Consumer Credit Agreement, High-Cost Credit & Payday Loan Defense
export function renderTfwComplianceAssessment(data, container) {
  if (!data || !container) return;
  const { complianceStatus, wageAudit, unlawfulDeductionsAudit, totalFinancialRestitutionDueCad, vwowpAssessment, employerSanctionExposure, violations, actionPlan } = data;

  const isCompliant = complianceStatus === 'Compliant';
  const badgeClass = isCompliant ? 'success' : 'danger';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${complianceStatus.toUpperCase()}</span>
        <span class="muted">Total Restitution Owed: $${totalFinancialRestitutionDueCad} CAD</span>
      </div>
      <h4 class="u-mt-50">${isCompliant ? 'Employer Meets IRPR Compliance Benchmarks' : `Total Restitution Claim: $${totalFinancialRestitutionDueCad} CAD`}</h4>
      <p class="u-text-sm">${employerSanctionExposure}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Wage Shortfall</span>
        <span class="metric-value">$${wageAudit?.totalWageShortfallCad ?? 0} CAD</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Illegal Deductions</span>
        <span class="metric-value">$${unlawfulDeductionsAudit?.totalIllegalDeductionsCad ?? 0} CAD</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">VWOWP Open Permit</span>
        <span class="metric-value">${vwowpAssessment?.eligibleForVwowp ? 'Eligible (IRPR s.207.1)' : 'Not Triggered'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Hourly Difference</span>
        <span class="metric-value">$${wageAudit?.hourlyUnderpaymentCad ?? 0}/hr</span>
      </div>
    </div>
  `;

  if (violations && violations.length > 0) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>⚠️ Statutory & Regulatory Violations Detected</h5>
        <ul>${violations.map(v => `<li>${v}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionPlan && actionPlan.length > 0) {
    html += `
      <div class="checklist-card u-mt-100">
        <h5>⚖️ Legal Remedies & Restitution Action Plan</h5>
        <div class="u-grid-200 u-mt-50">
          ${actionPlan.map(a => `
            <div class="check-item warning">
              <strong>${a.action}</strong>
              <p class="muted u-text-xs">Authority: ${a.authority} ${a.claimAmountCad ? `| Claim: $${a.claimAmountCad} CAD` : ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderWorkplaceSafetyAssessment(data, container) {
  if (!data || !container) return;
  const { safetyRefusalAudit, reprisalAudit, compensationAudit, rightsViolations, legalProtections, actionChecklist } = data;

  const isLegit = safetyRefusalAudit?.refusalLegitimate;
  const hasReprisal = reprisalAudit?.reprisalViolationDetected;
  const badgeClass = hasReprisal ? 'danger' : isLegit ? 'warning' : 'success';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${hasReprisal ? 'UNLAWFUL REPRISAL DETECTED' : (isLegit ? 'VALID WORK REFUSAL (OHSA s. 43)' : 'SAFE WORK ENVIRONMENT')}</span>
        <span class="muted">Estimated Monthly LOE: $${compensationAudit?.estimatedMonthlyLoeCad ?? 0} CAD</span>
      </div>
      <h4 class="u-mt-50">${hasReprisal ? 'Employer Unlawful Reprisal — Reverse Burden Applies' : (isLegit ? `Active ${safetyRefusalAudit.stageDetails?.currentStage ?? 'Work Refusal'}` : 'Workplace Safety Assessment')}</h4>
      <p class="u-text-sm">${safetyRefusalAudit?.hazardIdentified ?? 'Standard workplace'} (${safetyRefusalAudit?.statutorySection ?? 'OHSA'})</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Refusal Rights</span>
        <span class="metric-value">${isLegit ? 'Protected s.43' : 'Not Triggered'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">WSIB LOE Rate</span>
        <span class="metric-value">${compensationAudit?.loePercentageNet ?? 85}% Net</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Monthly Benefit</span>
        <span class="metric-value">$${compensationAudit?.estimatedMonthlyLoeCad ?? 0} CAD</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Reprisal Reverse Burden</span>
        <span class="metric-value">${reprisalAudit?.reverseBurdenApplies ? 'Active (OLRB)' : 'None'}</span>
      </div>
    </div>
  `;

  if (rightsViolations && rightsViolations.length > 0) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>⚠️ Health & Safety Rights Violations</h5>
        <ul>${rightsViolations.map(rv => `<li>${rv}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (legalProtections && legalProtections.length > 0) {
    html += `
      <div class="alert-box info u-mt-100">
        <h5>🛡️ Statutory Protections & Immunity</h5>
        <ul>${legalProtections.map(lp => `<li>${lp}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionChecklist && actionChecklist.length > 0) {
    html += `
      <div class="checklist-card u-mt-100">
        <h5>📋 Immediate Procedural Action Steps</h5>
        <div class="u-grid-200 u-mt-50">
          ${actionChecklist.map(ac => `
            <div class="check-item warning">
              <strong>${ac.step}</strong>
              <p class="muted u-text-xs">Authority: ${ac.authority} (${ac.urgency})</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderEiDisqualificationAssessment(data, container) {
  const {
    applicantName,
    regularBenefits,
    justCauseAudit,
    misconductAudit,
    separationMoniesAllocation,
    specialBenefitsOverride,
    defenseArguments,
    statutoryNotes,
    riskWarnings
  } = data;

  const isDisqualified = regularBenefits?.isDisqualifiedFromRegularBenefits;
  const statusClass = isDisqualified ? 'error' : 'success';
  const statusTitle = isDisqualified ? 'Indefinite EI Regular Benefits Disqualification' : 'Eligible for Regular Benefits';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${statusTitle}</h4>
      <p><strong>Claimant:</strong> ${escapeHtml(applicantName)} | <strong>Weekly Benefit:</strong> ${regularBenefits?.estimatedWeeklyBenefitCad?.toFixed(2) || '0.00'} CAD</p>
      <p>${regularBenefits?.disqualificationReason}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${regularBenefits?.insurableHoursAccumulated || 0} hrs</span>
        <span class="stat-lbl">Insurable Hours (${regularBenefits?.meetsHoursThreshold ? 'Meets Threshold' : 'Shortfall'})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${separationMoniesAllocation?.estimatedAllocationDelayWeeks || 0} wks</span>
        <span class="stat-lbl">Severance Allocation Delay</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${justCauseAudit?.justCauseEstablished ? 'Established' : 'None'}</span>
        <span class="stat-lbl">Statutory Just Cause (s. 29(c))</span>
      </div>
    </div>
  `;

  if (separationMoniesAllocation?.totalSeparationMoniesCad > 0) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Separation Monies Allocation (EI Regs ss. 35–36)</h5>
        <p>${separationMoniesAllocation.delayExplanation}</p>
        <p class="u-text-sm muted">Total Separation Pay: ${separationMoniesAllocation.totalSeparationMoniesCad?.toLocaleString()} CAD allocated at normal rate of ${separationMoniesAllocation.normalWeeklyEarningsCad?.toLocaleString()} CAD/week.</p>
      </div>
    `;
  }

  if (misconductAudit?.employerAllegedMisconduct) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Misconduct Audit (Canada v. Brissette Precedent)</h5>
        <p><strong>Finding:</strong> ${misconductAudit.misconductAuditResult === 'incompetence_not_misconduct' ? 'Performance/Incompetence Protected (Not Misconduct)' : 'Misconduct Disqualification Upheld'}</p>
      </div>
    `;
  }

  if (specialBenefitsOverride?.isClaimingSpecialBenefits) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Special Benefits Exemption (EIA s. 33)</h5>
        <p>Disqualification for voluntary leaving or misconduct does not apply to EI sickness, maternity, parental, or caregiving benefits.</p>
      </div>
    `;
  }

  if (defenseArguments?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Defense Arguments</h5>
        <ul>${defenseArguments.map(d => `<li>${d}</li>`).join('')}</ul>
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
// 54. RURAL RENEWAL & ENTREPRENEUR ENGINE
// ==========================================

export function renderDigitalPlatformWorkerAssessment(data, container) {
  const {
    workerName,
    platformName,
    province,
    governingLegislation,
    summaryTitle,
    wageAudit,
    restitutionSummary,
    deplatformingAudit,
    violations,
    statutoryProtections,
    riskWarnings,
    actionPlan
  } = data;

  const statusClass = violations?.length === 0 ? 'success' : 'error';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Worker:</strong> ${escapeHtml(workerName)} | <strong>Platform:</strong> ${escapeHtml(platformName)} | <strong>Legislation:</strong> ${escapeHtml(governingLegislation)}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${wageAudit?.statutoryEngagedHourlyRateCad?.toFixed(2) || '17.20'}/hr</span>
        <span class="stat-lbl">Statutory Engaged Floor (${province})</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${wageAudit?.wageShortfallCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Unpaid Minimum Wage Shortfall</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${restitutionSummary?.totalOwedCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Total Restitution Claimable</span>
      </div>
    </div>
  `;

  if (deplatformingAudit?.isDeplatformed) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Account Deactivation Audit</h5>
        <p><strong>Notice Received:</strong> ${deplatformingAudit.noticeDaysGiven} days (Mandatory: ${deplatformingAudit.statutoryNoticeDaysRequired} days)</p>
        <p><strong>Status:</strong> ${deplatformingAudit.isUnlawfulDeplatforming ? 'Unlawful De-platforming (Notice/Reasons Deficient)' : 'Statutory Notice Standard Met'}</p>
      </div>
    `;
  }

  if (violations?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Statutory Violations</h5>
        <ul>${violations.map(v => `<li>${v}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (statutoryProtections?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Worker Legal Protections</h5>
        <ul>${statutoryProtections.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Legal Warnings</h5>
        <ul>${riskWarnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Enforcement Plan</h5>
        <ol>${actionPlan.map(a => `<li>${a}</li>`).join('')}</ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 60. ATLANTIC IMMIGRATION PROGRAM (AIP)
// ==========================================

