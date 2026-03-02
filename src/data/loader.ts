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
  StatementCard,
  CivicFact,
  ElectionLogistics,
  SourceReference,
  Measure,
} from "./schema";

import electionFileRaw from "./elections/paris-2026/election.json";
import candidatesFileRaw from "./elections/paris-2026/candidates.json";
// Fallback to require to bypass out-of-root tsconfig restrictions
const proposalsFileRaw = require("../../data_pipeline/proposals/proposals.json");

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

interface ProposalItem {
  card_id: string;
  candidat: string;
  titre_canonique: string;
  description_canonique_revisitée: string;
}

const VS_SUFFIX = " VS";

function isVsCardId(cardId: string): boolean {
  return cardId.endsWith(VS_SUFFIX);
}

function toBaseCardId(vsCardId: string): string {
  return vsCardId.slice(0, -VS_SUFFIX.length);
}

function pushUnique(target: string[], value: string): void {
  if (!target.includes(value)) {
    target.push(value);
  }
}

// Cast JSON imports to their file schema types
const electionFile = electionFileRaw as unknown as ElectionFileSchema;
const candidatesFile = candidatesFileRaw as unknown as CandidatesFileSchema;
const proposalsFile = proposalsFileRaw as unknown as ProposalItem[];

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

  // Clean up candidate names for matching
  const normalizeName = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();

  // Create a fast lookup map for Candidates: { "normalized name": "candidate-id" }
  const candidateLookup = new Map<string, string>();
  candidates.forEach(c => candidateLookup.set(normalizeName(c.name), c.id));

  // Initialize a map to aggregate proposals by card_id
  const statementMap = new Map<string, StatementCard>();
  let orderCounter = 1;

  proposalsFile.forEach(prop => {
    // Basic validation
    if (!prop.card_id || !prop.candidat || prop.candidat === "Anonyme") return;

    // Legacy support: some datasets encode opposition in the candidate label.
    const isOpposing = prop.candidat.endsWith(VS_SUFFIX);
    const cleanCandidat = isOpposing
      ? prop.candidat.slice(0, -VS_SUFFIX.length).trim()
      : prop.candidat;

    // Resolve candidate ID
    const normalizedTarget = normalizeName(cleanCandidat);
    // Hardcoded aliases: proposals.json uses short last names
    const aliases: Record<string, string> = {
      "dati": "rachida-dati",
      "gregoire": "emmanuel-gregoire",
      "chikirou": "sophia-chikirou",
      "bournazel": "pierre-yves-bournazel",
      "knafo": "sarah-knafo",
      "mariani": "thierry-mariani",
    };

    let candidateId = candidateLookup.get(normalizedTarget);

    if (!candidateId && aliases[normalizedTarget]) {
      candidateId = aliases[normalizedTarget];
    }

    // If we still can't find it, skip
    if (!candidateId) {
      console.warn(`[loader] Skipping unknown candidate: "${prop.candidat}" on card ${prop.card_id}`);
      return;
    }

    if (!statementMap.has(prop.card_id)) {
      const category = (prop as any).secteur || (prop as any).Catégorie || 'Autre';
      statementMap.set(prop.card_id, {
        id: prop.card_id,
        electionId,
        category,
        text: prop.titre_canonique || prop.card_id,
        description: prop.description_canonique_revisitée,
        candidateIds: [],
        opposingCandidateIds: [],
        order: orderCounter++
      });
    }

    const card = statementMap.get(prop.card_id)!;

    // Add candidate to the correct array
    if (isOpposing) {
      if (!card.opposingCandidateIds) card.opposingCandidateIds = [];
      pushUnique(card.opposingCandidateIds, candidateId);
      return;
    }

    pushUnique(card.candidateIds, candidateId);
  });

  // Merge hidden "... VS" cards into their base card:
  // - base card remains visible in the swipe deck
  // - VS candidates become opposingCandidateIds on the base card
  const vsCardIds = Array.from(statementMap.keys()).filter(isVsCardId);
  for (const vsCardId of vsCardIds) {
    const vsCard = statementMap.get(vsCardId);
    if (!vsCard) continue;

    const baseCardId = toBaseCardId(vsCardId);
    const baseCard = statementMap.get(baseCardId);
    if (!baseCard) {
      continue;
    }

    if (!baseCard.opposingCandidateIds) {
      baseCard.opposingCandidateIds = [];
    }

    for (const candidateId of vsCard.candidateIds ?? []) {
      pushUnique(baseCard.opposingCandidateIds, candidateId);
    }

    // Handle the edge case where a VS row itself is marked as opposing.
    for (const candidateId of vsCard.opposingCandidateIds ?? []) {
      pushUnique(baseCard.candidateIds, candidateId);
    }

    baseCard.opposingCandidateIds = baseCard.opposingCandidateIds.filter(
      (candidateId) => !baseCard.candidateIds.includes(candidateId)
    );

    statementMap.delete(vsCardId);
  }

  const statementCards = Array.from(statementMap.values());

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

  // Validation of survey options removed since surveyQuestions was removed

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
    if (!card.candidateIds || card.candidateIds.length === 0)
      errors.push(`StatementCard ${card.id}: at least 1 candidateId required`);
    for (const cid of card.candidateIds ?? []) {
      if (!candidateIds.has(cid))
        errors.push(`StatementCard ${card.id}: unknown candidateId ${cid}`);
    }
    for (const cid of card.opposingCandidateIds ?? []) {
      if (!candidateIds.has(cid))
        errors.push(`StatementCard ${card.id}: unknown opposingCandidateId ${cid}`);
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
