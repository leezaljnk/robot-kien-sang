import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ActiveTrashItem, GameMode, KienSangMood, TrashCategory, TrashItemDef, VoiceClips, CostumeId, CustomCostumesMap, PreloadedOfflineState } from './types';
import { TRASH_ITEMS } from './data/trashItems';
import { YARD_TRASH_ITEMS } from './data/yardTrashItems';
import { ClassroomBackground } from './components/ClassroomBackground';
import { YardBackground } from './components/YardBackground';
import { SunlitGardenGame } from './components/SunlitGardenGame';
import { TrashBin } from './components/TrashBin';
import { TrashItemView } from './components/TrashItemView';
import { RobotKienSang } from './components/RobotKienSang';
import { TopBar } from './components/TopBar';
import { VoiceStudioModal } from './components/VoiceStudioModal';
import { ScratchModal } from './components/ScratchModal';
import { VictoryModal } from './components/VictoryModal';
import { MascotModal } from './components/MascotModal';
import { MascotCostumesModal } from './components/MascotCostumesModal';
import { TrashBinModal } from './components/TrashBinModal';
import { TrashItemUploadModal } from './components/TrashItemUploadModal';
import { OfflineHtmlModal } from './components/OfflineHtmlModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Shirt } from 'lucide-react';
import { MASCOT_COSTUMES, getPrimaryMascotImage } from './data/mascotCostumes';
import { getBinApproachTarget, getCommandMoveDuration } from './utils/movement';
import { getNonOverlappingTrashSpawnSlots, getTrashSpawnSlots } from './utils/trashSpawn';
import { drawTrashItems } from './utils/trashCycle';
import { voiceIdForText } from './data/voicePrompts';
import { listSharedAssets, sharedAssetsEnabled, sharedAssetsToState } from './utils/sharedAssets';
import {
  playPickSfx,
  playDropSfx,
  playSuccessSfx,
  playErrorSfx,
  playVictoryFanfare,
  speakKienSang,
} from './utils/audio';
import {
  setPersistentItem,
  getPersistentItem,
  removePersistentItem,
} from './utils/persistentStorage';

const MAX_SCORE = 20;
const TRASH_BATCH_SIZE = 5;
const STORAGE_KEY_VOICE = 'kien_sang_voice_clips_v1';
const STORAGE_KEY_MASCOT = 'kien_sang_custom_mascot_v1';
const STORAGE_KEY_SCALE = 'kien_sang_mascot_scale_v1';
const STORAGE_KEY_BIN_ORGANIC = 'kien_sang_bin_organic_v1';
const STORAGE_KEY_BIN_RECYCLABLE = 'kien_sang_bin_recyclable_v1';
const STORAGE_KEY_BIN_SCALE = 'kien_sang_bin_scale_v1';
const STORAGE_KEY_TRASH_IMAGES = 'kien_sang_trash_images_v1';
const STORAGE_KEY_MASCOT_COSTUMES = 'kien_sang_costumes_v1';
type GameScene = 'classroom' | 'yard';

