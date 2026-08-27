import './BottomNavigation.css';

export default function BottomNavigation({ currentPage, onNavigate, unreadNotifications }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'wallet', label: 'Wallet', icon: '💳' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <nav className="bottom-navigation">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.id === 'search' && unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
