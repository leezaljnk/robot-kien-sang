import JSZip from 'jszip';
import { VoiceClips, CustomCostumesMap } from '../types';
import { getCostumeSvg, MASCOT_COSTUMES } from '../data/mascotCostumes';

// ==========================================
// 1. MD5 IMPLEMENTATION (Pure JS for String & Binary)
// ==========================================
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;

    for (let i = 0; i < x.length; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;

      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }

  function rstr2binl(inputStr: string) {
    const output: number[] = [];
    for (let i = 0; i < inputStr.length * 8; i += 8) {
      output[i >> 5] |= (inputStr.charCodeAt(i / 8) & 0xff) << i % 32;
    }
    return output;
  }

  function binl2hex(binarray: number[]) {
    const hexTab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str +=
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0x0f) +
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0x0f);
    }
    return str;
  }

  return binl2hex(binlMD5(rstr2binl(input), input.length * 8));
}

function md5Binary(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return md5(binary);
}

// ==========================================
// 2. AUDIO SYNTHESIZER: WAV GENERATION (16-bit PCM)
// ==========================================
function encodePcmWav(sampleRate: number, samples: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Uint8Array(buffer);
}

function generateDingWav(): Uint8Array {
  const sampleRate = 22050;
  const duration = 0.5;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-6 * t);
    samples[i] =
      env * (0.6 * Math.sin(2 * Math.PI * 880 * t) + 0.4 * Math.sin(2 * Math.PI * 1320 * t));
  }
  return encodePcmWav(sampleRate, samples);
}

function generateBoingWav(): Uint8Array {
  const sampleRate = 22050;
  const duration = 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-4 * t);
    const freq = 340 - 180 * t + 25 * Math.sin(2 * Math.PI * 16 * t);
    samples[i] = env * 0.7 * Math.sin(2 * Math.PI * freq * t);
  }
  return encodePcmWav(sampleRate, samples);
}

function generateWinWav(): Uint8Array {
  const sampleRate = 22050;
  const duration = 1.3;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  const notes = [
    { start: 0.0, dur: 0.15, freq: 523.25 }, // C5
    { start: 0.15, dur: 0.15, freq: 659.25 }, // E5
    { start: 0.3, dur: 0.2, freq: 783.99 }, // G5
    { start: 0.5, dur: 0.75, freq: 1046.5 }, // C6
  ];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;
    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const localT = t - note.start;
        const env = Math.exp(-2.5 * localT);
        s += env * 0.6 * Math.sin(2 * Math.PI * note.freq * localT);
      }
    }
    samples[i] = Math.max(-1, Math.min(1, s));
  }
  return encodePcmWav(sampleRate, samples);
}

function generatePopWav(): Uint8Array {
  const sampleRate = 22050;
  const duration = 0.12;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-25 * t);
    const freq = 400 + 500 * (t / duration);
    samples[i] = env * 0.7 * Math.sin(2 * Math.PI * freq * t);
  }
  return encodePcmWav(sampleRate, samples);
}

// ==========================================
// 3. GRAPHICS: BACKDROP & SPRITE SVGS
// ==========================================

// 1. Phông nền lớp học chuẩn đẹp (480x360)
const STAGE_BACKDROP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <!-- Tuong lop hoc lop 1 vang kem -->
  <rect width="480" height="200" fill="#FEF9C3"/>
  <rect y="180" width="480" height="20" fill="#D1FAE5" stroke="#A7F3D0" stroke-width="1"/>

  <!-- San lop hoc gach men -->
  <rect y="200" width="480" height="160" fill="#F8FAFC"/>
  <line x1="0" y1="250" x2="480" y2="250" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="0" y1="305" x2="480" y2="305" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="80" y1="200" x2="60" y2="360" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="200" y1="200" x2="190" y2="360" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="320" y1="200" x2="330" y2="360" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="440" y1="200" x2="450" y2="360" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Khung Anh Bac Ho trang trong o giua tren cao -->
  <rect x="215" y="10" width="50" height="40" rx="3" fill="#B45309" stroke="#78350F" stroke-width="2"/>
  <rect x="219" y="14" width="42" height="32" rx="2" fill="#FEF08A"/>
  <circle cx="240" cy="28" r="10" fill="#FDE047" stroke="#CA8A04" stroke-width="1.5"/>
  <polygon points="240,20 242.5,26 248,26 243.5,29.5 245.5,35 240,31.5 234.5,35 236.5,29.5 232,26 237.5,26" fill="#DC2626"/>
  <text x="240" y="44" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#78350F" text-anchor="middle">CHỦ TỊCH HỒ CHÍ MINH</text>

  <!-- Bang den phan trang lop 1 co o ly -->
  <rect x="90" y="55" width="300" height="120" rx="6" fill="#854D0E" stroke="#583101" stroke-width="3"/>
  <rect x="96" y="61" width="288" height="108" rx="4" fill="#064E3B"/>
  <line x1="96" y1="85" x2="384" y2="85" stroke="#047857" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="96" y1="110" x2="384" y2="110" stroke="#047857" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="96" y1="135" x2="384" y2="135" stroke="#047857" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Tieu de phan trang tren bang -->
  <text x="240" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FEF08A" text-anchor="middle">ROBOT KIẾN SÁNG - THỬ TÀI PHÂN LOẠI RÁC</text>
  <text x="240" y="98" font-family="sans-serif" font-size="9" fill="#A7F3D0" text-anchor="middle">"Tuổi nhỏ làm việc nhỏ - Tùy theo sức của mình"</text>
  <text x="240" y="115" font-family="sans-serif" font-size="8.5" fill="#FFFFFF" text-anchor="middle">Phân loại đúng rác vào 2 thùng: Hữu Cơ &amp; Tái Chế để đạt 10 ⭐</text>

  <!-- Khay phan duoi bang -->
  <rect x="180" y="169" width="120" height="4" fill="#D97706" rx="2"/>
  <rect x="200" y="167" width="16" height="3" fill="#FFFFFF" rx="1"/>
  <rect x="225" y="167" width="16" height="3" fill="#38BDF8" rx="1"/>

  <!-- Ban ghe hoc sinh o goc lop -->
  <g transform="translate(10, 220) scale(0.65)" opacity="0.9">
    <rect x="10" y="40" width="70" height="15" rx="3" fill="#D97706" stroke="#B45309" stroke-width="2"/>
    <rect x="18" y="55" width="6" height="35" fill="#475569"/>
    <rect x="66" y="55" width="6" height="35" fill="#475569"/>
  </g>
  <g transform="translate(420, 220) scale(0.65)" opacity="0.9">
    <rect x="10" y="40" width="70" height="15" rx="3" fill="#D97706" stroke="#B45309" stroke-width="2"/>
    <rect x="18" y="55" width="6" height="35" fill="#475569"/>
    <rect x="66" y="55" width="6" height="35" fill="#475569"/>
  </g>
</svg>`;

// 2. Thùng rác Xanh Lá - Hữu cơ (Khớp 100% RecycleBin1.png)
const THUNG_XANH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
  <defs>
    <filter id="zb_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="80" cy="192" rx="48" ry="7" fill="#0f172a" opacity="0.2" />
  <circle cx="34" cy="180" r="14" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
  <circle cx="34" cy="180" r="5" fill="#94a3b8" />
  <circle cx="126" cy="180" r="14" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
  <circle cx="126" cy="180" r="5" fill="#94a3b8" />
  <path d="M 36 82 L 44 178 Q 44 186 52 186 L 108 186 Q 116 186 116 178 L 124 82 Z" fill="#22c55e" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <path d="M 40 82 L 47 176 Q 48 182 54 182 L 74 182 L 70 82 Z" fill="#4ade80" />
  <path d="M 94 82 L 96 182 L 108 182 Q 114 182 115 176 L 122 82 Z" fill="#16a34a" />
  <rect x="46" y="98" width="68" height="66" rx="8" fill="#16a34a" stroke="#0f172a" stroke-width="3.5" />
  <rect x="50" y="102" width="60" height="58" rx="6" fill="#15803d" />
  <g transform="translate(80, 131) scale(0.95)">
    <g transform="translate(-16, -15)">
      <path d="M 16 2 Q 22 8 20 16 Q 15 24 6 22 Q 0 17 4 9 Q 8 2 16 2 Z" fill="#86efac" stroke="#0f172a" stroke-width="2" />
      <path d="M 16 2 Q 10 12 6 22" stroke="#15803d" stroke-width="1.5" fill="none" />
      <path d="M 12 8 Q 16 10 18 12" stroke="#15803d" stroke-width="1.2" fill="none" />
      <path d="M 10 13 Q 13 16 14 18" stroke="#15803d" stroke-width="1.2" fill="none" />
    </g>
    <g transform="translate(2, -14)">
      <path d="M 12 3 Q 18 9 17 18 Q 11 23 3 20 Q -1 14 3 7 Q 7 2 12 3 Z" fill="#4ade80" stroke="#0f172a" stroke-width="2" />
      <path d="M 12 3 Q 7 11 3 20" stroke="#166534" stroke-width="1.5" fill="none" />
    </g>
    <g transform="translate(-14, 4) scale(0.75)">
      <path d="M 5 2 C 16 0 24 10 21 20 C 18 20 15 16 15 14 C 13 18 10 18 8 16 C 6 12 6 8 5 2 Z" fill="#fef08a" stroke="#0f172a" stroke-width="2" />
    </g>
    <g transform="translate(2, 4) scale(0.75)">
      <path d="M 8 3 Q 16 2 20 10 Q 22 18 14 20 Q 5 20 3 13 Q 2 6 8 3 Z" fill="#f87171" stroke="#0f172a" stroke-width="2" />
      <path d="M 11 3 L 13 -2" stroke="#15803d" stroke-width="2" stroke-linecap="round" />
    </g>
  </g>
  <path d="M 32 84 L 128 84 L 124 50 L 36 50 Z" fill="#16a34a" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <polygon points="36,50 48,22 112,22 124,50" fill="#22c55e" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <polygon points="48,22 56,22 44,50 36,50" fill="#86efac" opacity="0.6" />
  <rect x="52" y="32" width="56" height="15" rx="5" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
  <rect x="55" y="34" width="50" height="11" rx="3" fill="#052e16" />
  <rect x="62" y="16" width="36" height="8" rx="4" fill="#15803d" stroke="#0f172a" stroke-width="3" />
  <rect x="30" y="80" width="100" height="8" rx="4" fill="#15803d" stroke="#0f172a" stroke-width="3" />
  <text x="80" y="178" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#FFFFFF" text-anchor="middle">RÁC HỮU CƠ</text>
</svg>`;

// 3. Thùng rác Cam - Tái chế (Khớp 100% RecycleBin2.png)
const THUNG_CAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">
  <defs>
    <filter id="ob_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="80" cy="192" rx="48" ry="7" fill="#0f172a" opacity="0.2" />
  <circle cx="34" cy="180" r="14" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
  <circle cx="34" cy="180" r="5" fill="#94a3b8" />
  <circle cx="126" cy="180" r="14" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
  <circle cx="126" cy="180" r="5" fill="#94a3b8" />
  <path d="M 36 82 L 44 178 Q 44 186 52 186 L 108 186 Q 116 186 116 178 L 124 82 Z" fill="#f97316" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <path d="M 40 82 L 47 176 Q 48 182 54 182 L 74 182 L 70 82 Z" fill="#fb923c" />
  <path d="M 94 82 L 96 182 L 108 182 Q 114 182 115 176 L 122 82 Z" fill="#ea580c" />
  <rect x="46" y="98" width="68" height="66" rx="8" fill="#ea580c" stroke="#0f172a" stroke-width="3.5" />
  <rect x="50" y="102" width="60" height="58" rx="6" fill="#c2410c" />
  <g transform="translate(80, 131) scale(1.15)">
    <g fill="#fed7aa" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round">
      <path d="M 0 -13 L 5 -7 L 2 -7 C 5 -4 6 1 4 5 L 1 4 C 3 1 2 -3 -1 -6 L -1 -3 Z" fill="#ffedd5"/>
      <path transform="rotate(120)" d="M 0 -13 L 5 -7 L 2 -7 C 5 -4 6 1 4 5 L 1 4 C 3 1 2 -3 -1 -6 L -1 -3 Z" fill="#ffedd5"/>
      <path transform="rotate(240)" d="M 0 -13 L 5 -7 L 2 -7 C 5 -4 6 1 4 5 L 1 4 C 3 1 2 -3 -1 -6 L -1 -3 Z" fill="#ffedd5"/>
    </g>
  </g>
  <path d="M 32 84 L 128 84 L 124 50 L 36 50 Z" fill="#ea580c" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <polygon points="36,50 48,22 112,22 124,50" fill="#f97316" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
  <polygon points="48,22 56,22 44,50 36,50" fill="#fdba74" opacity="0.6" />
  <rect x="52" y="32" width="56" height="15" rx="5" fill="#0f172a" stroke="#0f172a" stroke-width="2" />
  <rect x="55" y="34" width="50" height="11" rx="3" fill="#431407" />
  <rect x="62" y="16" width="36" height="8" rx="4" fill="#c2410c" stroke="#0f172a" stroke-width="3" />
  <rect x="30" y="80" width="100" height="8" rx="4" fill="#c2410c" stroke="#0f172a" stroke-width="3" />
  <text x="80" y="178" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#FFFFFF" text-anchor="middle">RÁC TÁI CHẾ</text>
</svg>`;

// 4. Robot Kiến Sáng (3 Costumes khớp 100% kien-sang-main.png: Idle, Vui, Buồn)
const KIEN_SANG_IDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="210" viewBox="0 0 160 210">
  <defs>
    <linearGradient id="ks_metal_h" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stopColor="#E2E8F0" />
      <stop offset="40%" stopColor="#CBD5E1" />
      <stop offset="75%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#64748B" />
    </linearGradient>
    <linearGradient id="ks_shirt" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="40%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#EA580C" />
    </linearGradient>
    <linearGradient id="ks_blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#1D4ED8" />
    </linearGradient>
  </defs>
  <ellipse cx="78" cy="202" rx="46" ry="7" fill="#0F172A" opacity="0.22" />
  <!-- Bung kien bac sau lung -->
  <path d="M 52 142 C 34 135 12 144 6 156 C 0 168 6 182 22 188 C 42 195 62 184 66 168 C 68 158 64 148 52 142 Z" fill="#94A3B8" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 18 147 C 14 158 18 174 28 185" stroke="#0F172A" stroke-width="3" fill="none" />
  <path d="M 34 140 C 30 155 36 172 48 181" stroke="#0F172A" stroke-width="3" fill="none" />
  <!-- Khop hang va chan sau -->
  <circle cx="56" cy="162" r="9" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <path d="M 52 166 L 44 182" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" />
  <circle cx="44" cy="182" r="6" fill="#F97316" stroke="#0F172A" stroke-width="2" />
  <path d="M 44 184 L 38 198 L 52 201 L 56 195 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Chan tru truoc -->
  <path d="M 76 165 L 84 178" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="84" cy="178" r="8" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <circle cx="84" cy="178" r="4.5" fill="#FB923C" stroke="#0F172A" stroke-width="1.5" />
  <path d="M 83 182 L 80 196" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" />
  <path d="M 72 196 C 72 192 84 191 94 194 C 98 196 100 200 96 203 C 86 206 72 204 72 196 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <circle cx="86" cy="198" r="3" fill="#FB923C" stroke="#0F172A" stroke-width="1" />
  <!-- Ao thun cam phoi co xanh -->
  <path d="M 52 152 C 58 165 78 166 86 156" fill="#94A3B8" stroke="#0F172A" stroke-width="3" />
  <path d="M 46 112 C 40 125 40 144 48 154 C 54 160 88 162 96 152 C 98 140 98 126 94 114 Z" fill="url(#ks_shirt)" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 52 104 L 64 118 L 74 118 L 84 104 Z" fill="url(#ks_blue)" stroke="#0F172A" stroke-width="3" />
  <path d="M 88 110 C 96 112 105 116 109 126 C 104 130 96 132 90 128 Z" fill="url(#ks_blue)" stroke="#0F172A" stroke-width="3" />
  <path d="M 52 108 C 46 112 43 118 42 126 C 47 130 54 130 58 124 Z" fill="url(#ks_blue)" stroke="#0F172A" stroke-width="3" />
  <rect x="80" y="124" width="10" height="5" rx="2" fill="#FFFFFF" opacity="0.8" />
  <!-- Tay trai om nguc -->
  <path d="M 50 124 Q 60 134 68 130" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" fill="none" />
  <circle cx="76" cy="126" r="7" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Tay phai gio chu V Peace -->
  <path d="M 102 126 L 114 114" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="114" cy="114" r="6" fill="#475569" stroke="#0F172A" stroke-width="2.5" />
  <path d="M 114 114 L 126 94" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" />
  <g transform="translate(126, 92)">
    <circle cx="3" cy="-3" r="7" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
    <path d="M 4 -8 L 8 -24 C 9 -27 15 -25 14 -21 L 9 -7 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
    <path d="M 7 -6 L 19 -18 C 22 -20 25 -16 22 -12 L 10 -4 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  </g>
  <!-- Co va Dau robot kim loai -->
  <rect x="58" y="96" width="20" height="12" rx="4" fill="#64748B" stroke="#0F172A" stroke-width="3" />
  <path d="M 38 72 C 30 50 44 26 72 24 C 98 22 118 42 116 68 C 114 86 96 102 74 102 C 48 102 38 88 38 72 Z" fill="url(#ks_metal_h)" stroke="#0F172A" stroke-width="4" />
  <!-- Mat to tron than thien (Idle) -->
  <path d="M 56 46 Q 64 42 68 47" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 82 47 Q 86 42 94 46" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <ellipse cx="64" cy="58" rx="8" ry="9" fill="#0F172A" />
  <circle cx="66" cy="55" r="3.5" fill="#FFFFFF" />
  <ellipse cx="88" cy="58" rx="8" ry="9" fill="#0F172A" />
  <circle cx="90" cy="55" r="3.5" fill="#FFFFFF" />
  <ellipse cx="54" cy="67" rx="6" ry="4" fill="#FDA4AF" />
  <ellipse cx="98" cy="67" rx="6" ry="4" fill="#FDA4AF" />
  <path d="M 66 73 Q 76 84 86 73" stroke="#0F172A" stroke-width="4" stroke-linecap="round" fill="none" />
  <!-- 2 Ang-ten phat sang tren dau -->
  <path d="M 62 26 L 56 12 L 66 4" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="64" y="2" width="14" height="7" rx="3.5" transform="rotate(-25 71 5)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
  <path d="M 88 24 L 98 10 L 108 14" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="104" y="9" width="14" height="7" rx="3.5" transform="rotate(25 111 12)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
</svg>`;

