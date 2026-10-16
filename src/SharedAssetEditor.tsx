import React, { useEffect, useState } from 'react';
import { ASSET_SLOTS, listSharedAssets, sharedAssetUrl, sharedAssetsConfigured, SharedAsset, uploadSharedAsset } from './utils/sharedAssets';

export default function SharedAssetEditor() {
  const [slotId, setSlotId] = useState(ASSET_SLOTS[0].id);
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const slot = ASSET_SLOTS.find(s => s.id === slotId)!;
  const current = assets.find(a => a.id === slotId);

  useEffect(() => {
    if (sharedAssetsConfigured) {
      listSharedAssets().then(setAssets).catch(err => {
        console.error('Lỗi tải tài nguyên chung:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải tài nguyên chung.');
      });
    }
  }, []);

  const upload = async (files: File[], batch: boolean) => {
    setBusy(true);
    setError('');
    setMessage('');
    let uploaded = 0;
    try {
      const jobs = files.map(file => {
        if (!batch) return { id: slotId, file };
        const name = file.name.replace(/\.[^.]+$/, '');
        const matches = ASSET_SLOTS.filter(s => s.id === `images/costumes/${name}` ||
          s.id === `images/trash/${name}` || s.id === `voice/${name}` ||
          (name === 'thung_rac_xanh' && s.id === 'images/bins/organic') ||
          (name === 'thung_rac_cam' && s.id === 'images/bins/recyclable') ||
          (name === 'kien-sang-main' && s.id === 'images/mascot/main'));
        if (matches.length !== 1) throw new Error(`Không nhận diện được ID từ tên file: ${file.name}`);
        return { id: matches[0].id, file };
      });
      for (const job of jobs) {
        setMessage(`Đang tải ${uploaded + 1}/${jobs.length}: ${job.file.name}`);
        await uploadSharedAsset(job.id, job.file);
        uploaded++;
      }
      setAssets(await listSharedAssets());
      setMessage(`Đã xuất bản ${uploaded} file. Hãy tải lại trang chơi (F5) để nhận thay đổi.`);
    } catch (err) {
      console.error('Lỗi xuất bản tài nguyên:', err);
      setMessage(`Đã xuất bản ${uploaded} file trước khi dừng.`);
      setError(err instanceof Error ? err.message : 'Không thể tải file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-5 bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-black">Tài nguyên dùng chung — Kiến Sáng</h1>
        <a href="./index.html" className="text-blue-700 underline">Mở trang chơi</a>
        <p className="text-sm text-amber-900">
          Không đăng nhập. Bất kỳ ai có cấu hình website đều có thể thay tài nguyên.
          Không tải ảnh, giọng nói riêng tư hoặc nội dung không được phép chia sẻ công khai.
        </p>
        {!sharedAssetsConfigured && <p role="alert">Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY. Xem README.</p>}
        <label className="block font-bold">
          Chọn vị trí ảnh / âm thanh
          <select value={slotId} disabled={busy} onChange={e => setSlotId(e.target.value)}
            className="block w-full border rounded p-2 mt-2">
            {ASSET_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <p className="text-sm">ID: <code>{slotId}</code> — {assets.length} tài nguyên đã xuất bản.</p>
        {current && (slot.kind === 'image'
          ? <img src={sharedAssetUrl(current)} alt={slot.label} className="h-48 object-contain" />
          : <audio src={sharedAssetUrl(current)} controls />)}
        <label className="block">
          Tải một file vào vị trí đang chọn (tối đa 5 MB)
          <input type="file" aria-label="Tải một tài nguyên"
            accept={slot.kind === 'image' ? 'image/png,image/jpeg,image/webp' : '.mp3,.wav,.webm,.ogg,.m4a'}
            disabled={busy || !sharedAssetsConfigured} className="block mt-2"
            onChange={e => {
              const files = Array.from(e.target.files || []);
              e.target.value = '';
              if (files.length) void upload(files, false);
            }} />
        </label>
        <label className="block">
          Tải nhiều file theo tên ID (tim_rac_01.png, cam_banh_mi_01.png, correct.mp3...)
          <input type="file" multiple aria-label="Tải nhiều tài nguyên"
            accept=".png,.jpg,.jpeg,.webp,.mp3,.wav,.webm,.ogg,.m4a"
            disabled={busy || !sharedAssetsConfigured} className="block mt-2"
            onChange={e => {
              const files = Array.from(e.target.files || []);
              e.target.value = '';
              if (files.length) void upload(files, true);
            }} />
        </label>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
      </div>
    </main>
  );
}
