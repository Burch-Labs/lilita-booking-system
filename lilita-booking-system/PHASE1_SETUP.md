# Agent Portal Phase 1 - Supabase Setup Guide

## Overview
Building a multi-property agent commission platform where agents can log in to view:
- Current commission tiers
- Property rates (2026-2028)
- Booking history & commissions earned
- Contact information

---

## STEP 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Public Key**
3. In the SQL Editor, run the SQL from `supabase-schema.sql`

This creates:
- `properties` - lodge/property information
- `agents` - agent accounts & contact info  
- `commission_tiers` - tier structure per property
- `rates` - per-year pricing
- `bookings` - commission tracking

---

## STEP 2: Install Dependencies

```bash
cd lilita-booking-system/frontend
npm install
```

This adds:
- `@supabase/supabase-js` - Supabase client
- `react-router-dom` - Navigation between pages

---

## STEP 3: Environment Configuration

Create `.env.local` in `frontend/`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase credentials.

---

## STEP 4: Seed Initial Data

In Supabase SQL Editor, run:

```sql
-- Add Lilita Keper property
INSERT INTO properties (name, location, description, brand_color_primary, brand_color_secondary)
VALUES (
  'Lilita Keper',
  'Maasai Mara, Enonkishu Conservancy',
  'A place where refined hospitality meets the raw spirit of the wild',
  '#8B6F47',
  '#a69080'
);

-- Get the property ID
SELECT id FROM properties WHERE name = 'Lilita Keper';
-- Copy this ID and use it below as {PROPERTY_ID}

-- Add commission tiers
INSERT INTO commission_tiers (property_id, tier_name, commission_rate, min_nights, description)
VALUES
  ('{PROPERTY_ID}', 'Standard STO', 20, 0, 'Base tier for all agents'),
  ('{PROPERTY_ID}', 'Silver', 25, 50, '50+ bed nights annually'),
  ('{PROPERTY_ID}', 'Gold', 30, 75, '75+ bed nights annually'),
  ('{PROPERTY_ID}', 'Platinum Premium', 40, 100, '100+ bed nights annually');

-- Add 2026 rates
INSERT INTO rates (property_id, year, season, season_dates, price_usd, package_name)
VALUES
  ('{PROPERTY_ID}', 2026, 'Peak', '01 June - 31 August 2026', 1600, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2026, 'Shoulder', '01 April - 31 May & 01 Sep - 31 Oct', 1280, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2026, 'Low', '01 November - 31 March', 960, 'Game Package (All Inclusive)');

-- Add 2027 rates (15% increase)
INSERT INTO rates (property_id, year, season, season_dates, price_usd, package_name)
VALUES
  ('{PROPERTY_ID}', 2027, 'Peak', '01 June - 31 August 2027', 1840, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2027, 'Shoulder', '01 April - 31 May & 01 Sep - 31 Oct', 1472, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2027, 'Low', '01 November - 31 March', 1104, 'Game Package (All Inclusive)');

-- Add 2028 rates (15% increase from 2027)
INSERT INTO rates (property_id, year, season, season_dates, price_usd, package_name)
VALUES
  ('{PROPERTY_ID}', 2028, 'Peak', '01 June - 31 August 2028', 2116, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2028, 'Shoulder', '01 April - 31 May & 01 Sep - 31 Oct', 1693, 'Game Package (All Inclusive)'),
  ('{PROPERTY_ID}', 2028, 'Low', '01 November - 31 March', 1270, 'Game Package (All Inclusive)');
```

---

## STEP 5: Test Agent Account

Still in Supabase SQL Editor, create a test agent:

```sql
-- First, get your property ID
SELECT id FROM properties WHERE name = 'Lilita Keper' LIMIT 1;

-- For password hash, use a placeholder for now
-- In production, passwords are hashed by Supabase auth
INSERT INTO agents (property_id, email, password_hash, first_name, last_name, company, phone, whatsapp, status)
VALUES (
  '{PROPERTY_ID}',
  'test@agent.com',
  'test-hash-placeholder',
  'Test',
  'Agent',
  'Test Company',
  '+254123456789',
  '+254123456789',
  'active'
);
```

**Note:** For real logins, use Supabase Auth. The `password_hash` field is for reference only - Supabase Auth handles actual authentication.

---

## STEP 6: Update App.jsx for Supabase Auth

The app structure already exists in `src/App.jsx`. Update it to use Supabase:

Key changes needed:
- Replace localStorage token with Supabase session
- Use `supabase.auth.signInWithPassword()` instead of local validation
- Fetch agent data from database after login

---

## STEP 7: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and test login with:
- Email: `test@agent.com`
- Password: (set during Supabase Auth signup)

---

## Database Schema

### properties
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | TEXT | Property name (e.g., "Lilita Keper") |
| location | TEXT | Location string |
| brand_color_primary | TEXT | Primary brand color hex |
| brand_color_secondary | TEXT | Secondary brand color hex |

### agents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key (maps to auth.users.id) |
| property_id | UUID | Foreign key to properties |
| email | TEXT | Unique agent email |
| first_name, last_name | TEXT | Agent name |
| phone, whatsapp | TEXT | Contact numbers |
| status | TEXT | 'active' or 'inactive' |

### commission_tiers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| property_id | UUID | Foreign key |
| tier_name | TEXT | E.g., "Gold", "Platinum Premium" |
| commission_rate | DECIMAL | Percentage (20-40) |
| min_nights | NUMERIC | Minimum nights to qualify |

### rates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| property_id | UUID | Foreign key |
| year | INT | 2026, 2027, 2028 |
| season | TEXT | "Peak", "Shoulder", "Low" |
| price_usd | DECIMAL | Per person per night |

### bookings
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| property_id | UUID | Foreign key |
| agent_id | UUID | Foreign key to agents |
| guest_name | TEXT | Booking guest |
| check_in, check_out | DATE | Dates |
| total_value | DECIMAL | Full booking cost |
| commission_earned | DECIMAL | Agent's commission |

---

## Next Steps (Phase 2)

- Admin dashboard to manage agents & rates
- Booking form for agents to create reservations
- Commission tracking & analytics
- Multi-property support

---

## Files Created

- `supabase-schema.sql` - Database schema
- `frontend/src/lib/supabase.js` - Supabase client & queries
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/pages/Login.jsx` - Login page
- `frontend/src/pages/Dashboard.jsx` - Agent dashboard (component template)
- `frontend/.env.example` - Environment variables template
- `frontend/package.json` - Updated dependencies
