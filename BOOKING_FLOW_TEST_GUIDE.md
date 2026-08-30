# Booking Flow Test Guide - Live Platform

**Date**: August 30, 2026  
**Platform**: Mara Meguarra Booking System  
**Environment**: Google Cloud Run (Production)  
**Service URL**: https://mara-meguarra-backend-881829848506.europe-west1.run.app  
**Status**: ✅ Live & Ready for Testing

---

## 🎯 Complete End-to-End Booking Flow

### Phase 1: Dashboard & Metrics (5 minutes)

**Access**: https://mara-meguarra-backend-881829848506.europe-west1.run.app/agent-dashboard.html

**What to Verify**:
1. ✅ Dashboard loads without errors
2. ✅ KPI Cards display:
   - Total Bookings: 12
   - Total Earnings: $2,847
   - Pending Payouts: $582
   - Commission Rate: 40%
3. ✅ Quick Actions Panel visible:
   - 💰 View Rates
   - 📄 New Proposal
   - 📸 Photo Gallery
   - 📱 Share Link
   - 🎨 My Branding
   - 🆘 24/7 Support

**Expected Result**: Dashboard renders cleanly with all metrics and quick action buttons responsive.

---

### Phase 2: Contact Management Section (10 minutes)

**Location**: On main dashboard - scroll down to "👥 Client & Partner Contacts"

#### Test A: View Pre-loaded Contacts

**What to Verify**:
1. ✅ Three sample contacts are visible:
   - Charles Matu (charles.matu@sankara.com)
   - Elewana Bookings (reservations@elewana.com)
   - Pauline Maloba (pauline.maloba@total.co.ke)

2. ✅ Smart website links generated:
   - Sankara: https://www.sankara.com
   - Elewana: https://www.elewana.com
   - Total Kenya: https://www.total.co.ke

3. ✅ Columns display in order:
   - Email | First Name | Last Name | Website | Phone | Company | Action

**Expected Result**: All sample contacts visible with clickable website links.

---

#### Test B: Add Single Contact

**Form Fields**:
```
Email: info@safari-example.com *required
First Name: John
Last Name: Safari
Phone: +254700123456
Company: Safari Experts Ltd
```

**What to Verify**:
1. ✅ All form fields accept input
2. ✅ Email validation works (accepts valid emails)
3. ✅ Website auto-extracted from domain:
   - Domain extracted: safari-example.com
   - Website generated: https://www.safari-example.com
   - Shows as clickable link in table

4. ✅ Contact appears in contacts table immediately
5. ✅ Form clears after submission

**Expected Result**: New contact added with auto-generated website link, appears in table below.

---

#### Test C: Test with Personal Email

**Test Input**:
```
Email: agent@gmail.com
First Name: Test
Last Name: Agent
```

**What to Verify**:
1. ✅ Contact is added
2. ✅ NO website link is generated (gmail is filtered)
3. ✅ Website column shows "—" (dash)

**Expected Result**: Contact added without website link (as expected for personal email).

---

#### Test D: Bulk Import - CSV/List

**Paste this into the bulk import box**:
```
eva@elewana.com, Eva, Njuguna, +254700000001, Elewana Collection
thomas@marameguarrasanctuary.com, Thomas, Kipchoge, +254724123456, Mara Sanctuary
grace@total.co.ke, Grace, Muthoni, +254700555888, Total Kenya
```

**What to Verify**:
1. ✅ Click "⚡ Bulk Import" button to expand text area
2. ✅ Paste CSV rows into text area
3. ✅ Click "⚡ Smart Extract & Import All" button
4. ✅ Success message shows: "Successfully imported 3 contacts..."
5. ✅ All three contacts appear in table with:
   - Parsed email, first name, last name, phone
   - Website links auto-generated for business domains
   - Company names populated

**Expected Result**: All contacts imported with smart website extraction applied.

---

#### Test E: Search & Filter

**What to Verify**:
1. ✅ Type in search box: "Elewana"
   - Only Elewana-related contacts show
   - Unrelated contacts filtered out

2. ✅ Type: "sankara.com"
   - Shows Charles Matu (charles.matu@sankara.com)
   - Domain matching works

3. ✅ Type: "+254"
   - Shows all contacts with Kenyan phone numbers

4. ✅ Clear search box
   - All contacts reappear

**Expected Result**: Real-time search filtering works across email, name, website, and company fields.

---

#### Test F: CSV Export

**What to Verify**:
1. ✅ Click "📥 Export CSV" button
2. ✅ File downloads to your computer
3. ✅ Open CSV in Excel/Sheets - verify columns:
   - Column A: Email
   - Column B: First Name
   - Column C: Last Name
   - Column D: Website
   - Column E: Phone
   - Column F: Company
