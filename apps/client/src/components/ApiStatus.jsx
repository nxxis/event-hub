import React, { useEffect, useState } from 'react';

export default function ApiStatus() {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || window.__API_BASE__ || 'http://localhost:4000') + '/api/health');
        if (!mounted) return;
        setOnline(res.ok);
      } catch (e) {
        if (!mounted) return;
        setOnline(false);
      }
    }
    check();
    const t = setInterval(check, 6000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  if (online === null) return <div style={{ color: 'var(--muted)' }}>Checking API...</div>;
  return (
    <div style={{ color: online ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
      {online ? 'API online' : 'API offline'}
    </div>
  );
}
