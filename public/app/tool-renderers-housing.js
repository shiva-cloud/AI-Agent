import { $, el, escapeHtml } from './core.js';
import { VERDICT_TEXT } from './data.js';

export function renderLeaseGuardAssessment(data, container) {
  if (!container) return;
  const { province, overallSafetyRating, standardFormStatus, depositAudit, clauseAudits, officialDisputeNotice, statutoryAuthority } = data;

  const isRisk = overallSafetyRating === 'high_risk';
  const isWarn = overallSafetyRating === 'warning';
  const badgeColor = isRisk ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
  const badgeBg = isRisk ? '#fee2e2' : isWarn ? '#fef3c7' : '#d1fae5';
  const ratingText = isRisk ? 'CRITICAL RISKS & ILLEGAL DEMANDS' : isWarn ? 'WARNINGS DETECTED' : 'STANDARD LAWFUL LEASE';

  const fmt = (n) => '$' + Number(n || 0).toLocaleString();

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem">
        <div>
          <span class="badge" data-style="background:${badgeBg};color:${badgeColor};font-weight:700;padding:0.25rem 0.6rem;border-radius:4px;font-size:0.82rem;">${ratingText}</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">Lease check (${province})</h3>
          <span data-s="font-size-0_83rem color-text-muted">${statutoryAuthority}</span>
        </div>
        ${depositAudit.totalUnlawfulExcessCad > 0 ? `
          <div data-s="text-align-right">
            <div data-s="font-size-1_3rem font-weight-700 color-dc2626">${fmt(depositAudit.totalUnlawfulExcessCad)} CAD</div>
            <span data-s="font-size-0_8rem color-b91c1c">Unlawful Deposit Excess</span>
          </div>
        ` : ''}
      </div>

      ${standardFormStatus.statutoryRemedy ? `
        <div data-s="padding-0_85rem background-fff1f2 border-left-4px-solid-f43f5e border-radius-4px margin-bottom-1rem font-size-0_86rem line-height-1_45">
          <strong data-s="color-be123c">⚠️ NON-STANDARD LEASE USED:</strong><br>
          ${standardFormStatus.statutoryRemedy.demandRight}<br>
          <span data-s="display-inline-block margin-top-0_35rem color-9f1239"><strong>Withholding rent (Ontario rule):</strong> ${standardFormStatus.statutoryRemedy.rentWithholding} ${standardFormStatus.statutoryRemedy.permanentRetention}</span>
        </div>
      ` : ''}

      ${depositAudit.unlawfulCharges.length > 0 ? `
        <h4 data-s="margin-1rem-0-0_4rem-0 font-size-0_95rem color-b91c1c">🚨 Unlawful Deposit Demands:</h4>
        <div data-s="display-flex flex-direction-column gap-0_4rem margin-bottom-1rem">
          ${depositAudit.unlawfulCharges.map(ch => `
            <div data-s="padding-0_6rem-0_75rem background-fef2f2 border-1px-solid-fecaca border-radius-6px display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem font-size-0_85rem">
              <span>${ch.description}</span>
              <strong data-s="color-dc2626">+${fmt(ch.unlawfulAmountCad)} Illegal Excess</strong>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${clauseAudits.length > 0 ? `
        <h4 data-s="margin-1rem-0-0_4rem-0 font-size-0_95rem">⚖️ Clause Enforceability Rulings:</h4>
        <div data-s="display-flex flex-direction-column gap-0_5rem margin-bottom-1_25rem">
          ${clauseAudits.map(cl => `
            <div data-style="padding:0.75rem;background:var(--bg-elevated, #f8fafc);border:1px solid #e2e8f0;border-left:4px solid ${cl.isLegal ? '#10b981' : '#f59e0b'};border-radius:4px;font-size:0.85rem;">
              <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_25rem">
                <strong>${cl.name}</strong>
                <span class="badge" data-style="font-size:0.75rem;background:${cl.isLegal ? '#d1fae5' : '#fef3c7'};color:${cl.isLegal ? '#065f46' : '#92400e'};">${cl.statutoryStatus.toUpperCase()} (${cl.statute})</span>
              </div>
              <p data-s="margin-0_35rem-0-0_2rem-0 color-text">${cl.ruling}</p>
              <div data-s="font-size-0_8rem color-text-muted">${cl.action}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div data-s="margin-top-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_5rem">
          <h4 data-s="margin-0 font-size-0_95rem">📋 Formal Dispute Notice to Landlord:</h4>
          <button type="button" class="sos-copy-btn" id="lease-guard-copy-btn" data-s="padding-0_25rem-0_6rem font-size-0_8rem">Copy Letter 📋</button>
        </div>
        <textarea id="lease-guard-letter-text" readonly rows="7" data-s="width-100pc border-radius-6px border-1px-solid-border padding-0_75rem font-family-monospace font-size-0_8rem background-bg-elevated color-text">${escapeHtml(officialDisputeNotice)}</textarea>
      </div>
    </div>
  `;

  const copyBtn = $('#lease-guard-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const txt = $('#lease-guard-letter-text')?.value;
      if (txt) {
        navigator.clipboard?.writeText(txt).then(() => {
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy Letter 📋'; }, 2000);
        });
      }
    });
  }
}

export function renderHomebuyerAssessment(data, container) {
  if (!container) return;
  const {
    purchasePriceCad,
    province,
    city,
    immigrationStatus,
    federalBanAssessment,
    provincialTaxAssessment,
    closingTaxesAndRebates,
    financialClosingSummary,
    statutoryAdvisories,
    statutoryAuthority
  } = data;

  const fmt = (n) => '$' + Number(n || 0).toLocaleString();
  const isPermitted = federalBanAssessment.isLegallyPermittedToBuy;
  const statusBadgeBg = isPermitted ? '#d1fae5' : '#fee2e2';
  const statusBadgeColor = isPermitted ? '#065f46' : '#991b1b';
  const statusLabel = isPermitted ? 'LAWFULLY ELIGIBLE TO PURCHASE' : 'STRICTLY PROHIBITED (FEDERAL BAN)';

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span class="badge" data-style="background:${statusBadgeBg};color:${statusBadgeColor};font-weight:700;padding:0.25rem 0.6rem;border-radius:4px;font-size:0.82rem;">${statusLabel}</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">Newcomer Homebuyer Assessment: ${fmt(purchasePriceCad)} (${city}, ${province})</h3>
          <span data-s="font-size-0_83rem color-text-muted">${federalBanAssessment.statute} | ${federalBanAssessment.regulation}</span>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-1_3rem font-weight-700 color-text">${fmt(financialClosingSummary.totalUpfrontCashRequiredAtClosingCad)} CAD</div>
          <span data-s="font-size-0_8rem color-text-muted">Total Upfront Cash at Closing</span>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Minimum down payment</div>
          <div data-s="font-size-1_3rem font-weight-700 color-primary-0284c7">${fmt(financialClosingSummary.minimumDownPaymentCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">${financialClosingSummary.minimumDownPaymentPercent}% Bank Act tier</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Non-Resident Tax (${provincialTaxAssessment.ratePercent}%)</div>
          <div data-style="font-size:1.3rem;font-weight:700;color:${provincialTaxAssessment.upfrontNonResidentTaxCad > 0 ? '#dc2626' : '#10b981'};">${fmt(provincialTaxAssessment.upfrontNonResidentTaxCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">${provincialTaxAssessment.ratePercent > 0 ? provincialTaxAssessment.taxName : '0% Speculation Tax'}</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Net Land Transfer Tax</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">${fmt(closingTaxesAndRebates.netLandTransferTaxCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">After ${fmt(closingTaxesAndRebates.firstTimeHomeBuyerRebateCad)} FTHB rebate</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Recoverable Future Rebates</div>
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">+${fmt(financialClosingSummary.futureRecoverableRebatesCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">PR 4-yr full refund + interest</div>
        </div>
      </div>

      <div data-s="margin-bottom-1_25rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">⚖️ Federal Foreign Buyer Ban Criteria Diagnostic:</h4>
        <div data-s="display-flex flex-direction-column gap-0_4rem">
          ${federalBanAssessment.criteriaAudit.map(c => `
            <div data-style="padding:0.6rem 0.75rem;background:var(--bg-elevated,#f8fafc);border:1px solid var(--border);border-left:4px solid ${c.met ? '#10b981' : '#ef4444'};border-radius:4px;font-size:0.84rem;">
              <div data-s="display-flex justify-content-space-between align-items-center">
                <strong>${c.met ? '✓ ' : '✗ '}${c.criterion}</strong>
                <span class="badge" data-style="font-size:0.75rem;background:${c.met ? '#d1fae5' : '#fee2e2'};color:${c.met ? '#065f46' : '#991b1b'};">${c.met ? 'PASS' : 'FAIL'}</span>
              </div>
              <div class="muted" data-s="margin-top-0_25rem font-size-0_8rem">${c.note} (${c.statute})</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${provincialTaxAssessment.upfrontNonResidentTaxCad > 0 ? `
        <div data-s="background-fffbeb border-1px-solid-fde68a border-left-4px-solid-f59e0b border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_86rem line-height-1_45">
          <strong data-s="color-b45309">🏛️ ${provincialTaxAssessment.rebateProgram}:</strong><br>
          You must pay <strong>${fmt(provincialTaxAssessment.upfrontNonResidentTaxCad)} CAD</strong> upfront at closing, but you may be able to get it <strong>refunded in full</strong> if you meet these conditions:
          <ul data-s="margin-0_4rem-0-0_2rem-0 padding-left-1_25rem font-size-0_82rem color-78350f">
            ${provincialTaxAssessment.rebateConditions.map(rc => `<li data-s="margin-bottom-0_25rem">${rc}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div data-s="margin-bottom-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">📜 Legal notes:</h4>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text-muted line-height-1_45">
          ${statutoryAdvisories.map(a => `<li data-s="margin-bottom-0_35rem">${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>

      <div class="muted" data-s="font-size-0_75rem border-top-1px-solid-border padding-top-0_5rem">
        Statutory Authority: ${statutoryAuthority}
      </div>
    </div>
  `;
}

export function renderEvictionDefenseAssessment(data, container) {
  const isVoid = data.isNoticeStatutorilyVoid;
  const statusColor = isVoid ? 'var(--danger, #dc2626)' : 'var(--accent, #0284c7)';
  const statusBadge = isVoid
    ? '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ Notice may be invalid</span>'
    : '<span data-s="background-rgba-2-132-199-0_15 color-0284c7 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚖️ FACIALLY CHALLENGEABLE AT LTB</span>';

  let defectsHtml = '';
  if (data.statutoryDefects && data.statutoryDefects.length > 0) {
    defectsHtml = `
      <div data-s="margin-top-1_25rem background-rgba-220-38-38-0_06 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 color-dc2626 font-size-0_95rem">🚨 Problems that may make the notice invalid (${data.statutoryDefects.length})</h4>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_88rem display-flex flex-direction-column gap-0_5rem">
          ${data.statutoryDefects.map(d => `
            <li>
              <strong>${escapeHtml(d.defect)}</strong><br>
              <span class="muted" data-s="font-size-0_82rem">Statute: ${escapeHtml(d.statute)}</span><br>
              <span data-s="color-dc2626 font-size-0_82rem">Remedy: ${escapeHtml(d.legalRemedy)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  } else {
    defectsHtml = `
      <div data-s="margin-top-1_25rem background-rgba-16-185-129-0_06 border-1px-solid-rgba-16-185-129-0_3 border-radius-8px padding-1rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-10b981 font-size-0_95rem">✅ No Facially Disqualifying Technical Defects</h4>
        <p class="muted" data-s="margin-0 font-size-0_85rem">Notice meets minimum calendar days and initial requirements, but landlord must still prove good-faith subjective intent under oath before the LTB.</p>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">${escapeHtml(data.noticeFormType)} NOTICE CHECK RESULT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(VERDICT_TEXT[data.validityVerdict] || data.validityVerdict.replace(/_/g, ' '))}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">NOTICE PERIOD CHECK</div>
          <div data-s="font-size-1_05rem font-weight-700 margin-top-0_25rem">
            ${data.noticePeriodAudit.daysNoticeGiven} Days
            <span data-s="font-size-0_8rem font-weight-normal color-text-muted">(Req: ${data.noticePeriodAudit.statutoryDaysRequired}d)</span>
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${data.noticePeriodAudit.isNoticePeriodCompliant ? '#10b981' : '#dc2626'};">
            ${data.noticePeriodAudit.isNoticePeriodCompliant ? '✓ Compliant Notice Period' : '✗ Insufficient Notice Period'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">REQUIRED COMPENSATION</div>
          <div data-s="font-size-1_05rem font-weight-700 margin-top-0_25rem">
            $${data.compensationAudit.amountDueCad.toLocaleString()} CAD
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${data.compensationAudit.paidOnTime ? '#10b981' : (data.compensationAudit.wasPaid ? '#f59e0b' : '#dc2626')};">
            ${data.compensationAudit.paidOnTime ? '✓ Paid on or before Termination' : (data.compensationAudit.wasPaid ? '⚠️ Paid Late (After Termination)' : '✗ Unpaid (may make the notice invalid)')}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">MAX BAD-FAITH DAMAGES (s.57(3))</div>
          <div data-s="font-size-1_05rem font-weight-700 margin-top-0_25rem color-f59e0b">
            $${data.potentialTenantDamages.totalClaimableDamagesCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            12 Mo. Rent ($${data.potentialTenantDamages.statutoryGeneralDamages12MonthsRentCad.toLocaleString()}) + Moving
          </div>
        </div>
      </div>

      ${defectsHtml}

      <div data-s="margin-top-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_5rem">
          <label data-s="font-weight-600 font-size-0_88rem">DRAFT LETTER TO YOUR LANDLORD (REVIEW AND EDIT BEFORE SENDING):</label>
          <button type="button" class="btn-subtle" id="evict-copy-notice-btn" data-s="padding-0_25rem-0_6rem font-size-0_8rem">📋 Copy Dispute Notice</button>
        </div>
        <textarea id="evict-notice-text" readonly rows="7" data-s="width-100pc font-family-monospace font-size-0_82rem padding-0_6rem border-radius-6px border-1px-solid-border background-bg-card">${escapeHtml(data.officialDisputeNotice)}</textarea>
      </div>

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">YOUR RIGHTS IF YOU GET AN EVICTION NOTICE:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const copyBtn = $('#evict-copy-notice-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const noticeText = $('#evict-notice-text')?.value;
      if (noticeText && navigator.clipboard) {
        navigator.clipboard.writeText(noticeText).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Dispute Notice'; }, 2000);
        }).catch(() => {});
      }
    });
  }
}

export function renderLeaseAssignmentAssessment(data, container) {
  if (!container) return;

  const isN9Eligible = data.resolutionVerdict === 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9';
  const isAbConsent = data.resolutionVerdict === 'ALBERTA_DEEMED_CONSENT_ACQUIRED';
  const isQcResiliated = data.resolutionVerdict === 'QUEBEC_BILL_31_LEASE_RESILIATED';
  const isAwaiting = data.resolutionVerdict === 'AWAITING_7_DAY_STATUTORY_DEADLINE';

  const isSuccess = isN9Eligible || isAbConsent || isQcResiliated;
  const badgeColor = isSuccess ? '#16a34a' : isAwaiting ? '#f59e0b' : '#2563eb';
  const badgeText = isN9Eligible
    ? 'RIGHT TO TERMINATE WITH 30 DAYS NOTICE (FORM N9)'
    : isAbConsent
      ? 'ALBERTA 14-DAY STATUTORY DEEMED CONSENT'
      : isQcResiliated
        ? 'QUEBEC BILL 31 LEASE RESILIATED'
        : isAwaiting
          ? 'AWAITING 7-DAY LANDLORD RESPONSE'
          : data.resolutionVerdict.replace(/_/g, ' ');

  const violationsHtml = data.statutoryViolations.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">Statutory Lease Violations:</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.statutoryViolations.map(v => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(v.statute)}</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(v.finding)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const remediesHtml = data.legalRemedies.map(r => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem margin-bottom-0_5rem">
      <div data-s="font-weight-700 font-size-0_85rem color-text">${escapeHtml(r.action)}</div>
      <div data-s="font-size-0_78rem color-text-muted margin-0_2rem-0">Statute: ${escapeHtml(r.statute)}</div>
      <div data-s="font-size-0_8rem color-text">${escapeHtml(r.details)}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <!-- Header -->
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_75rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(badgeText)}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Lease Assignment &amp; Early Exit Assessment (${escapeHtml(data.province)})</h4>
        </div>
        ${data.earliestEffectiveTerminationDate ? `
          <div data-s="text-align-right">
            <div data-s="font-size-0_75rem color-text-muted font-weight-600">EARLIEST TERMINATION DATE</div>
            <div data-s="font-size-1_25rem font-weight-800 color-16a34a">${escapeHtml(data.earliestEffectiveTerminationDate)}</div>
          </div>
        ` : ''}
      </div>

      <!-- Overview Cards -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">EARLY EXIT WITHOUT PENALTY</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${data.isEarlyExitPermittedWithoutPenalty ? '#16a34a' : 'var(--text)'};margin-top:0.2rem;">
            ${data.isEarlyExitPermittedWithoutPenalty ? 'YES (STATUTORILY EXEMPT)' : 'REQUIRES STEP 1 REQUEST'}
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">RECOMMENDED LEGAL FORM</div>
          <div data-s="font-size-1_1rem font-weight-700 color-color-primary-2563eb margin-top-0_2rem">
            ${escapeHtml(data.recommendedLegalForm || 'Written Assignment Notice')}
          </div>
        </div>
      </div>

      ${violationsHtml}

      <!-- Legal Remedies -->
      <div data-s="margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Statutory Action Plan:</div>
        ${remediesHtml}
      </div>

      <!-- Templates -->
      ${data.noticeTemplates.formN9TerminationNotice ? `
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
          <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">FORM N9 STATUTORY DETAILS:</div>
          <pre data-s="white-space-pre-wrap font-family-inherit font-size-0_8rem color-text margin-0 background-bg-card padding-0_75rem border-radius-4px border-1px-solid-border">${escapeHtml(data.noticeTemplates.formN9TerminationNotice)}</pre>
        </div>
      ` : `
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
          <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">FORMAL ASSIGNMENT REQUEST IN PRINCIPLE (STEP 1):</div>
          <pre data-s="white-space-pre-wrap font-family-inherit font-size-0_8rem color-text margin-0 background-bg-card padding-0_75rem border-radius-4px border-1px-solid-border">${escapeHtml(data.noticeTemplates.assignmentRequestLetter)}</pre>
        </div>
      `}

      <!-- Things to Know -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderRentIncreaseAssessment(data, container) {
  if (!container || !data) return;

  let badgeColor = '#16a34a';
  let badgeText = 'COMPLIANT RENT INCREASE';

  if (data.validityVerdict === 'STATUTORILY_VOID') {
    badgeColor = '#dc2626';
    badgeText = 'NOTICE IS STATUTORILY VOID';
  } else if (data.validityVerdict === 'ILLEGAL_AMOUNT') {
    badgeColor = '#dc2626';
    badgeText = 'UNLAWFUL INCREASE ABOVE GUIDELINE';
  } else if (data.validityVerdict === 'AGI_UNAPPROVED_PAY_GUIDELINE_ONLY') {
    badgeColor = '#d97706';
    badgeText = 'PAY GUIDELINE ONLY PENDING LTB ORDER';
  } else if (data.validityVerdict === 'UNRESTRICTED_MARKET_INCREASE') {
    badgeColor = '#2563eb';
    badgeText = 'EXEMPT FROM RENT CONTROL (POST-2018)';
  }

  const calcs = data.rentCalculations || {};
  const defectsHtml = data.statutoryDefects && data.statutoryDefects.length > 0 ? `
    <div data-s="background-fee2e2 border-1px-solid-ef4444 border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-991b1b font-size-0_9rem margin-bottom-0_4rem">⛔ STATUTORY DEFECTS &amp; VOID NOTICE FINDINGS:</div>
      ${data.statutoryDefects.map(d => `
        <div data-s="margin-bottom-0_5rem font-size-0_85rem color-7f1d1d">
          <strong>[${escapeHtml(d.statute)}] ${escapeHtml(d.defectCode)}:</strong>
          <div>${escapeHtml(d.remedy)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const agi = data.agiAnalysis;
  const agiHtml = agi ? `
    <div data-s="background-fef3c7 border-1px-solid-f59e0b border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-92400e font-size-0_9rem margin-bottom-0_4rem">⚖️ ABOVE-GUIDELINE INCREASE (AGI) TENANT DEFENSE:</div>
      <div data-s="font-size-0_85rem color-78350f line-height-1_45">
        <div>${escapeHtml(agi.tenantStatutoryRight)}</div>
        <div data-s="margin-top-0_4rem font-weight-600">${escapeHtml(agi.maintenanceDefenseFinding)}</div>
      </div>
    </div>
  ` : '';

  const overpayment = data.overpaymentAnalysis || {};
  const overpaymentHtml = overpayment.monthlyIllegalPortionCad > 0 ? `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-0_4rem">
        <span data-s="font-weight-700 font-size-0_85rem">💰 ILLEGAL OVERPAYMENT &amp; FORM T1 RECOVERY:</span>
        <strong data-s="color-dc2626 font-size-1rem">$${Number(overpayment.annualIllegalPortionCad).toLocaleString()} CAD / Year</strong>
      </div>
      <div data-s="font-size-0_8rem color-text-muted line-height-1_45">
        <div>Unlawful monthly excess: <strong>$${Number(overpayment.monthlyIllegalPortionCad).toLocaleString()} CAD/mo</strong> above legal guideline.</div>
        <div data-s="margin-top-0_3rem color-b91c1c">${escapeHtml(overpayment.t1StatuteOfLimitationsWarning)}</div>
      </div>
    </div>
  ` : '';

  const noticeText = data.officialTenantDisputeNotice || '';
  const disputeLetterHtml = noticeText ? `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_4rem">
        <span data-s="font-weight-700 font-size-0_85rem">📝 FORMAL TENANT STATUTORY DISPUTE NOTICE LETTER:</span>
        <button type="button" class="secondary" data-s="font-size-0_75rem padding-0_25rem-0_5rem" data-copy-next data-copy-label="Copy Letter">Copy Letter</button>
        <span data-style="display:none;">${escapeHtml(noticeText)}</span>
      </div>
      <pre data-s="margin-0 font-family-monospace font-size-0_78rem background-surface-sunken padding-0_75rem border-radius-6px border-1px-solid-border white-space-pre-wrap color-text">${escapeHtml(noticeText)}</pre>
    </div>
  ` : '';

  const statutesHtml = data.statutoryReferences && data.statutoryReferences.length > 0 ? `
    <div data-s="font-size-0_75rem color-text-muted border-top-1px-solid-border padding-top-0_75rem margin-top-1rem">
      <strong>Statutory Authorities:</strong> ${data.statutoryReferences.map(s => escapeHtml(s)).join(' • ')}
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Rent Increase Audit (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">MAX LAWFUL GUIDELINE RENT</div>
          <div data-s="font-size-1_2rem font-weight-800 color-16a34a">
            $${Number(calcs.maxLawfulGuidelineRentCad || 0).toLocaleString()} CAD
          </div>
        </div>
      </div>

      <p data-s="font-size-0_95rem margin-0-0-1rem-0 line-height-1_45 color-text">
        ${escapeHtml(data.summary)}
      </p>

      <!-- Calculations Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CURRENT MONTHLY RENT</div>
          <div data-s="font-size-1rem font-weight-700 margin-top-0_2rem">
            $${Number(calcs.currentMonthlyRentCad || 0).toLocaleString()} CAD
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">PROPOSED RENT (INCREASE %)</div>
          <div data-style="font-size:1rem;font-weight:700;color:${calcs.proposedIncreasePercent > calcs.statutoryGuidelinePercent && data.rentControlStatus?.isRentControlled ? '#dc2626' : 'var(--text)'};margin-top:0.2rem;">
            $${Number(calcs.proposedMonthlyRentCad || 0).toLocaleString()} CAD (+${calcs.proposedIncreasePercent}%)
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">STATUTORY CAP (2026)</div>
          <div data-s="font-size-1rem font-weight-700 color-16a34a margin-top-0_2rem">
            ${calcs.statutoryGuidelinePercent}% (+$${Number(calcs.allowableGuidelineIncreaseCad || 0).toFixed(2)})
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">NOTICE PERIOD GIVEN</div>
          <div data-style="font-size:1rem;font-weight:700;color:${data.noticeCompliance?.isNoticePeriodCompliant ? '#16a34a' : '#dc2626'};margin-top:0.2rem;">
            ${data.noticeCompliance?.daysNoticeGiven || 0} Days (Min 90 Req.)
          </div>
        </div>
      </div>

      ${defectsHtml}
      ${agiHtml}
      ${overpaymentHtml}
      ${disputeLetterHtml}
      ${statutesHtml}
    </div>
  `;
}

export function renderHomebuyerTaxAssessment(data, container) {
  if (!data || !container) return;

  const downPayment = data.downPaymentUnlocked || {};
  const fhsa = data.fhsaEvaluation || {};
  const hbp = data.hbpEvaluation || {};
  const rebates = data.taxCreditsAndRebates || {};
  const recs = data.strategicRecommendations || [];
  const statutes = data.statutoryCitations || [];

  const recsHtml = recs.length > 0 ? `
    <div data-s="margin-top-1rem background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
      <h5 data-s="margin-0-0-0_5rem-0 font-size-0_85rem font-weight-700 color-text">STRATEGIC FIRST-TIME BUYER RECOMMENDATIONS:</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_82rem line-height-1_45 color-text-muted">
        ${recs.map(r => `<li data-s="margin-bottom-0_35rem">${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const statutesHtml = statutes.length > 0 ? `
    <div data-s="margin-top-0_75rem padding-top-0_5rem border-top-1px-dashed-border font-size-0_72rem color-text-muted">
      <strong>Statutory Authority:</strong> ${statutes.map(s => escapeHtml(s)).join(' · ')}
    </div>
  ` : '';

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_75rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span data-s="display-inline-block padding-0_25rem-0_6rem background-16a34a20 color-16a34a border-1px-solid-16a34a border-radius-4px font-weight-700 font-size-0_75rem letter-spacing-0_05em margin-bottom-0_4rem">
            ${data.isFirstTimeHomeBuyer ? 'FIRST-TIME HOMEBUYER QUALIFIED' : 'NON-FIRST-TIME BUYER'}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Down Payment Unlocked &amp; Tax Incentives (${escapeHtml(data.city)}, ${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">TOTAL COMBINED TAX BENEFIT</div>
          <div data-s="font-size-1_2rem font-weight-800 color-16a34a">
            $${Number(rebates.totalCombinedTaxAdvantageCad || 0).toLocaleString()} CAD
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">TAX-FREE DOWN PAYMENT</div>
          <div data-s="font-size-1_2rem font-weight-700 color-16a34a margin-top-0_2rem">
            $${Number(downPayment.totalTaxFreeDownPaymentCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            ${downPayment.downPaymentPercentOfPurchase || 0}% of $${Number(data.homePurchasePriceCad || 0).toLocaleString()} purchase
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">FHSA WITHDRAWAL &amp; REFUND</div>
          <div data-s="font-size-1_2rem font-weight-700 color-2563eb margin-top-0_2rem">
            $${Number(fhsa.totalFhsaWithdrawalCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            +$${Number(fhsa.estimatedDeductionTaxRefundCad || 0).toLocaleString()} tax deduction value
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">RRSP HBP WITHDRAWAL</div>
          <div data-s="font-size-1_2rem font-weight-700 color-7c3aed margin-top-0_2rem">
            $${Number(hbp.totalHbpWithdrawalCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            Repay $${Number(hbp.annualRepaymentRequiredCad || 0).toLocaleString()}/yr starting ${hbp.repaymentStartYear || 2031} (5-yr grace)
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CLOSING REBATES &amp; CREDITS</div>
          <div data-s="font-size-1_2rem font-weight-700 color-ca8a04 margin-top-0_2rem">
            $${Number((rebates.hbtcFederalTaxSavingsCad || 0) + (rebates.lttRebateCad || 0)).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            HBTC: $${Number(rebates.hbtcFederalTaxSavingsCad || 0).toLocaleString()} · LTT Rebate: $${Number(rebates.lttRebateCad || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <p data-s="font-size-0_85rem color-text-muted margin-0-0-0_5rem-0">
        ${escapeHtml(rebates.lttRebateDetails || '')}
      </p>

      ${recsHtml}
      ${statutesHtml}
    </div>
  `;
}

export function renderTenancyRepairsAssessment(data, container) {
  if (!container) return;
  container.replaceChildren();

  const card = el('div', undefined, 'tenancy-vault-card');

  // Header status banner
  const statusBanner = el('div', undefined, data.rentWithholdingRisk === 'severe' ? 'alert-box error' : data.hasVitalServiceBreach ? 'alert-box warning' : 'alert-box success');
  const statusTitle = el('strong', data.rentWithholdingRisk === 'severe' ? 'CRITICAL DEFENSE WARNING: Unilateral Rent Withholding Detected' : data.hasVitalServiceBreach ? 'VITAL SERVICES BREACH: Immediate Provincial Escalation Available' : 'Statutory Maintenance Audit Complete');
  const statusSummary = el('p', `Governing Tribunal: ${data.governingTribunal} · Official Action: ${data.applicationForm}`);
  statusBanner.append(statusTitle, statusSummary);
  card.append(statusBanner);

  // Key metrics grid
  const metricsGrid = el('div', undefined, 'u-stat-grid u-mt-100');
  const m1 = el('div', undefined, 'stat-card');
  m1.append(el('span', 'Rent Abatement Range', 'stat-label'));
  m1.append(el('strong', `${data.abatementEstimate.minPercentage}% – ${data.abatementEstimate.maxPercentage}%`, 'stat-value font-bold'));
  m1.append(el('span', `$${data.abatementEstimate.estimatedMinAbatementCad.toLocaleString()} – $${data.abatementEstimate.estimatedMaxAbatementCad.toLocaleString()} CAD`, 'stat-sub'));

  const m2 = el('div', undefined, 'stat-card');
  m2.append(el('span', 'Total Potential Recovery', 'stat-label'));
  m2.append(el('strong', `$${data.abatementEstimate.totalPotentialRemedyMinCad.toLocaleString()} – $${data.abatementEstimate.totalPotentialRemedyMaxCad.toLocaleString()} CAD`, 'stat-value font-bold'));
  m2.append(el('span', `Includes $${data.outOfPocketExpensesCad.toLocaleString()} expenses`, 'stat-sub'));

  const m3 = el('div', undefined, 'stat-card');
  m3.append(el('span', 'Tribunal Filing Fee', 'stat-label'));
  m3.append(el('strong', `$${data.filingFeeCad} CAD`, 'stat-value font-bold'));
  m3.append(el('span', 'Recoverable from landlord upon order', 'stat-sub'));

  metricsGrid.append(m1, m2, m3);
  card.append(metricsGrid);

  // Legal warnings
  if (data.legalWarnings && data.legalWarnings.length > 0) {
    const warningsBox = el('div', undefined, 'u-sunken-box u-mt-100');
    warningsBox.append(el('strong', 'Statutory Legal Warnings & Defense Risks:', 'u-section-label'));
    data.legalWarnings.forEach(w => {
      const wEl = el('div', undefined, 'u-mt-050');
      wEl.append(el('strong', `⚠️ ${w.title}: `));
      wEl.append(el('span', w.message));
      warningsBox.append(wEl);
    });
    card.append(warningsBox);
  }

  // Recognized issues
  const issuesBox = el('div', undefined, 'u-sunken-box u-mt-100');
  issuesBox.append(el('strong', 'Documented Statutory Breaches:', 'u-section-label'));
  data.recognizedIssues.forEach(iss => {
    const row = el('div', undefined, 'u-mt-050');
    row.append(el('strong', `• ${iss.label}: `));
    row.append(el('span', `${iss.statutoryRef} (Severity: ${iss.severity}, Abatement: ${iss.minAbatementPercent}%–${iss.maxAbatementPercent}%)`));
    issuesBox.append(row);
  });
  card.append(issuesBox);

  // Procedural remedies
  const remediesBox = el('div', undefined, 'u-sunken-box u-mt-100');
  remediesBox.append(el('strong', 'Statutory Procedural Strategy:', 'u-section-label'));
  data.proceduralRemedies.forEach(r => {
    const stepEl = el('div', undefined, 'u-mt-050');
    stepEl.append(el('strong', `Step ${r.step}: ${r.title} — `));
    stepEl.append(el('span', r.description));
    remediesBox.append(stepEl);
  });
  card.append(remediesBox);

  // Pre-litigation Demand Notice Document
  const docContainer = el('div', undefined, 'u-mt-100');
  docContainer.append(el('strong', 'Pre-Litigation Formal Notice of Disrepair (Ready to Copy/Serve):', 'u-section-label'));
  const pre = el('pre', data.noticeOfDisrepairDocument, 'u-sunken-box u-mt-050');
  docContainer.append(pre);

  const copyBtn = el('button', 'Copy Demand Notice to Clipboard 📋', 'secondary u-mt-050');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(data.noticeOfDisrepairDocument).then(() => {
      copyBtn.textContent = 'Copied to Clipboard! ✓';
      setTimeout(() => { copyBtn.textContent = 'Copy Demand Notice to Clipboard 📋'; }, 2500);
    }).catch(() => {});
  });
  docContainer.append(copyBtn);
  card.append(docContainer);

  container.append(card);
}

// Commercial Lease Review & Newcomer Small Business Tenancy Defense
export function renderCommercialLeaseAssessment(data, container) {
  if (!container) return;
  container.replaceChildren();

  const card = el('div', undefined, 'paycheck-card');

  // Status banner
  const bannerClass = data.lockoutRiskLevel === 'imminent' ? 'alert-box error' : data.lockoutRiskLevel === 'high' ? 'alert-box warning' : 'alert-box success';
  const banner = el('div', undefined, bannerClass);
  const title = el('strong', data.lockoutRiskLevel === 'imminent' ? 'CRITICAL IMMINENT RE-ENTRY / LOCKOUT HAZARD (CTA s. 18)' : data.lockoutRiskLevel === 'high' ? 'High Risk of Commercial Tenancy Default & Forfeiture' : 'Commercial Tenancy Audit Complete');
  const desc = el('p', `Premises: ${data.premisesAddress} · Gross Monthly Rent: $${data.financialOverview.grossMonthlyRentCad.toLocaleString()} CAD ($${data.grossRentPerSqFtCad}/sq ft/yr)`);
  banner.append(title, desc);
  card.append(banner);

  // Key metrics
  const grid = el('div', undefined, 'u-stat-grid u-mt-100');
  const s1 = el('div', undefined, 'stat-card');
  s1.append(el('span', 'Personal Guarantee Exposure', 'stat-label'));
  s1.append(el('strong', `$${data.personalGuaranteeLiability.personalGuaranteeExposureCad.toLocaleString()} CAD`, 'stat-value font-bold'));
  s1.append(el('span', `${data.personalGuaranteeLiability.remainingMonths} months remaining`, 'stat-sub'));

  const s2 = el('div', undefined, 'stat-card');
  s2.append(el('span', 'Annual Gross Rent', 'stat-label'));
  s2.append(el('strong', `$${data.financialOverview.annualGrossRentCad.toLocaleString()} CAD`, 'stat-value font-bold'));
  s2.append(el('span', `Base $${data.financialOverview.baseRentMonthlyCad} + TMI $${data.financialOverview.additionalRentMonthlyCad}/mo`, 'stat-sub'));

  const s3 = el('div', undefined, 'stat-card');
  s3.append(el('span', 'Disputed TMI / CAM', 'stat-label'));
  s3.append(el('strong', `$${data.tmiAuditStrategy.disputedAmountCad.toLocaleString()} CAD`, 'stat-value font-bold'));
  s3.append(el('span', 'Subject to formal audit demand', 'stat-sub'));

  grid.append(s1, s2, s3);
  card.append(grid);

  // Statutory risks
  if (data.statutoryRisks && data.statutoryRisks.length > 0) {
    const risksBox = el('div', undefined, 'u-sunken-box u-mt-100');
    risksBox.append(el('strong', 'Statutory Covenants & Enforcement Risks:', 'u-section-label'));
    data.statutoryRisks.forEach(r => {
      const rEl = el('div', undefined, 'u-mt-050');
      rEl.append(el('strong', `• ${r.title}: `));
      rEl.append(el('span', r.message));
      risksBox.append(rEl);
    });
    card.append(risksBox);
  }

  // Distraint Doctrine & Assignment Rights
  const legalBox = el('div', undefined, 'u-sunken-box u-mt-100');
  legalBox.append(el('strong', 'Commercial Distress (Goods Seizure) & Assignment Rights:', 'u-section-label'));
  const dEl = el('div', undefined, 'u-mt-050');
  dEl.append(el('strong', 'Commercial Distraint Rule: '));
  dEl.append(el('span', `${data.distraintDoctrine.criticalRule} (${data.distraintDoctrine.tenantGoodsRights})`));
  legalBox.append(dEl);

  const aEl = el('div', undefined, 'u-mt-050');
  aEl.append(el('strong', 'Assignment / Sublet Rights: '));
  aEl.append(el('span', `${data.assignmentRights.statutoryGuidance} Court Remedy: ${data.assignmentRights.courtRemedy}`));
  legalBox.append(aEl);
  card.append(legalBox);

  // TMI Audit Actions
  const tmiBox = el('div', undefined, 'u-sunken-box u-mt-100');
  tmiBox.append(el('strong', 'Recommended TMI / Operating Expense Audit Steps:', 'u-section-label'));
  data.tmiAuditStrategy.recommendedActions.forEach((act, idx) => {
    const actEl = el('div', undefined, 'u-mt-050');
    actEl.append(el('span', `${idx + 1}. ${act}`));
    tmiBox.append(actEl);
  });
  card.append(tmiBox);

  // Formal Pre-litigation Demand Notice
  const docContainer = el('div', undefined, 'u-mt-100');
  docContainer.append(el('strong', 'Pre-Litigation Notice of Commercial Dispute & TMI Audit Demand:', 'u-section-label'));
  const pre = el('pre', data.commercialDemandLetter, 'u-sunken-box u-mt-050');
  docContainer.append(pre);

  const copyBtn = el('button', 'Copy Commercial Dispute Notice to Clipboard 📋', 'secondary u-mt-050');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(data.commercialDemandLetter).then(() => {
      copyBtn.textContent = 'Copied to Clipboard! ✓';
      setTimeout(() => { copyBtn.textContent = 'Copy Commercial Dispute Notice to Clipboard 📋'; }, 2500);
    }).catch(() => {});
  });
  docContainer.append(copyBtn);
  card.append(docContainer);

  container.append(card);
}

// Employment Reference Letter & Foreign Experience Verification Audit
export function renderRealEstateAssignmentAssessment(data, container) {
  if (!data || !container) return;
  const { financialSummary, antiFlippingAudit, taxLiabilityEstimate, tarionWarranty, taxNotes, riskWarnings } = data;

  const isFlipped = antiFlippingAudit?.antiFlippingApplies;
  const badgeClass = isFlipped ? 'warning' : 'success';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${isFlipped ? 'ANTI-FLIPPING APPLIES (100% BUSINESS INCOME)' : 'CAPITAL GAINS / EXEMPT'}</span>
        <span class="muted">Days Held: ${antiFlippingAudit?.daysHeld ?? 0}</span>
      </div>
      <h4 class="u-mt-50">Net Assignment Profit: $${financialSummary?.netAssignmentProfitCad?.toLocaleString() ?? 0} CAD</h4>
      <p class="u-text-sm">${antiFlippingAudit?.exemptionReason ?? 'Standard tax treatment applies.'}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Gross Lift</span>
        <span class="metric-value">$${financialSummary?.grossAssignmentLiftCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Deposit Returned</span>
        <span class="metric-value">$${financialSummary?.depositReimbursementCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Income Tax Est.</span>
        <span class="metric-value">$${taxLiabilityEstimate?.estimatedIncomeTaxCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">GST/HST on Lift</span>
        <span class="metric-value">$${taxLiabilityEstimate?.estimatedGstHstOnLiftCad?.toLocaleString() ?? 0}</span>
      </div>
    </div>
  `;

  if (tarionWarranty?.isTarionEnrolled) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Tarion Delayed Closing Warranty (Ontario)</h5>
        <p class="u-text-sm">Days Delayed: <strong>${tarionWarranty?.closingDelayedDays ?? 0}</strong> | Daily Rate: $${tarionWarranty?.dailyCompensationRateCad} | Compensation Credit: <strong>$${tarionWarranty?.estimatedDelayCompensationCad?.toLocaleString()} CAD</strong> (Capped at $7,500)</p>
      </div>
    `;
  }

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box warning u-mt-100">
        <h5>Statutory Warnings &amp; Builder Clearances</h5>
        <ul>
          ${riskWarnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (taxNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>CRA Tax Folio Guidance</h5>
        <ul>
          ${taxNotes.map(n => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderSpeculationTaxAssessment(data, container) {
  const {
    province,
    propertyValuationCad,
    isTaxExempt,
    applicableExemption,
    taxRatePercent,
    grossTaxPayableCad,
    netTaxPayableCad,
    ontarioNrstRebate,
    statutoryNotes,
    riskWarnings,
    actionPlan
  } = data;

  const statusClass = isTaxExempt || ontarioNrstRebate?.isNrstRebateEligible ? 'success' : 'warning';
  const statusTitle = province === 'BC'
    ? (isTaxExempt ? 'Statutory SVT Exemption Qualified' : `Speculation Tax Payable (${taxRatePercent}% Rate)`)
    : (ontarioNrstRebate?.isNrstRebateEligible ? 'Ontario NRST 25% Rebate Approved' : 'NRST Payable / Rebate Ineligible');

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${statusTitle}</h4>
      <p><strong>Province:</strong> ${province} | <strong>Valuation:</strong> ${propertyValuationCad?.toLocaleString()} CAD | <strong>Net Tax Payable:</strong> ${netTaxPayableCad?.toLocaleString()} CAD</p>
      ${applicableExemption ? `<p><strong>Exemption / Category:</strong> ${applicableExemption}</p>` : ''}
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${taxRatePercent}%</span>
        <span class="stat-lbl">Statutory Tax Rate</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${grossTaxPayableCad?.toLocaleString()} CAD</span>
        <span class="stat-lbl">Gross Tax Calculated</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${(ontarioNrstRebate?.nrstRebateAmountCad || 0).toLocaleString()} CAD</span>
        <span class="stat-lbl">NRST Rebate Claimable</span>
      </div>
    </div>
  `;

  if (province === 'ON' && ontarioNrstRebate) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Ontario Non-Resident Speculation Tax (NRST) Rebate Audit</h5>
        <p>${ontarioNrstRebate.nrstRebateReason}</p>
        <p class="u-text-sm muted">Statutory Limits: PR acquired within ${ontarioNrstRebate.prAcquisitionWindowDays} days of closing; rebate filed within ${ontarioNrstRebate.claimLimitationDays} days of PR status.</p>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Action Plan</h5>
        <ol>${actionPlan.map(a => `<li>${a}</li>`).join('')}</ol>
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
        <h5>Governing Legislation</h5>
        <ul>${statutoryNotes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 56. CHILD WELFARE & GUARDIANSHIP ENGINE
// ==========================================

export function renderBcStrataBylawAssessment(data, container) {
  const {
    residentName,
    strataPlanNumber,
    unitNumber,
    disputeType,
    summaryTitle,
    isBylawEnforceable,
    unlawfulFineRefundCad,
    violations,
    statutoryProtections,
    riskWarnings,
    actionPlan,
    statutoryBasis
  } = data;

  const statusClass = violations?.length === 0 ? 'success' : 'error';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Resident:</strong> ${escapeHtml(residentName)} | <strong>Strata Plan:</strong> ${escapeHtml(strataPlanNumber)} (Unit ${escapeHtml(unitNumber)}) | <strong>Dispute:</strong> ${escapeHtml(disputeType.replace('_', ' '))}</p>
      <p class="u-text-sm muted">${statutoryBasis}</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${isBylawEnforceable ? 'Enforceable' : 'Void / Unenforceable'}</span>
        <span class="stat-lbl">Strata Bylaw Enforceability</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${unlawfulFineRefundCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Unlawful Fine Refund Owed</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">$125 CAD</span>
        <span class="stat-lbl">Civil Resolution Tribunal (CRT) Filing Fee</span>
      </div>
    </div>
  `;

  if (violations?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Strata Council Statutory Violations</h5>
        <ul>${violations.map(v => `<li>${v}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (statutoryProtections?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Resident Legal Rights (Bill 44)</h5>
        <ul>${statutoryProtections.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Bylaw Warnings</h5>
        <ul>${riskWarnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Dispute Escalation &amp; CRT Action Plan</h5>
        <ol>${actionPlan.map(a => `<li>${a}</li>`).join('')}</ol>
      </div>
    `;
  }

  container.innerHTML = html;
}
