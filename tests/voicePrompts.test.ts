import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  VOICE_PIECE_PROMPTS,
  VOICE_PROMPTS,
  VOICE_SEQUENCES,
  voiceIdForText,
} from '../src/data/voicePrompts';
import { TRASH_ITEMS } from '../src/data/trashItems';
import { YARD_TRASH_ITEMS } from '../src/data/yardTrashItems';
import { SORTING_GAME_WASTES } from '../src/data/sortingGame';
import { sharedAssetsToState } from '../src/utils/sharedAssets';
import { embedOfflineAssets } from '../src/utils/offlineAssets';
import { parseSettingsFile } from '../src/utils/settingsTransfer';
import { speakKienSang, speakKienSangSequence, stopKienSangSpeech } from '../src/utils/audio';

test('86 recording IDs and 60 sequence mappings cover the scenes and catalogue', () => {
  const catalog = readFileSync(new URL('../docs/voice-prompts.md', import.meta.url), 'utf8');
  assert.equal(VOICE_PROMPTS.length, 86);
  assert.equal(VOICE_PIECE_PROMPTS.length, 40);
    assert.equal(Object.keys(VOICE_SEQUENCES).length, 60);
    assert.equal(voiceIdForText('Vỏ chai thủy tinh'), 'voice_piece_name_vo_chai');
    assert.equal(voiceIdForText('Chai thủy tinh'), 'voice_piece_sorting_name_vo_chai');
    assert(!catalog.includes('| `selected_vo_dua_hau` |'));
    assert(!catalog.includes('| `sorting_selected_cd` |'));
  assert.equal(new Set(VOICE_PROMPTS.map(p => p.id)).size, VOICE_PROMPTS.length);
  for (const prompt of VOICE_PROMPTS) {
    assert.match(prompt.id, /^[a-z0-9_]+$/);
    assert.equal(voiceIdForText(prompt.text), prompt.id);
    assert(catalog.includes(`| \`${prompt.id}\` | \`${prompt.id}.mp3\` | ${prompt.text} |`), prompt.id);
  }
  for (const item of [...TRASH_ITEMS, ...YARD_TRASH_ITEMS]) {
    const namePieceId = voiceIdForText(item.nameVi);
    assert(namePieceId?.startsWith('voice_piece_name_'));
    assert.deepEqual(VOICE_SEQUENCES[`selected_${item.id}`], [
      'voice_piece_selected_prefix', namePieceId, 'voice_piece_selected_suffix',
    ]);
    assert.deepEqual(VOICE_SEQUENCES[`picked_${item.id}`], [
      'voice_piece_picked_prefix', namePieceId, 'voice_piece_picked_suffix',
    ]);
    assert(!VOICE_PROMPTS.some(prompt => prompt.id === `selected_${item.id}`));
    assert(!VOICE_PROMPTS.some(prompt => prompt.id === `picked_${item.id}`));
  }
  for (const waste of SORTING_GAME_WASTES) {
    const namePieceId = voiceIdForText(waste.name);
    assert(namePieceId?.startsWith('voice_piece_'));
    assert.deepEqual(VOICE_SEQUENCES[`sorting_selected_${waste.id}`], [
      'voice_piece_sorting_prefix', namePieceId, 'voice_piece_sorting_suffix',
    ]);
    assert(!VOICE_PROMPTS.some(prompt => prompt.id === `sorting_selected_${waste.id}`));
  }
  assert.equal(VOICE_SEQUENCES.selected_unknown, undefined);
  assert.equal(voiceIdForText('Bé đã chọn "Vỏ dưa hấu"! Hãy bấm vào thùng rác muốn bỏ nhé!'), undefined);
  assert.equal(voiceIdForText('Tuyệt vời quá! Bé giỏi lắm!'), 'correct_great');
  assert.equal(voiceIdForText('unknown'), undefined);
});

