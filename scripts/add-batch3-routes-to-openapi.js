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

// 1. US H-1B & OPT Navigator
addToolRoute(
  '/v1/tools/us-h1b-opt',
  'v1_tools_us_h1b_opt',
  {
    assessmentDate: { type: 'string' },
    visaStatus: { type: 'string' },
    h1bGracePeriodAudit: { type: 'object' },
    capGapAudit: { type: 'object' },
    section245kAudit: { type: 'object' },
    statutoryBasis: { type: 'string' }
  },
  { visaStatus: { type: 'string' }, lastDayWorkedDate: { type: 'string' }, i94ExpirationDate: { type: 'string' } },
  ['visaStatus']
);

// 2. UK Skilled Worker & ILR
addToolRoute(
  '/v1/tools/uk-skilled-worker',
  'v1_tools_uk_skilled_worker',
  {
    assessmentDate: { type: 'string' },
    salaryCompliance: { type: 'object' },
    ilrContinuousResidence: { type: 'object' },
    housingSection21Defense: { type: 'object' },
    statutoryBasis: { type: 'string' }
  },
  { annualOfferedSalaryGbp: { type: 'number' }, socCode: { type: 'string' } },
  ['annualOfferedSalaryGbp']
);

// 3. Super Visa LICO
addToolRoute(
  '/v1/tools/super-visa-lico',
  'v1_tools_super_visa_lico',
  {
    assessmentDate: { type: 'string' },
    householdAudit: { type: 'object' },
    superVisaEvaluation: { type: 'object' },
    statutoryBasis: { type: 'string' }
  },
  { hostFamilyMembersInCanada: { type: 'number' }, parentsGrandparentsToSponsor: { type: 'number' }, hostAnnualIncomeCad: { type: 'number' } },
  ['hostFamilyMembersInCanada']
);

// 4. Australia Condition 8607 & Reforms
addToolRoute(
  '/v1/tools/australia-reforms',
  'v1_tools_australia_reforms',
  {
    jurisdiction: { type: 'string' },
    condition8607Audit: { type: 'object' },
    medicareLevyExemption: { type: 'object' },
    statutoryBasis: { type: 'string' }
  },
  { daysSinceCeasedEmployment: { type: 'number' }, visaSubclass: { type: 'string' } },
  ['daysSinceCeasedEmployment']
);

// 5. Germany Chancenkarte & Tenancy
addToolRoute(
  '/v1/tools/germany-chancenkarte',
  'v1_tools_germany_chancenkarte',
  {
    jurisdiction: { type: 'string' },
    chancenkarteAudit: { type: 'object' },
    nebenkostenTenancyAudit: { type: 'object' },
    statutoryBasis: { type: 'string' }
  },
  { chancenkartePoints: { type: 'number' }, nebenkostenInvoiceMonthsAfterPeriod: { type: 'number' } },
  ['chancenkartePoints']
);

writeFileSync(openapiPath, JSON.stringify(spec, null, 2), 'utf8');
console.log('Successfully synchronized docs/openapi.json with Batch 3 routes');
