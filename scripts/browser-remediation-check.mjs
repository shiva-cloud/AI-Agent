import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/shiva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const store=openStore(':memory:');
const server=createApp(store,undefined,{}, {rateLimits:{v1:{limit:10000,windowMs:60000},admin:{limit:1000,windowMs:60000},static:{limit:10000,windowMs:60000}}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={errors:[],requests:[],viewports:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',error=>report.errors.push(error.message));
 page.on('response',response=>{if(response.url().includes('/v1/tools/settlement-journey'))report.requests.push({url:response.url(),status:response.status()});});
 await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
 report.journey=await page.locator('#journey-category').evaluate(el=>({section:el.closest('section')?.id,categories:[...el.options].map(o=>({value:o.value,label:o.textContent}))}));
 report.navigation=await page.locator('[data-view]').evaluateAll(els=>els.map(e=>({view:e.dataset.view,label:e.textContent.trim().slice(0,50)})));
 const journeyButton=page.locator('[data-view="journey"]');
 await page.locator('[aria-controls="nav-group-arrival"]').click();
 if(await journeyButton.count())await journeyButton.first().click();
 else await page.locator(`[data-view="${report.journey.section?.replace(/^view-/, '')}"]`).first().click();
 await page.locator('#journey-landing-date').fill('2027-02-15');
 await page.locator('#journey-landing-date').press('Tab');
 await page.locator('#journey-category').selectOption('study_permit');
 await Promise.all([page.waitForResponse(r=>r.url().includes('/v1/tools/settlement-journey')&&r.url().includes('Vancouver')),page.locator('#journey-province').selectOption('BC')]);
 await page.waitForTimeout(300);
 report.timeline=await page.locator('#journey-timeline').innerText();
 report.metrics=await page.locator('#journey-metrics').innerText();
 assert.match(report.metrics,/2027-02-15/);assert.ok(report.timeline.length>100);assert.doesNotMatch(report.timeline,/undefined|Invalid Date|could not be loaded/);
 assert.ok(report.requests.some(r=>r.url.includes('category=study_permit')&&r.url.includes('city=Vancouver')&&r.status===200));
 const checks=page.locator('#journey-timeline input[type=checkbox]');
 assert.ok(await checks.count()>1);await checks.first().check();await page.waitForTimeout(250);
 assert.equal(await checks.nth(1).isChecked(),false);
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(350);
  await page.evaluate(()=>scrollTo(0,0));
  report.viewports.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth})));
  await page.screenshot({path:`artifacts/remediation-journey-${width}.png`,fullPage:false});
 }
 await page.locator('#journey-country').selectOption('Germany');
 assert.match(await page.locator('#journey-timeline').innerText(),/not available yet/);
 assert.equal(await page.locator('#journey-timeline input[type=checkbox]').count(),0);
 assert.deepEqual(report.errors,[]);
 report.status='passed';
}catch(error){report.status='failed';report.failure=error.stack;process.exitCode=1;}
finally{
 writeFileSync('artifacts/remediation-browser.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:report.status,failure:report.failure,errors:report.errors,requests:report.requests.slice(-4)},null,2));
 await browser.close();await new Promise(r=>server.close(r));store.db.close();
}
