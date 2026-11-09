import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Check, Hand, Leaf, PartyPopper, RotateCcw, Sparkles, Timer } from 'lucide-react';
import {
  createSortingGameRounds,
  evaluateSortingGameChoices,
  sortingGameImageUrl,
  type SortingGameRound,
} from '../data/sortingGame';
import { playCountdownSfx, playErrorSfx, playSuccessSfx, playVictoryFanfare } from '../utils/audio';
import { type TriggerSpeech } from '../data/voicePrompts';
import './ReuseSortingGame.css';

const ROUND_DURATION_SECONDS = 60;

interface ReuseSortingGameProps {
  onExit: () => void;
  triggerSpeech: TriggerSpeech;
}

interface Point {
  x: number;
  y: number;
}

interface BoardGeometry {
  width: number;
  height: number;
  source: Point | null;
  sourceEdges: Record<string, Point>;
  choices: Record<string, Point>;
  choiceEdges: Record<string, Point>;
}

interface ActiveArrow {
  pointerId: number;
  point: Point;
}

const getContainedImageBounds = (image: HTMLImageElement) => {
  const bounds = image.getBoundingClientRect();
  const naturalWidth = image.naturalWidth || bounds.width;
  const naturalHeight = image.naturalHeight || bounds.height;
  const scale = Math.min(bounds.width / naturalWidth, bounds.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    left: bounds.left + (bounds.width - width) / 2,
    top: bounds.top + (bounds.height - height) / 2,
    width,
    height,
  };
};

type GamePhase = 'intro' | 'playing' | 'complete';

