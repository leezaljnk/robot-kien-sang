# KẾ HOẠCH CẢI TIẾN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)
## Màn chơi: "Món đồ cũ, ý tưởng mới!" (Tái sử dụng)

---

## 1. TỔNG QUAN DỰ ÁN

* **Đối tượng người dùng chính:** Trẻ em / Thiếu nhi (độ tuổi mầm non và tiểu học).
* **Mục tiêu chính:** 
  * Giúp bé khám phá những cách sử dụng mới cho một món đồ cũ qua hình ảnh và thao tác nối.
  * Tăng sự hứng thú, khả năng tự khám phá và giảm tải chữ đọc cho trẻ em.
  * Phạm vi chỉ gồm màn chơi này; không thay đổi các màn phân loại rác khác.

* **Nguyên tắc giữ nguyên cơ chế:** Mỗi lượt vẫn có một món đồ cũ, sáu ý tưởng để chọn, ba đáp án phù hợp, nút Kiểm tra và cơ hội sửa lựa chọn sai. Số lượt chơi của Ván chơi có thể thay đổi ở màn chào mừng. Không thêm giải thích cho từng đáp án đúng và không sắp xếp lượt theo độ khó.

---

## 2. PHÂN TÍCH & GIẢI PHÁP CHI TIẾT THEO MÀN HÌNH

### MÀN HÌNH 1: MÀN HÌNH CHÀO MỪNG / HƯỚNG DẪN (WELCOME & INSTRUCTION SCREEN)

#### 1. Trực quan hóa các bước hướng dẫn (Gamification / Comic Steps)
* **Thực trạng:** Sử dụng danh sách số (1, 2, 3) kèm văn bản dài, thiếu trực quan đối với trẻ nhỏ.
* **Giải pháp:**
  * Thay thế danh sách văn bản bằng **3 thẻ tranh hoạt hình (Comic Step Cards)** nằm ngang hoặc so le nhẹ:
    * **Bước 1:** Icon bàn tay kéo/chạm + Text ngắn: *"Chọn món đồ cũ..."*
    * **Bước 2:** Icon mũi tên nối + Text ngắn: *"...chọn những cách dùng mới phù hợp!"*
    * **Bước 3:** Icon nút kiểm tra + Text ngắn: *"...kiểm tra và sửa nếu cần!"*
  * Sử dụng font chữ tròn, to, viền nét rõ ràng (Bubble/Comic font).

#### 2. Tích hợp Linh vật chào mừng (Mascot Interaction)
* **Thực trạng:** Giao diện thiếu tính tương tác nhân cách hóa, tạo cảm giác xa cách.
* **Giải pháp:**
  * Bố trí nhân vật Mascot (ví dụ: **Robot Kiến Sáng** hoặc bạn Chồi Non thông thái) ở góc phải/bên cạnh tiêu đề.
  * Bổ sung **Bong bóng hội thoại (Speech Bubble)** với văn phong khẩu ngữ thân mật: *"Bé ơi, cùng nghĩ xem món đồ cũ này có thể dùng thành gì nhé!"*
  * Animation: Mascot nháy mắt, vẫy tay nhẹ định kỳ (idle animation).
  * Nếu bé chưa chọn sau một khoảng chờ, mascot đưa ra một lời gợi ý chung, không tiết lộ đáp án. Không lặp lời nhắc dồn dập khi bé vẫn đang thao tác.

#### 3. Tối ưu hóa Nút Bắt Đầu (Call-To-Action - CTA)
* **Thực trạng:** Nút bấm phẳng, màu sắc chìm, kích thước nhỏ so với tầm mắt của trẻ.
* **Giải pháp:**
  * Tăng kích thước nút tối thiểu 20-30%, bo tròn góc lớn (Pill shape).
  * Phối màu Gradient nổi bật (Cam rực rỡ phối Xanh lá mạ).
  * Hiệu ứng:
    * **Pulse animation:** Nhịp đập nhẹ định kỳ để kích thích hành vi chạm.
    * **Shine effect:** Dải ánh sáng lướt qua bề mặt nút mỗi 3 giây.

#### 4. Trang trí bối cảnh sinh động (Stickers & Floating Elements)
* **Thực trạng:** Nền trắng tĩnh lặng, tạo cảm giác văn bản hành chính.
* **Giải pháp:**
  * Rải các sticker động vật, chồi non, hoa lá và vật dụng được tái sử dụng bay bồng bềnh nhẹ nhàng quanh khung viền.
  * Tạo chiều sâu với các lớp nền (Parallax nhẹ khi di chuyển chuột hoặc nghiêng thiết bị).

---

### MÀN HÌNH 2: MÀN HÌNH CHỌN Ý TƯỞNG TÁI SỬ DỤNG (GAMEPLAY SCREEN)

