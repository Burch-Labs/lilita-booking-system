# 🚀 Quick Start: Pull All Contacts from Google Sheets

## Your Goal
Import all contacts from your Google Sheets (https://docs.google.com/spreadsheets/u/0/?pli=1) into the app, with auto-sync and ROI tracking.

---

## 📋 What You'll Do (15 minutes)

### Phase 1: Setup Google Cloud (5 min)
1. Create OAuth credentials
2. Add to `.env` file
3. Restart server

### Phase 2: Authenticate App (2 min)
1. Open connector UI
2. Click "Connect Google Sheets"
3. Login with your Google account

### Phase 3: Import Your Sheets (8 min)
1. See all your Google Sheets
2. Select which ones to import
3. Map columns (email, name, etc.)
4. Click "Import Now"

---

## 🔧 Step-by-Step

### Step 1: Get Google Credentials

**Option A: Easiest Way**
- Follow: `setup-google-auth.md` (in your project folder)
- Takes ~5 minutes
- Get your Client ID & Client Secret

**Option B: Manual Steps**
1. Go to https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name it "Undugu Contacts"
4. Search for "Google Sheets API" → Enable
5. Search for "Google Drive API" → Enable
6. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
7. Choose "Web application"
8. Add redirect URI: `http://localhost:3001/auth/google/callback`
9. Click "Create"
10. Copy your Client ID and Client Secret

### Step 2: Configure Your App

Create/edit `.env` file in your contacts-app folder:

```
GOOGLE_CLIENT_ID=<paste_your_client_id>
GOOGLE_CLIENT_SECRET=<paste_your_client_secret>
GOOGLE_REDIRECT_URL=http://localhost:3001/auth/google/callback
```

Save and close.

### Step 3: Restart Server

```bash
npm start
```

You should see:
```
✓ Server running at http://localhost:3001
✓ Database: contacts.db
📚 Google Sheets Connector ready!
```

### Step 4: Authenticate

1. Open browser: **http://localhost:3001/google-connector.html**
2. Click the big purple button: **🔐 Connect Google Sheets**
3. A Google login window opens
4. Login with your Google account
5. Click "Allow" to grant permissions
6. You'll be redirected back to the app

✅ You're authenticated!

### Step 5: Select Your Sheets

You'll see all Google Sheets in your Drive:
- Check the ones you want to import
- Click "Next →"

**Your Sheets:**
- Master Contacts
- Event Attendees
- Do Not Send List
- etc.

### Step 6: Map Your Columns

For each sheet, map which columns contain:
- **First Name** (required)
- **Last Name** (optional)
- **Email** (required)
- **Company** (optional)
- **Event Source** (optional - tracks where contacts came from)
- **Do Not Send** (optional - filters out these contacts)

**Example:**
```
Your Column       → Map To
"Email Address"  → Email
"Given Name"     → First Name
"Family Name"    → Last Name
"Organization"  → Company
"Sheet Name"     → Event Source
"Exclude"        → Do Not Send
```

Click "Next →"

### Step 7: Review & Import

You'll see:
- How many contacts will be imported
- How many will be skipped (duplicates)
- How many will be filtered ("Do Not Send")

Click **"Import Now"**

⏳ Wait for import to complete

✅ Done! Your contacts are now in the app.

---

## 🎯 What Happens Next

### Auto-Sync
- Set how often sheets update: hourly, daily, etc.
- New contacts pull automatically
- Duplicates handled automatically

### ROI Tracking
- Each contact tagged with source (which sheet/event)
- Track cost per contact
- See which sources drive best results

### "Do Not Send" Filtering
- Any row marked "Do Not Send" = skip
- Keeps compliance lists clean
- Removes automatically on sync

---

## ✅ Verify Success

### Check Dashboard
1. Open: http://localhost:3001/business-contacts.html
2. Click "Contacts" tab
3. See all your imported contacts

### Check Stats
You should see something like:
```
Total Contacts: 27,151 (existing) + N (from Google Sheets)
Last Sync: Just now
Duplicates Removed: X
Do Not Send Filtered: Y
```

---

## 🆘 Troubleshooting

### "Can't connect to Google"
**Solution:** Check your `.env` file
- Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Make sure no extra spaces or quotes

### "Redirect URI mismatch"
**Solution:** Check Google Cloud Console
- Go back to credentials
- Make sure redirect URI is exactly: `http://localhost:3001/auth/google/callback`
- No http**s**, no trailing slash

### "API not enabled"
**Solution:** Wait and refresh
- Just enabled APIs take 1-2 minutes
- Close and reopen the connector page

### "No sheets found"
**Solution:** Check permissions
- Make sure you gave the app permission to access Google Drive
- Make sure you have sheets in your Google Drive

---

## 🎨 Customization

### Change Sync Frequency
In the "Settings" tab, pick:
- Off (manual only)
- Every 1 hour
- Every 6 hours
- Every 24 hours

### Handle Duplicates
- **Skip**: Don't re-import (default)
- **Update**: Update existing contacts with new data

### Filter "Do Not Send"
- **Skip**: Don't import these rows (default)
- **Archive**: Mark as archived in database
- **Delete**: Remove if already exists

---

## 📊 Expected Results

After importing from Google Sheets, you'll have:

**✅ Master Contact Database**
- All 27,151+ existing contacts
- New contacts from your Google Sheets

**✅ Event Tracking**
- Know which source each contact came from
- See which events drive best contacts

**✅ ROI Dashboard**
- Cost per contact by source
- Which events are worth repeating

**✅ Automated Sync**
- No manual re-importing
- Always fresh data
- Smart deduplication

---

## 🚀 Next Steps

After you import, you can:

1. **Export for Campaigns**
   - Meta Ads audiences
   - Email campaign lists
   - LinkedIn exports

2. **Track Performance**
   - Which contacts convert?
   - Which events are worth the cost?
   - ROI by event source

3. **Smart Filtering**
   - Remove free email domains
   - Keep only business emails
   - Exclude "Do Not Send" contacts

---

## 💡 Pro Tips

1. **"Event Source" Column**
   - Add to each sheet to track which event contacts came from
   - Example: "Nairobi 2024", "Virtual Summit", "Direct"
   - App automatically tracks this for ROI

2. **"Do Not Send" Column**
   - Add "yes" in rows you want to exclude
   - Compliance lists, opt-outs, etc.
   - App filters automatically

3. **Multiple Sheets**
   - Import from many sheets at once
   - Each tagged with its source
   - Auto-dedup across all sheets

4. **Regular Sync**
   - Set sync to hourly if sheets update frequently
   - Set to daily if they change less often
   - Manual import always available

---

## 📞 Need Help?

If something doesn't work:

1. Check `.env` file (most common issue)
2. Check Google Cloud credentials are correct
3. Make sure APIs are enabled
4. Restart server: `npm start`
5. Clear browser cache (Ctrl+Shift+Del)
6. Try again

---

**You're ready! Start the import now 🎉**

Next: http://localhost:3001/google-connector.html
