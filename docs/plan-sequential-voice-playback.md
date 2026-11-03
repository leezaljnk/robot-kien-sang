# Kế hoạch ghép tuần tự lời thoại từ các đoạn ghi âm

**Trạng thái:** Đã triển khai  
**Phạm vi:** Lớp học — chọn và nhặt 15 món rác; Sân trường — chọn và nhặt 10 món rác; Thử tài phân loại  
**Mục tiêu:** Thay 60 bản ghi câu đầy đủ bằng các đoạn ghi âm dùng lại, được code phát nối tiếp thành câu hoàn chỉnh. Không dùng công cụ xử lý âm thanh bên ngoài; ghép và phát bằng Web Audio API có sẵn trong trình duyệt.

## 1. Mục tiêu và nguyên tắc

- Thu một lần các câu mở đầu, tên món và câu kết thúc; tái sử dụng chúng ở nhiều prompt.
- Giữ nguyên nội dung, thứ tự từ và ngữ điệu tự nhiên của các câu hiện tại.
- Chỉ ghép tuần tự, không phát các đoạn chồng lên nhau.
- Không đổi lời thoại hoặc hành vi của các prompt ngoài ba nhóm trong phạm vi.
- Không giữ hoặc phát bản ghi câu đầy đủ trong ba nhóm đã chuyển sang ghép đoạn.
- Khi thiếu hoặc lỗi bất kỳ đoạn nào, đọc toàn câu bằng TTS. Không phát một phần sequence rồi mới fallback.

## 2. Phạm vi chuyển đổi

### Lớp học — 30 ID

Chuyển 15 câu `selected_<itemId>` và 15 câu `picked_<itemId>` sang ghép ba đoạn:

- Chọn: `Bé đã chọn` → tên món → `Hãy bấm vào thùng rác muốn bỏ nhé!`
- Nhặt: `Kiến Sáng đã nhặt` → tên món → `Hãy đưa tới thùng rác thích hợp nhé!`

### Sân trường — 20 ID

Chuyển 10 câu `selected_yard_<itemId>` và 10 câu `picked_yard_<itemId>` theo cùng mẫu câu chọn/nhặt ở trên.

### Thử tài phân loại — 21 ID

Chuyển 10 câu `sorting_selected_<wasteId>` sang ghép ba đoạn:

- `Đã chọn` → tên món → `Bé chạm vào những ý tưởng phù hợp nhé!`

Giữ nguyên 11 prompt còn lại của trò chơi này.

## 3. Danh mục đoạn ghi âm

Định nghĩa các đoạn bằng ID ổn định, chữ thường và dấu gạch dưới, ví dụ:

- `voice_piece_selected_prefix`: “Bé đã chọn”
- `voice_piece_picked_prefix`: “Kiến Sáng đã nhặt”
- `voice_piece_selected_suffix`: “Hãy bấm vào thùng rác muốn bỏ nhé!”
- `voice_piece_picked_suffix`: “Hãy đưa tới thùng rác thích hợp nhé!”
- `voice_piece_sorting_prefix`: “Đã chọn”
- `voice_piece_sorting_suffix`: “Bé chạm vào những ý tưởng phù hợp nhé!”
- `voice_piece_name_<itemId>`: tên món cho lớp học/sân trường
- `voice_piece_sorting_name_<wasteId>`: tên món cho Thử tài phân loại

Nếu hai ngữ cảnh có cùng chính xác câu tên món, dùng chung một ID đoạn để tránh thu lặp. Không ghép theo tên file suy đoán tại callsite; khai báo rõ từng chuỗi trong một bảng sequence có kiểu dữ liệu, ánh xạ từ ID prompt câu đầy đủ sang danh sách ID đoạn theo thứ tự.

