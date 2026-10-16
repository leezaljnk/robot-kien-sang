import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getBinApproachTarget } from '../src/utils/movement';

test('approaches actual bin image with an 8px gap and aligned feet across viewport sizes', () => {
  for (const width of [375, 768, 1366]) {
    for (const robotWidth of [112, 168]) {
      const area = { left: 20, right: 20 + width, top: 70, bottom: 670, width, height: 600 };
      for (const organic of [true, false]) {
        const left = organic ? 32 : width - 92;
        const bin = { left, right: left + 80, top: 500, bottom: 620, width: 80, height: 120 };
        const target = getBinApproachTarget(area, bin, robotWidth, organic);
        const center = area.left + target.x / 100 * area.width;
        assert(Math.abs((organic ? center - robotWidth / 2 - bin.right
          : bin.left - center - robotWidth / 2) - 8) < 0.001);
        assert(Math.abs(area.top + target.y / 100 * area.height - bin.bottom) < 0.001);
      }
    }
  }
});
