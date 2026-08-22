# 🚀 DEPLOY TO VERCEL - MANUAL STEPS

**Status:** Ready to deploy  
**Time required:** 10-15 minutes  
**Difficulty:** Easy (4 steps)

---

## **STEP 1: Open PowerShell or Terminal**

**Windows (PowerShell):**
```
Press: Windows + X
Select: Windows PowerShell
Or: Type "PowerShell" in Start menu
```

**Mac/Linux (Terminal):**
```
Command + Space → Type "Terminal" → Enter
Or: Open your terminal app
```

---

## **STEP 2: Navigate to Project**

```powershell
# Windows
cd "C:\Users\HP\contacts-app\lilita-booking-system"

# Mac/Linux
cd ~/path/to/lilita-booking-system
```

**Verify you're in right directory:**
```powershell
# Should show DEPLOY-VERCEL.ps1 file
ls DEPLOY-VERCEL.ps1
# Or on Mac/Linux:
# ls DEPLOY-VERCEL.sh
```

---

## **STEP 3: Run Deployment Script**

### **Option A: Automated Script (Recommended)**

**Windows:**
```powershell
.\DEPLOY-VERCEL.ps1
```

**Mac/Linux:**
```bash
chmod +x DEPLOY-VERCEL.sh
./DEPLOY-VERCEL.sh
```

The script will:
1. ✅ Check Vercel CLI
2. ✅ Navigate to frontend
3. ✅ Install dependencies
4. ✅ Build production bundle
5. ✅ Deploy to Vercel

### **Option B: Manual Steps (If Script Fails)**

```powershell
# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
vercel --prod --confirm
```

---

## **STEP 4: Authenticate with Vercel**

When prompted:
1. You'll see: `Set up and deploy "~/lilita-booking-system/frontend"?`
2. Click **YES** in browser window that opens
3. Login with **GitHub** account
4. Authorize Vercel access
5. Browser shows deployment starting
6. Script continues and completes

---

## **STEP 5: Configure Environment Variable**

**After deployment completes:**

1. Go to: https://vercel.com/dashboard
2. Find project: **lilita-agent-platform**
3. Click: **Settings**
4. Select: **Environment Variables**
5. Add new variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-backend.railway.app`
   - (Get this URL from Railway dashboard)
6. Click: **Save**
7. Go to: **Deployments** tab
8. Click: **Redeploy** on latest deployment

---

## **STEP 6: Verify Deployment**

```
1. Open: https://lilita-agent-platform.vercel.app
2. Should see: "🎯 Join the Agent Network"
3. Test signup with:
   - Email: test@example.com
   - Name: Test Agent
   - Password: TestPassword123
4. Should see referral code generated
5. Try creating an offer
6. Verify no console errors (F12)
```

---

## **✅ SUCCESS CHECKLIST**

After deployment, verify:

- [ ] Script ran without errors
- [ ] URL shows: https://lilita-agent-platform.vercel.app
- [ ] Page loads (not 404)
- [ ] Signup form appears
- [ ] Browser console has no red errors (F12)
- [ ] API calls show in Network tab (F12)
- [ ] Environment variable is set in Vercel
- [ ] Can complete signup flow

---

## **🧪 TEST THE DEPLOYMENT**

After verifying basic functionality:

1. **Test Signup:**
   ```
   Email: test1@example.com
   Name: John Test
   Password: TestPass123
   
   Expected: See referral code
   ```

2. **Test Offer Creation:**
   ```
   Offer Name: Test Safari
   Selling Price: 699
   Expected: Margin shows 200
   ```

3. **Test Dashboard:**
   ```
   Expected: See 4 tabs (Earnings, Referrals, Leaderboard, Missions)
   ```

4. **Check Console:**
   ```
   F12 → Console tab
   Expected: No red errors
   Expected: API calls to backend
   ```

---

## **⚠️ TROUBLESHOOTING**

### "Vercel CLI not found"
```powershell
npm install -g vercel
```

### "Not authenticated"
```powershell
vercel login
# Follow browser auth
```

### "Port 3002 in use"
```powershell
# Kill existing process
lsof -ti:3002 | xargs kill -9
```

### "Cannot find frontend"
```powershell
# Make sure you're in project root
# Should see: frontend/ folder
ls frontend
```

### "Build failed"
```powershell
# Clear and rebuild
rm -r frontend/dist
cd frontend
npm install
npm run build
```

### "API calls returning 404"
```
Check:
1. Is backend running on Railway?
2. Is VITE_API_URL set in Vercel?
3. Did you redeploy after setting env var?
```

---

## **📊 EXPECTED OUTPUT**

When script runs successfully:

```
🚀 AGENT PLATFORM 2.0 - VERCEL DEPLOYMENT
==========================================

STEP 1: Checking Prerequisites
✓ Vercel CLI installed
✓ Node.js installed

STEP 2: Navigating to Frontend
✓ Frontend directory ready

STEP 3: Installing Dependencies
✓ Dependencies installed

STEP 4: Building Frontend
✓ Build successful (942ms)
  - 32 modules transformed
  - dist/index.html ready
  - dist/assets/index-*.css
  - dist/assets/index-*.js

STEP 5: Deploying to Vercel
[Browser window opens for authentication]

STEP 6: Deployment Complete
✅ DEPLOYMENT SUCCESSFUL

✓ https://lilita-agent-platform.vercel.app
✓ Frontend is live!

NEXT STEPS:
1. Configure Environment Variable:
   Go to: https://vercel.com/dashboard
   Project: lilita-agent-platform
   Settings → Environment Variables
   Add: VITE_API_URL = https://your-railway-backend.railway.app
   Redeploy

2. Test Your Deployment:
   Open: https://lilita-agent-platform.vercel.app
   Test signup flow

3. Monitor Backend Connection:
   Browser F12 → Network tab
   API calls should go to Railway backend
```

---

## **🎉 YOU'RE DONE!**

Once verified:
1. ✅ Frontend deployed to Vercel
2. ✅ Environment variables configured
3. ✅ Signup flow working
4. ✅ Ready for Friday launch

---

## **📱 SHARE WITH TEAM**

**Frontend URL:**
```
https://lilita-agent-platform.vercel.app
```

**GitHub Repo:**
```
https://github.com/Burch-Labs/lilita-booking-system
Branch: contacts-app
```

**Status:**
```
🟢 DEPLOYED & LIVE
```

---

## **🚀 READY TO LAUNCH FRIDAY**

Everything is set. Agent Platform 2.0 is ready.

**Next week at 9:00 AM, agents will start signing up.**

Enjoy the launch! 🎉

