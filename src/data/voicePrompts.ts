import { TRASH_ITEMS } from './trashItems';

export const VOICE_PROMPTS = [
  { id: 'correct', text: 'Hoan hô! Đúng rồi bạn ơi!' },
  { id: 'incorrect', text: 'Ôi nhầm rồi, bạn thử lại nhé!' },
  { id: 'victory', text: 'Yeah, 10 sao rồi, lớp mình sạch quá!' },
  { id: 'welcome', text: 'Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé!' },
  { id: 'continue_sorting', text: 'Bé tiếp tục phân loại rác nhé!' },
  { id: 'batch_complete', text: 'Hoan hô! Đã dọn sạch 5 món rác! Cùng tiếp tục với 5 món rác mới nhé!' },
  { id: 'approach_bin', text: 'Kiến Sáng hãy đi lại gần Thùng Xanh (bên trái) hoặc Thùng Cam (bên phải) rồi nhấn Phím Cách nhé!' },
  { id: 'approach_trash', text: 'Hãy dùng phím mũi tên ⬅️ ➡️ đi lại gần món rác trên sàn rồi nhấn Phím Cách để nhặt nhé!' },
  { id: 'select_trash', text: 'Bé hãy bấm chọn một món rác trên sàn trước nhé!' },
  { id: 'bin_unavailable', text: 'Chưa xác định được vị trí thùng rác, bạn hãy chọn lại nhé!' },
  { id: 'mode_drag', text: 'Chế độ: Bé tự nhấn giữ chuột kéo rác thả vào thùng nhé!' },
  { id: 'mode_command', text: 'Chế độ: Bé bấm chọn rác, rồi bấm chọn thùng để tớ chạy lại nhặt nhé!' },
  { id: 'mascot_updated', text: 'A! Đã nhận đúng ảnh kien-sang-main.png rồi! Cùng dọn lớp với bạn Kiến Sáng nhé!' },
  ...TRASH_ITEMS.flatMap(item => [
    { id: `selected_${item.id}`, text: `Bé đã chọn "${item.nameVi}"! Hãy bấm vào thùng rác muốn bỏ nhé!` },
    { id: `picked_${item.id}`, text: `Kiến Sáng đã nhặt "${item.nameVi}"! Hãy đưa tới thùng rác thích hợp nhé!` },
  ]),
];

export function voiceIdForText(text: string): string | undefined {
  if (text === 'Tuyệt vời quá! Bé giỏi lắm!' || text === 'Đúng rồi! Cảm ơn bé nhiều nhé!') return 'correct';
  return VOICE_PROMPTS.find(prompt => prompt.text === text)?.id;
}
