// src/lease-guard.js
// Residential Lease Guardian & Predatory Landlord Clause Diagnostic Engine.
// Evaluates residential tenancies against Ontario Residential Tenancies Act, 2006 (RTA),
// British Columbia Residential Tenancy Act (SBC 2002, c. 78), and Alberta RTA.
// Pure ES module with zero npm dependencies.
import {boundedText} from './text-input.js';

export const PROVINCIAL_LEASE_RULES = {
  ON: {
    province: 'Ontario',
    statute: 'Ontario Residential Tenancies Act, 2006 (S.O. 2006, c. 17)',
    tribunal: 'Landlord and Tenant Board (LTB)',
    standardFormName: 'Ontario Standard Form of Lease (Form 2229E)',
    standardFormMandatory: true,
    standardFormEffectiveDate: '2018-04-30',
    maxRentDeposit: '1 month rent (applied strictly to the last month of tenancy under s. 106)',
    damageDepositAllowed: false,
    damageDepositCitation: 'RTA s. 105 & s. 134 (Security and damage deposits are strictly illegal)',
    keyDepositRule: 'Refundable only, capped at direct replacement cost ($20-$50) under O. Reg. 516/06 s. 17',
    petBanAllowed: false,
    petBanCitation: 'RTA s. 14 (Provisions prohibiting animals are completely void)',
    guestBanAllowed: false,
    guestBanCitation: 'RTA s. 22 (Tenant right to quiet enjoyment without landlord interference)',
    postDatedChequesMandatory: false,
    postDatedCitation: 'RTA s. 108 (Landlords cannot require post-dated cheques or direct debit)',
    repairDeductibleAllowed: false,
    repairCitation: 'RTA s. 20 (Landlord is responsible for all maintenance and repairs; contracting out is void under s. 3)'
  },
  BC: {
    province: 'British Columbia',
    statute: 'Residential Tenancy Act (SBC 2002, c. 78)',
    tribunal: 'Residential Tenancy Branch (RTB)',
    standardFormName: 'Residential Tenancy Agreement (Form RTB-1)',
    standardFormMandatory: true,
    standardFormEffectiveDate: '2004-01-01',
    maxRentDeposit: 'None (Rent is paid on the first day of each rental period)',
    damageDepositAllowed: true,
    damageDepositCitation: 'BC RTA s. 19 (Security deposit strictly capped at maximum 50% of 1 month rent)',
    keyDepositRule: 'Refundable only, not exceeding actual replacement cost under BC Reg 477/2003 s. 24',
    petBanAllowed: true,
    petBanCitation: 'BC RTA s. 18 (Landlords may restrict pets at commencement, max 50% 1 month pet deposit)',
    guestBanAllowed: false,
    guestBanCitation: 'BC RTA s. 30 (Landlord must not unreasonably restrict guest access)',
    postDatedChequesMandatory: false,
    postDatedCitation: 'BC RTA s. 26 (Landlords cannot mandate a single payment method)',
    repairDeductibleAllowed: false,
    repairCitation: 'BC RTA s. 32 (Landlord must maintain residential property in state of decoration and repair)'
  },
  AB: {
    province: 'Alberta',
    statute: 'Residential Tenancies Act (RSA 2000, c. R-17)',
    tribunal: 'Residential Tenancy Dispute Resolution Service (RTDRS)',
    standardFormName: 'Standard Residential Tenancy Agreement',
    standardFormMandatory: false,
    standardFormEffectiveDate: '2004-11-01',
    maxRentDeposit: 'Security deposit capped at maximum 1 month rent (s. 43)',
    damageDepositAllowed: true,
    damageDepositCitation: 'Alberta RTA s. 43 (Total security deposit cannot exceed one month rent)',
    keyDepositRule: 'Included within the 1-month security deposit statutory cap',
    petBanAllowed: true,
    petBanCitation: 'Alberta RTA s. 21 (Landlords may impose pet rules in tenancy agreement)',
    guestBanAllowed: false,
    guestBanCitation: 'Alberta RTA s. 16 (Landlord must not disturb peaceful enjoyment)',
    postDatedChequesMandatory: false,
    postDatedCitation: 'Alberta RTA (Method of payment agreed upon mutually)',
    repairDeductibleAllowed: false,
    repairCitation: 'Alberta Public Health Act Housing Regulations & RTA s. 16'
  }
};

