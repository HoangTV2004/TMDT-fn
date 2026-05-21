# 🏢 HTTMDT - Nền Tảng Thương Mại Điện Tử Monorepo (Tài Liệu Hệ Thống)

Nền tảng **HTTMDT** là một hệ thống thương mại điện tử chuyên nghiệp được thiết kế dưới dạng cấu trúc Monorepo đồng bộ. Hệ thống phục vụ kinh doanh bán lẻ với khả năng cập nhật thời gian thực, cơ chế tính giá vốn hàng bán chính xác và khả năng tự phục vụ tài nguyên tĩnh tách biệt.

---

## 📁 Cấu Trúc Monorepo Thực Tế

Hệ thống được tổ chức thành 3 thành phần chính hoạt động độc lập và liên kết qua giao thức HTTP RESTful và WebSocket (Socket.IO):

```
HTTMDT/
├── thegioibatdong2/        # 🎨 Giao Diện Client (React 19)
│   ├── src/
│   │   ├── components/     # Các thành phần tái sử dụng (Chat Widget, Admin layouts, v.v.)
│   │   ├── pages/          # Giao diện trang (Home, Checkout, Auth, Admin Dashboard, v.v.)
│   │   ├── context/        # Quản lý trạng thái React Context (AuthContext, CartContext)
│   │   └── App.jsx         # Khai báo định tuyến (React Router v7) và phân quyền
│   ├── package.json        # Định nghĩa các thư viện React 19 và công cụ build Vite
│   └── README_CLIENT.md    # Tài liệu chi tiết phần giao diện khách hàng
│
├── cellphonex_server/      # ⚙️ Máy Chủ Nghiệp Vụ API (Node.js & Express)
│   ├── products/           # Định tuyến sản phẩm, giỏ hàng, đơn hàng, hóa đơn nhập và khuyến mãi
│   ├── users/              # Đăng ký, đăng nhập trực tiếp, và xác thực OTP
│   ├── address/            # Quản lý địa chỉ giao hàng và danh sách chi nhánh cửa hàng
│   ├── shipping/           # Tích hợp dịch vụ giao vận Viettel Post
│   ├── statistics/         # Báo cáo doanh số và phân tích quản trị
│   ├── otp/                # Dịch vụ gửi OTP xác thực qua email
│   ├── services/           # Nghiệp vụ lõi (Kho hàng Bình Quân Gia Quyền, dọn dẹp cron job)
│   ├── index.js            # Entrypoint chính tích hợp HTTP API & Socket.IO
│   └── README_BACKEND.md   # Tài liệu chi tiết nghiệp vụ máy chủ API
│
├── fileserver/             # 📁 Máy Chủ Ảnh & Tài Nguyên Tĩnh Chuyên Dụng
│   ├── assets/             # Thư mục lưu trữ vật lý các file ảnh được sắp xếp theo danh mục
│   ├── PhotoRouter.jsx     # Xử lý trả về siêu dữ liệu ảnh và định tuyến nội bộ
│   ├── index.jsx           # Điểm chạy máy chủ phục vụ file tĩnh trên cổng 8081
│   └── README_FILESERVER.md# Tài liệu chi tiết phần phục vụ hình ảnh tĩnh
│
└── README.md               # Chỉ mục chỉ dẫn tài liệu gốc
```

---

## 🔄 Kiến Trúc Luồng Hoạt Động & Sự Khác Biệt Công Nghệ

Hệ thống HTTMDT được tinh chỉnh đặc thù so với các mô hình Boilerplate thông thường:

```
                  ┌─────────────────────────────────────┐
                  │          CLIENT (React 19)          │
                  │  Cổng 5173 / thegioibatdong.site    │
                  └──────┬───────────────────────▲──────┘
                         │                       │
              HTTP REST  │                       │ Socket.IO
              (Axios)    │                       │ (Real-time Events)
                         ▼                       │
                  ┌──────────────────────────────┴──────┐
                  │       BACKEND (Express API)         │
                  │ Cổng 8080 / api.thegioibatdong.site │
                  └──────┬──────────────┬────────▲──────┘
                         │              │        │
             PostgreSQL  │        Upstash│        │ Static Serve
              (Supabase) │        Redis  │        │ (Port 8081)
                         ▼              ▼        ▼
                   ┌──────────┐   ┌──────────┐  ┌─────────────┐
                   │ Database │   │ OTP/Reset│  │ Fileserver  │
                   │  Store   │   │  Cache   │  │ Assets Serve│
                   └──────────┘   └──────────┘  └─────────────┘
```

