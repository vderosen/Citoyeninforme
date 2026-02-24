const XLSX = require('xlsx');

const workbook = XLSX.readFile('V1 of cards for the app - categorized.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const categories = new Set();
data.forEach(row => {
    if (row.secteur) {
        categories.add(row.secteur);
    }
});

console.log(Array.from(categories));
