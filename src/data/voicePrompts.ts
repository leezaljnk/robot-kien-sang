import { TRASH_ITEMS } from './trashItems';
import { YARD_TRASH_ITEMS } from './yardTrashItems';
import { SORTING_GAME_WASTES } from './sortingGame';
import type { VoiceClips } from '../types';

export type TriggerSpeech = (text: string, voiceId: string) => void;

type VoicePrompt = { id: string; text: string };

export const VOICE_SHARED_PIECES: VoicePrompt[] = [
  { id: 'voice_piece_selected_prefix', text: 'Bé đã chọn' },
  { id: 'voice_piece_selected_suffix', text: 'Hãy bấm vào thùng rác muốn bỏ nhé!' },
  { id: 'voice_piece_picked_prefix', text: 'Kiến Sáng đã nhặt' },
  { id: 'voice_piece_picked_suffix', text: 'Hãy đưa tới thùng rác thích hợp nhé!' },
  { id: 'voice_piece_sorting_question_prefix', text: 'Từ' },
  { id: 'voice_piece_sorting_question_suffix', text: 'bé có thể tạo ra gì?' },
];

const namePiecesByText = new Map<string, VoicePrompt>();
const getNamePiece = (id: string, text: string, prefix = 'voice_piece_name_') => {
  const existing = namePiecesByText.get(text);
  if (existing) return existing;
  const piece = { id: `${prefix}${id}`, text };
  namePiecesByText.set(text, piece);
  return piece;
};

export const VOICE_CLASSROOM_NAME_PIECES = TRASH_ITEMS
  .map(item => getNamePiece(item.id, item.nameVi));
export const VOICE_YARD_NAME_PIECES = YARD_TRASH_ITEMS
  .map(item => getNamePiece(item.id, item.nameVi));
const trashNamePieces = [...VOICE_CLASSROOM_NAME_PIECES, ...VOICE_YARD_NAME_PIECES];
const sortingNamePieces = SORTING_GAME_WASTES.map(waste => ({
  waste,
  piece: getNamePiece(waste.id, waste.name, 'voice_piece_sorting_name_'),
}));
export const VOICE_SORTING_NAME_PIECES = sortingNamePieces
  .filter(({ piece }) => !trashNamePieces.includes(piece))
  .map(({ piece }) => piece);
export const REUSED_SORTING_NAME_PIECES = sortingNamePieces
  .filter(({ piece }) => trashNamePieces.includes(piece));

export const VOICE_PIECE_PROMPTS: VoicePrompt[] = [
  ...VOICE_SHARED_PIECES,
  ...VOICE_CLASSROOM_NAME_PIECES,
  ...VOICE_YARD_NAME_PIECES,
  ...VOICE_SORTING_NAME_PIECES,
];

const itemVoiceSequences = [...TRASH_ITEMS, ...YARD_TRASH_ITEMS].flatMap(item => {
  const namePiece = getNamePiece(item.id, item.nameVi);
  return [
    [`selected_${item.id}`, [
      'voice_piece_selected_prefix', namePiece.id, 'voice_piece_selected_suffix',
    ]],
    [`picked_${item.id}`, [
      'voice_piece_picked_prefix', namePiece.id, 'voice_piece_picked_suffix',
    ]],
  ];
});

const sortingQuestionVoiceSequences = sortingNamePieces.map(({ waste, piece }) => [
  `sorting_question_${waste.id}`,
  ['voice_piece_sorting_question_prefix', piece.id, 'voice_piece_sorting_question_suffix'],
]);

export const VOICE_SEQUENCES: Record<string, string[]> = Object.fromEntries([
  ...itemVoiceSequences,
  ...sortingQuestionVoiceSequences,
]);

