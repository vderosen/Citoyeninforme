#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT_DIR = path.resolve(__dirname, "..");
const CANDIDATES_FILE = path.join(
  ROOT_DIR,
  "src/data/elections/paris-2026/candidates.json"
);
const PROPOSALS_FILE = path.join(
  ROOT_DIR,
  "data_pipeline/proposals/proposals.json"
);
const OUTPUT_DIR = path.join(ROOT_DIR, "docs/revue-candidats-paris-2026");
const VS_SUFFIX = " VS";

const ALIASES = {
  dati: "rachida-dati",
  gregoire: "emmanuel-gregoire",
  chikirou: "sophia-chikirou",
  bournazel: "pierre-yves-bournazel",
  knafo: "sarah-knafo",
  mariani: "thierry-mariani",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function pushUnique(target, value) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function isVsCardId(cardId) {
  return String(cardId).endsWith(VS_SUFFIX);
}

function baseCardIdFromVs(cardId) {
  return String(cardId).slice(0, -VS_SUFFIX.length);
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureOutputDir(outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function buildCards(candidates, proposals) {
  const candidateLookup = new Map();
  for (const candidate of candidates) {
    candidateLookup.set(normalizeName(candidate.name), candidate.id);
  }

  const statementMap = new Map();
  let orderCounter = 1;

  for (const proposal of proposals) {
    if (!proposal.card_id || !proposal.candidat || proposal.candidat === "Anonyme") {
      continue;
    }

    const isOpposingCandidate = proposal.candidat.endsWith(VS_SUFFIX);
    const cleanCandidateName = isOpposingCandidate
      ? proposal.candidat.slice(0, -VS_SUFFIX.length).trim()
      : proposal.candidat;

    const normalizedTarget = normalizeName(cleanCandidateName);
    const candidateId =
      candidateLookup.get(normalizedTarget) ?? ALIASES[normalizedTarget];

    if (!candidateId) {
      continue;
    }

    if (!statementMap.has(proposal.card_id)) {
      statementMap.set(proposal.card_id, {
        id: proposal.card_id,
        text: proposal.titre_canonique || proposal.card_id,
        description: proposal.description_canonique_revisitée || "",
        category: proposal.secteur || proposal["Catégorie"] || "Autre",
        order: orderCounter++,
        candidateIds: [],
        opposingCandidateIds: [],
      });
    }

    const card = statementMap.get(proposal.card_id);
    if (isOpposingCandidate) {
      pushUnique(card.opposingCandidateIds, candidateId);
    } else {
      pushUnique(card.candidateIds, candidateId);
    }
  }

  const vsCardIds = Array.from(statementMap.keys()).filter(isVsCardId);
  for (const vsCardId of vsCardIds) {
    const vsCard = statementMap.get(vsCardId);
    if (!vsCard) continue;

    const baseCardId = baseCardIdFromVs(vsCardId);
    const baseCard = statementMap.get(baseCardId);
    if (!baseCard) continue;

    for (const candidateId of vsCard.candidateIds) {
      pushUnique(baseCard.opposingCandidateIds, candidateId);
    }
    for (const candidateId of vsCard.opposingCandidateIds) {
      pushUnique(baseCard.candidateIds, candidateId);
    }

    baseCard.opposingCandidateIds = baseCard.opposingCandidateIds.filter(
      (candidateId) => !baseCard.candidateIds.includes(candidateId)
    );

    statementMap.delete(vsCardId);
  }

  return Array.from(statementMap.values()).sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return String(a.id).localeCompare(String(b.id), "fr");
  });
}

function candidateRelation(card, candidateId) {
  const supports = card.candidateIds.includes(candidateId);
  const opposes = card.opposingCandidateIds.includes(candidateId);
  if (supports && opposes) return "Mixte";
  if (supports) return "Soutien";
  if (opposes) return "Opposition";
  return null;
}

function appendSheet(workbook, name, rows, colWidths) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  if (colWidths && colWidths.length > 0) {
    worksheet["!cols"] = colWidths.map((wch) => ({ wch }));
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

function createCandidateWorkbook(candidate, cards, generatedDate, outputFilePath) {
  const workbook = XLSX.utils.book_new();

  const relatedCards = cards
    .map((card) => ({
      card,
      relation: candidateRelation(card, candidate.id),
    }))
    .filter((item) => item.relation !== null)
    .sort((a, b) => {
      if (a.card.order !== b.card.order) return a.card.order - b.card.order;
      return String(a.card.id).localeCompare(String(b.card.id), "fr");
    });

  const supportCount = relatedCards.filter((item) => item.relation === "Soutien").length;
  const oppositionCount = relatedCards.filter((item) => item.relation === "Opposition").length;
  const mixedCount = relatedCards.filter((item) => item.relation === "Mixte").length;

  appendSheet(
    workbook,
    "Identite",
    [
      { Champ: "Document genere le", Valeur: generatedDate },
      { Champ: "Nom", Valeur: candidate.name },
      { Champ: "ID technique", Valeur: candidate.id },
      { Champ: "Parti", Valeur: candidate.party },
      { Champ: "Programme officiel", Valeur: candidate.programSourceUrl || "" },
      { Champ: "Cartes liees (total)", Valeur: relatedCards.length },
      { Champ: "Cartes en soutien", Valeur: supportCount },
      { Champ: "Cartes en opposition", Valeur: oppositionCount },
      { Champ: "Cartes mixtes", Valeur: mixedCount },
      {
        Champ: "Instruction de retour",
        Valeur:
          "Remplir les colonnes de feedback dans l'onglet Cartes uniquement si un changement est souhaite.",
      },
    ],
    [28, 95]
  );

  appendSheet(
    workbook,
    "Points",
    [
      { Cas: "Soutien", "Reponse utilisateur": "Vraiment d'accord", "Effet score candidat": 2 },
      { Cas: "Soutien", "Reponse utilisateur": "D'accord", "Effet score candidat": 1 },
      { Cas: "Soutien", "Reponse utilisateur": "Pas d'avis", "Effet score candidat": 0 },
      { Cas: "Soutien", "Reponse utilisateur": "Pas d'accord", "Effet score candidat": -1 },
      { Cas: "Soutien", "Reponse utilisateur": "Vraiment pas d'accord", "Effet score candidat": -2 },
      { Cas: "Opposition", "Reponse utilisateur": "Vraiment d'accord", "Effet score candidat": -2 },
      { Cas: "Opposition", "Reponse utilisateur": "D'accord", "Effet score candidat": -1 },
      { Cas: "Opposition", "Reponse utilisateur": "Pas d'avis", "Effet score candidat": 0 },
      { Cas: "Opposition", "Reponse utilisateur": "Pas d'accord", "Effet score candidat": 1 },
      { Cas: "Opposition", "Reponse utilisateur": "Vraiment pas d'accord", "Effet score candidat": 2 },
    ],
    [14, 26, 20]
  );

  appendSheet(
    workbook,
    "Cartes",
    relatedCards.map((item, index) => ({
      Numero: index + 1,
      Card_ID: item.card.id,
      Statut: item.relation,
      Categorie: item.card.category || "Autre",
      Ordre: item.card.order,
      Texte_actuel: item.card.text,
      Description_actuelle: item.card.description,
      Nouveau_texte_propose: "",
      Nouvelle_description_proposee: "",
      Justification_source: "",
    })),
    [8, 14, 12, 14, 8, 50, 90, 40, 55, 45]
  );

  XLSX.writeFile(workbook, outputFilePath);

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    supportCount,
    oppositionCount,
    totalCount: relatedCards.length,
    fileName: path.basename(outputFilePath),
  };
}

function main() {
  const candidatesData = readJson(CANDIDATES_FILE);
  const proposals = readJson(PROPOSALS_FILE);
  const candidates = candidatesData.candidates || [];

  if (candidates.length === 0) {
    throw new Error("Aucun candidat trouve dans candidates.json.");
  }

  ensureOutputDir(OUTPUT_DIR);
  const cards = buildCards(candidates, proposals);
  const generatedDate = new Date().toISOString().slice(0, 10);

  const summaries = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const prefix = String(i + 1).padStart(2, "0");
    const fileName = `${prefix}-${slugify(candidate.name)}.xlsx`;
    const outputFilePath = path.join(OUTPUT_DIR, fileName);
    const summary = createCandidateWorkbook(
      candidate,
      cards,
      generatedDate,
      outputFilePath
    );
    summaries.push(summary);
  }

  const indexWorkbook = XLSX.utils.book_new();
  const indexRows = summaries.map((item) => ({
    Candidat: item.candidateName,
    Fichier: item.fileName,
    Cartes_total: item.totalCount,
    Cartes_soutien: item.supportCount,
    Cartes_opposition: item.oppositionCount,
    Genere_le: generatedDate,
  }));
  const indexSheet = XLSX.utils.json_to_sheet(indexRows);
  indexSheet["!cols"] = [28, 36, 14, 16, 18, 12].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(indexWorkbook, indexSheet, "Index");
  XLSX.writeFile(indexWorkbook, path.join(OUTPUT_DIR, "README.xlsx"));

  console.log(`Excels generes dans: ${OUTPUT_DIR}`);
  console.log(`Nombre de candidats: ${candidates.length}`);
  console.log(`Nombre total de cartes (runtime): ${cards.length}`);
}

main();
