# Nhứt & Ngân — Our Wedding

Website thiệp cưới Romantic Classic, ưu tiên điện thoại, cho một liên kết dùng chung. Ảnh cưới được giữ nguyên bản: không có AI tạo/chỉnh khuôn mặt, không thay đổi tỷ lệ hoặc nội dung ảnh.

## Quick start

1. Cài Node.js 20.9+ và tạo dự án Supabase.
2. Sao chép `.env.example` thành `.env.local`, sau đó điền URL, anon key, service-role key và email quản trị.
3. Chạy migration trong `supabase/migrations/` bằng Supabase CLI hoặc SQL Editor.
4. Tạo người dùng Auth trong Supabase, sau đó thêm UUID/email của họ vào `public.admin_users`.
5. Chạy `npm install`, `npm run dev`, mở `http://localhost:3000`.

Xem `docs/` để thiết lập, kiến trúc, bảo mật và triển khai Vercel.
