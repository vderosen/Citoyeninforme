/**
 * Election Data Contracts
 *
 * These TypeScript interfaces define the shape of the election dataset
 * JSON files. All features (Learn page, survey, chatbot) consume data
 * through these contracts.
 *
 * Contract boundary: src/data/elections/{city-year}/*.json → application
 */

// === Source Reference (shared across entities) ===

export interface SourceReference {
  title: string;
  url: string;
  type: "program" | "statement" | "interview" | "official";
  accessDate: string; // ISO 8601
}

// === Election ===

export interface Election {
  id: string;
  city: string;
  type: string;
  year: number;
  votingRules: VotingRules;
  timeline: ElectionTimeline;
  dataVersion: string;
  lastUpdated: string; // ISO 8601
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

// === Candidate ===

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party: string;
  bio: string;
  communicationStyle: string;
  programSourceUrl: string;
  photoUrl?: string;
}

// === Theme ===

export interface Theme {
  id: string;
  electionId: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
}

// === Position ===

export interface Position {
  id: string;
  candidateId: string;
  themeId: string;
  summary: string;
  details: string;
  sources: SourceReference[];
  lastVerified: string; // ISO 8601
}

// === Survey ===

export interface SurveyQuestion {
  id: string;
  electionId: string;
  text: string;
  themeIds: string[];
  options: SurveyOption[];
  order: number;
}

export interface SurveyOption {
  id: string;
  text: string;
  themeScores: Record<string, number>;
}

// === Civic Facts ===

export interface CivicFact {
  id: string;
  electionId: string;
  text: string;
  category: "governance" | "voting" | "institutions";
  source: SourceReference;
  order: number;
}

// === Election Logistics ===

export interface ElectionLogistics {
  electionId: string;
  keyDates: LogisticsDate[];
  eligibility: EligibilityStep[];
  votingMethods: VotingMethod[];
  locations: VotingLocation[];
  officialSources: SourceReference[];
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

// === Complete Dataset Bundle ===

export interface ElectionDataset {
  election: Election;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  surveyQuestions: SurveyQuestion[];
  civicFacts: CivicFact[];
  logistics: ElectionLogistics;
}
