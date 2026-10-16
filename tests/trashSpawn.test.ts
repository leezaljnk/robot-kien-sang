import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getTrashSpawnSlots } from '../src/utils/trashSpawn';
import { drawTrashItems } from '../src/utils/trashCycle';
import { TRASH_ITEMS } from '../src/data/trashItems';
import { YARD_TRASH_ITEMS } from '../src/data/yardTrashItems';
import { VOICE_PROMPTS } from '../src/data/voicePrompts';

test('trash cycle shows every item once before starting a new randomized cycle', () => {
  let remaining: typeof TRASH_ITEMS = [];
  const firstCycle: string[] = [];

  for (let batch = 0; batch < TRASH_ITEMS.length / 3; batch++) {
    const draw = drawTrashItems(TRASH_ITEMS, remaining, 3, () => 0);
    firstCycle.push(...draw.selected.map(item => item.id));
    remaining = draw.remaining;
  }

  assert.equal(firstCycle.length, TRASH_ITEMS.length);
  assert.deepEqual(new Set(firstCycle), new Set(TRASH_ITEMS.map(item => item.id)));
  assert.equal(remaining.length, 0);

  const nextBatch = drawTrashItems(TRASH_ITEMS, remaining, 3, () => 0);
  assert.equal(nextBatch.selected.length, 3);
  assert.equal(new Set(nextBatch.selected.map(item => item.id)).size, 3);
  assert.equal(nextBatch.remaining.length, TRASH_ITEMS.length - 3);
});

test('yard trash has an independent cycle containing both sorting categories', () => {
  let remaining: typeof YARD_TRASH_ITEMS = [];
  const seen: string[] = [];

  while (seen.length < YARD_TRASH_ITEMS.length) {
    const draw = drawTrashItems(YARD_TRASH_ITEMS, remaining, 1, () => 0);
    seen.push(draw.selected[0].id);
    remaining = draw.remaining;
  }

  assert.equal(new Set(seen).size, YARD_TRASH_ITEMS.length);
  assert.deepEqual(new Set(seen), new Set(YARD_TRASH_ITEMS.map(item => item.id)));
  assert(YARD_TRASH_ITEMS.some(item => item.category === 'organic'));
  assert(YARD_TRASH_ITEMS.some(item => item.category === 'recyclable'));
  assert.equal(YARD_TRASH_ITEMS.length, 10);
  assert.equal(new Set(YARD_TRASH_ITEMS.map(item => item.id)).size, 10);
  assert.equal(YARD_TRASH_ITEMS.filter(item => item.category === 'organic').length, 5);
  assert.equal(YARD_TRASH_ITEMS.filter(item => item.category === 'recyclable').length, 5);
  assert(YARD_TRASH_ITEMS.every(item => item.iconType.startsWith('yard_')));
  assert(YARD_TRASH_ITEMS.every(yardItem =>
    TRASH_ITEMS.every(classroomItem => classroomItem.id !== yardItem.id)
  ));
});

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
