import React, { createContext, useEffect, useState } from 'react';
import { me } from '@eventhub/api';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setAuth({ user: null, loading: false });
    me()
      .then((res) => setAuth({ user: res.user, loading: false }))
      .catch(() => setAuth({ user: null, loading: false }));
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
