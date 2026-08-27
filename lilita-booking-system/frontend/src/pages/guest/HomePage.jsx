import { useState } from 'react';
import './HomePage.css';

export default function HomePage({ onSearch, guestUser, loyaltyPoints, membershipTier }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !location) {
      alert('Please fill in all search fields');
      return;
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    onSearch({ checkIn, checkOut, guests, location, nights });
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-top">
          <h1>Welcome back, {guestUser?.firstName}! 👋</h1>
          <div className="loyalty-badge">
            <span className="tier-label">{membershipTier}</span>
            <span className="points">{loyaltyPoints} pts</span>
          </div>
        </div>
      </header>

      <section className="promo-banner">
        <div className="promo-card">
          <h3>Exclusive Member Offer</h3>
          <p>Get 25% off your next stay</p>
          <button className="promo-btn">View Offers</button>
        </div>
      </section>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Where to?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="locations"
            />
            <datalist id="locations">
              <option value="Mombasa, Kenya" />
              <option value="Mount Kenya" />
              <option value="Maasai Mara, Kenya" />
              <option value="Lake Nakuru" />
              <option value="Amboseli" />
            </datalist>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Guests</label>
            <select value={guests} onChange={(e) => setGuests(e.target.value)}>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          <button type="submit" className="search-btn">
            Search Properties
          </button>
        </form>
      </section>

      <section className="featured-section">
        <h2>Featured Destinations</h2>
        <div className="destination-grid">
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300" alt="Beachfront" />
            <h3>Luxury Beachfront</h3>
            <p>Mombasa, Kenya</p>
          </div>
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1520646091314-8129babda0e0?w=300" alt="Mountain" />
            <h3>Mountain Retreat</h3>
            <p>Mount Kenya</p>
          </div>
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300" alt="Safari" />
            <h3>Safari Premium</h3>
            <p>Maasai Mara</p>
          </div>
        </div>
      </section>

      <section className="quick-links">
        <h2>Quick Access</h2>
        <div className="links-grid">
          <div className="link-card">
            <span className="icon">🏆</span>
            <p>My Bookings</p>
          </div>
          <div className="link-card">
            <span className="icon">❤️</span>
            <p>Favorites</p>
          </div>
          <div className="link-card">
            <span className="icon">🎁</span>
            <p>Offers</p>
          </div>
          <div className="link-card">
            <span className="icon">📞</span>
            <p>Support</p>
          </div>
        </div>
      </section>
    </div>
  );
}
