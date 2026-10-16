import React, { useState, useMemo } from 'react';
import {
  Download,
  Check,
  Globe,
  WifiOff,
  Sparkles,
  X,
  HardDrive,
  Laptop,
  Layers,
  Shirt,
  Trash2,
  Mic,
} from 'lucide-react';
import { CustomCostumesMap, VoiceClips, PreloadedOfflineState } from '../types';
import { getPersistentItem } from '../utils/persistentStorage';
import { embedOfflineAssets } from '../utils/offlineAssets';
import { SettingsTransfer } from './SettingsTransfer';

interface OfflineHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCostumes?: CustomCostumesMap;
  customMascotUrl?: string | null;
  mascotScale?: number;
  customOrganicUrl?: string | null;
  customRecyclableUrl?: string | null;
  binScale?: number;
  customTrashImages?: Record<string, string>;
  voiceClips?: VoiceClips;
  onImportSettings: (settings: PreloadedOfflineState) => Promise<void>;
}

export const OfflineHtmlModal: React.FC<OfflineHtmlModalProps> = ({
  isOpen,
  onClose,
  customCostumes = {},
  customMascotUrl = null,
  mascotScale = 1.0,
  customOrganicUrl = null,
  customRecyclableUrl = null,
  binScale = 0.85,
  customTrashImages = {},
  voiceClips = { correct: null, incorrect: null, victory: null },
  onImportSettings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const customCostumeCount = useMemo(
    () => Object.keys(customCostumes || {}).filter((k) => !!customCostumes[k]).length,
    [customCostumes]
  );

  const customTrashCount = useMemo(
    () => Object.keys(customTrashImages || {}).filter((k) => !!customTrashImages[k]).length,
    [customTrashImages]
  );

  const hasCustomBins = Boolean(customOrganicUrl || customRecyclableUrl);
  const hasCustomVoice = Boolean(voiceClips?.correct || voiceClips?.incorrect || voiceClips?.victory);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setErrorMsg(null);
      setDownloadSuccess(false);

      // 1. Tải bản khung HTML Offline từ server hoặc thư mục public
      let response = await fetch('./api/download-offline-html');
      if (!response.ok) {
        response = await fetch('./Robot_Kien_Sang_Offline.html');
      }

      if (!response.ok) {
        throw new Error('Không thể tải tệp HTML offline.');
      }

      let htmlText = await response.text();

      // 2. Thu thập đầy đủ trang phục, hình ảnh rác, thùng rác & giọng thu âm từ bản Preview hiện tại
      const [
        savedVoice,
        savedMascot,
        savedScale,
        savedCostumes,
        savedOrganic,
        savedRecyclable,
        savedBinScale,
        savedTrashImages,
      ] = await Promise.all([
        getPersistentItem<VoiceClips | null>('kien_sang_voice_clips_v1', null),
        getPersistentItem<string | null>('kien_sang_custom_mascot_v1', null),
        getPersistentItem<number | null>('kien_sang_mascot_scale_v1', null),
        getPersistentItem<CustomCostumesMap | null>('kien_sang_costumes_v1', null),
        getPersistentItem<string | null>('kien_sang_bin_organic_v1', null),
        getPersistentItem<string | null>('kien_sang_bin_recyclable_v1', null),
        getPersistentItem<number | null>('kien_sang_bin_scale_v1', null),
        getPersistentItem<Record<string, string> | null>('kien_sang_trash_images_v1', null),
      ]);

      const mergedCostumes: CustomCostumesMap = {
        ...(window.__KIEN_SANG_PRELOADED_STATE__?.customCostumes || {}),
        ...(savedCostumes || {}),
        ...(customCostumes || {}),
      };

      const mergedTrashImages: Record<string, string> = {
        ...(window.__KIEN_SANG_PRELOADED_STATE__?.customTrashImages || {}),
        ...(savedTrashImages || {}),
        ...(customTrashImages || {}),
      };

      const finalMascotUrl =
        customMascotUrl ||
        savedMascot ||
        mergedCostumes['tim_rac_01'] ||
        mergedCostumes['k-v-2'] ||
        mergedCostumes['vui_01'] ||
        Object.values(mergedCostumes).find(Boolean) ||
        window.__KIEN_SANG_PRELOADED_STATE__?.customMascotUrl ||
        null;

      const finalPayload: PreloadedOfflineState = {
        customCostumes: mergedCostumes,
        customMascotUrl: finalMascotUrl,
        mascotScale:
          typeof mascotScale === 'number'
            ? mascotScale
            : typeof savedScale === 'number'
            ? savedScale
            : 1.0,
        customOrganicUrl:
          customOrganicUrl ||
          savedOrganic ||
          window.__KIEN_SANG_PRELOADED_STATE__?.customOrganicUrl ||
          null,
        customRecyclableUrl:
          customRecyclableUrl ||
          savedRecyclable ||
          window.__KIEN_SANG_PRELOADED_STATE__?.customRecyclableUrl ||
          null,
        binScale:
          typeof binScale === 'number'
            ? binScale
            : typeof savedBinScale === 'number'
            ? savedBinScale
            : 0.85,
        customTrashImages: mergedTrashImages,
        voiceClips: {
          correct: voiceClips?.correct || savedVoice?.correct || null,
          incorrect: voiceClips?.incorrect || savedVoice?.incorrect || null,
          victory: voiceClips?.victory || savedVoice?.victory || null,
        },
      };

      // 3. Nhúng trực tiếp toàn bộ dữ liệu trang phục & tùy chỉnh của bản Preview vào trong file HTML Offline
      const embeddedPayload = await embedOfflineAssets(finalPayload);
      const safeJson = JSON.stringify(embeddedPayload).replace(/</g, '\\u003c');
      const injectionScript = `\n    <script id="kien-sang-live-preview-state">\n      window.__KIEN_SANG_PRELOADED_STATE__ = Object.assign({}, window.__KIEN_SANG_PRELOADED_STATE__ || {}, ${safeJson});\n      if (window.__KIEN_SANG_PRELOADED_STATE__.customCostumes && (${safeJson}).customCostumes) {\n        window.__KIEN_SANG_PRELOADED_STATE__.customCostumes = Object.assign({}, window.__KIEN_SANG_PRELOADED_STATE__.customCostumes, (${safeJson}).customCostumes);\n      }\n      if (window.__KIEN_SANG_PRELOADED_STATE__.customTrashImages && (${safeJson}).customTrashImages) {\n        window.__KIEN_SANG_PRELOADED_STATE__.customTrashImages = Object.assign({}, window.__KIEN_SANG_PRELOADED_STATE__.customTrashImages, (${safeJson}).customTrashImages);\n      }\n    </script>\n`;

      if (htmlText.includes('</head>')) {
        htmlText = htmlText.replace('</head>', `${injectionScript}</head>`);
      } else {
        htmlText = injectionScript + htmlText;
      }

      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Robot_Kien_Sang_Offline.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err: unknown) {
      console.error('Lỗi tải file offline HTML:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể đóng gói file HTML offline.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-blue-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🌐
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Xuất Game Ra Tệp HTML (Chơi Offline)
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                1 file .html duy nhất — Giữ nguyên 100% trang phục &amp; hình ảnh như bản Preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung modal */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <SettingsTransfer
            settings={{ customCostumes, customMascotUrl, mascotScale, customOrganicUrl,
              customRecyclableUrl, binScale, customTrashImages, voiceClips }}
            onImport={onImportSettings}
          />
          {/* Card tải về nổi bật */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 border-2 border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Globe className="w-7 h-7 text-cyan-200" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-1.5 flex-wrap">
                  <span>Robot_Kien_Sang_Offline.html</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                    Đồng bộ 100% Preview
                  </span>
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Tự động nhúng trọn vẹn toàn bộ trang phục nhân vật đã thay, ảnh 16 món rác, 2 thùng rác &amp; âm thanh của bạn vào 1 tệp HTML duy nhất!
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl transition active:scale-95 cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-200'
              }`}
            >
              {isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Đang đóng gói...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Đã tải thành công!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-200" />
                  <span>Tải Tệp HTML Offline</span>
                </>
              )}
            </button>
          </div>

          {/* Trạng thái dữ liệu từ bản Preview sẽ được đóng gói kèm */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Dữ liệu từ bản Preview được đóng gói vào file HTML:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-bold text-[11px]">
                <Shirt className="w-3.5 h-3.5 text-orange-500" />
                {customCostumeCount > 0
                  ? `${customCostumeCount} trang phục tùy chỉnh`
                  : 'Trang phục mặc định'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-bold text-[11px]">
                <Trash2 className="w-3.5 h-3.5 text-teal-600" />
                {customTrashCount > 0 ? `${customTrashCount} ảnh rác` : '15 mẫu rác'}
                {hasCustomBins ? ' + 2 thùng rác' : ''}
              </span>
              {hasCustomVoice && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-rose-700 font-bold text-[11px]">
                  <Mic className="w-3.5 h-3.5 text-rose-500" />
                  Có giọng thu âm
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Ưu điểm nổi bật khi chơi file HTML offline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs">
                <WifiOff className="w-4 h-4 text-indigo-600" />
                <span>Hoàn Toàn Không Cần Mạng</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mở chơi mượt mà khi phòng tin học mất mạng, khi đem USB đi giảng dạy hoặc chiếu lên tivi.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Không Cần Cài Đặt</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nhấp đúp chuột là mở bằng Chrome, Edge, Cốc Cốc, Safari hoặc Firefox trên Windows, Mac, Chromebook.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-teal-700 font-extrabold text-xs">
                <HardDrive className="w-4 h-4 text-teal-600" />
                <span>Tự Lưu Tiến Trình</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Điểm số, các trang phục và giọng nói tự ghi âm vẫn lưu lại trong trình duyệt trên máy của bạn.
              </p>
            </div>
          </div>

          {/* Hướng dẫn 3 bước đơn giản */}
          <div className="space-y-2.5">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <span>📖</span> Hướng Dẫn Sử Dụng (3 Bước Đơn Giản):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span className="font-extrabold text-slate-800">Tải tệp .html</span>
                </div>
                <p className="text-slate-600 text-[11px] pl-7">
                  Bấm nút màu xanh ở trên để tải file về thư mục Downloads của máy tính.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span className="font-extrabold text-slate-800">Nhấp đúp chuột</span>
                </div>
                <p className="text-slate-600 text-[11px] pl-7">
                  Nhấp đúp vào tệp <strong>Robot_Kien_Sang_Offline.html</strong> vừa tải về.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span className="font-extrabold text-slate-800">Chơi ngay lập tức!</span>
                </div>
                <p className="text-slate-600 text-[11px] pl-7">
                  Trình duyệt sẽ mở game với đầy đủ 2 chế độ chơi và âm thanh mà không cần mạng Internet!
                </p>
              </div>
            </div>
          </div>

          {/* Tính năng đầy đủ tương tự bản online */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Đặc biệt:</strong> Ngay trong tệp HTML offline này, bạn vẫn có thể nhấn nút{' '}
              <strong>"Tải file Scratch (.sb3)"</strong> để xuất dự án Scratch bất cứ lúc nào, vì thuật toán đóng gói chạy 100% bằng JavaScript trong máy bạn!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Phiên bản đóng gói độc lập Standalone HTML5</span>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition text-sm cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
