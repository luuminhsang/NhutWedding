import { z } from "zod";

export const rsvpSchema = z.object({
  guest_name: z.string().trim().min(2).max(100),
  contact: z.string().trim().max(120).optional().or(z.literal("")),
  attendance: z.enum(["attending", "declined", "unsure"]),
  guest_count: z.coerce.number().int().min(0).max(10),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  consent: z.literal("on"),
}).superRefine((value, context) => {
  if (value.attendance === "declined" && value.guest_count !== 0) context.addIssue({ code: "custom", message: "Số người tham dự phải bằng 0 khi không tham dự.", path: ["guest_count"] });
});

export const guestbookSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  message: z.string().trim().min(3).max(500),
  consent: z.literal("on"),
});