* Giữ nguyên thao tác chạm/kéo để chọn ý tưởng, nút Kiểm tra, cách xác nhận đáp án và tiến trình năm lượt hiện tại. Các đề xuất bên dưới chỉ làm mới cách trình bày và phản hồi, không đổi luật chơi.

#### 1. Hệ thống đường nối & Hiệu ứng hạt (Connection Lines & Magic Particles)
* **Thực trạng:** Đường nối nét đứt/nét liền đơn điệu; icon V/X nhỏ, thiếu cảm xúc.
* **Giải pháp:**
  * **Khi kéo nối (Dragging):** Vệt sáng theo sau ngón tay/con trỏ chuột (Magic Trail) kèm các hạt bụi sao lấp lánh (Sparkles/Stars).
  * **Khi nối đúng (Success Match):**
    * Dây nối hóa thành dây leo/dải lụa phát sáng màu xanh lá rực rỡ.
    * Hiệu ứng nảy nhẹ (Elastic bounce).
    * Tại điểm chạm đích: Nở ra một chùm hoa lá nhỏ hoặc hiệu ứng vỡ hạt sao.
  * **Khi nối sai (Mismatch):** Dây nối hóa đỏ nhẹ, đung đưa/rung lắc nhẹ kèm âm thanh "boop" ngộ nghĩnh (không phạt gắt gao).

#### 2. Thẻ bài vật phẩm tương tác (Interactive Cards)
* **Thực trạng:** Các hình ảnh vật liệu và sản phẩm tái chế đứng yên.
* **Giải pháp:**
  * **Trạng thái bình thường:** Hiệu ứng lơ lửng nhẹ (Floating effect, chênh lệch nhịp giữa các vật thể).
  * **Trạng thái Hover/Focus:**
    * Phóng to 1.1x với chuyển động mượt (Spring transition).
    * Biểu cảm gương mặt trên icon: Chớp mắt, cười toe toét hoặc vẫy tay chào.

#### 3. Phản hồi hành động "Kiểm tra" (Celebration & Feedback Loop)
* **Thực trạng:** Nút "Kiểm tra" phẳng, góc nhìn khuất, phản hồi khi hoàn thành chưa đủ kích thích.
* **Giải pháp:**
  * Nút "Kiểm tra" có viền sáng 3D, tự động nhấp nháy khi tất cả các điểm đã được nối.
  * **Phản hồi hoàn thành (Victory State):**
    * Bắn pháo hoa giấy (Confetti) tràn màn hình.
    * Âm thanh hò reo vui vẻ kèm Mascot xuất hiện nhảy múa chúc mừng.
    * Màn tổng kết vui tươi, cho biết bé đã hoàn thành 5/5 lượt; không thêm điểm thưởng hoặc luật tính điểm mới.

#### 4. Thanh tiến trình hành trình (Storyline Progress Bar)
* **Thực trạng:** Hiển thị văn bản thô "ví dụ Lượt 1/5".
* **Giải pháp:**
  * Thay bằng **Thanh mầm cây xanh (Growth Quest Bar)**:
    * Mỗi lượt chơi là một nấc chồi non.
    * Hoàn thành 1 lượt: Chồi non lớn lên, nở hoa hoặc ra lá mới.
    * Giúp bé dễ theo dõi số lượt đã hoàn thành trong ván chơi.

  #### 5. Đồng hồ đếm ngược tạo hồi hộp
  * Hiển thị đồng hồ đếm ngược trong lượt chơi như một yếu tố tạo không khí, không phải giới hạn bắt buộc.
  * Khi hết giờ, chỉ phát các âm báo ngắn. Bé vẫn tiếp tục chọn đáp án và bấm Kiểm tra như bình thường; không khóa thao tác, không kết thúc lượt, không trừ điểm và không đặt lại lượt.


---

## 3. TIÊU CHÍ ĐÁNH GIÁ THÀNH CÔNG (SUCCESS METRICS)

1. **Tỷ lệ vượt qua màn hướng dẫn (Drop-off Rate):** Giảm tỷ lệ thoát tại màn hình Welcome xuống dưới 5%.
2. **Thời gian bắt đầu lượt chơi đầu tiên:** Rút ngắn thời gian bé hiểu luật và bắt đầu nối vật thể (dưới 10 giây nhờ thẻ tranh).
3. **Mức độ tương tác (Engagement):** Tăng số lượt hoàn thành trọn vẹn 5/5 màn chơi lên trên 85%.
4. **Cảm xúc người dùng:** Đem lại tiếng cười và phản ứng thích thú rõ rệt khi hoàn thành màn chơi (ghi nhận qua quan sát thực tế).