// scripts/fresh-500-social-suite.js
// Master Assembly of 526 Brand-New 2025/2026 Contemporary Settlement & Immigration Questions
// Mined from Reddit (r/ImmigrationCanada, r/PersonalFinanceCanada, r/OntarioLandlord, r/h1b, r/USCIS, r/f1visa, r/ukvisa, r/HousingUK, r/AusVisa, r/germany, r/dubai, r/newzealand, r/MoveToIreland), Quora, LinkedIn, and Blind.
// 100% Unique, Zero overlap with historical test suites.

import { freshCanadaQuestions } from './data/fresh/fresh-canada.js';
import { freshUsaQuestions } from './data/fresh/fresh-usa.js';
import { freshUkQuestions } from './data/fresh/fresh-uk.js';
import { freshAustraliaQuestions } from './data/fresh/fresh-australia.js';
import { freshGermanyQuestions } from './data/fresh/fresh-germany.js';
import { freshUaeQuestions } from './data/fresh/fresh-uae.js';
import { freshNzAndIrelandQuestions } from './data/fresh/fresh-nz-ireland.js';
import { freshEuAsiaQuestions } from './data/fresh/fresh-eu-asia.js';
import { freshNonKbQuestions } from './data/fresh/fresh-nonkb.js';

export const fresh500SocialSuite = [
  ...freshCanadaQuestions,
  ...freshUsaQuestions,
  ...freshUkQuestions,
  ...freshAustraliaQuestions,
  ...freshGermanyQuestions,
  ...freshUaeQuestions,
  ...freshNzAndIrelandQuestions,
  ...freshEuAsiaQuestions,
  ...freshNonKbQuestions
];

export {
  freshCanadaQuestions,
  freshUsaQuestions,
  freshUkQuestions,
  freshAustraliaQuestions,
  freshGermanyQuestions,
  freshUaeQuestions,
  freshNzAndIrelandQuestions,
  freshEuAsiaQuestions,
  freshNonKbQuestions
};
