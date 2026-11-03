import {existsSync,mkdirSync,copyFileSync,constants as fsConstants} from 'node:fs';
import {dirname} from 'node:path';
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

// Testing mode publishes an administrator login, so it may only run on a loopback
// listener. NODE_ENV alone is not enough: an unset NODE_ENV on a public host must not expose it.
export function assertTestModeAllowed(env=process.env) {
  if(env.TEST_MODE!=='1')return;
  if(env.NODE_ENV==='production')throw new Error('TEST_MODE=1 cannot be used with NODE_ENV=production');
  const host=env.HOST||'127.0.0.1';
  if(!['127.0.0.1','::1','localhost'].includes(host))throw new Error('TEST_MODE=1 needs a loopback HOST (127.0.0.1, ::1 or localhost)');
  if(String(env.PUBLIC_ORIGIN||'').startsWith('https:'))throw new Error('TEST_MODE=1 cannot be used with an HTTPS PUBLIC_ORIGIN');
}

// First start of a fresh deployment: copy the release evidence snapshot into an
// empty data volume. An existing database is never overwritten.
export function seedDatabaseFromSnapshot(dbPath,seedPath) {
  if(!seedPath||dbPath===':memory:'||existsSync(dbPath))return false;
  if(!existsSync(seedPath))throw new Error('SEED_DB_PATH does not exist: '+seedPath);
  mkdirSync(dirname(dbPath),{recursive:true});
  copyFileSync(seedPath,dbPath,fsConstants.COPYFILE_EXCL);
  return true;
}