1. **Xác Thực Trực Tiếp (Không Dùng JWT)**: 
   Phiên làm việc của người dùng được xác thực hoàn toàn dựa trên so khớp mật khẩu bằng `bcrypt` khi đăng nhập. Khi thành công, thông tin người dùng được phản hồi và lưu trữ trực tiếp tại `localStorage` ở Client. Các yêu cầu thay đổi tài khoản hoặc tác vụ thanh toán sẽ so sánh thông tin người dùng trực tiếp qua CSDL thông qua các định dạng định tuyến tham số đầu vào.
2. **Hệ Thống Quản Lý Giá Vốn & Tồn Kho (Bình Quân Gia Quyền)**:
   - Khi nhập hàng mới, Variant `price_base` sẽ tự động tính lại theo công thức Bình Quân Gia Quyền.
   - Khi xác nhận đơn hoặc thanh toán trực tiếp, giá vốn dòng hàng sẽ được tính theo tỉ lệ số lượng mua chia cho tồn kho hiện tại nhân với tổng giá trị kho vật lý và ghi nhận tại `order_details.total_cost`.
   - Nếu đơn hàng bị hủy hoặc hoàn trả (Trạng thái `5` hoặc `6`), cả số lượng vật lý và cục giá vốn đã trừ sẽ được cộng trả nguyên vẹn về kho để đảm bảo không thất thoát dòng tiền kế toán.
3. **Upstash Redis Cloud**:
   Lưu trữ và đối chiếu mã OTP đăng ký tài khoản cùng mã Token khôi phục mật khẩu ngắn hạn để bảo mật tối ưu giao dịch trước khi cập nhật PostgreSQL.
4. **Fileserver Tách Biệt Phục Vụ Ảnh Tĩnh**:
   Máy chủ tệp hoạt động độc lập trên cổng `8081`, serve trực tiếp thư mục vật lý `assets` thông qua `/images`. Nó không chứa các luồng tải lên ảnh (Upload API), không dùng Multer hay Sharp, mà đóng vai trò là một CDN nội bộ phục vụ ảnh cấu trúc theo danh mục dạng: `/images/:category_id/:product_id/:file_name`.

---

## 🚀 Hướng Dẫn Thiết Lập & Khởi Chạy Nhanh

### 1️⃣ Cài đặt Thư viện
Truy cập vào từng thư mục thành phần để tải dependencies:
```bash
# Cài đặt thư viện Client
cd thegioibatdong2
npm install

# Cài đặt thư viện Backend
cd ../cellphonex_server
npm install

# Cài đặt thư viện Fileserver
cd ../fileserver
npm install
```

### 2️⃣ Thiết lập File Môi Trường (.env)

Hệ thống yêu cầu các cấu hình biến môi trường chính xác như sau:

#### **cellphonex_server/.env:**
```env
# Kết nối Supabase PostgreSQL Pooler
DATABASE_URL="postgresql://<user>:<password>@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# Kết nối Upstash Redis Cloud
REDIS_URL="rediss://default:<token>@accurate-kangaroo-71323.upstash.io:6379"

# Gmail SMTP gửi mã OTP xác thực đăng ký & khôi phục tài khoản
OTP_GMAIL="xacthucthegioibatdong@gmail.com"
OTP_PASSWORD="odmz otqc yzuo kdcn"

# Cấu hình kết nối Google OAuth
GOOGLE_CLIENT_ID="159567449494-4l73lc7s407p4nhl41p1hfff46b82dba.apps.googleusercontent.com"

# API tích hợp cổng thanh toán trực tuyến PayOS
PAYOS_CLIENT_ID="590f98a8-3d82-49cf-a8f3-8ea5492a0f68"
PAYOS_API_KEY="be8f3981-898b-4061-8bdd-93442077e8e6"
PAYOS_CHECKSUM_KEY="b3d3e0b9833172ddd708ce48ad0dfdd8c9b313b1c4620da4429870bdfe484b67"

# Cấu hình URL Domain hoạt động của Client và API Server
CLIENT_URL="https://thegioibatdong.site"
SERVER_URL="https://api.thegioibatdong.site"
```

