# Agent Portal - Complete Supabase Setup Guide

## The Problem
The agent portal registration fails with: **"Cannot read properties of null (reading 'id')"**

This happens because the property lookup in the database is returning null. The Supabase database needs to be properly initialized with:
1. The Mara Meguarra Sanctuary property record
2. Proper commission tiers 
3. Rate information

## Solution: Run the Complete Setup Script

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.co
2. Log in to your project: **dhirjmihiuwcibkxhucu**
3. Navigate to **SQL Editor**

### Step 2: Run the Setup Script
Copy and paste the entire content of **BURCH-COMPLETE-SETUP.sql** into the SQL Editor and execute it.

This script will:
- ✅ Create all required tables (properties, agents, rates, commission_tiers, bookings, etc.)
- ✅ Insert the Mara Meguarra Sanctuary property
- ✅ Add commission tiers (20%, 25%, 30%, 40%)
- ✅ Add sample rates for 2024-2025
- ✅ Create test agent accounts

### Step 3: Test the Registration
1. Go to https://dulcet-tarsier-90a825.netlify.app/
2. Click "Create one" to sign up
3. Fill in:
   - First Name: Your Name
   - Last Name: Test
   - Company: Your Agency
   - Email: your-email@example.com
   - Password: YourPassword123!
4. Click "Register"

✅ Expected result: "Account created! Please log in."

### Step 4: Log In with Your New Account
1. On the login page, enter your email and password
2. You should see the Dashboard with:
   - Property information (Mara Meguarra Sanctuary)
   - Commission tiers
   - Rates
   - Booking options

## Dashboard Features (Once Logged In)
- 📊 **Dashboard** - Property overview and stats
- 📅 **New Booking** - Create guest bookings
- 📆 **Calendar** - View booking calendar
- 💰 **Commissions** - Track commission earnings
- 📄 **Confirmation Letters** - Generate booking confirmations
- 📦 **Block Bookings** - Create series of bookings
- 🚨 **Emergency Support** - Contact support
- 🎉 **Offers** - View special offers

## If Setup Script Already Ran

If you already ran the setup script but registration still fails, verify:

1. **Check if property exists:**
   - Go to Supabase → Table Editor
   - Open the `properties` table
   - You should see "Mara Meguarra Sanctuary" with ID like `12345678-...`

2. **Check if agents table is created:**
   - Open the `agents` table in Table Editor
   - It should be empty (agents get created when users sign up)

3. **Verify RLS is disabled:**
   - Open `authentication` → Row Level Security
   - Check that RLS is disabled on all tables

## Creating Test Accounts Manually

If you want to create a specific test agent:

1. Go to Supabase → Authentication → Users
2. Click "Add user"
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123!`
5. The user will be created in auth.users
6. When you sign up through the portal with this email, the agent record auto-creates

## Troubleshooting

**Error: "email rate limit exceeded"**
- Supabase has temporarily blocked signup from this IP
- Wait 24 hours and try again, OR
- Create users manually in Supabase Authentication → Users

**Error: "Cannot read properties of null"**
- The property lookup failed
- Make sure BURCH-COMPLETE-SETUP.sql was fully executed
- Verify the properties table has at least one record

**Error: "Invalid login credentials"**
- The auth user exists but agent record doesn't
- Go to any page and sign up again to create the agent record
- Or manually create the agent record in the agents table

## Database Schema Overview

```
properties
├── id (UUID)
├── name (e.g., "Mara Meguarra Sanctuary")
├── location
├── description
└── brand_color_primary

agents
├── id (UUID - matches Supabase Auth user ID)
├── property_id (foreign key to properties)
├── email
├── first_name
├── last_name
├── company
└── status

commission_tiers
├── id (UUID)
├── property_id
├── tier_name (e.g., "Standard 20%")
├── commission_rate (decimal)
└── min_nights

rates
├── id (UUID)
├── property_id
├── year
├── season (e.g., "High Season")
├── season_dates
└── price_usd

bookings
├── id (UUID)
├── property_id
├── agent_id
├── guest_name
├── check_in / check_out dates
├── total_value
└── commission_earned
```

## Next Steps

After setup is complete:
1. ✅ Test signup with multiple agents
2. ✅ Test login flow
3. ✅ Verify dashboard displays correctly
4. ✅ Test booking creation
5. ✅ Check commission calculations
6. ✅ Set up commission tier settings

For production deployment:
- Configure email verification
- Set up password reset emails
- Enable RLS policies with proper security rules
- Set admin user permissions
- Add backup and recovery procedures
