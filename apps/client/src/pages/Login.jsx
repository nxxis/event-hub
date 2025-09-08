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
    <form
      className="card"
      onSubmit={submit}
      style={{ maxWidth: 480, margin: '2rem auto' }}
    >
      <h3>Login</h3>
      <input
        className="input"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <div style={{ height: 8 }} />
      <input
        className="input"
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <div style={{ height: 12 }} />
      <button className="btn" type="submit">
        Sign in
      </button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p style={{ marginTop: 12, color: 'var(--muted)' }}>
        Try: student@demo.com / Student123!
      </p>
    </form>
  );
}
