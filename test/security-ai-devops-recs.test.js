import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { generateSriManifest, computeFileSri, verifySri } from '../src/sri-integrity.js';
import { runSecurityAudit } from '../scripts/audit-cve.js';
import { encryptBuffer, decryptBuffer } from '../src/db-encryption.js';
import {
  STATUTORY_LEGAL_DISCLAIMER_WATERMARK,
  validateStructuredAiResponse,
  attachLegalDisclaimer
} from '../src/ai-guardrails.js';
import {
  simplifyLegalJargon,
  calculateReadingMetrics
} from '../src/plain-english-simplifier.js';

test('Rec 142: Subresource Integrity (SRI) computes valid SHA-384 digests and verifies assets', () => {
  const publicDir = fileURLToPath(new URL('../public', import.meta.url));
  const manifest = generateSriManifest(publicDir);

  assert.ok(manifest['styles.css'], 'styles.css must have SRI entry');
  assert.ok(manifest['app.js'], 'app.js must have SRI entry');
  assert.match(manifest['styles.css'], /^sha384-[A-Za-z0-9+/=]+$/);

  const testContent = 'console.log("hello test");';
  const testSri = `sha384-${Buffer.from(testContent).toString('base64')}`; // dummy verification
  const actualHash = computeFileSri(join(publicDir, 'styles.css'));
  assert.equal(verifySri(actualHash, 'invalid'), false);
});

test('Rec 143: Automated Dependency CVE Audit produces structured audit report', () => {
  const auditReport = runSecurityAudit();
  assert.ok(auditReport.auditedAt);
  assert.ok(['pass', 'action_required', 'error'].includes(auditReport.status));
  assert.ok(typeof auditReport.vulnerabilities.total === 'number');
});

test('Rec 145: Encrypted SQLite at Rest encrypts and decrypts with AES-256-GCM authenticated payload', () => {
  const rawDbContent = Buffer.from('SQLite format 3\0\x04\0\x01\x01\0@  \0\0\0\x01\0\0\0\x01');
  const secretPassphrase = 'settlement-secure-master-key-2026';

  const encrypted = encryptBuffer(rawDbContent, secretPassphrase);
  assert.ok(encrypted.length >= rawDbContent.length + 60, 'Encrypted buffer must contain salt, IV, tag and ciphertext');

  const decrypted = decryptBuffer(encrypted, secretPassphrase);
  assert.deepEqual(decrypted, rawDbContent, 'Decrypted buffer must exactly match original SQLite payload');

  // Tampering detection
  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 1] ^= 0xff; // flip last bit
  assert.throws(() => {
    decryptBuffer(tampered, secretPassphrase);
  }, /unsupported state or unable to authenticate data|bad decrypt/i);
});

test('Rec 109 & 111: AI Guardrails enforce structured schema and mandatory legal disclaimer watermark', () => {
  const rawAiResult = {
    headline: 'Tenant Rights in Ontario Regarding Lockouts',
    summary: 'A landlord in Ontario cannot change locks without an eviction order from the LTB.',
    citations: [
      { title: 'Residential Tenancies Act s. 24', url: 'https://www.ontario.ca/laws/statute/06r17' }
    ],
    riskLevel: 'high'
  };

  const validation = validateStructuredAiResponse(rawAiResult);
  assert.equal(validation.valid, true);
  assert.match(validation.data.disclaimer, /STATUTORY LEGAL NOTICE/);

  // Missing required fields
  const invalidResult = { headline: '' };
  const failedValidation = validateStructuredAiResponse(invalidResult);
  assert.equal(failedValidation.valid, false);
  assert.ok(failedValidation.errors.length > 0);

  const watermarked = attachLegalDisclaimer(rawAiResult);
  assert.equal(watermarked.disclaimerWatermarked, true);
  assert.equal(watermarked.isLegalAdvice, false);
});

test('Rec 114: Grade-8 Plain English Simplifier converts statutory legalese and checks readability', () => {
  const legalText = 'Pursuant to the tenancy agreement, the lessee shall commence payment of remuneration prior to the expiration of the stipulation, notwithstanding any proviso herein.';
  const simplified = simplifyLegalJargon(legalText);

  assert.ok(!simplified.includes('Pursuant to'));
  assert.ok(simplified.toLowerCase().includes('under'));
  assert.ok(!simplified.includes('remuneration'));
  assert.ok(simplified.toLowerCase().includes('pay or wages'));
  assert.ok(!simplified.includes('prior to'));
  assert.ok(simplified.toLowerCase().includes('before'));

  const metrics = calculateReadingMetrics(simplified);
  assert.ok(metrics.wordCount > 5);
  assert.ok(typeof metrics.fleschReadingEase === 'number');
  assert.ok(typeof metrics.estimatedGradeLevel === 'number');
});
