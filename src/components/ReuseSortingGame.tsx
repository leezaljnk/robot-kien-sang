import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Flower2, Hand, Link2, Play, RotateCcw, Settings2, ShieldCheck, Sparkles, Sprout, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  createSortingGameRounds,
  evaluateSortingGameChoices,
  SORTING_GAME_WASTES,
  sortingGameImageUrl,
  type SortingGameRound,
} from '../data/sortingGame';
import { playCountdownSfx, playErrorSfx, playSuccessSfx, playVictoryFanfare, stopKienSangSpeech } from '../utils/audio';
import { type TriggerSpeech } from '../data/voicePrompts';
import './ReuseSortingGame.css';

interface ReuseSortingGameProps {
  onExit: () => void;
  triggerSpeech: TriggerSpeech;
  customMascotUrl?: string | null;
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
  trail: Point[];
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

const ReuseCountdown: React.FC<{ running: boolean; muted: boolean }> = ({ running, muted }) => {
  const [seconds, setSeconds] = useState(10);
  const soundEnabledRef = useRef(!muted);

  useLayoutEffect(() => { soundEnabledRef.current = !muted; }, [muted]);

  useEffect(() => {
    if (!running) return;
    let remaining = seconds;
    let interval: number | undefined;
    const start = () => {
      window.clearInterval(interval);
      if (document.hidden) return;
      interval = window.setInterval(() => {
        remaining = remaining <= 1 ? 10 : remaining - 1;
        setSeconds(remaining);
        if (remaining <= 3 && soundEnabledRef.current) playCountdownSfx(0.035);
      }, 1000);
    };
    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', start);
    };
  }, [running]);

