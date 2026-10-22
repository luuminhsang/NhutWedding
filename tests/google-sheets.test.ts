import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sendToGoogleSheets, type SheetSubmission } from "../lib/integrations/google-sheets";

const secret = "test-only-".repeat(8);
const submission: SheetSubmission = {
  id: "32a8ce5f-41e6-47f4-a4a0-bdb5566b1730", kind: "rsvp", created_at: "2026-10-22T09:00:00.000Z",
  data: { guest_name: "Khách thử", contact: "0900123456", attendance: "attending", guest_count: 2, message: "=1+1", consent: "on", confirmation_code: "32A8CE5F41" },
};
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Google Sheets server bridge", () => {
  function configure() {
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/test-deployment/exec");
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_SECRET", secret);
  }
  it("signs the exact payload and confirms the receipt id", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, id: submission.id })));
    vi.stubGlobal("fetch", fetchMock);
    await sendToGoogleSheets(submission);
    const envelope = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(envelope.signature).toBe(createHmac("sha256", secret).update(envelope.payload).digest("hex"));
    expect(JSON.parse(envelope.payload).data.contact).toBe("0900123456");
    expect(envelope).not.toHaveProperty("secret");
  });
  it.each([{ ok: false }, { ok: true, id: "wrong-id" }])("rejects an unconfirmed save: %j", async (receipt) => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(receipt))));
    await expect(sendToGoogleSheets(submission)).rejects.toThrow("did not confirm");
  });
  it("rejects missing configuration before a network request", async () => {
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_URL", "");
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    await expect(sendToGoogleSheets(submission)).rejects.toThrow("not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("propagates network failures", async () => {
    configure(); vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(sendToGoogleSheets(submission)).rejects.toThrow("timeout");
  });
});

// Run the actual Apps Script code against a small in-memory Sheets adapter.
function scriptHarness() {
  const rsvpHeaders = ["Mã gửi", "Thời gian gửi (VN)", "Họ và tên", "Email / Số điện thoại", "Tham dự", "Số người", "Lời nhắn", "Đồng ý sử dụng thông tin", "Mã xác nhận", "Ghi chú gia đình"];
  const wishHeaders = ["Mã gửi", "Thời gian gửi (VN)", "Tên hiển thị", "Lời chúc", "Đồng ý hiển thị sau duyệt", "Trạng thái duyệt", "Ghi chú gia đình"];
  const rows: Record<string, unknown[][]> = { RSVP: [rsvpHeaders], "Lời chúc": [wishHeaders] };
  const releaseLock = vi.fn();
  const lock = { tryLock: vi.fn(() => true), hasLock: () => true, releaseLock };
  const book = { getSheetByName: (name: string) => !rows[name] ? null : ({
    getLastRow: () => rows[name].length, getMaxRows: () => 1000,
    getRange: (row: number) => ({
      getValues: () => [rows[name][row - 1]],
      setNumberFormats: vi.fn(),
      setValues: (values: unknown[][]) => { rows[name][row - 1] = values[0]; },
      createTextFinder: (id: string) => {
        const finder = { matchEntireCell: () => finder, matchCase: () => finder, findNext: () => rows[name].slice(1).some(r => r[0] === id) };
        return finder;
      },
    }),
  }) };
  const context: Record<string, any> = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => secret }) },
    Utilities: { Charset: { UTF_8: "UTF-8" }, computeHmacSha256Signature: (payload: string, key: string) => Array.from(createHmac("sha256", key).update(payload).digest()) },
    LockService: { getScriptLock: () => lock },
    SpreadsheetApp: { openById: () => book, flush: vi.fn() },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) }) },
  };
  runInNewContext(readFileSync("integrations/google-sheets/Code.gs", "utf8"), context);
  function send(entry: unknown, tamper = false) {
    const payload = JSON.stringify(entry);
    const signature = tamper ? "0".repeat(64) : createHmac("sha256", secret).update(payload).digest("hex");
    return context.doPost({ postData: { contents: JSON.stringify({ payload, signature }) } });
  }
  return { rows, lock, send };
}

describe("Apps Script receiver", () => {
  it("saves one RSVP, preserves the phone number, escapes formulas and deduplicates retries", () => {
    const { rows, send, lock } = scriptHarness();
    const entry = { ...submission, timestamp: Date.now() };
    expect(send(entry)).toEqual({ ok: true, id: submission.id });
    expect(send(entry)).toEqual({ ok: true, id: submission.id, duplicate: true });
    expect(rows.RSVP).toHaveLength(2);
    expect(rows.RSVP[1][3]).toBe("0900123456");
    expect(rows.RSVP[1][5]).toBe(2);
    expect(rows.RSVP[1][6]).toBe("'=1+1");
    expect(lock.releaseLock).toHaveBeenCalledTimes(2);
  });
  it("rejects forged, stale, invalid and unconsented submissions without writing", () => {
    const { rows, send } = scriptHarness();
    const entry = { ...submission, timestamp: Date.now() };
    expect(send(entry, true).ok).toBe(false);
    expect(send({ ...entry, timestamp: 0 }).ok).toBe(false);
    expect(send({ ...entry, data: { ...submission.data, consent: "off" } }).ok).toBe(false);
    expect(send({ ...entry, data: { ...submission.data, guest_count: 99 } }).ok).toBe(false);
    expect(rows.RSVP).toHaveLength(1);
  });
  it("stores a wish as pending, never publicly approved", () => {
    const { rows, send } = scriptHarness();
    expect(send({ ...submission, kind: "guestbook", timestamp: Date.now(), data: { display_name: "Khách thử", message: "Chúc hạnh phúc", consent: "on", status: "pending", consent_public_display: true } }).ok).toBe(true);
    expect(rows["Lời chúc"][1][5]).toBe("Chờ duyệt");
    expect(rows.RSVP).toHaveLength(1);
  });
  it("does not write if another request holds the lock or headers changed", () => {
    const { rows, send, lock } = scriptHarness();
    lock.tryLock.mockReturnValueOnce(false);
    expect(send({ ...submission, timestamp: Date.now() }).ok).toBe(false);
    rows.RSVP[0][2] = "Changed header";
    expect(send({ ...submission, timestamp: Date.now() }).ok).toBe(false);
    expect(rows.RSVP).toHaveLength(1);
  });
  it("checks connectivity without inserting test data", () => {
    const { rows, send } = scriptHarness();
    expect(send({ kind: "health", timestamp: Date.now() })).toEqual({ ok: true, kind: "health" });
    expect(rows.RSVP).toHaveLength(1);
    expect(rows["Lời chúc"]).toHaveLength(1);
  });
});
