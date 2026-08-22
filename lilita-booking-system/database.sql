-- LILITA KEPER BOOKING SYSTEM DATABASE SCHEMA
-- PostgreSQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Suites (5 luxury accommodations)
CREATE TABLE suites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  amenities TEXT[], -- Array of amenities
  photos TEXT[], -- Array of photo URLs
  max_guests INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suite Pricing (seasonal rates)
CREATE TABLE suite_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id UUID NOT NULL REFERENCES suites(id),
  season VARCHAR(50), -- "peak", "shoulder", "off-season"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_multiplier DECIMAL(3, 2), -- 1.0 = base price, 1.5 = 150% of base
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability Calendar (day-by-day inventory)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id UUID NOT NULL REFERENCES suites(id),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_HOLD, CONFIRMED, PROVISIONAL, BLOCKED, RELEASED
  price DECIMAL(10, 2) NOT NULL,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(suite_id, date)
);

-- Agents (Travel professionals)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  company VARCHAR(100),
  phone VARCHAR(20),
  country VARCHAR(50),
  commission_rate DECIMAL(3, 2) DEFAULT 0.15, -- 15% default
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  api_key VARCHAR(100) UNIQUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guests (Direct bookers)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  country VARCHAR(50),
  notes TEXT,
  is_returning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BOOKINGS & HOLDS
-- ============================================================================

-- Bookings (main booking record)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) NOT NULL UNIQUE, -- LILITA-20260822-001
  suite_id UUID NOT NULL REFERENCES suites(id),
  guest_id UUID REFERENCES guests(id),
  agent_id UUID REFERENCES agents(id),

  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_nights INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  num_guests INT NOT NULL,

  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ON_HOLD, CONFIRMED, CANCELLED, COMPLETED
  hold_expires_at TIMESTAMP,
  booking_channel VARCHAR(20), -- DIRECT, AGENT, LUXURY_CURATOR, PHOTOGRAPHER

  base_total DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  taxes_fees DECIMAL(10, 2) DEFAULT 0,
  final_total DECIMAL(12, 2) NOT NULL,

  special_requests TEXT,
  internal_notes TEXT,

  created_by UUID, -- Agent/Admin who created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- Payments (incoming money)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(20), -- CARD, MPESA, BANK_TRANSFER
  payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED

  transaction_id VARCHAR(100), -- Stripe/Pesapal ref
  receipt_number VARCHAR(50),

  processor VARCHAR(50), -- stripe, pesapal, manual
  processor_fee DECIMAL(10, 2),
  net_amount DECIMAL(12, 2),

  payment_date TIMESTAMP,
  paid_at TIMESTAMP,

  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMMISSIONS
-- ============================================================================