#### **thegioibatdong2/.env:**
```env
# Liên kết kết nối API backend & Asset static server
VITE_SERVER_API="https://api.thegioibatdong.site"
VITE_PHOTO_SERVER_API="https://assets.thegioibatdong.site/images"

# Tích hợp tìm kiếm địa điểm bản đồ Goong API
VITE_GOONG_API_KEY="your_goong_api_key_here"

# Cấu hình Google Client ID đồng bộ
VITE_GOOGLE_CLIENT_ID="159567449494-4l73lc7s407p4nhl41p1hfff46b82dba.apps.googleusercontent.com"
```

#### **fileserver/.env:**
*(Không bắt buộc)* - Fileserver chạy mặc định không tải biến môi trường, tự động khởi chạy cố định trên cổng `8081`.

---

## 🖥️ Hướng Dẫn Vận Hành Môi Trường Phát Triển

Để chạy toàn bộ hệ thống cục bộ:

```bash
# Terminal 1: Khởi chạy máy chủ Backend (Port 8080)
cd cellphonex_server
npm run dev

# Terminal 2: Khởi chạy giao diện Client (Port 5173)
cd thegioibatdong2
npm run dev

# Terminal 3: Khởi chạy máy chủ phục vụ ảnh tĩnh (Port 8081)
cd fileserver
npm start
```

---

## 🛠️ Công Nghệ & Phiên Bản Lõi Hệ Thống

| Tên Lớp Hệ Thống | Công Nghệ Lõi | Phiên Bản | Ghi Chú Tính Năng Thực Tế |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `19.0.0` | Thư viện giao diện chính hiệu năng cao |
| **Build Tool** | Vite | `7.2.4` | Đóng gói tài nguyên cực nhanh |
| **Real-time Client**| Socket.IO Client | `4.8.3` | Nhận tin nhắn chat, trạng thái PayOS tức thời |
| **HTTP Client** | Axios | `1.13.6` | Gửi yêu cầu REST API đồng bộ |
| **Backend Framework**| Express | `5.2.1` | Lớp máy chủ xử lý API dịch vụ |
| **CSDL Quan Hệ** | PostgreSQL / Supabase | `14+` | Kho lưu trữ dữ liệu sản phẩm, đơn hàng, người dùng |
| **Trình Khách DB** | Postgres.js | `3.4.8` | Trình khách SQL tốc độ cao và an toàn |
| **Bộ Nhớ Tạm** | Upstash Redis Cloud | `V7+` | Lưu trữ OTP và mã khôi phục password |
| **Cổng Thanh Toán** | PayOS SDK | `2.0.5` | Đồng bộ thanh toán trực tiếp qua VietQR |
| **Thư Điện Tử** | Nodemailer | `8.0.4` | Tự động gửi mã OTP xác nhận tài khoản |

---

## 🚨 Khắc Phục Sự Cố Thường Gặp (Troubleshooting)

### ❌ Không Thể Gửi/Xác Nhận OTP Đăng Ký
- **Nguyên nhân**: Kết nối Redis Cloud bị gián đoạn hoặc bị chặn IP, hoặc thông số tài khoản gửi Gmail SMTP bị thay đổi.
- **Giải pháp**: Kiểm tra tính khả dụng của biến `REDIS_URL` trên Upstash Console. Đảm bảo mật khẩu ứng dụng Gmail (`OTP_PASSWORD`) còn hiệu lực và không bị thu hồi bởi chính sách bảo mật của Google.

### ❌ Ảnh Sản Phẩm Trả Về Lỗi 404 hoặc Không Tải Được
- **Nguyên nhân**: Máy chủ tệp (Fileserver) trên cổng `8081` chưa được kích hoạt, hoặc đường dẫn ảnh tĩnh trong cơ sở dữ liệu bị sai định dạng.
- **Giải pháp**: Đảm bảo cổng `8081` đang mở bằng cách truy cập thử vào `http://localhost:8081/photo`. Ảnh phải được lưu chính xác trong cấu trúc thư mục vật lý tại `fileserver/assets/:category_id/:product_id/:file_name`.

---

*Cập nhật lần cuối: 2026 | Đội Ngũ Phát Triển HTTMDT*
