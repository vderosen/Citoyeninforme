#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const DEFAULT_DATASET_SLUG = "paris-2026";
const DATA_FILE_NAMES = [
  "election.json",
  "candidates.json",
  "themes.json",
  "positions.json",
  "survey-questions.json",
  "civic-facts.json",
  "logistics.json",
];

function compareText(a, b) {
  const left = String(a ?? "");
  const right = String(b ?? "");
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }
  return compareText(a, b);
}

function toSortNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : Number.MAX_SAFE_INTEGER;
}

function sortBy(items, ...selectors) {
  return [...items].sort((a, b) => {
    for (const selector of selectors) {
      const result = compareValues(selector(a), selector(b));
      if (result !== 0) return result;
    }
    return 0;
  });
}

function escapeMarkdown(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function formatInline(value) {
  if (value === null || value === undefined || value === "") return "—";
  return escapeMarkdown(value);
}

function formatThemeScores(themeScores) {
  const keys = Object.keys(themeScores || {}).sort(compareText);
  if (keys.length === 0) return "{}";
  const entries = keys.map((key) => `"${key}": ${themeScores[key]}`);
  return `{ ${entries.join(", ")} }`;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Unable to read JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function ensureArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
}

function generateMarkdown(datasetSlug, datasetDir, outputPath) {
  const election = readJson(path.join(datasetDir, "election.json"));
  const candidates = readJson(path.join(datasetDir, "candidates.json"));
  const themes = readJson(path.join(datasetDir, "themes.json"));
  const positions = readJson(path.join(datasetDir, "positions.json"));
  const surveyQuestions = readJson(path.join(datasetDir, "survey-questions.json"));
  const civicFacts = readJson(path.join(datasetDir, "civic-facts.json"));
  const logistics = readJson(path.join(datasetDir, "logistics.json"));

  ensureArray(candidates, "candidates.json");
  ensureArray(themes, "themes.json");
  ensureArray(positions, "positions.json");
  ensureArray(surveyQuestions, "survey-questions.json");
  ensureArray(civicFacts, "civic-facts.json");

  const candidateList = sortBy(candidates, (c) => c.name, (c) => c.id);
  const themeList = sortBy(
    themes,
    (t) => toSortNumber(t.displayOrder),
    (t) => t.name,
    (t) => t.id
  );

  const themeOrderById = new Map(themeList.map((theme, index) => [theme.id, index]));
  const candidateById = new Map(candidateList.map((candidate) => [candidate.id, candidate]));
  const themeById = new Map(themeList.map((theme) => [theme.id, theme]));

  const positionList = sortBy(
    positions,
    (position) => candidateById.get(position.candidateId)?.name || position.candidateId,
    (position) => themeOrderById.get(position.themeId) ?? Number.MAX_SAFE_INTEGER,
    (position) => themeById.get(position.themeId)?.name || position.themeId,
    (position) => position.id
  );

  const questionList = sortBy(
    surveyQuestions,
    (question) => toSortNumber(question.order),
    (question) => question.id
  );

  const civicFactList = sortBy(
    civicFacts,
    (fact) => toSortNumber(fact.order),
    (fact) => fact.id
  );

  const keyDates = sortBy(
    logistics?.keyDates || [],
    (item) => item.date,
    (item) => item.label
  );
  const eligibility = sortBy(
    logistics?.eligibility || [],
    (item) => toSortNumber(item.order),
    (item) => item.text
  );
  const votingMethods = sortBy(
    logistics?.votingMethods || [],
    (item) => item.type,
    (item) => item.description
  );
  const locations = sortBy(
    logistics?.locations || [],
    (item) => item.name,
    (item) => item.address
  );
  const officialSources = sortBy(
    logistics?.officialSources || [],
    (source) => source.title,
    (source) => source.url
  );

  const lines = [];

  lines.push(`# Revue Dataset Élection - ${formatInline(election.city)} ${formatInline(election.year)}`);
  lines.push("");
  lines.push(
    "_Fichier généré automatiquement par `scripts/generate-election-review-md.js`. Dataset: `" +
      datasetSlug +
      "`._"
  );
  lines.push("");
  lines.push("## Résumé");
  lines.push("");
  lines.push("| Élément | Valeur |");
  lines.push("| --- | --- |");
  lines.push(`| Id élection | ${formatInline(election.id)} |`);
  lines.push(`| Ville | ${formatInline(election.city)} |`);
  lines.push(`| Type | ${formatInline(election.type)} |`);
  lines.push(`| Année | ${formatInline(election.year)} |`);
  lines.push(`| Version des données | ${formatInline(election.dataVersion)} |`);
  lines.push(`| Dernière mise à jour | ${formatInline(election.lastUpdated)} |`);
  lines.push(`| Nombre de candidats | ${candidateList.length} |`);
  lines.push(`| Nombre de thèmes | ${themeList.length} |`);
  lines.push(`| Nombre de positions | ${positionList.length} |`);
  lines.push(`| Nombre de questions | ${questionList.length} |`);
  lines.push(`| Nombre de faits civiques | ${civicFactList.length} |`);
  lines.push("");
  lines.push("## Fichiers JSON sources");
  lines.push("");
  lines.push("| Fichier | Type |");
  lines.push("| --- | --- |");
  for (const fileName of DATA_FILE_NAMES) {
    const value = readJson(path.join(datasetDir, fileName));
    const type = Array.isArray(value) ? `Array(${value.length})` : "Object";
    lines.push(`| \`src/data/elections/${datasetSlug}/${fileName}\` | ${type} |`);
  }

  lines.push("");
  lines.push("## Élection");
  lines.push("");
  lines.push(`- Règles de vote: ${formatInline(election?.votingRules?.description)}`);
  lines.push(`- Nombre de tours: ${formatInline(election?.votingRules?.rounds)}`);
  lines.push(`- Date limite d'inscription: ${formatInline(election?.timeline?.registrationDeadline)}`);
  lines.push(`- Premier tour: ${formatInline(election?.timeline?.firstRound)}`);
  lines.push(`- Second tour: ${formatInline(election?.timeline?.secondRound)}`);

  lines.push("");
  lines.push("## Candidats");
  lines.push("");
  if (candidateList.length === 0) {
    lines.push("Aucun candidat.");
  } else {
    lines.push("| Id | Nom | Parti | Source programme |");
    lines.push("| --- | --- | --- | --- |");
    for (const candidate of candidateList) {
      const programSource = candidate.programSourceUrl
        ? `[Lien](${candidate.programSourceUrl})`
        : "—";
      lines.push(
        `| \`${formatInline(candidate.id)}\` | ${formatInline(candidate.name)} | ${formatInline(candidate.party)} | ${programSource} |`
      );
    }
    lines.push("");
    for (const candidate of candidateList) {
      lines.push(`### ${formatInline(candidate.name)} (\`${formatInline(candidate.id)}\`)`);
      lines.push("");
      lines.push(`- Élection: ${formatInline(candidate.electionId)}`);
      lines.push(`- Bio: ${formatInline(candidate.bio)}`);
      lines.push(`- Style de communication: ${formatInline(candidate.communicationStyle)}`);
      lines.push(`- URL programme: ${formatInline(candidate.programSourceUrl)}`);
      lines.push(`- URL photo: ${formatInline(candidate.photoUrl)}`);
      lines.push("");
    }
  }

  lines.push("## Thèmes");
  lines.push("");
  if (themeList.length === 0) {
    lines.push("Aucun thème.");
  } else {
    lines.push("| Ordre | Id | Nom | Icône | Description |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const theme of themeList) {
      lines.push(
        `| ${formatInline(theme.displayOrder)} | \`${formatInline(theme.id)}\` | ${formatInline(theme.name)} | ${formatInline(theme.icon)} | ${formatInline(theme.description)} |`
      );
    }
  }

  lines.push("");
  lines.push("## Positions");
  lines.push("");
  if (positionList.length === 0) {
    lines.push("Aucune position.");
  } else {
    for (const position of positionList) {
      const candidateName = candidateById.get(position.candidateId)?.name || position.candidateId;
      const themeName = themeById.get(position.themeId)?.name || position.themeId;
      const sources = sortBy(
        position.sources || [],
        (source) => source.title,
        (source) => source.url
      );

      lines.push(`### ${formatInline(candidateName)} - ${formatInline(themeName)} (\`${formatInline(position.id)}\`)`);
      lines.push("");
      lines.push(`- candidateId: \`${formatInline(position.candidateId)}\``);
      lines.push(`- themeId: \`${formatInline(position.themeId)}\``);
      lines.push(`- Résumé: ${formatInline(position.summary)}`);
      lines.push(`- Détails: ${formatInline(position.details)}`);
      lines.push(`- Dernière vérification: ${formatInline(position.lastVerified)}`);
      lines.push("- Sources:");
      if (sources.length === 0) {
        lines.push("  - Aucune source.");
      } else {
        for (const source of sources) {
          lines.push(
            `  - [${formatInline(source.title)}](${source.url}) | type: ${formatInline(source.type)} | accessDate: ${formatInline(source.accessDate)}`
          );
        }
      }
      lines.push("");
    }
  }

  lines.push("## Questions du sondage");
  lines.push("");
  if (questionList.length === 0) {
    lines.push("Aucune question.");
  } else {
    for (const question of questionList) {
      const optionList = sortBy(question.options || [], (option) => option.id, (option) => option.text);
      const themeNames = (question.themeIds || []).map((themeId) => themeById.get(themeId)?.name || themeId);

      lines.push(`### Q${formatInline(question.order)} - ${formatInline(question.text)} (\`${formatInline(question.id)}\`)`);
      lines.push("");
      lines.push(`- electionId: \`${formatInline(question.electionId)}\``);
      lines.push(`- themeIds: ${themeNames.map((name) => `\`${formatInline(name)}\``).join(", ") || "—"}`);
      lines.push("- Options:");
      for (const option of optionList) {
        lines.push(
          `  - \`${formatInline(option.id)}\`: ${formatInline(option.text)} | themeScores: \`${formatThemeScores(option.themeScores)}\``
        );
      }
      lines.push("");
    }
  }

  lines.push("## Faits civiques");
  lines.push("");
  if (civicFactList.length === 0) {
    lines.push("Aucun fait civique.");
  } else {
    for (const fact of civicFactList) {
      lines.push(`### Fact ${formatInline(fact.order)} (\`${formatInline(fact.id)}\`)`);
      lines.push("");
      lines.push(`- Catégorie: ${formatInline(fact.category)}`);
      lines.push(`- Texte: ${formatInline(fact.text)}`);
      lines.push(`- Source: [${formatInline(fact?.source?.title)}](${fact?.source?.url || ""})`);
      lines.push(`- Type source: ${formatInline(fact?.source?.type)}`);
      lines.push(`- accessDate: ${formatInline(fact?.source?.accessDate)}`);
      lines.push("");
    }
  }

  lines.push("## Logistique");
  lines.push("");
  lines.push("### Dates clés");
  lines.push("");
  if (keyDates.length === 0) {
    lines.push("Aucune date clé.");
  } else {
    lines.push("| Date | Libellé | Description |");
    lines.push("| --- | --- | --- |");
    for (const item of keyDates) {
      lines.push(
        `| ${formatInline(item.date)} | ${formatInline(item.label)} | ${formatInline(item.description)} |`
      );
    }
  }

  lines.push("");
  lines.push("### Conditions d'éligibilité");
  lines.push("");
  if (eligibility.length === 0) {
    lines.push("Aucune condition.");
  } else {
    for (const step of eligibility) {
      lines.push(`${formatInline(step.order)}. ${formatInline(step.text)}`);
    }
  }

  lines.push("");
  lines.push("### Modalités de vote");
  lines.push("");
  if (votingMethods.length === 0) {
    lines.push("Aucune modalité.");
  } else {
    for (const method of votingMethods) {
      lines.push(`- Type: \`${formatInline(method.type)}\``);
      lines.push(`- Description: ${formatInline(method.description)}`);
      lines.push(`- Exigences: ${formatInline(method.requirements)}`);
      lines.push("");
    }
  }

  lines.push("### Lieux de vote");
  lines.push("");
  if (locations.length === 0) {
    lines.push("Aucun lieu de vote renseigné.");
  } else {
    for (const location of locations) {
      lines.push(`- ${formatInline(location.name)} | ${formatInline(location.address)}`);
      lines.push(`  - Horaires: ${formatInline(location.hours)}`);
      lines.push(`  - Notes: ${formatInline(location.notes)}`);
    }
  }

  lines.push("");
  lines.push("### Sources officielles (logistique)");
  lines.push("");
  if (officialSources.length === 0) {
    lines.push("Aucune source officielle.");
  } else {
    lines.push("| Titre | URL | Type | accessDate |");
    lines.push("| --- | --- | --- | --- |");
    for (const source of officialSources) {
      lines.push(
        `| ${formatInline(source.title)} | ${formatInline(source.url)} | ${formatInline(source.type)} | ${formatInline(source.accessDate)} |`
      );
    }
  }

  lines.push("");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const datasetSlug = process.argv[2] || DEFAULT_DATASET_SLUG;
  const outputPathArg = process.argv[3];

  const datasetDir = path.resolve(process.cwd(), "src/data/elections", datasetSlug);
  if (!fs.existsSync(datasetDir)) {
    console.error(`[data-review] Dataset directory does not exist: ${datasetDir}`);
    process.exit(1);
  }

  const outputPath = outputPathArg
    ? path.resolve(process.cwd(), outputPathArg)
    : path.join(datasetDir, "DATA_REVIEW.md");

  generateMarkdown(datasetSlug, datasetDir, outputPath);
  console.log(`[data-review] Generated ${path.relative(process.cwd(), outputPath)}`);
}

main();
