// API client for Lilita Booking System
const API_URL = 'http://localhost:3002/api';

export const api = {
  // Auth
  async agentLogin(email, password) {
    const res = await fetch(`${API_URL}/auth/agent-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async agentRegister(email, password, firstName, lastName, company) {
    const res = await fetch(`${API_URL}/auth/agent-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, company })
    });
    return res.json();
  },

  // Suites
  async getSuites() {
    const res = await fetch(`${API_URL}/suites`);
    return res.json();
  },

  async getSuiteCalendar(suiteId, year, month) {
    const res = await fetch(`${API_URL}/suites/${suiteId}/calendar?year=${year}&month=${month}`);
    return res.json();
  },

  // Bookings
  async createBooking(token, bookingData) {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  async getBooking(token, bookingId) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async confirmBooking(token, bookingId, paymentData) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    return res.json();
  },

  async cancelBooking(token, bookingId) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Agent Dashboard
  async getAgentDashboard(token) {
    const res = await fetch(`${API_URL}/agent/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getAgentBookings(token) {
    const res = await fetch(`${API_URL}/agent/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getAgentCommissions(token) {
    const res = await fetch(`${API_URL}/agent/commissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
