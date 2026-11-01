import {createHash,timingSafeEqual} from 'node:crypto';
import {openSync,fstatSync,readSync,closeSync} from 'node:fs';
export class AdminConfigUnavailable extends Error {}
const digest=value=>createHash('sha256').update(value).digest();
export function actorsFromEnvironment(env=process.env) {
  if(env.ADMIN_ACTORS_JSON===undefined)return undefined;
  if(typeof env.ADMIN_ACTORS_JSON!=='string'||Buffer.byteLength(env.ADMIN_ACTORS_JSON,'utf8')>65536)throw new Error('Invalid ADMIN_ACTORS_JSON configuration');
  try{return JSON.parse(env.ADMIN_ACTORS_JSON);}catch{throw new Error('Invalid ADMIN_ACTORS_JSON configuration');}
}
export function createAdminAuth({actors,legacyToken}={}) {
  const configured=actors!==undefined;
  if(configured&&(!Array.isArray(actors)||actors.length>100))throw new Error('Admin actors must be an array of at most 100 identities');
  const ids=new Set(),hashes=new Set();
  const accounts=(actors||[]).map(actor=>{
    if(!actor||!/^[a-z][a-z0-9-]{1,63}$/.test(actor.id)||!['reader','editor','reviewer','admin'].includes(actor.role)||typeof actor.token!=='string'||actor.token.length<32||actor.token.length>256||!/^[\x21-\x7e]+$/.test(actor.token))throw new Error('Invalid admin actor configuration');
    const expiresAt=actor.expiresAt===undefined?null:Date.parse(actor.expiresAt);
    if(actor.expiresAt!==undefined&&(typeof actor.expiresAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(actor.expiresAt)||!Number.isFinite(expiresAt)))throw new Error('Invalid credential expiry');
    if(expiresAt!==null&&new Date(expiresAt).toISOString()!==(actor.expiresAt.includes('.')?actor.expiresAt:actor.expiresAt.replace('Z','.000Z')))throw new Error('Invalid credential expiry');
    const hash=digest(actor.token),hex=hash.toString('hex');
    if(ids.has(actor.id)||hashes.has(hex))throw new Error('Duplicate admin identity or credential');
    ids.add(actor.id);hashes.add(hex);return {id:actor.id,role:actor.role,hash,expiresAt};
  });
  const legacy=!configured&&typeof legacyToken==='string'&&legacyToken.length>=24?digest(legacyToken):null;
  return {
    mode:configured?'individual':legacy?'legacy':'disabled',
    authenticate(header) {
      if(typeof header!=='string'||!header.startsWith('Bearer ')||header.length>1024)return null;
      const supplied=digest(header.slice(7));let match=null;
      for(const actor of accounts)if(timingSafeEqual(supplied,actor.hash)&&(actor.expiresAt===null||actor.expiresAt>Date.now()))match={id:actor.id,role:actor.role,mode:'individual'};
      if(legacy&&timingSafeEqual(supplied,legacy))match={id:null,role:'admin',mode:'legacy'};
      return match;
    }
  };
}
export function createFileAdminAuth(path) {
  const read=()=>{
    let fd;
    try {
      if(typeof path!=='string'||!path.trim())throw new Error();
      fd=openSync(path,'r');
      const stat=fstatSync(fd);
      if(!stat.isFile()||stat.size>65536)throw new Error();
      // Bound actual bytes even if the opened file grows after fstat.
      const bytes=Buffer.alloc(65537);let length=0;
      try {
        while(length<bytes.length) {
          const count=readSync(fd,bytes,length,bytes.length-length,null);
          if(!count)break;
          length+=count;
        }
        if(length>65536)throw new Error();
        const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,length));
        return createAdminAuth({actors:JSON.parse(text)});
      }finally{bytes.fill(0);}
    }catch{throw new AdminConfigUnavailable('Admin identity configuration unavailable');}
    finally{if(fd!==undefined)closeSync(fd);}
  };
  read(); // Fail startup before serving requests if configuration is invalid.
  return {mode:'individual',authenticate(header){return read().authenticate(header);}};
}
export function canAccess(actor,method,path) {
  if(method==='GET')return true;
  if(method!=='POST')return false;
  if(actor.role==='admin')return true;
  if(actor.role==='reader')return false;
  if(actor.role==='editor')return path==='/admin/ingestion/run'||/^\/admin\/gap-work\/[a-f0-9]{64}$/.test(path);
  return /^\/admin\/(?:candidates|reviews)\/[a-z0-9-]+\/decision$/.test(path)||/^\/admin\/records\/[a-z0-9-]+\/restore$/.test(path);
}
