import { readFileSync, writeFileSync } from 'node:fs';

const openapiPath = './docs/openapi.json';
const spec = JSON.parse(readFileSync(openapiPath, 'utf8'));

const defaultErrorResponse = {
  description: 'JSON API failure. Some failures include additional context.',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' }
        },
        required: ['error', 'code'],
        additionalProperties: true
      }
    }
  }
};

function addToolRoute(pathName, opIdBase, getProps, postProps, postRequired) {
  spec.paths[pathName] = {
    get: {
      operationId: `get__${opIdBase}`,
      security: [],
      parameters: [],
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: getProps,
                additionalProperties: true
              }
            }
          }
        },
        default: defaultErrorResponse
      }
    },
    post: {
      operationId: `post__${opIdBase}`,
      security: [],
      parameters: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: postProps,
              required: postRequired,
              additionalProperties: true
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: getProps,
                additionalProperties: true
              }
            }
          }
        },
        default: defaultErrorResponse
      }
    }
  };
}

// 1. Alberta Opportunity Stream
addToolRoute(
  '/v1/tools/alberta-opportunity-stream',
  'v1_tools_alberta_opportunity_stream',
  { stream: { type: 'string' }, eligible: { type: 'boolean' }, points: { type: 'number' } },
  { nocCode: { type: 'string' }, workPermitType: { type: 'string' } },
  ['nocCode']
);

// 2. BC Speculation Tax Declaration
addToolRoute(
  '/v1/tools/bc-speculation-tax-declaration',
  'v1_tools_bc_speculation_tax_declaration',
  { taxAmountCad: { type: 'number' }, isExempt: { type: 'boolean' }, region: { type: 'string' } },
  { propertyRegion: { type: 'string' }, assessedPropertyValueCad: { type: 'number' } },
  ['propertyRegion']
);

// 3. PRTD Humanitarian
addToolRoute(
  '/v1/tools/prtd-humanitarian',
  'v1_tools_prtd_humanitarian',
  { assessmentDate: { type: 'string' }, isHncRecommended: { type: 'boolean' }, daysShort: { type: 'number' } },
  { daysPhysicallyInCanadaLast5Years: { type: 'number' }, reasonForAbsenceCategory: { type: 'string' } },
  ['daysPhysicallyInCanadaLast5Years']
);

// 4. Severance Reasonable Notice
addToolRoute(
  '/v1/tools/severance-reasonable-notice',
  'v1_tools_severance_reasonable_notice',
  { estimatedNoticePeriodMonths: { type: 'number' }, statutoryNoticeWeeks: { type: 'number' } },
  { yearsOfService: { type: 'number' }, annualSalaryCad: { type: 'number' } },
  ['yearsOfService']
);

// 5. Manitoba PNP Skilled Worker
addToolRoute(
  '/v1/tools/manitoba-pnp-skilled-worker',
  'v1_tools_manitoba_pnp_skilled_worker',
  { totalScore: { type: 'number' }, streamStatus: { type: 'string' }, eligible: { type: 'boolean' } },
  { monthsWorkedInManitoba: { type: 'number' }, firstLanguageClb: { type: 'number' } },
  ['monthsWorkedInManitoba']
);

// 6. Global Visa Matrix
addToolRoute(
  '/v1/tools/global-visa-matrix',
  'v1_tools_global_visa_matrix',
  {
    assessmentDate: { type: 'string' },
    candidateProfile: { type: 'object' },
    eligiblePathwaysCount: { type: 'number' },
    eligiblePathways: { type: 'array', items: { type: 'object' } },
    restrictedPathways: { type: 'array', items: { type: 'object' } }
  },
  { educationLevel: { type: 'string' }, yearsExperience: { type: 'number' } },
  ['educationLevel']
);

// 7. Moving Tax Calc
addToolRoute(
  '/v1/tools/moving-tax-calc',
  'v1_tools_moving_tax_calc',
  {
    taxYear: { type: 'number' },
    province: { type: 'string' },
    eligibilityCheck: { type: 'object' },
    expenseBreakdown: { type: 'object' },
    taxOptimization: { type: 'object' }
  },
  { distanceOldHomeToNewWorkKm: { type: 'number' }, distanceNewHomeToNewWorkKm: { type: 'number' } },
  ['distanceOldHomeToNewWorkKm']
);

// 8. Severance Bardal
addToolRoute(
  '/v1/tools/severance-bardal',
  'v1_tools_severance_bardal',
  {
    assessmentDate: { type: 'string' },
    profileAudit: { type: 'object' },
    statutoryMinimumEntitlement: { type: 'object' },
    commonLawEntitlement: { type: 'object' }
  },
  { employeeAge: { type: 'number' }, yearsOfService: { type: 'number' } },
  ['yearsOfService']
);

// 9. Statutory Glossary
spec.paths['/v1/glossary'] = {
  get: {
    operationId: 'get__v1_glossary',
    security: [],
    parameters: [],
    responses: {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalTerms: { type: 'number' },
                terms: { type: 'array', items: { type: 'object' } }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: defaultErrorResponse
    }
  }
};

// 10. Realtime Atom Feed XML
spec.paths['/v1/realtime/feed.xml'] = {
  get: {
    operationId: 'get__v1_realtime_feed_xml',
    security: [],
    parameters: [],
    responses: {
      '200': {
        description: 'Atom XML feed of policy updates',
        content: {
          'application/atom+xml': {
            schema: {
              type: 'string'
            }
          }
        }
      },
      default: defaultErrorResponse
    }
  }
};

// 11. SINP Hard-to-Fill Skills
addToolRoute(
  '/v1/tools/sinp-hard-to-fill',
  'v1_tools_sinp_hard_to_fill',
  { isEligible: { type: 'boolean' }, qualificationScore: { type: 'number' }, streams: { type: 'array', items: { type: 'string' } } },
  { nocCode: { type: 'string' } },
  ['nocCode']
);

// 12. ESA Reprisal Defense
addToolRoute(
  '/v1/tools/esa-reprisal-defense',
  'v1_tools_esa_reprisal_defense',
  { hasReprisalClaim: { type: 'boolean' }, potentialRemedies: { type: 'array', items: { type: 'string' } }, severityScore: { type: 'number' } },
  { protectedActivity: { type: 'string' } },
  ['protectedActivity']
);

// 13. BC SVT Notice of Objection Appeal
addToolRoute(
  '/v1/tools/bc-svt-appeal',
  'v1_tools_bc_svt_appeal',
  { appealViable: { type: 'boolean' }, ground: { type: 'string' }, recommendedActions: { type: 'array', items: { type: 'string' } } },
  { assessmentNoticeDate: { type: 'string' } },
  ['assessmentNoticeDate']
);

// 14. Express Entry Tie Break
addToolRoute(
  '/v1/tools/express-entry-tie-break',
  'v1_tools_express_entry_tie_break',
  { receivesIta: { type: 'boolean' }, crs: { type: 'number' }, tieBreakMet: { type: 'boolean' } },
  { candidateCrs: { type: 'number' } },
  ['candidateCrs']
);

// 15. Calgary Secondary Suite Amnesty
addToolRoute(
  '/v1/tools/calgary-suite-amnesty',
  'v1_tools_calgary_suite_amnesty',
  { isCompliant: { type: 'boolean' }, requiredRetrofits: { type: 'array', items: { type: 'string' } }, amnestyEligible: { type: 'boolean' } },
  { suiteType: { type: 'string' } },
  ['suiteType']
);

writeFileSync(openapiPath, JSON.stringify(spec, null, 2), 'utf8');
console.log('Successfully synchronized docs/openapi.json with all missing and Batch 2 routes');
