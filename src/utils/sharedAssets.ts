import { MASCOT_COSTUMES } from '../data/mascotCostumes';
import { TRASH_ITEMS } from '../data/trashItems';
import { PreloadedOfflineState } from '../types';

const projectUrl = (import.meta.env?.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const publicKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const bucket = 'kien-sang';
export const sharedAssetsConfigured = Boolean(projectUrl && publicKey);
export const sharedAssetsEnabled = sharedAssetsConfigured && typeof location !== 'undefined' &&
  location.protocol.startsWith('http') && !document.querySelector('meta[name="offline-ready"]');

export const ASSET_SLOTS = [
  { id: 'images/mascot/main', label: 'Robot chính', kind: 'image' },
  { id: 'images/bins/organic', label: 'Thùng xanh (hữu cơ)', kind: 'image' },
  { id: 'images/bins/recyclable', label: 'Thùng cam (tái chế)', kind: 'image' },
  ...MASCOT_COSTUMES.map(c => ({ id: `images/costumes/${c.id}`, label: `${c.id} — ${c.nameVi}`, kind: 'image' })),
  ...TRASH_ITEMS.map(t => ({ id: `images/trash/${t.id}`, label: `${t.id} — ${t.nameVi}`, kind: 'image' })),
  { id: 'voice/correct', label: 'Giọng nói: đúng', kind: 'audio' },
  { id: 'voice/incorrect', label: 'Giọng nói: sai', kind: 'audio' },
  { id: 'voice/victory', label: 'Giọng nói: chiến thắng', kind: 'audio' },
];

export interface SharedAsset {
  id: string;
  revision: string;
}

async function request(path: string, init: RequestInit = {}) {
  if (!sharedAssetsConfigured) throw new Error('Chưa cấu hình Supabase trong .env.local.');
  const response = await fetch(`${projectUrl}${path}`, {
    ...init,
    headers: {
      apikey: publicKey,
      ...(publicKey.startsWith('eyJ') ? { Authorization: `Bearer ${publicKey}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  return response;
}

export async function listSharedAssets(): Promise<SharedAsset[]> {
  const response = await request('/rest/v1/game_assets?select=id,revision', { cache: 'no-store' });
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !rows.every(row =>
    typeof row === 'object' && row !== null &&
    typeof row.id === 'string' && typeof row.revision === 'string' &&
    ASSET_SLOTS.some(slot => slot.id === row.id))) {
    throw new Error('Danh sách tài nguyên Supabase không hợp lệ.');
  }
  return rows;
}

export function sharedAssetUrl(asset: SharedAsset) {
  return `${projectUrl}/storage/v1/object/public/${bucket}/${asset.id}?v=${encodeURIComponent(asset.revision)}`;
}

export function sharedAssetsToState(assets: SharedAsset[]): PreloadedOfflineState {
  const state: PreloadedOfflineState = { customCostumes: {}, customTrashImages: {} };
  for (const asset of assets) {
    const url = sharedAssetUrl(asset);
    if (asset.id.startsWith('images/costumes/')) state.customCostumes![asset.id.split('/')[2]] = url;
    else if (asset.id.startsWith('images/trash/')) state.customTrashImages![asset.id.split('/')[2]] = url;
    else if (asset.id === 'images/mascot/main') state.customMascotUrl = url;
    else if (asset.id === 'images/bins/organic') state.customOrganicUrl = url;
    else if (asset.id === 'images/bins/recyclable') state.customRecyclableUrl = url;
    else if (asset.id.startsWith('voice/')) {
      state.voiceClips ||= { correct: null, incorrect: null, victory: null };
      const key = asset.id.slice(6);
      if (key === 'correct' || key === 'incorrect' || key === 'victory') state.voiceClips[key] = url;
    }
  }
  return state;
}

export async function uploadSharedAsset(id: string, file: File) {
  const slot = ASSET_SLOTS.find(s => s.id === id);
  if (!slot) throw new Error(`ID tài nguyên không hợp lệ: ${id}`);
  const mime = file.type === 'audio/mp3' ? 'audio/mpeg' : file.type;
  const images = ['image/png', 'image/jpeg', 'image/webp'];
  const audio = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg', 'audio/mp4'];
  if (!(slot.kind === 'image' ? images : audio).includes(mime)) {
    throw new Error('Chỉ nhận PNG/JPG/WebP hoặc MP3/WAV/WebM/OGG/M4A đúng nhóm đã chọn.');
  }
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('File phải lớn hơn 0 và tối đa 5 MB.');
  await request(`/storage/v1/object/${bucket}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': mime, 'x-upsert': 'true', 'cache-control': '0' },
    body: file,
  });
  await request('/rest/v1/game_assets?on_conflict=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id, revision: crypto.randomUUID() }),
  });
}
