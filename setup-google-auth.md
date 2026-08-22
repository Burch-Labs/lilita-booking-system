# 🔐 Google Sheets Authentication Setup

## Quick Start (5 minutes)

### Step 1: Create Google Cloud Project

1. Go to: **https://console.cloud.google.com**
2. Click "Select a Project" → "New Project"
3. Name: `Undugu Contacts`
4. Click "Create"

### Step 2: Enable APIs

1. Search for "Google Sheets API" in the search bar
2. Click the result → "Enable"
3. Search for "Google Drive API"
4. Click the result → "Enable"

### Step 3: Create OAuth Credentials

1. In left sidebar, click "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted: First click "Configure OAuth consent screen"
   - Choose "External"
   - Fill in app name: "Undugu Contacts"
   - Add your email
   - Save and continue

4. Back to create OAuth credentials:
   - Select "Web application"
   - Name: "Undugu Local"
   - Add redirect URI: `http://localhost:3001/auth/google/callback`
   - Click "Create"

5. Copy the credentials:
   - Client ID
   - Client Secret

### Step 4: Save to .env File

Create/update `.env` in your contacts-app folder:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:3001/auth/google/callback
```

### Step 5: Restart Server

```bash
npm start
```

### Step 6: Authenticate

1. Open: http://localhost:3001/google-connector.html
2. Click "🔐 Connect Google Sheets"
3. Login with your Google account
4. Grant permissions
5. You'll be redirected back to the app

---

## Now You Can:

✅ See all your Google Sheets  
✅ Select which sheets to import  
✅ Map columns (email, name, etc.)  
✅ Auto-import and sync  
✅ Track ROI by source  

---

## Troubleshooting

**"Redirect URI mismatch" error**
- Make sure your redirect URI in Google Cloud matches exactly:
  `http://localhost:3001/auth/google/callback`

**"Invalid credentials" error**
- Double-check Client ID and Client Secret in .env
- Make sure both Google Sheets API and Drive API are enabled

**"API not available" error**
- Wait 1-2 minutes after enabling the API
- Refresh the page

---

**Done! Your Google Sheets are now connected! 🎉**