Tối đa cần khoảng 41 đoạn: 6 câu mở/kết thúc dùng chung và 35 tên món (25 món rác cùng 10 món của Thử tài phân loại). Nếu có tên món trùng khớp hoàn toàn giữa hai danh sách, dùng một bản ghi tên chung và giảm tổng số tương ứng. Các ID `selected_unknown` / `picked_unknown` tiếp tục dùng bản đầy đủ cũ làm dự phòng, trừ khi có quyết định bổ sung đoạn tên “món rác”.

## 4. Hành vi phát và tương thích

1. Callsite tiếp tục truyền ID logic câu hiện tại; lớp phát tra sequence theo ID đó. ID logic không còn là ID bản thu.
2. Nếu tất cả đoạn của sequence có nguồn âm thanh hợp lệ, giải mã và phát nối tiếp bằng Web Audio API như một câu. Tải/giải mã đủ các đoạn trước khi bắt đầu để tránh ngắt giữa câu.
3. Nếu sequence chưa đủ đoạn hoặc không thể giải mã, đọc nguyên câu bằng TTS hiện có.
5. Nếu trình duyệt chặn autoplay, giữ nguyên hành vi hiện tại: không tự chuyển sang một giọng khác.
6. `stopKienSangSpeech()` phải dừng toàn bộ sequence đang phát. Callback `onEnded` chỉ chạy một lần sau đoạn cuối; thay lời thoại mới phải hủy sequence cũ.
7. Cache audio buffer theo URL để dùng lại, nhưng xử lý URL/revision mới sau khi asset được cập nhật.
8. Các clip cần cùng giọng, âm lượng và khoảng cách; cắt bỏ khoảng lặng thừa ở đầu/cuối khi thu. Kiểm tra điểm nối để câu nghe tự nhiên, không mất phụ âm hoặc tạo khoảng ngắt khó chịu.

## 5. Tác động theo module

- `src/data/voicePrompts.ts`: đăng ký các clip đoạn làm ID bản thu; giữ các ID câu đã chuyển chỉ trong bảng ánh xạ logic, không đưa chúng vào danh sách bản ghi.
- Một module dữ liệu mới hoặc cùng module dữ liệu: khai báo bảng sequence cho 60 prompt chọn/nhặt và 10 prompt `sorting_selected_*`; không thêm logic ánh xạ vào component giao diện.
- `src/utils/audio.ts`: hỗ trợ nhận và phát danh sách nguồn tuần tự bằng Web Audio; quản lý hủy, lỗi tải/giải mã, cache và callback kết thúc.
- `src/App.tsx`: tại luồng phát câu chọn/nhặt, chuyển ID câu sang sequence khi có đủ clip; giữ nguyên nội dung hiển thị và ID logic.
- `src/components/ReuseSortingGame.tsx`: áp dụng sequence cho 10 câu chọn món; các lời thoại còn lại giữ nguyên.
- `src/components/VoiceStudioModal.tsx`: nhóm các đoạn thành câu mở đầu, câu kết thúc và tên món; cho thu/nghe thử từng đoạn và nghe thử cả câu đã ghép. Không yêu cầu thu lại 71 câu đầy đủ để bật tính năng.
- `src/utils/sharedAssets.ts`, `supabase/setup.sql` và editor tài nguyên chia sẻ: cho phép upload/phát hành các ID đoạn mới theo hợp đồng ID hiện hành.
- Lưu trữ cục bộ, JSON và xuất HTML offline: xác nhận `voiceClips` chứa đủ các đoạn, được roundtrip và nhúng offline. Khi nhập JSON cũ, bỏ qua clip full-sentence đã nghỉ.
- `scripts/generate_voice_catalog.ts` và `docs/voice-prompts.md`: cập nhật danh mục, tên file, nội dung đoạn, hướng dẫn thu và ghi rõ các ID câu đầy đủ là bản ghi legacy dùng làm fallback.

## 6. Kế hoạch triển khai

### Bước 1 — Chốt danh sách câu và đoạn

