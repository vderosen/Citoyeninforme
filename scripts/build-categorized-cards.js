const ExcelJS = require("exceljs");
const fs = require("fs");

function normalizeCellValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        if (typeof value.text === "string") return value.text;
        if (Array.isArray(value.richText)) {
            return value.richText.map((part) => part.text || "").join("");
        }
        if (value.result !== undefined && value.result !== null) return value.result;
        if (typeof value.hyperlink === "string") return value.hyperlink;
    }
    return value;
}

async function readRowsFromFirstSheet(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return [];

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values
        .slice(1)
        .map((header) => String(normalizeCellValue(header)).trim());
    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const mappedRow = {};
        headers.forEach((header, index) => {
            if (!header) return;
            mappedRow[header] = normalizeCellValue(row.getCell(index + 1).value);
        });
        rows.push(mappedRow);
    });

    return rows;
}

// Map the Excel rows into the `StatementCard` schema format
const statementCards = [];

// Clean up candidacies 
const candidateNameToId = {
    "Hidalgo": "hidalgo",
    "Dati": "dati",
    "Beaune": "beaune",
    "Belloubet": "belloubet",
    "Bournazel": "bournazel",
    "Cazenave": "cazenave",
    "Garnier": "garnier",
    "Hervé": "herve",
    "Kemlin": "kemlin",
    "Knafo": "knafo",
    "Lévy": "levy",
    "Mariani": "mariani",
    "Panafit": "panafit",
    "Plenel": "plenel",
    "Simonnet": "simonnet",
    "Clément": "clement",
    "Vannier": "vannier",
    "Pécresse": "pecresse",
    "Bompard": "bompard",
    "Guérini": "guerini",
};

async function main() {
    const data = await readRowsFromFirstSheet("V1 of cards for the app - categorized.xlsx");
    const uniqueCardsMap = new Map();

    data.forEach((row) => {
        const rawCardId = row.card_id; // e.g. CARD_0001
        const category = row.secteur || row.Catégorie || "Autre";
        const text = row.titre_canonique || row["Titre canonique"] || "";
        const description =
            row.description_canonique_revisitée ||
            row['Description canonique (pour "En savoir plus")'] ||
            "";
        const candidateName = row.candidat || row.Candidat;

        const candidateId =
            candidateNameToId[candidateName] || candidateName?.toLowerCase().replace(/\s+/g, "-");

        if (!rawCardId || !candidateId) return;

        if (!uniqueCardsMap.has(rawCardId)) {
            uniqueCardsMap.set(rawCardId, {
                id: rawCardId,
                electionId: "paris-2026",
                text: String(text).trim(),
                description: String(description).trim(),
                category,
                candidateIds: [candidateId],
                opposingCandidateIds: [], // Hard to derive explicitly from just this, assuming empty for now or populate if inverse logic exists
                order: uniqueCardsMap.size + 1,
            });
        } else {
            const card = uniqueCardsMap.get(rawCardId);
            if (!card.candidateIds.includes(candidateId)) {
                card.candidateIds.push(candidateId);
            }
        }
    });

    const cardsList = Array.from(uniqueCardsMap.values());

    fs.writeFileSync(
        "src/data/elections/paris-2026/statement_cards.json",
        JSON.stringify(cardsList, null, 2)
    );

    console.log(`Successfully generated ${cardsList.length} statement cards with categories.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
