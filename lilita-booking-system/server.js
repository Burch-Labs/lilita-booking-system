import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupAgentPlatformRoutes } from './agent-platform-api.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log(`🚀 Agent Platform 2.0 starting on port ${PORT}`);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Custom middleware to fix API URL in JavaScript files
app.get('*.js', (req, res, next) => {
  const filePath = path.join(__dirname, 'frontend/dist', req.path);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/http:\/\/localhost:3002/g, '/api');
    res.type('application/javascript').send(content);
  } catch (e) {
    next();
  }
});

// Serve React frontend from frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Database connection - with error handling
let pool = null;
try {
  const dbUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;

  if (dbUrl) {
    console.log('📦 Using DATABASE_URL connection');
    pool = new pg.Pool({ connectionString: dbUrl });
  } else {
    console.log('📦 Using environment variables for DB connection');
    pool = new pg.Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'lilita_booking'
    });
  }

  pool.on('error', (err) => {
    console.error('⚠️ Database pool error:', err.message);
  });

  pool.on('connect', () => {
    console.log('✅ Database pool created');
  });
} catch (err) {
  console.error('⚠️ Database pool error:', err.message);
}

// Authentication middleware
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'production'
  });
});

// Setup Agent Platform routes
try {
  if (pool) {
    setupAgentPlatformRoutes(app, pool, jwt, JWT_SECRET, authenticateToken);
    console.log('✅ Agent Platform routes loaded');
  } else {
    console.warn('⚠️ Database pool not available - some routes may not work');
    setupAgentPlatformRoutes(app, pool, jwt, JWT_SECRET, authenticateToken);
  }
} catch (err) {
  console.error('⚠️ Error loading routes:', err.message);
}

// Serve React index.html for SPA routing (catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Agent Platform 2.0 running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 API: http://localhost:${PORT}/api/leaderboard`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;
