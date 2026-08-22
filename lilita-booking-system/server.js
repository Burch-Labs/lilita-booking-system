/**
 * LILITA KEPER BOOKING SYSTEM - Backend API
 * Node.js + Express + PostgreSQL
 *
 * Features:
 * - Booking management (create, confirm, cancel)
 * - Inventory control (availability, holds, releases)
 * - Payment processing (Stripe, M-Pesa/Pesapal)
 * - Agent portal API
 * - Admin dashboard API
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { setupAgentPlatformRoutes } from './agent-platform-api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database connection
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lilita_booking'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Agent login
app.post('/api/auth/agent-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, company, commission_rate FROM agents WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const agent = result.rows[0];
    // TODO: Verify password against password_hash

    const token = jwt.sign(
      { id: agent.id, email: agent.email, role: 'agent' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: agent
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Implement admin auth
  res.status(501).json({ error: 'Not implemented' });
});

// Agent registration (Agent Platform 2.0)
app.post('/api/auth/agent-register', async (req, res) => {
  const { email, first_name, last_name, company, phone, country, password, agent_type, referrer_code } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Generate unique referral code
    const referralCode = `AGENT_${first_name.toUpperCase()}_${last_name.toUpperCase()}_${Math.random().toString(36).substring(7)}`;

    // Check if referrer code is valid (for sub-agents)
    let referrerId = null;
    if (referrer_code) {
      const referrerResult = await pool.query(
        'SELECT id FROM agents WHERE referral_code = $1',
        [referrer_code]
      );
      if (referrerResult.rows.length > 0) {
        referrerId = referrerResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO agents (
        email, first_name, last_name, company, phone, country, password_hash, api_key,
        is_active, agent_type, referrer_agent_id, referral_code, tier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, email, first_name, last_name, company, referral_code, tier, agent_type`,
      [email, first_name, last_name, company, phone, country, passwordHash, apiKey, true,
       agent_type || 'direct', referrerId, referralCode, 'bronze']
    );

    const agent = result.rows[0];
    const token = jwt.sign(
      { id: agent.id, email: agent.email, role: 'agent' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // If sub-agent, create referral relationship
    if (referrerId) {
      await pool.query(
        `INSERT INTO agent_referrals (referrer_agent_id, referred_agent_id, referral_code, status, commission_rate)
         VALUES ($1, $2, $3, $4, $5)`,
        [referrerId, agent.id, referrer_code, 'active', 0.03]
      );

      // Award sign-up bonus to referrer
      await pool.query(
        `INSERT INTO agent_payouts (agent_id, payout_type, amount, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [referrerId, 'referral_bonus', 50, `Referral bonus for ${agent.first_name}`, 'earned']
      );
    }

    res.status(201).json({
      token,
      user: {
        ...agent,
        message: 'Welcome! Your account is ready. Use your referral code to recruit sub-agents and earn 3% commission.'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// AVAILABILITY ENDPOINTS
// ============================================================================

// Get all suites with current availability
app.get('/api/suites', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const suites = await pool.query('SELECT * FROM suites WHERE is_active = true ORDER BY name');

    // Get availability for date range
    let availQuery = `
      SELECT suite_id, date, status, price
      FROM availability
      WHERE date >= $1 AND date <= $2
      ORDER BY suite_id, date
    `;

    const params = [
      startDate || '2026-01-01',
      endDate || '2026-12-31'
    ];

    const availability = await pool.query(availQuery, params);

    // Format response
    const response = suites.rows.map(suite => {
      const suiteAvail = availability.rows.filter(a => a.suite_id === suite.id);
      return {
        ...suite,
        availability: suiteAvail
      };
    });

    res.json(response);
  } catch (err) {
    console.error('Error fetching suites:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single suite with calendar
app.get('/api/suites/:id/calendar', async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  try {
    const suite = await pool.query('SELECT * FROM suites WHERE id = $1', [id]);
    if (suite.rows.length === 0) {
      return res.status(404).json({ error: 'Suite not found' });
    }

    // Get availability for month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const availability = await pool.query(
      `SELECT date, status, price FROM availability
       WHERE suite_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date`,
      [id, startDate, endDate]
    );

    res.json({
      suite: suite.rows[0],
      availability: availability.rows
    });
  } catch (err) {
    console.error('Error fetching calendar:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// BOOKING ENDPOINTS
// ============================================================================

// Create booking (guest or agent)
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const {
    suiteId,
    checkInDate,
    checkOutDate,
    numGuests,
    guestEmail,
    guestFirstName,
    guestLastName,
    specialRequests,
    bookingChannel
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check availability
    const available = await client.query(
      `SELECT COUNT(*) FROM availability
       WHERE suite_id = $1
       AND date >= $2 AND date < $3
       AND status NOT IN ('CONFIRMED', 'BLOCKED')`,
      [suiteId, checkInDate, checkOutDate]
    );

    const numNights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    if (parseInt(available.rows[0].count) < numNights) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Suite not available for selected dates' });
    }

    // Get suite pricing
    const suite = await client.query('SELECT base_price FROM suites WHERE id = $1', [suiteId]);
    const basePrice = suite.rows[0].base_price;
    const total = basePrice * numNights;

    // Generate booking reference
    const bookingRef = `LILITA-${Date.now()}`;

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        booking_reference, suite_id, agent_id, check_in_date, check_out_date,
        num_guests, status, base_total, final_total, special_requests,
        booking_channel, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, booking_reference, status`,
      [
        bookingRef,
        suiteId,
        req.user.role === 'agent' ? req.user.id : null,
        checkInDate,
        checkOutDate,
        numGuests,
        'PENDING',
        total,
        total,
        specialRequests,
        bookingChannel || (req.user.role === 'agent' ? 'AGENT' : 'DIRECT'),
        req.user.id
      ]
    );

    const booking = bookingResult.rows[0];

    // Place hold on dates
    await client.query(
      `UPDATE availability
       SET status = $1, updated_at = NOW()
       WHERE suite_id = $2 AND date >= $3 AND date < $4`,
      ['ON_HOLD', suiteId, checkInDate, checkOutDate]
    );

    // Set hold expiry (48 hours from now)
    const holdExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await client.query(
      `UPDATE bookings SET hold_expires_at = $1 WHERE id = $2`,
      [holdExpiry, booking.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      booking,
      holdExpiresAt: holdExpiry,
      totalAmount: total,
      message: 'Booking created. You have 48 hours to confirm with payment.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Get booking details
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await pool.query(
      `SELECT b.*, s.name as suite_name, a.first_name as agent_first_name, a.last_name as agent_last_name
       FROM bookings b
       JOIN suites s ON b.suite_id = s.id
       LEFT JOIN agents a ON b.agent_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking.rows[0]);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm booking (with payment)
app.post('/api/bookings/:id/confirm', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentId, amount } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get booking
    const booking = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (booking.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.rows[0];

    // Confirm booking
    await client.query(
      `UPDATE bookings SET status = $1, confirmed_at = NOW() WHERE id = $2`,
      ['CONFIRMED', id]
    );

    // Record payment
    const payment = await client.query(
      `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status, paid_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [id, amount, paymentMethod, paymentId, 'COMPLETED']
    );

    // Update availability
    await client.query(
      `UPDATE availability SET status = $1 WHERE suite_id = $2 AND date >= $3 AND date < $4`,
      ['CONFIRMED', bookingData.suite_id, bookingData.check_in_date, bookingData.check_out_date]
    );

    // Calculate and record commission (if agent) - Agent Platform 2.0
    if (bookingData.agent_id) {
      const agent = await client.query(
        'SELECT commission_rate, parent_agent_id FROM agents WHERE id = $1',
        [bookingData.agent_id]
      );
      const commissionRate = agent.rows[0].commission_rate;
      const commissionAmount = amount * commissionRate;

      await client.query(
        `INSERT INTO commissions (booking_id, agent_id, booking_amount, commission_rate, commission_amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, bookingData.agent_id, amount, commissionRate, commissionAmount]
      );

      // Agent Platform 2.0: Create payout for direct booking
      const agentMargin = commissionAmount; // Agent earns commission on this booking
      await client.query(
        `INSERT INTO agent_payouts (agent_id, booking_id, payout_type, amount, description, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [bookingData.agent_id, id, 'direct_booking', agentMargin, `Booking commission for ${bookingData.booking_reference}`, 'earned']
      );

      // Update agent's total bookings and earnings
      await client.query(
        `UPDATE agents
         SET total_bookings = total_bookings + 1,
             total_earnings = total_earnings + $2,
             updated_at = NOW()
         WHERE id = $1`,
        [bookingData.agent_id, agentMargin]
      );

      // If this is a sub-agent, give parent agent 3% commission
      if (agent.rows[0].parent_agent_id) {
        const parentCommission = amount * 0.03;
        await client.query(
          `INSERT INTO agent_payouts (agent_id, booking_id, payout_type, amount, description, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [agent.rows[0].parent_agent_id, id, 'sub_agent_commission', parentCommission, `Commission from sub-agent booking`, 'earned']
        );

        // Update parent agent earnings
        await client.query(
          `UPDATE agents
           SET total_earnings = total_earnings + $2,
               updated_at = NOW()
           WHERE id = $1`,
          [agent.rows[0].parent_agent_id, parentCommission]
        );

        // Update referral total commission
        await client.query(
          `UPDATE agent_referrals
           SET total_commission_earned = total_commission_earned + $2
           WHERE referrer_agent_id = $1 AND referred_agent_id = $3`,
          [agent.rows[0].parent_agent_id, parentCommission, bookingData.agent_id]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Booking confirmed',
      bookingId: id,
      payment: payment.rows[0],
      status: 'CONFIRMED'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Confirmation error:', err);
    res.status(500).json({ error: 'Failed to confirm booking' });
  } finally {
    client.release();
  }
});

// Cancel booking
app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const booking = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (booking.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.rows[0];

    // Cancel booking
    await client.query(
      `UPDATE bookings SET status = $1 WHERE id = $2`,
      ['CANCELLED', id]
    );

    // Release dates
    await client.query(
      `UPDATE availability SET status = $1, updated_at = NOW()
       WHERE suite_id = $2 AND date >= $3 AND date < $4`,
      ['RELEASED', bookingData.suite_id, bookingData.check_in_date, bookingData.check_out_date]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Booking cancelled',
      status: 'CANCELLED'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cancellation error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    client.release();
  }
});

// ============================================================================
// AGENT PORTAL ENDPOINTS
// ============================================================================

// Get agent dashboard stats
app.get('/api/agent/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'agent') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') as total_bookings,
        COUNT(*) FILTER (WHERE status = 'ON_HOLD') as pending_holds,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN final_total ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN c.status IN ('EARNED', 'PENDING_PAYMENT') THEN c.commission_amount ELSE 0 END), 0) as total_commission
       FROM bookings b
       LEFT JOIN commissions c ON b.id = c.booking_id
       WHERE b.agent_id = $1`,
      [req.user.id]
    );

    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get agent's bookings
app.get('/api/agent/bookings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'agent') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const bookings = await pool.query(
      `SELECT b.*, s.name as suite_name
       FROM bookings b
       JOIN suites s ON b.suite_id = s.id
       WHERE b.agent_id = $1
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json(bookings.rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get agent commissions
app.get('/api/agent/commissions', authenticateToken, async (req, res) => {
  if (req.user.role !== 'agent') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const commissions = await pool.query(
      `SELECT c.*, b.booking_reference, s.name as suite_name
       FROM commissions c
       JOIN bookings b ON c.booking_id = b.id
       JOIN suites s ON b.suite_id = s.id
       WHERE c.agent_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json(commissions.rows);
  } catch (err) {
    console.error('Error fetching commissions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

// Create Stripe payment intent
app.post('/api/payments/stripe-intent', async (req, res) => {
  const { bookingId, amount } = req.body;
  // TODO: Implement Stripe integration
  res.status(501).json({ error: 'Not implemented' });
});

// Handle M-Pesa/Pesapal callback
app.post('/api/payments/pesapal-callback', async (req, res) => {
  // TODO: Implement Pesapal webhook handler
  res.status(501).json({ error: 'Not implemented' });
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Admin dashboard
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  // TODO: Add admin auth check
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') as total_bookings,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN final_total ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'ON_HOLD' THEN final_total ELSE 0 END), 0) as pending_holds,
        (SELECT AVG(occupancy_rate) FROM occupancy_summary) as avg_occupancy
       FROM bookings b
       WHERE b.check_in_date >= CURRENT_DATE`
    );

    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

// Health check
// ============================================================================
// OFFERS & CAMPAIGNS API ENDPOINTS
// ============================================================================

// Get all active offers
app.get('/api/offers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.title,
        o.short_description,
        o.description,
        o.original_price,
        o.offer_price,
        ROUND(((o.original_price - o.offer_price) / o.original_price * 100), 2) as discount_percentage,
        o.valid_from,
        o.valid_to,
        o.booking_start_date,
        o.booking_end_date,
        o.persons,
        o.nights,
        o.is_featured,
        o.hero_image,
        o.gallery_images,
        o.included_features,
        o.activities,
        o.terms_conditions,
        oc.name as category,
        oc.icon
      FROM offers o
      LEFT JOIN offer_categories oc ON o.category_id = oc.id
      WHERE o.is_active = TRUE
      ORDER BY o.is_featured DESC, o.position_order ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ error: 'Failed to load offers' });
  }
});

// Get single offer details
app.get('/api/offers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        o.*,
        oc.name as category,
        oc.icon,
        (SELECT COUNT(*) FROM offer_usage WHERE offer_id = o.id) as usage_count,
        (SELECT COUNT(*) FROM campaign_recipients cr
         JOIN campaign_emails ce ON cr.campaign_id = ce.id
         WHERE ce.offer_id = o.id AND cr.status = 'CONVERTED') as conversion_count
      FROM offers o
      LEFT JOIN offer_categories oc ON o.category_id = oc.id
      WHERE o.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get offer error:', err);
    res.status(500).json({ error: 'Failed to load offer' });
  }
});

// Create booking with offer
app.post('/api/bookings/with-offer', authenticateToken, async (req, res) => {
  const {
    suiteId,
    checkInDate,
    checkOutDate,
    numGuests,
    offerId,
    guestEmail,
    guestFirstName,
    guestLastName,
    specialRequests,
    bookingChannel
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get offer details
    const offerResult = await client.query(
      'SELECT offer_price, agent_commission_rate FROM offers WHERE id = $1 AND is_active = TRUE',
      [offerId]
    );

    if (offerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Offer not found or expired' });
    }

    const offer = offerResult.rows[0];
    const commissionRate = offer.agent_commission_rate || 0.15;

    // Check availability
    const available = await client.query(
      `SELECT COUNT(*) FROM availability
       WHERE suite_id = $1
       AND date >= $2 AND date < $3
       AND status NOT IN ('CONFIRMED', 'BLOCKED')`,
      [suiteId, checkInDate, checkOutDate]
    );

    const numNights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    if (parseInt(available.rows[0].count) < numNights) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Suite not available for selected dates' });
    }

    // Calculate totals
    const finalTotal = offer.offer_price * numNights;
    const discountAmount = finalTotal * (1 - (offer.offer_price / 1497)); // Rough discount calc

    // Generate booking reference
    const bookingRef = `LILITA-${Date.now()}`;

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        booking_reference, suite_id, agent_id, check_in_date, check_out_date,
        num_guests, status, base_total, discount_amount, final_total,
        special_requests, booking_channel, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, booking_reference, status`,
      [
        bookingRef,
        suiteId,
        req.user.role === 'agent' ? req.user.id : null,
        checkInDate,
        checkOutDate,
        numGuests,
        'PENDING',
        finalTotal,
        discountAmount,
        finalTotal,
        specialRequests,
        bookingChannel || (req.user.role === 'agent' ? 'AGENT' : 'DIRECT'),
        req.user.id
      ]
    );

    const booking = bookingResult.rows[0];

    // Track offer usage
    await client.query(
      `INSERT INTO offer_usage (offer_id, booking_id, agent_id, price_charged, discount_applied)
       VALUES ($1, $2, $3, $4, $5)`,
      [offerId, booking.id, req.user.id, finalTotal, discountAmount]
    );

    // Place hold on dates
    await client.query(
      `UPDATE availability
       SET status = $1, updated_at = NOW()
       WHERE suite_id = $2 AND date >= $3 AND date < $4`,
      ['ON_HOLD', suiteId, checkInDate, checkOutDate]
    );

    // Set hold expiry
    const holdExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await client.query(
      `UPDATE bookings SET hold_expires_at = $1 WHERE id = $2`,
      [holdExpiry, booking.id]
    );

    // Create commission record
    const commissionAmount = finalTotal * commissionRate;
    await client.query(
      `INSERT INTO commissions (booking_id, agent_id, booking_amount, commission_rate, commission_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [booking.id, req.user.id, finalTotal, commissionRate, commissionAmount, 'EARNED']
    );

    // Log activity
    await client.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'BOOKING_WITH_OFFER', 'booking', booking.id,
       JSON.stringify({offerId, offerPrice: offer.offer_price, discount: discountAmount})]
    );

    await client.query('COMMIT');

    res.status(201).json({
      booking,
      holdExpiresAt: holdExpiry,
      totalAmount: finalTotal,
      discountApplied: discountAmount,
      commissionEarned: commissionAmount,
      message: 'Booking created with offer applied!'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking with offer error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Send offer campaign to agents
app.post('/api/campaigns/send', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { campaignId } = req.body;

  try {
    // Get campaign details
    const campaignResult = await pool.query(
      'SELECT * FROM campaign_emails WHERE id = $1',
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    if (campaign.is_sent) {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    // Get all active agents
    const agentsResult = await pool.query(
      'SELECT id, email, first_name FROM agents WHERE is_active = TRUE AND is_verified = TRUE'
    );

    let sent = 0;
    let failed = 0;

    // Send to each agent (placeholder - integrate with email service)
    for (const agent of agentsResult.rows) {
      try {
        await pool.query(
          `INSERT INTO campaign_recipients (campaign_id, agent_id, email, status)
           VALUES ($1, $2, $3, $4)`,
          [campaignId, agent.id, agent.email, 'SENT']
        );
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${agent.email}:`, err);
        failed++;
      }
    }

    // Update campaign status
    await pool.query(
      `UPDATE campaign_emails
       SET is_sent = TRUE, sent_at = NOW(), sent_count = $1
       WHERE id = $2`,
      [sent, campaignId]
    );

    res.json({
      message: 'Campaign sent successfully',
      sent,
      failed,
      total: agentsResult.rows.length
    });
  } catch (err) {
    console.error('Send campaign error:', err);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Get campaign performance
app.get('/api/campaigns/:id/performance', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  try {
    const campaignResult = await pool.query(
      'SELECT * FROM campaign_emails WHERE id = $1',
      [id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Get performance metrics
    const performanceResult = await pool.query(
      `SELECT
        COUNT(*) as total_sent,
        SUM(CASE WHEN status = 'OPENED' THEN 1 ELSE 0 END) as opens,
        SUM(CASE WHEN status = 'CLICKED' THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as conversions
       FROM campaign_recipients
       WHERE campaign_id = $1`,
      [id]
    );

    const metrics = performanceResult.rows[0];

    res.json({
      campaign,
      metrics: {
        totalSent: parseInt(metrics.total_sent),
        opens: parseInt(metrics.opens || 0),
        clicks: parseInt(metrics.clicks || 0),
        conversions: parseInt(metrics.conversions || 0),
        openRate: metrics.total_sent > 0 ? ((metrics.opens / metrics.total_sent) * 100).toFixed(2) + '%' : '0%',
        clickRate: metrics.total_sent > 0 ? ((metrics.clicks / metrics.total_sent) * 100).toFixed(2) + '%' : '0%',
        conversionRate: metrics.total_sent > 0 ? ((metrics.conversions / metrics.total_sent) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (err) {
    console.error('Get campaign performance error:', err);
    res.status(500).json({ error: 'Failed to load campaign performance' });
  }
});

// Admin: Create new offer
app.post('/api/admin/offers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const {
    categoryId, title, description, originalPrice, offerPrice,
    validFrom, validTo, bookingStartDate, bookingEndDate,
    persons, nights, targetAudience, includedFeatures, activities,
    termsConditions, isFeatured
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO offers (
        category_id, title, description, original_price, offer_price,
        valid_from, valid_to, booking_start_date, booking_end_date,
        persons, nights, target_audience, included_features, activities,
        terms_conditions, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [categoryId, title, description, originalPrice, offerPrice,
       validFrom, validTo, bookingStartDate, bookingEndDate,
       persons, nights, targetAudience,
       JSON.stringify(includedFeatures), JSON.stringify(activities),
       termsConditions, isFeatured, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create offer error:', err);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Admin: Create campaign
app.post('/api/admin/campaigns', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { offerId, title, subjectLine, body, callToAction, callToActionUrl } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO campaign_emails (
        offer_id, title, subject_line, body, call_to_action, call_to_action_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [offerId, title, subjectLine, body, callToAction, callToActionUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// ============================================================================
// AGENT PLATFORM 2.0 ROUTES
// ============================================================================
setupAgentPlatformRoutes(app, pool, jwt, JWT_SECRET, authenticateToken);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`✅ Lilita Booking API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'lilita_booking'}`);
});

export default app;
