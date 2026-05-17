# Apple Web Design Style Guide

Tổng hợp phong cách thiết kế web của Apple từ apple.com — dùng làm tiêu chuẩn khi xây dựng giao diện.

---

## 1. Triết lý thiết kế

- **Minimalism**: Loại bỏ mọi thứ không cần thiết. Mỗi yếu tố phải có lý do tồn tại.
- **Content first**: Nội dung/sản phẩm là nhân vật chính, UI chỉ là khung nền.
- **Clarity**: Người dùng hiểu ngay không cần giải thích. Không dùng icon mơ hồ, không dùng màu lòe loẹt.
- **Depth through space**: Tạo chiều sâu bằng whitespace và typography, không phải bằng shadow hay border.

---

## 2. Màu sắc

### Palette chính

| Tên | Hex | Dùng cho |
|---|---|---|
| Text chính | `#1d1d1f` | Tiêu đề, nội dung chính |
| Text phụ / mờ | `#86868b` | Mô tả, phụ đề, meta |
| Text hint nhỏ | `#6e6e73` | Label form, nav phụ |
| Blue accent | `#0071e3` | Link, CTA button, focus ring |
| Blue hover | `#0077ed` | Hover state của button |
| Background | `#f5f5f7` | Nền trang |
| Surface (card) | `#ffffff` | Nền card, modal |
| Border / divider | `#d2d2d7` | Đường kẻ, border input |
| Border nhạt | `#e5e5ea` | Divider giữa item |
| Fill nhẹ | `#f5f5f7` | Nền input, nền tag |

### Màu ngữ nghĩa

| Tên | Hex | Dùng cho |
|---|---|---|
| Green (success) | `#1d9954` | Thu nhập, dương, OK |
| Red (danger) | `#d94040` | Chi tiêu, cảnh báo, xóa |
| Red bg nhạt | `#fff0f0` | Badge nợ, highlight lỗi |
| Green bg nhạt | `#f0fff5` | Badge thu, highlight ok |

### Quy tắc màu sắc

- Không dùng quá 2 màu accent trên 1 màn hình.
- Màu chỉ dùng để truyền **ý nghĩa** (đỏ = xấu, xanh = tốt), không dùng để trang trí.
- Background luôn là trắng hoặc xám rất nhạt — không dùng màu nền đậm cho nội dung chính.

---

## 3. Typography

Apple dùng **SF Pro** (system font trên macOS/iOS). Trên web dùng `-apple-system, BlinkMacSystemFont, "Helvetica Neue"`.

### Type Scale

| Cấp độ | Size | Weight | Color | Dùng cho |
|---|---|---|---|---|
| Display | 48–80px | 700 | `#1d1d1f` | Hero headline |
| H1 | 32–48px | 700 | `#1d1d1f` | Section hero title |
| H2 / Card title | 21–28px | 700 | `#1d1d1f` | Tiêu đề card, section |
| H3 / Sub-heading | 19–21px | 600 | `#1d1d1f` | Tiêu đề phụ |
| Body | **17px** | 400–500 | `#1d1d1f` | Nội dung chính, tên item |
| Body secondary | **15px** | 400 | `#1d1d1f` | Mô tả phụ |
| Caption | **13px** | 400 | `#86868b` | Meta, ngày tháng, ghi chú |
| Label uppercase | **11–12px** | 600 | `#86868b` | Label viết hoa (UPPERCASE) |
| Micro | **10–11px** | 500 | `#86868b` | Badge, tag nhỏ |

### Quy tắc typography

- **17px là kích thước body chuẩn** — không dùng nhỏ hơn cho nội dung chính.
- `letter-spacing: -0.02em` cho heading để chữ trông compact và sang.
- `letter-spacing: 0.05–0.08em` cho label UPPERCASE để dễ đọc.
- `line-height: 1.4–1.6` cho body text.
- `font-weight: 700` cho tiêu đề, `500` cho label semi-bold, `400` cho body.
- Không dùng quá 3 cỡ chữ khác nhau trong 1 card.

### Màu chữ 2 tông (Apple style)

Apple hay dùng **đậm tối + mờ xám** trên cùng 1 dòng/đoạn để tạo hierarchy:

```
Tiềm năng vô tận.  [#1d1d1f, bold]
Nâng tầm trải nghiệm dạy và học với Apple.  [#86868b, regular]
```

---

## 4. Spacing

Apple dùng **bội số của 4** cho spacing.

| Token | Value | Dùng cho |
|---|---|---|
| xs | 4px | Gap nhỏ trong inline |
| sm | 8px | Gap giữa label và input |
| md | 12–16px | Padding trong card nhỏ |
| lg | 20–24px | Padding card chính |
| xl | 32–40px | Section padding |
| 2xl | 60–80px | Khoảng cách giữa sections lớn |

### Quy tắc spacing

- **Whitespace nhiều hơn bạn nghĩ** — Apple luôn để nhiều khoảng trống hơn thông thường.
- Padding ngang trang: tối thiểu 24px mobile, 48–80px desktop.
- Khoảng cách giữa card: 12–16px.
- Padding bên trong card: 16–24px.

---

## 5. Border Radius

| Element | Radius |
|---|---|
| Card lớn | 18–20px |
| Card nhỏ / compact | 12–14px |
| Button | 10–12px |
| Input | 10–12px |
| Tag / Badge | 980px (pill) |
| Avatar / Icon wrap | 50% (tròn) |
| Modal | 20px |
| Toggle / Segment | 10px |

