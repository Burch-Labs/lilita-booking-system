# 🚀 LILITA KEPER BOOKING SYSTEM - DEPLOYMENT GUIDE

## Overview
This guide walks you through deploying the Lilita Keper booking system to production using:
- **Backend**: Railway.app (Node.js + PostgreSQL)
- **Frontend**: Vercel (React + Vite)

**Estimated time**: 30 minutes
**Cost**: Free tier available for both services

---

## Phase 1: Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Create new project

### Step 2: Add PostgreSQL Database
1. Click "Add Service"
2. Select "PostgreSQL"
3. Railway creates database automatically
4. Copy connection details (shown in variables)

### Step 3: Deploy Backend
1. Click "Add Service" → "GitHub Repo"
2. Select your lilita-booking-system repo
3. Railway detects Node.js automatically
4. Configure environment variables:
   - Click "Variables"
   - Add from `.env.example`:
     - `DB_HOST` - Your Railway PostgreSQL host
     - `DB_USER` - postgres
     - `DB_PASSWORD` - Your Railway password
     - `DB_PORT` - 5432
     - `DB_NAME` - lilita_booking
     - `JWT_SECRET` - Generate secure 32+ char string
     - `NODE_ENV` - production
     - `PORT` - 3002
     - `FRONTEND_URL` - Your Vercel frontend URL (add later)

### Step 4: Load Database Schema
1. In Railway dashboard, open PostgreSQL service
2. Click "Connect" → "PostgreSQL Client"
3. Copy offers-schema.sql content and paste in terminal
4. Run schema load script:
   ```bash
   psql -h [DB_HOST] -U postgres -d lilita_booking -f offers-schema.sql
   ```

### Step 5: Verify Backend
- Railway shows deployment URL (e.g., `https://lilita-api.railway.app`)
- Test: `curl https://lilita-api.railway.app/api/health`
- Should return: `{"status":"OK",...}`

---

## Phase 2: Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Connect your repository

### Step 2: Import Project
1. Click "New Project"
2. Select your lilita-booking-system repo
3. Vercel auto-detects Vite setup
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Root Directory**: `./frontend`

### Step 3: Add Environment Variables
In Vercel project settings:
- Add `VITE_API_URL` = Your Railway backend URL
  - Example: `https://lilita-api.railway.app`

### Step 4: Deploy
1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Shows URL: `https://lilita-booking.vercel.app`

### Step 5: Verify Frontend
1. Visit your Vercel URL
2. Try login → should connect to Railway backend
3. View offers → should load from API
4. Test booking flow

---

## Phase 3: Connect Frontend to Backend

### Update Backend Variables
In Railway dashboard:
- Add `FRONTEND_URL` = Your Vercel URL
  - Example: `https://lilita-booking.vercel.app`
- Redeploy backend (click "Redeploy")

### Test Connection
1. Open frontend in browser
2. Register new agent
3. Create booking
4. Should see database operations in Railway logs

---

## Database Backup & Recovery

### Backup PostgreSQL (Weekly)
```bash
# Backup command
pg_dump -h [DB_HOST] -U postgres lilita_booking > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -h [DB_HOST] -U postgres lilita_booking < backup-20260823.sql
```

### Railway Automatic Backups
- Railway keeps 7-day automatic backups
- Accessible in PostgreSQL service settings
- Click "Backups" tab to restore

---

## Monitoring & Logs

### Backend Logs (Railway)
- Click your service
- View "Logs" tab
- See real-time server output
- Filter by error/warning

### Frontend Logs (Vercel)
- Project Settings → Function Logs
- See deployment builds
- Monitor runtime errors

### Database Performance
- Railway dashboard shows:
  - Connection count
  - Query performance
  - Storage usage

---

## Security Checklist

Before going live:
- [ ] Change JWT_SECRET to secure 32+ char string
- [ ] Set NODE_ENV=production
- [ ] Enable Railway "Private Networking"
- [ ] Add CORS whitelist (FRONTEND_URL only)
- [ ] Rotate database password
- [ ] Enable PostgreSQL SSL connections
- [ ] Set up HTTPS (Vercel auto-enables)
- [ ] Enable Vercel's DDoS protection

---

## Troubleshooting

### "Cannot connect to database"
- Check DB_HOST, DB_USER, DB_PASSWORD in Railway variables
- Verify PostgreSQL service is running
- Test connection: `psql -h [host] -U postgres`

### "CORS error in browser"
- Verify FRONTEND_URL is set in Railway variables
- Should match exactly: `https://your-vercel-url.vercel.app`
- Redeploy backend after changing

### "Offers not loading"
- Check offers-schema.sql was loaded into database
- Verify: `psql -d lilita_booking -c "SELECT COUNT(*) FROM offers;"`
- Should show 2 sample offers

### "Login not working"
- Check JWT_SECRET is set and same on both services
- Look for JWT errors in Railway logs
- Verify agents table exists: `SELECT COUNT(*) FROM agents;`

---

## Scaling for Production

### Current Limits
- Railway free tier: 5 GB storage, shared compute
- Vercel free tier: 100 GB bandwidth, unlimited deployments

### When to upgrade
- **Agents > 500**: Upgrade Railway to Hobby tier ($5/mo)
- **Bookings > 10k/month**: Add caching (Redis)
- **Traffic > 100k/month**: Upgrade Vercel to Pro ($20/mo)

### Performance Optimization
- Add Redis cache layer for offers (Railway)
- Enable database query caching
- Use CDN for static assets (Vercel Pro)
- Implement pagination for large datasets

---

## Contact & Support

- **Railway Support**: https://railway.app/support
- **Vercel Support**: https://vercel.com/support
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js Docs**: https://expressjs.com/

---

## Post-Launch

After deployment:
1. Send fam trip offers to 200+ agents
2. Monitor booking flow for issues
3. Collect feedback from agents
4. Plan payment UI integration (Stripe + M-Pesa)
5. Schedule weekly database backups

**Your system is production-ready. Launch Friday! 🎯**
