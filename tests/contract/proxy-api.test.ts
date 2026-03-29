/**
 * Proxy API contract tests.
 *
 * These tests spawn an actual proxy instance and validate real HTTP behavior.
 */

import { ChildProcess, spawn } from "child_process";
import http from "http";
import path from "path";

const TEST_PORT = 9877;
const TEST_API_KEY = "test-key";
const PROXY_SCRIPT = path.resolve(__dirname, "../../scripts/rag-proxy.js");

let proxyProcess: ChildProcess;

function request(
  method: string,
  urlPath: string,
  headers: Record<string, string> = {},
  body?: string
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: TEST_PORT,
        path: urlPath,
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, body: data })
        );
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

beforeAll(async () => {
  // Set GEMINI_API_KEY to empty string to prevent the .env loader from
  // injecting it — the loader only sets keys that are undefined.
  proxyProcess = spawn("node", [PROXY_SCRIPT], {
    env: {
      ...process.env,
      GEMINI_API_KEY: "",
      LLM_PROXY_API_KEY: TEST_API_KEY,
      LLM_PROXY_PORT: String(TEST_PORT),
      LLM_PROXY_HOST: "127.0.0.1",
    },
    stdio: "pipe",
  });

  // Wait for the proxy to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Proxy failed to start within 15s")),
      15000
    );

    proxyProcess.stdout?.on("data", (data: Buffer) => {
      if (data.toString().includes("Listening")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    proxyProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
});

afterAll(() => {
  if (proxyProcess) {
    proxyProcess.kill("SIGTERM");
  }
});

describe("proxy API contract", () => {
  test("GET /health returns 200 with ok=true", async () => {
    const res = await request("GET", "/health");

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
  });

  test("POST /api/chat without auth returns 401", async () => {
    const res = await request(
      "POST",
      "/api/chat",
      { "Content-Type": "application/json" },
      JSON.stringify({ messages: [{ role: "user", content: "Hello" }] })
    );

    expect(res.status).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: "Unauthorized" });
  });

  test("POST /api/chat with auth but no GEMINI_API_KEY returns 500", async () => {
    const res = await request(
      "POST",
      "/api/chat",
      {
        "Content-Type": "application/json",
        "X-API-Key": TEST_API_KEY,
      },
      JSON.stringify({ messages: [{ role: "user", content: "Hello" }] })
    );

    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toContain("GEMINI_API_KEY");
  });

  test("POST /api/debug returns 404 by default", async () => {
    const res = await request(
      "POST",
      "/api/debug",
      {
        "Content-Type": "application/json",
        "X-API-Key": TEST_API_KEY,
      },
      JSON.stringify({ messages: [{ role: "user", content: "Debug this" }] })
    );

    expect(res.status).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ error: "Not found" });
  });
});
