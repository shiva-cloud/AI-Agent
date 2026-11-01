import {openStore} from '../src/store.js';
import {databasePath} from '../src/runtime-config.js';
import {SubscriptionManager} from '../src/realtime-subscriptions.js';
const store=openStore(databasePath());
try{console.log(JSON.stringify(new SubscriptionManager(store.db).retain({days:Number(process.argv.find(a=>a.startsWith('--days='))?.slice(7)||365),apply:process.argv.includes('--apply')})));}
catch(error){console.error(error.message);process.exitCode=1;}finally{store.db.close();}
