import { PreloadedOfflineState } from '../types';
import { VOICE_PROMPTS } from '../data/voicePrompts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseSettingsFile(text: string): PreloadedOfflineState {
  const file: unknown = JSON.parse(text);
  if (!isRecord(file) || file.format !== 'kien-sang-settings' || file.version !== 1 ||
      !isRecord(file.settings)) {
    throw new Error('Không đúng định dạng tệp tùy chỉnh Kiến Sáng (phiên bản 1).');
  }
  const state = file.settings;
  const media = (value: unknown, type: 'image' | 'audio'): string | null => {
    if (value === null) return null;
    if (typeof value !== 'string' ||
        !new RegExp(`^data:${type}/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}$`).test(value)) {
      throw new Error(`Tệp tùy chỉnh chứa dữ liệu ${type} không hợp lệ.`);
    }
    return value;
  };
  const images = (value: unknown, nullable: boolean) => {
    if (!isRecord(value)) throw new Error('Danh sách ảnh không hợp lệ.');
    return Object.fromEntries(Object.entries(value).map(([id, image]) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error(`ID ảnh không hợp lệ: ${id}`);
      const result = media(image, 'image');
      if (!nullable && !result) throw new Error(`Thiếu ảnh: ${id}`);
      return [id, result];
    }));
  };
  const scale = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error('Kích thước nhân vật hoặc thùng rác không hợp lệ.');
    }
    return value;
  };
  if (!isRecord(state.voiceClips)) throw new Error('Dữ liệu giọng thu âm không hợp lệ.');
  const trash = images(state.customTrashImages, false);
  const customTrashImages: Record<string, string> = {};
  for (const [id, image] of Object.entries(trash)) {
    if (typeof image === 'string') customTrashImages[id] = image;
  }
  return {
    customCostumes: images(state.customCostumes, true),
    customTrashImages,
    customMascotUrl: media(state.customMascotUrl, 'image'),
    customOrganicUrl: media(state.customOrganicUrl, 'image'),
    customRecyclableUrl: media(state.customRecyclableUrl, 'image'),
    mascotScale: scale(state.mascotScale),
    binScale: scale(state.binScale),
    voiceClips: {
      ...Object.fromEntries(Object.entries(state.voiceClips).map(([id, clip]) => {
        if (!VOICE_PROMPTS.some(p => p.id === id)) throw new Error(`ID giọng nói không hợp lệ: ${id}`);
        return [id, media(clip, 'audio')];
      })),
      correct: media(state.voiceClips.correct, 'audio'),
      incorrect: media(state.voiceClips.incorrect, 'audio'),
      victory: media(state.voiceClips.victory, 'audio'),
    },
  };
}
