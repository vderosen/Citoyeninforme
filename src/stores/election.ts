import { create } from "zustand";
import type {
  Election,
  Candidate,
  Theme,
  Position,
  SurveyQuestion,
  CivicFact,
  ElectionLogistics,
  ElectionDataset,
} from "../data/schema";

interface ElectionState {
  election: Election | null;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  surveyQuestions: SurveyQuestion[];
  civicFacts: CivicFact[];
  logistics: ElectionLogistics | null;
  isLoaded: boolean;
  error: string | null;

  loadDataset: (dataset: ElectionDataset) => void;
  getCandidateById: (id: string) => Candidate | undefined;
  getThemeById: (id: string) => Theme | undefined;
  getPositionsForCandidate: (candidateId: string) => Position[];
  getPositionsForTheme: (themeId: string) => Position[];
  getPositionForCandidateTheme: (
    candidateId: string,
    themeId: string
  ) => Position | undefined;
}

export const useElectionStore = create<ElectionState>((set, get) => ({
  election: null,
  candidates: [],
  themes: [],
  positions: [],
  surveyQuestions: [],
  civicFacts: [],
  logistics: null,
  isLoaded: false,
  error: null,

  loadDataset: (dataset: ElectionDataset) => {
    set({
      election: dataset.election,
      candidates: dataset.candidates,
      themes: dataset.themes.sort((a, b) => a.displayOrder - b.displayOrder),
      positions: dataset.positions,
      surveyQuestions: dataset.surveyQuestions.sort(
        (a, b) => a.order - b.order
      ),
      civicFacts: dataset.civicFacts.sort((a, b) => a.order - b.order),
      logistics: dataset.logistics,
      isLoaded: true,
      error: null,
    });
  },

  getCandidateById: (id: string) =>
    get().candidates.find((c) => c.id === id),

  getThemeById: (id: string) => get().themes.find((t) => t.id === id),

  getPositionsForCandidate: (candidateId: string) =>
    get().positions.filter((p) => p.candidateId === candidateId),

  getPositionsForTheme: (themeId: string) =>
    get().positions.filter((p) => p.themeId === themeId),

  getPositionForCandidateTheme: (candidateId: string, themeId: string) =>
    get().positions.find(
      (p) => p.candidateId === candidateId && p.themeId === themeId
    ),
}));
