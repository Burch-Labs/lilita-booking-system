# 🧪 Agent Platform 2.0 - Integration Testing Guide

Complete test suite for frontend ↔ backend integration before Friday launch.

---

## **PART 1: SETUP (Before Testing)**

### Prerequisites
- Backend running on Railway
- Frontend deployed on Vercel
- Test database with schema loaded
- Sample data created

### Environment Check
```bash
# Backend health
curl https://your-railway-backend.railway.app/api/health
# Expected: {"status":"OK","timestamp":"..."}

# Frontend loads
curl https://lilita-agent-platform.vercel.app
# Expected: HTML response (no 404)
```

---

## **PART 2: AGENT ONBOARDING FLOW**

### Test Case 1: Agent Registration
**URL:** https://lilita-agent-platform.vercel.app

**Steps:**
```
1. Click "Create Account"
2. Fill in:
   - Email: test-agent@example.com
   - Full Name: John Smith
   - Company: Safari Elite (optional)
   - Password: SecurePass123
3. Click "Create Account"
4. Expected: Success page with referral code
```

**Verification:**
```
✓ No errors in browser console
✓ POST /api/auth/agent-register returns 201
✓ Response contains:
  - token (JWT)
  - user.referral_code
  - user.tier = 'bronze'
  - user.agent_type = 'direct'
```

**Database Check:**
```sql
SELECT id, email, referral_code, tier, agent_type 
FROM agents 
WHERE email = 'test-agent@example.com';
-- Should show new agent with referral code and tier
```

### Test Case 2: Create First Offer
**After registration:**

**Steps:**
```
1. Step 2: "Create Your First Offer"
2. Fill in:
   - Offer Name: Maasai Mara Adventure
   - Base Rate: USD 499 (read-only)
   - Your Selling Price: 699
3. Your Margin should auto-calculate to USD 200
4. Click "Publish Your Offer"
5. Expected: Step 3 with referral code display
```

**Verification:**
```
✓ Margin calculation correct (699 - 499 = 200)
✓ POST /api/agent-offers returns 201
✓ Response contains offer.id
✓ Referral code displays correctly
✓ Copy button works
```

**Database Check:**
```sql
SELECT id, agent_id, title, base_price, agent_selling_price, agent_margin, status
FROM agent_offers
WHERE title = 'Maasai Mara Adventure';
-- Should show published offer with correct margin
```

### Test Case 3: Referral Code Display
**After offer creation:**

**Steps:**
```
1. See referral code (e.g., AGENT_JOHN_SMITH_abc123)
2. Click "Copy Link" button
3. Paste in notepad - should have full code
4. See earnings preview:
   - "5 bookings = USD 1,375"
   - "2 sub-agents = USD 412.50"
5. Click "Share on WhatsApp"
6. Share text should include code
```

**Verification:**
```
✓ Referral code copies to clipboard
✓ Earnings preview math correct
  - 5 bookings × USD 275 margin = USD 1,375
  - 2 sub-agents earning on 50 bookings = USD 412.50
```

---

## **PART 3: AGENT DASHBOARD**

### Test Case 4: Dashboard Loads
**URL:** https://lilita-agent-platform.vercel.app/dashboard

**Steps:**
```
1. Dashboard should load
2. See stats cards:
   - This Month: USD X
   - Total Earned: USD Y
   - Pending Payout: USD Z
   - Your Bookings: N
3. See tier badge (Bronze)
4. See leaderboard rank (#47)
5. See tier progress bar
```

**Verification:**
```
✓ GET /api/agent-metrics/:agent_id returns 200
✓ Stats display correctly
✓ Tier progress bar shows progress
✓ No console errors
```

### Test Case 5: Earnings Tab
**Dashboard → Earnings tab:**

**Expected Data:**
```
Direct Bookings:
  12 bookings × USD 275 = USD 3,300

Sub-Agent Commission:
  2 agents × 3% = USD 412.50

Performance Bonuses:
  USD 135.00
```

**Verification:**
```
✓ All earning sources display
✓ Math is correct
✓ Currency formatted as USD
✓ Buttons work (View Report, Request Payout)
```

### Test Case 6: Referrals Tab
**Dashboard → Referrals tab:**

**Expected Data:**
```
Sub-Agent 1: Ahmed Hassan
  - Bookings: 5
  - Their Earnings: USD 1,375
  - Your Commission: USD 41.25 (3%)

Sub-Agent 2: Sophia Kowalski
  - Bookings: 3
  - Their Earnings: USD 825
  - Your Commission: USD 24.75 (3%)

Invite Section:
  - Referral code display (copiable)
  - Share buttons
  - Sign-up bonus info
```

**Verification:**
```
✓ GET /api/agent-referrals returns 200
✓ Sub-agents list correctly
✓ Commission calculations correct (3%)
✓ Copy code button works
✓ Referral code matches response
```

**Database Check:**
```sql
SELECT * FROM agent_referrals 
WHERE referrer_agent_id = (agent_id);
-- Should show active sub-agents with 3% commission rate
```

### Test Case 7: Leaderboard Tab
**Dashboard → Leaderboard tab:**

**Expected Data:**
```
🥇 #1: John Smith (Safari Elite) - 45 bookings - USD 12,375
🥈 #2: Maria Lopez (African Adventures) - 42 bookings - USD 11,550
🥉 #3: Ahmed Hassan (Desert Explorer) - 38 bookings - USD 10,450
#4: You (Your Company) - 12 bookings - USD 3,300

Prize Pool:
  🥇 #1 = USD 5,000
  🥈 #2 = USD 3,000
  🥉 #3 = USD 1,500
```

