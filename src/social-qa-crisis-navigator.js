/**
 * Social QA Crisis Navigator
 *
 * Provides actionable statutory guidance for urgent real-world newcomer crises:
 * 1. Recruiter or employer retaining passport / work permit (trafficking / EPFNA / ILO 29).
 * 2. Landlord demanding rent in cash without a receipt (RTA s. 105/109, mandatory accounting).
 * 3. Representative / consultant ghosting, fee fraud, or false job offer (IRPR s. 13.1, CICC).
 * 4. Extortion, harassment, or unlawful eviction threats (Criminal Code s. 423, RTA s. 22/24).
 * 5. Status expiration, maintained status, and pending appeal protections (IRPR s. 182/183(5), 3C Leave).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SOCIAL_CRISIS_TYPES = Object.freeze({
  PASSPORT_RETENTION: 'passport_retention',
  CASH_WITHOUT_RECEIPT: 'cash_without_receipt',
  AGENT_GHOSTING: 'agent_ghosting',
  THREATS_EXTORTION: 'threats_extortion',
  MAINTAINED_STATUS_PROTECTION: 'maintained_status_protection',
  LANDLORD_REFUSES_LEASE: 'landlord_refuses_lease',
  MISSED_DEADLINE_RELIEF: 'missed_deadline_relief'
});

export const CRISIS_PATTERNS = Object.freeze([
  {
    type: SOCIAL_CRISIS_TYPES.PASSPORT_RETENTION,
    regex: /\b(?:passport retained by recruiter|retaining (?:my )?(?:passport|work permit)|withholding (?:my )?(?:passport|work permit)|took my passport|confiscated (?:my )?(?:passport|permit)|employer kept my passport)\b/i,
    title: 'Identity Document Withholding & Recruiter Passport Retention'
  },
  {
    type: SOCIAL_CRISIS_TYPES.CASH_WITHOUT_RECEIPT,
    regex: /\b(?:pay cash without a receipt|cash without (?:a )?receipt|refuses? (?:to give |to provide )?(?:a )?receipt|demanding cash rent)\b/i,
    title: 'Undocumented Cash Payment Demand & Rent Receipt Denial'
  },
  {
    type: SOCIAL_CRISIS_TYPES.AGENT_GHOSTING,
    regex: /\b(?:(?:agent|consultant|representative)\s+(?:has\s+)?(?:stopped responding|disappeared|ghosted)|ghosted by (?:agent|consultant)|paid\b[^\n,.]*?\b(?:agent|consultant)\b[^\n,.]*?\b(?:stopped responding|disappeared)|false job offer for visa)\b/i,
    title: 'Representative Ghosting, Fee Fraud & Unresponsive Agent'
  },
  {
    type: SOCIAL_CRISIS_TYPES.THREATS_EXTORTION,
    regex: /\b(?:threatening me|threatened|the other party is threatening|landlord threatening|employer threatening|extortion|threats of deportation)\b/i,
    title: 'Extortion, Intimidation & Unlawful Eviction Harassment'
  },
  {
    type: SOCIAL_CRISIS_TYPES.MAINTAINED_STATUS_PROTECTION,
    regex: /\b(?:(?:permit|visa|status)\s+expir(?:y|es|ed)\b[^\n,.]*?\bwhile\b[^\n,.]*?\bappeal\b[^\n,.]*?\bpending|permit expiry while appeal pending|without regular status|waiting for processing|passport expires soon)\b/i,
    title: 'Status Preservation, Maintained Status & Pending Appeal Rights'
  },
  {
    type: SOCIAL_CRISIS_TYPES.LANDLORD_REFUSES_LEASE,
    regex: /\b(?:landlord refuses written lease|refuses? (?:to give |to sign |a )?written lease|no written lease)\b/i,
    title: 'Written Lease Refusal & Mandatory Standard Tenancy Agreement'
  },
  {
    type: SOCIAL_CRISIS_TYPES.MISSED_DEADLINE_RELIEF,
    regex: /\b(?:missed an important deadline|missed (?:the )?deadline|late appeal|deadline passed|file out of time)\b/i,
    title: 'Administrative Deadline Relief, Force Majeure & Status Restoration'
  }
]);

export function detectSocialCrisisScenario(question) {
  if (!question || typeof question !== 'string') return null;
  for (const item of CRISIS_PATTERNS) {
    if (item.regex.test(question)) {
      return item;
    }
  }
  return null;
}

export function resolveSocialCrisisGuidance(question, parsed = {}) {
  const safeQuestion = boundedText(question, '', 500);
  const detected = detectSocialCrisisScenario(safeQuestion);
  if (!detected) return null;

  const rawCountry = parsed.country || 'CA';
  const country = boundedText(rawCountry, 'CA', 50);
  const isCanada = country === 'CA' || country === 'Canada';
  const assessmentDate = safeIsoDate(parsed.assessmentDate, '2026-10-31');

  switch (detected.type) {
    case SOCIAL_CRISIS_TYPES.PASSPORT_RETENTION:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Criminal Code, R.S.C. 1985, c. C-46, s. 279.01; Employment Protection for Foreign Nationals Act, 2009 (EPFNA), S.O. 2009, c. 32, s. 8; ILO Forced Labour Convention No. 29'
          : 'ILO Forced Labour Convention No. 29; International Human Rights & Statutory Worker Protection Standards',
        verdict: 'Passport retention by recruiters or employers is illegal forced-labour conduct.',
        statutoryRule: isCanada
          ? 'Under Ontario EPFNA s. 8 and Canada Criminal Code s. 279.01, it is a statutory offence for any employer, recruiter, or agent to take, seize, or retain a foreign national’s passport, work permit, or immigration document. Workers have the absolute right to possession of their documents at all times.'
          : 'Under international labour standards (ILO Convention 29) and domestic criminal statutes, employers and recruiters are strictly barred from confiscating or withholding passports or legal identity credentials.',
        actionableRecourse: [
          'Submit a formal written demand for the immediate return of your passport and retain dated copies/messages.',
          isCanada ? 'Report document confiscation immediately to the Ministry of Labour (1-877-202-0008) and federal Service Canada tip line (1-866-602-9448).' : 'Report document withholding to the national labour standards inspectorate.',
          'If you face physical confinement, intimidation, or coercion, contact local police emergency services immediately.',
          isCanada ? 'Apply for a Vulnerable Worker Open Work Permit (VWOWP) under IRPR s. 207.1 to transition away from an abusive employer without losing legal status.' : 'Seek emergency legal aid assistance or consular protection from your home country embassy.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.CASH_WITHOUT_RECEIPT:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 105, 109; BC Residential Tenancy Act, [SBC 2002] c. 78, s. 26(2)'
          : 'Statutory Residential Tenancy Guidelines & Mandatory Accounting Principles',
        verdict: 'Landlords are legally required to provide written rent receipts upon request; undocumented cash payments create severe evidentiary risk.',
        statutoryRule: isCanada
          ? 'Under Ontario RTA s. 109(1) and BC RTA s. 26(2), a landlord must provide a tenant with a receipt for any payment of rent, rent deposit, or fee upon request free of charge. The receipt must state the rental unit address, tenant name, amount received, date received, and landlord details.'
          : 'Statutory tenancy frameworks obligate landlords to provide formal proof of payment upon receiving rental funds.',
        actionableRecourse: [
          'Insist on traceable payment methods such as Interac e-Transfer, bank draft, or post-dated cheques to create an undeniable paper trail.',
          'If cash is unavoidable, do not hand over money without a contemporaneously signed and dated receipt specifying the rental property address.',
          isCanada ? 'If the landlord refuses receipts, document all payment requests in writing and file Form T2 (Application About Tenant Rights) with the Landlord and Tenant Board (LTB).' : 'File a formal grievance with the residential tenancy authority for receipt withholding.',
          'Retain bank withdrawal slips, text confirmations, and witness statements proving cash handovers.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.AGENT_GHOSTING:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 91; College of Immigration and Citizenship Consultants (CICC) Act, S.C. 2019, c. 29; IRPR s. 13.1'
          : 'National Regulatory Immigration Consultant Licensing Frameworks & Professional Codes of Conduct',
        verdict: 'You have the legal right to bypass an unresponsive representative and verify your application directly with government authorities.',
        statutoryRule: isCanada
          ? 'Under IRPA s. 91 and CICC professional conduct rules, consultants are legally bound to deliver diligent representation and provide complete application records. Applicants can revoke representation at any moment without penalty.'
          : 'Authorized legal representation is always revocable by the principal applicant, who maintains direct entitlement to government application records.',
        actionableRecourse: [
          isCanada ? 'Submit an official IRCC Webform inquiry with your UCI and full biographical details to verify whether an application was genuinely filed.' : 'Contact the national immigration authority directly using your primary applicant details.',
          isCanada ? 'Immediately submit Form IMM 5476 (Cancellation of Use of a Representative) to cut off the unresponsive agent and route all official notices to your own email.' : 'File a formal notice revoking representation with the immigration department.',
          isCanada ? 'File an official disciplinary and financial misconduct complaint with the College of Immigration and Citizenship Consultants (CICC) or provincial Law Society.' : 'File a complaint with the relevant licensing board (e.g., OISC in UK, EOIR in US).',
          'Demand an itemized invoice and formal file return in writing.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.THREATS_EXTORTION:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Criminal Code, R.S.C. 1985, c. C-46, s. 423 (Intimidation), s. 346 (Extortion); Ontario Residential Tenancies Act, 2006, ss. 22, 24'
          : 'Domestic Criminal Intimidation Provisions & Emergency Tenancy Anti-Harassment Protections',
        verdict: 'Threats of deportation, illegal lockouts, and intimidation are criminal offences and void self-help remedies.',
        statutoryRule: isCanada
          ? 'Under Ontario RTA s. 22 and s. 24, landlords are strictly prohibited from harassing, coercing, threatening, or locking out tenants without a formal order from the LTB executed by the Court Enforcement Office (Sheriff). Threatening deportation or police reports to enforce civil demands violates Criminal Code s. 423 (Intimidation).'
          : 'Counterparties cannot execute self-help evictions or use threats of legal retaliation to bypass statutory dispute resolution.',
        actionableRecourse: [
          'Document every threatening interaction: preserve text messages, emails, voicemails, and date-stamped call logs.',
          'Do not self-evict: a landlord cannot legally change locks without a formal hearing and an eviction order enforced by the Sheriff.',
          'If immediate physical violence is threatened or locks are illegally changed, call local police emergency or non-emergency lines.',
          isCanada ? 'Contact the Rental Housing Enforcement Unit (RHEU: 1-888-772-9277) for immediate provincial intervention against unlawful landlord lockouts.' : 'Seek emergency injunctive relief from the tenancy tribunal or municipal housing authority.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.MAINTAINED_STATUS_PROTECTION:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 183(5) (Maintained Status), s. 182 (Restoration of Temporary Resident Status)'
          : 'Statutory Leave Continuation & Status Restoration Provisions',
        verdict: 'Applicants maintain lawful authority to remain and continue authorized activities while a timely filed extension or appeal is pending.',
        statutoryRule: isCanada
          ? 'Under IRPR s. 183(5), if a temporary resident applies for an extension of their work permit, study permit, or visitor record prior to the expiration of their existing document, their lawful status and authorization to work or study continue automatically under the same conditions until a final decision is made. If status expired within 90 days, restoration is available under IRPR s. 182.'
          : 'Timely filed extension applications trigger statutory leave continuity under immigration acts (e.g. Section 3C leave in the UK, 240-day rule in the US).',
        actionableRecourse: [
          isCanada ? 'Carry your IRCC Acknowledgement of Receipt (AoR) or interim work authorization letter as statutory proof of maintained authorization for employers, schools, and healthcare.' : 'Retain stamped filing receipts and confirmation notices as continuous proof of legal stay.',
          'Do not travel internationally while on maintained status or pending appeal, as departure terminates maintained status privileges under IRPR s. 183(5).',
          isCanada ? 'If status expired without an in-time application, apply for Restoration of Status under IRPR s. 182 within 90 days of the expiration date.' : 'Apply for immediate status restoration or formal relief within domestic statutory grace periods.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.LANDLORD_REFUSES_LEASE:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Residential Tenancies Act, 2006, S.O. 2006, c. 17, s. 12.1; Ontario Standard Form of Lease (Form 2229E)'
          : (country === 'Spain'
            ? 'Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (LAU), art. 37'
            : 'Statutory Tenancy Frameworks & Compulsory Written Lease Requirements'),
        verdict: 'Landlords cannot evade statutory tenant protections by refusing a written contract; tenants have the statutory right to compel a formal lease.',
        statutoryRule: isCanada
          ? 'Under Ontario RTA s. 12.1, for private residential tenancies entered into on or after April 30, 2018, landlords must use the Ontario Standard Lease. If the landlord refuses to provide the standard lease within 21 days of a written request, the tenant may withhold one month rent under s. 12.1(5).'
          : (country === 'Spain'
            ? 'Bajo el artículo 37 de la Ley de Arrendamientos Urbanos (LAU), las partes podrán compelerse recíprocamente a la formalización por escrito del contrato de arrendamiento con constancia de la identidad de las partes, ubicación y renta pactada.'
            : 'Tenants retain the statutory right to compel formal written lease agreements; failure of the landlord to execute in writing cannot deprive the occupant of statutory occupancy rights.'),
        actionableRecourse: [
          'Submit a formal written demand requesting execution of the official statutory lease agreement.',
          isCanada ? 'If the landlord fails to provide the standard lease within 21 days of written demand, withhold one month rent as permitted by RTA s. 12.1(5).' : 'Document all rent payments and occupancy commencement dates via bank records.',
          isCanada ? 'File Form T2 with the LTB if the landlord engages in reprisal or harassment for requesting a written lease.' : 'Assert mandatory statutory tenant protections before the municipal or judicial tenancy tribunal.'
        ]
      };

    case SOCIAL_CRISIS_TYPES.MISSED_DEADLINE_RELIEF:
      return {
        type: detected.type,
        title: detected.title,
        assessmentDate,
        authority: isCanada
          ? 'Statutory Powers Procedure Act (SPPA), R.S.O. 1990, c. S.22, s. 21.1; IRPR s. 182; Federal Courts Rules, SOR/98-106, Rule 8'
          : (country === 'Spain'
            ? 'Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas, art. 32'
            : 'Administrative Fairness Doctrine, Statutory Restoration & Extension of Time Principles'),
        verdict: 'A missed administrative deadline can be excused upon timely application for an extension of time or restoration based on exceptional circumstances.',
        statutoryRule: isCanada
          ? 'Under administrative law (SPPA s. 21.1 and Federal Courts Rule 8), tribunals and courts possess statutory discretion to extend deadlines where the applicant establishes a bona fide intention to appeal, continuing arguable merit, reasonable explanation for the delay, and absence of prejudice. For expired immigration status, a 90-day restoration window applies under IRPR s. 182.'
          : (country === 'Spain'
            ? 'Bajo el artículo 32 de la Ley 39/2015, la Administración podrá conceder de oficio o a petición de los interesados una ampliación de los plazos establecidos que no exceda de la mitad de los mismos si las circunstancias lo aconsejan y no se perjudican derechos de tercero.'
            : 'Courts and tribunals provide statutory relief and time extensions when unexpected hardship, illness, or technical impediment caused the missed deadline.'),
        actionableRecourse: [
          'Act immediately: file the substantive application or appeal along with a formal Notice of Motion for Extension of Time without delay.',
          'Compile contemporary objective evidence explaining the delay (medical certificates, official hospital records, technical IT outage timestamps).',
          isCanada ? 'For expired immigration permits, submit an application for Restoration of Status under IRPR s. 182 within 90 days of expiration.' : 'Request formal administrative extension under general administrative procedure provisions.',
          'Demonstrate that the delay was neither willful nor caused by lack of diligence, and show arguable legal merit.'
        ]
      };

    default:
      return null;
  }
}