test('every speech/feedback call passes an explicit ID, and literal text matches that ID', () => {
  for (const path of ['App.tsx', 'components/SunlitGardenGame.tsx', 'components/ReuseSortingGame.tsx', 'components/HandPickupGame.tsx']) {
    const source = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
    const calls = [...source.matchAll(/\b(?:triggerSpeech|showFeedback)\(/g)];
    assert(calls.length > 0, path);
    for (const call of calls) {
      const args: string[] = [];
      let start = call.index! + call[0].length;
      let depth = 0;
      let quote = '';
      for (let index = start; index < source.length; index++) {
        const char = source[index];
        if (quote) {
          if (char === '\\') index++;
          else if (char === quote) quote = '';
          continue;
        }
        if (char === "'" || char === '"' || char === '`') {
          quote = char;
        } else if ('([{'.includes(char)) {
          depth++;
        } else if (char === ')' && depth === 0) {
          args.push(source.slice(start, index).trim());
          break;
        } else if (')]}'.includes(char)) {
          depth--;
        } else if (char === ',' && depth === 0) {
          args.push(source.slice(start, index).trim());
          start = index + 1;
        }
      }
      assert.equal(args.filter(Boolean).length, 2, `${path}: ${args.join(', ')}`);
      const text = args[0].match(/^'([^']*)'$/)?.[1];
      const id = args[1].match(/^'([^']*)'$/)?.[1];
      if (text && id) {
        assert.equal(VOICE_PROMPTS.find(prompt => prompt.id === id)?.text, text, `${path}: ${id}`);
      }
    }
    assert(!source.includes('voiceIdForText('), 'Playback must not infer recording IDs from text');
  }
});

