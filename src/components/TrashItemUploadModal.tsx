import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  FolderUp,
  Image as ImageIcon,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TrashCategory, TrashItemDef } from '../types';
import { compressImageDataUrl } from '../utils/persistentStorage';

interface TrashItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashDefinitions: TrashItemDef[];
  customTrashImages: Record<string, string>; // itemId -> dataUrl
  onSaveCustomTrashImages: (newImagesMap: Record<string, string>) => void;
}

export const TrashItemUploadModal: React.FC<TrashItemUploadModalProps> = ({
  isOpen,
  onClose,
  trashDefinitions,
  customTrashImages,
  onSaveCustomTrashImages,
}) => {
  const [imagesMap, setImagesMap] = useState<Record<string, string>>(customTrashImages);
  const [filter, setFilter] = useState<'all' | 'organic' | 'recyclable'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draggedOverItemId, setDraggedOverItemId] = useState<string | null>(null);
  const [isBatchDragging, setIsBatchDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showNamingGuide, setShowNamingGuide] = useState(false);

  // Hidden multi-file input
  const batchInputRef = useRef<HTMLInputElement>(null);
  // Hidden single-file inputs mapping
  const singleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setImagesMap(customTrashImages);
      setSaveSuccess(false);
      setStatusMessage(null);
    }
  }, [isOpen, customTrashImages]);

  if (!isOpen) return null;

  const totalCount = trashDefinitions.length;
  const uploadedCount = Object.keys(imagesMap).filter((id) => !!imagesMap[id]).length;

  const filteredItems = trashDefinitions.filter((item) => {
    if (filter === 'organic') return item.category === 'organic';
    if (filter === 'recyclable') return item.category === 'recyclable';
    return true;
  });

  // Hàm chuyển đổi tiếng Việt có dấu thành không dấu để nhận diện tên file chính xác 100%
  const removeVietnameseDiacritics = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Helper to remove white borders and white backgrounds from uploaded images, and compress to optimal size
  const stripWhiteBorder = async (dataUrl: string): Promise<string> => {
    // 1. Tự động nén kích thước tối đa 400x400 để tải siêu mượt và không tốn bộ nhớ
    const resized = await compressImageDataUrl(dataUrl, 400);

    return new Promise((resolve) => {
      if (!resized || !resized.startsWith('data:image')) {
        resolve(resized);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resized);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;

          const checkWhite = (r: number, g: number, b: number) => r > 235 && g > 235 && b > 235;

          let hasWhiteBg = false;
          const corners = [
            0,
            (canvas.width - 1) * 4,
            (canvas.width * (canvas.height - 1)) * 4,
            (canvas.width * canvas.height - 1) * 4,
          ];
          for (const idx of corners) {
            if (checkWhite(d[idx], d[idx + 1], d[idx + 2])) {
              hasWhiteBg = true;
              break;
            }
          }

          if (hasWhiteBg) {
            for (let i = 0; i < d.length; i += 4) {
              if (checkWhite(d[i], d[i + 1], d[i + 2])) {
                d[i + 3] = 0; // Make transparent
              }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(resized);
          }
        } catch {
          resolve(resized);
        }
      };
      img.onerror = () => resolve(resized);
      img.src = resized;
    });
  };

  // Handle single file upload for a specific trash item
  const handleItemFile = (itemId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      if (rawDataUrl) {
        const cleanDataUrl = await stripWhiteBorder(rawDataUrl);
        setImagesMap((prev) => ({
          ...prev,
          [itemId]: cleanDataUrl,
        }));
        setStatusMessage(`Đã nạp ảnh (đã tách viền & nén tối ưu) cho "${trashDefinitions.find((t) => t.id === itemId)?.nameVi}"!`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Smart keyword matcher for batch uploading - Nhận diện thông minh cả tiếng Việt có dấu, không dấu, tiếng Anh và số thứ tự
  const findMatchingItemId = (fileName: string, availableIds: string[]): string | null => {
    const rawClean = fileName.toLowerCase().replace(/[-_.]/g, ' ');
    const noAccents = removeVietnameseDiacritics(rawClean);

    // Bảng từ khóa nhận diện phong phú cho cả 16 món rác
    const keywordMap: Record<string, string[]> = {
      banana_peel: ['chuoi', 'banana', 'vo chuoi', 'peel', 'trai chuoi', 'qua chuoi', '1'],
      apple_core: ['tao', 'apple', 'loi tao', 'qua tao', 'trai tao', 'core', '2'],
      bread_crumb: ['banh mi', 'bread', 'crumb', 'banh', 'mau banh', '3'],
      fallen_leaf: ['la', 'leaf', 'la cay', 'la bang', 'la kho', '4'],
      watermelon_rind: ['dua hau', 'watermelon', 'dua', 'vo dua', 'rind', '5'],
      orange_peel: ['cam', 'orange', 'vo cam', 'trai cam', 'qua cam', '6'],
      fish_bone: ['ca', 'xuong', 'fish', 'bone', 'xuong ca', 'dau ca', '7'],
      vegetable_leaves: ['rau', 'vegetable', 'cai', 'rau cai', 'rau cu', 'la rau', '8'],
      milk_box: ['sua', 'milk', 'hop sua', 'thung sua', 'hop giay', 'vinamilk', 'milo', 'thc', '9'],
      plastic_bottle: ['chai', 'bottle', 'nuoc loc', 'chai nhua', 'aquafina', 'lavie', 'chai nuoc', '10'],
      soda_can: ['lon', 'can', 'soda', 'coca', 'pepsi', 'lon nhom', 'nuoc ngot', '11'],
      paper_scrap: ['giay', 'paper', 'giay nhap', 'tap', 'giay vun', 'giay vo', '12'],
      cardboard_box: ['bia', 'carton', 'box', 'hop carton', 'hop banh', 'thung giay', 'thung carton', '13'],
      plastic_cup: ['ly', 'cup', 'ly nhua', 'tra sua', 'tra dao', 'coc', 'coc nhua', '14'],
      plastic_bag: ['tui', 'bag', 'nilon', 'nilong', 'tui nilon', 'bich', 'bich nilon', '15'],
      plastic_straw: ['ong hut', 'straw', 'hut', 'ong', 'ong nhua', '16'],
    };

    // Kiểm tra khớp từ khóa (ưu tiên khớp chính xác không dấu)
    for (const [id, keywords] of Object.entries(keywordMap)) {
      if (availableIds.includes(id)) {
        if (keywords.some((kw) => noAccents.includes(kw) || rawClean.includes(kw))) {
          return id;
        }
      }
    }
    return null;
  };

  // Handle batch multiple files upload
  const handleBatchFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      alert('Không tìm thấy file hình ảnh nào hợp lệ.');
      return;
    }

    let remainingIds = [...trashDefinitions.map((d) => d.id)];
    const newUpdates: Record<string, string> = {};
    let matchedCount = 0;
    const recognizedItems: string[] = [];

    let processedCount = 0;
    fileArray.forEach((file) => {
      const matchedId = findMatchingItemId(file.name, remainingIds) || remainingIds[0];
      if (matchedId) {
        remainingIds = remainingIds.filter((id) => id !== matchedId);
        const itemName = trashDefinitions.find((t) => t.id === matchedId)?.nameVi || matchedId;
        recognizedItems.push(`${file.name} ➔ ${itemName}`);

        const reader = new FileReader();
        reader.onload = async (e) => {
          const rawDataUrl = e.target?.result as string;
          if (rawDataUrl) {
            const cleanDataUrl = await stripWhiteBorder(rawDataUrl);
            newUpdates[matchedId] = cleanDataUrl;
            matchedCount++;
          }
          processedCount++;
          if (processedCount === fileArray.length) {
            setImagesMap((prev) => ({
              ...prev,
              ...newUpdates,
            }));
            setStatusMessage(`Đã tự động nhận diện & nạp ${matchedCount} ảnh: ${recognizedItems.slice(0, 3).join(', ')}${recognizedItems.length > 3 ? '...' : ''}`);
            setTimeout(() => setStatusMessage(null), 5000);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Tẩy sạch viền trắng cho toàn bộ các ảnh đã nạp
  const handleCleanAllWhiteBorders = async () => {
    setStatusMessage('Đang tự động xóa viền trắng cho tất cả ảnh...');
    const updated: Record<string, string> = {};
    for (const [id, url] of Object.entries(imagesMap)) {
      if (url) {
        updated[id] = await stripWhiteBorder(url);
      }
    }
    setImagesMap(updated);
    setStatusMessage('Đã hoàn tất tách sạch viền trắng cho toàn bộ ảnh rác!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Save changes
  const handleSaveAndApply = async () => {
    setIsSaving(true);
    try {
      // Also post to backend if available
      for (const [itemId, dataUrl] of Object.entries(imagesMap)) {
        if (dataUrl && dataUrl.startsWith('data:image')) {
          try {
            await fetch('/api/upload-trash-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId, dataUrl }),
            });
          } catch {
            // Ignore backend failure, localStorage will suffice
          }
        }
      }

      onSaveCustomTrashImages(imagesMap);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error(e);
      onSaveCustomTrashImages(imagesMap);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Remove custom image for an item
  const handleRemoveItem = (itemId: string) => {
    setImagesMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  // Reset all 16 items
  const handleResetAll = () => {
    if (confirm('Bạn có chắc muốn đặt lại tất cả 16 ảnh rác về hình vẽ mặc định không?')) {
      setImagesMap({});
      setStatusMessage('Đã đặt lại tất cả về ảnh mặc định!');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Tải Ảnh Cho 16 Loại Rác
                </h2>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {uploadedCount}/{totalCount} Đã Có Ảnh
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Tải lên 16 ảnh thực tế (8 hữu cơ + 8 vô cơ) để rác xuất hiện sinh động trong lớp học!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Batch Upload Bar */}
        <div className="px-4 sm:px-6 py-3 bg-amber-50/60 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
          {/* Progress bar */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-slate-700">Tiến độ nạp ảnh rác:</span>
              <span className="text-amber-800">{Math.round((uploadedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
                style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={batchInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleBatchFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={() => batchInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              title="Chọn cùng lúc nhiều file ảnh để tự động gán vào 16 loại rác (tự động tách viền trắng)"
            >
              <Upload className="w-4 h-4" />
              <span>Tải nhanh nhiều ảnh</span>
            </button>

            <button
              onClick={() => setShowNamingGuide((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-extrabold text-xs border border-amber-300 shadow-sm transition cursor-pointer"
              title="Xem danh sách tên file mẫu để hệ thống tự nhận diện rác chính xác 100%"
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>{showNamingGuide ? 'Đóng bảng tên file' : '💡 Cách đặt tên file tự nhận diện'}</span>
              {showNamingGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {uploadedCount > 0 && (
              <button
                onClick={handleCleanAllWhiteBorders}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                title="Tự động tẩy sạch mọi viền trắng/nền trắng của tất cả ảnh rác đã nạp"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tách viền trắng tất cả</span>
              </button>
            )}

            {uploadedCount > 0 && (
              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs border border-slate-200 transition cursor-pointer"
                title="Xóa tất cả ảnh đã tải và quay về vector mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại mặc định</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Naming Guide / Cheat Sheet */}
        {showNamingGuide && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-300 px-4 sm:px-6 py-3.5 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  Quy ước đặt tên file để tải lên tự động nhận diện (16 loại rác):
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
                Hỗ trợ cả Tiếng Việt có dấu, không dấu, Tiếng Anh & Số thứ tự
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5">
                <div className="font-black text-emerald-800 mb-1.5 flex items-center gap-1">
                  <span>🌿 8 Rác Hữu Cơ (Thùng Xanh):</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-700">
                  <div>1. Vỏ chuối: <code className="text-emerald-700 font-mono font-bold">chuoi, banana</code></div>
                  <div>2. Lõi táo: <code className="text-emerald-700 font-mono font-bold">tao, apple</code></div>
                  <div>3. Mẩu bánh mì: <code className="text-emerald-700 font-mono font-bold">banh_mi, bread</code></div>
                  <div>4. Lá cây rơi: <code className="text-emerald-700 font-mono font-bold">la, leaf, la_cay</code></div>
                  <div>5. Vỏ dưa hấu: <code className="text-emerald-700 font-mono font-bold">dua_hau, watermelon</code></div>
                  <div>6. Vỏ cam: <code className="text-emerald-700 font-mono font-bold">cam, orange</code></div>
                  <div>7. Xương cá: <code className="text-emerald-700 font-mono font-bold">xuong_ca, fish</code></div>
                  <div>8. Rau củ: <code className="text-emerald-700 font-mono font-bold">rau, vegetable</code></div>
                </div>
              </div>

              <div className="bg-orange-50/90 border border-orange-200 rounded-xl p-2.5">
                <div className="font-black text-orange-800 mb-1.5 flex items-center gap-1">
                  <span>♻️ 8 Rác Tái Chế (Thùng Cam):</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-700">
                  <div>9. Vỏ hộp sữa: <code className="text-orange-700 font-mono font-bold">hop_sua, milk, sua</code></div>
                  <div>10. Chai nước suối: <code className="text-orange-700 font-mono font-bold">chai, bottle</code></div>
                  <div>11. Lon nước ngọt: <code className="text-orange-700 font-mono font-bold">lon, can, soda, coca</code></div>
                  <div>12. Giấy vụn: <code className="text-orange-700 font-mono font-bold">giay, paper, tap</code></div>
                  <div>13. Hộp các tông: <code className="text-orange-700 font-mono font-bold">carton, box, bia</code></div>
                  <div>14. Ly nhựa: <code className="text-orange-700 font-mono font-bold">ly, cup, tra_sua</code></div>
                  <div>15. Túi nilon: <code className="text-orange-700 font-mono font-bold">tui, bag, nilon</code></div>
                  <div>16. Ống hút nhựa: <code className="text-orange-700 font-mono font-bold">ong_hut, straw, ong</code></div>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] font-medium text-slate-600 italic">
              💡 Mẹo: Bạn có thể chọn tải cả thư mục hoặc kéo thả từng ảnh trực tiếp vào ô tương ứng ở bên dưới bất cứ lúc nào!
            </p>
          </div>
        )}

        {/* Notifications / Status message */}
        {statusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tabs filter */}
        <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả 16 rác ({totalCount})
          </button>
          <button
            onClick={() => setFilter('organic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
              filter === 'organic'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>🌿 8 Rác Hữu cơ (Thùng Xanh)</span>
          </button>
          <button
            onClick={() => setFilter('recyclable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
              filter === 'recyclable'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
            }`}
          >
            <span>🍊 8 Rác Vô cơ (Thùng Cam)</span>
          </button>
        </div>

        {/* Big Drag & Drop Zone for Batch Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsBatchDragging(true);
          }}
          onDragLeave={() => setIsBatchDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsBatchDragging(false);
            if (e.dataTransfer.files) {
              handleBatchFiles(e.dataTransfer.files);
            }
          }}
          className={`mx-4 sm:mx-6 mb-3 p-3 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between gap-3 ${
            isBatchDragging
              ? 'border-orange-500 bg-orange-100/70 scale-[1.01]'
              : 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">
                Kéo thả các file ảnh rác vào đây hoặc bấm tải nhanh
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Hệ thống tự động nhận diện tên file (ví dụ: chuoi.png, chai_nhua.png, lon.png...)
              </p>
            </div>
          </div>
          <button
            onClick={() => batchInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white text-orange-700 border border-orange-300 hover:bg-orange-50 text-xs font-black shadow-xs cursor-pointer shrink-0"
          >
            Duyệt file ảnh...
          </button>
        </div>

        {/* 16 Items Grid List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredItems.map((item, idx) => {
            const hasCustom = !!imagesMap[item.id];
            const isOrganic = item.category === 'organic';
            const isItemDraggedOver = draggedOverItemId === item.id;

            return (
              <div
                key={item.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOverItemId(item.id);
                }}
                onDragLeave={() => setDraggedOverItemId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOverItemId(null);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleItemFile(item.id, e.dataTransfer.files[0]);
                  }
                }}
                className={`relative rounded-2xl p-3 border-2 transition-all flex flex-col justify-between ${
                  isItemDraggedOver
                    ? 'border-orange-500 bg-orange-50 scale-105 shadow-lg'
                    : hasCustom
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header card: Number + Category badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-slate-400">
                    #{trashDefinitions.findIndex((t) => t.id === item.id) + 1}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isOrganic
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-orange-100 text-orange-800 border border-orange-300'
                    }`}
                  >
                    {isOrganic ? 'Hữu cơ' : 'Vô cơ / Tái chế'}
                  </span>
                </div>

                {/* Preview Graphic / Image */}
                <div className="relative w-full h-24 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden group">
                  {hasCustom ? (
                    <img
                      src={imagesMap[item.id]}
                      alt={item.nameVi}
                      className="w-full h-full object-contain drop-shadow transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <span className="text-3xl mb-1">
                        {isOrganic ? '🥬' : '🥫'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        (Ảnh mặc định)
                      </span>
                    </div>
                  )}

                  {/* Badge "Đã tải ảnh riêng" */}
                  {hasCustom && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Ảnh riêng</span>
                    </div>
                  )}
                </div>

                {/* Item Name */}
                <div className="mt-2 text-center">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    {item.nameVi}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5" title={item.hint}>
                    {item.hint}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={(el) => {
                      singleInputRefs.current[item.id] = el;
                    }}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleItemFile(item.id, e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => singleInputRefs.current[item.id]?.click()}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                      hasCustom
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>{hasCustom ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                  </button>

                  {hasCustom && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                      title="Xóa ảnh riêng, dùng lại ảnh mặc định"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-amber-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Info className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              Ảnh tải lên sẽ tự động lưu vào bộ nhớ trình duyệt và áp dụng ngay cho lớp học!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleSaveAndApply}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              {isSaving ? (
                <span>Đang lưu...</span>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Áp Dụng Cho Lớp Học</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
