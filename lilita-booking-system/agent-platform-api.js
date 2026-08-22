/**
 * AGENT PLATFORM 2.0 - API Routes
 * White-label commission network for agents
 */

export const setupAgentPlatformRoutes = (app, pool, jwt, JWT_SECRET, authenticateToken) => {

  // ============================================================================
  // AGENT OFFERS - Create & Manage
  // ============================================================================

  // Create agent offer
  app.post('/api/agent-offers', authenticateToken, async (req, res) => {
    const { title, description, base_price, agent_selling_price, valid_from, valid_to } = req.body;

    try {
      const agentId = req.user.id;

      // Calculate margin
      const agentMargin = agent_selling_price - base_price;

      const result = await pool.query(
        `INSERT INTO agent_offers (
          agent_id, title, description, base_price, agent_selling_price,
          agent_margin, valid_from, valid_to, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, title, base_price, agent_selling_price, agent_margin, status`,
        [agentId, title, description, base_price, agent_selling_price, agentMargin, valid_from, valid_to, 'published']
      );

      res.status(201).json({
        success: true,
        offer: result.rows[0],
        message: 'Offer published! Share your referral code to start earning.'
      });
    } catch (err) {
      console.error('Offer creation error:', err);
      res.status(500).json({ error: 'Failed to create offer' });
    }
  });

  // Get agent's offers
  app.get('/api/agent-offers', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, title, base_price, agent_selling_price, agent_margin, status,
                booking_count, total_revenue, created_at
         FROM agent_offers
         WHERE agent_id = $1
         ORDER BY created_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching offers:', err);
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  });

  // ============================================================================
  // AGENT METRICS & LEADERBOARD
  // ============================================================================

  // Get agent metrics (earnings, stats, tier)
  app.get('/api/agent-metrics/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    const currentMonth = new Date().toISOString().substring(0, 7); // '2026-08'

    try {
      // Get agent info + tier
      const agentInfo = await pool.query(
        `SELECT id, first_name, last_name, company, tier, total_bookings, total_earnings,
                sub_agents_count, rating, referral_code
         FROM agents WHERE id = $1`,
        [agent_id]
      );

      if (agentInfo.rows.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Get this month metrics
      const metricsResult = await pool.query(
        `SELECT bookings_count, revenue_generated, earnings, sub_agents_recruited,
                leaderboard_rank, bonus_earned
         FROM agent_metrics
         WHERE agent_id = $1 AND month_year = $2`,
        [agent_id, currentMonth]
      );

      // Get payout breakdown
      const payoutsResult = await pool.query(
        `SELECT payout_type, SUM(amount) as total
         FROM agent_payouts
         WHERE agent_id = $1 AND status = 'earned'
         GROUP BY payout_type`,
        [agent_id]
      );

      const payoutBreakdown = {};
      payoutsResult.rows.forEach(row => {
        payoutBreakdown[row.payout_type] = parseFloat(row.total || 0);
      });

      // Calculate tier progress
      const tierThresholds = {
        bronze: { bookings: 10, nextTier: 'silver' },
        silver: { bookings: 25, nextTier: 'gold' },
        gold: { bookings: 50, nextTier: 'platinum' },
        platinum: { bookings: 100, nextTier: null }
      };

      const currentTierThreshold = tierThresholds[agentInfo.rows[0].tier];
      const nextTierBookings = currentTierThreshold ? currentTierThreshold.bookings : 100;
      const progressPercent = Math.min(
        (agentInfo.rows[0].total_bookings / nextTierBookings) * 100,
        100
      );

      res.json({
        agent: agentInfo.rows[0],
        thisMonth: metricsResult.rows[0] || {
          bookings_count: 0,
          revenue_generated: 0,
          earnings: 0,
          sub_agents_recruited: 0,
          leaderboard_rank: null,
          bonus_earned: 0
        },
        payoutBreakdown,
        tierProgress: {
          current: agentInfo.rows[0].tier,
          bookingsDone: agentInfo.rows[0].total_bookings,
          bookingsNeeded: nextTierBookings,
          progressPercent
        }
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Get public leaderboard (monthly rankings)
  app.get('/api/leaderboard', async (req, res) => {
    const currentMonth = new Date().toISOString().substring(0, 7);

    try {
      const result = await pool.query(
        `SELECT m.leaderboard_rank, a.first_name, a.last_name, a.company, a.tier,
                m.bookings_count, m.earnings, m.revenue_generated
         FROM agent_metrics m
         JOIN agents a ON m.agent_id = a.id
         WHERE m.month_year = $1
         ORDER BY m.leaderboard_rank ASC
         LIMIT 100`,
        [currentMonth]
      );

      // Prize pool
      const prizes = {
        1: 5000,
        2: 3000,
        3: 1500
      };

      res.json({
        month: currentMonth,
        leaders: result.rows.map(row => ({
          ...row,
          prize: prizes[row.leaderboard_rank] || 0
        })),
        prizePool: {
          '1st': 5000,
          '2nd': 3000,
          '3rd': 1500
        }
      });
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // ============================================================================
  // AGENT REFERRALS & SUB-AGENTS
  // ============================================================================

  // Get agent's sub-agents
  app.get('/api/agent-referrals', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT ar.id, ar.referred_agent_id, a.first_name, a.last_name, a.company,
                COUNT(b.id) as bookings,
                SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.final_total ELSE 0 END) as earnings,
                ar.total_commission_earned as commission_owed
         FROM agent_referrals ar
         JOIN agents a ON ar.referred_agent_id = a.id
         LEFT JOIN bookings b ON a.id = b.agent_id
         WHERE ar.referrer_agent_id = $1 AND ar.status = 'active'
         GROUP BY ar.id, ar.referred_agent_id, a.first_name, a.last_name, a.company,
                  ar.total_commission_earned
         ORDER BY ar.created_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  // Track new referral (when sub-agent signs up with referral code)
  app.post('/api/agent-referrals', authenticateToken, async (req, res) => {
    const { referred_agent_id, referral_code } = req.body;

    try {
      // Verify referral code matches
      const referrerResult = await pool.query(
        'SELECT id FROM agents WHERE referral_code = $1',
        [referral_code]
      );

      if (referrerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }

      const referrerId = referrerResult.rows[0].id;

      // Create referral record
      const result = await pool.query(
        `INSERT INTO agent_referrals (
          referrer_agent_id, referred_agent_id, referral_code, status, commission_rate
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, referral_code, commission_rate`,
        [referrerId, referred_agent_id, referral_code, 'active', 0.03]
      );

      // Add sign-up bonus to referrer
      await pool.query(
        `INSERT INTO agent_payouts (agent_id, payout_type, amount, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [referrerId, 'referral_bonus', 50, `Referral bonus for ${referral_code}`, 'earned']
      );

      res.status(201).json({
        success: true,
        referral: result.rows[0],
        message: 'Sub-agent added! You earn USD 50 + 3% on their bookings.'
      });
    } catch (err) {
      console.error('Error creating referral:', err);
      res.status(500).json({ error: 'Failed to create referral' });
    }
  });

  // ============================================================================
  // PAYOUTS & EARNINGS
  // ============================================================================

  // Get payout history
  app.get('/api/agent-payouts', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, payout_type, amount, description, status, earned_at, paid_at,
                payout_date_due
         FROM agent_payouts
         WHERE agent_id = $1
         ORDER BY earned_at DESC
         LIMIT 100`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching payouts:', err);
      res.status(500).json({ error: 'Failed to fetch payouts' });
    }
  });

  // Request payout
  app.post('/api/agent-payouts/request', authenticateToken, async (req, res) => {
    const { amount } = req.body;
    const agentId = req.user.id;

    try {
      // Check available balance
      const balanceResult = await pool.query(
        `SELECT SUM(amount) as available
         FROM agent_payouts
         WHERE agent_id = $1 AND status = 'earned'`,
        [agentId]
      );

      const availableBalance = parseFloat(balanceResult.rows[0].available || 0);

      if (amount > availableBalance) {
        return res.status(400).json({
          error: 'Insufficient balance',
          available: availableBalance
        });
      }

      // Create payout request
      const result = await pool.query(
        `UPDATE agent_payouts
         SET status = 'pending', updated_at = NOW()
         WHERE agent_id = $1 AND status = 'earned'
         AND amount <= $2
         LIMIT 1
         RETURNING id, amount, status`,
        [agentId, amount]
      );

      res.json({
        success: true,
        payout: result.rows[0],
        message: 'Payout requested. You will receive funds within 30 days.'
      });
    } catch (err) {
      console.error('Error requesting payout:', err);
      res.status(500).json({ error: 'Failed to process payout request' });
    }
  });

  // ============================================================================
  // CHALLENGES & MISSIONS
  // ============================================================================

  // Get active challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, challenge_type, metric_type, start_date, end_date,
                prize_amount, status
         FROM agent_challenges
         WHERE status = 'active'
         ORDER BY end_date ASC`
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  });

  // Get agent's challenge progress
  app.get('/api/challenges/:challenge_id/progress', authenticateToken, async (req, res) => {
    const { challenge_id } = req.params;

    try {
      const result = await pool.query(
        `SELECT cl.rank, cl.metric_value, ac.prize_amount, ac.name
         FROM challenge_leaderboard cl
         JOIN agent_challenges ac ON cl.challenge_id = ac.id
         WHERE cl.challenge_id = $1 AND cl.agent_id = $2`,
        [challenge_id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Challenge not found or agent not participating' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching challenge progress:', err);
      res.status(500).json({ error: 'Failed to fetch challenge progress' });
    }
  });

  // Join challenge
  app.post('/api/challenges/:challenge_id/join', authenticateToken, async (req, res) => {
    const { challenge_id } = req.params;

    try {
      await pool.query(
        `INSERT INTO challenge_leaderboard (challenge_id, agent_id, metric_value, rank)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [challenge_id, req.user.id, 0, null]
      );

      res.json({
        success: true,
        message: 'You joined the challenge! Check your progress daily.'
      });
    } catch (err) {
      console.error('Error joining challenge:', err);
      res.status(500).json({ error: 'Failed to join challenge' });
    }
  });

  // ============================================================================
  // AGENT PROFILE & BADGES
  // ============================================================================

  // Get agent badges
  app.get('/api/agent-badges', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT badge_type, name, description, earned_at
         FROM agent_badges
         WHERE agent_id = $1
         ORDER BY earned_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching badges:', err);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Update agent profile
  app.put('/api/agent-profile', authenticateToken, async (req, res) => {
    const { company, logo_url, territory } = req.body;

    try {
      const result = await pool.query(
        `UPDATE agents
         SET company = COALESCE($2, company),
             logo_url = COALESCE($3, logo_url),
             territory = COALESCE($4, territory),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, first_name, last_name, company, logo_url, tier`,
        [req.user.id, company, logo_url, territory]
      );

      res.json({
        success: true,
        agent: result.rows[0]
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  console.log('✅ Agent Platform 2.0 routes loaded');
};
