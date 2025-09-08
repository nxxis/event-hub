import React, { useEffect, useState } from 'react';
import { listEvents } from '@eventhub/api';

function EventCard({ ev }) {
  const dt = new Date(ev.startAt);
  const day = dt.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
  const time = dt.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <a className="card event" href={`/events/${ev._id}`}>
      <div className="stamp">{day}</div>
      <div className="content">
        <div className="title">{ev.title}</div>
        <div className="meta">
          {ev.venue} • {time} • {ev?.organisation?.name ?? 'Organisation'}
        </div>
      </div>
      <div className="cta">
        <button className="btn secondary" type="button">
          Details
        </button>
      </div>
    </a>
  );
}

export default function Home() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setItems(null);
    listEvents(q ? { search: q } : {})
      .then(setItems)
      .catch((e) =>
        setErr(e?.response?.data?.message || 'Failed to load events')
      );
  }, [q]);

  return (
    <div className="stack">
      <div className="card">
        <div className="h1">Discover events</div>
        <div className="subtle">Browse & RSVP to upcoming campus events.</div>
        <div className="row mt-2">
          <input
            className="input"
            placeholder="Search events by title, tag, org..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={() => setQ(q)}>
            Search
          </button>
        </div>
      </div>

      {err && (
        <div className="card" style={{ color: '#ffb4b4' }}>
          Error: {err}
        </div>
      )}

      {!items && (
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skel" style={{ height: 96 }} />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="card">No events found.</div>
      )}

      {items && items.length > 0 && (
        <div className="grid">
          {items.map((ev) => (
            <EventCard key={ev._id} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
}