---

## 6. Shadow

Apple dùng shadow **rất tinh tế**, gần như không nhìn thấy nhưng tạo cảm giác nổi nhẹ.

```css
/* Shadow chuẩn cho card */
box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);

/* Shadow modal / overlay */
box-shadow: 0 20px 60px rgba(0,0,0,0.20);

/* Shadow nhỏ cho segment active */
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
```

- Không dùng shadow màu hoặc shadow đậm cho UI thông thường.
- Shadow chỉ dùng để tách element khỏi nền — không phải trang trí.

---

## 7. Button

### Primary Button (CTA)

```css
background: #0071e3;
color: #fff;
border: none;
border-radius: 10–12px;
padding: 11–14px 24px;
font-size: 17px;
font-weight: 500;
```

- Hover: `background: #0077ed`
- Active: `transform: scale(0.99)`

### Secondary / Ghost Button

```css
background: transparent;
color: #0071e3;
border: 1px solid #d2d2d7;
border-radius: 10px;
padding: 9–11px 20px;
font-size: 15–17px;
```

### Text Link (Apple style "Learn more →")

```css
color: #0071e3;
font-size: 17px;
font-weight: 400;
text-decoration: none;
/* không có border, không có background */
```

### Quy tắc button

- Chỉ dùng 1 primary button trên 1 màn hình.
- Không dùng màu đỏ cho CTA — đỏ chỉ dùng cho "Xóa / Hủy".
- Button text ngắn gọn: "Thêm", "Mua ngay", "Tìm hiểu thêm" — không quá 4 từ.

---

## 8. Card / Surface

```css
background: #ffffff;
border-radius: 14–18px;
padding: 16–24px;
box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
```

- Không có border trên card (dùng shadow thay thế).
- Card nhỏ bên trong card lớn dùng `background: #f9f9fb` và không có shadow.
- Hover state: `background: #fafafa` (rất nhẹ, không nổi bật).

---

## 9. Navigation

### Desktop nav

```css
position: sticky;
top: 0;
height: 48–52px;
background: rgba(245,245,247, 0.92);
backdrop-filter: blur(20px);
border-bottom: 1px solid #d2d2d7;
```

- Logo bên trái, menu giữa, actions bên phải.
- Tab/segment dùng pill style với nền `#e5e5ea`, active dùng `#fff` + shadow nhẹ.
- Font nav: 13px, weight 500.

### Mobile nav

- Ẩn nav desktop, hiện bottom tab bar cố định.
- Bottom bar: `backdrop-filter: blur(20px)`, icon + label nhỏ.
- Chỉ tối đa 4–5 tab.

---

## 10. Form / Input

```css
border: 1px solid #d2d2d7;
border-radius: 10px;
padding: 9–11px 13px;
font-size: 17px;
color: #1d1d1f;
background: #fff;

/* Focus */
border-color: #0071e3;
box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);

/* Hover */
border-color: #8e8e93;
```

- Placeholder color: `#86868b`
- Label phía trên input: 13px, weight 500, `#6e6e73`
- Không dùng label nổi (floating label) — Apple dùng label tĩnh phía trên.

---

## 11. Animation & Transition

```css
/* Transition mặc định */
transition: all 0.2s ease;

/* Transition màu / border */
transition: border-color 0.3s ease, box-shadow 0.3s ease;

/* Progress bar / fill */
transition: width 0.5s ease;
```

- Không dùng animation rườm rà hay bounce.
- Thời gian: 0.2–0.3s cho micro-interaction, 0.4–0.6s cho transition lớn hơn.
- Easing: `ease` hoặc `ease-in-out` — không dùng `linear`.

---

## 12. Layout System

### Grid

- Desktop: 2–4 cột, `gap: 12–20px`
- Tablet: 2 cột
- Mobile: 1 cột

### Max-width

| Context | Max-width |
|---|---|
| Dashboard / full | 1100–1200px |
| Content / form | 780–900px |
| Modal | 380–440px |

### Page padding

| Breakpoint | Padding ngang |
|---|---|
| Desktop | 48–80px |
| Tablet | 24–32px |
| Mobile | 12–16px |

---

## 13. Divider & Separator

- Dùng border mỏng 1px màu `#f5f5f7` (rất nhạt) giữa các item trong list.
- Không dùng divider giữa card — dùng gap thay thế.
- Không dùng `<hr>` đậm — quá nặng nề.

---

## 14. Icon

- Dùng **line icon** (không dùng filled trừ khi active).
- Size thông thường: 15–20px trong nội dung, 22–24px trong bottom nav.
- Màu: kế thừa từ text — không tô màu riêng trừ khi mang ý nghĩa.

---

## 15. Checklist khi design

- [ ] Có đủ whitespace chưa? (thêm nữa nếu nghi ngờ)
- [ ] Font size nhỏ nhất có phải 13px không? (không được nhỏ hơn cho nội dung đọc được)
- [ ] Body text có dùng 17px chưa?
- [ ] Màu chữ mờ có phải `#86868b` chưa?
- [ ] Số màu dùng trên 1 trang có nhiều hơn 3 không? (nên giảm xuống)
- [ ] Border radius có nhất quán không?
- [ ] Shadow có quá đậm không? (nên nhạt hơn bạn nghĩ)
- [ ] Button CTA có phải chỉ 1 cái nổi bật nhất không?
- [ ] Transition có dùng `ease` và dưới 0.4s không?
