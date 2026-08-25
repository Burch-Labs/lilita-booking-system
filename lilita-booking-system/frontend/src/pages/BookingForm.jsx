import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/BookingForm.css';

export default function BookingForm({ token, user }) {
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const { data, error: err } = await supabase
        .from('rates')
        .select('*')
        .eq('property_id', user.property_id)
        .order('year', { ascending: false });

      if (err) throw err;
      setRates(Array.isArray(data) ? data : []);
      if (data?.length > 0) setSelectedRate(data[0].id);
    } catch (err) {
      setError('Failed to load rates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!selectedRate || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const rate = rates.find(r => r.id === selectedRate);
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const total = parseFloat(rate.price_usd) * nights;

      const bookingRef = `BK${Date.now().toString().slice(-8)}`;

      const { data, error: err } = await supabase
        .from('bookings')
        .insert([{
          property_id: user.property_id,
          agent_id: user.id,
          guest_name: guestName,
          guest_email: guestEmail,
          check_in: checkInDate,
          check_out: checkOutDate,
          num_guests: parseInt(numGuests),
          total_value: total,
          commission_earned: 0,
          status: 'confirmed',
          booking_reference: bookingRef
        }])
        .select();

      if (err) throw err;
      if (data?.length > 0) {
        setSuccess(`✅ Booking created! Reference: ${bookingRef}`);
        setSelectedRate('');
        setCheckInDate('');
        setCheckOutDate('');
        setNumGuests(1);
        setGuestEmail('');
        setGuestName('');
        setSpecialRequests('');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading rates...</div>;
  }

  return (
    <div className="booking-form-container">
      <h2>📅 Create New Booking</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>💰 Select Rate</h3>
          <div className="form-group">
            <label>Rate Package *</label>
            <select
              value={selectedRate}
              onChange={(e) => setSelectedRate(e.target.value)}
              required
            >
              <option value="">Choose a rate...</option>
              {rates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.year} - {rate.season}: ${parseFloat(rate.price_usd).toFixed(2)}/night
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>📆 Dates & Guests</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Check-in Date *</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Check-out Date *</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Guests *</label>
              <input
                type="number"
                min="1"
                max="6"
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>👤 Guest Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Guest Name *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Guest Email *</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@email.com"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>💬 Special Requests</h3>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="E.g., Late arrival, specific room location, dietary requirements..."
            rows="4"
          />
        </div>


        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting || !selectedRate}
            className="btn-primary"
          >
            {submitting ? '⏳ Creating booking...' : '✅ Create Booking'}
          </button>
          <button type="reset" className="btn-secondary">
            Clear Form
          </button>
        </div>

        <div className="booking-info">
          <p>💡 <strong>Tip:</strong> Bookings are held for 48 hours. Confirm payment within that time to lock in the reservation.</p>
        </div>
      </form>
    </div>
  );
}
