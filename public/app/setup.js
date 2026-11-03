import {buildWizardPlan, validateWizardProfile} from './wizard-plan.js';
// View setup: wires forms, buttons and switchers for each view and tool.
// Split out of public/app.js; app.js imports what it uses from here.
import { autoRun } from '../plan-access.js';
import { $, el, escapeHtml, formatIsoDate, generateDisputeLetterText, runCVAudit, updateCityDropdown, viewToolControllers, appendAssumptionNote } from './core.js';
import { CUSTOMS_PRESETS, ISPA_VACCINES, SAMPLE_NON_COMPLIANT_CV, TENANCY_JURISDICTIONS, TOOL_SWITCHER_CONFIG } from './data.js';
import { renderAlbertaOpportunityStreamResults, renderAlbertaSecurityDepositResults, renderBcSpeculationTaxDeclarationResults, renderBorderFlagpolingResults, renderCareersSuite, renderCashflow, renderChildDisabilityBenefitResults, renderDrugSearch, renderFamilyReunificationResults, renderForeignWorkerTransitionResults, renderHealthcareEligibility, renderHealthcareSuite, renderInternationallyTrainedNurseResults, renderIspaAudit, renderManitobaPnpSkilledWorkerResults, renderNewcomerBudget, renderPathway, renderPaycheckSimulator, renderPrCardRenewalResults, renderPrMatrixResults, renderPreFlightAudit, renderPrtdHumanitarianResults, renderSchoolsSuite, renderSeveranceReasonableNoticeResults, renderTaxEngine, renderTaxShieldResults, renderTenancyWizard, renderTimelineCalendarSyncResults } from './renderers.js';
import { renderAtlanticImmigrationAssessment, renderAutoInsuranceAssessment, renderBankingComparatorAssessment, renderBcStrataBylawAssessment, renderBowpAssessment, renderBusinessStructureAssessment, renderChildCareSubsidyAssessment, renderChildWelfareAssessment, renderChildcareSupportAssessment, renderCitizenshipAssessment, renderCommercialLeaseAssessment, renderConsumerProtectionAssessment, renderCraBenefitsAssessment, renderCraVdpAssessment, renderCredentialLicensureAssessment, renderCriminalRehabAssessment, renderCrossBorderTaxAssessment, renderCurrencyExchangeAssessment, renderCustomsDeclarationAssessment, renderDebtCollectionAssessment, renderDigitalPlatformWorkerAssessment, renderEiDisqualificationAssessment, renderEmploymentReferenceAssessment, renderEstatePlanningAssessment, renderEvictionDefenseAssessment, renderExcessiveDemandAssessment, renderExpressEntryAssessment, renderFamilyLawAssessment, renderFranchiseDisclosureAssessment, renderFrancophoneMobilityAssessment, renderHealthcarePortabilityAssessment, renderHighCostCreditAssessment, renderHomebuyerAssessment, renderHomebuyerTaxAssessment, renderHumanRightsAssessment, renderIdentityHarmonizationAssessment, renderLeaseAssignmentAssessment, renderLeaseGuardAssessment, renderMedicalAdmissibilityAssessment, renderMovingTaxAssessment, renderOasGisAssessment, renderParentalLeaveAssessment, renderPetImportAssessment, renderPgwpAssessment, renderPnpAssessment, renderPrResidencyAssessment, renderRealEstateAssignmentAssessment, renderRentIncreaseAssessment, renderRuralRenewalAssessment, renderSmallClaimsAssessment, renderSocialAssistanceAssessment, renderSowpAssessment, renderSpeculationTaxAssessment, renderStatutoryPayAssessment, renderStudentWorkComplianceAssessment, renderSuperVisaAssessment, renderTelecomAssessment, renderTenancyRepairsAssessment, renderTfwComplianceAssessment, renderVehicleImportAssessment, renderVulnerableWorkerAssessment, renderWorkerClassificationAssessment, renderWorkplaceSafetyAssessment } from './tool-renderers.js';

// Cross-Country Pathway Comparator
export function setupPathwayComparator() {
  const form = $('#pathway-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    renderPathway();
  });
}

export function setupCashflowPlanner() {
  const form = $('#cashflow-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    renderCashflow();
  });
}

export function setupNewcomerBudgetSuite() {
  const calcBtn = $('#budget-calc-btn');
  if (!calcBtn) return;

  const runCalc = async () => {
    const resultsContainer = $('#budget-results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '<p class="muted">Calculating statutory Canadian budget and runway...</p>';

    const city = $('#budget-city')?.value || 'Calgary';
    const household = $('#budget-household')?.value || 'single';
    const accommodation = $('#budget-housing')?.value || '1bed';
    const savingsCad = Number($('#budget-savings')?.value || 25000);

    try {
      const res = await fetch(`/v1/tools/newcomer-budget?city=${encodeURIComponent(city)}&household=${encodeURIComponent(household)}&accommodation=${encodeURIComponent(accommodation)}&savings=${savingsCad}&income=0`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      renderNewcomerBudget(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to calculate budget. Please check inputs and retry.</p></div>';
    }
  };

  calcBtn.addEventListener('click', runCalc);
}

export function evaluateTenancyDispute({ dest, issue, rent, demand }) {
  const j = TENANCY_JURISDICTIONS[dest] || TENANCY_JURISDICTIONS['CA-ON'];
  let status = 'illegal'; // 'illegal' | 'warn' | 'legal'
  let statusBadge = '⚠️ UNLAWFUL STATUTORY VIOLATION';
  let title = '';
  let citation = '';
  let lawfulLimit = 0;
  let lawfulText = '';
  let overcharge = 0;
  let summary = '';
  let playbook = [];

  if (issue === 'advance_rent') {
    title = 'Illegal Advance Rent Demand';
    if (dest === 'CA-ON') {
      lawfulLimit = rent * 2;
      citation = 'Ontario Residential Tenancies Act 2006, Section 105, 106 & 134(1)';
      summary = 'Under Ontario RTA s.134(1), landlords cannot demand, receive, or require any payment or deposit other than first month rent and a last month rent deposit. Demanding 6–12 months advance rent because you lack Canadian credit history is an offence punishable by fines up to $50,000.';
      playbook = [
        'Do NOT pay multiple months upfront. Offer lawful first and last month rent.',
        'Keep all landlord communications in writing (email/text).',
        'If you already paid, you can file LTB Form T1 for an immediate refund order.',
        'A landlord cannot refuse or terminate your tenancy for asserting statutory rights.'
      ];
    } else if (dest === 'CA-BC') {
      lawfulLimit = Math.round(rent * 1.5);
      citation = 'BC Residential Tenancy Act [SBC 2002] c. 78, Section 19 & 20';
      summary = 'Under BC RTA s.19, security deposits cannot exceed 1/2 of one month rent. Demanding months of upfront rent to bypass credit checks is unlawful.';
      playbook = [
        'Pay maximum 1 month rent + 1/2 month security deposit.',
        'File an application for dispute resolution with BC RTB if forced.'
      ];
    } else if (dest === 'UK') {
      lawfulLimit = Math.round(rent + (rent * 12 / 52 * 5));
      citation = 'UK Tenant Fees Act 2019, Section 1 & Schedule 1';
      summary = 'Under the Tenant Fees Act 2019, deposits are capped at 5 weeks rent. Demanding excessive advance rent or non-refundable holding fees is a prohibited payment subject to a £5,000 fine for first breach.';
      playbook = [
        'Refuse prohibited payments. Holding deposit capped at 1 week, security deposit capped at 5 weeks.',
        'Report breaches to local Trading Standards or First-tier Tribunal.'
      ];
    } else if (dest === 'DE') {
      lawfulLimit = rent * 2;
      citation = 'Bürgerliches Gesetzbuch (BGB) § 551 Abs. 1, 2 & 4';
      summary = 'Under § 551 Abs. 1 BGB, the Mietkaution cannot exceed 3 months net cold rent. Under § 551 Abs. 2, tenants have an absolute statutory right to pay in 3 equal monthly installments. Any clause demanding 100% upfront is void (§ 551 Abs. 4 BGB).';
      playbook = [
        'Pay 1st month rent + 1/3 of Kaution at move-in. Pay remaining 2/3 with next 2 months rent.',
        'Any agreement waiving your installment rights is legally void.'
      ];
    } else if (dest === 'US-CA') {
      lawfulLimit = rent * 2;
      citation = 'California Civil Code § 1950.5 (AB 12, effective July 1, 2024)';
      summary = 'Under Assembly Bill 12 (AB 12), California law strictly caps security deposits at maximum 1 month rent. Landlords cannot evade this cap by demanding months of advance rent.';
      playbook = [
        'State clearly that under AB 12, maximum deposit is 1 month rent.',
        'File in Small Claims Court if excess deposit is withheld.'
      ];
    } else if (dest === 'US-NY') {
      lawfulLimit = rent * 2;
      citation = 'NY Housing Stability and Tenant Protection Act of 2019 (HSTPA), Gen. Oblig. Law § 7-108';
      summary = 'Under New York HSTPA 2019, security deposits are capped at exactly 1 month rent. Landlords are prohibited from requiring multiple months of upfront rent.';
      playbook = [
        'Refuse multi-month upfront demands; HSTPA mandates 1 month deposit maximum.',
        'File complaint with DHCR Tenant Protection Unit.'
      ];
    } else if (dest === 'AU-NSW' || dest === 'AU-VIC') {
      lawfulLimit = dest === 'AU-NSW' ? Math.round(rent * 1.5) : rent * 2;
      citation = dest === 'AU-NSW' ? 'NSW Residential Tenancies Act 2010 s.33 & s.159' : 'VIC Residential Tenancies Act 1997 s.31 & s.40';
      summary = 'Bond is strictly capped at 4 weeks rent and must be lodged with statutory authority (Rental Bonds Online / RTBA). Requiring months in advance is an offence.';
      playbook = [
        'Never transfer bond directly to landlord bank account without statutory lodgement receipt.',
        'Lodge dispute with NCAT / VCAT if illegal advance rent is demanded.'
      ];
    } else if (dest === 'AE') {
      lawfulLimit = rent * 3;
      citation = 'Dubai Law No. 26 of 2007 (Ejari Regulated)';
      status = 'warn';
      statusBadge = '⚖️ CONDITIONAL STATUTORY PROCEDURE';
      summary = 'Rent in Dubai is paid via post-dated cheques (1 to 4 cheques) registered in Ejari. Landlord demanding all cash without Ejari registration is a serious violation.';
      playbook = [
        'Insist on standard unified Ejari tenancy contract.',
        'Provide registered post-dated cheques; never pay large untraceable cash.'
      ];
    } else if (dest === 'IE') {
      lawfulLimit = rent * 2;
      citation = 'Residential Tenancies (No. 2) Act 2021';
      summary = 'Under the 2021 Act, upfront payments are capped at 1 month advance rent + 1 month deposit. Demanding more is unlawful.';
      playbook = ['Quote the Residential Tenancies Act 2021 cap.', 'File dispute with the RTB if landlord insists.'];
    } else {
      lawfulLimit = Math.round(rent * 1.5);
      citation = 'New Zealand Residential Tenancies Act 1986 s.18 & s.23';
      summary = 'Bond capped at 4 weeks rent and advance rent capped at 2 weeks. Excess demands violate statutory limits.';
      playbook = ['Bond must be lodged with Tenancy Services within 23 working days.', 'Apply to Tenancy Tribunal.'];
    }

    overcharge = demand > lawfulLimit ? demand - lawfulLimit : 0;
    lawfulText = `${j.symbol}${lawfulLimit.toLocaleString()} ${j.currency} (Lawful 1st Month + Statutory Deposit)`;
  } else if (issue === 'illegal_deposit') {
    title = 'Excessive Security, Damage, or Key Deposit';
    if (dest === 'CA-ON') {
      lawfulLimit = 50;
      citation = 'Ontario RTA 2006 s.134 & Ontario Regulation 516/06 s.17';
      summary = 'Damage deposits, cleaning deposits, and pet deposits are completely illegal in Ontario. Key deposits are legal ONLY if refundable and limited to direct replacement cost ($25–$50 max). Demanding hundreds of dollars is prohibited.';
      playbook = [
        'Damage deposits are $0 under Ontario law. Refuse any cleaning or damage deposit.',
        'Key deposit must equal actual key cutting or fob replacement cost.',
        'File LTB Form T1 to recover any illegal deposits already collected.'
      ];
    } else if (dest === 'UK') {
      lawfulLimit = Math.round(rent * 12 / 52 * 5);
      citation = 'Tenant Fees Act 2019 Schedule 1';
      summary = 'Tenancy deposits cannot exceed 5 weeks rent (or 6 weeks if annual rent £50,000+). Any excess or cleaning/inventory fee is illegal.';
      playbook = ['Landlord must protect deposit in DPS, TDS, or MyDeposits within 30 days.'];
    } else if (dest === 'DE') {
      lawfulLimit = rent * 3;
      citation = 'BGB § 551 Abs. 1';
      summary = 'Security deposit cannot exceed 3 months cold rent. Landlord must place it in a separate interest-bearing Mietkautionskonto.';
      playbook = ['Ensure deposit is deposited into a separate escrow account.'];
    } else {
      lawfulLimit = rent;
      citation = `${j.statute} (Deposit Caps)`;
      summary = `Deposit is strictly capped by statute. Demanding excess deposits violates ${j.name} residential tenancy protections.`;
      playbook = ['Do not pay excess deposit.', 'Demand official statutory receipt.'];
    }
    overcharge = demand > lawfulLimit ? demand - lawfulLimit : 0;
    lawfulText = `${j.symbol}${lawfulLimit.toLocaleString()} ${j.currency} (Statutory Limit)`;
  } else if (issue === 'rent_hike') {
    title = 'Unlawful Rent Increase';
    if (dest === 'CA-ON') {
      lawfulLimit = Math.round(rent * 1.025);
      citation = 'Ontario RTA 2006 s.116, s.119 & s.120';
      summary = 'Rent can only increase once every 12 months with 90 days written notice on official Form N1. For buildings occupied on or before Nov 15, 2018, increases are capped at the 2.5% guideline. Texts or informal emails are legally void.';
      playbook = [
        'Check if unit was occupied before Nov 15, 2018 (rent control applies).',
        'Require official Form N1 with 90 days notice.',
        'Continue paying lawful rent if notice is invalid.'
      ];
    } else if (dest === 'UK') {
      lawfulLimit = Math.round(rent * 1.05);
      citation = 'Housing Act 1988 Section 13';
      summary = 'Landlords must serve official Section 13 notice (Form 4) with minimum 1 month notice. Tenants can challenge unreasonable hikes at First-tier Tribunal.';
      playbook = ['Challenge hike at First-tier Tribunal before the effective date.'];
    } else if (dest === 'DE') {
      lawfulLimit = Math.round(rent * 1.10);
      citation = 'BGB § 556d (Mietpreisbremse) & § 558';
      summary = 'Under Mietpreisbremse, new rents cannot exceed local Mietspiegel by more than 10%. Existing leases capped at 15–20% increase over 3 years.';
      playbook = ['Issue a formal qualified complaint (Rüge) under § 556g Abs. 2 BGB.'];
    } else {
      lawfulLimit = Math.round(rent * 1.03);
      citation = `${j.statute} (Rent Review & Indexing)`;
      summary = `Rent increases are regulated and require statutory notice under ${j.name} law.`;
      playbook = ['Verify against official statutory rent index or tribunal guidelines.'];
    }
    overcharge = demand > lawfulLimit ? demand - lawfulLimit : 0;
    lawfulText = `${j.symbol}${lawfulLimit.toLocaleString()} ${j.currency}/mo (Statutory Guideline Limit)`;
  } else if (issue === 'unlawful_entry') {
    title = 'Landlord Entering Without Written Notice';
    status = 'illegal';
    statusBadge = '⚠️ BREACH OF STATUTORY COVENANT & PRIVACY';
    lawfulLimit = 0;
    lawfulText = '24–48 Hours Written Notice Required with Statutory Justification';
    citation = `${j.statute} (Right to Quiet Enjoyment & Entry Notice)`;
    summary = `Under ${j.name} law, landlords have NO right to enter without giving advance written notice (minimum 24 hours) specifying a legitimate statutory reason (repairs, inspection, or showings) within reasonable daylight hours. Entering unannounced or using their own key is harassment.`;
    playbook = [
      'Document date, time, and photos/video of every unauthorized entry.',
      'Send formal written notice stating landlord is in breach of statutory quiet enjoyment.',
      'File an official harassment/rights complaint with ' + j.authority + '.'
    ];
  } else if (issue === 'eviction_notice') {
    title = 'Eviction Notice / Personal Use Claim';
    status = 'warn';
    statusBadge = '⚖️ STRICT STATUTORY CONDITIONS REQUIRED';
    lawfulLimit = rent;
    lawfulText = '1 Month Mandatory Compensation + Formal Hearing Rights';
    citation = `${j.statute} (Eviction Standards & Bad Faith Penalties)`;
    summary = `Landlords cannot simply tell you to leave. In Ontario (Form N12) and other jurisdictions, personal use eviction requires mandatory statutory compensation paid before the termination date. You DO NOT have to move out by the notice date; you have an absolute legal right to a hearing before ${j.authority}.`;
    playbook = [
      'Do NOT vacate immediately. You have the right to remain until a formal tribunal eviction order.',
      'Verify landlord paid the mandatory statutory compensation.',
      'If landlord re-rents or sells within 12 months, file a bad-faith claim for substantial damages.'
    ];
  } else {
    title = '"No Pets" Lease Prohibition Clause';
    if (dest === 'CA-ON') {
      status = 'illegal';
      statusBadge = '⚠️ CLAUSE IS LEGALLY VOID UNDER RTA S.14';
      citation = 'Ontario Residential Tenancies Act 2006, Section 14';
      lawfulLimit = 0;
      lawfulText = 'No Pets Clauses Have Zero Legal Force';
      summary = 'Under Section 14 of the Ontario RTA, any clause prohibiting animals in a residential tenancy agreement is VOID. Even if you signed a lease agreeing to no pets, the landlord cannot evict you for having a pet unless it causes damage or severe allergic reactions.';
      playbook = [
        'In Ontario, a "no pets" clause in a rental lease is void. A landlord can still apply to evict if a pet causes serious damage, a severe allergy, or is dangerous, and condominium rules can differ.',
        'Landlords cannot charge extra "pet rent" or pet deposits in Ontario.'
      ];
    } else {
      status = 'warn';
      statusBadge = '⚖️ STATUTORY REASONABLENESS REQUIRED';
      citation = `${j.statute} (Tenancy Agreement Terms)`;
      lawfulLimit = 0;
      lawfulText = 'Assistance & Support Animals Fully Protected by Law';
      summary = `Blanket pet bans are heavily restricted. Service and emotional assistance animals are protected under human rights and accessibility legislation in ${j.name}.`;
      playbook = ['Service and support animals cannot be banned.', 'Request written permission under reasonable standards.'];
    }
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const disputeLetter = generateDisputeLetterText({
    today,
    dest,
    issue,
    rent,
    demand,
    lawfulLimit,
    overcharge,
    j,
    title,
    citation
  });

  return {
    j,
    status,
    statusBadge,
    title,
    citation,
    lawfulLimit,
    lawfulText,
    overcharge,
    summary,
    playbook,
    disputeLetter
  };
}

export function setupTenancyWizard() {
  const form = $('#tenancy-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      renderTenancyWizard();
    });
  }
  $('#tenancy-dest')?.addEventListener('change', () => {
    const dest = $('#tenancy-dest').value;
    const rentInput = $('#tenancy-rent');
    const demandInput = $('#tenancy-demand');
    if (dest.startsWith('CA')) {
      if (rentInput) rentInput.value = '2200';
      if (demandInput) demandInput.value = '13200';
    } else if (dest === 'UK') {
      if (rentInput) rentInput.value = '1800';
      if (demandInput) demandInput.value = '10800';
    } else if (dest === 'DE') {
      if (rentInput) rentInput.value = '1200';
      if (demandInput) demandInput.value = '7200';
    } else if (dest.startsWith('AU')) {
      if (rentInput) rentInput.value = '2600';
      if (demandInput) demandInput.value = '15600';
    } else if (dest.startsWith('US')) {
      if (rentInput) rentInput.value = '2800';
      if (demandInput) demandInput.value = '16800';
    } else if (dest === 'AE') {
      if (rentInput) rentInput.value = '7000';
      if (demandInput) demandInput.value = '42000';
    } else if (dest === 'IE') {
      if (rentInput) rentInput.value = '2000';
      if (demandInput) demandInput.value = '12000';
    } else if (dest === 'NZ') {
      if (rentInput) rentInput.value = '2400';
      if (demandInput) demandInput.value = '14400';
    }
    renderTenancyWizard();
  });
  $('#tenancy-issue')?.addEventListener('change', () => renderTenancyWizard());
}

export function setupTaxEngine() {
  $('#tax-form')?.addEventListener('submit', e => {
    e.preventDefault();
    renderTaxEngine();
  });
  $('#tax-origin')?.addEventListener('change', renderTaxEngine);
  $('#tax-dest')?.addEventListener('change', renderTaxEngine);
  $('#tax-first-year')?.addEventListener('change', renderTaxEngine);
}

export function setupPaycheckSimulator() {
  $('#paycheck-form')?.addEventListener('submit', e => {
    e.preventDefault();
    renderPaycheckSimulator();
  });
  $('#paycheck-dest')?.addEventListener('change', renderPaycheckSimulator);
  $('#paycheck-status')?.addEventListener('change', renderPaycheckSimulator);
  $('#paycheck-pension')?.addEventListener('change', renderPaycheckSimulator);
}

export function setupCareersSuite() {
  $('#tab-btn-linter')?.addEventListener('click', () => {
    $('#tab-btn-linter').classList.add('active');
    $('#tab-btn-licensing').classList.remove('active');
    $('#careers-linter-view').hidden = false;
    $('#careers-licensing-view').hidden = true;
  });

  $('#tab-btn-licensing')?.addEventListener('click', () => {
    $('#tab-btn-licensing').classList.add('active');
    $('#tab-btn-linter').classList.remove('active');
    $('#careers-linter-view').hidden = true;
    $('#careers-licensing-view').hidden = false;
    renderCareersSuite();
  });

  $('#licensing-profession')?.addEventListener('change', renderCareersSuite);
  $('#licensing-jurisdiction')?.addEventListener('change', renderCareersSuite);

  $('#cv-sample-btn')?.addEventListener('click', () => {
    const txt = $('#cv-text-input');
    if (txt) {
      txt.value = SAMPLE_NON_COMPLIANT_CV;
      runCVAudit();
    }
  });

  $('#cv-audit-btn')?.addEventListener('click', runCVAudit);
}

export function setupHealthcareSuite() {
  $('#healthcare-symptom')?.addEventListener('change', renderHealthcareSuite);
  $('#healthcare-loc')?.addEventListener('change', renderHealthcareSuite);

  const drugInput = $('#drug-search-input');
  if (drugInput) {
    drugInput.addEventListener('input', () => renderDrugSearch(drugInput.value));
  }
  document.querySelectorAll('.drug-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const drug = btn.getAttribute('data-drug');
      if (drugInput) drugInput.value = drug;
      renderDrugSearch(drug);
    });
  });
  renderDrugSearch('');
  setupHealthcareEligibility();
}

