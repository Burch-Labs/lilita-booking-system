import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/CommissionsPage.css';

export default function CommissionsPage({ token, user }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      const data = await api.getAgentCommissions(token);
      setCommissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load commissions: ' + err.message);
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

  const totalEarned = commissions
    .filter(c => c.status === 'EARNED' || c.status === 'PAID')
    .reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0);

  const pendingPayment = commissions
    .filter(c => c.status === 'PENDING_PAYMENT')
    .reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0);

  const alreadyPaid = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0);

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
          <h4>Commission Rate</h4>
          <p className="amount">{((user?.commission_rate || 0.15) * 100).toFixed(0)}%</p>
          <span className="status">Your rate</span>
        </div>
      </div>

      <div className="commission-details">
        <h3>📊 Commission Breakdown</h3>

        {commissions.length === 0 ? (
          <div className="empty-state">
            <p>No commissions yet. Complete bookings to start earning! 🚀</p>
          </div>
        ) : (
          <div className="commission-table">
            <table>
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Booking Amount</th>
                  <th>Commission Rate</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date Earned</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((comm) => (
                  <tr key={comm.id} className={`status-${comm.status?.toLowerCase()}`}>
                    <td className="booking-ref">
                      <span className="badge">{comm.booking_id?.substring(0, 8)}</span>
                    </td>
                    <td>${parseFloat(comm.booking_amount).toFixed(2)}</td>
                    <td>{(parseFloat(comm.commission_rate) * 100).toFixed(0)}%</td>
                    <td className="commission-amount">
                      <strong>${parseFloat(comm.commission_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge status-${comm.status?.toLowerCase()}`}>
                        {comm.status}
                      </span>
                    </td>
                    <td>{new Date(comm.created_at).toLocaleDateString()}</td>
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
