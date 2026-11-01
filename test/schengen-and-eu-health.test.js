import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSchengenStay, SCHENGEN_CONSTANTS } from '../src/schengen-calculator.js';
import { evaluateEuHealthRights, EU_HEALTH_CONSTANTS } from '../src/eu-health-rights-navigator.js';

test('Rec 32: Schengen 90/180-Day Rolling Calculator enforces Regulation (EU) 2016/399 Art. 6', () => {
  // Scenario 1: First-time visitor with 30 days spent -> 60 days remaining
  const stay1 = calculateSchengenStay({
    stays: [{ entryDate: '2026-08-01', exitDate: '2026-08-30' }],
    checkDate: '2026-10-31',
    plannedStayDays: 15
  });
  assert.equal(stay1.status, 'compliant');
  assert.equal(stay1.daysSpentInWindow, 30);
  assert.equal(stay1.daysRemaining, 60);
  assert.equal(stay1.canStayForPlannedDays, true);
  assert.equal(stay1.isOverstay, false);
  assert.equal(stay1.overstayDays, 0);

  // Scenario 2: Overstay detection (95 days inside the 180-day window)
  const overstay = calculateSchengenStay({
    stays: [
      { entryDate: '2026-06-01', exitDate: '2026-07-31' }, // 61 days
      { entryDate: '2026-09-01', exitDate: '2026-10-04' }  // 34 days = 95 total
    ],
    checkDate: '2026-10-31'
  });
  assert.equal(overstay.status, 'overstay');
  assert.equal(overstay.isOverstay, true);
  assert.equal(overstay.daysSpentInWindow, 95);
  assert.equal(overstay.overstayDays, 5);
  assert.match(overstay.guidance, /Overstay detected/i);

  // Scenario 3: Planned stay exceeds remaining balance
  const nearLimit = calculateSchengenStay({
    stays: [{ entryDate: '2026-08-01', exitDate: '2026-10-19' }], // 80 days
    checkDate: '2026-10-31',
    plannedStayDays: 20
  });
  assert.equal(nearLimit.status, 'planned_stay_exceeds');
  assert.equal(nearLimit.daysRemaining, 10);
  assert.equal(nearLimit.canStayForPlannedDays, false);

  // Scenario 4: Long-stay visa (Visa D) / Residence permit days are exempt from 90-day counter
  const visaDStay = calculateSchengenStay({
    stays: [
      { entryDate: '2026-05-01', exitDate: '2026-07-31', isResidencePermitOrVisaD: true },
      { entryDate: '2026-09-01', exitDate: '2026-09-15', isResidencePermitOrVisaD: false }
    ],
    checkDate: '2026-10-31'
  });
  assert.equal(visaDStay.daysSpentInWindow, 15);
  assert.equal(visaDStay.daysRemaining, 75);
});

test('Rec 30: EU Cross-Border Health Rights accurately determines S1, EHIC, and UK GHIC regimes', () => {
  // Scenario 1: UK State Pensioner moving to Spain -> S1 Certificate of Entitlement
  const pensioner = evaluateEuHealthRights({
    userCategory: 'pensioner',
    originCountry: 'UK',
    hostCountry: 'Spain',
    isStatePensioner: true
  });
  assert.equal(pensioner.applicableDocument, 'S1');
  assert.match(pensioner.documentName, /Portable Document S1/i);
  assert.match(pensioner.issuingBody, /NHS Overseas Healthcare Services/i);
  assert.match(pensioner.scopeOfCoverage, /Full comprehensive healthcare access/i);
  assert.equal(pensioner.isUkInvolved, true);

  // Scenario 2: UK tourist visiting France -> UK Global Health Insurance Card (UK GHIC)
  const ukTourist = evaluateEuHealthRights({
    userCategory: 'tourist_student',
    originCountry: 'UK',
    hostCountry: 'France'
  });
  assert.equal(ukTourist.applicableDocument, 'GHIC');
  assert.match(ukTourist.documentName, /UK Global Health Insurance Card/i);
  assert.match(ukTourist.scopeOfCoverage, /Emergency, urgent, and medically necessary/i);

  // Scenario 3: French tourist visiting Germany -> European Health Insurance Card (EHIC)
  const euTourist = evaluateEuHealthRights({
    userCategory: 'tourist_student',
    originCountry: 'France',
    hostCountry: 'Germany'
  });
  assert.equal(euTourist.applicableDocument, 'EHIC');
  assert.match(euTourist.documentName, /European Health Insurance Card/i);

  // Scenario 4: Pre-authorized planned medical treatment -> S2 Form
  const planned = evaluateEuHealthRights({
    userCategory: 'planned_treatment',
    originCountry: 'Ireland',
    hostCountry: 'Germany'
  });
  assert.equal(planned.applicableDocument, 'S2');
  assert.match(planned.documentName, /S2 Certificate for Planned Medical Treatment/i);
});
