import { PreloadedOfflineState } from '../types';

export async function embedOfflineAssets(
  state: PreloadedOfflineState
): Promise<PreloadedOfflineState> {
  const embedded = new Map<string, Promise<string>>();
  const embed = (url: string | null | undefined): Promise<string | null> => {
    if (!url) return Promise.resolve(null);
    if (url.startsWith('data:')) return Promise.resolve(url);
    let pending = embedded.get(url);
    if (!pending) {
      pending = (async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Không thể đóng gói tài nguyên offline: ${url} (${response.status})`);
        }
        const blob = await response.blob();
        if (!/^(image|audio)\//.test(blob.type)) {
          throw new Error(`Tài nguyên offline không phải ảnh hoặc âm thanh: ${url}`);
        }
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error(`Không thể đọc tài nguyên: ${url}`));
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      })();
      embedded.set(url, pending);
    }
    return pending;
  };

  const customCostumes = Object.fromEntries(await Promise.all(
    Object.entries(state.customCostumes || {}).map(async ([id, url]) => [id, await embed(url)])
  ));
  const customTrashImages = Object.fromEntries(await Promise.all(
    Object.entries(state.customTrashImages || {}).map(async ([id, url]) => {
      const image = await embed(url);
      if (!image) throw new Error(`Ảnh rác không hợp lệ: ${id}`);
      return [id, image];
    })
  ));
  return {
    ...state,
    customCostumes,
    customTrashImages,
    customMascotUrl: await embed(state.customMascotUrl),
    customOrganicUrl: await embed(state.customOrganicUrl),
    customRecyclableUrl: await embed(state.customRecyclableUrl),
    voiceClips: {
      ...Object.fromEntries(await Promise.all(
        Object.entries(state.voiceClips || {}).map(async ([id, url]) => [id, await embed(url)])
      )),
      correct: await embed(state.voiceClips?.correct),
      incorrect: await embed(state.voiceClips?.incorrect),
      victory: await embed(state.voiceClips?.victory),
    },
  };
}
