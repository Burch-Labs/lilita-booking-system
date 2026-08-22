-- ============================================================================
-- AGENT PLATFORM 2.0 - WHITE-LABEL COMMISSION NETWORK
-- ============================================================================

-- Enhanced Agents Table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS (
  agent_type VARCHAR(20) DEFAULT 'direct', -- 'direct', 'sub-agent', 'operator'
  parent_agent_id UUID REFERENCES agents(id),
  logo_url VARCHAR(500),
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  total_bookings INT DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  sub_agents_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  referral_code VARCHAR(50) UNIQUE,
  referrer_agent_id UUID REFERENCES agents(id),
  payout_terms VARCHAR(20) DEFAULT '30', -- '30', '60', '90'
  territory VARCHAR(100), -- Geographic territory for gold+ agents
  has_api_access BOOLEAN DEFAULT FALSE,
  equity_percentage DECIMAL(5,3) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Offers (White-label offers created by agents)
CREATE TABLE IF NOT EXISTS agent_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL, -- Lilita's base rate (e.g., 499.00)
  agent_selling_price DECIMAL(10,2) NOT NULL, -- Agent's retail price
  agent_margin DECIMAL(10,2) GENERATED ALWAYS AS (agent_selling_price - base_price) STORED,
  logo_url VARCHAR(500), -- Agent's logo/image
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  booking_count INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_status (status)
);

-- Agent Referrals (Track sub-agent recruitment)
CREATE TABLE IF NOT EXISTS agent_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_agent_id UUID NOT NULL REFERENCES agents(id),
  referred_agent_id UUID NOT NULL REFERENCES agents(id),
  referral_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'inactive'
  sign_up_bonus_paid BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(3,2) DEFAULT 0.03, -- 3% on sub-agent bookings
  total_commission_earned DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referrer (referrer_agent_id),
  INDEX idx_referred (referred_agent_id)
);

-- Agent Payouts (Track earnings and payments)
CREATE TABLE IF NOT EXISTS agent_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  booking_id UUID REFERENCES bookings(id),
  payout_type VARCHAR(30), -- 'direct_booking', 'sub_agent_commission', 'referral_bonus', 'performance_bonus'
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(200),
  status VARCHAR(20) DEFAULT 'earned', -- 'earned', 'pending', 'paid', 'held'
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  payout_date_due TIMESTAMP GENERATED ALWAYS AS (earned_at + INTERVAL '30 days') STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_status (status)
);

-- Agent Performance Metrics (Leaderboard data)
CREATE TABLE IF NOT EXISTS agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  month_year VARCHAR(7) NOT NULL, -- '2026-08'
  bookings_count INT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  earnings DECIMAL(12,2) DEFAULT 0,
  sub_agents_recruited INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  leaderboard_rank INT,
  bonus_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, month_year),
  INDEX idx_agent_month (agent_id, month_year),
  INDEX idx_rank (leaderboard_rank)
);

-- Agent Badges (Achievement system)
CREATE TABLE IF NOT EXISTS agent_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  badge_type VARCHAR(50) NOT NULL, -- 'verified', 'top_performer', 'growth_master', 'speed_demon', 'premium_partner'
  name VARCHAR(100),
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, badge_type),
  INDEX idx_agent (agent_id)
);

-- Challenges & Competitions
CREATE TABLE IF NOT EXISTS agent_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(30), -- 'weekly', 'monthly', 'seasonal'
  metric_type VARCHAR(30), -- 'bookings', 'referrals', 'testimonials', 'earnings'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  prize_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge Leaderboard
CREATE TABLE IF NOT EXISTS challenge_leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES agent_challenges(id),
  agent_id UUID NOT NULL REFERENCES agents(id),
  metric_value INT DEFAULT 0,
  rank INT,
  prize_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(challenge_id, agent_id)
);

-- Agent Community (Forum posts, discussions)
CREATE TABLE IF NOT EXISTS agent_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50), -- 'tips', 'success_story', 'question', 'marketing'
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_category (category)
);

-- Create indexes for performance
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_parent ON agents(parent_agent_id);
CREATE INDEX idx_agent_offers_agent ON agent_offers(agent_id);
CREATE INDEX idx_payouts_agent ON agent_payouts(agent_id);
CREATE INDEX idx_metrics_agent ON agent_metrics(agent_id);
CREATE INDEX idx_referrals_referrer ON agent_referrals(referrer_agent_id);