export const COMMON_ILLEGAL_CLAUSES = {
  no_pets: {
    name: 'No Pets Allowed Clause',
    evaluator: (prov) => {
      if (prov === 'ON') {
        return {
          isLegal: false,
          statutoryStatus: 'void',
          statute: 'Ontario RTA s. 14',
          ruling: 'Statutorily VOID: A provision in a tenancy agreement prohibiting the presence of animals in or about the residential complex is void.',
          exception: 'Exceptions apply only in condominiums where the condominium declaration registered under the Condominium Act expressly bans pets, or if the animal causes documented severe allergic reactions.',
          action: 'You can sign the lease and keep your pet. The clause has zero legal force in Ontario.'
        };
      }
      return {
        isLegal: true,
        statutoryStatus: 'lawful',
        statute: 'BC RTA s. 18 / AB RTA s. 21',
        ruling: 'Permitted at lease commencement: Landlords in BC and Alberta can restrict or prohibit pets in the agreement.',
        exception: 'Once permitted, a landlord cannot retroactively ban an existing pet.',
        action: 'Ensure pet permission is explicitly written into the agreement.'
      };
    }
  },
  no_guests: {
    name: 'No Overnight Guests or Visitor Restrictions',
    evaluator: (prov) => ({
      isLegal: false,
      statutoryStatus: 'void',
      statute: prov === 'ON' ? 'Ontario RTA s. 22' : 'BC RTA s. 30',
      ruling: '100% VOID: Landlords cannot restrict overnight guests, impose curfews, or charge additional rent for visitors.',
      exception: 'Tenants cannot permanently sublet or overcrowd beyond municipal occupancy standards (typically 1 person per 9 sq meters).',
      action: 'Landlord demands to ban guests or charge extra guest fees are unlawful and unenforceable.'
    })
  },
  post_dated_cheques: {
    name: 'Mandatory Post-Dated Cheques or Pre-Authorized Debit',
    evaluator: (prov) => ({
      isLegal: false,
      statutoryStatus: 'prohibited',
      statute: prov === 'ON' ? 'Ontario RTA s. 108' : 'BC RTA s. 26',
      ruling: 'UNLAWFUL REQUIREMENT: Landlords are legally prohibited from demanding post-dated cheques or mandatory pre-authorized debit.',
      exception: 'Tenants may choose to pay by post-dated cheques or pre-authorized debit voluntarily, but it cannot be a condition of tenancy.',
      action: 'You have the statutory right to pay monthly by Interac e-Transfer, bank transfer, or standard cheque.'
    })
  },
  tenant_repairs: {
    name: 'Tenant Pays First $100 of Repairs (Maintenance Deductible)',
    evaluator: (prov) => ({
      isLegal: false,
      statutoryStatus: 'void',
      statute: prov === 'ON' ? 'Ontario RTA s. 20 & s. 3' : 'BC RTA s. 32',
      ruling: 'Statutorily VOID: Landlords are strictly responsible for maintaining the residential complex in a good state of repair. Contracting out is prohibited.',
      exception: 'Tenants are only liable for willful or negligent damage caused by the tenant or their guests.',
      action: 'Refuse repair deduction clauses. Any clause making tenants pay regular maintenance is null and void.'
    })
  },
  lockout_clause: {
    name: 'Landlord Right to Change Locks or Evict Without LTB Order',
    evaluator: (prov) => ({
      isLegal: false,
      statutoryStatus: 'illegal',
      statute: prov === 'ON' ? 'Ontario RTA s. 24 & s. 39' : 'BC RTA s. 57',
      ruling: 'CRIMINAL/PROVINCIAL OFFENCE: Only a court-appointed Sheriff enforcing an official tribunal eviction order can evict a tenant or change locks.',
      exception: 'None. Self-help evictions carry provincial fines up to $50,000 for individuals and $250,000 for corporations.',
      action: 'If locked out illegally, call local police and cite RTA Section 24.'
    })
  }
};

/**
 * Audits a residential lease agreement and deposit demands against statutory tenancy law.
 * 
 * @param {object} params
 * @param {string} [params.province='ON'] - Canadian province ('ON', 'BC', 'AB')
 * @param {number} [params.monthlyRentCad=2200] - Agreed monthly rent
 * @param {boolean} [params.standardFormUsed=true] - Whether Ontario Form 2229E / BC RTB-1 was provided
 * @param {object} [params.depositDemands] - Demanded deposits
 * @param {number} [params.depositDemands.rentDepositMonths=1] - Months of advance rent demanded
 * @param {number} [params.depositDemands.damageDepositCad=0] - Security / damage deposit demanded
 * @param {number} [params.depositDemands.keyDepositCad=50] - Key / fob deposit demanded
 * @param {Array<string>} [params.clausesPresent=[]] - List of clause keys present in lease ('no_pets', 'no_guests', etc.)
 * @param {string} [params.customClauseText=''] - Raw text of any suspicious clause
 * @returns {object} Comprehensive statutory lease audit and dispute package
 */
