#!/usr/bin/env node
/* eslint-disable no-console */

const http = require("http");
const fs = require("fs");
const path = require("path");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

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

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
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

async function handleChat(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    sendJson(res, 500, {
      error: "OPENAI_API_KEY is missing. Add it to your .env file.",
    });
    return;
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    sendJson(res, 400, {
      error: "Invalid payload: 'messages' must be a non-empty array.",
    });
    return;
  }

  setCorsHeaders(res);
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

loadDotEnvFile();

const host = process.env.LLM_PROXY_HOST || "0.0.0.0";
const port = Number(process.env.LLM_PROXY_PORT || "3001");

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: "Invalid request." });
    return;
  }

  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    await handleChat(req, res);
    return;
  }

  sendJson(res, 404, { error: "Not found." });
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
});
