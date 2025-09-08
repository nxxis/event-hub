import React from 'react';

export default function Navbar() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return (
    <header
      className="nav"
      style={{ opacity: 0, animation: 'fadein .35s ease .05s forwards' }}
    >
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-badge" />
          EventHub
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
