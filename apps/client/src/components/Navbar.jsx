import React from 'react';
import Logo from './Logo';

export default function Navbar() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return (
    <header className="nav" style={{ opacity: 0, animation: 'fadein .35s ease .05s forwards' }}>
      <div className="nav-inner">
        <div className="brand">
          <Logo size={28} />
          <div style={{ marginLeft: 10 }}>EventHub</div>
        </div>
        <div className="nav-spacer" />
        <nav className="row">
          <a href="/">Home</a>
          <a href="/tickets">My Tickets</a>
          {!token ? <a href="/login">Login</a> : <a href="/logout">Logout</a>}
        </nav>
      </div>
    </header>
  );
}
