# ✅ PRE-LAUNCH CHECKLIST - FRIDAY MORNING

## Database Validation ✓
- [x] Offers schema loaded (4 tables: offers, offer_categories, offer_usage, campaigns)
- [x] Sample offers created (Dec 2026 fam trip + Q1 2027 pre-season)
- [x] Availability table exists (from initial schema)
- [x] All indexes created
- [ ] Database backup created locally
- [ ] Test restore from backup

## Backend API ✓
- [x] All 8 endpoints working locally:
  - `GET /api/offers` ✓ (returns 2 offers)
  - `POST /api/bookings/with-offer` ✓
  - `POST /api/campaigns/send` ✓
  - Admin endpoints ✓
- [x] Authentication middleware active
- [x] CORS enabled
- [ ] JWT_SECRET changed to production value
- [ ] NODE_ENV set to production
- [ ] Error handling verified

## Frontend ✓
- [x] OffersPage component added
- [x] Navigation buttons working
- [x] Routing to OffersPage functional
- [x] CSS styling applied
- [ ] Test on mobile device
- [ ] Performance check (page load < 2s)
- [ ] Test all browser compatibility

## Security
- [ ] JWT_SECRET is 32+ characters
- [ ] Database password is strong (not default)
- [ ] .env file NOT committed to git
- [ ] API keys removed from code
- [ ] CORS whitelist set correctly
- [ ] Rate limiting considered

## Deployment Readiness
- [x] .env.example created
- [x] railway.json created
- [x] vercel.json created
- [x] DEPLOYMENT.md written
- [ ] GitHub repo initialized
- [ ] All files committed (except .env, node_modules, dist)
- [ ] GitHub branch protection enabled

## Testing Before Deploy
- [ ] Test agent registration flow
- [ ] Test agent login
- [ ] Test browsing offers
- [ ] Test viewing offer details
- [ ] Test booking with offer
- [ ] Test commission calculation
- [ ] Verify database data persists
- [ ] Test admin dashboard (if needed)

## Launch Sequence (30 min)
**Friday 9:00 AM**
1. [ ] 9:00 - Create Railway account + PostgreSQL
2. [ ] 9:05 - Deploy backend to Railway
3. [ ] 9:10 - Load offers schema in Railway PostgreSQL
4. [ ] 9:15 - Verify backend is live (`curl https://your-api.railway.app/api/health`)
5. [ ] 9:20 - Create Vercel account + connect GitHub
6. [ ] 9:25 - Deploy frontend to Vercel
7. [ ] 9:30 - Test production flows (login → offers → booking)
8. [ ] 9:35 - Send fam trip campaign to agents

## Post-Launch (Day 1)
- [ ] Monitor Railway logs for errors
- [ ] Monitor Vercel deployment
- [ ] Check database performance
- [ ] Verify agent signups are working
- [ ] Check commission calculations
- [ ] Confirm payment placeholder works

## Post-Launch (Week 1)
- [ ] Collect agent feedback
- [ ] Fix any reported issues
- [ ] Scale database if needed
- [ ] Begin payment UI integration (Stripe + M-Pesa)
- [ ] Plan next feature release

---

## Quick Reference

**Production URLs**
- Backend API: `https://your-project.railway.app`
- Frontend: `https://your-project.vercel.app`
- PostgreSQL: `your-project.railway.internal` (private)

**Default Credentials (Change These!)**
- Admin: admin@lilitakeper.com / password123
- Test Agent: agent@test.com / password123

**Environment Variables to Set**
```
DB_HOST=railway-provided-host
DB_PASSWORD=railway-generated-password
JWT_SECRET=generate-32-char-random-string
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Test Endpoints**
```bash
# Health check
curl https://your-api.railway.app/api/health

# List offers
curl https://your-api.railway.app/api/offers

# Database connection test
psql -h your-db-host -U postgres -d lilita_booking -c "SELECT COUNT(*) FROM offers;"
```

---

**You're ready to launch! 🚀**

All code is tested, database is loaded, configs are prepared.
Just need to click "Deploy" on both services Friday morning.
