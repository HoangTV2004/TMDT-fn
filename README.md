# 🏢 HTTMDT - Nền Tảng Thương Mại Điện Tử Tích Hợp

Chào mừng bạn đến với **HTTMDT**, hệ thống thương mại điện tử chuyên nghiệp được thiết kế với cấu trúc monorepo đồng bộ và hiệu năng cao. Hệ thống này bao gồm ứng dụng khách (client), máy chủ nghiệp vụ (backend API server), và máy chủ tệp tĩnh chuyên dụng (fileserver).

---

## 🗺️ Bản Đồ Tài Liệu Hướng Dẫn

Để bắt đầu tìm hiểu và thiết lập hệ thống, vui lòng truy cập các tài liệu chi tiết bên dưới phù hợp với nhu cầu phát triển của bạn:

| Hạng Mục | Đường Dẫn Tài Liệu | Vai Trò & Tóm Tắt Nhiệm Vụ |
| :--- | :--- | :--- |
| **Hệ Thống (System)** | [Tài liệu Hệ Thống 🔗](./README_SYSTEM.md) | Kiến trúc tổng quan toàn bộ monorepo, luồng dữ liệu liên lạc, và hướng dẫn cài đặt khởi chạy chung. |
| **Máy Chủ Backend** | [Tài liệu Backend 🔗](./cellphonex_server/README_BACKEND.md) | Toàn bộ nghiệp vụ API, lược đồ CSDL PostgreSQL, quy trình tính giá vốn Bình Quân Gia Quyền, OTP Redis và Socket.IO. |
| **Giao Diện Client** | [Tài liệu Client 🔗](./thegioibatdong2/README_CLIENT.md) | Hướng dẫn phát triển giao diện React 19 + Vite, quản lý phiên qua `localStorage`, luồng thanh toán và Chat Widget. |
| **Máy Chủ Tệp (Fileserver)** | [Tài liệu Fileserver 🔗](./fileserver/README_FILESERVER.md) | Hướng dẫn vận hành máy chủ phục vụ ảnh tĩnh phân loại theo danh mục/sản phẩm trên cổng 8081. |

---

## ⚙️ Cấu Hình Khởi Chạy Tự Rút Gọn

Hệ thống hoạt động trên 3 cổng mặc định sau:
- **Client (React + Vite)**: `http://localhost:5173`
- **Backend (Express API)**: `http://localhost:8080`
- **Static Fileserver (Asset Serve)**: `http://localhost:8081`

> [!NOTE]
> Hệ thống này sử dụng cấu trúc xác thực trực tiếp dựa trên trạng thái CSDL kết hợp xác minh OTP qua Redis Cloud và không áp dụng cơ chế mã hóa token JWT trung gian để duy trì phiên làm việc đồng bộ trực tiếp nhất.

---

*Tài liệu này phản ánh chính xác 100% cấu trúc mã nguồn thực tế đang hoạt động.*