  return (
    <div role="timer" aria-live="off" aria-label={`Thời gian còn lại: ${seconds} giây`} className={`reuse-timer ${seconds <= 3 && running ? 'reuse-timer--warning' : ''}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" className="reuse-timer-track" />
        <circle cx="32" cy="32" r="27" pathLength="10" strokeDasharray="10" strokeDashoffset={10 - seconds} className="reuse-timer-ring" />
      </svg>
      <span aria-hidden="true"><strong>{seconds}</strong><small>giây</small></span>
    </div>
  );
};

export const ReuseSortingGame: React.FC<ReuseSortingGameProps> = ({ onExit, triggerSpeech: onSpeech, customMascotUrl }) => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [roundCount, setRoundCount] = useState('5');
  const [muted, setMuted] = useState(false);
  const [rounds, setRounds] = useState<SortingGameRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmedCorrectIds, setConfirmedCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [roundComplete, setRoundComplete] = useState(false);
  const [sourceSelected, setSourceSelected] = useState(false);
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
  const mutedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const currentRound = rounds[roundIndex];
  const validRoundCount = roundCount.trim() !== '' && Number.isInteger(Number(roundCount)) && Number(roundCount) >= 1 && Number(roundCount) <= 20;
  const completedRounds = phase === 'complete' ? rounds.length : roundIndex + (roundComplete ? 1 : 0);
  const hasUncheckedChoices = selectedIds.some(id => !confirmedCorrectIds.includes(id) && !wrongIds.includes(id));
  const mascotUrl = customMascotUrl || `${import.meta.env.BASE_URL}images/kien-sang-main.png`;
  const introWaste = SORTING_GAME_WASTES[1];

  useLayoutEffect(() => { mutedRef.current = muted; }, [muted]);
  const triggerSpeech = useCallback<TriggerSpeech>((text, voiceId) => {
    if (!mutedRef.current) onSpeech(text, voiceId);
  }, [onSpeech]);

  useEffect(() => () => { stopKienSangSpeech(); }, []);

  const showFeedback = useCallback((text: string, voiceId: string) => {
    setFeedback(text);
    triggerSpeech(text, voiceId);
  }, [triggerSpeech]);

  useEffect(() => {
    if (phase === 'intro') {
      triggerSpeech('Mỗi lượt có một món đồ có thể tái sử dụng. Bé hãy tìm các ý tưởng phù hợp nhé.', 'sorting_intro');
    } else if (phase === 'complete') {
      triggerSpeech('Bé giỏi quá! Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé!', 'sorting_victory');
    }
  }, [phase, triggerSpeech]);

  useEffect(() => {
    if (phase !== 'playing' || !currentRound || roundComplete) return;
    const question = `Từ ${currentRound.waste.name.toLocaleLowerCase('vi')}, bé có thể tạo ra gì?`;
    showFeedback(question, `sorting_question_${currentRound.waste.id}`);
  }, [phase, currentRound, roundComplete, showFeedback]);

  useEffect(() => {
    if (roundComplete || phase === 'complete') {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        void confetti({ particleCount: phase === 'complete' ? 160 : 65, spread: 90, origin: { y: 0.6 }, colors: ['#208a67', '#f292a7', '#efc64a', '#4aa9c2'], disableForReducedMotion: true });
      }
      if (phase === 'complete' && !mutedRef.current) playVictoryFanfare();
    }
    return () => { confetti.reset(); };
  }, [roundComplete, phase]);

  useEffect(() => {
    if (phase === 'complete' || roundComplete) return;
    lastInteractionRef.current = Date.now();
    let reminded = false;
    const interval = window.setInterval(() => {
      if (document.hidden || reminded || activeArrowRef.current || Date.now() - lastInteractionRef.current < 15000) return;
      reminded = true;
      if (phase === 'intro') {
        triggerSpeech('Mỗi lượt có một món đồ có thể tái sử dụng. Bé hãy tìm các ý tưởng phù hợp nhé.', 'sorting_intro');
      } else {
        showFeedback('Bé hãy nối một hay nhiều hình phù hợp trước nhé!', 'sorting_select');
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase, roundIndex, roundComplete, showFeedback, triggerSpeech]);

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
  }, [roundComplete, confirmedCorrectIds, selectedIds, wrongIds, showFeedback]);

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
      const bounds = boardRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const nextArrow = {
        pointerId: event.pointerId,
        point: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
        trail: [...active.trail, active.point].slice(-7),
      };
      lastInteractionRef.current = Date.now();
      activeArrowRef.current = nextArrow;
      setActiveArrow(nextArrow);
    };
    const onPointerUp = (event: PointerEvent) => {
      const active = activeArrowRef.current;
      if (!active || event.pointerId !== active.pointerId) return;
      const choice = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-choice-id]');
      if (choice?.dataset.choiceId) {
        toggleChoiceRef.current(choice.dataset.choiceId);
        suppressClickRef.current = true;
        window.setTimeout(() => { suppressClickRef.current = false; }, 0);
      }
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
      activeArrowRef.current = null;
    };
  }, [phase]);

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
    if (!validRoundCount) return;
    stopKienSangSpeech();
    setRounds(createSortingGameRounds(Math.random, Number(roundCount)));
    setRoundIndex(0);
    setSelectedIds([]);
    setConfirmedCorrectIds([]);
    setWrongIds([]);
    setRoundComplete(false);
    setSourceSelected(false);
    activeArrowRef.current = null;
    setActiveArrow(null);
    setPhase('playing');
  };

  const checkAnswers = () => {
    if (!currentRound || roundComplete) return;
    if (selectedIds.length === 0) {
      showFeedback('Bé hãy nối một hay nhiều hình phù hợp trước nhé!', 'sorting_select');
      return;
    }
    const { correctIds, wrongIds: nextWrongIds, isComplete } =
      evaluateSortingGameChoices(currentRound, selectedIds);
    setConfirmedCorrectIds(correctIds);
    setWrongIds(nextWrongIds);

    if (nextWrongIds.length > 0) {
      if (!mutedRef.current) playErrorSfx();
      showFeedback('Bé thử gỡ đường nối có dấu X rồi kiểm tra lại nhé!', 'sorting_retry');
      return;
    }
    if (!mutedRef.current) playSuccessSfx();
    if (isComplete) {
      setRoundComplete(true);
      showFeedback('Chúc mừng bé!', 'sorting_round_complete');
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
    <main className={`reuse-game reuse-game--${phase}`} onPointerDownCapture={() => { lastInteractionRef.current = Date.now(); }} onKeyDownCapture={() => { lastInteractionRef.current = Date.now(); }}>
      <div className="reuse-layout">
        <header className="reuse-header">
          <div className="reuse-header-title">
            <button
              type="button"
              onClick={() => { stopKienSangSpeech(); onExit(); }}
              className="reuse-icon-button"
              aria-label="Quay lại màn chơi chính"
              title="Quay lại màn chơi chính"
            >
              <ArrowLeft />
            </button>
            <div>
              <h1>Góc sáng tạo xanh</h1>
            </div>
          </div>
          <button type="button" className="reuse-icon-button" aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'} aria-pressed={muted} title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'} onClick={() => { if (!muted) stopKienSangSpeech(); setMuted(!muted); }}>
            {muted ? <VolumeX /> : <Volume2 />}
          </button>
        </header>

        {phase === 'intro' && (
          <section className="reuse-welcome" aria-labelledby="reuse-welcome-title">
            <div className="reuse-intro-art" aria-hidden="true">
              <span className="reuse-art-ground" />
              <img className="reuse-art-source" src={sortingGameImageUrl(introWaste.image)} alt="" />
              <ArrowRight className="reuse-art-arrow" />
              {introWaste.products.map((product, index) => <img key={product.id} className={`reuse-art-product reuse-art-product--${index}`} src={sortingGameImageUrl(product.image)} alt="" />)}
              <Sparkles className="reuse-art-spark" />
              <img className="reuse-intro-mascot" src={mascotUrl} alt="" />
            </div>
            <div className="reuse-intro-copy">
              <h2 id="reuse-welcome-title">Món đồ cũ,<br /><span>ý tưởng mới!</span></h2>
              <p className="reuse-mascot-greeting">Bé ơi, cùng tìm ba cách dùng lại đồ cũ nhé!</p>
            </div>
            <div className="reuse-visual-steps" role="img" aria-label="Chạm vào ý tưởng hoặc kéo từ món đồ để nối. Kiểm tra rồi gỡ lựa chọn sai và thử lại; đáp án đúng được giữ lại.">
              <span><Hand /><small>Chạm hoặc kéo</small></span>
              <ArrowRight className="reuse-step-arrow" />
              <span><Link2 /><small>Nối ý tưởng</small></span>
              <ArrowRight className="reuse-step-arrow" />
              <span><Check /><small>Kiểm tra, thử lại</small></span>
            </div>
            <div className="reuse-intro-controls">
              <label htmlFor="reuse-round-count">Số lượt
                <input id="reuse-round-count" type="number" inputMode="numeric" min="1" max="20" step="1" value={roundCount} onChange={event => setRoundCount(event.target.value)} aria-invalid={!validRoundCount} aria-describedby={!validRoundCount ? 'reuse-count-error' : undefined} />
              </label>
              <button type="button" onClick={startGame} disabled={!validRoundCount} className="reuse-primary reuse-start"><Play fill="currentColor" />Bắt đầu</button>
              {!validRoundCount && <p id="reuse-count-error" role="alert" className="reuse-count-error">Chọn số nguyên từ 1 đến 20 lượt nhé.</p>}
            </div>
            <p className="reuse-intro-note"><Sprout />Mỗi lượt một món đồ, mỗi món một ý tưởng xanh!</p>
          </section>
        )}

        {phase === 'playing' && currentRound && (
          <section className="reuse-play">
            <div className="reuse-play-top">
              <div className="reuse-journey">
                <div className="reuse-journey-label"><span>Lượt {roundIndex + 1}/{rounds.length}</span><strong>{completedRounds} mầm xanh</strong></div>
                <div className="reuse-growth" role="progressbar" aria-label="Số lượt hoàn thành" aria-valuemin={0} aria-valuemax={rounds.length} aria-valuenow={completedRounds}>
                  {rounds.map((round, index) => <span key={round.waste.id} className={`${index < completedRounds ? 'is-grown' : ''} ${index === roundIndex ? 'is-current' : ''}`} aria-hidden="true">{index < completedRounds ? <Flower2 /> : <Sprout />}</span>)}
                </div>
              </div>
              <ReuseCountdown key={`${roundIndex}-${rounds.length}`} running={!roundComplete} muted={muted} />
            </div>
            <h2 className="reuse-question">Từ <span>{currentRound.waste.name.toLocaleLowerCase('vi')}</span>, bé có thể tạo ra gì?</h2>

            <div className="reuse-board-shell">
              <div
                ref={boardRef}
                className="reuse-board"
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
                      <g key={id} className={`reuse-connection reuse-connection--${status}`} data-connection-status={status} data-connection-id={id}>
                        <path
                          d={`M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${endpoint.x} ${endpoint.y}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={status === 'correct' ? 5 : 3}
                          markerEnd={`url(#sorting-arrow-head-${status})`}
                          strokeDasharray={status === 'selected' ? '9 7' : undefined}
                          strokeLinecap="round"
                          opacity="0.9"
                        />
                        {status !== 'selected' && (
                          <g transform={`translate(${markerX} ${markerY})`}>
                            <circle
                              r="11"
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
                        {status === 'correct' && <Flower2 x={endpoint.x - 10} y={endpoint.y - 10} width={20} height={20} fill="#f7d777" color="#187557" className="reuse-end-flower" />}
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
                    {activeArrow.trail.map((point, index) => <Sparkles key={index} x={point.x - 5} y={point.y - 5} width={8 + index} height={8 + index} color={index % 2 ? '#ec9b42' : '#258b70'} opacity={(index + 1) / 8} />)}
                    </g>
                  )}
                </svg>
              )}

