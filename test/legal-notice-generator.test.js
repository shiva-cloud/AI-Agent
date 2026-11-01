import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLegalNotice, NOTICE_TYPES, STATUTORY_METADATA } from '../src/legal-notice-generator.js';

test('Legal Notice Generator — Validates required fields and notice types', () => {
  assert.throws(() => generateLegalNotice(null), /must be an object/);
  assert.throws(() => generateLegalNotice({}), /Invalid or missing notice type/);
  assert.throws(() => generateLegalNotice({ type: 'invalid_type' }), /Invalid or missing notice type/);
  assert.throws(() => generateLegalNotice({ type: NOTICE_TYPES.ONTARIO_LTB_T2 }), /senderName is required/);
  assert.throws(() => generateLegalNotice({ type: NOTICE_TYPES.ONTARIO_LTB_T2, senderName: 'Alice' }), /recipientName is required/);
});

test('Legal Notice Generator — Generates Ontario LTB Form T2 notice with statutory remedies and fines', () => {
  const result = generateLegalNotice({
    type: NOTICE_TYPES.ONTARIO_LTB_T2,
    senderName: 'John Doe',
    senderAddress: '100 Main St Apt 4B, Toronto, ON',
    senderEmail: 'john@example.com',
    recipientName: 'Acme Property Management',
    recipientAddress: '500 Bay St, Toronto, ON',
    unitAddress: '100 Main St Apt 4B, Toronto, ON',
    incidentDate: '2026-10-15',
    issues: [
      'Landlord entered rental unit without 24 hours written notice on October 14 and 15.',
      'Superintendent shut off hot water supply for 4 consecutive days without emergency reason.'
    ]
  });

  assert.equal(result.documentType, NOTICE_TYPES.ONTARIO_LTB_T2);
  assert.ok(result.title.includes('LTB Form T2'));
  assert.ok(result.governingAct.includes('Residential Tenancies Act, 2006'));
  assert.ok(result.statutorySections.some(s => s.includes('Vital Services')));
  assert.ok(result.statutorySections.some(s => s.includes('Reasonable Enjoyment')));
  assert.ok(result.formalNoticeText.includes('s. 22'));
  assert.ok(result.formalNoticeText.includes('s. 21'));
  assert.ok(result.remediesDemanded.some(r => r.includes('$50,000')));
  assert.ok(result.statutoryWarnings.some(w => w.includes('1 year')));
  assert.ok(result.printReadyHtml.includes('John Doe'));
  assert.ok(result.printReadyHtml.includes('Acme Property Management'));
  assert.ok(result.printReadyHtml.includes('<!DOCTYPE html>'));
});

test('Legal Notice Generator — Generates Ontario LTB Form T6 maintenance notice with critical rent withholding warning', () => {
  const result = generateLegalNotice({
    type: NOTICE_TYPES.ONTARIO_LTB_T6,
    senderName: 'Jane Smith',
    senderAddress: '250 Queen St W, Toronto, ON',
    recipientName: 'Bob Landlord',
    recipientAddress: '10 King St, Toronto, ON',
    unitAddress: '250 Queen St W, Toronto, ON',
    incidentDate: '2026-09-01',
    issues: [
      'Primary heating system non-operational with indoor temperature below 20 degrees Celsius.',
      'Active black mold on bedroom ceiling caused by unresolved roof leak.'
    ]
  });

  assert.equal(result.documentType, NOTICE_TYPES.ONTARIO_LTB_T6);
  assert.ok(result.title.includes('LTB Form T6'));
  assert.ok(result.statutorySections.some(s => s.includes('RTA s. 20')));
  // Critical anti-eviction warning: must tell tenant NOT to unilaterally withhold rent
  assert.ok(result.statutoryWarnings.some(w => w.includes('CRITICAL STATUTORY MANDATE') && w.includes('withhold rent')));
  assert.ok(result.remediesDemanded.some(r => r.includes('rent abatement')));
  assert.ok(result.printReadyHtml.includes('black mold'));
});