const KIEN_SANG_VUI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="210" viewBox="0 0 160 210">
  <defs>
    <linearGradient id="ks_metal_hv" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stopColor="#E2E8F0" />
      <stop offset="40%" stopColor="#CBD5E1" />
      <stop offset="75%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#64748B" />
    </linearGradient>
    <linearGradient id="ks_shirt_v" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stopColor="#FB923C" />
      <stop offset="40%" stopColor="#F97316" />
      <stop offset="100%" stopColor="#EA580C" />
    </linearGradient>
    <linearGradient id="ks_blue_v" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#1D4ED8" />
    </linearGradient>
  </defs>
  <ellipse cx="78" cy="202" rx="46" ry="7" fill="#0F172A" opacity="0.22" />
  <!-- Bung kien bac sau lung -->
  <path d="M 52 142 C 34 135 12 144 6 156 C 0 168 6 182 22 188 C 42 195 62 184 66 168 C 68 158 64 148 52 142 Z" fill="#94A3B8" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 18 147 C 14 158 18 174 28 185" stroke="#0F172A" stroke-width="3" fill="none" />
  <path d="M 34 140 C 30 155 36 172 48 181" stroke="#0F172A" stroke-width="3" fill="none" />
  <!-- Khop hang va chan sau -->
  <circle cx="56" cy="162" r="9" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <path d="M 52 166 L 44 182" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" />
  <circle cx="44" cy="182" r="6" fill="#F97316" stroke="#0F172A" stroke-width="2" />
  <path d="M 44 184 L 38 198 L 52 201 L 56 195 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Chan tru truoc -->
  <path d="M 76 165 L 84 178" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="84" cy="178" r="8" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <circle cx="84" cy="178" r="4.5" fill="#FB923C" stroke="#0F172A" stroke-width="1.5" />
  <path d="M 83 182 L 80 196" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" />
  <path d="M 72 196 C 72 192 84 191 94 194 C 98 196 100 200 96 203 C 86 206 72 204 72 196 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <circle cx="86" cy="198" r="3" fill="#FB923C" stroke="#0F172A" stroke-width="1" />
  <!-- Ao thun cam phoi co xanh -->
  <path d="M 52 152 C 58 165 78 166 86 156" fill="#94A3B8" stroke="#0F172A" stroke-width="3" />
  <path d="M 46 112 C 40 125 40 144 48 154 C 54 160 88 162 96 152 C 98 140 98 126 94 114 Z" fill="url(#ks_shirt_v)" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 52 104 L 64 118 L 74 118 L 84 104 Z" fill="url(#ks_blue_v)" stroke="#0F172A" stroke-width="3" />
  <path d="M 88 110 C 96 112 105 116 109 126 C 104 130 96 132 90 128 Z" fill="url(#ks_blue_v)" stroke="#0F172A" stroke-width="3" />
  <path d="M 52 108 C 46 112 43 118 42 126 C 47 130 54 130 58 124 Z" fill="url(#ks_blue_v)" stroke="#0F172A" stroke-width="3" />
  <rect x="80" y="124" width="10" height="5" rx="2" fill="#FFFFFF" opacity="0.8" />
  <!-- Tay trai om nguc -->
  <path d="M 50 124 Q 60 134 68 130" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" fill="none" />
  <circle cx="76" cy="126" r="7" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Tay phai gio chu V Peace -->
  <path d="M 102 126 L 114 114" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="114" cy="114" r="6" fill="#475569" stroke="#0F172A" stroke-width="2.5" />
  <path d="M 114 114 L 126 94" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" />
  <g transform="translate(126, 92)">
    <circle cx="3" cy="-3" r="7" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
    <path d="M 4 -8 L 8 -24 C 9 -27 15 -25 14 -21 L 9 -7 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
    <path d="M 7 -6 L 19 -18 C 22 -20 25 -16 22 -12 L 10 -4 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  </g>
  <!-- Co va Dau robot kim loai -->
  <rect x="58" y="96" width="20" height="12" rx="4" fill="#64748B" stroke="#0F172A" stroke-width="3" />
  <path d="M 38 72 C 30 50 44 26 72 24 C 98 22 118 42 116 68 C 114 86 96 102 74 102 C 48 102 38 88 38 72 Z" fill="url(#ks_metal_hv)" stroke="#0F172A" stroke-width="4" />
  <!-- KHUÔN MẶT CƯỜI HÍP VUI MỪNG (Chuẩn kien-sang-main.png) -->
  <path d="M 54 44 Q 63 38 68 45" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 82 45 Q 87 38 96 44" stroke="#0F172A" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 54 59 C 57 48 70 48 74 59" stroke="#0F172A" stroke-width="5" stroke-linecap="round" fill="none" />
  <path d="M 82 59 C 85 48 98 48 101 59" stroke="#0F172A" stroke-width="5" stroke-linecap="round" fill="none" />
  <ellipse cx="52" cy="68" rx="7" ry="4.5" fill="#FDA4AF" />
  <ellipse cx="102" cy="68" rx="7" ry="4.5" fill="#FDA4AF" />
  <path d="M 62 70 C 62 70 76 72 90 68 C 92 84 82 92 74 92 C 66 92 60 84 62 70 Z" fill="#991B1B" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 64 71 C 72 73 82 73 89 69 C 88 74 85 75 76 75 C 68 75 65 74 64 71 Z" fill="#FFFFFF" />
  <path d="M 68 83 C 71 78 80 78 84 82 C 81 89 74 90 68 83 Z" fill="#F43F5E" />
  <!-- 2 Ang-ten bung sang tren dau -->
  <path d="M 62 26 L 56 12 L 66 4" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="64" y="2" width="14" height="7" rx="3.5" transform="rotate(-25 71 5)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
  <path d="M 88 24 L 98 10 L 108 14" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="104" y="9" width="14" height="7" rx="3.5" transform="rotate(25 111 12)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
</svg>`;

const KIEN_SANG_BUON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="210" viewBox="0 0 160 210">
  <defs>
    <linearGradient id="ks_metal_hb" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stopColor="#CBD5E1" />
      <stop offset="50%" stopColor="#94A3B8" />
      <stop offset="100%" stopColor="#64748B" />
    </linearGradient>
  </defs>
  <ellipse cx="78" cy="202" rx="46" ry="7" fill="#0F172A" opacity="0.22" />
  <!-- Bung kien bac -->
  <path d="M 52 142 C 34 135 12 144 6 156 C 0 168 6 182 22 188 C 42 195 62 184 66 168 C 68 158 64 148 52 142 Z" fill="#94A3B8" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 18 147 C 14 158 18 174 28 185" stroke="#0F172A" stroke-width="3" fill="none" />
  <!-- Khop hang va chan sau -->
  <circle cx="56" cy="162" r="9" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <path d="M 52 166 L 44 182" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" />
  <circle cx="44" cy="182" r="6" fill="#F97316" stroke="#0F172A" stroke-width="2" />
  <path d="M 44 184 L 38 198 L 52 201 L 56 195 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Chan tru truoc -->
  <path d="M 76 165 L 84 178" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="84" cy="178" r="8" fill="#475569" stroke="#0F172A" stroke-width="3" />
  <circle cx="84" cy="178" r="4.5" fill="#FB923C" stroke="#0F172A" stroke-width="1.5" />
  <path d="M 83 182 L 80 196" stroke="#94A3B8" stroke-width="7" stroke-linecap="round" />
  <path d="M 72 196 C 72 192 84 191 94 194 C 98 196 100 200 96 203 C 86 206 72 204 72 196 Z" fill="#CBD5E1" stroke="#0F172A" stroke-width="3" />
  <!-- Ao thun cam -->
  <path d="M 46 112 C 40 125 40 144 48 154 C 54 160 88 162 96 152 C 98 140 98 126 94 114 Z" fill="#EA580C" stroke="#0F172A" stroke-width="3.5" />
  <path d="M 52 104 L 64 118 L 74 118 L 84 104 Z" fill="#2563EB" stroke="#0F172A" stroke-width="3" />
  <!-- Tay trai & phai hoi ru xuong dong vien -->
  <path d="M 50 124 Q 60 138 68 136" stroke="#CBD5E1" stroke-width="7" stroke-linecap="round" fill="none" />
  <circle cx="72" cy="136" r="6" fill="#CBD5E1" stroke="#0F172A" stroke-width="2.5" />
  <path d="M 100 124 L 112 136" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <circle cx="116" cy="138" r="6" fill="#CBD5E1" stroke="#0F172A" stroke-width="2.5" />
  <!-- Co va Dau robot kim loai -->
  <rect x="58" y="96" width="20" height="12" rx="4" fill="#64748B" stroke="#0F172A" stroke-width="3" />
  <path d="M 38 72 C 30 50 44 26 72 24 C 98 22 118 42 116 68 C 114 86 96 102 74 102 C 48 102 38 88 38 72 Z" fill="url(#ks_metal_hb)" stroke="#0F172A" stroke-width="4" />
  <!-- Mat buon co giot nuoc mat -->
  <path d="M 56 46 Q 64 50 68 47" stroke="#0F172A" stroke-width="3" fill="none" strokeLinecap="round" />
  <path d="M 82 47 Q 86 50 94 46" stroke="#0F172A" stroke-width="3" fill="none" strokeLinecap="round" />
  <circle cx="62" cy="58" r="7" fill="#1E293B" />
  <circle cx="64" cy="56" r="2.5" fill="#FFFFFF" />
  <circle cx="86" cy="58" r="7" fill="#1E293B" />
  <circle cx="88" cy="56" r="2.5" fill="#FFFFFF" />
  <path d="M 54 66 C 52 72 56 74 58 72 C 60 70 56 66 54 66 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
  <ellipse cx="54" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
  <ellipse cx="94" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
  <path d="M 64 80 Q 74 72 84 80" stroke="#0F172A" stroke-width="3.5" fill="none" strokeLinecap="round" />
  <!-- 2 Ang-ten tren dau -->
  <path d="M 62 26 L 56 12 L 66 4" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="64" y="2" width="14" height="7" rx="3.5" transform="rotate(-25 71 5)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
  <path d="M 88 24 L 98 10 L 108 14" stroke="#0F172A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <rect x="104" y="9" width="14" height="7" rx="3.5" transform="rotate(25 111 12)" fill="#FBBF24" stroke="#EA580C" stroke-width="1.5" />
</svg>`;

// 5. Nút chuyển đổi 2 chế độ chơi
const BUTTON_CHEDO1_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="38" viewBox="0 0 180 38">
  <rect x="2" y="2" width="176" height="34" rx="17" fill="#10B981" stroke="#047857" stroke-width="2.5"/>
  <circle cx="20" cy="19" r="11" fill="#FFFFFF"/>
  <text x="20" y="24" font-family="sans-serif" font-size="13" text-anchor="middle">👆</text>
  <text x="100" y="23" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Bé Tự Kéo Thả Rác</text>
</svg>`;

const BUTTON_CHEDO2_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="38" viewBox="0 0 180 38">
  <rect x="2" y="2" width="176" height="34" rx="17" fill="#6366F1" stroke="#4338CA" stroke-width="2.5"/>
  <circle cx="20" cy="19" r="11" fill="#FFFFFF"/>
  <text x="20" y="24" font-family="sans-serif" font-size="13" text-anchor="middle">🤖</text>
  <text x="100" y="23" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Nhờ Bạn Kiến Sáng</text>
</svg>`;

// 6. Các thẻ món rác đẹp mắt không có viền trắng hộp thẻ bao quanh
const CARD_TAO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <path d="M 0 -18 Q 4 -22 8 -22" stroke="#78350F" stroke-width="3" fill="none"/>
    <ellipse cx="7" cy="-22" rx="4" ry="2" fill="#16A34A" transform="rotate(-20 7 -22)"/>
    <path d="M 0 -16 C -12 -16 -16 -6 -16 4 C -16 16 -6 22 0 19 C 6 22 16 16 16 4 C 16 -6 12 -16 0 -16 Z" fill="#EF4444"/>
    <path d="M 0 -14 C -4 -14 -6 -4 -4 4 C -2 12 -2 16 0 17 C 2 16 2 12 4 4 C 6 -4 4 -14 0 -14 Z" fill="#FEF08A"/>
    <ellipse cx="-1" cy="-3" rx="1.5" ry="3" fill="#78350F"/>
    <ellipse cx="1" cy="5" rx="1.5" ry="3" fill="#78350F"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Lõi quả táo ăn dở</text>
</svg>`;

const CARD_BANH_MI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <ellipse cx="0" cy="0" rx="20" ry="12" fill="#D97706"/>
    <ellipse cx="0" cy="-2" rx="17" ry="9" fill="#F59E0B"/>
    <path d="M -8 -7 Q -6 -2 -8 3" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 0 -8 Q 2 -2 0 4" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 8 -7 Q 10 -2 8 3" stroke="#B45309" stroke-width="2" fill="none"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Mẩu bánh mì thừa</text>
</svg>`;

const CARD_CHUOI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <path d="M -16 12 C -6 16 14 14 20 -4 C 18 2 8 8 -2 6 C -8 4 -12 2 -16 12 Z" fill="#FACC15"/>
    <path d="M -2 6 C 6 2 12 -8 10 -16 C 6 -10 2 -2 -2 6 Z" fill="#FDE047"/>
    <path d="M -16 12 L -20 16" stroke="#854D0E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="10" cy="-16" rx="2" ry="1" fill="#713F12"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ chuối vàng</text>
</svg>`;

const CARD_LON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <rect x="-10" y="-14" width="20" height="28" rx="4" fill="#EF4444"/>
    <ellipse cx="0" cy="-14" rx="10" ry="3" fill="#E2E8F0"/>
    <ellipse cx="0" cy="14" rx="10" ry="3" fill="#DC2626"/>
    <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#F87171"/>
    <text x="0" y="3" font-family="sans-serif" font-size="8" font-weight="bold" fill="#FFFFFF" text-anchor="middle">COLA</text>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Lon nước ngọt nhỏ</text>
</svg>`;

const CARD_SUA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.0)">
    <polygon points="-12,-8 12,-8 15,0 -15,0" fill="#60A5FA"/>
    <rect x="-15" y="0" width="30" height="24" rx="2" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
    <rect x="-10" y="6" width="20" height="10" rx="1" fill="#3B82F6"/>
    <text x="0" y="14" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MILK</text>
    <line x1="5" y1="-16" x2="3" y2="-6" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ hộp sữa giấy</text>
</svg>`;

const CARD_CHAI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.0)">
    <rect x="-4" y="-18" width="8" height="4" rx="1" fill="#0284C7"/>
    <rect x="-3" y="-14" width="6" height="4" fill="#BAE6FD"/>
    <rect x="-7" y="-10" width="14" height="26" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
    <line x1="-6" y1="0" x2="6" y2="0" stroke="#38BDF8" stroke-width="1.5"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Chai nước suối</text>
</svg>`;

const CARD_XUONG_CA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <line x1="-20" y1="0" x2="20" y2="0" stroke="#CBD5E1" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="-20,0 -12,-8 -12,8" fill="#94A3B8"/>
    <line x1="-6" y1="-10" x2="-2" y2="10" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="2" y1="-10" x2="6" y2="10" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="10" y1="-8" x2="14" y2="8" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="20,0 26,-8 26,8" fill="#64748B"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Xương cá thừa</text>
</svg>`;

const CARD_DUI_GA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <ellipse cx="-4" cy="-2" rx="14" ry="11" fill="#D97706" transform="rotate(-25 -4 -2)"/>
    <ellipse cx="-4" cy="-2" rx="12" ry="9" fill="#F59E0B" transform="rotate(-25 -4 -2)"/>
    <path d="M 6 4 L 16 12" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="17" cy="11" r="3" fill="#FFFFFF"/>
    <circle cx="15" cy="15" r="3" fill="#FFFFFF"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Khúc đùi gà</text>
</svg>`;

const CARD_DUA_HAU_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <path d="M -18 4 A 18 18 0 0 0 18 4 Z" fill="#EF4444" stroke="#047857" stroke-width="3"/>
    <circle cx="-8" cy="8" r="1.5" fill="#000000"/>
    <circle cx="0" cy="12" r="1.5" fill="#000000"/>
    <circle cx="8" cy="8" r="1.5" fill="#000000"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ dưa hấu</text>
</svg>`;

const CARD_LA_CAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <path d="M -14 14 Q -16 -12 14 -16 Q 16 10 -14 14 Z" fill="#10B981" stroke="#047857" stroke-width="2"/>
    <path d="M -14 14 L 12 -14" stroke="#047857" stroke-width="1.8"/>
    <path d="M -4 4 L 2 0" stroke="#047857" stroke-width="1.2"/>
    <path d="M 2 -2 L 8 -6" stroke="#047857" stroke-width="1.2"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Lá cây rụng</text>
</svg>`;

const CARD_HOP_GIAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <polygon points="-14,-4 0,-14 14,-4 0,6" fill="#FBBF24" stroke="#B45309" stroke-width="1.8"/>
    <polygon points="-14,-4 0,6 0,20 -14,10" fill="#D97706" stroke="#B45309" stroke-width="1.8"/>
    <polygon points="14,-4 0,6 0,20 14,10" fill="#B45309" stroke="#92400E" stroke-width="1.8"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ hộp giấy bìa</text>
