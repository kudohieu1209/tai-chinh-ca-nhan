# FinTrack

Ứng dụng quản lý tài chính cá nhân theo tháng: theo dõi thu, chi, ngân sách, nợ/cho vay và các insight tổng quan. Giao diện đi theo hướng gọn, hiện đại, Apple-like.

## Chạy local

Sau khi build, mở trực tiếp `index.html` trong trình duyệt. App dùng React + Babel + Firebase CDN nên không cần server.

```bash
npm run build    # Ghép src/ → index.html, copy ra www/
```

Các file cần ở root để app chạy:

- `index.html`: build output từ `index.template.html` + `src/`, JSX inline
- `style.css`: toàn bộ giao diện
- `data.js`: categories, formatters, helpers

## Phát triển

Sửa code trong `src/` (JSX module hóa theo từng page/component), sau đó chạy `npm run build` để ghép lại thành `index.html`.

```text
src/
├── zh.js              # Chinese dictionary (zhDict)
├── icons.jsx          # SVG icons
├── charts.jsx         # FlowChart, SixMonthBars, CategoryDonut, DebtDonut...
├── components.jsx     # useT, useCountup, Toolbar, Modal, TabBar, Sidebar...
├── overview.jsx       # Overview page + GoalForm
├── transactions.jsx   # Transactions page + CategoryManager, QuickTemplates
├── debts.jsx          # Debts page
├── budget.jsx         # Budget page
├── notes.jsx          # Notes page
├── settings.jsx       # Settings, AdminPanel, data/auth helpers
└── app.jsx            # App shell, AuthGate, BottomNav, ReactDOM.render
```

## Cấu trúc thư mục

```text
FinTrack/
├── index.template.html     # HTML shell với placeholder {{JSX}}
├── index.html              # BUILD OUTPUT (gitignored)
├── style.css               # Toàn bộ CSS
├── data.js                 # Categories, formatters, helpers
├── build.js                # Ghép src/ → index.html + copy ra www/
├── capacitor.config.json   # Cấu hình Capacitor (webDir: "www")
│
├── src/                    # Source JSX (git tracked)
│
├── android/                # Android Capacitor platform
│   └── app/
│       ├── google-services.json
│       └── src/main/       # Java source, manifest, resources
│
├── assets/                 # Icon/splash nguồn cho @capacitor/assets
│
├── admin/                  # CLI quản lý tài khoản người dùng Firebase Auth
│
├── docs/                   # Tài liệu
│
└── scripts/                # Script một lần (gitignored)
```

## Build cho Android

```bash
npm run build           # Ghép src/ → index.html, copy ra www/
npx cap sync            # Đồng bộ web assets vào android/
npx cap open android    # Mở Android Studio để build
```

## Ghi chú

- Không commit `index.html`, `www/`, `scripts/` — đã có trong `.gitignore`.
- `google-services.json` chỉ cần ở `android/app/`.
- `index.html` được tạo từ `index.template.html` + `src/*.jsx` + `src/zh.js`.
