import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ token, user, page = 'overview' }) {
  const [dashData, setDashData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [page]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // In production, these would be actual admin endpoints
      // For now, we'll use existing endpoints with mock data
      const dashData = {
        total_revenue: 45230.50,
        total_bookings: 32,
        confirmed_bookings: 28,
        pending_bookings: 4,
        total_commissions_paid: 12340.50,
        active_agents: 18,
        occupancy_rate: 78
      };
      setDashData(dashData);

      // Mock data for bookings
      setBookings([
        {
          id: '1',
          booking_reference: 'LILITA-20260822-001',
          guest_name: 'John Smith',
          suite_name: 'Mara View Suite',
          check_in_date: '2026-09-01',
          check_out_date: '2026-09-05',
          status: 'CONFIRMED',
          total: 18000,
          agent_name: 'Sarah Johnson'
        },
        {
          id: '2',
          booking_reference: 'LILITA-20260822-002',
          guest_name: 'Emma Wilson',
          suite_name: 'Acacia Suite',
          check_in_date: '2026-09-10',
          check_out_date: '2026-09-14',
          status: 'ON_HOLD',
          total: 16800,
          agent_name: 'Mike Davis'
        },
        {
          id: '3',
          booking_reference: 'LILITA-20260822-003',
          guest_name: 'David Brown',
          suite_name: 'Savanna Lodge',
          check_in_date: '2026-09-15',
          check_out_date: '2026-09-20',
          status: 'CONFIRMED',
          total: 27500,
          agent_name: 'Sarah Johnson'
        }
      ]);

      setAgents([
        {
          id: '1',
          name: 'Sarah Johnson',
          company: 'Elite Travel Co',
          commission_rate: 0.15,
          total_bookings: 12,
          total_commission: 5420,
          status: 'ACTIVE'
        },
        {
          id: '2',
          name: 'Mike Davis',
          company: 'Global Journeys',
          commission_rate: 0.15,
          total_bookings: 8,
          total_commission: 3200,
          status: 'ACTIVE'
        },
        {
          id: '3',
          name: 'Lisa Anderson',
          company: 'Adventure Tours',
          commission_rate: 0.20,
          total_bookings: 5,
          total_commission: 2100,
          status: 'ACTIVE'
        }
      ]);

      setPayments([
        {
          id: '1',
          booking_reference: 'LILITA-20260822-001',
          amount: 18000,
          method: 'CARD',
          status: 'COMPLETED',
          date: '2026-08-20'
        },
        {
          id: '2',
          booking_reference: 'LILITA-20260822-003',
          amount: 27500,
          method: 'CARD',
          status: 'COMPLETED',
          date: '2026-08-21'
        },
        {
          id: '3',
          booking_reference: 'LILITA-20260822-002',
          amount: 16800,
          method: 'MPESA',
          status: 'PENDING',
          date: '2026-08-22'
        }
      ]);

      setLoading(false);
    } catch (err) {
      setError('Failed to load admin data: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    filter === 'all' || p.status === filter
  );

  return (
    <div className="admin-dashboard">
      {page === 'overview' && (
        <>
          <h2>🎯 Admin Dashboard</h2>

          <div className="admin-stats">
            <div className="stat-card">
              <h4>Total Revenue</h4>
              <p className="amount">${dashData?.total_revenue.toFixed(2)}</p>
              <span className="stat-meta">All bookings</span>
            </div>

            <div className="stat-card">
              <h4>Total Bookings</h4>
              <p className="amount">{dashData?.total_bookings}</p>
              <span className="stat-meta">{dashData?.confirmed_bookings} confirmed</span>
            </div>

            <div className="stat-card">
              <h4>Active Agents</h4>
              <p className="amount">{dashData?.active_agents}</p>
              <span className="stat-meta">Travel professionals</span>
            </div>

            <div className="stat-card">
              <h4>Occupancy Rate</h4>
              <p className="amount">{dashData?.occupancy_rate}%</p>
              <span className="stat-meta">Current</span>
            </div>

            <div className="stat-card">
              <h4>Commissions Paid</h4>
              <p className="amount">${dashData?.total_commissions_paid.toFixed(2)}</p>
              <span className="stat-meta">To agents</span>
            </div>

            <div className="stat-card">
              <h4>Pending Bookings</h4>
              <p className="amount">{dashData?.pending_bookings}</p>
              <span className="stat-meta">Need confirmation</span>
            </div>
          </div>

          <div className="recent-data">
            <div className="data-section">
              <h3>📋 Recent Bookings</h3>
              {bookings.slice(0, 3).map(b => (
                <div key={b.id} className="booking-card">
                  <span className="ref">{b.booking_reference}</span>
                  <span className="name">{b.guest_name}</span>
                  <span className={`status status-${b.status}`}>{b.status}</span>
                  <span className="amount">${b.total}</span>
                </div>
              ))}
            </div>

            <div className="data-section">
              <h3>👥 Top Agents</h3>
              {agents.slice(0, 3).map(a => (
                <div key={a.id} className="agent-card">
                  <span className="name">{a.name}</span>
                  <span className="bookings">{a.total_bookings} bookings</span>
                  <span className="commission">${a.total_commission}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page === 'bookings' && (
        <>
          <h2>📅 All Bookings</h2>

          <div className="controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input
              type="text"
              placeholder="Search by guest or booking ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="bookings-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest</th>
                  <th>Suite</th>
                  <th>Dates</th>
                  <th>Agent</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td className="ref">{b.booking_reference}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.suite_name}</td>
                    <td className="dates">
                      {new Date(b.check_in_date).toLocaleDateString()} - {new Date(b.check_out_date).toLocaleDateString()}
                    </td>
                    <td>{b.agent_name}</td>
                    <td className="amount">${b.total}</td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page === 'payments' && (
        <>
          <h2>💳 Payment Tracking</h2>

          <div className="controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="payments-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="ref">{p.booking_reference}</td>
                    <td className="amount">${p.amount.toFixed(2)}</td>
                    <td>{p.method}</td>
                    <td>
                      <span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page === 'agents' && (
        <>
          <h2>👥 Agent Management</h2>

          <div className="controls">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="agents-grid">
            {filteredAgents.map(a => (
              <div key={a.id} className="agent-card-large">
                <div className="agent-header">
                  <h4>{a.name}</h4>
                  <span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
                <p className="company">📍 {a.company}</p>
                <div className="agent-stats">
                  <div className="stat">
                    <span>Bookings</span>
                    <strong>{a.total_bookings}</strong>
                  </div>
                  <div className="stat">
                    <span>Commission Rate</span>
                    <strong>{(a.commission_rate * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="stat">
                    <span>Total Earned</span>
                    <strong>${a.total_commission.toFixed(2)}</strong>
                  </div>
                </div>
                <button className="btn-small">View Details</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
