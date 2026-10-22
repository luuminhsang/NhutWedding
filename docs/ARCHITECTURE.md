# Architecture

Next.js App Router phục vụ giao diện và API routes. Supabase cung cấp Postgres, Auth và Storage. Public pages chỉ nên đọc snapshot `published`; dữ liệu RSVP luôn đi qua server route có xác thực dữ liệu, mã xác nhận và giới hạn tần suất. Service-role key chỉ được dùng trên server.

`app/` chứa public/admin/API, `lib/` chứa Supabase, validation và security, `supabase/migrations/` giữ cấu trúc database, `tests/` chứa kiểm thử đơn vị.
