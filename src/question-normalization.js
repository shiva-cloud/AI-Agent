// Normalize typography only. Never infer missing facts, translate or correct places.
export function normalizeEnglishQuestion(question) {
  // Non-text is left as is so input validation can reject it with a clear 400.
  if (typeof question !== 'string') return question;
  return question.normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/gu, ' ')
    .trim();
}
