# Robot Kiến Sáng – Thử tài Phân loại Rác

Trò chơi giáo dục dành cho học sinh lớp 1, giúp các em luyện phân loại rác hữu cơ và rác tái chế cùng Robot Kiến Sáng. Giao diện được xây dựng bằng React, TypeScript và Vite.

## Tính năng

- Phân loại 16 món rác vào hai thùng: rác hữu cơ và rác tái chế.
- Chơi bằng cách tự kéo thả rác hoặc chọn rác để Robot Kiến Sáng đi nhặt.
- Tùy chỉnh hình ảnh robot, trang phục, thùng rác và hình ảnh các món rác.
- Thu âm giọng nói cho phản hồi đúng, sai và chiến thắng.
- Lưu các tùy chỉnh trong trình duyệt và nạp ảnh đã lưu trong project khi chạy bản build.
- Xuất trò chơi sang dự án Scratch (`.sb3`) và tải bản HTML độc lập để chơi offline.

## Yêu cầu

- [Bun](https://bun.sh/) hoặc Node.js và npm.
- Trình duyệt web hiện đại.

Không cần API key nếu chỉ chơi bằng tài nguyên trong project. Chế độ dùng chung online cần cấu hình Supabase như bên dưới.

## GitHub Pages + Supabase: ảnh và giọng nói dùng chung

Hai trang được build cùng nhau:

- `index.html`: trang chơi, đọc tài nguyên Supabase khi mở trang. Muốn nhận thay đổi mới, tải lại trang thủ công (F5); không kiểm tra định kỳ hoặc khi chuyển lại cửa sổ.
- `editor.html`: chọn vị trí và tải ảnh/âm thanh trực tiếp lên Supabase; hỗ trợ tải nhiều file theo tên ID.

Không cần đăng nhập theo thiết kế mini-game này. **Quyền ghi là công khai, không được bảo vệ bằng việc giấu link editor.** Bất kỳ ai có cấu hình website đều có thể thay tài nguyên, tiêu hao băng thông hoặc làm gián đoạn game. Không sử dụng cho dữ liệu riêng tư; đặc biệt cân nhắc trước khi công khai giọng nói/hình ảnh của trẻ. Giới hạn 5 MB/file và danh sách ID cố định không ngăn được việc tải lên lặp lại. Theo dõi quota trong Supabase; sao lưu ảnh gốc trên máy.

### 1. Tạo Supabase

1. Tạo project tại [Supabase](https://supabase.com/).
2. Mở **SQL Editor**, chạy toàn bộ [`supabase/setup.sql`](supabase/setup.sql). Script tạo bảng `game_assets`, bucket công khai `kien-sang` và policy đọc/ghi cho khách không đăng nhập, chỉ trong bucket/ID của game.
3. Vào phần API keys / Connect của project, lấy **Project URL** và **publishable key** (hoặc legacy `anon` key). Không dùng secret key hay `service_role`.
4. Tạo `.env.local` ở thư mục gốc:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Hai giá trị này là cấu hình công khai trong bundle, không phải mật khẩu quản trị. Khởi động lại dev server hoặc build lại sau khi đổi chúng.

### 2. Build và đưa lên GitHub Pages

```bash
npm run build
```

Publish **toàn bộ nội dung `dist/`**, không chỉ HTML. Với GitHub Pages có thể dùng branch `gh-pages` chứa nội dung build và chọn branch đó trong Settings → Pages; hoặc dùng workflow Pages để upload artifact `dist`. Không upload `.env.local` vào Git. Bản build đã dùng đường dẫn tương đối, hỗ trợ URL kiểu `https://USER.github.io/REPOSITORY/`.

- Gửi người chơi URL `https://USER.github.io/REPOSITORY/index.html`.
- Mở `https://USER.github.io/REPOSITORY/editor.html` để cập nhật tài nguyên.
- Không mở `index.html` online bằng `file://`; bản offline độc lập là chế độ khác.

### 3. Cập nhật tài nguyên

Trong editor, chọn ID rồi chọn file; ảnh/âm thanh được xuất bản ngay. Hoặc chọn nhiều file đặt tên đúng ID:

- Trang phục: `tim_rac_01.png` … `tim_rac_12.png`, `cam_banh_mi_01.png` … và các ID trong [`mascotCostumes.ts`](src/data/mascotCostumes.ts).
- Món rác: `banh_mi.png`, `vo_hop_sua.png` … theo [`trashItems.ts`](src/data/trashItems.ts).
- Thùng rác: `thung_rac_xanh.png`, `thung_rac_cam.png`.
- Robot chính: `kien-sang-main.png`.
- Âm thanh: `correct.mp3`, `incorrect.mp3`, `victory.mp3`.

Ảnh online nhận PNG/JPG/WebP; âm thanh nhận MP3/WAV/WebM/OGG/M4A, tối đa 5 MB/file. Không chuyển định dạng âm thanh tự động. Storage giữ đường dẫn cố định theo ID, ví dụ `images/costumes/tim_rac_01`, `images/bins/organic`, `voice/correct` (không cần đuôi file; kiểu nội dung được giữ trong metadata). Bảng lưu revision để URL ảnh mới không dùng lại cache cũ. Không có chức năng xóa/reset tài nguyên chung trong editor này; upload file khác vào cùng ID để thay thế.

Tài nguyên Supabase ưu tiên hơn ảnh trong project và tùy chỉnh cũ của trình duyệt. Những ID chưa upload dùng bộ ảnh trong bản build. Chỉ thay tài nguyên thì **không cần build/deploy lại**. Không tự đưa bộ ảnh trong project lên Supabase: có thể dùng tải nhiều file để xuất bản bộ ban đầu.

Nếu Supabase lỗi, game báo lỗi và giữ tài nguyên đang có; có nút thử lại. Nếu chưa cấu hình Supabase, game giữ chế độ tùy chỉnh cục bộ như trước, editor báo chưa cấu hình. HTML offline và file JSON vẫn là snapshot riêng, không tự đồng bộ với Supabase.

## Cài đặt và chạy ở chế độ phát triển

Trong thư mục dự án, cài các dependencies:

```bash
bun install
```

Khởi động máy chủ phát triển:

```bash
bun run dev
```

Mở URL được Vite hiển thị trong terminal (mặc định là `http://localhost:3000`). Máy chủ được cấu hình lắng nghe trên mọi địa chỉ mạng (`0.0.0.0`).

Nếu dùng npm thay cho Bun:

```bash
npm install
```
hoặc Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution
```bashnpm install --legacy-peer-deps```
hoặc update npm
```bash
npm install -g npm@latest
```
```bash
`npm run`:
  dev
    vite --port=3000 --host=0.0.0.0
  build
    vite build
  preview
    vite preview
  clean
    rm -rf dist server.js
  lint
    tsc --noEmit
```

## Build và xem bản build

Tạo bản build production trong thư mục `dist/`:

```bash
bun run build
```

Hoặc dùng npm:

```bash
npm run build
```

Để chạy thử bản build trên máy:

```bash
bun run preview
```

Sau đó mở URL preview được Vite in ra trong terminal.

## Kiểm tra TypeScript

Script `lint` hiện chạy TypeScript để kiểm tra lỗi kiểu:

```bash
bun run lint
```

Lệnh tương ứng với npm:

```bash
npm run lint
```

## Chơi offline

### Mang tùy chỉnh sang máy hoặc trình duyệt khác

Ảnh thay đổi khi chơi chỉ lưu trong trình duyệt, không tự ghi vào HTML hoặc tải lên server. Trong cửa sổ xuất HTML offline:

1. Chọn **Xuất tùy chỉnh** để tải `Kien_Sang_Tuy_Chinh.json`, chứa ảnh, giọng thu âm và kích thước đang dùng.
2. Chuyển tệp JSON cùng trò chơi sang máy/trình duyệt khác.
3. Mở trò chơi, vào cùng cửa sổ, chọn **Nhập tùy chỉnh**, chọn JSON và xác nhận thay thế bộ tùy chỉnh hiện tại.

Nhập/xuất JSON hoạt động khi mở HTML offline trực tiếp, không cần máy chủ. Tùy chỉnh được áp dụng ngay và lưu trong trình duyệt nhận; hãy giữ tệp JSON làm bản sao lưu vì dữ liệu trình duyệt có thể bị xóa. Điểm số và ván chơi không được xuất.

Trong ứng dụng, dùng chức năng tải HTML offline để xuất một file độc lập có nhúng mã nguồn và dữ liệu tùy chỉnh hiện tại. File mẫu được cung cấp trong [`public/Robot_Kien_Sang_Offline.html`](public/Robot_Kien_Sang_Offline.html); có thể mở file này bằng trình duyệt để chơi mà không cần máy chủ web.

Các lệnh cài đặt, chạy và build ở trên không tạo lại file HTML offline. File offline được xuất riêng từ giao diện ứng dụng.

Để tạo lại bản HTML offline trực tiếp từ các ảnh hiện có trong project:

```bash
node scripts/generate_offline_html.cjs
```

Lệnh này build lại ứng dụng và tạo `Robot_Kien_Sang_Offline.html` trong cả `public/` và `dist/`, có nhúng ảnh thùng rác, robot, trang phục và món rác. Khi xuất từ giao diện, các đường dẫn ảnh/âm thanh cũng được chuyển thành dữ liệu nhúng để không phụ thuộc vào `/images/` khi mở file trực tiếp.

## Ảnh tải lên và build/publish

Khi chạy ứng dụng bằng máy chủ phát triển, ảnh tải lên được lưu vào IndexedDB/localStorage của trình duyệt để dùng lại trên cùng trình duyệt. Các API của máy chủ phát triển cũng ghi ảnh vào thư mục `public/images/` trong project:

- Robot và thùng rác: `public/images/` (ví dụ `kien-sang-main.png`, `thung_rac_xanh.png`, `thung_rac_cam.png`).
- Trang phục robot: `public/images/costumes/`, đặt tên theo ID như `tim_rac_01.png`, `cam_banh_mi_01.png`, `vui_01.png`.
- Ảnh món rác: `public/images/trash/`, đặt tên theo ID vật phẩm như `vo_hop_sua.png`.

Ảnh PNG/JPG/WebP/SVG đặt sẵn trong các thư mục trên sẽ được chép sang `dist/`. Khi build, Vite tạo `dist/kien-sang-assets.json` để ứng dụng nhận biết và nạp ảnh trang phục, ảnh rác, robot và thùng rác. Đặt tên ảnh trang phục/rác khớp ID trong ứng dụng để ảnh được gắn đúng vị trí. Giao diện hiện có 196 trang phục vector mặc định được tạo từ mã SVG; chỉ cần thêm tệp vào `costumes/` nếu muốn thay một hay nhiều trang phục bằng ảnh riêng.

Để ảnh tải lên qua giao diện được đưa vào bản publish: chạy máy chủ phát triển, tải ảnh và lưu, rồi chạy lại `npm run build`. Publish toàn bộ nội dung `dist/`. Build không thể lấy dữ liệu chỉ có trong IndexedDB/localStorage của một trình duyệt; các ảnh đó cần được tải vào project (hoặc xuất thành HTML offline) trước khi chia sẻ.

Ảnh chỉ lưu trong IndexedDB/localStorage là dữ liệu riêng của trình duyệt đó, không tự được đưa vào `dist/` hoặc chia sẻ với người dùng khác. Có thể dùng chức năng tải HTML offline trong ứng dụng để xuất một file mang theo tùy chỉnh đang dùng trên trình duyệt.

Nếu cần tạo lại ảnh mặc định robot và thùng rác từ SVG có sẵn trong mã nguồn:

```bash
node scripts/generate_bin_images.js
node scripts/restoreMascot.cjs
```

## Cấu trúc dự án

```text
src/
  components/   Các thành phần giao diện và hộp thoại của trò chơi
  data/         Dữ liệu vật phẩm rác và trang phục robot
  utils/        Âm thanh, lưu dữ liệu và xuất dự án Scratch
  App.tsx       Logic và trạng thái chính của trò chơi
public/         Hình ảnh, tài nguyên tĩnh và bản HTML offline
scripts/        Công cụ hỗ trợ xử lý tài nguyên
```
