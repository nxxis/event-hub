import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listEvents,
  createEvent,
  publishEvent,
  organiserEvents,
} from '@eventhub/api';
import { AuthContext } from '../context/AuthContext';

export default function OrganiserEvents() {
  const { auth } = useContext(AuthContext);
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'events'
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    startAt: '',
    endAt: '',
    capacity: 50,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (auth && auth.loading) return;
    if (!auth || !auth.user || auth.user.role !== 'organiser') {
      nav('/', { replace: true });
      return;
    }

    let alive = true;
    (async () => {
      try {
        const data = await organiserEvents();
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load events');
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth, nav]);

  const onCreate = async (e) => {
    e.preventDefault();
    setErr('');
    setCreating(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        venue: form.venue,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        capacity: Number(form.capacity) || 50,
        visibility: 'public',
      };
      const created = await createEvent(payload);
      setItems((s) => (s ? [created, ...s] : [created]));
      setForm({
        title: '',
        description: '',
        venue: '',
        startAt: '',
        endAt: '',
        capacity: 50,
      });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  if (err) return <div className="card">Error: {err}</div>;
  if (!items) return <div className="card skel" style={{ height: 120 }} />;

  return (
    <div className="stack">
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="h1">Events</div>
          <div className="subtle">Create and manage events for your club.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={activeTab === 'create' ? 'btn' : 'btn ghost'}
            onClick={() => setActiveTab('create')}
          >
            Create
          </button>
          <button
            className={activeTab === 'events' ? 'btn' : 'btn ghost'}
            onClick={() => setActiveTab('events')}
          >
            Your events
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <form onSubmit={onCreate}>
            <div style={{ display: 'grid', gap: 8 }}>
              <input
                className="input"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
              />
              <input
                className="input"
                type="datetime-local"
                placeholder="Starts at"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
              />
              <input
                className="input"
                type="datetime-local"
                placeholder="Ends at"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                required
              />
              <input
                className="input"
                type="number"
                min={1}
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
              <textarea
                className="input"
                placeholder="Description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="card">
          <div className="h2">Your events</div>
          {items.length === 0 ? (
            <div className="subtle">No events yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((ev) => (
                <div
                  key={ev._id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{ev.title}</div>
                    <div className="subtle">
                      {ev.venue} • {new Date(ev.startAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {ev.status !== 'published' ? (
                      <button
                        className="btn secondary"
                        onClick={async () => {
                          try {
                            const updated = await publishEvent(ev._id);
                            setItems((s) =>
                              s.map((i) => (i._id === ev._id ? updated : i))
                            );
                          } catch (e) {
                            setErr(
                              e?.response?.data?.message || 'Failed to publish'
                            );
                          }
                        }}
                      >
                        Publish
                      </button>
                    ) : (
                      <div className="subtle">Published</div>
                    )}
                    <a className="btn ghost" href={`/events/${ev._id}`}>
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
