/**
 * Follow-Up Suggestions Service
 *
 * Generates 3 follow-up questions after each assistant response.
 * Uses the same /api/chat SSE endpoint with a compact prompt.
 * Non-critical: fails silently, no retries, 8s timeout.
 */

import type { AssistantMode, ChatMessage } from "../stores/assistant";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_LLM_PROXY_URL ?? "http://localhost:3001";
const API_KEY = process.env.EXPO_PUBLIC_LLM_PROXY_API_KEY ?? "";

const SYSTEM_PROMPT = `Tu es un assistant pour une app d'élections municipales.
À partir des derniers messages de conversation, génère exactement 3 questions de suivi courtes et pertinentes que l'utilisateur pourrait poser.
Réponds UNIQUEMENT avec un JSON array de 3 strings, sans markdown ni explication.
Exemple: ["Question 1 ?", "Question 2 ?", "Question 3 ?"]`;

/**
 * Collect SSE stream from /api/chat into a single string.
 */
function collectSSEResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/chat`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
    if (API_KEY) {
      xhr.setRequestHeader("X-API-Key", API_KEY);
    }

    let collectedText = "";
    let lastParsedIndex = 0;
    let lineBuffer = "";

    const processLines = (lines: string[]) => {
      for (const line of lines) {
        const trimmed = line.replace(/\r$/, "");
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "text" && parsed.content) {
            collectedText += parsed.content;
          }
        } catch {
          if (data.trim()) {
            collectedText += data;
          }
        }
      }
    };

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
      if (xhr.status >= 400) {
        reject(new Error(`API error: ${xhr.status}`));
      } else {
        resolve(collectedText);
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.timeout = 8000;
    xhr.ontimeout = () => reject(new Error("Timeout"));

    xhr.send(
      JSON.stringify({
        mode: "comprendre",
        messages,
      })
    );
  });
}

/**
 * Extract a JSON array from a response that may contain markdown fences.
 */
function extractJSONArray(text: string): string[] {
  const trimmed = text.trim();

  // Try markdown fences first
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : trimmed;

  // Find the array boundaries
  const firstBracket = jsonStr.indexOf("[");
  const lastBracket = jsonStr.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket <= firstBracket) return [];

  const parsed = JSON.parse(jsonStr.slice(firstBracket, lastBracket + 1));
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is string => typeof item === "string").slice(0, 3);
}

/**
 * Generate follow-up suggestions based on recent conversation messages.
 * Sends only the last 3 messages (truncated) for speed.
 * Fails silently — returns empty array on any error.
 */
export async function generateFollowUpSuggestions(
  messages: ChatMessage[],
  _mode: AssistantMode
): Promise<string[]> {
  const recentMessages = messages.slice(-3).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 200),
  }));

  const allMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentMessages,
    {
      role: "user",
      content: "Génère 3 questions de suivi en JSON array.",
    },
  ];

  const responseText = await collectSSEResponse(allMessages);
  return extractJSONArray(responseText);
}
