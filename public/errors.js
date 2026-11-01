// Browser-agnostic wording module: maps server errors and engine gap reasons to
// honest English. Kept free of any DOM access so it can be unit-tested with
// node --test and shared by app.js future views.

// Plain-language versions of the engine's gap reasons. Unknown reasons keep
// their machine text; honesty beats paraphrase. "Unreviewed" (human review
// pending) and "expired" (stale) stay clearly distinct on purpose.
export const GAP_LABELS = {
  missing_occupation_requirements: 'a general employment guide cannot establish the requirements for your occupation',
  missing_personal_eligibility: 'the available summaries do not establish your personal eligibility',
  missing_verified_checklist: 'a verified ordered checklist is not available; source summaries are only starting guidance',
  awaiting_human_review: 'sources exist, but they need independent human review before publication',
  missing_evidence: 'no verified source yet for this part',
  rejected: 'a stored draft exists, but it was rejected in review',
  future_check_date: 'the source check date is still in the future',
  stale: 'the stored summaries have expired and need a fresh source check',
  outside_effective_dates: 'the stored sources only apply to other dates',
  missing_or_unsupported_geography: 'covers a place outside this pilot; supported cities are Toronto, Mississauga, Brampton and Vancouver',
  conflicting_evidence: 'stored summaries disagree; a reviewer must resolve this',
  unrecognized_intent: 'no settlement topic was recognized in the question',
  missing_live_price_data: 'prices change too often; no verified current price is available'
}

export function humanizeGap(reason) {
  return GAP_LABELS[reason] ?? reason.replaceAll('_', ' ');
}

// Plain-language status wording for the answerability contract (`answerability-1`).
// Unknown statuses keep their machine text; honesty beats paraphrase.
export const ANSWER_STATUS_LABELS = {
  needs_clarification: 'waiting for a clarifying answer from you before it can proceed',
  incomplete: 'partially answered — the part beyond general guidance is not established by evidence yet',
  source_guidance_only: 'answered from verified source summaries',
  unavailable: 'not answered yet — nothing verified matched'
};

export function humanizeAnswerStatus(status) {
  return ANSWER_STATUS_LABELS[status] ?? status.replaceAll('_', ' ');
}

export function humanizeError(err) {
  const msg = err?.message || 'An unexpected error occurred';
  const e = String(msg).toLowerCase();
  const status = err?.status;
  if(status===403&&err?.code==='insufficient_role')return {title:'Permission required',body:'Your account role cannot perform this action. Ask an administrator for the appropriate access.',action:'Review access'};
  if(status===409)return {title:'This item changed',body:'Reload the latest item before retrying your change.',action:'Reload'};
  if(status===500){
    const reference=/^[a-f0-9-]{36}$/.test(err.requestId||'')?` Reference: ${err.requestId}.`:'';
    return {title:'Server error',body:'The server could not complete this request. Please retry shortly.'+reference,action:'Retry'};
  }
  // The status code matters as much as the text: the server's 429 body does not
  // itself contain the words below.
  if (status === 429 || err?.retryAfterSeconds > 0 || /429|rate.*limit|retry-after/i.test(msg) || /429/i.test(e)) return {
    title: 'Too many requests',
    body: 'The system is busy. Please wait a moment and try again.',
    action: 'Retry',
    retryAfter: err.retryAfterSeconds || 0
  };
  // 503 must be tested before the authorization wording below: the disabled
  // message mentions ADMIN_TOKEN, which must not read as a bad token.
  if (/admin disabled|admin_token/i.test(e)) return {
    title: 'Editorial console unavailable',
    body: 'Admin is disabled until ADMIN_TOKEN is configured on the server. Restart with a token of at least 24 characters.',
    action: 'Retry'
  };
  if (status === 503 || /503/i.test(e)) return {
    title: 'Service temporarily unavailable',
    body: 'The service is restarting or unavailable. Please retry shortly.',
    action: 'Retry'
  };
  if (status === 401 || /401|authorization required|unauthorized|bearer/i.test(e)) return {
    title: 'Authentication required',
    body: 'Please check your admin token and try again.',
    action: 'Retry'
  };
  if (status === 403 || /403|cross-origin/i.test(e)) return {
    title: 'Request blocked',
    body: 'Cross-origin requests are not allowed from this page.',
    action: 'Retry'
  };
  if (status === 404 || /404|not found/i.test(e)) return {
    title: 'Page not found',
    body: 'The requested page does not exist.',
    action: 'Go home'
  };
  if (status === 413 || /too large/i.test(e)) return {
    title: 'Question too long',
    body: 'The request exceeded the server limit. Please shorten your question and try again.',
    action: 'Edit'
  };
  if (status === 415 || /application\/json/i.test(e)) return {
    title: 'Request not supported',
    body: 'The server did not accept this request format.',
    action: 'Retry'
  };
  if (/timed out|timeout/i.test(e)) return {
    title: 'Request timed out',
    body: 'The server took too long to respond. Please try again.',
    action: 'Retry'
  };
  if (/failed to fetch|fetch/i.test(e)) return {
    title: 'Cannot connect',
    body: 'Unable to reach the server. Make sure it is running at http://127.0.0.1:3000.',
    action: 'Retry'
  };
  if (/Only English|non-Latin|script/i.test(e)) return {
    title: 'Language not supported',
    body: 'This pilot accepts English only. Please submit your question in English (Latin script).',
    action: 'Edit'
  };
  return {
    title: 'Something went wrong',
    body: msg,
    action: 'Retry'
  };
}
