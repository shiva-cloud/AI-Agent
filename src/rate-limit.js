// Per-process fixed window. This is not a distributed production quota.
export function createRateLimiter({limit=120,windowMs=60000,maxClients=10000,clock=()=>performance.now()}={}) {
 if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(windowMs)||windowMs<1||!Number.isSafeInteger(maxClients)||maxClients<1||maxClients>100000||typeof clock!=='function')throw new Error('Invalid rate limiter configuration');
 const clients=new Map();
 let nextCleanup=0;
 return key=>{
  const now=clock();
  if(now>=nextCleanup){for(const [id,item] of clients)if(now-item.start>=windowMs)clients.delete(id);nextCleanup=now+Math.min(windowMs,1000);}
  let item=clients.get(key);
  if(!item&&clients.size>=maxClients)return {allowed:false,retryAfterSeconds:Math.max(1,Math.ceil((nextCleanup-now)/1000))};
  if(!item || now-item.start>=windowMs){item={start:now,count:0};clients.set(key,item);}
  item.count=Math.min(limit+1,item.count+1);
  return {allowed:item.count<=limit,retryAfterSeconds:Math.max(1,Math.ceil((windowMs-(now-item.start))/1000))};
 };
}
