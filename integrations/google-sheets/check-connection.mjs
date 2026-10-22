import { createHmac } from "node:crypto";

const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret || secret.length < 32) {
  console.error("Chưa cấu hình URL /exec và khóa webhook trong .env.local.");
  process.exit(1);
}
try {
  const payload = JSON.stringify({ kind: "health", timestamp: Date.now() });
  const signature = createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, signature }), signal: AbortSignal.timeout(15_000) });
  const body = await response.text();
  if (/(?:Không tìm thấy hàm tập lệnh|Script function not found)\s*:\s*doPost/i.test(body)) {
    console.error("Bản Apps Script đang triển khai thiếu hàm doPost. Dán đầy đủ integrations/google-sheets/Code.gs, lưu rồi vào Triển khai > Quản lý các bản triển khai > Chỉnh sửa > Phiên bản mới > Triển khai. Chỉ lưu code chưa cập nhật URL /exec.");
    process.exitCode = 1;
  } else if (!response.ok) {
    console.error(`Google Apps Script trả về HTTP ${response.status}. Kiểm tra URL /exec và quyền truy cập bản triển khai.`);
    process.exitCode = 1;
  } else {
    let receipt;
    try { receipt = JSON.parse(body); } catch {
      throw new Error("invalid response");
    }
    if (receipt?.ok === false) {
      console.error("Apps Script đã phản hồi nhưng từ chối yêu cầu (ok: false). Đối chiếu WEBHOOK_SECRET trong Thuộc tính tập lệnh với GOOGLE_SHEETS_WEBHOOK_SECRET trong .env.local; kiểm tra quyền truy cập Sheet, tiêu đề hai tab và bản triển khai có dùng Code.gs mới nhất. Không gửi khóa vào chat.");
      process.exitCode = 1;
    } else if (receipt?.ok !== true || receipt?.kind !== "health") {
      throw new Error("not confirmed");
    } else {
      console.log("Kết nối Google Sheets thành công. Hai tab và tiêu đề hợp lệ. Không thêm dữ liệu thử.");
    }
  }
} catch {
  console.error("Chưa kết nối được. Kiểm tra URL triển khai, quyền truy cập, khóa webhook và tiêu đề hai tab.");
  process.exitCode = 1;
}
