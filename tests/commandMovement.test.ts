import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCommandMoveDuration } from '../src/utils/movement';

test('command movement takes at least 0.6 seconds and 200px per second on longer paths', () => {
  const area = { width: 1000, height: 600 };
  assert.equal(getCommandMoveDuration(50, 70, 51, 70, area), 600);
  assert.equal(getCommandMoveDuration(20, 70, 80, 70, area), 3000);
  assert.equal(getCommandMoveDuration(20, 20, 50, 60, area), Math.hypot(300, 240) * 5);
  assert.equal(getCommandMoveDuration(50, 70, 50, 90, area), 600);
});

test('speed stays consistent across viewport sizes and both directions', () => {
  for (const width of [375, 768, 1366]) {
    const area = { width, height: 600 };
    const duration = getCommandMoveDuration(10, 70, 90, 70, area);
    assert(Math.abs(duration - width * 4) < 0.001);
    assert.equal(getCommandMoveDuration(90, 70, 10, 70, area), duration);
  }
});
