# KẾ HOẠCH CẢI TIẾN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)
## Màn chơi: "Món đồ cũ, ý tưởng mới!" (Tái sử dụng)

---

## 1. TỔNG QUAN DỰ ÁN

* **Đối tượng người dùng chính:** Trẻ em / Thiếu nhi (độ tuổi mầm non và tiểu học).
* **Mục tiêu chính:** 
  * Giúp bé khám phá những cách sử dụng mới cho một món đồ cũ qua hình ảnh và thao tác nối.
  * Tăng sự hứng thú, khả năng tự khám phá và giảm tải chữ đọc cho trẻ em.
  * Phạm vi chỉ gồm màn chơi này; không thay đổi các màn phân loại rác khác.

* **Nguyên tắc giữ nguyên cơ chế:** Mỗi lượt vẫn có một món đồ cũ, sáu ý tưởng để chọn, ba đáp án phù hợp, nút Kiểm tra và cơ hội sửa lựa chọn sai. Số lượt của ván chơi được chọn tại màn chào mừng từ **1–20 lượt, mặc định 5 lượt**, và giữ nguyên xuyên suốt ván. Trong một ván không lặp món đồ. Không thêm giải thích cho từng đáp án đúng và không sắp xếp lượt theo độ khó.
* **Điều kiện dữ liệu:** Danh mục hiện có 10 món đồ; để đáp ứng ván 20 lượt không lặp, cần bổ sung ít nhất 10 món đồ khác nhau, mỗi món có đủ ba ý tưởng phù hợp, ba ý tưởng gây nhiễu và hình ảnh tương ứng. Không tự giảm số lượt đã chọn hoặc lặp món đồ để bù dữ liệu thiếu.

---

## 2. PHÂN TÍCH & GIẢI PHÁP CHI TIẾT THEO MÀN HÌNH

### MÀN HÌNH 1: MÀN HÌNH CHÀO MỪNG / HƯỚNG DẪN (WELCOME & INSTRUCTION SCREEN)

**Bố cục tham khảo đã thống nhất:** Dựa trên màn chào mừng của **Gật Gù Bỏ Rác** và **Tự tay nhặt rác** đã chạy thử trên trình duyệt, giữ cách trình bày tập trung, ít chữ và ưu tiên hình ảnh. Chỉ áp dụng bố cục cho màn tái sử dụng, không sửa hai màn tham khảo.

* **Thanh trên:** Nút quay lại bên trái, tên màn chơi và nút bật/tắt âm thanh; các nút biểu tượng có nhãn truy cập rõ ràng.
* **Nội dung chính:** Tranh món đồ cũ và các ý tưởng dùng lại ở phía trên, tiếp đến tiêu đề **"Món đồ cũ, ý tưởng mới!"**, một câu mời chơi ngắn và chuỗi tranh hướng dẫn thao tác. Dùng hình ảnh vật phẩm có sẵn trong danh mục thay vì chỉ dùng biểu tượng trang trí.
* **Cụm điều khiển:** Bộ chọn **Số lượt** đặt cạnh nút **Bắt đầu** trên máy tính; trên điện thoại có thể xếp dọc, giữ ô chọn và nút dễ nhìn, dễ chạm. Màn này không yêu cầu camera, không sao chép nút bật camera hoặc thông báo quyền riêng tư camera từ hai màn tham khảo.
* **Hiển thị đáp ứng:** Tranh, tiêu đề, hướng dẫn và cụm điều khiển không chồng lấn hoặc tràn ngang trên máy tính và điện thoại. Ưu tiên thấy bộ chọn số lượt và nút bắt đầu trong khung nhìn đầu tiên; giảm trang trí trước khi thu nhỏ nội dung chính.

#### 1. Trực quan hóa các bước hướng dẫn (Visual Steps)
* **Thực trạng:** Sử dụng danh sách số (1, 2, 3) kèm văn bản dài, thiếu trực quan đối với trẻ nhỏ.
* **Giải pháp:**
  * Thay danh sách dài bằng **một chuỗi tranh thao tác có mũi tên nối**, tham khảo cách minh họa mở tay, nắm tay, thả tay của Tự tay nhặt rác; không chia thành ba thẻ đóng khung riêng:
    * **Bước 1:** Tranh món đồ cũ kèm bàn tay chạm/kéo + Text ngắn: *"Từ món đồ cũ..."*
    * **Bước 2:** Tranh đường nối đến ý tưởng dùng lại + Text ngắn: *"...nối ý tưởng phù hợp!"*
    * **Bước 3:** Biểu tượng kiểm tra và gỡ dây sai + Text ngắn: *"Kiểm tra, sửa và thử lại!"*
  * Thao tác minh họa phải thể hiện được cả chạm vào hình để chọn và kéo từ món đồ để nối; không khiến trẻ hiểu rằng phải chọn món đồ nguồn trước khi chạm vào ý tưởng.
  * Sử dụng font chữ tròn, rõ dấu tiếng Việt; tiêu đề nổi bật và nhãn ngắn, dễ đọc. Trên màn hình hẹp, cho phép xuống dòng mà không che tranh hoặc nút.

