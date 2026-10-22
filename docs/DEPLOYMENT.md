# Deploy to Vercel

1. Đẩy repository lên GitHub/GitLab.
2. Import repository vào Vercel và thêm toàn bộ biến trong `ENVIRONMENT.md` cho Production/Preview.
3. Chạy migration Supabase, tạo storage bucket private `wedding-media`, storage policies admin-only write / signed URL read.
4. Thiết lập `NEXT_PUBLIC_SITE_URL` bằng URL Vercel (hoặc domain riêng), redeploy, sau đó kiểm tra QR, admin login và RSVP.

Vercel free tier phù hợp cho quy mô thiệp cưới nhỏ; kiểm tra quota ảnh/băng thông trước ngày cưới. Không coi Sites private preview là deployment Vercel production.