</svg>`;

const CARD_GIAY_CU_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <rect x="-11" y="-15" width="22" height="30" rx="2" fill="#FAF5FF" stroke="#8B5CF6" stroke-width="2"/>
    <line x1="-7" y1="-8" x2="7" y2="-8" stroke="#C4B5FD" stroke-width="1.8"/>
    <line x1="-7" y1="-2" x2="7" y2="-2" stroke="#C4B5FD" stroke-width="1.8"/>
    <line x1="-7" y1="4" x2="3" y2="4" stroke="#C4B5FD" stroke-width="1.8"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Giấy cũ báo cũ</text>
</svg>`;

const CARD_CHAI_THUY_TINH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <rect x="-3" y="-18" width="6" height="5" rx="1" fill="#0D9488"/>
    <path d="M -3 -13 L -7 -4 L -7 16 C -7 18 7 18 7 16 L 7 -4 L 3 -13 Z" fill="#CCFBF1" stroke="#0D9488" stroke-width="2"/>
    <rect x="-6" y="0" width="12" height="8" rx="1" fill="#14B8A6"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ chai thủy tinh</text>
</svg>`;

const CARD_ONG_NHUA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <path d="M -12 -14 L -4 -2 L 12 18" fill="none" stroke="#06B6D4" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M -11 -13 L -4 -2 L 11 17" fill="none" stroke="#EC4899" stroke-width="1.8" stroke-dasharray="3 3" stroke-linecap="round"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Ống hút nhựa</text>
</svg>`;

const CARD_VO_KEO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="85" viewBox="0 0 100 85">
  <g transform="translate(50, 32) scale(1.05)">
    <polygon points="-16,-6 -8,0 -16,6" fill="#A855F7" stroke="#7E22CE" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="10" ry="7" fill="#C084FC" stroke="#7E22CE" stroke-width="2"/>
    <polygon points="16,-6 8,0 16,6" fill="#A855F7" stroke="#7E22CE" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="3" fill="#FDE047"/>
  </g>
  <rect x="8" y="58" width="84" height="18" rx="9" fill="#0F172A"/>
  <text x="50" y="70.5" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vỏ kẹo nilon</text>
</svg>`;

const NGOI_SAO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
  <polygon points="30,5 37,22 56,22 41,33 46,51 30,40 14,51 19,33 4,22 23,22" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
  <circle cx="25" cy="26" r="2.5" fill="#78350F"/>
  <circle cx="35" cy="26" r="2.5" fill="#78350F"/>
  <path d="M 27 34 Q 30 37 33 34" stroke="#78350F" stroke-width="2" fill="none"/>
</svg>`;