export function setupHealthcareEligibility() {
  const btn = $('#health-elig-calc-btn');
  if (!btn) return;

  const dateInput = $('#health-elig-date');
  if (dateInput && !dateInput.value) {
    const today = new Date();
    dateInput.value = today.toISOString().slice(0, 10);
  }

  const runCalc = async () => {
    const resContainer = $('#health-elig-result');
    if (!resContainer) return;
    resContainer.innerHTML = '<p class="muted">Evaluating provincial healthcare rules...</p>';

    const province = $('#health-elig-province')?.value || 'ON';
    const status = $('#health-elig-status')?.value || 'pr';
    const permitMonths = Number($('#health-elig-permit-months')?.value || 12);
    const hasJob = $('#health-elig-has-job')?.value === 'true';
    const origin = $('#health-elig-origin')?.value || 'India';
    const date = $('#health-elig-date')?.value || new Date().toISOString().slice(0, 10);
    const household = Number($('#health-elig-household')?.value || 1);

    try {
      const res = await fetch(`/v1/tools/healthcare-eligibility?province=${encodeURIComponent(province)}&status=${encodeURIComponent(status)}&permitMonths=${permitMonths}&hasJob=${hasJob}&origin=${encodeURIComponent(origin)}&date=${encodeURIComponent(date)}&household=${household}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      renderHealthcareEligibility(data, resContainer);
      appendAssumptionNote(data, resContainer);
    } catch {
      resContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate healthcare eligibility. Please retry.</p></div>';
    }
  };

  btn.addEventListener('click', runCalc);
}

export function setupSchoolsSuite() {
  $('#schools-form')?.addEventListener('submit', renderSchoolsSuite);
  $('#schools-birth-year')?.addEventListener('change', renderSchoolsSuite);
  $('#schools-board')?.addEventListener('change', renderSchoolsSuite);
  $('#schools-status')?.addEventListener('change', renderSchoolsSuite);
  $('#schools-lang')?.addEventListener('change', renderSchoolsSuite);

  const ispaList = $('#ispa-vaccine-list');
  if (ispaList) {
    ispaList.innerHTML = '';
    ISPA_VACCINES.forEach(v => {
      const item = el('div', undefined, 'ispa-vax-item');
      item.innerHTML = `
        <label class="ispa-vax-label">
          <input type="checkbox" checked class="ispa-vax-cb" data-id="${v.id}">
          <div>
            <strong>${v.name}</strong>
            <div class="ispa-vax-meta">${v.doses} · <span class="ispa-statute">${v.mandate}</span></div>
          </div>
        </label>
      `;
      ispaList.appendChild(item);
    });

    document.querySelectorAll('.ispa-vax-cb').forEach(cb => {
      cb.addEventListener('change', renderIspaAudit);
    });
    renderIspaAudit();
  }

  renderSchoolsSuite();
}

export function setupQuickActionFab() {
  const fab = $('#quick-action-fab');
  const menu = $('#quick-action-menu');
  const sosBtn = $('#fab-sos-btn');
  const noticeBtn = $('#fab-notice-btn');
  const wizardBtn = $('#fab-wizard-btn');
  const paletteBtn = $('#fab-palette-btn');

  if (!fab || !menu) return;

  function toggleMenu(forceOpen) {
    const isOpen = forceOpen !== undefined ? forceOpen : menu.hidden;
    menu.hidden = !isOpen;
    fab.setAttribute('aria-expanded', String(isOpen));
  }

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#quick-action-fab-container')) {
      toggleMenu(false);
    }
  });

  sosBtn?.addEventListener('click', () => {
    toggleMenu(false);
    const navBtn = document.querySelector('[data-view="sos"]');
    if (navBtn) navBtn.click();
  });

  noticeBtn?.addEventListener('click', () => {
    toggleMenu(false);
    if (typeof window.triggerToolModal === 'function') {
      window.triggerToolModal({ id: 'legal-notices', title: 'Legal Notice & Statutory Rights Generator' });
    }
  });

  wizardBtn?.addEventListener('click', () => {
    toggleMenu(false);
    window.openSettlementWizard?.();
  });

  paletteBtn?.addEventListener('click', () => {
    toggleMenu(false);
    $('#cmd-palette-trigger')?.click();
  });
}

export function setupSettlementWizard() {
  const modal = $('#settlement-wizard-modal');
  const form = $('#settlement-wizard-form');
  const closeBtn = $('#wizard-close-btn');
  const progressIndicators = modal?.querySelectorAll('.wizard-step-indicator');
  const panes = modal?.querySelectorAll('.wizard-step-pane');
  const resultsContainer = $('#wizard-results');

  if (!modal || !form) return;

  let currentStep = 1;
  let returnFocus = null;
  let background = [];
  const arrivalInput = $('#wizard-arrival-date');
  arrivalInput.value = '';
  arrivalInput.required = true;
  const error = el('p', '', 'wizard-error');
  error.id = 'wizard-profile-error';
  error.setAttribute('role', 'alert');
  form.prepend(error);
  resultsContainer.tabIndex = -1;
  resultsContainer.setAttribute('role', 'region');
  resultsContainer.setAttribute('aria-label', 'Settlement plan results');
  function readProfile() {
    return {country: $('#wizard-country').value, city: $('#wizard-city').value, status: $('#wizard-status').value, field: $('#wizard-study-field').value, familySize: $('#wizard-family-size').value, children: $('#wizard-has-children').value, arrivalDate: arrivalInput.value};
  }
  function validateProfile(step) {
    form.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
    const issue = validateWizardProfile(readProfile(), step);
    error.textContent = issue?.message || '';
    if (!issue) return true;
    setStep(issue.step);
    const control = $(`#wizard-${issue.field}`);
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', error.id);
    control.focus();
    return false;
  }

  function closeWizard() {
    modal.hidden = true;
    for (const [node, inert] of background) node.inert = inert;
    background = [];
    returnFocus?.focus?.();
  }

  function setStep(step) {
    currentStep = step;
    arrivalInput.disabled = step !== 4;
    panes.forEach(p => {
      const pStep = Number(p.dataset.step);
      p.hidden = pStep !== currentStep;
    });
    progressIndicators.forEach(ind => {
      const iStep = Number(ind.dataset.step);
      ind.classList.toggle('active', iStep === currentStep);
      ind.classList.toggle('completed', iStep < currentStep);
      if (iStep === currentStep) ind.setAttribute('aria-current', 'step');
      else ind.removeAttribute('aria-current');
    });
    const heading = modal.querySelector(`.wizard-step-pane[data-step="${step}"] h3`);
    if (heading) { heading.tabIndex = -1; heading.focus(); }
  }

  modal.querySelectorAll('.btn-wizard-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = Number(btn.dataset.next);
      if (!validateProfile(currentStep)) return;
      setStep(next);
    });
  });

  modal.querySelectorAll('.btn-wizard-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = Number(btn.dataset.prev);
      setStep(prev);
    });
  });

  window.openSettlementWizard = function () {
    if (!modal.hidden) return;
    returnFocus = document.activeElement;
    modal.hidden = false;
    for (let node = modal; node && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node) { background.push([sibling, sibling.inert]); sibling.inert = true; }
      }
    }
    error.textContent = '';
    form.hidden = false;
    resultsContainer.hidden = true;
    updateCityDropdown($('#wizard-country')?.value || 'Canada', $('#wizard-city'));
    setStep(1);
  };

  $('#wizard-country')?.addEventListener('change', () => {
    const c = $('#wizard-country').value;
    updateCityDropdown(c, $('#wizard-city'));
  });
  updateCityDropdown($('#wizard-country')?.value || 'Canada', $('#wizard-city'));

  closeBtn?.addEventListener('click', closeWizard);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeWizard();
  });
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeWizard(); }
    if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button,input,select,[tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateProfile(currentStep)) return;
    if (currentStep !== 4) { setStep(currentStep + 1); return; }
    const date = arrivalInput.value;
    error.textContent = '';

    const country = $('#wizard-country').value;
    const city = $('#wizard-city')?.value || 'City not specified';
    const status = $('#wizard-status')?.value || 'student';
    const field = $('#wizard-study-field')?.value || 'stem';
    const familySize = $('#wizard-family-size').value === '5' ? '5+' : $('#wizard-family-size').value;
    const hasChildren = $('#wizard-has-children')?.value === 'yes';
    const arrivalDate = date;

    const {fundsBenchmarkText, statutoryRuleNote, recTools, toolNotice, milestones} = buildWizardPlan(country, status);

    form.hidden = true;
    resultsContainer.hidden = false;

    const exportText = [
      '=======================================================',
      'NORTHSTAR SETTLEMENT BLUEPRINT',
      'Generated for: ' + country + ' (' + city + ')',
      'Pathway: ' + status.toUpperCase() + ' | Field: ' + field.toUpperCase(),
      'Household Size: ' + familySize + ' | Children: ' + (hasChildren ? 'Yes' : 'No'),
      'Target Arrival Date: ' + arrivalDate,
      '=======================================================',
      '',
      '1. FINANCIAL REQUIREMENTS TO VERIFY',
      '   Assessment: ' + fundsBenchmarkText,
      '   Next step: ' + statutoryRuleNote,
      '',
      '2. RELATED TOOLS TO EXPLORE', toolNotice,
      ...recTools.map((t, idx) => '   ' + (idx + 1) + '. ' + t.title + ' - ' + t.desc),
      '',
      '3. PLANNING CHECKLIST (NOT LEGAL DEADLINES)',
      ...milestones.map(item => '   * ' + item),
      '======================================================='
    ].join('\n');

    resultsContainer.innerHTML = `
      <div class="blueprint-card">
        <h4><span>🗺️</span> Destination Profile</h4>
        <div data-s="font-size-13_5px color-ink">
          <strong>${escapeHtml(country)} (${escapeHtml(city)})</strong> · Status: <strong>${escapeHtml(status.replace(/_/g, ' ').toUpperCase())}</strong> · Household: <strong>${familySize} person(s)</strong>
        </div>
      </div>

      <div class="blueprint-card">
        <h4><span>💰</span> Financial Requirements to Verify</h4>
        <div class="blueprint-funds-value">${fundsBenchmarkText}</div>
        <div data-s="font-size-11_5px color-muted">${statutoryRuleNote}</div>
      </div>

      <div class="blueprint-card">
        <h4><span>🛠️</span> Related Tools to Explore</h4>
        <p>${escapeHtml(toolNotice)}</p><div class="blueprint-grid">
          ${recTools.map(t => `
            <div class="blueprint-rec-item" data-tool-id="${t.id}">
              <div class="blueprint-rec-title">⚡ ${t.title}</div>
              <div class="blueprint-rec-desc">${t.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="blueprint-card">
        <h4><span>🗓️</span> Planning Checklist — Not Legal Deadlines</h4>
        <ul class="blueprint-milestones">
          ${milestones.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>

      <button type="button" id="btn-export-blueprint" class="blueprint-export-btn">
        <span>📥</span> Download Settlement Blueprint (.txt)
      </button>

      <button type="button" id="btn-wizard-restart" class="btn-wizard-prev" data-s="margin-top-6px width-100pc">
        ← Plan for Another Profile
      </button>
    `;

    resultsContainer.querySelectorAll('.blueprint-rec-item').forEach(item => {
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.click(); }
      });
      item.addEventListener('click', () => {
        const toolId = item.dataset.toolId;
        closeWizard();
        if (typeof window.triggerToolModal === 'function') {
          window.triggerToolModal({ id: toolId, title: item.querySelector('.blueprint-rec-title')?.textContent || 'Tool' });
        }
      });
    });

    resultsContainer.querySelector('#btn-export-blueprint')?.addEventListener('click', () => {
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = 'Settlement-Blueprint-' + country + '-' + status + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
    });

    resultsContainer.querySelector('#btn-wizard-restart')?.addEventListener('click', () => {
      form.hidden = false;
      resultsContainer.hidden = true;
      setStep(1);
    });
    resultsContainer.focus();
  });
}

export function setupSosSuite() {
  $('#sos-copy-lockout-btn')?.addEventListener('click', () => {
    const scriptText = $('#lockout-police-script')?.textContent || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(scriptText).then(() => {
        const btn = $('#sos-copy-lockout-btn');
        if (btn) {
          const old = btn.textContent;
          btn.textContent = 'Copied to Clipboard! ✓';
          setTimeout(() => btn.textContent = old, 3000);
        }
      });
    }
  });
}

// --- ADVANCED FEATURE 1: CV LINTER 2.0 (Job Description Semantic Matcher) ---
export function setupCvJdMatcher() {
  const matchBtn = $('#jd-match-btn');
  const sampleBtn = $('#jd-sample-btn');
  const jdInput = $('#jd-text-input');
  const cvInput = $('#cv-text-input');
  const resultsDiv = $('#jd-match-results');

  sampleBtn?.addEventListener('click', () => {
    if (jdInput) {
      jdInput.value = `Senior Software Engineer / Tech Lead - Payments Infrastructure
Requirements:
- 5+ years building scalable distributed microservices in TypeScript, Node.js, Python, or Go.
- Proven expertise in SQL databases (PostgreSQL/SQLite), RESTful APIs, and cloud deployments (AWS or GCP).
- Experience with CI/CD pipelines, automated testing (Jest, Node test runner), and containerization (Docker).
- Strong track record of agile delivery, stakeholder management, code review, and mentoring junior engineers.
- Bachelor's degree in Computer Science, Engineering, or equivalent practical experience.`;
    }
  });

  matchBtn?.addEventListener('click', () => {
    const jdText = jdInput?.value || '';
    const cvText = cvInput?.value || '';

    if (!jdText.trim()) {
      alert('Please paste a target Job Description first.');
      return;
    }
    if (!cvText.trim()) {
      alert('Please paste your Resume / CV in the box above.');
      return;
    }

    const keywords = [
      'typescript', 'node.js', 'python', 'sql', 'postgresql', 'sqlite', 'restful', 'apis', 'aws', 'gcp',
      'docker', 'ci/cd', 'pipelines', 'automated testing', 'microservices', 'distributed', 'agile',
      'stakeholder management', 'code review', 'mentoring', 'architecture', 'scalability', 'security',
      'react', 'kubernetes', 'linux', 'git', 'system design', 'data modeling'
    ];

    const cvLower = cvText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    const targetKeywords = keywords.filter(k => jdLower.includes(k));
    const matched = [];
    const missing = [];

    targetKeywords.forEach(k => {
      if (cvLower.includes(k)) matched.push(k);
      else missing.push(k);
    });

    const matchPct = targetKeywords.length > 0 ? Math.round((matched.length / targetKeywords.length) * 100) : 75;

    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="jd-result-card">
          <div class="jd-score-header">
            <div class="jd-score-box">
              <span class="jd-score-num ${matchPct >= 70 ? 'good' : 'warning'}">${matchPct}%</span>
              <span class="jd-score-label">ATS Keyword Alignment</span>
            </div>
            <div class="jd-score-summary">
              <strong>${matched.length} of ${targetKeywords.length} key qualifications matched.</strong>
              <p>${matchPct >= 70 ? 'Strong ATS alignment! Your CV mirrors core technical requirements.' : 'Moderate alignment. Consider incorporating the missing keywords directly into your bullet points.'}</p>
            </div>
          </div>
          <div class="jd-tags-group">
            <h5>Matched Keywords (${matched.length}):</h5>
            <div class="jd-tags-list">
              ${matched.map(m => `<span class="jd-tag tag-matched">✓ ${m}</span>`).join('')}
            </div>
          </div>
          <div class="jd-tags-group">
            <h5>Missing Target Keywords (${missing.length}):</h5>
            <div class="jd-tags-list">
              ${missing.map(m => `<span class="jd-tag tag-missing">✕ ${m}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }
  });
}

// --- ADVANCED FEATURE 2: BINDER VAULT 2.0 (Document Expiry Watchdog & IRPR 186(u) Alarm) ---
export function setupBinderExpiryWatchdog() {
  const btn = $('#watchdog-btn');
  const dateInput = $('#watchdog-date');
  const typeSelect = $('#watchdog-type');
  const resultsDiv = $('#watchdog-result');

  if (dateInput && !dateInput.value) {
    const future = new Date();
    future.setMonth(future.getMonth() + 4);
    dateInput.value = formatIsoDate(future);
  }

  function calculateExpiry() {
    if (!dateInput || !resultsDiv) return;
    const expiryStr = dateInput.value;
    if (!expiryStr) return;

    const expiryDate = new Date(expiryStr);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusClass = '';
    let statusTitle = '';
    let advice = '';

    if (diffDays <= 0) {
      statusClass = 'danger';
      statusTitle = `EXPIRED: ${Math.abs(diffDays)} days ago`;
      advice = 'Under IRPA Section 182, you have a strict 90-day restoration window to apply for status restoration and pay the $229 restoration fee. You CANNOT work or study during restoration.';
    } else if (diffDays <= 90) {
      statusClass = 'danger';
      statusTitle = `URGENT ACTION: ${diffDays} days remaining`;
      advice = 'Statutory Maintained Status (IRPR s.186(u)): Submit your extension application before midnight on expiry day. Once submitted, your legal right to work is preserved even after the plastic permit expires, until IRCC makes a decision.';
    } else if (diffDays <= 180) {
      statusClass = 'warning';
      statusTitle = `PREPARATION WINDOW: ${diffDays} days remaining (~ ${Math.round(diffDays / 30)} months)`;
      advice = 'Begin collecting LMIA, employer compliance numbers, provincial transcripts, and updated proof of funds. Extensions take 60-120 days on average.';
    } else {
      statusClass = 'good';
      statusTitle = `STATUS HEALTHY: ${diffDays} days remaining (~ ${Math.round(diffDays / 30)} months)`;
      advice = 'Your document is comfortably within its validity window. Set a calendar reminder 120 days before expiry.';
    }

    resultsDiv.innerHTML = `
      <div class="watchdog-result-card ${statusClass}">
        <div class="watchdog-result-top">
          <span class="watchdog-pill ${statusClass}">${statusTitle}</span>
          <span class="watchdog-cite">IRPR s.186(u) / s.189 & IRPA s.182</span>
        </div>
        <p class="watchdog-advice">${advice}</p>
        <div class="watchdog-proof-box">
          <strong>Proof of Maintained Status for Employers:</strong>
          <p>Present: 1) Expired work permit, 2) IRCC Confirmation of Submission letter, 3) IRCC WP-EXT letter. Section 186(u) of the Immigration Regulations authorizes continuing employment under existing conditions.</p>
        </div>
      </div>
    `;
  }

  btn?.addEventListener('click', calculateExpiry);
  dateInput?.addEventListener('change', calculateExpiry);
  typeSelect?.addEventListener('change', calculateExpiry);
  autoRun(calculateExpiry, btn);
}

export function setupPreFlightInspector() {
  const btn = $('#doc-val-run-btn');
  if (!btn) return;

  const landingInput = $('#doc-val-landing-date');
  if (landingInput && !landingInput.value) {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    landingInput.value = formatIsoDate(future);
  }

  const runAudit = async () => {
    const resContainer = $('#doc-val-result');
    if (!resContainer) return;
    resContainer.innerHTML = '<p class="muted">Checking your document dates…</p>';

    const landingDate = $('#doc-val-landing-date')?.value || new Date().toISOString().slice(0, 10);
    const passportExp = $('#doc-val-passport-exp')?.value;
    const coprExp = $('#doc-val-copr-exp')?.value;
    const medicalDate = $('#doc-val-medical-date')?.value;
    const langDate = $('#doc-val-lang-date')?.value;
    const ecaDate = $('#doc-val-eca-date')?.value;

    const docs = [];
    if (passportExp) docs.push({ docType: 'passport', expiryDate: passportExp });
    if (coprExp) docs.push({ docType: 'copr', expiryDate: coprExp });
    if (medicalDate) docs.push({ docType: 'medical_exam', issueDate: medicalDate });
    if (langDate) docs.push({ docType: 'language_test', issueDate: langDate });
    if (ecaDate) docs.push({ docType: 'eca_report', issueDate: ecaDate });

    if (docs.length === 0) {
      // Default sample travel packet
      docs.push({ docType: 'passport', expiryDate: '2028-06-15' });
      docs.push({ docType: 'copr', expiryDate: formatIsoDate(new Date(Date.now() + 180 * 86400000)) });
      docs.push({ docType: 'proof_of_funds', issueDate: formatIsoDate(new Date(Date.now() - 10 * 86400000)) });
    }

    try {
      const res = await fetch('/v1/tools/validate-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingDateStr: landingDate, immigrationStream: 'pr_express_entry', documents: docs })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      renderPreFlightAudit(data, resContainer);
      appendAssumptionNote(data, resContainer);
    } catch {
      resContainer.innerHTML = '<div class="alert-box error"><p>We could not check your documents. Please try again.</p></div>';
    }
  };

  btn.addEventListener('click', runAudit);
}

// --- ADVANCED FEATURE 3: PAYCHECK 2.0 (Layoff Severance & EI Runway Calculator) ---
export function setupLayoffCalculator() {
  const btn = $('#severance-calc-btn');
  const yearsInput = $('#severance-years');
  const payrollSelect = $('#severance-payroll');
  const resultsDiv = $('#severance-result');

  function calculateSeverance() {
    if (!resultsDiv) return;
    const years = parseFloat(yearsInput?.value || '3');
    const isLarge = (payrollSelect?.value || 'large') === 'large';
    const grossSalary = parseFloat($('#paycheck-gross')?.value || '85000');
    const weeklySalary = grossSalary / 52;

    const noticeWeeks = Math.min(Math.floor(years), 8);
    const terminationPay = noticeWeeks * weeklySalary;

    let severanceWeeks = 0;
    if (isLarge && years >= 5) {
      severanceWeeks = Math.min(years, 26);
    }
    const severancePay = severanceWeeks * weeklySalary;

    const eiWeeklyMax = 668.00;
    const eiWeekly = Math.min(weeklySalary * 0.55, eiWeeklyMax);
    const eiWeeks = 36;
    const totalEi = eiWeekly * eiWeeks;

    const totalStatutoryRunway = terminationPay + severancePay + totalEi;
    const monthlyNetBurn = 3500;
    const runwayMonths = (totalStatutoryRunway / monthlyNetBurn).toFixed(1);

    resultsDiv.innerHTML = `
      <div class="severance-result-card">
        <div class="severance-stat-grid">
          <div class="severance-stat-box">
            <span class="stat-label">ESA Termination Notice Pay</span>
            <span class="stat-val">${Math.round(terminationPay).toLocaleString()}</span>
            <small>${noticeWeeks} weeks (ESA s.54)</small>
          </div>
          <div class="severance-stat-box">
            <span class="stat-label">ESA Severance Pay</span>
            <span class="stat-val">${Math.round(severancePay).toLocaleString()}</span>
            <small>${severanceWeeks.toFixed(1)} weeks (ESA s.64)</small>
          </div>
          <div class="severance-stat-box">
            <span class="stat-label">Estimated EI benefit</span>
            <span class="stat-val">${Math.round(totalEi).toLocaleString()}</span>
            <small>${eiWeekly.toFixed(2)}/wk for ${eiWeeks} wks</small>
          </div>
          <div class="severance-stat-box highlight">
            <span class="stat-label">Total Living Runway</span>
            <span class="stat-val">${runwayMonths} Months</span>
            <small>Total buffer: ${Math.round(totalStatutoryRunway).toLocaleString()}</small>
          </div>
        </div>
      </div>
    `;
  }

  btn?.addEventListener('click', calculateSeverance);
  yearsInput?.addEventListener('input', calculateSeverance);
  payrollSelect?.addEventListener('change', calculateSeverance);
  autoRun(calculateSeverance, btn);
}

// --- ADVANCED FEATURE 4: TENANCY 2.0 (LTB Evidence Vault & Statutory Damages Estimator) ---
export function setupTenancyEvidenceVault() {
  const btn = $('#vault-calc-btn');
  const monthsInput = $('#vault-months');
  const rentInput = $('#vault-rent');
  const expensesInput = $('#vault-expenses');
  const remedySelect = $('#vault-remedy');
  const resultsDiv = $('#vault-result');

  function calculateDamages() {
    if (!resultsDiv) return;
    const months = parseInt(monthsInput?.value || '3', 10);
    const rent = parseFloat(rentInput?.value || '2200');
    const expenses = parseFloat(expensesInput?.value || '750');
    const remedy = remedySelect?.value || 'full_package';

    let abatementPct = 0.30;
    if (remedy === 'abatement_only') abatementPct = 1.0;

    const rentAbatement = months * rent * abatementPct;
    const adminFineRecommended = 2500;
    const totalClaim = rentAbatement + expenses + (remedy === 'full_package' ? adminFineRecommended : 0);

    resultsDiv.innerHTML = `
      <div class="vault-result-card">
        <div class="vault-claim-summary">
          <div class="vault-total-claim">
            <span class="claim-label">Estimated total claim (LTB Form T2, s.31):</span>
            <span class="claim-amount">${Math.round(totalClaim).toLocaleString()} CAD</span>
          </div>
          <div class="vault-claim-breakdown">
            <div>• Rent Abatement (${Math.round(abatementPct * 100)}% of ${months} months rent): <strong>${Math.round(rentAbatement).toLocaleString()}</strong></div>
            <div>• Direct Out-of-Pocket Expenses: <strong>${Math.round(expenses).toLocaleString()}</strong></div>
            ${remedy === 'full_package' ? `<div>• Administrative Fine Penalty to Board (RTA s.31(1)): <strong>${adminFineRecommended.toLocaleString()}</strong></div>` : ''}
          </div>
        </div>
        <div class="vault-checklist">
          <h5>Essential Hearing Evidence Checklist (Criminal Code s.184 Admissible):</h5>
          <ul>
            <li>✓ Audio recording of confrontation (you can generally record a conversation you take part in)</li>
            <li>✓ Text messages / WhatsApp exports with verified phone numbers & date stamps</li>
            <li>✓ Interac e-Transfer transaction logs proving payments demanded</li>
            <li>✓ Photos or video walkthroughs of unit with timestamp metadata</li>
          </ul>
        </div>
      </div>
    `;
  }

  btn?.addEventListener('click', calculateDamages);
  monthsInput?.addEventListener('input', calculateDamages);
  rentInput?.addEventListener('input', calculateDamages);
  expensesInput?.addEventListener('input', calculateDamages);
  remedySelect?.addEventListener('change', calculateDamages);
  autoRun(calculateDamages, btn);
}

export function setupCityComparatorSuite() {
  const btn = $('#compare-run-btn');
  const resultsDiv = $('#compare-results');
  if (!btn || !resultsDiv) return;

  async function runComparison() {
    const city1 = $('#compare-city-1')?.value || 'Calgary';
    const city2 = $('#compare-city-2')?.value || 'Toronto';
    const salary = Number($('#compare-salary')?.value) || 85000;
    const household = Number($('#compare-household')?.value) || 1;

    resultsDiv.innerHTML = '<p class="muted">Loading official statutory and CMHC benchmark data...</p>';

    try {
      const res = await fetch(`/v1/tools/compare-cities?cities=${encodeURIComponent(city1)},${encodeURIComponent(city2)}&salary=${salary}&household=${household}`);
      const data = await res.json();

      if (data.error || !data.comparison) {
        resultsDiv.innerHTML = `<div class="error-card">${escapeHtml(data.error || 'Failed to compare cities.')}</div>`;
        return;
      }

      let diffHtml = '';
      if (data.differential) {
        const d = data.differential;
        diffHtml = `
          <div class="diff-highlight-card" data-s="background-accent-bg-f0fdf4 border-1px-solid-accent-border-86efac border-radius-8px padding-1_25rem margin-bottom-1_5rem">
            <h3 data-s="margin-top-0 color-accent-text-166534">🏆 Cost-of-Living Advantage: ${d.cheaperCity}</h3>
            <p data-s="margin-0_5rem-0">Choosing <strong>${d.cheaperCity}</strong> saves an estimated <strong>$${d.annualEstimatedSavings.toLocaleString()} CAD per year</strong> in essential shelter and transit expenses ($${d.monthlyRentDifference.toLocaleString()}/mo rent difference).</p>
            ${d.salesTaxAdvantage ? `<p data-s="margin-0 font-size-0_9rem color-15803d">💡 <strong>Sales Tax Advantage:</strong> ${d.salesTaxAdvantage} has 0% Provincial Sales Tax (PST) — only the 5% Federal GST applies!</p>` : ''}
          </div>
        `;
      }

      const cardsHtml = data.comparison.map(c => `
        <div class="metro-card" data-s="border-1px-solid-border-e2e8f0 border-radius-8px padding-1_25rem background-card-bg-ffffff">
          <div data-s="display-flex justify-content-space-between align-items-baseline border-bottom-1px-solid-border-e2e8f0 padding-bottom-0_75rem margin-bottom-1rem">
            <h2 data-s="margin-0 font-size-1_35rem">${c.city} <small data-s="font-size-0_9rem color-muted-64748b">(${c.provinceCode})</small></h2>
            <span class="badge" data-s="background-e0f2fe color-0369a1 padding-0_25rem-0_6rem border-radius-4px font-weight-600 font-size-0_85rem">${c.salesTax}</span>
          </div>

          <div data-s="display-grid grid-template-columns-1fr-1fr gap-0_75rem margin-bottom-1rem font-size-0_95rem">
            <div>
              <small data-s="color-muted-64748b display-block">Median Rent (CMHC)</small>
              <strong data-s="font-size-1_15rem">$${c.projectedMonthlyRent.toLocaleString()}/mo</strong>
            </div>
            <div>
              <small data-s="color-muted-64748b display-block">Transit Pass</small>
              <strong data-s="font-size-1_15rem">$${c.transitMonthlyPass.toFixed(2)}/mo</strong>
            </div>
          </div>

          <div data-s="font-size-0_9rem margin-bottom-0_75rem">
            <strong>Transit System:</strong> ${c.transitSystem}
          </div>
          <div data-s="font-size-0_9rem margin-bottom-0_75rem">
            <strong>Healthcare:</strong> ${c.healthcarePlan} — <em>${c.healthcareWaitPeriod}</em>
          </div>
          <div data-s="font-size-0_9rem margin-bottom-0_75rem">
            <strong>Winter Climate:</strong> ${c.winterSeverity}
          </div>

          <div data-s="font-size-0_9rem margin-bottom-1rem">
            <strong>Key Industries:</strong>
            <ul data-s="margin-0_25rem-0-0-1_25rem padding-0">
              ${c.primaryJobMarkets.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>

          <div data-s="border-top-1px-dashed-border-e2e8f0 padding-top-0_75rem font-size-0_85rem">
            <strong>Settlement Services:</strong>
            <div data-s="margin-top-0_35rem display-flex flex-direction-column gap-0_25rem">
              ${c.settlementAgencies.map(a => `<a href="${a.url}" target="_blank" rel="noopener noreferrer" data-s="color-link-2563eb text-decoration-none">↗ ${a.name}</a>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

      resultsDiv.innerHTML = `
        ${diffHtml}
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-300 gap-1_5rem margin-bottom-1_5rem">
          ${cardsHtml}
        </div>
        <p data-s="font-size-0_8rem color-muted-64748b margin-top-1rem">${data.benchmarkNote}</p>
      `;
    } catch (e) {
      resultsDiv.innerHTML = `<div class="error-card">Failed to fetch city comparison: ${escapeHtml(e.message)}</div>`;
    }
  }

  btn.addEventListener('click', runComparison);
  $('#compare-city-1')?.addEventListener('change', runComparison);
  $('#compare-city-2')?.addEventListener('change', runComparison);
  $('#compare-household')?.addEventListener('change', runComparison);
}

export function setupMultilingualSuite() {
  const selector = $('#lang-selector');
  const contentDiv = $('#lang-content');
  if (!selector || !contentDiv) return;

  async function renderLanguage(langCode) {
    contentDiv.innerHTML = '<p class="muted">Loading translated emergency guidelines...</p>';
    try {
      const res = await fetch(`/v1/i18n/${encodeURIComponent(langCode)}`);
      const data = await res.json();
      const labels = data.labels;
      // Mark translated text with its language so screen readers pronounce it correctly.
      const lang = data.language === 'zh' ? 'zh-Hans' : /^[a-z]{2}$/.test(data.language) ? data.language : 'en';

      contentDiv.innerHTML = `
        <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-320 gap-1_5rem margin-top-1rem">
          <div class="lang-card" data-s="border-1px-solid-f87171 border-radius-8px padding-1_25rem background-card-bg-fff">
            <span class="badge" data-s="background-fee2e2 color-b91c1c padding-0_2rem-0_5rem border-radius-4px font-weight-600 font-size-0_8rem">🚨 HOUSING / TENANCY</span>
            <h3 lang="${lang}" data-s="margin-0_75rem-0-0_5rem-0">${escapeHtml(labels.lockoutTitle)}</h3>
            <p lang="${lang}" data-s="font-size-0_95rem line-height-1_5 color-text-1e293b">${escapeHtml(labels.lockoutCallout)}</p>
            <div data-s="margin-top-1rem padding-0_75rem background-f8fafc border-radius-6px font-size-0_85rem border-1px-solid-e2e8f0">
              <strong>Emergency Hotline:</strong> Rental Housing Enforcement Unit (RHEU): <code>1-888-772-9277</code>
            </div>
          </div>

          <div class="lang-card" data-s="border-1px-solid-38bdf8 border-radius-8px padding-1_25rem background-card-bg-fff">
            <span class="badge" data-s="background-e0f2fe color-0369a1 padding-0_2rem-0_5rem border-radius-4px font-weight-600 font-size-0_8rem">🏥 HEALTHCARE ACCESS</span>
            <h3 lang="${lang}" data-s="margin-0_75rem-0-0_5rem-0">${escapeHtml(labels.healthcareTitle)}</h3>
            <p lang="${lang}" data-s="font-size-0_95rem line-height-1_5 color-text-1e293b">${escapeHtml(labels.healthcareCallout)}</p>
            <div data-s="margin-top-1rem padding-0_75rem background-f8fafc border-radius-6px font-size-0_85rem border-1px-solid-e2e8f0">
              <strong>Free Nurse Advice (24/7):</strong> Dial <code>811</code> (Health811 Ontario / HealthLink BC)
            </div>
          </div>

          <div class="lang-card" data-s="border-1px-solid-4ade80 border-radius-8px padding-1_25rem background-card-bg-fff">
            <span class="badge" data-s="background-dcfce7 color-15803d padding-0_2rem-0_5rem border-radius-4px font-weight-600 font-size-0_8rem">🏦 BANKING & FINANCE</span>
            <h3 lang="${lang}" data-s="margin-0_75rem-0-0_5rem-0">${escapeHtml(labels.bankingTitle)}</h3>
            <p lang="${lang}" data-s="font-size-0_95rem line-height-1_5 color-text-1e293b">${escapeHtml(labels.bankingCallout)}</p>
            <div data-s="margin-top-1rem padding-0_75rem background-f8fafc border-radius-6px font-size-0_85rem border-1px-solid-e2e8f0">
              <strong>Refusal Escalation:</strong> Financial Consumer Agency of Canada (FCAC): <code>1-866-461-3222</code>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      contentDiv.innerHTML = `<div class="error-card">Failed to load language guidelines: ${escapeHtml(e.message)}</div>`;
    }
  }

  selector.addEventListener('change', () => renderLanguage(selector.value));
  renderLanguage('en');
}

export function setupCraBenefitsCalculator() {
  const btn = $('#cra-calc-btn');
  if (!btn) return;

  const dateInput = $('#cra-calc-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  const runCalc = async () => {
    const resContainer = $('#cra-calc-results');
    if (!resContainer) return;
    resContainer.innerHTML = '<p class="muted">Calculating statutory CRA credits and compiling filing packet...</p>';

    const province = $('#cra-calc-province')?.value || 'ON';
    const income = Number($('#cra-calc-income')?.value || 32000);
    const marital = $('#cra-calc-marital')?.value || 'married';
    const under6 = Number($('#cra-calc-under6')?.value || 0);
    const over6 = Number($('#cra-calc-over6')?.value || 0);
    const landingDateStr = $('#cra-calc-date')?.value || new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch('/v1/tools/cra-benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          adjustedFamilyNetIncomeCad: income,
          maritalStatus: marital,
          childrenUnder6Count: under6,
          children6to17Count: over6,
          landingDateStr
        })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      renderCraBenefitsAssessment(data, resContainer);
      appendAssumptionNote(data, resContainer);
    } catch {
      resContainer.innerHTML = '<div class="alert-box error"><p>Failed to calculate CRA newcomer benefits. Please retry.</p></div>';
    }
  };

  btn.addEventListener('click', runCalc);
}

