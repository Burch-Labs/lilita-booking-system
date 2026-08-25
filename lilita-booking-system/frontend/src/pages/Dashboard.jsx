import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Dashboard.css';

export default function Dashboard({ token, user }) {
  const [agent, setAgent] = useState(user || {});
  const [property, setProperty] = useState(null);
  const [rates, setRates] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (!user?.property_id) {
        setError('No property assigned');
        setLoading(false);
        return;
      }

      const [propData, ratesData, tiersData, bookingsData] = await Promise.all([
        supabase.from('properties').select('*').eq('id', user.property_id).single(),
        supabase.from('rates').select('*').eq('property_id', user.property_id),
        supabase.from('commission_tiers').select('*').eq('property_id', user.property_id),
        supabase.from('bookings').select('*').eq('agent_id', user.id)
      ]);

      if (propData.data) setProperty(propData.data);
      if (ratesData.data) setRates(ratesData.data);
      if (tiersData.data) setTiers(tiersData.data);
      if (bookingsData.data) setBookings(bookingsData.data);
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
            <p className="stat-value">{bookings.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Confirmed</h3>
            <p className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Commission Earned</h3>
            <p className="stat-value">${(bookings.reduce((sum, b) => sum + (b.commission_earned || 0), 0)).toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Commission Tier</h3>
            <p className="stat-value">{tiers.length > 0 ? tiers[0].tier_name : 'Standard'}</p>
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