4. ✅ All contacts from table are in CSV
5. ✅ Website links are properly formatted URLs

**Expected Result**: CSV file downloads with proper column ordering and all contacts.

---

### Phase 3: Create Booking from Contact (10 minutes)

**What to Verify**:
1. ✅ On any contact row, click "📄 Quote" button
2. ✅ System recognizes this as starting a booking for that contact
3. ✅ Contact details pre-fill:
   - Email: (auto-filled)
   - Guest Name: (auto-filled)
   - Company: (if available)

**Booking Form** (if separate modal/page opens):
```
Guest Name: [pre-filled from contact]
Email: [pre-filled from contact]
Phone: [pre-filled if available]
Check-in Date: [date picker]
Check-out Date: [date picker]
Room Type: [dropdown - Luxury Suite / Standard / etc]
Number of Guests: [1-10]
Special Requests: [optional text]
```

**Expected Result**: Booking starts with contact information pre-populated.

---

### Phase 4: Booking Details & Pricing (5 minutes)

**What to Verify**:
1. ✅ Select dates (e.g., Sep 5-8, 2026)
2. ✅ Select room type (e.g., Luxury Suite)
3. ✅ System calculates:
   - Number of nights
   - Nightly rate
   - Total amount
   - Commission amount (40% of booking)
4. ✅ Display shows:
   - Subtotal
   - Taxes (if applicable)
   - Total Amount
   - Agent Commission (40%)

**Expected Result**: Pricing calculated correctly with commission shown.

---

### Phase 5: Payment - M-PESA Integration (5 minutes)

**What to Verify**:
1. ✅ On booking confirmation page, see "Process Payment" button
2. ✅ Click "Process Payment"
3. ✅ Select payment method: M-PESA
4. ✅ Enter/confirm phone number: +254724167447 (or test number)
5. ✅ System sends STK Push to M-PESA Daraja API
6. ✅ Expected response includes:
   - CheckoutRequestID
   - ResponseCode (0 = success)
   - ResponseDescription: "Success. Request accepted for processing"

**M-PESA Backend Process**:
- Endpoint: `/api/mpesa/stkpush`
- Shortcode: 4348821
- Amount: [booking total]
- Phone: [validated]
- CallbackURL: [backend listening]

**Expected Result**: STK Push initiated successfully. (In production, agent would see M-PESA prompt on phone).

---

### Phase 6: Booking Confirmation (5 minutes)

**What to Verify**:
1. ✅ After payment confirmation, see:
   - Booking Reference: BK-2026-XXXX (auto-generated)
   - Guest Name
   - Email
   - Phone
   - Check-in/Check-out Dates
   - Room Type
   - Total Paid Amount
   - Payment Status: Confirmed
   - Transaction ID: (from M-PESA)

2. ✅ Email confirmation sent to guest
3. ✅ Booking appears in "📋 My Bookings" tab
4. ✅ Commission appears in "💰 Commissions" tab

**Expected Result**: Complete booking record created and displayed.

---

### Phase 7: Commission Tracking (5 minutes)

**Navigate to**: Commissions Tab

**What to Verify**:
1. ✅ Tab shows commission breakdown:
   - Booking Code: BK-2026-XXXX
   - Guest: John Safari
   - Booking Amount: $1,500.00
   - Commission (40%): $600.00
   - Status: Confirmed / Pending / Paid
   - Payout Date: (calculated based on policy)

2. ✅ Commission math correct:
   - 40% of booking amount
   - Status shows correctly

3. ✅ Historical commissions visible

**Expected Result**: Commission tracking shows accurate percentages and dates.

---

### Phase 8: Reports & Analytics (5 minutes)

**Navigate to**: Reports Tab

**What to Verify**:
1. ✅ Metrics displayed:
   - Conversion Rate: (Proposals → Confirmed)
   - Avg Booking Value: (total bookings / avg amount)
   - Monthly Earnings: (current month)
   - Agent Ranking: (among partners)

2. ✅ Download Report button works
3. ✅ Report includes:
   - Commission summary
   - Booking details
   - Payment status

**Expected Result**: Analytics accessible and downloadable.

---

### Phase 9: Mobile Responsiveness (5 minutes)

**Test on Mobile Device or Browser DevTools**:
- **Desktop (1920x1080)**: Table view
- **Tablet (768px)**: Table view with horizontal scroll
- **Mobile (375px)**: Card view

**What to Verify**:
1. ✅ On mobile, contacts display as cards (not table)
2. ✅ Each card shows:
   - Name (in bold)
   - Email (clickable - opens email compose)
   - Company badge
   - Phone (clickable - initiates call)
   - Website link
   - Action buttons

