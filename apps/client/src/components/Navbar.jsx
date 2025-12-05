import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { auth } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window === 'undefined') return 'bright';
      const saved = localStorage.getItem('theme');
      return saved === 'dark' ? 'dark' : 'bright';
    } catch (e) {
      return 'bright';
    }
  });

  // rAF-throttled scroll handler for smooth, low-cost updates
  const ticking = useRef(false);
  const lastY = useRef(0);
  useEffect(() => {
    function onScroll() {
      lastY.current = window.scrollY;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          setScrolled(lastY.current > 120);
          ticking.current = false;
        });
      }
    }
    // run once to set initial state
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (theme === 'bright')
          document.documentElement.classList.add('theme-bright');
        else document.documentElement.classList.remove('theme-bright');
      }
      if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore storage errors
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'bright' ? 'dark' : 'bright'));
  }

  return (
    <header
      className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
      style={{ opacity: 0, animation: 'fadein .35s ease .05s forwards' }}
    >
      <div className="nav-inner">
        <Link to="/" className="brand">
          <Logo size={28} />
          <div style={{ marginLeft: 10 }}>EventHub</div>
        </Link>
        <div className="nav-spacer" />
        <nav className="row" style={{ alignItems: 'center' }}>
          <a href="/">Home</a>
          {/* hide My Tickets for admin and organiser users */}
          {!(
            auth &&
            auth.user &&
            (auth.user.role === 'admin' || auth.user.role === 'organiser')
          ) && <a href="/tickets">My Tickets</a>}
          {/* admin-only events dashboard */}
          {auth && auth.user && auth.user.role === 'admin' && (
            <>
              <a href="/admin/events">Admin</a>
              <a href="/admin/orgs">Approvals</a>
              <a href="/admin/users">Users</a>
            </>
          )}
          {/* organiser-only club creation */}
          {auth && auth.user && auth.user.role === 'organiser' && (
            <>
              <a href="/organiser/events">Events</a>
              <a href="/organiser/orgs">Clubs</a>
              <a href="/organiser/checkin">Checkin</a>
            </>
          )}
          {!token ? <a href="/login">Login</a> : <a href="/logout">Logout</a>}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={
              theme === 'bright'
                ? 'Switch to dark theme'
                : 'Switch to bright theme'
            }
            className="btn ghost"
            style={{
              marginLeft: 8,
              padding: '6px 10px',
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {theme === 'bright' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.8 1.79L6.76 4.84zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.24-2.84l1.79 1.8 1.79-1.79-1.79-1.8-1.79 1.79zM20 11v2h3v-2h-3zM4.22 19.78l1.79-1.79-1.8-1.79L2.42 18l1.8 1.78zM12 6a6 6 0 100 12A6 6 0 0012 6z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
