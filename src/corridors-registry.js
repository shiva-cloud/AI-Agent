// src/corridors-registry.js
// Single source of truth for all 13 supported global immigration & settlement corridors.

import { factValue } from './kb-facts.js';
import { boundedText } from './text-input.js';


export const SUPPORTED_CORRIDORS = {
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: '$',
    ministry: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    healthService: 'Provincial Universal Healthcare (OHIP, MSP, AHCIP)',
    taxId: 'Social Insurance Number (SIN)',
    workPrograms: ['Express Entry', 'PNP', 'PGWP', 'BOWP', 'TFWP', 'C11', 'SUV'],
    prSchemes: ['Federal Skilled Worker (FSW)', 'Canadian Experience Class (CEC)', 'Provincial Nominee (PNP)'],
    studyPrograms: ['Study Permit', 'PAL (Provincial Attestation Letter)', 'Co-op Work Permit'],
    housingLaw: 'Provincial Residential Tenancies Acts (e.g. Ontario RTA, BC RTA)',
    officialLanguages: ['English', 'French'],
    tierADomains: ['canada.ca', 'ontario.ca', 'gov.bc.ca', 'tribunalsontario.ca']
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    ministry: 'United States Citizenship and Immigration Services (USCIS) & Dept of State',
    healthService: 'Private / ACA Marketplace & Employer-Sponsored Health Plans',
    taxId: 'Social Security Number (SSN) / ITIN',
    workPrograms: ['H-1B Specialty Occupation', 'L-1 Intracompany', 'O-1 Extraordinary Ability', 'TN', 'E-2'],
    prSchemes: ['EB-1 Extraordinary/Multinational', 'EB-2 National Interest Waiver (NIW)', 'EB-3 Skilled', 'EB-5 Investor'],
    studyPrograms: ['F-1 Academic Student', 'STEM OPT 24-Month Extension', 'J-1 Exchange Visitor'],
    housingLaw: 'State-Level Landlord-Tenant Codes (e.g. California Civil Code, NY RPL)',
    officialLanguages: ['English'],
    tierADomains: ['uscis.gov', 'travel.state.gov', 'irs.gov', 'dol.gov']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    ministry: 'UK Visas and Immigration (Home Office)',
    healthService: 'National Health Service (NHS) via Immigration Health Surcharge (IHS)',
    taxId: 'National Insurance (NI) Number',
    get workPrograms() { return [`Skilled Worker Visa (£${factValue('uk.skilledWorker.generalThresholdGbp').toLocaleString('en-US')} threshold)`, 'Global Talent', 'Innovator Founder', 'Scale-up']; },
    prSchemes: ['Indefinite Leave to Remain (ILR 5-Year Pathway)', 'Settled Status'],
    studyPrograms: ['Student Visa (CAS required)', 'Graduate Route (2/3 years unsponsored)'],
    housingLaw: 'Housing Act 1988 (Assured Shorthold Tenancy AST) & Renters Rights Bill',
    officialLanguages: ['English'],
    tierADomains: ['gov.uk', 'legislation.gov.uk', 'nhs.uk']
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: '$',
    ministry: 'Department of Home Affairs',
    healthService: 'Medicare (RHCA Reciprocal Enrolment for eligible visitors)',
    taxId: 'Tax File Number (TFN) / Superannuation',
    workPrograms: ['Subclass 482 Temporary Skill Shortage', 'Subclass 485 Temporary Graduate', 'Subclass 186 ENS'],
    prSchemes: ['Subclass 189 Skilled Independent', 'Subclass 190 Skilled Nominated', 'Subclass 491 Regional'],
    studyPrograms: ['Subclass 500 Student Visa', 'Genuine Student (GS) Criterion'],
    housingLaw: 'State Residential Tenancies Acts (e.g. NSW RTA 2010, Victoria RTA 1997)',
    officialLanguages: ['English'],
    tierADomains: ['homeaffairs.gov.au', 'ato.gov.au', 'servicesaustralia.gov.au', 'fairwork.gov.au']
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    ministry: 'Bundesamt für Migration und Flüchtlinge (BAMF) & Ausländerbehörde',
    healthService: 'Gesetzliche Krankenversicherung (GKV public statutory insurance)',
    taxId: 'Steueridentifikationsnummer (Steuer-ID) & Sozialversicherungsnummer',
    workPrograms: ['Chancenkarte (Opportunity Card 6-point grid)', 'EU Blue Card (€45,300/€50,700)', 'Fachkräfte'],
    prSchemes: ['Niederlassungserlaubnis (Permanent Settlement 21/27 months for Blue Card)', 'StAG Modernized Citizenship'],
    studyPrograms: ['Studentenvisum (Blocked Account €11,904)', '18-Month Post-Study Jobseeker Permit'],
    housingLaw: 'Bürgerliches Gesetzbuch (BGB) §§ 535-577 & Mietpreisbremse (Rent Brake)',
    officialLanguages: ['German'],
    tierADomains: ['make-it-in-germany.com', 'bamf.de', 'gesetze-im-internet.de', 'bundesfinanzministerium.de']
  },
  UAE: {
    code: 'UAE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'AED',
    ministry: 'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) & MoHRE',
    healthService: 'Mandatory Health Insurance (DHA / DoH Abu Dhabi)',
    taxId: 'Emirates ID (EID) - Zero Personal Income Tax Jurisdiction',
    workPrograms: ['Standard MoHRE Mainland Work Permit', 'Freezone Employment (DIFC, ADGM, DMCC)'],
    prSchemes: ['10-Year Golden Visa (AED 2M Real Estate/Executive)', '5-Year Green Visa (Freelancer/Self-Employed)'],
    studyPrograms: ['Student Residence Visa (Renewable 1-Year or 5-Year Outstanding Student)'],
    housingLaw: 'RERA Rental Index (Decree No. 43 of 2013) & Ejari Lease Registration',
    officialLanguages: ['Arabic', 'English'],
    tierADomains: ['icp.gov.ae', 'mohre.gov.ae', 'dubailand.gov.ae']
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    currencySymbol: '$',
    ministry: 'Immigration New Zealand (INZ)',
    healthService: 'Public Health Service (Eligible for 2+ year work permit holders)',
    taxId: 'Inland Revenue Department (IRD) Number',
    workPrograms: ['Accredited Employer Work Visa (AEWV)', 'Post-Study Work Visa', 'Specific Purpose'],
    prSchemes: ['6-Point Skilled Migrant Category (SMC)', 'Green List Fast-Track & Work to Residence'],
    studyPrograms: ['Fee Paying Student Visa', 'Pathway Student Visa'],
    housingLaw: 'Residential Tenancies Act 1986 & Tenancy Services Bond Centre',
    officialLanguages: ['English', 'Māori'],
    tierADomains: ['immigration.govt.nz', 'ird.govt.nz', 'tenancy.govt.nz']
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    currencySymbol: '€',
    ministry: 'Immigration Service Delivery (ISD) & Dept of Enterprise, Trade and Employment (DETE)',
    healthService: 'Health Service Executive (HSE) & Voluntary Health Insurance',
    taxId: 'Personal Public Service Number (PPSN) & Revenue MyEnquiries',
    workPrograms: ['Critical Skills Employment Permit (CSEP)', 'General Employment Permit (GEP)'],
    prSchemes: ['Stamp 4 Residency (after 21 months on CSEP)', 'Long-Term Residency (5 years)'],
    studyPrograms: ['Stamp 2 Student Permission (20 hrs work)', 'Third Level Graduate Scheme (Stamp 1G)'],
    housingLaw: 'Residential Tenancies Act 2004 & Residential Tenancies Board (RTB) Rent Pressure Zones (RPZ)',
    officialLanguages: ['English', 'Irish'],
    tierADomains: ['irishimmigration.ie', 'enterprise.gov.ie', 'revenue.ie', 'rtb.ie']
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    ministry: 'Ministry of Manpower (MOM) & Immigration and Checkpoints Authority (ICA)',
    healthService: 'Private MediShield / Employer Medical Benefit (CPF restricted to Citizens/PR)',
    taxId: 'Foreign Identification Number (FIN) & Singpass National Digital Identity',
    workPrograms: ['Employment Pass (COMPASS 40-point rubric, S$5,600 threshold)', 'S-Pass (S$3,150 + Levy)', 'ONE Pass'],
    prSchemes: ['Professionals, Technical Personnel and Skilled Workers (PTS) Scheme'],
    studyPrograms: ["Student's Pass", 'Work Holiday Programme'],
    housingLaw: 'Urban Redevelopment Authority (URA) Private Minimum 3-Month Lease & HDB Subletting Rules',
    officialLanguages: ['English', 'Malay', 'Mandarin', 'Tamil'],
    tierADomains: ['mom.gov.sg', 'ica.gov.sg', 'iras.gov.sg', 'ura.gov.sg']
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    ministry: "Ministère de l'Intérieur & Direction Générale des Étrangers en France (DGEF)",
    healthService: 'Sécurité Sociale (CPAM) & Carte Vitale via Ameli.fr',
    taxId: 'Numéro d’Inscription au Répertoire (NIR / Social Security Number)',
    workPrograms: ['Passeport Talent (2x SMIC threshold)', 'French Tech Visa', 'Salarié en Mission'],
    prSchemes: ['Carte de Résident (10-Year Permanent Residence after 5 years)', 'EU Long-Term Resident'],
    studyPrograms: ['VLS-TS Étudiant (Long-Stay Student Visa)', 'Autorisation Provisoire de Séjour (APS) / Recherche d’emploi'],
    housingLaw: "Loi ALUR (Encadrement des Loyers), 1-Month Deposit Cap & VISALE State Guarantor Scheme",
    officialLanguages: ['French'],
    tierADomains: ['service-public.fr', 'administration-etrangers-en-france.interieur.gouv.fr', 'ameli.fr']
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    currencySymbol: '€',
    ministry: 'Immigratie- en Naturalisatiedienst (IND)',
    healthService: 'Mandatory Basisverzekering (Basic health insurance purchased within 4 months)',
    taxId: 'Burgerservicenummer (BSN) obtained via Gemeente Registration & DigiD',
    workPrograms: ['Kennismigrant (Highly Skilled Migrant)', 'European Blue Card', 'Intra-Corporate Transferee'],
    prSchemes: ['Permanent Residence (Verblijfsvergunning voor onbepaalde tijd after 5 years + Inburgering exam)'],
    studyPrograms: ['Residence Permit for Study', 'Zoekjaar (Orientation Year for Highly Educated 1-Year Jobseeker)'],
    housingLaw: 'Woningwaarderingsstelsel (Point System) Rent Control & Huurcommissie Disputes',
    officialLanguages: ['Dutch', 'English (widely spoken in business)'],
    tierADomains: ['ind.nl', 'belastingdienst.nl', 'government.nl', 'huurcommissie.nl']
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    currencySymbol: 'kr',
    ministry: 'Migrationsverket (Swedish Migration Agency)',
    healthService: 'Försäkringskassan Universal Social Insurance & Regional Healthcare',
    taxId: 'Personnummer (12-Digit Identity Number issued by Skatteverket) & BankID',
    workPrograms: ['Work Permit under Kollektivavtal Terms (Minimum SEK 28,480 / 80% median wage)', 'EU Blue Card'],
    prSchemes: ['Permanent Uppehållstillstånd (Permanent Residence after 4 years on work permit)'],
    studyPrograms: ['Residence Permit for Higher Education', '12-Month Post-Study Jobseeker Extension'],
    housingLaw: 'Hyreslagen (Rent Act), Förstahand (Direct Contract) vs Andrahand (Sublet) & Hyresnämnden Tribunal',
    officialLanguages: ['Swedish'],
    tierADomains: ['migrationsverket.se', 'skatteverket.se', 'forsakringskassan.se']
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    ministry: 'Ministerio de Inclusión, Seguridad Social y Migraciones & UGE-CE (Unidad de Grandes Empresas)',
    healthService: 'Sistema Nacional de Salud (SNS) via Tarjeta Sanitaria Individual',
    taxId: 'Número de Identidad de Extranjero (NIE) & Tarjeta de Identidad de Extranjero (TIE)',
    workPrograms: ['Ley de Startups Digital Nomad Visa (200% SMI = €2,646/mo)', 'UGE-CE Highly Skilled Professional (PAC)'],
    prSchemes: ['Residencia de Larga Duración (5-Year Continuous Legal Stay)', 'Beckham Law 24% Flat Expatriate Tax'],
    studyPrograms: ['Estancia por Estudios', '1-Year Jobseeker Permit after Higher Education'],
    housingLaw: 'Ley de Arrendamientos Urbanos (LAU 29/1994 - 5-Year Leases & 1-Month Fianza Escrow)',
    officialLanguages: ['Spanish'],
    tierADomains: ['inclusion.gob.es', 'sede.policia.gob.es', 'agenciatributaria.gob.es']
  }
};

export function getCorridor(codeOrCountry) {
  if (!codeOrCountry) return null;
  const upper = boundedText(codeOrCountry, '', 100).trim().toUpperCase();
  if (SUPPORTED_CORRIDORS[upper]) return SUPPORTED_CORRIDORS[upper];
  
  const byName = Object.values(SUPPORTED_CORRIDORS).find(c => 
    c.name.toUpperCase() === upper ||
    c.name.toUpperCase().includes(upper) ||
    upper.includes(c.name.toUpperCase())
  );
  return byName || null;
}

export function listSupportedCorridorCodes() {
  return Object.keys(SUPPORTED_CORRIDORS);
}
