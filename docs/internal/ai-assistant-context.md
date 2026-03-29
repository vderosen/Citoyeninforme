# Citoyen Informé - AI Assistant Context Map

This document explains exactly how the AI Assistant (Chatbot) for the "Citoyen Informé" app works. You can provide this text to any LLM so it securely understands the architecture, prompt generation, and data flow of the project.

## 1. High-Level Architecture
The AI Assistant is a RAG (Retrieval-Augmented Generation) system tailored for the Paris 2026 municipal elections. It allows users to ask questions about candidate platforms.

The stack consists of:
- **Frontend App**: React Native (Expo). Manages chat UI and history per candidate.
- **RAG Proxy Backend**: A custom Node.js HTTP server (`scripts/rag-proxy.js`) that handles vector search, prompt augmented generation, and SSE streaming with Google Gemini.
- **Data Pipeline**: A script (`scripts/build-rag-index.js`) that chunks and embeds candidate programs into a local JSON vector index.

## 2. Frontend Flow (`src/stores/assistant.ts` & `src/services/chatbot.ts`)
- **State Management**: Uses Zustand (`useAssistantStore`). It stores chat history independently based on the currently selected candidate filter (e.g., `candidate:sarah-knafo` vs `general`).
- **Communication**: The frontend calls `sendChatMessage` which makes an `XMLHttpRequest` POST request to the proxy's `/api/chat` endpoint. It sends the `messages` array and an optional `candidate_filter`.
- **Streaming**: It uses SSE (Server-Sent Events) to stream the text chunks back to the UI in real time.

## 3. Proxy Backend Flow (`scripts/rag-proxy.js`)
The proxy handles rate-limiting, query understanding, semantic search, and streaming LLM responses.

### 3.1. Query Understanding & Routing
When a user submits a query, the proxy determines the intent:
1. **Candidate Detection**: It uses Levenshtein distance fuzzy-matching on the user's prompt to detect mentions of candidate names (e.g. "Dati", "Bournazel"). This can override the frontend's explicit `candidate_filter`.
2. **Topic Expansion**: For short queries, it automatically appends keywords to improve the embedding quality (e.g., if the query contains "securite", it invisibly appends "sécurité publique police municipale délinquance...").
3. **LLM Query Analysis (Ambiguity Resolution)**: If the query is ambiguous, doesn't mention a specific candidate, and doesn't match predefined topics, it uses a fast LLM (`gemini-2.0-flash`) to classify the query as `single`, `comparison`, or `general`, and generate an optimized semantic search query.

### 3.2. Vector Retrieval (RAG)
- Uses `models/gemini-embedding-001` to embed the optimized query.
- Calculates Cosine Similarity against the chunks in the in-memory `rag_index.json`.
- **Query Types & Limits**:
  - `single` (Specific candidate): Retrieves top 12 chunks for that specific candidate.
  - `comparison` (Comparing candidates): Retrieves top 14 chunks globally, but strictly limits the result to **max 2 chunks per candidate** to ensure a balanced comparison without bias toward candidates with more text.
  - `general`: Retrieves top 10 chunks globally.

### 3.3. System Prompt Construction
The backend dynamically builds the System Prompt sent to the final LLM.
- It concatenates all retrieved chunks in the format: `[Candidat: X | Source: Y] "Text..."`.
- **Rules injected into the LLM logic**:
  - Base answers strictly on the provided extracts.
  - Explicitly mention the candidate and source when quoting.
  - If the topic isn't in the program, state it clearly but still provide a helpful answer based on closest extracts or general knowledge.
  - Never recommend a candidate; stay strictly neutral.
  - Weigh all candidates equally in comparison questions.
  - Respond concisely (3-5 sentences) in French.

### 3.4. LLM Generation
- Sends the System Prompt and User Chat History to `gemini-3.0-flash-preview`.
- Uses `temperature: 0.3` for factual consistency.
- `maxOutputTokens` is 800 (or 1200 for comparison queries).
- Streams the final response chunks back to the client via SSE.

## 4. Index Building (`scripts/build-rag-index.js`)
- Transforms raw programmatic JSON documents into an embeddable format.
- Chunks text into ~1500 character segments with 200 characters of overlap.
- Uses `gemini-embedding-001` to generate a 768-dimension vector for each chunk.
- Outputs `data_pipeline/rag_index.json` which is loaded into memory by the proxy server.
