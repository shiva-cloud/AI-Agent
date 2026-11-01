import {createHash,randomUUID} from 'node:crypto';
export function createAnswerCache({maxEntries=128,maxBytes=4194304,ttlMs=60000,clock=()=>performance.now()}={}) {
 if(!Number.isInteger(maxEntries)||maxEntries<0||maxEntries>1000||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>16777216||!Number.isInteger(ttlMs)||ttlMs<1||ttlMs>300000)throw new Error('Invalid answer cache limits');
 const entries=new Map();let bytes=0,version,hits=0,misses=0;
 const remove=key=>{const row=entries.get(key);if(row){bytes-=row.size;entries.delete(key);}};
 return {
  run(input,records,date,compute,evidenceVersion) {
   if(!maxEntries)return compute();
   const now=clock(),nextVersion=evidenceVersion ?? createHash('sha256').update(date.toISOString().slice(0,10)).update(JSON.stringify(records)).digest('hex');
   if(nextVersion!==version){entries.clear();bytes=0;version=nextVersion;}
   for(const [key,row] of entries)if(row.expires<=now)remove(key);
   const key=createHash('sha256').update(JSON.stringify(input)).digest('hex');
   const row=entries.get(key);
   if(row){hits++;entries.delete(key);entries.set(key,row);return {...JSON.parse(row.body),traceId:randomUUID()};}
   misses++;
   const result=compute(),body=JSON.stringify(result),size=Buffer.byteLength(body);
   if(size<=maxBytes){
    while(entries.size>=maxEntries||bytes+size>maxBytes)remove(entries.keys().next().value);
    entries.set(key,{body,size,expires:now+ttlMs});bytes+=size;
   }
   return result;
  },
  stats:()=>({entries:entries.size,bytes,hits,misses,hitRatio:hits+misses>0?Number((hits/(hits+misses)).toFixed(3)):0}),
  clear:()=>{entries.clear();bytes=0;version=null;}
 };
}
