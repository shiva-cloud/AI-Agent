import createClient from 'openapi-fetch';
import type {paths} from '../generated/api.d.ts';

export async function exerciseGeneratedClient(baseUrl:string,token:string) {
 const client=createClient<paths>({baseUrl,headers:{Authorization:`Bearer ${token}`}});
 const ready=await client.GET('/ready');
 if(ready.data?.status!=='ready')throw new Error('Readiness contract failed');
 const answer=await client.POST('/v1/answers',{body:{question:'SIN application',language:'en'}});
 if(!answer.data?.traceId||answer.data.ai.status!=='disabled')throw new Error('Answer contract failed');
 const feedback=await client.POST('/v1/feedback',{body:{traceId:answer.data.traceId,issue:'helpful'}});
 if(feedback.data?.saved!==true)throw new Error('Feedback contract failed');
 const schedule=await client.POST('/admin/job-schedules',{body:{scheduleId:'client-fixture',kind:'reindex',targetId:'all',nextRun:0,intervalMs:1000,enabled:false}});
 if(schedule.data?.revision!==1)throw new Error('Schedule contract failed');
 const history=await client.GET('/admin/job-schedules/{id}/history',{params:{path:{id:'client-fixture'},query:{limit:1,after:0}}});
 if(history.data?.items.length!==1||history.data.items[0]?.after.enabled!==0)throw new Error('History contract failed');
 const denied=await createClient<paths>({baseUrl}).GET('/admin/jobs');
 if(denied.response.status!==401||denied.error?.code!=='unauthorized')throw new Error('Error contract failed');
 return {status:'passed',checks:6};
}

// Never executed: expected compile errors prove schema-derived constraints.
function negativeTypeChecks(client:ReturnType<typeof createClient<paths>>) {
 // @ts-expect-error Unsupported endpoint must be rejected.
 void client.GET('/not-a-route');
 // @ts-expect-error Missing required question must be rejected.
 void client.POST('/v1/answers',{body:{language:'en'}});
 // @ts-expect-error Unsupported feedback enum must be rejected.
 void client.POST('/v1/feedback',{body:{traceId:'fixture',issue:'anything'}});
}
