import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Star, Globe } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  onOpenScratchModal: () => void;
  onOpenOfflineHtmlModal?: () => void;
  customMascotUrl?: string | null;
  maxScore?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onPlayAgain,
  onOpenScratchModal,
  onOpenOfflineHtmlModal,
  customMascotUrl,
  maxScore = 10,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive fireworks
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ef4844'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mascotSrc = customMascotUrl || './images/kien-sang-main.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-yellow-400 p-6 sm:p-8 text-center space-y-5 overflow-hidden">
        {/* Hào quang nền */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

        {/* Bạn Kiến Sáng ăn mừng chiến thắng chuẩn hình kien-sang-main.png */}
        <div className="flex items-center justify-center gap-3">
          <img
            src={mascotSrc}
            alt="Bạn Kiến Sáng (kien-sang-main.png)"
            draggable={false}
            className="w-24 h-32 object-contain animate-bounce drop-shadow-xl select-none"
          />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-xl border-4 border-yellow-200">
            <Trophy className="w-10 h-10 text-yellow-900" />
          </div>
        </div>

        {/* Điểm sao */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            Đạt Hoàn Hảo {maxScore}/{maxScore} Sao
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            CHIẾN THẮNG XUẤT SẮC!
          </h2>

          <div className="mt-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
            <p className="text-base sm:text-lg font-black text-emerald-800">
              "Yeah, {maxScore} sao rồi, lớp mình sạch quá!" 🌟
            </p>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Bạn Kiến Sáng và cả lớp 1A xin gửi lời cảm ơn tới bạn nhỏ vì đã giữ gìn vệ sinh lớp học thật tuyệt vời!
            </p>
          </div>
        </div>

        {/* Hành động */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg transition active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại Màn Mới
          </button>

          {onOpenOfflineHtmlModal && (
            <button
              onClick={onOpenOfflineHtmlModal}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-lg transition active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-200" />
              Xuất HTML Offline
            </button>
          )}

          <button
            onClick={onOpenScratchModal}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg transition active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            Tải File Scratch (.sb3)
          </button>
        </div>
      </div>
    </div>
  );
};
