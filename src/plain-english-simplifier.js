// Grade-8 Plain English Simplifier for Statutory Guidance (Rec 114)
// Translates complex legislative and administrative terminology into clear, accessible Grade-8 English
// for newcomers and English language learners, and computes readability scores.

export const JARGON_SIMPLIFICATION_MAP = [
  [/\bpursuant to\b/gi, 'under'],
  [/\bnotwithstanding\b/gi, 'even though'],
  [/\binter alia\b/gi, 'among other things'],
  [/\bremuneration\b/gi, 'pay or wages'],
  [/\bdomicile\b/gi, 'home address'],
  [/\bcommence\b/gi, 'start'],
  [/\bcommencement\b/gi, 'start'],
  [/\bterminate\b/gi, 'end'],
  [/\btermination\b/gi, 'end or firing'],
  [/\butilize\b/gi, 'use'],
  [/\bfurnish\b/gi, 'provide'],
  [/\bstipulation\b/gi, 'rule'],
  [/\bproviso\b/gi, 'condition'],
  [/\bindemnify\b/gi, 'protect against loss'],
  [/\bindemnification\b/gi, 'protection from financial loss'],
  [/\bherein\b/gi, 'in this document'],
  [/\bhereinafter\b/gi, 'from now on'],
  [/\baforementioned\b/gi, 'mentioned earlier'],
  [/\bprior to\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
  [/\bin lieu of\b/gi, 'instead of'],
  [/\bprima facie\b/gi, 'at first look'],
  [/\bstatutory obligation\b/gi, 'legal requirement'],
  [/\bjurisprudence\b/gi, 'past legal decisions'],
  [/\btenancy agreement\b/gi, 'rental lease'],
  [/\bpecuniary\b/gi, 'financial'],
  [/\badjudication\b/gi, 'formal hearing decision'],
  [/\bdeemed\b/gi, 'considered']
];

export function simplifyLegalJargon(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text;
  for (const [pattern, replacement] of JARGON_SIMPLIFICATION_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function calculateReadingMetrics(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      fleschReadingEase: 100,
      estimatedGradeLevel: 1,
      isGrade8Accessible: true
    };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);

  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const wordCount = Math.max(words.length, 1);

  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countSyllables(w);
  }

  // Flesch Reading Ease = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;
  const fleschReadingEase = Math.max(0, Math.min(100, Number((206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord)).toFixed(1))));

  // Flesch-Kincaid Grade Level = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  const gradeLevel = Math.max(1, Number((0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59).toFixed(1)));

  return {
    wordCount,
    sentenceCount,
    fleschReadingEase,
    estimatedGradeLevel: gradeLevel,
    isGrade8Accessible: gradeLevel <= 8.5
  };
}
