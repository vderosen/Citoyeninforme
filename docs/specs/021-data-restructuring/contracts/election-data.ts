/**
 * Election Data Contracts — v2 (021-data-restructuring)
 *
 * These TypeScript interfaces define:
 * 1. FILE SCHEMAS — the shape of the 3 JSON data files on disk
 * 2. RUNTIME TYPES — the shape of data consumed by the Zustand store and components
 *
 * The loader transforms file schemas into runtime types.
 *
 * Contract boundary: src/data/elections/{city-year}/*.json → loader → store → components
 */

// ============================================================
// SHARED TYPES (used in both file schemas and runtime)
// ============================================================

export interface SourceReference {
  title: string;
  url: string;
  type: "program" | "statement" | "interview" | "official";
  accessDate: string; // ISO 8601
}

export interface VotingRules {
  rounds: number;
  description: string;
}

export interface ElectionTimeline {
  registrationDeadline: string; // ISO 8601
  firstRound: string; // ISO 8601
  secondRound?: string; // ISO 8601
}

export interface LogisticsDate {
  label: string;
  date: string; // ISO 8601
  description?: string;
}

export interface EligibilityStep {
  order: number;
  text: string;
}

export interface VotingMethod {
  type: "in-person" | "proxy" | "mail";
  description: string;
  requirements?: string;
}

export interface VotingLocation {
  name: string;
  address: string;
  hours?: string;
  notes?: string;
}

export interface SurveyOption {
  id: string;
  text: string;
  themeScores: Record<string, number>;
}

// ============================================================
// FILE SCHEMAS — shape of data on disk (3 JSON files)
// ============================================================

/** election.json — institutional data */
export interface ElectionFile {
  election: {
    id: string;
    city: string;
    type: string;
    year: number;
    votingRules: VotingRules;
    timeline: ElectionTimeline;
    dataVersion: string;
    lastUpdated: string;
  };
  logistics: {
    keyDates: LogisticsDate[];
    eligibility: EligibilityStep[];
    votingMethods: VotingMethod[];
    locations: VotingLocation[];
    officialSources: SourceReference[];
  };
  civicFacts: CivicFactEntry[];
}

export interface CivicFactEntry {
  id: string;
  text: string;
  category: "governance" | "voting" | "institutions";
  source: SourceReference;
  order: number;
}

/** candidates.json — campaign data */
export interface CandidatesFile {
  themes: ThemeEntry[];
  candidates: CandidateEntry[];
  sources: Record<string, SourceReference>;
}

export interface ThemeEntry {
  id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface CandidateEntry {
  id: string;
  name: string;
  party: string;
  bio: string;
  communicationStyle: string;
  programSourceUrl: string;
  photoUrl?: string;
  partyColor?: string;
  positions: PositionEntry[];
}

export interface PositionEntry {
  themeId: string;
  summary: string;
  details: string;
  sourceIds: string[];
  measures: MeasureEntry[];
  lastVerified: string; // ISO 8601
}

export interface MeasureEntry {
  text: string;
  sourceIds: string[];
}

/** survey.json — interactive data */
export interface SurveyFile {
  surveyQuestions: SurveyQuestionEntry[];
  statementCards: StatementCardEntry[];
}

export interface SurveyQuestionEntry {
  id: string;
  text: string;
  themeIds: string[];
  options: SurveyOption[];
  order: number;
}

export interface StatementCardEntry {
  id: string;
  text: string;
  themeIds: string[];
  baseScores: Record<string, number>;
  order: number;
}

// ============================================================
// RUNTIME TYPES — shape of data consumed by store and components
// (These match the existing store API; the loader transforms
//  file schemas into these types.)
// ============================================================

export interface Election {
  id: string;
  city: string;
  type: string;
  year: number;
  votingRules: VotingRules;
  timeline: ElectionTimeline;
  dataVersion: string;
  lastUpdated: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party: string;
  bio: string;
  communicationStyle: string;
  programSourceUrl: string;
  photoUrl?: string;
  partyColor?: string;
}

export interface Theme {
  id: string;
  electionId: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface Position {
  id: string;
  candidateId: string;
  themeId: string;
  summary: string;
  details: string;
  sources: SourceReference[];
  measures: Measure[];
  lastVerified: string; // ISO 8601
}

export interface Measure {
  text: string;
  sourceIds: string[];
}

export interface SurveyQuestion {
  id: string;
  electionId: string;
  text: string;
  themeIds: string[];
  options: SurveyOption[];
  order: number;
}

export interface StatementCard {
  id: string;
  electionId: string;
  text: string;
  themeIds: string[];
  baseScores: Record<string, number>;
  order: number;
}

export interface CivicFact {
  id: string;
  electionId: string;
  text: string;
  category: "governance" | "voting" | "institutions";
  source: SourceReference;
  order: number;
}

export interface ElectionLogistics {
  electionId: string;
  keyDates: LogisticsDate[];
  eligibility: EligibilityStep[];
  votingMethods: VotingMethod[];
  locations: VotingLocation[];
  officialSources: SourceReference[];
}

/** Complete runtime dataset — same shape as before, consumed by Zustand store */
export interface ElectionDataset {
  election: Election;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  surveyQuestions: SurveyQuestion[];
  statementCards: StatementCard[];
  civicFacts: CivicFact[];
  logistics: ElectionLogistics;
}

// ============================================================
// LOADER CONTRACT
// ============================================================

/**
 * loadBundledDataset():
 *   1. Reads election.json, candidates.json, survey.json
 *   2. Flattens nested positions into Position[] (injects candidateId, generates id)
 *   3. Dereferences sourceIds into SourceReference[] objects
 *   4. Injects electionId into candidates, themes, survey questions, etc.
 *   5. Validates referential integrity
 *   6. Returns ElectionDataset
 *
 * The store calls loadDataset(dataset) — no changes to store API.
 */
