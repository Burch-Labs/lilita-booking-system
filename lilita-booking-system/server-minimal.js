// MINIMAL TEST SERVER - to verify Railway is working
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check - no dependencies
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'production'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', time: new Date() });
});

// Agent leaderboard - returns empty for now
app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard: [] });
});

const server = app.listen(PORT, () => {
  console.log(`✅ TEST SERVER running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});

export default app;
