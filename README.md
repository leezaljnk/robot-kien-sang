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

Khuyến nghị dùng **GitHub Actions**: mỗi lần push mã nguồn lên branch `main`, GitHub tự cài dependencies, kiểm tra TypeScript, build và publish toàn bộ `dist/`. Không cần commit `dist/` hoặc tạo branch `gh-pages`. Workflow đã có sẵn tại [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

#### 2.1. Tạo repository GitHub

1. Đăng nhập GitHub, chọn **New repository**.
2. Đặt tên, ví dụ `robot-kien-sang`.
3. Chọn **Public** để dùng GitHub Pages với tài khoản miễn phí. Không khởi tạo thêm README nếu chuẩn bị đẩy project từ máy.
4. Chọn **Create repository**.

Trong các ví dụ dưới đây, thay `TEN_GITHUB` và `robot-kien-sang` bằng tài khoản và tên repository thực tế.

#### 2.2. Đưa mã nguồn lên GitHub

Mở PowerShell tại thư mục gốc project. Nếu project chưa có Git, chạy:

```powershell
git init
git branch -M main
```

Chuẩn bị các file và kiểm tra trước khi commit:

```powershell
git add .
git status
```

Phải có mã nguồn, `public/`, `package.json`, `package-lock.json` và workflow deploy. **Không được có `.env.local`, secret key hoặc `service_role`.** [`.gitignore`](.gitignore) đã loại trừ file môi trường riêng, dependencies và `dist/`; tuy nhiên file đã được Git theo dõi từ trước không tự được bỏ theo dõi bởi `.gitignore`.

Với repository mới, tiếp tục:

```powershell
git commit -m "Initial project"
git remote add origin https://github.com/TEN_GITHUB/robot-kien-sang.git
git push -u origin main
```

Git có thể yêu cầu đăng nhập GitHub. Nếu project đã có repository/remote, dùng remote hiện tại hoặc điều chỉnh URL phù hợp, không chạy lại `git remote add origin`.

#### 2.3. Cấu hình Supabase cho GitHub Actions

File `.env.local` trên máy không được gửi lên GitHub. Cần cấu hình riêng cho quá trình build trên GitHub:

1. Vào repository → **Settings → Secrets and variables → Actions**.
2. Chọn tab **Variables** → **New repository variable**.
3. Thêm đúng hai biến:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL, ví dụ `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key hoặc legacy `anon` key của project |

Workflow đọc từ **Variables** (`vars`), không phải tab Secrets. Không dùng secret key hoặc `service_role`: hai biến `VITE_*` này sẽ xuất hiện công khai trong JavaScript của website.

#### 2.4. Bật GitHub Pages

1. Vào repository → **Settings → Pages**.
2. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
3. Không chọn **Deploy from a branch** nếu dùng workflow có sẵn.

#### 2.5. Chạy workflow và theo dõi kết quả

Workflow [Deploy GitHub Pages](.github/workflows/deploy-pages.yml) đã có trong project; không cần tạo lại hoặc dán thêm YAML.

1. Vào tab **Actions** → chọn **Deploy GitHub Pages**.
2. Bấm **Run workflow**, chọn branch `main`, rồi xác nhận. Có thể dùng cách này nếu lần push đầu diễn ra trước khi cấu hình Variables hoặc bật Pages.
3. Chờ hai job `build` và `deploy` có dấu tích xanh.
4. Vào **Settings → Pages** hoặc mở environment `github-pages` trong lần chạy để lấy URL website.

Workflow dùng Node.js 22 và `npm ci`, nên `package-lock.json` phải được commit và đồng bộ với `package.json`. Nếu job thất bại, mở step màu đỏ để xem lỗi; nếu báo lockfile không khớp, chạy `npm install` trên máy, commit lockfile đã cập nhật rồi push lại.

Step **Upload complete build** dùng `path: dist`: GitHub upload toàn bộ bản build gồm HTML, JavaScript, CSS, manifest và ảnh. **Không chỉ upload HTML**, vì HTML online cần các file còn lại để chạy.

Bản build dùng đường dẫn tương đối, hỗ trợ URL dạng `https://TEN_GITHUB.github.io/robot-kien-sang/`:

| Mục đích | URL ví dụ |
|---|---|
| Chơi game | `https://TEN_GITHUB.github.io/robot-kien-sang/index.html` |
| Cập nhật ảnh/âm thanh | `https://TEN_GITHUB.github.io/robot-kien-sang/editor.html` |

Chia sẻ URL trang chơi cho người chơi. Trang editor không yêu cầu đăng nhập theo cấu hình hiện tại. Không tải `index.html` về rồi mở bằng `file://` để dùng chế độ online; HTML offline độc lập là chế độ khác.

#### 2.6. Kiểm tra kết nối Supabase

1. Mở URL `editor.html`.
2. Chọn **Thùng xanh (hữu cơ)** rồi upload một ảnh PNG/JPG/WebP.
3. Chờ thông báo xuất bản thành công.
4. Mở trang chơi và nhấn **F5** để nhận ảnh mới.
5. Trong Supabase SQL Editor, có thể kiểm tra:

```sql
select * from public.game_assets;
```

Bảng sẽ có ID vừa upload, ví dụ `images/bins/organic`, và mã revision. File nằm trong **Storage → bucket `kien-sang`**. Ngay sau khi chỉ chạy script setup, kết quả `Success. No rows returned` là bình thường: bảng đã tạo nhưng chưa có tài nguyên nào được xuất bản.

#### 2.7. Các lần cập nhật sau

- **Đổi ảnh/âm thanh dùng chung:** upload qua editor, không cần build hoặc deploy lại. Người chơi nhấn F5.
- **Đổi mã nguồn hoặc ảnh mặc định trong project:** commit và push lên `main`; workflow tự build/deploy lại.
- **Đổi Variables Supabase trên GitHub:** chạy lại workflow để cấu hình mới được đưa vào bundle.
- **Muốn cập nhật mã nguồn trên máy sau khi sửa file trực tiếp trên GitHub:** chạy `git pull` trước khi tiếp tục chỉnh sửa.

Nếu không dùng Actions, có thể build trên máy bằng `npm run build`, đưa **nội dung bên trong `dist/`** vào thư mục gốc branch `gh-pages`, rồi chọn **Settings → Pages → Deploy from a branch → gh-pages → / (root)**. Với cách này cấu hình Supabase lấy từ `.env.local` lúc build; mỗi lần cập nhật mã nguồn phải tự build và đưa lại toàn bộ nội dung mới lên branch đó. Chỉ chọn một phương thức publish để tránh nhầm cấu hình.

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

Bộ tìm rác cần đủ `tim_rac_01` đến `tim_rac_12` để hiển thị hoạt ảnh riêng đủ 12 bước. Nếu chưa có ảnh tìm rác nào, khi di chuyển game dùng hoạt ảnh SVG mặc định thay vì giữ một ảnh cảm xúc đứng yên. Có thể bổ sung bộ ảnh vào project rồi build lại, hoặc tải bộ ảnh qua editor online và tải lại trang chơi.

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
