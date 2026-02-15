/**
 * Rate limiter unit tests.
 *
 * Tests the rate limiting logic extracted from the proxy.
 * We re-implement the core logic here to test it in isolation.
 */

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string, now: number = Date.now()) {
  let entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    rateLimitMap.set(ip, entry);
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil(
      (entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

beforeEach(() => {
  rateLimitMap.clear();
});

describe("rate limiter", () => {
  test("first request passes", () => {
    const result = checkRateLimit("127.0.0.1");
    expect(result.allowed).toBe(true);
  });

  test("20th request passes", () => {
    const now = Date.now();
    for (let i = 0; i < 19; i++) {
      checkRateLimit("127.0.0.1", now);
    }
    const result = checkRateLimit("127.0.0.1", now);
    expect(result.allowed).toBe(true);
  });

  test("21st request is rejected", () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      checkRateLimit("127.0.0.1", now);
    }
    const result = checkRateLimit("127.0.0.1", now);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  test("requests pass again after window expires", () => {
    const now = Date.now();
    for (let i = 0; i < 21; i++) {
      checkRateLimit("127.0.0.1", now);
    }

    // After window expires
    const afterWindow = now + RATE_LIMIT_WINDOW_MS + 1;
    const result = checkRateLimit("127.0.0.1", afterWindow);
    expect(result.allowed).toBe(true);
  });

  test("different IPs have independent limits", () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      checkRateLimit("10.0.0.1", now);
    }
    // 10.0.0.1 is at limit
    expect(checkRateLimit("10.0.0.1", now).allowed).toBe(false);
    // 10.0.0.2 should still be fine
    expect(checkRateLimit("10.0.0.2", now).allowed).toBe(true);
  });

  test("cleanup removes expired entries", () => {
    const now = Date.now();
    checkRateLimit("expired-ip", now);
    expect(rateLimitMap.has("expired-ip")).toBe(true);

    // Simulate cleanup after window
    const afterWindow = now + RATE_LIMIT_WINDOW_MS + 1;
    for (const [ip, entry] of rateLimitMap) {
      if (afterWindow - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(ip);
      }
    }

    expect(rateLimitMap.has("expired-ip")).toBe(false);
  });
});
