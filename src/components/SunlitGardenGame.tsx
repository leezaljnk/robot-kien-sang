import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RobotKienSang } from './RobotKienSang';
import { CustomCostumesMap, KienSangMood } from '../types';
import { playErrorSfx, playPickSfx, playSuccessSfx } from '../utils/audio';

type GardenMode = 'free' | 'challenge';

interface FallingTrash {
  id: number;
  x: number;
  y: number;
  speed: number;
  icon: string;
  name: string;
  wobble: number;
  isHazard: boolean;
  isBonus: boolean;
}

interface GardenFlower {
  id: number;
  x: number;
  height: number;
  size: number;
  icon: string;
}

interface FlyingFriend {
  id: number;
  icon: '🦋' | '🐦';
  left: number;
  top: number;
  delay: number;
  duration: number;
}

interface SunlitGardenGameProps {
  onReturnToClassroom: () => void;
  customMascotUrl?: string | null;
  customCostumes?: CustomCostumesMap;
  mascotScale?: number;
}

const TRASH = [
  { icon: '📄', name: 'tờ giấy' },
  { icon: '📦', name: 'vỏ hộp' },
  { icon: '🧴', name: 'chai nhựa' },
  { icon: '🥫', name: 'lon nước' },
  { icon: '🛍️', name: 'túi giấy' },
];

const CHALLENGE_GOAL = 10;
const CATCH_LINE = 78;
const MAX_MISSES = 5;
const FLOWER_ICONS = ['🌼', '🌷', '🌻', '🌸', '🌺', '🪻', '🌹', '🪷', '💐', '💮', '🏵️'];
const FLYING_FRIENDS: FlyingFriend[] = Array.from({ length: 5 }, (_, id) => ({
  id,
  icon: id < 3 ? '🦋' : '🐦',
  left: 8 + Math.random() * 84,
  top: 7 + Math.random() * 28,
  delay: Math.random() * -12,
  duration: 8 + Math.random() * 9,
}));
const BONUSES = [
  { icon: '🌱', name: 'hạt giống' },
  { icon: '💧', name: 'giọt nước' },
  { icon: '⭐', name: 'ngôi sao' },
];
const HAZARDS = [
  { icon: '🪨', name: 'hòn đá' },
  { icon: '🪵', name: 'cành cây' },
];

