# Kết nối Google Sheets

File nhận dữ liệu: https://docs.google.com/spreadsheets/d/14ITJaywO1NxONPjaQpBNvMYEEy1eSdXHtcUz3mr7iXw/edit

Ba tab đã chuẩn bị: `RSVP`, `Lời chúc`, `Tổng hợp`. Giữ nguyên hàng tiêu đề để tránh ghi sai cột.

## Trạng thái kết nối và dữ liệu công khai

Kiểm tra mới nhất ngày 22/10/2026, khoảng 14:38 (giờ Việt Nam): kết nối thành công. Hai API `/api/rsvp` và `/api/guestbook` trên website local trả HTTP 201; đã đối chiếu dữ liệu ghi thật trong đúng hai tab `RSVP` và `Lời chúc`. Gửi lại cùng mã RSVP vẫn chỉ có một dòng. Hai dòng thử đã được dọn sau khi kiểm tra. Sheet cho phép bất kỳ ai có liên kết xem.

Nếu lỗi `{"ok":false}` xuất hiện lại: đối chiếu `WEBHOOK_SECRET` trong **Apps Script → Cài đặt dự án → Thuộc tính tập lệnh** với `GOOGLE_SHEETS_WEBHOOK_SECRET` trong `.env.local`. Không đưa khóa vào chat hoặc mã nguồn phía trình duyệt. Nếu khóa đã trùng, kiểm tra tài khoản thực thi có quyền chỉnh sửa Sheet và cập nhật bản triển khai sang phiên bản chứa toàn bộ `Code.gs` hiện tại. Sau đó chạy lại lệnh kiểm tra bên dưới.

Hai biểu mẫu lưu khi khách tích đồng ý và bấm **Gửi xác nhận** hoặc **Gửi lời chúc**. Không gửi bản nháp đang nhập. Giao diện thông báo dữ liệu sẽ công khai trong Sheet, bao gồm thông tin liên hệ nếu khách cung cấp; checkbox yêu cầu khách đồng ý trước khi gửi. Trạng thái `Chờ duyệt` của lời chúc chỉ dùng cho việc gia đình xem xét hiển thị trên website, không ẩn dòng dữ liệu trong Sheet công khai.

## Lỗi trước đây: bản triển khai thiếu `doPost`

Lần kiểm tra trước ngày 22/10/2026 ghi nhận endpoint trả về **Không tìm thấy hàm tập lệnh: doPost**. Nếu lỗi này xuất hiện lại, thực hiện các bước sau.

1. Mở đúng dự án Apps Script của URL đang cấu hình trong `.env.local`.
2. Đưa toàn bộ nội dung file `Code.gs` trong thư mục này vào tệp mã Apps Script và lưu. Mã cần có hàm `doPost(event)` ở cấp cao nhất, không nằm bên trong `myFunction` hay hàm khác.
3. Chạy `setupIntegration` nếu chưa chạy; đối chiếu thuộc tính `WEBHOOK_SECRET` với khóa trong `.env.local` mà không đưa khóa lên chat.
4. Chọn **Triển khai → Quản lý các bản triển khai → chọn bản đang dùng → Chỉnh sửa (bút chì) → Phiên bản mới → Triển khai**. Giữ nguyên URL hiện tại. Chỉ bấm Lưu trong trình soạn thảo không cập nhật bản `/exec`.
5. Chạy lại `node --env-file=.env.local integrations/google-sheets/check-connection.mjs` từ thư mục dự án. Khi kết nối đạt, gửi thử hai biểu mẫu và đối chiếu các hàng trong Sheet.

Tham khảo: https://developers.google.com/apps-script/concepts/deployments#edit_a_versioned_deployment

## 1. Cấp quyền và triển khai cầu nối

1. Trong file Sheet trên, chọn **Tiện ích mở rộng → Apps Script**.
2. Dán toàn bộ nội dung `Code.gs` vào trình soạn thảo và lưu.
3. Chạy hàm `setupIntegration`, cấp quyền với tài khoản sở hữu Sheet.
4. Vào **Cài đặt dự án → Thuộc tính tập lệnh**, sao chép giá trị `WEBHOOK_SECRET` để điền ở bước 2. Không gửi khóa này trong chat.
5. Chọn **Triển khai → Lần triển khai mới → Ứng dụng web**. Thực thi với tư cách **Tôi**, quyền truy cập **Bất kỳ ai**. Endpoint kiểm tra chữ ký HMAC trước khi ghi dữ liệu; không đổi quyền chia sẻ của file Sheet.
6. Sao chép URL ứng dụng web kết thúc bằng `/exec`. Nếu chỉnh code sau này, cập nhật lần triển khai sang phiên bản mới.

Chỉ chủ tài khoản mới thực hiện bước cấp quyền. Nếu tổ chức không cho phép quyền Bất kỳ ai, cần phương án xác thực khác; không công khai file Sheet để khắc phục.

## 2. Cấu hình website

Thêm vào `.env.local` (file này được git bỏ qua):

```dotenv
SUBMISSIONS_STORAGE=google_sheets
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/MA_TRIEN_KHAI/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=GIA_TRI_TU_THUOC_TINH_TAP_LENH
```

Không đặt tiền tố `NEXT_PUBLIC_` cho hai biến webhook. Khởi động lại website. Với bản online, đặt ba biến này trong môi trường máy chủ rồi triển khai lại.

Chế độ `google_sheets` lưu phản hồi mới trực tiếp vào Sheet và không yêu cầu Supabase. Không ghi đồng thời sang Supabase; trang admin Supabase không hiển thị những bản ghi này. Dữ liệu cũ chưa được chuyển. Giữ `SUBMISSIONS_STORAGE=supabase` để dùng luồng cũ.

## 3. Kiểm tra kết nối

Chạy `node --env-file=.env.local integrations/google-sheets/check-connection.mjs`. Kiểm tra này có chữ ký, xác minh đúng các tab và tiêu đề, không thêm dòng thử.

Sau đó gửi một RSVP và một lời chúc thử từ website, kiểm tra cả hai dòng và số tổng hợp. Mỗi lần gửi có mã riêng; gửi lại cùng dữ liệu sau lỗi mạng trong cùng phiên trang sẽ không thêm dòng trùng. Tải lại trang tạo phiên gửi mới.

Chỉ báo thành công sau khi Sheet xác nhận đã lưu. Lời chúc luôn bắt đầu ở `Chờ duyệt`; chỉnh trạng thái trong Sheet phục vụ theo dõi, chưa tự xuất bản lời chúc lên website.

Số điện thoại lưu dạng văn bản để giữ số 0 đầu. Thời gian hiển thị theo Việt Nam. Nội dung do khách nhập được xử lý như văn bản, không thực thi thành công thức.

Tài liệu Google: https://developers.google.com/apps-script/guides/web
