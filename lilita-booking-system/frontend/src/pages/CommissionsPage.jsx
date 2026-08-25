import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/CommissionsPage.css';

export default function CommissionsPage({ token, user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading commissions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const totalEarned = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (parseFloat(b.commission_earned) || 0), 0);

  const pendingPayment = bookings
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + (parseFloat(b.commission_earned) || 0), 0);

  const alreadyPaid = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (parseFloat(b.commission_earned) || 0), 0);

  return (
    <div className="commissions-container">
      <h2>💰 Commission Tracking</h2>

      <div className="commission-summary">
        <div className="summary-card">
          <h4>Total Earned</h4>
          <p className="amount">${totalEarned.toFixed(2)}</p>
          <span className="status">All time earnings</span>
        </div>

        <div className="summary-card">
          <h4>Already Paid</h4>
          <p className="amount">${alreadyPaid.toFixed(2)}</p>
          <span className="status">Withdrawn</span>
        </div>

        <div className="summary-card highlight">
          <h4>Pending Payment</h4>
          <p className="amount">${pendingPayment.toFixed(2)}</p>
          <span className="status">Awaiting payout</span>
        </div>

        <div className="summary-card">
          <h4>Total Bookings</h4>
          <p className="amount">{bookings.length}</p>
          <span className="status">Confirmed bookings</span>
        </div>
      </div>

      <div className="commission-details">
        <h3>📊 Commission Breakdown</h3>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet. Start creating bookings to earn commissions! 🚀</p>
          </div>
        ) : (
          <div className="commission-table">
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Booking Total</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className={`status-${booking.status?.toLowerCase()}`}>
                    <td className="booking-ref">
                      <span className="badge">{booking.guest_name || 'N/A'}</span>
                    </td>
                    <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                    <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                    <td>${parseFloat(booking.total_value || 0).toFixed(2)}</td>
                    <td className="commission-amount">
                      <strong>${parseFloat(booking.commission_earned || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="commission-info">
        <h3>ℹ️ How Commissions Work</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>✅ EARNED</h4>
            <p>Commission added to your account when booking is confirmed</p>
          </div>
          <div className="info-card">
            <h4>⏳ PENDING_PAYMENT</h4>
            <p>Commission ready to be paid out in the next payout cycle</p>
          </div>
          <div className="info-card">
            <h4>✔️ PAID</h4>
            <p>Commission has been paid to your account</p>
          </div>
          <div className="info-card">
            <h4>❌ CANCELLED</h4>
            <p>Commission cancelled if booking was refunded or cancelled</p>
          </div>
        </div>
      </div>

      <div className="payout-section">
        <h3>🏦 Payment Processing</h3>
        <div className="payout-info">
          <p>Commissions are automatically calculated and paid out:</p>
          <ul>
            <li>✓ Instantly when booking is confirmed</li>
            <li>✓ Automatically after 48-hour hold period expires</li>
            <li>✓ Via bank transfer or mobile money</li>
            <li>✓ Monthly payout cycle starting on the 1st</li>
          </ul>
          {pendingPayment > 0 && (
            <button className="btn-primary">Request Payout (${pendingPayment.toFixed(2)})</button>
          )}
        </div>
      </div>
    </div>
  );
}
