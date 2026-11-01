// src/myth-buster.js
// Statutory Myth-Busting & Legal Misconception Interceptor
// Intercepts dangerous legal myths and urban legends common on Reddit & Quora,
// providing immediate, authoritative statutory warnings and legal protections.

export const STATUTORY_MYTHS = [
  {
    id: 'myth_cash_job_tax_amnesty',
    pattern: /\b(?:cash\s+(?:in\s+hand|job|work)|work\s+cash|under\s+the\s+table|informal\s+work)\b.*\b(?:visitor|tourist|no\s+work\s+permit|status\s+expired|without\s+status)\b|\b(?:visitor|tourist)\b.*\b(?:cash\s+(?:in\s+hand|job|work)|work\s+cash|under\s+the\s+table)\b|\b(?:forgive|amnesty|pay\s+tax(?:es)?\s+later|cra\s+forgive|tax(?:es)?\s+next\s+year)\b.*\b(?:cash|unauthorized|illegal\s+work)\b|\b(?:cash\s+(?:in\s+hand|job|work)|work\s+cash|under\s+the\s+table)\b.*\b(?:forgive|amnesty|pay\s+tax(?:es)?\s+later|cra\s+forgive|tax(?:es)?\s+next\s+year|cra\s+so\s+no\s+problem|pay\s+tax)\b/i,
    severity: 'critical_danger',
    title: 'Myth: Working Cash Jobs on Visitor Visa Can Be Forgiven by Paying Taxes',
    statutoryRule: 'Under IRPA s. 30 and s. 196 (and US INA s. 212(a)(9)), visitor status strictly prohibits engaging in unauthorized domestic employment. Paying income taxes to the CRA or IRS does NOT confer legal immigration status or grant retroactive amnesty. Unauthorized employment is a direct status violation that can trigger Section 44 removal proceedings and a mandatory 5-year exclusion ban for misrepresentation.',
    citation: 'Immigration and Refugee Protection Act (IRPA) s. 30, s. 40, s. 44; IRPR s. 196; 8 U.S. Code § 1182',
    verdict: 'FALSE & DANGEROUS: Cash work on a visitor visa is illegal unauthorized employment. Paying taxes later does NOT grant immigration amnesty and puts you at risk of immediate deportation and a 5-year ban.',
    actionableRecourse: [
      'Cease unauthorized work immediately to prevent compounding status violations.',
      'Maintain valid temporary resident visitor status by applying for an extension before your current 6-month stay expires.',
      'Explore legitimate economic work permit pathways (such as obtaining a genuine LMIA-supported employer offer or provincial nomination) before performing any work.'
    ]
  },
  {
    id: 'myth_landlord_self_help_lockout',
    pattern: /\b(?:landlord|owner)\b.*\b(?:changed\s+locks?|locked\s+me\s+out|lockout|threw\s+(?:my\s+)?(?:stuff|things|clothes|belongings)\s+out|kicked\s+me\s+out\s+without\s+notice)\b|\b(?:can\s+i\s+break\s+(?:the\s+)?(?:door|window)|break\s+in\s+to\s+my\s+apartment)\b/i,
    severity: 'emergency_housing',
    title: 'Myth: A Landlord Can Evict a Tenant or Change Locks Without a Court Order',
    statutoryRule: 'Under Ontario Residential Tenancies Act 2006 (RTA) s. 24 (and equivalent state/provincial tenancy laws), only a Court Enforcement Officer (Sheriff) acting pursuant to an official Board Eviction Order can legally evict a tenant. Landlords changing locks without an order are committing an unlawful lockout. Withholding personal identification, laptops, or medication is unlawful.',
    citation: 'Residential Tenancies Act 2006 (Ontario) s. 24, s. 116; Criminal Code s. 446; Tenant Protection Act',
    verdict: 'FALSE & ILLEGAL: A landlord CANNOT legally lock you out or change door locks without an official Sheriff eviction order. Doing so is an illegal self-help eviction.',
    actionableRecourse: [
      'Call the Rental Housing Enforcement Unit (RHEU) immediately at 1-888-772-9277 (toll-free). Compliance officers can contact the landlord directly and order immediate lock re-keying.',
      'Do NOT attempt to break windows or damage property, as this creates civil and criminal liabilities.',
      'Contact local police non-emergency and state that you are the victim of an "unlawful self-help eviction under RTA s. 24" requiring peaceful access to your essential passport and medications.',
      'File an urgent Form T2 (Application about Tenant Rights) with the Landlord and Tenant Board (LTB) requesting emergency re-entry orders and statutory financial compensation.'
    ]
  },
  {
    id: 'myth_lmia_recruitment_fees',
    pattern: /\b(?:pay(?:ing)?|bought|buy(?:ing)?|charged?|demand(?:ed|ing)?)\b.*\b(?:\$?\d{1,3}(?:,\d{3})+|\$?\d+k)\b.*\b(?:lmia|sponsorship|job\s+offer)\b|\b(?:employer|boss|agent)\b.*\b(?:asking\s+for\s+money|deduct(?:ing)?\s+from\s+salary|charges?\s+me)\b.*\b(?:lmia|work\s+permit)\b/i,
    severity: 'critical_exploitation',
    title: 'Myth: Employers or Agents Can Legally Charge Workers for LMIA or Sponsorship',
    statutoryRule: 'Under IRPR s. 200(1)(c) and provincial worker protection statutes (e.g. Ontario EPFNA s. 7), employers and recruiters are strictly prohibited from charging foreign workers recruitment fees or LMIA application costs directly or indirectly. Deducting LMIA or immigration fees from wages is wage theft and an immigration offense.',
    citation: 'IRPR SOR/2002-227 s. 200(1)(c), s. 209.2; Employment Protection for Foreign Nationals Act (EPFNA) s. 7',
    verdict: 'FALSE & CRIMINAL: Employers and recruiters cannot legally charge you any fees for an LMIA, job offer, or sponsorship. Forcing you to pay is illegal extortion.',
    actionableRecourse: [
      'Do NOT pay any money for an LMIA or sponsorship offer. Retain all wire transfer records, text messages, and communications as evidence.',
      'If you are currently working for an abusive or exploitative employer who demanded money, apply immediately for a fee-exempt Vulnerable Worker Open Work Permit (VWOWP) under IRPR s. 207.1.',
      'Submit a confidential employer non-compliance tip to Service Canada and the provincial Ministry of Labour.'
    ]
  },
  {
    id: 'myth_travel_on_maintained_status',
    pattern: /\b(?:travel(?:ling)?|leave|leaving|trip|flight|vacation)\b.*\b(?:maintained|implied)\s+status\b|\b(?:maintained|implied)\s+status\b.*\b(?:can\s+i\s+travel|can\s+i\s+leave|come\s+back\s+and\s+work)\b/i,
    severity: 'high_status_risk',
    title: 'Myth: You Can Leave the Country and Return to Work on Maintained (Implied) Status',
    statutoryRule: 'Under IRPR s. 183(5), maintained status (formerly implied status) that permits continued working while waiting for a permit decision is legally conditional on remaining physically inside Canada. Leaving Canada terminates the authorization to work immediately upon departure.',
    citation: 'Immigration and Refugee Protection Regulations (IRPR) s. 183(5); IRCC Operational Instructions on Maintained Status',
    verdict: 'PARTIAL TRUTH / HIGH RISK: You can travel abroad, but leaving Canada AUTOMATICALLY TERMINATES your maintained work authorization. You cannot work upon return until your new work permit is approved.',
    actionableRecourse: [
      'If your job requires continuous legal working authority, do NOT leave Canada until your new work permit is formally approved and in hand.',
      'If you must leave Canada for an emergency, you will require a valid TRV or eTA to re-enter, and you will re-enter strictly as a visitor without permission to work until the new permit arrives.'
    ]
  },
  {
    id: 'myth_direct_visitor_to_pr',
    pattern: /\b(?:convert|change|switch)\b.*\b(?:visitor|tourist)\b.*\b(?:directly\s+to\s+pr|to\s+pr|into\s+pr)\b|\b(?:visitor\s+visa|tourist\s+visa)\b.*\b(?:stay\s+6\s+months\s+and\s+get\s+pr|automatic\s+pr)\b/i,
    severity: 'medium_misconception',
    title: 'Myth: A Visitor Visa Automatically Converts to Permanent Residency After 6 Months',
    statutoryRule: 'A visitor visa (Temporary Resident Visa) grants temporary entry for tourism or family visits only. There is no statutory mechanism to "convert" visitor status directly into permanent residence simply through the passage of time. Permanent residence requires qualifying independently under an established economic, family, or humanitarian stream.',
    citation: 'IRPA SC 2001 c. 27 s. 12, s. 22; IRPR s. 179',
    verdict: 'FALSE: A visitor visa never automatically converts into permanent residence. You must apply separately through Express Entry, PNP, or Family Sponsorship.',
    actionableRecourse: [
      'Assess your eligibility under the Express Entry Comprehensive Ranking System (CRS) or Provincial Nominee Programs (PNP).',
      'If married or in a common-law relationship with a Canadian citizen or PR, explore Spousal Sponsorship inside Canada (Inland Spousal Class with SOWP eligibility).'
    ]
  },
  {
    id: 'myth_landlord_no_pets_large_deposit',
    pattern: /\b(?:landlord|lease)\b.*\b(?:no\s+pets?|pet\s+ban|forbid\s+pets?)\b|\b(?:demand(?:ed|ing)?|require[ds]?)\b.*\b(?:\d+\s+months?\s+(?:rent|deposit|advance)|6\s+months?\s+deposit|year\s+upfront)\b/i,
    severity: 'housing_rights',
    title: 'Myth: Landlords Can Demand 6-12 Months Upfront Deposit or Enforce "No Pets" Clauses',
    statutoryRule: 'Under Ontario Residential Tenancies Act 2006 (RTA) s. 106, a landlord can legally collect ONLY a rent deposit equal to one rent period (typically last month\'s rent) plus a refundable key deposit not exceeding replacement cost. Demanding 6-12 months advance is unlawful. Under RTA s. 14, "no pets" provisions in tenancy agreements are legally void.',
    citation: 'Residential Tenancies Act 2006 (Ontario) s. 14, s. 106; Corvers v. Bumbia (2014 ONSC 985)',
    verdict: 'FALSE: Landlords cannot legally require more than first and last month\'s rent, and "no pets" clauses in Ontario leases are legally void and unenforceable.',
    actionableRecourse: [
      'Do not pay unlawful advance deposits. If you voluntarily offered advance rent, the landlord may accept, but they cannot legally mandate it as a condition of tenancy.',
      'A landlord cannot evict you for having a pet unless the animal causes severe allergic reactions, substantial damage, or dangerous disturbance to other building residents.'
    ]
  },
  {
    id: 'myth_police_deport_abuse_victims',
    pattern: /\b(?:police|report)\b.*\b(?:deport\s+me|call\s+cbsa|call\s+ice)\b.*\b(?:domestic\s+violence|abuse|abusive\s+partner|victim)\b|\b(?:no\s+status|undocumented)\b.*\b(?:afraid\s+to\s+call\s+police|call\s+911)\b/i,
    severity: 'critical_safety',
    title: 'Myth: Reporting Domestic Abuse or Crimes to Police Will Cause Immediate Deportation',
    statutoryRule: 'Emergency services (911, domestic violence crisis shelters, and victim support services) provide immediate life-saving protection regardless of immigration status. IRCC provides dedicated statutory protections, including fee-exempt Temporary Resident Permits (TRPs) and Open Work Permits for victims of family violence under IRPR s. 207.1.',
    citation: 'IRPR SOR/2002-227 s. 207.1; IRPA s. 24; Victims of Family Violence Program Guidelines',
    verdict: 'FALSE & CRITICAL SAFETY: Police and emergency shelters prioritize your physical safety. Victims of abuse have statutory rights to emergency shelter and independent legal work permits.',
    actionableRecourse: [
      'If you are in immediate danger, call 911 immediately. Emergency intervention takes precedence over status inquiries.',
      'Contact the Assaulted Women\'s Helpline (1-866-863-0511) or your local victim crisis shelter for free, confidential, safe housing.',
      'Apply for an expedited fee-exempt Temporary Resident Permit (TRP) and Open Work Permit for victims of family violence, providing independent legal status without relying on an abusive sponsor.'
    ]
  },
  {
    id: 'myth_employer_passport_retention',
    pattern: /\b(?:employer|boss|company)\b.*\b(?:took|withheld|holding|hold(?:s|ing)?|keep(?:ing)?|confiscat(?:ed?|ing))\b.*\b(?:passport|work\s+permit|visa\s+document|id\s+card)\b/i,
    severity: 'critical_criminal',
    title: 'Myth: Employers Have the Right to Retain an Employee\'s Passport or Official ID',
    statutoryRule: 'Under Canadian and international law, an individual\'s passport remains the property of the issuing government and cannot be lawfully confiscated or held by an employer. Withholding passports or identity documents is an explicit indicator of human trafficking and forced labour under Criminal Code s. 279.011 and IRPA s. 124.',
    citation: 'Criminal Code RSC 1985 c. C-46 s. 279.011; IRPA SC 2001 c. 27 s. 124; ILO Forced Labour Convention',
    verdict: 'CRIMINAL OFFENSE: An employer CANNOT legally retain or confiscate your passport or legal documents under any circumstances. Doing so is an offense.',
    actionableRecourse: [
      'Demand the immediate return of your passport in writing (email or text message) to create an evidentiary paper trail.',
      'If the employer refuses, file an immediate police report for unlawful detention of identity documents and potential human trafficking indicators.',
      'Apply immediately for a fee-exempt Vulnerable Worker Open Work Permit (VWOWP) to leave the abusive employer while maintaining legal status.'
    ]
  },
  {
    id: 'myth_schengen_border_hop_reset',
    pattern: /\b(?:reset|restart)\b.*\b(?:90\s*days?|schengen)\b.*\b(?:cross(?:ing)?\s+border|exit\s+to\s+france|switzerland|neighbouring\s+country)\b|\b(?:schengen\s+visa|tourist\s+visa)\b.*\b(?:hop\s+countries\s+to\s+reset|reset\s+clock)\b/i,
    severity: 'high_status_risk',
    title: 'Myth: Crossing Into Another Schengen Country Resets the 90-Day Travel Clock',
    statutoryRule: 'Under Schengen Borders Code Regulation (EU) 2016/399 Art. 6, third-country nationals are permitted to stay for a maximum of 90 days within ANY rolling 180-day window across the ENTIRE Schengen zone combined. Moving between Schengen states (e.g. Germany to France or Switzerland) does NOT reset the clock.',
    citation: 'Regulation (EU) 2016/399 (Schengen Borders Code) Art. 6; Entry/Exit System (EES) Regulations',
    verdict: 'FALSE: Traveling between Schengen countries does NOT reset your 90-day limit. The 90-day allowance applies across all Schengen countries combined within any 180-day period.',
    actionableRecourse: [
      'Use the European Commission\'s official Schengen Short-Stay Calculator to determine your exact remaining days.',
      'You must depart the Schengen area entirely (e.g. to the UK, Ireland, or your home country) before your 90-day limit expires to avoid automatic entry bans and fines recorded in the Schengen Information System (SIS).'
    ]
  }
];

export function detectLegalMyth(query) {
  if (!query || typeof query !== 'string') return null;
  const cleanQ = query.trim();

  for (const myth of STATUTORY_MYTHS) {
    if (myth.pattern.test(cleanQ)) {
      return myth;
    }
  }

  return null;
}
