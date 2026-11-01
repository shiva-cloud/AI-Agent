// Natural Language Inference (NLI) Contradiction Checker & Hallucination Guard (Rec 113, Rec 116)
// Assesses factual consistency and groundedness between statutory evidence quotes and generated answers.

import { tokenize } from './search.js';

export function calculateGroundednessScore(claimText, sourceQuote) {
  if (!claimText || !sourceQuote) return 0.0;

  const claimTokens = new Set(tokenize(claimText));
  const sourceTokens = new Set(tokenize(sourceQuote));

  if (claimTokens.size === 0) return 1.0;

  let overlap = 0;
  for (const t of claimTokens) {
    if (sourceTokens.has(t)) overlap++;
  }

  const score = overlap / claimTokens.size;
  return Number(score.toFixed(3));
}

export function detectNliContradiction(claimText, statutoryRuleText) {
  if (!claimText || !statutoryRuleText) {
    return { contradiction: false, confidence: 0 };
  }

  const lowerClaim = claimText.toLowerCase();
  const lowerRule = statutoryRuleText.toLowerCase();

  // Common statutory contradiction signals: "cannot" vs "can", "forbidden" vs "allowed"
  const claimAllows = /\b(?:can|may|allowed|permitted|eligible|legal)\b/.test(lowerClaim);
  const claimProhibits = /\b(?:cannot|must not|prohibited|illegal|ineligible|forbidden|refused)\b/.test(lowerClaim);

  const ruleAllows = /\b(?:can|may|allowed|permitted|eligible|legal)\b/.test(lowerRule);
  const ruleProhibits = /\b(?:cannot|must not|prohibited|illegal|ineligible|forbidden|refused)\b/.test(lowerRule);

  let contradiction = false;
  if (claimAllows && ruleProhibits && !claimProhibits) {
    contradiction = true;
  } else if (claimProhibits && ruleAllows && !claimAllows) {
    contradiction = true;
  }

  return {
    contradiction,
    groundednessScore: calculateGroundednessScore(claimText, statutoryRuleText),
    flagged: contradiction
  };
}
