import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { VOICE_PROMPTS, voiceIdForText } from '../src/data/voicePrompts';
import { TRASH_ITEMS } from '../src/data/trashItems';
import { sharedAssetsToState } from '../src/utils/sharedAssets';
import { embedOfflineAssets } from '../src/utils/offlineAssets';
import { parseSettingsFile } from '../src/utils/settingsTransfer';

test('43 unique prompts have exact filenames documented and text matching for playback/replay', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.equal(VOICE_PROMPTS.length, 43);
  assert.equal(new Set(VOICE_PROMPTS.map(p => p.id)).size, 43);
  for (const prompt of VOICE_PROMPTS) {
    assert.equal(voiceIdForText(prompt.text), prompt.id);
    assert(readme.includes(`\`${prompt.id}.mp3\``), prompt.id);
  }
  for (const item of TRASH_ITEMS) {
    assert.equal(voiceIdForText(`Bé đã chọn "${item.nameVi}"! Hãy bấm vào thùng rác muốn bỏ nhé!`), `selected_${item.id}`);
    assert.equal(voiceIdForText(`Kiến Sáng đã nhặt "${item.nameVi}"! Hãy đưa tới thùng rác thích hợp nhé!`), `picked_${item.id}`);
  }
  assert.equal(voiceIdForText('Tuyệt vời quá! Bé giỏi lắm!'), 'correct');
  assert.equal(voiceIdForText('unknown'), undefined);
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  for (const match of app.matchAll(/triggerSpeech\(\s*'([^']+)'/g)) {
    assert(voiceIdForText(match[1]), `Missing recording ID: ${match[1]}`);
  }
});

test('shared voices, offline embedding and JSON roundtrip preserve all prompts and older files', async () => {
  const shared = sharedAssetsToState(VOICE_PROMPTS.map(p => ({ id: `voice/${p.id}`, revision: 'v1' })));
  for (const prompt of VOICE_PROMPTS) assert.match(shared.voiceClips![prompt.id] || '', new RegExp(`voice/${prompt.id}\\?v=v1$`));
  const clips = Object.fromEntries(VOICE_PROMPTS.map(p => [p.id, 'data:audio/mpeg;base64,YQ==']));
  const embedded = await embedOfflineAssets({
    customCostumes: {}, customTrashImages: {}, mascotScale: 1, binScale: 0.85,
    voiceClips: { correct: null, incorrect: null, victory: null, ...clips },
  });
  const parsed = parseSettingsFile(JSON.stringify({ format: 'kien-sang-settings', version: 1, settings: embedded }));
  assert.deepEqual(parsed.voiceClips, clips);
  embedded.voiceClips = { correct: null, incorrect: null, victory: null };
  assert.doesNotThrow(() => parseSettingsFile(JSON.stringify({ format: 'kien-sang-settings', version: 1, settings: embedded })));
});
