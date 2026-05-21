# 📁 Máy Chủ Lưu Trữ Ảnh Tĩnh - `fileserver` (Static Asset Serving)

Máy chủ lưu trữ hình ảnh chuyên biệt (Dedicated Asset Server) phục vụ việc truyền phát hình ảnh sản phẩm và tài nguyên tĩnh nhanh chóng và tối giản.

---

## 📋 Tổng Quan Hoạt Động & Sự Khác Biệt Thực Tế

Trái ngược hoàn toàn với các kịch bản boilerplates phức tạp mô tả các cổng tải lên hình ảnh (Upload API), cơ chế xử lý luồng Multer hay nén ảnh Sharp, máy chủ `fileserver` trong hệ thống thực tế hoạt động như một **kho lưu trữ tệp tĩnh thuần túy (Read-only Static Content CDN)**:
- **Không có API tải lên ảnh (No Upload API)**: Tất cả hình ảnh sản phẩm, biểu ngữ và tài nguyên quảng cáo được phân loại thủ công hoặc lập chỉ mục trực tiếp trong các thư mục tương ứng.
- **Không dùng Multer & Sharp**: Loại bỏ hoàn toàn mã nguồn tải lên và bộ xử lý đồ họa để duy trì hiệu năng tải tệp tĩnh tối đa, giảm thiểu rủi ro bảo mật hệ thống (như tải lên mã độc từ phía người dùng).
- **Tách biệt Cổng Chạy (Port Isolation)**: Hoạt động cố định tại cổng `8081` để giải phóng băng thông cho Máy chủ API chính trên cổng `8080` và Giao diện khách hàng trên cổng `5173`.

---

## ⚙️ Hướng Dẫn Khởi Chạy

### Điều kiện chạy:
- Máy chủ đã cài đặt **Node.js** phiên bản 18+ trở lên.

### Các bước khởi động:

```bash
# 1. Di chuyển vào thư mục fileserver
cd fileserver

# 2. Tải dependencies (Express và các thư viện liên quan)
npm install

# 3. Khởi động máy chủ phục vụ tệp tĩnh
npm start
```

- **URL Phục Vụ CDN Cục Bộ**: `http://localhost:8081`

---

## 📁 Cấu Trúc Thư Mục Tài Nguyên Vật Lý

Hình ảnh và tài nguyên tĩnh trong thư mục `assets` được sắp xếp khoa học dựa trên phân loại danh mục sản phẩm của cơ sở dữ liệu để Client tự động tải động:

```
fileserver/
├── assets/                 # Thư mục chứa toàn bộ hình ảnh vật lý tĩnh
│   ├── 1/                  # Thư mục danh mục ID = 1 (Ví dụ: Điện thoại)
│   │   ├── pv123/          # Thư mục ID biến thể sản phẩm cụ thể
│   │   │   ├── main.png    # Ảnh đại diện chính
│   │   │   ├── detail1.jpg # Ảnh chi tiết sản phẩm màu tương ứng
│   │   │   └── ...
│   │   └── ...
│   ├── 2/                  # Thư mục danh mục ID = 2 (Ví dụ: Phụ kiện)
│   └── ...
│
├── PhotoRouter.jsx         # Bộ định tuyến API siêu dữ liệu đường dẫn ảnh
├── index.jsx               # Mã nguồn khởi tạo Express static server
└── package.json            # Thư viện sử dụng và kịch bản khởi chạy
```

---

## 🔌 Chi Tiết Khai Báo Các Điểm Cuối (API Endpoints)

Máy chủ tệp tĩnh chỉ tiếp nhận và xử lý các yêu cầu lấy thông tin thông qua hai cơ chế sau:

### 1️⃣ Khớp Đường Dẫn Phục Vụ Ảnh Tĩnh (Static Route Serving)
Toàn bộ nội dung trong thư mục vật lý `assets` được phơi bày trực tiếp ra ngoài thông qua đường dẫn tiền tố `/images`:

```
GET /images/:category_id/:product_id/:file_name
```
- **Ví dụ thực tế**: Khi khách hàng tải ảnh sản phẩm, trình duyệt sẽ gửi yêu cầu trực tiếp đến:
  `http://localhost:8081/images/1/pv123/main.png`
  Hệ thống sẽ ngay lập tức phản hồi file ảnh vật lý nằm tại:
  `fileserver/assets/1/pv123/main.png`

### 2️⃣ API Bộ Định Tuyến Siêu Dữ Liệu Ảnh (`/photo`)
Tất cả các định tuyến bổ trợ được ánh xạ dưới tiền tố `/photo` thông qua `PhotoRouter.jsx`:

#### **Lấy Đường Dẫn Động của Ảnh**
- **Định tuyến**: `GET /photo/view/:category/:fileName`
- **Mô tả**: Trả về siêu dữ liệu dạng JSON chứa URL đầy đủ của tệp ảnh tĩnh để Client lưu trữ hoặc xử lý nâng cao.
- **Tham số**:
  - `category`: Tên danh mục (ví dụ: `1`, `banners`, v.v.)
  - `fileName`: Tên file cụ thể (ví dụ: `main.png`)
- **Phản hồi mẫu (JSON)**:
  ```json
  {
    "url": "http://localhost:8081/images/1/main.png"
  }
  ```

#### **Kiểm Tra Trạng Thái Hoạt Động (Health Check)**
- **Định tuyến**: `GET /photo/`
- **Mô tả**: Ghi nhật ký trạng thái hoạt động lên màn hình console máy chủ và kiểm tra tính kết nối.
- **Phản hồi**:
  `"File server đã sẵn sàng ở cổng 8081!"`

---

## 📦 Danh Sách Thư Viện Sử Dụng (package.json)

Để duy trì tính gọn nhẹ và tối ưu bộ nhớ đệm, máy chủ chỉ cài đặt tối giản 3 thư viện cần thiết:

| Thư Viện | Phiên Bản | Vai Trò Trong Hệ Thống |
| :--- | :--- | :--- |
| **express** | `5.2.1` | Máy chủ xử lý định tuyến và tĩnh |
| **cors** | `2.8.6` | Cho phép chia sẻ tài nguyên nguồn gốc chéo (CORS) từ Client và API chính |
| **body-parser**| `2.2.2` | Hỗ trợ phân tích cú pháp dữ liệu JSON truyền vào |

---

## 🚨 Khắc Phục Lỗi Fileserver Thường Gặp

### ❌ Lỗi: Ảnh tải lên từ cơ sở dữ liệu bị vỡ hoặc báo lỗi 404
- **Giải pháp**: 
  1. Đảm bảo cấu trúc thư mục chứa ảnh trùng khớp 100% với giá trị `category_id` và `product_id` trong PostgreSQL.
  2. Kiểm tra quyền đọc của thư mục `assets` trên hệ điều hành (đặc biệt là Linux/Windows Server trong môi trường production).
  3. Đảm bảo cổng `8081` không bị tiến trình khác chiếm dụng.

---

*Cập nhật lần cuối: 2026 | fileserver CDN Team*
