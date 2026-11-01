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

spec.paths["/v1/kb/citations"] = {
  get: {
    operationId: "get__v1_kb_citations",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Extracted and linked statutory citations",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                totalCitations: { type: "integer" },
                citations: { type: "array", items: { type: "object", additionalProperties: true } },
                linkifiedText: { type: "string" }
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

spec.paths["/v1/kb/expiry-audit"] = {
  get: {
    operationId: "get__v1_kb_expiry_audit",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Knowledge Base expiration schedule audit",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                referenceDate: { type: "string" },
                totalRecordsAudited: { type: "integer" },
                counts: { type: "object", additionalProperties: true },
                summary: { type: "string" }
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

spec.paths["/v1/kb/provenance-check"] = {
  get: {
    operationId: "get__v1_kb_provenance_check",
    security: [],
    parameters: [],
    responses: {
      "200": {
        description: "Cryptographic provenance hash chain verification result",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isValid: { type: "boolean" },
                blockCount: { type: "integer" },
                latestHash: { type: "string" }
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

spec.paths["/v1/kb/classify-policy"] = {
  post: {
    operationId: "post__v1_kb_classify_policy",
    security: [],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              rawText: { type: "string" },
              risk: { type: "string" }
            },
            required: ["title"],
            additionalProperties: true
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Policy classification and hierarchy conflict result",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                evaluatedAt: { type: "string" },
                classification: { type: "object", additionalProperties: true }
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
console.log('KB routes added to docs/openapi.json successfully!');
