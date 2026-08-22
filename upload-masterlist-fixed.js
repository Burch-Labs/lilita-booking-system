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

    // Show headers to debug
    if (rows.length > 0) {
      console.log('\n📋 CSV Headers:');
      Object.keys(rows[0]).slice(0, 10).forEach((key, i) => {
        console.log(`   ${i + 1}. "${key}"`);
      });
      console.log(`   ... and more\n`);
    }

    // Map function to find the right column
    function getField(row, ...possibleNames) {
      for (const name of possibleNames) {
        if (row[name]) return row[name].trim();
      }
      return '';
    }

    // Filter: Remove Gmail, Yahoo, Hotmail, etc
    const businessEmails = rows.filter(row => {
      const email = getField(row, '', 'Email', 'email', 'E-mail', 'EMAIL');
      if (!email) return false;

      // Skip free email providers
      if (email.match(/@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|yandex|mail\.com|inbox\.com)\.com/i)) {
        return false;
      }
      return true;
    });

    console.log(`✓ Business emails (non-Gmail): ${businessEmails.length.toLocaleString()}`);
    console.log(`⏭️  Skipped (Gmail/free): ${(rows.length - businessEmails.length).toLocaleString()}\n`);

    if (businessEmails.length === 0) {
      console.log('⚠️  No business emails found. Check CSV format.');
      console.log('Sample row:', rows[0]);
      return;
    }

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
        const email = getField(row, '', 'Email', 'email', 'E-mail', 'EMAIL');
        const domain = email.split('@')[1];
        const firstName = getField(row, 'First name', 'First Name', 'firstname', 'FirstName', 'Name');
        const lastName = getField(row, 'Last name', 'Last Name', 'lastname', 'LastName', 'Surname');

        return {
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          email: email,
          company: getField(row, 'Company', 'Organization', 'Organization Name') || extractCompanyFromDomain(domain),
          website: (domain && !domain.match(/gmail|yahoo|hotmail|outlook|aol|icloud/) ? domain : null),
          notes: getField(row, 'Notes', 'Country - Home', 'Country')
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
        const bar = '█'.repeat(Math.round(percent / 5));
        const empty = ' '.repeat(20 - Math.round(percent / 5));
        console.log(`   ✓ Imported: ${result.inserted || 0}, Skipped: ${result.skipped || 0}`);
        console.log(`   Progress: ${bar}${empty} ${percent}%\n`);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.error(`   ❌ Batch error: ${err.message}`);
      }
    }

    console.log('\n✅ UPLOAD COMPLETE!\n');
    console.log('📊 FINAL RESULTS:');
    console.log(`   ✓ Imported: ${totalImported.toLocaleString()}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped.toLocaleString()}`);
    const successRate = totalImported + totalSkipped > 0
      ? ((totalImported / (totalImported + totalSkipped)) * 100).toFixed(1)
      : '0';
    console.log(`   📈 Success rate: ${successRate}%\n`);

    // Get stats
    try {
      const statsResponse = await fetch('http://localhost:3001/api/stats');
      const stats = await statsResponse.json();
      console.log(`📈 Total contacts in database: ${stats.total.toLocaleString()}`);
    } catch (e) {
      console.log('(Could not fetch total stats)');
    }

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
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Start upload
uploadContacts();
