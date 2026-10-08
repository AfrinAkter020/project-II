import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Events = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [actionError, setActionError] = useState('');
  const [attendanceBusy, setAttendanceBusy] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editImageFile) {
      setEditImagePreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(editImageFile);
    setEditImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [editImageFile]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/events/`, { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || 'Could not load events.');
        }
        return data;
      })
      .then(setEvents)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const canManage = (event) => currentUser && (currentUser.is_admin || currentUser.is_superuser || event.organizer?.id === currentUser.id);
  const upcomingEvents = events.filter((event) => !event.is_past);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEvents = upcomingEvents.filter((event) => (
    [event.title, event.description, event.category?.name, event.location]
      .some((value) => value?.toLowerCase().includes(normalizedSearch))
  ));
  const eventsByDate = filteredEvents.reduce((grouped, event) => {
    grouped[event.date] = [...(grouped[event.date] || []), event];
    return grouped;
  }, {});
  const calendarStartOffset = (calendarMonth.getDay() + 6) % 7;
  const daysInCalendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells = [
    ...Array(calendarStartOffset).fill(null),
    ...Array.from({ length: daysInCalendarMonth }, (_, index) => index + 1),
  ];
  const selectedDayEvents = eventsByDate[selectedDate] || [];

  const changeCalendarMonth = (monthOffset) => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + monthOffset, 1);
    const selectedDay = Number(selectedDate.slice(-2));
    const nextMonthLastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    setCalendarMonth(nextMonth);
    setSelectedDate(toDateKey(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(selectedDay, nextMonthLastDay))));
  };

  const startEditing = (event) => {
    setActionError('');
    setEditImageFile(null);
    setEditingEvent(event.id);
    setEditForm({
      title: event.title,
      description: event.description,
      category_id: event.category?.id || '',
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      requires_registration: event.requires_registration,
    });
  };

  const getCsrfToken = async () => {
    const response = await fetch(`${API_BASE_URL}/csrf-token/`, { credentials: 'include' });
    const data = await response.json();
    return data.csrfToken;
  };

  const updateEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    try {
      const csrfToken = await getCsrfToken();
      const payload = new FormData();
      Object.entries({
        ...editForm,
        category_id: Number(editForm.category_id),
        capacity: Number(editForm.capacity),
      }).forEach(([key, value]) => payload.append(key, value));
      if (editImageFile) payload.append('image', editImageFile);

      const response = await fetch(`${API_BASE_URL}/events/${editingEvent}/`, {
        method: 'PUT',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
        body: payload,
      });
      const updatedEvent = await response.json();
      if (!response.ok) throw new Error(updatedEvent.error || 'Could not update event.');
      setEvents((currentEvents) => currentEvents.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
      setEditingEvent(null);
      setEditForm(null);
      setEditImageFile(null);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    setActionError('');
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not delete event.');
      }
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const toggleAttendance = async (event) => {
    setActionError('');
    setAttendanceBusy(event.id);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/attendance/`, {
        method: event.is_attending ? 'DELETE' : 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update event attendance.');
      setEvents((currentEvents) => currentEvents.map((currentEvent) => (
        currentEvent.id === event.id ? { ...currentEvent, ...data } : currentEvent
      )));
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setAttendanceBusy(null);
    }
  };

  return (
    <div className="events-home">
      <section className="events-hero">
        <img
          className="events-hero-image"
          src="/images/Screenshot%202026-05-17%20224234.png"
          alt="Students walking through a university campus"
        />
        <div className="events-hero-content container">
          <p className="events-eyebrow">YOUR CAMPUS, YOUR COMMUNITY</p>
          <h1>Find your next<br /><span>good gathering.</span></h1>
          <p className="events-hero-copy">Discover workshops, meetups, cultural moments and the small plans that make campus feel like home.</p>
          <a className="btn btn-primary events-hero-button" href="#upcoming-events">Explore events <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="upcoming-events" className="container events-list-section">
        <div className="events-section-heading">
          <div>
            <p className="events-eyebrow">WHAT'S HAPPENING</p>
            <h2>Upcoming on campus</h2>
          </div>
          <p className="events-section-note">Make a little room in your calendar.</p>
        </div>

        <div className="event-discovery-controls">
          <label className="event-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events, categories, or places"
              aria-label="Search upcoming events"
            />
          </label>
          <div className="event-view-switch" role="group" aria-label="Event display mode">
            <button className={displayMode === 'list' ? 'is-active' : ''} type="button" onClick={() => setDisplayMode('list')}>List</button>
            <button className={displayMode === 'calendar' ? 'is-active' : ''} type="button" onClick={() => setDisplayMode('calendar')}>Calendar</button>
          </div>
        </div>

        {loading && <p className="text-gray-600">Loading events...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {actionError && <div className="alert alert-error">{actionError}</div>}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="event-empty-state">
            {normalizedSearch ? 'No upcoming events match your search.' : 'No upcoming events are scheduled right now.'}
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && displayMode === 'list' && (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <article className="event-tile" key={event.id}>
                {editingEvent === event.id && editForm ? (
                  <form onSubmit={updateEvent} className="event-edit-form">
                    {event.image && <img className="event-image-preview" src={event.image} alt={`${event.title} current`} />}
                    <label className="form-label" htmlFor={`event-image-${event.id}`}>Change event picture</label>
                    <input id={`event-image-${event.id}`} className="form-input" type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
                    {editImagePreview && <img className="event-image-preview" src={editImagePreview} alt="New event preview" />}
                    <input className="form-input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                    <textarea className="form-input" rows="4" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
                    <input className="form-input" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                    <input className="form-input" type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} required />
                    <input className="form-input" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required />
                    <input className="form-input" type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} required />
                    <div className="event-actions"><button className="btn btn-primary" type="submit">Save</button><button className="btn btn-secondary" type="button" onClick={() => setEditingEvent(null)}>Cancel</button></div>
                  </form>
                ) : (
                  <>
                {event.image && <img className="event-tile-image" src={event.image} alt={event.title} />}
                <div className="event-tile-top">
                  <span className="event-date-chip">{event.date}</span>
                  {event.category && <span className="event-category" style={{ '--category-color': event.category.color }}>{event.category.name}</span>}
                </div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span>◷ {event.time}</span>
                  <span>⌖ {event.location}</span>
                </div>
                <div className="event-tile-footer"><span>{event.available_spots} spots left</span><span>of {event.capacity}</span></div>
                {currentUser && event.requires_registration && !event.is_past && (
                  <div className="event-actions">
                    <button
                      className={event.is_attending ? 'btn btn-secondary' : 'btn btn-primary'}
                      type="button"
                      onClick={() => toggleAttendance(event)}
                      disabled={attendanceBusy === event.id || (!event.is_attending && event.available_spots <= 0)}
                    >
                      {attendanceBusy === event.id ? 'Please wait...' : event.is_attending ? 'Leave event' : event.available_spots <= 0 ? 'Event full' : 'Join event'}
                    </button>
                  </div>
                )}
                {canManage(event) && <div className="event-actions"><button className="btn btn-secondary" type="button" onClick={() => startEditing(event)}>Edit</button><button className="btn btn-danger" type="button" onClick={() => deleteEvent(event.id)}>Delete</button></div>}
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && displayMode === 'calendar' && (
          <div className="event-calendar-layout">
            <div className="event-calendar">
              <div className="event-calendar-header">
                <button
                  className="calendar-nav-button"
                  type="button"
                  aria-label="Previous month"
                  onClick={() => changeCalendarMonth(-1)}
                >
                  <span aria-hidden="true">←</span>
                </button>
                <h3>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                <button
                  className="calendar-nav-button"
                  type="button"
                  aria-label="Next month"
                  onClick={() => changeCalendarMonth(1)}
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="calendar-legend"><span aria-hidden="true" />Upcoming events</div>
              <div className="event-calendar-grid">
                {WEEKDAYS.map((weekday) => <span className="calendar-weekday" key={weekday}>{weekday}</span>)}
                {calendarCells.map((day, index) => {
                  if (!day) return <span className="calendar-day calendar-day-empty" key={`empty-${index}`} />;
                  const dateKey = toDateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                  const dayEvents = eventsByDate[dateKey] || [];
                  return (
                    <button
                      className={`calendar-day${dateKey === selectedDate ? ' is-selected' : ''}${dayEvents.length ? ' has-events' : ''}`}
                      type="button"
                      key={dateKey}
                      aria-pressed={dateKey === selectedDate}
                      aria-label={`${dateKey}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` : ''}`}
                      onClick={() => setSelectedDate(dateKey)}
                    >
                      <span>{day}</span>
                      {dayEvents.length > 0 && <span className="calendar-event-count">{dayEvents.length}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <aside className="event-calendar-agenda" aria-live="polite">
              <p className="events-eyebrow">DAY PLAN</p>
              <h3>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              {selectedDayEvents.length === 0 ? (
                <p className="calendar-no-events">No matching events on this date.</p>
              ) : selectedDayEvents.map((event) => (
                <article className="calendar-agenda-event" key={event.id}>
                  {event.image && <img src={event.image} alt="" />}
                  <div>
                    <span className="calendar-agenda-time">{event.time}</span>
                    <h4>{event.title}</h4>
                    <p>{event.location}{event.category ? ` · ${event.category.name}` : ''}</p>
                    {currentUser && event.requires_registration && (
                      <button
                        className={event.is_attending ? 'btn btn-secondary' : 'btn btn-primary'}
                        type="button"
                        onClick={() => toggleAttendance(event)}
                        disabled={attendanceBusy === event.id || (!event.is_attending && event.available_spots <= 0)}
                      >
                        {attendanceBusy === event.id ? 'Please wait...' : event.is_attending ? 'Leave event' : event.available_spots <= 0 ? 'Event full' : 'Join event'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
