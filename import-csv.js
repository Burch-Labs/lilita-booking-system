import csv from 'csv-parser';
import fs from 'fs';
import { initDatabase, getDatabase } from './database.js';
import path from 'path';

const csvPath = process.argv[2] || './contacts.csv';

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  console.log(`\n📝 Usage: node import-csv.js "path/to/your/file.csv"`);
  process.exit(1);
}

async function extractCountryFromDomain(domain) {
  const ccTLDs = {
    'ke': 'Kenya',
    'za': 'South Africa',
    'tz': 'Tanzania',
    'ug': 'Uganda',
    'ng': 'Nigeria',
    'gh': 'Ghana',
    'et': 'Ethiopia',
    'za': 'South Africa',
    'mu': 'Mauritius',
    'mz': 'Mozambique',
    'rw': 'Rwanda',
    'de': 'Germany',
    'uk': 'United Kingdom',
    'us': 'United States',
    'ca': 'Canada',
    'au': 'Australia',
    'fr': 'France',
    'it': 'Italy',
    'es': 'Spain',
    'nl': 'Netherlands',
    'se': 'Sweden',
    'no': 'Norway',
    'ch': 'Switzerland',
    'jp': 'Japan',
    'cn': 'China',
    'in': 'India',
    'br': 'Brazil',
    'mx': 'Mexico',
    'ru': 'Russia',
  };

  if (!domain) return null;

  const parts = domain.toLowerCase().split('.');
  const tld = parts[parts.length - 1];

  return ccTLDs[tld] || null;
}

(async () => {
  try {
    console.log(`📂 Importing from: ${path.resolve(csvPath)}`);
    await initDatabase();

    const db = getDatabase();
    let total = 0;
    let imported = 0;
    let skipped = 0;
    const errors = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          total++;

          // Extract fields from Google Contacts export format
          const firstName = (row['First Name'] || row.firstName || '').trim();
          const lastName = (row['Last Name'] || row.lastName || '').trim();
          const email = (row['E-mail 1 - Value'] || row.email || '').trim();
          const phone = (row.phone || '').trim();
          const company = (row['Organization Name'] || row.company || '').trim();
          const notes = (row.Notes || row.notes || '').trim();

          if (!firstName && !email) {
            skipped++;
            return;
          }

          // Extract domain from email
          const emailDomain = email ? email.split('@')[1] : null;

          // Get country from domain TLD
          const country = emailDomain ? extractCountryFromDomain(emailDomain) : null;

          db.run(
            `INSERT OR IGNORE INTO contacts
             (firstName, lastName, email, phone, company, notes, emailDomain, country, emailStatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unknown')`,
            [firstName, lastName, email, phone, company, notes, emailDomain, country],
            function(err) {
              if (err) {
                errors.push(`Row ${total}: ${err.message}`);
              } else if (this.changes > 0) {
                imported++;
              } else {
                skipped++;
              }
            }
          );
        })
        .on('end', () => {
          console.log(`\n✅ Import complete!`);
          console.log(`📊 Total rows: ${total}`);
          console.log(`✔️  Imported: ${imported}`);
          console.log(`⏭️  Skipped (duplicate/empty): ${skipped}`);

          if (errors.length > 0 && errors.length <= 10) {
            console.log(`\n⚠️  Errors:`);
            errors.forEach(e => console.log(`  ${e}`));
          }

          db.get('SELECT COUNT(*) as total FROM contacts', (err, row) => {
            console.log(`\n📈 Total contacts in database: ${row?.total || 0}`);
            process.exit(0);
          });
        })
        .on('error', reject);
    });
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    process.exit(1);
  }
})();
