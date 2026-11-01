import {openStore} from '../src/store.js';
import {databasePath} from '../src/runtime-config.js';
import {REALTIME_SOURCES} from '../src/realtime-registry.js';
import {permitCrawl} from '../src/crawl-policy.js';
const [sourceId,action,reviewer,note]=process.argv.slice(2);
const source=REALTIME_SOURCES.find(s=>s.id===sourceId);
if(!source||!['allow','deny'].includes(action)||!reviewer||!note){
 console.error('Usage: node scripts/review-crawl-access.js SOURCE_ID allow|deny REVIEWER "Source-specific access-policy rationale"');process.exitCode=1;
}else{
 const store=openStore(databasePath());
 try{permitCrawl(store.db,source,{reviewer,note,allowed:action==='allow'});console.log(JSON.stringify({sourceId,action,recorded:true}));}
 catch(error){console.error(error.message);process.exitCode=1;}finally{store.db.close();}
}
