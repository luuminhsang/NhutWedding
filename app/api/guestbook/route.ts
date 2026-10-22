import { NextRequest, NextResponse } from "next/server";
import { saveSubmission } from "@/lib/submissions/store";
import { submissionId } from "@/lib/submissions/request-id";
import { isRateLimited } from "@/lib/security/rate-limit";
import { guestbookSchema } from "@/lib/validation/submissions";

export async function POST(request: NextRequest) {
  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`guestbook:${source}`, 3)) return NextResponse.json({ error: "Vui lòng thử lại sau ít phút." }, { status: 429 });
  const id = submissionId(request.headers);
  if (!id) return NextResponse.json({ error: "Mã gửi không hợp lệ." }, { status: 422 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const parsed = guestbookSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Lời chúc chưa hợp lệ." }, { status: 422 });
  try {
    await saveSubmission({ id, kind: "guestbook", created_at: new Date().toISOString(), data: { ...parsed.data, status: "pending", consent_public_display: true } });
    return NextResponse.json({ status: "pending" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Hệ thống đang tạm thời không thể nhận lời chúc. Vui lòng thử lại sau." }, { status: 503 });
  }
}
