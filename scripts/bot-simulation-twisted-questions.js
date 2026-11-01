

// Conversational & Twisted Bot Simulation Scenarios (Multi-turn conversational chains & complex equations)
export const botConversationalChains = [
  // ── CHAIN 1: High-Risk Tenancy & Eviction Dispute ─────────────────────────
  {
    chain: 'Tenancy Dispute',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-TEN-01',
        q: 'My landlord in Toronto gave me an N12 notice saying his son wants the apartment. Is he legally required to pay me 1 month rent compensation before the move-out date?',
        city: 'Toronto',
        intentExpected: 'housing'
      },
      {
        botTurn: 2,
        id: 'BOT-TEN-02',
        q: 'What if the landlord claims he does not need to pay compensation because he gave me 90 days notice instead of 60 days on the N12 in Toronto?',
        city: 'Toronto',
        intentExpected: 'housing'
      },
      {
        botTurn: 3,
        id: 'BOT-TEN-03',
        q: 'If the son never moves in and the landlord re-rents the apartment on Facebook Marketplace 3 months later, how much compensation can the LTB award under Form T5 bad faith eviction in Toronto?',
        city: 'Toronto',
        intentExpected: 'housing'
      },
      {
        botTurn: 4,
        id: 'BOT-TEN-04',
        q: 'Can the landlord lock me out by changing the door locks without a formal eviction order from the court sheriff in Brampton?',
        city: 'Brampton',
        intentExpected: 'housing'
      }
    ]
  },

  // ── CHAIN 2: Rent Control Exemption & Rent Increase Guidelines ─────────────
  {
    chain: 'Rent Increase Rules',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-RNT-01',
        q: 'My condo in Mississauga was first occupied for residential living in 2016. Is the landlord legally allowed to raise rent by 10% this year?',
        city: 'Mississauga',
        intentExpected: 'housing'
      },
      {
        botTurn: 2,
        id: 'BOT-RNT-02',
        q: 'What if the rental apartment was newly built and first occupied in December 2020? Does the 2.5% Ontario rent increase guideline cap still apply in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'housing'
      },
      {
        botTurn: 3,
        id: 'BOT-RNT-03',
        q: 'How many days of advance written notice on official Form N1 or N2 must a landlord provide prior to any rent increase taking effect in Toronto?',
        city: 'Toronto',
        intentExpected: 'housing'
      },
      {
        botTurn: 4,
        id: 'BOT-RNT-04',
        q: 'Can an Ontario landlord demand 6 months of rent paid upfront in advance as a mandatory condition for approving my tenancy in Toronto?',
        city: 'Toronto',
        intentExpected: 'housing'
      }
    ]
  },

  // ── CHAIN 3: Winter Heating Bylaws & Landlord Entry Privacy ────────────────
  {
    chain: 'Tenant Privacy & Living Standards',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-HTG-01',
        q: 'My landlord in Brampton entered my rented apartment while I was at work without giving 24 hours written notice. Is that legal under Ontario law?',
        city: 'Brampton',
        intentExpected: 'housing'
      },
      {
        botTurn: 2,
        id: 'BOT-HTG-02',
        q: 'The rental agreement has a strict clause stating no pets allowed. Is this no-pet clause legally enforceable under section 14 of the Residential Tenancies Act in Toronto?',
        city: 'Toronto',
        intentExpected: 'housing'
      },
      {
        botTurn: 3,
        id: 'BOT-HTG-03',
        q: 'The apartment temperature is 18 degrees Celsius in late October in Brampton. Does municipal bylaw 56-2008 require landlords to maintain minimum 20 degrees Celsius heat?',
        city: 'Brampton',
        intentExpected: 'housing'
      },
      {
        botTurn: 4,
        id: 'BOT-HTG-04',
        q: 'What legal action can a tenant take with the Landlord and Tenant Board LTB using Form T6 if the landlord refuses to repair the heating in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'housing'
      }
    ]
  },

  // ── CHAIN 4: Express Entry CRS Points Multi-Factor Equations ───────────────
  {
    chain: 'CRS Points & Work Equations',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-CRS-01',
        q: 'I have 3 years of foreign software engineer experience in India and 1 year of skilled work in Toronto. How many skill transferability bonus CRS points do I get for Express Entry?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 2,
        id: 'BOT-CRS-02',
        q: 'How many points are deducted each year for candidate age after reaching 30 years old in the Express Entry Comprehensive Ranking System in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'employment'
      },
      {
        botTurn: 3,
        id: 'BOT-CRS-03',
        q: 'Does foreign work experience have to be continuous to qualify under Federal Skilled Worker FSW in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 4,
        id: 'BOT-CRS-04',
        q: 'If I worked 40 hours a week for 9 months and 20 hours a week for 6 months in Mississauga, does it count toward the 1,560 hours requirement for Express Entry?',
        city: 'Mississauga',
        intentExpected: 'employment'
      },
      {
        botTurn: 5,
        id: 'BOT-CRS-05',
        q: 'Can work experience gained as a self-employed freelancer or during full-time student status on a study permit count for Canadian Experience Class CEC in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      }
    ]
  },

  // ── CHAIN 5: Work Permits, PGWP Master Rules & Maintained Status ───────────
  {
    chain: 'Work Permits & Maintained Status',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-WKP-01',
        q: 'Under updated IRCC rules, how many years of post-graduation work permit PGWP does an international graduate of a 1-year or 2-year Master degree receive in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 2,
        id: 'BOT-WKP-02',
        q: 'My work permit expires tomorrow and I submitted an extension application online today in Mississauga. Can I legally continue working full-time on maintained status under section 186 u?',
        city: 'Mississauga',
        intentExpected: 'employment'
      },
      {
        botTurn: 3,
        id: 'BOT-WKP-03',
        q: 'What details (job title, duties, exact weekly hours, annual salary) must an employer work experience reference letter contain for IRCC Express Entry in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'employment'
      },
      {
        botTurn: 4,
        id: 'BOT-WKP-04',
        q: 'Who is exempt from showing proof of settlement funds POF under the Express Entry Canadian Experience Class CEC in Brampton?',
        city: 'Brampton',
        intentExpected: 'money'
      }
    ]
  },

  // ── CHAIN 6: Parents Super Visa & Family Sponsorship Equations ────────────
  {
    chain: 'Parents Super Visa & LICO',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-FAM-01',
        q: 'My mother is 64 and father is 68 living in Delhi. Can I bring both parents to Canada for 5 continuous years on an IRCC Super Visa in Toronto?',
        city: 'Toronto',
        intentExpected: 'family'
      },
      {
        botTurn: 2,
        id: 'BOT-FAM-02',
        q: 'What is the Low Income Cut-Off LICO minimum necessary income requirement for sponsoring parents on a Super Visa based on family household size in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'family'
      },
      {
        botTurn: 3,
        id: 'BOT-FAM-03',
        q: 'Can parents use private health insurance from an overseas company or is $100,000 coverage from a Canadian insurance company required for the Super Visa in Brampton?',
        city: 'Brampton',
        intentExpected: 'family'
      },
      {
        botTurn: 4,
        id: 'BOT-FAM-04',
        q: 'How many years of CRA Notice of Assessment NOA are required to sponsor parents under the Parents and Grandparents Program PGP in Toronto?',
        city: 'Toronto',
        intentExpected: 'family'
      },
      {
        botTurn: 5,
        id: 'BOT-FAM-05',
        q: 'Can an in-Canada sponsored spouse apply for an open work permit while waiting for permanent residence in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'family'
      }
    ]
  },

  // ── CHAIN 7: Multi-Country Police Clearance Certificates (PCC) ────────────
  {
    chain: 'Police Clearance Multi-Country',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-PCC-01',
        q: 'I lived in India until age 22, lived in the UK for 3 years, and in Dubai UAE for 18 months. Which countries do I need police clearance certificates PCC from for Canada PR in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 2,
        id: 'BOT-PCC-02',
        q: 'How does an applicant in Toronto obtain an FBI Identity History Summary IdHS clearance with FD-1164 fingerprints for time spent in the USA?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 3,
        id: 'BOT-PCC-03',
        q: 'How does a Filipino citizen in Vancouver BC obtain an NBI Clearance with biometric fingerprinting on Form No 5 for IRCC permanent residence?',
        city: 'Vancouver',
        intentExpected: 'employment'
      },
      {
        botTurn: 4,
        id: 'BOT-PCC-04',
        q: 'Where does a Nigerian applicant in Toronto obtain a Police Character Certificate from the Criminal Intelligence and Investigations Department CIID in Lagos?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 5,
        id: 'BOT-PCC-05',
        q: 'Does a single DUI impaired driving conviction make an immigrant inadmissible to Canada requiring Criminal Rehabilitation in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'employment'
      }
    ]
  },

  // ── CHAIN 8: PR Residency Obligation & Expired PR Card Abroad ──────────────
  {
    chain: 'PR Residency & Travel',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-RES-01',
        q: 'What is the 730 days physical presence residency obligation within a 5-year rolling period to maintain Canadian permanent resident status in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'employment'
      },
      {
        botTurn: 2,
        id: 'BOT-RES-02',
        q: 'Do days spent outside Canada accompanying a Canadian citizen spouse count toward the 730 days residency obligation in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 3,
        id: 'BOT-RES-03',
        q: 'If a permanent resident is outside Canada and their PR card has expired, how do they apply for a Permanent Resident Travel Document PRTD to return to Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      }
    ]
  },

  // ── CHAIN 9: Driving Licence Exchange, Sarathi & Failed Tests ──────────────
  {
    chain: 'Driving Experience & Road Tests',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-DRV-01',
        q: 'Can I exchange my Indian driver licence with an official Sarathi DL extract to skip G1 and G2 waiting periods at DriveTest in Toronto?',
        city: 'Toronto',
        intentExpected: 'driving'
      },
      {
        botTurn: 2,
        id: 'BOT-DRV-02',
        q: 'What happens if an applicant with 3 years credited foreign driving experience fails the full G highway road test on their first attempt in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'driving'
      },
      {
        botTurn: 3,
        id: 'BOT-DRV-03',
        q: 'How many days can a newcomer legally drive on an out-of-province or foreign driver licence before switching to an Ontario licence in Brampton?',
        city: 'Brampton',
        intentExpected: 'driving'
      },
      {
        botTurn: 4,
        id: 'BOT-DRV-04',
        q: 'Can a driver licence issued in the United States be exchanged directly for a full Ontario G licence in Toronto?',
        city: 'Toronto',
        intentExpected: 'driving'
      }
    ]
  },

  // ── CHAIN 10: Healthcare, Medical Exam & Excessive Demand Threshold ───────
  {
    chain: 'Healthcare & Medical Admissibility',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-MED-01',
        q: 'Is there a 3-month waiting period for OHIP health insurance coverage for new permanent residents arriving in Toronto Ontario?',
        city: 'Toronto',
        intentExpected: 'health'
      },
      {
        botTurn: 2,
        id: 'BOT-MED-02',
        q: 'Under the IRCC excessive demand policy, what is the 5-year medical cost threshold (approx $135,000) for immigration medical inadmissibility in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'health'
      },
      {
        botTurn: 3,
        id: 'BOT-MED-03',
        q: 'Can an upfront immigration medical examination IME be completed with an authorized panel physician before submitting a PR application in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'health'
      },
      {
        botTurn: 4,
        id: 'BOT-MED-04',
        q: 'Are sponsored spouses and dependent children exempt from excessive demand medical inadmissibility rules in Brampton?',
        city: 'Brampton',
        intentExpected: 'health'
      }
    ]
  },

  // ── CHAIN 11: Foreign Credential Assessment (PEBC, OCT, PEO) ───────────────
  {
    chain: 'Professional Credential Assessment',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-ECA-01',
        q: 'Which credential assessment organization evaluates foreign pharmacy degrees under Document Evaluation and Evaluating Examination in Brampton?',
        city: 'Brampton',
        intentExpected: 'employment'
      },
      {
        botTurn: 2,
        id: 'BOT-ECA-02',
        q: 'How does an internationally educated teacher get evaluated by the Ontario College of Teachers OCT for certification in Toronto Ontario?',
        city: 'Toronto',
        intentExpected: 'employment'
      },
      {
        botTurn: 3,
        id: 'BOT-ECA-03',
        q: 'Does Professional Engineers Ontario PEO require Canadian work experience to obtain a P.Eng licence in Mississauga?',
        city: 'Mississauga',
        intentExpected: 'employment'
      },
      {
        botTurn: 4,
        id: 'BOT-ECA-04',
        q: 'Where can internationally trained immigrants apply for a Foreign Credential Recognition loan up to $30,000 to cover licensing and exam costs in Toronto?',
        city: 'Toronto',
        intentExpected: 'employment'
      }
    ]
  },

  // ── CHAIN 12: British Columbia RTB Disputes & ICBC Licence Exchange ────────
  {
    chain: 'British Columbia Specifics',
    steps: [
      {
        botTurn: 1,
        id: 'BOT-BC-01',
        q: 'How much security deposit and pet damage deposit can a landlord charge under the BC Residential Tenancy Act in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'housing'
      },
      {
        botTurn: 2,
        id: 'BOT-BC-02',
        q: 'How do landlords and tenants in Vancouver file an application for dispute resolution online with the BC Residential Tenancy Branch RTB?',
        city: 'Vancouver',
        intentExpected: 'housing'
      },
      {
        botTurn: 3,
        id: 'BOT-BC-03',
        q: 'How many days can a new resident drive on a foreign driver licence in British Columbia before switching to an ICBC licence in Vancouver?',
        city: 'Vancouver',
        intentExpected: 'driving'
      },
      {
        botTurn: 4,
        id: 'BOT-BC-04',
        q: 'Do foreign tech workers need an LMIA for the BC PNP Tech immigration stream in Vancouver BC?',
        city: 'Vancouver',
        intentExpected: 'employment'
      }
    ]
  }
];

// Flatten for single-step execution
export const allBotQuestions = botConversationalChains.flatMap(c => c.steps.map(s => ({ ...s, chainName: c.chain })));

console.log(`Loaded ${allBotQuestions.length} bot-to-bot conversational test questions across ${botConversationalChains.length} chains.`);
