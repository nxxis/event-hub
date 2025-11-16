import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/globals.css';
import AuthProvider from './context/AuthContext.jsx';
import ToastProvider from './components/Toast.jsx';

// Force bright theme immediately so the app appears with vivid accents while we iterate
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.classList.add('theme-bright');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

