import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const excelFile = 'C:\\Users\\HP\\Downloads\\MasterList.xlsx';
const csvFile = 'C:\\Users\\HP\\Downloads\\MasterList.csv';

console.log('📂 Converting Excel to CSV...');

try {
  // Read Excel file
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  console.log(`✓ Found sheet: "${sheetName}"`);

  // Convert to CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Write to CSV file
  fs.writeFileSync(csvFile, csv, 'utf-8');

  console.log(`✓ Converted to CSV`);
  console.log(`✓ File: ${csvFile}`);
  console.log(`✓ Size: ${fs.statSync(csvFile).size} bytes`);

  // Show preview
  const lines = csv.split('\n').slice(0, 6);
  console.log('\n📋 Preview (first 5 rows):');
  lines.forEach((line, i) => {
    if (i === 0) {
      console.log(`[Header] ${line.substring(0, 80)}...`);
    } else if (line) {
      console.log(`[Row ${i}] ${line.substring(0, 80)}...`);
    }
  });

  // Count rows
  const rowCount = csv.split('\n').length - 2; // -2 for header and last empty
  console.log(`\n✓ Total rows: ${rowCount}`);

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
