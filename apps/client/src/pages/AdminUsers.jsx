import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminCreateUser } from '@eventhub/api';

export default function AdminUsers() {
  const { auth } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('organiser');
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setResult(null);
    try {
      const res = await adminCreateUser({ name, email, role });
      setResult(res);
      setName('');
      setEmail('');
      setRole('organiser');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create user');
    }
  };

  if (!auth || !auth.user || auth.user.role !== 'admin') return null;

  return (
    <div className="stack">
      <div className="card">
        <div className="h1">Admin — Create account</div>
        <div className="subtle">
          Create organiser or admin accounts and share credentials.
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={onSubmit}>
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="organiser">Organiser</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">
              Create account
            </button>
          </div>
        </form>
        {err && <div style={{ color: '#ffb4b4', marginTop: 8 }}>{err}</div>}
        {result && (
          <div style={{ marginTop: 12 }} className="card">
            <div className="h2">Account created</div>
            <div className="subtle">
              Send these credentials to the user securely.
            </div>
            <div style={{ marginTop: 8 }}>
              <div>
                <b>Email:</b> {result.user.email}
              </div>
              <div>
                <b>Password:</b> <code>{result.password}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
