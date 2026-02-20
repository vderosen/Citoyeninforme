# API Contract: LLM Proxy

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## Overview

The LLM proxy is a zero-dependency Node.js HTTP server (`scripts/llm-proxy.js`). This contract documents the authentication behavior change from fail-open to fail-closed.

## Endpoints

### GET /health

No authentication required. No changes in this feature.

**Response**: `200 OK`
```json
{ "ok": true }
```

### POST /api/chat

Requires authentication via `X-API-Key` header.

**Authentication behavior (CHANGED)**:

| Condition | Before (Broken) | After (Fixed) |
|-----------|-----------------|---------------|
| `LLM_PROXY_API_KEY` not set, any request | `200` (allowed) | `401 Unauthorized` |
| `LLM_PROXY_API_KEY` set, no `X-API-Key` header | `401 Unauthorized` | `401 Unauthorized` (unchanged) |
| `LLM_PROXY_API_KEY` set, wrong `X-API-Key` | `401 Unauthorized` | `401 Unauthorized` (unchanged) |
| `LLM_PROXY_API_KEY` set, correct `X-API-Key` | `200` (forwarded) | `200` (forwarded, unchanged) |

**401 Response**:
```json
{ "error": "Unauthorized" }
```

### OPTIONS (any path)

CORS preflight. No authentication required. No changes in this feature.

**Response**: `204 No Content` with CORS headers.

## Startup Behavior (CHANGED)

| Condition | Before | After |
|-----------|--------|-------|
| `LLM_PROXY_API_KEY` not set | Silent — no warning | `console.warn("[llm-proxy] WARNING: LLM_PROXY_API_KEY is not set. All requests will be rejected.")` |
| `LLM_PROXY_API_KEY` set | Normal startup logs | Normal startup logs (unchanged) |

## Contract Test Requirements

Contract tests MUST:
1. Spawn an actual proxy instance on a test port
2. Send real HTTP requests using Node.js `http` module or `fetch`
3. Validate actual response status codes and bodies
4. Test both authenticated and unauthenticated scenarios
5. Clean up the proxy process in `afterAll`