// ==========================================
// 4. MAIN EXPORTER FUNCTION
// ==========================================
export async function exportScratchProject(
  _voiceClips?: VoiceClips,
  customMascotDataUrl?: string | null,
  customOrganicDataUrl?: string | null,
  customRecyclableDataUrl?: string | null,
  customCostumes?: CustomCostumesMap,
  customTrashImages?: Record<string, string>,
  mascotScale: number = 1.0
): Promise<Blob> {
  const zip = new JSZip();

  // Kích thước chuẩn đẹp của Robot Kiến Sáng trong Scratch 3.0 (nhỏ gọn, cân đối sân khấu 480x360)
  const finalRobotSize = Math.max(22, Math.min(48, Math.round(28 * (mascotScale || 1.0))));

  // Helper de them asset SVG vao zip va tao metadata costume Scratch 3.0
  const addSvgCostume = (name: string, svgContent: string, rotX = 50, rotY = 42) => {
    const hash = md5(svgContent);
    const md5ext = `${hash}.svg`;
    zip.file(md5ext, svgContent);
    return {
      assetId: hash,
      name,
      md5ext,
      dataFormat: 'svg',
      rotationCenterX: rotX,
      rotationCenterY: rotY,
    };
  };

  // Helper de them asset PNG vao zip va tao metadata costume Scratch 3.0
  // bitmapResolution: 2 theo chuẩn Scratch để ảnh không bị phóng to gấp đôi
  const addPngCostume = (name: string, pngBytes: Uint8Array, rotX = 80, rotY = 105) => {
    const hash = md5Binary(pngBytes);
    const md5ext = `${hash}.png`;
    zip.file(md5ext, pngBytes);
    return {
      assetId: hash,
      name,
      md5ext,
      dataFormat: 'png',
      bitmapResolution: 2,
      rotationCenterX: rotX,
      rotationCenterY: rotY,
    };
  };

  // Helper de them asset Audio WAV vao zip va tao metadata sound Scratch 3.0
  const addWavSound = (name: string, wavBytes: Uint8Array) => {
    const hash = md5Binary(wavBytes);
    const md5ext = `${hash}.wav`;
    zip.file(md5ext, wavBytes);
    const sampleCount = Math.floor((wavBytes.byteLength - 44) / 2);
    return {
      assetId: hash,
      name,
      md5ext,
      dataFormat: 'wav',
      format: '',
      rate: 22050,
      sampleCount,
    };
  };

  // 1. Tao cac file am thanh chuan cho Scratch
  const sndDing = addWavSound('DungRoi', generateDingWav());
  const sndBoing = addWavSound('NhamRoi', generateBoingWav());
  const sndWin = addWavSound('ChienThang', generateWinWav());
  const sndPop = addWavSound('ChonRac', generatePopWav());

  const allGameSounds = [sndDing, sndBoing, sndWin, sndPop];

  // 2. Backdrop san khau
  const cStage = addSvgCostume('LopHoc_1A', STAGE_BACKDROP_SVG, 240, 180);

  // 3. Robot Kien Sang - Su dung day du 13 trang phuc hoat hinh (k-1..8, k-v-1..3, k-l-1..2)
  const mascotCostumes: any[] = [];

  for (const item of MASCOT_COSTUMES) {
    const customDataUrl =
      customCostumes?.[item.id] ||
      (item.id === 'k-v-2' ? customMascotDataUrl : null);

    let added = false;
    if (customDataUrl) {
      try {
        const res = await fetch(customDataUrl);
        const buf = await res.arrayBuffer();
        mascotCostumes.push(addPngCostume(item.id, new Uint8Array(buf), 80, 105));
        added = true;
      } catch (_e) {
        // Fallback
      }
    }
    if (!added) {
      mascotCostumes.push(addSvgCostume(item.id, getCostumeSvg(item.id), 80, 105));
    }
  }

  // Costumes alias để giữ tương thích tuyệt đối cho mọi khối Scratch (hỗ trợ cả ảnh custom tải lên)
  for (let i = 1; i <= 12; i++) {
    const num = String(i).padStart(2, '0');
    const customUrl = customCostumes?.[`tim_rac_${num}`];
    let aliasAdded = false;
    if (customUrl) {
      try {
        const res = await fetch(customUrl);
        const buf = await res.arrayBuffer();
        mascotCostumes.push(addPngCostume(`k-${i}`, new Uint8Array(buf), 80, 105));
        aliasAdded = true;
      } catch (_e) {}
    }
    if (!aliasAdded) {
      mascotCostumes.push(addSvgCostume(`k-${i}`, getCostumeSvg(`tim_rac_${num}`), 80, 105));
    }
  }

  const customIdleUrl = customCostumes?.['tim_rac_01'];
  if (customIdleUrl) {
    try {
      const res = await fetch(customIdleUrl);
      const buf = await res.arrayBuffer();
      mascotCostumes.push(addPngCostume('kien_sang_idle', new Uint8Array(buf), 80, 105));
    } catch (_e) {
      mascotCostumes.push(addSvgCostume('kien_sang_idle', getCostumeSvg('tim_rac_01'), 80, 105));
    }
  } else {
    mascotCostumes.push(addSvgCostume('kien_sang_idle', getCostumeSvg('tim_rac_01'), 80, 105));
  }

  const customVuiUrl = customCostumes?.['vui_01'];
  if (customVuiUrl) {
    try {
      const res = await fetch(customVuiUrl);
      const buf = await res.arrayBuffer();
      mascotCostumes.push(addPngCostume('kien_sang_vui', new Uint8Array(buf), 80, 105));
    } catch (_e) {
      mascotCostumes.push(addSvgCostume('kien_sang_vui', getCostumeSvg('vui_01'), 80, 105));
    }
  } else {
    mascotCostumes.push(addSvgCostume('kien_sang_vui', getCostumeSvg('vui_01'), 80, 105));
  }

  const customBuonUrl = customCostumes?.['buon_01'];
  if (customBuonUrl) {
    try {
      const res = await fetch(customBuonUrl);
      const buf = await res.arrayBuffer();
      mascotCostumes.push(addPngCostume('kien_sang_buon', new Uint8Array(buf), 80, 105));
    } catch (_e) {
      mascotCostumes.push(addSvgCostume('kien_sang_buon', getCostumeSvg('buon_01'), 80, 105));
    }
  } else {
    mascotCostumes.push(addSvgCostume('kien_sang_buon', getCostumeSvg('buon_01'), 80, 105));
  }

  // 4. Hai thung rac
  let cThungXanh = addSvgCostume('ThungXanh_HuuCo', THUNG_XANH_SVG, 80, 100);
  let cThungCam = addSvgCostume('ThungCam_TaiChe', THUNG_CAM_SVG, 80, 100);

  if (customOrganicDataUrl) {
    try {
      const res = await fetch(customOrganicDataUrl);
      const buf = await res.arrayBuffer();
      cThungXanh = addPngCostume('ThungXanh_HuuCo', new Uint8Array(buf), 120, 150);
    } catch (_e) {
      // dung SVG mac dinh
    }
  }

  if (customRecyclableDataUrl) {
    try {
      const res = await fetch(customRecyclableDataUrl);
      const buf = await res.arrayBuffer();
      cThungCam = addPngCostume('ThungCam_TaiChe', new Uint8Array(buf), 120, 150);
    } catch (_e) {
      // dung SVG mac dinh
    }
  }

  // 5. Nut doi che do
  const cBtn1 = addSvgCostume('CheDo1_TuKeo', BUTTON_CHEDO1_SVG, 90, 19);
  const cBtn2 = addSvgCostume('CheDo2_NhoKien', BUTTON_CHEDO2_SVG, 90, 19);

  // 6. Cac the mon rac (Ho tro ca anh custom nguoi dung da tai len)
  const loadTrashCardCostume = async (
    keys: string[],
    defaultSvg: string,
    costumeName: string
  ) => {
    if (customTrashImages) {
      for (const k of keys) {
        const url = customTrashImages[k];
        if (url) {
          try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            return addPngCostume(costumeName, new Uint8Array(buf), 50, 42);
          } catch (_e) {}
        }
      }
    }
    return addSvgCostume(costumeName, defaultSvg, 50, 42);
  };

  const cChuoi = await loadTrashCardCostume(['vo_chuoi', 'banana_peel', 'chuoi'], CARD_CHUOI_SVG, 'The_VoChuoi');
  const cLon = await loadTrashCardCostume(['vo_lon', 'soda_can', 'lon', 'lon_nuoc'], CARD_LON_SVG, 'The_LonNuoc');
  const cSua = await loadTrashCardCostume(['vo_hop_sua', 'milk_carton', 'sua', 'hop_sua'], CARD_SUA_SVG, 'The_HopSua');
  const cTao = await loadTrashCardCostume(['vo_tao', 'apple_core', 'tao', 'loi_tao'], CARD_TAO_SVG, 'The_Tao');
  const cBanh = await loadTrashCardCostume(['banh_mi', 'bread_crust', 'banh'], CARD_BANH_MI_SVG, 'The_BanhMi');
  const cChai = await loadTrashCardCostume(['vo_chai_nhua', 'plastic_bottle', 'chai', 'chai_nhua'], CARD_CHAI_SVG, 'The_ChaiNhua');
  const cXuongCa = await loadTrashCardCostume(['xuong_ca', 'fishbone'], CARD_XUONG_CA_SVG, 'The_XuongCa');
  const cHopGiay = await loadTrashCardCostume(['vo_hop_giay', 'box', 'carton'], CARD_HOP_GIAY_SVG, 'The_HopGiay');
  const cGiayCu = await loadTrashCardCostume(['giay_cu', 'paper'], CARD_GIAY_CU_SVG, 'The_GiayCu');
  const cDuiGa = await loadTrashCardCostume(['dui_ga', 'chicken'], CARD_DUI_GA_SVG, 'The_DuiGa');
  const cChaiThuyTinh = await loadTrashCardCostume(['vo_chai', 'glass_bottle'], CARD_CHAI_THUY_TINH_SVG, 'The_ChaiThuyTinh');
  const cOngNhua = await loadTrashCardCostume(['ong_nhua', 'straw'], CARD_ONG_NHUA_SVG, 'The_OngNhua');
  const cDuaHau = await loadTrashCardCostume(['vo_dua_hau', 'watermelon'], CARD_DUA_HAU_SVG, 'The_DuaHau');
  const cLaCay = await loadTrashCardCostume(['la_cay', 'leaf'], CARD_LA_CAY_SVG, 'The_LaCay');
  const cVoKeo = await loadTrashCardCostume(['vo_keo', 'candy_wrapper', 'plastic_bag'], CARD_VO_KEO_SVG, 'The_VoKeo');
  const cSao = addSvgCostume('NgoiSao', NGOI_SAO_SVG, 30, 30);

  // BUILDER: Khối lệnh hoàn chỉnh cho mỗi món rác (Hỗ trợ CẢ 2 CHẾ ĐỘ + XUẤT HIỆN THEO 5 ĐỢT × 3 MÓN)
  const buildTrashSpriteBlocks = (
    prefix: string,
    waveNum: number, // 1 đến 5 (5 Đợt luân phiên 15 món rác)
    startX: number,
    startY: number,
    categoryType: 'HuuCo' | 'TaiChe',
    correctBinSpriteName: string,
    wrongBinSpriteName: string
  ) => {
    return {
      // 1. Khi bấm Cờ Xanh -> Đợt 1 hiện ngay tại vị trí sàn, các Đợt khác ẩn chờ qua đợt mới
      [`${prefix}_flag`]: {
        opcode: 'event_whenflagclicked',
        next: waveNum === 1 ? `${prefix}_flag_pos` : `${prefix}_flag_hide`,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 40,
      },
      ...(waveNum === 1
        ? {
            [`${prefix}_flag_pos`]: {
              opcode: 'motion_gotoxy',
              next: `${prefix}_flag_size`,
              parent: `${prefix}_flag`,
              inputs: {
                X: [1, [4, String(startX)]],
                Y: [1, [4, String(startY)]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            [`${prefix}_flag_size`]: {
              opcode: 'looks_setsizeto',
              next: `${prefix}_flag_effect`,
              parent: `${prefix}_flag_pos`,
              inputs: {
                SIZE: [1, [4, '75']],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            [`${prefix}_flag_effect`]: {
              opcode: 'looks_cleargraphiceffects',
              next: `${prefix}_flag_show`,
              parent: `${prefix}_flag_size`,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            [`${prefix}_flag_show`]: {
              opcode: 'looks_show',
              next: null,
              parent: `${prefix}_flag_effect`,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          }
        : {
            [`${prefix}_flag_hide`]: {
              opcode: 'looks_hide',
              next: null,
              parent: `${prefix}_flag`,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          }),

      // 2. Khi nhận tin [Bat_Dau_Choi] -> Xuất hiện theo đợt 3 món rác (chu kỳ 5 đợt xoay vòng)
      [`${prefix}_on_start`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_check_wave`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Bat_Dau_Choi', 'bc_start'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 160,
      },
      [`${prefix}_check_wave`]: {
        opcode: 'control_if_else',
        next: null,
        parent: `${prefix}_on_start`,
        inputs: {
          CONDITION: [2, `${prefix}_cond_wave`],
          SUBSTACK: [2, `${prefix}_spawn_size`],
          SUBSTACK2: [2, `${prefix}_spawn_hide`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_cond_wave`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_check_wave`,
        inputs: {
          OPERAND1: [2, `${prefix}_wave_val`],
          OPERAND2: [1, [10, String(waveNum)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_wave_val`]: {
        opcode: 'operator_add',
        next: null,
        parent: `${prefix}_cond_wave`,
        inputs: {
          NUM1: [2, `${prefix}_wave_mod`],
          NUM2: [1, [10, '1']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_wave_mod`]: {
        opcode: 'operator_mod',
        next: null,
        parent: `${prefix}_wave_val`,
        inputs: {
          NUM1: [2, `${prefix}_wave_sub`],
          NUM2: [1, [10, '5']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_wave_sub`]: {
        opcode: 'operator_subtract',
        next: null,
        parent: `${prefix}_wave_mod`,
        inputs: {
          NUM1: [3, [12, 'Dot_Rac', 'var_wave'], [10, '1']],
          NUM2: [1, [10, '1']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_spawn_hide`]: {
        opcode: 'looks_hide',
        next: null,
        parent: `${prefix}_check_wave`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_spawn_size`]: {
        opcode: 'looks_setsizeto',
        next: `${prefix}_spawn_effect`,
        parent: `${prefix}_check_wave`,
        inputs: {
          SIZE: [1, [4, '75']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_spawn_effect`]: {
        opcode: 'looks_cleargraphiceffects',
        next: `${prefix}_spawn_pos`,
        parent: `${prefix}_spawn_size`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_spawn_pos`]: {
        opcode: 'motion_gotoxy',
        next: `${prefix}_spawn_show`,
        parent: `${prefix}_spawn_effect`,
        inputs: {
          X: [1, [4, String(startX)]],
          Y: [1, [4, String(startY)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_spawn_show`]: {
        opcode: 'looks_show',
        next: null,
        parent: `${prefix}_spawn_pos`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // 3. Khi click chuột vào món rác (Hỗ trợ cả 2 chế độ chơi)
      [`${prefix}_clicked`]: {
        opcode: 'event_whenthisspriteclicked',
        next: `${prefix}_check_mode`,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 440,
        y: 40,
      },
      [`${prefix}_check_mode`]: {
        opcode: 'control_if_else',
        next: null,
        parent: `${prefix}_clicked`,
        inputs: {
          CONDITION: [2, `${prefix}_is_mode_drag`],
          SUBSTACK: [2, `${prefix}_drag_repeat`],
          SUBSTACK2: [2, `${prefix}_select_id`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_mode_drag`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_check_mode`,
        inputs: {
          OPERAND1: [3, [12, 'Che_Do_Choi', 'var_mode'], [10, '']],
          OPERAND2: [1, [10, '1']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // NHÁNH CHẾ ĐỘ 1: BÉ TỰ KÉO THẢ (Chuẩn cơ chế Scratch)
      [`${prefix}_drag_repeat`]: {
        opcode: 'control_repeat_until',
        next: `${prefix}_check_touch_correct`,
        parent: `${prefix}_check_mode`,
        inputs: {
          CONDITION: [2, `${prefix}_not_mouse_down`],
          SUBSTACK: [2, `${prefix}_goto_mouse`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_not_mouse_down`]: {
        opcode: 'operator_not',
        next: null,
        parent: `${prefix}_drag_repeat`,
        inputs: {
          OPERAND: [2, `${prefix}_mouse_down`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_mouse_down`]: {
        opcode: 'sensing_mousedown',
        next: null,
        parent: `${prefix}_not_mouse_down`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_goto_mouse`]: {
        opcode: 'motion_goto',
        next: null,
        parent: `${prefix}_drag_repeat`,
        inputs: {
          TO: [1, `${prefix}_menu_mouse`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_menu_mouse`]: {
        opcode: 'motion_goto_menu',
        next: null,
        parent: `${prefix}_goto_mouse`,
        inputs: {},
        fields: {
          TO: ['_mouse_'],
        },
        shadow: true,
        topLevel: false,
      },

      // Kiểm tra thả vào thùng đúng
      [`${prefix}_check_touch_correct`]: {
        opcode: 'control_if',
        next: `${prefix}_check_touch_wrong`,
        parent: `${prefix}_drag_repeat`,
        inputs: {
          CONDITION: [2, `${prefix}_touch_correct`],
          SUBSTACK: [2, `${prefix}_score_up`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_touch_correct`]: {
        opcode: 'sensing_touchingobject',
        next: null,
        parent: `${prefix}_check_touch_correct`,
        inputs: {
          TOUCHINGOBJECTMENU: [1, `${prefix}_menu_correct`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_menu_correct`]: {
        opcode: 'sensing_touchingobjectmenu',
        next: null,
        parent: `${prefix}_touch_correct`,
        inputs: {},
        fields: {
          TOUCHINGOBJECTMENU: [correctBinSpriteName],
        },
        shadow: true,
        topLevel: false,
      },
      [`${prefix}_score_up`]: {
        opcode: 'data_changevariableby',
        next: `${prefix}_remain_down`,
        parent: `${prefix}_check_touch_correct`,
        inputs: {
          VALUE: [1, [4, '1']],
        },
        fields: {
          VARIABLE: ['Diem_Sao ⭐', 'var_star'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_remain_down`]: {
        opcode: 'data_changevariableby',
        next: `${prefix}_bc_correct`,
        parent: `${prefix}_score_up`,
        inputs: {
          VALUE: [1, [4, '-1']],
        },
        fields: {
          VARIABLE: ['So_Rac_Con_Lai', 'var_remain'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_bc_correct`]: {
        opcode: 'event_broadcast',
        next: `${prefix}_hide_correct`,
        parent: `${prefix}_remain_down`,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'DungRoi', 'bc_correct']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_hide_correct`]: {
        opcode: 'looks_hide',
        next: `${prefix}_bc_check_wave`,
        parent: `${prefix}_bc_correct`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_bc_check_wave`]: {
        opcode: 'event_broadcast',
        next: null,
        parent: `${prefix}_hide_correct`,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Kiem_Tra_Dot', 'bc_check_wave']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Kiểm tra thả vào thùng sai
      [`${prefix}_check_touch_wrong`]: {
        opcode: 'control_if',
        next: `${prefix}_glide_back_default`,
        parent: `${prefix}_check_touch_correct`,
        inputs: {
          CONDITION: [2, `${prefix}_touch_wrong`],
          SUBSTACK: [2, `${prefix}_bc_wrong`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_touch_wrong`]: {
        opcode: 'sensing_touchingobject',
        next: null,
        parent: `${prefix}_check_touch_wrong`,
        inputs: {
          TOUCHINGOBJECTMENU: [1, `${prefix}_menu_wrong`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_menu_wrong`]: {
        opcode: 'sensing_touchingobjectmenu',
        next: null,
        parent: `${prefix}_touch_wrong`,
        inputs: {},
        fields: {
          TOUCHINGOBJECTMENU: [wrongBinSpriteName],
        },
        shadow: true,
        topLevel: false,
      },
      [`${prefix}_bc_wrong`]: {
        opcode: 'event_broadcast',
        next: `${prefix}_glide_back_wrong`,
        parent: `${prefix}_check_touch_wrong`,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'NhamRoi', 'bc_wrong']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_glide_back_wrong`]: {
        opcode: 'motion_glidesecstoxy',
        next: null,
        parent: `${prefix}_bc_wrong`,
        inputs: {
          SECS: [1, [4, '0.35']],
          X: [1, [4, String(startX)]],
          Y: [1, [4, String(startY)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_glide_back_default`]: {
        opcode: 'motion_glidesecstoxy',
        next: null,
        parent: `${prefix}_check_touch_wrong`,
        inputs: {
          SECS: [1, [4, '0.25']],
          X: [1, [4, String(startX)]],
          Y: [1, [4, String(startY)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // NHÁNH CHẾ ĐỘ 2: NHỜ BẠN KIẾN SÁNG (Click chọn rác -> phát sáng -> click thùng)
      [`${prefix}_select_id`]: {
        opcode: 'data_setvariableto',
        next: `${prefix}_select_cat`,
        parent: `${prefix}_check_mode`,
        inputs: {
          VALUE: [1, [10, prefix]],
        },
        fields: {
          VARIABLE: ['Mon_Rac_Dang_Chon', 'var_chosen_trash'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_cat`]: {
        opcode: 'data_setvariableto',
        next: `${prefix}_select_x`,
        parent: `${prefix}_select_id`,
        inputs: {
          VALUE: [1, [10, categoryType]],
        },
        fields: {
          VARIABLE: ['Loai_Rac_Dang_Chon', 'var_chosen_cat'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_x`]: {
        opcode: 'data_setvariableto',
        next: `${prefix}_select_y`,
        parent: `${prefix}_select_cat`,
        inputs: {
          VALUE: [1, [10, String(startX)]],
        },
        fields: {
          VARIABLE: ['Toa_Do_X_Rac', 'var_trash_x'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_y`]: {
        opcode: 'data_setvariableto',
        next: `${prefix}_select_size`,
        parent: `${prefix}_select_x`,
        inputs: {
          VALUE: [1, [10, String(startY)]],
        },
        fields: {
          VARIABLE: ['Toa_Do_Y_Rac', 'var_trash_y'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_size`]: {
        opcode: 'looks_setsizeto',
        next: `${prefix}_select_effect`,
        parent: `${prefix}_select_y`,
        inputs: {
          SIZE: [1, [4, '90']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_effect`]: {
        opcode: 'looks_seteffectto',
        next: `${prefix}_select_sound`,
        parent: `${prefix}_select_size`,
        inputs: {
          VALUE: [1, [4, '25']],
        },
        fields: {
          EFFECT: ['BRIGHTNESS'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_select_sound`]: {
        opcode: 'sound_play',
        next: `${prefix}_select_bc`,
        parent: `${prefix}_select_effect`,
        inputs: {
          SOUND_MENU: [1, `${prefix}_snd_menu_pop`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_snd_menu_pop`]: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: `${prefix}_select_sound`,
        inputs: {},
        fields: {
          SOUND_MENU: ['ChonRac'],
        },
        shadow: true,
        topLevel: false,
      },
      [`${prefix}_select_bc`]: {
        opcode: 'event_broadcast',
        next: null,
        parent: `${prefix}_select_sound`,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Chon_Rac', 'bc_select']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi nhận tin [Chon_Rac] từ món khác -> Reset kích thước món này nếu không được chọn
      [`${prefix}_on_other_select`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_check_if_not_chosen`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Chon_Rac', 'bc_select'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 420,
      },
      [`${prefix}_check_if_not_chosen`]: {
        opcode: 'control_if',
        next: null,
        parent: `${prefix}_on_other_select`,
        inputs: {
          CONDITION: [2, `${prefix}_is_not_this_trash`],
          SUBSTACK: [2, `${prefix}_reset_size`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_not_this_trash`]: {
        opcode: 'operator_not',
        next: null,
        parent: `${prefix}_check_if_not_chosen`,
        inputs: {
          OPERAND: [2, `${prefix}_is_this_trash`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_this_trash`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_is_not_this_trash`,
        inputs: {
          OPERAND1: [3, [12, 'Mon_Rac_Dang_Chon', 'var_chosen_trash'], [10, '']],
          OPERAND2: [1, [10, prefix]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_reset_size`]: {
        opcode: 'looks_setsizeto',
        next: `${prefix}_reset_effect`,
        parent: `${prefix}_check_if_not_chosen`,
        inputs: {
          SIZE: [1, [4, '75']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_reset_effect`]: {
        opcode: 'looks_cleargraphiceffects',
        next: null,
        parent: `${prefix}_reset_size`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi Kiến Sáng nhặt món này bỏ vào thùng thành công -> Ẩn đi
      [`${prefix}_on_collected`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_check_if_collected`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Mon_Rac_Bien_Mat', 'bc_disappear'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 600,
      },
      [`${prefix}_check_if_collected`]: {
        opcode: 'control_if',
        next: null,
        parent: `${prefix}_on_collected`,
        inputs: {
          CONDITION: [2, `${prefix}_is_collected_this`],
          SUBSTACK: [2, `${prefix}_do_hide`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_collected_this`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_check_if_collected`,
        inputs: {
          OPERAND1: [3, [12, 'Mon_Rac_Dang_Chon', 'var_chosen_trash'], [10, '']],
          OPERAND2: [1, [10, prefix]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_do_hide`]: {
        opcode: 'looks_hide',
        next: null,
        parent: `${prefix}_check_if_collected`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi Kiến Sáng vừa chạy tới nhặt món này -> Ẩn ngay lập tức khỏi mặt sàn
      [`${prefix}_on_picked`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_check_if_picked`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Mon_Rac_Bi_Nhat', 'bc_picked'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 670,
      },
      [`${prefix}_check_if_picked`]: {
        opcode: 'control_if',
        next: null,
        parent: `${prefix}_on_picked`,
        inputs: {
          CONDITION: [2, `${prefix}_is_picked_this`],
          SUBSTACK: [2, `${prefix}_do_hide_picked`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_picked_this`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_check_if_picked`,
        inputs: {
          OPERAND1: [3, [12, 'Mon_Rac_Dang_Chon', 'var_chosen_trash'], [10, '']],
          OPERAND2: [1, [10, prefix]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_do_hide_picked`]: {
        opcode: 'looks_hide',
        next: null,
        parent: `${prefix}_check_if_picked`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi Kiến Sáng nhầm thùng -> Món rác lướt về vị trí cũ trên sàn
      [`${prefix}_on_return`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_check_if_return`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Mon_Rac_Tra_Ve', 'bc_return'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 750,
      },
      [`${prefix}_check_if_return`]: {
        opcode: 'control_if',
        next: null,
        parent: `${prefix}_on_return`,
        inputs: {
          CONDITION: [2, `${prefix}_is_return_this`],
          SUBSTACK: [2, `${prefix}_return_size`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_is_return_this`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${prefix}_check_if_return`,
        inputs: {
          OPERAND1: [3, [12, 'Mon_Rac_Dang_Chon', 'var_chosen_trash'], [10, '']],
          OPERAND2: [1, [10, prefix]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_return_size`]: {
        opcode: 'looks_setsizeto',
        next: `${prefix}_return_effect`,
        parent: `${prefix}_check_if_return`,
        inputs: {
          SIZE: [1, [4, '75']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_return_effect`]: {
        opcode: 'looks_cleargraphiceffects',
        next: `${prefix}_return_show`,
        parent: `${prefix}_return_size`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_return_show`]: {
        opcode: 'looks_show',
        next: `${prefix}_return_glide`,
        parent: `${prefix}_return_effect`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${prefix}_return_glide`]: {
        opcode: 'motion_glidesecstoxy',
        next: null,
        parent: `${prefix}_return_show`,
        inputs: {
          SECS: [1, [4, '0.4']],
          X: [1, [4, String(startX)]],
          Y: [1, [4, String(startY)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi Chiến Thắng 10 sao -> Ẩn rác để ăn mừng
      [`${prefix}_on_win`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${prefix}_win_hide`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['ChienThang', 'bc_win'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 920,
      },
      [`${prefix}_win_hide`]: {
        opcode: 'looks_hide',
        next: null,
        parent: `${prefix}_on_win`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };
  };

  // BUILDER: Khối lệnh cho thùng rác (Nhún nhảy khi đúng + Xử lý click ở chế độ 2)
  const buildBinBlocks = (binCategory: 'HuuCo' | 'TaiChe', posX: number, posY: number) => {
    const p = binCategory === 'HuuCo' ? 'bin_x' : 'bin_c';
    return {
      [`${p}_flag`]: {
        opcode: 'event_whenflagclicked',
        next: `${p}_size`,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 40,
      },
      [`${p}_size`]: {
        opcode: 'looks_setsizeto',
        next: `${p}_pos`,
        parent: `${p}_flag`,
        inputs: {
          SIZE: [1, [4, '48']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_pos`]: {
        opcode: 'motion_gotoxy',
        next: `${p}_show`,
        parent: `${p}_size`,
        inputs: {
          X: [1, [4, String(posX)]],
          Y: [1, [4, String(posY)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_show`]: {
        opcode: 'looks_show',
        next: null,
        parent: `${p}_pos`,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi click vào thùng rác ở chế độ 2 (Nhờ Kiến Sáng)
      [`${p}_click`]: {
        opcode: 'event_whenthisspriteclicked',
        next: `${p}_check_mode`,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 200,
      },
      [`${p}_check_mode`]: {
        opcode: 'control_if',
        next: null,
        parent: `${p}_click`,
        inputs: {
          CONDITION: [2, `${p}_is_mode2`],
          SUBSTACK: [2, `${p}_check_has_selected`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_is_mode2`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${p}_check_mode`,
        inputs: {
          OPERAND1: [3, [12, 'Che_Do_Choi', 'var_mode'], [10, '']],
          OPERAND2: [1, [10, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_check_has_selected`]: {
        opcode: 'control_if_else',
        next: null,
        parent: `${p}_check_mode`,
        inputs: {
          CONDITION: [2, `${p}_has_trash`],
          SUBSTACK: [2, `${p}_set_bin_target`],
          SUBSTACK2: [2, `${p}_say_hint`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_has_trash`]: {
        opcode: 'operator_not',
        next: null,
        parent: `${p}_check_has_selected`,
        inputs: {
          OPERAND: [2, `${p}_is_trash_empty`],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_is_trash_empty`]: {
        opcode: 'operator_equals',
        next: null,
        parent: `${p}_has_trash`,
        inputs: {
          OPERAND1: [3, [12, 'Mon_Rac_Dang_Chon', 'var_chosen_trash'], [10, '']],
          OPERAND2: [1, [10, '']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_set_bin_target`]: {
        opcode: 'data_setvariableto',
        next: `${p}_bc_run`,
        parent: `${p}_check_has_selected`,
        inputs: {
          VALUE: [1, [10, binCategory]],
        },
        fields: {
          VARIABLE: ['Thung_Chon', 'var_chosen_bin'],
        },
        shadow: false,
        topLevel: false,
      },
      [`${p}_bc_run`]: {
        opcode: 'event_broadcast',
        next: null,
        parent: `${p}_set_bin_target`,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Kien_Sang_Di_Nhat', 'bc_robot_run']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_say_hint`]: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: `${p}_check_has_selected`,
        inputs: {
          MESSAGE: [1, [10, 'Bé hãy click chọn một món rác trên sàn trước nhé!']],
          SECS: [1, [4, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Nhún nhảy đón rác khi nhận tin [DungRoi]
      [`${p}_on_dung`]: {
        opcode: 'event_whenbroadcastreceived',
        next: `${p}_bounce1`,
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['DungRoi', 'bc_correct'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 440,
      },
      [`${p}_bounce1`]: {
        opcode: 'looks_changesizeby',
        next: `${p}_wait`,
        parent: `${p}_on_dung`,
        inputs: {
          CHANGE: [1, [4, '8']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_wait`]: {
        opcode: 'control_wait',
        next: `${p}_bounce2`,
        parent: `${p}_bounce1`,
        inputs: {
          DURATION: [1, [4, '0.15']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      [`${p}_bounce2`]: {
        opcode: 'looks_changesizeby',
        next: null,
        parent: `${p}_wait`,
        inputs: {
          CHANGE: [1, [4, '-8']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };
  };

  // BUILDER: Khối lệnh cho Nút Đổi Chế Độ
  const buildModeButtonBlocks = () => {
    return {
      btn_flag: {
        opcode: 'event_whenflagclicked',
        next: 'btn_pos',
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 40,
      },
      btn_pos: {
        opcode: 'motion_gotoxy',
        next: 'btn_costume_init',
        parent: 'btn_flag',
        inputs: {
          X: [1, [4, '0']],
          Y: [1, [4, '155']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_costume_init: {
        opcode: 'looks_switchcostumeto',
        next: 'btn_show',
        parent: 'btn_pos',
        inputs: {
          COSTUME: [1, 'btn_menu_c1'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_menu_c1: {
        opcode: 'looks_costume',
        next: null,
        parent: 'btn_costume_init',
        inputs: {},
        fields: {
          COSTUME: ['CheDo1_TuKeo'],
        },
        shadow: true,
        topLevel: false,
      },
      btn_show: {
        opcode: 'looks_show',
        next: null,
        parent: 'btn_costume_init',
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Khi click vào nút -> chuyển đổi giữa Chế độ 1 và Chế độ 2
      btn_click: {
        opcode: 'event_whenthisspriteclicked',
        next: 'btn_toggle_if',
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 200,
      },
      btn_toggle_if: {
        opcode: 'control_if_else',
        next: null,
        parent: 'btn_click',
        inputs: {
          CONDITION: [2, 'btn_is_c1'],
          SUBSTACK: [2, 'btn_set_m2'],
          SUBSTACK2: [2, 'btn_set_m1'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_is_c1: {
        opcode: 'operator_equals',
        next: null,
        parent: 'btn_toggle_if',
        inputs: {
          OPERAND1: [3, [12, 'Che_Do_Choi', 'var_mode'], [10, '']],
          OPERAND2: [1, [10, '1']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_set_m2: {
        opcode: 'data_setvariableto',
        next: 'btn_switch_c2',
        parent: 'btn_toggle_if',
        inputs: {
          VALUE: [1, [10, '2']],
        },
        fields: {
          VARIABLE: ['Che_Do_Choi', 'var_mode'],
        },
        shadow: false,
        topLevel: false,
      },
      btn_switch_c2: {
        opcode: 'looks_switchcostumeto',
        next: 'btn_say_m2',
        parent: 'btn_set_m2',
        inputs: {
          COSTUME: [1, 'btn_menu_c2'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_menu_c2: {
        opcode: 'looks_costume',
        next: null,
        parent: 'btn_switch_c2',
        inputs: {},
        fields: {
          COSTUME: ['CheDo2_NhoKien'],
        },
        shadow: true,
        topLevel: false,
      },
      btn_say_m2: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: 'btn_switch_c2',
        inputs: {
          MESSAGE: [
            1,
            [10, 'Đã chọn: Nhờ bạn Kiến Sáng nhặt! Click món rác rồi click thùng nhé!'],
          ],
          SECS: [1, [4, '2.5']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_set_m1: {
        opcode: 'data_setvariableto',
        next: 'btn_switch_c1_back',
        parent: 'btn_toggle_if',
        inputs: {
          VALUE: [1, [10, '1']],
        },
        fields: {
          VARIABLE: ['Che_Do_Choi', 'var_mode'],
        },
        shadow: false,
        topLevel: false,
      },
      btn_switch_c1_back: {
        opcode: 'looks_switchcostumeto',
        next: 'btn_say_m1',
        parent: 'btn_set_m1',
        inputs: {
          COSTUME: [1, 'btn_menu_c1_back'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      btn_menu_c1_back: {
        opcode: 'looks_costume',
        next: null,
        parent: 'btn_switch_c1_back',
        inputs: {},
        fields: {
          COSTUME: ['CheDo1_TuKeo'],
        },
        shadow: true,
        topLevel: false,
      },
      btn_say_m1: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: 'btn_switch_c1_back',
        inputs: {
          MESSAGE: [1, [10, 'Đã chọn: Bé tự nhặt và kéo thả rác vào thùng!']],
          SECS: [1, [4, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };
  };

  // BUILDER: Khối lệnh cho Robot Kiến Sáng
  const buildRobotKienSangBlocks = () => {
    const blocks: Record<string, any> = {
      // 1. Cờ Xanh -> Chào mừng
      b_kien_flag: {
        opcode: 'event_whenflagclicked',
        next: 'b_kien_size',
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 40,
        y: 40,
      },
      b_kien_size: {
        opcode: 'looks_setsizeto',
        next: 'b_kien_pos',
        parent: 'b_kien_flag',
        inputs: {
          SIZE: [1, [4, String(finalRobotSize)]],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_kien_pos: {
        opcode: 'motion_gotoxy',
        next: 'b_kien_idle_costume',
        parent: 'b_kien_size',
        inputs: {
          X: [1, [4, '0']],
          Y: [1, [4, '-25']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_kien_idle_costume: {
        opcode: 'looks_switchcostumeto',
        next: 'b_kien_show',
        parent: 'b_kien_pos',
        inputs: {
          COSTUME: [1, 'b_menu_init_idle'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_init_idle: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_kien_idle_costume',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_idle'],
        },
        shadow: true,
        topLevel: false,
      },
      b_kien_show: {
        opcode: 'looks_show',
        next: 'b_kien_say_welcome',
        parent: 'b_kien_idle_costume',
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_kien_say_welcome: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: 'b_kien_show',
        inputs: {
          MESSAGE: [
            1,
            [10, 'Chào bạn nhỏ! Cùng tớ phân loại rác giúp lớp mình luôn sạch đẹp nhé!'],
          ],
          SECS: [1, [4, '3']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // 2. Khi nhận tin [DungRoi] ở chế độ bé tự kéo -> Vui mừng & phát âm thanh
      b_on_correct: {
        opcode: 'event_whenbroadcastreceived',
        next: 'b_costume_vui',
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['DungRoi', 'bc_correct'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 220,
      },
      b_costume_vui: {
        opcode: 'looks_switchcostumeto',
        next: 'b_snd_correct',
        parent: 'b_on_correct',
        inputs: {
          COSTUME: [1, 'b_menu_vui'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_vui: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_costume_vui',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_vui'],
        },
        shadow: true,
        topLevel: false,
      },
      b_snd_correct: {
        opcode: 'sound_play',
        next: 'b_say_vui',
        parent: 'b_costume_vui',
        inputs: {
          SOUND_MENU: [1, 'b_menu_snd_ding'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_snd_ding: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: 'b_snd_correct',
        inputs: {},
        fields: {
          SOUND_MENU: ['DungRoi'],
        },
        shadow: true,
        topLevel: false,
      },
      b_say_vui: {
        opcode: 'looks_sayforsecs',
        next: 'b_back_idle1',
        parent: 'b_snd_correct',
        inputs: {
          MESSAGE: [1, [10, 'Hoan hô! Đúng rồi bạn ơi!']],
          SECS: [1, [4, '1.8']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_back_idle1: {
        opcode: 'looks_switchcostumeto',
        next: null,
        parent: 'b_say_vui',
        inputs: {
          COSTUME: [1, 'b_menu_idle1'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_idle1: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_back_idle1',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_idle'],
        },
        shadow: true,
        topLevel: false,
      },

      // 3. Khi nhận tin [NhamRoi] ở chế độ bé tự kéo -> Buồn & động viên thử lại
      b_on_wrong: {
        opcode: 'event_whenbroadcastreceived',
        next: 'b_costume_buon',
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['NhamRoi', 'bc_wrong'],
        },
        shadow: false,
        topLevel: true,
        x: 40,
        y: 440,
      },
      b_costume_buon: {
        opcode: 'looks_switchcostumeto',
        next: 'b_snd_wrong',
        parent: 'b_on_wrong',
        inputs: {
          COSTUME: [1, 'b_menu_buon'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_buon: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_costume_buon',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_buon'],
        },
        shadow: true,
        topLevel: false,
      },
      b_snd_wrong: {
        opcode: 'sound_play',
        next: 'b_say_buon',
        parent: 'b_costume_buon',
        inputs: {
          SOUND_MENU: [1, 'b_menu_snd_boing'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_snd_boing: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: 'b_snd_wrong',
        inputs: {},
        fields: {
          SOUND_MENU: ['NhamRoi'],
        },
        shadow: true,
        topLevel: false,
      },
      b_say_buon: {
        opcode: 'looks_sayforsecs',
        next: 'b_back_idle2',
        parent: 'b_snd_wrong',
        inputs: {
          MESSAGE: [1, [10, 'Ôi nhầm rồi, bạn thử lại nhé!']],
          SECS: [1, [4, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_back_idle2: {
        opcode: 'looks_switchcostumeto',
        next: null,
        parent: 'b_say_buon',
        inputs: {
          COSTUME: [1, 'b_menu_idle2'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_idle2: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_back_idle2',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_idle'],
        },
        shadow: true,
        topLevel: false,
      },

      // 4. CHẾ ĐỘ 2: KIẾN SÁNG CHẠY TỚI NHẶT RÁC VÀ BỎ VÀO THÙNG
      b_on_run_robot: {
        opcode: 'event_whenbroadcastreceived',
        next: 'b_glide_to_trash',
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['Kien_Sang_Di_Nhat', 'bc_robot_run'],
        },
        shadow: false,
        topLevel: true,
        x: 440,
        y: 40,
      },
      b_glide_to_trash: {
        opcode: 'motion_glidesecstoxy',
        next: 'b_bc_picked_trash',
        parent: 'b_on_run_robot',
        inputs: {
          SECS: [1, [4, '0.8']],
          X: [3, [12, 'Toa_Do_X_Rac', 'var_trash_x'], [10, '0']],
          Y: [3, [12, 'Toa_Do_Y_Rac', 'var_trash_y'], [10, '-100']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_bc_picked_trash: {
        opcode: 'event_broadcast',
        next: 'b_glide_to_bin_if',
        parent: 'b_glide_to_trash',
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Mon_Rac_Bi_Nhat', 'bc_picked']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_glide_to_bin_if: {
        opcode: 'control_if_else',
        next: 'b_check_correct_match',
        parent: 'b_bc_picked_trash',
        inputs: {
          CONDITION: [2, 'b_is_target_xanh'],
          SUBSTACK: [2, 'b_glide_bin_xanh'],
          SUBSTACK2: [2, 'b_glide_bin_cam'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_is_target_xanh: {
        opcode: 'operator_equals',
        next: null,
        parent: 'b_glide_to_bin_if',
        inputs: {
          OPERAND1: [3, [12, 'Thung_Chon', 'var_chosen_bin'], [10, '']],
          OPERAND2: [1, [10, 'HuuCo']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_glide_bin_xanh: {
        opcode: 'motion_glidesecstoxy',
        next: null,
        parent: 'b_glide_to_bin_if',
        inputs: {
          SECS: [1, [4, '0.8']],
          X: [1, [4, '-130']],
          Y: [1, [4, '-65']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_glide_bin_cam: {
        opcode: 'motion_glidesecstoxy',
        next: null,
        parent: 'b_glide_to_bin_if',
        inputs: {
          SECS: [1, [4, '0.8']],
          X: [1, [4, '130']],
          Y: [1, [4, '-65']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Kiểm tra món rác và thùng có khớp nhau không
      b_check_correct_match: {
        opcode: 'control_if_else',
        next: 'b_return_home',
        parent: 'b_glide_to_bin_if',
        inputs: {
          CONDITION: [2, 'b_is_cat_match'],
          SUBSTACK: [2, 'b_match_score'],
          SUBSTACK2: [2, 'b_wrong_costume'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_is_cat_match: {
        opcode: 'operator_equals',
        next: null,
        parent: 'b_check_correct_match',
        inputs: {
          OPERAND1: [3, [12, 'Loai_Rac_Dang_Chon', 'var_chosen_cat'], [10, '']],
          OPERAND2: [3, [12, 'Thung_Chon', 'var_chosen_bin'], [10, '']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Đúng loại -> Cộng sao, ẩn rác, khen ngợi
      b_match_score: {
        opcode: 'data_changevariableby',
        next: 'b_match_remain',
        parent: 'b_check_correct_match',
        inputs: {
          VALUE: [1, [4, '1']],
        },
        fields: {
          VARIABLE: ['Diem_Sao ⭐', 'var_star'],
        },
        shadow: false,
        topLevel: false,
      },
      b_match_remain: {
        opcode: 'data_changevariableby',
        next: 'b_match_costume',
        parent: 'b_match_score',
        inputs: {
          VALUE: [1, [4, '-1']],
        },
        fields: {
          VARIABLE: ['So_Rac_Con_Lai', 'var_remain'],
        },
        shadow: false,
        topLevel: false,
      },
      b_match_costume: {
        opcode: 'looks_switchcostumeto',
        next: 'b_match_snd',
        parent: 'b_match_remain',
        inputs: {
          COSTUME: [1, 'b_menu_vui_m'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_vui_m: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_match_costume',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_vui'],
        },
        shadow: true,
        topLevel: false,
      },
      b_match_snd: {
        opcode: 'sound_play',
        next: 'b_match_bc_hide',
        parent: 'b_match_costume',
        inputs: {
          SOUND_MENU: [1, 'b_menu_snd_ding_m'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_snd_ding_m: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: 'b_match_snd',
        inputs: {},
        fields: {
          SOUND_MENU: ['DungRoi'],
        },
        shadow: true,
        topLevel: false,
      },
      b_match_bc_hide: {
        opcode: 'event_broadcast',
        next: 'b_match_say',
        parent: 'b_match_snd',
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Mon_Rac_Bien_Mat', 'bc_disappear']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_match_say: {
        opcode: 'looks_sayforsecs',
        next: 'b_match_bc_wave',
        parent: 'b_match_bc_hide',
        inputs: {
          MESSAGE: [1, [10, 'Hoan hô! Bạn chỉ đúng thùng rồi!']],
          SECS: [1, [4, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_match_bc_wave: {
        opcode: 'event_broadcast',
        next: null,
        parent: 'b_match_say',
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Kiem_Tra_Dot', 'bc_check_wave']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Sai loại -> Buồn, trả rác về, động viên
      b_wrong_costume: {
        opcode: 'looks_switchcostumeto',
        next: 'b_wrong_snd',
        parent: 'b_check_correct_match',
        inputs: {
          COSTUME: [1, 'b_menu_buon_m'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_buon_m: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_wrong_costume',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_buon'],
        },
        shadow: true,
        topLevel: false,
      },
      b_wrong_snd: {
        opcode: 'sound_play',
        next: 'b_wrong_bc_return',
        parent: 'b_wrong_costume',
        inputs: {
          SOUND_MENU: [1, 'b_menu_snd_boing_m'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_snd_boing_m: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: 'b_wrong_snd',
        inputs: {},
        fields: {
          SOUND_MENU: ['NhamRoi'],
        },
        shadow: true,
        topLevel: false,
      },
      b_wrong_bc_return: {
        opcode: 'event_broadcast',
        next: 'b_wrong_say',
        parent: 'b_wrong_snd',
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Mon_Rac_Tra_Ve', 'bc_return']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_wrong_say: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: 'b_wrong_bc_return',
        inputs: {
          MESSAGE: [1, [10, 'Ôi nhầm rồi, bạn thử lại nhé!']],
          SECS: [1, [4, '2']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

      // Sau khi xong -> Kiến Sáng lướt về giữa lớp học
      b_return_home: {
        opcode: 'motion_glidesecstoxy',
        next: 'b_home_idle',
        parent: 'b_check_correct_match',
        inputs: {
          SECS: [1, [4, '0.5']],
          X: [1, [4, '0']],
          Y: [1, [4, '-25']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_home_idle: {
        opcode: 'looks_switchcostumeto',
        next: 'b_clear_selected',
        parent: 'b_return_home',
        inputs: {
          COSTUME: [1, 'b_menu_idle_home'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_idle_home: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_home_idle',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_idle'],
        },
        shadow: true,
        topLevel: false,
      },
      b_clear_selected: {
        opcode: 'data_setvariableto',
        next: null,
        parent: 'b_home_idle',
        inputs: {
          VALUE: [1, [10, '']],
        },
        fields: {
          VARIABLE: ['Mon_Rac_Dang_Chon', 'var_chosen_trash'],
        },
        shadow: false,
        topLevel: false,
      },

      // 5. Khi nhận tin [ChienThang] 10 sao -> Ăn mừng tưng bừng!
      b_on_win: {
        opcode: 'event_whenbroadcastreceived',
        next: 'b_win_pos',
        parent: null,
        inputs: {},
        fields: {
          BROADCAST_OPTION: ['ChienThang', 'bc_win'],
        },
        shadow: false,
        topLevel: true,
        x: 440,
        y: 600,
      },
      b_win_pos: {
        opcode: 'motion_gotoxy',
        next: 'b_costume_win',
        parent: 'b_on_win',
        inputs: {
          X: [1, [4, '0']],
          Y: [1, [4, '-25']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_costume_win: {
        opcode: 'looks_switchcostumeto',
        next: 'b_snd_win',
        parent: 'b_win_pos',
        inputs: {
          COSTUME: [1, 'b_menu_win'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_win: {
        opcode: 'looks_costume',
        next: null,
        parent: 'b_costume_win',
        inputs: {},
        fields: {
          COSTUME: ['kien_sang_vui'],
        },
        shadow: true,
        topLevel: false,
      },
      b_snd_win: {
        opcode: 'sound_play',
        next: 'b_say_win',
        parent: 'b_costume_win',
        inputs: {
          SOUND_MENU: [1, 'b_menu_snd_fanfare'],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      b_menu_snd_fanfare: {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: 'b_snd_win',
        inputs: {},
        fields: {
          SOUND_MENU: ['ChienThang'],
        },
        shadow: true,
        topLevel: false,
      },
      b_say_win: {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: 'b_snd_win',
        inputs: {
          MESSAGE: [1, [10, 'Yeah, 10 sao rồi, lớp mình sạch quá!']],
          SECS: [1, [4, '5']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      },

    };

    // 6. ĐỘNG CƠ DI CHUYỂN MƯỢT MÀ VÀ CHU KỲ BƯỚC ĐI HOẠT HÌNH (VÒNG LẶP FOREVER + PHÍM MŨI TÊN/WASD)
    // Giúp Kiến Sáng lướt êm ái, đổi 12 dáng bước chân khi chưa cầm rác, và giữ nguyên dáng cầm rác khi đang mang rác
    blocks['b_move_flag'] = {
      opcode: 'event_whenflagclicked',
      next: 'b_move_forever',
      parent: null,
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: true,
      x: 800,
      y: 40,
    };

    blocks['b_move_forever'] = {
      opcode: 'control_forever',
      next: null,
      parent: 'b_move_flag',
      inputs: {
        SUBSTACK: [2, 'b_loop_check_r'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // KIỂM TRA PHÍM SANG PHẢI (Mũi tên phải hoặc D)
    blocks['b_loop_check_r'] = {
      opcode: 'control_if',
      next: 'b_loop_check_l',
      parent: 'b_move_forever',
      inputs: {
        CONDITION: [2, 'b_loop_or_r'],
        SUBSTACK: [2, 'b_act_r_style'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_loop_or_r'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_loop_check_r',
      inputs: {
        OPERAND1: [2, 'b_key_r1'],
        OPERAND2: [2, 'b_key_r2'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_key_r1'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_r',
      inputs: { KEY_OPTION: [1, 'b_menu_key_r1'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_r1'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_r1',
      inputs: {},
      fields: { KEY_OPTION: ['right arrow'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_key_r2'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_r',
      inputs: { KEY_OPTION: [1, 'b_menu_key_r2'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_r2'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_r2',
      inputs: {},
      fields: { KEY_OPTION: ['d'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_act_r_style'] = {
      opcode: 'motion_setrotationstyle',
      next: 'b_act_r_point',
      parent: 'b_loop_check_r',
      inputs: {},
      fields: { STYLE: ['left-right'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_r_point'] = {
      opcode: 'motion_pointindirection',
      next: 'b_act_r_move',
      parent: 'b_act_r_style',
      inputs: { DIRECTION: [1, [4, '90']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_r_move'] = {
      opcode: 'motion_changexby',
      next: 'b_act_r_check_free',
      parent: 'b_act_r_point',
      inputs: { DX: [1, [4, '4']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_r_check_free'] = {
      opcode: 'control_if',
      next: null,
      parent: 'b_act_r_move',
      inputs: {
        CONDITION: [2, 'b_r_is_free'],
        SUBSTACK: [2, 'b_r_inc_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_is_free'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_act_r_check_free',
      inputs: {
        OPERAND1: [3, [12, 'Mon_Rac_Dang_Cam', 'var_holding_trash'], [10, '']],
        OPERAND2: [1, [10, '']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_inc_step'] = {
      opcode: 'data_changevariableby',
      next: 'b_r_wrap_check',
      parent: 'b_act_r_check_free',
      inputs: { VALUE: [1, [4, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_wrap_check'] = {
      opcode: 'control_if',
      next: 'b_r_switch_cost',
      parent: 'b_r_inc_step',
      inputs: {
        CONDITION: [2, 'b_r_gt_12'],
        SUBSTACK: [2, 'b_r_reset_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_gt_12'] = {
      opcode: 'operator_gt',
      next: null,
      parent: 'b_r_wrap_check',
      inputs: {
        OPERAND1: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
        OPERAND2: [1, [10, '12']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_reset_step'] = {
      opcode: 'data_setvariableto',
      next: null,
      parent: 'b_r_wrap_check',
      inputs: { VALUE: [1, [10, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_switch_cost'] = {
      opcode: 'looks_switchcostumeto',
      next: null,
      parent: 'b_r_wrap_check',
      inputs: { COSTUME: [3, 'b_r_join_cost', [10, 'k-1']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_r_join_cost'] = {
      opcode: 'operator_join',
      next: null,
      parent: 'b_r_switch_cost',
      inputs: {
        STRING1: [1, [10, 'k-']],
        STRING2: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // KIỂM TRA PHÍM SANG TRÁI (Mũi tên trái hoặc A)
    blocks['b_loop_check_l'] = {
      opcode: 'control_if',
      next: 'b_loop_check_u',
      parent: 'b_loop_check_r',
      inputs: {
        CONDITION: [2, 'b_loop_or_l'],
        SUBSTACK: [2, 'b_act_l_style'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_loop_or_l'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_loop_check_l',
      inputs: {
        OPERAND1: [2, 'b_key_l1'],
        OPERAND2: [2, 'b_key_l2'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_key_l1'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_l',
      inputs: { KEY_OPTION: [1, 'b_menu_key_l1'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_l1'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_l1',
      inputs: {},
      fields: { KEY_OPTION: ['left arrow'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_key_l2'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_l',
      inputs: { KEY_OPTION: [1, 'b_menu_key_l2'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_l2'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_l2',
      inputs: {},
      fields: { KEY_OPTION: ['a'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_act_l_style'] = {
      opcode: 'motion_setrotationstyle',
      next: 'b_act_l_point',
      parent: 'b_loop_check_l',
      inputs: {},
      fields: { STYLE: ['left-right'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_l_point'] = {
      opcode: 'motion_pointindirection',
      next: 'b_act_l_move',
      parent: 'b_act_l_style',
      inputs: { DIRECTION: [1, [4, '-90']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_l_move'] = {
      opcode: 'motion_changexby',
      next: 'b_act_l_check_free',
      parent: 'b_act_l_point',
      inputs: { DX: [1, [4, '-4']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_l_check_free'] = {
      opcode: 'control_if',
      next: null,
      parent: 'b_act_l_move',
      inputs: {
        CONDITION: [2, 'b_l_is_free'],
        SUBSTACK: [2, 'b_l_inc_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_is_free'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_act_l_check_free',
      inputs: {
        OPERAND1: [3, [12, 'Mon_Rac_Dang_Cam', 'var_holding_trash'], [10, '']],
        OPERAND2: [1, [10, '']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_inc_step'] = {
      opcode: 'data_changevariableby',
      next: 'b_l_wrap_check',
      parent: 'b_act_l_check_free',
      inputs: { VALUE: [1, [4, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_wrap_check'] = {
      opcode: 'control_if',
      next: 'b_l_switch_cost',
      parent: 'b_l_inc_step',
      inputs: {
        CONDITION: [2, 'b_l_gt_12'],
        SUBSTACK: [2, 'b_l_reset_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_gt_12'] = {
      opcode: 'operator_gt',
      next: null,
      parent: 'b_l_wrap_check',
      inputs: {
        OPERAND1: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
        OPERAND2: [1, [10, '12']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_reset_step'] = {
      opcode: 'data_setvariableto',
      next: null,
      parent: 'b_l_wrap_check',
      inputs: { VALUE: [1, [10, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_switch_cost'] = {
      opcode: 'looks_switchcostumeto',
      next: null,
      parent: 'b_l_wrap_check',
      inputs: { COSTUME: [3, 'b_l_join_cost', [10, 'k-1']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_l_join_cost'] = {
      opcode: 'operator_join',
      next: null,
      parent: 'b_l_switch_cost',
      inputs: {
        STRING1: [1, [10, 'k-']],
        STRING2: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // KIỂM TRA PHÍM ĐI LÊN (Mũi tên lên hoặc W)
    blocks['b_loop_check_u'] = {
      opcode: 'control_if',
      next: 'b_loop_check_d',
      parent: 'b_loop_check_l',
      inputs: {
        CONDITION: [2, 'b_loop_or_u'],
        SUBSTACK: [2, 'b_act_u_move'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_loop_or_u'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_loop_check_u',
      inputs: {
        OPERAND1: [2, 'b_key_u1'],
        OPERAND2: [2, 'b_key_u2'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_key_u1'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_u',
      inputs: { KEY_OPTION: [1, 'b_menu_key_u1'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_u1'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_u1',
      inputs: {},
      fields: { KEY_OPTION: ['up arrow'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_key_u2'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_u',
      inputs: { KEY_OPTION: [1, 'b_menu_key_u2'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_u2'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_u2',
      inputs: {},
      fields: { KEY_OPTION: ['w'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_act_u_move'] = {
      opcode: 'motion_changeyby',
      next: 'b_act_u_check_free',
      parent: 'b_loop_check_u',
      inputs: { DY: [1, [4, '4']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_u_check_free'] = {
      opcode: 'control_if',
      next: null,
      parent: 'b_act_u_move',
      inputs: {
        CONDITION: [2, 'b_u_is_free'],
        SUBSTACK: [2, 'b_u_inc_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_is_free'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_act_u_check_free',
      inputs: {
        OPERAND1: [3, [12, 'Mon_Rac_Dang_Cam', 'var_holding_trash'], [10, '']],
        OPERAND2: [1, [10, '']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_inc_step'] = {
      opcode: 'data_changevariableby',
      next: 'b_u_wrap_check',
      parent: 'b_act_u_check_free',
      inputs: { VALUE: [1, [4, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_wrap_check'] = {
      opcode: 'control_if',
      next: 'b_u_switch_cost',
      parent: 'b_u_inc_step',
      inputs: {
        CONDITION: [2, 'b_u_gt_12'],
        SUBSTACK: [2, 'b_u_reset_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_gt_12'] = {
      opcode: 'operator_gt',
      next: null,
      parent: 'b_u_wrap_check',
      inputs: {
        OPERAND1: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
        OPERAND2: [1, [10, '12']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_reset_step'] = {
      opcode: 'data_setvariableto',
      next: null,
      parent: 'b_u_wrap_check',
      inputs: { VALUE: [1, [10, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_switch_cost'] = {
      opcode: 'looks_switchcostumeto',
      next: null,
      parent: 'b_u_wrap_check',
      inputs: { COSTUME: [3, 'b_u_join_cost', [10, 'k-1']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_u_join_cost'] = {
      opcode: 'operator_join',
      next: null,
      parent: 'b_u_switch_cost',
      inputs: {
        STRING1: [1, [10, 'k-']],
        STRING2: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // KIỂM TRA PHÍM ĐI XUỐNG (Mũi tên xuống hoặc S)
    blocks['b_loop_check_d'] = {
      opcode: 'control_if',
      next: 'b_loop_tick_wait',
      parent: 'b_loop_check_u',
      inputs: {
        CONDITION: [2, 'b_loop_or_d'],
        SUBSTACK: [2, 'b_act_d_move'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_loop_or_d'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_loop_check_d',
      inputs: {
        OPERAND1: [2, 'b_key_d1'],
        OPERAND2: [2, 'b_key_d2'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_key_d1'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_d',
      inputs: { KEY_OPTION: [1, 'b_menu_key_d1'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_d1'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_d1',
      inputs: {},
      fields: { KEY_OPTION: ['down arrow'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_key_d2'] = {
      opcode: 'sensing_keypressed',
      next: null,
      parent: 'b_loop_or_d',
      inputs: { KEY_OPTION: [1, 'b_menu_key_d2'] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_menu_key_d2'] = {
      opcode: 'sensing_keyoptions',
      next: null,
      parent: 'b_key_d2',
      inputs: {},
      fields: { KEY_OPTION: ['s'] },
      shadow: true,
      topLevel: false,
    };
    blocks['b_act_d_move'] = {
      opcode: 'motion_changeyby',
      next: 'b_act_d_check_free',
      parent: 'b_loop_check_d',
      inputs: { DY: [1, [4, '-4']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_act_d_check_free'] = {
      opcode: 'control_if',
      next: null,
      parent: 'b_act_d_move',
      inputs: {
        CONDITION: [2, 'b_d_is_free'],
        SUBSTACK: [2, 'b_d_inc_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_is_free'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_act_d_check_free',
      inputs: {
        OPERAND1: [3, [12, 'Mon_Rac_Dang_Cam', 'var_holding_trash'], [10, '']],
        OPERAND2: [1, [10, '']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_inc_step'] = {
      opcode: 'data_changevariableby',
      next: 'b_d_wrap_check',
      parent: 'b_act_d_check_free',
      inputs: { VALUE: [1, [4, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_wrap_check'] = {
      opcode: 'control_if',
      next: 'b_d_switch_cost',
      parent: 'b_d_inc_step',
      inputs: {
        CONDITION: [2, 'b_d_gt_12'],
        SUBSTACK: [2, 'b_d_reset_step'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_gt_12'] = {
      opcode: 'operator_gt',
      next: null,
      parent: 'b_d_wrap_check',
      inputs: {
        OPERAND1: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
        OPERAND2: [1, [10, '12']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_reset_step'] = {
      opcode: 'data_setvariableto',
      next: null,
      parent: 'b_d_wrap_check',
      inputs: { VALUE: [1, [10, '1']] },
      fields: { VARIABLE: ['Buoc_Chan', 'var_step'] },
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_switch_cost'] = {
      opcode: 'looks_switchcostumeto',
      next: null,
      parent: 'b_d_wrap_check',
      inputs: { COSTUME: [3, 'b_d_join_cost', [10, 'k-1']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };
    blocks['b_d_join_cost'] = {
      opcode: 'operator_join',
      next: null,
      parent: 'b_d_switch_cost',
      inputs: {
        STRING1: [1, [10, 'k-']],
        STRING2: [3, [12, 'Buoc_Chan', 'var_step'], [10, '1']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // Nhịp điều tiết vòng lặp: 0.04s cho chuyển động 25 FPS mượt mà
    blocks['b_loop_tick_wait'] = {
      opcode: 'control_wait',
      next: null,
      parent: 'b_loop_check_d',
      inputs: { DURATION: [1, [4, '0.04']] },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // 7. PHÍM CÁCH (Space Key) - NHẶT VÀ BỎ RÁC VÀO THÙNG CHUẨN XÁC
    // Hỗ trợ cả kiểm tra chạm trực tiếp và cự ly tiếp cận gần (<70px)
    blocks['b_when_space'] = {
      opcode: 'event_whenkeypressed',
      next: 'b_sp_check_holding',
      parent: null,
      inputs: {},
      fields: { KEY_OPTION: ['space', null] },
      shadow: false,
      topLevel: true,
      x: 1200,
      y: 40,
    };

    // Kiểm tra: Đang cầm rác hay chưa cầm rác?
    blocks['b_sp_check_holding'] = {
      opcode: 'control_if_else',
      next: null,
      parent: 'b_when_space',
      inputs: {
        CONDITION: [2, 'b_sp_is_not_holding'],
        SUBSTACK: [2, 'b_sp_pick_check_1'],
        SUBSTACK2: [2, 'b_sp_drop_check_bin_xanh'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_is_not_holding'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_sp_check_holding',
      inputs: {
        OPERAND1: [3, [12, 'Mon_Rac_Dang_Cam', 'var_holding_trash'], [10, '']],
        OPERAND2: [1, [10, '']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // Danh sách đầy đủ 15 món rác để kiểm tra tiếp cận khi bấm Phím Cách
    const TRASH_PICK_SPECS = [
      { id: 'chuoi', cat: 'HuuCo', spriteName: 'Vỏ Chuối (Hữu Cơ)', costume: 'cam_vochuoi_01', nameVi: 'Vỏ Chuối' },
      { id: 'lon', cat: 'TaiChe', spriteName: 'Lon Nước Ngọt (Tái Chế)', costume: 'cam_volon_01', nameVi: 'Lon Nước Ngọt' },
      { id: 'sua', cat: 'TaiChe', spriteName: 'Vỏ Hộp Sữa (Tái Chế)', costume: 'cam_hopsua_01', nameVi: 'Vỏ Hộp Sữa' },
      { id: 'tao', cat: 'HuuCo', spriteName: 'Lõi Táo (Hữu Cơ)', costume: 'cam_votao_01', nameVi: 'Lõi Táo' },
      { id: 'banh', cat: 'HuuCo', spriteName: 'Mẩu Bánh Mì (Hữu Cơ)', costume: 'cam_banh_mi_01', nameVi: 'Mẩu Bánh Mì' },
      { id: 'chai', cat: 'TaiChe', spriteName: 'Chai Nước Suối (Tái Chế)', costume: 'cam_vochainhua_01', nameVi: 'Chai Nước Suối' },
      { id: 'xuongca', cat: 'HuuCo', spriteName: 'Xương Cá (Hữu Cơ)', costume: 'cam_xuongca_01', nameVi: 'Xương Cá' },
      { id: 'hopgiay', cat: 'TaiChe', spriteName: 'Vỏ Hộp Giấy (Tái Chế)', costume: 'cam_hopgiay_01', nameVi: 'Vỏ Hộp Giấy' },
      { id: 'giaycu', cat: 'TaiChe', spriteName: 'Giấy Cũ (Tái Chế)', costume: 'cam_giaycu_01', nameVi: 'Giấy Cũ' },
      { id: 'duiga', cat: 'HuuCo', spriteName: 'Đùi Gà (Hữu Cơ)', costume: 'cam_duiga_01', nameVi: 'Đùi Gà' },
      { id: 'chaithuytinh', cat: 'TaiChe', spriteName: 'Vỏ Chai Thủy Tinh (Tái Chế)', costume: 'cam_vochai_01', nameVi: 'Vỏ Chai Thủy Tinh' },
      { id: 'ongnhua', cat: 'TaiChe', spriteName: 'Ống Hút Nhựa (Tái Chế)', costume: 'cam_ongnhua_01', nameVi: 'Ống Hút Nhựa' },
      { id: 'duahau', cat: 'HuuCo', spriteName: 'Vỏ Dưa Hấu (Hữu Cơ)', costume: 'cam_voduahau_01', nameVi: 'Vỏ Dưa Hấu' },
      { id: 'lacay', cat: 'HuuCo', spriteName: 'Lá Cây (Hữu Cơ)', costume: 'cam_lacay_01', nameVi: 'Lá Cây' },
      { id: 'vokeo', cat: 'TaiChe', spriteName: 'Vỏ Kẹo Nilon (Tái Chế)', costume: 'cam_vokeo_01', nameVi: 'Vỏ Kẹo Nilon' },
    ];

    TRASH_PICK_SPECS.forEach((item, idx) => {
      const stepIdx = idx + 1;
      const checkId = `b_sp_pick_check_${stepIdx}`;
      const condOrId = `b_sp_cond_or_${stepIdx}`;
      const touchId = `b_sp_touch_${stepIdx}`;
      const touchMenu = `b_sp_menu_touch_${stepIdx}`;
      const distId = `b_sp_dist_${stepIdx}`;
      const distMenu = `b_sp_dist_menu_${stepIdx}`;
      const distLtId = `b_sp_dist_lt_${stepIdx}`;
      const setCamId = `b_sp_set_cam_${stepIdx}`;
      const setCatId = `b_sp_set_cat_${stepIdx}`;
      const setChonId = `b_sp_set_chon_${stepIdx}`;
      const sndId = `b_sp_snd_${stepIdx}`;
      const sndMenu = `b_sp_snd_menu_${stepIdx}`;
      const bcHideId = `b_sp_bc_hide_${stepIdx}`;
      const costId = `b_sp_cost_${stepIdx}`;
      const costMenu = `b_sp_cost_menu_${stepIdx}`;
      const sayId = `b_sp_say_${stepIdx}`;
      const nextCheckId = stepIdx < TRASH_PICK_SPECS.length ? `b_sp_pick_check_${stepIdx + 1}` : 'b_sp_say_not_near';

      // Điều kiện nhặt: chạm vào sprite HOẶC khoảng cách < 70 pixel
      blocks[condOrId] = {
        opcode: 'operator_or',
        next: null,
        parent: checkId,
        inputs: {
          OPERAND1: [2, touchId],
          OPERAND2: [2, distLtId],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[touchId] = {
        opcode: 'sensing_touchingobject',
        next: null,
        parent: condOrId,
        inputs: {
          TOUCHINGOBJECTMENU: [1, touchMenu],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[touchMenu] = {
        opcode: 'sensing_touchingobjectmenu',
        next: null,
        parent: touchId,
        inputs: {},
        fields: {
          TOUCHINGOBJECTMENU: [item.spriteName],
        },
        shadow: true,
        topLevel: false,
      };

      blocks[distLtId] = {
        opcode: 'operator_lt',
        next: null,
        parent: condOrId,
        inputs: {
          OPERAND1: [2, distId],
          OPERAND2: [1, [10, '70']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[distId] = {
        opcode: 'sensing_distanceto',
        next: null,
        parent: distLtId,
        inputs: {
          DISTANCETOMENU: [1, distMenu],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[distMenu] = {
        opcode: 'sensing_distancetomenu',
        next: null,
        parent: distId,
        inputs: {},
        fields: {
          DISTANCETOMENU: [item.spriteName],
        },
        shadow: true,
        topLevel: false,
      };

      blocks[checkId] = {
        opcode: 'control_if_else',
        next: null,
        parent: idx === 0 ? 'b_sp_check_holding' : `b_sp_pick_check_${idx}`,
        inputs: {
          CONDITION: [2, condOrId],
          SUBSTACK: [2, setCamId],
          SUBSTACK2: [2, nextCheckId],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      // Ghi nhận món rác đang cầm
      blocks[setCamId] = {
        opcode: 'data_setvariableto',
        next: setCatId,
        parent: checkId,
        inputs: {
          VALUE: [1, [10, item.id]],
        },
        fields: {
          VARIABLE: ['Mon_Rac_Dang_Cam', 'var_holding_trash'],
        },
        shadow: false,
        topLevel: false,
      };

      blocks[setCatId] = {
        opcode: 'data_setvariableto',
        next: setChonId,
        parent: setCamId,
        inputs: {
          VALUE: [1, [10, item.cat]],
        },
        fields: {
          VARIABLE: ['Loai_Rac_Dang_Cam', 'var_holding_cat'],
        },
        shadow: false,
        topLevel: false,
      };

      blocks[setChonId] = {
        opcode: 'data_setvariableto',
        next: sndId,
        parent: setCatId,
        inputs: {
          VALUE: [1, [10, item.id]],
        },
        fields: {
          VARIABLE: ['Mon_Rac_Dang_Chon', 'var_chosen_trash'],
        },
        shadow: false,
        topLevel: false,
      };

      blocks[sndId] = {
        opcode: 'sound_play',
        next: bcHideId,
        parent: setChonId,
        inputs: {
          SOUND_MENU: [1, sndMenu],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[sndMenu] = {
        opcode: 'sound_sounds_menu',
        next: null,
        parent: sndId,
        inputs: {},
        fields: {
          SOUND_MENU: ['ChonRac'],
        },
        shadow: true,
        topLevel: false,
      };

      // Phát tin Mon_Rac_Bien_Mat (món rác biến mất khỏi sàn)
      blocks[bcHideId] = {
        opcode: 'event_broadcast',
        next: costId,
        parent: sndId,
        inputs: {
          BROADCAST_INPUT: [1, [11, 'Mon_Rac_Bien_Mat', 'bc_disappear']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      // Đổi sang trang phục cầm món rác này
      blocks[costId] = {
        opcode: 'looks_switchcostumeto',
        next: sayId,
        parent: bcHideId,
        inputs: {
          COSTUME: [1, costMenu],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };

      blocks[costMenu] = {
        opcode: 'looks_costume',
        next: null,
        parent: costId,
        inputs: {},
        fields: {
          COSTUME: [item.costume],
        },
        shadow: true,
        topLevel: false,
      };

      blocks[sayId] = {
        opcode: 'looks_sayforsecs',
        next: null,
        parent: costId,
        inputs: {
          MESSAGE: [1, [10, `Kiến Sáng đã nhặt ${item.nameVi}! Hãy đưa tới thùng thích hợp nhé!`]],
          SECS: [1, [4, '1']],
        },
        fields: {},
        shadow: false,
        topLevel: false,
      };
    });

    // Khi không ở gần món rác nào
    blocks['b_sp_say_not_near'] = {
      opcode: 'looks_sayforsecs',
      next: null,
      parent: `b_sp_pick_check_${TRASH_PICK_SPECS.length}`,
      inputs: {
        MESSAGE: [1, [10, 'Hãy dùng phím mũi tên đi lại gần món rác trên sàn rồi nhấn Phím Cách nhé!']],
        SECS: [1, [4, '1']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // THẢ RÁC VÀO THÙNG: Kiểm tra tiếp cận Thùng Xanh hay Thùng Cam (Chạm hoặc khoảng cách < 90px)
    blocks['b_sp_drop_check_bin_xanh'] = {
      opcode: 'control_if_else',
      next: null,
      parent: 'b_sp_check_holding',
      inputs: {
        CONDITION: [2, 'b_sp_bin_xanh_or'],
        SUBSTACK: [2, 'b_sp_drop_is_xanh_match'],
        SUBSTACK2: [2, 'b_sp_drop_check_bin_cam'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_bin_xanh_or'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_sp_drop_check_bin_xanh',
      inputs: {
        OPERAND1: [2, 'b_sp_touch_bin_xanh'],
        OPERAND2: [2, 'b_sp_dist_lt_xanh'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_touch_bin_xanh'] = {
      opcode: 'sensing_touchingobject',
      next: null,
      parent: 'b_sp_bin_xanh_or',
      inputs: {
        TOUCHINGOBJECTMENU: [1, 'b_sp_menu_bin_xanh'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_bin_xanh'] = {
      opcode: 'sensing_touchingobjectmenu',
      next: null,
      parent: 'b_sp_touch_bin_xanh',
      inputs: {},
      fields: {
        TOUCHINGOBJECTMENU: ['Thùng Rác Xanh (Hữu Cơ)'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_dist_lt_xanh'] = {
      opcode: 'operator_lt',
      next: null,
      parent: 'b_sp_bin_xanh_or',
      inputs: {
        OPERAND1: [2, 'b_sp_dist_xanh'],
        OPERAND2: [1, [10, '90']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_dist_xanh'] = {
      opcode: 'sensing_distanceto',
      next: null,
      parent: 'b_sp_dist_lt_xanh',
      inputs: {
        DISTANCETOMENU: [1, 'b_sp_dist_menu_xanh'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_dist_menu_xanh'] = {
      opcode: 'sensing_distancetomenu',
      next: null,
      parent: 'b_sp_dist_xanh',
      inputs: {},
      fields: {
        DISTANCETOMENU: ['Thùng Rác Xanh (Hữu Cơ)'],
      },
      shadow: true,
      topLevel: false,
    };

    // Kiểm tra rác có phải HuuCo không
    blocks['b_sp_drop_is_xanh_match'] = {
      opcode: 'control_if_else',
      next: null,
      parent: 'b_sp_drop_check_bin_xanh',
      inputs: {
        CONDITION: [2, 'b_sp_is_cat_huuco'],
        SUBSTACK: [2, 'b_sp_drop_correct_score'],
        SUBSTACK2: [2, 'b_sp_drop_wrong_snd'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_is_cat_huuco'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_sp_drop_is_xanh_match',
      inputs: {
        OPERAND1: [3, [12, 'Loai_Rac_Dang_Cam', 'var_holding_cat'], [10, '']],
        OPERAND2: [1, [10, 'HuuCo']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // Kiểm tra Thùng Cam
    blocks['b_sp_drop_check_bin_cam'] = {
      opcode: 'control_if_else',
      next: null,
      parent: 'b_sp_drop_check_bin_xanh',
      inputs: {
        CONDITION: [2, 'b_sp_bin_cam_or'],
        SUBSTACK: [2, 'b_sp_drop_is_cam_match'],
        SUBSTACK2: [2, 'b_sp_say_not_near_bin'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_bin_cam_or'] = {
      opcode: 'operator_or',
      next: null,
      parent: 'b_sp_drop_check_bin_cam',
      inputs: {
        OPERAND1: [2, 'b_sp_touch_bin_cam'],
        OPERAND2: [2, 'b_sp_dist_lt_cam'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_touch_bin_cam'] = {
      opcode: 'sensing_touchingobject',
      next: null,
      parent: 'b_sp_bin_cam_or',
      inputs: {
        TOUCHINGOBJECTMENU: [1, 'b_sp_menu_bin_cam'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_bin_cam'] = {
      opcode: 'sensing_touchingobjectmenu',
      next: null,
      parent: 'b_sp_touch_bin_cam',
      inputs: {},
      fields: {
        TOUCHINGOBJECTMENU: ['Thùng Rác Cam (Tái Chế)'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_dist_lt_cam'] = {
      opcode: 'operator_lt',
      next: null,
      parent: 'b_sp_bin_cam_or',
      inputs: {
        OPERAND1: [2, 'b_sp_dist_cam'],
        OPERAND2: [1, [10, '90']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_dist_cam'] = {
      opcode: 'sensing_distanceto',
      next: null,
      parent: 'b_sp_dist_lt_cam',
      inputs: {
        DISTANCETOMENU: [1, 'b_sp_dist_menu_cam'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_dist_menu_cam'] = {
      opcode: 'sensing_distancetomenu',
      next: null,
      parent: 'b_sp_dist_cam',
      inputs: {},
      fields: {
        DISTANCETOMENU: ['Thùng Rác Cam (Tái Chế)'],
      },
      shadow: true,
      topLevel: false,
    };

    // Kiểm tra rác có phải TaiChe không
    blocks['b_sp_drop_is_cam_match'] = {
      opcode: 'control_if_else',
      next: null,
      parent: 'b_sp_drop_check_bin_cam',
      inputs: {
        CONDITION: [2, 'b_sp_is_cat_taiche'],
        SUBSTACK: [2, 'b_sp_drop_correct_score'],
        SUBSTACK2: [2, 'b_sp_drop_wrong_snd'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_is_cat_taiche'] = {
      opcode: 'operator_equals',
      next: null,
      parent: 'b_sp_drop_is_cam_match',
      inputs: {
        OPERAND1: [3, [12, 'Loai_Rac_Dang_Cam', 'var_holding_cat'], [10, '']],
        OPERAND2: [1, [10, 'TaiChe']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // Chuỗi xử lý khi ĐÚNG THÙNG
    blocks['b_sp_drop_correct_score'] = {
      opcode: 'data_changevariableby',
      next: 'b_sp_drop_correct_remain',
      parent: 'b_sp_drop_is_xanh_match',
      inputs: {
        VALUE: [1, [4, '1']],
      },
      fields: {
        VARIABLE: ['Diem_Sao ⭐', 'var_star'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_correct_remain'] = {
      opcode: 'data_changevariableby',
      next: 'b_sp_drop_clear_holding',
      parent: 'b_sp_drop_correct_score',
      inputs: {
        VALUE: [1, [4, '-1']],
      },
      fields: {
        VARIABLE: ['So_Rac_Con_Lai', 'var_remain'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_clear_holding'] = {
      opcode: 'data_setvariableto',
      next: 'b_sp_drop_clear_cat',
      parent: 'b_sp_drop_correct_remain',
      inputs: {
        VALUE: [1, [10, '']],
      },
      fields: {
        VARIABLE: ['Mon_Rac_Dang_Cam', 'var_holding_trash'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_clear_cat'] = {
      opcode: 'data_setvariableto',
      next: 'b_sp_drop_correct_snd',
      parent: 'b_sp_drop_clear_holding',
      inputs: {
        VALUE: [1, [10, '']],
      },
      fields: {
        VARIABLE: ['Loai_Rac_Dang_Cam', 'var_holding_cat'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_correct_snd'] = {
      opcode: 'sound_play',
      next: 'b_sp_drop_bc_dung',
      parent: 'b_sp_drop_clear_cat',
      inputs: {
        SOUND_MENU: [1, 'b_sp_snd_menu_dung'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_snd_menu_dung'] = {
      opcode: 'sound_sounds_menu',
      next: null,
      parent: 'b_sp_drop_correct_snd',
      inputs: {},
      fields: {
        SOUND_MENU: ['DungRoi'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_drop_bc_dung'] = {
      opcode: 'event_broadcast',
      next: 'b_sp_drop_cost_vui',
      parent: 'b_sp_drop_correct_snd',
      inputs: {
        BROADCAST_INPUT: [1, [11, 'DungRoi', 'bc_correct']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_cost_vui'] = {
      opcode: 'looks_switchcostumeto',
      next: 'b_sp_drop_say_dung',
      parent: 'b_sp_drop_bc_dung',
      inputs: {
        COSTUME: [1, 'b_sp_menu_cost_vui'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_cost_vui'] = {
      opcode: 'looks_costume',
      next: null,
      parent: 'b_sp_drop_cost_vui',
      inputs: {},
      fields: {
        COSTUME: ['kien_sang_vui'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_drop_say_dung'] = {
      opcode: 'looks_sayforsecs',
      next: 'b_sp_drop_cost_idle',
      parent: 'b_sp_drop_cost_vui',
      inputs: {
        MESSAGE: [1, [10, 'Hoan hô! Đúng rồi bạn ơi!']],
        SECS: [1, [4, '1.2']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_cost_idle'] = {
      opcode: 'looks_switchcostumeto',
      next: 'b_sp_drop_bc_check_wave',
      parent: 'b_sp_drop_say_dung',
      inputs: {
        COSTUME: [1, 'b_sp_menu_cost_idle'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_cost_idle'] = {
      opcode: 'looks_costume',
      next: null,
      parent: 'b_sp_drop_cost_idle',
      inputs: {},
      fields: {
        COSTUME: ['kien_sang_idle'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_drop_bc_check_wave'] = {
      opcode: 'event_broadcast',
      next: null,
      parent: 'b_sp_drop_cost_idle',
      inputs: {
        BROADCAST_INPUT: [1, [11, 'Kiem_Tra_Dot', 'bc_check_wave']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    // Chuỗi xử lý khi BỎ SAI THÙNG
    blocks['b_sp_drop_wrong_snd'] = {
      opcode: 'sound_play',
      next: 'b_sp_drop_bc_wrong',
      parent: 'b_sp_drop_is_xanh_match',
      inputs: {
        SOUND_MENU: [1, 'b_sp_snd_menu_wrong'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_snd_menu_wrong'] = {
      opcode: 'sound_sounds_menu',
      next: null,
      parent: 'b_sp_drop_wrong_snd',
      inputs: {},
      fields: {
        SOUND_MENU: ['NhamRoi'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_drop_bc_wrong'] = {
      opcode: 'event_broadcast',
      next: 'b_sp_drop_bc_return',
      parent: 'b_sp_drop_wrong_snd',
      inputs: {
        BROADCAST_INPUT: [1, [11, 'NhamRoi', 'bc_wrong']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_bc_return'] = {
      opcode: 'event_broadcast',
      next: 'b_sp_drop_clear_holding_w',
      parent: 'b_sp_drop_bc_wrong',
      inputs: {
        BROADCAST_INPUT: [1, [11, 'Mon_Rac_Tra_Ve', 'bc_return']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_clear_holding_w'] = {
      opcode: 'data_setvariableto',
      next: 'b_sp_drop_clear_cat_w',
      parent: 'b_sp_drop_bc_return',
      inputs: {
        VALUE: [1, [10, '']],
      },
      fields: {
        VARIABLE: ['Mon_Rac_Dang_Cam', 'var_holding_trash'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_clear_cat_w'] = {
      opcode: 'data_setvariableto',
      next: 'b_sp_drop_cost_buon',
      parent: 'b_sp_drop_clear_holding_w',
      inputs: {
        VALUE: [1, [10, '']],
      },
      fields: {
        VARIABLE: ['Loai_Rac_Dang_Cam', 'var_holding_cat'],
      },
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_cost_buon'] = {
      opcode: 'looks_switchcostumeto',
      next: 'b_sp_drop_say_wrong',
      parent: 'b_sp_drop_clear_cat_w',
      inputs: {
        COSTUME: [1, 'b_sp_menu_cost_buon'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_cost_buon'] = {
      opcode: 'looks_costume',
      next: null,
      parent: 'b_sp_drop_cost_buon',
      inputs: {},
      fields: {
        COSTUME: ['kien_sang_buon'],
      },
      shadow: true,
      topLevel: false,
    };

    blocks['b_sp_drop_say_wrong'] = {
      opcode: 'looks_sayforsecs',
      next: 'b_sp_drop_cost_idle_w',
      parent: 'b_sp_drop_cost_buon',
      inputs: {
        MESSAGE: [1, [10, 'Ôi nhầm rồi, bạn thử lại nhé!']],
        SECS: [1, [4, '1.2']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_drop_cost_idle_w'] = {
      opcode: 'looks_switchcostumeto',
      next: null,
      parent: 'b_sp_drop_say_wrong',
      inputs: {
        COSTUME: [1, 'b_sp_menu_cost_idle_w'],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    blocks['b_sp_menu_cost_idle_w'] = {
      opcode: 'looks_costume',
      next: null,
      parent: 'b_sp_drop_cost_idle_w',
      inputs: {},
      fields: {
        COSTUME: ['kien_sang_idle'],
      },
      shadow: true,
      topLevel: false,
    };

    // Khi đang cầm rác nhưng chưa đến gần thùng nào
    blocks['b_sp_say_not_near_bin'] = {
      opcode: 'looks_sayforsecs',
      next: null,
      parent: 'b_sp_drop_check_bin_cam',
      inputs: {
        MESSAGE: [1, [10, 'Kiến Sáng hãy đi lại gần Thùng Xanh hoặc Thùng Cam rồi nhấn Phím Cách nhé!']],
        SECS: [1, [4, '1.2']],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    };

    return blocks;
  };

  // Scratch 3.0 Project JSON definition
  const projectJson = {
    targets: [
      // 1. STAGE (Sân khấu - Quản lý Vòng chơi & Điều phối chung)
      {
        isStage: true,
        name: 'Stage',
        variables: {
          var_star: ['Diem_Sao ⭐', 0],
          var_remain: ['So_Rac_Con_Lai', 3],
          var_wave: ['Dot_Rac', 1],
          var_mode: ['Che_Do_Choi', 1],
          var_chosen_trash: ['Mon_Rac_Dang_Chon', ''],
          var_chosen_cat: ['Loai_Rac_Dang_Chon', ''],
          var_chosen_bin: ['Thung_Chon', ''],
          var_trash_x: ['Toa_Do_X_Rac', '0'],
          var_trash_y: ['Toa_Do_Y_Rac', '0'],
          var_holding_trash: ['Mon_Rac_Dang_Cam', ''],
          var_holding_cat: ['Loai_Rac_Dang_Cam', ''],
          var_step: ['Buoc_Chan', 1],
        },
        lists: {},
        broadcasts: {
          bc_win: 'ChienThang',
          bc_correct: 'DungRoi',
          bc_wrong: 'NhamRoi',
          bc_start: 'Bat_Dau_Choi',
          bc_check_wave: 'Kiem_Tra_Dot',
          bc_select: 'Chon_Rac',
          bc_robot_run: 'Kien_Sang_Di_Nhat',
          bc_picked: 'Mon_Rac_Bi_Nhat',
          bc_disappear: 'Mon_Rac_Bien_Mat',
          bc_return: 'Mon_Rac_Tra_Ve',
          bc_step: 'Buoc_Chan',
        },
        customs: [cStage],
        costumes: [cStage],
        currentCostume: 0,
        sounds: allGameSounds,
        blocks: {
          // Bắt đầu game khi click cờ xanh
          b_stage_flag: {
            opcode: 'event_whenflagclicked',
            next: 'b_stage_init_star',
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 50,
            y: 50,
          },
          b_stage_init_star: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_wave',
            parent: 'b_stage_flag',
            inputs: {
              VALUE: [1, [10, '0']],
            },
            fields: {
              VARIABLE: ['Diem_Sao ⭐', 'var_star'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_wave: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_remain',
            parent: 'b_stage_init_star',
            inputs: {
              VALUE: [1, [10, '1']],
            },
            fields: {
              VARIABLE: ['Dot_Rac', 'var_wave'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_remain: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_mode',
            parent: 'b_stage_init_wave',
            inputs: {
              VALUE: [1, [10, '3']],
            },
            fields: {
              VARIABLE: ['So_Rac_Con_Lai', 'var_remain'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_mode: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_selected',
            parent: 'b_stage_init_remain',
            inputs: {
              VALUE: [1, [10, '1']],
            },
            fields: {
              VARIABLE: ['Che_Do_Choi', 'var_mode'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_selected: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_holding_trash',
            parent: 'b_stage_init_mode',
            inputs: {
              VALUE: [1, [10, '']],
            },
            fields: {
              VARIABLE: ['Mon_Rac_Dang_Chon', 'var_chosen_trash'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_holding_trash: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_holding_cat',
            parent: 'b_stage_init_selected',
            inputs: {
              VALUE: [1, [10, '']],
            },
            fields: {
              VARIABLE: ['Mon_Rac_Dang_Cam', 'var_holding_trash'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_holding_cat: {
            opcode: 'data_setvariableto',
            next: 'b_stage_init_step',
            parent: 'b_stage_init_holding_trash',
            inputs: {
              VALUE: [1, [10, '']],
            },
            fields: {
              VARIABLE: ['Loai_Rac_Dang_Cam', 'var_holding_cat'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_init_step: {
            opcode: 'data_setvariableto',
            next: 'b_stage_bc_start',
            parent: 'b_stage_init_holding_cat',
            inputs: {
              VALUE: [1, [10, '1']],
            },
            fields: {
              VARIABLE: ['Buoc_Chan', 'var_step'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_bc_start: {
            opcode: 'event_broadcast',
            next: null,
            parent: 'b_stage_init_step',
            inputs: {
              BROADCAST_INPUT: [1, [11, 'Bat_Dau_Choi', 'bc_start']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },

          // Khi nhận tin [Kiem_Tra_Dot] -> Nếu đủ 10 sao thì thắng, nếu hết 3 rác thì qua đợt mới
          b_stage_on_check: {
            opcode: 'event_whenbroadcastreceived',
            next: 'b_stage_if_win',
            parent: null,
            inputs: {},
            fields: {
              BROADCAST_OPTION: ['Kiem_Tra_Dot', 'bc_check_wave'],
            },
            shadow: false,
            topLevel: true,
            x: 50,
            y: 350,
          },
          b_stage_if_win: {
            opcode: 'control_if_else',
            next: null,
            parent: 'b_stage_on_check',
            inputs: {
              CONDITION: [2, 'b_stage_gt_9'],
              SUBSTACK: [2, 'b_stage_bc_win'],
              SUBSTACK2: [2, 'b_stage_if_next_wave'],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_gt_9: {
            opcode: 'operator_gt',
            next: null,
            parent: 'b_stage_if_win',
            inputs: {
              OPERAND1: [3, [12, 'Diem_Sao ⭐', 'var_star'], [10, '']],
              OPERAND2: [1, [10, '9']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_bc_win: {
            opcode: 'event_broadcast',
            next: null,
            parent: 'b_stage_if_win',
            inputs: {
              BROADCAST_INPUT: [1, [11, 'ChienThang', 'bc_win']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_if_next_wave: {
            opcode: 'control_if',
            next: null,
            parent: 'b_stage_if_win',
            inputs: {
              CONDITION: [2, 'b_stage_remain_0'],
              SUBSTACK: [2, 'b_stage_wait_wave'],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_remain_0: {
            opcode: 'operator_equals',
            next: null,
            parent: 'b_stage_if_next_wave',
            inputs: {
              OPERAND1: [3, [12, 'So_Rac_Con_Lai', 'var_remain'], [10, '']],
              OPERAND2: [1, [10, '0']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_wait_wave: {
            opcode: 'control_wait',
            next: 'b_stage_inc_wave',
            parent: 'b_stage_if_next_wave',
            inputs: {
              DURATION: [1, [4, '0.6']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_stage_inc_wave: {
            opcode: 'data_changevariableby',
            next: 'b_stage_reset_remain',
            parent: 'b_stage_wait_wave',
            inputs: {
              VALUE: [1, [4, '1']],
            },
            fields: {
              VARIABLE: ['Dot_Rac', 'var_wave'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_reset_remain: {
            opcode: 'data_setvariableto',
            next: 'b_stage_bc_next_wave',
            parent: 'b_stage_inc_wave',
            inputs: {
              VALUE: [1, [10, '3']],
            },
            fields: {
              VARIABLE: ['So_Rac_Con_Lai', 'var_remain'],
            },
            shadow: false,
            topLevel: false,
          },
          b_stage_bc_next_wave: {
            opcode: 'event_broadcast',
            next: null,
            parent: 'b_stage_reset_remain',
            inputs: {
              BROADCAST_INPUT: [1, [11, 'Bat_Dau_Choi', 'bc_start']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        },
        comments: {},
        currentCostumeIndex: 0,
        volume: 100,
        layerOrder: 0,
      },

      // 2. NÚT ĐỔI CHẾ ĐỘ CHƠI (Tự kéo thả 👆 <-> Nhờ Kiến Sáng 🤖)
      {
        isStage: false,
        name: 'Nút Đổi Chế Độ',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cBtn1, cBtn2],
        costumes: [cBtn1, cBtn2],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildModeButtonBlocks(),
        comments: {},
        x: 0,
        y: 155,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 1,
      },

      // 3. THÙNG RÁC XANH LÁ (Hữu Cơ - RecycleBin1.png)
      {
        isStage: false,
        name: 'Thùng Rác Xanh (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cThungXanh],
        costumes: [cThungXanh],
        currentCostume: 0,
        sounds: allGameSounds,
        blocks: buildBinBlocks('HuuCo', -175, -70),
        comments: {},
        x: -175,
        y: -70,
        size: 38,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 2,
      },

      // 4. THÙNG RÁC CAM (Tái Chế - RecycleBin2.png)
      {
        isStage: false,
        name: 'Thùng Rác Cam (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cThungCam],
        costumes: [cThungCam],
        currentCostume: 0,
        sounds: allGameSounds,
        blocks: buildBinBlocks('TaiChe', 175, -70),
        comments: {},
        x: 175,
        y: -70,
        size: 38,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 3,
      },

      // 5. ROBOT KIẾN SÁNG (Nhân vật chính thông minh)
      {
        isStage: false,
        name: 'Robot Kiến Sáng',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: mascotCostumes,
        costumes: mascotCostumes,
        currentCostume: 0,
        sounds: allGameSounds,
        blocks: buildRobotKienSangBlocks(),
        comments: {},
        x: 0,
        y: -25,
        size: finalRobotSize,
        direction: 90,
        draggable: false,
        rotationStyle: 'left-right',
        visible: true,
        layerOrder: 4,
      },

      // 6. THẺ MÓN RÁC 1 (Đợt 1): VỎ CHUỐI (Hữu cơ)
      {
        isStage: false,
        name: 'Vỏ Chuối (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cChuoi],
        costumes: [cChuoi],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'chuoi',
          1,
          -80,
          -115,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: -80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 5,
      },

      // 7. THẺ MÓN RÁC 2 (Đợt 1): LON NƯỚC NGỌT (Tái chế)
      {
        isStage: false,
        name: 'Lon Nước Ngọt (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cLon],
        costumes: [cLon],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'lon',
          1,
          0,
          -125,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 0,
        y: -125,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 6,
      },

      // 8. THẺ MÓN RÁC 3 (Đợt 1): VỎ HỘP SỮA (Tái chế)
      {
        isStage: false,
        name: 'Vỏ Hộp Sữa (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cSua],
        costumes: [cSua],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'sua',
          1,
          80,
          -115,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 7,
      },

      // 9. THẺ MÓN RÁC 4 (Đợt 2): LÕI TÁO (Hữu cơ)
      {
        isStage: false,
        name: 'Lõi Táo (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cTao],
        costumes: [cTao],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'tao',
          2,
          -75,
          -120,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: -75,
        y: -120,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 8,
      },

      // 10. THẺ MÓN RÁC 5 (Đợt 2): MẨU BÁNH MÌ (Hữu cơ)
      {
        isStage: false,
        name: 'Mẩu Bánh Mì (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cBanh],
        costumes: [cBanh],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'banh',
          2,
          5,
          -110,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: 5,
        y: -110,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 9,
      },

      // 11. THẺ MÓN RÁC 6 (Đợt 2): CHAI NƯỚC SUỐI (Tái chế)
      {
        isStage: false,
        name: 'Chai Nước Suối (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cChai],
        costumes: [cChai],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'chai',
          2,
          85,
          -120,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 85,
        y: -120,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 10,
      },

      // 12. THẺ MÓN RÁC 7 (Đợt 3): XƯƠNG CÁ (Hữu cơ)
      {
        isStage: false,
        name: 'Xương Cá (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cXuongCa],
        costumes: [cXuongCa],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'xuongca',
          3,
          -80,
          -115,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: -80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 11,
      },

      // 13. THẺ MÓN RÁC 8 (Đợt 3): VỎ HỘP GIẤY (Tái chế)
      {
        isStage: false,
        name: 'Vỏ Hộp Giấy (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cHopGiay],
        costumes: [cHopGiay],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'hopgiay',
          3,
          0,
          -125,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 0,
        y: -125,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 12,
      },

      // 14. THẺ MÓN RÁC 9 (Đợt 3): GIẤY CŨ (Tái chế)
      {
        isStage: false,
        name: 'Giấy Cũ (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cGiayCu],
        costumes: [cGiayCu],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'giaycu',
          3,
          80,
          -115,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 13,
      },

      // 15. THẺ MÓN RÁC 10 (Đợt 4): ĐÙI GÀ (Hữu cơ)
      {
        isStage: false,
        name: 'Đùi Gà (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cDuiGa],
        costumes: [cDuiGa],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'duiga',
          4,
          -75,
          -120,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: -75,
        y: -120,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 14,
      },

      // 16. THẺ MÓN RÁC 11 (Đợt 4): VỎ CHAI THỦY TINH (Tái chế)
      {
        isStage: false,
        name: 'Vỏ Chai Thủy Tinh (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cChaiThuyTinh],
        costumes: [cChaiThuyTinh],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'chaithuytinh',
          4,
          5,
          -110,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 5,
        y: -110,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 15,
      },

      // 17. THẺ MÓN RÁC 12 (Đợt 4): ỐNG HÚT NHỰA (Tái chế)
      {
        isStage: false,
        name: 'Ống Hút Nhựa (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cOngNhua],
        costumes: [cOngNhua],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'ongnhua',
          4,
          85,
          -120,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 85,
        y: -120,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 16,
      },

      // 18. THẺ MÓN RÁC 13 (Đợt 5): VỎ DƯA HẤU (Hữu cơ)
      {
        isStage: false,
        name: 'Vỏ Dưa Hấu (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cDuaHau],
        costumes: [cDuaHau],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'duahau',
          5,
          -80,
          -115,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: -80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 17,
      },

      // 19. THẺ MÓN RÁC 14 (Đợt 5): LÁ CÂY (Hữu cơ)
      {
        isStage: false,
        name: 'Lá Cây (Hữu Cơ)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cLaCay],
        costumes: [cLaCay],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'lacay',
          5,
          0,
          -125,
          'HuuCo',
          'Thùng Rác Xanh (Hữu Cơ)',
          'Thùng Rác Cam (Tái Chế)'
        ),
        comments: {},
        x: 0,
        y: -125,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 18,
      },

      // 20. THẺ MÓN RÁC 15 (Đợt 5): VỎ KẸO NILON (Tái chế)
      {
        isStage: false,
        name: 'Vỏ Kẹo Nilon (Tái Chế)',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cVoKeo],
        costumes: [cVoKeo],
        currentCostume: 0,
        sounds: [sndPop],
        blocks: buildTrashSpriteBlocks(
          'vokeo',
          5,
          80,
          -115,
          'TaiChe',
          'Thùng Rác Cam (Tái Chế)',
          'Thùng Rác Xanh (Hữu Cơ)'
        ),
        comments: {},
        x: 80,
        y: -115,
        size: 75,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: false,
        layerOrder: 19,
      },

      // 21. NGÔI SAO ĐIỂM (Hoạt họa nhấp nháy & hiệu ứng chiến thắng)
      {
        isStage: false,
        name: 'Ngôi Sao Điểm',
        variables: {},
        lists: {},
        broadcasts: {},
        customs: [cSao],
        costumes: [cSao],
        currentCostume: 0,
        sounds: allGameSounds,
        blocks: {
          b_star_flag: {
            opcode: 'event_whenflagclicked',
            next: 'b_star_size',
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 40,
            y: 40,
          },
          b_star_size: {
            opcode: 'looks_setsizeto',
            next: 'b_star_pos',
            parent: 'b_star_flag',
            inputs: {
              SIZE: [1, [4, '35']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_pos: {
            opcode: 'motion_gotoxy',
            next: 'b_star_show',
            parent: 'b_star_size',
            inputs: {
              X: [1, [4, '-185']],
              Y: [1, [4, '155']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_show: {
            opcode: 'looks_show',
            next: null,
            parent: 'b_star_pos',
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_on_dung: {
            opcode: 'event_whenbroadcastreceived',
            next: 'b_star_pulse1',
            parent: null,
            inputs: {},
            fields: {
              BROADCAST_OPTION: ['DungRoi', 'bc_correct'],
            },
            shadow: false,
            topLevel: true,
            x: 40,
            y: 200,
          },
          b_star_pulse1: {
            opcode: 'looks_changesizeby',
            next: 'b_star_wait',
            parent: 'b_star_on_dung',
            inputs: {
              CHANGE: [1, [4, '15']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_wait: {
            opcode: 'control_wait',
            next: 'b_star_pulse2',
            parent: 'b_star_pulse1',
            inputs: {
              DURATION: [1, [4, '0.2']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_pulse2: {
            opcode: 'looks_changesizeby',
            next: null,
            parent: 'b_star_wait',
            inputs: {
              CHANGE: [1, [4, '-15']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_on_win: {
            opcode: 'event_whenbroadcastreceived',
            next: 'b_star_win_pos',
            parent: null,
            inputs: {},
            fields: {
              BROADCAST_OPTION: ['ChienThang', 'bc_win'],
            },
            shadow: false,
            topLevel: true,
            x: 40,
            y: 380,
          },
          b_star_win_pos: {
            opcode: 'motion_gotoxy',
            next: 'b_star_win_size',
            parent: 'b_star_on_win',
            inputs: {
              X: [1, [4, '0']],
              Y: [1, [4, '65']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_win_size: {
            opcode: 'looks_setsizeto',
            next: 'b_star_win_loop',
            parent: 'b_star_win_pos',
            inputs: {
              SIZE: [1, [4, '85']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_win_loop: {
            opcode: 'control_forever',
            next: null,
            parent: 'b_star_win_size',
            inputs: {
              SUBSTACK: [2, 'b_star_turn'],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_turn: {
            opcode: 'motion_turnright',
            next: 'b_star_turn_wait',
            parent: 'b_star_win_loop',
            inputs: {
              DEGREES: [1, [4, '15']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          b_star_turn_wait: {
            opcode: 'control_wait',
            next: null,
            parent: 'b_star_turn',
            inputs: {
              DURATION: [1, [4, '0.05']],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        },
        comments: {},
        x: -185,
        y: 155,
        size: 35,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around',
        visible: true,
        layerOrder: 11,
      },
    ],
    monitors: [
      {
        id: 'var_star',
        mode: 'default',
        opcode: 'data_variable',
        params: {
          VARIABLE: 'Diem_Sao ⭐',
        },
        spriteName: null,
        value: 0,
        width: 0,
        height: 0,
        x: 10,
        y: 10,
        visible: true,
        sliderMin: 0,
        sliderMax: 10,
        isDiscrete: true,
      },
    ],
    extensions: [],
    meta: {
      semver: '3.0.0',
      vm: '0.2.0',
      agent: 'Scratch 3.0 Web - Robot Kiến Sáng Phân Loại Rác Lớp 1',
    },
  };

  zip.file('project.json', JSON.stringify(projectJson, null, 2));

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/x.scratch.sb3',
    compression: 'DEFLATE',
  });
}
