import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, CameraOff, Check, Eye, EyeOff, Leaf, LoaderCircle, RotateCcw, ShieldCheck, Star, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import visionWasmBinaryUrl from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import visionWasmLoaderUrl from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import {
  canPickUp, createHandPickupRounds, getHandDropCategory, getHandOpenness, HAND_DROP_ZONES,
  HAND_PICKUP_COUNT, HAND_PICKUP_MAX_COUNT, HandGestureDetector, isValidHandPickupCount, mapHandPoint, PICKUP_ORIGIN, smoothHandPoint, stepHandPickup,
  type HandGesture, type HandPickupRound, type HandPickupState, type HandPoint,
  advanceHandPickupTimer, HAND_PICKUP_TIME_MS, HAND_PICKUP_BONUS_MS,
} from '../utils/handPickup';
import { playCountdownSfx, playErrorSfx, playPickSfx, playSuccessSfx, speakKienSang, stopKienSangSpeech } from '../utils/audio';
import type { TrashCategory, VoiceClips } from '../types';
import { HandPickupTimer } from './HandPickupTimer';
import './HandPickupGame.css';

type Phase = 'intro' | 'playing' | 'feedback' | 'complete';
type CameraState = 'off' | 'loading' | 'ready' | 'error';
const EMPTY_PICKUP: HandPickupState = { holding: false, gesture: null, result: null };
const LABELS: Record<TrashCategory, string> = { organic: 'Hữu cơ', recyclable: 'Vô cơ' };

function cameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Camera chưa được cấp quyền. Hãy cho phép camera trong cài đặt trình duyệt rồi thử lại.';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Không tìm thấy camera. Hãy kết nối camera rồi thử lại.';
  if (name === 'NotReadableError' || name === 'TrackStartError') return 'Camera đang bận. Hãy đóng ứng dụng khác đang dùng camera rồi thử lại.';
  return 'Chưa thể mở camera hoặc tải bộ nhận diện tay. Hãy kiểm tra kết nối và thử lại.';
}

function GameImage({ src, fallback, alt, className }: { src: string; fallback: React.ReactNode; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className={className} role="img" aria-label={alt}>{fallback}</span>
    : <img src={src} alt={alt} className={className} draggable={false} onError={() => setFailed(true)} />;
}

function HandIllustration({ closed = false }: { closed?: boolean }) {
  return (
    <span className={`hand-illustration ${closed ? 'grip' : 'open'}`} aria-hidden="true">
      <svg viewBox="0 0 96 112" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <g stroke="#925b32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {closed ? <>
            <path fill="#ffe5ac" d="M28 89C18 82 15 72 17 60V49C17 43 21 40 26 40 30 40 33 42 35 45V37C35 32 39 29 43 29S50 31 51 35C52 30 56 28 61 29S68 33 68 38C71 35 75 35 79 38S84 45 83 50V65C83 83 72 95 52 95 42 96 34 94 28 89Z" />
            <path d="M35 45V55M51 36V52M68 39V54" strokeWidth="3.2" />
            <path fill="#ffe5ac" d="M20 58C16 54 17 48 22 47S30 48 33 52L46 63C50 66 51 72 47 76S38 78 34 75L26 69" strokeWidth="3.5" />
            <path d="M42 86Q53 90 64 84" stroke="#f0c383" strokeWidth="3" />
          </> : <>
            <path fill="#ffe5ac" d="M29 88C19 84 14 75 11 65L8 55C6 50 8 45 12 44S20 45 23 49L27 55V30C27 25 30 22 34 22S41 25 41 30V19C41 14 44 11 48 11S55 14 55 19V26C55 21 58 18 62 18S69 21 69 26V36C69 31 72 28 76 28S83 31 83 36V61C83 80 71 93 52 95 43 96 35 94 29 88Z" />
            <path d="M41 30V50M55 26V48M69 36V51M27 55Q37 57 37 68" strokeWidth="3.2" />
            <path d="M43 85Q53 89 63 83" stroke="#f0c383" strokeWidth="3" />
          </>}
        </g>
      </svg>
    </span>
  );
}

