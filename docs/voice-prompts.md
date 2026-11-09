# Danh sách ID và lời thoại cho các màn chơi

Có **97 ID bản thu**, gồm 46 câu đầy đủ và 51 đoạn. Nguồn chuẩn: [voicePrompts.ts](../src/data/voicePrompts.ts).
Tạo lại danh sách bằng `node --import tsx scripts/generate_voice_catalog.ts`.

- Mỗi lệnh gọi `triggerSpeech(text, voiceId)` truyền ID tường minh; không dò ID theo nội dung khi phát hoặc nghe lại.
- Đặt bản thu tại `public/voice/<ID>.mp3`, hoặc upload vào `voice/<ID>` trong editor. Phòng thu, JSON và HTML offline dùng chung danh mục này.
- Thiếu bản thu hoặc phát lỗi: dùng giọng đọc trình duyệt. Trình duyệt vẫn có thể chặn autoplay khi chưa có tương tác.
- Chạy lại [supabase/setup.sql](../supabase/setup.sql) để cho phép các ID mới trên hệ thống đã triển khai.
- Phải thu lại `victory.mp3` theo mốc **20 sao** và các câu đã đổi nội dung (đặc biệt `batch_complete.mp3`, `approach_bin.mp3`, `approach_trash.mp3`); file cũ không tự đổi tiếng nói.
- Ba câu khen đúng dùng ba ID riêng để bản thu khớp văn bản; không dùng chung `correct.mp3` cho câu khác nữa.
- Khu vườn đọc kết quả cố định bằng `garden_victory`; số điểm biến thiên vẫn hiển thị riêng trên màn hình, không nằm trong bản thu.
- Thu lại `hand_pickup_victory.mp3` nếu đã có bản cũ: câu mới nói "tất cả món rác" để phù hợp với số món tùy nhập.
- Thử tài phân loại tự đọc hướng dẫn, phản hồi nối/gỡ/kiểm tra và lời chúc hoàn thành. Mỗi lượt bắt đầu bằng câu hỏi ghép ba đoạn “Từ → tên món → bé có thể tạo ra gì?”. Lời nhắc an toàn có nút bấm để nghe. Giữ phản hồi hoàn thành lượt 4,5 giây trước khi chuyển lượt để hạn chế ngắt câu.
- `continue_sorting` và `play_area_small` là trạng thái lời nhắc thụ động ở màn chính: có ID lưu cùng lời thoại nhưng không tự phát. Bong bóng và nút nghe lại của robot màn chính hiện đang ẩn; callback nghe lại đã giữ ID tường minh, không thay đổi bố cục để bật lại nút. `selected_unknown` / `picked_unknown` là dự phòng khi thiếu định nghĩa món rác.
- Danh mục là **lời nói/hướng dẫn/phản hồi**, không phải mọi nhãn nút, tên vật phẩm, văn bản mô tả ảnh, thẻ gợi ý tái sử dụng hoặc hiệu ứng âm thanh.
- 90 ID câu đầy đủ dùng sequence, không phải ID bản thu và không cần thu/upload. Ứng dụng ghép ba đoạn theo thứ tự; nếu thiếu hoặc tải/giải mã lỗi một đoạn, đoạn đó được đọc bằng TTS và các đoạn ghi âm còn lại vẫn phát bình thường.
- Sáu câu Khu vườn không thuộc kế hoạch ghép, tiếp tục dùng bản ghi câu đầy đủ như hiện nay. Thử tài phân loại có 20 câu chọn và 20 câu hỏi cùng ghép ba đoạn; 11 prompt còn lại tiếp tục dùng bản ghi riêng.

## Đoạn ghi âm ghép tuần tự (51 ID)

Ứng dụng phát ba đoạn theo thứ tự **câu mở đầu → tên món → câu kết thúc**. Chỉ thu phần chữ trong cột lời thoại; không đọc dấu ngoặc kép quanh tên món. Các đoạn được phát nối tiếp, không phát chồng tiếng.

