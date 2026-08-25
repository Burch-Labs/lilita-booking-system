# 🚀 BURCH COMPLETE SETUP - Option B

## 3-Step Automated Setup

---

## STEP 1: Supabase Database Setup (5 minutes)

1. Go to: **https://supabase.com/dashboard/project/dhirjmihiuwcibkxhucu**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open file: `BURCH-COMPLETE-SETUP.sql` (in this folder)
5. **Copy ALL the SQL** 
6. **Paste into Supabase SQL Editor**
7. Click **Run** (top right)
8. **Wait for completion** ✅

You should see:
```
✅ Properties - 1
✅ Commission Tiers - 4
✅ Rates - 9
✅ Test Agent - 1
```

---

## STEP 2: Frontend Automation (3 minutes)

1. Open **PowerShell**
2. Go to frontend folder:
   ```
   cd C:\Users\HP\contacts-app\lilita-booking-system\frontend
   ```
3. Run the setup script:
   ```
   .\setup-burch.ps1
   ```
4. **Wait for completion**

The script will:
- ✅ Create `.env.local` with correct credentials
- ✅ Install npm dependencies
- ✅ Clear cache
- ✅ Start dev server automatically

---

## STEP 3: Test Burch Login (1 minute)

1. **Open browser**
2. Go to: **http://localhost:5173**
3. Login with:
   - **Email:** `test@burch.app`
   - **Password:** `test`
4. You should see:
   - ✅ Mara Meguarra Sanctuary Dashboard
   - ✅ Commission tiers (20%, 25%, 30%, 40%)
   - ✅ 2026-2028 rates
   - ✅ Empty bookings (first agent)

---

## 🎉 YOU'RE DONE!

**Burch is running locally.**

---

## Next Steps

### Add Real Agents
Replace test agent with your actual agents in Supabase:
```sql
DELETE FROM agents WHERE email = 'test@burch.app';

INSERT INTO agents (property_id, email, password_hash, first_name, last_name, company, phone, whatsapp, status)
SELECT
  id,
  'agent@company.com',
  'hash',
  'First',
  'Last',
  'Agency Name',
  '+254700000000',
  '+254700000000',
  'active'
FROM properties WHERE name = 'Mara Meguarra Sanctuary';
```

### Deploy to Vercel
Once tested locally:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Live URL ready 🌐

---

## Troubleshooting

**If you see "Connection error" in browser:**
- Verify `.env.local` exists
- Check file has correct credentials
- Restart dev server (stop and run setup script again)

**If npm install fails:**
- Delete `node_modules` folder
- Run setup script again

**If SQL doesn't run in Supabase:**
- Make sure you're in SQL Editor
- Copy ALL the SQL (don't miss beginning or end)
- Check for error messages

---

## Files Created

- ✅ `setup-burch.ps1` - Automated setup script
- ✅ `BURCH-COMPLETE-SETUP.sql` - Complete database setup
- ✅ `BURCH-SETUP-CHECKLIST.md` - This file

---

**Questions? Refer to PHASE1_SETUP.md for detailed documentation**
