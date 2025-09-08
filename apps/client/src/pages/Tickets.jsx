import React, { useEffect, useState } from 'react';
import { myTickets, ticketQR } from '@eventhub/api';

export default function Tickets() {
  const [items, setItems] = useState(null);
  const [qrUrls, setQrUrls] = useState({});
  const [qrErrs, setQrErrs] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const tickets = await myTickets();
        if (!alive) return;
        setItems(tickets);

        const entries = await Promise.all(
          tickets.map(async (t) => {
            try {
              const blob = await ticketQR(t._id);
              return [t._id, URL.createObjectURL(blob)];
            } catch (e) {
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
            ) : qrErrs[t._id] ? (
              <span style={{ color: '#ffb4b4' }}>QR error</span>
            ) : (
              <span
                className="skel"
                style={{ display: 'inline-block', width: 160, height: 160 }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
