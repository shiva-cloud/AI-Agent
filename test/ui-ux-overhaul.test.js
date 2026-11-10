import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appSource } from './app-source.js';
import { resolveQuestionLocation } from '../public/app/data.js';

test('UI/UX Overhaul: Sidebar Navigation Show/Hide State and Badges', () => {
  const html = readFileSync('public/index.html', 'utf8');

  // Verify accordion controls exist
  assert.ok(html.includes('id="sidebar-accordion-mode-btn"'), 'Mode button missing');
  assert.ok(html.includes('id="sidebar-toggle-all-btn"'), 'Toggle all button missing');

  // Verify nav group states use clear text indicators
  const navGroupStates = [...html.matchAll(/class="nav-group-state[^"]*"[^>]*>([^<]+)<\/span>/g)].map(m => m[1]);
  assert.ok(navGroupStates.length >= 7, 'At least 7 nav groups must have state indicators');
  
  // First active group should say "- Hide Menu", collapsed ones should say "+ Show Menu"
  assert.equal(navGroupStates[0], '− Hide Menu');
  for (let i = 1; i < navGroupStates.length; i++) {
    assert.equal(navGroupStates[i], '+ Show Menu');
  }
});

test('UI/UX Overhaul: Tool Switcher Configuration Coverage', () => {
  const app = appSource();
  const html = readFileSync('public/index.html', 'utf8');

  // Verify TOOL_SWITCHER_CONFIG covers all multi-tool views
  const expectedViews = [
    'casework', 'pathway', 'tenancy', 'paycheck', 'tax', 
    'cashflow', 'banking', 'healthcare', 'schools', 'binder', 'airport', 'driving'
  ];

  for (const view of expectedViews) {
    assert.ok(app.includes(`${view}: [`), `View ${view} missing from TOOL_SWITCHER_CONFIG`);
  }

  // Verify key cards exist in HTML
  assert.ok(html.includes('id="binder-checklist-card"'), '#binder-checklist-card missing from HTML');
  assert.ok(html.includes('id="airport-content"'), '#airport-content missing from HTML');
  assert.ok(html.includes('id="ispa-compliance-audit"'), '#ispa-compliance-audit missing from HTML');
  assert.ok(html.includes('id="customs-declaration-card"'), '#customs-declaration-card missing from HTML');
  assert.ok(html.includes('id="pet-import-card"'), '#pet-import-card missing from HTML');
});

test('UI/UX Overhaul: Responsive Grid and Overflow Shield in CSS', () => {
  const css = readFileSync('public/styles.css', 'utf8');

  assert.ok(css.includes('max-width: 100vw !important'), '100vw max-width missing in styles.css');
  assert.ok(css.includes('overflow-x: hidden !important'), 'overflow-x hidden missing in styles.css');
  assert.ok(css.includes('grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)) !important'), 'Responsive grid wrapping missing in styles.css');
  assert.ok(css.includes('position: sticky !important'), 'Sticky tool switcher bar missing in styles.css');
});

test('UI Sticky Location Guard clears foreign queries across Big-12 regions without breaking Canadian licence exchange or pronoun "us"', () => {
  assert.equal(resolveQuestionLocation('What is the Kaution limit in Bavaria?', undefined, 'Toronto', 'Toronto').city, undefined);
  assert.equal(resolveQuestionLocation('How do I apply for a share code in Manchester?', undefined, 'Toronto', 'Toronto').city, undefined);
  assert.equal(resolveQuestionLocation('How do I get an SSN in the US?', undefined, 'Toronto', 'Toronto').city, undefined);
  assert.equal(resolveQuestionLocation('What are tenancy deposit rules in Italy?', undefined, '', 'Toronto').city, undefined);
  assert.equal(resolveQuestionLocation('Can I exchange my UK driving licence?', undefined, 'Toronto', 'Toronto').city, 'Toronto');
  assert.equal(resolveQuestionLocation('Tell us about OHIP waiting periods', undefined, 'Toronto', 'Toronto').city, 'Toronto');
  assert.equal(resolveQuestionLocation('What is the rent deposit rule in London, Ontario?', undefined, 'Toronto', 'Toronto').city, 'Toronto');
});
