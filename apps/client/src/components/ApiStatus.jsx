import React, { useEffect, useState } from 'react';

export default function ApiStatus({ pollInterval = 5000 }) {
  const [status, setStatus] = useState({ ok: null, loading: true });

  useEffect(() => {
    let alive = true;

    async function check() {
      try {
        setStatus((s) => ({ ...s, loading: true }));
        const res = await fetch('/api/health');
        const data = await res.json();
        if (!alive) return;
        setStatus({ ok: !!data?.ok, loading: false });
      } catch (e) {
        if (!alive) return;
        setStatus({ ok: false, loading: false });
      }
    }

    check();
    const id = setInterval(check, pollInterval);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollInterval]);

  if (status.loading) return <div className="api-status subtle">Checking API...</div>;
  return (
    <div
      className="api-status"
      style={{ color: status.ok ? 'var(--primary-strong)' : '#d9534f' }}
      title={status.ok ? 'API available' : 'API not reachable'}
    >
      {status.ok ? 'API online' : 'API offline'}
    </div>
  );
}
