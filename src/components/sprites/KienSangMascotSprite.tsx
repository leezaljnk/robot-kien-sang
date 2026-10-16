import React from 'react';
import { KienSangMood } from '../../types';

interface KienSangMascotSpriteProps {
  mood?: KienSangMood;
  className?: string;
  isMoving?: boolean;
}

export const KienSangMascotSprite: React.FC<KienSangMascotSpriteProps> = ({
  mood = 'idle',
  className = 'w-36 h-48',
  isMoving = false,
}) => {
  return (
    <svg
      viewBox="0 0 160 210"
      className={`${className} drop-shadow-2xl overflow-visible transition-transform duration-300 select-none pointer-events-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow hiệu ứng cho đèn ăng-ten */}
        <filter id="ks_antenna_glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient kim loại bạc xanh cho vỏ robot Kiến Sáng */}
        <linearGradient id="ks_metal_head" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="35%" stopColor="#CBD5E1" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        <linearGradient id="ks_metal_abdomen" x1="0" y1="0.3" x2="1" y2="0.7">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="45%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="ks_shirt_orange" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="40%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="ks_collar_blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="ks_light_yellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* BÓNG ĐỔ DƯỚI CHÂN */}
      <ellipse cx="78" cy="202" rx="46" ry="7" fill="#0F172A" opacity="0.22" />

      {/* 1. BỤNG KIẾN (ABDOMEN) PHÍA SAU BÊN TRÁI */}
      <g>
        {/* Khối bụng lớn hình bầu dục nghiêng */}
        <path
          d="M 52 142 C 34 135 12 144 6 156 C 0 168 6 182 22 188 C 42 195 62 184 66 168 C 68 158 64 148 52 142 Z"
          fill="url(#ks_metal_abdomen)"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Vết cắt phân đốt bụng kiến */}
        <path
          d="M 18 147 C 14 158 18 174 28 185"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 34 140 C 30 155 36 172 48 181"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Vệt sáng bóng kim loại trên bụng */}
        <path
          d="M 12 158 C 16 152 28 148 38 150"
          stroke="#F8FAFC"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
      </g>

      {/* 2. CHÂN ROBOT SAU & KHỚP NỐI */}
      {/* Khớp háng cơ học */}
      <circle cx="56" cy="162" r="10" fill="#475569" stroke="#0F172A" strokeWidth="3" />
      <circle cx="56" cy="162" r="5" fill="#334155" />

      {/* Chân trái (phía sau) */}
      <g>
        <path
          d="M 52 166 L 44 182"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 52 166 L 44 182"
          stroke="#94A3B8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Đầu gối chân trái */}
        <circle cx="44" cy="182" r="7" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="44" cy="182" r="3.5" fill="#F97316" stroke="#0F172A" strokeWidth="1" />
        {/* Ống chân & Bàn chân trái */}
        <path
          d="M 44 184 L 38 198 L 52 201 L 56 195 Z"
          fill="#CBD5E1"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse cx="44" cy="200" rx="11" ry="4" fill="#64748B" stroke="#0F172A" strokeWidth="2.5" />
      </g>

      {/* Chân phải (phía trước, trụ chính) */}
      <g>
        <path
          d="M 76 165 L 84 178"
          stroke="#0F172A"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 76 165 L 84 178"
          stroke="#CBD5E1"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Khớp gối chân phải với viền đồng cam */}
        <circle cx="84" cy="178" r="8" fill="#475569" stroke="#0F172A" strokeWidth="3" />
        <circle cx="84" cy="178" r="4.5" fill="#FB923C" stroke="#0F172A" strokeWidth="1.5" />
        {/* Cẳng chân phải */}
        <path
          d="M 83 182 L 80 196"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 83 182 L 80 196"
          stroke="#94A3B8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Giày robot chân phải */}
        <path
          d="M 72 196 C 72 192 84 191 94 194 C 98 196 100 200 96 203 C 86 206 72 204 72 196 Z"
          fill="#CBD5E1"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 74 203 L 96 203"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="86" cy="198" r="3" fill="#FB923C" stroke="#0F172A" strokeWidth="1" />
      </g>

      {/* 3. THÂN & ÁO THUN CAM PHỐI XANH DƯƠNG (Chuẩn kien-sang-main.png) */}
      <g>
        {/* Bụng dưới robot kim loại lộ ra */}
        <path
          d="M 52 152 C 58 165 78 166 86 156 C 88 152 86 148 84 146"
          fill="#94A3B8"
          stroke="#0F172A"
          strokeWidth="3"
        />

        {/* Thân áo thun cam */}
        <path
          d="M 46 112 C 40 125 40 144 48 154 C 54 160 88 162 96 152 C 98 140 98 126 94 114 Z"
          fill="url(#ks_shirt_orange)"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Nếp gấp vải và viền áo cam */}
        <path
          d="M 48 151 C 60 156 84 156 94 149"
          stroke="#EA580C"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M 49 153 C 60 158 84 158 94 151"
          stroke="#0F172A"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Cổ áo polo màu xanh dương */}
        <path
          d="M 52 104 L 64 118 L 74 118 L 84 104 Z"
          fill="url(#ks_collar_blue)"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon points="56,104 68,118 64,118" fill="#1E40AF" />
        <polygon points="80,104 68,118 72,118" fill="#60A5FA" />

        {/* Tay áo thun màu xanh dương bên phải */}
        <path
          d="M 88 110 C 96 112 105 116 109 126 C 104 130 96 132 90 128 Z"
          fill="url(#ks_collar_blue)"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse cx="98" cy="128" rx="7" ry="2.5" fill="#1E40AF" />

        {/* Tay áo thun màu xanh dương bên trái */}
        <path
          d="M 52 108 C 46 112 43 118 42 126 C 47 130 54 130 58 124 Z"
          fill="url(#ks_collar_blue)"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Logo nhỏ trắng trên ngực áo */}
        <rect x="80" y="124" width="10" height="5" rx="2" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* 4. TAY ROBOT TRÁI (Để trước ngực như hình kien-sang-main.png) */}
      <g>
        {/* Cánh tay trái kim loại */}
        <path
          d="M 50 124 Q 60 134 68 130"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 50 124 Q 60 134 68 130"
          stroke="#CBD5E1"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Khớp cổ tay kim loại viền cam */}
        <circle cx="68" cy="130" r="5" fill="#475569" stroke="#0F172A" strokeWidth="2" />
        <circle cx="68" cy="130" r="2.5" fill="#F97316" />
        {/* Bàn tay trái khum lại trước ngực */}
        <circle cx="76" cy="126" r="7" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
        <path d="M 72 122 C 75 120 79 122 81 126" stroke="#0F172A" strokeWidth="2" fill="none" />
      </g>

      {/* 5. TAY ROBOT PHẢI (Giơ lên cao vẫy ngón V PEACE / CHÀO - Biểu tượng thương hiệu Kiến Sáng) */}
      <g>
        {/* Bắp tay kim loại */}
        <path
          d="M 102 126 L 114 114"
          stroke="#0F172A"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 102 126 L 114 114"
          stroke="#CBD5E1"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Khớp khuỷu tay tròn viền cam */}
        <circle cx="114" cy="114" r="6" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="114" cy="114" r="3" fill="#F97316" />
        {/* Cẳng tay hướng lên cao */}
        <path
          d="M 114 114 L 126 94"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 114 114 L 126 94"
          stroke="#94A3B8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Khớp cổ tay */}
        <circle cx="126" cy="94" r="5.5" fill="#475569" stroke="#0F172A" strokeWidth="2" />

        {/* BÀN TAY V GIƠ 2 NGÓN (PEACE SIGN) NHƯ HÌNH kien-sang-main.png */}
        <g transform="translate(126, 92)">
          {/* Lòng bàn tay */}
          <circle cx="3" cy="-3" r="7" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
          {/* Ngón trỏ chỉ lên */}
          <path
            d="M 4 -8 L 8 -24 C 9 -27 15 -25 14 -21 L 9 -7 Z"
            fill="#CBD5E1"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Ngón giữa mở chữ V */}
          <path
            d="M 7 -6 L 19 -18 C 22 -20 25 -16 22 -12 L 10 -4 Z"
            fill="#CBD5E1"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Ngón cái gập vào */}
          <circle cx="-1" cy="-3" r="3.5" fill="#94A3B8" stroke="#0F172A" strokeWidth="2" />
        </g>
      </g>

      {/* 6. ĐẦU ROBOT KIẾN SÁNG TRÒN LỚN KIM LOẠI */}
      <g>
        {/* Cổ robot kim loại */}
        <rect x="58" y="96" width="20" height="12" rx="4" fill="#64748B" stroke="#0F172A" strokeWidth="3" />

        {/* Đầu robot Kiến Sáng bầu tròn siêu đáng yêu */}
        <path
          d="M 38 72 C 30 50 44 26 72 24 C 98 22 118 42 116 68 C 114 86 96 102 74 102 C 48 102 38 88 38 72 Z"
          fill="url(#ks_metal_head)"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Mảng highlight bóng kim loại trên đỉnh đầu */}
        <path
          d="M 52 38 C 64 30 84 30 96 38"
          stroke="#F8FAFC"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.65"
          fill="none"
        />

        {/* KHUÔN MẶT BIỂU CẢM THEO MOOD */}
        {mood === 'sad' ? (
          // Biểu cảm buồn (khi phân loại nhầm)
          <g>
            {/* Lông mày xệ buồn */}
            <path d="M 56 46 Q 64 50 68 47" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 82 47 Q 86 50 94 46" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Mắt buồn long lanh có nước mắt */}
            <circle cx="62" cy="58" r="7" fill="#1E293B" />
            <circle cx="64" cy="56" r="2.5" fill="#FFFFFF" />
            <circle cx="86" cy="58" r="7" fill="#1E293B" />
            <circle cx="88" cy="56" r="2.5" fill="#FFFFFF" />
            {/* Giọt nước mắt nhỏ */}
            <path d="M 54 66 C 52 72 56 74 58 72 C 60 70 56 66 54 66 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            {/* Má hồng nhạt */}
            <ellipse cx="54" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
            <ellipse cx="94" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
            {/* Miệng mếu buồn nhưng đáng yêu */}
            <path d="M 64 80 Q 74 72 84 80" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        ) : mood === 'idle' ? (
          // Biểu cảm bình thường (Mắt to tròn cười mỉm thân thiện)
          <g>
            {/* Lông mày cong tươi vui */}
            <path d="M 56 46 Q 64 42 68 47" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 82 47 Q 86 42 94 46" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Hai mắt to tròn long lanh */}
            <ellipse cx="64" cy="58" rx="8" ry="9" fill="#0F172A" />
            <circle cx="66" cy="55" r="3.5" fill="#FFFFFF" />
            <circle cx="62" cy="62" r="1.5" fill="#FFFFFF" />
            <ellipse cx="88" cy="58" rx="8" ry="9" fill="#0F172A" />
            <circle cx="90" cy="55" r="3.5" fill="#FFFFFF" />
            <circle cx="86" cy="62" r="1.5" fill="#FFFFFF" />
            {/* Má hồng đào */}
            <ellipse cx="54" cy="67" rx="6" ry="4" fill="#FDA4AF" />
            <ellipse cx="98" cy="67" rx="6" ry="4" fill="#FDA4AF" />
            {/* Miệng cười tươi */}
            <path
              d="M 66 73 Q 76 84 86 73"
              stroke="#0F172A"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : (
          // Biểu cảm vui mừng / Chiến thắng (CHUẨN 100% NHƯ HÌNH kien-sang-main.png: MẮT HÍP ^ ^, CƯỜI TOÉT RẠNG RỠ)
          <g>
            {/* Lông mày nhướng cao vui sướng */}
            <path d="M 54 44 Q 63 38 68 45" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 82 45 Q 87 38 96 44" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* MẮT HÍP HÌNH VÒM CUNG CƯỜI ĐẶC TRƯNG CỦA kien-sang-main.png */}
            <path
              d="M 54 59 C 57 48 70 48 74 59"
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 82 59 C 85 48 98 48 101 59"
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />

            {/* MÁ HỒNG TRÒN XINH XẮN */}
            <ellipse cx="52" cy="68" rx="7" ry="4.5" fill="#FDA4AF" />
            <ellipse cx="102" cy="68" rx="7" ry="4.5" fill="#FDA4AF" />

            {/* MIỆNG CƯỜI HÁ TO TOE TOÉT THẤY HÀM RĂNG VÀ LƯỠI HỒNG */}
            <path
              d="M 62 70 C 62 70 76 72 90 68 C 92 84 82 92 74 92 C 66 92 60 84 62 70 Z"
              fill="#991B1B"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Răng trên trắng muốt */}
            <path
              d="M 64 71 C 72 73 82 73 89 69 C 88 74 85 75 76 75 C 68 75 65 74 64 71 Z"
              fill="#FFFFFF"
            />
            {/* Lưỡi hồng rực rỡ */}
            <path
              d="M 68 83 C 71 78 80 78 84 82 C 81 89 74 90 68 83 Z"
              fill="#F43F5E"
            />
          </g>
        )}
      </g>

      {/* 7. HAI ĂNG-TEN PHÁT SÁNG TRÊN ĐẦU (Đặc trưng cốt lõi của Robot Kiến Sáng) */}
      <g>
        {/* Ăng-ten trái */}
        <path
          d="M 62 26 L 56 12 L 66 4"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 62 26 L 56 12 L 66 4"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Đèn vàng phát sáng ăng-ten trái */}
        <g filter="url(#ks_antenna_glow)">
          <rect
            x="64"
            y="2"
            width="14"
            height="7"
            rx="3.5"
            transform="rotate(-25 71 5)"
            fill="url(#ks_light_yellow)"
            stroke="#EA580C"
            strokeWidth="1.5"
          />
          <ellipse cx="70" cy="5" rx="5" ry="2" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Ăng-ten phải */}
        <path
          d="M 88 24 L 98 10 L 108 14"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 88 24 L 98 10 L 108 14"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Đèn vàng phát sáng ăng-ten phải */}
        <g filter="url(#ks_antenna_glow)">
          <rect
            x="104"
            y="9"
            width="14"
            height="7"
            rx="3.5"
            transform="rotate(25 111 12)"
            fill="url(#ks_light_yellow)"
            stroke="#EA580C"
            strokeWidth="1.5"
          />
          <ellipse cx="111" cy="12" rx="5" ry="2" fill="#FFFFFF" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
};
