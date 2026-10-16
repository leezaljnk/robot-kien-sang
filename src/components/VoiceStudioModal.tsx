import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { VoiceClips } from '../types';
import { VOICE_PROMPTS } from '../data/voicePrompts';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceClips: VoiceClips;
  onSaveVoiceClips: (clips: VoiceClips) => void;
}

type ClipKey = keyof VoiceClips;

interface PromptItem {
  key: ClipKey;
  label: string;
  defaultText: string;
  situation: string;
  icon: string;
}

const PROMPT_ITEMS: PromptItem[] = VOICE_PROMPTS.map(prompt => ({
  key: prompt.id,
  label: prompt.id,
  defaultText: prompt.text,
  situation: prompt.text,
  icon: '🎙️',
}));

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  isOpen,
  onClose,
  voiceClips,
  onSaveVoiceClips,
}) => {
  const [activeKey, setActiveKey] = useState<ClipKey>('incorrect');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedClips, setRecordedClips] = useState<VoiceClips>(voiceClips);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRecordedClips(voiceClips);
  }, [voiceClips, isOpen]);

  if (!isOpen) return null;

  const currentPrompt = PROMPT_ITEMS.find((p) => p.key === activeKey) || PROMPT_ITEMS[0];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setRecordedClips((prev) => ({
            ...prev,
            [activeKey]: base64Data,
          }));
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch {
      alert('Không thể mở micro! Bạn vui lòng cấp quyền micro trên trình duyệt để thu âm nhé.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playPreview = () => {
    const clipUrl = recordedClips[activeKey];
    if (!clipUrl) return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const audio = new Audio(clipUrl);
    previewAudioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.play();
  };

  const handleClearClip = (key: ClipKey) => {
    setRecordedClips((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  const handleSaveAndApply = () => {
    onSaveVoiceClips(recordedClips);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-4 border-amber-400">
        {/* Header modal */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <div>
              <h3 className="text-lg font-black tracking-wide text-slate-900">
                Phòng Thu Lồng Tiếng Bạn Kiến Sáng
              </h3>
              <p className="text-xs text-amber-950 font-bold">
                Thu chính giọng nói của bé để nhân vật phát âm trong game!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân modal */}
        <div className="p-6 space-y-5">
          {/* Tabs chọn 3 câu cần thu âm */}
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {PROMPT_ITEMS.map((item) => {
              const hasClip = Boolean(recordedClips[item.key]);
              const isSelected = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (!isRecording) setActiveKey(item.key);
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.icon}</span>
                    {hasClip && (
                      <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Có giọng
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-800 mt-1 line-clamp-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vùng hướng dẫn bé đọc */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Bé hãy đọc thật to và biểu cảm câu này:
            </span>
            <div className="text-xl sm:text-2xl font-black text-orange-600 bg-white py-3 px-4 rounded-xl shadow-inner border border-amber-200">
              "{currentPrompt.defaultText}"
            </div>
            <p className="text-xs text-slate-600 font-medium">
              👉 {currentPrompt.situation}
            </p>
          </div>

          {/* Nút thu âm & xem trước */}
          <div className="flex flex-col items-center justify-center space-y-3">
            {!isRecording ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 py-3 px-6 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-extrabold shadow-lg transition"
                >
                  <Mic className="w-5 h-5 animate-bounce" />
                  Bấm để bắt đầu thu âm
                </button>

                {recordedClips[activeKey] && (
                  <>
                    <button
                      onClick={playPreview}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition"
                    >
                      <Play className="w-4 h-4" />
                      {isPlaying ? 'Đang phát...' : 'Nghe lại'}
                    </button>
                    <button
                      onClick={() => handleClearClip(activeKey)}
                      title="Xóa và dùng lại giọng mặc định"
                      className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-rose-600 font-black text-sm animate-pulse">
                  <div className="w-3.5 h-3.5 bg-rose-600 rounded-full" />
                  Đang thu âm... {recordSeconds}s
                </div>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 py-3 px-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl active:scale-95 transition"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Dừng thu âm & Lưu
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-500 text-center">
              {recordedClips[activeKey]
                ? '✅ Đã lưu bản thu của bé! Bạn có thể thu lại bất cứ lúc nào.'
                : '💡 Chưa thu âm câu này: Trò chơi sẽ dùng giọng đọc tự động robot thân thiện.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSaveAndApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Lưu & Áp Dụng Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
