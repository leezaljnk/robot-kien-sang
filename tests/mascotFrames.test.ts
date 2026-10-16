import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getPrimaryMascotImage, TIM_RAC_IDS } from '../src/data/mascotCostumes';
import { RobotKienSang } from '../src/components/RobotKienSang';
import type { CustomCostumesMap } from '../src/types';

test('base mascot never selects a carrying/emotion frame, including old aliases', () => {
  const costumes = {
    cam_banh_mi_01: 'bread.png',
    vui_01: 'happy.png',
    'k-v-2': 'bread.png',
  };
  assert.equal(getPrimaryMascotImage(costumes, 'bread.png'), null);
  assert.equal(getPrimaryMascotImage(costumes, 'bread.png', 'base.png'), 'base.png');
  assert.equal(getPrimaryMascotImage({ ...costumes, tim_rac_05: 'walk.png' }), 'walk.png');
});

test('all walking steps use walking images when one frame is missing', () => {
  const costumes: CustomCostumesMap = { cam_banh_mi_01: 'bread.png' };
  for (const id of TIM_RAC_IDS.slice(1)) costumes[id] = `${id}.png`;
  for (let step = 0; step < 12; step++) {
    const html = renderToStaticMarkup(React.createElement(RobotKienSang, {
      mood: 'walking', isMoving: true, walkStepTick: step,
      customCostumes: costumes, customMascotUrl: 'bread.png',
    }));
    assert.doesNotMatch(html, /src="bread.png"/);
    assert.match(html, /src="tim_rac_\d{2}.png"/);
  }
});

test('bread carrying images remain available only when actually carrying bread', () => {
  const customCostumes = { cam_banh_mi_01: 'bread.png', 'k-v-2': 'bread.png' };
  const render = (carriedTrashId?: string) => renderToStaticMarkup(
    React.createElement(RobotKienSang, {
      mood: 'walking', isMoving: true, carriedTrashId, customCostumes,
      customMascotUrl: 'bread.png',
    })
  );
  assert.doesNotMatch(render(), /src="bread.png"/);
  assert.match(render(), /<svg/);
  assert.match(render('banh_mi'), /src="bread.png"/);
});
