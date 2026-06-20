# FinTrack Admin CLI

Công cụ quản lý tài khoản người dùng (Firebase Auth) cho FinTrack, **chạy trên máy của bạn**.
Dùng Firebase Admin SDK với service account key — không deploy, không tốn phí, không cần Blaze plan.

> ⚠️ **Bảo mật:** `serviceAccountKey.json` có toàn quyền với project Firebase.
> Tuyệt đối **không commit** (đã được `.gitignore`), không chia sẻ, không upload đi đâu.

---

## 1. Cài đặt (làm 1 lần)

```bash
cd admin
npm install
```

## 2. Lấy service account key (làm 1 lần)

1. Mở [Firebase Console](https://console.firebase.google.com/) → chọn project **taichinhhiewu**.
2. Bấm ⚙️ **Project settings** → tab **Service accounts**.
3. Bấm **Generate new private key** → **Generate key** → file `.json` sẽ tải về.
4. Đổi tên file thành `serviceAccountKey.json` và đặt vào thư mục `admin/`
   (cùng chỗ với `users.mjs`).

Xong. File này đã nằm trong `.gitignore` nên sẽ không bị đẩy lên git.

---

## 3. Cách dùng

Chạy trong thư mục `admin/`:

```bash
node users.mjs <lệnh> [tham số] [cờ]
```

| Lệnh | Tác dụng |
|------|----------|
| `list` | Liệt kê mọi user: email, uid, role, trạng thái, có dữ liệu chưa |
| `get <uid\|email>` | Xem chi tiết 1 user (kèm tóm tắt dữ liệu Firestore) |
| `disable <uid\|email>` | Khoá đăng nhập 1 tài khoản |
| `enable <uid\|email>` | Mở lại đăng nhập |
| `delete <uid\|email>` | Xoá tài khoản Auth (`--with-data` để xoá luôn dữ liệu Firestore) |
| `reset <uid\|email>` | Tạo link đặt lại mật khẩu để gửi cho user |
| `set-role <uid\|email> <role>` | Gán role tuỳ chỉnh (vd `admin`) |
| `clear-role <uid\|email>` | Gỡ role |

### Cờ
- `--force` — cho phép thao tác lên tài khoản chủ (`kudohieu1209@gmail.com`). Mặc định bị chặn để tránh tự khoá mình.
- `--with-data` — dùng với `delete`, xoá luôn document dữ liệu trong Firestore.

### Ví dụ

```bash
node users.mjs list
node users.mjs get someone@example.com
node users.mjs disable someone@example.com
node users.mjs enable someone@example.com
node users.mjs reset someone@example.com
node users.mjs set-role someone@example.com admin
node users.mjs delete someone@example.com --with-data
```

---

## Ghi chú

- **Role / custom claims:** sau khi `set-role`, user phải **đăng xuất rồi đăng nhập lại** thì claim mới có hiệu lực. Hiện app nhận diện chủ sở hữu bằng email (`OWNER_EMAIL` trong `index.html`); custom claim là nền tảng để sau này phân quyền linh hoạt hơn nếu cần.
- **Không liệt kê được mật khẩu:** Firebase không bao giờ cho đọc mật khẩu (đã băm). Chỉ có thể tạo link reset.
- **Xoá tài khoản ≠ xoá dữ liệu:** mặc định `delete` chỉ xoá tài khoản Auth, dữ liệu Firestore vẫn giữ lại (phòng khi cần khôi phục). Thêm `--with-data` nếu muốn xoá sạch.
