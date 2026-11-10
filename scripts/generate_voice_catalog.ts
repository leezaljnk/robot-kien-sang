import { writeFileSync } from 'node:fs';
import {
  REUSED_SORTING_NAME_PIECES,
  VOICE_CLASSROOM_NAME_PIECES,
  VOICE_PIECE_PROMPTS,
  VOICE_PROMPTS,
  VOICE_SEQUENCES,
  VOICE_SHARED_PIECES,
  VOICE_SORTING_NAME_PIECES,
  VOICE_YARD_NAME_PIECES,
} from '../src/data/voicePrompts';

const voicePieceCount = VOICE_PIECE_PROMPTS.length;
const fullSentenceCount = VOICE_PROMPTS.length - voicePieceCount;

const groups = [
  { title: 'Câu chung cho lớp học / sân trường', matches: (id: string) => !/^(garden_|sorting_|hand_pickup_|voice_piece_)/.test(id) },
  { title: 'Khu vườn — bản ghi câu đầy đủ', matches: (id: string) => id.startsWith('garden_') },
  { title: 'Thử tài phân loại — câu đầy đủ thông thường', matches: (id: string) => id.startsWith('sorting_') },
  { title: 'Tự tay nhặt rác', matches: (id: string) => id.startsWith('hand_pickup_') },
];

const introduction = `# Danh sách ID và lời thoại cho các màn chơi

Có **${VOICE_PROMPTS.length} ID bản thu**, gồm ${fullSentenceCount} câu đầy đủ và ${voicePieceCount} đoạn. Nguồn chuẩn: [voicePrompts.ts](../src/data/voicePrompts.ts).
Tạo lại danh sách bằng \`node --import tsx scripts/generate_voice_catalog.ts\`.

- Mỗi lệnh gọi \`triggerSpeech(text, voiceId)\` truyền ID tường minh; không dò ID theo nội dung khi phát hoặc nghe lại.
- Đặt bản thu tại \`public/voice/<ID>.mp3\`, hoặc upload vào \`voice/<ID>\` trong editor. Phòng thu, JSON và HTML offline dùng chung danh mục này.
- Thiếu bản thu hoặc phát lỗi: dùng giọng đọc trình duyệt. Trình duyệt vẫn có thể chặn autoplay khi chưa có tương tác.
- Chạy lại [supabase/setup.sql](../supabase/setup.sql) để cho phép các ID mới trên hệ thống đã triển khai.
- Phải thu lại \`victory.mp3\` theo mốc **20 sao** và các câu đã đổi nội dung (đặc biệt \`batch_complete.mp3\`, \`approach_bin.mp3\`, \`approach_trash.mp3\`); file cũ không tự đổi tiếng nói.
- Ba câu khen đúng dùng ba ID riêng để bản thu khớp văn bản; không dùng chung \`correct.mp3\` cho câu khác nữa.
- Khu vườn đọc kết quả cố định bằng \`garden_victory\`; số điểm biến thiên vẫn hiển thị riêng trên màn hình, không nằm trong bản thu.
- Thu lại \`hand_pickup_victory.mp3\` nếu đã có bản cũ: câu mới nói "tất cả món rác" để phù hợp với số món tùy nhập.
- Thử tài phân loại đọc câu hỏi ghép ba đoạn “Từ → tên món → bé có thể tạo ra gì?” khi bắt đầu mỗi lượt. Chọn món hoặc nối ý tưởng không phát câu thoại; nối ý tưởng phát hiệu ứng “ting ting”. Các phản hồi khác và lời chúc hoàn thành vẫn dùng ID riêng.
- Với câu hỏi ghép của Thử tài phân loại, đoạn giữa dùng file \`public/voice/sorting_question_<wasteId>.mp3\`; ghép lần lượt với \`voice_piece_sorting_question_prefix.mp3\` và \`voice_piece_sorting_question_suffix.mp3\`. Bản thu tùy chỉnh của đoạn đã upload vẫn được ưu tiên.
- \`continue_sorting\` và \`play_area_small\` là trạng thái lời nhắc thụ động ở màn chính: có ID lưu cùng lời thoại nhưng không tự phát. Bong bóng và nút nghe lại của robot màn chính hiện đang ẩn; callback nghe lại đã giữ ID tường minh, không thay đổi bố cục để bật lại nút. \`selected_unknown\` / \`picked_unknown\` là dự phòng khi thiếu định nghĩa món rác.
- Danh mục là **lời nói/hướng dẫn/phản hồi**, không phải mọi nhãn nút, tên vật phẩm, văn bản mô tả ảnh, thẻ gợi ý tái sử dụng hoặc hiệu ứng âm thanh.
- ${Object.keys(VOICE_SEQUENCES).length} ID câu đầy đủ dùng sequence, không phải ID bản thu và không cần thu/upload. Ứng dụng ghép ba đoạn theo thứ tự; nếu thiếu hoặc tải/giải mã lỗi một đoạn, đoạn đó được đọc bằng TTS và các đoạn ghi âm khác vẫn phát bình thường.
- Sáu câu Khu vườn không thuộc kế hoạch ghép, tiếp tục dùng bản ghi câu đầy đủ như hiện nay. Thử tài phân loại có ${Object.keys(VOICE_SEQUENCES).filter(id => id.startsWith('sorting_question_')).length} câu hỏi ghép ba đoạn mỗi lượt; chọn món và nối ý tưởng không phát câu thoại.

`;

