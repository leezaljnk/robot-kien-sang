/**
 * Sound synthesis and voice playback engine
 * Supports Web Audio SFX + Web Speech API (vi-VN) + Child's Custom Recorded Audio Blobs
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sound Effects
export const playPickSfx = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // ignore audio failure
  }
};

export const playConnectSfx = () => {
  try {
    const ctx = getAudioContext();
    const notes = [
      { frequency: 880, start: 0, duration: 0.1 },
      { frequency: 1174.66, start: 0.13, duration: 0.13 },
    ];
    notes.forEach(({ frequency, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = ctx.currentTime + start;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.18, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(startAt);
      osc.stop(startAt + duration);
    });
  } catch {
    // Audio may be unavailable; the game remains playable.
  }
};

export const playDropSfx = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // ignore
  }
};

export const playCountdownSfx = (volume = 0.06) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Audio may be unavailable; answering must remain possible.
  }
};

export const playSuccessSfx = () => {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.28, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  } catch {
    // ignore
  }
};

export const playErrorSfx = () => {
  try {
    const ctx = getAudioContext();
    // Bouncy spring boing effect
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const startTime = ctx.currentTime;
    osc.frequency.setValueAtTime(260, startTime);
    osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, startTime + 0.22);
    osc.frequency.exponentialRampToValueAtTime(160, startTime + 0.35);

    gain.gain.setValueAtTime(0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.36);
  } catch {
    // ignore
  }
};

export const playVictoryFanfare = () => {
  try {
    const ctx = getAudioContext();
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.4 },  // E5
      { f: 783.99, d: 0.2 },  // G5
      { f: 1046.5, d: 0.7 },  // C6
    ];
    let cursor = ctx.currentTime;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, cursor);
      gain.gain.setValueAtTime(0.3, cursor);
      gain.gain.exponentialRampToValueAtTime(0.005, cursor + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(cursor);
      osc.stop(cursor + note.d);
      cursor += note.d * 0.85;
    });
  } catch {
    // ignore
  }
};

let currentAudio: HTMLAudioElement | null = null;
let currentBufferSources: AudioBufferSourceNode[] = [];
let speechPlaybackToken = 0;

function getVoiceRange(buffer: AudioBuffer) {
  const channelCount = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frameCount = buffer.length;
  let peak = 0;

  for (let channel = 0; channel < channelCount; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let frame = 0; frame < frameCount; frame++) {
      peak = Math.max(peak, Math.abs(samples[frame]));
    }
  }

  if (!peak) return { offset: 0, duration: buffer.duration };

  const threshold = Math.max(0.002, peak * 0.02);
  const windowSize = Math.max(1, Math.floor(sampleRate * 0.005));
  let firstActiveFrame = frameCount;
  let lastActiveFrame = -1;

  for (let start = 0; start < frameCount; start += windowSize) {
    const end = Math.min(start + windowSize, frameCount);
    let energy = 0;
    for (let channel = 0; channel < channelCount; channel++) {
      const samples = buffer.getChannelData(channel);
      for (let frame = start; frame < end; frame++) {
        energy += samples[frame] ** 2;
      }
    }
    const rms = Math.sqrt(energy / ((end - start) * channelCount));
    if (rms >= threshold) {
      firstActiveFrame = Math.min(firstActiveFrame, start);
      lastActiveFrame = end;
    }
  }

  if (lastActiveFrame < 0) return { offset: 0, duration: buffer.duration };

  const padding = Math.floor(sampleRate * 0.005);
  const offsetFrame = Math.max(0, firstActiveFrame - padding);
  const endFrame = Math.min(frameCount, lastActiveFrame + padding);
  return {
    offset: offsetFrame / sampleRate,
    duration: (endFrame - offsetFrame) / sampleRate,
  };
}

export const stopKienSangSpeech = () => {
  speechPlaybackToken++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  currentBufferSources.forEach(source => {
    source.onended = null;
    try {
      source.stop();
      source.disconnect();
    } catch {
      // Source may already have ended.
    }
  });
  currentBufferSources = [];
  window.speechSynthesis?.cancel();
};

/**
 * Play a voice message:
 * 1. If child recorded custom audio for this action, play child's voice!
 * 2. Otherwise speak using Web Speech API (vi-VN)
 */
