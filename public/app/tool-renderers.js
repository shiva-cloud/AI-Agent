// Renderers for calculator and navigator tool results (render*Assessment).
// Split out of public/app.js; app.js imports what it uses from here.
import { $, el, escapeHtml } from './core.js';
import { VERDICT_TEXT } from './data.js';

export function renderCraBenefitsAssessment(data, container) {
  if (!container) return;
  const { annualTotals, cashflowSchedule, requiredForms, strategicNotes, statutoryAuthority, province } = data;

  const fmt = (num) => '$' + Number(num || 0).toLocaleString();

  container.innerHTML = `
    <div class="cra-benefits-results-wrapper" data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-1rem flex-wrap-wrap gap-0_5rem">
        <div>
          <span class="badge" data-s="background-dcfce7 color-15803d padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">🍁 CRA STATUTORY ENTITLEMENT (${province})</span>
          <h3 data-s="margin-0_5rem-0-0_25rem-0 font-size-1_35rem">Total Annual Non-Taxable Credits: ${fmt(annualTotals.totalAnnualGovernmentCredits)}</h3>
          <p class="muted" data-s="margin-0 font-size-0_88rem">${statutoryAuthority}</p>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-1_4rem font-weight-700 color-16a34a">${fmt(cashflowSchedule.totalMonthlyLiquidityCad)}/mo</div>
          <span data-s="font-size-0_8rem color-text-muted-64748b">Direct Deposit Liquidity</span>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="padding-0_75rem border-1px-solid-e2e8f0 border-radius-6px background-bg-elevated-f8fafc">
          <div data-s="font-size-0_75rem font-weight-600 color-64748b">CANADA CHILD BENEFIT (CCB)</div>
          <div data-s="font-size-1_15rem font-weight-700 margin-top-0_2rem">${fmt(annualTotals.ccbAnnual)} / yr</div>
          <div data-s="font-size-0_8rem color-16a34a">${fmt(cashflowSchedule.ccbMonthly)} / month</div>
        </div>
        <div data-s="padding-0_75rem border-1px-solid-e2e8f0 border-radius-6px background-bg-elevated-f8fafc">
          <div data-s="font-size-0_75rem font-weight-600 color-64748b">GST/HST CREDIT (FEDERAL)</div>
          <div data-s="font-size-1_15rem font-weight-700 margin-top-0_2rem">${fmt(annualTotals.gstHstAnnual)} / yr</div>
          <div data-s="font-size-0_8rem color-0284c7">${fmt(cashflowSchedule.gstHstQuarterly)} / quarter</div>
        </div>
        <div data-s="padding-0_75rem border-1px-solid-e2e8f0 border-radius-6px background-bg-elevated-f8fafc">
          <div data-s="font-size-0_75rem font-weight-600 color-64748b">PROVINCIAL CHILD/CARBON (${province})</div>
          <div data-s="font-size-1_15rem font-weight-700 margin-top-0_2rem">${fmt(annualTotals.provincialAnnual)} / yr</div>
          <div data-s="font-size-0_8rem color-16a34a">${fmt(cashflowSchedule.provincialMonthly)} / month</div>
        </div>
      </div>

      <h4 data-s="margin-1_25rem-0-0_5rem-0 font-size-1rem">📋 Forms to file (no earlier tax return needed):</h4>
      <div data-s="display-flex flex-direction-column gap-0_5rem margin-bottom-1_25rem">
        ${requiredForms.map(f => `
          <div data-style="padding:0.75rem;border-left:4px solid #3b82f6;border-radius:4px;background:var(--bg-elevated, #f8fafc);border:1px solid #e2e8f0;">
            <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_25rem">
              <strong data-s="color-1d4ed8 font-size-0_95rem">${f.formCode} — ${f.formTitle}</strong>
              <span class="badge" data-s="font-size-0_75rem background-dbeafe color-1e40af">${f.statutoryBasis}</span>
            </div>
            <p data-s="margin-0_35rem-0-0-0 font-size-0_85rem line-height-1_4">${f.action}</p>
          </div>
        `).join('')}
      </div>

      <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">💡 CRA Strategic Rules &amp; Rights:</h4>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem line-height-1_5">
        ${strategicNotes.map(n => `<li data-s="margin-bottom-0_25rem">${n}</li>`).join('')}
      </ul>
    </div>
  `;
}

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