### Câu mở đầu và kết thúc dùng chung (8 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `voice_piece_selected_prefix` | `voice_piece_selected_prefix.mp3` | Bé đã chọn |
| `voice_piece_selected_suffix` | `voice_piece_selected_suffix.mp3` | Hãy bấm vào thùng rác muốn bỏ nhé! |
| `voice_piece_picked_prefix` | `voice_piece_picked_prefix.mp3` | Kiến Sáng đã nhặt |
| `voice_piece_picked_suffix` | `voice_piece_picked_suffix.mp3` | Hãy đưa tới thùng rác thích hợp nhé! |
| `voice_piece_sorting_prefix` | `voice_piece_sorting_prefix.mp3` | Đã chọn |
| `voice_piece_sorting_suffix` | `voice_piece_sorting_suffix.mp3` | Bé chạm vào những ý tưởng phù hợp nhé! |
| `voice_piece_sorting_question_prefix` | `voice_piece_sorting_question_prefix.mp3` | Từ |
| `voice_piece_sorting_question_suffix` | `voice_piece_sorting_question_suffix.mp3` | bé có thể tạo ra gì? |

### Tên món rác lớp học (15 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `voice_piece_name_vo_hop_sua` | `voice_piece_name_vo_hop_sua.mp3` | Vỏ hộp sữa |
| `voice_piece_name_vo_hop_giay` | `voice_piece_name_vo_hop_giay.mp3` | Vỏ hộp giấy |
| `voice_piece_name_giay_cu` | `voice_piece_name_giay_cu.mp3` | Giầy cũ |
| `voice_piece_name_vo_chai` | `voice_piece_name_vo_chai.mp3` | Vỏ chai thủy tinh |
| `voice_piece_name_ong_nhua` | `voice_piece_name_ong_nhua.mp3` | Ống nhựa (ống hút) |
| `voice_piece_name_vo_keo` | `voice_piece_name_vo_keo.mp3` | Vỏ kẹo (túi nilon) |
| `voice_piece_name_vo_lon` | `voice_piece_name_vo_lon.mp3` | Vỏ lon nước ngọt |
| `voice_piece_name_vo_chai_nhua` | `voice_piece_name_vo_chai_nhua.mp3` | Vỏ chai nhựa |
| `voice_piece_name_xuong_ca` | `voice_piece_name_xuong_ca.mp3` | Xương cá |
| `voice_piece_name_dui_ga` | `voice_piece_name_dui_ga.mp3` | Xương đùi gà |
| `voice_piece_name_vo_dua_hau` | `voice_piece_name_vo_dua_hau.mp3` | Vỏ dưa hấu |
| `voice_piece_name_banh_mi` | `voice_piece_name_banh_mi.mp3` | Mẩu bánh mì |
| `voice_piece_name_la_cay` | `voice_piece_name_la_cay.mp3` | Lá cây |
| `voice_piece_name_vo_chuoi` | `voice_piece_name_vo_chuoi.mp3` | Vỏ chuối |
| `voice_piece_name_vo_tao` | `voice_piece_name_vo_tao.mp3` | Lõi / Vỏ táo |

### Tên món rác sân trường (10 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `voice_piece_name_yard_flower_petals` | `voice_piece_name_yard_flower_petals.mp3` | Cánh hoa rụng |
| `voice_piece_name_yard_twig` | `voice_piece_name_yard_twig.mp3` | Cành cây nhỏ |
| `voice_piece_name_yard_grass` | `voice_piece_name_yard_grass.mp3` | Cỏ vừa cắt |
| `voice_piece_name_yard_pine_cone` | `voice_piece_name_yard_pine_cone.mp3` | Quả thông khô |
| `voice_piece_name_yard_acorn` | `voice_piece_name_yard_acorn.mp3` | Quả sồi khô |
| `voice_piece_name_yard_plastic_cup` | `voice_piece_name_yard_plastic_cup.mp3` | Cốc nhựa |
| `voice_piece_name_yard_plastic_lid` | `voice_piece_name_yard_plastic_lid.mp3` | Nắp hộp nhựa |
| `voice_piece_name_yard_plastic_spoon` | `voice_piece_name_yard_plastic_spoon.mp3` | Thìa nhựa |
| `voice_piece_name_yard_broken_ruler` | `voice_piece_name_yard_broken_ruler.mp3` | Thước nhựa gãy |
| `voice_piece_name_yard_food_container` | `voice_piece_name_yard_food_container.mp3` | Hộp đựng thức ăn nhựa |

