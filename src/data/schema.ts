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

export interface Measure {
  text: string;
  sourceIds: string[];
}

export interface Position {
  id: string;
  candidateId: string;
  themeId: string;
  summary: string;
  details: string;
  sources: SourceReference[];
  measures: Measure[];
  lastVerified: string;
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

export type SwipeDirection =
  | "agree"
  | "disagree"
  | "strongly_agree"
  | "strongly_disagree"
  | "skip";

export interface StatementCard {
  id: string;
  electionId: string;
  text: string;
  description?: string;
  candidateIds: string[];
  opposingCandidateIds?: string[];
  order: number;
}

export interface ElectionDataset {
  election: Election;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  statementCards: StatementCard[];
  civicFacts: CivicFact[];
  logistics: ElectionLogistics;
}
