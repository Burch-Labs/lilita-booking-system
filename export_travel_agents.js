import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = './contacts.db';
const outputFile = './travel_agents_export.csv';

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }

  const query = `
    SELECT DISTINCT
      firstName,
      lastName,
      email,
      company,
      phone,
      website
    FROM contacts
    WHERE
      email IS NOT NULL
      AND email != ''
      AND (
        LOWER(company) LIKE '%travel%'
        OR LOWER(company) LIKE '%agent%'
        OR LOWER(company) LIKE '%safari%'
        OR LOWER(company) LIKE '%tours%'
        OR LOWER(company) LIKE '%booking%'
        OR LOWER(company) LIKE '%lodge%'
        OR LOWER(company) LIKE '%hotel%'
      )
    ORDER BY company, firstName
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      db.close();
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('⚠️  No travel agents found');
      db.close();
      process.exit(0);
    }

    console.log(`✅ Found ${rows.length} travel agents/lodges`);

    // Build CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Company', 'Phone', 'Website'];
    const csvLines = [headers.join(',')];

    rows.forEach(row => {
      const line = [
        escapeCSV(row.firstName || ''),
        escapeCSV(row.lastName || ''),
        escapeCSV(row.email || ''),
        escapeCSV(row.company || ''),
        escapeCSV(row.phone || ''),
        escapeCSV(row.website || '')
      ].join(',');
      csvLines.push(line);
    });

    const csv = csvLines.join('\n');

    fs.writeFileSync(outputFile, csv, 'utf-8');

    console.log(`📊 Export saved to: ${outputFile}`);
    console.log(`📈 Total contacts: ${rows.length}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Open travel_agents_export.csv');
    console.log('2. Upload to Mailchimp (mailchimp.com)');
    console.log('3. Send campaign with your Calendly link');
    console.log('');

    db.close();
    process.exit(0);
  });
});

function escapeCSV(field) {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
