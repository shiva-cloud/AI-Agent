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

spec.paths['/v1/metrics'] = {
  get: {
    operationId: 'get__v1_metrics',
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
                prometheus: { type: 'string' }
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

spec.paths['/v1/realtime/subscriptions'] = {
  get: {
    operationId: 'get__v1_realtime_subscriptions',
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
                subscriptions: { type: 'array', items: { type: 'object' } }
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
    operationId: 'post__v1_realtime_subscriptions',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              contactEndpoint: { type: 'string' },
              channel: { type: 'string' },
              subscriberName: { type: 'string' },
              country: { type: 'string' },
              topic: { type: 'string' }
            },
            required: ['contactEndpoint'],
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
                subscriptionId: { type: 'string' },
                status: { type: 'string' },
                channel: { type: 'string' },
                contactEndpoint: { type: 'string' }
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

spec.paths['/v1/tools/study-to-pr'] = {
  get: {
    operationId: 'get__v1_tools_study_to_pr',
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
                studyLevel: { type: 'string' },
                province: { type: 'string' },
                pgwpEntitlement: { type: 'object' },
                prPathways: { type: 'object' },
                milestoneRoadmap: { type: 'array', items: { type: 'object' } },
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
    operationId: 'post__v1_tools_study_to_pr',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              studyLevel: { type: 'string' },
              province: { type: 'string' },
              fieldOfStudy: { type: 'string' },
              expectedClbLanguage: { type: 'number' },
              targetNocTeer: { type: 'number' }
            },
            required: ['studyLevel'],
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
                studyLevel: { type: 'string' },
                province: { type: 'string' },
                pgwpEntitlement: { type: 'object' },
                prPathways: { type: 'object' },
                milestoneRoadmap: { type: 'array', items: { type: 'object' } },
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

spec.paths['/v1/tools/gcms-analyzer'] = {
  get: {
    operationId: 'get__v1_tools_gcms_analyzer',
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
                applicationType: { type: 'string' },
                groundsIdentifiedCount: { type: 'number' },
                refusalFindings: { type: 'array', items: { type: 'object' } },
                statutoryRemedies: { type: 'array', items: { type: 'string' } },
                federalCourtPrecedents: { type: 'array', items: { type: 'string' } },
                proceduralRemedy: { type: 'object' },
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
    operationId: 'post__v1_tools_gcms_analyzer',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              applicationType: { type: 'string' },
              rawOfficerNotesText: { type: 'string' },
              refusalCodes: { type: 'array', items: { type: 'string' } },
              daysSinceRefusal: { type: 'number' }
            },
            required: ['applicationType'],
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
                applicationType: { type: 'string' },
                groundsIdentifiedCount: { type: 'number' },
                refusalFindings: { type: 'array', items: { type: 'object' } },
                statutoryRemedies: { type: 'array', items: { type: 'string' } },
                federalCourtPrecedents: { type: 'array', items: { type: 'string' } },
                proceduralRemedy: { type: 'object' },
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

writeFileSync(openapiPath, JSON.stringify(spec, null, 2), 'utf8');
console.log('Successfully updated docs/openapi.json with recommendation routes');
