import fs from 'node:fs';

const openApiPath = './docs/openapi.json';
const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

const commonErrorResponse = {
  description: "JSON API failure. Some failures include additional context.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: { type: "string" },
          code: { type: "string" }
        },
        required: ["error", "code"],
        additionalProperties: true
      }
    }
  }
};

spec.paths["/v1/tools/esa-wage-theft"] = {
  get: {
    operationId: "get__v1_tools_esa_wage_theft",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates Ontario ESA overtime, vacation, holiday, and severance pay",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                totalWeeklyPayCad: { type: "number" },
                statutoryVacationPayCad: { type: "number" },
                statutorySeverancePayCad: { type: "number" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  },
  post: {
    operationId: "post__v1_tools_esa_wage_theft",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              action: { type: "string" },
              hourlyRateCad: { type: "number" },
              weeklyHoursWorked: { type: "number" },
              yearsOfService: { type: "number" }
            },
            required: ["action"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates Ontario ESA overtime, vacation, holiday, and severance pay",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                totalWeeklyPayCad: { type: "number" },
                statutoryVacationPayCad: { type: "number" },
                statutorySeverancePayCad: { type: "number" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  }
};

spec.paths["/v1/tools/workplace-rights"] = {
  get: {
    operationId: "get__v1_tools_workplace_rights",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates constructive dismissal, OHRC Canadian experience, OHSA refusal, and WSIB",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isConstructiveDismissal: { type: "boolean" },
                isPrimaFacieDiscrimination: { type: "boolean" },
                isWorkRefusalLawful: { type: "boolean" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  },
  post: {
    operationId: "post__v1_tools_workplace_rights",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              action: { type: "string" },
              unilateralWageReductionPercent: { type: "number" },
              type: { type: "string" },
              reportedToSupervisor: { type: "boolean" }
            },
            required: ["action"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates constructive dismissal, OHRC Canadian experience, OHSA refusal, and WSIB",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isConstructiveDismissal: { type: "boolean" },
                isPrimaFacieDiscrimination: { type: "boolean" },
                isWorkRefusalLawful: { type: "boolean" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  }
};

spec.paths["/v1/tools/ei-benefits"] = {
  get: {
    operationId: "get__v1_tools_ei_benefits",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates EI regular, just cause voluntary quit, sickness, and parental benefits",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligible: { type: "boolean" },
                estimatedWeeklyBenefitCad: { type: "number" },
                maxDurationWeeks: { type: "integer" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  },
  post: {
    operationId: "post__v1_tools_ei_benefits",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              action: { type: "string" },
              insurableHoursAccrued: { type: "number" },
              regionalUnemploymentRatePercent: { type: "number" },
              quitReasonCategory: { type: "string" }
            },
            required: ["action"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates EI regular, just cause voluntary quit, sickness, and parental benefits",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligible: { type: "boolean" },
                estimatedWeeklyBenefitCad: { type: "number" },
                maxDurationWeeks: { type: "integer" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  }
};

spec.paths["/v1/tools/fcr-bridging"] = {
  get: {
    operationId: "get__v1_tools_fcr_bridging",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates FCR micro-loans, IEN SPEP nursing licensure, and IMG Practice Ready Assessment",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligibleForFcrLoans: { type: "boolean" },
                isEligibleForSpep: { type: "boolean" },
                isEligibleForPra: { type: "boolean" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  },
  post: {
    operationId: "post__v1_tools_fcr_bridging",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              action: { type: "string" },
              immigrationStatus: { type: "string" },
              hasNnasAdvisoryReport: { type: "boolean" },
              targetProvince: { type: "string" }
            },
            required: ["action"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates FCR micro-loans, IEN SPEP nursing licensure, and IMG Practice Ready Assessment",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligibleForFcrLoans: { type: "boolean" },
                isEligibleForSpep: { type: "boolean" },
                isEligibleForPra: { type: "boolean" }
              },
              additionalProperties: true
            }
          }
        }
      },
      default: commonErrorResponse
    }
  }
};

fs.writeFileSync(openApiPath, JSON.stringify(spec, null, 2), 'utf8');
console.log('Batch 5 routes added to docs/openapi.json successfully!');
