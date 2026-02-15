/**
 * LLM Proxy API Contract
 *
 * Defines the API surface of the hardened LLM proxy (scripts/llm-proxy.js).
 * FR-010 through FR-016.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface ProxyConfig {
  /** Port to listen on (default: 3001) */
  port: number;

  /** Bind address (default: "0.0.0.0" for dev, should be "127.0.0.1" for production behind reverse proxy) */
  host: string;

  /** OpenAI API key (from LLM_PROXY_API_KEY env var) */
  openaiApiKey: string;

  /** Model to use (default: "gpt-4o-mini") */
  model: string;

  /** API key that clients must provide (from LLM_PROXY_API_KEY env var) */
  clientApiKey: string;

  /** Allowed CORS origins (default: none in production) */
  allowedOrigins: string[];

  /** Rate limit: max requests per window per client */
  rateLimitMaxRequests: number;

  /** Rate limit: window duration in milliseconds */
  rateLimitWindowMs: number;

  /** Max request body size in bytes (default: 1_000_000) */
  maxBodySize: number;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /health
 *
 * Health check endpoint. No authentication required.
 * MUST NOT expose API key status or model name (FR-013).
 *
 * Response (200):
 * { "ok": true }
 */
export interface HealthResponse {
  ok: true;
}

/**
 * POST /api/chat
 *
 * Proxies chat messages to OpenAI. Requires authentication (FR-011).
 *
 * Headers:
 *   X-API-Key: <client API key>  (required)
 *   Content-Type: application/json
 *
 * Request body:
 * {
 *   "messages": [{ "role": "system"|"user"|"assistant", "content": string }],
 *   "mode": "comprendre"|"parler"|"debattre"  (optional, for logging)
 *   "candidateId": string  (optional)
 * }
 *
 * Response: Server-Sent Events (SSE) stream
 *   data: { "type": "text", "content": "<chunk>" }
 *   data: { "type": "done" }
 *   data: { "type": "error", "message": "<error description>" }
 *   data: [DONE]
 */
export interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  mode?: "comprendre" | "parler" | "debattre";
  candidateId?: string;
}

export type ChatSSEEvent =
  | { type: "text"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

/**
 * Error response format for all non-SSE error cases.
 */
export interface ProxyErrorResponse {
  error: string;
}

/**
 * HTTP status codes used:
 *
 * 200 — Success (health check, SSE stream started)
 * 204 — OPTIONS preflight response
 * 400 — Bad request (invalid JSON, missing messages)
 * 401 — Unauthorized (missing or invalid API key)
 * 403 — Forbidden (CORS origin not allowed)
 * 404 — Not found (unknown endpoint)
 * 413 — Payload too large (body exceeds maxBodySize)
 * 429 — Too many requests (rate limit exceeded)
 * 500 — Internal server error (missing OpenAI key)
 */

// ---------------------------------------------------------------------------
// Authentication contract
// ---------------------------------------------------------------------------

/**
 * Authentication flow:
 *
 * 1. Client sends X-API-Key header with every request to /api/chat
 * 2. Proxy validates: req.headers["x-api-key"] === process.env.LLM_PROXY_API_KEY
 * 3. If missing or invalid → 401 { "error": "Unauthorized" }
 * 4. /health endpoint is exempt from authentication
 * 5. OPTIONS preflight is exempt from authentication
 */

// ---------------------------------------------------------------------------
// Rate limiting contract
// ---------------------------------------------------------------------------

/**
 * Rate limiting:
 *
 * - Algorithm: Fixed-window counter per client IP
 * - Default: 20 requests per 60-second window
 * - Key: req.socket.remoteAddress (or X-Forwarded-For if behind reverse proxy)
 * - When exceeded: 429 { "error": "Rate limit exceeded. Try again in {seconds}s." }
 * - Response header: Retry-After: <seconds until window reset>
 * - On proxy restart: all limits reset (acceptable)
 */

// ---------------------------------------------------------------------------
// CORS contract
// ---------------------------------------------------------------------------

/**
 * CORS policy:
 *
 * Development (NODE_ENV !== "production"):
 *   Access-Control-Allow-Origin: http://localhost:* (Expo web dev server)
 *
 * Production (NODE_ENV === "production"):
 *   No Access-Control-Allow-Origin header (native apps don't need CORS)
 *   Browser requests are effectively blocked
 *
 * All modes:
 *   Access-Control-Allow-Methods: GET, POST, OPTIONS
 *   Access-Control-Allow-Headers: Content-Type, X-API-Key
 */
