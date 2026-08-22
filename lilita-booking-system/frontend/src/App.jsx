import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BookingForm from './pages/BookingForm';
import CommissionsPage from './pages/CommissionsPage';
import AdminDashboard from './pages/AdminDashboard';
import CalendarView from './pages/CalendarView';
import OffersPage from './pages/OffersPage';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('agent'); // 'agent' or 'admin'
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (token, userInfo, role = 'agent') => {
    setToken(token);
    setUser(userInfo);
    setUserRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('userRole', role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🏨 Lilita Keper</h1>
          <p className="tagline">{userRole === 'admin' ? 'Admin Panel' : 'Agent Portal'}</p>
        </div>

        <div className="navbar-menu">
          <button
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>

          {userRole === 'agent' && (
            <>
              <button
                className={`nav-btn ${currentPage === 'booking' ? 'active' : ''}`}
                onClick={() => setCurrentPage('booking')}
              >
                📅 New Booking
              </button>
              <button
                className={`nav-btn ${currentPage === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentPage('calendar')}
              >
                📆 Calendar
              </button>
              <button
                className={`nav-btn ${currentPage === 'commissions' ? 'active' : ''}`}
                onClick={() => setCurrentPage('commissions')}
              >
                💰 Commissions
              </button>
              <button
                className={`nav-btn ${currentPage === 'offers' ? 'active' : ''}`}
                onClick={() => setCurrentPage('offers')}
              >
                🎉 Offers
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <button
                className={`nav-btn ${currentPage === 'bookings' ? 'active' : ''}`}
                onClick={() => setCurrentPage('bookings')}
              >
                📅 All Bookings
              </button>
              <button
                className={`nav-btn ${currentPage === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentPage('calendar')}
              >
                📆 Calendar
              </button>
              <button
                className={`nav-btn ${currentPage === 'payments' ? 'active' : ''}`}
                onClick={() => setCurrentPage('payments')}
              >
                💳 Payments
              </button>
              <button
                className={`nav-btn ${currentPage === 'agents' ? 'active' : ''}`}
                onClick={() => setCurrentPage('agents')}
              >
                👥 Agents
              </button>
              <button
                className={`nav-btn ${currentPage === 'offers' ? 'active' : ''}`}
                onClick={() => setCurrentPage('offers')}
              >
                🎉 Offers
              </button>
            </>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.first_name} {user?.last_name}</span>
          <span className="user-company">{user?.company}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {userRole === 'agent' && currentPage === 'dashboard' && <Dashboard token={token} user={user} />}
        {userRole === 'agent' && currentPage === 'booking' && <BookingForm token={token} user={user} />}
        {userRole === 'agent' && currentPage === 'calendar' && <CalendarView token={token} user={user} />}
        {userRole === 'agent' && currentPage === 'commissions' && <CommissionsPage token={token} user={user} />}
        {userRole === 'agent' && currentPage === 'offers' && <OffersPage token={token} user={user} />}

        {userRole === 'admin' && currentPage === 'dashboard' && <AdminDashboard token={token} user={user} />}
        {userRole === 'admin' && currentPage === 'bookings' && <AdminDashboard token={token} user={user} page="bookings" />}
        {userRole === 'admin' && currentPage === 'payments' && <AdminDashboard token={token} user={user} page="payments" />}
        {userRole === 'admin' && currentPage === 'agents' && <AdminDashboard token={token} user={user} page="agents" />}
        {userRole === 'admin' && currentPage === 'calendar' && <CalendarView token={token} user={user} isAdmin={true} />}
        {userRole === 'admin' && currentPage === 'offers' && <OffersPage token={token} user={user} />}
      </main>

      <footer className="footer">
        <p>© 2026 Lilita Keper Lodge - Maasai Mara, Kenya</p>
      </footer>
    </div>
  );
}