export function setupLeaseGuard() {
  const btn = $('#lease-guard-calc-btn');
  if (!btn) return;

  const runAudit = async () => {
    const resContainer = $('#lease-guard-result');
    if (!resContainer) return;
    resContainer.innerHTML = '<p class="muted">Checking your lease against tenancy rules…</p>';

    const province = $('#lease-guard-prov')?.value || 'ON';
    const rent = Number($('#lease-guard-rent')?.value || 2200);
    const standardFormUsed = $('#lease-guard-standard')?.value !== 'no';
    const rentDepositMonths = Number($('#lease-guard-rent-months')?.value || 1);
    const damageDepositCad = Number($('#lease-guard-damage-dep')?.value || 0);
    const keyDepositCad = Number($('#lease-guard-key-dep')?.value || 50);
    const customClauseText = $('#lease-guard-custom-text')?.value || '';

    const clausesPresent = [];
    if ($('#lease-clause-pets')?.checked) clausesPresent.push('no_pets');
    if ($('#lease-clause-guests')?.checked) clausesPresent.push('no_guests');
    if ($('#lease-clause-cheques')?.checked) clausesPresent.push('post_dated_cheques');
    if ($('#lease-clause-repairs')?.checked) clausesPresent.push('tenant_repairs');
    if ($('#lease-clause-lockout')?.checked) clausesPresent.push('lockout_clause');

    try {
      const res = await fetch('/v1/tools/lease-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          monthlyRentCad: rent,
          standardFormUsed,
          depositDemands: { rentDepositMonths, damageDepositCad, keyDepositCad },
          clausesPresent,
          customClauseText
        })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      renderLeaseGuardAssessment(data, resContainer);
      appendAssumptionNote(data, resContainer);
    } catch {
      resContainer.innerHTML = '<div class="alert-box error"><p>We could not check your lease. Please try again.</p></div>';
    }
  };

  btn.addEventListener('click', runAudit);
}

