import React, { useRef, useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, Sparkles, RefreshCw, ZoomIn, Info } from 'lucide-react';

interface MascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  customMascotUrl: string | null;
  onSaveMascot: (dataUrl: string | null, scale?: number) => void;
  mascotScale: number;
  onUpdateScale: (scale: number) => void;
}

export const MascotModal: React.FC<MascotModalProps> = ({
  isOpen,
  onClose,
  customMascotUrl,
  onSaveMascot,
  mascotScale,
  onUpdateScale,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(customMascotUrl);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (PNG, JPG, WebP, SVG)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setSelectedPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApply = async () => {
    if (!selectedPreview) return;
    setIsUploading(true);

    try {
      // Send to server to write public/images/kien-sang-main.png directly
      await fetch('/api/upload-mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: selectedPreview }),
      });
    } catch (err) {
      console.warn('Backend upload notice:', err);
    }

    // Save to client state and localStorage
    onSaveMascot(selectedPreview, mascotScale);
    setIsUploading(false);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetDefault = async () => {
    onSaveMascot(null, 1.0);
    setSelectedPreview(null);
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-5 sm:px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-950">
                Cập Nhật Ảnh Bạn Kiến Sáng
              </h3>
              <p className="text-xs text-amber-950 font-bold">
                Dùng đúng tệp ảnh kien-sang-main.png của bạn
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

        {/* Nội dung modal */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Thông báo giải thích nguyên nhân và hướng dẫn */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">
                Để nhân vật hiển thị 100% đúng hình ảnh mong đợi:
              </p>
              <p className="text-slate-700 leading-relaxed">
                Do ảnh đính kèm trong tin nhắn chat không tự động lưu vào máy chủ web, bạn vui lòng chọn file <span className="font-extrabold text-orange-600">kien-sang-main.png</span> từ máy tính của bạn tại đây. Ảnh sẽ lập tức xuất hiện trong game, trên thanh công cụ và file Scratch!
              </p>
            </div>
          </div>

          {/* Vùng chọn file (Drag & Drop) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-orange-500 bg-orange-50 scale-[1.01]'
                : selectedPreview
                ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-slate-300 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-300 text-white flex items-center justify-center shadow-md">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800">
                {fileName ? `Đã chọn: ${fileName}` : 'Bấm vào đây để chọn file kien-sang-main.png'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                hoặc kéo thả file ảnh trực tiếp vào khung này (PNG, JPG, WebP)
              </p>
            </div>

            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow transition pointer-events-none"
            >
              Chọn file từ máy tính
            </button>
          </div>

          {/* Khung xem trước (Live Preview) */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Xem trước trong lớp học:
              </span>
              {selectedPreview && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Ảnh sẵn sàng áp dụng
                </span>
              )}
            </div>

            <div className="relative h-44 rounded-2xl bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 border border-amber-200 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Sàn lớp học */}
              <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-amber-200 to-amber-100 border-t border-amber-300" />

              {/* Nhân vật đang xem trước */}
              <div
                className="relative z-10 flex flex-col items-center transition-transform"
                style={{ transform: `scale(${mascotScale})` }}
              >
                <img
                  src={selectedPreview || '/images/kien-sang-main.png'}
                  alt="Xem trước Kiến Sáng"
                  className="max-h-32 max-w-[140px] object-contain drop-shadow-xl select-none"
                />
              </div>

              {/* Bóng đổ dưới chân */}
              <div className="absolute bottom-2 w-24 h-4 bg-slate-900/20 rounded-full blur-xs" />
            </div>

            {/* Thanh chỉnh tỉ lệ kích thước (Scale) */}
            <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
              <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Kích thước hiển thị:</span>
                  <span className="text-orange-600 font-black">{Math.round(mascotScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={mascotScale}
                  onChange={(e) => onUpdateScale(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động dưới chân */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Khôi phục ảnh mặc định
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              Hủy
            </button>

            <button
              onClick={handleApply}
              disabled={!selectedPreview || isUploading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg transition active:scale-95 ${
                uploadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Đang cập nhật...
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Đã áp dụng thành công!
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Áp dụng ngay hình này
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
