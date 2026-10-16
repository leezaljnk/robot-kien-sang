import React from 'react';
import { TrashCategory } from '../types';
import { Camera } from 'lucide-react';

interface TrashBinProps {
  category: TrashCategory;
  isOpen?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  bounce?: boolean;
  customImageSrc?: string | null;
  binScale?: number;
  onOpenUploadModal?: () => void;
}

export const TrashBin: React.FC<TrashBinProps> = ({
  category,
  isOpen = false,
  isHovered = false,
  isSelected = false,
  onClick,
  bounce = false,
  customImageSrc,
  binScale = 0.85,
  onOpenUploadModal,
}) => {
  const isOrganic = category === 'organic';
  const imageSrc =
    customImageSrc ||
    (isOrganic ? './images/thung_rac_xanh.png' : './images/thung_rac_cam.png');
  const altText = isOrganic
    ? 'Thùng Rác Xanh (Hữu Cơ)'
    : 'Thùng Rác Cam (Tái Chế)';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={altText}
      className={`relative cursor-pointer transition-transform duration-200 select-none group focus:outline-none flex flex-col items-center ${
        bounce ? 'animate-bounce' : ''
      } ${isHovered || isSelected ? 'scale-108' : 'hover:scale-103'}`}
      style={{
        touchAction: 'manipulation',
        transform: `scale(${binScale * (isHovered || isSelected ? 1.08 : 1.0)})`,
      }}
    >
      {/* Hiệu ứng hào quang khi đang rê rác vào hoặc được chọn */}
      {(isHovered || isSelected) && (
        <div
          className={`absolute -inset-4 rounded-3xl blur-2xl opacity-80 animate-pulse pointer-events-none ${
            isOrganic ? 'bg-emerald-400' : 'bg-orange-400'
          }`}
        />
      )}

      {/* Nút bấm nhanh đổi ảnh cho thùng rác này */}
      {onOpenUploadModal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenUploadModal();
          }}
          title={`Bấm để tải ảnh cho ${altText}`}
          className={`absolute -top-3.5 right-1 z-30 p-1.5 rounded-full shadow-lg border-2 transition-all duration-200 flex items-center gap-1 text-[11px] font-black cursor-pointer ${
            isOrganic
              ? 'bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-500 hover:text-white'
              : 'bg-white text-orange-700 border-orange-400 hover:bg-orange-500 hover:text-white'
          } opacity-80 group-hover:opacity-100 group-hover:scale-105`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline pr-0.5">Đổi ảnh</span>
        </button>
      )}

      {/* Hiệu ứng chỉ dẫn khi bé chọn trong Chế độ 2 */}
      {isSelected && (
        <div className="absolute -top-7 bg-yellow-400 text-yellow-950 font-black text-xs px-3 py-1 rounded-full shadow-lg border-2 border-yellow-200 animate-bounce z-30">
          👉 Bỏ vào đây nè!
        </div>
      )}

      {/* SỬ DỤNG HÌNH ẢNH SPRITE PNG / TẢI LÊN TRỰC TIẾP */}
      <div className="relative w-20 sm:w-23 md:w-26 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={altText}
          draggable={false}
          className={`w-full h-auto object-contain drop-shadow-xl transition-all duration-200 ${
            isHovered || isOpen ? 'filter brightness-105' : ''
          }`}
        />
      </div>

      {/* Nhãn nhỏ chỉ dẫn loại rác cho bé lớp 1 */}
      <div
        className={`mt-1.5 py-1 px-3.5 rounded-full text-xs font-black shadow-md border-2 transition ${
          isOrganic
            ? 'bg-emerald-600 text-white border-emerald-400'
            : 'bg-orange-600 text-white border-orange-400'
        } ${isHovered || isSelected ? 'scale-105 ring-2 ring-white' : ''}`}
      >
        {isOrganic ? '🍃 Thức ăn & Cây cỏ' : '♻️ Hộp sữa, chai & lon'}
      </div>
    </div>
  );
};
