# Tài chính của Hiewu

Ứng dụng quản lý tài chính cá nhân — theo dõi thu chi, nợ vay theo từng tháng. Giao diện thiết kế theo phong cách Apple, dữ liệu lưu trên Firebase Firestore để đồng bộ thời gian thực.

## Tính năng

- **Tổng quan tháng** — tóm tắt thu nhập, chi tiêu, số dư còn lại
- **Biểu đồ chi tiêu** — donut chart theo danh mục + progress bar từng danh mục
- **Dòng tiền theo ngày** — line chart thu/chi hàng ngày trong tháng
- **Xu hướng tháng** — bar chart so sánh thu/chi nhiều tháng liền tiếp
- **Giao dịch** — thêm/sửa/xóa giao dịch thu nhập và chi tiêu; tìm kiếm, lọc theo danh mục
- **Nợ vay** — quản lý nợ đang owe & lend; thanh toán từng phần hoặc toàn bộ
- **Đồng bộ thời gian thực** — Firebase Firestore realtime sync
- **Responsive** — bottom navigation trên mobile, top nav trên desktop

## Danh mục chi tiêu

Ăn uống · Đi lại · Thuê trọ · Mua sắm · Giải trí · Sức khỏe · Học tập · Du lịch · Cầu lông · Trả nợ · Khác

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML / CSS / Vanilla JS |
| Biểu đồ | Chart.js 4.4 |
| Icons | Tabler Icons |
| Database | Firebase Firestore |
| Hosting | _(tùy chọn)_ Firebase Hosting / GitHub Pages |

## Cài đặt & chạy local

Chỉ cần mở file `index.html` trong trình duyệt — không cần build tool hay server riêng.

> Lưu ý: project dùng Firebase SDK qua CDN. Nếu muốn dùng database riêng, thay `firebaseConfig` trong `app.js` bằng config của project Firebase của bạn.

## Cấu trúc file

```
├── index.html   # Giao diện chính
├── style.css    # Toàn bộ CSS (Apple-inspired design)
└── app.js       # Logic, Firebase sync, Chart.js
```

## Screenshot

> Dashboard với biểu đồ chi tiêu theo danh mục, dòng tiền và xu hướng tháng.

---

Made by **Hiewu** · 2026
