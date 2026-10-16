import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const GREEN_BIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="600" viewBox="0 0 512 600">
  <defs>
    <linearGradient id="gBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="28%" stop-color="#22C55E" />
      <stop offset="85%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>

    <linearGradient id="gLid" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="35%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>

    <linearGradient id="gRim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#86EFAC" />
      <stop offset="35%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#14532D" />
    </linearGradient>

    <radialGradient id="gWheel" cx="38%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </radialGradient>
  </defs>

  <!-- BANH XE GOC PHAI DUOI -->
  <g transform="translate(430, 485)">
    <!-- Lop ngoai den -->
    <ellipse cx="0" cy="0" rx="38" ry="48" fill="#0F172A" stroke="#000000" stroke-width="8" />
    <ellipse cx="0" cy="0" rx="28" ry="36" fill="url(#gWheel)" stroke="#1E293B" stroke-width="4" />
    <!-- Truc giua -->
    <ellipse cx="0" cy="0" rx="12" ry="16" fill="#64748B" stroke="#0F172A" stroke-width="4" />
    <ellipse cx="0" cy="0" rx="5" ry="7" fill="#0F172A" />
  </g>

  <!-- THAN THUNG XANH -->
  <path
    d="M 60 180 
       L 95 525 
       Q 100 560 135 560 
       L 395 560 
       Q 430 560 435 525 
       L 470 180 
       Z"
    fill="url(#gBody)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />

  <!-- Ranh go goc 3D ben phai -->
  <path d="M 430 184 L 398 525" stroke="#15803D" stroke-width="8" stroke-linecap="round" />
  <path d="M 430 184 L 398 525" stroke="#0F172A" stroke-width="5" stroke-opacity="0.35" />

  <!-- Highlight vien sang ben trai -->
  <path d="M 78 190 L 108 520" stroke="#86EFAC" stroke-width="8" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- KHUNG BANG CHIM PHIA TREN -->
  <rect
    x="90"
    y="225"
    width="310"
    height="105"
    rx="16"
    fill="#16A34A"
    stroke="#14532D"
    stroke-width="8"
  />
  <rect
    x="94"
    y="229"
    width="302"
    height="97"
    rx="12"
    fill="none"
    stroke="#0F172A"
    stroke-width="5"
    stroke-opacity="0.25"
  />

  <!-- BIEU TUONG CHIEC LA TRANG O GIUA BANG -->
  <g transform="translate(245, 276) rotate(-35) scale(2.4)">
    <path
      d="M 0 -18 
         Q 14 -12 14 6 
         Q 14 18 0 20 
         Q -14 18 -14 6 
         Q -14 -12 0 -18 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      stroke-width="2.5"
    />
    <path d="M 0 16 L -2 23" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 0 -14 L 0 16" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <!-- HINH DAN 1: LOI QUA TAO DO CAN DO (BEN TRAI) -->
  <g transform="translate(160, 435) rotate(-10) scale(2.5)">
    <!-- Nua tren vo tao do -->
    <path
      d="M -16 -12 
         C -16 -24 -2 -24 0 -16 
         C 2 -24 16 -24 16 -12 
         C 10 -8 6 -2 0 -2 
         C -6 -2 -10 -8 -16 -12 Z"
      fill="#EF4444"
      stroke="#0F172A"
      stroke-width="3"
    />
    <!-- Thit tao can do mau vang kem -->
    <path
      d="M -16 -12 
         C -6 -2 -6 2 -16 12 
         L 16 12 
         C 6 2 6 -2 16 -12 
         Z"
      fill="#FEF08A"
      stroke="#0F172A"
      stroke-width="3"
    />
    <!-- Nua duoi vo tao do -->
    <path
      d="M -16 12 
         C -16 24 16 24 16 12 
         Z"
      fill="#EF4444"
      stroke="#0F172A"
      stroke-width="3"
    />
    <!-- Cuong tao nau -->
    <path d="M 0 -18 Q -4 -26 -1 -30" stroke="#78350F" stroke-width="3" stroke-linecap="round" fill="none" />
    <!-- Hat tao den -->
    <ellipse cx="-2" cy="0" rx="1.5" ry="3" fill="#451A03" />
    <ellipse cx="2" cy="3" rx="1.5" ry="3" fill="#451A03" />
  </g>

  <!-- HINH DAN 2: CHIEC LA XANH (BEN PHAI) -->
  <g transform="translate(300, 442) rotate(24) scale(2.6)">
    <path
      d="M 0 -24 
         C 18 -16 22 14 0 24 
         C -22 14 -18 -16 0 -24 Z"
      fill="#86EFAC"
      stroke="#0F172A"
      stroke-width="3.5"
    />
    <path d="M 0 22 L 2 30" stroke="#0F172A" stroke-width="3" stroke-linecap="round" />
    <path d="M 0 -20 L 0 22" stroke="#15803D" stroke-width="2.5" />
    <path d="M 0 -8 L 8 -13" stroke="#15803D" stroke-width="2" />
    <path d="M 0 2 L 9 -3" stroke="#15803D" stroke-width="2" />
    <path d="M 0 -2 L -8 -7" stroke="#15803D" stroke-width="2" />
    <path d="M 0 8 L -8 3" stroke="#15803D" stroke-width="2" />
  </g>

  <!-- VIEN GO NAP THUNG (THICK RIM) -->
  <path
    d="M 28 132 
       L 494 132 
       Q 504 132 504 144 
       L 496 190 
       Q 496 200 480 200 
       L 44 200 
       Q 28 200 28 190 
       L 20 144 
       Q 20 132 28 132 Z"
    fill="url(#gRim)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />
  <line x1="44" y1="148" x2="480" y2="148" stroke="#86EFAC" stroke-width="7" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- NAP VAT HINH THANG (HOOD TOP) -->
  <path
    d="M 70 132 
       L 132 28 
       Q 138 16 156 16 
       L 374 16 
       Q 390 16 398 28 
       L 460 132 
       Z"
    fill="url(#gLid)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />
  <path d="M 136 32 L 80 124" stroke="#86EFAC" stroke-width="8" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- CUA BO RAC TRON HOM VAO TRONG -->
  <path
    d="M 154 50 
       L 366 50 
       Q 378 50 374 62 
       L 352 110 
       Q 348 118 336 118 
       L 138 118 
       Q 126 118 130 106 
       L 142 62 
       Q 146 50 154 50 Z"
    fill="#064E3B"
    stroke="#0F172A"
    stroke-width="10"
    stroke-linejoin="round"
  />
  <path
    d="M 158 54 L 362 54 L 344 94 L 148 94 Z"
    fill="#022C22"
  />
