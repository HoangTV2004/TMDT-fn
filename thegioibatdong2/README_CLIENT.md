# 🎨 Giao Diện Khách Hàng - `thegioibatdong2` (Client Side)

Ứng dụng giao diện người dùng đầu cuối (Client Web App) của hệ thống thương mại điện tử, được xây dựng dựa trên React 19 và tối ưu hóa hiệu năng phản hồi thời gian thực.

---

## 📋 Tổng Quan Công Nghệ Giao Diện

Thành phần Client được thiết kế trên các giải pháp công nghệ hiện đại bậc nhất:
- **React 19**: Phiên bản React mới nhất với khả năng xử lý trạng thái tối ưu.
- **Vite**: Bộ công cụ đóng gói và biên dịch siêu tốc thay thế hoàn hảo cho CRA truyền thống.
- **TailwindCSS**: CSS framework lớp tiện ích (utility-first) xây dựng giao diện tùy chỉnh và nhất quán.
- **Socket.IO Client**: Kết nối liên lạc hai chiều trực tiếp phục vụ chat trực tuyến và cập nhật trạng thái hóa đơn PayOS tức thời.
- **React Router (v7)**: Điều hướng trang Client-side (Single Page Application) phân cấp bảo vệ tuyến đường theo phân quyền người dùng.

---

## ⚙️ Cài Đặt & Chạy Môi Trường Phát Triển

### Điều kiện tiên quyết:
- Đã cài đặt **Node.js** phiên bản 18+ trở lên.
- Trình quản lý gói **npm** đi kèm Node.js.

### Quy trình khởi tạo phát triển:

```bash
# 1. Di chuyển vào thư mục giao diện người dùng
cd thegioibatdong2

# 2. Tải toàn bộ thư viện liên quan
npm install

# 3. Tạo file cấu hình môi trường phát triển
# Sao chép mẫu cấu hình thực tế bên dưới vào file `.env`
cat > .env << EOF
VITE_SERVER_API=https://api.thegioibatdong.site
VITE_PHOTO_SERVER_API=https://assets.thegioibatdong.site/images
VITE_GOONG_API_KEY=your_goong_api_key_here
VITE_GOOGLE_CLIENT_ID=159567449494-4l73lc7s407p4nhl41p1hfff46b82dba.apps.googleusercontent.com
EOF

# 4. Khởi động máy chủ dev cục bộ trên cổng 5173
npm run dev
```

- **URL Chạy Cục Bộ**: `http://localhost:5173`
- **Đóng gói production**: `npm run build`

---

## 📁 Cấu Trúc Mã Nguồn Thực Tế

Thư mục mã nguồn client được tổ chức khoa học và nhất quán theo module tính năng:

```
src/
├── components/           # Các thành phần giao diện dùng chung
│   ├── Admin/           # Thành phần bổ trợ trang quản trị (Sidebar, Forms, v.v.)
│   ├── Auth/            # Thành phần bảo vệ định tuyến (ProtectedRoute.jsx)
│   ├── Header/          # Thanh điều hướng đầu trang (MainHeader.jsx, CategoryBar.jsx)
│   ├── Chat/            # Hộp chat nổi và giao diện chat admin (AdminChatManager.jsx)
│   └── Layout/          # Khung trang bao quát (MainLayout.jsx, AdminLayout.jsx)
│
├── pages/               # Các trang giao diện chính
│   ├── Home/            # Trang chủ hiển thị danh mục và danh sách sản phẩm
│   ├── Pagelist/        # Trang danh sách sản phẩm phân trang lọc danh mục
│   ├── Auth/            # Đăng ký, đăng nhập, khôi phục mật khẩu, trang cá nhân (Profile.jsx)
│   ├── Cart/            # Giỏ hàng cá nhân (Cart.jsx)
│   ├── Checkout/        # Quy trình thanh toán nhiều bước (Checkout.jsx, PaymentQR.jsx)
│   └── Admin/           # Dashboard quản trị, quản lý hóa đơn, khuyến mãi, báo cáo, quản lý chat
│
├── context/            # Quản lý trạng thái toàn cục ứng dụng (React Context)
│   ├── AuthContext.jsx  # Lưu trữ trạng thái phiên đăng nhập trực tiếp
│   └── CartContext.jsx  # Quản lý số lượng giỏ hàng, cộng trừ vật phẩm đồng bộ CSDL
│
├── styles/             # Khởi tạo CSS toàn cục
│   └── index.css        # Khai báo cấu hình Tailwind CSS cốt lõi
│
├── App.jsx             # Điểm khai báo định tuyến chính của Client Router
└── main.jsx            # Entrypoint kết xuất ứng dụng React
```

---

## 🔐 Luồng Xác Thực Phiên Làm Việc (NO JWT)

Hệ thống HTTMDT **không áp dụng** tiêu chuẩn JWT Bearer trong việc gửi tiêu đề xác thực HTTP. Thay vào đó, toàn bộ phiên làm việc dựa trên trao đổi trực tiếp đối tượng người dùng:

