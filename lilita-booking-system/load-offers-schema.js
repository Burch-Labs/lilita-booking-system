import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lilita_booking'
});

async function loadOfferSchema() {
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync('./offers-schema.sql', 'utf8');

    console.log('🔄 Loading offers schema...');
    await client.query(schema);
    console.log('✅ Offers schema loaded successfully!');

    // Verify tables created
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%offer%'
    `);

    console.log('📋 Created tables:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // Show sample offers
    const offers = await client.query('SELECT title, offer_price, is_featured FROM offers');
    console.log(`\n💰 Pre-loaded offers: ${offers.rows.length}`);
    offers.rows.forEach(offer => {
      console.log(`   - ${offer.title}: $${offer.offer_price} ${offer.is_featured ? '⭐ Featured' : ''}`);
    });

  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('✅ Offers tables already exist, skipping creation');
    } else {
      console.error('❌ Error loading schema:', err.message);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

loadOfferSchema();
