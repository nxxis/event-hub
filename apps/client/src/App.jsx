import React from 'react';
import AppRouter from './routes/AppRouter';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <AppRouter />
      </div>
    </>
  );
}
