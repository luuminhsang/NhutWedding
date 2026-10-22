import { describe, expect, it } from "vitest";
import { rsvpSchema } from "../lib/validation/submissions";

describe("rsvpSchema", () => {
  it("rejects guests when a declined RSVP has attendees", () => {
    expect(rsvpSchema.safeParse({ guest_name: "Khách mời", attendance: "declined", guest_count: 1, consent: "on" }).success).toBe(false);
  });
  it("accepts an attending RSVP", () => {
    expect(rsvpSchema.safeParse({ guest_name: "Khách mời", attendance: "attending", guest_count: 1, consent: "on" }).success).toBe(true);
  });
});
