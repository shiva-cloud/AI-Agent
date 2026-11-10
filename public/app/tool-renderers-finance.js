import { $, el, escapeHtml } from './core.js';

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

