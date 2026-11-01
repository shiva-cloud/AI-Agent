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

spec.paths['/v1/tools/study-permit-cap-pal'] = {
  get: {
    operationId: 'get__v1_tools_study_permit_cap_pal',
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
                applicantName: { type: 'string' },
                studyLevel: { type: 'string' },
                province: { type: 'string' },
                isPalRequired: { type: 'boolean' },
                palStatus: { type: 'string' },
                palExemptReasons: { type: 'array', items: { type: 'string' } },
                financialAudit: { type: 'object' },
                pgwpPathway: { type: 'object' },
                checklist: { type: 'array', items: { type: 'string' } },
                statuteBasis: { type: 'string' }
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
    operationId: 'post__v1_tools_study_permit_cap_pal',
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
              tuitionFeeFirstYearCad: { type: 'number' },
              liquidFundsAvailableCad: { type: 'number' },
              familyMembersAccompanying: { type: 'number' },
              applicantName: { type: 'string' }
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
                applicantName: { type: 'string' },
                studyLevel: { type: 'string' },
                province: { type: 'string' },
                isPalRequired: { type: 'boolean' },
                palStatus: { type: 'string' },
                palExemptReasons: { type: 'array', items: { type: 'string' } },
                financialAudit: { type: 'object' },
                pgwpPathway: { type: 'object' },
                checklist: { type: 'array', items: { type: 'string' } },
                statuteBasis: { type: 'string' }
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

spec.paths['/v1/tools/visitor-visa-financial-ties'] = {
  get: {
    operationId: 'get__v1_tools_visitor_visa_financial_ties',
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
                applicantName: { type: 'string' },
                countryOfResidence: { type: 'string' },
                plannedStayDays: { type: 'number' },
                tieScoreOutOf100: { type: 'number' },
                riskTier: { type: 'string' },
                approvalProbability: { type: 'string' },
                financialMetrics: { type: 'object' },
                positiveFactors: { type: 'array', items: { type: 'string' } },
                riskFactors: { type: 'array', items: { type: 'string' } },
                mitigationRecommendations: { type: 'array', items: { type: 'string' } },
                statutoryCitations: { type: 'array', items: { type: 'string' } }
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
    operationId: 'post__v1_tools_visitor_visa_financial_ties',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              applicantName: { type: 'string' },
              countryOfResidence: { type: 'string' },
              plannedStayDays: { type: 'number' },
              liquidFundsCad: { type: 'number' },
              monthlyIncomeCad: { type: 'number' }
            },
            required: ['applicantName'],
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
                applicantName: { type: 'string' },
                countryOfResidence: { type: 'string' },
                plannedStayDays: { type: 'number' },
                tieScoreOutOf100: { type: 'number' },
                riskTier: { type: 'string' },
                approvalProbability: { type: 'string' },
                financialMetrics: { type: 'object' },
                positiveFactors: { type: 'array', items: { type: 'string' } },
                riskFactors: { type: 'array', items: { type: 'string' } },
                mitigationRecommendations: { type: 'array', items: { type: 'string' } },
                statutoryCitations: { type: 'array', items: { type: 'string' } }
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

spec.paths['/v1/tools/lmia-readiness'] = {
  get: {
    operationId: 'get__v1_tools_lmia_readiness',
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
                employerName: { type: 'string' },
                province: { type: 'string' },
                nocCode: { type: 'string' },
                teerCategory: { type: 'number' },
                wageAnalysis: { type: 'object' },
                exemptionAudit: { type: 'object' },
                streamRules: { type: 'object' },
                complianceObligations: { type: 'array', items: { type: 'string' } },
                riskWarnings: { type: 'array', items: { type: 'string' } },
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
    operationId: 'post__v1_tools_lmia_readiness',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              employerName: { type: 'string' },
              province: { type: 'string' },
              offeredHourlyWageCad: { type: 'number' },
              nocCode: { type: 'string' },
              teerCategory: { type: 'number' }
            },
            required: ['employerName'],
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
                employerName: { type: 'string' },
                province: { type: 'string' },
                nocCode: { type: 'string' },
                teerCategory: { type: 'number' },
                wageAnalysis: { type: 'object' },
                exemptionAudit: { type: 'object' },
                streamRules: { type: 'object' },
                complianceObligations: { type: 'array', items: { type: 'string' } },
                riskWarnings: { type: 'array', items: { type: 'string' } },
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

spec.paths['/v1/tools/sin-healthcare'] = {
  get: {
    operationId: 'get__v1_tools_sin_healthcare',
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
                statusInCanada: { type: 'string' },
                province: { type: 'string' },
                sinEvaluation: { type: 'object' },
                healthcareEvaluation: { type: 'object' },
                provincialPhotoId: { type: 'object' },
                actionChecklist: { type: 'array', items: { type: 'string' } }
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
    operationId: 'post__v1_tools_sin_healthcare',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusInCanada: { type: 'string' },
              province: { type: 'string' }
            },
            required: ['statusInCanada'],
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
                statusInCanada: { type: 'string' },
                province: { type: 'string' },
                sinEvaluation: { type: 'object' },
                healthcareEvaluation: { type: 'object' },
                provincialPhotoId: { type: 'object' },
                actionChecklist: { type: 'array', items: { type: 'string' } }
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

// Also add corridors, pr-matrix, family-reunification, tax-shield
spec.paths['/v1/corridors'] = {
  get: {
    operationId: 'get__v1_corridors',
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
                corridors: { type: 'array', items: { type: 'object' } }
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

spec.paths['/v1/tools/pr-matrix'] = {
  get: {
    operationId: 'get__v1_tools_pr_matrix',
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
                matrix: { type: 'object' }
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
    operationId: 'post__v1_tools_pr_matrix',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              age: { type: 'number' },
              education: { type: 'string' }
            },
            required: ['age'],
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
                matrix: { type: 'object' }
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

spec.paths['/v1/tools/family-reunification'] = {
  get: {
    operationId: 'get__v1_tools_family_reunification',
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
                reunification: { type: 'object' }
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
    operationId: 'post__v1_tools_family_reunification',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              relationship: { type: 'string' }
            },
            required: ['relationship'],
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
                reunification: { type: 'object' }
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

spec.paths['/v1/tools/tax-shield'] = {
  get: {
    operationId: 'get__v1_tools_tax_shield',
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
                taxShield: { type: 'object' }
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
    operationId: 'post__v1_tools_tax_shield',
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              income: { type: 'number' }
            },
            required: ['income'],
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
                taxShield: { type: 'object' }
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
console.log('Successfully updated docs/openapi.json with all missing routes');