### Tên món trong Thử tài phân loại (18 ID mới)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `voice_piece_sorting_name_cd` | `voice_piece_sorting_name_cd.mp3` | Đĩa CD cũ |
| `voice_piece_sorting_name_chai_nhua` | `voice_piece_sorting_name_chai_nhua.mp3` | Chai nhựa |
| `voice_piece_sorting_name_cuon_giay` | `voice_piece_sorting_name_cuon_giay.mp3` | Lõi giấy |
| `voice_piece_sorting_name_giay_vun` | `voice_piece_sorting_name_giay_vun.mp3` | Giấy vụn |
| `voice_piece_sorting_name_hop_giay` | `voice_piece_sorting_name_hop_giay.mp3` | Hộp giấy |
| `voice_piece_sorting_name_tat_cu` | `voice_piece_sorting_name_tat_cu.mp3` | Tất cũ |
| `voice_piece_sorting_name_vo_chai` | `voice_piece_sorting_name_vo_chai.mp3` | Chai thủy tinh |
| `voice_piece_sorting_name_vo_lon` | `voice_piece_sorting_name_vo_lon.mp3` | Vỏ lon |
| `voice_piece_sorting_name_vo_lop` | `voice_piece_sorting_name_vo_lop.mp3` | Lốp xe cũ |
| `voice_piece_sorting_name_ao_cu` | `voice_piece_sorting_name_ao_cu.mp3` | Áo cũ |
| `voice_piece_sorting_name_quan_jean` | `voice_piece_sorting_name_quan_jean.mp3` | Quần jean cũ |
| `voice_piece_sorting_name_but_chi` | `voice_piece_sorting_name_but_chi.mp3` | Bút chì cũ |
| `voice_piece_sorting_name_hop_trung` | `voice_piece_sorting_name_hop_trung.mp3` | Hộp trứng giấy |
| `voice_piece_sorting_name_canh_cay` | `voice_piece_sorting_name_canh_cay.mp3` | Cành cây khô |
| `voice_piece_sorting_name_khay_go` | `voice_piece_sorting_name_khay_go.mp3` | Khay gỗ cũ |
| `voice_piece_sorting_name_coc_giay` | `voice_piece_sorting_name_coc_giay.mp3` | Cốc cũ |
| `voice_piece_sorting_name_giay_bao` | `voice_piece_sorting_name_giay_bao.mp3` | Giấy báo cũ |
| `voice_piece_sorting_name_mu_cu` | `voice_piece_sorting_name_mu_cu.mp3` | Mũ cũ |

Tên “Vỏ hộp giấy” trong `sorting_selected_vo_hop` trùng chính xác, dùng chung `voice_piece_name_vo_hop_giay.mp3`.

Tên “Thìa nhựa” trong `sorting_selected_thia_nhua` trùng chính xác, dùng chung `voice_piece_name_yard_plastic_spoon.mp3`.

### Ánh xạ các ID câu hiện tại sang đoạn

- `selected_<itemId>`: `voice_piece_selected_prefix.mp3` → `voice_piece_name_<itemId>.mp3` → `voice_piece_selected_suffix.mp3`.
- `picked_<itemId>`: `voice_piece_picked_prefix.mp3` → `voice_piece_name_<itemId>.mp3` → `voice_piece_picked_suffix.mp3`.
- Với sân trường, `selected_yard_<yardItemId>` và `picked_yard_<yardItemId>` dùng chung các đoạn đầu/cuối tương ứng và `voice_piece_name_yard_<yardItemId>.mp3`.
- `sorting_selected_<wasteId>`: `voice_piece_sorting_prefix.mp3` → file tên món tương ứng trong bảng trên → `voice_piece_sorting_suffix.mp3`.
- `sorting_question_<wasteId>`: `voice_piece_sorting_question_prefix.mp3` → file tên món tương ứng trong bảng trên → `voice_piece_sorting_question_suffix.mp3`.
- Ví dụ: `selected_vo_dua_hau` dùng `voice_piece_selected_prefix.mp3` → `voice_piece_name_vo_dua_hau.mp3` → `voice_piece_selected_suffix.mp3`.
- Ví dụ sân trường: `picked_yard_flower_petals` dùng `voice_piece_picked_prefix.mp3` → `voice_piece_name_yard_flower_petals.mp3` → `voice_piece_picked_suffix.mp3`.

Tổng cộng cần thu **51 file đoạn**. Các khóa logic `selected_*`, `picked_*`, `sorting_selected_*` và `sorting_question_*` không phải ID bản thu; mỗi khóa ánh xạ sang đúng ba đoạn.

## Câu chọn món và câu hỏi trong Thử tài phân loại — ghép tuần tự (40 ID logic)

Các ID logic sau không có file ghi âm riêng; mỗi câu dùng ba đoạn trong mục trên theo thứ tự đã mô tả.

