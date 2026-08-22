import { useState } from 'react';
import '../styles/AgentOnboarding.css';
import { api } from '../config/api.js';

export default function AgentOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    password: '',
    offerName: '',
    sellingPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.register({
        email: formData.email,
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ')[1] || '',
        company: formData.company,
        password: formData.password,
        agent_type: 'direct'
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setReferralCode(data.user.referral_code);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration failed:', err);
    }
    setLoading(false);
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const today = new Date();
      const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

      await api.createOffer({
        title: formData.offerName,
        base_price: 499.00,
        agent_selling_price: parseFloat(formData.sellingPrice),
        valid_from: today.toISOString().split('T')[0],
        valid_to: ninetyDaysLater.toISOString().split('T')[0]
      });

      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to create offer. Please try again.');
      console.error('Offer creation failed:', err);
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-container">
      {/* Step 1: Account Creation */}
      {step === 1 && (
        <div className="onboarding-card">
          <h2>🎯 Join the Agent Network</h2>
          <p>Create your account in 60 seconds</p>

          {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fadbd8', borderRadius: '6px' }}>{error}</div>}

          <form onSubmit={handleCreateAccount}>
            <div className="form-group">
              <label>Email (pre-filled from invite)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="agent@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="form-group">
              <label>Company (optional)</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Safari Elite Tours"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="info-box">
            <h4>✅ What You Get:</h4>
            <ul>
              <li>USD 499 base rate (protected)</li>
              <li>15% commission on every booking</li>
              <li>Sub-agent recruitment commission (3%)</li>
              <li>Payment within 30 days guaranteed</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Create First Offer */}
      {step === 2 && (
        <div className="onboarding-card">
          <h2>🎉 Create Your First Offer</h2>
          <p>Make your offer live in 2 minutes</p>

          <form onSubmit={handleCreateOffer}>
            <div className="form-group">
              <label>Offer Name</label>
              <input
                type="text"
                name="offerName"
                value={formData.offerName}
                onChange={handleInputChange}
                placeholder="e.g., Maasai Mara Adventure"
                required
              />
              <small>This appears on your booking page</small>
            </div>

            <div className="pricing-section">
              <div className="price-row">
                <div className="price-item">
                  <label>Base Rate (Lilita)</label>
                  <div className="price-display">USD 499.00</div>
                  <small>Protected rate (you buy at this)</small>
                </div>

                <div className="price-item">
                  <label>Your Selling Price</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="699"
                    min="500"
                    step="0.01"
                    required
                  />
                  <small>What you charge clients</small>
                </div>

                <div className="price-item">
                  <label>Your Margin</label>
                  <div className="price-display highlight">
                    USD {formData.sellingPrice ? (parseFloat(formData.sellingPrice) - 499).toFixed(2) : '0.00'}
                  </div>
                  <small>What you keep per booking</small>
                </div>
              </div>
            </div>

            <div className="terms-box">
              <h4>📋 Standard Terms</h4>
              <ul>
                <li>✓ 3-night luxury safari experience</li>
                <li>✓ Twice-daily game drives</li>
                <li>✓ All meals (standard beverages)</li>
                <li>✓ Airstrip transfers included</li>
                <li>✓ WiFi included</li>
                <li>✓ All taxes included</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Publishing...' : 'Publish Your Offer'}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Share & Start Earning */}
      {step === 3 && (
        <div className="onboarding-card success">
          <div className="success-icon">🎊</div>
          <h2>Your Offer is LIVE!</h2>
          <p>Start sharing and earning</p>

          <div className="referral-box">
            <h4>🔗 Your Referral Code</h4>
            <div className="code-display">
              {referralCode}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  alert('Copied to clipboard!');
                }}
                className="btn-copy"
              >
                Copy
              </button>
            </div>
            <small>Share this with friends to start your sub-agent network</small>
          </div>

          <div className="earning-preview">
            <h4>💰 Your First Month Potential</h4>
            <div className="earning-cards">
              <div className="card">
                <div className="label">If you get 5 bookings:</div>
                <div className="amount">USD 1,375</div>
                <div className="details">5 × USD 275 margin + commission</div>
              </div>

              <div className="card">
                <div className="label">If you recruit 2 agents:</div>
                <div className="amount">USD 412.50</div>
                <div className="details">3% commission on 50 bookings</div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Check out this safari offer I found: ${referralCode}`);
                alert('Share text copied! Paste in WhatsApp, email, or social media');
              }}
              className="btn-secondary"
            >
              📱 Share on WhatsApp
            </button>

            <button
              onClick={() => onComplete()}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>

          <div className="next-steps">
            <h4>📌 Next Steps</h4>
            <ol>
              <li>Share your offer code with 5 friends</li>
              <li>Invite agents to join your team (3% commission)</li>
              <li>Watch your earnings grow on the leaderboard</li>
              <li>Reach Silver tier (10 bookings) for better rates</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
