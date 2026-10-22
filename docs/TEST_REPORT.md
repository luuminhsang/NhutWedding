# Test report

## Automated result

- `npm run build`: PASS — Next.js production build completed on 2026-10-21.
- `npm run test`: PASS — 12 tests passed on 2026-10-22 (RSVP validation, signed Sheets requests, receipts, Apps Script validation, duplicate protection).
- `npx tsc --noEmit --incremental false`: PASS on 2026-10-22.

## Google Sheets integration — 2026-10-22, 14:38 Asia/Saigon

- Signed health check: PASS; both destination tabs and headers verified.
- Local website `http://localhost:3000`: HTTP 200; HTML includes both forms and the public Sheet disclosure.
- `POST /api/rsvp`: HTTP 201, confirmation code returned. Readback verified the submitted values in `RSVP`.
- Same RSVP submission ID retried: HTTP 201 with the same confirmation code; exactly one matching row in the Sheet.
- `POST /api/guestbook`: HTTP 201, pending status returned. Readback verified the submitted values in `Lời chúc`.
- Test IDs: RSVP `18de66de-1a96-4134-9593-1ed9c4b0a46b`; guestbook `878263d4-90fd-48c3-a42f-e2369362d409`. Only these two test rows were cleared, preserving formatting and validation.
- Scope: verified local HTTP/API → live Apps Script → live Google Sheet. Browser clicks, hydrated success rendering, and a deployed production website were not verified in this pass.

## Required manual QA

Phong bì, music gesture, RSVP network failure, guestbook moderation, anonymous `/admin`, mobile widths 320–430px, upload ảnh gốc, QR canonical URL và export vẫn cần được xác nhận sau khi Supabase và Vercel được cấu hình.
