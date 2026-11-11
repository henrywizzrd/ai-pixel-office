# Chuẩn nét vẽ nhân vật — theo model Tyson tự vẽ (11/2026)

File gốc: `tyson-models/dev.aseprite`, `tyson-models/office-worker.aseprite` (đọc bằng `design/sprites/aseprite_io.py → read_ase`).
**Mọi nhân vật mới phải vẽ theo chuẩn này.** Trước khi vẽ: mở 2 file gốc, đối chiếu từng mục dưới đây.

## Khung & tỉ lệ
- Canvas **64×64**, nhân vật đứng giữa, chân chạm gần đáy (hàng ~58–60).
- Nhân vật cao **~55–58 px**, rộng thân **~20–23 px** (tính cả tay; đồ cầm thêm có thể rộng hơn).
- Tỉ lệ người thật hơi cách điệu (~3,5 đầu), **không chibi**:
  - Tóc + đầu: ~17–18 hàng (tóc chiếm ~5–7 hàng trên cùng, mặt ~10 hàng).
  - Cổ: 1–2 hàng.
  - Thân + tay: ~20–22 hàng (tay buông dài tới ngang hông/đùi, bàn tay 3×3–4×3).
  - Chân: ~13–15 hàng, 2 ống quần tách nhau bằng khe 1–2 px.
  - Giày: 2–3 hàng, mũi giày chìa ra trước.
- Tư thế: đứng thẳng, nhìn **chếch 3/4 về phía phải** của người xem (mặt hơi lệch phải, vai trái hơi rộng hơn).

## Viền
- Viền 1 px **tối nhưng có màu theo chất liệu** (không dùng đen thuần):
  - Tóc: nâu đen `#260e0a` / `#311612`.
  - Áo vest: xanh đen `#060a21`; hoodie xanh cổ vịt: `#062228`.
  - Quần kaki: nâu `#4f3721`.
  - Giày: gần đen `#040304` / `#190607`.
  - Da: viền bằng sắc da tối (`#b28b82`, `#ba8c81`) hoặc để mảng tóc/áo làm viền.
- Bên trong mảng lớn có **đường nét nội** (nếp áo, ve áo, túi, khe chân) bằng màu viền hoặc tông tối.

## Màu & đổ bóng
- Mỗi chất liệu **3–4 tông** (tối / gốc / sáng / điểm sáng). Tổng palette 16–33 màu.
- Ánh sáng chiếu từ **phía trước-phải**: mảng bên trái nhân vật tối hơn, mép phải có vệt sáng.
- Vải có **texture**: hoodie lốm đốm 2 tông (dither thưa), tóc có các lọn tông sáng/tối xen kẽ, vest có vệt sáng dọc ve áo.
- Da: gốc `#f3c0ab`/`#f5bfaa`, bóng `#dcaa9b`/`#d6ad9e`.

## Mặt
- Mặt rộng ~10–12 px, tóc phủ trán bằng mái rủ lởm chởm.
- **Mắt 2×3 px**: 1 cột lòng trắng (`#ffffff`/`#ede8ec`) + 1 cột tròng xám nâu (`#755f63`), tròng 2 mắt cùng nằm phía trong (hướng vào sống mũi); 2 mắt cách nhau ~4 px.
- Mũi/miệng gần như không vẽ; có thể có 1–2 px bóng ở cằm, râu lún phún bằng tông xám-nâu.
- Kính (dev): gọng đen dày 1 px, tròng xanh xám `#b4c3ca` có điểm sáng trắng.

## Ghi chú theo nhân vật
- **Dev**: tóc nâu xoăn bồng, kính gọng đen, hoodie xanh cổ vịt có dây rút trắng + túi bụng, quần kaki be, giày đen đế trắng, kẹp laptop xám bên phải.
- **Office worker**: tóc nâu chải gọn, vest xanh navy 2 hàng nút, sơ mi trắng, cà vạt đỏ đô, quần âu cùng màu vest, giày da nâu đen.

---

## Bổ sung 11/2026 — bộ mẫu chuẩn của Tyson (dùng làm KHUÔN, không tự sáng tác lại)

File: `tyson-models/employee-8-angles.aseprite` (8 góc + frame 2 cầm cặp), `employee-work-poses.aseprite` (8 tư thế làm việc), `boss.aseprite`.

**Nguyên tắc làm việc:** nhân vật mới = lấy đúng khung từ bộ mẫu này rồi thay tóc / màu đồ / phụ kiện.
Không tự vẽ lại dáng người, hướng nhìn hay tư thế từ đầu (bản tự dựng trước đây bị chê xấu).

### 8 góc nhìn (sheet 256×256, mỗi ô ~85 px, nhân vật ~19–25 × 57–60 px)
Thứ tự trong sheet: hàng 1 = trước · 3/4 trước-trái · ngang trái(mặt quay trái) ; hàng 2 = 3/4 sau-trái · (trống) · sau ; hàng 3 = 3/4 sau-phải · ngang phải · 3/4 trước-phải.
- **Ngang:** thân gần rộng như mặt trước (~19 px, KHÔNG gầy đi nhiều), đầu xoay hẳn: 1 mắt ở mép mặt, mũi nhô 1 px, tai ở giữa đầu, khối tóc dồn ra sau gáy; tay gần che mép thân; 2 chân hơi so le.
- **Sau:** tóc phủ kín đầu, gáy tối hơn, tai nhỏ lộ 2 bên; lưng vest trơn, chỉ vài nếp nhăn + đường cổ áo; tay buông 2 bên lộ bàn tay; 2 ống quần tách rõ.
- **3/4 sau:** thấy 1 tai + mép má bên phía quay; vai xa hẹp lại.
- **3/4 trước:** như model gốc, vai gần rộng hơn, cà vạt lệch về phía xa.
- Màu dùng rất nhiều sắc trung gian (gần 100+ màu), chuyển tông mềm như khử răng cưa — giữ nguyên khi thay màu (đổi theo dải, không tô phẳng).

### 8 tư thế làm việc (employee-work-poses)
Ngồi ghế xoay cầm laptop (ngang) · ngồi bàn gõ laptop (3/4, có bàn xám) · đứng cầm laptop · ngồi ghế băng gỗ + bàn gỗ · ngồi ghế xoay (3/4) · ngồi ghế xanh nhìn trước · đứng sau bàn xám · đứng cầm laptop (trái).
Kích thước ~30–57 × 53–57 px; ghế/bàn vẽ cùng nét (viền tối có màu, 3–4 tông).

### Sếp (boss.aseprite, 64×64)
Tóc + râu quai nón bạc xám dày, da hồng nhạt, vest nâu kẻ sọc dọc + khăn cài túi ngực trắng, sơ mi trắng, cầm máy tính bảng xám viền đen, giày nâu đậm. **Đây là sếp chính thức** (thay bản boss_tyson.py).
