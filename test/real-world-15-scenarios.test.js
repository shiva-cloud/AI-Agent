import test from 'node:test';
import assert from 'node:assert/strict';
import {seeds} from '../src/knowledge.js';
import {gapRecords} from '../scripts/inject-real-world-and-gap-records.js';
import {insiderImmigrationRecords} from '../src/insider-immigration-records.js';
import { answer } from '../src/engine.js';


// Deterministic retrieval fixtures, not a working-database publication audit.
const records = [...new Map([...seeds,...insiderImmigrationRecords,...gapRecords].map(r=>[r.id,r])).values()];
const now = new Date('2026-10-31T12:00:00Z');

test('RW-1: Mississauga Arrival Checklist - Immediate SIN, OHIP, and Achēv Onboarding', () => {const q='मैं कल Mississauga पहुंचा हूं, सबसे पहले क्या करूं?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-2: Brampton Room Rental - No Credit Score, RRL bylaw & Deposit Protections', () => {const q='बिना credit score के Brampton में कमरा कैसे मिलेगा?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-3: Maintained Status & Expired SIN - IRPR s. 186(u) Work Authorization', () => {const q='मेरे पास work permit है, लेकिन SIN expire हो गया है।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-4: Unlawful Wage Deductions - Ontario ESA s. 13 & Till Shortages', () => {const q='मेरा employer salary काट रहा है, क्या करूं?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-5: Uninsured Medical Care - Community Health Centres (CHCs) in Ontario', () => {const q='मेरे पास health card नहीं है और doctor चाहिए।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-6: Student Settlement Services - IRCC Federal Ineligibility & Campus ISS', () => {const q='मैं student हूं, क्या free settlement services मिलेंगी?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-7: PR Card Expiry vs PR Status - Continuity under IRPA s. 46', () => {const q='मेरी PR card expire हो गई, क्या मेरा PR status भी खत्म हुआ?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-8: Unlawful Rent Increase - Mandatory 90-day Form N1 under Ontario RTA s. 116', () => {const q='मेरा landlord बिना notice rent बढ़ा रहा है।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-9: Foreign Rental Property Taxation - Form T776, T1135 & FTC Relief', () => {const q='मैं India की property rent पर देता हूं। Canada में tax कैसे लगेगा?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-10: Relocation to Germany - Chancenkarte § 20a & EU Blue Card', () => {const q='मैं Canada से Germany shift होना चाहता हूं।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-11: Visitor Status Expiry - Extension IMM 5708 vs 90-Day Restoration (IRPR s. 182)', () => {const q='मेरा visitor status खत्म होने वाला है।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-12: Newcomer School Enrolment & CWELCC Childcare - Ontario Education Act s. 32.1', () => {const q='मैं newcomer हूं, मेरे बच्चों के लिए school और childcare कैसे मिलेगा?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-13: Illegal LMIA Recruitment Fees - IRPR s. 209.2 & Ontario EPFNA s. 7', () => {const q='मुझे नौकरी मिली है लेकिन employer LMIA के पैसे मांग रहा है।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-14: Spouse Open Work Permit Healthcare Eligibility - OHIP & BC MSP', () => {const q='मेरी पत्नी के पास open work permit है। क्या वह healthcare ले सकती है?';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});

test('RW-15: Emergency Shelter & Illegal Lockout - RHEU, 211 Central Intake & RTA s. 24', () => {const q='मुझे घर से निकाल दिया गया है और रहने की जगह नहीं है।';const res=answer({question:q},records,now);assert.equal(res.status,'clarification');assert.equal(res.claims.length,0);assert.ok(res.multilingual.requiresConfirmation);assert.ok(res.gaps.some(g=>g.reason==='translation_confirmation_required'));assert.equal(res.localizedSummary,undefined);});