- `sorting_selected_cd`
- `sorting_selected_chai_nhua`
- `sorting_selected_cuon_giay`
- `sorting_selected_giay_vun`
- `sorting_selected_hop_giay`
- `sorting_selected_tat_cu`
- `sorting_selected_vo_chai`
- `sorting_selected_vo_hop`
- `sorting_selected_vo_lon`
- `sorting_selected_vo_lop`
- `sorting_selected_ao_cu`
- `sorting_selected_quan_jean`
- `sorting_selected_but_chi`
- `sorting_selected_hop_trung`
- `sorting_selected_canh_cay`
- `sorting_selected_khay_go`
- `sorting_selected_thia_nhua`
- `sorting_selected_coc_giay`
- `sorting_selected_giay_bao`
- `sorting_selected_mu_cu`
- `sorting_question_cd`
- `sorting_question_chai_nhua`
- `sorting_question_cuon_giay`
- `sorting_question_giay_vun`
- `sorting_question_hop_giay`
- `sorting_question_tat_cu`
- `sorting_question_vo_chai`
- `sorting_question_vo_hop`
- `sorting_question_vo_lon`
- `sorting_question_vo_lop`
- `sorting_question_ao_cu`
- `sorting_question_quan_jean`
- `sorting_question_but_chi`
- `sorting_question_hop_trung`
- `sorting_question_canh_cay`
- `sorting_question_khay_go`
- `sorting_question_thia_nhua`
- `sorting_question_coc_giay`
- `sorting_question_giay_bao`
- `sorting_question_mu_cu`

## Câu chung cho lớp học / sân trường (21 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `correct` | `correct.mp3` | Hoan hô! Đúng rồi bạn ơi! |
| `incorrect` | `incorrect.mp3` | Ôi nhầm rồi, bạn thử lại nhé! |
| `correct_great` | `correct_great.mp3` | Tuyệt vời quá! Bé giỏi lắm! |
| `correct_thanks` | `correct_thanks.mp3` | Đúng rồi! Cảm ơn bé nhiều nhé! |
| `victory` | `victory.mp3` | Yeah, 20 sao rồi, lớp mình sạch quá! |
| `yard_welcome` | `yard_welcome.mp3` | Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch sân trường nhé! |
| `yard_victory` | `yard_victory.mp3` | Yeah, 20 sao rồi, sân trường sạch quá! |
| `scene_busy` | `scene_busy.mp3` | Kiến Sáng đang nhặt rác rồi. Hãy hoàn thành lượt này trước khi đổi cảnh nhé! |
| `play_area_small` | `play_area_small.mp3` | Vùng chơi quá nhỏ. Hãy phóng to cửa sổ hoặc giảm kích thước thùng rác rồi chơi lại nhé! |
| `welcome` | `welcome.mp3` | Chào bạn nhỏ! Cùng Kiến Sáng dọn sạch lớp học nhé! |
| `continue_sorting` | `continue_sorting.mp3` | Bé tiếp tục phân loại rác nhé! |
| `batch_complete` | `batch_complete.mp3` | Hoan hô! Đã dọn sạch rác! Cùng tiếp tục nhé! |
| `approach_bin` | `approach_bin.mp3` | Kiến Sáng hãy đi lại gần Thùng Xanh (bên trái) hoặc Thùng Cam (bên phải) rồi nhấn Phím Cách nhé! |
| `approach_trash` | `approach_trash.mp3` | Hãy dùng phím mũi tên ⬅️ ➡️ đi lại gần món rác trên sàn rồi nhấn Phím Cách để nhặt nhé! |
| `select_trash` | `select_trash.mp3` | Bé hãy bấm chọn một món rác trên sàn trước nhé! |
| `bin_unavailable` | `bin_unavailable.mp3` | Chưa xác định được vị trí thùng rác, bạn hãy chọn lại nhé! |
| `mode_drag` | `mode_drag.mp3` | Chế độ: Bé chạm và kéo rác vào thùng, hoặc nhấn giữ chuột để kéo nhé! |
| `mode_command` | `mode_command.mp3` | Chế độ: Bé chạm chọn rác rồi chạm thùng để tớ chạy lại nhặt nhé! |
| `mascot_updated` | `mascot_updated.mp3` | A! Đã nhận đúng ảnh kien-sang-main.png rồi! Cùng dọn lớp với bạn Kiến Sáng nhé! |
| `selected_unknown` | `selected_unknown.mp3` | Bé đã chọn "món rác"! Hãy bấm vào thùng rác muốn bỏ nhé! |
| `picked_unknown` | `picked_unknown.mp3` | Kiến Sáng đã nhặt "món rác"! Hãy đưa tới thùng rác thích hợp nhé! |

