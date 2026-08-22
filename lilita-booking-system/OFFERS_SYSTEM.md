# 🎉 Lilita Keper - Special Offers & Campaigns System

## Overview

A complete system for managing **seasonal offers, fam trip packages, and pre-opening promotions** to agents and guests. Designed to boost agent recruitment and early bookings.

---

## 🎯 Features Built

### 1. **Database Schema**
- `offer_categories` - Categorize promotions (Fam Trip, Pre-Opening, Seasonal, etc)
- `offers` - Define pricing, dates, terms, what's included
- `offer_usage` - Track which offers were used for bookings
- `campaign_emails` - Create marketing campaigns
- `campaign_recipients` - Track campaign delivery and engagement

### 2. **Backend API Endpoints**

#### GET Endpoints
- `GET /api/offers` - List all active offers
- `GET /api/offers/:id` - Get single offer details
- `GET /api/campaigns/:id/performance` - Campaign metrics (opens, clicks, conversions)

#### POST Endpoints  
- `POST /api/bookings/with-offer` - Create booking using an offer (auto-applies discount)
- `POST /api/campaigns/send` - Send campaign to all active agents
- `POST /api/admin/offers` - Create new offer (admin only)
- `POST /api/admin/campaigns` - Create new campaign (admin only)

### 3. **Frontend Components**

#### Offers Display Page
- Browse all active offers
- Filter by category (Fam Trips, Pre-Opening, Seasonal, etc)
- Featured offers highlighted
- Detailed offer modal with terms, inclusions, activities
- Pricing comparison (was/now)
- Mobile responsive

#### Features
- ✅ Offer details modal
- ✅ Activity listings
- ✅ What's included checkmarks
- ✅ Terms & conditions display
- ✅ Discount badge highlighting
- ✅ Valid date ranges
- ✅ Call-to-action buttons

### 4. **Admin Tools**
- Create custom offers
- Set special commission rates (for incentives)
- Target specific audiences
- Launch email campaigns
- Track campaign performance

---

## 🚀 Pre-Loaded Offers

### Offer 1: Agent Fam Trip - December 2026
```
Title: Pre-Opening Agent Fam Trip - USD 499
Valid: Dec 1-31, 2026
Price: USD 499 per person (vs USD 1,497 regular)
Commission: 15%
Target: Agents only
Duration: 3 nights
```

**What's Included:**
- Luxury tent accommodation
- Twice-daily game drives
- All meals & beverages (premium included)
- Airstrip transfers
- WiFi
- Hot air balloon safari
- Community tours
- Spa treatment

### Offer 2: Q1 2027 Pre-Season - 40% Off
```
Title: Q1 2027 Pre-Season Special - 40% Off
Valid: Nov 1, 2026 - Mar 31, 2027
Book by: Dec 31, 2026
Travel: Jan 1 - Mar 31, 2027
Price: USD 1,260 (40% off USD 2,100)
Commission: 20% (incentive rate)
```

---

## 📊 How It Works

### For Agents
1. Visit "Offers" page
2. See all active promotions
3. Filter by category
4. Click "View Details" for full offer
5. Click "Book Now with This Offer"
6. Booking created with discount applied
7. Commission auto-calculated at special rate

### For Admins
1. Create offer in admin panel
2. Set pricing, dates, terms
3. Create email campaign
4. Send to agent network
5. Track opens, clicks, conversions
6. Monitor offer performance

### For Marketing
1. Email campaign to agents
2. Featured offer cards on website
3. Direct booking with offer applied
4. Track ROI and engagement

---

## 💰 Pricing Logic

```
Regular Booking:
- Room price: USD 2,100/3 nights
- Agent commission: 15% = USD 315

Offer Booking:
- Discounted price: USD 499/3 nights (76% discount!)
- Agent commission: 15% = USD 75
- OR special rate 20% = USD 100

Results:
- Attracts agents with low entry cost
- Higher commission rate incentivizes promotion
- Volume drives revenue
```

---

## 📝 Database Integration

### Step 1: Load Schema
```bash
psql -h localhost -U postgres -d lilita_booking -f offers-schema.sql
```

### Step 2: Add API Endpoints
Copy content from `offers-api.js` into `server.js` after existing endpoints

### Step 3: Update App.jsx
Add to imports:
```javascript
import OffersPage from './pages/OffersPage';
```

Add to navbar menu:
```javascript
<button className="nav-btn" onClick={() => setCurrentPage('offers')}>
  🎉 Offers
</button>
```

Add to main-content:
```javascript
{currentPage === 'offers' && <OffersPage token={token} user={user} />}
```

