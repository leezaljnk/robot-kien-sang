import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getTrashSpawnSlots } from '../src/utils/trashSpawn';
import { VOICE_PROMPTS } from '../src/data/voicePrompts';

test('game victory threshold and recorded victory prompt both use 10 stars', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /const MAX_SCORE = 10;/);
  assert.match(app, /maxScore=\{MAX_SCORE\}/);
  assert.match(app, /score >= MAX_SCORE/);
  assert.equal(VOICE_PROMPTS.find(p => p.id === 'victory')?.text, 'Yeah, 10 sao rồi, lớp mình sạch quá!');
});

test('at least three spawn slots clear both bin hit areas including labels and 24px padding', () => {
  for (const width of [375, 768, 1366]) {
    for (const scale of [0.85, 1.5]) {
      const area = { left: 0, top: 70, right: width, bottom: 670 };
      const bins = [
        { left: 8, right: 8 + 120 * scale, top: 670 - 160 * scale, bottom: 670 },
        { left: width - 8 - 120 * scale, right: width - 8, top: 670 - 160 * scale, bottom: 670 },
      ];
      const slots = getTrashSpawnSlots(area, bins);
      assert(slots.length >= 3, `${width}px scale ${scale}: ${slots.length}`);
      for (const slot of slots) {
        const x = slot.x / 100 * width;
        const y = 70 + slot.y / 100 * 600;
        for (const bin of bins) {
          assert(x + 114 < bin.left || x - 114 > bin.right ||
            y + 79 < bin.top || y - 79 > bin.bottom);
        }
      }
    }
  }
});
