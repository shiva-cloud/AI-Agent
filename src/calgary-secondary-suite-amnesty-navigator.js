// src/calgary-secondary-suite-amnesty-navigator.js
// City of Calgary Secondary Suite Registration & Safety Amnesty Engine
// Statutory Basis: City of Calgary Land Use Bylaw 1P2007, Bylaw 28P2024 (R-CG Rezoning),
// & National Building Code – Alberta Edition (NBC-AE) Part 9

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CALGARY_SUITE_RULES = {
  BYLAW: 'City of Calgary Land Use Bylaw 1P2007 & Bylaw 28P2024',
  BUILDING_CODE: 'National Building Code – 2023 Alberta Edition (NBC-AE)',
  MIN_EGRESS_WINDOW_AREA_SQ_M: 0.35, // 3.77 sq ft
  MIN_EGRESS_WINDOW_DIMENSION_MM: 380, // 15 inches
  MIN_WINDOW_WELL_CLEARANCE_MM: 760, // 30 inches outward clearance
  MIN_CEILING_HEIGHT_METRES: 1.95, // 6 ft 5 in
  MANDATORY_SAFETY_ELEMENTS: [
    'interconnected_smoke_alarms',
    'carbon_monoxide_alarms',
    'bedroom_egress_windows',
    'fire_separation_drywall',
    'independent_or_dampered_hvac',
    'independent_exterior_exit'
  ]
};

/**
 * Evaluates a Calgary secondary suite against municipal zoning and life-safety building codes.
 *
 * @param {Object} input
 * @param {string} input.suiteType - 'basement_suite', 'backyard_suite', 'garden_suite'
 * @param {boolean} input.hasInterconnectedSmokeAlarms - Alarms ring simultaneously in primary home and suite
 * @param {boolean} input.hasCarbonMonoxideAlarm - CO alarm located within 5m of every bedroom
 * @param {number} input.bedroomWindowOpeningAreaSqM - Unobstructed openable area of bedroom window in m^2
 * @param {number} input.bedroomWindowMinDimensionMm - Smallest dimension of openable portion in mm
 * @param {number} input.windowWellClearanceMm - Distance from window to window well wall in mm (if below ground)
 * @param {number} input.ceilingHeightMetres - Measured ceiling height in metres
 * @param {boolean} input.hasDrywallFireSeparation - 1/2-inch or 5/8-inch Type X drywall between units and furnace room
 * @param {boolean} input.hasCompliantHvacSystem - Dedicated furnace OR approved interlocked smoke damper system
 * @param {boolean} input.hasDirectExteriorExit - Private entrance or direct exit not shared with homeowner private rooms
 * @param {boolean} input.isRegisteredOnCalgaryRegistry - Currently listed on City of Calgary Secondary Suite Registry
 * @param {string} [input.propertyAddress] - Property civic address
 * @param {string} [input.ownerName] - Property owner name
 * @param {string} [input.assessmentDate] - ISO date string
 * @returns {Object} Deterministic compliance audit, life-safety checklist, and registry roadmap
 */
