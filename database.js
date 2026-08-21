import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db = null;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./contacts.db', (err) => {
      if (err) return reject(err);

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        db.run(`CREATE INDEX IF NOT EXISTS idx_email ON contacts(email)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_phone ON contacts(phone)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_firstName ON contacts(firstName)`, (err) => {
          if (err) return reject(err);
          console.log('✓ Database initialized');
          resolve(db);
        });
      });
    });
  });
}

export function getDatabase() {
  return db;
}