</svg>`;

const ORANGE_BIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="600" viewBox="0 0 512 600">
  <defs>
    <linearGradient id="oBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FDBA74" />
      <stop offset="28%" stop-color="#FB923C" />
      <stop offset="85%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>

    <linearGradient id="oLid" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FED7AA" />
      <stop offset="35%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>

    <linearGradient id="oRim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FED7AA" />
      <stop offset="35%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#9A3412" />
    </linearGradient>

    <radialGradient id="oWheel" cx="38%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </radialGradient>
  </defs>

  <!-- BANH XE GOC PHAI DUOI -->
  <g transform="translate(430, 485)">
    <ellipse cx="0" cy="0" rx="38" ry="48" fill="#0F172A" stroke="#000000" stroke-width="8" />
    <ellipse cx="0" cy="0" rx="28" ry="36" fill="url(#oWheel)" stroke="#1E293B" stroke-width="4" />
    <ellipse cx="0" cy="0" rx="12" ry="16" fill="#64748B" stroke="#0F172A" stroke-width="4" />
    <ellipse cx="0" cy="0" rx="5" ry="7" fill="#0F172A" />
  </g>

  <!-- THAN THUNG CAM -->
  <path
    d="M 60 180 
       L 95 525 
       Q 100 560 135 560 
       L 395 560 
       Q 430 560 435 525 
       L 470 180 
       Z"
    fill="url(#oBody)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />

  <path d="M 430 184 L 398 525" stroke="#C2410C" stroke-width="8" stroke-linecap="round" />
  <path d="M 430 184 L 398 525" stroke="#0F172A" stroke-width="5" stroke-opacity="0.35" />

  <path d="M 78 190 L 108 520" stroke="#FED7AA" stroke-width="8" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- KHUNG BANG CHIM PHIA TREN -->
  <rect
    x="90"
    y="225"
    width="310"
    height="105"
    rx="16"
    fill="#EA580C"
    stroke="#9A3412"
    stroke-width="8"
  />
  <rect
    x="94"
    y="229"
    width="302"
    height="97"
    rx="12"
    fill="none"
    stroke="#0F172A"
    stroke-width="5"
    stroke-opacity="0.25"
  />

  <!-- BIEU TUONG MOBIUS 3 MUI TEN TAI CHE TRANG -->
  <g transform="translate(245, 276) scale(2.0)">
    <path
      d="M -16 -18 L 8 -18 L 4 -26 L 18 -14 L 4 -2 L 8 -10 L -12 -10 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M 18 -4 L 8 18 L 1 14 L 4 28 L 18 26 L 12 21 L 24 1 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M 2 18 L -18 4 L -18 12 L -28 -2 L -14 -6 L -14 2 L 2 12 Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
  </g>

  <!-- HINH DAN 1: LON NUOC DO BEP (BEN TRAI) -->
  <g transform="translate(160, 435) rotate(-8) scale(2.4)">
    <ellipse cx="0" cy="-22" rx="14" ry="5" fill="#E2E8F0" stroke="#0F172A" stroke-width="3" />
    <ellipse cx="0" cy="-22" rx="7" ry="2.5" fill="#94A3B8" />
    <path
      d="M -14 -22 
         L -15 -8 
         Q -7 0 -13 8 
         L -12 22 
         Q 0 25 12 22 
         L 13 8 
         Q 7 0 15 -8 
         L 14 -22 
         Z"
      fill="#EF4444"
      stroke="#0F172A"
      stroke-width="3.5"
      stroke-linejoin="round"
    />
    <ellipse cx="0" cy="22" rx="12" ry="4" fill="#B91C1C" stroke="#0F172A" stroke-width="2.5" />
    <path d="M -8 -18 L -5 18" stroke="#FECACA" stroke-width="3" stroke-linecap="round" stroke-opacity="0.8" />
  </g>

  <!-- HINH DAN 2: CHAI NHUA XANH DUONG (BEN PHAI) -->
  <g transform="translate(295, 438) rotate(16) scale(2.45)">
    <rect x="-4" y="-28" width="8" height="6" rx="1.5" fill="#0284C7" stroke="#0F172A" stroke-width="2.5" />
    <path d="M -3 -22 L 3 -22 L 4 -16 L -4 -16 Z" fill="#BAE6FD" stroke="#0F172A" stroke-width="2" />
    <path
      d="M -9 -16 
         L 9 -16 
         L 10 24 
         Q 0 28 -10 24 
         Z"
      fill="#7DD3FC"
      stroke="#0F172A"
      stroke-width="3.5"
      stroke-linejoin="round"
    />
    <line x1="-8" y1="-4" x2="8" y2="-4" stroke="#0284C7" stroke-width="2.5" />
    <line x1="-8" y1="4" x2="8" y2="4" stroke="#0284C7" stroke-width="2.5" />
    <line x1="-8" y1="12" x2="8" y2="12" stroke="#0284C7" stroke-width="2.5" />
    <path d="M -5 -12 L -5 20" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.8" />
  </g>

  <!-- VIEN GO NAP THUNG -->
  <path
    d="M 28 132 
       L 494 132 
       Q 504 132 504 144 
       L 496 190 
       Q 496 200 480 200 
       L 44 200 
       Q 28 200 28 190 
       L 20 144 
       Q 20 132 28 132 Z"
    fill="url(#oRim)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />
  <line x1="44" y1="148" x2="480" y2="148" stroke="#FED7AA" stroke-width="7" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- NAP VAT HINH THANG -->
  <path
    d="M 70 132 
       L 132 28 
       Q 138 16 156 16 
       L 374 16 
       Q 390 16 398 28 
       L 460 132 
       Z"
    fill="url(#oLid)"
    stroke="#0F172A"
    stroke-width="12"
    stroke-linejoin="round"
  />
  <path d="M 136 32 L 80 124" stroke="#FED7AA" stroke-width="8" stroke-linecap="round" stroke-opacity="0.85" />

  <!-- CUA BO RAC -->
  <path
    d="M 154 50 
       L 366 50 
       Q 378 50 374 62 
       L 352 110 
       Q 348 118 336 118 
       L 138 118 
       Q 126 118 130 106 
       L 142 62 
       Q 146 50 154 50 Z"
    fill="#7C2D12"
    stroke="#0F172A"
    stroke-width="10"
    stroke-linejoin="round"
  />
  <path
    d="M 158 54 L 362 54 L 344 94 L 148 94 Z"
    fill="#431407"
  />
</svg>`;

async function main() {
  const imagesDir = path.resolve('public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Write SVGs
  fs.writeFileSync(path.join(imagesDir, 'thung_rac_xanh.svg'), GREEN_BIN_SVG);
  fs.writeFileSync(path.join(imagesDir, 'thung_rac_cam.svg'), ORANGE_BIN_SVG);

  // Render high-res transparent PNGs using sharp
  await sharp(Buffer.from(GREEN_BIN_SVG))
    .png()
    .toFile(path.join(imagesDir, 'thung_rac_xanh.png'));

  await sharp(Buffer.from(ORANGE_BIN_SVG))
    .png()
    .toFile(path.join(imagesDir, 'thung_rac_cam.png'));

  // Also write with Vietnamese exact filenames for convenience
  fs.copyFileSync(
    path.join(imagesDir, 'thung_rac_xanh.png'),
    path.join(imagesDir, 'Thung_Rac_Xanh_Huu_Co.png')
  );
  fs.copyFileSync(
    path.join(imagesDir, 'thung_rac_cam.png'),
    path.join(imagesDir, 'Thung_Rac_Cam_Tai_Che.png')
  );

  console.log('Successfully generated PNG & SVG images in public/images!');
}

main().catch(console.error);
