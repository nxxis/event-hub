import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEvents, adminEventAttendees } from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

export default function AdminEvents() {
  const { auth } = useContext(AuthContext);
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const [attendeesMap, setAttendeesMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    if (auth && auth.loading) return;
    if (!auth || !auth.user || auth.user.role !== 'admin') {
      nav('/', { replace: true });
      return;
    }

    let alive = true;
    (async () => {
      try {
        const data = await adminEvents();
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load');
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth, nav]);

  if (err) return <div className="card">Error: {err}</div>;
  if (!items) return <div className="card skel" style={{ height: 120 }} />;

  return (
    <div className="stack">
      <div className="card">
        <div className="h1">Admin — Events</div>
        <div className="subtle">Event list with participant counts</div>
      </div>
      <div className="grid">
        {items.map((ev) => (
          <div
            className="card"
            key={ev._id}
            style={{ display: 'grid', gap: 8 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="h2" style={{ fontSize: 16 }}>
                  {ev.title}
                </div>
                <div className="subtle" style={{ fontSize: 12 }}>
                  {ev.venue} • {new Date(ev.startAt).toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}
              >
                <div className="subtle">
                  {ev.participantCount ?? 0} participants
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    className="btn secondary"
                    onClick={async () => {
                      setExpanded((s) => ({ ...s, [ev._id]: !s[ev._id] }));
                      if (!attendeesMap[ev._id]) {
                        try {
                          setAttendeesMap((m) => ({ ...m, [ev._id]: null }));
                          const list = await adminEventAttendees(ev._id);
                          setAttendeesMap((m) => ({ ...m, [ev._id]: list }));
                        } catch (e) {
                          setAttendeesMap((m) => ({ ...m, [ev._id]: [] }));
                        }
                      }
                    }}
                  >
                    {expanded[ev._id] ? 'Hide attendees' : 'View attendees'}
                  </button>
                </div>
              </div>
            </div>

            {expanded[ev._id] && (
              <div
                style={{
                  marginTop: 8,
                  borderTop: '1px solid #eee',
                  paddingTop: 8,
                }}
              >
                {attendeesMap[ev._id] === undefined ||
                attendeesMap[ev._id] === null ? (
                  <div className="subtle">Loading attendees…</div>
                ) : attendeesMap[ev._id].length === 0 ? (
                  <div className="subtle">No attendees yet</div>
                ) : (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {attendeesMap[ev._id].map((a) => (
                      <div
                        key={a.ticketId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {a.user?.name || 'Unknown'}
                          </div>
                          <div className="subtle" style={{ fontSize: 12 }}>
                            {a.user?.email || ''}
                          </div>
                        </div>
                        <div className="subtle" style={{ fontSize: 12 }}>
                          {new Date(a.issuedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
