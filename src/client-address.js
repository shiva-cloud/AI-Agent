import {isIP} from 'node:net';

function normalize(value) {
 if(typeof value!=='string'||value.includes('%')||!isIP(value))return null;
 if(isIP(value)===4)return value;
 const address=new URL(`http://[${value}]/`).hostname.slice(1,-1);
 const mapped=address.match(/^::ffff:([a-f0-9]+):([a-f0-9]+)$/);
 if(mapped){const a=parseInt(mapped[1],16),b=parseInt(mapped[2],16);return `${a>>8}.${a&255}.${b>>8}.${b&255}`;}
 return address;
}
export function proxyAddressesFromEnvironment(env=process.env) {
 if(env.TRUSTED_PROXY_IPS===undefined)return [];
 try {const values=JSON.parse(env.TRUSTED_PROXY_IPS);createClientAddress(values);return values;}
 catch {throw new Error('Invalid TRUSTED_PROXY_IPS configuration');}
}
export function createClientAddress(addresses=[]) {
 if(!Array.isArray(addresses)||addresses.length>32||addresses.some(value=>!normalize(value)))throw new Error('Trusted proxies must be at most 32 explicit IP addresses');
 const trusted=new Set(addresses.map(normalize));
 return req=>{
  if(!req)return 'unknown';
  const remote=req.socket?.remoteAddress;
  const peer=normalize(remote)||'unknown';
  if(!trusted.has(peer))return peer;
  const header=req.headers?.['x-forwarded-for'];
  if(typeof header!=='string'||header.length>2048)return peer;
  const parts=header.split(',');if(parts.length>16)return peer;
  const chain=parts.map(value=>normalize(value.trim()));
  if(chain.some(value=>!value))return peer;
  let current=peer;
  for(let i=chain.length-1;i>=0&&trusted.has(current);i--)current=chain[i];
  return current;
 };
}
