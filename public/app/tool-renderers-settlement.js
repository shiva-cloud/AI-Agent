import { $, escapeHtml } from './core.js';

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

