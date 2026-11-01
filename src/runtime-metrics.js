import {DatabaseSync} from 'node:sqlite';
export const latencyBounds=[5,10,25,50,100,250,500,1000,2500,5000,10000,30000,60000];
export function latencyBin(ms){const bin=latencyBounds.findIndex(bound=>ms<=bound);return bin<0?latencyBounds.length:bin;}
export function percentiles(histogram) {
 const count=histogram.reduce((a,b)=>a+b,0);
 const quantile=p=>{let sum=0;for(let i=0;i<histogram.length;i++){sum+=histogram[i];if(sum>=Math.ceil(count*p))return latencyBounds[i]??null;}return null;};
 return {p95UpperBoundMs:count?quantile(.95):null,p99UpperBoundMs:count?quantile(.99):null};
}
export function openRuntimeMetrics(path,{clock=Date.now}={}) {
 if(typeof path!=='string'||!path.trim())throw new Error('An explicit metrics path is required');
 const db=new DatabaseSync(path,{timeout:100});
 try {
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  if(tables.some(row=>!['runtime_metrics','metrics_meta'].includes(row.name)))throw new Error('Use a separate metrics database');
  if(tables.length&&(!db.prepare('SELECT version FROM metrics_meta WHERE version=1').get()||db.prepare('SELECT count(*) n FROM metrics_meta').get().n!==1))throw new Error('Unsupported metrics schema');
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS metrics_meta(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO metrics_meta VALUES(1);
   CREATE TABLE IF NOT EXISTS runtime_metrics(day INTEGER,category TEXT,status INTEGER,bin INTEGER,count INTEGER,total REAL,maximum REAL,PRIMARY KEY(day,category,status,bin));`);
 }catch(error){db.close();throw error;}
 const day=()=>Math.floor(clock()/86400000);
 return {
  close:()=>db.close(),
  record({category,status,elapsed}) {
   if(!['answers','probes','admin','public_api','other'].includes(category)||!Number.isInteger(status)||status<100||status>599||!Number.isFinite(elapsed)||elapsed<0)throw new Error('Invalid metric');
   const today=day();db.exec('BEGIN IMMEDIATE');
   try {
    db.prepare('DELETE FROM runtime_metrics WHERE day<?').run(today-29);
    db.prepare(`INSERT INTO runtime_metrics VALUES(?,?,?,?,1,?,?) ON CONFLICT(day,category,status,bin) DO UPDATE SET count=count+1,total=total+excluded.total,maximum=max(maximum,excluded.maximum)`).run(today,category,status,latencyBin(elapsed),elapsed,elapsed);
    db.exec('COMMIT');
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  snapshot() {
   const groups=new Map();
   for(const row of db.prepare('SELECT category,status,bin,sum(count) count,sum(total) total,max(maximum) maximum FROM runtime_metrics WHERE day>=? AND day<=? GROUP BY category,status,bin').all(day()-29,day())) {
    const key=`${row.category}:${row.status}`,bucket=groups.get(key)||{category:row.category,status:row.status,count:0,total:0,maxLatencyMs:0,histogram:Array(14).fill(0)};
    bucket.count+=row.count;bucket.total+=row.total;bucket.maxLatencyMs=Math.max(bucket.maxLatencyMs,row.maximum);bucket.histogram[row.bin]=row.count;groups.set(key,bucket);
   }
   return {retentionDays:30,percentileMethod:'histogram upper bound; null means above 60000 ms',buckets:[...groups.values()].map(({total,...b})=>({...b,meanLatencyMs:Number((total/b.count).toFixed(2)),...percentiles(b.histogram)}))};
  }
 };
}
