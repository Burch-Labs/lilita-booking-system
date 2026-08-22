import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import csv from 'csv-parser';

// Configuration
const EMAIL_USER = 'hello@unduguhalisinetwork.com';
const EMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const CSV_FILE = './travel_agents_export.csv';
const LOG_FILE = './email_send_log.json';
const CALENDLY_LINK = 'https://calendly.com/Charles/reserve-your-journey';
const PHONE = '+254 712 345 678';
const WEBSITE = 'unduguhalisinetwork.com';

// Parse command line arguments
const args = process.argv.slice(2);
let startIndex = 1;
let endIndex = 50;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--start' && args[i + 1]) startIndex = parseInt(args[i + 1]);
  if (args[i] === '--end' && args[i + 1]) endIndex = parseInt(args[i + 1]);
}

// Check for Gmail app password
if (!EMAIL_APP_PASSWORD) {
  console.error('❌ ERROR: GMAIL_APP_PASSWORD not set');
  console.log('\nTo set it, run:');
  console.log('  Windows (PowerShell):');
  console.log('    $env:GMAIL_APP_PASSWORD = "your-app-password"');
  console.log('    node send_emails.js --start 1 --end 50');
  console.log('\n  Windows (CMD):');
  console.log('    set GMAIL_APP_PASSWORD=your-app-password');
  console.log('    node send_emails.js --start 1 --end 50');
  console.log('\nTo get Gmail app password:');
  console.log('  1. Go to: https://myaccount.google.com/security');
  console.log('  2. Enable 2-factor authentication');
  console.log('  3. Go to: https://myaccount.google.com/apppasswords');
  console.log('  4. Select: Mail → Windows Computer');
  console.log('  5. Copy the 16-character password');
  process.exit(1);
}

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD
  }
});

// Load existing log
let sentLog = {};
if (fs.existsSync(LOG_FILE)) {
  try {
    sentLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  } catch (e) {
    console.warn('⚠️  Could not load log file, starting fresh');
  }
}

// Email template
function getEmailTemplate(firstName, company) {
  return {
    subject: 'Lilita Keper Partnership – Luxury Safari Bookings (15% Commission)',
    html: `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

<p>Hi ${firstName || 'there'},</p>

<p>Your clients ask about Africa's best luxury lodges. We're booking them.</p>

<p><strong>🏕️ LILITA KEPER LODGE</strong><br>
📍 Maasai Mara, Kenya | 5 Exclusive Suites | Conservation-Focused<br>
🌟 Perfect for: Luxury safaris, weddings, corporate retreats, honeymoons</p>

<p>We're partnering with travel professionals to fill our calendar. Here's the deal:</p>

<p><strong>💰 15% commission on every booking you send</strong><br>
⏰ 2-hour response time guaranteed<br>
✅ Easy booking → we handle everything else</p>

<p><strong>🔗 <a href="${CALENDLY_LINK}" style="color: #0066cc; text-decoration: none;">BOOK YOUR CLIENTS NOW</a></strong></p>

<p><strong>HOW IT WORKS:</strong><br>
1. Click the link → select dates → I confirm within 2 hours<br>
2. Your client pays us → you earn commission<br>
3. We handle logistics, guiding, meals, everything</p>

<p><strong>WHAT'S INCLUDED:</strong><br>
✓ Luxury accommodation (en-suite bathrooms, quality linens)<br>
✓ All meals (breakfast, lunch, dinner - full board)<br>
✓ Daily game drives with experienced guides<br>
✓ Walking safaris & conservation experiences<br>
✓ Cultural immersion with Maasai community<br>
✓ Airport transfers (Nairobi to lodge)</p>

<p><strong>PRICING EXAMPLE:</strong><br>
• 3-night stay: $3,000-4,500/person<br>
• Your commission: 15% = $450-675<br>
• Multiple guests? Commission multiplies ✨</p>

<p><strong>NEXT STEPS:</strong><br>
1. Test the link (book yourself - no charge)<br>
2. Reply to this email with questions<br>
3. Share with clients who ask about Kenya safaris<br>
4. We'll send partnership materials & commission tracker</p>

<p>Questions? Hit reply or call <strong>${PHONE}</strong></p>

<p>Looking forward to working together!</p>

<p><strong>Charles</strong><br>
Lilita Keper Lodge<br>
<a href="https://${WEBSITE}" style="color: #0066cc;">${WEBSITE}</a></p>

<p><em>P.S. - If you know other travel professionals who'd be interested, feel free to forward this. We love referrals! 🦁</em></p>

</body>
</html>
    `
  };
}

// Read CSV and send emails
async function sendEmails() {
  const contacts = [];

  // Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        contacts.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  if (contacts.length === 0) {
    console.error('❌ No contacts found in CSV');
    process.exit(1);
  }

  console.log(`📊 Loaded ${contacts.length} total contacts from CSV`);
  console.log(`📤 Sending to contacts ${startIndex}-${Math.min(endIndex, contacts.length)}\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = startIndex - 1; i < Math.min(endIndex, contacts.length); i++) {
    const contact = contacts[i];
    const email = contact.Email || contact.email;
    const firstName = contact['First Name'] || contact.firstName || '';
    const company = contact.Company || contact.company || '';

    // Check if already sent
    if (sentLog[email]) {
      console.log(`⏭️  ${i + 1}. SKIP: ${email} (already sent on ${sentLog[email].sentAt})`);
      skipCount++;
      continue;
    }

    // Validate email
    if (!email || !email.includes('@')) {
      console.log(`❌ ${i + 1}. INVALID: ${email || 'no email'}`);
      failCount++;
      continue;
    }

    try {
      const emailTemplate = getEmailTemplate(firstName, company);

      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        replyTo: EMAIL_USER
      });

      // Log sent email
      sentLog[email] = {
        sentAt: new Date().toISOString(),
        firstName,
        company,
        index: i + 1
      };

      console.log(`✅ ${i + 1}. SENT: ${email} (${firstName} @ ${company})`);
      successCount++;

      // Small delay between sends (avoid rate limiting)
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`❌ ${i + 1}. ERROR: ${email} - ${error.message}`);
      failCount++;
    }
  }

  // Save log
  fs.writeFileSync(LOG_FILE, JSON.stringify(sentLog, null, 2));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Sent: ${successCount}`);
  console.log(`⏭️  Skipped (already sent): ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n📝 Log saved to: ${LOG_FILE}`);
  console.log('\nNext steps:');
  console.log('1. Monitor replies to: hello@unduguhalisinetwork.com');
  console.log('2. Check Calendly bookings: https://calendly.com/Charles/reserve-your-journey');
  console.log('3. Send next batch: node send_emails.js --start 51 --end 100\n');
}

// Run
sendEmails().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