export function setupChildcareNavigator() {
  const form = $('#childcare-form');
  const resultsContainer = $('#childcare-results');
  if (!form || !resultsContainer) return;

  const runCalculation = async () => {
    resultsContainer.innerHTML = '<p class="muted">Calculating statutory CWELCC fee caps and municipal subsidy eligibility...</p>';
    const city = $('#childcare-city')?.value || 'Toronto';
    const income = Number($('#childcare-income')?.value || 0);
    const status = $('#childcare-status')?.value || 'pr';
    const ageGroup = $('#childcare-age')?.value || 'toddler';

    try {
      const res = await fetch('/v1/tools/childcare-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          annualFamilyIncomeCad: income,
          immigrationStatus: status,
          children: [{ ageGroup }]
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate childcare support');
      const data = await res.json();
      renderChildcareSupportAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to calculate childcare support. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  autoRun(runCalculation, form);
}

export function setupCustomsDeclaration() {
  const form = $('#customs-form');
  const resultsContainer = $('#customs-results');
  if (!form || !resultsContainer) return;

  const runCalculation = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your goods and cash against customs rules…</p>';
    const status = $('#customs-status')?.value || 'pr';
    const currency = Number($('#customs-currency')?.value || 0);
    const presetKey = $('#customs-preset')?.value || 'standard';
    const presetData = CUSTOMS_PRESETS[presetKey] || CUSTOMS_PRESETS.standard;

    try {
      const res = await fetch('/v1/tools/customs-declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlerStatus: status,
          currencyCad: currency,
          items: presetData.items,
          vehicle: presetData.vehicle
        })
      });
      if (!res.ok) throw new Error('Failed to audit customs declaration');
      const data = await res.json();
      renderCustomsDeclarationAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate customs declaration. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  autoRun(runCalculation, form);
}

export function setupHomebuyerEligibility() {
  const form = $('#homebuyer-form');
  const resultsContainer = $('#homebuyer-results');
  if (!form || !resultsContainer) return;

  const runCalculation = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking foreign-buyer rules and closing costs…</p>';
    const price = Number($('#homebuyer-price')?.value || 800000);
    const province = $('#homebuyer-province')?.value || 'ON';
    const city = $('#homebuyer-city')?.value || 'Toronto';
    const status = $('#homebuyer-status')?.value || 'pr';
    const wpDays = Number($('#homebuyer-wp-days')?.value || 300);
    const isFthb = $('#homebuyer-fthb')?.value !== 'no';

    try {
      const res = await fetch('/v1/tools/homebuyer-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePriceCad: price,
          province,
          city,
          immigrationStatus: status,
          workPermitDaysRemaining: wpDays,
          hasPurchasedPreviousResidentialPropertyInCanada: false,
          isFirstTimeHomeBuyer: isFthb,
          willOccupyAsPrincipalResidenceWithin60Days: true
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate homebuyer eligibility');
      const data = await res.json();
      renderHomebuyerAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate homebuyer eligibility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  autoRun(runCalculation, form);
}

export function setupBankingComparator() {
  const form = $('#banking-comparator-form');
  const resultsContainer = $('#banking-comparator-results');
  if (!form || !resultsContainer) return;

  const runCalculation = async () => {
    resultsContainer.innerHTML = '<p class="muted">Evaluating Big 5 newcomer packages and simulating 12-month credit trajectory...</p>';
    const bank = $('#comparator-bank')?.value || 'all';
    const spend = Number($('#comparator-spend')?.value || 800);
    const target = Number($('#comparator-target')?.value || 740);
    const phone = $('#comparator-phone')?.value !== 'no';

    try {
      const res = await fetch('/v1/tools/banking-comparator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedBank: bank,
          monthlySpendingCad: spend,
          targetCreditScore: target,
          hasPostpaidPhonePlan: phone,
          immigrationCategory: 'pr'
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate banking comparator');
      const data = await res.json();
      renderBankingComparatorAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate banking comparator. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  autoRun(runCalculation, form);
}

export function setupCitizenshipCalculator() {
  const form = $('#citizenship-form');
  const resultsContainer = $('#citizenship-results');
  if (!form || !resultsContainer) return;

  const runCalculation = async () => {
    resultsContainer.innerHTML = '<p class="muted">Counting your days in Canada…</p>';
    const landingDate = $('#citizenship-landing-date')?.value || '2024-01-01';
    const prePrDays = Number($('#citizenship-pre-pr-days')?.value || 0);
    const absences = Number($('#citizenship-absences')?.value || 0);
    const taxes = Number($('#citizenship-taxes')?.value || 3);
    const age = Number($('#citizenship-age')?.value || 32);
    const langProof = $('#citizenship-lang-proof')?.value || 'celpip';

    try {
      const res = await fetch('/v1/tools/citizenship-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prLandingDate: landingDate,
          prePrDaysPresent: prePrDays,
          postPrDaysAbsent: absences,
          taxYearsFiledCount: taxes,
          applicantAge: age,
          languageProofType: langProof,
          hasCriminalProhibitions: false
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate citizenship eligibility');
      const data = await res.json();
      renderCitizenshipAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to calculate citizenship eligibility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  autoRun(runCalculation, form);
}

export function setupEvictionDefense() {
  const calcBtn = $('#evict-calc-btn');
  const resultsContainer = $('#evict-results');
  if (!calcBtn || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your notice against Ontario tenancy rules…</p>';
    const formType = $('#evict-form-type')?.value || 'N12';
    const rent = Number($('#evict-rent')?.value || 2200);
    const servedDate = $('#evict-served-date')?.value || '2026-05-01';
    const termDate = $('#evict-term-date')?.value || '2026-06-30';
    const compPaid = $('#evict-comp-paid')?.value === 'yes';
    const compDate = $('#evict-comp-date')?.value || null;
    const isCorp = $('#evict-is-corp')?.value === 'yes';
    const occupant = $('#evict-occupant')?.value || 'landlord';
    const units = Number($('#evict-units')?.value || 1);
    const arrears = Number($('#evict-arrears')?.value || 0);
    const illegalCharges = $('#evict-illegal-charges')?.checked || false;
    const coerced = $('#evict-coerced')?.checked || false;

    try {
      const res = await fetch('/v1/tools/eviction-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeFormType: formType,
          monthlyRentCad: rent,
          noticeServedDate: servedDate,
          terminationDate: termDate,
          wasStatutoryCompensationPaid: compPaid,
          compensationPaidDate: compDate,
          isLandlordACorporation: isCorp,
          intendedOccupant: occupant,
          buildingUnitCount: units,
          allegedRentArrearsCad: arrears,
          includesIllegalCharges: illegalCharges,
          coercedOrMisrepresented: coerced
        })
      });
      if (!res.ok) throw new Error('Failed to audit eviction notice');
      const data = await res.json();
      renderEvictionDefenseAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>We could not check your notice. Please try again.</p></div>';
    }
  };

  calcBtn.addEventListener('click', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, calcBtn);
}

export function setupLeaseAssignment() {
  const form = $('#lease-assignment-form');
  const resultsContainer = $('#assignment-results');
  if (!form || !resultsContainer) return;

  const runAssignmentAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking lease assignment rights, 7-day response windows, and penalty fee rules...</p>';
    const province = $('#assign-province')?.value || 'ON';
    const leaseType = $('#assign-lease-type')?.value || 'fixed_term';
    const stage = $('#assign-stage')?.value || 'refused_in_principle';
    const days = Number($('#assign-days')?.value || 8);
    const rent = Number($('#assign-rent')?.value || 2400);
    const penalty = Number($('#assign-penalty')?.value || 0);
    const fee = Number($('#assign-fee')?.value || 0);

    try {
      const res = await fetch('/v1/tools/lease-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          leaseType,
          requestType: 'assignment',
          requestStage: stage,
          daysSinceRequest: days,
          monthlyRentCad: rent,
          landlordDemandedPenaltyCad: penalty,
          landlordDemandedAssignmentFeeCad: fee
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate lease assignment');
      const data = await res.json();
      renderLeaseAssignmentAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate lease assignment rights. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAssignmentAudit();
  });

  autoRun(runAssignmentAudit, form);
}

export function setupPrResidencyNavigator() {
  const form = $('#pr-residency-form');
  const resultsContainer = $('#pr-residency-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Counting your residency days…</p>';
    const landingDate = $('#pr-landing-date')?.value || '2022-01-01';
    const expiryDate = $('#pr-expiry-date')?.value || '2027-01-01';
    const daysInside = Number($('#pr-days-inside')?.value || 600);
    const spouseDays = Number($('#pr-spouse-days')?.value || 0);
    const businessDays = Number($('#pr-business-days')?.value || 0);
    const inCanada = $('#pr-in-canada')?.value !== 'no';
    const urgentTravel = $('#pr-urgent-travel')?.value === 'yes';
    const travelDate = $('#pr-travel-date')?.value || null;
    const urgentReason = $('#pr-urgent-reason')?.value || 'none';

    try {
      const res = await fetch('/v1/tools/pr-residency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prLandingDate: landingDate,
          prCardExpiryDate: expiryDate,
          physicalDaysInsideCanada: daysInside,
          overseasDaysWithCitizenSpouse: spouseDays,
          overseasDaysCanadianBusinessEmployment: businessDays,
          isCurrentlyInsideCanada: inCanada,
          hasUrgentTravelBooked: urgentTravel,
          urgentTravelDate: travelDate,
          urgentTravelReason: urgentReason
        })
      });
      if (!res.ok) throw new Error('Failed to audit PR residency obligation');
      const data = await res.json();
      renderPrResidencyAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>We could not check your residency days. Please try again.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupWorkerClassificationNavigator() {
  const form = $('#worker-class-form');
  const resultsContainer = $('#worker-class-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your work status and estimating unpaid wages…</p>';
    const prov = $('#wc-province')?.value || 'ON';
    const title = $('#wc-job-title')?.value || 'Contract Specialist';
    const rate = Number($('#wc-hourly-rate')?.value || 28);
    const weeklyHours = Number($('#wc-weekly-hours')?.value || 50);
    const totalWeeks = Number($('#wc-total-weeks')?.value || 52);
    const contractLabel = $('#wc-contract-label')?.value || 'independent_contractor';
    const vacationPaid = $('#wc-vacation-paid')?.value === 'yes';
    const overtimePaid = $('#wc-overtime-paid')?.value === 'yes';
    const holidays = Number($('#wc-holidays')?.value || 5);

    const setSchedule = $('#wc-set-schedule')?.checked || false;
    const provideTools = $('#wc-provide-tools')?.checked || false;
    const noSubcontract = $('#wc-no-subcontract')?.checked || false;
    const noRisk = $('#wc-no-risk')?.checked || false;
    const exclusive = $('#wc-exclusive')?.checked || false;

    try {
      const res = await fetch('/v1/tools/worker-classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province: prov,
          jobTitle: title,
          hourlyRateCad: rate,
          averageWeeklyHoursWorked: weeklyHours,
          weeksWorkedTotal: totalWeeks,
          contractLabelsWorkerAs: contractLabel,
          employerSetsScheduleAndLocation: setSchedule,
          employerProvidesToolsAndLaptop: provideTools,
          workerCannotHireSubcontractors: noSubcontract,
          workerHasNoRiskOfFinancialLoss: noRisk,
          workerWorksExclusivelyForEmployer: exclusive,
          wasVacationPayPaid: vacationPaid,
          wasOvertimePayPaid: overtimePaid,
          publicHolidaysWorkedCount: holidays
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate worker classification');
      const data = await res.json();
      renderWorkerClassificationAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate worker classification. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupMedicalAdmissibilityNavigator() {
  const form = $('#med-admiss-form');
  const resultsContainer = $('#med-admiss-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Comparing your expected costs with the medical limit…</p>';
    const stream = $('#med-stream')?.value || 'express_entry';
    const condition = $('#med-condition')?.value || 'Chronic Condition';
    const medCost = Number($('#med-cost-meds')?.value || 4500);
    const hospitalCost = Number($('#med-cost-hospital')?.value || 0);
    const hasInsurance = $('#med-has-insurance')?.value !== 'no';
    const insuranceLimit = Number($('#med-insurance-limit')?.value || 10000);
    const liquidFunds = Number($('#med-liquid-funds')?.value || 35000);
    const receivedPfl = $('#med-received-pfl')?.value === 'yes';
    const pflDate = $('#med-pfl-date')?.value || null;
    const dangerHealth = $('#med-danger-health')?.checked || false;
    const dangerSafety = $('#med-danger-safety')?.checked || false;

    try {
      const res = await fetch('/v1/tools/medical-admissibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immigrationStream: stream,
          conditionName: condition,
          estimatedAnnualMedicationCostCad: medCost,
          estimatedAnnualHospitalizationCostCad: hospitalCost,
          hasPrivateInsuranceCoverage: hasInsurance,
          privateInsuranceAnnualCoverageCad: insuranceLimit,
          availableLiquidFundsCad: liquidFunds,
          receivedProceduralFairnessLetter: receivedPfl,
          pflDateReceived: pflDate,
          hasDangerToPublicHealth: dangerHealth,
          hasDangerToPublicSafety: dangerSafety
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate medical admissibility');
      const data = await res.json();
      renderMedicalAdmissibilityAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate medical admissibility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupVehicleImportNavigator() {
  const form = $('#veh-import-form');
  const resultsContainer = $('#veh-import-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking whether your vehicle can be imported…</p>';
    const origin = $('#veh-origin')?.value || 'US';
    const year = Number($('#veh-model-year')?.value || 2022);
    const type = $('#veh-type')?.value || 'passenger_car';
    const value = Number($('#veh-value')?.value || 28000);
    const status = $('#veh-status')?.value || 'permanent_resident';
    const owned6Mo = $('#veh-owned-6mo')?.value !== 'no';
    const inName = $('#veh-in-name')?.value !== 'no';
    const prov = $('#veh-province')?.value || 'ON';
    const fuel = Number($('#veh-fuel-efficiency')?.value || 8.5);
    const hasAc = $('#veh-has-ac')?.checked || false;
    const hasRecall = $('#veh-has-recall')?.checked || false;

    try {
      const res = await fetch('/v1/tools/vehicle-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryOfOrigin: origin,
          vehicleModelYear: year,
          vehicleType: type,
          estimatedVehicleValueCad: value,
          settlerStatus: status,
          isOwnedAbroadAtLeastSixMonths: owned6Mo,
          isTitledInImmigrantName: inName,
          destinationProvince: prov,
          fuelEfficiencyLitersPer100Km: fuel,
          hasAirConditioning: hasAc,
          hasOpenRecall: hasRecall
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate vehicle importation');
      const data = await res.json();
      renderVehicleImportAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate vehicle importation. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupStudentWorkCompliance() {
  const form = $('#stu-compliance-form');
  const resultsContainer = $('#stu-compliance-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your work hours against student rules…</p>';
    const status = $('#stu-enrollment-status')?.value || 'full_time';
    const hours = Number($('#stu-weekly-hours')?.value || 20);
    const program = $('#stu-program-type')?.value || 'university_degree';
    const priorityField = $('#stu-priority-field')?.value !== 'no';
    const clb = Number($('#stu-clb-score')?.value || 7);
    const leaveDays = Number($('#stu-leave-days')?.value || 0);
    const dli = $('#stu-dli')?.checked ?? true;
    const sin = $('#stu-sin')?.checked ?? true;
    const permitWork = $('#stu-permit-work')?.checked ?? true;
    const continuous = $('#stu-continuous')?.checked ?? true;
    const leaveLetter = $('#stu-leave-letter')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/student-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentStatus: status,
          weeklyHoursWorked: hours,
          programType: program,
          isFieldOfStudyInPriorityShortage: priorityField,
          officialLanguageClbScore: clb,
          leaveDurationDays: leaveDays,
          isDliDesignated: dli,
          hasSocialInsuranceNumber: sin,
          studyPermitConditionAllowsWork: permitWork,
          hasMaintainedContinuousFullTimeEnrollment: continuous,
          hasAuthorizedLeaveApprovalLetter: leaveLetter
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate student compliance');
      const data = await res.json();
      renderStudentWorkComplianceAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate student compliance. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupVulnerableWorkerNavigator() {
  const form = $('#vwowp-form');
  const resultsContainer = $('#vwowp-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your eligibility for the vulnerable worker permit…</p>';
    const permit = $('#vwowp-permit-type')?.value || 'closed_employer_specific_work_permit';
    const province = $('#vwowp-province')?.value || 'ON';
    const fees = Number($('#vwowp-recruitment-fees')?.value || 0);
    const wages = Number($('#vwowp-unpaid-wages')?.value || 0);

    const grounds = [];
    if ($('#vwowp-abuse-fees')?.checked) grounds.push('illegal_recruitment_fees');
    if ($('#vwowp-abuse-deportation')?.checked) grounds.push('deportation_threats');
    if ($('#vwowp-abuse-passport')?.checked) grounds.push('document_confiscation');
    if ($('#vwowp-abuse-wages')?.checked) grounds.push('wage_theft_kickbacks');
    if ($('#vwowp-abuse-unsafe')?.checked) grounds.push('unsafe_conditions');
    if ($('#vwowp-abuse-physical')?.checked) grounds.push('physical_or_sexual_abuse');

    const evidence = [];
    if ($('#vwowp-ev-whatsapp')?.checked) evidence.push('text_messages_whatsapp');
    if ($('#vwowp-ev-audio')?.checked) evidence.push('audio_recordings');
    if ($('#vwowp-ev-paystubs')?.checked) evidence.push('pay_stubs_or_contracts');
    if ($('#vwowp-ev-witness')?.checked) evidence.push('witness_statements');

    try {
      const res = await fetch('/v1/tools/vulnerable-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPermitType: permit,
          abuseGrounds: grounds,
          recruitmentFeesPaidCad: fees,
          unpaidWagesOrKickbacksCad: wages,
          hasEvidenceDocs: evidence.length > 0,
          evidenceTypesHeld: evidence,
          workProvince: province
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate vulnerable worker protections');
      const data = await res.json();
      renderVulnerableWorkerAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate vulnerable worker protections. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupSuperVisaNavigator() {
  const form = $('#super-visa-form');
  const resultsContainer = $('#super-visa-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Comparing your income with the minimum required…</p>';
    const pathway = $('#sp-pathway')?.value || 'super_visa';
    const status = $('#sp-sponsor-status')?.value || 'permanent_resident';
    const famSize = Number($('#sp-family-size')?.value || 2);
    const parents = Number($('#sp-parents-count')?.value || 2);
    const y1 = Number($('#sp-y1')?.value || 65000);
    const y2 = Number($('#sp-y2')?.value || 62000);
    const y3 = Number($('#sp-y3')?.value || 58000);
    const hasCoSigner = $('#sp-has-cosigner')?.checked || false;
    const coSignerRel = $('#sp-cosigner-rel')?.value || 'spouse_or_common_law';
    const coY1 = Number($('#sp-co-y1')?.value || 0);
    const insAmount = Number($('#sp-ins-amount')?.value || 100000);
    const insDays = Number($('#sp-ins-days')?.value || 365);
    const insApproved = $('#sp-ins-approved')?.checked ?? true;
    const insPreExisting = $('#sp-ins-pre-existing')?.checked ?? true;
    const insRefundable = $('#sp-ins-refundable')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/super-visa-sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathway,
          sponsorStatus: status,
          sponsorFamilySize: famSize,
          invitedParentsCount: parents,
          sponsorLine15000IncomeYear1: y1,
          sponsorLine15000IncomeYear2: y2,
          sponsorLine15000IncomeYear3: y3,
          hasCoSigner,
          coSignerRelationship: coSignerRel,
          coSignerLine15000IncomeYear1: coY1,
          medicalInsurance: {
            hasMedicalInsuranceQuote: true,
            coverageAmountCad: insAmount,
            durationDays: insDays,
            isCanadianOrApprovedForeignProvider: insApproved,
            hasPreExistingCoverage: insPreExisting,
            isRefundableIfDenied: insRefundable
          }
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Super Visa sponsorship');
      const data = await res.json();
      renderSuperVisaAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Super Visa sponsorship. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupPetImportNavigator() {
  const form = $('#pet-import-form');
  const resultsContainer = $('#pet-import-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your pet’s entry rules…</p>';
    const type = $('#pet-type')?.value || 'dog';
    const breed = $('#pet-breed')?.value || 'golden_retriever';
    const prov = $('#pet-province')?.value || 'ON';
    const origin = $('#pet-origin')?.value || 'US';
    const age = Number($('#pet-age')?.value || 18);
    const vacDays = Number($('#pet-vac-days')?.value || 180);
    const titer = Number($('#pet-titer')?.value || 0.0);
    const microchip = $('#pet-microchip')?.checked ? 'iso_15_digit_implanted_before_rabies' : 'no_microchip';
    const vaccinated = $('#pet-vaccinated')?.checked ?? true;
    const hasCert = $('#pet-has-cert')?.checked ?? true;
    const hasFavn = $('#pet-has-favn')?.checked || titer >= 0.5;
    const isPersonal = $('#pet-is-personal')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/pet-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalType: type,
          dogBreed: breed,
          destinationProvince: prov,
          countryOfOrigin: origin,
          animalAgeMonths: age,
          vaccinationDateDaysAgo: vacDays,
          microchipStatus: microchip,
          isVaccinatedForRabies: vaccinated,
          hasOfficialRabiesCertificate: hasCert,
          hasFavnSerologyTiterTest: hasFavn,
          titerResultIuPerMl: titer,
          isPersonalPetOwnedByImmigrant: isPersonal
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate pet importation');
      const data = await res.json();
      renderPetImportAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate pet importation. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupExpressEntry() {
  const form = $('#express-entry-form');
  const resultsContainer = $('#express-entry-results');
  if (!form || !resultsContainer) return;

  const runCrsAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Calculating Comprehensive Ranking System (CRS) score and category-based draw cut-offs...</p>';
    const age = Number($('#ee-age')?.value || 29);
    const education = $('#ee-education')?.value || 'masters';
    const clb = Number($('#ee-clb')?.value || 9);
    const cdnExp = Number($('#ee-cdn-exp')?.value || 1);
    const foreignExp = Number($('#ee-foreign-exp')?.value || 3);
    const category = $('#ee-category')?.value || 'stem';
    const french = Number($('#ee-french')?.value || 0);
    const cdnStudy = $('#ee-cdn-study')?.value || 'post_secondary_3_plus_years';

    const married = $('#ee-married')?.checked || false;
    const pnp = $('#ee-pnp')?.checked || false;
    const lmia = $('#ee-lmia')?.checked || false;
    const sibling = $('#ee-sibling')?.checked || false;

    try {
      const res = await fetch('/v1/tools/express-entry-crs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          educationLevel: education,
          firstLanguageClb: clb,
          canadianWorkExperienceYears: cdnExp,
          foreignWorkExperienceYears: foreignExp,
          isMarried: married,
          occupationCategory: category,
          frenchNclcLevel: french,
          canadianEducationLevel: cdnStudy,
          hasProvincialNomination: pnp,
          hasArrangedEmploymentLmia: lmia,
          hasSiblingInCanada: sibling
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Express Entry CRS');
      const data = await res.json();
      renderExpressEntryAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Express Entry CRS. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCrsAudit();
  });

  autoRun(runCrsAudit, form);
}

export function setupParentalLeave() {
  const form = $('#parental-leave-form');
  const resultsContainer = $('#parental-leave-results');
  if (!form || !resultsContainer) return;

  const runLeaveAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your EI hours and job protection…</p>';
    const province = $('#pl-province')?.value || 'ON';
    const status = $('#pl-status')?.value || 'permanent_resident';
    const hours = Number($('#pl-hours')?.value || 750);
    const salary = Number($('#pl-salary')?.value || 65000);
    const leaveType = $('#pl-leave-type')?.value || 'maternity_and_parental';
    const option = $('#pl-option')?.value || 'standard';
    const serviceWeeks = Number($('#pl-service-weeks')?.value || 16);
    const isSharing = $('#pl-sharing')?.value !== 'no';
    const expiry = $('#pl-expiry-date')?.value || null;

    try {
      const res = await fetch('/v1/tools/parental-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          immigrationStatus: status,
          insurableHoursWorkedPast52Weeks: hours,
          annualGrossSalaryCad: salary,
          leaveType,
          parentalOption: option,
          employerServiceWeeks: serviceWeeks,
          isSharingWithPartner: isSharing,
          workPermitExpiryDate: expiry
        })
      });
      if (!res.ok) throw new Error('Failed to audit parental leave');
      const data = await res.json();
      renderParentalLeaveAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate parental leave. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runLeaveAudit();
  });

  autoRun(runLeaveAudit, form);
}

export function setupBusinessStructure() {
  const form = $('#business-structure-form');
  const resultsContainer = $('#business-structure-results');
  if (!form || !resultsContainer) return;

  const runBizAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your permit, business structure and tax rules…</p>';
    const status = $('#biz-status')?.value || 'pgwp';
    const province = $('#biz-province')?.value || 'ON';
    const revenue = Number($('#biz-revenue')?.value || 65000);
    const expenses = Number($('#biz-expenses')?.value || 10000);
    const clients = Number($('#biz-clients')?.value || 3);
    const hasSubcontractors = $('#biz-subcontractors')?.value === 'true';

    try {
      const res = await fetch('/v1/tools/business-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...({
            pgwp: { immigrationStatus: 'work_permit_holder', workPermitType: 'open_work_permit' },
            closed_work_permit: { immigrationStatus: 'work_permit_holder', workPermitType: 'closed_employer_specific' },
            study_permit: { immigrationStatus: 'study_permit_holder', workPermitType: 'none' },
            visitor: { immigrationStatus: 'visitor', workPermitType: 'none' }
          }[status] || { immigrationStatus: 'permanent_resident', workPermitType: 'none' }),
          province,
          projectedAnnualRevenueCad: revenue,
          annualBusinessExpensesCad: expenses,
          clientCount: clients,
          subcontractorHiringPermitted: hasSubcontractors,
          providesOwnEquipmentAndTools: hasSubcontractors
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate business structure');
      const data = await res.json();
      renderBusinessStructureAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate business structure. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runBizAudit();
  });

  autoRun(runBizAudit, form);
}

export function setupPnpPathway() {
  const form = $('#pnp-form');
  const resultsContainer = $('#pnp-results');
  if (!form || !resultsContainer) return;

  const runPnpAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Estimating your provincial nominee score…</p>';
    const province = $('#pnp-province')?.value || 'BC';
    const noc = $('#pnp-noc')?.value || '21231';
    const wage = Number($('#pnp-wage')?.value || 42);
    const jobOffer = $('#pnp-job-offer')?.value !== 'false';
    const ee = $('#pnp-ee')?.value === 'true';
    const crs = Number($('#pnp-crs')?.value || 465);
    const exp = Number($('#pnp-exp')?.value || 4);
    const cdnExp = $('#pnp-cdn-exp')?.value === 'true';
    const worksBc = $('#pnp-works-bc')?.value === 'true';
    const edu = $('#pnp-edu')?.value || 'masters';
    const bcEdu = $('#pnp-bc-edu')?.value === 'true';
    const clb = Number($('#pnp-clb')?.value || 9);
    const bilingual = $('#pnp-bilingual')?.value === 'true';
    const area = $('#pnp-area')?.value || 'area_1_metro_van';
    const savings = Number($('#pnp-savings')?.value || 25000);
    const familySize = Number($('#pnp-family-size')?.value || 1);

    try {
      const res = await fetch('/v1/tools/pnp-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetProvince: province,
          nocCode: noc,
          hourlyWage: wage,
          hasFullTimeJobOffer: jobOffer,
          hasActiveExpressEntryProfile: ee,
          expressEntryCrsScore: crs,
          yearsOfDirectExperience: exp,
          hasOneYearCanadianExperience: cdnExp,
          currentlyWorkingForBcEmployer: worksBc,
          educationLevel: edu,
          completedBcEducation: bcEdu,
          clbLevel: clb,
          isBilingualEnglishAndFrench: bilingual,
          jobLocationArea: area,
          familySize,
          liquidSavingsCad: savings
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate PNP pathway');
      const data = await res.json();
      renderPnpAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Provincial Nominee Program pathway. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runPnpAudit();
  });

  autoRun(runPnpAudit, form);
}

export function setupBowpDiagnostic() {
  const form = $('#bowp-form');
  const resultsContainer = $('#bowp-results');
  if (!form || !resultsContainer) return;

  const runBowpAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking your BOWP eligibility…</p>';
    const permitType = $('#bowp-permit-type')?.value || 'pgwp';
    const expiryDate = $('#bowp-expiry')?.value || '2026-12-31';
    const inland = $('#bowp-inland')?.value !== 'false';
    const prProgram = $('#bowp-pr-program')?.value || 'express_entry_cec';
    const aor = $('#bowp-aor')?.value === 'true';
    const pnpRestrictions = $('#bowp-pnp-restrictions')?.value === 'true';
    const province = $('#bowp-province')?.value || 'BC';
    const spouse = $('#bowp-spouse')?.value === 'true';
    const teer = $('#bowp-teer')?.value || 'teer_1';
    const paystubs = $('#bowp-paystubs')?.value === 'true';

    try {
      const res = await fetch('/v1/tools/bowp-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPermitType: permitType,
          permitExpiryDate: expiryDate,
          isPhysicallyInCanada: inland,
          prProgramApplied: prProgram,
          hasOfficialAor: aor,
          pnpNominationHasEmployerRestrictions: pnpRestrictions,
          pnpProvince: province,
          hasSpouse: spouse,
          principalTeerLevel: teer,
          principalHasPayStubs: paystubs
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate BOWP diagnostic');
      const data = await res.json();
      renderBowpAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Bridging Open Work Permit diagnostic. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runBowpAudit();
  });

  autoRun(runBowpAudit, form);
}

export function setupCurrencyExchange() {
  const form = $('#currency-exchange-form');
  const resultsContainer = $('#currency-exchange-results');
  if (!form || !resultsContainer) return;

  const runFxAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Comparing transfer costs and reporting rules…</p>';
    const amount = Number($('#fx-amount')?.value || 25000);
    const from = $('#fx-from')?.value || 'USD';
    const to = $('#fx-to')?.value || 'CAD';
    const source = $('#fx-source')?.value || 'savings_income';
    const broker = $('#fx-broker')?.value || 'questrade';
    const splitVal = $('#fx-split-select')?.value || 'single';
    const crossBorder = $('#fx-cross-border')?.checked || false;

    const isSplit = splitVal !== 'single';
    const tranches = splitVal === 'split_3' ? 3 : splitVal === 'split_2' ? 2 : 1;

    try {
      const res = await fetch('/v1/tools/currency-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          fromCurrency: from,
          toCurrency: to,
          sourceOfFunds: source,
          isSplitIntoMultipleTranches: isSplit,
          trancheCount: tranches,
          brokeragePlatform: broker,
          hasCrossBorderAccount: crossBorder
        })
      });
      if (!res.ok) throw new Error('Failed to audit currency exchange');
      const data = await res.json();
      renderCurrencyExchangeAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate currency exchange. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runFxAudit();
  });

  autoRun(runFxAudit, form);
}

export function setupDebtCollectionDefense() {
  const form = $('#debt-defense-form');
  const resultsContainer = $('#debt-defense-results');
  if (!form || !resultsContainer) return;

  const runDefenseAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Checking time limits and collection rules…</p>';
    const province = $('#debt-defense-province')?.value || 'ON';
    const debtType = $('#debt-defense-type')?.value || 'credit_card';
    const amount = Number($('#debt-defense-amount')?.value || 3500);
    const agency = $('#debt-defense-agency')?.value || 'MetCredit';
    const creditor = $('#debt-defense-creditor')?.value || 'Rogers Communications';
    const defaultDate = $('#debt-defense-default-date')?.value || null;
    const writtenNotice = $('#debt-defense-written-notice')?.value === 'true';
    const disputed = $('#debt-defense-dispute')?.value === 'true';

    const behaviors = [];
    if ($('#debt-defense-threaten-deport')?.checked) behaviors.push('threaten_visa_or_deportation');
    if ($('#debt-defense-contact-employer')?.checked) behaviors.push('contact_employer');
    if ($('#debt-defense-harass-family')?.checked) behaviors.push('harass_family_or_friends');
    if ($('#debt-defense-excessive-calls')?.checked) behaviors.push('excessive_calls');
    if ($('#debt-defense-threaten-jail')?.checked) behaviors.push('threaten_arrest_or_jail');
    if ($('#debt-defense-prohibited-hours')?.checked) behaviors.push('prohibited_hours');

    try {
      const res = await fetch('/v1/tools/debt-collection-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          debtType,
          originalCreditor: creditor,
          collectionAgency: agency,
          amountClaimedCad: amount,
          dateOfDefaultOrLastPayment: defaultDate || null,
          writtenNoticeReceived: writtenNotice,
          collectorBehaviors: behaviors,
          disputedDebt: disputed,
          applicantImmigrationStatus: 'permanent_resident'
        })
      });
      if (!res.ok) throw new Error('Failed to audit debt collection defense');
      const data = await res.json();
      renderDebtCollectionAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate debt collection defense. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runDefenseAudit();
  });

  autoRun(runDefenseAudit, form);
}

export function setupIdentityHarmonization() {
  const form = $('#identity-harmonization-form');
  const resultsContainer = $('#identity-harmonization-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Working out the steps to fix your name…</p>';
    const discrepancy = $('#id-discrepancy')?.value || 'single_name_blank_surname';
    const status = $('#id-status')?.value || 'permanent_resident';
    const province = $('#id-province')?.value || 'ON';
    const months = Number($('#id-months')?.value || 14);
    const origin = $('#id-origin')?.value || 'IN';
    const singleName = $('#id-single-name-cb')?.checked ?? true;

    const docs = [];
    if ($('#id-bank-affected-cb')?.checked) docs.push('bank_accounts');
    if ($('#id-sin-affected-cb')?.checked) docs.push('sin_paper');

    try {
      const res = await fetch('/v1/tools/identity-harmonization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discrepancyType: discrepancy,
          currentStatusInCanada: status,
          residenceProvince: province,
          monthsLivedInProvince: months,
          foreignCountryOfOrigin: origin,
          hasForeignPassportSingleName: singleName,
          documentsShowingDiscrepancy: docs
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate identity harmonization');
      const data = await res.json();
      renderIdentityHarmonizationAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate identity harmonization. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupMovingTaxCalculator() {
  const form = $('#moving-tax-form');
  const resultsContainer = $('#moving-tax-results');
  if (!form || !resultsContainer) return;

  const runMovingTaxAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Calculating CRA Form T1-M moving deductions, 15-day temporary living caps, and carry-forward...</p>';
    const province = $('#moving-tax-province')?.value || 'ON';
    const purpose = $('#moving-tax-purpose')?.value || 'employment';
    const origin = $('#moving-tax-origin')?.value || 'Seattle, United States';
    const destCity = $('#moving-tax-dest-city')?.value || 'Toronto';
    const distance = Number($('#moving-tax-distance')?.value || 4200);
    const income = Number($('#moving-tax-income')?.value || 45000);
    const travel = Number($('#moving-tax-travel')?.value || 2200);
    const shipping = Number($('#moving-tax-shipping')?.value || 5500);
    const livingDays = Number($('#moving-tax-living-days')?.value || 12);
    const livingDaily = Number($('#moving-tax-living-daily')?.value || 180);
    const leasePenalty = Number($('#moving-tax-lease-penalty')?.value || 1200);
    const utilityFees = Number($('#moving-tax-utility')?.value || 350);
    const reimbursement = Number($('#moving-tax-reimbursement')?.value || 0);

    const parts = origin.split(',').map(s => s.trim());
    const originCity = parts[0] || 'Seattle';
    const originCountry = parts[1] || 'United States';

    try {
      const res = await fetch('/v1/tools/moving-tax-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          relocationPurpose: purpose,
          oldCountry: originCountry,
          oldCity: originCity,
          newCity: destCity,
          distanceKm: distance,
          canadianIncomeEarnedInYearCad: income,
          travelExpensesCad: travel,
          moversAndShippingCad: shipping,
          temporaryLivingDays: livingDays,
          temporaryLivingDailyCostCad: livingDaily,
          leaseCancellationPenaltyCad: leasePenalty,
          utilityAndAddressChangeFeesCad: utilityFees,
          employerReimbursementCad: reimbursement
        })
      });
      if (!res.ok) throw new Error('Failed to audit moving tax deductions');
      const data = await res.json();
      renderMovingTaxAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate moving tax deductions. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runMovingTaxAudit();
  });

  autoRun(runMovingTaxAudit, form);
}

export function setupCredentialLicensure() {
  const form = $('#credential-licensure-form');
  const resultsContainer = $('#credential-licensure-results');
  if (!form || !resultsContainer) return;

  const runLicensureAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing provincial regulatory college requirements, FARPACTA protections, and alternative career pathways...</p>';
    const province = $('#cred-lic-province')?.value || 'ON';
    const profession = $('#cred-lic-profession')?.value || 'civil_engineer';
    const degree = $('#cred-lic-degree')?.value || 'bachelors';
    const exp = Number($('#cred-lic-exp')?.value || 5);
    const eca = $('#cred-lic-eca')?.value || 'WES';
    const clb = Number($('#cred-lic-clb')?.value || 8);

    const hasEca = eca !== 'NONE';

    try {
      const res = await fetch('/v1/tools/credential-licensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession,
          province,
          foreignDegreeLevel: degree,
          yearsOfForeignExperience: exp,
          hasEca,
          ecaOrganization: eca === 'NONE' ? '' : eca,
          officialLanguageClb: clb
        })
      });
      if (!res.ok) throw new Error('Failed to audit credential licensure');
      const data = await res.json();
      renderCredentialLicensureAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate credential licensure. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runLicensureAudit();
  });

  autoRun(runLicensureAudit, form);
}

export function setupTelecomContractDefense() {
  const form = $('#telecom-defense-form');
  const resultsContainer = $('#telecom-defense-results');
  if (!form || !resultsContainer) return;

  const runTelecomAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing telecom contract terms, CRTC Wireless Code caps, and 15-day cancellation rights...</p>';
    const provider = $('#telecom-provider')?.value || 'Rogers';
    const contractType = $('#telecom-contract-type')?.value || 'postpaid_device_financing';
    const days = Number($('#telecom-days')?.value || 10);
    const disability = $('#telecom-disability')?.value === 'true';
    const subsidy = Number($('#telecom-subsidy')?.value || 800);
    const months = Number($('#telecom-months')?.value || 1);
    const condition = $('#telecom-condition')?.value !== 'damaged';
    const disputedTotal = Number($('#telecom-disputed-total')?.value || 140);
    const dataOverage = Number($('#telecom-data-overage')?.value || 0);
    const roaming = Number($('#telecom-roaming')?.value || 0);
    const unlockFee = Number($('#telecom-unlock-fee')?.value || 0);
    const refusedTrial = $('#telecom-refused-trial')?.checked || false;
    const priceIncrease = $('#telecom-price-increase')?.checked || false;

    try {
      const res = await fetch('/v1/tools/telecom-contract-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: provider,
          contractType,
          daysSinceContractStart: days,
          hasDisability: disability,
          deviceSubsidyTotalCad: subsidy,
          monthsIntoContract: months,
          deviceInOriginalCondition: condition,
          disputedChargesTotalCad: disputedTotal,
          dataOverageChargedCad: dataOverage,
          roamingChargedCad: roaming,
          unlockedDeviceFeeChargedCad: unlockFee,
          refusedTrialCancellation: refusedTrial,
          providerUnilateralPriceIncrease: priceIncrease
        })
      });
      if (!res.ok) throw new Error('Failed to audit telecom dispute');
      const data = await res.json();
      renderTelecomAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate telecom dispute. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runTelecomAudit();
  });

  autoRun(runTelecomAudit, form);
}

export function setupBorderFlagpoling() {
  const form = $('#flagpole-form');
  const resultsContainer = $('#flagpole-results');
  if (!form || !resultsContainer) return;

  const runFlagpoleAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Evaluating CBSA border flagpoling feasibility, PGWP border restrictions, and maintained status risk...</p>';
    const permit = $('#flagpole-permit')?.value || 'pgwp';
    const citizenship = $('#flagpole-citizenship')?.value || 'IN';
    const status = $('#flagpole-status')?.value || 'maintained_status';
    const port = $('#flagpole-port')?.value || 'rainbow_bridge';
    const day = $('#flagpole-day')?.value || 'Wednesday';
    const jobOffer = $('#flagpole-job-offer')?.value !== 'false';
    const lmiaExempt = $('#flagpole-lmia-exempt')?.value === 'true';
    const approvedLmia = $('#flagpole-approved-lmia')?.value === 'true';
    const usVisa = $('#flagpole-us-visa')?.value === 'true';

    try {
      const res = await fetch('/v1/tools/border-flagpoling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permitCategory: permit,
          countryOfCitizenship: citizenship,
          currentStatusInCanada: status,
          portOfEntry: port,
          dayOfWeek: day,
          hasJobOffer: jobOffer,
          isLmiaExempt: lmiaExempt,
          hasApprovedLmia: approvedLmia,
          hasValidUsVisa: usVisa
        })
      });
      if (!res.ok) throw new Error('Failed to audit flagpoling eligibility');
      const data = await res.json();
      renderBorderFlagpolingResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate flagpoling risks. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runFlagpoleAudit();
  });

  autoRun(runFlagpoleAudit, form);
}

export function setupRentIncreaseDefense() {
  const form = $('#rent-increase-form');
  const resultsContainer = $('#rent-increase-results');
  if (!form || !resultsContainer) return;

  const runRentAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing rent increase notice, statutory guidelines, and AGI defense rights...</p>';
    const province = $('#rent-prov')?.value || 'ON';
    const firstOccupied = $('#rent-first-occupied')?.value || '2017-01-01';
    const currentRent = Number($('#rent-curr')?.value || 2200);
    const proposedRent = Number($('#rent-prop')?.value || 2400);
    const servedDate = $('#rent-served-date')?.value || '2026-05-01';
    const effDate = $('#rent-eff-date')?.value || '2026-08-01';
    const lastDate = $('#rent-last-date')?.value || '2025-08-01';
    const formType = $('#rent-form-type')?.value || 'N1';
    const isAgi = $('#rent-is-agi')?.checked || false;
    const ltbOrder = $('#rent-ltb-order')?.checked || false;
    const defects = $('#rent-maintenance-defects')?.checked || false;

    try {
      const res = await fetch('/v1/tools/rent-increase-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          firstOccupiedDate: firstOccupied,
          currentMonthlyRentCad: currentRent,
          proposedMonthlyRentCad: proposedRent,
          noticeServedDate: servedDate,
          effectiveDate: effDate,
          lastIncreaseDate: lastDate,
          officialFormUsed: formType,
          isAgiClaimed: isAgi,
          hasLtbOrderBeenIssued: ltbOrder,
          unresolvedMaintenanceDefects: defects
        })
      });
      if (!res.ok) throw new Error('Failed to audit rent increase');
      const data = await res.json();
      renderRentIncreaseAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate rent increase. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runRentAudit();
  });

  autoRun(runRentAudit, form);
}