```
1. Khách hàng Đăng nhập (Login.jsx) / Đăng ký qua OTP (Register.jsx)
   │
   ▼
2. Nhận kết quả thành công chứa đầy đủ đối tượng `user` từ máy chủ API
   │
   ▼
3. Lưu đối tượng `user` trực tiếp dưới dạng chuỗi JSON vào localStorage:
   localStorage.setItem('user', JSON.stringify(userData))
   │
   ▼
4. AuthContext tự động tải và kích hoạt trạng thái "isAuthenticated: true"
   │
   ▼
5. Các trang giỏ hàng/thanh toán/admin sử dụng trực tiếp user.id làm tham số gửi đi
```

### Sử dụng AuthContext trong React Components:
```javascript
import { useAuth } from '../../context/AuthContext';

export default function UserWidget() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <span>Xin chào, {user.full_name}</span>
                    <button onClick={logout}>Đăng xuất</button>
                </div>
            ) : (
                <a href="/login">Đăng nhập</a>
            )}
        </div>
    );
}
```

---

## 🛒 Quy Trình Thanh Toán Đa Bước & Giữ Hàng

Quy trình thanh toán tại Client được thiết kế đồng bộ chặt chẽ với logic giữ hàng của Backend để chống tranh chấp sản phẩm:

```
Bước 1: Khách hàng nhấn "Thanh toán" tại Giỏ hàng (Cart.jsx)
   │
   ▼
Bước 2: Hệ thống gửi yêu cầu giữ hàng (Phase 1) qua API `/api/order/reserve`
   │ (Backend sẽ khóa số lượng tồn kho variant tương ứng trong 15 phút)
   ▼
Bước 3: Nhận mã giữ hàng `reservation_id` cùng `payment_code` duy nhất
   │
   ▼
Bước 4: Chuyển hướng sang trang thanh toán /checkout/payment (PaymentQR.jsx)
   │
   ├─► Nếu chọn COD hoặc Chuyển khoản trực tiếp:
   │   Gọi API `/confirm` hoàn tất đơn hàng (Ghi nhận giá vốn Bình Quân Gia Quyền)
   │
   └─► Nếu chọn PayOS:
       Vẽ mã VietQR thanh toán tự động. Đồng thời Client lắng nghe sự kiện
       WebSocket từ Socket.IO: `payos_paid_${user_id}`.
       Khi người dùng chuyển khoản thành công, Server webhook sẽ phát tín hiệu
       qua Socket.IO làm Client tự động chuyển hướng sang trang đơn hàng thành công!
```

---

## 💬 Tương Tác Qua Socket.IO Client

Giao thức Socket.IO kết nối trực tiếp với cổng `8080` của API Server để cập nhật sự kiện thời gian thực:

### Sự kiện gửi đi (Emitters):
- `join_chat_room`: Đăng ký tham gia vào phòng chat định dạng `chat_${roomId}`.
- `send_chat_message`: Gửi tin nhắn thực tế đến phòng hỗ trợ.
- `mark_messages_read`: Báo cáo đã đọc tin nhắn trong phòng chat để xóa huy hiệu thông báo chưa đọc.
- `join_order_room`: Đăng ký nhận thông báo thay đổi trạng thái đơn hàng.

### Sự kiện nhận về (Listeners):
- `new_chat_message`: Nhận phản hồi tin nhắn mới tức thời từ Admin.
- `chat_rooms_updated`: Nhận thông báo cập nhật thay đổi danh sách chat của Admin.
- `payos_paid_{userId}`: Nhận sự kiện thông báo cổng PayOS xác nhận đã chuyển khoản thành công.

---

## 📦 Danh Sách Thư Viện Cốt Lõi (package.json)

| Thư Viện | Phiên Bản | Vai Trò Hệ Thống |
| :--- | :--- | :--- |
| **react** | `19.0.0` | Thư viện giao diện chính |
| **react-router-dom** | `7.13.0` | Công cụ định tuyến trang Client SPA |
| **tailwindcss** | `4.2.1` | Thiết kế giao diện trực quan |
| **axios** | `1.13.6` | Trình gửi yêu cầu HTTP đến Backend |
| **socket.io-client** | `4.8.3` | Tương tác WebSocket thời gian thực |
| **lucide-react** | `0.563.0` | Kho icon giao diện cao cấp |
| **react-hot-toast** | `2.6.0` | Trình kết xuất thông báo trạng thái popup đẹp mắt |
| **recharts** | `3.8.1` | Vẽ biểu đồ doanh thu phân tích tại Admin Dashboard |

---

## 🚨 Xử Lý Lỗi Frontend Hay Gặp

### ❌ Sự Cố: "Failed to connect to backend server"
- **Giải pháp**: Kiểm tra file `.env` đã khai báo đúng biến `VITE_SERVER_API` trùng với địa chỉ API Backend đang chạy (mặc định: `https://api.thegioibatdong.site` hoặc `http://localhost:8080`).

### ❌ Sự Cố: Ảnh sản phẩm không hiển thị (Báo lỗi 404 hoặc đường dẫn hỏng)
- **Giải pháp**: Giao diện Client lấy hình ảnh từ địa chỉ Static Server khai báo qua `VITE_PHOTO_SERVER_API` (mặc định: `https://assets.thegioibatdong.site/images` hoặc `http://localhost:8081/images`). Đảm bảo máy chủ tệp đang chạy bình thường trên cổng `8081`.

---

*Cập nhật lần cuối: 2026 | thegioibatdong2 Frontend*
