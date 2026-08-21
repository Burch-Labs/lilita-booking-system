import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase, getDatabase } from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
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

  // GET all contacts with optional search
  app.get('/api/contacts', (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM contacts ORDER BY firstName, lastName';
    let params = [];

    if (search) {
      query = `
        SELECT * FROM contacts
        WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ?
        ORDER BY firstName, lastName
      `;
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
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
    const { firstName, lastName, email, phone, company, notes } = req.body;

    if (!firstName) {
      return res.status(400).json({ error: 'firstName is required' });
    }

    db.run(
      `INSERT INTO contacts (firstName, lastName, email, phone, company, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName || null, email || null, phone || null, company || null, notes || null],
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
    const { firstName, lastName, email, phone, company, notes } = req.body;

    if (!firstName) {
      return res.status(400).json({ error: 'firstName is required' });
    }

    db.run(
      `UPDATE contacts
       SET firstName = ?, lastName = ?, email = ?, phone = ?, company = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName || null, email || null, phone || null, company || null, notes || null, id],
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

  // Get stats
  app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM contacts', (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });

  app.listen(PORT, () => {
    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log('✓ Database: contacts.db\n');
  });
})();
