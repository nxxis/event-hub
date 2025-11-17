import React, { useContext, useState, useRef, useEffect } from 'react';
import { login } from '@eventhub/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const nav = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(location?.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    login(form)
      .then(({ token, user }) => {
        localStorage.setItem('token', token);
        setAuth({ user, loading: false });
        // redirect back to where user came from, if provided
        const dest = location?.state?.from || '/';
        nav(dest);
      })
      .catch((e) => setErr(e?.response?.data?.message || 'Login failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // autofocus email input for convenience
    if (emailRef.current) emailRef.current.focus();
  }, []);

  return (
    <div className="center-page">
      <div className="login-card" style={{ maxWidth: 980, width: '96%' }}>
        <div className="login-panel">
          <div className="login-left-panel">
            <div className="auth-hero">
              <div className="brand-visual">
                <span className="brand-badge" />
                <div className="brand-title">EventHub</div>
              </div>
              <h3 className="auth-head">Campus events made simple</h3>
              <p className="auth-sub">Discover, RSVP and manage tickets — all in one place.</p>

              <svg className="auth-illus" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="400" height="260" rx="18" fill="url(#g1)" opacity="0.08" />
                <g transform="translate(28,36)">
                  <circle cx="36" cy="36" r="28" fill="#fff" opacity="0.9" />
                  <rect x="80" y="10" width="180" height="120" rx="10" fill="#fff" opacity="0.9" />
                  <path d="M14 120c30-26 60-30 92-18s80 40 126 10" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
                </g>
              </svg>
            </div>
          </div>

          <div className="login-right-panel">
            <form className="auth-form" onSubmit={submit}>
              <div className="auth-heading">
                <div className="h1">Welcome back</div>
                <div className="subtle">Sign in to RSVP and view your tickets.</div>
              </div>

              <label htmlFor="login-email" className="sr-only">Email</label>
              <input id="login-email" ref={emailRef} className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <label htmlFor="login-password" className="sr-only">Password</label>
              <div className="password-wrap">
                <input id="login-password" className="input" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pw-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>

              {err && <div role="alert" className="auth-error">{err}</div>}

              <div className="auth-actions">
                <button className="btn primary" type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
                  <span className="btn-label">{loading ? 'Signing in…' : 'Sign in'}</span>
                </button>
                <button className="btn ghost" type="button" onClick={() => { setForm({ email: 'student@demo.com', password: 'Student123!' }); setErr(''); }}>Fill demo creds</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
