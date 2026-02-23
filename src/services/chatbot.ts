/**
 * Chatbot Service (V2 — RAG-based)
 *
 * Sends user messages to the RAG proxy which handles:
 * - Embedding the query
 * - Retrieving relevant source chunks
 * - Building the grounded system prompt
 * - Streaming the LLM response
 *
 * The app side just sends messages and streams back the response.
 * Uses XMLHttpRequest for SSE streaming (React Native lacks ReadableStream).
 */

import { sanitizeUserInput } from "../utils/input-sanitizer";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_LLM_PROXY_URL ?? "http://localhost:3001";
const API_KEY = process.env.EXPO_PUBLIC_LLM_PROXY_API_KEY ?? "";
const FLUSH_INTERVAL_MS = 150;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function sendChatMessage(
  messages: ChatMessage[],
  options?: {
    candidateFilter?: string | null;
  },
  onChunk?: (text: string) => void,
  onDone?: () => void,
  onError?: (error: string) => void
): void {
  const chatMessages = messages.map((m) => ({
    role: m.role,
    content: m.role === "user" ? sanitizeUserInput(m.content) : m.content,
  }));

  // -- SSE state --
  let lastParsedIndex = 0;
  let lineBuffer = "";
  let pendingText = "";
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let errorSent = false;

  const flush = () => {
    flushTimer = null;
    if (pendingText) {
      onChunk?.(pendingText);
      pendingText = "";
    }
  };

  const scheduleFlush = () => {
    if (!flushTimer) {
      flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
    }
  };

  const cleanup = () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  };

  const processLines = (lines: string[]) => {
    for (const line of lines) {
      const trimmed = line.replace(/\r$/, "");
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "text" && parsed.content) {
          pendingText += parsed.content;
          scheduleFlush();
        } else if (parsed.type === "error") {
          cleanup();
          errorSent = true;
          onError?.(parsed.message);
          return;
        }
      } catch {
        if (data.trim()) {
          pendingText += data;
          scheduleFlush();
        }
      }
    }
  };

  // -- XHR setup --
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_BASE_URL}/api/chat`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
  if (API_KEY) {
    xhr.setRequestHeader("X-API-Key", API_KEY);
  }

  xhr.onprogress = () => {
    const newData = xhr.responseText.slice(lastParsedIndex);
    lastParsedIndex = xhr.responseText.length;
    lineBuffer += newData;
    const lines = lineBuffer.split("\n");
    lineBuffer = lines.pop() ?? "";
    processLines(lines);
  };

  xhr.onload = () => {
    if (lineBuffer) {
      processLines([lineBuffer]);
      lineBuffer = "";
    }
    cleanup();
    flush();
    if (errorSent) return;

    if (xhr.status === 401) {
      onError?.("Authentication failed. Check proxy configuration.");
    } else if (xhr.status === 429) {
      onError?.("Too many requests. Please wait a moment.");
    } else if (xhr.status >= 400) {
      onError?.(`API error: ${xhr.status}`);
    } else {
      onDone?.();
    }
  };

  xhr.onerror = () => {
    cleanup();
    if (!errorSent) {
      onError?.("Network error");
    }
  };

  xhr.send(
    JSON.stringify({
      messages: chatMessages,
      candidate_filter: options?.candidateFilter ?? undefined,
    })
  );
}
