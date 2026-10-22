"use client";

import { useRef, useState } from "react";

export function useSubmission(endpoint: "/api/rsvp" | "/api/guestbook") {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const attempt = useRef<{ body: string; id: string } | null>(null);

  async function submit(form: HTMLFormElement) {
    if (busy.current) return false;
    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(form));
      if (endpoint === "/api/rsvp" && data.attendance === "declined") data.guest_count = "0";
      const body = JSON.stringify(data);
      if (attempt.current?.body !== body) attempt.current = { body, id: crypto.randomUUID() };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-submission-id": attempt.current.id },
        body, signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        setError(response.status === 422 ? "Vui lòng kiểm tra lại các thông tin đã nhập." : response.status === 429 ? "Bạn đã gửi nhiều lần. Vui lòng thử lại sau ít phút." : "Chưa xác nhận được việc lưu phản hồi. Thông tin vẫn còn ở đây, bạn vui lòng bấm gửi lại.");
        return false;
      }
      return true;
    } catch {
      setError("Chưa xác nhận được việc lưu phản hồi. Hãy kiểm tra kết nối và bấm gửi lại; thông tin đã nhập vẫn được giữ nguyên.");
      return false;
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
