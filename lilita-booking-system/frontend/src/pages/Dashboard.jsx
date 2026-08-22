import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/Dashboard.css';

export default function Dashboard({ token, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashData, bookingsList] = await Promise.all([
        api.getAgentDashboard(token),
        api.getAgentBookings(token)
      ]);

      setDashboardData(dashData);
      setBookings(Array.isArray(bookingsList) ? bookingsList : []);
    } catch (err) {
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.first_name}! 👋</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{dashboardData?.total_bookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Confirmed</h3>
            <p className="stat-value">{dashboardData?.confirmed_bookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Commission Earned</h3>
            <p className="stat-value">${(dashboardData?.total_commission || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Commission Rate</h3>
            <p className="stat-value">{((user?.commission_rate || 0.15) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="recent-bookings">
        <h3>📋 Recent Bookings</h3>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet. Start creating one to get your commissions rolling! 🚀</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-header">
                  <span className="booking-ref">{booking.booking_reference}</span>
                  <span className={`booking-status status-${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <span>📅 {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}</span>
                  <span>👥 {booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''}</span>
                  <span>💵 ${booking.final_total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>🎯 Quick Actions</h3>
        <button className="btn-action">📧 Send Inquiry</button>
        <button className="btn-action">📞 Contact Support</button>
        <button className="btn-action">📊 View Reports</button>
      </div>
    </div>
  );
}
