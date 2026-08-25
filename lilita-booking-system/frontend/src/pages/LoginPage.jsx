import { useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user && data.session) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (agentData) {
          onLogin(data.session.access_token, agentData);
        }
      }
    } catch (err) {
      setError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData?.user?.id) {
        setError('Signup failed: Unable to create user account. Please try again.');
        return;
      }

      // Get or create the default property (Mara Meguarra Sanctuary)
      let { data: propertyData, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('name', 'Mara Meguarra Sanctuary')
        .single();

      // If property doesn't exist, create it
      if (!propertyData?.id) {
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([{
            name: 'Mara Meguarra Sanctuary',
            location: 'Kenya',
            description: 'Exclusive wildlife sanctuary with premium accommodations',
            brand_color_primary: '#8B4513',
            brand_color_secondary: '#D4A574',
          }])
          .select('id')
          .single();

        if (createError || !newProperty?.id) {
          setError('Unable to setup property. Please contact admin.');
          return;
        }
        propertyData = newProperty;
      }

      const { error: insertError } = await supabase
        .from('agents')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            company,
            password_hash: 'auth-user',
            status: 'active',
            property_id: propertyData.id,
          },
        ]);

      if (insertError) {
        setError('Failed to create agent record: ' + insertError.message);
        return;
      }

      setMode('login');
      setError('Account created! Please log in.');
    } catch (err) {
      setError('Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Mara Meguarra Sanctuary Agent Portal</h1>
          <p className="powered-by">powered by Burch</p>
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