export const speakKienSang = (
  textVi: string,
  customAudioUrl?: string | null,
  onEnded?: () => void
) => {
  stopKienSangSpeech();
  // If custom audio provided
  if (customAudioUrl) {
    try {
      const audio = new Audio(customAudioUrl);
      currentAudio = audio;
      audio.onended = () => {
        onEnded?.();
      };
      audio.play().catch((err) => {
        if (currentAudio !== audio || err?.name === 'AbortError') return;
        if (err?.name === 'NotAllowedError') {
          console.warn('Trình duyệt chặn tự phát bản thu. Hãy cho phép phát âm thanh tự động trên trang này.', err);
          return;
        }
        console.warn('Không phát được giọng thu âm, chuyển sang đọc văn bản:', err);
        // Fallback only when the recording is unavailable or unsupported.
        speakFallbackTTS(textVi, onEnded);
      });
      return;
    } catch {
      // fallback
    }
  }

  speakFallbackTTS(textVi, onEnded);
};

export const speakKienSangSequence = async (
  textVi: string,
  clipUrls: Array<string | null | undefined>,
  onEnded?: () => void,
  fallbackTexts?: string[]
) => {
  stopKienSangSpeech();
  const playbackToken = speechPlaybackToken;
  if (!clipUrls.length || (!fallbackTexts && clipUrls.some(url => !url))) {
    speakFallbackTTS(textVi, onEnded);
    return;
  }

  try {
    const context = getAudioContext();
    if (context.state === 'suspended') await context.resume();
    const buffers = await Promise.all(clipUrls.map(async url => {
      if (!url) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Không tải được đoạn giọng nói: ${url}`);
        return await context.decodeAudioData(await response.arrayBuffer());
      } catch (error) {
        if (playbackToken !== speechPlaybackToken) return null;
        console.warn('Không phát được đoạn giọng thu âm, chuyển sang đọc văn bản:', error);
        return null;
      }
    }));
    if (playbackToken !== speechPlaybackToken) return;

    const playNext = (index: number) => {
      if (playbackToken !== speechPlaybackToken) return;
      if (index >= clipUrls.length) {
        onEnded?.();
        return;
      }

      const buffer = buffers[index];
      if (buffer) {
        let groupEnd = index + 1;
        while (groupEnd < buffers.length && buffers[groupEnd]) groupEnd++;

        const groupBuffers = buffers.slice(index, groupEnd)
          .filter((groupBuffer): groupBuffer is AudioBuffer => groupBuffer !== null);
        const ranges = groupBuffers.map(getVoiceRange);
        const sources = groupBuffers.map(groupBuffer => {
          const source = context.createBufferSource();
          source.buffer = groupBuffer;
          source.connect(context.destination);
          return source;
        });
        currentBufferSources = sources;
        let startAt = context.currentTime + 0.02;
        sources.forEach((source, sourceIndex) => {
          source.onended = () => {
            source.disconnect();
            if (sourceIndex === sources.length - 1 && playbackToken === speechPlaybackToken) {
              currentBufferSources = [];
              playNext(groupEnd);
            }
          };
          source.start(startAt, ranges[sourceIndex].offset, ranges[sourceIndex].duration);
          startAt += ranges[sourceIndex].duration;
        });
        return;
      }

      const fallbackText = fallbackTexts?.[index];
      if (fallbackText) {
        speakFallbackTTS(fallbackText, () => playNext(index + 1));
      } else {
        playNext(index + 1);
      }
    };
    playNext(0);
  } catch (error) {
    if (playbackToken !== speechPlaybackToken) return;
    currentBufferSources.forEach(source => {
      source.onended = null;
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already have ended.
      }
    });
    currentBufferSources = [];
    console.warn('Không phát được chuỗi giọng thu âm, chuyển sang đọc văn bản:', error);
    if (fallbackTexts?.length === clipUrls.length) {
      const speakNext = (index: number) => {
        if (playbackToken !== speechPlaybackToken) return;
        if (index >= fallbackTexts.length) {
          onEnded?.();
          return;
        }
        speakFallbackTTS(fallbackTexts[index], () => speakNext(index + 1));
      };
      speakNext(0);
    } else {
      speakFallbackTTS(textVi, onEnded);
    }
  }
};

function speakFallbackTTS(textVi: string, onEnded?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnded?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textVi);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.25; // cute, friendly robot/child pitch

    // Try finding Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VIE'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      onEnded?.();
    };
    utterance.onerror = () => {
      onEnded?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    onEnded?.();
  }
}
