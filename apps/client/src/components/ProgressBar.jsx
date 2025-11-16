import React, { useEffect, useRef, useState } from 'react';

// Progress bar that tracks actual network requests emitted via `network:count` events
export default function ProgressBar() {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);
  const intervalRef = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => {
    function ensureInterval() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        setPct((p) => {
          if (p >= 88) return p;
          // advance slowly with small randomness
          const inc = 4 + Math.round(Math.random() * 6);
          return Math.min(88, p + inc);
        });
      }, 420);
    }

    function clearIntervalRef() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function onNetwork(e) {
      const count = e && e.detail && typeof e.detail.count === 'number' ? e.detail.count : 0;
      if (count > 0) {
        // start progress
        if (finishRef.current) {
          clearTimeout(finishRef.current);
          finishRef.current = null;
        }
        if (!visible) setVisible(true);
        setPct((p) => (p > 6 ? p : 6));
        ensureInterval();
      } else {
        // finish
        clearIntervalRef();
        setPct(100);
        // hide after a short delay
        finishRef.current = setTimeout(() => {
          setVisible(false);
          setPct(0);
          finishRef.current = null;
        }, 300);
      }
    }

    window.addEventListener('network:count', onNetwork);

    // fallback: if no network events are fired, listen for classic navigation events
    // (handled elsewhere) — but primary source is network events.

    return () => {
      window.removeEventListener('network:count', onNetwork);
      clearIntervalRef();
      if (finishRef.current) clearTimeout(finishRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div aria-hidden className="top-progress">
      <div className="top-progress__bar" style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
