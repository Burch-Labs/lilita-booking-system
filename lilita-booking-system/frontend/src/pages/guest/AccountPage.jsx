import { useState } from 'react';
import './AccountPage.css';

export default function AccountPage({ guestUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: guestUser?.firstName || '',
    lastName: guestUser?.lastName || '',
    email: guestUser?.email || '',
    phone: '',
    country: 'Kenya',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailOffers: true,
    smsUpdates: false,
    newsletter: true,
  });

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handlePreferenceChange = (field) => {
    setPreferences({ ...preferences, [field]: !preferences[field] });
  };

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <h2>👤 Account</h2>
      </header>

      <div className="account-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Support
        </button>
      </div>

      {activeTab === 'profile' && (
        <section className="tab-content profile-tab">
          <div className="avatar-section">
            <div className="avatar">👤</div>
            <button className="change-avatar-btn">Change Avatar</button>
          </div>

          <form className="profile-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={profileData.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                value={profileData.country}
                onChange={(e) => handleProfileChange('country', e.target.value)}
              >
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>

            <button type="button" className="save-btn" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </form>
        </section>
      )}

      {activeTab === 'preferences' && (
        <section className="tab-content preferences-tab">
          <h3>Notification Preferences</h3>

          <div className="preference-item">
            <div className="preference-info">
              <h4>Push Notifications</h4>
              <p>Receive booking updates & special offers</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={() => handlePreferenceChange('notifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h4>Email Offers</h4>
              <p>Receive promotional emails & special deals</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.emailOffers}
                onChange={() => handlePreferenceChange('emailOffers')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h4>SMS Updates</h4>
              <p>Get booking confirmations via SMS</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.smsUpdates}
                onChange={() => handlePreferenceChange('smsUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h4>Newsletter</h4>
              <p>Stay updated with travel tips & destinations</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={() => handlePreferenceChange('newsletter')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>
      )}

      {activeTab === 'security' && (
        <section className="tab-content security-tab">
          <div className="security-section">
            <h3>Password & Security</h3>

            <div className="security-item">
              <div className="security-info">
                <h4>Change Password</h4>
                <p>Update your login password</p>
              </div>
              <button className="security-btn">Change</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security</p>
              </div>
              <button className="security-btn">Enable</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Connected Devices</h4>
                <p>Manage your active sessions</p>
              </div>
              <button className="security-btn">View All</button>
            </div>
          </div>

          <div className="security-section">
            <h3>Payment Methods</h3>

            <div className="payment-method">
              <div className="method-icon">💳</div>
              <div className="method-info">
                <p className="method-type">Visa Card</p>
                <p className="method-detail">**** **** **** 4242</p>
              </div>
              <button className="method-action">Remove</button>
            </div>

            <button className="add-payment-btn">+ Add Payment Method</button>
          </div>
        </section>
      )}

      {activeTab === 'support' && (
        <section className="tab-content support-tab">
          <h3>Help & Support</h3>

          <div className="support-section">
            <div className="support-item">
              <span className="support-icon">❓</span>
              <div className="support-content">
                <h4>FAQ</h4>
                <p>Find answers to common questions</p>
              </div>
              <span className="arrow">→</span>
            </div>

            <div className="support-item">
              <span className="support-icon">💬</span>
              <div className="support-content">
                <h4>Live Chat</h4>
                <p>Chat with our support team</p>
              </div>
              <span className="arrow">→</span>
            </div>

            <div className="support-item">
              <span className="support-icon">📧</span>
              <div className="support-content">
                <h4>Email Support</h4>
                <p>support@mara.com</p>
              </div>
              <span className="arrow">→</span>
            </div>

            <div className="support-item">
              <span className="support-icon">📱</span>
              <div className="support-content">
                <h4>Call Us</h4>
                <p>+254 (0) 700 123 456</p>
              </div>
              <span className="arrow">→</span>
            </div>
          </div>

          <div className="support-section">
            <h3>About</h3>
            <p className="about-text">
              Mara Meguarra Sanctuary - Your gateway to luxury accommodations across East Africa.
            </p>
            <p className="version-text">Version 1.0.0</p>
          </div>
        </section>
      )}

      <footer className="account-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Log Out
        </button>
      </footer>
    </div>
  );
}