3. ✅ One-tap actions work:
   - ✉️ Tap email → opens email client
   - 📞 Tap phone → initiates call
   - 🔗 Tap website → opens in browser

**Expected Result**: Layout adapts beautifully to mobile with touch-optimized interactions.

---

### Phase 10: Settings & Profile (5 minutes)

**Navigate to**: Settings Tab

**What to Verify**:
1. ✅ Agent profile editable:
   - Agent Email: [editable]
   - Contact Phone: [editable]
   - Preferred Payout Method: M-PESA (selected)

2. ✅ Save Settings button works
3. ✅ Change Password button available
4. ✅ Commission rate displays (40%)

**Expected Result**: Settings persist and update correctly.

---

## 📊 Test Checklist

Print this and check off as you test:

```
PHASE 1: Dashboard
☐ Dashboard loads
☐ KPI cards display correctly
☐ Quick actions responsive

PHASE 2A: View Contacts
☐ Sample contacts visible
☐ Website links generated
☐ Columns in correct order

PHASE 2B: Add Single Contact
☐ Form accepts input
☐ Website auto-extracted
☐ Contact appears in table
☐ Form clears after submit

PHASE 2C: Personal Email Filter
☐ Contact added without website link
☐ Dashboard recognized personal email

PHASE 2D: Bulk Import
☐ Import box toggles
☐ CSV rows parsed correctly
☐ Multiple contacts imported
☐ Success message displayed

PHASE 2E: Search Filter
☐ Search by email works
☐ Search by name works
☐ Search by domain works
☐ Clear clears filter

PHASE 2F: CSV Export
☐ File downloads
☐ Correct column order
☐ All contacts included
☐ URLs properly formatted

PHASE 3: Create Booking
☐ Proposal button works
☐ Contact details pre-fill
☐ Booking form displays

PHASE 4: Pricing
☐ Dates selectable
☐ Room types available
☐ Price calculates
☐ Commission shown (40%)

PHASE 5: M-PESA Payment
☐ Payment button responsive
☐ Phone number validation
☐ STK Push initiated
☐ API response successful

PHASE 6: Confirmation
☐ Confirmation page displays
☐ Booking reference generated
☐ Payment status confirmed
☐ Booking in My Bookings tab

PHASE 7: Commission Tracking
☐ Commission tab shows data
☐ Math correct (40%)
☐ Status accurate

PHASE 8: Reports
☐ Metrics calculated
☐ Download works
☐ Report includes details

PHASE 9: Mobile
☐ Card layout displays
☐ One-tap actions work
☐ Touch-friendly buttons

PHASE 10: Settings
☐ Profile editable
☐ Save works
☐ Settings persist
```

---

## 🎯 Success Criteria

**Booking Flow is COMPLETE when:**
1. ✅ Contact created and website auto-linked
2. ✅ Booking created from contact
3. ✅ Payment initiated via M-PESA
4. ✅ Booking confirmed with reference
5. ✅ Commission calculated and tracked
6. ✅ Mobile experience is seamless

---

## 🐛 Troubleshooting

### Contact not showing website link?
- Verify email domain is business (not gmail.com, yahoo.com, etc.)
- Check email is in correct format: user@company.com
- Reload page and check localStorage cleared

### Payment not processing?
- Verify M-PESA credentials injected in Cloud Run environment
- Check network connectivity
- Verify phone number format: +254XXXXXXXXX

### Mobile layout not responsive?
- Clear browser cache
- Hard refresh page (Ctrl+Shift+R)
- Check viewport width (should be < 768px for mobile)

### CSV not exporting?
- Ensure popup blocker is disabled
- Check browser download permissions
- Try different browser if issue persists

---

## 📞 Live Platform Access

**URL**: https://mara-meguarra-backend-881829848506.europe-west1.run.app/agent-dashboard.html

**Test Duration**: 30-45 minutes for complete flow  
**Best Time**: During business hours (M-PESA APIs more responsive)  
**Environment**: Production-ready  
**Data**: Changes persist in localStorage (browser-based storage)

---

## ✅ Test Report Template

**Date**: ___________  
**Tester**: ___________  
**Environment**: Google Cloud Run  
**Platform Version**: Revision 00011-sf5

**Tests Completed**: _____ / 10 phases  
**Overall Status**: ☐ PASS ☐ FAIL ☐ PARTIAL  

**Issues Found**:
```
[List any bugs or issues]
```

**Comments**:
```
[Any observations or feedback]
```

**Recommended Next Steps**:
```
[What should be tested next or improved]
```

---

**Last Updated**: August 30, 2026  
**Status**: ✅ Ready for Live Testing