#### 2. Tích hợp Linh vật chào mừng (Mascot Interaction)
* **Thực trạng:** Giao diện thiếu tính tương tác nhân cách hóa, tạo cảm giác xa cách.
* **Giải pháp:**
  * Bố trí **Robot Kiến Sáng** làm điểm nhấn phụ cạnh tiêu đề hoặc tranh chính, tận dụng hình ảnh và hoạt ảnh có sẵn; không lấn át món đồ, hướng dẫn hoặc nút bắt đầu.
  * Bổ sung **Bong bóng hội thoại (Speech Bubble)** với văn phong khẩu ngữ thân mật: *"Bé ơi, cùng nghĩ xem món đồ cũ này có thể dùng thành gì nhé!"*
  * Animation: Mascot nháy mắt, vẫy tay nhẹ định kỳ (idle animation).
  * Nếu bé chưa chọn sau một khoảng chờ, mascot đưa ra một lời gợi ý chung, không tiết lộ đáp án. Không lặp lời nhắc dồn dập khi bé vẫn đang thao tác.

#### 3. Tối ưu hóa Nút Bắt Đầu (Call-To-Action - CTA)
* **Thực trạng:** Nút bấm phẳng, màu sắc chìm, kích thước nhỏ so với tầm mắt của trẻ.
* **Giải pháp:**
  * Bố trí bộ chọn **Số lượt** từ 1–20, mặc định 5, ngay cạnh nút bắt đầu theo bố cục tham khảo. Chỉ chấp nhận số nguyên trong khoảng này; khi nhập không hợp lệ, báo lỗi ngắn cạnh ô nhập và chưa cho bắt đầu, không tự đổi số lượt.
  * Tăng kích thước nút tối thiểu 20-30%, bo tròn góc lớn (Pill shape).
  * Phối màu Gradient nổi bật (Cam rực rỡ phối Xanh lá mạ).
  * Hiệu ứng:
    * **Pulse animation:** Nhịp đập nhẹ định kỳ để kích thích hành vi chạm.
    * **Shine effect:** Dải ánh sáng lướt qua bề mặt nút mỗi 3 giây.

#### 4. Trang trí bối cảnh sinh động (Stickers & Floating Elements)
* **Thực trạng:** Nền trắng tĩnh lặng, tạo cảm giác văn bản hành chính.
* **Giải pháp:**
  * Dùng một cụm tranh món đồ cũ và các ý tưởng dùng lại làm điểm nhấn chính, tương tự cụm thùng rác và vật phẩm ở hai màn tham khảo. Sticker chồi non, hoa lá chỉ là điểm nhấn phụ quanh viền, không phủ nội dung hoặc nhận thao tác chạm.
  * Nếu dùng parallax hoặc chuyển động nền, giữ nhẹ và không thay đổi vị trí cụm điều khiển; không yêu cầu quyền camera hoặc cảm biến chỉ để trang trí.

---

### MÀN HÌNH 2: MÀN HÌNH CHỌN Ý TƯỞNG TÁI SỬ DỤNG (GAMEPLAY SCREEN)

* Giữ nguyên thao tác chạm/kéo để chọn ý tưởng, nút Kiểm tra và cách xác nhận đáp án. Tiến trình dùng tổng số lượt đã chọn ở màn chào mừng; không cố định năm lượt. Các đề xuất bên dưới chỉ làm mới cách trình bày và phản hồi, không đổi luật xác nhận đáp án.

#### 1. Hệ thống đường nối & Hiệu ứng hạt (Connection Lines & Magic Particles)
* **Thực trạng:** Đường nối nét đứt/nét liền đơn điệu; icon V/X nhỏ, thiếu cảm xúc.
* **Giải pháp:**
  * **Khi kéo nối (Dragging):** Vệt sáng theo sau ngón tay/con trỏ chuột (Magic Trail) kèm các hạt bụi sao lấp lánh (Sparkles/Stars).
  * **Trước khi kiểm tra:** Dây mới nối luôn trung tính, không dùng màu, âm thanh hoặc hiệu ứng tiết lộ đúng/sai. Đáp án đúng đã được xác nhận vẫn được giữ nguyên và không thể gỡ; gỡ rồi nối lại một lựa chọn sai sẽ đưa dây đó về trạng thái trung tính cho đến lần kiểm tra tiếp theo.
  * **Sau khi bấm Kiểm tra, với dây nối đúng (Success Match):**
    * Dây nối hóa thành dây leo/dải lụa phát sáng màu xanh lá rực rỡ.
    * Hiệu ứng nảy nhẹ (Elastic bounce).
    * Tại điểm chạm đích: Nở ra một chùm hoa lá nhỏ hoặc hiệu ứng vỡ hạt sao.
  * **Sau khi bấm Kiểm tra, với dây nối sai (Mismatch):** Dây nối hóa đỏ nhẹ, đung đưa/rung lắc nhẹ kèm âm thanh "boop" ngộ nghĩnh (không phạt gắt gao).

