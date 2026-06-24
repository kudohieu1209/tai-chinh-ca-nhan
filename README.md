# FinTrack

Ứng dụng quản lý tài chính cá nhân theo tháng: theo dõi thu, chi, ngân sách, nợ/cho vay và các insight tổng quan. Giao diện đi theo hướng gọn, hiện đại, Apple-like.

## Chạy local

Mở trực tiếp `index.html` trong trình duyệt. App hiện dùng React + Babel + Firebase CDN nên không cần build tool.

Các file cần nằm ở root để app chạy trực tiếp:

- `index.html`: bản chạy trực tiếp, chứa JSX đã gộp inline.
- `style.css`: toàn bộ giao diện.
- `data.js`: dữ liệu seed/cấu hình phụ.
- `avatar.jpg`: ảnh dùng trong sidebar.

## Cấu trúc thư mục

```text
FinTrack/
  index.html
  style.css
  data.js
  avatar.jpg

  src/
    app.jsx
    budget.jsx
    charts.jsx
    components.jsx
    debts.jsx
    icons.jsx
    notes.jsx
    overview.jsx
    transactions.jsx

  docs/
    APPLE_DESIGN_STYLE.md
    CLAUDE.md

  sync.py
```

## Quy ước phát triển

`src/*.jsx` là bản source tách theo module để dễ đọc và chỉnh sửa. Vì app vẫn ưu tiên chạy trực tiếp bằng `index.html`, khi sửa JSX cần đồng bộ thay đổi vào block inline tương ứng trong `index.html`.

Để đồng bộ tự động, chạy:

```bash
python sync.py
```

Script này ghép toàn bộ `src/*.jsx` (theo thứ tự phụ thuộc) rồi ghi đè vào khối `<script type="text/babel">` trong `index.html`. Lưu ý: đây là one-way (`src/` → `index.html`), nên đừng sửa trực tiếp trong khối inline của `index.html` — lần chạy sync tiếp theo sẽ ghi đè.

## Ghi chú

Pipeline build hiện tại chỉ là `sync.py` (ghép văn bản thuần, không lint/test). Nếu app tiếp tục lớn lên, bước nâng cấp hợp lý tiếp theo là chuyển sang bundler thật (Vite/esbuild) để có build, kiểm tra kiểu và tách file đúng nghĩa.
