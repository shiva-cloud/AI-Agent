// src/security-guard.js
// Cryptographic Provenance Stamping & Input Integrity Security Guard

import { createHmac, timingSafeEqual } from 'node:crypto';

function signingSecret() {
  const secret=process.env.AUDIT_SIGNING_SECRET;
  if(typeof secret!=='string'||secret.length<32)throw new Error('AUDIT_SIGNING_SECRET must contain at least 32 characters');
  return secret;
}
function canonical(value) {
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&Object.getPrototypeOf(value)===Object.prototype)return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
  throw new Error('Provenance requires a finite JSON payload');
}

export function stampAssessmentProvenance(assessmentPayload) {
  if (!assessmentPayload || typeof assessmentPayload !== 'object') {
    throw new Error('Invalid assessment payload');
  }
  const timestamp = new Date().toISOString();
  if(Object.hasOwn(assessmentPayload,'securityProvenance'))throw new Error('Payload already contains provenance');
  const canonicalString = canonical({payload:assessmentPayload,timestamp,version:1});
  const provenanceHash = createHmac('sha256', signingSecret()).update(canonicalString).digest('hex');

  return {
    ...assessmentPayload,
    securityProvenance: {
      timestamp,
      provenanceHash,
      verificationAlgorithm: 'HMAC-SHA256',
      version: 1,
      scope: 'payload_integrity_only'
    }
  };
}

export function verifyAssessmentProvenance(stampedPayload) {
  if (!stampedPayload?.securityProvenance?.provenanceHash) return false;
  const { securityProvenance, ...rawPayload } = stampedPayload;
  if(securityProvenance.version!==1||!/^[a-f0-9]{64}$/.test(securityProvenance.provenanceHash))return false;
  try {
    const canonicalString=canonical({payload:rawPayload,timestamp:securityProvenance.timestamp,version:1});
    const expectedHash=createHmac('sha256',signingSecret()).update(canonicalString).digest();
    return timingSafeEqual(Buffer.from(securityProvenance.provenanceHash,'hex'),expectedHash);
  }catch{return false;}
}

export function sanitizeClientString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>'"`;()&$]/g, '')
    .slice(0, maxLength)
    .trim();
}
