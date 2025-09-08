import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, rsvp } from '@eventhub/api';

export default function EventDetail() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setEv(null);
    getEvent(id)
      .then(setEv)
      .catch((e) => setErr(e?.response?.data?.message || 'Failed to load'));
  }, [id]);

  if (err) return <div className="card">Error: {err}</div>;
  if (!ev) return <div className="card skel" style={{ height: 160 }} />;

  const start = new Date(ev.startAt);
  const end = new Date(ev.endAt);

  const onRSVP = () => {
    setMsg('');
    setErr('');
    rsvp(ev._id)
      .then((res) => setMsg(`RSVP ${res.status}.`))
      .catch((e) =>
        setErr(e?.response?.data?.message || 'You must login to RSVP')
      );
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="h1">{ev.title}</div>
        <div className="subtle">
          {ev.venue} • {start.toLocaleString()} – {end.toLocaleTimeString()}
          {ev?.organisation?.name ? ` • by ${ev.organisation.name}` : ''}
        </div>
        <p className="mt-2" style={{ lineHeight: 1.6 }}>
          {ev.description}
        </p>
        <div className="row mt-2">
          <button className="btn" onClick={onRSVP}>
            RSVP
          </button>
          <a
            className="btn secondary"
            href={`/api/events/${ev._id}/ics`}
            target="_blank"
            rel="noreferrer"
          >
            Add to Calendar
          </a>
        </div>
        {msg && (
          <div className="mt-2" style={{ color: '#9dffcf' }}>
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-2" style={{ color: '#ffb4b4' }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
