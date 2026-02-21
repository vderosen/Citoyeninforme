/**
 * Dataset Loader
 *
 * Loads bundled JSON election data from 3 domain-organized files,
 * flattens nested structures, dereferences source IDs, and validates
 * referential integrity before returning an ElectionDataset.
 */

import type {
  ElectionDataset,
  Election,
  Candidate,
  Theme,
  Position,
  SurveyQuestion,
  StatementCard,
  CivicFact,
  ElectionLogistics,
  SourceReference,
  Measure,
  SurveyOption,
} from "./schema";

// Import bundled JSON dataset (3 domain-organized files)
import electionFileRaw from "./elections/paris-2026/election.json";
import candidatesFileRaw from "./elections/paris-2026/candidates.json";
import surveyFileRaw from "./elections/paris-2026/survey.json";

// ============================================================
// File schema types (match the JSON structure on disk)
// ============================================================

interface ElectionFileSchema {
  election: Election;
  logistics: {
    keyDates: ElectionLogistics["keyDates"];
    eligibility: ElectionLogistics["eligibility"];
    votingMethods: ElectionLogistics["votingMethods"];
    locations: ElectionLogistics["locations"];
    officialSources: SourceReference[];
  };
  civicFacts: Array<{
    id: string;
    text: string;
    category: string;
    source: SourceReference;
    order: number;
  }>;
}

interface CandidatesFileSchema {
  themes: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    displayOrder: number;
  }>;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    bio: string;
    communicationStyle: string;
    programSourceUrl: string;
    photoUrl?: string;
    partyColor?: string;
    positions: Array<{
      themeId: string;
      summary: string;
      details: string;
      sourceIds: string[];
      measures: Array<{ text: string; sourceIds: string[] }>;
      lastVerified: string;
    }>;
  }>;
  sources: Record<string, SourceReference>;
}

interface SurveyFileSchema {
  surveyQuestions: Array<{
    id: string;
    text: string;
    themeIds: string[];
    options: Array<{
      id: string;
      text: string;
      themeScores: Record<string, number>;
    }>;
    order: number;
  }>;
  statementCards: Array<{
    id: string;
    text: string;
    themeIds: string[];
    baseScores: Record<string, number>;
    order: number;
  }>;
}

// Cast JSON imports to their file schema types
const electionFile = electionFileRaw as unknown as ElectionFileSchema;
const candidatesFile = candidatesFileRaw as unknown as CandidatesFileSchema;
const surveyFile = surveyFileRaw as unknown as SurveyFileSchema;

export function loadBundledDataset(): ElectionDataset {
  const electionId = electionFile.election.id;
  const sources = candidatesFile.sources;

  // Build themes with electionId injected
  const themes: Theme[] = candidatesFile.themes.map((t) => ({
    id: t.id,
    electionId,
    name: t.name,
    icon: t.icon,
    description: t.description,
    displayOrder: t.displayOrder,
  }));

  // Build candidates (without positions) with electionId injected
  const candidates: Candidate[] = candidatesFile.candidates.map((c) => ({
    id: c.id,
    electionId,
    name: c.name,
    party: c.party,
    bio: c.bio,
    communicationStyle: c.communicationStyle,
    programSourceUrl: c.programSourceUrl,
    photoUrl: c.photoUrl,
    partyColor: c.partyColor,
  }));

  // Flatten nested positions into Position[] with candidateId injected
  // and sourceIds dereferenced to SourceReference[] objects
  const positions: Position[] = candidatesFile.candidates.flatMap((candidate) =>
    candidate.positions.map((p): Position => {
      const resolvedSources = p.sourceIds.map((sid) => {
        const source = sources[sid];
        if (!source) {
          throw new Error(
            `Position ${candidate.id}-${p.themeId}: unknown sourceId "${sid}"`
          );
        }
        return source;
      });

      const measures: Measure[] = p.measures.map((m) => ({
        text: m.text,
        sourceIds: m.sourceIds,
      }));

      return {
        id: `${candidate.id}-${p.themeId}`,
        candidateId: candidate.id,
        themeId: p.themeId,
        summary: p.summary,
        details: p.details,
        sources: resolvedSources,
        measures,
        lastVerified: p.lastVerified,
      };
    })
  );

  // Build survey questions with electionId injected
  const surveyQuestions: SurveyQuestion[] = surveyFile.surveyQuestions.map(
    (q) => ({
      id: q.id,
      electionId,
      text: q.text,
      themeIds: q.themeIds,
      options: q.options as SurveyOption[],
      order: q.order,
    })
  );

  // Build statement cards with electionId injected
  const statementCards: StatementCard[] = surveyFile.statementCards.map(
    (s) => ({
      id: s.id,
      electionId,
      text: s.text,
      themeIds: s.themeIds,
      baseScores: s.baseScores,
      order: s.order,
    })
  );

  // Build civic facts with electionId injected
  const civicFacts: CivicFact[] = electionFile.civicFacts.map((f) => ({
    id: f.id,
    electionId,
    text: f.text,
    category: f.category as CivicFact["category"],
    source: f.source,
    order: f.order,
  }));

  // Build logistics with electionId injected
  const logistics: ElectionLogistics = {
    electionId,
    keyDates: electionFile.logistics.keyDates,
    eligibility: electionFile.logistics.eligibility,
    votingMethods: electionFile.logistics.votingMethods,
    locations: electionFile.logistics.locations,
    officialSources: electionFile.logistics.officialSources,
  };

  const dataset: ElectionDataset = {
    election: electionFile.election,
    candidates,
    themes,
    positions,
    surveyQuestions,
    statementCards,
    civicFacts,
    logistics,
  };

  validateDataset(dataset, sources);
  return dataset;
}

