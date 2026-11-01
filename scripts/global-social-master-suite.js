// scripts/global-social-master-suite.js
// Master Compilation of 595 High-Engagement Real-World Social Media Questions
// across Reddit, Quora, LinkedIn, Blind, and Expat Community Forums.
// Covers all 8 destination countries + Non-KB categories with deep architectural explanations.

import { canadaSocialQuestions } from './data/social-questions-canada.js';
import { usaSocialQuestions } from './data/social-questions-usa.js';
import { ukSocialQuestions } from './data/social-questions-uk.js';
import { australiaSocialQuestions } from './data/social-questions-australia.js';
import { germanySocialQuestions } from './data/social-questions-germany.js';
import { uaeSocialQuestions } from './data/social-questions-uae.js';
import { nzAndIrelandSocialQuestions } from './data/social-questions-nz-ireland.js';
import { nonKbSocialQuestions } from './data/social-questions-nonkb.js';

export const globalSocialMasterSuite = [
  ...canadaSocialQuestions,
  ...usaSocialQuestions,
  ...ukSocialQuestions,
  ...australiaSocialQuestions,
  ...germanySocialQuestions,
  ...uaeSocialQuestions,
  ...nzAndIrelandSocialQuestions,
  ...nonKbSocialQuestions
];

console.log(`Loaded ${globalSocialMasterSuite.length} social media questions across 8 destination countries and Non-KB domains.`);
