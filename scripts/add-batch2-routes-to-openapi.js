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

// 1. Global Visa Matrix
spec.paths['/v1/tools/global-visa-matrix'] = {
  get: {
    operationId: 'get__v1_tools_global_visa_matrix',
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
                assessmentDate: { type: 'string' },
                candidateProfile: { type: 'object' },
                totalOptionsEvaluated: { type: 'number' },
                eligiblePathwaysCount: { type: 'number' },
                eligiblePathways: { type: 'array', items: { type: 'object' } },
                restrictedPathways: { type: 'array', items: { type: 'object' } },
                statutorySummary: { type: 'string' }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: defaultErrorResponse
    }
  },
  post: {
    operationId: 'post__v1_tools_global_visa_matrix',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              educationLevel: { type: 'string' },
              yearsExperience: { type: 'number' },
              fieldOfStudy: { type: 'string' },
              preferredCountries: { type: 'array', items: { type: 'string' } },
              hasJobOffer: { type: 'boolean' }
            },
            required: ['educationLevel'],
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
              properties: {
                assessmentDate: { type: 'string' },
                candidateProfile: { type: 'object' },
                totalOptionsEvaluated: { type: 'number' },
                eligiblePathwaysCount: { type: 'number' },
                eligiblePathways: { type: 'array', items: { type: 'object' } },
                restrictedPathways: { type: 'array', items: { type: 'object' } },
                statutorySummary: { type: 'string' }
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

// 2. Moving Tax Calculator
spec.paths['/v1/tools/moving-tax-calc'] = {
  get: {
    operationId: 'get__v1_tools_moving_tax_calc',
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
                taxYear: { type: 'number' },
                province: { type: 'string' },
                eligibilityCheck: { type: 'object' },
                expenseBreakdown: { type: 'object' },
                taxOptimization: { type: 'object' },
                requiredDocumentation: { type: 'array', items: { type: 'string' } },
                statutoryBasis: { type: 'string' }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: defaultErrorResponse
    }
  },
  post: {
    operationId: 'post__v1_tools_moving_tax_calc',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              distanceOldHomeToNewWorkKm: { type: 'number' },
              distanceNewHomeToNewWorkKm: { type: 'number' },
              transportAndStorageCostsCad: { type: 'number' },
              province: { type: 'string' }
            },
            required: ['distanceOldHomeToNewWorkKm'],
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
              properties: {
                taxYear: { type: 'number' },
                province: { type: 'string' },
                eligibilityCheck: { type: 'object' },
                expenseBreakdown: { type: 'object' },
                taxOptimization: { type: 'object' },
                requiredDocumentation: { type: 'array', items: { type: 'string' } },
                statutoryBasis: { type: 'string' }
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

// 3. Severance Bardal Calculator
spec.paths['/v1/tools/severance-bardal'] = {
  get: {
    operationId: 'get__v1_tools_severance_bardal',
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
                assessmentDate: { type: 'string' },
                profileAudit: { type: 'object' },
                statutoryMinimumEntitlement: { type: 'object' },
                commonLawEntitlement: { type: 'object' },
                severanceReleaseTrapWarnings: { type: 'array', items: { type: 'string' } },
                statutoryBasis: { type: 'string' }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: defaultErrorResponse
    }
  },
  post: {
    operationId: 'post__v1_tools_severance_bardal',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              employeeAge: { type: 'number' },
              yearsOfService: { type: 'number' },
              annualSalaryCad: { type: 'number' },
              employmentRole: { type: 'string' }
            },
            required: ['yearsOfService'],
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
              properties: {
                assessmentDate: { type: 'string' },
                profileAudit: { type: 'object' },
                statutoryMinimumEntitlement: { type: 'object' },
                commonLawEntitlement: { type: 'object' },
                severanceReleaseTrapWarnings: { type: 'array', items: { type: 'string' } },
                statutoryBasis: { type: 'string' }
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

// 4. Statutory Glossary
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

// 5. Realtime Atom Feed (XML)
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

writeFileSync(openapiPath, JSON.stringify(spec, null, 2), 'utf8');
console.log('Successfully updated docs/openapi.json with Batch 2 routes');
