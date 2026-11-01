import { SubscriptionManager } from './realtime-subscriptions.js';
import { dispatchAlertWebhook } from './realtime-alerts.js';

export function configureDelivery(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS realtime_deliveries(id INTEGER PRIMARY KEY,subscription_id TEXT NOT NULL,alert_id TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_at INTEGER NOT NULL DEFAULT 0,delivered_at TEXT,UNIQUE(subscription_id,alert_id));`);
}
export function enqueueAlerts(store) {
  configureDelivery(store.db);const subs=new SubscriptionManager(store.db);
  for(const alert of store.realtime.findActiveAlerts({limit:10000}))for(const sub of subs.findMatchingSubscribers(alert)) {
    store.db.prepare('INSERT OR IGNORE INTO realtime_deliveries(subscription_id,alert_id) VALUES (?,?)').run(sub.id,alert.id);
  }
  return store.db.prepare("SELECT count(*) count FROM realtime_deliveries WHERE state='pending'").get().count;
}
// Single supervised dispatcher: no delivery is performed by public HTTP routes.
export async function deliverPending(store,{fetcher,secret,now=Date.now(),limit=25}={}) {
  configureDelivery(store.db);
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Invalid delivery limit');
  // A crashed process may leave a claim behind. Redelivery is at-least-once;
  // receivers use the stable Idempotency-Key to suppress duplicates.
  store.db.prepare("UPDATE realtime_deliveries SET state=CASE WHEN attempts>=3 THEN 'failed' ELSE 'pending' END WHERE state='sending' AND next_at<=?").run(now);
  const rows=store.db.prepare("SELECT d.*,s.contact_endpoint,s.is_active FROM realtime_deliveries d JOIN realtime_subscriptions s ON s.id=d.subscription_id WHERE d.state='pending' AND d.next_at<=? ORDER BY d.id LIMIT ?").all(now,limit);
  const counts={delivered:0,retry:0,cancelled:0,failed:0};
  for(const row of rows) {
    const alert=store.realtime.findActiveAlerts({alertId:row.alert_id})[0];
    if(!alert||!row.is_active){store.db.prepare("UPDATE realtime_deliveries SET state='cancelled' WHERE id=?").run(row.id);counts.cancelled++;continue;}
    // Claim synchronously before awaiting network I/O to prevent concurrent dispatch.
    if(!store.db.prepare("UPDATE realtime_deliveries SET state='sending',attempts=attempts+1,next_at=? WHERE id=? AND state='pending' AND EXISTS (SELECT 1 FROM realtime_subscriptions s WHERE s.id=subscription_id AND s.is_active=1 AND s.contact_endpoint=?)").run(now+60000,row.id,row.contact_endpoint).changes)continue;
    let result;try{result=await dispatchAlertWebhook({...alert,headline:alert.headline,detectedAt:alert.detected_at},{url:row.contact_endpoint,secret,idempotencyKey:`delivery-${row.id}`},fetcher);}catch{result={dispatched:false};}
    if(result.dispatched){const at=new Date(now).toISOString();store.db.prepare("UPDATE realtime_deliveries SET state='delivered',delivered_at=? WHERE id=?").run(at,row.id);store.db.prepare('UPDATE realtime_subscriptions SET last_notified_at=? WHERE id=?').run(at,row.subscription_id);counts.delivered++;}
    else{const state=row.attempts+1>=3?'failed':'pending';store.db.prepare('UPDATE realtime_deliveries SET state=?,next_at=? WHERE id=?').run(state,now+60000*(row.attempts+1),row.id);counts[state==='failed'?'failed':'retry']++;}
  }
  return counts;
}
