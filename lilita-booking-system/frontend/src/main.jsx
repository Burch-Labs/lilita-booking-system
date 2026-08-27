import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GuestApp from './GuestApp.jsx'

function Root() {
  const [userType, setUserType] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);

  useEffect(() => {
    const savedUserType = localStorage.getItem('userType');
    if (savedUserType) {
      setUserType(savedUserType);
      setShowTypeSelector(false);
    }
  }, []);

  const handleSelectUserType = (type) => {
    localStorage.setItem('userType', type);
    setUserType(type);
    setShowTypeSelector(false);
  };

  const handleSwitchMode = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestUser');
    setUserType(null);
    setShowTypeSelector(true);
  };

  if (showTypeSelector) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>🏨 Mara Meguarra Sanctuary</h1>
          <p style={styles.subtitle}>Select your login type</p>

          <div style={styles.buttonGroup}>
            <button
              style={styles.agentButton}
              onClick={() => handleSelectUserType('agent')}
            >
              👔 Travel Agent Portal
            </button>
            <button
              style={styles.guestButton}
              onClick={() => handleSelectUserType('guest')}
            >
              🧳 Guest Booking App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return userType === 'guest' ? (
    <GuestApp onSwitchMode={handleSwitchMode} />
  ) : (
    <App onSwitchMode={handleSwitchMode} />
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px 30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    margin: '0 0 8px 0',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 30px 0',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  agentButton: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  guestButton: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B9D 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
