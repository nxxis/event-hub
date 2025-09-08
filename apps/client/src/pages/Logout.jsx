import { useEffect } from 'react';
export default function Logout() {
  useEffect(() => {
    localStorage.removeItem('token');
    window.location.href = '/';
  }, []);
  return <div className="card">Logging out…</div>;
}
