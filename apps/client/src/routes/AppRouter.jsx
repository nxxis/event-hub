import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Page from '../components/Page';
import Home from '../pages/Home';
import EventDetail from '../pages/EventDetail';
import Login from '../pages/Login';
import Logout from '../pages/Logout';
import Tickets from '../pages/Tickets';
import AdminEvents from '../pages/AdminEvents';
import AdminUsers from '../pages/AdminUsers';
import AdminOrgs from '../pages/AdminOrgs';
import OrganiserOrgs from '../pages/OrganiserOrgs';
import OrganiserEvents from '../pages/OrganiserEvents';
import Checkin from '../pages/Checkin';
import Protected from './Protected';

export default function AppRouter() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Page>
              <Home />
            </Page>
          }
        />
        <Route
          path="/events/:id"
          element={
            <Page>
              <EventDetail />
            </Page>
          }
        />
        <Route
          path="/login"
          element={
            <Page>
              <Login />
            </Page>
          }
        />
        <Route
          path="/logout"
          element={
            <Page>
              <Logout />
            </Page>
          }
        />
        <Route
          path="/tickets"
          element={
            <Page>
              <Protected>
                <Tickets />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/admin/events"
          element={
            <Page>
              <Protected>
                <AdminEvents />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/admin/orgs"
          element={
            <Page>
              <Protected>
                <AdminOrgs />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Page>
              <Protected>
                <AdminUsers />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/organiser/orgs"
          element={
            <Page>
              <Protected>
                <OrganiserOrgs />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/organiser/events"
          element={
            <Page>
              <Protected>
                <OrganiserEvents />
              </Protected>
            </Page>
          }
        />
        <Route
          path="/organiser/checkin"
          element={
            <Page>
              <Protected>
                <Checkin />
              </Protected>
            </Page>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