export function auditLeaseAgreement(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    monthlyRentCad = 2200,
    standardFormUsed = true,
    depositDemands = {},
    clausesPresent = [],
    customClauseText = ''
  } = safeParams;
  const safeDeposit = (depositDemands && typeof depositDemands === 'object') ? depositDemands : {};
  const provCode = (province || 'ON').toUpperCase();
  const provRules = PROVINCIAL_LEASE_RULES[provCode] || PROVINCIAL_LEASE_RULES.ON;
  const rent = Math.max(100, Number.isFinite(Number(monthlyRentCad)) ? Number(monthlyRentCad) : 2200);

  const rentDepMonths = Math.max(0, Number.isFinite(Number(safeDeposit.rentDepositMonths)) ? Number(safeDeposit.rentDepositMonths) : 1);
  const damageDep = Math.max(0, Number.isFinite(Number(safeDeposit.damageDepositCad)) ? Number(safeDeposit.damageDepositCad) : 0);
  const keyDep = Math.max(0, Number.isFinite(Number(safeDeposit.keyDepositCad)) ? Number(safeDeposit.keyDepositCad) : 0);

  // 1. Standard Lease Form Audit
  let standardFormStatus = {
    isMandatory: provRules.standardFormMandatory,
    isCompliant: standardFormUsed,
    formName: provRules.standardFormName,
    statutoryRemedy: null
  };

  if (provCode === 'ON' && !standardFormUsed) {
    standardFormStatus.statutoryRemedy = {
      demandRight: 'You can submit a formal written demand for the Ontario Standard Form of Lease (Form 2229E) under RTA s. 12.1(3).',
      rentWithholding: 'If the landlord fails to provide Form 2229E within 21 days after written demand, you have the statutory right under RTA s. 12.1(5) to WITHHOLD one month of rent.',
      permanentRetention: 'If the landlord still does not provide Form 2229E within 30 days of withholding, you KEEP the withheld rent permanently under RTA s. 12.1(7).',
      leaseTermination: 'You can also terminate the tenancy on 60 days written notice (Form N9) under RTA s. 12.1(8) even during a fixed term.'
    };
  }

  // 2. Deposit Legality Audit
  const depositAudit = {
    monthlyRentCad: rent,
    demanded: {
      rentDepositMonths: rentDepMonths,
      totalRentDepositCad: rentDepMonths * rent,
      damageDepositCad: damageDep,
      keyDepositCad: keyDep,
      totalDemandedCad: (rentDepMonths * rent) + damageDep + keyDep
    },
    statutoryCaps: {
      legalMaxRentDepositCad: provCode === 'ON' ? rent : 0,
      legalMaxDamageDepositCad: provCode === 'ON' ? 0 : (provCode === 'BC' ? Math.round(rent * 0.5) : rent),
      legalKeyDepositCad: 50 // Typical replacement cost benchmark
    },
    unlawfulCharges: [],
    totalUnlawfulExcessCad: 0,
    rebateForm: provCode === 'ON' ? 'LTB Form T1 (Tenant Rebate Application under RTA s. 135)' : 'RTB Dispute Resolution'
  };

  if (provCode === 'ON') {
    if (rentDepMonths > 1) {
      const excessRentDep = (rentDepMonths - 1) * rent;
      depositAudit.unlawfulCharges.push({
        type: 'excess_rent_deposit',
        description: `Demanding ${rentDepMonths} months advance rent exceeds the statutory limit of 1 month (Last Month Rent Deposit) under RTA s. 106.`,
        unlawfulAmountCad: excessRentDep
      });
      depositAudit.totalUnlawfulExcessCad += excessRentDep;
    }
    if (damageDep > 0) {
      depositAudit.unlawfulCharges.push({
        type: 'illegal_damage_deposit',
        description: 'Security, damage, and cleaning deposits are strictly illegal in Ontario under RTA s. 105 and s. 134.',
        unlawfulAmountCad: damageDep
      });
      depositAudit.totalUnlawfulExcessCad += damageDep;
    }
    if (keyDep > 50) {
      const excessKey = keyDep - 50;
      depositAudit.unlawfulCharges.push({
        type: 'excessive_key_deposit',
        description: `Key deposit of $${keyDep} exceeds the reasonable direct replacement cost ($20-$50) permitted under O. Reg. 516/06 s. 17.`,
        unlawfulAmountCad: excessKey
      });
      depositAudit.totalUnlawfulExcessCad += excessKey;
    }
  } else if (provCode === 'BC') {
    const maxBcDamage = Math.round(rent * 0.5);
    if (damageDep > maxBcDamage) {
      const excessDamage = damageDep - maxBcDamage;
      depositAudit.unlawfulCharges.push({
        type: 'excess_damage_deposit',
        description: `Damage deposit of $${damageDep} exceeds the 50% statutory cap ($${maxBcDamage}) under BC RTA s. 19.`,
        unlawfulAmountCad: excessDamage
      });
      depositAudit.totalUnlawfulExcessCad += excessDamage;
    }
  }

  // 3. Clause Legality Audit
  const evaluatedClauses = [];
  const clauseSet = new Set(Array.isArray(clausesPresent) ? clausesPresent : []);

  // Text heuristics if custom clause text provided
  const safeCustomClauseText = boundedText(customClauseText, '', 2000);
  if (safeCustomClauseText) {
    const lower = safeCustomClauseText.toLowerCase();
    if (lower.includes('pet') || lower.includes('animal') || lower.includes('dog') || lower.includes('cat')) clauseSet.add('no_pets');
    if (lower.includes('guest') || lower.includes('visitor') || lower.includes('overnight')) clauseSet.add('no_guests');
    if (lower.includes('post-dated') || lower.includes('cheque') || lower.includes('auto-debit')) clauseSet.add('post_dated_cheques');
    if (lower.includes('repair') || lower.includes('100') || lower.includes('maintenance')) clauseSet.add('tenant_repairs');
    if (lower.includes('lock') || lower.includes('evict') || lower.includes('repossess')) clauseSet.add('lockout_clause');
  }

  for (const clauseKey of clauseSet) {
    const config = COMMON_ILLEGAL_CLAUSES[clauseKey];
    if (config) {
      const evaluation = config.evaluator(provCode);
      evaluatedClauses.push({
        key: clauseKey,
        name: config.name,
        ...evaluation
      });
    }
  }

  // Summary verdict
  const totalVoidOrIllegalClauses = evaluatedClauses.filter(c => !c.isLegal).length;
  let overallSafetyRating = 'safe';
  if (depositAudit.totalUnlawfulExcessCad > 0 || totalVoidOrIllegalClauses > 0 || !standardFormUsed) {
    overallSafetyRating = depositAudit.totalUnlawfulExcessCad > 1000 || totalVoidOrIllegalClauses >= 2 ? 'high_risk' : 'warning';
  }

  // Generate formal dispute letter to landlord
  let disputeLetter = `Date: ${new Date().toISOString().slice(0, 10)}\n\n`;
  disputeLetter += `To: Landlord / Property Management\n`;
  disputeLetter += `Re: Formal Tenancy Notice Regarding Statutory Compliance (${provRules.statute})\n\n`;
  disputeLetter += `I am writing regarding our residential tenancy agreement for the rental unit.\n\n`;

  if (provCode === 'ON' && !standardFormUsed) {
    disputeLetter += `1. MANDATORY STANDARD LEASE DEMAND (RTA Section 12.1):\n`;
    disputeLetter += `Under Section 12.1 of the Ontario Residential Tenancies Act, 2006, landlords are legally required to provide the official Ontario Standard Form of Lease (Form 2229E). Please provide a signed copy of Form 2229E within 21 calendar days of this notice. Please note that under RTA s. 12.1(5), failure to supply Form 2229E grants the tenant the statutory right to withhold one month of rent.\n\n`;
  }

  if (depositAudit.totalUnlawfulExcessCad > 0) {
    disputeLetter += `2. UNLAWFUL DEPOSIT REBATE DEMAND (${provRules.statute}):\n`;
    depositAudit.unlawfulCharges.forEach(ch => {
      disputeLetter += `• ${ch.description} (Excess: $${ch.unlawfulAmountCad} CAD)\n`;
    });
    disputeLetter += `Under provincial law, deposits exceeding the statutory cap must be refunded immediately. If not reimbursed, a formal Tenant Rebate Application (${depositAudit.rebateForm}) will be filed with the tribunal, requesting a statutory order for repayment plus administrative filing fees.\n\n`;
  }

  if (evaluatedClauses.length > 0) {
    disputeLetter += `3. VOID & UNENFORCEABLE CLAUSES:\n`;
    evaluatedClauses.forEach(cl => {
      if (!cl.isLegal) {
        disputeLetter += `• ${cl.name}: Under ${cl.statute}, this provision is void and has zero legal force. ${cl.ruling}\n`;
      }
    });
    disputeLetter += `\n`;
  }

  disputeLetter += `Thank you for your prompt attention to ensuring our tenancy agreement complies with provincial tenancy standards.\n\nSincerely,\nTenant`;

  return {
    asOf: new Date().toISOString().slice(0, 10),
    province: provCode,
    overallSafetyRating,
    standardFormStatus,
    depositAudit,
    clauseAudits: evaluatedClauses,
    voidClauseCount: totalVoidOrIllegalClauses,
    officialDisputeNotice: disputeLetter,
    statutoryAuthority: provRules.statute
  };
}
