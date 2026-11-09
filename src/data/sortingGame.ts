export interface SortingGameProduct {
  id: string;
  name: string;
  image: string;
  alt: string;
  safetyNote?: string;
}

export interface SortingGameWaste {
  id: string;
  name: string;
  image: string;
  alt: string;
  products: SortingGameProduct[];
  distractors: SortingGameProduct[];
}

export interface SortingGameOption extends SortingGameProduct {
  isCorrect: boolean;
  row: number;
  column: number;
}

export interface SortingGameRound {
  waste: SortingGameWaste;
  options: SortingGameOption[];
  correctIds: string[];
}

const OPTION_SLOTS = [
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 1, column: 3 },
  { row: 2, column: 1 },
  { row: 2, column: 3 },
  { row: 3, column: 1 },
  { row: 3, column: 2 },
  { row: 3, column: 3 },
] as const;

const mainImage = (id: string) => `thu-tai-phan-loai/rac-chinh/${id}_chinh.svg`;
const reuseImage = (id: string, number: number) =>
  `thu-tai-phan-loai/rac-chinh/${id}_taisudung_0${number}.svg`;
const sheetMainImage = (id: string) => `thu-tai-phan-loai/rac-chinh/${id}_chinh.png`;
const sheetReuseImage = (id: string, number: number) =>
  `thu-tai-phan-loai/rac-chinh/${id}_taisudung_0${number}.png`;
const distractorImage = (number: number) =>
  `thu-tai-phan-loai/gay_nhieu/gay_nhieu_${String(number).padStart(2, '0')}.svg`;

const product = (
  id: string,
  name: string,
  image: string,
  alt: string,
  safetyNote?: string
): SortingGameProduct => ({ id, name, image, alt, ...(safetyNote ? { safetyNote } : {}) });

const reuse = (
  wasteId: string,
  number: number,
  name: string,
  alt: string,
  safetyNote?: string
) => product(`${wasteId}-reuse-${number}`, name, reuseImage(wasteId, number), alt, safetyNote);

const sheetReuse = (
  wasteId: string,
  number: number,
  name: string,
  alt: string,
  safetyNote?: string
) => product(`${wasteId}-reuse-${number}`, name, sheetReuseImage(wasteId, number), alt, safetyNote);

const distractor = (number: number, id: string, name: string) =>
  product(id, name, distractorImage(number), name);