## Khu vườn — bản ghi câu đầy đủ (6 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `garden_intro` | `garden_intro.mp3` | Dùng phím mũi tên, các nút điều khiển hoặc kéo chuột/chạm để đón bánh kẹo, trái cây lấy điểm và né gạch, đá, cành cây nhé! |
| `garden_free` | `garden_free.mp3` | Cùng Kiến Sáng đón món ngon nhé! |
| `garden_challenge` | `garden_challenge.mp3` | Đón đủ 10 món ngon để nhận huy hiệu |
| `garden_hazard` | `garden_hazard.mp3` | Ối! Cẩn thận nhé! |
| `garden_game_over` | `garden_game_over.mp3` | Nghỉ một chút nhé! Lần sau mình nhớ né gạch, đá và cành cây nhé! |
| `garden_victory` | `garden_victory.mp3` | Tuyệt vời, bạn nhỏ! Bạn đã đón đủ món ngon. Tuyệt lắm! |

## Thử tài phân loại — câu đầy đủ thông thường (11 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `sorting_intro` | `sorting_intro.mp3` | Mỗi lượt có một món đồ có thể tái sử dụng. Bé hãy tìm các ý tưởng phù hợp nhé. |
| `sorting_start` | `sorting_start.mp3` | Kéo từ món rác đến hình phù hợp, hoặc chạm vào hình để nối. |
| `sorting_removed` | `sorting_removed.mp3` | Đã gỡ lựa chọn. Bé có thể nối hình khác rồi kiểm tra nhé! |
| `sorting_connected` | `sorting_connected.mp3` | Đã nối hình. Bé có thể chọn thêm rồi bấm Kiểm tra. |
| `sorting_select` | `sorting_select.mp3` | Bé hãy nối một hay nhiều hình phù hợp trước nhé! |
| `sorting_retry` | `sorting_retry.mp3` | Bé thử gỡ đường nối có dấu X rồi kiểm tra lại nhé! |
| `sorting_round_complete` | `sorting_round_complete.mp3` | Chúc mừng bé! |
| `sorting_more` | `sorting_more.mp3` | Tốt lắm! Còn ý tưởng phù hợp nữa, bé tìm tiếp nhé! |
| `sorting_continue` | `sorting_continue.mp3` | Bé hãy nối một hay nhiều hình rồi kiểm tra nhé! |
| `sorting_safety` | `sorting_safety.mp3` | Một số ý tưởng cần người lớn hỗ trợ. Mình chỉ quan sát tranh và nhờ người lớn giúp nhé! |
| `sorting_victory` | `sorting_victory.mp3` | Bé giỏi quá! Bé đã tìm được nhiều cách sáng tạo để dùng lại đồ cũ. Nhớ nhờ người lớn giúp với những ý tưởng cần làm thủ công nhé! |

## Tự tay nhặt rác (8 ID)

| ID | Tên file | Lời thoại cần thu |
|---|---|---|
| `hand_pickup_intro` | `hand_pickup_intro.mp3` | Đưa bàn tay mở đến món rác, nắm lại để nhặt rồi mở tay trên thùng nhé! |
| `hand_pickup_retry_organic` | `hand_pickup_retry_organic.mp3` | Thử lại nhé! Món này thuộc nhóm Hữu cơ. |
| `hand_pickup_retry_inorganic` | `hand_pickup_retry_inorganic.mp3` | Thử lại nhé! Món này thuộc nhóm Vô cơ. |
| `hand_pickup_miss` | `hand_pickup_miss.mp3` | Chưa tới thùng rồi, con thử lại nhé! |
| `hand_pickup_hint` | `hand_pickup_hint.mp3` | Đưa bàn tay mở tới món rác rồi nắm lại nhé! |
| `hand_pickup_drop_organic` | `hand_pickup_drop_organic.mp3` | Mở tay ở thùng Hữu cơ nhé! |
| `hand_pickup_drop_inorganic` | `hand_pickup_drop_inorganic.mp3` | Mở tay ở thùng Vô cơ nhé! |
| `hand_pickup_victory` | `hand_pickup_victory.mp3` | Tuyệt vời! Con đã dọn sạch tất cả món rác! |
