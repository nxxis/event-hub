import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import EventDetail from '../pages/EventDetail';
import Login from '../pages/Login';
import Logout from '../pages/Logout';
import Tickets from '../pages/Tickets';
import Protected from './Protected';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/tickets"
        element={
          <Protected>
            <Tickets />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
