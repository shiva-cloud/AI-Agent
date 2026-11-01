import {scrypt,randomBytes,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {PlanError} from './accounts.js';
const derive=promisify(scrypt);
let active=0;
async function bounded(fn){
 if(active>=4)throw new PlanError(503,'authentication_busy','Sign-in is busy. Please retry shortly.');
 active++;
 try{return await fn();}finally{active--;}
}
export const hashPasswordAsync=password=>bounded(async()=>{
 const salt=randomBytes(16);const hash=await derive(password,salt,32,{N:16384,r:8,p:1});
 return `scrypt$16384$8$1$${salt.toString('base64url')}$${hash.toString('base64url')}`;
});
export const verifyPasswordAsync=(password,stored)=>bounded(async()=>{
 const [scheme,N,r,p,salt,hash]=String(stored).split('$');
 if(scheme!=='scrypt'||N!=='16384'||r!=='8'||p!=='1')return false;
 const expected=Buffer.from(hash,'base64url');if(expected.length!==32)return false;
 const actual=await derive(password,Buffer.from(salt,'base64url'),32,{N:16384,r:8,p:1});
 return timingSafeEqual(actual,expected);
});