export function renderChildcareSupportAssessment(data, container) {
  if (!container) return;
  const {
    city,
    immigrationStatus,
    familyNetIncomeCad,
    monthlyCostSummary,
    subsidyAssessment,
    waitlistPortal,
    childrenBreakdown,
    statutoryAdvisories,
    authority
  } = data;

  const fmt = (n) => '$' + Number(n || 0).toLocaleString();
  const isFull = subsidyAssessment.status === 'full_subsidy';
  const isPartial = subsidyAssessment.status === 'partial_subsidy';
  const badgeColor = isFull ? '#065f46' : isPartial ? '#92400e' : '#1e3a8a';
  const badgeBg = isFull ? '#d1fae5' : isPartial ? '#fef3c7' : '#dbeafe';
  const subsidyLabel = isFull ? 'FULL FEE SUBSIDY ($0/mo Parent Fee)' : (isPartial ? 'PARTIAL MUNICIPAL SUBSIDY' : 'CWELCC $22/DAY CAP ONLY');

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span class="badge" data-style="background:${badgeBg};color:${badgeColor};font-weight:700;padding:0.25rem 0.6rem;border-radius:4px;font-size:0.82rem;">${subsidyLabel}</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">Child Care Support &amp; CWELCC Diagnostic (${city})</h3>
          <span data-s="font-size-0_83rem color-text-muted">Status: <strong>${immigrationStatus.toUpperCase()}</strong> | Net Income: <strong>${fmt(familyNetIncomeCad)}/yr</strong></span>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">Save ${fmt(monthlyCostSummary.totalMonthlySavingsCad)}/mo</div>
          <span data-s="font-size-0_8rem color-text-muted">Total Monthly Family Savings</span>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Unsubsidized Market</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">${fmt(monthlyCostSummary.unsubsidizedMarketMonthlyTotalCad)}<span data-s="font-size-0_8rem font-weight-normal">/mo</span></div>
          <div class="muted" data-s="font-size-0_75rem">Private unregulated benchmark</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">CWELCC Universal Cap</div>
          <div data-s="font-size-1_3rem font-weight-700 color-primary-0284c7">${fmt(monthlyCostSummary.cwelccUniversalCapMonthlyTotalCad)}<span data-s="font-size-0_8rem font-weight-normal">/mo</span></div>
          <div class="muted" data-s="font-size-0_75rem">$22/day statutory ceiling</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Estimated Parent Fee</div>
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">${fmt(monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad)}<span data-s="font-size-0_8rem font-weight-normal">/mo</span></div>
          <div class="muted" data-s="font-size-0_75rem">After municipal subsidy</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Monthly Subsidy Benefit</div>
          <div data-s="font-size-1_3rem font-weight-700 color-0ea5e9">${fmt(subsidyAssessment.estimatedMonthlySubsidyCad)}<span data-s="font-size-0_8rem font-weight-normal">/mo</span></div>
          <div class="muted" data-s="font-size-0_75rem">${subsidyAssessment.administeredBy}</div>
        </div>
      </div>

      <div data-s="background-rgba-14-165-233-0_08 border-1px-solid-rgba-14-165-233-0_25 border-radius-6px padding-0_85rem margin-bottom-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-0_4rem">
          <strong data-s="color-text font-size-0_95rem">🏛️ Centralized Waitlist: ${waitlistPortal.name}</strong>
          <a href="${waitlistPortal.url}" target="_blank" rel="noopener" class="primary" data-s="display-inline-block padding-0_35rem-0_75rem font-size-0_8rem text-decoration-none border-radius-4px background-primary-0284c7 color-fff">Open Official Portal ↗</a>
        </div>
        <p data-s="margin-0 font-size-0_85rem color-text-muted">${waitlistPortal.recommendedAction}</p>
      </div>

      <div data-s="margin-bottom-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">👶 Child Placement &amp; Daily Cap Breakdown:</h4>
        ${childrenBreakdown.map(c => `
          <div data-s="background-bg-elevated-f8fafc-2 border-1px-solid-border border-radius-6px padding-0_65rem-0_85rem margin-bottom-0_5rem font-size-0_85rem display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
            <div>
              <strong>Child ${c.childIndex}: ${c.ageGroup}</strong>
              <div class="muted" data-s="font-size-0_8rem">Market Rate: ${fmt(c.marketRateMonthlyCad)}/mo | CWELCC Statutory Cap: $${c.cwelccDailyFeeCad}/day (${fmt(c.cwelccCappedMonthlyCad)}/mo)</div>
            </div>
            <div data-s="text-align-right">
              <span data-s="color-10b981 font-weight-600">Save ${fmt(c.cwelccMonthlySavingsCad)}/mo</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div data-s="margin-bottom-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">⚖️ Your rights, and what to know before you land:</h4>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text-muted line-height-1_45">
          ${statutoryAdvisories.map(a => `<li data-s="margin-bottom-0_35rem">${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>

      <div class="muted" data-s="font-size-0_75rem border-top-1px-solid-border padding-top-0_5rem">
        Statutory Authority: ${authority}
      </div>
    </div>
  `;
}

export function renderCustomsDeclarationAssessment(data, container) {
  if (!container) return;
  const {
    settlerStatus,
    tariffClassification,
    financialAudit,
    currencyCompliance,
    jewelryAudit,
    prohibitedItemsAlert,
    vehicleAudit,
    bsf186Manifest,
    statutoryAdvisories,
    statutoryAuthority
  } = data;

  const fmt = (n) => '$' + Number(n || 0).toLocaleString();

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span class="badge" data-s="background-dbeafe color-1e3a8a font-weight-700 padding-0_25rem-0_6rem border-radius-4px font-size-0_82rem">${tariffClassification.code} - ${tariffClassification.title.toUpperCase()}</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">CBSA Port-of-Entry Customs Assessment</h3>
          <span data-s="font-size-0_83rem color-text-muted">${tariffClassification.statute} | ${tariffClassification.memorandum}</span>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">Save ~${fmt(financialAudit.estimatedDutyAndTaxSavingsCad)} CAD</div>
          <span data-s="font-size-0_8rem color-text-muted">Estimated Duty &amp; Tax Saved</span>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Total Declared Value</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">${fmt(financialAudit.totalDeclaredValueCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">Accompanying + Cargo</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Duty-Exempt Settler Cargo</div>
          <div data-s="font-size-1_3rem font-weight-700 color-primary-0284c7">${fmt(financialAudit.dutyExemptValueCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">Owned 6+ months abroad</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Taxable Excess Portion</div>
          <div data-style="font-size:1.3rem;font-weight:700;color:${financialAudit.taxableExcessValueCad > 0 ? '#dc2626' : '#10b981'};">${fmt(financialAudit.taxableExcessValueCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">${financialAudit.taxableExcessValueCad > 0 ? 'Assessed import duty/GST' : 'Zero taxable excess'}</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Cash / Monetary Total</div>
          <div data-style="font-size:1.3rem;font-weight:700;color:${currencyCompliance.isDeclarationMandatory ? '#b45309' : 'var(--text)'};">${fmt(currencyCompliance.amountCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">${currencyCompliance.isDeclarationMandatory ? 'Form E677 Mandatory' : 'Below $10k threshold'}</div>
        </div>
      </div>

      ${currencyCompliance.isDeclarationMandatory ? `
        <div data-s="background-fffbeb border-1px-solid-fde68a border-left-4px-solid-f59e0b border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_86rem line-height-1_45">
          <strong data-s="color-b45309">⚠️ Cash of CAD 10,000 or more must be declared:</strong><br>
          Carrying $10,000+ CAD is completely legal with zero customs tax. However, you <strong>MUST</strong> declare it on <strong>${currencyCompliance.mandatoryForm}</strong> upon arrival.
          <span data-s="display-inline-block margin-top-0_35rem color-78350f">${currencyCompliance.complianceNote}</span>
        </div>
      ` : ''}

      ${jewelryAudit.requiresAppraisalPhoto ? `
        <div data-s="background-eff6ff border-1px-solid-bfdbfe border-left-4px-solid-3b82f6 border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_86rem line-height-1_45">
          <strong data-s="color-1e40af">💎 JEWELRY &amp; HIGH-VALUE PRECIOUS ITEMS (CBSA D2-2-1 para 14):</strong><br>
          ${jewelryAudit.statutoryInstructions}
        </div>
      ` : ''}

      ${vehicleAudit ? `
        <div data-s="background-bg-elevated-f8fafc-2 border-1px-solid-border border-left-4px-solid-primary-0284c7 border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_86rem">
          <strong data-s="color-text">🚗 Vehicle import check: ${escapeHtml(vehicleAudit.makeModel)} (${escapeHtml(vehicleAudit.year)})</strong><br>
          Value: <strong>${fmt(vehicleAudit.valueCad)} CAD</strong> | Exempt: <strong>${fmt(vehicleAudit.exemptPortionCad)} CAD</strong> | Taxable Excess: <strong>${fmt(vehicleAudit.taxableExcessCad)} CAD</strong><br>
          <span class="muted" data-s="font-size-0_8rem display-inline-block margin-top-0_35rem">${vehicleAudit.rivExemption} Air Conditioning Excise Tax: $${vehicleAudit.airConditioningExciseTaxCad} CAD.</span>
        </div>
      ` : ''}

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-1rem margin-bottom-1_25rem">
        <div>
          <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">✈️ Form BSF186 (Goods Accompanying - ${bsf186Manifest.accompanyingCount} items):</h4>
          <div data-s="display-flex flex-direction-column gap-0_4rem">
            ${bsf186Manifest.accompanyingGoods.map(g => `
              <div data-s="padding-0_5rem-0_75rem background-bg-elevated-f8fafc-2 border-1px-solid-border border-radius-4px font-size-0_83rem display-flex justify-content-space-between align-items-center">
                <div>
                  <strong>#${g.itemNo} ${g.description}</strong>
                  ${g.serialNumber ? `<div class="muted" data-s="font-size-0_75rem">SN: ${g.serialNumber}</div>` : ''}
                </div>
                <strong>${fmt(g.valueCad)}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">📦 Form BSF186A (Goods to Follow Cargo - ${bsf186Manifest.goodsToFollowCount} items):</h4>
          <div data-s="display-flex flex-direction-column gap-0_4rem">
            ${bsf186Manifest.goodsToFollow.map(g => `
              <div data-s="padding-0_5rem-0_75rem background-bg-elevated-f8fafc-2 border-1px-solid-border border-radius-4px font-size-0_83rem display-flex justify-content-space-between align-items-center">
                <div>
                  <strong>#${g.itemNo} ${g.description}</strong>
                  <div class="muted" data-s="font-size-0_75rem">Owned ${g.ownedMonths} mos abroad</div>
                </div>
                <strong>${fmt(g.valueCad)}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div data-s="margin-bottom-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">📋 Port-of-Entry BSO Endorsement Protocol:</h4>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text-muted line-height-1_45">
          ${bsf186Manifest.portOfEntryChecklist.map(s => `<li data-s="margin-bottom-0_35rem">${s}</li>`).join('')}
        </ol>
      </div>

      <div class="muted" data-s="font-size-0_75rem border-top-1px-solid-border padding-top-0_5rem">
        Statutory Authority: ${statutoryAuthority}
      </div>
    </div>
  `;
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

export function renderBankingComparatorAssessment(data, container) {
  if (!container) return;
  const {
    selectedBank,
    monthlySpendingCad,
    targetCreditScore,
    packagesComparison,
    bankActStatutoryRights,
    creditBureauFactors,
    utilizationOptimization,
    twelveMonthRoadmap,
    statutoryAdvisories,
    authority
  } = data;

  const fmt = (n) => '$' + Number(n || 0).toLocaleString();

  container.innerHTML = `
    <div data-s="border-1px-solid-border border-radius-8px padding-1_25rem background-bg-card-fff">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span class="badge" data-s="background-dbeafe color-1e3a8a font-weight-700 padding-0_25rem-0_6rem border-radius-4px font-size-0_82rem">YOUR RIGHTS UNDER THE BANK ACT (S.627.17)</span>
          <h3 data-s="margin-0_5rem-0-0_2rem-0 font-size-1_25rem">Big 5 Newcomer Banking &amp; 720+ Credit Architecture</h3>
          <span data-s="font-size-0_83rem color-text-muted">${authority}</span>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">Target ${targetCreditScore}+</div>
          <span data-s="font-size-0_8rem color-text-muted">Tier-1 Prime Qualification</span>
        </div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-180 gap-0_75rem margin-bottom-1_25rem">
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Recommended Limit</div>
          <div data-s="font-size-1_3rem font-weight-700 color-primary-0284c7">${fmt(utilizationOptimization.recommendedCreditLimitCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">For ${fmt(monthlySpendingCad)}/mo spend</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Statement Target</div>
          <div data-s="font-size-1_3rem font-weight-700 color-10b981">${fmt(utilizationOptimization.optimalReportedStatementBalanceCad)} CAD</div>
          <div class="muted" data-s="font-size-0_75rem">10% optimal bureau ratio</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">Initial Score Timeline</div>
          <div data-s="font-size-1_3rem font-weight-700 color-text">Month 3 (~650)</div>
          <div class="muted" data-s="font-size-0_75rem">First score generated</div>
        </div>
        <div data-s="background-bg-elevated-f8fafc padding-0_75rem border-radius-6px border-1px-solid-border">
          <div class="muted" data-s="font-size-0_75rem text-transform-uppercase">A-Lender Prime Tier</div>
          <div data-s="font-size-1_3rem font-weight-700 color-0ea5e9">Month 12 (750+)</div>
          <div class="muted" data-s="font-size-0_75rem">Mortgage &amp; auto prime</div>
        </div>
      </div>

      <div data-s="margin-bottom-1_25rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">🏛️ Big 5 Newcomer Packages Comparison (All Free for 12–24 Mos):</h4>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-240 gap-0_75rem">
          ${packagesComparison.map(p => `
            <div data-s="padding-0_85rem background-bg-elevated-f8fafc-2 border-1px-solid-border border-radius-6px display-flex flex-direction-column justify-content-space-between">
              <div>
                <div data-s="display-flex justify-content-space-between align-items-center">
                  <strong data-s="font-size-1rem color-text">${p.bankName}</strong>
                  <span class="badge" data-s="background-d1fae5 color-065f46 font-size-0_75rem padding-0_2rem-0_5rem">Save ~${fmt(p.totalBenefitValueCad)}</span>
                </div>
                <div class="muted" data-s="font-size-0_8rem margin-bottom-0_5rem">${p.programName} (${p.monthlyFeeWaivedMonths} mos fee-free)</div>
                <div data-s="font-size-0_82rem margin-bottom-0_35rem"><strong>Card Limit:</strong> Up to ${fmt(p.unsecuredCreditLimitCad)} (Zero credit history required)</div>
                <div data-s="font-size-0_82rem margin-bottom-0_35rem"><strong>Card:</strong> ${p.creditCardName}</div>
                <div data-s="font-size-0_82rem margin-bottom-0_5rem color-text-muted">${p.internationalTransfers}</div>
              </div>
              <ul data-s="margin-0 padding-left-1_1rem font-size-0_78rem color-text-muted">
                ${p.specialFeatures.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div data-s="background-eff6ff border-1px-solid-bfdbfe border-left-4px-solid-3b82f6 border-radius-4px padding-0_85rem margin-bottom-1rem font-size-0_86rem line-height-1_45">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_4rem">
          <strong data-s="color-1e40af">🛡️ Bank Act Section 627.17 Legal Right Notice:</strong>
          <button type="button" class="sos-copy-btn" id="bank-rights-copy-btn" data-s="padding-0_2rem-0_5rem font-size-0_75rem">Copy Script 📋</button>
        </div>
        <p data-s="margin-0-0-0_4rem-0 color-text">${bankActStatutoryRights.coreRight}</p>
        <textarea id="bank-rights-script-text" readonly rows="4" data-s="width-100pc border-radius-4px border-1px-solid-border padding-0_5rem font-family-monospace font-size-0_78rem background-bg-card color-text">${bankActStatutoryRights.tellerDisputeNotice}</textarea>
      </div>

      <div data-s="margin-bottom-1_25rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">📈 12-Month Score Booster Roadmap to 750+ (Month-by-Month):</h4>
        <div data-s="display-flex flex-direction-column gap-0_5rem">
          ${twelveMonthRoadmap.map(r => `
            <div data-style="padding:0.75rem;background:var(--bg-elevated,#f8fafc);border:1px solid var(--border);border-left:4px solid ${r.targetScore >= 720 ? '#10b981' : '#0284c7'};border-radius:4px;font-size:0.84rem;">
              <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_25rem">
                <strong>Month ${r.month}: ${r.milestone}</strong>
                <span class="badge" data-s="background-e0f2fe color-0369a1 font-weight-600 font-size-0_75rem">${r.targetScore > 0 ? `Target: ${r.targetScore} (${r.phase})` : r.phase}</span>
              </div>
              <ul data-s="margin-0_35rem-0-0-0 padding-left-1_15rem font-size-0_8rem color-text-muted">
                ${r.actions.map(act => `<li data-s="margin-bottom-0_2rem">${act}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div data-s="margin-bottom-1rem">
        <h4 data-s="margin-0-0-0_5rem-0 font-size-0_95rem">💡 Statement Date vs Due Date Secret &amp; Advisories:</h4>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text-muted line-height-1_45">
          ${statutoryAdvisories.map(a => `<li data-s="margin-bottom-0_35rem">${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>

      <div class="muted" data-s="font-size-0_75rem border-top-1px-solid-border padding-top-0_5rem">
        Statutory Authority: ${authority}
      </div>
    </div>
  `;

  const copyBtn = $('#bank-rights-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const txt = $('#bank-rights-script-text')?.value;
      if (txt) {
        navigator.clipboard?.writeText(txt).then(() => {
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy Script 📋'; }, 2000);
        });
      }
    });
  }
}

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

export function renderVehicleImportAssessment(data, container) {
  const verdict = data.admissibilityVerdict;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (verdict === 'ADMISSIBLE_RIV_REQUIRED') {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ ADMISSIBLE (RIV REQUIRED)</span>';
    statusColor = '#10b981';
  } else if (verdict === 'ADMISSIBLE_15_YEAR_EXEMPT') {
    statusBadge = '<span data-s="background-rgba-2-132-199-0_15 color-0284c7 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ 15-YEAR EXEMPT (NO RIV FEE)</span>';
    statusColor = '#0284c7';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ Risk of refusal</span>';
    statusColor = '#dc2626';
  }

  const tax = data.costAndTaxAudit;
  const cbp = data.usCbpExportRequirements;

  let defectsHtml = '';
  if (data.statutoryDefects && data.statutoryDefects.length > 0) {
    defectsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 STATUTORY IMPORT DEFECTS (${data.statutoryDefects.length})</h4>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryDefects.map(d => `
            <li>
              <strong>${escapeHtml(d.defect)}</strong><br>
              <span class="muted" data-s="font-size-0_78rem">Statute: ${escapeHtml(d.statute)}</span><br>
              <span data-s="color-dc2626 font-size-0_78rem">Legal Consequence: ${escapeHtml(d.legalRemedy)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let modHtml = '';
  if (data.requiredModifications && data.requiredModifications.length > 0) {
    modHtml = `
      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_35rem">CHANGES NEEDED TO MEET CANADIAN SAFETY RULES (RIV FORM 2):</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_25rem">
          ${data.requiredModifications.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let cbpExportHtml = '';
  if (cbp.isMandatory) {
    cbpExportHtml = `
      <div data-s="margin-top-1rem background-rgba-245-158-11-0_08 border-1px-solid-rgba-245-158-11-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_25rem-0 color-f59e0b font-size-0_92rem">🛑 US export filing: give US Customs the vehicle title at least 72 hours before you cross</h4>
        <p data-s="margin-0-0-0_5rem-0 font-size-0_82rem">${escapeHtml(cbp.borderWarning)}</p>
        <div data-s="font-weight-600 font-size-0_8rem margin-bottom-0_25rem">Required Advance Filing Steps:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_2rem">
          ${cbp.mandatoryDocuments.map(doc => `<li>${escapeHtml(doc)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">TRANSPORT CANADA / CBSA ADMISSIBILITY VERDICT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">VEHICLE AGE &amp; ORIGIN</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${data.vehicleModelYear} (${data.vehicleAgeYears} yrs old)
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Origin: ${data.countryOfOrigin} | ${data.is15YearsOrOlder ? '15+ yr Rule Exempt' : 'Under 15-yr Threshold'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">DUTY &amp; GST STATUS (TARIFF 9807)</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${tax.isSettlerTariffExempt ? '#10b981' : '#dc2626'};">
            ${tax.isSettlerTariffExempt ? '0% (Settler Duty-Free)' : `$${(tax.customsDutyCad + tax.gstCad).toLocaleString()} CAD`}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            ${tax.statutoryExemptionBasis}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">FEDERAL BORDER TAXES PAYABLE</div>
          <div data-style="font-size:1.15rem;font-weight:700;margin-top:0.25rem;color:${tax.totalFederalBorderPayableCad > 0 ? '#f59e0b' : '#10b981'};">
            $${tax.totalFederalBorderPayableCad.toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            RIV ($${tax.rivFeeCad}) + A/C ($${tax.acExciseTaxCad}) + Green Levy ($${tax.greenLevyCad})
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PROVINCIAL REGISTRATION</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            Form 1 &amp; Safety Cert
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Required within 45 days of border crossing
          </div>
        </div>
      </div>

      ${defectsHtml}
      ${cbpExportHtml}
      ${modHtml}

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">POST-IMPORT PROVINCIAL LICENSING ROADMAP:</div>
        <ol data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.provincialRegistrationRoadmap.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      </div>

      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW ABOUT IMPORTING A VEHICLE:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
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

export function renderPetImportAssessment(data, container) {
  const isAdmissible = data.isImportAdmissible;
  let statusBadge = '';
  let statusColor = '#10b981';

  if (isAdmissible) {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ Likely admissible</span>';
    statusColor = '#10b981';
  } else {
    statusBadge = '<span data-s="background-rgba-220-38-38-0_15 color-dc2626 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ Risk of refusal</span>';
    statusColor = '#dc2626';
  }

  const fin = data.borderFinancials;
  const chk = data.complianceChecklist;

  let violationsHtml = '';
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    violationsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 STATUTORY IMPORT BARRIERS IDENTIFIED (${data.statutoryViolations.length})</h4>
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

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">CFIA &amp; CBSA ANIMAL ADMISSIBILITY VERDICT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">SPECIES AND BREED CHECK</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${escapeHtml(data.animalType)} (${escapeHtml(data.dogBreed)})
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${chk.isOntarioBslCompliant ? '#10b981' : '#dc2626'};">
            ${chk.isOntarioBslCompliant ? '✓ Ontario DOLA Compliant' : '✗ Banned Pit Bull Breed in ON'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">ORIGIN &amp; RABIES PROTOCOL</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${data.isHighRiskRabiesCountry ? '#f59e0b' : 'var(--text)'};">
            ${data.countryOfOrigin} (${data.isHighRiskRabiesCountry ? 'High-Risk Origin' : 'Low-Risk / Free'})
          </div>
          <div data-style="font-size:0.8rem;margin-top:0.2rem;color:${chk.isFavnTiterCompliant ? '#10b981' : '#dc2626'};">
            ${chk.isFavnTiterCompliant ? '✓ FAVN Titer & Rabies Compliant' : '✗ Missing / Sub-Threshold Titer'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">CBSA &amp; CFIA BORDER FEES</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${fin.totalBorderPayableCad.toFixed(2)} CAD
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Tariff 9807 Duty/GST: $0.00 | Inspection: ${fin.cfiaInspectionFeeCad.toFixed(2)}
          </div>
        </div>
      </div>

      ${violationsHtml}

      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW WHEN TRAVELLING WITH A PET:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderIdentityHarmonizationAssessment(data, container) {
  const isOk = data.resolutionVerdict === 'STATUTORY_REMEDY_AVAILABLE';
  let statusBadge = '';
  let statusColor = '#10b981';

  if (isOk) {
    statusBadge = '<span data-s="background-rgba-16-185-129-0_15 color-10b981 padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">✓ REMEDY AVAILABLE</span>';
    statusColor = '#10b981';
  } else {
    statusBadge = '<span data-s="background-rgba-245-158-11-0_15 color-f59e0b padding-0_25rem-0_6rem border-radius-4px font-weight-700 font-size-0_85rem">⚠️ CONDITIONAL ACTION REQUIRED</span>';
    statusColor = '#f59e0b';
  }

  let violationsHtml = '';
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    violationsHtml = `
      <div data-s="margin-top-1rem background-rgba-220-38-38-0_08 border-1px-solid-rgba-220-38-38-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_35rem-0 color-dc2626 font-size-0_92rem">🚨 STATUTORY IDENTITY RESTRICTIONS IDENTIFIED (${data.statutoryViolations.length})</h4>
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

  let actionsHtml = '';
  if (data.actionChecklist && data.actionChecklist.length > 0) {
    actionsHtml = `
      <div data-s="margin-top-1rem background-rgba-2-132-199-0_08 border-1px-solid-rgba-2-132-199-0_3 border-radius-8px padding-0_85rem">
        <h4 data-s="margin-0-0-0_4rem-0 color-0284c7 font-size-0_92rem">📋 What to do now</h4>
        <ol data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text display-flex flex-direction-column gap-0_35rem">
          ${data.actionChecklist.map(a => `
            <li>
              <strong data-s="color-0284c7">[${escapeHtml(a.targetAgency)}]</strong><br>
              <span>${escapeHtml(a.action)}</span>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
  }

  let cascadeHtml = '';
  if (data.governmentCascadeRoadmap && data.governmentCascadeRoadmap.length > 0) {
    cascadeHtml = `
      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">SEQUENTIAL GOVERNMENT CASCADE UPDATE ROADMAP:</div>
        <div data-s="display-flex flex-direction-column gap-0_5rem font-size-0_82rem">
          ${data.governmentCascadeRoadmap.map(s => `
            <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-0_5rem-0_75rem">
              <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap">
                <strong data-s="color-text">Stage ${s.stage}: ${escapeHtml(s.agency)}</strong>
                <span class="muted" data-s="font-size-0_75rem">Timeframe: ${escapeHtml(s.timeframe)}</span>
              </div>
              <div data-s="font-size-0_8rem color-0284c7 margin-top-0_15rem">Issued: ${escapeHtml(s.docIssued)}</div>
              <div class="muted" data-s="font-size-0_75rem margin-top-0_2rem">${escapeHtml(s.notes)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="border-top-1px-solid-border padding-top-1_25rem margin-top-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_75rem margin-bottom-1rem">
        <div>
          <span data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">CANADIAN IDENTITY HARMONIZATION VERDICT</span>
          <h3 data-style="margin:0.2rem 0 0 0;font-size:1.15rem;color:${statusColor};">${escapeHtml(data.summaryHeadline)}</h3>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PROVINCIAL NAME CHANGE</div>
          <div data-style="font-size:1.1rem;font-weight:700;margin-top:0.25rem;color:${data.isProvincialNameChangeEligible ? '#10b981' : '#f59e0b'};">
            ${data.isProvincialNameChangeEligible ? '✓ Statutorily Eligible' : '✗ Ineligible at Present'}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Fee: ${data.provincialFeeCad} CAD | ${data.requiresRcmpFingerprinting ? 'RCMP Fingerprints Required' : 'No Fingerprinting (ON)'}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">PROVINCIAL RESIDENCY PERIOD</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${data.monthsLivedInProvince} / ${data.minResidencyMonthsRequired} Months
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Statute: ${escapeHtml(data.provincialStatute)}
          </div>
        </div>

        <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_78rem color-text-muted">CURRENT STATUS IN CANADA</div>
          <div data-s="font-size-1_1rem font-weight-700 margin-top-0_25rem">
            ${escapeHtml(data.currentStatusInCanada.replace(/_/g, ' '))}
          </div>
          <div data-s="font-size-0_8rem margin-top-0_2rem color-text-muted">
            Discrepancy: ${escapeHtml(data.discrepancyType.replace(/_/g, ' '))}
          </div>
        </div>
      </div>

      ${actionsHtml}
      ${violationsHtml}
      ${cascadeHtml}

      <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderCurrencyExchangeAssessment(data, container) {
  if (!container) return;

  const isNorbertBest = data.bestOption.providerId === 'norberts_gambit';
  const bestColor = isNorbertBest ? 'var(--color-success, #16a34a)' : 'var(--color-primary, #2563eb)';
  const savingsHtml = data.savingsVersusBig5Cad > 0
    ? `<div data-s="display-inline-block background-rgba-22-163-74-0_15 color-16a34a font-weight-700 font-size-0_85rem padding-0_25rem-0_65rem border-radius-4px margin-top-0_35rem">
        Saves ${data.savingsVersusBig5Cad.toLocaleString()} CAD vs Big 5 Bank Markup
       </div>`
    : '';

  // Providers comparison cards
  const providersHtml = data.providerComparisons.map(p => {
    const isBest = p.providerId === data.bestOption.providerId;
    const isBig5 = p.providerId === 'big5_bank';
    const borderStyle = isBest
      ? 'border:2px solid var(--color-success, #16a34a);background:var(--surface-sunken);'
      : isBig5
        ? 'border:1px dashed #ef4444;background:var(--bg-card);'
        : 'border:1px solid var(--border);background:var(--bg-card);';
    const rankBadge = isBest
      ? `<span data-s="background-16a34a color-fff font-size-0_75rem font-weight-700 padding-0_15rem-0_45rem border-radius-4px">#1 RECOMMENDED</span>`
      : isBig5
        ? `<span data-s="background-ef4444 color-fff font-size-0_75rem font-weight-700 padding-0_15rem-0_45rem border-radius-4px">EXPENSIVE (2.75% SPREAD)</span>`
        : `<span data-s="background-border color-text font-size-0_75rem padding-0_15rem-0_45rem border-radius-4px">RANK #${p.recommendationRank}</span>`;

    return `
      <div data-style="border-radius:8px;padding:1rem;${borderStyle};display:flex;flex-direction:column;gap:0.5rem;">
        <div data-s="display-flex justify-content-space-between align-items-flex-start gap-0_5rem">
          <div data-s="font-weight-700 font-size-0_95rem">${escapeHtml(p.providerName)}</div>
          ${rankBadge}
        </div>
        <div data-s="margin-top-0_25rem">
          <div data-style="font-size:1.3rem;font-weight:800;color:${isBig5 ? '#ef4444' : 'var(--text)'};">
            ${p.estimatedReceivedAmount.toLocaleString()} ${escapeHtml(data.corridor.split(' ')[2] || 'CAD')}
          </div>
          <div data-s="font-size-0_8rem color-text-muted">
            Effective Rate: 1 ${escapeHtml(data.corridor.split(' ')[0])} = ${p.effectiveRate} ${escapeHtml(data.corridor.split(' ')[2])}
          </div>
        </div>
        <div data-s="font-size-0_82rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border display-flex flex-direction-column gap-0_2rem">
          <div>Total Fee Drag: <strong>${p.totalFeeDragCad.toLocaleString()} CAD (${p.feeDragPercentage}%)</strong></div>
          <div data-s="color-text-muted font-size-0_75rem">
            FX Spread Drag: ${p.breakdown.spreadCostCad.toLocaleString()} | Fixed Fee: ${p.breakdown.fixedFeesCad} | SWIFT/Intermediary: ${p.breakdown.intermediaryFeesCad}
          </div>
          <div data-s="color-text-muted font-size-0_75rem">
            Speed: ${escapeHtml(p.transferTime)}
          </div>
        </div>
        <div data-s="font-size-0_78rem margin-top-0_25rem">
          <div data-s="font-weight-600 color-16a34a margin-bottom-0_15rem">Pros:</div>
          <ul data-s="margin-0 padding-left-1rem color-text-muted">
            ${p.pros.map(pr => `<li>${escapeHtml(pr)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  // Norbert's Gambit Guide
  let norbertHtml = '';
  if (data.norbertsGambitGuide) {
    const ng = data.norbertsGambitGuide;
    norbertHtml = `
      <div data-s="margin-top-1_25rem background-surface-sunken border-1px-solid-16a34a border-radius-8px padding-1rem">
        <div data-s="display-flex align-items-center gap-0_5rem margin-bottom-0_5rem">
          <span data-s="font-size-1_2rem">📈</span>
          <div data-s="font-weight-700 font-size-0_95rem color-16a34a">
            Norbert's Gambit TSX Spot Execution Blueprint (${escapeHtml(ng.tickerPair)})
          </div>
        </div>
        <p data-s="font-size-0_85rem color-text-muted margin-0-0-0_75rem-0">
          Settlement Cycle: <strong>${escapeHtml(ng.settlementCycle)}</strong>. Converts funds at pure TSX exchange market rate with zero retail spread.
        </p>
        <div data-s="display-flex flex-direction-column gap-0_4rem font-size-0_82rem">
          ${ng.protocolSteps.map(st => `<div data-s="padding-0_4rem-0_6rem background-bg-card border-1px-solid-border border-radius-4px">${escapeHtml(st)}</div>`).join('')}
        </div>
        <div data-s="margin-top-0_75rem background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
          <div data-s="font-weight-600 font-size-0_82rem margin-bottom-0_35rem">Copy-Ready Broker Chat / Message Request:</div>
          <div data-s="font-family-monospace font-size-0_8rem background-surface-sunken padding-0_5rem border-radius-4px border-1px-solid-border word-break-break-word">
            ${escapeHtml(ng.brokerChatTemplate)}
          </div>
        </div>
      </div>
    `;
  }

  // Structuring Risk / FINTRAC Compliance Box
  const struct = data.fintracCompliance.structuringRisk;
  let complianceAlertHtml = '';
  if (struct.hasStructuringRisk) {
    complianceAlertHtml = `
      <div data-s="margin-top-1_25rem background-rgba-239-68-68-0_12 border-2px-solid-ef4444 border-radius-8px padding-1rem">
        <div data-s="font-weight-800 color-ef4444 font-size-0_95rem margin-bottom-0_4rem">
          ⚠️ Do not split transfers to avoid reporting (FINTRAC)
        </div>
        <p data-s="font-size-0_85rem color-text margin-0 line-height-1_4">
          ${escapeHtml(struct.warningMessage)}
        </p>
      </div>
    `;
  } else if (data.fintracCompliance.isReportableFintrac) {
    complianceAlertHtml = `
      <div data-s="margin-top-1_25rem background-rgba-37-99-235-0_08 border-1px-solid-color-primary-2563eb border-radius-8px padding-1rem">
        <div data-s="font-weight-700 color-color-primary-2563eb font-size-0_9rem margin-bottom-0_35rem">
          ℹ️ FINTRAC Reportable Transfer (PCMLTFA s. 12 / SOR/2007-292 s. 95)
        </div>
        <p data-s="font-size-0_83rem color-text-muted margin-0">
          Transfers equal to or exceeding $10,000 CAD equivalent (${data.fintracCompliance.cadEquivalentAmount.toLocaleString()} CAD) are routinely reported to FINTRAC via Electronic Funds Transfer Reports (EFTR). This is a standard regulatory filing that does NOT create tax liabilities or immigration delays for legitimate settlement funds.
        </p>
      </div>
    `;
  }

  // Source-of-funds Checklist
  const docsListHtml = data.fintracCompliance.sourceOfFundsChecklist.map(doc => `
    <div data-s="display-flex justify-content-space-between align-items-center background-bg-card border-1px-solid-border border-radius-6px padding-0_6rem-0_8rem gap-0_75rem">
      <div>
        <div data-s="font-weight-600 font-size-0_85rem">${escapeHtml(doc.document)}</div>
        <div data-s="font-size-0_78rem color-text-muted">${escapeHtml(doc.purpose)}</div>
      </div>
      <span data-style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;${doc.mandatory ? 'background:#ef4444;color:#fff;' : 'background:var(--border);color:var(--text);'}">
        ${doc.mandatory ? 'MANDATORY' : 'RECOMMENDED'}
      </span>
    </div>
  `).join('');

  // Cross-Border Banking Guidance
  let crossBorderHtml = '';
  if (data.crossBorderBankingGuidance && data.crossBorderBankingGuidance.length) {
    crossBorderHtml = `
      <div data-s="margin-top-1_25rem background-bg-card border-1px-solid-border border-radius-8px padding-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Cross-Border North American Banking Protocols:</div>
        <div data-s="display-flex flex-direction-column gap-0_5rem">
          ${data.crossBorderBankingGuidance.map(g => `
            <div data-s="font-size-0_82rem background-surface-sunken padding-0_6rem border-radius-4px border-1px-solid-border">
              <strong>${escapeHtml(g.title)}:</strong> ${escapeHtml(g.description)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div data-s="display-flex flex-direction-column gap-1_25rem">
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-10px padding-1_25rem">
        <div data-s="display-flex justify-content-space-between align-items-flex-start flex-wrap-wrap gap-0_75rem">
          <div>
            <div data-s="font-size-0_8rem text-transform-uppercase letter-spacing-0_05em color-text-muted">
              Corridor: ${escapeHtml(data.corridor)}
            </div>
            <div data-style="font-size:1.25rem;font-weight:800;color:${bestColor};">
              Optimal Route: ${escapeHtml(data.bestOption.providerName)}
            </div>
            ${savingsHtml}
          </div>
          <div data-s="text-align-right font-size-0_82rem color-text-muted">
            <div>Interbank Mid-Market Benchmark: <strong>${data.benchmarkRate}</strong></div>
            <div>Gross Converted Value: <strong>${data.grossBenchmarkReceived.toLocaleString()} ${escapeHtml(data.corridor.split(' ')[2])}</strong></div>
          </div>
        </div>
      </div>

      ${complianceAlertHtml}

      <div>
        <div data-s="font-weight-700 font-size-0_95rem margin-bottom-0_75rem">Live Exchange Route &amp; Markup Spread Comparison:</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem">
          ${providersHtml}
        </div>
      </div>

      ${norbertHtml}

      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_6rem">Safe Source-of-Funds Compliance Checklist (Prevent Bank Holds):</div>
        <div data-s="display-flex flex-direction-column gap-0_5rem">
          ${docsListHtml}
        </div>
      </div>

      ${crossBorderHtml}

      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">MONEY TRANSFER AND REPORTING NOTES:</div>
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

export function renderBusinessStructureAssessment(data, container) {
  if (!container) return;

  const imm = data.immigrationCompliance;
  const psb = data.psbRiskAudit;
  const gst = data.gstHstAudit;
  const tax = data.taxComparison;
  const money = n => '$' + Math.round(Number(n) || 0).toLocaleString();
  const isProhibited = !imm.isLegallyAuthorizedToOperate;
  const isPsbRisk = psb.psbRiskLevel !== 'LOW';
  const badgeColor = isProhibited ? '#ef4444' : isPsbRisk ? '#f59e0b' : '#16a34a';
  const structureLabel = String(data.recommendedStructure || '').replaceAll('_', ' ').toLowerCase();
  const badgeText = isProhibited
    ? 'Your current status does not allow running a business'
    : isPsbRisk
      ? 'Caution: personal services business risk'
      : 'Suggested structure: ' + structureLabel;

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor};border-radius:4px;font-weight:700;font-size:0.8rem;margin-bottom:0.6rem;">${escapeHtml(badgeText)}</span>
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
          <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_35rem">CAN YOU RUN A BUSINESS ON YOUR STATUS?</div>
          <div data-s="font-size-0_82rem color-text-muted">${escapeHtml(imm.finding)}</div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_35rem">Rule: ${escapeHtml(imm.statute)}</div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
          <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_35rem">CORPORATE DIRECTORS (${escapeHtml(data.corporateStatute)})</div>
          <div data-s="font-size-0_82rem color-text-muted">${data.corporateDirectorResidency.requiresCanadianResidentDirector ? 'At least some directors must be resident Canadians in this province.' : 'No Canadian-resident director is required in this province.'}</div>
        </div>
      </div>
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-1rem margin-bottom-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_6rem">TAX COMPARISON (net business income ${money(tax.netBusinessIncomeCad)} CAD)</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem">
          <div data-s="background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
            <div data-s="font-size-0_75rem color-text-muted font-weight-600">SOLE PROPRIETORSHIP</div>
            <div data-s="font-size-1_1rem font-weight-700 margin-0_25rem-0">${money(tax.soleProprietorship.totalTaxAndCppCad)} tax and CPP</div>
            <div data-s="font-size-0_75rem color-text-muted">About ${escapeHtml(tax.soleProprietorship.effectiveTaxRatePct)}% of income · keep ${money(tax.soleProprietorship.afterTaxCashCad)}</div>
          </div>
          <div data-s="background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
            <div data-s="font-size-0_75rem color-text-muted font-weight-600">CORPORATION</div>
            <div data-s="font-size-1_1rem font-weight-700 margin-0_25rem-0">${money(tax.corporation.corporateTaxPaidCad)} corporate tax</div>
            <div data-s="font-size-0_75rem color-text-muted">Retained in the corporation: ${money(tax.corporation.corporateRetainedEarningsCad)}</div>
            ${tax.corporation.immediateTaxSavingsOrDeferralCad > 0 ? `<div data-s="font-size-0_75rem color-16a34a margin-top-0_25rem">Tax deferred while money stays in the corporation: ${money(tax.corporation.immediateTaxSavingsOrDeferralCad)}</div>` : ''}
          </div>
        </div>
        <div data-s="font-size-0_75rem color-text-muted margin-top-0_6rem">Money you later pay yourself from a corporation is taxed again as salary or dividends, so this is a deferral, not a permanent saving.</div>
      </div>
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
          <div data-style="font-weight:600;font-size:0.85rem;color:${isPsbRisk ? '#ef4444' : 'var(--text)'};margin-bottom:0.35rem;">PERSONAL SERVICES BUSINESS (PSB) CHECK: ${escapeHtml(psb.psbRiskLevel.replaceAll('_', ' '))}</div>
          <div data-s="font-size-0_82rem color-text-muted">${escapeHtml(psb.verdict)}</div>
          ${psb.consequences.length ? `<ul data-s="margin-0_4rem-0-0 padding-left-1_2rem font-size-0_8rem color-text-muted">${psb.consequences.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>` : ''}
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
          <div data-style="font-weight:600;font-size:0.85rem;color:${gst.isRegistrationMandatory ? '#f59e0b' : 'var(--text)'};margin-bottom:0.35rem;">GST/HST REGISTRATION</div>
          <div data-s="font-size-0_82rem color-text-muted">${gst.isRegistrationMandatory
            ? `Your projected revenue (${money(gst.projectedRevenueCad)}) is above the ${money(gst.smallSupplierThresholdCad)} small-supplier limit, so you must register for GST/HST. You would collect about ${money(gst.estimatedGstHstCollectedCad)} a year.`
            : `Your projected revenue is below the ${money(gst.smallSupplierThresholdCad)} small-supplier limit, so registration is optional.`}</div>
        </div>
      </div>
      ${data.statutoryViolations.length ? `<div class="alert-box error" data-s="margin-bottom-1rem">${data.statutoryViolations.map(v => `<p><strong>${escapeHtml(v.rule)}:</strong> ${escapeHtml(v.legalFinding)}</p>`).join('')}</div>` : ''}
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">NEXT STEPS</div>
        <ol data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.actionChecklist.map(step => `<li><strong>${escapeHtml(step.agency)}:</strong> ${escapeHtml(step.action)} <em>(${escapeHtml(step.timing)})</em></li>`).join('')}
        </ol>
        ${data.statutoryAdvisories.length ? `<ul data-s="margin-0_6rem-0-0 padding-left-1_2rem font-size-0_8rem color-text-muted">${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
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
                ${data.bcTechEligibility.qualifiesForBcTech ? 'QUALIFIED' : 'NOT QUALIFIED'}
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
                ${data.aaipTechEligibility.qualifiesForAaipTech ? 'QUALIFIED' : 'INELIGIBLE'}
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

export function renderDebtCollectionAssessment(data, container) {
  if (!container) return;

  const isBarred = data.isStatuteBarred;
  const hasViolations = data.hasViolations;
  const badgeColor = isBarred ? '#16a34a' : hasViolations ? '#ef4444' : '#2563eb';
  const badgeText = isBarred
    ? 'STATUTE-BARRED DEBT (TIME-EXPIRED: CANNOT SUE)'
    : hasViolations
      ? 'STATUTORY COLLECTOR VIOLATIONS DETECTED'
      : data.resolutionVerdict.replace(/_/g, ' ');

  const violationsHtml = data.statutoryViolations.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">Statutory Debt Collector Violations Detected (${data.violationCount}):</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.statutoryViolations.map(v => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(v.statute)} [${escapeHtml(v.severity.toUpperCase())}]</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(v.finding)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const protectionsHtml = data.legalProtections.map(p => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem margin-bottom-0_5rem">
      <div data-s="font-weight-700 font-size-0_85rem color-text">${escapeHtml(p.shield)}</div>
      <div data-s="font-size-0_78rem color-text-muted margin-0_2rem-0">Statute: ${escapeHtml(p.statute)}</div>
      <div data-s="font-size-0_8rem color-text">${escapeHtml(p.details)}</div>
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Debt collection: your rights and time limits (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CLAIMED DEBT AMOUNT</div>
          <div data-s="font-size-1_25rem font-weight-800 color-text">$${Number(data.allegedDebtAmountCad).toLocaleString()} CAD</div>
        </div>
      </div>

      <!-- Overview Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">STATUTE OF LIMITATIONS</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${isBarred ? '#16a34a' : '#ef4444'};margin-top:0.2rem;">
            ${isBarred ? 'Statute-Barred (Cannot Sue)' : 'Actionable (Within Statutory Limit)'}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Elapsed: ${Number(data.yearsSinceDefault).toFixed(1)} years since default/payment</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CREDIT BUREAU 6-YEAR PURGE</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${data.isCreditBureauPurgeEligible ? '#16a34a' : 'var(--text)'};margin-top:0.2rem;">
            ${data.isCreditBureauPurgeEligible ? 'Eligible for Permanent Deletion' : 'Within 6-Year Reporting Window'}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Equifax &amp; TransUnion credit file rule</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">REGULATORY FILING TARGET</div>
          <div data-s="font-size-0_95rem font-weight-700 color-text margin-top-0_2rem">
            ${escapeHtml(data.regulatoryFilingGuide.agency)}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">${escapeHtml(data.regulatoryFilingGuide.action)}</div>
        </div>
      </div>

      ${violationsHtml}

      <!-- Statutory Protections -->
      <div data-s="margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Legal Protections &amp; Consumer Rights:</div>
        ${protectionsHtml}
      </div>

      <!-- Formal Cease-and-Desist Notice -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_5rem">
          <div data-s="font-weight-700 font-size-0_85rem">STATUTORY WRITTEN-COMMUNICATION DISPUTE NOTICE:</div>
          <button type="button" class="secondary" id="debt-defense-copy-btn" data-s="font-size-0_75rem padding-0_25rem-0_6rem">Copy Notice 📋</button>
        </div>
        <pre id="debt-defense-notice-text" data-s="white-space-pre-wrap font-family-inherit font-size-0_8rem color-text margin-0 background-bg-card padding-0_75rem border-radius-4px border-1px-solid-border">${escapeHtml(data.ceaseAndDesistNotice)}</pre>
      </div>

      <!-- Things to Know -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">CRITICAL WARNINGS &amp; THINGS TO KNOW:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const copyBtn = $('#debt-defense-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const noticeText = $('#debt-defense-notice-text')?.textContent || '';
      navigator.clipboard.writeText(noticeText).then(() => {
        copyBtn.textContent = 'Copied! ✓';
        setTimeout(() => { copyBtn.textContent = 'Copy Notice 📋'; }, 2000);
      });
    });
  }
}

export function renderMovingTaxAssessment(data, container) {
  if (!container) return;

  const isEligible = data.isEligible;
  const badgeColor = isEligible ? '#16a34a' : '#ef4444';
  const badgeText = isEligible
    ? 'ELIGIBLE FOR CRA FORM T1-M MOVING DEDUCTION (LINE 21900)'
    : !data.meetsDistanceRule
      ? 'INELIGIBLE: FAILED 40-KM STATUTORY DISTANCE TEST'
      : 'INELIGIBLE: NON-QUALIFYING RELOCATION PURPOSE';

  const warningsHtml = data.auditWarnings.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">CRA Statutory Audit Notices (${data.auditWarnings.length}):</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.auditWarnings.map(w => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(w.rule)} [${escapeHtml(w.severity.toUpperCase())}]</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(w.details)}</div>
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">CRA Form T1-M Moving Deduction Assessment (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTIMATED TOTAL TAX REFUND BENEFIT</div>
          <div data-s="font-size-1_25rem font-weight-800 color-16a34a">$${Number(data.totalTaxBenefitCad).toLocaleString()} CAD</div>
        </div>
      </div>

      <!-- Overview Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">NET ELIGIBLE EXPENSES</div>
          <div data-s="font-size-1_1rem font-weight-700 color-text margin-top-0_2rem">
            $${Number(data.netEligibleExpensesCad).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Distance: ${data.distanceKm} km (>=40km met)</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CURRENT YEAR DEDUCTION</div>
          <div data-s="font-size-1_1rem font-weight-700 color-16a34a margin-top-0_2rem">
            $${Number(data.deductibleInCurrentTaxYearCad).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Year 1 Tax Refund: ~$${Number(data.estimatedTaxRefundYear1Cad).toLocaleString()} CAD</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ALLOWABLE CARRY-FORWARD</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${data.carryForwardToFutureYearsCad > 0 ? '#2563eb' : 'var(--text)'};margin-top:0.2rem;">
            $${Number(data.carryForwardToFutureYearsCad).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Future Tax Savings: ~$${Number(data.estimatedFutureTaxRefundCad).toLocaleString()} CAD</div>
        </div>
      </div>

      ${warningsHtml}

      <!-- Form T1-M Line-by-Line Breakdown -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_6rem">CRA FORM T1-M LINE-BY-LINE TAX RETURN MAPPING:</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-0_5rem font-size-0_8rem">
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 1: Transportation &amp; Storage:</span>
            <strong>$${Number(data.formT1MMapping.line1TransportationAndStorageCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 2: Travel (Flights &amp; Meals):</span>
            <strong>$${Number(data.formT1MMapping.line2TravelExpensesCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 3: Temporary Living (Max 15 Days):</span>
            <strong>$${Number(data.formT1MMapping.line3TemporaryLivingExpensesCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 4: Cost of Cancelling Lease:</span>
            <strong>$${Number(data.formT1MMapping.line4LeaseCancellationCostCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 5: Incidental Costs (Utilities/ID):</span>
            <strong>$${Number(data.formT1MMapping.line5IncidentalCostsCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border padding-0_25rem-0">
            <span data-s="color-text-muted">Line 9: Less Employer Reimbursement:</span>
            <strong>-$${Number(data.formT1MMapping.line9EmployerReimbursementCad).toLocaleString()} CAD</strong>
          </div>
          <div data-s="display-flex justify-content-space-between border-bottom-1px-solid-border grid-column-1-1-2 background-bg-card padding-0_4rem border-radius-4px">
            <span data-s="font-weight-700">Line 12: Deduction Claimed on T1 Line 21900:</span>
            <strong data-s="color-16a34a font-size-0_95rem">$${Number(data.formT1MMapping.line12DeductionClaimedCurrentYearCad).toLocaleString()} CAD</strong>
          </div>
        </div>
      </div>

      <!-- Documentation Checklist -->
      <div data-s="margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">CRA AUDIT DEFENSE CHECKLIST (Keep for 6 Years):</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_3rem">
          ${data.documentationChecklist.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
      </div>

      <!-- Things to Know -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">CRITICAL STATUTORY RULES &amp; WARNINGS:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderCredentialLicensureAssessment(data, container) {
  if (!container) return;

  const isProtected = data.canadianExperienceBanApplies;
  const badgeColor = isProtected ? '#16a34a' : '#2563eb';
  const badgeText = isProtected
    ? 'FARPACTA / ICRA CANADIAN EXPERIENCE BAN APPLIES (NO DISCRIMINATION)'
    : 'PROVINCIAL REGULATED PROFESSION PATHWAY';

  const milestonesHtml = data.licensingMilestones.map(m => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem margin-bottom-0_5rem">
      <div data-s="display-flex align-items-center gap-0_5rem">
        <span data-s="display-inline-flex align-items-center justify-content-center width-1_5rem height-1_5rem background-primary color-fff border-radius-50pc font-size-0_75rem font-weight-700">${m.step}</span>
        <strong data-s="font-size-0_85rem color-text">${escapeHtml(m.name)}</strong>
      </div>
      <div data-s="font-size-0_8rem color-text-muted margin-top-0_3rem padding-left-2rem">${escapeHtml(m.details)}</div>
    </div>
  `).join('');

  const careersHtml = data.alternativeUnlicensedCareers.map(c => `
    <div data-s="background-bg-card border-1px-solid-border border-radius-6px padding-0_75rem">
      <div data-s="display-flex justify-content-space-between align-items-baseline flex-wrap-wrap gap-0_5rem">
        <div data-s="font-weight-700 font-size-0_9rem color-text">${escapeHtml(c.role)}</div>
        <div data-s="font-weight-800 color-16a34a font-size-0_95rem">~$${Number(c.typicalSalaryCad).toLocaleString()} CAD/yr</div>
      </div>
      <div data-s="display-flex gap-1rem font-size-0_75rem color-text-muted margin-top-0_3rem">
        <span><strong>NOC:</strong> ${escapeHtml(c.noc)}</span>
        <span><strong>Status:</strong> ${escapeHtml(c.regulatoryBarrier)}</span>
      </div>
    </div>
  `).join('');

  const fundingHtml = data.fundingAndBridgingResources.map(f => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem margin-bottom-0_5rem">
      <div data-s="font-weight-700 font-size-0_85rem color-text">${escapeHtml(f.program)}</div>
      <div data-s="font-size-0_8rem color-text-muted margin-top-0_25rem">${escapeHtml(f.coverage)}</div>
      <div data-s="font-size-0_75rem color-primary margin-top-0_25rem">Delivery: ${escapeHtml(f.deliveryPartner)}</div>
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">${escapeHtml(data.professionTitle)} Licensure &amp; FCR Assessment (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">EST. LICENSING DURATION &amp; COST</div>
          <div data-s="font-size-1_15rem font-weight-800 color-text">${data.estimatedLicensingDurationMonths} mos | ~$${Number(data.estimatedTotalCostCad).toLocaleString()} CAD</div>
        </div>
      </div>

      <!-- Regulatory Authority Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">REGULATORY COLLEGE</div>
          <div data-s="font-size-0_95rem font-weight-700 color-text margin-top-0_2rem">${escapeHtml(data.regulatoryCollege)}</div>
          <div data-s="font-size-0_72rem color-text-muted margin-top-0_2rem">${escapeHtml(data.governingStatute)}</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">MANDATORY ECA BODY</div>
          <div data-style="font-size:0.95rem;font-weight:700;color:${data.hasValidEca ? '#16a34a' : '#ef4444'};margin-top:0.2rem;">
            ${escapeHtml(data.mandatoryEcaDesignation)} (${data.hasValidEca ? 'Valid' : 'Action Required'})
          </div>
          <div data-s="font-size-0_72rem color-text-muted margin-top-0_2rem">${escapeHtml(data.ecaStatusFinding)}</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">LANGUAGE BENCHMARK</div>
          <div data-style="font-size:0.95rem;font-weight:700;color:${data.isLanguageReady ? '#16a34a' : '#f59e0b'};margin-top:0.2rem;">
            CLB ${data.officialLanguageClb} (${data.isLanguageReady ? 'Meets Standard' : 'May Need Course'})
          </div>
          <div data-s="font-size-0_72rem color-text-muted margin-top-0_2rem">${escapeHtml(data.languageFinding)}</div>
        </div>
      </div>

      <!-- Title Protection & Legal Warning -->
      <div data-s="background-rgba-239-68-68-0_08 border-1px-solid-ef4444 border-radius-8px padding-0_85rem margin-bottom-1rem">
        <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_25rem">TITLE RESTRICTION CAUTION:</div>
        <div data-s="font-size-0_8rem color-text">${escapeHtml(data.titleRestrictionNotice)}</div>
      </div>

      <!-- Canadian Experience Ban Protection -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
        <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_25rem">CANADIAN WORK EXPERIENCE REQUIREMENT AUDIT:</div>
        <div data-s="font-size-0_8rem color-text">${escapeHtml(data.canadianExperienceProtectionDetails)}</div>
      </div>

      <!-- Licensing Roadmap -->
      <div data-s="margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Statutory Licensing Roadmap:</div>
        ${milestonesHtml}
      </div>

      <!-- Immediate Unlicensed Career Alternatives -->
      <div data-s="margin-top-1_25rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Immediate Unlicensed Career Steps (Work Right Away While Licensing):</div>
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-0_75rem">
          ${careersHtml}
        </div>
      </div>

      <!-- Government Funding & Bridging Support -->
      <div data-s="margin-top-1_25rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Government Bridging Programs &amp; Low-Interest Loans:</div>
        ${fundingHtml}
      </div>

      <!-- Critical Warnings -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">CRITICAL STATUTORY RULES &amp; WARNINGS:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

export function renderTelecomAssessment(data, container) {
  if (!container) return;

  const isTrialValid = data.trialCancellationStatus === 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY';
  const hasViolations = data.hasStatutoryViolations;
  const badgeColor = isTrialValid ? '#16a34a' : hasViolations ? '#ef4444' : '#2563eb';
  const badgeText = isTrialValid
    ? '15-DAY TRIAL: ABSOLUTE RIGHT TO CANCEL WITHOUT PENALTY'
    : hasViolations
      ? 'CRTC REGULATORY VIOLATIONS DETECTED'
      : 'CRTC WIRELESS CODE COMPLIANCE AUDIT';

  const violationsHtml = data.statutoryViolations.length ? `
    <div data-s="margin-top-1rem background-rgba-239-68-68-0_1 border-1px-solid-ef4444 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-ef4444 font-size-0_85rem margin-bottom-0_4rem">CRTC Regulatory Violations Detected (${data.violationCount}):</div>
      <div data-s="display-flex flex-direction-column gap-0_4rem">
        ${data.statutoryViolations.map(v => `
          <div data-s="font-size-0_8rem background-bg-card padding-0_5rem border-radius-4px border-1px-solid-border">
            <div data-s="font-weight-600 color-ef4444">${escapeHtml(v.statute)} [${escapeHtml(v.severity.toUpperCase())}]</div>
            <div data-s="color-text margin-top-0_15rem">${escapeHtml(v.finding)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const remediesHtml = data.consumerRemedies.map(r => `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-6px padding-0_75rem margin-bottom-0_5rem">
      <div data-s="font-weight-700 font-size-0_85rem color-text">${escapeHtml(r.remedy)}</div>
      <div data-s="font-size-0_78rem color-text-muted margin-0_2rem-0">Authority: ${escapeHtml(r.authority)}</div>
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">${escapeHtml(data.providerName)} Contract &amp; Billing Audit</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">MAX STATUTORY ECF CANCELLATION FEE</div>
          <div data-s="font-size-1_25rem font-weight-800 color-text">$${Number(data.allowableMaxEcfCad).toFixed(2)} CAD</div>
        </div>
      </div>

      <!-- Overview Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-220 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">TRIAL PERIOD CANCELLATION RIGHT</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${data.isWithinTrialPeriod ? '#16a34a' : 'var(--text)'};margin-top:0.2rem;">
            ${data.isWithinTrialPeriod ? 'Active Right to Cancel ($0 ECF)' : 'Standard Contract Term'}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Elapsed: ${data.daysSinceContractStart} of ${data.allowedTrialDays} statutory trial days</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CRTC STATUTORY PROTECTIONS</div>
          <div data-s="font-size-1_1rem font-weight-700 color-16a34a margin-top-0_2rem">$50 Data Cap / $100 Roaming</div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Mandatory $0 Device Unlocking</div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">CCTS OMBUDSMAN ESCALATION</div>
          <div data-s="font-size-1_1rem font-weight-700 color-2563eb margin-top-0_2rem">Zero Cost for Consumers</div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Binding compensation up to $5,000</div>
        </div>
      </div>

      ${violationsHtml}

      <!-- Consumer Remedies -->
      <div data-s="margin-top-1rem">
        <div data-s="font-weight-700 font-size-0_9rem margin-bottom-0_5rem">Statutory Consumer Remedies:</div>
        ${remediesHtml}
      </div>

      <!-- Formal Dispute Letter & CCTS Notice -->
      <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_5rem">
          <div data-s="font-weight-700 font-size-0_85rem">CRTC WIRELESS CODE DISPUTE LETTER &amp; CCTS NOTICE:</div>
          <button type="button" class="secondary" id="telecom-copy-btn" data-s="font-size-0_75rem padding-0_25rem-0_6rem">Copy Letter 📋</button>
        </div>
        <pre id="telecom-notice-text" data-s="white-space-pre-wrap font-family-inherit font-size-0_8rem color-text margin-0 background-bg-card padding-0_75rem border-radius-4px border-1px-solid-border">${escapeHtml(data.formalDisputeNotice)}</pre>
      </div>

      <!-- Things to Know -->
      <div data-s="background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem margin-top-1rem">
        <div data-s="font-weight-600 font-size-0_85rem margin-bottom-0_4rem">CRITICAL STATUTORY RULES &amp; WARNINGS:</div>
        <ul data-s="margin-0 padding-left-1_2rem font-size-0_8rem color-text-muted display-flex flex-direction-column gap-0_35rem">
          ${data.statutoryAdvisories.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  const copyBtn = $('#telecom-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const noticeText = $('#telecom-notice-text')?.textContent || '';
      navigator.clipboard.writeText(noticeText).then(() => {
        copyBtn.textContent = 'Copied! ✓';
        setTimeout(() => { copyBtn.textContent = 'Copy Letter 📋'; }, 2000);
      });
    });
  }
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

export function renderHumanRightsAssessment(data, container) {
  if (!container || !data) return;

  let badgeColor = '#16a34a';
  let badgeText = 'NO DISCRIMINATION IDENTIFIED';

  if (data.humanRightsViolationVerdict === 'UNLAWFUL_STATUTORY_REPRISAL') {
    badgeColor = '#dc2626';
    badgeText = 'UNLAWFUL STATUTORY REPRISAL';
  } else if (data.humanRightsViolationVerdict === 'PROBABLE_PRIMA_FACIE_DISCRIMINATION') {
    badgeColor = '#dc2626';
    badgeText = 'PRIMA FACIE HUMAN RIGHTS VIOLATION';
  } else if (data.constructiveDismissalVerdict === 'ESTABLISHED_CONSTRUCTIVE_DISMISSAL') {
    badgeColor = '#7c3aed';
    badgeText = 'CONSTRUCTIVE DISMISSAL ESTABLISHED';
  }

  const damages = data.damagesAssessment || {};
  const dignity = damages.humanRightsDignityDamagesEstimateCad || {};
  const limits = data.statuteOfLimitationsStatus || {};

  const violationsHtml = data.statutoryViolations && data.statutoryViolations.length > 0 ? `
    <div data-s="background-fee2e2 border-1px-solid-ef4444 border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-991b1b font-size-0_9rem margin-bottom-0_4rem">⛔ STATUTORY HUMAN RIGHTS CODE VIOLATIONS:</div>
      ${data.statutoryViolations.map(v => `
        <div data-s="margin-bottom-0_5rem font-size-0_85rem color-7f1d1d">
          <strong>[${escapeHtml(v.statute)}] ${escapeHtml(v.severity)} (${escapeHtml(v.ground)}):</strong>
          <div>${escapeHtml(v.finding)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const cd = data.constructiveDismissalAudit || {};
  const cdHtml = cd.isConstructiveDismissal ? `
    <div data-s="background-f3e8ff border-1px-solid-a855f7 border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-6b21a8 font-size-0_9rem margin-bottom-0_4rem">⚖️ CONSTRUCTIVE DISMISSAL DOCTRINE (POTTER v. NEW BRUNSWICK, 2015 SCC 10):</div>
      <div data-s="font-size-0_85rem color-581c87 line-height-1_45">
        <div>${escapeHtml(cd.reason)}</div>
        <ul data-s="margin-0_4rem-0-0-0 padding-left-1_25rem">
          ${cd.factorsIdentified.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
      </div>
    </div>
  ` : '';

  const reprisal = data.retaliationProtection || {};
  const reprisalHtml = `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_3rem">🛡️ STATUTORY ANTI-REPRISAL PROTECTION (${escapeHtml(reprisal.statute || 'Human Rights Code')}):</div>
      <div data-s="font-size-0_82rem color-text-muted line-height-1_45">${escapeHtml(reprisal.advisory || '')}</div>
    </div>
  `;

  const letterText = data.officialFormalDemandLetter || '';
  const letterHtml = letterText ? `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_4rem">
        <span data-s="font-weight-700 font-size-0_85rem">📝 FORMAL PRIVILEGED DEMAND LETTER TO EMPLOYER:</span>
        <button type="button" class="secondary" data-s="font-size-0_75rem padding-0_25rem-0_5rem" data-copy-next data-copy-label="Copy Letter">Copy Letter</button>
        <span data-style="display:none;">${escapeHtml(letterText)}</span>
      </div>
      <pre data-s="margin-0 font-family-monospace font-size-0_78rem background-surface-sunken padding-0_75rem border-radius-6px border-1px-solid-border white-space-pre-wrap color-text">${escapeHtml(letterText)}</pre>
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
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Human Rights &amp; Dismissal Audit (${escapeHtml(data.jurisdictionDetails?.tribunal || data.jurisdiction)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">COMMON LAW NOTICE ENTITLEMENT</div>
          <div data-s="font-size-1_2rem font-weight-800 color-16a34a">
            $${Number(damages.estimatedCommonLawNoticeValueCad || 0).toLocaleString()} CAD (${damages.estimatedCommonLawNoticeMonths || 0} Mos)
          </div>
        </div>
      </div>

      <p data-s="font-size-0_95rem margin-0-0-1rem-0 line-height-1_45 color-text">
        ${escapeHtml(data.summary)}
      </p>

      <!-- Metrics Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTIMATED NOTICE PAY</div>
          <div data-s="font-size-1rem font-weight-700 color-16a34a margin-top-0_2rem">
            $${Number(damages.estimatedCommonLawNoticeValueCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">${damages.estimatedCommonLawNoticeMonths || 0} months (Bardal factors)</div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">HRTO DIGNITY DAMAGES</div>
          <div data-s="font-size-1rem font-weight-700 color-7c3aed margin-top-0_2rem">
            $${Number(dignity.minCad || 0).toLocaleString()} - $${Number(dignity.maxCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">Uncapped injury to dignity</div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">STATUTE OF LIMITATIONS</div>
          <div data-style="font-size:1rem;font-weight:700;color:${limits.isWithin1YearLimitation ? '#16a34a' : '#dc2626'};margin-top:0.2rem;">
            ${limits.daysRemainingToApply || 0} Days Remaining
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">1-Year statutory limit</div>
        </div>
      </div>

      ${violationsHtml}
      ${cdHtml}
      ${reprisalHtml}
      ${letterHtml}
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

export function renderAutoInsuranceAssessment(data, container) {
  if (!data || !container) return;

  const territory = data.ratingTerritoryAnalysis || {};
  const letter = data.experienceLetterAudit || {};
  const sabs = data.sabsAccidentBenefits || {};
  const takeAll = data.takeAllComersAudit || {};
  const guidance = data.officialGuidance || [];
  const statutes = data.statutoryCitations || [];

  const tierBadgeColor = territory.isHighPremiumZone ? '#dc2626' : '#16a34a';
  const tierBadgeText = territory.isHighPremiumZone ? 'HIGH-RISK GTA POSTAL ZONE' : 'STANDARD RATING TERRITORY';

  const takeAllHtml = takeAll.isViolationSuspected ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        ⚠️ SUSPECTED "TAKE-ALL-COMERS" REGULATORY VIOLATION (${escapeHtml(takeAll.statutoryReference)})
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0-0-0_5rem-0">
        Under Ontario Insurance Act s. 237, licensed insurers and brokers cannot refuse to provide a quote or unreasonably delay applications for drivers who qualify under approved underwriting rules.
      </p>
      <div data-s="font-size-0_78rem font-weight-600 color-991b1b margin-bottom-0_25rem">STEPS TO ENFORCE REGULATORY COMPLIANCE:</div>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_8rem line-height-1_45 color-991b1b">
        ${(takeAll.stepsToEnforce || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const guidanceHtml = guidance.length > 0 ? `
    <div data-s="margin-top-1rem background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
      <h5 data-s="margin-0-0-0_5rem-0 font-size-0_85rem font-weight-700 color-text">OFFICIAL STATUTORY ADVICE &amp; SAVINGS LEVERS:</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_82rem line-height-1_45 color-text-muted">
        ${guidance.map(g => `<li data-s="margin-bottom-0_35rem">${escapeHtml(g)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const insurersHtml = (letter.insurersAcceptingForeignLetters || []).length > 0 ? `
    <div data-s="margin-top-0_75rem background-surface-sunken border-1px-solid-border border-radius-6px padding-0_75rem">
      <div data-s="font-size-0_78rem font-weight-700 color-text margin-bottom-0_35rem">INSURERS CREDITING FOREIGN EXPERIENCE LETTERS:</div>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_78rem color-text-muted line-height-1_4">
        ${letter.insurersAcceptingForeignLetters.map(ins => `<li>${escapeHtml(ins)}</li>`).join('')}
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
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${tierBadgeColor}20;color:${tierBadgeColor};border:1px solid ${tierBadgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(tierBadgeText)} (${escapeHtml(data.forwardSortationArea)})
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Auto Insurance Rating &amp; SABS Benefits Audit (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTIMATED ANNUAL SAVINGS</div>
          <div data-s="font-size-1_2rem font-weight-800 color-16a34a">
            $${Number(territory.estimatedAnnualSavingsCad || 0).toLocaleString()} CAD (${territory.savingsPercent || 0}% Off)
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTIMATED ANNUAL PREMIUM</div>
          <div data-s="font-size-1_2rem font-weight-700 color-2563eb margin-top-0_2rem">
            $${Number(territory.estimatedAnnualPremiumWithExperienceCreditCad || 0).toLocaleString()} CAD/yr
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            vs $${Number(territory.estimatedAnnualPremiumWithoutCreditCad || 0).toLocaleString()} novice rate
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">SABS INCOME REPLACEMENT</div>
          <div data-s="font-size-1_2rem font-weight-700 color-16a34a margin-top-0_2rem">
            $${Number(sabs.weeklyIncomeReplacementCad || 0).toLocaleString()} CAD/wk
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            Up to $${Number(sabs.annualReplacementCad || 0).toLocaleString()}/yr (${sabs.durationWeeks || 104} wks)
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">EXPERIENCE RECOGNITION</div>
          <div data-s="font-size-1_2rem font-weight-700 color-7c3aed margin-top-0_2rem">
            ${letter.eligibleDrivingYearsRecognized || 0} Years Credited
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            ${letter.isLetterValid ? 'Claims-Free Letter verified' : 'No Letter: novice tier'}
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">SABS WAITING PERIOD</div>
          <div data-s="font-size-1_2rem font-weight-700 color-ca8a04 margin-top-0_2rem">
            ${sabs.waitingPeriodDays || 7} Days
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            MRAC limit: $${Number(sabs.medicalRehabCoverageCad || 65000).toLocaleString()} CAD
          </div>
        </div>
      </div>

      <div data-s="font-size-0_85rem color-text margin-bottom-0_75rem padding-0_5rem-0_75rem background-surface-sunken border-radius-6px">
        <strong>SABS Coverage Note:</strong> ${escapeHtml(sabs.optionalCoverageRecommendation || '')}
      </div>

      ${takeAllHtml}
      ${insurersHtml}
      ${guidanceHtml}
      ${statutesHtml}
    </div>
  `;
}

export function renderEstatePlanningAssessment(data, container) {
  if (!data || !container) return;

  const probate = data.probateTaxAnalysis || {};
  const foreign = data.foreignAssetsStrategy || {};
  const poa = data.powerOfAttorneyAudit || {};
  const intestacy = data.intestacyRiskAudit || {};
  const actions = data.actionPlan || [];
  const statutes = data.statutoryCitations || [];

  const intestacyBadgeColor = intestacy.isIntestate ? '#dc2626' : '#16a34a';
  const intestacyBadgeText = intestacy.isIntestate ? 'INTESTATE ESTATE (NO CANADIAN WILL)' : 'TESTAMENTARY WILL IN EFFECT';

  const commonLawWarningHtml = intestacy.commonLawSpouseDisinheritanceRisk ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 COMMON-LAW SPOUSE DISINHERITANCE WARNING (Ontario SLRA Part II)
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0">
        Under Ontario law, common-law spouses receive <strong>$0 statutory inheritance</strong> on intestacy! If you pass away without a will, your common-law partner inherits nothing and must commence costly litigation for dependent support.
      </p>
    </div>
  ` : '';

  const foreignTrapHtml = foreign.hasForeignRisk ? `
    <div data-s="margin-top-1rem background-fffbeb border-1px-solid-d97706 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-b45309 font-size-0_85rem margin-bottom-0_35rem">
        ⚠️ MULTIJURISDICTIONAL ASSET &amp; REVOCATION TRAP (${escapeHtml(foreign.foreignCountry)})
      </div>
      <p data-s="font-size-0_82rem color-92400e margin-0-0-0_5rem-0">
        ${escapeHtml(foreign.generalRevocationClauseTrap)}
      </p>
      <div data-s="font-size-0_8rem color-78350f">
        <strong>Recommended Structure:</strong> Multiple concurrent wills with territorial limitation clauses restricted to Canadian situs property.
      </div>
    </div>
  ` : '';

  const poaRiskHtml = poa.nonResidentExecutorRisk?.isHighRisk ? `
    <div data-s="margin-top-0_75rem background-surface-sunken border-1px-solid-border border-radius-6px padding-0_75rem">
      <div data-s="font-size-0_78rem font-weight-700 color-dc2626 margin-bottom-0_35rem">
        NON-RESIDENT EXECUTOR RISK (Estates Act s. 6):
      </div>
      <p data-s="font-size-0_78rem color-text-muted margin-0 line-height-1_4">
        ${escapeHtml(poa.nonResidentExecutorRisk.statutoryRemedy)}
      </p>
    </div>
  ` : '';

  const actionsHtml = actions.length > 0 ? `
    <div data-s="margin-top-1rem background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem">
      <h5 data-s="margin-0-0-0_5rem-0 font-size-0_85rem font-weight-700 color-text">PRIORITY ESTATE PLANNING ACTION ITEMS:</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_82rem line-height-1_45 color-text-muted">
        ${actions.map(a => `<li data-s="margin-bottom-0_35rem">${escapeHtml(a)}</li>`).join('')}
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
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${intestacyBadgeColor}20;color:${intestacyBadgeColor};border:1px solid ${intestacyBadgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(intestacyBadgeText)}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">Estate Plan &amp; Probate Tax Audit (${escapeHtml(data.province)})</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTIMATED PROBATE TAX (EATA)</div>
          <div data-s="font-size-1_2rem font-weight-800 color-dc2626">
            $${Number(probate.estimatedProbateTaxCad || 0).toLocaleString()} CAD
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">ESTATE ASSETS SUBJECT TO PROBATE</div>
          <div data-s="font-size-1_2rem font-weight-700 color-2563eb margin-top-0_2rem">
            $${Number(probate.probateSubjectEstateValueCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            Total Estate: $${Number(probate.totalCanadianEstateValueCad || 0).toLocaleString()} CAD
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">BYPASSED OUTSIDE PROBATE</div>
          <div data-s="font-size-1_2rem font-weight-700 color-16a34a margin-top-0_2rem">
            $${Number(probate.bypassedEstateValueCad || 0).toLocaleString()} CAD
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            Via JTWROS &amp; Beneficiaries ($${Number(probate.potentialProbateSavingsCad || 0).toLocaleString()} saved)
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">INTESTACY DISTRIBUTION</div>
          <div data-s="font-size-0_95rem font-weight-700 color-text margin-top-0_2rem">
            ${intestacy.isIntestate ? 'Statutory Preferential Share' : 'Governed by Will'}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            ${escapeHtml(intestacy.statutoryDistributionSummary)}
          </div>
        </div>

        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">POWER OF ATTORNEY (POA)</div>
          <div data-s="font-size-0_95rem font-weight-700 color-text margin-top-0_2rem">
            Property: ${poa.hasContinuingPowerOfAttorneyProperty ? 'Active CPOA' : 'Missing CPOA'}
          </div>
          <div data-s="font-size-0_75rem color-text-muted margin-top-0_2rem">
            Care: ${poa.hasPowerOfAttorneyPersonalCare ? 'Active POAPC' : 'Missing POAPC'}
          </div>
        </div>
      </div>

      ${commonLawWarningHtml}
      ${foreignTrapHtml}
      ${poaRiskHtml}
      ${actionsHtml}
      ${statutesHtml}
    </div>
  `;
}

export function renderSmallClaimsAssessment(data, container) {
  if (!data || !container) return;

  const juris = data.jurisdictionAudit || data.jurisdiction || {};
  const fin = data.interestAndCostsCalculation || data.financials || {};
  const sol = data.limitationAudit || data.statuteOfLimitations || {};
  const demand = data.formalDemandLetter || data.demandLetterStrategy || {};
  const steps = data.proceduralSteps || [];
  const warnings = data.warnings || [];

  const isWithinLimit = juris.isWithinSmallClaimsLimit ?? juris.isWithinMonetaryLimit ?? true;
  const isTimely = !(sol.isStatuteBarred ?? sol.isTimeBarred);
  const daysLeft = sol.daysRemainingToSue ?? sol.daysRemainingUntilTimeBarred ?? 730;

  const limitBadge = isWithinLimit ?
    '<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">WITHIN MONETARY JURISDICTION</span>' :
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">EXCEEDS MONETARY JURISDICTION</span>';

  const solBadge = isTimely ?
    `<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">TIMELY CLAIM (${daysLeft} DAYS REMAINING)</span>` :
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">STATUTORILY TIME-BARRED</span>';

  const tribunalConflictHtml = juris.exclusiveTribunalConflict ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 EXCLUSIVE TRIBUNAL JURISDICTION CONFLICT
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0">
        ${juris.exclusiveTribunalConflict}
      </p>
    </div>
  ` : '';

  const excessRecommendation = juris.abandonExcessRecommendation || juris.abandonExcessOption || '';
  const excessWarningHtml = !isWithinLimit && juris.excessAmountCad > 0 ? `
    <div data-s="margin-top-1rem background-fffbeb border-1px-solid-d97706 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-b45309 font-size-0_85rem margin-bottom-0_35rem">
        ⚠️ CLAIM EXCEEDS PROVINCIAL LIMIT BY $${juris.excessAmountCad.toLocaleString('en-CA')} CAD
      </div>
      <p data-s="font-size-0_82rem color-92400e margin-0">
        ${excessRecommendation}
      </p>
    </div>
  ` : '';

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Statutory Procedural Steps</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_25rem">${s}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Legal Cautions &amp; Enforceability</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const letterText = demand.letterBodyText || demand.statutoryDemandNotice || '';
  const demandLetterHtml = letterText ? `
    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-1rem">
      <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_5rem">
        <strong data-s="font-size-0_88rem">📄 Formal Pre-Litigation Statutory Demand Notice</strong>
        <button type="button" class="secondary" id="sc-copy-demand-btn" data-s="font-size-0_75rem padding-0_25rem-0_6rem">Copy Letter Text 📋</button>
      </div>
      <pre data-s="white-space-pre-wrap background-surface-sunken padding-0_85rem border-radius-6px font-size-0_8rem font-family-monospace border-1px-solid-border max-height-280px overflow-y-auto" id="sc-demand-text">${letterText}</pre>
    </div>
  ` : '';

  const basisText = sol.discoveryRuleAdvisory || sol.limitationsActBasis || '';
  const principal = fin.principalClaimCad ?? fin.principalAmountCad ?? 0;
  const daysAccrued = fin.daysInterestAccrued ?? fin.daysElapsed ?? 0;

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${limitBadge}
        ${solBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">${juris.courtName || 'Small Claims Court'}</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">${basisText}</p>
    </div>

    ${tribunalConflictHtml}
    ${excessWarningHtml}

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Principal Claim</span>
        <strong data-s="font-size-1_1rem color-text">$${principal.toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Accrued Pre-Judgment Interest (${fin.annualInterestRatePercent || 0}% / ${daysAccrued}d)</span>
        <strong data-s="font-size-1_1rem color-16a34a">+$${(fin.accruedPrejudgmentInterestCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Estimated Court Filing Fee</span>
        <strong data-s="font-size-1_1rem color-text">$${(fin.estimatedFilingFeeCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Total Estimated Potential Recovery</span>
        <strong data-s="font-size-1_25rem color-primary">$${(fin.totalEstimatedRecoveryCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
    </div>

    ${demandLetterHtml}
    ${stepsHtml}
    ${warningsHtml}
  `;

  const copyBtn = container.querySelector('#sc-copy-demand-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = container.querySelector('#sc-demand-text')?.textContent || '';
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy Letter Text 📋'; }, 2000);
        }).catch(() => {});
      }
    });
  }
}

export function renderCraVdpAssessment(data, container) {
  if (!data || !container) return;

  const elig = data.eligibility || {};
  const t1135 = data.t1135Audit || {};
  const tax = data.taxAndPenaltyExposure || {};
  const relief = data.reliefScope || {};
  const deemed = data.deemedCostBaseRules || {};
  const steps = data.actionPlan || [];
  const warnings = data.warnings || [];

  const eligBadge = elig.isEligible ?
    '<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">QUALIFIES FOR VDP DISCRETIONARY RELIEF</span>' :
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">INELIGIBLE FOR VDP DISCRETIONARY RELIEF</span>';

  const trackBadge = elig.programTrack === 'General Program' ?
    '<span class="badge" data-s="background-2563eb color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">TRACK: GENERAL PROGRAM (FULL PENALTY WAIVER)</span>' :
    '<span class="badge" data-s="background-d97706 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">TRACK: LIMITED PROGRAM (PROSECUTION RELIEF ONLY)</span>';

  const yearlyRows = (t1135.yearlyAudit || []).map(y => {
    const statusText = y.isLandingYear ?
      '<span data-s="color-16a34a font-weight-600">EXEMPT (Landing Year Newcomer Exemption)</span>' :
      (y.t1135Required ? '<span data-s="color-dc2626 font-weight-600">MANDATORY T1135 (Late Penalty: $2,500 CAD)</span>' : '<span data-s="color-64748b">Not Required</span>');
    return `
      <tr data-s="border-bottom-1px-solid-border">
        <td data-s="padding-0_4rem-0_6rem font-weight-600">${y.taxYear}</td>
        <td data-s="padding-0_4rem-0_6rem">${statusText}</td>
        <td data-s="padding-0_4rem-0_6rem font-size-0_8rem color-text-muted">${y.exemptionReason || 'Failure to file penalty under ITA s. 162(7)'}</td>
        <td data-s="padding-0_4rem-0_6rem font-weight-600 text-align-right">$${y.potentialPenaltyCad.toLocaleString('en-CA')} CAD</td>
      </tr>
    `;
  }).join('');

  const conditionsHtml = (relief.conditions || []).map(c => `
    <li data-s="margin-bottom-0_35rem font-size-0_82rem">
      <strong>${c.condition}:</strong> ${c.met ? '<span data-s="color-16a34a font-weight-600">✓ SATISFIED</span>' : '<span data-s="color-dc2626 font-weight-600">✗ FAILED</span>'} — ${c.detail}
    </li>
  `).join('');

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Form RC199 Application Roadmap</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_35rem"><strong>${s.title}:</strong> ${s.action}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Administrative Cautions &amp; Limits</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${eligBadge}
        ${trackBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">CRA Voluntary Disclosures Program (IC00-1R6) Audit</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">${elig.summary || ''}</p>
    </div>

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">T1135 Penalties Without VDP</span>
        <strong data-s="font-size-1_1rem color-dc2626">$${(t1135.totalT1135PenaltyExposureCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Gross Negligence Exposure (s. 163(2))</span>
        <strong data-s="font-size-1_1rem color-dc2626">+$${(tax.potentialGrossNegligencePenaltyCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Total Potential Penalties at Risk</span>
        <strong data-s="font-size-1_25rem color-dc2626">$${(tax.totalPotentialPenaltiesWithoutVdpCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Estimated Unpaid Income Tax</span>
        <strong data-s="font-size-1_1rem color-text">$${(tax.estimatedTaxOwingCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
    </div>

    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 font-size-0_88rem margin-bottom-0_4rem">Statutory Relief Scope (${relief.programTrack})</div>
      <p data-s="font-size-0_82rem margin-0-0-0_4rem-0"><strong>Penalties:</strong> ${relief.penaltyReliefScope}</p>
      <p data-s="font-size-0_82rem margin-0-0-0_4rem-0"><strong>Interest:</strong> ${relief.interestReliefScope}</p>
      <p data-s="font-size-0_82rem margin-0"><strong>Criminal Prosecution Immunity:</strong> ${relief.criminalImmunityGranted ? '<span data-s="color-16a34a font-weight-600">Granted under ITA ss. 238-239</span>' : '<span data-s="color-dc2626 font-weight-600">Not Protected</span>'}</p>
    </div>

    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border overflow-x-auto">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Yearly T1135 Reporting &amp; Newcomer Exemption Audit</strong>
      <table data-s="width-100pc border-collapse-collapse font-size-0_82rem">
        <thead>
          <tr data-s="border-bottom-1px-solid-border text-align-left">
            <th data-s="padding-0_35rem-0_6rem">Tax Year</th>
            <th data-s="padding-0_35rem-0_6rem">Filing Obligation</th>
            <th data-s="padding-0_35rem-0_6rem">Statutory Basis</th>
            <th data-s="padding-0_35rem-0_6rem text-align-right">Penalty Exposure</th>
          </tr>
        </thead>
        <tbody>
          ${yearlyRows}
        </tbody>
      </table>
    </div>

    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_35rem font-size-0_85rem">Foreign Property Cost Base Step-Up (${deemed.statutoryBasis || ''})</strong>
      <p data-s="margin-0-0-0_25rem-0 font-size-0_82rem color-text-muted">${deemed.rule || ''}</p>
      <p data-s="margin-0 font-size-0_82rem color-text-muted">${deemed.practicalImpact || ''}</p>
    </div>

    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">IC00-1R6 Five Conditions Verification</strong>
      <ul data-s="margin-0 padding-left-1_2rem color-text-muted">
        ${conditionsHtml}
      </ul>
    </div>

    ${stepsHtml}
    ${warningsHtml}
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

export function renderConsumerProtectionAssessment(data, container) {
  if (!data || !container) return;

  const timing = data.timingAudit || {};
  const bnd = data.doorToDoorBanAudit || {};
  const canc = data.cancellationRights || {};
  const unfair = data.unfairPracticesAudit || {};
  const notice = data.statutoryNoticeLetter || '';
  const steps = data.actionPlan || [];
  const warnings = data.warnings || [];

  const cancelBadge = canc.canCancelWithoutPenalty ?
    `<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">STATUTORY CANCELLATION RIGHT ACTIVE (${canc.cancellationWindowRemainingDays}D REMAINING)</span>` :
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">STATUTORY CANCELLATION EXPIRED</span>';

  const voidBadge = bnd.isContractVoidAbInitio ?
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">VOID AB INITIO (BANNED DOOR-TO-DOOR SALE)</span>' : '';

  const voidBannerHtml = bnd.isContractVoidAbInitio ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 UNENFORCEABLE TRANSACTION: VOID FROM INCEPTION (Ontario CPA Part IV.1 &amp; O. Reg. 17/18)
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0-0-0_35rem-0">
        ${bnd.violationDetail || ''}
      </p>
      <p data-s="font-size-0_82rem color-991b1b margin-0 font-weight-600">
        Consumer Legal Remedy: You have no obligation to pay contract buyouts. The supplier must retrieve installed appliances at their sole cost.
      </p>
    </div>
  ` : '';

  const unfairHtml = unfair.hasUnfairPractices ? `
    <div data-s="margin-top-1rem background-fffbeb border-1px-solid-d97706 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-b45309 font-size-0_85rem margin-bottom-0_35rem">
        ⚠️ STATUTORY RESCISSION FOR UNFAIR PRACTICES (CPA ss. 14, 15, 18)
      </div>
      <p data-s="font-size-0_82rem color-92400e margin-0">
        ${unfair.statutoryFinding || ''}
      </p>
    </div>
  ` : '';

  const noticeHtml = notice ? `
    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-1rem">
      <div data-s="display-flex align-items-center justify-content-space-between margin-bottom-0_5rem">
        <strong data-s="font-size-0_88rem">📄 Formal Statutory Cancellation &amp; Rescission Notice</strong>
        <button type="button" class="secondary" id="cp-copy-notice-btn" data-s="font-size-0_75rem padding-0_25rem-0_6rem">Copy Notice Text 📋</button>
      </div>
      <pre data-s="white-space-pre-wrap background-surface-sunken padding-0_85rem border-radius-6px font-size-0_8rem font-family-monospace border-1px-solid-border max-height-280px overflow-y-auto" id="cp-notice-text">${notice}</pre>
    </div>
  ` : '';

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Enforcement Roadmap</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_35rem"><strong>${s.title}:</strong> ${s.action}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Consumer Legal Protections</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${cancelBadge}
        ${voidBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">Consumer Rights &amp; Contract Cancellation Audit (${data.province || 'ON'})</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">${canc.statutoryBasis || ''}</p>
    </div>

    ${voidBannerHtml}
    ${unfairHtml}

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Contract Value</span>
        <strong data-s="font-size-1_1rem color-text">$${(data.contractValueCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Days Since Contract</span>
        <strong data-s="font-size-1_1rem color-text">${timing.daysElapsedSinceContract || 0} Days</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">10-Day Cooling-Off</span>
        <strong data-style="font-size:1.1rem;color:${timing.isWithinStandard10DayCoolingOff ? '#16a34a' : 'var(--text-muted)'};">${timing.isWithinStandard10DayCoolingOff ? 'Active' : 'Expired'}</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Refund Deadline Upon Notice</span>
        <strong data-s="font-size-1_1rem color-16a34a">15 Calendar Days (CPA s. 43)</strong>
      </div>
    </div>

    ${noticeHtml}
    ${stepsHtml}
    ${warningsHtml}
  `;

  const copyBtn = container.querySelector('#cp-copy-notice-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = container.querySelector('#cp-notice-text')?.textContent || '';
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy Notice Text 📋'; }, 2000);
        }).catch(() => {});
      }
    });
  }
}

export function renderFamilyLawAssessment(data, container) {
  if (!data || !container) return;

  const child = data.childSupport || {};
  const spousal = data.spousalSupport || {};
  const prop = data.propertyEqualization || {};
  const newcomer = data.newcomerSpecificAudits || {};
  const steps = data.actionPlan || [];
  const warnings = data.warnings || [];

  const childBadge = child.numberOfChildren > 0 ?
    `<span class="badge" data-s="background-0284c7 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">CHILD SUPPORT: $${(child.monthlyTableAmountCad || 0).toLocaleString('en-CA')}/MO (${child.numberOfChildren} KIDS)</span>` :
    '<span class="badge" data-s="background-64748b color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">NO CHILD SUPPORT</span>';

  const spousalBadge = spousal.isEligible && (spousal.monthlySupportRangeCad?.high || 0) > 0 ?
    `<span class="badge" data-s="background-7c3aed color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">SPOUSAL SUPPORT: $${spousal.monthlySupportRangeCad.low} - $${spousal.monthlySupportRangeCad.high}/MO</span>` :
    '<span class="badge" data-s="background-64748b color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">NO SPOUSAL SUPPORT</span>';

  const eqBadge = prop.equalizationPaymentCad > 0 ?
    `<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">EQUALIZATION PAYMENT: $${prop.equalizationPaymentCad.toLocaleString('en-CA')} CAD</span>` :
    '<span class="badge" data-s="background-64748b color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">$0 EQUALIZATION PAYMENT</span>';

  const commonLawPropertyWarning = data.maritalStatus === 'common_law' && data.province === 'ON' ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 COMMON-LAW PROPERTY DIVISION RESTRICTION (Ontario FLA Part I)
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0">
        Under Ontario law, common-law partners have <strong>$0 automatic property equalization entitlement</strong>! Property division rights only apply to legally married spouses under Part I. Any claim to shared assets requires complex equitable trust or joint family venture litigation.
      </p>
    </div>
  ` : '';

  const undertakingWarning = newcomer.hasActiveSponsorshipUndertaking ? `
    <div data-s="margin-top-1rem background-fffbeb border-1px-solid-d97706 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-b45309 font-size-0_85rem margin-bottom-0_35rem">
        ⚠️ ACTIVE IMMIGRATION SPONSORSHIP UNDERTAKING (IRPA s. 132)
      </div>
      <p data-s="font-size-0_82rem color-92400e margin-0">
        ${newcomer.sponsorshipLiabilityWarning}
      </p>
    </div>
  ` : '';

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Family Law Roadmap</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_35rem"><strong>${s.title}:</strong> ${s.action}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Statutory Cautions &amp; Matrimonial Home Rules</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${childBadge}
        ${spousalBadge}
        ${eqBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">Child &amp; Spousal Support &amp; Asset Equalization Assessment (${data.province || 'ON'})</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">${data.maritalStatus === 'married' ? 'Legally Married' : 'Common-Law Partnership'} (${data.relationshipYears || 0} years) | ${child.numberOfChildren || 0} Child(ren)</p>
    </div>

    ${commonLawPropertyWarning}
    ${undertakingWarning}

    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 font-size-0_88rem margin-bottom-0_4rem">Net Family Property (NFP) Equalization</div>
      <div data-s="display-flex gap-1_5rem flex-wrap-wrap font-size-0_82rem margin-bottom-0_4rem">
        <div><strong>Payer NFP:</strong> $${(prop.payerNfpCad || 0).toLocaleString('en-CA')} CAD</div>
        <div><strong>Recipient NFP:</strong> $${(prop.recipientNfpCad || 0).toLocaleString('en-CA')} CAD</div>
        <div><strong>Equalization Amount:</strong> <span data-s="font-weight-700 color-primary">$${(prop.equalizationPaymentCad || 0).toLocaleString('en-CA')} CAD (${prop.payingParty || 'None'})</span></div>
      </div>
      <p data-s="font-size-0_8rem color-text-muted margin-0">${prop.statutoryBasis || ''}</p>
    </div>

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Monthly Child Support (CSG)</span>
        <strong data-s="font-size-1_1rem color-0284c7">$${(child.monthlyTableAmountCad || 0).toLocaleString('en-CA')} CAD/mo</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Annual Child Support</span>
        <strong data-s="font-size-1_1rem color-text">$${(child.annualChildSupportCad || 0).toLocaleString('en-CA')} CAD/yr</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Monthly Spousal Support (SSAG Range)</span>
        <strong data-s="font-size-1_1rem color-7c3aed">$${spousal.monthlySupportRangeCad?.low || 0} - $${spousal.monthlySupportRangeCad?.high || 0} CAD/mo</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Estimated Support Duration</span>
        <strong data-s="font-size-1_1rem color-text">${spousal.durationRangeYears?.isIndefinite ? 'Indefinite' : `${spousal.durationRangeYears?.low || 0} - ${spousal.durationRangeYears?.high || 0} Years`}</strong>
      </div>
    </div>

    ${stepsHtml}
    ${warningsHtml}
  `;
}

export function renderSocialAssistanceAssessment(data, container) {
  if (!data || !container) return;

  const elig = data.eligibility || {};
  const asset = data.assetAudit || {};
  const ben = data.benefitCalculation || {};
  const sponsor = data.sponsorshipUndertakingImpact;
  const steps = data.actionPlan || [];
  const warnings = data.warnings || [];

  const overallBadge = elig.isOverallEligible ?
    '<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">STATUTORILY ELIGIBLE FOR DISBURSEMENT</span>' :
    '<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">INELIGIBLE (ASSET OR STATUS THRESHOLD)</span>';

  const assetBadge = asset.isWithinAssetLimit ?
    `<span class="badge" data-s="background-16a34a color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">ASSETS COMPLIANT ($${(asset.liquidAssetsCad || 0).toLocaleString('en-CA')} / $${(asset.statutoryAssetLimitCad || 0).toLocaleString('en-CA')} LIMIT)</span>` :
    `<span class="badge" data-s="background-dc2626 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">EXCEEDS ASSET LIMIT (+$${(asset.excessAssetsCad || 0).toLocaleString('en-CA')} CAD)</span>`;

  const statusBadge = elig.isStatusEligible ?
    '<span class="badge" data-s="background-2563eb color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">IMMIGRATION STATUS SATISFIED</span>' :
    '<span class="badge" data-s="background-d97706 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_75rem font-weight-700">TEMPORARY RESIDENT STATUS BAR</span>';

  const sponsorWarningHtml = sponsor && sponsor.isDefaultTriggered ? `
    <div data-s="margin-top-1rem background-fef2f2 border-1px-solid-dc2626 border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 color-dc2626 font-size-0_85rem margin-bottom-0_35rem">
        🚨 CRITICAL IMMIGRATION SPONSORSHIP DEFAULT LIABILITY (IRPA s. 132)
      </div>
      <p data-s="font-size-0_82rem color-7f1d1d margin-0-0-0_35rem-0">
        ${sponsor.legalImpact}
      </p>
      <p data-s="font-size-0_82rem color-991b1b margin-0 font-weight-600">
        Undertaking Debt: Your Canadian sponsor will receive an official collection notice from the province demanding full reimbursement and will be barred from sponsoring anyone else under IRPR s. 133(1)(j).
      </p>
    </div>
  ` : '';

  const stepsHtml = steps.length ? `
    <div data-s="margin-top-1rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_5rem font-size-0_85rem">Application &amp; Reporting Roadmap</strong>
      <ol data-s="margin-0 padding-left-1_25rem font-size-0_82rem color-text-muted">
        ${steps.map(s => `<li data-s="margin-bottom-0_35rem"><strong>${s.title}:</strong> ${s.action}</li>`).join('')}
      </ol>
    </div>
  ` : '';

  const warningsHtml = warnings.length ? `
    <div data-s="margin-top-0_75rem background-surface-sunken padding-0_75rem-1rem border-radius-6px border-1px-solid-border">
      <strong data-s="display-block margin-bottom-0_4rem font-size-0_85rem">Statutory Cautions &amp; Tribunal Appeal Rights</strong>
      <ul data-s="margin-0 padding-left-1_2rem font-size-0_82rem color-text-muted">
        ${warnings.map(w => `<li data-s="margin-bottom-0_2rem">${w}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="result-header" data-s="margin-bottom-1rem">
      <div data-s="display-flex align-items-center gap-0_5rem flex-wrap-wrap margin-bottom-0_5rem">
        ${overallBadge}
        ${assetBadge}
        ${statusBadge}
      </div>
      <h4 data-s="margin-0_25rem-0 font-size-1_1rem">${data.program || 'Ontario Social Assistance'} Audit</h4>
      <p data-s="margin-0 font-size-0_85rem color-text-muted">${elig.statusGuidance || ''}</p>
    </div>

    ${sponsorWarningHtml}

    <div data-s="margin-top-1rem background-bg-card border-1px-solid-border border-radius-8px padding-0_85rem">
      <div data-s="font-weight-700 font-size-0_88rem margin-bottom-0_4rem">Monthly Benefit &amp; Clawback Calculation</div>
      <div data-s="display-flex gap-1_5rem flex-wrap-wrap font-size-0_82rem">
        <div><strong>Base Maximum Rate:</strong> $${(ben.baseMaximumMonthlyBenefitCad || 0).toLocaleString('en-CA')} CAD/mo</div>
        <div><strong>Gross Earnings:</strong> $${(ben.grossEmploymentEarningsCad || 0).toLocaleString('en-CA')} CAD/mo</div>
        <div><strong>Earnings Exemption:</strong> $${(ben.flatEarningsExemptionCad || 0).toLocaleString('en-CA')} CAD/mo (0% clawback)</div>
        <div><strong>Net Monthly Deduction:</strong> -$${(ben.netMonthlyDeductionCad || 0).toLocaleString('en-CA')} CAD (${ben.clawbackRatePercent || 0}% rate)</div>
        <div><strong>Estimated Monthly Payment:</strong> <span data-s="font-weight-700 color-primary">$${(ben.estimatedMonthlyDisbursementCad || 0).toLocaleString('en-CA')} CAD/mo</span></div>
      </div>
    </div>

    <div data-s="margin-top-1rem display-flex flex-wrap-wrap gap-1_5rem">
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Your Liquid Assets</span>
        <strong data-s="font-size-1_1rem color-text">$${(asset.liquidAssetsCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Statutory Asset Ceiling</span>
        <strong data-s="font-size-1_1rem color-text">$${(asset.statutoryAssetLimitCad || 0).toLocaleString('en-CA')} CAD</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Primary Residence</span>
        <strong data-s="font-size-1_1rem color-16a34a">${asset.primaryResidenceExempt ? 'Statutorily Exempt' : 'Rented / Non-Owner'}</strong>
      </div>
      <div>
        <span class="muted" data-s="font-size-0_78rem display-block">Primary Vehicle Exemption</span>
        <strong data-style="font-size:1.1rem;color:${asset.primaryVehicle?.isExempt ? '#16a34a' : '#d97706'};">${asset.primaryVehicle?.isExempt ? 'Fully Exempt' : `+$${(asset.primaryVehicle?.nonExemptValueCad || 0).toLocaleString('en-CA')} Non-Exempt`}</strong>
      </div>
    </div>

    ${stepsHtml}
    ${warningsHtml}
  `;
}

// Residential Tenancy Repairs, Vital Services & Rent Withholding Defense
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
export function renderHighCostCreditAssessment(data, container) {
  if (!container) return;
  container.replaceChildren();

  const card = el('div', undefined, 'banking-card');

  // Status banner
  const bannerClass = data.defenseVerdict === 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE' ? 'alert-box error' : 'alert-box success';
  const banner = el('div', undefined, bannerClass);
  const title = el('strong', data.defenseVerdict === 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE' ? 'STATUTORY CREDIT BREACHES DETECTED: Remedies Available' : 'Credit Agreement Within Statutory Thresholds');
  const desc = el('p', `Loan Type: ${data.loanType} · Principal: $${data.principalBorrowedCad.toLocaleString()} CAD · Term: ${data.termDays} days`);
  banner.append(title, desc);
  card.append(banner);

  // Key metrics
  const grid = el('div', undefined, 'u-stat-grid u-mt-100');
  const s1 = el('div', undefined, 'stat-card');
  s1.append(el('span', 'Illegal Fee Overcharge', 'stat-label'));
  s1.append(el('strong', `$${data.illegalOverchargeCad.toFixed(2)} CAD`, 'stat-value font-bold'));
  s1.append(el('span', `Statutory cap: $${data.statutoryMaxFeesCad.toFixed(2)} vs Charged: $${data.feesChargedCad.toFixed(2)}`, 'stat-sub'));

  const s2 = el('div', undefined, 'stat-card');
  s2.append(el('span', 'Stated Interest Rate', 'stat-label'));
  s2.append(el('strong', `${data.statedAprPercent}% APR`, 'stat-value font-bold'));
  s2.append(el('span', data.statedAprPercent > 35 ? 'Exceeds 35% Criminal Code cap' : 'Below 35% criminal threshold', 'stat-sub'));

  const s3 = el('div', undefined, 'stat-card');
  s3.append(el('span', '2-Day Cooling-Off Cancellation', 'stat-label'));
  s3.append(el('strong', data.withinCoolingOffPeriod ? 'Active (Eligible)' : 'Window Expired', 'stat-value font-bold'));
  s3.append(el('span', data.withinCoolingOffPeriod ? 'Cancel with $0 fee by returning principal' : `Statutory window: ${data.coolingOffDaysAllowed} days`, 'stat-sub'));

  grid.append(s1, s2, s3);
  card.append(grid);

  // Statutory violations
  if (data.statutoryViolations && data.statutoryViolations.length > 0) {
    const violBox = el('div', undefined, 'u-sunken-box u-mt-100');
    violBox.append(el('strong', 'Statutory Lender Violations & Defenses:', 'u-section-label'));
    data.statutoryViolations.forEach(v => {
      const vEl = el('div', undefined, 'u-mt-050');
      vEl.append(el('strong', `• ${v.title}: `));
      vEl.append(el('span', v.message));
      violBox.append(vEl);
    });
    card.append(violBox);
  }

  // Demand Letter
  const docContainer = el('div', undefined, 'u-mt-100');
  docContainer.append(el('strong', 'Pre-Litigation Rescission & Refund Demand Notice (Ready to Copy/Serve):', 'u-section-label'));
  const pre = el('pre', data.demandLetter, 'u-sunken-box u-mt-050');
  docContainer.append(pre);

  const copyBtn = el('button', 'Copy Demand Notice to Clipboard 📋', 'secondary u-mt-050');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(data.demandLetter).then(() => {
      copyBtn.textContent = 'Copied to Clipboard! ✓';
      setTimeout(() => { copyBtn.textContent = 'Copy Demand Notice to Clipboard 📋'; }, 2500);
    }).catch(() => {});
  });
  docContainer.append(copyBtn);
  card.append(docContainer);

  container.append(card);
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

export function renderCrossBorderTaxAssessment(data, container) {
  if (!data || !container) return;
  const { craAudit, irsAudit, riskFlags, actionChecklist } = data;

  const t1135Req = craAudit?.t1135Required;
  const fbarReq = irsAudit?.fbarFinCen114Required;

  let html = `
    <div class="result-summary ${(t1135Req || fbarReq) ? 'warning' : 'success'}">
      <div class="u-flex-between">
        <span class="badge ${(t1135Req || fbarReq) ? 'warning' : 'success'}">${(t1135Req || fbarReq) ? 'FILINGS MANDATORY' : 'NO REPORTING TRIGGERED'}</span>
        <span class="muted">Tax Year: ${data.taxYear ?? 2026}</span>
      </div>
      <h4 class="u-mt-50">CRA Form T1135: ${t1135Req ? `Required (${craAudit.t1135Tier})` : (craAudit?.firstYearExemptionApplied ? 'Exempt (First-Year Immigrant)' : 'Not Required')} | IRS FBAR: ${fbarReq ? 'Required' : 'Below $10k'}</h4>
      <p class="u-text-sm">Cost basis: $${craAudit?.foreignCostBasisCad ?? 0} CAD | Peak US foreign accounts: $${irsAudit?.peakBalanceReportedUsd ?? 0} USD</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">CRA T1135 Filing</span>
        <span class="metric-value">${t1135Req ? 'Required' : (craAudit?.firstYearExemptionApplied ? 'First-Yr Exempt' : 'Exempt')}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">FinCEN 114 (FBAR)</span>
        <span class="metric-value">${fbarReq ? 'Mandatory' : 'Not Triggered'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Form 8938 (FATCA)</span>
        <span class="metric-value">${irsAudit?.form8938Required ? 'Required' : 'Below Limit'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">PFIC Exposure</span>
        <span class="metric-value">${irsAudit?.pficExposureWarning ? 'HIGH RISK' : 'Safe'}</span>
      </div>
    </div>
  `;

  if (riskFlags && riskFlags.length > 0) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>⚠️ Cross-Border Tax Traps & Penalties</h5>
        <ul>${riskFlags.map(rf => `<li>${rf}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionChecklist && actionChecklist.length > 0) {
    html += `
      <div class="checklist-card u-mt-100">
        <h5>📋 Dual-Jurisdiction Compliance Action Steps</h5>
        <div class="u-grid-200 u-mt-50">
          ${actionChecklist.map(a => `
            <div class="check-item ${a.urgency === 'immediate' ? 'danger' : 'info'}">
              <strong>[${a.jurisdiction}] ${a.item}</strong>
              <p class="muted u-text-xs">${a.description}</p>
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

export function renderHealthcarePortabilityAssessment(data, container) {
  if (!data || !container) return;
  const { schemeName, eligibleForProvincialHealthcare, ifhpActive, coverageStartDate, waitingPeriodDays, needsPrivateBridgingInsurance, notes, riskWarnings, requiredDocuments } = data;

  const isCovered = eligibleForProvincialHealthcare || ifhpActive;
  const badgeClass = isCovered ? (needsPrivateBridgingInsurance ? 'warning' : 'success') : 'danger';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${isCovered ? (needsPrivateBridgingInsurance ? 'WAITING PERIOD APPLIES' : 'IMMEDIATE COVERAGE') : 'INELIGIBLE'}</span>
        <span class="muted">Effective Date: ${coverageStartDate ?? 'Immediate'}</span>
      </div>
      <h4 class="u-mt-50">${schemeName}: ${waitingPeriodDays > 0 ? `${waitingPeriodDays}-Day Waiting Period` : 'Immediate Public Coverage'}</h4>
      <p class="u-text-sm">${needsPrivateBridgingInsurance ? 'Mandatory private bridging health insurance required until provincial coverage takes effect.' : 'No private bridging insurance required.'}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Waiting Period</span>
        <span class="metric-value">${waitingPeriodDays} Days</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Effective Date</span>
        <span class="metric-value">${coverageStartDate}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Bridging Insurance</span>
        <span class="metric-value">${needsPrivateBridgingInsurance ? 'Mandatory' : 'Not Required'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">IFHP Federal Coverage</span>
        <span class="metric-value">${ifhpActive ? 'Active (Medavie)' : 'None'}</span>
      </div>
    </div>
  `;

  if (riskWarnings && riskWarnings.length > 0) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>⚠️ Critical Eligibility Notices</h5>
        <ul>${riskWarnings.map(rw => `<li>${rw}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (notes && notes.length > 0) {
    html += `
      <div class="alert-box info u-mt-100">
        <h5>ℹ️ Statutory & Portability Rules</h5>
        <ul>${notes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (requiredDocuments && requiredDocuments.length > 0) {
    html += `
      <div class="checklist-card u-mt-100">
        <h5>📑 Mandatory Registration Documentation Checklist</h5>
        <div class="u-grid-200 u-mt-50">
          ${requiredDocuments.map(rd => `
            <div class="check-item pass">
              <strong>✓ ${rd}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

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

export function renderOasGisAssessment(data, container) {
  if (!data || !container) return;
  const { oasEligibility, gisEligibility, totalization, oasClawback, statutoryNotes, actionPlan } = data;

  const isOasEligible = oasEligibility?.isEligible;
  const badgeClass = isOasEligible ? 'success' : 'warning';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${isOasEligible ? 'OAS PENSION ELIGIBLE' : 'RESIDENCE THRESHOLD NOT MET'}</span>
        <span class="muted">${oasEligibility?.pensionFraction ?? '0/40'} Residence Share</span>
      </div>
      <h4 class="u-mt-50">Estimated Monthly OAS: $${oasEligibility?.estimatedMonthlyPensionCad ?? 0} CAD / Month</h4>
      <p class="u-text-sm">${oasEligibility?.reason ?? ''}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">OAS Monthly</span>
        <span class="metric-value">$${oasEligibility?.estimatedMonthlyPensionCad ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">GIS Status</span>
        <span class="metric-value">${gisEligibility?.isEligible ? `$${gisEligibility?.estimatedMonthlyGisCad}/mo` : 'Barred / Ineligible'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Portability Abroad</span>
        <span class="metric-value">${oasEligibility?.isPortableAbroadIndefinitely ? 'Indefinite (20+ Yrs)' : 'Max 6 Months'}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Recovery Tax Clawback</span>
        <span class="metric-value">${oasClawback?.clawbackApplies ? `$${oasClawback?.annualOasRecoveryTaxCad}/yr` : '$0 (Below Limit)'}</span>
      </div>
    </div>
  `;

  if (gisEligibility?.sponsorshipUndertakingBarActive) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>Family Class Sponsorship GIS Bar (OASA s. 11(7))</h5>
        <p class="u-text-sm">Sponsored seniors are strictly prohibited from receiving GIS during their sponsorship undertaking (${gisEligibility?.sponsorshipYearsRemaining ?? 0} years remaining). Any GIS collected triggers statutory Crown debt recovery against the sponsor.</p>
      </div>
    `;
  }

  if (totalization?.agreementExists) {
    html += `
      <div class="info-card u-mt-100">
        <h5>International Social Security Totalization (${totalization?.agreementCountryName})</h5>
        <p class="u-text-sm">Foreign Credit Applied: <strong>${totalization?.foreignYearsCredited ?? 0} Years</strong> | Combined Total: <strong>${totalization?.combinedYears ?? 0} Years</strong> (Meets 10-year threshold: ${totalization?.meetsThresholdWithTotalization ? 'YES' : 'NO'})</p>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Recommended Service Canada Next Steps</h5>
        <ul>
          ${actionPlan.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (statutoryNotes?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory References</h5>
        <ul>
          ${statutoryNotes.map(n => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function renderFranchiseDisclosureAssessment(data, container) {
  if (!data || !container) return;
  const { disclosureAudit, rescissionRemedies, statutoryRestitution, deficienciesIdentified, statutoryProtections, formalRescissionNotice } = data;

  const hasRescission = rescissionRemedies?.rescissionAvailable;
  const is2Year = rescissionRemedies?.isTwoYearRescission;
  const badgeClass = hasRescission ? (is2Year ? 'danger' : 'warning') : 'success';

  let html = `
    <div class="result-summary ${badgeClass}">
      <div class="u-flex-between">
        <span class="badge ${badgeClass}">${hasRescission ? (is2Year ? '2-YEAR ABSOLUTE RESCISSION ACTIVE' : '60-DAY RESCISSION ACTIVE') : 'DISCLOSURE FULLY COMPLIANT'}</span>
        <span class="muted">${rescissionRemedies?.statutoryDeadlineText ?? ''}</span>
      </div>
      <h4 class="u-mt-50">Total Statutory Restitution Claim: $${statutoryRestitution?.totalStatutoryDamagesClaimCad?.toLocaleString() ?? 0} CAD</h4>
      <p class="u-text-sm">${rescissionRemedies?.basis ?? 'No statutory rescission rights currently available.'}</p>
    </div>

    <div class="metrics-grid u-grid-4 u-mt-100">
      <div class="metric-card">
        <span class="metric-label">Franchise Fee Refund</span>
        <span class="metric-value">$${statutoryRestitution?.franchiseFeeRefundCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Equipment Repurchase</span>
        <span class="metric-value">$${statutoryRestitution?.equipmentRepurchaseCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Inventory Repurchase</span>
        <span class="metric-value">$${statutoryRestitution?.inventoryRepurchaseCad?.toLocaleString() ?? 0}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Operating Losses</span>
        <span class="metric-value">$${statutoryRestitution?.operatingLossReimbursementCad?.toLocaleString() ?? 0}</span>
      </div>
    </div>
  `;

  if (deficienciesIdentified?.length) {
    html += `
      <div class="alert-box danger u-mt-100">
        <h5>Statutory Disclosure Deficiencies</h5>
        <ul>
          ${deficienciesIdentified.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (statutoryProtections?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Arthur Wishart Act Protections</h5>
        <ul>
          ${statutoryProtections.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (formalRescissionNotice) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Notice of Rescission Draft</h5>
        <pre class="u-text-sm" data-s="white-space-pre-wrap background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">${formalRescissionNotice}</pre>
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

export function renderChildWelfareAssessment(data, container) {
  const {
    youthName,
    pathway,
    summaryTitle,
    isVysaEligible,
    isKinshipPriority,
    isDirectCitizenshipGrantEligible,
    compliancePoints,
    statutoryProtections,
    riskWarnings,
    actionPlan,
    statutoryBasis
  } = data;

  const isEligible = isVysaEligible || isKinshipPriority || isDirectCitizenshipGrantEligible;
  const statusClass = isEligible ? 'success' : 'warning';

  let html = `
    <div class="alert-box ${statusClass}">
      <h4>${summaryTitle}</h4>
      <p><strong>Youth/Child:</strong> ${escapeHtml(youthName)} | <strong>Pathway:</strong> ${escapeHtml(pathway)}</p>
      <p class="u-text-sm muted">${statutoryBasis}</p>
    </div>
  `;

  if (statutoryProtections?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Statutory Rights &amp; Protections</h5>
        <ul>${statutoryProtections.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (compliancePoints?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Established Eligibility Points</h5>
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

  if (riskWarnings?.length) {
    html += `
      <div class="alert-box error u-mt-100">
        <h5>Legal Considerations</h5>
        <ul>${riskWarnings.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Recommended Action Plan</h5>
        <ol>${actionPlan.map(a => `<li>${a}</li>`).join('')}</ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// 57. EXCESSIVE DEMAND MITIGATION ENGINE
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

export function renderChildCareSubsidyAssessment(data, container) {
  const {
    applicantName,
    province,
    municipality,
    summaryTitle,
    subsidyCalculation,
    childAudits,
    compliancePoints,
    statutoryNotes,
    actionPlan
  } = data;

  let html = `
    <div class="alert-box success">
      <h4>${summaryTitle}</h4>
      <p><strong>Applicant:</strong> ${escapeHtml(applicantName)} | <strong>Municipality:</strong> ${escapeHtml(municipality)} (${escapeHtml(province)})</p>
    </div>

    <div class="u-stat-grid u-mt-100">
      <div class="stat-card">
        <span class="stat-val">${subsidyCalculation?.actualMonthlyParentPaymentWithSubsidyCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Your Estimated Monthly Payment</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${subsidyCalculation?.monthlyMunicipalSubsidyBenefitCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Monthly Municipal Subsidy Benefit</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">${subsidyCalculation?.totalMarketMonthlyFeeAllKidsCad?.toFixed(2) || '0.00'} CAD</span>
        <span class="stat-lbl">Full Market Rate (Unsubsidized)</span>
      </div>
    </div>
  `;

  if (childAudits?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Child Care Rates &amp; Tax Deduction Ceilings</h5>
        <div class="u-grid-200 u-mt-50">
          ${childAudits.map(c => `
            <div class="stat-card">
              <span class="stat-val">Child #${c.childIndex} (Age ${c.ageYears})</span>
              <p class="u-text-sm">CWELCC Fee: ${c.cwelccDiscountedMonthlyFeeCad?.toFixed(2)} CAD/mo (${c.isCwelccEligible ? '52.75% Discount Applied' : 'Standard Rate'})</p>
              <p class="u-text-sm muted">T778 Tax Limit: ${c.t778MaxTaxDeductionCad?.toLocaleString()} CAD/yr</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (compliancePoints?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Eligibility Standards</h5>
        <ul>${compliancePoints.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (actionPlan?.length) {
    html += `
      <div class="info-card u-mt-100">
        <h5>Application Steps</h5>
        <ol>${actionPlan.map(a => `<li>${a}</li>`).join('')}</ol>
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
// 62. BC STRATA PROPERTY BYLAW DEFENSE
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
