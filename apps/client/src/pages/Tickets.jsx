import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { myTickets, ticketQR, cancelTicket } from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

function fmtForGCal(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function openGoogleCalendar(ev) {
  const startStr = fmtForGCal(ev.startAt);
  const endStr = fmtForGCal(ev.endAt);
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    ev.title
  )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
    ev.description || ''
  )}&location=${encodeURIComponent(ev.venue || '')}`;
  window.open(url, '_blank');
}

function openOutlook(ev) {
  const url = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${encodeURIComponent(
    new Date(ev.startAt).toISOString()
  )}&enddt=${encodeURIComponent(
    new Date(ev.endAt).toISOString()
  )}&subject=${encodeURIComponent(ev.title)}&body=${encodeURIComponent(
    ev.description || ''
  )}&location=${encodeURIComponent(ev.venue || '')}`;
  window.open(url, '_blank');
}

async function downloadIcs(eventId, title) {
  // Try to open in a new window (user gesture) to show Open/Save dialog;
  // fall back to blob download if blocked.
  const url = `/api/events/${eventId}/ics`;
  const newWin = window.open('', '_blank');
  if (newWin) {
    try {
      newWin.location.href = url;
      return;
    } catch {
      try {
        newWin.close();
      } catch {
        /* do nothing */
      }
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText || 'Failed to download');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = (title || 'event').replace(/[^a-z0-9_\- ]/gi, '');
    a.href = blobUrl;
    a.download = `${safeTitle}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    // best-effort: open a simple alert on failure
    alert(e?.message || 'Failed to download calendar');
  }
}

export default function Tickets() {
  const [items, setItems] = useState(null);
  const [qrUrls, setQrUrls] = useState({});
  const [canceling, setCanceling] = useState({});
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (
      auth &&
      auth.loading === false &&
      auth.user &&
      (auth.user.role === 'admin' || auth.user.role === 'organiser')
    ) {
      // redirect admins away from tickets page
      nav('/', {
        replace: true,
        state: { message: 'Organiser/admin accounts cannot access My Tickets' },
      });
    }
  }, [auth, nav]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (
        auth &&
        auth.user &&
        (auth.user.role === 'admin' || auth.user.role === 'organiser')
      ) {
        setErr('Organiser/admin accounts cannot view tickets');
        return;
      }
      try {
        const tickets = await myTickets();
        if (!alive) return;
        setItems(tickets);

        const entries = await Promise.all(
          tickets.map(async (t) => {
            try {
              const blob = await ticketQR(t._id);
              return [t._id, URL.createObjectURL(blob)];
            } catch {
              return [t._id, null];
            }
          })
        );
        if (!alive) return;
        setQrUrls(Object.fromEntries(entries));
      } catch (e) {
        setErr(e?.response?.data?.message || 'Unauthorized');
      }
    })();

    return () => {
      alive = false;
      Object.values(qrUrls).forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <div className="card">Error: {err}</div>;
  if (!items) return <div className="card skel" style={{ height: 120 }} />;

  if (items.length === 0)
    return (
      <div
        className="card center"
        style={{ height: 160, textAlign: 'center', flexDirection: 'column' }}
      >
        <div className="h1" style={{ fontSize: 20 }}>
          No tickets yet
        </div>
        <div className="subtle">Find an event on the home page and RSVP.</div>
      </div>
    );

  return (
    <div className="grid">
      {items.map((t) => (
        <div className="card" key={t._id} style={{ display: 'grid', gap: 12 }}>
          <div className="h1" style={{ fontSize: 18 }}>
            {t.event?.title || 'Event'}
          </div>
          <div className="subtle">
            {t.event?.venue} • {new Date(t.event?.startAt).toLocaleString()}
          </div>
          <div>
            Status: <b>{t.status}</b>
          </div>
          <div style={{ marginTop: '.5rem', minHeight: 170 }}>
            {qrUrls[t._id] ? (
              <img
                alt="Ticket QR"
                src={qrUrls[t._id]}
                width={160}
                height={160}
              />
            ) : qrUrls[t._id] === null ? (
              <span style={{ color: '#ffb4b4' }}>QR error</span>
            ) : (
              <span
                className="skel"
                style={{ display: 'inline-block', width: 160, height: 160 }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn secondary"
              onClick={() => downloadIcs(t.event._id, t.event?.title)}
            >
              Download .ics
            </button>
            <button className="btn" onClick={() => openGoogleCalendar(t.event)}>
              Google
            </button>
            <button className="btn" onClick={() => openOutlook(t.event)}>
              Outlook
            </button>
            <button
              className="btn muted"
              disabled={Boolean(canceling[t._id])}
              onClick={async () => {
                if (!window.confirm('Cancel this RSVP?')) return;
                try {
                  setCanceling((s) => ({ ...s, [t._id]: true }));
                  await cancelTicket(t._id);
                  // revoke QR url and remove ticket from list
                  if (qrUrls[t._id]) {
                    try {
                      URL.revokeObjectURL(qrUrls[t._id]);
                    } catch {
                      /* ignore revoke errors */
                    }
                  }
                  setQrUrls((q) => {
                    const copy = { ...q };
                    delete copy[t._id];
                    return copy;
                  });
                  setItems((its) => its.filter((it) => it._id !== t._id));
                } catch (e) {
                  if (e?.response?.status === 401) {
                    nav('/login', {
                      state: {
                        message: 'You must login to manage tickets',
                        from: location.pathname,
                      },
                    });
                    return;
                  }
                  setErr(e?.response?.data?.message || 'Failed to cancel');
                } finally {
                  setCanceling((s) => {
                    const copy = { ...s };
                    delete copy[t._id];
                    return copy;
                  });
                }
              }}
            >
              {canceling[t._id] ? 'Cancelling…' : 'Cancel RSVP'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
