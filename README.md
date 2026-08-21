# Contacts App

A local contacts management application for managing up to 70,000+ contacts with search, create, update, and delete functionality.

## Features

- ✅ Add, edit, and delete contacts
- ✅ Search contacts by name, email, or phone
- ✅ Store data in local SQLite database
- ✅ Export contacts to CSV
- ✅ Simple, fast web interface
- ✅ Runs completely offline locally

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** SQLite3 (local file `contacts.db`)
- **Frontend:** Vanilla JavaScript + HTML/CSS (simple dashboard)
- **API:** RESTful endpoints for CRUD operations

## Setup

### 1. Install Dependencies

```bash
cd contacts-app
npm install
```

### 2. Start the Server

```bash
npm start
```

or

```bash
npm run dev
```

The server will start on `http://localhost:3001` and display:
```
✓ Server running at http://localhost:3001
✓ Database: contacts.db
```

### 3. Open the App

Open your browser and go to: **http://localhost:3001**

## API Endpoints

### Get all contacts (with optional search)
```
GET /api/contacts?search=john
```

### Get single contact
```
GET /api/contacts/:id
```

### Create contact
```
POST /api/contacts
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "company": "Acme Corp",
  "notes": "Important contact"
}
```

### Update contact
```
PUT /api/contacts/:id
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

### Delete contact
```
DELETE /api/contacts/:id
```

### Get stats
```
GET /api/stats
```

Returns: `{ "total": 12345 }`

## Importing Existing Contacts

### From CSV

1. Prepare a CSV file with columns: `firstName,lastName,email,phone,company,notes`
2. Use the Node.js script below to import:

```javascript
import sqlite3 from 'sqlite3';
import fs from 'fs';
import csv from 'csv-parser';

const db = new sqlite3.Database('./contacts.db');

fs.createReadStream('your-contacts.csv')
  .pipe(csv())
  .on('data', (row) => {
    db.run(
      'INSERT INTO contacts (firstName, lastName, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [row.firstName, row.lastName, row.email, row.phone, row.company, row.notes]
    );
  })
  .on('end', () => {
    db.close();
    console.log('✓ Import complete');
  });
```

## Database

The app uses **SQLite3** for data storage. The database file `contacts.db` is created automatically in the project root.

**Schema:**
```sql
CREATE TABLE contacts (
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
```

## File Structure

```
contacts-app/
├── server.js           # Express server & API routes
├── database.js         # SQLite setup & initialization
├── package.json        # Dependencies
├── contacts.db         # Database file (created on first run)
├── README.md
└── public/
    └── index.html      # Web dashboard
```

## Performance

- **Handles 70,000+ contacts** efficiently with indexed queries
- **Instant local search** with LIKE queries on firstName, lastName, email, phone
- **No network latency** - everything runs on your local machine

## Next Steps

- Add CSV bulk import feature
- Add contact groups/categories
- Add backup/restore functionality
- Migrate to React dashboard (optional)

## License

MIT
