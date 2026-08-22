import fs from 'fs';
import Papa from 'papaparse';

const API_URL = 'http://localhost:3001/api/contacts/bulk';
const csvFile = 'C:\\Users\\HP\\Downloads\\MasterList.csv';

async function uploadContacts() {
  console.log('📂 Reading MasterList.csv...\n');

  try {
    // Read CSV file
    const fileContent = fs.readFileSync(csvFile, 'utf-8');

    // Parse CSV
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    const rows = parsed.data;
    console.log(`📊 Total rows: ${rows.length.toLocaleString()}`);

    // Filter: Remove Gmail, Yahoo, Hotmail, etc
    const businessEmails = rows.filter(row => {
      const email = row['Email'] || row['email'] || row['E-mail'] || '';
      if (!email) return false;

      // Skip free email providers
      if (email.match(/@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|yandex|mail\.com|inbox\.com)\.com/i)) {
        return false;
      }
      return true;
    });

    console.log(`✓ Business emails (non-Gmail): ${businessEmails.length.toLocaleString()}`);
    console.log(`⏭️  Skipped (Gmail/free): ${(rows.length - businessEmails.length).toLocaleString()}\n`);

    // Process in batches of 1000
    const batchSize = 1000;
    const batches = [];

    for (let i = 0; i < businessEmails.length; i += batchSize) {
      batches.push(businessEmails.slice(i, i + batchSize));
    }

    console.log(`📦 Uploading in ${batches.length} batches...\n`);

    let totalImported = 0;
    let totalSkipped = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Map CSV columns to our contact format
      const contacts = batch.map(row => {
        const email = row['Email'] || row['email'] || row['E-mail'] || '';
        const domain = email.split('@')[1];

        return {
          firstName: row['First name'] || row['firstname'] || row['First Name'] || '',
          lastName: row['Last name'] || row['lastname'] || row['Last Name'] || row['Surname'] || '',
          email: email,
          company: row['Company'] || row['Organization'] || row['Organization Name'] || extractCompanyFromDomain(domain),
          website: (domain && !domain.match(/gmail|yahoo|hotmail|outlook|aol|icloud/) ? domain : null),
          notes: row['Notes'] || row['Country - Home'] || ''
        };
      }).filter(c => c.firstName && c.email);

      console.log(`📤 Batch ${i + 1}/${batches.length} - Sending ${contacts.length} contacts...`);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts })
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(`   ❌ Error: ${result.error}`);
          continue;
        }

        totalImported += result.inserted || 0;
        totalSkipped += result.skipped || 0;

        const percent = Math.round((i + 1) / batches.length * 100);
        console.log(`   ✓ Imported: ${result.inserted || 0}, Skipped: ${result.skipped || 0}`);
        console.log(`   Progress: ${'█'.repeat(Math.round(percent / 5))}${' '.repeat(20 - Math.round(percent / 5))} ${percent}%\n`);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`   ❌ Batch error: ${err.message}`);
      }
    }

    console.log('\n✅ UPLOAD COMPLETE!\n');
    console.log('📊 FINAL RESULTS:');
    console.log(`   ✓ Imported: ${totalImported.toLocaleString()}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped.toLocaleString()}`);
    console.log(`   📈 Success rate: ${((totalImported / (totalImported + totalSkipped)) * 100).toFixed(1)}%\n`);

    // Get stats
    const statsResponse = await fetch('http://localhost:3001/api/stats');
    const stats = await statsResponse.json();
    console.log(`📈 Total contacts in database: ${stats.total.toLocaleString()}`);
    console.log('\n🎉 Your business contacts are ready!');
    console.log('   → Go to: http://localhost:3001/business-contacts.html');
    console.log('   → Click: Contacts tab to see all contacts');
    console.log('   → Click: Websites tab to see clickable links');
    console.log('   → Click: Export & Meta tab to run campaigns\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

function extractCompanyFromDomain(domain) {
  if (!domain) return '';
  // Extract company name from domain (e.g., "acmecorp.com" → "Acme Corp")
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Start upload
uploadContacts();
