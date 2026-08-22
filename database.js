import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db = null;

/** Adds a column if an older contacts.db doesn't have it yet — SQLite has no "ADD COLUMN IF NOT EXISTS". */
function ensureColumn(db, table, column, definition) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
      if (err) return reject(err);
      if (rows.some((r) => r.name === column)) return resolve();
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

function run(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });
}

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./contacts.db', async (err) => {
      if (err) return reject(err);

      try {
        await run(db, `
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            website TEXT,
            notes TEXT,
            emailStatus TEXT DEFAULT 'unknown',
            emailCheckedAt DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Migrate contacts.db files created before website/emailStatus existed —
        // must happen before indexing those columns below.
        await ensureColumn(db, 'contacts', 'website', 'TEXT');
        await ensureColumn(db, 'contacts', 'emailStatus', "TEXT DEFAULT 'unknown'");
        await ensureColumn(db, 'contacts', 'emailCheckedAt', 'DATETIME');

        await run(db, `CREATE INDEX IF NOT EXISTS idx_email ON contacts(email)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_phone ON contacts(phone)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_firstName ON contacts(firstName)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_emailStatus ON contacts(emailStatus)`);

        await run(db, `
          CREATE TABLE IF NOT EXISTS websites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await run(db, `CREATE INDEX IF NOT EXISTS idx_website_name ON websites(name)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_website_url ON websites(url)`);

        // Analytics tables for SEO & geography tracking
        await run(db, `
          CREATE TABLE IF NOT EXISTS clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contactId INTEGER,
            domain TEXT,
            country TEXT,
            source TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(contactId) REFERENCES contacts(id)
          );
        `);

        await run(db, `
          CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metricType TEXT,
            country TEXT,
            domain TEXT,
            count INTEGER,
            lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await run(db, `CREATE INDEX IF NOT EXISTS idx_clicks_contact ON clicks(contactId)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country)`);
        await run(db, `CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country)`);

        // Add country column to contacts if missing
        await ensureColumn(db, 'contacts', 'country', 'TEXT');
        await ensureColumn(db, 'contacts', 'emailDomain', 'TEXT');

        console.log('✓ Database initialized with SEO & analytics');
        resolve(db);
      } catch (migrateErr) {
        reject(migrateErr);
      }
    });
  });
}

export function getDatabase() {
  return db;
}
