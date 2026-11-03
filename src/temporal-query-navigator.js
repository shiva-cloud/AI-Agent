// Temporal Query Awareness for Statutory Revisions & Transitional Provisions (Rec 8)
// Identifies time-bounded expressions ("effective 2026", "new rules starting next month", "prior to 2024")
// and adjusts statutory retrieval to prioritize future/recent statutory updates or grandfathered historical regimes.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export function parseTemporalContext(question, referenceDate = todayIso()) {
  const safeAssessmentDate = safeIsoDate(referenceDate, todayIso());
  if (!question || typeof question !== 'string') {
    return {
      hasTemporalQuery: false,
      targetYear: null,
      isFutureRule: false,
      isHistorical: false,
      rawClause: null,
      assessmentDate: safeAssessmentDate
    };
  }

  const safeQuestion = boundedText(question, '', 1000);
  const yearMatch = safeQuestion.match(/\b(202[0-9]|203[0-5])\b/);
  const futureMatch = /\b(?:effective|starting|beginning|new\s+rules?|from|upcoming|future|in\s+force)\b/i.test(safeQuestion);
  const historicalMatch = /\b(?:old\s+rules?|previous|historical|prior\s+to|before|grandfathered|legacy)\b/i.test(safeQuestion);

  const targetYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
  const currentYear = new Date(safeAssessmentDate).getFullYear();
  const isFutureRule = Boolean((targetYear && targetYear >= currentYear) || futureMatch);
  const isHistorical = Boolean((targetYear && targetYear < currentYear) || (historicalMatch && !futureMatch));

  return {
    hasTemporalQuery: Boolean(targetYear || futureMatch || historicalMatch),
    targetYear,
    isFutureRule,
    isHistorical,
    rawClause: yearMatch ? yearMatch[0] : (futureMatch ? 'future' : (historicalMatch ? 'historical' : null)),
    assessmentDate: safeAssessmentDate
  };
}

export function rankByTemporalRelevance(records, temporalContext, referenceDate = todayIso()) {
  if (!records || !Array.isArray(records)) return [];
  if (!temporalContext || !temporalContext.hasTemporalQuery) return records;

  

  return [...records].sort((a, b) => {
    // If future or new rule query, prioritize newer effectiveFrom dates
    if (temporalContext.isFutureRule) {
      const aDate = a.effectiveFrom || a.checkedAt || '1970-01-01';
      const bDate = b.effectiveFrom || b.checkedAt || '1970-01-01';
      return bDate.localeCompare(aDate);
    }
    // If historical, prioritize older effectiveFrom or checkedAt dates
    if (temporalContext.isHistorical) {
      const aDate = a.effectiveFrom || a.checkedAt || '9999-12-31';
      const bDate = b.effectiveFrom || b.checkedAt || '9999-12-31';
      return aDate.localeCompare(bDate);
    }
    return 0;
  });
}