-- Commissions (tracking agent earnings)
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  agent_id UUID NOT NULL REFERENCES agents(id),

  booking_amount DECIMAL(12, 2) NOT NULL,
  commission_rate DECIMAL(3, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,

  status VARCHAR(20) DEFAULT 'EARNED', -- EARNED, PENDING_PAYMENT, PAID, CANCELLED
  payment_id UUID REFERENCES payments(id),

  paid_at TIMESTAMP,
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONTACTS (Integration with existing 40.6K database)
-- ============================================================================

-- Contact sync
CREATE TABLE contact_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  company VARCHAR(100),
  contact_type VARCHAR(50), -- travel_agent, luxury_curator, photographer, corporate

  agent_id UUID REFERENCES agents(id), -- Link to agents table if verified

  imported_at TIMESTAMP,
  last_contacted_at TIMESTAMP,
  conversion_status VARCHAR(20), -- PROSPECT, CONTACTED, INTERESTED, BOOKED, INACTIVE

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT & ACTIVITY LOG
-- ============================================================================

-- Activity log (who did what and when)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Agent or Admin
  action VARCHAR(50), -- BOOKING_CREATED, PAYMENT_RECEIVED, HOLD_EXPIRED, etc
  entity_type VARCHAR(50), -- booking, payment, guest, agent
  entity_id UUID,

  old_values JSONB, -- Previous state
  new_values JSONB, -- New state

  ip_address VARCHAR(50),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications (SMS/Email tracking)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  recipient_email VARCHAR(100),
  recipient_phone VARCHAR(20),

  type VARCHAR(50), -- BOOKING_CONFIRMATION, PAYMENT_RECEIVED, HOLD_EXPIRING, etc
  channel VARCHAR(20), -- EMAIL, SMS

  content TEXT,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED, DELIVERED

  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,

  provider VARCHAR(50), -- sendgrid, twilio
  provider_id VARCHAR(100),

  retry_count INT DEFAULT 0,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_suites_active ON suites(is_active);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_availability_status ON availability(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_payments_date_range ON payments(created_at);
CREATE INDEX idx_commissions_unpaid ON commissions(status) WHERE status != 'PAID';

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Sample suites
INSERT INTO suites (name, description, capacity, base_price, max_guests, amenities)
VALUES
  (
    'Mara View Suite',
    'Luxury suite with panoramic Maasai Mara views',
    1,
    4500,
    2,
    ARRAY['King bed', 'Private bath', 'Lounge area', 'Telescope', 'WiFi']
  ),
  (
    'Acacia Suite',
    'Intimate acacia tree suite',
    1,
    4200,
    2,
    ARRAY['Queen bed', 'Outdoor shower', 'Deck', 'WiFi']
  ),
  (
    'Savanna Lodge',
    'Family suite with two bedrooms',
    1,
    5500,
    4,
    ARRAY['Master bed', 'Twin beds', 'Full kitchen', 'Living area', 'WiFi']
  ),
  (
    'Conservation Suite',
    'Eco-luxury with solar power',
    1,
    4000,
    2,
    ARRAY['Unique design', 'Eco-tech', 'Lounge', 'WiFi']
  ),
  (
    'Star Gazer Bungalow',
    'Open-air bungalow with retractable roof',
    1,
    4800,
    2,
    ARRAY['Retractable roof', 'Deck', 'Outdoor bath', 'WiFi']
  );

-- Sample pricing (seasonal)
INSERT INTO suite_pricing (suite_id, season, start_date, end_date, price_multiplier, notes)
SELECT id, 'peak', '2026-01-01'::DATE, '2026-02-28'::DATE, 1.4, 'High season'
FROM suites WHERE name = 'Mara View Suite'
UNION ALL
SELECT id, 'shoulder', '2026-06-01'::DATE, '2026-09-30'::DATE, 1.2, 'Great Migration'
FROM suites WHERE name = 'Mara View Suite'
UNION ALL
SELECT id, 'off-season', '2026-04-01'::DATE, '2026-05-31'::DATE, 0.8, 'Shoulder season'
FROM suites WHERE name = 'Mara View Suite';

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Occupancy summary
CREATE VIEW occupancy_summary AS
SELECT
  s.id,
  s.name,
  CAST(SUM(CASE WHEN a.status IN ('CONFIRMED', 'ON_HOLD') THEN 1 ELSE 0 END) as FLOAT) /
  CAST(COUNT(*) as FLOAT) * 100 as occupancy_rate,
  SUM(CASE WHEN a.status = 'CONFIRMED' THEN a.price ELSE 0 END) as revenue,
  COUNT(*) as total_days
FROM suites s
LEFT JOIN availability a ON s.id = a.suite_id
WHERE a.date >= CURRENT_DATE AND a.date < CURRENT_DATE + INTERVAL '90 days'
GROUP BY s.id, s.name;

-- Agent performance
CREATE VIEW agent_performance AS
SELECT
  a.id,
  a.first_name,
  a.last_name,
  a.company,
  COUNT(b.id) as total_bookings,
  COALESCE(SUM(b.final_total), 0) as total_revenue,
  COALESCE(SUM(c.commission_amount), 0) as total_commissions,
  MAX(b.created_at) as last_booking_date
FROM agents a
LEFT JOIN bookings b ON a.id = b.agent_id AND b.status = 'CONFIRMED'
LEFT JOIN commissions c ON b.id = c.booking_id
WHERE a.is_active = TRUE
GROUP BY a.id, a.first_name, a.last_name, a.company
ORDER BY total_revenue DESC;

-- Revenue forecast
CREATE VIEW revenue_forecast AS
SELECT
  DATE_TRUNC('month', a.date)::DATE as month,
  s.name as suite,
  COUNT(*) as available_nights,
  SUM(CASE WHEN a.status = 'CONFIRMED' THEN a.price ELSE 0 END) as confirmed_revenue,
  SUM(CASE WHEN a.status = 'ON_HOLD' THEN a.price ELSE 0 END) as held_revenue
FROM availability a
JOIN suites s ON a.suite_id = s.id
WHERE a.date >= CURRENT_DATE
GROUP BY DATE_TRUNC('month', a.date), s.name
ORDER BY month, s.name;
