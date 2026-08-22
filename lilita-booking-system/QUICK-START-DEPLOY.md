# ⚡ QUICK START - DEPLOY IN 30 MINUTES

## Prerequisites
- GitHub account (with repo pushed)
- Credit card (for Railway/Vercel - both have free tier)
- 30 minutes

---

## PART 1: BACKEND TO RAILWAY (15 min)

### 1️⃣ Create Railway Account
```
1. Go to https://railway.app
2. Click "Sign Up"
3. Connect GitHub account
4. Authorize access
```

### 2️⃣ Create New Project
```
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Find "lilita-booking-system" repo
4. Click "Deploy"
```

### 3️⃣ Add PostgreSQL Database
```
1. In Railway dashboard, click "Add Service"
2. Search for "PostgreSQL"
3. Click it to add
4. Wait ~30 seconds for database to spin up
```

### 4️⃣ Set Environment Variables
Click on your **backend service** → Variables tab → Add these:

```
DB_HOST=[Railway shows this when you click PostgreSQL service]
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[Railway shows this too]
DB_NAME=lilita_booking
JWT_SECRET=use-a-strong-random-32-character-string-here
NODE_ENV=production
PORT=3002
FRONTEND_URL=[save for later]
```

### 5️⃣ Load Database Schema
In Railway dashboard:
1. Click PostgreSQL service
2. Click "Connect" tab
3. Copy the connection string
4. In your terminal:
```bash
psql "postgresql://postgres:PASSWORD@HOST:5432/lilita_booking" < offers-schema.sql
```

### 6️⃣ Verify Backend is Live
Railway shows your API URL (e.g., `https://lilita-api.railway.app`)

Test it:
```bash
curl https://lilita-api.railway.app/api/health
# Should return: {"status":"OK",...}
```

✅ **Backend Live!**

---

## PART 2: FRONTEND TO VERCEL (10 min)

### 1️⃣ Create Vercel Account
```
1. Go to https://vercel.com
2. Click "Sign Up"
3. Select "GitHub"
4. Authorize access
```

### 2️⃣ Import Project
```
1. Click "Add New..." → "Project"
2. Find "lilita-booking-system" repo
3. Click "Import"
```

### 3️⃣ Configure Build Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: ./frontend
```

### 4️⃣ Add Environment Variable
Click "Environment Variables" → Add:
```
VITE_API_URL = https://lilita-api.railway.app
```
(Use your actual Railway API URL from Part 1)

### 5️⃣ Deploy
Click "Deploy"

Wait ~2 minutes for build to complete.

Vercel shows your frontend URL (e.g., `https://lilita-booking.vercel.app`)

### 6️⃣ Verify Frontend is Live
Click the Vercel URL → Should see login page

✅ **Frontend Live!**

---

## PART 3: CONNECT THEM (5 min)

### Update Backend with Frontend URL
In Railway backend service → Variables:
- Add `FRONTEND_URL = https://your-vercel-url.vercel.app`
- Click "Save"
- Railway redeploys automatically

### Test End-to-End
1. Open your Vercel frontend URL
2. Register as a new agent
3. Login
4. Click "Offers" in menu
5. Should see 2 offers:
   - Dec 2026 Fam Trip: USD 499
   - Q1 2027 Pre-Season: USD 1,260 (40% off)
6. Click offer → view details
7. See all inclusions and activities

✅ **System is Live!**

---

## PART 4: LAUNCH CAMPAIGN (Optional - 5 min)

### Send Fam Trip Offers to Agents

Once system is verified:
1. Get list of 200+ agent emails
2. Use admin dashboard to create campaign
3. Email template:
```
Subject: Exclusive Fam Trip - USD 499 per person (Dec 2026)

Hi [Agent Name],

Join us for an exclusive pre-opening familiarization trip to Lilita Keper.

🏨 Only USD 499 per person (normally USD 1,497)
📅 December 1-31, 2026
✈️ All-inclusive: accommodation, game drives, meals, transfers

Book now: [Your Vercel URL]

Best regards,
Lilita Keper Team
```

---

## ✅ YOU'RE LIVE!

Your booking system is now production-ready with:
- ✅ Real-time calendar management
- ✅ Multiple suites + inventory control
- ✅ Special offers with commission tracking
- ✅ Agent portal
- ✅ Admin dashboard
- ✅ Database backups (automatic on Railway)

**Next Steps:**
1. Monitor logs for first 24 hours
2. Collect feedback from agents
3. Build payment UI (Stripe + M-Pesa) next week
4. Scale database if bookings surge

---

## 🆘 Quick Troubleshooting

**"Cannot GET /api/offers" error**
- Check VITE_API_URL matches your Railway URL exactly
- Redeploy frontend after changing URL

**"Database connection failed"**
- Verify DB_HOST, DB_USER, DB_PASSWORD in Railway variables
- Check offers-schema.sql was loaded

**"Login not working"**
- Ensure JWT_SECRET is set in Railway variables
- Check agents table exists: `SELECT COUNT(*) FROM agents;`

**Offers not showing**
- Verify offers-schema.sql was executed
- Check: `SELECT COUNT(*) FROM offers;` should return 2

---

## 💬 Support
- Railway: https://railway.app/support
- Vercel: https://vercel.com/support
- PostgreSQL: https://postgresql.org

**Congratulations! Your system is live! 🎉**
