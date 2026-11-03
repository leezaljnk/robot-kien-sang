import assert from 'node:assert/strict';
import { HEAD_TILT_TRASH_ITEMS } from '../src/data/headTiltTrashItems';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HandPickupTimer } from '../src/components/HandPickupTimer';
import {
  canPickUp, createHandPickupRounds, getHandDropCategory, getHandOpenness,
  createHandPickupPosition, HAND_DROP_ZONES, HAND_PICKUP_MAX_COUNT, isValidHandPickupCount,
  HandGestureDetector, mapHandPoint, PICKUP_ORIGIN, smoothHandPoint, stepHandPickup,
  advanceHandPickupTimer, HAND_PICKUP_TIME_MS, HAND_PICKUP_BONUS_MS,
} from '../src/utils/handPickup';

test('energy ring drains clockwise, exposes remaining time and has no detached time bar', () => {
  const html = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: 5000, totalMs: 20000, running: true, bonus: false }));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuemax="20"/);
  assert.match(html, /aria-valuenow="5"/);
  assert.equal([...html.matchAll(/class="hand-energy-tick"/g)].length, 15);
  assert.match(html, /data-tick="45"/);
  assert.doesNotMatch(html, /data-tick="44"/);
  assert.doesNotMatch(html, /<circle/);
  assert.match(html, /hand-energy-ring--low/);
  assert.match(html, /hand-energy-sparks/);
  assert.doesNotMatch(html, /hand-time-track/);
});

test('energy ring warns strictly below thirty percent, clamps and supports bonus and paused states', () => {
  const full = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: 25000, totalMs: 20000, running: false, bonus: false }));
  assert.match(full, /aria-valuenow="20"/);
  assert.match(full, /đang tạm dừng/);
  const boundary = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: 6000, totalMs: 20000, running: true, bonus: false }));
  assert.doesNotMatch(boundary, /hand-energy-ring--low/);
  const bonus = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: 10000, totalMs: 10000, running: true, bonus: true }));
  assert.match(bonus, /aria-valuemax="10"/);
  assert.match(bonus, /\+10s/);
  assert.doesNotMatch(bonus, /hand-energy-ring--low/);
  const empty = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: -1, totalMs: 20000, running: false, bonus: false }));
  assert.match(empty, /aria-valuenow="0"/);
  assert.doesNotMatch(empty, /class="hand-energy-tick"/);
});

test('energy ticks disappear monotonically and refill completely for bonus time', () => {
  for (const [remainingMs, count] of [[20000, 60], [15000, 45], [10000, 30], [5000, 15], [1, 1], [0, 0]]) {
    const html = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs, totalMs: 20000, running: true, bonus: false }));
    assert.equal([...html.matchAll(/class="hand-energy-tick"/g)].length, count);
  }
  const bonus = renderToStaticMarkup(createElement(HandPickupTimer, { remainingMs: 10000, totalMs: 10000, running: true, bonus: true }));
  assert.equal([...bonus.matchAll(/class="hand-energy-tick"/g)].length, 60);
});