test('stopping speech pauses a recording, cancels TTS, and can be repeated', () => {
  const keys = ['window', 'Audio'] as const;
  const descriptors = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  let paused = 0;
  let cancelled = 0;
  Object.assign(globalThis, {
    window: { speechSynthesis: { cancel: () => { cancelled++; } } },
    Audio: class {
      pause() { paused++; }
      play() { return Promise.resolve(); }
    },
  });
  try {
    speakKienSang('Test', 'recording.mp3');
    const initial = cancelled;
    stopKienSangSpeech();
    stopKienSangSpeech();
    assert.equal(paused, 1);
    assert.equal(cancelled, initial + 2);
  } finally {
    keys.forEach((key, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
});

test('sequence playback fills missing clips with TTS in order and stop cancels every segment', async () => {
  const keys = ['window', 'fetch', 'SpeechSynthesisUtterance'] as const;
  const descriptors = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const starts: number[] = [];
  const ranges: Array<[number | undefined, number | undefined]> = [];
  let stopped = 0;
  const spoken: string[] = [];
  const sources: Array<{ onended: (() => void) | null }> = [];
  class FakeUtterance {
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    lang = '';
    rate = 0;
    pitch = 0;
    voice: SpeechSynthesisVoice | null = null;
    constructor(public text: string) {}
  }
  class FakeSource {
    buffer: AudioBuffer | null = null;
    onended: (() => void) | null = null;
    connect() {}
    start(when: number, offset?: number, duration?: number) {
      starts.push(when);
      ranges.push([offset, duration]);
    }
    stop() { stopped++; }
    disconnect() {}
  }
  class FakeAudioContext {
    currentTime = 4;
    state = 'running';
    destination = {};
    resume() { return Promise.resolve(); }
    async decodeAudioData(data: ArrayBuffer) {
      const duration = new Uint8Array(data)[0];
      const length = duration * 1000;
      const samples = new Float32Array(length);
      samples.fill(0.2, 100, length - 100);
      return {
        duration,
        length,
        sampleRate: 1000,
        numberOfChannels: 1,
        getChannelData: () => samples,
        copyFromChannel: (destination: Float32Array) => destination.set(samples),
        copyToChannel: (source: Float32Array, _channel: number, start = 0) => samples.set(source, start),
      } as AudioBuffer;
    }
    createBufferSource() {
      const source = new FakeSource();
      sources.push(source);
      return source as unknown as AudioBufferSourceNode;
    }
  }
  Object.assign(globalThis, {
    SpeechSynthesisUtterance: FakeUtterance,
    window: {
      AudioContext: FakeAudioContext,
      speechSynthesis: {
        cancel() {},
        getVoices: () => [],
        speak: (utterance: FakeUtterance) => {
          spoken.push(utterance.text);
          utterance.onend?.();
        },
      },
    },
    fetch: async (url: string) => {
      const buffer = new ArrayBuffer(1);
      new Uint8Array(buffer)[0] = Number(url);
      return { ok: true, arrayBuffer: async () => buffer };
    },
  });
  try {
    let ended = 0;
    await speakKienSangSequence('Câu ghép', ['1', '2', '3'], () => ended++);
    assert.deepEqual(starts, [4.02, 4.85, 6.68]);
    assert.deepEqual(ranges, [[0.085, 0.83], [0.085, 1.83], [0.085, 2.83]]);
    sources[2].onended?.();
    assert.equal(ended, 1);

    let mixedEnded = 0;
    await speakKienSangSequence(
      'Câu ghép có đoạn đọc',
      ['1', '2', null],
      () => mixedEnded++,
      ['đầu câu', 'giữa câu', 'cuối câu']
    );
    assert.deepEqual(starts.slice(3), [4.02, 4.85]);
    sources[4].onended?.();
    assert.deepEqual(spoken, ['cuối câu']);
    assert.equal(mixedEnded, 1);

    await speakKienSangSequence('Câu sẽ dừng', ['1', '2', '3']);
    stopKienSangSpeech();
    assert.equal(stopped, 3);
  } finally {
    keys.forEach((key, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
});

test('Supabase upload policy allows every catalog ID, including dynamic scene IDs', () => {
  const sql = readFileSync(new URL('../supabase/setup.sql', import.meta.url), 'utf8');
  const patterns = [...sql.matchAll(/asset_id ~ '([^']+)'/g)].map(match => new RegExp(match[1]));
  for (const prompt of VOICE_PROMPTS) {
    const id = `voice/${prompt.id}`;
    assert(sql.includes(`'${id}'`) || patterns.some(pattern => pattern.test(id)), `Upload denied: ${id}`);
  }
});

test('victory scripts follow the actual star goal', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const goal = Number(app.match(/const MAX_SCORE = (\d+);/)?.[1]);
  assert.equal(voiceIdForText(`Yeah, ${goal} sao rồi, lớp mình sạch quá!`), 'victory');
  assert.equal(voiceIdForText(`Yeah, ${goal} sao rồi, sân trường sạch quá!`), 'yard_victory');
});

test('recordings play for all IDs, missing files fall back, and autoplay blocks do not switch voices', async () => {
  const keys = ['window', 'Audio', 'SpeechSynthesisUtterance'] as const;
  const descriptors = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const played: string[] = [];
  const spoken: string[] = [];
  let playbackError: Error | null = null;
  class FakeUtterance {
    lang = '';
    constructor(public text: string) {}
  }
  Object.assign(globalThis, {
    window: {
      speechSynthesis: {
        cancel() {},
        getVoices: () => [],
        speak: (utterance: FakeUtterance) => {
          assert.equal(utterance.lang, 'vi-VN');
          spoken.push(utterance.text);
        },
      },
    },
    Audio: class {
      constructor(private url: string) {}
      pause() {}
      play() {
        if (playbackError) return Promise.reject(playbackError);
        played.push(this.url);
        return Promise.resolve();
      }
    },
    SpeechSynthesisUtterance: FakeUtterance,
  });
  try {
    for (const prompt of VOICE_PROMPTS) {
      const url = `voice/${prompt.id}.mp3`;
      speakKienSang(prompt.text, url);
      assert.equal(played.at(-1), url);
    }
    assert.equal(spoken.length, 0);
    speakKienSang('Không có bản thu', null);
    assert.equal(spoken.at(-1), 'Không có bản thu');
    playbackError = new Error('Recording unavailable');
    speakKienSang('Bản thu bị lỗi', 'voice/missing.mp3');
    await Promise.resolve();
    assert.equal(spoken.at(-1), 'Bản thu bị lỗi');
    playbackError = Object.assign(new Error('Playback not allowed'), { name: 'NotAllowedError' });
    speakKienSang('Bản thu bị trình duyệt chặn', 'voice/blocked.mp3');
    await Promise.resolve();
    assert.equal(spoken.at(-1), 'Bản thu bị lỗi');
  } finally {
    keys.forEach((key, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
});

test('shared voices, offline embedding and JSON roundtrip preserve recordings and discard retired full clips', async () => {
  const shared = sharedAssetsToState(VOICE_PROMPTS.map(p => ({ id: `voice/${p.id}`, revision: 'v1' })));
  for (const prompt of VOICE_PROMPTS) assert.match(shared.voiceClips![prompt.id] || '', new RegExp(`voice/${prompt.id}\\?v=v1$`));
  const clips = Object.fromEntries(VOICE_PROMPTS.map(p => [p.id, 'data:audio/mpeg;base64,YQ==']));
  const embedded = await embedOfflineAssets({
    customCostumes: {}, customTrashImages: {}, mascotScale: 1, binScale: 0.85,
    voiceClips: {
      correct: null, incorrect: null, victory: null, ...clips,
      selected_vo_dua_hau: 'data:audio/mpeg;base64,YQ==',
    },
  });
  const parsed = parseSettingsFile(JSON.stringify({ format: 'kien-sang-settings', version: 1, settings: embedded }));
  assert.deepEqual(parsed.voiceClips, clips);
  embedded.voiceClips = { correct: null, incorrect: null, victory: null };
  assert.doesNotThrow(() => parseSettingsFile(JSON.stringify({ format: 'kien-sang-settings', version: 1, settings: embedded })));
});
