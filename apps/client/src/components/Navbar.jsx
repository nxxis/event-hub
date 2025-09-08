import React from 'react';

export default function Navbar() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return (
    <nav style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '.8rem 0',
        }}
      >
        <a href="/" style={{ fontWeight: 700 }}>
          EventHub
        </a>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <a href="/">Home</a>
          <a href="/tickets">My Tickets</a>
          {!token ? <a href="/login">Login</a> : <a href="/logout">Logout</a>}
        </div>
      </div>
    </nav>
  );
}
