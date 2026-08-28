import assert from 'node:assert/strict';
import test from 'node:test';
import { safeNextPath } from '../lib/auth-redirect.ts';

const origin = 'http://localhost:3001';

test('safeNextPath keeps local paths with query and hash', () => {
  assert.equal(safeNextPath('/dashboard?tab=saved#top', origin), '/dashboard?tab=saved#top');
});

test('safeNextPath rejects protocol-relative redirects', () => {
  assert.equal(safeNextPath('//evil.example/path', origin), null);
});

test('safeNextPath rejects absolute external URLs', () => {
  assert.equal(safeNextPath('https://evil.example/path', origin), null);
});

test('safeNextPath rejects empty and relative values', () => {
  assert.equal(safeNextPath('', origin), null);
  assert.equal(safeNextPath('dashboard', origin), null);
});
