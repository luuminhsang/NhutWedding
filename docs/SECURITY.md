# Security model

RSVP/guestbook được Zod kiểm tra ở server, giới hạn độ dài, giới hạn tần suất trong memory và không có đọc public. Guestbook mặc định `pending`; React render text an toàn và public query chỉ lấy bản được duyệt. Production nên thay rate limiter in-memory bằng Upstash/Cloudflare KV và thêm proxy-aware IP handling. Bật Supabase Auth email confirmation, MFA cho admin và Storage policies trước khi công bố.
