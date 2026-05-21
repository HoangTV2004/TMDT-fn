# ⚙️ Máy Chủ API Backend - `cellphonex_server` (Server Side)

Dịch vụ máy chủ API trung tâm (Core API Server) xử lý toàn bộ cơ sở dữ liệu quan hệ, liên lạc thời gian thực, cổng thanh toán trực tuyến, và cơ chế tính giá vốn kế toán phức tạp.

---

## 📋 Tổng Quan Công Nghệ Backend

Thành phần Máy chủ được xây dựng trên nền tảng vững chắc:
- **Node.js & Express**: Framework phát triển API nhanh chóng và dễ dàng mở rộng.
- **Postgres.js**: Trình khách PostgreSQL gọn nhẹ, hiệu năng vượt trội, an toàn chống tấn công SQL Injection thông qua tính năng Truy vấn tham số hóa (Parameterized queries).
- **Socket.IO**: Thiết lập hạ tầng liên lạc hai chiều thời gian thực (WebSockets) cho hệ thống chat và thông báo tức thời.
- **Upstash Redis Cloud**: Lưu trữ cache phân tán siêu tốc để xử lý hết hạn mã OTP email và mã Token khôi phục mật khẩu.
- **Nodemailer**: Dịch vụ SMTP tự động gửi thư xác thực mã OTP đăng ký tài khoản.
- **PayOS Node SDK**: Tích hợp cổng thanh toán trực tuyến thế hệ mới qua mã QR ngân hàng.

---

## ⚙️ Cấu Hình Khởi Chạy Nhanh

### Cài đặt môi trường:
- Cần cài đặt **Node.js** phiên bản 18+.
- Cơ sở dữ liệu **PostgreSQL** quan hệ (mặc định cấu hình qua Supabase).

### Khởi chạy dịch vụ:

```bash
# 1. Di chuyển vào thư mục backend
cd cellphonex_server

# 2. Tải toàn bộ thư viện liên quan
npm install

# 3. Tạo file biến môi trường chi tiết (.env)
# Điền chính xác các khóa bảo mật và URL kết nối
cat > .env << EOF
DATABASE_URL="postgresql://user:password@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
REDIS_URL="rediss://default:token@accurate-kangaroo-71323.upstash.io:6379"
OTP_GMAIL="xacthucthegioibatdong@gmail.com"
OTP_PASSWORD="odmz otqc yzuo kdcn"
GOOGLE_CLIENT_ID="159567449494-4l73lc7s407p4nhl41p1hfff46b82dba.apps.googleusercontent.com"
PAYOS_CLIENT_ID="your_payos_client_id"
PAYOS_API_KEY="your_payos_api_key"
PAYOS_CHECKSUM_KEY="your_payos_checksum_key"
CLIENT_URL="https://thegioibatdong.site"
SERVER_URL="https://api.thegioibatdong.site"
EOF

# 4. Chạy ở chế độ phát triển (Tự động tải lại mã nguồn qua nodemon)
npm run dev
```

- **URL API Server cục bộ**: `http://localhost:8080`
- **Tài liệu API Swagger**: `http://localhost:8080/api-docs` (Khi chạy server)

---

## 📁 Cấu Trúc Mã Nguồn Thực Tế

```
cellphonex_server/
├── products/               # Định tuyến & Logic liên quan đến Sản phẩm & Giao dịch
│   ├── ProductsRouter.jsx  # CRUD sản phẩm, hóa đơn nhập kho, tính lại giá vốn
│   ├── CartRouter.jsx      # Quản lý giỏ hàng trực tiếp dựa trên userId
│   ├── OrderRouter.jsx     # Xử lý đơn hàng, cập nhật trạng thái, hoàn kho hoàn tiền
│   ├── ReviewsRouter.jsx   # Xử lý bình luận và đánh giá sản phẩm từ khách hàng
│   ├── VouchersRouter.jsx  # Quản lý mã giảm giá (voucher) kiểm tra hạn dùng
│   └── PromotionsRouter.jsx# Thiết lập chương trình khuyến mãi giảm giá trực tiếp
│
├── users/                  # Quản lý định danh người dùng
│   ├── UsersRouter.jsx     # Đăng ký mã hóa bcrypt, OTP Redis, khôi phục mật khẩu
│   ├── GoogleAuthRouter.jsx# Xác thực đăng nhập qua liên kết tài khoản Google
│   └── AddressUserRouter.jsx# Địa chỉ nhận hàng của khách hàng
│
├── address/                # Quản lý phân vùng địa lý
│   ├── AddressRouter.jsx   # Bản đồ phân cấp Tỉnh/Thành, Quận/Huyện, Xã/Phường
│   └── StoreAddressRouter.jsx # Tọa độ định vị các chi nhánh cửa hàng vật lý
│
├── shipping/               # Cổng vận chuyển
│   └── ShippingServiceRouter.jsx # Tính toán giá ship tích hợp Viettel Post
│
├── statistics/             # Phân tích dữ liệu kế toán
│   └── StatisticsRouter.jsx # Thống kê doanh số, số đơn hàng, giá trị tồn kho
│
├── otp/                    # Gửi mã xác nhận email
│   └── OTP.jsx             # Dịch vụ gửi email Nodemailer
│
├── services/               # Nghiệp vụ lõi (Linh hồn của hệ thống kho)
│   ├── inventoryService.js # Giữ hàng Phase 1, chốt đơn Phase 2, hoàn kho, rollback
│   ├── reservationCleanup.js # Khởi chạy cron job quét giữ hàng hết hạn mỗi phút
│   └── generateQR.jsx      # Tạo mã QR chuyển khoản VietQR và Payment Code độc nhất
│
├── db.jsx                  # Thiết lập kết nối Pooler đến Supabase PostgreSQL
├── index.js                # Khởi tạo Express API, Socket.IO Server & Cron Jobs
└── package.json            # Định nghĩa dependencies và kịch bản khởi chạy
```

