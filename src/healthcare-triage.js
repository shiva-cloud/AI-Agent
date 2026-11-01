// src/healthcare-triage.js
// Healthcare triage navigator, emergency refill bridge, and drug equivalence engine
// Pure ES module with zero npm dependencies.

export const HEALTHCARE_TRIAGE_MAP = {
  chronic_rx: {
    level: 'RETAIL COMMUNITY PHARMACY',
    badge: 'badge-compliant',
    destination: 'Visit Licensed Community Pharmacy (Shoppers, Rexall, Boots, Chemist Warehouse)',
    desc: 'Do not go to the ER or wait months for a family physician. Licensed community pharmacists possess statutory authority under the Ontario Pharmacy Act Schedule 1 (and UK NHS Community Emergency Supply) to dispense an emergency bridge supply of essential chronic medication upon inspecting your foreign prescription and original packaging.',
    cite: 'Pharmacy Act, 1991 (Ontario) / NHS Emergency Supply Regulations / PBS Emergency Provision'
  },
  mild_illness: {
    level: 'WALK-IN CLINIC / TELEHEALTH',
    badge: 'badge-compliant',
    destination: 'Walk-In Medical Clinic or Call Health811 / NHS 111',
    desc: 'For common infections, cough, earache, or minor rashes, walk-in clinics provide same-day evaluation without requiring a permanent family doctor. Call Health811 (Ontario) or NHS 111 (UK) for free 24/7 symptom screening by a Registered Nurse.',
    cite: 'Ministry of Health Walk-in Guidelines / NHS 111 Service Standards'
  },
  moderate_injury: {
    level: 'HOSPITAL URGENT CARE CENTRE (UCC)',
    badge: 'badge-warn',
    destination: 'Urgent Care Centre (Not Emergency Room)',
    desc: 'Urgent Care Centres treat non-life-threatening emergencies such as sprains, simple bone fractures, and cuts requiring stitches. They have on-site X-ray and diagnostic ultrasound with significantly lower wait times (1–3 hours vs 6–10 hours at ERs).',
    cite: 'Ontario Hospital Association Urgent Care Protocols / NHS Urgent Treatment Centres'
  },
  emergency_life: {
    level: 'EMERGENCY ROOM (ER) / CALL 911 / 999',
    badge: 'badge-danger',
    destination: 'Hospital Emergency Department or Call 911 (North America) / 999 (UK) / 000 (Australia)',
    desc: 'For chest pain, sudden numbness/paralysis, severe breathing distress, head trauma with loss of consciousness, or uncontrollable bleeding, go immediately to the nearest Emergency Department. ERs cannot deny care based on immigration status.',
    cite: 'Emergency Medical Treatment & Hospital Care Mandate / Public Hospitals Act'
  },
  uninsured_primary: {
    level: 'COMMUNITY HEALTH CENTRE (CHC)',
    badge: 'badge-compliant',
    destination: 'Community Health Centre (CHC) - $0 Co-Pay',
    desc: 'Community Health Centres receive dedicated provincial funding to provide comprehensive primary healthcare, prenatal care, and basic diagnostics to uninsured individuals and newcomers without provincial health cards at $0 cost.',
    cite: 'Ontario Ministry of Health CHC Operational Directives'
  },
  family_doctor: {
    level: 'PROVINCIAL / NATIONAL WAITLIST REGISTRY',
    badge: 'badge-warn',
    destination: 'Register on Health Care Connect (Ontario) / Health Connect Registry (BC)',
    desc: 'Finding a permanent family doctor takes time. Register on provincial waitlists immediately upon obtaining your health card. Meanwhile, establish continuity of care by using the same local walk-in clinic for your medical records.',
    cite: 'Health Care Connect (Ontario Ministry of Health)'
  }
};

export const COMMON_DRUG_EQUIVALENCES = {
  glucophage: { generic: 'metformin', drugClass: 'Antidiabetic (Type 2 Diabetes)', isChronic: true },
  lipitor: { generic: 'atorvastatin', drugClass: 'Statin / Cholesterol', isChronic: true },
  synthroid: { generic: 'levothyroxine', drugClass: 'Thyroid Hormone', isChronic: true },
  norvasc: { generic: 'amlodipine', drugClass: 'Calcium Channel Blocker (Hypertension)', isChronic: true },
  ventolin: { generic: 'salbutamol', drugClass: 'Short-acting Beta Agonist (Asthma)', isChronic: true },
  losec: { generic: 'omeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid)', isChronic: true },
  prilosec: { generic: 'omeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid)', isChronic: true },
  zoloft: { generic: 'sertraline', drugClass: 'SSRI Antidepressant', isChronic: true },
  nexium: { generic: 'esomeprazole', drugClass: 'Proton Pump Inhibitor (GERD / Acid)', isChronic: true },
  crestor: { generic: 'rosuvastatin', drugClass: 'Statin / Cholesterol', isChronic: true }
};

/**
 * Triages health condition to appropriate destination level
 */
export function triageHealthcareNeed(symptomKey = 'chronic_rx') {
  const result = HEALTHCARE_TRIAGE_MAP[symptomKey] || HEALTHCARE_TRIAGE_MAP.chronic_rx;
  return {
    symptomKey,
    ...result
  };
}

/**
 * Maps common international brand names to domestic generic drug names
 */
export function mapDrugGeneric(brandName = '') {
  const clean = String(brandName).toLowerCase().trim();
  const match = COMMON_DRUG_EQUIVALENCES[clean];
  if (match) {
    return {
      found: true,
      brandName: clean,
      ...match,
      pharmacistRefillRule: 'Under Ontario O. Reg. 202/94 s.34 and UK/Australian emergency supply regulations, community pharmacists can dispense an emergency 30-day bridge supply for essential chronic maintenance medications.'
    };
  }
  return {
    found: false,
    brandName: clean,
    generic: null,
    drugClass: 'Unknown / Unmapped',
    isChronic: false,
    pharmacistRefillRule: 'Present original prescription bottle or packaging to a licensed community pharmacist to verify generic bioequivalence.'
  };
}