export function setupHumanRightsDefense() {
  const form = $('#human-rights-form');
  const resultsContainer = $('#human-rights-results');
  if (!form || !resultsContainer) return;

  const runHrAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Evaluating workplace human rights violations, harassment, and constructive dismissal under SCC jurisprudence...</p>';
    const jurisdiction = $('#hr-jurisdiction')?.value || 'ON';
    const salary = Number($('#hr-salary')?.value || 85000);
    const years = Number($('#hr-years')?.value || 3.0);
    const age = Number($('#hr-age')?.value || 35);
    const days = Number($('#hr-days')?.value || 30);
    const reported = $('#hr-reported')?.value === 'true';
    const response = $('#hr-response')?.value || 'none';

    const grounds = [];
    if ($('#hr-ground-origin')?.checked) grounds.push('place_of_origin');
    if ($('#hr-ground-citizenship')?.checked) grounds.push('citizenship');
    if ($('#hr-ground-race')?.checked) grounds.push('race_ethnic_origin');
    if ($('#hr-ground-creed')?.checked) grounds.push('creed_religion');
    if ($('#hr-ground-sex')?.checked) grounds.push('sex_gender');
    if ($('#hr-ground-disability')?.checked) grounds.push('disability_medical');

    const conduct = [];
    if ($('#hr-conduct-cdn-exp')?.checked) conduct.push('canadian_experience_requirement');
    if ($('#hr-conduct-harass')?.checked) conduct.push('slurs_or_harassment');
    if ($('#hr-conduct-accommodate')?.checked) conduct.push('unreasonable_refusal_of_accommodation');
    if ($('#hr-conduct-reprisal')?.checked) conduct.push('retaliation_or_reprisal');
    if ($('#hr-conduct-salary-cut')?.checked) conduct.push('salary_cut_greater_15_percent');
    if ($('#hr-conduct-suspension')?.checked) conduct.push('indefinite_unpaid_suspension');
    if ($('#hr-conduct-toxic')?.checked) conduct.push('toxic_workplace_environment');

    try {
      const res = await fetch('/v1/tools/human-rights-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurisdiction,
          protectedGrounds: grounds,
          conductTypes: conduct,
          daysSinceLastIncident: days,
          hasReportedInternally: reported,
          employerResponse: response,
          annualSalaryCad: salary,
          yearsOfService: years,
          applicantAge: age
        })
      });
      if (!res.ok) throw new Error('Failed to audit human rights dispute');
      const data = await res.json();
      renderHumanRightsAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate human rights dispute. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runHrAudit();
  });

  autoRun(runHrAudit, form);
}

export function setupHomebuyerTaxIncentives() {
  const form = $('#homebuyer-tax-form');
  const resultsContainer = $('#homebuyer-tax-results');
  if (!form || !resultsContainer) return;

  const runAssessment = async () => {
    resultsContainer.innerHTML = '<p class="muted">Calculating FHSA tax deductions, $60,000 RRSP HBP unlocked down payment, and land transfer tax rebates...</p>';
    const province = $('#hbt-province')?.value || 'ON';
    const city = $('#hbt-city')?.value || 'Toronto';
    const homePurchasePriceCad = Number($('#hbt-price')?.value || 750000);
    const isFirstTimeHomeBuyer = $('#hbt-fthb')?.value === 'true';
    const marginalTaxRatePercent = Number($('#hbt-tax-rate')?.value || 35);
    const plannedPurchaseYear = Number($('#hbt-purchase-year')?.value || 2026);
    const hasSpouseOrPartner = $('#hbt-has-spouse')?.checked || false;

    const applicant1 = {
      annualIncomeCad: 85000,
      rrspBalanceCad: Number($('#hbt-a1-rrsp')?.value || 0),
      fhsaBalanceCad: Number($('#hbt-a1-fhsa')?.value || 0),
      fhsaYearsActive: 2
    };

    const applicant2 = hasSpouseOrPartner ? {
      annualIncomeCad: 65000,
      rrspBalanceCad: Number($('#hbt-a2-rrsp')?.value || 0),
      fhsaBalanceCad: Number($('#hbt-a2-fhsa')?.value || 0),
      fhsaYearsActive: 1
    } : null;

    try {
      const res = await fetch('/v1/tools/homebuyer-tax-incentives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          city,
          homePurchasePriceCad,
          isFirstTimeHomeBuyer,
          marginalTaxRatePercent,
          applicant1,
          hasSpouseOrPartner,
          applicant2,
          plannedPurchaseYear
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate homebuyer tax incentives');
      const data = await res.json();
      renderHomebuyerTaxAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate homebuyer tax incentives. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAssessment();
  });

  autoRun(runAssessment, form);
}

export function setupAutoInsurance() {
  const form = $('#auto-insurance-form');
  const resultsContainer = $('#auto-insurance-results');
  if (!form || !resultsContainer) return;

  const runAutoAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing territory rating, foreign experience letters, SABS accident benefits and FSRA underwriting compliance...</p>';
    const province = $('#auto-province')?.value || 'ON';
    const postalCode = $('#auto-postal')?.value || 'L6Y 2T3';
    const annualGrossIncomeCad = Number($('#auto-income')?.value || 85000);
    const employmentStatus = $('#auto-status')?.value || 'employed';
    const weeksEmployedPast52 = Number($('#auto-weeks')?.value || 52);
    const foreignDrivingYears = Number($('#auto-foreign-years')?.value || 5);
    const hasForeignExperienceLetter = $('#auto-has-letter')?.checked || false;
    const canadianLicenceClass = $('#auto-licence-class')?.value || 'G';
    const optionalIrbEndorsementWeeklyCad = Number($('#auto-irb-cap')?.value || 400);
    const experiencedRefusalOrUnreasonableDelay = $('#auto-refusal')?.checked || false;

    try {
      const res = await fetch('/v1/tools/auto-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          postalCode,
          annualGrossIncomeCad,
          employmentStatus,
          weeksEmployedPast52,
          foreignDrivingYears,
          hasForeignExperienceLetter,
          canadianLicenceClass,
          optionalIrbEndorsementWeeklyCad,
          experiencedRefusalOrUnreasonableDelay
        })
      });
      if (!res.ok) throw new Error('Failed to audit auto insurance');
      const data = await res.json();
      renderAutoInsuranceAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate auto insurance profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAutoAudit();
  });

  autoRun(runAutoAudit, form);
}

export function setupEstatePlanning() {
  const form = $('#estate-planning-form');
  const resultsContainer = $('#estate-planning-results');
  if (!form || !resultsContainer) return;

  const runEstateAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing estate plan, multijurisdictional wills, probate taxes, and statutory intestacy distribution...</p>';
    const province = $('#estate-province')?.value || 'ON';
    const maritalStatus = $('#estate-marital')?.value || 'married';
    const childrenCount = Number($('#estate-kids-count')?.value || 1);
    const canadianRealEstateCad = Number($('#estate-real-estate')?.value || 800000);
    const realEstateOwnershipStructure = $('#estate-ownership')?.value || 'joint_tenancy';
    const canadianRegisteredAccountsCad = Number($('#estate-registered')?.value || 120000);
    const canadianBankAccountsAndLiquidCad = Number($('#estate-liquid')?.value || 60000);
    const foreignAssetsValueCad = Number($('#estate-foreign-assets')?.value || 350000);
    const foreignCountry = $('#estate-foreign-country')?.value || 'India';
    const namedExecutorLocation = $('#estate-executor-loc')?.value || 'canadian_resident';

    const hasDesignatedBeneficiariesOnRegisteredAccounts = $('#estate-beneficiaries')?.checked || false;
    const hasForeignRealEstateOrAssets = $('#estate-has-foreign-assets')?.checked || false;
    const hasExistingForeignWill = $('#estate-foreign-will')?.checked || false;
    const hasCanadianWill = $('#estate-canadian-will')?.checked || false;
    const hasContinuingPowerOfAttorneyProperty = $('#estate-has-cpoa')?.checked || false;
    const hasPowerOfAttorneyPersonalCare = $('#estate-has-poapc')?.checked || false;

    try {
      const res = await fetch('/v1/tools/estate-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          maritalStatus,
          hasChildren: childrenCount > 0,
          childrenCount,
          hasMinorChildren: childrenCount > 0,
          canadianRealEstateCad,
          realEstateOwnershipStructure,
          canadianRegisteredAccountsCad,
          hasDesignatedBeneficiariesOnRegisteredAccounts,
          canadianBankAccountsAndLiquidCad,
          hasForeignRealEstateOrAssets,
          foreignAssetsValueCad,
          foreignCountry,
          hasExistingForeignWill,
          hasCanadianWill,
          hasContinuingPowerOfAttorneyProperty,
          hasPowerOfAttorneyPersonalCare,
          namedExecutorLocation
        })
      });
      if (!res.ok) throw new Error('Failed to audit estate plan');
      const data = await res.json();
      renderEstatePlanningAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate estate plan profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runEstateAudit();
  });

  autoRun(runEstateAudit, form);
}

