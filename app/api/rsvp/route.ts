import { NextRequest, NextResponse } from "next/server";
import { saveSubmission } from "@/lib/submissions/store";
import { submissionId } from "@/lib/submissions/request-id";
import { isRateLimited } from "@/lib/security/rate-limit";
import { rsvpSchema } from "@/lib/validation/submissions";

export async function POST(request: NextRequest) {
  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`rsvp:${source}`)) return NextResponse.json({ error: "Vui lòng thử lại sau ít phút." }, { status: 429 });
  const id = submissionId(request.headers);
  if (!id) return NextResponse.json({ error: "Mã gửi không hợp lệ." }, { status: 422 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thông tin xác nhận chưa hợp lệ." }, { status: 422 });
  try {
    const confirmationCode = id.replaceAll("-", "").slice(0, 10).toUpperCase();
    await saveSubmission({ id, kind: "rsvp", created_at: new Date().toISOString(), data: { ...parsed.data, contact: parsed.data.contact ?? "", message: parsed.data.message ?? "", confirmation_code: confirmationCode } });
    return NextResponse.json({ confirmation_code: confirmationCode }, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi lưu RSVP:", error);
    return NextResponse.json({ error: "Hệ thống đang tạm thời không thể nhận phản hồi. Vui lòng thử lại sau." }, { status: 503 });
  }
}
