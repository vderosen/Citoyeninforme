#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ---------------------------------------------------------------------------
// Rate limiter (in-memory fixed-window)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 300000;

/** @type {Map<string, { count: number, windowStart: number }>} */
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
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

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);

// ---------------------------------------------------------------------------
// .env loader
// ---------------------------------------------------------------------------
function loadDotEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (process.env.NODE_ENV === "production") {
    // In production, do not set Access-Control-Allow-Origin
    // Native mobile apps don't use CORS; browser requests are blocked
  } else {
    // In development, allow any origin (Expo web uses *.exp.direct, LAN IPs, etc.)
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-API-Key"
  );
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
function checkAuth(req) {
  const expectedKey = process.env.LLM_PROXY_API_KEY;

  if (!expectedKey) {
    // No key configured — fail closed, reject all requests
    return false;
  }

  const providedKey = req.headers["x-api-key"];
  return providedKey === expectedKey;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sendJson(req, res, statusCode, payload) {
  setCorsHeaders(req, res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function sseWrite(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function sseDone(res) {
  sseWrite(res, { type: "done" });
  res.write("data: [DONE]\n\n");
  res.end();
}

// ---------------------------------------------------------------------------
// Chat handler
// ---------------------------------------------------------------------------
async function handleChat(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-nano-2025-04-14";

  if (!apiKey) {
    sendJson(req, res, 500, {
      error: "OPENAI_API_KEY is missing. Add it to your .env file.",
    });
    return;
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    sendJson(req, res, 400, { error: error.message });
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    sendJson(req, res, 400, {
      error: "Invalid payload: 'messages' must be a non-empty array.",
    });
    return;
  }

  setCorsHeaders(req, res);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  try {
    const upstream = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.3,
        max_tokens: 400,
        messages,
      }),
    });

    if (!upstream.ok) {
      const errorBody = await upstream.text();
      sseWrite(res, {
        type: "error",
        message: `OpenAI error ${upstream.status}: ${errorBody.slice(0, 400)}`,
      });
      res.end();
      return;
    }

    const reader = upstream.body?.getReader();
    if (!reader) {
      sseWrite(res, {
        type: "error",
        message: "OpenAI response body is empty.",
      });
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          sseDone(res);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) {
            sseWrite(res, { type: "text", content: delta });
          }
        } catch {
          // Ignore malformed chunks from upstream.
        }
      }
    }

    sseDone(res);
  } catch (error) {
    sseWrite(res, {
      type: "error",
      message: error instanceof Error ? error.message : "Unexpected proxy error",
    });
    res.end();
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
loadDotEnvFile();

const host = process.env.LLM_PROXY_HOST || "0.0.0.0";
const port = Number(process.env.LLM_PROXY_PORT || "3001");

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(req, res, 400, { error: "Invalid request." });
    return;
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res);
    res.statusCode = 204;
    res.end();
    return;
  }

  // Health endpoint — no auth required
  if (req.method === "GET" && req.url === "/health") {
    sendJson(req, res, 200, { ok: true });
    return;
  }

  // Chat endpoint — requires auth + rate limiting
  if (req.method === "POST" && req.url === "/api/chat") {
    // Authentication check
    if (!checkAuth(req)) {
      sendJson(req, res, 401, { error: "Unauthorized" });
      return;
    }

    // Rate limiting
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const { allowed, retryAfter } = checkRateLimit(clientIp);

    if (!allowed) {
      res.setHeader("Retry-After", String(retryAfter));
      sendJson(req, res, 429, {
        error: `Rate limit exceeded. Try again in ${retryAfter}s.`,
      });
      return;
    }

    await handleChat(req, res);
    return;
  }

  sendJson(req, res, 404, { error: "Not found." });
});

server.on("error", (error) => {
  console.error("[llm-proxy] Failed to start server.");
  if (error && typeof error === "object" && "code" in error) {
    console.error(`[llm-proxy] ${String(error.code)} on ${host}:${port}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`[llm-proxy] Listening on http://${host}:${port}`);
  console.log("[llm-proxy] Health check: GET /health");
  console.log("[llm-proxy] Chat endpoint: POST /api/chat");

  if (!process.env.LLM_PROXY_API_KEY) {
    console.warn(
      "[llm-proxy] WARNING: LLM_PROXY_API_KEY is not set. All requests will be rejected."
    );
  }
});