#### 2. Thẻ bài vật phẩm tương tác (Interactive Cards)
* **Thực trạng:** Các hình ảnh vật liệu và sản phẩm tái chế đứng yên.
* **Giải pháp:**
  * **Trạng thái bình thường:** Hiệu ứng lơ lửng nhẹ (Floating effect, chênh lệch nhịp giữa các vật thể).
  * **Trạng thái Hover/Focus:**
    * Phóng to 1.1x với chuyển động mượt (Spring transition).
    * Biểu cảm gương mặt trên icon: Chớp mắt, cười toe toét hoặc vẫy tay chào.
  * **Ràng buộc đường nối:** Đầu dây phải bám hình xuyên suốt hoạt ảnh lơ lửng/phóng to. Có thể chỉ chuyển động phần trang trí không quyết định điểm nối; không để dây bị lệch hoặc tách khỏi hình.

#### 3. Phản hồi hành động "Kiểm tra" (Celebration & Feedback Loop)
* **Thực trạng:** Nút "Kiểm tra" phẳng, góc nhìn khuất, phản hồi khi hoàn thành chưa đủ kích thích.
* **Giải pháp:**
  * Nút "Kiểm tra" có viền sáng 3D và vẫn dùng được khi chỉ chọn một hình; không yêu cầu nối đủ ba hoặc cả sáu hình. Nếu dùng hiệu ứng nhắc kiểm tra, chỉ nhấp nháy khi có ít nhất một lựa chọn chưa được kiểm tra, không dựa vào việc lựa chọn đó đúng hay sai.
  * **Phản hồi hoàn thành (Victory State):**
    * Bắn pháo hoa giấy (Confetti) tràn màn hình.
    * Âm thanh hò reo vui vẻ kèm Mascot xuất hiện nhảy múa chúc mừng.
    * Màn tổng kết vui tươi, cho biết bé đã hoàn thành N/N lượt, với N là số lượt đã chọn tại màn chào mừng; không thêm điểm thưởng hoặc luật tính điểm mới.

#### 4. Thanh tiến trình hành trình (Storyline Progress Bar)
* **Thực trạng:** Hiển thị văn bản thô "ví dụ Lượt 1/5".
* **Giải pháp:**
  * Thay bằng **Thanh mầm cây xanh (Growth Quest Bar)**:
    * Mỗi lượt chơi là một nấc chồi non; tổng số nấc bằng số lượt đã chọn, hỗ trợ hiển thị từ 1–20 lượt trên cả điện thoại và máy tính.
    * Hoàn thành 1 lượt: Chồi non lớn lên, nở hoa hoặc ra lá mới.
    * Giúp bé dễ theo dõi số lượt đã hoàn thành trong ván chơi.

#### 5. Đồng hồ đếm ngược tạo hồi hộp
* Hiển thị đồng hồ đếm ngược từ **10 giây** khi bắt đầu mỗi lượt, như một yếu tố tạo không khí, không phải giới hạn bắt buộc.
* Phát một âm báo ngắn tại mỗi mốc **3, 2, 1 giây**, tổng cộng ba âm báo cho mỗi chu kỳ.
* Khi về 0, đồng hồ tự reset về 10 giây và tiếp tục đếm ngược, lặp lại cho đến khi hoàn thành lượt. Chỉ reset đồng hồ, không xóa lựa chọn hoặc đáp án đã xác nhận; không khóa thao tác, không kết thúc lượt, không trừ điểm và không đặt lại lượt.
* Khi hoàn thành lượt, dừng đồng hồ và âm báo; sang lượt mới bắt đầu lại từ 10 giây. Bấm Kiểm tra khi chưa hoàn thành lượt không reset đồng hồ. Thoát màn chơi phải hủy bộ đếm và âm báo đang chờ.


---

## 3. TIÊU CHÍ ĐÁNH GIÁ THÀNH CÔNG (SUCCESS METRICS)

1. **Tỷ lệ vượt qua màn hướng dẫn (Drop-off Rate):** Giảm tỷ lệ thoát tại màn hình Welcome xuống dưới 5%.
2. **Thời gian bắt đầu lượt chơi đầu tiên:** Rút ngắn thời gian bé hiểu luật và bắt đầu nối vật thể (dưới 10 giây nhờ chuỗi tranh thao tác).
3. **Mức độ tương tác (Engagement):** Tỷ lệ ván hoàn thành đủ N/N lượt đã chọn đạt trên 85%; theo dõi riêng theo số lượt được chọn để không đánh đồng ván ngắn và ván dài.
4. **Cảm xúc người dùng:** Đem lại tiếng cười và phản ứng thích thú rõ rệt khi hoàn thành màn chơi (ghi nhận qua quan sát thực tế).