import React, { useEffect, useState, useRef } from 'react';
import { getEventImages } from '@eventhub/api';

export default function Hero({ featured, others = [], onJoin }) {
  const fallback =
    'https://images.unsplash.com/photo-1503424886309-78a0b2b1b7f0?auto=format&fit=crop&w=1600&q=60';
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!featured?._id) return;
      setLoadingImages(true);
      try {
        const data = await getEventImages(featured._id);
        if (!alive) return;
        if (data && Array.isArray(data.images) && data.images.length) {
          setImages(data.images);
          setIndex(0);
        } else {
          setImages([featured.cover].filter(Boolean));
        }
      } catch (e) {
        setImages([featured?.cover || fallback].filter(Boolean));
      } finally {
        if (alive) setLoadingImages(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [featured]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer.current);
  }, [images]);

  const mainSrc =
    images && images.length ? images[index] : featured?.cover || fallback;

  const now = new Date();
  const featuredPassed = featured
    ? featured.endAt
      ? new Date(featured.endAt) <= now
      : new Date(featured.startAt) <= now
    : false;

  return (
    <section className="hero hero-large">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-pre">UPCOMING EVENTS</div>
          <h1 className="hero-title">{featured?.title || 'Featured Event'}</h1>
          <p className="hero-sub">
            {featured?.description ||
              'Join our featured event and connect with peers, speakers, and sponsors.'}
          </p>
          <div className="hero-meta">
            {featured?.organisation?.name || 'EventHub'} •{' '}
            {new Date(featured?.startAt || Date.now()).toLocaleString()}
          </div>
          <div className="hero-cta">
            <button
              className="btn primary-large"
              onClick={() => !featuredPassed && onJoin && onJoin(featured)}
              disabled={featuredPassed}
            >
              {featuredPassed ? 'Event passed' : 'Join Event'}
            </button>
            <button
              className="btn secondary"
              onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}
            >
              View schedule
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat" aria-hidden={!featured?.capacity}>
              <div className="stat-num">{featured?.capacity ?? 0}</div>
              <div className="stat-label">
                {(featured?.capacity ?? 0) === 1 ? 'seat' : 'seats'}
              </div>
            </div>

            <div className="stat" aria-hidden={!(others && others.length)}>
              <div className="stat-num">{others.length}</div>
              <div className="stat-label">
                {others.length === 1 ? 'more session' : 'more sessions'}
              </div>
            </div>

            {(featured?.tags?.length || 0) > 0 && (
              <div className="stat">
                <div className="stat-num">{featured?.tags?.length || 0}</div>
                <div className="stat-label">
                  {(featured?.tags?.length || 0) === 1 ? 'tag' : 'tags'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-frame device-frame">
            <div className="device-screen">
              {loadingImages ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Loading…
                </div>
              ) : (
                <img
                  key={mainSrc}
                  src={mainSrc}
                  alt={featured?.title || 'Featured'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 10,
                    transition: 'opacity .4s ease',
                  }}
                />
              )}
            </div>
            <div className="device-thumbs">
              {(images && images.length
                ? images
                : others
                    .slice(0, 4)
                    .map((o) => o.cover)
                    .filter(Boolean)
              )
                .slice(0, 4)
                .map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`thumb small ${i === index ? 'active' : ''}`}
                    style={{
                      backgroundImage: `url(${src || fallback})`,
                      cursor: 'pointer',
                    }}
                    title={`Image ${i + 1}`}
                    onClick={() => {
                      clearInterval(timer.current);
                      setIndex(i);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
