import test from 'node:test';
import assert from 'node:assert/strict';
import { humanizeError, humanizeGap, GAP_LABELS } from '../public/errors.js';

test('429 wins from status code even when the body text never mentions limits', () => {
  const err = new Error('Please wait before trying again');
  err.status = 429;
  err.retryAfterSeconds = 41;
  const m = humanizeError(err);
  assert.equal(m.title, 'Too many requests');
  assert.equal(m.retryAfter, 41);
});

test('429 is also recognized from Retry-After alone', () => {
  assert.equal(humanizeError({ retryAfterSeconds: 7 }).title, 'Too many requests');
});

test('503 admin-disabled is not misread as a bad token', () => {
  const m = humanizeError({ status: 503, message: 'Admin disabled. Set ADMIN_TOKEN to at least 24 characters and restart.' });
  assert.equal(m.title, 'Editorial console unavailable');
  assert.notEqual(m.title, 'Authentication required');
});

test('HTTP failures keep their own honest verdicts', () => {
  assert.equal(humanizeError({ status: 401, message: 'Admin authorization required' }).title, 'Authentication required');
  assert.equal(humanizeError({ status: 403, message: 'Cross-origin requests are not allowed' }).title, 'Request blocked');
  assert.equal(humanizeError({ status: 404, message: 'Not found' }).title, 'Page not found');
  assert.equal(humanizeError({ status: 413, message: 'Request too large' }).title, 'Question too long');
  assert.equal(humanizeError({ status: 415, message: 'Use application/json' }).title, 'Request not supported');
  assert.equal(humanizeError({ message: 'timed out' }).title, 'Request timed out');
  assert.equal(humanizeError({ message: 'Failed to fetch' }).title, 'Cannot connect');
  assert.equal(humanizeError({ message: 'Only English (en) is supported in this release' }).title, 'Language not supported');
});

test('unknown errors keep their raw message instead of pretending', () => {
  assert.equal(humanizeError({ message: 'Booking constraint' }).body, 'Booking constraint');
  assert.equal(humanizeError().title, 'Something went wrong');
});

test('gap wording keeps unreviewed and expired distinct and passes unknown reasons through', () => {
  assert.ok(!GAP_LABELS.awaiting_human_review.includes('expired'));
  assert.ok(!GAP_LABELS.stale.includes('review'));
  assert.equal(humanizeGap('future_check_date'), 'the source check date is still in the future');
  assert.equal(humanizeGap('brand_new_reason'), 'brand new reason');
});
