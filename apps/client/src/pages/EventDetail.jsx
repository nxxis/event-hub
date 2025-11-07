import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, rsvp, myTickets } from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketsLoaded, setTicketsLoaded] = useState(true);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    setEv(null);
    getEvent(id)
      .then(setEv)
      .catch((e) => setErr(e?.response?.data?.message || 'Failed to load'));
  }, [id]);

  // check if the current user has a ticket for this event
  useEffect(() => {
    let alive = true;
    if (!ev) return;
    // if not logged in, nothing to load
    if (!auth?.user) {
      setHasTicket(false);
      setTicketsLoaded(true);
      return;
    }

    setTicketsLoaded(false);
    (async () => {
      try {
        const tickets = await myTickets();
        if (alive) {
          const found = tickets.some((t) => t.event && t.event._id === ev._id);
          setHasTicket(found);
        }
      } catch {
        // ignore errors
      } finally {
        if (alive) setTicketsLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ev, auth]);

  if (err) return <div className="card">Error: {err}</div>;
  if (!ev) return <div className="card skel" style={{ height: 160 }} />;

  const start = new Date(ev.startAt);
  const end = new Date(ev.endAt);

  const onRSVP = () => {
    setMsg('');
    setErr('');
    rsvp(ev._id)
      .then((res) => {
        setMsg(`RSVP ${res.status}.`);
        // mark as having a ticket so UI updates
        if (res && res.status && res.status !== 'cancelled') setHasTicket(true);
      })
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
          {auth?.user && !ticketsLoaded ? (
            // keep a small skeleton while we know if the user has a ticket
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="skel" style={{ width: 80, height: 36 }} />
              <div className="skel" style={{ width: 220, height: 18 }} />
            </div>
          ) : !hasTicket ? (
            <>
              <button className="btn" onClick={onRSVP}>
                RSVP
              </button>
            </>
          ) : (
            <div className="subtle" style={{ marginLeft: 8 }}>
              Already RSVP'd
            </div>
          )}
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
