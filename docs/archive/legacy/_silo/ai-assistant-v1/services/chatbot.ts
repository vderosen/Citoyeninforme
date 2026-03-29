/**
 * Chatbot Service
 *
 * Handles LLM proxy API calls per contracts/chatbot.ts.
 * Builds ElectionContext from election store, manages SSE streaming.
 *
 * Uses XMLHttpRequest (not fetch) so we can consume the SSE stream
 * progressively via onprogress — React Native's fetch doesn't expose
 * ReadableStream.  Chunks are flushed to the UI every FLUSH_INTERVAL_MS
 * to avoid hammering the Zustand store / Markdown renderer.
 */

import type {
  AssistantMode,
  ChatMessage,
} from "../stores/assistant";
import type {
  Election,
  Candidate,
  Position,
  Theme,
} from "../data/schema";
import type { UserProfile } from "../stores/survey";
import { buildLearnModePrompt } from "./prompts/comprendre-mode";
import { buildCandidateModePrompt } from "./prompts/parler-mode";
import { buildDebateModePrompt } from "./prompts/debattre-mode";
import { sanitizeUserInput } from "../utils/input-sanitizer";

const API_BASE_URL = process.env.EXPO_PUBLIC_LLM_PROXY_URL ?? "http://localhost:3001";
const API_KEY = process.env.EXPO_PUBLIC_LLM_PROXY_API_KEY ?? "";
const FLUSH_INTERVAL_MS = 150;

interface ChatContext {
  election: Election;
  candidates: Candidate[];
  positions: Position[];
  themes: Theme[];
}

export function sendChatMessage(
  mode: AssistantMode,
  messages: ChatMessage[],
  context: ChatContext,
  options?: {
    candidateId?: string;
    userProfile?: UserProfile;
  },
  onChunk?: (text: string) => void,
  onDone?: () => void,
  onError?: (error: string) => void
): void {
  let systemPrompt: string;

  switch (mode) {
    case "comprendre":
      systemPrompt = buildLearnModePrompt(context);
      break;
    case "parler":
      if (!options?.candidateId) {
        onError?.("Candidate ID required for parler mode");
        return;
      }
      systemPrompt = buildCandidateModePrompt({
        ...context,
        candidateId: options.candidateId,
      });
      break;
    case "debattre":
      systemPrompt = buildDebateModePrompt({
        ...context,
        userProfile: options?.userProfile ?? null,
      });
      break;
  }

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

  /** Parse complete SSE lines from the buffer. */
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
        } else if (parsed.type === "done") {
          // Server signals completion
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

    // Append to buffer and split into lines; keep the last
    // (potentially incomplete) fragment for the next onprogress call.
    lineBuffer += newData;
    const lines = lineBuffer.split("\n");
    lineBuffer = lines.pop() ?? "";
    processLines(lines);
  };

  xhr.onload = () => {
    // Process any remaining data in the buffer
    if (lineBuffer) {
      processLines([lineBuffer]);
      lineBuffer = "";
    }

    cleanup();
    flush(); // emit any remaining accumulated text

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
      mode,
      candidateId: options?.candidateId,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
    })
  );
}
