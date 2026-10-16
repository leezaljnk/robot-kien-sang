import React, { useState, useEffect } from 'react';
import { CustomCostumesMap, KienSangMood, TrashItemDef } from '../types';
import { Volume2, Sparkles, Shirt } from 'lucide-react';
import {
  getCostumeSvg,
  TIM_RAC_IDS,
  getCarryCostumeIdsForTrash,
} from '../data/mascotCostumes';

interface RobotKienSangProps {
  mood: KienSangMood;
  carriedTrashId?: string | null;
  speechText?: string;
  xPercent?: number; // 0 to 100% position across classroom
  yPercent?: number;
  onReplaySpeech?: () => void;
  isMoving?: boolean;
  walkStepTick?: number; // Nhận nhịp bước gõ từ bàn phím / D-Pad
  customMascotUrl?: string | null;
  customCostumes?: CustomCostumesMap;
  mascotScale?: number;
  facingDirection?: 'left' | 'right';
  carriedItemDef?: TrashItemDef | null;
  onOpenMascotModal?: () => void;
}

export const RobotKienSang: React.FC<RobotKienSangProps> = ({
  mood,
  carriedTrashId = null,
  speechText = 'Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé!',
  xPercent = 50,
  yPercent = 75,
  onReplaySpeech,
  isMoving = false,
  walkStepTick = 0,
  customMascotUrl,
  customCostumes = {},
  mascotScale = 1.0,
  facingDirection = 'right',
  carriedItemDef = null,
  onOpenMascotModal,
}) => {
  // Đồng bộ bước đi 12 frame tức thời không có độ trễ state kép
  const [idlePose, setIdlePose] = useState(true);
  const [emotionIndex, setEmotionIndex] = useState(0);

  useEffect(() => {
    if (isMoving) {
      setIdlePose(false);
    } else {
      const timer = setTimeout(() => setIdlePose(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isMoving, walkStepTick]);

  const stepIndex = idlePose && !isMoving ? 0 : Math.abs(walkStepTick) % 12;

  // Timer đổi frame cảm xúc vui mừng (vui_01, vui_02) hoặc buồn (buon_01, buon_02)
  useEffect(() => {
    setEmotionIndex(0);
    if (mood !== 'happy' && mood !== 'victory' && mood !== 'sad') return;

    const timer = setInterval(() => {
      setEmotionIndex((prev) => (prev === 0 ? 1 : 0));
    }, 220);

    return () => clearInterval(timer);
  }, [mood]);

  // XÁC ĐỊNH COSTUME ID ĐANG HIỂN THỊ
  let currentCostumeId = 'tim_rac_01';

  if (mood === 'happy' || mood === 'victory') {
    currentCostumeId = emotionIndex === 0 ? 'vui_01' : 'vui_02';
  } else if (mood === 'sad') {
    currentCostumeId = emotionIndex === 0 ? 'buon_01' : 'buon_02';
  } else if (carriedTrashId) {
    // ĐANG CẦM RÁC: sử dụng nhóm 12 ảnh cam_[trashId]_01..12 tương ứng với bước chân hiện tại
    const carryFrames = getCarryCostumeIdsForTrash(carriedTrashId);
    currentCostumeId = carryFrames[stepIndex % 12] || carryFrames[0];
  } else {
    // CHƯA CẦM RÁC: sử dụng nhóm 12 ảnh tim_rac_01..12 tương ứng với bước chân hiện tại
    currentCostumeId = TIM_RAC_IDS[stepIndex % 12] || 'tim_rac_01';
  }

  // Tìm bất kỳ ảnh custom nào người dùng đã tải lên để làm ảnh dự phòng thông minh
  const uploadedKeys = Object.keys(customCostumes || {}).filter((k) => !!customCostumes[k]);
  const primaryCustomMascot =
    customCostumes['tim_rac_01'] ||
    customCostumes['k-v-2'] ||
    customMascotUrl ||
    (uploadedKeys.length > 0 ? customCostumes[uploadedKeys[0]] : null);

  // Nguồn ảnh: Ảnh custom tải lên hoặc Vector SVG
  let customFrameImage: string | null = customCostumes[currentCostumeId] || null;

  // Nếu frame hiện tại chưa có ảnh riêng nhưng người dùng đã tải bộ trang phục bạn Kiến:
  // Tự động ưu tiên lấy đúng pha bước chân (tim_rac_01..12) hoặc ảnh custom chính để giữ nguyên nhân vật và chuyển động mượt mà
  if (!customFrameImage && primaryCustomMascot) {
    const walkFallbackId = TIM_RAC_IDS[stepIndex % 12] || 'tim_rac_01';
    if (currentCostumeId.startsWith('cam_') || currentCostumeId.startsWith('tim_rac_')) {
      customFrameImage = customCostumes[walkFallbackId] || primaryCustomMascot;
    } else if (currentCostumeId.startsWith('vui_')) {
      customFrameImage = customCostumes['vui_01'] || customCostumes['vui_02'] || primaryCustomMascot;
    } else if (currentCostumeId.startsWith('buon_')) {
      customFrameImage = customCostumes['buon_01'] || customCostumes['buon_02'] || primaryCustomMascot;
    } else {
      customFrameImage = primaryCustomMascot;
    }
  }

  return (
    <div
      className="absolute z-30 select-none pointer-events-none flex flex-col items-center group will-change-[left,top]"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* Bong bóng lời nói của Bạn Kiến Sáng */}
      {speechText && (
        <div className="relative mb-2 max-w-xs sm:max-w-sm pointer-events-auto">
          <div
            className={`py-2 px-3.5 rounded-2xl shadow-xl border-3 flex items-center gap-2 ${
              mood === 'sad'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : mood === 'happy' || mood === 'victory'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-white border-orange-400 text-slate-900'
            }`}
          >
            <div className="text-sm font-extrabold leading-snug">
              {mood === 'happy' && <span className="mr-1">🎉</span>}
              {mood === 'sad' && <span className="mr-1">🥺</span>}
              {mood === 'victory' && <span className="mr-1">🏆</span>}
              {speechText}
            </div>

            {onReplaySpeech && (
              <button
                onClick={onReplaySpeech}
                title="Nghe lại lời nói"
                className="shrink-0 p-1.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 transition active:scale-90"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Đuôi bong bóng */}
          <div
            className={`w-3.5 h-3.5 rotate-45 mx-auto -mt-2 border-r-3 border-b-3 ${
              mood === 'sad'
                ? 'bg-amber-50 border-amber-400'
                : mood === 'happy' || mood === 'victory'
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-white border-orange-400'
            }`}
          />
        </div>
      )}

      {/* CONTAINER HIỂN THỊ TRANG PHỤC BẠN KIẾN SÁNG */}
      <div
        className="relative flex items-center justify-center will-change-transform"
        style={{ transform: `scale(${mascotScale})` }}
      >
        {/* Nút bấm nhanh mở Xưởng Trang Phục */}
        {onOpenMascotModal && (
          <button
            onClick={onOpenMascotModal}
            title="Mở Xưởng Trang Phục Scratch của Bạn Kiến Sáng"
            className="pointer-events-auto absolute -top-3 -right-3 z-40 p-1.5 rounded-full bg-white/95 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg border-2 border-orange-300 transition-transform active:scale-90 flex items-center gap-1 text-[11px] font-black group-hover:scale-105"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span className="hidden group-hover:inline pr-1 font-sans">Trang Phục</span>
          </button>
        )}

        {/* Khung nhân vật lật trái/phải theo hướng di chuyển (bỏ transition-transform 75ms để tránh giật khi RAF 60fps) */}
        <div
          className="relative flex items-center justify-center will-change-transform"
          style={{
            transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        >
          {customFrameImage ? (
            <div className="relative w-28 h-36 flex items-center justify-center">
              <img
                src={customFrameImage}
                alt={`Bạn Kiến Sáng - ${currentCostumeId}`}
                className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
              />
              {/* Nếu đang cầm rác nhưng dùng ảnh bước đi chung, hiển thị món rác ôm trước ngực */}
              {carriedTrashId && carriedItemDef && !customCostumes[currentCostumeId] && (
                <div
                  className="absolute bottom-6 right-1 w-10 h-10 bg-white/95 rounded-xl p-1 shadow-md border-2 border-orange-400 flex items-center justify-center pointer-events-none animate-bounce"
                  style={{ transform: facingDirection === 'left' ? 'scaleX(-1)' : 'none' }}
                >
                  {carriedItemDef.customImageUrl ? (
                    <img
                      src={carriedItemDef.customImageUrl}
                      alt={carriedItemDef.nameVi}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xl">
                      {carriedItemDef.category === 'organic' ? '🌱' : '♻️'}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-28 h-36 flex items-center justify-center drop-shadow-md select-none pointer-events-none"
              dangerouslySetInnerHTML={{
                __html: getCostumeSvg(currentCostumeId),
              }}
            />
          )}
        </div>

        {/* Huy hiệu hiển thị mã trang phục đang kích hoạt */}
        {(isMoving || stepIndex > 0) && (
          <div className="absolute -bottom-4 bg-orange-600 text-yellow-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-orange-400 whitespace-nowrap">
            {currentCostumeId} ({stepIndex + 1}/12)
          </div>
        )}
      </div>
    </div>
  );
};
