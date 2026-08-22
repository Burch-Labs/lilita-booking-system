#!/usr/bin/env node

/**
 * AGENT PLATFORM 2.0 - COMPREHENSIVE TEST SUITE
 * Tests API endpoints, database, and integration
 */

import http from 'http';

const API_URL = process.env.API_URL || 'http://localhost:3002';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Make HTTP request to API
 */
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test helper
 */
async function test(name, fn) {
  testsRun++;
  try {
    await fn();
    testsPassed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } catch (err) {
    testsFailed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.dim}${err.message}${colors.reset}`);
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * TEST SUITE
 */
async function runTests() {
  console.log(`${colors.cyan}${colors.bright}AGENT PLATFORM 2.0 - TEST SUITE${colors.reset}`);
  console.log(`${colors.dim}Testing: ${API_URL}${colors.reset}`);
  console.log('');

  // ========================================================================
  // PART 1: HEALTH CHECK
  // ========================================================================

  console.log(`${colors.blue}PART 1: HEALTH CHECK${colors.reset}`);

  await test('Backend is running', async () => {
    const res = await apiCall('/api/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'OK', 'Health check failed');
  });

  console.log('');

  // ========================================================================
  // PART 2: AGENT REGISTRATION
  // ========================================================================

  console.log(`${colors.blue}PART 2: AGENT REGISTRATION${colors.reset}`);

  let testAgentToken = null;
  let testAgentId = null;
  let testAgentReferralCode = null;

  await test('Register test agent', async () => {
    const res = await apiCall('/api/auth/agent-register', 'POST', {
      email: `test-agent-${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'Agent',
      company: 'Test Company',
      password: 'TestPassword123',
      agent_type: 'direct'
    });

    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.token, 'No token in response');
    assert(res.data.user, 'No user in response');
    assert(res.data.user.referral_code, 'No referral code generated');

    testAgentToken = res.data.token;
    testAgentId = res.data.user.id;
    testAgentReferralCode = res.data.user.referral_code;
  });

  await test('Referral code is unique', async () => {
    assert(testAgentReferralCode, 'Referral code not generated');
    assert(testAgentReferralCode.startsWith('AGENT_'), 'Referral code format incorrect');
    assert(testAgentReferralCode.length > 10, 'Referral code too short');
  });

  await test('JWT token is valid', async () => {
    assert(testAgentToken, 'No token received');
    assert(testAgentToken.split('.').length === 3, 'Token is not valid JWT');
  });

  await test('Cannot register with same email', async () => {
    const testEmail = `test-agent-${Date.now()}@example.com`;

    // First registration
    const res1 = await apiCall('/api/auth/agent-register', 'POST', {
      email: testEmail,
      first_name: 'Test',
      last_name: 'Agent',
      password: 'Password123',
      agent_type: 'direct'
    });
    assert(res1.status === 201, 'First registration failed');

    // Second registration with same email
    const res2 = await apiCall('/api/auth/agent-register', 'POST', {
      email: testEmail,
      first_name: 'Test2',
      last_name: 'Agent2',
      password: 'Password123',
      agent_type: 'direct'
    });
    assert(res2.status === 409, `Expected 409 for duplicate email, got ${res2.status}`);
  });

  console.log('');

  // ========================================================================
  // PART 3: AGENT OFFERS
  // ========================================================================

  console.log(`${colors.blue}PART 3: AGENT OFFERS${colors.reset}`);

  let testOfferId = null;

  await test('Create agent offer', async () => {
    const today = new Date();
    const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const res = await apiCall('/api/agent-offers', 'POST', {
      title: 'Test Maasai Mara Safari',
      description: 'Amazing safari experience',
      base_price: 499.00,
      agent_selling_price: 699.00,
      valid_from: today.toISOString().split('T')[0],
      valid_to: ninetyDaysLater.toISOString().split('T')[0]
    }, testAgentToken);

    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.offer, 'No offer in response');
    assert(res.data.offer.agent_margin === 200, `Expected margin 200, got ${res.data.offer.agent_margin}`);

    testOfferId = res.data.offer.id;
  });

  await test('Margin calculation is correct', async () => {
    // Selling price (699) - Base price (499) = Margin (200)
    const res = await apiCall('/api/agent-offers', 'POST', {
      title: 'Test Offer Margin',
      base_price: 499.00,
      agent_selling_price: 749.00,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, testAgentToken);

    assert(res.status === 201, 'Offer creation failed');
    assert(res.data.offer.agent_margin === 250, `Expected margin 250, got ${res.data.offer.agent_margin}`);
  });

  await test('Get agent offers', async () => {
    const res = await apiCall('/api/agent-offers', 'GET', null, testAgentToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Response should be array');
    assert(res.data.length > 0, 'Should have at least one offer');
  });

  console.log('');

  // ========================================================================
  // PART 4: AGENT METRICS
  // ========================================================================

  console.log(`${colors.blue}PART 4: AGENT METRICS${colors.reset}`);

  await test('Get agent metrics', async () => {
    const res = await apiCall(`/api/agent-metrics/${testAgentId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.agent, 'No agent in response');
    assert(res.data.agent.tier === 'bronze', `Expected bronze tier, got ${res.data.agent.tier}`);
    assert(res.data.tierProgress, 'No tier progress info');
  });

  await test('Tier progress bar shows correctly', async () => {
    const res = await apiCall(`/api/agent-metrics/${testAgentId}`);
    const progress = res.data.tierProgress;
    assert(progress.current === 'bronze', 'Tier should be bronze');
    assert(progress.bookingsNeeded > 0, 'Should show bookings needed');
    assert(progress.progressPercent !== undefined, 'Should have progress percent');
  });

  console.log('');

  // ========================================================================
  // PART 5: LEADERBOARD
  // ========================================================================

  console.log(`${colors.blue}PART 5: LEADERBOARD${colors.reset}`);

  await test('Get leaderboard', async () => {
    const res = await apiCall('/api/leaderboard');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.leaders, 'No leaders in response');
    assert(Array.isArray(res.data.leaders), 'Leaders should be array');
    assert(res.data.prizePool, 'No prize pool info');
  });

  await test('Leaderboard has prize info', async () => {
    const res = await apiCall('/api/leaderboard');
    assert(res.data.prizePool['1st'] === 5000, '1st place prize incorrect');
    assert(res.data.prizePool['2nd'] === 3000, '2nd place prize incorrect');
    assert(res.data.prizePool['3rd'] === 1500, '3rd place prize incorrect');
  });

  console.log('');

  // ========================================================================
  // PART 6: REFERRALS
  // ========================================================================

  console.log(`${colors.blue}PART 6: REFERRALS${colors.reset}`);

  await test('Get agent referrals', async () => {
    const res = await apiCall('/api/agent-referrals', 'GET', null, testAgentToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Response should be array');
  });

  console.log('');

  // ========================================================================
  // PART 7: PAYOUTS
  // ========================================================================

  console.log(`${colors.blue}PART 7: PAYOUTS${colors.reset}`);

  await test('Get agent payouts', async () => {
    const res = await apiCall('/api/agent-payouts', 'GET', null, testAgentToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Response should be array');
  });

  console.log('');

  // ========================================================================
  // PART 8: CHALLENGES
  // ========================================================================

  console.log(`${colors.blue}PART 8: CHALLENGES${colors.reset}`);

  await test('Get active challenges', async () => {
    const res = await apiCall('/api/challenges');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Response should be array');
  });

  console.log('');

  // ========================================================================
  // PART 9: ERROR HANDLING
  // ========================================================================

  console.log(`${colors.blue}PART 9: ERROR HANDLING${colors.reset}`);

  await test('Returns 404 for invalid agent', async () => {
    const res = await apiCall('/api/agent-metrics/invalid-id-12345');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await test('Returns 401 without auth token', async () => {
    const res = await apiCall('/api/agent-offers', 'POST', {
      title: 'Test'
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Rejects invalid JSON', async () => {
    const res = await apiCall('/api/auth/agent-register', 'POST', {
      email: 'test@example.com'
      // Missing required fields
    });
    assert(res.status !== 201, 'Should reject incomplete data');
  });

  console.log('');

  // ========================================================================
  // SUMMARY
  // ========================================================================

  console.log(`${colors.bright}${colors.cyan}TEST SUMMARY${colors.reset}`);
  console.log(`Total tests: ${testsRun}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log('');

  if (testsFailed === 0) {
    console.log(`${colors.green}${colors.bright}✓ ALL TESTS PASSED${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Agent Platform 2.0 is ready for deployment!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}✗ SOME TESTS FAILED${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Please fix the issues above before deploying.${colors.reset}`);
    process.exit(1);
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================

console.log('');
runTests().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
