import { validateDataset } from "../../src/data/loader";
import type { ElectionDataset } from "../../src/data/schema";

function createValidDataset(): ElectionDataset {
  return {
    election: {
      id: "test-election-2026",
      city: "TestCity",
      type: "Municipales",
      year: 2026,
      votingRules: { rounds: 2, description: "Two-round system" },
      timeline: {
        registrationDeadline: "2026-03-01",
        firstRound: "2026-03-15",
        secondRound: "2026-03-22",
      },
      dataVersion: "1.0.0",
      lastUpdated: "2026-02-13",
    },
    candidates: [
      {
        id: "candidate-1",
        electionId: "test-election-2026",
        name: "Test Candidate",
        party: "Test Party",
        bio: "A test candidate.",
        communicationStyle: "Direct",
        programSourceUrl: "https://example.com/program",
      },
    ],
    themes: [
      {
        id: "theme-1",
        electionId: "test-election-2026",
        name: "Test Theme",
        icon: "star",
        description: "A test theme",
        displayOrder: 1,
      },
    ],
    positions: [
      {
        id: "pos-1",
        candidateId: "candidate-1",
        themeId: "theme-1",
        summary: "Test position summary",
        details: "Detailed position text",
        sources: [
          {
            title: "Source",
            url: "https://example.com/source",
            type: "program",
            accessDate: "2026-02-10",
          },
        ],
        lastVerified: "2026-02-10",
      },
    ],
    surveyQuestions: [
      {
        id: "q1",
        electionId: "test-election-2026",
        text: "Test question?",
        themeIds: ["theme-1"],
        options: [
          { id: "q1-a", text: "Option A", themeScores: { "theme-1": 1 } },
          { id: "q1-b", text: "Option B", themeScores: { "theme-1": -1 } },
        ],
        order: 1,
      },
    ],
    civicFacts: [
      {
        id: "fact-1",
        electionId: "test-election-2026",
        text: "A civic fact.",
        category: "governance",
        source: {
          title: "Source",
          url: "https://example.com",
          type: "official",
          accessDate: "2026-02-10",
        },
        order: 1,
      },
    ],
    logistics: {
      electionId: "test-election-2026",
      keyDates: [{ label: "First round", date: "2026-03-15" }],
      eligibility: [{ order: 1, text: "Be 18+" }],
      votingMethods: [
        { type: "in-person", description: "Go to your polling station" },
      ],
      locations: [{ name: "City Hall", address: "1 Main St" }],
      officialSources: [
        {
          title: "Official",
          url: "https://example.com",
          type: "official",
          accessDate: "2026-02-10",
        },
      ],
    },
  };
}

describe("validateDataset", () => {
  it("accepts a valid dataset", () => {
    expect(() => validateDataset(createValidDataset())).not.toThrow();
  });

  it("rejects dataset with missing election id", () => {
    const dataset = createValidDataset();
    dataset.election.id = "";
    expect(() => validateDataset(dataset)).toThrow("Election id is required");
  });

  it("rejects dataset with duplicate candidate ids", () => {
    const dataset = createValidDataset();
    dataset.candidates.push({ ...dataset.candidates[0] });
    expect(() => validateDataset(dataset)).toThrow("Duplicate candidate id");
  });

  it("rejects dataset with duplicate theme ids", () => {
    const dataset = createValidDataset();
    dataset.themes.push({ ...dataset.themes[0] });
    expect(() => validateDataset(dataset)).toThrow("Duplicate theme id");
  });

  it("rejects position with unknown candidateId", () => {
    const dataset = createValidDataset();
    dataset.positions[0].candidateId = "unknown";
    expect(() => validateDataset(dataset)).toThrow("unknown candidateId");
  });

  it("rejects position with unknown themeId", () => {
    const dataset = createValidDataset();
    dataset.positions[0].themeId = "unknown";
    expect(() => validateDataset(dataset)).toThrow("unknown themeId");
  });

  it("rejects position without sources (Principle II)", () => {
    const dataset = createValidDataset();
    dataset.positions[0].sources = [];
    expect(() => validateDataset(dataset)).toThrow(
      "at least one source required"
    );
  });

  it("rejects duplicate position for same candidate-theme pair", () => {
    const dataset = createValidDataset();
    dataset.positions.push({ ...dataset.positions[0], id: "pos-2" });
    expect(() => validateDataset(dataset)).toThrow("Duplicate position");
  });

  it("rejects survey question with unknown themeId", () => {
    const dataset = createValidDataset();
    dataset.surveyQuestions[0].themeIds = ["unknown-theme"];
    expect(() => validateDataset(dataset)).toThrow("unknown themeId");
  });

  it("rejects survey question with fewer than 2 options", () => {
    const dataset = createValidDataset();
    dataset.surveyQuestions[0].options = [
      { id: "q1-a", text: "Only option", themeScores: { "theme-1": 1 } },
    ];
    expect(() => validateDataset(dataset)).toThrow("at least 2 options");
  });

  it("rejects civic fact without source", () => {
    const dataset = createValidDataset();
    (dataset.civicFacts[0] as any).source = null;
    expect(() => validateDataset(dataset)).toThrow("source required");
  });

  it("rejects candidate with mismatched electionId", () => {
    const dataset = createValidDataset();
    dataset.candidates[0].electionId = "wrong-election";
    expect(() => validateDataset(dataset)).toThrow("electionId mismatch");
  });
});
