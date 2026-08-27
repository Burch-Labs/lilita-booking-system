import { useState } from 'react';
import './BookingDetailsPage.css';

export default function BookingDetailsPage({ booking, onConfirm, onBack }) {
  const [roomType, setRoomType] = useState('deluxe');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isConfirming, setIsConfirming] = useState(false);

  const roomTypes = [
    { id: 'standard', name: 'Standard Room', price: booking.price, capacity: 2 },
    { id: 'deluxe', name: 'Deluxe Room', price: booking.price + 50, capacity: 2 },
    { id: 'suite', name: 'Suite', price: booking.price + 150, capacity: 4 },
  ];

  const selectedRoom = roomTypes.find((r) => r.id === roomType);
  const totalPrice = selectedRoom.price * booking.nights;
  const taxes = Math.round(totalPrice * 0.16);
  const serviceFee = Math.round(totalPrice * 0.1);
  const finalPrice = totalPrice + taxes + serviceFee;

  const handleConfirm = async () => {
    setIsConfirming(true);
    setTimeout(() => {
      onConfirm({
        ...booking,
        roomType: selectedRoom.name,
        totalPrice: finalPrice,
        paymentMethod: selectedPayment,
        nights: booking.nights,
      });
    }, 1000);
  };

  return (
    <div className="booking-details-page">
      <header className="details-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Booking Details</h2>
      </header>

      <section className="property-info">
        <img src={booking.image} alt={booking.name} className="property-image" />
        <div className="property-header">
          <h3>{booking.name}</h3>
          <div className="rating-section">
            <span className="stars">⭐ {booking.rating}</span>
            <span className="location">📍 {booking.location}</span>
          </div>
        </div>
      </section>

      <section className="booking-summary">
        <h3>Stay Summary</h3>
        <div className="summary-row">
          <span>Check-in</span>
          <span>Today</span>
        </div>
        <div className="summary-row">
          <span>Check-out</span>
          <span>{booking.nights} nights later</span>
        </div>
        <div className="summary-row">
          <span>Total Nights</span>
          <span>{booking.nights}</span>
        </div>
      </section>

      <section className="room-selection">
        <h3>Select Room Type</h3>
        <div className="room-options">
          {roomTypes.map((room) => (
            <button
              key={room.id}
              className={`room-option ${roomType === room.id ? 'selected' : ''}`}
              onClick={() => setRoomType(room.id)}
            >
              <div className="room-name">{room.name}</div>
              <div className="room-capacity">Up to {room.capacity} guests</div>
              <div className="room-price">${room.price}/night</div>
            </button>
          ))}
        </div>
      </section>

      <section className="price-breakdown">
        <h3>Price Breakdown</h3>
        <div className="breakdown-row">
          <span>{selectedRoom.name} × {booking.nights} nights</span>
          <span>${totalPrice}</span>
        </div>
        <div className="breakdown-row">
          <span>Taxes (16%)</span>
          <span>${taxes}</span>
        </div>
        <div className="breakdown-row">
          <span>Service Fee (10%)</span>
          <span>${serviceFee}</span>
        </div>
        <div className="breakdown-total">
          <strong>Total Price</strong>
          <strong>${finalPrice}</strong>
        </div>
      </section>

      <section className="amenities-section">
        <h3>Property Amenities</h3>
        <div className="amenities-grid">
          <div className="amenity-item">
            <span className="icon">🏊</span>
            <span>Swimming Pool</span>
          </div>
          <div className="amenity-item">
            <span className="icon">🍽️</span>
            <span>Restaurant</span>
          </div>
          <div className="amenity-item">
            <span className="icon">🎰</span>
            <span>Spa & Wellness</span>
          </div>
          <div className="amenity-item">
            <span className="icon">📶</span>
            <span>Free WiFi</span>
          </div>
          <div className="amenity-item">
            <span className="icon">🚗</span>
            <span>Free Parking</span>
          </div>
          <div className="amenity-item">
            <span className="icon">🏋️</span>
            <span>Fitness Center</span>
          </div>
        </div>
      </section>

      <section className="payment-section">
        <h3>Payment Method</h3>
        <div className="payment-options">
          <label className="payment-option">
            <input
              type="radio"
              value="card"
              checked={selectedPayment === 'card'}
              onChange={(e) => setSelectedPayment(e.target.value)}
            />
            <span className="payment-label">💳 Credit/Debit Card</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              value="mpesa"
              checked={selectedPayment === 'mpesa'}
              onChange={(e) => setSelectedPayment(e.target.value)}
            />
            <span className="payment-label">📱 M-Pesa</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              value="wallet"
              checked={selectedPayment === 'wallet'}
              onChange={(e) => setSelectedPayment(e.target.value)}
            />
            <span className="payment-label">🎫 Loyalty Wallet</span>
          </label>
        </div>
      </section>

      <section className="confirmation-section">
        <div className="confirmation-info">
          <p>✓ Free cancellation up to 48 hours before arrival</p>
          <p>✓ Earn loyalty points on this booking</p>
        </div>

        <button
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Processing...' : `Confirm Booking - $${finalPrice}`}
        </button>
      </section>
    </div>
  );
}
