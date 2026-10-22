const requests = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const fresh = (requests.get(key) ?? []).filter((time) => now - time < windowMs);
  fresh.push(now);
  requests.set(key, fresh);
  return fresh.length > limit;
}