export default function App() {
  const [sharedError, setSharedError] = useState('');
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('drag');
  const [activeItems, setActiveItems] = useState<ActiveTrashItem[]>([]);
  const activeItemsRef = useRef(activeItems);
  activeItemsRef.current = activeItems;
  const [selectedTrashId, setSelectedTrashId] = useState<string | null>(null);
  const [scene, setScene] = useState<GameScene>('classroom');
  const [isGardenOpen, setIsGardenOpen] = useState(false);
  const sceneRef = useRef<GameScene>('classroom');
  const sceneItemsRef = useRef<Record<GameScene, ActiveTrashItem[] | null>>({
    classroom: null,
    yard: null,
  });
  const trashCycleRef = useRef<Record<GameScene, TrashItemDef[]>>({
    classroom: [],
    yard: [],
  });

  // Kiến Sáng state
  const [kienMood, setKienMood] = useState<KienSangMood>('idle');
  const [kienSpeech, setKienSpeech] = useState<string>(
    'Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé!'
  );
  const [kienX, setKienX] = useState<number>(50); // % across screen
  const [kienY, setKienY] = useState<number>(68);

  // Hover states for bins during drag
  const [hoveredBin, setHoveredBin] = useState<TrashCategory | null>(null);
  const [bouncingBin, setBouncingBin] = useState<TrashCategory | null>(null);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isScratchModalOpen, setIsScratchModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [isCostumesModalOpen, setIsCostumesModalOpen] = useState(false);
  const [isTrashBinModalOpen, setIsTrashBinModalOpen] = useState(false);
  const [isTrashItemsModalOpen, setIsTrashItemsModalOpen] = useState(false);
  const [isOfflineHtmlModalOpen, setIsOfflineHtmlModalOpen] = useState(false);
  const [targetBinCategory, setTargetBinCategory] = useState<TrashCategory | null>(null);

  // Preloaded state (nhúng sẵn trong file HTML Offline khi xuất từ bản Preview)
  const preloaded = typeof window !== 'undefined' ? window.__KIEN_SANG_PRELOADED_STATE__ : undefined;

  // Custom mascot costumes, image & scale
  const [customCostumes, setCustomCostumes] = useState<CustomCostumesMap>(
    () => preloaded?.customCostumes || {}
  );
  const [customMascotUrl, setCustomMascotUrl] = useState<string | null>(
    () => getPrimaryMascotImage(preloaded?.customCostumes || {}, preloaded?.customMascotUrl)
  );
  const [mascotScale, setMascotScale] = useState<number>(
    () => (typeof preloaded?.mascotScale === 'number' ? preloaded.mascotScale : 1.0)
  );
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [carriedItemInstanceId, setCarriedItemInstanceId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [walkStepTick, setWalkStepTick] = useState(0);
  const quickUploadRef = useRef<HTMLInputElement>(null);

  // Custom trash bin images & scale
  const [customOrganicUrl, setCustomOrganicUrl] = useState<string | null>(
    () => preloaded?.customOrganicUrl || null
  );
  const [customRecyclableUrl, setCustomRecyclableUrl] = useState<string | null>(
    () => preloaded?.customRecyclableUrl || null
  );
  const [binScale, setBinScale] = useState<number>(
    () => (typeof preloaded?.binScale === 'number' ? preloaded.binScale : 0.85)
  );

  // Custom 16 trash images (itemId -> dataUrl)
  const [customTrashImages, setCustomTrashImages] = useState<Record<string, string>>(
    () => preloaded?.customTrashImages || {}
  );

  // Child recorded voices
  const [voiceClips, setVoiceClips] = useState<VoiceClips>(() => ({
    ...preloaded?.voiceClips,
    correct: preloaded?.voiceClips?.correct || null,
    incorrect: preloaded?.voiceClips?.incorrect || null,
    victory: preloaded?.voiceClips?.victory || null,
  }));

  // Dragging state
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    origX: number;
    origY: number;
    curX: number;
    curY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const draggingItemRef = useRef<typeof draggingItem>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftBinRef = useRef<HTMLDivElement>(null);
  const rightBinRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  const refreshSharedAssets = useCallback(async () => {
    const shared = sharedAssetsToState(await listSharedAssets());
    setCustomCostumes(prev => ({ ...prev, ...shared.customCostumes }));
    setCustomTrashImages(prev => ({ ...prev, ...shared.customTrashImages }));
    if (shared.customMascotUrl) setCustomMascotUrl(shared.customMascotUrl);
    if (shared.customOrganicUrl) setCustomOrganicUrl(shared.customOrganicUrl);
    if (shared.customRecyclableUrl) setCustomRecyclableUrl(shared.customRecyclableUrl);
    if (shared.voiceClips) {
      const clips = shared.voiceClips;
      setVoiceClips(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(clips).filter(([, url]) => url)),
        correct: clips.correct || prev.correct,
        incorrect: clips.incorrect || prev.incorrect,
        victory: clips.victory || prev.victory,
      }));
    }
    setSharedError('');
  }, []);

  // Load custom voice clips, mascot, costumes, trash bins & trash images from preloaded state, disk API, and persistent storage (IndexedDB + localStorage)
  useEffect(() => {
    let isMounted = true;
    const loadAllPersisted = async () => {
      try {
        const inlinePreloaded =
          typeof window !== 'undefined' ? window.__KIEN_SANG_PRELOADED_STATE__ : undefined;

        // Thử đọc thêm các ảnh trang phục & rác đã lưu trên đĩa của dự án (nếu đang chạy server preview)
        let serverAssets: {
          customCostumes?: CustomCostumesMap;
          customTrashImages?: Record<string, string>;
          customMascotUrl?: string | null;
          customOrganicUrl?: string | null;
          customRecyclableUrl?: string | null;
          voiceClips?: VoiceClips;
        } | null = null;

        if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
          try {
            const res = await fetch('./api/preloaded-assets');
            if (res.ok) {
              serverAssets = await res.json();
            }
          } catch {
            // The development-server endpoint is unavailable in static builds.
          }

          if (!serverAssets) {
            try {
              const res = await fetch('./kien-sang-assets.json');
              if (res.ok) {
                serverAssets = await res.json();
              }
            } catch {
              // Static asset manifest is optional in older builds.
            }
          }
        }

        const [
          savedVoice,
          savedMascot,
          savedScale,
          savedCostumes,
          savedOrganic,
          savedRecyclable,
          savedBinScale,
          savedTrashImages,
        ] = sharedAssetsEnabled ? [null, null, null, null, null, null, null, null] : await Promise.all([
          getPersistentItem<VoiceClips | null>(STORAGE_KEY_VOICE, null),
          getPersistentItem<string | null>(STORAGE_KEY_MASCOT, null),
          getPersistentItem<number | null>(STORAGE_KEY_SCALE, null),
          getPersistentItem<CustomCostumesMap | null>(STORAGE_KEY_MASCOT_COSTUMES, null),
          getPersistentItem<string | null>(STORAGE_KEY_BIN_ORGANIC, null),
          getPersistentItem<string | null>(STORAGE_KEY_BIN_RECYCLABLE, null),
          getPersistentItem<number | null>(STORAGE_KEY_BIN_SCALE, null),
          getPersistentItem<Record<string, string> | null>(STORAGE_KEY_TRASH_IMAGES, null),
        ]);

        if (!isMounted) return;

        const mergedVoice: VoiceClips = {
          correct: null, incorrect: null, victory: null,
          ...serverAssets?.voiceClips,
          ...inlinePreloaded?.voiceClips,
          ...savedVoice,
        };
        if (Object.values(mergedVoice).some(Boolean)) {
          setVoiceClips(mergedVoice);
        }

        if (typeof savedScale === 'number' && !isNaN(savedScale)) {
          setMascotScale(savedScale);
        } else if (typeof inlinePreloaded?.mascotScale === 'number') {
          setMascotScale(inlinePreloaded.mascotScale);
        }

        const parsedCostumes: CustomCostumesMap = {
          ...(serverAssets?.customCostumes || {}),
          ...(inlinePreloaded?.customCostumes || {}),
          ...(savedCostumes || {}),
        };

        const effectiveMascot = getPrimaryMascotImage(
          parsedCostumes,
          savedMascot,
          inlinePreloaded?.customMascotUrl,
          serverAssets?.customMascotUrl
        );

        if (effectiveMascot) {
          if (!parsedCostumes['k-v-2']) {
            parsedCostumes['k-v-2'] = effectiveMascot;
          }
          setCustomMascotUrl(effectiveMascot);
        }

        setCustomCostumes(parsedCostumes);
        if (Object.keys(parsedCostumes).length > 0) {
          setPersistentItem(STORAGE_KEY_MASCOT_COSTUMES, parsedCostumes).catch(() => {});
        }

        const offline = window.location.protocol === 'file:';
        const effectiveOrganic =
          (offline && savedOrganic?.startsWith('/') ? null : savedOrganic) ||
          inlinePreloaded?.customOrganicUrl || serverAssets?.customOrganicUrl || null;
        const effectiveRecyclable =
          (offline && savedRecyclable?.startsWith('/') ? null : savedRecyclable) ||
          inlinePreloaded?.customRecyclableUrl ||
          serverAssets?.customRecyclableUrl ||
          null;

        if (effectiveOrganic) setCustomOrganicUrl(effectiveOrganic);
        if (effectiveRecyclable) setCustomRecyclableUrl(effectiveRecyclable);

        if (typeof savedBinScale === 'number' && !isNaN(savedBinScale)) {
          setBinScale(savedBinScale);
        } else if (typeof inlinePreloaded?.binScale === 'number') {
          setBinScale(inlinePreloaded.binScale);
        }

        const mergedTrash: Record<string, string> = {
          ...(serverAssets?.customTrashImages || {}),
          ...(inlinePreloaded?.customTrashImages || {}),
          ...(savedTrashImages || {}),
        };
        setCustomTrashImages(mergedTrash);
        if (Object.keys(mergedTrash).length > 0) {
          setPersistentItem(STORAGE_KEY_TRASH_IMAGES, mergedTrash).catch(() => {});
        }
        if (sharedAssetsEnabled && isMounted) {
          try {
            await refreshSharedAssets();
          } catch (err) {
            console.error('Lỗi tải tài nguyên dùng chung:', err);
            setSharedError(err instanceof Error ? err.message : 'Không thể tải tài nguyên chung.');
          }
        }
      } catch (err) {
        console.warn('Error loading persistent storage:', err);
        if (isMounted) setSharedError('Không thể tải tùy chỉnh. Đang sử dụng tài nguyên hiện có.');
      } finally {
        if (isMounted) setAssetsLoaded(true);
      }
    };

    loadAllPersisted();
    return () => {
      isMounted = false;
    };
  }, [refreshSharedAssets]);

  useEffect(() => {
    if (!assetsLoaded) return;
    let cancelled = false;
    const mascotUrl = getPrimaryMascotImage(customCostumes, customMascotUrl);
    const prepareMascot = async () => {
      const urls = [...new Set([mascotUrl, ...Object.values(customCostumes)]
        .filter((url): url is string => Boolean(url)))];
      const failed = await Promise.all(urls.map(async url => {
        const image = new Image();
        image.src = url;
        try {
          await image.decode();
          return false;
        } catch (err) {
          console.error('Không tải được ảnh trang phục Kiến Sáng:', url, err);
          return true;
        }
      }));
      if (!cancelled && failed.some(Boolean)) {
        setSharedError('Một số ảnh Kiến Sáng không tải được. Hãy kiểm tra kết nối rồi tải lại trang.');
      }
      if (!cancelled) setGameReady(true);
    };
    void prepareMascot();
    return () => { cancelled = true; };
  }, [assetsLoaded, customCostumes, customMascotUrl]);

  const handleImportSettings = async (settings: PreloadedOfflineState) => {
    const entries: [string, unknown][] = [
      [STORAGE_KEY_MASCOT_COSTUMES, settings.customCostumes],
      [STORAGE_KEY_TRASH_IMAGES, settings.customTrashImages],
      [STORAGE_KEY_MASCOT, settings.customMascotUrl],
      [STORAGE_KEY_SCALE, settings.mascotScale],
      [STORAGE_KEY_BIN_ORGANIC, settings.customOrganicUrl],
      [STORAGE_KEY_BIN_RECYCLABLE, settings.customRecyclableUrl],
      [STORAGE_KEY_BIN_SCALE, settings.binScale],
      [STORAGE_KEY_VOICE, settings.voiceClips],
    ];
    for (const [key, value] of entries) {
      await setPersistentItem(key, value);
      const saved = await getPersistentItem<unknown>(key, null);
      if (JSON.stringify(saved) !== JSON.stringify(value)) {
        throw new Error('Không thể lưu đủ tùy chỉnh. Hãy kiểm tra quyền lưu trữ hoặc dung lượng trình duyệt.');
      }
    }
    window.__KIEN_SANG_PRELOADED_STATE__ = settings;
    setCustomCostumes(settings.customCostumes || {});
    setCustomTrashImages(settings.customTrashImages || {});
    setCustomMascotUrl(settings.customMascotUrl || null);
    setMascotScale(settings.mascotScale ?? 1);
    setCustomOrganicUrl(settings.customOrganicUrl || null);
    setCustomRecyclableUrl(settings.customRecyclableUrl || null);
    setBinScale(settings.binScale ?? 0.85);
    setVoiceClips(settings.voiceClips || { correct: null, incorrect: null, victory: null });
  };

  // Save voice clips
  const handleSaveVoiceClips = (clips: VoiceClips) => {
    setVoiceClips(clips);
    setPersistentItem(STORAGE_KEY_VOICE, clips).catch(() => {});
  };

  // Save mascot costumes
  const handleSaveCustomCostumes = async (costumes: CustomCostumesMap) => {
    setCustomCostumes(costumes);
    await setPersistentItem(STORAGE_KEY_MASCOT_COSTUMES, costumes);

    const primaryMascot = getPrimaryMascotImage(costumes);

    if (primaryMascot) {
      setCustomMascotUrl(primaryMascot);
      await setPersistentItem(STORAGE_KEY_MASCOT, primaryMascot);
      try {
        fetch('/api/upload-mascot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: primaryMascot }),
        }).catch(() => {});
      } catch {}
    }
  };

  // Save single mascot image (backwards compatibility)
  const handleSaveMascot = (dataUrl: string | null, scale?: number) => {
    setCustomMascotUrl(dataUrl);
    if (scale !== undefined) {
      setMascotScale(scale);
      setPersistentItem(STORAGE_KEY_SCALE, scale).catch(() => {});
    }
    setCustomCostumes((prev) => {
      const next = {
        ...prev,
        ['k-v-2']: dataUrl,
      };
      setPersistentItem(STORAGE_KEY_MASCOT_COSTUMES, next).catch(() => {});
      return next;
    });
    if (dataUrl) {
      setPersistentItem(STORAGE_KEY_MASCOT, dataUrl).catch(() => {});
    } else {
      removePersistentItem(STORAGE_KEY_MASCOT).catch(() => {});
    }
  };

  // Save trash bin images
  const handleSaveBinImages = (
    organicUrl: string | null,
    recyclableUrl: string | null,
    scale?: number
  ) => {
    setCustomOrganicUrl(organicUrl);
    setCustomRecyclableUrl(recyclableUrl);
    if (scale !== undefined) {
      setBinScale(scale);
      setPersistentItem(STORAGE_KEY_BIN_SCALE, scale).catch(() => {});
    }
    if (organicUrl) {
      setPersistentItem(STORAGE_KEY_BIN_ORGANIC, organicUrl).catch(() => {});
    } else {
      removePersistentItem(STORAGE_KEY_BIN_ORGANIC).catch(() => {});
    }
    if (recyclableUrl) {
      setPersistentItem(STORAGE_KEY_BIN_RECYCLABLE, recyclableUrl).catch(() => {});
    } else {
      removePersistentItem(STORAGE_KEY_BIN_RECYCLABLE).catch(() => {});
    }
  };

  // Save custom 16 trash images
  const handleSaveCustomTrashImages = (newImagesMap: Record<string, string>) => {
    setCustomTrashImages(newImagesMap);
    setPersistentItem(STORAGE_KEY_TRASH_IMAGES, newImagesMap).catch(() => {});
  };

  // Combined definitions with custom images
  const allTrashItems = useMemo(() => {
    return TRASH_ITEMS.map((item) => ({
      ...item,
      customImageUrl: customTrashImages[item.id] || null,
    }));
  }, [customTrashImages]);

  const getItemDef = useCallback(
    (defId: string) => {
      return allTrashItems.find((d) => d.id === defId) ||
        YARD_TRASH_ITEMS.find((d) => d.id === defId);
    },
    [allTrashItems]
  );

  // Carried trash item definition when carried by Kiến Sáng
  const carriedItem = useMemo(() => {
    return activeItems.find((it) => it.instanceId === carriedItemInstanceId);
  }, [activeItems, carriedItemInstanceId]);

  const carriedItemDef = useMemo(() => {
    return carriedItem ? getItemDef(carriedItem.defId) : null;
  }, [carriedItem, getItemDef]);

  // Quick 1-click upload
  const handleQuickUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          handleSaveMascot(result, mascotScale);
          try {
            await fetch('/api/upload-mascot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: result }),
            });
          } catch {}
          setKienMood('happy');
          triggerSpeech('A! Đã nhận đúng ảnh kien-sang-main.png rồi! Cùng dọn lớp với bạn Kiến Sáng nhé!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to trigger speech and speech bubble
  const triggerSpeech = useCallback(
    (text: string, customClipKey?: keyof VoiceClips) => {
      setKienSpeech(text);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      const clipKey = customClipKey || voiceIdForText(text);
      const clipUrl = clipKey ? voiceClips[clipKey] : null;
      speakKienSang(text, clipUrl);

      speechTimeoutRef.current = window.setTimeout(() => {
        // Return to idle message if not victory
        if (score < MAX_SCORE) {
          setKienSpeech('Bé tiếp tục phân loại rác nhé!');
        }
      }, 4500);
    },
    [voiceClips, score]
  );

  // Spawn five non-overlapping trash items.
  const spawnTrashBatch = useCallback(() => {
    const area = playAreaRef.current;
    const left = leftBinRef.current;
    const right = rightBinRef.current;
    if (!area || !left || !right) {
      console.error('Không thể đặt rác: chưa xác định được vùng chơi và thùng rác.');
      return;
    }
    const getCurrentSpawnSlots = (playArea: HTMLDivElement) => {
      const playableElement = playArea.querySelector<HTMLElement>('[data-trash-play-area]');
      if (!playableElement) {
        console.error('Không thể đặt rác: chưa xác định được vùng sàn của cảnh.');
        return { bounds: null, slots: [] };
      }
      const bounds = playArea.getBoundingClientRect();
      const playableBounds = playableElement.getBoundingClientRect();
      const obstacles = Array.from(playArea.querySelectorAll<HTMLElement>('[data-trash-blocker]'))
        .map(element => element.getBoundingClientRect())
        .filter(rect => rect.width > 0 && rect.height > 0);
      const bins = [leftBinRef.current, rightBinRef.current]
        .filter((bin): bin is HTMLDivElement => Boolean(bin))
        .map(bin => bin.getBoundingClientRect());
      return {
        bounds,
        slots: getTrashSpawnSlots(bounds, bins, playableBounds, obstacles),
      };
    };
    const { bounds: areaBounds, slots: availableSlots } = getCurrentSpawnSlots(area);
    if (!areaBounds) return;
    const slots = getNonOverlappingTrashSpawnSlots(
      availableSlots,
      areaBounds,
      TRASH_BATCH_SIZE
    );
    if (slots.length < TRASH_BATCH_SIZE) {
      console.error('Không đủ vùng trống an toàn để đặt rác.');
      setKienSpeech('Vùng chơi quá nhỏ. Hãy phóng to cửa sổ hoặc giảm kích thước thùng rác rồi chơi lại nhé!');
      return;
    }

    const currentScene = sceneRef.current;
    const sceneItems = currentScene === 'yard' ? YARD_TRASH_ITEMS : TRASH_ITEMS;
    const { selected: chosenDefs, remaining } = drawTrashItems(
      sceneItems,
      trashCycleRef.current[currentScene],
      TRASH_BATCH_SIZE
    );
    trashCycleRef.current[currentScene] = remaining;

    const newItems: ActiveTrashItem[] = chosenDefs.map((def, idx) => ({
      instanceId: `trash_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      defId: def.id,
      xPercent: slots[idx].x,
      yPercent: slots[idx].y,
      rotation: Math.floor(Math.random() * 30) - 15,
      visualVariant: currentScene === 'yard' ? Math.floor(Math.random() * 3) : undefined,
    }));

    sceneItemsRef.current[currentScene] = newItems;
    activeItemsRef.current = newItems;
    setActiveItems(newItems);
    setSelectedTrashId(null);

    const scheduleYardTrashRelocation = (instanceId: string) => {
      window.setTimeout(() => {
        const reschedule = () => scheduleYardTrashRelocation(instanceId);
        if (sceneRef.current !== 'yard') {
          reschedule();
          return;
        }

        const currentItems = activeItemsRef.current;
        const item = currentItems.find(current => current.instanceId === instanceId);
        if (!item) return;
        if (item.isDragging || draggingItemRef.current?.id === instanceId) {
          reschedule();
          return;
        }

        const currentArea = playAreaRef.current;
        if (!currentArea) {
          console.error('Không thể di chuyển rác trong sân: chưa xác định được vùng chơi.');
          reschedule();
          return;
        }
        if (!currentArea.querySelector('[data-trash-play-area]')) {
          reschedule();
          return;
        }
        const { bounds, slots } = getCurrentSpawnSlots(currentArea);
        if (!bounds) {
          reschedule();
          return;
        }
        const occupied = currentItems
          .map(current => ({ x: current.xPercent, y: current.yPercent }));
        const [destination] = getNonOverlappingTrashSpawnSlots(slots, bounds, 1, occupied);
        if (!destination) {
          console.error('Không tìm được vị trí trống an toàn để gió thổi rác sang.');
          reschedule();
          return;
        }

        const updatedItems = currentItems.map(current =>
          current.instanceId === instanceId
            ? {
                ...current,
                xPercent: destination.x,
                yPercent: destination.y,
                rotation: Math.floor(Math.random() * 30) - 15,
              }
            : current
        );
        activeItemsRef.current = updatedItems;
        sceneItemsRef.current.yard = updatedItems;
        setActiveItems(updatedItems);
        reschedule();
      }, 4000);
    };

    if (currentScene === 'yard') {
      newItems.forEach(item => scheduleYardTrashRelocation(item.instanceId));
    }
  }, []);

  const switchScene = useCallback((nextScene: GameScene) => {
    const currentScene = sceneRef.current;
    if (currentScene === nextScene) return;
    if (carriedItemInstanceId || isMoving || draggingItem) {
      triggerSpeech('Kiến Sáng đang nhặt rác rồi. Hãy hoàn thành lượt này trước khi đổi cảnh nhé!');
      return;
    }

    sceneItemsRef.current[currentScene] = activeItemsRef.current;
    sceneRef.current = nextScene;
    setScene(nextScene);
    setSelectedTrashId(null);
    setDraggingItem(null);
    draggingItemRef.current = null;
    setKienMood('idle');

    const savedItems = sceneItemsRef.current[nextScene];
    if (savedItems) {
      setActiveItems(savedItems);
    } else {
      setActiveItems([]);
      window.setTimeout(() => {
        if (sceneRef.current === nextScene) spawnTrashBatch();
      }, 0);
    }
  }, [carriedItemInstanceId, draggingItem, isMoving, spawnTrashBatch, triggerSpeech]);

  useEffect(() => {
    sceneItemsRef.current[scene] = activeItems;
  }, [activeItems, scene]);

  // Initialize game on load
  useEffect(() => {
    if (!gameReady) return;
    let cancelled = false;
    const images = [leftBinRef.current, rightBinRef.current]
      .flatMap(bin => Array.from(bin?.querySelectorAll('img') || []));
    Promise.all(images.map(image => image.decode().catch(err => {
      console.warn('Không tải được ảnh thùng rác khi chuẩn bị vùng đặt rác:', err);
    }))).then(() => {
      if (!cancelled) spawnTrashBatch();
    });
    return () => { cancelled = true; };
  }, [spawnTrashBatch, gameReady]);

  // Restart game
  const handleRestart = () => {
    setScore(0);
    trashCycleRef.current = { classroom: [], yard: [] };
    sceneItemsRef.current = { classroom: null, yard: null };
    setKienMood('idle');
    setKienX(50);
    setKienY(68);
    setIsVictoryModalOpen(false);
    setSelectedTrashId(null);
    setDraggingItem(null);
    draggingItemRef.current = null;
    triggerSpeech('Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé!');
    spawnTrashBatch();
  };

  // Check victory condition
  useEffect(() => {
    if (score >= MAX_SCORE) {
      setKienMood('victory');
      playVictoryFanfare();
      triggerSpeech(`Yeah, ${MAX_SCORE} sao rồi, lớp mình sạch quá!`, 'victory');
      setIsVictoryModalOpen(true);
    }
  }, [score, triggerSpeech]);

  // Handle right/wrong sorting action
  const processTrashSorting = (
    instanceId: string,
    chosenCategory: TrashCategory,
    onCompleteCallback?: (isCorrect: boolean) => void
  ) => {
    const activeItem = activeItems.find((it) => it.instanceId === instanceId);
    if (!activeItem) return;

    const itemDef = getItemDef(activeItem.defId);
    if (!itemDef) return;

    setCarriedItemInstanceId(null);

    if (itemDef.category === chosenCategory) {
      // ĐÚNG THÙNG RÁC
      playDropSfx();
      playSuccessSfx();
      setKienMood('happy');
      setBouncingBin(chosenCategory);
      setTimeout(() => setBouncingBin(null), 800);

      // Reo vui
      const compliments = [
        'Hoan hô! Đúng rồi bạn ơi!',
        'Tuyệt vời quá! Bé giỏi lắm!',
        'Đúng rồi! Cảm ơn bé nhiều nhé!',
      ];
      const comp = compliments[Math.floor(Math.random() * compliments.length)];
      triggerSpeech(comp, 'correct');

      // Update score and remove item
      setScore((prev) => {
        const nextScore = Math.min(MAX_SCORE, prev + 1);
        return nextScore;
      });

      setActiveItems((prev) => {
        const remaining = prev.filter((it) => it.instanceId !== instanceId);
        if (remaining.length === 0 && score + 1 < MAX_SCORE) {
          // Khi đã bỏ đúng hết 5 món rác, tự động xuất hiện tiếp 5 món rác ngẫu nhiên mới!
          setTimeout(() => {
            spawnTrashBatch();
            triggerSpeech('Hoan hô! Đã dọn sạch 5 món rác! Cùng tiếp tục với 5 món rác mới nhé!');
          }, 800);
        }
        return remaining;
      });

      setSelectedTrashId(null);
      onCompleteCallback?.(true);

      setTimeout(() => {
        if (score + 1 < MAX_SCORE) {
          setKienMood('idle');
        }
      }, 2500);
    } else {
      // THẢ SAI THÙNG RÁC
      playErrorSfx();
      setKienMood('sad');

      // Kiến Sáng biểu cảm buồn + câu nói động viên theo yêu cầu:
      // "Ôi nhầm rồi, bạn thử lại nhé!"
      triggerSpeech('Ôi nhầm rồi, bạn thử lại nhé!', 'incorrect');

      // Món rác bật ngược lại vị trí cũ trên sàn
      setActiveItems((prev) =>
        prev.map((it) => {
          if (it.instanceId === instanceId) {
            return {
              ...it,
              isDragging: false,
              isReturning: true,
              rotation: (it.rotation + 30) % 360,
            };
          }
          return it;
        })
      );

      setSelectedTrashId(null);
      onCompleteCallback?.(false);

      // Return to idle mood after a moment
      setTimeout(() => {
        setKienMood('idle');
        setActiveItems((prev) =>
          prev.map((it) => (it.instanceId === instanceId ? { ...it, isReturning: false } : it))
        );
      }, 2400);
    }
  };

  // Xử lý nhặt hoặc thả rác khi nhấn Phím Cách / Nút tương tác
  const handleActionPickOrDrop = () => {
    // If carrying trash -> check if near bin to drop
    if (carriedItemInstanceId) {
      if (kienX <= 32) {
        // Drop into Organic bin
        setKienMood('dropping');
        playDropSfx();
        setTimeout(() => {
          processTrashSorting(carriedItemInstanceId, 'organic');
        }, 450);
      } else if (kienX >= 68) {
        // Drop into Recyclable bin
        setKienMood('dropping');
        playDropSfx();
        setTimeout(() => {
          processTrashSorting(carriedItemInstanceId, 'recyclable');
        }, 450);
      } else {
        triggerSpeech(
          'Kiến Sáng hãy đi lại gần Thùng Xanh (bên trái) hoặc Thùng Cam (bên phải) rồi nhấn Phím Cách nhé!'
        );
      }
    } else {
      // If NOT carrying -> find nearest trash item on floor to pick up
      let closestItem: ActiveTrashItem | null = null;
      let minDistance = 999;

      activeItems.forEach((it) => {
        if (it.isDragging) return;
        // Khoảng cách thực tế từ vị trí chân bạn Kiến tới tâm món rác
        const dist = Math.hypot(kienX - it.xPercent, (kienY - 6) - it.yPercent);
        if (dist < minDistance) {
          minDistance = dist;
          closestItem = it;
        }
      });

      if (closestItem && minDistance < 22) {
        const itemToPick = closestItem as ActiveTrashItem;
        playPickSfx();
        setKienMood('picking');
        setCarriedItemInstanceId(itemToPick.instanceId);
        setActiveItems((prev) =>
          prev.map((it) =>
            it.instanceId === itemToPick.instanceId ? { ...it, isDragging: true } : it
          )
        );
        const def = getItemDef(itemToPick.defId);
        triggerSpeech(
          `Kiến Sáng đã nhặt "${def?.nameVi || 'món rác'}"! Hãy đưa tới thùng rác thích hợp nhé!`
        );
        setTimeout(() => {
          setKienMood('carrying');
        }, 350);
      } else {
        triggerSpeech(
          'Hãy dùng phím mũi tên ⬅️ ➡️ đi lại gần món rác trên sàn rồi nhấn Phím Cách để nhặt nhé!'
        );
      }
    }
  };

  // Keep refs for latest states so keyboard listener and movement loop never re-bind during movement
  const carriedItemInstanceIdRef = useRef(carriedItemInstanceId);
  carriedItemInstanceIdRef.current = carriedItemInstanceId;

  const kienXRef = useRef(kienX);
  kienXRef.current = kienX;

  const kienYRef = useRef(kienY);
  kienYRef.current = kienY;

  const handleActionPickOrDropRef = useRef(handleActionPickOrDrop);
  handleActionPickOrDropRef.current = handleActionPickOrDrop;

  // Smooth RAF movement engine for 60fps continuous buttery movement
  const heldDirectionsRef = useRef<Set<'left' | 'right' | 'up' | 'down'>>(new Set());
  const rafMovementIdRef = useRef<number | null>(null);
  const autopilotRafRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);

  // Hàm di chuyển Bạn Kiến Sáng mượt mà 60fps từ vị trí hiện tại đến đích (targetX, targetY)
  // Tốc độ đều đặn tự nhiên, chân bước 12 dáng nhịp nhàng, không bị giật hay nhảy cóc
  const animateKienTo = useCallback(
    (
      targetX: number,
      targetY: number,
      moodDuringMove: KienSangMood,
      onComplete?: () => void
    ) => {
      if (autopilotRafRef.current) {
        cancelAnimationFrame(autopilotRafRef.current);
        autopilotRafRef.current = null;
      }

      const area = playAreaRef.current;
      if (!area) {
        console.error('Không thể di chuyển Kiến Sáng: chưa xác định được vùng chơi.');
        return;
      }
      const startX = kienXRef.current;
      const startY = kienYRef.current;
      const durationMs = getCommandMoveDuration(
        startX, startY, targetX, targetY, area.getBoundingClientRect()
      );
      const startTime = performance.now();
      let lastStepTickTime = performance.now();

      // Đổi hướng mặt theo chiều di chuyển
      if (Math.abs(targetX - startX) > 0.6) {
        setFacingDirection(targetX >= startX ? 'right' : 'left');
      }

      setIsMoving(true);
      setKienMood(moodDuringMove);

      const frame = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, Math.max(0, elapsed / durationMs));
        // Tiến trình di chuyển mượt mà tự nhiên chuẩn đồ họa 60 FPS (Ease-in-out quad)
        const progress =
          rawProgress < 0.5
            ? 2 * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;

        setKienX(currentX);
        setKienY(currentY);
        kienXRef.current = currentX;
        kienYRef.current = currentY;

        // Cập nhật nhịp bước chân 12 trang phục mỗi 75ms (nhịp bước tự nhiên sinh động)
        if (now - lastStepTickTime >= 75) {
          lastStepTickTime = now;
          setWalkStepTick((prev) => prev + 1);
        }

        if (rawProgress < 1) {
          autopilotRafRef.current = requestAnimationFrame(frame);
        } else {
          autopilotRafRef.current = null;
          setIsMoving(false);
          setKienX(targetX);
          setKienY(targetY);
          kienXRef.current = targetX;
          kienYRef.current = targetY;
          onComplete?.();
        }
      };

      autopilotRafRef.current = requestAnimationFrame(frame);
    },
    []
  );

  const updateSmoothMovement = useCallback(() => {
    const held = heldDirectionsRef.current;
    if (held.size === 0) {
      setIsMoving(false);
      setKienMood(carriedItemInstanceIdRef.current ? 'carrying' : 'idle');
      rafMovementIdRef.current = null;
      return;
    }

    setIsMoving(true);
    setKienMood(carriedItemInstanceIdRef.current ? 'carrying' : 'walking');

    // Tốc độ di chuyển liên tục khi giữ phím (nhanh nhẹn, mượt mà, cho phép đi khắp lớp học)
    // Cho phép đi xuống tới 99% (chạm mép đáy màn hình) và lên tới 44% (chân bảng)
    if (held.has('left')) {
      setFacingDirection('left');
      setKienX((prev) => Math.max(4, prev - 0.38));
    }
    if (held.has('right')) {
      setFacingDirection('right');
      setKienX((prev) => Math.min(96, prev + 0.38));
    }
    if (held.has('up')) {
      setKienY((prev) => Math.max(44, prev - 0.32));
    }
    if (held.has('down')) {
      // Cho phép nhân vật đi xuống tận đáy màn hình (100%)
      setKienY((prev) => Math.min(100, prev + 0.35));
    }

    // Nhịp bước chân khi giữ phím: mỗi 75ms chuyển tiếp 1 frame trong 12 frame hoạt họa
    const now = performance.now();
    if (now - lastStepTimeRef.current >= 75) {
      lastStepTimeRef.current = now;
      setWalkStepTick((prev) => prev + 1);
    }

    rafMovementIdRef.current = requestAnimationFrame(updateSmoothMovement);
  }, []);

  const startMovingDir = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      // Dừng autopilot nếu người dùng chủ động bấm phím
      if (autopilotRafRef.current) {
        cancelAnimationFrame(autopilotRafRef.current);
        autopilotRafRef.current = null;
      }

      heldDirectionsRef.current.add(dir);

      // Đổi hướng mặt
      if (dir === 'left') setFacingDirection('left');
      if (dir === 'right') setFacingDirection('right');

      // TỪNG LẦN BẤM PHÍM: lập tức chuyển 1 bước trang phục và dịch chuyển tức thời 1 cự ly tự nhiên
      setWalkStepTick((prev) => prev + 1);
      lastStepTimeRef.current = performance.now();

      // Cự ly bước đi tức thời (cho phép đi xuống cuối màn hình tới 100%)
      if (dir === 'left') setKienX((prev) => Math.max(4, prev - 1.2));
      if (dir === 'right') setKienX((prev) => Math.min(96, prev + 1.2));
      if (dir === 'up') setKienY((prev) => Math.max(44, prev - 1.0));
      if (dir === 'down') setKienY((prev) => Math.min(100, prev + 1.0));

      if (!rafMovementIdRef.current) {
        rafMovementIdRef.current = requestAnimationFrame(updateSmoothMovement);
      }
    },
    [updateSmoothMovement]
  );

  const stopMovingDir = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      heldDirectionsRef.current.delete(dir);
      if (heldDirectionsRef.current.size === 0) {
        if (rafMovementIdRef.current) {
          cancelAnimationFrame(rafMovementIdRef.current);
          rafMovementIdRef.current = null;
        }
        setIsMoving(false);
        setKienMood(carriedItemInstanceIdRef.current ? 'carrying' : 'idle');
      }
    },
    []
  );

  const stopAllMovement = useCallback(() => {
    heldDirectionsRef.current.clear();
    if (rafMovementIdRef.current) {
      cancelAnimationFrame(rafMovementIdRef.current);
      rafMovementIdRef.current = null;
    }
    if (autopilotRafRef.current) {
      cancelAnimationFrame(autopilotRafRef.current);
      autopilotRafRef.current = null;
    }
    setIsMoving(false);
    setKienMood(carriedItemInstanceIdRef.current ? 'carrying' : 'idle');
  }, []);

  // Keyboard controls for moving Bạn Kiến Sáng:
  // "Bước đi sẽ có 12 bước ứng với 12 hình ảnh, hình ảnh bước đi thay đổi lặp lại mượt mà khi bấm phím điều khiển"
  useEffect(() => {
    const isAnyModalOpen =
      isVoiceModalOpen ||
      isScratchModalOpen ||
      isVictoryModalOpen ||
      isMascotModalOpen ||
      isCostumesModalOpen ||
      isTrashBinModalOpen ||
      isTrashItemsModalOpen ||
      isOfflineHtmlModalOpen;

    if (!gameReady || isAnyModalOpen || isGardenOpen) {
      stopAllMovement();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tránh việc giữ phím khiến trình duyệt bắn lặp keydown liên tục làm nhân vật bị nhân đôi tốc độ
      if (e.repeat) return;

      const key = e.key;

      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        e.preventDefault();
        startMovingDir('left');
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        e.preventDefault();
        startMovingDir('right');
      } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        e.preventDefault();
        startMovingDir('up');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        e.preventDefault();
        startMovingDir('down');
      } else if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        handleActionPickOrDropRef.current();
      }
    };

    // Khi người chơi nhả phím điều khiển -> Dừng chuyển động
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        stopMovingDir('left');
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        stopMovingDir('right');
      } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        stopMovingDir('up');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        stopMovingDir('down');
      }
    };

    const handleWindowBlur = () => {
      stopAllMovement();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      stopAllMovement();
    };
  }, [
    gameReady,
    isVoiceModalOpen,
    isScratchModalOpen,
    isVictoryModalOpen,
    isMascotModalOpen,
    isCostumesModalOpen,
    isTrashBinModalOpen,
    isTrashItemsModalOpen,
    isOfflineHtmlModalOpen,
    isGardenOpen,
    startMovingDir,
    stopMovingDir,
    stopAllMovement,
  ]);

  // ==========================================
  // OPTION 1: BÉ TỰ KÉO THẢ RÁC VÀO THÙNG
  // ==========================================
  const handlePointerDownTrash = (
    e: React.PointerEvent,
    item: ActiveTrashItem
  ) => {
    if (gameMode !== 'drag' || kienMood === 'walking' || kienMood === 'carrying') {
      return;
    }

    e.preventDefault();
    playPickSfx();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const nextDraggingItem = {
      id: item.instanceId,
      origX: item.xPercent,
      origY: item.yPercent,
      curX: e.clientX,
      curY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    };
    draggingItemRef.current = nextDraggingItem;
    setDraggingItem(nextDraggingItem);
  };

  // Pointer move handler on container
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem) return;

    setDraggingItem((prev) => (prev ? { ...prev, curX: e.clientX, curY: e.clientY } : null));

    // Detect if hovering over left bin or right bin
    const leftRect = leftBinRef.current?.getBoundingClientRect();
    const rightRect = rightBinRef.current?.getBoundingClientRect();

    if (
      leftRect &&
      e.clientX >= leftRect.left &&
      e.clientX <= leftRect.right &&
      e.clientY >= leftRect.top &&
      e.clientY <= leftRect.bottom
    ) {
      setHoveredBin('organic');
    } else if (
      rightRect &&
      e.clientX >= rightRect.left &&
      e.clientX <= rightRect.right &&
      e.clientY >= rightRect.top &&
      e.clientY <= rightRect.bottom
    ) {
      setHoveredBin('recyclable');
    } else {
      setHoveredBin(null);
    }
  };

  // Pointer up handler on container
  const handlePointerUp = () => {
    if (!draggingItem) return;

    const currentDragging = draggingItem;
    setDraggingItem(null);
    draggingItemRef.current = null;

    const leftRect = leftBinRef.current?.getBoundingClientRect();
    const rightRect = rightBinRef.current?.getBoundingClientRect();
    const px = currentDragging.curX;
    const py = currentDragging.curY;

    let targetCategory: TrashCategory | null = null;
    if (
      leftRect &&
      px >= leftRect.left &&
      px <= leftRect.right &&
      py >= leftRect.top &&
      py <= leftRect.bottom
    ) {
      targetCategory = 'organic';
    } else if (
      rightRect &&
      px >= rightRect.left &&
      px <= rightRect.right &&
      py >= rightRect.top &&
      py <= rightRect.bottom
    ) {
      targetCategory = 'recyclable';
    }

    setHoveredBin(null);

    if (targetCategory) {
      processTrashSorting(currentDragging.id, targetCategory);
    }
  };

  // ==========================================
  // OPTION 2: NHỜ BẠN KIẾN SÁNG NHẶT VÀ THẢ
  // ==========================================
  // Click on trash item: shines / enlarges to indicate selected
  const handleClickTrashCommand = (item: ActiveTrashItem) => {
    if (gameMode !== 'command' || kienMood === 'walking' || kienMood === 'carrying') {
      return;
    }

    playPickSfx();
    setSelectedTrashId(item.instanceId);

    const def = getItemDef(item.defId);
    triggerSpeech(`Bé đã chọn "${def?.nameVi || 'món rác'}"! Hãy bấm vào thùng rác muốn bỏ nhé!`);
  };

  // Click on a bin to command Kiến Sáng to pick and drop trash
  const handleCommandBinClick = (chosenCategory: TrashCategory) => {
    if (!selectedTrashId || isMoving || kienMood === 'walking' || kienMood === 'carrying') {
      if (!selectedTrashId) {
        triggerSpeech('Bé hãy bấm chọn một món rác trên sàn trước nhé!');
      }
      return;
    }

    const item = activeItems.find((it) => it.instanceId === selectedTrashId);
    if (!item) return;

    // Khoảng cách tới món rác
    const targetItemY = Math.min(98, item.yPercent + 4);

    // Phase 1: Kiến Sáng bước đi mượt mà tới vị trí món rác (hoạt họa 12 frame chân nhịp nhàng)
    animateKienTo(
      item.xPercent,
      targetItemY,
      'walking',
      () => {
        // Phase 2: Cúi người nhặt rác lên (Pick up action)
        playPickSfx();
        setKienMood('picking');
        setCarriedItemInstanceId(item.instanceId);

        // Tạm ẩn món rác khỏi sàn khi Kiến Sáng ôm trên tay
        setActiveItems((prev) =>
          prev.map((it) =>
            it.instanceId === item.instanceId ? { ...it, isDragging: true } : it
          )
        );

        setTimeout(() => {
          // Phase 3: Kiến Sáng ôm rác đi mượt mà tới thùng rác đã chọn (Carry & Walk)
          const area = playAreaRef.current;
          const bin = chosenCategory === 'organic' ? leftBinRef.current : rightBinRef.current;
          const binImage = bin?.querySelector('img');
          const robot = area?.querySelector('[data-robot-sprite]');
          if (!area || !binImage || !robot) {
            console.error('Không thể xác định vị trí thùng rác hoặc nhân vật.');
            triggerSpeech('Chưa xác định được vị trí thùng rác, bạn hãy chọn lại nhé!');
            setIsMoving(false);
            setKienMood('idle');
            setCarriedItemInstanceId(null);
            setActiveItems(prev => prev.map(it => it.instanceId === item.instanceId
              ? { ...it, isDragging: false } : it));
            return;
          }
          const target = getBinApproachTarget(
            area.getBoundingClientRect(),
            binImage.getBoundingClientRect(),
            robot.getBoundingClientRect().width,
            chosenCategory === 'organic'
          );
          const targetBinX = target.x;
          const targetBinY = target.y;

          animateKienTo(
            targetBinX,
            targetBinY,
            'carrying',
            () => {
              // Phase 4: Bỏ vào thùng rác (động tác thả rác k-6, k-7, k-8)
              setKienMood('dropping');
              playDropSfx();

              setTimeout(() => {
                // Phase 5: Chấm điểm và hiển thị biểu cảm
                processTrashSorting(item.instanceId, chosenCategory, (isCorrect) => {
                  if (isCorrect) {
                    // Sau khi đúng, bạn Kiến ăn mừng rồi bước mượt mà về vị trí trung tâm lớp
                    setTimeout(() => {
                      animateKienTo(50, 74, 'walking', () => {
                        setFacingDirection('right');
                        setKienMood('idle');
                      });
                    }, 1400);
                  } else {
                    // Khi sai, bạn Kiến buồn một chút rồi bước lại vị trí trung tâm lớp để bé chọn lại
                    setTimeout(() => {
                      animateKienTo(50, 74, 'walking', () => {
                        setFacingDirection('right');
                        setKienMood('idle');
                      });
                    }, 1600);
                  }
                });
              }, 450);
            }
          );
        }, 350);
      }
    );
  };

  // Toggle or switch game modes
  const handleSelectGameMode = (mode: GameMode) => {
    if (autopilotRafRef.current) {
      cancelAnimationFrame(autopilotRafRef.current);
      autopilotRafRef.current = null;
    }
    setIsMoving(false);
    setGameMode(mode);
    setSelectedTrashId(null);
    setDraggingItem(null);
    draggingItemRef.current = null;
    if (mode === 'drag') {
      triggerSpeech('Chế độ: Bé tự nhấn giữ chuột kéo rác thả vào thùng nhé!');
    } else {
      triggerSpeech('Chế độ: Bé bấm chọn rác, rồi bấm chọn thùng để tớ chạy lại nhặt nhé!');
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Đã xảy ra sự cố hiển thị trong trò chơi">
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-busy={!gameReady}
        className={`relative w-screen h-screen flex flex-col overflow-hidden bg-slate-900 select-none font-sans ${gameReady ? '' : 'invisible'}`}
      >
      {!gameReady && (
        <div role="status" className="visible fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-lg font-bold text-amber-100">
          Đang tải trò chơi…
        </div>
      )}
      {/* Thanh công cụ trên cùng */}
      {!isGardenOpen && <TopBar
        readOnly={sharedAssetsEnabled}
        score={score}
        maxScore={MAX_SCORE}
        gameMode={gameMode}
        onSelectGameMode={handleSelectGameMode}
        onOpenVoiceStudio={() => setIsVoiceModalOpen(true)}
        onOpenScratchModal={() => setIsScratchModalOpen(true)}
        onOpenOfflineHtmlModal={() => setIsOfflineHtmlModalOpen(true)}
        onOpenMascotModal={() => setIsCostumesModalOpen(true)}
        onOpenCostumesModal={() => setIsCostumesModalOpen(true)}
        onOpenTrashBinModal={() => {
          setTargetBinCategory(null);
          setIsTrashBinModalOpen(true);
        }}
        onOpenTrashItemsModal={() => setIsTrashItemsModalOpen(true)}
        onRestart={handleRestart}
        hasCustomVoice={Object.values(voiceClips).some(Boolean)}
        customMascotUrl={customMascotUrl}
        hasCustomBins={Boolean(customOrganicUrl || customRecyclableUrl)}
        customTrashCount={Object.keys(customTrashImages).filter((k) => !!customTrashImages[k]).length}
        totalTrashCount={TRASH_ITEMS.length}
        customCostumesCount={Object.keys(customCostumes).filter((k) => !!customCostumes[k as CostumeId]).length}
        totalCostumesCount={MASCOT_COSTUMES.length}
      />}
      {sharedError && <div role="alert" className="bg-red-50 text-red-800 text-xs p-2 z-50">
        Không tải được tài nguyên dùng chung; đang giữ ảnh hiện có. {sharedError}
        <button className="ml-2 underline" onClick={() => {
          refreshSharedAssets().catch(err => setSharedError(err instanceof Error ? err.message : 'Lỗi tải tài nguyên.'));
        }}>Thử lại</button>
      </div>}

      {/* KHUNG CẢNH LỚP HỌC CHÍNH */}
      <div ref={playAreaRef} className="relative flex-1 w-full h-full overflow-hidden">
        {isGardenOpen ? (
          <SunlitGardenGame
            onReturnToClassroom={() => setIsGardenOpen(false)}
            customMascotUrl={customMascotUrl}
            customCostumes={customCostumes}
            mascotScale={mascotScale}
          />
        ) : <>
        {scene === 'classroom' ? (
          <ClassroomBackground
            onVisitYard={() => switchScene('yard')}
            onVisitGarden={() => setIsGardenOpen(true)}
          />
        ) : (
          <YardBackground onReturnToClassroom={() => switchScene('classroom')} />
        )}
        {scene === 'classroom' && (
          <button
            type="button"
            onClick={() => switchScene('yard')}
            className="absolute left-3 top-3 z-30 rounded-full border-2 border-sky-700 bg-white/95 px-3 py-2 text-xs font-black text-sky-900 shadow-lg sm:hidden"
            aria-label="Đi ra sân trường"
          >
            🌳 Ra sân
          </button>
        )}

        {/* Nút bấm nhanh / Nhắc nhở mở Xưởng Trang Phục Scratch của Bạn Kiến Sáng */}
        {!sharedAssetsEnabled && <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsCostumesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-lg border-2 text-xs font-black transition active:scale-95 cursor-pointer backdrop-blur-xs bg-white/95 border-orange-400 text-orange-850 hover:bg-orange-50"
            title="Mở Xưởng tải lên 12 ảnh tìm rác và 15 nhóm cầm rác Scratch của Bạn Kiến Sáng"
          >
            <Shirt className="w-3.5 h-3.5 text-orange-600" />
            <span>Trang Phục Bạn Kiến</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black">
              {Object.keys(customCostumes).filter((k) => !!customCostumes[k]).length}/{MASCOT_COSTUMES.length}
            </span>
          </button>
        </div>}

        {/* THÙNG RÁC GÓC TRÁI: RÁC HỮU CƠ / THỨC ĂN & CÂY CỎ (MÀU XANH LÁ) */}
        <div
          ref={leftBinRef}
          className="absolute left-3 sm:left-8 bottom-3 sm:bottom-6 z-20"
        >
          <TrashBin
            category="organic"
            isOpen={hoveredBin === 'organic'}
            isHovered={hoveredBin === 'organic'}
            isSelected={gameMode === 'command' && selectedTrashId !== null}
            bounce={bouncingBin === 'organic'}
            customImageSrc={customOrganicUrl}
            binScale={binScale}
            onOpenUploadModal={sharedAssetsEnabled ? undefined : () => {
              setTargetBinCategory('organic');
              setIsTrashBinModalOpen(true);
            }}
            onClick={() => {
              if (gameMode === 'command') {
                handleCommandBinClick('organic');
              }
            }}
          />
        </div>

        {/* THÙNG RÁC GÓC PHẢI: RÁC TÁI CHẾ / HỘP SỮA & CHAI NHỰA (MÀU CAM/XANH DƯƠNG) */}
        <div
          ref={rightBinRef}
          className="absolute right-3 sm:right-8 bottom-3 sm:bottom-6 z-20"
        >
          <TrashBin
            category="recyclable"
            isOpen={hoveredBin === 'recyclable'}
            isHovered={hoveredBin === 'recyclable'}
            isSelected={gameMode === 'command' && selectedTrashId !== null}
            bounce={bouncingBin === 'recyclable'}
            customImageSrc={customRecyclableUrl}
            binScale={binScale}
            onOpenUploadModal={sharedAssetsEnabled ? undefined : () => {
              setTargetBinCategory('recyclable');
              setIsTrashBinModalOpen(true);
            }}
            onClick={() => {
              if (gameMode === 'command') {
                handleCommandBinClick('recyclable');
              }
            }}
          />
        </div>

        {/* BẠN KIẾN SÁNG NHÂN VẬT CHÍNH (HOẠT HÌNH SCRATCH: TIM_RAC, CAM_RAC, VUI, BUON) */}
        <RobotKienSang
          mood={kienMood}
          carriedTrashId={carriedItemDef?.id || null}
          speechText=""
          xPercent={kienX}
          yPercent={kienY}
          onReplaySpeech={() => triggerSpeech(kienSpeech)}
          isMoving={isMoving}
          walkStepTick={walkStepTick}
          customMascotUrl={customMascotUrl}
          customCostumes={customCostumes}
          mascotScale={mascotScale}
          facingDirection={facingDirection}
          carriedItemDef={carriedItemDef}
          carriedItemVariant={carriedItem?.visualVariant}
          onOpenMascotModal={sharedAssetsEnabled ? undefined : () => setIsCostumesModalOpen(true)}
        />

        {/* CÁC MÓN RÁC TRÊN SÀN (5 MÓN MỖI LẦN) */}
        {activeItems.map((item) => {
          const def = getItemDef(item.defId);
          if (!def) return null;

          const isCurrentDragging = draggingItem?.id === item.instanceId;
          const isSelected = selectedTrashId === item.instanceId;

          // If dragging via mouse/touch, position at pointer
          let itemStyle: React.CSSProperties = {
            left: `${item.xPercent}%`,
            top: `${item.yPercent}%`,
            transform: 'translate(-50%, -50%)',
          };

          if (isCurrentDragging && draggingItem) {
            itemStyle = {
              left: `${draggingItem.curX}px`,
              top: `${draggingItem.curY}px`,
              position: 'fixed',
              transform: 'translate(-50%, -50%) scale(1.2)',
              pointerEvents: 'none',
              zIndex: 100,
            };
          }
          if (scene === 'yard' && !isCurrentDragging) {
            itemStyle.transition = 'left 900ms ease-in-out, top 900ms ease-in-out, transform 900ms ease-in-out';
          }

          if (item.isDragging && !isCurrentDragging) {
            // Being carried by Kien Sang
            return null;
          }

          return (
            <TrashItemView
              key={item.instanceId}
              item={item}
              definition={def}
              isSelected={isSelected}
              isDragging={isCurrentDragging}
              onPointerDown={(e) => handlePointerDownTrash(e, item)}
              onClick={() => {
                if (gameMode === 'command') {
                  handleClickTrashCommand(item);
                }
              }}
              style={itemStyle}
            />
          );
        })}
        </>}
      </div>

      {/* MODAL CẬP NHẬT ẢNH CHO 2 THÙNG RÁC */}
      <TrashBinModal
        isOpen={isTrashBinModalOpen}
        onClose={() => setIsTrashBinModalOpen(false)}
        targetCategory={targetBinCategory}
        customOrganicUrl={customOrganicUrl}
        customRecyclableUrl={customRecyclableUrl}
        onSaveBinImages={handleSaveBinImages}
        binScale={binScale}
        onUpdateScale={setBinScale}
      />

      {/* MODAL QUẢN LÝ & TẢI ẢNH 16 LOẠI RÁC (8 HỮU CƠ + 8 VÔ CƠ) */}
      <TrashItemUploadModal
        isOpen={isTrashItemsModalOpen}
        onClose={() => setIsTrashItemsModalOpen(false)}
        trashDefinitions={allTrashItems}
        customTrashImages={customTrashImages}
        onSaveCustomTrashImages={handleSaveCustomTrashImages}
      />

      {/* MODAL XƯỞNG TRANG PHỤC SCRATCH BẠN KIẾN SÁNG (tim_rac, cam_rac, vui, buon) */}
      <ErrorBoundary fallbackTitle="Lỗi hiển thị Xưởng Trang Phục Bạn Kiến">
        <MascotCostumesModal
          isOpen={isCostumesModalOpen}
          onClose={() => setIsCostumesModalOpen(false)}
          customCostumes={customCostumes}
          onSaveCostumes={handleSaveCustomCostumes}
          mascotScale={mascotScale}
          onUpdateScale={setMascotScale}
        />
      </ErrorBoundary>

      {/* MODAL CẬP NHẬT ẢNH BẠN KIẾN SÁNG (kien-sang-main.png) */}
      <MascotModal
        isOpen={isMascotModalOpen}
        onClose={() => setIsMascotModalOpen(false)}
        customMascotUrl={customMascotUrl}
        onSaveMascot={handleSaveMascot}
        mascotScale={mascotScale}
        onUpdateScale={setMascotScale}
      />

      {/* MODAL PHÒNG THU LỒNG TIẾNG CỦA BÉ */}
      <VoiceStudioModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceClips={voiceClips}
        onSaveVoiceClips={handleSaveVoiceClips}
      />

      {/* MODAL XUẤT TỆP SCRATCH (.SB3) VÀ HƯỚNG DẪN */}
      <ScratchModal
        isOpen={isScratchModalOpen}
        onClose={() => setIsScratchModalOpen(false)}
        voiceClips={voiceClips}
        customMascotUrl={customMascotUrl}
        customOrganicUrl={customOrganicUrl}
        customRecyclableUrl={customRecyclableUrl}
        customCostumes={customCostumes}
        customTrashImages={customTrashImages}
        mascotScale={mascotScale}
      />

      {/* MODAL XUẤT TỆP HTML OFFLINE (ĐỒNG BỘ TRANG PHỤC & HÌNH ẢNH BẢN PREVIEW) */}
      <OfflineHtmlModal
        onImportSettings={handleImportSettings}
        isOpen={isOfflineHtmlModalOpen}
        onClose={() => setIsOfflineHtmlModalOpen(false)}
        customCostumes={customCostumes}
        customMascotUrl={customMascotUrl}
        mascotScale={mascotScale}
        customOrganicUrl={customOrganicUrl}
        customRecyclableUrl={customRecyclableUrl}
        binScale={binScale}
        customTrashImages={customTrashImages}
        voiceClips={voiceClips}
      />

      {/* MODAL CHIẾN THẮNG KHI ĐẠT ĐỦ 16 SAO */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onPlayAgain={handleRestart}
        onOpenScratchModal={() => {
          setIsVictoryModalOpen(false);
          setIsScratchModalOpen(true);
        }}
        onOpenOfflineHtmlModal={sharedAssetsEnabled ? undefined : () => {
          setIsVictoryModalOpen(false);
          setIsOfflineHtmlModalOpen(true);
        }}
        customMascotUrl={customMascotUrl}
        maxScore={MAX_SCORE}
      />
    </div>
    </ErrorBoundary>
  );
}
