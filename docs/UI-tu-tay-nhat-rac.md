[UI - Tự tay nhặt rác]
I. Thiết kế Đồng hồ đếm giờ (Timer) thân thiện & hồi hộp
Thanh thời gian trực quan (Visual Progress Bar / Time Bar):

Thay vì chỉ hiển thị các con số đếm ngược đơn thuần (dễ làm bé căng thẳng), hãy dùng một thanh năng lượng hoặc thanh ngòi nổ đáng yêu chạy ngang phía trên màn hình hoặc dọc theo viền thùng rác.

Khi thời gian còn nhiều, thanh có màu xanh lá tươi sáng. Khi còn dưới 3-4 giây, thanh chuyển sang màu vàng rồi đỏ, kèm theo hiệu ứng nhấp nháy nhẹ hoặc tiếng tick-tock vui tai.

Cơ chế "Hết giờ nhẹ nhàng" (Soft Timeout):

Nếu hết thời gian mà bé chưa kịp thả rác vào thùng, tránh làm bé bị trừ điểm hay thua cuộc ngay. Thay vào đó, món rác có thể tự động "nhảy" nhẹ vào giữa màn hình, nhân vật mascot ra hiệu động viên ("Cố lên, thử lại lần nữa nào!") và cho bé thêm vài giây hoặc đổi góc nhìn để tiếp tục thử lại.

II. Các Hiệu ứng động (Animations/FX) tăng sự hấp dẫn cho bé
Hiệu ứng khi nhặt được rác (Grab/Pick-up FX):

Hiệu ứng "Pop" & Pháo hoa giấy nhỏ (Mini Confetti): Khi tay bé thực hiện động tác nắm (fist) đúng vị trí món rác, món rác sẽ phát nổ ra vài hạt kim tuyến hoặc bong bóng nhỏ bay lên, kèm âm thanh "Pop!" giòn giã xác nhận "Đã tóm được!".

Đường dẫn sáng (Trail Effect): Khi bé kéo món rác di chuyển từ vị trí giữa màn hình về phía thùng rác, xuất hiện một vệt sáng lấp lánh (giống như dải sao băng nhỏ) đi theo đường di chuyển của bàn tay ảo.

Hiệu ứng phản hồi tại Thùng rác (Drop Zone FX):

Thùng rác "Há miệng" chào đón: Khi món rác được đưa lại gần, nắp thùng rác sẽ tự động mở rộng ra với hoạt ảnh nhún nhảy (bouncing), kết hợp hiệu ứng tỏa sáng viền (Glow pulse) rực rỡ để mời gọi bé thả vào.

Hiệu ứng khi thả đúng (Success Drop):

Món rác xoáy vòng tròn nhỏ rồi "rơi tõm" vào trong thùng.

Ngay lập tức, thùng rác phun ra chùm pháo hoa giấy (confetti), xuất hiện chữ "CHÍNH XÁC!" hoặc "YUMMY!" bay lên kèm âm thanh vui nhộn (tiếng vỗ tay hoặc tiếng reo hò).

Hiệu ứng khi thả sai (Wrong Drop):

Món rác bật ngược ra ngoài kèm âm thanh "Boop!" hài hước, thùng rác lắc đầu từ chối nhẹ nhàng để bé biết đường đổi sang thùng bên cạnh.

III. Các quyết định đã triển khai

- Mỗi món có vòng nhiên liệu 20 giây ôm sát ảnh rác, không còn thanh thời gian ngang hoặc số đếm ở góc màn hình. Vòng gồm 60 vạch ngắn hướng tâm, đầu bo tròn, màu xanh phát sáng; từng vạch biến mất theo chiều kim đồng hồ khi thời gian giảm. Không giữ viền nền liền ở phần đã cạn; khi cầm rác, vòng đi theo món rác.
- Dưới 30% nhiên liệu, vòng chuyển đỏ và xuất hiện hai tia điện nhỏ với nhịp sáng chậm 1,5 giây, không chớp nhanh. Âm báo nhẹ vẫn chỉ phát trong 4 giây cuối nếu bật âm thanh. Với lượt 20 giây, ngưỡng 30% tương đương 6 giây; với lượt gia hạn 10 giây, ngưỡng là 3 giây.
- Đồng hồ chỉ chạy khi đang chơi và nhìn thấy bàn tay. Dừng camera, mất tay, xác nhận thoát và thời gian phản hồi đúng/sai đều không tiêu hao thời gian.
- Hết giờ luôn tặng thêm 10 giây, không trừ tiến độ, không đổi món và không kết thúc ván. Vòng được nạp đầy lại và hiện “+10s”. Nếu chưa nhặt, rác trở về giữa sân với hiệu ứng nhún; nếu đang giữ, rác vẫn nằm trong tay. Kiến Sáng chỉ xuất hiện ngắn để động viên khi gia hạn.
- Nhặt thành công có hiệu ứng pop, confetti nhỏ, âm thanh nhặt sẵn có và nhãn “Đã nhặt!”. Khi kéo rác có vệt sao ngắn, giới hạn 9 điểm để tránh tích lũy đối tượng.
- Thùng gần tay đang giữ rác sẽ mở nắp, nhún và phát sáng. Chỉ lớp hình ảnh chuyển động; vùng nhận thả vẫn giữ nguyên.
- Thả đúng: rác xoáy vào miệng thùng, confetti xuất phát từ thùng, hiện “CHÍNH XÁC!” và tăng tiến độ như trước.
- Thả sai hoặc trượt: rác bật về vị trí nhặt, thùng sai lắc nhẹ; bé được thử lại cùng món, không mất tiến độ.
- Tôn trọng `prefers-reduced-motion`: tắt confetti, vệt sao và hoạt ảnh, giữ màu sắc, phản hồi tĩnh và thông báo trạng thái. Không thêm voice ID hoặc yêu cầu tải tài nguyên mới.