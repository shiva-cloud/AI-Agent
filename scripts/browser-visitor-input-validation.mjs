import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/shiva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium } = require('playwright');
const store = openStore(':memory:');
const server = createApp(store);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.triggerToolModal({ id: 'visitor-visa-financial-ties' }));
  for (const field of ['days','funds','income','tenure','leaveLetter','property','familyHome','familyTraveling','g7Travel','refusal','dualIntent']) {
    assert.equal(await page.locator('[name="'+field+'"]').inputValue(), '');
  }
  await page.locator('#tool-modal-form button[type=submit]').click();
  await page.waitForFunction(() => document.querySelector('#tool-modal-results')?.textContent.includes('Not determined'));
  assert.ok(!(await page.locator('#tool-modal-results').innerText()).includes('null/100'));
  for (const [field,value] of Object.entries({days:'14',funds:'0',income:'0',tenure:'0'})) await page.locator('[name="'+field+'"]').fill(value);
  for (const field of ['leaveLetter','property','familyHome','familyTraveling','g7Travel','refusal','dualIntent']) await page.locator('[name="'+field+'"]').selectOption('false');
  await page.locator('#tool-modal-form button[type=submit]').click();
  await page.waitForFunction(() => document.querySelector('#tool-modal-results')?.textContent.includes('unvalidated heuristic'));
  assert.ok(!(await page.locator('#tool-modal-results').innerText()).includes('RISK TIER:'));
  assert.deepEqual(errors, []);
  writeFileSync('artifacts/VISITOR_WORDING_2026-11-06_browser.json', JSON.stringify({ passed: true, checks: ['all 11 fields initially blank', 'missing inputs render not determined without null score', 'explicit zero and false complete the assessment', 'complete result uses heuristic notice without risk-tier badge'], errors }, null, 2));
  console.log('Visitor missing-input browser checks passed.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  store.db.close();
}
