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

### Cách nhanh nhất (khuyên dùng) — chạy từ thư mục gốc

Có sẵn wrapper `admin.ps1` (PowerShell) và `admin.cmd` (cmd) ở **thư mục gốc** của project.
Bạn **không cần `cd admin`**, chỉ cần mở terminal ngay tại `D:\Vibe Coding\FinTrack` rồi chạy:

```powershell
# PowerShell
.\admin list
.\admin get someone@example.com
.\admin delete someone@example.com --with-data
```

```bat
:: cmd
admin list
admin get someone@example.com
admin delete someone@example.com --with-data
```

> ⚠️ **Lưu ý PowerShell:** nếu gặp lỗi "running scripts is disabled", chạy một lần:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```
> (chỉ có hiệu lực cho cửa sổ hiện tại, không đổi cài đặt máy).

### Cách chạy trực tiếp trong `admin/`

```powershell
# PowerShell
cd admin
node users.mjs list
```

```bash
# bash / git-bash
cd admin && node users.mjs list
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

```powershell
# PowerShell (từ thư mục gốc)
.\admin list
.\admin get someone@example.com
.\admin disable someone@example.com
.\admin enable someone@example.com
.\admin reset someone@example.com
.\admin set-role someone@example.com admin
.\admin delete someone@example.com --with-data
```

> 💡 **Không dùng `&&` trong PowerShell:** PowerShell (nhất là bản 5.1 trên Windows)
> không hỗ trợ `&&`. Nếu copy lệnh dạng `cd admin && node ...`, hãy tách thành 2 dòng
> (`cd admin` rồi `node ...`) hoặc dùng wrapper `.\admin` ở trên.

---

## Ghi chú

- **Role / custom claims:** sau khi `set-role`, user phải **đăng xuất rồi đăng nhập lại** thì claim mới có hiệu lực. Hiện app nhận diện chủ sở hữu bằng email (`OWNER_EMAIL` trong `index.html`); custom claim là nền tảng để sau này phân quyền linh hoạt hơn nếu cần.
- **Không liệt kê được mật khẩu:** Firebase không bao giờ cho đọc mật khẩu (đã băm). Chỉ có thể tạo link reset.
- **Xoá tài khoản ≠ xoá dữ liệu:** mặc định `delete` chỉ xoá tài khoản Auth, dữ liệu Firestore vẫn giữ lại (phòng khi cần khôi phục). Thêm `--with-data` nếu muốn xoá sạch.
