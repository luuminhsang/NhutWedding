/** Paste into Extensions > Apps Script in the selected spreadsheet. */
const WEDDING_SHEET_ID = "14ITJaywO1NxONPjaQpBNvMYEEy1eSdXHtcUz3mr7iXw";
const HEADERS = {
  rsvp: ["Mã gửi", "Thời gian gửi (VN)", "Họ và tên", "Email / Số điện thoại", "Tham dự", "Số người", "Lời nhắn", "Đồng ý sử dụng thông tin", "Mã xác nhận", "Ghi chú gia đình"],
  guestbook: ["Mã gửi", "Thời gian gửi (VN)", "Tên hiển thị", "Lời chúc", "Đồng ý hiển thị sau duyệt", "Trạng thái duyệt", "Ghi chú gia đình"],
};

// Run once. Does not overwrite cells or print secrets in the execution log.
function setupIntegration() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty("WEBHOOK_SECRET")) {
    properties.setProperty("WEBHOOK_SECRET", Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, ""));
  }
  const book = SpreadsheetApp.openById(WEDDING_SHEET_ID);
  getVerifiedSheet_(book, "rsvp");
  getVerifiedSheet_(book, "guestbook");
}

function doPost(event) {
  let lock;
  try {
    const raw = event && event.postData && event.postData.contents;
    if (!raw || raw.length > 16000) return json_({ ok: false });
    const envelope = JSON.parse(raw);
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    if (!secret || secret.length < 32 || typeof envelope.payload !== "string" || typeof envelope.signature !== "string") return json_({ ok: false });
    const digest = Utilities.computeHmacSha256Signature(envelope.payload, secret, Utilities.Charset.UTF_8)
      .map(function(byte) { return (byte & 255).toString(16).padStart(2, "0"); }).join("");
    if (!sameSignature_(digest, envelope.signature)) return json_({ ok: false });
    const entry = JSON.parse(envelope.payload);
    if (!Number.isFinite(entry.timestamp) || Math.abs(Date.now() - entry.timestamp) > 300000) return json_({ ok: false });
    const book = SpreadsheetApp.openById(WEDDING_SHEET_ID);
    if (entry.kind === "health") {
      getVerifiedSheet_(book, "rsvp");
      getVerifiedSheet_(book, "guestbook");
      return json_({ ok: true, kind: "health" });
    }
    validateEntry_(entry);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return json_({ ok: false });
    const sheet = getVerifiedSheet_(book, entry.kind);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1).createTextFinder(entry.id).matchEntireCell(true).matchCase(true).findNext()) {
      return json_({ ok: true, id: entry.id, duplicate: true });
    }
    // Numeric spreadsheet date in Vietnam local time, independent of file timezone.
    const receivedAt = Date.now() / 86400000 + 25569 + 7 / 24;
    const data = entry.data;
    let row;
    let formats;
    if (entry.kind === "rsvp") {
      const labels = { attending: "Sẽ tham dự", unsure: "Chưa chắc chắn", declined: "Không tham dự" };
      row = [entry.id, receivedAt, text_(data.guest_name), text_(data.contact || ""), labels[data.attendance], data.guest_count, text_(data.message || ""), "Đã đồng ý", text_(data.confirmation_code), ""];
      formats = ["@", "dd/MM/yyyy HH:mm:ss", "@", "@", "@", "0", "@", "@", "@", "@"];
    } else {
      row = [entry.id, receivedAt, text_(data.display_name), text_(data.message), "Đã đồng ý", "Chờ duyệt", ""];
      formats = ["@", "dd/MM/yyyy HH:mm:ss", "@", "@", "@", "@", "@"];
    }
    if (lastRow + 1 > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    const target = sheet.getRange(lastRow + 1, 1, 1, row.length);
    target.setNumberFormats([formats]);
    target.setValues([row]);
    SpreadsheetApp.flush();
    // Summary metadata is optional; a display update must not invalidate a saved row.
    try {
      const summary = book.getSheetByName("Tổng hợp");
      if (summary) {
        summary.getRange("B3").setValue("Đang nhận dữ liệu từ website");
        summary.getRange("B4").setNumberFormat("dd/MM/yyyy HH:mm:ss").setValue(receivedAt);
      }
    } catch (_) { /* The source row is already saved. */ }
    return json_({ ok: true, id: entry.id });
  } catch (_) {
    // Never return submitted personal data, credentials or internal errors.
    return json_({ ok: false });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function getVerifiedSheet_(book, kind) {
  const sheet = book.getSheetByName(kind === "rsvp" ? "RSVP" : "Lời chúc");
  if (!sheet) throw new Error("Missing target sheet");
  const expected = HEADERS[kind];
  const actual = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  if (actual.some(function(value, index) { return value !== expected[index]; })) throw new Error("Unexpected sheet headers");
  return sheet;
}

function validateEntry_(entry) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entry.id || "")) throw new Error("Invalid id");
  const data = entry.data;
  if (!data || data.consent !== "on") throw new Error("Consent required");
  function textIsValid(value, min, max) { return typeof value === "string" && value.length >= min && value.length <= max; }
  if (entry.kind === "rsvp") {
    if (!textIsValid(data.guest_name, 2, 100) || !textIsValid(data.contact || "", 0, 120) || !textIsValid(data.message || "", 0, 500)) throw new Error("Invalid RSVP");
    if (["attending", "unsure", "declined"].indexOf(data.attendance) < 0 || !Number.isInteger(data.guest_count) || data.guest_count < 0 || data.guest_count > 10) throw new Error("Invalid attendance");
    if (data.attendance === "declined" && data.guest_count !== 0) throw new Error("Invalid guest count");
    if (!/^[A-F0-9]{10}$/.test(data.confirmation_code || "")) throw new Error("Invalid code");
  } else if (entry.kind === "guestbook") {
    if (!textIsValid(data.display_name, 2, 60) || !textIsValid(data.message, 3, 500) || data.consent_public_display !== true || data.status !== "pending") throw new Error("Invalid wish");
  } else throw new Error("Invalid kind");
}

function text_(value) {
  const text = String(value);
  return /^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text;
}

function sameSignature_(expected, actual) {
  if (!/^[a-f0-9]{64}$/.test(actual)) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index++) mismatch |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  return mismatch === 0;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