export const ReuseSortingGame: React.FC<ReuseSortingGameProps> = ({ onExit, triggerSpeech }) => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [rounds, setRounds] = useState<SortingGameRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmedCorrectIds, setConfirmedCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [roundComplete, setRoundComplete] = useState(false);
  const [sourceSelected, setSourceSelected] = useState(false);
  const [roundCount, setRoundCount] = useState(5);
  const [secondsRemaining, setSecondsRemaining] = useState(ROUND_DURATION_SECONDS);
  const [activeArrow, setActiveArrow] = useState<ActiveArrow | null>(null);
  const [geometry, setGeometry] = useState<BoardGeometry>({
    width: 0,
    height: 0,
    source: null,
    sourceEdges: {},
    choices: {},
    choiceEdges: {},
  });
  const boardRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLButtonElement>(null);
  const choiceRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeArrowRef = useRef<ActiveArrow | null>(null);
  const lastInteractionAtRef = useRef(Date.now());
  const idleHintShownRef = useRef(false);
  const currentRound = rounds[roundIndex];

  const showFeedback = useCallback((text: string, voiceId: string) => {
    setFeedback(text);
    triggerSpeech(text, voiceId);
  }, [triggerSpeech]);

  const registerActivity = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
    idleHintShownRef.current = false;
  }, []);

  useEffect(() => {
    if (phase === 'intro') {
      triggerSpeech('Mỗi lượt có một món đồ và sáu bức tranh. Bé hãy tìm ba ý tưởng phù hợp nhé.', 'sorting_intro');
    } else if (phase === 'complete') {
      triggerSpeech('Bé giỏi quá! Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé!', 'sorting_victory');
    }
  }, [phase, triggerSpeech]);

  useEffect(() => {
    if (phase !== 'playing' || roundComplete) return;
    const deadline = Date.now() + ROUND_DURATION_SECONDS * 1000;
    let hasAlerted = false;
    setSecondsRemaining(ROUND_DURATION_SECONDS);
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0 && !hasAlerted) {
        hasAlerted = true;
        playCountdownSfx();
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [phase, roundComplete, roundIndex]);

  useEffect(() => {
    if (phase !== 'complete') return;
    playVictoryFanfare();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bursts = [
      window.setTimeout(() => confetti({ particleCount: 90, spread: 75, origin: { y: 0.62 } }), 0),
      window.setTimeout(() => confetti({ particleCount: 65, spread: 110, origin: { y: 0.55 } }), 350),
    ];
    return () => bursts.forEach(window.clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || roundComplete) return;
    const interval = window.setInterval(() => {
      if (idleHintShownRef.current || Date.now() - lastInteractionAtRef.current < 25000) return;
      idleHintShownRef.current = true;
      showFeedback('Bé hãy nối một hay nhiều hình rồi kiểm tra nhé!', 'sorting_continue');
    }, 2000);
    return () => window.clearInterval(interval);
  }, [phase, roundComplete, showFeedback]);

  const measureConnections = useCallback(() => {
    const board = boardRef.current;
    const source = sourceRef.current;
    if (!board || !source) return;
    const bounds = board.getBoundingClientRect();
    const sourceImage = source.querySelector('img');
    const sourceBounds = sourceImage
      ? getContainedImageBounds(sourceImage)
      : source.getBoundingClientRect();
    const sourceCenter = {
      x: sourceBounds.left - bounds.left + sourceBounds.width / 2,
      y: sourceBounds.top - bounds.top + sourceBounds.height / 2,
    };
    const sourceEdges: Record<string, Point> = {};
    const choices: Record<string, Point> = {};
    const choiceEdges: Record<string, Point> = {};
    choiceRefs.current.forEach((element, id) => {
      const image = element.querySelector('img');
      if (!image) return;
      const imageBounds = getContainedImageBounds(image);
      const center = {
        x: imageBounds.left - bounds.left + imageBounds.width / 2,
        y: imageBounds.top - bounds.top + imageBounds.height / 2,
      };
      choices[id] = {
        ...center,
      };
      const dx = center.x - sourceCenter.x;
      const dy = center.y - sourceCenter.y;
      const edgeRatio = (width: number, height: number) => {
        const horizontalRatio = Math.abs(dx) > 0 ? width / 2 / Math.abs(dx) : Number.POSITIVE_INFINITY;
        const verticalRatio = Math.abs(dy) > 0 ? height / 2 / Math.abs(dy) : Number.POSITIVE_INFINITY;
        return Math.min(horizontalRatio, verticalRatio);
      };
      const targetEdgeRatio = edgeRatio(imageBounds.width, imageBounds.height);
      const sourceEdgeRatio = edgeRatio(sourceBounds.width, sourceBounds.height);
      sourceEdges[id] = {
        x: sourceCenter.x + dx * sourceEdgeRatio,
        y: sourceCenter.y + dy * sourceEdgeRatio,
      };
      choiceEdges[id] = {
        x: center.x - dx * targetEdgeRatio,
        y: center.y - dy * targetEdgeRatio,
      };
    });
    setGeometry({
      width: bounds.width,
      height: bounds.height,
      source: sourceCenter,
      sourceEdges,
      choices,
      choiceEdges,
    });
  }, []);

  const toggleChoice = useCallback((id: string) => {
    if (roundComplete || confirmedCorrectIds.includes(id)) return;
    registerActivity();
    if (selectedIds.includes(id)) {
      const nextSelected = selectedIds.filter((selectedId) => selectedId !== id);
      const nextWrong = wrongIds.filter((wrongId) => wrongId !== id);
      setSelectedIds(nextSelected);
      setWrongIds(nextWrong);
      showFeedback('Đã gỡ lựa chọn. Bé có thể nối hình khác rồi kiểm tra nhé!', 'sorting_removed');
      return;
    }
    setSelectedIds([...selectedIds, id]);
    setWrongIds(wrongIds.filter((wrongId) => wrongId !== id));
    showFeedback('Đã nối hình. Bé có thể chọn thêm rồi bấm Kiểm tra.', 'sorting_connected');
  }, [roundComplete, confirmedCorrectIds, selectedIds, wrongIds, showFeedback, registerActivity]);

  const toggleChoiceRef = useRef(toggleChoice);

  useEffect(() => {
    toggleChoiceRef.current = toggleChoice;
  }, [toggleChoice]);

  useLayoutEffect(() => {
    if (phase !== 'playing') return;
    measureConnections();
    const board = boardRef.current;
    const observer = board && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measureConnections)
      : null;
    if (board) observer?.observe(board);
    window.addEventListener('resize', measureConnections);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measureConnections);
    };
  }, [phase, roundIndex, rounds, measureConnections]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const onPointerMove = (event: PointerEvent) => {
      const active = activeArrowRef.current;
      if (!active || event.pointerId !== active.pointerId) return;
      registerActivity();
      const bounds = boardRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const nextArrow = {
        pointerId: event.pointerId,
        point: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      };
      activeArrowRef.current = nextArrow;
      setActiveArrow(nextArrow);
    };
    const onPointerUp = (event: PointerEvent) => {
      const active = activeArrowRef.current;
      if (!active || event.pointerId !== active.pointerId) return;
      const choice = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-choice-id]');
      if (choice?.dataset.choiceId) toggleChoiceRef.current(choice.dataset.choiceId);
      activeArrowRef.current = null;
      setActiveArrow(null);
    };
    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== activeArrowRef.current?.pointerId) return;
      activeArrowRef.current = null;
      setActiveArrow(null);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [phase, registerActivity]);

  useEffect(() => {
    if (!roundComplete) return;
    const timeout = window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) {
        setPhase('complete');
        return;
      }
      setRoundIndex((index) => index + 1);
      setSelectedIds([]);
      setConfirmedCorrectIds([]);
      setWrongIds([]);
      setRoundComplete(false);
      setSourceSelected(false);
      activeArrowRef.current = null;
      setActiveArrow(null);
      showFeedback('Bé hãy nối một hay nhiều hình rồi kiểm tra nhé!', 'sorting_continue');
    }, 4500);
    return () => window.clearTimeout(timeout);
  }, [roundComplete, roundIndex, rounds.length, showFeedback]);

  const startGame = () => {
    setRounds(createSortingGameRounds(Math.random, roundCount));
    setRoundIndex(0);
    setSelectedIds([]);
    setConfirmedCorrectIds([]);
    setWrongIds([]);
    setRoundComplete(false);
    setSourceSelected(false);
    activeArrowRef.current = null;
    setActiveArrow(null);
    registerActivity();
    showFeedback('Kéo từ món rác đến hình phù hợp, hoặc chạm vào hình để nối.', 'sorting_start');
    setPhase('playing');
  };

  const checkAnswers = () => {
    if (!currentRound || roundComplete) return;
    registerActivity();
    if (selectedIds.length === 0) {
      showFeedback('Bé hãy nối một hay nhiều hình phù hợp trước nhé!', 'sorting_select');
      return;
    }
    const { correctIds, wrongIds: nextWrongIds, isComplete } =
      evaluateSortingGameChoices(currentRound, selectedIds);
    setConfirmedCorrectIds(correctIds);
    setWrongIds(nextWrongIds);

    if (nextWrongIds.length > 0) {
      playErrorSfx();
      showFeedback('Bé thử gỡ đường nối có dấu X rồi kiểm tra lại nhé!', 'sorting_retry');
      return;
    }
    playSuccessSfx();
    if (isComplete) {
      setRoundComplete(true);
      showFeedback('Bé giỏi lắm! Cả ba ý tưởng phù hợp đã được tìm thấy.', 'sorting_round_complete');
      return;
    }
    showFeedback('Tốt lắm! Còn ý tưởng phù hợp nữa, bé tìm tiếp nhé!', 'sorting_more');
  };

  const productStatus = (id: string) => {
    if (confirmedCorrectIds.includes(id)) return 'correct';
    if (wrongIds.includes(id)) return 'wrong';
    if (selectedIds.includes(id)) return 'selected';
    return 'idle';
  };

  return (
    <main className="reuse-sorting-game fixed inset-0 z-[70] overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#fff7d6_0%,_#e0f2fe_55%,_#dcfce7_100%)] text-slate-900">
      <div className="reuse-sorting-decor reuse-sorting-decor--one" aria-hidden="true">🌼</div>
      <div className="reuse-sorting-decor reuse-sorting-decor--two" aria-hidden="true">🍃</div>
      <div className="reuse-sorting-decor reuse-sorting-decor--three" aria-hidden="true">🐞</div>
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col px-3 py-3 sm:px-6 sm:py-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 shadow-lg backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-sky-200 bg-white px-3 text-sm font-black text-sky-900 shadow-sm transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              aria-label="Quay lại màn chơi chính"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Màn chơi chính</span>
              <span className="sm:hidden">Quay lại</span>
            </button>
            <div>
              <p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                <Leaf className="h-3.5 w-3.5" />
                Góc sáng tạo xanh
              </p>
              <h1 className="text-base font-black leading-tight text-slate-900 sm:text-xl">
                Thử tài phân loại rác
              </h1>
            </div>
          </div>
          {phase === 'playing' && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-black tabular-nums ${secondsRemaining === 0 ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}
                aria-label={secondsRemaining === 0 ? 'Đồng hồ đã hết, bé vẫn có thể chơi tiếp' : `Còn ${secondsRemaining} giây, không giới hạn lượt chơi`}
              >
                <Timer className="h-4 w-4" aria-hidden="true" />
                {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, '0')}
              </div>
              <span className="rounded-full border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900" aria-label={`Lượt ${roundIndex + 1} trên ${rounds.length}`}>
                Lượt {roundIndex + 1}/{rounds.length}
              </span>
            </div>
          )}
        </header>

        {phase === 'intro' && (
          <section className="mx-auto my-auto grid w-full max-w-5xl gap-5 rounded-3xl border-4 border-white bg-white/90 p-5 shadow-2xl sm:gap-7 sm:p-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-black text-emerald-900">
                <Sparkles className="h-4 w-4" />
                Cùng nghĩ cách dùng lại đồ cũ
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
                Món đồ cũ, ý tưởng mới!
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                Mỗi lượt có một món đồ và sáu bức tranh. Bé hãy tìm ba ý tưởng phù hợp nhé.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="reuse-step-card reuse-step-card--blue">
                  <span className="reuse-step-icon"><Hand aria-hidden="true" /></span>
                  <span className="reuse-step-number">Bước 1</span>
                  <p>Chọn món đồ cũ...</p>
                </article>
                <article className="reuse-step-card reuse-step-card--green">
                  <span className="reuse-step-icon"><ArrowRight aria-hidden="true" /></span>
                  <span className="reuse-step-number">Bước 2</span>
                  <p>...nối cách dùng mới phù hợp!</p>
                </article>
                <article className="reuse-step-card reuse-step-card--orange">
                  <span className="reuse-step-icon"><Check aria-hidden="true" /></span>
                  <span className="reuse-step-number">Bước 3</span>
                  <p>Kiểm tra và sửa nếu cần!</p>
                </article>
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/80 p-5 text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="reuse-mascot reuse-mascot--idle" aria-hidden="true">🤖</div>
                <div className="reuse-speech-bubble">
                  Bé ơi, cùng nghĩ xem món đồ cũ này có thể dùng thành gì nhé!
                </div>
              </div>
              <p className="text-sm font-bold leading-relaxed text-emerald-950">
                Không bị trừ điểm khi thử lại. Đồng hồ chỉ nhắc vui; hết giờ bé vẫn tiếp tục chơi nhé!
              </p>
              <label htmlFor="reuse-round-count" className="mt-4 text-sm font-extrabold text-emerald-950">
                Chọn số lượt chơi
              </label>
              <select
                id="reuse-round-count"
                value={roundCount}
                onChange={(event) => setRoundCount(Number(event.target.value))}
                className="mx-auto mt-1 min-h-11 w-full max-w-xs rounded-xl border-2 border-emerald-200 bg-white px-3 text-center font-black text-emerald-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                {[3, 5, 7, 10].map((count) => (
                  <option key={count} value={count}>{count} lượt</option>
                ))}
              </select>
              <button
                type="button"
                onClick={startGame}
                className="reuse-start-button mt-5 min-h-16 rounded-full px-7 py-3 text-xl font-black text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <Sparkles className="mr-2 inline h-5 w-5" aria-hidden="true" />
                Bắt đầu thử tài
              </button>
            </div>
          </section>
        )}

        {phase === 'playing' && currentRound && (
          <section className="my-auto w-full py-4">
            <div className="reuse-growth-progress mb-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm" role="progressbar" aria-label="Hành trình nảy mầm" aria-valuemin={0} aria-valuemax={rounds.length} aria-valuenow={roundComplete ? roundIndex + 1 : roundIndex}>
              <div className="mb-2 flex items-center justify-between gap-2 text-sm font-black text-emerald-900">
                <span>Hành trình nảy mầm</span>
                <span>{roundComplete ? roundIndex + 1 : roundIndex}/{rounds.length} lượt đã xong</span>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-2 right-2 top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-[width] duration-700"
                    style={{ width: `${((roundComplete ? roundIndex + 1 : roundIndex) / rounds.length) * 100}%` }}
                  />
                </div>
                {rounds.map((round, index) => {
                  const done = index < roundIndex || (index === roundIndex && roundComplete);
                  return (
                    <span
                      key={round.waste.id}
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-base ${done ? 'border-amber-300 bg-amber-100' : index === roundIndex ? 'reuse-progress-current border-emerald-400 bg-white' : 'border-emerald-100 bg-white'}`}
                      aria-hidden="true"
                    >
                      {done ? '🌼' : index === roundIndex ? '🌱' : '·'}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 sm:text-2xl">
                  Từ món đồ này, bé có thể tạo ra gì?
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Chọn những ý tưởng bé thấy phù hợp, rồi bấm Kiểm tra.
                </p>
              </div>
            </div>

            <div
              ref={boardRef}
              className="relative isolate mx-auto grid aspect-square w-full max-w-5xl grid-cols-3 grid-rows-3 overflow-hidden sm:aspect-[1.6/1]"
            >
              {(geometry.source || activeArrow) && (
                <svg
                  className="pointer-events-none absolute inset-0 z-20 h-full w-full"
                  viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {selectedIds.map((id) => {
                    const target = geometry.choices[id];
                    const endpoint = geometry.choiceEdges[id];
                    const start = geometry.sourceEdges[id];
                    if (!target || !endpoint || !start) return null;
                    const status = productStatus(id);
                    const color = status === 'correct' ? '#15803d' : status === 'wrong' ? '#dc2626' : '#64748b';
                    const deltaX = endpoint.x - start.x;
                    const deltaY = endpoint.y - start.y;
                    const distance = Math.hypot(deltaX, deltaY) || 1;
                    const controlOffset = distance * 0.3;
                    const curveOffset = Math.min(55, distance * 0.12);
                    const control1 = {
                      x: start.x + deltaX * 0.3 - (deltaY / distance) * curveOffset,
                      y: start.y + deltaY * 0.3 + (deltaX / distance) * curveOffset,
                    };
                    const control2 = {
                      x: start.x + deltaX * 0.7,
                      y: start.y + deltaY * 0.7,
                    };
                    const markerT = 0.78;
                    const inverseMarkerT = 1 - markerT;
                    const markerPoint = {
                      x: inverseMarkerT ** 3 * start.x
                        + 3 * inverseMarkerT ** 2 * markerT * control1.x
                        + 3 * inverseMarkerT * markerT ** 2 * control2.x
                        + markerT ** 3 * endpoint.x,
                      y: inverseMarkerT ** 3 * start.y
                        + 3 * inverseMarkerT ** 2 * markerT * control1.y
                        + 3 * inverseMarkerT * markerT ** 2 * control2.y
                        + markerT ** 3 * endpoint.y,
                    };
                    const tangent = {
                      x: 3 * inverseMarkerT ** 2 * (control1.x - start.x)
                        + 6 * inverseMarkerT * markerT * (control2.x - control1.x)
                        + 3 * markerT ** 2 * (endpoint.x - control2.x),
                      y: 3 * inverseMarkerT ** 2 * (control1.y - start.y)
                        + 6 * inverseMarkerT * markerT * (control2.y - control1.y)
                        + 3 * markerT ** 2 * (endpoint.y - control2.y),
                    };
                    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
                    const markerX = markerPoint.x - (tangent.y / tangentLength) * 14;
                    const markerY = markerPoint.y + (tangent.x / tangentLength) * 14;
                    return (
                      <g key={id} className={`reuse-connection reuse-connection--${status}`}>
                        <path
                          d={`M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${endpoint.x} ${endpoint.y}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={status === 'correct' ? 2.5 : status === 'wrong' ? 2 : 4}
                          markerEnd={`url(#sorting-arrow-head-${status})`}
                          strokeDasharray={status === 'selected' ? '9 7' : undefined}
                          strokeLinecap="round"
                          opacity="0.9"
                        />
                        {status !== 'selected' && (
                          <g transform={`translate(${markerX} ${markerY})`}>
                            <circle
                              r="8"
                              fill="white"
                              stroke={status === 'wrong' ? '#e11d48' : '#15803d'}
                              strokeWidth="2"
                            />
                            {status === 'wrong' ? (
                              <path
                                d="M -3 -3 L 3 3 M 3 -3 L -3 3"
                                fill="none"
                                stroke="#e11d48"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            ) : (
                              <path
                                d="M -3 0 L -1 2.5 L 3 -2.5"
                                fill="none"
                                stroke="#15803d"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}
                  <defs>
                    {[
                      ['selected', '#64748b'],
                      ['correct', '#15803d'],
                      ['wrong', '#dc2626'],
                    ].map(([status, color]) => (
                      <marker
                        key={status}
                        id={`sorting-arrow-head-${status}`}
                        markerWidth="12"
                        markerHeight="12"
                        markerUnits="userSpaceOnUse"
                        refX="12"
                        refY="6"
                        orient="auto"
                      >
                        <path d="M 0 0 L 12 6 L 0 12 z" fill={color} />
                      </marker>
                    ))}
                    <marker
                      id="sorting-arrow-head-active"
                      markerWidth="12"
                      markerHeight="12"
                      markerUnits="userSpaceOnUse"
                      refX="12"
                      refY="6"
                      orient="auto"
                    >
                      <path d="M 0 0 L 12 6 L 0 12 z" fill="#fb7c52" />
                    </marker>
                  </defs>
                  {activeArrow && geometry.source && (
                    <g>
                      <line
                        x1={geometry.source.x}
                        y1={geometry.source.y}
                        x2={activeArrow.point.x}
                        y2={activeArrow.point.y}
                        stroke="#fb7c52"
                        strokeWidth="4"
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                        markerEnd="url(#sorting-arrow-head-active)"
                      />
                      {[0, 1, 2].map((sparkle) => (
                        <circle
                          key={sparkle}
                          className="reuse-trail-sparkle"
                          cx={activeArrow.point.x + (sparkle - 1) * 10}
                          cy={activeArrow.point.y - (sparkle % 2) * 8}
                          r={sparkle === 1 ? 3.5 : 2.5}
                          style={{ animationDelay: `${sparkle * 100}ms` }}
                        />
                      ))}
                    </g>
                  )}
                </svg>
              )}

              <button
                ref={sourceRef}
                type="button"
                onPointerDown={(event) => {
                  if (event.pointerType === 'touch' || event.button !== 0 || !geometry.source) return;
                  event.preventDefault();
                  registerActivity();
                  const bounds = boardRef.current?.getBoundingClientRect();
                  if (!bounds) return;
                  setSourceSelected(true);
                  const nextArrow = {
                    pointerId: event.pointerId,
                    point: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
                  };
                  activeArrowRef.current = nextArrow;
                  setActiveArrow(nextArrow);
                }}
                onClick={() => {
                  registerActivity();
                  setSourceSelected(true);
                  showFeedback(`Đã chọn ${currentRound.waste.name}. Bé chạm vào những ý tưởng phù hợp nhé!`, `sorting_selected_${currentRound.waste.id}`);
                }}
                aria-pressed={sourceSelected}
                className={`reuse-source-card relative z-10 col-start-2 row-start-2 flex h-full w-full flex-col items-center justify-center rounded-3xl p-2 text-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${sourceSelected ? 'drop-shadow-[0_0_0.75rem_rgba(16,185,129,0.6)]' : ''}`}
                aria-label={`Chạm để chọn hoặc kéo ${currentRound.waste.name} đến một ý tưởng phù hợp`}
              >
                <img
                  src={sortingGameImageUrl(currentRound.waste.image)}
                  alt={currentRound.waste.alt}
                  className="h-[78%] w-[78%] object-contain drop-shadow-[0_0_0.9rem_rgba(16,185,129,0.8)] sm:h-[70%] sm:w-[70%]"
                  draggable={false}
                  onLoad={measureConnections}
                />
              </button>

              {currentRound.options.map((option) => {
                  const status = productStatus(option.id);
                  const statusMessage = status === 'correct'
                    ? 'Đáp án đúng đã xác nhận'
                    : status === 'wrong'
                      ? 'Chưa phù hợp, bé có thể gỡ lựa chọn này'
                      : status === 'selected'
                        ? 'Đã nối, chưa kiểm tra'
                        : 'Chưa nối';
                  return (
                    <button
                      key={option.id}
                      ref={(element) => {
                        if (element) choiceRefs.current.set(option.id, element);
                        else choiceRefs.current.delete(option.id);
                      }}
                      type="button"
                      data-choice-id={option.id}
                      onClick={() => toggleChoice(option.id)}
                      disabled={roundComplete || status === 'correct'}
                      aria-pressed={selectedIds.includes(option.id)}
                      aria-label={`${option.name}. ${statusMessage}${option.safetyNote ? `. ${option.safetyNote}` : ''}`}
                      style={{ gridColumn: option.column, gridRow: option.row }}
                      className={`reuse-choice-card reuse-choice-card--${status} relative z-10 col-span-1 row-span-1 flex h-full w-full items-center justify-center rounded-2xl border-2 border-white/90 p-2 shadow-md transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-sky-400 disabled:cursor-default motion-safe:hover:scale-105 motion-reduce:transform-none ${status === 'selected' ? 'drop-shadow-[0_0_0.75rem_rgba(14,165,233,0.7)]' : ''}`}
                    >
                      <img
                        src={sortingGameImageUrl(option.image)}
                        alt={option.alt}
                        className="h-[78%] w-[78%] object-contain sm:h-[70%] sm:w-[70%]"
                        draggable={false}
                        onLoad={measureConnections}
                      />
                    </button>
                  );
                })}
            </div>

            <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" aria-live="polite" className="min-h-12 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm font-bold leading-relaxed text-slate-800 shadow-sm sm:flex-1">
                {feedback || 'Bé hãy nối một hay nhiều hình rồi kiểm tra nhé!'}
              </p>
              <button
                type="button"
                onClick={checkAnswers}
                className={`reuse-check-button flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-7 py-3 text-lg font-black text-white shadow-lg transition hover:bg-sky-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${selectedIds.length >= 3 && !roundComplete ? 'reuse-check-button--ready' : ''}`}
              >
                <Check className="h-5 w-5" />
                Kiểm tra
              </button>
            </div>
            <button
              type="button"
              aria-label="Nghe lời nhắc an toàn"
              onClick={() => triggerSpeech('Một số ý tưởng cần người lớn hỗ trợ. Mình chỉ quan sát tranh và nhờ người lớn giúp nhé!', 'sorting_safety')}
              className="mt-2 min-h-11 w-full text-center text-xs font-semibold text-slate-600"
            >
              🔊 Một số ý tưởng cần người lớn hỗ trợ. Mình chỉ quan sát tranh và nhờ người lớn giúp nhé!
            </button>
          </section>
        )}

        {phase === 'complete' && (
          <section className="mx-auto my-auto w-full max-w-xl rounded-3xl border-4 border-white bg-white/90 p-6 text-center shadow-2xl sm:p-10">
            <div className="reuse-mascot reuse-mascot--victory mx-auto mb-2" aria-hidden="true">🤖</div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl" aria-hidden="true">🌼</div>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-950">
              <PartyPopper className="h-4 w-4" />
              Hoàn thành {rounds.length}/{rounds.length} lượt
            </p>
            <h2 className="mt-4 text-3xl font-black text-emerald-900 sm:text-4xl">Bé giỏi quá!</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé!
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startGame}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white shadow-md transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <RotateCcw className="h-4 w-4" />
                Chơi lại
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-sky-300 bg-white px-5 py-3 font-black text-sky-900 transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Về màn chơi chính
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
