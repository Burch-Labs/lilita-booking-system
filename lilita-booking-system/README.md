# 🏨 LILITA KEPER BOOKING SYSTEM

Enterprise-grade booking platform with inventory management, payment processing, and agent portal.

## ✨ Features

- ✅ **Calendar Management** - Real-time availability across 5 suites
- ✅ **Booking Workflow** - Create, hold, confirm, cancel bookings
- ✅ **Inventory Control** - Hold management with auto-release after 48 hours
- ✅ **Multi-Payment** - Stripe, M-Pesa/Pesapal, Bank transfers
- ✅ **Agent Portal** - 200+ travel agents book directly, track commissions
- ✅ **Admin Dashboard** - Full control, reports, analytics
- ✅ **Commission Tracking** - Automatic calculation and payment tracking
- ✅ **Double-Booking Protection** - Impossible to oversell
- ✅ **Notifications** - SMS + Email confirmations for all parties

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb lilita_booking

# Run schema
psql lilita_booking < database.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your details
nano .env
```

Key variables to update:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Change to something secure
- `STRIPE_SECRET_KEY` - Get from Stripe dashboard
- `PESAPAL_CONSUMER_KEY` - Get from Pesapal
- `TWILIO_AUTH_TOKEN` - Get from Twilio
- `SENDGRID_API_KEY` - Get from SendGrid

### 5. Start Server

```bash
npm run dev
```

Server runs on `http://localhost:3002`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/agent-login` - Agent login
- `POST /api/auth/agent-register` - New agent signup
- `POST /api/auth/admin-login` - Admin login

### Availability
- `GET /api/suites` - All suites with availability
- `GET /api/suites/:id/calendar` - Single suite calendar (month view)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/confirm` - Confirm booking with payment
- `POST /api/bookings/:id/cancel` - Cancel booking

### Agent Portal
- `GET /api/agent/dashboard` - Agent stats
- `GET /api/agent/bookings` - Agent's bookings
- `GET /api/agent/commissions` - Commission history

### Admin
- `GET /api/admin/dashboard` - Admin overview

### Payments
- `POST /api/payments/stripe-intent` - Create Stripe payment
- `POST /api/payments/pesapal-callback` - Pesapal webhook

## 🗄️ Database Schema

### Core Tables
- `suites` - 5 luxury accommodations
- `suite_pricing` - Seasonal pricing rules
- `availability` - Day-by-day inventory
- `agents` - Travel professionals
- `guests` - Direct bookers

### Transactions
- `bookings` - Booking records
- `payments` - Payment transactions
- `commissions` - Agent earnings

### Utilities
- `contact_sync` - Integration with 40.6K contacts
- `activity_log` - Audit trail
- `notifications` - Email/SMS tracking

## 💳 Payment Integration

### Stripe (Card Payments)
1. Get API keys from [stripe.com](https://stripe.com)
2. Add to `.env`:
   ```
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. Implement webhook handler in `server.js`

### Pesapal (M-Pesa/Card)
1. Get credentials from [pesapal.com](https://pesapal.com)
2. Add to `.env`:
   ```
   PESAPAL_CONSUMER_KEY=...
   PESAPAL_CONSUMER_SECRET=...
   ```
3. Webhook handler ready in `server.js`

## 🔔 Notifications

### Email (SendGrid)
- Booking confirmations
- Payment receipts
- Commission statements
- Hold expiry warnings

### SMS (Twilio)
- Booking confirmations
- Payment alerts
- Hold expiry reminders

## 📊 Database Views

Pre-built queries for reporting:

- `occupancy_summary` - Suite occupancy rates and revenue
- `agent_performance` - Agent bookings and commissions
- `revenue_forecast` - 90-day revenue projection

Access via:
```sql
SELECT * FROM occupancy_summary;
SELECT * FROM agent_performance;
SELECT * FROM revenue_forecast;
```

## 🔐 Security

- JWT tokens for auth (30-day expiry)
- Password hashing with bcrypt
- API key generation for agents
- Audit log for all actions
- Transaction support (atomic operations)

## 📱 Frontend Integration

React frontend connects via:

```javascript
// Login
POST /api/auth/agent-login
Response: { token, user }

// Get availability
GET /api/suites?startDate=2026-09-01&endDate=2026-09-30
Response: [{ id, name, availability: [...] }]

// Create booking
POST /api/bookings
Body: { suiteId, checkInDate, checkOutDate, numGuests, ... }
Response: { booking, holdExpiresAt, totalAmount }

// Confirm with payment
POST /api/bookings/:id/confirm
Body: { paymentMethod, paymentId, amount }
Response: { status: 'CONFIRMED' }
```

## 🛠️ Development

### Database Migrations

New fields or tables:

1. Create migration SQL
2. Test locally: `psql lilita_booking < migration.sql`
3. Add to database.sql for new installations

### Adding New Endpoints

1. Add route to `server.js`
2. Add database query if needed
3. Return JSON response
4. Document in README

### Testing Payments

Use Stripe test cards:
- `4242 4242 4242 4242` - Visa (success)
- `4000 0000 0000 0002` - Visa (decline)

## 📈 Deployment

### Production Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Set NODE_ENV=production
- [ ] Configure PostgreSQL backups
- [ ] Set up SSL/HTTPS
- [ ] Configure payment webhook URLs
- [ ] Set up SMS/Email rate limits
- [ ] Configure database connection pooling
- [ ] Set up error logging (Sentry/LogRocket)
- [ ] Load test with 1000+ concurrent bookings
- [ ] Backup database daily

### Recommended Hosting

- **Backend**: Railway, Render, or Heroku ($50-100/month)
- **Database**: AWS RDS or DigitalOcean ($50-150/month)
- **Frontend**: Vercel ($0-20/month)

## 📞 Support

For issues or questions:
- Email: reservations@lilitakeper.com
- Phone: +254 712 345 678

## 📄 License

MIT License - see LICENSE file

---

**Built for Lilita Keper Lodge - Maasai Mara, Kenya**

*Enterprise booking system with 40.6K agent network integration*
