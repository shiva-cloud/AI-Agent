// Explicit CLI argument wins over deployment configuration, then local default.
export function databasePath(explicit,env=process.env) {
  const path=explicit ?? env.DB_PATH ?? 'data/settlement.sqlite';
  if(typeof path!=='string'||!path.trim()||path.includes('\0'))throw new Error('DB_PATH must be a nonempty filesystem path');
  return path;
}

export function publicOrigin(value) {
  if(value===undefined||value==='')return undefined;
  let url;try{url=new URL(value);}catch{throw new Error('PUBLIC_ORIGIN must be an HTTP(S) origin');}
  if(!['https:','http:'].includes(url.protocol)||url.origin!==value||url.username||url.password)throw new Error('PUBLIC_ORIGIN must be an exact HTTP(S) origin without a path');
  return value;
}

export function validateProductionAccounts(env=process.env) {
  if(env.NODE_ENV!=='production'||!env.ACCOUNTS_DB_PATH)return;
  if(!/^https:\/\//.test(publicOrigin(env.PUBLIC_ORIGIN)||''))throw new Error('Production accounts require an HTTPS PUBLIC_ORIGIN');
  if(!/^[a-fA-F0-9]{64}$/.test(env.ACCOUNTS_SECRET||''))throw new Error('Production accounts require a stable 64-hex ACCOUNTS_SECRET');
  if(env.EMAIL_PROVIDER!=='resend')throw new Error('Production accounts require a configured transactional email provider; console email is development-only');
}
