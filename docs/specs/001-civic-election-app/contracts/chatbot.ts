/**
 * Chatbot Contracts
 *
 * These TypeScript interfaces define the chatbot's internal state
 * and the shape of requests/responses to the LLM proxy.
 *
 * Contract boundary: mobile app → LLM proxy → OpenAI GPT API
 */

// === Chatbot Contexts ===

export type ChatbotMode = "learn" | "candidate" | "debate";

export type ChatbotStatus = "closed" | "mode_selection" | "active";

// === Chatbot State ===

export interface ChatbotState {
  status: ChatbotStatus;
  context?: ChatbotMode;
  selectedCandidateId?: string; // Set when context is "candidate"
  messages: ChatMessage[];
  isStreaming: boolean;
  preloadedContext?: string; // Set when user clicks "Ask about this in chat"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: CitedSource[]; // Present in assistant messages when citing dataset
  timestamp: string; // ISO 8601
}

export interface CitedSource {
  title: string;
  url: string;
  entityType: "position" | "civic_fact" | "logistics";
  entityId: string;
}

// === LLM Proxy API ===

/**
 * POST /api/chat
 * Request to the lightweight LLM proxy.
 * The proxy adds the API key and forwards to OpenAI.
 */
export interface ChatRequest {
  context: ChatbotMode;
  candidateId?: string; // Required when context is "candidate"
  messages: ChatRequestMessage[];
  electionContext: ElectionContext;
  userProfile?: UserProfileSummary; // Included when context is "debate" and survey is completed
}

export interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Election context injected into the system prompt.
 * The proxy does NOT have access to the full dataset —
 * the mobile app sends the relevant context per request.
 */
export interface ElectionContext {
  electionId: string;
  city: string;
  year: number;
  relevantPositions: PositionSummary[];
  relevantCandidates: CandidateSummary[];
}

export interface PositionSummary {
  candidateId: string;
  candidateName: string;
  themeId: string;
  themeName: string;
  summary: string;
  details: string;
  sources: { title: string; url: string }[];
}

export interface CandidateSummary {
  id: string;
  name: string;
  party: string;
  bio: string;
  communicationStyle: string;
}

/**
 * Simplified user profile sent to Debate context.
 * Only includes scores and contradictions — NOT raw survey answers.
 */
export interface UserProfileSummary {
  themeScores: Record<string, number>;
  importanceWeights: Record<string, number>;
  contradictions: { themeA: string; themeB: string; description: string }[];
}

/**
 * SSE stream response from the proxy.
 * Each event is a text chunk or a done signal.
 */
export type ChatStreamEvent =
  | { type: "text"; content: string }
  | { type: "sources"; sources: CitedSource[] }
  | { type: "done" }
  | { type: "error"; message: string };
