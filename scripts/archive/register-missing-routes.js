import fs from 'node:fs';

// 1. Update scripts/export-openapi.js
let eo = fs.readFileSync('scripts/export-openapi.js', 'utf8');

const missingTools = [
  '/v1/tools/esa-wage-theft',
  '/v1/tools/workplace-rights',
  '/v1/tools/ei-benefits',
  '/v1/tools/fcr-bridging'
];

// Add to GET list
const getTarget = "'/v1/tools/legal-notices'";
if (!eo.includes("'/v1/tools/esa-wage-theft'")) {
  eo = eo.replace(getTarget, missingTools.map(t => `'${t}'`).join(',') + ',' + getTarget);
}

// Add to POST list
const postTarget = "for(const path of ['/v1/tools/legal-notices'";
if (!eo.includes("for(const path of ['/v1/tools/esa-wage-theft'")) {
  eo = eo.replace(postTarget, "for(const path of [" + missingTools.map(t => `'${t}'`).join(',') + ",'/v1/tools/legal-notices'");
}

// Add body definitions
const bodyTarget = "body('/v1/tools/legal-notices'";
if (!eo.includes("body('/v1/tools/esa-wage-theft'")) {
  const bodies = missingTools.map(t => `body('${t}',{action:str(1,50)},['action']);`).join('\n') + '\n';
  eo = eo.replace(bodyTarget, bodies + bodyTarget);
}

fs.writeFileSync('scripts/export-openapi.js', eo, 'utf8');
console.log('Updated export-openapi.js');

// 2. Update scripts/api-response-schemas.js
let ars = fs.readFileSync('scripts/api-response-schemas.js', 'utf8');
if (!ars.includes('/v1/tools/esa-wage-theft')) {
  const schemaBlock = `
  const esaWageTheftSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/esa-wage-theft', 'get', '200', esaWageTheftSchema);
  response('/v1/tools/esa-wage-theft', 'post', '200', esaWageTheftSchema);

  const workplaceRightsSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/workplace-rights', 'get', '200', workplaceRightsSchema);
  response('/v1/tools/workplace-rights', 'post', '200', workplaceRightsSchema);

  const eiBenefitsSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/ei-benefits', 'get', '200', eiBenefitsSchema);
  response('/v1/tools/ei-benefits', 'post', '200', eiBenefitsSchema);

  const fcrBridgingSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/fcr-bridging', 'get', '200', fcrBridgingSchema);
  response('/v1/tools/fcr-bridging', 'post', '200', fcrBridgingSchema);
}
`;
  ars = ars.replace(/\n\}\s*$/, schemaBlock);
  fs.writeFileSync('scripts/api-response-schemas.js', ars, 'utf8');
  console.log('Updated api-response-schemas.js');
}
