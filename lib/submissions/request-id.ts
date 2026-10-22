import { z } from "zod";

export function submissionId(headers: Headers): string | null {
  const supplied = headers.get("x-submission-id");
  if (!supplied) return crypto.randomUUID();
  const result = z.string().uuid().safeParse(supplied);
  return result.success ? result.data : null;
}
