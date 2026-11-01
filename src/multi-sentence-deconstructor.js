// Multi-Sentence Query Deconstructor & Primary Question Extractor (Rec 14)
// Accurately decomposes long multi-sentence newcomer background stories into:
// 1. Context / narrative background ("I moved to Vancouver last week with my 2 kids...")
// 2. Actionable legal subquestions ("Can my landlord demand 6 months upfront? And how do I get MSP?")
// 3. Identified primary statutory intent

export function deconstructMultiSentenceQuery(text) {
  if (!text || typeof text !== 'string') {
    return {
      sentences: [],
      primaryQuestion: '',
      backgroundSentences: [],
      actionableQuestions: [],
      isMultiSentence: false
    };
  }

  // Split into sentences using punctuation boundaries (. ! ? \n)
  const rawSentences = text
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (rawSentences.length <= 1) {
    return {
      sentences: rawSentences,
      primaryQuestion: text.trim(),
      backgroundSentences: [],
      actionableQuestions: rawSentences,
      isMultiSentence: false
    };
  }

  const backgroundSentences = [];
  const actionableQuestions = [];

  for (const s of rawSentences) {
    const isExplicitQuestion = /\?$/.test(s) || /^(?:how|what|where|when|can|is|are|do|does|will|should|could|must|who|whom)\b/i.test(s);
    if (isExplicitQuestion) {
      actionableQuestions.push(s);
    } else {
      backgroundSentences.push(s);
    }
  }

  // Primary question is the first actionable question, or the trailing sentence if no explicit question was asked
  const primaryQuestion = actionableQuestions[0] || rawSentences[rawSentences.length - 1];

  return {
    sentences: rawSentences,
    primaryQuestion,
    backgroundSentences,
    actionableQuestions,
    isMultiSentence: true
  };
}
