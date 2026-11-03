// src/narrative-crisis-resolver.js
// Statutory Narrative & Social Crisis Resolver
// Transforms messy, real-world Reddit & Quora newcomer narrative queries into
// structured research hints (unreviewed, not authoritative statutory guidance) and actionable checklists.

import { deconstructNarrative } from './narrative-deconstructor.js';

export const NARRATIVE_CRISIS_ARCHETYPES = {
  illegal_lockout: {
    topic: 'housing',
    title: 'Unlawful Residential Lockout & Tenant Eviction Protections',
    statutoryRule: 'Under Ontario Residential Tenancies Act 2006 (RTA) s. 24 (and equivalent provincial/state tenancy legislation), only an official Court Enforcement Officer (Sheriff) enforcing a valid Landlord and Tenant Board (LTB) eviction order has lawful authority to evict a tenant or change exterior door locks. A landlord who changes locks, denies key access, or evicts a tenant without a Sheriff commits an illegal lockout offence.',
    citation: 'Ontario Residential Tenancies Act, 2006, S.O. 2006, c. 17, s. 24, s. 116; Criminal Code, R.S.C. 1985, c. C-46, s. 446',
    verdict: 'ILLEGAL LOCKOUT: A landlord cannot legally change your locks or evict you without an official Sheriff order. Doing so is an unlawful eviction offence.',
    authority: 'Rental Housing Enforcement Unit (RHEU) / Landlord and Tenant Board (LTB)',
    url: 'https://www.ontario.ca/page/solve-disagreement-your-landlord-or-tenant',
    checklist: [
      'Call the Rental Housing Enforcement Unit (RHEU) immediately at 1-888-772-9277 (toll-free). Compliance officers can contact the landlord directly and order immediate re-entry.',
      'Do NOT attempt to break windows or damage property, which exposes you to civil liability and criminal charges.',
      'Contact local police non-emergency and state that you are the victim of an "unlawful lockout under RTA s. 24" requiring peaceful accompaniment to recover your passport, winter clothing, and medications.',
      'File an urgent Form T2 (Application about Tenant Rights) with the Landlord and Tenant Board (LTB) requesting emergency re-entry orders and statutory financial compensation.'
    ]
  },

  lmia_extortion: {
    topic: 'employment',
    title: 'Prohibition of LMIA & Job Offer Fees / Vulnerable Worker Protection',
    statutoryRule: 'Under IRPR s. 200(1)(c) and provincial worker protection laws (e.g. Ontario EPFNA 2009 s. 7), employers and recruiters are strictly prohibited from recovering LMIA application fees, advertising costs, or recruitment fees from foreign workers directly or indirectly. Threatening cancellation of an LMIA or deportation to extract money constitutes criminal extortion under Criminal Code s. 346.',
    citation: 'Immigration and Refugee Protection Regulations (IRPR) SOR/2002-227 s. 200(1)(c), s. 207.1, s. 209.2; EPFNA 2009 s. 7; Criminal Code s. 346',
    verdict: 'UNLAWFUL EXTORTION: Employers and recruiters are prohibited from charging you fees for an LMIA or sponsorship. Demanding money is illegal extortion.',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC) / Service Canada',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/vulnerable-workers.html',
    checklist: [
      'Do NOT pay cash or wire transfers for an LMIA, job offer, or sponsorship. Retain all text messages, emails, and withdrawal receipts as evidence.',
      'Apply immediately for a fee-exempt Vulnerable Worker Open Work Permit (VWOWP) under IRPR s. 207.1 to leave the abusive employer while maintaining legal status.',
      'An employer CANNOT deport you. Only CBSA and the Immigration and Refugee Board (IRB) have statutory removal authority after formal due process under IRPA s. 44.',
      'Submit a confidential non-compliance complaint to the Service Canada Tip Line (1-866-602-9448) and the provincial Ministry of Labour.'
    ]
  },

  wage_theft_hours_cut: {
    topic: 'employment',
    title: 'Closed Work Permit Hours Reduction & Wage Protection Protections',
    statutoryRule: 'Under IRPR s. 209.2, an employer who received an LMIA and issued a closed work permit is legally bound to provide the exact occupation, wage rate, and working hours (typically full-time 30–40 hours/week) stated in the approved LMIA. Substantially cutting hours (e.g. to 10 hours/week) or withholding wages constitutes an employer compliance violation and constructive dismissal under Employment Standards Act s. 56.',
    citation: 'IRPR s. 209.2; Employment Standards Act, 2000, S.O. 2000, c. 41, s. 11, s. 56; Canada Labour Code R.S.C. 1985 c. L-2',
    verdict: 'COMPLIANCE VIOLATION: Employers on LMIA closed work permits must maintain the contracted hours and wages. Arbitrarily slashing hours is an employment standards violation.',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development / Service Canada',
    url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0',
    checklist: [
      'Maintain a detailed written daily log of scheduled hours versus actual hours worked and pay stubs received.',
      'File an Employment Standards Claim with the Ministry of Labour to recover unpaid wages, statutory overtime, and termination pay.',
      'If the employer cuts your hours to force you out or threatens your legal status, apply for a Vulnerable Worker Open Work Permit (VWOWP) under IRPR s. 207.1.',
      'Submit an LMIA non-compliance report to Service Canada, which can trigger monetary penalties and bans against the non-compliant employer.'
    ]
  },

  passport_withheld: {
    topic: 'community',
    title: 'Unlawful Confiscation of Passports & Official Identity Documents',
    statutoryRule: 'Under Criminal Code RSC 1985 c. C-46 s. 279.011 and IRPA s. 124, an individual\'s passport remains the property of the issuing government and cannot be lawfully confiscated or held by an employer, recruiter, or landlord. Withholding passports or identity documents to maintain leverage or compel labour is an explicit statutory indicator of human trafficking and forced labour.',
    citation: 'Criminal Code RSC 1985 c. C-46 s. 279.011; IRPA SC 2001 c. 27 s. 124; Ontario EPFNA 2009 s. 8; ILO Forced Labour Convention No. 29',
    verdict: 'CRIMINAL OFFENSE: An employer, recruiter, or landlord CANNOT lawfully withhold your passport or official identity documents under any circumstances.',
    authority: 'Royal Canadian Mounted Police (RCMP) / Local Police Services / IRCC',
    url: 'https://www.rcmp-grc.gc.ca/en/human-trafficking',
    checklist: [
      'Send a formal written demand (via text message or email) requesting the immediate return of your passport and official documents to establish an evidentiary record.',
      'If the employer or landlord refuses, contact local police non-emergency immediately to report unlawful document retention under Criminal Code s. 279.011.',
      'Contact the Canadian Human Trafficking Hotline (1-833-900-1010) or your country\'s consulate/embassy for emergency consular assistance.',
      'Apply for an emergency fee-exempt Vulnerable Worker Open Work Permit (VWOWP) through IRCC.'
    ]
  },

  status_expired_or_expiring: {
    topic: 'employment',
    title: 'Status Expiration, Maintained Status & 90-Day Restoration of Status',
    statutoryRule: 'Under IRPA s. 182 and IRPR s. 182, a temporary resident whose status has expired has a strict 90-day statutory window from the date of expiry to apply for restoration of temporary resident status while remaining inside Canada. If an extension application was submitted before midnight on the date of permit expiry, the applicant holds maintained status under IRPR s. 183(5) and may continue working or studying until a decision is made.',
    citation: 'Immigration and Refugee Protection Act (IRPA) s. 182; IRPR s. 182, s. 183(5); IRCC Maintained Status Operational Guidelines',
    verdict: 'TIME-SENSITIVE STATUTORY STATUS: You have up to 90 days from the date of permit expiry to apply for restoration of status under IRPA s. 182.',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html',
    checklist: [
      'Verify the exact expiry date printed on your work permit, study permit, or visitor record.',
      'If your permit has expired but fewer than 90 days have elapsed, cease all employment immediately and submit an online application for Restoration of Status with the $229 CAD restoration fee.',
      'If more than 90 days have elapsed since expiry, restoration is unavailable; you must depart Canada or seek legal advice regarding Temporary Resident Permits (TRP) under IRPA s. 24.',
      'If your permit is still valid, submit your extension application before midnight of the expiration day to maintain working authorization under IRPR s. 183(5).'
    ]
  },

  lost_pr_card_abroad: {
    topic: 'arrival',
    title: 'Lost PR Card Abroad & Permanent Resident Travel Document (PRTD)',
    statutoryRule: 'Under IRPA s. 31(3), a permanent resident who is outside Canada and does not possess a valid permanent resident card must apply for a Permanent Resident Travel Document (PRTD) to verify their permanent resident status when boarding a commercial vehicle (airplane, bus, train, or boat) to Canada. Permanent residency status is NOT lost simply because the card is lost or expired.',
    citation: 'Immigration and Refugee Protection Act (IRPA SC 2001 c. 27) s. 31(3); IRPR SOR/2002-227 s. 53–59; IRCC PRTD Operational Manual',
    verdict: 'STATUS PRESERVED: You remain a Permanent Resident even if your card is lost. Commercial airlines require a PRTD or private land border crossing.',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC) / CBSA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-travel-document.html',
    checklist: [
      'Submit an urgent online application for a Permanent Resident Travel Document (PRTD) through the official IRCC Portal from abroad.',
      'Upload evidence of meeting the residency obligation (at least 730 days physically in Canada within the past 5 years) and a police report for the lost card.',
      'If you are in the United States, you can enter Canada without a PRTD by crossing the land border in a private vehicle using your signed Confirmation of Permanent Residence (COPR) and valid passport.',
      'Once back inside Canada, submit Form IMM 5444 to apply for a replacement permanent resident card.'
    ]
  },

  unlawful_rent_increase_or_deposit: {
    topic: 'housing',
    title: 'Rent Increase Guidelines & Statutory Prohibition on Excessive Advance Deposits',
    statutoryRule: 'Under Ontario Residential Tenancies Act 2006 (RTA) s. 106 and s. 116, a landlord can legally collect only a rent deposit equal to one rent period (last month\'s rent) plus a refundable key deposit. Demanding 6–12 months of rent upfront is illegal. Under RTA s. 14, "no pets" clauses in tenancy agreements are legally void. Rent can be increased only once every 12 months with 90 days written notice on Form N1.',
    citation: 'Ontario Residential Tenancies Act, 2006, S.O. 2006, c. 17, s. 14, s. 106, s. 116, s. 119; Corvers v. Bumbia (2014 ONSC 985)',
    verdict: 'STATUTORY CEILING: Landlords cannot legally mandate 6–12 months advance rent, and "no pets" clauses are completely void under Ontario law.',
    authority: 'Landlord and Tenant Board (LTB) / Social Justice Tribunals Ontario',
    url: 'https://tribunalsontario.ca/ltb/',
    checklist: [
      'Refuse unlawful advance rent demands in writing citing RTA s. 106. Landlords cannot legally mandate more than first and last month\'s rent.',
      'If you already paid illegal advance deposits or illegal rent hikes, file Form T1 (Tenant Application for a Rebate of Money the Landlord Owes) with the Landlord and Tenant Board (LTB).',
      'Ignore void "no pets" lease clauses; landlords cannot evict for pet ownership unless the pet causes substantial damage or severe allergic reactions in other tenants.'
    ]
  },

  domestic_violence_abuse: {
    topic: 'community',
    title: 'Statutory Protections for Victims of Family Violence & Independent Status',
    statutoryRule: 'Under IRPR s. 207.1 and IRPA s. 24, temporary residents and out-of-status individuals experiencing domestic or family violence in Canada are eligible for an expedited, fee-exempt Temporary Resident Permit (TRP) valid for at least 6 months, along with a fee-exempt Open Work Permit and access to interim healthcare coverage. A sponsor cannot unilaterally cancel your status or execute a deportation.',
    citation: 'IRPR SOR/2002-227 s. 207.1; IRPA SC 2001 c. 27 s. 24; Victims of Family Violence Program Guidelines; Criminal Code s. 265',
    verdict: 'SAFETY FIRST & INDEPENDENT STATUS: Emergency services prioritize your safety. Abusive partners cannot unilaterally deport you, and fee-exempt TRPs protect your legal status.',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC) / Victim Services',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/abuse.html',
    checklist: [
      'If you or your children are in immediate physical danger, call 911 immediately. First responders prioritize safety and do not enforce immigration deportations.',
      'Contact the Assaulted Women\'s Helpline (1-866-863-0511) or your local community crisis shelter for confidential, safe housing and food support.',
      'Apply for an expedited fee-exempt Temporary Resident Permit (TRP) for Victims of Family Violence through IRCC, providing independent legal status without relying on the abusive partner.',
      'A spouse or common-law partner has NO statutory authority to deport you or withhold legal documents.'
    ]
  },

  travel_on_maintained_status: {
    topic: 'employment',
    title: 'Maintained Status (Implied Status) Travel Warnings & Work Authorization',
    statutoryRule: 'Under IRPR s. 183(5), maintained status authorization to continue working while waiting for a work permit decision is legally conditional on remaining physically inside Canada. If you leave Canada, your maintained work authorization terminates upon departure. You can re-enter as a visitor (if holding a valid TRV/eTA), but you CANNOT legally work until your new permit is formally approved.',
    citation: 'Immigration and Refugee Protection Regulations (IRPR) s. 183(5); IRCC Operational Instructions on Maintained Status; IRPA s. 30',
    verdict: 'TRAVEL TERMINATES WORK PERMIT: Leaving Canada immediately terminates your maintained work authorization. You cannot work upon return until the permit is approved.',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC) / CBSA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/implied-status-extending-stay.html',
    checklist: [
      'Do NOT leave Canada if maintaining continuous lawful work authorization is required for your livelihood or PR eligibility.',
      'If international travel is unavoidable, verify that you hold a valid TRV (visa sticker) or eTA to re-enter Canada.',
      'Upon re-entry at the Canadian Port of Entry, inform the CBSA officer that you have a pending permit application; you will be admitted as a visitor without permission to work until approval.'
    ]
  },

  cash_work_tax_misconception: {
    topic: 'employment',
    title: 'Statutory Prohibition on Unauthorized Cash Work & Misrepresentation Risks',
    statutoryRule: 'Under IRPA s. 30 and s. 196, visitors and unauthorized foreign nationals are strictly prohibited from engaging in domestic employment. Paying income taxes to the CRA or filing a return does NOT grant retroactive work authorization or immigration amnesty. Engaging in unauthorized work can trigger Section 44 inadmissibility reports and exclusion orders.',
    citation: 'Immigration and Refugee Protection Act (IRPA SC 2001 c. 27) s. 30, s. 40, s. 44; IRPR SOR/2002-227 s. 196; 8 U.S. Code § 1182',
    verdict: 'NO TAX AMNESTY: Paying taxes does not forgive unauthorized cash work. Working without authorization violates IRPA and risks a 5-year removal ban.',
    authority: 'Canada Border Services Agency (CBSA) / IRCC / CRA',
    url: 'https://www.canada.ca/en/services/immigration-citizenship.html',
    checklist: [
      'Cease all unauthorized cash or under-the-table work immediately to avoid compounding status violations.',
      'Maintain your legal temporary resident status by applying for an extension before your current authorized period of stay expires.',
      'Explore legitimate economic immigration pathways (such as obtaining an employer with an approved LMIA or provincial nomination) before performing any work.'
    ]
  }
};

