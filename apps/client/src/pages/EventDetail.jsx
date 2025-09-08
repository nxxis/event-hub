import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, rsvp } from '@eventhub/api';

export default function EventDetail() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    getEvent(id)
      .then(setEv)
      .catch((e) => setErr(e?.response?.data?.message || 'Failed to load'));
  }, [id]);

  const handleRSVP = () => {
    setMsg('');
    setErr('');
    rsvp(ev._id)
      .then((res) => setMsg(`RSVP ${res.status}.`))
      .catch((e) =>
        setErr(e?.response?.data?.message || 'You must login to RSVP')
      );
  };

  if (err) return <div className="card">{err}</div>;
  if (!ev) return <div className="card">Loading…</div>;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{ev.title}</h2>
      <p style={{ color: 'var(--muted)' }}>
        {ev.venue} • {new Date(ev.startAt).toLocaleString()}
      </p>
      <p>{ev.description}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleRSVP}>
          RSVP
        </button>
        <a
          className="btn"
          href={`/api/events/${ev._id}/ics`}
          target="_blank"
          rel="noreferrer"
        >
          Add to Calendar
        </a>
      </div>
      {msg && <p style={{ marginTop: '.5rem' }}>{msg}</p>}
      {err && <p style={{ marginTop: '.5rem', color: 'crimson' }}>{err}</p>}
    </div>
  );
}
