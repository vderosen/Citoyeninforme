import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { CandidateList } from "../../src/components/candidates/CandidateList";
import { useElectionStore } from "../../src/stores/election";
import type { ElectionDataset } from "../../src/data/schema";

// Mock i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common:noPositionDocumented": "Pas de position documentée",
        "common:noPositionNote": "L'absence de données ne signifie pas l'absence d'opinion.",
        "learn:details": "Voir les détails",
        "learn:hideDetails": "Masquer les détails",
        "learn:askInChat": "Poser une question au chatbot",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockDataset: ElectionDataset = {
  election: {
    id: "test-2026",
    city: "Test",
    type: "Municipales",
    year: 2026,
    votingRules: { rounds: 2, description: "test" },
    timeline: { registrationDeadline: "2026-03-01", firstRound: "2026-03-15" },
    dataVersion: "1.0.0",
    lastUpdated: "2026-02-13",
  },
  candidates: [
    {
      id: "c1",
      electionId: "test-2026",
      name: "Alice Alpha",
      party: "Party A",
      bio: "Bio A",
      communicationStyle: "Direct",
      programSourceUrl: "https://example.com",
    },
    {
      id: "c2",
      electionId: "test-2026",
      name: "Bob Beta",
      party: "Party B",
      bio: "Bio B",
      communicationStyle: "Calm",
      programSourceUrl: "https://example.com",
    },
  ],
  themes: [
    {
      id: "t1",
      electionId: "test-2026",
      name: "Transport",
      icon: "train",
      description: "Test",
      displayOrder: 1,
    },
  ],
  positions: [
    {
      id: "p1",
      candidateId: "c1",
      themeId: "t1",
      summary: "Alice's transport position",
      details: "Details here",
      sources: [
        {
          title: "Source",
          url: "https://example.com",
          type: "program" as const,
          accessDate: "2026-02-10",
        },
      ],
      lastVerified: "2026-02-10",
    },
  ],
  surveyQuestions: [],
  civicFacts: [],
  logistics: {
    electionId: "test-2026",
    keyDates: [],
    eligibility: [],
    votingMethods: [],
    locations: [],
    officialSources: [],
  },
};

describe("CandidateList", () => {
  beforeEach(() => {
    useElectionStore.getState().loadDataset(mockDataset);
  });

  it("renders all candidates", () => {
    render(<CandidateList selectedThemeId={null} />);
    expect(screen.getByText("Alice Alpha")).toBeTruthy();
    expect(screen.getByText("Bob Beta")).toBeTruthy();
  });

  it("shows 'no position documented' for candidate without position on selected theme", () => {
    render(<CandidateList selectedThemeId="t1" />);
    // Expand Bob (no position on t1)
    fireEvent.press(screen.getByLabelText("Bob Beta, Party B"));
    expect(screen.getByText("Pas de position documentée")).toBeTruthy();
  });

  it("shows position when candidate has one", () => {
    render(<CandidateList selectedThemeId="t1" />);
    fireEvent.press(screen.getByLabelText("Alice Alpha, Party A"));
    expect(screen.getByText("Alice's transport position")).toBeTruthy();
  });
});
