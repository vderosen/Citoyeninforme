import { zustandStorage } from "../stores/storage";

const STORAGE_KEY = "feedback_entries";

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  screen: "candidate" | "assistant" | "comparison" | "survey";
  entityId: string | null;
  type: "unclear" | "missing" | "general";
  text: string | null;
}

export function submitFeedback(
  entry: Omit<FeedbackEntry, "id" | "timestamp">
): void {
  const entries = getFeedbackEntries();

  const newEntry: FeedbackEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date().toISOString(),
  };

  entries.push(newEntry);
  zustandStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getFeedbackEntries(): FeedbackEntry[] {
  const raw = zustandStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw as string) as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function clearFeedbackEntries(): void {
  zustandStorage.removeItem(STORAGE_KEY);
}
