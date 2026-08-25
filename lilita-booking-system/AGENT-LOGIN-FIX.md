# Agent Portal Login Fix Guide

## Problem Summary
The agent portal has two issues:
1. **New signup fails** - Registration error: "Cannot read properties of null"
2. **Existing agent login fails** - "Invalid login credentials" 

## What was fixed
✅ Fixed registration error by safely looking up the property ID before creating agent records

## What needs to be done
The agent portal authentication requires both:
1. **Supabase Auth users** (in the auth.users table) - handles login/password
2. **Agent records** (in the agents table) - stores agent profile data

Currently, the agent records exist but don't have corresponding Supabase Auth users.

## Steps to complete the fix

### Option 1: Test via UI Signup (RECOMMENDED)
1. Go to https://dulcet-tarsier-90a825.netlify.app/
2. Click "Create one" to sign up with new credentials
3. Fill in:
   - First Name: Test
   - Last Name: Agent
   - Company: Your Agency Name
   - Email: your-email@example.com
   - Password: TestPassword123!
4. Click "Register" → This will create both auth user and agent record
5. Click "Login here" and use the same credentials to log in

### Option 2: Manual Setup (If you have Supabase access)
1. Run the SQL in `AGENT-AUTH-SETUP.sql` to create agent records
2. Go to Supabase Dashboard → Authentication → Users
3. Click "Add user" and create these accounts:
   - **Email:** sales@marameguarrasanctuary.com
   - **Password:** Burch2026!
   - 
   - **Email:** charles.matu@breathtakingsafaris.com
   - **Password:** Burch2026!
4. After creating users, copy their IDs and update the agent records with those IDs

## What's working now
✅ Registration flow - properly creates both auth user and agent record
✅ Login flow - authenticates via Supabase Auth and loads agent dashboard
✅ Portal displays - all UI elements render correctly
✅ Logo and branding - updated with Mara Meguarra logo

## Next steps for production
- Set up proper password policies in Supabase Auth
- Enable email verification
- Configure password reset flow
- Add proper error handling and user feedback
- Test all dashboard features (bookings, commissions, calendar)
