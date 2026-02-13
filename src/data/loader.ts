/**
 * Dataset Loader
 *
 * Loads bundled JSON election data, validates against schema types,
 * and inserts into SQLite for efficient querying.
 */

import * as SQLite from "expo-sqlite";
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

const DB_NAME = "lucide.db";

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

export async function initializeDatabase(
  dataset: ElectionDataset
): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS elections (
      id TEXT PRIMARY KEY,
      city TEXT NOT NULL,
      type TEXT NOT NULL,
      year INTEGER NOT NULL,
      voting_rules TEXT NOT NULL,
      timeline TEXT NOT NULL,
      data_version TEXT NOT NULL,
      last_updated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL REFERENCES elections(id),
      name TEXT NOT NULL,
      party TEXT NOT NULL,
      bio TEXT NOT NULL,
      communication_style TEXT NOT NULL,
      program_source_url TEXT NOT NULL,
      photo_url TEXT
    );

    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL REFERENCES elections(id),
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES candidates(id),
      theme_id TEXT NOT NULL REFERENCES themes(id),
      summary TEXT NOT NULL,
      details TEXT NOT NULL,
      sources TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      UNIQUE(candidate_id, theme_id)
    );

    CREATE TABLE IF NOT EXISTS survey_questions (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL REFERENCES elections(id),
      text TEXT NOT NULL,
      theme_ids TEXT NOT NULL,
      options TEXT NOT NULL,
      display_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS civic_facts (
      id TEXT PRIMARY KEY,
      election_id TEXT NOT NULL REFERENCES elections(id),
      text TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('governance', 'voting', 'institutions')),
      source TEXT NOT NULL,
      display_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS election_logistics (
      election_id TEXT PRIMARY KEY REFERENCES elections(id),
      key_dates TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      voting_methods TEXT NOT NULL,
      locations TEXT NOT NULL,
      official_sources TEXT NOT NULL
    );
  `);

  // Check if data already loaded with same version
  const existing = await db.getFirstAsync<{ data_version: string }>(
    "SELECT data_version FROM elections WHERE id = ?",
    dataset.election.id
  );

  if (existing?.data_version === dataset.election.dataVersion) {
    return db;
  }

  // Clear and reload
  await db.execAsync(`
    DELETE FROM election_logistics;
    DELETE FROM civic_facts;
    DELETE FROM survey_questions;
    DELETE FROM positions;
    DELETE FROM candidates;
    DELETE FROM themes;
    DELETE FROM elections;
  `);

  // Insert election
  await db.runAsync(
    `INSERT INTO elections (id, city, type, year, voting_rules, timeline, data_version, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    dataset.election.id,
    dataset.election.city,
    dataset.election.type,
    dataset.election.year,
    JSON.stringify(dataset.election.votingRules),
    JSON.stringify(dataset.election.timeline),
    dataset.election.dataVersion,
    dataset.election.lastUpdated
  );

  // Insert themes
  for (const theme of dataset.themes) {
    await db.runAsync(
      `INSERT INTO themes (id, election_id, name, icon, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      theme.id,
      theme.electionId,
      theme.name,
      theme.icon,
      theme.description,
      theme.displayOrder
    );
  }

  // Insert candidates
  for (const candidate of dataset.candidates) {
    await db.runAsync(
      `INSERT INTO candidates (id, election_id, name, party, bio, communication_style, program_source_url, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      candidate.id,
      candidate.electionId,
      candidate.name,
      candidate.party,
      candidate.bio,
      candidate.communicationStyle,
      candidate.programSourceUrl,
      candidate.photoUrl ?? null
    );
  }

  // Insert positions
  for (const position of dataset.positions) {
    await db.runAsync(
      `INSERT INTO positions (id, candidate_id, theme_id, summary, details, sources, last_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      position.id,
      position.candidateId,
      position.themeId,
      position.summary,
      position.details,
      JSON.stringify(position.sources),
      position.lastVerified
    );
  }

  // Insert survey questions
  for (const question of dataset.surveyQuestions) {
    await db.runAsync(
      `INSERT INTO survey_questions (id, election_id, text, theme_ids, options, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      question.id,
      question.electionId,
      question.text,
      JSON.stringify(question.themeIds),
      JSON.stringify(question.options),
      question.order
    );
  }

  // Insert civic facts
  for (const fact of dataset.civicFacts) {
    await db.runAsync(
      `INSERT INTO civic_facts (id, election_id, text, category, source, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      fact.id,
      fact.electionId,
      fact.text,
      fact.category,
      JSON.stringify(fact.source),
      fact.order
    );
  }

  // Insert logistics
  await db.runAsync(
    `INSERT INTO election_logistics (election_id, key_dates, eligibility, voting_methods, locations, official_sources)
     VALUES (?, ?, ?, ?, ?, ?)`,
    dataset.logistics.electionId,
    JSON.stringify(dataset.logistics.keyDates),
    JSON.stringify(dataset.logistics.eligibility),
    JSON.stringify(dataset.logistics.votingMethods),
    JSON.stringify(dataset.logistics.locations),
    JSON.stringify(dataset.logistics.officialSources)
  );

  return db;
}
