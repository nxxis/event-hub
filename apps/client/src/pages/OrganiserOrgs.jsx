import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createOrg, myOrgs } from '@eventhub/api';

export default function OrganiserOrgs() {
  const { auth } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(null);
  const [myOrgs, setMyOrgs] = useState(null);

  useEffect(() => {
    if (!auth || auth.loading) return;
    if (!auth.user || auth.user.role !== 'organiser') return;
    let alive = true;
    (async () => {
      try {
        const mine = await myOrgs();
        if (!alive) return;
        setMyOrgs(mine || []);
      } catch (e) {
        setMyOrgs([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth]);

  if (!auth || auth.loading) return <div className="card">Loading...</div>;
  if (!auth.user || auth.user.role !== 'organiser') return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess(null);
    try {
      const org = await createOrg({ name, description });
      setSuccess(org);
      setName('');
      setDescription('');
      setMyOrgs((s) => (s ? [org, ...s] : [org]));
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create organisation');
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="h1">Create Club</div>
        <div className="subtle">
          Organisers can create clubs here; admin will approve.
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={onSubmit}>
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder="Club name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <textarea
              className="input"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">
              Create club
            </button>
          </div>
        </form>
        {err && <div style={{ color: '#ffb4b4', marginTop: 8 }}>{err}</div>}
        {success && (
          <div style={{ marginTop: 12 }} className="card">
            <div className="h2">Club created</div>
            <div className="subtle">Club created and pending approval.</div>
            <div style={{ marginTop: 8 }}>
              <b>{success.name}</b>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="h2">Your clubs</div>
        {myOrgs === null ? (
          <div className="subtle">Loading…</div>
        ) : myOrgs.length === 0 ? (
          <div className="subtle">You have not created any clubs yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myOrgs.map((o) => (
              <div
                key={o._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{o.name}</div>
                  <div className="subtle">{o.description}</div>
                </div>
                <div className="subtle">
                  {o.approved ? 'Approved' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