test('Legal Notice Generator — Generates Workplace Safety Refusal notice with OHSA s. 50 reverse burden protection', () => {
  const result = generateLegalNotice({
    type: NOTICE_TYPES.WORKPLACE_SAFETY_REFUSAL,
    senderName: 'Carlos Worker',
    senderAddress: 'Mississauga, ON',
    recipientName: 'Mega Logistics Corp',
    recipientAddress: '100 Airport Rd, Mississauga, ON',
    incidentDate: '2026-10-28',
    issues: [
      'Braking system on forklift unit #4 failed during load transit with immediate rollover hazard.',
      'Supervisor instructed worker to operate defective equipment without safety inspection.'
    ]
  });

  assert.equal(result.documentType, NOTICE_TYPES.WORKPLACE_SAFETY_REFUSAL);
  assert.ok(result.statutorySections.some(s => s.includes('OHSA s. 43(3)')));
  assert.ok(result.statutorySections.some(s => s.includes('OHSA s. 50')));
  assert.ok(result.formalNoticeText.includes('Reverse Burden of Proof'));
  assert.ok(result.formalNoticeText.includes('Ontario Labour Relations Board'));
  assert.ok(result.printReadyHtml.includes('Mega Logistics Corp'));
});

test('Legal Notice Generator — Generates ESA Unpaid Wage demand with 14-day cure and 2-year limitation', () => {
  const result = generateLegalNotice({
    type: NOTICE_TYPES.ESA_UNPAID_WAGES,
    senderName: 'Priya Sharma',
    senderAddress: 'Brampton, ON',
    recipientName: 'Quick Retailers Inc',
    recipientAddress: '77 Commerce Way, Brampton, ON',
    totalClaimAmount: 3450.75,
    issues: [
      'Unpaid overtime for 80 hours worked in excess of 44 weekly hours under ESA s. 22.',
      'Unlawful wage deduction of $350 for till cash shortage in direct violation of ESA s. 13(2).'
    ]
  });

  assert.equal(result.documentType, NOTICE_TYPES.ESA_UNPAID_WAGES);
  assert.ok(result.formalNoticeText.includes('$3450.75 CAD'));
  assert.ok(result.formalNoticeText.includes('ESA s. 13'));
  assert.ok(result.formalNoticeText.includes('14 calendar days'));
  assert.ok(result.statutoryWarnings.some(w => w.includes('2 years')));
  assert.ok(result.printReadyHtml.includes('$3450.75 CAD'));
});

test('Legal Notice Generator — Generates Security Deposit return demand and IRCC Dual Intent LoE', () => {
  const deposit = generateLegalNotice({
    type: NOTICE_TYPES.SECURITY_DEPOSIT_RETURN,
    senderName: 'David Lee',
    senderAddress: 'Calgary, AB',
    recipientName: 'Calgary Rentals Ltd',
    recipientAddress: '100 8th Ave, Calgary, AB',
    totalClaimAmount: 1800,
    issues: ['Landlord failed to perform move-in inspection report under Alberta RTA s. 19(4)']
  });
  assert.ok(deposit.formalNoticeText.includes('Alberta RTA s. 19(4)'));
  assert.ok(deposit.formalNoticeText.includes('$1800.00'));

  const loe = generateLegalNotice({
    type: NOTICE_TYPES.IRCC_DUAL_INTENT_LOE,
    senderName: 'Fatima Al-Mansoor',
    senderAddress: 'Dubai, UAE',
    recipientName: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    recipientAddress: 'Case Processing Centre, Edmonton, AB',
    issues: ['Enrolled in Master of Science in Data Analytics at University of Alberta']
  });
  assert.ok(loe.formalNoticeText.includes('IRPA s. 22(2)'));
  assert.ok(loe.formalNoticeText.includes('IRPR s. 179'));
});
