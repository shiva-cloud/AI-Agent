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

spec.paths["/v1/tools/cra-newcomer-wealth"] = {
  get: {
    operationId: "get__v1_tools_cra_newcomer_wealth",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Successful evaluation of CRA FHSA, HBP, TFSA and Foreign Property Step-up",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                evaluatedAt: { type: "string" },
                jurisdiction: { type: "string" },
                firstHomeStrategies: { type: "object", additionalProperties: true },
                taxCompliance: { type: "object", additionalProperties: true }
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
    operationId: "post__v1_tools_cra_newcomer_wealth",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              fhsa: { type: "object", additionalProperties: true },
              hbp: { type: "object", additionalProperties: true },
              tfsa: { type: "object", additionalProperties: true },
              foreignProperty: { type: "object", additionalProperties: true },
              gift: { type: "object", additionalProperties: true }
            },
            required: ["fhsa"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Successful evaluation of newcomer wealth plan",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                evaluatedAt: { type: "string" },
                jurisdiction: { type: "string" },
                firstHomeStrategies: { type: "object", additionalProperties: true },
                taxCompliance: { type: "object", additionalProperties: true }
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

spec.paths["/v1/tools/ontario-bc-tenancy"] = {
  get: {
    operationId: "get__v1_tools_ontario_bc_tenancy",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Successful audit of Ontario or BC tenancy notice",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jurisdiction: { type: "string" },
                statutoryBasis: { type: "string" },
                isIncreaseLawful: { type: "boolean" },
                defects: { type: "array", items: { type: "string" } }
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
    operationId: "post__v1_tools_ontario_bc_tenancy",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              currentMonthlyRentCad: { type: "number" },
              proposedMonthlyRentCad: { type: "number" },
              province: { type: "string" },
              action: { type: "string" }
            },
            required: ["currentMonthlyRentCad"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Successful audit of tenancy submission",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jurisdiction: { type: "string" },
                statutoryBasis: { type: "string" },
                isIncreaseLawful: { type: "boolean" },
                defects: { type: "array", items: { type: "string" } }
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

spec.paths["/v1/tools/global-expat"] = {
  get: {
    operationId: "get__v1_tools_global_expat",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Successful expat statutory evaluation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jurisdiction: { type: "string" },
                statutoryBasis: { type: "string" },
                accruedGratuityAed: { type: "number" },
                totalScore: { type: "number" }
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
    operationId: "post__v1_tools_global_expat",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              country: { type: "string" },
              monthlyBasicSalaryAed: { type: "number" },
              yearsOfService: { type: "number" },
              action: { type: "string" }
            },
            required: ["country"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Successful evaluation of global expat status",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                jurisdiction: { type: "string" },
                statutoryBasis: { type: "string" },
                accruedGratuityAed: { type: "number" },
                totalScore: { type: "number" }
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

spec.paths["/v1/tools/canada-status-admissibility"] = {
  get: {
    operationId: "get__v1_tools_canada_status_admissibility",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Successful evaluation of Canadian temporary status & admissibility",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligibleToApply: { type: "boolean" },
                isFlagpolingPermitted: { type: "boolean" },
                inadmissibilityStatus: { type: "string" }
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
    operationId: "post__v1_tools_canada_status_admissibility",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              category: { type: "string" },
              statusExpiredDate: { type: "string" },
              borderPort: { type: "string" },
              leaveDurationDays: { type: "number" },
              offenseClassification: { type: "string" }
            },
            required: ["category"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Successful evaluation of Canadian status & admissibility",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statutoryBasis: { type: "string" },
                isEligibleToApply: { type: "boolean" },
                isFlagpolingPermitted: { type: "boolean" },
                inadmissibilityStatus: { type: "string" }
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
console.log('Batch 4 routes added to docs/openapi.json successfully!');
