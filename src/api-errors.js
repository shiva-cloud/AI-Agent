export class ValidationError extends Error {
  constructor(message,statusCode=400){super(message);this.statusCode=statusCode;this.code=({400:'invalid_request',404:'not_found',409:'conflict'})[statusCode]||'invalid_request';}
}
export class PolicyReviewRequiredError extends Error {
  constructor(key,date) {
    super(`KB fact ${key} requires source review for ${date}`);
    this.code='policy_review_required';
  }
}
export function errorResponse(error) {
  if(error instanceof PolicyReviewRequiredError)return {status:503,body:{error:'This calculation is unavailable until its policy figures have been reviewed.',code:error.code}};
  if(error instanceof ValidationError)return {status:error.statusCode,body:{error:error.message,code:error.code}};
  if(error?.code==='ERR_SQLITE_ERROR'&&Number.isInteger(error.errcode)&&[5,6].includes(error.errcode&255)) {
    return {status:503,body:{error:'Storage is temporarily busy. Please retry shortly.',code:'storage_busy'}};
  }
  return {status:500,body:{error:'Internal server error',code:'internal_error'}};
}

export function responseBody(status,body) {
  if(status<400||!body.error||body.code)return body;
  const code=({400:'invalid_request',401:'unauthorized',403:'forbidden',404:'not_found',409:'conflict',413:'payload_too_large',415:'unsupported_media_type',429:'rate_limited',500:'internal_error',503:'service_unavailable'})[status]||'request_failed';
  return {...body,code};
}
