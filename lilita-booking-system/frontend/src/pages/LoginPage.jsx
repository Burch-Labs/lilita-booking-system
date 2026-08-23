import { useState } from 'react';
import { api } from '../api';
import '../styles/LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.agentLogin(email, password);
      if (result.token) {
        onLogin(result.token, result.user);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.agentRegister(email, password, firstName, lastName, company);
      if (result.token) {
        onLogin(result.token, result.user);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="property-info">
        <div className="property-header">
          <a href="https://lilitakeper.com/" target="_blank" rel="noopener noreferrer" className="logo-link">
            <img src="/logo.avif" alt="Lilita Keper Logo" className="property-logo" />
          </a>
          <h2>Lilita Keper</h2>
          <p className="location">Enonkishu Conservancy</p>
        </div>
        <div className="property-details">
          <p className="tagline">A safari experience like no other</p>
          <p className="description">
            Intimate, exclusive and connected to the landscape. With just 5 tented suites in the heart of the Maasai Mara ecosystem.
          </p>
          <div className="property-highlights">
            <div className="highlight">
              <span className="label">Suites</span>
              <span className="value">6</span>
            </div>
            <div className="highlight">
              <span className="label">Destination</span>
              <span className="value">Year-round</span>
            </div>
            <div className="highlight">
              <span className="label">Game Viewing</span>
              <span className="value">24/7</span>
            </div>
          </div>
          <div className="amenities">
            <h4>What's Included:</h4>
            <ul>
              <li>✓ Full board accommodation with all meals</li>
              <li>✓ Conservancy bednight fee</li>
              <li>✓ House drinks (excluding premium alcohol)</li>
              <li>✓ Game drives with expert guides</li>
              <li>✓ Walking safari</li>
              <li>✓ Transfers to/from nearest airstrip</li>
              <li>✓ Emergency medical evacuation cover</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="login-box">
        <div className="login-header">
          <h1>🏨 Lilita Keper</h1>
          <p>Luxury Safari Lodge Booking System</p>
          <p className="subtitle">Travel Agent Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-toggle">
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="link-btn"
              >
                Create one
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your Travel Agency"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating account...' : 'Register'}
            </button>

            <div className="auth-toggle">
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="link-btn"
              >
                Login here
              </button>
            </div>
          </form>
        )}

        <div className="login-features">
          <h3>✨ Agent Portal Features:</h3>
          <ul>
            <li>📅 Live calendar availability</li>
            <li>🎯 One-click bookings</li>
            <li>💰 Real-time commission tracking</li>
            <li>📊 Booking dashboard</li>
            <li>🔐 Secure payment processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
