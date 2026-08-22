-- ============================================================================
-- OFFERS & PROMOTIONS SYSTEM
-- ============================================================================

-- Offer Categories
CREATE TABLE offer_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO offer_categories (name, description, icon) VALUES
  ('Fam Trip', 'Family/Agent familiarization trips', '✈️'),
  ('Pre-Opening', 'Pre-opening special rates', '🎉'),
  ('Seasonal', 'Seasonal promotions', '🌞'),
  ('Loyalty', 'Loyalty rewards for repeat agents', '⭐'),
  ('Group', 'Group booking discounts', '👥');

-- Offers/Promotions
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES offer_categories(id),

  title VARCHAR(150) NOT NULL,
  description TEXT,
  short_description VARCHAR(255),

  -- Pricing
  original_price DECIMAL(10, 2) NOT NULL,
  offer_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    ROUND(((original_price - offer_price) / original_price * 100), 2)
  ) STORED,

  -- Dates
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  booking_start_date DATE,
  booking_end_date DATE,

  -- Details
  persons SMALLINT DEFAULT 1,
  nights SMALLINT DEFAULT 3,
  included_features TEXT[], -- Array of what's included
  terms_conditions TEXT,

  -- Targeting
  target_audience VARCHAR(50), -- 'agents', 'direct', 'all'
  agent_commission_rate DECIMAL(3, 2) DEFAULT 0.15,

  -- Visibility
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  position_order SMALLINT DEFAULT 0,

  -- Content
  hero_image VARCHAR(500),
  gallery_images TEXT[],
  activities TEXT[],

  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offer Usage Tracking
CREATE TABLE offer_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id),
  booking_id UUID REFERENCES bookings(id),
  agent_id UUID REFERENCES agents(id),

  price_charged DECIMAL(10, 2),
  discount_applied DECIMAL(10, 2),

  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Emails
CREATE TABLE campaign_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id),

  title VARCHAR(150) NOT NULL,
  subject_line VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  call_to_action VARCHAR(100),
  call_to_action_url VARCHAR(500),

  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,

  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,

  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Recipients
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaign_emails(id),
  agent_id UUID NOT NULL REFERENCES agents(id),

  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, OPENED, CLICKED, CONVERTED

  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Offers
INSERT INTO offers (
  category_id, title, description, short_description,
  original_price, offer_price,
  valid_from, valid_to, booking_start_date, booking_end_date,
  persons, nights, target_audience, is_featured,
  included_features, terms_conditions,
  activities
)
SELECT
  id,
  'Pre-Opening Agent Fam Trip - USD 499',
  'Join us for an exclusive pre-opening familiarization trip to Lilita Keper. Experience the raw beauty of the Maasai Mara with our expert guides, luxurious accommodations, and all-inclusive amenities designed to showcase why agents love our lodge. Special agent rate: USD 499 per person sharing.',
  'Exclusive pre-opening rate for travel agents',
  1497,  -- Original 3-night price
  499,   -- Special fam trip rate
  '2026-10-01'::DATE,
  '2026-12-31'::DATE,
  '2026-12-01'::DATE,
  '2026-12-31'::DATE,
  2,
  3,
  'agents',
  TRUE,
  ARRAY[
    'Accommodation in luxury tent',
    'Twice-daily game drives with expert guides',
    'All meals and beverages (incl. premium)',
    'Transfers to/from airstrip',
    'Complimentary WiFi',
    'All taxes and levies',
    'Hot air balloon safari',
    'Community tour access',
    'Spa treatment'
  ],
  'Valid Dec 1-31, 2026. Proof of agency required. Cannot combine with other offers. 72-hour cancellation policy.',
  ARRAY[
    'Twice-daily game drives',
    'Hot air balloon safari at sunrise',
    'Night game drives',
    'Bush walks with Maasai guides',
    'Community manyatta visit',
    'School visit (Inua Jamii)',
    'Beading workshop',
    'Maasai warrior games',
    'Stargazing experience',
    'Infinity pool',
    'Spa treatments'
  ]
FROM offer_categories WHERE name = 'Fam Trip'
LIMIT 1;

INSERT INTO offers (
  category_id, title, description, short_description,
  original_price, offer_price,
  valid_from, valid_to, booking_start_date, booking_end_date,
  persons, nights, target_audience, agent_commission_rate, is_featured,
  included_features, terms_conditions,
  activities
)
SELECT
  id,
  'Q1 2027 Pre-Season Special - 40% Off',
  'Beat the peak season rush with our Q1 2027 pre-season offer. Book now for January-March travel and enjoy 40% off standard rates. Perfect for agents looking to maximize commissions before the summer peak.',
  '40% off for Q1 bookings - Agent commission 20%',
  2100,  -- Original 3-night price
  1260,  -- 40% discount
  '2026-11-01'::DATE,
  '2027-03-31'::DATE,
  '2027-01-01'::DATE,
  '2027-03-31'::DATE,
  2,
  3,
  'agents',
  0.20,  -- 20% agent commission
  TRUE,
  ARRAY[
    'Accommodation in luxury tent',
    'Twice-daily game drives',
    'All meals and beverages',
    'Airstrip transfers',
    'WiFi access',
    'All taxes included',
    'Hot air balloon included'
  ],
  'Valid for bookings Jan 1 - Mar 31, 2027. Must book by Dec 31, 2026. 72-hour cancellation.',
  ARRAY[
    'Game drives',
    'Hot air balloon safari',
    'Bush walks',
    'Community tours',
    'Maasai experiences',
    'Wellness spa',
    'Kids programs'
  ]
FROM offer_categories WHERE name = 'Pre-Opening'
LIMIT 1;

-- Create view for active offers
CREATE VIEW active_offers AS
SELECT
  o.id,
  o.title,
  o.short_description,
  o.offer_price,
  o.discount_percentage,
  o.valid_from,
  o.valid_to,
  o.is_featured,
  oc.name as category,
  oc.icon
FROM offers o
LEFT JOIN offer_categories oc ON o.category_id = oc.id
WHERE o.is_active = TRUE
  AND CURRENT_DATE >= o.valid_from
  AND CURRENT_DATE <= o.valid_to
ORDER BY o.is_featured DESC, o.position_order ASC;

-- Create indexes for performance
CREATE INDEX idx_offers_active ON offers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_offers_dates ON offers(valid_from, valid_to);
CREATE INDEX idx_offers_target ON offers(target_audience);
CREATE INDEX idx_campaign_emails_offer ON campaign_emails(offer_id);
CREATE INDEX idx_offer_usage_offer ON offer_usage(offer_id);
CREATE INDEX idx_offer_usage_agent ON offer_usage(agent_id);
CREATE INDEX idx_offer_usage_booking ON offer_usage(booking_id);
