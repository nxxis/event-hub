import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getEvent,
  rsvp,
  myTickets,
  cancelTicket,
  adminEventAttendees,
} from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketsLoaded, setTicketsLoaded] = useState(true);
  const [userTicketId, setUserTicketId] = useState(null);
  const [attendees, setAttendees] = useState(undefined); // undefined=not loaded, null=loading
  const [attendeesErr, setAttendeesErr] = useState('');
  const { auth } = useContext(AuthContext);
  const isAdmin = auth?.user && auth.user.role === 'admin';
  const nav = useNavigate();
  const isRestricted =
    auth?.user &&
    (auth.user.role === 'admin' || auth.user.role === 'organiser');
  const location = useLocation();

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
          const found = tickets.find((t) => t.event && t.event._id === ev._id);
          setHasTicket(Boolean(found));
          setUserTicketId(found ? found._id : null);
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
        if (res && res.status && res.status !== 'cancelled') {
          setHasTicket(true);
          if (res.ticketId) setUserTicketId(res.ticketId);
        }
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          nav('/login', {
            state: {
              message: 'You must login to RSVP',
              from: location.pathname,
            },
          });
          return;
        }
        setErr(e?.response?.data?.message || 'You must login to RSVP');
      });
  };

  const onCancel = () => {
    if (!userTicketId) return;
    // simple confirmation
    if (!window.confirm('Cancel your RSVP for this event?')) return;
    setMsg('');
    setErr('');
    cancelTicket(userTicketId)
      .then(() => {
        setMsg('RSVP cancelled.');
        setHasTicket(false);
        setUserTicketId(null);
      })
      .catch((e) => setErr(e?.response?.data?.message || 'Failed to cancel'));
  };

  const loadAttendees = async () => {
    setAttendees(null);
    setAttendeesErr('');
    try {
      const list = await adminEventAttendees(ev._id);
      setAttendees(list || []);
    } catch (e) {
      setAttendeesErr(e?.response?.data?.message || 'Failed to load attendees');
      setAttendees([]);
    }
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
          ) : isRestricted ? (
            <div className="subtle">
              Organisers and admins cannot RSVP to events.
            </div>
          ) : !hasTicket ? (
            <>
              <button className="btn" onClick={onRSVP}>
                RSVP
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="subtle" style={{ marginLeft: 8 }}>
                Already RSVP'd
              </div>
              <button className="btn muted" onClick={onCancel}>
                Cancel RSVP
              </button>
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
        {auth?.user &&
          (auth.user.role === 'admin' || auth.user.role === 'organiser') && (
            <div style={{ marginTop: 12 }} className="card">
              <div className="h2">Attendees</div>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn"
                  onClick={loadAttendees}
                  disabled={attendees === null}
                >
                  {attendees === undefined
                    ? 'View attendees'
                    : attendees === null
                    ? 'Loading…'
                    : 'Refresh attendees'}
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                {attendeesErr && (
                  <div style={{ color: '#ffb4b4' }}>{attendeesErr}</div>
                )}
                {attendees === undefined ? null : attendees === null ? (
                  <div className="subtle">Loading attendees…</div>
                ) : attendees.length === 0 ? (
                  <div className="subtle">No attendees yet</div>
                ) : (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {attendees.map((a) => (
                      <div
                        key={a.ticketId}
                        className="card"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {a.user ? a.user.name : 'Anonymous'}
                          </div>
                          <div className="subtle">
                            {a.user ? a.user.email : ''}
                          </div>
                        </div>
                        <div className="subtle">{a.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
