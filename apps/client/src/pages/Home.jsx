import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listEvents, rsvp, myTickets } from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';
import Hero from '../components/Hero';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

function EventCard({ ev, onRSVP, hasTicket, rsvpLoading }) {
  const dt = new Date(ev.startAt);
  const day = dt.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
  const time = dt.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const now = new Date();
  const hasPassed = ev.endAt
    ? new Date(ev.endAt) <= now
    : new Date(ev.startAt) <= now;

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
        {!hasTicket ? (
          hasPassed ? (
            <button className="btn secondary" type="button" disabled>
              Event passed
            </button>
          ) : (
            <button
              className="btn secondary"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRSVP(ev);
              }}
              aria-label={`RSVP to ${ev.title}`}
              disabled={rsvpLoading}
            >
              {rsvpLoading ? 'Sending…' : 'RSVP'}
            </button>
          )
        ) : (
          <button className="btn secondary" type="button">
            Details
          </button>
        )}
      </div>
    </a>
  );
}

export default function Home() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEvent, setConfirmEvent] = useState(null);
  const { push: pushToast } = useToast();
  const { auth } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();
  const [ticketSet, setTicketSet] = useState(new Set());
  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setErr('');
    setItems(null);
    (async () => {
      try {
        const data = await listEvents(q ? { search: q } : {});
        if (!alive) return;
        setItems(data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || 'Failed to load events');
        setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q]);

  useEffect(() => {
    let alive = true;
    if (!auth?.user) return setTicketSet(new Set());
    (async () => {
      try {
        const tickets = await myTickets();
        if (!alive) return;
        const set = new Set(tickets.map((t) => t.event && t.event._id));
        setTicketSet(set);
        setTicketsLoaded(true);
      } catch {
        // ignore errors
        setTicketsLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth]);

  const handleRSVP = async (ev) => {
    if (!auth?.user) {
      nav('/login', {
        state: { message: 'You must login to RSVP', from: location.pathname },
      });
      return;
    }
    setConfirmEvent(ev);
    setConfirmOpen(true);
  };

  const doRSVP = async (ev) => {
    setConfirmOpen(false);
    try {
      setRsvpLoading((s) => new Set([...Array.from(s), ev._id]));
      const res = await rsvp(ev._id);
      setRsvpLoading((s) => {
        const copy = new Set(s);
        copy.delete(ev._id);
        return copy;
      });
      if (res && res.status) {
        setTicketSet((s) => new Set([...Array.from(s), ev._id]));
        pushToast({
          type: 'success',
          message: `RSVP confirmed for "${ev.title}"`,
        });
      }
    } catch (e) {
      setRsvpLoading((s) => {
        const copy = new Set(s);
        copy.delete(ev._id);
        return copy;
      });
      if (e?.response?.status === 401) {
        nav('/login', {
          state: { message: 'You must login to RSVP', from: location.pathname },
        });
        return;
      }
      const msg = e?.response?.data?.message || 'Failed to RSVP';
      setErr(msg);
      pushToast({ type: 'error', message: msg });
    }
  };

  // don't render event cards until we know user's tickets when logged in
  if (auth?.user && !ticketsLoaded) {
    return (
      <div className="grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card skel" style={{ height: 96 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      />
      {items && items.length > 0 && (
        <Hero
          featured={items[0]}
          others={items.slice(1, 6)}
          onJoin={(ev) => handleRSVP(ev)}
        />
      )}
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>Error: {err}</div>
            <button className="btn small" onClick={() => setQ(q)}>
              Retry
            </button>
          </div>
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
            <EventCard
              key={ev._id}
              ev={ev}
              hasTicket={ticketSet.has(ev._id)}
              onRSVP={handleRSVP}
              rsvpLoading={rsvpLoading.has(ev._id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={confirmOpen}
        title={confirmEvent ? `RSVP to "${confirmEvent.title}"` : 'RSVP'}
        onClose={() => setConfirmOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>Are you sure you want to RSVP to this event?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn secondary"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={() => confirmEvent && doRSVP(confirmEvent)}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
