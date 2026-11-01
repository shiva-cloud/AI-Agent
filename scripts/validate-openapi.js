import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export async function validateContract() {
 const document=JSON.parse(readFileSync(new URL('../docs/openapi.json',import.meta.url)));
 await SwaggerParser.validate(document,{resolve:{external:false}});
 const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);let schemas=0;
 function walk(value) {
  if(!value||typeof value!=='object')return;
  for(const [key,item] of Object.entries(value)) {
   if(key==='schema'){ajv.compile(item);schemas++;}else walk(item);
  }
 }
 walk(document);return {status:'passed',paths:Object.keys(document.paths).length,schemas};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await validateContract(),null,2));
