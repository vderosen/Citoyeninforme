import type { LogisticsDate } from "../data/schema";

// --- View-layer types ---

export type TemporalStatus = "past" | "next" | "future";

export interface TimelineEntry {
  date: string;
  formattedDate: string;
  labels: string[];
  status: TemporalStatus;
}

// --- Constants ---

const FRENCH_MONTHS = [
  "JAN", "FÉV", "MARS", "AVR", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC",
];

// --- Helpers ---

export function formatFrenchDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDate();
  const month = FRENCH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function groupAndClassifyDates(keyDates: LogisticsDate[]): TimelineEntry[] {
  const groups = new Map<string, string[]>();
  for (const item of keyDates) {
    const existing = groups.get(item.date);
    if (existing) {
      existing.push(item.label);
    } else {
      groups.set(item.date, [item.label]);
    }
  }

  const sortedDates = [...groups.keys()].sort();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let foundNext = false;
  return sortedDates.map((date) => {
    const entryDate = new Date(date + "T00:00:00");
    let status: TemporalStatus;
    if (entryDate < today) {
      status = "past";
    } else if (!foundNext) {
      status = "next";
      foundNext = true;
    } else {
      status = "future";
    }
    return {
      date,
      formattedDate: formatFrenchDate(date),
      labels: groups.get(date)!,
      status,
    };
  });
}
