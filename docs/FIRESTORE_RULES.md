# Firestore Rules — FinTrack

Trang **Admin → Quản lý tài khoản** (hiện với owner `kudohieu1209@gmail.com` và user có custom claim `role: "admin"`) đọc toàn bộ collection `fintrackUsers` để liệt kê người dùng và tóm tắt tài chính của họ.

Mặc định, mỗi user chỉ được đọc/ghi document của chính mình. Để dashboard hoạt động, cần cấp thêm quyền **đọc** cho owner và admin. Dán rules dưới đây vào [Firebase Console](https://console.firebase.google.com/) → **Firestore Database → Rules → Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Mỗi user toàn quyền với document của chính mình.
    // Owner và admin (qua custom claim) được đọc toàn bộ — phục vụ dashboard Admin.
    match /fintrackUsers/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null
        && (request.auth.token.email == "kudohieu1209@gmail.com"
            || request.auth.token.role == "admin");
    }

    // Document dùng chung cũ (legacy) — chỉ owner đọc được để di trú dữ liệu.
    match /fintrack/{docId} {
      allow read: if request.auth != null
        && request.auth.token.email == "kudohieu1209@gmail.com";
    }
  }
}
```

## Dashboard Admin là read-only

Dashboard trong app **chỉ để xem** (liệt kê tài khoản, tóm tắt tài chính, tìm kiếm). Các thao tác quản lý nhạy cảm được thực hiện qua **CLI local** `admin/users.mjs` — bấm vào nút thao tác (khoá, phân quyền, đặt lại mật khẩu, xoá) sẽ hiện lệnh CLI tương ứng kèm nút sao chép.

```bash
cd admin
node users.mjs list
node users.mjs get someone@example.com
node users.mjs disable someone@example.com
node users.mjs enable someone@example.com
node users.mjs reset someone@example.com
node users.mjs set-role someone@example.com admin
node users.mjs clear-role someone@example.com
node users.mjs delete someone@example.com --with-data
```

Xem `admin/README.md` để biết chi tiết.

## Ghi chú

- Nếu đổi email owner, sửa cả các chỗ: rules ở trên, hằng số `OWNER_EMAIL` trong `src/app.jsx`, `src/settings.jsx`, và `admin/users.mjs`.
- Custom claim `role` được set qua CLI (`set-role`). User phải đăng xuất/đăng nhập lại để claim có hiệu lực.
