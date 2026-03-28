const ExcelJS = require("exceljs");

function normalizeCellValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        if (typeof value.text === "string") return value.text;
        if (Array.isArray(value.richText)) {
            return value.richText.map((part) => part.text || "").join("");
        }
        if (value.result !== undefined && value.result !== null) return value.result;
    }
    return value;
}

async function main() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("V1 of cards for the app - categorized.xlsx");
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
        throw new Error("No worksheet found in workbook.");
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values
        .slice(1)
        .map((header) => String(normalizeCellValue(header)).trim());
    const secteurIndex = headers.findIndex((header) => header === "secteur");

    if (secteurIndex === -1) {
        throw new Error("Column 'secteur' not found.");
    }

    const categories = new Set();
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const secteurValue = normalizeCellValue(row.getCell(secteurIndex + 1).value);
        if (secteurValue) {
            categories.add(String(secteurValue));
        }
    });

    console.log(Array.from(categories));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
