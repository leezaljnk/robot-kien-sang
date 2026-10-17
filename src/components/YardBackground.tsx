import React from 'react';

interface YardBackgroundProps {
  onReturnToClassroom: () => void;
}

export const YardBackground: React.FC<YardBackgroundProps> = ({ onReturnToClassroom }) => (
  <div className="absolute inset-0 overflow-hidden bg-sky-200 pointer-events-none select-none">
    <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100" />
    <div data-trash-blocker className="absolute inset-x-0 top-[29%] h-[18%] bg-gradient-to-b from-amber-100 to-orange-100 border-y-4 border-amber-700">
      <div className="absolute inset-x-0 top-2 flex justify-center gap-2 text-2xl opacity-90" aria-hidden="true">
        <span>🪟</span><span>🪟</span><span>🪟</span><span>🪟</span><span>🪟</span>
      </div>
    </div>
    <div data-trash-play-area className="absolute inset-x-0 bottom-0 top-[42%] bg-gradient-to-b from-lime-300 via-green-400 to-green-600" />

    <div className="absolute top-[5%] left-[12%] text-4xl sm:text-5xl opacity-90" aria-hidden="true">☁️</div>
    <div className="absolute top-[10%] right-[15%] text-3xl sm:text-4xl opacity-90" aria-hidden="true">☁️</div>
    <div className="absolute top-[6%] right-[34%] text-3xl" aria-hidden="true">☀️</div>

    <div className="absolute left-[8%] top-[38%] text-5xl sm:text-7xl drop-shadow-md" aria-hidden="true">🌳</div>
    <div className="absolute right-[7%] top-[37%] text-5xl sm:text-7xl drop-shadow-md" aria-hidden="true">🌳</div>
    <div className="absolute left-[20%] top-[50%] text-3xl sm:text-4xl" aria-hidden="true">🌼</div>
    <div className="absolute right-[19%] top-[53%] text-3xl sm:text-4xl" aria-hidden="true">🌷</div>

    <div className="absolute left-1/2 top-[12%] -translate-x-1/2 h-[22%] w-16" aria-hidden="true">
      <svg className="h-full w-full drop-shadow-sm" viewBox="0 0 64 120" role="img" aria-label="Lá cờ đỏ sao vàng Việt Nam">
        <title>Lá cờ đỏ sao vàng Việt Nam</title>
        <path d="M 9 3 V 117" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
        <path d="M 12 8 H 61 V 42 H 12 Z" fill="#DA251D" stroke="#9F1D18" strokeWidth="1.5" />
        <path d="M 36.5 12 L 41 24 H 54 L 43.5 31.5 L 47.5 43 L 36.5 35.5 L 25.5 43 L 29.5 31.5 L 19 24 H 32 Z" fill="#FFFF00" />
      </svg>
    </div>

    <div className="absolute left-1/2 top-[47%] h-[39%] w-[58%] -translate-x-1/2 rounded-[2rem] border-4 border-white/80 bg-orange-300/90 shadow-inner sm:w-[48%]">
      <div className="absolute inset-3 rounded-[1.5rem] border-2 border-white/70" />
      <div className="absolute left-1/2 top-0 h-full border-l-2 border-white/70" />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 sm:h-16 sm:w-16" />
      <div className="absolute left-1 top-1/2 h-1/3 w-[22%] -translate-y-1/2 rounded-r-full border-2 border-l-0 border-white/70" />
      <div className="absolute right-1 top-1/2 h-1/3 w-[22%] -translate-y-1/2 rounded-l-full border-2 border-r-0 border-white/70" />
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[10px] font-black text-orange-900 shadow sm:text-xs">
        🏀 SÂN BÓNG RỔ
      </span>
      <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl">🏀</span>
      <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl">🏀</span>
    </div>

    <button
      type="button"
      onClick={onReturnToClassroom}
      className="pointer-events-auto absolute left-3 top-[13%] z-30 rounded-full border-2 border-emerald-700 bg-white/95 px-3 py-2 text-xs font-black text-emerald-900 shadow-lg transition hover:scale-105 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 sm:left-5 sm:px-4 sm:text-sm"
      title="Quay lại lớp học"
    >
      ← Về lớp học
    </button>
    <span className="absolute right-3 top-[13%] rounded-full bg-emerald-800/90 px-3 py-1 text-xs font-black text-white shadow sm:right-5 sm:text-sm">
      SÂN TRƯỜNG
    </span>
  </div>
);
