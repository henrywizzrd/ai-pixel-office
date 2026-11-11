# Style Guide 2D · Văn phòng nhìn từ trên xuống (3/4)

Hướng chính thức từ 11/2026, thay cho isometric. Ảnh mẫu: `references/td-ref-office.png`.
Code: `design/lib/td.js` (phòng + nội thất), `design/lib/td-people.js` (nhân vật).

## Lưới & góc nhìn
- Ô 16px, góc nhìn 3/4 từ trên xuống: thấy **mặt trên + mặt trước** của đồ vật, không có cạnh xiên.
- Tường sau cao **2 ô (32px)**. Tường ngăn nhìn từ trên là **dải trắng mảnh** kẹp giữa 2 đường viền đậm (dày 6px).
- Cửa = khoảng hở trên dải tường.

## Màu (tông lạnh, hơi nhạt)
| Vai trò | Màu |
|---|---|
| Viền mọi thứ (không dùng đen) | `#3a3a50`, phụ `#46465e` |
| Tường sơn | `#ebe4f2` + vân ngang `#e3dee6`, chân tường `#c6bdd5` |
| Tường gạch (phòng phụ) | `#aea697` / `#c0b6a6` / `#9b8b7f`, vữa `#d0c8b8` |
| Sàn gạch | `#a8a8a8`, mạch sáng `#b1b1b1`, mạch tối `#9e9e9f` |
| Sàn ván xám | `#c0c0c1` / `#cbcbcb` / `#b1b1b1` |
| Gỗ bàn | `#e0d0b0`, vân `#d4c09c`, mép `#b89f7c` |
| Vách ngăn cubicle | `#d8d0e0`, mép sáng `#ebe4f2`, tấm ghim `#d0be9c` |
| Ghế, đồ tối | `#565972` / `#6c6e85` / `#46465e` |
| Màn hình | viền `#46465e`, màn `#1652b9`, sáng `#4995e3` |
| Nhấn | đỏ `#d93232`, vàng `#f8d239`, xanh lá `#64b63b`, cam `#ed931e` |

## Quy tắc vẽ
- Mỗi đồ vật: viền 1px `#3a3a50`, mặt trên sáng hơn mặt trước, mép dưới tối hơn 1 bậc.
- **Bóng đổ**: dải mờ màu viền, độ trong 18%, lệch xuống-phải 2px dưới mỗi đồ vật. Tường sau đổ 3px bóng lên sàn.
- Đồ vật nhỏ, nhiều: điện thoại bàn, đèn kẹp, giấy, cốc, ảnh, cây nhỏ — mỗi bàn khác nhau một chút.
- Màn hình CRT: viền đậm, màn xanh dương có chấm màu (icon) hoặc dòng code.
- Cubicle: vách sau có tấm ghim, 2 cột vách bên cao hơn bàn, ghế ở phía dưới (người ngồi quay lưng).

## Nhân vật
- Cỡ RPG Maker: **16 × 23px**, đầu ~40%. Viền `#3a3a50`.
- Hướng: xuống / lên / phải (trái = lật gương). Chân dùng chung 3 khung: đứng, bước A, bước B.
- Người ngồi bàn: chỉ vẽ 12 hàng trên (đầu + vai) đè lên lưng ghế.
