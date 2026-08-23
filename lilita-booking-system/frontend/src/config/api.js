/**
 * API Configuration
 * Uses environment variables to support multiple environments
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Make authenticated API call
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...apiConfig.headers,
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      timeout: apiConfig.timeout
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Public endpoints (no auth)
 */
export const api = {
  // Auth
  login: (email, password) =>
    apiCall('/api/auth/agent-login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (agentData) =>
    apiCall('/api/auth/agent-register', {
      method: 'POST',
      body: JSON.stringify(agentData)
    }),

  // Leaderboard (public)
  getLeaderboard: () =>
    apiCall('/api/leaderboard'),

  getAgentMetrics: (agentId) =>
    apiCall(`/api/agent-metrics/${agentId}`),

  getChallenges: () =>
    apiCall('/api/challenges'),
};

/**
 * Authenticated endpoints
 */
export const authApi = {
  // Offers
  createOffer: (offerData) =>
    apiCall('/api/agent-offers', {
      method: 'POST',
      body: JSON.stringify(offerData)
    }),

  getOffers: () =>
    apiCall('/api/agent-offers', { method: 'GET' }),

  // Referrals
  getReferrals: () =>
    apiCall('/api/agent-referrals', { method: 'GET' }),

  createReferral: (referralData) =>
    apiCall('/api/agent-referrals', {
      method: 'POST',
      body: JSON.stringify(referralData)
    }),

  // Payouts
  getPayouts: () =>
    apiCall('/api/agent-payouts', { method: 'GET' }),

  requestPayout: (amount) =>
    apiCall('/api/agent-payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  // Profile
  updateProfile: (profileData) =>
    apiCall('/api/agent-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  getBadges: () =>
    apiCall('/api/agent-badges', { method: 'GET' }),

  // Challenges
  joinChallenge: (challengeId) =>
    apiCall(`/api/challenges/${challengeId}/join`, {
      method: 'POST',
      body: JSON.stringify({})
    }),

  getChallengeProgress: (challengeId) =>
    apiCall(`/api/challenges/${challengeId}/progress`, { method: 'GET' })
};

export default { api, authApi, apiConfig };
