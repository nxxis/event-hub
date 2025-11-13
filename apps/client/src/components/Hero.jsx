import React from 'react';

export default function Hero({ featured, others = [], onJoin }) {
  // fallback background image if event has no cover
  const bg = featured?.cover || 'https://images.unsplash.com/photo-1503424886309-78a0b2b1b7f0?auto=format&fit=crop&w=1600&q=60';

  return (
    <section
      className="hero hero-large"
      style={{ backgroundImage: `linear-gradient(rgba(7,12,30,0.6), rgba(7,12,30,0.6)), url(${bg})` }}
    >
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-pre">UPCOMING EVENTS</div>
          <h1 className="hero-title">{featured?.title || 'Featured Event'}</h1>
          <p className="hero-sub">{featured?.description || 'Join our featured event and connect with peers, speakers, and sponsors.'}</p>
          <div className="hero-meta">{featured?.organisation?.name || 'EventHub'} • {new Date(featured?.startAt || Date.now()).toLocaleString()}</div>
          <div className="hero-cta">
            <button className="btn primary-large" onClick={() => onJoin && onJoin(featured)}>
              Join Event
            </button>
            <button className="btn secondary" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>
              View schedule
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">{featured?.capacity ?? 0}</div>
              <div className="stat-label">Capacity</div>
            </div>
            <div className="stat">
              <div className="stat-num">{others.length}</div>
              <div className="stat-label">More sessions</div>
            </div>
            <div className="stat">
              <div className="stat-num">{featured?.tags?.length || 0}</div>
              <div className="stat-label">Tags</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-frame device-frame">
            <div className="device-screen">
              <img
                src={featured?.cover || bg}
                alt={featured?.title || 'Featured'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
              />
            </div>
            <div className="device-thumbs">
              {others.slice(0, 4).map((o) => (
                <div
                  key={o._id}
                  className="thumb small"
                  style={{ backgroundImage: `url(${o.cover || bg})` }}
                  title={o.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
