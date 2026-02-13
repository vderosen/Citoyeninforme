/**
 * Election Dataset Schema
 *
 * TypeScript types for the election dataset, matching contracts/election-data.ts.
 * All features consume data through these types.
 */

export interface SourceReference {
  title: string;
  url: string;
  type: "program" | "statement" | "interview" | "official";
  accessDate: string;
}

export interface VotingRules {
  rounds: number;
  description: string;
}

export interface ElectionTimeline {
  registrationDeadline: string;
  firstRound: string;
  secondRound?: string;
}

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
  lastVerified: string;
}

export interface SurveyOption {
  id: string;
  text: string;
  themeScores: Record<string, number>;
}

export interface SurveyQuestion {
  id: string;
  electionId: string;
  text: string;
  themeIds: string[];
  options: SurveyOption[];
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

export interface LogisticsDate {
  label: string;
  date: string;
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

export interface ElectionLogistics {
  electionId: string;
  keyDates: LogisticsDate[];
  eligibility: EligibilityStep[];
  votingMethods: VotingMethod[];
  locations: VotingLocation[];
  officialSources: SourceReference[];
}

export interface ElectionDataset {
  election: Election;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  surveyQuestions: SurveyQuestion[];
  civicFacts: CivicFact[];
  logistics: ElectionLogistics;
}
