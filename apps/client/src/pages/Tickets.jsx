import React, { useEffect, useState } from 'react';
import { myTickets, ticketQR } from '@eventhub/api';

export default function Tickets() {
  const [items, setItems] = useState([]);
  const [qrUrls, setQrUrls] = useState({});
  const [qrErrs, setQrErrs] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const tickets = await myTickets(); // ✅ proves Authorization works
        if (!alive) return;
        setItems(tickets);

        const entries = await Promise.all(
          tickets.map(async (t) => {
            try {
              const blob = await ticketQR(t._id); // GET /api/tickets/:id/qr with axios + Bearer
              const url = URL.createObjectURL(blob);
              return [t._id, { url }];
            } catch (e) {
              const status = e?.response?.status;
              const msg = e?.response?.data?.message || e.message;
              console.error('QR fetch failed', {
                ticketId: t._id,
                status,
                msg,
              });
              return [t._id, { error: `${status || 'ERR'}: ${msg}` }];
            }
          })
        );

        if (!alive) return;
        const nextUrls = {};
        const nextErrs = {};
        for (const [id, val] of entries) {
          if (val.url) nextUrls[id] = val.url;
          if (val.error) nextErrs[id] = val.error;
        }
        setQrUrls(nextUrls);
        setQrErrs(nextErrs);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Unauthorized');
      }
    })();

    return () => {
      alive = false;
      Object.values(qrUrls).forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <div className="card">{err}</div>;

  return (
    <div className="grid">
      {items.map((t) => (
        <div className="card" key={t._id}>
          <h3 style={{ marginTop: 0 }}>{t.event?.title || 'Event'}</h3>
          <div style={{ color: 'var(--muted)' }}>{t.event?.venue}</div>
          <div>{new Date(t.event?.startAt).toLocaleString()}</div>
          <div style={{ marginTop: '.5rem' }}>Status: {t.status}</div>
          <div style={{ marginTop: '.5rem', minHeight: 170 }}>
            {qrUrls[t._id] && (
              <img
                alt="Ticket QR"
                src={qrUrls[t._id]}
                width={160}
                height={160}
              />
            )}
            {!qrUrls[t._id] && !qrErrs[t._id] && <span>Loading QR…</span>}
            {qrErrs[t._id] && (
              <span style={{ color: 'crimson' }}>
                QR error: {qrErrs[t._id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
