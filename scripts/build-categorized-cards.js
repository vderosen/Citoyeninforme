const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('V1 of cards for the app - categorized.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

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

const uniqueCardsMap = new Map();

data.forEach((row, index) => {
    const rawCardId = row.card_id; // e.g. CARD_0001
    const category = row.secteur || row.Catégorie || 'Autre';
    const text = row['titre_canonique'] || row['Titre canonique'] || '';
    const description = row['description_canonique_revisitée'] || row['Description canonique (pour "En savoir plus")'] || '';
    const candidateName = row.candidat || row.Candidat;

    const candidateId = candidateNameToId[candidateName] || candidateName?.toLowerCase().replace(/\s+/g, '-');

    if (!candidateId) return;

    if (!uniqueCardsMap.has(rawCardId)) {
        uniqueCardsMap.set(rawCardId, {
            id: rawCardId,
            electionId: "paris-2026",
            text: text.trim(),
            description: description.trim(),
            category: category,
            candidateIds: [candidateId],
            opposingCandidateIds: [], // Hard to derive explicitly from just this, assuming empty for now or populate if inverse logic exists
            order: uniqueCardsMap.size + 1
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
    'src/data/elections/paris-2026/statement_cards.json',
    JSON.stringify(cardsList, null, 2)
);

console.log(`Successfully generated ${cardsList.length} statement cards with categories.`);
