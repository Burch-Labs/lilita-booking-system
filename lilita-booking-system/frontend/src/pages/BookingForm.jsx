import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/BookingForm.css';

export default function BookingForm({ token, user }) {
  const [suites, setSuites] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSuites();
  }, []);

  const loadSuites = async () => {
    try {
      const data = await api.getSuites();
      setSuites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load suites: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!selectedSuite || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const suite = suites.find(s => s.id === selectedSuite);
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const baseTotal = parseFloat(suite.base_price) * nights;
      const finalTotal = baseTotal * 1.15; // 15% standard markup

      const bookingData = {
        suite_id: selectedSuite,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: parseInt(numGuests),
        guest_email: guestEmail,
        guest_name: guestName,
        special_requests: specialRequests,
        booking_channel: 'AGENT',
        base_total: baseTotal,
        final_total: finalTotal,
        payment_method: paymentMethod
      };

      const result = await api.createBooking(token, bookingData);

      if (result.booking) {
        setSuccess(`✅ Booking created! Reference: ${result.booking.booking_reference}`);
        // Reset form
        setSelectedSuite('');
        setCheckInDate('');
        setCheckOutDate('');
        setNumGuests(1);
        setGuestEmail('');
        setGuestName('');
        setSpecialRequests('');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading suites...</div>;
  }

  return (
    <div className="booking-form-container">
      <h2>📅 Create New Booking</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>🏨 Choose a Suite</h3>
          <div className="suites-grid">
            {suites.map((suite) => (
              <div
                key={suite.id}
                className={`suite-card ${selectedSuite === suite.id ? 'selected' : ''}`}
                onClick={() => setSelectedSuite(suite.id)}
              >
                <h4>{suite.name}</h4>
                <p className="suite-desc">{suite.description}</p>
                <p className="suite-price">${parseFloat(suite.base_price).toFixed(2)}/night</p>
                <div className="suite-amenities">
                  {suite.amenities?.slice(0, 3).map((amenity, i) => (
                    <span key={i} className="amenity">✓ {amenity}</span>
                  ))}
                </div>
              </div>
            ))}
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

        <div className="form-section">
          <h3>💳 Payment Method</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                value="CARD"
                checked={paymentMethod === 'CARD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              💳 Credit Card
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="MPESA"
                checked={paymentMethod === 'MPESA'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              📱 M-Pesa
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              🏦 Bank Transfer
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting || !selectedSuite}
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
