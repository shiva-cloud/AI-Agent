// test/calgary-secondary-suite-amnesty-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditCalgarySecondarySuite,
  CALGARY_SUITE_RULES
} from '../src/calgary-secondary-suite-amnesty-navigator.js';

test('Calgary Secondary Suite — Constants match Calgary bylaws and NBC-AE', () => {
  assert.equal(CALGARY_SUITE_RULES.MIN_EGRESS_WINDOW_AREA_SQ_M, 0.35);
  assert.equal(CALGARY_SUITE_RULES.MIN_EGRESS_WINDOW_DIMENSION_MM, 380);
  assert.equal(CALGARY_SUITE_RULES.MIN_WINDOW_WELL_CLEARANCE_MM, 760);
  assert.equal(CALGARY_SUITE_RULES.MIN_CEILING_HEIGHT_METRES, 1.95);
  assert.ok(CALGARY_SUITE_RULES.MANDATORY_SAFETY_ELEMENTS.includes('interconnected_smoke_alarms'));
});

test('Calgary Secondary Suite — Compliant suite qualifies for registry sticker', () => {
  const result = auditCalgarySecondarySuite({
    suiteType: 'basement_suite',
    hasInterconnectedSmokeAlarms: true,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.45,
    bedroomWindowMinDimensionMm: 450,
    windowWellClearanceMm: 900,
    ceilingHeightMetres: 2.15,
    hasDrywallFireSeparation: true,
    hasCompliantHvacSystem: true,
    hasDirectExteriorExit: true,
    isRegisteredOnCalgaryRegistry: false,
    propertyAddress: '4502 17 Ave NW, Calgary, AB'
  });

  assert.equal(result.isCodeCompliant, true);
  assert.equal(result.registryReadinessStatus, 'READY_FOR_REGISTRY_STICKER');
  assert.equal(result.safetyDeficiencies.length, 0);
  assert.ok(result.compliancePoints.length >= 6);
  assert.ok(result.requiredActionPlan.some(a => a.includes('Secondary Suite Registry Sticker')));
});

test('Calgary Secondary Suite — Flags missing interconnected smoke alarms and small window', () => {
  const result = auditCalgarySecondarySuite({
    suiteType: 'basement_suite',
    hasInterconnectedSmokeAlarms: false,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.25, // Too small (< 0.35)
    bedroomWindowMinDimensionMm: 350, // Narrow (< 380)
    windowWellClearanceMm: 500, // Too narrow (< 760)
    ceilingHeightMetres: 2.0,
    hasDrywallFireSeparation: true,
    hasCompliantHvacSystem: true,
    hasDirectExteriorExit: true
  });

  assert.equal(result.isCodeCompliant, false);
  assert.equal(result.registryReadinessStatus, 'REMEDIATION_REQUIRED');
  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Interconnected Smoke Alarms'));
  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Bedroom Egress Window Area'));
  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Window Well Clearance'));
});

test('Calgary Secondary Suite — Flags low ceiling under 1.95m', () => {
  const result = auditCalgarySecondarySuite({
    ceilingHeightMetres: 1.85, // Low ceiling
    hasInterconnectedSmokeAlarms: true,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.40,
    bedroomWindowMinDimensionMm: 400,
    windowWellClearanceMm: 800,
    hasDrywallFireSeparation: true,
    hasCompliantHvacSystem: true,
    hasDirectExteriorExit: true
  });

  assert.equal(result.isCodeCompliant, false);
  const ceilingDef = result.safetyDeficiencies.find(d => d.item === 'Minimum Ceiling Clearance');
  assert.ok(ceilingDef);
  assert.equal(ceilingDef.severity, 'BUILDING_CODE_NON_COMPLIANCE');
});

test('Calgary Secondary Suite — Flags shared ductwork and missing exterior exit', () => {
  const result = auditCalgarySecondarySuite({
    hasInterconnectedSmokeAlarms: true,
    hasCarbonMonoxideAlarm: true,
    bedroomWindowOpeningAreaSqM: 0.40,
    bedroomWindowMinDimensionMm: 400,
    windowWellClearanceMm: 800,
    ceilingHeightMetres: 2.1,
    hasDrywallFireSeparation: false,
    hasCompliantHvacSystem: false, // Shared ducts
    hasDirectExteriorExit: false // No direct exit
  });

  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Dedicated or Dampered HVAC System'));
  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Direct Exterior Egress'));
  assert.ok(result.safetyDeficiencies.some(d => d.item === 'Drywall Fire Separation'));
});
