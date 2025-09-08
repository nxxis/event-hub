import React, { useEffect, useState } from 'react';
import { listEvents } from '@eventhub/api';

export default function Home() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    listEvents(q ? { search: q } : {})
      .then(setItems)
      .catch((e) =>
        setErr(e?.response?.data?.message || 'Failed to load events')
      );
  }, [q]);

  return (
    <>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <input
          className="input"
          placeholder="Search events…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </div>
      <div className="grid">
        {items.map((ev) => (
          <a key={ev._id} className="card" href={`/events/${ev._id}`}>
            <h3 style={{ marginTop: 0 }}>{ev.title}</h3>
            <div style={{ color: 'var(--muted)' }}>{ev.venue}</div>
            <div>{new Date(ev.startAt).toLocaleString()}</div>
            <div style={{ marginTop: '.5rem' }}>
              By {ev?.organisation?.name ?? 'Org'}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
