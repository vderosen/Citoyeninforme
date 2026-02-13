/**
 * Dataset Loader
 *
 * Loads bundled JSON election data and validates against schema types.
 * SQLite initialization is in database.native.ts / database.web.ts
 */

import type {
  ElectionDataset,
  Election,
  Candidate,
  Theme,
  Position,
  SurveyQuestion,
  CivicFact,
  ElectionLogistics,
} from "./schema";

// Import bundled JSON dataset
import electionData from "./elections/paris-2026/election.json";
import candidatesData from "./elections/paris-2026/candidates.json";
import themesData from "./elections/paris-2026/themes.json";
import positionsData from "./elections/paris-2026/positions.json";
import surveyQuestionsData from "./elections/paris-2026/survey-questions.json";
import civicFactsData from "./elections/paris-2026/civic-facts.json";
import logisticsData from "./elections/paris-2026/logistics.json";

export { initializeDatabase } from "./database";

export function loadBundledDataset(): ElectionDataset {
  const dataset: ElectionDataset = {
    election: electionData as Election,
    candidates: candidatesData as Candidate[],
    themes: themesData as Theme[],
    positions: positionsData as Position[],
    surveyQuestions: surveyQuestionsData as SurveyQuestion[],
    civicFacts: civicFactsData as CivicFact[],
    logistics: logisticsData as ElectionLogistics,
  };

  validateDataset(dataset);
  return dataset;
}

export function validateDataset(dataset: ElectionDataset): void {
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
    if (!candidate.name) errors.push(`Candidate ${candidate.id}: name required`);
    if (candidate.electionId !== dataset.election.id)
      errors.push(
        `Candidate ${candidate.id}: electionId mismatch`
      );
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

  // Validate civic facts
  for (const fact of dataset.civicFacts) {
    if (!fact.id) errors.push("CivicFact id is required");
    if (!fact.source) errors.push(`Fact ${fact.id}: source required (Principle II)`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Dataset validation failed:\n${errors.join("\n")}`
    );
  }
}
