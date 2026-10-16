import React, { useRef, useState } from 'react';
import { PreloadedOfflineState } from '../types';
import { embedOfflineAssets } from '../utils/offlineAssets';
import { parseSettingsFile } from '../utils/settingsTransfer';

export function SettingsTransfer({ settings, onImport }: {
  settings: PreloadedOfflineState;
  onImport: (settings: PreloadedOfflineState) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const perform = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await action();
    } catch (err) {
      console.error('Lỗi chuyển tùy chỉnh:', err);
      setError(err instanceof Error ? err.message : 'Không thể chuyển tùy chỉnh.');
    } finally {
      setBusy(false);
    }
  };

  const exportSettings = () => perform(async () => {
    const embedded = await embedOfflineAssets(settings);
    const text = JSON.stringify({ format: 'kien-sang-settings', version: 1, settings: embedded });
    parseSettingsFile(text);
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Kien_Sang_Tuy_Chinh.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Đã tạo tệp tùy chỉnh. Mang tệp này sang máy hoặc trình duyệt khác để nhập.');
  });

  const importSettings = (file: File) => perform(async () => {
    const parsed = parseSettingsFile(await file.text());
    if (!window.confirm('Thay thế toàn bộ ảnh, giọng thu âm và kích thước hiện tại bằng tệp này?')) return;
    await onImport(parsed);
    setMessage('Đã nhập và lưu tùy chỉnh trong trình duyệt này.');
  });

  return (
    <section className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
      <h4 className="font-black text-slate-900">Mang tùy chỉnh sang trình duyệt / máy khác</h4>
      <p className="text-xs text-slate-700">
        Xuất ảnh, giọng thu âm và kích thước thành tệp JSON. Mở game ở nơi khác rồi nhập tệp.
        Không cần mạng; thao tác này không sửa file HTML hoặc đồng bộ lên server.
      </p>
      <div className="flex gap-3">
        <button disabled={busy} onClick={exportSettings} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">
          Xuất tùy chỉnh
        </button>
        <button disabled={busy} onClick={() => input.current?.click()} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-sm font-bold disabled:opacity-50">
          Nhập tùy chỉnh
        </button>
      </div>
      <input ref={input} type="file" accept=".json,application/json" className="hidden"
        aria-label="Tệp tùy chỉnh Kiến Sáng"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void importSettings(file);
        }} />
      {busy && <p role="status" className="text-xs">Đang xử lý tùy chỉnh...</p>}
      {message && <p role="status" className="text-xs text-emerald-800">{message}</p>}
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    </section>
  );
}
