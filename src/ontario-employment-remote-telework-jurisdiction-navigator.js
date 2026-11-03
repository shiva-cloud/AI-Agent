/**
 * Ontario Employment Standards Act (ESA) Remote & Telework Jurisdiction Navigator
 *
 * Implements statutory assessment rules under:
 * - Employment Standards Act, 2000, S.O. 2000, c. 41:
 *   - Section 3(1): Scope of the Act (Physical work performed in Ontario & continuation test)
 *   - Section 54 & 57: Individual statutory notice of termination
 *   - Section 58: Group terminations as amended by Bill 79 (Remote employees included in 50+ headcount)
 *   - Part VII.0.1 (Section 21.1.2): Mandatory Written Policy on Disconnecting from Work (25+ employees)
 *   - Section 67.2: Statutory ban on non-compete agreements (post-October 25, 2021)
 * - Working for Workers Act, 2023 (Bill 79)
 * - Leading Jurisprudence:
 *   - Shuttleworth v. Ontario, 2019 ONCA 503
 *   - Raza v. Canadian Broadcasting Corporation, 2020 ONSC 6445
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ON_DISCONNECTING_POLICY_MIN_EMPLOYEES = 25;
export const ON_BILL_79_EFFECTIVE_DATE = '2023-10-26';
export const ON_NON_COMPETE_BAN_DATE = '2021-10-25';

export function evaluateOntarioRemoteWorkJurisdiction(params = {}) {
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    employeePhysicalWorkLocation = 'ONTARIO', // 'ONTARIO', 'OTHER_CANADIAN_PROVINCE', 'INTERNATIONAL'
    employerHeadquartersLocation = 'BRITISH_COLUMBIA', // 'ONTARIO', 'OTHER_CANADIAN_PROVINCE', 'UNITED_STATES', 'INTERNATIONAL'
    worksExclusivelyFromHome = true,
    employerTotalOntarioHeadcount = 30,
    hasWrittenDisconnectingFromWorkPolicy = false,
    hasNonCompeteClauseInContract = false,
    contractSignedDate = '2023-01-15',
    isExecutiveOrCSuite = false,
    isGroupTerminationEvent = false,
    totalRemoteEmployeesTerminated = 0,
    totalInOfficeEmployeesTerminated = 0,
    employeeTenureMonths = 36,
    weeklySalaryCad = 1500,
    assessmentDate = todayIso()
  } = params;

  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeContractSignedDate = safeIsoDate(contractSignedDate, '2023-01-15');

  const physicalLoc = boundedText(employeePhysicalWorkLocation, 'ONTARIO', 50).toUpperCase();
  const employerHq = boundedText(employerHeadquartersLocation, 'BRITISH_COLUMBIA', 50).toUpperCase();
  const homeWorker = Boolean(worksExclusivelyFromHome);
  const headcount = Math.max(0, Math.min(1000000, Math.floor(Number(employerTotalOntarioHeadcount) || 0)));
  const hasDisconnectingPolicy = Boolean(hasWrittenDisconnectingFromWorkPolicy);
  const hasNonCompete = Boolean(hasNonCompeteClauseInContract);
  const isExec = Boolean(isExecutiveOrCSuite);
  const isGroupTerm = Boolean(isGroupTerminationEvent);
  const tenureMonths = Math.max(0, Math.min(600, Math.floor(Number(employeeTenureMonths) || 0)));
  const salary = Math.max(0, Math.min(1000000, Number(weeklySalaryCad) || 0));

  const statutoryFindings = [];
  const jurisdictionalAssessment = {};
  const complianceViolations = [];
  const actionableRemedies = [];

  // 1. Jurisdictional Test under Section 3(1)
  const isPhysicallyWorkingInOntario = physicalLoc === 'ONTARIO';
  jurisdictionalAssessment.isPhysicallyInOntario = isPhysicallyWorkingInOntario;
  jurisdictionalAssessment.employerHeadquarters = employerHq;

  if (isPhysicallyWorkingInOntario) {
    jurisdictionalAssessment.governingStatute = 'Ontario Employment Standards Act, 2000 (ESA)';
    jurisdictionalAssessment.hasOntarioEsaJurisdiction = true;
    statutoryFindings.push({
      finding: 'MANDATORY_ONTARIO_ESA_JURISDICTION',
      section: 'Ontario ESA s. 3(1), para 1',
      details: `Because the employee physically performs work within Ontario, the Ontario ESA applies mandatorily, regardless of employer headquarters in ${employerHq} (Shuttleworth v. Ontario; Raza v. CBC).`
    });
  } else {
    jurisdictionalAssessment.governingStatute = `Jurisdiction of physical workplace (${physicalLoc})`;
    jurisdictionalAssessment.hasOntarioEsaJurisdiction = false;
    statutoryFindings.push({
      finding: 'OUT_OF_PROVINCE_WORK_LOCATION',
      section: 'Ontario ESA s. 3(1)',
      details: `Employee performs work physically in ${physicalLoc}. Ontario ESA does not govern unless the work is a direct continuation of prior Ontario employment.`
    });
    return {
      assessmentDate: safeAssessmentDate,
      hasOntarioEsaJurisdiction: false,
      legalVerdict: 'OUTSIDE_ONTARIO_ESA_JURISDICTION',
      jurisdictionalAssessment,
      statutoryFindings,
      complianceViolations: [],
      actionableRemedies: ['File claim under the employment standards legislation of the province/state where work is physically performed.']
    };
  }

  // 2. Bill 79 Remote Worker Group Termination Inclusion (ESA s. 58)
  let isGroupTerminationTriggered = false;
  let groupNoticeWeeks = 0;
  const remoteTerminated = Math.max(0, Math.min(1000000, Math.floor(Number(totalRemoteEmployeesTerminated) || 0)));
  const inOfficeTerminated = Math.max(0, Math.min(1000000, Math.floor(Number(totalInOfficeEmployeesTerminated) || 0)));
  const totalCombinedTerminations = remoteTerminated + inOfficeTerminated;

  if (isGroupTerm || totalCombinedTerminations >= 50) {
    // Under Bill 79, remote employees are legally counted in the 50+ threshold
    isGroupTerminationTriggered = totalCombinedTerminations >= 50;
    if (totalCombinedTerminations >= 300) {
      groupNoticeWeeks = 16;
    } else if (totalCombinedTerminations >= 100) {
      groupNoticeWeeks = 12;
    } else if (totalCombinedTerminations >= 50) {
      groupNoticeWeeks = 8;
    }

    statutoryFindings.push({
      finding: 'BILL_79_REMOTE_WORKER_GROUP_TERMINATION',
      section: 'Ontario ESA s. 58 & Bill 79',
      details: `Under Working for Workers Act, 2023 (Bill 79), ${remoteTerminated} remote employee(s) are included in the establishment count. Total terminations (${totalCombinedTerminations}) trigger ${groupNoticeWeeks} weeks statutory group notice.`
    });
  }

  // 3. Disconnecting from Work Policy Mandate (Part VII.0.1, s. 21.1.2)
  if (headcount >= ON_DISCONNECTING_POLICY_MIN_EMPLOYEES) {
    if (hasDisconnectingPolicy) {
      statutoryFindings.push({
        finding: 'DISCONNECTING_FROM_WORK_POLICY_COMPLIANT',
        section: 'Ontario ESA s. 21.1.2',
        details: 'Employer has implemented the mandatory written policy on disconnecting from work.'
      });
    } else {
      complianceViolations.push({
        violation: 'MISSING_DISCONNECTING_FROM_WORK_POLICY',
        section: 'Ontario ESA s. 21.1.2',
        details: `Employer with ${headcount} employees (threshold: 25+) lacks a mandatory written disconnecting from work policy covering remote workers.`
      });
      actionableRemedies.push('Employer must draft and distribute a written Disconnecting from Work Policy to all employees within 30 days of reaching 25 employees.');
    }
  }

  // 4. Non-Compete Agreement Ban (ESA s. 67.2)
  if (hasNonCompete && !isExec) {
    const signedDate = new Date(safeContractSignedDate + 'T00:00:00Z');
    const banDate = new Date(ON_NON_COMPETE_BAN_DATE + 'T00:00:00Z');
    if (signedDate >= banDate) {
      complianceViolations.push({
        violation: 'VOID_NON_COMPETE_AGREEMENT',
        section: 'Ontario ESA s. 67.2',
        details: `Non-compete clause entered into on ${safeContractSignedDate} (after October 25, 2021) is statutorily void and unenforceable by operation of law.`
      });
      actionableRemedies.push('Non-compete clause is legally unenforceable; employee may freely seek employment with competitors without legal restraint under s. 67.2.');
    }
  }

  // 5. Individual Notice / Severance Entitlement
  const tenureYears = Math.floor(tenureMonths / 12);
  const individualNoticeWeeks = Math.max(1, Math.min(8, tenureYears));
  const individualNoticePayCad = individualNoticeWeeks * salary;

  const isCompliant = complianceViolations.length === 0;

  return {
    employeeName: cleanEmployee,
    employerName: cleanEmployer,
    assessmentDate: safeAssessmentDate,
    hasOntarioEsaJurisdiction: true,
    legalVerdict: isCompliant ? 'ONTARIO_ESA_FULLY_APPLICABLE_AND_COMPLIANT' : 'ONTARIO_ESA_STATUTORY_VIOLATION_DETECTED',
    jurisdictionalAssessment,
    remoteWorkerAudit: {
      worksExclusivelyFromHome: homeWorker,
      headcount,
      isCoveredByBill79GroupTermination: isGroupTerminationTriggered,
      groupNoticeWeeksEntitlement: groupNoticeWeeks,
      individualNoticeWeeksEntitlement: individualNoticeWeeks,
      individualNoticePayCad
    },
    statutoryFindings,
    complianceViolations,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 3(1), 21.1.2, 54, 57, 58, 67.2',
      'Working for Workers Act, 2023 (Bill 79)',
      'Shuttleworth v. Ontario (Safety, Licensing Appeals and Standards Tribunals), 2019 ONCA 503',
      'Raza v. Canadian Broadcasting Corporation, 2020 ONSC 6445'
    ]
  };
}
