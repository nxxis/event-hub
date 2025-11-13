import React from 'react';

export default function Hero({ featured, others = [], onJoin }) {
  // fallback background image if event has no cover
  const bg = featured?.cover || 'https://images.unsplash.com/photo-1503424886309-78a0b2b1b7f0?auto=format&fit=crop&w=1600&q=60';

  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(3,6,23,0.6), rgba(3,6,23,0.6)), url(${bg})` }}>
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-pre">UPCOMING EVENTS</div>
          <h1 className="hero-title">{featured?.title || 'Featured Event'}</h1>
          <div className="hero-meta">{featured?.organisation?.name || 'EventHub'} • {new Date(featured?.startAt || Date.now()).toLocaleString()}</div>
          <div className="hero-cta">
            <button className="btn" onClick={() => onJoin && onJoin(featured)}>
              Join Event
            </button>
            <button className="btn secondary" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>
              View schedule
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-frame">
            <div className="hero-thumb-grid">
              {others.slice(0, 4).map((o) => (
                <div key={o._id} className="thumb" style={{ backgroundImage: `url(${o.cover || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=60'})` }} title={o.title} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
