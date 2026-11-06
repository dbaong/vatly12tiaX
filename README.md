# COOLIDGE TUBE – INTERACTIVE X-RAY LAB

## Cấu trúc thư mục
```
coolidge-xray-lab/
├─ index.html   (giao diện)
├─ style.css    (kiểu dáng)
├─ app.js       (3D, mô phỏng, phổ, lọc, điều khiển)
└─ lib/         (tùy chọn: đặt three.min.js r128 để chạy khi không có mạng)
```

## Chạy trên Windows
**Cách 1:** nhấp đúp `index.html` (Chrome hoặc Edge). Cần Internet lần đầu để tải Three.js từ CDN.

**Cách 2 (localhost):** mở PowerShell trong thư mục dự án rồi chạy `python -m http.server 8000`, sau đó vào `http://localhost:8000`.

**Chạy offline:** tải `three.min.js` (bản r128) và đặt vào `lib/three.min.js`.

## Triển khai GitHub Pages
1. Tạo repository mới trên GitHub, tải toàn bộ file trong thư mục này lên nhánh `main`.
2. Vào **Settings → Pages**, mục *Build and deployment* chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
3. Sau vài phút truy cập `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Điều khiển
Kéo chuột: xoay. Cuộn: zoom. Shift hoặc chuột phải + kéo: di chuyển. Phím ← →: giai đoạn trước/sau.

## Quyền riêng tư
Không backend, không đăng nhập, không tracking, không analytics, không chứa thông tin cá nhân.

## Giới hạn khoa học
Đây là mô phỏng giáo dục. Phổ dùng định luật Kramers (phổ liên tục) và các vạch K của tungsten; biên độ vạch và hệ số hấp thụ (khớp thô theo ∝ E⁻³ cộng phần tán xạ) là mô hình định tính, không phải số liệu thực nghiệm và không dùng để thiết kế che chắn thực tế.
