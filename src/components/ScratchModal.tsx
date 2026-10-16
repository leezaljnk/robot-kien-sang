import React, { useState } from 'react';
import { Download, ExternalLink, Check, FileCode, Sparkles, X } from 'lucide-react';
import { exportScratchProject } from '../utils/scratchExporter';

import { VoiceClips, CustomCostumesMap } from '../types';

interface ScratchModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceClips?: VoiceClips;
  customMascotUrl?: string | null;
  customOrganicUrl?: string | null;
  customRecyclableUrl?: string | null;
  customCostumes?: CustomCostumesMap;
  customTrashImages?: Record<string, string>;
  mascotScale?: number;
}

export const ScratchModal: React.FC<ScratchModalProps> = ({
  isOpen,
  onClose,
  voiceClips,
  customMascotUrl,
  customOrganicUrl,
  customRecyclableUrl,
  customCostumes,
  customTrashImages,
  mascotScale,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSb3 = async () => {
    try {
      setIsExporting(true);
      const blob = await exportScratchProject(
        voiceClips,
        customMascotUrl,
        customOrganicUrl,
        customRecyclableUrl,
        customCostumes,
        customTrashImages,
        mascotScale
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Robot_Kien_Sang_Phan_Loai_Rac.sb3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch {
      alert('Có lỗi xảy ra khi tạo tệp Scratch. Bạn thử lại nhé!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🐱</span>
            <div>
              <h3 className="text-xl font-black text-slate-950">
                Xuất Game Ra Tệp Scratch (.sb3)
              </h3>
              <p className="text-xs text-amber-950 font-bold">
                Tương thích 100% với Scratch 3.0 Web và Scratch Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-slate-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Card nổi bật tải về */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">
                  Robot_Kien_Sang_Phan_Loai_Rac.sb3
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Đầy đủ 21 Sprite (Robot Kiến Sáng, 2 Thùng rác, Nút chế độ, 15 Món rác chia 5 đợt xoay vòng, Ngôi sao điểm), tương thích 100% với Scratch 3.0 Web và Desktop!
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSb3}
              disabled={isExporting}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm shadow-xl transition active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Đang đóng gói .sb3...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Đã tải xong!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Tải tệp .sb3 đầy đủ
                </>
              )}
            </button>
          </div>

          {/* Hướng dẫn 4 bước trực quan */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <span>📖</span> Hướng Dẫn Mở Tệp Trong Scratch Web (4 Bước):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs">
                    1
                  </span>
                  <span className="font-extrabold text-slate-800">Tải tệp .sb3</span>
                </div>
                <p className="text-slate-600 pl-8">
                  Nhấn nút màu cam ở trên để tải file về máy tính.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="font-extrabold text-slate-800">Mở Scratch Web</span>
                </div>
                <p className="text-slate-600 pl-8">
                  Truy cập trang chỉnh sửa{' '}
                  <a
                    href="https://scratch.mit.edu/projects/editor"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 underline font-bold inline-flex items-center gap-0.5"
                  >
                    scratch.mit.edu <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs">
                    3
                  </span>
                  <span className="font-extrabold text-slate-800">Tải từ máy tính lên</span>
                </div>
                <p className="text-slate-600 pl-8">
                  Vào thanh menu trên cùng: Chọn <strong>Tập tin (File)</strong> ➡️ Chọn{' '}
                  <strong>Tải từ máy tính lên (Load from your computer)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs">
                    4
                  </span>
                  <span className="font-extrabold text-slate-800">Bấm Cờ Xanh Chơi Ngay!</span>
                </div>
                <p className="text-slate-600 pl-8">
                  Nhấn Cờ Xanh (Green Flag): Trò chơi sẽ chạy y hệt bản demo với đầy đủ âm thanh, 2 chế độ và đợt rác!
                </p>
              </div>
            </div>
          </div>

          {/* Điểm đặc sắc trong dự án Scratch */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <p className="font-black mb-1">✨ Điểm cộng đặc sắc trong tệp Scratch .sb3:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong>Chu kỳ bước đi 10 bước (k-1 đến k-10)</strong>: Trang phục bước đi thay đổi lặp lại mượt mà (nhịp 0.08s) chỉ khi bấm giữ phím điều khiển mũi tên.</li>
              <li><strong>2 Chế độ chơi đầy đủ</strong>: Có nút chuyển đổi trực tiếp trên sân khấu giữa "Bé tự kéo thả" và "Nhờ Kiến Sáng".</li>
              <li><strong>Xuất hiện theo đợt rác</strong>: Mỗi lần xuất hiện các món rác ngẫu nhiên, nhặt hết đợt sẽ tự động ra đợt mới.</li>
              <li><strong>Âm thanh sinh động</strong>: Tích hợp sẵn hiệu ứng âm thanh tiếng chuông đúng (ding), boing sai, và khúc ca chiến thắng 10 sao.</li>
              <li><strong>Tùy biến nhân vật &amp; thùng rác</strong>: Tự động nhúng toàn bộ ảnh tải lên vào file .sb3 xuất ra.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://scratch.mit.edu/projects/editor"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-orange-600 font-bold hover:underline"
          >
            Mở Scratch Web Trực Tiếp <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition text-sm"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
