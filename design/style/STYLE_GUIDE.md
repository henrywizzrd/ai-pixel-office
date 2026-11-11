# Style Guide: Cozy Isometric Pixel Rooms

Bộ quy tắc rút ra từ 6 ảnh mẫu trong `references/`. Mọi hình vẽ của dự án phải theo file này. Trước khi vẽ, đọc lại toàn bộ; vẽ xong, so lại với checklist ở cuối file.

| Ảnh | Nội dung |
|---|---|
| `ref-01` | Phòng khách TV, tường trái sáng / tường phải tím đậm, khung tranh |
| `ref-02` | Phòng ngủ áp mái, đèn dây, bàn học, tủ quần áo |
| `ref-03` | Studio tông tím đơn sắc (biến thể màu) |
| `ref-04` | Phòng khách + bàn ăn, tường gạch, sàn chữ L có bậc |
| `ref-05` | Phòng khách lò sưởi, đồng hồ quả lắc, vệt nắng qua cửa sổ |
| `ref-06` | Phòng tắm, gạch men, viền hoa văn chữ Vạn |

---

## 1. Kích thước & lưới

- **Ảnh gốc là pixel art 480×360, phóng to ×2.** Luôn vẽ ở độ phân giải gốc, sau đó phóng to theo số nguyên (×2, ×3, ×4), không bao giờ phóng lẻ.
- **Góc nhìn isometric 2:1:** mọi cạnh xiên đi **2 pixel ngang, 1 pixel dọc**, bậc thang đều tuyệt đối, không có pixel lẻ. Cạnh đứng thì thẳng đứng.
- Phòng chiếm khoảng 60–70% khung hình, nằm giữa; xung quanh là **một màu nền phẳng** cùng tông với phòng.
- Tỉ lệ vật thể (ở kích thước gốc): cửa cao khoảng 50–56px, sofa 3 chỗ dài khoảng 90px, ghế/bàn trà cao khoảng 20–25px, cốc khoảng 5–6px. Một người đứng sẽ cao khoảng 40–44px.

## 2. Cấu trúc căn phòng (diorama bổ đôi)

- Chỉ vẽ **sàn + 2 bức tường phía sau** (trái và phải); hai tường phía trước được "cắt" đi để nhìn vào.
- **Độ dày sàn:** mép trước của sàn có một tấm dày khoảng 3–4px, màu tối hơn sàn (hồng mận `#c24c7d` → `#75125e`).
- **Độ dày tường:** mép trên tường có một viền 2–3px màu sáng nhất (`#fffbf5` / `#f7dcd0`). Ở góc tường bị cắt cũng thấy mặt cắt này.
- **Biến thể hình dạng:** tường áp mái cắt chéo (ref-02, 03, 06), sàn chữ L có thêm một bậc hoặc một khoảng nhô ra phía trước (ref-03, 04, 05).
- **Hai tường khác sắc độ:** một tường sáng (kem hoặc hồng nhạt), tường kia đậm hơn (mận/tím đậm, gạch đỏ...). Nhờ vậy khối phòng có chiều sâu.
- **Bóng góc (ambient occlusion):** chỗ tường giao sàn và chỗ hai tường giao nhau có một dải 1–2px tối hơn.

## 3. Màu sắc

Bảng màu chính lưu trong `palette.json` / `palette.png`, trích trực tiếp từ ảnh mẫu.

**Bảng ấm (dùng mặc định), từ tối đến sáng:**
```
#372240  viền / bóng đậm nhất (mận đen)
#4c2d54  #513359  #6b4870  #8f5d82     dải tím mận (đồ gỗ tối, sofa)
#520440  #75125e  #943672  #a13f7d  #c24c7d   dải mận-hồng (mép sàn, bóng ấm)
#c65b69  #cb5f72  #da6f75  #eb8379     dải hồng san hô (tường gạch, sàn gỗ)
#ebaaa2  #ebb9b2  #fcaf7e  #fad1a9     hồng đào / cam đào (bề mặt sáng)
#f7dcd0  #fcf2e3  #fffbf5              kem, trắng ngà (tường sáng, highlight)
#e4d176  vàng mù tạt (chăn, đèn)     #6fd6a5  xanh bạc hà (nước, cây)     #d4eda9  xanh lá nhạt
```
**Bảng tím (biến thể, ref-03):** `#2d0088 #49139b #7a34d0 #9446e8 #ac57e2 #c46af2 #d9a3ff #f59cff #f7b0ff #fad6fc #ffffff`

