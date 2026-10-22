import { createAdminClient } from "../supabase/admin";
import { sendToGoogleSheets, type SheetSubmission } from "../integrations/google-sheets";

export async function saveSubmission(submission: SheetSubmission) {
  const storage = process.env.SUBMISSIONS_STORAGE ?? "supabase";
  if (storage === "google_sheets") {
    await sendToGoogleSheets(submission);
    return;
  }
  if (storage !== "supabase") throw new Error("Invalid submissions storage.");
  const database = createAdminClient();
  const table = submission.kind === "rsvp" ? "rsvp_submissions" : "guestbook_messages";
  const { error } = await database.from(table).upsert({
    ...submission.data, id: submission.id, created_at: submission.created_at,
  }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}