- Đối chiếu 15 món lớp học, 10 món sân trường và 10 món Thử tài phân loại với dữ liệu nguồn.
- So sánh nguyên văn tên món để phát hiện đoạn có thể dùng chung.
- Chốt ID, lời thoại cần thu và cách hiển thị nhóm trong Voice Studio.
- Tạo test hợp đồng xác nhận mọi prompt thuộc phạm vi ánh xạ đủ ba đoạn và văn bản ghép bằng đúng văn bản hiện tại.

### Bước 2 — Thêm mô hình sequence và phát tuần tự

- Tạo helper thuần nhận prompt ID cùng map clip và trả về danh sách URL theo đúng thứ tự.
- Mở rộng audio engine để tải/giải mã tất cả buffer rồi lên lịch nối tiếp, giữ cùng một luồng phát với các giọng hiện có.
- Bổ sung hủy sequence, thay sequence đang phát, fallback legacy/TTS và xử lý autoplay.
- Unit test thứ tự clip, thiếu clip ở từng vị trí, lỗi decode, dừng giữa câu, callback chỉ gọi một lần và phát clip legacy.

### Bước 3 — Kết nối ba nhóm callsite

- Chuyển luồng chọn/nhặt ở `App.tsx` cho classroom và yard.
- Chuyển 10 lời thoại chọn trong `ReuseSortingGame.tsx`.
- Giữ text hiển thị, ID prompt đầy đủ và hành vi của các nhóm prompt khác.

### Bước 4 — Cập nhật phòng thu và tài nguyên

- Hiển thị các đoạn cần thu theo nhóm, trạng thái clip đã có/chưa có, nghe thử đoạn riêng và nghe thử cả sequence.
- Thêm ID đoạn vào danh mục tài nguyên chia sẻ và chính sách Supabase.
- Kiểm tra upload, local storage, JSON import/export, asset revision, preloaded state và offline HTML.
- Loại prompt full-sentence đã chuyển khỏi danh mục, Voice Studio, asset slots và chính sách upload; clip cũ trong storage không được phát hoặc nhập lại vào state.

### Bước 5 — Tạo catalogue và xác minh

- Sinh lại `docs/voice-prompts.md` từ nguồn dữ liệu.
- Kiểm tra hai chiều: mọi prompt/đoạn nguồn có mặt trong tài liệu và mọi ID tài liệu có nguồn tương ứng.
- Chạy test audio, voice prompt, shared asset, settings transfer, offline asset và kiểm tra TypeScript/build.
- Nghe thử tối thiểu một câu chọn và một câu nhặt ở mỗi nhóm; nghe thử cả ba nhóm trên trình duyệt với clip Web Audio thật để đánh giá khoảng nối, tốc độ và độ rõ lời.

## 7. Tiêu chí nghiệm thu

- 15 câu chọn và 15 câu nhặt lớp học, 10 câu chọn và 10 câu nhặt sân trường, cùng 10 câu chọn của Thử tài phân loại đều được dựng đúng từ ba clip theo thứ tự.
- Khi đủ đoạn, runtime phát đúng sequence; không phát đồng thời, không có câu bị cắt giữa chừng và không chồng lên lời thoại mới.
- Khi thiếu bất kỳ đoạn nào, hành vi lần lượt là clip câu đầy đủ cũ rồi TTS; không trộn một phần sequence với TTS.
- Các prompt ngoài phạm vi, gồm sáu câu Khu vườn và 11 câu thường của Thử tài phân loại, tiếp tục phát như hiện tại.
- 60 ID bản thu câu đầy đủ đã chuyển không còn trong catalogue; ID logic vẫn ánh xạ được sang đủ ba đoạn.
- Phòng thu có thể thu, nghe thử và lưu clip đoạn; preview câu ghép nghe được.
- Các clip đoạn hoạt động qua local storage, shared assets, JSON và HTML offline; ID mới được chính sách Supabase cho phép.
- Catalogue tài liệu phản ánh chính xác ID đoạn, nội dung thu và các ID legacy.
- Test unit/integration liên quan, `npm run lint` và `npm run build` đều qua.
