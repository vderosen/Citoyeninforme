#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

function toBlockQuote(text) {
  const lines = String(text ?? "")
    .trim()
    .split(/\r?\n/);
  if (lines.length === 1 && !lines[0]) {
    return "> (vide)";
  }
  return lines.map((line) => `> ${line || " "}`).join("\n");
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
  if (supports && opposes) return "mixte";
  if (supports) return "soutien";
  if (opposes) return "opposition";
  return null;
}

function scoreTableRows(type) {
  if (type === "soutien") {
    return [
      "| Réponse utilisateur | Effet sur le score du candidat |",
      "| --- | --- |",
      "| Vraiment d'accord | +2 |",
      "| D'accord | +1 |",
      "| Pas d'avis | 0 |",
      "| Pas d'accord | -1 |",
      "| Vraiment pas d'accord | -2 |",
    ];
  }

  return [
    "| Réponse utilisateur | Effet sur le score du candidat (logique inversée) |",
    "| --- | --- |",
    "| Vraiment d'accord | -2 |",
    "| D'accord | -1 |",
    "| Pas d'avis | 0 |",
    "| Pas d'accord | +1 |",
    "| Vraiment pas d'accord | +2 |",
  ];
}

function buildCandidateDocument(candidate, relatedCards, generatedDate) {
  const supportCards = relatedCards.filter((item) => item.relation === "soutien");
  const opposingCards = relatedCards.filter((item) => item.relation === "opposition");
  const mixedCards = relatedCards.filter((item) => item.relation === "mixte");

  const lines = [];
  lines.push(`# Revue candidat - ${candidate.name}`);
  lines.push("");
  lines.push(
    `Document généré le ${generatedDate} pour validation externe par l'équipe du/de la candidat(e).`
  );
  lines.push("");
  lines.push("## Ce document sert à");
  lines.push("");
  lines.push("- Vérifier comment ce candidat est représenté dans les cartes de l'app.");
  lines.push("- Proposer un nouveau texte ou une nouvelle description carte par carte.");
  lines.push("- Comprendre l'impact des réponses utilisateur sur le score de ce candidat.");
  lines.push("");
  lines.push("## Identité candidat");
  lines.push("");
  lines.push(`- Nom: ${candidate.name}`);
  lines.push(`- Id technique: \`${candidate.id}\``);
  lines.push(`- Parti: ${candidate.party}`);
  lines.push(`- Programme officiel: ${candidate.programSourceUrl || "(non renseigné)"}`);
  lines.push(`- Nombre total de cartes liées: ${relatedCards.length}`);
  lines.push(`- Cartes en soutien: ${supportCards.length}`);
  lines.push(`- Cartes en opposition: ${opposingCards.length}`);
  if (mixedCards.length > 0) {
    lines.push(`- Cartes mixtes (anomalie de données): ${mixedCards.length}`);
  }
  lines.push("");
  lines.push("## Système de points");
  lines.push("");
  lines.push("### Cas 1 - Carte en soutien de ce candidat");
  lines.push("");
  lines.push(...scoreTableRows("soutien"));
  lines.push("");
  lines.push("### Cas 2 - Carte en opposition à ce candidat");
  lines.push("");
  lines.push(...scoreTableRows("opposition"));
  lines.push("");
  lines.push(
    "Règle appliquée dans l'app: les cartes en opposition inversent automatiquement le signe des points."
  );
  lines.push("");
  lines.push("## Cartes à valider");
  lines.push("");
  lines.push(
    "Instruction de retour: sous chaque carte, remplissez la section `Feedback candidat` uniquement si vous voulez un changement."
  );
  lines.push("");

  for (let index = 0; index < relatedCards.length; index += 1) {
    const item = relatedCards[index];
    const card = item.card;
    const relationLabel =
      item.relation === "soutien"
        ? "Position soutenue par le candidat"
        : item.relation === "opposition"
          ? "Position opposée au candidat"
          : "Mixte (à vérifier)";

    lines.push(`### Carte ${String(index + 1).padStart(2, "0")} - ${card.id}`);
    lines.push("");
    lines.push(`- Statut dans l'app: ${relationLabel}`);
    lines.push(`- Catégorie: ${card.category || "Autre"}`);
    lines.push(`- Ordre interne: ${card.order}`);
    lines.push("- Texte actuel:");
    lines.push(toBlockQuote(card.text));
    lines.push("- Description actuelle:");
    lines.push(toBlockQuote(card.description));
    lines.push("");
    lines.push("**Feedback candidat (à compléter si nécessaire)**");
    lines.push("- Nouveau texte proposé:");
    lines.push("- Nouvelle description proposée:");
    lines.push("- Justification / source:");
    lines.push("");
  }

  return lines.join("\n");
}

function buildIndex(candidates, candidateSummaries, generatedDate) {
  const lines = [];
  lines.push("# Pack de revue candidats - Paris 2026");
  lines.push("");
  lines.push(`Généré le ${generatedDate}.`);
  lines.push("");
  lines.push("Ce dossier contient un document prêt à partager pour chaque candidat.");
  lines.push("");
  lines.push("## Fichiers");
  lines.push("");
  lines.push("| Candidat | Fichier | Cartes liées | Soutien | Opposition |");
  lines.push("| --- | --- | --- | --- | --- |");

  for (const candidate of candidates) {
    const summary = candidateSummaries.get(candidate.id);
    const relativePath = `./${summary.fileName}`;
    lines.push(
      `| ${candidate.name} | [${summary.fileName}](${relativePath}) | ${summary.total} | ${summary.support} | ${summary.opposition} |`
    );
  }

  lines.push("");
  lines.push("## Utilisation recommandée");
  lines.push("");
  lines.push("1. Envoyer le fichier du candidat concerné à son équipe.");
  lines.push("2. Leur demander de remplir les champs `Feedback candidat` carte par carte.");
  lines.push("3. Intégrer ensuite les modifications validées dans le dataset.");

  return lines.join("\n");
}

function main() {
  const candidatesData = readJson(CANDIDATES_FILE);
  const proposals = readJson(PROPOSALS_FILE);

  const candidates = candidatesData.candidates || [];
  if (candidates.length === 0) {
    throw new Error("Aucun candidat trouvé dans candidates.json.");
  }

  const cards = buildCards(candidates, proposals);
  ensureOutputDir(OUTPUT_DIR);

  const generatedDate = new Date().toISOString().slice(0, 10);
  const candidateSummaries = new Map();

  for (const candidate of candidates) {
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

    const fileName = `${String(candidates.indexOf(candidate) + 1).padStart(2, "0")}-${slugify(candidate.name)}.md`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const content = buildCandidateDocument(candidate, relatedCards, generatedDate);
    fs.writeFileSync(filePath, `${content}\n`, "utf8");

    const support = relatedCards.filter((item) => item.relation === "soutien").length;
    const opposition = relatedCards.filter((item) => item.relation === "opposition").length;
    candidateSummaries.set(candidate.id, {
      fileName,
      total: relatedCards.length,
      support,
      opposition,
    });
  }

  const indexContent = buildIndex(candidates, candidateSummaries, generatedDate);
  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), `${indexContent}\n`, "utf8");

  console.log(`Pack généré dans: ${OUTPUT_DIR}`);
  console.log(`Nombre de candidats: ${candidates.length}`);
  console.log(`Nombre total de cartes (runtime): ${cards.length}`);
}

main();
