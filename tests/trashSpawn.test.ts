import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getNonOverlappingTrashSpawnSlots, getTrashSpawnSlots } from '../src/utils/trashSpawn';
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

test('five trash items spawn at distinct, non-overlapping positions', () => {
  for (const scale of [0.85, 1.5]) {
    const area = { left: 0, top: 0, right: 1366, bottom: 720 };
    const bins = [
      { left: 8, right: 8 + 120 * scale, top: 720 - 160 * scale, bottom: 720 },
      { left: 1366 - 8 - 120 * scale, right: 1358, top: 720 - 160 * scale, bottom: 720 },
    ];
    const playArea = { left: 0, top: 468, right: 1366, bottom: 720 };
    const desk = { left: 0, top: 518, right: 1366, bottom: 550 };
    const candidates = getTrashSpawnSlots(area, bins, playArea, [desk]);
    const positions = getNonOverlappingTrashSpawnSlots(candidates, area, 5, [], () => 0);

    assert.equal(positions.length, 5, `scale ${scale}: ${positions.length} positions`);
    for (let first = 0; first < positions.length; first++) {
      for (let second = first + 1; second < positions.length; second++) {
        const horizontalDistance = Math.abs(positions[first].x - positions[second].x) / 100 * area.right;
        const verticalDistance = Math.abs(positions[first].y - positions[second].y) / 100 * area.bottom;
        assert(horizontalDistance >= 118 || verticalDistance >= 104);
      }
    }
  }
});

test('trash spawn slots stay inside the floor and clear marked walls and objects', () => {
  const area = { left: 0, top: 0, right: 1366, bottom: 720 };
  const floor = { left: 0, top: 468, right: 1366, bottom: 720 };
  const board = { left: 250, top: 0, right: 1116, bottom: 380 };
  const bins = [
    { left: 8, right: 110, top: 560, bottom: 720 },
    { left: 1248, right: 1358, top: 560, bottom: 720 },
  ];
  const slots = getTrashSpawnSlots(area, bins, floor, [board]);

  assert(slots.length > 0);
  for (const slot of slots) {
    const x = area.left + slot.x / 100 * (area.right - area.left);
    const y = area.top + slot.y / 100 * (area.bottom - area.top);
    assert(y - 79 >= floor.top && y + 79 <= floor.bottom);
    assert(x + 114 < board.left || x - 114 > board.right ||
      y + 79 < board.top || y - 79 > board.bottom);
  }
});

test('yard spawn slots are below the wall and remain on the grass', () => {
  const area = { left: 0, top: 0, right: 1366, bottom: 720 };
  const grass = { left: 0, top: 302, right: 1366, bottom: 720 };
  const wall = { left: 0, top: 209, right: 1366, bottom: 338 };
  const bins = [
    { left: 8, right: 110, top: 560, bottom: 720 },
    { left: 1256, right: 1358, top: 560, bottom: 720 },
  ];
  const slots = getTrashSpawnSlots(area, bins, grass, [wall]);
  const batch = getNonOverlappingTrashSpawnSlots(slots, area, 5);

  assert.equal(batch.length, 5);
  const relocated = getNonOverlappingTrashSpawnSlots(slots, area, 1, batch);
  assert.equal(relocated.length, 1);
  assert(batch.every(position =>
    Math.abs(relocated[0].x - position.x) / 100 * area.right >= 118 ||
    Math.abs(relocated[0].y - position.y) / 100 * area.bottom >= 104
  ));
  for (const slot of batch) {
    const x = area.left + slot.x / 100 * (area.right - area.left);
    const y = area.top + slot.y / 100 * (area.bottom - area.top);
    assert(y - 79 >= grass.top && y + 79 <= grass.bottom);
    assert(y - 79 > wall.bottom || y + 79 < wall.top);
    assert(x + 114 < wall.left || x - 114 > wall.right ||
      y + 79 < wall.top || y - 79 > wall.bottom);
  }
});
