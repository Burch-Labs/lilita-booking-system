import { useState } from 'react';
import './GuestLoginPage.css';

export default function GuestLoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const guestInfo = {
      id: Date.now(),
      email,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || '',
      createdAt: new Date(),
    };

    onLogin(guestInfo);
  };

  return (
    <div className="guest-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏨 Mara Meguarra</h1>
          <p>Luxury Sanctuary Bookings</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="toggle-mode"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="demo-login">
          <p>Demo Login:</p>
          <button
            type="button"
            onClick={() => {
              setEmail('guest@mara.com');
              setPassword('demo123');
            }}
            className="demo-btn"
          >
            Load Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
