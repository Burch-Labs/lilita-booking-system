import { useState, useEffect } from 'react';
import { api } from '../api';
import '../styles/CalendarView.css';

export default function CalendarView({ token, user, isAdmin = false }) {
  const [suites, setSuites] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuites();
  }, []);

  useEffect(() => {
    if (selectedSuite) {
      loadCalendar(selectedSuite);
    }
  }, [selectedSuite, currentMonth]);

  const loadSuites = async () => {
    try {
      const data = await api.getSuites();
      setSuites(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedSuite(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load suites:', err);
      setLoading(false);
    }
  };

  const loadCalendar = async (suiteId) => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      // In production, this would fetch from the API
      // For now, generate mock availability
      const mockAvailability = {};
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month - 1, i);
        const dayOfWeek = date.getDay();

        // Mock logic: some days available, some booked
        if (dayOfWeek === 6 || dayOfWeek === 0) {
          mockAvailability[i] = 'BOOKED';
        } else if (i % 3 === 0) {
          mockAvailability[i] = 'ON_HOLD';
        } else {
          mockAvailability[i] = 'AVAILABLE';
        }
      }

      setAvailability(mockAvailability);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  };

  const getDaysInMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDayClass = (day) => {
    const status = availability[day];
    return `calendar-day status-${status?.toLowerCase() || 'available'}`;
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-container">
      <h2>📆 Availability Calendar</h2>

      <div className="calendar-controls">
        <div className="suite-selector">
          <label>Select Suite:</label>
          <select
            value={selectedSuite || ''}
            onChange={(e) => setSelectedSuite(e.target.value)}
            className="suite-select"
          >
            {suites.map(suite => (
              <option key={suite.id} value={suite.id}>
                {suite.name} (${suite.base_price}/night)
              </option>
            ))}
          </select>
        </div>

        <div className="month-controls">
          <button className="btn-icon" onClick={prevMonth}>◀</button>
          <span className="month-display">{monthName}</span>
          <button className="btn-icon" onClick={nextMonth}>▶</button>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          Available
        </div>
        <div className="legend-item">
          <span className="legend-color on_hold"></span>
          On Hold
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          Booked
        </div>
      </div>

      <div className="calendar">
        <div className="calendar-header">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={day ? getDayClass(day) : 'calendar-day empty'}
            >
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  <span className="day-status">
                    {availability[day]?.charAt(0)}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-info">
        <h3>💡 Legend</h3>
        <ul>
          <li><strong>🟢 AVAILABLE:</strong> Suite is available for booking</li>
          <li><strong>🟡 ON_HOLD:</strong> Booking pending confirmation (48-hour hold)</li>
          <li><strong>🔴 BOOKED:</strong> Suite is fully booked or blocked</li>
        </ul>
      </div>

      {selectedSuite && (
        <div className="suite-details">
          <h3>Suite Information</h3>
          {suites
            .filter(s => s.id === selectedSuite)
            .map(suite => (
              <div key={suite.id} className="suite-info">
                <h4>{suite.name}</h4>
                <p>{suite.description}</p>
                <div className="info-grid">
                  <div>
                    <strong>Base Price:</strong> ${suite.base_price}/night
                  </div>
                  <div>
                    <strong>Max Guests:</strong> {suite.max_guests}
                  </div>
                  <div>
                    <strong>Amenities:</strong>
                    <div className="amenities-list">
                      {suite.amenities?.map((a, i) => (
                        <span key={i} className="amenity-tag">✓ {a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
