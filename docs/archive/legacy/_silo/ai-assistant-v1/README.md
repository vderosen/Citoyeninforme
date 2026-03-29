# AI Assistant — Version 1 (Archived)

> **Status: OVER. We are rebuilding this from scratch.**

This folder is a complete snapshot of the first-generation AI assistant system as it existed in February 2026. It is kept here for reference only and is **not used by the app**.

---

## What Was This?

A three-mode chatbot powered by a local OpenAI proxy (`gpt-4.1-nano` by default), using **fat system prompts** (no RAG, no vector DB) to ground answers in the election dataset.

### The Three Modes

| Mode | File | Description |
|---|---|---|
| **Comprendre** | `prompts/comprendre-mode.ts` | Neutral Q&A. Answers only from the dataset, cites sources, redirects off-topic. |
| **Parler** | `prompts/parler-mode.ts` | Persona mode. LLM adopts a candidate's voice, strictly limited to their documented program. |
| **Débattre** | `prompts/debattre-mode.ts` + `debate.ts` | Structured Socratic debate. LLM returns JSON turns (statement + options). User picks an option. After 10+ turns, early turns are summarized. Ends with a conclusion turn. |

### Supporting Services

- `chatbot.ts` — Main chat service. Builds the system prompt per mode and streams the response via XHR SSE (fetch doesn't support streaming in React Native).
- `debate.ts` — Debate-specific service. Collects the full SSE response, parses JSON turns, retries once on parse failure.
- `suggestions.ts` — Generates 3 follow-up question suggestions after each response. Non-critical, fails silently.
- `llm-proxy.js` — Local Node.js proxy (port 3001). Holds the API key server-side, rate-limits to 20 req/min/IP, streams OpenAI responses back as SSE.

### Why It's Being Replaced

- The prompt-stuffing approach doesn't scale as the dataset grows
- No real retrieval — the entire positions dataset is injected every request
- Debate mode's JSON parsing is fragile (needs retry logic)
- The local proxy requirement creates friction for real device testing
- Opportunity to do something better with proper RAG / a new architecture

---

## Files in This Silo

```
services/
  chatbot.ts
  debate.ts
  suggestions.ts
  prompts/
    comprendre-mode.ts
    parler-mode.ts
    debattre-mode.ts
scripts/
  llm-proxy.js
CHATBOT_SETUP.md
```
