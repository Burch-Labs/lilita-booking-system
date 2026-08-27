import './WalletPage.css';

export default function WalletPage({ loyaltyPoints, membershipTier, guestUser }) {
  const tierBenefits = {
    member: {
      name: 'Member',
      color: '#4A90E2',
      benefits: [
        '5% discount on all bookings',
        'Free cancellation',
        'Points on every stay',
      ],
      nextTier: 'Silver',
      pointsToNext: 500,
    },
    silver: {
      name: 'Silver',
      color: '#C0C0C0',
      benefits: [
        '10% discount on all bookings',
        'Free room upgrades',
        'Late checkout (2pm)',
        'Free breakfast',
      ],
      nextTier: 'Gold',
      pointsToNext: 1000,
    },
    gold: {
      name: 'Gold',
      color: '#FFD700',
      benefits: [
        '15% discount on all bookings',
        'Guaranteed room upgrades',
        'Late checkout (3pm)',
        'Complimentary breakfast & drinks',
        'Priority customer support',
      ],
      nextTier: 'Platinum',
      pointsToNext: 2000,
    },
    platinum: {
      name: 'Platinum',
      color: '#E5E4E2',
      benefits: [
        '20% discount on all bookings',
        'Suite upgrade guaranteed',
        'Late checkout (4pm)',
        'All-inclusive amenities',
        'Personal concierge service',
        'Annual anniversary gift',
      ],
      nextTier: null,
      pointsToNext: 0,
    },
  };

  const currentTierInfo = tierBenefits[membershipTier] || tierBenefits.member;
  const progressPercentage = Math.min(100, (loyaltyPoints / (loyaltyPoints + currentTierInfo.pointsToNext)) * 100);

  const recentTransactions = [
    {
      id: 1,
      type: 'earn',
      description: 'Booking at Luxury Beachfront Resort',
      points: 2500,
      date: '2 days ago',
    },
    {
      id: 2,
      type: 'earn',
      description: 'Booking at Mountain Retreat Lodge',
      points: 1800,
      date: '7 days ago',
    },
    {
      id: 3,
      type: 'redeem',
      description: 'Room upgrade discount',
      points: -500,
      date: '15 days ago',
    },
  ];

  return (
    <div className="wallet-page">
      <header className="wallet-header">
        <h2>💳 Loyalty Wallet</h2>
      </header>

      <section className="loyalty-card">
        <div className="card-top">
          <div className="member-name">
            <p className="small-text">Member Name</p>
            <h3>{guestUser?.firstName} {guestUser?.lastName}</h3>
          </div>
          <div className="member-number">
            <p className="small-text">Member ID</p>
            <p className="card-id">{String(guestUser?.id).slice(-6)}</p>
          </div>
        </div>

        <div className="card-bottom">
          <div className="points-display">
            <p className="points-label">Available Points</p>
            <h2 className="points-amount">{loyaltyPoints.toLocaleString()}</h2>
          </div>
          <div className="tier-badge" style={{ backgroundColor: currentTierInfo.color }}>
            {currentTierInfo.name}
          </div>
        </div>
      </section>

      <section className="tier-progress">
        <div className="tier-header">
          <h3>Progress to {currentTierInfo.nextTier || 'Max Tier'}</h3>
          {currentTierInfo.nextTier && (
            <span className="points-needed">
              {currentTierInfo.pointsToNext} points needed
            </span>
          )}
        </div>
        {currentTierInfo.nextTier && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        )}
        {!currentTierInfo.nextTier && (
          <p className="max-tier-message">🌟 You've reached the maximum tier!</p>
        )}
      </section>

      <section className="tier-benefits">
        <h3>Your Benefits</h3>
        <div className="benefits-list">
          {currentTierInfo.benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="redeem-section">
        <h3>Redeem Points</h3>
        <div className="redeem-options">
          <div className="redeem-card">
            <span className="redeem-icon">🎁</span>
            <h4>Room Upgrade</h4>
            <p>500 points</p>
            <button>Redeem</button>
          </div>
          <div className="redeem-card">
            <span className="redeem-icon">🍽️</span>
            <h4>Dining Credit</h4>
            <p>300 points</p>
            <button>Redeem</button>
          </div>
          <div className="redeem-card">
            <span className="redeem-icon">🎰</span>
            <h4>Spa Treatment</h4>
            <p>400 points</p>
            <button>Redeem</button>
          </div>
          <div className="redeem-card">
            <span className="redeem-icon">⏰</span>
            <h4>Late Checkout</h4>
            <p>200 points</p>
            <button>Redeem</button>
          </div>
        </div>
      </section>

      <section className="transactions">
        <h3>Recent Activity</h3>
        <div className="transaction-list">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <p className="transaction-description">{transaction.description}</p>
                <p className="transaction-date">{transaction.date}</p>
              </div>
              <div className={`transaction-points ${transaction.type}`}>
                {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h3>How Points Work</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>Earn</h4>
            <p>Get 10 points per $1 spent on bookings</p>
          </div>
          <div className="info-card">
            <h4>Level Up</h4>
            <p>Reach higher tiers for exclusive benefits</p>
          </div>
          <div className="info-card">
            <h4>Redeem</h4>
            <p>Use points for upgrades, amenities & more</p>
          </div>
        </div>
      </section>
    </div>
  );
}
