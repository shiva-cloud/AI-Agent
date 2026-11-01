// Cultural Name Order & Passport Discrepancy Helper (Rec 130)
// Resolves common newcomer passport name structures across Indian, Asian, and Middle Eastern naming traditions:
// 1. Single Name / Blank Surname (e.g., "Gurpreet" on Indian passport)
// 2. Family Name First (e.g., "Wang Xiaoming" -> Family: Wang, Given: Xiaoming)
// 3. FNU (First Name Unknown) on US visas
// 4. Dual bar rules for Service Canada SIN and CRA Notice of Assessment

export function harmonizePassportName({ givenName = '', surname = '', countryOfOrigin = 'IN' }) {
  const normGiven = (givenName || '').trim();
  const normSurname = (surname || '').trim();

  // Case 1: Single name on passport (blank surname or blank given name)
  if (!normSurname && normGiven) {
    return {
      type: 'single_name_blank_surname',
      passportStructure: 'Single name in Given Name field, Surname is blank',
      irccRule: 'Under IRCC standard, single name must be entered in the Last Name / Surname field; Given Name field is left blank.',
      usVisaRule: 'USCIS/State Dept enters "FNU" (First Name Unknown) in Given Name and places the single name in Surname.',
      serviceCanadaRule: 'Service Canada prints the single name as the legal surname on SIN records.',
      craRule: 'CRA records the single name as the primary taxpayer legal identifier.',
      recommendedLegalName: {
        firstName: '',
        lastName: normGiven
      },
      warning: 'Do not invent or copy father\'s name into surname field unless formally updated via passport re-issue.'
    };
  }

  // Case 2: Family name listed first (East Asian tradition)
  if (['CN', 'VN', 'KR', 'JP'].includes(countryOfOrigin.toUpperCase())) {
    return {
      type: 'east_asian_family_first',
      passportStructure: 'Family name traditionally appears first in cultural order',
      irccRule: 'Ensure Surname matches the Machine Readable Zone (MRZ) characters preceding the double chevron "<<".',
      serviceCanadaRule: 'Verify that given name order matches primary study/work permit to avoid bank record lockouts.',
      recommendedLegalName: {
        firstName: normGiven,
        lastName: normSurname
      },
      warning: 'Western bank portals frequently transpose first and last names; verify debit card emboss matches permit.'
    };
  }

  // Case 3: Standard Western Given + Surname
  return {
    type: 'standard_two_part_name',
    passportStructure: 'Standard separate Given Name and Surname',
    irccRule: 'Matches standard IRPA registration.',
    recommendedLegalName: {
      firstName: normGiven,
      lastName: normSurname
    },
    warning: null
  };
}
