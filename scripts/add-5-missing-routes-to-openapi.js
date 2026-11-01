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

spec.paths["/v1/tools/esa-constructive-layoff"] = {
  get: {
    operationId: "get__v1_tools_esa_constructive_layoff",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates ESA constructive dismissal layoff",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isConstructiveDismissal: { type: "boolean" },
                statutorySeveranceNotice: { type: "object", additionalProperties: true }
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
    operationId: "post__v1_tools_esa_constructive_layoff",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              yearsOfService: { type: "number" },
              annualSalaryCad: { type: "number" }
            },
            required: ["yearsOfService"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates ESA constructive dismissal layoff",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isConstructiveDismissal: { type: "boolean" },
                statutorySeveranceNotice: { type: "object", additionalProperties: true }
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

spec.paths["/v1/tools/nsnp-experience"] = {
  get: {
    operationId: "get__v1_tools_nsnp_experience",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates Nova Scotia Experience Stream",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isEligible: { type: "boolean" },
                streamDetails: { type: "object", additionalProperties: true }
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
    operationId: "post__v1_tools_nsnp_experience",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              stream: { type: "string" },
              candidateAge: { type: "number" }
            },
            required: ["stream"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates Nova Scotia Experience Stream",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isEligible: { type: "boolean" },
                streamDetails: { type: "object", additionalProperties: true }
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

spec.paths["/v1/tools/quebec-peq-worker"] = {
  get: {
    operationId: "get__v1_tools_quebec_peq_worker",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates Quebec PEQ worker stream",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isEligible: { type: "boolean" },
                frenchProficiencyLevel: { type: "string" }
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
    operationId: "post__v1_tools_quebec_peq_worker",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              monthsWorkedInQuebec: { type: "number" },
              jobTeerLevel: { type: "number" }
            },
            required: ["monthsWorkedInQuebec"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates Quebec PEQ worker stream",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isEligible: { type: "boolean" },
                frenchProficiencyLevel: { type: "string" }
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

spec.paths["/v1/tools/alberta-commercial-distress"] = {
  get: {
    operationId: "get__v1_tools_alberta_commercial_distress",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Audits Alberta commercial lease distress",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isDistressLawful: { type: "boolean" },
                distressFindings: { type: "array", items: { type: "string" } }
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
    operationId: "post__v1_tools_alberta_commercial_distress",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              rentArrearsClaimedCad: { type: "number" },
              goodsEstimatedValueCad: { type: "number" }
            },
            required: ["rentArrearsClaimedCad"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Audits Alberta commercial lease distress",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isDistressLawful: { type: "boolean" },
                distressFindings: { type: "array", items: { type: "string" } }
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

spec.paths["/v1/tools/trp-inadmissibility"] = {
  get: {
    operationId: "get__v1_tools_trp_inadmissibility",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Evaluates TRP compelling reasons balance",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isCompellingBalanceMet: { type: "boolean" },
                riskAssessment: { type: "string" }
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
    operationId: "post__v1_tools_trp_inadmissibility",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              inadmissibilityType: { type: "string" },
              yearsElapsedSinceSentenceOrTrigger: { type: "number" }
            },
            required: ["inadmissibilityType"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Evaluates TRP compelling reasons balance",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isCompellingBalanceMet: { type: "boolean" },
                riskAssessment: { type: "string" }
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
console.log('5 missing routes added to docs/openapi.json successfully!');
