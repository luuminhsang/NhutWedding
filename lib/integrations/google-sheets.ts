import { createHmac } from "node:crypto";

export type SheetSubmission = {
  id: string;
  kind: "rsvp" | "guestbook";
  created_at: string;
  data: Record<string, string | number | boolean>;
};

// Server-only: never expose the webhook URL or signing secret to the browser.
export async function sendToGoogleSheets(submission: SheetSubmission) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret || secret.length < 32) {
    throw new Error("Google Sheets webhook is not configured.");
  }
  const payload = JSON.stringify({ ...submission, timestamp: Date.now() });
  const signature = createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  const response = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, signature }),
    signal: AbortSignal.timeout(15_000), cache: "no-store", redirect: "follow",
  });
  if (!response.ok) throw new Error("Google Sheets request failed.");
  const receipt = await response.json();
  if (receipt?.ok !== true || receipt?.id !== submission.id) throw new Error("Google Sheets did not confirm the submission.");
}
