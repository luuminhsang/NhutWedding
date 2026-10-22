# Database

Migration ban đầu tạo settings, couple profile, families, content sections, events/timeline/locations, albums/media, RSVP và lựa chọn sự kiện, guestbook, gift accounts, admin users, publication versions và audit logs.

Mọi bảng bật RLS. Anonymous không thể đọc RSVP hay dữ liệu quản trị. Chỉ message `approved` có consent mới được public đọc; server API sử dụng service role sau Zod validation. Lưu ảnh gốc tại Supabase Storage bằng `storage_path`; bản tối ưu, nếu có, phải là file riêng.