export function validateDataset(
  dataset: ElectionDataset,
  sources?: Record<string, SourceReference>
): void {
  const errors: string[] = [];

  // Validate election
  if (!dataset.election.id) errors.push("Election id is required");
  if (!dataset.election.city) errors.push("Election city is required");
  if (!dataset.election.year) errors.push("Election year is required");
  if (!dataset.election.dataVersion)
    errors.push("Election dataVersion is required");

  // Validate candidates
  const candidateIds = new Set<string>();
  for (const candidate of dataset.candidates) {
    if (!candidate.id) errors.push("Candidate id is required");
    if (candidateIds.has(candidate.id))
      errors.push(`Duplicate candidate id: ${candidate.id}`);
    candidateIds.add(candidate.id);
    if (!candidate.name)
      errors.push(`Candidate ${candidate.id}: name required`);
    if (candidate.electionId !== dataset.election.id)
      errors.push(`Candidate ${candidate.id}: electionId mismatch`);
  }

  // Validate themes
  const themeIds = new Set<string>();
  for (const theme of dataset.themes) {
    if (!theme.id) errors.push("Theme id is required");
    if (themeIds.has(theme.id))
      errors.push(`Duplicate theme id: ${theme.id}`);
    themeIds.add(theme.id);
    if (theme.electionId !== dataset.election.id)
      errors.push(`Theme ${theme.id}: electionId mismatch`);
  }

  // Validate positions
  const positionPairs = new Set<string>();
  for (const position of dataset.positions) {
    if (!position.id) errors.push("Position id is required");
    if (!candidateIds.has(position.candidateId))
      errors.push(
        `Position ${position.id}: unknown candidateId ${position.candidateId}`
      );
    if (!themeIds.has(position.themeId))
      errors.push(
        `Position ${position.id}: unknown themeId ${position.themeId}`
      );
    const pair = `${position.candidateId}-${position.themeId}`;
    if (positionPairs.has(pair))
      errors.push(`Duplicate position for ${pair}`);
    positionPairs.add(pair);
    if (!position.sources || position.sources.length === 0)
      errors.push(
        `Position ${position.id}: at least one source required (Principle II)`
      );

    // Validate measures sourceIds reference existing sources
    if (sources) {
      for (const measure of position.measures) {
        for (const sid of measure.sourceIds) {
          if (!sources[sid])
            errors.push(
              `Position ${position.id} measure: unknown sourceId "${sid}"`
            );
        }
      }
    }
  }

  // Validate survey questions
  for (const question of dataset.surveyQuestions) {
    if (!question.id) errors.push("SurveyQuestion id is required");
    for (const themeId of question.themeIds) {
      if (!themeIds.has(themeId))
        errors.push(
          `Question ${question.id}: unknown themeId ${themeId}`
        );
    }
    if (!question.options || question.options.length < 2)
      errors.push(
        `Question ${question.id}: at least 2 options required`
      );
  }

  // Validate statement cards
  const statementCardIds = new Set<string>();
  for (const card of dataset.statementCards) {
    if (!card.id) errors.push("StatementCard id is required");
    if (statementCardIds.has(card.id))
      errors.push(`Duplicate statementCard id: ${card.id}`);
    statementCardIds.add(card.id);
    if (!card.text) errors.push(`StatementCard ${card.id}: text required`);
    if (card.electionId !== dataset.election.id)
      errors.push(`StatementCard ${card.id}: electionId mismatch`);
    if (!card.themeIds || card.themeIds.length === 0)
      errors.push(`StatementCard ${card.id}: at least 1 themeId required`);
    for (const themeId of card.themeIds ?? []) {
      if (!themeIds.has(themeId))
        errors.push(`StatementCard ${card.id}: unknown themeId ${themeId}`);
    }
    if (!card.baseScores || Object.keys(card.baseScores).length === 0)
      errors.push(`StatementCard ${card.id}: baseScores required`);
    for (const scoreThemeId of Object.keys(card.baseScores ?? {})) {
      if (!themeIds.has(scoreThemeId))
        errors.push(
          `StatementCard ${card.id}: unknown baseScores themeId ${scoreThemeId}`
        );
    }
  }

  // Validate civic facts
  for (const fact of dataset.civicFacts) {
    if (!fact.id) errors.push("CivicFact id is required");
    if (!fact.source)
      errors.push(`Fact ${fact.id}: source required (Principle II)`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Dataset validation failed:\n${errors.join("\n")}`
    );
  }
}