export function setupSmallClaims() {
  const form = $('#small-claims-form');
  const resultsContainer = $('#small-claims-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing small claims court jurisdiction, limitation period, and pre-judgment interest...</p>';
    const province = $('#sc-province')?.value || 'ON';
    const claimAmountCad = Number($('#sc-claim-amount')?.value || 12000);
    const disputeType = $('#sc-dispute-type')?.value || 'breach_of_contract';
    const dateCauseOfActionArose = $('#sc-incident-date')?.value || '2025-10-01';
    const plaintiffName = $('#sc-plaintiff-name')?.value || 'Claimant';
    const defendantName = $('#sc-defendant-name')?.value || 'Acme Renovations Inc.';
    const defendantType = $('#sc-defendant-type')?.value || 'business';
    const hasSentDemandLetter = $('#sc-demand-sent')?.checked || false;
    const prejudgmentInterestRatePercent = Number($('#sc-pji-rate')?.value || 4.0);

    try {
      const res = await fetch('/v1/tools/small-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          claimAmountCad,
          disputeType,
          dateCauseOfActionArose,
          plaintiffName,
          defendantName,
          defendantType,
          hasSentDemandLetter,
          prejudgmentInterestRatePercent
        })
      });
      if (!res.ok) throw new Error('Failed to audit small claims dispute');
      const data = await res.json();
      renderSmallClaimsAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate small claims dispute. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupCraVdp() {
  const form = $('#cra-vdp-form');
  const resultsContainer = $('#cra-vdp-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing CRA Voluntary Disclosures Program eligibility, T1135 newcomer exemption, and penalty relief...</p>';
    const landingYear = Number($('#vdp-landing-year')?.value || 2022);
    const yearsStr = $('#vdp-omitted-years')?.value || '2023, 2024';
    const taxYearsOmitted = yearsStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
    const maxForeignCostAmountCad = Number($('#vdp-foreign-cost')?.value || 175000);
    const foreignIncomeAnnualCad = Number($('#vdp-foreign-income')?.value || 8000);
    const unreportedDomesticIncomeCad = Number($('#vdp-domestic-income')?.value || 0);

    const hasCraContactedOrAudited = $('#vdp-cra-contacted')?.checked || false;
    const hasActiveOffshoreEntitiesOrShellCompanies = $('#vdp-offshore-shell')?.checked || false;
    const hasT1135BeenFiled = $('#vdp-t1135-filed')?.checked || false;

    try {
      const res = await fetch('/v1/tools/cra-voluntary-disclosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingYear,
          taxYearsOmitted,
          maxForeignCostAmountCad,
          foreignIncomeAnnualCad,
          unreportedDomesticIncomeCad,
          hasCraContactedOrAudited,
          hasActiveOffshoreEntitiesOrShellCompanies,
          hasT1135BeenFiled
        })
      });
      if (!res.ok) throw new Error('Failed to audit CRA voluntary disclosure profile');
      const data = await res.json();
      renderCraVdpAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate CRA voluntary disclosure profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupStatutoryPay() {
  const form = $('#statutory-pay-form');
  const resultsContainer = $('#statutory-pay-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing statutory pay statement, overtime thresholds, vacation pay, and deductions...</p>';
    const province = $('#sp-province')?.value || 'ON';
    const grossHourlyWageCad = Number($('#sp-hourly-wage')?.value || 22.0);
    const hoursWorkedInPayPeriod = Number($('#sp-hours-worked')?.value || 88);
    const tenureYears = Number($('#sp-tenure-years')?.value || 2.0);
    const payPeriodWeeks = Number($('#sp-pay-period-weeks')?.value || 2);
    const statutoryHolidaysInPeriod = Number($('#sp-stat-holidays')?.value || 1);
    const unauthorizedDeductionsCad = Number($('#sp-unauthorized-deductions')?.value || 0);
    const deductionReason = $('#sp-deduction-reason')?.value || 'none';

    const workedOnStatHoliday = $('#sp-worked-holiday')?.checked || false;
    const hoursWorkedOnStatHoliday = Number($('#sp-holiday-hours')?.value || 0);

    try {
      const res = await fetch('/v1/tools/statutory-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          grossHourlyWageCad,
          hoursWorkedInPayPeriod,
          tenureYears,
          payPeriodWeeks,
          statutoryHolidaysInPeriod,
          workedOnStatHoliday,
          hoursWorkedOnStatHoliday,
          unauthorizedDeductionsCad,
          deductionReason
        })
      });
      if (!res.ok) throw new Error('Failed to audit statutory pay');
      const data = await res.json();
      renderStatutoryPayAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate statutory pay. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupConsumerProtection() {
  const form = $('#consumer-protection-form');
  const resultsContainer = $('#consumer-protection-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing consumer agreement, door-to-door ban compliance, and cooling-off period...</p>';
    const province = $('#cp-province')?.value || 'ON';
    const contractType = $('#cp-contract-type')?.value || 'water_heater_rental';
    const contractDate = $('#cp-contract-date')?.value || '2026-10-25';
    const contractValueCad = Number($('#cp-contract-value')?.value || 4800);
    const consumerName = $('#cp-consumer-name')?.value || 'Consumer';
    const supplierName = $('#cp-supplier-name')?.value || 'Eco-Comfort Home Services Inc.';

    const wasUnsolicitedInHomeVisit = $('#cp-unsolicited-visit')?.checked || false;
    const prescribedBannedProduct = $('#cp-banned-product')?.checked || false;
    const missingMandatoryDisclosures = $('#cp-missing-disclosures')?.checked || false;
    const hasUnfairPractices = $('#cp-unfair-practices')?.checked || false;
    const unfairPracticeType = $('#cp-unfair-type')?.value || 'none';

    try {
      const res = await fetch('/v1/tools/consumer-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          contractType,
          contractDate,
          contractValueCad,
          consumerName,
          supplierName,
          wasUnsolicitedInHomeVisit,
          prescribedBannedProduct,
          missingMandatoryDisclosures,
          hasUnfairPractices,
          unfairPracticeType
        })
      });
      if (!res.ok) throw new Error('Failed to audit consumer contract');
      const data = await res.json();
      renderConsumerProtectionAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate consumer contract. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupFamilyLaw() {
  const form = $('#family-law-form');
  const resultsContainer = $('#family-law-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing child support tables, spousal support advisory guidelines, and net family property equalization...</p>';
    const province = $('#fl-province')?.value || 'ON';
    const maritalStatus = $('#fl-marital-status')?.value || 'married';
    const cohabitationYears = Number($('#fl-cohabitation-years')?.value || 8.0);
    const numberOfChildren = Number($('#fl-children-count')?.value || 2);
    const parentingArrangement = $('#fl-parenting-type')?.value || 'primary_custody';
    const payerGrossAnnualIncomeCad = Number($('#fl-payer-income')?.value || 95000);
    const recipientGrossAnnualIncomeCad = Number($('#fl-recipient-income')?.value || 45000);

    const payerValuationDateAssetsCad = Number($('#fl-payer-assets')?.value || 350000);
    const payerDebtsValuationDateCad = Number($('#fl-payer-debts')?.value || 40000);
    const payerDateOfMarriageDeductionsCad = Number($('#fl-payer-marriage-ded')?.value || 50000);

    const recipientValuationDateAssetsCad = Number($('#fl-recipient-assets')?.value || 120000);
    const recipientDebtsValuationDateCad = Number($('#fl-recipient-debts')?.value || 15000);
    const recipientDateOfMarriageDeductionsCad = Number($('#fl-recipient-marriage-ded')?.value || 20000);

    const hasForeignWorldwideAssets = $('#fl-foreign-assets')?.checked || false;
    const hasActiveSponsorshipUndertaking = $('#fl-sponsorship-undertaking')?.checked || false;

    try {
      const res = await fetch('/v1/tools/family-law', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          maritalStatus,
          cohabitationYears,
          numberOfChildren,
          parentingArrangement,
          payerGrossAnnualIncomeCad,
          recipientGrossAnnualIncomeCad,
          payerValuationDateAssetsCad,
          payerDebtsValuationDateCad,
          payerDateOfMarriageDeductionsCad,
          recipientValuationDateAssetsCad,
          recipientDebtsValuationDateCad,
          recipientDateOfMarriageDeductionsCad,
          hasForeignWorldwideAssets,
          hasActiveSponsorshipUndertaking
        })
      });
      if (!res.ok) throw new Error('Failed to audit family law profile');
      const data = await res.json();
      renderFamilyLawAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate family law profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupSocialAssistance() {
  const form = $('#social-assistance-form');
  const resultsContainer = $('#social-assistance-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    resultsContainer.innerHTML = '<p class="muted">Auditing social assistance eligibility, liquid asset limits, and clawback formulas...</p>';
    const program = $('#sa-program')?.value || 'ontario_works';
    const immigrationStatus = $('#sa-immigration-status')?.value || 'permanent_resident';
    const familyComposition = $('#sa-family-composition')?.value || 'single';
    const dependentChildrenCount = Number($('#sa-children-count')?.value || 0);
    const liquidAssetsCad = Number($('#sa-liquid-assets')?.value || 4500);
    const primaryVehicleValueCad = Number($('#sa-vehicle-value')?.value || 8000);
    const grossMonthlyEmploymentIncomeCad = Number($('#sa-earned-income')?.value || 0);
    const monthlyShelterCostCad = Number($('#sa-shelter-cost')?.value || 650);

    const ownsPrimaryResidence = $('#sa-owns-home')?.checked || false;
    const isSponsoredImmigrant = $('#sa-sponsored-immigrant')?.checked || false;
    const sponsorshipYearsRemaining = Number($('#sa-sponsor-years')?.value || 0);

    try {
      const res = await fetch('/v1/tools/social-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program,
          immigrationStatus,
          familyComposition,
          dependentChildrenCount,
          liquidAssetsCad,
          primaryVehicleValueCad,
          ownsPrimaryResidence,
          grossMonthlyEmploymentIncomeCad,
          monthlyShelterCostCad,
          isSponsoredImmigrant,
          sponsorshipYearsRemaining
        })
      });
      if (!res.ok) throw new Error('Failed to audit social assistance profile');
      const data = await res.json();
      renderSocialAssistanceAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate social assistance profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupTenancyRepairs() {
  const form = document.querySelector('#tenancy-repairs-form');
  const resultsContainer = document.querySelector('#tenancy-repairs-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#rep-province')?.value || 'ON';
    const monthlyRentCad = Number(document.querySelector('#rep-monthly-rent')?.value) || 2400;
    const daysUnresolved = Number(document.querySelector('#rep-days')?.value) || 30;
    const outOfPocketExpensesCad = Number(document.querySelector('#rep-expenses')?.value) || 0;
    const hasWithheldRent = document.querySelector('#rep-withheld-rent')?.value === 'true';
    const withheldAmountCad = Number(document.querySelector('#rep-withheld-amount')?.value) || 0;
    const hasNotifiedLandlordInWriting = document.querySelector('#rep-written-notice')?.value !== 'false';
    const hasCalledCityInspector = document.querySelector('#rep-city-inspector')?.value === 'true';
    const tenantName = document.querySelector('#rep-tenant-name')?.value || 'Tenant';
    const landlordName = document.querySelector('#rep-landlord-name')?.value || 'Apex Properties Ltd.';
    const rentalAddress = document.querySelector('#rep-rental-address')?.value || '100 King St W, Toronto, ON';

    const issues = [];
    if (document.querySelector('#rep-issue-heat')?.checked) issues.push('no_heat_winter');
    if (document.querySelector('#rep-issue-hot-water')?.checked) issues.push('no_hot_water');
    if (document.querySelector('#rep-issue-vital-cut')?.checked) issues.push('vital_service_shutoff');
    if (document.querySelector('#rep-issue-pests')?.checked) issues.push('severe_pest_infestation');
    if (document.querySelector('#rep-issue-water-leak')?.checked) issues.push('water_leak_mold');
    if (document.querySelector('#rep-issue-appliances')?.checked) issues.push('broken_appliance_essential');
    if (document.querySelector('#rep-issue-plumbing')?.checked) issues.push('broken_plumbing_fixtures');
    if (document.querySelector('#rep-issue-locks')?.checked) issues.push('broken_locks_security');

    try {
      const res = await fetch('/v1/tools/tenancy-repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          monthlyRentCad,
          daysUnresolved,
          outOfPocketExpensesCad,
          hasWithheldRent,
          withheldAmountCad,
          hasNotifiedLandlordInWriting,
          hasCalledCityInspector,
          tenantName,
          landlordName,
          rentalAddress,
          issues
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate tenancy repairs');
      const data = await res.json();
      renderTenancyRepairsAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate tenancy repairs. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupCommercialLease() {
  const form = document.querySelector('#commercial-lease-form');
  const resultsContainer = document.querySelector('#commercial-lease-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#com-province')?.value || 'ON';
    const baseRentMonthlyCad = Number(document.querySelector('#com-base-rent')?.value) || 3500;
    const additionalRentMonthlyCad = Number(document.querySelector('#com-tmi-rent')?.value) || 1500;
    const squareFootage = Number(document.querySelector('#com-sqft')?.value) || 1200;
    const leaseType = document.querySelector('#com-lease-type')?.value || 'triple_net_nnn';
    const leaseTermYears = Number(document.querySelector('#com-lease-term')?.value) || 5;
    const yearsRemaining = Number(document.querySelector('#com-years-remaining')?.value) || 3.5;
    const hasPersonalGuarantee = document.querySelector('#com-personal-guarantee')?.value === 'true';
    const isRentOverdue = document.querySelector('#com-rent-overdue')?.value === 'true';
    const daysRentOverdue = Number(document.querySelector('#com-days-overdue')?.value) || 0;
    const landlordLockoutThreat = document.querySelector('#com-lockout-threat')?.value === 'true';
    const disputedTmiChargesCad = Number(document.querySelector('#com-disputed-tmi')?.value) || 0;
    const landlordRefusedAssignment = document.querySelector('#com-refused-assignment')?.value === 'true';
    const tenantBusinessName = document.querySelector('#com-business-name')?.value || 'Newcomer Cafe & Bakery Ltd.';
    const landlordName = document.querySelector('#com-landlord-name')?.value || 'Commercial Property Holdings Inc.';
    const premisesAddress = document.querySelector('#com-premises-address')?.value || '450 Queen St W, Unit 102, Toronto, ON';

    try {
      const res = await fetch('/v1/tools/commercial-lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          baseRentMonthlyCad,
          additionalRentMonthlyCad,
          squareFootage,
          leaseType,
          leaseTermYears,
          yearsRemaining,
          hasPersonalGuarantee,
          isRentOverdue,
          daysRentOverdue,
          landlordLockoutThreat,
          disputedTmiChargesCad,
          landlordRefusedAssignment,
          tenantBusinessName,
          landlordName,
          premisesAddress
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate commercial lease');
      const data = await res.json();
      renderCommercialLeaseAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate commercial lease profile. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupEmploymentReference() {
  const form = document.querySelector('#employment-reference-form');
  const resultsContainer = document.querySelector('#employment-reference-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const program = document.querySelector('#ref-program')?.value || 'express_entry_fsw';
    const nocCode = document.querySelector('#ref-noc-code')?.value || '21231';
    const nocTitle = document.querySelector('#ref-noc-title')?.value || 'Software Engineer and Designer';
    const isFullTime = document.querySelector('#ref-fulltime')?.value === 'true';
    const hoursPerWeek = Number(document.querySelector('#ref-hours')?.value) || 40;
    const supervisorContactInfoType = document.querySelector('#ref-email-type')?.value || 'corporate_domain_email';
    const paymentMethod = document.querySelector('#ref-pay-method')?.value || 'bank_direct_deposit';
    const isFamilyOwnedBusiness = document.querySelector('#ref-family-business')?.value === 'true';
    const applicantName = document.querySelector('#ref-applicant-name')?.value || 'Applicant';
    const employerName = document.querySelector('#ref-employer-name')?.value || 'Tech Innovations Ltd.';
    const roleTitle = document.querySelector('#ref-role-title')?.value || 'Senior Software Developer';
    const employmentPeriod = document.querySelector('#ref-period')?.value || 'January 15, 2023 to Present';

    const hasLetterhead = document.querySelector('#ref-has-letterhead')?.checked ?? true;
    const hasExactStartEndDates = document.querySelector('#ref-has-exact-dates')?.checked ?? true;
    const hasJobTitle = document.querySelector('#ref-has-job-title')?.checked ?? true;
    const hasAnnualSalaryAndBenefits = document.querySelector('#ref-has-salary')?.checked ?? true;
    const hasDetailedDutiesList = document.querySelector('#ref-has-duties')?.checked ?? true;
    const dutiesSubstantiallyMatchLeadStatement = document.querySelector('#ref-matches-lead')?.checked ?? true;
    const hasSupervisorSignature = document.querySelector('#ref-signed')?.checked ?? true;
    const hasPayStubs = document.querySelector('#ref-has-paystubs')?.checked ?? true;
    const hasTaxDocuments = document.querySelector('#ref-has-taxdocs')?.checked ?? true;
    const hasBankStatements = document.querySelector('#ref-has-bank')?.checked ?? true;
    const dutiesCopiedFromNocWordForWord = document.querySelector('#ref-copied-noc')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/employment-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program,
          nocCode,
          nocTitle,
          isFullTime,
          hoursPerWeek,
          hasLetterhead,
          hasExactStartEndDates,
          hasJobTitle,
          hasAnnualSalaryAndBenefits,
          hasDetailedDutiesList,
          dutiesCopiedFromNocWordForWord,
          dutiesSubstantiallyMatchLeadStatement,
          hasSupervisorSignature,
          supervisorContactInfoType,
          paymentMethod,
          hasPayStubs,
          hasTaxDocuments,
          hasBankStatements,
          isFamilyOwnedBusiness,
          applicantName,
          employerName,
          roleTitle,
          employmentPeriod
        })
      });
      if (!res.ok) throw new Error('Failed to audit employment reference letter');
      const data = await res.json();
      renderEmploymentReferenceAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate employment reference letter. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupHighCostCredit() {
  const form = document.querySelector('#high-cost-credit-form');
  const resultsContainer = document.querySelector('#high-cost-credit-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#hcc-province')?.value || 'ON';
    const loanType = document.querySelector('#hcc-loan-type')?.value || 'payday_loan';
    const principalBorrowedCad = Number(document.querySelector('#hcc-principal')?.value) || 1000;
    const termDays = Number(document.querySelector('#hcc-term-days')?.value) || 14;
    const statedAprPercent = Number(document.querySelector('#hcc-stated-apr')?.value) || 46.5;
    const totalFeesChargedCad = Number(document.querySelector('#hcc-fees-charged')?.value) || 180;
    const netMonthlyIncomeCad = Number(document.querySelector('#hcc-net-income')?.value) || 2400;
    const daysSinceAgreement = Number(document.querySelector('#hcc-days-since')?.value) || 1;
    const borrowerName = document.querySelector('#hcc-borrower-name')?.value || 'Consumer';
    const lenderName = document.querySelector('#hcc-lender-name')?.value || 'Quick Cash Financial Ltd.';

    const isRolloverLoan = document.querySelector('#hcc-is-rollover')?.checked ?? false;
    const lenderAttemptedWageAssignment = document.querySelector('#hcc-wage-assignment')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/high-cost-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          loanType,
          principalBorrowedCad,
          termDays,
          statedAprPercent,
          totalFeesChargedCad,
          netMonthlyIncomeCad,
          isRolloverLoan,
          lenderAttemptedWageAssignment,
          daysSinceAgreement,
          borrowerName,
          lenderName
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate credit agreement');
      const data = await res.json();
      renderHighCostCreditAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate credit agreement. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupPgwpNavigator() {
  const form = document.querySelector('#pgwp-form');
  const resultsContainer = document.querySelector('#pgwp-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const credentialLevel = document.querySelector('#pgwp-credential')?.value || 'college_diploma';
    const programLengthMonths = Number(document.querySelector('#pgwp-length')?.value) || 24;
    const studyPermitApplicationDate = document.querySelector('#pgwp-permit-date')?.value || '2024-11-15';
    const fieldOfStudyCategory = document.querySelector('#pgwp-field')?.value || 'stem';
    const languageTestType = document.querySelector('#pgwp-test-type')?.value || 'celpip_general';
    const clbLevel = Number(document.querySelector('#pgwp-clb')?.value) || 6;
    const testDate = document.querySelector('#pgwp-test-date')?.value || '2025-06-01';
    const completionDate = document.querySelector('#pgwp-comp-date')?.value || '2026-08-01';
    const distanceLearningPercent = Number(document.querySelector('#pgwp-distance')?.value) || 10;

    const isDliEligible = document.querySelector('#pgwp-dli-eligible')?.checked ?? true;
    const isPublicOrLicensingCurriculum = document.querySelector('#pgwp-public-curriculum')?.checked ?? true;
    const hadValidStudyPermitAtCompletion = document.querySelector('#pgwp-valid-permit')?.checked ?? true;
    const maintainedFullTimeStatus = document.querySelector('#pgwp-full-time')?.checked ?? true;
    const heldPreviousPgwp = document.querySelector('#pgwp-prev-held')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/pgwp-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialLevel,
          programLengthMonths,
          studyPermitApplicationDate,
          fieldOfStudyCategory,
          languageTestType,
          clbLevel,
          testDate,
          completionDate,
          distanceLearningPercent,
          isDliEligible,
          isPublicOrLicensingCurriculum,
          hadValidStudyPermitAtCompletion,
          maintainedFullTimeStatus,
          heldPreviousPgwp
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate PGWP eligibility');
      const data = await res.json();
      renderPgwpAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate PGWP eligibility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupTfwCompliance() {
  const form = document.querySelector('#tfw-compliance-form');
  const resultsContainer = document.querySelector('#tfw-compliance-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const stream = document.querySelector('#tfw-stream')?.value || 'low_wage';
    const lmiaStipulatedHourlyWageCad = Number(document.querySelector('#tfw-lmia-wage')?.value) || 24.50;
    const actualPaidHourlyWageCad = Number(document.querySelector('#tfw-actual-wage')?.value) || 18.00;
    const weeklyHoursContracted = Number(document.querySelector('#tfw-contract-hours')?.value) || 40;
    const actualWeeklyHoursOffered = Number(document.querySelector('#tfw-actual-hours')?.value) || 30;
    const weeksWorked = Number(document.querySelector('#tfw-weeks-worked')?.value) || 16;
    const prohibitedDeductionsChargedCad = Number(document.querySelector('#tfw-deductions')?.value) || 2500;
    const recruiterFeeChargedCad = Number(document.querySelector('#tfw-recruiter-fees')?.value) || 5000;

    const employerRetainedPassportOrPermit = document.querySelector('#tfw-retained-passport')?.checked ?? false;
    const assignedDifferentOccupation = document.querySelector('#tfw-diff-occupation')?.checked ?? false;
    const unsafeHousingOrOvercharge = document.querySelector('#tfw-bad-housing')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/tfw-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream,
          lmiaStipulatedHourlyWageCad,
          actualPaidHourlyWageCad,
          weeklyHoursContracted,
          actualWeeklyHoursOffered,
          weeksWorked,
          prohibitedDeductionsChargedCad,
          recruiterFeeChargedCad,
          employerRetainedPassportOrPermit,
          assignedDifferentOccupation,
          unsafeHousingOrOvercharge
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate TFW compliance');
      const data = await res.json();
      renderTfwComplianceAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate TFW compliance. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupCrossBorderTax() {
  const form = document.querySelector('#cross-border-tax-form');
  const resultsContainer = document.querySelector('#cross-border-tax-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const taxYear = Number(document.querySelector('#cb-tax-year')?.value) || 2026;
    const foreignPropertyCostAmountCad = Number(document.querySelector('#cb-foreign-cost')?.value) || 125000;
    const peakForeignAccountsUsd = Number(document.querySelector('#cb-peak-usd')?.value) || 15000;
    const yearEndForeignAccountsUsd = Number(document.querySelector('#cb-yearend-usd')?.value) || 12000;
    const usFilingStatus = document.querySelector('#cb-us-status')?.value || 'single';
    const daysLateT1135 = Number(document.querySelector('#cb-days-late')?.value) || 0;

    const isFirstYearCanadianResident = document.querySelector('#cb-first-year')?.checked ?? false;
    const isUsPerson = document.querySelector('#cb-is-us-person')?.checked ?? false;
    const holdsCanadianMutualFundsOrEtfs = document.querySelector('#cb-has-pfic')?.checked ?? false;
    const hasCanadianTfsa = document.querySelector('#cb-has-tfsa')?.checked ?? false;
    const hasCanadianResp = document.querySelector('#cb-has-resp')?.checked ?? false;
    const hasCanadianRrsp = document.querySelector('#cb-has-rrsp')?.checked ?? true;
    const hasForeignRentalProperty = document.querySelector('#cb-has-rental')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/cross-border-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxYear,
          foreignPropertyCostAmountCad,
          peakForeignAccountsUsd,
          yearEndForeignAccountsUsd,
          usFilingStatus,
          daysLateT1135,
          isFirstYearCanadianResident,
          isUsPerson,
          holdsCanadianMutualFundsOrEtfs,
          hasCanadianTfsa,
          hasCanadianResp,
          hasCanadianRrsp,
          hasForeignRentalProperty
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate cross-border tax');
      const data = await res.json();
      renderCrossBorderTaxAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate cross-border tax. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupWorkplaceSafety() {
  const form = document.querySelector('#workplace-safety-form');
  const resultsContainer = document.querySelector('#workplace-safety-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#ws-province')?.value || 'ON';
    const hazardType = document.querySelector('#ws-hazard')?.value || 'physical_fall_collapse';
    const refusalStage = document.querySelector('#ws-refusal-stage')?.value || 'stage_1_internal';
    const netAverageMonthlyEarningsCad = Number(document.querySelector('#ws-net-earnings')?.value) || 3200;
    const injuryDate = document.querySelector('#ws-injury-date')?.value || '2026-08-01';

    const hasUnsafeWorkConditions = document.querySelector('#ws-unsafe-conditions')?.checked ?? true;
    const isWorkplaceInjury = document.querySelector('#ws-is-injury')?.checked ?? false;
    const employerDisciplinedOrThreatened = document.querySelector('#ws-employer-reprisal')?.checked ?? false;
    const immigrationStatusThreatened = document.querySelector('#ws-status-threat')?.checked ?? false;
    const employerFiledInjuryReport = document.querySelector('#ws-employer-filed-report')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/workplace-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          hazardType,
          refusalStage,
          netAverageMonthlyEarningsCad,
          injuryDate,
          hasUnsafeWorkConditions,
          isWorkplaceInjury,
          employerDisciplinedOrThreatened,
          immigrationStatusThreatened,
          employerFiledInjuryReport
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate workplace safety');
      const data = await res.json();
      renderWorkplaceSafetyAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate workplace safety. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupHealthcarePortability() {
  const form = document.querySelector('#healthcare-portability-form');
  const resultsContainer = document.querySelector('#healthcare-portability-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const targetProvince = document.querySelector('#hp-target-province')?.value || 'ON';
    const originType = document.querySelector('#hp-origin-type')?.value || 'outside_canada';
    const originProvince = document.querySelector('#hp-origin-province')?.value || null;
    const immigrationStatus = document.querySelector('#hp-status')?.value || 'closed_work_permit';
    const arrivalDate = document.querySelector('#hp-arrival-date')?.value || '2026-09-15';
    const workPermitDurationMonths = Number(document.querySelector('#hp-permit-months')?.value) || 12;

    const hasFullTimeEmployerJobLetter6Months = document.querySelector('#hp-job-letter')?.checked ?? true;
    const isRefugeeClaimantWithIfhpCertificate = document.querySelector('#hp-refugee-ifhp')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/healthcare-portability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetProvince,
          originType,
          originProvince,
          immigrationStatus,
          arrivalDate,
          workPermitDurationMonths,
          hasFullTimeEmployerJobLetter6Months,
          isRefugeeClaimantWithIfhpCertificate
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate healthcare portability');
      const data = await res.json();
      renderHealthcarePortabilityAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate healthcare portability. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupRealEstateAssignment() {
  const form = document.querySelector('#real-estate-assignment-form');
  const resultsContainer = document.querySelector('#real-estate-assignment-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#rea-province')?.value || 'ON';
    const originalPurchasePriceCad = Number(document.querySelector('#rea-original-price')?.value) || 600000;
    const assignmentSalePriceCad = Number(document.querySelector('#rea-assignment-price')?.value) || 720000;
    const depositPaidToBuilderCad = Number(document.querySelector('#rea-deposit-paid')?.value) || 120000;
    const agreementDate = document.querySelector('#rea-agreement-date')?.value || '2025-11-01';
    const assignmentDate = document.querySelector('#rea-assignment-date')?.value || '2026-06-01';
    const builderConsentFeeCad = Number(document.querySelector('#rea-builder-fee')?.value) || 5000;
    const realtorCommissionCad = Number(document.querySelector('#rea-realtor-commission')?.value) || 15000;
    const legalFeesCad = Number(document.querySelector('#rea-legal-fees')?.value) || 2500;
    const marginalTaxRatePercent = Number(document.querySelector('#rea-tax-rate')?.value) || 43.0;
    const lifeEventCategory = document.querySelector('#rea-life-event')?.value || null;
    const relocationDistanceKm = Number(document.querySelector('#rea-relocation-dist')?.value) || 0;
    const closingDelayedDays = Number(document.querySelector('#rea-delay-days')?.value) || 0;
    const isTarionEnrolled = document.querySelector('#rea-tarion-enrolled')?.checked ?? true;
    const hasPrescribedLifeEvent = document.querySelector('#rea-has-life-event')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/real-estate-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          originalPurchasePriceCad,
          assignmentSalePriceCad,
          depositPaidToBuilderCad,
          agreementDate,
          assignmentDate,
          builderConsentFeeCad,
          realtorCommissionCad,
          legalFeesCad,
          marginalTaxRatePercent,
          lifeEventCategory,
          relocationDistanceKm,
          closingDelayedDays,
          isTarionEnrolled,
          hasPrescribedLifeEvent
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate real estate assignment');
      const data = await res.json();
      renderRealEstateAssignmentAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate real estate assignment. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupOasGis() {
  const form = document.querySelector('#oas-gis-form');
  const resultsContainer = document.querySelector('#oas-gis-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const ageYears = Number(document.querySelector('#oas-age')?.value) || 67;
    const yearsResidedInCanadaAfter18 = Number(document.querySelector('#oas-residence-years')?.value) || 12;
    const countryOfOrigin = document.querySelector('#oas-country-origin')?.value || 'OTHER';
    const yearsContributedToOriginSocialSecurity = Number(document.querySelector('#oas-foreign-years')?.value) || 0;
    const annualNetWorldIncomeCad = Number(document.querySelector('#oas-world-income')?.value) || 18000;
    const sponsorshipYearsRemaining = Number(document.querySelector('#oas-sponsor-years')?.value) || 0;
    const isCanadianCitizenOrLegalResident = document.querySelector('#oas-legal-status')?.checked ?? true;
    const livesInCanada = document.querySelector('#oas-inland')?.checked ?? true;
    const isUnderFamilyClassSponsorship = document.querySelector('#oas-sponsored')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/oas-gis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageYears,
          yearsResidedInCanadaAfter18,
          countryOfOrigin,
          yearsContributedToOriginSocialSecurity,
          annualNetWorldIncomeCad,
          sponsorshipYearsRemaining,
          isCanadianCitizenOrLegalResident,
          livesInCanada,
          isUnderFamilyClassSponsorship
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate OAS/GIS');
      const data = await res.json();
      renderOasGisAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate OAS/GIS. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupFranchiseDisclosure() {
  const form = document.querySelector('#franchise-disclosure-form');
  const resultsContainer = document.querySelector('#franchise-disclosure-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#fd-province')?.value || 'ON';
    const agreementSignedDate = document.querySelector('#fd-signed-date')?.value || '2025-10-01';
    const fddDeliveredDate = document.querySelector('#fd-delivered-date')?.value || null;
    const initialFranchiseFeePaidCad = Number(document.querySelector('#fd-initial-fee')?.value) || 45000;
    const equipmentAndBuildoutCostCad = Number(document.querySelector('#fd-equipment-cost')?.value) || 180000;
    const inventoryPurchasedAtCostCad = Number(document.querySelector('#fd-inventory-cost')?.value) || 25000;
    const cumulativeOperatingLossesCad = Number(document.querySelector('#fd-operating-losses')?.value) || 55000;
    const franchiseeName = document.querySelector('#fd-franchisee-name')?.value || 'Franchisee';
    const franchisorName = document.querySelector('#fd-franchisor-name')?.value || 'Franchisor';

    const wasFddDeliveredAsSingleDocument = document.querySelector('#fd-single-doc')?.checked ?? true;
    const hasAuditedFinancialStatements = document.querySelector('#fd-audited-fin')?.checked ?? true;
    const hasSignedFranchisorCertificate = document.querySelector('#fd-signed-cert')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/franchise-disclosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          agreementSignedDate,
          fddDeliveredDate,
          initialFranchiseFeePaidCad,
          equipmentAndBuildoutCostCad,
          inventoryPurchasedAtCostCad,
          cumulativeOperatingLossesCad,
          franchiseeName,
          franchisorName,
          wasFddDeliveredAsSingleDocument,
          hasAuditedFinancialStatements,
          hasSignedFranchisorCertificate
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate franchise disclosure');
      const data = await res.json();
      renderFranchiseDisclosureAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate franchise disclosure. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupSowpNavigator() {
  const form = document.querySelector('#sowp-form');
  const resultsContainer = document.querySelector('#sowp-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const sponsorType = document.querySelector('#sowp-sponsor-type')?.value || 'international_student';
    const studentProgramLevel = document.querySelector('#sowp-program-level')?.value || 'masters';
    const workerNocTeer = Number(document.querySelector('#sowp-worker-teer')?.value) || 1;
    const workerPermitDurationMonths = Number(document.querySelector('#sowp-permit-months')?.value) || 12;
    const relationshipType = document.querySelector('#sowp-relationship-type')?.value || 'married';
    const monthsCohabiting = Number(document.querySelector('#sowp-cohabiting-months')?.value) || 18;

    const workerHasQualifyingJobOfferOrPaystubs = document.querySelector('#sowp-employed')?.checked ?? true;
    const hasJointFinancialEvidence = document.querySelector('#sowp-joint-evidence')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/sowp-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorType,
          studentProgramLevel,
          workerNocTeer,
          workerPermitDurationMonths,
          relationshipType,
          monthsCohabiting,
          workerHasQualifyingJobOfferOrPaystubs,
          hasJointFinancialEvidence
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate SOWP');
      const data = await res.json();
      renderSowpAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate SOWP eligibility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupCriminalRehab() {
  const form = document.querySelector('#criminal-rehab-form');
  const resultsContainer = document.querySelector('#criminal-rehab-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const offenseType = document.querySelector('#cr-offense-type')?.value || 'impaired_driving_dui';
    const sentenceCompletionDate = document.querySelector('#cr-completion-date')?.value || '2017-06-01';
    const foreignCountry = document.querySelector('#cr-country')?.value || 'US';
    const convictionCount = Number(document.querySelector('#cr-conviction-count')?.value) || 1;
    const urgentTravelRequired = document.querySelector('#cr-urgent-travel')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/criminal-rehab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offenseType,
          sentenceCompletionDate,
          foreignCountry,
          convictionCount,
          urgentTravelRequired
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate criminal rehabilitation');
      const data = await res.json();
      renderCriminalRehabAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate criminal rehabilitation. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupEiDisqualification() {
  const form = document.querySelector('#ei-disqualification-form');
  const resultsContainer = document.querySelector('#ei-disqualification-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const separationType = document.querySelector('#ei-separation-type')?.value || 'voluntary_quit';
    const justCause = document.querySelector('#ei-just-cause')?.value;
    const justCauseReason = justCause !== 'none' ? justCause : null;
    const normalWeeklyGrossEarningsCad = Number(document.querySelector('#ei-weekly-earnings')?.value) || 1200;
    const insurableHoursAccumulated = Number(document.querySelector('#ei-insurable-hours')?.value) || 720;
    const severancePayReceivedCad = Number(document.querySelector('#ei-severance-pay')?.value) || 0;
    const payInLieuOfNoticeCad = Number(document.querySelector('#ei-notice-pay')?.value) || 0;
    const vacationPayPaidOutCad = Number(document.querySelector('#ei-vacation-pay')?.value) || 0;
    const isSpecial = document.querySelector('#ei-special-benefits')?.value === 'true';
    const allegedMisconductType = document.querySelector('#ei-misconduct-type')?.value || 'incompetence_performance';
    const triedReasonableAlternatives = document.querySelector('#ei-tried-alternatives')?.checked ?? true;
    const employerAllegedMisconduct = document.querySelector('#ei-alleged-misconduct')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/ei-disqualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          separationType,
          justCauseReason,
          triedReasonableAlternatives,
          employerAllegedMisconduct,
          allegedMisconductType,
          normalWeeklyGrossEarningsCad,
          insurableHoursAccumulated,
          severancePayReceivedCad,
          payInLieuOfNoticeCad,
          vacationPayPaidOutCad,
          isClaimingSpecialBenefits: isSpecial
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate EI disqualification');
      const data = await res.json();
      renderEiDisqualificationAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate EI disqualification. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupRuralRenewal() {
  const form = document.querySelector('#rural-renewal-form');
  const resultsContainer = document.querySelector('#rural-renewal-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const streamType = document.querySelector('#rr-stream-type')?.value || 'rural_renewal';
    const selectedCommunity = document.querySelector('#rr-community')?.value || 'brooks';
    const jobNocTeer = Number(document.querySelector('#rr-noc-teer')?.value) || 2;
    const clbLevel = Number(document.querySelector('#rr-clb-level')?.value) || 5;
    const monthsWorkExperiencePast18Months = Number(document.querySelector('#rr-work-experience')?.value) || 14;
    const familySize = Number(document.querySelector('#rr-family-size')?.value) || 2;
    const liquidSettlementFundsCad = Number(document.querySelector('#rr-settlement-funds')?.value) || 20000;
    const hasCommunityEndorsementLetter = document.querySelector('#rr-endorsement')?.checked ?? true;
    const hasGenuineJobOffer = document.querySelector('#rr-job-offer')?.checked ?? true;
    const hasHighSchoolOrEca = document.querySelector('#rr-education')?.checked ?? true;
    const hasCompletedCommunityExploratoryVisit = document.querySelector('#rr-exploratory-visit')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/rural-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamType,
          selectedCommunity,
          jobNocTeer,
          clbLevel,
          monthsWorkExperiencePast18Months,
          familySize,
          liquidSettlementFundsCad,
          hasCommunityEndorsementLetter,
          hasGenuineJobOffer,
          hasHighSchoolOrEca,
          hasCompletedCommunityExploratoryVisit
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Rural Renewal');
      const data = await res.json();
      renderRuralRenewalAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Rural Renewal. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupSpeculationTax() {
  const form = document.querySelector('#speculation-tax-form');
  const resultsContainer = document.querySelector('#speculation-tax-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#st-province')?.value || 'BC';
    const propertyAssessedValueCad = Number(document.querySelector('#st-property-value')?.value) || 1200000;
    const purchasePriceCad = propertyAssessedValueCad;
    const isCanadianCitizenOrPr = document.querySelector('#st-status')?.value === 'citizen_pr';
    const rentalDaysInYear = Number(document.querySelector('#st-rental-days')?.value) || 0;
    const purchaseClosingDate = document.querySelector('#st-closing-date')?.value || '2026-01-15';
    const prDateVal = document.querySelector('#st-pr-date')?.value;
    const prStatusAcquiredDate = prDateVal ? prDateVal : null;
    const rebateApplicationDate = document.querySelector('#st-claim-date')?.value || '2026-04-01';
    const isPrincipalResidenceOccupied6Months = document.querySelector('#st-primary-home')?.checked ?? true;
    const isSatelliteFamily = document.querySelector('#st-satellite-family')?.checked ?? false;
    const isYearOfPurchase = document.querySelector('#st-year-purchased')?.checked ?? false;
    const occupiedAsPrincipalResidenceWithin60Days = document.querySelector('#st-occupied-60')?.checked ?? true;
    const heldSolelyWithSpouse = document.querySelector('#st-held-solely')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/speculation-tax-rebate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          propertyAssessedValueCad,
          purchasePriceCad,
          isCanadianCitizenOrPr,
          rentalDaysInYear,
          purchaseClosingDate,
          prStatusAcquiredDate,
          rebateApplicationDate,
          isPrincipalResidenceOccupied6Months,
          isSatelliteFamily,
          isYearOfPurchase,
          occupiedAsPrincipalResidenceWithin60Days,
          heldSolelyWithSpouse
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Speculation Tax');
      const data = await res.json();
      renderSpeculationTaxAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Speculation Tax. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupChildWelfare() {
  const form = document.querySelector('#child-welfare-form');
  const resultsContainer = document.querySelector('#child-welfare-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const pathway = document.querySelector('#cw-pathway')?.value || 'vysa_youth_services';
    const youthAgeYears = Number(document.querySelector('#cw-age')?.value) || 16;
    const kinshipRelationship = document.querySelector('#cw-kinship-relation')?.value || 'grandparent';
    const adoptionCountry = document.querySelector('#cw-adoption-country')?.value || 'India';
    const hasSafeExtendedFamily = document.querySelector('#cw-kinship-safe')?.checked ?? true;
    const isCanadianCitizenParentForAdoption = document.querySelector('#cw-citizen-parent')?.checked ?? true;
    const isHagueConventionCountry = document.querySelector('#cw-hague-convention')?.checked ?? true;
    const adoptionLegallyFinalizedAbroad = document.querySelector('#cw-adoption-finalized')?.checked ?? true;
    const preAdoptionTiesSevered = document.querySelector('#cw-pre-adoption-severed')?.checked ?? true;

    try {
      const res = await fetch('/v1/tools/child-welfare-guardianship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathway,
          youthAgeYears,
          kinshipRelationship,
          adoptionCountry,
          hasSafeExtendedFamily,
          isCanadianCitizenParentForAdoption,
          isHagueConventionCountry,
          adoptionLegallyFinalizedAbroad,
          preAdoptionTiesSevered
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Child Welfare');
      const data = await res.json();
      renderChildWelfareAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Child Welfare. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupExcessiveDemand() {
  const form = document.querySelector('#excessive-demand-form');
  const resultsContainer = document.querySelector('#excessive-demand-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const immigrationStream = document.querySelector('#ed-stream')?.value || 'economic_express_entry';
    const diagnosedCondition = document.querySelector('#ed-condition')?.value || 'Multiple Sclerosis';
    const estimatedAnnualMedicationCostCad = Number(document.querySelector('#ed-meds-cost')?.value) || 30000;
    const estimatedAnnualHospitalCostCad = Number(document.querySelector('#ed-hospital-cost')?.value) || 2000;
    const estimatedAnnualSocialServicesCostCad = Number(document.querySelector('#ed-social-cost')?.value) || 1000;
    const privateInsuranceDrugLimitAnnualCad = Number(document.querySelector('#ed-insurance-limit')?.value) || 25000;
    const liquidFundsAvailableForCareCad = Number(document.querySelector('#ed-liquid-funds')?.value) || 60000;
    const pflDateVal = document.querySelector('#ed-pfl-date')?.value;
    const pflReceivedDate = pflDateVal ? pflDateVal : null;
    const hasPrivateInsuranceDrugCoverage = document.querySelector('#ed-has-insurance')?.checked ?? true;
    const receivedProceduralFairnessLetter = document.querySelector('#ed-received-pfl')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/excessive-demand-mitigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immigrationStream,
          diagnosedCondition,
          estimatedAnnualMedicationCostCad,
          estimatedAnnualHospitalCostCad,
          estimatedAnnualSocialServicesCostCad,
          privateInsuranceDrugLimitAnnualCad,
          liquidFundsAvailableForCareCad,
          hasPrivateInsuranceDrugCoverage,
          receivedProceduralFairnessLetter,
          pflReceivedDate
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Excessive Demand');
      const data = await res.json();
      renderExcessiveDemandAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Excessive Demand. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupFrancophoneMobility() {
  const form = document.querySelector('#francophone-mobility-form');
  const resultsContainer = document.querySelector('#francophone-mobility-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#fm-province')?.value || 'ON';
    const frenchTestType = document.querySelector('#fm-test-type')?.value || 'tef_canada';
    const nclcSpeaking = Number(document.querySelector('#fm-speaking')?.value) || 6;
    const nclcListening = Number(document.querySelector('#fm-listening')?.value) || 5;
    const testDate = document.querySelector('#fm-test-date')?.value || '2025-06-01';
    const nocTeer = Number(document.querySelector('#fm-noc-teer')?.value) || 1;
    const nocCode = document.querySelector('#fm-noc-code')?.value || '21232';
    const hasGenuineJobOffer = document.querySelector('#fm-job-offer')?.checked ?? true;
    const employerPaidComplianceFee = document.querySelector('#fm-compliance-fee')?.checked ?? true;
    const isPrimaryAgriculture = document.querySelector('#fm-is-agriculture')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/francophone-mobility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          frenchTestType,
          nclcSpeaking,
          nclcListening,
          testDate,
          nocTeer,
          nocCode,
          hasGenuineJobOffer,
          employerPaidComplianceFee,
          isPrimaryAgriculture
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Francophone Mobility');
      const data = await res.json();
      renderFrancophoneMobilityAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Francophone Mobility. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupDigitalPlatformWorker() {
  const form = document.querySelector('#digital-platform-worker-form');
  const resultsContainer = document.querySelector('#digital-platform-worker-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#dp-province')?.value || 'ON';
    const workerType = document.querySelector('#dp-worker-type')?.value || 'rideshare_driver';
    const engagedHoursInPeriod = Number(document.querySelector('#dp-engaged-hours')?.value) || 40;
    const actualBasePayReceivedCad = Number(document.querySelector('#dp-base-pay')?.value) || 550;
    const tipsReceivedCad = Number(document.querySelector('#dp-tips')?.value) || 120;
    const unauthorizedDeductionsCad = Number(document.querySelector('#dp-deductions')?.value) || 0;
    const noticeDaysGivenBeforeDeplatform = Number(document.querySelector('#dp-notice-days')?.value) || 0;
    const tipsWithheldOrSubsidized = document.querySelector('#dp-tips-withheld')?.checked ?? false;
    const hasDeplatformingAction = document.querySelector('#dp-deplatformed')?.checked ?? false;
    const providedWrittenReason = document.querySelector('#dp-written-reason')?.checked ?? false;
    const foreignArbitrationClauseInvoked = document.querySelector('#dp-foreign-arbitration')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/digital-platform-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          workerType,
          engagedHoursInPeriod,
          actualBasePayReceivedCad,
          tipsReceivedCad,
          unauthorizedDeductionsCad,
          noticeDaysGivenBeforeDeplatform,
          tipsWithheldOrSubsidized,
          hasDeplatformingAction,
          providedWrittenReason,
          foreignArbitrationClauseInvoked
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Digital Platform Worker rights');
      const data = await res.json();
      renderDigitalPlatformWorkerAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Digital Platform Worker rights. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupAtlanticImmigration() {
  const form = document.querySelector('#atlantic-immigration-form');
  const resultsContainer = document.querySelector('#atlantic-immigration-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#aip-province')?.value || 'NS';
    const stream = document.querySelector('#aip-stream')?.value || 'international_graduate';
    const nocTeer = Number(document.querySelector('#aip-noc-teer')?.value) || 1;
    const clbLevel = Number(document.querySelector('#aip-clb-level')?.value) || 5;
    const monthsResidedInAtlanticDuringStudy = Number(document.querySelector('#aip-residence-months')?.value) || 18;
    const hoursWorkExperiencePast5Years = Number(document.querySelector('#aip-work-hours')?.value) || 1560;
    const familySize = Number(document.querySelector('#aip-family-size')?.value) || 1;
    const settlementFundsCad = Number(document.querySelector('#aip-settlement-funds')?.value) || 5000;
    const jobOfferDurationMonths = Number(document.querySelector('#aip-contract-months')?.value) || 24;
    const hasDesignatedEmployerJobOffer = document.querySelector('#aip-designated-employer')?.checked ?? true;
    const isJobOfferFullTimeNonSeasonal = document.querySelector('#aip-full-time')?.checked ?? true;
    const isPermanentJobOffer = document.querySelector('#aip-permanent-offer')?.checked ?? false;
    const hasAtlanticTwoYearCredential = document.querySelector('#aip-atlantic-credential')?.checked ?? true;
    const isCurrentlyWorkingInCanadaOnValidPermit = document.querySelector('#aip-working-in-canada')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/atlantic-immigration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          stream,
          nocTeer,
          clbLevel,
          monthsResidedInAtlanticDuringStudy,
          hoursWorkExperiencePast5Years,
          familySize,
          settlementFundsCad,
          jobOfferDurationMonths,
          hasDesignatedEmployerJobOffer,
          isJobOfferFullTimeNonSeasonal,
          isPermanentJobOffer,
          hasAtlanticTwoYearCredential,
          isCurrentlyWorkingInCanadaOnValidPermit
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Atlantic Immigration');
      const data = await res.json();
      renderAtlanticImmigrationAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Atlantic Immigration. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupChildCareSubsidy() {
  const form = document.querySelector('#childcare-subsidy-form');
  const resultsContainer = document.querySelector('#childcare-subsidy-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const province = document.querySelector('#ccs-province')?.value || 'ON';
    const municipality = document.querySelector('#ccs-municipality')?.value || 'Toronto';
    const adjustedFamilyNetIncomeCad = Number(document.querySelector('#ccs-family-income')?.value) || 35000;
    const childAge = Number(document.querySelector('#ccs-child1-age')?.value) || 3;
    const baselineMonthlyFeePerChildCad = Number(document.querySelector('#ccs-base-fee')?.value) || 1200;
    const immigrationStatus = document.querySelector('#ccs-status')?.value || 'permanent_resident';
    const isEnrolledInCwelccLicensedCentre = document.querySelector('#ccs-cwelcc-centre')?.checked ?? true;
    const hasDisability = document.querySelector('#ccs-child1-disability')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/childcare-subsidy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          municipality,
          adjustedFamilyNetIncomeCad,
          baselineMonthlyFeePerChildCad,
          isEnrolledInCwelccLicensedCentre,
          immigrationStatus,
          children: [{ ageYears: childAge, hasDisability }]
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate Child Care Subsidy');
      const data = await res.json();
      renderChildCareSubsidyAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate Child Care Subsidy. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupBcStrataBylaw() {
  const form = document.querySelector('#bc-strata-bylaw-form');
  const resultsContainer = document.querySelector('#bc-strata-bylaw-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const disputeType = document.querySelector('#strata-dispute-type')?.value || 'rental_restriction';
    const rentalTermMonths = Number(document.querySelector('#strata-rental-months')?.value) || 12;
    const strataAgeMinimum = Number(document.querySelector('#strata-age-minimum')?.value) || 19;
    const fineAmountLeviedCad = Number(document.querySelector('#strata-fine-amount')?.value) || 0;
    const strataPlanNumber = document.querySelector('#strata-plan-number')?.value || 'EPS 1234';
    const unitNumber = document.querySelector('#strata-unit-number')?.value || '304';
    const isLongTermRental = document.querySelector('#strata-long-term')?.checked ?? true;
    const strataDemandedTenantScreening = document.querySelector('#strata-screening')?.checked ?? false;
    const isCertifiedServiceDog = document.querySelector('#strata-service-dog')?.checked ?? false;
    const strataRefusedEvRequest = document.querySelector('#strata-refused-ev')?.checked ?? false;

    try {
      const res = await fetch('/v1/tools/bc-strata-bylaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeType,
          rentalTermMonths,
          strataAgeMinimum,
          fineAmountLeviedCad,
          strataPlanNumber,
          unitNumber,
          isLongTermRental,
          strataDemandedTenantScreening,
          isCertifiedServiceDog,
          strataRefusedEvRequest
        })
      });
      if (!res.ok) throw new Error('Failed to evaluate BC Strata Bylaw defense');
      const data = await res.json();
      renderBcStrataBylawAssessment(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch {
      resultsContainer.innerHTML = '<div class="alert-box error"><p>Failed to evaluate BC Strata Bylaw defense. Please retry.</p></div>';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });

  autoRun(runAudit, form);
}

export function setupAlbertaOpportunityStream() {
  const form = document.querySelector('#alberta-opportunity-stream-form');
  const resultsContainer = document.querySelector('#alberta-opportunity-stream-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const workPermitType = document.querySelector('#aos-permit-type')?.value || 'lmia_based';
    const albertaWorkExperienceMonths = Number(document.querySelector('#aos-ab-months')?.value) || 14;
    const nonAlbertaWorkExperienceMonths = Number(document.querySelector('#aos-other-months')?.value) || 0;
    const teerCategory = Number(document.querySelector('#aos-teer')?.value) || 2;
    const nocCode = document.querySelector('#aos-noc')?.value || '21231';
    const languageClbLevel = Number(document.querySelector('#aos-clb')?.value) || 6;
    const sector = document.querySelector('#aos-sector')?.value || 'general';
    const candidateName = document.querySelector('#aos-candidate-name')?.value || 'AAIP Candidate';
    const hasCanadianHighSchoolOrEca = document.querySelector('#aos-has-eca')?.checked !== false;
    const hasPermanentJobOfferInAlberta = document.querySelector('#aos-job-offer')?.checked !== false;
    const isGraduatedFromAlbertaDli = document.querySelector('#aos-ab-grad')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing Alberta Opportunity Stream eligibility...</div>';

    try {
      const res = await fetch('/v1/tools/alberta-opportunity-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workPermitType,
          albertaWorkExperienceMonths,
          nonAlbertaWorkExperienceMonths,
          teerCategory,
          nocCode,
          languageClbLevel,
          hasCanadianHighSchoolOrEca,
          hasPermanentJobOfferInAlberta,
          sector,
          isGraduatedFromAlbertaDli,
          candidateName
        })
      });
      const data = await res.json();
      renderAlbertaOpportunityStreamResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing AAIP: ${err.message}</div>`;
    }
  });
}

export function setupBcSpeculationTaxDeclaration() {
  const form = document.querySelector('#bc-speculation-tax-declaration-form');
  const resultsContainer = document.querySelector('#bc-speculation-tax-declaration-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const propertyRegion = document.querySelector('#svt-region')?.value || 'Metro Vancouver';
    const assessedPropertyValueCad = Number(document.querySelector('#svt-assessed-value')?.value) || 1250000;
    const ownerCitizenshipStatus = document.querySelector('#svt-status')?.value || 'canadian_citizen_or_pr';
    const propertyUseCategory = document.querySelector('#svt-property-use')?.value || 'principal_residence';
    const monthsOccupiedInYear = Number(document.querySelector('#svt-months-occupied')?.value) || 12;
    const calendarTaxYear = document.querySelector('#svt-tax-year')?.value || '2025';
    const ownerName = document.querySelector('#svt-owner-name')?.value || 'BC Property Owner';
    const isSatelliteFamily = document.querySelector('#svt-is-satellite')?.checked === true;
    const hasArmsLengthTenancyAgreement = document.querySelector('#svt-arms-length')?.checked !== false;
    const hasActiveBuildingPermits = document.querySelector('#svt-active-permits')?.checked === true;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing BC Speculation & Vacancy Tax declaration...</div>';

    try {
      const res = await fetch('/v1/tools/bc-speculation-tax-declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyRegion,
          assessedPropertyValueCad,
          ownerCitizenshipStatus,
          isSatelliteFamily,
          propertyUseCategory,
          monthsOccupiedInYear,
          hasArmsLengthTenancyAgreement,
          hasActiveBuildingPermits,
          ownerName,
          calendarTaxYear
        })
      });
      const data = await res.json();
      renderBcSpeculationTaxDeclarationResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing SVT: ${err.message}</div>`;
    }
  });
}

export function setupPrtdHumanitarian() {
  const form = document.querySelector('#prtd-humanitarian-form');
  const resultsContainer = document.querySelector('#prtd-humanitarian-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const daysPhysicallyInCanadaLast5Years = Number(document.querySelector('#prtd-days-canada')?.value) || 450;
    const reasonForAbsenceCategory = document.querySelector('#prtd-reason-category')?.value || 'care_for_critically_ill_family';
    const yearsResidedInCanadaPriorToAbsence = Number(document.querySelector('#prtd-years-in-canada')?.value) || 4;
    const applicantName = document.querySelector('#prtd-applicant-name')?.value || 'PR Applicant Abroad';
    const hasDocumentaryProofOfCompellingCircumstance = document.querySelector('#prtd-has-proof')?.checked !== false;
    const filedCanadianTaxesConsecutively = document.querySelector('#prtd-filed-taxes')?.checked !== false;
    const ownsResidentialHomeOrAssetsInCanada = document.querySelector('#prtd-has-assets')?.checked !== false;
    const hasMinorCanadianChildrenAffected = document.querySelector('#prtd-has-bioc')?.checked === true;
    const hasCanadianCitizenSpouseInCanada = document.querySelector('#prtd-spouse-in-canada')?.checked === true;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Evaluating H&C grounds and appeal rights...</div>';

    try {
      const res = await fetch('/v1/tools/prtd-humanitarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysPhysicallyInCanadaLast5Years,
          reasonForAbsenceCategory,
          yearsResidedInCanadaPriorToAbsence,
          hasDocumentaryProofOfCompellingCircumstance,
          filedCanadianTaxesConsecutively,
          ownsResidentialHomeOrAssetsInCanada,
          hasMinorCanadianChildrenAffected,
          hasCanadianCitizenSpouseInCanada,
          applicantName
        })
      });
      const data = await res.json();
      renderPrtdHumanitarianResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing H&C: ${err.message}</div>`;
    }
  });
}

export function setupSeveranceReasonableNotice() {
  const form = document.querySelector('#severance-reasonable-notice-form');
  const resultsContainer = document.querySelector('#severance-reasonable-notice-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const yearsOfService = Number(document.querySelector('#sev-service-years')?.value) || 6.5;
    const employeeAgeYears = Number(document.querySelector('#sev-employee-age')?.value) || 48;
    const annualSalaryCad = Number(document.querySelector('#sev-annual-salary')?.value) || 85000;
    const roleSeniority = document.querySelector('#sev-role-seniority')?.value || 'managerial_professional';
    const province = document.querySelector('#sev-province')?.value || 'ON';
    const employeeName = document.querySelector('#sev-employee-name')?.value || 'Terminated Employee';
    const employerPayrollExceeds2_5Million = document.querySelector('#sev-large-payroll')?.checked !== false;
    const hasSignedTerminationClause = document.querySelector('#sev-has-clause')?.checked !== false;
    const terminationClauseViolatesEsa = document.querySelector('#sev-clause-violates-esa')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Calculating severance and common law reasonable notice...</div>';

    try {
      const res = await fetch('/v1/tools/severance-reasonable-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearsOfService,
          employeeAgeYears,
          annualSalaryCad,
          roleSeniority,
          province,
          employerPayrollExceeds2_5Million,
          hasSignedTerminationClause,
          terminationClauseViolatesEsa,
          employeeName
        })
      });
      const data = await res.json();
      renderSeveranceReasonableNoticeResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error calculating severance: ${err.message}</div>`;
    }
  });
}

export function setupManitobaPnpSkilledWorker() {
  const form = document.querySelector('#manitoba-pnp-skilled-worker-form');
  const resultsContainer = document.querySelector('#manitoba-pnp-skilled-worker-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const monthsWorkedInManitoba = Number(document.querySelector('#mpnp-mb-months')?.value) || 8;
    const firstLanguageClb = Number(document.querySelector('#mpnp-clb1')?.value) || 7;
    const secondLanguageClb = Number(document.querySelector('#mpnp-clb2')?.value) || 0;
    const candidateAge = Number(document.querySelector('#mpnp-age')?.value) || 29;
    const totalYearsOfWorkExperience = Number(document.querySelector('#mpnp-total-exp')?.value) || 4;
    const highestEducationLevel = document.querySelector('#mpnp-education')?.value || 'bachelors_degree';
    const candidateName = document.querySelector('#mpnp-candidate-name')?.value || 'MPNP Candidate';
    const isOutOfProvinceGraduate = document.querySelector('#mpnp-oop-grad')?.checked === true;
    const hasPermanentManitobaJobOffer = document.querySelector('#mpnp-job-offer')?.checked !== false;
    const hasCloseFamilySupporterInManitoba = document.querySelector('#mpnp-supporter')?.checked === true;
    const isJobLocatedOutsideWinnipeg = document.querySelector('#mpnp-regional')?.checked !== false;
    const hasPastStudyInAnotherProvince = document.querySelector('#mpnp-past-study')?.checked === true;
    const hasPastWorkInAnotherProvince = document.querySelector('#mpnp-past-work')?.checked === true;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Computing MPNP EOI points and eligibility...</div>';

    try {
      const res = await fetch('/v1/tools/manitoba-pnp-skilled-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthsWorkedInManitoba,
          isOutOfProvinceGraduate,
          hasPermanentManitobaJobOffer,
          firstLanguageClb,
          secondLanguageClb,
          candidateAge,
          totalYearsOfWorkExperience,
          highestEducationLevel,
          hasCloseFamilySupporterInManitoba,
          isJobLocatedOutsideWinnipeg,
          hasPastStudyInAnotherProvince,
          hasPastWorkInAnotherProvince,
          candidateName
        })
      });
      const data = await res.json();
      renderManitobaPnpSkilledWorkerResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error computing MPNP: ${err.message}</div>`;
    }
  });
}

export function setupPrCardRenewal() {
  const form = document.querySelector('#pr-card-renewal-form');
  const resultsContainer = document.querySelector('#pr-card-renewal-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const daysInCanadaLast5Years = Number(document.querySelector('#pr-days-canada')?.value) || 750;
    const daysAbroadAccompanyingCitizenSpouse = Number(document.querySelector('#pr-days-spouse')?.value) || 0;
    const daysAbroadEmployedByCanadianBusiness = Number(document.querySelector('#pr-days-job')?.value) || 0;
    const travelDepartureDaysFromNow = Number(document.querySelector('#pr-travel-days')?.value) || 21;
    const urgentReasonCategory = document.querySelector('#pr-urgent-category')?.value || 'urgent_employment';
    const applicantName = document.querySelector('#pr-applicant-name')?.value || 'Permanent Resident';
    const isCurrentlyInsideCanada = document.querySelector('#pr-inside-canada')?.checked !== false;
    const hasUrgentTravelNeed = document.querySelector('#pr-urgent-need')?.checked !== false;
    const hasProofOfTravel = document.querySelector('#pr-proof-travel')?.checked !== false;
    const hasSupportingUrgentProof = document.querySelector('#pr-supporting-proof')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing PR card renewal compliance...</div>';

    try {
      const res = await fetch('/v1/tools/pr-card-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysInCanadaLast5Years,
          daysAbroadAccompanyingCitizenSpouse,
          daysAbroadEmployedByCanadianBusiness,
          hasUrgentTravelNeed,
          travelDepartureDaysFromNow,
          urgentReasonCategory,
          hasProofOfTravel,
          hasSupportingUrgentProof,
          isCurrentlyInsideCanada,
          applicantName
        })
      });
      const data = await res.json();
      renderPrCardRenewalResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing PR card renewal: ${err.message}</div>`;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });
}

export function setupForeignWorkerTransition() {
  const form = document.querySelector('#foreign-worker-transition-form');
  const resultsContainer = document.querySelector('#foreign-worker-transition-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const wagePerHour = Number(document.querySelector('#fwt-wage')?.value) || 22.0;
    const provincialMedianWage = Number(document.querySelector('#fwt-median-wage')?.value) || 28.39;
    const employerLocationCma = document.querySelector('#fwt-cma')?.value || 'Toronto';
    const cmaUnemploymentRate = Number(document.querySelector('#fwt-unemployment-rate')?.value) || 6.8;
    const sector = document.querySelector('#fwt-sector')?.value || 'general';
    const currentWorkPermitExpiryDays = Number(document.querySelector('#fwt-expiry-days')?.value) || 120;
    const cumulativeCanadianExperienceMonths = Number(document.querySelector('#fwt-cdn-exp')?.value) || 12;
    const hasFrenchProficiencyNclc5 = document.querySelector('#fwt-french-nclc5')?.checked === true;
    const hasProvincialNominationStreamFit = document.querySelector('#fwt-pnp-fit')?.checked !== false;
    const isApplyingDualIntent = document.querySelector('#fwt-dual-intent')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing TFW policy and transition pathways...</div>';

    try {
      const res = await fetch('/v1/tools/foreign-worker-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wagePerHour,
          provincialMedianWage,
          employerLocationCma,
          cmaUnemploymentRate,
          sector,
          currentWorkPermitExpiryDays,
          cumulativeCanadianExperienceMonths,
          hasFrenchProficiencyNclc5,
          hasProvincialNominationStreamFit,
          isApplyingDualIntent
        })
      });
      const data = await res.json();
      renderForeignWorkerTransitionResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing TFW policy: ${err.message}</div>`;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });
}

export function setupChildDisabilityBenefit() {
  const form = document.querySelector('#child-disability-benefit-form');
  const resultsContainer = document.querySelector('#child-disability-benefit-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const childAgeYears = Number(document.querySelector('#cdb-child-age')?.value) || 7;
    const familyNetIncomeCad = Number(document.querySelector('#cdb-family-income')?.value) || 45000;
    const annualRdspContributionCad = Number(document.querySelector('#cdb-rdsp-contribution')?.value) || 1500;
    const unclaimedPastYears = Number(document.querySelector('#cdb-past-years')?.value) || 3;
    const childName = document.querySelector('#cdb-child-name')?.value || 'Eligible Child';
    const parentName = document.querySelector('#cdb-parent-name')?.value || 'Parent Guardian';
    const hasApprovedDtcT2201 = document.querySelector('#cdb-dtc-approved')?.checked !== false;
    const dtcConditionIsProlonged = document.querySelector('#cdb-prolonged')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Calculating Child Disability Benefit & RDSP grants...</div>';

    try {
      const res = await fetch('/v1/tools/child-disability-benefit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childAgeYears,
          familyNetIncomeCad,
          annualRdspContributionCad,
          unclaimedPastYears,
          childName,
          parentName,
          hasApprovedDtcT2201,
          dtcConditionIsProlonged
        })
      });
      const data = await res.json();
      renderChildDisabilityBenefitResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error calculating CDB: ${err.message}</div>`;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });
}

export function setupAlbertaSecurityDeposit() {
  const form = document.querySelector('#alberta-security-deposit-form');
  const resultsContainer = document.querySelector('#alberta-security-deposit-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const monthlyRentCad = Number(document.querySelector('#ab-dep-rent')?.value) || 1800;
    const securityDepositPaidCad = Number(document.querySelector('#ab-dep-paid')?.value) || 1800;
    const additionalNonRefundableFeesCad = Number(document.querySelector('#ab-dep-fees')?.value) || 0;
    const daysSinceTenancyEnded = Number(document.querySelector('#ab-dep-days-vacated')?.value) || 14;
    const deductionsClaimedCad = Number(document.querySelector('#ab-dep-deductions')?.value) || 500;
    const deductionsReason = document.querySelector('#ab-dep-reason')?.value || 'normal wear and tear carpet cleaning';
    const rentalUnitAddress = document.querySelector('#ab-dep-address')?.value || 'Edmonton, AB';
    const landlordConductedMoveInInspection = document.querySelector('#ab-dep-movein-inspection')?.checked === true;
    const tenantReceivedSignedMoveInReport = document.querySelector('#ab-dep-signed-report')?.checked === true;
    const landlordConductedMoveOutInspection = document.querySelector('#ab-dep-moveout-inspection')?.checked === true;
    const tenantProvidedForwardingAddress = document.querySelector('#ab-dep-forwarding-address')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing Alberta tenancy security deposit...</div>';

    try {
      const res = await fetch('/v1/tools/alberta-security-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyRentCad,
          securityDepositPaidCad,
          additionalNonRefundableFeesCad,
          landlordConductedMoveInInspection,
          tenantReceivedSignedMoveInReport,
          landlordConductedMoveOutInspection,
          daysSinceTenancyEnded,
          deductionsClaimedCad,
          deductionsReason,
          tenantProvidedForwardingAddress,
          rentalUnitAddress
        })
      });
      const data = await res.json();
      renderAlbertaSecurityDepositResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing security deposit: ${err.message}</div>`;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });
}

export function setupInternationallyTrainedNurse() {
  const form = document.querySelector('#internationally-trained-nurse-form');
  const resultsContainer = document.querySelector('#internationally-trained-nurse-results');
  if (!form || !resultsContainer) return;

  const runAudit = async () => {
    const countryOfEducation = document.querySelector('#ien-country')?.value || 'Philippines';
    const nursingDesignation = document.querySelector('#ien-designation')?.value || 'rn';
    const yearsOfClinicalExperience = Number(document.querySelector('#ien-experience-years')?.value) || 5;
    const yearsSinceLastClinicalPractice = Number(document.querySelector('#ien-years-since-practice')?.value) || 1;
    const languageProficiencyRoute = document.querySelector('#ien-lang-route')?.value || 'ielts_academic';
    const ieltsOverallScore = Number(document.querySelector('#ien-ielts-score')?.value) || 7.5;
    const targetProvince = document.querySelector('#ien-province')?.value || 'ON';
    const nurseName = document.querySelector('#ien-nurse-name')?.value || 'IEN Nurse';
    const hasPassedNclex = document.querySelector('#ien-passed-nclex')?.checked === true;
    const interestedInSpepSupervisedPractice = document.querySelector('#ien-wants-spep')?.checked !== false;

    resultsContainer.innerHTML = '<div data-s="padding-1rem text-align-center">Auditing IEN registration and fast-track roadmap...</div>';

    try {
      const res = await fetch('/v1/tools/internationally-trained-nurse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryOfEducation,
          nursingDesignation,
          yearsOfClinicalExperience,
          yearsSinceLastClinicalPractice,
          languageProficiencyRoute,
          ieltsOverallScore,
          targetProvince,
          hasPassedNclex,
          interestedInSpepSupervisedPractice,
          nurseName
        })
      });
      const data = await res.json();
      renderInternationallyTrainedNurseResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing nurse licensure: ${err.message}</div>`;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAudit();
  });
}

export function setupPrMatrixSimulator() {
  const form = $('#pr-matrix-form');
  const resultsContainer = $('#pr-matrix-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<p class="muted">Simulating scores across 5 immigration corridors…</p>';

    const age = Number($('#prm-age')?.value || 28);
    const educationLevel = $('#prm-edu')?.value || 'masters';
    const englishClbLevel = $('#prm-english')?.value || 'clb9';
    const yearsSkilledExperience = Number($('#prm-exp')?.value || 4);
    const isStemOrInDemand = $('#prm-stem')?.value === 'true';
    const germanProficiency = $('#prm-german')?.value || 'none';

    try {
      const res = await fetch('/v1/tools/pr-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          educationLevel,
          englishClbLevel,
          yearsSkilledExperience,
          isStemOrInDemand,
          hasOfferInTargetCountry: false,
          germanProficiency
        })
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      renderPrMatrixResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error running PR matrix simulation: ${err.message}</div>`;
    }
  });
}

export function setupFamilyReunificationNavigator() {
  const form = $('#family-reunification-form');
  const resultsContainer = $('#family-reunification-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<p class="muted">Auditing family reunification rules…</p>';

    const category = $('#fam-pathway')?.value || 'sowp_student';
    const studentDegreeLevel = $('#fam-degree')?.value || 'masters';
    const sponsorIncomeCad = Number($('#fam-income')?.value || 68000);
    const familySize = Number($('#fam-size')?.value || 3);
    const childAgeAtLockIn = Number($('#fam-child-age')?.value || 19);
    const hasContinuousMedicalInsurance = Boolean($('#fam-insurance')?.checked);
    const hasJointFinances = Boolean($('#fam-joint-finances')?.checked);

    try {
      const res = await fetch('/v1/tools/family-reunification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          studentDegreeLevel,
          sponsorIncomeCad,
          familySize,
          childAgeAtLockIn,
          hasContinuousMedicalInsurance,
          australiaFourPillars: {
            financialPillar: hasJointFinances,
            householdPillar: hasJointFinances,
            socialPillar: true,
            commitmentPillar: true
          }
        })
      });
      if (!res.ok) throw new Error('Audit failed');
      const data = await res.json();
      renderFamilyReunificationResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error auditing family reunification: ${err.message}</div>`;
    }
  });
}

export function setupTimelineCalendarSync() {
  const form = $('#calendar-sync-form');
  const resultsContainer = $('#calendar-sync-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<p class="muted">Generating statutory calendar timeline…</p>';

    const category = $('#cs-category')?.value || 'work_permit';
    const anchorDate = $('#cs-date')?.value || '2027-06-30';
    const corridor = $('#cs-corridor')?.value || 'Canada';
    const alarmDaysInAdvance = Number($('#cs-alarm')?.value || 90);

    try {
      const res = await fetch('/v1/tools/calendar-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          anchorDate,
          corridor,
          alarmDaysInAdvance
        })
      });
      if (!res.ok) throw new Error('Failed to generate calendar');
      const data = await res.json();
      renderTimelineCalendarSyncResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error generating calendar sync: ${err.message}</div>`;
    }
  });
}

export function setupTaxShieldOptimizer() {
  const form = $('#tax-shield-form');
  const resultsContainer = $('#tax-shield-results');
  if (!form || !resultsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<p class="muted">Calculating tax shield deductions and family benefits…</p>';

    const grossEmploymentIncomeCad = Number($('#ts-income')?.value || 85000);
    const taxResidencyStatus = $('#ts-status')?.value || 'resident';
    const province = $('#ts-province')?.value || 'ON';
    const dependentChildrenCount = Number($('#ts-children')?.value || 1);
    const plannedFhsaContributionCad = Number($('#ts-fhsa')?.value || 8000);
    const plannedTfsaContributionCad = Number($('#ts-tfsa')?.value || 7000);
    const plannedRrspContributionCad = Number($('#ts-rrsp')?.value || 5000);

    try {
      const res = await fetch('/v1/tools/tax-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossEmploymentIncomeCad,
          taxResidencyStatus,
          province,
          dependentChildrenCount,
          plannedFhsaContributionCad,
          plannedTfsaContributionCad,
          plannedRrspContributionCad
        })
      });
      if (!res.ok) throw new Error('Tax shield optimization failed');
      const data = await res.json();
      renderTaxShieldResults(data, resultsContainer);
      appendAssumptionNote(data, resultsContainer);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="result-warning" data-s="padding-1rem">Error calculating tax shield: ${err.message}</div>`;
    }
  });
}

export function initViewToolSwitchers() {
  Object.keys(TOOL_SWITCHER_CONFIG).forEach(viewId => {
    const viewEl = document.getElementById(viewId);
    if (!viewEl) return;
    const tools = TOOL_SWITCHER_CONFIG[viewId];
    if (!tools || tools.length <= 1) return;

    if (viewEl.querySelector('.view-tool-switcher')) return;

    let insertRef = null;
    for (const t of tools) {
      const el = document.getElementById(t.id);
      if (el) {
        insertRef = el;
        break;
      }
    }
    if (!insertRef) {
      insertRef = viewEl.querySelector('.pathway-form-container, .airport-content, .binder-watchdog-card, .case-card, .u-tool-card, .card, form') || viewEl.firstChild;
    }

    const state = {
      activeIndex: 0,
      showAll: false
    };

    const switcher = document.createElement('div');
    switcher.className = 'view-tool-switcher';
    switcher.setAttribute('data-view-id', viewId);

    // 1. Header with Title + Counter + Big Show/Hide Toggle Button
    const header = document.createElement('div');
    header.className = 'tool-switcher-header';

    const label = document.createElement('div');
    label.className = 'tool-switcher-label';
    label.innerHTML = `<span class="tool-switcher-icon">🛠️</span><span class="tool-switcher-title">Tools in this Category</span><span class="tool-counter" id="tool-counter-${escapeHtml(viewId)}">Tool 1 of ${tools.length}</span>`;

    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.type = 'button';
    toggleAllBtn.className = 'tool-toggle-all-btn';
    toggleAllBtn.id = `tool-toggle-all-${viewId}`;
    toggleAllBtn.setAttribute('aria-label', `Toggle between single tool focus and all tools for ${viewId}`);
    toggleAllBtn.innerHTML = `<span>👁️</span> <span>Show All Tools</span>`;

    header.append(label, toggleAllBtn);

    // 2. Control Row: [◀ Prev] [Dropdown Select] [Next ▶]
    const selectorRow = document.createElement('div');
    selectorRow.className = 'tool-selector-row';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'tool-nav-btn tool-prev-btn';
    prevBtn.title = 'Previous Tool in this category';
    prevBtn.innerHTML = `◀ Prev`;

    const selectWrap = document.createElement('div');
    selectWrap.className = 'tool-select-wrapper';

    const select = document.createElement('select');
    select.className = 'tool-select-dropdown';
    select.setAttribute('aria-label', `Select a tool from ${viewId}`);

    tools.forEach((t, idx) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${idx + 1}. ${t.title}`;
      select.appendChild(opt);
    });
    selectWrap.appendChild(select);

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'tool-nav-btn tool-next-btn';
    nextBtn.title = 'Next Tool in this category';
    nextBtn.innerHTML = `Next ▶`;

    selectorRow.append(prevBtn, selectWrap, nextBtn);

    // 3. Sleek Single-Line Horizontally Scrollable Pills Bar
    const pillsBar = document.createElement('div');
    pillsBar.className = 'tool-pills-bar';
    pillsBar.setAttribute('role', 'tablist');
    pillsBar.setAttribute('aria-label', `${viewId} tool selection tabs`);

    const pillBtns = [];
    tools.forEach((t, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `tool-pill ${idx === 0 ? 'active' : ''}`;
      pill.setAttribute('role', 'tab');
      pill.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      pill.setAttribute('data-target-card', t.id);
      pill.textContent = t.title;
      pill.addEventListener('click', () => {
        selectTool(idx, true);
      });
      pillsBar.appendChild(pill);
      pillBtns.push(pill);
    });

    switcher.append(header, selectorRow, pillsBar);
    if (insertRef && insertRef.parentNode) {
      insertRef.parentNode.insertBefore(switcher, insertRef);
    } else {
      viewEl.appendChild(switcher);
    }

    prevBtn.addEventListener('click', () => {
      if (state.activeIndex > 0) {
        selectTool(state.activeIndex - 1, true);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (state.activeIndex < tools.length - 1) {
        selectTool(state.activeIndex + 1, true);
      }
    });

    select.addEventListener('change', () => {
      const targetIdx = tools.findIndex(t => t.id === select.value);
      if (targetIdx !== -1) selectTool(targetIdx, true);
    });

    toggleAllBtn.addEventListener('click', () => {
      state.showAll = !state.showAll;
      applyState();
    });

    function selectTool(index, scrollIntoView = false) {
      state.showAll = false;
      state.activeIndex = Math.max(0, Math.min(index, tools.length - 1));
      applyState();
      if (scrollIntoView) {
        const targetEl = document.getElementById(tools[state.activeIndex].id);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    function applyState() {
      const counter = document.getElementById(`tool-counter-${viewId}`);
      prevBtn.disabled = state.activeIndex <= 0;
      nextBtn.disabled = state.activeIndex >= tools.length - 1;

      if (state.showAll) {
        tools.forEach(t => {
          const card = document.getElementById(t.id);
          if (card) {
            card.classList.remove('tool-card-hidden');
            card.classList.remove('tool-card-active');
            card.style.display = 'block';
          }
        });
        pillBtns.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        toggleAllBtn.innerHTML = `<span>🎯</span> <span>Focus Single Tool (Hide Others)</span>`;
        toggleAllBtn.classList.add('active');
        if (counter) counter.textContent = `All ${tools.length} Tools Visible`;
      } else {
        tools.forEach((t, idx) => {
          const card = document.getElementById(t.id);
          if (!card) return;
          if (idx === state.activeIndex) {
            card.classList.remove('tool-card-hidden');
            card.classList.add('tool-card-active');
            card.style.display = 'block';
          } else {
            card.classList.add('tool-card-hidden');
            card.classList.remove('tool-card-active');
            card.style.display = 'none';
          }
        });
        pillBtns.forEach((p, idx) => {
          const isActive = idx === state.activeIndex;
          p.classList.toggle('active', isActive);
          p.setAttribute('aria-selected', isActive ? 'true' : 'false');
          if (isActive) {
            p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        });
        select.value = tools[state.activeIndex].id;
        toggleAllBtn.innerHTML = `<span>👁️</span> <span>Show All Tools</span>`;
        toggleAllBtn.classList.remove('active');
        if (counter) counter.textContent = `Tool ${state.activeIndex + 1} of ${tools.length}`;
      }
    }

    applyState();

    viewToolControllers[viewId] = {
      selectTool,
      selectToolById: (id, scroll = false) => {
        const idx = tools.findIndex(t => t.id === id);
        if (idx !== -1) selectTool(idx, scroll);
      },
      showCard: (id) => {
        const idx = tools.findIndex(t => t.id === id);
        if (idx !== -1) {
          selectTool(idx, true);
        } else {
          state.showAll = true;
          applyState();
        }
      },
      showAll: () => {
        state.showAll = true;
        applyState();
      },
      getState: () => ({ ...state })
    };
  });
}
