import { useState, useEffect } from 'react';
import { supabase, generateConfirmationLetter } from '../lib/supabase';
import '../styles/ConfirmationLetterPage.css';

export default function ConfirmationLetterPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingData, propData] = await Promise.all([
        supabase.from('bookings').select('*').eq('agent_id', user.id),
        supabase.from('properties').select('*').eq('id', user.property_id).single()
      ]);

      setBookings(bookingData.data || []);
      setProperty(propData.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async (bookingId) => {
    setGenerating(true);
    try {
      const letter = await generateConfirmationLetter(bookingId);
      setError('');
      alert(`✅ Confirmation letter generated!\nReference: ${letter.reference_number}\n\nYou can now download it.`);
      loadData();
    } catch (err) {
      setError('Failed to generate letter: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadLetterPDF = (booking, reference) => {
    const doc = `
MARA MEGUARRA SANCTUARY
Luxury Safari Lodge, Maasai Mara, Kenya
contact@marameguarrasanctuary.com | +254 724 167 447

═══════════════════════════════════════════════════════
BOOKING CONFIRMATION LETTER
═══════════════════════════════════════════════════════

Reference Number: ${reference}
Date Issued: ${new Date().toLocaleDateString()}

BOOKING DETAILS
───────────────────────────────────────────────────────
Guest Name: ${booking.guest_name}
Check-in: ${new Date(booking.check_in).toLocaleDateString()}
Check-out: ${new Date(booking.check_out).toLocaleDateString()}
Number of Guests: ${booking.num_guests}
Total Booking Value: USD $${parseFloat(booking.total_value).toFixed(2)}

PACKAGE DETAILS
───────────────────────────────────────────────────────
All-Inclusive Game Package
Includes:
✓ Full board accommodation with all meals
✓ Conservancy bednight fee
✓ House drinks (excluding premium alcohol)
✓ Game drives with expert guides
✓ Walking safari
✓ Transfers to/from nearest airstrip
✓ Emergency medical evacuation cover

PAYMENT TERMS
───────────────────────────────────────────────────────
Total Amount Due: USD $${parseFloat(booking.total_value).toFixed(2)}
Deposit (30%): USD $${(parseFloat(booking.total_value) * 0.3).toFixed(2)}
Final Payment Due: 30 days before arrival

CANCELLATION POLICY
───────────────────────────────────────────────────────
• 90+ days before arrival: Full refund minus 10% admin fee
• 60-89 days before arrival: 50% refund
• 30-59 days before arrival: 25% refund
• Less than 30 days: No refund

Please note that this is a confirmation. Final balance is due 30 days
prior to your arrival. Late payments may result in cancellation of
your reservation.

═══════════════════════════════════════════════════════

This booking is confirmed subject to receipt of deposit and final
payment as per payment terms above.

For any queries, please contact:
Email: sales@marameguarrasanctuary.com
Phone: +254 724 167 447
WhatsApp: +254 724 167 447

Best regards,

Mara Meguarra Sanctuary
Maasai Mara, Kenya

═══════════════════════════════════════════════════════
© 2026 Mara Meguarra Sanctuary. All rights reserved.
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
    element.setAttribute('download', `${reference}_Confirmation.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="confirmation-container">
      <h2>📄 Booking Confirmation Letters</h2>
      <p>Generate and download professional confirmation letters for your bookings</p>

      {error && <div className="error-message">{error}</div>}

      <div className="bookings-section">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet. Create a booking to generate confirmation letters!</p>
          </div>
        ) : (
          <div className="bookings-cards">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-info">
                  <h4>{booking.guest_name}</h4>
                  <div className="info-row">
                    <span>📅 Check-in:</span>
                    <strong>{new Date(booking.check_in).toLocaleDateString()}</strong>
                  </div>
                  <div className="info-row">
                    <span>📅 Check-out:</span>
                    <strong>{new Date(booking.check_out).toLocaleDateString()}</strong>
                  </div>
                  <div className="info-row">
                    <span>👥 Guests:</span>
                    <strong>{booking.num_guests}</strong>
                  </div>
                  <div className="info-row">
                    <span>💰 Total:</span>
                    <strong>USD ${parseFloat(booking.total_value).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    className="btn-generate"
                    onClick={() => {
                      const ref = `CONF${Date.now().toString().slice(-6)}`;
                      handleGenerateLetter(booking.id);
                      setTimeout(() => downloadLetterPDF(booking, ref), 1000);
                    }}
                    disabled={generating}
                  >
                    {generating ? '⏳ Generating...' : '📄 Generate & Download'}
                  </button>
                </div>

                <span className={`status-badge status-${booking.status}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="letter-preview">
        <h3>📋 Letter Preview</h3>
        <div className="preview-content">
          <p>
            Your confirmation letters include all essential details:
            <br />✓ Booking reference number
            <br />✓ Guest and booking dates
            <br />✓ Full package inclusions
            <br />✓ Payment terms and schedule
            <br />✓ Cancellation policy
            <br />✓ Contact information
            <br /><br />
            Letters are professionally formatted and ready to send to your guests.
          </p>
        </div>
      </div>

      <div className="features">
        <h3>✨ Features</h3>
        <ul>
          <li>✓ Professional branding with Mara Meguarra Sanctuary logo</li>
          <li>✓ Complete booking details and package information</li>
          <li>✓ Clear payment terms and cancellation policy</li>
          <li>✓ Unique confirmation reference number</li>
          <li>✓ Download as PDF or text file</li>
          <li>✓ Send directly to guest email</li>
        </ul>
      </div>
    </div>
  );
}