export const VOICE_PROMPTS = [
  { id: 'correct', text: 'Hoan hô! Đúng rồi bạn ơi!' },
  { id: 'incorrect', text: 'Ôi nhầm rồi, bạn thử lại nhé!' },
  { id: 'correct_great', text: 'Tuyệt vời quá! Bé giỏi lắm!' },
  { id: 'correct_thanks', text: 'Đúng rồi! Cảm ơn bé nhiều nhé!' },
  { id: 'victory', text: 'Yeah, 20 sao rồi, lớp mình sạch quá!' },
  { id: 'yard_welcome', text: 'Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch sân trường nhé!' },
  { id: 'yard_victory', text: 'Yeah, 20 sao rồi, sân trường sạch quá!' },
  { id: 'scene_busy', text: 'Kiến Sáng đang nhặt rác rồi. Hãy hoàn thành lượt này trước khi đổi cảnh nhé!' },
  { id: 'play_area_small', text: 'Vùng chơi quá nhỏ. Hãy phóng to cửa sổ hoặc giảm kích thước thùng rác rồi chơi lại nhé!' },
  { id: 'welcome', text: 'Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé!' },
  { id: 'continue_sorting', text: 'Bé tiếp tục phân loại rác nhé!' },
  { id: 'batch_complete', text: 'Hoan hô! Đã dọn sạch rác! Cùng tiếp tục nhé!' },
  { id: 'approach_bin', text: 'Kiến Sáng hãy đi lại gần Thùng Xanh (bên trái) hoặc Thùng Cam (bên phải) rồi nhấn Phím Cách nhé!' },
  { id: 'approach_trash', text: 'Hãy dùng phím mũi tên ⬅️ ➡️ đi lại gần món rác trên sàn rồi nhấn Phím Cách để nhặt nhé!' },
  { id: 'select_trash', text: 'Bé hãy bấm chọn một món rác trên sàn trước nhé!' },
  { id: 'bin_unavailable', text: 'Chưa xác định được vị trí thùng rác, bạn hãy chọn lại nhé!' },
  { id: 'mode_drag', text: 'Chế độ: Bé chạm và kéo rác vào thùng, hoặc nhấn giữ chuột để kéo nhé!' },
  { id: 'mode_command', text: 'Chế độ: Bé chạm chọn rác rồi chạm thùng để tớ chạy lại nhặt nhé!' },
  { id: 'mascot_updated', text: 'A! Đã nhận đúng ảnh kien-sang-main.png rồi! Cùng dọn lớp với bạn Kiến Sáng nhé!' },
  { id: 'selected_unknown', text: 'Bé đã chọn "món rác"! Hãy bấm vào thùng rác muốn bỏ nhé!' },
  { id: 'picked_unknown', text: 'Kiến Sáng đã nhặt "món rác"! Hãy đưa tới thùng rác thích hợp nhé!' },
  { id: 'garden_intro', text: 'Dùng phím mũi tên, các nút điều khiển hoặc kéo chuột/chạm để đón bánh kẹo, trái cây lấy điểm và né gạch, đá, cành cây nhé!' },
  { id: 'garden_free', text: 'Cùng Kiến Sáng đón món ngon nhé!' },
  { id: 'garden_challenge', text: 'Đón đủ 10 món ngon để nhận huy hiệu' },
  { id: 'garden_hazard', text: 'Ối! Cẩn thận nhé!' },
  { id: 'garden_game_over', text: 'Nghỉ một chút nhé! Lần sau mình nhớ né gạch, đá và cành cây nhé!' },
  { id: 'garden_victory', text: 'Tuyệt vời, bạn nhỏ! Bạn đã đón đủ món ngon. Tuyệt lắm!' },
  { id: 'sorting_intro', text: 'Mỗi lượt có một món đồ có thể tái sử dụng. Bé hãy tìm các ý tưởng phù hợp nhé.' },
  { id: 'sorting_start', text: 'Kéo từ món rác đến hình phù hợp, hoặc chạm vào hình để nối.' },
  { id: 'sorting_removed', text: 'Đã gỡ lựa chọn. Bé có thể nối hình khác rồi kiểm tra nhé!' },
  { id: 'sorting_select', text: 'Bé hãy nối một hay nhiều hình phù hợp trước nhé!' },
  { id: 'sorting_retry', text: 'Bé thử gỡ đường nối có dấu X rồi kiểm tra lại nhé!' },
  { id: 'sorting_round_complete', text: 'Chúc mừng bé!' },
  { id: 'sorting_more', text: 'Tốt lắm! Còn ý tưởng phù hợp nữa, bé tìm tiếp nhé!' },
  { id: 'sorting_continue', text: 'Bé hãy nối một hay nhiều hình rồi kiểm tra nhé!' },
  { id: 'sorting_safety', text: 'Một số ý tưởng cần người lớn hỗ trợ. Mình chỉ quan sát tranh và nhờ người lớn giúp nhé!' },
  { id: 'sorting_victory', text: 'Bé giỏi quá! Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé!' },
  { id: 'hand_pickup_intro', text: 'Đưa bàn tay mở đến món rác, nắm lại để nhặt rồi mở tay trên thùng nhé!' },
  { id: 'hand_pickup_retry_organic', text: 'Thử lại nhé! Món này thuộc nhóm Hữu cơ.' },
  { id: 'hand_pickup_retry_inorganic', text: 'Thử lại nhé! Món này thuộc nhóm Vô cơ.' },
  { id: 'hand_pickup_miss', text: 'Chưa tới thùng rồi, con thử lại nhé!' },
  { id: 'hand_pickup_hint', text: 'Đưa bàn tay mở tới món rác rồi nắm lại nhé!' },
  { id: 'hand_pickup_drop_organic', text: 'Mở tay ở thùng Hữu cơ nhé!' },
  { id: 'hand_pickup_drop_inorganic', text: 'Mở tay ở thùng Vô cơ nhé!' },
  { id: 'hand_pickup_victory', text: 'Tuyệt vời! Con đã dọn sạch tất cả món rác!' },
  ...VOICE_PIECE_PROMPTS,
];

export const VOICE_PROMPT_TEXTS: Record<string, string> = Object.fromEntries(
  VOICE_PROMPTS.map(prompt => [prompt.id, prompt.text])
);

export const VOICE_CLIP_IDS = new Set(VOICE_PROMPTS.map(prompt => prompt.id));

export function currentVoiceClips(clips?: Record<string, string | null>): VoiceClips {
  return {
    ...Object.fromEntries(
      Object.entries(clips || {}).filter(([id]) => VOICE_CLIP_IDS.has(id))
    ),
    correct: clips?.correct || null,
    incorrect: clips?.incorrect || null,
    victory: clips?.victory || null,
  };
}

export function voiceIdForText(text: string): string | undefined {
  return VOICE_PROMPTS.find(prompt => prompt.text === text)?.id;
}