---

## 🗄️ Lược Đồ Cơ Sở Dữ Liệu Quan Trọng (PostgreSQL)

Hệ thống hoạt động trên cấu trúc PostgreSQL phân cấp chuẩn kế toán:

### 1. Bảng Biến Thể Sản Phẩm (`productvariant`)
Lưu trữ thông tin chi tiết từng phiên bản của sản phẩm bao gồm màu sắc và giá vốn.
```sql
CREATE TABLE productvariant (
  variant_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
  color_name VARCHAR(255) NOT NULL,
  color_code VARCHAR(50),
  price BIGINT NOT NULL,          -- Giá bán ra cho khách hàng
  price_base BIGINT DEFAULT 0,    -- Giá vốn bình quân gia quyền của biến thể
  local_gallery TEXT[]            -- Mảng ảnh của màu tương ứng
);
```

### 2. Bảng Tồn Kho Vật Lý (`productinventory`)
Theo dõi lượng tồn kho, lượng hàng đang bị khóa giữ tạm thời, và tổng giá trị tài sản tồn kho.
```sql
CREATE TABLE productinventory (
  variant_id INT PRIMARY KEY REFERENCES productvariant(variant_id) ON DELETE CASCADE,
  quantity INT DEFAULT 0,         -- Số lượng vật lý thực tế trong kho
  reserved INT DEFAULT 0,         -- Số lượng đang bị giữ tạm thời (Phase 1)
  total_value BIGINT DEFAULT 0,   -- Tổng giá trị tài sản kho hiện tại (quantity * price_base tích lũy)
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Bảng Giữ Hàng Tạm Thời (`inventory_reservations`)
Lưu trạng thái giữ hàng tạm trong 15 phút chống trùng thanh toán ngân hàng.
```sql
CREATE TABLE inventory_reservations (
  reservation_id UUID PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,           -- Chi tiết sản phẩm, số lượng, giá bán lúc giữ
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE' | 'SUPERSEDED' | 'EXPIRED' | 'CANCELLED' | 'CONFIRMED'
  expires_at TIMESTAMP NOT NULL,
  payment_code VARCHAR(20) UNIQUE NOT NULL, -- Mã thanh toán duy nhất chống va chạm VietQR
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Chi Tiết Hóa Đơn Bán (`order_details`)
Ghi nhận chính xác giá trị và giá vốn từng dòng hàng để tính toán biên lợi nhuận ròng.
```sql
CREATE TABLE order_details (
  order_detail_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price BIGINT NOT NULL,
  shipping_price INT DEFAULT 0,
  shipping_support_price INT DEFAULT 0,
  product_support_price INT DEFAULT 0,
  total_cost BIGINT DEFAULT 0    -- GIÁ VỐN HÀNG BÁN (COGS) thực tế tại thời điểm chốt đơn
);
```

---

## 📈 Cơ Chế Tính Giá Vốn Hàng Bán (Bình Quân Gia Quyền)

Hệ thống HTTMDT tích hợp động cơ tính toán giá vốn kế toán tự động qua 3 giai đoạn khép kín:

### 1️⃣ Khi Nhập Hàng Mới (Nhập Kho)
Khi thủ kho lập hóa đơn nhập thêm số lượng hàng $importQty$ với đơn giá nhập $importPrice$, hệ thống tự động cập nhật lại giá vốn variant $newPriceBase$ theo công thức Bình Quân Gia Quyền liên hoàn:

$$newPriceBase = \text{round}\left(\frac{(oldPriceBase \times oldQty) + (importPrice \times importQty)}{oldQty + importQty}\right)$$

Sau đó, hệ thống cập nhật tăng tương ứng $quantity$ và cộng lũy kế tiền vào $total\_value$ trong bảng `productinventory`.
*Mã nguồn thực tế: `cellphonex_server/products/ProductsRouter.jsx` dòng 736-760.*

### 2️⃣ Khi Xác Nhận Đơn Hàng hoặc Thanh Toán Trực Tiếp (Checkout)
Khi đơn hàng được chốt, hệ thống tính toán phần giá vốn bị trích ra (slicing) tương ứng với số lượng bán $qtySold$ dựa trên tổng giá trị tài sản kho hiện tại:

$$itemTotalCost = \text{round}\left(\frac{currentTotalValue}{currentQty} \times qtySold\right)$$

- Nếu số lượng mua vét sạch kho ($qtySold \ge currentQty$), hệ thống lấy toàn bộ tổng giá trị kho còn lại ($itemTotalCost = currentTotalValue$) để tránh sai số thập phân tích lũy.
- Giá trị $itemTotalCost$ được lưu cố định vào cột `total_cost` của dòng hàng tại bảng `order_details`.
- CSDL tự động trừ kho vật lý, giải phóng hàng giữ và trừ giá trị tài sản tồn kho:
  $$total\_value = total\_value - itemTotalCost$$
*Mã nguồn thực tế: `cellphonex_server/services/inventoryService.js` dòng 227-263.*

### 3️⃣ Khi Hủy Đơn Hàng hoặc Trả Hàng (Refund/Restoration)
Nếu khách hàng hủy đơn hoặc trả hàng hoàn tiền (Trạng thái đơn hàng đổi thành `5` hoặc `6`), để đảm bảo số liệu tài chính không bị lệch, hệ thống tự động hoàn nguyên toàn bộ số lượng hàng vật lý và cục giá vốn kế toán gốc đã lưu ở `order_details.total_cost` ngược lại kho:
```sql
UPDATE productinventory
SET quantity    = quantity + order_details.quantity,
    total_value = COALESCE(total_value, 0) + COALESCE(order_details.total_cost, 0),
    last_updated = CURRENT_TIMESTAMP
WHERE variant_id = order_details.variant_id
```
*Mã nguồn thực tế: `cellphonex_server/products/OrderRouter.jsx` dòng 307-323.*

---

## 🕒 Quy Trình Quét Giữ Hàng Tự Động (node-cron)

Để tránh tình trạng khách hàng "giữ chỗ" ảo sản phẩm làm cạn kiệt hàng bán khả dụng:
1. `services/reservationCleanup.js` khởi động một tiến trình chạy ngầm mỗi phút (`*/1 * * * *`).
2. Tiến trình gọi hàm `rollbackExpiredReservations()`.
3. Quét tất cả các bản ghi có trạng thái `ACTIVE` trong bảng `inventory_reservations` mà đã quá hạn (`expires_at < CURRENT_TIMESTAMP`).
4. Với mỗi phiên giữ hàng hết hạn, hệ thống tự động:
   - Cộng trả lại số lượng bị giữ vào cột `reserved` của bảng `productinventory`.
   - Cập nhật trạng thái phiên giữ thành `EXPIRED` để vô hiệu hóa thanh toán.

---

## 💬 Lược Đồ Sự Kiện WebSocket (Socket.IO)

Máy chủ Socket.IO chia sẻ cùng cổng `8080` của Express API để điều phối hai dịch vụ chính:

### 1. Luồng Chat Khách Hàng - Quản Trị
- **`join_chat_room`** (Nhận `roomId` từ Client): Đưa kết nối socket vào phòng `chat_${roomId}`.
- **`send_chat_message`** (Nhận payload tin nhắn):
  - Ghi nhận tin nhắn mới vào bảng `chat_messages` trong CSDL PostgreSQL.
  - Cập nhật dấu mốc thời gian hoạt động mới nhất tại bảng `chat_rooms`.
  - Phát sự kiện thời gian thực `new_chat_message` gửi tin nhắn đến tất cả thành viên trong phòng `chat_${roomId}`.
  - Phát thông báo toàn cục `chat_rooms_updated` đến Admin để sắp xếp lại danh sách hội thoại.
- **`mark_messages_read`** (Nhận `room_id` và `role`): Cập nhật toàn bộ tin nhắn chưa đọc của đối phương trong phòng thành `is_read = true` và phát lại `chat_rooms_updated`.

### 2. Luồng Thanh Toán Tức Thời
- **`join_order_room`** (Nhận `orderId`): Đưa kết nối của khách hàng vào phòng theo dõi đơn hàng `order_${orderId}`.
- **PayOS Webhook Redirect Sync**:
  Khi cổng PayOS gọi Webhook thành công thông báo đã nhận được tiền, Backend API xác minh chữ ký checksum hợp lệ, cập nhật trạng thái đơn hàng trong PostgreSQL và lập tức phát sự kiện:
  ```javascript
  io.emit(`payos_paid_${user_id}`, { success: true, order_id: orderId });
  ```
  Giúp trình duyệt khách hàng tự động chuyển hướng màn hình ngay lập tức mà không cần F5 trang.

---

*Cập nhật lần cuối: 2026 | cellphonex_server Backend Development Team*
