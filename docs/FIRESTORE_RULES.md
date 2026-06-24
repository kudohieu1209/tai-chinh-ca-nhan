# Firestore Rules — FinTrack

Trang **Admin → Quản lý tài khoản** (chỉ hiện với chủ tài khoản `kudohieu1209@gmail.com`)
đọc toàn bộ collection `fintrackUsers` để liệt kê người dùng và tóm tắt tài chính của họ.

Mặc định, mỗi user chỉ được đọc/ghi document của chính mình. Để dashboard hoạt động,
cần cấp thêm quyền **đọc** cho chủ tài khoản. Dán rules dưới đây vào
[Firebase Console](https://console.firebase.google.com/) → **Firestore Database → Rules → Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Mỗi user toàn quyền với document của chính mình.
    // Chủ tài khoản (owner) được đọc toàn bộ — phục vụ dashboard Admin.
    match /fintrackUsers/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null
        && request.auth.token.email == "kudohieu1209@gmail.com";
    }

    // Document dùng chung cũ (legacy) — chỉ owner đọc được để di trú dữ liệu.
    match /fintrack/{docId} {
      allow read: if request.auth != null
        && request.auth.token.email == "kudohieu1209@gmail.com";
    }
  }
}
```

## Lưu ý

- Dashboard là **read-only**: chỉ xem, không tạo/khoá/xoá tài khoản từ trình duyệt được.
  Các thao tác đó cần Admin SDK → dùng CLI local `admin/users.mjs` (xem `admin/README.md`).
- Nếu đổi email owner, sửa cả 3 chỗ: rules ở trên, hằng số `OWNER_EMAIL` trong `index.html`,
  và `OWNER_EMAIL` trong `admin/users.mjs`.
- Nếu chưa publish rules này, dashboard sẽ hiện thông báo lỗi kèm đúng đoạn rules cần thêm
  (mã lỗi thường là `permission-denied`).