const pieceRows = (pieces: { id: string; text: string }[]) =>
  pieces.map(piece => `| \`${piece.id}\` | \`${piece.id}.mp3\` | ${piece.text} |`).join('\n');

const sequentialVoiceSection = `## Đoạn ghi âm ghép tuần tự (${voicePieceCount} ID)

Ứng dụng phát ba đoạn theo thứ tự **câu mở đầu → tên món → câu kết thúc**. Chỉ thu phần chữ trong cột lời thoại; không đọc dấu ngoặc kép quanh tên món. Các đoạn được phát nối tiếp, không phát chồng tiếng.

### Câu mở đầu và kết thúc dùng chung (${VOICE_SHARED_PIECES.length} ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
${pieceRows(VOICE_SHARED_PIECES)}

### Tên món rác lớp học (${VOICE_CLASSROOM_NAME_PIECES.length} ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
${pieceRows(VOICE_CLASSROOM_NAME_PIECES)}

### Tên món rác sân trường (${VOICE_YARD_NAME_PIECES.length} ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
${pieceRows(VOICE_YARD_NAME_PIECES)}

### Tên món trong Thử tài phân loại (${VOICE_SORTING_NAME_PIECES.length} ID mới)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
${pieceRows(VOICE_SORTING_NAME_PIECES)}
${REUSED_SORTING_NAME_PIECES.map(({ waste, piece }) => `\nTên “${waste.name}” trong câu hỏi của lượt \`${waste.id}\` trùng chính xác, dùng chung \`${piece.id}.mp3\`.`).join('\n')}

### Ánh xạ các ID câu hiện tại sang đoạn

- \`selected_<itemId>\`: \`voice_piece_selected_prefix.mp3\` → \`voice_piece_name_<itemId>.mp3\` → \`voice_piece_selected_suffix.mp3\`.
- \`picked_<itemId>\`: \`voice_piece_picked_prefix.mp3\` → \`voice_piece_name_<itemId>.mp3\` → \`voice_piece_picked_suffix.mp3\`.
- Với sân trường, \`selected_yard_<yardItemId>\` và \`picked_yard_<yardItemId>\` dùng chung các đoạn đầu/cuối tương ứng và \`voice_piece_name_yard_<yardItemId>.mp3\`.
- \`sorting_question_<wasteId>\`: \`voice_piece_sorting_question_prefix.mp3\` → file tên món tương ứng trong bảng trên → \`voice_piece_sorting_question_suffix.mp3\`.
- Ví dụ: \`selected_vo_dua_hau\` dùng \`voice_piece_selected_prefix.mp3\` → \`voice_piece_name_vo_dua_hau.mp3\` → \`voice_piece_selected_suffix.mp3\`.
- Ví dụ sân trường: \`picked_yard_flower_petals\` dùng \`voice_piece_picked_prefix.mp3\` → \`voice_piece_name_yard_flower_petals.mp3\` → \`voice_piece_picked_suffix.mp3\`.

Tổng cộng cần thu **${voicePieceCount} file đoạn**. Các khóa logic \`selected_*\`, \`picked_*\` và \`sorting_question_*\` không phải ID bản thu; mỗi khóa ánh xạ sang đúng ba đoạn.

`;

const sections = groups.map(group => {
  const prompts = VOICE_PROMPTS.filter(prompt => group.matches(prompt.id));
  if (!prompts.length) return '';
  const rows = prompts.map(prompt => `| \`${prompt.id}\` | \`${prompt.id}.mp3\` | ${prompt.text} |`).join('\n');
  return `## ${group.title} (${prompts.length} ID)\n\n| ID | Tên file | Lời thoại cần thu |\n|---|---|---|\n${rows}\n`;
}).filter(Boolean);

const sortedVoiceSection = `## Câu hỏi mỗi lượt trong Thử tài phân loại — ghép tuần tự (${Object.keys(VOICE_SEQUENCES).filter(id => id.startsWith('sorting_question_')).length} ID logic)\n\nCác ID logic sau không có file ghi âm riêng; mỗi câu dùng ba đoạn trong mục trên theo thứ tự đã mô tả.\n\n` +
  Object.keys(VOICE_SEQUENCES).filter(id => id.startsWith('sorting_question_')).map(id => `- \`${id}\``).join('\n') + '\n\n';

writeFileSync(new URL('../docs/voice-prompts.md', import.meta.url), introduction + sequentialVoiceSection + sortedVoiceSection + sections.join('\n'));
console.log(`Đã ghi ${fullSentenceCount} ID câu đầy đủ, ${voicePieceCount} ID đoạn và các khóa sequence vào docs/voice-prompts.md`);
