import React, { useEffect, useState, useContext } from 'react';
import { adminOrgs, approveOrg, deleteOrg } from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

export default function AdminOrgs() {
  const { auth } = useContext(AuthContext);
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState({});
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await adminOrgs();
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load organisations');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!auth || auth.loading) return <div className="card">Loading...</div>;
  if (!auth.user || auth.user.role !== 'admin') return null;
  if (err) return <div className="card">Error: {err}</div>;
  if (!items) return <div className="card skel" style={{ height: 120 }} />;

  const filtered = items.filter((o) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (o.name && o.name.toLowerCase().includes(s)) ||
      (o.owner &&
        ((o.owner.name && o.owner.name.toLowerCase().includes(s)) ||
          (o.owner.email && o.owner.email.toLowerCase().includes(s)))) ||
      (o.description && o.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="stack">
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="h1">Organisation approvals</div>
            <div className="subtle">
              Approve or reject organisation (club) requests
            </div>
          </div>
          <div>
            <input
              className="input"
              placeholder="Search name, owner or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 260 }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Owner</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>
                Created
              </th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} style={{ borderTop: '1px solid var(--muted)' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{o.name}</div>
                  <div className="subtle" style={{ fontSize: 12 }}>
                    {o.description}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600 }}>
                    {o.owner?.name || o.owner?.email || 'Unknown'}
                  </div>
                  <div className="subtle" style={{ fontSize: 12 }}>
                    {o.owner?.email || ''}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  {o.approved ? 'Approved' : 'Pending'}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {!o.approved && (
                    <>
                      <button
                        className="btn"
                        disabled={Boolean(busy[o._id])}
                        onClick={async () => {
                          if (!window.confirm(`Approve "${o.name}"?`)) return;
                          setBusy((s) => ({ ...s, [o._id]: true }));
                          try {
                            await approveOrg(o._id);
                            setItems((its) =>
                              its.map((it) =>
                                it._id === o._id
                                  ? { ...it, approved: true }
                                  : it
                              )
                            );
                          } catch (e) {
                            setErr(
                              e?.response?.data?.message || 'Failed to approve'
                            );
                          } finally {
                            setBusy((s) => {
                              const copy = { ...s };
                              delete copy[o._id];
                              return copy;
                            });
                          }
                        }}
                        style={{ marginRight: 8 }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn muted"
                        disabled={Boolean(busy[o._id])}
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Reject and delete "${o.name}"? This cannot be undone.`
                            )
                          )
                            return;
                          setBusy((s) => ({ ...s, [o._id]: true }));
                          try {
                            await deleteOrg(o._id);
                            setItems((its) =>
                              its.filter((it) => it._id !== o._id)
                            );
                          } catch (e) {
                            setErr(
                              e?.response?.data?.message || 'Failed to delete'
                            );
                          } finally {
                            setBusy((s) => {
                              const copy = { ...s };
                              delete copy[o._id];
                              return copy;
                            });
                          }
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
