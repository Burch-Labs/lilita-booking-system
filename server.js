import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import googleSheets from './google-sheets.js';
import { initDatabase, getDatabase } from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const resolveMx = dns.promises.resolveMx;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(cors());
// Bulk-importing tens of thousands of contacts in one request needs more than the 100kb default.
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static(join(__dirname, 'public')));

let db;

// Initialize database and start server
(async () => {
  try {
    db = await initDatabase();
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }

  // GET contacts, paginated — 70k rows can't be rendered as one page of DOM cards.
  app.get('/api/contacts', (req, res) => {
    const { search, emailStatus } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(500, Math.max(1, parseInt(req.query.pageSize, 10) || 50));
    const offset = (page - 1) * pageSize;

    const where = [];
    const params = [];

    if (search) {
      where.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ? OR website LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (emailStatus) {
      where.push('emailStatus = ?');
      params.push(emailStatus);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    db.get(`SELECT COUNT(*) as total FROM contacts ${whereClause}`, params, (err, countRow) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(
        `SELECT * FROM contacts ${whereClause} ORDER BY firstName, lastName LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ rows, total: countRow.total, page, pageSize, totalPages: Math.max(1, Math.ceil(countRow.total / pageSize)) });
        }
      );
    });
  });

  // GET single contact
  app.get('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Contact not found' });
      res.json(row);
    });
  });

  // CREATE contact
  app.post('/api/contacts', (req, res) => {
    const { firstName, lastName, email, phone, company, website, notes } = req.body;

    if (!firstName) {
      return res.status(400).json({ error: 'firstName is required' });
    }

    db.run(
      `INSERT INTO contacts (firstName, lastName, email, phone, company, website, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName || null, email || null, phone || null, company || null, website || null, notes || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(row);
        });
      }
    );
  });

  // UPDATE contact
  app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, company, website, notes } = req.body;

    if (!firstName) {
      return res.status(400).json({ error: 'firstName is required' });
    }

    db.run(
      `UPDATE contacts
       SET firstName = ?, lastName = ?, email = ?, phone = ?, company = ?, website = ?, notes = ?,
           emailStatus = 'unknown', emailCheckedAt = NULL, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName || null, email || null, phone || null, company || null, website || null, notes || null, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        });
      }
    );
  });

  // DELETE contact
  app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contact deleted', id });
    });
  });

  // BULK import (CSV upload, sent as parsed JSON rows in batches from the client).
  // Dedupes on email when present so re-uploading the same CSV is safe.
  app.post('/api/contacts/bulk', (req, res) => {
    const { contacts: rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'contacts must be a non-empty array' });
    }
    if (rows.length > 5000) {
      return res.status(400).json({ error: 'Send at most 5000 rows per batch' });
    }

    const insert = db.prepare(`
      INSERT INTO contacts (firstName, lastName, email, phone, company, website, notes)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = ? AND email IS NOT NULL AND email != '')
    `);

    let inserted = 0;
    let skipped = 0;

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      for (const r of rows) {
        const firstName = (r.firstName || r.name || '').toString().trim();
        if (!firstName) {
          skipped++;
          continue;
        }
        const email = r.email ? r.email.toString().trim() : null;
        insert.run(
          firstName,
          r.lastName ? r.lastName.toString().trim() : null,
          email,
          r.phone ? r.phone.toString().trim() : null,
          r.company ? r.company.toString().trim() : null,
          r.website ? r.website.toString().trim() : null,
          r.notes ? r.notes.toString().trim() : null,
          email,
          function (err) {
            if (!err && this.changes > 0) inserted++;
            else if (!err) skipped++;
          }
        );
      }
      insert.finalize();
      db.run('COMMIT', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inserted, skipped, received: rows.length });
      });
    });
  });

  // Check which contact emails look real: syntax + does the domain have mail servers (MX record).
  // This is NOT full deliverability verification (no mailbox-existence probing) — that needs a
  // paid service (ZeroBounce/NeverBounce/etc.) and an API key we don't have configured.
  app.post('/api/contacts/verify-emails', async (req, res) => {
    const { ids } = req.body;

    const params = [];
    let where = "email IS NOT NULL AND email != ''";
    if (Array.isArray(ids) && ids.length > 0) {
      where += ` AND id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }

    db.all(`SELECT id, email FROM contacts WHERE ${where}`, params, async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const mxCache = new Map();
      let valid = 0, invalid = 0;

      // Small concurrency window so a 70k-row full check doesn't open unbounded sockets.
      const CONCURRENCY = 20;
      let cursor = 0;

      async function worker() {
        while (cursor < rows.length) {
          const row = rows[cursor++];
          const status = await checkEmail(row.email, mxCache);
          if (status === 'valid') valid++; else invalid++;
          await new Promise((resolve) => {
            db.run(
              `UPDATE contacts SET emailStatus = ?, emailCheckedAt = CURRENT_TIMESTAMP WHERE id = ?`,
              [status, row.id],
              resolve
            );
          });
        }
      }

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rows.length) }, worker));
      res.json({ checked: rows.length, valid, invalid });
    });
  });

  async function checkEmail(email, mxCache) {
    if (!EMAIL_RE.test(email)) return 'invalid';
    const domain = email.split('@')[1].toLowerCase();
    if (mxCache.has(domain)) return mxCache.get(domain) ? 'valid' : 'invalid';
    try {
      const records = await resolveMx(domain);
      const ok = Array.isArray(records) && records.length > 0;
      mxCache.set(domain, ok);
      return ok ? 'valid' : 'invalid';
    } catch {
      mxCache.set(domain, false);
      return 'invalid';
    }
  }

  // Get stats — fast, single query
  app.get('/api/stats', (req, res) => {
    db.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as businessEmails,
        SUM(CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END) as withWebsites,
        COUNT(DISTINCT company) as uniqueCompanies
      FROM contacts
    `, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        total: row.total || 0,
        businessEmails: row.businessEmails || 0,
        withWebsites: row.withWebsites || 0,
        uniqueCompanies: row.uniqueCompanies || 0
      });
    });
  });

  // GET all websites — from contacts, grouped with contact counts (replaces loadWebsites logic)
  app.get('/api/websites', (req, res) => {
    db.all(`
      SELECT
        website as domain,
        company,
        COUNT(*) as contacts
      FROM contacts
      WHERE website IS NOT NULL AND website != ''
      GROUP BY website
      ORDER BY contacts DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    });
  });

  // GET single website
  app.get('/api/websites/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM websites WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Website not found' });
      res.json(row);
    });
  });

  // CREATE website
  app.post('/api/websites', (req, res) => {
    const { name, url, category, notes } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'name and url are required' });
    }

    db.run(
      `INSERT INTO websites (name, url, category, notes) VALUES (?, ?, ?, ?)`,
      [name, url, category || null, notes || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM websites WHERE id = ?', [this.lastID], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(row);
        });
      }
    );
  });

  // UPDATE website
  app.put('/api/websites/:id', (req, res) => {
    const { id } = req.params;
    const { name, url, category, notes } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'name and url are required' });
    }

    db.run(
      `UPDATE websites
       SET name = ?, url = ?, category = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, url, category || null, notes || null, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM websites WHERE id = ?', [id], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        });
      }
    );
  });

  // DELETE website
  app.delete('/api/websites/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM websites WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Website deleted', id });
    });
  });

  // Google Sheets API Endpoints
  app.get('/api/sheets/status', async (req, res) => {
    try {
      const authenticated = await googleSheets.isAuthenticated();
      res.json({ authenticated });
    } catch (err) {
      res.json({ authenticated: false, error: err.message });
    }
  });

  app.get('/api/sheets/auth', (req, res) => {
    try {
      const authUrl = googleSheets.getAuthUrl();
      res.json({ authUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
      }

      await googleSheets.handleAuthCallback(code);
      res.redirect('/google-connector.html?success=true');
    } catch (err) {
      res.status(500).send(`Auth error: ${err.message}`);
    }
  });

  app.post('/api/sheets/logout', (req, res) => {
    try {
      const tokenPath = path.join(process.cwd(), 'google-token.json');
      if (fs.existsSync(tokenPath)) {
        fs.unlinkSync(tokenPath);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // List all spreadsheets in user's Google Drive
  app.get('/api/sheets/list', async (req, res) => {
    try {
      const sheets = await googleSheets.getSheetsList();
      res.json(sheets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // List tabs (sheets) within a specific spreadsheet
  app.get('/api/sheets/tabs/:spreadsheetId', async (req, res) => {
    try {
      const { spreadsheetId } = req.params;
      const tabs = await googleSheets.getSheetMetadata(spreadsheetId);
      res.json(tabs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sheets/preview', async (req, res) => {
    try {
      const { spreadsheetId, sheetName } = req.query;
      if (!spreadsheetId || !sheetName) {
        return res.status(400).json({ error: 'spreadsheetId and sheetName required' });
      }

      const data = await googleSheets.getSheetData(spreadsheetId, sheetName);
      const columns = data.length > 0 ? Object.keys(data[0]) : [];

      res.json({
        columns,
        preview: data.slice(0, 5),
        totalRows: data.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/sheets/import', async (req, res) => {
    try {
      const { spreadsheetIds, sheetNames, columnMappings } = req.body;

      if (!spreadsheetIds || !Array.isArray(spreadsheetIds) || spreadsheetIds.length === 0) {
        return res.status(400).json({ error: 'spreadsheetIds array required' });
      }

      let totalImported = 0;
      let totalSkipped = 0;
      let totalFiltered = 0;

      // Process each selected sheet
      for (let i = 0; i < spreadsheetIds.length; i++) {
        const spreadsheetId = spreadsheetIds[i];
        const sheetName = sheetNames[i];
        const mapping = (columnMappings && columnMappings[i]) || { email: 'email', firstName: 'firstName', lastName: 'lastName', company: 'company' };

        console.log(`\n📥 Importing from: ${sheetName}`);

        try {
          // Fetch data from Google Sheet
          const data = await googleSheets.getSheetData(spreadsheetId, sheetName);
          console.log(`   Retrieved ${data.length} rows`);

          if (data.length === 0) {
            console.log(`   ⚠️  Sheet is empty, skipping`);
            continue;
          }
        } catch (err) {
          console.log(`   ⚠️  Sheet not found or error reading: ${err.message}`);
          console.log(`   ⏭️  Skipping and continuing to next sheet...`);
          continue;
        }

        // Map columns and filter
        const contacts = data
          .map(row => {
            if (!row || typeof row !== 'object') return null;
            const email = row[mapping.email] || '';
            if (!email) return null;

            // Skip "do not send" rows
            if (mapping.doNotSend && row[mapping.doNotSend] === 'yes' || row[mapping.doNotSend] === 'YES') {
              return null;
            }

            // Skip free emails
            if (email.match(/@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail)\.com/i)) {
              return null;
            }

            return {
              firstName: row[mapping.firstName] || email.split('@')[0],
              lastName: row[mapping.lastName] || '',
              email,
              company: row[mapping.company] || extractCompanyFromDomain(email.split('@')[1]),
              website: extractDomain(email),
              notes: `Source: ${sheetName}`
            };
          })
          .filter(c => c !== null);

        const filtered = data.length - contacts.length;
        console.log(`   Filtered: ${filtered}, Mapped: ${contacts.length}`);

        // Import in batches
        if (contacts.length > 0) {
          const batchSize = 1000;
          for (let j = 0; j < contacts.length; j += batchSize) {
            const batch = contacts.slice(j, j + batchSize);
            const result = await new Promise((resolve) => {
              db.serialize(() => {
                const insert = db.prepare(`
                  INSERT INTO contacts (firstName, lastName, email, phone, company, website, notes)
                  SELECT ?, ?, ?, ?, ?, ?, ?
                  WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = ? AND email IS NOT NULL AND email != '')
                `);

                let inserted = 0;
                let skipped = 0;

                db.run('BEGIN TRANSACTION');
                for (const contact of batch) {
                  insert.run(
                    contact.firstName,
                    contact.lastName || null,
                    contact.email,
                    null,
                    contact.company,
                    contact.website,
                    contact.notes,
                    contact.email,
                    function (err) {
                      if (!err && this.changes > 0) inserted++;
                      else if (!err) skipped++;
                    }
                  );
                }
                insert.finalize();
                db.run('COMMIT', () => {
                  resolve({ inserted, skipped });
                });
              });
            });

            totalImported += result.inserted;
            totalSkipped += result.skipped;
          }
        }

        totalFiltered += filtered;
      }

      console.log(`\n✅ Import complete`);
      console.log(`   Imported: ${totalImported}, Skipped: ${totalSkipped}, Filtered: ${totalFiltered}`);

      res.json({
        success: true,
        imported: totalImported,
        skipped: totalSkipped,
        filtered: totalFiltered
      });
    } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Helper functions
  function extractCompanyFromDomain(domain) {
    if (!domain) return '';
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function extractDomain(email) {
    if (!email) return null;
    const domain = email.split('@')[1];
    if (!domain || domain.match(/gmail|yahoo|hotmail|outlook|aol|icloud/)) {
      return null;
    }
    return domain;
  }

  // CSV Export endpoints — server-side generation for speed
  app.get('/api/export/meta-audience', (req, res) => {
    db.all('SELECT email, firstName, lastName FROM contacts WHERE email IS NOT NULL AND email != ""', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const csv = 'Email,First Name,Last Name\n' + rows.map(c => `"${c.email}","${c.firstName}","${c.lastName || ''}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="meta-audience.csv"');
      res.send(csv);
    });
  });

  app.get('/api/export/meta-lookalike', (req, res) => {
    db.all('SELECT email, firstName, lastName, company FROM contacts WHERE email IS NOT NULL AND email != ""', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const csv = 'Email,First Name,Last Name,Company\n' + rows.map(c => `"${c.email}","${c.firstName}","${c.lastName || ''}","${c.company || ''}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="meta-lookalike.csv"');
      res.send(csv);
    });
  });

  app.get('/api/export/email-campaign', (req, res) => {
    db.all('SELECT email, firstName, lastName, company FROM contacts WHERE email IS NOT NULL AND email != ""', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const csv = 'Email,First Name,Last Name,Company\n' + rows.map(c => `"${c.email}","${c.firstName}","${c.lastName || ''}","${c.company || ''}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="email-campaign.csv"');
      res.send(csv);
    });
  });

  app.get('/api/export/outreach', (req, res) => {
    db.all('SELECT firstName, lastName, email, company, website FROM contacts WHERE email IS NOT NULL AND email != ""', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const csv = 'First Name,Last Name,Email,Company,Website\n' + rows.map(c => `"${c.firstName}","${c.lastName || ''}","${c.email}","${c.company || ''}","${c.website || ''}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="outreach.csv"');
      res.send(csv);
    });
  });

  app.get('/api/export/websites', (req, res) => {
    db.all('SELECT DISTINCT website FROM contacts WHERE website IS NOT NULL AND website != "" ORDER BY website', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const csv = 'Website\n' + rows.map(r => r.website).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="websites-list.csv"');
      res.send(csv);
    });
  });

  app.listen(PORT, () => {
    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log('✓ Database: contacts.db\n');
    console.log('📚 Google Sheets Connector ready!');
    console.log('   → UI: http://localhost:${PORT}/google-connector.html\n');
  });
})();
