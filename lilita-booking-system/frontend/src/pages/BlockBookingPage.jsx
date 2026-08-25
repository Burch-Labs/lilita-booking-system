import { useState, useEffect } from 'react';
import { supabase, createBlockBooking, getAgentBlockBookings } from '../lib/supabase';
import '../styles/BlockBookingPage.css';

export default function BlockBookingPage({ user }) {
  const [blockBookings, setBlockBookings] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    block_name: '',
    start_date: '',
    end_date: '',
    rate_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [blockData, rateData] = await Promise.all([
        getAgentBlockBookings(user.id),
        supabase.from('rates').select('*').eq('property_id', user.property_id)
      ]);

      setBlockBookings(blockData || []);
      setRates(rateData.data || []);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date || !formData.rate_id) return 0;
    const rate = rates.find(r => r.id === formData.rate_id);
    const nights = Math.floor((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
    return rate ? nights * rate.price_usd : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const blockBooking = await createBlockBooking(
        user.property_id,
        user.id,
        {
          ...formData,
          total_value: calculateTotal()
        }
      );

      if (blockBooking) {
        setSuccess('✅ Block booking created successfully!');
        setFormData({ block_name: '', start_date: '', end_date: '', rate_id: '' });
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError('Failed to create block booking: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading block bookings...</div>;
  }

  const nights = formData.start_date && formData.end_date
    ? Math.floor((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="block-booking-container">
      <h2>📦 Series Block Bookings</h2>
      <p>Create and manage block bookings with flexible cancellation options</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!showForm ? (
        <button className="btn-create" onClick={() => setShowForm(true)}>
          + Create Block Booking
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="block-booking-form">
          <div className="form-group">
            <label>Block Name *</label>
            <input
              type="text"
              value={formData.block_name}
              onChange={(e) => setFormData({...formData, block_name: e.target.value})}
              placeholder="E.g., Family Reunion 2026"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rate *</label>
            <select
              value={formData.rate_id}
              onChange={(e) => setFormData({...formData, rate_id: e.target.value})}
              required
            >
              <option value="">Select rate...</option>
              {rates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.year} {rate.season}: ${parseFloat(rate.price_usd).toFixed(2)}/night
                </option>
              ))}
            </select>
          </div>

          {nights > 0 && (
            <div className="booking-summary">
              <div className="summary-item">
                <span>Nights:</span>
                <strong>{nights}</strong>
              </div>
              <div className="summary-item">
                <span>Total Value:</span>
                <strong>${calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? '⏳ Creating...' : '✅ Create Block Booking'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="block-bookings-list">
        <h3>Your Block Bookings</h3>
        {blockBookings.length === 0 ? (
          <div className="empty-state">
            <p>No block bookings yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {blockBookings.map((block) => (
              <div key={block.id} className={`block-card status-${block.status}`}>
                <h4>{block.block_name}</h4>
                <div className="block-dates">
                  📅 {new Date(block.start_date).toLocaleDateString()} - {new Date(block.end_date).toLocaleDateString()}
                </div>
                <div className="block-details">
                  <span>🌙 {block.num_nights} nights</span>
                  <span>💰 ${parseFloat(block.total_value).toFixed(2)}</span>
                </div>
                <span className={`status-badge status-${block.status}`}>
                  {block.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="block-info">
        <h3>ℹ️ Block Booking Features</h3>
        <ul>
          <li>✓ Lock multiple nights at agreed rates</li>
          <li>✓ Cancel individual nights without losing entire block</li>
          <li>✓ Automatic commission calculation per night</li>
          <li>✓ Real-time availability sync with property</li>
          <li>✓ Group management for family/corporate events</li>
        </ul>
      </div>
    </div>
  );
}
