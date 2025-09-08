import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Protected({ children }) {
  const { auth } = useContext(AuthContext);
  if (auth.loading) return <div className="card">Loading...</div>;
  if (!auth.user) return <Navigate to="/login" replace />;
  return children;
}
