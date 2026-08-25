# Quick Start - Agent Portal with Supabase

## 5-Minute Setup Checklist

### 1. Create Supabase Project ✓
- [ ] Go to https://supabase.com
- [ ] Create new project
- [ ] Copy **Project URL**
- [ ] Copy **Anon Public Key**
- [ ] Save these credentials

### 2. Set Up Database ✓
- [ ] Open Supabase SQL Editor
- [ ] Copy & run `supabase-schema.sql`
- [ ] Wait for tables to create

### 3. Add Test Data ✓
- [ ] In SQL Editor, run the seed script from PHASE1_SETUP.md
- [ ] Note your `{PROPERTY_ID}` for use in next steps
- [ ] Create test agent account

### 4. Configure Frontend ✓
```bash
cd lilita-booking-system/frontend
npm install
```

Create `.env.local`:
```
VITE_SUPABASE_URL=your-url-here
VITE_SUPABASE_ANON_KEY=your-key-here
```

### 5. Run App ✓
```bash
npm run dev
```

Visit: http://localhost:5173

Test login:
- Email: `test@agent.com`
- Password: (as set in Supabase Auth)

---

## What You Get

✅ Agent login  
✅ Agent dashboard showing:
  - Commission tier
  - Total commissions earned
  - Contact information
  - Commission tier breakdown (20%-40%)
  - Rates for 2026, 2027, 2028
  - Booking history
  
✅ Mobile responsive  
✅ Professional branding with custom colors  
✅ Easy sign out  

---

## Architecture

```
Lilita Keper Agent Portal (Phase 1)
├── Frontend (React + Vite)
│   ├── Login page → Supabase Auth
│   ├── Dashboard → Shows rates + commissions
│   └── Styling (responsive, brand colors)
│
└── Backend (Supabase)
    ├── PostgreSQL database
    ├── Row-level security (agents see only their data)
    ├── Auth via supabase.auth
    └── Real-time updates (optional future)
```

---

## Troubleshooting

**"Environment variables not loading"**
- Rename `.env.local` (must be exactly this name)
- Restart dev server after changes

**"Login fails"**
- Check Supabase URL and key are correct
- Verify test agent exists in database
- Check browser console for errors

**"Dashboard shows blank"**
- Verify property_id in database
- Check agent is linked to property
- Verify rates & commission tiers exist

---

## Deploy to Vercel

When ready:

```bash
npm run build
```

Then push to GitHub and connect to Vercel. Environment variables → add your Supabase credentials.

---

## Next: Phase 2

- Admin dashboard (manage agents, rates)
- Booking form (agents create bookings)
- Commission calculations
- Payment tracking

See PHASE1_SETUP.md for full details.