              <button
                ref={sourceRef}
                type="button"
                onPointerDown={(event) => {
                  if (!event.isPrimary || event.button !== 0 || !geometry.source || roundComplete) return;
                  event.preventDefault();
                  const bounds = boardRef.current?.getBoundingClientRect();
                  if (!bounds) return;
                  setSourceSelected(true);
                  const nextArrow = {
                    pointerId: event.pointerId,
                    point: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
                    trail: [],
                  };
                  activeArrowRef.current = nextArrow;
                  setActiveArrow(nextArrow);
                }}
                onClick={() => {
                  if (suppressClickRef.current || roundComplete) return;
                  setSourceSelected(true);
                  showFeedback(`Đã chọn ${currentRound.waste.name}. Bé chạm vào những ý tưởng phù hợp nhé!`, `sorting_selected_${currentRound.waste.id}`);
                }}
                aria-pressed={sourceSelected}
                disabled={roundComplete}
                className={`reuse-source ${sourceSelected ? 'is-selected' : ''}`}
                aria-label={`Chạm để chọn hoặc kéo ${currentRound.waste.name} đến một ý tưởng phù hợp`}
              >
                <span className="reuse-source-halo" aria-hidden="true" />
                <img
                  src={sortingGameImageUrl(currentRound.waste.image)}
                  alt={currentRound.waste.alt}
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
                      onClick={() => { if (!suppressClickRef.current) toggleChoice(option.id); }}
                      disabled={roundComplete || status === 'correct'}
                      aria-pressed={selectedIds.includes(option.id)}
                      aria-label={`${option.name}. ${statusMessage}${option.safetyNote ? `. ${option.safetyNote}` : ''}`}
                      style={{ gridColumn: option.column, gridRow: option.row }}
                      className={`reuse-choice reuse-choice--${status}`}
                    >
                      <span className="reuse-choice-halo" aria-hidden="true" />
                      <img
                        src={sortingGameImageUrl(option.image)}
                        alt={option.alt}
                        draggable={false}
                        onLoad={measureConnections}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="reuse-feedback-row">
              {roundComplete && <img src={mascotUrl} alt="Robot Kiến Sáng chúc mừng" className="reuse-cheering-mascot" />}
              <p role="status" aria-live="polite" className="reuse-feedback">
                {feedback || 'Bé hãy nối một hay nhiều hình rồi kiểm tra nhé!'}
              </p>
              <button
                type="button"
                onClick={checkAnswers}
                disabled={!selectedIds.length || roundComplete}
                className={`reuse-primary reuse-check ${hasUncheckedChoices && !roundComplete ? 'reuse-check--ready' : ''}`}
              >
                <Check className="h-5 w-5" />
                Kiểm tra
              </button>
            </div>
            <button
              type="button"
              aria-label="Nghe lời nhắc an toàn"
              onClick={() => triggerSpeech('Một số ý tưởng cần người lớn hỗ trợ. Mình chỉ quan sát tranh và nhờ người lớn giúp nhé!', 'sorting_safety')}
              className="reuse-safety"
            >
              <ShieldCheck />Nhờ người lớn hỗ trợ khi làm thủ công nhé!
            </button>
          </section>
        )}

        {phase === 'complete' && (
          <section className="reuse-complete" aria-labelledby="reuse-complete-title">
            <img src={mascotUrl} alt="Robot Kiến Sáng chúc mừng" className="reuse-victory-mascot" />
            <p className="reuse-final-count">
              <Flower2 />
              Hoàn thành {rounds.length}/{rounds.length} lượt
              <Flower2 />
            </p>
            <h2 id="reuse-complete-title">Bé giỏi quá!</h2>
            <p>
              Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé!
            </p>
            <div className="reuse-complete-actions">
              <button
                type="button"
                onClick={startGame}
                className="reuse-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Chơi lại
              </button>
              <button
                type="button"
                onClick={() => { stopKienSangSpeech(); setPhase('intro'); }}
                className="reuse-secondary"
              >
                <Settings2 className="h-4 w-4" />
                Chọn số lượt
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
