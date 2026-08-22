import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/OffersPage.css';

export default function OffersPage({ token, user }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await fetch('http://localhost:3002/api/offers').then(r => r.json());
      setOffers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading exclusive offers...</div>;
  }

  const filteredOffers = filter === 'all'
    ? offers
    : offers.filter(o => o.category === filter);

  const featuredOffers = filteredOffers.filter(o => o.is_featured);
  const regularOffers = filteredOffers.filter(o => !o.is_featured);

  return (
    <div className="offers-page">
      <div className="offers-hero">
        <h1>🎉 Exclusive Offers & Promotions</h1>
        <p>Limited-time deals for agents. Book now and maximize your earnings!</p>
      </div>

      <div className="offers-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Offers
        </button>
        <button
          className={`filter-btn ${filter === 'Fam Trip' ? 'active' : ''}`}
          onClick={() => setFilter('Fam Trip')}
        >
          ✈️ Fam Trips
        </button>
        <button
          className={`filter-btn ${filter === 'Pre-Opening' ? 'active' : ''}`}
          onClick={() => setFilter('Pre-Opening')}
        >
          🎉 Pre-Opening
        </button>
        <button
          className={`filter-btn ${filter === 'Seasonal' ? 'active' : ''}`}
          onClick={() => setFilter('Seasonal')}
        >
          🌞 Seasonal
        </button>
      </div>

      {/* Featured Offers */}
      {featuredOffers.length > 0 && (
        <section className="featured-section">
          <h2>⭐ Featured Deals</h2>
          <div className="offers-grid featured">
            {featuredOffers.map(offer => (
              <div key={offer.id} className="offer-card featured">
                {offer.hero_image && (
                  <div className="offer-image">
                    <img src={offer.hero_image} alt={offer.title} />
                    <div className="discount-badge">
                      <span className="discount-value">{offer.discount_percentage}%</span>
                      <span className="discount-label">OFF</span>
                    </div>
                  </div>
                )}

                <div className="offer-content">
                  <div className="offer-header">
                    <span className="category-badge">{offer.category}</span>
                    <span className="valid-dates">
                      {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_to).toLocaleDateString()}
                    </span>
                  </div>

                  <h3>{offer.title}</h3>
                  <p className="description">{offer.short_description}</p>

                  <div className="pricing">
                    <div className="price-old">${offer.original_price}</div>
                    <div className="price-new">${offer.offer_price}</div>
                    <span className="per-person">per person, {offer.nights} nights</span>
                  </div>

                  <div className="highlights">
                    {offer.included_features?.slice(0, 3).map((feature, i) => (
                      <span key={i} className="highlight">✓ {feature}</span>
                    ))}
                  </div>

                  <button
                    className="btn-view-details"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regular Offers */}
      {regularOffers.length > 0 && (
        <section className="regular-section">
          <h2>💰 Available Offers</h2>
          <div className="offers-grid">
            {regularOffers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-category">
                  <span className="badge">{offer.category}</span>
                </div>

                <h3>{offer.title}</h3>
                <p className="description">{offer.short_description}</p>

                <div className="pricing">
                  <div className="price-container">
                    <span className="original">${offer.original_price}</span>
                    <span className="current">${offer.offer_price}</span>
                  </div>
                  <span className="discount">Save {offer.discount_percentage}%</span>
                </div>

                <div className="dates">
                  Valid: {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_to).toLocaleDateString()}
                </div>

                <button
                  className="btn-primary"
                  onClick={() => setSelectedOffer(offer)}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {offers.length === 0 && (
        <div className="empty-state">
          <p>No offers available right now. Check back soon!</p>
        </div>
      )}

      {/* Offer Modal */}
      {selectedOffer && (
        <div className="modal-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedOffer(null)}>✕</button>

            <div className="modal-header">
              <h2>{selectedOffer.title}</h2>
              <span className="category-tag">{selectedOffer.category}</span>
            </div>

            <div className="modal-pricing">
              <div className="price-box">
                <span className="label">Original:</span>
                <span className="price crossed">${selectedOffer.original_price}</span>
              </div>
              <div className="price-box primary">
                <span className="label">Special Rate:</span>
                <span className="price highlight">${selectedOffer.offer_price}</span>
              </div>
              <div className="savings">
                Save ${(selectedOffer.original_price - selectedOffer.offer_price).toFixed(2)} ({selectedOffer.discount_percentage}%)
              </div>
            </div>

            <div className="modal-description">
              <p>{selectedOffer.description}</p>
            </div>

            <div className="modal-section">
              <h4>✅ What's Included</h4>
              <ul className="includes-list">
                {selectedOffer.included_features?.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            {selectedOffer.activities && selectedOffer.activities.length > 0 && (
              <div className="modal-section">
                <h4>🎯 Activities & Experiences</h4>
                <div className="activities-grid">
                  {selectedOffer.activities.map((activity, i) => (
                    <div key={i} className="activity-item">
                      <span>🌍 {activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-section">
              <h4>📋 Terms & Conditions</h4>
              <p className="terms">{selectedOffer.terms_conditions}</p>
            </div>

            <div className="modal-dates">
              <div className="date-item">
                <span className="label">Offer Valid:</span>
                <span className="date">
                  {new Date(selectedOffer.valid_from).toLocaleDateString()} → {new Date(selectedOffer.valid_to).toLocaleDateString()}
                </span>
              </div>
              {selectedOffer.booking_start_date && (
                <div className="date-item">
                  <span className="label">Travel Dates:</span>
                  <span className="date">
                    {new Date(selectedOffer.booking_start_date).toLocaleDateString()} → {new Date(selectedOffer.booking_end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {token ? (
              <button className="btn-book">
                Book Now with This Offer
              </button>
            ) : (
              <button className="btn-login">
                Login to Book
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