**Quy tắc màu:**
- **Dùng ít màu:** mỗi cảnh khoảng 20–30 màu, mỗi vật thể 3–4 sắc độ cộng màu viền.
- **Đổi sắc độ theo hue (hue-shift):** bóng ngả về tím/mận, vùng sáng ngả về kem/đào. Không làm tối bằng cách pha đen, không làm sáng bằng cách pha trắng xám.
- **Không dùng màu đen thuần và không dùng xám trung tính.** Màu tối nhất là `#372240`.
- Màu nhấn (bạc hà, vàng, xanh dương) chỉ dùng cho chi tiết nhỏ như nước, cây, nến, màn hình.

## 4. Viền & khối

- **Viền 1px màu tối cùng họ màu** với vật thể: đồ tím thì viền `#372240`, đồ hồng/gỗ thì viền `#75125e` hoặc `#520440`. Vật thể sáng màu (bồn tắm, khung cửa trắng) có thể bỏ viền tối ở cạnh trên, thay bằng viền sáng.
- **Ánh sáng chiếu từ trên, hơi lệch trái:**
  - mặt trên khối **sáng nhất**
  - mặt trước-trái **trung bình**
  - mặt trước-phải **tối nhất**
- **Viền sáng (rim light):** một đường 1px sáng hơn chạy dọc cạnh trên của mặt bàn, tủ, nệm, khung cửa.
- **Bo tròn mềm:** sofa, nệm, gối có góc bo 1–2px. Đường nối giữa các nệm là 1px tối hơn.
- **Vải có lông:** sofa và thảm (ref-05) có cạnh trên lởm chởm, xen kẽ 1px nhô lên rồi thụt xuống, gợi cảm giác vải nhung.
- **Chân bàn/ghế mảnh:** 1–2px, thường màu sáng (kem) để nổi trên nền sàn tối.

## 5. Chất liệu

- **Sàn gỗ:** ván chạy theo trục iso, mạch ván 1px tối hơn, mối nối so le. Có thể thêm vài pixel vân sáng.
- **Sàn gạch:** lưới hình thoi iso; ronđa (mạch gạch) 1px sáng hoặc tối hơn một bậc.
- **Tường gạch:** hàng gạch so le, mạch vữa 1px sáng hơn nền gạch (ref-04, 05).
- **Ốp tường:** có thể có dải viền hoa văn (chữ Vạn trong ref-06), sọc ngang hoặc ốp chân tường.
- **Thảm:** hình bình hành theo trục iso, hoa văn chevron hoặc kẻ sọc, có thể có tua viền.
- **Kính / mặt bóng:** 1–2 vệt highlight chéo song song trên khung tranh, mặt bàn, TV.

## 6. Ánh sáng & không khí

- **Vệt nắng qua cửa sổ:** hình bình hành bán trong suốt, sáng hơn tường hoặc sàn một bậc, chiếu xiên xuống (ref-01, 05).
- **Đèn dây (fairy lights):** chuỗi chấm trắng 3×3px chạy dọc mép trên tường, mỗi chấm có quầng sáng mờ (ref-02, 03).
- **Quầng sáng:** nến, đèn bàn có vòng tròn mờ bán trong suốt quanh nguồn sáng.
- **Bóng đổ dưới đồ vật:** dùng màu sàn tối đi một bậc (không dùng đen), lệch nhẹ về phía sau-phải.

## 7. Chi tiết kể chuyện

Mỗi phòng nên có **5–10 đồ vật nhỏ** để căn phòng trông như có người đang sống: cốc trên đĩa, laptop mở, tay cầm game, đĩa bánh, bình hoa, chậu cây nhỏ, chiếc tất rơi, đồ chơi mèo, lịch treo tường, cúp, bóng rổ, quyển sách mở... Đồ vật đặt hơi lộn xộn chứ không xếp đối xứng.

## 8. Checklist sau khi vẽ

- [ ] Mọi cạnh xiên đúng bậc 2:1, không có pixel lẻ
- [ ] Không có màu đen thuần hoặc xám trung tính; bóng ngả tím, sáng ngả kem
- [ ] Mỗi khối có đủ 3 mặt sáng / trung bình / tối, cộng viền sáng ở cạnh trên
- [ ] Mép sàn dày 3–4px và mép tường có viền sáng
- [ ] Có bóng góc tường, bóng dưới đồ vật
- [ ] Có ít nhất 1 hiệu ứng ánh sáng (nắng, đèn dây, quầng đèn)
- [ ] Có 5 đồ vật nhỏ kể chuyện trở lên
- [ ] Nền một màu phẳng hài hoà; phóng to theo số nguyên, không làm mờ
