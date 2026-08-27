import { useState, useEffect } from 'react';
import './GuestApp.css';
import HomePage from './pages/guest/HomePage';
import SearchResultsPage from './pages/guest/SearchResultsPage';
import BookingDetailsPage from './pages/guest/BookingDetailsPage';
import WalletPage from './pages/guest/WalletPage';
import AccountPage from './pages/guest/AccountPage';
import GuestLoginPage from './pages/guest/GuestLoginPage';
import BottomNavigation from './components/BottomNavigation';
import NotificationCenter from './components/NotificationCenter';

export default function GuestApp({ onSwitchMode }) {
  const [guestUser, setGuestUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [membershipTier, setMembershipTier] = useState('member');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const savedGuest = localStorage.getItem('guestUser');
    const savedPoints = localStorage.getItem('loyaltyPoints');
    if (savedGuest) {
      setGuestUser(JSON.parse(savedGuest));
      setLoyaltyPoints(savedPoints ? parseInt(savedPoints) : 0);
    }
  }, []);

  const handleGuestLogin = (guestInfo) => {
    setGuestUser(guestInfo);
    localStorage.setItem('guestUser', JSON.stringify(guestInfo));
    localStorage.setItem('loyaltyPoints', '0');
    setCurrentPage('home');
  };

  const handleGuestLogout = () => {
    setGuestUser(null);
    localStorage.removeItem('guestUser');
    setCurrentPage('home');
  };

  const handleSearch = (searchParams) => {
    // Simulate search results
    const mockResults = [
      {
        id: 1,
        name: 'Luxury Beachfront Resort',
        location: 'Mombasa, Kenya',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
        price: 250,
        rating: 4.8,
        nights: searchParams.nights,
        discount: '20% OFF',
      },
      {
        id: 2,
        name: 'Mountain Retreat Lodge',
        location: 'Mount Kenya',
        image: 'https://images.unsplash.com/photo-1520646091314-8129babda0e0?w=400',
        price: 180,
        rating: 4.6,
        nights: searchParams.nights,
        discount: '15% OFF',
      },
      {
        id: 3,
        name: 'Safari Premium Camp',
        location: 'Maasai Mara, Kenya',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        price: 320,
        rating: 4.9,
        nights: searchParams.nights,
        discount: 'SAVE 25%',
      },
    ];
    setSearchResults(mockResults);
    setCurrentPage('search');
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setCurrentPage('bookingDetails');
  };

  const handleBookingConfirm = (booking) => {
    const pointsEarned = Math.floor(booking.price * 10);
    setLoyaltyPoints(loyaltyPoints + pointsEarned);
    localStorage.setItem('loyaltyPoints', (loyaltyPoints + pointsEarned).toString());

    const newNotification = {
      id: Date.now(),
      type: 'booking_confirmation',
      title: 'Booking Confirmed!',
      message: `Your reservation at ${booking.name} is confirmed. You earned ${pointsEarned} points!`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
    setUnreadCount(unreadCount + 1);
    setCurrentPage('home');
  };

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    setNotifications([newNotif, ...notifications]);
    setUnreadCount(unreadCount + 1);
  };

  if (!guestUser) {
    return <GuestLoginPage onLogin={handleGuestLogin} />;
  }

  return (
    <div className="guest-app">
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={(id) => {
          setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ));
          setUnreadCount(Math.max(0, unreadCount - 1));
        }}
      />

      <main className="guest-main">
        {currentPage === 'home' && (
          <HomePage
            onSearch={handleSearch}
            guestUser={guestUser}
            loyaltyPoints={loyaltyPoints}
            membershipTier={membershipTier}
          />
        )}
        {currentPage === 'search' && (
          <SearchResultsPage
            results={searchResults}
            onSelectBooking={handleSelectBooking}
          />
        )}
        {currentPage === 'bookingDetails' && selectedBooking && (
          <BookingDetailsPage
            booking={selectedBooking}
            onConfirm={handleBookingConfirm}
            onBack={() => setCurrentPage('search')}
          />
        )}
        {currentPage === 'wallet' && (
          <WalletPage
            loyaltyPoints={loyaltyPoints}
            membershipTier={membershipTier}
            guestUser={guestUser}
          />
        )}
        {currentPage === 'account' && (
          <AccountPage
            guestUser={guestUser}
            onLogout={handleGuestLogout}
          />
        )}
      </main>

      <BottomNavigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        unreadNotifications={unreadCount}
      />
    </div>
  );
}