export function resolveNarrativeCrisis(rawQuestion, parsed = {}) {
  if (!rawQuestion || typeof rawQuestion !== 'string') return null;

  // Guard: Never intercept short keyword-driven searches (reserved for standard evidence retrieval)
  const trimmed = rawQuestion.trim();
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 6) return null;

  const narrative = deconstructNarrative(rawQuestion);
  const conflictId = narrative.slots.conflict?.id;
  const mythId = narrative.mythWarning?.id;
  const targetCountry = narrative.slots.location.country || parsed.country || 'Canada';

  // Guard: Never leak Canadian statute advice for foreign/international queries unless international archetype
  const isCanada = targetCountry === 'Canada' || targetCountry === 'CA';
  if (!isCanada && conflictId !== 'passport_withheld') return null;

  let archetypeKey = conflictId;
  if (!archetypeKey && mythId) {
    if (mythId === 'myth_cash_job_tax_amnesty') archetypeKey = 'cash_work_tax_misconception';
    else if (mythId === 'myth_landlord_self_help_lockout') archetypeKey = 'illegal_lockout';
    else if (mythId === 'myth_lmia_recruitment_fees') archetypeKey = 'lmia_extortion';
    else if (mythId === 'myth_travel_on_maintained_status') archetypeKey = 'travel_on_maintained_status';
    else if (mythId === 'myth_landlord_no_pets_large_deposit') archetypeKey = 'unlawful_rent_increase_or_deposit';
    else if (mythId === 'myth_police_deport_abuse_victims') archetypeKey = 'domestic_violence_abuse';
    else if (mythId === 'myth_employer_passport_retention') archetypeKey = 'passport_withheld';
  }

  if (!archetypeKey || !NARRATIVE_CRISIS_ARCHETYPES[archetypeKey]) {
    return null;
  }

  const archetype = { ...NARRATIVE_CRISIS_ARCHETYPES[archetypeKey] };

  // Jurisdiction-specific adjustments for international questions
  if (targetCountry === 'UAE' && archetypeKey === 'passport_withheld') {
    archetype.title = 'UAE Labour Law: Unlawful Employer Passport Retention & Worker Rights';
    archetype.statutoryRule = 'Under UAE Federal Decree-Law No. 33 of 2021 (Labour Relations) Art. 13 and Ministry of Human Resources and Emiratisation (MoHRE) Circular 267 of 2012, employers are strictly prohibited from seizing or retaining an employee\'s passport under any pretext. An employee\'s passport is personal property and retaining it constitutes an illegal labour infringement and human rights violation.';
    archetype.citation = 'UAE Federal Decree-Law No. 33 of 2021 Art. 13; MoHRE Circular No. 267 of 2012; ILO Forced Labour Convention No. 29';
    archetype.authority = 'Ministry of Human Resources and Emiratisation (MoHRE) / Dubai Police';
    archetype.url = 'https://www.mohre.gov.ae/';
    archetype.checklist = [
      'Submit a formal written request via email or WhatsApp requesting the immediate release of your passport.',
      'If the employer refuses, file an immediate labour complaint with MoHRE via the official hotline at 600-590000 or the MoHRE smart app.',
      'You can also report the document retention directly to Dubai Police (Al Ameen service at 800-4888).',
      'Employers withholding passports face administrative fines up to AED 20,000 and business file freezing.'
    ];
  }

  const resolvedCountry = targetCountry;
  const city = narrative.slots.location.city || parsed.city || null;
  const region = narrative.slots.location.region || parsed.region || null;

  // A static match has no publication or source snapshot provenance.
  const claims = [];
  const sources = [];

  return {
    id: `NCR-${archetypeKey.toUpperCase()}`,
    type: archetypeKey,
    topic: archetype.topic,
    title: archetype.title,
    verdict: archetype.verdict,
    statutoryRule: archetype.statutoryRule,
    citation: archetype.citation,
    checklist: archetype.checklist,
    authority: archetype.authority,
    url: archetype.url,
    claims,
    sources,
    evidenceStatus: 'unreviewed-research-catalog',
    country: resolvedCountry,
    region,
    city,
    narrativeAnalysis: narrative,
    mythWarning: narrative.mythWarning
  };
}
