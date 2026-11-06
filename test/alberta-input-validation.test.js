
import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateAlbertaMaternityParentalLeave as leave} from '../src/alberta-employment-maternity-parental-leave-navigator.js';
import {evaluateAlbertaTenancySubleaseAssignment as tenancy} from '../src/alberta-residential-tenancy-sublease-assignment-navigator.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
import {evaluateAlbertaLandlordEntry as entry} from '../src/alberta-residential-tenancy-landlord-entry-notice-navigator.js';
import {evaluateAlbertaPeriodicTenancyNotice as periodic} from '../src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';

test('string false cannot grant entry consent or satisfy a signed-notice check',()=>{
 assert.equal(entry({tenantConsentedToEntry:'false', noticeHoursGiven:0}).isEntryPermitted,false);
 assert.equal(entry({tenantConsentedToEntry:'true', noticeHoursGiven:0}).isEntryPermitted,true);
 assert.equal(periodic({noticeInWritingAndSigned:'false'}).isValidNotice,false);
 assert.throws(()=>periodic({tenancyType:'WEEK_TO_WEEK'}),/MONTH_TO_MONTH/);
});
import {auditAlbertaTerminationJustCause as termination} from '../src/alberta-employment-termination-just-cause-audit-navigator.js';
import {evaluateAlbertaAbandonedGoods as goods} from '../src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js';

test('termination pay findings and remedies reflect notice already given',()=>{
 const profile={yearsOfContinuousService:5, regularWeeklyWageCad:1000, employerIssuedPriorWrittenWarnings:'false', employeeGivenOpportunityToImprove:'false'};
 const partial=termination({...profile, actualTerminationNoticeWeeksGiven:3});
 assert.equal(partial.statutoryNoticeScale.statutoryTerminationPayEntitledCad,1000);
 assert.match(partial.statutoryViolations[0].finding,/\$1000\b/);
 assert.match(partial.actionableRemedies[0].remedyDescription,/\$1000\b/);
 const covered=termination({...profile, actualTerminationNoticeWeeksGiven:4});
 assert.equal(covered.statutoryViolations.length,0);
 assert.equal(covered.complianceStatus,'JUST_CAUSE_DEFECTIVE_NO_TERMINATION_PAY_SHORTFALL');
 assert.ok(!covered.actionableRemedies.some(r=>r.action==='FILE_EMPLOYMENT_STANDARDS_TERMINATION_PAY_CLAIM'));
 assert.throws(()=>termination({regularWeeklyWageCad:null}));
 assert.throws(()=>goods({actorRole:[]}));
 assert.equal(goods({landlordDisposedBefore30Days:'false'}).statutoryViolations.length,0);
});

test('Alberta evaluators reject forged enums, invalid dates and coercion traps',()=>{
 for(const value of ['unknown', {}, null, 3, []]){
  assert.throws(()=>leave({leaveType:value}));
  assert.throws(()=>tenancy({transactionType:value}));
  assert.throws(()=>tenancy({landlordResponseStatus:value}));
 }
 for(const value of ['2026-02-30','2025-02-29','bad',null]){
  assert.throws(()=>leave({assessmentDate:value}));
  assert.throws(()=>tenancy({requestDeliveredDate:value}));
  assert.throws(()=>tenancy({currentDate:value}));
 }
 for(const value of [-1,1.5,'0x10',[],null,true,'',Infinity]){
  assert.throws(()=>leave({consecutiveDaysOfEmployment:value}));
 }
 assert.throws(()=>tenancy({feeChargedForConsentCad:-1}));
 assert.equal(tenancy({feeChargedForConsentCad:'0.5'}).rightsAssessment.unlawfulFeeAmountCad,0.5);
 const result=leave({employerRefusesReinstatement:'false',employerDisciplinedOrDismissedDueToLeave:'false',medicalCertificateProvided:'false'});
 assert.equal(result.statutoryViolations.length,0);
 assert.ok(result.riskWarnings.some(x=>x.warningType==='MISSING_MEDICAL_CERTIFICATE'));
 assert.equal(leave({consecutiveDaysOfEmployment:0}).isEligible,false);
});

test('Alberta HTTP paths reject invalid inputs consistently for GET and POST',async()=>{
 const store=openStore(':memory:'); const server=createApp(store);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root='http://127.0.0.1:'+server.address().port+'/v1/tools/';
 try{
  for(const [path,key,value] of [
   ['alberta-landlord-entry','purpose','UNKNOWN'],
   ['alberta-landlord-entry','entryDayOfWeek','not-a-day'],
   ['alberta-landlord-entry','consent','maybe'],
   ['alberta-landlord-entry','hour','20.5'],
   ['alberta-landlord-entry','assessmentDate','2025-02-29'],
   ['alberta-periodic-tenancy-notice','party','UNKNOWN'],
   ['alberta-periodic-tenancy-notice','tenancyType','WEEK_TO_WEEK'],
   ['alberta-periodic-tenancy-notice','monthsNotice','1.5'],
   ['alberta-periodic-tenancy-notice','writtenSigned','maybe'],
   ['alberta-just-cause','misconduct','UNKNOWN'],
   ['alberta-just-cause','warnings','maybe'],
   ['alberta-just-cause','actualTerminationNoticeWeeksGiven','-1'],
   ['alberta-abandoned-goods','assessmentDate','2026-02-30'],
   ['alberta-abandoned-goods','daysElapsed','1.5'],
   ['alberta-abandoned-goods','role','UNKNOWN'],
   ['alberta-employment-maternity-parental-leave','leaveType','UNKNOWN'],
   ['alberta-employment-maternity-parental-leave','medCert','maybe'],
   ['alberta-employment-maternity-parental-leave','daysEmployed','1.5'],
   ['alberta-employment-maternity-parental-leave','assessmentDate','2026-02-30'],
   ['alberta-employment-maternity-parental-leave','consecutiveDaysOfEmployment','-1'],
   ['alberta-tenancy-sublease','type','UNKNOWN'],
   ['alberta-tenancy-sublease','responseStatus','UNKNOWN'],
   ['alberta-tenancy-sublease','requestDate','2026-02-30'],
   ['alberta-tenancy-sublease','requestDeliveredDate','2026-02-30'],
   ['alberta-tenancy-sublease','feeCharged','-1']
  ]){
   for(const response of [
    await fetch(root+path+'?'+new URLSearchParams({[key]:value})),
    await fetch(root+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({[key]:value})})
   ]){assert.equal(response.status,400,path+' '+key);await response.arrayBuffer();}
  }
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));store.db.close();}
});

