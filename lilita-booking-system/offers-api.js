// Offers & Campaigns API Endpoints
// Add these to server.js

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
        o.persons,
        o.nights,
        o.is_featured,
        o.hero_image,
        o.gallery_images,
        o.included_features,
        o.activities,
        oc.name as category,
        oc.icon
      FROM offers o
      LEFT JOIN offer_categories oc ON o.category_id = oc.id
      WHERE o.is_active = TRUE
        AND CURRENT_DATE >= o.valid_from
        AND CURRENT_DATE <= o.valid_to
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
      'SELECT offer_price, discount_percentage FROM offers WHERE id = $1 AND is_active = TRUE',
      [offerId]
    );

    if (offerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Offer not found or expired' });
    }

    const offer = offerResult.rows[0];

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

    // Calculate totals with offer
    const baseTotal = offer.offer_price * numNights;
    const discountAmount = (baseTotal / (100 - offer.discount_percentage)) * offer.discount_percentage;
    const finalTotal = baseTotal;

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
        baseTotal,
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

    // Calculate commission based on offer
    const offerCommissionResult = await client.query(
      'SELECT agent_commission_rate FROM offers WHERE id = $1',
      [offerId]
    );

    const commissionRate = offerCommissionResult.rows[0]?.agent_commission_rate || 0.15;
    const commissionAmount = finalTotal * commissionRate;

    // Create commission record
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
        // TODO: Integrate with SendGrid/Email service
        // For now, just track the campaign recipient

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
    categoryId,
    title,
    description,
    originalPrice,
    offerPrice,
    validFrom,
    validTo,
    bookingStartDate,
    bookingEndDate,
    persons,
    nights,
    targetAudience,
    includedFeatures,
    activities,
    termsConditions,
    isFeatured
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
      [
        categoryId, title, description, originalPrice, offerPrice,
        validFrom, validTo, bookingStartDate, bookingEndDate,
        persons, nights, targetAudience,
        JSON.stringify(includedFeatures), JSON.stringify(activities),
        termsConditions, isFeatured, req.user.id
      ]
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

  const {
    offerId,
    title,
    subjectLine,
    body,
    callToAction,
    callToActionUrl
  } = req.body;

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