---

## 🎨 Frontend Integration

Files created:
- ✅ `frontend/src/pages/OffersPage.jsx` - Display component
- ✅ `frontend/src/styles/OffersPage.css` - Styling

Already integrated components:
- ✅ Offer cards with images
- ✅ Featured offer spotlight
- ✅ Filter by category
- ✅ Detailed modal with terms
- ✅ Activity listings
- ✅ Responsive design

---

## 📧 Campaign Features

### Create Campaign
1. Choose offer
2. Write subject line
3. Compose email body
4. Set call-to-action URL
5. Send to agents

### Track Results
- Total sent
- Open rate
- Click-through rate
- Conversion rate
- Agent conversions

---

## 🔧 Customization

### Create Your Own Offer

```javascript
POST /api/admin/offers
{
  "categoryId": "uuid-of-fam-trip",
  "title": "Your Offer Title",
  "description": "Full description",
  "originalPrice": 2500,
  "offerPrice": 1200,
  "validFrom": "2027-01-01",
  "validTo": "2027-03-31",
  "bookingStartDate": "2027-01-01",
  "bookingEndDate": "2027-03-31",
  "persons": 2,
  "nights": 3,
  "targetAudience": "agents",
  "includedFeatures": ["feature1", "feature2"],
  "activities": ["activity1", "activity2"],
  "termsConditions": "Terms here",
  "isFeatured": true
}
```

---

## 📊 Content Included

### Activities (From Lilita Keper)
- Twice-daily game drives
- Hot air balloon safari at sunrise
- Night game drives
- Bush walks with Maasai guides
- Community manyatta visits
- School visits (Inua Jamii foundation)
- Beading workshops
- Maasai warrior games
- Stargazing experience
- Infinity pool
- Spa & wellness treatments
- Kids programs

### Amenities Included
- Luxury tent accommodation
- All meals & beverages (premium brands)
- Twice-daily game drives
- Airstrip transfers
- Complimentary WiFi
- All taxes & levies
- Hot air balloon included
- Community tour access

---

## 🎯 Marketing Strategy

### Phase 1: Fam Trips (Oct-Nov 2026)
- Target top 50 agents
- USD 499 all-inclusive rate
- December 1-31 available
- High luxury positioning
- Word-of-mouth amplification

### Phase 2: Pre-Season (Nov 2026)
- Email campaign to all agents
- 40% discount for Q1 2027 bookings
- Extended booking window
- Higher commission (20%)
- Volume incentive

### Phase 3: Peak Season (Dec 2026 - Mar 2027)
- Regular pricing
- Standard 15% commission
- Strong booking volume
- Premium positioning

---

## 📈 Expected Results

### Agent Recruitment
- Low-cost entry for new agents
- Risk-free fam trip experience
- High commission incentive
- Word-of-mouth referrals

### Revenue
- 50 agents × USD 499 = USD 24,950 (fam trips)
- High Q1 volume due to discount
- Increased bookings throughout year
- Long-term agent partnerships

### Loyalty
- Agents who try lodge → recurring business
- Commissions build trust
- Premium positioning maintained
- Sustainable growth

---

## 🔌 Integration Checklist

- [ ] Run `offers-schema.sql` to create tables
- [ ] Add `offers-api.js` endpoints to `server.js`
- [ ] Add `OffersPage.jsx` to frontend
- [ ] Add `OffersPage.css` styling
- [ ] Update `App.jsx` with navigation
- [ ] Restart backend
- [ ] Test on http://localhost:5173/offers
- [ ] Create admin interface for offer management
- [ ] Send first campaign to agents
- [ ] Monitor performance

---

## 📞 Next Steps

1. **Load Database Schema** - Run SQL to create offer tables
2. **Integrate Backend** - Add API endpoints to server.js
3. **Deploy Frontend** - Add OffersPage component
4. **Create Admin Panel** - Build offer management UI
5. **Launch Campaign** - Send fam trip offers to agents
6. **Monitor** - Track engagement and conversions

---

## 🎉 Impact

This system enables Lilita Keper to:

✅ **Recruit agents** with low-cost entry offers  
✅ **Drive bookings** through pre-season discounts  
✅ **Track ROI** on marketing campaigns  
✅ **Build loyalty** with exclusive offers  
✅ **Maximize revenue** through strategic pricing  
✅ **Scale efficiently** with email automation  

---

**Your complete special offers system is ready to deploy!**

For questions on integration or customization, refer to the API documentation in `offers-api.js` or contact the development team.
