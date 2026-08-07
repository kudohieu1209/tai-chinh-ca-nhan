# FinTrack

Ứng dụng quản lý tài chính cá nhân theo tháng: theo dõi thu, chi, ngân sách, nợ/cho vay và các insight tổng quan. Giao diện đi theo hướng gọn, hiện đại, Apple-like.

## Chạy local

Mở trực tiếp `index.html` trong trình duyệt. App dùng React + Babel + Firebase CDN nên không cần build tool.

Các file cần nằm ở root để app chạy trực tiếp:

- `index.html`: toàn bộ app, JSX inline trong `<script type="text/babel">`.
- `style.css`: toàn bộ giao diện.
- `data.js`: dữ liệu seed/cấu hình phụ.

## Cấu trúc thư mục

```text
FinTrack/
├── index.html              # App chính (monolithic, JSX inline)
├── style.css               # Toàn bộ CSS
├── data.js                 # Categories, formatters, helpers
├── build.js                # Script copy file ra www/ cho Capacitor
├── capacitor.config.json   # Cấu hình Capacitor (webDir: "www")
│
├── android/                # Android Capacitor platform
│   └── app/
│       ├── google-services.json
│       └── src/main/       # Java source, manifest, resources
│
├── assets/                 # Icon/splash nguồn cho @capacitor/assets
│
├── admin/                  # CLI quản lý tài khoản người dùng Firebase Auth
│   └── users.mjs
│
├── docs/                   # Tài liệu
│   ├── CLAUDE.md
│   ├── APPLE_DESIGN_STYLE.md
│   ├── FIREBASE_AUTH_SETUP.md
│   └── FIRESTORE_RULES.md
│
└── scripts/                # Script một lần (gitignored)
    └── add_zh.js           # Inject bản dịch tiếng Trung vào index.html
```

## Build cho Android

App dùng Capacitor để build APK/AAB:

```bash
npm run build           # Copy index.html, style.css, data.js vào www/
npx cap sync            # Đồng bộ web assets vào android/
npx cap open android    # Mở Android Studio để build
```

Pipeline build hiện tại là `build.js` (copy file thuần). Nếu app tiếp tục lớn lên, bước nâng cấp hợp lý tiếp theo là chuyển sang bundler thật (Vite/esbuild).

## Ghi chú

- App từng có kiến trúc modular `src/*.jsx` + `sync.py`, đã chuyển sang monolithic `index.html` để đơn giản hóa.
- Không commit `www/`, `scripts/`, `legacy/` — đã có trong `.gitignore`.
- `google-services.json` chỉ cần ở `android/app/`, không cần ở root.
