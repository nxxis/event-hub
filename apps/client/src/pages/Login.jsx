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
      <div className="card card--login" style={{ maxWidth: 920, width: '95%' }}>
        <div className="login-left" style={{ flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 60, height: 60 }}>
                <img src="/logo192.png" alt="logo" style={{ width: '100%', height: '100%' }} onError={(e)=>{e.currentTarget.style.display='none'}} />
              </div>
              <div>
                <div className="brand" style={{ fontSize: 22 }}>
                  <span className="brand-badge" /> EventHub
                </div>
                <div className="subtle mt-1">Campus events. Simple RSVPs. Fast check-ins.</div>
              </div>
            </div>
            <div style={{ marginTop: 10, color: 'var(--muted)' }}>Join campus events, RSVP quickly and manage your tickets.</div>
          </div>
        </div>

        <div className="login-right" style={{ flex: 1 }}>
          <form className="stack" onSubmit={submit} style={{ width: '100%', maxWidth: 420 }}>
            <div className="h1">Welcome back</div>
            <div className="subtle">Sign in to RSVP and view your tickets.</div>

            <label htmlFor="login-email" className="sr-only">Email</label>
            <div className="mt-2">
              <input
                id="login-email"
                ref={emailRef}
                className="input"
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                aria-label="Email"
              />
            </div>

            <label htmlFor="login-password" className="sr-only">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-label="Password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--muted)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="row mt-2" style={{ alignItems: 'center' }}>
              <button className="btn" type="submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setForm({ email: 'student@demo.com', password: 'Student123!' });
                  setErr('');
                }}
                aria-label="Fill demo credentials"
                style={{ marginLeft: 8 }}
              >
                Fill demo creds
              </button>
            </div>

            {err && (
              <div role="alert" style={{ color: '#d9534f', marginTop: 8, fontWeight: 600 }}>
                {err}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