export function HandPickupGame({ onExit, customMascotUrl, voiceClips }: { onExit: () => void; customMascotUrl: string | null; voiceClips: VoiceClips }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [cameraState, setCameraState] = useState<CameraState>('off');
  const [error, setError] = useState('');
  const [rounds, setRounds] = useState<HandPickupRound[]>([]);
  const [itemCount, setItemCount] = useState(String(HAND_PICKUP_COUNT));
  const validItemCount = isValidHandPickupCount(Number(itemCount));
  const [completed, setCompleted] = useState(0);
  const [pointer, setPointer] = useState<HandPoint | null>(null);
  const [gesture, setGesture] = useState<HandGesture | null>(null);
  const [holding, setHolding] = useState(false);
  const [feedback, setFeedback] = useState<HandPickupState['result']>(null);
  const [message, setMessage] = useState('');
  const [sound, setSound] = useState(true);
  const [preview, setPreview] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [remainingMs, setRemainingMs] = useState(HAND_PICKUP_TIME_MS);
  const [timeWindowMs, setTimeWindowMs] = useState(HAND_PICKUP_TIME_MS);
  const [softTimeout, setSoftTimeout] = useState(false);
  const [grabFlash, setGrabFlash] = useState<HandPoint | null>(null);
  const [trail, setTrail] = useState<(HandPoint & { id: number })[]>([]);
  const [dropPoint, setDropPoint] = useState<HandPoint | null>(null);
  const [dropCategory, setDropCategory] = useState<TrashCategory | null>(null);
  const remainingRef = useRef(HAND_PICKUP_TIME_MS);
  const lastTrailRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const celebrationRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<import('@mediapipe/tasks-vision').HandLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef(0);
  const detectorRef = useRef(new HandGestureDetector());
  const pickupRef = useRef<HandPickupState>({ ...EMPTY_PICKUP });
  const pointRef = useRef<HandPoint | null>(null);
  const targetPointRef = useRef<HandPoint | null>(null);
  const phaseRef = useRef<Phase>('intro');
  const roundsRef = useRef<HandPickupRound[]>([]);
  const completedRef = useRef(0);
  const soundRef = useRef(true);
  const lastActionRef = useRef(0);
  const resumeOpenRef = useRef(false);
  const currentItem = rounds[completed];
  const totalItems = rounds.length || (validItemCount ? Number(itemCount) : HAND_PICKUP_COUNT);

  function triggerSpeech(text: string, voiceId: string) {
    setMessage(text);
    if (soundRef.current) speakKienSang(text, voiceClips[voiceId]);
  }

  function resetQuestionClock() {
    remainingRef.current = HAND_PICKUP_TIME_MS;
    setRemainingMs(HAND_PICKUP_TIME_MS);
    setTimeWindowMs(HAND_PICKUP_TIME_MS);
    setSoftTimeout(false);
    setDropPoint(null);
    setDropCategory(null);
  }

  useEffect(resetQuestionClock, [completed, currentItem?.id]);

  useEffect(() => {
    if (phase !== 'playing' || cameraState !== 'ready' || confirmExit) return;
    let last = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      const running = phaseRef.current === 'playing' && pointRef.current !== null && document.visibilityState === 'visible';
      const timer = advanceHandPickupTimer(remainingRef.current, elapsed, running);
      remainingRef.current = timer.remainingMs;
      setRemainingMs(timer.remainingMs);
      if (timer.warning && soundRef.current) playCountdownSfx();
      if (timer.extended) {
        if (!pickupRef.current.holding) {
          const nextRounds = roundsRef.current.map((round, index) => index === completedRef.current ? { ...round, origin: { ...PICKUP_ORIGIN } } : round);
          roundsRef.current = nextRounds;
          setRounds(nextRounds);
          resetTracking();
        }
        setTimeWindowMs(HAND_PICKUP_BONUS_MS);
        setSoftTimeout(true);
        setMessage('Thêm 10 giây! Bé cứ thử tiếp nhé!');
        lastActionRef.current = now;
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, cameraState, confirmExit]);

  useEffect(() => {
    if (!softTimeout) return;
    const timeout = window.setTimeout(() => setSoftTimeout(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [softTimeout]);

  useEffect(() => {
    if (!grabFlash) return;
    const timeout = window.setTimeout(() => setGrabFlash(null), 650);
    return () => window.clearTimeout(timeout);
  }, [grabFlash]);

  function celebrateAt(point: HandPoint, small = false) {
    if (!canvasRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    celebrationRef.current ??= confetti.create(canvasRef.current, { resize: true });
    void celebrationRef.current({
      particleCount: small ? 12 : 50, spread: small ? 50 : 80,
      startVelocity: small ? 14 : 28, ticks: small ? 45 : 100,
      colors: ['#34d399', '#38bdf8', '#facc15', '#fb7185', '#ffffff'],
      origin: point, disableForReducedMotion: true,
    });
  }

  function resetTracking() {
    detectorRef.current.reset();
    pickupRef.current = { ...EMPTY_PICKUP };
    pointRef.current = null;
    targetPointRef.current = null;
    resumeOpenRef.current = false;
    setPointer(null);
    setGesture(null);
    setHolding(false);
    setTrail(previous => previous.length ? [] : previous);
    setGrabFlash(null);
  }

  function releaseResources() {
    sessionRef.current++;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    animationRef.current = null;
    timerRef.current = null;
    celebrationRef.current?.reset();
    const model = modelRef.current;
    modelRef.current = null;
    model?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function stopCamera() {
    releaseResources();
    resetTracking();
    setCameraState('off');
    setSoftTimeout(false);
    stopKienSangSpeech();
    if (phaseRef.current === 'feedback') {
      phaseRef.current = completedRef.current === roundsRef.current.length ? 'complete' : 'playing';
      setPhase(phaseRef.current);
      setCompleted(completedRef.current);
      setFeedback(null);
    }
  }

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') stopCamera();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      releaseResources();
      stopKienSangSpeech();
    };
  }, []);

  function finishDrop(result: NonNullable<HandPickupState['result']>, point: HandPoint) {
    phaseRef.current = 'feedback';
    setPhase('feedback');
    setFeedback(result);
    setDropPoint({ ...point });
    const category = getHandDropCategory(point);
    setDropCategory(category);
    setTrail([]);
    setGrabFlash(null);
    lastActionRef.current = performance.now();
    if (result === 'correct') {
      completedRef.current++;
      if (soundRef.current) playSuccessSfx();
      triggerSpeech('Tuyệt vời quá! Bé giỏi lắm!', 'correct_great');
      const zone = category ? HAND_DROP_ZONES[category] : null;
      celebrateAt(zone ? { x: zone.x + zone.width / 2, y: zone.y + zone.height * 0.12 } : point);
    } else {
      if (soundRef.current) playErrorSfx();
      if (result === 'miss') triggerSpeech('Chưa tới thùng rồi, con thử lại nhé!', 'hand_pickup_miss');
      else if (roundsRef.current[completedRef.current].category === 'organic') {
        triggerSpeech('Thử lại nhé! Món này thuộc nhóm Hữu cơ.', 'hand_pickup_retry_organic');
      } else triggerSpeech('Thử lại nhé! Món này thuộc nhóm Vô cơ.', 'hand_pickup_retry_inorganic');
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setCompleted(completedRef.current);
      setFeedback(null);
      setDropPoint(null);
      setDropCategory(null);
      resetTracking();
      if (completedRef.current === roundsRef.current.length) {
        releaseResources();
        setCameraState('off');
        phaseRef.current = 'complete';
        setPhase('complete');
        triggerSpeech('Tuyệt vời! Con đã dọn sạch tất cả món rác!', 'hand_pickup_victory');
      } else {
        phaseRef.current = 'playing';
        setPhase('playing');
      }
    }, 1100);
  }

  async function startCamera(newGame = false) {
    if (!validItemCount) return;
    stopCamera();
    setConfirmExit(false);
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setError('Camera cần HTTPS hoặc localhost. Hãy mở trò chơi trong trình duyệt hỗ trợ camera.');
      return;
    }
    if (soundRef.current) playCountdownSfx(0);
    setCameraState('loading');
    const session = sessionRef.current;
    let stream: MediaStream | null = null;
    let model: import('@mediapipe/tasks-vision').HandLandmarker | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
      if (session !== sessionRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Camera preview unavailable');
      video.srcObject = stream;
      await video.play();
      if (session !== sessionRef.current) return;
      const { HandLandmarker } = await import('@mediapipe/tasks-vision');
      if (session !== sessionRef.current) return;
      model = await HandLandmarker.createFromOptions({ wasmLoaderPath: visionWasmLoaderUrl, wasmBinaryPath: visionWasmBinaryUrl }, {
        baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/hand_landmarker.task`, delegate: 'CPU' },
        runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6,
      });
      if (session !== sessionRef.current) { model.close(); return; }
      modelRef.current = model;
      if (newGame || phaseRef.current === 'intro' || phaseRef.current === 'complete') {
        resetQuestionClock();
        roundsRef.current = createHandPickupRounds(Math.random, Number(itemCount));
        completedRef.current = 0;
        setRounds(roundsRef.current);
        setCompleted(0);
      } else {
        setCompleted(completedRef.current);
      }
      phaseRef.current = 'playing';
      setPhase('playing');
      setCameraState('ready');
      lastActionRef.current = performance.now();
      triggerSpeech('Đưa bàn tay mở đến món rác, nắm lại để nhặt rồi mở tay trên thùng nhé!', 'hand_pickup_intro');
      const cameraEnded = () => {
        if (session !== sessionRef.current) return;
        stopCamera();
        setCameraState('error');
        setError('Camera đã ngắt kết nối. Hãy kết nối lại rồi bật camera để tiếp tục.');
      };
      stream.getVideoTracks().forEach(track => track.addEventListener('ended', cameraEnded, { once: true }));
      let lastInference = -Infinity;
      let lastVideoTime = -1;
      let lastSeen = performance.now();
      let lastRender = lastSeen;
      const processFrame = (now: number) => {
        if (session !== sessionRef.current) return;
        if (targetPointRef.current && phaseRef.current === 'playing') {
          pointRef.current = smoothHandPoint(targetPointRef.current, pointRef.current, now - lastRender);
          setPointer(pointRef.current);
          if (pickupRef.current.holding && now - lastTrailRef.current >= 45) {
            const point = pointRef.current;
            lastTrailRef.current = now;
            setTrail(previous => [...previous.slice(-8), { ...point, id: now }]);
          }
        }
        lastRender = now;
        if (now - lastInference >= 33 && phaseRef.current === 'playing' && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastInference = now;
          lastVideoTime = video.currentTime;
          try {
            const landmarks = modelRef.current!.detectForVideo(video, now).landmarks[0];
            const openness = landmarks ? getHandOpenness(landmarks, video.videoWidth / video.videoHeight) : null;
            if (openness === null) {
              if (now - lastSeen > 450) resetTracking();
            } else {
              lastSeen = now;
              const palm = [0, 5, 9, 13, 17].reduce((sum, index) => ({ x: sum.x + landmarks[index].x / 5, y: sum.y + landmarks[index].y / 5 }), { x: 0, y: 0 });
              targetPointRef.current = mapHandPoint(palm);
              const point = pointRef.current ?? targetPointRef.current;
              if (!pointRef.current) {
                pointRef.current = point;
                setPointer(point);
              }
              const nextGesture = detectorRef.current.update(openness, now);
              setGesture(nextGesture);
              if (nextGesture === 'open') resumeOpenRef.current = true;
              if (nextGesture && resumeOpenRef.current) {
                const previous = pickupRef.current;
                const round = roundsRef.current[completedRef.current];
                const next = stepHandPickup(previous, point, nextGesture, round.category, round.origin);
                pickupRef.current = next;
                setHolding(next.holding);
                if (next.holding && !previous.holding) {
                  lastActionRef.current = now;
                  setMessage('Đã nhặt được! Đưa tay tới thùng nào.');
                  if (soundRef.current) playPickSfx();
                  setGrabFlash({ ...point });
                  celebrateAt(point, true);
                }
                if (next.result) finishDrop(next.result, point);
              }
            }
            if (phaseRef.current === 'playing' && now - lastActionRef.current > 14000) {
              const category = roundsRef.current[completedRef.current].category;
              if (!pickupRef.current.holding) triggerSpeech('Đưa bàn tay mở tới món rác rồi nắm lại nhé!', 'hand_pickup_hint');
              else if (category === 'organic') triggerSpeech('Mở tay ở thùng Hữu cơ nhé!', 'hand_pickup_drop_organic');
              else triggerSpeech('Mở tay ở thùng Vô cơ nhé!', 'hand_pickup_drop_inorganic');
              lastActionRef.current = now;
            }
          } catch {
            stopCamera();
            setCameraState('error');
            setError('Nhận diện tay bị gián đoạn. Hãy bật lại camera để tiếp tục.');
            return;
          }
        }
        animationRef.current = requestAnimationFrame(processFrame);
      };
      animationRef.current = requestAnimationFrame(processFrame);
    } catch (failure) {
      if (session !== sessionRef.current) { model?.close(); stream?.getTracks().forEach(track => track.stop()); return; }
      stopCamera();
      setCameraState('error');
      setError(cameraError(failure));
    }
  }

  const activeBin = holding && pointer ? getHandDropCategory(pointer) : null;
  const nearby = pointer && currentItem && canPickUp(pointer, currentItem.origin) && !holding;
  const itemPosition = feedback && dropPoint ? dropPoint : holding && pointer ? pointer : currentItem?.origin ?? PICKUP_ORIGIN;
  const dropZone = dropCategory ? HAND_DROP_ZONES[dropCategory] : null;
  const stageWidth = stageRef.current?.clientWidth ?? 0;
  const stageHeight = stageRef.current?.clientHeight ?? 0;
  const itemFxStyle = {
    left: `${itemPosition.x * 100}%`, top: `${itemPosition.y * 100}%`,
    '--return-x': `${((currentItem?.origin.x ?? 0.5) - itemPosition.x) * stageWidth}px`,
    '--return-y': `${((currentItem?.origin.y ?? 0.37) - itemPosition.y) * stageHeight}px`,
    '--drop-x': `${(dropZone ? dropZone.x + dropZone.width / 2 - itemPosition.x : 0) * stageWidth}px`,
    '--drop-y': `${(dropZone ? dropZone.y + dropZone.height * 0.12 - itemPosition.y : 0) * stageHeight}px`,
  } as React.CSSProperties;
  const loading = cameraState === 'loading';
  const playing = phase === 'playing' || phase === 'feedback';

  return (
    <section className="hand-game" aria-label="Tự tay nhặt rác">
      <header className="hand-hud" inert={confirmExit}>
        <button className="hand-icon" title="Thoát trò chơi" aria-label="Thoát trò chơi" onClick={() => {
          if (playing) { stopCamera(); setCompleted(completedRef.current); setConfirmExit(true); }
          else { stopCamera(); onExit(); }
        }}><ArrowLeft /></button>
        <h1>Tự tay nhặt rác</h1>
        <div className="hand-stars" aria-label={`Đã hoàn thành ${completed} trên ${totalItems} món`}>
          {totalItems <= 10 ? Array.from({ length: totalItems }, (_, index) => <Star key={index} size={22} className={index < completed ? 'earned' : ''} />)
            : <progress className="hand-progress" value={completed} max={totalItems} aria-label="Tiến độ dọn rác" />}
        </div>
        <span className="hand-score"><Leaf size={18} /> {completed}/{totalItems}</span>
        <button className="hand-icon" title={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={sound} onClick={() => {
          soundRef.current = !sound;
          setSound(!sound);
          if (sound) stopKienSangSpeech();
        }}>{sound ? <Volume2 /> : <VolumeX />}</button>
      </header>

      <div ref={stageRef} className={`hand-stage ${phase === 'intro' ? 'hand-stage--intro' : ''}`} inert={confirmExit}>
        <div className={`hand-preview ${!preview ? 'preview-hidden' : ''}`} data-tracking={pointer ? 'found' : 'searching'}>
          <video ref={videoRef} muted playsInline autoPlay aria-label="Camera lật gương" />
          <span>{cameraState === 'ready' ? pointer ? 'Đã thấy tay' : 'Đang tìm bàn tay' : loading ? 'Đang mở camera' : 'Camera đã tắt'}</span>
        </div>
        {playing && <div className="hand-camera-controls">
          <button className="hand-icon" title={preview ? 'Ẩn camera' : 'Hiện camera'} aria-label={preview ? 'Ẩn camera' : 'Hiện camera'} aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? <Eye /> : <EyeOff />}</button>
          <button className="hand-icon" disabled={loading} title={cameraState === 'ready' ? 'Dừng camera' : 'Bật lại camera'} aria-label={cameraState === 'ready' ? 'Dừng camera' : 'Bật lại camera'} onClick={() => cameraState === 'ready' ? stopCamera() : void startCamera()}>{cameraState === 'ready' ? <CameraOff /> : <Camera />}</button>
        </div>}

        {playing && currentItem && <>
          <div className="hand-status" role="status" aria-live="polite">{cameraState !== 'ready' ? 'Ván chơi đang tạm dừng' : softTimeout ? <span className="hand-soft-timeout"><GameImage src={customMascotUrl || `${import.meta.env.BASE_URL}images/kien-sang-main.png`} alt="Kiến Sáng" fallback={<Star />} /><span>Thêm 10 giây!<br />Bé cứ thử tiếp nhé!</span></span> : !pointer ? 'Đưa bàn tay mở vào trước camera' : message}</div>
          <div className="hand-trail" aria-hidden="true">{holding && trail.map(point => <Star key={point.id} className="hand-trail-spark" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />)}</div>
          {grabFlash && <span className="hand-grab-label" style={{ left: `${grabFlash.x * 100}%`, top: `${grabFlash.y * 100}%` }} aria-hidden="true">Đã nhặt!</span>}
          <div key={currentItem.id} className={`hand-item ${nearby ? 'nearby' : ''} ${holding ? 'held' : ''} ${softTimeout && !holding ? 'soft-return' : ''} ${feedback === 'correct' ? 'sorted' : ''} ${feedback === 'wrong' || feedback === 'miss' ? 'retry' : ''}`}
            style={itemFxStyle}>
            {phase === 'playing' && <HandPickupTimer remainingMs={remainingMs} totalMs={timeWindowMs} running={cameraState === 'ready' && pointer !== null && !confirmExit} bonus={softTimeout} />}
            <GameImage key={currentItem.image} src={currentItem.image} alt="Món rác cần phân loại" fallback={<Trash2 size={58} />} />
          </div>
          {pointer && cameraState === 'ready' && <div className={`hand-cursor ${gesture === 'closed' ? 'closed' : ''}`} style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }} aria-label={holding ? 'Đang giữ rác' : gesture === 'closed' ? 'Tay nắm' : 'Tay mở'}>
            <HandIllustration closed={gesture === 'closed'} />
            {holding && <Check className="hand-held-check" size={18} />}
          </div>}
        </>}

        <div className="hand-ground" />
        {(['organic', 'recyclable'] as const).map(category => {
          const zone = HAND_DROP_ZONES[category];
          return <div key={category} className={`hand-bin ${category} ${activeBin === category ? 'bin-active' : ''} ${dropCategory === category && feedback === 'correct' ? 'bin-correct' : ''} ${dropCategory === category && feedback === 'wrong' ? 'bin-wrong' : ''}`} style={{ left: `${zone.x * 100}%`, top: `${zone.y * 100}%`, width: `${zone.width * 100}%`, height: `${zone.height * 100}%` }}>
            <span className="hand-bin-art">
              <span className="hand-bin-rim" />
              <GameImage className="hand-bin-body" src={`${import.meta.env.BASE_URL}images/camera/thung_rac_${category === 'organic' ? 'huu_co' : 'vo_co'}.png`} alt={`Thùng ${LABELS[category]}`} fallback={<Trash2 size={90} />} />
              <GameImage className="hand-bin-lid" src={`${import.meta.env.BASE_URL}images/camera/thung_rac_${category === 'organic' ? 'huu_co' : 'vo_co'}.png`} alt="" fallback={null} />
            </span>
          </div>;
        })}
        {feedback && dropPoint && <span key={`${completed}-${feedback}`} className={`hand-drop-label ${feedback === 'correct' ? 'hand-drop-label--correct' : ''}`} aria-hidden="true" style={{ left: `${(dropZone ? dropZone.x + dropZone.width / 2 : Math.max(0.25, Math.min(0.75, dropPoint.x))) * 100}%`, top: `${(dropZone ? dropZone.y - 0.04 : Math.max(0.3, Math.min(0.6, dropPoint.y))) * 100}%` }}>{feedback === 'correct' ? 'CHÍNH XÁC!' : 'Thử lại nhé!'}</span>}
        <canvas ref={canvasRef} className="hand-confetti" />

        {phase === 'intro' && <section className="hand-welcome hand-intro" aria-labelledby="hand-intro-title">
          <div className="hand-intro-art" aria-hidden="true">
            <span className="hand-intro-ground" />
            <GameImage className="hand-intro-bin hand-intro-bin--left" src={`${import.meta.env.BASE_URL}images/camera/thung_rac_huu_co.png`} alt="" fallback={<Trash2 />} />
            <GameImage className="hand-intro-bin hand-intro-bin--right" src={`${import.meta.env.BASE_URL}images/camera/thung_rac_vo_co.png`} alt="" fallback={<Trash2 />} />
            <div className="hand-intro-pickup">
              <GameImage className="hand-intro-trash" src={`${import.meta.env.BASE_URL}images/camera/vo_co/vo_co_01.png`} alt="" fallback={<Trash2 />} />
              <HandIllustration closed />
            </div>
            <Star className="hand-intro-spark hand-intro-spark--left" />
            <Star className="hand-intro-spark hand-intro-spark--right" />
          </div>
          <div className="hand-intro-copy">
            <h2 id="hand-intro-title">Tự tay <span>nhặt rác</span></h2>
            <p>Bàn tay nhỏ, việc tốt lớn!</p>
          </div>
          <div className="hand-gesture-demo hand-intro-gestures" role="img" aria-label="Mở tay, nắm để nhặt, mở để thả"><HandIllustration /><ArrowRight aria-hidden="true" /><HandIllustration closed /><ArrowRight aria-hidden="true" /><HandIllustration /></div>
          <div className="hand-intro-controls">
            <label className="hand-count" htmlFor="hand-item-count">Số món rác
              <input id="hand-item-count" type="number" inputMode="numeric" min={2} max={HAND_PICKUP_MAX_COUNT} step={1} value={itemCount} disabled={loading}
                aria-invalid={!validItemCount} aria-describedby={!validItemCount ? 'hand-count-error' : undefined} onChange={event => setItemCount(event.target.value)} />
            </label>
            <button className="hand-primary hand-intro-start" disabled={loading || !validItemCount} onClick={() => void startCamera(true)}>{loading ? <LoaderCircle className="hand-loading" /> : <Camera />}{loading ? 'Đang chuẩn bị…' : 'Bật camera & Bắt đầu'}</button>
            {!validItemCount && <span id="hand-count-error" className="hand-count-error" role="alert">Nhập số nguyên từ 2 đến {HAND_PICKUP_MAX_COUNT}.</span>}
            {error && <p className="hand-intro-error" role="alert">{error}</p>}
          </div>
          <p className="hand-intro-privacy"><ShieldCheck size={18} aria-hidden="true" /><span>Hình ảnh chỉ được xử lý trên thiết bị, không lưu hoặc gửi lên máy chủ.</span></p>
        </section>}

        {playing && cameraState !== 'ready' && !confirmExit && <div className="hand-pause" role="status">
          {loading ? <LoaderCircle className="hand-loading" size={32} /> : <CameraOff size={32} />}
          <h2>{loading ? 'Đang chuẩn bị camera…' : 'Nghỉ một chút nhé!'}</h2>
          {!loading && <button className="hand-primary" onClick={() => void startCamera()}><Camera /> Bật camera để tiếp tục</button>}
        </div>}
        {error && phase !== 'intro' && <div className="hand-error" role="alert">{error}</div>}

        {phase === 'complete' && <div className="hand-welcome hand-complete">
          <GameImage src={customMascotUrl || `${import.meta.env.BASE_URL}images/kien-sang-main.png`} alt="Robot Kiến Sáng" fallback={<Star size={80} />} className="hand-mascot" />
          <h2>Sạch rồi! Giỏi lắm!</h2>
          <div className="hand-final-score"><Star /> {completed} / {totalItems} <Star /></div>
          <button className="hand-primary" disabled={loading} onClick={() => void startCamera(true)}>{loading ? <LoaderCircle className="hand-loading" /> : <RotateCcw />} {loading ? 'Đang chuẩn bị…' : 'Chơi lại'}</button>
          <button className="hand-secondary" onClick={onExit}><ArrowLeft /> Về lớp học</button>
        </div>}
      </div>

      {confirmExit && <div className="hand-modal-backdrop"><div className="hand-exit-dialog" role="dialog" aria-modal="true" aria-labelledby="hand-exit-title">
        <h2 id="hand-exit-title">Con muốn về lớp học?</h2>
        <button autoFocus className="hand-primary" onClick={() => { stopCamera(); onExit(); }}><ArrowLeft /> Về lớp học</button>
        <button className="hand-secondary" onClick={() => { setConfirmExit(false); void startCamera(); }}><X /> Chơi tiếp</button>
      </div></div>}
    </section>
  );
}