export function auditCalgarySecondarySuite(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    suiteType = 'basement_suite',
    hasInterconnectedSmokeAlarms = false,
    hasCarbonMonoxideAlarm = false,
    bedroomWindowOpeningAreaSqM = 0.38,
    bedroomWindowMinDimensionMm = 400,
    windowWellClearanceMm = 800,
    ceilingHeightMetres = 2.05,
    hasDrywallFireSeparation = false,
    hasCompliantHvacSystem = false,
    hasDirectExteriorExit = true,
    isRegisteredOnCalgaryRegistry = false,
    propertyAddress = '123 Centre St, Calgary, AB',
    ownerName = 'Property Owner',
    assessmentDate = todayIso()
  } = safeInput;

  const cleanPropertyAddress = boundedText(propertyAddress, '123 Centre St, Calgary, AB', 120);
  const cleanOwnerName = boundedText(ownerName, 'Property Owner', 100);
  const cleanSuiteType = boundedText(suiteType, 'basement_suite', 50);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const safetyDeficiencies = [];
  const compliancePoints = [];
  const requiredActionPlan = [];

  // 1. Interconnected Smoke Alarms
  if (!hasInterconnectedSmokeAlarms) {
    safetyDeficiencies.push({
      item: 'Interconnected Smoke Alarms',
      statutoryRef: 'NBC-AE s. 9.10.19',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: 'Smoke alarms must be interconnected so that when one alarm sounds in the main dwelling or suite, all alarms sound throughout the entire building.'
    });
    requiredActionPlan.push('Install interconnected smoke alarms (hardwired or wireless 10-year sealed lithium) on each level and in all bedrooms.');
  } else {
    compliancePoints.push('Interconnected smoke alarm system verified.');
  }

  // 2. Carbon Monoxide Alarms
  if (!hasCarbonMonoxideAlarm) {
    safetyDeficiencies.push({
      item: 'Carbon Monoxide Alarm',
      statutoryRef: 'NBC-AE s. 9.32.3.9',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: 'A carbon monoxide alarm is mandatory within 5 metres of every bedroom door in suites containing fuel-burning appliances or attached garages.'
    });
    requiredActionPlan.push('Install certified CO alarms within 5 metres of all sleeping rooms.');
  } else {
    compliancePoints.push('Carbon monoxide alarms compliant.');
  }

  // 3. Bedroom Egress Windows
  const windowArea = Number.isFinite(Number(bedroomWindowOpeningAreaSqM)) ? Math.max(0, Math.min(50, Number(bedroomWindowOpeningAreaSqM))) : 0.38;
  const windowDim = Number.isFinite(Number(bedroomWindowMinDimensionMm)) ? Math.max(0, Math.min(10000, Number(bedroomWindowMinDimensionMm))) : 400;
  const wellClearance = Number.isFinite(Number(windowWellClearanceMm)) ? Math.max(0, Math.min(10000, Number(windowWellClearanceMm))) : 800;

  if (windowArea < CALGARY_SUITE_RULES.MIN_EGRESS_WINDOW_AREA_SQ_M) {
    safetyDeficiencies.push({
      item: 'Bedroom Egress Window Area',
      statutoryRef: 'NBC-AE s. 9.9.10.1',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: `Window opening area of ${windowArea} m² is below the statutory minimum of ${CALGARY_SUITE_RULES.MIN_EGRESS_WINDOW_AREA_SQ_M} m² (3.77 sq ft).`
    });
    requiredActionPlan.push('Enlarge bedroom window to provide at least 0.35 m² of clear, unobstructed opening for emergency egress.');
  } else if (windowDim < CALGARY_SUITE_RULES.MIN_EGRESS_WINDOW_DIMENSION_MM) {
    safetyDeficiencies.push({
      item: 'Bedroom Egress Window Dimension',
      statutoryRef: 'NBC-AE s. 9.9.10.1',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: `Window dimension of ${windowDim} mm is narrower than the statutory 380 mm minimum dimension.`
    });
    requiredActionPlan.push('Replace window sash to ensure no openable dimension is less than 380 mm.');
  } else {
    compliancePoints.push(`Compliant bedroom egress window (${windowArea} m², min dimension ${windowDim} mm).`);
  }

  // Window well check for basement suites
  if (cleanSuiteType === 'basement_suite' && wellClearance < CALGARY_SUITE_RULES.MIN_WINDOW_WELL_CLEARANCE_MM) {
    safetyDeficiencies.push({
      item: 'Window Well Clearance',
      statutoryRef: 'NBC-AE s. 9.9.10.1(3)',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: `Window well outward clearance is ${wellClearance} mm. A minimum of ${CALGARY_SUITE_RULES.MIN_WINDOW_WELL_CLEARANCE_MM} mm (30 inches) outward clearance is required.`
    });
    requiredActionPlan.push('Excavate window well to establish minimum 760 mm clear opening in front of the window.');
  }

  // 4. Ceiling Height
  const ceiling = Number.isFinite(Number(ceilingHeightMetres)) ? Math.max(0, Math.min(10, Number(ceilingHeightMetres))) : 2.05;
  if (ceiling < CALGARY_SUITE_RULES.MIN_CEILING_HEIGHT_METRES) {
    safetyDeficiencies.push({
      item: 'Minimum Ceiling Clearance',
      statutoryRef: 'NBC-AE s. 9.5.3.1',
      severity: 'BUILDING_CODE_NON_COMPLIANCE',
      message: `Ceiling height of ${ceiling} m is below the permitted minimum of ${CALGARY_SUITE_RULES.MIN_CEILING_HEIGHT_METRES} m (6 ft 5 in).`
    });
    requiredActionPlan.push('Review ceiling joist cavity alternatives or apply for a City of Calgary Building Safety variance.');
  } else {
    compliancePoints.push(`Ceiling height clearance compliant (${ceiling} m >= 1.95 m).`);
  }

  // 5. Fire Separation
  if (!hasDrywallFireSeparation) {
    safetyDeficiencies.push({
      item: 'Drywall Fire Separation',
      statutoryRef: 'NBC-AE s. 9.10.9.14',
      severity: 'HIGH',
      message: 'Ceilings and shared demising walls between the primary dwelling and the suite, as well as furnace room enclosures, require 1/2-inch drywall (or 45-minute fire-rated assembly).'
    });
    requiredActionPlan.push('Install continuous 1/2-inch drywall fire separation on ceilings, walls, and furnace room boundaries.');
  } else {
    compliancePoints.push('Drywall fire separation verified between units.');
  }

  // 6. HVAC & Heating
  if (!hasCompliantHvacSystem) {
    safetyDeficiencies.push({
      item: 'Dedicated or Dampered HVAC System',
      statutoryRef: 'NBC-AE s. 9.32 & City of Calgary Advisory Bulletin',
      severity: 'HIGH',
      message: 'Air duct sharing between units must be eliminated through a dedicated second heating system (e.g., baseboards, heat pump, second furnace) or an approved interlocked fire/smoke damper system.'
    });
    requiredActionPlan.push('Install electric baseboard heating/ductless mini-split, or install City-approved smoke dampers on shared ductwork.');
  } else {
    compliancePoints.push('Heating and air distribution system is compliant.');
  }

  // 7. Direct Exterior Exit
  if (!hasDirectExteriorExit) {
    safetyDeficiencies.push({
      item: 'Direct Exterior Egress',
      statutoryRef: 'NBC-AE s. 9.9.9',
      severity: 'LIFE_SAFETY_CRITICAL',
      message: 'Tenant must have a private exterior entrance or access to an independent shared foyer without traversing homeowner living areas.'
    });
    requiredActionPlan.push('Construct dedicated exterior entrance door or separate common corridor.');
  } else {
    compliancePoints.push('Direct private exterior entrance confirmed.');
  }

  // 8. Calgary Secondary Suite Registry Audit
  const isFullyCompliant = safetyDeficiencies.length === 0;
  if (!isRegisteredOnCalgaryRegistry) {
    requiredActionPlan.push('Apply for the City of Calgary Secondary Suite Registry Sticker upon passing final building/safety inspection to secure municipal amnesty and legal suite listing.');
  } else {
    compliancePoints.push('Currently registered on the City of Calgary Secondary Suite Registry.');
  }

  return {
    assessmentDate: cleanAssessmentDate,
    propertyAddress: cleanPropertyAddress,
    ownerName: cleanOwnerName,
    suiteType: cleanSuiteType,
    statutoryAuthority: `${CALGARY_SUITE_RULES.BYLAW} & ${CALGARY_SUITE_RULES.BUILDING_CODE}`,
    isCodeCompliant: isFullyCompliant,
    isRegisteredOnCalgaryRegistry,
    registryReadinessStatus: isFullyCompliant ? 'READY_FOR_REGISTRY_STICKER' : 'REMEDIATION_REQUIRED',
    summary: isFullyCompliant
      ? `${cleanPropertyAddress} satisfies City of Calgary Land Use and National Building Code life-safety standards for secondary suite legalization.`
      : `${cleanPropertyAddress} has ${safetyDeficiencies.length} life-safety deficiency/deficiencies requiring remediation prior to official secondary suite registration.`,
    safetyDeficiencies,
    compliancePoints,
    requiredActionPlan,
    jurisdiction: 'City of Calgary, Alberta, Canada'
  };
}
