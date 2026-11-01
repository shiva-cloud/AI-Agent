import {openStore} from '../src/store.js';
import {databasePath} from '../src/runtime-config.js';
import {enqueueAlerts,deliverPending} from '../src/realtime-delivery.js';
const store=openStore(databasePath());
try {
 const pending=enqueueAlerts(store);
 if(process.argv.includes('--deliver')) {
  if(!process.env.ALERT_WEBHOOK_SECRET||process.env.ALERT_WEBHOOK_SECRET.length<32)throw new Error('Configure a 32+ character ALERT_WEBHOOK_SECRET before delivery');
  console.log(JSON.stringify(await deliverPending(store,{secret:process.env.ALERT_WEBHOOK_SECRET})));
 }else console.log(JSON.stringify({mode:'enqueue-only',pending}));
}catch(error){console.error(error.message);process.exitCode=1;}finally{store.db.close();}
