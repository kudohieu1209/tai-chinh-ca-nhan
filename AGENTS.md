# FinTrack — Hướng Dẫn & Quy Tắc Dành Cho AI Agent (AGENTS.md)

Tài liệu này chứa các quy tắc kiến trúc và triển khai bắt buộc dành cho mọi AI Agent (Antigravity, Claude, ChatGPT, v.v.) làm việc trong repo FinTrack.

---

## 1. Cấu Trúc Dự Án & Cơ Chế Build
- **Mã nguồn:** Nằm trong thư mục `src/` (chia nhỏ thành `app.jsx`, `components.jsx`, `overview.jsx`, `transactions.jsx`, `debts.jsx`, `budget.jsx`, `notes.jsx`, `settings.jsx`, `charts.jsx`, `icons.jsx`, `zh.js`).
- **Build runner:** `node build.js` (hoặc `npm run build`).
  - Script này ghép các file `src/` thành một file HTML duy nhất.
  - Tự động copy ra 2 thư mục đích:
    1. **`www/`**: Dành cho Capacitor Android build.
    2. **`public/`**: Dành cho Vercel web live deployment (`https://tai-chinh-ca-nhan.vercel.app/`).
    3. File gốc **`index.html`**: Để xem trước trực tiếp trên máy hoặc GitHub Pages.

> [!IMPORTANT]
> **Quy tắc Build:** Sau bất kỳ chỉnh sửa nào trong `src/` hoặc `style.css`, Agent **BẮT BUỘC** phải chạy `npm run build` để cập nhật đồng thời cả `www/`, `public/` và `index.html`. Không bao giờ bỏ qua thư mục `public/`.

---

## 2. Quy Tắc Deploy Lên Web Live (Vercel & GitHub Pages)
Dự án được kết nối với cả **Vercel** và **GitHub Pages**:
- Vercel Production lắng nghe nhánh `main` / `master`.
- GitHub Pages (`kudohieu1209.github.io/tai-chinh-ca-nhan`) lắng nghe nhánh `gh-pages`.
- Cấu hình Vercel trong [vercel.json](file:///run/media/hieu_20223967/D/Vibe%20Coding/FinTrack/vercel.json):
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "public"
  }
  ```

> [!IMPORTANT]
> **Quy tắc Push:** Khi đẩy code lên GitHub, Agent **BẮT BUỘC** phải push đồng bộ cả 3 nhánh bằng lệnh:
> ```bash
> npm run push-all
> # Hoặc: git push origin main && git push origin main:master && git push origin main:gh-pages
> ```
> Việc này đảm bảo cả Vercel Production và GitHub Pages đều luôn cập nhật bản mới nhất và không bao giờ bị lệch nhánh.

---

## 3. Quy Tắc Giao Diện Điều Hướng (Navigation)
- **Desktop (màn hình rộng >= 768px):** Sử dụng component `<Sidebar />` (cột menu bên trái rộng 240px gồm Logo, các tab, theme toggle, avatar).
- **Mobile (màn hình hẹp < 768px / Android):** Tự động ẩn Sidebar và hiển thị thanh `<BottomNav />` (5 tab ở cạnh đáy).
- Trong `src/app.jsx`, **cả hai component `<Sidebar />` và `<BottomNav />` PHẢI luôn cùng tồn tại** trong JSX return của `App()`. Không bao giờ xóa `<Sidebar />`.

---

## 4. Quy Tắc Xác Thực (Authentication - Android vs Web)
- **Trên Android (Capacitor):** Bắt buộc dùng `@capacitor-firebase/authentication` với Google Play Services bottom-sheet (`nativeAuth.signInWithGoogle()`), trước đó gọi `nativeAuth.signOut()` để luôn mở hộp thoại chọn tài khoản Gmail. Tuyệt đối không dùng `signInWithPopup` trên Android vì sẽ bị WebView chặn và redirect ra trình duyệt ngoài.
- **Trên Web:** Dùng Firebase Web SDK thông thường (`signInWithPopup`).