export const SORTING_GAME_WASTES: SortingGameWaste[] = [
  {
    id: 'cd',
    name: 'Đĩa CD cũ',
    image: mainImage('cd'),
    alt: 'Một chiếc đĩa CD cũ',
    products: [
      reuse('cd', 1, 'Cua trang trí', 'Con cua đồ chơi làm từ đĩa CD'),
      reuse('cd', 2, 'Đĩa CD trang trí', 'Đĩa CD được vẽ nhiều màu để trang trí'),
      reuse('cd', 3, 'Đồ treo lấp lánh', 'Đồ treo trang trí làm từ đĩa CD'),
    ],
    distractors: [
      distractor(1, 'pencil', 'Bút chì'),
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(3, 'car', 'Ô tô'),
    ],
  },
  {
    id: 'chai_nhua',
    name: 'Chai nhựa',
    image: mainImage('chai_nhua'),
    alt: 'Một chai nước bằng nhựa',
    products: [
      reuse('chai_nhua', 1, 'Chậu cây hình mèo', 'Chậu cây hình chú mèo làm từ chai nhựa', 'Nhờ người lớn giúp nếu cần cắt hoặc dán.'),
      reuse('chai_nhua', 2, 'Tên lửa đồ chơi', 'Mô hình tên lửa làm từ chai nhựa', 'Nhờ người lớn giúp nếu cần cắt hoặc dán.'),
      reuse('chai_nhua', 3, 'Máy bay đồ chơi', 'Mô hình máy bay làm từ chai nhựa', 'Nhờ người lớn giúp nếu cần cắt hoặc dán.'),
    ],
    distractors: [
      distractor(10, 'book', 'Quyển sách'),
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(34, 'watch', 'Đồng hồ đeo tay'),
    ],
  },
  {
    id: 'cuon_giay',
    name: 'Lõi giấy',
    image: mainImage('cuon_giay'),
    alt: 'Một lõi giấy hình ống',
    products: [
      reuse('cuon_giay', 1, 'Ống cắm bút', 'Ống cắm bút trang trí từ lõi giấy'),
      reuse('cuon_giay', 2, 'Chú khỉ đồ chơi', 'Chú khỉ đồ chơi làm từ lõi giấy'),
      reuse('cuon_giay', 3, 'Ống nhòm đồ chơi', 'Ống nhòm làm từ hai lõi giấy'),
    ],
    distractors: [
      distractor(12, 'umbrella', 'Ô che mưa'),
      distractor(29, 'stones', 'Những viên sỏi'),
      distractor(52, 'bowl', 'Chiếc bát'),
    ],
  },
  {
    id: 'giay_vun',
    name: 'Giấy vụn',
    image: mainImage('giay_vun'),
    alt: 'Những mảnh giấy vụn',
    products: [
      reuse('giay_vun', 1, 'Thuyền giấy', 'Những chiếc thuyền gấp từ giấy'),
      reuse('giay_vun', 2, 'Túi giấy', 'Một chiếc túi được làm từ giấy'),
      reuse('giay_vun', 3, 'Tranh trang trí', 'Khung tranh ghép từ những mảnh giấy'),
    ],
    distractors: [
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(34, 'watch', 'Đồng hồ đeo tay'),
      distractor(14, 'utensils', 'Bộ thìa gỗ'),
    ],
  },
  {
    id: 'hop_giay',
    name: 'Hộp giấy',
    image: mainImage('hop_giay'),
    alt: 'Một chiếc hộp giấy',
    products: [
      reuse('hop_giay', 1, 'Ngôi nhà đồ chơi', 'Ngôi nhà đồ chơi làm từ hộp giấy'),
      reuse('hop_giay', 2, 'Xe đồ chơi', 'Chiếc xe đồ chơi làm từ hộp giấy'),
      reuse('hop_giay', 3, 'Kệ sách nhỏ', 'Kệ sách nhỏ làm từ những hộp giấy'),
    ],
    distractors: [
      distractor(12, 'umbrella', 'Ô che mưa'),
      distractor(25, 'bowls', 'Những chiếc bát'),
      distractor(61, 'helmet', 'Mũ bảo hiểm'),
    ],
  },
  {
    id: 'tat_cu',
    name: 'Tất cũ',
    image: mainImage('tat_cu'),
    alt: 'Một đôi tất cũ',
    products: [
      reuse('tat_cu', 1, 'Búp bê vải', 'Búp bê mềm làm từ tất cũ'),
      reuse('tat_cu', 2, 'Quả bóng mềm', 'Quả bóng mềm làm từ tất cũ'),
      reuse('tat_cu', 3, 'Chú sâu vải', 'Chú sâu đồ chơi làm từ tất cũ'),
    ],
    distractors: [
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(5, 'fan', 'Quạt điện'),
      distractor(52, 'bowl', 'Chiếc bát'),
    ],
  },
  {
    id: 'vo_chai',
    name: 'Chai thủy tinh',
    image: mainImage('vo_chai'),
    alt: 'Một chai thủy tinh',
    products: [
      reuse('vo_chai', 1, 'Lọ trang trí quấn dây', 'Lọ thủy tinh được quấn dây để trang trí', 'Nhờ người lớn kiểm tra chai còn nguyên vẹn và hỗ trợ trang trí.'),
      reuse('vo_chai', 2, 'Lọ đèn trang trí', 'Chai thủy tinh được trang trí thành lọ đèn', 'Chỉ dùng đèn trang trí an toàn dưới sự giúp đỡ của người lớn.'),
      reuse('vo_chai', 3, 'Đồ treo trang trí', 'Chai thủy tinh được trang trí thành món đồ treo', 'Nhờ người lớn hỗ trợ treo và kiểm tra chai còn nguyên vẹn.'),
    ],
    distractors: [
      distractor(10, 'book', 'Quyển sách'),
      distractor(24, 'backpack', 'Ba lô'),
      distractor(3, 'car', 'Ô tô'),
    ],
  },
  {
    id: 'vo_hop',
    name: 'Vỏ hộp giấy',
    image: mainImage('vo_hop'),
    alt: 'Một chiếc vỏ hộp giấy',
    products: [
      reuse('vo_hop', 1, 'Ngôi nhà đồ chơi', 'Ngôi nhà đồ chơi làm từ vỏ hộp giấy'),
      reuse('vo_hop', 2, 'Ống cắm bút', 'Ống cắm bút làm từ vỏ hộp giấy'),
      reuse('vo_hop', 3, 'Chậu cây', 'Chậu cây được trang trí từ vỏ hộp giấy'),
    ],
    distractors: [
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(34, 'watch', 'Đồng hồ đeo tay'),
      distractor(12, 'umbrella', 'Ô che mưa'),
    ],
  },
  {
    id: 'vo_lon',
    name: 'Vỏ lon',
    image: mainImage('vo_lon'),
    alt: 'Một chiếc vỏ lon nước ngọt',
    products: [
      reuse('vo_lon', 1, 'Ống cắm bút', 'Ống cắm bút được trang trí từ vỏ lon', 'Nhờ người lớn kiểm tra và che kín cạnh lon trước khi sử dụng.'),
      reuse('vo_lon', 2, 'Chậu hoa', 'Chậu hoa được làm từ vỏ lon', 'Nhờ người lớn kiểm tra và che kín cạnh lon trước khi sử dụng.'),
      reuse('vo_lon', 3, 'Điện thoại dây', 'Điện thoại đồ chơi làm từ hai chiếc lon và một sợi dây', 'Nhờ người lớn chuẩn bị lon an toàn, không còn cạnh sắc.'),
    ],
    distractors: [
      distractor(9, 'beanie', 'Mũ len'),
      distractor(10, 'book', 'Quyển sách'),
      distractor(52, 'bowl', 'Chiếc bát'),
    ],
  },
  {
    id: 'vo_lop',
    name: 'Lốp xe cũ',
    image: mainImage('vo_lop'),
    alt: 'Một chiếc lốp xe cũ',
    products: [
      reuse('vo_lop', 1, 'Xích đu lốp xe', 'Xích đu làm từ một chiếc lốp xe', 'Người lớn cần lắp đặt và kiểm tra xích đu.'),
      reuse('vo_lop', 2, 'Bồn hoa', 'Bồn hoa trang trí từ lốp xe', 'Nhờ người lớn giúp di chuyển lốp xe.'),
      reuse('vo_lop', 3, 'Ghế lốp xe', 'Một chiếc ghế làm từ lốp xe', 'Nhờ người lớn giúp làm và kiểm tra chiếc ghế.'),
    ],
    distractors: [
      distractor(2, 'kettle', 'Ấm nước'),
      distractor(10, 'book', 'Quyển sách'),
      distractor(11, 'clock', 'Đồng hồ báo thức'),
    ],
  },
  {
    id: 'ao_cu', name: 'Áo cũ', image: sheetMainImage('ao_cu'), alt: 'Một chiếc áo sơ mi cũ',
    products: [
      sheetReuse('ao_cu', 1, 'Gối áo', 'Chiếc gối may từ áo cũ'),
      sheetReuse('ao_cu', 2, 'Bọc chai', 'Vỏ bọc chai nước làm từ áo cũ'),
      sheetReuse('ao_cu', 3, 'Túi xách áo', 'Túi xách may từ áo cũ'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(3, 'car', 'Ô tô'), distractor(34, 'watch', 'Đồng hồ đeo tay')],
  },
  {
    id: 'quan_jean', name: 'Quần jean cũ', image: sheetMainImage('quan_jean'), alt: 'Một chiếc quần jean cũ',
    products: [
      sheetReuse('quan_jean', 1, 'Túi treo đồ', 'Túi treo đựng đồ dùng làm từ quần jean'),
      sheetReuse('quan_jean', 2, 'Chậu cây jean', 'Chậu cây bọc vải jean'),
      sheetReuse('quan_jean', 3, 'Túi xách jean', 'Túi xách may từ quần jean'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(29, 'stones', 'Những viên sỏi'), distractor(61, 'helmet', 'Mũ bảo hiểm')],
  },
  {
    id: 'but_chi', name: 'Bút chì cũ', image: sheetMainImage('but_chi'), alt: 'Một chiếc bút chì cũ',
    products: [
      sheetReuse('but_chi', 1, 'Thước đo', 'Thước đo có gắn bút chì'),
      sheetReuse('but_chi', 2, 'Đũa thần', 'Đũa thần đồ chơi từ bút chì'),
      sheetReuse('but_chi', 3, 'Cọc cây', 'Cọc buộc cây làm từ bút chì'),
    ],
    distractors: [distractor(3, 'car', 'Ô tô'), distractor(5, 'fan', 'Quạt điện'), distractor(34, 'watch', 'Đồng hồ đeo tay')],
  },
  {
    id: 'hop_trung', name: 'Hộp trứng giấy', image: sheetMainImage('hop_trung'), alt: 'Một khay đựng trứng bằng giấy',
    products: [
      sheetReuse('hop_trung', 1, 'Khay ươm cây', 'Mầm cây trong các ô hộp trứng giấy'),
      sheetReuse('hop_trung', 2, 'Khay nút áo', 'Khay phân loại các nút áo'),
      sheetReuse('hop_trung', 3, 'Khay pha màu', 'Khay đựng màu vẽ'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(12, 'umbrella', 'Ô che mưa'), distractor(61, 'helmet', 'Mũ bảo hiểm')],
  },
  {
    id: 'canh_cay', name: 'Cành cây khô', image: sheetMainImage('canh_cay'), alt: 'Một cành cây khô',
    products: [
      sheetReuse('canh_cay', 1, 'Móc treo chìa khóa', 'Giá treo chìa khóa làm từ cành cây'),
      sheetReuse('canh_cay', 2, 'Giá treo trang sức', 'Giá treo vòng cổ làm từ cành cây'),
      sheetReuse('canh_cay', 3, 'Đũa thần cành cây', 'Đũa thần đồ chơi trang trí từ cành cây'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(3, 'car', 'Ô tô'), distractor(10, 'book', 'Quyển sách')],
  },
  {
    id: 'khay_go', name: 'Khay gỗ cũ', image: sheetMainImage('khay_go'), alt: 'Một chiếc khay gỗ cũ',
    products: [
      sheetReuse('khay_go', 1, 'Bảng ghi chú', 'Bảng treo ghi chú làm từ khay gỗ'),
      sheetReuse('khay_go', 2, 'Khay trồng cây', 'Khay gỗ được dùng để trồng cây'),
      sheetReuse('khay_go', 3, 'Khung tranh', 'Khung tranh làm từ khay gỗ'),
    ],
    distractors: [distractor(34, 'watch', 'Đồng hồ đeo tay'), distractor(5, 'fan', 'Quạt điện'), distractor(61, 'helmet', 'Mũ bảo hiểm')],
  },
  {
    id: 'thia_nhua', name: 'Thìa nhựa', image: sheetMainImage('thia_nhua'), alt: 'Một chiếc thìa nhựa đã làm sạch',
    products: [
      sheetReuse('thia_nhua', 1, 'Móc treo', 'Móc treo làm từ thìa nhựa'),
      sheetReuse('thia_nhua', 2, 'Cọc trồng cây', 'Cọc đánh dấu cây trồng từ thìa nhựa'),
      sheetReuse('thia_nhua', 3, 'Búp bê thìa', 'Búp bê làm từ thìa nhựa'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(10, 'book', 'Quyển sách'), distractor(3, 'car', 'Ô tô')],
  },
  {
    id: 'coc_giay', name: 'Cốc cũ', image: sheetMainImage('coc_giay'), alt: 'Một chiếc cốc cũ',
    products: [
      sheetReuse('coc_giay', 1, 'Chậu cây nhỏ', 'Cây nhỏ trồng trong cốc cũ'),
      sheetReuse('coc_giay', 2, 'Nến cốc', 'Nến trang trí trong cốc cũ', 'Nhờ người lớn hỗ trợ khi làm nến.'),
      sheetReuse('coc_giay', 3, 'Cốc cắm bút', 'Cốc cũ dùng lại để cắm bút'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(12, 'umbrella', 'Ô che mưa'), distractor(34, 'watch', 'Đồng hồ đeo tay')],
  },
  {
    id: 'giay_bao', name: 'Giấy báo cũ', image: sheetMainImage('giay_bao'), alt: 'Một tờ báo cũ có các cột chữ',
    products: [
      sheetReuse('giay_bao', 1, 'Thuyền giấy báo', 'Thuyền gấp từ giấy báo'),
      sheetReuse('giay_bao', 2, 'Túi giấy báo', 'Túi đựng đồ gấp từ giấy báo'),
      sheetReuse('giay_bao', 3, 'Máy bay giấy', 'Máy bay gấp từ giấy báo'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(61, 'helmet', 'Mũ bảo hiểm'), distractor(34, 'watch', 'Đồng hồ đeo tay')],
  },
  {
    id: 'mu_cu', name: 'Mũ cũ', image: sheetMainImage('mu_cu'), alt: 'Một chiếc mũ cũ',
    products: [
      sheetReuse('mu_cu', 1, 'Giỏ đựng đồ', 'Giỏ đựng đồ làm từ mũ cũ'),
      sheetReuse('mu_cu', 2, 'Đèn mũ', 'Đèn trang trí làm từ mũ cũ', 'Nhờ người lớn hỗ trợ lắp đèn an toàn.'),
      sheetReuse('mu_cu', 3, 'Chú chim mũ', 'Chú chim đồ chơi làm từ mũ cũ'),
    ],
    distractors: [distractor(2, 'kettle', 'Ấm nước'), distractor(3, 'car', 'Ô tô'), distractor(29, 'stones', 'Những viên sỏi')],
  },
];

export function shuffleArray<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createSortingGameRounds(random: () => number = Math.random, count = 5): SortingGameRound[] {
  if (!Number.isInteger(count) || count < 1 || count > 20 || count > SORTING_GAME_WASTES.length) {
    throw new RangeError('Invalid sorting game round count');
  }
  return shuffleArray(SORTING_GAME_WASTES, random).slice(0, count).map((waste) => {
    const correctIds = waste.products.map(({ id }) => id);
    const shuffledOptions = shuffleArray([
      ...waste.products.map((item) => ({ ...item, isCorrect: true })),
      ...waste.distractors.map((item) => ({ ...item, isCorrect: false })),
    ], random);
    const optionSlots = shuffleArray(OPTION_SLOTS, random);
    const options = shuffledOptions.map((option, index) => ({
      ...option,
      ...optionSlots[index],
    }));
    return { waste, options, correctIds };
  });
}

export function evaluateSortingGameChoices(
  round: SortingGameRound,
  selectedIds: readonly string[]
): { correctIds: string[]; wrongIds: string[]; isComplete: boolean } {
  const correctIds = round.correctIds.filter((id) => selectedIds.includes(id));
  const wrongIds = selectedIds.filter((id) => !round.correctIds.includes(id));
  return {
    correctIds,
    wrongIds,
    isComplete: correctIds.length === round.correctIds.length && wrongIds.length === 0,
  };
}

export function sortingGameImageUrl(
  imagePath: string,
  offlineAssets = typeof window === 'undefined'
    ? undefined
    : window.__KIEN_SANG_PRELOADED_STATE__?.sortingGameAssets
): string {
  return offlineAssets?.[imagePath] || `./images/${imagePath}`;
}