**Verification:**
```
✓ GET /api/leaderboard returns 200
✓ Sorted by rank correctly
✓ Prize amounts show for top 3
✓ Your agent appears in list
```

### Test Case 8: Missions Tab
**Dashboard → Missions tab:**

**Expected Data:**
```
✓ Create Offer - COMPLETED - +USD 50
⏳ Share on Social - 1/3 - +USD 25 per share
⏳ Get First Booking - +USD 100
⏳ Invite 5 Agents - +USD 300

Pro Tip:
Complete all missions to earn USD 475 bonus
```

**Verification:**
```
✓ Mission cards render correctly
✓ Completed missions show checkmark
✓ In-progress missions show progress bar
✓ Reward amounts display
```

---

## **PART 4: BOOKING FLOW (Backend Integration)**

### Test Case 9: Booking → Payout Creation

**Note:** Requires booking endpoint on frontend

**Steps:**
```
1. Guest books through agent's offer
2. Booking status → CONFIRMED
3. Backend should:
   ✓ Create payout for agent (direct_booking)
   ✓ Create payout for parent agent (sub_agent_commission, 3%)
   ✓ Update agent.total_bookings
   ✓ Update agent.total_earnings
```

**Database Check:**
```sql
-- Check payout created for agent
SELECT * FROM agent_payouts 
WHERE agent_id = 'agent_uuid' AND payout_type = 'direct_booking'
ORDER BY created_at DESC LIMIT 1;

-- Check sub-agent commission created
SELECT * FROM agent_payouts 
WHERE agent_id = 'parent_agent_uuid' AND payout_type = 'sub_agent_commission'
ORDER BY created_at DESC LIMIT 1;

-- Check agent totals updated
SELECT total_bookings, total_earnings FROM agents WHERE id = 'agent_uuid';
```

---

## **PART 5: ERROR HANDLING**

### Test Case 10: Invalid Registration
```
1. Try to register with existing email
   Expected: 409 error "Email already registered"
   
2. Try to register with weak password
   Expected: 400 error "Password too weak"
   
3. Leave required fields empty
   Expected: Form validation message
```

### Test Case 11: Authentication
```
1. Logout (clear token)
2. Try to access dashboard
   Expected: Redirect to login
   
3. Try to create offer without token
   Expected: 401 "Access token required"
   
4. Use expired token
   Expected: 403 "Invalid token"
```

### Test Case 12: Not Found
```
1. GET /api/agent-metrics/invalid-id
   Expected: 404 "Agent not found"
   
2. GET /api/agent-referrals (with no referrals)
   Expected: Empty array []
```

---

## **PART 6: PERFORMANCE TESTING**

### Test Case 13: Load Times
```
1. Dashboard should load in < 2 seconds
2. API responses should be < 500ms
3. No 504 Gateway Timeout errors
```

**Check via:**
- Browser DevTools → Network tab
- Vercel Analytics dashboard
- Railway logs

### Test Case 14: Concurrent Requests
```
1. Open 5 browser tabs
2. Load dashboard in each
3. All should succeed (no 429 rate limit)
4. No connection errors
```

---

## **PART 7: SECURITY TESTING**

### Test Case 15: XSS Prevention
```
1. Try to enter HTML in offer name
   <script>alert('xss')</script>
2. Should be escaped and displayed as text
3. No alerts should fire
```

### Test Case 16: CSRF Protection
```
1. Check all state-changing requests use POST/PUT
2. All requests include CSRF token in header (if implemented)
```

---

## **TEST RESULTS TEMPLATE**

```markdown
# Integration Test Results - [Date]

## Environment
- Frontend: https://lilita-agent-platform.vercel.app
- Backend: https://[your-railway-url]
- Database: [Railway PostgreSQL]
- Git Branch: contacts-app

## Test Cases Status

| Test | Status | Notes | Time |
|------|--------|-------|------|
| 1. Agent Registration | ✅/❌ | | |
| 2. Create Offer | ✅/❌ | | |
| 3. Referral Code | ✅/❌ | | |
| 4. Dashboard Loads | ✅/❌ | | |
| 5. Earnings Tab | ✅/❌ | | |
| 6. Referrals Tab | ✅/❌ | | |
| 7. Leaderboard Tab | ✅/❌ | | |
| 8. Missions Tab | ✅/❌ | | |
| 9. Booking → Payout | ✅/❌ | | |
| 10. Error Handling | ✅/❌ | | |
| 11. Auth | ✅/❌ | | |
| 12. Not Found | ✅/❌ | | |
| 13. Load Times | ✅/❌ | | |
| 14. Concurrency | ✅/❌ | | |
| 15. XSS Prevention | ✅/❌ | | |
| 16. CSRF Protection | ✅/❌ | | |

## Issues Found
1. [Issue description]
2. [Issue description]

## Ready for Launch
- [ ] All tests passing
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Security verified
```

---

## **NEXT STEPS**

After all tests pass:
1. ✅ Load agent-platform-schema.sql to Railway
2. ✅ Create sample booking data
3. ✅ Run end-to-end booking test
4. ✅ Final security audit
5. ✅ Launch checklist
6. 🚀 Friday 9:00 AM - Go Live

