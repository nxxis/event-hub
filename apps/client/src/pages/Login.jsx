import React, { useContext, useState } from 'react';
import { login } from '@eventhub/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const nav = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    login(form)
      .then(({ token, user }) => {
        localStorage.setItem('token', token);
        setAuth({ user, loading: false });
        nav('/');
      })
      .catch((e) => setErr(e?.response?.data?.message || 'Login failed'));
  };

  return (
    <div className="grid">
      <div className="col-8">
        <div className="card">
          <div className="h1">Welcome back</div>
          <div className="subtle">Sign in to RSVP and view your tickets.</div>
          <form
            className="stack mt-2"
            onSubmit={submit}
            style={{ maxWidth: 420 }}
          >
            <input
              className="input"
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="row">
              <button className="btn" type="submit">
                Sign in
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() =>
                  setForm({
                    email: 'student@demo.com',
                    password: 'Student123!',
                  })
                }
              >
                Fill demo creds
              </button>
            </div>
            {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
          </form>
        </div>
      </div>
      <div className="col-4">
        <div
          className="card"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <div className="brand" style={{ fontSize: 22 }}>
              <span className="brand-badge" /> EventHub
            </div>
            <div className="subtle mt-1">
              Campus events. Simple RSVPs. Fast check-ins.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
