# Environment variables

`NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` là thông tin client được Supabase thiết kế để công khai cùng RLS. `SUPABASE_SERVICE_ROLE_KEY` chỉ có ở Vercel server environment, tuyệt đối không có tiền tố `NEXT_PUBLIC_`. `NEXT_PUBLIC_SITE_URL` là canonical URL. `ADMIN_EMAIL` là allowlist quản trị ban đầu.
