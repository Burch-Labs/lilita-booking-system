# 🚀 Agent Platform 2.0 - Vercel Deployment Guide

Deploy frontend to Vercel for live testing with Railway backend.

## **STEP 1: Deploy Frontend to Vercel (5 minutes)**

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod
```

When prompted:
- **Project name**: `lilita-agent-platform`
- **Framework**: `Vite`
- **Build command**: `npm run build` (should auto-detect)
- **Output directory**: `dist`

### Option B: Vercel Dashboard

1. Go to https://vercel.com/import
2. Connect your GitHub account
3. Import `https://github.com/Burch-Labs/lilita-booking-system`
4. Select `contacts-app` branch
5. Set root directory to `frontend`
6. Deploy

---

## **STEP 2: Configure Environment Variable**

After deployment, set the API URL:

**Via Vercel CLI:**
```bash
vercel env add VITE_API_URL
# Paste your Railway backend URL: https://lilita-api-xyz.railway.app
vercel --prod
```

**Via Vercel Dashboard:**
1. Open your project in Vercel
2. Settings → Environment Variables
3. Add `VITE_API_URL` = `https://your-railway-backend.railway.app`
4. Redeploy (Deployments → Redeploy)

---

## **STEP 3: Verify Backend is Running**

Before testing, make sure Railway backend is live:

```bash
# Test backend health check
curl https://your-railway-backend.railway.app/api/health

# Should return:
# {"status":"OK","timestamp":"2026-08-22T..."}
```

---

## **STEP 4: Test Live Integration**

### Frontend URL
```
https://lilita-agent-platform.vercel.app
```

### Test Flows

**1. Agent Signup (Onboarding)**
```
1. Visit https://lilita-agent-platform.vercel.app
2. Enter email + name + password
3. Should call POST /api/auth/agent-register on Railway
4. Verify response has referral_code
5. Click "Create Your First Offer"
6. Enter offer name + selling price
7. Should call POST /api/agent-offers on Railway
8. Step 3: See referral code + earnings preview
```

**2. Dashboard Load**
```
1. After onboarding, should redirect to dashboard
2. Dashboard calls:
   - GET /api/agent-metrics/:agent_id
   - GET /api/agent-referrals
   - GET /api/leaderboard
3. Verify stats populate with real data
4. Click tabs (Earnings, Referrals, Leaderboard, Missions)
```

**3. Check Console for Errors**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any 404 or CORS errors
4. Check Network tab → API calls
   - Should see requests to backend URL
   - Status should be 200/201 for success
```

---

## **Troubleshooting**

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix**: Make sure backend has CORS enabled in server.js:
```javascript
app.use(cors());
```

### 404 on API Calls
```
GET https://localhost:3002/api/agent-metrics... 404
```

**Fix**: Check VITE_API_URL environment variable is set correctly:
```bash
# In Vercel Dashboard
Settings → Environment Variables → VITE_API_URL
```

### Network Error
```
Failed to fetch (network error)
```

**Fix**: 
1. Verify backend URL is correct
2. Check backend is running: `curl https://your-railway-url/api/health`
3. Check firewall allows outbound HTTPS requests

---

## **Monitoring**

### Vercel Analytics
```
Vercel Dashboard → Deployments → View Performance
```

### Railway Backend Logs
```
Railway Dashboard → Services → lilita-api → Logs
```

---

## **Rollback**

If something breaks:

**Vercel:**
```
Deployments → Previous deployment → Redeploy
```

**Railway:**
```
Services → lilita-api → Deployments → Select previous → Deploy
```

---

## **Next Steps After Testing**

✅ Test signup flow
✅ Test offer creation
✅ Test dashboard loads
✅ Test API calls work
✅ Check for errors

Then:
1. Load agent-platform-schema.sql into Railway PostgreSQL
2. Create sample data (test agents, offers)
3. Run end-to-end booking flow test
4. Prepare for Friday launch

---

## **URLs to Test**

| Service | URL |
|---------|-----|
| Frontend | https://lilita-agent-platform.vercel.app |
| Backend API | https://your-railway-backend.railway.app |
| Backend Health | https://your-railway-backend.railway.app/api/health |
| GitHub Repo | https://github.com/Burch-Labs/lilita-booking-system |

