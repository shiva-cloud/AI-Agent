import test from 'node:test';
import assert from 'node:assert/strict';
import { boundedText } from '../src/text-input.js';
import { auditWorkerClassificationAndWageTheft } from '../src/employment-standards.js';
import { evaluateMedicalAdmissibility } from '../src/medical-admissibility.js';
import { evaluateCustomsDeclaration } from '../src/customs-declaration.js';
import { auditLeaseAgreement } from '../src/lease-guard.js';

test('boundedText cleans, bounds and falls back', () => {
  assert.equal(boundedText('  Line\u0000one\n\ttwo  ', 'x'), 'Line one two');
  assert.equal(boundedText({ toString: () => 'nope' }, 'fallback'), 'fallback');
  assert.equal(boundedText('   ', 'fallback'), 'fallback');
  assert.equal(boundedText('a'.repeat(500), '', 120).length, 120);
});

test('tools that echo or scan free text accept hostile input without failing', () => {
  assert.equal(auditWorkerClassificationAndWageTheft({ jobTitle: { x: 1 } }).jobTitle, 'Contract Specialist');
  const med = evaluateMedicalAdmissibility({ conditionName: 'A'.repeat(5000) });
  assert.equal(med.conditionName.length, 120);
  assert.ok(med.individualizedMitigationPlanDraft.length < 5000);
  const customs = evaluateCustomsDeclaration({ vehicle: { makeModel: 'X'.repeat(300), year: 2010, valueCad: 5000 } });
  assert.equal(customs.vehicleAudit.makeModel.length, 120);
  // A non-string clause previously threw a TypeError (HTTP 500).
  assert.doesNotThrow(() => auditLeaseAgreement({ customClauseText: 123 }));
  assert.ok(auditLeaseAgreement({ customClauseText: 'No pets allowed' }).clauseAudits.some(c => c.key === 'no_pets'));
});
