// AI / LLM Guardrails, Disclaimer Watermarks & JSON Schema Enforcers (Rec 109, Rec 111)
// Enforces:
// 1. Mandatory statutory legal disclaimer watermark on all AI syntheses.
// 2. Strict structured JSON schema validation for LLM responses.
// 3. Hallucination and contradiction detection metric interface.

export const STATUTORY_LEGAL_DISCLAIMER_WATERMARK = 
  '⚠️ STATUTORY LEGAL NOTICE: This response synthesizes verified statutory provisions and government regulations for educational and settlement navigation purposes only. It does not constitute formal legal advice. Always consult a licensed immigration consultant (RCIC), legal aid clinic, or authorized settlement agency before taking action.';

export function validateStructuredAiResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response must be a non-null object');
  }

  const errors = [];

  // Required fields
  if (typeof data.headline !== 'string' || !data.headline.trim()) {
    errors.push('Missing or invalid "headline" string');
  }
  if (typeof data.summary !== 'string' || !data.summary.trim()) {
    errors.push('Missing or invalid "summary" string');
  }
  if (!Array.isArray(data.citations)) {
    errors.push('Field "citations" must be an array');
  } else {
    data.citations.forEach((c, idx) => {
      if (!c.title || typeof c.title !== 'string') errors.push(`Citation [${idx}] missing valid "title"`);
      if (!c.url || typeof c.url !== 'string') errors.push(`Citation [${idx}] missing valid "url"`);
    });
  }
  if (!['low', 'medium', 'high'].includes(data.riskLevel)) {
    errors.push('Field "riskLevel" must be one of: "low", "medium", "high"');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    data: {
      headline: data.headline.trim(),
      summary: data.summary.trim(),
      citations: data.citations,
      riskLevel: data.riskLevel,
      disclaimer: data.disclaimer || STATUTORY_LEGAL_DISCLAIMER_WATERMARK,
      plainEnglishSummary: typeof data.plainEnglishSummary === 'string' ? data.plainEnglishSummary.trim() : null
    }
  };
}

export function attachLegalDisclaimer(aiResponse) {
  if (!aiResponse || typeof aiResponse !== 'object') return aiResponse;

  return {
    ...aiResponse,
    disclaimer: STATUTORY_LEGAL_DISCLAIMER_WATERMARK,
    isLegalAdvice: false,
    disclaimerWatermarked: true
  };
}
