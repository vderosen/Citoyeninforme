/**
 * Chatbot Service
 *
 * Handles LLM proxy API calls per contracts/chatbot.ts.
 * Builds ElectionContext from election store, manages SSE streaming.
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

const API_BASE_URL = process.env.EXPO_PUBLIC_LLM_PROXY_URL ?? "http://localhost:3001";

interface ChatContext {
  election: Election;
  candidates: Candidate[];
  positions: Position[];
  themes: Theme[];
}

export async function sendChatMessage(
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
): Promise<void> {
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
    content: m.content,
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        candidateId: options?.candidateId,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
      }),
    });

    if (!response.ok) {
      onError?.(`API error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      // Fallback for non-streaming response
      const data = await response.json();
      onChunk?.(data.content ?? data.message ?? "");
      onDone?.();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text" && parsed.content) {
              onChunk?.(parsed.content);
            } else if (parsed.type === "done") {
              onDone?.();
              return;
            } else if (parsed.type === "error") {
              onError?.(parsed.message);
              return;
            }
          } catch {
            // Non-JSON SSE data, treat as text
            onChunk?.(data);
          }
        }
      }
    }

    onDone?.();
  } catch (error) {
    onError?.(
      error instanceof Error ? error.message : "Network error"
    );
  }
}
