import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/shiva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const store = openStore(':memory:'); const server = createApp(store, undefined, {});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report = {views: [], checks: [], errors: []};
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil: 'networkidle'});
  const views = await page.locator('.sidebar [data-view]').evaluateAll(nodes => nodes.map(node => node.dataset.view));
  for (const view of views) {
    const button = page.locator(`.sidebar [data-view="${view}"]`);
    if (!await button.isVisible()) {
      const group = await button.evaluate(node => node.closest('.nav-group')?.querySelector('.nav-group-toggle')?.getAttribute('aria-controls'));
      assert.ok(group, `Missing group for ${view}`);
      const toggle = page.locator(`[aria-controls="${group}"]`);
      await toggle.focus(); await page.keyboard.press('Enter');
    }
    await button.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(view => document.activeElement === document.querySelector(`#${view} h1`), view);
    assert.equal(await page.locator('.view:visible').count(), 1);
    assert.equal(await button.getAttribute('aria-current'), 'page');
    report.views.push(view);
  }
  await page.setViewportSize({width: 390, height: 844});
  await page.evaluate(() => {window.__navClicks = 0; document.addEventListener('click', event => {if (event.target.closest('[data-view]')) window.__navClicks++;}, true);});
  for (const view of ['ask', 'casework', 'binder', 'airport']) {
    const button = page.locator(`.mobile-nav-btn[data-view="${view}"]`);
    await button.focus(); await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-current'), 'page');
    assert.equal(await page.locator('.mobile-nav-btn[aria-current=page]').count(), 1);
    assert.equal(await page.locator(`.sidebar [data-view="${view}"]`).getAttribute('aria-current'), 'page');
  }
  assert.equal(await page.evaluate(() => window.__navClicks), 4, 'mobile navigation must not dispatch duplicate sidebar clicks');
  report.checks.push('desktop keyboard view navigation and mobile current-page state');
  await page.evaluate(() => {
    window.__trigger = document.activeElement;
    const sentinel = document.createElement('div'); sentinel.id = 'inert-sentinel'; sentinel.inert = true; document.body.append(sentinel);
    window.__oldFetch = window.fetch;
    window.fetch = () => new Promise(resolve => {window.__finish = resolve;});
    window.triggerToolModal({id: 'lmia-readiness'});
  });
  assert.equal(await page.locator('main').evaluate(node => node.inert), true);
  await page.locator('#tool-modal-form button[type=submit]').click();
  assert.equal(await page.locator('#tool-modal-form').getAttribute('aria-busy'), 'true');
  assert.match(await page.locator('#tool-modal-status').textContent(), /Please wait/);
  await page.evaluate(() => window.__finish({ok: false, status: 503}));
  await page.waitForFunction(() => document.querySelector('#tool-modal-form').getAttribute('aria-busy') === 'false');
  assert.match(await page.locator('#tool-modal-results [role=alert]').innerText(), /503/);
  assert.equal(await page.locator('#tool-modal-results').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#tool-modal-close-btn').evaluate(node => node === document.activeElement), true);
  for (const key of ['?', '/', 'Alt+1', 'Control+k']) {
    await page.keyboard.press(key);
    assert.equal(await page.locator('#tool-modal-close-btn').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('#airport').isVisible(), true);
  }
  report.checks.push('background help, search, navigation and palette shortcuts suppressed inside modal');
  await page.evaluate(() => window.triggerToolModal({id: 'form-autopopulate'}));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('main').evaluate(node => node.inert), false);
  assert.equal(await page.locator('#inert-sentinel').evaluate(node => node.inert), true);
  assert.equal(await page.evaluate(() => document.activeElement === window.__trigger), true);
  report.checks.push('modal background isolation, original inert state, busy/error semantics and focus restoration across tool replacement');
  assert.deepEqual(report.errors, []); report.status = 'passed';
} catch (error) {report.status = 'failed'; report.failure = error.stack; process.exitCode = 1;}
finally {writeFileSync('artifacts/KEYBOARD_ACCESSIBILITY_2026-11-03.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report)); await browser.close(); await new Promise(resolve => server.close(resolve)); store.db.close();}
