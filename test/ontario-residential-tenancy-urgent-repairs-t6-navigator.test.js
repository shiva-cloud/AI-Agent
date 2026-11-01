import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_T6_MAINTENANCE_CONSTANTS,
  evaluateOntarioUrgentRepairsT6
} from '../src/ontario-residential-tenancy-urgent-repairs-t6-navigator.js';

test('Ontario T6 Urgent Repairs - Constants reflect RTA and O. Reg. 516/06', () => {
  assert.equal(ONTARIO_T6_MAINTENANCE_CONSTANTS.MIN_STATUTORY_HEATING_TEMP_CELSIUS, 20);
  assert.equal(ONTARIO_T6_MAINTENANCE_CONSTANTS.HEATING_SEASON_START_MONTH, 9);
  assert.equal(ONTARIO_T6_MAINTENANCE_CONSTANTS.HEATING_SEASON_END_MONTH, 6);
  assert.equal(ONTARIO_T6_MAINTENANCE_CONSTANTS.LTB_FILING_LIMITATION_YEARS, 1);
  assert.equal(ONTARIO_T6_MAINTENANCE_CONSTANTS.MAX_INDIVIDUAL_PROVINCIAL_FINE_CAD, 50000);
});

test('Ontario T6 Urgent Repairs - Compliant maintained premises', () => {
  const result = evaluateOntarioUrgentRepairsT6({
    vitalServiceInterrupted: false,
    indoorTemperatureCelsius: 22,
    calendarMonth: 1,
    landlordNotifiedInWriting: true,
    daysSinceWrittenNotice: 2,
    emergencyRepairIncurredByTenantCad: 0,
    monthlyRentCad: 2000,
    monthsOfDisrepair: 1,
    estimatedAbatementPercentage: 0
  });

  assert.equal(result.hasBreach, false);
  assert.equal(result.complianceStatus, 'NO_UNRESOLVED_MAINTENANCE_BREACH_DETECTED');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.financialSummary.totalMonetaryClaimCad, 0);
});

test('Ontario T6 Urgent Repairs - Vital service cut off triggers RHEU remedy', () => {
  const result = evaluateOntarioUrgentRepairsT6({
    vitalServiceInterrupted: true,
    monthlyRentCad: 2400,
    monthsOfDisrepair: 1,
    estimatedAbatementPercentage: 50
  });

  assert.equal(result.complianceStatus, 'URGENT_STATUTORY_MAINTENANCE_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_VITAL_SERVICE_INTERRUPTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CONTACT_RHEU_IMMEDIATE_INTERVENTION'));
  assert.equal(result.financialSummary.calculatedAbatementCad, 1200);
});

test('Ontario T6 Urgent Repairs - Winter substandard heating below 20°C', () => {
  const result = evaluateOntarioUrgentRepairsT6({
    calendarMonth: 12,
    indoorTemperatureCelsius: 16,
    landlordNotifiedInWriting: true,
    emergencyRepairIncurredByTenantCad: 350,
    monthlyRentCad: 2000,
    monthsOfDisrepair: 2,
    estimatedAbatementPercentage: 30
  });

  assert.equal(result.isHeatingSeason, true);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_INDOOR_HEATING_TEMPERATURE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'REQUEST_MUNICIPAL_PROPERTY_STANDARDS_INSPECTION'));
  // Abatement: 2000 * 0.3 * 2 = 1200 + 350 = 1550
  assert.equal(result.financialSummary.calculatedAbatementCad, 1200);
  assert.equal(result.financialSummary.totalMonetaryClaimCad, 1550);
});

test('Ontario T6 Urgent Repairs - Retaliatory conduct triggers anti-reprisal protection', () => {
  const result = evaluateOntarioUrgentRepairsT6({
    landlordRetaliationThreatened: true
  });

  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_RETALIATORY_CONDUCT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'SEEK_REPRISAL_PROTECTION_AND_FINE'));
});