test('energy rings have independent fuel gradient IDs', () => {
  const html = renderToStaticMarkup(createElement('div', null,
    createElement(HandPickupTimer, { remainingMs: 20000, totalMs: 20000, running: true, bonus: false }),
    createElement(HandPickupTimer, { remainingMs: 1000, totalMs: 20000, running: true, bonus: false })));
  const ids = [...html.matchAll(/linearGradient id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.equal(new Set(ids).size, 2);
});

test('soft timer pauses without consuming time and only ticks on the final four second boundaries', () => {
  assert.deepEqual(advanceHandPickupTimer(HAND_PICKUP_TIME_MS, 5000, false), { remainingMs: HAND_PICKUP_TIME_MS, extended: false, warning: false });
  assert.deepEqual(advanceHandPickupTimer(5100, 100, true), { remainingMs: 5000, extended: false, warning: false });
  for (const seconds of [4, 3, 2, 1]) {
    assert.deepEqual(advanceHandPickupTimer(seconds * 1000 + 100, 100, true), { remainingMs: seconds * 1000, extended: false, warning: true });
    assert.equal(advanceHandPickupTimer(seconds * 1000, 100, true).warning, false);
  }
  assert.equal(advanceHandPickupTimer(5000, -100, true).remainingMs, 5000);
});

test('soft timeout repeatedly grants a fresh bonus instead of ending the round', () => {
  for (const elapsed of [500, 1000, 60000]) {
    assert.deepEqual(advanceHandPickupTimer(500, elapsed, true), { remainingMs: HAND_PICKUP_BONUS_MS, extended: true, warning: false });
  }
  assert.equal(advanceHandPickupTimer(HAND_PICKUP_BONUS_MS, HAND_PICKUP_BONUS_MS, true).extended, true);
});

test('five unique camera items include both categories even at random extremes', () => {
  for (const random of [() => 0, () => 0.999, Math.random]) {
    for (let iteration = 0; iteration < 30; iteration++) {
      const rounds = createHandPickupRounds(random);
      assert.equal(rounds.length, 5);
      assert.equal(new Set(rounds.map(item => item.id)).size, 5);
      assert.equal(new Set(rounds.map(item => item.category)).size, 2);
      assert(rounds.every(item => item.image.includes(item.id)));
    }
  }
});

test('custom counts preserve unique items and both categories up to the whole catalogue', () => {
  for (const count of [2, 3, 7, 70, 140, HAND_PICKUP_MAX_COUNT]) {
    for (const random of [() => 0, () => 0.999, Math.random]) {
      const rounds = createHandPickupRounds(random, count);
      assert.equal(rounds.length, count);
      assert.equal(new Set(rounds.map(item => item.id)).size, count);
      assert.equal(new Set(rounds.map(item => item.category)).size, 2);
    }
  }
  for (const count of [0, 1, -2, 2.5, NaN, Infinity, HAND_PICKUP_MAX_COUNT + 1]) {
    assert(!isValidHandPickupCount(count));
    assert.throws(() => createHandPickupRounds(Math.random, count));
  }
});

test('hand rounds balance category pairs without long same-category streaks', () => {
  for (const count of [2, 3, 5, 20, 70, HAND_PICKUP_MAX_COUNT]) {
    for (const random of [() => 0, () => 0.999, Math.random]) {
      const rounds = createHandPickupRounds(random, count);
      const organicCount = rounds.filter(item => item.category === 'organic').length;
      const organicCapacity = HEAD_TILT_TRASH_ITEMS.filter(item => item.category === 'organic').length;
      if (count <= organicCapacity * 2) {
        assert(Math.abs(organicCount - (count - organicCount)) <= 1);
      } else {
        assert.equal(organicCount, organicCapacity);
      }
      for (let index = 2; index < rounds.length; index++) {
        assert(!(rounds[index].category === rounds[index - 1].category &&
          rounds[index].category === rounds[index - 2].category));
      }
    }
  }
});

test('random origins leave room around the trash and keep it clear of both bins', () => {
  const positions = new Set<string>();
  for (const random of [() => 0, () => 0.999, Math.random]) {
    for (let sample = 0; sample < 100; sample++) {
      const origin = createHandPickupPosition(random);
      positions.add(JSON.stringify(origin));
      assert(origin.x >= 0.16 && origin.x <= 0.84);
      assert(origin.y >= 0.3 && origin.y <= 0.43);
      assert.equal(getHandDropCategory(origin), null);
      for (const zone of Object.values(HAND_DROP_ZONES)) assert(origin.y + 0.12 < zone.y - 0.04);
    }
  }
  assert(positions.size > 2);
});

test('pickup follows the randomized origin rather than the old center', () => {
  const origin = { x: 0.17, y: 0.3 };
  const ready = { holding: false, gesture: 'open' as const, result: null };
  assert(canPickUp(origin, origin));
  assert(!canPickUp(PICKUP_ORIGIN, origin));
  assert(stepHandPickup(ready, origin, 'closed', 'organic', origin).holding);
  assert(!stepHandPickup(ready, PICKUP_ORIGIN, 'closed', 'organic', origin).holding);
});

test('mirrored hand mapping clamps and smooths without cropping the video frame', () => {
  assert.deepEqual(mapHandPoint({ x: 0.2, y: 0.3 }), { x: 0.8, y: 0.3 });
  assert.deepEqual(mapHandPoint({ x: -1, y: 2 }), { x: 1, y: 1 });
  const smoothed = mapHandPoint({ x: 0, y: 1 }, { x: 0, y: 0 });
  assert.deepEqual(smoothed, { x: 0.45, y: 0.45 });
  assert(canPickUp(PICKUP_ORIGIN));
  assert(!canPickUp({ x: 0, y: 0 }));
});

test('hand motion advances between detections without overshoot or frame-rate dependence', () => {
  const start = { x: 0.1, y: 0.9 };
  const target = { x: 0.9, y: 0.1 };
  assert.deepEqual(smoothHandPoint(target, null, 16), target);
  assert.deepEqual(smoothHandPoint(target, start, 0), start);
  assert.deepEqual(smoothHandPoint(target, start, -1), start);
  const first = smoothHandPoint(target, start, 1000 / 60);
  const second = smoothHandPoint(target, first, 1000 / 60);
  assert(first.x > start.x && second.x > first.x && second.x < target.x);
  assert(first.y < start.y && second.y < first.y && second.y > target.y);
  const single = smoothHandPoint(target, start, 1000 / 30);
  assert(Math.abs(second.x - single.x) < 1e-12);
  assert(Math.abs(second.y - single.y) < 1e-12);
  const settled = smoothHandPoint(target, start, 200);
  assert(Math.hypot(settled.x - target.x, settled.y - target.y) < 0.02);
});

test('drop buffers help near the rim without overlapping the two bins', () => {
  assert.equal(getHandDropCategory({ x: 0.25, y: 0.61 }), 'organic');
  assert.equal(getHandDropCategory({ x: 0.75, y: 0.8 }), 'recyclable');
  assert.equal(getHandDropCategory({ x: 0.5, y: 0.8 }), null);
  assert.equal(getHandDropCategory(PICKUP_ORIGIN), null);
});

test('pickup requires an open-to-closed edge near the item; release evaluates only once', () => {
  let state = stepHandPickup({ holding: false, gesture: null, result: null }, PICKUP_ORIGIN, 'closed', 'organic');
  assert(!state.holding);
  state = stepHandPickup(state, PICKUP_ORIGIN, 'open', 'organic');
  state = stepHandPickup(state, PICKUP_ORIGIN, 'closed', 'organic');
  assert(state.holding);
  state = stepHandPickup(state, { x: 0.25, y: 0.8 }, 'closed', 'organic');
  assert(state.holding);
  state = stepHandPickup(state, { x: 0.25, y: 0.8 }, 'open', 'organic');
  assert.equal(state.result, 'correct');
  assert(!state.holding);
  assert.equal(stepHandPickup(state, { x: 0.25, y: 0.8 }, 'open', 'organic').result, null);
});

test('wrong bin and missed drop return the item for retry, without completing it', () => {
  const holding = { holding: true, gesture: 'closed' as const, result: null };
  assert.deepEqual(stepHandPickup(holding, { x: 0.75, y: 0.8 }, 'open', 'organic'), { holding: false, gesture: 'open', result: 'wrong' });
  assert.equal(stepHandPickup(holding, PICKUP_ORIGIN, 'open', 'organic').result, 'miss');
  assert(!stepHandPickup({ holding: false, gesture: 'open', result: null }, { x: 0, y: 0 }, 'closed', 'organic').holding);
});

test('gesture detector debounces transitions, holds through hysteresis band, and resets on loss', () => {
  const detector = new HandGestureDetector();
  assert.equal(detector.update(2, 0), null);
  assert.equal(detector.update(2, 150), 'open');
  assert.equal(detector.update(1, 200), 'open');
  assert.equal(detector.update(1.5, 300), 'open');
  assert.equal(detector.update(1, 350), 'open');
  assert.equal(detector.update(1, 500), 'closed');
  assert.equal(detector.update(1.5, 550), 'closed');
  detector.reset();
  assert.equal(detector.update(2, 600), null);
  assert.equal(detector.update(2, 750), 'open');
  assert.equal(detector.update(NaN, 800), null);
});

test('openness distinguishes extended and curled fingers and rejects invalid palms', () => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7 }));
  landmarks[0] = { x: 0.5, y: 0.9 };
  assert.equal(getHandOpenness([]), null);
  assert.equal(getHandOpenness(landmarks, 0), null);
  for (const tip of [8, 12, 16, 20]) landmarks[tip] = { x: 0.5, y: 0.4 };
  assert(getHandOpenness(landmarks)! > 1.65);
  for (const tip of [8, 12, 16, 20]) landmarks[tip] = { x: 0.5, y: 0.75 };
  assert(getHandOpenness(landmarks)! < 1.25);
  landmarks[9] = landmarks[0];
  assert.equal(getHandOpenness(landmarks), null);
});