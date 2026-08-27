import { useState } from 'react';
import './SearchResultsPage.css';

export default function SearchResultsPage({ results, onSelectBooking }) {
  const [sortBy, setSortBy] = useState('rating');
  const [filterPrice, setFilterPrice] = useState('all');

  const filteredResults = results.filter((result) => {
    if (filterPrice === 'budget') return result.price < 150;
    if (filterPrice === 'mid') return result.price >= 150 && result.price < 300;
    if (filterPrice === 'luxury') return result.price >= 300;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="search-results-page">
      <header className="results-header">
        <h2>Search Results</h2>
        <p>{filteredResults.length} properties found</p>
      </header>

      <section className="filters-section">
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Rating (High to Low)</option>
            <option value="price">Price (Low to High)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range:</label>
          <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
            <option value="all">All Prices</option>
            <option value="budget">Budget (&lt; $150)</option>
            <option value="mid">Mid-range ($150-$300)</option>
            <option value="luxury">Luxury ($300+)</option>
          </select>
        </div>
      </section>

      <section className="results-list">
        {sortedResults.length > 0 ? (
          sortedResults.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-image">
                <img src={result.image} alt={result.name} />
                <div className="discount-badge">{result.discount}</div>
                <button
                  className="favorite-btn"
                  onClick={() => console.log('Added to favorites')}
                >
                  ❤️
                </button>
              </div>

              <div className="result-content">
                <div className="result-header">
                  <h3>{result.name}</h3>
                  <div className="rating">
                    <span className="stars">⭐</span>
                    <span className="rating-value">{result.rating}</span>
                  </div>
                </div>

                <p className="location">📍 {result.location}</p>

                <div className="result-details">
                  <span className="price">
                    <strong>${result.price}</strong>/night
                  </span>
                  <span className="nights">
                    {result.nights > 1 ? `${result.nights} nights` : '1 night'}
                  </span>
                </div>

                <div className="amenities">
                  <span className="amenity">🏊 Pool</span>
                  <span className="amenity">🍽️ Restaurant</span>
                  <span className="amenity">🎰 Spa</span>
                </div>

                <button
                  className="select-btn"
                  onClick={() => onSelectBooking(result)}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No properties found matching your criteria</p>
          </div>
        )}
      </section>
    </div>
  );
}
