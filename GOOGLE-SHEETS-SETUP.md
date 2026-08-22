# 🔗 GOOGLE SHEETS CONNECTOR - Setup Guide

## What This Does

✅ Authenticate with your Google account (one-time)
✅ Browse all your Google Sheets
✅ Select which sheets to import
✅ Map columns (email, name, "do not send", event source)
✅ Auto-sync contacts automatically
✅ Track which event/source each contact came from
✅ Filter out "do not send" contacts

---

## 🔐 SETUP STEPS

### Step 1: Get Google Credentials

1. Go to: **https://console.cloud.google.com**
2. Create a new project:
   - Click "Select a Project" → "New Project"
   - Name: "Undugu Contacts"
   - Click "Create"

3. Enable Google Sheets API:
   - Search for "Google Sheets API"
   - Click "Enable"

4. Enable Google Drive API:
   - Search for "Google Drive API"
   - Click "Enable"

5. Create OAuth 2.0 credentials:
   - Go to "Credentials" (left sidebar)
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     ```
     http://localhost:3001/auth/google/callback
     ```
   - Click "Create"
   - Download JSON file

### Step 2: Add Credentials to App

1. Download the credentials JSON file from Google Cloud Console
2. Save it as: `C:\Users\HP\contacts-app\google-credentials.json`
3. Copy the credentials into a `.env` file:

```bash
# Create .env file in C:\Users\HP\contacts-app\.env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:3001/auth/google/callback
```

### Step 3: Start the Connector

1. Make sure server is running:
   ```bash
   cd C:\Users\HP\contacts-app
   npm start
   ```

2. Go to: **http://localhost:3001/google-connector.html**

3. Click "Connect Google Sheets"

4. Authenticate with your Google account

5. Browse and select your sheets

---

## 📋 HOW TO USE

### Step 1: Authenticate
- Click "🔗 Connect Google Sheets"
- Login with your Google account
- Grant permissions

### Step 2: Select Sheets
- See all your Google Sheets
- Check the ones you want to import
- Click "Next"

### Step 3: Map Columns
For each sheet, map these columns:
- **First Name** - (required)
- **Last Name** - (optional)
- **Email** - (required)
- **Company** - (optional)
- **Event Source** - which event did they come from?
- **Do Not Send** - column to filter out (YES = skip)

### Step 4: Review & Import
- See preview of data
- Check how many duplicates
- Confirm import
- Watch progress bar

### Step 5: Auto-Sync
- Sheet auto-syncs every hour
- New contacts added automatically
- "Do Not Send" filtered out automatically
- Event sources tracked

---

## 💾 WHAT GETS SAVED

### Master Contacts Table
```
id | firstName | lastName | email | company | source | createdAt
```

### Events Table (tracks where contacts came from)
```
id | contactId | eventName | eventDate | cost | location
```

### Sync Log (tracks imports)
```
id | sheetId | sheetName | lastSync | imported | skipped | source
```

---

## 🎯 EXAMPLE WORKFLOW

### Your Google Sheets:
1. **Master Contacts** - All contacts
2. **Nairobi Event 2024** - Contacts from event
3. **Do Not Send List** - Emails to exclude

### What Happens:
1. You connect Google Sheets
2. Select all 3 sheets
3. Map columns:
   - Email → Email
   - Event Source → "Nairobi Event 2024" (for that sheet)
   - Do Not Send → "Status" column (skip if = "Yes")
4. Import runs
5. System automatically:
   - Adds 1,000 contacts from Master
   - Adds 500 from Nairobi Event
   - Removes 50 from Do Not Send List
   - Tracks that 500 came from "Nairobi Event 2024"
   - Total: 1,450 quality contacts

---

## 📊 COST TRACKING EXAMPLE

After importing from multiple events:

| Event | Contacts | Cost | Cost/Contact | ROI |
|-------|----------|------|--------------|-----|
| Nairobi Event 2024 | 500 | $5,000 | $10 | TBD |
| Virtual Summit | 300 | $2,000 | $6.67 | TBD |
| Direct Import | 650 | $0 | $0 | TBD |
| **Total** | **1,450** | **$7,000** | **$4.83** | **TBD** |

Once you run campaigns, you'll see which event sources convert best.

---

## 🚀 NEXT STEPS

1. **Get Google Credentials** (10 minutes)
   - Follow Step 1 above
   - Save credentials.json

2. **Add to .env file** (2 minutes)
   - Copy credentials into .env

3. **Start Connector** (1 minute)
   - Run `npm start`
   - Open http://localhost:3001/google-connector.html

4. **Import Sheets** (5 minutes)
   - Authenticate
   - Select sheets
   - Map columns
   - Import

5. **Track ROI** (ongoing)
   - See which event sources drive the best contacts
   - Optimize marketing spend

---

## ❓ COMMON QUESTIONS

**Q: Can I import from multiple sheets at once?**
A: Yes! Select as many sheets as you want in the browser.

**Q: What if my columns have different names?**
A: The mapper shows all columns - you pick which is which.

**Q: Can I add new sheets later?**
A: Yes, just open the connector again and select new sheets.

**Q: Does it auto-sync?**
A: Yes, every hour it pulls new data from your sheets.

**Q: Can I track cost per contact?**
A: Yes, add a "Cost" and "Count" column to your event sheet, we calculate it.

**Q: What about "Do Not Send"?**
A: Just map the column - any row marked YES gets filtered.

---

## 🎯 YOU'LL HAVE

✅ **Master contacts database** from all your Google Sheets
✅ **Event tracking** - know which source each contact came from
✅ **Cost attribution** - see cost per contact by source
✅ **Auto-filtering** - "Do Not Send" removed automatically
✅ **Real-time sync** - Google Sheets updates feed into app
✅ **ROI dashboard** - which events drive best results?

---

**Ready? Let's get your Google Sheets connected! 🚀**

Next: Get your Google Credentials (see Step 1 above)
