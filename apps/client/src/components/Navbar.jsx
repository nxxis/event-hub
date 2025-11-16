import React, { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 120);
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`} style={{ opacity: 0, animation: 'fadein .35s ease .05s forwards' }}>
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