export const SunlitGardenGame: React.FC<SunlitGardenGameProps> = ({
  onReturnToClassroom,
  customMascotUrl,
  customCostumes,
  mascotScale,
}) => {
  const [mode, setMode] = useState<GardenMode>('free');
  const [started, setStarted] = useState(false);
  const [caught, setCaught] = useState(0);
  const [trash, setTrash] = useState<FallingTrash[]>([]);
  const [flowers, setFlowers] = useState<GardenFlower[]>([]);
  const [misses, setMisses] = useState(0);
  const [antX, setAntX] = useState(50);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [mood, setMood] = useState<KienSangMood>('idle');
  const [walkStepTick, setWalkStepTick] = useState(0);
  const [pointerDown, setPointerDown] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const pointerTargetXRef = useRef<number | null>(null);
  const [treeSizes] = useState(() =>
    Array.from({ length: 4 }, () => 112 + Math.floor(Math.random() * 48))
  );
  const areaRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef(trash);
  const antXRef = useRef(antX);
  const nextTrashId = useRef(0);
  const nextFlowerId = useRef(0);
  const caughtRef = useRef(caught);
  const missesRef = useRef(misses);
  const directionsRef = useRef(new Set<-1 | 1>());
  const slowUntilRef = useRef(0);
  const moodTimeoutRef = useRef<number | null>(null);
  const gameOver = misses >= MAX_MISSES;
  const completed = mode === 'challenge' && caught >= CHALLENGE_GOAL;
  const butterflyCount = Math.min(caught, 3);
  const birdCount = Math.min(Math.floor(caught / 3), 2);

  trashRef.current = trash;
  antXRef.current = antX;
  caughtRef.current = caught;
  missesRef.current = misses;

  const moveAnt = useCallback((direction: -1 | 1) => {
    const next = Math.max(8, Math.min(92, antXRef.current + direction * 10));
    pointerTargetXRef.current = next;
    setFacingDirection(direction < 0 ? 'left' : 'right');
    setIsMoving(true);
  }, []);

  const startGame = (selectedMode: GardenMode) => {
    playPickSfx();
    setMode(selectedMode);
    setCaught(0);
    caughtRef.current = 0;
    setMisses(0);
    missesRef.current = 0;
    setTrash([]);
    trashRef.current = [];
    setFlowers([]);
    setSlowMotion(false);
    slowUntilRef.current = 0;
    if (moodTimeoutRef.current !== null) window.clearTimeout(moodTimeoutRef.current);
    setMood('idle');
    setAntX(50);
    antXRef.current = 50;
    pointerTargetXRef.current = null;
    setFacingDirection('right');
    setWalkStepTick(0);
    directionsRef.current.clear();
    setStarted(true);
  };

  const moveAntToPointer = (clientX: number) => {
    const bounds = areaRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const next = Math.max(8, Math.min(92, ((clientX - bounds.left) / bounds.width) * 100));
    if (Math.abs(next - antXRef.current) > 0.1) {
      setFacingDirection(next < antXRef.current ? 'left' : 'right');
    }
    pointerTargetXRef.current = next;
  };

  useEffect(() => {
    if (!started || completed || gameOver) {
      setIsMoving(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault();
        pointerTargetXRef.current = null;
        directionsRef.current.add(-1);
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault();
        pointerTargetXRef.current = null;
        directionsRef.current.add(1);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') directionsRef.current.delete(-1);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') directionsRef.current.delete(1);
    };
    const handleWindowBlur = () => {
      directionsRef.current.clear();
      setPointerDown(false);
      pointerTargetXRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    let frame = 0;
    let previousTime = 0;
    let stepElapsed = 0;
    const moveFrame = (time: number) => {
      const hasKeyboardMovement = directionsRef.current.size > 0;
      const elapsedMs = previousTime > 0 ? time - previousTime : 0;
      let nextX = antXRef.current;
      if (elapsedMs > 0 && hasKeyboardMovement) {
        const direction = directionsRef.current.has(-1) && directionsRef.current.has(1)
          ? 0
          : directionsRef.current.has(-1) ? -1 : 1;
        nextX = Math.max(8, Math.min(92, antXRef.current + direction * elapsedMs * 0.018));
        if (direction !== 0) setFacingDirection(direction < 0 ? 'left' : 'right');
      } else if (elapsedMs > 0 && pointerTargetXRef.current !== null) {
        const delta = pointerTargetXRef.current - antXRef.current;
        const distance = Math.min(Math.abs(delta), elapsedMs * 0.018);
        nextX = antXRef.current + Math.sign(delta) * distance;
        if (distance === Math.abs(delta)) {
          pointerTargetXRef.current = null;
        }
      }
      if (nextX !== antXRef.current) {
        antXRef.current = nextX;
        setAntX(nextX);
      }
      const isAntMoving = hasKeyboardMovement ||
        (pointerTargetXRef.current !== null && Math.abs(pointerTargetXRef.current - antXRef.current) > 0.15);
      setIsMoving(isAntMoving);
      if (isAntMoving && previousTime > 0) {
        stepElapsed += time - previousTime;
        if (stepElapsed >= 75) {
          setWalkStepTick((current) => current + 1);
          stepElapsed %= 75;
        }
      } else {
        stepElapsed = 0;
      }
      previousTime = time;
      frame = window.requestAnimationFrame(moveFrame);
    };
    frame = window.requestAnimationFrame(moveFrame);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.cancelAnimationFrame(frame);
      directionsRef.current.clear();
    };
  }, [completed, gameOver, started]);

  useEffect(() => {
    if (!started || completed || gameOver) return;

    const spawn = window.setInterval(() => {
      const roll = Math.random();
      const isHazard = roll < 0.3;
      const isBonus = roll >= 0.9;
      const piece = isHazard
        ? HAZARDS[Math.floor(Math.random() * HAZARDS.length)]
        : isBonus
          ? BONUSES[Math.floor(Math.random() * BONUSES.length)]
          : TRASH[Math.floor(Math.random() * TRASH.length)];
      const next: FallingTrash = {
        ...piece,
        id: nextTrashId.current++,
        x: 10 + Math.random() * 80,
        y: -8,
        speed: 14 + Math.random() * 4,
        wobble: Math.random() * Math.PI * 2,
        isHazard,
        isBonus,
      };
      trashRef.current = [...trashRef.current, next];
      setTrash(trashRef.current);
    }, mode === 'challenge' ? 1650 : 2100);

    let previousTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      let caughtNow = 0;
      let missesNow = 0;
      let bonusesNow = 0;
      const next = trashRef.current.flatMap((piece) => {
        const slowFactor = now < slowUntilRef.current ? 0.5 : 1;
        const y = piece.y + piece.speed * slowFactor * deltaSeconds;
        const crossedAnt = piece.y < CATCH_LINE && y >= CATCH_LINE;
        if (crossedAnt && Math.abs(piece.x - antXRef.current) < 7) {
          if (piece.isHazard) missesNow += 1;
          else if (piece.isBonus) bonusesNow += 1;
          else caughtNow += 1;
          return [];
        }
        if (y > 102) return [];
        return [{ ...piece, y }];
      });
      trashRef.current = next;
      setTrash(next);

      if (caughtNow > 0) {
        const total = caughtRef.current + caughtNow;
        caughtRef.current = total;
        setCaught(total);
        const newFlowers = Array.from({ length: caughtNow * 4 }, () => ({
          id: nextFlowerId.current++,
          x: 5 + Math.random() * 90,
          height: 48 + Math.floor(Math.random() * 58),
          size: 24 + Math.floor(Math.random() * 16),
          icon: FLOWER_ICONS[Math.floor(Math.random() * FLOWER_ICONS.length)],
        }));
        setFlowers((current) => [...current, ...newFlowers].slice(-80));
        setMood('happy');
        playSuccessSfx();
        setMood('happy');
        if (moodTimeoutRef.current !== null) window.clearTimeout(moodTimeoutRef.current);
        moodTimeoutRef.current = window.setTimeout(
          () => setMood((current) => current === 'happy' ? 'idle' : current),
          650
        );
      }
      if (bonusesNow > 0) {
        slowUntilRef.current = now + 5000;
        setSlowMotion(true);
        window.setTimeout(() => {
          if (performance.now() >= slowUntilRef.current) setSlowMotion(false);
        }, 5100);
        playSuccessSfx();
        setFlowers((current) => [
          ...current,
          ...Array.from({ length: bonusesNow * 4 }, () => ({
            id: nextFlowerId.current++,
            x: 5 + Math.random() * 90,
            height: 48 + Math.floor(Math.random() * 58),
            size: 24 + Math.floor(Math.random() * 16),
            icon: FLOWER_ICONS[Math.floor(Math.random() * FLOWER_ICONS.length)],
          })),
        ].slice(-80));
      }
      if (missesNow > 0) {
        const total = Math.min(MAX_MISSES, missesRef.current + missesNow);
        missesRef.current = total;
        setMisses(total);
        playErrorSfx();
        setMood('sad');
        if (moodTimeoutRef.current !== null) window.clearTimeout(moodTimeoutRef.current);
        moodTimeoutRef.current = window.setTimeout(
          () => setMood((current) => current === 'sad' ? 'idle' : current),
          900
        );
      }
      animationFrame = window.requestAnimationFrame(animate);
    };
    let animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.clearInterval(spawn);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [completed, gameOver, mode, started]);

  return (
    <div
      ref={areaRef}
      className="absolute inset-0 z-40 touch-none select-none overflow-hidden bg-gradient-to-b from-sky-300 via-amber-50 to-lime-300"
      onPointerDown={(event) => {
        if (started && !(event.target as HTMLElement).closest('button')) {
          directionsRef.current.clear();
          setPointerDown(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          moveAntToPointer(event.clientX);
          setIsMoving(true);
        }
      }}
      onPointerMove={(event) => {
        if (pointerDown) moveAntToPointer(event.clientX);
      }}
      onPointerUp={() => {
        setPointerDown(false);
      }}
      onPointerCancel={() => {
        setPointerDown(false);
      }}
    >
      <style>{`
        @keyframes garden-fly {
          0% { transform: translate3d(-18px, 8px, 0) rotate(-8deg); }
          25% { transform: translate3d(24px, -14px, 0) rotate(7deg); }
          50% { transform: translate3d(52px, 5px, 0) rotate(-4deg); }
          75% { transform: translate3d(20px, 17px, 0) rotate(8deg); }
          100% { transform: translate3d(-18px, 8px, 0) rotate(-8deg); }
        }
        @keyframes sun-ray-shimmer {
          0%, 100% { opacity: .48; transform: scale(.92) rotate(0deg); }
          50% { opacity: .9; transform: scale(1.08) rotate(8deg); }
        }
        @keyframes sun-sparkle {
          0%, 100% { opacity: .3; transform: scale(.65) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(35deg); }
        }
      `}</style>
      <div className="absolute inset-x-0 top-[54%] h-[46%] bg-gradient-to-b from-lime-300 via-green-400 to-green-600" />
      {[4, 24, 76, 92].map((left, index) => (
        <div
          key={left}
          className="absolute z-[1] leading-none"
          style={{ left: `${left}%`, bottom: '46%', fontSize: `${treeSizes[index]}px` }}
          aria-hidden="true"
        >
          🌳
        </div>
      ))}
      <div className="absolute right-[12%] top-[5%] z-[2] h-28 w-28 sm:right-[16%] sm:top-[4%] sm:h-40 sm:w-40" aria-label="Mặt trời tỏa nắng">
        <span
          className="absolute inset-0 rounded-full bg-amber-300/40 blur-xl"
          style={{ animation: 'sun-ray-shimmer 3s ease-in-out infinite' }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
          <g
            style={{ transformOrigin: '60px 60px', animation: 'sun-ray-shimmer 5s ease-in-out infinite' }}
            stroke="#F59E0B"
            strokeWidth="5"
            strokeLinecap="round"
          >
            {Array.from({ length: 12 }, (_, ray) => (
              <line key={ray} x1="60" y1="7" x2="60" y2="18" transform={`rotate(${ray * 30} 60 60)`} />
            ))}
          </g>
          <circle cx="60" cy="60" r="37" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="47" cy="56" r="3" fill="#92400E" />
          <circle cx="73" cy="56" r="3" fill="#92400E" />
          <path d="M 47 70 Q 60 82 73 70" fill="none" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        {[[8, 18], [83, 15], [11, 79], [79, 83]].map(([left, top], index) => (
          <span
            key={index}
            className="absolute text-xl text-yellow-100 sm:text-2xl"
            style={{ left: `${left}%`, top: `${top}%`, animation: `sun-sparkle ${1.2 + index * 0.25}s ease-in-out ${index * 0.2}s infinite` }}
            aria-hidden="true"
          >✦</span>
        ))}
      </div>
      <div className="absolute left-[17%] top-[8%] text-4xl opacity-80" aria-hidden="true">☁️</div>
      <div className="absolute right-[35%] top-[18%] text-3xl opacity-70" aria-hidden="true">☁️</div>
      {FLYING_FRIENDS.filter((friend) => friend.icon === '🦋')
        .slice(0, butterflyCount)
        .concat(
          FLYING_FRIENDS.filter((friend) => friend.icon === '🐦').slice(0, birdCount)
        )
        .map((friend) => (
        <span
          key={friend.id}
          className="pointer-events-none absolute z-[3] text-2xl sm:text-3xl"
          style={{
            left: `${friend.left}%`,
            top: `${friend.top}%`,
            animation: `garden-fly ${friend.duration}s ease-in-out ${friend.delay}s infinite`,
          }}
          aria-label={friend.icon === '🐦' ? 'Chim đang bay lượn trên trời' : 'Bướm đang bay lượn trên trời'}
        >
          {friend.icon}
        </span>
      ))}
      <div className="absolute bottom-[14%] left-[3%] z-[2] flex flex-col items-center" aria-label="Bạn kiến đang cổ vũ bên tổ">
        <span className="animate-bounce text-3xl" aria-hidden="true">🐜👏</span>
        <span className="text-3xl" aria-hidden="true">🪹</span>
      </div>
      {caught >= 3 && <span className="absolute bottom-[31%] left-[22%] z-[2] animate-bounce text-3xl" aria-label="Bướm trở lại khu vườn">🦋</span>}
      {caught >= 6 && <span className="absolute bottom-[37%] right-[20%] z-[2] animate-pulse text-3xl" aria-label="Chim trở lại khu vườn">🐦</span>}

      <button
        type="button"
        onClick={onReturnToClassroom}
        className="absolute left-3 top-3 z-30 rounded-full border-2 border-emerald-700 bg-white/95 px-4 py-2 text-sm font-black text-emerald-900 shadow-lg hover:bg-emerald-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
      >
        ← Về lớp học
      </button>
      <div className="absolute right-3 top-3 z-20 rounded-full bg-emerald-800/90 px-4 py-2 text-sm font-black text-white shadow">
        KHU VƯỜN NẮNG ẤM
      </div>

      <div className="absolute left-1/2 top-16 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-3 text-center shadow-lg">
        <p className="text-sm font-black text-emerald-900 sm:text-base">
          {mode === 'challenge' ? `Thử thách: ${Math.min(caught, CHALLENGE_GOAL)}/${CHALLENGE_GOAL} món rác` : 'Cùng Kiến Sáng giữ vườn sạch nhé!'}
        </p>
        <p className="text-xs font-semibold text-emerald-800 sm:text-sm">
          {started ? slowMotion ? '✨ Phần thưởng! Rác đang rơi chậm lại' : '← → Hứng rác, né đá và cành cây!' : 'Chọn cách chơi để bắt đầu'}
        </p>
        {started && <div className="flex gap-2">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => startGame('free')}
            aria-pressed={mode === 'free'}
            className={`rounded-full px-3 py-1 text-xs font-black ${mode === 'free' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-900'}`}
          >Chơi tự do</button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => startGame('challenge')}
            aria-pressed={mode === 'challenge'}
            className={`rounded-full px-3 py-1 text-xs font-black ${mode === 'challenge' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-900'}`}
          >Thử thách</button>
        </div>}
      </div>

      <div className="absolute bottom-[12%] left-0 right-0 h-1 bg-white/50" />
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className="absolute z-[1] flex flex-col items-center justify-end"
          style={{ left: `${flower.x}%`, bottom: '12%', height: `${flower.height}px` }}
          aria-label="Hoa đã nở"
        >
          <span className="leading-none" style={{ fontSize: `${flower.size}px` }}>{flower.icon}</span>
          <span className="h-full w-1 rounded-full bg-green-800" />
          <span className="absolute bottom-1/4 h-1.5 w-3 -translate-x-1 rounded-full bg-green-700" />
          <span className="absolute bottom-1/2 h-1.5 w-3 translate-x-1 rounded-full bg-green-700" />
        </div>
      ))}
      {started && <div className="absolute left-1/2 top-[36%] z-10 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-sm font-black text-red-700 shadow">
        {Array.from({ length: MAX_MISSES }, (_, index) => (
          <span key={index} className="mx-0.5">{index < misses ? '🖤' : '❤️'}</span>
        ))}
      </div>}
      {trash.map((piece) => (
        <span
          key={piece.id}
          title={piece.name}
          className={`absolute z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-3xl shadow-md sm:h-14 sm:w-14 sm:text-4xl ${piece.isHazard ? 'border-red-500 bg-red-100/95' : piece.isBonus ? 'border-yellow-400 bg-yellow-100/95' : 'border-white/90 bg-white/90'}`}
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `translate(calc(-50% + ${Math.sin(piece.y / 5 + piece.wobble) * (piece.isHazard ? 1 : 8)}px), -50%) rotate(${piece.icon === '📄' || piece.icon === '🛍️' ? Math.sin(piece.y / 6 + piece.wobble) * 18 : piece.icon === '📦' ? Math.sin(piece.y / 5 + piece.wobble) * 8 : 0}deg)`,
          }}
          aria-label={piece.isHazard ? `Vật cản: ${piece.name}` : piece.isBonus ? `Vật phẩm thưởng: ${piece.name}` : piece.name}
        >
          {piece.isHazard ? '⚠️' : piece.icon}
          {piece.isHazard && <span className="absolute -bottom-2 text-xl">{piece.icon}</span>}
        </span>
      ))}

      {started && (
        <>
          <div className="pointer-events-none absolute bottom-[6%] left-0 right-0 flex justify-center">
            <div className="relative h-24 w-full">
              <RobotKienSang
                mood={mood}
                speechText=""
                xPercent={antX}
                yPercent={100}
                isMoving={isMoving}
                walkStepTick={walkStepTick}
                facingDirection={facingDirection}
                customMascotUrl={customMascotUrl}
                customCostumes={customCostumes}
                mascotScale={mascotScale}
              />
            </div>
          </div>
          <span
            className="pointer-events-none absolute z-30 text-2xl"
            style={{ left: `${Math.min(90, antX + 5)}%`, bottom: '8%' }}
            aria-label="Giỏ đựng rác của Kiến Sáng"
          >🧺</span>
          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-4">
            <button
              type="button"
              aria-label="Di chuyển Kiến Sáng sang trái"
              onPointerDown={(event) => {
                event.stopPropagation();
                pointerTargetXRef.current = null;
                directionsRef.current.add(-1);
              }}
              onPointerUp={() => directionsRef.current.delete(-1)}
              onPointerLeave={() => directionsRef.current.delete(-1)}
              onClick={(event) => {
                if (event.detail === 0) moveAnt(-1);
              }}
              className="h-14 w-16 rounded-2xl border-2 border-emerald-700 bg-white/95 text-3xl font-black text-emerald-900 shadow-lg active:scale-95"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Di chuyển Kiến Sáng sang phải"
              onPointerDown={(event) => {
                event.stopPropagation();
                pointerTargetXRef.current = null;
                directionsRef.current.add(1);
              }}
              onPointerUp={() => directionsRef.current.delete(1)}
              onPointerLeave={() => directionsRef.current.delete(1)}
              onClick={(event) => {
                if (event.detail === 0) moveAnt(1);
              }}
              className="h-14 w-16 rounded-2xl border-2 border-emerald-700 bg-white/95 text-3xl font-black text-emerald-900 shadow-lg active:scale-95"
            >
              →
            </button>
          </div>
        </>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4">
          <div className="max-w-md rounded-3xl border-4 border-white bg-amber-50 p-8 text-center shadow-2xl">
            <div className="text-6xl" aria-hidden="true">🌱🐜</div>
            <h2 className="mt-3 text-2xl font-black text-emerald-900">Nghỉ một chút nhé!</h2>
            <p className="mt-2 font-semibold text-slate-700">Lần sau mình nhớ né đá và cành cây nha.</p>
            <button
              type="button"
              onClick={() => startGame(mode)}
              className="mt-5 rounded-full bg-emerald-600 px-6 py-3 font-black text-white shadow hover:bg-emerald-700"
            >
              Chơi lại
            </button>
          </div>
        </div>
      )}

      {!started && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-sky-900/20 p-4">
          <div className="w-full max-w-lg rounded-3xl border-4 border-white bg-amber-50 p-6 text-center shadow-2xl sm:p-8">
            <div className="mb-2 text-5xl" aria-hidden="true">🐜🌼</div>
            <h1 className="text-2xl font-black text-emerald-900 sm:text-3xl">Kiến Sáng bảo vệ khu vườn</h1>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700 sm:text-base">
              Dùng phím mũi tên, các nút điều khiển hoặc kéo chuột/chạm và di chuyển Kiến Sáng sang trái/phải để đón rác.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => startGame('free')}
                className="rounded-2xl border-2 border-emerald-700 bg-emerald-600 px-4 py-4 text-left text-white shadow-md transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
              >
                <span className="block text-lg font-black">🌱 Chơi tự do</span>
                <span className="mt-1 block text-sm font-semibold">Đón rác và ngắm vườn xanh lên</span>
              </button>
              <button
                type="button"
                onClick={() => startGame('challenge')}
                className="rounded-2xl border-2 border-orange-700 bg-orange-500 px-4 py-4 text-left text-white shadow-md transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
              >
                <span className="block text-lg font-black">🌟 Thử thách dọn vườn</span>
                <span className="mt-1 block text-sm font-semibold">Đón đủ {CHALLENGE_GOAL} món rác để nhận huy hiệu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {completed && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4">
          <div className="max-w-md rounded-3xl border-4 border-white bg-amber-50 p-8 text-center shadow-2xl">
            <div className="text-6xl" aria-hidden="true">🏅🌷🌼</div>
            <h2 className="mt-3 text-2xl font-black text-emerald-900">Tuyệt vời, bạn nhỏ!</h2>
            <p className="mt-2 font-semibold text-slate-700">Khu vườn đã sạch hơn nhờ có bạn và Kiến Sáng.</p>
            <button
              type="button"
              onClick={() => startGame('challenge')}
              className="mt-5 rounded-full bg-emerald-600 px-6 py-3 font-black text-white shadow hover:bg-emerald-700"
            >
              Chơi lại thử thách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
