import { useState, useEffect } from 'react';
import { supabase, createSupportTicket, getAgentTickets } from '../lib/supabase';
import '../styles/EmergencySupportPage.css';

export default function EmergencySupportPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'booking_issue',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getAgentTickets(user.id);
      setTickets(data || []);
    } catch (err) {
      setError('Failed to load tickets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const ticket = await createSupportTicket(user.property_id, user.id, formData);

      if (ticket) {
        setSuccess('🚨 EMERGENCY TICKET CREATED - Duty manager notified immediately!');
        setFormData({ title: '', description: '', category: 'booking_issue', priority: 'normal' });
        setShowForm(false);
        loadTickets();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError('Failed to create ticket: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading support tickets...</div>;
  }

  return (
    <div className="emergency-support-container">
      <div className="emergency-header">
        <h2>🚨 24/7 Emergency Support</h2>
        <p>One-click escalation to duty manager</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!showForm ? (
        <button
          className="btn-emergency"
          onClick={() => setShowForm(true)}
        >
          🚨 EMERGENCY SUPPORT - CLICK HERE
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label>Issue Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief description of issue"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="booking_issue">Booking Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority Level *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              required
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">URGENT</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the issue..."
              rows="5"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? '⏳ Notifying duty manager...' : '✅ Submit Emergency Ticket'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="tickets-section">
        <h3>Your Support Tickets</h3>
        {tickets.length === 0 ? (
          <div className="empty-state">
            <p>No support tickets yet. Use emergency support when needed.</p>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className={`ticket-card status-${ticket.status}`}>
                <div className="ticket-header">
                  <h4>{ticket.title}</h4>
                  <span className={`status-badge priority-${ticket.priority}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <p className="ticket-category">{ticket.category.replace(/_/g, ' ')}</p>
                <p className="ticket-description">{ticket.description}</p>
                <span className="ticket-date">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="support-info">
        <h3>ℹ️ How It Works</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>🚨 Immediate Notification</h4>
            <p>Duty manager receives SMS + Email instantly</p>
          </div>
          <div className="info-card">
            <h4>⚡ Priority Response</h4>
            <p>URGENT tickets get 15-min response guarantee</p>
          </div>
          <div className="info-card">
            <h4>📱 24/7 Availability</h4>
            <p>Contact: sales@marameguarrasanctuary.com / +25414229870</p>
          </div>
        </div>
      </div>
    </div>
  );
}
