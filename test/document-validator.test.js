// test/document-validator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateNewcomerDocuments,
  validateDocument,
  DOCUMENT_TYPE_POLICIES
} from '../src/document-validator.js';

test('DOCUMENT_TYPE_POLICIES contains core Canadian immigration documents', () => {
  assert.ok(DOCUMENT_TYPE_POLICIES.passport);
  assert.ok(DOCUMENT_TYPE_POLICIES.copr);
  assert.ok(DOCUMENT_TYPE_POLICIES.medical_exam);
  assert.ok(DOCUMENT_TYPE_POLICIES.language_test);
  assert.ok(DOCUMENT_TYPE_POLICIES.eca_report);
  assert.ok(DOCUMENT_TYPE_POLICIES.proof_of_funds);
});

test('Valid documents collection returns verified_ready status', () => {
  const result = validateNewcomerDocuments({
    landingDateStr: '2026-11-01',
    documents: [
      { docType: 'passport', expiryDate: '2029-05-15', issueDate: '2019-05-15' },
      { docType: 'copr', expiryDate: '2027-02-10' },
      { docType: 'proof_of_funds', issueDate: '2026-10-25' }
    ]
  });

  assert.equal(result.overallReadiness, 'verified_ready');
  assert.equal(result.counts.total, 3);
  assert.equal(result.counts.valid, 3);
  assert.equal(result.counts.criticalRisk, 0);
  assert.ok(result.preFlightChecklist.length >= 3);
});

test('Passport with less than 6 months runway is flagged as high risk under IRPR s.52', () => {
  // Landing 2026-11-01, Passport expires 2027-01-15 (75 days runway < 180 days)
  const doc = validateDocument(
    { docType: 'passport', expiryDate: '2027-01-15' },
    '2026-11-01'
  );

  assert.equal(doc.status, 'expiring_soon');
  assert.equal(doc.rejectionRisk, 'high');
  assert.match(doc.correctiveAction, /IRPR s\.52/);
  assert.match(doc.statute, /s\. 52\(1\)/);
});

test('Expired COPR triggers critical risk and warns that COPR cannot be extended', () => {
  const doc = validateDocument(
    { docType: 'copr', expiryDate: '2026-10-15' },
    '2026-11-01'
  );

  assert.equal(doc.status, 'expired');
  assert.equal(doc.rejectionRisk, 'critical');
  assert.match(doc.correctiveAction, /expired on 2026-10-15/);
  assert.match(doc.complianceNote, /CANNOT be extended/);
});

test('Language test older than 2 years is statutorily invalid under IRPR s.74', () => {
  // Issued 2024-05-01, Landing 2026-11-01 (> 730 days)
  const doc = validateDocument(
    { docType: 'language_test', issueDate: '2024-05-01' },
    '2026-11-01'
  );

  assert.equal(doc.status, 'expired');
  assert.equal(doc.rejectionRisk, 'critical');
  assert.match(doc.correctiveAction, /IRPR s\.74/);
});

test('ECA assessment older than 5 years is expired under IRPR s.75(2)', () => {
  // Issued 2021-01-01, Landing 2026-11-01 (> 5 years)
  const doc = validateDocument(
    { docType: 'eca_report', issueDate: '2021-01-01' },
    '2026-11-01'
  );

  assert.equal(doc.status, 'expired');
  assert.equal(doc.rejectionRisk, 'critical');
  assert.match(doc.correctiveAction, /IRPR s\.75\(2\)/);
});

test('Medical examination older than 12 months is expired under IRPR s.30', () => {
  // Issued 2025-08-01, Landing 2026-11-01 (> 365 days)
  const doc = validateDocument(
    { docType: 'medical_exam', issueDate: '2025-08-01' },
    '2026-11-01'
  );

  assert.equal(doc.status, 'expired');
  assert.equal(doc.rejectionRisk, 'critical');
  assert.match(doc.correctiveAction, /IRPR s\.30/);
});

test('validateNewcomerDocuments rolls up overall status to critical_rejection_risk when any doc is expired', () => {
  const result = validateNewcomerDocuments({
    landingDateStr: '2026-11-01',
    documents: [
      { docType: 'passport', expiryDate: '2029-01-01' },
      { docType: 'medical_exam', issueDate: '2025-08-01' } // Expired
    ]
  });

  assert.equal(result.overallReadiness, 'critical_rejection_risk');
  assert.equal(result.counts.criticalRisk, 1);
  assert.match(result.summaryHeadline, /Critical Risk/);
});
