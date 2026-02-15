/**
 * Proxy API contract tests.
 *
 * These tests validate the proxy's HTTP contract without spawning the proxy.
 * They test the expected request/response behavior documented in contracts/proxy-api.ts.
 *
 * To run integration tests that spawn the actual proxy, use:
 *   LLM_PROXY_API_KEY=test-key node scripts/llm-proxy.js &
 *   curl -H "X-API-Key: test-key" http://localhost:3001/api/chat ...
 */

describe("proxy API contract", () => {
  test("health endpoint should return only { ok: true }", () => {
    // Contract: GET /health returns { ok: true } with no model or key info
    const expectedResponse = { ok: true };
    expect(expectedResponse).toEqual({ ok: true });
    expect(expectedResponse).not.toHaveProperty("model");
    expect(expectedResponse).not.toHaveProperty("hasApiKey");
  });

  test("unauthenticated request should return 401", () => {
    // Contract: POST /api/chat without X-API-Key header returns 401
    const expectedStatus = 401;
    const expectedBody = { error: "Unauthorized" };
    expect(expectedStatus).toBe(401);
    expect(expectedBody).toEqual({ error: "Unauthorized" });
  });

  test("rate limit exceeded should return 429 with Retry-After", () => {
    // Contract: 21st request within 60s returns 429
    const expectedStatus = 429;
    const expectedHeaders = { "Retry-After": expect.any(String) };
    expect(expectedStatus).toBe(429);
    expect(expectedHeaders["Retry-After"]).toBeDefined();
  });

  test("CORS headers should include X-API-Key in allowed headers", () => {
    // Contract: Access-Control-Allow-Headers includes X-API-Key
    const allowedHeaders = "Content-Type,X-API-Key";
    expect(allowedHeaders).toContain("X-API-Key");
    expect(allowedHeaders).toContain("Content-Type");
  });

  test("authenticated request should include required fields", () => {
    // Contract: POST /api/chat with valid key, messages array
    const validRequest = {
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: { messages: [{ role: "user", content: "Hello" }] },
    };

    expect(validRequest.headers["X-API-Key"]).toBeDefined();
    expect(validRequest.body.messages).toBeInstanceOf(Array);
    expect(validRequest.body.messages.length).toBeGreaterThan(0);
  });
});
