import React, { useRef, useState } from 'react';
import { Upload, X, Check, Trash2, Sparkles, RefreshCw, ZoomIn, Info } from 'lucide-react';
import { TrashCategory } from '../types';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCategory?: TrashCategory | null; // which bin was clicked, or null for general
  customOrganicUrl: string | null;
  customRecyclableUrl: string | null;
  onSaveBinImages: (organicUrl: string | null, recyclableUrl: string | null, scale?: number) => void;
  binScale: number;
  onUpdateScale: (scale: number) => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  targetCategory = null,
  customOrganicUrl,
  customRecyclableUrl,
  onSaveBinImages,
  binScale,
  onUpdateScale,
}) => {
  const [activeTab, setActiveTab] = useState<'organic' | 'recyclable'>(
    targetCategory === 'recyclable' ? 'recyclable' : 'organic'
  );

  const [previewOrganic, setPreviewOrganic] = useState<string | null>(customOrganicUrl);
  const [previewRecyclable, setPreviewRecyclable] = useState<string | null>(customRecyclableUrl);

  const [organicFileName, setOrganicFileName] = useState('');
  const [recyclableFileName, setRecyclableFileName] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const organicInputRef = useRef<HTMLInputElement>(null);
  const recyclableInputRef = useRef<HTMLInputElement>(null);

  const [dragOrganic, setDragOrganic] = useState(false);
  const [dragRecyclable, setDragRecyclable] = useState(false);

  if (!isOpen) return null;

  const handleProcessFile = (file: File, type: 'organic' | 'recyclable') => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (PNG, JPG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (type === 'organic') {
          setPreviewOrganic(result);
          setOrganicFileName(file.name);
        } else {
          setPreviewRecyclable(result);
          setRecyclableFileName(file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    setIsSaving(true);
    try {
      // If organic changed, post to server
      if (previewOrganic && previewOrganic !== customOrganicUrl) {
        await fetch('/api/upload-bin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ binType: 'organic', dataUrl: previewOrganic }),
        });
      }

      // If recyclable changed, post to server
      if (previewRecyclable && previewRecyclable !== customRecyclableUrl) {
        await fetch('/api/upload-bin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ binType: 'recyclable', dataUrl: previewRecyclable }),
        });
      }
    } catch (err) {
      console.warn('Backend bin upload warning:', err);
    }

    onSaveBinImages(previewOrganic, previewRecyclable, binScale);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetOrganic = () => {
    setPreviewOrganic(null);
    setOrganicFileName('');
  };

  const handleResetRecyclable = () => {
    setPreviewRecyclable(null);
    setRecyclableFileName('');
  };

  const handleResetBoth = () => {
    handleResetOrganic();
    handleResetRecyclable();
    onSaveBinImages(null, null, 1.0);
    onUpdateScale(1.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 px-5 sm:px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Tải Ảnh Cho 2 Thùng Rác
              </h3>
              <p className="text-xs text-emerald-100 font-bold">
                Thùng Rác Xanh (Hữu Cơ) &amp; Thùng Rác Cam (Tái Chế)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Thông báo hướng dẫn */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-900">
                Tùy chỉnh hình ảnh thùng rác theo ý muốn:
              </p>
              <p className="text-slate-700 leading-relaxed">
                Bạn có thể tải ảnh riêng cho từng thùng rác hoặc cả 2 thùng (PNG, JPG, WebP, SVG). Hình ảnh mới sẽ được áp dụng trực tiếp vào giao diện lớp học và dự án Scratch (.sb3)!
              </p>
            </div>
          </div>

          {/* Tab chuyển đổi giữa 2 thùng */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('organic')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition ${
                activeTab === 'organic'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🍃</span>
              <span>Thùng Xanh (Hữu Cơ)</span>
              {previewOrganic && <span className="w-2 h-2 rounded-full bg-yellow-300" />}
            </button>

            <button
              onClick={() => setActiveTab('recyclable')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition ${
                activeTab === 'recyclable'
                  ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>♻️</span>
              <span>Thùng Cam (Tái Chế)</span>
              {previewRecyclable && <span className="w-2 h-2 rounded-full bg-yellow-300" />}
            </button>
          </div>

          {/* Nội dung Tab Thùng Xanh (Hữu Cơ) */}
          {activeTab === 'organic' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOrganic(true);
                }}
                onDragLeave={() => setDragOrganic(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOrganic(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessFile(e.dataTransfer.files[0], 'organic');
                  }
                }}
                onClick={() => organicInputRef.current?.click()}
                className={`border-3 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  dragOrganic
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : previewOrganic
                    ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-400'
                }`}
              >
                <input
                  ref={organicInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessFile(e.target.files[0], 'organic');
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-800">
                    {organicFileName
                      ? `Đã chọn: ${organicFileName}`
                      : 'Bấm để chọn file ảnh Thùng Rác Xanh (Hữu Cơ)'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kéo thả file ảnh trực tiếp vào đây (PNG, JPG, WebP)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition pointer-events-none"
                  >
                    Chọn file ảnh từ máy
                  </button>
                  {previewOrganic && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetOrganic();
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                    >
                      Dùng ảnh gốc
                    </button>
                  )}
                </div>
              </div>

              {/* Xem trước Thùng Xanh */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5 self-start">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Xem trước Thùng Rác Xanh:
                </span>
                <div className="relative h-44 w-full rounded-2xl bg-gradient-to-b from-sky-100 to-amber-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <div
                    className="flex flex-col items-center transition-transform"
                    style={{ transform: `scale(${binScale})` }}
                  >
                    <img
                      src={previewOrganic || '/images/thung_rac_xanh.png'}
                      alt="Xem trước thùng rác xanh"
                      className="max-h-36 max-w-[140px] object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nội dung Tab Thùng Cam (Tái Chế) */}
          {activeTab === 'recyclable' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragRecyclable(true);
                }}
                onDragLeave={() => setDragRecyclable(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragRecyclable(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessFile(e.dataTransfer.files[0], 'recyclable');
                  }
                }}
                onClick={() => recyclableInputRef.current?.click()}
                className={`border-3 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  dragRecyclable
                    ? 'border-orange-500 bg-orange-50 scale-[1.01]'
                    : previewRecyclable
                    ? 'border-orange-400 bg-orange-50/50 hover:bg-orange-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-orange-50/60 hover:border-orange-400'
                }`}
              >
                <input
                  ref={recyclableInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessFile(e.target.files[0], 'recyclable');
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-800">
                    {recyclableFileName
                      ? `Đã chọn: ${recyclableFileName}`
                      : 'Bấm để chọn file ảnh Thùng Rác Cam (Tái Chế)'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kéo thả file ảnh trực tiếp vào đây (PNG, JPG, WebP)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow transition pointer-events-none"
                  >
                    Chọn file ảnh từ máy
                  </button>
                  {previewRecyclable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetRecyclable();
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                    >
                      Dùng ảnh gốc
                    </button>
                  )}
                </div>
              </div>

              {/* Xem trước Thùng Cam */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5 self-start">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  Xem trước Thùng Rác Cam:
                </span>
                <div className="relative h-44 w-full rounded-2xl bg-gradient-to-b from-sky-100 to-amber-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <div
                    className="flex flex-col items-center transition-transform"
                    style={{ transform: `scale(${binScale})` }}
                  >
                    <img
                      src={previewRecyclable || '/images/thung_rac_cam.png'}
                      alt="Xem trước thùng rác cam"
                      className="max-h-36 max-w-[140px] object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thanh chỉnh tỉ lệ kích thước (Scale) cho cả 2 thùng */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Kích thước hiển thị thùng rác:</span>
                <span className="text-emerald-700 font-black">{Math.round(binScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={binScale}
                onChange={(e) => onUpdateScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Nút hành động dưới chân modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleResetBoth}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Khôi phục cả 2 ảnh mặc định
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
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg transition active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Đang cập nhật...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Đã áp dụng thành công!
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Áp dụng ngay cho thùng rác
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
