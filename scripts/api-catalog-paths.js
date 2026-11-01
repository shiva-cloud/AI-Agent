import {searchMarketGapBatch3,getMarketGapBatch3Stats,resolveMarketGapBatch3Item} from '../src/market-gap-batch3-resolver.js';
import {searchGlobalSettlement,getGlobalSettlementStats,resolveGlobalSettlementItem} from '../src/global-settlement-resolver.js';
function schema(value){
 if(value===null)return {type:['string','null']};
 if(Array.isArray(value))return {type:'array',items:value.length?schema(value[0]):{type:'string'}};
 if(typeof value==='object')return {type:'object',properties:Object.fromEntries(Object.entries(value).map(([k,v])=>[k,schema(v)])),required:Object.keys(value),additionalProperties:true};
 return {type:typeof value==='number'?(Number.isInteger(value)?'integer':'number'):typeof value};
}
export function addCatalogPaths(paths){
 for(const [base,search,stats,item] of [
  ['/v1/market-gap/batch3',searchMarketGapBatch3,getMarketGapBatch3Stats,()=>resolveMarketGapBatch3Item(84001)],
  ['/v1/global-settlement',searchGlobalSettlement,getGlobalSettlementStats,()=>resolveGlobalSettlementItem('GMS-Q00001')]
 ])for(const [suffix,example] of [['',search({limit:1})],['/stats',stats()],['/{id}',{item:item()}]]){
  const path=base+suffix;
  const errorSchema={type:'object',properties:{error:{type:'string'},code:{type:'string'}},required:['error','code']};
  paths[path]={get:{
    operationId:'get_'+path.replace(/[^a-zA-Z0-9]+/g,'_'),security:[],
    parameters:suffix==='/{id}'?[{name:'id',in:'path',required:true,schema:{type:'string'}}]:[],
    description:'Unreviewed research catalog. These entries are not published evidence or individual eligibility decisions.',
    responses:{
      200:{description:'Research catalog',content:{'application/json':{schema:schema(example)}}},
      default:{description:'Error',content:{'application/json':{schema:errorSchema}}}
    }
  }};
 }
}
