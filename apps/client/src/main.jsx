import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ProgressBar from './components/ProgressBar';
import './styles/globals.css';
import AuthProvider from './context/AuthContext.jsx';
import ToastProvider from './components/Toast.jsx';

// Initialize theme from localStorage (persisted). Default to bright for vivid UI.
if (typeof document !== 'undefined' && document.documentElement) {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'dark') {
      document.documentElement.classList.remove('theme-bright');
    } else {
      // default to bright
      document.documentElement.classList.add('theme-bright');
    }
  } catch (e) {
    // localStorage may be unavailable in some environments — fall back to bright
    document.documentElement.classList.add('theme-bright');
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ProgressBar />
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

