import { useState, useEffect } from 'react';
import '../styles/AgentDashboard.css';
import { authApi, api } from '../config/api.js';

export default function AgentDashboard({ user, token }) {
  const [activeTab, setActiveTab] = useState('earnings');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayout: 0,
    leaderboardRank: 0,
    bookings: 0,
    subAgents: 0,
    rating: 4.9,
  });

  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [missions, setMissions] = useState([
    { id: 1, title: 'Create Offer', completed: true, reward: 50, icon: '✓' },
    { id: 2, title: 'Share on Social', progress: 1, total: 3, reward: 25, icon: '📱' },
    { id: 3, title: 'Get First Booking', reward: 100, icon: '⏳' },
    { id: 4, title: 'Invite 5 Agents', reward: 300, icon: '⏳' },
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load user metrics
        const metricsData = await api.getAgentMetrics(user?.id);
        if (metricsData) {
          setStats({
            totalEarnings: metricsData.agent?.total_earnings || 0,
            thisMonthEarnings: metricsData.thisMonth?.earnings || 0,
            pendingPayout: 0, // Calculate from payouts
            leaderboardRank: metricsData.thisMonth?.leaderboard_rank || 'N/A',
            bookings: metricsData.agent?.total_bookings || 0,
            subAgents: metricsData.agent?.sub_agents_count || 0,
            rating: metricsData.agent?.rating || 4.9,
          });
        }

        // Load referrals
        const referralsData = await authApi.getReferrals();
        if (referralsData && Array.isArray(referralsData)) {
          setReferrals(referralsData);
        }

        // Load leaderboard
        const leaderboardData = await api.getLeaderboard();
        if (leaderboardData?.leaders) {
          setLeaderboard(leaderboardData.leaders);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  return (
    <div className="agent-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.first_name}! 🎉</h1>
          <p>Your agent network dashboard</p>
        </div>
        <div className="tier-badge">
          <span className="tier-level">🥉 Bronze Tier</span>
          <span className="rank">#47 on Leaderboard</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">💰 This Month</div>
          <div className="stat-amount">USD {stats.thisMonthEarnings.toFixed(2)}</div>
          <div className="stat-detail">↑ 8% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">💎 Total Earned</div>
          <div className="stat-amount">USD {stats.totalEarnings.toFixed(2)}</div>
          <div className="stat-detail">Lifetime earnings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">⏳ Pending Payout</div>
          <div className="stat-amount">USD {stats.pendingPayout.toFixed(2)}</div>
          <div className="stat-detail">Paid within 30 days</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">📊 Your Bookings</div>
          <div className="stat-amount">{stats.bookings}</div>
          <div className="stat-detail">8 more to hit Silver tier</div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      <div className="tier-progress">
        <h3>🎯 Progress to Silver Tier</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '60%' }}></div>
        </div>
        <div className="progress-info">
          <span>12 of 20 bookings needed</span>
          <span className="reward">+Better rates • +Higher commission • +Perks</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings
        </button>
        <button
          className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          👥 Referrals ({stats.subAgents})
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          🎁 Missions
        </button>
      </div>

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="tab-content">
          <h2>Your Earnings Breakdown</h2>

          <div className="earnings-breakdown">
            <div className="earning-item">
              <div className="earning-header">
                <span className="label">Direct Bookings</span>
                <span className="icon">📌</span>
              </div>
              <div className="earning-amount">12 bookings × USD 275 = USD 3,300</div>
              <div className="earning-detail">Commission: 15% included</div>
            </div>

            <div className="earning-item">
              <div className="earning-header">
                <span className="label">Sub-Agent Commission</span>
                <span className="icon">👥</span>
              </div>
              <div className="earning-amount">2 agents × 3% = USD 412.50</div>
              <div className="earning-detail">From Ahmed (5 books) + Sophia (3 books)</div>
            </div>

            <div className="earning-item">
              <div className="earning-header">
                <span className="label">Performance Bonuses</span>
                <span className="icon">🎊</span>
              </div>
              <div className="earning-amount">USD 135.00</div>
              <div className="earning-detail">First booking bonus + milestone rewards</div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary">📊 View Detailed Report</button>
            <button className="btn-secondary">💳 Request Payout</button>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="tab-content">
          <div className="referral-header">
            <h2>Your Sub-Agents</h2>
            <p>Earn 3% commission on every booking they make</p>
          </div>

          {referrals.map(referral => (
            <div key={referral.id} className="referral-card">
              <div className="referral-info">
                <div className="name">{referral.name}</div>
                <div className="status">{referral.status}</div>
              </div>
              <div className="referral-stats">
                <div className="stat">
                  <span className="label">Bookings</span>
                  <span className="value">{referral.bookings}</span>
                </div>
                <div className="stat">
                  <span className="label">Their Earnings</span>
                  <span className="value">USD {referral.earnings}</span>
                </div>
                <div className="stat">
                  <span className="label">Your Commission</span>
                  <span className="value highlight">USD {(referral.earnings * 0.03).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="invite-section">
            <h3>🔗 Invite More Agents</h3>
            <div className="referral-code">
              <input type="text" value="AGENT_JOHN_SMITH_2024" readOnly />
              <button
                onClick={() => {
                  navigator.clipboard.writeText('AGENT_JOHN_SMITH_2024');
                  alert('Copied to clipboard!');
                }}
                className="btn-copy"
              >
                Copy Link
              </button>
            </div>
            <p>Share this code with friends. You get USD 50 per signup + 3% on their bookings!</p>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="tab-content">
          <h2>Monthly Leaderboard</h2>
          <p className="leaderboard-subtitle">Top agents this month. Compete to win prizes!</p>

          <div className="leaderboard">
            {leaderboard.map(agent => (
              <div key={agent.rank} className={`leaderboard-row ${agent.rank <= 3 ? 'top-performer' : ''}`}>
                <div className="rank">
                  {agent.rank === 1 && '🥇'}
                  {agent.rank === 2 && '🥈'}
                  {agent.rank === 3 && '🥉'}
                  {agent.rank > 3 && `#${agent.rank}`}
                </div>
                <div className="agent-info">
                  <div className="name">{agent.name}</div>
                  <div className="company">{agent.company}</div>
                </div>
                <div className="stats">
                  <div className="stat-box">
                    <span className="label">Bookings</span>
                    <span className="value">{agent.bookings}</span>
                  </div>
                  <div className="stat-box">
                    <span className="label">Earnings</span>
                    <span className="value">USD {agent.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="prize-info">
            <h4>🎁 Monthly Prizes</h4>
            <ul>
              <li>🥇 #1 = USD 5,000</li>
              <li>🥈 #2 = USD 3,000</li>
              <li>🥉 #3 = USD 1,500</li>
            </ul>
          </div>
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="tab-content">
          <h2>Complete Your Missions 🎯</h2>

          {missions.map(mission => (
            <div key={mission.id} className={`mission-card ${mission.completed ? 'completed' : ''}`}>
              <div className="mission-icon">{mission.icon}</div>
              <div className="mission-info">
                <div className="mission-name">{mission.title}</div>
                {mission.progress && (
                  <div className="progress-mini">
                    <div className="progress-bar-mini">
                      <div
                        className="progress-fill-mini"
                        style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                      ></div>
                    </div>
                    <span>{mission.progress} of {mission.total}</span>
                  </div>
                )}
                {mission.completed && <div className="completed-badge">✓ COMPLETED</div>}
              </div>
              <div className="mission-reward">
                +USD {mission.reward}
              </div>
            </div>
          ))}

          <div className="bonus-info">
            <h3>💡 Pro Tip</h3>
            <p>Complete all missions this month to earn an extra USD 475 bonus!</p>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="quick-actions">
        <button className="action-btn">📱 Share on Social</button>
        <button className="action-btn">✉️ Email Friends</button>
        <button className="action-btn">🎯 Create New Offer</button>
      </div>
    </div>
  );
}
